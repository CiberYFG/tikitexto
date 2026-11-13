/* Genera los cuerpos 3D de Penaltis (lib/cuerpo/*.bin).
   Un cuerpo único y continuo: se define con campos de distancia (SDF) de volúmenes anatómicos,
   se une con mezcla suave, se triangula con marching cubes y se calculan normales, oclusión
   ambiental y pesos de esqueleto. Uso: node tools/cuerpo_bake.mjs  */
import { edgeTable, triTable } from "./mc_tablas.mjs";
import fs from "node:fs";

/* ───── regiones ───── */
export const R = { PIEL: 0, CAMISA: 1, CUELLO: 2, PUNO: 3, SHORT: 4, SHORT_B: 5, MEDIA: 6, MEDIA_B: 7, BOTA: 8, SUELA: 9, GUANTE: 10, GUANTE_B: 11, PELO: 12, LABIO: 13, CINTA: 14 };
const GRUPO = [0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 0, 1]; /* 0 piel, 1 tela, 2 duro */
const HUESOS = ["cadera", "torso", "cabeza", "hombroI", "hombroD", "codoI", "codoD", "caderaI", "caderaD", "rodillaI", "rodillaD"];
const H = Object.fromEntries(HUESOS.map((n, i) => [n, i]));

/* ───── SDF ───── */
const sqrt = Math.sqrt, abs = Math.abs, max = Math.max, min = Math.min;
function sdElip(px, py, pz, c, r) {
  const x = (px - c[0]) / r[0], y = (py - c[1]) / r[1], z = (pz - c[2]) / r[2];
  const k0 = sqrt(x * x + y * y + z * z);
  const x1 = x / r[0], y1 = y / r[1], z1 = z / r[2];
  const k1 = sqrt(x1 * x1 + y1 * y1 + z1 * z1);
  return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -min(r[0], r[1], r[2]);
}
function sdCono(px, py, pz, o) {
  const a = o.a, ba = o.ba, l2 = o.l2, rr = o.rr, a2 = o.a2, il2 = o.il2, r1 = o.r1, r2 = o.r2;
  const pax = px - a[0], pay = py - a[1], paz = pz - a[2];
  const y = pax * ba[0] + pay * ba[1] + paz * ba[2], z = y - l2;
  const qx = pax * l2 - ba[0] * y, qy = pay * l2 - ba[1] * y, qz = paz * l2 - ba[2] * y;
  const x2 = qx * qx + qy * qy + qz * qz, y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}
function smin(a, b, k) { const h = max(k - abs(a - b), 0) / k; return min(a, b) - h * h * k * 0.25; }

