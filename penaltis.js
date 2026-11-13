/* PENALTIS 3D · TIKITEXTO
   Módulo propio (carga diferida desde index.html). Usa three.js (lib/three.module.min.js, MIT).
   Todo se dibuja con código: sin escudos, fotos, logos ni marcas. */
import * as THREE from "./lib/three.module.min.js";
import { cargarCuerpos, crearFigura } from "./penaltis_cuerpo.js";

/* Los cuerpos (lib/cuerpo/*.bin) se descargan antes de abrir el juego */
export function precargar() { return cargarCuerpos(["jugador", "portero", "jugador-lo"]); }

/* ───────── Medidas (metros). Portería en z = 0; el punto de penalti en z = 11 ───────── */
const GW = 7.32, GH = 2.44, HW = GW / 2, SPOT = 11, DEPTH = 2.0, RB = 0.11;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const tri = (x) => Math.abs((((x % 2) + 2) % 2) - 1);

function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function textura(c, aniso, repetir) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso || 4;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ───────── Texturas ───────── */
function texCesped(aniso) {
  const S = 2048, c = lienzo(S, S), x = c.getContext("2d");
  const WX = 80, WZ = 80, X0 = -40, Z0 = -14, px = S / WX;
  const X = (wx) => (wx - X0) * px, Z = (wz) => (wz - Z0) * px;
  for (let i = 0; i * 5.5 < WZ + 6; i++) {
    x.fillStyle = i % 2 ? "#2c7a30" : "#34853a";
    x.fillRect(0, Z(Z0 + i * 5.5), S, 5.5 * px + 1);
  }
  for (let i = 0; i < 110000; i++) {
    const a = Math.random() * S, b = Math.random() * S, g = 70 + Math.random() * 70;
    x.fillStyle = "rgba(" + Math.floor(g * 0.35) + "," + Math.floor(g + 20) + "," + Math.floor(g * 0.3) + "," + (0.05 + Math.random() * 0.12) + ")";
    x.fillRect(a, b, 1.4, 2 + Math.random() * 4);
  }
  x.strokeStyle = "rgba(255,255,255,.93)"; x.lineWidth = 0.13 * px; x.lineCap = "butt";
  const L = (x1, z1, x2, z2) => { x.beginPath(); x.moveTo(X(x1), Z(z1)); x.lineTo(X(x2), Z(z2)); x.stroke(); };
  L(-34, 0, 34, 0); L(-34, 0, -34, 66); L(34, 0, 34, 66); L(-34, 52.5, 34, 52.5);
  L(-20.16, 0, -20.16, 16.5); L(20.16, 0, 20.16, 16.5); L(-20.16, 16.5, 20.16, 16.5);
  L(-9.16, 0, -9.16, 5.5); L(9.16, 0, 9.16, 5.5); L(-9.16, 5.5, 9.16, 5.5);
  x.beginPath(); x.arc(X(0), Z(SPOT), 9.15 * px, 0.6447, Math.PI - 0.6447); x.stroke();
  x.fillStyle = "rgba(255,255,255,.95)"; x.beginPath(); x.arc(X(0), Z(SPOT), 0.16 * px, 0, 6.2832); x.fill();
  return textura(c, aniso, false);
}
function texBalon(aniso) {
  const W = 512, H = 256, c = lienzo(W, H), x = c.getContext("2d"), img = x.createImageData(W, H);
  const phi = (1 + Math.sqrt(5)) / 2, V = [];
  [[0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi], [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0], [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]].forEach(function (v) { const l = Math.hypot(v[0], v[1], v[2]); V.push([v[0] / l, v[1] / l, v[2] / l]); });
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const u = i / W * 6.2832, v = (j / H) * Math.PI;
    const d = [Math.sin(v) * Math.cos(u), Math.cos(v), Math.sin(v) * Math.sin(u)];
    let m = -1, m2 = -1;
    for (let k = 0; k < 12; k++) { const t = d[0] * V[k][0] + d[1] * V[k][1] + d[2] * V[k][2]; if (t > m) { m2 = m; m = t; } else if (t > m2) m2 = t; }
    const pent = m > 0.953, costura = (m - m2) < 0.035;
    let g = pent ? 22 : costura ? 150 : 246;
    const o = (j * W + i) * 4; img.data[o] = g; img.data[o + 1] = g; img.data[o + 2] = g + (pent ? 6 : 0); img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return textura(c, aniso, false);
}
function texRed() {
  const c = lienzo(128, 128), x = c.getContext("2d");
  x.strokeStyle = "rgba(245,245,245,.95)"; x.lineWidth = 3;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(128, 0); x.moveTo(0, 0); x.lineTo(0, 128); x.stroke();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function texGrada(semilla) {
  const c = lienzo(1024, 512), x = c.getContext("2d");
  x.fillStyle = "#0d111d"; x.fillRect(0, 0, 1024, 512);
  const pal = [["#d62839", "#e9ecef"], ["#1d4ed8", "#e9ecef"], ["#f5f5f5", "#d62839"], ["#f4c20d", "#1d3557"], ["#2a9d8f", "#f5f5f5"], ["#6c757d", "#adb5bd"]];
  const piel = ["#f1c9a5", "#d9a273", "#a8764d", "#6f4a2f", "#f6d7bd"];
  const filas = 46, cols = 112;
  for (let r = 0; r < filas; r++) {
    const y = 10 + r * (500 / filas);
    x.fillStyle = "rgba(255,255,255,.04)"; x.fillRect(0, y + 8, 1024, 1.5);
    for (let k = 0; k < cols; k++) {
      if (Math.random() < 0.05) continue;
      const px = k * (1024 / cols) + (r % 2) * 4 + (Math.random() - 0.5) * 2, p = pal[Math.floor(((k + semilla + Math.floor(r / 6)) * 0.37 + Math.random() * 1.2) % pal.length)];
      x.fillStyle = p[Math.random() < 0.8 ? 0 : 1];
      x.fillRect(px, y + 3, 6.5, 8);
      x.fillStyle = piel[Math.floor(Math.random() * piel.length)];
      x.beginPath(); x.arc(px + 3.2, y + 1.5, 2.8, 0, 6.2832); x.fill();
    }
  }
  const t = textura(c, 4, true); return t;
}
function texDestellos() {
  const c = lienzo(512, 256), x = c.getContext("2d");
  for (let i = 0; i < 90; i++) {
    const a = Math.random() * 512, b = Math.random() * 256, r = 2 + Math.random() * 3, g = x.createRadialGradient(a, b, 0, a, b, r * 2);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.4, "rgba(255,255,230,.6)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(a - r * 2, b - r * 2, r * 4, r * 4);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function texPublicidad(aniso) {
  const W = 4096, H = 280, c = lienzo(W, H), x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0e2250"); g.addColorStop(0.5, "#0a1a40"); g.addColorStop(1, "#050d26");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  /* rejilla LED muy fina */
  x.fillStyle = "rgba(0,0,0,.18)"; for (let i = 0; i < W; i += 4) x.fillRect(i, 0, 1, H); for (let j = 0; j < H; j += 4) x.fillRect(0, j, W, 1);
  x.fillStyle = "#19e6ff"; x.fillRect(0, 0, W, 8); x.fillRect(0, H - 8, W, 8);
  x.font = "900 170px Arial, Helvetica, sans-serif"; x.textBaseline = "middle"; x.lineJoin = "round";
  const frases = [["TIKITEXTO", "#ffffff"], ["●", "#ff4f7b"], ["FÚTBOL", "#ffd34a"], ["●", "#19e6ff"], ["JUEGA", "#ffffff"], ["●", "#ffd34a"]];
  let tot = 0; frases.forEach(function (f) { tot += x.measureText(f[0]).width + 70; });
  let px = 40;
  frases.forEach(function (f) {
    x.shadowColor = f[1]; x.shadowBlur = 18; x.fillStyle = f[1]; x.fillText(f[0], px, H / 2 + 6);
    x.shadowBlur = 0; x.fillText(f[0], px, H / 2 + 6); px += x.measureText(f[0]).width + 70;
  });
  const t = textura(c, aniso || 16, true); t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; return t;
}
function texCielo() {
  const c = lienzo(4, 256), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#02040a"); g.addColorStop(0.55, "#0a1430"); g.addColorStop(1, "#1b2d55");
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function texBrillo() {
  const c = lienzo(128, 128), x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,250,235,1)"); g.addColorStop(0.25, "rgba(255,240,200,.5)"); g.addColorStop(1, "rgba(255,240,200,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function poseBase(f) {
  f.cadera.position.y = 0.95; f.cadera.rotation.set(0, 0, 0); f.torso.rotation.set(0, 0, 0); f.cabeza.rotation.set(0, 0, 0);
  [f.brI, f.brD].forEach(function (b) { b.s.rotation.set(0, 0, 0); b.e.rotation.set(0, 0, 0); });
  [f.pI, f.pD].forEach(function (p) { p.h.rotation.set(0, 0, 0); p.k.rotation.set(0, 0, 0); });
}
/* Quieto, con respiración */
function poseQuieto(f, t, activo) {
  poseBase(f);
  const r = Math.sin(t * 2.2) * 0.012;
  f.torso.rotation.x = r; f.cabeza.rotation.y = Math.sin(t * 0.7) * 0.15;
  f.brI.s.rotation.z = 0.12; f.brD.s.rotation.z = -0.12; f.brI.e.rotation.x = -0.25; f.brD.e.rotation.x = -0.25;
  if (activo) {
    f.cadera.position.y = 0.9; f.pI.h.rotation.x = -0.28; f.pD.h.rotation.x = -0.28; f.pI.k.rotation.x = 0.55; f.pD.k.rotation.x = 0.55;
    f.torso.rotation.x = 0.12; f.brI.s.rotation.z = 0.7; f.brD.s.rotation.z = -0.7; f.brI.s.rotation.x = -0.4; f.brD.s.rotation.x = -0.4;
  }
}
/* Carrerilla: fase 0..1 con zancadas; el último tramo arma la pierna */
function poseCarrera(f, fase, ciclo) {
  poseBase(f);
  const a = Math.sin(ciclo), b = Math.sin(ciclo + Math.PI), amp = 0.75 * (1 - 0.35 * fase);
  f.pI.h.rotation.x = -a * amp; f.pD.h.rotation.x = -b * amp;
  f.pI.k.rotation.x = Math.max(0, a) * 1.1 + 0.1; f.pD.k.rotation.x = Math.max(0, b) * 1.1 + 0.1;
  f.brI.s.rotation.x = b * 0.7; f.brD.s.rotation.x = a * 0.7; f.brI.e.rotation.x = -0.7; f.brD.e.rotation.x = -0.7;
  f.torso.rotation.x = 0.16; f.cadera.position.y = 0.93 + Math.abs(Math.sin(ciclo)) * 0.03;
}
/* Golpeo con la pierna derecha: k = 0..1 (0 = pierna atrás, 0.55 = contacto, 1 = acompañamiento) */
function poseGolpeo(f, k) {
  poseBase(f);
  const atras = clamp(k / 0.5, 0, 1), fuerza = clamp((k - 0.4) / 0.25, 0, 1), sigue = clamp((k - 0.62) / 0.38, 0, 1);
  f.pD.h.rotation.x = lerp(0.2, 0.95, easeOut(atras)) - fuerza * 2.0 - sigue * 0.3;
  f.pD.k.rotation.x = lerp(0.3, 1.5, atras) - fuerza * 1.4 + sigue * 0.5;
  f.pI.h.rotation.x = -0.25; f.pI.k.rotation.x = 0.35;
  f.cadera.position.y = 0.92;
  f.torso.rotation.x = 0.08 + fuerza * 0.28; f.torso.rotation.y = -0.2 * fuerza;
  f.brI.s.rotation.z = 0.9; f.brD.s.rotation.z = -0.9; f.brI.s.rotation.x = -0.2; f.brD.s.rotation.x = 0.2;
}
function poseFesteja(f, t) {
  poseBase(f);
  const s = Math.abs(Math.sin(t * 6));
  f.cadera.position.y = 0.95 + s * 0.18;
  f.brI.s.rotation.x = -Math.PI * 0.92; f.brD.s.rotation.x = -Math.PI * 0.92; f.brI.s.rotation.z = 0.25; f.brD.s.rotation.z = -0.25;
  f.pI.h.rotation.x = -0.1 - s * 0.3; f.pD.h.rotation.x = -0.1 - s * 0.3; f.pI.k.rotation.x = s * 0.5; f.pD.k.rotation.x = s * 0.5;
  f.cabeza.rotation.x = -0.3;
}
function poseDerrota(f, t) {
  poseBase(f);
  f.torso.rotation.x = 0.4; f.cabeza.rotation.x = 0.5; f.cadera.position.y = 0.93;
  f.brI.s.rotation.x = 0.3; f.brD.s.rotation.x = 0.3; f.brI.e.rotation.x = -0.4; f.brD.e.rotation.x = -0.4;
  f.pI.h.rotation.x = -0.1; f.pD.h.rotation.x = -0.1;
}
/* Portero: p = progreso del salto, gx lado (-1, 0, 1), gy altura (0 bajo, 1 medio, 2 alto) */
function poseParada(f, p, gx, gy) {
  poseBase(f);
  const arriba = lerp(0.1, 1, clamp(gy / 2, 0, 1));
  f.brI.s.rotation.x = -lerp(0.1, Math.PI * (0.55 + 0.4 * arriba), p); f.brD.s.rotation.x = f.brI.s.rotation.x;
  f.brI.s.rotation.z = lerp(0.35, 0.12, p); f.brD.s.rotation.z = -f.brI.s.rotation.z;
  f.pI.h.rotation.x = -lerp(0.2, 0.1, p); f.pD.h.rotation.x = -lerp(0.2, 0.1, p);
  f.pI.k.rotation.x = lerp(0.35, 0.05, p); f.pD.k.rotation.x = lerp(0.35, 0.05, p);
  f.cabeza.rotation.x = -0.15 * p;
  if (Math.abs(gx) > 0.05) f.pI.h.rotation.z = gx * 0.15 * p, f.pD.h.rotation.z = gx * 0.25 * p;
}

/* ───────── Escena: estadio nocturno ───────── */
function crearEscena(canvas, movil, nombre) {
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  const aniso = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  const scene = new THREE.Scene();
  scene.background = texCielo();
  scene.fog = new THREE.FogExp2(0x0a1430, 0.0075);
  const camara = new THREE.PerspectiveCamera(52, 16 / 9, 0.1, 400);
  scene.add(camara);

  /* luces */
  scene.add(new THREE.HemisphereLight(0xa9bcff, 0x1d3a1f, 0.62));
  const sol = new THREE.DirectionalLight(0xfff0d6, 2.4);
  sol.position.set(9, 26, 24); sol.target.position.set(0, 0, 4); scene.add(sol, sol.target);
  sol.castShadow = true; sol.shadow.mapSize.set(movil ? 1024 : 2048, movil ? 1024 : 2048);
  Object.assign(sol.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 80 });
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03;
  const relleno = new THREE.DirectionalLight(0x9db8ff, 0.55); relleno.position.set(-14, 14, -10); scene.add(relleno);

  /* césped */
  const cesped = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ map: texCesped(aniso), roughness: 0.96 }));
  cesped.rotation.x = -Math.PI / 2; cesped.position.set(0, 0, 26); cesped.receiveShadow = true; scene.add(cesped);
  const resto = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x1e5226, roughness: 1 }));
  resto.rotation.x = -Math.PI / 2; resto.position.y = -0.02; scene.add(resto);

  /* portería */
  const goal = new THREE.Group(); scene.add(goal);
  const blanco = new THREE.MeshStandardMaterial({ color: 0xf4f6f8, roughness: 0.32, metalness: 0.1 });
  const poste = (x) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, GH + 0.06, 16), blanco); m.position.set(x, GH / 2, 0); m.castShadow = true; goal.add(m); };
  poste(-HW); poste(HW);
  const larguero = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, GW + 0.12, 16), blanco); larguero.rotation.z = Math.PI / 2; larguero.position.set(0, GH, 0); larguero.castShadow = true; goal.add(larguero);
  const gris = new THREE.MeshStandardMaterial({ color: 0x8e99a6, roughness: 0.5, metalness: 0.5 });
  [-HW, HW].forEach(function (x) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.6, 8), gris); b.rotation.x = Math.PI / 2 - 0.09; b.position.set(x, 1.15, -1.15); goal.add(b);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, DEPTH + 0.2, 8), gris); s.rotation.x = Math.PI / 2; s.position.set(x, 0.03, -DEPTH / 2); goal.add(s);
  });
  const redTex = texRed();
  const redMat = (rx, ry) => { const t = redTex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.9, alphaTest: 0.04 }); };
  const quad = (a, b, c, d, rx, ry) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    const m = new THREE.Mesh(g, redMat(rx, ry)); goal.add(m); return m;
  };
  quad([-HW, GH, 0], [HW, GH, 0], [HW, 2.2, -DEPTH], [-HW, 2.2, -DEPTH], GW / 0.12, DEPTH / 0.12);       /* techo */
  quad([-HW, 0, 0], [-HW, GH, 0], [-HW, 2.2, -DEPTH], [-HW, 0, -DEPTH], DEPTH / 0.12, 2.4 / 0.12);       /* lateral izq. */
  quad([HW, 0, 0], [HW, GH, 0], [HW, 2.2, -DEPTH], [HW, 0, -DEPTH], DEPTH / 0.12, 2.4 / 0.12);           /* lateral der. */
  const fondoG = new THREE.PlaneGeometry(GW, 2.2, 30, 12);
  const fondo = new THREE.Mesh(fondoG, redMat(GW / 0.12, 2.2 / 0.12)); fondo.position.set(0, 1.1, -DEPTH); goal.add(fondo);
  const fondoOrig = fondoG.attributes.position.array.slice();
  const red = { malla: fondo, orig: fondoOrig, x: 0, y: 1, t: 99, a: 0 };

  /* balón */
  const balon = new THREE.Mesh(new THREE.SphereGeometry(RB, 32, 24), new THREE.MeshStandardMaterial({ map: texBalon(aniso), roughness: 0.42, metalness: 0.02 }));
  balon.castShadow = true; scene.add(balon);

  /* gradas con público */
  const grupoGradas = [], destellos = [];
  function grada(ancho, alto, tilt, pos, rotY, sem) {
    const g = new THREE.Group(); g.position.copy(pos); g.rotation.y = rotY; scene.add(g);
    const t = texGrada(sem); t.repeat.set(ancho / 56, alto / 38);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshBasicMaterial({ map: t, color: 0x606878 }));
    m.rotation.x = -tilt; m.position.set(0, alto * Math.cos(tilt) / 2, -alto * Math.sin(tilt) / 2); g.add(m);
    const ft = texDestellos(); ft.repeat.set(ancho / 40, alto / 20);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshBasicMaterial({ map: ft, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.55 }));
    f.rotation.x = -tilt; f.position.copy(m.position); f.position.z += 0.05; g.add(f);
    grupoGradas.push(t); destellos.push(ft);
    const techo = new THREE.Mesh(new THREE.BoxGeometry(ancho + 4, 0.8, 16), new THREE.MeshStandardMaterial({ color: 0x0b0f1a, roughness: 0.8 }));
    techo.position.set(0, alto * Math.cos(tilt) + 0.6, -alto * Math.sin(tilt) + 2); g.add(techo);
    const tira = new THREE.Mesh(new THREE.BoxGeometry(ancho, 0.25, 0.3), new THREE.MeshBasicMaterial({ color: 0xcfe3ff }));
    tira.position.set(0, alto * Math.cos(tilt) - 0.1, -alto * Math.sin(tilt) + 9.9); g.add(tira);
  }
  grada(120, 36, 0.62, new THREE.Vector3(0, 0.4, -14), 0, 1);
  grada(110, 32, 0.62, new THREE.Vector3(-44, 0.4, 20), Math.PI / 2, 3);
  grada(110, 32, 0.62, new THREE.Vector3(44, 0.4, 20), -Math.PI / 2, 5);
  grada(120, 36, 0.62, new THREE.Vector3(0, 0.4, 68), Math.PI, 7);
  /* esquinas para cerrar el estadio */
  grada(30, 32, 0.62, new THREE.Vector3(-40, 0.4, -12), Math.PI / 4, 2);
  grada(30, 32, 0.62, new THREE.Vector3(40, 0.4, -12), -Math.PI / 4, 4);
  grada(30, 32, 0.62, new THREE.Vector3(-40, 0.4, 66), Math.PI * 0.75, 6);
  grada(30, 32, 0.62, new THREE.Vector3(40, 0.4, 66), -Math.PI * 0.75, 8);

  /* vallas publicitarias con letras en movimiento */
  const publi = texPublicidad(renderer.capabilities.getMaxAnisotropy()); publi.repeat.set(5, 1);
  const vallaMat = new THREE.MeshBasicMaterial({ map: publi });
  const valla = (w, pos, rot) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.95, 0.12), vallaMat); m.position.copy(pos); m.rotation.y = rot; scene.add(m); };
  valla(70, new THREE.Vector3(0, 0.48, -9), 0);
  valla(70, new THREE.Vector3(0, 0.48, 62), Math.PI);
  valla(80, new THREE.Vector3(-36.4, 0.48, 30), Math.PI / 2);
  valla(80, new THREE.Vector3(36.4, 0.48, 30), -Math.PI / 2);

  /* torres de focos */
  const brillo = texBrillo(), focos = [];
  [[-52, -22], [52, -22], [-52, 44], [52, 44]].forEach(function (p) {
    const t = new THREE.Group(); t.position.set(p[0], 0, p[1]); scene.add(t);
    const mastil = new THREE.Mesh(new THREE.BoxGeometry(1.1, 38, 1.1), new THREE.MeshStandardMaterial({ color: 0x2a3140 })); mastil.position.y = 19; t.add(mastil);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(9, 5.5, 0.7), new THREE.MeshBasicMaterial({ color: 0xfff3d6 })); panel.position.y = 40; panel.lookAt(0, 20, 8 - p[1] * 0.2); t.add(panel);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: brillo, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.95, fog: false }));
    s.scale.set(46, 46, 1); s.position.set(0, 40, 0.6); t.add(s); focos.push(s);
  });

  const mk = (o) => crearFigura(o);
  const piel = [0xf0c8a0, 0xd9a273, 0xa8764d, 0x7a5233];
  const yo = mk({ cuerpo: "jugador", camisa2: 0xffffff, camisa: 0x1d5fd6, pantalon: 0xf2f4f8, media: 0x1d5fd6, piel: piel[0], pelo: 0x2b1b12, dorsal: 7, nombre: nombre, numColor: "#ffffff", manga: true });
  const cpu = mk({ cuerpo: "jugador", camisa2: 0xffffff, camisa: 0xd62839, pantalon: 0xf2f4f8, media: 0xd62839, piel: piel[2], pelo: 0x14100c, dorsal: 9, nombre: "RIVAL", numColor: "#ffffff", manga: true });
  const porCpu = mk({ cuerpo: "portero", camisa2: 0x1a1a1a, camisa: 0xff8a00, pantalon: 0x1a1a1a, media: 0x1a1a1a, piel: piel[1], pelo: 0x3a2a1a, guante: 0xe8ff3a, largo: true, alto: 1.03 });
  const porYo = mk({ cuerpo: "portero", camisa2: 0x1a1a1a, camisa: 0x1fb86a, pantalon: 0x1a1a1a, media: 0x1a1a1a, piel: piel[0], pelo: 0x2b1b12, guante: 0xe8ff3a, largo: true });
  const arbitro = mk({ cuerpo: "jugador-lo", cara: false, camisa: 0x111111, pantalon: 0x111111, media: 0x111111, piel: piel[3], pelo: 0x0e0a08, manga: true });
  const figuras = [yo, cpu, porCpu, porYo, arbitro];
  figuras.forEach(function (f) { scene.add(f.raiz); });
  arbitro.raiz.position.set(-9.5, 0, SPOT + 5.5); arbitro.raiz.rotation.y = Math.PI * 0.85;
  /* resto de jugadores esperando en el círculo central de la zona */
  const espera = [];
  [[-6, 24], [-4.2, 25.5], [-2.2, 26], [2.4, 26], [4.4, 25.4], [6.2, 24]].forEach(function (p, i) {
    const f = mk({ cuerpo: "jugador-lo", cara: false, camisa2: 0xffffff, camisa: i < 3 ? 0x1d5fd6 : 0xd62839, pantalon: 0xf2f4f8, media: i < 3 ? 0x1d5fd6 : 0xd62839, piel: piel[i % 4], pelo: 0x1c140f, manga: true });
    f.raiz.position.set(p[0], 0, p[1]); f.raiz.rotation.y = Math.PI + (p[0] > 0 ? 0.2 : -0.2); scene.add(f.raiz); espera.push(f);
  });

  /* retícula de puntería en la portería */
  const retic = new THREE.Group(); retic.visible = false; scene.add(retic);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 36), new THREE.MeshBasicMaterial({ color: 0xffdd33, transparent: true, opacity: 0.95, fog: false }));
  const aro2 = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, fog: false }));
  retic.add(aro, aro2); retic.position.z = 0.12;

  /* guantes en primera persona (cuando paras tú) */
  const manos = new THREE.Group(); manos.visible = false; camara.add(manos);
  /* Guantes de portero en primera persona: palma con relieve, 4 dedos de 3 falanges, pulgar de 2, almohadilla, correa de velcro y manga */
  const texGuante = (dorso) => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 256; const g = c.getContext("2d");
    if (dorso) {
      const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#f4ff5a"); gr.addColorStop(1, "#c4ee1a"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      g.fillStyle = "#0e1d36"; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(40 + i * 48, 250); g.lineTo(52 + i * 48, 120); g.lineTo(64 + i * 48, 250); g.fill(); }
      g.strokeStyle = "rgba(10,20,40,.7)"; g.lineWidth = 4; g.strokeRect(14, 14, 228, 228);
      g.fillStyle = "rgba(255,255,255,.9)"; g.font = "900 34px system-ui"; g.textAlign = "center"; g.fillText("TIKI", 128, 60);
    } else {
      g.fillStyle = "#f2f2ee"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(0,0,0,.14)"; g.lineWidth = 2;
      for (let y = 0; y < 256; y += 10) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  };
  const mDorso = new THREE.MeshStandardMaterial({ map: texGuante(true), roughness: 0.62, metalness: 0.02 });
  const mLatex = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.9 });
  const mOscuro = new THREE.MeshStandardMaterial({ color: 0x0e1d36, roughness: 0.7 });
  const mVelcro = new THREE.MeshStandardMaterial({ color: 0xdfe6ee, roughness: 1 });
  const mmat = new THREE.MeshStandardMaterial({ color: 0x1fb86a, roughness: 0.8 });
  const mano = (lado) => {
    const g = new THREE.Group();
    const sh = new THREE.Shape(), w = 0.095, h = 0.1, r = 0.03;
    sh.moveTo(-w + r, -h); sh.lineTo(w - r, -h); sh.quadraticCurveTo(w, -h, w, -h + r); sh.lineTo(w, h - r); sh.quadraticCurveTo(w, h, w - r, h); sh.lineTo(-w + r, h); sh.quadraticCurveTo(-w, h, -w, h - r); sh.lineTo(-w, -h + r); sh.quadraticCurveTo(-w, -h, -w + r, -h);
    const palma = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 5, curveSegments: 10 }), [mDorso, mDorso]);
    palma.position.z = -0.0175; g.add(palma);
    const cara = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.21), new THREE.MeshStandardMaterial({ map: texGuante(false), roughness: 0.9 })); cara.position.z = -0.0565; cara.rotation.y = Math.PI; g.add(cara);
    const dedo = (x, largo, rad, curv, abre) => {
      const raiz = new THREE.Group(); raiz.position.set(x, h - 0.005, 0); raiz.rotation.z = abre; g.add(raiz);
      let padre = raiz; const frac = [0.45, 0.32, 0.23];
      for (let i = 0; i < 3; i++) {
        const L = largo * frac[i], rr = rad * (1 - i * 0.08), art = new THREE.Group(); art.rotation.x = -curv * (0.5 + i * 0.5); padre.add(art);
        const seg = new THREE.Mesh(new THREE.CapsuleGeometry(rr, L - rr * 0.6, 6, 14), i === 2 ? mDorso : mDorso); seg.scale.set(1, 1, 0.82); seg.position.y = L / 2; art.add(seg);
        const dorso = new THREE.Mesh(new THREE.BoxGeometry(rr * 0.8, L * 0.8, 0.004), mOscuro); dorso.position.set(0, L / 2, rr * 0.8); art.add(dorso);
        const pul = new THREE.Mesh(new THREE.CapsuleGeometry(rr * 0.82, L * 0.7, 4, 10), mLatex); pul.scale.set(1, 1, 0.5); pul.position.set(0, L / 2, -rr * 0.55); art.add(pul);
        const n = new THREE.Group(); n.position.y = L; art.add(n); padre = n;
      }
    };
    dedo(-0.07, 0.135, 0.0215, 0.28, 0.1); dedo(-0.023, 0.15, 0.0225, 0.24, 0.03); dedo(0.023, 0.14, 0.0215, 0.26, -0.04); dedo(0.068, 0.112, 0.019, 0.3, -0.13);
    /* pulgar */
    const pg = new THREE.Group(); pg.position.set(-lado * 0.09, -0.045, 0); pg.rotation.z = lado * 0.95; pg.rotation.y = lado * 0.25; g.add(pg);
    [0.07, 0.055].forEach((L, i) => {
      const art = new THREE.Group(); if (i) { art.position.y = 0.07; art.rotation.x = -0.35; } pg.add(art); if (i) { pg.add(art); }
      const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.024 - i * 0.003, L, 6, 14), mDorso); seg.scale.set(1, 1, 0.85); seg.position.y = L / 2 + 0.01; art.add(seg);
    });
    /* muñeca: elástico + correa de velcro */
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.082, 0.07, 24), mOscuro); cuff.position.set(0, -0.135, 0); cuff.scale.z = 0.62; g.add(cuff);
    const correa = new THREE.Mesh(new THREE.CylinderGeometry(0.081, 0.085, 0.05, 24, 1, true), mDorso); correa.position.set(0, -0.175, 0); correa.scale.z = 0.64; g.add(correa);
    const vel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.034, 0.008), mVelcro); vel.position.set(0, -0.175, 0.056); g.add(vel);
    const brazo = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.088, 0.55, 20), mmat); brazo.scale.z = 0.8; brazo.position.set(0, -0.5, 0); g.add(brazo);
    return g;
  };
  const mI = mano(-1), mD = mano(1); manos.add(mI, mD); manos.scale.setScalar(0.52);

  return { renderer, scene, camara, sol, cesped, goal, red, balon, grupoGradas, destellos, vallaTex: publi, focos, yo, cpu, porCpu, porYo, arbitro, espera, retic, manos, mI, mD };
}

