#!/usr/bin/env python3
"""Check rendered SDK pages and generated machine indexes against one deployed origin."""
import argparse
import concurrent.futures
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import urllib.request

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('origin', help='For example https://docs.caveman.so or http://127.0.0.1:3011')
args = parser.parse_args()
origin = args.origin.rstrip('/')

def get(path):
    with urllib.request.urlopen(origin + path, timeout=60) as response:
        assert response.status == 200, (path, response.status)
        return response.read().decode(), dict(response.headers)

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=set(); self.canonical=None; self.h1=0; self.jsonld=[]; self.in_schema=False
    def handle_starttag(self, tag, attributes):
        attr=dict(attributes)
        if 'id' in attr: self.ids.add(attr['id'])
        if tag=='h1': self.h1+=1
        if tag=='link' and attr.get('rel')=='canonical': self.canonical=attr.get('href')
        if tag=='script' and attr.get('type')=='application/ld+json': self.in_schema=True
    def handle_endtag(self, tag):
        if tag=='script': self.in_schema=False
    def handle_data(self,data):
        if self.in_schema: self.jsonld.append(data)

index=json.loads(get('/llms-index.json')[0]); pages=[p for p in index['pages'] if p['slug']=='sdk' or p['slug'].startswith('sdk/')]
sitemap=get('/sitemap.xml')[0]; reading=get('/llms.txt')[0]; full=get('/llms-full.txt')[0]
root=Path(__file__).resolve().parents[1]
expected={str(p.parent.relative_to(root/'app/docs')) for p in (root/'app/docs/sdk').rglob('page.mdx')}
assert {p['slug'] for p in pages}==expected, 'SDK page/index drift'

def check(record):
    path='/docs/'+record['slug']; html,headers=get(path); md,md_headers=get(path+'.md')
    parsed=Page(); parsed.feed(html)
    canonical='https://docs.caveman.so'+path
    assert parsed.h1==1,(path,'h1 count',parsed.h1)
    assert parsed.canonical==canonical,(path,'canonical',parsed.canonical)
    assert canonical in sitemap and canonical in reading and canonical in full,(path,'machine link missing')
    assert 'TechArticle' in ''.join(parsed.jsonld) and 'BreadcrumbList' in ''.join(parsed.jsonld),(path,'structured metadata')
    for heading in record['headings']:
        assert heading['anchor'] in parsed.ids,(path,'missing rendered anchor',heading['anchor'])
    assert 'markdown' in md_headers.get('Content-Type',md_headers.get('content-type','')),(path,'Markdown content type')
    source=(root/'app/docs'/record['slug']/'page.mdx').read_text()
    for code in re.findall(r'^```[^\n]*\n.*?^```',source,re.M|re.S):
        assert code in md,(path,'code differs in Markdown mirror')
    assert 'docMetadata' not in md and '<DocSchema' not in md,(path,'MDX metadata leaked')
    return {'slug':record['slug'],'headings':len(record['headings']),'passed':True}

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    result=list(pool.map(check,pages))
print(json.dumps({'origin':origin,'pages':len(result),'headings':sum(p['headings'] for p in result),'passed':True},indent=2))
