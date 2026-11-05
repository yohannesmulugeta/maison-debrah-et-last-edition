# Maison Debrah Ethiopia — showroom website

A React/Vite showroom and inquiry catalogue adapted from [Maison Debrah's Dutch staging site](https://staging5.nl.maisondebrah.com/). The custom domain runs on Cloudflare Pages with `npm.cmd run build`; the GitHub Pages URL is a separate preview built with `npm.cmd run build:pages`. Both publish from `main`, so a push to that branch updates the public site.

## Public draft preview

[View the GitHub Pages preview](https://yohannesmulugeta.github.io/maison-debrah-et-last-edition/) after the Pages workflow finishes. The [custom domain](https://maisondebrah-et.com/) is served separately by Cloudflare Pages.

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

- Responsive English homepage using a full showroom entrance hero, three collection paths, eight featured products, catalogue banner, five chair cards, showroom/consultation panels and five-column footer.
- Showroom gallery with 28 photographs, grouped by space on the existing `/projects` route. Optimized WebP copies live in `public/images/projects/`; the full-resolution JPG masters remain outside this repository.
- Reference-style desktop header with category dropdowns, product search, brochure, contact and cart links, plus a mobile menu. Floating controls are hidden on phones to keep content and product actions clear.
- Searchable, categorized, paginated catalogue with the same 268 product records and 27 categories as the staging site. Desktop cards follow the staging shop order; public prices are currently hidden in favor of an inquiry flow.
- Product detail pages with the reference site's names, images, available summary text, category and related products. Product and collection names are unchanged. A browser-stored cart supports add, quantity, remove and persistence across refreshes.
- Local images for 693 product gallery entries, reused by filename from the user's earlier public Maison Debrah recreation. The remaining 159 entries still use the staging host and may be unavailable when that site is down.
- Clear loading, empty and error states. Contact, catalogue and consultation requests open WhatsApp; the inquiry cart also prepares a WhatsApp message. The visitor must tap Send in WhatsApp. There is no online form delivery, account access, payment or completed checkout.

## Remaining reference gaps

The desktop homepage, shop and a representative product page were compared directly with the staging site on 28 October 2026. The 268 product records retain existing images, source shop order and reference prices, but the public site does not display those prices. They are not approved Ethiopia selling prices. Policy and service wording still needs business review. The mobile catalogue and product templates were corrected and checked in Chromium and WebKit in November 2026; real-device acceptance remains open.

## Before this could launch

Maison Debrah must confirm the Ethiopia sitemap, wireframes, visual design, functions, staging build, and launch in writing under the supplied website agreement. The franchisee or brand also needs to provide:

- Approved Ethiopia business name, contact information, location, hours, languages, product availability, prices, delivery and returns rules, and local legal pages.
- Approved imagery and rights for all local use, plus final English brand copy and product specifications.
- Approved domain, hosting, source repository ownership, administrator and recovery access.
- An approved delivery destination and secure lead workflow before restoring online forms, plus review of privacy notices, analytics needs, backups, monitoring, maintenance and incident handling.
- Express permission before enabling account access, transactional checkout or payments.

The custom-domain homepage permits search indexing and has a canonical URL, robots file and homepage sitemap. The GitHub Pages preview and demo admin remain unindexed. Navigation still uses hash routes such as `/#/product/orvella`; these are not suitable for reliable individual product indexing. Product-level search visibility requires a separate routing and rendering change.

See [PLAN.md](PLAN.md) for the reference audit, delivery stages, and risks.
