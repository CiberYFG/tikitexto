/* CLAVA EL SITIO · TIKITEXTO (26-nov-2026) · juego de mapas
   Un lugar (estadio, ciudad natal de un crack, ciudad de un club, sede de una final o una curiosidad) y un mapa del mundo propio
   (mapas_motor.js, datos de Natural Earth en mapas/): se mueve y se hace zoom, se toca para clavar la chincheta y se confirma.
   Puntos = 1000 · e^(−(distancia − margen)/450 km). 5 rondas por partida; reto diario (semilla = fecha local: un estadio, una cuna,
   un club, una final y una curiosidad, igual para todos, un intento al día, resultado compartible) y partida libre con filtros.
   Modo experto: sin nombres en el mapa (×1,5). Pista: zona de ~1.300 km (−40 %). Módulo ES; sonidos sintetizados; sin escudos ni fotos. */
import { crearMapa, distanciaKm } from "./mapas_motor.js";
import { LUGARES } from "./mapas_lugares.js";

const LANGS = ["es", "en", "pt", "fr", "it", "de"];
const RONDAS = 5, K = 450, FECHA0 = Date.UTC(2026, 10, 27), MULT_PISTA = 0.6, MULT_EXPERTO = 1.5, R_PISTA = 650;
const R0 = { est: 2.5, nac: 8, club: 8, sed: 6, cur: 8 };
const TIPOS = ["est", "nac", "club", "sed", "cur"];
const ICONO = { est: "🏟️", nac: "👶", club: "🛡️", sed: "🏆", cur: "💡" };
const ITEMS = LUGARES.map((r) => ({ tipo: r[0], id: r[1], nom: r[2], sub: r[3], lat: r[4], lon: r[5], idx: r[6], ciu: r[7], iso: r[8], dif: r[9], ex: r[10] }));
const RECIENTES = new Set();

