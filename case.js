// Renders case-study.html?project=<slug> from content.js
(function () {
  'use strict';
  const C = window.CONTENT, root = document.getElementById('cs');
  if (!C || !root) return;
  const items = C.caseStudies.items;
  const slug = new URLSearchParams(location.search).get('project');
  const idx = items.findIndex(p => p.slug === slug);

  if (idx < 0) {   // unknown / missing slug → simple chooser
    document.title = 'Case studies · Shubhangi Sharma';
    root.innerHTML = `<section class="cs-hero"><a class="cs-back" href="index.html#projects">&larr; All projects</a>
      <p class="eyebrow">case studies</p><h1>Pick a project</h1>
      <div class="cs-pick">${items.map(p => `<a href="case-study.html?project=${p.slug}">${p.title}</a>`).join('')}</div></section>`;
    return;
  }

  const p = items[idx], d = (C.caseDetails || {})[p.slug] || {};
  const next = items[(idx + 1) % items.length];
  document.title = p.title + ' · Case study · Shubhangi Sharma';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const para = s => /^TODO:/.test(s)
    ? `<p class="todo"><span>to write</span>${esc(s.replace(/^TODO:\s*/, ''))}</p>`
    : `<p>${esc(s)}</p>`;
  const ph = (src, label) => `<div class="cs-ph"><svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><rect x="1" y="3" width="22" height="18" fill="none" stroke="currentColor" stroke-width="2"/><rect x="15" y="6" width="3" height="3" fill="currentColor"/><path d="M3 19 9 11l4 5 3-3 5 6z" fill="currentColor"/></svg><em>${label}</em></div>${src ? `<img src="${src}" alt="" onerror="this.remove()">` : ''}`;

  const meta = Object.entries(d.meta || {}).map(([k, v]) => `<div class="cs-m"><b>${k}</b><span class="${/^TODO:/.test(v) ? 'todo-inline' : ''}">${esc(v.replace(/^TODO:\s*/, ''))}</span></div>`).join('');
  const out = p.outcome || {};
  const metrics = (out.metrics || []).map(m => `<div class="cs-metric"><b>${m.n}</b><span>${m.t}</span></div>`).join('');
  const notes = (out.notes || []).map(n => `<li>${n}</li>`).join('');
  const steps = (d.process || []).map((s, i) => `<li><span class="cs-step">${i + 1}</span><div><h3>${s.title}</h3><p>${esc(s.text)}</p></div></li>`).join('');
  const gallery = [1, 2, 3].map(n => `<figure class="cs-shot">${ph('img/projects/' + p.slug + '-' + n + '.jpg', p.slug + '-' + n + '.jpg')}</figure>`).join('');

  const sections = [
    ['overview', 'Overview', (d.overview || []).map(para).join('')],
    ['problem', 'The problem', (d.problem || []).map(para).join('')],
    ['process', 'Process', `<ol class="cs-steps">${steps}</ol>`],
    ['solution', 'The solution', (d.solution || []).map(para).join('') + `<div class="cs-gallery">${gallery}</div>`],
    ['outcomes', out.heading || 'Outcomes', (metrics ? `<div class="cs-metrics">${metrics}</div>` : '') + (notes ? `<ul class="cs-notes">${notes}</ul>` : '')],
    ['reflection', 'Reflection', (d.reflection || []).map(para).join('')]
  ];

  root.innerHTML = `
    <section class="cs-hero" style="--c1:${p.c1};--c2:${p.c2}">
      <div class="cs-hero-in">
        <a class="cs-back" href="index.html#projects">&larr; All projects</a>
        <p class="eyebrow">${p.tag}</p>
        <h1>${p.title}</h1>
        <p class="cs-lead">${esc(p.sub)}</p>
        ${p.framer ? `<a class="cs-ext" href="${p.framer}" target="_blank" rel="noopener">Read the full write-up &nearr;</a>` : ''}
        <div class="cs-meta">${meta}</div>
      </div>
    </section>
    <div class="cs-cover" style="--c1:${p.c1};--c2:${p.c2}">${ph(p.image, (p.image || '').split('/').pop() || 'cover')}</div>
    <div class="cs-body">
      <nav class="cs-toc" aria-label="On this page"><h4>On this page</h4>${sections.map((s, i) => `<a href="#${s[0]}"><i>0${i + 1}</i>${s[1]}</a>`).join('')}</nav>
      <div class="cs-sections">${sections.map((s, i) => `<section id="${s[0]}" class="cs-sec"><p class="cs-num">0${i + 1}</p><h2>${s[1]}</h2>${s[2]}</section>`).join('')}</div>
    </div>
    <section class="cs-next">
      <p class="eyebrow">next case study</p>
      <a class="cs-next-card" href="case-study.html?project=${next.slug}" style="--c1:${next.c1};--c2:${next.c2}">
        <span class="cs-next-art">${next.emoji}</span>
        <span class="cs-next-txt"><b>${next.title}</b><span>${esc(next.sub)}</span></span>
        <span class="cs-next-go">View &rarr;</span>
      </a>
    </section>`;

  // highlight the current section in the table of contents
  const links = [...document.querySelectorAll('.cs-toc a')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('.cs-sec').forEach(s => io.observe(s));
})();
