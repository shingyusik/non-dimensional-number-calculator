"""Run with python3 tests/check_site.py. Copies the repository files into a
temporary directory, builds the site there with build.sh and checks that output,
i.e. what Cloudflare Pages serves. It also checks that build.sh refuses unsafe
output names, hidden files and symlinks."""
from difflib import SequenceMatcher
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import atexit
import base64
import hashlib
import re
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET

REPO = Path(__file__).resolve().parents[1]
WORK = Path(tempfile.mkdtemp(prefix='calctool-build-'))
atexit.register(shutil.rmtree, WORK, ignore_errors=True)
SRC = WORK / 'src'
ROOT = SRC / 'dist'
SITE = 'https://calctool.cc'
GA4_ID = 'G-4L6KGPWDN7'
ADSENSE = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9649208039336516'
CLARITY = 'clarity.ms/tag/'
ISSUES = 'https://github.com/shingyusik/non-dimensional-number-calculator/issues'
MIN_BODY = 1500
calculators = ['reynolds', 'mach', 'nusselt', 'prandtl', 'schmidt', 'peclet', 'strouhal', 'froude', 'weber', 'knudsen']

CLARITY_PAGES = {'index.html', 'privacy.html', 'terms.html'}
FOOTER = {
    'ko': ['/about', '/contact', '/privacy', '/terms'],
    'en': ['/en/about', '/en/contact', '/en/privacy', '/en/terms'],
}
TOPIC_WORDS = [
    '레이놀즈', '마하', '누셀트', '프란틀', '슈미트', '페클레', '스트로할', '프루드', '웨버', '누센',
    'Reynolds', 'Mach', 'Nusselt', 'Prandtl', 'Schmidt', 'Péclet', 'Peclet', 'Strouhal', 'Froude', 'Weber', 'Knudsen',
]


class Page(HTMLParser):
    SKIP = {'nav', 'script', 'style', 'header', 'footer'}
    VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'wbr'}
    BLOCK = {'p', 'li', 'h1', 'h2', 'h3', 'h4', 'td', 'th', 'caption', 'summary', 'div', 'section', 'tr', 'details', 'br', 'figcaption', 'dd', 'dt'}

    def __init__(self, text):
        super().__init__()
        self.links, self.ids, self.canonical, self.lang = [], set(), None, None
        self.alternates, self.meta, self.title = {}, {}, ''
        self.footer_links, self.body = [], []
        # Content structure: example sections, FAQ items, reference links, h2 texts
        # and the text used for the repeated-sentence check.
        self.examples = self.faqs = 0
        self.source_links, self.h2, self._sentence_text = set(), [], []
        self.script_srcs, self.scripts, self.handlers = [], [], []
        self._main = self._skip = self._footer = 0
        self._in_title = self._in_script = False
        self._open, self._h2 = [], None
        self.feed(text)
        self.body_chars = len(re.sub(r'\s', '', ''.join(self.body)))

    def _inside(self, cls):
        return any(cls in classes for _, classes in self._open)

    def sentences(self):
        """Sentences of 40+ characters outside the calculator panel, references and table headers."""
        found = set()
        for block in ''.join(self._sentence_text).split('\n'):
            for sentence in re.split(r'(?<=[.?!])\s+', re.sub(r'\s+', ' ', block).strip()):
                if len(sentence) >= 40:
                    found.add(sentence)
        return found

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        if tag == 'html':
            self.lang = attrs.get('lang')
        if tag == 'title':
            self._in_title = True
        if tag == 'script' and 'src' in attrs:
            self.script_srcs.append(attrs['src'])
        elif tag == 'script':
            self._in_script = True
            self.scripts.append('')
        self.handlers += [value for name, value in attributes if name.startswith('on')]
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
            if self._footer:
                self.footer_links.append(attrs['href'])
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs['href']
        if tag == 'link' and attrs.get('rel') == 'alternate' and 'hreflang' in attrs:
            assert attrs['hreflang'] not in self.alternates, f"Duplicate hreflang {attrs['hreflang']}"
            self.alternates[attrs['hreflang']] = attrs['href']
        if tag == 'meta' and 'name' in attrs:
            self.meta[attrs['name']] = attrs.get('content', '')
        if tag == 'footer':
            self._footer += 1
        if tag not in self.VOID:
            self._open.append((tag, (attrs.get('class') or '').split()))
        if tag == 'main':
            self._main += 1
        elif self._main and tag in self.SKIP:
            self._skip += 1
        if self._main and not self._skip:
            if tag == 'section' and 'example' in self._open[-1][1]:
                self.examples += 1
            if tag == 'details' and self._inside('faq'):
                self.faqs += 1
            if tag == 'a' and self._inside('sources') and re.match(r'https?://', attrs.get('href', '')) and SITE not in attrs['href']:
                self.source_links.add(attrs['href'])
            if tag == 'h2':
                self._h2 = ''
            if tag in self.BLOCK:
                self._sentence_text.append('\n')

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False
        if tag == 'script':
            self._in_script = False
        if tag == 'footer':
            self._footer -= 1
        for i in range(len(self._open) - 1, -1, -1):
            if self._open[i][0] == tag:
                del self._open[i:]
                break
        if tag == 'h2' and self._h2 is not None:
            self.h2.append(re.sub(r'\s+', ' ', self._h2).strip())
            self._h2 = None
        if tag in self.BLOCK:
            self._sentence_text.append('\n')
        if tag == 'main':
            self._main -= 1
        elif self._main and tag in self.SKIP:
            self._skip -= 1

    def handle_data(self, data):
        if self._in_script:
            self.scripts[-1] += data
        if self._in_title:
            self.title += data
        if self._main and not self._skip:
            self.body.append(data)
            if self._h2 is not None:
                self._h2 += data
            if not (self._inside('calc-panel') or self._inside('sources') or any(tag == 'th' for tag, _ in self._open)):
                self._sentence_text.append(data)


