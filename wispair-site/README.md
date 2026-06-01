# Wispair Site — Local dev & Vercel deploy

This folder contains the static Wispair site and a mock payment gateway for local testing.

Quick start (local preview with Vercel CLI):

```bash
# install vercel CLI if needed
npm i -g vercel

# run local dev server from this folder
cd wispair-site
vercel dev
```

Deploy to Vercel (one-off):

```bash
cd wispair-site
vercel --prod
```

Force push to the provided GitHub repository (WARNING: this rewrites history):

```bash
# from the repository root
git remote add target https://github.com/VKTClients/Wispair.git
# Verify the remote is correct, then force push (OVERWRITE remote history)
git push --force target main
```

Notes:
- The mock payment page is `payment.html`. It simulates a payment and on success returns to the site, copies the order message to clipboard, and opens Instagram.
- Vercel will serve the static files directly. The `package.json` includes convenience scripts but is optional.
