#!/bin/sh
# Copy the deployable site into an output directory (default: dist).
# Usage: sh build.sh [OUT]   OUT is a plain directory name in the repository
# root: letters, digits, '.', '_' and '-' only, not starting with '.'.
# Allowlist: only the patterns below are published. A new file type stays out
# until it is added here; tests/check_site.py fails on files nobody classified.
# Hidden files and directories are never published, and a symlink anywhere in
# the published set stops the build.
#
# POSIX sh (Cloudflare runs dash as sh). dash has no reliable 'pipefail', so
# no step whose failure matters runs inside a pipeline: every find and sort
# runs in a command substitution, whose exit status 'set -e' checks.
set -eu
cd "$(dirname "$0")"

fail() {
  echo "build.sh: $*" >&2
  exit 1
}

OUT=${1-dist}
SPECIAL='_headers _redirects 404.html ads.txt robots.txt sitemap.xml'
DIRS='calculators en guides'

case "$OUT" in
  '' | .* | */* | *..* | *[!A-Za-z0-9._-]*)
    fail "refusing output directory '$OUT' (use a plain name such as dist)" ;;
esac
for name in $DIRS tests; do
  [ "$OUT" != "$name" ] || fail "refusing output directory '$OUT': it holds source files"
done
if [ -e "$OUT" ] || [ -L "$OUT" ]; then
  [ -d "$OUT" ] && [ ! -L "$OUT" ] || fail "refusing output '$OUT': it exists and is not a plain directory"
  if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    tracked=$(git ls-files -- "$OUT")
    [ -z "$tracked" ] || fail "refusing output directory '$OUT': it holds tracked files"
  fi
fi

# Check everything before deleting the old output.
for file in $SPECIAL; do
  [ ! -L "$file" ] || fail "refusing symlink '$file'"
  [ -f "$file" ] || fail "missing special file '$file'"
done
for dir in $DIRS; do
  [ ! -L "$dir" ] || fail "refusing symlinked directory '$dir'"
  [ -d "$dir" ] || fail "missing directory '$dir'"
done

ROOT_MATCH='( -name *.html -o -name *.css -o -name *.js -o -name *.png -o -name *.svg -o -name *.ico )'
set -f  # keep the patterns above from being expanded by the shell
links=$(find . -mindepth 1 -maxdepth 1 ! -name '.*' -type l $ROOT_MATCH)
links=$links$(find $DIRS -name '.*' -prune -o -type l -print)
root_files=$(find . -mindepth 1 -maxdepth 1 ! -name '.*' -type f $ROOT_MATCH)
dir_files=$(find $DIRS -name '.*' -prune -o -type f -name '*.html' -print)
set +f
[ -z "$links" ] || fail "refusing symlinks in the published set:
$links"
files=$(printf '%s\n%s\n' "$root_files" "$dir_files" | LC_ALL=C sort)

rm -rf "$OUT"
mkdir "$OUT"

for file in $SPECIAL; do
  cp "$file" "$OUT/$file"
done

while IFS= read -r file; do
  [ -n "$file" ] || continue
  file=${file#./}
  mkdir -p "$OUT/$(dirname "$file")"
  cp "$file" "$OUT/$file"
done <<LIST
$files
LIST