/* Textos: [es, en, pt, fr, it, de] */
const X = {
  logoA: ["CLAVA", "PIN", "CRAVA", "PLANTE", "PIANTA", "SETZ"],
  logoB: ["EL SITIO", "THE SPOT", "O LOCAL", "LE LIEU", "IL LUOGO", "DEN ORT"],
  kicker: ["Juego de mapas", "Map game", "Jogo de mapas", "Jeu de cartes", "Gioco di mappe", "Kartenspiel"],
  sub: ["Un sitio, un mapa del mundo y tu chincheta. Cuanto más cerca clavas, más puntos.", "One place, a world map and your pin. The closer you drop it, the more points.", "Um lugar, um mapa-múndi e o teu alfinete. Quanto mais perto, mais pontos.", "Un lieu, une carte du monde et ta punaise. Plus tu es près, plus tu marques.", "Un luogo, una mappa del mondo e la tua puntina. Più sei vicino, più punti fai.", "Ein Ort, eine Weltkarte und deine Stecknadel. Je näher, desto mehr Punkte."],
  c1: ["Lee la pregunta: un estadio, la cuna de un crack, un club, una final…", "Read the question: a stadium, a star's birthplace, a club, a final…", "Lê a pergunta: um estádio, o berço de um craque, um clube, uma final…", "Lis la question : un stade, le berceau d'un crack, un club, une finale…", "Leggi la domanda: uno stadio, la città natale di un campione, un club, una finale…", "Lies die Frage: ein Stadion, der Geburtsort eines Stars, ein Verein, ein Finale…"],
  c2: ["Mueve el mapa, haz zoom (pellizca o rueda) y toca para clavar la chincheta.", "Pan and zoom the map (pinch or wheel) and tap to drop your pin.", "Move e dá zoom no mapa (pinça ou roda) e toca para cravar o alfinete.", "Déplace et zoome la carte (pincement ou molette) et touche pour planter ta punaise.", "Sposta e ingrandisci la mappa (pizzica o rotella) e tocca per piantare la puntina.", "Verschiebe und zoome die Karte (Pinch oder Rad) und tippe, um die Nadel zu setzen."],
  c3: ["Cuanto más cerca del sitio real, más puntos: hasta 1.000 por ronda.", "The closer to the real spot, the more points: up to 1,000 per round.", "Quanto mais perto do local real, mais pontos: até 1.000 por ronda.", "Plus tu es près du vrai lieu, plus tu marques : jusqu'à 1 000 par manche.", "Più sei vicino al luogo reale, più punti: fino a 1.000 per round.", "Je näher am echten Ort, desto mehr Punkte: bis zu 1.000 pro Runde."],
  diario: ["Reto de hoy", "Today's challenge", "Desafio de hoje", "Défi du jour", "Sfida di oggi", "Heutige Herausforderung"],
  diarioVer: ["Ver resultado de hoy", "See today's result", "Ver o resultado de hoje", "Voir le résultat du jour", "Vedi il risultato di oggi", "Heutiges Ergebnis ansehen"],
  libre: ["Partida libre", "Free game", "Partida livre", "Partie libre", "Partita libera", "Freies Spiel"],
  todo: ["Todo", "All", "Tudo", "Tout", "Tutto", "Alles"],
  est: ["Estadios", "Stadiums", "Estádios", "Stades", "Stadi", "Stadien"],
  nac: ["Cunas de cracks", "Stars' birthplaces", "Berços de craques", "Villes natales", "Città natali", "Geburtsorte"],
  club: ["Clubes", "Clubs", "Clubes", "Clubs", "Club", "Vereine"],
  sed: ["Finales", "Finals", "Finais", "Finales", "Finali", "Finals"],
  cur: ["Curiosidades", "Fun facts", "Curiosidades", "Curiosités", "Curiosità", "Kurioses"],
  experto: ["Modo experto", "Expert mode", "Modo especialista", "Mode expert", "Modalità esperto", "Expertenmodus"],
  expertoS: ["Sin nombres en el mapa · ×1,5 puntos", "No names on the map · ×1.5 points", "Sem nomes no mapa · ×1,5 pontos", "Sans noms sur la carte · ×1,5 points", "Senza nomi sulla mappa · ×1,5 punti", "Keine Namen auf der Karte · ×1,5 Punkte"],
  salir: ["Salir", "Exit", "Sair", "Quitter", "Esci", "Beenden"],
  ronda: ["Ronda {n}/{t}", "Round {n}/{t}", "Ronda {n}/{t}", "Manche {n}/{t}", "Round {n}/{t}", "Runde {n}/{t}"],
  t_est: ["Estadio", "Stadium", "Estádio", "Stade", "Stadio", "Stadion"],
  t_nac: ["Ciudad natal", "Birthplace", "Cidade natal", "Ville natale", "Città natale", "Geburtsort"],
  t_club: ["Club", "Club", "Clube", "Club", "Club", "Verein"],
  t_sed: ["Final", "Final", "Final", "Finale", "Finale", "Finale"],
  t_cur: ["Curiosidad", "Fun fact", "Curiosidade", "Curiosité", "Curiosità", "Kurioses"],
  q_est: ["¿Dónde está {x}?", "Where is {x}?", "Onde fica {x}?", "Où se trouve {x} ?", "Dov'è {x}?", "Wo liegt {x}?"],
  q_nac: ["¿Dónde nació {x}?", "Where was {x} born?", "Onde nasceu {x}?", "Où est né {x} ?", "Dove è nato {x}?", "Wo wurde {x} geboren?"],
  q_club: ["¿En qué ciudad juega {x}?", "In which city does {x} play?", "Em que cidade joga o {x}?", "Dans quelle ville joue {x} ?", "In quale città gioca {x}?", "In welcher Stadt spielt {x}?"],
  q_sedM: ["¿Dónde se jugó la final del Mundial {y}?", "Where was the {y} World Cup final played?", "Onde foi jogada a final da Copa do Mundo de {y}?", "Où s'est jouée la finale de la Coupe du monde {y} ?", "Dove si giocò la finale del Mondiale {y}?", "Wo wurde das WM-Finale {y} gespielt?"],
  q_sedC: ["¿Dónde se jugó la final de la Champions {y}?", "Where was the {y} Champions League final played?", "Onde foi jogada a final da Liga dos Campeões de {y}?", "Où s'est jouée la finale de la Ligue des champions {y} ?", "Dove si giocò la finale di Champions League {y}?", "Wo wurde das Champions-League-Finale {y} gespielt?"],
  guia: ["Toca el mapa para clavar tu chincheta", "Tap the map to drop your pin", "Toca no mapa para cravar o alfinete", "Touche la carte pour planter ta punaise", "Tocca la mappa per piantare la puntina", "Tippe auf die Karte, um deine Nadel zu setzen"],
  guia2: ["Toca otro punto para moverla", "Tap another spot to move it", "Toca noutro ponto para a mover", "Touche un autre endroit pour la déplacer", "Tocca un altro punto per spostarla", "Tippe auf eine andere Stelle, um sie zu verschieben"],
  clavar: ["Clavar aquí", "Lock it in", "Cravar aqui", "Valider ici", "Conferma qui", "Hier setzen"],
  pista: ["Pista", "Hint", "Dica", "Indice", "Indizio", "Tipp"],
  pistaT: ["Zona aproximada · −40 %", "Rough area · −40 %", "Zona aproximada · −40 %", "Zone approximative · −40 %", "Zona approssimativa · −40 %", "Ungefähres Gebiet · −40 %"],
  mas: ["Acercar", "Zoom in", "Aproximar", "Zoomer", "Ingrandisci", "Hineinzoomen"],
  menos: ["Alejar", "Zoom out", "Afastar", "Dézoomer", "Riduci", "Herauszoomen"],
  sig: ["Siguiente", "Next", "Seguinte", "Suivant", "Avanti", "Weiter"],
  ver: ["Ver resultado", "See result", "Ver resultado", "Voir le résultat", "Vedi il risultato", "Ergebnis ansehen"],
  tu: ["Tú", "You", "Tu", "Toi", "Tu", "Du"],
  v5: ["¡Clavado!", "Spot on!", "Na mosca!", "En plein dans le mille !", "Centro perfetto!", "Volltreffer!"],
  v4: ["Muy cerca", "Very close", "Muito perto", "Très près", "Vicinissimo", "Sehr nah"],
  v3: ["Cerca", "Close", "Perto", "Près", "Vicino", "Nah dran"],
  v2: ["Lejos", "Far", "Longe", "Loin", "Lontano", "Weit weg"],
  v1: ["Muy lejos", "Very far", "Muito longe", "Très loin", "Lontanissimo", "Sehr weit"],
  aKm: ["a {n} km del sitio", "{n} km away", "a {n} km do local", "à {n} km du lieu", "a {n} km dal luogo", "{n} km entfernt"],
  kmDel: ["km del sitio", "km from the spot", "km do local", "km du lieu", "km dal luogo", "km entfernt"],
  justo: ["justo en el sitio", "right on the spot", "mesmo no local", "pile au bon endroit", "proprio sul posto", "genau am Ort"],
  pts: ["pts", "pts", "pts", "pts", "pt", "Pkt."],
  fin: ["Resultado", "Result", "Resultado", "Résultat", "Risultato", "Ergebnis"],
  de: ["de {n}", "of {n}", "de {n}", "sur {n}", "su {n}", "von {n}"],
  comp: ["Compartir resultado", "Share result", "Partilhar resultado", "Partager le résultat", "Condividi il risultato", "Ergebnis teilen"],
  copiado: ["¡Copiado!", "Copied!", "Copiado!", "Copié !", "Copiato!", "Kopiert!"],
  otra: ["Otra partida", "Play again", "Outra partida", "Rejouer", "Gioca ancora", "Nochmal spielen"],
  menu: ["Menú", "Menu", "Menu", "Menu", "Menu", "Menü"],
  tiki: ["+1 tikitexto", "+1 tikitexto", "+1 tikitexto", "+1 tikitexto", "+1 tikitexto", "+1 Tikitexto"],
  r5: ["Geógrafo del fútbol", "Football geographer", "Geógrafo do futebol", "Géographe du football", "Geografo del calcio", "Fußball-Geograf"],
  r4: ["Cartógrafo", "Cartographer", "Cartógrafo", "Cartographe", "Cartografo", "Kartograf"],
  r3: ["Explorador", "Explorer", "Explorador", "Explorateur", "Esploratore", "Entdecker"],
  r2: ["Turista", "Tourist", "Turista", "Touriste", "Turista", "Tourist"],
  r1: ["Perdido en el mapa", "Lost on the map", "Perdido no mapa", "Perdu sur la carte", "Perso sulla mappa", "Auf der Karte verloren"],
  stats: ["Mejor: {b} · Partidas: {p}", "Best: {b} · Games: {p}", "Melhor: {b} · Partidas: {p}", "Record : {b} · Parties : {p}", "Record: {b} · Partite: {p}", "Bestwert: {b} · Spiele: {p}"],
  carga: ["Cargando el mapa…", "Loading the map…", "A carregar o mapa…", "Chargement de la carte…", "Caricamento della mappa…", "Karte wird geladen…"],
  err: ["No se pudo cargar el mapa", "The map could not be loaded", "Não foi possível carregar o mapa", "Impossible de charger la carte", "Impossibile caricare la mappa", "Die Karte konnte nicht geladen werden"],
  reint: ["Reintentar", "Retry", "Tentar de novo", "Réessayer", "Riprova", "Erneut versuchen"],
  cerrar: ["Cerrar", "Close", "Fechar", "Fermer", "Chiudi", "Schließen"],
  nota: ["Mapa: Natural Earth (dominio público)", "Map: Natural Earth (public domain)", "Mapa: Natural Earth (domínio público)", "Carte : Natural Earth (domaine public)", "Mappa: Natural Earth (pubblico dominio)", "Karte: Natural Earth (gemeinfrei)"],
};