def rel(file):
    return str(file.relative_to(ROOT))


def url_of(file):
    r = rel(file)
    if r == 'index.html':
        return f'{SITE}/'
    if r.endswith('index.html'):
        return f'{SITE}/{r[:-len("index.html")]}'
    return f'{SITE}/{r[:-len(".html")]}'


def file_of(url):
    path = urlparse(url).path
    target = ROOT / path.lstrip('/')
    if path.endswith('/'):
        return target / 'index.html'
    return target.with_suffix('.html')


# Build output: every repository file is either published unchanged or listed
# here as a development file, and development files never reach the output.
DEV_FILES = {'.gitignore', 'README.md', 'DEPLOY.md', 'build.sh'}
DEV_DIRS = ('tests/',)

try:
    listed = subprocess.run(['git', 'ls-files', '--cached', '--others', '--exclude-standard'],
                            cwd=REPO, check=True, capture_output=True, text=True).stdout.splitlines()
    source = {f for f in listed if (REPO / f).is_file()}
except (OSError, subprocess.CalledProcessError):
    source = {str(f.relative_to(REPO)) for f in REPO.rglob('*') if f.is_file()
              and not f.relative_to(REPO).parts[0].startswith(('.git', 'dist', '__pycache__'))}


def copy_source(dest):
    for f in source:
        (dest / f).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(REPO / f, dest / f)


def build(base, *args):
    return subprocess.run(['sh', str(base / 'build.sh'), *args], cwd=WORK, capture_output=True, text=True)


def tree(base):
    return {str(f.relative_to(base)): f.read_bytes() for f in base.rglob('*') if f.is_file()}


copy_source(SRC)
for out in ('dist', 'again'):
    result = build(SRC, out)
    assert result.returncode == 0, f'build.sh {out} failed: {result.stderr}'
again = SRC / 'again'

# build.sh hardening, in a scratch copy so the checked build stays clean.
SCRATCH = WORK / 'scratch'
copy_source(SCRATCH)
outside = WORK / 'x'
outside.mkdir()
(outside / 'keep').write_text('keep')
(SCRATCH / '.hidden').mkdir()
(SCRATCH / '.hidden' / 'keep').write_text('keep')
for bad in ('', '../x', str(outside), '/tmp/x', '.hidden', '.', '..', 'a/b', 'dist/..', 'x y',
            'calculators', 'en', 'guides', 'tests', 'index.html', 'tests/'):
    before = tree(WORK)
    result = build(SCRATCH, bad)
    assert result.returncode != 0 and 'refusing' in result.stderr, f'build.sh accepted output {bad!r}'
    assert tree(WORK) == before, f'build.sh {bad!r} changed files before refusing'
