/* MAPAS · minijuegos con el mapa propio (27-nov-2026)
   Cuatro juegos que reutilizan el motor de «Clava el sitio» (mapas_motor.js, datos de Natural Earth en mapas/), los lugares de
   mapas_lugares.js y los jugadores de cuartetos_datos.js:
     zoom    «ZOOM OUT»          el mapa se aleja poco a poco desde una ciudad; hay que reconocerla (4 opciones).
     brujula «BRÚJULA DEL FÚTBOL» hacia dónde queda un sitio desde otro (8 rumbos) o cuál está más cerca (3 opciones).
     ruta    «RUTA DEL CRACK»    pines con las ciudades de 13 grandes clubes: ¿qué jugador pasó exactamente por ellos?
     paises  «ENCUENTRA EL PAÍS» mapa mudo: tocar el país pedido o adivinar cuál está resaltado (contornos en mapas/paises_geo.bin).
   Todos: 5 rondas de hasta 1.000 puntos, reto diario (semilla = fecha local, un intento al día, compartible) y partida libre.
   Un solo módulo ES para los cuatro (infraestructura común); cada juego se abre con abrir(api, raiz, clave). Sonidos sintetizados
   (respetan api.sonido()); sin escudos, fotos ni logos; textos en los 6 idiomas aquí dentro. */
import { crearMapa, distanciaKm, proyecta, invierte } from "./mapas_motor.js";
import { LUGARES } from "./mapas_lugares.js";

const LANGS = ["es", "en", "pt", "fr", "it", "de"];
const RONDAS = 5, FECHA0 = Date.UTC(2026, 10, 27);
export const CLAVES = ["zoom", "brujula", "ruta", "paises"];
const OFFSET = { zoom: 11, brujula: 23, ruta: 37, paises: 53 };
const ITEMS = LUGARES.map((r) => ({ tipo: r[0], id: r[1], nom: r[2], sub: r[3], lat: r[4], lon: r[5], idx: r[6], ciu: r[7], iso: r[8], dif: r[9], ex: r[10] }));