export function mulberry(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const barajar = (a, rng) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
const hoyTxt = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const numDia = () => { const d = new Date(); return Math.max(1, Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - FECHA0) / 864e5) + 1); };
const semillaDia = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };

/* Puntuación de una ronda a partir de la distancia (km) y el tipo de lugar: 1000 dentro del margen y caída exponencial fuera */
export function base(d, tipo) { return 1000 * Math.exp(-Math.max(0, d - (R0[tipo] || 8)) / K); }
export function puntos(d, tipo, pista, experto) { return Math.round(base(d, tipo) * (pista ? MULT_PISTA : 1) * (experto ? MULT_EXPERTO : 1)); }
const nivel = (b) => (b >= 900 ? 5 : b >= 650 ? 4 : b >= 350 ? 3 : b >= 100 ? 2 : 1);
const CUAD = (b) => (b >= 900 ? "🟩" : b >= 600 ? "🟨" : b >= 250 ? "🟧" : "🟥");
const COLOR = (b) => (b >= 900 ? "#34e089" : b >= 600 ? "#ffd24a" : b >= 250 ? "#ff9f1c" : "#ff5b45");

export function eligeDiario(rng) {
  const por = {}; ITEMS.forEach((i) => { (por[i.tipo] = por[i.tipo] || []).push(i); });
  return barajar(TIPOS, rng).map((t) => por[t][Math.floor(rng() * por[t].length)]).sort((a, b) => a.dif - b.dif);
}
export function eligeLibre(cat) {
  const todo = cat === "todo";
  let pool = ITEMS.filter((i) => todo || i.tipo === cat).filter((i) => !RECIENTES.has(i.id));
  if (pool.length < RONDAS) { RECIENTES.clear(); pool = ITEMS.filter((i) => todo || i.tipo === cat); }
  const b = barajar(pool, Math.random), out = [], cnt = {};
  for (const i of b) { if (out.length === RONDAS) break; if ((cnt[i.tipo] || 0) >= (todo ? 2 : RONDAS)) continue; out.push(i); cnt[i.tipo] = (cnt[i.tipo] || 0) + 1; }
  for (const i of b) { if (out.length === RONDAS) break; if (out.indexOf(i) < 0) out.push(i); }
  out.forEach((i) => RECIENTES.add(i.id));
  return out.sort((a, b2) => a.dif - b2.dif);
}
/* Zona de la pista: círculo que contiene el lugar, con el centro desplazado de forma fija a partir del id */
export function zonaPista(it) {
  let h = 2166136261; for (let k = 0; k < it.id.length; k++) { h ^= it.id.charCodeAt(k); h = Math.imul(h, 16777619); }
  const r1 = ((h >>> 0) % 1000) / 1000, r2 = (((h >>> 10) >>> 0) % 1000) / 1000, ang = r1 * 6.2832, dist = R_PISTA * (0.25 + 0.5 * r2);
  const dlat = (dist * Math.cos(ang)) / 111.19, dlon = (dist * Math.sin(ang)) / (111.19 * Math.max(0.2, Math.cos((it.lat * Math.PI) / 180)));
  return { lat: it.lat + dlat, lon: it.lon + dlon, km: R_PISTA };
}

