/* TOQUES TIKITEXTO (16-nov-2026) · videojuego en «Dinámicos»
   Un jugador, un balón y un solo control: mueves el pie. Cada toque suma puntos (con multiplicador) y se acaba cuando el balón toca el suelo.
   Con los puntos acumulados se desbloquean equipaciones, balones y fondos (callejón, playa, estadio, palacio, pirámides…).
   Fondos: si existe la foto libre `img/toques/<id>.jpg` (ver img/toques/LEEME.md) se usa; si no, se pinta una escena propia con código.
   Módulo ES; todo en <canvas>; sonidos sintetizados; sin escudos, logos ni fotos de jugadores. */

import * as THREE from "./lib/three.module.min.js";
import { POSES, precargar } from "./penaltis.js";
import { crearFigura } from "./penaltis_cuerpo.js";

const W = 400, H = 640, SUELO = 548, CADX = 200, CADY = SUELO - 172, L = 104, RB = 22, RP = 30, PARED = 26;
const G0 = 720, G1 = 1050, CD_TOQUE = 0.13, UMBRALES_TIKI = [30, 100];
const REACH = 140, HX_MIN = 62, HX_MAX = 338, PX = 196, ANK = 10;   /* alcance de la pierna (px), límites del cuerpo, px por metro, tobillo sobre el centro del pie */
const hexN = (s) => parseInt(String(s).slice(1), 16);
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;

/* ── Catálogo: se desbloquea con puntos acumulados ── */
export const EQUIPACIONES = [
  { id: "azul", n: "Azul clásica", p: 0, c1: "#1d5fd6", c2: "#f2f4f8", dib: "liso" },
  { id: "rojo", n: "Rojo fuego", p: 400, c1: "#d7263d", c2: "#f4f4f4", dib: "liso" },
  { id: "blanco", n: "Blanco puro", p: 1200, c1: "#f4f6fa", c2: "#1b2a4a", dib: "liso" },
  { id: "verde", n: "Verde campo", p: 2500, c1: "#17a05a", c2: "#f4f4f4", dib: "aros" },
  { id: "rayas", n: "Rayas azules", p: 4500, c1: "#ffffff", c2: "#1d5fd6", dib: "rayas" },
  { id: "amarillo", n: "Amarillo sol", p: 7000, c1: "#ffc824", c2: "#1d3d8f", dib: "liso" },
  { id: "negro", n: "Negro noche", p: 10000, c1: "#1a1d24", c2: "#ffd23a", dib: "aros" },
  { id: "neon", n: "Neón", p: 14000, c1: "#7a1cff", c2: "#19e6ff", dib: "rayas" },
];
export const BALONES = [
  { id: "clasico", n: "Clásico", p: 0, a: "#f6f7f9", b: "#171a20", est: "cuero" },
  { id: "dorado", n: "Dorado", p: 500, a: "#ffd23a", b: "#8a5a00", est: "cuero" },
  { id: "neon", n: "Neón", p: 1500, a: "#b8ff3a", b: "#ff2fa8", est: "cuero" },
  { id: "retro", n: "Retro", p: 3500, a: "#b8651b", b: "#fff2d0", est: "retro" },
  { id: "rojinegro", n: "Rojo y negro", p: 6500, a: "#e53946", b: "#14161c", est: "cuero" },
  { id: "plata", n: "Plata", p: 10000, a: "#dfe6ee", b: "#2a62d6", est: "cuero" },
];

