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
const arrow = '<span aria-hidden="true"> →</span>';
const titles = { home: 'Home', about: 'About', writing: 'Writing & Scripts', poetry: 'Poetry', video: 'On Screen' };
const routes = { home: 'index.html', about: 'about.html', writing: 'writing.html', poetry: 'poetry.html', video: 'videos.html' };

function portrait(person) {
  const url = safeUrl(person.photo);
  return `<figure class="portrait">${url
    ? `<img src="${escape(url)}" alt="${escape(person.photoAlt)}">`
    : `<span class="monogram" aria-hidden="true">${escape(person.monogram)}</span>`
  }</figure>`;
}

function pdfCard(item) {
  const url = safeUrl(item.pdf);
  if (!url) return '';
  return `<a class="card" href="${escape(url)}" data-pdf data-title="${escape(item.title)}">
    <span class="meta">${escape(item.type || 'Poem')}${item.year ? ` · ${escape(item.year)}` : ''}</span>
    <h3>${escape(item.title)}</h3>
    <p>${escape(item.description)}</p>
    <span class="arrow">Read${arrow}</span>
  </a>`;
}

function videoCard(item) {
  const id = youtubeId(item.url);
  if (!id) return '';
  return `<a class="card video-card" href="https://www.youtube.com/watch?v=${id}" data-video="${id}" data-title="${escape(item.title)}">
    <div class="video-cover">
      <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy">
      <span class="play" aria-hidden="true">▶</span>
    </div>
    <div class="video-body">
      <span class="meta">${escape(item.channel)}${item.year ? ` · ${escape(item.year)}` : ''}</span>
      <h3>${escape(item.title)}</h3>
      <span class="role">${escape(item.role)}</span>
      <p>${escape(item.contribution)}</p>
      <span class="arrow">Watch${arrow}</span>
    </div>
  </a>`;
}

function empty(title, description) {
  return `<div class="empty"><span class="empty-symbol" aria-hidden="true">✳</span><div><h2>${title}</h2><p>${description}</p></div></div>`;
}

function pageHero(label, title, description) {
  return `<div class="page-hero"><p class="eyebrow">${label}</p><h1>${title}</h1>${description ? `<p class="lead">${description}</p>` : ''}</div>`;
}

