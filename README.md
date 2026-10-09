# Dimensionless Number Calculator

Static bilingual calculator and worked guides served at https://calctool.cc.

## Content

- `index.html`: ten calculators and the learning library.
- `guides/`, `en/guides/`: Korean and English explanations, pipe-flow cross-checks and scale-model comparisons.
- `script.js`: calculator formulas, language selection and homepage calculator fragments.
- `guide.js`: guide language and theme controls.

Worked inputs are illustrative, not measured datasets or certified property tables. Each notebook identifies its assumptions, intermediate results, limitations and references.

## Validation

```sh
python3 tests/check_site.py
node tests/check_calculations.cjs
git diff --check
```

Checks cover local links, calculator fragments, bilingual canonical URLs, sitemap entries and numerical examples using shipped formulas. Desktop/mobile layout requires browser verification.

## Deployment

Cloudflare Pages project: `non-dimensional-number-calculator`.
Connected repository: `shingyusik/non-dimensional-number-calculator`.
Production branch: `main`; automatic deployments are enabled.

Pushes to `main` publish the static site. Verify the resulting commit in Cloudflare and the custom domain before requesting AdSense review. An accepted review request is distinct from AdSense approval.
