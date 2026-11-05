// Projects section: voxel "computer glasses" + the 4 case-study cards.
(function () {
  'use strict';
  const C = window.CONTENT;

  /* ------------------------------------------------------------------ cards */
  const grid = document.getElementById('projGrid');
  const subEl = document.getElementById('projSub'); if (subEl && C.caseStudies) subEl.textContent = C.caseStudies.intro;
  if (grid && C && C.caseStudies) {
    const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="square"/></svg>';
    grid.innerHTML = C.caseStudies.items.map((p, i) => {
      const art = `<span class="pcard-ph"><svg viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true"><rect x="1" y="3" width="22" height="18" fill="none" stroke="currentColor" stroke-width="2"/><rect x="15" y="6" width="3" height="3" fill="currentColor"/><path d="M3 19 9 11l4 5 3-3 5 6z" fill="currentColor"/></svg><em>${(p.image || '').split('/').pop() || 'image'}</em></span>${p.image ? `<img src="${p.image}" alt="${p.title}" onerror="this.remove()">` : ''}`;
      const metrics = (p.outcome.metrics || []).map(m => `<div class="pm"><b>${m.n}</b><span>${m.t}</span></div>`).join('');
      const notes = (p.outcome.notes || []).map(n => `<li>${n}</li>`).join('');
      return `<article class="pcard" tabindex="0" style="--c1:${p.c1};--c2:${p.c2}">
        <div class="pbub" role="tooltip">
          <div class="pbub-h">${p.outcome.heading}</div>
          ${metrics ? `<div class="pms">${metrics}</div>` : ''}
          ${notes ? `<ul>${notes}</ul>` : ''}
        </div>
        <div class="pcard-img">${art}<span class="pcard-tag">${p.tag}</span></div>
        <div class="pcard-body">
          <h3>${p.title}</h3>
          <p class="pcard-sub">${p.sub}</p>
          <a class="pcard-btn" href="${p.link || ('case-study.html?project=' + p.slug)}" data-case="${i}">View case study ${arrow}</a>
        </div>
      </article>`;
    }).join('');

    const toast = document.getElementById('toast');
    let tt;
    grid.addEventListener('click', e => {
      const a = e.target.closest('.pcard-btn'); if (!a) return;
      const it = C.caseStudies.items[+a.dataset.case];
      if (!it.link && !it.slug) {   // only when there is nowhere to go
        e.preventDefault();
        toast.textContent = 'Case study coming soon ✨';
        toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2200);
      }
    });
  }

  /* ---------------------------------------------------------------- glasses */
  const cv = document.getElementById('glasses');
  if (!cv || !window.THREE) return;
  const PI = Math.PI, W = 240, H = 130;
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const hh = 5.7, asp = W / H;
  const camera = new THREE.OrthographicCamera(-hh * asp, hh * asp, hh, -hh, -100, 200);
  camera.position.set(40, 30, 40); camera.lookAt(0, 1.9, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xf0ddf2, 0.75));
  const sun = new THREE.DirectionalLight(0xfff3e4, 0.55);
  sun.position.set(22, 26, 9); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 90 });
  sun.shadow.bias = -0.0008; scene.add(sun);

  function pixTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
  }
  const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const noise = pixTex(8, 8, g => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = rnd() < .14 ? 215 : 232 + Math.floor(rnd() * 23); px(g, `rgb(${v},${v},${v})`, x, y); } });
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
  const cache = {};
  const lam = c => cache[c] || (cache[c] = new THREE.MeshLambertMaterial({ color: c, map: noise }));
  function geo(sx, sy, sz) {
    const g = new THREE.BoxGeometry(sx, sy, sz), uv = g.attributes.uv;
    const d = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const n = f * 4 + i; uv.setXY(n, uv.getX(n) * d[f][0] * .6, uv.getY(n) * d[f][1] * .6); }
    return g;
  }
  const model = new THREE.Group(), spin = new THREE.Group(); spin.add(model); scene.add(spin);
  const B = (x, y, z, sx, sy, sz, c, mat) => {
    const m = new THREE.Mesh(geo(sx, sy, sz), mat || lam(c));
    m.position.set(x + sx / 2, y + sy / 2, z + sz / 2); m.castShadow = true; m.receiveShadow = true; model.add(m); return m;
  };

  const FR = '#26233a', FR2 = '#3b3754', LENS = '#cfe9ff';
  // two rectangular lens frames (hollow), 6 wide x 4.6 tall, gap 1.6 for the bridge
  for (const x0 of [-6.8, 0.8]) {
    B(x0, 3.8, 0, 6, 0.8, 1, FR);            // top rim
    B(x0, 0, 0, 6, 0.8, 1, FR);              // bottom rim
    B(x0, 0.8, 0, 0.8, 3, 1, FR);            // left rim
    B(x0 + 5.2, 0.8, 0, 0.8, 3, 1, FR);      // right rim
    B(x0 + 0.1, 4.6, 0.1, 5.8, 0.25, 0.8, FR2);   // soft highlight on top
    B(x0 + 0.8, 0.8, 0.3, 4.4, 3, 0.35, LENS);    // blue-light lens
  }
  // glints on lenses (white pixels) — animated sparkle
  const glints = [];
  for (const [x, y] of [[-5.6, 3.1], [-4.6, 2.5], [2.0, 3.1], [3.0, 2.5]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.1), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
    m.position.set(x, y, 0.7); model.add(m); glints.push(m);
  }
  B(-0.8, 2.7, 0, 1.6, 0.8, 1, FR);          // bridge
  // temples (arms) going back + little pink hinge dots
  for (const x0 of [-7.6, 6.8]) {
    B(x0, 3.2, -8, 0.8, 0.8, 8.2, FR);
    B(x0, 2.6, -8, 0.8, 0.9, 1.4, FR2);      // ear tip
  }
  for (const x of [-7.0, 6.8]) B(x, 3.3, 0.4, 0.2, 0.6, 0.6, '#ff9ab8');

  let on = true;
  new IntersectionObserver(e => { on = e[0].isIntersecting; }, { threshold: 0 }).observe(cv);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!on) return;
    const t = now / 1000;
    spin.rotation.y = PI / 4 + Math.sin(t * 0.8) * 0.3;
    model.position.y = Math.sin(t * 1.9) * 0.25;
    glints.forEach((g, i) => { g.visible = ((Math.floor(t * 1.4) + i) % 4) !== 0; });
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