async function start() {
  const response = await fetch('./content.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('Content could not be loaded.');
  const content = await response.json();
  const person = content.person;

  document.title = `${titles[page]} — ${person.name}`;
  document.querySelector('meta[name="description"]').content = person.intro;
  document.querySelector('.brand').textContent = person.name.toLocaleLowerCase('en');
  document.querySelector('.nav').innerHTML = Object.entries(routes)
    .filter(([key]) => key !== 'home')
    .map(([key, url]) => `<a href="${url}"${key === page ? ' aria-current="page"' : ''}>${titles[key]}</a>`)
    .join('');
  document.querySelector('.copyright').textContent = `© ${new Date().getFullYear()} ${person.name}`;
  document.querySelector('.social').innerHTML = person.links
    .filter(item => safeUrl(item.url))
    .map(item => `<a href="${escape(safeUrl(item.url))}" target="_blank" rel="noopener">${escape(item.title)}${arrow}</a>`)
    .join('');

  /* ── HOME ─────────────────────────────────────────────────── */
  if (page === 'home') {
    // Featured works — placeholder cards (3 items)
    const featuredWorks = content.featured || [];
    const workCards = featuredWorks.length
      ? featuredWorks.map((w, i) => {
          const num = String(i + 1).padStart(2, '0');
          const url = safeUrl(w.pdf || w.url || '');
          const tag = url ? `a` : `div`;
          const attrs = url ? ` href="${escape(url)}"${w.pdf ? ` data-pdf data-title="${escape(w.title)}"` : w.videoId ? ` data-video="${escape(w.videoId)}"` : ''}` : '';
          return `<${tag} class="work-card"${attrs}>
            <div class="work-card-num">${num}</div>
            <div class="work-card-label">${escape(w.type || 'Project')}</div>
            <h3>${escape(w.title)}</h3>
            <p>${escape(w.description || '')}</p>
            <span class="work-card-arrow">View work →</span>
          </${tag}>`;
        }).join('')
      : [
          ['01', 'Script', 'Featured Work', 'Coming soon — a screenplay or project to be added here.'],
          ['02', 'Essay', 'Featured Work', 'Coming soon — a piece of writing to be added here.'],
          ['03', 'Project', 'Featured Work', 'Coming soon — a collaboration or production to be added here.'],
        ].map(([num, label, title, desc]) =>
          `<div class="work-card work-card-placeholder">
            <div class="work-card-num">${num}</div>
            <div class="work-card-label">${label}</div>
            <h3>${title}</h3>
            <p>${desc}</p>
          </div>`
        ).join('');

    main.innerHTML = `
      <section class="shell">
        <div class="hero">
          <p class="hero-tag">Narrative Consultant &amp; Writer</p>
          <h1>${escape(person.headline)}</h1>
          <div class="hero-bottom">
            <p class="hero-intro">${escape(person.intro)}</p>
            <div class="hero-cta">
              <a class="button primary" href="about.html">About me${arrow}</a>
              <a class="button secondary" href="writing.html">My work${arrow}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="featured-label">
        <div class="shell">
          <div class="section-header">
            <p class="section-label" id="featured-label">Selected Work</p>
            <span class="section-num">01 — 03</span>
          </div>
          <div class="work-grid">${workCards}</div>
        </div>
      </section>

      <section class="section" aria-labelledby="explore-label">
        <div class="shell">
          <div class="section-header">
            <p class="section-label" id="explore-label">Explore</p>
          </div>
          <div class="nav-grid">
            ${[
              ['01', 'Writing &amp; Scripts', 'From a thought to a story. Essays, screenplays and scripts.', 'writing.html', 'Read'],
              ['02', 'Poetry', 'Sometimes a few lines hold everything that matters.', 'poetry.html', 'Read'],
              ['03', 'On Screen', 'Productions and YouTube projects I have contributed to.', 'videos.html', 'Watch'],
            ].map(([num, title, text, url, cta]) =>
              `<a class="nav-card" href="${url}">
                <div class="nav-card-num">${num}</div>
                <h3>${title}</h3>
                <p>${text}</p>
                <span class="nav-card-link">${cta}${arrow}</span>
              </a>`
            ).join('')}
          </div>
        </div>
      </section>

      <section class="contact-section" aria-labelledby="contact-label">
        <div class="shell">
          <div class="contact-inner">
            <div class="contact-left">
              <p class="section-label" id="contact-label">Get in Touch</p>
              <h2 class="contact-big-title">Let's work on something <em>worth telling</em>.</h2>
              <p class="contact-desc">Have a project in mind? Want to collaborate on a script, campaign or narrative? I'd love to hear from you.</p>
              <a class="button secondary" href="about.html">More about me${arrow}</a>
            </div>
            <div class="contact-right">
              ${person.email ? `<div class="contact-item">
                <div class="contact-item-label">Email</div>
                <div class="contact-item-value"><a href="mailto:${escape(person.email)}">${escape(person.email)}</a></div>
              </div>` : ''}
              ${person.phone ? `<div class="contact-item">
                <div class="contact-item-label">Phone</div>
                <div class="contact-item-value"><a href="tel:${escape(person.phone)}">${escape(person.phone)}</a></div>
              </div>` : ''}
              ${person.links.filter(l => safeUrl(l.url)).map(l =>
                `<div class="contact-item">
                  <div class="contact-item-label">${escape(l.title)}</div>
                  <div class="contact-item-value"><a href="${escape(safeUrl(l.url))}" target="_blank" rel="noopener">${escape(l.title)}</a></div>
                </div>`
              ).join('')}
            </div>
          </div>
        </div>
      </section>
    `;

  /* ── ABOUT ────────────────────────────────────────────────── */
  } else if (page === 'about') {
    const cv = safeUrl(person.resumePdf);
    main.innerHTML = `
      <div class="shell">
        <div class="about-layout">
          ${portrait(person)}
          <section>
            <p class="about-tag">About</p>
            <h2 class="about-title">${escape(person.aboutHeadline || person.name)}</h2>
            <div class="prose">${person.biography.map(p => `<p>${escape(p)}</p>`).join('')}</div>
            ${cv ? `<a class="button secondary resume" href="${escape(cv)}" data-pdf data-title="CV — ${escape(person.name)}">Read my CV${arrow}</a>` : ''}
            <div class="exp-section">
              <h2>Experience</h2>
              ${person.experience.length
                ? person.experience.map(item => `
                  <article class="experience">
                    <span class="exp-period">${escape(item.period)}</span>
                    <div>
                      <h3>${escape(item.title)}</h3>
                      <p>${escape(item.description)}</p>
                    </div>
                  </article>`).join('')
                : `<p class="lead" style="border-top:1px solid var(--line);padding-top:24px">More about my journey, coming soon.</p>`
              }
            </div>
          </section>
        </div>
      </div>
    `;

  /* ── WRITING / POETRY ─────────────────────────────────────── */
  } else if (page === 'writing' || page === 'poetry') {
    const poetry = page === 'poetry';
    const items = (poetry ? content.poetry : content.writing).filter(item => safeUrl(item.pdf));
    main.innerHTML = `<div class="shell">` + (poetry
      ? pageHero('Verse', 'Few words.<br>Deep feelings.', 'Poems to pause with, feel, and return to.')
      : pageHero('Words', 'Between the pages.', 'Writing and scripts. Open a title and turn the pages at your own pace.'));
    if (!poetry && items.length) {
      main.insertAdjacentHTML('beforeend', '<div class="filters" role="group" aria-label="Filter by category"><button class="filter" data-filter="All" aria-pressed="true">All</button><button class="filter" data-filter="Essay" aria-pressed="false">Essays</button><button class="filter" data-filter="Script" aria-pressed="false">Scripts</button></div>');
    }
    main.insertAdjacentHTML('beforeend',
      `<div id="works">${items.length ? `<div class="grid">${items.map(pdfCard).join('')}</div>` : empty(poetry ? 'A home for the verses.' : 'Making room for new stories.', poetry ? 'New poems will appear here as they are added.' : 'New writing and scripts will find their place in this library.')}</div></div>`
    );
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      const filtered = items.filter(item => button.dataset.filter === 'All' || item.type === button.dataset.filter);
      document.querySelector('#works').innerHTML = filtered.length
        ? `<div class="grid">${filtered.map(pdfCard).join('')}</div>`
        : empty('Nothing here just yet.', 'New work in this category will appear here.');
    }));

  /* ── VIDEO ────────────────────────────────────────────────── */
  } else if (page === 'video') {
    const videos = content.videos.filter(item => youtubeId(item.url));
    main.innerHTML = `<div class="shell">` + pageHero('Frame', 'On the other side of the screen.', 'Productions and YouTube projects I have contributed to.')
      + (videos.length ? `<div class="grid">${videos.map(videoCard).join('')}</div>` : empty('The curtain opens soon.', 'Videos and projects I have contributed to will come together here.'))
      + '</div>';
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
  main.innerHTML = '<div class="shell"><div class="notice"><h1>Something went wrong.</h1><p>The page content could not be loaded. Please refresh and try again.</p></div></div>';
});