/* ───── textos: [es, en, pt, fr, it, de] ───── */
const X = {
  carga: ["Cargando el mapa…", "Loading the map…", "A carregar o mapa…", "Chargement de la carte…", "Caricamento della mappa…", "Karte wird geladen…"],
  err: ["No se pudo cargar el mapa", "The map could not be loaded", "Não foi possível carregar o mapa", "Impossible de charger la carte", "Impossibile caricare la mappa", "Die Karte konnte nicht geladen werden"],
  reint: ["Reintentar", "Retry", "Tentar de novo", "Réessayer", "Riprova", "Erneut versuchen"],
  cerrar: ["Cerrar", "Close", "Fechar", "Fermer", "Chiudi", "Schließen"],
  salir: ["Salir", "Exit", "Sair", "Quitter", "Esci", "Beenden"],
  menu: ["Menú", "Menu", "Menu", "Menu", "Menu", "Menü"],
  kick: ["Minijuego de mapas", "Map minigame", "Minijogo de mapas", "Mini-jeu de cartes", "Minigioco di mappe", "Karten-Minispiel"],
  diario: ["Reto de hoy", "Today's challenge", "Desafio de hoje", "Défi du jour", "Sfida di oggi", "Heutige Herausforderung"],
  diarioVer: ["Ver resultado de hoy", "See today's result", "Ver o resultado de hoje", "Voir le résultat du jour", "Vedi il risultato di oggi", "Heutiges Ergebnis ansehen"],
  libre: ["Partida libre", "Free game", "Partida livre", "Partie libre", "Partita libera", "Freies Spiel"],
  ronda: ["Ronda {n}/{t}", "Round {n}/{t}", "Ronda {n}/{t}", "Manche {n}/{t}", "Round {n}/{t}", "Runde {n}/{t}"],
  sig: ["Siguiente", "Next", "Seguinte", "Suivant", "Avanti", "Weiter"],
  ver: ["Ver resultado", "See result", "Ver resultado", "Voir le résultat", "Vedi il risultato", "Ergebnis ansehen"],
  mas: ["Acercar", "Zoom in", "Aproximar", "Zoomer", "Ingrandisci", "Hineinzoomen"],
  menos: ["Alejar", "Zoom out", "Afastar", "Dézoomer", "Riduci", "Herauszoomen"],
  pts: ["pts", "pts", "pts", "pts", "pt", "Pkt."],
  de: ["de {n}", "of {n}", "de {n}", "sur {n}", "su {n}", "von {n}"],
  comp: ["Compartir resultado", "Share result", "Partilhar resultado", "Partager le résultat", "Condividi il risultato", "Ergebnis teilen"],
  copiado: ["¡Copiado!", "Copied!", "Copiado!", "Copié !", "Copiato!", "Kopiert!"],
  otra: ["Otra partida", "Play again", "Outra partida", "Rejouer", "Gioca ancora", "Nochmal spielen"],
  tiki: ["+1 tikitexto", "+1 tikitexto", "+1 tikitexto", "+1 tikitexto", "+1 tikitexto", "+1 Tikitexto"],
  stats: ["Mejor: {b} · Partidas: {p}", "Best: {b} · Games: {p}", "Melhor: {b} · Partidas: {p}", "Record : {b} · Parties : {p}", "Record: {b} · Partite: {p}", "Bestwert: {b} · Spiele: {p}"],
  nota: ["Mapa: Natural Earth (dominio público)", "Map: Natural Earth (public domain)", "Mapa: Natural Earth (domínio público)", "Carte : Natural Earth (domaine public)", "Mappa: Natural Earth (pubblico dominio)", "Karte: Natural Earth (gemeinfrei)"],
  pista: ["Pista", "Hint", "Dica", "Indice", "Indizio", "Tipp"],
  pistaB: ["Pista · −40 %", "Hint · −40 %", "Dica · −40 %", "Indice · −40 %", "Indizio · −40 %", "Tipp · −40 %"],
  confirma: ["Confirmar", "Confirm", "Confirmar", "Valider", "Conferma", "Bestätigen"],
  tu: ["Tú", "You", "Tu", "Toi", "Tu", "Du"],
  elegiste: ["Elegiste {x}", "You chose {x}", "Escolheste {x}", "Tu as choisi {x}", "Hai scelto {x}", "Du hast {x} gewählt"],
  era: ["Era {x}", "It was {x}", "Era {x}", "C'était {x}", "Era {x}", "Es war {x}"],
  resp: ["Respuesta: {x}", "Answer: {x}", "Resposta: {x}", "Réponse : {x}", "Risposta: {x}", "Antwort: {x}"],
  w5: ["¡Perfecto!", "Perfect!", "Perfeito!", "Parfait !", "Perfetto!", "Perfekt!"],
  w4: ["¡Muy bien!", "Very good!", "Muito bem!", "Très bien !", "Molto bene!", "Sehr gut!"],
  w3: ["Bien", "Good", "Bem", "Bien", "Bene", "Gut"],
  w2: ["Por los pelos", "Close call", "Por pouco", "De justesse", "Per un pelo", "Knapp"],
  w1: ["Fallaste", "Missed", "Falhaste", "Raté", "Sbagliato", "Daneben"],
  w0: ["¡Se acabó el tiempo!", "Time's up!", "Acabou o tempo!", "Temps écoulé !", "Tempo scaduto!", "Die Zeit ist um!"],
  r5: ["Maestro del mapa", "Map master", "Mestre do mapa", "Maître de la carte", "Maestro della mappa", "Kartenmeister"],
  r4: ["Navegante", "Navigator", "Navegador", "Navigateur", "Navigatore", "Navigator"],
  r3: ["Explorador", "Explorer", "Explorador", "Explorateur", "Esploratore", "Entdecker"],
  r2: ["Turista", "Tourist", "Turista", "Touriste", "Turista", "Tourist"],
  r1: ["Perdido en el mapa", "Lost on the map", "Perdido no mapa", "Perdu sur la carte", "Perso sulla mappa", "Auf der Karte verloren"],
};
const TX = {
  zoom: {
    logoA: ["ZOOM", "ZOOM", "ZOOM", "ZOOM", "ZOOM", "ZOOM"], logoB: ["OUT", "OUT", "OUT", "OUT", "OUT", "OUT"],
    sub: ["El mapa se aleja poco a poco desde una ciudad. Cuanto antes la reconozcas, más puntos.", "The map slowly zooms out from a city. The sooner you recognise it, the more points.", "O mapa afasta-se aos poucos a partir de uma cidade. Quanto mais cedo a reconheceres, mais pontos.", "La carte s'éloigne peu à peu d'une ville. Plus tôt tu la reconnais, plus tu marques.", "La mappa si allontana a poco a poco da una città. Prima la riconosci, più punti fai.", "Die Karte zoomt langsam von einer Stadt weg. Je früher du sie erkennst, desto mehr Punkte."],
    c1: ["Empiezas muy cerca de una ciudad: solo ves costas, fronteras y carreteras.", "You start very close to a city: only coasts, borders and roads are visible.", "Começas muito perto de uma cidade: só vês costas, fronteiras e estradas.", "Tu démarres tout près d'une ville : seuls les côtes, les frontières et les routes sont visibles.", "Parti molto vicino a una città: vedi solo coste, confini e strade.", "Du startest ganz nah an einer Stadt: Du siehst nur Küsten, Grenzen und Straßen."],
    c2: ["Cada pocos segundos el mapa se aleja y aparecen más pistas: países, mares…", "Every few seconds the map zooms out and more clues appear: countries, seas…", "A cada poucos segundos o mapa afasta-se e surgem mais pistas: países, mares…", "Toutes les quelques secondes, la carte s'éloigne et de nouveaux indices apparaissent : pays, mers…", "Ogni pochi secondi la mappa si allontana e compaiono più indizi: paesi, mari…", "Alle paar Sekunden zoomt die Karte weiter heraus und es erscheinen mehr Hinweise: Länder, Meere …"],
    c3: ["Elige la ciudad entre cuatro: hasta 1.000 puntos si aciertas al principio; un fallo vale 0.", "Pick the city from four: up to 1,000 points if you get it early; a miss scores 0.", "Escolhe a cidade entre quatro: até 1.000 pontos se acertares cedo; um erro vale 0.", "Choisis la ville parmi quatre : jusqu'à 1 000 points si tu trouves tôt ; une erreur vaut 0.", "Scegli la città tra quattro: fino a 1.000 punti se indovini subito; un errore vale 0.", "Wähle die Stadt aus vier: bis zu 1.000 Punkte, wenn du früh richtig liegst; ein Fehler bringt 0."],
    k: ["Ciudad misteriosa", "Mystery city", "Cidade misteriosa", "Ville mystère", "Città misteriosa", "Rätselstadt"],
    q: ["¿Qué ciudad es?", "Which city is this?", "Que cidade é esta?", "Quelle est cette ville ?", "Che città è?", "Welche Stadt ist das?"],
    g: ["El mapa se aleja solo · elige cuando lo sepas", "The map zooms out by itself · answer when you know", "O mapa afasta-se sozinho · responde quando souberes", "La carte s'éloigne seule · réponds quand tu sais", "La mappa si allontana da sola · rispondi quando lo sai", "Die Karte zoomt allein heraus · antworte, sobald du es weißt"],
    vale: ["Ahora vale {n} pts", "Worth {n} pts now", "Agora vale {n} pts", "Vaut {n} pts maintenant", "Ora vale {n} pt", "Jetzt {n} Pkt."],
    aqui: ["En esta ciudad: {x}", "In this city: {x}", "Nesta cidade: {x}", "Dans cette ville : {x}", "In questa città: {x}", "In dieser Stadt: {x}"],
  },
  brujula: {
    logoA: ["BRÚJULA", "COMPASS", "BÚSSOLA", "BOUSSOLE", "BUSSOLA", "KOMPASS"], logoB: ["DEL FÚTBOL", "OF FOOTBALL", "DO FUTEBOL", "DU FOOT", "DEL CALCIO", "DES FUSSBALLS"],
    sub: ["Estadios y clubes de medio mundo, una brújula y tu sentido de la orientación.", "Stadiums and clubs from around the world, a compass and your sense of direction.", "Estádios e clubes de meio mundo, uma bússola e o teu sentido de orientação.", "Des stades et des clubs du monde entier, une boussole et ton sens de l'orientation.", "Stadi e club di mezzo mondo, una bussola e il tuo senso dell'orientamento.", "Stadien und Vereine aus aller Welt, ein Kompass und dein Orientierungssinn."],
    c1: ["Unas veces te pedimos el rumbo entre dos sitios y otras cuál queda más cerca.", "Sometimes we ask for the direction between two places, sometimes which one is closer.", "Umas vezes pedimos o rumo entre dois locais, outras qual fica mais perto.", "Parfois on te demande la direction entre deux lieux, parfois lequel est le plus proche.", "A volte ti chiediamo la direzione tra due luoghi, altre quale è più vicino.", "Mal fragen wir nach der Richtung zwischen zwei Orten, mal nach dem näheren."],
    c2: ["Puedes mover el mapa y hacer zoom para orientarte antes de contestar.", "You can pan and zoom the map to get your bearings before answering.", "Podes mover e dar zoom no mapa para te orientares antes de responder.", "Tu peux déplacer et zoomer la carte pour t'orienter avant de répondre.", "Puoi spostare e ingrandire la mappa per orientarti prima di rispondere.", "Du kannst die Karte verschieben und zoomen, um dich zu orientieren."],
    c3: ["Acierto = hasta 1.000 puntos según la rapidez; en los rumbos, una dirección vecina da 200.", "A correct answer = up to 1,000 points depending on speed; for directions, a neighbouring direction gives 200.", "Acerto = até 1.000 pontos conforme a rapidez; nos rumos, uma direção vizinha dá 200.", "Bonne réponse = jusqu'à 1 000 points selon la rapidité ; pour les directions, une direction voisine donne 200.", "Risposta giusta = fino a 1.000 punti in base alla rapidità; per le direzioni, una direzione adiacente vale 200.", "Richtig = bis zu 1.000 Punkte je nach Tempo; bei Richtungen gibt eine Nachbarrichtung 200."],
    kR: ["Rumbo", "Heading", "Rumo", "Cap", "Rotta", "Richtung"],
    kC: ["Más cerca", "Closest", "Mais perto", "Plus proche", "Più vicino", "Am nächsten"],
    qR: ["Desde {a}, ¿hacia dónde queda {b}?", "From {a}, which way is {b}?", "A partir de {a}, para que lado fica {b}?", "Depuis {a}, dans quelle direction se trouve {b} ?", "Da {a}, in che direzione si trova {b}?", "Von {a} aus: In welcher Richtung liegt {b}?"],
    qC: ["¿Cuál está más cerca de {o}?", "Which is closest to {o}?", "Qual fica mais perto de {o}?", "Lequel est le plus proche de {o} ?", "Qual è il più vicino a {o}?", "Welcher liegt am nächsten an {o}?"],
    gR: ["Elige el rumbo (en línea recta sobre el mapa)", "Pick the heading (straight line on the map)", "Escolhe o rumo (em linha reta no mapa)", "Choisis le cap (en ligne droite sur la carte)", "Scegli la rotta (in linea retta sulla mappa)", "Wähle die Richtung (Luftlinie auf der Karte)"],
    gC: ["Elige el lugar que crees más cercano", "Pick the place you think is closest", "Escolhe o local que achas mais perto", "Choisis le lieu que tu crois le plus proche", "Scegli il luogo che ritieni più vicino", "Wähle den Ort, der dir am nächsten scheint"],
    real: ["Rumbo real: {d}", "Actual heading: {d}", "Rumo real: {d}", "Cap réel : {d}", "Rotta reale: {d}", "Tatsächliche Richtung: {d}"],
    hasta: ["{n} km hasta {x}", "{n} km to {x}", "{n} km até {x}", "{n} km jusqu'à {x}", "{n} km fino a {x}", "{n} km bis {x}"],
    vecino: ["Dirección vecina · 200 pts", "Neighbouring direction · 200 pts", "Direção vizinha · 200 pts", "Direction voisine · 200 pts", "Direzione adiacente · 200 pt", "Nachbarrichtung · 200 Pkt."],
  },
  ruta: {
    logoA: ["RUTA", "ROUTE", "ROTA", "ROUTE", "ROTTA", "ROUTE"], logoB: ["DEL CRACK", "OF THE STAR", "DO CRAQUE", "DU CRACK", "DEL CAMPIONE", "DES STARS"],
    sub: ["Unos pines en el mapa y cuatro nombres: ¿quién jugó en los clubes de esas ciudades?", "A few pins on the map and four names: who played for the clubs in those cities?", "Uns alfinetes no mapa e quatro nomes: quem jogou nos clubes dessas cidades?", "Quelques punaises sur la carte et quatre noms : qui a joué dans les clubs de ces villes ?", "Alcune puntine sulla mappa e quattro nomi: chi ha giocato nei club di quelle città?", "Ein paar Stecknadeln auf der Karte und vier Namen: Wer spielte bei den Klubs dieser Städte?"],
    c1: ["Cada pin marca la ciudad de un gran club europeo en el que jugó una leyenda.", "Each pin marks the city of a big European club that a legend played for.", "Cada alfinete marca a cidade de um grande clube europeu em que jogou uma lenda.", "Chaque punaise marque la ville d'un grand club européen où a joué une légende.", "Ogni puntina segna la città di un grande club europeo in cui ha giocato una leggenda.", "Jede Nadel markiert die Stadt eines großen europäischen Klubs, bei dem eine Legende spielte."],
    c2: ["Solo cuentan 13 clubes: Real Madrid, Barcelona, Atlético, Bayern, Juventus, Milan, Inter, United, Liverpool, Chelsea, Arsenal, City y PSG.", "Only 13 clubs count: Real Madrid, Barcelona, Atlético, Bayern, Juventus, Milan, Inter, United, Liverpool, Chelsea, Arsenal, City and PSG.", "Só contam 13 clubes: Real Madrid, Barcelona, Atlético, Bayern, Juventus, Milan, Inter, United, Liverpool, Chelsea, Arsenal, City e PSG.", "Seuls 13 clubs comptent : Real Madrid, Barcelone, Atlético, Bayern, Juventus, Milan, Inter, United, Liverpool, Chelsea, Arsenal, City et PSG.", "Contano solo 13 club: Real Madrid, Barcellona, Atlético, Bayern, Juventus, Milan, Inter, United, Liverpool, Chelsea, Arsenal, City e PSG.", "Es zählen nur 13 Klubs: Real Madrid, Barcelona, Atlético, Bayern, Juventus, Milan, Inter, United, Liverpool, Chelsea, Arsenal, City und PSG."],
    c3: ["Elige el jugador entre cuatro: hasta 1.000 puntos según la rapidez. La pista (selección y posición) resta un 40 %.", "Pick the player from four: up to 1,000 points depending on speed. The hint (national team and position) costs 40 %.", "Escolhe o jogador entre quatro: até 1.000 pontos conforme a rapidez. A dica (seleção e posição) tira 40 %.", "Choisis le joueur parmi quatre : jusqu'à 1 000 points selon la rapidité. L'indice (sélection et poste) coûte 40 %.", "Scegli il giocatore tra quattro: fino a 1.000 punti in base alla rapidità. L'indizio (nazionale e ruolo) costa il 40 %.", "Wähle den Spieler aus vier: bis zu 1.000 Punkte je nach Tempo. Der Tipp (Nationalmannschaft und Position) kostet 40 %."],
    k: ["Ruta de un crack", "A star's route", "Rota de um craque", "Parcours d'un crack", "Percorso di un campione", "Route eines Stars"],
    q: ["¿Quién jugó en los clubes de estas ciudades?", "Who played for the clubs in these cities?", "Quem jogou nos clubes destas cidades?", "Qui a joué dans les clubs de ces villes ?", "Chi ha giocato nei club di queste città?", "Wer spielte bei den Klubs dieser Städte?"],
    qs: ["13 grandes clubes. Si una ciudad tiene dos, vale cualquiera.", "13 big clubs. If a city has two, either counts.", "13 grandes clubes. Se uma cidade tem dois, vale qualquer um.", "13 grands clubs. Si une ville en a deux, les deux comptent.", "13 grandi club. Se una città ne ha due, vale uno qualsiasi.", "13 große Klubs. Hat eine Stadt zwei, zählt jeder."],
    g: ["Elige al jugador que encaja con esta ruta", "Pick the player who fits this route", "Escolhe o jogador que encaixa nesta rota", "Choisis le joueur qui correspond à ce parcours", "Scegli il giocatore che corrisponde a questo percorso", "Wähle den Spieler, der zu dieser Route passt"],
    ph: ["Selección: {s} · {p}", "National team: {s} · {p}", "Seleção: {s} · {p}", "Sélection : {s} · {p}", "Nazionale: {s} · {p}", "Nationalteam: {s} · {p}"],
    jugo: ["Jugó en: {x}", "Played for: {x}", "Jogou em: {x}", "A joué à : {x}", "Ha giocato in: {x}", "Spielte bei: {x}"],
    pP: ["Portero", "Goalkeeper", "Guarda-redes", "Gardien", "Portiere", "Torwart"],
    pD: ["Defensa", "Defender", "Defesa", "Défenseur", "Difensore", "Verteidiger"],
    pM: ["Centrocampista", "Midfielder", "Médio", "Milieu", "Centrocampista", "Mittelfeldspieler"],
    pF: ["Delantero", "Forward", "Avançado", "Attaquant", "Attaccante", "Stürmer"],
  },
  paises: {
    logoA: ["ENCUENTRA", "FIND", "ACHA", "TROUVE", "TROVA", "FINDE"], logoB: ["EL PAÍS", "THE COUNTRY", "O PAÍS", "LE PAYS", "IL PAESE", "DAS LAND"],
    sub: ["Un mapa mudo del mundo: toca el país que te pedimos o adivina cuál está resaltado.", "A blank world map: tap the country we ask for or guess which one is highlighted.", "Um mapa mudo do mundo: toca no país pedido ou adivinha qual está destacado.", "Une carte muette du monde : touche le pays demandé ou devine lequel est en surbrillance.", "Una mappa muta del mondo: tocca il paese richiesto o indovina quale è evidenziato.", "Eine stumme Weltkarte: Tippe auf das gesuchte Land oder errate das markierte."],
    c1: ["En unas rondas te pedimos un país y lo tocas en el mapa, sin nombres.", "In some rounds we ask for a country and you tap it on the map, with no names.", "Em algumas rondas pedimos um país e tocas nele no mapa, sem nomes.", "À certaines manches, on te demande un pays et tu le touches sur la carte, sans noms.", "In alcuni round ti chiediamo un paese e lo tocchi sulla mappa, senza nomi.", "In manchen Runden suchen wir ein Land, das du auf der Karte ohne Namen antippst."],
    c2: ["En otras se resalta un país y eliges su nombre entre cuatro.", "In others a country is highlighted and you pick its name from four.", "Noutras destaca-se um país e escolhes o nome entre quatro.", "Dans d'autres, un pays est mis en surbrillance et tu choisis son nom parmi quatre.", "In altri un paese è evidenziato e scegli il suo nome tra quattro.", "In anderen wird ein Land markiert und du wählst seinen Namen aus vier."],
    c3: ["Acertar vale hasta 1.000 puntos según la rapidez; si fallas por poco al tocar, ganas 250.", "A correct answer is worth up to 1,000 points depending on speed; if you narrowly miss when tapping you get 250.", "Acertar vale até 1.000 pontos conforme a rapidez; se falhares por pouco ao tocar, ganhas 250.", "Une bonne réponse vaut jusqu'à 1 000 points selon la rapidité ; si tu rates de peu en touchant, tu gagnes 250.", "Una risposta giusta vale fino a 1.000 punti in base alla rapidità; se sbagli di poco toccando, ottieni 250.", "Richtig gibt bis zu 1.000 Punkte je nach Tempo; wer beim Tippen knapp daneben liegt, bekommt 250."],
    kT: ["Toca en el mapa", "Tap on the map", "Toca no mapa", "Touche sur la carte", "Tocca sulla mappa", "Auf der Karte tippen"],
    kF: ["País resaltado", "Highlighted country", "País destacado", "Pays en surbrillance", "Paese evidenziato", "Markiertes Land"],
    qT: ["Toca el país: {x}", "Tap the country: {x}", "Toca no país: {x}", "Touche le pays : {x}", "Tocca il paese: {x}", "Tippe auf das Land: {x}"],
    qF: ["¿Qué país está resaltado?", "Which country is highlighted?", "Que país está destacado?", "Quel pays est en surbrillance ?", "Quale paese è evidenziato?", "Welches Land ist markiert?"],
    gT: ["Mueve el mapa, toca el país y confirma", "Pan the map, tap the country and confirm", "Move o mapa, toca no país e confirma", "Déplace la carte, touche le pays et valide", "Sposta la mappa, tocca il paese e conferma", "Verschiebe die Karte, tippe auf das Land und bestätige"],
    gT2: ["Toca otro punto para cambiarlo", "Tap another spot to change it", "Toca noutro ponto para mudar", "Touche un autre endroit pour changer", "Tocca un altro punto per cambiare", "Tippe auf eine andere Stelle, um zu wechseln"],
    gF: ["Elige el nombre del país resaltado", "Pick the name of the highlighted country", "Escolhe o nome do país destacado", "Choisis le nom du pays en surbrillance", "Scegli il nome del paese evidenziato", "Wähle den Namen des markierten Landes"],
    toc: ["Tocaste: {x}", "You tapped: {x}", "Tocaste: {x}", "Tu as touché : {x}", "Hai toccato: {x}", "Du hast getippt: {x}"],
    mar: ["el mar", "the sea", "o mar", "la mer", "il mare", "das Meer"],
    casi: ["¡Casi! A {n} km de la frontera", "Almost! {n} km from the border", "Quase! A {n} km da fronteira", "Presque ! À {n} km de la frontière", "Quasi! A {n} km dal confine", "Fast! {n} km von der Grenze entfernt"],
    lista: ["De nuestra lista, aquí: {x}", "From our list, here: {x}", "Da nossa lista, aqui: {x}", "De notre liste, ici : {x}", "Dalla nostra lista, qui: {x}", "Aus unserer Liste hier: {x}"],
  },
};
/* Rumbos: [N, NE, E, SE, S, SW, W, NW] en cada idioma */
const DIRS = {
  es: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"], en: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"], pt: ["N", "NE", "L", "SE", "S", "SO", "O", "NO"],
  fr: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"], it: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"], de: ["N", "NO", "O", "SO", "S", "SW", "W", "NW"],
};
const FLECHAS = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];

