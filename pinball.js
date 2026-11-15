/* PINBALL GOLAZO · el flíper del fútbol (15-nov-2026)
   Módulo ES que se importa al abrir el modo (lanzador en index.html). Todo es propio: física, dibujo en <canvas> y sonidos sintetizados.
   Sin escudos, fotos ni logos. Respeta TIKI.ajustes.sonido() y prefers-reduced-motion. */

const W = 400, H = 720, R = 10;          // mesa lógica y radio de la bola
const G = 1250, VMAX = 1800, SUB = 8;    // gravedad, velocidad máxima y subpasos de física por fotograma
const PI = Math.PI;
const FL = { L: 62, r0: 11, r1: 6.5, sube: 22, baja: 12 };   // flíper: largo, radios y velocidades (rad/s)
const FLIP = [
  { piv: [118, 648], rest: 0.46, act: -0.52 },
  { piv: [282, 648], rest: PI - 0.46, act: PI + 0.52 },
];
const BUMPERS = [
  { x: 108, y: 212, r: 21, c: "#19e6ff", n: "9" },
  { x: 292, y: 212, r: 21, c: "#ff3dcb", n: "10" },
  { x: 200, y: 292, r: 21, c: "#ffe94a", n: "7" },
  { x: 200, y: 418, r: 17, c: "#41ff8a", n: "4" },
];
const ROLLOS = [
  { x: 120, y: 132, l: "T" }, { x: 170, y: 132, l: "I" }, { x: 230, y: 132, l: "K" }, { x: 280, y: 132, l: "I" },
];
const POSTES = [{ x: 163, y: 66, r: 5 }, { x: 237, y: 66, r: 5 }];
const PUNTOS_TIKI = [40000, 120000];       // +1 tikitexto al llegar a cada marca (máximo 2 por partida)
const PUNTOS_EXTRA = 80000;               // balón extra
const DEPOSITO = [372, 688];              // dónde espera la bola antes del saque

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rnd = (a, b) => a + Math.random() * (b - a);

/* ── Geometría estática: segmentos contra los que rebota la bola ── */
function crearMesa() {
  const segs = [];
  const add = (x1, y1, x2, y2, o) => segs.push(Object.assign({ x1: x1, y1: y1, x2: x2, y2: y2, e: 0.42, k: 0, th: 0 }, o || {}));
  const N = 28, cx = 200, cy = 200, r = 186;
  let px = cx - r, py = cy;
  for (let i = 1; i <= N; i++) {
    const th = PI + PI * i / N, x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
    add(px, py, x, y, { e: 0.34, arco: 1 }); px = x; py = y;
  }
  add(14, 200, 14, 548, { e: 0.4 });                    // pared izquierda
  add(386, 200, 386, 706, { e: 0.4 });                  // pared derecha del carril
  add(14, 548, 118, 646, { e: 0.3 });                   // guía izquierda hacia el flíper
  add(358, 548, 282, 646, { e: 0.3 });                  // guía derecha
  add(358, 254, 358, 706, { e: 0.4 });                  // separador del carril
  add(358, 254, 340, 268, { e: 0.3 });                  // tapa del separador (cae hacia dentro)
  add(358, 706 - 0.01, 386, 706, { e: 0.1 });           // suelo del carril
  const gate = { x1: 386, y1: 230, x2: 357, y2: 246 };  // compuerta de un solo sentido: deja subir, no bajar
  const gl = Math.hypot(gate.x2 - gate.x1, gate.y2 - gate.y1);
  add(gate.x1, gate.y1, gate.x2, gate.y2, { e: 0.2, un: [-(gate.y2 - gate.y1) / gl, (gate.x2 - gate.x1) / gl] });
  add(48, 478, 92, 562, { e: 0.55, k: 520, sling: 0 }); // tirachinas izquierdo
  add(352, 478, 308, 562, { e: 0.55, k: 520, sling: 1 }); // tirachinas derecho
  add(14, 372, 14, 410, { e: 0.5, diana: 0 });         // «tarjetas amarillas» (dianas laterales)
  add(358, 372, 358, 410, { e: 0.5, diana: 1 });
  // cunas de seguridad sobre el arco para que no se quede pegada arriba
  return segs;
}

export function precargar() { return Promise.resolve(); }

/* ── Audio sintetizado (sin archivos) ── */
function crearAudio(api) {
  let ac = null, master = null, buf = null;
  function ok() {
    if (!api.sonido || !api.sonido()) return false;
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = 0.55; master.connect(ac.destination);
        const n = ac.sampleRate * 2; buf = ac.createBuffer(1, n, ac.sampleRate);
        const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { ac = null; return false; }
    }
    if (ac.state === "suspended") { try { ac.resume(); } catch (e) { /* opcional */ } }
    return true;
  }
  function tono(f, d, tipo, v, f2, ret) {
    if (!ok()) return;
    const t0 = ac.currentTime + (ret || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + d + 0.03);
  }
  function ruido(d, v, f1, f2, q, ret, suave) {
    if (!ok()) return;
    const t0 = ac.currentTime + (ret || 0), s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = buf; s.loop = true; fl.type = "bandpass"; fl.Q.value = q || 1;
    fl.frequency.setValueAtTime(f1, t0); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t0 + d);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t0 + (suave ? d * 0.35 : 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t0, Math.random()); s.stop(t0 + d + 0.05);
  }
  return {
    activar: ok,
    flip: () => { ruido(0.08, 0.5, 700, 180, 1.2); tono(120, 0.09, "square", 0.16, 55); },
    bumper: (n) => { tono(330 + (n % 5) * 70, 0.16, "triangle", 0.3, 760 + (n % 5) * 70); ruido(0.06, 0.25, 2400, 900, 2); },
    sling: () => { tono(180, 0.12, "sawtooth", 0.2, 520); ruido(0.07, 0.3, 3000, 1200, 2); },
    diana: () => { tono(520, 0.07, "square", 0.2, 380); ruido(0.05, 0.3, 1800, 1200, 3); },
    rollo: (n) => tono(660 * Math.pow(1.122, n), 0.2, "sine", 0.3),
    palo: () => { tono(1240, 0.5, "sine", 0.34); tono(1860, 0.4, "sine", 0.18); },
    lanza: (p) => { ruido(0.35, 0.5, 300, 600 + p * 3000, 0.9); tono(90, 0.25, "sine", 0.4, 40); },
    parada: () => { tono(420, 0.45, "sawtooth", 0.2, 140); ruido(0.18, 0.4, 900, 300, 1.4); },
    cae: () => { tono(420, 0.7, "triangle", 0.3, 70); },
    guardada: () => { tono(520, 0.12, "square", 0.2); tono(780, 0.18, "square", 0.2, 0, 0.12); },
    gol: () => {
      ruido(2.2, 0.8, 500, 1500, 0.7, 0, true); ruido(1.6, 0.5, 1800, 700, 1.2, 0.2, true);
      [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.25, "square", 0.16, 0, 0.05 + i * 0.09));
      for (let i = 0; i < 6; i++) ruido(0.05, 0.4, 2500, 1500, 3, 0.4 + i * 0.13);
    },
    multi: () => [392, 523, 659, 784, 1047].forEach((f, i) => tono(f, 0.2, "triangle", 0.26, 0, i * 0.07)),
    extra: () => [659, 880, 1175].forEach((f, i) => tono(f, 0.3, "sine", 0.3, 0, i * 0.1)),
    tiki: () => [440, 554, 659, 880].forEach((f, i) => tono(f, 0.16, "square", 0.18, 0, i * 0.06)),
    fin: () => [440, 370, 311, 220].forEach((f, i) => tono(f, 0.3, "triangle", 0.28, 0, i * 0.18)),
  };
}