(SCRATCH / '.hidden.html').write_text('hidden')
(SCRATCH / 'guides' / '.draft.html').write_text('hidden')
(SCRATCH / 'en' / '.drafts').mkdir()
(SCRATCH / 'en' / '.drafts' / 'page.html').write_text('hidden')
result = build(SCRATCH, 'out')
assert result.returncode == 0, f'build.sh with dotfiles present failed: {result.stderr}'
hidden = [f for f in tree(SCRATCH / 'out') if any(part.startswith('.') for part in Path(f).parts)]
assert not hidden, f'build.sh published hidden files: {hidden}'
for link, target in (('calculators/linked.html', '../index.html'), ('linked.html', 'index.html'),
                     ('robots.txt', 'index.html'), ('guides', 'en/guides')):
    path = SCRATCH / link
    saved = path.with_name(path.name + '.saved')
    if path.exists():
        path.rename(saved)
    path.symlink_to(target)
    (SCRATCH / 'out' / 'keep').write_text('keep')
    result = build(SCRATCH, 'out')
    assert result.returncode != 0 and 'symlink' in result.stderr, f'build.sh accepted symlink {link}'
    assert (SCRATCH / 'out' / 'keep').exists(), f'build.sh deleted the old output before refusing {link}'
    path.unlink()
    if saved.exists():
        saved.rename(path)
shutil.move(str(SCRATCH / 'en'), str(WORK / 'en-moved'))
result = build(SCRATCH, 'out')
assert result.returncode != 0, 'build.sh succeeded with a published directory missing'
fake = WORK / 'fakebin'
fake.mkdir()
(fake / 'find').write_text('#!/bin/sh\necho "find: simulated failure" >&2\nexit 1\n')
(fake / 'find').chmod(0o755)
shutil.move(str(WORK / 'en-moved'), str(SCRATCH / 'en'))
result = subprocess.run(['sh', str(SCRATCH / 'build.sh'), 'out'], cwd=WORK, capture_output=True, text=True,
                        env={'PATH': f'{fake}:/usr/bin:/bin'})
assert result.returncode != 0 and 'simulated failure' in result.stderr, 'build.sh ignored a find failure'
assert (SCRATCH / 'out' / 'keep').exists(), 'build.sh deleted the old output after a find failure'


built = tree(ROOT)
assert built == tree(again), 'build.sh output differs between two runs'
dev = {f for f in source if f in DEV_FILES or f.startswith(DEV_DIRS)}
assert not dev & set(built), f'Development files in build output: {sorted(dev & set(built))}'
assert set(built) <= source, f'Build output has files not in the repository: {sorted(set(built) - source)}'
missing = source - dev - set(built)
assert not missing, f'Files neither published by build.sh nor listed in DEV_FILES/DEV_DIRS: {sorted(missing)}'
for f, data in built.items():
    assert data == (REPO / f).read_bytes(), f'{f}: build output differs from the repository'
for f in ('_redirects', '404.html', 'ads.txt', 'robots.txt', 'sitemap.xml', 'index.html'):
    assert f in built, f'{f} missing from the build output root'

texts = {p: p.read_text(encoding='utf-8') for p in ROOT.rglob('*.html')}
pages = {p: Page(t) for p, t in texts.items()}
noindex = {p for p, page in pages.items() if 'noindex' in page.meta.get('robots', '')}

# Local links and fragments.
for file, page in pages.items():
    for link in page.links:
        url = urlparse(link)
        if url.scheme or url.netloc:
            continue
        target = ROOT / url.path.lstrip('/') if url.path.startswith('/') else file.parent / url.path
        if not url.path:
            target = file
        elif target.is_dir():
            target /= 'index.html'
        elif not target.exists() and not target.suffix:
            target = target.with_suffix('.html')
        assert target.is_file(), f"Missing link: {rel(file)} -> {link}"
        if url.fragment:
            assert url.fragment in pages[target].ids or (target == ROOT / 'index.html' and url.fragment in calculators), f"Missing fragment: {link}"

