/* CRUCES · TIKITEXTO (24-nov-2026) · juego de letras
   Cuadrícula 3×3: las filas son clubes y las columnas una selección, el Balón de Oro, ser campeón del mundo o una posición.
   Cada casilla pide un jugador que cumpla las dos cosas (cada jugador solo vale una vez). 3 fallos y se acaba.
   Reto diario con semilla = fecha local (igual para todos, un intento al día, resultado compartible) y modo libre.
   Módulo ES; usa las tablas de cuartetos_datos.js (la lista de clubes es CERRADA: hay que anotar TODOS los clubes de cada jugador);
   sonidos sintetizados; sin escudos, fotos ni logos. Solo valen los jugadores de la lista del juego (el buscador solo propone esos). */
import { JUGADORES, CLUBES, SELECCIONES, POSICIONES } from "./cuartetos_datos.js";

const VIDAS = 3, PISTAS = 2, FECHA0 = Date.UTC(2026, 10, 24);
const JUG = JUGADORES.filter((j) => j.c.length >= 1);
const CLUB_KEYS = Object.keys(CLUBES);
const COLS_SEL = Object.keys(SELECCIONES).map((k) => ({ t: "s", k }));
const COLS_ESP = [{ t: "b" }, { t: "w" }].concat(Object.keys(POSICIONES).map((k) => ({ t: "p", k })));

export function mulberry(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const barajar = (a, rng) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
export function norm(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ø/g, "o").replace(/æ/g, "ae").replace(/œ/g, "oe").replace(/ł/g, "l").replace(/đ/g, "d").replace(/ß/g, "ss").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
const NORM = JUG.map((j) => norm(j.n));

export function cumple(j, c) { return c.t === "s" ? j.s === c.k : c.t === "b" ? !!j.b : c.t === "w" ? !!j.w : j.p === c.k; }
export function candidatos(club, c) { return JUG.filter((j) => j.c.indexOf(club) >= 0 && cumple(j, c)); }

/* Asignación de jugadores distintos a casillas: devuelve la lista de jugadores (uno por casilla) o null */
export function resolver(listas) {
  const orden = listas.map((l, i) => i).sort((a, b) => listas[a].length - listas[b].length), uso = new Set(), sol = new Array(listas.length);
  const rec = (k) => {
    if (k === orden.length) return true;
    const i = orden[k], l = listas[i];
    for (let q = 0; q < l.length; q++) { if (uso.has(l[q].n)) continue; uso.add(l[q].n); sol[i] = l[q]; if (rec(k + 1)) return true; uso.delete(l[q].n); }
    return false;
  };
  return rec(0) ? sol : null;
}

/* Cuadrícula: { filas:[club×3], cols:[{t,k}×3], cand:[9 listas de jugadores] (casilla = fila*3 + columna) } */
export function generar(rng, minC) {
  minC = minC || 3;
  for (let n = minC; n >= 1; n--) {
    for (let it = 0; it < 4000; it++) {
      const filas = barajar(CLUB_KEYS, rng).slice(0, 3);
      const r = rng(), nEsp = r < 0.55 ? 0 : r < 0.88 ? 1 : 2;
      const esp = barajar(COLS_ESP, rng).slice(0, nEsp), sel = barajar(COLS_SEL, rng).slice(0, 3 - nEsp);
      const cols = barajar(sel.concat(esp), rng);
      const cand = []; let ok = true;
      for (let f = 0; f < 3 && ok; f++) for (let c = 0; c < 3; c++) { const l = candidatos(filas[f], cols[c]); if (l.length < n) { ok = false; break; } cand.push(l); }
      if (!ok || !resolver(cand)) continue;
      return { filas: filas, cols: cols, cand: cand };
    }
  }
  return null;
}
const hoyTxt = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const numDia = () => { const d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - FECHA0) / 864e5) + 1; };
const semillaDia = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };

