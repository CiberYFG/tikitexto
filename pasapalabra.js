/* PASAPALABRA TIKITEXTO (16-nov-2026) · juego de letras
   Un rosco de 26 letras: cada una tiene una pista (empieza por… o contiene la…) sobre un jugador, un club o un estadio.
   Se escribe la respuesta, se puede decir «Pasapalabra» para saltar y volver más tarde, y hay 3 minutos para todo el rosco.
   Módulo ES; las pistas se generan desde las tablas de cuartetos_datos.js (por eso se traducen a los 6 idiomas con patrones);
   sonidos sintetizados; sin escudos, fotos ni logos. */
import { JUGADORES, CLUBES, SELECCIONES, CLUBES_PAIS, ESTADIOS_PAIS } from "./cuartetos_datos.js";

const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TIEMPO = 180, COSTE_PISTA = 10, UMBRALES_TIKI = [15, 26], PAUSA_FALLO = 800;
const POS_SING = { P: "Portero", D: "Defensa", M: "Centrocampista", F: "Delantero" };
const PARTICULAS = ["de", "del", "van", "von", "da", "di", "jr", "la", "le"];
const irnd = (n) => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const barajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = irnd(i + 1), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
export const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/ı/g, "i").replace(/ø/g, "o").replace(/æ/g, "ae").replace(/œ/g, "oe").replace(/ł/g, "l").replace(/đ/g, "d").replace(/ß/g, "ss").replace(/[^a-z0-9]/g, "");
const esLetra = (c) => /[a-z]/.test(norm(c));

/* ── Reserva de respuestas ── */
const POOL = [];
JUGADORES.forEach((j) => {
  if (j.c.length < 1) return;
  const clubes = j.c.map((k) => CLUBES[k]);
  POOL.push({ n: j.n, tipo: "j", pos: POS_SING[j.p], pais: SELECCIONES[j.s], clubes: clubes, b: j.b, w: j.w, hechos: ["j", j.p, j.s, clubes.join(","), j.b ? "b" : "", j.w ? "w" : ""].join("|") });
});
Object.keys(CLUBES_PAIS).forEach((p) => CLUBES_PAIS[p].forEach((c) => POOL.push({ n: c, tipo: "c", pais: p, hechos: "c|" + p })));
Object.keys(ESTADIOS_PAIS).forEach((p) => ESTADIOS_PAIS[p].forEach((c) => POOL.push({ n: c, tipo: "e", pais: p, hechos: "e|" + p })));
POOL.forEach((e) => {
  e.norm = norm(e.n); e.inicial = e.norm.charAt(0).toUpperCase();
  e.alias = e.n.split(/[\s\-]+/).map(norm).filter((x) => x.length >= 3 && PARTICULAS.indexOf(x) < 0); e.alias.push(e.norm);
  e.palabras = e.n.split(/\s+/).length;
});