# 404 page.
not_found = ROOT / '404.html'
assert not_found in pages, '404.html is missing'
assert pages[not_found].meta.get('robots') == 'noindex'
assert ADSENSE.split('?')[0] not in texts[not_found], '404.html must not load AdSense'
assert pages[not_found].canonical is None, '404.html must not declare a canonical URL'

# Every page: language, canonical, tags, footer, title and description.
for file, page in pages.items():
    r, text = rel(file), texts[file]
    language = 'en' if r.startswith('en/') else 'ko'
    assert page.lang == language, f'{r}: lang={page.lang}, expected {language}'
    assert GA4_ID in text, f'{r}: GA4 missing'
    assert (CLARITY in text) == (r in CLARITY_PAGES), f'{r}: Clarity must stay on {sorted(CLARITY_PAGES)} only'
    for href in FOOTER[language]:
        assert href in page.footer_links, f'{r}: footer link {href} missing'
    assert page.title.strip(), f'{r}: empty title'
    assert page.meta.get('description'), f'{r}: missing description'
    if file == not_found:
        continue
    assert page.canonical == url_of(file), f'{r}: canonical {page.canonical} != {url_of(file)}'
    assert text.count(ADSENSE) == 1, f'{r}: AdSense script missing or duplicated'

titles = [pages[f].title.strip() for f in pages]
assert len(titles) == len(set(titles)), 'Duplicate <title>'
descriptions = {f: pages[f].meta['description'] for f in pages}
assert len(set(descriptions.values())) == len(descriptions), 'Duplicate meta description'


def strip_topic(text):
    for word in TOPIC_WORDS:
        text = text.replace(word, '')
    return re.sub(r'[\d.,=×⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+', '', text)


stripped = {f: strip_topic(d) for f, d in descriptions.items()}
files = sorted(stripped)
for i, a in enumerate(files):
    for b in files[i + 1:]:
        ratio = SequenceMatcher(None, stripped[a], stripped[b]).ratio()
        assert ratio < 0.7, f'Meta descriptions too similar ({ratio:.2f}): {rel(a)} / {rel(b)}'

# Sitemap.
ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap_urls = [n.text for n in ET.parse(ROOT/'sitemap.xml').findall('s:url/s:loc', ns)]
assert len(sitemap_urls) == len(set(sitemap_urls)), 'Duplicate sitemap URL'
redirect_rules = [line.split() for line in (ROOT/'_redirects').read_text(encoding='utf-8').splitlines() if line.strip() and not line.startswith('#')]
redirect_sources = {rule[0] for rule in redirect_rules}
indexable = {f for f in pages if f not in noindex and f != not_found}
sitemap_files = set()
for url in sitemap_urls:
    path = urlparse(url).path
    assert url.startswith(f'{SITE}/'), f'Sitemap URL not on apex https: {url}'
    assert not path.endswith('.html'), f'Sitemap URL with .html: {url}'
    assert path not in redirect_sources, f'Sitemap URL is redirected: {url}'
    file = file_of(url)
    assert file.is_file(), f'Sitemap URL has no file: {url}'
    assert file not in noindex, f'Sitemap lists a noindex page: {url}'
    assert pages[file].canonical == url, f'Sitemap URL is not canonical: {url}'
    chars = pages[file].body_chars
    assert chars >= MIN_BODY, f'{url}: body has {chars} characters (minimum {MIN_BODY})'
    sitemap_files.add(file)
assert sitemap_files == indexable, f'Indexable pages missing from sitemap: {sorted(rel(f) for f in indexable - sitemap_files)}'

# Only the 404 page is kept out of the index.
assert noindex == {not_found}, f'Unexpected noindex set: {sorted(rel(f) for f in noindex)}'

# hreflang: reciprocal pairs, x-default = Korean page, nothing on or to noindex pages.
for file, page in pages.items():
    if not page.alternates:
        continue
    r = rel(file)
    assert file not in noindex, f'{r}: noindex page declares hreflang'
    assert page.alternates.get(page.lang) == page.canonical, f'{r}: hreflang must include itself'
    assert page.alternates.get('x-default') == page.alternates['ko'], f'{r}: x-default must point to the Korean page'
    for lang, href in page.alternates.items():
        target = file_of(href)
        assert target.is_file() and target not in noindex, f'{r}: hreflang {lang} -> {href} is missing or noindex'
        assert pages[target].alternates == page.alternates, f'{r}: hreflang not reciprocal with {rel(target)}'