/* ───── definición del cuerpo ───── */
function crear(cfg) {
  const P = [];
  const mir = (v, s) => [v[0] * s, v[1], v[2]];
  function add(o) {
    o.clip = o.clip || []; o.bias = o.bias || 0;
    if (o.t === "C") {
      o.ba = [o.b[0] - o.a[0], o.b[1] - o.a[1], o.b[2] - o.a[2]];
      o.l2 = o.ba[0] ** 2 + o.ba[1] ** 2 + o.ba[2] ** 2; o.rr = o.r1 - o.r2; o.a2 = o.l2 - o.rr * o.rr; o.il2 = 1 / o.l2;
      const m = max(o.r1, o.r2) + 0.07;
      o.lo = [min(o.a[0], o.b[0]) - m, min(o.a[1], o.b[1]) - m, min(o.a[2], o.b[2]) - m];
      o.hi = [max(o.a[0], o.b[0]) + m, max(o.a[1], o.b[1]) + m, max(o.a[2], o.b[2]) + m];
    } else {
      o.lo = [o.c[0] - o.r[0] - 0.07, o.c[1] - o.r[1] - 0.07, o.c[2] - o.r[2] - 0.07];
      o.hi = [o.c[0] + o.r[0] + 0.07, o.c[1] + o.r[1] + 0.07, o.c[2] + o.r[2] + 0.07];
    }
    P.push(o);
  }
  const E = (fam, bone, reg, c, r, ex) => add(Object.assign({ t: "E", fam, bone, reg, c, r }, ex));
  const C = (fam, bone, reg, a, r1, b, r2, ex) => add(Object.assign({ t: "C", fam, bone, reg, a, r1, b, r2 }, ex));
  const FB = 0, FAI = 1, FAD = 2, FLI = 3, FLD = 4;
  const ypos = (y) => ({ n: [0, -1, 0], c: -y });   /* conserva y > valor */
  const ymenos = (y) => ({ n: [0, 1, 0], c: y });   /* conserva y < valor */

  /* tronco */
  E(FB, H.cadera, R.SHORT, [0, 0.985, -0.004], [0.15, 0.115, 0.104], { clip: [ymenos(1.085)], tela: 1 });
  E(FB, H.cadera, R.SHORT, [0, 0.93, -0.046], [0.132, 0.078, 0.056], { tela: 1 });
  E(FB, H.torso, R.CAMISA, [0, 1.13, -0.002], [0.14, 0.15, 0.092], { clip: [ypos(1.04)], tela: 1, bias: -0.004 });
  E(FB, H.torso, R.CAMISA, [0, 1.31, -0.006], [0.176, 0.185, 0.1], { tela: 1, bias: -0.004 });
  E(FB, H.torso, R.CAMISA, [0, 1.445, -0.012], [0.182, 0.08, 0.092], { tela: 1, bias: -0.004 });
  [-1, 1].forEach((s) => {
    E(FB, H.torso, R.CAMISA, [s * 0.07, 1.36, 0.04], [0.07, 0.05, 0.036], { tela: 1, bias: -0.004 });
    E(FB, H.torso, R.CAMISA, [s * 0.118, 1.32, -0.04], [0.068, 0.12, 0.07], { tela: 1, bias: -0.004 });
    E(FB, H.torso, R.CAMISA, [s * 0.1, 1.5, -0.01], [0.07, 0.035, 0.06], { tela: 1, bias: -0.004 });   /* trapecios */
  });
  C(FB, H.torso, R.CAMISA, [0, 1.49, -0.012], 0.072, [0, 1.512, -0.008], 0.058, { tela: 1 });
  C(FB, H.torso, R.CUELLO, [0, 1.505, -0.008], 0.058, [0, 1.522, -0.006], 0.052, { bias: -0.006 });
  C(FB, H.cabeza, R.PIEL, [0, 1.5, -0.008], 0.048, [0, 1.665, 0.005], 0.042);

  /* cabeza */
  E(FB, H.cabeza, R.PIEL, [0, 1.765, -0.006], [0.084, 0.108, 0.098]);
  E(FB, H.cabeza, R.PIEL, [0, 1.705, 0.02], [0.072, 0.09, 0.082]);
  E(FB, H.cabeza, R.PIEL, [0, 1.668, 0.026], [0.052, 0.05, 0.056]);
  E(FB, H.cabeza, R.PIEL, [0, 1.642, 0.062], [0.03, 0.025, 0.028]);
  E(FB, H.cabeza, R.PIEL, [0, 1.777, 0.07], [0.058, 0.01, 0.022]);
  C(FB, H.cabeza, R.PIEL, [0, 1.745, 0.084], 0.012, [0, 1.715, 0.108], 0.015);
  E(FB, H.cabeza, R.PIEL, [0, 1.712, 0.105], [0.013, 0.011, 0.012]);
  E(FB, H.cabeza, R.LABIO, [0, 1.676, 0.093], [0.027, 0.009, 0.014], { bias: -0.001 });
  [-1, 1].forEach((s) => {
    E(FB, H.cabeza, R.PIEL, [s * 0.015, 1.708, 0.098], [0.011, 0.011, 0.011]);
    E(FB, H.cabeza, R.PIEL, [s * 0.079, 1.74, -0.004], [0.011, 0.028, 0.02]);
  });
  E(FB, H.cabeza, R.PELO, [0, 1.775, -0.012], [0.092 + cfg.pelo, 0.112 + cfg.pelo, 0.106 + cfg.pelo], { clip: [{ n: [0, -0.625, 0.78], c: -1.125 }], bias: -0.002 });

  /* brazos */
  [[-1, FAI, H.hombroI, H.codoI], [1, FAD, H.hombroD, H.codoD]].forEach(([s, f, hs, he]) => {
    const X = (x) => s * x;
    E(f, hs, R.CAMISA, [X(0.205), 1.472, 0], [0.062, 0.06, 0.064], { tela: 1, bias: -0.004 });
    C(f, hs, R.PIEL, [X(0.205), 1.47, 0], 0.05, [X(0.228), 1.2, 0], 0.044);
    E(f, hs, R.PIEL, [X(0.213), 1.38, 0.008], [0.046, 0.07, 0.046]);
    if (cfg.largo) {
      C(f, hs, R.CAMISA, [X(0.205), 1.47, 0], 0.063, [X(0.228), 1.2, 0], 0.053, { tela: 1, bias: -0.004 });
      C(f, he, R.CAMISA, [X(0.228), 1.2, 0], 0.053, [X(0.246), 0.99, 0], 0.041, { tela: 1, bias: -0.004, trim: { eje: 1, v: 1.03, ancho: 0.03, lado: -1, reg: R.PUNO } });
      C(f, he, R.PIEL, [X(0.228), 1.2, 0], 0.046, [X(0.245), 0.955, 0], 0.033);
    } else {
      C(f, hs, R.CAMISA, [X(0.205), 1.47, 0], 0.058, [X(0.226), 1.33, 0], 0.056, { tela: 1, bias: -0.004, clip: [ypos(1.345)], trim: { eje: 1, v: 1.375, ancho: 0.03, lado: -1, reg: R.PUNO } });
      C(f, he, R.PIEL, [X(0.228), 1.2, 0], 0.046, [X(0.245), 0.955, 0], 0.033);
      E(f, he, R.PIEL, [X(0.236), 1.1, 0.005], [0.042, 0.09, 0.042]);
    }
    const g = cfg.guante;
    const rm = g ? R.GUANTE : R.PIEL;
    E(f, he, rm, [X(0.25), g ? 0.89 : 0.895, 0.004], g ? [0.043, 0.07, 0.03] : [0.034, 0.052, 0.02], { bias: g ? -0.003 : 0 });
    C(f, he, rm, [X(0.25), 0.86, 0.002], g ? 0.034 : 0.026, [X(0.254), g ? 0.78 : 0.79, 0.006], g ? 0.022 : 0.016, { bias: g ? -0.003 : 0 });
    C(f, he, rm, [X(0.25 - (g ? 0.036 : 0.03)), 0.9, 0.016], g ? 0.016 : 0.011, [X(0.25 - (g ? 0.034 : 0.026)), g ? 0.82 : 0.84, 0.026], g ? 0.012 : 0.009, { bias: g ? -0.003 : 0 });
    if (g) C(f, he, R.GUANTE_B, [X(0.245), 0.985, 0], 0.046, [X(0.25), 0.93, 0], 0.046, { bias: -0.005 });
  });

  /* piernas */
  [[-1, FLI, H.caderaI, H.rodillaI], [1, FLD, H.caderaD, H.rodillaD]].forEach(([s, f, hc, hk]) => {
    const X = (x) => s * x;
    C(f, hc, R.PIEL, [X(0.1), 0.93, 0], 0.08, [X(0.092), 0.5, 0], 0.056);
    E(f, hc, R.PIEL, [X(0.105), 0.76, 0.018], [0.066, 0.16, 0.068]);
    E(f, hc, R.PIEL, [X(0.095), 0.74, -0.03], [0.062, 0.15, 0.058]);
    C(f, hc, R.SHORT, [X(0.1), 0.97, 0], 0.099, [X(0.098), 0.64, 0], 0.097, { tela: 1, bias: -0.004, clip: [ypos(0.63)], trim: { eje: 1, v: 0.655, ancho: 0.025, lado: -1, reg: R.SHORT_B } });
    E(f, hk, R.PIEL, [X(0.092), 0.475, 0.012], [0.056, 0.062, 0.057]);
    C(f, hk, R.MEDIA, [X(0.092), 0.52, 0], 0.056, [X(0.09), 0.13, 0], 0.038, { tela: 1, bias: -0.003, clip: [ymenos(0.52)], trim: { eje: 1, v: 0.47, ancho: 0.05, lado: 1, reg: R.MEDIA_B } });
    E(f, hk, R.MEDIA, [X(0.094), 0.345, -0.018], [0.056, 0.125, 0.066], { tela: 1, bias: -0.003, clip: [ymenos(0.52)] });
    C(f, hk, R.MEDIA, [X(0.09), 0.15, 0], 0.038, [X(0.09), 0.075, 0], 0.041, { tela: 1 });
    /* bota */
    C(f, hk, R.BOTA, [X(0.09), 0.115, 0], 0.046, [X(0.09), 0.06, 0.006], 0.05);
    E(f, hk, R.BOTA, [X(0.09), 0.05, 0.052], [0.047, 0.042, 0.12]);
    E(f, hk, R.BOTA, [X(0.09), 0.055, -0.04], [0.04, 0.045, 0.045]);
    E(f, hk, R.BOTA, [X(0.09), 0.04, 0.15], [0.04, 0.03, 0.045]);
    E(f, hk, R.SUELA, [X(0.09), 0.016, 0.06], [0.05, 0.016, 0.14], { bias: -0.003 });
    [[-0.03, 0.0], [0.03, 0.0], [-0.03, 0.12], [0.03, 0.12], [0, 0.17], [-0.025, -0.04], [0.025, -0.04]].forEach((q) =>
      E(f, hk, R.SUELA, [X(0.09) + q[0], 0.012, q[1] + 0.02], [0.008, 0.012, 0.008], { bias: -0.004 }));
  });
  return P;
}

