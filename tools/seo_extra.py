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
    return ('<h2>%s</h2><ul>%s</ul>' % (t1, "".join("<li>%s</li>" % _e(c) for c in consejos))
            + '<h2>%s</h2><ul class="g">%s</ul>' % (t2, li))
