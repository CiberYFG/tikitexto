# -*- coding: utf-8 -*-
"""Bloques extra (consejos + lecturas relacionadas) para las páginas de cada juego, en es y en.
Texto propio de TIKITEXTO. seo.py los antepone a «Más modos para jugar».
Las rutas se escriben respecto a la raíz de la web; `raiz` es el prefijo relativo ("../" o "../../")."""
import html

def _e(s): return html.escape(s, quote=True)

# modo -> (consejos, [(texto, ruta es)])
ES = {
 "jugadores": (
  ["Empieza con un apellido que lleve varias vocales (a, e, o, i): los primeros colores te dirán mucho sobre la estructura del nombre.",
   "Una letra amarilla está en el nombre pero en otra posición. Antes de gastar el siguiente intento, piensa en qué hueco puede encajar.",
   "El número de casillas ya descarta a muchísimos jugadores. Cuenta las letras de los que tienes en la cabeza y quédate con los que encajan.",
   "En el fútbol abundan los nombres de juego cortos, como Pelé o Xavi. Si el tablero es pequeño, piensa en apodos y nombres artísticos antes que en apellidos largos.",
   "Usa la pista solo cuando estés atascado: así el acierto vale más y aprendes más."],
  [("Letras más frecuentes en los nombres de futbolistas", "articulos/letras-mas-frecuentes-nombres-futbolistas/"),
   ("Trucos para adivinar un futbolista en 6 intentos", "articulos/trucos-adivinar-futbolista-6-intentos/"),
   ("Datos curiosos de Messi", "curiosidades/curiosidades-messi/"),
   ("Ganadores del Balón de Oro", "curiosidades/balon-de-oro-ganadores/")]),
 "equipos": (
  ["Los nombres se escriben sin espacios y sin tildes, así que REALMADRID ocupa diez casillas. Cuenta bien antes de escribir.",
   "Hay palabras que se repiten mucho en los nombres de clubes (REAL, CITY, UNITED, SPORTING, ATLETICO). Probarlas pronto te da pistas de muchas letras a la vez.",
   "Piensa en la liga: si la pista habla de una ciudad o de un país, descartas la mitad de los clubes de golpe.",
   "No te obsesiones con un solo club. Si tras dos intentos nada encaja, cambia de liga en tu cabeza."],
  [("Historia de las ligas más antiguas", "curiosidades/ligas/"),
   ("La liga de fútbol más antigua del mundo", "articulos/liga-de-futbol-mas-antigua-del-mundo/"),
   ("Campeones de las grandes competiciones", "curiosidades/campeones/"),
   ("Curiosidades del Real Madrid", "curiosidades/curiosidades-real-madrid/")]),
 "selecciones": (
  ["Los nombres de países varían mucho de longitud: con 4 o 5 casillas tienes pocos candidatos y con 9 o más muchos menos todavía. Aprovecha ese filtro.",
   "Las pistas hablan de Mundiales, Eurocopas y apodos. Si recuerdas quién ganó qué torneo, ya tienes media respuesta.",
   "Las selecciones campeonas del mundo son un buen primer intento: son pocas y sus nombres reparten bien las letras.",
   "Recuerda que se escribe sin tildes ni espacios, así que un nombre compuesto se junta en una sola palabra."],
  [("Los Mundiales, edición por edición", "curiosidades/mundiales-edicion-por-edicion/"),
   ("Campeones y goleadores de la Eurocopa", "curiosidades/eurocopa-campeones-y-goleadores/"),
   ("Máximos goleadores de las selecciones", "curiosidades/maximos-goleadores-selecciones/"),
   ("Formato del Mundial 2026 y desempates", "articulos/mundial-fase-de-grupos-desempates-y-formato-2026/")]),
 "entrenadores": (
  ["Los entrenadores suelen conocerse por el apellido. Empieza por apellidos largos con varias vocales para sacar colores rápido.",
   "Piensa en los títulos que ganaron: la pista habla de trofeos y estilo, y eso reduce mucho la lista.",
   "Si dudas entre un técnico actual y uno histórico, mira cuántas casillas hay: muchos apellidos coinciden en longitud, pero no en letras.",
   "Primero inténtalo sin pista. Con una descripción a la vista, el reto es otro."],
  [("Los entrenadores con más Champions League", "curiosidades/entrenadores-mas-champions/"),
   ("Las últimas 20 finales de la Champions", "curiosidades/champions-20-anos/"),
   ("Cómo funcionan las tandas de penaltis", "articulos/historia-tandas-de-penaltis/"),
   ("Curiosidades de la Champions League", "curiosidades/curiosidades-champions-league/")]),
 "estadios_es": (
  ["Elige primero la competición (España, Inglaterra, Europa o el resto del mundo): el filtro reduce la lista a unas decenas de campos.",
   "Muchos estadios llevan el nombre de un patrocinador, un personaje o la ciudad. Si la pista habla de una ciudad, piensa en cómo se llama su estadio principal.",
   "Fíjate en el número de casillas: un nombre corto como ANFIELD o MESTALLA descarta de golpe a los estadios de nombre largo.",
   "Las pistas cuentan algo de la historia del campo. Si recuerdas una final o un Mundial que se jugó allí, tienes la respuesta."],
  [("Las últimas 20 finales de la Champions, con sus sedes", "curiosidades/champions-20-anos/"),
   ("Los Mundiales y sus sedes", "curiosidades/mundiales-edicion-por-edicion/"),
   ("Curiosidades del FC Barcelona", "curiosidades/curiosidades-barcelona/"),
   ("Curiosidades de la Premier League", "curiosidades/curiosidades-premier-league/")]),
 "ahorcado": (
  ["Empieza por las vocales, sobre todo A, E, O e I: casi todos los nombres las llevan y descubrirás huecos enseguida.",
   "Después prueba las consonantes más repetidas en español, como R, N, S y L, y deja las raras (K, W, Z) para el final.",
   "Cada hueco en blanco separa nombre y apellido. Úsalo para calcular cuántas letras tiene cada palabra.",
   "Tienes 5 fallos y no hay pistas: cuando te queden dos, piensa en jugadores que encajen antes de gastar otra letra."],
  [("Letras más frecuentes en los nombres de futbolistas", "articulos/letras-mas-frecuentes-nombres-futbolistas/"),
   ("Trucos para adivinar un futbolista en 6 intentos", "articulos/trucos-adivinar-futbolista-6-intentos/"),
   ("Sopa de letras de fútbol para peques", "peques/sopa-de-letras-futbol/"),
   ("Adivinanzas de fútbol", "peques/adivinanzas-de-futbol/")]),
}

