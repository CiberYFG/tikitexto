/* ¿A QUÉ PERTENECE? · TIKITEXTO (16-nov-2026) · juego de letras
   Arriba aparece un jugador, un club o un estadio y abajo hay cuatro opciones: hay que pulsar a qué pertenece.
   Cada ronda es más difícil (preguntas más enrevesadas, trampas más parecidas y menos tiempo). 3 fallos y se acaba el partido.
   Módulo ES; usa las tablas de cuartetos_datos.js; sonidos sintetizados; sin escudos, fotos ni logos. */
import { JUGADORES, CLUBES, SELECCIONES, POSICIONES, CLUBES_PAIS, ESTADIOS_PAIS } from "./cuartetos_datos.js";

const VIDAS = 3, T0 = 15, T_MIN = 6, PAUSA = 1500, UMBRALES_TIKI = [12, 25];
const PAIS_CLUB = { RM: "ES", FCB: "ES", ATM: "ES", BAY: "DE", JUV: "IT", MIL: "IT", INT: "IT", MUN: "EN", LIV: "EN", CHE: "EN", ARS: "EN", MCI: "EN", PSG: "FR" };
const POS_SING = { P: "Portero", D: "Defensa", M: "Centrocampista", F: "Delantero" };
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[irnd(a.length)];
const barajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = irnd(i + 1), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const J = JUGADORES.filter((j) => j.c.length >= 1);
const famoso = (j) => j.b || j.w || j.c.length >= 3;
const FAM = J.filter(famoso);
const CLUB_KEYS = Object.keys(CLUBES);
const PAISES_E = Object.keys(ESTADIOS_PAIS), PAISES_C = Object.keys(CLUBES_PAIS);

/* ── Generación de preguntas ── */
/* Cada pregunta: { tipo, enun, sujeto, ops: [{ txt, ok, trad }], clave } con exactamente UNA opción correcta */
function opciones(correcta, malas, trad) {
  const ops = [{ txt: correcta, ok: true, trad: !!trad }].concat(malas.map((m) => ({ txt: m, ok: false, trad: !!trad })));
  return barajar(ops);
}
function otrosDistintos(pool, excluir, n, pref) {
  const libres = pool.filter((x) => excluir.indexOf(x) < 0);
  const pr = pref ? barajar(libres.filter(pref)) : [], resto = barajar(libres.filter((x) => !pref || !pref(x)));
  return pr.concat(resto).slice(0, n);
}
const TIPOS = {
  estadio_pais: { d: 0, w: 3, f: function () {
    const pais = pick(PAISES_E), e = pick(ESTADIOS_PAIS[pais]);
    return { enun: "¿De qué país es este estadio?", sujeto: e, ops: opciones(pais, otrosDistintos(PAISES_E, [pais], 3), true), clave: "e:" + e };
  } },
  club_pais: { d: 0, w: 3, f: function () {
    const pais = pick(PAISES_C), c = pick(CLUBES_PAIS[pais]);
    return { enun: "¿De qué país es este club?", sujeto: c, ops: opciones(pais, otrosDistintos(PAISES_C, [pais], 3), true), clave: "k:" + c };
  } },
  jug_sel: { d: 0, w: 4, f: function (d) {
    const j = pick(d < 2 ? FAM : J), keys = Object.keys(SELECCIONES);
    return { enun: "¿Con qué selección juega o jugó?", sujeto: j.n, ops: opciones(SELECCIONES[j.s], otrosDistintos(keys, [j.s], 3).map((k) => SELECCIONES[k]), true), clave: "p:" + j.n };
  } },
  jug_pos: { d: 1, w: 3, f: function (d) {
    const j = pick(d < 3 ? FAM : J);
    return { enun: "¿En qué posición jugaba?", sujeto: j.n, ops: ["P", "D", "M", "F"].map((p) => ({ txt: POS_SING[p], ok: p === j.p, trad: true })), clave: "p:" + j.n, fijo: true };
  } },
  marca_w: { d: 1, w: 3, f: function (d) {
    const j = pick(FAM.filter((x) => x.w)), pool = (d < 3 ? FAM : J).filter((x) => !x.w);
    const malos = otrosDistintos(pool, [], 3, d >= 3 ? (x) => x.p === j.p : null).map((x) => x.n);
    return { enun: "¿Quién fue campeón del mundo con su selección?", sujeto: "", ops: opciones(j.n, malos), clave: "w:" + j.n };
  } },
  jug_club: { d: 2, w: 4, f: function (d) {
    const j = pick(d < 3 ? FAM : J), k = pick(j.c), pais = PAIS_CLUB[k];
    const malos = otrosDistintos(CLUB_KEYS, j.c, 3, d >= 3 ? (x) => PAIS_CLUB[x] === pais : null).map((x) => CLUBES[x]);
    return { enun: "¿En cuál de estos clubes jugó?", sujeto: j.n, ops: opciones(CLUBES[k], malos), clave: "c:" + j.n };
  } },
  marca_b: { d: 2, w: 3, f: function (d) {
    const j = pick(J.filter((x) => x.b)), pool = FAM.filter((x) => !x.b);
    const malos = otrosDistintos(pool, [], 3, d >= 4 ? (x) => x.p === j.p || x.s === j.s : null).map((x) => x.n);
    return { enun: "¿Quién ganó el Balón de Oro?", sujeto: "", ops: opciones(j.n, malos), clave: "b:" + j.n };
  } },
  club_jug: { d: 3, w: 4, f: function (d) {
    const k = pick(CLUB_KEYS), con = (d < 4 ? FAM : J).filter((x) => x.c.indexOf(k) >= 0); if (!con.length) return null;
    const j = pick(con), sin = (d < 4 ? FAM : J).filter((x) => x.c.indexOf(k) < 0);
    const malos = otrosDistintos(sin, [], 3, d >= 4 ? (x) => x.p === j.p || x.s === j.s : null).map((x) => x.n);
    return { enun: "¿Qué jugador pasó por este club?", sujeto: CLUBES[k], ops: opciones(j.n, malos), clave: "j:" + k + j.n };
  } },
  jug_no_club: { d: 4, w: 4, f: function () {
    const j = pick(J.filter((x) => x.c.length >= 3)), noJug = CLUB_KEYS.filter((k) => j.c.indexOf(k) < 0); if (!noJug.length) return null;
    const k = pick(noJug), tres = barajar(j.c).slice(0, 3);
    return { enun: "¿En cuál de estos clubes NO jugó?", sujeto: j.n, ops: opciones(CLUBES[k], tres.map((x) => CLUBES[x])), clave: "n:" + j.n };
  } },
};