/* ───── evaluación ───── */
const K_FAM = 0.018;
function evalPrim(o, x, y, z) {
  let d = o.t === "E" ? sdElip(x, y, z, o.c, o.r) : sdCono(x, y, z, o);
  for (let i = 0; i < o.clip.length; i++) {
    const c = o.clip[i]; d = max(d, c.n[0] * x + c.n[1] * y + c.n[2] * z - c.c);
  }
  if (o.tela) d += 0.0016 * (Math.sin(21 * x + 5 * y) * Math.sin(17 * y - 4 * z) + 0.6 * Math.sin(31 * z + 13 * y));
  return d;
}
function campo(P, x, y, z, culled) {
  const F = [1e3, 1e3, 1e3, 1e3, 1e3];
  for (let i = 0; i < P.length; i++) {
    const o = P[i];
    if (culled && (x < o.lo[0] || x > o.hi[0] || y < o.lo[1] || y > o.hi[1] || z < o.lo[2] || z > o.hi[2])) continue;
    const d = evalPrim(o, x, y, z), f = o.fam;
    F[f] = F[f] > 900 ? d : smin(F[f], d, K_FAM);
  }
  const b = F[0];
  let r = b > 900 ? 1e3 : b;
  const unir = (a, c, k) => (a > 900 ? c : c > 900 ? a : smin(a, c, k));
  const lI = unir(b, F[3], 0.022), lD = unir(b, F[4], 0.022);
  r = min(lI, lD);
  r = unir(r, F[1], 0.012); r = unir(r, F[2], 0.012);
  return max(r, -y + 0.001);   /* suelo plano */
}

