/* PENALTIS 3D · cuerpos de los futbolistas
   Malla, esqueleto y texturas generados con tools/cuerpo_rb.py a partir del avatar «Sports_Male_02»
   de Microsoft Rocketbox (licencia MIT, ver lib/cuerpo/LICENCIA-Rocketbox.txt). La equipación original
   se borra en el atlas: aquí se pinta con los colores de cada equipo (camiseta, pantalón, medias,
   ribetes, botas, guantes), se tiñen piel y pelo y se estampa el dorsal sobre la propia tela. */
import * as THREE from "./lib/three.module.min.js";

const cache = {};
let TEX = null;

function lienzo(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }

function parsear(buf) {
  const dv = new DataView(buf), L = dv.getUint32(0, true);
  const meta = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, L)));
  let o = 4 + L; const n = meta.n;
  const toma = (Tipo, cuenta) => { const bytes = cuenta * Tipo.BYTES_PER_ELEMENT, a = new Tipo(buf.slice(o, o + bytes)); o += bytes; return a; };
  const pos = toma(Float32Array, n * 3), nb = toma(Int8Array, n * 3), uv = toma(Float32Array, n * 2), skI = toma(Uint8Array, n * 4), skW = toma(Uint8Array, n * 4), idx = toma(Uint16Array, meta.tri * 3);
  const nor = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) nor[i] = nb[i] / 127;
  const sw = new Float32Array(n * 4); for (let i = 0; i < n * 4; i++) sw[i] = skW[i] / 255;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("skinIndex", new THREE.BufferAttribute(Uint16Array.from(skI), 4)); g.setAttribute("skinWeight", new THREE.BufferAttribute(sw, 4));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return { meta, geo: g };
}

export async function cargarCuerpos(nombres) {
  const base = new URL("./lib/cuerpo/", import.meta.url);
  const unicos = Array.from(new Set(nombres.map((n) => (n === "jugador-lo" ? "jugador" : n))));
  const tareas = unicos.map(async (nm) => {
    if (cache[nm]) return;
    const r = await fetch(new URL(nm + ".bin", base)); if (!r.ok) throw new Error("cuerpo " + nm);
    cache[nm] = parsear(await r.arrayBuffer());
  });
  if (!TEX) {
    const L = new THREE.TextureLoader(), carga = (f, srgb) => L.loadAsync(new URL(f, base).href).then((t) => { t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 4; return t; });
    tareas.push(Promise.all([carga("base.webp", true), carga("normal.webp"), carga("m1.png"), carga("m2.png")]).then((t) => { TEX = { base: t[0], normal: t[1], m1: t[2], m2: t[3] }; }));
  }
  await Promise.all(tareas);
}

