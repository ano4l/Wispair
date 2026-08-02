# Wispair Site - Local dev & Vercel deploy

This folder contains the static Wispair site, manual EFT checkout, and owner dashboard.

## Local preview

```bash
npm i -g vercel
cd wispair-site
vercel dev
```

## Production deploy

```bash
cd wispair-site
vercel --prod
```

## Owner dashboard

- Dashboard page: `owner.html` or `/owner` on Vercel
- Default owner PIN: `1410`
- Demo orders are seeded for Ruva when the browser has no existing `wispair-orders` data.

## Manual EFT checkout

The payment page displays:

- Bank: FNB
- Account number: 62793660103
- Branch code: 250655
- Personalized `WSP-...` reference generated per order

Orders are stored in browser `localStorage` for this static demo and appear in the owner dashboard for payment review.