/* ───────── Sonido (sintetizado; respeta el ajuste de sonido de la web) ───────── */
function crearAudio(api) {
  let ctx = null, ruido = null, amb = null, ambG = null;
  function iniciar() {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    try {
      const A = window.AudioContext || window.webkitAudioContext; ctx = new A();
      const n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); let l = 0;
      for (let i = 0; i < n; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.6; }
      ruido = b;
      amb = ctx.createBufferSource(); amb.buffer = ruido; amb.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 520; f.Q.value = 0.5;
      ambG = ctx.createGain(); ambG.gain.value = 0; amb.connect(f); f.connect(ambG); ambG.connect(ctx.destination); amb.start();
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.23; lg.gain.value = 120; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    } catch (e) { ctx = null; }
  }
  const ok = () => ctx && api.sonido();
  function tono(f, dur, vol, tipo, f2) {
    if (!ok()) return; const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function soplo(dur, vol, f, tipo, q) {
    if (!ok()) return; const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), t = ctx.currentTime;
    s.buffer = ruido; fl.type = tipo || "bandpass"; fl.frequency.value = f; fl.Q.value = q || 0.7;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.06, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(ctx.destination); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  return {
    iniciar: iniciar,
    ambiente: function (v) { if (ctx && ambG) ambG.gain.setTargetAtTime(api.sonido() ? v : 0, ctx.currentTime, 0.4); },
    golpe: function (f) { tono(140 + f * 80, 0.16, 0.5, "sine", 55); soplo(0.1, 0.35, 900, "bandpass", 0.9); },
    red: function () { soplo(0.55, 0.28, 2600, "highpass", 0.5); tono(90, 0.2, 0.18, "sine", 50); },
    poste: function () { tono(1150, 0.7, 0.3, "triangle", 1100); tono(760, 0.5, 0.18, "sine", 740); soplo(0.08, 0.3, 3000, "highpass"); },
    parada: function () { tono(120, 0.14, 0.45, "sine", 70); soplo(0.12, 0.35, 1400, "bandpass", 1.2); },
    pitido: function () {
      if (!ok()) return; const o = ctx.createOscillator(), g = ctx.createGain(), l = ctx.createOscillator(), lg = ctx.createGain(), t = ctx.currentTime;
      o.type = "square"; o.frequency.value = 2900; l.frequency.value = 38; lg.gain.value = 140; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.02); g.gain.setValueAtTime(0.09, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
      o.connect(g); g.connect(ctx.destination); o.start(t); l.start(t); o.stop(t + 0.65); l.stop(t + 0.65);
    },
    rugido: function (alegre) { soplo(2.6, alegre ? 0.9 : 0.5, alegre ? 900 : 380, "bandpass", 0.4); if (alegre) tono(660, 0.25, 0.05, "triangle"); },
    suspiro: function () { soplo(1.4, 0.45, 320, "bandpass", 0.5); },
    paso: function () { soplo(0.05, 0.12, 700, "lowpass"); },
  };
}

