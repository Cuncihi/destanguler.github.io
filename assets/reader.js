document.body.insertAdjacentHTML('beforeend', `
  <dialog class="reader" aria-labelledby="reader-title">
    <div class="dialog-bar"><h2 id="reader-title"></h2><button class="icon-button" id="reader-close" aria-label="Okuyucuyu kapat" autofocus>✕</button></div>
    <div class="reader-tools"><a id="original-pdf" target="_blank" rel="noopener">PDF’yi yeni sekmede aç ↗</a><a id="download-pdf" download>İndir ↓</a></div>
    <div class="pdf-frame"></div>
    <p class="reader-message">PDF görünmüyorsa yeni sekmede açabilir veya indirebilirsin.</p>
  </dialog>`);
const dialog = document.querySelector('.reader');
const frame = dialog.querySelector('.pdf-frame');

export function openPdf(url, title) {
  if (dialog.open) return;
  dialog.querySelector('#reader-title').textContent = title;
  dialog.querySelector('#original-pdf').href = url;
  dialog.querySelector('#download-pdf').href = url;
  const iframe = document.createElement('iframe');
  iframe.src = `${url}#view=Fit&zoom=page-fit`;
  iframe.title = `${title} — PDF`;
  frame.replaceChildren(iframe);
  dialog.showModal();
}

dialog.querySelector('#reader-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => frame.replaceChildren());
