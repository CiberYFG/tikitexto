/* SLALOM 3D · TIKITEXTO (15-nov-2026)
   Corredor de regates en 3D (módulo propio, carga diferida). Reutiliza los cuerpos y el sonido de penaltis.js (three.js en lib/, MIT).
   Tres carriles: desliza a los lados para cambiar de carril, hacia arriba para saltar y hacia abajo para deslizarte bajo las pancartas. Cada gesto cambia un solo carril.
   Todo se dibuja con código: sin escudos, fotos, logos ni marcas. */
import * as THREE from "./lib/three.module.min.js";
import { POSES, crearAudio, precargar as precargarCuerpos } from "./penaltis.js";
import { crearFigura } from "./penaltis_cuerpo.js";

export function precargar() { return precargarCuerpos(); }

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (n) => Math.floor(Math.random() * n);

const LX = [-2.4, 0, 2.4], Z_SPAWN = -112, Z_FIN = 9, G = 22.5, SALTO = 8.1, DUR_DESL = 0.75, VIDAS = 2, META_TIKI = 500;
const KITS = [[0xd62839, 0xffffff], [0xff8a00, 0x1a1a1a], [0x7b2cbf, 0xf2f4f8], [0x111111, 0xffd23a], [0x0a7d4f, 0xffffff]];
const TEMAS = [
  { cielo: 0x8fcbff, niebla: 0xbfe1ff, hemi: 1.05, sol: 2.7, solC: 0xfff1d6, exp: 1.05 },
  { cielo: 0xff9a6b, niebla: 0xf3b48a, hemi: 0.85, sol: 2.0, solC: 0xffb36b, exp: 1.08 },
  { cielo: 0x0a1430, niebla: 0x101c3c, hemi: 0.55, sol: 0.9, solC: 0x9db8ff, exp: 1.18 },
];

const PLANTILLA = `
<canvas class="sl-cv"></canvas><div class="sl-vineta"></div><div class="sl-flash" data-flash></div>
<div class="sl-cab">
  <button type="button" class="sl-btn" data-sl="salir" aria-label="Salir">✕</button>
  <div class="sl-marc"><b data-sl-pts data-no-t>0</b><small data-sl-m data-no-t>0 m</small></div>
  <div class="sl-der"><div class="sl-mon"><i></i><span data-sl-mon data-no-t>0</span></div><div class="sl-vidas" data-vidas></div></div>
</div>
<div class="sl-turbo" data-turbo hidden><i data-turbo-i></i></div>
<div class="sl-aviso" data-aviso data-no-t></div>
<p class="sl-pista" data-pista></p>
<div class="sl-menu" data-menu>
  <div class="sl-caja">
    <p class="sl-kicker">Videojuego 3D</p>
    <h2>SLALOM</h2>
    <p class="sl-sub">Regatea por el campo: esquiva defensas, salta balones y porterías de entrenamiento y deslízate bajo las pancartas. Cuanto más corres, más rápido va.</p>
    <ul class="sl-ctl">
      <li><b>⬅️➡️</b><span>Cambia de carril</span></li>
      <li><b>⬆️</b><span>Salta</span></li>
      <li><b>⬇️</b><span>Deslízate</span></li>
      <li><b>⚡</b><span>Las botas doradas te dan turbo</span></li>
    </ul>
    <p class="sl-rec" data-rec data-no-t></p>
    <button type="button" class="sl-jugar" data-sl="jugar">¡Correr!</button>
  </div>
</div>
<div class="sl-fin" data-fin hidden>
  <div class="sl-caja">
    <h2 data-fin-t>¡TARJETA ROJA!</h2>
    <p class="sl-fin-m" data-fin-m data-no-t></p>
    <p class="sl-fin-m" data-fin-r data-no-t></p>
    <p class="sl-fin-tiki" data-fin-tiki hidden>⚡ +1 tikitexto</p>
    <div class="sl-fin-b"><button type="button" class="sl-jugar" data-sl="jugar">Correr otra vez</button><button type="button" class="sl-sec" data-sl="salir">Salir</button></div>
  </div>
</div>
<div class="sl-sin" data-sin hidden><div><b>No se puede mostrar el 3D</b><small>Tu dispositivo o navegador no admite gráficos 3D (WebGL).</small><button type="button" class="sl-sec" data-sl="salir">Salir</button></div></div>
`;