EN = {
 "jugadores": (
  ["Start with a surname that has several vowels (a, e, o, i): the first colours tell you a lot about the shape of the name.",
   "A yellow letter is in the name but in a different position. Before spending your next try, think about which slot it can fit.",
   "The number of squares already rules out a lot of players. Count the letters of the ones you have in mind and keep those that fit.",
   "Football has plenty of short playing names, like Pelé or Xavi. If the board is small, think of nicknames before long surnames.",
   "Use the hint only when you are stuck: the win feels better and you learn more."],
  [("Football (soccer) trivia by topic", "football-trivia-by-topic/"),
   ("Lionel Messi facts", "lionel-messi-facts/"),
   ("Ballon d'Or winners", "ballon-dor-winners/"),
   ("Cristiano Ronaldo facts", "cristiano-ronaldo-facts/")]),
 "equipos": (
  ["Names are written without spaces or accents, so REALMADRID takes ten squares. Count before you type.",
   "Some words show up in many club names (REAL, CITY, UNITED, SPORTING). Trying them early reveals several letters at once.",
   "Think about the league: if the hint mentions a city or a country, half of the clubs are gone at once.",
   "Do not get stuck on one club. If nothing fits after two tries, change league in your head."],
  [("Football leagues: how they began", "ligas/"),
   ("Champions of the big competitions", "campeones/"),
   ("Real Madrid facts", "real-madrid-facts/"),
   ("FC Barcelona facts", "fc-barcelona-facts/")]),
 "selecciones": (
  ["Country names vary a lot in length: with 4 or 5 squares you have few candidates, and with 9 or more even fewer. Use that filter.",
   "The hints talk about World Cups, European Championships and nicknames. If you remember who won what, you already have half the answer.",
   "World champions are a good first guess: there are few of them and their names spread the letters well.",
   "Remember: no accents and no spaces, so a compound name is written as a single word."],
  [("World Cups, edition by edition", "world-cups-edition-by-edition/"),
   ("European Championship winners", "european-championship-winners/"),
   ("International top scorers", "international-top-scorers/"),
   ("World Cup facts", "world-cup-facts/")]),
 "entrenadores": (
  ["Managers are usually known by their surname. Start with long surnames that have several vowels to get colours fast.",
   "Think about the trophies they won: the hint talks about titles and style, and that shortens the list a lot.",
   "If you hesitate between a current coach and a historic one, look at the number of squares: many surnames share a length but not letters.",
   "Try first without the hint. With a description on screen, the challenge is different."],
  [("Managers with the most Champions League titles", "champions-league-winning-managers/"),
   ("The last 20 Champions League finals", "champions-league-last-20-finals/"),
   ("Champions League facts", "champions-league-facts/"),
   ("Premier League facts", "premier-league-facts/")]),
 "estadios_es": (
  ["Choose the competition first (Spain, England, Europe or the rest of the world): the filter cuts the list to a few dozen grounds.",
   "Many stadiums carry the name of a sponsor, a person or the city. If the hint mentions a city, think of its main ground.",
   "Look at the number of squares: a short name like ANFIELD or MESTALLA rules out the long-named stadiums at once.",
   "The hints tell a bit of the ground's history. If you remember a final or a World Cup played there, you have the answer."],
  [("The last 20 Champions League finals and their venues", "champions-league-last-20-finals/"),
   ("World Cups, edition by edition", "world-cups-edition-by-edition/"),
   ("FC Barcelona facts", "fc-barcelona-facts/"),
   ("Premier League facts", "premier-league-facts/")]),
 "ahorcado": (
  ["Start with the vowels, above all A, E, O and I: almost every name has them and the blanks fill up fast.",
   "Then try the most common consonants in English, such as R, N, S and L, and leave the rare ones (K, W, Z) for last.",
   "Each gap separates first name and surname. Use it to work out how many letters each word has.",
   "You have 5 mistakes and no hints: when you have two left, think of players that fit before spending another letter."],
  [("Football (soccer) trivia by topic", "football-trivia-by-topic/"),
   ("Lionel Messi facts", "lionel-messi-facts/"),
   ("Ballon d'Or winners", "ballon-dor-winners/"),
   ("Cristiano Ronaldo facts", "cristiano-ronaldo-facts/")]),
}


