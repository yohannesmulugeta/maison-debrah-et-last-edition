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

1. Run `npm ci`, `npm run lint`, and `npm run build`. The build validates product content and runs the TypeScript build.
2. Confirm HTTPS, the `www` redirect, root-relative assets, catalogue data, hash-route navigation and the separate `/admin/` demo.
3. Check the custom domain after deployment, including `robots.txt`, `sitemap.xml`, the homepage canonical URL, menu, catalogue, cart and WhatsApp links.
4. Commits to the connected production branch trigger deployments; review the Cloudflare build result before treating an update as published.

A Cloudflare zone Single Redirect rule matches `http.host eq "www.maisondebrah-et.com"` and returns a 301 redirect to `concat("https://maisondebrah-et.com", http.request.uri.path)` with query-string preservation. This hostname redirect is configured in Cloudflare rather than a Pages `_redirects` file. Existing hash routes remain unchanged.

## Launch status

The owner approved search indexing for the custom-domain homepage. The GitHub Pages preview and browser-local admin demo remain unindexed. Hash routes are not suitable for reliable individual product indexing. Online forms are withheld until a delivery destination is provided and tested; WhatsApp is the current inquiry route. Business approval of contact details, product content, imagery rights and policy wording is still required before treating this as an official launch.

## Recovery and maintenance

- Use Cloudflare Pages deployment history to roll back to a previously verified production deployment when available. For the first deployment, fix or revert the source change and deploy again.
- Keep the source commit associated with each deployment. Use a normal Git revert rather than rewriting shared branch history.
- Maintain domain renewal, account recovery and agreed client access separately from source-code changes.
- If the repository is renamed later, review Cloudflare's source connection, local Git remotes, preview base paths and documentation before the next deployment.
