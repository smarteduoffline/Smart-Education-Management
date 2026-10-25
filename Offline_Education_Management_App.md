# Offline Education Management App

এটি একটি single-page, offline-first শিক্ষা ব্যবস্থাপনা PWA। মূল application code `index.html`-এর ভিতরে আছে। GitHub Pages-এ publish করলে HTTPS-এর মাধ্যমে app install করা যাবে এবং প্রথমবার online অবস্থায় খোলার পর app shell cache হয়ে offline-এও চলবে।

## GitHub upload

1. Repository-তে এই folder-এর সব file upload করুন। `index.html` repository root-এ থাকতে হবে।
2. GitHub-এর **Settings → Pages**-এ গিয়ে **Source: GitHub Actions** নির্বাচন করুন।
3. `main` branch-এ push করলে `.github/workflows/deploy-pages.yml` automatically deploy করবে।
4. Deployment শেষ হলে GitHub Pages URL খুলুন।
5. প্রথমবার online অবস্থায় app খুলে কিছুক্ষণ অপেক্ষা করুন। তারপর Android Chrome menu থেকে **Add to Home screen / Install app** দিন।

যদি repository project site হয়, app-এর URL সাধারণত:

```text
https://USERNAME.github.io/REPOSITORY-NAME/
```

Relative asset path ব্যবহার করা হয়েছে, তাই project site path-এও manifest, icons এবং service worker কাজ করবে।

## Online এবং offline behavior

অ্যাপের business data browser `localStorage`-এ রাখা হয়। Internet না থাকলেও students, attendance, fees, exams, reports, backup এবং local login ব্যবহার করা যাবে। Screen-এর online/offline indicator network state দেখায়।

Internet ফিরে এলে configured sync API থাকলে queued changes automatic retry হয়। Settings-এ backend API URL ও JWT token না দিলে অ্যাপ local-only offline mode-এ থাকবে। GitHub Pages নিজে Node.js API চালায় না; online multi-tenant sync-এর জন্য আলাদা HTTPS backend URL দিতে হবে।

## Required PWA files

`index.html`-এ application logic আছে, কিন্তু browser security অনুযায়ী Service Worker আলাদা `sw.js` file হিসেবে থাকতে হয়। `manifest.webmanifest` install metadata দেয় এবং `icons/` Android/PWA icon দেয়। এই তিনটি file বাদ দিলে GitHub Pages app install বা offline cache কাজ করবে না।

## Data safety

GitHub Pages-এ কোনো secret, JWT secret, Stripe key, bKash credential বা `.env` upload করবেন না। Browser local data backup-এর জন্য app-এর Settings থেকে normal বা encrypted backup নিন। ফোন বদলানোর আগে backup file export করুন।

## Backend configuration

Existing SaaS backend থাকলে Settings-এর online sync field-এ HTTPS API URL দিন। Backend-এ GitHub Pages origin allow করুন:

```env
CORS_ORIGIN=https://USERNAME.github.io
```

Project site হলে exact origin একই থাকে; repository path CORS origin-এ যোগ করতে হয় না। Backend এবং payment callback অবশ্যই HTTPS public domain-এ চালাতে হবে।

## Local test

Service Worker `file://` থেকে কাজ করবে না। Local test-এর জন্য:

```bash
python3 -m http.server 8080
```

তারপর খুলুন:

```text
http://localhost:8080/
```

Browser DevTools-এর Application → Service Workers এবং Cache Storage-এ cache status দেখা যাবে। Offline test-এর জন্য DevTools Network → Offline দিন, অথবা প্রথমবার load হওয়ার পরে network বন্ধ করে refresh করুন।
