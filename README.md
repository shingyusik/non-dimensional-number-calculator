# Dimensionless Number Calculator

Static bilingual calculator and worked guides served at https://calctool.cc.

## Content

- `index.html`: home page with the ten calculators grouped by field (flow, heat transfer, mass transfer, interfaces, gases). Legacy `/#name` links still open the calculator in a modal.
- `calculators/`, `en/calculators/`: one page per calculator with formula, SI units, unit pitfalls and result interpretation.
- `guides/`, `en/guides/`: guide listings (`index.html`), basic guides per number, pipe-flow cross-checks, scale-model comparisons and four theory chapters.
- `about.html`, `contact.html`, `privacy.html`, `terms.html` (Korean) and their `en/` versions; `404.html` (noindex, no AdSense).
- `calculators.js`: calculator formulas shared by the home modal and calculator pages. `script.js`: home page language and modal. `calculator-page.js`: calculator pages. `guide.js`: language and theme controls on all other pages.
- `_redirects`: `/reynolds` etc. → `/calculators/<name>` (301).

The Korean basic guides (`guides/<name>.html`) are `noindex, follow` until they pass 1,000 characters; the list lives in `NOINDEX_THIN` in `tests/check_site.py`.

Worked inputs are illustrative, not measured datasets or certified property tables. Each notebook identifies its assumptions, intermediate results, limitations and references.

## Validation

```sh
python3 tests/check_site.py
node tests/check_calculations.cjs
git diff --check
```

Checks cover local links, lang/canonical/hreflang, analytics and ad tags, footers, unique titles and descriptions, sitemap entries (final URLs, minimum body length, no noindex pages), redirects, the privacy disclosures and numerical examples using shipped formulas. Desktop/mobile layout requires browser verification.

## Deployment

Cloudflare Pages project: `non-dimensional-number-calculator`.
Connected repository: `shingyusik/non-dimensional-number-calculator`.
Production branch: `main`; automatic deployments are enabled.

Pushes to `main` publish the static site. Verify the resulting commit in Cloudflare and the custom domain before requesting AdSense review. An accepted review request is distinct from AdSense approval.