/* ── Fondos: escena pintada con código (y foto libre opcional con el mismo id) ── */
const ladrillos = (g, x, y, w, h, c1, c2, bw, bh) => {
  for (let j = 0; j * bh < h; j++) for (let i = -1; i * bw < w + bw; i++) {
    const ox = (j % 2) * bw / 2; g.fillStyle = (i * 7 + j * 13) % 5 === 0 ? c2 : c1; g.fillRect(x + i * bw + ox, y + j * bh, bw - 2, bh - 2);
  }
};
const cielo = (g, w, h, a, b, c) => { const k = g.createLinearGradient(0, 0, 0, h); k.addColorStop(0, a); k.addColorStop(c == null ? 1 : c, b); k.addColorStop(1, b); g.fillStyle = k; g.fillRect(0, 0, w, h); };
const sol = (g, x, y, r, c) => { const k = g.createRadialGradient(x, y, 0, x, y, r * 3); k.addColorStop(0, c); k.addColorStop(0.3, c); k.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = k; g.beginPath(); g.arc(x, y, r * 3, 0, 7); g.fill(); g.fillStyle = "#fff8d6"; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
export const FONDOS = [
  { id: "callejon", n: "Callejón", p: 0, pinta: (g, w, h, gy) => {
    cielo(g, w, gy, "#10141d", "#2a2230"); const m = Math.min(w * 0.3, 190);
    g.fillStyle = "#1b1612"; g.fillRect(0, 0, w, gy); ladrillos(g, 0, 0, m, gy, "#4a2e25", "#3a2019", 34, 16); ladrillos(g, w - m, 0, m, gy, "#3d2a26", "#2f1d19", 34, 16);
    g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(m - 14, 0, 14, gy); g.fillRect(w - m, 0, 14, gy);
    const f = g.createLinearGradient(0, gy * 0.2, 0, gy); f.addColorStop(0, "#161a24"); f.addColorStop(1, "#3a3140"); g.fillStyle = f; g.fillRect(m, 0, w - 2 * m, gy);
    g.fillStyle = "#222a36"; for (let i = 0; i < 3; i++) g.fillRect(m + 20 + i * 60, gy * 0.18 + i * 14, 44, gy * 0.5); g.fillStyle = "rgba(255,210,120,.5)"; for (let i = 0; i < 6; i++) g.fillRect(m + 28 + (i % 3) * 60, gy * 0.22 + (i % 2) * 40 + (i / 3 | 0) * 70, 12, 16);
    g.strokeStyle = "#2c2c33"; g.lineWidth = 8; g.beginPath(); g.moveTo(m, gy * 0.3); g.lineTo(m - 2, gy * 0.3); g.moveTo(0, gy * 0.42); g.lineTo(m, gy * 0.42); g.stroke();
    g.fillStyle = "#ff3d8a"; g.font = "900 " + Math.round(gy * 0.07) + "px system-ui,Arial"; g.save(); g.translate(w - m + 30, gy * 0.3); g.rotate(-0.08); g.shadowColor = "#ff3d8a"; g.shadowBlur = 18; g.fillText("GOL", 0, 0); g.restore();
    g.fillStyle = "#26402e"; g.fillRect(m + 8, gy - 96, 78, 96); g.fillStyle = "#1c2f22"; g.fillRect(m + 8, gy - 100, 78, 10); g.fillStyle = "#3a5a44"; g.fillRect(m + 14, gy - 86, 66, 4);
    const lamp = g.createRadialGradient(w * 0.62, gy * 0.12, 0, w * 0.62, gy * 0.12, gy * 0.55); lamp.addColorStop(0, "rgba(255,200,110,.55)"); lamp.addColorStop(1, "rgba(255,200,110,0)"); g.fillStyle = lamp; g.fillRect(0, 0, w, gy);
    g.fillStyle = "#ffd88a"; g.beginPath(); g.arc(w * 0.62, gy * 0.12, 7, 0, 7); g.fill();
    const s = g.createLinearGradient(0, gy, 0, h); s.addColorStop(0, "#3b3744"); s.addColorStop(1, "#14131a"); g.fillStyle = s; g.fillRect(0, gy, w, h - gy);
    g.fillStyle = "rgba(120,160,220,.22)"; for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(w * (0.2 + i * 0.16), gy + 24 + (i % 2) * 26, 46, 8, 0, 0, 7); g.fill(); }
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(w / 2, gy); g.lineTo(w * (i / 7), h); g.stroke(); }
  } },
  { id: "playa", n: "Playa", p: 600, pinta: (g, w, h, gy) => {
    cielo(g, w, gy * 0.8, "#2e8fe6", "#bfe8ff"); sol(g, w * 0.78, gy * 0.22, 26, "rgba(255,240,170,.9)");
    g.fillStyle = "rgba(255,255,255,.85)"; [[0.2, 0.18, 70], [0.5, 0.1, 50], [0.34, 0.3, 40]].forEach((c) => { g.beginPath(); g.ellipse(w * c[0], gy * c[1], c[2], c[2] * 0.3, 0, 0, 7); g.ellipse(w * c[0] + c[2] * 0.5, gy * c[1] - 6, c[2] * 0.6, c[2] * 0.28, 0, 0, 7); g.fill(); });
    const m = g.createLinearGradient(0, gy * 0.6, 0, gy); m.addColorStop(0, "#1fa0d6"); m.addColorStop(1, "#0b6aa8"); g.fillStyle = m; g.fillRect(0, gy * 0.62, w, gy * 0.38);
    g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = gy * 0.66 + i * gy * 0.04; g.beginPath(); for (let x = 0; x <= w; x += 14) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 3); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.moveTo(0, gy - 14); for (let x = 0; x <= w; x += 12) g.lineTo(x, gy - 10 + Math.sin(x * 0.06) * 5); g.lineTo(w, gy + 6); g.lineTo(0, gy + 6); g.fill();
    const a = g.createLinearGradient(0, gy, 0, h); a.addColorStop(0, "#f2d9a0"); a.addColorStop(1, "#d6b06a"); g.fillStyle = a; g.fillRect(0, gy, w, h - gy);
    const palma = (x, y, s) => { g.strokeStyle = "#6b4a2a"; g.lineWidth = 9 * s; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 24 * s, y - 80 * s, x + 8 * s, y - 160 * s); g.stroke(); g.fillStyle = "#1e8f45"; for (let i = 0; i < 7; i++) { const an = -Math.PI / 2 + (i - 3) * 0.55; g.beginPath(); g.moveTo(x + 8 * s, y - 160 * s); g.quadraticCurveTo(x + 8 * s + Math.cos(an) * 60 * s, y - 160 * s + Math.sin(an) * 40 * s - 14 * s, x + 8 * s + Math.cos(an) * 96 * s, y - 160 * s + Math.sin(an) * 40 * s + 34 * s); g.quadraticCurveTo(x + 8 * s + Math.cos(an) * 60 * s, y - 160 * s + Math.sin(an) * 40 * s + 8 * s, x + 8 * s, y - 160 * s); g.fill(); } };
    palma(w * 0.08, gy + 40, 1.2); palma(w * 0.93, gy + 20, 1);
    g.fillStyle = "#ff5a5f"; g.beginPath(); g.arc(w * 0.22, gy + 70, 38, Math.PI, 0); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(w * 0.22, gy + 70, 38, Math.PI * 1.35, Math.PI * 1.65); g.lineTo(w * 0.22, gy + 70); g.fill(); g.fillStyle = "#6b4a2a"; g.fillRect(w * 0.22 - 2, gy + 70, 4, 36);
  } },
  { id: "estadio", n: "Estadio", p: 1800, pinta: (g, w, h, gy) => {
    cielo(g, w, gy, "#050b22", "#14306a", 0.9); g.fillStyle = "#0a0f24"; g.beginPath(); g.moveTo(0, gy * 0.5); g.lineTo(w, gy * 0.5); g.lineTo(w, gy); g.lineTo(0, gy); g.fill();
    const cols = ["#ff4d6d", "#ffd23a", "#4aa8ff", "#ffffff", "#52ff9c"]; for (let r = 0; r < 9; r++) for (let x = 0; x < w; x += 9) { g.fillStyle = cols[(x * 7 + r * 3) % 5 | 0]; g.globalAlpha = 0.5 + ((x * 13 + r * 29) % 40) / 100; g.fillRect(x + (r % 2) * 4, gy * 0.5 + r * (gy * 0.46 / 9), 6, 5); } g.globalAlpha = 1;
    g.fillStyle = "#10162e"; g.fillRect(0, gy * 0.5 - 8, w, 10);
    [0.12, 0.88].forEach((fx) => { const k = g.createRadialGradient(w * fx, gy * 0.18, 0, w * fx, gy * 0.18, gy * 0.7); k.addColorStop(0, "rgba(255,250,220,.9)"); k.addColorStop(0.15, "rgba(255,250,220,.35)"); k.addColorStop(1, "rgba(255,250,220,0)"); g.fillStyle = k; g.fillRect(0, 0, w, gy); g.fillStyle = "#fffbe8"; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) g.fillRect(w * fx - 22 + i * 12, gy * 0.12 + j * 14, 9, 9); });
    const c = g.createLinearGradient(0, gy, 0, h); c.addColorStop(0, "#1c7a3a"); c.addColorStop(1, "#0c4a22"); g.fillStyle = c; g.fillRect(0, gy, w, h - gy);
    for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.08)"; g.fillRect(0, gy + i * (h - gy) / 12, w, (h - gy) / 12); }
    g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, gy + 6); g.lineTo(w, gy + 6); g.stroke();
  } },
  { id: "palacio", n: "Palacio", p: 3500, pinta: (g, w, h, gy) => {
    cielo(g, w, gy, "#f2a65a", "#ffe1a8", 0.75); sol(g, w * 0.5, gy * 0.5, 28, "rgba(255,214,140,.8)");
    const cx = w / 2, an = Math.min(w * 0.82, 760), x0 = cx - an / 2, b = gy; g.fillStyle = "#e9dcc3"; g.fillRect(x0, b - gy * 0.38, an, gy * 0.38);
    g.fillStyle = "#d9c9a8"; g.fillRect(x0, b - gy * 0.38, an, 10);
    g.fillStyle = "#f4e9d2"; g.fillRect(cx - an * 0.2, b - gy * 0.56, an * 0.4, gy * 0.2);
    g.fillStyle = "#2f8f7a"; g.beginPath(); g.moveTo(cx - an * 0.13, b - gy * 0.56); g.quadraticCurveTo(cx, b - gy * 1.05, cx + an * 0.13, b - gy * 0.56); g.fill(); g.fillRect(cx - 2, b - gy * 0.95, 4, 22); g.fillStyle = "#ffd23a"; g.beginPath(); g.arc(cx, b - gy * 0.97, 5, 0, 7); g.fill();
    [-1, 1].forEach((s) => { g.fillStyle = "#f4e9d2"; g.fillRect(cx + s * an * 0.43 - 28, b - gy * 0.62, 56, gy * 0.24); g.fillStyle = "#2f8f7a"; g.beginPath(); g.moveTo(cx + s * an * 0.43 - 34, b - gy * 0.62); g.lineTo(cx + s * an * 0.43, b - gy * 0.78); g.lineTo(cx + s * an * 0.43 + 34, b - gy * 0.62); g.fill(); });
    g.fillStyle = "#c9b894"; for (let i = 0; i < 12; i++) g.fillRect(x0 + 14 + i * (an - 28) / 11 - 4, b - gy * 0.37, 8, gy * 0.37);
    g.fillStyle = "#6b5a46"; for (let i = 0; i < 10; i++) { const x = x0 + 40 + i * (an - 80) / 9; g.beginPath(); g.arc(x, b - gy * 0.22, 12, Math.PI, 0); g.fillRect(x - 12, b - gy * 0.22, 24, 30); g.fill(); }
    const s = g.createLinearGradient(0, gy, 0, h); s.addColorStop(0, "#cdbd9b"); s.addColorStop(1, "#8f8062"); g.fillStyle = s; g.fillRect(0, gy, w, h - gy);
    g.fillStyle = "#4aa8c8"; g.beginPath(); g.ellipse(cx, gy + (h - gy) * 0.55, an * 0.22, 16, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.ellipse(cx, gy + (h - gy) * 0.55 - 20, 4, 24, 0, 0, 7); g.fill();
  } },
  { id: "piramides", n: "Pirámides", p: 6000, pinta: (g, w, h, gy) => {
    cielo(g, w, gy, "#2a78c8", "#ffd9a0", 0.9); sol(g, w * 0.2, gy * 0.3, 24, "rgba(255,238,170,.9)");
    const pir = (x, y, an, al, c1, c2) => { g.fillStyle = c1; g.beginPath(); g.moveTo(x - an / 2, y); g.lineTo(x, y - al); g.lineTo(x, y); g.fill(); g.fillStyle = c2; g.beginPath(); g.moveTo(x, y - al); g.lineTo(x + an / 2, y); g.lineTo(x, y); g.fill(); };
    g.fillStyle = "#e6c07a"; g.beginPath(); g.moveTo(0, gy * 0.9); for (let x = 0; x <= w; x += 20) g.lineTo(x, gy * 0.86 + Math.sin(x * 0.008) * 10); g.lineTo(w, gy); g.lineTo(0, gy); g.fill();
    pir(w * 0.72, gy * 0.95, w * 0.2, gy * 0.42, "#d9a85c", "#b8863f"); pir(w * 0.5, gy, w * 0.3, gy * 0.58, "#e4b86c", "#be8a44"); pir(w * 0.28, gy * 0.97, w * 0.17, gy * 0.32, "#d9a85c", "#b8863f");
    const a = g.createLinearGradient(0, gy, 0, h); a.addColorStop(0, "#e8c27a"); a.addColorStop(1, "#bf9248"); g.fillStyle = a; g.fillRect(0, gy, w, h - gy);
    g.strokeStyle = "rgba(160,110,40,.35)"; g.lineWidth = 2; for (let i = 0; i < 6; i++) { g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, gy + 30 + i * 28 + Math.sin(x * 0.03 + i) * 5); g.stroke(); }
    g.fillStyle = "#6b4a2a"; g.fillRect(w * 0.88, gy - 20, 4, 40); g.fillStyle = "#8a6a3a"; g.beginPath(); g.ellipse(w * 0.9, gy - 26, 24, 10, 0, 0, 7); g.fill();
  } },
  { id: "coliseo", n: "Coliseo", p: 9000, pinta: (g, w, h, gy) => {
    cielo(g, w, gy, "#5a3a8f", "#ff9a5a", 0.9); sol(g, w * 0.7, gy * 0.6, 30, "rgba(255,210,140,.85)");
    const an = Math.min(w * 0.94, 820), x0 = (w - an) / 2, top = gy * 0.28; g.fillStyle = "#c9a47a"; g.fillRect(x0, top, an, gy - top);
    for (let f = 0; f < 3; f++) { const y = top + f * (gy - top) / 3, hh = (gy - top) / 3; g.fillStyle = f ? "#d6b58a" : "#bf9a70"; g.fillRect(x0, y, an, hh); const n = 14; for (let i = 0; i < n; i++) { const x = x0 + 12 + i * (an - 24) / n, aw = (an - 24) / n - 10; g.fillStyle = "#3b2a2a"; g.beginPath(); g.moveTo(x, y + hh - 4); g.lineTo(x, y + hh * 0.4); g.arc(x + aw / 2, y + hh * 0.4, aw / 2, Math.PI, 0); g.lineTo(x + aw, y + hh - 4); g.fill(); } g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x0, y + hh - 5, an, 5); }
    g.fillStyle = "#b08a62"; g.fillRect(x0 - 8, top - 8, an + 16, 10);
    const s = g.createLinearGradient(0, gy, 0, h); s.addColorStop(0, "#8f7650"); s.addColorStop(1, "#4a3c28"); g.fillStyle = s; g.fillRect(0, gy, w, h - gy);
  } },
  { id: "muralla", n: "Gran Muralla", p: 13000, pinta: (g, w, h, gy) => {
    cielo(g, w, gy, "#7ab6e8", "#e8f4ff"); g.fillStyle = "rgba(255,255,255,.8)"; [[0.25, 0.2], [0.65, 0.12]].forEach((c) => { g.beginPath(); g.ellipse(w * c[0], gy * c[1], 60, 14, 0, 0, 7); g.fill(); });
    const mont = (c, off, amp, base) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, gy); for (let x = 0; x <= w; x += 10) g.lineTo(x, gy * base - Math.abs(Math.sin(x * 0.006 + off)) * amp - Math.sin(x * 0.021 + off) * amp * 0.2); g.lineTo(w, gy); g.fill(); };
    mont("#9fb7c9", 0.5, gy * 0.32, 0.68); mont("#6f9a8a", 2.1, gy * 0.26, 0.8); mont("#3f7a55", 4, gy * 0.2, 0.92);
    g.strokeStyle = "#a89a82"; g.lineWidth = 14; g.lineJoin = "round"; g.beginPath(); g.moveTo(0, gy * 0.82); g.lineTo(w * 0.2, gy * 0.7); g.lineTo(w * 0.38, gy * 0.76); g.lineTo(w * 0.6, gy * 0.56); g.lineTo(w * 0.82, gy * 0.64); g.lineTo(w, gy * 0.48); g.stroke(); g.strokeStyle = "#cdbf9f"; g.lineWidth = 6; g.stroke();
    [[0.2, 0.7], [0.6, 0.56], [0.82, 0.64]].forEach((t) => { g.fillStyle = "#8f7d62"; g.fillRect(w * t[0] - 16, gy * t[1] - 36, 32, 34); g.fillStyle = "#b39f80"; for (let i = 0; i < 3; i++) g.fillRect(w * t[0] - 16 + i * 12, gy * t[1] - 42, 8, 8); g.fillStyle = "#3b2a22"; g.fillRect(w * t[0] - 5, gy * t[1] - 22, 10, 16); });
    const a = g.createLinearGradient(0, gy, 0, h); a.addColorStop(0, "#4f8a3f"); a.addColorStop(1, "#2f5f2a"); g.fillStyle = a; g.fillRect(0, gy, w, h - gy);
  } },
  { id: "torre", n: "Torre Eiffel", p: 18000, pinta: (g, w, h, gy) => {
    cielo(g, w, gy, "#1b1a5a", "#ff8f6b", 0.95); g.fillStyle = "rgba(255,255,255,.8)"; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % w, (i * 53) % (gy * 0.5), 2, 2);
    const cx = w * 0.5, y0 = gy, th = gy * 0.88; g.fillStyle = "#3a2d3f";
    const lado = (s) => { g.beginPath(); g.moveTo(cx + s * 90, y0); g.quadraticCurveTo(cx + s * 40, y0 - th * 0.38, cx + s * 22, y0 - th * 0.55); g.quadraticCurveTo(cx + s * 12, y0 - th * 0.8, cx + s * 3, y0 - th); g.lineTo(cx, y0 - th); g.lineTo(cx, y0); g.fill(); }; lado(-1); lado(1);
    g.strokeStyle = "#ff9a6b"; g.lineWidth = 3; [0.3, 0.52].forEach((f) => { const hw = 26 - f * 24; g.beginPath(); g.moveTo(cx - hw - 20, y0 - th * f); g.lineTo(cx + hw + 20, y0 - th * f); g.stroke(); });
    g.fillStyle = "#1b1a2a"; g.beginPath(); g.moveTo(cx - 52, y0); g.quadraticCurveTo(cx, y0 - th * 0.28, cx + 52, y0); g.fill();
    g.fillStyle = "#2a2540"; for (let i = 0; i < 14; i++) { const bw = 40 + (i * 37) % 50, bh = 30 + (i * 53) % 60; g.fillRect(i * w / 13 - 20, gy - bh, bw, bh); }
    const s = g.createLinearGradient(0, gy, 0, h); s.addColorStop(0, "#3a3550"); s.addColorStop(1, "#15122a"); g.fillStyle = s; g.fillRect(0, gy, w, h - gy);
    g.fillStyle = "rgba(255,200,120,.35)"; for (let i = 0; i < 6; i++) g.fillRect(w * (0.1 + i * 0.16), gy + 26 + (i % 2) * 18, 40, 4);
  } },
  { id: "nuevayork", n: "Nueva York", p: 25000, pinta: (g, w, h, gy) => {
    cielo(g, w, gy, "#0b1030", "#3a2a6a", 0.95); g.fillStyle = "rgba(255,255,255,.85)"; for (let i = 0; i < 50; i++) g.fillRect((i * 131) % w, (i * 47) % (gy * 0.5), 2, 2);
    g.fillStyle = "#e8f0ff"; g.beginPath(); g.arc(w * 0.82, gy * 0.2, 20, 0, 7); g.fill();
    for (let cap = 0; cap < 2; cap++) { let x = -20; while (x < w) { const bw = 34 + ((x * 7 + cap * 31) % 46), bh = gy * (cap ? 0.3 : 0.5) + ((x * 13 + cap * 17) % 90); g.fillStyle = cap ? "#171b3f" : "#0b0e26"; g.fillRect(x, gy - bh, bw, bh); if (!cap) { g.fillStyle = "rgba(255,214,120,.8)"; for (let wy = gy - bh + 10; wy < gy - 10; wy += 16) for (let wx = x + 6; wx < x + bw - 8; wx += 11) if (((wx * 3 + wy * 5) | 0) % 5 > 1) g.fillRect(wx, wy, 5, 8); } x += bw + 4; } }
    g.fillStyle = "#0b0e26"; g.fillRect(w * 0.3 - 3, gy - gy * 0.78, 6, 40);
    const s = g.createLinearGradient(0, gy, 0, h); s.addColorStop(0, "#26264a"); s.addColorStop(1, "#0f0e22"); g.fillStyle = s; g.fillRect(0, gy, w, h - gy);
    g.fillStyle = "rgba(255,200,80,.18)"; for (let i = 0; i < 8; i++) g.fillRect(w * (0.05 + i * 0.13), gy + 20, 50, 6);
  } },
];
const ID_FONDO = {}; FONDOS.forEach((f) => { ID_FONDO[f.id] = f; });