/* ───── material: la equipación se pinta en el sombreador ───── */
const VERT_DECL = "varying vec3 vReposo;\n";
const FRAG_DECL = [
  "varying vec3 vReposo;",
  "uniform sampler2D uM1, uM2, uDorTex;",
  "uniform vec3 uCam, uCam2, uPan, uPan2, uMed, uMed2, uBota, uGua, uPiel, uPelo;",
  "uniform vec4 uOp;   /* x: rayas, y: aros, z: manga larga, w: guantes */",
  "uniform mat3 uDor; uniform float uDorF;",
  "float tkTela = 0.0, tkBota = 0.0, tkPiel = 0.0;",
].join("\n") + "\n";
const FRAG_MAPA = [
  "vec4 tb = texture2D( map, vMapUv );",
  "vec4 k1 = texture2D( uM1, vMapUv ), k2 = texture2D( uM2, vMapUv );",
  "float lum = dot( tb.rgb, vec3( 0.3, 0.59, 0.11 ) );",
  "float som = tb.g / 0.5776;",
  "vec3 cam = uCam;",
  "cam = mix( cam, uCam2, uOp.x * step( 0.5, fract( vReposo.x / 0.105 + 0.25 ) ) );",
  "cam = mix( cam, uCam2, uOp.y * step( 0.5, fract( vReposo.y / 0.13 ) ) );",
  "vec3 tela = cam * k1.r + uPan * k1.g + uMed * k1.b;",
  "tela = mix( tela, uCam2 * k1.r + uPan2 * k1.g + uMed2 * k1.b, k1.a );",
  "tkTela = clamp( k1.r + k1.g + k1.b, 0.0, 1.0 ); tkBota = k2.b; tkPiel = k2.r;",
  "vec3 col = tb.rgb;",
  "col = mix( col, col * uPiel, k2.r );",
  "col = mix( col, col * uPelo, k2.g );",
  "col = mix( col, uBota * ( 0.22 + 1.7 * lum ), k2.b );",
  "float mano = smoothstep( 0.7, 0.8, k2.a ), brazo = smoothstep( 0.2, 0.3, k2.a ) - mano;",
  "col = mix( col, uCam * clamp( lum / 0.21, 0.55, 1.25 ), brazo * uOp.z );",
  "col = mix( col, uGua * clamp( 0.35 + lum / 0.21 * 0.7, 0.4, 1.3 ), mano * uOp.w );",
  "tkPiel *= 1.0 - max( brazo * uOp.z, mano * uOp.w );",
  "tela *= som;",
  "vec2 dq = ( uDor * vec3( vMapUv, 1.0 ) ).xy;",
  "if ( uDorF > 0.5 && dq.x > 0.0 && dq.x < 1.0 && dq.y > 0.0 && dq.y < 1.0 ) { vec4 dt = texture2D( uDorTex, dq ); tela = mix( tela, dt.rgb * som, dt.a ); }",
  "col = mix( col, tela, tkTela );",
  "diffuseColor.rgb *= col;",
].join("\n") + "\n";
const FRAG_RUGO = "roughnessFactor = mix( mix( 0.6, 0.9, tkTela ), 0.42, tkBota );\n";

const lin = (hex) => new THREE.Color(hex);   /* THREE.Color ya convierte de sRGB a lineal */
let dorVacio = null;

function material(b, o) {
  const m = new THREE.MeshStandardMaterial({ map: TEX.base, normalMap: TEX.normal, roughness: 0.75, metalness: 0 });
  m.normalScale.set(o.relieve != null ? o.relieve : 1, o.relieve != null ? o.relieve : 1);
  const meta = b.meta, c1 = lin(o.camisa), c2 = lin(o.camisa2 != null ? o.camisa2 : o.camisa);
  const pb = new THREE.Color().setRGB(meta.pielBase[0], meta.pielBase[1], meta.pielBase[2], THREE.SRGBColorSpace);
  const hb = new THREE.Color().setRGB(meta.peloBase[0], meta.peloBase[1], meta.peloBase[2], THREE.SRGBColorSpace);
  const razon = (c, ref, lo, hi) => new THREE.Color(Math.min(hi, Math.max(lo, c.r / ref.r)), Math.min(hi, Math.max(lo, c.g / ref.g)), Math.min(hi, Math.max(lo, c.b / ref.b)));
  /* la piel de la textura es algo más oscura que los tonos del juego: se compara con su punto claro */
  const piel = lin(o.piel != null ? o.piel : 0xf0c8a0), pelo = lin(o.pelo != null ? o.pelo : 0x2b1b12);
  const d = meta.dorsal, conDorsal = o.dorsal != null;
  dorVacio = dorVacio || new THREE.CanvasTexture(lienzo(2, 2));
  const U = {
    uM1: { value: TEX.m1 }, uM2: { value: TEX.m2 }, uDorTex: { value: conDorsal ? texDorsal(o.dorsal, o.numColor || "#fff", o.nombre) : dorVacio },
    uCam: { value: c1 }, uCam2: { value: c2 }, uPan: { value: lin(o.pantalon) }, uPan2: { value: lin(o.pantalon2 != null ? o.pantalon2 : (o.camisa2 != null ? o.camisa2 : o.camisa)) },
    uMed: { value: lin(o.media) }, uMed2: { value: lin(o.media2 != null ? o.media2 : (o.camisa2 != null ? o.camisa2 : o.camisa)) },
    uBota: { value: lin(o.bota != null ? o.bota : 0x1b1d24) }, uGua: { value: lin(o.guante != null ? o.guante : 0xe8ff3a) },
    uPiel: { value: razon(piel, lin(0xf0c8a0), 0.18, 1.25) }, uPelo: { value: razon(pelo, hb, 0.1, 3) },
    uOp: { value: new THREE.Vector4(o.patron === "rayas" ? 1 : 0, o.patron === "aros" ? 1 : 0, o.largo ? 1 : 0, o.cuerpo === "portero" ? 1 : 0) },
    uDor: { value: new THREE.Matrix3().set(d[0], d[1], d[2], d[3], d[4], d[5], 0, 0, 1) }, uDorF: { value: conDorsal ? 1 : 0 },
  };
  void pb;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = VERT_DECL + sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvReposo = position;");
    sh.fragmentShader = FRAG_DECL + sh.fragmentShader.replace("#include <map_fragment>", FRAG_MAPA).replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n" + FRAG_RUGO);
  };
  m.customProgramCacheKey = () => "tiki-cuerpo-2";
  m.userData.U = U;
  return m;
}

