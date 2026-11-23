/* LÍNEA DEL TIEMPO · TIKITEXTO (23-nov-2026) · juego de historia del fútbol
   Sale un hecho sin su año (un Mundial, una final de Champions, el primer Balón de Oro de un jugador o un hito de las reglas y las
   competiciones) y hay que colocarlo en su hueco de la línea del tiempo: más antiguo arriba, más reciente abajo. Cada acierto añade la
   carta a la línea (y cada vez es más difícil colocar la siguiente). 3 fallos terminan la partida. Datos de trivia_datos.js (UEFA, FIFA y
   France Football) y de hitos de las Reglas de Juego (IFAB) y las competiciones. Módulo ES; sonidos sintetizados; sin escudos ni fotos. */
import { T } from "./trivia_datos.js";

const VIDAS = 3, TIEMPO = 25, PAUSA_OK = 1500, PAUSA_KO = 2600, UMBRALES_TIKI = [8, 18];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const irnd = (n) => Math.floor(Math.random() * n);
const LANGS = ["es", "en", "pt", "fr", "it", "de"];

const UI = {
  kicker: ["Juego de historia", "History game", "Jogo de história", "Jeu d'histoire", "Gioco di storia", "Geschichtsspiel"],
  t1: ["LÍNEA DEL", "FOOTBALL", "LINHA DO", "FRISE", "LINEA DEL", "ZEIT"], t2: ["TIEMPO", "TIMELINE", "TEMPO", "DU TEMPS", "TEMPO", "STRAHL"],
  sub: ["¿Cuándo pasó? Coloca cada hecho del fútbol en su sitio de la línea del tiempo.", "When did it happen? Put each football event in its place on the timeline.", "Quando aconteceu? Coloque cada fato do futebol no seu lugar da linha do tempo.", "C'était quand ? Place chaque fait du football à sa place sur la frise.", "Quando è successo? Metti ogni fatto del calcio al suo posto sulla linea del tempo.", "Wann war das? Ordne jedes Fußballereignis an der richtigen Stelle des Zeitstrahls ein."],
  p1: ["Aparece un hecho sin su año: una final, un Mundial, un premio o una regla.", "An event appears without its year: a final, a World Cup, an award or a rule.", "Aparece um fato sem o ano: uma final, uma Copa, um prêmio ou uma regra.", "Un fait apparaît sans son année : une finale, une Coupe du monde, un prix ou une règle.", "Compare un fatto senza l'anno: una finale, un Mondiale, un premio o una regola.", "Ein Ereignis erscheint ohne Jahr: ein Finale, eine WM, eine Auszeichnung oder eine Regel."],
  p2: ["Toca el hueco (＋) donde crees que va: lo más antiguo arriba y lo más reciente abajo.", "Tap the gap (＋) where you think it goes: oldest at the top, most recent at the bottom.", "Toque o espaço (＋) onde acha que vai: o mais antigo em cima e o mais recente embaixo.", "Touche l'emplacement (＋) où tu penses qu'il va : le plus ancien en haut, le plus récent en bas.", "Tocca lo spazio (＋) dove pensi vada: il più antico in alto e il più recente in basso.", "Tippe auf die Lücke (＋), wo es deiner Meinung nach hingehört: ganz oben das Älteste, unten das Neueste."],
  p3: ["Cada acierto añade la carta a la línea. Con 3 fallos termina. A los 8 y 18 aciertos, ⚡ +1 tikitexto.", "Each correct answer adds the card to the line. 3 mistakes end the game. At 8 and 18 correct, ⚡ +1 tikitext.", "Cada acerto adiciona a carta à linha. Com 3 erros acaba. Aos 8 e 18 acertos, ⚡ +1 tikitexto.", "Chaque bonne réponse ajoute la carte à la frise. À 3 erreurs, c'est fini. À 8 et 18 bonnes réponses, ⚡ +1 tikitexto.", "Ogni risposta giusta aggiunge la carta alla linea. Con 3 errori finisce. A 8 e 18 risposte giuste, ⚡ +1 tikitexto.", "Jede richtige Antwort fügt die Karte der Linie hinzu. Nach 3 Fehlern ist Schluss. Bei 8 und 18 richtigen Antworten ⚡ +1 Tikitext."],
  jugar: ["¡Jugar!", "Play!", "Jogar!", "Jouer !", "Gioca!", "Los geht's!"], salir: ["Salir", "Exit", "Sair", "Quitter", "Esci", "Beenden"], otra: ["Jugar otra vez", "Play again", "Jogar de novo", "Rejouer", "Gioca ancora", "Nochmal spielen"],
  ronda: ["Colocadas", "Placed", "Colocadas", "Placées", "Posizionate", "Platziert"],
  donde: ["¿Cuándo pasó?", "When did it happen?", "Quando aconteceu?", "C'était quand ?", "Quando è successo?", "Wann war das?"],
  aqui: ["aquí", "here", "aqui", "ici", "qui", "hier"],
  bien: ["¡Correcto!", "Correct!", "Correto!", "Correct !", "Corretto!", "Richtig!"], mal: ["¡Fallo!", "Wrong!", "Errou!", "Raté !", "Sbagliato!", "Falsch!"], tarde: ["¡Se acabó el tiempo!", "Time's up!", "Acabou o tempo!", "Temps écoulé !", "Tempo scaduto!", "Zeit abgelaufen!"],
  fue: ["Fue en", "It was in", "Foi em", "C'était en", "Fu nel", "Es war"], sig: ["Siguiente →", "Next →", "Próxima →", "Suivante →", "Avanti →", "Weiter →"],
  fin: ["Fin del partido", "Game over", "Fim de jogo", "Fin de la partie", "Fine della partita", "Spiel vorbei"],
  rec: ["¡Nuevo récord!", "New record!", "Novo recorde!", "Nouveau record !", "Nuovo record!", "Neuer Rekord!"],
  aciertos: ["colocadas", "placed", "colocadas", "placées", "posizionate", "platziert"], puntos: ["puntos", "points", "pontos", "points", "punti", "Punkte"],
  tiki: ["⚡ +1 tikitexto", "⚡ +1 tikitext", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 Tikitext"],
  cat: { mu: ["Mundial", "World Cup", "Copa do Mundo", "Coupe du monde", "Mondiale", "Weltmeisterschaft"], ch: ["Champions", "Champions", "Champions", "Champions", "Champions", "Champions"], oro: ["Balón de Oro", "Ballon d'Or", "Bola de Ouro", "Ballon d'Or", "Pallone d'Oro", "Ballon d'Or"], h: ["Historia", "History", "História", "Histoire", "Storia", "Geschichte"] },
  campeon: ["campeón", "champions", "campeão", "champion", "campione", "Weltmeister"],
  final: ["Final de la Champions", "Champions League final", "Final da Champions", "Finale de la Ligue des champions", "Finale di Champions", "Champions-League-Finale"],
  primer: ["Primer Balón de Oro de {n}", "{n}'s first Ballon d'Or", "Primeira Bola de Ouro de {n}", "Premier Ballon d'Or de {n}", "Primo Pallone d'Oro di {n}", "Erster Ballon d'Or von {n}"],
  y: [" y ", " and ", " e ", " et ", " e ", " und "],
  fuente: ["Datos a", "Data as of", "Dados de", "Données au", "Dati al", "Stand"],
};
/* hitos (año, texto en es, en, pt, fr, it, de) */
export const HITOS = [
  [1857, ["Se funda el Sheffield FC, el club más antiguo del mundo", "Sheffield FC is founded, the world's oldest club", "Fundado o Sheffield FC, o clube mais antigo do mundo", "Fondation de Sheffield FC, le plus ancien club du monde", "Nasce lo Sheffield FC, il club più antico del mondo", "Gründung des Sheffield FC, des ältesten Vereins der Welt"]],
  [1863, ["Se funda la Football Association y se fijan las primeras reglas comunes", "The Football Association is founded and the first common rules are set", "É fundada a Football Association e fixam-se as primeiras regras comuns", "Fondation de la Football Association et premières règles communes", "Viene fondata la Football Association e si fissano le prime regole comuni", "Die Football Association wird gegründet, die ersten gemeinsamen Regeln entstehen"]],
  [1872, ["Primer partido internacional oficial: Escocia–Inglaterra (0-0)", "First official international match: Scotland v England (0-0)", "Primeiro jogo internacional oficial: Escócia x Inglaterra (0-0)", "Premier match international officiel : Écosse-Angleterre (0-0)", "Prima partita internazionale ufficiale: Scozia-Inghilterra (0-0)", "Erstes offizielles Länderspiel: Schottland–England (0:0)"]],
  [1888, ["Nace la Football League inglesa, la liga profesional más antigua", "The English Football League is born, the oldest professional league", "Nasce a Football League inglesa, a liga profissional mais antiga", "Naissance de la Football League anglaise, la plus ancienne ligue professionnelle", "Nasce la Football League inglese, il più antico campionato professionistico", "Die englische Football League entsteht, die älteste Profiliga"]],
  [1891, ["Se introduce el penalti en las Reglas de Juego", "The penalty kick is introduced in the Laws of the Game", "O pênalti é introduzido nas Regras do Jogo", "Le penalty est introduit dans les Lois du Jeu", "Il calcio di rigore entra nel regolamento", "Der Strafstoß wird in die Fußballregeln aufgenommen"]],
  [1904, ["Se funda la FIFA en París", "FIFA is founded in Paris", "É fundada a FIFA em Paris", "Fondation de la FIFA à Paris", "Viene fondata la FIFA a Parigi", "Die FIFA wird in Paris gegründet"]],
  [1925, ["La regla del fuera de juego se reduce de tres a dos defensores", "The offside rule changes from three defenders to two", "A regra do impedimento passa de três para dois defensores", "La règle du hors-jeu passe de trois à deux défenseurs", "La regola del fuorigioco passa da tre a due difensori", "Die Abseitsregel wird von drei auf zwei Gegenspieler geändert"]],
  [1960, ["Se juega la primera Eurocopa (Copa de Naciones de Europa)", "The first European Championship is played", "Disputa-se o primeiro Campeonato Europeu", "Premier Championnat d'Europe des nations", "Si gioca il primo Campionato europeo", "Die erste Europameisterschaft wird ausgetragen"]],
  [1970, ["Aparecen las tarjetas amarilla y roja en el Mundial de México", "Yellow and red cards appear at the Mexico World Cup", "Surgem os cartões amarelo e vermelho na Copa do México", "Apparition des cartons jaune et rouge à la Coupe du monde au Mexique", "Compaiono i cartellini giallo e rosso al Mondiale in Messico", "Gelbe und Rote Karten feiern bei der WM in Mexiko Premiere"]],
  [1991, ["Primer Mundial femenino, celebrado en China", "First Women's World Cup, held in China", "Primeira Copa do Mundo feminina, realizada na China", "Première Coupe du monde féminine, en Chine", "Primo Mondiale femminile, in Cina", "Erste Frauen-Weltmeisterschaft, in China"]],
  [1992, ["Nace la Premier League inglesa", "The English Premier League is born", "Nasce a Premier League inglesa", "Naissance de la Premier League anglaise", "Nasce la Premier League inglese", "Die englische Premier League wird gegründet"]],
  [1992, ["El portero ya no puede coger con las manos el pase atrás de un compañero", "Goalkeepers can no longer handle a deliberate back-pass from a teammate", "O goleiro não pode mais pegar com as mãos um recuo intencional de um companheiro", "Le gardien ne peut plus prendre à la main une passe en retrait d'un coéquipier", "Il portiere non può più prendere con le mani un retropassaggio volontario di un compagno", "Der Torwart darf einen absichtlichen Rückpass eines Mitspielers nicht mehr mit der Hand aufnehmen"]],
  [1995, ["La sentencia Bosman libera el mercado de fichajes en Europa", "The Bosman ruling opens up the transfer market in Europe", "A decisão Bosman liberta o mercado de transferências na Europa", "L'arrêt Bosman libéralise le marché des transferts en Europe", "La sentenza Bosman libera il mercato dei trasferimenti in Europa", "Das Bosman-Urteil öffnet den Transfermarkt in Europa"]],
  [2014, ["La tecnología de línea de gol se estrena en un Mundial (Brasil)", "Goal-line technology debuts at a World Cup (Brazil)", "A tecnologia da linha do gol estreia em uma Copa do Mundo (Brasil)", "La technologie sur la ligne de but débute en Coupe du monde (Brésil)", "La tecnologia sulla linea di porta debutta in un Mondiale (Brasile)", "Die Torlinientechnik feiert bei einer WM Premiere (Brasilien)"]],
  [2016, ["La Eurocopa pasa a 24 selecciones (Francia)", "The European Championship grows to 24 teams (France)", "O Campeonato Europeu passa a ter 24 seleções (França)", "L'Euro passe à 24 équipes (France)", "L'Europeo passa a 24 squadre (Francia)", "Die EM wird auf 24 Mannschaften erweitert (Frankreich)"]],
  [2018, ["El VAR debuta en un Mundial (Rusia)", "VAR debuts at a World Cup (Russia)", "O VAR estreia em uma Copa do Mundo (Rússia)", "La VAR débute en Coupe du monde (Russie)", "Il VAR debutta in un Mondiale (Russia)", "Der Videobeweis feiert bei einer WM Premiere (Russland)"]],
  [2021, ["La UEFA elimina el gol de visitante como criterio de desempate", "UEFA scraps the away-goals rule", "A UEFA elimina o critério do gol fora de casa", "L'UEFA supprime la règle du but à l'extérieur", "La UEFA elimina la regola dei gol in trasferta", "Die UEFA schafft die Auswärtstorregel ab"]],
];

/* ── todos los hechos (año + clave; el texto se compone según el idioma) ── */
export function eventos() {
  const E = [];
  T.mundiales.forEach((m) => E.push({ id: "mu" + m[0], y: m[0], cat: "mu", sede: m[1], camp: m[2] }));
  T.finales.forEach((f) => E.push({ id: "ch" + f[0], y: f[0], cat: "ch", camp: f[1], sub: f[2], ciu: f[4] }));
  const vistos = {}; T.oro.forEach((x) => { if (!vistos[x[1]]) { vistos[x[1]] = 1; E.push({ id: "oro" + x[0], y: x[0], cat: "oro", n: x[1] }); } });
  HITOS.forEach((h, i) => E.push({ id: "h" + i, y: h[0], cat: "h", t: h[1] }));
  return E;
}
/* siguiente carta: año distinto de los ya colocados y, al principio, bastante alejado de ellos (más fácil) */
export function elegir(E, linea, usados, colocadas) {
  const anos = linea.map((e) => e.y);
  let cand = E.filter((e) => !usados.has(e.id) && anos.indexOf(e.y) < 0);
  if (colocadas < 4) { const lejos = cand.filter((e) => anos.every((a) => Math.abs(a - e.y) >= 12)); if (lejos.length) cand = lejos; }
  return cand.length ? cand[irnd(cand.length)] : null;
}
/* huecos válidos para una carta en una línea ordenada por año */
export function huecoValido(linea, ev, i) { return (i === 0 || linea[i - 1].y < ev.y) && (i === linea.length || ev.y < linea[i].y); }
export function huecoCorrecto(linea, ev) { for (let i = 0; i <= linea.length; i++) if (huecoValido(linea, ev, i)) return i; return linea.length; }

const PLANTILLA = `
<div class="lt-fondo"></div>
<div class="lt-tope">
<div class="lt-cab">
  <button type="button" class="lt-btn" data-lt="salir" aria-label="Salir">✕</button>
  <div class="lt-marc"><small data-ronda>Colocadas</small><b data-pts>0</b></div>
  <div class="lt-vidas" data-vidas></div>
</div>
<div class="lt-mano">
  <div class="lt-tiempo"><i data-barra></i></div>
  <div class="lt-carta" data-carta>
    <span class="lt-cat" data-cat></span>
    <p class="lt-texto" data-texto></p>
    <p class="lt-pregunta" data-pregunta></p>
  </div>
  <div class="lt-info" data-info></div>
</div>
</div>
<div class="lt-linea" data-linea></div>
<div class="lt-pie"><button type="button" class="lt-sig" data-lt="sig" hidden></button></div>
<div class="lt-menu" data-menu>
  <div class="lt-caja">
    <p class="lt-kicker" data-k="kicker"></p>
    <h2 class="lt-titulo"><span data-k="t1"></span><span data-k="t2"></span></h2>
    <p class="lt-sub" data-k="sub"></p>
    <ul class="lt-como">
      <li><b>1</b><span data-k="p1"></span></li>
      <li><b>2</b><span data-k="p2"></span></li>
      <li><b>3</b><span data-k="p3"></span></li>
    </ul>
    <p class="lt-stats" data-stats></p>
    <button type="button" class="lt-jugar" data-lt="jugar" data-k="jugar"></button>
    <button type="button" class="lt-sec" data-lt="salir" data-k="salir"></button>
  </div>
</div>
<div class="lt-fin" data-fin hidden>
  <div class="lt-caja lt-caja--s">
    <h3 data-k="fin"></h3>
    <p class="lt-res" data-fin-m></p>
    <p class="lt-res" data-fin-r></p>
    <p class="lt-tikis" data-fin-tiki hidden data-k="tiki"></p>
    <button type="button" class="lt-jugar" data-lt="jugar" data-k="otra"></button>
    <button type="button" class="lt-sec" data-lt="salir" data-k="salir"></button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const loc = String((api && api.locale) || "es").slice(0, 2).toLowerCase(), L = Math.max(0, LANGS.indexOf(loc));
  const tr = (k) => UI[k][L];
  raiz.innerHTML = PLANTILLA; raiz.setAttribute("data-no-t", "");
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  $$("[data-k]").forEach((e) => { e.textContent = tr(e.dataset.k); });
  const datos = () => { const d = api.datos(); ["mejor", "colocadas", "part", "tiki", "pts"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const E = eventos();
  const S = { fase: "menu", linea: [], mano: null, vidas: VIDAS, ok: 0, pts: 0, racha: 0, usados: new Set(), lim: TIEMPO, t0: 0, tikis: 0, bloq: false };
  let raf = 0, vivo = true, ctx = null, hSig = 0, ultimoTic = 0;

  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonBien = () => { blip(660, 0.1, 0.07, "triangle"); blip(990, 0.2, 0.07, "triangle", 0, 0.09); };
  const sonMal = () => blip(220, 0.28, 0.08, "sawtooth", 110);
  const sonTic = () => blip(880, 0.04, 0.03, "square");
  const sonPon = () => blip(520, 0.07, 0.05, "sine", 760);

  const nm = (k) => (T.N[k] ? T.N[k][L] : k);
  const unir = (a) => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + tr("y") + a[a.length - 1];
  const WC = ["Mundial", "World Cup", "Copa do Mundo", "Coupe du monde", "Mondiale", "Weltmeisterschaft"];
  function texto(e) {
    if (e.cat === "mu") return WC[L] + " · " + unir(e.sede.map(nm)) + " · " + tr("campeon") + ": " + nm(e.camp);
    if (e.cat === "ch") return tr("final") + " · " + nm(e.ciu) + ": " + nm(e.camp) + " – " + nm(e.sub);
    if (e.cat === "oro") return tr("primer").replace("{n}", e.n);
    return e.t[L];
  }
  function info(txt, cls) { const e = $("[data-info]"); e.className = "lt-info" + (cls ? " " + cls : ""); e.textContent = txt || ""; }
  function pintaVidas() { let h = ""; for (let i = 0; i < VIDAS; i++) h += '<i class="' + (i < S.vidas ? "on" : "") + '">⚽</i>'; $("[data-vidas]").innerHTML = h; }
  function pintaHud() { $("[data-ronda]").textContent = tr("ronda"); $("[data-pts]").textContent = String(S.ok); }
  function pintaStats() { const d = datos(); $("[data-stats]").textContent = (d.mejor ? "🏆 " + d.mejor + " · " + d.part + " ⚽ · " : "") + tr("fuente") + " " + T.fecha; }

  /* línea: huecos (＋) entre cartas; solo se pueden tocar mientras hay pregunta */
  function pintaLinea(marcas) {
    const cont = $("[data-linea]"); let h = "";
    const hueco = (i) => '<button type="button" class="lt-hueco" data-i="' + i + '" aria-label="' + tr("aqui") + '"' + (S.fase === "pregunta" ? "" : " disabled") + '><span>＋</span></button>';
    h += hueco(0);
    S.linea.forEach((e, i) => { h += '<div class="lt-nodo' + (marcas && marcas.nuevo === e ? " nuevo" : "") + '" data-y="' + e.y + '"><b class="lt-ano">' + e.y + '</b><span class="lt-nt"></span></div>' + hueco(i + 1); });
    cont.innerHTML = h;
    $$(".lt-nodo .lt-nt").forEach((el, i) => { el.textContent = texto(S.linea[i]); });
    if (marcas && marcas.bien != null) { const hs = $$(".lt-hueco"); if (marcas.mal != null && hs[marcas.mal]) hs[marcas.mal].classList.add("mal"); if (hs[marcas.bien]) hs[marcas.bien].classList.add("bien"); }
  }
  function siguiente() {
    S.bloq = false; const ev = elegir(E, S.linea, S.usados, S.ok); if (!ev) { termina(); return; }
    S.mano = ev; S.usados.add(ev.id); S.fase = "pregunta"; S.lim = TIEMPO; S.t0 = performance.now();
    $("[data-cat]").textContent = UI.cat[ev.cat][L]; $("[data-texto]").textContent = texto(ev); $("[data-pregunta]").textContent = tr("donde");
    $("[data-carta]").classList.remove("ok", "ko"); $('[data-lt="sig"]').hidden = true; info("", ""); pintaLinea(); pintaHud();
  }
  function colocar(i) {
    if (S.fase !== "pregunta" || S.bloq) return; S.bloq = true; S.fase = "resp";
    const ev = S.mano, resto = Math.max(0, S.lim - (performance.now() - S.t0) / 1000), ok = i != null && huecoValido(S.linea, ev, i), bien = huecoCorrecto(S.linea, ev);
    if (ok) {
      S.racha++; S.ok++; const g = 100 + Math.round(resto / S.lim * 50) + 10 * Math.min(S.racha, 5); S.pts += g;
      S.linea.splice(i, 0, ev); pintaLinea({ nuevo: ev }); sonPon(); sonBien(); info(tr("bien") + " · " + ev.y, "bien"); $("[data-carta]").classList.add("ok");
      const el = $(".lt-nodo.nuevo"); if (el && el.scrollIntoView) { try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { /* sin scroll suave */ } }
      UMBRALES_TIKI.forEach((u) => { if (S.ok === u) { S.tikis++; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } info(tr("tiki") + " · " + ev.y, "bien"); } });
    } else {
      S.racha = 0; S.vidas--; pintaVidas(); pintaLinea({ mal: i, bien: bien }); sonMal(); info((i == null ? tr("tarde") : tr("mal")) + " " + tr("fue") + " " + ev.y, "mal"); $("[data-carta]").classList.add("ko");
      const b = $(".lt-hueco.bien"); if (b && b.scrollIntoView) { try { b.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) { /* sin scroll suave */ } }
    }
    pintaHud(); const sg = $('[data-lt="sig"]'); sg.textContent = tr("sig"); sg.hidden = false;
    clearTimeout(hSig); hSig = setTimeout(avanza, ok ? PAUSA_OK : PAUSA_KO);
  }
  function avanza() { clearTimeout(hSig); if (!vivo || S.fase !== "resp") return; if (S.vidas <= 0) termina(); else siguiente(); }
  function termina() {
    S.fase = "fin"; const d = datos(); d.part++; d.colocadas += S.ok; d.pts += S.pts; const nuevo = S.ok > d.mejor; if (nuevo) d.mejor = S.ok; d.tiki += S.tikis;
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-fin-m]").textContent = S.ok + " " + tr("aciertos") + " · " + S.pts + " " + tr("puntos"); $("[data-fin-r]").textContent = nuevo ? tr("rec") : "🏆 " + d.mejor;
    $("[data-fin-tiki]").hidden = !S.tikis; $("[data-fin]").hidden = false; $('[data-lt="sig"]').hidden = true; pintaStats();
  }
  function empezar() {
    audio(); Object.assign(S, { fase: "pregunta", linea: [], vidas: VIDAS, ok: 0, pts: 0, racha: 0, usados: new Set(), tikis: 0 });
    const ini = E[irnd(E.length)]; S.linea.push(ini); S.usados.add(ini.id);
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; pintaVidas(); siguiente();
    cancelAnimationFrame(raf); raf = requestAnimationFrame(bucle);
  }
  function bucle() {
    if (!vivo) return; raf = requestAnimationFrame(bucle);
    if (S.fase !== "pregunta") return;
    const resto = S.lim - (performance.now() - S.t0) / 1000, k = clamp(resto / S.lim, 0, 1), b = $("[data-barra]");
    b.style.transform = "scaleX(" + k.toFixed(4) + ")"; b.className = k < 0.25 ? "rojo" : k < 0.5 ? "ambar" : "";
    if (resto < 3 && Math.ceil(resto) !== ultimoTic) { ultimoTic = Math.ceil(resto); sonTic(); }
    if (resto <= 0) colocar(null);
  }
  raiz.addEventListener("click", function (e) {
    audio();
    const h = e.target.closest ? e.target.closest(".lt-hueco") : null; if (h && !h.disabled) { colocar(+h.dataset.i); return; }
    const b = e.target.closest ? e.target.closest("[data-lt]") : null; if (!b) return; const a = b.dataset.lt;
    if (a === "salir") cerrar(); else if (a === "jugar") empezar(); else if (a === "sig") avanza();
  });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    if (S.fase === "resp" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); avanza(); }
    else if ((e.key === "Enter" || e.key === " ") && (S.fase === "menu" || S.fase === "fin")) { e.preventDefault(); empezar(); }
  };
  window.addEventListener("keydown", onKey);
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf); clearTimeout(hSig); window.removeEventListener("keydown", onKey);
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  pintaVidas(); pintaHud(); pintaStats();
  return { cerrar: cerrar, S: S, empezar: empezar, colocar: colocar, avanza: avanza, EV: E, texto: texto, elegir: () => elegir(E, S.linea, S.usados, S.ok), huecoValido: huecoValido, huecoCorrecto: huecoCorrecto, UI: UI };
}