/* ── Balón ── */
function pintaBalon(g, x, y, r, b, ang) {
  g.save(); g.translate(x, y); const k = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r); k.addColorStop(0, "#fff"); k.addColorStop(0.35, b.a); k.addColorStop(1, b.a);
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = k; g.fill(); g.save(); g.clip(); g.rotate(ang);
  g.fillStyle = b.b;
  if (b.est === "retro") { g.strokeStyle = b.b; g.lineWidth = r * 0.07; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(0, 0); const a = i * 1.2566; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); g.stroke(); } g.beginPath(); g.arc(0, 0, r * 0.5, 0, 7); g.stroke(); }
  else {
    const pent = (cx, cy, rr, a0) => { g.beginPath(); for (let i = 0; i < 5; i++) { const a = a0 + i * 1.2566; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); };
    pent(0, 0, r * 0.38, -Math.PI / 2); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 1.2566 + 0.628; pent(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98, r * 0.38, a + Math.PI / 2); }
    g.strokeStyle = b.b; g.lineWidth = r * 0.05; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 1.2566; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36); g.lineTo(Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66); g.stroke(); }
  }
  g.restore(); const sh = g.createRadialGradient(-r * 0.3, -r * 0.35, 0, 0, 0, r); sh.addColorStop(0, "rgba(255,255,255,.55)"); sh.addColorStop(0.35, "rgba(255,255,255,0)"); sh.addColorStop(0.75, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.35)");
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.fillStyle = sh; g.fill(); g.restore();
}