export function dificultad(r) { return Math.min(5, Math.floor((r - 1) / 3)); }
export function tiempo(r) { return Math.max(T_MIN, T0 - 0.6 * (r - 1)); }
export function generar(r, usados) {
  const d = dificultad(r);
  for (let i = 0; i < 40; i++) {
    const cand = Object.keys(TIPOS).filter((k) => TIPOS[k].d <= d), pesos = cand.map((k) => TIPOS[k].w * (TIPOS[k].d < d - 1 ? Math.max(0.25, 1 - 0.22 * (d - TIPOS[k].d)) : 1));
    let x = Math.random() * pesos.reduce((a, b) => a + b, 0), tipo = cand[0]; for (let q = 0; q < cand.length; q++) { if ((x -= pesos[q]) <= 0) { tipo = cand[q]; break; } }
    const p = TIPOS[tipo].f(d); if (!p) continue;
    const textos = p.ops.map((o) => o.txt); if (new Set(textos).size !== 4) continue;
    if (usados && usados.has(p.clave)) continue;
    p.tipo = tipo; return p;
  }
  const p = TIPOS.jug_sel.f(0); p.tipo = "jug_sel"; return p;
}

const PLANTILLA = `
<div class="pe-fondo"></div>
<div class="pe-cab">
  <button type="button" class="pe-btn" data-pe="salir" aria-label="Salir">✕</button>
  <div class="pe-marc"><small data-ronda data-no-t>Ronda 1</small><b data-pts data-no-t>0</b></div>
  <div class="pe-vidas" data-vidas data-no-t></div>
</div>
<div class="pe-tiempo"><i data-barra></i></div>
<div class="pe-info" data-info></div>
<div class="pe-carta" data-carta>
  <p class="pe-enun" data-enun></p>
  <h3 class="pe-sujeto" data-sujeto data-no-t></h3>
</div>
<div class="pe-ops" data-ops></div>
<div class="pe-menu" data-menu>
  <div class="pe-caja">
    <p class="pe-kicker">Juego de letras</p>
    <h2 class="pe-titulo"><span>¿A QUÉ</span><span>PERTENECE?</span></h2>
    <p class="pe-sub">Te mostramos un jugador, un club o un estadio y tú eliges a qué pertenece. Cada ronda es más difícil y el tiempo baja.</p>
    <ul class="pe-como">
      <li><b>1</b><span>Lee lo que aparece arriba.</span></li>
      <li><b>2</b><span>Pulsa la opción correcta antes de que se acabe el tiempo.</span></li>
      <li><b>3</b><span>Con 3 fallos termina el partido.</span></li>
    </ul>
    <p class="pe-stats" data-stats data-no-t></p>
    <button type="button" class="pe-jugar" data-pe="jugar">¡Jugar!</button>
    <button type="button" class="pe-sec" data-pe="salir">Salir</button>
  </div>
</div>
<div class="pe-fin" data-fin hidden>
  <div class="pe-caja pe-caja--s">
    <h3>Fin del partido</h3>
    <p class="pe-res" data-fin-m data-no-t></p>
    <p class="pe-res" data-fin-r data-no-t></p>
    <p class="pe-tikis" data-fin-tiki hidden>⚡ +1 tikitexto</p>
    <button type="button" class="pe-jugar" data-pe="jugar">Jugar otra vez</button>
    <button type="button" class="pe-sec" data-pe="salir">Salir</button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  const datos = () => { const d = api.datos(); ["mejor", "aciertos", "part", "tiki"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { fase: "menu", r: 0, vidas: VIDAS, pts: 0, racha: 0, ac: 0, q: null, usados: new Set(), lim: 15, t0: 0, tikis: 0, bloq: false };
  let raf = 0, vivo = true, ctx = null, hSig = 0;

  /* sonidos sintetizados */
  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonBien = () => { blip(660, 0.1, 0.08, "triangle"); blip(990, 0.2, 0.08, "triangle", 0, 0.09); };
  const sonMal = () => { blip(220, 0.28, 0.09, "sawtooth", 110); };
  const sonTic = () => blip(880, 0.04, 0.03, "square");
  const sonNivel = () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.14, 0.07, "square", 0, i * 0.09)); };

  function pintaVidas() { let h = ""; for (let i = 0; i < VIDAS; i++) h += '<i class="' + (i < S.vidas ? "on" : "") + '">⚽</i>'; $("[data-vidas]").innerHTML = h; }
  function pintaHud() { $("[data-ronda]").textContent = t("Ronda " + Math.max(1, S.r)); $("[data-pts]").textContent = String(S.pts); }
  function info(txt, cls) { const e = $("[data-info]"); e.className = "pe-info" + (cls ? " " + cls : ""); e.textContent = txt ? t(txt) : ""; }
  function pintaStats() { const d = datos(); $("[data-stats]").textContent = d.mejor ? "🏆 " + d.mejor + " · " + d.aciertos + " ✔ · " + d.part + " ⚽" : ""; }

  function siguiente() {
    S.r++; S.bloq = false; S.q = generar(S.r, S.usados); S.usados.add(S.q.clave);
    S.lim = tiempo(S.r); S.t0 = performance.now(); S.fase = "pregunta";
    $("[data-enun]").textContent = t(S.q.enun); $("[data-sujeto]").textContent = S.q.sujeto; $("[data-sujeto]").hidden = !S.q.sujeto;
    $("[data-carta]").classList.remove("ok", "ko"); $("[data-carta]").style.animation = "none"; void $("[data-carta]").offsetWidth; $("[data-carta]").style.animation = "";
    const ops = $("[data-ops]"); ops.innerHTML = "";
    S.q.ops.forEach(function (o, i) {
      const b = document.createElement("button"); b.type = "button"; b.className = "pe-op"; b.dataset.i = String(i);
      b.innerHTML = '<kbd>' + (i + 1) + '</kbd><span></span>'; b.lastChild.textContent = o.trad ? t(o.txt) : o.txt; if (!o.trad) b.lastChild.setAttribute("data-no-t", ""); ops.appendChild(b);
    });
    const nivel = dificultad(S.r);
    if (S.r > 1 && (S.r - 1) % 3 === 0) { info("¡Nivel " + (nivel + 1) + "!", "aviso"); sonNivel(); } else info("", "");
    pintaHud();
  }
  function responder(i) {
    if (S.fase !== "pregunta" || S.bloq) return; S.bloq = true; S.fase = "resp";
    const q = S.q, o = i == null ? null : q.ops[i], ok = !!(o && o.ok), resto = Math.max(0, S.lim - (performance.now() - S.t0) / 1000);
    $$(".pe-op").forEach(function (b, k) { b.disabled = true; if (q.ops[k].ok) b.classList.add("bien"); else if (k === i) b.classList.add("mal"); });
    if (ok) {
      S.racha++; S.ac++; const ganados = 100 + Math.round(resto / S.lim * 100) + 10 * Math.min(S.racha, 10); S.pts += ganados;
      info("¡Correcto! +" + ganados, "bien"); $("[data-carta]").classList.add("ok"); sonBien();
      UMBRALES_TIKI.forEach(function (u) { if (S.ac === u) { S.tikis++; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } info("⚡ +1 tikitexto", "bien"); } });
    } else {
      S.racha = 0; S.vidas--; pintaVidas(); const correcta = q.ops.find((x) => x.ok);
      const nom = correcta.trad ? t(correcta.txt) : correcta.txt;
      info((i == null ? "¡Se acabó el tiempo! · " : "") + "Respuesta: " + nom, "mal"); $("[data-carta]").classList.add("ko"); sonMal();
    }
    pintaHud();
    clearTimeout(hSig); hSig = setTimeout(function () { if (!vivo) return; if (S.vidas <= 0) termina(); else siguiente(); }, ok ? 900 : PAUSA);
  }
  function termina() {
    S.fase = "fin"; const d = datos(); d.part++; d.aciertos = Math.max(d.aciertos, S.ac); const nuevo = S.pts > d.mejor; if (nuevo) d.mejor = S.pts; d.tiki += S.tikis;
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-fin-m]").textContent = t(S.ac + " aciertos · " + S.pts + " puntos"); $("[data-fin-r]").textContent = nuevo ? t("¡Nuevo récord!") : "🏆 " + d.mejor;
    $("[data-fin-tiki]").hidden = !S.tikis; $("[data-fin]").hidden = false; pintaStats();
  }
  function empezar() {
    audio(); Object.assign(S, { fase: "pregunta", r: 0, vidas: VIDAS, pts: 0, racha: 0, ac: 0, usados: new Set(), tikis: 0 });
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; pintaVidas(); siguiente();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(bucle);
  }
  let ultimoTic = 0;
  function bucle() {
    if (!vivo) return; raf = requestAnimationFrame(bucle);
    if (S.fase !== "pregunta") return;
    const resto = S.lim - (performance.now() - S.t0) / 1000, k = clamp(resto / S.lim, 0, 1), b = $("[data-barra]");
    b.style.transform = "scaleX(" + k.toFixed(4) + ")"; b.className = k < 0.25 ? "rojo" : k < 0.5 ? "ambar" : "";
    if (resto < 3 && Math.ceil(resto) !== ultimoTic) { ultimoTic = Math.ceil(resto); sonTic(); }
    if (resto <= 0) responder(null);
  }

  raiz.addEventListener("click", function (e) {
    audio();
    const op = e.target.closest ? e.target.closest(".pe-op") : null; if (op) { responder(+op.dataset.i); return; }
    const b = e.target.closest ? e.target.closest("[data-pe]") : null; if (!b) return;
    if (b.dataset.pe === "salir") cerrar(); else if (b.dataset.pe === "jugar") empezar();
  });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    if (S.fase === "pregunta" && /^[1-4]$/.test(e.key)) responder(+e.key - 1);
    else if ((e.key === "Enter" || e.key === " ") && (S.fase === "menu" || S.fase === "fin")) { e.preventDefault(); empezar(); }
  };
  window.addEventListener("keydown", onKey);
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf); clearTimeout(hSig); window.removeEventListener("keydown", onKey);
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  pintaVidas(); pintaHud(); pintaStats();
  /* Solo para las pruebas automáticas */
  return { cerrar: cerrar, S: S, empezar: empezar, responder: responder, generar: generar, dificultad: dificultad, tiempo: tiempo, siguiente: siguiente };
}
