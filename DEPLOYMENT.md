# Cloudflare deployment

The repository name remains `maison-debrah-et-last-edition`.

## Production hosting configuration

| Setting | Value |
| --- | --- |
| Cloudflare Pages project | `maisondebrah-et-production` |
| Source | `yohannesmulugeta/maison-debrah-et-last-edition` |
| Production branch | `main` |
| Root directory | Repository root |
| Node.js | `24` (also pinned in `.node-version`) |
| Build command | `npm run build` |
| Build output | `dist` |
| Main domain | `maisondebrah-et.com` |
| Alternate domain | `www.maisondebrah-et.com`, redirected to the main domain |

Use `npm run build` for Cloudflare. `npm run build:pages` is reserved for the existing GitHub Pages project preview because it prefixes assets with the repository path. Do not use that command for the custom domain.

The existing Cloudflare Pages project `maisondebrah-et` uses the older `Maisondebrah-et` repository. Keep it separate from this deployment.

## Publishing and verification

1. Run `npm ci`, `npm run test`, `npm run lint`, and `npm run build`. The build validates product content and runs the TypeScript build.
2. Verify the deployment at the project’s `pages.dev` address before attaching the custom domains.
3. Add both domains through Pages Custom domains and verify their DNS records and certificate status.
4. Confirm HTTPS, the `www` redirect, root-relative assets, catalogue data, hash-route navigation and the separate `/admin/` demo.
5. Commits to the connected production branch trigger deployments; review the Cloudflare build result before treating an update as published.

If Pages reports that this project is disconnected from GitHub, restore the existing GitHub app's access to `yohannesmulugeta/maison-debrah-et-last-edition` and push a new commit. A GitHub Pages deployment does not update the Cloudflare custom domain.

## Inquiry service

The custom domain's Pages Function at `/api/inquiries` stores inquiries in D1 and calls the private `maison-debrah-inquiry-mailer` Worker through a Service binding. The Worker sends alerts through Cloudflare Email Service only to the verified contact and sales destinations. The GitHub Pages preview continues to use email drafts. The existing Hostinger MX records remain in place.

Cloudflare Pages requires these production and preview bindings and secrets:

| Name | Type | Purpose |
| --- | --- | --- |
| `INQUIRIES_DB` | D1 binding | `maison-debrah-inquiries` in production; `maison-debrah-inquiries-preview` in preview |
| `TURNSTILE_SECRET` | Secret | Server verification for the website's Turnstile widget |
| `MAILER` | Service binding | `maison-debrah-inquiry-mailer` Worker in both environments |

Apply `migrations/0001_inquiries.sql` to each database before deploying the function. Deploy `workers/inquiry-mailer.js` using `workers/wrangler.jsonc`, keep its public `workers.dev` route disabled, and bind it as `MAILER` on the Pages project. Never put the Turnstile secret in Git or browser code. The Worker can send only from `website@maisondebrah-et.com` to the two verified destinations. General inquiries go to `contact@maisondebrah-et.com`; catalogue, consultation, and product inquiries go to `sales@maisondebrah-et.com`.

After deployment, submit a labeled test inquiry from desktop and phone. Confirm the page shows a reference, the corresponding D1 row has `notification_status = 'sent'`, and the intended Hostinger inbox receives the alert. If an alert fails, the saved row is marked `failed` and the page says the alert is delayed. Review those rows in Cloudflare D1 and contact the visitor using their stored email or phone; there is no automatic retry queue yet. A 503 response means the visitor must use the direct email or WhatsApp link.

A Cloudflare zone Single Redirect rule matches `http.host eq "www.maisondebrah-et.com"` and returns a 301 redirect to `concat("https://maisondebrah-et.com", http.request.uri.path)` with query-string preservation. This hostname redirect is configured in Cloudflare rather than a Pages `_redirects` file. Existing hash routes remain unchanged.

## Draft status

Connecting hosting and a domain does not approve the official franchise launch. Keep `noindex, nofollow` in both HTML entry points during review. The admin remains a browser-local demo. The inquiry service is separate from account, checkout, payment, and any future ERP work described in `README.md`.

## Recovery and maintenance

- Use Cloudflare Pages deployment history to roll back to a previously verified production deployment when available. For the first deployment, fix or revert the source change and deploy again.
- Keep the source commit associated with each deployment. Use a normal Git revert rather than rewriting shared branch history.
- Maintain domain renewal, account recovery and agreed client access separately from source-code changes.
- If the repository is renamed later, review Cloudflare’s source connection, local Git remotes, preview base paths and documentation before the next deployment.
