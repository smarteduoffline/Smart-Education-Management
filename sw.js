const CACHE_NAME = "smart-edu-shell-v1";
const RUNTIME_CACHE = "smart-edu-runtime-v1";
const SYNC_DB = "smartEduSW";
const SYNC_STORE = "jobs";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => ![CACHE_NAME, RUNTIME_CACHE].includes(key))
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation: cached app first, then network, then cached index fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        db.createObjectStore(SYNC_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getJob() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_STORE, "readonly");
    const request = tx.objectStore(SYNC_STORE).get("current");
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function deleteJob() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_STORE, "readwrite");
    tx.objectStore(SYNC_STORE).delete("current");
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

async function backgroundSync() {
  const job = await getJob();
  if (!job || !job.url || !job.payload) return;

  const headers = { "Content-Type": "application/json" };
  if (job.jwt) headers.Authorization = `Bearer ${job.jwt}`;
  else if (job.apiKey) headers["x-api-key"] = job.apiKey;

  const response = await fetch(job.url, {
    method: "POST",
    headers,
    body: JSON.stringify(job.payload),
    cache: "no-store"
  });

  if (!response.ok) throw new Error(`sync HTTP ${response.status}`);
  await response.json().catch(() => ({}));
  await deleteJob();

  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clients.forEach(client => client.postMessage({ type: "SYNC_COMPLETE" }));
}

self.addEventListener("sync", event => {
  if (event.tag === "smart-edu-sync") {
    event.waitUntil(backgroundSync());
  }
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "BACKGROUND_SYNC") {
    event.waitUntil?.(backgroundSync());
  }
});