# Contexto propio de cada modo (h2 + párrafos), antes de los consejos. Solo datos estables y verificables.
CONTEXTO = {
 "es": {
  "jugadores": ("De dónde salen los nombres de este modo", [
   "Los futbolistas son la categoría con más variedad de nombres de todo el juego. Muchos se conocen por un apodo o por una forma abreviada de su nombre completo: Pelé nació como Edson Arantes do Nascimento, Xavi es Xavier Hernández Creus, Kaká se llama Ricardo Izecson dos Santos Leite y Neymar es la forma corta de Neymar da Silva Santos Júnior. Por eso, antes de pensar en el apellido, conviene pensar en cómo anuncian al jugador por megafonía o cómo aparece en su camiseta.",
   "El tablero acepta el nombre escrito sin tildes ni espacios, y la longitud cambia mucho de un jugador a otro: de nombres de cuatro letras a otros de más de diez. Ese rango es parte de la gracia, y la primera pista casi siempre es el propio número de casillas.",
   "El modo mezcla leyendas históricas y estrellas actuales, así que no hace falta seguir una liga concreta: con conocer los grandes premios, las finales de Mundial y Champions y algunas plantillas de selecciones tienes una buena base. Las lecturas de más abajo sirven justo para refrescar esa memoria."]),
  "equipos": ("Lo que esconde el nombre de un club", [
   "Los nombres de los clubes guardan pistas de su historia. «Real» es un título que concede la corona española: el Real Madrid lo recibió del rey Alfonso XIII en 1920. Manchester United adoptó su nombre actual en 1902, cuando el antiguo Newton Heath se refundó. Juventus significa «juventud» en latín, y el Inter se llama así porque nació en 1908 como Football Club Internazionale, abierto a jugadores de cualquier país.",
   "Hay patrones por países: en España e Italia abundan los nombres de ciudad (Valencia, Sevilla, Napoli), en Inglaterra son habituales los sufijos como City, United, Town, Rovers o Wanderers y en Alemania se repiten palabras como Borussia, Eintracht o Bayer. Como el tablero se escribe sin espacios ni tildes, esas partículas ocupan casillas y cambian la longitud, así que reconocerlas te ahorra intentos.",
   "Con este mapa mental dejas de adivinar a ciegas y empiezas a deducir: primero decide en qué liga puede estar el club y después ajusta por el número de casillas."]),
  "selecciones": ("Selecciones: nombres, apodos e historia", [
   "Las selecciones son el único modo cuyos nombres cambian de verdad con el tiempo. Alemania Occidental, la Unión Soviética, Yugoslavia o Checoslovaquia dejaron de existir como equipos, y un nombre compuesto como Costa Rica se escribe junto en el tablero. Si algo no encaja, piensa en la forma más corta y común del país.",
   "El fútbol de selecciones es más antiguo que las grandes ligas actuales: el primer partido internacional oficial lo jugaron Escocia e Inglaterra en Glasgow en 1872 y terminó 0-0. Desde entonces cada selección ha ido acumulando apodos que las pistas aprovechan: La Roja (España), Les Bleus (Francia), La Albiceleste (Argentina), La Celeste (Uruguay), los Azzurri (Italia) o Die Mannschaft (Alemania).",
   "Conocer esos apodos y recordar quién ganó cada torneo es la mejor preparación para este modo."]),
  "entrenadores": ("Entrenadores y «managers»: dos formas de dirigir", [
   "En Inglaterra se habla de manager para el responsable del primer equipo, que suele intervenir también en fichajes y cantera; en España o Italia es más habitual el entrenador, con un director deportivo que se ocupa del mercado. Las pistas de este modo hablan de títulos, estilo y trayectoria, así que ayuda saber de qué clubes y países proceden.",
   "Las carreras largas son la excepción: Alex Ferguson dirigió al Manchester United casi veintiséis años, de 1986 a 2013, y hoy lo normal es que un técnico cambie de banquillo cada pocas temporadas. Por eso conviene asociar a cada entrenador con una etapa concreta de un club y no solo con un nombre.",
   "Como los apellidos de los técnicos suelen ser más largos y menos repetidos que los de los jugadores, la longitud del tablero descarta mucho más de lo que parece."]),
  "estadios_es": ("Estadios: nombres con historia", [
   "El nombre de un estadio casi siempre cuenta algo. El Santiago Bernabéu se inauguró en 1947 como Nuevo Estadio de Chamartín y desde 1955 lleva el nombre del presidente que impulsó el club. Anfield abrió en 1884 como campo del Everton; el Liverpool nació en 1892, cuando el Everton se mudó a Goodison Park, y se quedó con el campo. El Maracanã se construyó en Río de Janeiro para el Mundial de 1950.",
   "En las últimas décadas, además, muchos campos han cambiado de nombre por acuerdos de patrocinio, así que un mismo estadio puede tener varios nombres a lo largo del tiempo. El modo usa el nombre más conocido, y las pistas recuerdan la ciudad, la competición o algún partido célebre que se jugó allí.",
   "Si dudas, piensa primero en la competición y la ciudad y luego en el número de casillas: nombres cortos como Anfield o Mestalla descartan de golpe a los de nombre largo."]),
  "ahorcado": ("Un clásico de lápiz y papel", [
   "El ahorcado es un juego de papel y lápiz que se conoce al menos desde finales del siglo XIX y que se ha jugado en las aulas y en los viajes de medio mundo. La versión de TIKITEXTO lo traslada al fútbol: la palabra oculta es el nombre de un futbolista, con espacios que separan nombre y apellido.",
   "Una buena estrategia sale de la frecuencia de las letras: en español las más habituales son la E, la A y la O, seguidas de la S, la R y la N. Empieza por ahí y deja para el final las raras, como K, W o Z. Cada fallo cuenta, así que conviene elegir letras que se repitan en muchos nombres antes de arriesgarte con una concreta.",
   "Cuando ya tengas un par de huecos, deja de pensar en letras sueltas y empieza a pensar en jugadores: el patrón de huecos suele bastar para reconocer al futbolista."]),
 },
 "en": {
  "jugadores": ("Where this mode's names come from", [
   "Footballers are the category with the most variety of names in the game. Many are known by a nickname or a shortened version of their full name: Pelé was born Edson Arantes do Nascimento, Xavi is Xavier Hernández Creus, Kaká is Ricardo Izecson dos Santos Leite and Neymar is the short form of Neymar da Silva Santos Júnior. So before thinking of a surname, think about how the player is announced over the speakers or what appears on his shirt.",
   "The board accepts the name written without accents or spaces, and the length varies a lot from one player to another: from four-letter names to others of more than ten. That range is part of the fun, and the first clue is almost always the number of squares itself.",
   "The mode mixes historic legends and current stars, so you do not need to follow one particular league: knowing the major awards, the World Cup and Champions League finals and some national squads gives you a good base. The reading links below are there to refresh exactly that memory."]),
  "equipos": ("What a club's name gives away", [
   "Club names hold clues about their history. “Real” is a title granted by the Spanish crown: Real Madrid received it from King Alfonso XIII in 1920. Manchester United took its current name in 1902, when the old Newton Heath was refounded. Juventus means “youth” in Latin, and Inter is so called because it was born in 1908 as Football Club Internazionale, open to players of any nationality.",
   "There are patterns by country: in Spain and Italy city names are common (Valencia, Sevilla, Napoli), in England suffixes such as City, United, Town, Rovers or Wanderers are frequent, and in Germany words like Borussia, Eintracht or Bayer keep appearing. Because the board is written without spaces or accents, those words take up squares and change the length, so recognising them saves you attempts.",
   "With this mental map you stop guessing blindly and start deducing: first decide which league the club might belong to, then narrow it down by the number of squares."]),
  "selecciones": ("National teams: names, nicknames and history", [
   "National teams are the one mode whose names genuinely change over time. West Germany, the Soviet Union, Yugoslavia and Czechoslovakia no longer exist as teams, and a compound name such as Costa Rica is written as one word on the board. If something does not fit, think of the shortest, most common form of the country's name.",
   "National-team football is older than today's big leagues: the first official international match was played by Scotland and England in Glasgow in 1872 and finished 0-0. Since then each team has collected nicknames that the clues make use of: La Roja (Spain), Les Bleus (France), La Albiceleste (Argentina), La Celeste (Uruguay), the Azzurri (Italy) or Die Mannschaft (Germany).",
   "Knowing those nicknames and remembering who won each tournament is the best preparation for this mode."]),
  "entrenadores": ("Managers and head coaches: two ways of leading a team", [
   "In England the person in charge of the first team is called the manager and usually has a say in transfers and youth development; in Spain or Italy the word is more often coach, with a sporting director who deals with the market. The clues in this mode talk about titles, style and career, so it helps to know which clubs and countries each manager comes from.",
   "Long careers are the exception: Alex Ferguson managed Manchester United for almost twenty-six years, from 1986 to 2013, and today it is normal for a coach to change dugout every few seasons. That is why it pays to link each manager to a specific stage at a club and not just a name.",
   "Because managers' surnames tend to be longer and less repeated than players', the length of the board rules out far more than it seems."]),
  "estadios_es": ("Stadiums: names with history", [
   "A stadium's name almost always tells a story. The Santiago Bernabéu opened in 1947 as the Nuevo Estadio de Chamartín and has carried the name of the club president who drove its construction since 1955. Anfield opened in 1884 as Everton's ground; Liverpool were founded in 1892, when Everton moved to Goodison Park, and kept the ground. The Maracanã was built in Rio de Janeiro for the 1950 World Cup.",
   "In recent decades many grounds have also changed names through sponsorship deals, so one stadium can have several names over time. The mode uses the best-known name, and the clues mention the city, the competition or a famous match played there.",
   "If you are unsure, think first of the competition and the city and then of the number of squares: short names such as Anfield or Mestalla instantly rule out long ones."]),
  "ahorcado": ("A pencil-and-paper classic", [
   "Hangman is a pencil-and-paper game known since at least the late nineteenth century and played in classrooms and on journeys around the world. TIKITEXTO's version brings it to football: the hidden word is a footballer's name, with spaces separating first name and surname.",
   "A good strategy comes from letter frequency: in Spanish the most common letters are E, A and O, followed by S, R and N. Start there and leave rare ones such as K, W or Z for the end. Every miss counts, so pick letters that appear in many names before gambling on a specific one.",
   "Once you have a couple of gaps filled, stop thinking in single letters and start thinking in players: the pattern of blanks is often enough to recognise the footballer."]),
 },
}

TITULOS = {
 "es": ("Consejos para jugar mejor", "Para leer mientras tanto"),
 "en": ("Tips to play better", "Read while you wait"),
}

def bloque(lang, modo, raiz):
    """HTML con consejos y enlaces. lang: 'es' o 'en'. raiz: prefijo relativo hasta la raíz de la web."""
    datos = (ES if lang == "es" else EN).get(modo)
    if not datos: return ""
    consejos, enlaces = datos
    t1, t2 = TITULOS[lang]
    # es: las rutas ya son relativas a la raíz; en: relativas a en/curiosidades/
    pre = raiz if lang == "es" else raiz + "en/curiosidades/"
    li = "".join('<li><a href="%s">%s</a></li>' % (pre + r, _e(t)) for t, r in enlaces)
    ctx = CONTEXTO.get(lang, {}).get(modo)
    pre_ctx = ('<h2>%s</h2>%s' % (_e(ctx[0]), "".join("<p>%s</p>" % _e(x) for x in ctx[1]))) if ctx else ""
    return (pre_ctx + '<h2>%s</h2><ul>%s</ul>' % (t1, "".join("<li>%s</li>" % _e(c) for c in consejos))
            + '<h2>%s</h2><ul class="g">%s</ul>' % (t2, li))