const PLANTILLA = `
<div class="mp-mapa" data-mapa></div>
<div class="mp-carga" data-carga><i aria-hidden="true"></i><span data-carga-t></span></div>
<div class="mp-top" data-top hidden>
  <div class="mp-barra">
    <button type="button" class="mp-btn" data-mp="atras" aria-label="✕">✕</button>
    <div class="mp-prog" data-prog aria-hidden="true"></div>
    <div class="mp-pts"><b data-pts>0</b><small>pts</small></div>
  </div>
  <div class="mp-preg" data-preg aria-live="polite">
    <p class="mp-preg__k"><span data-k-ico aria-hidden="true"></span><span data-k-txt></span><em data-k-ron></em></p>
    <h2 class="mp-preg__q" data-q></h2>
    <p class="mp-preg__s" data-qs hidden></p>
  </div>
</div>
<div class="mp-lado" data-lado hidden>
  <button type="button" class="mp-btn" data-mp="mas" data-ro="mas">＋</button>
  <button type="button" class="mp-btn" data-mp="menos" data-ro="menos">－</button>
  <button type="button" class="mp-btn mp-btn--pista" data-mp="pista" data-ro="pista"><span aria-hidden="true">💡</span><small data-pista-t></small></button>
</div>
<div class="mp-pie" data-pie hidden>
  <div class="mp-pie__caja">
    <div class="mp-juego" data-juego>
      <p class="mp-guia" data-guia></p>
      <button type="button" class="mp-cta" data-mp="clavar" disabled><span aria-hidden="true">📍</span><b data-clavar></b></button>
    </div>
    <div class="mp-res" data-res hidden>
      <div class="mp-res__cab">
        <div class="mp-res__km"><b data-r-km>0</b><span data-r-aprox></span></div>
        <div class="mp-res__pts"><b data-r-pts>+0</b><small data-r-pts-s></small></div>
      </div>
      <p class="mp-res__v" data-r-ver></p>
      <p class="mp-res__l" data-r-lugar></p>
      <p class="mp-res__d" data-r-det></p>
      <button type="button" class="mp-cta mp-cta--sig" data-mp="siguiente"><b data-sig></b><span aria-hidden="true">→</span></button>
    </div>
  </div>
</div>
<div class="mp-menu" data-menu hidden>
  <div class="mp-menu__caja">
    <p class="mp-kicker" data-m-kicker></p>
    <h1 class="mp-logo"><span>CLAVA</span><span>EL SITIO</span></h1>
    <p class="mp-menu__sub" data-m-sub></p>
    <ol class="mp-como"><li><b>1</b><span data-m-c1></span></li><li><b>2</b><span data-m-c2></span></li><li><b>3</b><span data-m-c3></span></li></ol>
    <button type="button" class="mp-cta mp-cta--diario" data-mp="diario"><span aria-hidden="true">📅</span><b data-m-diario></b><small data-m-num></small></button>
    <div class="mp-libre">
      <p class="mp-libre__t" data-m-libre></p>
      <div class="mp-chips" data-chips role="group"></div>
      <label class="mp-exp"><input type="checkbox" data-exp /><span class="mp-exp__sw" aria-hidden="true"></span><span class="mp-exp__t"><b data-m-exp></b><small data-m-exps></small></span></label>
      <button type="button" class="mp-cta mp-cta--libre" data-mp="libre"><span aria-hidden="true">🌍</span><b data-m-lib-b></b></button>
    </div>
    <p class="mp-stats" data-m-stats></p>
    <button type="button" class="mp-sec" data-mp="salir"></button>
    <p class="mp-credito" data-m-cred></p>
  </div>
</div>
<div class="mp-fin" data-fin hidden>
  <div class="mp-fin__caja">
    <p class="mp-kicker" data-f-kicker></p>
    <div class="mp-fin__tot"><b data-f-tot>0</b><span data-f-de></span></div>
    <h2 class="mp-fin__rango" data-f-rango></h2>
    <p class="mp-fin__tiki" data-f-tiki hidden></p>
    <ol class="mp-fin__lista" data-f-lista></ol>
    <button type="button" class="mp-cta" data-mp="compartir" data-f-comp-b hidden><span aria-hidden="true">📤</span><b data-f-comp></b></button>
    <button type="button" class="mp-cta mp-cta--libre" data-mp="otra"><span aria-hidden="true">🌍</span><b data-f-otra></b></button>
    <button type="button" class="mp-sec" data-mp="menu"></button>
  </div>
</div>
<div class="mp-error" data-error hidden>
  <div class="mp-error__caja"><p data-e-t></p><button type="button" class="mp-cta" data-mp="reintentar"><b data-e-r></b></button><button type="button" class="mp-sec" data-mp="salir" data-e-s></button></div>
</div>
`;

