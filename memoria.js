/* MEMORIA DE PAREJAS · TIKITEXTO (23-nov-2026) · juego de letras
   Cartas boca abajo: hay que encontrar las parejas que se pueden demostrar con los datos del juego (jugador ↔ su selección,
   club ↔ su estadio, club o estadio ↔ su país). Antes de cada tablero se enseñan las cartas unos segundos para memorizarlas.
   Contrarreloj con banco de tiempo: cada fallo resta tiempo y cada tablero completo suma. Módulo ES; usa las tablas de
   cuartetos_datos.js; sonidos sintetizados; sin escudos, fotos ni logos. */
import { JUGADORES, SELECCIONES, CLUBES_PAIS, ESTADIOS_PAIS } from "./cuartetos_datos.js";

const T0 = 80, T_MAX = 120, COSTE_FALLO = 3, COSTE_OJO = 6, UMBRALES_TIKI = [2, 5], PAUSA = 1700;
const irnd = (n) => Math.floor(Math.random() * n);
const barajar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = irnd(i + 1), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
const pick = (a) => a[irnd(a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ── datos ── */
/* Clubes con un estadio propio e inequívoco en 2026 (se excluyen los estadios compartidos: San Siro, Olímpico de Roma…) */
const CLUB_ESTADIO = [
  ["Real Madrid", "Santiago Bernabéu", "España"], ["Barcelona", "Camp Nou", "España"], ["Atlético", "Metropolitano", "España"],
  ["Sevilla", "Sánchez-Pizjuán", "España"], ["Valencia", "Mestalla", "España"], ["Athletic", "San Mamés", "España"],
  ["Betis", "Benito Villamarín", "España"], ["Real Sociedad", "Anoeta", "España"],
  ["Liverpool", "Anfield", "Inglaterra"], ["Manchester United", "Old Trafford", "Inglaterra"], ["Chelsea", "Stamford Bridge", "Inglaterra"],
  ["Arsenal", "Emirates Stadium", "Inglaterra"], ["Manchester City", "Etihad Stadium", "Inglaterra"], ["Newcastle", "St James' Park", "Inglaterra"],
  ["Juventus", "Allianz Stadium", "Italia"], ["Napoli", "Stadio Maradona", "Italia"], ["Fiorentina", "Artemio Franchi", "Italia"],
  ["Bayern", "Allianz Arena", "Alemania"], ["Dortmund", "Signal Iduna Park", "Alemania"], ["Schalke", "Veltins-Arena", "Alemania"], ["Werder Bremen", "Weserstadion", "Alemania"],
  ["PSG", "Parc des Princes", "Francia"], ["Marseille", "Stade Vélodrome", "Francia"], ["Lyon", "Groupama Stadium", "Francia"],
  ["Benfica", "Estádio da Luz", "Portugal"], ["Porto", "Estádio do Dragão", "Portugal"], ["Sporting", "José Alvalade", "Portugal"],
  ["Ajax", "Johan Cruijff Arena", "Países Bajos"], ["Feyenoord", "De Kuip", "Países Bajos"], ["PSV", "Philips Stadion", "Países Bajos"],
  ["Boca Juniors", "La Bombonera", "Argentina"], ["River Plate", "El Monumental", "Argentina"],
  ["São Paulo", "Morumbi", "Brasil"], ["Corinthians", "Arena Corinthians", "Brasil"], ["Internacional", "Beira-Rio", "Brasil"],
];
const EST_DE = {}, CLUB_DE = {};
CLUB_ESTADIO.forEach((x) => { CLUB_DE[x[0]] = x[1]; EST_DE[x[1]] = x[0]; });
const NO_CLUBES = ["Monaco", "Vitória"];
const NO_ESTADIOS = ["Stade Louis II"];
const CLUBES = [], ESTADIOS = [];
Object.keys(CLUBES_PAIS).forEach((p) => CLUBES_PAIS[p].forEach((c) => { if (NO_CLUBES.indexOf(c) < 0) CLUBES.push({ txt: c, pais: p }); }));
CLUB_ESTADIO.forEach((x) => { if (!CLUBES.some((c) => c.txt === x[0])) CLUBES.push({ txt: x[0], pais: x[2] }); });
Object.keys(ESTADIOS_PAIS).forEach((p) => ESTADIOS_PAIS[p].forEach((e) => { if (NO_ESTADIOS.indexOf(e) < 0) ESTADIOS.push({ txt: e, pais: p }); }));
CLUB_ESTADIO.forEach((x) => { if (!ESTADIOS.some((e) => e.txt === x[1])) ESTADIOS.push({ txt: x[1], pais: x[2] }); });
const SEL_KEYS = Object.keys(SELECCIONES);
const famoso = (j) => j.b || j.w || j.c.length >= 3;

/* ── modelo de carta y de relación ── */
/* carta: { kind: jug|club|est|pais, txt, pais, club?, est? } · relaciones que cuentan: jug–país (su selección), club–país,
   est–país y club–est. Nada más es pareja (p. ej. jugador–club no cuenta). */
export function rel(x, y) {
  if (x === y) return false;
  const k = x.kind + "-" + y.kind;
  const pa = (a, b) => a.kind === "pais" && b.pais === a.txt && b.kind !== "pais";
  if (x.kind === "pais" && pa(x, y)) return true;
  if (y.kind === "pais" && pa(y, x)) return true;
  if ((k === "club-est" && x.est === y.txt) || (k === "est-club" && y.est === x.txt)) return true;
  return false;
}
const cJug = (j) => ({ kind: "jug", txt: j.n, pais: SELECCIONES[j.s] });
const cPais = (p) => ({ kind: "pais", txt: p, pais: p });
const cClub = (c) => ({ kind: "club", txt: c.txt, pais: c.pais, est: CLUB_DE[c.txt] || null });
const cEst = (e) => ({ kind: "est", txt: e.txt, pais: e.pais, est: EST_DE[e.txt] || null });

/* Añade una pareja si no repite etiquetas y no crea ninguna relación extra entre cartas del tablero */
function anade(tab, a, b) {
  if (a.txt === b.txt) return false;
  if (tab.some((c) => c.txt === a.txt || c.txt === b.txt)) return false;
  for (const c of tab) if (rel(a, c) || rel(b, c)) return false;
  a = Object.assign({}, a); b = Object.assign({}, b);
  const id = tab.length / 2; a.par = id; b.par = id; tab.push(a, b);
  return true;
}
const clubDeEst = (e) => ({ kind: "club", txt: e[0], pais: e[2], est: e[1] });
const estDeClub = (e) => ({ kind: "est", txt: e[1], pais: e[2], est: null });

export const MODOS = ["sel", "est"];
export const modoDe = (n) => MODOS[n % 2];
export const parejasDe = (n) => Math.min(12, 6 + 2 * Math.floor(n / 2));
export const retrasoDe = (n) => Math.max(520, 950 - 55 * n);
export const memorizaDe = (n) => Math.max(1.3, 3.2 - 0.25 * n);
export const bonoDe = (n, p) => Math.max(18, 22 + 2 * p - 3 * Math.max(0, n - 3));

/* Genera el tablero n (0, 1, 2…): lista de cartas (sin barajar) con `par` = id de pareja */
export function generar(n) {
  const p = parejasDe(n), modo = modoDe(n);
  for (let intento = 0; intento < 800; intento++) {
    const tab = [];
    if (modo === "sel") {
      const claves = barajar(SEL_KEYS).slice(0, p);
      for (const k of claves) {
        let pool = JUGADORES.filter((j) => j.s === k);
        const fam = pool.filter(famoso);
        if (n < 4 && fam.length) pool = fam;
        if (!pool.length) continue;
        const j = pick(pool); anade(tab, cJug(j), cPais(SELECCIONES[k]));
      }
    } else {
      const nce = Math.round(p * 0.5), nep = Math.round((p - nce) * 0.5), ncp = p - nce - nep;
      const tipos = barajar([].concat(new Array(nep).fill("ep"), new Array(ncp).fill("cp"), new Array(nce).fill("ce")));
      /* primero las de país (gastan países) y luego las de club-estadio */
      tipos.sort((a, b) => (a === "ce") - (b === "ce"));
      for (const t of tipos) {
        for (let k = 0; k < 60; k++) {
          let ok;
          if (t === "ep") { const e = pick(ESTADIOS); ok = anade(tab, cEst(e), cPais(e.pais)); }
          else if (t === "cp") { const c = pick(CLUBES); ok = anade(tab, cClub(c), cPais(c.pais)); }
          else { const e = pick(CLUB_ESTADIO); ok = anade(tab, clubDeEst(e), estDeClub(e)); }
          if (ok) break;
        }
      }
    }
    if (tab.length === 2 * p) return tab;
  }
  return null;
}

/* Cuántas parejas válidas hay en el tablero (debe ser exactamente p) */
export function relaciones(tab) { let n = 0; for (let i = 0; i < tab.length; i++) for (let j = i + 1; j < tab.length; j++) if (rel(tab[i], tab[j])) n++; return n; }

/* ── textos ── */
const LANGS = ["es", "en", "pt", "fr", "it", "de"];
const UI = {
  kicker: ["Juego de memoria", "Memory game", "Jogo de memória", "Jeu de mémoire", "Gioco di memoria", "Gedächtnisspiel"],
  t1: ["MEMORIA", "MEMORY", "MEMÓRIA", "MÉMO", "MEMORY", "MEMORY"], t2: ["DE PAREJAS", "PAIRS", "DE PARES", "DE PAIRES", "DI COPPIE", "PAARE"],
  sub: ["Memoriza las cartas y encuentra las parejas: cada jugador con su selección, cada club con su estadio y cada estadio con su país.", "Memorise the cards and find the pairs: each player with his national team, each club with its stadium and each stadium with its country.", "Memorize as cartas e encontre os pares: cada jogador com sua seleção, cada clube com seu estádio e cada estádio com seu país.", "Mémorise les cartes et trouve les paires : chaque joueur avec sa sélection, chaque club avec son stade et chaque stade avec son pays.", "Memorizza le carte e trova le coppie: ogni giocatore con la sua nazionale, ogni club con il suo stadio e ogni stadio con il suo paese.", "Präge dir die Karten ein und finde die Paare: jeder Spieler mit seiner Nationalmannschaft, jeder Verein mit seinem Stadion und jedes Stadion mit seinem Land."],
  p1: ["Antes de cada tablero verás todas las cartas unos segundos: memorízalas.", "Before each board you will see all the cards for a few seconds: memorise them.", "Antes de cada tabuleiro você verá todas as cartas por alguns segundos: memorize-as.", "Avant chaque plateau tu verras toutes les cartes quelques secondes : mémorise-les.", "Prima di ogni tabellone vedrai tutte le carte per qualche secondo: memorizzale.", "Vor jedem Brett siehst du alle Karten ein paar Sekunden lang: merke sie dir."],
  p2: ["Gira dos cartas: si forman pareja (jugador↔selección, club↔estadio, club o estadio↔país) se quedan descubiertas.", "Flip two cards: if they form a pair (player↔national team, club↔stadium, club or stadium↔country) they stay face up.", "Vire duas cartas: se formarem um par (jogador↔seleção, clube↔estádio, clube ou estádio↔país) ficam viradas.", "Retourne deux cartes : si elles forment une paire (joueur↔sélection, club↔stade, club ou stade↔pays) elles restent visibles.", "Gira due carte: se formano una coppia (giocatore↔nazionale, club↔stadio, club o stadio↔paese) restano scoperte.", "Decke zwei Karten auf: Bilden sie ein Paar (Spieler↔Nationalteam, Verein↔Stadion, Verein oder Stadion↔Land), bleiben sie offen."],
  p3: ["Cada fallo resta 3 s; cada tablero completo suma tiempo y el siguiente es más grande. ¡Aguanta lo que puedas!", "Every miss costs 3 s; every completed board adds time and the next one is bigger. Last as long as you can!", "Cada erro tira 3 s; cada tabuleiro completo soma tempo e o próximo é maior. Aguente o máximo que puder!", "Chaque erreur coûte 3 s ; chaque plateau terminé ajoute du temps et le suivant est plus grand. Tiens le plus longtemps possible !", "Ogni errore costa 3 s; ogni tabellone completato aggiunge tempo e il successivo è più grande. Resisti il più a lungo possibile!", "Jeder Fehler kostet 3 s; jedes geschaffte Brett bringt Zeit und das nächste ist größer. Halte so lange durch, wie du kannst!"],
  jugar: ["¡Jugar!", "Play!", "Jogar!", "Jouer !", "Gioca!", "Los geht's!"], salir: ["Salir", "Exit", "Sair", "Quitter", "Esci", "Beenden"], otra: ["Jugar otra vez", "Play again", "Jogar de novo", "Rejouer", "Gioca ancora", "Nochmal spielen"],
  tablero: ["Tablero", "Board", "Tabuleiro", "Plateau", "Tabellone", "Brett"],
  modoSel: ["Jugador ↔ selección", "Player ↔ national team", "Jogador ↔ seleção", "Joueur ↔ sélection", "Giocatore ↔ nazionale", "Spieler ↔ Nationalteam"],
  modoEst: ["Clubes, estadios y países", "Clubs, stadiums and countries", "Clubes, estádios e países", "Clubs, stades et pays", "Club, stadi e paesi", "Vereine, Stadien und Länder"],
  memoriza: ["¡Memoriza!", "Memorise!", "Memorize!", "Mémorise !", "Memorizza!", "Einprägen!"], ya: ["¡Ya!", "Go!", "Já!", "Go !", "Via!", "Los!"],
  pareja: ["¡Pareja!", "Pair!", "Par!", "Paire !", "Coppia!", "Paar!"], racha: ["Racha ×", "Streak ×", "Sequência ×", "Série ×", "Serie ×", "Serie ×"],
  fallo: ["No es pareja · −3 s", "Not a pair · −3 s", "Não é par · −3 s", "Pas une paire · −3 s", "Non è una coppia · −3 s", "Kein Paar · −3 s"],
  completo: ["¡Tablero completo! +", "Board complete! +", "Tabuleiro completo! +", "Plateau terminé ! +", "Tabellone completo! +", "Brett geschafft! +"],
  ojo: ["👁 Ojo (−6 s)", "👁 Peek (−6 s)", "👁 Olhar (−6 s)", "👁 Coup d'œil (−6 s)", "👁 Sbircia (−6 s)", "👁 Blick (−6 s)"],
  fin: ["Se acabó el tiempo", "Time is up", "O tempo acabou", "Temps écoulé", "Tempo scaduto", "Die Zeit ist um"],
  rec: ["¡Nuevo récord!", "New record!", "Novo recorde!", "Nouveau record !", "Nuovo record!", "Neuer Rekord!"],
  tableros: ["tableros", "boards", "tabuleiros", "plateaux", "tabelloni", "Bretter"], parejas: ["parejas", "pairs", "pares", "paires", "coppie", "Paare"], puntos: ["puntos", "points", "pontos", "points", "punti", "Punkte"],
  tiki: ["⚡ +1 tikitexto", "⚡ +1 tikitext", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 Tikitext"],
  ico: { jug: "👤", club: "⚽", est: "🏟", pais: "🌍" },
};

const PLANTILLA = `
<div class="mp-fondo" aria-hidden="true"></div>
<div class="mp-cab">
  <button type="button" class="mp-btn" data-mp="salir" aria-label="Salir">✕</button>
  <div class="mp-marc"><small data-tab data-no-t>Tablero 1</small><b data-pts data-no-t>0</b></div>
  <div class="mp-reloj" data-reloj data-no-t>1:20</div>
</div>
<div class="mp-tiempo"><i data-barra></i></div>
<div class="mp-info" data-info data-no-t></div>
<div class="mp-modo" data-mpmodo data-no-t></div>
<div class="mp-grid" data-grid></div>
<div class="mp-pie"><button type="button" class="mp-sec" data-mp="ojo" data-k="ojo"></button></div>
<div class="mp-menu" data-menu>
  <div class="mp-caja">
    <p class="mp-kicker" data-k="kicker"></p>
    <h2 class="mp-titulo"><span data-k="t1"></span><span data-k="t2"></span></h2>
    <p class="mp-sub" data-k="sub"></p>
    <ul class="mp-como"><li><b>1</b><span data-k="p1"></span></li><li><b>2</b><span data-k="p2"></span></li><li><b>3</b><span data-k="p3"></span></li></ul>
    <p class="mp-stats" data-stats data-no-t></p>
    <button type="button" class="mp-jugar" data-mp="jugar" data-k="jugar"></button>
    <button type="button" class="mp-sec" data-mp="salir" data-k="salir"></button>
  </div>
</div>
<div class="mp-fin" data-fin hidden>
  <div class="mp-caja mp-caja--s">
    <h3 data-k="fin"></h3>
    <p class="mp-res" data-fin-m data-no-t></p>
    <p class="mp-res" data-fin-r data-no-t></p>
    <p class="mp-tikis" data-fin-tiki hidden data-k="tiki"></p>
    <button type="button" class="mp-jugar" data-mp="jugar" data-k="otra"></button>
    <button type="button" class="mp-sec" data-mp="salir" data-k="salir"></button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  const idx = Math.max(0, LANGS.indexOf(api.locale ? String(api.locale).slice(0, 2) : "es"));
  const L = (k) => UI[k][idx];
  raiz.setAttribute("data-no-t", "");
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  $$("[data-k]").forEach((e) => { e.textContent = L(e.getAttribute("data-k")); });
  const datos = () => { const d = api.datos(); ["mejor", "tab", "par", "part", "tiki"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { fase: "menu", n: 0, p: 6, cartas: [], a: -1, bloq: false, rest: T0, t0: 0, pts: 0, combo: 0, tab: 0, aciertos: 0, hechos: 0, tikis: 0, ojoUsado: false, delay: 950 };
  let raf = 0, vivo = true, ctx = null, hPre = 0, hMal = 0, hSig = 0, hOjo = 0;

  /* sonidos sintetizados */
  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonVoltea = () => blip(520 + irnd(80), 0.05, 0.035, "triangle");
  const sonBien = () => { blip(660, 0.1, 0.08, "triangle"); blip(990, 0.2, 0.08, "triangle", 0, 0.09); };
  const sonMal = () => blip(210, 0.25, 0.08, "sawtooth", 120);
  const sonTablero = () => { [523, 659, 784, 1046, 1318].forEach((f, i) => blip(f, 0.15, 0.07, "square", 0, i * 0.08)); };
  const sonFin = () => { [392, 330, 262, 196].forEach((f, i) => blip(f, 0.22, 0.08, "triangle", 0, i * 0.14)); };
  const sonTic = () => blip(880, 0.04, 0.03, "square");

  /* tiempo: banco de segundos que solo corre en fase «juego» */
  const quedan = () => (S.fase === "juego" ? S.rest - (performance.now() - S.t0) / 1000 : S.rest);
  function ajustaTiempo(dt) { S.rest = Math.min(T_MAX, quedan() + dt); S.t0 = performance.now(); }
  const mmss = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  function info(txt, cls) { const e = $("[data-info]"); e.className = "mp-info" + (cls ? " " + cls : ""); e.textContent = txt || ""; }
  function pintaHud() { $("[data-tab]").textContent = L("tablero") + " " + (S.n + 1); $("[data-pts]").textContent = String(S.pts); }
  function pintaStats() { const d = datos(); $("[data-stats]").textContent = d.mejor ? "🏆 " + d.mejor + " · " + d.tab + " " + L("tableros") + " · " + d.part + " ⚽" : ""; }

  /* ── tablero ── */
  function etiqueta(c) { return c.kind === "pais" ? t(c.txt) : c.txt; }
  function pinta(i) {
    const c = S.cartas[i], b = $('[data-i="' + i + '"]'); if (!b) return;
    b.classList.toggle("up", c.est !== "abajo"); b.classList.toggle("hecho", c.est === "hecho");
    b.setAttribute("aria-label", c.est === "abajo" ? "?" : etiqueta(c));
  }
  function montar() {
    const g = $("[data-grid]"); g.innerHTML = "";
    const cols = S.p === 6 ? 3 : 4; g.style.setProperty("--cols", String(cols)); g.style.setProperty("--filas", String(Math.ceil(S.cartas.length / cols)));
    S.cartas.forEach((c, i) => {
      const e = document.createElement("button"); e.type = "button"; e.className = "mp-c k-" + c.kind; e.dataset.i = String(i);
      const txt = etiqueta(c);
      e.innerHTML = '<span class="mp-in"><span class="mp-f mp-dorso" aria-hidden="true"><i>⚽</i></span><span class="mp-f mp-cara"><i class="mp-ico" aria-hidden="true">' + UI.ico[c.kind] + "</i><b></b></span></span>";
      const b = e.querySelector("b"); b.textContent = txt; if (txt.length > 13) e.classList.add("long"); if (txt.length > 19) e.classList.add("muylong");
      g.appendChild(e);
    });
  }
  function nuevoTablero() {
    clearTimeout(hPre); clearTimeout(hMal); clearTimeout(hOjo);
    S.p = parejasDe(S.n); S.delay = retrasoDe(S.n);
    const tab = generar(S.n) || generar(S.n); /* 800 intentos cada vez; nunca falla en las pruebas */
    S.cartas = barajar(tab).map((c) => Object.assign({ est: "arriba" }, c));
    S.a = -1; S.hechos = 0; S.bloq = true; S.combo = 0; S.fase = "preview";
    $("[data-mpmodo]").textContent = L(modoDe(S.n) === "sel" ? "modoSel" : "modoEst");
    montar(); S.cartas.forEach((c, i) => pinta(i)); pintaHud(); info(L("memoriza"), "aviso");
    $("[data-barra]").style.transform = "scaleX(" + clamp(S.rest / T_MAX, 0, 1).toFixed(4) + ")";
    $("[data-reloj]").textContent = mmss(S.rest);
    hPre = setTimeout(empiezaJuego, memorizaDe(S.n) * 1000);
  }
  function empiezaJuego() {
    if (!vivo || S.fase !== "preview") return; clearTimeout(hPre);
    S.cartas.forEach((c) => { c.est = "abajo"; }); S.cartas.forEach((c, i) => pinta(i));
    S.fase = "juego"; S.t0 = performance.now(); S.bloq = false; info(L("ya"), "aviso"); sonVoltea();
  }
  function empezar() {
    audio(); clearTimeout(hSig);
    Object.assign(S, { n: 0, rest: T0, pts: 0, combo: 0, tab: 0, aciertos: 0, tikis: 0, ojoUsado: false });
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; $("[data-mp=ojo]").disabled = false;
    nuevoTablero(); cancelAnimationFrame(raf); raf = requestAnimationFrame(bucle);
  }

  function voltear(i) {
    if (S.fase !== "juego" || S.bloq) return; const c = S.cartas[i]; if (!c || c.est !== "abajo") return;
    audio(); c.est = "arriba"; pinta(i); sonVoltea();
    if (S.a < 0) { S.a = i; return; }
    const a = S.cartas[S.a], ia = S.a; S.a = -1;
    if (a.par === c.par) {
      a.est = c.est = "hecho"; pinta(ia); pinta(i); S.combo++; S.hechos++; S.aciertos++;
      const g = 100 + 25 * Math.min(S.combo - 1, 8); S.pts += g;
      info(L("pareja") + " +" + g + (S.combo > 1 ? " · " + L("racha") + S.combo : ""), "bien"); sonBien(); pintaHud();
      if (S.hechos === S.p) tableroCompleto();
    } else {
      S.bloq = true; S.combo = 0; ajustaTiempo(-COSTE_FALLO); info(L("fallo"), "mal"); sonMal();
      hMal = setTimeout(function () {
        if (!vivo || S.fase !== "juego") return; a.est = "abajo"; c.est = "abajo"; pinta(ia); pinta(i); S.bloq = false;
      }, S.delay);
    }
  }
  function tableroCompleto() {
    const resto = Math.max(0, quedan()), bono = bonoDe(S.n, S.p), g = 300 + 50 * S.n + 3 * Math.floor(resto);
    S.rest = Math.min(T_MAX, resto + bono); S.fase = "pausa"; S.bloq = true; S.pts += g; S.tab++;
    info(L("completo") + g + " · +" + bono + " s", "bien"); sonTablero(); pintaHud();
    UMBRALES_TIKI.forEach(function (u) { if (S.tab === u) { S.tikis++; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } } });
    clearTimeout(hSig); hSig = setTimeout(function () { if (!vivo || S.fase !== "pausa") return; S.n++; nuevoTablero(); }, PAUSA);
  }
  function ojo() {
    if (S.fase !== "juego" || S.bloq || S.ojoUsado) return; S.ojoUsado = true; $("[data-mp=ojo]").disabled = true; ajustaTiempo(-COSTE_OJO);
    S.bloq = true; const previos = S.cartas.map((c) => c.est);
    S.cartas.forEach((c, i) => { if (c.est === "abajo") { c.est = "arriba"; pinta(i); } });
    hOjo = setTimeout(function () {
      if (!vivo || S.fase !== "juego") return;
      S.cartas.forEach((c, i) => { if (previos[i] === "abajo" && c.est === "arriba") { c.est = "abajo"; pinta(i); } });
      S.bloq = false;
    }, 1400);
  }
  function termina() {
    if (S.fase === "fin") return; S.fase = "fin"; S.bloq = true; clearTimeout(hMal); clearTimeout(hPre); clearTimeout(hSig); clearTimeout(hOjo);
    const d = datos(); d.part++; d.tab = Math.max(d.tab, S.tab); d.par += S.aciertos; d.tiki += S.tikis; const nuevo = S.pts > d.mejor; if (nuevo) d.mejor = S.pts;
    try { api.guardar(); } catch (e) { /* opcional */ }
    sonFin(); $("[data-barra]").style.transform = "scaleX(0)"; $("[data-reloj]").textContent = "0:00";
    $("[data-fin-m]").textContent = S.tab + " " + L("tableros") + " · " + S.aciertos + " " + L("parejas") + " · " + S.pts + " " + L("puntos");
    $("[data-fin-r]").textContent = nuevo ? L("rec") : "🏆 " + d.mejor; $("[data-fin-tiki]").hidden = !S.tikis; $("[data-fin]").hidden = false; pintaStats();
  }
  let ultimoTic = 0;
  function bucle() {
    if (!vivo) return; raf = requestAnimationFrame(bucle);
    if (S.fase !== "juego" && S.fase !== "pausa" && S.fase !== "preview") return;
    const q = quedan(), k = clamp(q / T_MAX, 0, 1), b = $("[data-barra]");
    b.style.transform = "scaleX(" + k.toFixed(4) + ")"; b.className = q < 10 ? "rojo" : q < 25 ? "ambar" : "";
    $("[data-reloj]").textContent = mmss(q);
    if (S.fase === "juego") { if (q < 6 && Math.ceil(q) !== ultimoTic) { ultimoTic = Math.ceil(q); sonTic(); } if (q <= 0) termina(); }
  }

  raiz.addEventListener("click", function (e) {
    audio();
    const c = e.target.closest ? e.target.closest(".mp-c") : null; if (c) { voltear(+c.dataset.i); return; }
    const b = e.target.closest ? e.target.closest("[data-mp]") : null; if (!b) return;
    const a = b.dataset.mp; if (a === "salir") cerrar(); else if (a === "jugar") empezar(); else if (a === "ojo") ojo();
  });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    if ((e.key === "Enter" || e.key === " ") && (S.fase === "menu" || S.fase === "fin")) { e.preventDefault(); empezar(); }
  };
  window.addEventListener("keydown", onKey);
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf); clearTimeout(hPre); clearTimeout(hMal); clearTimeout(hSig); clearTimeout(hOjo); window.removeEventListener("keydown", onKey);
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  pintaHud(); pintaStats();
  /* Solo para las pruebas automáticas */
  return {
    cerrar: cerrar, S: S, empezar: empezar, generar: generar, voltear: voltear, ojo: ojo, saltaPreview: empiezaJuego, rel: rel, relaciones: relaciones, UI: UI,
    resolverTodo: function () { const vistos = {}; S.cartas.forEach((c, i) => { if (c.est !== "hecho") (vistos[c.par] = vistos[c.par] || []).push(i); }); Object.keys(vistos).forEach((k) => { voltear(vistos[k][0]); voltear(vistos[k][1]); }); },
    termina: termina, modoDe: modoDe, parejasDe: parejasDe, bonoDe: bonoDe, memorizaDe: memorizaDe, retrasoDe: retrasoDe,
  };
}
