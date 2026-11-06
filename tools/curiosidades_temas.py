#!/usr/bin/env python3
"""Curiosidades por tema (clubes, competiciones, jugadores): 12 páginas es/en + índice «más curiosidades».
Orden: curiosidades.py -> curiosidades_datos.py -> curiosidades_historia.py -> curiosidades_temas.py -> seo.py"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
import curiosidades_datos as D
from curiosidades import e, cabecera, pie, entrada, Idioma, COPA, BALON, LIGA
import temas_data as T
C.LANGS = ["es", "en"]
LANGS = C.LANGS
ICONOS = {"COPA": COPA, "BALON": BALON, "LIGA": LIGA}
INTERNAS = {"PICHICHI": ("pichichi-historia", "pichichi-trophy-history"), "BALON": ("balon-de-oro-ganadores", "ballon-dor-winners"),
            "SELEC": ("maximos-goleadores-selecciones", "international-top-scorers"), "CHAMP": ("maximos-goleadores-champions", "champions-league-top-scorers")}
FECHA = ("Datos a 2 de noviembre de 2026", "Data as of 2 November 2026")
HUB = ("curiosidades-por-temas", "football-trivia-by-topic")
HUB_T = ("Curiosidades del fútbol por equipos, competiciones y jugadores", "Football curiosities by club, competition and player")
HUB_D = ("Datos curiosos del Real Madrid, Barça, Messi, Cristiano, Champions, Mundial, Premier League, LaLiga, Eurocopa y más, con fuentes.",
         "Curiosities about Real Madrid, Barça, Messi, Cristiano, the Champions League, the World Cup, the Premier League, La Liga, the Euros and more, with sources.")
for t in T.TEMAS: D.todas_slugs[t["es"]] = D.todas_slugs[t["en"]] = (t["es"], t["en"])
D.todas_slugs[HUB[0]] = D.todas_slugs[HUB[1]] = HUB

FAQ_TEMAS = {
 "curiosidades-messi": [
  ("¿Cuántos Balones de Oro tiene Messi?", "How many Ballons d'Or does Messi have?", "Ocho: 2009, 2010, 2011, 2012, 2015, 2019, 2021 y 2023. Es el jugador con más premios.", "Eight: 2009, 2010, 2011, 2012, 2015, 2019, 2021 and 2023. He is the most decorated player."),
  ("¿Cuándo ganó Messi el Mundial?", "When did Messi win the World Cup?", "En 2022, en Catar. Argentina empató 3-3 con Francia en la final y ganó 4-2 en los penaltis.", "In 2022, in Qatar. Argentina drew 3-3 with France in the final and won 4-2 on penalties."),
  ("¿Cuántos goles ha marcado Messi con Argentina?", "How many goals has Messi scored for Argentina?", "125 goles en 207 partidos, el segundo mejor registro de la historia de las selecciones.", "125 goals in 207 games, the second-best record in international football."),
  ("¿Cuántos Pichichis ha ganado Messi?", "How many Pichichi awards has Messi won?", "Ocho, más que ningún otro jugador. Cinco de ellos fueron seguidos, de 2016-17 a 2020-21.", "Eight, more than anyone else. Five were in a row, from 2016–17 to 2020–21."),
  ("¿Cuál es el dato más curioso de Messi?", "What is the most curious fact about Messi?", "Que su fichaje por el Barcelona, a los 13 años, se cerró según la historia con un compromiso escrito en una servilleta de papel en el año 2000.", "That, according to the story, his move to Barcelona at 13 was sealed with a commitment written on a paper napkin in 2000.")],
 "curiosidades-cristiano-ronaldo": [
  ("¿Cuántos Balones de Oro tiene Cristiano Ronaldo?", "How many Ballons d'Or does Cristiano Ronaldo have?", "Cinco: 2008, 2013, 2014, 2016 y 2017.", "Five: 2008, 2013, 2014, 2016 and 2017."),
  ("¿Cuántos goles ha marcado Cristiano con Portugal?", "How many goals has Cristiano scored for Portugal?", "146 goles en 233 partidos, el máximo goleador y el jugador con más partidos de la historia de las selecciones.", "146 goals in 233 games, the all-time top scorer and most-capped player in international football."),
  ("¿Cuántas Champions League ha ganado Cristiano Ronaldo?", "How many Champions Leagues has Cristiano Ronaldo won?", "Cinco: una con el Manchester United (2008) y cuatro con el Real Madrid (2014, 2016, 2017 y 2018).", "Five: one with Manchester United (2008) and four with Real Madrid (2014, 2016, 2017 and 2018)."),
  ("¿Cuántos goles marcó Cristiano en el Real Madrid?", "How many goals did Cristiano score for Real Madrid?", "450 goles en 438 partidos entre 2009 y 2018. Es el máximo goleador de la historia del club.", "450 goals in 438 games between 2009 and 2018. He is the club's all-time top scorer.")],
 "curiosidades-real-madrid": [
  ("¿Cuántas Copas de Europa tiene el Real Madrid?", "How many European Cups does Real Madrid have?", "15, la última en 2024. Es el club con más títulos de la Copa de Europa y la Champions League.", "15, the latest in 2024. It is the club with the most European Cup and Champions League titles."),
  ("¿Cuántas Ligas ha ganado el Real Madrid?", "How many league titles has Real Madrid won?", "36 campeonatos de Liga, más que ningún otro club.", "36 league titles, more than any other club."),
  ("¿Cuándo se fundó el Real Madrid y por qué se llama «Real»?", "When was Real Madrid founded and why is it called «Real»?", "Se fundó en 1902 como Madrid Football Club. En 1920, el rey Alfonso XIII le concedió el título de «Real».", "It was founded in 1902 as Madrid Football Club. In 1920, King Alfonso XIII granted it the title «Real»."),
  ("¿Qué es la Décima del Real Madrid?", "What is Real Madrid's «Décima»?", "Su décima Copa de Europa, ganada en 2014 en Lisboa por 4-1 en la prórroga, con un gol de Sergio Ramos en el minuto 93 para empatar.", "Its tenth European Cup, won in Lisbon in 2014 by 4-1 after extra time, with Sergio Ramos equalising in the 93rd minute.")],
 "curiosidades-barcelona": [
  ("¿Cuándo se fundó el FC Barcelona?", "When was FC Barcelona founded?", "El 29 de noviembre de 1899, por iniciativa del suizo Joan Gamper.", "On 29 November 1899, on the initiative of the Swiss Joan Gamper."),
  ("¿Cuántas Champions tiene el Barcelona?", "How many Champions Leagues does Barcelona have?", "Cinco: 1992, 2006, 2009, 2011 y 2015.", "Five: 1992, 2006, 2009, 2011 and 2015."),
  ("¿Qué fue el sextete del Barça en 2009?", "What was Barça's sextuple in 2009?", "En 2009, con Guardiola, ganó los seis títulos en juego: Liga, Copa, Champions, Supercopa de España, Supercopa de Europa y Mundial de Clubes.", "In 2009, under Guardiola, it won all six titles available: league, cup, Champions League, Spanish Super Cup, UEFA Super Cup and Club World Cup.")],
 "curiosidades-balon-de-oro": [
  ("¿Quién ha ganado más Balones de Oro?", "Who has won the most Ballons d'Or?", "Lionel Messi, con ocho. Cristiano Ronaldo tiene cinco.", "Lionel Messi, with eight. Cristiano Ronaldo has five."),
  ("¿Qué portero ha ganado el Balón de Oro?", "Which goalkeeper has won the Ballon d'Or?", "Solo Lev Yashin, en 1963. Es el único guardameta que lo ha conseguido.", "Only Lev Yashin, in 1963. He is the only goalkeeper to have won it."),
  ("¿Quién ganó el Balón de Oro 2026?", "Who won the 2026 Ballon d'Or?", "Harry Kane, el primer inglés en ganarlo desde Michael Owen en 2001.", "Harry Kane, the first English winner since Michael Owen in 2001."),
  ("¿Quién fue el primer no europeo en ganar el Balón de Oro?", "Who was the first non-European to win the Ballon d'Or?", "El liberiano George Weah, en 1995, el año en que se abrió el premio a jugadores de todo el mundo.", "Liberia's George Weah, in 1995, the year the award was opened to players from all over the world.")],
 "curiosidades-champions-league": [
  ("¿Quién ha ganado más Champions League?", "Who has won the most Champions Leagues?", "El Real Madrid, con 15 Copas de Europa y Champions League.", "Real Madrid, with 15 European Cups and Champions Leagues."),
  ("¿Qué entrenador ha ganado más Champions?", "Which manager has won the most Champions Leagues?", "Carlo Ancelotti, con cinco: dos con el Milan y tres con el Real Madrid.", "Carlo Ancelotti, with five: two with Milan and three with Real Madrid."),
  ("¿Quién es el máximo goleador de la Champions?", "Who is the Champions League's top scorer?", "Cristiano Ronaldo, con 140 goles.", "Cristiano Ronaldo, with 140 goals."),
  ("¿Cuál es la mayor goleada en una final?", "What is the biggest win in a final?", "El 5-0 del París Saint-Germain al Inter en la final de 2025, en Múnich.", "Paris Saint-Germain's 5-0 win over Inter in the 2025 final, in Munich.")],
 "curiosidades-mundial-futbol": [
  ("¿Qué selección ha ganado más Mundiales?", "Which team has won the most World Cups?", "Brasil, con cinco. Alemania e Italia tienen cuatro cada una.", "Brazil, with five. Germany and Italy have four each."),
  ("¿Cuántas selecciones juegan el Mundial?", "How many teams play in the World Cup?", "48 desde 2026. Fueron 13 en 1930, 24 de 1982 a 1994 y 32 de 1998 a 2022.", "48 since 2026. There were 13 in 1930, 24 from 1982 to 1994 and 32 from 1998 to 2022."),
  ("¿Quién ha marcado más goles en un Mundial?", "Who has scored the most goals in one World Cup?", "Just Fontaine, con 13 goles en 1958.", "Just Fontaine, with 13 goals in 1958.")],
 "curiosidades-laliga": [
  ("¿Qué clubes han ganado LaLiga?", "Which clubs have won La Liga?", "Solo nueve: Real Madrid (36), Barcelona (29), Atlético de Madrid (11), Athletic Club (8), Valencia (6), Real Sociedad (2), y Deportivo, Sevilla y Betis (1 cada uno).", "Only nine: Real Madrid (36), Barcelona (29), Atlético de Madrid (11), Athletic Club (8), Valencia (6), Real Sociedad (2), and Deportivo, Sevilla and Betis (1 each)."),
  ("¿Quién fue el máximo goleador de LaLiga 2025-26?", "Who was La Liga's top scorer in 2025–26?", "Kylian Mbappé, con 25 goles.", "Kylian Mbappé, with 25 goals.")],
 "curiosidades-premier-league": [
  ("¿Quién ganó la Premier League 2025-26?", "Who won the 2025–26 Premier League?", "El Arsenal, el 19 de mayo de 2026, 22 años después de su título anterior.", "Arsenal, on 19 May 2026, 22 years after their previous title."),
  ("¿Quiénes fueron los Invencibles?", "Who were the Invincibles?", "El Arsenal de Arsène Wenger, que ganó la Premier de 2003-04 sin perder ningún partido de los 38.", "Arsène Wenger's Arsenal, who won the 2003–04 Premier League without losing any of their 38 games."),
  ("¿Quién es el máximo goleador de la Premier League?", "Who is the Premier League's all-time top scorer?", "Alan Shearer, con 260 goles.", "Alan Shearer, with 260 goals.")],
}

def pagina(L, t):
    es = L.lang == "es"; k = 0 if es else 1
    ruta = "curiosidades/" + t[L.lang] + "/"
    h = cabecera(L, t["t"][k] + " | TIKITEXTO", t["d"][k], ruta, t["t"][k], ICONOS[t["ic"]])
    h = D.alinear(L, h, ruta, t[L.lang], (t["es"], t["en"]))
    h = h.replace(L.ui["checked"], FECHA[k])
    h += f'<div class="caja">{e(t["intro"][k])}</div>\n'
    h += '<p class="indice">' + "".join(f'<a href="#h{i}">{e(x[k])}</a>' for i, x in enumerate(t["hechos"])) + '</p>\n'
    for i, x in enumerate(t["hechos"]):
        h += entrada(L, ICONOS[t["ic"]], str(i + 1), e(x[k]), [e(x[2 + k])], None, f"h{i}")
    h += C.faq(L, FAQ_TEMAS.get(t["es"], []))
    ext, internos = [], []
    for n, u in t["src"]:
        if u in INTERNAS: internos.append((n, L.url("curiosidades/" + INTERNAS[u][k] + "/")))
        else: ext.append(f'<a href="{u}" rel="noopener" target="_blank">{e(n)}</a>')
    h += f'<p class="fecha">{"Fuentes" if es else "Sources"}: {" · ".join(ext)}. {e(FECHA[k])}.</p>\n'
    if internos:
        h += f'<h2>{"Datos relacionados" if es else "Related stats"}</h2>\n<p class="indice">' + "".join(f'<a href="{u}">{e(n.split(" · ")[-1])}</a>' for n, u in internos) + '</p>\n'
    otras = [q for q in T.TEMAS if q is not t][:8]
    h += f'<h2>{"Más curiosidades" if es else "More curiosities"}</h2>\n<p class="indice">' + "".join(f'<a href="{L.url("curiosidades/" + q[L.lang] + "/")}">{e(q["t"][k])}</a>' for q in otras) + f'<a href="{L.url("curiosidades/" + HUB[k] + "/")}">{"Ver todas →" if es else "See all →"}</a></p>\n'
    h += f'<p><a class="jugar" href="{L.play()}">{e("⚽ ¿Cuánto sabes de fútbol? Juega" if es else "⚽ How much do you know about football? Play")}</a></p>\n'
    return ruta, h + pie(L)

def hub(L):
    es = L.lang == "es"; k = 0 if es else 1
    ruta = "curiosidades/" + HUB[k] + "/"
    h = cabecera(L, HUB_T[k] + " | TIKITEXTO", HUB_D[k], ruta, HUB_T[k])
    h = D.alinear(L, h, ruta, HUB[k], HUB)
    h += f'<div class="caja">{e(HUB_D[k])}</div>\n<div class="tarjetas">\n'
    for q in T.TEMAS:
        h += f'<a class="tarjeta" href="{L.url("curiosidades/" + q[L.lang] + "/")}">{ICONOS[q["ic"]]}<b>{e(q["t"][k])}</b><span>{len(q["hechos"])} {"curiosidades" if es else "facts"}</span></a>\n'
    return ruta, h + '</div>\n' + pie(L)

if __name__ == "__main__":
    out = []
    for lg in LANGS:
        L = Idioma(lg)
        for ruta, cont in [hub(L)] + [pagina(L, t) for t in T.TEMAS]:
            cont = C.con_huecos(L, cont)
            d = os.path.join(C.RAIZ, L.prefix + ruta); os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont); out.append(L.prefix + ruta)
    print(len(out), "páginas")
