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
/* Escenarios: cada TRAMO metros cambia el fondo (cielo, luz, césped, gradas, clima). Después del último se repite el ciclo. */
const TRAMO = 600;
const ESC = [
  { nombre: "Estadio de día", cielo: 0x8fcbff, niebla: 0xbfe1ff, hemi: 1.05, sol: 2.7, solC: 0xfff1d6, exp: 1.05, cesped: 0xffffff, grada: 0xffffff, valla: 0xffffff, nieve: 0, clima: "", noche: 0, fn: 38, ff: 125 },
  { nombre: "Atardecer", cielo: 0xff9a6b, niebla: 0xf3b48a, hemi: 0.85, sol: 2.0, solC: 0xffb36b, exp: 1.08, cesped: 0xffe2c4, grada: 0xffd2b0, valla: 0xffe6cf, nieve: 0, clima: "", noche: 0.3, fn: 38, ff: 125 },
  { nombre: "Noche de focos", cielo: 0x0a1430, niebla: 0x101c3c, hemi: 0.55, sol: 0.9, solC: 0x9db8ff, exp: 1.18, cesped: 0xa9bde8, grada: 0xaab8e0, valla: 0xffffff, nieve: 0, clima: "", noche: 1, fn: 38, ff: 125 },
  { nombre: "Tormenta", cielo: 0x55667a, niebla: 0x66798c, hemi: 0.7, sol: 0.9, solC: 0xbcd0e6, exp: 1.1, cesped: 0x9ab89a, grada: 0x8fa0b8, valla: 0xc8d4e4, nieve: 0, clima: "lluvia", noche: 0.5, fn: 30, ff: 95 },
  { nombre: "Nevada", cielo: 0xcfd9e6, niebla: 0xdfe6f0, hemi: 1.0, sol: 1.5, solC: 0xf2f6ff, exp: 1.0, cesped: 0xd8e8ff, grada: 0xdfe6ff, valla: 0xeef3ff, nieve: 0.85, clima: "nieve", noche: 0.15, fn: 30, ff: 105 },
  { nombre: "¡Final de Copa!", cielo: 0x3a1d6e, niebla: 0x4b2a86, hemi: 0.8, sol: 1.6, solC: 0xffd27a, exp: 1.12, cesped: 0xd8ffd0, grada: 0xe8c8ff, valla: 0xffe9a8, nieve: 0, clima: "confeti", noche: 0.9, fn: 38, ff: 125 },
];
/* velocidad según la distancia: crece siempre pero cada vez más despacio (máx. ≈33 m/s) */
const vBase = (d) => Math.min(33, 11 + 11 * (1 - Math.exp(-d / 800)) + 11 * (1 - Math.exp(-d / 4500)));
/* obstáculos que se mueven: se van desbloqueando por distancia */
const NUEVOS = [[450, "¡Balón gigante! Sáltalo", "rodante"], [700, "¡El árbitro te corta el paso! Cambia de carril", "arbitro"], [900, "¡Carrito de balones! Sáltalo", "carro"], [1050, "¡Balones botando! Cuidado con el bote", "botando"], [1150, "¡Recogepelotas a toda velocidad! Esquívalo", "recogepelotas"], [1250, "¡Tarjeta voladora! Deslízate debajo", "tarjeta"], [1450, "¡Mascota saltarina! Esquívala", "mascota"], [1650, "¡Portero en plancha! Busca su hueco", "portero"], [1750, "¡Extremo en zigzag! Esquívalo", "extremo"], [1950, "¡Cortacésped del campo! Sáltalo", "cortacesped"], [2100, "¡Pelotazo! Salta o esquiva", "pelotazo"], [2300, "¡La barrera! Busca el hueco", "barrera"], [2400, "¡Camilla! Salta por el medio", "camillero"], [2500, "¡Dron de TV! Deslízate debajo", "dron"]];
/* dificultad por tiempo de partida (tc, en segundos): desde ~1:05 los obstáculos móviles se aceleran, a los 2 min van mucho más rápido
   y a partir de 2:30-3:30 la pista se llena (modo infernal) (filas más juntas y dobles): casi imposible, pero siempre queda un carril libre */
const velMov = (tc) => 1 + clamp((tc - 65) / 55, 0, 1) * 0.7 + clamp((tc - 130) / 70, 0, 1) * 0.8;
const espaciado = (tc) => 1 - clamp((tc - 100) / 100, 0, 1) * 0.45;
/* dificultad 1-10 por tiempo de partida: el 10 es el modo infernal */
const NIV_SEG = 16.5, nivelDe = (tc) => Math.min(10, 1 + Math.floor(tc / NIV_SEG));
const NIV_NOM = ["Calentamiento", "Ritmo de liga", "Partido igualado", "Cuartos de final", "Semifinal", "La final", "Prórroga", "Tanda de penaltis", "Muerte súbita", "MODO INFERNAL"];
const NIV_COL = ["#41ff8a", "#7dff5a", "#c6ff3d", "#ffe94a", "#ffc02e", "#ff9a1f", "#ff7a1f", "#ff5a2a", "#ff3b3b", "#ff1f1f"];
/* obstáculos del modo infernal (nivel 10): aparecen por primera vez avisados */
const INFERNAL = [["¡Ultra con bengala! Esquívalo", "ultra"], ["¡Bengalas en el campo! Salta", "bengala"], ["¡Seguridad en la pista! Busca el hueco", "steward"]];
const PODERES = { pw_iman: { id: "iman", seg: 5, col: "#ff4d8d" }, pw_rayo: { id: "rayo", seg: 5, col: "#ffe94a" }, pw_escudo: { id: "escudo", seg: 5, col: "#5fd4ff" } };
const MAX_PODERES = 20;
const filasExtra = (tc) => (tc >= 210 ? 2 : tc >= 150 ? 1 : 0);
/* equipaciones del corredor: se compran con las monedas */
const KIT_J = [
  { id: "azul", n: "Azul clásico", c: 0x1d5fd6, c2: 0xffffff, p: 0xf2f4f8, m: 0x1d5fd6, precio: 0 },
  { id: "rojo", n: "Rojo pasión", c: 0xd7263d, c2: 0xffffff, p: 0xffffff, m: 0xd7263d, precio: 120 },
  { id: "verde", n: "Verde esmeralda", c: 0x0e9f55, c2: 0xffffff, p: 0xf2f4f8, m: 0x0e9f55, precio: 240 },
  { id: "naranja", n: "Naranja mandarina", c: 0xff7a00, c2: 0x1a1a1a, p: 0x1a1a1a, m: 0xff7a00, precio: 300 },
  { id: "rayas", n: "Rayas rojas y blancas", c: 0xd7263d, c2: 0xffffff, p: 0x1a1a1a, m: 0xffffff, pat: "rayas", precio: 360 },
  { id: "aros", n: "Aros verdes", c: 0x0e9f55, c2: 0xffffff, p: 0xffffff, m: 0x0e9f55, pat: "aros", precio: 420 },
  { id: "dorado", n: "Dorado de campeón", c: 0xf2b300, c2: 0x1a1a1a, p: 0x1a1a1a, m: 0xf2b300, precio: 450 },
  { id: "morado", n: "Morado real", c: 0x7b2cbf, c2: 0xf2f4f8, p: 0xf2f4f8, m: 0x7b2cbf, precio: 600 },
  { id: "negro", n: "Negro neón", c: 0x14141c, c2: 0x19e6ff, p: 0x14141c, m: 0x14141c, precio: 750 },
  { id: "plata", n: "Plata galáctica", c: 0xc9d3e0, c2: 0x3b2bd6, p: 0x3b2bd6, m: 0xc9d3e0, precio: 900 },
  { id: "rosa", n: "Rosa eléctrico", c: 0xff3dcb, c2: 0xffe94a, p: 0x7b2cbf, m: 0xff3dcb, precio: 1200 },
  { id: "fuego", n: "Fuego", c: 0xff3b00, c2: 0xffd23a, p: 0x1a1a1a, m: 0xff3b00, pat: "rayas", precio: 1500 }
];
const BOTAS = [
  { id: "b_negra", n: "Botas negras", c: 0x1b1d24, precio: 0 }, { id: "b_blanca", n: "Botas blancas", c: 0xf2f4f8, precio: 90 },
  { id: "b_roja", n: "Botas rojas", c: 0xe0245e, precio: 180 }, { id: "b_azul", n: "Botas azul eléctrico", c: 0x1f6bff, precio: 240 },
  { id: "b_verde", n: "Botas verde neón", c: 0x3dff6a, precio: 300 }, { id: "b_oro", n: "Botas de oro", c: 0xffc933, precio: 600 },
  { id: "b_rosa", n: "Botas rosa", c: 0xff5fd2, precio: 750 }
];
const PELOS = [
  { id: "p_cast", n: "Pelo castaño", c: 0x2b1b12, precio: 0 }, { id: "p_negro", n: "Pelo negro", c: 0x0d0d10, precio: 60 },
  { id: "p_rubio", n: "Pelo rubio", c: 0xe3c37a, precio: 150 }, { id: "p_rojo", n: "Pelo pelirrojo", c: 0xb8451f, precio: 240 },
  { id: "p_azul", n: "Pelo azul", c: 0x2a6bff, precio: 450 }, { id: "p_rosa", n: "Pelo rosa", c: 0xff6fc8, precio: 600 },
  { id: "p_plat", n: "Pelo platino", c: 0xf3f0e6, precio: 750 }
];
/* estelas: partículas que deja el corredor al correr (cols = colores de las partículas) */
const ESTELAS = [
  { id: "e_ninguna", n: "Sin estela", cols: null, c: [0x555555], precio: 0 }, { id: "e_oro", n: "Chispas doradas", cols: [0xffd23a], c: [0xffd23a, 0xfff2a8], precio: 450 },
  { id: "e_fuego", n: "Estela de fuego", cols: [0xff5a14, 0xffa01a], c: [0xff5a14, 0xffa01a], precio: 750 }, { id: "e_hielo", n: "Estela de hielo", cols: [0x9fe8ff, 0xffffff], c: [0x9fe8ff, 0x4fb8ff], precio: 750 },
  { id: "e_neon", n: "Estela neón", cols: [0x19e6ff, 0xff2fd6], c: [0x19e6ff, 0xff2fd6], precio: 1200 }, { id: "e_arco", n: "Estela arcoíris", cols: [0xff3b3b, 0xffd23a, 0x41ff8a, 0x2f9bff, 0xb04dff], c: [0xff3b3b, 0x41ff8a, 0x2f9bff], precio: 1800 }
];
const VEST = [["kit", "Equipaciones", KIT_J, "azul"], ["bota", "Botas", BOTAS, "b_negra"], ["pelo", "Pelo", PELOS, "p_cast"], ["estela", "Estelas", ESTELAS, "e_ninguna"]];