/* ───── utilidades ───── */
export function mulberry(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const barajar = (a, rng) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
const hoyTxt = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const numDia = () => { const d = new Date(); return Math.max(1, Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - FECHA0) / 864e5) + 1); };
const semillaDia = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
export const nivelPts = (p) => (p >= 900 ? 5 : p >= 600 ? 4 : p >= 350 ? 3 : p > 0 ? 2 : 1);
const CUAD = (p) => (p >= 900 ? "🟩" : p >= 600 ? "🟨" : p > 0 ? "🟧" : "🟥");
const COLOR = (p) => (p >= 900 ? "#34e089" : p >= 600 ? "#ffd24a" : p > 0 ? "#ff9f1c" : "#ff5b45");
const rangoDe = (media) => (media >= 800 ? 5 : media >= 600 ? 4 : media >= 400 ? 3 : media >= 200 ? 2 : 1);

/* Puntos de un acierto con reloj: base + (techo − base) · fracción de tiempo restante */
export function puntosReloj(base, frac, pista) { return Math.round((base + (1000 - base) * Math.max(0, Math.min(1, frac))) * (pista ? 0.6 : 1)); }

/* ───── geometría ───── */
export function rumbos(a, b) {
  const r = Math.PI / 180, f1 = a.lat * r, f2 = b.lat * r;
  let dl = (b.lon - a.lon) * r;
  const y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  const gc = (Math.atan2(y, x) / r + 360) % 360;
  if (dl > Math.PI) dl -= 2 * Math.PI; if (dl < -Math.PI) dl += 2 * Math.PI;
  const dpsi = Math.log(Math.tan(Math.PI / 4 + f2 / 2) / Math.tan(Math.PI / 4 + f1 / 2));
  const rh = (Math.atan2(dl, dpsi) / r + 360) % 360;
  return { gc: gc, rh: rh };
}
export const sectorDe = (deg) => Math.floor(((deg + 22.5) % 360) / 45);
export const margenSector = (deg) => { const m = (deg + 22.5) % 45; return Math.min(m, 45 - m); };

