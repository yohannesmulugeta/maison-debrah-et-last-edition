# Maison Debrah Ethiopia — staging-reference React preview

A separate English-language React/Vite preview of [Maison Debrah's Dutch staging site](https://staging5.nl.maisondebrah.com/). The header, homepage sections, reference imagery, catalogue navigation and footer now follow the staging reference closely. The GitHub Pages preview is public, but it is not an approved franchise launch.

## Public draft preview

[View the Ethiopia draft](https://yohannesmulugeta.github.io/maison-debrah-et-last-edition/) after the Pages workflow finishes. The URL is a GitHub Pages preview, not a Maison Debrah-controlled domain.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite. Available routes include `/`, `/shop`, `/collection/<category>`, `/product/<product>`, `/cart`, `/checkout`, `/account`, `/about`, `/projects`, `/contact`, and the customer-service, brochure-request and design-consultation pages.

## Checks

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run validate:content
npm.cmd run build
```

## Product studio demonstration

[Open the admin demo](https://yohannesmulugeta.github.io/maison-debrah-et-last-edition/admin/) after the Pages workflow finishes. It shows nine existing products from the furniture, lighting and decoration collections. Visitors can search, filter, add a sample product, edit a product, choose a small local preview image, and remove a product with confirmation.

The demo has **no sign-in or database**. Changes are saved only in that browser's local storage, never in GitHub or on the public storefront. Use **Reset demo** to restore the original sample. Do not enter confidential information. This page is a visual and interaction preview for client review, not a live product management system.

The repository no longer contains Pages CMS configuration or links. The original 268 product records remain in `content/products`. `npm.cmd run validate:content` checks them and generates `public/data/products.json` for the public site; the generated file is not committed. The site continues to use those records until a secure admin backend is approved and connected.

## What is implemented

- Responsive English homepage using a full showroom entrance hero, three collection paths, eight featured products, catalogue banner, five chair cards, showroom/consultation panels, newsletter panel and five-column footer.
- Showroom gallery with 28 photographs, grouped by space on the existing `/projects` route. Optimized WebP copies live in `public/images/projects/`; the full-resolution JPG masters remain outside this repository.
- Reference-style desktop header with category dropdowns, product search, brochure, account and cart links; mobile menu; floating cart and language links.
- Searchable, categorized, paginated catalogue with the same 268 product records and 27 categories as the staging site. Desktop cards follow the staging shop order; public prices are currently hidden in favor of an inquiry flow.
- Product detail pages with the reference site's names, images, available summary text, category and related products. Product and collection names are unchanged. A browser-stored cart supports add, quantity, remove and persistence across refreshes.
- Local images for 693 product gallery entries, reused by filename from the user's earlier public Maison Debrah recreation. The remaining 159 entries still use the staging host and may be unavailable when that site is down.
- Clear loading, empty and error states. Forms, account access, checkout, payment and newsletter delivery are visible but not connected to a server; the preview does not submit orders or personal information.

## Remaining reference gaps

The desktop homepage, shop and a representative product page were compared directly with the staging site on 28 October 2026. The 268 product records retain existing images, source shop order and reference prices, but the public site does not display those prices. They are not approved Ethiopia selling prices. Policy and service page copy has not been matched page by page. Account, checkout and forms remain preview-only. Mobile layout was not part of that desktop alignment pass.

## Before this could launch

Maison Debrah must confirm the Ethiopia sitemap, wireframes, visual design, functions, staging build, and launch in writing under the supplied website agreement. The franchisee or brand also needs to provide:

- Approved Ethiopia business name, contact information, location, hours, languages, product availability, prices, delivery and returns rules, and local legal pages.
- Approved imagery and rights for all local use, plus final English brand copy and product specifications.
- Approved domain, hosting, source repository ownership, administrator and recovery access.
- Approved CRM or secure lead workflow, newsletter system, privacy notices, cookie consent, analytics, backups, monitoring, maintenance, and incident process.
- Express permission before adding account, basket, or checkout functions.

`index.html` includes `noindex, nofollow` for this draft. Remove that only at an approved launch. GitHub Pages uses hash routes such as `/#/product/orvella` so page refreshes work without server rewrites.

See [PLAN.md](PLAN.md) for the reference audit, delivery stages, and risks.
