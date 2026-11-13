/* PENALTIS 3D · cuerpos de los futbolistas
   Malla única y continua con esqueleto (SkinnedMesh), generada con tools/cuerpo_bake.mjs
   (lib/cuerpo/*.bin). Aquí solo se carga, se tiñe con los colores del equipo y se monta el esqueleto. */
import * as THREE from "./lib/three.module.min.js";

const REG = { PIEL: 0, CAMISA: 1, CUELLO: 2, PUNO: 3, SHORT: 4, SHORT_B: 5, MEDIA: 6, MEDIA_B: 7, BOTA: 8, SUELA: 9, GUANTE: 10, GUANTE_B: 11, PELO: 12, LABIO: 13 };
const cache = {};
let mats = null;

function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

function parsear(buf) {
  const dv = new DataView(buf), L = dv.getUint32(0, true);
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, L)));
  let o = 4 + L; const n = meta.n;
  const toma = (Tipo, cuenta) => { const bytes = cuenta * Tipo.BYTES_PER_ELEMENT, a = new Tipo(buf.slice(o, o + bytes)); o += bytes; return a; };
  const pos = toma(Float32Array, n * 3), nb = toma(Int8Array, n * 3), reg = toma(Uint8Array, n), ao = toma(Uint8Array, n), skI = toma(Uint8Array, n * 4), skW = toma(Uint8Array, n * 4), idx = toma(Uint32Array, meta.tri * 3);
  const nor = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) nor[i] = nb[i] / 127;
  const sw = new Float32Array(n * 4); for (let i = 0; i < n * 4; i++) sw[i] = skW[i] / 255;
  const uv = new Float32Array(n * 2); for (let i = 0; i < n; i++) { uv[i * 2] = (pos[i * 3] + pos[i * 3 + 2]) * 9; uv[i * 2 + 1] = pos[i * 3 + 1] * 9; }
  return { meta, n, pos, nor, reg, ao, skI: Uint16Array.from(skI), sw, uv, idx };
}

export async function cargarCuerpos(nombres) {
  const base = new URL("./lib/cuerpo/", import.meta.url);
  await Promise.all(nombres.map(async (nm) => {
    if (cache[nm]) return;
    const r = await fetch(new URL(nm + ".bin", base)); if (!r.ok) throw new Error("cuerpo " + nm);
    cache[nm] = parsear(await r.arrayBuffer());
  }));
}

function texTela() {
  const c = lienzo(128, 128), x = c.getContext("2d"); x.fillStyle = "#808080"; x.fillRect(0, 0, 128, 128);
  for (let j = 0; j < 128; j += 2) for (let i = 0; i < 128; i += 2) { const v = 118 + ((i + j) % 4 === 0 ? 20 : 0) + Math.random() * 16; x.fillStyle = "rgb(" + v + "," + v + "," + v + ")"; x.fillRect(i, j, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function materiales() {
  if (mats) return mats;
  mats = [
    new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.5, sheen: 0.6, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xffb8a0) }),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, bumpMap: texTela(), bumpScale: 1.6 }),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.38, metalness: 0.05 }),
  ];
  return mats;
}

