// Little voxel "Bondi blue" iMac G3 that floats above the work-experience title.
(function () {
  'use strict';
  const cv = document.getElementById('imac');
  if (!cv || !window.THREE) return;
  const PI = Math.PI;
  const W = 220, H = 190;

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const asp = W / H, hh = 10.6;
  const camera = new THREE.OrthographicCamera(-hh * asp, hh * asp, hh, -hh, -100, 200);
  camera.position.set(40, 38, 40);
  camera.lookAt(0, 4.6, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xf0ddf2, 0.7));
  const sun = new THREE.DirectionalLight(0xfff3e4, 0.55);
  sun.position.set(22, 26, 9); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 90 });
  sun.shadow.bias = -0.0008;
  scene.add(sun);

  // ---- pixel textures / voxel helpers (same look as the room) ----
  function pixTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    return t;
  }
  const px = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const noise = pixTex(8, 8, g => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = rnd() < .12 ? 224 : 234 + Math.floor(rnd() * 22); px(g, `rgb(${v},${v},${v})`, x, y); } });
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
  const mats = {};
  const lam = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c, map: noise }));
  function geo(sx, sy, sz) {
    const g = new THREE.BoxGeometry(sx, sy, sz), uv = g.attributes.uv;
    const d = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const n = f * 4 + i; uv.setXY(n, uv.getX(n) * d[f][0] * .5, uv.getY(n) * d[f][1] * .5); }
    return g;
  }
  const model = new THREE.Group(); model.position.z = -6;
  const spin = new THREE.Group(); spin.add(model); scene.add(spin);
  // box from min-corner
  function B(x, y, z, sx, sy, sz, color) {
    const m = new THREE.Mesh(geo(sx, sy, sz), lam(color));
    m.position.set(x + sx / 2, y + sy / 2, z + sz / 2);
    m.castShadow = true; m.receiveShadow = true; model.add(m); return m;
  }

  // ---- base slab (little diorama, like the room) ----
  B(-9, -0.7, -2, 18, 0.7, 16, '#f2dbe8');
  B(-9, -1.4, -2, 18, 0.7, 16, '#d7c4ec');

  // ---- the iMac: bulbous bondi-blue body built in depth layers (back -> front) ----
  const yc = 6.5, BODY = '#86d9ea', BODY2 = '#6cc9de';
  const layers = [ // z0, z1, width, height
    [0, 1, 6, 6, BODY2], [1, 2, 8, 8, BODY2], [2, 3, 10, 9, BODY2],
    [3, 4, 11, 10, BODY], [4, 6, 12, 11, BODY], [6, 8, 12, 11, BODY]
  ];
  for (const [z0, z1, w, h, c] of layers) B(-w / 2, yc - h / 2, z0, w, h, z1 - z0, c);
  B(-6, yc - 5.5, 8, 12, 11, 1, '#eaf8fb');                // front rim (milky white)
  B(-3.5, 0, 2.5, 7, 1, 5.5, '#e2edf2');                    // foot
  // translucent highlight stripes on the shell
  B(-6.05, yc + 2, 4, 0.1, 1.2, 4, '#c8f1f8'); B(5.95, yc + 2, 4, 0.1, 1.2, 4, '#c8f1f8');
  // carrying handle on top
  B(-2.5, 11.5, 2.4, 1, 1.4, 1.1, '#d9f4fa'); B(1.5, 11.5, 2.4, 1, 1.4, 1.1, '#d9f4fa'); B(-2.5, 12.5, 2.4, 5, 0.9, 1.1, '#d9f4fa');
  // power button + little CD-slot line
  B(3.6, 1.6, 9, 0.8, 0.6, 0.12, '#ff9ab8'); B(-4.5, 1.7, 9, 3, 0.25, 0.1, '#a9bcc6');

  // screen bezel + animated screen
  const bez = new THREE.Mesh(new THREE.PlaneGeometry(10, 8.6), new THREE.MeshBasicMaterial({ color: '#cfd9df' }));
  bez.position.set(0, yc + 0.35, 9.02); model.add(bez);
  const sc = document.createElement('canvas'); sc.width = 32; sc.height = 26;
  const sg = sc.getContext('2d');
  const screenTex = new THREE.CanvasTexture(sc); screenTex.magFilter = screenTex.minFilter = THREE.NearestFilter; screenTex.generateMipmaps = false;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 7.5), new THREE.MeshBasicMaterial({ map: screenTex }));
  screen.position.set(0, yc + 0.35, 9.04); model.add(screen);
  function drawScreen(blink) {
    for (let y = 0; y < 26; y++) { const k = y / 25; px(sg, `rgb(${Math.round(150 + k * 70)},${Math.round(216 - k * 20)},${Math.round(240 - k * 20)})`, 0, y, 32, 1); }
    px(sg, '#fff', 3, 4, 7, 1); px(sg, '#fff', 4, 3, 4, 1); px(sg, '#fff', 22, 7, 6, 1); px(sg, '#fff', 23, 6, 3, 1);   // clouds
    px(sg, '#2f3a45', 0, 0, 32, 2); px(sg, '#ff9ab8', 1, 0, 1, 1); px(sg, '#ffe08f', 3, 0, 1, 1); px(sg, '#9fe8c0', 5, 0, 1, 1);
    // happy mac
    px(sg, '#efe8da', 11, 7, 10, 12); px(sg, '#2f3a45', 12, 8, 8, 6);
    px(sg, '#9fe8c0', 13, 9, 6, 4);
    px(sg, '#2f3a45', 14, 10, 1, 2); px(sg, '#2f3a45', 17, 10, 1, 2); px(sg, '#2f3a45', 15, 12, 2, 1);
    px(sg, '#c9bfae', 12, 16, 8, 1); px(sg, '#ff9ab8', 17, 17, 2, 1);
    px(sg, '#fff', 8, 21, 16, 2);                                                     // "hello" bar
    if (blink) px(sg, '#2f3a45', 24, 21, 1, 2);
    screenTex.needsUpdate = true;
  }
  drawScreen(true);

  // keyboard + puck mouse
  B(-4, 0, 10.4, 8.4, 0.5, 3, '#f4fafc');
  for (let r = 0; r < 3; r++) for (let k = 0; k < 8; k++) B(-3.75 + k * 1.03, 0.5, 10.65 + r * 0.8, 0.8, 0.22, 0.55, ((r + k) % 5 === 0) ? '#ffb0c8' : '#cfe3ea');
  B(5.4, 0, 11, 1.7, 0.7, 1.7, '#86d9ea');

  // ---- animate: gentle float + sway, only while on screen ----
  let on = true, last = 0;
  new IntersectionObserver(e => { on = e[0].isIntersecting; }, { threshold: 0 }).observe(cv);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!on) return;
    const t = now / 1000;
    spin.rotation.y = PI / 4 + Math.sin(t * 0.7) * 0.32;
    model.position.y = Math.sin(t * 1.8) * 0.25;
    if (now - last > 480) { last = now; drawScreen(Math.floor(now / 480) % 2 === 0); }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
