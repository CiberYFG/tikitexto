/* VITRINA DE LOGROS · TIKITEXTO (21-nov-2026)
   Medallas (bronce, plata y oro) que salen de tus marcas en todos los juegos. No hay servidor ni ranking: solo lee tu perfil local
   (`perfil()` y `perfil().nv.*`) y guarda lo ya celebrado en `nv.lg`. Módulo ES; sonidos sintetizados (respetan los ajustes);
   sin escudos, fotos ni logos. */
const LANGS = ["es", "en", "pt", "fr", "it", "de"];

const UI = {
  titulo: ["Vitrina de logros", "Trophy cabinet", "Vitrine de conquistas", "Vitrine des succès", "Bacheca dei traguardi", "Erfolgsvitrine"],
  sub: ["Tus medallas de bronce, plata y oro. Se desbloquean solas mientras juegas.", "Your bronze, silver and gold medals. They unlock by themselves as you play.", "Suas medalhas de bronze, prata e ouro. Elas se desbloqueiam sozinhas enquanto você joga.", "Tes médailles de bronze, d'argent et d'or. Elles se débloquent toutes seules pendant que tu joues.", "Le tue medaglie di bronzo, argento e oro. Si sbloccano da sole mentre giochi.", "Deine Bronze-, Silber- und Goldmedaillen. Sie schalten sich beim Spielen von selbst frei."],
  medallas: ["medallas", "medals", "medalhas", "médailles", "medaglie", "Medaillen"],
  de: ["de", "of", "de", "sur", "su", "von"],
  nivel: ["Nivel", "Level", "Nível", "Niveau", "Livello", "Rang"],
  rangos: [
    ["Aficionado", "Fan", "Aficionado", "Supporter", "Tifoso", "Fan"],
    ["Canterano", "Academy player", "Garoto da base", "Jeune du centre", "Primavera", "Nachwuchsspieler"],
    ["Titular", "Starter", "Titular", "Titulaire", "Titolare", "Stammspieler"],
    ["Capitán", "Captain", "Capitão", "Capitaine", "Capitano", "Kapitän"],
    ["Crack", "Star player", "Craque", "Crack", "Fuoriclasse", "Topstar"],
    ["Leyenda", "Legend", "Lenda", "Légende", "Leggenda", "Legende"],
  ],
  todas: ["Todas", "All", "Todas", "Toutes", "Tutte", "Alle"],
  ganadas: ["Conseguidas", "Earned", "Conquistadas", "Obtenues", "Ottenute", "Erreicht"],
  pendientes: ["Por conseguir", "To earn", "A conquistar", "À obtenir", "Da ottenere", "Offen"],
  bronce: ["Bronce", "Bronze", "Bronze", "Bronze", "Bronzo", "Bronze"], plata: ["Plata", "Silver", "Prata", "Argent", "Argento", "Silber"], oro: ["Oro", "Gold", "Ouro", "Or", "Oro", "Gold"],
  sig: ["Siguiente medalla", "Next medal", "Próxima medalha", "Prochaine médaille", "Prossima medaglia", "Nächste Medaille"],
  max: ["¡Máximo nivel!", "Max level!", "Nível máximo!", "Niveau maximum !", "Livello massimo!", "Höchste Stufe!"],
  cerrar: ["Cerrar", "Close", "Fechar", "Fermer", "Chiudi", "Schließen"],
  compartir: ["Compartir", "Share", "Compartilhar", "Partager", "Condividi", "Teilen"],
  copiado: ["¡Copiado!", "Copied!", "Copiado!", "Copié !", "Copiato!", "Kopiert!"],
  texto: ["Tengo {n} medallas en TIKITEXTO (rango {r}). ¿Me superas?", "I have {n} medals on TIKITEXTO (rank {r}). Can you beat me?", "Tenho {n} medalhas no TIKITEXTO (nível {r}). Você me supera?", "J'ai {n} médailles sur TIKITEXTO (niveau {r}). Tu peux me battre ?", "Ho {n} medaglie su TIKITEXTO (livello {r}). Mi superi?", "Ich habe {n} Medaillen bei TIKITEXTO (Rang {r}). Schlägst du mich?"],
  nuevo: ["¡Logro desbloqueado!", "Achievement unlocked!", "Conquista desbloqueada!", "Succès débloqué !", "Traguardo sbloccato!", "Erfolg freigeschaltet!"],
  inicial: ["Tu vitrina ya tiene", "Your cabinet already has", "Sua vitrine já tem", "Ta vitrine a déjà", "La tua bacheca ha già", "Deine Vitrine hat schon"],
  g_gen: ["General", "General", "Geral", "Général", "Generale", "Allgemein"],
  g_letras: ["Juegos de letras y preguntas", "Word and quiz games", "Jogos de letras e perguntas", "Jeux de lettres et de questions", "Giochi di lettere e domande", "Wort- und Quizspiele"],
  g_din: ["Videojuegos", "Video games", "Videogames", "Jeux vidéo", "Videogiochi", "Videospiele"],
  vacio: ["Aún no hay nada aquí. ¡A jugar!", "Nothing here yet. Go play!", "Ainda não há nada aqui. Vá jogar!", "Rien ici pour l'instant. À toi de jouer !", "Ancora niente qui. Gioca!", "Noch nichts hier. Los geht's!"],
  tikis: ["tikitextos", "tikitexts", "tikitextos", "tikitextos", "tikitexto", "Tikitexte"],
};

