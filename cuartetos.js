/* CUARTETOS TIKITEXTO · juego de letras (15-nov-2026)
   16 nombres escondidos en 4 grupos de 4 (selecciones, clubes por los que pasaron, posiciones, campeones, estadios…).
   Hay un reto diario (igual para todos) y un modo libre. 4 fallos máximo. Módulo ES; sonidos sintetizados; sin escudos, fotos ni logos. */
import { JUGADORES, CLUBES, SELECCIONES, POSICIONES, CLUBES_PAIS, ESTADIOS_PAIS } from "./cuartetos_datos.js";

const COLORES = ["#ffd23a", "#41ff8a", "#4aa8ff", "#c77dff"], CUAD = ["🟨", "🟩", "🟦", "🟪"], MAX_FALLOS = 4, MAX_PISTAS = 2, FECHA0 = Date.UTC(2026, 10, 15);

/* ── Categorías (se calculan a partir de las tablas) ── */
function construir() {
  const cats = [], porId = {}, pertenece = {};
  const alta = (id, t, d, tipo, items) => { const c = { id: id, t: t, d: d, tipo: tipo, items: items }; cats.push(c); porId[id] = c; items.forEach((i) => { (pertenece[i] = pertenece[i] || []).push(id); }); };
  const pid = (j) => "p:" + j.n;
  Object.keys(SELECCIONES).forEach((k) => { const m = JUGADORES.filter((j) => j.s === k).map(pid); if (m.length >= 6) alta("n:" + k, "Selección: " + SELECCIONES[k], 2, "nat", m); });
  Object.keys(CLUBES).forEach((k) => { const m = JUGADORES.filter((j) => j.c.indexOf(k) >= 0).map(pid); if (m.length >= 6) alta("c:" + k, "Jugaron en " + CLUBES[k], 2, "club", m); });
  const ks = Object.keys(CLUBES);
  for (let a = 0; a < ks.length; a++) for (let b = a + 1; b < ks.length; b++) {
    const m = JUGADORES.filter((j) => j.c.indexOf(ks[a]) >= 0 && j.c.indexOf(ks[b]) >= 0).map(pid);
    if (m.length >= 5) alta("cc:" + ks[a] + ks[b], "Pasaron por " + CLUBES[ks[a]] + " y " + CLUBES[ks[b]], 3, "par", m);
  }
  Object.keys(POSICIONES).forEach((k) => alta("pos:" + k, POSICIONES[k], 1, "pos", JUGADORES.filter((j) => j.p === k).map(pid)));
  alta("bo", "Ganadores del Balón de Oro", 3, "bo", JUGADORES.filter((j) => j.b).map(pid));
  alta("wc", "Campeones del Mundo", 2, "wc", JUGADORES.filter((j) => j.w).map(pid));
  Object.keys(CLUBES_PAIS).forEach((k) => { if (CLUBES_PAIS[k].length >= 5) alta("cp:" + k, "Clubes: " + k, 2, "clubes", CLUBES_PAIS[k].map((x) => "k:" + x)); });
  Object.keys(ESTADIOS_PAIS).forEach((k) => { if (ESTADIOS_PAIS[k].length >= 5) alta("ep:" + k, "Estadios: " + k, 3, "estadios", ESTADIOS_PAIS[k].map((x) => "e:" + x)); });
  const porTipo = {}; cats.forEach((c) => { (porTipo[c.tipo] = porTipo[c.tipo] || []).push(c); });
  return { cats: cats, porId: porId, pertenece: pertenece, porTipo: porTipo };
}
const DB = construir();
const nombreDe = (id) => id.slice(2);

