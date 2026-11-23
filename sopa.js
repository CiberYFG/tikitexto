/* SOPA DE LETRAS · TIKITEXTO (23-nov-2026) · juego de letras contrarreloj
   Una cuadrícula con nombres de fútbol escondidos (equipos, estadios y leyendas: los temas de Cracks Ocultos). Se desliza el dedo en línea
   recta sobre las letras (o se toca la primera y la última) para marcar un nombre. Cada cuadrícula completada suma tiempo y sube el nivel:
   más grande, más nombres, diagonales y nombres al revés, y a partir del nivel 4 la lista solo enseña la inicial. Módulo ES; sonidos
   sintetizados; sin escudos, fotos ni logos. */
import { TEMAS } from "./serpiente.js";

const T0 = 150, T_MAX = 240, COSTE_PISTA = 8, UMBRALES_TIKI = [2, 5], PAUSA = 1500;
const D0 = [[0, 1], [1, 0]], D1 = D0.concat([[1, 1]]), D2 = D1.concat([[0, -1], [-1, 0]]), D3 = D2.concat([[-1, -1], [1, -1], [-1, 1]]);
export const NIVELES = [
  { n: 8, pal: 5, dirs: D0, max: 7, mask: false, mas: 40 }, { n: 9, pal: 6, dirs: D1, max: 8, mask: false, mas: 40 }, { n: 10, pal: 7, dirs: D2, max: 9, mask: false, mas: 35 },
  { n: 10, pal: 8, dirs: D3, max: 9, mask: true, mas: 32 }, { n: 11, pal: 9, dirs: D3, max: 10, mask: true, mas: 30 },
];
const nivelCfg = (i) => NIVELES[Math.min(i, NIVELES.length - 1)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const irnd = (n) => Math.floor(Math.random() * n);
const mezcla = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = irnd(i + 1), t = r[i]; r[i] = r[j]; r[j] = t; } return r; };
const COLORES = ["#ffd23a", "#41ff8a", "#19e6ff", "#ff7ad9", "#ff9a1f", "#b79bff", "#7dff6a", "#ff6b7c", "#4aa8ff"];
const LANGS = ["es", "en", "pt", "fr", "it", "de"];

