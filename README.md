# Destan Guler

A static portfolio for GitHub Pages. No build step required.

## Update content

Edit `content.json`. Put photos and PDFs in `files/`, using lowercase English filenames without spaces.

- **About:** edit `person`. Set `photo` and `resumePdf` to file paths, or leave them empty to hide them. Each `biography` entry is a paragraph.
- **Experience:** add `{"period":"2024–2026","title":"Role / organization","description":"A short description"}` to `person.experience`.
- **Writing:** copy an entry in `writing`. Use `Essay` or `Script` for `type`.
- **Poetry:** add `{"title":"Poem title","description":"A short description","pdf":"files/poem.pdf"}` to `poetry`.
- **Videos:** copy an entry in `videos`. Set the YouTube `url`, your `role` (for example, `Consultant`), and your `contribution`.
- **Links:** add `{"title":"Instagram","url":"https://..."}` to `person.links`.

Separate entries with commas. List order determines display order. Empty lists can remain `[]`. Keep PDFs in this repository.

## Preview and checks

Run `python -m http.server 8000` in the repository and open `http://localhost:8000`. Use this address instead of opening HTML files directly.

Run `python check.py` to validate content and local files. With Playwright and Edge installed, run `node tests/reader.cjs` for browser checks; it starts its own local server. A push to `main` updates GitHub Pages.

## Structure

`index.html`, `about.html`, `writing.html`, `poetry.html`, and `videos.html` share `assets/site.css` and `assets/app.js`. The PDF reader loads PDF.js 6.3.289 from a CDN on demand. Local StPageFlip 2.0.7 (MIT) provides page curling; its animation-frame and resize-listener cleanup is patched. Only the current page and two pages on either side are rendered. Keyboard navigation, zoom, text view, reduced motion, and direct PDF links are supported. YouTube players load when clicked.
