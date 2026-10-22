# Deployment

Cloudflare Pages project `non-dimensional-number-calculator`, connected to `shingyusik/non-dimensional-number-calculator`, production branch `main`.

Site files stay in the repository root. `sh build.sh` copies an allowlist of them into `dist/`: root `*.html`, `*.css`, `*.js`, `*.png`, `*.svg`, `*.ico`, the `*.html` files under `calculators/`, `en/` and `guides/`, and `_headers`, `_redirects`, `404.html`, `ads.txt`, `robots.txt`, `sitemap.xml`. Nothing else is published (`README.md`, `DEPLOY.md`, `build.sh`, `tests/`, `.git*`). Hidden files and directories are skipped, and a symlink in the published set stops the build. The output must be a plain directory name in the repository root (`dist` by default); empty names, absolute paths, names with `/` or `..`, names starting with `.`, source directories and tracked paths are refused before anything is deleted. A new kind of site file must be added to `build.sh`; `tests/check_site.py` fails until every repository file is either published or listed as a development file.

## Pages build settings

Settings → Builds & deployments → Build configuration:

| Field | Value |
|---|---|
| Framework preset | `None` |
| Build command | `sh build.sh` |
| Build output directory | `dist` |
| Root directory (advanced) | empty (repository root) |

The script needs only `sh`, `find`, `sed`, `sort`, `cp` and `mkdir` from the build image (v3 is Ubuntu-based; Cloudflare's own example runs `bash build.sh`).

Production and preview deployments share these build settings.

## Order of changes

1. **Do not change the settings before this change is on `main`.** With `sh build.sh` configured and no `build.sh` on `main`, the build exits non-zero and is marked failed. A failed build does not replace the current production deployment (inferred from Cloudflare's build documentation; not stated explicitly), but nothing new ships until it is fixed.
2. **Merge into `main`.** The old settings (no build command, output = repository root) keep deploying the root, so the site keeps working; `_headers` in the root is picked up as well, so the new headers ship at this step. `README.md` and `tests/` stay public until step 3.
3. **Change the settings** as in the table above, then Deployments → latest production deployment → ⋯ → Retry deployment (or push a commit to `main`). Settings apply from the next deployment. Cloudflare does not document whether Retry uses changed settings; if the build log does not show `sh build.sh`, push an empty commit to `main` instead.
4. **Check:**

   ```sh
   for path in /README.md /DEPLOY.md /build.sh /tests/check_site.py /nonexistent; do
     printf '%s %s\n' "$(curl -sS -o /dev/null -w '%{http_code}' "https://calctool.cc$path")" "$path"
   done   # expect 404 for each
   for path in / /about /contact /privacy /terms /calculators/reynolds /guides/ /en/guides/pipe-flow /ads.txt /robots.txt /sitemap.xml; do
     printf '%s %s\n' "$(curl -sS -o /dev/null -w '%{http_code}' "https://calctool.cc$path")" "$path"
   done   # expect 200 for each
   curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' https://calctool.cc/reynolds   # 301 .../calculators/reynolds
   curl -sSI https://calctool.cc/            # strict-transport-security, x-frame-options, permissions-policy, content-security-policy-report-only
   curl -sSI https://calctool.cc/nonexistent # 404 with the same headers
   ```

### Branches without build.sh

Once the settings change, preview builds of branches that split off before this change (for example `fix/shi-139-adsense-phase2`) fail because `build.sh` is missing. Merge `main` into such a branch to get the script, then push again. Production is not affected.

### Rollback

Set Build command to empty and Build output directory to `/`, then retry the latest production deployment. The root is served as before (including `README.md` and `tests/`). To drop the headers, delete `_headers` and deploy.

## Security headers (`_headers`)

All headers apply to `/*`. Cloudflare documents `_headers` as applying to static asset responses; it does not say explicitly whether the `404.html` response for a missing path gets them, so confirm on production with `curl -sSI https://calctool.cc/nonexistent`. They do not apply to Pages Functions responses (none in this project). Each line in `_headers` may be at most 2,000 characters, so the CSP stays on one line.

- `Strict-Transport-Security: max-age=31536000`, without `includeSubDomains` or `preload`: `www.calctool.cc` currently returns a 525 error, so HTTPS on subdomains cannot be confirmed. Add them only after every subdomain serves valid HTTPS.
- `X-Frame-Options: DENY` does the actual frame blocking. The CSP also has `frame-ancestors 'none'`, but it is report-only, so it is not enforced.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`, which disables features the site does not use. Ad and measurement features (`browsing-topics`, `attribution-reporting`, `join-ad-interest-group`, `run-ad-auction`) are left alone.
- `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`, the Pages defaults, now stated explicitly.
- `Content-Security-Policy-Report-Only`: observation only, nothing is blocked and no report endpoint is configured (violations appear in the browser console). Inline scripts and the inline `onclick` on the home page are allowed by sha256 hash (`'unsafe-hashes'` for the handler). Changing an inline script requires updating its hash; `python3 tests/check_site.py` fails and prints the new hash. Script hosts: `www.googletagmanager.com` (GA4), `pagead2.googlesyndication.com` (AdSense), `*.clarity.ms` (Clarity). AdSense documents its domains as changing and supports only nonce-based strict CSP, so this policy must not be switched to an enforced `Content-Security-Policy` without a separate design.