/* ───────── Dificultad ───────── */
const DIF = {
  facil: { lee: 0.26, barras: [1.15, 1.0, 1.25], T: [1.25, 1.45], pista: 0.9, mult: 0.92, fallo: 0.12 },
  normal: { lee: 0.4, barras: [1.55, 1.35, 1.7], T: [1.0, 1.2], pista: 0.65, mult: 1.0, fallo: 0.1 },
  dificil: { lee: 0.54, barras: [2.0, 1.8, 2.2], T: [0.85, 1.0], pista: 0.4, mult: 1.08, fallo: 0.08 },
  leyenda: { lee: 0.66, barras: [2.5, 2.3, 2.7], T: [0.75, 0.9], pista: 0.2, mult: 1.15, fallo: 0.06 },
};
const EY = [0.5, 1.05, 1.95];
const DUR_PARADA = 0.42, RETRASO_PORTERO = 0.14;
function zona(x0, gx, gy, tt, mult) {
  /* gx: -1..1 (lado), gy: 0..2 (0 = raso, 1 = medio, 2 = alto); valores continuos */
  const p = clamp(tt / DUR_PARADA, 0, 1), e = easeOut(p), ex = x0 + gx * 2.75;
  const ey = gy <= 1 ? lerp(EY[0], EY[1], gy) : lerp(EY[1], EY[2], gy - 1);
  const fx = Math.min(1, Math.abs(gx) * 1.5), fy = Math.min(1, Math.abs(gy - 1) * 1.5);
  return { cx: lerp(x0, ex, e), cy: lerp(1.0, ey, e), rx: (0.82 + 0.5 * e * (0.4 + 0.6 * fx)) * mult, ry: (0.85 + 0.35 * e * (0.2 + 0.8 * fy)) * mult, p: p };
}
const dentroZona = (z, bx, by) => Math.pow((bx - z.cx) / z.rx, 2) + Math.pow((by - z.cy) / z.ry, 2) < 1;

