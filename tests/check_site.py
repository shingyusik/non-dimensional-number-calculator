"""Run with python3 tests/check_site.py."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links, self.ids, self.canonical = [], set(), None
        self.feed(text)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs['href']


pages = {p: Page(p.read_text()) for p in ROOT.rglob('*.html')}
calculators = {'reynolds', 'mach', 'nusselt', 'prandtl', 'schmidt', 'peclet', 'strouhal', 'froude', 'weber', 'knudsen'}
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
        assert target.is_file(), f"Missing link: {file.relative_to(ROOT)} -> {link}"
        if url.fragment:
            assert url.fragment in pages[target].ids or (target == ROOT / 'index.html' and url.fragment in calculators), f"Missing fragment: {link}"

ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap_urls = {n.text for n in ET.parse(ROOT/'sitemap.xml').findall('s:url/s:loc', ns)}
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
        expected = f'https://calctool.cc/{prefix}guides/{slug}'
        assert pages[file].canonical == expected
        assert expected in sitemap_urls
        assert 'id="langToggle"' in file.read_text()
        assert 'data-other-url=' in file.read_text()
        text = file.read_text()
        language = 'en' if prefix else 'ko'
        assert f'<html lang="{language}">' in text
        other_prefix = '' if prefix else 'en/'
        assert f'data-other-url="/{other_prefix}guides/{slug}"' in text
        for calculator in links:
            assert f'/#{calculator}' in pages[file].links
        assert 'hreflang="ko"' in text and 'hreflang="en"' in text
        assert '<caption>' in text and 'scope="col"' in text
print(f'PASS: {len(pages)} HTML pages; local links, fragments, duplicate IDs, 12 bilingual chapter canonical/sitemap entries and calculator connections')
