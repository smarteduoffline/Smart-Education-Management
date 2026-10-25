# Smart Education Management App

এই repository একটি offline-first Progressive Web App। প্রধান application code `index.html`-এ আছে। GitHub Pages-এ deploy হলে online এবং offline—দুইভাবেই local data ব্যবহার করা যাবে।

## Upload structure

এই নাম ও অবস্থান অপরিবর্তিত রাখুন:

```text
index.html
sw.js
manifest.webmanifest
.nojekyll
icons/icon-192.png
icons/icon-512.png
.github/workflows/deploy-pages.yml
```

`index.html`, `sw.js` বা `manifest.webmanifest`-এর নামের সঙ্গে কোনো space, bracket বা number যোগ করবেন না।

## Deploy method A: GitHub Actions

1. Repository root-এ এই files upload করুন।
2. Settings → Pages → Source-এ `GitHub Actions` নির্বাচন করুন।
3. Actions tab-এ `Deploy Offline Education App` workflow খুলে সফল হওয়া পর্যন্ত অপেক্ষা করুন।
4. Pages URL খুলুন: `https://USERNAME.github.io/REPOSITORY-NAME/`।

## Deploy method B: Deploy from branch

যদি Actions ব্যবহার না করতে চান, Settings → Pages → Source-এ `Deploy from a branch`, branch `main`, folder `/ (root)` নির্বাচন করুন। এই পদ্ধতিতে root-এর `index.html` সরাসরি serve হবে।

## Offline mode

প্রথমবার app online অবস্থায় খুলুন, যাতে `sw.js` app shell cache করতে পারে। এরপর Chrome menu থেকে Add to Home screen/Install app দিন। Internet বন্ধ থাকলেও local students, attendance, fees, exams, reports এবং backups কাজ করবে।

## Online sync

GitHub Pages Node.js backend চালায় না। Settings পেইজে আলাদা HTTPS backend API URL দিলে online sync queue ব্যবহার করা যাবে। API URL খালি রাখলে app local-only offline mode-এ চলবে। Stripe secret, bKash credential, JWT secret বা `.env` কোনোভাবেই এই repository-তে রাখবেন না।

## Local test

```bash
python3 -m http.server 8080
```

তারপর `http://localhost:8080/` খুলুন। `file://` দিয়ে খুললে Service Worker কাজ করবে না।