/* ───── marching cubes ───── */
function malla(P, h) {
  const x0 = -0.36, x1 = 0.36, y0 = -0.01, y1 = 1.9, z0 = -0.2, z1 = 0.28;
  const nx = Math.ceil((x1 - x0) / h) + 1, ny = Math.ceil((y1 - y0) / h) + 1, nz = Math.ceil((z1 - z0) / h) + 1;
  const val = new Float32Array(nx * ny * nz);
  const id = (i, j, k) => (k * ny + j) * nx + i;
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) val[id(i, j, k)] = campo(P, x0 + i * h, y0 + j * h, z0 + k * h, true);
  const cx = [0, 1, 1, 0, 0, 1, 1, 0], cy = [0, 0, 1, 1, 0, 0, 1, 1], cz = [0, 0, 0, 0, 1, 1, 1, 1];
  const eA = [0, 1, 3, 0, 4, 5, 7, 4, 0, 1, 2, 3], eB = [1, 2, 2, 3, 5, 6, 6, 7, 4, 5, 6, 7];
  const eAx = [0, 1, 0, 1, 0, 1, 0, 1, 2, 2, 2, 2];   /* eje de la arista */
  const eDx = [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0], eDy = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1], eDz = [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0];
  const cache = new Int32Array(nx * ny * nz * 3).fill(-1);
  const pos = [], idx = [];
  const cv = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let ci = 0;
    for (let c = 0; c < 8; c++) { cv[c] = val[id(i + cx[c], j + cy[c], k + cz[c])]; if (cv[c] > 0) ci |= 1 << c; }   /* bit = fuera */
    const em = edgeTable[ci]; if (!em) continue;
    const ev = new Array(12);
    for (let e = 0; e < 12; e++) {
      if (!(em & (1 << e))) continue;
      const bx = i + eDx[e], by = j + eDy[e], bz = k + eDz[e], key = id(bx, by, bz) * 3 + eAx[e];
      let v = cache[key];
      if (v < 0) {
        const a = cv[eA[e]], b = cv[eB[e]], t = a / (a - b);
        const ax = x0 + (i + cx[eA[e]]) * h, ay = y0 + (j + cy[eA[e]]) * h, az = z0 + (k + cz[eA[e]]) * h;
        const bx2 = x0 + (i + cx[eB[e]]) * h, by2 = y0 + (j + cy[eB[e]]) * h, bz2 = z0 + (k + cz[eB[e]]) * h;
        v = pos.length / 3; pos.push(ax + (bx2 - ax) * t, ay + (by2 - ay) * t, az + (bz2 - az) * t); cache[key] = v;
      }
      ev[e] = v;
    }
    for (let t = 0; triTable[ci * 16 + t] !== -1; t += 3) idx.push(ev[triTable[ci * 16 + t]], ev[triTable[ci * 16 + t + 1]], ev[triTable[ci * 16 + t + 2]]);
  }
  return { pos: Float32Array.from(pos), idx: Uint32Array.from(idx) };
}

