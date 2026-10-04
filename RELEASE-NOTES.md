# FOURTH CROWN FCC-001 — 0.3.0

## Candidate delivered 2026-10-03

Replaced the unreleased Supabase update with Neon PostgreSQL and same-origin Node APIs. Preserved the approved logo, Ghanaian catalogue, pickup/delivery design and admin-managed prices. Added first-admin setup, salted scrypt passwords, server-side sessions, authorization, origin checks, database-backed rate limits and audit records. Added kitchen item/address details, manual payment confirmation, photo URL editing, and minimum-order settings.

Added Stripe hosted Checkout with durable order creation and signed webhook confirmation; PayPal hosted approval with server capture; manual Zelle instructions/receipt verification. Restaurant accounts are separate from church accounts. Test mode is the default. Payment methods are unavailable until configured.

Added Install app button, native browser install prompt, Safari home-screen instructions and installed-mode detection. Private APIs/auth/payment routes are excluded from service-worker caching.

## Actual evidence

- `npm test`: 23 passed, 0 failed. Database/API tests use embedded PostgreSQL with the package's actual SQL, not a hosted Neon project.
- Tests cover catalogue saves, cross-session API order visibility, server totals, duplicate submissions, private tracking, role enforcement, login/logout, manual receipt confirmation, closed/sold-out/unpriced orders and cache exclusion.
- Stripe local signature tests cover invalid signatures, incorrect totals and idempotent matching events. No request to Stripe or PayPal and no real payment was made.
- `npm run build`: passed after final interface changes.
- Server/payment/webhook JavaScript syntax checks and `git diff --check`: passed.
- Graphical candidate testing: blocked by `net::ERR_BLOCKED_BY_CLIENT` opening localhost:3000 in the available browser.
- Same assistant performed implementation and review. Independent-agent QA was not performed.

## Not verified / pending

Hosted Neon setup, Vercel deployment, provider transactions, browser user flows and actual phone installation are not verified. No production repository merge/deployment was performed.

A dedicated Venmo SDK/button is pending. PayPal webhook/reconciliation/refund/dispute sync is pending. Partial Stripe refunds/disputes and self-service refunds are pending. Notification delivery, opening hours, exact delivery zones, monitoring/backup configuration and expanded staff controls remain launch work.

PayPal capture may require provider-dashboard reconciliation if the capture response is lost after the provider captured funds. Do not retry a payment blindly; verify first. Stripe expired checkout recovery requires additional session lifecycle handling. Admin must reconcile cancelled-but-paid orders and issue appropriate refunds in the provider dashboard.

## Release recommendation

Use this ZIP for local setup and sandbox testing. Complete SETUP.md's verification checklist before public launch. Keep live payments disabled until test evidence is complete. Rollback by restoring the previous source revision; never reset restaurant data as a rollback mechanism.