function ruido(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function colorear(b, o) {
  const n = b.n, col = new Float32Array(n * 3), C = (h) => new THREE.Color(h);
  const piel = C(o.piel), pelo = C(o.pelo), c1 = C(o.camisa), c2 = C(o.camisa2 != null ? o.camisa2 : o.camisa), sh = C(o.pantalon), sh2 = C(o.pantalon2 != null ? o.pantalon2 : (o.camisa2 != null ? o.camisa2 : o.camisa));
  const me = C(o.media), me2 = C(o.media2 != null ? o.media2 : o.camisa), bo = C(o.bota != null ? o.bota : 0x15171c), su = C(0xe9e9e9), gu = C(o.guante != null ? o.guante : 0xe8ff3a), gu2 = gu.clone().multiplyScalar(0.35);
  const labio = piel.clone().lerp(C(0x9a3d3d), 0.55), t = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const x = b.pos[i * 3], y = b.pos[i * 3 + 1], z = b.pos[i * 3 + 2], r = b.reg[i], a = 0.3 + 0.7 * (b.ao[i] / 255);
    switch (r) {
      case REG.PIEL: t.copy(piel).multiplyScalar(0.94 + ruido(x, y, z) * 0.1); break;
      case REG.LABIO: t.copy(labio); break;
      case REG.CAMISA: {
        if (o.patron === "rayas") t.copy(Math.floor((x + 1) / 0.05) % 2 ? c2 : c1);
        else if (o.patron === "aros") t.copy(Math.floor((y + 1) / 0.06) % 2 ? c2 : c1);
        else t.copy(c1);
        t.multiplyScalar(0.97 + ruido(x * 1.3, y, z) * 0.06); break;
      }
      case REG.CUELLO: case REG.PUNO: t.copy(c2); break;
      case REG.SHORT: t.copy(sh).multiplyScalar(0.97 + ruido(x, y * 1.2, z) * 0.06); break;
      case REG.SHORT_B: t.copy(sh2); break;
      case REG.MEDIA: t.copy(me).multiplyScalar(0.97 + ruido(x, y, z) * 0.05); break;
      case REG.MEDIA_B: t.copy(me2); break;
      case REG.BOTA: t.copy(bo); break;
      case REG.SUELA: t.copy(su); break;
      case REG.GUANTE: t.copy(gu); break;
      case REG.GUANTE_B: t.copy(gu2); break;
      case REG.PELO: t.copy(pelo).multiplyScalar(0.75 + ruido(x * 2, y * 2, z * 2) * 0.5); break;
      default: t.copy(piel);
    }
    col[i * 3] = t.r * a; col[i * 3 + 1] = t.g * a; col[i * 3 + 2] = t.b * a;
  }
  return col;
}

