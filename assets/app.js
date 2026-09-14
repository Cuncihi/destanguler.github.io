const main = document.querySelector('main');
const page = document.body.dataset.page;
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function safeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value, location.href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
function youtubeId(value) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    const host = url.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com', 'm.youtube.com'].includes(host)
      ? (url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1]) : '';
    return /^[\w-]{11}$/.test(id || '') ? id : '';
  } catch { return ''; }
}
const arrow = '<span aria-hidden="true">↗</span>';
const titles = { home: 'Home', about: 'About', writing: 'Writing & scripts', poetry: 'Poetry', video: 'On screen' };
const routes = { home: 'index.html', about: 'about.html', writing: 'writing.html', poetry: 'poetry.html', video: 'videos.html' };
function intro(label, title, description) {
  return `<div class="page-intro"><p class="eyebrow">${label}</p><h1>${title}</h1><p class="lead">${description}</p></div>`;
}
function empty(title, description) {
  return `<div class="empty"><span class="empty-symbol" aria-hidden="true">✳</span><div><h2>${title}</h2><p>${description}</p></div></div>`;
}
function portrait(person) {
  const url = safeUrl(person.photo);
  return `<figure class="portrait">${url ? `<img src="${escape(url)}" alt="${escape(person.photoAlt)}">` : `<span class="monogram" aria-hidden="true">${escape(person.monogram)}</span><small aria-hidden="true">BETWEEN THE LINES</small>`}</figure>`;
}
function pdfCard(item) {
  const url = safeUrl(item.pdf);
  if (!url) return '';
  return `<a class="card" href="${escape(url)}" data-pdf data-title="${escape(item.title)}"><span class="meta">${escape(item.type || 'Poem')} ${item.year ? `· ${escape(item.year)}` : ''}</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><span class="arrow">Start reading ${arrow}</span></a>`;
}
function videoCard(item) {
  const id = youtubeId(item.url);
  if (!id) return '';
  return `<a class="card video-card" href="https://www.youtube.com/watch?v=${id}" data-video="${id}" data-title="${escape(item.title)}"><div class="video-cover"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><span class="play" aria-hidden="true">▶</span></div><div class="video-body"><span class="meta">${escape(item.channel)}${item.year ? ` · ${escape(item.year)}` : ''}</span><h3>${escape(item.title)}</h3><span class="role">${escape(item.role)}</span><p>${escape(item.contribution)}</p><span class="arrow">Watch video ${arrow}</span></div></a>`;
}
async function start() {
  const response = await fetch('./content.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Content could not be loaded.');
  const content = await response.json();
  const person = content.person;
  document.title = `${titles[page]} — ${person.name}`;
  document.querySelector('meta[name="description"]').content = person.intro;
  document.querySelector('.brand').textContent = person.name.toLocaleLowerCase('en');
  document.querySelector('.nav').innerHTML = Object.entries(routes).filter(([key]) => key !== 'home').map(([key, url]) => `<a href="${url}"${key === page ? ' aria-current="page"' : ''}>${titles[key]}</a>`).join('');
  document.querySelector('.copyright').textContent = `© ${new Date().getFullYear()} ${person.name}`;
  document.querySelector('.social').innerHTML = person.links.filter(item => safeUrl(item.url)).map(item => `<a href="${escape(safeUrl(item.url))}">${escape(item.title)} ${arrow}</a>`).join('');
  if (page === 'home') {
    main.innerHTML = `<section class="hero"><div><p class="eyebrow">${escape(person.name)} / Personal space</p><h1>${escape(person.headline)}</h1><p class="lead">${escape(person.intro)}</p><a class="button" href="about.html">A little about me ${arrow}</a></div>${portrait(person)}</section><section aria-labelledby="explore"><div class="section-top"><h2 id="explore">Read a little. Explore a little.</h2><span>01 — 03</span></div><div class="grid">${[
      ['01 / WORDS', 'Writing & scripts', 'From a thought to a story. A journey through the pages.', 'writing.html'],
      ['02 / VERSE', 'Poetry', 'Sometimes a few lines are all a feeling needs.', 'poetry.html'],
      ['03 / FRAME', 'On screen', 'YouTube videos and projects I have contributed to as a consultant.', 'videos.html']
    ].map(([label, title, text, url]) => `<a class="card" href="${url}"><span class="meta">${label}</span><h3>${title}</h3><p>${text}</p><span class="arrow">Explore ${arrow}</span></a>`).join('')}</div></section>`;
  } else if (page === 'about') {
    const cv = safeUrl(person.resumePdf);
    main.innerHTML = `<div class="about">${portrait(person)}<section>${intro('A closer look', escape(person.name), '')}<div class="prose">${person.biography.map(p => `<p>${escape(p)}</p>`).join('')}</div>${cv ? `<a class="button secondary" href="${escape(cv)}" data-pdf data-title="Experience & CV">Read my CV ${arrow}</a>` : ''}<section class="resume"><h2>Experience & CV</h2>${person.experience.length ? person.experience.map(item => `<article class="experience"><span class="meta">${escape(item.period)}</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p></article>`).join('') : '<p class="lead">More about my journey, coming soon.</p>'}</section></section></div>`;
  } else if (page === 'writing' || page === 'poetry') {
    const poetry = page === 'poetry';
    const items = (poetry ? content.poetry : content.writing).filter(item => safeUrl(item.pdf));
    main.innerHTML = poetry ? intro('Verse', 'Few words. Deep feelings.', 'Poems to pause with, feel, and return to.') : intro('Words', 'Between the pages.', 'Writing and scripts. Open a title and turn the pages at your own pace.');
    if (!poetry && items.length) main.insertAdjacentHTML('beforeend', '<div class="filters" role="group" aria-label="Writing category"><button class="filter" data-filter="All" aria-pressed="true">All</button><button class="filter" data-filter="Essay" aria-pressed="false">Essays</button><button class="filter" data-filter="Script" aria-pressed="false">Scripts</button></div>');
    main.insertAdjacentHTML('beforeend', `<div id="works">${items.length ? `<div class="grid">${items.map(pdfCard).join('')}</div>` : empty(poetry ? 'A home for the verses.' : 'Making room for new stories.', poetry ? 'New poems will appear here as they are added.' : 'New writing and scripts will find their place in this library.')}</div>`);
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      const filtered = items.filter(item => button.dataset.filter === 'All' || item.type === button.dataset.filter);
      document.querySelector('#works').innerHTML = filtered.length ? `<div class="grid">${filtered.map(pdfCard).join('')}</div>` : empty('Nothing here just yet.', 'New work in this category will appear here.');
    }));
  } else if (page === 'video') {
    const videos = content.videos.filter(item => youtubeId(item.url));
    main.innerHTML = intro('Frame', 'On the other side of the screen.', 'YouTube videos and my consulting work. Every project has a story behind it.') + (videos.length ? `<div class="grid">${videos.map(videoCard).join('')}</div>` : empty('The curtain opens soon.', 'Videos and projects I have contributed to will come together here.'));
  }
}
document.addEventListener('click', async event => {
  const link = event.target.closest('a[data-pdf], a[data-video]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  if (link.hasAttribute('data-pdf')) {
    try {
      const reader = await import('./reader.js?v=paper-2');
      reader.openPdf(link.href, link.dataset.title);
    } catch { location.href = link.href; }
  } else {
    const dialog = document.querySelector('#video-dialog');
    document.querySelector('#video-title').textContent = link.dataset.title;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${link.dataset.video}`;
    iframe.title = link.dataset.title;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    dialog.querySelector('.video-frame').replaceChildren(iframe);
    dialog.querySelector('.external-video').href = link.href;
    dialog.showModal();
  }
});
const videoDialog = document.querySelector('#video-dialog');
videoDialog.querySelector('button').addEventListener('click', () => videoDialog.close());
videoDialog.addEventListener('close', () => videoDialog.querySelector('.video-frame').replaceChildren());
start().catch(() => {
  main.innerHTML = '<div class="notice"><h1>Something went wrong.</h1><p>The page content could not be loaded. Please refresh and try again.</p></div>';
});
