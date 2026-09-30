# FOURTH CROWN — FCC-001 Build 11

Customer-facing restaurant frontend prototype for **FOURTH CROWN — The Taste of Ghana, Delivered.**

## Build 11 updates
- Removed the off-white background from the supplied FOURTH CROWN logo and created a transparent PNG.
- Removed the logo card from the landing-page hero.
- Navigation and footer now use the same transparent FOURTH CROWN logo.
- Browser title is `fourth-crown`.
- Added favicon, Apple touch icon, PWA manifest and service worker for add-to-home-screen support on supported HTTPS deployments.
- Added the supplied **Acheke.jpg** as a menu item and reused it in homepage food displays.
- Replaced the first service-carousel photo with a brighter full-color Black/African-American server/customer image.
- Preserved responsive desktop/mobile layouts and the existing customer ordering prototype.

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

A production build was not verified in this environment because dependency installation timed out, so run `npm install` and `npm run build` locally before deployment.

## Important
This remains a frontend prototype. Authentication, database, payments, delivery integration, server-side validation, audit logging and production security still need to be connected before launch.

## Build 12 additions
- 22-menu Ghanaian catalogue, including fufu, ampesi, waakye, banku & tilapia, kenkey, red red, kokonte, tuo zaafi, fried yam and more.
- Item customization is easier: customers can Quick Add or choose Customize & Add, with simple optional-extra controls.
- Restaurant control centre at `/admin` with plain-language menu, pricing, availability, order and restaurant-setting controls.
- Stripe Checkout session API at `/api/create-checkout-session.js` and payment verification at `/api/verify-checkout-session.js`.
- Add `STRIPE_SECRET_KEY` in Vercel before enabling live/test online card payments. The server-side API comments identify the remaining production hardening step: prices should be read from the database rather than trusted from the browser.
- Payment-success flow verifies the Stripe Checkout session before creating the local paid-order record.

## Food photography credits
The menu uses real Ghanaian food photographs sourced from Wikimedia Commons rather than generated/stock-looking placeholder food art. The image URLs are embedded directly in `src/main.jsx`.

Key sources include:
- Ghanaian Jollof Rice — Edithobayaa1, Wikimedia Commons, CC BY-SA 4.0.
- Waakye — Wikimedia Commons, Ghana food photograph.
- Gari Fotor — daSupremo, Wikimedia Commons, CC BY-SA 4.0.
- Braised rice — Otuo-Akyampong Boakye, Wikimedia Commons, CC BY-SA 4.0.
- Fufu & Light Soup — Bonnahjnr, Wikimedia Commons, CC BY-SA 4.0.
- Fufu & Groundnut Soup — Rberchie, Wikimedia Commons, CC BY-SA 4.0.
- Fufu & Palm Nut Soup — Perfect35, Wikimedia Commons, CC BY-SA 4.0.
- Ampesi — Sayhi2kojotutu, Wikimedia Commons, CC BY-SA 4.0.
- Banku & Grilled Tilapia — Flixtey, Wikimedia Commons, CC BY-SA 4.0.
- Kenkey — Edithobayaa1, Wikimedia Commons, CC BY-SA 4.0.
- Kelewele — Danieljatuat, Wikimedia Commons, CC BY-SA 4.0.
- Fried Yam & Shito — Kwameghana, Wikimedia Commons, CC BY-SA 4.0.
- Boiled Yam & Egg Stew — Edithobayaa1, Wikimedia Commons, CC BY-SA 4.0.
- Tuo Zaafi — Kwameghana, Wikimedia Commons, CC BY-SA 4.0.
- Ghanaian Fried Rice — Alvin Benjamin Owusu-Afriyie, Wikimedia Commons, CC BY-SA 4.0.
- Some newer Wikimedia Commons photographs used in the menu are released under CC0/public-domain dedication; see the individual Commons file pages for the applicable license.

The uploaded FOURTH CROWN Acheke photograph is user-provided and is kept locally at `public/images/acheke.jpg`.