/* ───── datos por vértice ───── */
function datos(P, m, h) {
  const n = m.pos.length / 3;
  const nor = new Float32Array(n * 3), ao = new Uint8Array(n), reg = new Uint8Array(n), skI = new Uint8Array(n * 4), skW = new Uint8Array(n * 4);
  const e = 0.0025;
  const F = (x, y, z) => campo(P, x, y, z, false);
  for (let v = 0; v < n; v++) {
    const x = m.pos[v * 3], y = m.pos[v * 3 + 1], z = m.pos[v * 3 + 2];
    let gx = F(x + e, y, z) - F(x - e, y, z), gy = F(x, y + e, z) - F(x, y - e, z), gz = F(x, y, z + e) - F(x, y, z - e);
    const l = sqrt(gx * gx + gy * gy + gz * gz) || 1; gx /= l; gy /= l; gz /= l;
    nor[v * 3] = gx; nor[v * 3 + 1] = gy; nor[v * 3 + 2] = gz;
    /* oclusión ambiental */
    let oc = 0, ws = 0;
    [[0.012, 1], [0.03, 0.8], [0.07, 0.55], [0.14, 0.35]].forEach(([o, w]) => { const d = F(x + gx * o, y + gy * o, z + gz * o); oc += w * max(0, o - d) / o; ws += w; });
    ao[v] = Math.round(255 * Math.min(1, Math.max(0.25, 1 - 0.9 * oc / ws)));
    /* región y pesos */
    let best = 1e9, bp = null; const dh = new Float32Array(HUESOS.length).fill(1e3);
    for (let i = 0; i < P.length; i++) {
      const o = P[i], d = evalPrim(o, x, y, z);
      if (d < dh[o.bone]) dh[o.bone] = d;
      const dd = d + o.bias; if (dd < best) { best = dd; bp = o; }
    }
    let r = bp.reg;
    if (bp.trim) { const t = bp.trim, c = [x, y, z][t.eje]; if (t.lado < 0 ? c < t.v : c > t.v) r = t.reg; }
    reg[v] = r;
    /* pesos de esqueleto: softmax de la distancia por hueso */
    let dmin = 1e9; for (let b = 0; b < dh.length; b++) dmin = min(dmin, dh[b]);
    const w = []; for (let b = 0; b < dh.length; b++) w.push([b, Math.exp(-(dh[b] - dmin) / 0.013)]);
    w.sort((p, q) => q[1] - p[1]);
    const top = w.slice(0, 4), sum = top.reduce((s, q) => s + q[1], 0);
    let acc = 0;
    for (let q = 0; q < 4; q++) { const wv = q < 3 ? Math.round(255 * top[q][1] / sum) : 255 - acc; acc += wv; skI[v * 4 + q] = top[q][0]; skW[v * 4 + q] = Math.max(0, wv); }
  }
  return { nor, ao, reg, skI, skW };
}

/* ───── corrige giros y agrupa triángulos por material ───── */
function ordena(m, d) {
  const idx = m.idx, tri = idx.length / 3, grupos = [[], [], []];
  for (let t = 0; t < tri; t++) {
    let a = idx[t * 3], b = idx[t * 3 + 1], c = idx[t * 3 + 2];
    const p = m.pos, ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2], vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const dot = nx * (d.nor[a * 3] + d.nor[b * 3] + d.nor[c * 3]) + ny * (d.nor[a * 3 + 1] + d.nor[b * 3 + 1] + d.nor[c * 3 + 1]) + nz * (d.nor[a * 3 + 2] + d.nor[b * 3 + 2] + d.nor[c * 3 + 2]);
    if (dot < 0) { const q = b; b = c; c = q; }
    /* grupo = el más frecuente entre los 3 vértices */
    const gs = [GRUPO[d.reg[a]], GRUPO[d.reg[b]], GRUPO[d.reg[c]]];
    const g = gs[0] === gs[1] || gs[0] === gs[2] ? gs[0] : gs[1] === gs[2] ? gs[1] : gs[0];
    grupos[g].push(a, b, c);
  }
  const out = [], rangos = []; let off = 0;
  grupos.forEach((g) => { rangos.push([off, g.length]); for (let q = 0; q < g.length; q++) out.push(g[q]); off += g.length; });
  return { idx: Uint32Array.from(out), rangos };
}

