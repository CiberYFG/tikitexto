#!/usr/bin/env python3
"""Páginas de datos concretos del fútbol (récords y rankings) en español e inglés, con fuentes.
Usa las plantillas de tools/curiosidades.py. Ejecutar DESPUÉS de curiosidades.py y antes de seo.py:
  python3 tools/curiosidades.py && python3 tools/curiosidades_datos.py && python3 tools/seo.py
Datos: Wikipedia (listas enlazadas en cada página) y Al Jazeera para el Balón de Oro; al 18-8-2026 salvo indicación."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
DOM = "https://tikitexto.com/"
from curiosidades import e, tabla, cabecera, pie, Idioma, BALON, COPA, ESTADIO
C.LANGS = ["es", "en"]          # estas páginas solo existen en es/en (hreflang correcto)
LANGS = C.LANGS
W = "https://en.wikipedia.org/wiki/"
PAIS_EN = {"Francia": "France", "Argentina": "Argentina", "Alemania": "Germany", "Brasil": "Brazil", "Inglaterra": "England", "Hungría": "Hungary",
           "Portugal": "Portugal", "Irán": "Iran", "India": "India", "Bélgica": "Belgium", "Malasia": "Malaysia", "Emiratos Árabes Unidos": "United Arab Emirates",
           "Polonia": "Poland", "Zambia": "Zambia", "Croacia": "Croatia", "Kuwait": "Kuwait", "Omán": "Oman", "Catar": "Qatar", "Egipto": "Egypt", "México": "Mexico",
           "España": "Spain", "Italia": "Italy", "Países Bajos": "Netherlands", "Brasil ": "Brazil", "Dinamarca": "Denmark", "Grecia": "Greece", "Unión Soviética": "Soviet Union",
           "Checoslovaquia": "Czechoslovakia", "Yugoslavia": "Yugoslavia", "Alemania Occidental": "West Germany", "República Checa": "Czech Republic", "Rumanía": "Romania"}

def P(L, x): return x if L.lang == "es" else PAIS_EN.get(x, x)
def T(L, par): return par[0] if L.lang == "es" else par[1]

# Cada página: slug, (título ES, EN), (descripción), (h1), (intro), tabla(s), dato, fuentes, fecha, texto del botón
def paginas(L):
    es = L.lang == "es"
    pg = []
    # 1 Champions
    pg.append(dict(slug="maximos-goleadores-champions" if es else "champions-league-top-scorers", ic=BALON,
        t=("Máximos goleadores de la historia de la Champions League", "Champions League all-time top scorers"),
        d=("Ranking de los máximos goleadores de la Copa de Europa y la Champions League con goles y partidos: Cristiano, Messi, Lewandowski, Benzema, Mbappé…",
           "All-time European Cup and Champions League top scorers with goals and appearances: Cristiano Ronaldo, Messi, Lewandowski, Benzema, Mbappé…"),
        intro=("Cristiano Ronaldo lidera con diferencia el ranking histórico de goleadores de la máxima competición de clubes de Europa. Estos son los 15 primeros, con los partidos que necesitó cada uno.",
               "Cristiano Ronaldo leads the all-time scoring chart of Europe's top club competition by a wide margin. Here are the top 15, with the appearances each needed."),
        cab=(("Jugador", "Goles", "Partidos", "Goles por partido"), ("Player", "Goals", "Apps", "Goals per game")),
        filas=[("Cristiano Ronaldo",140,183),("Lionel Messi",129,163),("Robert Lewandowski",109,144),("Karim Benzema",90,152),("Kylian Mbappé",73,101),("Raúl",71,142),("Erling Haaland",61,60),("Harry Kane",58,73),("Thomas Müller",57,163),("Ruud van Nistelrooy",56,73),("Mohamed Salah",50,98),("Thierry Henry",50,112),("Alfredo Di Stéfano",49,58),("Andriy Shevchenko",48,100),("Zlatan Ibrahimović",48,124)],
        ratio=True,
        dato=("Haaland ha marcado 61 goles en solo 60 partidos: más de un gol por partido, la mejor media de toda la lista.",
              "Haaland has scored 61 goals in just 60 games: more than one per match, the best ratio on the list."),
        src=[("Wikipedia · List of UEFA Champions League top scorers", W + "List_of_UEFA_Champions_League_top_scorers")],
        fecha=("Hasta la temporada 2025-26", "Through the 2025–26 season"),
        btn=("⚽ ¿Eres capaz de adivinar al goleador? Juega", "⚽ Can you guess the scorer? Play")))
    # 2 Mundial
    pg.append(dict(slug="maximos-goleadores-mundial" if es else "world-cup-top-scorers", ic=COPA,
        t=("Máximos goleadores de la historia de los Mundiales", "FIFA World Cup all-time top scorers"),
        d=("Los máximos goleadores de los Mundiales de fútbol: Mbappé, Messi, Klose, Ronaldo, Müller, Fontaine, Pelé… con goles y partidos.",
           "The all-time FIFA World Cup top scorers: Mbappé, Messi, Klose, Ronaldo, Müller, Fontaine, Pelé… with goals and matches."),
        intro=("El Mundial de 2026 cambió la cabeza de la tabla: Kylian Mbappé superó a Miroslav Klose y a Lionel Messi y es hoy el máximo goleador de la historia de la competición.",
               "The 2026 World Cup reshaped the top of the table: Kylian Mbappé passed Miroslav Klose and Lionel Messi and is now the competition's all-time leading scorer."),
        cab=(("Jugador", "Selección", "Goles", "Partidos"), ("Player", "Team", "Goals", "Matches")),
        filas=[("Kylian Mbappé","Francia",22,22),("Lionel Messi","Argentina",21,34),("Miroslav Klose","Alemania",16,24),("Ronaldo","Brasil",15,19),("Gerd Müller","Alemania Occidental",14,13),("Harry Kane","Inglaterra",14,18),("Just Fontaine","Francia",13,6),("Pelé","Brasil",12,14),("Sándor Kocsis","Hungría",11,5),("Jürgen Klinsmann","Alemania",11,17),("Cristiano Ronaldo","Portugal",11,27),("Helmut Rahn","Alemania Occidental",10,10)],
        dato=("Just Fontaine marcó 13 goles en un solo Mundial (1958) y sigue siendo el récord de una edición.",
              "Just Fontaine scored 13 goals in a single World Cup (1958), and that remains the single-tournament record."),
        src=[("Wikipedia · List of FIFA World Cup top goalscorers", W + "List_of_FIFA_World_Cup_top_goalscorers")],
        fecha=("Datos a 19 de julio de 2026 (tras la final)", "As of 19 July 2026 (after the final)"),
        btn=("⚽ Pon a prueba tu memoria mundialista: juega", "⚽ Test your World Cup memory: play")))
    # 3 Goles selecciones
    pg.append(dict(slug="maximos-goleadores-selecciones" if es else "international-top-scorers", ic=BALON,
        t=("Máximos goleadores de selecciones de la historia", "All-time top international goalscorers"),
        d=("Quién ha marcado más goles con su selección: Cristiano Ronaldo, Messi, Ali Daei, Chhetri, Lukaku, Lewandowski, Kane, Puskás… con goles y partidos.",
           "Who has scored the most international goals: Cristiano Ronaldo, Messi, Ali Daei, Chhetri, Lukaku, Lewandowski, Kane, Puskás… with goals and caps."),
        intro=("Solo dos jugadores superan los 120 goles con su selección. Detrás aparecen nombres menos conocidos en Europa, como Ali Daei (Irán), Sunil Chhetri (India) o Mokhtar Dahari (Malasia).",
               "Only two players have passed 120 international goals. Behind them come names less familiar in Europe, such as Ali Daei (Iran), Sunil Chhetri (India) or Mokhtar Dahari (Malaysia)."),
        cab=(("Jugador", "Selección", "Goles", "Partidos"), ("Player", "Team", "Goals", "Caps")),
        filas=[("Cristiano Ronaldo","Portugal",146,233),("Lionel Messi","Argentina",125,207),("Ali Daei","Irán",108,148),("Sunil Chhetri","India",95,157),("Romelu Lukaku","Bélgica",93,132),("Mokhtar Dahari","Malasia",89,142),("Robert Lewandowski","Polonia",89,167),("Ali Mabkhout","Emiratos Árabes Unidos",85,115),("Harry Kane","Inglaterra",85,121),("Ferenc Puskás","Hungría",84,89),("Neymar","Brasil",80,130),("Godfrey Chitalu","Zambia",79,111)],
        dato=("Ferenc Puskás marcó 84 goles en solo 89 partidos con Hungría: la mejor media de los doce primeros.",
              "Ferenc Puskás scored 84 goals in only 89 games for Hungary: the best ratio among the top twelve."),
        src=[("Wikipedia · Men's footballers with 50+ international goals", W + "List_of_men%27s_footballers_with_50_or_more_international_goals")],
        fecha=("Datos a 19 de julio de 2026", "As of 19 July 2026"),
        btn=("⚽ ¿Conoces a todos los goleadores? Juega", "⚽ Do you know every scorer? Play")))
    # 4 Caps
    pg.append(dict(slug="mas-partidos-con-la-seleccion" if es else "most-international-caps", ic=ESTADIO,
        t=("Jugadores con más partidos con su selección", "Players with the most international caps"),
        d=("Los futbolistas con más internacionalidades de la historia: Cristiano Ronaldo, Messi, Modrić, Al-Mutawa, Sergio Ramos… ranking actualizado.",
           "The footballers with the most international caps ever: Cristiano Ronaldo, Messi, Modrić, Al-Mutawa, Sergio Ramos… updated ranking."),
        intro=("Cristiano Ronaldo y Lionel Messi superan las 200 internacionalidades, y Luka Modrić se les ha unido. En la lista también hay jugadores de selecciones asiáticas y africanas con carreras larguísimas.",
               "Cristiano Ronaldo and Lionel Messi are past 200 caps, and Luka Modrić has joined them. The list also includes long-serving players from Asian and African national teams."),
        cab=(("Jugador", "Selección", "Partidos"), ("Player", "Team", "Caps")),
        filas=[("Cristiano Ronaldo","Portugal",233),("Lionel Messi","Argentina",207),("Luka Modrić","Croacia",202),("Bader Al-Mutawa","Kuwait",202),("Soh Chin Ann","Malasia",195),("Ahmed Kano","Omán",193),("Hassan Al-Haydos","Catar",188),("Ahmed Hassan","Egipto",184),("Andrés Guardado","México",180),("Sergio Ramos","España",180),("Claudio Suárez","México",178),("Hossam Hassan","Egipto",177)],
        dato=("Modrić y Al-Mutawa comparten el tercer puesto con 202 partidos cada uno.",
              "Modrić and Al-Mutawa share third place with 202 caps each."),
        src=[("Wikipedia · Men's footballers with 100+ international caps", W + "List_of_men%27s_footballers_with_100_or_more_international_caps")],
        fecha=("Datos a 18 de agosto de 2026", "As of 18 August 2026"),
        btn=("⚽ ¿Cuánto sabes de fútbol? Juega", "⚽ How much do you know about football? Play")))
    # 5 Balón de Oro
    pg.append(dict(slug="balon-de-oro-ganadores" if es else "ballon-dor-winners", ic=BALON,
        t=("Balón de Oro: ganadores, récords y países con más premios", "Ballon d'Or: winners, records and countries with the most awards"),
        d=("Quién ha ganado más Balones de Oro (Messi 8, Cristiano 5), qué países tienen más y los últimos ganadores: Messi, Rodri y Dembélé.",
           "Who has won the most Ballon d'Or awards (Messi 8, Cristiano 5), which countries have the most, and the latest winners: Messi, Rodri and Dembélé."),
        intro=("El Balón de Oro masculino se entrega desde 1956. Messi (8) y Cristiano Ronaldo (5) acumulan trece de los premios entregados.",
               "The men's Ballon d'Or has been awarded since 1956. Messi (8) and Cristiano Ronaldo (5) account for thirteen of the awards given."),
        cab=(("Jugador", "País", "Balones de Oro"), ("Player", "Country", "Ballons d'Or")),
        filas=[("Lionel Messi","Argentina",8),("Cristiano Ronaldo","Portugal",5),("Michel Platini","Francia",3),("Johan Cruyff","Países Bajos",3),("Marco van Basten","Países Bajos",3)],
        extra=[(("País", "Balones de Oro"), ("Country", "Awards"), [("Argentina",8),("Francia",8),("Portugal",7),("Alemania",7),("Países Bajos",7),("Brasil",5),("Inglaterra",5),("Italia",5),("España",4)],
                ("Países con más Balones de Oro", "Countries with the most Ballons d'Or")),
               (("Año", "Ganador"), ("Year", "Winner"), [("2023","Lionel Messi"),("2024","Rodri"),("2025","Ousmane Dembélé")],
                ("Últimos ganadores", "Latest winners"))],
        dato=("Argentina y Francia lideran el medallero por países con 8 premios cada una.",
              "Argentina and France top the country table with 8 awards each."),
        src=[("Al Jazeera · Which countries and players have won the most Ballon d'Or awards?", "https://www.aljazeera.com/sports/2026/10/21/which-countries-and-players-have-won-the-most-ballon-dor-awards")],
        fecha=("Consultado el 31 de octubre de 2026", "Checked on 31 October 2026"),
        btn=("⚽ ¿Sabes quién es el jugador? Juega", "⚽ Can you name the player? Play")))
    # 6 Entrenadores
    pg.append(dict(slug="entrenadores-mas-champions" if es else "champions-league-winning-managers", ic=COPA,
        t=("Entrenadores con más Copas de Europa y Champions League", "Managers with the most European Cups and Champions League titles"),
        d=("Carlo Ancelotti lidera con 5 títulos. Repasa los entrenadores con más Copas de Europa: Paisley, Zidane, Guardiola y Luis Enrique.",
           "Carlo Ancelotti leads with 5 titles. See the managers with the most European Cups: Paisley, Zidane, Guardiola and Luis Enrique."),
        intro=("Ancelotti ha ganado la máxima competición europea cinco veces, dos con el Milan y tres con el Real Madrid. Luis Enrique se unió al grupo de los tres títulos en 2026 con el Paris Saint-Germain.",
               "Ancelotti has won Europe's top competition five times, twice with Milan and three times with Real Madrid. Luis Enrique joined the three-title group in 2026 with Paris Saint-Germain."),
        cab=(("Entrenador", "Títulos", "Años"), ("Manager", "Titles", "Years")),
        filas=[("Carlo Ancelotti",5,"2003, 2007, 2014, 2022, 2024"),("Bob Paisley",3,"1977, 1978, 1981"),("Zinedine Zidane",3,"2016, 2017, 2018"),("Pep Guardiola",3,"2009, 2011, 2023"),("Luis Enrique",3,"2015, 2025, 2026")],
        dato=("Zidane es el único entrenador que ganó tres Champions seguidas (2016, 2017 y 2018).",
              "Zidane is the only manager to win three Champions League titles in a row (2016, 2017 and 2018)."),
        src=[("Wikipedia · European Cup and UEFA Champions League winning managers", W + "List_of_European_Cup_and_UEFA_Champions_League_winning_managers")],
        fecha=("Hasta la final de 2026", "Through the 2026 final"),
        btn=("⚽ ¿Adivinas al entrenador? Juega", "⚽ Can you guess the manager? Play")))
    # 7 Eurocopa
    pg.append(dict(slug="eurocopa-campeones-y-goleadores" if es else "european-championship-winners", ic=COPA,
        t=("Eurocopa: todas las finales, campeones y máximos goleadores", "European Championship: every final, winners and top scorers"),
        d=("Todas las finales de la Eurocopa desde 1960, países con más títulos (España 4) y récord goleador de Cristiano Ronaldo.",
           "Every European Championship final since 1960, countries with the most titles (Spain 4) and Cristiano Ronaldo's scoring record."),
        intro=("España es la selección con más Eurocopas (cuatro: 1964, 2008, 2012 y 2024). Cristiano Ronaldo es el máximo goleador histórico del torneo con 14 goles; Michel Platini marcó 9 en una sola edición (1984).",
               "Spain is the team with most European Championships (four: 1964, 2008, 2012 and 2024). Cristiano Ronaldo is the tournament's all-time top scorer with 14 goals; Michel Platini scored 9 in a single edition (1984)."),
        cab=(("Año", "Campeón", "Subcampeón", "Resultado"), ("Year", "Winner", "Runner-up", "Score")),
        filas=[(2024,"España","Inglaterra","2-1"),(2020,"Italia","Inglaterra","1-1 (3-2 pen.)"),(2016,"Portugal","Francia","1-0 (prórroga)"),(2012,"España","Italia","4-0"),(2008,"España","Alemania","1-0"),(2004,"Grecia","Portugal","1-0"),(2000,"Francia","Italia","2-1 (gol de oro)"),(1996,"Alemania","República Checa","2-1 (gol de oro)"),(1992,"Dinamarca","Alemania","2-0"),(1988,"Países Bajos","Unión Soviética","2-0"),(1984,"Francia","España","2-0"),(1980,"Alemania Occidental","Bélgica","2-1"),(1976,"Checoslovaquia","Alemania Occidental","2-2 (5-3 pen.)"),(1972,"Alemania Occidental","Unión Soviética","3-0"),(1968,"Italia","Yugoslavia","1-1 y 2-0 en el desempate"),(1964,"España","Unión Soviética","2-1"),(1960,"Unión Soviética","Yugoslavia","2-1 (prórroga)")],
        dato=("Diez selecciones distintas han ganado la Eurocopa; España (4), Alemania (3 contando Alemania Occidental), Italia y Francia (2 cada una) acumulan 11 de las 17 ediciones hasta 2024.",
              "Ten different teams have won the Euros."),
        src=[("Wikipedia · UEFA European Championship", W + "UEFA_European_Championship")],
        fecha=("Hasta la edición de 2024", "Through the 2024 edition"),
        btn=("⚽ ¿Cuánto sabes de selecciones? Juega", "⚽ How much do you know about national teams? Play")))
    # 8 Pichichi
    pg.append(dict(slug="pichichi-historia" if es else "pichichi-trophy-history", ic=BALON,
        t=("Trofeo Pichichi: jugadores con más premios y últimos ganadores", "Pichichi Trophy: most awards and recent winners"),
        d=("Messi (8), Telmo Zarra (6), Di Stéfano, Quini y Hugo Sánchez (5): los máximos goleadores de LaLiga con más Pichichis y los ganadores recientes.",
           "Messi (8), Telmo Zarra (6), Di Stéfano, Quini and Hugo Sánchez (5): the players with the most Pichichi awards in La Liga and the recent winners."),
        intro=("El Pichichi premia al máximo goleador de LaLiga cada temporada. Lionel Messi acumula ocho, más que cualquier otro jugador; Kylian Mbappé es el ganador de las dos últimas ediciones.",
               "The Pichichi rewards La Liga's top scorer every season. Lionel Messi has won eight, more than anyone else; Kylian Mbappé has won the last two editions."),
        cab=(("Jugador", "Premios", "Temporadas"), ("Player", "Awards", "Seasons")),
        filas=[("Lionel Messi",8,"2009-10, 2011-12, 2012-13, 2016-17 a 2020-21"),("Telmo Zarra",6,"1944-45, 1945-46, 1946-47, 1949-50, 1950-51, 1952-53"),("Alfredo Di Stéfano",5,"1953-54, 1955-56…1958-59"),("Quini",5,"1973-74, 1975-76, 1979-80, 1980-81, 1981-82"),("Hugo Sánchez",5,"1984-85…1987-88, 1989-90")],
        extra=[(("Temporada", "Ganador", "Goles"), ("Season", "Winner", "Goals"), [("2025-26","Kylian Mbappé",25),("2024-25","Kylian Mbappé",31),("2023-24","Artem Dovbyk",24),("2022-23","Robert Lewandowski",23),("2021-22","Karim Benzema",27),("2020-21","Lionel Messi",30),("2019-20","Lionel Messi",25),("2018-19","Lionel Messi",36)],
                ("Últimos ganadores (masculino)", "Recent winners (men)"))],
        dato=("Messi ganó cinco Pichichis consecutivos entre 2016-17 y 2020-21.",
              "Messi won five Pichichis in a row between 2016–17 and 2020–21."),
        src=[("Wikipedia · Pichichi Trophy", W + "Pichichi_Trophy")],
        fecha=("Hasta la temporada 2025-26", "Through the 2025–26 season"),
        btn=("⚽ ¿Quién es el goleador? Juega", "⚽ Who's the scorer? Play")))
    # 9 Bota de Oro
    pg.append(dict(slug="bota-de-oro-europea" if es else "european-golden-shoe", ic=BALON,
        t=("Bota de Oro europea: más premios y ganadores recientes", "European Golden Shoe: most awards and recent winners"),
        d=("Messi ganó 6 Botas de Oro; Cristiano, 4. Consulta quiénes han ganado más y los máximos goleadores de Europa de las últimas ocho temporadas.",
           "Messi has won 6 Golden Shoes; Cristiano, 4. See who has won the most and Europe's top scorers over the last eight seasons."),
        intro=("La Bota de Oro europea premia al máximo goleador de las ligas de Europa. Messi lleva seis, Cristiano cuatro y varios jugadores, entre ellos Lewandowski, Suárez, Henry y Kane, dos cada uno.",
               "The European Golden Shoe rewards the top scorer across Europe's leagues. Messi has six, Cristiano four, and several players, including Lewandowski, Suárez, Henry and Kane, have two each."),
        cab=(("Jugador", "Botas de Oro"), ("Player", "Golden Shoes")),
        filas=[("Lionel Messi",6),("Cristiano Ronaldo",4),("Eusébio",2),("Gerd Müller",2),("Thierry Henry",2),("Luis Suárez",2),("Robert Lewandowski",2),("Harry Kane",2)],
        extra=[(("Temporada", "Jugador", "Club", "Goles"), ("Season", "Player", "Club", "Goals"), [("2025-26","Harry Kane","Bayern de Múnich",36),("2024-25","Kylian Mbappé","Real Madrid",31),("2023-24","Harry Kane","Bayern de Múnich",36),("2022-23","Erling Haaland","Manchester City",36),("2021-22","Robert Lewandowski","Bayern de Múnich",35),("2020-21","Robert Lewandowski","Bayern de Múnich",41),("2019-20","Ciro Immobile","Lazio",36),("2018-19","Lionel Messi","Barcelona",36)],
                ("Últimos ganadores", "Recent winners"))],
        dato=("Los 41 goles de Lewandowski en 2020-21 son la cifra más alta de las últimas ocho ediciones.",
              "Lewandowski's 41 goals in 2020–21 are the highest total of the last eight editions."),
        src=[("Wikipedia · European Golden Shoe", W + "European_Golden_Shoe")],
        fecha=("Hasta la temporada 2025-26", "Through the 2025–26 season"),
        btn=("⚽ Adivina al goleador: juega", "⚽ Guess the scorer: play")))
    return pg

CLUBES_EN = {"Bayern de Múnich": "Bayern Munich"}
def fix_en(pg):
    # corrige el dato de la Eurocopa en inglés (se rellena aquí para mantener la tabla legible)
    for p in pg:
        if p["slug"] == "european-championship-winners":
            p["dato"] = ("", "Ten different teams have won the Euros; Spain (4), Germany (3 counting West Germany), Italy and France (2 each) hold 11 of the 17 editions through 2024.")
    return pg

todas_slugs = {}
def alinear(L, h, ruta, slug, par):
    """cabecera() supone la misma ruta en todos los idiomas; aquí los slugs difieren: corrige hreflang y selector"""
    r_es, r_en = "curiosidades/" + par[0] + "/", "curiosidades/" + par[1] + "/"
    o_es, o_en = DOM + r_es, DOM + "en/" + r_en
    prop = r_es if L.lang == "es" else r_en
    otro = r_en if L.lang == "es" else r_es
    for a, b in ((f'hreflang="es" href="{DOM}{prop}"', f'hreflang="es" href="{o_es}"'), (f'hreflang="en" href="{DOM}en/{prop}"', f'hreflang="en" href="{o_en}"'),
                 (f'hreflang="x-default" href="{DOM}{prop}"', f'hreflang="x-default" href="{o_es}"'),
                 (f'<a href="/en/{prop}" hreflang="en"', f'<a href="/en/{r_en}" hreflang="en"'), (f'<a href="/{prop}" hreflang="es"', f'<a href="/{r_es}" hreflang="es"')):
        h = h.replace(a, b)
    return h

def celda(L, v):
    if isinstance(v, str):
        v = P(L, v) if L.lang == "en" else v
        if L.lang == "en":
            v = CLUBES_EN.get(v, v)
            for a, b in (("(prórroga)", "(a.e.t.)"), ("(gol de oro)", "(golden goal)"), ("(5-3 pen.)", "(5–3 pens)"), ("(3-2 pen.)", "(3–2 pens)"), ("1-1 y 2-0 en el desempate", "1–1 and 2–0 in the replay")):
                v = v.replace(a, b)
    return v

def foto(L, slug):
    """Foto opcional: img/curiosidades/<slug>.jpg|webp + crédito en img/curiosidades/creditos.json
    ({"<slug>": {"alt": "...", "es": "pie en español", "en": "caption", "autor": "...", "licencia": "...", "url": "..."}}).
    Solo fotos de dominio público o con licencia libre que NO muestren escudos, logos ni jugadores/clubes (regla 4)."""
    import json
    base = os.path.join(C.RAIZ, "img", "curiosidades")
    for ext in ("webp", "jpg"):
        if os.path.exists(os.path.join(base, slug + "." + ext)):
            cr = {}
            try: cr = json.load(open(os.path.join(base, "creditos.json"), encoding="utf-8")).get(slug, {})
            except Exception: pass
            pie_ = cr.get(L.lang) or cr.get("en") or ""
            aut = f' · {e(cr.get("autor", ""))}, <a href="{e(cr.get("url", "#"))}" rel="noopener" target="_blank">{e(cr.get("licencia", ""))}</a>' if cr.get("autor") else ""
            return f'<figure class="foto"><img src="/img/curiosidades/{slug}.{ext}" alt="{e(cr.get("alt", ""))}" loading="lazy" width="760" height="428"><figcaption>{e(pie_)}{aut}</figcaption></figure>\n'
    return ""

def pagina(L, p, todas):
    es = L.lang == "es"
    ruta = "curiosidades/" + p["slug"] + "/"
    k = 0 if es else 1
    titulo = p["t"][k]
    h = cabecera(L, titulo + " | TIKITEXTO", p["d"][k], ruta, titulo, p["ic"])
    h = alinear(L, h, ruta, p["slug"], todas_slugs[p["slug"]])
    h = h.replace(L.ui["checked"], p["fecha"][k])
    h += f'<div class="caja">{e(p["intro"][k])}</div>\n'
    h += foto(L, p["slug"])
    filas = []
    for i, f in enumerate(p["filas"], 1):
        f = [celda(L, c) for c in f]
        if p.get("ratio"):
            f.append(f"{f[1] / f[2]:.2f}".replace(".", "," if es else "."))
        filas.append([i] + f)
    cab = list(p["cab"][k]); cab = ["#"] + cab
    if es:
        cab = [c if c != "Selección" else c for c in cab]
    h += tabla(cab, filas)
    for ex in p.get("extra", []):
        c2, c2en, f2, tt = ex
        h += f'<h2>{e(tt[k])}</h2>\n' + tabla(list(c2 if es else c2en), [[celda(L, c) for c in f] for f in f2])
    h += f'<p class="dato"><b>{e(L.ui["nutshell"])}</b> {e(p["dato"][k])}</p>\n'
    srcs = " · ".join(f'<a href="{u}" rel="noopener" target="_blank">{e(n)}</a>' for n, u in p["src"])
    h += f'<p class="fecha">{"Fuentes" if es else "Sources"}: {srcs}. {e(p["fecha"][k])}.</p>\n'
    otras = [q for q in todas if q["slug"] != p["slug"]][:4]
    h += f'<h2>{"Más datos" if es else "More stats"}</h2>\n<p class="indice">' + "".join(f'<a href="{L.url("curiosidades/" + q["slug"] + "/")}">{e(q["t"][k])}</a>' for q in otras) + '</p>\n'
    h += f'<p><a class="jugar" href="{L.play()}">{e(p["btn"][k])}</a></p>\n'
    return ruta, h + pie(L)

def hub(L, todas):
    es = L.lang == "es"; k = 0 if es else 1; ruta = "curiosidades/datos/"
    t = "Récords y rankings del fútbol: datos con fuentes" if es else "Football records and rankings: sourced stats"
    d = ("Máximos goleadores, partidos con la selección, Balón de Oro, Pichichi, Bota de Oro, Eurocopa y entrenadores con más Champions. Datos con fuentes."
         if es else "Top scorers, international caps, Ballon d'Or, Pichichi, Golden Shoe, the Euros and managers with the most Champions League titles. Sourced stats.")
    h = cabecera(L, t + " | TIKITEXTO", d, ruta, t)
    h += f'<div class="caja">{e(d)}</div>\n<div class="tarjetas">\n'
    for q in todas:
        h += f'<a class="tarjeta" href="{L.url("curiosidades/" + q["slug"] + "/")}">{q["ic"]}<b>{e(q["t"][k])}</b><span>{e(q["fecha"][k])}</span></a>\n'
    import hist_data as _H
    for _sl, _t, _f, _ic in _H.cards_meta(L.lang):
        h += f'<a class="tarjeta" href="{L.url("curiosidades/" + _sl + "/")}">{globals()[_ic]}<b>{e(_t)}</b><span>{e(_f)}</span></a>\n'
    h += '</div>\n'
    return ruta, h + pie(L)

if __name__ == "__main__":
    out = []
    _es = paginas(Idioma("es")); _en = fix_en(paginas(Idioma("en")))
    for a, b in zip(_es, _en): todas_slugs[b["slug"]] = todas_slugs[a["slug"]] = (a["slug"], b["slug"])
    for lg in LANGS:
        L = Idioma(lg)
        pg = fix_en(paginas(L))
        _h = hub(L, pg); _h = (_h[0], _h[1].replace('hreflang="es" href="%scuriosidades/datos/"' % DOM, 'hreflang="es" href="%scuriosidades/datos/"' % DOM))
        for ruta, cont in [_h] + [pagina(L, p, pg) for p in pg]:
            cont = C.con_huecos(L, cont)
            d = os.path.join(C.RAIZ, L.prefix + ruta)
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont)
            out.append(L.prefix + ruta)
    print(len(out), "páginas"); print("\n".join(out))