/* Búsqueda de jugadores por texto (sin tildes ni mayúsculas): primero los que empiezan por el texto o por alguna palabra */
export function buscar(q, excluir) {
  const nq = norm(q); if (nq.length < 2) return [];
  const a = [], b = [];
  JUG.forEach((j, i) => {
    if (excluir && excluir.has(j.n)) return;
    const nn = NORM[i];
    if (nn.indexOf(nq) === 0 || (" " + nn).indexOf(" " + nq) >= 0) a.push(j); else if (nn.indexOf(nq) >= 0) b.push(j);
  });
  return a.concat(b).slice(0, 6);
}

const PLANTILLA = `
<div class="cr-fondo"></div>
<div class="cr-cab">
  <button type="button" class="cr-btn" data-cr="salir" aria-label="Salir">✕</button>
  <div class="cr-marc"><small data-modo>Reto diario</small><b data-cont data-no-t>0/9</b></div>
  <div class="cr-vidas" data-vidas data-no-t></div>
</div>
<div class="cr-info" data-info></div>
<div class="cr-tabla" data-tabla></div>
<div class="cr-panel" data-panel hidden>
  <p class="cr-q" data-q data-no-t></p>
  <div class="cr-fila">
    <input class="cr-in" data-in type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="40" aria-label="Jugador" />
    <button type="button" class="cr-ok" data-cr="enviar">Comprobar</button>
  </div>
  <ul class="cr-sug" data-sug data-no-t></ul>
  <div class="cr-acc">
    <button type="button" class="cr-sec" data-cr="pista">💡 <span>Pista</span> <b data-np data-no-t>2</b></button>
    <button type="button" class="cr-sec" data-cr="cancelar">Cerrar</button>
  </div>
</div>
<p class="cr-nota" data-nota>Solo cuentan los jugadores de la lista del juego.</p>
<div class="cr-menu" data-menu>
  <div class="cr-caja">
    <p class="cr-kicker">Juego de letras</p>
    <h2 class="cr-titulo"><span>CRU</span><span>CES</span></h2>
    <p class="cr-sub">Un jugador por casilla: tiene que encajar con el club de la fila y con la columna.</p>
    <ul class="cr-como">
      <li><b>1</b><span>Toca una casilla y escribe un jugador (elige de la lista).</span></li>
      <li><b>2</b><span>Debe haber jugado en el club de la fila y cumplir la columna.</span></li>
      <li><b>3</b><span>Cada jugador solo vale una vez. Con 3 fallos termina.</span></li>
    </ul>
    <p class="cr-stats" data-stats data-no-t></p>
    <button type="button" class="cr-jugar" data-cr="diario"><span data-diario-txt>Reto de hoy</span><small data-diario-sub data-no-t></small></button>
    <button type="button" class="cr-libre" data-cr="libre">Modo libre</button>
    <button type="button" class="cr-sec" data-cr="salir">Salir</button>
  </div>
</div>
<div class="cr-fin" data-fin hidden>
  <div class="cr-caja cr-caja--f">
    <p class="cr-kicker" data-fin-kicker>Reto diario</p>
    <h3 data-fin-titulo>¡Cuadrícula completa!</h3>
    <p class="cr-res" data-fin-res data-no-t></p>
    <pre class="cr-grid" data-fin-grid data-no-t></pre>
    <p class="cr-tikis" data-fin-tiki hidden>⚡ +1 tikitexto</p>
    <div class="cr-resp" data-resp hidden>
      <p class="cr-resp__t">Respuestas posibles</p>
      <ul data-resp-l data-no-t></ul>
    </div>
    <button type="button" class="cr-jugar" data-cr="compartir"><span data-comp-txt>Compartir resultado</span></button>
    <button type="button" class="cr-libre" data-cr="libre">Modo libre</button>
    <button type="button" class="cr-sec" data-cr="menu">Menú</button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  const datos = () => { const d = api.datos(); ["part", "gan", "libre", "cel", "tiki", "perf"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { fase: "menu", modo: "libre", num: 0, g: null, cel: [], sel: -1, fallos: 0, pistas: PISTAS, usados: new Set(), tikis: 0, sug: [], bloq: false };
  let vivo = true, ctx = null, timer = 0;

  /* sonidos sintetizados */
  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonBien = () => { blip(660, 0.1, 0.08, "triangle"); blip(990, 0.2, 0.08, "triangle", 0, 0.09); };
  const sonMal = () => blip(220, 0.28, 0.09, "sawtooth", 110);
  const sonToca = () => blip(520, 0.05, 0.04, "square");
  const sonGana = () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.16, 0.07, "square", 0, i * 0.1)); };
  const sonPierde = () => { [392, 330, 262].forEach((f, i) => blip(f, 0.2, 0.07, "sawtooth", 0, i * 0.12)); };

  const etiqCol = (c) => c.t === "s" ? t(SELECCIONES[c.k]) : c.t === "b" ? t("Balón de Oro") : c.t === "w" ? t("Campeón del mundo") : t(POSICIONES[c.k]);
  const iconoCol = (c) => c.t === "b" ? "🏆" : c.t === "w" ? "🌍" : c.t === "p" ? "👟" : "🏳️";
  const rellenas = () => S.cel.filter(Boolean).length;
  function pintaVidas() { let h = ""; for (let i = 0; i < VIDAS; i++) h += '<i class="' + (i < VIDAS - S.fallos ? "on" : "") + '">⚽</i>'; $("[data-vidas]").innerHTML = h; }
  function info(txt, cls, nombre) { const e = $("[data-info]"); e.className = "cr-info" + (cls ? " " + cls : ""); e.textContent = txt ? t(txt) + (nombre ? " · " + nombre : "") : ""; }
  function pintaCont() { $("[data-cont]").textContent = rellenas() + "/9"; }

  function pintaTabla() {
    const g = S.g, tb = $("[data-tabla]"); let h = '<div class="cr-esq"></div>';
    g.cols.forEach((c) => { h += '<div class="cr-cabc"><i aria-hidden="true">' + iconoCol(c) + "</i><span></span></div>"; });
    for (let f = 0; f < 3; f++) {
      h += '<div class="cr-cabf"><span></span></div>';
      for (let c = 0; c < 3; c++) h += '<button type="button" class="cr-cel" data-i="' + (f * 3 + c) + '"><span></span></button>';
    }
    tb.innerHTML = h;
    const cabc = $$(".cr-cabc span"), cabf = $$(".cr-cabf span");
    g.cols.forEach((c, k) => { cabc[k].textContent = etiqCol(c); });
    g.filas.forEach((f, k) => { cabf[k].textContent = CLUBES[f]; cabf[k].setAttribute("data-no-t", ""); });
    $$(".cr-cel").forEach((b) => {
      const i = +b.dataset.i, f = Math.floor(i / 3), c = i % 3; b.setAttribute("aria-label", CLUBES[g.filas[f]] + " · " + etiqCol(g.cols[c]));
      const sp = b.firstChild; sp.setAttribute("data-no-t", ""); const j = S.cel[i];
      if (j) { sp.textContent = j.n; b.classList.add("ok"); b.disabled = true; } else sp.textContent = "＋";
      if (i === S.sel) b.classList.add("sel");
    });
  }
  function pintaPanel() {
    const p = $("[data-panel]");
    if (S.sel < 0 || S.fase !== "juego") { p.hidden = true; return; }
    const f = Math.floor(S.sel / 3), c = S.sel % 3;
    p.hidden = false; $("[data-q]").textContent = CLUBES[S.g.filas[f]] + " × " + etiqCol(S.g.cols[c]);
    $("[data-np]").textContent = String(S.pistas); $("[data-cr=pista]").disabled = S.pistas <= 0;
    $("[data-in]").placeholder = t("Escribe un jugador…");
  }
  function pintaSug() {
    const ul = $("[data-sug]"), q = $("[data-in]").value; S.sug = buscar(q, S.usados);
    ul.innerHTML = ""; S.sug.forEach((j, i) => { const li = document.createElement("li"), b = document.createElement("button"); b.type = "button"; b.dataset.s = String(i); b.textContent = j.n; li.appendChild(b); ul.appendChild(li); });
  }
  function seleccionar(i) {
    if (S.fase !== "juego" || S.cel[i]) return; audio(); sonToca();
    S.sel = i; $$(".cr-cel").forEach((b) => b.classList.toggle("sel", +b.dataset.i === i));
    const inp = $("[data-in]"); inp.value = ""; pintaPanel(); pintaSug(); info("", ""); try { inp.focus({ preventScroll: false }); } catch (e) { /* opcional */ }
    try { $("[data-panel]").scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* opcional */ }
  }
  function cancelar() { S.sel = -1; $$(".cr-cel").forEach((b) => b.classList.remove("sel")); pintaPanel(); }

  function libresResolubles() {
    const listas = []; for (let i = 0; i < 9; i++) if (!S.cel[i]) listas.push(S.g.cand[i].filter((j) => !S.usados.has(j.n)));
    return listas.length === 0 || !!resolver(listas);
  }
  /* Comprueba un jugador (objeto de la lista) en la casilla elegida */
  function probar(j) {
    if (S.fase !== "juego" || S.sel < 0 || S.bloq) return; const i = S.sel;
    if (S.usados.has(j.n)) { info("Ya lo has usado en otra casilla", "aviso", j.n); return; }
    const btn = $('.cr-cel[data-i="' + i + '"]');
    if (S.g.cand[i].indexOf(j) >= 0) {
      S.cel[i] = j; S.usados.add(j.n); S.sel = -1; sonBien(); info("¡Correcto!", "bien", j.n);
      pintaTabla(); pintaPanel(); $("[data-sug]").innerHTML = ""; pintaCont();
      if (rellenas() === 9) { terminar(true); return; }
      if (!libresResolubles()) { terminar(false, true); return; }
    } else {
      S.fallos++; pintaVidas(); sonMal(); info("No encaja", "mal", j.n);
      if (btn) { btn.classList.remove("ko"); void btn.offsetWidth; btn.classList.add("ko"); }
      $("[data-in]").value = ""; pintaSug();
      if (S.fallos >= VIDAS) terminar(false);
    }
  }
  function enviar() {
    const q = $("[data-in]").value, nq = norm(q); if (!nq) return;
    let j = JUG.find((x, k) => NORM[k] === nq);
    if (!j) { const s = buscar(q, null); if (s.length === 1) j = s[0]; }
    if (!j) { info(buscar(q, null).length ? "Elige un jugador de la lista" : "No está en la lista del juego", "aviso"); return; }
    probar(j);
  }
  function pista() {
    if (S.fase !== "juego" || S.sel < 0 || S.pistas <= 0) return;
    const l = S.g.cand[S.sel].filter((j) => !S.usados.has(j.n)); if (!l.length) return;
    const j = l[Math.floor(Math.random() * l.length)], L = j.n.trim().charAt(0).toUpperCase();
    S.pistas--; $("[data-np]").textContent = String(S.pistas); $("[data-cr=pista]").disabled = S.pistas <= 0; info("Empieza por " + L, "pista");
  }

  const CUAD = ["⬜", "🟩"];
  const textoGrid = () => [0, 1, 2].map((f) => [0, 1, 2].map((c) => CUAD[S.cel[f * 3 + c] ? 1 : 0]).join("")).join("\n");
  function terminar(gana, sinSalida) {
    if (S.fase !== "juego") return; S.fase = "fin"; S.sel = -1; pintaPanel();
    const n = rellenas(), d = datos(); d.part++; d.cel += n; if (gana) d.gan++; if (gana && S.fallos === 0) d.perf++;
    let tiki = false;
    if (S.modo === "diario") { d.dia = hoyTxt(); d.res = n; d.grid = textoGrid() + "|" + S.num + "|" + (gana ? 1 : 0) + "|" + S.fallos; if (gana) tiki = true; }
    else if (gana) { d.libre++; if (d.libre % 3 === 0) tiki = true; }
    if (tiki) { try { api.tiki(); } catch (e) { /* opcional */ } S.tikis = 1; d.tiki++; }
    if (S.modo === "diario" && api.racha) { try { api.racha("cr"); } catch (e) { /* opcional */ } }
    try { api.guardar(); } catch (e) { /* opcional */ }
    if (gana) sonGana(); else sonPierde();
    S.sinSalida = !!sinSalida; S.gana = gana;
    timer = setTimeout(function () { if (vivo && S.fase === "fin") mostrarFin(); }, gana ? 900 : 1200);
  }
  function respuestas() {
    if (!S.g) { $("[data-resp]").hidden = true; return; }
    const listas = []; const idx = [];
    for (let i = 0; i < 9; i++) if (!S.cel[i]) { idx.push(i); listas.push(S.g.cand[i]); }
    const sol = resolver(listas); const ul = $("[data-resp-l]"); ul.innerHTML = "";
    if (!sol) { $("[data-resp]").hidden = true; return; }
    idx.forEach((i, k) => {
      const li = document.createElement("li"), f = Math.floor(i / 3), c = i % 3;
      li.innerHTML = "<small></small><b></b>"; li.firstChild.textContent = CLUBES[S.g.filas[f]] + " × " + etiqCol(S.g.cols[c]); li.lastChild.textContent = sol[k].n; ul.appendChild(li);
    });
    $("[data-resp]").hidden = !idx.length;
  }
  function mostrarFin() {
    $("[data-fin]").hidden = false; const n = rellenas();
    $("[data-fin-kicker]").textContent = t(S.modo === "diario" ? "Reto diario" : "Modo libre") + (S.modo === "diario" ? " #" + S.num : "");
    $("[data-fin-titulo]").textContent = t(S.gana ? (S.fallos === 0 ? "¡Perfecto! Sin fallos" : "¡Cuadrícula completa!") : S.sinSalida ? "Sin jugadores libres para el resto" : "Fin de la partida");
    $("[data-fin-res]").textContent = n + "/9"; $("[data-fin-grid]").textContent = textoGrid(); $("[data-fin-tiki]").hidden = !S.tikis;
    $("[data-cr=compartir]").hidden = S.modo !== "diario"; if (S.gana) { try { api.victoria(); } catch (e) { /* opcional */ } }
    if (S.gana) $("[data-resp]").hidden = true; else respuestas();
  }
  function compartir() {
    const d = datos(), p = d.grid ? d.grid.split("|") : [textoGrid(), String(S.num)];
    const txt = "CRUCES TIKITEXTO #" + p[1] + " · " + (S.modo === "diario" ? rellenas() : d.res) + "/9\n" + p[0] + "\nhttps://tikitexto.com/?modo=cruces";
    const aviso = () => { const e = $("[data-comp-txt]"); e.textContent = t("¡Copiado!"); setTimeout(function () { if (vivo) e.textContent = t("Compartir resultado"); }, 1800); };
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { navigator.share({ text: txt }).catch(function () { /* cancelado */ }); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(aviso, function () { /* sin permiso */ });
    else { const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); aviso(); } catch (e) { /* opcional */ } a.remove(); }
  }
  function pintaMenu() {
    const d = datos(), hecho = d.dia === hoyTxt();
    $("[data-stats]").textContent = d.part ? "🏆 " + d.gan + " ✔ · " + d.cel + " ▦ · " + d.part + " ⚽" : "";
    $("[data-diario-txt]").textContent = t(hecho ? "Ver resultado de hoy" : "Reto de hoy"); $("[data-diario-sub]").textContent = "#" + numDia();
  }
  function irMenu() { clearTimeout(timer); S.fase = "menu"; $("[data-fin]").hidden = true; $("[data-menu]").hidden = false; $("[data-nota]").hidden = true; pintaMenu(); }
  function empezar(modo) {
    audio(); clearTimeout(timer); S.modo = modo === "diario" ? "diario" : "libre";
    const rng = S.modo === "diario" ? mulberry(semillaDia()) : Math.random;
    S.g = generar(rng) || generar(rng, 2) || generar(Math.random, 1); S.num = numDia();
    Object.assign(S, { fase: "juego", cel: new Array(9).fill(null), sel: -1, fallos: 0, pistas: PISTAS, usados: new Set(), tikis: 0, bloq: false, gana: false, sinSalida: false });
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; $("[data-nota]").hidden = false;
    $("[data-modo]").textContent = t(S.modo === "diario" ? "Reto diario" : "Modo libre") + (S.modo === "diario" ? " #" + S.num : "");
    pintaVidas(); pintaTabla(); pintaPanel(); pintaCont(); info("", "");
  }
  function diario() {
    const d = datos();
    if (d.dia === hoyTxt() && d.grid) {
      const p = d.grid.split("|"); S.modo = "diario"; S.num = +p[1] || numDia();
      S.cel = new Array(9).fill(null);
      const celdas = Array.from(p[0].replace(/\n/g, "")); celdas.forEach((ch, i) => { S.cel[i] = ch === CUAD[1] ? { n: "" } : null; });
      S.fallos = +p[3] || 0; S.gana = p[2] === "1"; S.sinSalida = false; S.tikis = 0; S.fase = "fin"; S.g = null;
      $("[data-menu]").hidden = true; mostrarFin(); return;
    }
    empezar("diario");
  }
  function cerrar() {
    if (!vivo) return; vivo = false; clearTimeout(timer); document.removeEventListener("keydown", onKey);
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }

  raiz.addEventListener("click", function (e) {
    audio();
    const cel = e.target.closest ? e.target.closest(".cr-cel") : null; if (cel) { seleccionar(+cel.dataset.i); return; }
    const sg = e.target.closest ? e.target.closest("[data-s]") : null; if (sg) { const j = S.sug[+sg.dataset.s]; if (j) probar(j); return; }
    const b = e.target.closest ? e.target.closest("[data-cr]") : null; if (!b) return; const a = b.dataset.cr;
    if (a === "salir") cerrar(); else if (a === "diario") diario(); else if (a === "libre") empezar("libre"); else if (a === "menu") irMenu();
    else if (a === "enviar") enviar(); else if (a === "pista") pista(); else if (a === "cancelar") cancelar(); else if (a === "compartir") compartir();
  });
  raiz.addEventListener("input", function (e) { if (e.target && e.target.matches && e.target.matches("[data-in]")) pintaSug(); });
  function onKey(e) {
    if (e.key === "Escape") { if (S.sel >= 0 && S.fase === "juego") cancelar(); else cerrar(); return; }
    if (e.key === "Enter" && e.target && e.target.matches && e.target.matches("[data-in]")) { e.preventDefault(); enviar(); }
  }
  document.addEventListener("keydown", onKey);
  pintaVidas(); pintaMenu(); $("[data-nota]").hidden = true;
  /* Solo para las pruebas automáticas */
  return { cerrar: cerrar, S: S, empezar: empezar, diario: diario, probar: probar, seleccionar: seleccionar, enviar: enviar, pista: pista, generar: generar, resolver: resolver, candidatos: candidatos, buscar: buscar, mulberry: mulberry, cumple: cumple, CLUB_KEYS: CLUB_KEYS, JUG: JUG, norm: norm };
}
