import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
data = json.loads((ROOT / 'icerik.json').read_text(encoding='utf-8-sig'))


def fields(item, required):
    for key in required:
        assert isinstance(item.get(key), str) and item[key].strip(), f'Eksik alan: {key}'


def local_file(value, suffixes):
    if not value:
        return
    path = (ROOT / value).resolve()
    assert path.is_relative_to(ROOT) and path.is_file(), f'Dosya bulunamadı: {value}'
    assert path.suffix.lower() in suffixes, f'Dosya türü geçersiz: {value}'


person = data['kisi']
fields(person, ['ad', 'monogram', 'giris', 'tanitim', 'fotografAciklamasi'])
assert isinstance(person['biyografi'], list) and all(isinstance(p, str) for p in person['biyografi'])
local_file(person['fotograf'], {'.jpg', '.jpeg', '.png', '.webp', '.avif'})
local_file(person['ozgecmisPdf'], {'.pdf'})
for item in person['deneyimler']:
    fields(item, ['donem', 'baslik', 'aciklama'])
for item in person['baglantilar']:
    fields(item, ['baslik', 'url'])
    assert urlparse(item['url']).scheme in ('https', 'http'), 'Bağlantı https:// ile başlamalı'
for key in ['yazilar', 'siirler']:
    assert isinstance(data[key], list)
    for item in data[key]:
        fields(item, ['baslik', 'pdf'])
        if key == 'yazilar':
            assert item.get('tur') in ('Yazı', 'Senaryo'), 'Tür Yazı veya Senaryo olmalı'
        local_file(item['pdf'], {'.pdf'})
        assert (ROOT / item['pdf']).read_bytes().startswith(b'%PDF-'), 'Geçersiz PDF'
for item in data['videolar']:
    fields(item, ['baslik', 'url', 'kanal', 'rol', 'katki'])
    assert re.fullmatch(r'https?://(?:(?:www\.|m\.)?youtube\.com/(?:watch\?v=|shorts/|live/|embed/)|youtu\.be/)[\w-]{11}(?:[?&#].*)?', item['url']), 'Geçersiz YouTube bağlantısı'
for name in ['index.html', 'hakkimda.html', 'yazilar.html', 'siirler.html', 'videolar.html']:
    html = (ROOT / name).read_text(encoding='utf-8')
    assert '<html lang="tr">' in html and 'name="viewport"' in html
    for asset in re.findall(r'(?:src|href)="(assets/[^"]+)"', html):
        assert (ROOT / asset).is_file(), f'Eksik kaynak: {asset}'
print('OK: content, files and 5 pages validated.')