function mulberry(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function barajar(a, rng) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

/* Cuenta las formas de repartir las 16 fichas en los 4 grupos (cada ficha solo en un grupo al que pertenece). Debe haber UNA. */
function soluciones(ids, catIds) {
  const cnt = [0, 0, 0, 0]; let n = 0;
  const opc = ids.map((id) => catIds.map((c, k) => (DB.pertenece[id] || []).indexOf(c) >= 0 ? k : -1).filter((k) => k >= 0));
  (function paso(i) {
    if (n > 1) return;
    if (i === ids.length) { n++; return; }
    for (let q = 0; q < opc[i].length; q++) { const k = opc[i][q]; if (cnt[k] >= 4) continue; cnt[k]++; paso(i + 1); cnt[k]--; }
  })(0);
  return n;
}

export function generar(rng) {
  for (let intento = 0; intento < 600; intento++) {
    const tipos = barajar(Object.keys(DB.porTipo), rng), sel = [], usados = {};
    for (let i = 0; i < 4; i++) { const lista = DB.porTipo[tipos[i]]; sel.push(lista[Math.floor(rng() * lista.length)]); }
    if (sel.length < 4) continue;
    const ids = sel.map((c) => c.id), grupos = [];
    let ok = true;
    for (let k = 0; k < 4 && ok; k++) {
      const c = sel[k], otros = ids.filter((x) => x !== c.id);
      const libres = barajar(c.items.filter((i) => !usados[i]), rng);
      const trampa = libres.filter((i) => (DB.pertenece[i] || []).some((x) => otros.indexOf(x) >= 0)), limpia = libres.filter((i) => trampa.indexOf(i) < 0);
      const nt = Math.min(trampa.length, 1 + Math.floor(rng() * 2)), pick = trampa.slice(0, nt).concat(limpia).slice(0, 4);
      if (pick.length < 4) { ok = false; break; }
      pick.forEach((i) => { usados[i] = 1; }); grupos.push(pick);
    }
    if (!ok) continue;
    const todas = [].concat.apply([], grupos);
    if (soluciones(todas, ids) !== 1) continue;
    const dif = sel.map((c, k) => k).sort((a, b) => sel[a].d - sel[b].d || rng() - 0.5), col = {};
    dif.forEach((k, r) => { col[k] = r; });
    return { cats: sel.map((c, k) => ({ id: c.id, t: c.t, d: c.d, col: col[k], items: grupos[k] })), tiles: barajar(todas, rng) };
  }
  return null;
}
const hoyTxt = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const numDia = () => { const d = new Date(); return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - FECHA0) / 864e5) + 1; };
const semillaDia = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };

export function precargar() { return Promise.resolve(); }

function crearAudio(api) {
  let ac = null, master = null;
  function ok() {
    if (!api.sonido || !api.sonido()) return false;
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); } catch (e) { ac = null; return false; } }
    if (ac.state === "suspended") { try { ac.resume(); } catch (e) { /* opcional */ } }
    return true;
  }
  function tono(f, d, tipo, v, f2, ret) {
    if (!ok()) return;
    const t0 = ac.currentTime + (ret || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + d + 0.03);
  }
  return {
    activar: ok,
    sel: (n) => tono(440 * Math.pow(2, [0, 2, 4, 7][Math.min(n, 3)] / 12), 0.09, "triangle", 0.2),
    quita: () => tono(300, 0.06, "sine", 0.12),
    grupo: (k) => { [523, 659, 784, 1047].forEach((f, i) => tono(f * (1 + k * 0.06), 0.2, "triangle", 0.26, 0, i * 0.07)); },
    casi: () => { tono(392, 0.14, "square", 0.14); tono(466, 0.18, "square", 0.14, 0, 0.12); },
    mal: () => tono(190, 0.25, "sawtooth", 0.2, 110),
    pista: () => { tono(880, 0.1, "sine", 0.22); tono(1320, 0.18, "sine", 0.2, 0, 0.09); },
    mezcla: () => { tono(500, 0.05, "square", 0.08); tono(650, 0.05, "square", 0.08, 0, 0.06); },
    gana: () => { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, 0.25, "triangle", 0.26, 0, i * 0.08)); },
    tiki: () => [440, 554, 659, 880].forEach((f, i) => tono(f, 0.16, "square", 0.18, 0, i * 0.06)),
    pierde: () => [440, 370, 311, 220].forEach((f, i) => tono(f, 0.3, "triangle", 0.26, 0, i * 0.18)),
  };
}