/* ── Personaje (de frente): solo se mueve el pie; la pierna se dobla con cinemática inversa ── */
function rodilla(hx, hy, fx, fy, lado) {
  let dx = fx - hx, dy = fy - hy, d = Math.hypot(dx, dy); const max = 2 * L - 0.5; if (d > max) { dx *= max / d; dy *= max / d; d = max; } if (d < 24) { d = 24; }
  const base = Math.atan2(dy, dx), a = Math.acos(clamp(d / (2 * L), 0, 1)), A = { x: hx + Math.cos(base + a) * L, y: hy + Math.sin(base + a) * L }, B = { x: hx + Math.cos(base - a) * L, y: hy + Math.sin(base - a) * L };
  const k = (A.x - hx) * lado > (B.x - hx) * lado ? A : B; return { k: k, f: { x: hx + dx, y: hy + dy } };
}
function pintaJugador(g, S, kit, anim) {
  const hx = CADX, hy = CADY, piel = "#e8b78d", pelo = "#2a1b12", c1 = kit.c1, c2 = kit.c2;
  const lado = S.foot.x >= hx ? 1 : -1, ik = rodilla(hx + lado * 12, hy + 6, S.foot.x, S.foot.y, lado), fijo = -lado;
  g.save(); g.lineCap = "round"; g.lineJoin = "round";
  /* sombra */
  g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.ellipse(hx, SUELO + 4, 74, 12, 0, 0, 7); g.fill();
  const pierna = (x0, y0, kx, ky, fx, fy, grosor) => {
    g.strokeStyle = piel; g.lineWidth = grosor; g.beginPath(); g.moveTo(x0, y0); g.lineTo(kx, ky); g.stroke();
    /* calcetín = tramo inferior */
    const mx = lerp(kx, fx, 0.32), my = lerp(ky, fy, 0.32); g.strokeStyle = piel; g.beginPath(); g.moveTo(kx, ky); g.lineTo(mx, my); g.stroke(); g.strokeStyle = c1; g.lineWidth = grosor + 1; g.beginPath(); g.moveTo(mx, my); g.lineTo(fx, fy); g.stroke();
    g.strokeStyle = c2; g.lineWidth = grosor + 2; g.beginPath(); g.moveTo(lerp(mx, fx, 0.15), lerp(my, fy, 0.15)); g.lineTo(lerp(mx, fx, 0.32), lerp(my, fy, 0.32)); g.stroke();
    /* bota */
    const an = Math.atan2(fy - ky, fx - kx); g.save(); g.translate(fx, fy); g.rotate(an - Math.PI / 2); g.fillStyle = "#14161c"; g.beginPath(); g.ellipse(0, 4, 13, 19, 0, 0, 7); g.fill(); g.fillStyle = "#e9eef5"; g.fillRect(-13, 14, 26, 4); g.fillStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.ellipse(-4, -1, 3, 9, 0, 0, 7); g.fill(); g.restore();
  };
  /* pierna de apoyo (recta) */
  pierna(hx + fijo * 14, hy + 8, hx + fijo * 17, hy + 8 + L, hx + fijo * 17, SUELO - 12, 22);
  /* tronco: camiseta */
  const tx = hx, ty = hy - 108, tw = 76;
  g.fillStyle = c1; g.beginPath(); g.moveTo(tx - tw / 2, ty + 6); g.quadraticCurveTo(tx - tw / 2 - 2, ty - 2, tx - tw / 2 + 12, ty - 4); g.lineTo(tx + tw / 2 - 12, ty - 4); g.quadraticCurveTo(tx + tw / 2 + 2, ty - 2, tx + tw / 2, ty + 6); g.lineTo(tx + tw / 2 - 5, hy + 6); g.lineTo(tx - tw / 2 + 5, hy + 6); g.closePath(); g.fill();
  g.save(); g.clip();
  if (kit.dib === "rayas") { g.fillStyle = c2; for (let i = -4; i < 4; i += 2) g.fillRect(tx + i * 10 - 5, ty - 6, 10, 130); }
  else if (kit.dib === "aros") { g.fillStyle = c2; for (let i = 0; i < 5; i++) g.fillRect(tx - 50, ty + 8 + i * 22, 100, 9); }
  g.restore();
  /* mangas y brazos (el brazo contrario al pie se abre para equilibrar) */
  const bal = clamp((S.foot.x - hx) / 180, -1, 1);
  [-1, 1].forEach((s) => {
    const abre = s === -lado ? 0.55 + Math.abs(bal) * 0.5 : 0.2 - Math.abs(bal) * 0.1, bx = tx + s * (tw / 2 - 4), by = ty + 10, an = Math.PI / 2 + s * abre + Math.sin(anim * 3 + s) * 0.03, hx2 = bx + Math.cos(an) * 70, hy2 = by + Math.sin(an) * 70;
    g.strokeStyle = piel; g.lineWidth = 15; g.beginPath(); g.moveTo(bx, by); g.lineTo(hx2, hy2); g.stroke(); g.strokeStyle = c1; g.lineWidth = 18; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(an) * 26, by + Math.sin(an) * 26); g.stroke();
    g.fillStyle = piel; g.beginPath(); g.arc(hx2, hy2, 8, 0, 7); g.fill();
  });
  /* pantalón */
  g.fillStyle = c2 === "#f2f4f8" || c2 === "#f4f4f4" || c2 === "#f4f6fa" ? "#1b2a4a" : c2; if (kit.dib === "rayas" && c1 === "#ffffff") g.fillStyle = "#ffffff";
  g.beginPath(); g.moveTo(tx - 38, hy + 4); g.lineTo(tx + 38, hy + 4); g.lineTo(tx + 44, hy + 40); g.lineTo(tx + 4, hy + 40); g.lineTo(tx, hy + 28); g.lineTo(tx - 4, hy + 40); g.lineTo(tx - 44, hy + 40); g.closePath(); g.fill();
  /* pierna que golpea (delante del pantalón: sale por debajo) */
  pierna(hx + lado * 12, hy + 28, ik.k.x, ik.k.y, ik.f.x, ik.f.y, 22);
  g.fillStyle = (g.fillStyle); g.fillStyle = c2 === "#f2f4f8" || c2 === "#f4f4f4" || c2 === "#f4f6fa" ? "#1b2a4a" : c2; if (kit.dib === "rayas" && c1 === "#ffffff") g.fillStyle = "#ffffff";
  g.beginPath(); g.moveTo(hx + lado * 12 - 22, hy + 6); g.lineTo(hx + lado * 12 + 22, hy + 6); g.lineTo(hx + lado * 12 + 24, hy + 38); g.lineTo(hx + lado * 12 - 24, hy + 38); g.closePath(); g.fill();
  /* cuello y cabeza */
  g.fillStyle = piel; g.fillRect(tx - 9, ty - 16, 18, 16); const cy = ty - 46; g.beginPath(); g.arc(tx, cy, 28, 0, 7); g.fill();
  g.fillStyle = pelo; g.beginPath(); g.arc(tx, cy - 3, 29, Math.PI * 1.03, Math.PI * 1.97); g.quadraticCurveTo(tx + 18, cy - 14, tx, cy - 14); g.quadraticCurveTo(tx - 18, cy - 14, tx - 28, cy - 4); g.fill();
  /* mira al balón */
  const mx = clamp((S.ball.x - tx) / 120, -1, 1) * 4, my = clamp((S.ball.y - cy) / 200, -1, 0.6) * 3;
  g.fillStyle = "#fff"; [-10, 10].forEach((o) => { g.beginPath(); g.ellipse(tx + o, cy + 2, 6, 7, 0, 0, 7); g.fill(); }); g.fillStyle = "#1a1208"; [-10, 10].forEach((o) => { g.beginPath(); g.arc(tx + o + mx, cy + 2 + my, 3.2, 0, 7); g.fill(); });
  g.strokeStyle = "#5a2a1a"; g.lineWidth = 2.5; g.beginPath(); g.arc(tx, cy + 12, 8, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.restore();
}
function miniEquipacion(g, w, h, kit) {
  g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2 + 4); const s = Math.min(w, h) / 120; g.scale(s, s);
  g.fillStyle = kit.c1; g.beginPath(); g.moveTo(-34, -30); g.lineTo(-16, -42); g.lineTo(-8, -38); g.quadraticCurveTo(0, -30, 8, -38); g.lineTo(16, -42); g.lineTo(34, -30); g.lineTo(44, -6); g.lineTo(30, 0); g.lineTo(26, -10); g.lineTo(26, 42); g.lineTo(-26, 42); g.lineTo(-26, -10); g.lineTo(-30, 0); g.lineTo(-44, -6); g.closePath(); g.fill(); g.save(); g.clip();
  if (kit.dib === "rayas") { g.fillStyle = kit.c2; for (let i = -5; i < 5; i += 2) g.fillRect(i * 10 - 5, -50, 10, 100); } else if (kit.dib === "aros") { g.fillStyle = kit.c2; for (let i = 0; i < 6; i++) g.fillRect(-50, -34 + i * 16, 100, 7); }
  g.restore(); g.strokeStyle = kit.c2; g.lineWidth = 4; g.beginPath(); g.moveTo(-8, -38); g.quadraticCurveTo(0, -28, 8, -38); g.stroke(); g.restore();
}