export function abrir(api, raiz) {
  const loc = String((api && api.locale) || "es").slice(0, 2).toLowerCase(), L = Math.max(0, LANGS.indexOf(loc)), idioma = LANGS[L];
  const tr = (k, o) => { let s = X[k][L]; if (o) Object.keys(o).forEach((q) => { s = s.replace("{" + q + "}", o[q]); }); return s; };
  const num = (n) => Math.round(n).toLocaleString(api.locale || "es");
  const tn = (s) => { try { return api.t ? api.t(s) : s; } catch (e) { return s; } };
  raiz.setAttribute("data-no-t", ""); raiz.setAttribute("lang", idioma);
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  const datos = () => { const d = api.datos(); ["part", "mejor", "tot", "perf", "buenas", "tiki", "dist"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { fase: "carga", modo: "libre", cat: "todo", experto: false, rondas: [], i: 0, pin: null, pista: false, res: [], total: 0, mult: 1, num: 1, listo: false };
  let vivo = true, M = null, ctx = null, tTour = 0, cargado = false;
  const op = { base: "mapas/", idioma: idioma, tema: temaSitio(), escalaBajo: 0, alTocar: (p) => colocar(p.lon, p.lat), alError: () => { if (vivo) { $("[data-error]").hidden = false; $("[data-carga]").hidden = true; } } };

  function temaSitio() { return document.documentElement.dataset.tema === "claro" ? "claro" : "oscuro"; }
  raiz.setAttribute("data-t", op.tema);
  const obsTema = new MutationObserver(() => { const t = temaSitio(); raiz.setAttribute("data-t", t); if (M) M.setTema(t); });
  obsTema.observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] });

  /* sonidos sintetizados */
  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonPin = () => { blip(420, 0.09, 0.07, "triangle", 280); };
  const sonConfirma = () => { blip(300, 0.16, 0.06, "sine", 620); };
  const sonNivel = (n) => { const b = [0, 262, 330, 392, 523, 784][n] || 262; blip(b, 0.18, 0.07, "triangle"); if (n >= 3) blip(b * 1.5, 0.22, 0.06, "triangle", 0, 0.1); if (n >= 5) blip(b * 2, 0.3, 0.06, "triangle", 0, 0.2); };
  const sonFin = () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.16, 0.07, "square", 0, i * 0.1)); };

  /* animación numérica */
  function anima(el, a, b, ms, fmt) {
    const t0 = performance.now(); el.textContent = fmt(a);
    cancelAnimationFrame(el._raf || 0);
    (function paso(t) { if (!vivo) return; const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(a + (b - a) * e); if (k < 1) el._raf = requestAnimationFrame(paso); })(t0);
  }

  /* ───── textos de la pantalla ───── */
  function lugarTxt(it) { const c = it.idx >= 0 && M ? M.nombreCiudad(it.idx) : it.ciu, p = M ? M.nombrePais(it.iso) : ""; return [c || it.ciu, p].filter(Boolean).join(", "); }
  function preguntaTxt(it) {
    if (it.tipo === "cur") return it.ex.q[L];
    if (it.tipo === "sed") return tr(it.ex.charAt(0) === "C" ? "q_sedC" : "q_sedM", { y: it.nom.split(" ")[1] });
    return tr("q_" + it.tipo, { x: tn(it.nom) });
  }
  function subTxt(it) {
    if (it.tipo === "est") return it.sub ? tn(it.sub).split(" · ").map(tn).join(" · ") : "";
    if (it.tipo === "sed" && it.ex.charAt(0) === "C") return it.ex.slice(2).split(" – ").map(tn).join(" – ");
    return "";
  }
  function detalleTxt(it) {
    if (it.tipo === "cur") return it.ex.d[L];
    if (it.tipo === "est") return it.nom + (it.sub ? " · " + subTxt(it) : "");
    if (it.tipo === "sed") return it.sub + (it.ex.charAt(0) === "C" ? " · " + subTxt(it) : "");
    return it.tipo === "club" ? tn(it.nom) : it.nom;
  }
  function pintaProg() {
    let h = ""; for (let k = 0; k < RONDAS; k++) { const r = S.res[k]; h += '<i class="' + (r ? "n" + nivel(r.base) : k === S.i ? "on" : "") + '"></i>'; }
    $("[data-prog]").innerHTML = h;
  }
  function pintaPregunta() {
    const it = S.rondas[S.i];
    $("[data-k-ico]").textContent = ICONO[it.tipo]; $("[data-k-txt]").textContent = tr("t_" + it.tipo); $("[data-k-ron]").textContent = tr("ronda", { n: S.i + 1, t: RONDAS });
    $("[data-q]").textContent = preguntaTxt(it);
    const s = subTxt(it), e = $("[data-qs]"); e.textContent = s; e.hidden = !s;
    pintaProg(); $("[data-pts]").textContent = num(S.total);
  }
  function medidas() {
    const top = $("[data-top]"), pie = $("[data-pie]");
    return { t: (top.hidden ? 0 : top.getBoundingClientRect().bottom) + 14, b: (pie.hidden ? 0 : raiz.getBoundingClientRect().bottom - pie.querySelector(".mp-pie__caja").getBoundingClientRect().top) + 18 };
  }
  function ajustaEscala() { if (!M) return; op.escalaBajo = (S.fase === "juego" || S.fase === "reveal") ? Math.max(0, Math.round(medidas().b - 8)) : 0; M.redibuja(); }

  /* ───── flujo ───── */
  function vistaMundo(ms) { if (M) { M.setHolgura({}); M.volarA(8, 28, M.zMin() + 0.35, ms); } }
  function mostrarPantalla(f) {
    S.fase = f;
    $("[data-menu]").hidden = f !== "menu"; $("[data-fin]").hidden = f !== "fin";
    const juego = f === "juego" || f === "reveal";
    $("[data-top]").hidden = !juego; $("[data-lado]").hidden = !juego; $("[data-pie]").hidden = !juego;
    $("[data-juego]").hidden = f !== "juego"; $("[data-res]").hidden = f !== "reveal";
    clearTimeout(tTour);
    if (f === "menu") { if (M) { M.setInteractivo(false); M.ponMarcadores([]); M.setEtiquetas({ paises: true, ciudades: true, mares: true }); tour(); } }
    requestAnimationFrame(ajustaEscala);
  }
  function tour() {
    if (!vivo || !M || S.fase !== "menu") return;
    const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    M.volarA(it.lon, it.lat, 3.6 + Math.random() * 2.4, 6500);
    tTour = setTimeout(tour, 9000);
  }
  function pintaMenu() {
    const d = datos(), hecho = d.dia === hoyTxt();
    $(".mp-logo span:first-child").textContent = tr("logoA"); $(".mp-logo span:last-child").textContent = tr("logoB");
    $("[data-m-kicker]").textContent = tr("kicker"); $("[data-m-sub]").textContent = tr("sub");
    $("[data-m-c1]").textContent = tr("c1"); $("[data-m-c2]").textContent = tr("c2"); $("[data-m-c3]").textContent = tr("c3");
    $("[data-m-diario]").textContent = tr(hecho ? "diarioVer" : "diario"); $("[data-m-num]").textContent = "#" + numDia();
    $("[data-m-libre]").textContent = tr("libre"); $("[data-m-exp]").textContent = tr("experto"); $("[data-m-exps]").textContent = tr("expertoS");
    $("[data-m-lib-b]").textContent = tr("libre"); $("[data-m-cred]").textContent = tr("nota");
    $("[data-m-stats]").textContent = d.part ? tr("stats", { b: num(d.mejor), p: d.part }) : "";
    $("[data-m-stats]").hidden = !d.part;
    $("[data-mp=salir]").textContent = tr("salir");
    const ch = $("[data-chips]"); ch.innerHTML = "";
    ["todo"].concat(TIPOS).forEach((c) => { const b = document.createElement("button"); b.type = "button"; b.className = "mp-chip" + (S.cat === c ? " on" : ""); b.dataset.cat = c; b.setAttribute("aria-pressed", S.cat === c ? "true" : "false"); b.textContent = (c === "todo" ? "🌍 " : ICONO[c] + " ") + tr(c); ch.appendChild(b); });
    $("[data-exp]").checked = S.experto;
    $("[data-clavar]").textContent = tr("clavar"); $("[data-sig]").textContent = tr("sig"); $("[data-pista-t]").textContent = "−40 %";
    $("[data-ro=mas]").setAttribute("aria-label", tr("mas")); $("[data-ro=menos]").setAttribute("aria-label", tr("menos")); $("[data-ro=pista]").setAttribute("aria-label", tr("pistaT"));
    $("[data-mp=atras]").setAttribute("aria-label", tr("menu"));
  }
  function aplicaEtiquetas() { if (M) { const v = !S.experto; M.setEtiquetas({ paises: v, ciudades: v, mares: v }); } }
  function empezar(modo) {
    if (!cargado) return; audio();
    S.modo = modo === "diario" ? "diario" : "libre"; S.mult = S.modo === "libre" && S.experto ? MULT_EXPERTO : 1;
    const experto = S.modo === "libre" && S.experto;
    S.rondas = S.modo === "diario" ? eligeDiario(mulberry(semillaDia())) : eligeLibre(S.cat);
    S.num = numDia(); S.i = 0; S.res = []; S.total = 0; S.pin = null; S.pista = false; S.expertoAct = experto;
    if (M) { M.setEtiquetas({ paises: !experto, ciudades: !experto, mares: !experto }); }
    mostrarPantalla("juego"); iniciaRonda();
  }
  function iniciaRonda() {
    S.fase = "juego"; S.pin = null; S.pista = false;
    $("[data-juego]").hidden = false; $("[data-res]").hidden = true; $("[data-pie]").hidden = false;
    $("[data-guia]").textContent = tr("guia"); $("[data-mp=clavar]").disabled = true; $("[data-mp=clavar]").classList.remove("lista");
    $("[data-ro=pista]").disabled = false; $("[data-ro=pista]").classList.remove("usada");
    pintaPregunta();
    if (M) { M.ponMarcadores([]); M.setInteractivo(true); requestAnimationFrame(() => { ajustaEscala(); vistaMundo(S.i === 0 ? 700 : 1100); }); }
  }
  function colocar(lon, lat) {
    if (S.fase !== "juego" || !M) return; audio();
    S.pin = { lon: lon, lat: lat };
    const mk = [{ lon: lon, lat: lat, tipo: "pin", color: "#e0321f" }];
    if (S.zona) mk.unshift(S.zona);
    M.ponMarcadores(mk); sonPin();
    $("[data-guia]").textContent = tr("guia2"); const b = $("[data-mp=clavar]"); b.disabled = false; b.classList.add("lista");
  }
  function pista() {
    if (S.fase !== "juego" || S.pista) return; const it = S.rondas[S.i], z = zonaPista(it);
    S.pista = true; S.zona = { lon: z.lon, lat: z.lat, tipo: "zona", color: "#ffb020", radioKm: z.km };
    $("[data-ro=pista]").disabled = true; $("[data-ro=pista]").classList.add("usada");
    const mk = [S.zona]; if (S.pin) mk.push({ lon: S.pin.lon, lat: S.pin.lat, tipo: "pin", color: "#e0321f" });
    M.ponMarcadores(mk);
    const dl = z.km / 111.19, dn = z.km / (111.19 * Math.max(0.2, Math.cos((z.lat * Math.PI) / 180)));
    M.encuadra([{ lon: z.lon - dn, lat: z.lat - dl }, { lon: z.lon + dn, lat: z.lat + dl }], { t: medidas().t, r: 30, b: medidas().b, l: 30 }, 900, 6);
    $("[data-guia]").textContent = tr("pistaT");
  }
  function clavar() {
    if (S.fase !== "juego" || !S.pin) return; audio(); sonConfirma();
    const it = S.rondas[S.i], d = distanciaKm(S.pin, { lat: it.lat, lon: it.lon }), b = base(d, it.tipo), p = puntos(d, it.tipo, S.pista, S.expertoAct);
    S.res.push({ it: it, d: d, base: b, pts: p, pista: S.pista }); S.total += p; S.fase = "reveal"; S.zona = null;
    M.ponMarcadores([
      { lon: S.pin.lon, lat: S.pin.lat, tipo: "pin", color: "#e0321f", etiqueta: tr("tu"), linea: true },
      { lon: it.lon, lat: it.lat, tipo: "balon", color: "#0b8f4d", etiqueta: lugarTxt(it).split(",")[0], linea: true },
    ]);
    $("[data-juego]").hidden = true; $("[data-res]").hidden = false; $("[data-ro=pista]").disabled = true;
    const n = nivel(b);
    $("[data-r-ver]").textContent = tr("v" + n); $("[data-r-ver]").className = "mp-res__v n" + n;
    $("[data-r-lugar]").textContent = "📍 " + lugarTxt(it); $("[data-r-det]").textContent = detalleTxt(it);
    $("[data-r-aprox]").textContent = d < 1.5 ? tr("justo") : tr("kmDel");
    $("[data-r-pts-s]").textContent = tr("pts") + (S.pista ? " · 💡" : "") + (S.expertoAct ? " · ×1,5" : "");
    anima($("[data-r-km]"), 0, d < 1.5 ? 0 : d, 1000, (v) => (d < 1.5 ? "✓" : num(v)));
    $("[data-r-km]").parentNode.classList.toggle("exacto", d < 1.5);
    const pp = $("[data-r-pts]"); anima(pp, 0, p, 1100, (v) => "+" + num(v));
    $("[data-sig]").textContent = tr(S.i + 1 >= RONDAS ? "ver" : "sig");
    pintaProg(); $("[data-pts]").textContent = num(S.total); setTimeout(() => sonNivel(n), 450);
    requestAnimationFrame(() => { ajustaEscala(); const m = medidas(); M.encuadra([S.pin, { lon: it.lon, lat: it.lat }], { t: m.t + 26, r: 46, b: m.b, l: 46 }, 1200, 8.4); });
  }
  function siguiente() {
    if (S.fase !== "reveal") return; audio();
    if (S.i + 1 >= RONDAS) { terminar(); return; }
    S.i++; iniciaRonda();
  }

  /* ───── final ───── */
  const rangoDe = (media) => (media >= 880 ? 5 : media >= 700 ? 4 : media >= 480 ? 3 : media >= 250 ? 2 : 1);
  function guardarDiario(d) { d.dia = hoyTxt(); d.pts = S.total; d.num = S.num; d.grid = S.res.map((r) => CUAD(r.base)).join(""); d.rd = S.res.map((r) => [r.it.id, Math.round(r.d), r.pts]); }
  function terminar() {
    const d = datos(), media = S.total / S.mult / RONDAS; let tiki = false;
    d.part++; d.tot += S.total; if (S.total > d.mejor && S.mult === 1) d.mejor = S.total; else if (S.mult > 1 && S.total / S.mult > d.mejor) d.mejor = Math.round(S.total / S.mult);
    S.res.forEach((r) => { if (r.base >= 950) d.perf++; if (!d.dist || r.d < d.dist) d.dist = Math.round(r.d * 10) / 10; });
    if (S.modo === "diario") { guardarDiario(d); if (media >= 500) tiki = true; if (api.racha) { try { api.racha("ma"); } catch (e) { /* opcional */ } } }
    else if (media >= 600) { d.buenas++; if (d.buenas % 3 === 0) tiki = true; }
    if (tiki) { try { api.tiki(); } catch (e) { /* opcional */ } d.tiki++; }
    try { api.guardar(); } catch (e) { /* opcional */ }
    S.tikis = tiki; mostrarFin(true);
  }
  function mostrarFin(nuevo) {
    mostrarPantalla("fin");
    const media = S.total / S.mult / RONDAS, r = rangoDe(media);
    $("[data-f-kicker]").textContent = (S.modo === "diario" ? tr("diario") + " #" + S.num : tr("libre") + (S.expertoAct ? " · " + tr("experto") : ""));
    $("[data-f-de]").textContent = tr("de", { n: num(RONDAS * 1000 * S.mult) }); $("[data-f-rango]").textContent = tr("r" + r);
    $("[data-f-comp]").textContent = tr("comp"); $("[data-f-comp-b]").hidden = S.modo !== "diario";
    $("[data-f-otra]").textContent = tr("otra"); $("[data-mp=menu]").textContent = tr("menu");
    const t = $("[data-f-tiki]"); t.hidden = !(S.tikis && nuevo); t.textContent = "⚡ " + tr("tiki");
    anima($("[data-f-tot]"), 0, S.total, 1200, (v) => num(v));
    const ol = $("[data-f-lista]"); ol.innerHTML = "";
    S.res.forEach((x) => {
      const li = document.createElement("li"); li.className = "n" + nivel(x.base);
      const a = document.createElement("span"); a.className = "ico"; a.textContent = ICONO[x.it.tipo];
      const b = document.createElement("span"); b.className = "tx"; const nm = document.createElement("b"); nm.textContent = x.it.tipo === "cur" ? lugarTxt(x.it).split(",")[0] : (x.it.tipo === "sed" ? x.it.nom : tn(x.it.nom)); const sm = document.createElement("small"); sm.textContent = x.d < 1.5 ? tr("justo") : tr("aKm", { n: num(x.d) });
      b.appendChild(nm); b.appendChild(sm);
      const c = document.createElement("span"); c.className = "pt"; c.textContent = "+" + num(x.pts);
      li.appendChild(a); li.appendChild(b); li.appendChild(c); ol.appendChild(li);
    });
    if (M) {
      M.setInteractivo(true);
      M.ponMarcadores(S.res.map((x) => ({ lon: x.it.lon, lat: x.it.lat, tipo: "balon", color: COLOR(x.base), etiqueta: "" })));
      /* se encuadra dos veces: el panel termina de ajustar su altura (fuentes, lista de rondas) después del primer frame */
      const encuadraFin = (ms) => {
        if (!vivo || S.fase !== "fin") return;
        const R = raiz.getBoundingClientRect(), caja = $(".mp-fin__caja").getBoundingClientRect(), pts = S.res.map((x) => ({ lon: x.it.lon, lat: x.it.lat }));
        M.encuadra(pts, R.width >= 760 ? { t: 70, r: 70, b: 70, l: Math.round(caja.right + 40) } : { t: 80, r: 36, b: Math.round(R.bottom - caja.top + 36), l: 36 }, ms, 5.5);
      };
      requestAnimationFrame(() => encuadraFin(1300));
      setTimeout(() => encuadraFin(500), 900);
    }
    if (nuevo) { if (media >= 600) { try { api.victoria(); } catch (e) { /* opcional */ } } else sonFin(); }
  }
  function diario() {
    if (!cargado) return; const d = datos();
    if (d.dia === hoyTxt() && d.rd && d.rd.length === RONDAS) {
      const res = []; d.rd.forEach((x) => { const it = ITEMS.find((i) => i.id === x[0]); if (it) res.push({ it: it, d: x[1], base: base(x[1], it.tipo), pts: x[2], pista: false }); });
      if (res.length === RONDAS) { S.modo = "diario"; S.mult = 1; S.expertoAct = false; S.res = res; S.total = d.pts || 0; S.num = d.num || numDia(); S.tikis = false; mostrarFin(false); return; }
    }
    empezar("diario");
  }
  function compartir() {
    const d = datos(), txt = tr("logoA") + " " + tr("logoB") + " #" + (d.num || S.num) + " · " + num(d.pts || S.total) + " pts\n" + (d.grid || S.res.map((r) => CUAD(r.base)).join("")) + "\nhttps://tikitexto.com/?modo=mapas";
    const aviso = () => { const e = $("[data-f-comp]"); e.textContent = tr("copiado"); setTimeout(() => { if (vivo) e.textContent = tr("comp"); }, 1800); };
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { navigator.share({ text: txt }).catch(() => { /* cancelado */ }); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(aviso, () => { /* sin permiso */ });
    else { const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); aviso(); } catch (e) { /* opcional */ } a.remove(); }
  }

  /* ───── navegación ───── */
  function irMenu() { S.zona = null; if (M) M.setHolgura({}); pintaMenu(); mostrarPantalla("menu"); }
  function atras() { if (S.fase === "juego" || S.fase === "reveal" || S.fase === "fin") irMenu(); else cerrar(); }
  function cerrar() {
    if (!vivo) return; vivo = false; clearTimeout(tTour); obsTema.disconnect(); document.removeEventListener("keydown", onKey);
    try { if (M) M.destruir(); } catch (e) { /* opcional */ }
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  raiz.addEventListener("click", (e) => {
    audio();
    const ch = e.target.closest ? e.target.closest("[data-cat]") : null; if (ch) { S.cat = ch.dataset.cat; $$(".mp-chip").forEach((b) => { const on = b.dataset.cat === S.cat; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); }); return; }
    const b = e.target.closest ? e.target.closest("[data-mp]") : null; if (!b) return; const a = b.dataset.mp;
    if (a === "salir") cerrar(); else if (a === "atras") atras(); else if (a === "diario") diario(); else if (a === "libre" || a === "otra") empezar("libre");
    else if (a === "menu") irMenu(); else if (a === "clavar") clavar(); else if (a === "siguiente") siguiente(); else if (a === "pista") pista();
    else if (a === "mas") { if (M) M.zoomMas(1); } else if (a === "menos") { if (M) M.zoomMas(-1); } else if (a === "compartir") compartir(); else if (a === "reintentar") location.reload();
  });
  raiz.addEventListener("change", (e) => { if (e.target && e.target.matches && e.target.matches("[data-exp]")) S.experto = !!e.target.checked; });
  function onKey(e) {
    if (e.key === "Escape") { atras(); return; }
    if (e.key === "Enter") { if (S.fase === "juego" && S.pin) { e.preventDefault(); clavar(); } else if (S.fase === "reveal") { e.preventDefault(); siguiente(); } return; }
    if ((e.key === "p" || e.key === "P") && S.fase === "juego" && M) { const v = M.vista(); colocar(v.lon, v.lat); }
  }
  document.addEventListener("keydown", onKey);

  /* ───── arranque ───── */
  $("[data-carga-t]").textContent = tr("carga"); $("[data-e-t]").textContent = tr("err"); $("[data-e-r]").textContent = tr("reint"); $("[data-e-s]").textContent = tr("cerrar");
  pintaMenu();
  M = crearMapa($("[data-mapa]"), op);
  M.setInteractivo(false);
  const fuentes = document.fonts && document.fonts.load ? Promise.all(['500 14px TikiMapa', '700 14px TikiMapa', 'italic 500 14px TikiMapa', '800 14px TikiMapa'].map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve();
  Promise.all([M.listo, fuentes]).then(() => {
    if (!vivo) return; cargado = true; M.redibuja(); M.setEtiquetas({}); $("[data-carga]").hidden = true; S.listo = true;
    mostrarPantalla("menu"); pintaMenu();
    const q = new URLSearchParams(location.search).get("auto"); /* solo pruebas: ?auto=diario */
    if (q === "diario") diario();
  });
  mostrarPantalla("carga");
  /* Solo para las pruebas automáticas */
  return { cerrar: cerrar, S: S, M: M, empezar: empezar, diario: diario, colocar: colocar, clavar: clavar, siguiente: siguiente, pista: pista, base: base, puntos: puntos, eligeDiario: eligeDiario, eligeLibre: eligeLibre, zonaPista: zonaPista, ITEMS: ITEMS, mulberry: mulberry, lugarTxt: lugarTxt, preguntaTxt: preguntaTxt, RONDAS: RONDAS };
}
