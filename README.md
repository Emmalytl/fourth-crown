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