const UI = {
  kicker: ["Juego de letras", "Letter game", "Jogo de letras", "Jeu de lettres", "Gioco di lettere", "Buchstabenspiel"],
  t1: ["SOPA DE", "WORD", "CAÇA-", "MOTS", "PAROLE", "BUCHSTABEN-"], t2: ["LETRAS", "SEARCH", "PALAVRAS", "MÊLÉS", "NASCOSTE", "SALAT"],
  sub: ["Encuentra los nombres de fútbol escondidos antes de que se acabe el tiempo. Cada cuadrícula es más difícil.", "Find the hidden football names before time runs out. Every grid is harder.", "Encontre os nomes de futebol escondidos antes que o tempo acabe. Cada grade é mais difícil.", "Trouve les noms de football cachés avant la fin du temps. Chaque grille est plus difficile.", "Trova i nomi di calcio nascosti prima che finisca il tempo. Ogni griglia è più difficile.", "Finde die versteckten Fußballnamen, bevor die Zeit abläuft. Jedes Raster ist schwerer."],
  p1: ["Desliza el dedo en línea recta sobre las letras (o toca la primera y la última) para marcar un nombre.", "Swipe in a straight line over the letters (or tap the first and the last) to mark a name.", "Deslize o dedo em linha reta sobre as letras (ou toque a primeira e a última) para marcar um nome.", "Fais glisser le doigt en ligne droite sur les lettres (ou touche la première et la dernière) pour marquer un nom.", "Fai scorrere il dito in linea retta sulle lettere (o tocca la prima e l'ultima) per segnare un nome.", "Wische in gerader Linie über die Buchstaben (oder tippe auf den ersten und den letzten), um einen Namen zu markieren."],
  p2: ["Los nombres van en horizontal, vertical y diagonal; al subir de nivel, también al revés.", "Names run horizontally, vertically and diagonally; at higher levels, backwards too.", "Os nomes vão na horizontal, vertical e diagonal; em níveis mais altos, também de trás para a frente.", "Les noms sont à l'horizontale, à la verticale et en diagonale ; aux niveaux supérieurs, aussi à l'envers.", "I nomi vanno in orizzontale, verticale e diagonale; ai livelli alti, anche al contrario.", "Namen verlaufen waagerecht, senkrecht und diagonal; auf höheren Stufen auch rückwärts."],
  p3: ["Cada cuadrícula completa suma tiempo y sube de nivel. Con la 2.ª y la 5.ª, ⚡ +1 tikitexto.", "Each completed grid adds time and raises the level. On the 2nd and 5th, ⚡ +1 tikitext.", "Cada grade completa soma tempo e sobe de nível. Com a 2.ª e a 5.ª, ⚡ +1 tikitexto.", "Chaque grille terminée ajoute du temps et fait monter de niveau. À la 2e et à la 5e, ⚡ +1 tikitexto.", "Ogni griglia completata aggiunge tempo e fa salire di livello. Con la 2ª e la 5ª, ⚡ +1 tikitexto.", "Jedes gelöste Raster bringt Zeit und eine höhere Stufe. Beim 2. und 5. ⚡ +1 Tikitext."],
  jugar: ["¡Jugar!", "Play!", "Jogar!", "Jouer !", "Gioca!", "Los geht's!"], salir: ["Salir", "Exit", "Sair", "Quitter", "Esci", "Beenden"], otra: ["Jugar otra vez", "Play again", "Jogar de novo", "Rejouer", "Gioca ancora", "Nochmal spielen"],
  nivel: ["Nivel", "Level", "Nível", "Niveau", "Livello", "Level"],
  pista: ["💡 Pista (−8 s)", "💡 Hint (−8 s)", "💡 Dica (−8 s)", "💡 Indice (−8 s)", "💡 Suggerimento (−8 s)", "💡 Tipp (−8 s)"],
  bien: ["¡Encontrada!", "Found!", "Encontrada!", "Trouvé !", "Trovata!", "Gefunden!"], mal: ["Ahí no hay nombre", "No name there", "Ali não há nome", "Pas de nom ici", "Lì non c'è nessun nome", "Da ist kein Name"],
  completa: ["¡Cuadrícula completa!", "Grid complete!", "Grade completa!", "Grille terminée !", "Griglia completata!", "Raster geschafft!"],
  fin: ["Se acabó el tiempo", "Time's up", "Acabou o tempo", "Temps écoulé", "Tempo scaduto", "Zeit abgelaufen"],
  rec: ["¡Nuevo récord!", "New record!", "Novo recorde!", "Nouveau record !", "Nuovo record!", "Neuer Rekord!"],
  cuad: ["cuadrículas", "grids", "grades", "grilles", "griglie", "Raster"], pal: ["nombres", "names", "nomes", "noms", "nomi", "Namen"], puntos: ["puntos", "points", "pontos", "points", "punti", "Punkte"],
  tiki: ["⚡ +1 tikitexto", "⚡ +1 tikitext", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 Tikitext"],
};

/* ── generación de la cuadrícula ── */
export function generar(nivel, evitar) {
  const cfg = nivelCfg(nivel), n = cfg.n;
  for (let intento = 0; intento < 60; intento++) {
    const tema = mezcla(TEMAS.filter((t) => t !== evitar))[0];
    const todas = Array.from(new Set((Array.isArray(tema.n) ? tema.n : String(tema.n).split(/\s+/)).filter((w) => w.length >= 4 && w.length <= cfg.max && /^[A-Z]+$/.test(w))));
    if (todas.length < cfg.pal) continue;
    /* palabras largas primero (más difíciles de colocar) */
    const elegidas = mezcla(todas).slice(0, cfg.pal).sort((a, b) => b.length - a.length);
    const g = []; for (let i = 0; i < n; i++) g.push(new Array(n).fill(""));
    const puestas = []; let ok = true;
    for (const w of elegidas) {
      let colocada = false;
      for (let t = 0; t < 250 && !colocada; t++) {
        const d = cfg.dirs[irnd(cfg.dirs.length)], r0 = irnd(n), c0 = irnd(n), r1 = r0 + d[0] * (w.length - 1), c1 = c0 + d[1] * (w.length - 1);
        if (r1 < 0 || r1 >= n || c1 < 0 || c1 >= n) continue;
        let cabe = true; for (let k = 0; k < w.length && cabe; k++) { const x = g[r0 + d[0] * k][c0 + d[1] * k]; if (x && x !== w[k]) cabe = false; }
        if (!cabe) continue;
        const cells = []; for (let k = 0; k < w.length; k++) { g[r0 + d[0] * k][c0 + d[1] * k] = w[k]; cells.push([r0 + d[0] * k, c0 + d[1] * k]); }
        puestas.push({ w: w, r: r0, c: c0, d: d, cells: cells }); colocada = true;
      }
      if (!colocada) { ok = false; break; }
    }
    if (!ok) continue;
    /* relleno: letras de los propios nombres (más engañoso) y alguna al azar */
    const pool = elegidas.join("") + "AEIOURSNTLCDM";
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (!g[i][j]) g[i][j] = pool[irnd(pool.length)];
    return { n: n, g: g, palabras: puestas, tema: tema, nivel: nivel };
  }
  return null;
}
/* todas las apariciones de una palabra en la cuadrícula (para que cuente cualquiera) */
export function lineaDe(sel) { return sel.map((p) => p[0] + "," + p[1]).join(";"); }
export function texto(G, cells) { return cells.map((p) => G.g[p[0]][p[1]]).join(""); }
export function ajusta(ini, p, n) {
  const dr = p[0] - ini[0], dc = p[1] - ini[1];
  if (dr === 0 && dc === 0) return [ini];
  const ang = Math.round(Math.atan2(dr, dc) / (Math.PI / 4)), dirs = { 0: [0, 1], 1: [1, 1], 2: [1, 0], 3: [1, -1], 4: [0, -1], "-4": [0, -1], "-1": [-1, 1], "-2": [-1, 0], "-3": [-1, -1] };
  const d = dirs[String(ang)] || [0, 1];
  let pasos = Math.round((dr * d[0] + dc * d[1]) / (d[0] * d[0] + d[1] * d[1])); pasos = Math.max(0, pasos);
  while (pasos > 0 && (ini[0] + d[0] * pasos < 0 || ini[0] + d[0] * pasos >= n || ini[1] + d[1] * pasos < 0 || ini[1] + d[1] * pasos >= n)) pasos--;
  const out = []; for (let k = 0; k <= pasos; k++) out.push([ini[0] + d[0] * k, ini[1] + d[1] * k]); return out;
}

const PLANTILLA = `
<div class="so-fondo"></div>
<div class="so-cab">
  <button type="button" class="so-btn" data-so="salir" aria-label="Salir">✕</button>
  <div class="so-marc"><small data-nivel>Nivel 1</small><b data-pts>0</b></div>
  <div class="so-reloj" data-reloj>2:30</div>
</div>
<div class="so-tiempo"><i data-barra></i></div>
<p class="so-tema" data-tema></p>
<div class="so-info" data-info></div>
<div class="so-tablero"><div class="so-grid" data-grid></div></div>
<div class="so-lista" data-lista></div>
<div class="so-pie"><button type="button" class="so-pista" data-so="pista"></button></div>
<div class="so-menu" data-menu>
  <div class="so-caja">
    <p class="so-kicker" data-k="kicker"></p>
    <h2 class="so-titulo"><span data-k="t1"></span><span data-k="t2"></span></h2>
    <p class="so-sub" data-k="sub"></p>
    <ul class="so-como">
      <li><b>1</b><span data-k="p1"></span></li>
      <li><b>2</b><span data-k="p2"></span></li>
      <li><b>3</b><span data-k="p3"></span></li>
    </ul>
    <p class="so-stats" data-stats></p>
    <button type="button" class="so-jugar" data-so="jugar" data-k="jugar"></button>
    <button type="button" class="so-sec" data-so="salir" data-k="salir"></button>
  </div>
</div>
<div class="so-fin" data-fin hidden>
  <div class="so-caja so-caja--s">
    <h3 data-k="fin"></h3>
    <p class="so-res" data-fin-m></p>
    <p class="so-res" data-fin-r></p>
    <p class="so-tikis" data-fin-tiki hidden data-k="tiki"></p>
    <button type="button" class="so-jugar" data-so="jugar" data-k="otra"></button>
    <button type="button" class="so-sec" data-so="salir" data-k="salir"></button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const loc = String((api && api.locale) || "es").slice(0, 2).toLowerCase(), L = Math.max(0, LANGS.indexOf(loc));
  const tr = (k) => UI[k][L], tt = (s) => (api && api.t ? api.t(s) : s);
  raiz.innerHTML = PLANTILLA; raiz.setAttribute("data-no-t", "");
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  $$("[data-k]").forEach((e) => { e.textContent = tr(e.dataset.k); });
  $('[data-so="pista"]').textContent = tr("pista");
  const datos = () => { const d = api.datos(); ["mejor", "cuad", "pal", "part", "tiki", "pts"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { fase: "menu", G: null, nivel: 0, tema: null, hechas: {}, pts: 0, cuad: 0, pal: 0, racha: 0, tikis: 0, t: T0, t0: 0, resto: T0, ini: null, fin: null, sel: [], tap: null, arrastre: false, pistas: {}, usada: false };
  let raf = 0, vivo = true, ctx = null, hSig = 0, ultimo = 0, tPrev = 0, ultTic = 0, nSel = 0;

  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonCelda = (k) => blip(420 + 40 * Math.min(k, 10), 0.04, 0.025, "sine");
  const sonBien = () => { blip(660, 0.1, 0.07, "triangle"); blip(990, 0.2, 0.07, "triangle", 0, 0.09); };
  const sonMal = () => blip(200, 0.2, 0.06, "sawtooth", 120);
  const sonTic = () => blip(880, 0.04, 0.03, "square");
  const sonFin = () => [523, 659, 784, 1046, 1318].forEach((f, i) => blip(f, 0.14, 0.07, "square", 0, i * 0.08));
  const sonPista = () => blip(740, 0.14, 0.05, "triangle", 1100);

  const fmt = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  function info(txt, cls) { const e = $("[data-info]"); e.className = "so-info" + (cls ? " " + cls : ""); e.textContent = txt || ""; }
  function pintaStats() { const d = datos(); $("[data-stats]").textContent = d.mejor ? "🏆 " + d.mejor + " · " + d.cuad + " " + tr("cuad") + " · " + d.part + " ⚽" : ""; }
  function pintaHud() { $("[data-nivel]").textContent = tr("nivel") + " " + (S.nivel + 1); $("[data-pts]").textContent = String(S.pts); }

  function pintaGrid() {
    const G = S.G, grid = $("[data-grid]"); grid.style.setProperty("--n", String(G.n)); let h = "";
    for (let i = 0; i < G.n; i++) for (let j = 0; j < G.n; j++) h += '<div class="so-c" data-r="' + i + '" data-c="' + j + '">' + G.g[i][j] + "</div>";
    grid.innerHTML = h;
    $("[data-tema]").textContent = tt(G.tema.t);
    pintaLista();
  }
  function pintaLista() {
    const G = S.G, cfg = nivelCfg(S.nivel); let h = "";
    G.palabras.forEach((p) => { const hecho = S.hechas[p.w]; h += '<span class="so-pal' + (hecho ? " hecho" : "") + '" data-w="' + p.w + '"' + (hecho ? ' style="--c:' + hecho + '"' : "") + ">" + (cfg.mask && !hecho ? p.w[0] + "·".repeat(p.w.length - 1) : p.w) + "</span>"; });
    $("[data-lista]").innerHTML = h;
  }
  const celda = (r, c) => $('.so-c[data-r="' + r + '"][data-c="' + c + '"]');
  function marca() {
    $$(".so-c.sel").forEach((e) => e.classList.remove("sel"));
    S.sel.forEach((p) => { const e = celda(p[0], p[1]); if (e) e.classList.add("sel"); });
  }
  function pintaPistas() {
    $$(".so-c.pista").forEach((e) => e.classList.remove("pista"));
    S.G.palabras.forEach((p) => { if (S.pistas[p.w] && !S.hechas[p.w]) { const e = celda(p.cells[0][0], p.cells[0][1]); if (e) e.classList.add("pista"); } });
  }

  function nuevaCuadricula() {
    const G = generar(S.nivel, S.tema); if (!G) { termina(); return; }
    S.G = G; S.tema = G.tema; S.hechas = {}; S.pistas = {}; S.sel = []; S.ini = null; S.tap = null; S.racha = 0; S.fase = "juego"; S.usada = false; S.t0 = performance.now(); S.resto = S.t;
    pintaGrid(); pintaHud(); info("", "");
  }
  function evalua(cells) {
    if (cells.length < 2) { S.sel = []; marca(); return; }
    const G = S.G, s = texto(G, cells), r = s.split("").reverse().join("");
    const p = G.palabras.filter((x) => !S.hechas[x.w] && (x.w === s || x.w === r))[0];
    if (!p) { /* la palabra podría estar repetida en otra posición: también vale */ }
    if (p) {
      const color = COLORES[Object.keys(S.hechas).length % COLORES.length]; S.hechas[p.w] = color;
      cells.forEach((q) => { const e = celda(q[0], q[1]); if (e) { e.classList.add("enc"); e.style.setProperty("--c", color); } });
      S.racha++; S.pal++; S.pts += 100 + 10 * Math.min(S.racha - 1, 5); sonBien(); info(tr("bien") + " " + p.w, "bien"); pintaLista(); pintaPistas(); pintaHud();
      if (G.palabras.every((x) => S.hechas[x.w])) completa();
    } else { S.racha = 0; sonMal(); info(tr("mal"), "mal"); const els = cells.map((q) => celda(q[0], q[1])); els.forEach((e) => e && e.classList.add("mal")); setTimeout(() => els.forEach((e) => e && e.classList.remove("mal")), 380); }
    S.sel = []; marca();
  }
  function completa() {
    S.fase = "pausa"; S.cuad++; const cfg = nivelCfg(S.nivel); S.pts += 300 + 50 * S.nivel; S.t = clamp(S.resto + cfg.mas, 0, T_MAX); S.t0 = performance.now();
    info(tr("completa") + " +" + cfg.mas + " s", "bien"); sonFin(); pintaHud();
    UMBRALES_TIKI.forEach((u) => { if (S.cuad === u) { S.tikis++; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } info(tr("tiki"), "bien"); } });
    clearTimeout(hSig); hSig = setTimeout(() => { if (!vivo || S.fase !== "pausa") return; S.nivel++; nuevaCuadricula(); }, PAUSA);
  }
  function pista() {
    if (S.fase !== "juego") return; const resto = S.G.palabras.filter((p) => !S.hechas[p.w] && !S.pistas[p.w]); if (!resto.length) return;
    const p = resto[irnd(resto.length)]; S.pistas[p.w] = 1; S.t = Math.max(0.01, S.resto - COSTE_PISTA); S.t0 = performance.now(); sonPista(); pintaPistas();
  }
  function termina() {
    S.fase = "fin"; const d = datos(); d.part++; d.cuad = Math.max(d.cuad, S.cuad); d.pal += S.pal; d.pts += S.pts; const nuevo = S.pts > d.mejor; if (nuevo) d.mejor = S.pts; d.tiki += S.tikis;
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-fin-m]").textContent = S.cuad + " " + tr("cuad") + " · " + S.pal + " " + tr("pal") + " · " + S.pts + " " + tr("puntos"); $("[data-fin-r]").textContent = nuevo ? tr("rec") : "🏆 " + d.mejor;
    $("[data-fin-tiki]").hidden = !S.tikis; $("[data-fin]").hidden = false; pintaStats();
  }
  function empezar() {
    audio(); Object.assign(S, { nivel: 0, tema: null, pts: 0, cuad: 0, pal: 0, tikis: 0, t: T0, t0: performance.now(), resto: T0 });
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; nuevaCuadricula(); cancelAnimationFrame(raf); raf = requestAnimationFrame(bucle);
  }
  function bucle() {
    if (!vivo) return; raf = requestAnimationFrame(bucle);
    if (S.fase === "juego") {
      S.resto = S.t - (performance.now() - S.t0) / 1000; const k = clamp(S.resto / T_MAX, 0, 1), b = $("[data-barra]");
      b.style.transform = "scaleX(" + k.toFixed(4) + ")"; b.className = S.resto < 15 ? "rojo" : S.resto < 40 ? "ambar" : ""; $("[data-reloj]").textContent = fmt(S.resto); $("[data-reloj]").classList.toggle("urge", S.resto < 15);
      if (S.resto < 10 && Math.ceil(S.resto) !== ultTic) { ultTic = Math.ceil(S.resto); sonTic(); }
      if (S.resto <= 0) termina();
    }
  }
  /* ── entrada: deslizar o tocar inicio y final ── */
  const gridEl = () => $("[data-grid]");
  function cellDe(x, y) { const g = gridEl(), r = g.getBoundingClientRect(), n = S.G ? S.G.n : 1; let c = Math.floor((x - r.left) / r.width * n), f = Math.floor((y - r.top) / r.height * n); c = clamp(c, 0, n - 1); f = clamp(f, 0, n - 1); return [f, c]; }
  function dentro(x, y) { const r = gridEl().getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  function abajo(e) {
    if (S.fase !== "juego" || !e.target.closest || !e.target.closest("[data-grid]")) return; audio();
    S.ini = cellDe(e.clientX, e.clientY); S.arrastre = false; nSel = 0; S.sel = S.tap ? ajusta(S.tap, S.ini, S.G.n) : [S.ini]; marca();
    try { gridEl().setPointerCapture(e.pointerId); } catch (x) { /* sin captura */ } e.preventDefault();
  }
  function mueve(e) {
    if (!S.ini || S.fase !== "juego") return; const p = cellDe(e.clientX, e.clientY), base = S.tap && !S.arrastre && p[0] === S.ini[0] && p[1] === S.ini[1] ? S.tap : S.ini;
    if (p[0] !== S.ini[0] || p[1] !== S.ini[1]) S.arrastre = true;
    const sel = ajusta(S.arrastre ? S.ini : base, p, S.G.n); if (sel.length !== S.sel.length) { nSel = sel.length; sonCelda(sel.length); } S.sel = sel; marca();
  }
  function arriba(e) {
    if (!S.ini) return; const ini = S.ini; S.ini = null;
    if (S.fase !== "juego") { S.sel = []; marca(); return; }
    if (S.arrastre) { S.tap = null; const cells = S.sel.slice(); evalua(cells); return; }
    /* toque simple: primer toque = inicio; segundo toque = final (en línea recta) */
    if (S.tap) {
      const linea = ajusta(S.tap, ini, S.G.n), ult = linea[linea.length - 1];
      if (ult[0] === ini[0] && ult[1] === ini[1] && linea.length > 1) { S.tap = null; evalua(linea); return; }
    }
    S.tap = ini; S.sel = [ini]; marca(); sonCelda(1);
  }
  raiz.addEventListener("pointerdown", abajo); raiz.addEventListener("pointermove", mueve); raiz.addEventListener("pointerup", arriba); raiz.addEventListener("pointercancel", () => { S.ini = null; S.sel = []; marca(); });
  raiz.addEventListener("click", function (e) {
    audio();
    const b = e.target.closest ? e.target.closest("[data-so]") : null; if (!b) return; const a = b.dataset.so;
    if (a === "salir") cerrar(); else if (a === "jugar") empezar(); else if (a === "pista") pista();
  });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    if ((e.key === "Enter" || e.key === " ") && (S.fase === "menu" || S.fase === "fin")) { e.preventDefault(); empezar(); }
    else if ((e.key === "h" || e.key === "H") && S.fase === "juego") pista();
  };
  window.addEventListener("keydown", onKey);
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf); clearTimeout(hSig); window.removeEventListener("keydown", onKey);
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  pintaHud(); pintaStats();
  function resolver(w) { const p = S.G.palabras.filter((x) => x.w === w)[0]; if (p) evalua(p.cells.slice()); }
  return { cerrar: cerrar, S: S, empezar: empezar, generar: generar, resolver: resolver, pista: pista, evalua: evalua, ajusta: ajusta, TEMAS: TEMAS, NIVELES: NIVELES, UI: UI };
}
