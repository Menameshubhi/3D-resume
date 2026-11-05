// Voxel landscape (mountain, hills, trees, drifting block-clouds) used as the Extras section background.
(function () {
  'use strict';
  const cv = document.getElementById('extrasBg');
  if (!cv || !window.THREE) return;
  const section = cv.parentElement;

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xb4ddd2, 30, 120);
  const camera = new THREE.PerspectiveCamera(52, 2, 0.5, 220);

  scene.add(new THREE.HemisphereLight(0xe6f7ff, 0x6c8f5c, 0.85));
  const sun = new THREE.DirectionalLight(0xfff1d6, 0.75);
  sun.position.set(-30, 45, 25); scene.add(sun);

  // ---- tiny deterministic RNG + grain texture (same blocky look as the room) ----
  let seed = 21; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gc = document.createElement('canvas'); gc.width = gc.height = 8;
  const gg = gc.getContext('2d');
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = rnd() < .15 ? 205 : 228 + Math.floor(rnd() * 27); gg.fillStyle = `rgb(${v},${v},${v})`; gg.fillRect(x, y, 1, 1); }
  const grain = new THREE.CanvasTexture(gc); grain.magFilter = grain.minFilter = THREE.NearestFilter; grain.generateMipmaps = false;

  // ---- terrain heights ----
  const MX = -34, MZ = -34;                       // main mountain
  function height(x, z) {
    let h = 1.6 + 1.2 * Math.sin(x * .17) + 1.0 * Math.cos(z * .14 + 1) + .8 * Math.sin((x + z) * .11);
    const d = Math.hypot(x - MX, (z - MZ) * 0.9), m = Math.max(0, 1 - d / 21);
    h += 25 * Math.pow(m, 1.35) * (1 + 0.06 * Math.sin(x * .9 + z * .7));      // stepped cone
    const d2 = Math.hypot(x - 36, z + 26), m2 = Math.max(0, 1 - d2 / 17);
    h += 9.5 * Math.pow(m2, 1.1);                                              // second, softer hill
    if (z < -48) h += 7 * (Math.sin(x * .1) * .5 + .6);                        // far ridge
    if (z > -2) h = h * Math.max(.25, 1 - (z + 2) * .07);                      // flatter meadow near the camera
    return Math.max(1, Math.round(h));
  }

  const items = [];                               // {x,y,z,sx,sy,sz,color}
  const col = (hex, j = 0) => { const c = new THREE.Color(hex); if (j) { const k = 1 + (rnd() - .5) * j; c.multiplyScalar(k); } return c; };
  const heights = {};
  for (let x = -52; x <= 52; x++) for (let z = -72; z <= 14; z++) {
    const h = height(x, z); heights[x + ',' + z] = h;
    const mountain = Math.hypot(x - MX, (z - MZ) * .9) < 20 && h > 9;
    let top, body;
    if (mountain && h > 14) { top = x > MX - 2 + (z + 32) * .15 ? col('#dcc08e', .12) : col('#587f9f', .12); body = top; }
    else if (mountain && h > 10) { top = x > MX + 2 ? col('#9aa97a', .14) : col('#46806d', .14); body = top; }
    else { top = col(h > 5 ? '#3f8a4a' : '#5fae4f', .2); body = col('#7b5233', .12); }
    if (h > 1) items.push({ x, y: (h - 1) / 2, z, sx: 1, sy: h - 1, sz: 1, c: body });     // column body
    items.push({ x, y: h - 0.5, z, sx: 1, sy: 1, sz: 1, c: top });                          // top layer
  }

  // ---- blocky trees ----
  function tree(x, z, s) {
    const h = heights[Math.round(x) + ',' + Math.round(z)]; if (h === undefined) return;
    const th = 3 * s + Math.floor(rnd() * s * 2);
    items.push({ x, y: h + th / 2, z, sx: s, sy: th, sz: s, c: col('#6b4a2c', .1) });
    const gcols = ['#2f7d3c', '#37893f', '#2a7036'];
    const L = (w, dy) => items.push({ x, y: h + th + dy * s + s / 2, z, sx: w * s, sy: s, sz: w * s, c: col(gcols[Math.floor(rnd() * 3)], .12) });
    L(5, -1); L(5, 0); L(3, 1); L(1, 2);
  }
  for (let i = 0; i < 170; i++) {
    const x = -50 + rnd() * 100, z = -45 + rnd() * 46, h = heights[Math.round(x) + ',' + Math.round(z)];
    if (h === undefined || h > 7 || Math.abs(x - 2) < 6 && z > -6) continue;     // keep a clearing in the middle foreground
    tree(Math.round(x), Math.round(z), 1);
  }
  for (const [x, z] of [[-40, 2], [-33, 4], [38, 3], [44, 0]]) tree(x, z, 2);   // big framing trees at the edges

  // ---- one instanced mesh for every block ----
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ map: grain }), items.length);
  const o = new THREE.Object3D();
  items.forEach((b, i) => { o.position.set(b.x, b.y, b.z); o.scale.set(b.sx, b.sy, b.sz); o.updateMatrix(); mesh.setMatrixAt(i, o.matrix); mesh.setColorAt(i, b.c); });
  mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);

  // ---- floating block clouds ----
  const clouds = [], cmat = new THREE.MeshLambertMaterial({ color: '#fffbea', emissive: '#bcb8a0', fog: false });
  for (let i = 0; i < 16; i++) {
    const w = 6 + rnd() * 9, d = 3 + rnd() * 4;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1 + rnd() * .9, d), cmat);
    m.position.set(-70 + rnd() * 140, 24 + rnd() * 16, -75 + rnd() * 70);
    m.userData.sp = 0.5 + rnd() * 0.9; scene.add(m); clouds.push(m);
  }

  // ---- sizing + animation (only while visible) ----
  function resize() {
    const w = section.clientWidth, h = section.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(section); resize();
  let on = false;
  new IntersectionObserver(e => { on = e[0].isIntersecting; }, { threshold: 0 }).observe(section);
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    if (!on) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
    for (const c of clouds) { c.position.x += c.userData.sp * dt * 2.2; if (c.position.x > 75) c.position.x = -75; }
    camera.position.set(Math.sin(t * .12) * 4, 11 + Math.sin(t * .2) * .4, 24);
    camera.lookAt(0, 10, -34);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
})();
