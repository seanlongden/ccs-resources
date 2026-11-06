# CCS private resource preview

This is a separate review application. It reads the new curriculum under content/rebuild and the existing public logo. It does not import the production Next app, auth, Stripe, Google Sheets, Neon database or admin code. It reads no dotenv files. The server binds 127.0.0.1 only, rejects non-loopback Host values and exposes GET/HEAD only. Browser CSP blocks external connections, frames and forms.

Use Node 20 or newer (the local reviewed runtime was bundled Node 24.22.1).

```sh
cd /Users/seanlongden/Projects/ccs-resources-preview/preview
npm ci --ignore-scripts
npm start
```

Open http://127.0.0.1:4326/resources . This is local to Sean's computer. It is not hosted publicly and cannot be opened from a phone on a different device.

Tests, from this preview directory:

```sh
node --test tests/*.test.mjs
```

Rebuild the example and downloadable pack from the repository root:

```sh
node preview/build-example.mjs
python3 preview/build-pack.py
```

The production root dependency lock was already out of sync at the source baseline. The preview uses a separate package/lock and does not repair or change production dependencies.

This branch is not configured for deployment. No push was made because actual DigitalOcean triggers were not verified. Do not deploy it or merge it as a live release without the outstanding account, teaching, access and human walkthrough checks in docs/ccs-rebuild/QA.md.