/* ───── decoración facial: busca la superficie de la cara en (x,y) ───── */
function superficie(P, x, y) {
  let z = 0.2;
  for (let i = 0; i < 400; i++) { const d = campo(P, x, y, z, false); if (d < 0.0004) break; z -= max(d * 0.8, 0.0006); }
  const e = 0.002, gx = campo(P, x + e, y, z, false) - campo(P, x - e, y, z, false), gy = campo(P, x, y + e, z, false) - campo(P, x, y - e, z, false), gz = campo(P, x, y, z + e, false) - campo(P, x, y, z - e, false);
  const l = sqrt(gx * gx + gy * gy + gz * gz);
  return { p: [x, y, z], n: [gx / l, gy / l, gz / l] };
}

/* ───── pivotes del esqueleto (coordenadas del reposo) ───── */
const PIVOTES = {
  cadera: [0, 0.95, 0], torso: [0, 1.01, 0], cabeza: [0, 1.74, 0],
  hombroI: [-0.205, 1.5, 0], hombroD: [0.205, 1.5, 0], codoI: [-0.228, 1.2, 0], codoD: [0.228, 1.2, 0],
  caderaI: [-0.09, 0.92, 0], caderaD: [0.09, 0.92, 0], rodillaI: [-0.09, 0.47, 0], rodillaD: [0.09, 0.47, 0],
};

function empaqueta(nombre, m, d, ord, meta) {
  const n = m.pos.length / 3;
  const cab = Buffer.from(JSON.stringify(meta));
  const pad = (4 - ((cab.length + 4) % 4)) % 4;
  const partes = [Buffer.alloc(4), cab, Buffer.alloc(pad, 32)];
  partes[0].writeUInt32LE(cab.length + pad, 0);
  const push = (ta) => partes.push(Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength));
  /* posición en Float32, normal Int8, resto Uint8 */
  push(m.pos);
  const nb = new Int8Array(n * 3); for (let i = 0; i < n * 3; i++) nb[i] = Math.round(d.nor[i] * 127); push(nb);
  push(d.reg); push(d.ao); push(d.skI); push(d.skW); push(ord.idx);
  fs.writeFileSync(nombre, Buffer.concat(partes));
  console.log(nombre, "vértices", n, "triángulos", ord.idx.length / 3, "bytes", fs.statSync(nombre).size);
}

function variante(nombre, cfg, h) {
  const t0 = Date.now();
  const P = crear(cfg), m = malla(P, h);
  const d = datos(P, m, h), ord = ordena(m, d);
  const cara = {
    ojoI: superficie(P, -0.034, 1.752), ojoD: superficie(P, 0.034, 1.752),
    cejaI: superficie(P, -0.034, 1.783), cejaD: superficie(P, 0.034, 1.783), boca: superficie(P, 0, 1.667),
  };
  const meta = { n: m.pos.length / 3, tri: ord.idx.length / 3, rangos: ord.rangos, huesos: HUESOS, pivotes: PIVOTES, cara };
  empaqueta(nombre, m, d, ord, meta);
  console.log(" ", nombre, ((Date.now() - t0) / 1000).toFixed(1) + " s");
}

const [, , only] = process.argv;
fs.mkdirSync("lib/cuerpo", { recursive: true });
const lista = {
  jugador: [{ largo: false, guante: false, pelo: 0 }, 0.0075],
  portero: [{ largo: true, guante: true, pelo: 0 }, 0.0075],
  "jugador-lo": [{ largo: false, guante: false, pelo: 0 }, 0.016],
  prueba: [{ largo: false, guante: false, pelo: 0 }, 0.02],
};
for (const k of Object.keys(lista)) if (!only || only === k) variante(`lib/cuerpo/${k}.bin`, lista[k][0], lista[k][1]);