const PLANTILLA = `
<canvas class="pn-cv"></canvas><div class="pn-vineta"></div>
<div class="pn-tap" data-pn="tap"></div>
<div class="pn-cab">
  <button type="button" class="pn-btn" data-pn="salir" aria-label="Salir">✕</button>
  <div class="pn-marcador">
    <div class="pn-eq pn-eq--yo"><b>TÚ</b><span class="pn-bolas" data-b="yo"></span><em data-g="yo">0</em></div>
    <div class="pn-ronda"><small>Ronda</small><b data-r>1</b></div>
    <div class="pn-eq pn-eq--cpu"><em data-g="cpu">0</em><span class="pn-bolas" data-b="cpu"></span><b>CPU</b></div>
  </div>
  <button type="button" class="pn-btn" data-pn="fs" aria-label="Pantalla completa">⛶</button>
</div>
<div class="pn-turno" data-turno></div>
<div class="pn-aviso" data-aviso></div>
<div class="pn-barras" data-barras hidden>
  <div class="pn-bhead"><svg class="pn-logo" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 28 9v14l-12 7L4 23V9z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="16" cy="16" r="6" fill="none" stroke="#fff" stroke-width="1.4"/><path d="m16 12.6 3.2 2.3-1.2 3.8h-4l-1.2-3.8z" fill="#fff"/></svg><b>TIKI<i>TEXTO</i></b><small>3D</small></div>
  <div class="pn-barra" data-barra><span>Fuerza</span><div class="pn-pista pn-pista--fza"><i></i><u></u></div></div>
  <p class="pn-pista-txt"><span class="pn-t-ap"><span class="pn-solo-pc">Haz clic en la portería para apuntar</span><span class="pn-solo-tactil">Toca la portería para apuntar</span></span><span class="pn-t-fz"><span class="pn-solo-pc">Clic o espacio: para en el verde</span><span class="pn-solo-tactil">Toca otra vez: para en el verde</span></span></p>
</div>
<div class="pn-por" data-por hidden>
  <div class="pn-cuad" data-cuad><button type="button" class="pn-celda" data-celda="0"><i>Q</i></button><button type="button" class="pn-celda" data-celda="1"><i>W</i></button><button type="button" class="pn-celda" data-celda="2"><i>E</i></button><button type="button" class="pn-celda" data-celda="3"><i>A</i></button><button type="button" class="pn-celda" data-celda="4"><i>S</i></button><button type="button" class="pn-celda" data-celda="5"><i>D</i></button></div>
  <p class="pn-pista-txt"><span class="pn-solo-pc">Pulsa Q W E / A S D para lanzarte a un cuadrante</span><span class="pn-solo-tactil">Toca el cuadrante al que te lanzas</span></p>
</div>
<div class="pn-menu" data-menu>
  <div class="pn-caja">
    <p class="pn-kicker">TANDA DE PENALTIS</p>
    <h2>PENALTIS 3D</h2>
    <p class="pn-sub">Tira como en la vida real y párale el penalti a la máquina.</p>
    <div class="pn-difs" data-difs>
      <button type="button" data-dif="facil">Fácil</button><button type="button" data-dif="normal">Normal</button><button type="button" data-dif="dificil">Difícil</button><button type="button" data-dif="leyenda">Leyenda</button>
    </div>
    <ul class="pn-como">
      <li><b>Cuando tiras</b><span>Toca la portería para apuntar y para la barra de fuerza en el verde (muy estrecho). Fuera del verde el tiro se desvía.</span></li>
      <li><b>Cuando paras</b><span>Elige uno de los 6 cuadrantes de la portería (toca la zona o pulsa Q W E / A S D). Si el balón va a ese cuadrante, la paras. Fíjate en la carrerilla del rival: puede delatar a dónde tira.</span></li>
    </ul>
    <p class="pn-rec" data-rec></p>
    <button type="button" class="pn-jugar" data-pn="jugar">¡Jugar!</button>
  </div>
</div>
<div class="pn-fin" data-fin hidden>
  <div class="pn-caja">
    <h2 data-fin-t></h2>
    <p class="pn-fin-m" data-fin-m></p>
    <p class="pn-fin-tiki" data-fin-tiki hidden>⚡ +1 tikitexto</p>
    <div class="pn-fin-b"><button type="button" class="pn-jugar" data-pn="otra">Jugar otra vez</button><button type="button" class="pn-sec" data-pn="salir">Salir</button></div>
  </div>
</div>
<div class="pn-gira" data-gira><div><span class="pn-gira__mov">📱</span><b>Gira el móvil</b><small>Este modo solo funciona en horizontal.</small></div></div>
<div class="pn-sin" data-sin hidden><div><b>No se puede mostrar el 3D</b><small>Tu dispositivo o navegador no admite gráficos 3D (WebGL).</small><button type="button" class="pn-sec" data-pn="salir">Salir</button></div></div>
`;

