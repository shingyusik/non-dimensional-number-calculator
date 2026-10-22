"""Manual network check: python3 tests/check_sources.py [--all-external]

Opens every external URL listed in a <section class="sources"> block (or, with
--all-external, every external link on the site) and prints its HTTP status.
Not part of the default test run because it depends on the network and on
third-party sites. A 403/429 often means bot blocking: confirm such URLs in a
browser or with curl and a browser User-Agent before replacing them.
"""
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
import sys

ROOT = Path(__file__).resolve().parents[1]
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
TIMEOUT = 30
ALL = '--all-external' in sys.argv


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.depth, self.stack, self.urls = 0, [], set()
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'section':
            self.stack.append('sources' in (attrs.get('class') or '').split())
        if tag == 'a' and attrs.get('href', '').startswith(('http://', 'https://')) and (ALL or any(self.stack)):
            self.urls.add(attrs['href'])

    def handle_endtag(self, tag):
        if tag == 'section' and self.stack:
            self.stack.pop()


def status(url):
    for method in ('HEAD', 'GET'):
        request = Request(url, method=method, headers={'User-Agent': UA, 'Accept': 'text/html,application/pdf,*/*', 'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8'})
        try:
            with urlopen(request, timeout=TIMEOUT) as response:
                return str(response.status)
        except HTTPError as error:
            if method == 'HEAD':  # some servers reject HEAD (e.g. 405 or 500) but serve GET
                continue
            return str(error.code)
        except (URLError, TimeoutError, OSError) as error:
            if method == 'HEAD':
                continue
            return f'ERROR {getattr(error, "reason", error)}'
    return 'ERROR'


pages = {}
for file in sorted(ROOT.rglob('*.html')):
    for url in Links(file.read_text(encoding='utf-8')).urls:
        pages.setdefault(url, []).append(str(file.relative_to(ROOT)))

with ThreadPoolExecutor(max_workers=8) as pool:
    results = dict(zip(pages, pool.map(status, pages)))

bad = 0
for url in sorted(pages, key=lambda u: (results[u].startswith('2'), u)):
    ok = results[url].startswith(('2', '3'))
    bad += not ok
    print(f'{results[url]:>8}  {url}  ({len(pages[url])} page{"s" if len(pages[url]) > 1 else ""})')
print(f'{len(pages) - bad}/{len(pages)} URLs opened; {bad} need a manual check')
sys.exit(1 if bad else 0)
