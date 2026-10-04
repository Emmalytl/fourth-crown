# FOURTH CROWN — Neon + Vercel + PWA

Full Atlanta Ghanaian pickup/delivery restaurant source package. **Read SETUP.md first.**

React 19/Vite frontend, server-only Neon PostgreSQL, hashed-password admin authentication, shared catalogue/orders, server pricing and audit records. Stripe hosted Checkout + signed webhook, PayPal approval/server capture, manual Zelle verification. Dedicated Venmo UX and PayPal reconciliation remain pending.

PWA Install app button and Safari home-screen guidance included. Restaurant payment credentials and database remain separate from Ezracash. Supabase is not used.

```
npm ci
# Configure .env from .env.example
npm run db:setup
npm run admin:create
npm run dev
```

Open http://localhost:3000; administrator login at /admin.

```
npm test
npm run build
```

See RELEASE-NOTES.md for evidence and remaining verification. No secrets, node_modules or generated build files are shipped.