home = pages[ROOT/'index.html']
assert home.alternates == {'ko': f'{SITE}/', 'x-default': f'{SITE}/'}, 'Home must declare only ko and x-default'
for name in calculators:
    for prefix in ('', 'en/'):
        file = ROOT / f'{prefix}guides/{name}.html'
        assert set(pages[file].alternates) == {'ko', 'en', 'x-default'}, f'{rel(file)}: missing ko/en/x-default hreflang'

# Calculator pages, redirects and links into them.
formula_ids = {}
current = None
for line in (ROOT/'calculators.js').read_text(encoding='utf-8').splitlines():
    match = re.match(r'    (\w+): \{$', line)
    if match:
        current = match.group(1)
    for input_id in re.findall(r"\{ id: '(\w+)'", line):
        formula_ids.setdefault(current, []).append(input_id)
assert sorted(formula_ids) == sorted(calculators)
for prefix in ('', 'en/'):
    for name in calculators:
        file = ROOT / f'{prefix}calculators/{name}.html'
        text = texts[file]
        assert f'data-calculator="{name}"' in text
        assert [i[3:] for i in re.findall(r'<input[^>]* id="(in-\w+)"', text)] == formula_ids[name], f'{rel(file)}: inputs differ from calculators.js'
        assert '/calculators.js' in text and '/calculator-page.js' in text
        other = f'/calculators/{name}' if prefix else f'/en/calculators/{name}'
        assert f'data-other-url="{other}"' in text
        assert f'/{prefix}guides/{name}' in pages[file].links, f'{rel(file)}: missing link to its guide'
        assert f'/{prefix}calculators/{name}' in pages[ROOT / f'{prefix}guides/{name}.html'].links, f'{prefix}guides/{name}: missing calculator link'
for name in calculators:
    assert f'/calculators/{name}' in home.links, f'Home does not link to /calculators/{name}'
assert sorted(rule[0][1:] for rule in redirect_rules) == sorted(calculators)
for source, target, status in redirect_rules:
    assert status == '301' and target == f'/calculators{source}', f'Bad redirect: {source} {target} {status}'
    assert file_of(SITE + target).is_file(), f'Redirect target missing: {target}'
assert '<script src="/calculators.js' in texts[ROOT/'index.html'] and 'id="calculatorModal"' in texts[ROOT/'index.html'], 'Home must keep the /#name modal'

# Calculation notes (existing bilingual chapter checks, now linking calculator pages).
chapters = {
    'pipe-flow': {'reynolds', 'prandtl', 'peclet'},
    'model-similarity': {'reynolds', 'froude'},
    'pipe-energy': {'reynolds'},
    'transport-scales': {'reynolds', 'prandtl', 'schmidt', 'peclet', 'nusselt'},
    'gas-models': {'mach', 'knudsen'},
    'interface-time-scales': {'reynolds', 'weber', 'froude', 'strouhal'},
}
for prefix in ('', 'en/'):
    for slug, links in chapters.items():
        file = ROOT/f'{prefix}guides/{slug}.html'
        expected = f'{SITE}/{prefix}guides/{slug}'
        text = texts[file]
        assert pages[file].canonical == expected
        assert expected in sitemap_urls
        assert 'id="langToggle"' in text
        other_prefix = '' if prefix else 'en/'
        assert f'data-other-url="/{other_prefix}guides/{slug}"' in text
        for calculator in links:
            assert f'/{prefix}calculators/{calculator}' in pages[file].links, f'{rel(file)}: missing /{prefix}calculators/{calculator}'
        assert set(pages[file].alternates) == {'ko', 'en', 'x-default'}
        assert '<caption>' in text and 'scope="col"' in text

