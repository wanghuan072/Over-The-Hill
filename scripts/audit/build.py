"""Audit prerendered public HTML without starting a Next.js server."""
import json
import os
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / '.next/server/app'
INDEXABLE = os.environ.get('SITE_AUDIT_INDEXABLE') == 'true'
collections = ['guides/guides']
routes = ['/', '/legal/about-us', '/legal/contact-us', '/legal/copyright', '/guides', '/maps', '/legal/privacy-policy', '/search', '/legal/terms-of-service', '/update', '/vehicles', '/wiki']
routes += ['/wiki/' + category['slug'] for category in json.loads((ROOT / 'src/data/wiki/categories.json').read_text(encoding='utf-8'))]
for collection in collections:
    for record in json.loads((ROOT / 'src/data' / (collection + '.json')).read_text(encoding='utf-8')):
        if record['verificationStatus'] == 'confirmed':
            prefix = 'wiki/' + record['category'] if collection.startswith('wiki') else collection.split('/')[0]
            routes.append('/' + prefix + '/' + record['slug'])

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1 = 0
        self.title = ''
        self.in_title = False
        self.description = ''
        self.canonical = ''
        self.robots = ''
        self.links = []
        self.images = []
        self.ids = set()
        self.meta = {}
        self.in_jsonld = False
        self.jsonld = ''
        self.structured = []
        self.in_footer = False
        self.footer_text = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'footer': self.in_footer = True
        if self.in_footer and tag == 'a' and a.get('href', '').startswith('/legal/'):
            assert {'noopener', 'noreferrer', 'nofollow'} <= set(a.get('rel', '').split()), 'Footer Legal link rel attributes missing'
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.in_title = True
        if tag == 'meta': self.meta[a.get('name', a.get('property',''))] = a.get('content','')
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.in_jsonld = True
            self.jsonld = ''
        if tag == 'meta' and a.get('name') == 'description': self.description = a.get('content','')
        if tag == 'meta' and a.get('name') == 'robots': self.robots = a.get('content','')
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href','')
        if tag == 'a': self.links.append(a.get('href',''))
        if tag == 'img': self.images.append(a.get('src',''))
        if 'id' in a: self.ids.add(a['id'])
    def handle_endtag(self, tag):
        if tag == 'footer': self.in_footer = False
        if tag == 'title': self.in_title = False
        if tag == 'script' and self.in_jsonld:
            self.structured.append(json.loads(self.jsonld))
            self.in_jsonld = False
    def handle_data(self, data):
        if self.in_footer: self.footer_text.append(data)
        if self.in_title: self.title += data
        if self.in_jsonld: self.jsonld += data

titles, descriptions, links = set(), set(), set()
pages, fragments = {}, []
for route in routes:
    path = APP / ('index.html' if route == '/' else route.lstrip('/') + '.html')
    assert path.is_file(), f'Missing prerender: {route}'
    page = Page()
    page.feed(path.read_text(encoding='utf-8'))
    pages[route] = page
    assert page.h1 == 1, f'{route}: {page.h1} H1 elements'
    assert page.title and page.title not in titles, f'Duplicate/missing title: {route}'
    assert len(page.description) > 20 and page.description not in descriptions, f'Duplicate/missing description: {route}'
    assert page.canonical == 'https://overthehillhub.org' + (route if route != '/' else ''), f'Canonical: {route}'
    should_index = INDEXABLE and route != '/search'
    assert ('noindex' not in page.robots) == should_index, f'Incorrect index directive: {route}'
    assert 'Copyright ©' in ''.join(page.footer_text), f'Copyright text: {route}'
    for key in ['og:title','og:description','og:image','twitter:card','twitter:title','twitter:description','twitter:image']:
        assert page.meta.get(key), f'Missing social metadata {key}: {route}'
    assert page.structured, f'Missing structured data: {route}'
    assert all(item.get('@type') != 'FAQPage' for item in page.structured), f'Unrequested FAQPage: {route}'
    titles.add(page.title)
    descriptions.add(page.description)
    for href in page.links:
        assert not href.startswith(('http://', 'https://', '//')), f'External public link: {route} -> {href}'
        if href.startswith('/') and not href.startswith('//'):
            parsed_link = urlparse(href)
            links.add(parsed_link.path)
            if parsed_link.fragment: fragments.append((route, parsed_link.path, unquote(parsed_link.fragment)))
        if href.startswith('#'): assert unquote(href[1:]) in page.ids, f'Broken anchor {route}{href}'
    for src in page.images:
        parsed = urlparse(src)
        image = parse_qs(parsed.query).get('url',[src])[0] if parsed.path == '/_next/image' else src
        if image.startswith('/') and not image.startswith('/_next/'):
            assert (ROOT / 'public' / image.lstrip('/')).is_file(), f'Missing image: {image}'
for link in links:
    assert link in routes or (ROOT / 'public' / link.lstrip('/')).is_file(), f'Unknown internal link: {link}'
for origin, target, fragment in fragments:
    assert target in pages and fragment in pages[target].ids, f'Broken collection anchor: {origin} -> {target}#{fragment}'
for collection, route in [('vehicles/vehicles','/vehicles'), ('wiki/entries','/wiki'), ('maps/regions','/maps')]:
    for record in json.loads((ROOT / 'src/data' / (collection + '.json')).read_text(encoding='utf-8')):
        if record['verificationStatus'] == 'confirmed':
            target = '/wiki/' + record['category'] if collection == 'wiki/entries' else route
            assert record['slug'] in pages[target].ids, f'Missing catalog record: {route}#{record["slug"]}'
tree = ET.fromstring((APP / 'sitemap.xml.body').read_text(encoding='utf-8'))
namespace = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls = [node.text for node in tree.findall('s:url/s:loc', namespace)]
expected = {'https://overthehillhub.org' + route for route in routes if route != '/search'} if INDEXABLE else set()
assert set(urls) == expected and len(urls) == len(expected), 'Compiled sitemap URL mismatch'
robot_text = (APP / 'robots.txt.body').read_text(encoding='utf-8')
assert ('Disallow: /' not in robot_text) == INDEXABLE, 'Compiled robots mismatch'
print(f'Prerender audit passed: {len(routes)} public pages; unique metadata, one H1, canonical, {"production" if INDEXABLE else "preview"} robots/sitemap, internal links, section anchors, Legal links and images.')
