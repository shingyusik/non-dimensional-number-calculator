# Dimensionless Number Calculator

Static bilingual calculator and worked guides served at https://calctool.cc.

## Content

- `index.html`: home page with the ten calculators grouped by field (flow, heat transfer, mass transfer, interfaces, gases). Legacy `/#name` links still open the calculator in a modal.
- `calculators/`, `en/calculators/`: one page per calculator with formula, SI units, unit pitfalls and result interpretation.
- `guides/`, `en/guides/`: guide listings (`index.html`), basic guides per number, pipe-flow cross-checks, scale-model comparisons and four theory chapters.
- `about.html`, `contact.html`, `privacy.html`, `terms.html` (Korean) and their `en/` versions; `404.html` (noindex, no AdSense).
- `calculators.js`: calculator formulas shared by the home modal and calculator pages. `script.js`: home page language and modal. `calculator-page.js`: calculator pages. `guide.js`: language and theme controls on all other pages.
- `_redirects`: `/reynolds` etc. → `/calculators/<name>` (301).

Only `404.html` is `noindex`; every other page is in the sitemap.

Body pages (basic guides, calculation notes and calculator pages) mark examples as `<section class="example">`, FAQs as `<details>` inside `<section class="faq">`, and references as external links inside `<section class="sources">`. Example inputs are either property values from the cited references (with their conditions) or operating conditions labelled as assumptions on the page. `tests/examples/*.cjs` recompute every published result and check that the rounded value appears on both language versions.

## Build

```sh
sh build.sh    # copies the allowlisted site files to dist/ (git-ignored)
```

Only `dist/` is deployed; see [DEPLOY.md](DEPLOY.md) for the allowlist, the Cloudflare Pages settings and the security headers in `_headers`.

## Validation

```sh
python3 tests/check_site.py
node tests/check_calculations.cjs
git diff --check
```

`python3 tests/check_sources.py` opens every reference link (network required; run manually).

Checks cover local links, lang/canonical/hreflang, analytics and ad tags, footers, unique titles and descriptions, sitemap entries (final URLs, at least 1,500 characters of body text, no noindex pages), examples/FAQs/references per body page, repeated headings and sentences, redirects, the privacy disclosures and numerical examples using shipped formulas. Desktop/mobile layout requires browser verification.

`tests/check_site.py` runs `build.sh` into a temporary directory and checks that output: deterministic, every site file present, no development files, that unsafe output names, hidden files, symlinks and `find` failures make `build.sh` fail, and the `_headers` values (HSTS, frame denial, report-only CSP covering every inline script hash and external script host).

## Deployment

Cloudflare Pages project: `non-dimensional-number-calculator`.
Connected repository: `shingyusik/non-dimensional-number-calculator`.
Production branch: `main`; automatic deployments are enabled.
Build command `sh build.sh`, build output directory `dist`, root directory empty; change order, checks and rollback are in [DEPLOY.md](DEPLOY.md).

Pushes to `main` publish the static site. Verify the resulting commit in Cloudflare and the custom domain before requesting AdSense review. An accepted review request is distinct from AdSense approval.