/* ── Comparación tolerante (una errata en nombres de 6+ letras) ── */
export function distancia(a, b) {
  if (a === b) return 0; if (Math.abs(a.length - b.length) > 1) return 2;
  const m = a.length, n = b.length; let prev = []; for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
/* Respuestas válidas: todas las entradas que encajan con la misma pista (mismos hechos, misma letra y, en clubes/estadios, mismo nº de letras) */
function validasDe(e, modo, L) {
  const nl = e.norm.length;
  return POOL.filter((x) => x.hechos === e.hechos && (modo === "e" ? x.inicial === L : x.norm.indexOf(L.toLowerCase()) >= 0) && (e.tipo === "j" || x.norm.length === nl));
}
export function acepta(item, texto) {
  const q = norm(texto); if (q.length < 2) return false;
  for (const v of item.validas) for (const a of v.alias) {
    if (q === a) return true;
    if (a.length >= 6 && q.length >= 5 && distancia(q, a) <= 1) return true;
  }
  return false;
}

/* ── Generación del rosco ── */
export function generar() {
  const usados = new Set(), rosco = [];
  LETRAS.forEach((L) => {
    let modo = "e", cand = POOL.filter((x) => x.inicial === L && !usados.has(x.n));
    if (!cand.length) { modo = "c"; cand = POOL.filter((x) => x.norm.indexOf(L.toLowerCase()) >= 0 && !usados.has(x.n) && x.norm.length >= 4); }
    /* Más peso a los jugadores y a los nombres de una palabra */
    const pesos = cand.map((x) => (x.tipo === "j" ? 3 : 1.4) * (x.palabras === 1 ? 2 : 1)), tot = pesos.reduce((a, b) => a + b, 0);
    let r = Math.random() * tot, e = cand[0]; for (let i = 0; i < cand.length; i++) { if ((r -= pesos[i]) <= 0) { e = cand[i]; break; } }
    usados.add(e.n);
    const it = { L: L, modo: modo, e: e, n: e.n, tipo: e.tipo, est: 0, pistas: modo === "e" ? 1 : 0 };
    it.validas = validasDe(e, modo, L); rosco.push(it);
  });
  return rosco;
}
const letrasDe = (n) => Array.prototype.filter.call(n, esLetra).length;
export function mascara(it) {
  let k = 0, out = [];
  Array.prototype.forEach.call(it.n, (c) => {
    if (!esLetra(c)) { out.push(c === " " ? "·" : c); return; }
    out.push(k < it.pistas ? c.toUpperCase() : "_"); k++;
  });
  return out.join(" ");
}

const PLANTILLA = `
<div class="pp-fondo"></div>
<div class="pp-cab">
  <button type="button" class="pp-btn" data-pp="salir" aria-label="Salir">✕</button>
  <div class="pp-marc"><span class="pp-ok" data-ok data-no-t>✓ 0</span><span class="pp-ko" data-ko data-no-t>✗ 0</span></div>
</div>
<div class="pp-rosco" data-rosco>
  <div class="pp-centro"><b class="pp-reloj" data-reloj data-no-t>3:00</b><small data-letra-grande data-no-t></small></div>
</div>
<div class="pp-carta" data-carta>
  <p class="pp-tit" data-tit></p>
  <div class="pp-pista" data-pista></div>
  <p class="pp-mask" data-mask data-no-t></p>
</div>
<div class="pp-rev" data-rev hidden></div>
<p class="pp-info" data-info></p>
<form class="pp-entra" data-form autocomplete="off">
  <input type="text" data-input class="pp-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="Escribe la respuesta" aria-label="Respuesta">
  <button type="submit" class="pp-resp">Responder</button>
</form>
<div class="pp-acc">
  <button type="button" class="pp-sec" data-pp="pasa">Pasapalabra</button>
  <button type="button" class="pp-sec" data-pp="pista">Pista · −10 s</button>
</div>
<div class="pp-menu" data-menu>
  <div class="pp-caja">
    <p class="pp-kicker">Juego de letras</p>
    <h2 class="pp-titulo">PASAPALABRA</h2>
    <p class="pp-sub">Completa el rosco: una pista por letra sobre jugadores, clubes y estadios. Tienes 3 minutos para todo el rosco.</p>
    <ul class="pp-como">
      <li><b>1</b><span>Cada letra tiene una pista: la respuesta empieza por esa letra o la contiene.</span></li>
      <li><b>2</b><span>Escribe el nombre y pulsa Responder. Si no lo sabes, di Pasapalabra y vuelves a ella al final.</span></li>
      <li><b>3</b><span>Un fallo no resta tiempo, pero esa letra ya no se puede recuperar.</span></li>
    </ul>
    <p class="pp-stats" data-stats data-no-t></p>
    <button type="button" class="pp-jugar" data-pp="jugar">¡Jugar!</button>
    <button type="button" class="pp-sec" data-pp="salir">Salir</button>
  </div>
</div>
<div class="pp-fin" data-fin hidden>
  <div class="pp-caja pp-caja--s">
    <h3 data-fin-t>Fin del rosco</h3>
    <p class="pp-res" data-fin-m data-no-t></p>
    <p class="pp-res" data-fin-r data-no-t></p>
    <p class="pp-tikis" data-fin-tiki hidden>⚡ +1 tikitexto</p>
    <p class="pp-lista" data-fin-lista data-no-t></p>
    <button type="button" class="pp-jugar" data-pp="jugar">Jugar otra vez</button>
    <button type="button" class="pp-sec" data-pp="salir">Salir</button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s);
  const datos = () => { const d = api.datos(); ["mejor", "maxAc", "part", "perf", "tiki"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { fase: "menu", rosco: [], i: 0, t0: 0, extra: 0, ok: 0, ko: 0, tikis: 0, bloq: false };
  let raf = 0, vivo = true, ctx = null, hSig = 0, ultimoTic = 0;
  const input = $("[data-input]"); input.placeholder = t("Escribe la respuesta");

  /* sonidos sintetizados */
  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonBien = () => { blip(660, 0.1, 0.08, "triangle"); blip(990, 0.2, 0.08, "triangle", 0, 0.09); };
  const sonMal = () => blip(220, 0.3, 0.09, "sawtooth", 110);
  const sonPasa = () => blip(440, 0.12, 0.05, "sine", 330);
  const sonTic = () => blip(880, 0.04, 0.03, "square");
  const sonFin = () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.16, 0.07, "square", 0, i * 0.1)); };

  /* rosco circular */
  const rosco = $("[data-rosco]"), bolas = [];
  LETRAS.forEach((L, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 26, b = document.createElement("i"); b.className = "pp-l"; b.textContent = L; b.setAttribute("data-no-t", ""); b.dataset.i = String(i);
    b.style.left = (50 + 44.5 * Math.cos(a)).toFixed(3) + "%"; b.style.top = (50 + 44.5 * Math.sin(a)).toFixed(3) + "%"; rosco.appendChild(b); bolas.push(b);
  });
  function pintaBolas() {
    bolas.forEach((b, i) => { const it = S.rosco[i]; b.className = "pp-l" + (it ? (it.est === 1 ? " ok" : it.est === 2 ? " ko" : it.est === 3 ? " pas" : "") : "") + (i === S.i && S.fase === "juego" ? " act" : ""); });
    $("[data-ok]").textContent = "✓ " + S.ok; $("[data-ko]").textContent = "✗ " + S.ko;
  }
  function info(txt, cls) { const e = $("[data-info]"); e.className = "pp-info" + (cls ? " " + cls : ""); e.textContent = txt ? t(txt) : ""; }
  function pintaStats() { const d = datos(); $("[data-stats]").textContent = d.mejor ? "🏆 " + d.mejor + " · " + d.maxAc + "/26 ✔ · " + d.part + " 🔤" : ""; }
  const restante = () => Math.max(0, TIEMPO - S.extra - (performance.now() - S.t0) / 1000);
  const fmt = (s) => { s = Math.ceil(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

  /* Tocar cualquier letra del rosco: dice si está acertada o fallada y su respuesta */
  let hRev = 0;
  function revisa(i) {
    const it = S.rosco[i], e = $("[data-rev]"); if (!it) return; const fin = S.fase === "fin";
    let est = it.est === 1 ? "ok" : it.est === 2 ? "ko" : "pend", txt = it.est === 1 ? "Correcta" : it.est === 2 ? "Fallada" : it.est === 3 ? "Pasapalabra" : "Pendiente";
    e.className = "pp-rev " + est; e.innerHTML = ""; const add = (s, cls, notr) => { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = s; if (notr) d.setAttribute("data-no-t", ""); e.appendChild(d); };
    add(it.L + " · " + t(txt), "pp-rev__t", true);
    if (it.est === 1 || it.est === 2 || fin) add(t("Respuesta: " + it.n), "pp-rev__r", true);
    if (it.est === 2 && it.resp) add(t("Tu respuesta: " + it.resp), "pp-rev__u", true);
    e.hidden = false; clearTimeout(hRev); hRev = setTimeout(() => { e.hidden = true; }, 4500);
  }
  function pintaCarta() {
    const it = S.rosco[S.i]; if (!it) return;
    $("[data-tit]").textContent = t((it.modo === "e" ? "Empieza por " : "Contiene la ") + it.L);
    const p = $("[data-pista]"); p.innerHTML = ""; const e = it.e, add = (txt, trad) => { const d = document.createElement("div"); d.textContent = txt; if (trad) d.setAttribute("data-no-t", ""); p.appendChild(d); };
    if (it.tipo === "j") {
      add(t(e.pos) + " · " + t(e.pais), true); add(t("Jugó en: " + e.clubes.join(" · ")), true);
      if (e.b) add("🏆 " + t("Balón de Oro"), true); if (e.w) add("🌍 " + t("Campeón del mundo"), true);
    } else if (it.tipo === "c") add(t("Club de " + t(e.pais)), true); else add(t("Estadio de " + t(e.pais)), true);
    $("[data-mask]").textContent = mascara(it); $("[data-letra-grande]").textContent = it.L;
    pintaBolas();
  }
  function buscaSiguiente(desde) {
    for (let k = 1; k <= 26; k++) { const j = (desde + k) % 26; if (S.rosco[j].est === 0 || S.rosco[j].est === 3) return j; }
    return -1;
  }
  function avanzar() {
    const j = buscaSiguiente(S.i);
    if (j < 0) { termina(false); return; }
    S.i = j; S.bloq = false; input.value = ""; info("", ""); pintaCarta(); try { input.focus({ preventScroll: true }); } catch (e) { /* opcional */ }
  }
  function responder(texto) {
    if (S.fase !== "juego" || S.bloq) return; const it = S.rosco[S.i]; const q = texto == null ? input.value : texto; if (norm(q).length < 1) return;
    if (acepta(it, q)) {
      it.est = 1; S.ok++; sonBien(); info("¡Correcto!", "bien");
      UMBRALES_TIKI.forEach((u) => { if (S.ok === u) { S.tikis++; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } info("⚡ +1 tikitexto", "bien"); } });
      pintaBolas(); avanzar();
    } else {
      it.est = 2; it.resp = q; S.ko++; S.bloq = true; sonMal(); info("Falló: era " + it.n, "mal"); pintaBolas();
      clearTimeout(hSig); hSig = setTimeout(() => { if (vivo && S.fase === "juego") avanzar(); }, PAUSA_FALLO);
    }
  }
  function pasa() {
    if (S.fase !== "juego" || S.bloq) return; const it = S.rosco[S.i]; it.est = 3; sonPasa(); info("Pasapalabra", "");
    avanzar();
  }
  function pista() {
    if (S.fase !== "juego" || S.bloq) return; const it = S.rosco[S.i];
    if (it.pistas >= letrasDe(it.n) - 1) { info("No quedan más pistas", "mal"); return; }
    it.pistas++; S.extra += COSTE_PISTA; sonPasa(); $("[data-mask]").textContent = mascara(it);
  }
  function termina(tiempo) {
    if (S.fase === "fin") return; S.fase = "fin"; clearTimeout(hSig); sonFin();
    const sobra = Math.round(restante()), perfecto = S.ok === 26, pts = S.ok * 100 + (S.ko === 0 && S.ok > 0 ? sobra * 3 : 0) + (perfecto ? 500 : 0);
    const d = datos(); d.part++; d.maxAc = Math.max(d.maxAc, S.ok); if (perfecto) d.perf++; const nuevo = pts > d.mejor; if (nuevo) d.mejor = pts; d.tiki += S.tikis;
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-fin-t]").textContent = t(perfecto ? "¡Rosco perfecto!" : tiempo ? "¡Se acabó el tiempo!" : "Rosco completado");
    $("[data-fin-m]").textContent = t(S.ok + " aciertos · " + S.ko + " fallos · " + pts + " puntos"); $("[data-fin-r]").textContent = nuevo ? t("¡Nuevo récord!") : "🏆 " + d.mejor;
    $("[data-fin-tiki]").hidden = !S.tikis;
    const faltan = S.rosco.filter((x) => x.est !== 1).map((x) => x.L + ": " + x.n); $("[data-fin-lista]").textContent = faltan.length ? faltan.join(" · ") : "";
    $("[data-fin-lista]").hidden = !faltan.length; $("[data-fin]").hidden = false; pintaBolas(); pintaStats();
  }
  function empezar() {
    audio(); clearTimeout(hSig);
    Object.assign(S, { fase: "juego", rosco: generar(), i: -1, t0: performance.now(), extra: 0, ok: 0, ko: 0, tikis: 0, bloq: false });
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; S.i = 25; avanzar(); ultimoTic = 0;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(bucle);
  }
  function bucle() {
    if (!vivo) return; raf = requestAnimationFrame(bucle);
    if (S.fase !== "juego") return;
    const r = restante(); $("[data-reloj]").textContent = fmt(r); $("[data-reloj]").classList.toggle("rojo", r <= 20);
    if (r <= 10 && Math.ceil(r) !== ultimoTic) { ultimoTic = Math.ceil(r); sonTic(); }
    if (r <= 0) termina(true);
  }

  $("[data-form]").addEventListener("submit", (e) => { e.preventDefault(); audio(); responder(); });
  raiz.addEventListener("click", (e) => {
    audio(); const bl = e.target.closest ? e.target.closest(".pp-l") : null; if (bl) { revisa(+bl.dataset.i); return; } const b = e.target.closest ? e.target.closest("[data-pp]") : null; if (!b) return;
    const k = b.dataset.pp; if (k === "salir") cerrar(); else if (k === "jugar") empezar(); else if (k === "pasa") { pasa(); try { input.focus({ preventScroll: true }); } catch (x) { /* opcional */ } } else if (k === "pista") { pista(); try { input.focus({ preventScroll: true }); } catch (x) { /* opcional */ } }
  });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    if ((e.key === "Enter" || e.key === " ") && (S.fase === "menu" || S.fase === "fin") && !(e.target && e.target.tagName === "BUTTON")) { e.preventDefault(); empezar(); }
    else if (e.key === "Tab" && S.fase === "juego") { e.preventDefault(); pasa(); }
  };
  window.addEventListener("keydown", onKey);
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf); clearTimeout(hSig); clearTimeout(hRev); window.removeEventListener("keydown", onKey);
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  pintaBolas(); pintaStats();
  /* Solo para las pruebas automáticas */
  return { revisa: revisa, cerrar: cerrar, S: S, empezar: empezar, responder: responder, pasa: pasa, pista: pista, generar: generar, acepta: acepta, mascara: mascara, termina: termina, POOL: POOL };
}