const PLANTILLA = `
<div class="cu-fondo" aria-hidden="true"></div>
<div class="cu-cab">
  <button type="button" class="cu-btn" data-cu="salir" aria-label="Salir">✕</button>
  <div class="cu-marc"><small data-modo-txt>Reto diario</small><div class="cu-vidas" data-vidas aria-label="Fallos restantes"></div></div>
  <button type="button" class="cu-btn" data-cu="ayuda" aria-label="Cómo se juega">?</button>
</div>
<p class="cu-info" data-info data-no-t>&nbsp;</p>
<div class="cu-resueltos" data-resueltos></div>
<div class="cu-rejilla" data-rejilla></div>
<div class="cu-pie" data-pie>
  <button type="button" class="cu-sec" data-cu="mezclar">🔀 Mezclar</button>
  <button type="button" class="cu-sec" data-cu="quitar">Deseleccionar</button>
  <button type="button" class="cu-sec cu-pista" data-cu="pista">💡 Pista <small data-pistas data-no-t>2</small></button>
  <button type="button" class="cu-env" data-cu="enviar" disabled>Enviar</button>
</div>
<div class="cu-menu" data-menu>
  <div class="cu-caja">
    <p class="cu-kicker">Juego de letras</p>
    <h2 class="cu-titulo" data-no-t><span>CUARTETOS</span><span>TIKITEXTO</span></h2>
    <div class="cu-mini" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <p class="cu-sub">Agrupa 16 nombres en 4 grupos de 4 que comparten algo.</p>
    <button type="button" class="cu-jugar" data-cu="diario"><span data-diario-txt>Reto de hoy</span><small data-diario-sub data-no-t></small></button>
    <button type="button" class="cu-libre" data-cu="libre">Modo libre</button>
    <p class="cu-stats"><span>Racha diaria</span> <b data-st-racha data-no-t>0</b> · <span>Victorias</span> <b data-st-gan data-no-t>0</b> · <span>Partidas</span> <b data-st-part data-no-t>0</b></p>
    <ul class="cu-como">
      <li><b>1</b><span>Toca 4 nombres que tengan algo en común y pulsa Enviar.</span></li>
      <li><b>2</b><span>Cada grupo es de un color: amarillo es el más fácil y morado el más difícil.</span></li>
      <li><b>3</b><span>Puedes fallar 4 veces. Cuidado: algunos nombres encajan en dos grupos.</span></li>
    </ul>
    <button type="button" class="cu-sec cu-salir" data-cu="salir">Salir</button>
  </div>
</div>
<div class="cu-fin" data-fin hidden>
  <div class="cu-caja cu-caja--s">
    <p class="cu-kicker" data-fin-kicker>Reto completado</p>
    <h3 data-fin-titulo>¡Lo has resuelto!</h3>
    <pre class="cu-grid" data-fin-grid data-no-t></pre>
    <p class="cu-tikis" data-fin-tiki hidden>🎁 +1 tikitexto</p>
    <button type="button" class="cu-jugar" data-cu="compartir"><span data-comp-txt>Compartir resultado</span></button>
    <button type="button" class="cu-libre" data-cu="libre">Otra partida libre</button>
    <button type="button" class="cu-sec" data-cu="menu">Menú</button>
  </div>
</div>`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  const reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s);
  const au = crearAudio(api);
  const datos = () => { const d = api.datos(); ["part", "gan", "racha", "mejor", "libre", "pistas"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); if (typeof d.dia !== "string") d.dia = ""; if (typeof d.res !== "string") d.res = ""; if (typeof d.grid !== "string") d.grid = ""; return d; };
  const S = { fase: "menu", modo: "libre", puz: null, sel: [], res: [], fallos: 0, hist: [], pistas: 0, probados: {}, orden: [], tikis: 0, num: 0, ocupado: false };
  let vivo = true, timer = 0;
  const msg = (txt, cls) => { const e = $("[data-info]"); e.textContent = txt ? t(txt) : " "; e.className = "cu-info" + (cls ? " " + cls : ""); clearTimeout(timer); if (txt) timer = setTimeout(function () { if (vivo && S.fase === "juego") { e.textContent = " "; e.className = "cu-info"; } }, 2600); };

  function pintarVidas() { const v = $("[data-vidas]"); v.innerHTML = ""; for (let i = 0; i < MAX_FALLOS; i++) { const s = document.createElement("i"); if (i < MAX_FALLOS - S.fallos) s.className = "on"; v.appendChild(s); } }
  function pintarPistas() { $("[data-pistas]").textContent = String(MAX_PISTAS - S.pistas); $("[data-cu=pista]").disabled = S.pistas >= MAX_PISTAS || S.fase !== "juego"; }
  const nombreItem = (id) => (id.charAt(0) === "p" ? nombreDe(id) : nombreDe(id));
  function pintarResueltos() {
    const box = $("[data-resueltos]"); box.innerHTML = "";
    S.res.forEach((k) => {
      const c = S.puz.cats[k], d = document.createElement("div"); d.className = "cu-res"; d.style.setProperty("--c", COLORES[c.col]);
      d.innerHTML = "<b></b><span data-no-t></span>"; d.firstChild.textContent = t(c.t); d.lastChild.textContent = c.items.map(nombreItem).join(" · ");
      box.appendChild(d);
    });
  }
  function pintarRejilla() {
    const g = $("[data-rejilla]"); g.innerHTML = "";
    const libres = S.orden.filter((id) => !S.res.some((k) => S.puz.cats[k].items.indexOf(id) >= 0));
    libres.forEach((id) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "cu-ficha" + (S.sel.indexOf(id) >= 0 ? " sel" : ""); b.dataset.id = id; b.setAttribute("data-no-t", "");
      const n = nombreItem(id); b.textContent = n; if (n.length > 12) b.classList.add("larga"); else if (n.length > 9) b.classList.add("media");
      g.appendChild(b);
    });
    $("[data-cu=enviar]").disabled = S.sel.length !== 4 || S.fase !== "juego";
    $("[data-cu=quitar]").disabled = !S.sel.length;
  }

  function empezar(modo) {
    clearTimeout(timer);
    const d = datos();
    S.modo = modo; S.fallos = 0; S.pistas = 0; S.res = []; S.sel = []; S.hist = []; S.probados = {}; S.tikis = 0; S.ocupado = false;
    if (modo === "diario") { S.puz = generar(mulberry(semillaDia())); S.num = numDia(); }
    else { S.puz = generar(Math.random); S.num = 0; }
    if (!S.puz) { S.puz = generar(Math.random); }
    S.orden = S.puz.tiles.slice(); S.fase = "juego"; au.activar();
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true;
    $("[data-modo-txt]").textContent = modo === "diario" ? t("Reto diario") + " #" + S.num : t("Modo libre");
    msg(""); pintarVidas(); pintarPistas(); pintarResueltos(); pintarRejilla();
    if (!d.vistoAyuda) { d.vistoAyuda = 1; try { api.guardar(); } catch (e) { /* opcional */ } }
  }
  function alternar(id) {
    if (S.fase !== "juego" || S.ocupado) return;
    const i = S.sel.indexOf(id);
    if (i >= 0) { S.sel.splice(i, 1); au.quita(); } else if (S.sel.length < 4) { S.sel.push(id); au.sel(S.sel.length - 1); }
    pintarRejilla();
  }
  function enviar() {
    if (S.fase !== "juego" || S.sel.length !== 4 || S.ocupado) return;
    const clave = S.sel.slice().sort().join("|");
    if (S.probados[clave]) { msg("Ya lo habías probado", "aviso"); return; }
    S.probados[clave] = 1;
    const cuenta = S.puz.cats.map((c, k) => (S.res.indexOf(k) >= 0 ? -1 : c.items.filter((i) => S.sel.indexOf(i) >= 0).length));
    const k = cuenta.indexOf(4);
    if (k >= 0) { acierto(k); return; }
    S.fallos++; pintarVidas();
    const cerca = cuenta.indexOf(3) >= 0;
    S.hist.push(S.sel.map((id) => { const q = S.puz.cats.findIndex((c) => c.items.indexOf(id) >= 0); return S.puz.cats[q].col; }));
    if (cerca) { au.casi(); msg("¡Casi! Te falta uno", "casi"); } else { au.mal(); msg("Ese grupo no es", "mal"); }
    sacudir();
    S.sel = [];
    if (S.fallos >= MAX_FALLOS) { setTimeout(function () { if (vivo) terminar(false); }, 700); }
    pintarRejilla();
  }
  function sacudir() { if (reducido) return; const g = $("[data-rejilla]"); g.classList.remove("cu-sacude"); void g.offsetWidth; g.classList.add("cu-sacude"); }
  function acierto(k) {
    S.hist.push([S.puz.cats[k].col, S.puz.cats[k].col, S.puz.cats[k].col, S.puz.cats[k].col]);
    S.res.push(k); S.sel = []; au.grupo(S.res.length); msg("");
    pintarResueltos(); pintarRejilla();
    if (S.res.length >= 3) { const r = S.puz.cats.findIndex((c, q) => S.res.indexOf(q) < 0); setTimeout(function () { if (!vivo || S.fase !== "juego") return; S.hist.push([S.puz.cats[r].col, S.puz.cats[r].col, S.puz.cats[r].col, S.puz.cats[r].col]); S.res.push(r); au.grupo(4); pintarResueltos(); pintarRejilla(); terminar(true); }, 600); }
  }
  function pista() {
    if (S.fase !== "juego" || S.pistas >= MAX_PISTAS) return;
    const pend = S.puz.cats.map((c, k) => k).filter((k) => S.res.indexOf(k) < 0).sort((a, b) => S.puz.cats[a].d - S.puz.cats[b].d);
    if (pend.length < 2) return;
    S.pistas++; au.pista(); const c = S.puz.cats[pend[0]];
    msg(t("Pista") + ": " + t(c.t), "pista"); pintarPistas();
  }
  function mezclar() { if (S.fase !== "juego") return; S.orden = barajar(S.orden, Math.random); au.mezcla(); pintarRejilla(); }
  function quitar() { if (S.fase !== "juego") return; S.sel = []; pintarRejilla(); }

  function textoGrid() { return S.hist.map((f) => f.map((c) => CUAD[c]).join("")).join("\n"); }
  function terminar(gana) {
    S.fase = "fin"; S.sel = []; pintarPistas();
    const d = datos(); d.part++; d.pistas += S.pistas; if (gana) d.gan++;
    let tiki = false;
    if (S.modo === "diario") {
      d.dia = hoyTxt(); d.res = gana ? "g" : "p"; d.grid = textoGrid() + "|" + S.num;
      d.racha = gana ? (d.rachaAyer === ayerTxt() ? (d.racha || 0) + 1 : 1) : 0; if (gana) d.rachaAyer = hoyTxt(); if (!gana) d.rachaAyer = "";
      if (d.racha > d.mejor) d.mejor = d.racha;
      if (gana) tiki = true;
    } else if (gana) { d.libre++; if (d.libre % 3 === 0) tiki = true; }
    if (tiki) { try { api.tiki(); } catch (e) { /* opcional */ } S.tikis = 1; au.tiki(); }
    try { api.guardar(); } catch (e) { /* opcional */ }
    if (gana) au.gana(); else { au.pierde(); S.puz.cats.forEach((c, k) => { if (S.res.indexOf(k) < 0) S.res.push(k); }); pintarResueltos(); pintarRejilla(); }
    setTimeout(function () { if (!vivo) return; mostrarFin(gana); if (gana) { try { api.victoria(); } catch (e) { /* opcional */ } } }, gana ? 900 : 1300);
  }
  function ayerTxt() { const d = new Date(Date.now() - 864e5); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function mostrarFin(gana) {
    $("[data-fin]").hidden = false;
    $("[data-fin-kicker]").textContent = t(S.modo === "diario" ? "Reto diario" : "Modo libre") + (S.modo === "diario" ? " #" + S.num : "");
    $("[data-fin-titulo]").textContent = t(gana ? (S.fallos === 0 ? "¡Perfecto! Sin fallos" : "¡Lo has resuelto!") : "Casi lo tenías");
    $("[data-fin-grid]").textContent = textoGrid(); $("[data-fin-tiki]").hidden = !S.tikis;
    $("[data-cu=compartir]").hidden = S.modo !== "diario";
  }
  function compartir() {
    const d = datos(), g = d.grid ? d.grid.split("|")[0] : textoGrid(), n = S.modo === "diario" ? S.num : (d.grid ? d.grid.split("|")[1] : "");
    const txt = "CUARTETOS TIKITEXTO #" + n + " · " + (S.fallos >= MAX_FALLOS ? "X" : (MAX_FALLOS - S.fallos) + "/" + MAX_FALLOS) + "\n" + g + "\nhttps://tikitexto.com/?modo=cuartetos";
    const aviso = () => { const e = $("[data-comp-txt]"); e.textContent = t("¡Copiado!"); setTimeout(function () { if (vivo) e.textContent = t("Compartir resultado"); }, 1800); };
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { navigator.share({ text: txt }).catch(function () { /* cancelado */ }); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(aviso, function () { /* sin permiso */ });
    else { const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); aviso(); } catch (e) { /* opcional */ } a.remove(); }
  }
  function pintarMenu() {
    const d = datos(), hecho = d.dia === hoyTxt();
    $("[data-st-racha]").textContent = String(d.rachaAyer === hoyTxt() || d.rachaAyer === ayerTxt() ? d.racha : 0); $("[data-st-gan]").textContent = String(d.gan); $("[data-st-part]").textContent = String(d.part);
    $("[data-diario-txt]").textContent = t(hecho ? "Ver resultado de hoy" : "Reto de hoy");
    $("[data-diario-sub]").textContent = "#" + numDia();
  }
  function irMenu() { S.fase = "menu"; $("[data-fin]").hidden = true; $("[data-menu]").hidden = false; pintarMenu(); }
  function diario() {
    const d = datos();
    if (d.dia === hoyTxt() && d.grid) {
      S.modo = "diario"; S.num = numDia(); S.fallos = d.res === "g" ? 0 : MAX_FALLOS; S.hist = d.grid.split("|")[0].split("\n").map((l) => Array.from(l).map((ch) => CUAD.indexOf(ch)));
      S.fallos = Math.max(0, S.hist.filter((f) => !(f[0] === f[1] && f[1] === f[2] && f[2] === f[3])).length); S.tikis = 0; S.fase = "fin";
      $("[data-menu]").hidden = true; mostrarFin(d.res === "g"); return;
    }
    empezar("diario");
  }
  function cerrar() {
    if (!vivo) return; vivo = false; clearTimeout(timer);
    document.removeEventListener("keydown", onKey);
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  const onKey = (e) => {
    if (e.code === "Escape") { if (S.fase === "juego") irMenu(); else cerrar(); }
    else if (e.code === "Enter" && S.fase === "juego") { e.preventDefault(); enviar(); }
  };
  raiz.addEventListener("click", function (e) {
    const f = e.target.closest && e.target.closest(".cu-ficha"); if (f) { alternar(f.dataset.id); return; }
    const b = e.target.closest && e.target.closest("[data-cu]"); if (!b) return;
    const a = b.dataset.cu;
    if (a === "salir") cerrar(); else if (a === "diario") diario(); else if (a === "libre") empezar("libre"); else if (a === "enviar") enviar();
    else if (a === "mezclar") mezclar(); else if (a === "quitar") quitar(); else if (a === "pista") pista(); else if (a === "menu") irMenu(); else if (a === "ayuda") irMenu(); else if (a === "compartir") compartir();
  });
  raiz.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", onKey);
  pintarMenu();
  /* Solo para las pruebas automáticas */
  function resolverGrupo() { const k = S.puz.cats.findIndex((c, q) => S.res.indexOf(q) < 0); if (k < 0) return false; S.sel = S.puz.cats[k].items.slice(); pintarRejilla(); enviar(); return true; }
  function fallar() {
    const pend = S.puz.cats.map((c, k) => k).filter((k) => S.res.indexOf(k) < 0); if (pend.length < 2) return;
    for (let i = 0; i < 80; i++) {
      const A = S.puz.cats[pend[0]].items, B = S.puz.cats[pend[1]].items, mezcla = barajar(A, Math.random).slice(0, 2).concat(barajar(B, Math.random).slice(0, 2));
      if (S.probados[mezcla.slice().sort().join("|")]) continue;
      S.sel = mezcla; pintarRejilla(); enviar(); return;
    }
  }
  return { cerrar: cerrar, S: S, empezar: empezar, resolverGrupo: resolverGrupo, fallar: fallar, generar: generar, DB: DB, mulberry: mulberry, enviar: enviar };
}
