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

Orders are submitted to `/api/orders`, persisted in Supabase, and notify the owner through Resend when the Vercel environment variables are configured. Browser `localStorage` remains a graceful local fallback.

## Production environment variables

Set these in Vercel:

```text
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
RESEND_API_KEY=<resend-key>
ORDER_EMAIL_TO=<owner-email>
ORDER_EMAIL_FROM=WISPAIR <orders@your-verified-domain.com>
```

Run `supabase/schema.sql` in the Supabase SQL editor before deploying.