/* Catálogo. t = título, d = descripción con {n}; tiers = [bronce, plata, oro]; get(P, NV) = valor actual. */
const num = (v) => (typeof v === "number" && isFinite(v) ? v : 0);
const JUEGOS_PROBADOS = [
  (P, NV) => num(P.jugadas), (P, NV) => num((NV.sl || {}).part), (P, NV) => num((NV.to || {}).part), (P, NV) => num((NV.pp || {}).part), (P, NV) => num((NV.pe || {}).part),
  (P, NV) => num((NV.cu || {}).part), (P, NV) => num((NV.sp || {}).part), (P, NV) => num((NV.pb || {}).part), (P, NV) => num((NV.tl || {}).tandas), (P, NV) => num((NV.p || {}).tandas),
  (P, NV) => num((NV.c || {}).gan) + num((NV.c || {}).per) + num((NV.c || {}).emp), (P, NV) => num((NV.dd || {}).part), (P, NV) => num(NV.a), (P, NV) => num(NV.t), (P, NV) => num(NV.f),
];
export const LOGROS = [
  { id: "tiki", g: "gen", ico: "⚡", tiers: [10, 50, 250], get: (P) => num(P.pts),
    t: ["Cazador de tikitextos", "Tikitext hunter", "Caçador de tikitextos", "Chasseur de tikitextos", "Cacciatore di tikitexto", "Tikitext-Jäger"],
    d: ["Consigue {n} tikitextos", "Earn {n} tikitexts", "Ganhe {n} tikitextos", "Gagne {n} tikitextos", "Ottieni {n} tikitexto", "Sammle {n} Tikitexte"] },
  { id: "diario", g: "gen", ico: "📅", tiers: [5, 30, 120], get: (P) => num(P.jugadas),
    t: ["Fiel a la cita", "Never misses a day", "Sempre presente", "Toujours au rendez-vous", "Sempre all'appuntamento", "Immer dabei"],
    d: ["Juega {n} partidas del juego diario", "Play {n} daily games", "Jogue {n} partidas do jogo diário", "Joue {n} parties du jeu quotidien", "Gioca {n} partite del gioco quotidiano", "Spiele {n} Partien des Tagesspiels"] },
  { id: "racha", g: "gen", ico: "🔥", tiers: [3, 6, 12], get: (P) => num(P.mejor),
    t: ["Racha de fuego", "On fire", "Em chamas", "En feu", "In fiamme", "Heiße Serie"],
    d: ["Acierta {n} jugadores seguidos en el juego diario", "Get {n} daily players right in a row", "Acerte {n} jogadores seguidos no jogo diário", "Trouve {n} joueurs d'affilée au jeu quotidien", "Indovina {n} giocatori di fila nel gioco quotidiano", "Errate {n} Spieler in Folge im Tagesspiel"] },
  { id: "const", g: "gen", ico: "🗓️", tiers: [3, 7, 30], get: (P) => num(P.diaMejor),
    t: ["Constancia", "Consistency", "Constância", "Régularité", "Costanza", "Beständigkeit"],
    d: ["Juega {n} días seguidos", "Play {n} days in a row", "Jogue {n} dias seguidos", "Joue {n} jours d'affilée", "Gioca {n} giorni di fila", "Spiele {n} Tage in Folge"] },
  { id: "todo", g: "gen", ico: "🌍", tiers: [3, 8, 14], get: (P, NV) => JUEGOS_PROBADOS.filter((f) => f(P, NV) > 0).length,
    t: ["Todoterreno", "All-rounder", "Polivalente", "Touche-à-tout", "Jolly", "Allrounder"],
    d: ["Prueba {n} juegos distintos", "Try {n} different games", "Experimente {n} jogos diferentes", "Essaie {n} jeux différents", "Prova {n} giochi diversi", "Probiere {n} verschiedene Spiele aus"] },

  { id: "rosco", g: "letras", ico: "🎡", tiers: [10, 20, 26], get: (P, NV) => num((NV.pp || {}).maxAc),
    t: ["Maestro del rosco", "Wheel master", "Mestre do rosco", "Maître du rosco", "Maestro del rosco", "Rosco-Meister"],
    d: ["Acierta {n} letras del rosco en una partida", "Get {n} letters right on the wheel in one game", "Acerte {n} letras do rosco numa partida", "Trouve {n} lettres du rosco en une partie", "Indovina {n} lettere del rosco in una partita", "Löse {n} Buchstaben des Roscos in einer Partie"] },
  { id: "perfecto", g: "letras", ico: "💎", tiers: [1, 3, 10], get: (P, NV) => num((NV.pp || {}).perf),
    t: ["Rosco perfecto", "Perfect wheel", "Rosco perfeito", "Rosco parfait", "Rosco perfetto", "Perfektes Rosco"],
    d: ["Roscos completados sin ningún fallo: {n}", "Wheels completed with no mistakes: {n}", "Roscos completos sem nenhum erro: {n}", "Roscos terminés sans aucune erreur : {n}", "Rosco completati senza errori: {n}", "Roscos ohne Fehler abgeschlossen: {n}"] },
  { id: "pert", g: "letras", ico: "🧠", tiers: [10, 25, 50], get: (P, NV) => num((NV.pe || {}).aciertos),
    t: ["Cerebro de estadio", "Stadium brain", "Cérebro de estádio", "Cerveau de stade", "Cervello da stadio", "Stadion-Gehirn"],
    d: ["Acierta {n} preguntas en una partida de ¿A qué pertenece?", "Get {n} right in one game of What does it belong to?", "Acerte {n} perguntas numa partida de A que pertence?", "Réussis {n} questions en une partie de À quoi ça appartient ?", "Azzecca {n} domande in una partita di A cosa appartiene?", "Beantworte {n} Fragen in einer Partie Wozu gehört das?"] },
  { id: "cuart", g: "letras", ico: "🧩", tiers: [1, 10, 50], get: (P, NV) => num((NV.cu || {}).gan),
    t: ["Resuelve-cuartetos", "Quartet solver", "Resolve-quartetos", "Briseur de quatuors", "Risolvi-quartetti", "Quartett-Knacker"],
    d: ["Cuartetos resueltos: {n}", "Quartets solved: {n}", "Quartetos resolvidos: {n}", "Quatuors résolus : {n}", "Quartetti risolti: {n}", "Gelöste Quartette: {n}"] },
  { id: "cuartr", g: "letras", ico: "📆", tiers: [2, 7, 30], get: (P, NV) => num((NV.cu || {}).mejor),
    t: ["Reto diario", "Daily challenge", "Desafio diário", "Défi quotidien", "Sfida quotidiana", "Tagesrätsel"],
    d: ["Gana el cuarteto del día {n} días seguidos", "Win the daily quartet {n} days in a row", "Vença o quarteto do dia {n} dias seguidos", "Gagne le quatuor du jour {n} jours d'affilée", "Vinci il quartetto del giorno {n} giorni di fila", "Gewinne das Tagesquartett {n} Tage in Folge"] },
  { id: "cracks", g: "letras", ico: "🔎", tiers: [20, 150, 600], get: (P, NV) => num((NV.sp || {}).nom),
    t: ["Cazacracks", "Star spotter", "Caça-craques", "Chasseur de stars", "Caccia-fuoriclasse", "Star-Sucher"],
    d: ["Encuentra {n} nombres en Cracks Ocultos", "Find {n} names in Hidden Stars", "Encontre {n} nomes em Craques Escondidos", "Trouve {n} noms dans Stars cachées", "Trova {n} nomi in Fuoriclasse nascosti", "Finde {n} Namen in Versteckte Stars"] },
  { id: "ahorc", g: "letras", ico: "🪢", tiers: [1, 4, 10], get: (P, NV) => num(NV.a),
    t: ["Salvavidas", "Lifesaver", "Salva-vidas", "Sauveur", "Salvatore", "Lebensretter"],
    d: ["Ahorcados ganados seguidos: {n}", "Hangman games won in a row: {n}", "Forcas vencidas seguidas: {n}", "Pendus gagnés d'affilée : {n}", "Impiccati vinti di fila: {n}", "Galgenmännchen in Folge gewonnen: {n}"] },
  { id: "tarj", g: "letras", ico: "🟨", tiers: [5, 12, 25], get: (P, NV) => num(NV.t),
    t: ["Ojo de halcón", "Eagle eye", "Olho de águia", "Œil de lynx", "Occhio di falco", "Adlerauge"],
    d: ["Llega a la ronda {n} en ¿Quién tiene más tarjetas?", "Reach round {n} in Who has more cards?", "Chegue à rodada {n} em Quem tem mais cartões?", "Atteins la manche {n} dans Qui a le plus de cartons ?", "Arriva al round {n} in Chi ha più cartellini?", "Erreiche Runde {n} bei Wer hat mehr Karten?"] },
  { id: "fich", g: "letras", ico: "💸", tiers: [3, 8, 15], get: (P, NV) => num(NV.f),
    t: ["Director deportivo", "Sporting director", "Diretor esportivo", "Directeur sportif", "Direttore sportivo", "Sportdirektor"],
    d: ["Encadena {n} aciertos en ¿Cuánto costó?", "Get {n} right in a row in How much did it cost?", "Acerte {n} seguidas em Quanto custou?", "Enchaîne {n} réussites dans Combien ça a coûté ?", "Metti insieme {n} risposte di fila in Quanto è costato?", "Erziele {n} Treffer in Folge bei Was hat er gekostet?"] },
  { id: "duelo", g: "letras", ico: "⚔️", tiers: [8, 20, 40], get: (P, NV) => num((NV.dd || {}).aciertos),
    t: ["Dato sobre dato", "Stat showdown", "Dado contra dado", "Duel de chiffres", "Sfida di numeri", "Zahlenduell"],
    d: ["Acierta {n} duelos de datos en una partida", "Win {n} data duels in one game", "Acerte {n} duelos de dados numa partida", "Gagne {n} duels de données en une partie", "Vinci {n} duelli di dati in una partita", "Gewinne {n} Datenduelle in einer Partie"] },

  { id: "rush", g: "din", ico: "🏃", tiers: [500, 2000, 6000], get: (P, NV) => num((NV.sl || {}).mejorm),
    t: ["Corredor imparable", "Unstoppable runner", "Corredor imparável", "Coureur inarrêtable", "Corridore inarrestabile", "Unaufhaltsamer Läufer"],
    d: ["Recorre {n} metros en una carrera de TIKI RUSH", "Run {n} metres in one TIKI RUSH race", "Percorra {n} metros numa corrida do TIKI RUSH", "Parcours {n} mètres dans une course TIKI RUSH", "Percorri {n} metri in una corsa di TIKI RUSH", "Laufe {n} Meter in einem TIKI-RUSH-Lauf"] },
  { id: "monedas", g: "din", ico: "🪙", tiers: [100, 1000, 5000], get: (P, NV) => num((NV.sl || {}).bal),
    t: ["Cazamonedas", "Coin collector", "Caçador de moedas", "Chasseur de pièces", "Cacciatore di monete", "Münzsammler"],
    d: ["Recoge {n} monedas en TIKI RUSH", "Collect {n} coins in TIKI RUSH", "Recolha {n} moedas no TIKI RUSH", "Ramasse {n} pièces dans TIKI RUSH", "Raccogli {n} monete in TIKI RUSH", "Sammle {n} Münzen in TIKI RUSH"] },
  { id: "toques", g: "din", ico: "⚽", tiers: [25, 100, 300], get: (P, NV) => num((NV.to || {}).mejor),
    t: ["Malabarista", "Juggler", "Malabarista", "Jongleur", "Giocoliere", "Jongleur"],
    d: ["Da {n} toques seguidos sin que caiga el balón", "Keep the ball up for {n} touches in a row", "Dê {n} toques seguidos sem a bola cair", "Enchaîne {n} touches sans faire tomber le ballon", "Fai {n} tocchi di fila senza far cadere il pallone", "Schaffe {n} Ballkontakte hintereinander"] },
  { id: "toquest", g: "din", ico: "🦶", tiers: [500, 5000, 25000], get: (P, NV) => num((NV.to || {}).tot),
    t: ["Pies de seda", "Silky feet", "Pés de seda", "Pieds de velours", "Piedi di seta", "Seidenfüße"],
    d: ["Suma {n} toques en total", "Reach {n} touches in total", "Some {n} toques no total", "Cumule {n} touches au total", "Totalizza {n} tocchi", "Sammle insgesamt {n} Ballkontakte"] },
  { id: "pinb", g: "din", ico: "🎯", tiers: [5, 30, 150], get: (P, NV) => num((NV.pb || {}).gol),
    t: ["Mago del flíper", "Pinball wizard", "Mago do pinball", "Magicien du flipper", "Mago del flipper", "Flipper-Zauberer"],
    d: ["Marca {n} goles en el Pinball Golazo", "Score {n} goals in Pinball Golazo", "Marque {n} gols no Pinball Golazo", "Marque {n} buts au Pinball Golazo", "Segna {n} gol nel Pinball Golazo", "Erziele {n} Tore im Pinball Golazo"] },
  { id: "tl", g: "din", ico: "🥾", tiers: [1, 10, 40], get: (P, NV) => num((NV.tl || {}).gan),
    t: ["Especialista a balón parado", "Set-piece specialist", "Especialista em bola parada", "Spécialiste des coups de pied arrêtés", "Specialista dei calci piazzati", "Standard-Spezialist"],
    d: ["Series de tiros libres ganadas: {n}", "Free-kick series won: {n}", "Séries de faltas vencidas: {n}", "Séries de coups francs gagnées : {n}", "Serie di punizioni vinte: {n}", "Gewonnene Freistoß-Serien: {n}"] },
  { id: "golazos", g: "din", ico: "🚀", tiers: [3, 15, 60], get: (P, NV) => num((NV.tl || {}).golazos),
    t: ["Golazo", "Screamer", "Golaço", "Golazo", "Golazo", "Traumtor"],
    d: ["Marca {n} golazos de falta", "Score {n} free-kick screamers", "Marque {n} golaços de falta", "Marque {n} golazos sur coup franc", "Segna {n} golazo su punizione", "Erziele {n} Traumtore per Freistoß"] },
  { id: "pen", g: "din", ico: "🥅", tiers: [1, 10, 40], get: (P, NV) => num((NV.p || {}).gan),
    t: ["Sangre fría", "Ice cold", "Sangue frio", "Sang-froid", "Sangue freddo", "Nerven aus Stahl"],
    d: ["Tandas de penaltis ganadas: {n}", "Penalty shootouts won: {n}", "Disputas de pênaltis vencidas: {n}", "Séances de tirs au but gagnées : {n}", "Serie di rigori vinte: {n}", "Gewonnene Elfmeterschießen: {n}"] },
  { id: "par", g: "din", ico: "🧤", tiers: [5, 30, 150], get: (P, NV) => num((NV.p || {}).par),
    t: ["Gato bajo palos", "Safe hands", "Gato debaixo das traves", "Chat sous la barre", "Gatto tra i pali", "Katze zwischen den Pfosten"],
    d: ["Para {n} penaltis", "Save {n} penalties", "Defenda {n} pênaltis", "Arrête {n} penaltys", "Para {n} rigori", "Halte {n} Elfmeter"] },
  { id: "chap", g: "din", ico: "👑", tiers: [1, 10, 40], get: (P, NV) => num((NV.c || {}).gan),
    t: ["Rey de las chapas", "Bottle-cap king", "Rei das tampinhas", "Roi des capsules", "Re delle monetine", "Kronkorken-König"],
    d: ["Partidos de chapas ganados: {n}", "Bottle-cap matches won: {n}", "Partidas de tampinhas vencidas: {n}", "Matchs de capsules gagnés : {n}", "Partite di monetine vinte: {n}", "Gewonnene Kronkorken-Spiele: {n}"] },
  { id: "chapg", g: "din", ico: "🔵", tiers: [10, 50, 250], get: (P, NV) => num((NV.c || {}).gol),
    t: ["Goleador de chapas", "Cap scorer", "Artilheiro de tampinhas", "Buteur de capsules", "Bomber di monetine", "Kronkorken-Torjäger"],
    d: ["Marca {n} goles en chapas", "Score {n} goals in bottle-cap football", "Marque {n} gols nas tampinhas", "Marque {n} buts aux capsules", "Segna {n} gol alle monetine", "Erziele {n} Tore im Kronkorken-Fußball"] },
];