# Body pages: basic guides, calculation notes and calculator pages.
NOTES = list(chapters)
BASIC = [ROOT / f'{p}guides/{n}.html' for p in ('', 'en/') for n in calculators]
NOTE_FILES = [ROOT / f'{p}guides/{n}.html' for p in ('', 'en/') for n in NOTES]
CALC_FILES = [ROOT / f'{p}calculators/{n}.html' for p in ('', 'en/') for n in calculators]
BODY_PAGES = BASIC + NOTE_FILES + CALC_FILES
OLD_GUIDE_HEADINGS = {'언제 쓰나요?', '공식과 입력값', '직접 계산한 예제', '결과는 어떻게 읽나요?', '적용할 때 주의할 점',
                      'When is it useful?', 'Formula and inputs', 'Worked example', 'Interpreting the result', 'Limits and cautions'}
for file in BODY_PAGES:
    page, r = pages[file], rel(file)
    assert page.examples >= 2, f'{r}: {page.examples} example sections (minimum 2)'
    assert page.faqs >= 3, f'{r}: {page.faqs} FAQ items (minimum 3)'
    assert len(page.source_links) >= 2, f'{r}: {len(page.source_links)} distinct external links in the sources section (minimum 2)'
    heading = 'References' if r.startswith('en/') else '참고 자료'
    assert heading in page.h2, f'{r}: sources section must be titled {heading}'
for file in BASIC:
    assert not OLD_GUIDE_HEADINGS & set(pages[file].h2), f'{rel(file)}: still uses the old five-heading template'
for i, a in enumerate(BASIC):
    for b in BASIC[i + 1:]:
        common = set(pages[a].h2) & set(pages[b].h2)
        assert len(common) < 3, f'{rel(a)} and {rel(b)} share {len(common)} h2 headings: {sorted(common)}'
for name in NOTES + calculators:
    ko, en = pages[ROOT / f'guides/{name}.html'], pages[ROOT / f'en/guides/{name}.html']
    floor = 2500 if name in NOTES else MIN_BODY
    assert ko.body_chars >= max(floor, 0.7 * en.body_chars), f'guides/{name}.html: {ko.body_chars} characters, need >= {floor} and 70% of English ({en.body_chars})'

# No sentence of 40+ characters may appear on three or more body pages
# (calculator form panel, sources section and table headers excluded).
seen = {}
for file in BODY_PAGES:
    for sentence in pages[file].sentences():
        seen.setdefault(sentence, []).append(rel(file))
repeated = {s: rs for s, rs in seen.items() if len(rs) >= 3}
assert not repeated, 'Sentences repeated on 3+ body pages:\n' + '\n'.join(f'  {s[:80]}… {rs}' for s, rs in repeated.items())

# Basic guides link to related numbers.
for prefix in ('', 'en/'):
    for name in calculators:
        file = ROOT / f'{prefix}guides/{name}.html'
        assert 'id="related"' in texts[file], f'{rel(file)}: missing related numbers'

# Privacy policies name every service that runs on the site.
for file in (ROOT/'privacy.html', ROOT/'en/privacy.html'):
    text = texts[file]
    for needle in ('Google Analytics', 'Microsoft Clarity', 'Google AdSense', 'Cloudflare', 'https://adssettings.google.com/', ISSUES,
                   # Retention periods with official references.
                   'support.google.com/analytics/answer/7667196', 'learn.microsoft.com/en-us/clarity/setup-and-installation/data-retention',
                   # International transfer under PIPA Article 28-8 and the remedy bodies.
                   'law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1020398611',
                   'kopico.go.kr', '1833-6972', 'privacy.kisa.or.kr', '118', 'spo.go.kr', '1301', 'ecrm.police.go.kr', '182'):
        assert needle in text, f'{rel(file)}: missing {needle}'
    localized = ('2개월', '30일', '9개월', '제28조의8', '공소청', '민원상담') if file.parent == ROOT else ('2 months', '30 days', '9 months', 'Article 28-8', 'Public Prosecution Service', 'civil inquiries')
    for needle in localized:
        assert needle in text, f'{rel(file)}: missing {needle}'

# _headers: security headers on every path. The CSP is report-only; inline
# scripts and handlers are allowed by hash, so editing one means updating
# _headers with the hash printed by the failing assertion.
rules, path = {}, None
for line in (ROOT/'_headers').read_text(encoding='utf-8').splitlines():
    assert len(line) <= 2000, f'_headers line longer than 2,000 characters: {line[:60]}...'
    if not line.strip() or line.lstrip().startswith('#'):
        continue
    if not line[0].isspace():
        path = line.strip()
        rules[path] = {}
        continue
    name, _, value = line.strip().partition(':')
    assert path and name.lower() not in rules[path], f'_headers: header {name} outside a rule or repeated'
    rules[path][name.lower()] = value.strip()
