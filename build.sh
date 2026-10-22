#!/bin/sh
# Copy the deployable site into an output directory (default: dist).
# Usage: sh build.sh [OUT]   (a relative OUT is resolved from the repository root)
# Allowlist: only the patterns below are published. A new file type stays out
# until it is added here; tests/check_site.py fails on files nobody classified.
set -eu
cd "$(dirname "$0")"

OUT=${1:-dist}
case "$OUT" in
  '' | . | ./ | / | .. | ../) echo "build.sh: refusing output directory '$OUT'" >&2; exit 1 ;;
esac

SPECIAL='_headers _redirects 404.html ads.txt robots.txt sitemap.xml'
DIRS='calculators en guides'

rm -rf "$OUT"
mkdir -p "$OUT"

for file in $SPECIAL; do
  cp "$file" "$OUT/$file"
done

{
  find . -maxdepth 1 -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \
    -o -name '*.png' -o -name '*.svg' -o -name '*.ico' \)
  find $DIRS -type f -name '*.html'
} | sed 's|^\./||' | LC_ALL=C sort | while IFS= read -r file; do
  mkdir -p "$OUT/$(dirname "$file")"
  cp "$file" "$OUT/$file"
done