/* ───────── texturas dibujadas con código ───────── */
function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function tex(c, rx, ry, aniso) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = aniso || 4; return t; }
function texCesped(aniso) {
  const c = lienzo(256, 256), x = c.getContext("2d");
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#2b8a3a" : "#34a047"; x.fillRect(0, i * 32, 256, 32); }
  for (let i = 0; i < 2600; i++) { x.fillStyle = "rgba(" + (irnd(2) ? "255,255,255" : "0,40,0") + "," + (0.03 + Math.random() * 0.05) + ")"; x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 2 + Math.random() * 5); }
  return tex(c, 6, 10, aniso);
}
function texCarril(aniso) {
  const c = lienzo(256, 256), x = c.getContext("2d"); x.clearRect(0, 0, 256, 256);
  const u = (m) => (m + 3.9) / 7.8 * 256;
  x.fillStyle = "rgba(255,255,255,.07)"; x.fillRect(u(-3.6), 0, u(3.6) - u(-3.6), 256);
  x.fillStyle = "rgba(255,255,255,.85)";
  [-3.6, 3.6].forEach((m) => x.fillRect(u(m) - 3, 0, 6, 256));
  [-1.2, 1.2].forEach((m) => { for (let k = 0; k < 4; k++) x.fillRect(u(m) - 2.5, k * 64 + 8, 5, 30); });
  return tex(c, 1, 18, aniso);
}
function texGrada(aniso) {
  const c = lienzo(512, 256), x = c.getContext("2d");
  x.fillStyle = "#141a2c"; x.fillRect(0, 0, 512, 256);
  /* escalones oscuros */
  for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.18)"; x.fillRect(0, i * 16, 512, 16); }
  const col = ["#c94a55", "#d9d7a0", "#e8e8ee", "#5b8fc9", "#d98a3a", "#7fb597", "#c777a8", "#9aa6c4", "#2b3a66", "#3b2f55"];
  for (let i = 0; i < 1500; i++) {
    const px = Math.random() * 512, py = 6 + Math.floor(Math.random() * 15) * 16 + Math.random() * 3;
    x.fillStyle = col[irnd(col.length)]; x.fillRect(px - 2.5, py + 3, 5, 6);
    x.fillStyle = "#d9a98a"; x.beginPath(); x.arc(px, py, 2.4, 0, 6.3); x.fill();
  }
  const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "rgba(6,8,18,.82)"); g.addColorStop(0.55, "rgba(6,8,18,.15)"); g.addColorStop(1, "rgba(6,8,18,0)"); x.fillStyle = g; x.fillRect(0, 0, 512, 256);
  return tex(c, 22, 1, aniso);
}
function texValla(aniso) {
  const c = lienzo(512, 64), x = c.getContext("2d");
  const cols = ["#0b5fff", "#ff3d6e", "#0aa86a", "#ffb400"], txt = ["TIKITEXTO", "FÚTBOL", "¡VAMOS!", "GOLAZO"];
  for (let i = 0; i < 4; i++) {
    x.fillStyle = cols[i]; x.fillRect(i * 128, 0, 128, 64); x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(i * 128, 0, 128, 10);
    x.fillStyle = "#fff"; x.font = "900 22px Arial, Helvetica, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt[i], i * 128 + 64, 36);
  }
  return tex(c, 14, 1, aniso);
}
function texBalon() {
  const c = lienzo(256, 128), x = c.getContext("2d");
  x.fillStyle = "#f6f7f9"; x.fillRect(0, 0, 256, 128);
  const pent = (cx, cy, r) => { x.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fill(); };
  x.fillStyle = "#16191f"; [[32, 40], [96, 84], [160, 40], [224, 84], [128, 14], [0, 84], [256, 84]].forEach((p) => pent(p[0], p[1], 15));
  x.fillStyle = "#16191f"; pent(64, 116, 12); pent(192, 116, 12);
  x.strokeStyle = "rgba(30,34,42,.55)"; x.lineWidth = 2; [[32, 40, 96, 84], [96, 84, 160, 40], [160, 40, 224, 84], [32, 40, 128, 14], [128, 14, 160, 40]].forEach((l) => { x.beginPath(); x.moveTo(l[0], l[1]); x.lineTo(l[2], l[3]); x.stroke(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function texRed() {
  const c = lienzo(128, 128), x = c.getContext("2d"); x.clearRect(0, 0, 128, 128);
  x.strokeStyle = "rgba(245,248,250,.92)"; x.lineWidth = 3;
  for (let i = 0; i <= 128; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); t.anisotropy = 4; return t;
}
function texCartel() {
  const c = lienzo(512, 128), x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, "#1c8f4e"); g.addColorStop(1, "#0f6b37"); x.fillStyle = g; x.fillRect(0, 0, 512, 128);
  x.fillStyle = "rgba(255,255,255,.10)"; for (let i = 0; i < 8; i++) if (i % 2 === 0) x.fillRect(i * 64, 0, 64, 128);
  x.fillStyle = "#fff"; x.fillRect(0, 0, 512, 7); x.fillRect(0, 121, 512, 7);
  x.fillStyle = "#fff"; x.font = "900 66px Arial, Helvetica, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.lineWidth = 8; x.strokeStyle = "rgba(0,0,0,.45)";
  x.strokeText("⬇ ¡GOOOL! ⬇", 256, 66); x.fillText("⬇ ¡GOOOL! ⬇", 256, 66);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function texBrillo(col) {
  const c = lienzo(64, 64), x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, col); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function texRayo() {
  const c = lienzo(128, 128), x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(255,233,74,.95)"); g.addColorStop(1, "rgba(255,150,0,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  x.fillStyle = "#fff6c0"; x.strokeStyle = "#c97800"; x.lineWidth = 5; x.beginPath();
  x.moveTo(74, 14); x.lineTo(38, 70); x.lineTo(62, 70); x.lineTo(50, 114); x.lineTo(92, 54); x.lineTo(66, 54); x.closePath(); x.fill(); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* sistema de partículas muy simple (puntos) */
function crearParticulas(scene, n, color, tam, aditivo) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), vel = new Float32Array(n * 3), vida = new Float32Array(n);
  for (let i = 0; i < n; i++) pos[i * 3 + 1] = -50;
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: color, size: tam, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false, blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending, map: texBrillo("rgba(255,255,255,.8)") });
  const p = new THREE.Points(geo, m); p.frustumCulled = false; scene.add(p);
  let k = 0;
  return {
    emite: function (x, y, z, vx, vy, vz, v) { const i = k; k = (k + 1) % n; pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; vel[i * 3] = vx; vel[i * 3 + 1] = vy; vel[i * 3 + 2] = vz; vida[i] = v; },
    paso: function (dt, dz) {
      for (let i = 0; i < n; i++) {
        if (vida[i] <= 0) { pos[i * 3 + 1] = -50; continue; }
        vida[i] -= dt; vel[i * 3 + 1] -= 9 * dt; pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] += vel[i * 3 + 1] * dt; pos[i * 3 + 2] += vel[i * 3 + 2] * dt + dz;
        if (pos[i * 3 + 1] < 0.02) { pos[i * 3 + 1] = 0.02; vel[i * 3 + 1] *= -0.3; }
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  const movil = (window.matchMedia && matchMedia("(pointer: coarse)").matches) || /Android|iPhone|iPad/i.test(navigator.userAgent);
  const reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s);
  const cv = $(".sl-cv");
  const datos = () => { const d = api.datos(); ["mejor", "mejorm", "part", "bal", "tiki"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const au = crearAudio(api);

  /* ── mini sintetizador propio para los efectos cortos ── */
  let ctx = null;
  function audioIni() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, retraso) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (retraso || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonMoneda = () => { blip(988, 0.09, 0.07, "square"); blip(1319, 0.16, 0.07, "square", 0, 0.07); };
  const sonSalto = () => blip(260, 0.22, 0.12, "sine", 620);
  const sonDesliza = () => blip(520, 0.25, 0.07, "sawtooth", 140);
  const sonCarril = () => blip(340, 0.09, 0.05, "triangle", 220);
  const sonGolpe = () => { blip(140, 0.28, 0.3, "sawtooth", 45); blip(90, 0.3, 0.3, "sine", 40); };
  const sonTurbo = () => { blip(523, 0.12, 0.09, "square"); blip(659, 0.12, 0.09, "square", 0, 0.1); blip(784, 0.12, 0.09, "square", 0, 0.2); blip(1046, 0.3, 0.09, "square", 0, 0.3); };
  const sonPita = () => { blip(1250, 0.5, 0.08, "square"); };

  /* ── escena ── */
  let E = null;
  try {
    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" });
    E = { renderer: renderer };
  } catch (e) { E = null; }
  if (!E) { $("[data-sin]").hidden = false; $("[data-menu]").hidden = true; }

  const S = { fase: "menu", t: 0, dist: 0, v: 0, x: 0, lane: 1, y: 0, vy: 0, desl: 0, vidas: VIDAS, inv: 0, turbo: 0, monedas: 0, pts: 0, obs: [], sig: 0, filas: 0, tiki: false, bonus: 0, shake: 0, activo: true, choque: 0, hito: 0, tema: 0, ciclo: 0, cola: [] };
  let raf = 0, ultimo = 0, vivo = true, escala = 1, fpsAcum = 0, fpsN = 0, hAviso = 0, hFlash = 0;
  let camara, scene, sol, hemi, luces = [], mundo = {}, jug = null, piscina = [], libres = { def: [], valla: [], cono: [], cartel: [], moneda: [], bota: [] }, chispas, polvo, lineas = [];

  function construye() {
    const R = E.renderer, aniso = Math.min(R.capabilities.getMaxAnisotropy(), 8);
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2));
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene(); scene.background = new THREE.Color(TEMAS[0].cielo); scene.fog = new THREE.Fog(TEMAS[0].niebla, 38, 125);
    camara = new THREE.PerspectiveCamera(58, 16 / 9, 0.1, 300); scene.add(camara);
    hemi = new THREE.HemisphereLight(0xcfe3ff, 0x2a5a2a, 1.0); scene.add(hemi);
    sol = new THREE.DirectionalLight(0xfff1d6, 2.6); sol.position.set(8, 22, 12); sol.target.position.set(0, 0, -6); scene.add(sol, sol.target);
    sol.castShadow = true; sol.shadow.mapSize.set(movil ? 1024 : 2048, movil ? 1024 : 2048);
    Object.assign(sol.shadow.camera, { left: -13, right: 13, top: 22, bottom: -22, near: 1, far: 70 }); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03;

    /* suelo: césped con franjas + carriles */
    const tC = texCesped(aniso), tL = texCarril(aniso);
    const cesped = new THREE.Mesh(new THREE.PlaneGeometry(144, 240), new THREE.MeshStandardMaterial({ map: tC, roughness: 0.95 }));
    cesped.rotation.x = -Math.PI / 2; cesped.position.set(0, 0, -95); cesped.receiveShadow = true; scene.add(cesped);
    const carril = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 240), new THREE.MeshBasicMaterial({ map: tL, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
    carril.rotation.x = -Math.PI / 2; carril.position.set(0, 0.012, -95); scene.add(carril);
    mundo.tC = tC; mundo.tL = tL;

    /* gradas y vallas con scroll */
    const tG0 = texGrada(aniso), tV0 = texValla(aniso); mundo.scroll = [];
    [-1, 1].forEach(function (s) {
      const tG = tG0.clone(), tV = tV0.clone(); tG.needsUpdate = true; tV.needsUpdate = true;
      mundo.scroll.push({ t: tG, k: -s / 10.9 }, { t: tV, k: -s / 17.1 });
      const matG = new THREE.MeshBasicMaterial({ map: tG });
      const piv = new THREE.Group(); piv.position.set(s * 12, 0, -95); piv.rotation.z = -s * 0.5; scene.add(piv);
      const g = new THREE.Mesh(new THREE.PlaneGeometry(240, 15), matG); g.rotation.y = -s * Math.PI / 2; g.position.set(0, 7.5, 0); piv.add(g);
      const valla = new THREE.Mesh(new THREE.PlaneGeometry(240, 1.1), new THREE.MeshBasicMaterial({ map: tV })); valla.rotation.y = -s * Math.PI / 2; valla.position.set(s * 8.2, 0.55, -95); scene.add(valla);
      const fondo = new THREE.Mesh(new THREE.BoxGeometry(1, 0.9, 240), new THREE.MeshStandardMaterial({ color: 0x15213a, roughness: 0.8 })); fondo.position.set(s * 8.6, 0.45, -95); scene.add(fondo);
    });
    /* focos */
    const brillo = texBrillo("rgba(255,244,214,.9)"), mastil = new THREE.MeshStandardMaterial({ color: 0x2a3140 });
    for (let i = 0; i < 12; i++) {
      const s = i % 2 ? 1 : -1, g = new THREE.Group(); g.position.set(s * 17, 0, -Math.floor(i / 2) * 42 + 10); scene.add(g);
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 26, 0.7), mastil); m.position.y = 13; g.add(m);
      const p = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.4), new THREE.MeshBasicMaterial({ color: 0xfff3d6 })); p.position.set(-s * 1.8, 26.5, 0); p.rotation.y = -s * 0.5; g.add(p);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: brillo, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.75, fog: false })); sp.scale.set(15, 15, 1); sp.position.set(-s * 2, 26.5, 1); g.add(sp);
      luces.push({ g: g, sp: sp });
    }

    /* jugador */
    jug = crearFigura({ cuerpo: "jugador", camisa2: 0xffffff, camisa: 0x1d5fd6, pantalon: 0xf2f4f8, media: 0x1d5fd6, piel: 0xf0c8a0, pelo: 0x2b1b12, dorsal: 7, nombre: (api.nombre ? api.nombre() : "") || "TIKI", numColor: "#ffffff", manga: true });
    jug.raiz.rotation.y = Math.PI; scene.add(jug.raiz);
    /* defensas: reserva reutilizable */
    for (let i = 0; i < 12; i++) nuevaDef();
    /* mallas de obstáculos y objetos (se crean bajo demanda) */
    mundo.matMon = new THREE.MeshStandardMaterial({ color: 0xffc824, emissive: 0x8a5d00, emissiveIntensity: 0.8, metalness: 0.15, roughness: 0.35 });
    mundo.geoMon = new THREE.CylinderGeometry(0.3, 0.3, 0.07, 28); mundo.geoMon.rotateX(Math.PI / 2);
    mundo.texRayo = texRayo(); mundo.texCartel = texCartel(); mundo.texBalon = texBalon(); mundo.texRed = texRed();
    chispas = crearParticulas(scene, 120, 0xffd23a, 0.22, true); polvo = crearParticulas(scene, 70, 0xdfe9d4, 0.32, false);
    for (let i = 0; i < 22; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 3), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, fog: false }));
      m.position.set(rnd(-7, 7), rnd(0.3, 5.5), rnd(-30, 8)); m.visible = false; scene.add(m); lineas.push(m);
    }
    tamano(); aplicaTema(0, 0);
  }

  /* ── objetos del juego ── */
  let nDef = 0;
  function nuevaDef() {
    const i = nDef++, k = KITS[i % KITS.length], f = crearFigura({ cuerpo: "jugador", camisa2: k[1], camisa: k[0], pantalon: k[1], media: k[0], piel: [0xf0c8a0, 0xd9a273, 0xa8764d, 0x7a5233][i % 4], pelo: 0x1c140f, dorsal: 2 + (i * 3) % 30, nombre: "", numColor: "#ffffff", manga: true });
    f.raiz.visible = false; scene.add(f.raiz); libres.def.push(f); return f;
  }
  /* mini-portería de entrenamiento (se salta por encima del larguero) */
  function mallaValla() {
    const g = new THREE.Group(), blanco = new THREE.MeshStandardMaterial({ color: 0xf7f8fa, roughness: 0.35, metalness: 0.1 });
    const red = new THREE.MeshBasicMaterial({ map: mundo.texRed, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: true });
    [-0.95, 0.95].forEach((x) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.7, 12), blanco); p.position.set(x, 0.35, 0); p.castShadow = true; g.add(p);
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 10), blanco); t.rotation.x = Math.PI / 2; t.position.set(x, 0.7, -0.27); g.add(t);
      const lado = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.7), red); lado.rotation.y = Math.PI / 2; lado.position.set(x, 0.35, -0.27); g.add(lado);
    });
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.95, 12), blanco); l.rotation.z = Math.PI / 2; l.position.y = 0.7; l.castShadow = true; g.add(l);
    const fondo = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.7), red); fondo.position.set(0, 0.35, -0.55); g.add(fondo);
    const techo = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.55), red); techo.rotation.x = Math.PI / 2; techo.position.set(0, 0.7, -0.27); g.add(techo);
    return g;
  }
  /* fila de balones (se saltan) */
  function mallaCono() {
    const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ map: mundo.texBalon, roughness: 0.4 });
    [-0.7, 0, 0.7].forEach((x, i) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), mat); b.position.set(x, 0.3, (i === 1 ? 0.25 : 0)); b.rotation.set(rnd(0, 3), rnd(0, 3), 0); b.castShadow = true; g.add(b); });
    return g;
  }
  /* pancarta de la grada entre dos banderines de córner (se pasa deslizándose) */
  function mallaCartel() {
    const g = new THREE.Group(), blanco = new THREE.MeshStandardMaterial({ color: 0xf7f8fa, roughness: 0.4 }), banderin = new THREE.MeshStandardMaterial({ color: 0xffc400, roughness: 0.6, side: THREE.DoubleSide });
    [-3.7, 3.7].forEach((x) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 12), blanco); p.position.set(x, 1.2, 0); p.castShadow = true; g.add(p);
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.62, 0.2); sh.lineTo(0, 0.4); sh.closePath();
      const f = new THREE.Mesh(new THREE.ShapeGeometry(sh), banderin); f.position.set(x - (x > 0 ? 0.0 : 0.0), 2.38, 0); g.add(f);
    });
    const tab = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.05, 0.14), new THREE.MeshStandardMaterial({ map: mundo.texCartel, roughness: 0.6, emissive: 0x1a1a1a })); tab.position.y = 1.72; tab.castShadow = true; g.add(tab);
    return g;
  }
  function mallaBota() {
    const g = new THREE.Group(), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mundo.texRayo, depthWrite: false, transparent: true, fog: false })); s.scale.set(1.5, 1.5, 1); g.add(s); g.userData.sp = s; return g;
  }
  function toma(tipo) {
    let o = libres[tipo].pop();
    if (!o) {
      if (tipo === "moneda") o = new THREE.Mesh(mundo.geoMon, mundo.matMon);
      else if (tipo === "valla") o = mallaValla(); else if (tipo === "cono") o = mallaCono(); else if (tipo === "cartel") o = mallaCartel(); else if (tipo === "bota") o = mallaBota();
      else if (tipo === "def") return null;
      if (tipo === "moneda") o.castShadow = false;
      scene.add(o);
    }
    o.visible = true; return o;
  }
  function suelta(ob) {
    ob.activo = false; const m = ob.m; if (!m) return;
    if (ob.tipo === "def" || ob.tipo === "entrada") { m.raiz.visible = false; m.raiz.rotation.set(0, 0, 0); m.raiz.position.set(0, 0, 0); libres.def.push(m); }
    else { m.visible = false; m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1); libres[ob.tipo].push(m); }
    ob.m = null;
  }
  function pon(tipo, lane, z, y) {
    const ob = { tipo: tipo, lane: lane, z: z, y: y || 0, activo: true, golpe: 0, extra: 0, ph: Math.random() * 6 };
    if (tipo === "def" || tipo === "entrada") {
      const f = libres.def.pop() || (nDef < 22 ? (nuevaDef(), libres.def.pop()) : null); if (!f) return null; ob.m = f; f.raiz.visible = true; POSES.base(f);
    } else { const m = toma(tipo); if (!m) return null; ob.m = m; }
    S.obs.push(ob); colocaObj(ob); return ob;
  }
  function colocaObj(ob) {
    const x = ob.lane < 0 ? 0 : LX[ob.lane], r = ob.m && ob.m.raiz ? ob.m.raiz : ob.m; if (!r) return;
    r.position.set(x, ob.y, ob.z);
  }
  function monedas(lane, z0, n, y, paso) { for (let i = 0; i < n; i++) pon("moneda", lane, z0 - i * (paso || 2.2), y || 1.0); }

  /* ── generador de filas: siempre hay camino libre ── */
  function fila() {
    const d = Math.min(1, S.dist / 1800), Z = Z_SPAWN, lanes = [0, 1, 2], libre = irnd(3), otros = lanes.filter((l) => l !== libre), n = S.filas++;
    const pats = [];
    pats.push([5, "muro"], [3, "conos"], [d > 0.05 ? 4 : 0, "valla"], [d > 0.12 ? 3 : 0, "cartel"], [d > 0.2 ? 3 : 0, "entrada"], [d > 0.3 ? 3 : 0, "mix"], [d > 0.5 ? 3 : 0, "doble"]);
    if (n < 3) { pats.length = 0; pats.push([1, n === 0 ? "conos" : "muro"]); }
    let tot = 0; pats.forEach((p) => { tot += p[0]; }); let r = Math.random() * tot, tipo = "muro"; for (const p of pats) { if ((r -= p[0]) <= 0) { tipo = p[1]; break; } }
    if (tipo === "muro") { otros.forEach((l) => pon("def", l, Z)); monedas(libre, Z + 20, 6); }
    else if (tipo === "conos") { otros.forEach((l) => pon("cono", l, Z)); monedas(libre, Z + 20, 6); if (Math.random() < 0.5) pon("def", libre, Z - 14); }
    else if (tipo === "valla") { lanes.forEach((l) => pon("valla", l, Z)); for (let i = 0; i < 5; i++) pon("moneda", 1, Z + 3 - i * 1.5, 1.2 + Math.sin(i / 4 * Math.PI) * 1.2); }
    else if (tipo === "cartel") { pon("cartel", -1, Z); monedas(libre, Z + 18, 5, 0.9); }
    else if (tipo === "entrada") { pon("entrada", libre, Z); if (d > 0.4) pon("def", otros[irnd(2)], Z); monedas(otros[0], Z + 22, 5); }
    else if (tipo === "mix") { pon("def", otros[0], Z); pon("valla", otros[1], Z); monedas(libre, Z + 20, 6); }
    else if (tipo === "doble") { otros.forEach((l) => pon("def", l, Z)); pon("cartel", -1, Z - 15); monedas(libre, Z + 20, 5); }
    if (S.turbo <= 0 && S.dist > 250 && Math.random() < 0.09) pon("bota", libre, Z + 30, 1.0);
    S.sig = clamp(S.v * 1.4, 21, 38);
  }

  /* ── interfaz ── */
  function aviso(txt, cls, ms) {
    const a = $("[data-aviso]"); a.className = "sl-aviso sl-aviso--" + (cls || "n"); a.textContent = t(txt); void a.offsetWidth; a.classList.add("sl-aviso--on");
    clearTimeout(hAviso); hAviso = setTimeout(function () { a.classList.remove("sl-aviso--on"); }, ms || 1300);
  }
  function pista(txt) { $("[data-pista]").textContent = txt ? t(txt) : ""; }
  function pintaVidas() { let h = ""; for (let i = 0; i < VIDAS; i++) { const rest = S.vidas - i; h += '<s class="' + (rest > 0 ? "" : (i === VIDAS - 1 && S.vidas <= 0 ? "ro" : "am")) + '"></s>'; } $("[data-vidas]").innerHTML = h; }
  function pintaHud() { $("[data-sl-pts]").textContent = String(S.pts); $("[data-sl-m]").textContent = Math.floor(S.dist) + " m"; $("[data-sl-mon]").textContent = String(S.monedas); }
  function pintaRecord() { const d = datos(); $("[data-rec]").textContent = d.mejor ? "🏆 " + d.mejor + " · " + d.mejorm + " m · " + d.part + " ⚽" : ""; }
  function flash() { const f = $("[data-flash]"); f.classList.add("on"); clearTimeout(hFlash); hFlash = setTimeout(() => f.classList.remove("on"), 90); }

  /* ── temas (día → atardecer → noche) ── */
  const cC = new THREE.Color(), cN = new THREE.Color(), cH = new THREE.Color();
  function aplicaTema(i, k) {
    const a = TEMAS[i % 3], b = TEMAS[(i + 1) % 3];
    cC.set(a.niebla).lerp(cN.set(b.niebla), k); scene.fog.color.copy(cC); scene.background.copy(cC).lerp(cN.set(a.cielo).lerp(cH.set(b.cielo), k), 0.5);
    hemi.intensity = lerp(a.hemi, b.hemi, k); sol.intensity = lerp(a.sol, b.sol, k); sol.color.set(a.solC).lerp(cN.set(b.solC), k); E.renderer.toneMappingExposure = lerp(a.exp, b.exp, k);
    const noche = i % 3 === 2 ? 1 - k : i % 3 === 1 ? k : 0;
    luces.forEach((l) => { l.sp.material.opacity = 0.3 + 0.55 * noche; });
  }

  /* ── partida ── */
  function limpiaObs() { S.obs.forEach(suelta); S.obs = []; }
  function empezar() {
    audioIni(); au.iniciar(); au.ambiente(0.3);
    limpiaObs();
    Object.assign(S, { fase: "corre", dist: 0, v: 9, x: 0, lane: 1, y: 0, vy: 0, desl: 0, vidas: VIDAS, inv: 0, turbo: 0, monedas: 0, pts: 0, bonus: 0, sig: 10, filas: 0, tiki: false, choque: 0, hito: 0, tema: 0 });
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; $("[data-turbo]").hidden = true; pintaVidas(); pintaHud(); aplicaTema(0, 0);
    pista(movil ? "Desliza: ⬅️ ➡️ carril · ⬆️ salto · ⬇️ agacharte" : "Flechas o WASD: ⬅️ ➡️ carril · ⬆️ salto · ⬇️ agacharte"); setTimeout(() => { if (S.fase === "corre" && S.dist < 120) pista(""); }, 4500);
    sonPita();
  }
  function termina() {
    if (S.fase === "fin") return; S.fase = "fin";
    const d = datos(); d.part++; d.bal += S.monedas; const nuevo = S.pts > d.mejor; if (nuevo) d.mejor = S.pts; if (Math.floor(S.dist) > d.mejorm) d.mejorm = Math.floor(S.dist);
    if (S.tiki) d.tiki++;
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-fin-t]").textContent = t("¡TARJETA ROJA!"); $("[data-fin-m]").textContent = S.pts + " " + t("puntos") + " · " + Math.floor(S.dist) + " m · " + S.monedas + " 🪙";
    $("[data-fin-r]").textContent = nuevo ? t("¡Nuevo récord!") : "🏆 " + d.mejor;
    $("[data-fin-tiki]").hidden = !S.tiki; $("[data-fin]").hidden = false; $("[data-turbo]").hidden = true; au.ambiente(0.1); au.suspiro(); pintaRecord();
  }
  function golpea(ob) {
    ob.golpe = 1; S.shake = reducido ? 0 : 0.5; flash(); sonGolpe();
    S.vidas--; pintaVidas();
    if (S.vidas <= 0) { S.fase = "choque"; S.choque = 0; aviso("¡ROJA!", "mal", 1500); }
    else { S.inv = 1.9; aviso("¡AMARILLA!", "oro", 1100); }
  }
  function mover(d) {
    if (S.fase !== "corre") return; const l = clamp(S.lane + d, 0, 2); if (l !== S.lane) { S.lane = l; sonCarril(); }
  }
  function saltar() { if (S.fase !== "corre") return; if (S.y <= 0.02) { S.vy = SALTO; S.desl = 0; sonSalto(); for (let i = 0; i < 6; i++) polvo.emite(S.x + rnd(-0.3, 0.3), 0.1, rnd(-0.3, 0.3), rnd(-1, 1), rnd(0.5, 2), rnd(0, 2), 0.6); } }
  function deslizar() { if (S.fase !== "corre") return; if (S.y > 0.05) S.vy = Math.min(S.vy, -14); if (S.desl <= 0) { S.desl = DUR_DESL; sonDesliza(); } }

  /* ── lógica (independiente del dibujo, para poder probarla) ── */
  function logica(dt) {
    if (S.fase === "menu") { S.v = 7; S.dist += S.v * dt; return; }
    if (S.fase === "fin") return;
    const base = 11 + 13 * (1 - Math.exp(-S.dist / 900)), objetivo = S.fase === "choque" ? 0 : base * (S.turbo > 0 ? 1.35 : 1);
    S.v += (objetivo - S.v) * Math.min(1, dt * (S.fase === "choque" ? 3.5 : 1.6));
    const dz = S.v * dt; S.dist += dz;
    if (S.fase === "choque") { S.choque += dt; if (S.choque > 1.1) termina(); }
    /* jugador */
    S.x += (LX[S.lane] - S.x) * Math.min(1, dt * 14);
    if (S.y > 0 || S.vy > 0) { S.vy -= G * dt; S.y += S.vy * dt; if (S.y <= 0) { S.y = 0; S.vy = 0; for (let i = 0; i < 5; i++) polvo.emite(S.x + rnd(-0.3, 0.3), 0.1, rnd(-0.3, 0.3), rnd(-1.2, 1.2), rnd(0.4, 1.6), rnd(0, 2.5), 0.5); } }
    if (S.desl > 0) S.desl -= dt;
    if (S.inv > 0) S.inv -= dt;
    if (S.turbo > 0) { S.turbo -= dt; if (S.turbo <= 0) $("[data-turbo]").hidden = true; else $("[data-turbo-i]").style.transform = "scaleX(" + (S.turbo / 6).toFixed(3) + ")"; }
    /* generación y movimiento */
    if (S.fase === "corre") { S.sig -= dz; if (S.sig <= 0) fila(); }
    const alt = S.desl > 0 ? 0.7 : 1.85;
    for (let i = S.obs.length - 1; i >= 0; i--) {
      const ob = S.obs[i]; ob.z += dz;
      if (ob.tipo === "entrada" && ob.z > -26 && !ob.golpe) { ob.z += 6 * dt; ob.extra = Math.min(1, ob.extra + dt * 3); }
      if (ob.golpe && ob.golpe > 1) { /* derribado en turbo: sale volando */ ob.z += 0; }
      if (ob.z > Z_FIN) { suelta(ob); S.obs.splice(i, 1); continue; }
      if (S.fase !== "corre" || ob.golpe) continue;
      const x = ob.lane < 0 ? 0 : LX[ob.lane], dx = Math.abs(S.x - x), dzz = Math.abs(ob.z);
      if (ob.tipo === "moneda" || ob.tipo === "bota") {
        if (dx < 1.05 && dzz < 0.9 && Math.abs(ob.y - (S.y + (S.desl > 0 ? 0.4 : 0.95))) < (ob.tipo === "bota" ? 1.3 : 1.0)) {
          ob.golpe = 2; suelta(ob); S.obs.splice(i, 1);
          if (ob.tipo === "moneda") { S.monedas++; sonMoneda(); for (let k = 0; k < 7; k++) chispas.emite(x, ob.y, 0, rnd(-2.5, 2.5), rnd(0.5, 4), rnd(-2, 2), 0.55); }
          else { S.turbo = 6; sonTurbo(); aviso("¡TURBO!", "oro", 1200); $("[data-turbo]").hidden = false; for (let k = 0; k < 24; k++) chispas.emite(x, 1, 0, rnd(-4, 4), rnd(0, 5), rnd(-3, 3), 0.8); }
          pintaHud();
        }
        continue;
      }
      let choca = false;
      if (ob.tipo === "def") choca = dx < 0.85 && dzz < 0.6 && S.y < 1.9;
      else if (ob.tipo === "entrada") choca = dx < 0.85 && dzz < 1.0 && S.y < 0.5;
      else if (ob.tipo === "valla") choca = dx < 1.0 && dzz < 0.4 && S.y < 0.72;
      else if (ob.tipo === "cono") choca = dx < 1.6 && dzz < 0.4 && S.y < 0.58 && (ob.lane === 1 ? true : dx < 1.0 + 0.7);
      else if (ob.tipo === "cartel") choca = dzz < 0.35 && S.y + alt > 1.2;
      if (!choca) continue;
      if (S.turbo > 0) { ob.golpe = 2; S.bonus += 25; sonGolpe(); S.shake = reducido ? 0 : 0.2; for (let k = 0; k < 12; k++) chispas.emite(x, 0.9, ob.z, rnd(-4, 4), rnd(1, 5), rnd(-3, 1), 0.7); suelta(ob); S.obs.splice(i, 1); }
      else if (S.inv <= 0) golpea(ob);
    }
    if (S.fase === "corre") {
      S.pts = Math.floor(S.dist) + S.monedas * 10 + S.bonus;
      /* hitos */
      if (!S.tiki && S.dist >= META_TIKI) { S.tiki = true; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } aviso("¡" + META_TIKI + " m! ⚡ +1 tikitexto", "bien", 2200); au.rugido(true); }
      else if (Math.floor(S.dist / 300) > S.hito) { S.hito = Math.floor(S.dist / 300); aviso("¡" + Math.floor(S.dist / 100) * 100 + " m!", "bien", 1000); }
      S.tema = Math.floor(S.dist / 700); pintaHud();
    }
  }

  /* ── dibujo ── */
  function poseSalto(f) {
    POSES.base(f);
    f.pI.h.rotation.x = -1.1; f.pI.k.rotation.x = 1.4; f.pD.h.rotation.x = -0.25; f.pD.k.rotation.x = 0.7;
    f.brI.s.rotation.x = -1.6; f.brD.s.rotation.x = -1.6; f.brI.e.rotation.x = -0.4; f.brD.e.rotation.x = -0.4; f.brI.s.rotation.z = -0.35; f.brD.s.rotation.z = 0.35;
    f.torso.rotation.x = 0.1; f.cadera.position.y = 0.95 + 0.04;
  }
  function poseDesliza(f, p) {
    POSES.base(f);
    f.cadera.rotation.x = -1.18 * p; f.cadera.position.y = lerp(0.95, 0.34, p);
    f.pI.h.rotation.x = -0.15; f.pD.h.rotation.x = -0.25; f.pI.k.rotation.x = 0.1; f.pD.k.rotation.x = 0.25;
    f.brI.s.rotation.x = 0.9 * p; f.brD.s.rotation.x = 0.9 * p; f.brI.s.rotation.z = -0.25; f.brD.s.rotation.z = 0.25; f.cabeza.rotation.x = 0.5 * p;
  }
  function tamano() {
    if (!E || !camara) return; const w = raiz.clientWidth || window.innerWidth, h = raiz.clientHeight || window.innerHeight;
    E.renderer.setSize(w, h, false); camara.aspect = w / h; camara.updateProjectionMatrix();
  }
  const mira = new THREE.Vector3(), camP = new THREE.Vector3();
  function dibuja(dt, dz) {
    const T = S.t;
    /* mundo: scroll de texturas */
    mundo.tC.offset.y += dz / 24; mundo.tL.offset.y += dz / (240 / 18); mundo.scroll.forEach((q) => { q.t.offset.x += dz * q.k; });
    luces.forEach((l) => { l.g.position.z += dz; if (l.g.position.z > 20) l.g.position.z -= 252; });
    /* tema */
    const tt = S.dist / 700; aplicaTema(Math.floor(tt) % 3, tt - Math.floor(tt));
    /* jugador */
    const r = jug.raiz, vx = (LX[S.lane] - S.x);
    r.position.set(S.x, 0, 0); r.rotation.y = Math.PI - clamp(vx * 0.22, -0.45, 0.45); r.rotation.x = 0;
    r.visible = S.inv > 0 ? Math.floor(T * 14) % 2 === 0 : true;
    S.ciclo += dt * (8 + S.v * 0.62);
    if (S.fase === "choque" || S.fase === "fin") { POSES.derrota(jug, T); r.rotation.y = Math.PI; }
    else if (S.y > 0.03) { poseSalto(jug); r.position.y = S.y; }
    else if (S.desl > 0) { poseDesliza(jug, Math.min(1, Math.min(S.desl, DUR_DESL - S.desl) * 9)); }
    else { POSES.carrera(jug, S.fase === "menu" ? 0.9 : 0.1, S.ciclo); if (S.turbo > 0) { jug.torso.rotation.x = 0.4; } }
    if (S.fase === "corre" && S.y <= 0.03 && S.desl <= 0 && Math.random() < dt * S.v * 0.5) polvo.emite(S.x + rnd(-0.2, 0.2), 0.05, rnd(0.2, 0.6), rnd(-0.6, 0.6), rnd(0.2, 0.8), rnd(2, 4), 0.45);
    /* obstáculos */
    S.obs.forEach(function (ob, i) {
      const m = ob.m; if (!m) return;
      if (ob.tipo === "def") { colocaObj(ob); POSES.quieto(m, T + i, true); m.raiz.rotation.y = 0; m.raiz.position.x += Math.sin(T * 2 + ob.ph) * 0.12; }
      else if (ob.tipo === "entrada") { colocaObj(ob); if (ob.extra > 0.01) poseDesliza(m, ob.extra); else POSES.quieto(m, T + i, true); m.raiz.rotation.y = 0; }
      else if (ob.tipo === "moneda") { m.position.set(LX[ob.lane], ob.y + Math.sin(T * 4 + ob.ph) * 0.08, ob.z); m.rotation.y = T * 3 + ob.ph; }
      else if (ob.tipo === "bota") { m.position.set(LX[ob.lane], 1.1 + Math.sin(T * 5) * 0.15, ob.z); const k = 1.4 + Math.sin(T * 8) * 0.15; m.userData.sp.scale.set(k, k, 1); }
      else { m.position.set(ob.lane < 0 ? 0 : LX[ob.lane], 0, ob.z); }
    });
    /* partículas y líneas de velocidad */
    chispas.paso(dt, dz); polvo.paso(dt, dz);
    const vel = clamp((S.v - 15) / 12, 0, 1) + (S.turbo > 0 ? 0.6 : 0);
    lineas.forEach(function (m) {
      m.visible = vel > 0.05 && !reducido; if (!m.visible) return; m.material.opacity = 0.18 + vel * 0.35;
      m.position.z += (S.v * 1.9) * dt; if (m.position.z > 8) { m.position.z = rnd(-40, -20); m.position.x = rnd(-7, 7); m.position.y = rnd(0.3, 5.5); }
    });
    /* cámara */
    const asp = camara.aspect, vert = asp < 0.9;
    const alto = vert ? 4.1 : 3.1, atras = vert ? 8.3 : 6.4;
    camP.set(S.x * 0.55, alto + S.y * 0.3, atras); mira.set(S.x * 0.4, 1.25 + S.y * 0.15, -9);
    if (S.shake > 0) { S.shake = Math.max(0, S.shake - dt * 1.6); camP.x += (Math.random() - 0.5) * S.shake * 0.5; camP.y += (Math.random() - 0.5) * S.shake * 0.4; }
    camara.position.copy(camP); camara.lookAt(mira);
    const fov = (vert ? 74 : 58) + clamp((S.v - 11) * 0.45, 0, 7) + (S.turbo > 0 ? 7 : 0);
    if (Math.abs(camara.fov - fov) > 0.05) { camara.fov = lerp(camara.fov, fov, Math.min(1, dt * 5)); camara.updateProjectionMatrix(); }
    sol.position.set(S.x + 8, 22, 12); sol.target.position.set(S.x, 0, -6); sol.target.updateMatrixWorld();
    E.renderer.render(scene, camara);
  }

  function bucle(ahora) {
    raf = requestAnimationFrame(bucle);
    if (!vivo || !E || !scene) return;
    let dt = Math.min((ahora - ultimo) / 1000, 0.05); ultimo = ahora; if (!(dt > 0)) dt = 0.016;
    S.activo = !document.hidden; if (!S.activo) return;
    fpsAcum += dt; fpsN++; if (fpsAcum > 2.5) { const fps = fpsN / fpsAcum; if (fps < 26 && escala > 0.55) { escala -= 0.15; E.renderer.setPixelRatio((movil ? 1.5 : Math.min(window.devicePixelRatio || 1, 2)) * escala); tamano(); } fpsAcum = 0; fpsN = 0; }
    S.t += dt; const d0 = S.dist; logica(dt); dibuja(dt, S.dist - d0);
  }

  /* ── entrada ── */
  let tocando = false, usado = false, sx = 0, sy = 0;
  raiz.addEventListener("pointerdown", function (e) {
    audioIni(); au.iniciar();
    if (e.target.closest && e.target.closest("[data-sl], [data-menu], [data-fin], .sl-cab")) return;
    tocando = true; usado = false; sx = e.clientX; sy = e.clientY;
  });
  raiz.addEventListener("pointermove", function (e) {
    if (!tocando || usado) return; const dx = e.clientX - sx, dy = e.clientY - sy; if (Math.hypot(dx, dy) < 30) return;
    if (Math.abs(dx) > Math.abs(dy)) mover(dx > 0 ? 1 : -1); else if (dy < 0) saltar(); else deslizar();
    usado = true; /* un gesto = una acción: hay que levantar el dedo para otra */
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((n) => raiz.addEventListener(n, function () { tocando = false; }));
  raiz.addEventListener("click", function (e) {
    const b = e.target.closest ? e.target.closest("[data-sl]") : null; if (!b) return;
    if (b.dataset.sl === "salir") cerrar(); else if (b.dataset.sl === "jugar") empezar();
  });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    const k = e.key.toLowerCase();
    if (S.fase === "menu" || S.fase === "fin") { if ((k === " " || k === "enter") && !e.repeat) { e.preventDefault(); empezar(); } return; }
    if (k === "arrowleft" || k === "a") { e.preventDefault(); mover(-1); }
    else if (k === "arrowright" || k === "d") { e.preventDefault(); mover(1); }
    else if (k === "arrowup" || k === "w" || k === " ") { e.preventDefault(); saltar(); }
    else if (k === "arrowdown" || k === "s") { e.preventDefault(); deslizar(); }
  };
  window.addEventListener("keydown", onKey);
  const hRes = () => tamano(); window.addEventListener("resize", hRes);

  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKey); window.removeEventListener("resize", hRes);
    try { au.ambiente(0); } catch (e) { /* opcional */ }
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    try { if (E) { E.renderer.dispose(); E.renderer.forceContextLoss(); } } catch (e) { /* opcional */ }
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }

  if (E) { try { construye(); } catch (e) { E = null; $("[data-sin]").hidden = false; $("[data-menu]").hidden = true; } }
  pintaRecord(); pintaVidas(); pintaHud();
  if (E) raf = requestAnimationFrame(function (n) { ultimo = n; bucle(n); });
  /* Solo para las pruebas automáticas */
  return { cerrar: cerrar, S: S, E: E, empezar: empezar, mover: mover, saltar: saltar, deslizar: deslizar, logica: logica, fila: fila, pon: pon, limpia: limpiaObs, LX: LX };
}