/* ───── contornos de países (mapas/paises_geo.bin) ───── */
const GEO_G = 65536; // unidades de la rejilla del archivo (2^18 / 2^2)
export async function cargaGeo(base) {
  const r = await fetch((base || "mapas/") + "paises_geo.bin");
  if (!r.ok) throw new Error("paises_geo " + r.status);
  const d = new Uint8Array(await r.arrayBuffer());
  if (d[0] !== 80 || d[1] !== 49) throw new Error("paises_geo: formato no válido");
  let p = 3;
  const uv = () => { let n = 0, m = 1, b; do { b = d[p++]; n += (b & 127) * m; m *= 128; } while (b >= 128); return n; };
  const zz = (a) => (a & 1 ? -(a + 1) / 2 : a / 2);
  const n = uv(), mapa = new Map();
  for (let i = 0; i < n; i++) {
    const iso = String.fromCharCode(d[p], d[p + 1]); p += 2;
    const na = uv(), anillos = [], path = new Path2D();
    let X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9;
    for (let j = 0; j < na; j++) {
      const np = uv(), pts = new Float64Array(np * 2);
      let x = zz(uv()), y = zz(uv());
      pts[0] = x; pts[1] = y;
      for (let k = 1; k < np; k++) { x += zz(uv()); y += zz(uv()); pts[2 * k] = x; pts[2 * k + 1] = y; }
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (let k = 0; k < np; k++) { const px = pts[2 * k], py = pts[2 * k + 1]; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
      anillos.push({ pts: pts, n: np, x0: x0, x1: x1, y0: y0, y1: y1, area: (x1 - x0) * (y1 - y0) });
      path.moveTo(pts[0], pts[1]);
      for (let k = 1; k < np; k++) path.lineTo(pts[2 * k], pts[2 * k + 1]);
      path.closePath();
      X0 = Math.min(X0, x0); X1 = Math.max(X1, x1); Y0 = Math.min(Y0, y0); Y1 = Math.max(Y1, y1);
    }
    const mayor = anillos.reduce((a, b) => (b.area > a.area ? b : a), anillos[0]);
    mapa.set(iso, { iso: iso, anillos: anillos, path: path, x0: X0, x1: X1, y0: Y0, y1: Y1, mayor: mayor });
  }
  return mapa;
}
function dentroAnillo(pts, n, x, y) {
  let dentro = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = pts[2 * i], yi = pts[2 * i + 1], xj = pts[2 * j], yj = pts[2 * j + 1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
export function paisEn(geo, lon, lat) {
  const q = proyecta(lon, lat), x = q.x * GEO_G, y = q.y * GEO_G;
  for (const c of geo.values()) {
    if (x < c.x0 || x > c.x1 || y < c.y0 || y > c.y1) continue;
    let dentro = false;
    for (const a of c.anillos) if (!(x < a.x0 || x > a.x1 || y < a.y0 || y > a.y1) && dentroAnillo(a.pts, a.n, x, y)) dentro = !dentro;
    if (dentro) return c.iso;
  }
  return null;
}
/* distancia en km de un punto al contorno más cercano del país (0 si está dentro) */
export function distanciaPais(geo, iso, lon, lat) {
  const c = geo.get(iso); if (!c) return Infinity;
  if (paisEn(geo, lon, lat) === iso) return 0;
  const q = proyecta(lon, lat), x = q.x * GEO_G, y = q.y * GEO_G;
  let mejor = Infinity;
  for (const a of c.anillos) {
    const p = a.pts;
    for (let i = 0, j = a.n - 1; i < a.n; j = i++) {
      const ax = p[2 * j], ay = p[2 * j + 1], bx = p[2 * i], by = p[2 * i + 1], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      let t = l2 ? ((x - ax) * dx + (y - ay) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = x - (ax + t * dx), ey = y - (ay + t * dy), d2 = ex * ex + ey * ey;
      if (d2 < mejor) mejor = d2;
    }
  }
  return Math.sqrt(mejor) * (40075.017 / GEO_G) * Math.cos((lat * Math.PI) / 180);
}
const lonLatDe = (gx, gy) => invierte(gx / GEO_G, gy / GEO_G);

/* Países del juego «Encuentra el país»: [ISO, región, nivel 0 fácil · 1 medio · 2 difícil] */
export const PAISES_POOL = [
  ["ES", "EU", 0], ["FR", "EU", 0], ["DE", "EU", 0], ["IT", "EU", 0], ["GB", "EU", 0], ["PT", "EU", 0], ["NL", "EU", 1], ["BE", "EU", 1], ["CH", "EU", 1], ["AT", "EU", 1],
  ["PL", "EU", 1], ["CZ", "EU", 1], ["DK", "EU", 1], ["SE", "EU", 1], ["NO", "EU", 1], ["FI", "EU", 2], ["IE", "EU", 1], ["GR", "EU", 1], ["TR", "EU", 1], ["HR", "EU", 1],
  ["RS", "EU", 2], ["UA", "EU", 1], ["RU", "EU", 0], ["RO", "EU", 2], ["HU", "EU", 2], ["BG", "EU", 2], ["SK", "EU", 2], ["SI", "EU", 2], ["BA", "EU", 2], ["IS", "EU", 2], ["AL", "EU", 2],
  ["MA", "AF", 1], ["DZ", "AF", 1], ["TN", "AF", 2], ["EG", "AF", 1], ["SN", "AF", 2], ["CI", "AF", 2], ["GH", "AF", 2], ["NG", "AF", 1], ["CM", "AF", 2], ["ZA", "AF", 1], ["ML", "AF", 2], ["CD", "AF", 2], ["AO", "AF", 2], ["KE", "AF", 2],
  ["BR", "AM", 0], ["AR", "AM", 0], ["UY", "AM", 1], ["CL", "AM", 1], ["CO", "AM", 1], ["PE", "AM", 1], ["EC", "AM", 2], ["PY", "AM", 2], ["BO", "AM", 2], ["VE", "AM", 2], ["MX", "AM", 0], ["US", "AM", 0], ["CA", "AM", 1], ["CR", "AM", 2], ["PA", "AM", 2], ["JM", "AM", 2], ["HN", "AM", 2],
  ["JP", "AS", 1], ["KR", "AS", 1], ["CN", "AS", 0], ["SA", "AS", 1], ["IR", "AS", 1], ["IQ", "AS", 2], ["AU", "OC", 0], ["NZ", "OC", 1], ["QA", "AS", 2], ["AE", "AS", 2], ["IN", "AS", 0], ["UZ", "AS", 2],
];

/* ───── ruta del crack: ciudad de cada club (índices de ciudades.json que ya usa mapas_lugares) ───── */
export const CIUDAD_CLUB = { RM: 45, ATM: 45, FCB: 53, BAY: 381, JUV: 265, MIL: 123, INT: 123, MUN: 185, MCI: 185, LIV: 661, CHE: 25, ARS: 25, PSG: 19 };

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
    <div class="mj-tiempo" data-tiempo hidden aria-hidden="true"><i data-tbar></i></div>
  </div>
</div>
<div class="mp-lado" data-lado hidden>
  <button type="button" class="mp-btn" data-mp="mas" data-ro="mas">＋</button>
  <button type="button" class="mp-btn" data-mp="menos" data-ro="menos">－</button>
</div>
<div class="mp-pie" data-pie hidden>
  <div class="mp-pie__caja">
    <div class="mp-juego" data-juego>
      <p class="mp-guia" data-guia></p>
      <div class="mj-resp" data-resp></div>
      <div class="mj-acc" data-acc hidden>
        <button type="button" class="mp-sec mj-pista" data-mp="pista" data-pista hidden></button>
        <button type="button" class="mp-cta" data-mp="confirmar" data-confirmar hidden disabled><span aria-hidden="true">📍</span><b data-confirmar-t></b></button>
      </div>
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
    <h1 class="mp-logo"><span data-logo-a></span><span data-logo-b></span></h1>
    <p class="mp-menu__sub" data-m-sub></p>
    <ol class="mp-como"><li><b>1</b><span data-m-c1></span></li><li><b>2</b><span data-m-c2></span></li><li><b>3</b><span data-m-c3></span></li></ol>
    <button type="button" class="mp-cta mp-cta--diario" data-mp="diario"><span aria-hidden="true">📅</span><b data-m-diario></b><small data-m-num></small></button>
    <button type="button" class="mp-cta mp-cta--libre" data-mp="libre"><span aria-hidden="true">🌍</span><b data-m-lib-b></b></button>
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

export function abrir(api, raiz, clave) {
  clave = CLAVES.indexOf(clave) >= 0 ? clave : "zoom";
  const loc = String((api && api.locale) || "es").slice(0, 2).toLowerCase(), L = Math.max(0, LANGS.indexOf(loc)), idioma = LANGS[L];
  const T = TX[clave];
  const tr = (k, o) => { let s = (T[k] || X[k])[L]; if (o) Object.keys(o).forEach((q) => { s = s.split("{" + q + "}").join(o[q]); }); return s; };
  const num = (n) => Math.round(n).toLocaleString(api.locale || "es");
  const tn = (s) => { try { return api.t ? api.t(s) : s; } catch (e) { return s; } };
  raiz.setAttribute("data-no-t", ""); raiz.setAttribute("lang", idioma); raiz.setAttribute("data-juego-mapas", clave);
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  const datos = () => { const d = api.datos(); ["part", "mejor", "tot", "perf", "buenas", "tiki"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const S = { fase: "carga", modo: "libre", rondas: [], i: 0, res: [], total: 0, num: 1, listo: false, T: 0, t0: 0, pista: false, sel: null };
  let vivo = true, M = null, ctx = null, G = null, cargado = false, rafT = 0, tTour = 0, geo = null;
  const op = { base: "mapas/", idioma: idioma, tema: temaSitio(), escalaBajo: 0, alTocar: (p) => { if (G && G.alTocar && S.fase === "juego") G.alTocar(p); }, alError: () => { if (vivo) { $("[data-error]").hidden = false; $("[data-carga]").hidden = true; } } };

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
  const sonPulsa = () => blip(420, 0.08, 0.06, "triangle", 300);
  const sonTic = () => blip(880, 0.05, 0.04, "square");
  const sonNivel = (n) => { const b = [0, 196, 330, 392, 523, 784][n] || 262; blip(b, 0.18, 0.07, "triangle"); if (n >= 3) blip(b * 1.5, 0.22, 0.06, "triangle", 0, 0.1); if (n >= 5) blip(b * 2, 0.3, 0.06, "triangle", 0, 0.2); };
  const sonFin = () => { [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.16, 0.07, "square", 0, i * 0.1)); };

  function anima(el, a, b, ms, fmt) {
    const t0 = performance.now(); el.textContent = fmt(a);
    cancelAnimationFrame(el._raf || 0);
    (function paso(t) { if (!vivo) return; const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(a + (b - a) * e); if (k < 1) el._raf = requestAnimationFrame(paso); })(t0);
  }

  /* ───── reloj de la ronda ───── */
  function frac() { return S.T ? Math.max(0, 1 - (performance.now() - S.t0) / (S.T * 1000)) : 0; }
  function paraReloj() { cancelAnimationFrame(rafT); S.T = 0; $("[data-tiempo]").hidden = true; }
  function reloj(seg) {
    cancelAnimationFrame(rafT); S.T = seg; S.t0 = performance.now();
    const caja = $("[data-tiempo]"), barra = $("[data-tbar]"); caja.hidden = false;
    (function paso() {
      if (!vivo || S.fase !== "juego" || !S.T) return;
      const f = frac(); barra.style.transform = "scaleX(" + f.toFixed(3) + ")"; caja.classList.toggle("pocos", f < 0.28);
      if (f <= 0) { S.T = 0; if (G && G.agota) G.agota(); return; }
      rafT = requestAnimationFrame(paso);
    })();
  }
  /* Espera a que las teselas visibles estén cargadas (máx. ms) para que la ronda empiece con el mapa nítido */
  function esperaTeselas(ms) {
    return new Promise((ok) => {
      const t0 = performance.now();
      (function paso() { if (!vivo || !M) { ok(); return; } const st = M.estadoTeselas(); if (!st.some((e) => /:carga$/.test(e)) || performance.now() - t0 > ms) { ok(); return; } setTimeout(paso, 60); })();
    });
  }

  /* ───── interfaz de la ronda ───── */
  function medidas() {
    const top = $("[data-top]"), pie = $("[data-pie]");
    return { t: (top.hidden ? 0 : top.getBoundingClientRect().bottom) + 14, b: (pie.hidden ? 0 : raiz.getBoundingClientRect().bottom - pie.querySelector(".mp-pie__caja").getBoundingClientRect().top) + 18 };
  }
  function ajustaEscala() { if (!M) return; op.escalaBajo = (S.fase === "juego" || S.fase === "reveal") ? Math.max(0, Math.round(medidas().b - 8)) : 0; M.redibuja(); }
  function pintaProg() {
    let h = ""; for (let k = 0; k < RONDAS; k++) { const r = S.res[k]; h += '<i class="' + (r ? "n" + r.n : k === S.i ? "on" : "") + '"></i>'; }
    $("[data-prog]").innerHTML = h;
  }
  function opciones(lista, cols) {
    const c = $("[data-resp]"); c.innerHTML = ""; c.className = "mj-resp mj-resp--op" + (cols ? " mj-resp--" + cols : "");
    lista.forEach((o, k) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "mj-op"; b.dataset.v = String(o.v); b.dataset.k = String(k);
      const n = document.createElement("b"); n.textContent = String(k + 1); n.setAttribute("aria-hidden", "true");
      const t = document.createElement("span"); t.textContent = o.t;
      b.appendChild(n); b.appendChild(t); c.appendChild(b);
    });
  }
  function brujulaUI() {
    const c = $("[data-resp]"); c.innerHTML = ""; c.className = "mj-resp mj-resp--dir";
    DIRS[idioma].forEach((d, k) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "mj-op mj-dir"; b.dataset.v = String(k); b.dataset.k = String(k);
      b.setAttribute("aria-label", d);
      const a = document.createElement("i"); a.textContent = "↑"; a.setAttribute("aria-hidden", "true"); a.style.transform = "rotate(" + k * 45 + "deg)";
      const t = document.createElement("span"); t.textContent = d;
      b.appendChild(a); b.appendChild(t); c.appendChild(b);
    });
  }
  function acciones(o) {
    const pista = $("[data-pista]"), conf = $("[data-confirmar]"), acc = $("[data-acc]");
    pista.hidden = !o.pista; pista.disabled = false; pista.classList.remove("usada"); if (o.pista) pista.textContent = "💡 " + tr("pistaB");
    conf.hidden = !o.confirmar; conf.disabled = true; conf.classList.remove("lista"); $("[data-confirmar-t]").textContent = tr("confirma");
    acc.hidden = !(o.pista || o.confirmar);
  }
  function pregunta(o) {
    $("[data-k-ico]").textContent = o.ico || ""; $("[data-k-txt]").textContent = o.k || ""; $("[data-k-ron]").textContent = tr("ronda", { n: S.i + 1, t: RONDAS });
    $("[data-q]").textContent = o.q; const s = $("[data-qs]"); s.textContent = o.s || ""; s.hidden = !o.s;
    $("[data-guia]").textContent = o.g || "";
    pintaProg(); $("[data-pts]").textContent = num(S.total);
  }
  function marcaOpciones(ans, elegida) {
    $$(".mj-op").forEach((b) => { b.disabled = true; if (b.dataset.v === String(ans)) b.classList.add("ok"); else if (elegida != null && b.dataset.v === String(elegida)) b.classList.add("mal"); });
  }

  /* ───── flujo ───── */
  function mostrarPantalla(f) {
    S.fase = f;
    $("[data-menu]").hidden = f !== "menu"; $("[data-fin]").hidden = f !== "fin";
    const juego = f === "juego" || f === "reveal";
    $("[data-top]").hidden = !juego; $("[data-lado]").hidden = !juego; $("[data-pie]").hidden = !juego;
    $("[data-juego]").hidden = f !== "juego"; $("[data-res]").hidden = f !== "reveal";
    clearTimeout(tTour);
    if (f === "menu" && M) { M.setInteractivo(false); M.ponMarcadores([]); M.setCapa(null); M.setHolgura({}); M.setEtiquetas({ paises: true, ciudades: true, mares: true }); tour(); }
    requestAnimationFrame(ajustaEscala);
  }
  function tour() {
    if (!vivo || !M || S.fase !== "menu") return;
    const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    M.volarA(it.lon, it.lat, 3.2 + Math.random() * 2.4, 6500);
    tTour = setTimeout(tour, 9000);
  }
  function pintaMenu() {
    const d = datos(), hecho = d.dia === hoyTxt();
    $("[data-logo-a]").textContent = tr("logoA"); $("[data-logo-b]").textContent = tr("logoB");
    $("[data-m-kicker]").textContent = tr("kick"); $("[data-m-sub]").textContent = tr("sub");
    $("[data-m-c1]").textContent = tr("c1"); $("[data-m-c2]").textContent = tr("c2"); $("[data-m-c3]").textContent = tr("c3");
    $("[data-m-diario]").textContent = tr(hecho ? "diarioVer" : "diario"); $("[data-m-num]").textContent = "#" + numDia();
    $("[data-m-lib-b]").textContent = tr("libre"); $("[data-m-cred]").textContent = tr("nota");
    $("[data-m-stats]").textContent = d.part ? tr("stats", { b: num(d.mejor), p: d.part }) : ""; $("[data-m-stats]").hidden = !d.part;
    $("[data-mp=salir]").textContent = tr("salir");
    $("[data-sig]").textContent = tr("sig");
    $("[data-ro=mas]").setAttribute("aria-label", tr("mas")); $("[data-ro=menos]").setAttribute("aria-label", tr("menos"));
    $("[data-mp=atras]").setAttribute("aria-label", tr("menu"));
  }
  function empezar(modo) {
    if (!cargado || !G) return; audio();
    S.modo = modo === "diario" ? "diario" : "libre";
    const rng = S.modo === "diario" ? mulberry(semillaDia() + OFFSET[clave]) : Math.random;
    S.rondas = G.generar(rng); S.num = numDia(); S.i = 0; S.res = []; S.total = 0;
    mostrarPantalla("juego"); iniciaRonda();
  }
  function iniciaRonda() {
    S.fase = "juego"; S.pista = false; S.sel = null; paraReloj();
    $("[data-juego]").hidden = false; $("[data-res]").hidden = true; $("[data-pie]").hidden = false;
    acciones({}); $("[data-resp]").innerHTML = "";
    if (M) { M.ponMarcadores([]); M.setInteractivo(true); M.setHolgura({}); }
    G.muestra(S.rondas[S.i]);
    requestAnimationFrame(ajustaEscala);
  }
  /* El juego llama a resuelve() con: {pts, ico, nom, peq, big, aprox, lugar, det, marks, puntos, zTope, punto} */
  function resuelve(r) {
    if (S.fase !== "juego") return; audio(); paraReloj(); if (G.parar) G.parar();
    r.agotado = !!(r.agotado || S.ag); S.ag = false;
    r.n = nivelPts(r.pts); S.res.push(r); S.total += r.pts; S.fase = "reveal";
    if (M) { M.setHolgura({}); M.ponMarcadores(r.marks || []); M.setEtiquetas({ paises: true, ciudades: true, mares: true }); }
    $("[data-juego]").hidden = true; $("[data-res]").hidden = false;
    $("[data-r-ver]").textContent = r.ver || tr("w" + (r.agotado ? 0 : r.n)); $("[data-r-ver]").className = "mp-res__v n" + r.n;
    $("[data-r-lugar]").textContent = r.lugar || ""; $("[data-r-det]").textContent = r.det || ""; $("[data-r-det]").hidden = !r.det;
    $("[data-r-aprox]").textContent = r.aprox || "";
    $("[data-r-km]").parentNode.classList.toggle("exacto", r.pts >= 600);
    anima($("[data-r-km]"), 0, 1, 10, () => r.big);
    $("[data-r-pts-s]").textContent = tr("pts") + (r.pista ? " · 💡" : "");
    anima($("[data-r-pts]"), 0, r.pts, 1000, (v) => "+" + num(v));
    $("[data-sig]").textContent = tr(S.i + 1 >= RONDAS ? "ver" : "sig");
    pintaProg(); $("[data-pts]").textContent = num(S.total); setTimeout(() => { if (vivo) sonNivel(r.n); }, 350);
    requestAnimationFrame(() => { ajustaEscala(); if (M && r.puntos && r.puntos.length) { const m = medidas(); M.encuadra(r.puntos, { t: m.t + 26, r: 46, b: m.b, l: 46 }, 1200, r.zTope || 8); } });
  }
  function siguiente() { if (S.fase !== "reveal") return; audio(); if (S.i + 1 >= RONDAS) { terminar(); return; } S.i++; iniciaRonda(); }
  function contesta(v) { if (S.fase !== "juego" || !G) return; audio(); sonPulsa(); G.responde(S.rondas[S.i], v); }

  /* ───── final ───── */
  function guardarDiario(d) { d.dia = hoyTxt(); d.pts = S.total; d.num = S.num; d.grid = S.res.map((r) => CUAD(r.pts)).join(""); d.rd = S.res.map((r) => [r.ico, r.nom, r.peq, r.pts]); }
  function terminar() {
    const d = datos(), media = S.total / RONDAS; let tiki = false;
    d.part++; d.tot += S.total; if (S.total > d.mejor) d.mejor = S.total;
    S.res.forEach((r) => { if (r.pts >= 900) d.perf++; });
    if (S.modo === "diario") { guardarDiario(d); if (media >= 500) tiki = true; if (api.racha) { try { api.racha("mj"); } catch (e) { /* opcional */ } } }
    else if (media >= 600) { d.buenas++; if (d.buenas % 3 === 0) tiki = true; }
    if (tiki) { try { api.tiki(); } catch (e) { /* opcional */ } d.tiki++; }
    try { api.guardar(); } catch (e) { /* opcional */ }
    S.tikis = tiki; mostrarFin(true);
  }
  function mostrarFin(nuevo) {
    mostrarPantalla("fin");
    const media = S.total / RONDAS, r = rangoDe(media);
    $("[data-f-kicker]").textContent = tr("logoA") + " " + tr("logoB") + " · " + (S.modo === "diario" ? tr("diario") + " #" + S.num : tr("libre"));
    $("[data-f-de]").textContent = tr("de", { n: num(RONDAS * 1000) }); $("[data-f-rango]").textContent = tr("r" + r);
    $("[data-f-comp]").textContent = tr("comp"); $("[data-f-comp-b]").hidden = S.modo !== "diario";
    $("[data-f-otra]").textContent = tr("otra"); $("[data-mp=menu]").textContent = tr("menu");
    const t = $("[data-f-tiki]"); t.hidden = !(S.tikis && nuevo); t.textContent = "⚡ " + tr("tiki");
    anima($("[data-f-tot]"), 0, S.total, 1200, (v) => num(v));
    const ol = $("[data-f-lista]"); ol.innerHTML = "";
    S.res.forEach((x) => {
      const li = document.createElement("li"); li.className = "n" + nivelPts(x.pts);
      const a = document.createElement("span"); a.className = "ico"; a.textContent = x.ico;
      const b = document.createElement("span"); b.className = "tx"; const nm = document.createElement("b"); nm.textContent = x.nom; const sm = document.createElement("small"); sm.textContent = x.peq || "";
      b.appendChild(nm); b.appendChild(sm);
      const c = document.createElement("span"); c.className = "pt"; c.textContent = "+" + num(x.pts);
      li.appendChild(a); li.appendChild(b); li.appendChild(c); ol.appendChild(li);
    });
    if (M) {
      M.setInteractivo(true); M.setCapa(null); M.setEtiquetas({ paises: true, ciudades: true, mares: true });
      const pts = S.res.filter((x) => x.punto).map((x) => x.punto);
      M.ponMarcadores(S.res.filter((x) => x.punto).map((x) => ({ lon: x.punto.lon, lat: x.punto.lat, tipo: "balon", color: COLOR(x.pts), etiqueta: "" })));
      const encuadraFin = (ms) => {
        if (!vivo || S.fase !== "fin" || !pts.length) return;
        const R = raiz.getBoundingClientRect(), caja = $(".mp-fin__caja").getBoundingClientRect();
        M.encuadra(pts, R.width >= 760 ? { t: 70, r: 70, b: 70, l: Math.round(caja.right + 40) } : { t: 80, r: 36, b: Math.round(R.bottom - caja.top + 36), l: 36 }, ms, 5.5);
      };
      requestAnimationFrame(() => encuadraFin(1300)); setTimeout(() => encuadraFin(500), 900);
    }
    if (nuevo) { if (media >= 600) { try { api.victoria(); } catch (e) { /* opcional */ } } else sonFin(); }
  }
  function diario() {
    if (!cargado) return; const d = datos();
    if (d.dia === hoyTxt() && d.rd && d.rd.length === RONDAS) {
      S.modo = "diario"; S.res = d.rd.map((x) => ({ ico: x[0], nom: x[1], peq: x[2], pts: x[3], n: nivelPts(x[3]) })); S.total = d.pts || 0; S.num = d.num || numDia(); S.tikis = false; mostrarFin(false); return;
    }
    empezar("diario");
  }
  function compartir() {
    const d = datos(), txt = tr("logoA") + " " + tr("logoB") + " #" + (d.num || S.num) + " · " + num(d.pts || S.total) + " pts\n" + (d.grid || S.res.map((r) => CUAD(r.pts)).join("")) + "\nhttps://tikitexto.com/?modo=" + MODOS_URL[clave];
    const aviso = () => { const e = $("[data-f-comp]"); e.textContent = tr("copiado"); setTimeout(() => { if (vivo) e.textContent = tr("comp"); }, 1800); };
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) { navigator.share({ text: txt }).catch(() => { /* cancelado */ }); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(aviso, () => { /* sin permiso */ });
    else { const a = document.createElement("textarea"); a.value = txt; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); aviso(); } catch (e) { /* opcional */ } a.remove(); }
  }

  /* ───── navegación ───── */
  function irMenu() { paraReloj(); if (G && G.parar) G.parar(); pintaMenu(); mostrarPantalla("menu"); }
  function atras() { if (S.fase === "juego" || S.fase === "reveal" || S.fase === "fin") irMenu(); else cerrar(); }
  function cerrar() {
    if (!vivo) return; vivo = false; paraReloj(); clearTimeout(tTour); obsTema.disconnect(); document.removeEventListener("keydown", onKey);
    try { if (G && G.parar) G.parar(); } catch (e) { /* opcional */ }
    try { if (M) M.destruir(); } catch (e) { /* opcional */ }
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  raiz.addEventListener("click", (e) => {
    audio();
    const o = e.target.closest ? e.target.closest(".mj-op") : null; if (o && !o.disabled) { contesta(o.dataset.v); return; }
    const b = e.target.closest ? e.target.closest("[data-mp]") : null; if (!b) return; const a = b.dataset.mp;
    if (a === "salir") cerrar(); else if (a === "atras") atras(); else if (a === "diario") diario(); else if (a === "libre" || a === "otra") empezar("libre");
    else if (a === "menu") irMenu(); else if (a === "siguiente") siguiente(); else if (a === "pista") { if (G && G.pista) G.pista(); }
    else if (a === "confirmar") { if (G && G.confirma) G.confirma(); }
    else if (a === "mas") { if (M) M.zoomMas(1); } else if (a === "menos") { if (M) M.zoomMas(-1); } else if (a === "compartir") compartir(); else if (a === "reintentar") location.reload();
  });
  function onKey(e) {
    if (e.key === "Escape") { atras(); return; }
    if (e.key === "Enter") { if (S.fase === "reveal") { e.preventDefault(); siguiente(); } else if (S.fase === "juego" && G && G.confirma && S.sel) { e.preventDefault(); G.confirma(); } return; }
    if (S.fase === "juego" && /^[1-8]$/.test(e.key)) { const b = $$(".mj-op")[Number(e.key) - 1]; if (b && !b.disabled) { e.preventDefault(); contesta(b.dataset.v); } }
  }
  document.addEventListener("keydown", onKey);

  /* ───── los cuatro juegos ───── */
  const fw = {
    S: S, tr: tr, tn: tn, num: num, L: L, idioma: idioma, api: api, $: $, $$: $$,
    get M() { return M; }, get geo() { return geo; },
    pregunta: pregunta, opciones: opciones, brujulaUI: brujulaUI, acciones: acciones, reloj: reloj, frac: frac, esperaTeselas: esperaTeselas,
    resuelve: resuelve, marcaOpciones: marcaOpciones, medidas: medidas, sonTic: sonTic, sonPulsa: sonPulsa, audio: audio, vivo: () => vivo,
  };
  G = ({ zoom: creaZoom, brujula: creaBrujula, ruta: creaRuta, paises: creaPaises })[clave](fw);
  fw.setGeo = (g) => { geo = g; };

  /* ───── arranque ───── */
  $("[data-carga-t]").textContent = tr("carga"); $("[data-e-t]").textContent = tr("err"); $("[data-e-r]").textContent = tr("reint"); $("[data-e-s]").textContent = tr("cerrar");
  pintaMenu();
  M = crearMapa($("[data-mapa]"), op);
  M.setInteractivo(false);
  const fuentes = document.fonts && document.fonts.load ? Promise.all(['500 14px TikiMapa', '700 14px TikiMapa', 'italic 500 14px TikiMapa', '800 14px TikiMapa'].map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve();
  Promise.all([M.listo, fuentes, G.prep ? G.prep() : null]).then(() => {
    if (!vivo) return; cargado = true; M.redibuja(); M.setEtiquetas({}); $("[data-carga]").hidden = true; S.listo = true;
    mostrarPantalla("menu"); pintaMenu();
    const q = new URLSearchParams(location.search).get("auto"); /* solo pruebas: ?auto=diario */
    if (q === "diario") diario();
  }).catch((e) => { try { console.error("mapas: no se pudo cargar", e); } catch (er) { /* sin consola */ } if (vivo) { $("[data-error]").hidden = false; $("[data-carga]").hidden = true; } });
  mostrarPantalla("carga");
  /* Solo para las pruebas automáticas */
  return { cerrar: cerrar, S: S, M: M, G: G, fw: fw, clave: clave, empezar: empezar, diario: diario, contesta: contesta, siguiente: siguiente, frac: frac, RONDAS: RONDAS, mulberry: mulberry };
}
const MODOS_URL = { zoom: "zoomout", brujula: "brujula", ruta: "rutacrack", paises: "encuentrapais" };

/* ═════════ 1 · ZOOM OUT ═════════ */
const ZPASOS = [7.4, 6.3, 5.3, 4.4, 3.5, 2.7], ZMULT = [1, 0.8, 0.62, 0.46, 0.32, 0.2], ZDT = 2500;
function creaZoom(fw) {
  const { S, tr } = fw;
  let tPaso = 0, ronda = null;
  const porCiudad = () => { const m = new Map(); ITEMS.forEach((i) => { if (i.idx >= 0) { if (!m.has(i.idx)) m.set(i.idx, []); m.get(i.idx).push(i); } }); return m; };
  function nombre(idx) { const c = fw.M.ciudad(idx); return c ? c.nom : ""; }
  function avanza() {
    if (!ronda || S.fase !== "juego") return;
    if (S.paso >= ZPASOS.length - 1) { tPaso = setTimeout(() => { if (ronda && S.fase === "juego") G.agota(); }, 7000); return; }
    S.paso++;
    const c = fw.M.ciudad(ronda.idx);
    fw.M.volarA(c.lon, c.lat, ZPASOS[S.paso], 1800);
    if (S.paso >= 3) fw.M.setEtiquetas({ paises: true });
    if (S.paso >= 5) fw.M.setEtiquetas({ mares: true });
    pintaVale(); fw.sonTic();
    tPaso = setTimeout(avanza, ZDT);
  }
  function pintaVale() { const e = fw.$("[data-qs]"); e.hidden = false; e.textContent = tr("vale", { n: fw.num(1000 * ZMULT[S.paso]) }); }
  const G = {
    clave: "zoom", ZPASOS: ZPASOS, ZMULT: ZMULT,
    generar(rng) {
      const por = porCiudad(), info = [...por.keys()].map((i) => ({ idx: i, c: fw.M.ciudad(i) })).filter((o) => o.c);
      const elegidas = barajar(info, rng).slice(0, RONDAS).sort((a, b) => b.c.pop - a.c.pop);
      return elegidas.map((o) => {
        const otros = info.filter((x) => x.idx !== o.idx).map((x) => ({ x: x, d: distanciaKm(o.c, x.c) })).sort((a, b) => a.d - b.d);
        const nombres = new Set([o.c.nom]); const ops = [o];
        barajar(otros.slice(0, 16), rng).forEach((q) => { if (ops.length < 3 && !nombres.has(q.x.c.nom)) { ops.push(q.x); nombres.add(q.x.c.nom); } });
        barajar(otros, rng).forEach((q) => { if (ops.length < 4 && !nombres.has(q.x.c.nom)) { ops.push(q.x); nombres.add(q.x.c.nom); } });
        return { idx: o.idx, opts: barajar(ops, rng).map((x) => x.idx), items: por.get(o.idx) };
      });
    },
    muestra(r) {
      ronda = r; clearTimeout(tPaso); S.paso = 0;
      const c = fw.M.ciudad(r.idx), M = fw.M;
      M.setEtiquetas({ paises: false, ciudades: false, mares: false }); M.setCapa(null);
      fw.opciones(r.opts.map((i) => ({ v: i, t: nombre(i) })), 2);
      fw.pregunta({ ico: "🔎", k: tr("k"), q: tr("q"), g: tr("g") });
      M.volarA(c.lon, c.lat, ZPASOS[0], 0);
      pintaVale();
      fw.esperaTeselas(1600).then(() => { if (ronda === r && S.fase === "juego") tPaso = setTimeout(avanza, ZDT); });
    },
    responde(r, v) {
      const ok = Number(v) === r.idx, pts = ok ? Math.round(1000 * ZMULT[S.paso]) : 0, c = fw.M.ciudad(r.idx);
      fw.marcaOpciones(r.idx, Number(v));
      const lugar = c.nom + ", " + fw.M.nombrePais(c.iso);
      const futbol = [...new Set(r.items.map((i) => fw.tn(i.nom)))].slice(0, 4).join(" · ");
      fw.resuelve({ pts: pts, ico: "🔎", nom: c.nom, peq: ok ? "" : tr("elegiste", { x: nombre(Number(v)) }), big: ok ? "✓" : "✗", aprox: ok ? tr("vale", { n: fw.num(pts) }) : tr("era", { x: c.nom }), lugar: "📍 " + lugar, det: futbol ? tr("aqui", { x: futbol }) : "", marks: [{ lon: c.lon, lat: c.lat, tipo: "balon", color: ok ? "#0b8f4d" : "#e0321f", etiqueta: c.nom }], puntos: [c], zTope: 5.4, punto: { lon: c.lon, lat: c.lat } });
    },
    agota() { if (!ronda) return; const r = ronda, c = fw.M.ciudad(r.idx); fw.marcaOpciones(r.idx, null); fw.resuelve({ pts: 0, agotado: true, ico: "🔎", nom: c.nom, peq: tr("w0"), big: "⏱", aprox: tr("era", { x: c.nom }), lugar: "📍 " + c.nom + ", " + fw.M.nombrePais(c.iso), det: "", marks: [{ lon: c.lon, lat: c.lat, tipo: "balon", color: "#e0321f", etiqueta: c.nom }], puntos: [c], zTope: 5.4, punto: { lon: c.lon, lat: c.lat } }); },
    parar() { clearTimeout(tPaso); },
  };
  return G;
}

/* ═════════ 2 · BRÚJULA DEL FÚTBOL ═════════ */
function creaBrujula(fw) {
  const { S, tr } = fw;
  const LUG = () => ITEMS.filter((i) => (i.tipo === "est" || i.tipo === "club") && i.idx >= 0);
  const nombre = (it) => fw.tn(it.nom);
  function pareja(rng, pool) {
    for (let k = 0; k < 600; k++) {
      const a = pool[Math.floor(rng() * pool.length)], b = pool[Math.floor(rng() * pool.length)];
      if (a === b || a.idx === b.idx) continue;
      const d = distanciaKm(a, b); if (d < 350 || d > 7500) continue;
      const r = rumbos(a, b), s = sectorDe(r.gc);
      if (s !== sectorDe(r.rh) || margenSector(r.gc) < 7 || margenSector(r.rh) < 7) continue;
      return { tipo: "rumbo", a: a, b: b, sector: s, grados: Math.round(r.gc), km: d };
    }
    return null;
  }
  function cerca(rng, pool) {
    for (let k = 0; k < 600; k++) {
      const o = pool[Math.floor(rng() * pool.length)], c = [];
      for (let j = 0; j < 40 && c.length < 3; j++) { const x = pool[Math.floor(rng() * pool.length)]; if (x.idx === o.idx || c.some((y) => y.idx === x.idx)) continue; c.push(x); }
      if (c.length < 3) continue;
      const ds = c.map((x) => ({ x: x, d: distanciaKm(o, x) })).sort((p, q) => p.d - q.d);
      if (ds[0].d < 150 || ds[2].d > 9000 || ds[1].d / ds[0].d < 1.3) continue;
      return { tipo: "cerca", o: o, opts: barajar(c, rng).map((x) => x.id), ans: ds[0].x.id, ds: ds.map((p) => ({ id: p.x.id, d: p.d })) };
    }
    return null;
  }
  const G = {
    clave: "brujula",
    generar(rng) {
      const pool = LUG(), tipos = barajar(["rumbo", "rumbo", "rumbo", "cerca", "cerca"], rng), out = [];
      tipos.forEach((t) => { const r = t === "rumbo" ? pareja(rng, pool) : cerca(rng, pool); if (r) out.push(r); });
      while (out.length < RONDAS) { const r = pareja(rng, pool); if (r) out.push(r); }
      return out;
    },
    muestra(r) {
      const M = fw.M;
      M.setEtiquetas({ paises: true, ciudades: true, mares: true }); M.setCapa(null);
      if (r.tipo === "rumbo") {
        fw.brujulaUI();
        fw.pregunta({ ico: "🧭", k: tr("kR"), q: tr("qR", { a: nombre(r.a), b: nombre(r.b) }), g: tr("gR") });
        M.ponMarcadores([{ lon: r.a.lon, lat: r.a.lat, tipo: "pin", color: "#e0321f", etiqueta: nombre(r.a) }]);
        M.volarA(r.a.lon, r.a.lat, 3.4, 600); fw.reloj(18);
      } else {
        const byId = {}; ITEMS.forEach((i) => { byId[i.id] = i; });
        fw.opciones(r.opts.map((id) => ({ v: id, t: nombre(byId[id]) })), 1);
        fw.pregunta({ ico: "📏", k: tr("kC"), q: tr("qC", { o: nombre(r.o) }), g: tr("gC") });
        M.ponMarcadores([{ lon: r.o.lon, lat: r.o.lat, tipo: "pin", color: "#e0321f", etiqueta: nombre(r.o) }]);
        M.volarA(r.o.lon, r.o.lat, 2.9, 600); fw.reloj(15);
      }
    },
    responde(r, v) {
      const f = fw.frac();
      if (r.tipo === "rumbo") {
        const k = Number(v), dif = Math.min(Math.abs(k - r.sector), 8 - Math.abs(k - r.sector));
        const pts = dif === 0 ? puntosReloj(600, f) : dif === 1 ? 200 : 0, dir = DIRS[fw.idioma];
        fw.marcaOpciones(r.sector, k);
        fw.resuelve({ pts: pts, ico: "🧭", nom: nombre(r.a) + " → " + nombre(r.b), peq: dif === 0 ? "" : tr("real", { d: dir[r.sector] }), big: FLECHAS[r.sector], aprox: dif === 0 ? dir[r.sector] : tr("real", { d: dir[r.sector] }), lugar: "📍 " + tr("hasta", { n: fw.num(r.km), x: nombre(r.b) }), det: dif === 1 ? tr("vecino") : "",
          marks: [{ lon: r.a.lon, lat: r.a.lat, tipo: "pin", color: "#e0321f", etiqueta: nombre(r.a), linea: true }, { lon: r.b.lon, lat: r.b.lat, tipo: "balon", color: "#0b8f4d", etiqueta: nombre(r.b), linea: true }], puntos: [r.a, r.b], zTope: 6, punto: { lon: r.b.lon, lat: r.b.lat } });
      } else {
        const byId = {}; ITEMS.forEach((i) => { byId[i.id] = i; });
        const ok = v === r.ans, pts = ok ? puntosReloj(600, f) : 0, mejor = byId[r.ans];
        fw.marcaOpciones(r.ans, v);
        const marks = [{ lon: r.o.lon, lat: r.o.lat, tipo: "pin", color: "#e0321f", etiqueta: nombre(r.o), linea: true }, { lon: mejor.lon, lat: mejor.lat, tipo: "balon", color: "#0b8f4d", etiqueta: nombre(mejor) + " · " + fw.num(r.ds[0].d) + " km", linea: true }];
        r.ds.slice(1).forEach((q) => { const it = byId[q.id]; marks.push({ lon: it.lon, lat: it.lat, tipo: "pin", color: "#7a8aa0", etiqueta: nombre(it) + " · " + fw.num(q.d) + " km" }); });
        fw.resuelve({ pts: pts, ico: "📏", nom: nombre(r.o), peq: ok ? "" : tr("resp", { x: nombre(mejor) }), big: ok ? "✓" : "✗", aprox: tr("resp", { x: nombre(mejor) }), lugar: "📍 " + tr("hasta", { n: fw.num(r.ds[0].d), x: nombre(mejor) }), det: r.ds.map((q) => nombre(byId[q.id]) + " " + fw.num(q.d) + " km").join(" · "),
          marks: marks, puntos: [r.o].concat(r.ds.map((q) => byId[q.id])), zTope: 5, punto: { lon: mejor.lon, lat: mejor.lat } });
      }
    },
    agota() { const r = S.rondas[S.i]; if (!r) return; S.ag = true; if (r.tipo === "rumbo") G.responde(r, -9); else G.responde(r, "__tiempo__"); },
  };
  return G;
}

/* ═════════ 3 · RUTA DEL CRACK ═════════ */
function creaRuta(fw) {
  const { S, tr } = fw;
  let JUG = [], CLUB = {}, POS = {}, SEL = {}, ronda = null;
  const clave = (c) => [...new Set(c.map((k) => CIUDAD_CLUB[k]))].sort((a, b) => a - b).join("+");
  const G = {
    clave: "ruta",
    async prep() {
      const m = await import("./cuartetos_datos.js");
      CLUB = m.CLUBES; SEL = m.SELECCIONES;
      JUG = m.JUGADORES.map((j) => ({ n: j.n, s: j.s, p: j.p, c: j.c, b: j.b, w: j.w, ciudades: [...new Set(j.c.map((k) => CIUDAD_CLUB[k]))].sort((a, b) => a - b), k: clave(j.c) })).filter((j) => j.ciudades.length >= 1);
    },
    generar(rng) {
      const elegibles = JUG.filter((j) => j.ciudades.length >= 2);
      const usadas = new Set(), out = [];
      barajar(elegibles, rng).forEach((j) => {
        if (out.length >= RONDAS || usadas.has(j.k)) return; usadas.add(j.k); out.push(j);
      });
      return out.sort((a, b) => b.ciudades.length - a.ciudades.length || (b.b || b.w ? 1 : 0) - (a.b || a.w ? 1 : 0)).map((j) => {
        const cand = JUG.filter((x) => x.k !== j.k && x.n !== j.n).map((x) => ({ x: x, p: (x.ciudades.some((c) => j.ciudades.indexOf(c) >= 0) ? 2 : 0) + (x.p === j.p ? 1 : 0) + (x.s === j.s ? 1 : 0) + rng() * 1.6 })).sort((a, b) => b.p - a.p);
        const ops = [j];
        cand.forEach((q) => { if (ops.length < 4 && ops.every((o) => o.k !== q.x.k || o.n === j.n && false) && !ops.some((o) => o.n === q.x.n)) ops.push(q.x); });
        return { n: j.n, s: j.s, p: j.p, c: j.c, ciudades: j.ciudades, k: j.k, opts: barajar(ops, rng).map((o) => o.n) };
      });
    },
    muestra(r) {
      ronda = r; const M = fw.M;
      M.setEtiquetas({ paises: true, ciudades: false, mares: false }); M.setCapa(null);
      const pines = r.ciudades.map((i) => { const c = M.ciudad(i); return { lon: c.lon, lat: c.lat, tipo: "pin", color: "#e0321f", etiqueta: c.nom }; });
      M.ponMarcadores(pines);
      fw.opciones(r.opts.map((n) => ({ v: n, t: n })), 2);
      fw.pregunta({ ico: "🧳", k: tr("k"), q: tr("q"), s: tr("qs"), g: tr("g") });
      fw.acciones({ pista: true });
      requestAnimationFrame(() => requestAnimationFrame(() => { const m = fw.medidas(); M.encuadra(pines, { t: m.t + 30, r: 50, b: m.b + 20, l: 50 }, 900, 5.6); }));
      fw.reloj(28);
    },
    pista() {
      if (S.fase !== "juego" || S.pista || !ronda) return; S.pista = true;
      const b = fw.$("[data-pista]"); b.disabled = true; b.classList.add("usada");
      fw.$("[data-guia]").textContent = "💡 " + tr("ph", { s: fw.tn(SEL[ronda.s] || ronda.s), p: tr("p" + ronda.p) });
    },
    responde(r, v) {
      const ok = v === r.n, f = fw.frac(), pts = ok ? puntosReloj(500, f, S.pista) : 0;
      fw.marcaOpciones(r.n, v);
      const clubes = [...new Set(r.c.map((k) => CLUB[k]))].join(" · ");
      const pines = r.ciudades.map((i) => { const c = fw.M.ciudad(i); return { lon: c.lon, lat: c.lat, tipo: "pin", color: ok ? "#0b8f4d" : "#e0321f", etiqueta: c.nom }; });
      fw.resuelve({ pts: pts, pista: S.pista, ico: "🧳", nom: r.n, peq: clubes, big: ok ? "✓" : "✗", aprox: ok ? "" : tr("era", { x: r.n }), lugar: "👤 " + r.n, det: tr("jugo", { x: clubes }), marks: pines, puntos: r.ciudades.map((i) => fw.M.ciudad(i)), zTope: 5.6, punto: (() => { const c = fw.M.ciudad(r.ciudades[0]); return { lon: c.lon, lat: c.lat }; })() });
    },
    agota() { if (!ronda) return; S.ag = true; G.responde(ronda, "__tiempo__"); },
  };
  return G;
}

/* ═════════ 4 · ENCUENTRA EL PAÍS ═════════ */
function creaPaises(fw) {
  const { S, tr } = fw;
  let geo = null, ronda = null;
  const colores = { objetivo: ["rgba(255,210,74,.34)", "#ffd24a"], bien: ["rgba(52,224,137,.36)", "#34e089"], mal: ["rgba(255,91,69,.34)", "#ff5b45"] };
  const nombre = (iso) => fw.M.nombrePais(iso) || iso;
  function capa(lista) { S.cap = lista; fw.M.setCapa((c, T) => pintaCapa(c, T)); fw.M.redibuja(); }
  function pintaCapa(c, T) {
    if (!S.cap || !S.cap.length || !geo) return;
    const s = T.W / GEO_G;
    c.save(); c.setTransform(T.dpr * s, 0, 0, T.dpr * s, T.dpr * T.ox, T.dpr * T.oy);
    S.cap.forEach((h) => { const p = geo.get(h.iso); if (!p) return; c.fillStyle = colores[h.c][0]; c.fill(p.path, "evenodd"); c.lineWidth = 2.4 / s; c.lineJoin = "round"; c.strokeStyle = colores[h.c][1]; c.stroke(p.path); });
    c.restore();
  }
  /* Punto bien dentro del país: el de una rejilla sobre su territorio principal que queda más lejos del borde
     (el centro de la caja puede caer en otro país: p. ej. Noruega, o en el mar: Japón). Se guarda por país. */
  const centros = new Map();
  function distBorde(a, x, y) {
    let m = Infinity; const p = a.pts;
    for (let i = 0, j = a.n - 1; i < a.n; j = i++) {
      const ax = p[2 * j], ay = p[2 * j + 1], bx = p[2 * i], by = p[2 * i + 1], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      let t = l2 ? ((x - ax) * dx + (y - ay) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = x - (ax + t * dx), ey = y - (ay + t * dy), d2 = ex * ex + ey * ey; if (d2 < m) m = d2;
    }
    return m;
  }
  function centroDe(iso) {
    if (centros.has(iso)) return centros.get(iso);
    const p = geo.get(iso), a = p.mayor; let mejor = null, md = -1; const N = 18;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const gx = a.x0 + ((a.x1 - a.x0) * (i + 0.5)) / N, gy = a.y0 + ((a.y1 - a.y0) * (j + 0.5)) / N, q = lonLatDe(gx, gy);
      if (paisEn(geo, q.lon, q.lat) !== iso) continue;
      const d = distBorde(a, gx, gy); if (d > md) { md = d; mejor = q; }
    }
    if (!mejor) mejor = lonLatDe((a.x0 + a.x1) / 2, (a.y0 + a.y1) / 2);
    centros.set(iso, mejor); return mejor;
  }
  function cajaDe(iso) { const a = geo.get(iso).mayor, p0 = lonLatDe(a.x0, a.y0), p1 = lonLatDe(a.x1, a.y1); return [{ lon: p0.lon, lat: p0.lat }, { lon: p1.lon, lat: p1.lat }]; }
  function opcionesPais(rng, iso) {
    const me = PAISES_POOL.find((p) => p[0] === iso), mismos = PAISES_POOL.filter((p) => p[1] === me[1] && p[0] !== iso), otros = PAISES_POOL.filter((p) => p[0] !== iso && p[1] !== me[1]);
    const ops = [iso];
    barajar(mismos, rng).slice(0, 2).forEach((p) => ops.push(p[0]));
    barajar(mismos.concat(otros), rng).forEach((p) => { if (ops.length < 4 && ops.indexOf(p[0]) < 0) ops.push(p[0]); });
    return barajar(ops, rng);
  }
  const G = {
    clave: "paises", PAISES_POOL: PAISES_POOL,
    async prep() { geo = await cargaGeo("mapas/"); fw.setGeo(geo); },
    generar(rng) {
      const validos = PAISES_POOL.filter((p) => geo.has(p[0]));
      const niveles = [0, 0, 1, 1, 2], tipos = barajar(["toca", "forma", "toca", "forma", barajar(["toca", "forma"], rng)[0]], rng), usados = new Set();
      return niveles.map((n, k) => {
        const cand = barajar(validos.filter((p) => p[2] === n && !usados.has(p[0])), rng); const p = cand[0] || barajar(validos.filter((q) => !usados.has(q[0])), rng)[0]; usados.add(p[0]);
        return { tipo: tipos[k], iso: p[0], reg: p[1], opts: opcionesPais(rng, p[0]) };
      });
    },
    muestra(r) {
      ronda = r; const M = fw.M; S.sel = null; S.pista = false;
      M.setEtiquetas({ paises: false, ciudades: false, mares: false }); M.ponMarcadores([]);
      if (r.tipo === "toca") {
        capa([]); fw.opciones([], 1); fw.$("[data-resp]").innerHTML = "";
        fw.pregunta({ ico: "👆", k: tr("kT"), q: tr("qT", { x: nombre(r.iso) }), g: tr("gT") });
        fw.acciones({ confirmar: true });
        M.volarA(8, 25, M.zMin() + 0.35, 700); fw.reloj(30);
      } else {
        capa([{ iso: r.iso, c: "objetivo" }]);
        fw.opciones(r.opts.map((iso) => ({ v: iso, t: nombre(iso) })), 2);
        fw.pregunta({ ico: "🧩", k: tr("kF"), q: tr("qF"), g: tr("gF") });
        requestAnimationFrame(() => requestAnimationFrame(() => { const m = fw.medidas(); M.encuadra(cajaDe(r.iso), { t: m.t + 24, r: 40, b: m.b + 16, l: 40 }, 900, 6); }));
        fw.reloj(22);
      }
    },
    alTocar(p) {
      if (!ronda || ronda.tipo !== "toca" || S.fase !== "juego") return;
      fw.audio(); fw.sonPulsa(); S.sel = { lon: p.lon, lat: p.lat };
      fw.M.ponMarcadores([{ lon: p.lon, lat: p.lat, tipo: "pin", color: "#e0321f" }]);
      const b = fw.$("[data-confirmar]"); b.disabled = false; b.classList.add("lista"); fw.$("[data-guia]").textContent = tr("gT2");
    },
    confirma() {
      if (!ronda || ronda.tipo !== "toca" || !S.sel) return;
      const r = ronda, f = fw.frac(), tocado = paisEn(geo, S.sel.lon, S.sel.lat), ok = tocado === r.iso;
      let pts = ok ? puntosReloj(600, f) : 0, casi = null;
      if (!ok) { const d = distanciaPais(geo, r.iso, S.sel.lon, S.sel.lat); if (d <= 120) { pts = 250; casi = Math.round(d); } }
      const c = centroDe(r.iso), cap = [{ iso: r.iso, c: "bien" }]; if (tocado && !ok) cap.push({ iso: tocado, c: "mal" });
      capa(cap);
      const items = [...new Set(ITEMS.filter((i) => i.iso === r.iso && (i.tipo === "est" || i.tipo === "club")).map((i) => fw.tn(i.nom)))].slice(0, 4).join(" · ");
      const puntos = cajaDe(r.iso).concat(ok ? [] : [S.sel]);
      fw.resuelve({ pts: pts, ico: "👆", nom: nombre(r.iso), peq: ok ? "" : tr("toc", { x: tocado ? nombre(tocado) : tr("mar") }), big: ok ? "✓" : casi != null ? "≈" : "✗", aprox: ok ? "" : tr("toc", { x: tocado ? nombre(tocado) : tr("mar") }), lugar: "📍 " + nombre(r.iso), det: (casi != null ? tr("casi", { n: fw.num(casi) }) + (items ? " · " : "") : "") + (items ? tr("lista", { x: items }) : ""),
        marks: [{ lon: c.lon, lat: c.lat, tipo: "balon", color: "#0b8f4d", etiqueta: nombre(r.iso) }].concat(ok ? [] : [{ lon: S.sel.lon, lat: S.sel.lat, tipo: "pin", color: "#e0321f", etiqueta: tr("tu") }]), puntos: puntos, zTope: 6, punto: { lon: c.lon, lat: c.lat } });
    },
    responde(r, v) {
      if (r.tipo !== "forma") return;
      const ok = v === r.iso, f = fw.frac(), pts = ok ? puntosReloj(500, f) : 0, c = centroDe(r.iso);
      fw.marcaOpciones(r.iso, v); capa([{ iso: r.iso, c: ok ? "bien" : "mal" }]);
      const items = [...new Set(ITEMS.filter((i) => i.iso === r.iso && (i.tipo === "est" || i.tipo === "club")).map((i) => fw.tn(i.nom)))].slice(0, 4).join(" · ");
      fw.resuelve({ pts: pts, ico: "🧩", nom: nombre(r.iso), peq: ok ? "" : (r.opts.indexOf(v) >= 0 ? tr("elegiste", { x: nombre(v) }) : tr("w0")), big: ok ? "✓" : "✗", aprox: ok ? "" : tr("era", { x: nombre(r.iso) }), lugar: "📍 " + nombre(r.iso), det: items ? tr("lista", { x: items }) : "",
        marks: [{ lon: c.lon, lat: c.lat, tipo: "balon", color: ok ? "#0b8f4d" : "#e0321f", etiqueta: nombre(r.iso) }], puntos: cajaDe(r.iso), zTope: 6, punto: { lon: c.lon, lat: c.lat } });
    },
    agota() {
      const r = ronda; if (!r) return;
      if (r.tipo === "toca") { S.sel = null; const c = centroDe(r.iso); capa([{ iso: r.iso, c: "mal" }]); fw.resuelve({ pts: 0, agotado: true, ico: "👆", nom: nombre(r.iso), peq: tr("era", { x: nombre(r.iso) }), big: "⏱", aprox: tr("era", { x: nombre(r.iso) }), lugar: "📍 " + nombre(r.iso), det: "", marks: [{ lon: c.lon, lat: c.lat, tipo: "balon", color: "#e0321f", etiqueta: nombre(r.iso) }], puntos: cajaDe(r.iso), zTope: 6, punto: { lon: c.lon, lat: c.lat } }); }
      else { S.ag = true; G.responde(r, "__tiempo__"); }
    },
    parar() { /* el contorno resaltado se queda en la pantalla de resultado; lo limpia la ronda siguiente, el menú o el final */ },
    paisEn: (lon, lat) => paisEn(geo, lon, lat), distanciaPais: (iso, lon, lat) => distanciaPais(geo, iso, lon, lat), centro: (iso) => centroDe(iso), geo: () => geo,
  };
  return G;
}