assert '/*' in rules, '_headers needs a /* rule'
headers = rules['/*']
assert headers.get('strict-transport-security') == 'max-age=31536000', 'HSTS must be exactly max-age=31536000 (no includeSubDomains/preload while www is unverified)'
csp_text = headers.get('content-security-policy-report-only')
assert csp_text, 'Content-Security-Policy-Report-Only missing'
csp = {}
for directive in csp_text.split(';'):
    if directive.strip():
        name, *sources = directive.split()
        assert name not in csp, f'CSP directive {name} repeated'
        csp[name] = sources
assert headers.get('x-frame-options') == 'DENY' or csp.get('frame-ancestors') == ["'none'"], 'No frame protection'
assert headers.get('permissions-policy'), 'Permissions-Policy missing'
assert headers.get('x-content-type-options') == 'nosniff'
assert headers.get('referrer-policy') == 'strict-origin-when-cross-origin'
assert 'default-src' in csp and 'base-uri' in csp, 'CSP needs default-src and base-uri'
assert csp.get('object-src') == ["'none'"], "CSP needs object-src 'none'"
script_src = csp.get('script-src', csp['default-src'])


def sha256(text):
    return "'sha256-" + base64.b64encode(hashlib.sha256(text.encode()).digest()).decode() + "'"


def allows(host):
    return any(s in (f'https://{host}', f'{host}') or (s.startswith('https://*.') and host.endswith(s[9:]))
               for s in script_src)


inline = {sha256(t) for page in pages.values() for t in page.scripts}
handlers = {sha256(h) for page in pages.values() for h in page.handlers}
missing = sorted((inline | handlers) - set(script_src))
assert not missing, f'script-src lacks hashes for inline scripts/handlers: {" ".join(missing)}'
stale = sorted({s for s in script_src if s.startswith("'sha256-")} - inline - handlers)
assert not stale, f'script-src has hashes no page uses: {" ".join(stale)}'
assert not handlers or "'unsafe-hashes'" in script_src, "Inline event handlers need 'unsafe-hashes'"
hosts = set()
for file, page in pages.items():
    loaded = page.script_srcs + [m for t in page.scripts for m in re.findall(r'\.src\s*=\s*["\'](https://[^"\']+)', t)]
    for src in loaded:
        url = urlparse(src)
        if url.netloc:
            assert url.scheme == 'https', f'{rel(file)}: non-https script {src}'
            assert allows(url.netloc), f'{rel(file)}: script host {url.netloc} not in script-src'
            hosts.add(url.netloc)
        else:
            assert "'self'" in script_src

# Stylesheets imported from other hosts (Google Fonts in style.css) need style-src.
style_src = csp.get('style-src', csp['default-src'])
for css in [*ROOT.glob('*.css'), *pages]:
    for host in re.findall(r"@import\s+url\(['\"]?https://([^/'\")]+)", css.read_text(encoding='utf-8')):
        assert f'https://{host}' in style_src, f'{rel(css)}: stylesheet host {host} not in style-src'
        if host == 'fonts.googleapis.com':
            assert 'https://fonts.gstatic.com' in csp.get('font-src', []), 'Google Fonts needs https://fonts.gstatic.com in font-src'

print(f'PASS: build.sh output ({len(built)} files, deterministic, no development files; unsafe output names, hidden files, symlinks and find failures refused); {len(pages)} HTML pages; links, fragments, IDs, lang/canonical/GA4/AdSense/footer, unique titles and descriptions, '
      f'{len(sitemap_urls)} sitemap URLs (>= {MIN_BODY} chars, no redirects or noindex), {len(noindex)} noindex page, hreflang pairs, '
      f'calculator pages, _redirects, privacy disclosures; {len(BODY_PAGES)} body pages with >= 2 examples, >= 3 FAQs, >= 2 references, '
      f'no shared guide headings and no sentence repeated on 3+ pages; '
      f'_headers (HSTS, frames, CSP report-only with {len(inline)} script and {len(handlers)} handler hashes, script hosts {sorted(hosts)})')