const PLANTILLA = `
<canvas class="sl-cv"></canvas><div class="sl-vineta"></div><div class="sl-flash" data-flash></div>
<div class="sl-cab">
  <button type="button" class="sl-btn" data-sl="salir" aria-label="Salir">✕</button>
  <div class="sl-marc"><b data-sl-pts data-no-t>0</b><small data-sl-m data-no-t>0 m</small></div>
  <div class="sl-der"><div class="sl-mon"><i></i><span data-sl-mon data-no-t>0</span></div><div class="sl-vidas" data-vidas></div></div>
</div>
<div class="sl-turbo" data-turbo hidden><i data-turbo-i></i></div>
<div class="sl-pw" data-pw></div>
<div class="sl-niv-i" data-niv-i data-no-t></div>
<div class="sl-niv" data-niv data-no-t></div>
<div class="sl-avob" data-avob data-no-t></div>
<div class="sl-aviso" data-aviso data-no-t></div>
<p class="sl-pista" data-pista></p>
<div class="sl-menu" data-menu>
  <div class="sl-caja">
    <p class="sl-kicker">Corredor de Tikitexto</p>
    <h2>TIKI RUSH</h2>
    <p class="sl-sub">Regatea por el campo: esquiva defensas, salta balones y porterías de entrenamiento y deslízate bajo las pancartas. Cuanto más corres, más rápido va.</p>
    <ul class="sl-ctl">
      <li><b>⬅️➡️</b><span>Cambia de carril</span></li>
      <li><b>⬆️</b><span>Salta</span></li>
      <li><b>⬇️</b><span>Deslízate</span></li>
      <li><b>⚡</b><span>Rayo, escudo e imán: poderes con aura de colores</span></li>
    </ul>
    <p class="sl-rec" data-rec data-no-t></p>
    <div class="sl-saldo"><span>🪙 <b data-saldo data-no-t>0</b></span><button type="button" class="sl-sec" data-sl="vest">👕 Vestuario</button></div>
    <button type="button" class="sl-jugar" data-sl="jugar">¡Correr!</button>
  </div>
</div>
<div class="sl-fin" data-fin hidden>
  <div class="sl-caja">
    <h2 data-fin-t>¡TARJETA ROJA!</h2>
    <p class="sl-fin-m" data-fin-m data-no-t></p>
    <p class="sl-fin-m" data-fin-r data-no-t></p>
    <p class="sl-fin-tiki" data-fin-tiki hidden data-no-t>⚡ +1 tikitexto</p>
    <div class="sl-fin-b"><button type="button" class="sl-jugar" data-sl="jugar">Correr otra vez</button><button type="button" class="sl-sec" data-sl="vest">👕 Vestuario</button><button type="button" class="sl-sec" data-sl="salir">Salir</button></div>
  </div>
</div>
<div class="sl-vest" data-vest hidden>
  <div class="sl-caja">
    <h3>Vestuario</h3>
    <p class="sl-sub">Gasta tus monedas en equipaciones, botas, pelo y estelas. Las monedas se guardan entre partidas.</p>
    <p class="sl-rec">🪙 <b data-saldo data-no-t>0</b></p>
    <div data-kits></div>
    <button type="button" class="sl-sec" data-sl="vestcerrar">Volver</button>
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
/* cara de la moneda: el logo de TIKITEXTO (icons/icon-512.png) dentro de un disco dorado; mientras carga se ve una «T» */
function texMoneda() {
  const c = lienzo(256, 256), x = c.getContext("2d");
  const pinta = (img) => {
    x.clearRect(0, 0, 256, 256);
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, "#fff3b0"); g.addColorStop(0.7, "#f5b800"); g.addColorStop(1, "#b87400");
    x.fillStyle = g; x.beginPath(); x.arc(128, 128, 128, 0, 6.3); x.fill();
    x.save(); x.beginPath(); x.arc(128, 128, 106, 0, 6.3); x.clip();
    if (img) x.drawImage(img, 44, 44, 168, 168);
    else { x.fillStyle = "#1fa971"; x.fillRect(0, 0, 256, 256); x.fillStyle = "#ffc400"; x.font = "900 150px Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("T", 128, 138); }
    x.restore();
    x.lineWidth = 12; x.strokeStyle = "#ffe27a"; x.beginPath(); x.arc(128, 128, 110, 0, 6.3); x.stroke();
  };
  pinta(null);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  try { const im = new Image(); im.onload = () => { pinta(im); t.needsUpdate = true; }; im.src = new URL("./icons/icon-512.png", import.meta.url).href; } catch (e) { /* se queda la «T» */ }
  return t;
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
  const datos = () => { const d = api.datos(); ["mejor", "mejorm", "part", "bal", "tiki", "gast", "cajas"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); if (!Array.isArray(d.tiene)) d.tiene = ["azul"]; VEST.forEach((v) => { if (typeof d[v[0]] !== "string") d[v[0]] = v[3]; if (d.tiene.indexOf(v[3]) < 0) d.tiene.push(v[3]); }); return d; };
  const au = crearAudio(api);

  /* ── mini sintetizador propio para los efectos cortos ── */
  let ctx = null;
  function audioIni() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, retraso) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (retraso || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonMoneda = () => { blip(1175, 0.1, 0.035, "sine"); blip(1568, 0.22, 0.04, "sine", 0, 0.065); blip(3136, 0.14, 0.008, "sine", 0, 0.065); };
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

  const S = { fase: "menu", t: 0, dist: 0, v: 0, x: 0, lane: 1, y: 0, vy: 0, desl: 0, vidas: VIDAS, inv: 0, turbo: 0, monedas: 0, pts: 0, obs: [], sig: 0, filas: 0, tiki: false, regalo: 0, cajaD: 0, cajaN: 0, cajaOk: false, bonus: 0, shake: 0, activo: true, choque: 0, hito: 0, tema: 0, ciclo: 0, cola: [], vidaHito: 0, nuevo: 0, iman: 0, escu: 0, nivel: 1, inf: 0, vistos: {}, poderes: 0, podSig: 0 };
  let raf = 0, ultimo = 0, vivo = true, escala = 1, fpsAcum = 0, fpsN = 0, hAviso = 0, hFlash = 0, hAvOb = 0, hNiv = 0, pwKey = null;
  let camara, scene, sol, hemi, luces = [], mundo = {}, jug = null, piscina = [], libres = { def: [], valla: [], cono: [], cartel: [], moneda: [], bota: [], rodante: [], botando: [], dron: [], carro: [], mascota: [], pelotazo: [], caja: [], arbitro: [], portero: [], barrera: [], tarjeta: [], cortacesped: [], recogepelotas: [], camillero: [], ultra: [], bengala: [], steward: [], pw_iman: [], pw_rayo: [], pw_escudo: [] }, estSis = {}, estelaAct = ESTELAS[0], clima = null, chispas, polvo, lineas = [];

  function construye() {
    const R = E.renderer, aniso = Math.min(R.capabilities.getMaxAnisotropy(), 8);
    R.setPixelRatio(Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 2));
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.outputColorSpace = THREE.SRGBColorSpace;
    scene = new THREE.Scene(); scene.background = new THREE.Color(ESC[0].cielo); scene.fog = new THREE.Fog(ESC[0].niebla, 38, 125);
    camara = new THREE.PerspectiveCamera(58, 16 / 9, 0.1, 300); scene.add(camara);
    hemi = new THREE.HemisphereLight(0xcfe3ff, 0x2a5a2a, 1.0); scene.add(hemi);
    sol = new THREE.DirectionalLight(0xfff1d6, 2.6); sol.position.set(8, 22, 12); sol.target.position.set(0, 0, -6); scene.add(sol, sol.target);
    sol.castShadow = true; sol.shadow.mapSize.set(movil ? 1024 : 2048, movil ? 1024 : 2048);
    Object.assign(sol.shadow.camera, { left: -13, right: 13, top: 22, bottom: -22, near: 1, far: 70 }); sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.03;

    /* suelo: césped con franjas + carriles */
    const tC = texCesped(aniso), tL = texCarril(aniso);
    mundo.matCesped = new THREE.MeshStandardMaterial({ map: tC, roughness: 0.95 });
    const cesped = new THREE.Mesh(new THREE.PlaneGeometry(144, 240), mundo.matCesped);
    cesped.rotation.x = -Math.PI / 2; cesped.position.set(0, 0, -95); cesped.receiveShadow = true; scene.add(cesped);
    mundo.nieve = new THREE.Mesh(new THREE.PlaneGeometry(144, 240), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0, depthWrite: false }));
    mundo.nieve.rotation.x = -Math.PI / 2; mundo.nieve.position.set(0, 0.006, -95); mundo.nieve.visible = false; scene.add(mundo.nieve);
    const carril = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 240), new THREE.MeshBasicMaterial({ map: tL, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }));
    carril.rotation.x = -Math.PI / 2; carril.position.set(0, 0.012, -95); scene.add(carril);
    mundo.tC = tC; mundo.tL = tL;

    /* gradas y vallas con scroll */
    const tG0 = texGrada(aniso), tV0 = texValla(aniso); mundo.scroll = [];
    [-1, 1].forEach(function (s) {
      const tG = tG0.clone(), tV = tV0.clone(); tG.needsUpdate = true; tV.needsUpdate = true;
      mundo.scroll.push({ t: tG, k: -s / 10.9 }, { t: tV, k: -s / 17.1 });
      const matG = new THREE.MeshBasicMaterial({ map: tG }); (mundo.matsG = mundo.matsG || []).push(matG);
      const piv = new THREE.Group(); piv.position.set(s * 12, 0, -95); piv.rotation.z = -s * 0.5; scene.add(piv);
      const g = new THREE.Mesh(new THREE.PlaneGeometry(240, 15), matG); g.rotation.y = -s * Math.PI / 2; g.position.set(0, 7.5, 0); piv.add(g);
      const matV = new THREE.MeshBasicMaterial({ map: tV }); (mundo.matsV = mundo.matsV || []).push(matV);
      const valla = new THREE.Mesh(new THREE.PlaneGeometry(240, 1.1), matV); valla.rotation.y = -s * Math.PI / 2; valla.position.set(s * 8.2, 0.55, -95); scene.add(valla);
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
    creaJug();
    /* defensas: reserva reutilizable */
    for (let i = 0; i < 12; i++) nuevaDef();
    /* mallas de obstáculos y objetos (se crean bajo demanda) */
    const caraMon = new THREE.MeshBasicMaterial({ map: texMoneda() });
    mundo.matMon = [new THREE.MeshStandardMaterial({ color: 0xffc824, emissive: 0x8a5d00, emissiveIntensity: 0.8, metalness: 0.15, roughness: 0.35 }), caraMon, caraMon];
    mundo.geoMon = new THREE.CylinderGeometry(0.5, 0.5, 0.08, 40); mundo.geoMon.rotateX(Math.PI / 2);
    mundo.texFuego = texBrillo("rgba(255,170,60,1)"); mundo.texAura = texBrillo("rgba(255,255,255,.95)"); mundo.texRayo = texRayo(); mundo.texCartel = texCartel(); mundo.texBalon = texBalon(); mundo.texRed = texRed();
    estSis = {}; chispas = crearParticulas(scene, 120, 0xffd23a, 0.22, true); polvo = crearParticulas(scene, 70, 0xdfe9d4, 0.32, false);
    for (let i = 0; i < 22; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 3), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, fog: false }));
      m.position.set(rnd(-7, 7), rnd(0.3, 5.5), rnd(-30, 8)); m.visible = false; scene.add(m); lineas.push(m);
    }
    /* clima: lluvia, nieve y confeti (un único sistema de puntos alrededor del jugador) */
    {
      const n = movil ? 260 : 420, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), pal = [[1, 0.3, 0.4], [1, 0.85, 0.2], [0.3, 0.9, 1], [0.5, 1, 0.5], [1, 0.5, 0.9]];
      for (let i = 0; i < n; i++) { pos[i * 3] = rnd(-9, 9); pos[i * 3 + 1] = rnd(0, 11); pos[i * 3 + 2] = rnd(-50, 6); }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true, map: texBrillo("rgba(255,255,255,.8)") });
      const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.visible = false; scene.add(pts);
      clima = { pts: pts, pos: pos, col: col, n: n, tipo: "", pal: pal, geo: geo, mat: mat };
    }
    /* esfera azul clara (rayo/escudo) y anillo del imán */
    { const g = new THREE.Group(), m1 = new THREE.MeshBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: 0.3, depthWrite: false, fog: false });
      g.add(new THREE.Mesh(new THREE.SphereGeometry(1.38, 28, 20), m1)); const w = new THREE.Mesh(new THREE.SphereGeometry(1.4, 14, 10), new THREE.MeshBasicMaterial({ color: 0xcdf1ff, wireframe: true, transparent: true, opacity: 0.22, depthWrite: false, fog: false })); g.add(w);
      g.userData.m = m1; g.visible = false; scene.add(g); mundo.esfera = g;
      mundo.imanR = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 8, 48), new THREE.MeshBasicMaterial({ color: 0xff4d8d, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); mundo.imanR.visible = false; scene.add(mundo.imanR); }
    /* modo infernal: nubes rojas y llamas en las gradas (bengalas del público) */
    { const c = lienzo(512, 256), x = c.getContext("2d"); x.fillStyle = "#000"; x.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 90; i++) { const cx = Math.random() * 512, cy = 40 + Math.random() * 170, r = 30 + Math.random() * 70, gr = x.createRadialGradient(cx, cy, 2, cx, cy, r), a = 0.12 + Math.random() * 0.3; gr.addColorStop(0, "rgba(" + (150 + irnd(105)) + "," + irnd(50) + ",10," + a + ")"); gr.addColorStop(1, "rgba(60,0,0,0)"); x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
      const t0 = new THREE.CanvasTexture(c); t0.colorSpace = THREE.SRGBColorSpace; t0.wrapS = THREE.RepeatWrapping; mundo.texNubes = t0;
      mundo.nubes = []; [[-170, 52, 380, 130, 0.9], [-120, 34, 300, 90, 0.7]].forEach((q) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(q[2], q[3]), new THREE.MeshBasicMaterial({ map: t0, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.NormalBlending })); m.position.set(0, q[1], q[0]); m.visible = false; scene.add(m); mundo.nubes.push(m); });
      const n = movil ? 24 : 42; mundo.llamas = []; for (let i = 0; i < n; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mundo.texFuego, color: 0xff4a10, depthWrite: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, fog: false })); sp.visible = false; scene.add(sp); mundo.llamas.push({ sp: sp, s: i % 2 ? 1 : -1, ph: Math.random() * 6 }); recolocaLlama(mundo.llamas[i], true); } }
    tamano(); aplicaEsc(0, 0);
  }
  function recolocaLlama(l, ini) { const yy = rnd(1.2, 8.5); l.sp.position.set(l.s * (12 + yy * 0.48 + rnd(-0.6, 0.6)), yy, ini ? rnd(-105, 8) : rnd(-108, -90)); l.k = rnd(4.5, 8); }
  const cR1 = new THREE.Color(0x2a0404), cR2 = new THREE.Color(0x6a1006), cR3 = new THREE.Color(0xff7a4a), cR4 = new THREE.Color(0x8a2a1a), cR5 = new THREE.Color(0xff8a6a);
  /* nivel 10: cielo rojo y nublado, gradas con bengalas; sube poco a poco desde el nivel 9 */
  function ambienteInf(dt, dz) {
    if (!mundo.nubes) return;
    const obj = S.fase === "corre" || S.fase === "choque" ? (S.nivel >= 10 ? 1 : S.nivel === 9 ? 0.3 : 0) : S.inf > 0.5 && S.fase === "fin" ? 1 : 0;
    S.inf += (obj - S.inf) * Math.min(1, dt * 0.6); const f = S.inf, T = S.t;
    raiz.classList.toggle("sl-inf", f > 0.5);
    mundo.nubes.forEach((m, i) => { m.visible = f > 0.02; m.material.opacity = Math.min(1, f * 1.1); m.position.x = Math.sin(T * 0.05 + i) * 12; });
    mundo.texNubes.offset.x += dt * 0.004; 
    if (f > 0.01) {
      scene.background.lerp(cR1, f * 0.9); scene.fog.color.lerp(cR2, f * 0.9); scene.fog.far = lerp(scene.fog.far, 78, f); scene.fog.near = lerp(scene.fog.near, 16, f);
      hemi.intensity *= 1 - 0.4 * f; hemi.color.set(0xcfe3ff).lerp(cR3, f * 0.7); sol.color.lerp(cR3, f * 0.8); sol.intensity *= 1 - 0.25 * f;
      mundo.matCesped.color.lerp(cR4, f * 0.55); mundo.matsG.forEach((m) => m.color.lerp(cR5, f * 0.6));
    } else { hemi.color.set(0xcfe3ff); }
    mundo.llamas.forEach((l) => {
      l.sp.visible = f > 0.05 && !reducido; if (!l.sp.visible) return;
      l.sp.position.z += dz; if (l.sp.position.z > 12) recolocaLlama(l, false);
      const k = l.k * (1 + Math.sin(T * 17 + l.ph) * 0.18); l.sp.scale.set(k, k * 1.6, 1); l.sp.material.opacity = Math.min(0.95, f) * (0.7 + Math.sin(T * 23 + l.ph * 2) * 0.25);
    });
  }

  /* jugador con la equipación elegida (se vuelve a crear al cambiar de vestuario) */
  function creaJug() {
    const d = datos(), k = KIT_J.find((x) => x.id === d.kit) || KIT_J[0], bt = BOTAS.find((x) => x.id === d.bota) || BOTAS[0], pl = PELOS.find((x) => x.id === d.pelo) || PELOS[0];
    estelaAct = ESTELAS.find((x) => x.id === d.estela) || ESTELAS[0];
    if (jug) { scene.remove(jug.raiz); }
    jug = crearFigura({ cuerpo: "jugador", camisa2: k.c2, camisa: k.c, patron: k.pat, pantalon: k.p, media: k.m, bota: bt.c, piel: 0xf0c8a0, pelo: pl.c, dorsal: 7, nombre: (api.nombre ? api.nombre() : "") || "TIKI", numColor: "#ffffff", manga: true });
    jug.raiz.rotation.y = Math.PI; scene.add(jug.raiz);
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
  /* balón gigante que rueda de lado a lado (se salta) */
  function mallaRodante() {
    const g = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 28, 20), new THREE.MeshStandardMaterial({ map: mundo.texBalon, roughness: 0.4 }));
    b.position.y = 0.55; b.castShadow = true; g.add(b); g.userData.bola = b; return g;
  }
  /* balón que bota: la sombra del suelo avisa de dónde cae */
  function mallaBotando() {
    const g = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 16), new THREE.MeshStandardMaterial({ map: mundo.texBalon, roughness: 0.4 }));
    b.castShadow = true; g.add(b); g.userData.bola = b;
    const so = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })); so.rotation.x = -Math.PI / 2; so.position.y = 0.03; g.add(so); g.userData.so = so; return g;
  }
  /* dron de televisión que barre el campo a la altura de la cabeza (se pasa deslizándose) */
  function mallaDron() {
    const g = new THREE.Group(), os = new THREE.MeshStandardMaterial({ color: 0x232b3b, roughness: 0.5, metalness: 0.4 });
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.24, 0.6), os); c.castShadow = true; g.add(c);
    const ojo = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff3b4d })); ojo.position.set(0, -0.14, 0.3); g.add(ojo);
    g.userData.rot = [];
    [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]].forEach((q) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 18), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.55 })); r.position.set(q[0], 0.16, q[1]); g.add(r); g.userData.rot.push(r); });
    const so = new THREE.Mesh(new THREE.CircleGeometry(0.7, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false })); so.rotation.x = -Math.PI / 2; so.position.y = -1.27; g.add(so); g.userData.so = so;
    return g;
  }
  /* carrito de balones que cruza el campo de lado a lado (se salta) */
  function mallaCarro() {
    const g = new THREE.Group(), gris = new THREE.MeshStandardMaterial({ color: 0x8d99ae, roughness: 0.5, metalness: 0.4 }), bal = new THREE.MeshStandardMaterial({ map: mundo.texBalon, roughness: 0.4 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.9), gris); base.position.y = 0.3; base.castShadow = true; g.add(base);
    [[-0.74, 0], [0.74, 0]].forEach((q) => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.9), gris); w.position.set(q[0], 0.5, q[1]); g.add(w); });
    const f = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 0.06), gris); f.position.set(0, 0.5, 0.45); g.add(f);
    [[-0.45, 0.2], [0.1, 0.1], [0.5, 0.2], [-0.2, -0.2], [0.3, -0.2]].forEach((q, i) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), bal); b.position.set(q[0], 0.62 + (i % 2) * 0.08, q[1]); b.castShadow = true; g.add(b); });
    const ru = new THREE.MeshStandardMaterial({ color: 0x222831 }); [[-0.55, 0.38], [0.55, 0.38], [-0.55, -0.38], [0.55, -0.38]].forEach((q) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 12), ru); r.rotation.z = Math.PI / 2; r.position.set(q[0], 0.11, q[1]); g.add(r); });
    return g;
  }
  /* mascota de peluche que salta de carril en carril (esquívala) */
  function mallaMascota() {
    const g = new THREE.Group(), pel = new THREE.MeshStandardMaterial({ color: 0x35c98a, roughness: 0.9 }), blanco = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }), negro = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const cuerpo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 22, 16), pel); cuerpo.position.y = 0.85; cuerpo.scale.set(1, 1.15, 0.9); cuerpo.castShadow = true; g.add(cuerpo);
    const bar = new THREE.Mesh(new THREE.SphereGeometry(0.4, 18, 12), blanco); bar.position.set(0, 0.75, 0.38); bar.scale.set(1, 1.1, 0.5); g.add(bar);
    [-0.2, 0.2].forEach((x) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), blanco); o.position.set(x, 1.3, 0.45); g.add(o); const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), negro); p.position.set(x, 1.3, 0.58); g.add(p); });
    [-0.38, 0.38].forEach((x) => { const o = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), pel); o.position.set(x, 1.8, 0); g.add(o); const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), pel); b.position.set(x * 1.9, 0.95, 0.1); g.add(b); const pie = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), pel); pie.position.set(x * 0.7, 0.14, 0.1); pie.scale.set(1, 0.6, 1.3); g.add(pie); });
    g.userData.cuerpo = cuerpo; return g;
  }
  /* pelotazo: balón en llamas que viene más rápido que el campo */
  function mallaPelotazo() {
    const g = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 22, 16), new THREE.MeshStandardMaterial({ map: mundo.texBalon, roughness: 0.5 }));
    b.position.y = 0.42; b.castShadow = true; g.add(b); g.userData.bola = b;
    const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: mundo.texFuego, depthWrite: false, transparent: true, opacity: 0.8, fog: false })); f.scale.set(1.8, 1.8, 1); f.position.set(0, 0.5, 0.9); g.add(f); g.userData.fu = f;
    return g;
  }

  /* personajes con el mismo cuerpo (Rocketbox) que el corredor y los defensas */
  function figEq(o) { return crearFigura(Object.assign({ cuerpo: "jugador", piel: 0xf0c8a0, pelo: 0x1c140f, nombre: "", numColor: "#ffffff", manga: true }, o)); }
  function envuelve(figs) { const g = new THREE.Group(); figs.forEach((f) => g.add(f.raiz)); g.userData.fs = figs; g.userData.f = figs[0]; return g; }
  /* árbitro: corre hacia ti y se cruza de carril; lleva una tarjeta amarilla en alto */
  function mallaArbitro() {
    const f = figEq({ camisa: 0x15151a, camisa2: 0xd9d9de, pantalon: 0x15151a, media: 0x15151a, bota: 0x111111, piel: 0xd9a273 });
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.03), new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.6 })); c.position.set(0, 0.12, 0.05); f.brD.m.add(c);
    return envuelve([f]);
  }
  /* portero en plancha: guantes y camiseta naranja */
  function mallaPortero() {
    return envuelve([figEq({ cuerpo: "portero", camisa: 0xff7a00, camisa2: 0x1a1a1a, pantalon: 0x1a1a1a, media: 0xff7a00, guante: 0xe8ff3a, largo: true, piel: 0xa8764d })]);
  }
  /* barrera: tres jugadores hombro con hombro que se desplazan a la vez */
  function mallaBarrera() {
    const col = [[0x1d5fd6, 0xffffff], [0xffffff, 0x1d5fd6], [0x1d5fd6, 0xffffff]], piel = [0xf0c8a0, 0xd9a273, 0xa8764d];
    const fs = col.map((k, i) => { const f = figEq({ camisa: k[0], camisa2: k[1], pantalon: k[1], media: k[0], piel: piel[i] }); f.raiz.position.x = (i - 1) * 1.1; return f; });
    return envuelve(fs);
  }
  /* recogepelotas: chico con peto que corre con un balón bajo el brazo */
  function mallaRecogepelotas() {
    const f = figEq({ camisa: 0x19c8ff, camisa2: 0xffffff, pantalon: 0x1a1a1a, media: 0x1a1a1a, piel: 0xd9a273 }), g = envuelve([f]);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshStandardMaterial({ map: mundo.texBalon, roughness: 0.5 })); b.position.set(0.32, 1.1, 0.25); b.castShadow = true; g.add(b); g.userData.bola = b; return g;
  }
  /* camilla: dos sanitarios con peto naranja la llevan de lado a lado; los sanitarios no se saltan, la camilla sí */
  function mallaCamillero() {
    const fs = [-1.15, 1.15].map((x) => { const f = figEq({ camisa: 0xff8a00, camisa2: 0xffffff, pantalon: 0x222831, media: 0x222831, piel: x < 0 ? 0xf0c8a0 : 0xa8764d }); f.raiz.position.x = x; return f; }), g = envuelve(fs);
    const lona = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.62), new THREE.MeshStandardMaterial({ color: 0x2a6bd6, roughness: 0.8 })); lona.position.set(0, 0.72, 0); lona.castShadow = true; g.add(lona);
    const asa = new THREE.MeshStandardMaterial({ color: 0x20242c, roughness: 0.5 }); [-0.28, 0.28].forEach((z) => { const a = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.05, 0.05), asa); a.position.set(0, 0.74, z); g.add(a); });
    return g;
  }
  /* tarjeta amarilla gigante que gira en el aire: opaca, con borde negro y sin brillo (agáchate para pasar) */
  function mallaTarjeta() {
    const g = new THREE.Group(), pivote = new THREE.Group();
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.3, 0.1), new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.75, metalness: 0 })); c.castShadow = true; pivote.add(c);
    const borde = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.45, 0.08), new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: 0.8 })); borde.position.z = -0.01; pivote.add(borde);
    g.add(pivote); g.userData.c = pivote; return g;
  }
  /* cortacésped del campo: cruza de lado a lado, sáltalo */
  function mallaCortacesped() {
    const g = new THREE.Group(), M = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.2 });
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.9), M(0x2fbf4a)); cuerpo.position.y = 0.42; cuerpo.castShadow = true; g.add(cuerpo);
    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.5), M(0x333a45)); motor.position.set(0, 0.8, -0.05); g.add(motor);
    const mang = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), M(0x222831)); mang.position.set(0, 0.85, 0.62); mang.rotation.x = 0.8; g.add(mang);
    const rue = new THREE.MeshStandardMaterial({ color: 0x15181d }); [[-0.55, 0.4], [0.55, 0.4], [-0.55, -0.4], [0.55, -0.4]].forEach((q) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 12), rue); r.rotation.z = Math.PI / 2; r.position.set(q[0], 0.17, q[1]); g.add(r); });
    return g;
  }
  /* caja sorpresa (regalo) */
  function mallaCaja() {
    const g = new THREE.Group(), roja = new THREE.MeshStandardMaterial({ color: 0xe0245e, roughness: 0.4, emissive: 0x4a0018, emissiveIntensity: 0.5 }), oro = new THREE.MeshStandardMaterial({ color: 0xffd23a, roughness: 0.3, metalness: 0.3, emissive: 0x6a4a00, emissiveIntensity: 0.6 });
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.85), roja); c.castShadow = true; g.add(c);
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.2, 0.95), roja); t.position.y = 0.42; g.add(t);
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.92, 0.9), oro); c1.position.y = 0.05; g.add(c1);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.92, 0.16), oro); c2.position.y = 0.05; g.add(c2);
    [-1, 1].forEach((s2) => { const l = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 8, 16), oro); l.position.set(s2 * 0.17, 0.62, 0); l.rotation.y = s2 * 0.6; g.add(l); });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mundo.texRayo, depthWrite: false, transparent: true, fog: false })); sp.scale.set(2.6, 2.6, 1); g.add(sp); g.userData.sp = sp; return g;
  }
  function mallaBota() {
    const g = new THREE.Group(), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mundo.texRayo, depthWrite: false, transparent: true, fog: false })); s.scale.set(1.5, 1.5, 1); g.add(s); g.userData.sp = s; return g;
  }
  /* llama de bengala: sprite aditivo + núcleo */
  function llama(esc) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: mundo.texFuego, depthWrite: false, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, fog: false })); f.scale.set(esc, esc * 1.5, 1); return f; }
  function barraBengala(h) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, h, 10), new THREE.MeshStandardMaterial({ color: 0xc8102e, emissive: 0x7a0010, emissiveIntensity: 0.8, roughness: 0.5 })); return b; }
  /* ultra: aficionado con gorro, bufanda y bengala encendida en alto */
  function mallaUltra() {
    const f = figEq({ camisa: 0x1a1a22, camisa2: 0xc8102e, pantalon: 0x22252e, media: 0x1a1a22, bota: 0x111111, piel: 0xe0b48a, pelo: 0x2a1a10 });
    const b = barraBengala(0.4); b.position.set(0, 0.2, 0); f.brD.m.add(b);
    const fu = llama(1.1); fu.position.set(0, 0.55, 0); f.brD.m.add(fu);
    const bu = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.06, 8, 18), new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.8 })); bu.rotation.x = Math.PI / 2; bu.position.set(0, 1.5, 0.02); f.raiz.add(bu);
    const g = envuelve([f]); g.userData.fu = fu; return g;
  }
  /* bengala caída en el césped: se salta */
  function mallaBengala() {
    const g = new THREE.Group(), b = barraBengala(0.6); b.rotation.z = Math.PI / 2; b.position.y = 0.1; b.castShadow = true; g.add(b);
    const f1 = llama(1.5); f1.position.set(0.32, 0.65, 0); g.add(f1); const f2 = llama(1.0); f2.position.set(0.3, 0.45, 0.05); g.add(f2);
    const hu = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: 0xff3a10, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); hu.rotation.x = -Math.PI / 2; hu.position.y = 0.02; g.add(hu);
    g.userData.f1 = f1; g.userData.f2 = f2; return g;
  }
  /* steward: guardia de seguridad con chaleco amarillo fosforito y brazos abiertos */
  function mallaSteward() {
    return envuelve([figEq({ camisa: 0xd7ff1a, camisa2: 0x1a1a1a, pantalon: 0x14151a, media: 0x14151a, bota: 0x0a0a0a, piel: 0xb98a5e })]);
  }
  /* poderes: objeto con icono 3D, aura RGB que cambia de color y anillo giratorio */
  function formaRayo() { const s = new THREE.Shape(); s.moveTo(0.1, 0.62); s.lineTo(-0.32, -0.05); s.lineTo(-0.04, -0.05); s.lineTo(-0.14, -0.62); s.lineTo(0.34, 0.12); s.lineTo(0.06, 0.12); s.lineTo(0.1, 0.62); return s; }
  function formaEscudo() { const s = new THREE.Shape(); s.moveTo(0, 0.6); s.bezierCurveTo(0.2, 0.5, 0.42, 0.5, 0.5, 0.52); s.bezierCurveTo(0.52, 0, 0.4, -0.38, 0, -0.62); s.bezierCurveTo(-0.4, -0.38, -0.52, 0, -0.5, 0.52); s.bezierCurveTo(-0.42, 0.5, -0.2, 0.5, 0, 0.6); return s; }
  function mallaPoder(tipo) {
    const g = new THREE.Group(); let ico;
    if (tipo === "pw_rayo") { ico = new THREE.Mesh(new THREE.ExtrudeGeometry(formaRayo(), { depth: 0.18, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: 0xffe94a, emissive: 0xffb800, emissiveIntensity: 1.1, metalness: 0.2, roughness: 0.3 })); ico.position.z = -0.09; }
    else if (tipo === "pw_escudo") { ico = new THREE.Mesh(new THREE.ExtrudeGeometry(formaEscudo(), { depth: 0.16, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: 0x4fc3ff, emissive: 0x0b6fb8, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.3 })); ico.position.z = -0.08; }
    else {
      ico = new THREE.Group(); const mt = new THREE.MeshStandardMaterial({ color: 0xff2d55, emissive: 0x8a0020, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.3 }), pl = new THREE.MeshStandardMaterial({ color: 0xe8edf5, metalness: 0.6, roughness: 0.25 });
      const arco = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.15, 14, 28, Math.PI), mt); arco.position.y = 0.06; ico.add(arco);
      [-0.34, 0.34].forEach((x) => { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 18), mt); a.position.set(x, -0.1, 0); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.151, 0.151, 0.14, 18), pl); p.position.set(x, -0.3, 0); ico.add(a, p); });
    }
    ico.traverse((o) => { if (o.isMesh) o.castShadow = false; }); g.add(ico);
    const au = new THREE.Sprite(new THREE.SpriteMaterial({ map: mundo.texAura, depthWrite: false, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, fog: false })); au.scale.set(3.4, 3.4, 1); g.add(au);
    const an = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.045, 8, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); g.add(an);
    g.userData.ico = ico; g.userData.au = au; g.userData.an = an; return g;
  }
  function toma(tipo) {
    let o = libres[tipo].pop();
    if (!o) {
      if (tipo === "moneda") o = new THREE.Mesh(mundo.geoMon, mundo.matMon);
      else if (tipo === "valla") o = mallaValla(); else if (tipo === "cono") o = mallaCono(); else if (tipo === "cartel") o = mallaCartel(); else if (tipo === "bota") o = mallaBota(); else if (tipo === "rodante") o = mallaRodante(); else if (tipo === "botando") o = mallaBotando(); else if (tipo === "dron") o = mallaDron(); else if (tipo === "carro") o = mallaCarro(); else if (tipo === "mascota") o = mallaMascota(); else if (tipo === "pelotazo") o = mallaPelotazo(); else if (tipo === "caja") o = mallaCaja(); else if (tipo === "arbitro") o = mallaArbitro(); else if (tipo === "portero") o = mallaPortero(); else if (tipo === "barrera") o = mallaBarrera(); else if (tipo === "tarjeta") o = mallaTarjeta(); else if (tipo === "recogepelotas") o = mallaRecogepelotas(); else if (tipo === "camillero") o = mallaCamillero(); else if (tipo === "cortacesped") o = mallaCortacesped(); else if (tipo === "ultra") o = mallaUltra(); else if (tipo === "bengala") o = mallaBengala(); else if (tipo === "steward") o = mallaSteward(); else if (tipo.indexOf("pw_") === 0) o = mallaPoder(tipo);
      else if (tipo === "def" || tipo === "extremo") return null;
      if (tipo === "moneda") o.castShadow = false;
      scene.add(o);
    }
    o.visible = true; return o;
  }
  function suelta(ob) {
    ob.activo = false; const m = ob.m; if (!m) return;
    if (ob.tipo === "def" || ob.tipo === "entrada" || ob.tipo === "extremo") { m.raiz.visible = false; m.raiz.rotation.set(0, 0, 0); m.raiz.position.set(0, 0, 0); libres.def.push(m); }
    else { m.visible = false; m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1); libres[ob.tipo].push(m); }
    ob.m = null;
  }
  function pon(tipo, lane, z, y) {
    const ob = { tipo: tipo, lane: lane, z: z, y: y || 0, activo: true, golpe: 0, extra: 0, ph: Math.random() * 6, x: undefined };
    if (tipo === "def" || tipo === "entrada" || tipo === "extremo") {
      const f = libres.def.pop() || (nDef < 22 ? (nuevaDef(), libres.def.pop()) : null); if (!f) return null; ob.m = f; f.raiz.visible = true; POSES.base(f);
    } else { const m = toma(tipo); if (!m) return null; ob.m = m; }
    S.obs.push(ob); colocaObj(ob); return ob;
  }
  function colocaObj(ob) {
    const x = ob.x !== undefined ? ob.x : ob.lane < 0 ? 0 : LX[ob.lane], r = ob.m && ob.m.raiz ? ob.m.raiz : ob.m; if (!r) return;
    r.position.set(x, ob.y, ob.z);
  }
  function monedas(lane, z0, n, y, paso) { for (let i = 0; i < n; i++) pon("moneda", lane, z0 - 5 - i * (paso || 2.2), y || 1.0); }

  /* ── generador de filas: siempre hay camino libre ── */
  function patron(tipo, Z, libre) {
    const lanes = [0, 1, 2], otros = lanes.filter((l) => l !== libre), d = Math.min(1, S.dist / 1800);
    if (tipo === "muro") { otros.forEach((l) => pon("def", l, Z)); monedas(libre, Z + 20, 6); }
    else if (tipo === "conos") { otros.forEach((l) => pon("cono", l, Z)); monedas(libre, Z + 20, 6); if (Math.random() < 0.5) pon("def", libre, Z - 14); }
    else if (tipo === "valla") { lanes.forEach((l) => pon("valla", l, Z)); for (let i = 0; i < 5; i++) pon("moneda", 1, Z + 3 - i * 1.5, 1.2 + Math.sin(i / 4 * Math.PI) * 1.2); }
    else if (tipo === "cartel") { pon("cartel", -1, Z); monedas(libre, Z + 18, 5, 0.9); }
    else if (tipo === "entrada") { pon("entrada", libre, Z); if (d > 0.4) pon("def", otros[irnd(2)], Z); monedas(otros[0], Z + 22, 5); }
    else if (tipo === "mix") { pon("def", otros[0], Z); pon("valla", otros[1], Z); monedas(libre, Z + 20, 6); }
    else if (tipo === "doble") { otros.forEach((l) => pon("def", l, Z)); pon("cartel", -1, Z - 15); monedas(libre, Z + 20, 5); }
    else if (tipo === "rodante") { pon("rodante", -1, Z); monedas(1, Z + 16, 4, 1.7); }
    else if (tipo === "botando") { otros.forEach((l) => pon("botando", l, Z)); monedas(libre, Z + 20, 6); }
    else if (tipo === "extremo") { const a = irnd(2); pon("extremo", a, Z); monedas(a === 0 ? 2 : 0, Z + 18, 5); }
    else if (tipo === "dron") { pon("dron", -1, Z, 1.3); monedas(irnd(3), Z + 16, 5, 0.9); }
    else if (tipo === "carro") { pon("carro", -1, Z); monedas(1, Z + 16, 4, 1.7); }
    else if (tipo === "mascota") { pon("mascota", -1, Z); monedas(irnd(3), Z + 18, 5); }
    else if (tipo === "pelotazo") { pon("pelotazo", libre === 1 ? (Math.random() < 0.5 ? 0 : 2) : 1, Z - 20); monedas(libre, Z + 14, 5); }
    else if (tipo === "arbitro") { const a = pon("arbitro", otros[0], Z); if (a) a.lane2 = otros[1]; monedas(libre, Z + 20, 5); }
    else if (tipo === "portero") { pon("portero", -1, Z); monedas(irnd(3), Z + 18, 5); }
    else if (tipo === "barrera") { pon("barrera", -1, Z); monedas(libre, Z + 18, 5); }
    else if (tipo === "recogepelotas") { const a = pon("recogepelotas", otros[irnd(2)], Z - 10); monedas(libre, Z + 16, 5); }
    else if (tipo === "camillero") { pon("camillero", -1, Z); monedas(irnd(3), Z + 18, 5, 1.7); }
    else if (tipo === "tarjeta") { pon("tarjeta", -1, Z, 1.55); monedas(irnd(3), Z + 16, 5, 0.9); }
    else if (tipo === "ultra") { const a = irnd(2); pon("ultra", a, Z); monedas(a === 0 ? 2 : 0, Z + 18, 5); }
    else if (tipo === "bengala") { otros.forEach((l) => pon("bengala", l, Z)); if (Math.random() < 0.5) pon("bengala", libre, Z - 14); monedas(libre, Z + 18, 5); }
    else if (tipo === "steward") { pon("steward", -1, Z); monedas(irnd(3), Z + 18, 5); }
    else if (tipo === "cortacesped") { const a = pon("cortacesped", -1, Z), b = pon("cortacesped", -1, Z - 9); if (a && b) b.ph = a.ph + Math.PI; monedas(1, Z + 16, 4, 1.7); }
  }
  function fila() {
    const d = Math.min(1, S.dist / 1800), Z = Z_SPAWN, lanes = [0, 1, 2], n = S.filas++, D = S.dist, tc = S.tc || 0;
    /* a partir de ~2 min las filas están más juntas: el carril libre de una fila a la siguiente cambia como mucho un carril */
    const cand = tc > 65 && n > 0 ? lanes.filter((l) => Math.abs(l - S.libreAnt) <= 1) : lanes; const libre = cand[irnd(cand.length)]; S.libreAnt = libre;
    /* regalos y poderes salen SOLOS: una fila propia sin obstáculos ni monedas, y sin nada cerca delante ni detrás */
    if (n >= 3) {
      const quiereCaja = S.cajaD > 0 && S.dist >= S.cajaD, quierePod = S.dist > 250 && S.dist >= S.podSig && S.poderes < MAX_PODERES;
      if ((quiereCaja || quierePod) && !S.obs.some((o) => o.tipo !== "moneda" && Math.abs(o.z - Z) < 16)) {
        if (quiereCaja) { S.cajaD = S.dist + rnd(900, 1600); pon("caja", irnd(3), Z, 1.0); aviso("🎁 ¡Caja sorpresa delante!", "oro", 1400); }
        else { S.podSig = S.dist + rnd(380, 760); S.poderes++; pon(["pw_iman", "pw_rayo", "pw_escudo"][irnd(3)], irnd(3), Z, 1.1); }
        S.sig = Math.max(34, clamp(S.v * 1.4, 21, 46) * espaciado(tc)); return;
      }
    }
    const pats = []; const vistos = S.vistos || (S.vistos = {});
    NUEVOS.forEach((nv) => pats.push([vistos[nv[2]] ? 3 : 0, nv[2]]));
    const inf = nivelDe(tc) >= 10; INFERNAL.forEach((nv) => pats.push([inf && vistos[nv[1]] ? 4 : 0, nv[1]]));
    pats.push([5, "muro"], [3, "conos"], [d > 0.05 ? 4 : 0, "valla"], [d > 0.12 ? 3 : 0, "cartel"], [d > 0.2 ? 3 : 0, "entrada"], [d > 0.3 ? 3 : 0, "mix"], [d > 0.5 ? 3 : 0, "doble"]);
    if (n < 3) { pats.length = 0; pats.push([1, n === 0 ? "conos" : "muro"]); }
    const elige = (lista) => { let tot = 0; lista.forEach((p) => { tot += p[0]; }); let r = Math.random() * tot, tipo = "muro"; for (const p of lista) { if ((r -= p[0]) <= 0) { tipo = p[1]; break; } } return tipo; };
    /* aviso: solo cuando el obstáculo nuevo va a salir YA (el primero que toque, en orden) */
    let tipo0 = null;
    if (n >= 3) {
      const nv = NUEVOS.find((q) => D > q[0] && !vistos[q[2]]) || (inf ? INFERNAL.map((q) => [0, q[0], q[1]]).find((q) => !vistos[q[2]]) : null);
      if (nv) { tipo0 = nv[2]; vistos[tipo0] = true; avisoOb(nv[1]); }
    }
    patron(tipo0 || elige(pats), Z, libre);
    /* tras 4-5 min: filas dobles y triples de obstáculos que no se saltan (siempre dejan libre el mismo carril) */
    const ex = filasExtra(tc);
    if (ex && n > 3) { const solo = pats.filter((p) => ["muro", "mascota", "extremo", "portero", "arbitro", "barrera", "botando", "recogepelotas", "ultra", "steward"].indexOf(p[1]) >= 0 && p[0] > 0); for (let k = 1; k <= ex; k++) patron(solo.length ? elige(solo) : "muro", Z - 13 * k, libre); }
    if (S.dist > 250 && S.dist >= S.podSig && S.poderes < MAX_PODERES) { S.podSig = S.dist + rnd(380, 760); S.poderes++; pon(["pw_iman", "pw_rayo", "pw_escudo"][irnd(3)], libre, Z + 30, 1.1); }
    S.sig = clamp(S.v * 1.4, 21, 46) * espaciado(tc) * (ex ? 1 + 0.25 * ex : 1);
  }

  /* ── interfaz ── */
  function aviso(txt, cls, ms) {
    const a = $("[data-aviso]"); a.className = "sl-aviso sl-aviso--" + (cls || "n"); a.textContent = t(txt); void a.offsetWidth; a.classList.add("sl-aviso--on");
    clearTimeout(hAviso); hAviso = setTimeout(function () { a.classList.remove("sl-aviso--on"); }, ms || 1300);
  }
  function avisoOb(txt) {
    const a = $("[data-avob]"); a.textContent = t(txt); a.classList.remove("on"); void a.offsetWidth; a.classList.add("on");
    clearTimeout(hAvOb); hAvOb = setTimeout(function () { a.classList.remove("on"); }, 3200);
  }
  /* dificultad: cartel grande en otra fuente que se encoge y sube hasta el indicador pequeño «Dificultad x/10» */
  function cartelNivel(n) {
    const txt = t("Dificultad " + n + "/10"), nom = t(NIV_NOM[n - 1]), col = NIV_COL[n - 1];
    const c = $("[data-niv]"), i = $("[data-niv-i]"); c.style.setProperty("--c", col); i.style.setProperty("--c", col);
    c.innerHTML = "<b></b><small></small>"; c.firstChild.textContent = txt; c.lastChild.textContent = nom;
    c.classList.toggle("sl-niv--inf", n >= 10); i.classList.toggle("sl-niv-i--inf", n >= 10);
    c.classList.remove("on"); i.classList.remove("on"); void c.offsetWidth; c.classList.add("on"); i.classList.add("on");
    i.textContent = (n >= 10 ? "🔥 " : "") + txt;
    if (n >= 10) { try { au.rugido(true); } catch (e) { /* opcional */ } }
  }
  const ICO_PW = { iman: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h5v8a3 3 0 0 0 6 0V3h5v8a8 8 0 0 1-16 0zM4 3h5v3H4zm11 0h5v3h-5z"/></svg>', rayo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 2L5 13.5h5.5L9.5 22 19 9.5h-5.8z"/></svg>', escudo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l8 3v6.2c0 5-3.4 8.8-8 10.8-4.6-2-8-5.8-8-10.8V5z"/></svg>' };
  function pintaPoderes() {
    const a = [["iman", S.iman, PODERES.pw_iman], ["rayo", S.turbo, PODERES.pw_rayo], ["escudo", S.escu, PODERES.pw_escudo]].filter((x) => x[1] > 0), key = a.map((x) => x[0]).join(), box = $("[data-pw]");
    if (key !== pwKey) { pwKey = key; box.innerHTML = a.map((x) => '<div class="sl-pwc" style="--c:' + x[2].col + '" data-pwc="' + x[0] + '">' + ICO_PW[x[0]] + '<b data-pws></b><i><u data-pwb></u></i></div>').join(""); }
    a.forEach((x) => { const e = box.querySelector('[data-pwc="' + x[0] + '"]'); if (!e) return; e.querySelector("[data-pws]").textContent = x[1].toFixed(1) + "s"; e.querySelector("[data-pwb]").style.transform = "scaleX(" + Math.min(1, x[1] / x[2].seg).toFixed(3) + ")"; e.classList.toggle("fin", x[1] < 1); });
  }
  function daPoder(tipo, x, y) {
    const p = PODERES[tipo]; if (!p) return;
    if (p.id === "rayo") S.turbo = p.seg; else if (p.id === "iman") S.iman = p.seg; else S.escu = p.seg;
    sonTurbo(); for (let k = 0; k < 22; k++) chispas.emite(x, y, 0, rnd(-4, 4), rnd(0, 5), rnd(-3, 3), 0.8); pintaPoderes();
  }
  function pista(txt) { $("[data-pista]").textContent = txt ? t(txt) : ""; }
  function pintaVidas() { let h = ""; for (let i = 0; i < VIDAS; i++) { const rest = S.vidas - i; h += '<s class="' + (rest > 0 ? "" : (i === VIDAS - 1 && S.vidas <= 0 ? "ro" : "am")) + '"></s>'; } $("[data-vidas]").innerHTML = h; }
  function pintaHud() { $("[data-sl-pts]").textContent = String(S.pts); $("[data-sl-m]").textContent = Math.floor(S.dist) + " m"; $("[data-sl-mon]").textContent = String(S.monedas); }
  function pintaSaldo() { const d = datos(), v = Math.max(0, d.bal - d.gast); raiz.querySelectorAll("[data-saldo]").forEach((e) => { e.textContent = String(v); }); }
  function pintaKits() {
    const d = datos(), saldo = d.bal - d.gast, c = (n) => "#" + n.toString(16).padStart(6, "0");
    $("[data-kits]").innerHTML = VEST.map((v) => '<h4 class="sl-cat">' + t(v[1]) + '</h4><div class="sl-kits">' + v[2].map((k) => {
      const tiene = d.tiene.indexOf(k.id) >= 0, puesta = d[v[0]] === k.id;
      const et = puesta ? t("Equipada") : tiene ? t("Usar") : "🪙 " + k.precio;
      const fondo = v[0] === "kit" ? "linear-gradient(135deg," + c(k.c) + " 0 50%," + c(k.p) + " 50% 100%)" : v[0] === "estela" ? "linear-gradient(135deg," + k.c.map(c).join(",") + (k.c.length < 2 ? "," + c(k.c[0]) : "") + ")" : c(k.c);
      return '<button type="button" class="sl-kit' + (puesta ? " on" : "") + (!tiene && saldo < k.precio ? " no" : "") + '" data-kit="' + k.id + '"><i style="background:' + fondo + ";border-color:" + (v[0] === "kit" ? c(k.c2) : "#fff") + '"></i><span>' + t(k.n) + '</span><b data-no-t>' + et + "</b></button>";
    }).join("") + "</div>").join("");
    pintaSaldo();
  }
  function elegirKit(id) {
    const d = datos(); let v = null, k = null; VEST.forEach((x) => { const f = x[2].find((y) => y.id === id); if (f) { v = x; k = f; } }); if (!k) return;
    if (d.tiene.indexOf(id) < 0) {
      const saldo = d.bal - d.gast; if (saldo < k.precio) { aviso("Te faltan " + (k.precio - saldo) + " monedas", "mal", 1400); return; }
      d.gast += k.precio; d.tiene.push(id); sonMoneda(); aviso("¡Comprado!", "bien", 1400);
    }
    d[v[0]] = id; try { api.guardar(); } catch (e) { /* opcional */ }
    if (E && scene) creaJug(); pintaKits();
  }
  function pintaRecord() { const d = datos(); $("[data-rec]").textContent = d.mejor ? "🏆 " + d.mejor + " · " + d.mejorm + " m · " + d.part + " ⚽" : ""; }
  function flash() { const f = $("[data-flash]"); f.classList.add("on"); clearTimeout(hFlash); hFlash = setTimeout(() => f.classList.remove("on"), 90); }

  /* ── escenarios: se mezclan suavemente de uno al siguiente ── */
  const cC = new THREE.Color(), cN = new THREE.Color(), cH = new THREE.Color(), cT = new THREE.Color();
  function aplicaEsc(i, k) {
    const a = ESC[i % ESC.length], b = ESC[(i + 1) % ESC.length];
    cC.set(a.niebla).lerp(cN.set(b.niebla), k); scene.fog.color.copy(cC); scene.background.copy(cC).lerp(cN.set(a.cielo).lerp(cH.set(b.cielo), k), 0.5);
    scene.fog.near = lerp(a.fn, b.fn, k); scene.fog.far = lerp(a.ff, b.ff, k);
    hemi.intensity = lerp(a.hemi, b.hemi, k); sol.intensity = lerp(a.sol, b.sol, k); sol.color.set(a.solC).lerp(cN.set(b.solC), k); E.renderer.toneMappingExposure = lerp(a.exp, b.exp, k);
    mundo.matCesped.color.set(a.cesped).lerp(cT.set(b.cesped), k);
    cT.set(a.grada).lerp(cN.set(b.grada), k); mundo.matsG.forEach((m) => m.color.copy(cT));
    cT.set(a.valla).lerp(cN.set(b.valla), k); mundo.matsV.forEach((m) => m.color.copy(cT));
    const nv = lerp(a.nieve, b.nieve, k); mundo.nieve.material.opacity = nv; mundo.nieve.visible = nv > 0.01;
    const noche = lerp(a.noche, b.noche, k); luces.forEach((l) => { l.sp.material.opacity = 0.3 + 0.55 * noche; });
    /* clima: el de «a» se apaga hasta la mitad y el de «b» entra después */
    const tipo = k < 0.5 ? a.clima : b.clima, fuerza = k < 0.5 ? (a.clima ? 1 - 2 * k : 0) : (b.clima ? 2 * k - 1 : 0);
    S.clima = tipo; S.climaK = fuerza; S.esc = i % ESC.length;
  }
  function ponClima(tipo) {
    if (!clima || clima.tipo === tipo) return; clima.tipo = tipo;
    const m = clima.mat; m.size = tipo === "lluvia" ? 0.14 : tipo === "nieve" ? 0.26 : 0.45;
    for (let i = 0; i < clima.n; i++) {
      const c = tipo === "confeti" ? clima.pal[i % clima.pal.length] : tipo === "lluvia" ? [0.7, 0.85, 1] : [1, 1, 1];
      clima.col[i * 3] = c[0]; clima.col[i * 3 + 1] = c[1]; clima.col[i * 3 + 2] = c[2];
    }
    clima.geo.attributes.color.needsUpdate = true;
  }
  function pasoClima(dt, dz) {
    if (!clima) return; const tipo = S.clima, f = S.climaK;
    if (tipo) ponClima(tipo);
    clima.pts.visible = !!tipo && f > 0.02 && !reducido; if (!clima.pts.visible) return;
    clima.mat.opacity = Math.min(0.9, f) * (tipo === "lluvia" ? 0.75 : 0.95);
    const pos = clima.pos, T = S.t;
    for (let i = 0; i < clima.n; i++) {
      let x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2] + dz;
      if (tipo === "lluvia") { y -= 24 * dt; x -= 1.2 * dt; }
      else if (tipo === "nieve") { y -= 2.1 * dt; x += Math.sin(T * 0.9 + i) * 0.7 * dt; }
      else { y -= 3.2 * dt; x += Math.sin(T * 2 + i) * 1.4 * dt; z += Math.cos(T * 1.6 + i) * 0.6 * dt; }
      if (y < 0 || z > 7) { y = 10 + Math.random() * 3; z = rnd(-52, -4); x = rnd(-9, 9); }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
    clima.geo.attributes.position.needsUpdate = true;
  }

  /* ── partida ── */
  function limpiaObs() { S.obs.forEach(suelta); S.obs = []; }
  function empezar() {
    audioIni(); au.iniciar(); au.ambiente(0.3);
    limpiaObs();
    Object.assign(S, { fase: "corre", dist: 0, v: 9, x: 0, lane: 1, y: 0, vy: 0, desl: 0, vidas: VIDAS, inv: 0, turbo: 0, monedas: 0, pts: 0, bonus: 0, sig: 10, filas: 0, tiki: false, regalo: 0, cajaD: rnd(500, 900), cajaN: 0, cajasRec: 0, cajaOk: false, tc: 0, aviT: 0, libreAnt: 1, choque: 0, hito: 0, tema: 0, vidaHito: 0, nuevo: 0, iman: 0, escu: 0, nivel: 1, inf: 0, vistos: {}, poderes: 0, podSig: rnd(300, 520) });
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; $("[data-turbo]").hidden = true; pintaVidas(); pintaHud(); aplicaEsc(0, 0); pwKey = null; $("[data-pw]").innerHTML = ""; cartelNivel(1); $("[data-avob]").classList.remove("on");
    pista(movil ? "Desliza: ⬅️ ➡️ carril · ⬆️ salto · ⬇️ agacharte" : "Flechas o WASD: ⬅️ ➡️ carril · ⬆️ salto · ⬇️ agacharte"); setTimeout(() => { if (S.fase === "corre" && S.dist < 120) pista(""); }, 4500);
    sonPita();
  }
  function termina() {
    if (S.fase === "fin") return; S.fase = "fin";
    const d = datos(); d.part++; d.bal += S.monedas; const nuevo = S.pts > d.mejor; if (nuevo) d.mejor = S.pts; if (Math.floor(S.dist) > d.mejorm) d.mejorm = Math.floor(S.dist);
    if (S.tiki) d.tiki++; if (S.regalo) d.cajas++;
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-fin-t]").textContent = t("¡TARJETA ROJA!"); $("[data-fin-m]").textContent = S.pts + " " + t("puntos") + " · " + Math.floor(S.dist) + " m · " + S.monedas + " TIKI";
    $("[data-fin-r]").textContent = nuevo ? t("¡Nuevo récord!") : "🏆 " + d.mejor;
    const nt = (S.tiki ? 1 : 0) + S.regalo; $("[data-fin-tiki]").textContent = t(nt === 1 ? "⚡ +1 tikitexto" : "⚡ +" + nt + " tikitextos"); $("[data-fin-tiki]").hidden = nt === 0; pintaSaldo(); $("[data-fin]").hidden = false; $("[data-turbo]").hidden = true; au.ambiente(0.1); au.suspiro(); pintaRecord();
  }
  /* caja sorpresa: premio al azar (monedas, turbo, vida, escudo o, raras veces, tikitextos: 1-3, una sola vez por partida) */
  function regalo(x, y) {
    const r = Math.random(); S.cajasRec = (S.cajasRec || 0) + 1; let msg = "";
    if (r < 0.07 && !S.cajaOk) {
      S.cajaOk = true; const q = Math.random(), n = q < 0.6 ? 1 : q < 0.9 ? 2 : 3; S.regalo = n;
      for (let i = 0; i < n; i++) { try { api.tiki(); } catch (e) { /* opcional */ } }
      try { api.victoria(); } catch (e) { /* opcional */ }
      msg = n === 1 ? "🎁 ¡Caja sorpresa! +1 tikitexto" : "🎁 ¡Caja sorpresa! +" + n + " tikitextos";
    } else if (r < 0.40) { const n = 15 + irnd(4) * 5; S.monedas += n; msg = "🎁 ¡Regalo! +" + n + " monedas"; }
    else if (r < 0.62) { S.turbo = 5; msg = "🎁 ¡Regalo! Turbo extra"; }
    else if (r < 0.80) { if (S.vidas < VIDAS) { S.vidas++; pintaVidas(); msg = "🎁 ¡Regalo! Vida extra"; } else { S.escu = 5; msg = "🎁 ¡Regalo! Escudo de 5 s"; } }
    else { S.escu = 5; msg = "🎁 ¡Regalo! Escudo de 5 s"; }
    sonTurbo(); au.rugido(true); for (let k = 0; k < 30; k++) chispas.emite(x, y, 0, rnd(-4, 4), rnd(0, 5), rnd(-3, 3), 0.9);
    aviso(msg, "bien", 2400); pintaHud();
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
    const base = vBase(S.dist), objetivo = S.fase === "choque" ? 0 : base * (S.turbo > 0 ? 1.35 : 1);
    S.v += (objetivo - S.v) * Math.min(1, dt * (S.fase === "choque" ? 3.5 : 1.6));
    const dz = S.v * dt; S.dist += dz;
    if (S.fase === "corre") S.tc += dt;
    const vm = velMov(S.tc);
    if (S.fase === "choque") { S.choque += dt; if (S.choque > 1.1) termina(); }
    /* jugador */
    S.x += (LX[S.lane] - S.x) * Math.min(1, dt * 14);
    if (S.y > 0 || S.vy > 0) { S.vy -= G * dt; S.y += S.vy * dt; if (S.y <= 0) { S.y = 0; S.vy = 0; for (let i = 0; i < 5; i++) polvo.emite(S.x + rnd(-0.3, 0.3), 0.1, rnd(-0.3, 0.3), rnd(-1.2, 1.2), rnd(0.4, 1.6), rnd(0, 2.5), 0.5); } }
    if (S.desl > 0) S.desl -= dt;
    if (S.inv > 0) S.inv -= dt;
    if (S.turbo > 0) S.turbo -= dt; if (S.escu > 0) S.escu -= dt; if (S.iman > 0) S.iman -= dt; if (S.fase === "corre") pintaPoderes();
    /* generación y movimiento */
    if (S.fase === "corre") { S.sig -= dz; if (S.sig <= 0) fila(); }
    const alt = S.desl > 0 ? 0.7 : 1.85;
    for (let i = S.obs.length - 1; i >= 0; i--) {
      const ob = S.obs[i]; ob.z += dz; ob.fa = (ob.fa || 0) + dt * vm;
      if (ob.tipo === "entrada" && ob.z > -26 && !ob.golpe) { ob.z += 6 * dt; ob.extra = Math.min(1, ob.extra + dt * 3); }
      if (ob.golpe && ob.golpe > 1) { /* derribado en turbo: sale volando */ ob.z += 0; }
      if (ob.tipo === "pelotazo") ob.z += 11 * dt * vm;
      if (ob.tipo === "arbitro") ob.z += 4 * dt * vm;
      if (ob.tipo === "recogepelotas") ob.z += 9 * dt * vm;
      if (ob.z > Z_FIN) { suelta(ob); S.obs.splice(i, 1); continue; }
      if (ob.tipo === "rodante") ob.x = 2.9 * Math.sin(ob.fa * 1.4 + ob.ph);
      else if (ob.tipo === "dron") ob.x = 2.7 * Math.sin(ob.fa * 1.2 + ob.ph);
      else if (ob.tipo === "extremo") ob.x = lerp(LX[ob.lane], LX[ob.lane + 1], 0.5 + 0.5 * Math.sin(ob.fa * 2.6 + ob.ph));
      else if (ob.tipo === "carro") ob.x = 3.3 * Math.sin(ob.fa * 2.1 + ob.ph);
      else if (ob.tipo === "mascota") { const u = ob.fa * 0.75 + ob.ph, k = Math.floor(u), f = u - k, sq = [0, 1, 2, 1], a = LX[sq[k % 4]], b2 = LX[sq[(k + 1) % 4]], e = clamp(f * 1.6 - 0.2, 0, 1); ob.x = lerp(a, b2, e * e * (3 - 2 * e)); ob.y = Math.sin(e * Math.PI) * 0.45; }
      else if (ob.tipo === "pelotazo") ob.x = LX[ob.lane];
      else if (ob.tipo === "botando") { ob.x = LX[ob.lane]; ob.y = 0.4 + Math.abs(Math.sin(ob.fa * 3.6 + ob.ph)) * 2.4; }
      else if (ob.tipo === "arbitro") { const u = clamp((ob.z + 56) / 26, 0, 1); ob.x = lerp(LX[ob.lane], LX[ob.lane2 === undefined ? ob.lane : ob.lane2], u * u * (3 - 2 * u)); }
      else if (ob.tipo === "portero") ob.x = 3.0 * Math.sin(ob.fa * 1.7 + ob.ph);
      else if (ob.tipo === "barrera") ob.x = 2.2 * Math.sin(ob.fa * 0.9 + ob.ph);
      else if (ob.tipo === "tarjeta") { ob.x = 3.0 * Math.sin(ob.fa * 1.3 + ob.ph); ob.y = 1.55 + Math.sin(ob.fa * 3 + ob.ph) * 0.08; }
      else if (ob.tipo === "recogepelotas") ob.x = LX[ob.lane];
      else if (ob.tipo === "ultra") ob.x = lerp(LX[ob.lane], LX[ob.lane + 1], 0.5 + 0.5 * Math.sin(ob.fa * 3.4 + ob.ph));
      else if (ob.tipo === "steward") ob.x = 2.6 * Math.sin(ob.fa * 2.0 + ob.ph);
      else if (ob.tipo === "bengala") ob.x = LX[ob.lane];
      else if (ob.tipo === "camillero") ob.x = 2.2 * Math.sin(ob.fa * 1.2 + ob.ph);
      else if (ob.tipo === "cortacesped") ob.x = 3.4 * Math.sin(ob.fa * 1.5 + ob.ph);
      if (S.fase !== "corre" || ob.golpe) continue;
      if (S.iman > 0 && ob.tipo === "moneda" && ob.z > -17 && ob.z < 4) { if (ob.x === undefined) ob.x = LX[ob.lane]; const kk = Math.min(1, dt * 8); ob.x += (S.x - ob.x) * kk; ob.y += (S.y + 0.95 - ob.y) * kk; ob.z -= ob.z * Math.min(1, dt * 5); }
      const x = ob.x !== undefined ? ob.x : ob.lane < 0 ? 0 : LX[ob.lane], dx = Math.abs(S.x - x), dzz = Math.abs(ob.z);
      if (ob.tipo === "moneda" || ob.tipo === "bota" || ob.tipo === "caja" || ob.tipo.indexOf("pw_") === 0) {
        const gr = ob.tipo === "caja" || ob.tipo.indexOf("pw_") === 0;
        if (dx < (gr ? 1.3 : 1.05) && dzz < (gr ? 1.3 : 0.9) && Math.abs(ob.y - (S.y + (S.desl > 0 ? 0.4 : 0.95))) < (ob.tipo === "moneda" ? 1.0 : 1.4)) {
          ob.golpe = 2; suelta(ob); S.obs.splice(i, 1);
          if (ob.tipo === "moneda") { S.monedas++; sonMoneda(); for (let k = 0; k < 7; k++) chispas.emite(x, ob.y, 0, rnd(-2.5, 2.5), rnd(0.5, 4), rnd(-2, 2), 0.55); }
          else if (ob.tipo.indexOf("pw_") === 0) daPoder(ob.tipo, x, ob.y);
          else if (gr) regalo(x, ob.y);
          else { S.turbo = 5; sonTurbo(); aviso("¡TURBO!", "oro", 1200); for (let k = 0; k < 24; k++) chispas.emite(x, 1, 0, rnd(-4, 4), rnd(0, 5), rnd(-3, 3), 0.8); }
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
      else if (ob.tipo === "rodante") choca = dx < 0.95 && dzz < 0.7 && S.y < 1.0;
      else if (ob.tipo === "extremo") choca = dx < 0.85 && dzz < 0.6 && S.y < 1.9;
      else if (ob.tipo === "botando") choca = dx < 0.8 && dzz < 0.6 && ob.y - 0.36 < S.y + alt && ob.y + 0.36 > S.y;
      else if (ob.tipo === "carro") choca = dx < 1.05 && dzz < 0.7 && S.y < 0.85;
      else if (ob.tipo === "mascota") choca = dx < 0.95 && dzz < 0.65 && S.y < 1.9 + ob.y;
      else if (ob.tipo === "pelotazo") choca = dx < 0.75 && dzz < 0.8 && S.y < 0.8;
      else if (ob.tipo === "arbitro") choca = dx < 0.85 && dzz < 0.6 && S.y < 1.9;
      else if (ob.tipo === "portero") choca = dx < 1.1 && dzz < 0.6 && S.y < 1.9;
      else if (ob.tipo === "recogepelotas") choca = dx < 0.8 && dzz < 0.6 && S.y < 1.9;
      else if (ob.tipo === "camillero") choca = dzz < 0.7 && ((Math.abs(S.x - (x - 1.15)) < 0.8 || Math.abs(S.x - (x + 1.15)) < 0.8) ? S.y < 1.9 : dx < 1.4 && S.y < 0.85);
      else if (ob.tipo === "barrera") choca = dx < 1.75 && dzz < 0.6 && S.y < 1.9;
      else if (ob.tipo === "tarjeta") choca = dx < 1.0 && dzz < 0.45 && S.y + alt > 1.2 && S.y < 2.3;
      else if (ob.tipo === "cortacesped") choca = dx < 1.0 && dzz < 0.8 && S.y < 0.8;
      else if (ob.tipo === "ultra") choca = dx < 0.85 && dzz < 0.6 && S.y < 1.9;
      else if (ob.tipo === "steward") choca = dx < 1.05 && dzz < 0.6 && S.y < 1.9;
      else if (ob.tipo === "bengala") choca = dx < 0.8 && dzz < 0.5 && S.y < 0.75;
      else if (ob.tipo === "dron") choca = dx < 1.0 && dzz < 0.6 && S.y + alt > 1.05 && S.y < 1.75;
      if (!choca) continue;
      if (S.turbo > 0 || S.escu > 0) { ob.golpe = 2; S.bonus += 25; sonGolpe(); S.shake = reducido ? 0 : 0.2; for (let k = 0; k < 12; k++) chispas.emite(x, 0.9, ob.z, rnd(-4, 4), rnd(1, 5), rnd(-3, 1), 0.7); suelta(ob); S.obs.splice(i, 1); }
      else if (S.inv <= 0) golpea(ob);
    }
    if (S.fase === "corre") {
      S.pts = Math.floor(S.dist) + S.monedas * 10 + S.bonus;
      /* hitos */
      if (!S.tiki && S.dist >= META_TIKI) { S.tiki = true; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } aviso("¡" + META_TIKI + " m! ⚡ +1 tikitexto", "bien", 2200); au.rugido(true); }
      else if (Math.floor(S.dist / 500) > S.hito) { S.hito = Math.floor(S.dist / 500); aviso("¡" + Math.floor(S.dist / 100) * 100 + " m!", "bien sl-aviso--peq", 800); }
      const tramo = Math.floor(S.dist / TRAMO);
      if (tramo > S.tema) { S.tema = tramo; aviso(ESC[tramo % ESC.length].nombre, "oro sl-aviso--peq", 1000); S.hito = Math.floor(S.dist / 500); }
      const nv = nivelDe(S.tc); if (nv > S.nivel) { S.nivel = nv; cartelNivel(nv); }
      if (Math.floor(S.dist / 1000) > S.vidaHito) { S.vidaHito = Math.floor(S.dist / 1000); if (S.vidas < VIDAS) { S.vidas++; pintaVidas(); aviso("¡Vida recuperada!", "bien", 1500); } }
      pintaHud();
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
    const et = Math.floor(S.dist / TRAMO), u = S.dist / TRAMO - et; aplicaEsc(et, clamp((u - 0.55) / 0.45, 0, 1));
    ambienteInf(dt, dz);
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
    if ((S.fase === "corre" || S.fase === "menu") && estelaAct.cols && !reducido) { const cs = estelaAct.cols; for (let q = 0; q < 2; q++) { const col = cs[irnd(cs.length)]; (estSis[col] || (estSis[col] = crearParticulas(scene, 70, col, 0.3, true))).emite(S.x + rnd(-0.2, 0.2), S.y + 0.2 + rnd(0, 0.3), 0.35, rnd(-0.5, 0.5), rnd(0.2, 1.3), rnd(2, 5), 0.6); } }
    /* obstáculos */
    S.obs.forEach(function (ob, i) {
      const m = ob.m; if (!m) return;
      if (ob.tipo === "def") { colocaObj(ob); POSES.quieto(m, T + i, true); m.raiz.rotation.y = 0; m.raiz.position.x += Math.sin(T * 2 + ob.ph) * 0.12; }
      else if (ob.tipo === "entrada") { colocaObj(ob); if (ob.extra > 0.01) poseDesliza(m, ob.extra); else POSES.quieto(m, T + i, true); m.raiz.rotation.y = 0; }
      else if (ob.tipo === "extremo") { colocaObj(ob); POSES.carrera(m, 0.9, T * 11 + i); m.raiz.rotation.y = Math.PI + Math.cos(T * 2.6 + ob.ph) * 0.5; }
      else if (ob.tipo === "rodante") { m.position.set(ob.x === undefined ? 0 : ob.x, 0, ob.z); m.userData.bola.rotation.x = T * 6; m.userData.bola.rotation.z = T * 2; }
      else if (ob.tipo === "botando") { m.position.set(ob.x === undefined ? LX[ob.lane] : ob.x, 0, ob.z); m.userData.bola.position.y = ob.y; const k = 0.5 + 0.5 * clamp(1 - ob.y / 2.8, 0, 1); m.userData.so.scale.set(k, k, k); m.userData.bola.rotation.x = T * 5; }
      else if (ob.tipo === "dron") { m.position.set(ob.x === undefined ? 0 : ob.x, ob.y, ob.z); m.rotation.z = Math.cos(T * 1.2 + ob.ph) * 0.18; m.userData.rot.forEach((r, q) => { r.rotation.y = T * 40 + q; }); }
      else if (ob.tipo === "carro") { m.position.set(ob.x === undefined ? 0 : ob.x, 0, ob.z); m.rotation.y = Math.cos(T * 2.1 + ob.ph) > 0 ? -0.5 : 0.5; }
      else if (ob.tipo === "mascota") { m.position.set(ob.x === undefined ? 0 : ob.x, ob.y, ob.z); m.userData.cuerpo.scale.y = 1.15 + Math.sin(T * 9 + ob.ph) * 0.06; m.rotation.y = Math.PI * 0 + Math.sin(T * 3 + ob.ph) * 0.3; }
      else if (ob.tipo === "pelotazo") { m.position.set(LX[ob.lane], 0, ob.z); m.userData.bola.rotation.x = -T * 14; const k = 1.7 + Math.sin(T * 20) * 0.2; m.userData.fu.scale.set(k, k, 1); }
      else if (ob.tipo === "arbitro") { m.position.set(ob.x === undefined ? LX[ob.lane] : ob.x, 0, ob.z); const f = m.userData.f; POSES.carrera(f, 0.9, T * 13 + ob.ph); f.brD.s.rotation.x = -2.9; f.brD.e.rotation.x = -0.15; f.raiz.rotation.y = Math.sin(T * 2 + ob.ph) * 0.15; }
      else if (ob.tipo === "portero") { m.position.set(ob.x === undefined ? 0 : ob.x, 0, ob.z); const f = m.userData.f, c = Math.cos(ob.fa * 1.7 + ob.ph); POSES.parada(f, 1, c < 0 ? -1 : 1, 1.0); m.rotation.z = c * 0.3; m.rotation.y = c < 0 ? 0.5 : -0.5; }
      else if (ob.tipo === "barrera") { m.position.set(ob.x === undefined ? 0 : ob.x, 0, ob.z); m.userData.fs.forEach((f, q) => { POSES.quieto(f, T + q, true); f.brI.s.rotation.x = -0.9; f.brD.s.rotation.x = -0.9; f.brI.e.rotation.x = -1.2; f.brD.e.rotation.x = -1.2; f.cadera.position.y += Math.abs(Math.sin(T * 5 + q)) * 0.05; }); }
      else if (ob.tipo === "recogepelotas") { m.position.set(LX[ob.lane], 0, ob.z); POSES.carrera(m.userData.f, 0.95, T * 15 + ob.ph); m.userData.bola.rotation.x = T * 9; m.userData.bola.position.y = 1.1 + Math.abs(Math.sin(T * 15)) * 0.06; }
      else if (ob.tipo === "camillero") { m.position.set(ob.x === undefined ? 0 : ob.x, 0, ob.z); const dir = Math.cos(ob.fa * 1.2 + ob.ph) >= 0 ? 1 : -1; m.userData.fs.forEach((f, q) => { POSES.carrera(f, 0.8, T * 10 + q * 0.7); f.brI.s.rotation.x = -0.45; f.brD.s.rotation.x = -0.45; f.brI.e.rotation.x = -0.5; f.brD.e.rotation.x = -0.5; f.raiz.rotation.y = dir * Math.PI / 2; }); }
      else if (ob.tipo === "tarjeta") { m.position.set(ob.x === undefined ? 0 : ob.x, ob.y, ob.z); m.userData.c.rotation.y = Math.sin(T * 2.4 + ob.ph) * 0.9; m.userData.c.rotation.z = Math.sin(T * 2 + ob.ph) * 0.25; }
      else if (ob.tipo === "cortacesped") { m.position.set(ob.x === undefined ? 0 : ob.x, 0, ob.z); m.rotation.y = Math.cos(ob.fa * 1.5 + ob.ph) > 0 ? -0.5 : 0.5; m.position.y = Math.sin(T * 40) * 0.015; }
      else if (ob.tipo === "caja") { m.position.set(LX[ob.lane], 1.0 + Math.sin(T * 3) * 0.12, ob.z); m.rotation.y = T * 2.2; const k = 2.4 + Math.sin(T * 6) * 0.3; m.userData.sp.scale.set(k, k, 1); }
      else if (ob.tipo === "ultra") { colocaObj(ob); const f = m.userData.f; POSES.carrera(f, 0.95, T * 13 + ob.ph); f.brD.s.rotation.x = -2.8; f.brD.e.rotation.x = -0.2; f.raiz.rotation.y = Math.PI + Math.cos(ob.fa * 3.4 + ob.ph) * 0.5; const k = 1.1 + Math.sin(T * 24 + ob.ph) * 0.18; m.userData.fu.scale.set(k, k * 1.5, 1); }
      else if (ob.tipo === "steward") { colocaObj(ob); const f = m.userData.f; POSES.carrera(f, 0.55, T * 9 + ob.ph); f.brI.s.rotation.z = 1.2; f.brD.s.rotation.z = -1.2; f.brI.e.rotation.x = -0.2; f.brD.e.rotation.x = -0.2; f.raiz.rotation.y = Math.PI + Math.cos(ob.fa * 2.0 + ob.ph) * 0.4; }
      else if (ob.tipo === "bengala") { m.position.set(LX[ob.lane], 0, ob.z); const u = m.userData; const k1 = 1.5 + Math.sin(T * 22 + ob.ph) * 0.3, k2 = 1.0 + Math.sin(T * 31 + ob.ph) * 0.25; u.f1.scale.set(k1, k1 * 1.5, 1); u.f2.scale.set(k2, k2 * 1.4, 1); }
      else if (ob.tipo.indexOf("pw_") === 0) { m.position.set(LX[ob.lane], 1.15 + Math.sin(T * 3 + ob.ph) * 0.12, ob.z); const u = m.userData, h = (T * 0.7 + ob.ph * 0.15) % 1; u.ico.rotation.y = T * 2.4; u.au.material.color.setHSL(h, 1, 0.55); const k = 3.3 + Math.sin(T * 5) * 0.35; u.au.scale.set(k, k, 1); u.an.material.color.setHSL((h + 0.5) % 1, 1, 0.6); u.an.rotation.x = T * 2.2; u.an.rotation.y = T * 1.5; }
      else if (ob.tipo === "moneda") { m.position.set(ob.x !== undefined ? ob.x : LX[ob.lane], ob.y + Math.sin(T * 4 + ob.ph) * 0.08, ob.z); m.rotation.y = T * 4.5 + ob.ph; }
      else if (ob.tipo === "bota") { m.position.set(LX[ob.lane], 1.1 + Math.sin(T * 5) * 0.15, ob.z); const k = 1.4 + Math.sin(T * 8) * 0.15; m.userData.sp.scale.set(k, k, 1); }
      else { m.position.set(ob.lane < 0 ? 0 : LX[ob.lane], 0, ob.z); }
    });
    /* esfera de protección (rayo y escudo) y anillo del imán */
    { const pr = Math.max(S.turbo, S.escu), ey = S.y + (S.desl > 0 ? 0.65 : 0.95);
      mundo.esfera.visible = pr > 0 && S.fase !== "fin"; if (mundo.esfera.visible) { mundo.esfera.position.set(S.x, ey, 0.1); const pul = 1 + Math.sin(T * 6) * 0.03; mundo.esfera.scale.setScalar(pul); mundo.esfera.userData.m.opacity = (pr < 1 ? (Math.floor(T * 12) % 2 ? 0.1 : 0.3) : 0.3); mundo.esfera.rotation.y = T; }
      mundo.imanR.visible = S.iman > 0 && S.fase !== "fin"; if (mundo.imanR.visible) { mundo.imanR.position.set(S.x, ey, 0.1); mundo.imanR.rotation.x = Math.PI / 2 + Math.sin(T * 3) * 0.2; const k = 1.5 + Math.sin(T * 7) * 0.12; mundo.imanR.scale.setScalar(k); mundo.imanR.material.opacity = S.iman < 1 && Math.floor(T * 12) % 2 ? 0.2 : 0.85; } }
    /* partículas y líneas de velocidad */
    chispas.paso(dt, dz); polvo.paso(dt, dz); Object.keys(estSis).forEach((k) => estSis[k].paso(dt, dz)); pasoClima(dt, dz);
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
    S.t += dt; const d0 = S.dist, n = Math.max(1, Math.ceil(dt / 0.02)); for (let i = 0; i < n; i++) logica(dt / n); dibuja(dt, S.dist - d0);
  }

  /* ── entrada ── */
  let tocando = false, usado = false, sx = 0, sy = 0;
  raiz.addEventListener("pointerdown", function (e) {
    audioIni(); au.iniciar();
    if (e.target.closest && e.target.closest("[data-sl], [data-menu], [data-fin], [data-vest], .sl-cab")) return;
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
    else if (b.dataset.sl === "vest") { pintaKits(); $("[data-vest]").hidden = false; } else if (b.dataset.sl === "vestcerrar") $("[data-vest]").hidden = true;
  });
  raiz.addEventListener("click", function (e) { const b = e.target.closest ? e.target.closest("[data-kit]") : null; if (b) elegirKit(b.dataset.kit); });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    const k = e.key.toLowerCase();
    if (!$("[data-vest]").hidden) return;
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
  pintaRecord(); pintaVidas(); pintaHud(); pintaSaldo();
  if (E) raf = requestAnimationFrame(function (n) { ultimo = n; bucle(n); });
  /* Solo para las pruebas automáticas */
  return { nivelDe: nivelDe, cartelNivel: cartelNivel, PODERES: PODERES, INFERNAL: INFERNAL, ESC: ESC, vBase: vBase, NUEVOS: NUEVOS, velMov: velMov, espaciado: espaciado, filasExtra: filasExtra, regalo: regalo, VEST: VEST, aplicaEsc: aplicaEsc, mats: () => mundo.matMon, clima: () => clima, cerrar: cerrar, S: S, E: E, empezar: empezar, mover: mover, saltar: saltar, deslizar: deslizar, logica: logica, fila: fila, pon: pon, limpia: limpiaObs, LX: LX, regalo: regalo, KIT_J: KIT_J, elegirKit: elegirKit, pintaKits: pintaKits };
}
