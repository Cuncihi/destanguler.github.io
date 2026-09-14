# Destan Güler

GitHub Pages üzerinde çalışan statik portfolyo. Kurulum veya derleme gerekmez.

## İçerik ekleme

Metinler ve kayıtlar `icerik.json` içinde. Fotoğraf ve PDF dosyalarını `dosyalar/` klasörüne koy; dosya adlarında boşluk ve Türkçe karakter kullanma.

- **Hakkımda:** `kisi` altındaki metinleri düzenle. `fotograf` ve `ozgecmisPdf` alanlarına dosya yolunu yaz; boş bırakılan alanlar gösterilmez. `biyografi` içindeki her metin bir paragraftır.
- **Özgeçmiş:** `deneyimler` listesine `{"donem":"2024–2026","baslik":"Görev / kurum","aciklama":"Kısa açıklama"}` ekle.
- **Yazı / senaryo:** `yazilar` listesinde mevcut kaydı kopyala; `tur` değeri `Yazı` veya `Senaryo` olmalı.
- **Şiir:** `siirler` listesine `{"baslik":"Şiirin adı","aciklama":"Kısa açıklama","pdf":"dosyalar/siir.pdf"}` ekle.
- **Video:** `videolar` listesindeki kaydı kopyala. `url` YouTube bağlantısı, `rol` projedeki görevin (örneğin `Danışman`), `katki` ise yaptığın işin kısa açıklaması.
- **Bağlantı:** `kisi.baglantilar` listesine `{"baslik":"Instagram","url":"https://..."}` ekle.

Yeni kayıtları virgülle ayır. Liste sırası sayfadaki sıradır. Kullanılmayan listeler `[]` kalabilir. PDF’leri aynı depoda tut.

## Önizleme

Repo klasöründe `python -m http.server 8000` çalıştır; `http://localhost:8000` adresini aç. Dosyaya çift tıklamak yerine bu adresi kullan.

`python check.py` içerik alanlarını, yerel dosyaları ve bağlantı biçimlerini kontrol eder. `main` dalına push sonrası mevcut GitHub Pages yayını güncellenir.

Sayfalar ortak `assets/site.css` ve `assets/app.js` kullanır. `assets/reader.js` PDF’yi site içindeki pencerede tarayıcının kendi okuyucusuyla gösterir; yeni sekmede açma ve indirme bağlantıları da vardır. YouTube oynatıcısı videoya tıklandığında yüklenir. Harici JavaScript bağımlılığı yoktur.
