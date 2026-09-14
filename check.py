import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'content.json').read_text(encoding='utf-8-sig'))


def fields(item, required):
    for key in required:
        assert isinstance(item.get(key), str) and item[key].strip(), f'Missing field: {key}'


def local_file(value, suffixes):
    if not value:
        return
    path = (ROOT / value).resolve()
    assert path.is_relative_to(ROOT) and path.is_file(), f'File not found: {value}'
    assert path.suffix.lower() in suffixes, f'Invalid file type: {value}'


person = data['person']
fields(person, ['name', 'monogram', 'headline', 'intro', 'photoAlt'])
assert isinstance(person['biography'], list) and all(isinstance(p, str) for p in person['biography'])
local_file(person['photo'], {'.jpg', '.jpeg', '.png', '.webp', '.avif'})
local_file(person['resumePdf'], {'.pdf'})
for item in person['experience']:
    fields(item, ['period', 'title', 'description'])
for item in person['links']:
    fields(item, ['title', 'url'])
    assert urlparse(item['url']).scheme in ('https', 'http'), 'Links must use http:// or https://'
for key in ['writing', 'poetry']:
    assert isinstance(data[key], list)
    for item in data[key]:
        fields(item, ['title', 'pdf'])
        if key == 'writing':
            assert item.get('type') in ('Essay', 'Script'), 'Type must be Essay or Script'
        local_file(item['pdf'], {'.pdf'})
        assert (ROOT / item['pdf']).read_bytes().startswith(b'%PDF-'), 'Invalid PDF'
for item in data['videos']:
    fields(item, ['title', 'url', 'channel', 'role', 'contribution'])
    assert re.fullmatch(r'https?://(?:(?:www\.|m\.)?youtube\.com/(?:watch\?v=|shorts/|live/|embed/)|youtu\.be/)[\w-]{11}(?:[?&#].*)?', item['url']), 'Invalid YouTube URL'
for name in ['index.html', 'about.html', 'writing.html', 'poetry.html', 'videos.html']:
    html = (ROOT / name).read_text(encoding='utf-8')
    assert '<html lang="en">' in html and 'name="viewport"' in html
    for asset in re.findall(r'(?:src|href)="(assets/[^"]+)"', html):
        assert (ROOT / asset).is_file(), f'Missing asset: {asset}'
print('OK: content, files and 5 pages validated.')