const PLANTILLA = `
<div class="pb-escena" data-escena>
  <div class="pb-foco pb-foco--i" aria-hidden="true"></div><div class="pb-foco pb-foco--d" aria-hidden="true"></div>
  <canvas class="pb-cv" data-cv></canvas>
</div>
<div class="pb-cab">
  <button type="button" class="pb-btn" data-pb="salir" aria-label="Salir">✕</button>
  <div class="pb-marcador"><small>Puntos</small><b data-pts data-no-t>0</b></div>
  <button type="button" class="pb-btn" data-pb="pausa" aria-label="Pausa">❚❚</button>
</div>
<div class="pb-sub">
  <span class="pb-bolas" data-bolas data-no-t></span>
  <span class="pb-mult" data-mult data-no-t>×1</span>
  <span class="pb-tiki" data-tiki data-no-t><i>T</i><i>I</i><i>K</i><i>I</i></span>
</div>
<p class="pb-pista" data-pista></p>
<div class="pb-potencia" data-pot hidden><i data-potbar></i></div>
<div class="pb-menu" data-menu>
  <div class="pb-caja">
    <p class="pb-kicker">El flíper del fútbol</p>
    <h2 class="pb-titulo" data-no-t><span>PINBALL</span><span>GOLAZO</span></h2>
    <svg class="pb-balon" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="#fff"/><path d="M32 19l11 8-4 13H25l-4-13z" fill="#0b1226"/><path d="M32 19V6M43 27l14-5M39 40l9 12M25 40l-9 12M21 27 7 22" stroke="#0b1226" stroke-width="3" stroke-linecap="round" fill="none"/></svg>
    <p class="pb-mejor"><span>Mejor puntuación</span> <b data-mejor data-no-t>0</b></p>
    <button type="button" class="pb-jugar" data-pb="jugar">Jugar</button>
    <ul class="pb-como">
      <li><b>1</b><span>Mantén pulsado para cargar el chut y suelta para sacar.</span></li>
      <li><b>2</b><span>Toca el lado izquierdo o derecho (o usa ← → / Z M) para mover las botas.</span></li>
      <li><b>3</b><span>Mete la bola en la portería para marcar. Completa T-I-K-I para multiplicar.</span></li>
    </ul>
  </div>
</div>
<div class="pb-pausa" data-pausa hidden>
  <div class="pb-caja pb-caja--s"><h3>Pausa</h3>
    <button type="button" class="pb-jugar" data-pb="seguir">Continuar</button>
    <button type="button" class="pb-sec" data-pb="salir">Salir</button></div>
</div>
<div class="pb-fin" data-fin hidden>
  <div class="pb-caja pb-caja--s"><p class="pb-kicker">Final del partido</p>
    <h3 data-no-t data-finpts>0</h3>
    <p class="pb-nuevo" data-nuevo hidden>🏆 Nuevo récord</p>
    <p class="pb-datos"><span>Goles</span> <b data-fingol data-no-t>0</b> · <span>Mejor puntuación</span> <b data-finmejor data-no-t>0</b></p>
    <p class="pb-tikis" data-fintiki hidden>🎁 +1 tikitexto</p>
    <button type="button" class="pb-jugar" data-pb="jugar">Volver a jugar</button>
    <button type="button" class="pb-sec" data-pb="salir">Salir</button></div>
</div>`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  const movil = (window.matchMedia && matchMedia("(pointer: coarse)").matches) || /Android|iPhone|iPad/i.test(navigator.userAgent);
  const reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  raiz.innerHTML = PLANTILLA;
  raiz.classList.toggle("pb-tactil", movil);
  const $ = (s) => raiz.querySelector(s);
  const cv = $("[data-cv]"), ctx = cv.getContext("2d"), escena = $("[data-escena]");
  const au = crearAudio(api);
  const segs = crearMesa();
  const fam = getComputedStyle(raiz).fontFamily || "system-ui, sans-serif";
  const datos = () => {
    const d = api.datos();
    ["mejor", "part", "gol", "multi"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; });
    return d;
  };

  /* ── Estado del juego ── */
  const S = {
    fase: "menu", t: 0, pts: 0, vidas: 3, mult: 1, tiki: [0, 0, 0, 0], tikis: 0, goles: 0, golesTot: 0, bolas: [], esperando: null,
    carga: 0, cargando: false, salvar: 0, slow: 1, flash: 0, shake: 0, pausa: false, racha: 0, rachaT: 0, extra: false,
    premios: 0, diana: [0, 0], keeper: { x: 200, vx: 0, f: 1 }, goalT: 0, multiAct: false, nuevoRecord: false, hits: 0,
  };
  const F = FLIP.map((f) => ({ piv: f.piv, rest: f.rest, act: f.act, a: f.rest, w: 0, on: false }));
  const entrada = { izq: false, der: false };
  let sc = 1, dpr = 1, estatica = null, raf = 0, ultimo = 0, vivo = true;
  const parts = [], popups = [], flashB = [0, 0, 0, 0], flashS = [0, 0], flashD = [0, 0], flashR = [0, 0, 0, 0], flashP = [0, 0];
  let pts_mostrado = -1;

  /* ── Interfaz ── */
  function pintarPts() {
    const e = $("[data-pts]"); const v = Math.floor(S.pts).toLocaleString(api.locale || undefined);
    if (e.textContent !== v) { e.textContent = v; e.classList.remove("pb-sube"); void e.offsetWidth; e.classList.add("pb-sube"); }
  }
  function pintarHud() {
    const b = $("[data-bolas]"); let h = "";
    for (let i = 0; i < Math.max(3, S.vidas); i++) h += '<s class="' + (i < S.vidas ? "ok" : "ko") + '"></s>';
    if (b.innerHTML !== h) b.innerHTML = h;
    $("[data-mult]").textContent = "×" + S.mult;
    $("[data-mult]").classList.toggle("pb-mult--alto", S.mult > 1);
    const ii = raiz.querySelectorAll("[data-tiki] i");
    ii.forEach((el, i) => el.classList.toggle("on", !!S.tiki[i]));
  }
  function pista(txt) { const p = $("[data-pista]"); p.textContent = txt ? t(txt) : ""; p.classList.toggle("on", !!txt); }
  function popup(txt, x, y, c, sz, vida) {
    if (popups.length > 14) popups.shift();
    popups.push({ txt: txt, x: x, y: y, c: c || "#fff", sz: sz || 18, t: 0, max: vida || 1.1, vy: -38 });
  }
  function aviso(txt, c, sz, vida) { popup(t(txt), W / 2, 330, c, sz || 40, vida || 1.5); popups[popups.length - 1].vy = -10; popups[popups.length - 1].fijo = true; }

  /* ── Efectos ── */
  function chispas(x, y, n, col, vel, tipo) {
    if (reducido) n = Math.ceil(n / 3);
    for (let i = 0; i < n && parts.length < 420; i++) {
      const a = Math.random() * PI * 2, v = rnd(0.3, 1) * vel;
      parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (tipo === "c" ? vel * 0.5 : 0), life: 0, max: rnd(0.35, 0.9) * (tipo === "c" ? 2.6 : 1), c: col, s: rnd(1.5, 3.6), tipo: tipo || "s", rot: Math.random() * 6, vr: rnd(-9, 9) });
    }
  }
  const COLS_CONF = ["#ff3d6e", "#ffe94a", "#19e6ff", "#41ff8a", "#ff9a1f", "#c77dff", "#ffffff"];
  function confeti(x, y, n) { for (let i = 0; i < n; i++) chispas(x, y, 1, COLS_CONF[i % COLS_CONF.length], 520, "c"); }

  function sumar(n, x, y, txt, col) {
    const v = n * S.mult; S.pts += v; S.racha++; S.rachaT = 1.6;
    if (x !== undefined) popup(txt || ("+" + v), x, y, col || "#fff", txt ? 20 : 15, txt ? 1.3 : 0.8);
    if (S.racha > 0 && S.racha % 12 === 0) { S.pts += 1000 * S.mult; popup(t("¡RACHA!") + " +" + 1000 * S.mult, W / 2, 360, "#ffe94a", 26, 1.4); au.extra(); }
    revisarPremios();
  }
  function revisarPremios() {
    if (!S.extra && S.pts >= PUNTOS_EXTRA) { S.extra = true; S.vidas++; aviso("¡BALÓN EXTRA!", "#41ff8a", 38); au.extra(); pintarHud(); }
    while (S.premios < PUNTOS_TIKI.length && S.pts >= PUNTOS_TIKI[S.premios]) {
      S.premios++;
      try { api.tiki(); } catch (e) { /* opcional */ }
      popup("🎁 +1 tikitexto", W / 2, 400, "#ffe94a", 24, 2.2); popups[popups.length - 1].fijo = true; popups[popups.length - 1].vy = -6;
      S.tikis++;
    }
  }

  /* ── Bolas ── */
  function nuevaBola(x, y, vx, vy) { return { x: x, y: y, vx: vx || 0, vy: vy || 0, rot: 0, tr: [], vivo: true, dentro: 0 }; }
  function servir() {
    S.fase = "saque"; S.carga = 0; S.cargando = false; S.bolas = []; S.salvar = 0;
    S.esperando = nuevaBola(DEPOSITO[0], DEPOSITO[1]);
    S.bolas.push(S.esperando);
    pista(movil ? "Mantén pulsado para cargar y suelta para chutar" : "Mantén pulsado (o Espacio) para cargar y suelta para chutar");
    $("[data-pot]").hidden = false;
  }
  function lanzar() {
    const b = S.esperando; if (!b) return;
    const p = clamp(S.carga, 0, 1), v = 820 + p * 880;
    b.vy = -v; b.vx = rnd(-8, 8); S.esperando = null; S.fase = "juego"; S.salvar = 11; S.cargando = false;
    S.racha = 0; au.lanza(p); chispas(b.x, b.y, 14, "#ffe94a", 260);
    pista(""); $("[data-pot]").hidden = true;
  }
  function perderBola() {
    S.vidas--; S.mult = 1; S.tiki = [0, 0, 0, 0]; S.multiAct = false; pintarHud(); au.cae();
    if (S.vidas <= 0) { finPartida(); return; }
    aviso("Bola perdida", "#ff6b7c", 32, 1.1);
    S.fase = "pierde"; S.tFase = 0;
  }
  function finPartida() {
    S.fase = "fin"; $("[data-pot]").hidden = true; pista("");
    const d = datos(); d.part++; d.gol += S.golesTot;
    S.nuevoRecord = S.pts > d.mejor && S.pts > 0;
    if (S.nuevoRecord) d.mejor = Math.floor(S.pts);
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-finpts]").textContent = Math.floor(S.pts).toLocaleString(api.locale || undefined);
    $("[data-nuevo]").hidden = !S.nuevoRecord;
    $("[data-fingol]").textContent = String(S.golesTot);
    $("[data-finmejor]").textContent = d.mejor.toLocaleString(api.locale || undefined);
    $("[data-fintiki]").hidden = S.tikis === 0;
    au.fin();
    setTimeout(function () { if (vivo && S.fase === "fin") { $("[data-fin]").hidden = false; if (S.nuevoRecord) { try { api.victoria(); } catch (e) { /* opcional */ } } } }, 900);
  }
  function empezar() {
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; $("[data-pausa]").hidden = true;
    S.pts = 0; S.vidas = 3; S.mult = 1; S.tiki = [0, 0, 0, 0]; S.tikis = 0; S.goles = 0; S.golesTot = 0; S.premios = 0; S.extra = false;
    S.diana = [0, 0]; S.pausa = false; S.slow = 1; S.shake = 0; S.flash = 0; S.nuevoRecord = false; S.multiAct = false; S.hits = 0; S.goalT = 0;
    S.keeper = { x: 200, vx: 0, f: 1 }; parts.length = 0; popups.length = 0;
    au.activar(); pintarPts(); pintarHud(); servir();
  }

  /* ── Física ── */
  function rebotar(b, nx, ny, e, k, vsx, vsy) {
    const rvx = b.vx - (vsx || 0), rvy = b.vy - (vsy || 0), vn = rvx * nx + rvy * ny;
    if (vn < 0) { b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny; }
    if (k) { b.vx += nx * k; b.vy += ny * k; }
    return vn;
  }
  function colSeg(b, s, flip, fi) {
    const dx = s.x2 - s.x1, dy = s.y2 - s.y1, l2 = dx * dx + dy * dy;
    let tt = ((b.x - s.x1) * dx + (b.y - s.y1) * dy) / l2; tt = tt < 0 ? 0 : tt > 1 ? 1 : tt;
    const cx = s.x1 + dx * tt, cy = s.y1 + dy * tt;
    let nx = b.x - cx, ny = b.y - cy;
    const th = flip ? FL.r0 + (FL.r1 - FL.r0) * tt : s.th, rr = R + th, d2 = nx * nx + ny * ny;
    if (d2 >= rr * rr) return false;
    if (s.un && (b.x - cx) * s.un[0] + (b.y - cy) * s.un[1] < 0) return false;
    let d = Math.sqrt(d2);
    if (d < 1e-4) { const l = Math.sqrt(l2); nx = dy / l; ny = -dx / l; d = 1e-4; } else { nx /= d; ny /= d; }
    b.x = cx + nx * rr; b.y = cy + ny * rr;
    if (flip) {
      const w = F[fi].w, vsx = -w * (cy - F[fi].piv[1]), vsy = w * (cx - F[fi].piv[0]);
      const vn = rebotar(b, nx, ny, 0.42, 0, vsx, vsy);
      b.toc = 1; if (vn < -250 && Math.abs(w) > 3) { au.flip(); }
      return true;
    }
    const vn = rebotar(b, nx, ny, s.e, 0);
    if (s.k && vn < -90) {
      b.vx += nx * s.k; b.vy += ny * s.k; flashS[s.sling] = 1; b.toc = 1; sumar(50, cx, cy); au.sling(); chispas(cx, cy, 8, "#ffe94a", 280);
    } else if (s.diana !== undefined && vn < -60) {
      golpeDiana(s.diana, cx, cy);
    }
    return true;
  }
  function golpeDiana(i, x, y) {
    flashD[i] = 1; au.diana(); chispas(x, y, 10, "#ffe94a", 260);
    if (!S.diana[i]) { S.diana[i] = 1; sumar(500, x, y, "+" + 500 * S.mult, "#ffe94a"); }
    else sumar(100, x, y);
    if (S.diana[0] && S.diana[1]) {
      S.diana = [0, 0]; sumar(3000, W / 2, 380, "¡" + t("DOBLE AMARILLA") + "! +" + 3000 * S.mult, "#ffe94a"); au.extra();
    }
  }
  function colCirculo(b, c, e, k, tipo, i) {
    const nx0 = b.x - c.x, ny0 = b.y - c.y, rr = R + c.r, d2 = nx0 * nx0 + ny0 * ny0;
    if (d2 >= rr * rr) return;
    const d = Math.max(1e-4, Math.sqrt(d2)), nx = nx0 / d, ny = ny0 / d;
    b.x = c.x + nx * rr; b.y = c.y + ny * rr;
    const vn = rebotar(b, nx, ny, e, 0);
    if (tipo === "bump" && vn < -40) {
      b.vx += nx * k; b.vy += ny * k; flashB[i] = 1; S.hits++; b.toc = 1;
      sumar(100, c.x, c.y - c.r - 6); au.bumper(i); chispas(c.x + nx * c.r, c.y + ny * c.r, 9, c.c, 300);
    } else if (tipo === "palo" && vn < -60) { flashP[i] = 1; sumar(500, c.x, c.y - 14, t("¡AL PALO!") + " +" + 500 * S.mult, "#ffffff"); au.palo(); chispas(c.x, c.y, 12, "#fff", 280); }
  }
  function paso(h) {
    // flíperes
    for (let i = 0; i < 2; i++) {
      const f = F[i], obj = f.on ? f.act : f.rest, v = (f.on ? FL.sube : FL.baja) * h, antes = f.a;
      if (Math.abs(obj - f.a) <= v) f.a = obj; else f.a += Math.sign(obj - f.a) * v;
      f.w = (f.a - antes) / h;
    }
    // portero (cinemático)
    const kp = S.keeper, vk = 1.5 + Math.min(S.goles, 6) * 0.22;
    const nx = 200 + 46 * Math.sin(S.t * vk + 1);
    kp.vx = (nx - kp.x) / h; kp.x = nx;
    const kseg = { x1: kp.x - 14, y1: 82, x2: kp.x + 14, y2: 82, e: 0.55, k: 0, th: 5 };
    for (let bi = 0; bi < S.bolas.length; bi++) {
      const b = S.bolas[bi]; if (!b.vivo || b.dentro > 0) continue;
      if (b === S.esperando) continue;
      b.vy += G * h; b.x += b.vx * h; b.y += b.vy * h;
      const v = Math.hypot(b.vx, b.vy); if (v > VMAX) { b.vx *= VMAX / v; b.vy *= VMAX / v; }
      b.rot += (b.vx / R) * h * 0.7;
      for (let si = 0; si < segs.length; si++) colSeg(b, segs[si], false);
      if (colSeg(b, kseg, false)) { b.vx += kp.vx * 0.3; if (!kp.parada || S.t - kp.parada > 0.4) { kp.parada = S.t; popup(t("¡PARADÓN!"), kp.x, 100, "#ff9a1f", 18, 0.9); au.parada(); chispas(kp.x, 82, 8, "#ff9a1f", 220); } }
      for (let i = 0; i < BUMPERS.length; i++) colCirculo(b, BUMPERS[i], 1, 540, "bump", i);
      for (let i = 0; i < 2; i++) colCirculo(b, POSTES[i], 0.8, 0, "palo", i);
      for (let i = 0; i < 2; i++) {
        const f = F[i], tx = f.piv[0] + FL.L * Math.cos(f.a), ty = f.piv[1] + FL.L * Math.sin(f.a);
        colSeg(b, { x1: f.piv[0], y1: f.piv[1], x2: tx, y2: ty, e: 0.4, k: 0, th: 0 }, true, i);
      }
    }
  }
  function sensores() {
    for (let bi = 0; bi < S.bolas.length; bi++) {
      const b = S.bolas[bi]; if (!b.vivo || b === S.esperando || b.dentro > 0) continue;
      // trampillas T-I-K-I
      for (let i = 0; i < ROLLOS.length; i++) {
        const r = ROLLOS[i];
        if (Math.hypot(b.x - r.x, b.y - r.y) < 15) {
          if (!b["r" + i]) {
            b["r" + i] = 1; flashR[i] = 1;
            if (!S.tiki[i]) { S.tiki[i] = 1; sumar(250, r.x, r.y - 16); au.rollo(S.tiki.filter(Boolean).length); chispas(r.x, r.y, 8, "#19e6ff", 200); pintarHud(); comprobarTiki(r); }
          }
        } else b["r" + i] = 0;
      }
      // gol: la bola entra por la boca de la portería
      if (b.y < 56 && b.x > 176 && b.x < 224) {
        if (!b.toc) { b.y = 58; b.vy = Math.abs(b.vy) * 0.5 + 60; b.vx += rnd(-80, 80); au.palo(); popup(t("¡Antes toca otra!"), 200, 100, "#ffffff", 12, 0.7); }
        else golAnotado(b);
      }
    }
  }
  function comprobarTiki(r) {
    if (S.tiki.every(Boolean)) {
      S.mult = Math.min(5, S.mult + 1); S.tiki = [0, 0, 0, 0];
      sumar(2000, r.x, r.y - 30, "¡T-I-K-I! ×" + S.mult, "#19e6ff"); au.tiki(); S.flash = 0.35; pintarHud();
      chispas(W / 2, 132, 30, "#19e6ff", 420);
    }
  }
  function golAnotado(b) {
    b.dentro = 1.1; b.vx = 0; b.vy = 0; b.x = 200; b.y = 40;
    S.goles++; S.golesTot++; datos(); S.goalT = 1.2; S.slow = 0.35; S.flash = 1; S.shake = reducido ? 0 : 10;
    sumar(3000, W / 2, 290, t("¡GOOOL!") + " +" + 3000 * S.mult, "#41ff8a"); popups[popups.length - 1].sz = 36; popups[popups.length - 1].max = 2;
    au.gol(); confeti(W / 2, 40, 60); chispas(W / 2, 40, 30, "#fff", 480);
    const d = datos(); if (S.goles % 2 === 0) { d.multi++; S.multi_pend = 1; }
  }
  function actualizar(dt) {
    S.t += dt;
    const sdt = dt * S.slow;
    if (S.slow < 1) S.slow = Math.min(1, S.slow + dt * 0.9);
    if (S.flash > 0) S.flash = Math.max(0, S.flash - dt * 1.6);
    if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 28);
    for (let i = 0; i < 4; i++) { flashB[i] = Math.max(0, flashB[i] - dt * 3.5); flashR[i] = Math.max(0, flashR[i] - dt * 1.6); }
    for (let i = 0; i < 2; i++) { flashS[i] = Math.max(0, flashS[i] - dt * 4); flashD[i] = Math.max(0, flashD[i] - dt * 2.2); flashP[i] = Math.max(0, flashP[i] - dt * 2.5); }
    if (S.rachaT > 0) { S.rachaT -= dt; if (S.rachaT <= 0) S.racha = 0; }
    F[0].on = entrada.izq; F[1].on = entrada.der;
    if (S.fase === "saque") {
      if (S.cargando) { S.carga = Math.min(1, S.carga + dt / 1.05); }
      const barra = $("[data-potbar]"); if (barra) barra.style.transform = "scaleY(" + S.carga.toFixed(3) + ")";
      const b = S.esperando; if (b) { b.y = DEPOSITO[1] + S.carga * 14; b.x = DEPOSITO[0]; }
    }
    if (S.fase === "juego" || S.fase === "saque" || S.fase === "pierde") {
      const h = sdt / SUB;
      for (let i = 0; i < SUB; i++) paso(h);
    }
    if (S.fase === "juego") {
      sensores();
      if (S.salvar > 0) S.salvar -= dt;
      // bolas dentro de la portería: salen otra vez por delante del portero
      for (let i = 0; i < S.bolas.length; i++) {
        const b = S.bolas[i];
        if (b.dentro > 0) {
          b.dentro -= dt; b.y = 40 + Math.sin(S.t * 30) * 1.5;
          if (b.dentro <= 0) { b.dentro = 0; b.x = 200 + rnd(-30, 30); b.y = 112; b.vx = rnd(-160, 160); b.vy = 120; chispas(b.x, b.y, 10, "#fff", 200); }
        }
      }
      if (S.multi_pend && S.fase === "juego") { S.multi_pend = 0; multibalon(); }
      // salida por abajo
      let vivas = 0;
      for (let i = 0; i < S.bolas.length; i++) {
        const b = S.bolas[i];
        if (b.vivo && b.y > H + 30) b.vivo = false;
        if (b.vivo) vivas++;
        b.tr.push(b.x, b.y); if (b.tr.length > 24) b.tr.splice(0, 2);
      }
      S.bolas = S.bolas.filter((b) => b.vivo);
      if (vivas === 0) {
        if (S.salvar > 0) { aviso("¡VAR! Repetimos la jugada", "#19e6ff", 28, 1.3); au.guardada(); servir(); }
        else perderBola();
      } else if (S.multiAct && vivas === 1) { S.multiAct = false; }
    }
    if (S.fase === "pierde") {
      S.tFase += dt;
      if (S.tFase > 1.1) { S.bolas = []; servir(); }
    }
    if (S.goalT > 0) S.goalT -= dt;
    // partículas y textos
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life += dt;
      if (p.life >= p.max) { parts.splice(i, 1); continue; }
      p.vy += (p.tipo === "c" ? 520 : 260) * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.tipo === "c") { p.vx *= 0.985; }
    }
    for (let i = popups.length - 1; i >= 0; i--) { const p = popups[i]; p.t += dt; p.y += p.vy * dt; if (p.t >= p.max) popups.splice(i, 1); }
    if (Math.floor(S.pts) !== pts_mostrado) { pts_mostrado = Math.floor(S.pts); pintarPts(); }
  }
  function multibalon() {
    S.multiAct = true; aviso("¡MULTIBALÓN!", "#ff3dcb", 44, 1.8); au.multi(); confeti(W / 2, 100, 30); S.salvar = Math.max(S.salvar, 10);
    for (let i = 0; i < 2; i++) { const b = nuevaBola(200 + (i ? 30 : -30), 112, (i ? 1 : -1) * rnd(120, 220), 160); S.bolas.push(b); }
  }

  /* ── Dibujo ── */
  function rutaMesa(c) {
    c.beginPath(); c.moveTo(14, 200);
    segs.forEach((s) => { if (s.arco) c.lineTo(s.x2, s.y2); });
    c.lineTo(386, 706); c.lineTo(386, 720); c.lineTo(14, 720); c.closePath();
  }
  function crearEstatica() {
    const e = document.createElement("canvas"); e.width = Math.ceil(W * sc * dpr); e.height = Math.ceil(H * sc * dpr);
    const c = e.getContext("2d"); c.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0);
    // césped
    c.save(); rutaMesa(c); c.clip();
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0c4a2b"); g.addColorStop(0.5, "#0f6a3a"); g.addColorStop(1, "#0a3d27");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 60) { c.fillStyle = (y / 60) % 2 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.07)"; c.fillRect(0, y, W, 60); }
    // líneas de campo
    c.strokeStyle = "rgba(255,255,255,.3)"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(14, 400); c.lineTo(358, 400); c.stroke();
    c.beginPath(); c.arc(186, 400, 60, 0, PI * 2); c.stroke();
    c.beginPath(); c.arc(186, 400, 3, 0, PI * 2); c.fillStyle = "rgba(255,255,255,.4)"; c.fill();
    c.strokeRect(110, 14, 150, 120);                       // área grande rival
    c.strokeRect(150, 14, 70, 42);                          // área pequeña
    c.beginPath(); c.arc(185, 134, 34, 0.2 * PI, 0.8 * PI); c.stroke();
    c.beginPath(); c.moveTo(70, 540); c.lineTo(300, 540); c.stroke();
    c.font = "900 54px " + fam; c.textAlign = "center"; c.fillStyle = "rgba(255,255,255,.06)"; c.fillText("GOLAZO", 186, 482);
    // zonas muertas bajo las guías
    c.fillStyle = "#06150e"; c.beginPath(); c.moveTo(14, 548); c.lineTo(118, 646); c.lineTo(118, 720); c.lineTo(14, 720); c.fill();
    c.beginPath(); c.moveTo(358, 548); c.lineTo(282, 646); c.lineTo(282, 720); c.lineTo(358, 720); c.fill();
    c.fillStyle = "#050c14"; c.fillRect(358, 254, 28, 466);
    c.restore();
    // portería: red
    c.save(); c.beginPath(); c.rect(163, 22, 74, 44); c.clip(); c.fillStyle = "rgba(0,0,0,.5)"; c.fillRect(163, 22, 74, 44);
    c.strokeStyle = "rgba(255,255,255,.38)"; c.lineWidth = 1;
    for (let x = 163; x <= 237; x += 7) { c.beginPath(); c.moveTo(x, 22); c.lineTo(x, 66); c.stroke(); }
    for (let y = 22; y <= 66; y += 7) { c.beginPath(); c.moveTo(163, y); c.lineTo(237, y); c.stroke(); }
    c.restore();
    c.strokeStyle = "#fff"; c.lineWidth = 3; c.beginPath(); c.moveTo(163, 66); c.lineTo(163, 24); c.lineTo(237, 24); c.lineTo(237, 66); c.stroke();
    // paredes con neón
    const neon = (pts, col, w, bl) => {
      c.save(); c.shadowColor = col; c.shadowBlur = bl; c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); c.restore();
    };
    const arco = [[14, 200]]; segs.forEach((s) => { if (s.arco) arco.push([s.x2, s.y2]); });
    neon(arco, "#19e6ff", 4, 14); neon([[14, 200], [14, 548], [118, 646]], "#19e6ff", 4, 14);
    neon([[386, 200], [386, 706]], "#19e6ff", 4, 14); neon([[358, 254], [358, 548], [282, 646]], "#ff9a1f", 4, 12);
    neon([[358, 254], [340, 268]], "#ff9a1f", 4, 10); neon([[386, 230], [357, 246]], "#41ff8a", 4, 10);
    neon([[358, 706], [386, 706]], "#ff9a1f", 4, 8);
    // tuercas decorativas del carril
    c.fillStyle = "rgba(255,255,255,.25)"; c.font = "900 16px " + fam; c.textAlign = "center"; c.fillText("▲", 372, 330); c.fillText("▲", 372, 420); c.fillText("▲", 372, 510);
    return e;
  }
  function dibujarBola(c, b, sz) {
    // estela
    const tr = b.tr;
    for (let i = 0; i + 3 < tr.length; i += 2) {
      const k = i / tr.length; c.strokeStyle = "rgba(255,240,170," + (0.45 * k).toFixed(3) + ")"; c.lineWidth = R * 1.6 * k;
      c.lineCap = "round"; c.beginPath(); c.moveTo(tr[i], tr[i + 1]); c.lineTo(tr[i + 2], tr[i + 3]); c.stroke();
    }
    c.save(); c.translate(b.x, b.y); c.shadowColor = "rgba(255,255,255,.8)"; c.shadowBlur = 12;
    const g = c.createRadialGradient(-3, -4, 1, 0, 0, R); g.addColorStop(0, "#fff"); g.addColorStop(1, "#c9d3e6");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, PI * 2); c.fill(); c.shadowBlur = 0;
    c.clip(); c.rotate(b.rot); c.fillStyle = "#0b1226";
    const pent = (x, y, r) => { c.beginPath(); for (let i = 0; i < 5; i++) { const a = -PI / 2 + i * 2 * PI / 5; c.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } c.closePath(); c.fill(); };
    pent(0, 0, 4.2); pent(8, -3, 3.4); pent(-8, -3, 3.4); pent(0, 8.5, 3.4); pent(0, -9, 3);
    c.restore();
  }
  function dibujar() {
    const c = ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0);
    c.save();
    if (S.shake > 0) c.translate(rnd(-S.shake, S.shake) * 0.6, rnd(-S.shake, S.shake) * 0.6);
    if (estatica) { c.setTransform(dpr, 0, 0, dpr, 0, 0); c.drawImage(estatica, 0, 0, estatica.width / dpr, estatica.height / dpr); c.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0); }
    // dianas laterales («tarjetas»)
    [[14, 391, 1], [358, 391, -1]].forEach((d, i) => {
      c.save(); c.shadowColor = "#ffe94a"; c.shadowBlur = 6 + flashD[i] * 22; c.fillStyle = S.diana[i] || flashD[i] > 0 ? "#ffe94a" : "#a8890d";
      const x = d[2] > 0 ? 14 : 352; c.fillRect(x, 372, 8, 38); c.restore();
    });
    // trampillas T-I-K-I
    ROLLOS.forEach((r, i) => {
      const on = S.tiki[i], f = flashR[i];
      c.save(); c.shadowColor = "#19e6ff"; c.shadowBlur = on ? 18 : 4 + f * 12;
      c.fillStyle = on ? "#19e6ff" : "rgba(10,25,40,.8)"; c.strokeStyle = "#19e6ff"; c.lineWidth = 2;
      c.beginPath(); c.arc(r.x, r.y, 13, 0, PI * 2); c.fill(); c.stroke();
      c.fillStyle = on ? "#06121c" : "#19e6ff"; c.font = "900 15px " + fam; c.textAlign = "center"; c.textBaseline = "middle"; c.shadowBlur = 0; c.fillText(r.l, r.x, r.y + 1); c.restore();
    });
    // tirachinas
    segs.forEach((s) => {
      if (s.sling === undefined) return;
      const f = flashS[s.sling]; c.save(); c.shadowColor = "#ffe94a"; c.shadowBlur = 8 + f * 22;
      c.strokeStyle = f > 0.05 ? "#fff" : "#ffd23a"; c.lineWidth = 8; c.lineCap = "round"; c.beginPath(); c.moveTo(s.x1, s.y1); c.lineTo(s.x2, s.y2); c.stroke(); c.restore();
    });
    // pop bumpers (defensas)
    BUMPERS.forEach((b, i) => {
      const f = flashB[i], r = b.r * (1 + f * 0.16);
      c.save(); c.shadowColor = b.c; c.shadowBlur = 14 + f * 26;
      c.fillStyle = "#07101f"; c.strokeStyle = b.c; c.lineWidth = 4; c.beginPath(); c.arc(b.x, b.y, r, 0, PI * 2); c.fill(); c.stroke();
      c.shadowBlur = 0; c.fillStyle = f > 0.05 ? "#fff" : b.c; c.beginPath(); c.arc(b.x, b.y, r * 0.66, 0, PI * 2); c.fill();
      c.fillStyle = "#07101f"; c.font = "900 " + Math.round(r * 0.8) + "px " + fam; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(b.n, b.x, b.y + 1); c.restore();
    });
    // postes
    POSTES.forEach((p, i) => { c.save(); c.shadowColor = "#fff"; c.shadowBlur = 6 + flashP[i] * 24; c.fillStyle = "#fff"; c.beginPath(); c.arc(p.x, p.y, p.r, 0, PI * 2); c.fill(); c.restore(); });
    // portero
    const kp = S.keeper;
    c.save(); c.shadowColor = "#ff9a1f"; c.shadowBlur = 10; c.fillStyle = "#ff9a1f"; c.strokeStyle = "#fff"; c.lineWidth = 2;
    c.beginPath(); c.roundRect ? c.roundRect(kp.x - 17, 77, 34, 10, 5) : c.rect(kp.x - 17, 77, 34, 10); c.fill(); c.stroke();
    c.fillStyle = "#ffd9a8"; c.beginPath(); c.arc(kp.x, 72, 6, 0, PI * 2); c.fill();   // cabeza
    c.fillStyle = "#ff9a1f"; c.beginPath(); c.arc(kp.x - 17, 82, 4.5, 0, PI * 2); c.arc(kp.x + 17, 82, 4.5, 0, PI * 2); c.fill(); c.restore(); // guantes
    // flíperes (botas)
    F.forEach((f) => {
      const tx = f.piv[0] + FL.L * Math.cos(f.a), ty = f.piv[1] + FL.L * Math.sin(f.a);
      c.save(); c.shadowColor = "#ff8a00"; c.shadowBlur = f.on ? 18 : 8; c.lineCap = "round";
      c.strokeStyle = "#fff"; c.lineWidth = FL.r0 * 2 + 3; c.beginPath(); c.moveTo(f.piv[0], f.piv[1]); c.lineTo(tx, ty); c.stroke();
      const g = c.createLinearGradient(f.piv[0], f.piv[1], tx, ty); g.addColorStop(0, "#ff8a00"); g.addColorStop(1, "#ffe05a");
      c.strokeStyle = g; c.lineWidth = FL.r0 * 2; c.beginPath(); c.moveTo(f.piv[0], f.piv[1]); c.lineTo(tx, ty); c.stroke();
      c.fillStyle = "#3a2a00"; c.beginPath(); c.arc(f.piv[0], f.piv[1], 4, 0, PI * 2); c.fill();
      c.shadowBlur = 0; c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 3; c.beginPath(); c.moveTo(f.piv[0] + (tx - f.piv[0]) * 0.18, f.piv[1] + (ty - f.piv[1]) * 0.18 - 4); c.lineTo(f.piv[0] + (tx - f.piv[0]) * 0.8, f.piv[1] + (ty - f.piv[1]) * 0.8 - 4); c.stroke();
      c.restore();
    });
    // émbolo del carril
    const dy = S.fase === "saque" ? S.carga * 14 : 0;
    c.fillStyle = "#c9d3e6"; c.fillRect(366, DEPOSITO[1] + R + dy + 2, 12, 5); c.fillStyle = "#6b7a93"; c.fillRect(371, DEPOSITO[1] + R + dy + 7, 2, 22 - dy);
    // bolas
    S.bolas.forEach((b) => { if (b.vivo) dibujarBola(c, b); });
    // partículas
    c.save(); c.globalCompositeOperation = "lighter";
    parts.forEach((p) => {
      const a = 1 - p.life / p.max;
      if (p.tipo === "c") { c.globalCompositeOperation = "source-over"; c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = Math.min(1, a * 1.5); c.fillStyle = p.c; c.fillRect(-3, -1.6, 6, 3.2); c.restore(); c.globalCompositeOperation = "lighter"; }
      else { c.globalAlpha = a; c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, p.s * (0.4 + a), 0, PI * 2); c.fill(); }
    });
    c.restore(); c.globalAlpha = 1;
    // destello del gol / T-I-K-I
    if (S.flash > 0) { c.fillStyle = "rgba(255,255,255," + (S.flash * 0.55).toFixed(3) + ")"; c.fillRect(0, 0, W, H); }
    // textos flotantes
    c.textAlign = "center"; c.textBaseline = "middle";
    popups.forEach((p) => {
      const k = p.t / p.max, a = k < 0.12 ? k / 0.12 : k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1, esc = k < 0.15 ? 0.6 + k / 0.15 * 0.4 : 1;
      c.save(); c.globalAlpha = a; c.translate(p.x, p.y); c.scale(esc, esc);
      c.font = "900 " + p.sz + "px " + fam; c.lineWidth = Math.max(3, p.sz / 5); c.strokeStyle = "rgba(0,0,0,.75)"; c.lineJoin = "round";
      c.strokeText(p.txt, 0, 0); c.fillStyle = p.c; c.fillText(p.txt, 0, 0); c.restore();
    });
    c.restore();
    if (S.salvar > 0 && S.fase === "juego") {
      c.save(); c.globalAlpha = 0.9; c.font = "800 10px " + fam; c.textAlign = "left"; c.fillStyle = "#19e6ff";
      c.fillText("VAR " + Math.ceil(S.salvar), 20, 20); c.restore();
    }
  }

  /* ── Ajuste de tamaño ── */
  function ajustar() {
    const r = escena.getBoundingClientRect();
    const cs = getComputedStyle(escena), pv = (k) => parseFloat(cs[k]) || 0;
    const aw = Math.max(200, r.width - pv("paddingLeft") - pv("paddingRight") - 6), ah = Math.max(300, r.height - pv("paddingTop") - pv("paddingBottom") - 6);
    sc = Math.min(aw / W, ah / H); dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.style.width = Math.floor(W * sc) + "px"; cv.style.height = Math.floor(H * sc) + "px";
    cv.width = Math.ceil(W * sc * dpr); cv.height = Math.ceil(H * sc * dpr);
    estatica = crearEstatica();
  }

  /* ── Entrada ── */
  const punteros = {};
  function ladoDe(e) { const r = cv.getBoundingClientRect(); return e.clientX < r.left + r.width / 2 ? "izq" : "der"; }
  function bajar(e) {
    if (S.pausa || S.fase === "menu" || S.fase === "fin") return;
    if (e.target.closest && e.target.closest(".pb-btn, .pb-caja")) return;
    if (S.fase === "saque") { S.cargando = true; au.activar(); punteros[e.pointerId] = "saque"; return; }
    const l = ladoDe(e); punteros[e.pointerId] = l; entrada[l] = true; if (!reducido) au.flip();
  }
  function subir(e) {
    const l = punteros[e.pointerId]; if (!l) return; delete punteros[e.pointerId];
    if (l === "saque") { if (S.fase === "saque" && S.cargando) lanzar(); S.cargando = false; return; }
    if (!Object.keys(punteros).some((k) => punteros[k] === l)) entrada[l] = false;
  }
  function tecla(e, abajo) {
    const k = e.code;
    if (S.fase === "menu" || S.fase === "fin") { if (abajo && (k === "Space" || k === "Enter") && (!$("[data-menu]").hidden || !$("[data-fin]").hidden)) { e.preventDefault(); empezar(); } return; }
    if (k === "Escape" || k === "KeyP") { if (abajo) { e.preventDefault(); pausar(!S.pausa); } return; }
    if (S.pausa) return;
    if (k === "ArrowLeft" || k === "KeyZ" || k === "KeyA") { e.preventDefault(); if (abajo && !entrada.izq) au.flip(); entrada.izq = abajo; }
    else if (k === "ArrowRight" || k === "KeyM" || k === "KeyD" || k === "KeyL") { e.preventDefault(); if (abajo && !entrada.der) au.flip(); entrada.der = abajo; }
    else if (k === "Space" || k === "ArrowDown") {
      e.preventDefault();
      if (S.fase === "saque") { if (abajo) { S.cargando = true; au.activar(); } else if (S.cargando) lanzar(); }
      else { if (abajo && !(entrada.izq && entrada.der)) au.flip(); entrada.izq = entrada.der = abajo; }
    }
  }
  const onKD = (e) => tecla(e, true), onKU = (e) => tecla(e, false);
  function pausar(v) {
    if (S.fase === "menu" || S.fase === "fin") return;
    S.pausa = v; $("[data-pausa]").hidden = !v; entrada.izq = entrada.der = false; S.cargando = false;
  }
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf);
    document.removeEventListener("keydown", onKD); document.removeEventListener("keyup", onKU); document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("resize", ajustar);
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  function onVis() { if (document.hidden && vivo && S.fase !== "menu" && S.fase !== "fin") pausar(true); }
  escena.addEventListener("pointerdown", bajar);
  raiz.addEventListener("pointerup", subir); raiz.addEventListener("pointercancel", subir);
  raiz.addEventListener("click", function (e) {
    const b = e.target.closest && e.target.closest("[data-pb]"); if (!b) return;
    const a = b.dataset.pb;
    if (a === "salir") cerrar(); else if (a === "jugar") empezar(); else if (a === "pausa") pausar(!S.pausa); else if (a === "seguir") pausar(false);
  });
  raiz.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", onKD); document.addEventListener("keyup", onKU); document.addEventListener("visibilitychange", onVis);
  window.addEventListener("resize", ajustar);

  function bucle(ms) {
    if (!vivo) return;
    raf = requestAnimationFrame(bucle);
    const dt = Math.min(0.033, (ms - ultimo) / 1000 || 0.016); ultimo = ms;
    if (!S.pausa && S.fase !== "menu" && S.fase !== "fin") actualizar(dt);
    else if (S.fase === "menu" || S.fase === "fin") { S.t += dt; for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life += dt; if (p.life >= p.max) parts.splice(i, 1); else { p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; } } }
    dibujar();
  }
  $("[data-mejor]").textContent = datos().mejor.toLocaleString(api.locale || undefined);
  ajustar(); pintarHud();
  S.bolas = [nuevaBola(200, 300, 90, -60)];
  raf = requestAnimationFrame(bucle);
  /* En el menú la bola de adorno rebota sola */
  return { cerrar: cerrar, S: S, F: F, entrada: entrada, empezar: empezar, actualizar: actualizar, lanzar: lanzar, ajustar: ajustar, constantes: { W: W, H: H, R: R } };
}
