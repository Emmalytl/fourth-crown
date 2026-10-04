# FOURTH CROWN — start here

React/Vite + Node APIs + Neon PostgreSQL. Use Node 22 LTS or newer. Use a dedicated restaurant database and separate restaurant payment accounts. No credentials are included.

## Local setup on Windows / Laragon

Extract the folder containing package.json to `C:\laragon\www\fourth-crown`. Open a terminal there:

```
npm ci
```

Copy `.env.example` to `.env`. Set DATABASE_URL to your Fourth Crown Neon connection string (SSL required). Set APP_URL=http://localhost:3000. Never share or commit .env.

```
npm run db:setup
```

Alternatively run database/schema.sql, then database/seed.sql in Neon SQL Editor. Use a dedicated Fourth Crown database; this is not a migration for Ezracash. Setup is additive/repeatable and preserves existing prices and orders.

Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in local .env:

```
npm run admin:create
```

Remove ADMIN_PASSWORD from .env afterward. Existing administrator accounts/passwords are preserved, not reset.

```
npm run dev
```

Landing page: http://localhost:3000. Admin: http://localhost:3000/admin. Use `npm run dev` for full API functionality; `npm run dev:ui` is frontend-only. Laragon PHP/Apache alone cannot run these Node APIs.

## Restaurant controls

Set real dish/extra prices, pickup address, delivery fee and tax in admin, then save. Prices start unset; accepting orders starts OFF. Configure applicable tax and operating details before enabling ordering. The server calculates totals from the database.

Orders and payment status are separate. A pay-later or Zelle order is unpaid until receipt is verified. Admin can confirm manual payment with a bank/cash receipt reference, which creates an audit record. Never confirm solely from a customer screenshot.

## GitHub Desktop and Vercel

Copy the source files into your Fourth Crown GitHub Desktop repository folder, excluding node_modules, dist and .env. Commit/push yourself. In Vercel import the repository; choose Vite, `npm run build`, output `dist`. The root is the folder containing package.json.

Set DATABASE_URL and APP_URL=https://YOUR-FOURTH-CROWN-DOMAIN in Vercel server environment variables. APP_URL must exactly match the origin; use matching preview values and a test Neon branch for previews. Do not add ADMIN_PASSWORD to Vercel. Redeploy after changing environment variables.

Database/password/payment credentials never have a VITE_ prefix. Auth uses HttpOnly, SameSite Strict cookies, Secure on production HTTPS. Database access happens through `/api/app`.

## Restaurant payments: test first

Keep PAYMENTS_LIVE_ENABLED=false. No payment credentials ship in this ZIP. Real banking activation/merchant approval is your responsibility.

### Stripe

Add the restaurant STRIPE_SECRET_KEY (test key) and STRIPE_WEBHOOK_SECRET. Create `https://YOUR-DOMAIN/api/stripe-webhook` with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`.

Hosted Checkout presents eligible cards/wallets according to the restaurant Stripe configuration and customer's device. Enable desired methods in Stripe; Apple Pay, Google Pay and Cash App Pay are not guaranteed for every buyer. The signed webhook checks stored order amount/currency and deduplicates events. Returning to the website alone does not mark an order paid. Full Stripe refunds update via webhook; partial refunds/disputes require further accounting work.

### PayPal

Set PAYPAL_MODE=sandbox, restaurant sandbox PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET. The customer approves on PayPal and returns; server capture checks status, amount and currency before marking paid. PayPal determines eligible wallets. A dedicated Venmo button/SDK integration is not included.

Interrupted approvals can be resumed from My Orders / Continue payment. PayPal webhook/reconciliation and refund/dispute sync are not included yet: reconcile in the provider dashboard. Approval alone is not paid.

### Zelle

Set ZELLE_RECIPIENT to the enrolled business email/phone. Customers pay in their own bank app, using the saved order ID as reference. Admin verifies actual bank receipt. This is manual, without an automatic Zelle API or bank login.

### Later live activation

Only after successful provider testing, explicitly set PAYMENTS_LIVE_ENABLED=true with live restaurant credentials and PAYPAL_MODE=live, create the matching live Stripe webhook secret, and redeploy. Use separate test/live database environments. Never mix church credentials or payouts with restaurant accounts. No real charges were made while preparing this ZIP.

## PWA installation

On deployed HTTPS Chrome/Edge, click Install app and confirm the browser prompt. On iPhone/iPad open Safari → Share → Add to Home Screen → Add. Missing native prompts show instructions. Installed mode hides the install button. The app uses the approved restaurant logo/icons and standalone display; this is a PWA, not an App Store APK.

Only public app assets are cached. Admin, checkout, payment and APIs remain online. Offline mode cannot submit orders or payments.

## Verification before public launch

```
npm test
npm run build
```

Test using two devices: admin price/availability updates, pickup/delivery orders arriving in admin, role boundaries, order status, payment success/cancel/retry, full Stripe refund, manual Zelle confirmation, PWA installation. Verify exact pickup address, delivery zones and tax. Use test accounts/cards only.

Production gaps: hosted Neon/Vercel/provider verification, Venmo-specific UX, PayPal webhook reconciliation, partial refunds/disputes, notifications, precise delivery zones/hours, staff workflows, monitoring, backups and anti-abuse tuning. Rate limits cover login/orders/tracking/payments. Periodically remove expired sessions and old request_limits records. This is a setup/test candidate, not a certified production launch.