function texDorsal(num, color, nombre) {
  const c = lienzo(512, 512), x = c.getContext("2d");
  x.clearRect(0, 0, 512, 512); x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle";
  const n = String(nombre || "").toUpperCase().slice(0, 16);
  let fs = 92; x.font = "900 " + fs + "px Arial, Helvetica, sans-serif";
  while (fs > 30 && x.measureText(n).width > 440) { fs -= 2; x.font = "900 " + fs + "px Arial, Helvetica, sans-serif"; }
  x.fillText(n, 256, 92);
  x.font = "900 300px Arial, Helvetica, sans-serif"; x.fillText(String(num), 256, 322);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* Crea un futbolista. o: { cuerpo: "jugador"|"portero", piel, pelo, camisa, camisa2, patron: "rayas"|"aros", pantalon, pantalon2,
   media, media2, bota, guante, largo (manga larga), dorsal, nombre, numColor, alto } */
export function crearFigura(o) {
  const nm = o.cuerpo === "jugador-lo" || !o.cuerpo ? "jugador" : o.cuerpo, b = cache[nm]; if (!b || !TEX) throw new Error("cuerpo sin cargar");
  const meta = b.meta, piv = meta.pivotes, nombres = meta.huesos;
  const raiz = new THREE.Group(), por = {};
  const huesos = nombres.map((n) => { const h = new THREE.Bone(); h.name = n; por[n] = h; return h; });
  nombres.forEach((n, i) => {
    const p = meta.padres[i], pv = piv[n], pp = p >= 0 ? piv[nombres[p]] : [0, 0, 0];
    huesos[i].position.set(pv[0] - pp[0], pv[1] - pp[1], pv[2] - pp[2]);
    if (p >= 0) huesos[p].add(huesos[i]);
  });
  const malla = new THREE.SkinnedMesh(b.geo, material(b, Object.assign({}, o, { cuerpo: nm })));
  malla.castShadow = true; malla.frustumCulled = false;
  raiz.add(malla); raiz.add(por.cadera); raiz.updateMatrixWorld(true);
  malla.bind(new THREE.Skeleton(huesos));
  raiz.scale.setScalar(o.alto || 0.97);
  return {
    raiz, malla, cadera: por.cadera, torso: por.torso, cabeza: por.cabeza,
    brI: { s: por.hombroI, e: por.codoI, m: por.manoI }, brD: { s: por.hombroD, e: por.codoD, m: por.manoD },
    pI: { h: por.caderaI, k: por.rodillaI, f: por.pieI }, pD: { h: por.caderaD, k: por.rodillaD, f: por.pieD },
  };
}
