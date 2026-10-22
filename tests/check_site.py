"""Run with python3 tests/check_site.py."""
from difflib import SequenceMatcher
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://calctool.cc'
GA4_ID = 'G-4L6KGPWDN7'
ADSENSE = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9649208039336516'
CLARITY = 'clarity.ms/tag/'
ISSUES = 'https://github.com/shingyusik/non-dimensional-number-calculator/issues'
MIN_BODY, WARN_BODY = 1000, 1500
calculators = ['reynolds', 'mach', 'nusselt', 'prandtl', 'schmidt', 'peclet', 'strouhal', 'froude', 'weber', 'knudsen']

# Korean basic guides are under 1,000 characters until the phase-2 rewrite.
# They stay published and linked, but carry noindex and no hreflang. Remove
# entries here (and the meta tag) once a page passes the length check.
NOINDEX_THIN = {'guides/nusselt.html', 'guides/prandtl.html'}
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

    def __init__(self, text):
        super().__init__()
        self.links, self.ids, self.canonical, self.lang = [], set(), None, None
        self.alternates, self.meta, self.title = {}, {}, ''
        self.footer_links, self.body = [], []
        self._main = self._skip = self._footer = 0
        self._in_title = False
        self.feed(text)
        self.body_chars = len(re.sub(r'\s', '', ''.join(self.body)))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        if tag == 'html':
            self.lang = attrs.get('lang')
        if tag == 'title':
            self._in_title = True
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
        if tag == 'main':
            self._main += 1
        elif self._main and tag in self.SKIP:
            self._skip += 1

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False
        if tag == 'footer':
            self._footer -= 1
        if tag == 'main':
            self._main -= 1
        elif self._main and tag in self.SKIP:
            self._skip -= 1

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._main and not self._skip:
            self.body.append(data)


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
warnings = []
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
    if chars < WARN_BODY:
        warnings.append((chars, rel(file)))
    sitemap_files.add(file)
assert sitemap_files == indexable, f'Indexable pages missing from sitemap: {sorted(rel(f) for f in indexable - sitemap_files)}'

# Thin pages kept out of the index.
assert {rel(f) for f in noindex} == NOINDEX_THIN | {'404.html'}, f'Unexpected noindex set: {sorted(rel(f) for f in noindex)}'
for r in NOINDEX_THIN:
    assert pages[ROOT / r].meta['robots'] == 'noindex, follow', f'{r}: expected noindex, follow'

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
for r in NOINDEX_THIN:
    twin = ROOT / 'en' / r
    assert not pages[twin].alternates, f'{rel(twin)}: drop hreflang while the Korean twin is noindex'

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

for chars, r in sorted(warnings):
    print(f'WARN: {r} body has {chars} characters (< {WARN_BODY})')
print(f'PASS: {len(pages)} HTML pages; links, fragments, IDs, lang/canonical/GA4/AdSense/footer, unique titles and descriptions, '
      f'{len(sitemap_urls)} sitemap URLs (>= {MIN_BODY} chars, no redirects or noindex), {len(noindex)} noindex pages, hreflang pairs, '
      f'calculator pages, _redirects and privacy disclosures')
