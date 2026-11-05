// Testimonials cards + Extras cards, each Extras card with a floating voxel (Minecraft-style) icon.
(function () {
  'use strict';
  const C = window.CONTENT;
  if (!C) return;

  /* ------------------------------------------------------------------ footer */
  if (C.footer) {
    document.getElementById('footTag').textContent = C.footer.tagline;
    document.getElementById('footSocial').innerHTML = C.footer.socials.map(s => `<a href="${s.href}" target="_blank" rel="noopener">${s.label}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"/></svg></a>`).join('');
    document.getElementById('footCopy').textContent = '© ' + new Date().getFullYear() + ' Shubhangi Sharma · Built block by block in a tiny pixel room';
    const fr = document.getElementById('footResume');
    if (C.resume) { fr.href = C.resume.href; fr.setAttribute('download', C.resume.file); }
    document.getElementById('toTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ------------------------------------------------------------ testimonials */
  const tGrid = document.getElementById('testiGrid');
  if (tGrid && C.testimonials) {
    document.getElementById('testiSub').textContent = C.testimonials.intro;
    tGrid.innerHTML = C.testimonials.items.map(t => `
      <figure class="tcard">
        <span class="tq" aria-hidden="true">&ldquo;</span>
        <blockquote>${t.quote}</blockquote>
        <figcaption>
          <span class="tav" style="background:${t.color}"><b>${t.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</b>${t.photo ? `<img src="${t.photo}" alt="${t.name}" onerror="this.remove()">` : ''}</span>
          <span class="tmeta"><b>${t.name}</b><span>${t.role}</span></span>
        </figcaption>
      </figure>`).join('');
  }

  /* ------------------------------------------------------------------ extras */
  const xGrid = document.getElementById('extrasGrid');
  if (xGrid && C.extras) {
    document.getElementById('extrasSub').textContent = C.extras.intro;
    const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="square"/></svg>';
    xGrid.innerHTML = C.extras.items.map(x => `
      <article class="xcard" data-icon="${x.icon}" style="--accent:${x.accent}">
        <canvas class="xicon" width="200" height="180" aria-hidden="true"></canvas>
        <h3>${x.title}</h3>
        <div class="xhandle">${x.handle}</div>
        <p>${x.desc}</p>
        <a class="xbtn" href="${x.href}" target="_blank" rel="noopener">${x.button} ${arrow}</a>
      </article>`).join('');
  }

  if (!window.THREE) return;

  /* ---------------------------------------------------- voxel icon toolkit */
  const PI = Math.PI;
  function pixTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g);
    const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
  }
  let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const noise = pixTex(8, 8, g => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = rnd() < .13 ? 218 : 234 + Math.floor(rnd() * 21); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 1, 1); } });
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
  const cache = {};
  const lam = c => cache[c] || (cache[c] = new THREE.MeshLambertMaterial({ color: c, map: noise }));
  function geo(sx, sy, sz) {
    const g = new THREE.BoxGeometry(sx, sy, sz), uv = g.attributes.uv;
    const d = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const n = f * 4 + i; uv.setXY(n, uv.getX(n) * d[f][0] * .6, uv.getY(n) * d[f][1] * .6); }
    return g;
  }
  // rows: array of strings; pal: char -> colour; builds merged voxel runs, centred on x, base at y=0
  function voxels(group, rows, pal, depth, z0 = 0, dx = 0, dy = 0) {
    const R = rows.length, Cn = Math.max(...rows.map(r => r.length));
    rows.forEach((row, r) => {
      let c = 0;
      while (c < row.length) {
        const ch = row[c];
        if (ch === ' ' || !pal[ch]) { c++; continue; }
        let e = c; while (e + 1 < row.length && row[e + 1] === ch) e++;
        const w = e - c + 1;
        const m = new THREE.Mesh(geo(w, 1, depth), lam(pal[ch]));
        m.position.set(c - Cn / 2 + w / 2 + dx, R - 1 - r + 0.5 + dy, z0 + depth / 2);
        m.castShadow = true; m.receiveShadow = true; group.add(m);
        c = e + 1;
      }
    });
  }
  const grid = (w, h, fill = ' ') => Array.from({ length: h }, () => Array(w).fill(fill));
  const rect = (g, r0, c0, h, w, ch) => { for (let r = r0; r < r0 + h; r++) for (let c = c0; c < c0 + w; c++) g[r][c] = ch; };
  const toRows = g => g.map(r => r.join(''));

  // ---- Figma logo: five blocks (red, coral, purple, blue, green)
  function figma(group) {
    const g = grid(8, 12);
    rect(g, 0, 0, 4, 4, 'R'); g[0][0] = ' '; g[3][0] = ' ';          // top-left, rounded on the left
    rect(g, 0, 4, 4, 4, 'O'); g[0][7] = ' '; g[3][7] = ' ';          // top-right, rounded on the right
    rect(g, 4, 0, 4, 4, 'P'); g[4][0] = ' '; g[7][0] = ' ';          // middle-left
    rect(g, 4, 4, 4, 4, 'B'); g[4][4] = ' '; g[4][7] = ' '; g[7][4] = ' '; g[7][7] = ' ';   // middle-right circle
    rect(g, 8, 0, 4, 4, 'G'); g[8][0] = ' '; g[11][0] = ' ';         // bottom-left
    voxels(group, toRows(g), { R: '#f24e1e', O: '#ff7262', P: '#a259ff', B: '#1abcfe', G: '#0acf83' }, 2.4);
    return { h: 12, depth: 2.4 };
  }

  // ---- "coding" icon: a code window with </>
  function code(group) {
    const W = 14, H = 11, g = grid(W, H, 'D');
    g[0][0] = g[0][W - 1] = g[H - 1][0] = g[H - 1][W - 1] = ' ';
    rect(g, 0, 1, 2, W - 2, 'T');                                    // title bar
    g[0][2] = 'r'; g[0][4] = 'y'; g[0][6] = 'g';                    // window dots
    g[0][1] = g[0][3] = g[0][5] = g[0][7] = 'T';
    const put = (cells, ch) => cells.forEach(([r, c]) => { g[r][c] = ch; });
    put([[3, 4], [4, 3], [5, 2], [6, 2], [7, 3], [8, 4]], 'K');       // <
    put([[3, 8], [4, 7], [5, 7], [6, 6], [7, 6], [8, 5]], 'W');       // /
    put([[3, 9], [4, 10], [5, 11], [6, 11], [7, 10], [8, 9]], 'M');   // >
    // thicker strokes for readability
    put([[4, 4], [7, 4]], 'K'); put([[4, 10], [7, 10]], 'M');
    voxels(group, toRows(g), { D: '#2b2740', T: '#4a4468', r: '#ff7a8a', y: '#ffd666', g: '#6ff0a8', K: '#ff9ab8', W: '#ffffff', M: '#6ff0a8' }, 2.2);
    return { h: 11, depth: 2.2 };
  }

  // ---- newspaper icon
  function news(group) {
    const W = 12, H = 14;
    // sheet behind (offset) for a stacked-paper look
    const back = grid(W, H, 'S'); back[0][0] = back[0][W - 1] = back[H - 1][0] = back[H - 1][W - 1] = ' ';
    voxels(group, toRows(back), { S: '#e6dcc4' }, 0.9, -0.9, 1.1, -0.9);
    const g = grid(W, H, 'N');
    g[0][0] = g[H - 1][0] = g[H - 1][W - 1] = ' ';
    g[0][W - 1] = ' '; g[0][W - 2] = 'F'; g[1][W - 1] = 'F'; g[1][W - 2] = 'F';        // folded corner
    for (let c = 0; c < W; c++) { if (g[H - 1][c] !== ' ') g[H - 1][c] = 'E'; }          // bottom edge
    rect(g, 2, 2, 2, 8, 'K');                                                          // masthead
    rect(g, 5, 2, 4, 5, 'P'); g[6][3] = 'Y'; g[6][4] = 'Y'; g[8][2] = g[8][3] = g[8][4] = g[8][5] = g[8][6] = 'V'; g[7][5] = g[7][6] = 'V'; // photo with sun + hill
    for (let r = 5; r < 9; r += 1) { g[r][8] = 'L'; g[r][9] = 'L'; }                  // side text
    g[6][8] = g[6][9] = ' ';
    rect(g, 10, 2, 1, 8, 'L'); rect(g, 11, 2, 1, 6, 'L'); rect(g, 12, 2, 1, 7, 'L');   // body lines
    voxels(group, toRows(g), { N: '#fffdf6', F: '#d8d0bc', E: '#ece4d0', K: '#2b2740', P: '#ffb8cf', Y: '#fff0a0', V: '#ff8fb8', L: '#a9a2c0' }, 1.2);
    return { h: 14, depth: 1.2 };
  }
  const builders = { figma, code, news };

  /* ------------------------------------------------------- one mini scene per icon */
  const icons = [];
  document.querySelectorAll('.xcard').forEach(card => {
    const cv = card.querySelector('.xicon'), build = builders[card.dataset.icon];
    if (!cv || !build) return;
    const Wd = 200, Hd = 180;
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(Wd, Hd, false);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const asp = Wd / Hd, hh = 8.2;
    const camera = new THREE.OrthographicCamera(-hh * asp, hh * asp, hh, -hh, -100, 200);
    camera.position.set(40, 30, 40);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xf0ddf2, 0.78));
    const sun = new THREE.DirectionalLight(0xfff3e4, 0.55);
    sun.position.set(22, 26, 9); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 90 });
    sun.shadow.bias = -0.0008; scene.add(sun);
    const model = new THREE.Group(), spin = new THREE.Group(); spin.add(model); scene.add(spin);
    const info = build(model);
    model.position.y = -info.h / 2;                     // centre vertically around the origin
    camera.lookAt(0, 0, 0);
    icons.push({ card, cv, renderer, scene, camera, spin, model, hover: 0, phase: Math.random() * 6, on: true });
    new IntersectionObserver(e => { icons[icons.findIndex(i => i.cv === cv)].on = e[0].isIntersecting; }, { threshold: 0 }).observe(cv);
  });

  function frame(now) {
    requestAnimationFrame(frame);
    const t = now / 1000;
    for (const i of icons) {
      if (!i.on) continue;
      const target = i.card.matches(':hover, :focus-within') ? 1 : 0;
      i.hover += (target - i.hover) * 0.12;
      i.spin.rotation.y = PI / 4 + Math.sin(t * 0.9 + i.phase) * 0.28 + i.hover * 0.7;
      i.spin.position.y = Math.sin(t * 1.9 + i.phase) * 0.35 + i.hover * 0.5;
      const s = 1 + i.hover * 0.1; i.spin.scale.set(s, s, s);
      i.renderer.render(i.scene, i.camera);
    }
  }
  requestAnimationFrame(frame);
})();