/* ── Sonido sintetizado ── */
function crearSonido(api) {
  let ctx = null;
  const ini = () => { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } };
  const blip = (f, dur, vol, tipo, f2, ret) => {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  };
  return {
    ini: ini, cerrar: () => { try { if (ctx) ctx.close(); } catch (e) { /* opcional */ } },
    toque: (n) => { blip(190 + Math.min(n, 40) * 3, 0.1, 0.16, "sine", 80); blip(900, 0.03, 0.04, "square", 300); },
    hito: () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.12, 0.06, "triangle", 0, i * 0.07)); },
    pared: () => blip(300, 0.05, 0.04, "triangle", 200),
    suelo: () => { blip(120, 0.28, 0.2, "sine", 50); blip(220, 0.12, 0.06, "sawtooth", 90); },
    nuevo: () => { [660, 880, 1320].forEach((f, i) => blip(f, 0.16, 0.07, "square", 0, i * 0.1)); },
  };
}

const PLANTILLA = `
<canvas class="to-cv" data-cvf></canvas>
<canvas class="to-cv3" data-cv3></canvas>
<canvas class="to-cv2" data-cv></canvas>
<div class="to-cab">
  <button type="button" class="to-btn" data-to="salir" aria-label="Salir">✕</button>
  <div class="to-marc" data-marc hidden><b data-toques data-no-t>0</b><small>toques</small><span data-mult data-no-t></span></div>
  <button type="button" class="to-btn to-btn--v" data-to="vestuario" aria-label="Vestuario" hidden>👕</button>
</div>
<div class="to-pts" data-pts hidden data-no-t></div>
<div class="to-menu" data-menu>
  <div class="to-caja">
    <p class="to-kicker">Videojuego</p>
    <h2 class="to-titulo">TOQUES</h2>
    <p class="to-sub">Mueve al jugador y mantén el balón en el aire. Cada toque suma puntos y, con ellos, desbloqueas equipaciones, balones y fondos.</p>
    <ul class="to-como">
      <li><b>1</b><span>Arrastra el dedo (o el ratón): el jugador se mueve y su pie va hacia ti.</span></li>
      <li><b>2</b><span>Colócalo bajo el balón para darle un toque. Más toques seguidos, más multiplicador.</span></li>
      <li><b>3</b><span>Si el balón toca el suelo, se acaba.</span></li>
    </ul>
    <p class="to-stats" data-stats data-no-t></p>
    <button type="button" class="to-jugar" data-to="jugar">¡Jugar!</button>
    <button type="button" class="to-sec" data-to="vestuario">Vestuario</button>
    <button type="button" class="to-sec" data-to="salir">Salir</button>
    <p class="to-cred" data-cred data-no-t></p>
  </div>
</div>
<div class="to-fin" data-fin hidden>
  <div class="to-caja to-caja--s">
    <h3>Balón al suelo</h3>
    <p class="to-gran" data-fin-n data-no-t></p>
    <p class="to-res" data-fin-p data-no-t></p>
    <p class="to-res" data-fin-r data-no-t></p>
    <p class="to-tikis" data-fin-tiki hidden>⚡ +1 tikitexto</p>
    <div class="to-nuevos" data-nuevos></div>
    <button type="button" class="to-jugar" data-to="jugar">Jugar otra vez</button>
    <button type="button" class="to-sec" data-to="vestuario">Vestuario</button>
    <button type="button" class="to-sec" data-to="salir">Salir</button>
  </div>
</div>
<div class="to-vest" data-vest hidden>
  <div class="to-caja to-caja--v">
    <h3>Vestuario</h3>
    <p class="to-res" data-vest-pts data-no-t></p>
    <div class="to-tabs"><button type="button" data-tab="k" class="on">Equipación</button><button type="button" data-tab="b">Balón</button><button type="button" data-tab="f">Fondo</button></div>
    <div class="to-grid" data-grid></div>
    <button type="button" class="to-jugar" data-to="cerrarvest">Listo</button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s), cv = $("[data-cv]"), g = cv.getContext("2d"), cvf = $("[data-cvf]"), gf = cvf.getContext("2d"), cv3 = $("[data-cv3]");
  const datos = () => {
    const d = api.datos(); ["mejor", "pts", "tot", "part", "tiki"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; });
    if (!d.sel) d.sel = { k: "azul", b: "clasico", f: "callejon" };
    return d;
  };
  const son = crearSonido(api);
  const S = { fase: "menu", ball: { x: CADX, y: 200, vx: 0, vy: 0, ang: 0, w: 0 }, foot: { x: CADX + 60, y: CADY + 110, vx: 0, vy: 0 }, obj: { x: CADX + 60, y: CADY + 110 }, hx: CADX, hvx: 0, lado: 1, gx: [CADX - 24, CADX + 24], w: [0, 1], lift: [0, 0], toques: 0, pts: 0, mult: 1, cool: 0, t: 0, g: G0, viento: 0, tikis: 0, flot: [], polvo: [], sacudida: 0, enSuelo: 0 };
  let vivo = true, raf = 0, ultimo = 0, cw = 0, ch = 0, dpr = 1, esc = 1, ox = 0, oy = 0, bgCache = null, bgId = "", fotos = {}, lista = {}, puntero = false, esTactil = false;

  /* fotos libres opcionales */
  fetch("img/toques/lista.json").then((r) => (r.ok ? r.json() : {})).then((j) => { lista = j || {}; if (bgId) { bgCache = null; } pintaCred(); }).catch(() => { /* sin fotos */ });
  function foto(id) {
    if (!lista[id]) return null; if (fotos[id]) return fotos[id].ok ? fotos[id].img : null;
    const img = new Image(); fotos[id] = { img: img, ok: false }; img.onload = () => { fotos[id].ok = true; if (bgId === id) bgCache = null; renderVest(); }; img.src = "img/toques/" + id + ".jpg"; return null;
  }
  function pintaCred() { const f = datos().sel.f, c = lista[f]; $("[data-cred]").textContent = c && fotos[f] && fotos[f].ok ? "📷 " + (c.autor || "") + (c.licencia ? " · " + c.licencia : "") : ""; }

  /* ── Tamaño y fondo ── */
  function tamano() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); cw = raiz.clientWidth || innerWidth; ch = raiz.clientHeight || innerHeight; [cv, cvf].forEach((c) => { c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); c.style.width = cw + "px"; c.style.height = ch + "px"; });
    esc = Math.min(cw / W, ch / H); ox = (cw - W * esc) / 2; oy = (ch - H * esc) / 2; bgCache = null; ajusta3D();
  }
  function fondoActual() { const id = datos().sel.f; return ID_FONDO[id] || FONDOS[0]; }
  function construyeFondo() {
    const f = fondoActual(), c = document.createElement("canvas"); c.width = Math.round(cw * dpr); c.height = Math.round(ch * dpr); const x = c.getContext("2d"); x.scale(dpr, dpr);
    const gy = oy + SUELO * esc + 10, img = foto(f.id);
    if (img) {
      const k = Math.max(cw / img.width, ch / img.height), w = img.width * k, h = img.height * k; x.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      const s = x.createLinearGradient(0, gy, 0, ch); s.addColorStop(0, "rgba(0,0,0,.05)"); s.addColorStop(1, "rgba(0,0,0,.45)"); x.fillStyle = s; x.fillRect(0, 0, cw, ch);
      x.fillStyle = "rgba(0,0,0,.18)"; x.fillRect(0, 0, cw, ch);
    } else f.pinta(x, cw, ch, gy);
    bgId = f.id; bgCache = c; pintaCred();
  }


  /* ── Jugador 3D (mismo cuerpo que el resto de juegos), dibujado en un lienzo transparente entre el fondo y el balón ── */
  let R3 = null, fig = null, jug = null, resto = null, kitFig = "", listo = false;
  function ajusta3D() {
    if (!R3) return;
    R3.r.setPixelRatio(dpr); R3.r.setSize(cw, ch, false); cv3.style.width = cw + "px"; cv3.style.height = ch + "px";
    const c = R3.cam; c.left = -ox / esc; c.right = (cw - ox) / esc; c.top = oy / esc; c.bottom = -(ch - oy) / esc; c.updateProjectionMatrix();
  }
  function inicia3D() {
    try {
      const r = new THREE.WebGLRenderer({ canvas: cv3, alpha: true, antialias: true, powerPreference: "high-performance" });
      r.setClearColor(0x000000, 0); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
      const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-200, 200, 320, -320, 1, 2000); cam.position.set(0, 0, 900);
      scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x445066, 1.05));
      const sol = new THREE.DirectionalLight(0xfff2dc, 2.3); sol.position.set(160, 420, 700); scene.add(sol);
      const luz2 = new THREE.DirectionalLight(0x9db8ff, 0.6); luz2.position.set(-300, 120, 500); scene.add(luz2);
      jug = new THREE.Group(); jug.scale.setScalar(PX); scene.add(jug);
      R3 = { r: r, scene: scene, cam: cam }; ajusta3D();
    } catch (e) { R3 = null; }
  }
  function pantalonDe(k) { return (k.c2 === "#f2f4f8" || k.c2 === "#f4f4f4" || k.c2 === "#f4f6fa") ? ((k.dib === "rayas" && k.c1 === "#ffffff") ? "#ffffff" : "#1b2a4a") : k.c2; }
  function montaFigura(kit) {
    if (!R3) return;
    if (fig) { jug.remove(fig.raiz); fig.malla.material.dispose(); fig = null; }
    fig = crearFigura({ cuerpo: "jugador", camisa: hexN(kit.c1), camisa2: hexN(kit.c2), patron: kit.dib === "liso" ? undefined : kit.dib, pantalon: hexN(pantalonDe(kit)), media: hexN(kit.c1), media2: hexN(kit.c2), bota: 0x14161c, piel: 0xe8b78d, pelo: 0x2a1b12, manga: true });
    jug.add(fig.raiz); kitFig = kit.id;
    /* medidas de reposo de las piernas (en píxeles del mundo) */
    POSES.base(fig); jug.position.set(0, 0, 0); jug.updateMatrixWorld(true);
    const wp = (b) => b.getWorldPosition(new THREE.Vector3());
    resto = [fig.pI, fig.pD].map((q) => { const Hh = wp(q.h), K = wp(q.k), F = wp(q.f); return { LT: Hh.distanceTo(K), LS: K.distanceTo(F), d1: K.clone().sub(Hh).normalize(), d2: F.clone().sub(K).normalize(), hy: Hh.y, hx: Hh.x }; });
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  /* cinemática inversa de dos huesos con la rodilla hacia delante (hacia la cámara) */
  function pierna(q, r, Hh, T, polo, plano, giroPie) {
    let d = Hh.distanceTo(T); const a = r.LT, b = r.LS, u = T.clone().sub(Hh); const maxd = a + b - 0.6;
    if (d > maxd) { u.multiplyScalar(maxd / d); d = maxd; } if (d < 4) { u.set(0, -1, 0); d = 4; } u.normalize();
    const T2 = Hh.clone().addScaledVector(u, d), al = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - al * al));
    const pd = polo.clone().addScaledVector(u, -polo.dot(u)); if (pd.lengthSq() < 1e-6) pd.set(0, 0, 1); pd.normalize();
    const K = Hh.clone().addScaledVector(u, al).addScaledVector(pd, h), d1 = K.clone().sub(Hh).normalize(), d2 = T2.clone().sub(K).normalize();
    const q1 = new THREE.Quaternion().setFromUnitVectors(r.d1, d1), d2l = d2.clone().applyQuaternion(q1.clone().invert()), q2 = new THREE.Quaternion().setFromUnitVectors(r.d2, d2l);
    q.h.quaternion.copy(q1); q.k.quaternion.copy(q2);
    const q12 = q1.clone().multiply(q2), pie = q12.clone().invert(); if (giroPie) pie.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(giroPie, 0, 0))); q.f.quaternion.copy(pie);
  }
  function poseJugador(dt) {
    const f = fig; if (!f || !resto) return; const t = S.t;
    POSES.base(f);
    const mov = clamp(S.hvx / 700, -1, 1), kick = S.lado, idx = kick > 0 ? 1 : 0;
    const hipH = SUELO - CADY - 2 - Math.abs(Math.sin(t * 9)) * Math.min(4, Math.abs(S.hvx) * 0.01);
    f.cadera.position.y = 0.95 + (hipH - resto[0].hy) / (0.97 * PX);
    jug.position.set(S.hx, -SUELO, 0);
    f.torso.rotation.z = -mov * 0.2 - kick * 0.04; f.torso.rotation.x = 0.04; f.cadera.rotation.z = mov * 0.04;
    /* brazos para equilibrar: el contrario a la pierna que golpea se abre más */
    const abre = 0.5 + Math.abs(mov) * 0.35, cerca = 0.22 + Math.sin(t * 3) * 0.02;
    f.brI.s.rotation.z = -(kick > 0 ? abre : cerca); f.brD.s.rotation.z = kick > 0 ? cerca : abre; f.brI.e.rotation.x = -0.35; f.brD.e.rotation.x = -0.35;
    f.brI.s.rotation.x = -0.1 - Math.max(0, mov) * 0.1; f.brD.s.rotation.x = -0.1 + Math.min(0, mov) * 0.1;
    const mx = clamp((S.ball.x - S.hx) / 150, -1, 1), up = clamp((CADY - 120 - S.ball.y) / 320, -0.4, 1);
    f.cabeza.rotation.y = mx * 0.45; f.cabeza.rotation.x = -up * 0.42; f.torso.rotation.y = mx * 0.12;
    jug.updateMatrixWorld(true);
    const wp = (b) => b.getWorldPosition(new THREE.Vector3());
    [f.pI, f.pD].forEach((q, i) => {
      const Hh = wp(q.h), w = S.w[i], gnd = V(S.gx[i], -(SUELO - 23 - S.lift[i]), 0);
      const alto = clamp((CADY - S.foot.y) / 150 + 0.25, 0, 1), foot = V(S.foot.x, -(S.foot.y - ANK), 6 + alto * 46);
      const T = gnd.clone().lerp(foot, w);
      pierna(q, resto[i], Hh, T, V((i ? 1 : -1) * 0.18, 0, 1), true, w > 0.5 ? 0.5 : 0);
      if (w < 0.5) { q.f.quaternion.copy(new THREE.Quaternion()); const q12 = q.h.quaternion.clone().multiply(q.k.quaternion); q.f.quaternion.copy(q12.invert()); }
    });
    R3.r.render(R3.scene, R3.cam);
  }

  /* ── Juego ── */
  function reiniciaBalon() { Object.assign(S.ball, { x: CADX + rnd(-40, 40), y: 150, vx: rnd(-30, 30), vy: 0, ang: 0, w: 0 }); }
  function empezar() {
    son.ini(); const d = datos(); d.part++; Object.assign(S, { fase: "juego", toques: 0, pts: 0, mult: 1, cool: 0, t: 0, g: G0, viento: 0, tikis: 0, flot: [], polvo: [], sacudida: 0, enSuelo: 0 });
    reiniciaBalon(); $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; $("[data-vest]").hidden = true; $("[data-marc]").hidden = false; $("[data-pts]").hidden = false; raiz.querySelector(".to-btn--v").hidden = true;
    pintaMarcador();
  }
  function pintaMarcador() { $("[data-toques]").textContent = String(S.toques); $("[data-mult]").textContent = S.mult > 1 ? "×" + S.mult : ""; $("[data-pts]").textContent = S.pts + " pts"; }
  function toque(rel) {
    S.toques++; S.mult = Math.min(6, 1 + Math.floor(S.toques / 10)); const ganados = 10 * S.mult; S.pts += ganados;
    S.g = lerp(G0, G1, clamp(S.toques / 80, 0, 1)); S.viento = S.toques > 30 ? Math.sin(S.toques * 1.7) * Math.min(110, (S.toques - 30) * 2.5) : 0;
    S.flot.push({ x: S.ball.x, y: S.ball.y - 30, v: 1, txt: "+" + ganados }); for (let i = 0; i < 6; i++) S.polvo.push({ x: S.foot.x, y: S.foot.y + 14, vx: rnd(-90, 90), vy: rnd(-120, -10), v: 0.4 });
    son.toque(S.toques); if (S.toques % 10 === 0) { son.hito(); S.sacudida = 0.18; }
    UMBRALES_TIKI.forEach((u) => { if (S.toques === u) { S.tikis++; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } S.flot.push({ x: CADX, y: 120, v: 1.6, txt: t("⚡ +1 tikitexto") }); } });
    pintaMarcador();
  }
  function colision() {
    const b = S.ball, f = S.foot, dx = b.x - f.x, dy = b.y - f.y, d = Math.hypot(dx, dy), R = RB + RP; if (d >= R || d < 0.001) return;
    const nx = dx / d, ny = dy / d; b.x = f.x + nx * (R + 0.5); b.y = f.y + ny * (R + 0.5);
    const rvx = b.vx - f.vx, rvy = b.vy - f.vy, vn = rvx * nx + rvy * ny;
    if (vn < 0) { b.vx -= 1.75 * vn * nx; b.vy -= 1.75 * vn * ny; }
    if (S.cool > 0) return;
    if (ny < 0.4 || b.vy < -200) {
      /* toque válido: asegura un impulso hacia arriba controlado */
      const apex = 150; const vmax = Math.sqrt(2 * S.g * Math.max(60, b.y - 70)), vmin = Math.sqrt(2 * S.g * Math.min(330, Math.max(120, b.y - apex)));
      b.vy = -clamp(Math.abs(b.vy), Math.min(vmin, vmax), vmax); b.vx = clamp(b.vx * 0.4 + f.vx * 0.1 + (S.hx - b.x) * 0.9 + rnd(-14, 14) * (1 + S.toques / 60), -300, 300); b.w = b.vx * 0.04; S.cool = CD_TOQUE; toque();
    } else { b.vy = Math.max(b.vy, 80); }
  }
  function finPartida() {
    S.fase = "fin"; son.suelo(); S.sacudida = 0.3; const d = datos(), antes = nuevosDe(d.pts), nuevo = S.toques > d.mejor;
    d.pts += S.pts; d.tot += S.toques; d.tiki += S.tikis; if (nuevo) d.mejor = S.toques; try { api.guardar(); } catch (e) { /* opcional */ }
    const desp = nuevosDe(d.pts); const ganados = desp.filter((x) => antes.indexOf(x) < 0);
    $("[data-marc]").hidden = true; $("[data-pts]").hidden = true; raiz.querySelector(".to-btn--v").hidden = false;
    $("[data-fin-n]").textContent = S.toques + " " + t("toques"); $("[data-fin-p]").textContent = t(S.pts + " puntos"); $("[data-fin-r]").textContent = nuevo ? t("¡Nuevo récord!") : "🏆 " + d.mejor;
    $("[data-fin-tiki]").hidden = !S.tikis; const nu = $("[data-nuevos]"); nu.innerHTML = ""; ganados.forEach((n) => { const e = document.createElement("p"); e.textContent = "🔓 " + t("¡Desbloqueado: " + t(n) + "!"); e.setAttribute("data-no-t", ""); nu.appendChild(e); });
    if (ganados.length) setTimeout(() => { if (vivo) son.nuevo(); }, 350);
    setTimeout(() => { if (vivo && S.fase === "fin") { $("[data-fin]").hidden = false; } }, 650); pintaStats();
  }
  function nuevosDe(p) { const o = []; EQUIPACIONES.concat(BALONES, FONDOS).forEach((x) => { if (x.p <= p) o.push(x.n); }); return o; }
  function fisica(dt) {
    const b = S.ball, f = S.foot;
    /* el cuerpo sigue al dedo (con un pequeño retraso) y el pie sale hacia él desde la cadera de la pierna que golpea */
    const hx0 = S.hx; S.hx = lerp(S.hx, clamp(S.obj.x, HX_MIN, HX_MAX), 1 - Math.pow(0.0012, dt)); S.hvx = lerp(S.hvx, (S.hx - hx0) / dt, 0.4);
    if (S.obj.x - S.hx > 14) S.lado = 1; else if (S.obj.x - S.hx < -14) S.lado = -1;
    const nx = lerp(f.x, S.obj.x, 1 - Math.pow(0.0006, dt)), ny = lerp(f.y, S.obj.y, 1 - Math.pow(0.0006, dt));
    const cx = S.hx + S.lado * 14, dx = nx - cx, dy = ny - CADY, d = Math.hypot(dx, dy), kx = d > REACH ? REACH / d : 1;
    const fx = cx + dx * kx, fy = Math.min(SUELO - 12, CADY + dy * kx);
    f.vx = lerp(f.vx, (fx - f.x) / dt, 0.6); f.vy = lerp(f.vy, (fy - f.y) / dt, 0.6); f.vx = clamp(f.vx, -1400, 1400); f.vy = clamp(f.vy, -1400, 1400); f.x = fx; f.y = fy;
    /* pierna de apoyo: da pasitos para seguir al cuerpo; cada pie pasa suavemente de «apoyo» a «golpeo» */
    [0, 1].forEach((i) => {
      const meta = S.hx + (i ? 1 : -1) * 22, antes = S.gx[i]; S.gx[i] = lerp(antes, meta, 1 - Math.pow(0.002, dt));
      const v = Math.abs(S.gx[i] - antes) / dt; S.lift[i] = lerp(S.lift[i], clamp(v * 0.035, 0, 20), 0.35);
      const objetivo = (i ? 1 : -1) === S.lado ? 1 : 0; S.w[i] = lerp(S.w[i], objetivo, 1 - Math.pow(0.0004, dt));
    });
    if (S.fase === "menu") { b.x = f.x; b.y = f.y - RB - RP - 2 + Math.sin(S.t * 3) * 3; b.vx = b.vy = 0; b.ang += dt; return; }
    if (S.fase === "fin") { b.vy += 1200 * dt; b.y += b.vy * dt; if (b.y > SUELO - RB) { b.y = SUELO - RB; b.vy *= -0.45; b.vx *= 0.7; if (Math.abs(b.vy) < 40) b.vy = 0; } b.x += b.vx * dt; b.ang += b.w * dt; return; }
    const sub = 4, h = dt / sub;
    for (let i = 0; i < sub; i++) {
      b.vy += S.g * h; b.vx += S.viento * h; b.x += b.vx * h; b.y += b.vy * h; b.ang += b.w * h;
      if (b.x < PARED + RB) { b.x = PARED + RB; b.vx = Math.abs(b.vx) * 0.8; son.pared(); } else if (b.x > W - PARED - RB) { b.x = W - PARED - RB; b.vx = -Math.abs(b.vx) * 0.8; son.pared(); }
      if (b.y < RB) { b.y = RB; b.vy = Math.abs(b.vy) * 0.5; }
      colision();
      if (b.y >= SUELO - RB) { b.y = SUELO - RB; finPartida(); return; }
    }
  }

  /* ── Dibujo ── */
  function paredes(x, w, h) {
    /* fuera de la pared: oscuro; paredes y techo en neón para ver bien dónde acaba el campo */
    x.fillStyle = "rgba(3,8,22,.58)"; x.fillRect(-3000, -3000, 3000 + PARED, 6000); x.fillRect(W - PARED, -3000, 3000 + PARED, 6000); x.fillRect(PARED, -3000, W - 2 * PARED, 3000);
    const lin = (x1, y1, x2, y2) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
    x.save(); x.lineCap = "round"; x.shadowColor = "#19e6ff"; x.shadowBlur = 16; x.strokeStyle = "#19e6ff"; x.lineWidth = 3.5;
    lin(PARED, -3000, PARED, SUELO + 6); lin(W - PARED, -3000, W - PARED, SUELO + 6); lin(PARED, 0, W - PARED, 0);
    x.shadowBlur = 0; x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 1.2; lin(PARED, -3000, PARED, SUELO + 6); lin(W - PARED, -3000, W - PARED, SUELO + 6); lin(PARED, 0, W - PARED, 0);
    /* marcas de altura en las paredes */
    x.strokeStyle = "rgba(25,230,255,.45)"; x.lineWidth = 2; for (let yy = 90; yy < SUELO; yy += 90) { lin(PARED, yy, PARED + 9, yy); lin(W - PARED, yy, W - PARED - 9, yy); }
    x.restore();
  }
  function dibuja(dt) {
    if (!bgCache) construyeFondo();
    const d = datos(), kit = EQUIPACIONES.filter((e) => e.id === d.sel.k)[0] || EQUIPACIONES[0], bal = BALONES.filter((e) => e.id === d.sel.b)[0] || BALONES[0];
    const sk = S.sacudida > 0 ? (Math.random() - 0.5) * 8 * S.sacudida * 4 : 0, sy = S.sacudida > 0 ? (Math.random() - 0.5) * 6 * S.sacudida * 4 : 0;
    /* capa de fondo: escena, paredes y sombras */
    gf.setTransform(1, 0, 0, 1, 0, 0); gf.drawImage(bgCache, 0, 0, cvf.width, cvf.height); gf.setTransform(dpr, 0, 0, dpr, 0, 0);
    gf.save(); gf.translate(ox + sk, oy + sy); gf.scale(esc, esc);
    paredes(gf);
    const alt = clamp((SUELO - S.ball.y) / 420, 0, 1); gf.fillStyle = "rgba(0,0,0," + (0.32 - alt * 0.2).toFixed(2) + ")"; gf.beginPath(); gf.ellipse(S.ball.x, SUELO + 4, RB * (1.1 - alt * 0.5), 6 * (1.1 - alt * 0.4), 0, 0, 7); gf.fill();
    gf.fillStyle = "rgba(0,0,0,.3)"; gf.beginPath(); gf.ellipse(S.hx, SUELO + 4, 66, 11, 0, 0, 7); gf.fill();
    if (!R3 || !fig) { gf.save(); gf.translate(S.hx - CADX, 0); pintaJugador(gf, S, kit, S.t); gf.restore(); }
    gf.restore();
    /* capa 3D: el jugador */
    if (R3) { if (listo && (!fig || kitFig !== kit.id)) montaFigura(kit); if (fig) poseJugador(dt); else R3.r.clear(); }
    /* capa superior: balón, polvo y textos */
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.save(); g.translate(ox + sk, oy + sy); g.scale(esc, esc);
    pintaBalon(g, S.ball.x, S.ball.y, RB, bal, S.ball.ang);
    S.polvo.forEach((p) => { g.fillStyle = "rgba(255,255,255," + (p.v * 1.4).toFixed(2) + ")"; g.beginPath(); g.arc(p.x, p.y, 3 + p.v * 4, 0, 7); g.fill(); });
    g.textAlign = "center"; g.font = "900 22px system-ui,Arial"; S.flot.forEach((p) => { g.globalAlpha = clamp(p.v, 0, 1); g.fillStyle = "#ffd23a"; g.strokeStyle = "rgba(0,0,0,.6)"; g.lineWidth = 4; g.strokeText(p.txt, p.x, p.y); g.fillText(p.txt, p.x, p.y); }); g.globalAlpha = 1;
    g.restore();
    S.polvo.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.v -= dt * 1.8; }); S.polvo = S.polvo.filter((p) => p.v > 0);
    S.flot.forEach((p) => { p.y -= 50 * dt; p.v -= dt * 1.1; }); S.flot = S.flot.filter((p) => p.v > 0);
    if (S.sacudida > 0) S.sacudida = Math.max(0, S.sacudida - dt);
  }
  function bucle(ts) {
    if (!vivo) return; raf = requestAnimationFrame(bucle); const dt = clamp((ts - (ultimo || ts)) / 1000, 0.001, 0.05); ultimo = ts; S.t += dt; if (S.cool > 0) S.cool -= dt;
    if (!$("[data-vest]").hidden && S.fase !== "juego") { /* el fondo sigue vivo detrás */ }
    fisica(dt); dibuja(dt);
  }

  /* ── Entrada: el pie sigue al dedo / ratón ── */
  function aArena(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left - ox) / esc, y: (e.clientY - r.top - oy) / esc }; }
  function mueve(e) { const p = aArena(e), off = e.pointerType === "touch" || e.pointerType === "pen" ? -46 : 0; S.obj.x = clamp(p.x, PARED, W - PARED); S.obj.y = clamp(p.y + off, CADY - 30, SUELO - 12); }
  cv.addEventListener("pointerdown", (e) => { son.ini(); puntero = true; esTactil = e.pointerType === "touch"; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* opcional */ } mueve(e); });
  cv.addEventListener("pointermove", (e) => { if (puntero || e.pointerType === "mouse") mueve(e); });
  ["pointerup", "pointercancel"].forEach((n) => cv.addEventListener(n, () => { puntero = false; }));

  /* ── Menús y vestuario ── */
  function pintaStats() { const d = datos(); $("[data-stats]").textContent = d.mejor ? "🏆 " + d.mejor + " · ⭐ " + d.pts + " · " + d.part + " ⚽" : ""; $("[data-vest-pts]").textContent = "⭐ " + d.pts; }
  let tab = "k";
  function renderVest() {
    const d = datos(), gr = $("[data-grid]"); if (!gr) return; gr.innerHTML = ""; $("[data-vest-pts]").textContent = "⭐ " + d.pts;
    const lista2 = tab === "k" ? EQUIPACIONES : tab === "b" ? BALONES : FONDOS;
    lista2.forEach((it) => {
      const ok = d.pts >= it.p, on = d.sel[tab] === it.id, b = document.createElement("button"); b.type = "button"; b.className = "to-it" + (on ? " on" : "") + (ok ? "" : " lock"); b.dataset.id = it.id;
      const c = document.createElement("canvas"); c.width = 140; c.height = tab === "f" ? 92 : 100; c.className = "to-mini"; b.appendChild(c); const m = c.getContext("2d");
      if (tab === "k") miniEquipacion(m, c.width, c.height, it); else if (tab === "b") { m.clearRect(0, 0, 140, 100); pintaBalon(m, 70, 50, 34, it, 0.4); }
      else { const im = foto(it.id); if (im) { const k = Math.max(c.width / im.width, c.height / im.height); m.drawImage(im, (c.width - im.width * k) / 2, (c.height - im.height * k) / 2, im.width * k, im.height * k); } else { m.save(); m.scale(c.width / 360, c.width / 360); it.pinta(m, 360, c.height * 360 / c.width, c.height * 360 / c.width * 0.72); m.restore(); } }
      const n = document.createElement("span"); n.textContent = t(it.n); b.appendChild(n); const e = document.createElement("small"); e.textContent = ok ? (on ? t("Equipado") : t("Elegir")) : "🔒 " + t(it.p + " puntos"); e.setAttribute("data-no-t", ""); b.appendChild(e);
      if (!ok) { const pr = document.createElement("i"); pr.style.setProperty("--k", clamp(d.pts / it.p, 0, 1).toFixed(3)); b.appendChild(pr); }
      gr.appendChild(b);
    });
    raiz.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x.dataset.tab === tab));
  }
  function abreVest() { $("[data-vest]").hidden = false; renderVest(); }
  raiz.addEventListener("click", (e) => {
    son.ini(); const it = e.target.closest ? e.target.closest(".to-it") : null;
    if (it) { const d = datos(), lista2 = tab === "k" ? EQUIPACIONES : tab === "b" ? BALONES : FONDOS, x = lista2.filter((q) => q.id === it.dataset.id)[0]; if (x && d.pts >= x.p) { d.sel[tab] = x.id; try { api.guardar(); } catch (er) { /* opcional */ } if (tab === "f") bgCache = null; renderVest(); } return; }
    const tb = e.target.closest ? e.target.closest("[data-tab]") : null; if (tb) { tab = tb.dataset.tab; renderVest(); return; }
    const b = e.target.closest ? e.target.closest("[data-to]") : null; if (!b) return; const k = b.dataset.to;
    if (k === "salir") cerrar(); else if (k === "jugar") empezar(); else if (k === "vestuario") abreVest(); else if (k === "cerrarvest") { $("[data-vest]").hidden = true; }
  });
  const onKey = (e) => { if (e.key === "Escape") { if (!$("[data-vest]").hidden) $("[data-vest]").hidden = true; else cerrar(); return; } if ((e.key === "Enter" || e.key === " ") && (S.fase === "menu" || S.fase === "fin") && $("[data-vest]").hidden && !(e.target && e.target.tagName === "BUTTON")) { e.preventDefault(); empezar(); } };
  window.addEventListener("keydown", onKey);
  const onRes = () => tamano(); window.addEventListener("resize", onRes);
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf); window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onRes); son.cerrar(); try { if (R3) { R3.r.dispose(); R3.r.forceContextLoss(); } } catch (e) { /* nada */ } raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  inicia3D(); tamano(); pintaStats(); raf = requestAnimationFrame(bucle);
  precargar().then(() => { listo = true; }).catch(() => { R3 = null; });
  /* Solo para las pruebas automáticas */
  return { cerrar: cerrar, S: S, empezar: empezar, fisica: fisica, colision: colision, datos: datos, FONDOS: FONDOS, EQUIPACIONES: EQUIPACIONES, BALONES: BALONES, constantes: { REACH: REACH, W: W, H: H, SUELO: SUELO, CADX: CADX, CADY: CADY, RB: RB, RP: RP, L: L } };
}
