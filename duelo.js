/* DUELO DE DATOS · TIKITEXTO (21-nov-2026) · juego de datos
   Dos jugadores, equipos, selecciones o entrenadores frente a frente: hay que pulsar quién tiene más Balones de Oro,
   Champions, goles, Mundiales… Usa las cifras del Comparador (comparador_datos.js). Cada ronda es más difícil (la diferencia
   entre los dos se estrecha y el tiempo baja). 3 fallos y se acaba. Módulo ES; sonidos sintetizados; sin escudos, fotos ni logos. */
const VIDAS = 3, T0 = 12, T_MIN = 5, PAUSA = 2100, UMBRALES_TIKI = [10, 25];
const rnd = (a, b) => a + Math.random() * (b - a);
const irnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[irnd(a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const dificultad = (r) => Math.min(5, Math.floor((r - 1) / 3));
export const tiempo = (r) => Math.max(T_MIN, T0 - 0.45 * (r - 1));
/* diferencia relativa mínima entre los dos valores según la dificultad */
const GAP = [0.55, 0.42, 0.3, 0.2, 0.12, 0.05];
const PESO_CAT = { jugadores: 5, equipos: 2, selecciones: 1.5, entrenadores: 1.5 };

const LANGS = ["es", "en", "pt", "fr", "it", "de"];
const UI = {
  kicker: ["Juego de datos", "Data game", "Jogo de dados", "Jeu de données", "Gioco di dati", "Datenspiel"],
  t1: ["DUELO", "DATA", "DUELO", "DUEL", "DUELLO", "DATEN-"], t2: ["DE DATOS", "DUEL", "DE DADOS", "DE DONNÉES", "DI DATI", "DUELL"],
  sub: ["Dos nombres frente a frente: elige quién tiene más. Las cifras salen del Comparador de TIKITEXTO.", "Two names face to face: pick who has more. The figures come from the TIKITEXTO Comparator.", "Dois nomes frente a frente: escolha quem tem mais. Os números vêm do Comparador do TIKITEXTO.", "Deux noms face à face : choisis qui en a le plus. Les chiffres viennent du Comparateur TIKITEXTO.", "Due nomi uno di fronte all'altro: scegli chi ne ha di più. I numeri vengono dal Comparatore di TIKITEXTO.", "Zwei Namen im Duell: Wähle, wer mehr hat. Die Zahlen stammen aus dem TIKITEXTO-Vergleicher."],
  p1: ["Lee la pregunta: por ejemplo, ¿quién tiene más Balones de Oro?", "Read the question, e.g. who has more Ballons d'Or?", "Leia a pergunta, por exemplo: quem tem mais Bolas de Ouro?", "Lis la question, par exemple : qui a le plus de Ballons d'Or ?", "Leggi la domanda, ad esempio: chi ha più Palloni d'Oro?", "Lies die Frage, z. B.: Wer hat mehr Ballons d'Or?"],
  p2: ["Pulsa a uno de los dos antes de que se acabe el tiempo (o usa ← →).", "Tap one of the two before time runs out (or use ← →).", "Toque em um dos dois antes que o tempo acabe (ou use ← →).", "Touche l'un des deux avant la fin du temps (ou utilise ← →).", "Tocca uno dei due prima che finisca il tempo (o usa ← →).", "Tippe auf einen der beiden, bevor die Zeit abläuft (oder nutze ← →)."],
  p3: ["Cada ronda la diferencia es menor. Con 3 fallos termina.", "Each round the gap gets smaller. 3 mistakes and it's over.", "A cada rodada a diferença diminui. Com 3 erros acaba.", "À chaque manche l'écart se réduit. À 3 erreurs, c'est fini.", "A ogni round il divario si riduce. Con 3 errori finisce.", "Jede Runde wird der Abstand kleiner. Nach 3 Fehlern ist Schluss."],
  jugar: ["¡Jugar!", "Play!", "Jogar!", "Jouer !", "Gioca!", "Los geht's!"], salir: ["Salir", "Exit", "Sair", "Quitter", "Esci", "Beenden"], otra: ["Jugar otra vez", "Play again", "Jogar de novo", "Rejouer", "Gioca ancora", "Nochmal spielen"],
  cargando: ["Cargando datos…", "Loading data…", "Carregando dados…", "Chargement…", "Caricamento…", "Lade Daten…"],
  q: ["¿Quién tiene más", "Who has more", "Quem tem mais", "Qui a le plus de", "Chi ha più", "Wer hat mehr"],
  ronda: ["Ronda", "Round", "Rodada", "Manche", "Round", "Runde"],
  bien: ["¡Correcto!", "Correct!", "Correto!", "Correct !", "Corretto!", "Richtig!"], mal: ["¡Fallo!", "Wrong!", "Errou!", "Raté !", "Sbagliato!", "Falsch!"], tarde: ["¡Se acabó el tiempo!", "Time's up!", "Acabou o tempo!", "Temps écoulé !", "Tempo scaduto!", "Zeit abgelaufen!"],
  nivel: ["¡Nivel", "Level", "Nível", "Niveau", "Livello", "Level"],
  fin: ["Fin del partido", "Game over", "Fim de jogo", "Fin de la partie", "Fine della partita", "Spiel vorbei"],
  rec: ["¡Nuevo récord!", "New record!", "Novo recorde!", "Nouveau record !", "Nuovo record!", "Neuer Rekord!"],
  aciertos: ["aciertos", "correct", "acertos", "bonnes réponses", "risposte giuste", "richtig"], puntos: ["puntos", "points", "pontos", "points", "punti", "Punkte"],
  tiki: ["⚡ +1 tikitexto", "⚡ +1 tikitext", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 Tikitext"],
  cat: { jugadores: ["Jugadores", "Players", "Jogadores", "Joueurs", "Giocatori", "Spieler"], equipos: ["Equipos", "Clubs", "Clubes", "Clubs", "Club", "Vereine"], selecciones: ["Selecciones", "National teams", "Seleções", "Sélections", "Nazionali", "Nationalteams"], entrenadores: ["Entrenadores", "Managers", "Treinadores", "Entraîneurs", "Allenatori", "Trainer"] },
  fuente: ["Datos a", "Data as of", "Dados de", "Données au", "Dati al", "Stand"],
};
/* etiquetas de cada estadística (clave = texto en español del Comparador) */
const LAB = {
  "Balones de Oro": ["Balones de Oro", "Ballons d'Or", "Bolas de Ouro", "Ballons d'Or", "Palloni d'Oro", "Ballons d'Or"],
  "Champions League ganadas": ["Champions League ganadas", "Champions League titles", "títulos de Champions League", "titres de Ligue des champions", "titoli di Champions League", "Champions-League-Titeln"],
  "Mundiales ganados": ["Mundiales ganados", "World Cups won", "Copas do Mundo ganhas", "Coupes du monde gagnées", "Mondiali vinti", "WM-Titeln"],
  "Eurocopas / Copas América": ["Eurocopas / Copas América", "Euros / Copa Américas", "Eurocopas / Copas América", "Euros / Copas América", "Europei / Copa América", "EM- / Copa-América-Titeln"],
  "Botas de Oro europeas": ["Botas de Oro europeas", "European Golden Shoes", "Chuteiras de Ouro europeias", "Souliers d'or européens", "Scarpe d'Oro europee", "Goldenen Schuhen"],
  "Goles en Champions": ["Goles en Champions", "Champions League goals", "gols na Champions", "buts en Ligue des champions", "gol in Champions", "Champions-League-Toren"],
  "Partidos en Champions": ["Partidos en Champions", "Champions League games", "jogos na Champions", "matchs en Ligue des champions", "partite in Champions", "Champions-League-Spielen"],
  "Goles con la selección": ["Goles con la selección", "International goals", "gols pela seleção", "buts en sélection", "gol con la nazionale", "Länderspieltoren"],
  "Partidos con la selección": ["Partidos con la selección", "International caps", "jogos pela seleção", "sélections", "presenze in nazionale", "Länderspielen"],
  "Goles en Mundiales": ["Goles en Mundiales", "World Cup goals", "gols em Copas do Mundo", "buts en Coupe du monde", "gol ai Mondiali", "WM-Toren"],
  "Copas de Europa / Champions": ["Copas de Europa / Champions", "European Cups / Champions Leagues", "Copas dos Campeões / Champions", "Coupes d'Europe / Ligues des champions", "Coppe dei Campioni / Champions", "Europapokalen / Champions-League-Titeln"],
  "Ligas nacionales": ["Ligas nacionales", "Domestic league titles", "ligas nacionais", "championnats nationaux", "campionati nazionali", "Meisterschaften"],
  "Mundiales de clubes FIFA": ["Mundiales de clubes FIFA", "FIFA Club World Cups", "Mundiais de Clubes da FIFA", "Coupes du monde des clubs FIFA", "Mondiali per club FIFA", "FIFA-Klub-Weltmeisterschaften"],
  "Finales de Champions (2007-2026)": ["Finales de Champions (2007-2026)", "Champions League finals (2007–2026)", "finais da Champions (2007-2026)", "finales de Ligue des champions (2007-2026)", "finali di Champions (2007-2026)", "Champions-League-Finals (2007–2026)"],
  "Finales ganadas (2007-2026)": ["Finales ganadas (2007-2026)", "Finals won (2007–2026)", "finais ganhas (2007-2026)", "finales gagnées (2007-2026)", "finali vinte (2007-2026)", "gewonnenen Finals (2007–2026)"],
  "Balones de Oro de sus jugadores": ["Balones de Oro de sus jugadores", "Ballons d'Or won by its players", "Bolas de Ouro de seus jogadores", "Ballons d'Or de ses joueurs", "Palloni d'Oro dei suoi giocatori", "Ballons d'Or seiner Spieler"],
  "Goles del máximo goleador": ["Goles del máximo goleador", "Goals by the top scorer", "gols do maior artilheiro", "buts du meilleur buteur", "gol del miglior marcatore", "Toren des Rekordtorschützen"],
  "Mundiales como seleccionador": ["Mundiales como seleccionador", "World Cups as manager", "Copas do Mundo como técnico", "Coupes du monde comme sélectionneur", "Mondiali come allenatore", "WM-Titeln als Trainer"],
  "Eurocopas / Copas América como seleccionador": ["Eurocopas / Copas América como seleccionador", "Euros / Copa Américas as manager", "Eurocopas / Copas América como técnico", "Euros / Copas América comme sélectionneur", "Europei / Copa América come allenatore", "EM- / Copa-América-Titeln als Trainer"],
  "Ligas nacionales ganadas": ["Ligas nacionales ganadas", "League titles won", "ligas nacionais ganhas", "championnats nationaux gagnés", "campionati nazionali vinti", "gewonnenen Meisterschaften"],
};
const CATS = ["jugadores", "equipos", "selecciones", "entrenadores"];

/* ── Datos: parejas posibles por estadística ── */
function preparar(D) {
  const out = [];
  CATS.forEach((cat) => {
    const bloque = D[cat]; if (!bloque) return;
    bloque.stats.filter((s) => s.g === 1).forEach((st) => {
      const it = bloque.items.filter((x) => typeof x.v[st.k] === "number");
      if (it.length < 6) return;
      const pares = [];
      for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) {
        const a = it[i].v[st.k], b = it[j].v[st.k]; if (a === b) continue;
        const gap = Math.abs(a - b) / Math.max(a, b); pares.push({ a: it[i], b: it[j], gap });
      }
      if (pares.length) out.push({ cat, st, pares, w: PESO_CAT[cat] });
    });
  });
  return out;
}
export function generar(Q, r, usados) {
  const d = dificultad(r), minGap = GAP[d], maxGap = d >= 5 ? 0.2 : d >= 4 ? 0.35 : 1;
  for (let intento = 0; intento < 60; intento++) {
    const tot = Q.reduce((s, x) => s + x.w, 0); let u = Math.random() * tot, e = Q[0];
    for (const x of Q) { u -= x.w; if (u <= 0) { e = x; break; } }
    const cand = e.pares.filter((p) => p.gap >= minGap && p.gap <= maxGap && !usados.has(e.cat + e.st.k + p.a.id + p.b.id));
    if (!cand.length && intento < 50) continue;
    const p = cand.length ? pick(cand) : pick(e.pares);
    const va = p.a.v[e.st.k], vb = p.b.v[e.st.k], izq = Math.random() < 0.5;
    const A = izq ? p.a : p.b, B = izq ? p.b : p.a;
    return { cat: e.cat, st: e.st, ops: [A, B], vals: [A.v[e.st.k], B.v[e.st.k]], ok: (A.v[e.st.k] > B.v[e.st.k]) ? 0 : 1, clave: e.cat + e.st.k + p.a.id + p.b.id, gap: p.gap, va, vb };
  }
  return null;
}

const PLANTILLA = `
<div class="dd-fondo"></div>
<div class="dd-cab">
  <button type="button" class="dd-btn" data-dd="salir" aria-label="Salir">✕</button>
  <div class="dd-marc"><small data-ronda>Ronda 1</small><b data-pts>0</b></div>
  <div class="dd-vidas" data-vidas></div>
</div>
<div class="dd-tiempo"><i data-barra></i></div>
<div class="dd-info" data-info></div>
<div class="dd-carta" data-carta>
  <span class="dd-cat" data-cat></span>
  <p class="dd-enun" data-enun></p>
</div>
<div class="dd-vs" aria-hidden="true">VS</div>
<div class="dd-ops" data-ops></div>
<div class="dd-menu" data-menu>
  <div class="dd-caja">
    <p class="dd-kicker" data-k="kicker"></p>
    <h2 class="dd-titulo"><span data-k="t1"></span><span data-k="t2"></span></h2>
    <p class="dd-sub" data-k="sub"></p>
    <ul class="dd-como">
      <li><b>1</b><span data-k="p1"></span></li>
      <li><b>2</b><span data-k="p2"></span></li>
      <li><b>3</b><span data-k="p3"></span></li>
    </ul>
    <p class="dd-stats" data-stats></p>
    <button type="button" class="dd-jugar" data-dd="jugar" data-k="jugar"></button>
    <button type="button" class="dd-sec" data-dd="salir" data-k="salir"></button>
  </div>
</div>
<div class="dd-fin" data-fin hidden>
  <div class="dd-caja dd-caja--s">
    <h3 data-k="fin"></h3>
    <p class="dd-res" data-fin-m></p>
    <p class="dd-res" data-fin-r></p>
    <p class="dd-tikis" data-fin-tiki hidden data-k="tiki"></p>
    <button type="button" class="dd-jugar" data-dd="jugar" data-k="otra"></button>
    <button type="button" class="dd-sec" data-dd="salir" data-k="salir"></button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const loc = String((api && api.locale) || "es").slice(0, 2).toLowerCase(), L = Math.max(0, LANGS.indexOf(loc));
  const tr = (k) => UI[k][L];
  raiz.innerHTML = PLANTILLA; raiz.setAttribute("data-no-t", "");
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  $$("[data-k]").forEach((e) => { e.textContent = tr(e.dataset.k); });
  const datos = () => { const d = api.datos(); ["mejor", "aciertos", "part", "tiki", "racha"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { fase: "carga", r: 0, vidas: VIDAS, pts: 0, racha: 0, ac: 0, q: null, usados: new Set(), lim: T0, t0: 0, tikis: 0, bloq: false };
  let raf = 0, vivo = true, ctx = null, hSig = 0, Q = null, D = null;

  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonBien = () => { blip(660, 0.1, 0.07, "triangle"); blip(990, 0.2, 0.07, "triangle", 0, 0.09); };
  const sonMal = () => blip(220, 0.28, 0.08, "sawtooth", 110);
  const sonTic = () => blip(880, 0.04, 0.03, "square");
  const sonNivel = () => [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.14, 0.07, "square", 0, i * 0.09));

  function etiqueta(st) { return L === 0 ? st.es : L === 1 ? st.en : (LAB[st.es] ? LAB[st.es][L] : st.en); }
  const nombre = (x) => (L !== 0 && x.ne) ? x.ne : x.n;
  const sub = (x) => (x.p ? x.p[L === 0 ? 0 : 1] : "") + (x.pa && x.pa[0] !== (x.p || [])[0] ? " · " + x.pa[L === 0 ? 0 : 1] : "");
  const iniciales = (n) => n.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const fmt = (v) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const LOC = ["es-ES", "en-GB", "pt-BR", "fr-FR", "it-IT", "de-DE"];
  function fechaLoc() { try { const f = new Date(D.fecha[1].replace(/^Data as of\s*/, "") + " UTC"); if (isNaN(f)) throw 0; return f.toLocaleDateString(LOC[L], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); } catch (e) { return D.fecha[L === 0 ? 0 : 1].replace(/^(Datos a|Data as of)\s*/, ""); } }
  function pintaVidas() { let h = ""; for (let i = 0; i < VIDAS; i++) h += '<i class="' + (i < S.vidas ? "on" : "") + '">⚽</i>'; $("[data-vidas]").innerHTML = h; }
  function pintaHud() { $("[data-ronda]").textContent = tr("ronda") + " " + Math.max(1, S.r); $("[data-pts]").textContent = String(S.pts); }
  function info(txt, cls) { const e = $("[data-info]"); e.className = "dd-info" + (cls ? " " + cls : ""); e.textContent = txt || ""; }
  function pintaStats() { const d = datos(); $("[data-stats]").textContent = (d.mejor ? "🏆 " + d.mejor + " · " + d.aciertos + " ✔ · " + d.part + " ⚽" : "") + (D && D.fecha ? (d.mejor ? " · " : "") + tr("fuente") + " " + fechaLoc() : ""); }

  function siguiente() {
    S.r++; S.bloq = false; S.q = generar(Q, S.r, S.usados); if (!S.q) { termina(); return; } S.usados.add(S.q.clave);
    S.lim = tiempo(S.r); S.t0 = performance.now(); S.fase = "pregunta";
    $("[data-enun]").textContent = tr("q") + " " + etiqueta(S.q.st) + "?"; $("[data-cat]").textContent = UI.cat[S.q.cat][L];
    $("[data-carta]").classList.remove("ok", "ko");
    const ops = $("[data-ops]"); ops.innerHTML = "";
    S.q.ops.forEach(function (x, i) {
      const b = document.createElement("button"); b.type = "button"; b.className = "dd-op dd-lado"; b.dataset.i = String(i);
      b.style.setProperty("--c1", x.c[0]); b.style.setProperty("--c2", x.c[1]);
      b.innerHTML = '<kbd>' + (i ? "→" : "←") + '</kbd><span class="dd-orbe"></span><span class="dd-nom"></span><small class="dd-sb"></small><b class="dd-val" aria-hidden="true"></b>';
      b.querySelector(".dd-orbe").textContent = iniciales(nombre(x)); b.querySelector(".dd-nom").textContent = nombre(x); b.querySelector(".dd-sb").textContent = sub(x); ops.appendChild(b);
    });
    if (S.r > 1 && (S.r - 1) % 3 === 0) { info(tr("nivel") + " " + (dificultad(S.r) + 1) + "!", "aviso"); sonNivel(); } else info("", "");
    pintaHud();
  }
  function responder(i) {
    if (S.fase !== "pregunta" || S.bloq) return; S.bloq = true; S.fase = "resp";
    const q = S.q, ok = i === q.ok, resto = Math.max(0, S.lim - (performance.now() - S.t0) / 1000);
    $$(".dd-op").forEach(function (b, k) { b.disabled = true; b.querySelector(".dd-val").textContent = fmt(q.vals[k]); b.classList.add("rev"); if (k === q.ok) b.classList.add("bien"); else if (k === i) b.classList.add("mal"); });
    if (ok) {
      S.racha++; S.ac++; const ganados = 100 + Math.round(resto / S.lim * 100) + 10 * Math.min(S.racha, 10); S.pts += ganados;
      info(tr("bien") + " +" + ganados, "bien"); $("[data-carta]").classList.add("ok"); sonBien();
      UMBRALES_TIKI.forEach(function (u) { if (S.ac === u) { S.tikis++; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } info(tr("tiki"), "bien"); } });
    } else {
      S.racha = 0; S.vidas--; pintaVidas(); info(i == null ? tr("tarde") : tr("mal"), "mal"); $("[data-carta]").classList.add("ko"); sonMal();
    }
    pintaHud();
    clearTimeout(hSig); hSig = setTimeout(function () { if (!vivo) return; if (S.vidas <= 0) termina(); else siguiente(); }, ok ? 1400 : PAUSA);
  }
  function termina() {
    S.fase = "fin"; const d = datos(); d.part++; d.aciertos = Math.max(d.aciertos, S.ac); d.racha = Math.max(d.racha, S.ac); const nuevo = S.pts > d.mejor; if (nuevo) d.mejor = S.pts; d.tiki += S.tikis;
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-fin-m]").textContent = S.ac + " " + tr("aciertos") + " · " + S.pts + " " + tr("puntos"); $("[data-fin-r]").textContent = nuevo ? tr("rec") : "🏆 " + d.mejor;
    $("[data-fin-tiki]").hidden = !S.tikis; $("[data-fin]").hidden = false; pintaStats();
  }
  function empezar() {
    audio(); if (!Q) { info(tr("cargando"), ""); return; }
    Object.assign(S, { fase: "pregunta", r: 0, vidas: VIDAS, pts: 0, racha: 0, ac: 0, usados: new Set(), tikis: 0 });
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
    const op = e.target.closest ? e.target.closest(".dd-op") : null; if (op) { responder(+op.dataset.i); return; }
    const b = e.target.closest ? e.target.closest("[data-dd]") : null; if (!b) return;
    if (b.dataset.dd === "salir") cerrar(); else if (b.dataset.dd === "jugar") empezar();
  });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    if (S.fase === "pregunta") { if (e.key === "ArrowLeft" || e.key === "1") responder(0); else if (e.key === "ArrowRight" || e.key === "2") responder(1); }
    else if ((e.key === "Enter" || e.key === " ") && (S.fase === "menu" || S.fase === "fin")) { e.preventDefault(); empezar(); }
  };
  window.addEventListener("keydown", onKey);
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf); clearTimeout(hSig); window.removeEventListener("keydown", onKey);
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  /* datos del Comparador (se cargan una vez como script de la propia web) */
  function listo() { D = window.CP_DATA; Q = preparar(D); S.fase = "menu"; if (vivo) pintaStats(); }
  pintaVidas(); pintaHud(); pintaStats();
  if (window.CP_DATA) listo();
  else { const s = document.createElement("script"); s.src = "comparador_datos.js"; s.onload = listo; s.onerror = function () { info(tr("cargando"), "mal"); }; document.head.appendChild(s); }
  return { cerrar: cerrar, S: S, empezar: empezar, responder: responder, generar: (r, u) => generar(Q, r || 1, u || new Set()), dificultad: dificultad, tiempo: tiempo, siguiente: siguiente, preparar: () => Q };
}