/* ───────── Juego ───────── */
export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  const movil = (window.matchMedia && matchMedia("(pointer: coarse)").matches) || /Android|iPhone|iPad/i.test(navigator.userAgent);
  raiz.innerHTML = PLANTILLA;
  raiz.classList.toggle("pn-tactil", movil);
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  const cv = $(".pn-cv");
  let E = null;
  try { E = crearEscena(cv, movil, (api.nombre ? api.nombre() : "") || ("INVITADO " + (api.invitado ? api.invitado() : "")).trim()); } catch (e) { E = null; }
  if (!E) { $("[data-sin]").hidden = false; $("[data-menu]").hidden = true; $("[data-gira]").style.display = "none"; }
  const au = crearAudio(api);
  const datos = () => { const d = api.datos(); ["gan", "per", "par", "gol", "racha", "mejor", "tandas"].forEach(function (k) { if (typeof d[k] !== "number") d[k] = 0; }); if (!d.dif) d.dif = "normal"; return d; };
  const reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const S = {
    fase: "menu", dif: datos().dif, turno: "yo", res: { yo: [], cpu: [] }, t: 0, tFase: 0, hist: [0, 0, 0], activo: true, slow: 1,
    barI: 0, barV: [0.5, 0.5, 0.5], barF: [0, 0, 0], barT0: 0, tiro: null, shake: 0, orbita: 0, ciclo: 0, cel: null, libre: null, bt: 0,
  };
  const K = { x: 0, dive: null };
  const camBase = new THREE.Vector3(), mira = new THREE.Vector3();
  let raf = 0, ultimo = 0, vivo = true, fpsAcum = 0, fpsN = 0, escala = 1, tFlash = 0;

  /* ── Interfaz ── */
  function aviso(txt, clase, ms) {
    const a = $("[data-aviso]"); a.className = "pn-aviso pn-aviso--" + (clase || "n"); a.textContent = t(txt);
    void a.offsetWidth; a.classList.add("pn-aviso--on");
    clearTimeout(aviso.h); aviso.h = setTimeout(function () { a.classList.remove("pn-aviso--on"); }, ms || 1800);
  }
  function turnoTxt(txt) { $("[data-turno]").textContent = txt ? t(txt) : ""; }
  const cuenta = (a) => a.filter(Boolean).length;
  function pintaMarcador() {
    ["yo", "cpu"].forEach(function (q) {
      const r = S.res[q], n = Math.max(5, S.res.yo.length, S.res.cpu.length), cont = $('[data-b="' + q + '"]'); let h = "";
      for (let i = 0; i < n; i++) h += '<s class="' + (i < r.length ? (r[i] ? "ok" : "ko") : "") + '"></s>';
      cont.innerHTML = h; $('[data-g="' + q + '"]').textContent = cuenta(r);
    });
    $("[data-r]").textContent = (S.turno === "yo" ? S.res.yo.length : S.res.cpu.length) + 1;
  }
  function pintaRecord() {
    const d = datos();
    $("[data-rec]").textContent = d.gan || d.per ? "🏆 " + d.gan + " · " + d.per + " · ⚽ " + d.mejor : "";
    $$("[data-dif]").forEach(function (b) { b.classList.toggle("on", b.dataset.dif === S.dif); });
  }
  function setBarra(i, v) { const b = $('[data-barra] i'); if (b) b.style.left = (v * 100).toFixed(1) + "%"; }

  /* ── Posiciones ── */
  const KICK0 = new THREE.Vector3(-0.9, 0, SPOT + 3.8);
  function colocaFiguras() {
    const { yo, cpu, porCpu, porYo, balon } = E;
    [yo, cpu, porCpu, porYo].forEach(function (f) { f.raiz.visible = false; poseBase(f); f.raiz.rotation.set(0, 0, 0); });
    balon.position.set(0, RB, SPOT); balon.rotation.set(0, 0, 0); S.libre = null; E.retic.visible = false; E.manos.visible = false;
    S.kick = S.turno === "yo" ? yo : cpu;
    S.kick.raiz.visible = true; S.kick.raiz.position.set(KICK0.x, 0, KICK0.z); S.kick.raiz.rotation.set(0, Math.PI, 0);
    S.port = null;
    if (S.turno === "yo") { S.port = porCpu; porCpu.raiz.visible = true; porCpu.raiz.position.set(0, 0, 0.2); porCpu.raiz.rotation.set(0, 0, 0); }
    S.pdx = 0; S.pgx = 0; S.pgy = 1; S.pt0 = -1; S.pp = 0;
    K.x = 0; K.dive = null; $$("[data-celda]").forEach(function (c) { c.classList.remove("sel", "off"); });
  }
  function preparar() {
    colocaFiguras(); pintaMarcador();
    S.cel = null; S.tiro = null; S.fase = "espera"; S.tFase = S.t;
    $("[data-barras]").hidden = true; $("[data-por]").hidden = true;
    if (S.turno === "yo") {
      turnoTxt("Tu turno: ¡tira!");
      E.camara.fov = 50; E.camara.updateProjectionMatrix();
      S.sub = "apuntar"; S.aim = null; S.hov = { x: 0, y: 1.3 }; S.barV = [0.5, 0.5, 0.0]; S.barT0 = S.t;
      const D = DIF[S.dif]; S.barPh = Math.random() * 2; S.barVel = D.barras[2] * 0.85;
      $("[data-barra]").classList.remove("on", "fija"); $("[data-barras]").classList.remove("fza");
      setTimeout(function () { if (vivo && S.fase === "espera" && S.turno === "yo") { S.fase = "barras"; S.tFase = S.t; S.barT0 = S.t; $("[data-barras]").hidden = false; E.retic.visible = true; au.pitido(); } }, 1100);
    } else {
      turnoTxt("Turno del rival: ¡párala!");
      E.camara.fov = 58; E.camara.updateProjectionMatrix();
      $("[data-por]").hidden = false; E.manos.visible = true;
      S.espera = rnd(1.8, 2.8);
    }
  }

  /* ── Tiros ── */
  function elegirParadaCpu(tx, ty) {
    const D = DIF[S.dif], lado = tx < -1.3 ? -1 : tx > 1.3 ? 1 : 0, alt = ty < 0.75 ? 0 : ty > 1.55 ? 2 : 1;
    let gx, gy;
    if (Math.random() < D.lee) { gx = lado; gy = Math.random() < 0.65 ? alt : Math.floor(rnd(0, 3)); }
    else {
      const w = [1 + S.hist[0] * 0.9, 1 + S.hist[1] * 0.6, 1 + S.hist[2] * 0.9]; let r = Math.random() * (w[0] + w[1] + w[2]), i = 0;
      while (i < 2 && r > w[i]) { r -= w[i]; i++; }
      gx = i - 1; gy = Math.random() < 0.35 ? 0 : Math.random() < 0.5 ? 1 : 2;
    }
    return { gx: gx, gy: gy };
  }
  /* ¿el portero llegaría al balón con esa parada? (misma cuenta que resolver) */
  function llegaP(gx, gy, tx, ty, T) {
    if (!(Math.abs(tx) < HW - 0.1 && ty < GH - 0.1)) return false;
    return dentroZona(zona(0, gx, gy, T - RETRASO_PORTERO, DIF[S.dif].mult), tx, ty);
  }
  function lanzarTuyo() {
    /* apuntado con el toque (S.aim) + una sola barra de fuerza: verde al centro = tiro limpio */
    const pos = S.barV[2], e = Math.abs(pos - 0.5) * 2;
    let tx = S.aim.x, ty = S.aim.y;
    const desv = e < 0.08 ? 0.03 : 0.03 + Math.pow(e - 0.08, 1.2) * 2.1;
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * desv;
    tx += Math.cos(a) * r; ty += Math.sin(a) * r * 0.75;
    if (pos > 0.5) ty += (e - 0.5 > 0 ? (e - 0.5) * 1.6 : 0);
    const p = clamp(0.25 + pos * 0.75, 0, 1);
    const T = lerp(1.0, 0.5, clamp(p, 0, 1)) * (pos < 0.12 ? 1.2 : 1);
    let par = elegirParadaCpu(tx, ty);
    const lado = tx < -1.3 ? -1 : tx > 1.3 ? 1 : 0;
    S.hist[lado + 1]++;
    if (llegaP(par.gx, par.gy, tx, ty, T)) {
      /* parada: el portero se lanza hasta el punto exacto donde llega el balón */
      const gx2 = clamp(tx / 2.75, -1.45, 1.45), gy2 = ty <= 1.05 ? clamp((ty - EY[0]) / (EY[1] - EY[0]), 0, 1) : clamp(1 + (ty - EY[1]) / (EY[2] - EY[1]), 1, 2);
      if (llegaP(gx2, gy2, tx, ty, T)) par = { gx: gx2, gy: gy2 };
    }
    S.tiro = { tx: tx, ty: Math.max(ty, RB), T: T, p: p, sag: 0.18 + clamp(ty, 0, 2.5) * 0.1, sw: (Math.random() - 0.5) * 0.3 * e, gx: par.gx, gy: par.gy, quien: "yo", panenka: false };
    S.fase = "carrera"; S.tFase = S.t; S.xs = rnd(-1.6, -0.4); E.retic.visible = false;
    $("[data-barras]").hidden = true; turnoTxt("");
  }
  function lanzarCpu() {
    const D = DIF[S.dif]; let lado = Math.random(); lado = lado < 0.4 ? -1 : lado < 0.8 ? 1 : 0;
    if (S.dif === "leyenda" && lado === 0 && Math.random() < 0.6) lado = Math.random() < 0.5 ? -1 : 1;
    const a = Math.random(); const alt = a < 0.5 ? 0 : a < 0.72 ? 1 : 2;
    let tx = lado === 0 ? rnd(-0.7, 0.7) : lado * rnd(2.3, 3.5), ty = alt === 0 ? rnd(0.3, 0.75) : alt === 1 ? rnd(0.95, 1.4) : rnd(1.85, 2.3);
    let panenka = false;
    if ((S.dif === "dificil" || S.dif === "leyenda") && Math.random() < 0.09) { panenka = true; tx = rnd(-0.3, 0.3); ty = rnd(0.9, 1.2); lado = 0; }
    else if (Math.random() < D.fallo) { if (Math.random() < 0.5) tx = (Math.random() < 0.5 ? -1 : 1) * rnd(3.9, 4.6); else ty = rnd(2.7, 3.2); }
    const T = panenka ? 1.5 : rnd(D.T[0], D.T[1]);
    const verdad = Math.random() < D.pista;
    S.xs = lado === 0 ? (Math.random() < 0.5 ? -1 : 1) * rnd(0.9, 1.6) : (verdad ? -lado : lado) * rnd(1.8, 2.6);
    S.tiro = { tx: tx, ty: ty, T: T, p: 0.75, sag: panenka ? 1.5 : 0.18 + ty * 0.1, sw: (Math.random() - 0.5) * 0.4, quien: "cpu", panenka: panenka, lado: lado };
    S.fase = "carrera"; S.tFase = S.t; turnoTxt("");
  }
  const RUN = 0.85, GOLPE = 0.42, CONTACTO = GOLPE * 0.55;
  function contacto() {
    const ti = S.tiro; S.vol = { t: 0 };
    S.fase = "vuelo"; S.tFase = S.t; S.bt = 0;
    ti.t0 = S.t; ti.x0 = 0;
    au.golpe(ti.p); S.shake = 0.06;
    if (S.turno === "yo") { S.pt0 = S.t + RETRASO_PORTERO; S.pgx = ti.gx; S.pgy = ti.gy; }
  }
  function resolver() {
    const ti = S.tiro, tx = ti.tx, ty = ti.ty, R = RB + 0.06;
    let tipo = "gol";
    const dentroMarco = Math.abs(tx) < HW + R && ty < GH + R;
    const tocaPoste = Math.abs(Math.abs(tx) - HW) < R && ty < GH + 0.02;
    const tocaLarg = Math.abs(ty - GH) < R && Math.abs(tx) < HW;
    if (!dentroMarco) tipo = "fuera";
    else if (tocaPoste) tipo = "poste";
    else if (tocaLarg) tipo = "larguero";
    else {
      let z;
      if (ti.quien === "yo") z = zona(0, ti.gx, ti.gy, ti.T - RETRASO_PORTERO, DIF[S.dif].mult);
      else if (K.dive) z = zona(K.dive.x0, K.dive.gx, K.dive.gy, 1, 1.0);
      else z = zona(K.x, 0, 1, 0, 1.0);
      S.zonaP = z;
      if (ti.quien === "cpu") {
        /* si el balón va al cuadrante elegido (con 35 cm de margen en los bordes), es parada */
        const dv = K.dive;
        if (dv) {
          const col = dv.celda % 3, alto = dv.celda < 3, tol = 0.35;
          const xs = [[HW / 3, HW + 0.4], [-HW / 3, HW / 3], [-HW - 0.4, -HW / 3]][col], ys = alto ? [GH / 2, GH + 0.4] : [-0.4, GH / 2];
          if (tx > xs[0] - tol && tx < xs[1] + tol && ty > ys[0] - tol && ty < ys[1] + tol) tipo = "parada";
        }
      } else if (dentroZona(z, tx, ty)) tipo = "parada";
    }
    ti.tipo = tipo;
    /* velocidad al llegar a la línea */
    const vx = tx / ti.T, vz = -SPOT / ti.T, vy = (ty - RB) / ti.T;
    const v = new THREE.Vector3(vx, vy * 0.2, vz);
    if (tipo === "gol") { v.multiplyScalar(0.55); E.red.t = 0; E.red.x = tx; E.red.y = ty; E.red.a = clamp(0.5 + (1 - ti.T) * 0.9, 0.35, 1.1); au.red(); S.shake = 0.28; }
    else if (tipo === "parada") { v.set(rnd(-2.5, 2.5) + (tx - (S.zonaP ? S.zonaP.cx : 0)) * 1.2, rnd(1.5, 4.2), rnd(3.5, 6.5)); au.parada(); S.shake = 0.22; }
    else if (tipo === "poste") { v.set((Math.random() < 0.5 ? -1 : 1) * rnd(1, 3.5), rnd(0.5, 3), rnd(5, 9)); au.poste(); S.shake = 0.2; }
    else if (tipo === "larguero") { v.set(rnd(-2, 2), rnd(-1, 2.5), rnd(4, 8)); au.poste(); S.shake = 0.2; }
    else { v.set(vx * 0.7, rnd(0, 2.5), vz * 0.8); }
    S.libre = { v: v }; S.fase = "resultado"; S.tFase = S.t; S.cel = tipo;
    const gol = tipo === "gol", q = ti.quien;
    S.res[q].push(gol);
    if (q === "yo") { if (gol) datos().gol++; }
    if (q === "cpu" && tipo === "parada") datos().par++;
    const txt = { gol: "¡GOL!", parada: "¡PARADA!", poste: "¡POSTE!", larguero: "¡LARGUERO!", fuera: "¡FUERA!" }[tipo];
    aviso(txt, gol ? "gol" : tipo === "parada" ? "par" : "mal", 2200);
    const alegre = (q === "yo" && gol) || (q === "cpu" && tipo === "parada");
    if (gol && q === "yo") au.rugido(true); else if (gol) au.suspiro(); else if (alegre) au.rugido(true); else if (q === "yo") au.suspiro(); else au.rugido(false);
    pintaMarcador(); turnoTxt("");
    setTimeout(siguiente, 2600);
  }
  function decidido() {
    const a = S.res.yo, b = S.res.cpu, ga = cuenta(a), gb = cuenta(b), na = a.length, nb = b.length;
    if (na <= 5 && nb <= 5) {
      if (ga > gb + (5 - nb)) return "yo"; if (gb > ga + (5 - na)) return "cpu";
      if (na === 5 && nb === 5 && ga !== gb) return ga > gb ? "yo" : "cpu"; return null;
    }
    if (na === nb && ga !== gb) return ga > gb ? "yo" : "cpu"; return null;
  }
  function siguiente() {
    if (!vivo || S.fase !== "resultado") return;
    const ganador = decidido();
    if (ganador) { fin(ganador); return; }
    if (S.res.yo.length === S.res.cpu.length && S.res.yo.length >= 5) aviso("¡Muerte súbita!", "n", 1800);
    S.turno = S.turno === "yo" ? "cpu" : "yo";
    preparar();
  }
  function fin(g) {
    S.fase = "fin"; const d = datos(), gana = g === "yo";
    d.tandas++; if (gana) { d.gan++; d.racha++; if (d.racha > d.mejor) d.mejor = d.racha; } else { d.per++; d.racha = 0; }
    d.dif = S.dif; api.guardar();
    $("[data-fin-t]").textContent = t(gana ? "¡Has ganado la tanda!" : "Has perdido la tanda");
    $("[data-fin-m]").textContent = cuenta(S.res.yo) + " – " + cuenta(S.res.cpu);
    $("[data-fin]").classList.toggle("pn-fin--malo", !gana);
    $("[data-fin-tiki]").hidden = !gana;
    $("[data-fin]").hidden = false; turnoTxt("");
    if (gana) { try { api.tiki(); api.victoria(); } catch (e) { /* opcional */ } au.rugido(true); } else au.suspiro();
  }
  function empezar() {
    au.iniciar(); au.ambiente(0.1);
    S.res = { yo: [], cpu: [] }; S.hist = [0, 0, 0]; S.turno = "yo";
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true;
    datos().dif = S.dif; api.guardar(); preparar();
  }

  /* ── Entrada ── */
  function accion() {
    if (!S.activo) return;
    au.iniciar();
    if (S.fase === "barras" && S.turno === "yo") {
      if (S.t - S.tFase < 0.25) return;
      if (S.sub === "apuntar") { fijaApunte(S.hov); return; }
      if (S.sub === "fuerza") { S.sub = "tirado"; $("[data-barra]").classList.add("fija"); au.golpe(0.2); lanzarTuyo(); }
    }
  }
  /* Apuntar: el toque se proyecta sobre el plano de la portería */
  const rayo = new THREE.Raycaster(), ndc = new THREE.Vector2(), plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), pt = new THREE.Vector3();
  function apunteDe(e) {
    const r = E.renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    E.camara.updateMatrixWorld(); rayo.setFromCamera(ndc, E.camara);
    if (!rayo.ray.intersectPlane(plano, pt)) return null;
    return { x: clamp(pt.x, -HW - 0.45, HW + 0.45), y: clamp(pt.y, 0.12, GH + 0.45) };
  }
  function fijaApunte(a) {
    if (!a) return;
    S.aim = { x: a.x, y: a.y }; S.sub = "fuerza"; S.barT0 = S.t; au.golpe(0.2);
    $("[data-barra]").classList.add("on"); $("[data-barras]").classList.add("fza");
  }
  /* Portero: 6 cuadrantes (arriba/abajo × izquierda/centro/derecha, tal como los ves) */
  function elegirCelda(n) {
    if (!S.activo || S.turno !== "cpu" || K.dive || !(S.fase === "espera" || S.fase === "carrera" || S.fase === "vuelo")) return;
    au.iniciar();
    const col = n % 3, alto = n < 3;
    K.dive = { t0: S.t, gx: -(col - 1), gy: alto ? 1.75 : 0.45, x0: 0, celda: n };
    au.golpe(0.3);
    $$("[data-celda]").forEach(function (c) { c.classList.toggle("sel", +c.dataset.celda === n); c.classList.toggle("off", +c.dataset.celda !== n); });
  }
  const TECLAS_CELDA = { q: 0, w: 1, e: 2, a: 3, s: 4, d: 5 };
  function tecla(e, abajo) {
    const k = e.key;
    if (k === " " || k === "Enter") { if (abajo && !e.repeat) { if (!$("[data-menu]").hidden || !$("[data-fin]").hidden) return; accion(); } e.preventDefault(); return; }
    const c = TECLAS_CELDA[k.toLowerCase()];
    if (abajo && !e.repeat && c != null) { elegirCelda(c); e.preventDefault(); }
  }
  const kd = (e) => tecla(e, true), ku = () => {};
  window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
  raiz.addEventListener("pointerdown", function (e) {
    au.iniciar();
    const b = e.target.closest ? e.target.closest("[data-pn]") : null;
    if (b) return;
    const ce = e.target.closest ? e.target.closest("[data-celda]") : null;
    if (ce) { elegirCelda(+ce.dataset.celda); e.preventDefault(); return; }
    if (e.target.closest && e.target.closest("[data-menu], [data-fin], .pn-cab")) return;
    if (S.turno === "yo") {
      if (S.fase === "barras" && S.sub === "apuntar" && S.t - S.tFase >= 0.25) { const a = apunteDe(e); if (a) { S.hov = a; fijaApunte(a); } }
      else accion();
    }
  });
  raiz.addEventListener("pointermove", function (e) {
    if (S.fase === "barras" && S.sub === "apuntar" && e.pointerType !== "touch") { const a = apunteDe(e); if (a) S.hov = a; }
  });
  raiz.addEventListener("click", function (e) {
    const b = e.target.closest ? e.target.closest("[data-pn], [data-dif]") : null; if (!b) return;
    if (b.dataset.dif) { S.dif = b.dataset.dif; pintaRecord(); return; }
    const a = b.dataset.pn;
    if (a === "salir") cerrar(); else if (a === "jugar" || a === "otra") empezar();
    else if (a === "fs") alternarPantallaCompleta();
  });
  function alternarPantallaCompleta() {
    try { if (document.fullscreenElement) document.exitFullscreen(); else if (raiz.requestFullscreen) raiz.requestFullscreen(); } catch (e) { /* opcional */ }
  }

  /* ── Tamaño y orientación ── */
  function tamano() {
    const w = raiz.clientWidth || window.innerWidth, h = raiz.clientHeight || window.innerHeight;
    if (!E) return;
    E.renderer.setSize(w, h, false); E.camara.aspect = w / h; E.camara.updateProjectionMatrix();
  }
  const hRes = () => tamano();
  window.addEventListener("resize", hRes);
  const vertical = () => movil && window.innerHeight > window.innerWidth;
  function intentaHorizontal() { try { if (movil && screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () {}); } catch (e) { /* opcional */ } }
  intentaHorizontal();

  /* ── Bucle ── */
  function figuraPortero(f, p, gx, gy, x0, t) {
    if (!f) return;
    const e = easeOut(p), g = clamp(gy - 1, -1, 1), y = Math.sin(Math.PI * p) * (g > 0 ? 0.12 + 0.43 * g : 0.12 * (1 + g));
    f.raiz.position.x = lerp(x0, x0 + gx * 2.75, e); f.raiz.position.y = y;
    f.raiz.rotation.z = -gx * e * (g < 0 ? 1.2 - 0.25 * g : 1.2 - 0.2 * g);
    if (p <= 0.001) poseQuieto(f, t, true); else poseParada(f, p, gx, gy);
  }
  function ponCamara(dt, t) {
    const c = E.camara; let fx = 0, fy = 0;
    if (S.fase === "menu") {
      S.orbita += dt * 0.12; const a = S.orbita;
      c.position.set(Math.sin(a) * 15, 3.4 + Math.sin(a * 0.7) * 0.8, 6 + Math.cos(a) * 12); mira.set(0, 1.2, 2.5); c.fov = 46;
    } else if (S.turno === "yo") {
      let k = 0;
      if (S.fase === "vuelo" || S.fase === "resultado") k = easeInOut(clamp((S.t - (S.tiro ? S.tiro.t0 : S.t)) / 1.2, 0, 1));
      c.position.set(lerp(1.15, S.tiro ? 0.6 + clamp(S.tiro.tx * 0.1, -0.5, 0.5) : 1.15, k), lerp(2.05, 1.75, k), lerp(17.6, 14.4, k));
      mira.set(lerp(0, S.tiro ? S.tiro.tx * 0.25 : 0, k), lerp(1.2, 1.05, k), 0); c.fov = lerp(50, 42, k);
    } else {
      /* dentro de la portería, a la altura de los ojos del portero */
      let tilt = 0, dy = 0, dx = 0;
      if (K.dive) {
        const z = clamp((S.t - K.dive.t0) / DUR_PARADA, 0, 1), e = easeOut(z);
        const gg = clamp(K.dive.gy - 1, -1, 1); tilt = -K.dive.gx * e * 0.55; dy = gg > 0 ? Math.sin(Math.PI * z) * 0.35 * gg : gg * 0.85 * e - 0.2 * e * (1 + gg); dx = K.dive.gx * 2.75 * e;
        E.manos.position.set(0, 0, 0);
      }
      const px = K.x + dx;
      c.position.set(px * 0.92, 1.72 + dy, -0.35); mira.set(px * 0.35 + (K.dive ? K.dive.gx * 0.4 : 0), 1.15 + (K.dive ? Math.max(0, K.dive.gy - 1) * 0.5 : 0), SPOT);
      c.fov = 58; fx = tilt;
    }
    if (reducido) S.shake = 0;
    const sh = S.shake;
    c.position.x += (Math.random() - 0.5) * sh * 0.25; c.position.y += (Math.random() - 0.5) * sh * 0.25;
    c.lookAt(mira); if (fx) c.rotateZ(fx);
    c.updateProjectionMatrix();
    /* guantes */
    if (S.turno === "cpu") {
      const z = K.dive ? clamp((S.t - K.dive.t0) / DUR_PARADA, 0, 1) : 0, e = easeOut(z), gx = K.dive ? K.dive.gx : 0, gy = K.dive ? K.dive.gy : 1;
      const alz = lerp(-0.18, 0.55, clamp(gy / 2, 0, 1));
      E.mI.position.set(-0.38 + gx * e * 0.22, -0.52 + e * (0.55 + alz) + Math.sin(t * 2) * 0.01, -0.85 + e * -0.35);
      E.mD.position.set(0.38 + gx * e * 0.22, -0.52 + e * (0.55 + alz) + Math.sin(t * 2.2) * 0.01, -0.85 + e * -0.35);
      E.mI.rotation.set(-0.25 - e * 0.15, 0, gx * e * 0.3 - 0.12 * (1 - e)); E.mD.rotation.set(-0.25 - e * 0.15, 0, gx * e * 0.3 + 0.12 * (1 - e));
    }
  }
  function paso(ahora) {
    raf = requestAnimationFrame(paso);
    if (!vivo || !E) return;
    let dt = Math.min((ahora - ultimo) / 1000, 0.1); ultimo = ahora; if (!(dt > 0)) dt = 0.016;
    const pausa = vertical();
    $("[data-gira]").classList.toggle("on", pausa);
    S.activo = !pausa && !document.hidden;
    if (pausa) return;
    /* rendimiento adaptativo */
    fpsAcum += dt; fpsN++;
    if (fpsAcum > 2.5) { const fps = fpsN / fpsAcum; if (fps < 26 && escala > 0.55) { escala -= 0.15; E.renderer.setPixelRatio((movil ? 1.5 : Math.min(window.devicePixelRatio || 1, 2)) * escala); tamano(); } fpsAcum = 0; fpsN = 0; }
    /* tiempo de juego (con cámara lenta al final del vuelo propio) */
    let esc = 1;
    if (S.fase === "vuelo" && S.turno === "yo" && S.tiro && (S.t - S.tiro.t0) / S.tiro.T > 0.7) esc = 0.5;
    const dtS = dt * esc; S.t += dtS; S.ciclo += dtS * 12; S.shake = Math.max(0, S.shake - dt * 0.9);
    const T = S.t;

    /* fases */
    const yo = E.yo, cpu = E.cpu, bal = E.balon;
    if (S.fase === "menu") { poseQuieto(E.cpu, T, false); poseQuieto(E.yo, T + 1, false); poseQuieto(E.porCpu, T, true); }
    if (S.fase === "espera") {
      if (S.kick) poseQuieto(S.kick, T, false);
      if (S.port) poseQuieto(S.port, T, true);
      if (S.turno === "cpu" && T - S.tFase > S.espera) { if (S.turno === "cpu") { au.pitido(); lanzarCpu(); } }
    }
    if (S.fase === "barras") {
      if (S.kick) poseQuieto(S.kick, T, false);
      if (S.port) poseQuieto(S.port, T, true);
      const ap = S.sub === "apuntar" ? S.hov : S.aim || S.hov;
      if (S.sub === "fuerza") {
        /* marcador no lineal: rapidísimo en el centro (verde), lento en los extremos (rojo) */
        const sg = tri((T - S.barT0) * S.barVel + S.barPh) * 2 - 1;
        S.barV[2] = 0.5 + 0.5 * Math.sign(sg) * Math.pow(Math.abs(sg), 0.55);
      }
      setBarra(2, S.barV[2]);
      E.retic.position.set(ap.x, ap.y, 0.12); E.retic.visible = true;
      const col = S.sub === "apuntar" ? (Math.abs(ap.x) > HW - 0.1 || ap.y > GH - 0.1 ? 0xff5a6a : 0xffdd33) : 0x19e6ff;
      E.retic.children[0].material.color.setHex(col);
      E.retic.scale.setScalar(1 + Math.sin(T * 8) * 0.06);
    }
    if (S.fase === "carrera") {
      const k = S.kick, tt = T - S.tFase, tiro = S.tiro;
      const z0 = KICK0.z, xs = S.xs != null ? S.xs : 0;
      const u = clamp(tt / (RUN + GOLPE * 0.7), 0, 1), ue = u * u * 0.6 + u * 0.4;
      k.raiz.position.set(lerp(xs, 0.17, ue), 0, lerp(z0, SPOT + 0.52, ue));
      k.raiz.rotation.y = Math.PI + Math.atan2(-(0.17 - xs), 6) * 0.9;
      if (tt < RUN) poseCarrera(k, tt / RUN, S.ciclo); else poseGolpeo(k, (tt - RUN) / GOLPE);
      if (S.turno === "yo" && S.port) poseQuieto(S.port, T, true);
      if (tt >= RUN + CONTACTO) contacto();
    }
    if (S.fase === "vuelo") {
      const k = S.kick, ti = S.tiro, tt = T - ti.t0;
      poseGolpeo(k, clamp((T - S.tFase + RUN * 0 + CONTACTO) / GOLPE, 0, 1));
      const s = clamp(tt / ti.T, 0, 1);
      bal.position.set(lerp(0, ti.tx, s) + ti.sw * Math.sin(Math.PI * s), lerp(RB, ti.ty, s) + ti.sag * 4 * s * (1 - s) + (ti.panenka ? 0 : 0), lerp(SPOT, 0, s));
      bal.rotation.x -= dtS * 18 * (ti.panenka ? 0.2 : 1); bal.rotation.z += dtS * 4;
      if (S.turno === "yo" && S.port) {
        const p = S.pt0 < 0 ? 0 : clamp((T - S.pt0) / DUR_PARADA, 0, 1);
        figuraPortero(S.port, p, S.pgx, S.pgy, 0, T);
      }
      if (S.turno === "cpu" && K.dive) { /* guantes en cámara */ }
      if (s >= 1) resolver();
    }
    if (S.fase === "resultado" || S.fase === "fin") {
      const k = S.kick, ti = S.tiro, rt = T - S.tFase;
      if (k && ti) {
        if (rt < 0.4 && S.cel !== null) poseGolpeo(k, 1);
        else if (S.cel === "gol") poseFesteja(k, T);
        else poseDerrota(k, T);
      }
      if (S.turno === "yo" && S.port && ti) {
        const p = clamp((T - S.pt0) / DUR_PARADA, 0, 1);
        figuraPortero(S.port, p, S.pgx, S.pgy, 0, T);
        if (S.cel === "parada" && S.zonaP) { /* el portero ya está en posición */ }
      }
      /* balón libre */
      if (S.libre) {
        const L = S.libre, v = L.v, p = bal.position; let n = Math.ceil(dtS / 0.008); const h = dtS / Math.max(n, 1);
        for (let i = 0; i < n; i++) {
          v.y -= 9.8 * h; p.x += v.x * h; p.y += v.y * h; p.z += v.z * h;
          if (p.y < RB) { p.y = RB; v.y = -v.y * 0.52; v.x *= 0.88; v.z *= 0.88; if (Math.abs(v.y) < 0.8) v.y = 0; }
          if (p.y <= RB + 0.001) { const f = Math.pow(0.35, h); v.x *= f; v.z *= f; }
          if (p.z < 0 && Math.abs(p.x) < HW && p.y < GH + 0.1) {
            v.x *= Math.pow(0.04, h); v.z *= Math.pow(0.04, h); v.y *= Math.pow(0.2, h);
            if (p.z < -DEPTH + RB) { p.z = -DEPTH + RB; v.z = 0; }
            if (Math.abs(p.x) > HW - RB) { p.x = Math.sign(p.x) * (HW - RB); v.x = 0; }
          }
          if (p.z < -8.3) { p.z = -8.3; v.z *= -0.2; v.x *= 0.5; }
        }
        bal.rotation.x -= v.z * dtS * 3; bal.rotation.z += v.x * dtS * 3;
      }
    }
    /* red */
    const R = E.red;
    if (R.t < 3) {
      R.t += dt; const pos = R.malla.geometry.attributes.position, arr = pos.array, o = R.orig;
      const amp = R.a * Math.exp(-R.t * 2.4) * Math.cos(R.t * 14);
      for (let i = 0; i < arr.length; i += 3) { const dx = o[i] - R.x, dy = (o[i + 1] + 1.1) - R.y; arr[i + 2] = o[i + 2] - amp * Math.exp(-(dx * dx + dy * dy) / 0.9) * 0.9; }
      pos.needsUpdate = true;
    }
    /* ambiente */
    tFlash += dt;
    if (tFlash > 0.09) { tFlash = 0; E.destellos.forEach(function (d) { d.offset.set(Math.random(), Math.random()); }); }
    E.vallaTex.offset.x = (E.vallaTex.offset.x + dt * 0.02) % 1;
    E.grupoGradas.forEach(function (g, i) { g.offset.y = Math.sin(T * 3 + i) * 0.0016; });
    E.espera.forEach(function (f, i) { poseQuieto(f, T + i, false); });
    poseQuieto(E.arbitro, T, false);
    ponCamara(dt, T);
    E.renderer.render(E.scene, E.camara);
  }

  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf);
    window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("resize", hRes);
    try { au.ambiente(0); } catch (e) { /* opcional */ }
    try { if (E) { E.renderer.dispose(); E.renderer.forceContextLoss(); } } catch (e) { /* opcional */ }
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* opcional */ }
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }

  function escenaMenu() {
    colocaFiguras();
    E.cpu.raiz.visible = true; E.cpu.raiz.position.set(-3, 0, 7); E.cpu.raiz.rotation.y = 0.7;
    E.yo.raiz.visible = true; E.yo.raiz.position.set(2.4, 0, 8.4); E.yo.raiz.rotation.y = -2.6;
    E.porCpu.raiz.visible = true; E.porCpu.raiz.position.set(0, 0, 0.2); E.porCpu.raiz.rotation.y = 0;
    S.kick = null; S.port = null;
  }
  pintaRecord(); if (E) escenaMenu(); tamano(); S.fase = "menu";
  if (E) raf = requestAnimationFrame(function (n) { ultimo = n; paso(n); });
  return { cerrar: cerrar, S: S, K: K, E: E, accion: accion, empezar: empezar };
}