function texOjo() {
  const c = lienzo(128, 64), x = c.getContext("2d");
  x.clearRect(0, 0, 128, 64);
  x.fillStyle = "rgba(60,25,18,.25)"; x.beginPath(); x.ellipse(64, 34, 58, 24, 0, 0, 6.2832); x.fill();
  x.fillStyle = "#f3eee8"; x.beginPath(); x.moveTo(8, 34); x.quadraticCurveTo(64, -2, 120, 34); x.quadraticCurveTo(64, 62, 8, 34); x.fill();
  x.fillStyle = "#5a3a22"; x.beginPath(); x.arc(64, 33, 19, 0, 6.2832); x.fill();
  x.fillStyle = "#120d09"; x.beginPath(); x.arc(64, 33, 9, 0, 6.2832); x.fill();
  x.fillStyle = "rgba(255,255,255,.9)"; x.beginPath(); x.arc(56, 26, 4.5, 0, 6.2832); x.fill();
  x.strokeStyle = "rgba(30,15,10,.95)"; x.lineWidth = 6; x.beginPath(); x.moveTo(6, 35); x.quadraticCurveTo(64, -6, 122, 35); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function texCeja(col) {
  const c = lienzo(128, 32), x = c.getContext("2d"); x.clearRect(0, 0, 128, 32);
  const g = x.createLinearGradient(0, 0, 128, 0); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.2, col); g.addColorStop(0.8, col); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.beginPath(); x.moveTo(4, 24); x.quadraticCurveTo(60, 2, 124, 16); x.lineTo(124, 24); x.quadraticCurveTo(60, 12, 4, 30); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function texBoca() {
  const c = lienzo(128, 32), x = c.getContext("2d"); x.clearRect(0, 0, 128, 32);
  x.strokeStyle = "rgba(70,20,22,.9)"; x.lineWidth = 4; x.lineCap = "round"; x.beginPath(); x.moveTo(8, 14); x.quadraticCurveTo(64, 22, 120, 14); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let texOjoC = null, texBocaC = null;
function decal(parent, pivote, d, ancho, alto, textura, eps) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshStandardMaterial({ map: textura, transparent: true, roughness: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  const n = new THREE.Vector3(d.n[0], d.n[1], d.n[2]).normalize();
  m.position.set(d.p[0] - pivote[0] + n.x * eps, d.p[1] - pivote[1] + n.y * eps, d.p[2] - pivote[2] + n.z * eps);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  parent.add(m); return m;
}

function texDorsal(num, color, nombre) {
  const c = lienzo(256, 256), x = c.getContext("2d");
  x.clearRect(0, 0, 256, 256); x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle";
  const n = String(nombre || "").toUpperCase().slice(0, 16);
  let fs = 62; x.font = "900 " + fs + "px Arial, Helvetica, sans-serif";
  while (fs > 18 && x.measureText(n).width > 236) { fs -= 2; x.font = "900 " + fs + "px Arial, Helvetica, sans-serif"; }
  x.fillText(n, 128, 40);
  x.font = "900 170px Arial, Helvetica, sans-serif"; x.fillText(String(num), 128, 150);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* Crea un futbolista. o: { cuerpo: "jugador"|"portero"|"jugador-lo", piel, pelo, camisa, camisa2, patron, pantalon, media, media2, bota, guante, dorsal, nombre, numColor, alto, cara:bool } */
export function crearFigura(o) {
  const b = cache[o.cuerpo || "jugador"]; if (!b) throw new Error("cuerpo sin cargar");
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(b.pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(b.nor, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(b.uv, 2)); g.setAttribute("skinIndex", new THREE.BufferAttribute(b.skI, 4)); g.setAttribute("skinWeight", new THREE.BufferAttribute(b.sw, 4));
  g.setAttribute("color", new THREE.BufferAttribute(colorear(b, o), 3));
  g.setIndex(new THREE.BufferAttribute(b.idx, 1));
  b.meta.rangos.forEach((r, i) => { if (r[1]) g.addGroup(r[0], r[1], i); });

  const raiz = new THREE.Group(), piv = b.meta.pivotes, nombres = b.meta.huesos;
  const padre = { torso: "cadera", cabeza: "torso", hombroI: "torso", hombroD: "torso", codoI: "hombroI", codoD: "hombroD", caderaI: "cadera", caderaD: "cadera", rodillaI: "caderaI", rodillaD: "caderaD" };
  const huesos = nombres.map((n) => { const h = new THREE.Bone(); h.name = n; return h; }), por = {}; huesos.forEach((h) => { por[h.name] = h; });
  nombres.forEach((n) => {
    const h = por[n], p = padre[n], pv = piv[n], pp = p ? piv[p] : [0, 0, 0];
    h.position.set(pv[0] - pp[0], pv[1] - pp[1], pv[2] - pp[2]);
    if (p) por[p].add(h);
  });
  const malla = new THREE.SkinnedMesh(g, materiales());
  malla.castShadow = true; malla.frustumCulled = false;
  raiz.add(malla); raiz.add(por.cadera); raiz.updateMatrixWorld(true);
  malla.bind(new THREE.Skeleton(huesos));

  if (o.cara !== false && b.meta.cara) {
    const cb = por.cabeza, pc = piv.cabeza, ca = b.meta.cara;
    texOjoC = texOjoC || texOjo(); texBocaC = texBocaC || texBoca();
    decal(cb, pc, ca.ojoI, 0.026, 0.0135, texOjoC, 0.0009); decal(cb, pc, ca.ojoD, 0.026, 0.0135, texOjoC, 0.0009);
    const tc = texCeja("#" + new THREE.Color(o.pelo).multiplyScalar(0.55).getHexString());
    decal(cb, pc, ca.cejaI, 0.034, 0.0085, tc, 0.0009); decal(cb, pc, ca.cejaD, 0.034, 0.0085, tc, 0.0009);
    decal(cb, pc, ca.boca, 0.034, 0.0085, texBocaC, 0.0009);
  }
  if (o.dorsal != null) {
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshBasicMaterial({ map: texDorsal(o.dorsal, o.numColor || "#fff", o.nombre), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    d.position.set(0, 1.29 - piv.torso[1], -0.122); d.rotation.y = Math.PI; por.torso.add(d);
  }
  raiz.scale.setScalar(o.alto || 0.97);
  return { raiz, cadera: por.cadera, torso: por.torso, cabeza: por.cabeza, brI: { s: por.hombroI, e: por.codoI }, brD: { s: por.hombroD, e: por.codoD }, pI: { h: por.caderaI, k: por.rodillaI }, pD: { h: por.caderaD, k: por.rodillaD } };
}