const GRUPOS = [["gen", "g_gen"], ["letras", "g_letras"], ["din", "g_din"]];
const nombreTier = ["", "bronce", "plata", "oro"];

/* Cálculo puro (para tests): nivel 0-3 de cada logro */
export function calcular(P, NV) {
  P = P || {}; NV = NV || {};
  return LOGROS.map((l) => {
    const v = l.get(P, NV), nivel = l.tiers.filter((t) => v >= t).length;
    return { id: l.id, v, nivel, sig: nivel < 3 ? l.tiers[nivel] : null, ant: nivel > 0 ? l.tiers[nivel - 1] : 0 };
  });
}
export function resumen(est) {
  const pts = est.reduce((s, e) => s + e.nivel, 0), max = LOGROS.length * 3, frac = pts / max;
  const rango = frac >= 0.9 ? 5 : frac >= 0.7 ? 4 : frac >= 0.45 ? 3 : frac >= 0.25 ? 2 : frac >= 0.1 ? 1 : 0;
  return { pts, max, frac, rango, conseguidas: est.filter((e) => e.nivel > 0).length };
}

const SVG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="lgB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0b27a"/><stop offset=".5" stop-color="#cd7f32"/><stop offset="1" stop-color="#7a3f0e"/></linearGradient>
<linearGradient id="lgS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b9c4d6"/><stop offset="1" stop-color="#6c7a93"/></linearGradient>
<linearGradient id="lgO" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#ffc936"/><stop offset="1" stop-color="#b8750a"/></linearGradient>
<linearGradient id="lgL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b4468"/><stop offset="1" stop-color="#1b2140"/></linearGradient>
</defs></svg>`;
const GRAD = ["lgL", "lgB", "lgS", "lgO"];
function medalla(nivel, ico) {
  const g = GRAD[nivel];
  return '<span class="lg-med lg-med--' + nivel + '"><svg viewBox="0 0 96 118" aria-hidden="true">'
    + '<path d="M26 2h16l10 38-17 8z" fill="#e23a55"/><path d="M70 2H54L44 40l17 8z" fill="#2f6bff"/>'
    + '<circle cx="48" cy="76" r="38" fill="url(#' + g + ')"/><circle cx="48" cy="76" r="38" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2"/>'
    + '<circle cx="48" cy="76" r="29" fill="rgba(0,0,0,.14)" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>'
    + '<path d="M20 62a30 30 0 0 1 56 0" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="5" stroke-linecap="round"/></svg>'
    + '<i class="lg-ico">' + (nivel ? ico : "🔒") + "</i></span>";
}
const estrellas = (n) => '<span class="lg-est" aria-hidden="true">' + [1, 2, 3].map((i) => '<b class="' + (i <= n ? "on" : "") + '">★</b>').join("") + "</span>";

/* ───────── Vitrina ───────── */
export function abrir(api, raiz) {
  const loc = String((api && api.locale) || "es").slice(0, 2).toLowerCase(), L = Math.max(0, LANGS.indexOf(loc));
  const tr = (k) => UI[k][L], fmt = (n) => n.toLocaleString(api.locale || "es");
  const P = api.perfil(), NV = api.nv();
  const est = calcular(P, NV), res = resumen(est), porId = {}; est.forEach((e) => { porId[e.id] = e; });
  raiz.setAttribute("data-no-t", ""); raiz.setAttribute("role", "dialog"); raiz.setAttribute("aria-modal", "true"); raiz.setAttribute("aria-label", tr("titulo"));
  let filtro = "todas", vivo = true;
  const R = 46, CIRC = 2 * Math.PI * R;

  raiz.innerHTML = SVG_DEFS
    + '<div class="lg-fondo" aria-hidden="true"></div>'
    + '<div class="lg-wrap">'
    + '<div class="lg-cab"><button type="button" class="lg-x" data-lg="cerrar" aria-label="' + tr("cerrar") + '">✕</button><h2 class="lg-titulo">' + tr("titulo") + "</h2></div>"
    + '<p class="lg-sub">' + tr("sub") + "</p>"
    + '<section class="lg-hero"><div class="lg-anillo"><svg viewBox="0 0 108 108" aria-hidden="true"><circle cx="54" cy="54" r="' + R + '" class="pista"/><circle cx="54" cy="54" r="' + R + '" class="prog" stroke-dasharray="' + CIRC.toFixed(1) + '" stroke-dashoffset="' + CIRC.toFixed(1) + '" transform="rotate(-90 54 54)"/></svg><b data-pct>0%</b></div>'
    + '<div class="lg-hero__txt"><small>' + tr("nivel") + '</small><strong data-rango></strong><span data-cuenta></span>'
    + '<div class="lg-pills"><i data-pb>🥉 0</i><i data-ps>🥈 0</i><i data-po>🥇 0</i><i data-tk>⚡ 0</i></div></div>'
    + '<button type="button" class="lg-share" data-lg="compartir">↗ ' + tr("compartir") + "</button></section>"
    + '<div class="lg-filtros" role="tablist">' + [["todas", "todas"], ["ganadas", "ganadas"], ["pendientes", "pendientes"]].map((f) => '<button type="button" role="tab" data-f="' + f[0] + '" aria-selected="' + (f[0] === "todas") + '">' + tr(f[1]) + "</button>").join("") + "</div>"
    + '<div class="lg-lista" data-lista></div></div>';

  const $ = (s) => raiz.querySelector(s);
  $("[data-rango]").textContent = UI.rangos[res.rango][L];
  $("[data-cuenta]").textContent = res.pts + " " + tr("de") + " " + res.max + " " + tr("medallas");
  $("[data-pct]").textContent = Math.round(res.frac * 100) + "%";
  const cont = (n) => est.filter((e) => e.nivel >= n).length; // medallas de cada color: cuántos logros han llegado al menos a ese nivel
  $("[data-pb]").textContent = "🥉 " + cont(1); $("[data-ps]").textContent = "🥈 " + cont(2); $("[data-po]").textContent = "🥇 " + cont(3); $("[data-tk]").textContent = "⚡ " + fmt(Math.max(0, Math.floor(P.pts || 0))) + " " + tr("tikis");
  requestAnimationFrame(() => { requestAnimationFrame(() => { const p = raiz.querySelector(".prog"); if (p) p.setAttribute("stroke-dashoffset", (CIRC * (1 - res.frac)).toFixed(1)); }); });

  function tarjeta(l, i) {
    const e = porId[l.id], tt = l.t[L], dd = l.d[L].replace("{n}", fmt(e.nivel < 3 ? e.sig : l.tiers[2]));
    const prog = e.nivel < 3 ? Math.max(0, Math.min(100, ((e.v - e.ant) / (e.sig - e.ant)) * 100)) : 100;
    return '<article class="lg-card lg-card--' + e.nivel + '" style="--i:' + i + '" data-id="' + l.id + '">'
      + medalla(e.nivel, l.ico) + '<div class="lg-card__txt"><h3>' + tt + "</h3>" + estrellas(e.nivel)
      + "<p>" + dd + "</p>"
      + '<div class="lg-barra"><i style="width:' + prog.toFixed(1) + '%"></i></div>'
      + '<small>' + (e.nivel < 3 ? fmt(Math.min(e.v, e.sig)) + " / " + fmt(e.sig) + " · " + tr("sig") + ": " + tr(nombreTier[e.nivel + 1]) : "★ " + tr("max") + " · " + fmt(e.v)) + "</small></div></article>";
  }
  function pinta() {
    let h = "", i = 0, alguno = false;
    GRUPOS.forEach((G) => {
      const ls = LOGROS.filter((l) => l.g === G[0]).filter((l) => { const n = porId[l.id].nivel; return filtro === "todas" || (filtro === "ganadas" ? n > 0 : n < 3); });
      if (!ls.length) return; alguno = true;
      h += '<h3 class="lg-grupo">' + tr(G[1]) + '</h3><div class="lg-grid">' + ls.map((l) => tarjeta(l, i++)).join("") + "</div>";
    });
    $("[data-lista]").innerHTML = alguno ? h : '<p class="lg-vacio">' + tr("vacio") + "</p>";
  }
  pinta();
  raiz.addEventListener("click", (e) => {
    const t = e.target.closest ? e.target.closest("[data-lg],[data-f]") : null; if (!t) return;
    if (t.dataset.lg === "cerrar") cerrar();
    else if (t.dataset.lg === "compartir") compartir(t);
    else if (t.dataset.f) { filtro = t.dataset.f; Array.prototype.forEach.call(raiz.querySelectorAll("[data-f]"), (b) => b.setAttribute("aria-selected", String(b.dataset.f === filtro))); pinta(); }
  });
  function compartir(btn) {
    const txt = tr("texto").replace("{n}", res.pts + "/" + res.max).replace("{r}", UI.rangos[res.rango][L]), url = "https://tikitexto.com/";
    const copiado = () => { const antes = btn.textContent; btn.textContent = "✔ " + tr("copiado"); setTimeout(() => { btn.textContent = antes; }, 1800); };
    try {
      if (navigator.share) { navigator.share({ title: "TIKITEXTO", text: txt, url }).catch(() => { /* cancelado */ }); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt + " " + url).then(copiado, () => { /* sin permiso */ }); }
    } catch (e) { /* sin API de compartir */ }
  }
  const onKey = (e) => { if (e.key === "Escape") cerrar(); };
  window.addEventListener("keydown", onKey);
  const previo = document.activeElement; setTimeout(() => { const x = raiz.querySelector(".lg-x"); if (x) x.focus(); }, 50);
  function cerrar() {
    if (!vivo) return; vivo = false; window.removeEventListener("keydown", onKey); raiz.innerHTML = ""; if (api.salir) api.salir(); try { if (previo && previo.focus) previo.focus(); } catch (e) { /* opcional */ }
  }
  return { cerrar, est, res, LOGROS, filtrar: (f) => { filtro = f; pinta(); } };
}

/* ───────── Avisos al desbloquear ───────── */
let ctx = null, cola = [], mostrando = false;
function sonido(api) {
  if (!api.sonido()) return;
  try {
    if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } if (ctx.state === "suspended") ctx.resume();
    [784, 1046, 1318].forEach((f, i) => { const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + i * 0.1; o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.4); });
  } catch (e) { /* sin audio */ }
}
function siguienteAviso(api, L) {
  if (mostrando || !cola.length) return; mostrando = true;
  const a = cola.shift(), el = document.createElement("div"); el.className = "lg-toast lg-toast--" + a.nivel; el.setAttribute("role", "status"); el.setAttribute("data-no-t", "");
  el.innerHTML = medalla(a.nivel, a.ico) + '<div><small>' + UI.nuevo[L] + '</small><b class="lg-t1"></b><span class="lg-t2"></span></div>';
  el.querySelector(".lg-t1").textContent = a.titulo; el.querySelector(".lg-t2").textContent = a.texto;
  document.body.appendChild(el); sonido(api);
  requestAnimationFrame(() => el.classList.add("on"));
  setTimeout(() => { el.classList.remove("on"); setTimeout(() => { el.remove(); mostrando = false; siguienteAviso(api, L); }, 400); }, 3600);
  el.addEventListener("click", () => { el.classList.remove("on"); setTimeout(() => { el.remove(); mostrando = false; siguienteAviso(api, L); }, 300); });
}
/* Texto del banner de la portada (cuenta de medallas y rango) */
function pintaBanner(est, L) {
  const r = resumen(est);
  Array.prototype.forEach.call(document.querySelectorAll("[data-lg-cnt]"), (el) => { const n = el.querySelector("[data-lg-n]"), g = el.querySelector("[data-lg-r]"); if (n) n.textContent = r.pts + "/" + r.max; if (g) g.textContent = UI.rangos[r.rango][L]; el.classList.add("on"); });
}
/* Revisa el perfil: avisa de los logros nuevos (la primera vez solo anota lo que ya tenías). */
export function comprobar(api) {
  if (api.admin && api.admin()) return { nuevos: 0 };
  const loc = String((api && api.locale) || "es").slice(0, 2).toLowerCase(), L = Math.max(0, LANGS.indexOf(loc));
  const P = api.perfil(), NV = api.nv(); if (!NV.lg) NV.lg = { v: {} }; const lg = NV.lg; if (!lg.v) lg.v = {};
  const est = calcular(P, NV), primera = !lg.init; let nuevos = 0, cambios = false;
  pintaBanner(est, L);
  est.forEach((e) => {
    const visto = lg.v[e.id] || 0; if (e.nivel <= visto) return;
    cambios = true; lg.v[e.id] = e.nivel;
    if (!primera) { const l = LOGROS.find((x) => x.id === e.id); nuevos++; cola.push({ nivel: e.nivel, ico: l.ico, titulo: l.t[L], texto: UI[nombreTier[e.nivel]][L] + " · " + l.d[L].replace("{n}", l.tiers[e.nivel - 1].toLocaleString(api.locale || "es")) }); }
  });
  if (primera) { lg.init = 1; cambios = true; const r = resumen(est); if (r.pts > 0) cola.push({ nivel: Math.min(3, Math.max(1, Math.ceil(r.frac * 3))), ico: "🏅", titulo: UI.inicial[L] + " " + r.pts + " " + UI.medallas[L], texto: UI.titulo[L] }); }
  if (cambios && api.guardar) api.guardar();
  siguienteAviso(api, L);
  return { nuevos, primera, cola: cola.length };
}
