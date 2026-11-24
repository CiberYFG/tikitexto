/* EL QUE GANA SE QUEDA · TIKITEXTO (24-nov-2026) · juego de letras / debate
   16 leyendas al azar de la lista del juego: se enfrentan de dos en dos, eliges a tu favorito y el ganador se queda para el siguiente duelo (15 duelos).
   Al final: tu campeón, el podio por duelos ganados y un texto para compartir. Sin servidor, sin tikitextos. Módulo ES; sonidos sintetizados; sin escudos ni fotos. */
import { JUGADORES, CLUBES, SELECCIONES, POSICIONES } from "./cuartetos_datos.js";

const N = 16;
const POS1 = { P: "Portero", D: "Defensa", M: "Centrocampista", F: "Delantero" };
export const CATS = [
  { k: "todos", n: "Todos", f: (j) => j.b || j.w || j.c.length >= 3 },
  { k: "F", n: "Delanteros", f: (j) => j.p === "F" },
  { k: "M", n: "Centrocampistas", f: (j) => j.p === "M" },
  { k: "PD", n: "Defensas y porteros", f: (j) => j.p === "D" || j.p === "P" },
  { k: "b", n: "Balón de Oro", f: (j) => j.b },
  { k: "w", n: "Campeón del mundo", f: (j) => j.w },
];
const barajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };

/* Elige N jugadores de la categoría (si hay pocos famosos, completa con el resto de la categoría). */
export function elegir(cat, rnd) {
  const c = CATS.find((x) => x.k === cat) || CATS[0];
  let pool = JUGADORES.filter(c.f);
  if (pool.length < N) { const resto = JUGADORES.filter((j) => pool.indexOf(j) < 0 && (cat === "todos" || c.f(j))); pool = pool.concat(resto); }
  if (pool.length < N) pool = pool.concat(JUGADORES.filter((j) => pool.indexOf(j) < 0));
  return (rnd ? rnd(pool) : barajar(pool)).slice(0, N);
}

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  raiz.innerHTML = `
<div class="qg-fondo" aria-hidden="true"></div>
<div class="qg-cab"><button type="button" class="qg-btn" data-qg="salir" aria-label="Salir">✕</button><span class="qg-prog" data-prog hidden></span></div>
<section class="qg-menu" data-menu>
  <div class="qg-caja">
    <p class="qg-kicker">Debate de fútbol</p>
    <h2 class="qg-titulo"><span>EL QUE GANA</span><span>SE QUEDA</span></h2>
    <p class="qg-sub">Dos leyendas frente a frente: elige a tu favorito y el ganador se queda para el siguiente duelo.</p>
    <div class="qg-cats" data-cats></div>
    <button type="button" class="qg-jugar" data-qg="jugar">Jugar</button>
    <p class="qg-stats" data-stats data-no-t></p>
  </div>
</section>
<section class="qg-juego" data-juego hidden>
  <p class="qg-pista">¿Quién es mejor?</p>
  <div class="qg-duelo">
    <button type="button" class="qg-carta" data-lado="0"></button>
    <span class="qg-vs" aria-hidden="true">VS</span>
    <button type="button" class="qg-carta" data-lado="1"></button>
  </div>
  <p class="qg-racha" data-racha-q data-no-t></p>
</section>
<section class="qg-fin" data-fin hidden>
  <div class="qg-caja">
    <p class="qg-kicker">Tu campeón</p>
    <div class="qg-trofeo" aria-hidden="true">🏆</div>
    <h3 class="qg-camp" data-camp data-no-t></h3>
    <p class="qg-sub" data-camp-d></p>
    <ol class="qg-podio" data-podio data-no-t></ol>
    <button type="button" class="qg-jugar" data-qg="comp">Compartir resultado</button>
    <p class="qg-msg" data-msg role="status"></p>
    <div class="qg-fila"><button type="button" class="qg-sec" data-qg="otra">Jugar otra vez</button><button type="button" class="qg-sec" data-qg="menu">Menú</button></div>
  </div>
</section>`;
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  const datos = () => { const d = api.datos(); ["part", "campeones", "mejorRacha"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { cat: "todos", q: [], camp: null, i: 0, vic: [], racha: 0, mejor: 0, fase: "menu", bloq: false, texto: "" };
  let vivo = true, ctx = null, tmr = 0;

  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonElige = () => { blip(520, 0.07, 0.06, "triangle"); blip(780, 0.12, 0.06, "triangle", 0, 0.06); };
  const sonFin = () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.16, 0.07, "square", 0, i * 0.1)); };

  function pintaCats() {
    $("[data-cats]").innerHTML = CATS.map((c) => '<button type="button" class="qg-chip' + (c.k === S.cat ? " on" : "") + '" data-cat="' + c.k + '" aria-pressed="' + (c.k === S.cat) + '">' + t(c.n) + "</button>").join("");
    const d = datos();
    $("[data-stats]").textContent = d.part ? "🏆 " + d.campeones + " · 🔥 " + d.mejorRacha + " · ⚽ " + d.part : "";
  }
  function cartaHtml(j, lado) {
    const clubes = j.c.map((k) => CLUBES[k]).join(" · ");
    const marcas = (j.b ? '<span class="qg-marca">🏆 ' + t("Balón de Oro") + "</span>" : "") + (j.w ? '<span class="qg-marca">🌍 ' + t("Campeón del mundo") + "</span>" : "");
    return '<span class="qg-pos">' + t(POS1[j.p]) + " · " + t(SELECCIONES[j.s]) + '</span><span class="qg-nom" data-no-t>' + esc(j.n) + '</span><span class="qg-clubes" data-no-t>' + esc(clubes) + "</span>" + (marcas ? '<span class="qg-marcas">' + marcas + "</span>" : "") + '<span class="qg-tecla" aria-hidden="true" data-no-t>' + (lado + 1) + "</span>";
  }
  function pintaDuelo() {
    const a = S.camp, b = S.q[S.i];
    const cs = $$("[data-lado]");
    cs[0].innerHTML = cartaHtml(a, 0); cs[1].innerHTML = cartaHtml(b, 1);
    cs[0].setAttribute("aria-label", a.n); cs[1].setAttribute("aria-label", b.n);
    cs.forEach((c) => c.classList.remove("gana", "pierde", "entra"));
    cs[1].classList.add("entra");
    $("[data-prog]").hidden = false; $("[data-prog]").textContent = t("Duelo") + " " + S.i + "/" + (N - 1);
    $("[data-racha-q]").textContent = S.racha >= 2 ? "🔥 " + S.racha : "";
  }

  function empezar(cat) {
    audio(); if (cat) S.cat = cat;
    S.q = elegir(S.cat); S.camp = S.q[0]; S.i = 1; S.vic = S.q.map(() => 0); S.racha = 0; S.mejor = 0; S.fase = "juego"; S.bloq = false;
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; $("[data-juego]").hidden = false;
    pintaDuelo();
    return S;
  }
  function elige(lado) {
    if (S.fase !== "juego" || S.bloq || !vivo) return;
    S.bloq = true; audio(); sonElige();
    const a = S.camp, b = S.q[S.i], gana = lado === 0 ? a : b;
    const cs = $$("[data-lado]"); cs[lado].classList.add("gana"); cs[1 - lado].classList.add("pierde");
    S.vic[S.q.indexOf(gana)]++;
    S.racha = gana === a ? S.racha + 1 : 1; S.mejor = Math.max(S.mejor, S.racha);
    S.camp = gana; S.i++;
    clearTimeout(tmr);
    tmr = setTimeout(() => { S.bloq = false; if (S.i >= N) terminar(); else pintaDuelo(); }, 650);
  }
  function terminar() {
    S.fase = "fin"; clearTimeout(tmr); S.bloq = false;
    const d = datos(); d.part++; d.campeones++; d.mejorRacha = Math.max(d.mejorRacha, S.mejor); try { api.guardar(); } catch (e) { /* opcional */ }
    const orden = S.q.map((j, i) => ({ j, v: S.vic[i], i })).sort((x, y) => (x.j === S.camp ? -1 : y.j === S.camp ? 1 : 0) || y.v - x.v || x.i - y.i).slice(0, 3);
    $("[data-juego]").hidden = true; $("[data-prog]").hidden = true; $("[data-fin]").hidden = false;
    $("[data-camp]").textContent = S.camp.n;
    $("[data-camp-d]").textContent = t(SELECCIONES[S.camp.s]) + " · " + t(POS1[S.camp.p]);
    const med = ["🥇", "🥈", "🥉"];
    $("[data-podio]").innerHTML = orden.map((o, i) => "<li><i>" + med[i] + "</i><b>" + esc(o.j.n) + "</b><span>" + o.v + "</span></li>").join("");
    S.texto = "EL QUE GANA SE QUEDA · TIKITEXTO\n" + orden.map((o, i) => med[i] + " " + o.j.n).join("\n") + "\nhttps://tikitexto.com/?modo=queda";
    $("[data-msg]").textContent = "";
    sonFin();
    return S;
  }
  async function compartir() {
    try { if (navigator.share) { await navigator.share({ text: S.texto }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    try { await navigator.clipboard.writeText(S.texto); $("[data-msg]").textContent = t("¡Copiado!"); } catch (e) { /* sin portapapeles */ }
  }
  function menu() { S.fase = "menu"; clearTimeout(tmr); $("[data-juego]").hidden = true; $("[data-fin]").hidden = true; $("[data-prog]").hidden = true; $("[data-menu]").hidden = false; pintaCats(); }
  function cerrar() { if (!vivo) return; vivo = false; clearTimeout(tmr); document.removeEventListener("keydown", tecla); try { if (ctx) ctx.close(); } catch (e) { /* ya cerrado */ } api.salir(); }
  function tecla(e) {
    if (e.key === "Escape") { if (S.fase === "juego") menu(); else cerrar(); return; }
    if (S.fase !== "juego") return;
    if (e.key === "ArrowLeft" || e.key === "1") elige(0); else if (e.key === "ArrowRight" || e.key === "2") elige(1);
  }
  raiz.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]"); if (c) { S.cat = c.dataset.cat; pintaCats(); return; }
    const l = e.target.closest("[data-lado]"); if (l) { elige(+l.dataset.lado); return; }
    const b = e.target.closest("[data-qg]"); if (!b) return;
    const a = b.dataset.qg;
    if (a === "salir") cerrar(); else if (a === "jugar" || a === "otra") empezar(); else if (a === "menu") menu(); else if (a === "comp") compartir();
  });
  document.addEventListener("keydown", tecla);
  pintaCats();
  return { cerrar, S, empezar, elige, terminar, elegir, CATS, N, compartir };
}
