#!/usr/bin/env python3
"""Estudios estadísticos PROPIOS (es/en): finales de la Champions 2007-2026 y Mundiales 1930-2026.
Todas las cifras se CALCULAN aquí a partir de tools/hist_data.py (UEFA y FIFA); nada se escribe a mano salvo la interpretación.
Orden: curiosidades.py -> curiosidades_datos.py -> curiosidades_historia.py -> curiosidades_estadisticas.py -> curiosidades_temas.py -> ... -> seo.py"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
import curiosidades_datos as D
from curiosidades import e, cabecera, pie, Idioma, COPA, BALON
import hist_data as H
C.LANGS = ["es", "en"]; LANGS = C.LANGS

PAGINAS = [
 dict(es="estadisticas-finales-champions", en="champions-league-finals-statistics", ic=COPA,
      t=("Estadísticas de las finales de la Champions League 2007-2026: clubes, países y asistencia", "Champions League final statistics 2007–2026: clubs, countries and attendance"),
      d=("Estudio propio de TIKITEXTO con las 20 últimas finales de la Champions: quién gana más, qué países dominan, cuántas se deciden en penaltis, goles por final y asistencia media. Con tabla filtrable.",
         "TIKITEXTO's own study of the last 20 Champions League finals: who wins most, which countries dominate, how many go to penalties, goals per final and average attendance. With a filterable table."),
      fecha=("Datos a 31 de octubre de 2026", "Data as of 31 October 2026")),
 dict(es="estadisticas-mundiales", en="world-cup-statistics", ic=BALON,
      t=("Estadísticas de los Mundiales 1930-2026: campeones, anfitriones, finales y goleadores", "World Cup statistics 1930–2026: champions, hosts, finals and top scorers"),
      d=("Estudio propio de TIKITEXTO con los 23 Mundiales: selecciones con más títulos, cuántos anfitriones ganaron, finales en prórroga o penaltis, crecimiento del torneo y goles del máximo goleador. Con tabla filtrable.",
         "TIKITEXTO's own study of the 23 World Cups: nations with most titles, how many hosts won, finals decided in extra time or penalties, the tournament's growth and top scorers' goals. With a filterable table."),
      fecha=("Datos a 19 de julio de 2026", "Data as of 19 July 2026")),
]
PAGINAS += [
 dict(es="estadisticas-copa-de-europa-champions-1956-2026", en="european-cup-champions-league-winners-statistics", ic=COPA, fn="copa_europa",
      t=("Estadísticas de la Copa de Europa y la Champions 1956-2026: campeones por club, país y década", "European Cup and Champions League statistics 1956–2026: winners by club, country and decade"),
      d=("Estudio propio de TIKITEXTO con los 71 campeones de la Copa de Europa y la Champions League: títulos por club y país, rachas, sequías, campeones de una sola vez y quién domina cada década. Con tabla filtrable.",
         "TIKITEXTO's own study of the 71 European Cup and Champions League winners: titles by club and country, streaks, droughts, one-time winners and who dominates each decade. With a filterable table."),
      fecha=("Datos a 24 de noviembre de 2026", "Data as of 24 November 2026")),
 dict(es="estadisticas-eurocopa-1960-2024", en="european-championship-statistics-1960-2024", ic=BALON, fn="eurocopa",
      t=("Estadísticas de la Eurocopa 1960-2024: campeones, anfitriones, finales y crecimiento del torneo", "European Championship statistics 1960–2024: champions, hosts, finals and growth of the tournament"),
      d=("Estudio propio de TIKITEXTO con las 17 ediciones de la Eurocopa: selecciones con más títulos, anfitriones campeones, finales en prórroga o penaltis, goles por final y cómo pasó de 4 a 24 selecciones. Con tabla filtrable.",
         "TIKITEXTO's own study of the 17 European Championships: nations with most titles, hosts that won, finals decided in extra time or on penalties, goals per final and how it grew from 4 to 24 teams. With a filterable table."),
      fecha=("Datos a 24 de noviembre de 2026", "Data as of 24 November 2026")),
]
for p in PAGINAS: D.todas_slugs[p["es"]] = D.todas_slugs[p["en"]] = (p["es"], p["en"])

PAIS_CLUB = {"Milan": "IT", "Inter": "IT", "Juventus": "IT", "Manchester United": "EN", "Chelsea": "EN", "Liverpool": "EN", "Manchester City": "EN", "Tottenham": "EN", "Arsenal": "EN",
             "Barcelona": "ES", "Real Madrid": "ES", "Atlético de Madrid": "ES", "Bayern de Múnich": "DE", "Borussia Dortmund": "DE", "París Saint-Germain": "FR"}
NOM_PAIS = {"IT": ("Italia", "Italy"), "EN": ("Inglaterra", "England"), "ES": ("España", "Spain"), "DE": ("Alemania", "Germany"), "FR": ("Francia", "France")}
CLUB_EN = {"Bayern de Múnich": "Bayern Munich", "Atlético de Madrid": "Atlético Madrid", "París Saint-Germain": "Paris Saint-Germain", "Borussia Dortmund": "Borussia Dortmund"}
CIUDAD_EN = {"Atenas": "Athens", "Moscú": "Moscow", "Roma": "Rome", "Londres": "London", "Múnich": "Munich", "Lisboa": "Lisbon", "Milán": "Milan", "Berlín": "Berlin", "Kiev": "Kyiv", "Oporto": "Porto", "París": "Paris", "Estambul": "Istanbul"}
SEL_EN = {"Brasil": "Brazil", "Alemania": "Germany", "Alemania Occidental": "West Germany", "Italia": "Italy", "Argentina": "Argentina", "Francia": "France", "Uruguay": "Uruguay", "España": "Spain", "Inglaterra": "England"}
SEL_CONT = {"Brasil": "SA", "Argentina": "SA", "Uruguay": "SA", "Italia": "EU", "Alemania Occidental": "EU", "Alemania": "EU", "Francia": "EU", "España": "EU", "Inglaterra": "EU"}

def num(L, n): return f"{n:,}".replace(",", "." if L.lang == "es" else ",")
def dec(L, x, d=1): return (f"{x:.{d}f}").replace(".", "," if L.lang == "es" else ".")
def club(L, c): return c if L.lang == "es" else CLUB_EN.get(c, c)
def marcador(res):
    m = re.match(r"(\d+)-(\d+)", res); return int(m.group(1)), int(m.group(2))

def barras(titulo, datos, color="#2563eb", ancho=600):
    """gráfico de barras horizontales en SVG; datos = [(etiqueta, valor)]"""
    n = len(datos); mx = max(v for _, v in datos) or 1; alto = 24 * n + 12; lm = 150
    s = [f'<svg class="ilustra" viewBox="0 0 {ancho} {alto}" role="img" aria-label="{e(titulo)}" style="max-width:100%;height:auto">']
    for i, (et, v) in enumerate(datos):
        y = 6 + i * 24; w = (ancho - lm - 50) * v / mx
        s.append(f'<text x="{lm - 8}" y="{y + 14}" text-anchor="end" font-size="12" fill="currentColor">{e(et)}</text>')
        s.append(f'<rect x="{lm}" y="{y + 2}" width="{max(w, 1):.1f}" height="16" rx="3" fill="{color}"/>')
        s.append(f'<text x="{lm + w + 6:.1f}" y="{y + 14}" font-size="12" font-weight="700" fill="currentColor">{e(str(v))}</text>')
    return "".join(s) + "</svg>\n"

def columnas(titulo, datos, color="#2563eb", ancho=600, alto=190, unidad=""):
    """gráfico de columnas en SVG; datos = [(etiqueta, valor)]"""
    n = len(datos); mx = max(v for _, v in datos) or 1; base = alto - 30; paso = (ancho - 30) / n
    s = [f'<svg class="ilustra" viewBox="0 0 {ancho} {alto}" role="img" aria-label="{e(titulo)}" style="max-width:100%;height:auto">']
    for i, (et, v) in enumerate(datos):
        h = (base - 20) * v / mx; x = 20 + i * paso
        s.append(f'<rect x="{x:.1f}" y="{base - h:.1f}" width="{paso * 0.7:.1f}" height="{max(h, 1):.1f}" rx="2" fill="{color}"/>')
        s.append(f'<text x="{x + paso * 0.35:.1f}" y="{base - h - 4:.1f}" text-anchor="middle" font-size="9" font-weight="700" fill="currentColor">{e(str(v))}</text>')
        if n <= 24 or i % 2 == 0: s.append(f'<text x="{x + paso * 0.35:.1f}" y="{alto - 14}" text-anchor="middle" font-size="9" fill="currentColor">{e(str(et))}</text>')
    return "".join(s) + "</svg>\n"

def tabla_f(cab, filas, nota):
    t = f'<div class="tabla-scroll"><table data-filtro><thead><tr>' + "".join(f"<th>{e(c)}</th>" for c in cab) + "</tr></thead><tbody>"
    for f in filas: t += "<tr>" + "".join(f"<td>{e(str(c))}</td>" for c in f) + "</tr>"
    return f'<p class="fecha">{e(nota)}</p>' + t + "</tbody></table></div>\n"

def h2(t, id_=None): return f'<h2{(" id=" + chr(34) + id_ + chr(34)) if id_ else ""}>{e(t)}</h2>\n'
def par(*ps): return "".join(f"<p>{x}</p>\n" for x in ps)
def lista(items): return "<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>\n"
SCRIPT = '<script src="/tabla_filtro.js" defer></script>\n'

# ---------------- cálculos ----------------
def calc_champions():
    F = H.CHAMPIONS; r = {}
    r["n"] = len(F)
    tit = {}; fin = {}
    for x in F:
        tit[x[1]] = tit.get(x[1], 0) + 1
        for c in (x[1], x[2]): fin[c] = fin.get(c, 0) + 1
    r["tit"] = sorted(tit.items(), key=lambda kv: (-kv[1], kv[0]))
    r["fin"] = fin
    pais_t = {}; pais_f = {}
    for x in F:
        pais_t[PAIS_CLUB[x[1]]] = pais_t.get(PAIS_CLUB[x[1]], 0) + 1
        for c in (x[1], x[2]): pais_f[PAIS_CLUB[c]] = pais_f.get(PAIS_CLUB[c], 0) + 1
    r["pais_t"] = sorted(pais_t.items(), key=lambda kv: (-kv[1], kv[0])); r["pais_f"] = pais_f
    r["pen"] = [x[0] for x in F if "penaltis" in x[3]]
    r["prorr"] = [x[0] for x in F if "prórroga" in x[3]]
    g = [sum(marcador(x[3])) for x in F]; r["goles"] = sum(g); r["goles_med"] = sum(g) / len(F)
    r["margen1"] = [x[0] for x in F if abs(marcador(x[3])[0] - marcador(x[3])[1]) == 1]
    mm = max(F, key=lambda x: abs(marcador(x[3])[0] - marcador(x[3])[1])); r["mayor"] = mm
    asis = [x for x in F if x[6] >= 50000]; r["asis_n"] = len(asis); r["asis_med"] = sum(x[6] for x in asis) / len(asis)
    r["asis_max"] = max(F, key=lambda x: x[6]); r["asis_min"] = min(asis, key=lambda x: x[6])
    sedes = {}
    for x in F: sedes[x[4]] = sedes.get(x[4], 0) + 1
    r["sedes"] = sorted(sedes.items(), key=lambda kv: (-kv[1], kv[0]))
    r["gana_fin"] = sorted(((c, tit.get(c, 0), fin[c]) for c in fin), key=lambda t: (-t[2], -t[1], t[0]))
    r["sin_perder"] = [c for c, t, f in r["gana_fin"] if t == f and f >= 2]
    r["perdio"] = [(c, f, t) for c, t, f in r["gana_fin"] if t == 0]
    r["repetidos"] = sorted(((c, f) for c, f in fin.items() if f >= 3), key=lambda kv: -kv[1])
    return r

def champions(L, p, k):
    es = L.lang == "es"; r = calc_champions(); F = H.CHAMPIONS
    ruta = "curiosidades/" + p[L.lang] + "/"
    h = cabecera(L, p["t"][k] + " | TIKITEXTO", p["d"][k], ruta, p["t"][k], p["ic"])
    h = D.alinear(L, h, ruta, p[L.lang], (p["es"], p["en"]))
    h = h.replace(L.ui["checked"], p["fecha"][k])
    top = r["tit"][0]; mayor = r["mayor"]; mc = marcador(mayor[3])
    h += f'<div class="caja">{e(p["d"][k])}</div>\n'
    h += SCRIPT
    h += h2("Lo más llamativo en 6 datos" if es else "The key findings in 6 numbers")
    h += lista([
        (f"<b>{club(L, top[0])}</b> ganó {top[1]} de las {r['n']} finales: el {dec(L, 100 * top[1] / r['n'], 0)} % de los títulos de estas dos décadas." if es else f"<b>{club(L, top[0])}</b> won {top[1]} of the {r['n']} finals: {dec(L, 100 * top[1] / r['n'], 0)} % of the titles of these two decades."),
        (f"<b>{NOM_PAIS[r['pais_t'][0][0]][0]}</b> acumula {r['pais_t'][0][1]} títulos, seguida de {NOM_PAIS[r['pais_t'][1][0]][0]} ({r['pais_t'][1][1]})." if es else f"<b>{NOM_PAIS[r['pais_t'][0][0]][1]}</b> has {r['pais_t'][0][1]} titles, followed by {NOM_PAIS[r['pais_t'][1][0]][1]} ({r['pais_t'][1][1]})."),
        (f"<b>{len(r['pen'])} finales</b> se decidieron en los penaltis ({', '.join(map(str, r['pen']))}) y {len(r['prorr'])} en la prórroga." if es else f"<b>{len(r['pen'])} finals</b> were decided on penalties ({', '.join(map(str, r['pen']))}) and {len(r['prorr'])} in extra time."),
        (f"La media es de <b>{dec(L, r['goles_med'], 2)} goles por final</b> ({r['goles']} en {r['n']}), sin contar los penaltis." if es else f"The average is <b>{dec(L, r['goles_med'], 2)} goals per final</b> ({r['goles']} in {r['n']}), not counting penalties."),
        (f"<b>{len(r['margen1'])} de {r['n']}</b> finales se decidieron por un solo gol de diferencia (incluidas las de penaltis). La mayor goleada fue el {mc[0]}-{mc[1]} de {mayor[0]}." if es else f"<b>{len(r['margen1'])} of {r['n']}</b> finals were decided by a single goal (shoot-outs included). The biggest margin was the {mc[0]}-{mc[1]} of {mayor[0]}."),
        (f"La asistencia media, sin contar 2020 (puerta cerrada) ni 2021 (aforo limitado), fue de <b>{num(L, round(r['asis_med']))} espectadores</b>." if es else f"Average attendance, excluding 2020 (behind closed doors) and 2021 (limited capacity), was <b>{num(L, round(r['asis_med']))} spectators</b>."),
    ])
    h += h2("Títulos por club (2007-2026)" if es else "Titles per club (2007–2026)")
    h += barras("Títulos por club" if es else "Titles per club", [(club(L, c), n) for c, n in r["tit"]])
    h += h2("Títulos y finales por país" if es else "Titles and finals by country")
    pais_rows = [(NOM_PAIS[c][0 if es else 1], n, r["pais_f"][c]) for c, n in r["pais_t"]]
    h += C.tabla(("País", "Títulos", "Presencias en la final") if es else ("Country", "Titles", "Final appearances"), pais_rows)
    h += par((f"En 20 finales hay 40 plazas de finalista. {NOM_PAIS['ES'][0]} ocupó {r['pais_f']['ES']}, {NOM_PAIS['EN'][0]} {r['pais_f']['EN']}, {NOM_PAIS['IT'][0]} {r['pais_f']['IT']}, {NOM_PAIS['DE'][0]} {r['pais_f']['DE']} y {NOM_PAIS['FR'][0]} {r['pais_f']['FR']}: solo cinco países han llegado a la final en estas dos décadas." if es else f"In 20 finals there are 40 finalist places. {NOM_PAIS['ES'][1]} took {r['pais_f']['ES']}, {NOM_PAIS['EN'][1]} {r['pais_f']['EN']}, {NOM_PAIS['IT'][1]} {r['pais_f']['IT']}, {NOM_PAIS['DE'][1]} {r['pais_f']['DE']} and {NOM_PAIS['FR'][1]} {r['pais_f']['FR']}: only five countries have reached the final in these two decades."))
    h += h2("Quién convierte las finales en títulos" if es else "Who turns finals into titles")
    h += C.tabla(("Club", "Finales", "Ganadas", "% de victorias") if es else ("Club", "Finals", "Won", "Win rate"),
                 [(club(L, c), f, t, dec(L, 100 * t / f, 0) + " %") for c, t, f in r["gana_fin"] if f >= 2])
    sp = ", ".join(club(L, c) for c in r["sin_perder"]); pr = [(club(L, c), f) for c, f, t in r["perdio"] if f >= 2]
    h += par((f"Dato curioso: {sp} ganó todas las finales que disputó en este periodo. Por el contrario, " + (", ".join(f"{c} perdió {f} finales sin ganar ninguna" for c, f in pr) + "." if pr else "ningún club con varias finales se fue sin título.") if es else f"Interesting fact: {sp} won every final it played in this period. By contrast, " + (", ".join(f"{c} lost {f} finals without winning any" for c, f in pr) + "." if pr else "no club with several finals left without a title.")))
    h += h2("Asistencia a las finales" if es else "Final attendance")
    h += columnas("Asistencia en miles" if es else "Attendance in thousands", [(x[0], round(x[6] / 1000)) for x in F if x[6] >= 50000], color="#0f9d58")
    mx, mn = r["asis_max"], r["asis_min"]
    h += par((f"Fue máxima en {mx[0]} ({e(mx[5])}, {mx[4]}: {num(L, mx[6])}) y mínima, entre las finales con estadio lleno, en {mn[0]} ({num(L, mn[6])}). Los años 2020 (a puerta cerrada, Lisboa) y 2021 (14.110 aficionados en Oporto) no se incluyen en el gráfico ni en la media." if es else f"It peaked in {mx[0]} ({e(mx[5])}, {CIUDAD_EN.get(mx[4], mx[4])}: {num(L, mx[6])}) and was lowest, among full-stadium finals, in {mn[0]} ({num(L, mn[6])}). 2020 (behind closed doors, Lisbon) and 2021 (14,110 fans in Porto) are left out of the chart and the average."))
    h += h2("Ciudades que más finales han acogido" if es else "Cities that hosted the most finals")
    h += lista([f"<b>{e(c if es else CIUDAD_EN.get(c, c))}</b>: {n}" for c, n in r["sedes"] if n >= 2])
    h += h2("Las 20 finales en una tabla filtrable" if es else "All 20 finals in a filterable table")
    rows = [(x[0], club(L, x[1]), club(L, x[2]), D.celda(L, x[3]), x[4] if es else CIUDAD_EN.get(x[4], x[4]), (num(L, x[6]) if x[6] else ("Puerta cerrada" if es else "Closed doors"))) for x in reversed(F)]
    h += tabla_f(("Año", "Campeón", "Subcampeón", "Resultado", "Sede", "Asistencia") if es else ("Year", "Champion", "Runner-up", "Result", "Venue", "Attendance"), rows,
                 "Escribe un club, un año o una ciudad para filtrar; pulsa una cabecera para ordenar." if es else "Type a club, a year or a city to filter; click a header to sort.")
    h += h2("Cómo hemos hecho este estudio" if es else "How we made this study")
    h += par(("Cada cifra de esta página la calcula un programa a partir de las 20 finales recogidas en nuestra página de <a href=\"../champions-20-anos/\">las últimas 20 finales</a>, cuyos marcadores, sedes y asistencias proceden de UEFA.com. Los goles cuentan los marcados en juego (90 minutos y prórroga) y no los de las tandas de penaltis. La interpretación es de TIKITEXTO; si ves un error, escríbenos desde la página de contacto." if es else "Every figure on this page is computed by a program from the 20 finals listed on our <a href=\"../champions-league-last-20-finals/\">last 20 finals</a> page, whose scores, venues and attendances come from UEFA.com. Goals count those scored in play (90 minutes and extra time), not in penalty shoot-outs. The interpretation is by TIKITEXTO; if you spot an error, write to us from the contact page."))
    h += C.faq(L, [
        ("¿Qué club ha ganado más finales de Champions desde 2007?", "Which club has won the most Champions League finals since 2007?",
         f"El Real Madrid, con {top[1]} títulos de las {r['n']} finales disputadas entre 2007 y 2026, y además ganó todas las finales que jugó en ese periodo.", f"Real Madrid, with {top[1]} titles from the {r['n']} finals played between 2007 and 2026, and it also won every final it played in that period."),
        ("¿Cuántas finales de Champions se han decidido en los penaltis?", "How many Champions League finals have gone to penalties?",
         f"De las 20 últimas finales (2007-2026), {len(r['pen'])} se decidieron en los penaltis: {', '.join(map(str, r['pen']))}.", f"Of the last 20 finals (2007–2026), {len(r['pen'])} were decided on penalties: {', '.join(map(str, r['pen']))}."),
        ("¿Cuántos goles se marcan de media en una final de Champions?", "How many goals are scored on average in a Champions League final?",
         f"En las 20 finales de 2007 a 2026 la media es de {dec(L, r['goles_med'], 2)} goles por final, sin contar los penaltis.", f"In the 20 finals from 2007 to 2026 the average is {dec(L, r['goles_med'], 2)} goals per final, not counting penalties."),
        ("¿Qué país ha ganado más Champions League en los últimos 20 años?", "Which country has won the most Champions Leagues in the last 20 years?",
         f"España, con {r['pais_t'][0][1]} títulos (Real Madrid y Barcelona), seguida de Inglaterra con {r['pais_t'][1][1]}.", f"Spain, with {r['pais_t'][0][1]} titles (Real Madrid and Barcelona), followed by England with {r['pais_t'][1][1]}.")])
    src = '<a href="https://www.uefa.com/uefachampionsleague/history/" rel="noopener" target="_blank">UEFA.com · historia de la Champions League</a>'
    h += f'<p class="fecha">{"Fuente de los datos" if es else "Data source"}: {src}. {e(p["fecha"][k])}.</p>\n'
    return ruta, h + pie(L)

def calc_mundiales():
    W = H.MUNDIALES; r = {}
    tit = {}
    for x in W: tit[x[2]] = tit.get(x[2], 0) + 1
    r["tit"] = sorted(tit.items(), key=lambda kv: (-kv[1], kv[0]))
    r["anfit"] = [x for x in W if x[2] in x[1]]
    r["et"] = [x[0] for x in W if "prórroga" in x[4]]; r["pen"] = [x[0] for x in W if "penaltis" in x[4]]
    gf = [sum(marcador(x[4])) for x in W]; r["gf_med"] = sum(gf) / len(W)
    r["cont"] = {"EU": sum(n for s, n in tit.items() if SEL_CONT[s] == "EU"), "SA": sum(n for s, n in tit.items() if SEL_CONT[s] == "SA")}
    gol = []
    for x in W:
        m = re.search(r"\((\d+)\)", x[5]); gol.append((x[0], int(m.group(1))))
    r["gol"] = gol; r["gol_max"] = max(gol, key=lambda t: t[1])
    pre = [g for a, g in gol if a < 1982]; post = [g for a, g in gol if a >= 1982]
    r["pre"] = sum(pre) / len(pre); r["post"] = sum(post) / len(post)
    r["equipos"] = [(x[0], x[6]) for x in W]
    r["finalistas"] = {}
    for x in W:
        for c in (x[2], x[3]): r["finalistas"][c] = r["finalistas"].get(c, 0) + 1
    r["sin_titulo"] = sorted((c, n) for c, n in r["finalistas"].items() if c not in tit)
    return r

def mundiales(L, p, k):
    es = L.lang == "es"; r = calc_mundiales(); W = H.MUNDIALES
    ruta = "curiosidades/" + p[L.lang] + "/"
    h = cabecera(L, p["t"][k] + " | TIKITEXTO", p["d"][k], ruta, p["t"][k], p["ic"])
    h = D.alinear(L, h, ruta, p[L.lang], (p["es"], p["en"]))
    h = h.replace(L.ui["checked"], p["fecha"][k])
    sel = lambda s: s if es else SEL_EN.get(s, s)
    top = r["tit"][0]; gm = r["gol_max"]
    h += f'<div class="caja">{e(p["d"][k])}</div>\n' + SCRIPT
    h += h2("Lo más llamativo en 6 datos" if es else "The key findings in 6 numbers")
    anf = ", ".join(f"{sel(x[2])} {x[0]}" for x in r["anfit"])
    h += lista([
        (f"<b>{sel(top[0])}</b> es la selección con más títulos ({top[1]}), seguida de {', '.join(f'{sel(s)} ({n})' for s, n in r['tit'][1:3])}." if es else f"<b>{sel(top[0])}</b> is the nation with most titles ({top[1]}), followed by {', '.join(f'{sel(s)} ({n})' for s, n in r['tit'][1:3])}."),
        (f"Solo <b>{len(r['anfit'])} de {len(W)}</b> organizadores se llevaron el título en casa: {anf}." if es else f"Only <b>{len(r['anfit'])} of {len(W)}</b> hosts won the title at home: {anf}."),
        (f"Europa suma <b>{r['cont']['EU']} títulos</b> y Sudamérica <b>{r['cont']['SA']}</b>: no ha ganado nunca una selección de otro continente." if es else f"Europe has <b>{r['cont']['EU']} titles</b> and South America <b>{r['cont']['SA']}</b>: no team from another continent has ever won."),
        (f"<b>{len(r['et'])} finales</b> se resolvieron en la prórroga ({', '.join(map(str, r['et']))}) y <b>{len(r['pen'])}</b> en los penaltis ({', '.join(map(str, r['pen']))})." if es else f"<b>{len(r['et'])} finals</b> were settled in extra time ({', '.join(map(str, r['et']))}) and <b>{len(r['pen'])}</b> on penalties ({', '.join(map(str, r['pen']))})."),
        (f"El máximo goleador marcó de media <b>{dec(L, r['pre'])} goles</b> antes de 1982 y <b>{dec(L, r['post'])}</b> desde entonces: más partidos, pero también más defensas organizadas." if es else f"The top scorer averaged <b>{dec(L, r['pre'])} goals</b> before 1982 and <b>{dec(L, r['post'])}</b> since: more matches, but also better-organised defences."),
        (f"El récord de goles de un máximo goleador es de <b>{gm[1]}</b>, en {gm[0]} (Just Fontaine)." if es else f"The record for a top scorer is <b>{gm[1]}</b> goals, in {gm[0]} (Just Fontaine)."),
    ])
    h += h2("Títulos por selección" if es else "Titles per nation")
    h += barras("Títulos por selección" if es else "Titles per nation", [(sel(s), n) for s, n in r["tit"]], color="#d97706")
    h += par("Alemania Occidental y Alemania se cuentan juntas para esta comparación (1954, 1974, 1990 y 2014)." if es else "West Germany and Germany are counted together for this comparison (1954, 1974, 1990 and 2014).")
    h += h2("El torneo ha crecido: selecciones por edición" if es else "The tournament has grown: teams per edition")
    h += columnas("Selecciones por edición" if es else "Teams per edition", [(a, n) for a, n in r["equipos"]], color="#2563eb")
    h += par("De 13 equipos en 1930 se pasó a 16 (1934), 24 (1982), 32 (1998) y 48 (2026): cada ampliación aumentó los partidos y las plazas de las confederaciones." if es else "From 13 teams in 1930 it went to 16 (1934), 24 (1982), 32 (1998) and 48 (2026): each expansion raised the number of matches and the places for the confederations.")
    h += h2("Goles del máximo goleador en cada Mundial" if es else "Goals by the top scorer at each World Cup")
    h += columnas("Goles del máximo goleador" if es else "Top scorer goals", r["gol"], color="#dc2626")
    h += par((f"En 1962 hubo seis jugadores empatados con 4 goles, y la cifra de 1994 corresponde a dos jugadores con 6. El pico fue el de Fontaine (13 en 1958); el siguiente, Kocsis (11 en 1954)." if es else "In 1962 six players tied on 4 goals, and the 1994 figure belongs to two players on 6. The peak was Fontaine's 13 in 1958; next came Kocsis with 11 in 1954."))
    h += h2("Finalistas que nunca ganaron" if es else "Finalists who never won")
    h += par((", ".join(f"{sel(c)} ({n} {'final' if n == 1 else 'finales'})" for c, n in r["sin_titulo"]) + "." if es else ", ".join(f"{sel(c)} ({n} {'final' if n == 1 else 'finals'})" for c, n in r["sin_titulo"]) + "."))
    h += h2("Los 23 Mundiales en una tabla filtrable" if es else "All 23 World Cups in a filterable table")
    rows = [(x[0], x[1] if es else {"Estados Unidos, México y Canadá": "USA, Mexico & Canada", "Corea del Sur y Japón": "South Korea & Japan"}.get(x[1], SEL_EN.get(x[1], D.P(L, x[1]))),
             sel(x[2]), sel(x[3]), D.celda(L, x[4]), x[5].replace("Seis jugadores", "Six players") if not es else x[5], x[6]) for x in reversed(W)]
    h += tabla_f(("Año", "Sede", "Campeón", "Subcampeón", "Final", "Máximo goleador", "Selecciones") if es else ("Year", "Host", "Champion", "Runner-up", "Final", "Top scorer", "Teams"), rows,
                 "Escribe una selección, un año o un jugador para filtrar; pulsa una cabecera para ordenar." if es else "Type a nation, a year or a player to filter; click a header to sort.")
    h += h2("Cómo hemos hecho este estudio" if es else "How we made this study")
    h += par(("Las cifras las calcula un programa a partir de las 23 ediciones de nuestra página <a href=\"../mundiales-edicion-por-edicion/\">todos los Mundiales, edición por edición</a>, con datos de FIFA.com. Contamos Alemania Occidental y Alemania como una sola selección en la clasificación de títulos. Los goles de las finales no incluyen las tandas de penaltis. La interpretación es de TIKITEXTO." if es else "A program computes the figures from the 23 editions on our <a href=\"../world-cups-edition-by-edition/\">every World Cup, edition by edition</a> page, with data from FIFA.com. We count West Germany and Germany as one nation in the title ranking. Final goals do not include penalty shoot-outs. The interpretation is by TIKITEXTO."))
    h += C.faq(L, [
        ("¿Cuántos anfitriones han ganado el Mundial?", "How many hosts have won the World Cup?",
         f"{len(r['anfit'])} de 23: {anf}.", f"{len(r['anfit'])} of 23: {anf}."),
        ("¿Qué continente ha ganado más Mundiales?", "Which continent has won the most World Cups?",
         f"Europa, con {r['cont']['EU']} títulos frente a los {r['cont']['SA']} de Sudamérica. No ha ganado nunca una selección de otro continente.", f"Europe, with {r['cont']['EU']} titles against South America's {r['cont']['SA']}. No team from any other continent has ever won."),
        ("¿Cuántas finales del Mundial se han decidido en los penaltis?", "How many World Cup finals have gone to penalties?",
         f"{len(r['pen'])}: {', '.join(map(str, r['pen']))}.", f"{len(r['pen'])}: {', '.join(map(str, r['pen']))}."),
        ("¿Cuántas selecciones han ganado el Mundial?", "How many nations have won the World Cup?",
         f"{len(r['tit'])} selecciones, contando Alemania Occidental y Alemania como una: " + ", ".join(f"{s} ({n})" for s, n in r["tit"]) + ".",
         f"{len(r['tit'])} nations, counting West Germany and Germany as one: " + ", ".join(f"{SEL_EN.get(s, s)} ({n})" for s, n in r["tit"]) + ".")])
    src = '<a href="https://www.fifa.com/en/tournaments/mens/worldcup" rel="noopener" target="_blank">FIFA.com · Copa Mundial de la FIFA</a>'
    h += f'<p class="fecha">{"Fuente de los datos" if es else "Data source"}: {src}. {e(p["fecha"][k])}.</p>\n'
    return ruta, h + pie(L)


# ---------------- Copa de Europa / Champions 1956-2026 (campeones) ----------------
PAIS_C = {"Real Madrid": "ES", "Barcelona": "ES", "Benfica": "PT", "Oporto": "PT", "Milan": "IT", "Inter": "IT", "Juventus": "IT", "Celtic": "SC", "Manchester United": "EN", "Liverpool": "EN",
          "Nottingham Forest": "EN", "Aston Villa": "EN", "Chelsea": "EN", "Manchester City": "EN", "Feyenoord": "NL", "Ajax": "NL", "PSV Eindhoven": "NL", "Bayern de Múnich": "DE", "Hamburgo": "DE",
          "Borussia Dortmund": "DE", "Steaua de Bucarest": "RO", "Estrella Roja": "YU", "Olympique de Marsella": "FR", "París Saint-Germain": "FR"}
NOM_C = {"ES": ("España", "Spain"), "EN": ("Inglaterra", "England"), "IT": ("Italia", "Italy"), "DE": ("Alemania", "Germany"), "FR": ("Francia", "France"), "NL": ("Países Bajos", "Netherlands"),
         "PT": ("Portugal", "Portugal"), "SC": ("Escocia", "Scotland"), "RO": ("Rumanía", "Romania"), "YU": ("Yugoslavia (hoy Serbia)", "Yugoslavia (now Serbia)")}
CLUB_EN_C = {"Bayern de Múnich": "Bayern Munich", "París Saint-Germain": "Paris Saint-Germain", "Hamburgo": "Hamburg", "Steaua de Bucarest": "Steaua Bucharest", "Oporto": "Porto",
             "Estrella Roja": "Red Star Belgrade", "Olympique de Marsella": "Marseille", "Atlético de Madrid": "Atlético Madrid"}
GRANDES5 = {"ES", "EN", "IT", "DE", "FR"}
def cclub(L, c): return c if L.lang == "es" else CLUB_EN_C.get(c, c)
def cpais(L, c): return NOM_C[c][0 if L.lang == "es" else 1]

def rachas(W, clave):
    out = []; cur = [W[0]]
    for a, b in zip(W, W[1:]):
        if clave(a) == clave(b): cur.append(b)
        else: out.append(cur); cur = [b]
    out.append(cur)
    return sorted(out, key=lambda r: (-len(r), r[0][0]))

def calc_copa():
    W = C.CHAMPIONS; r = {"W": W, "n": len(W)}
    tit = {}
    for y, c in W: tit[c] = tit.get(c, 0) + 1
    r["tit"] = sorted(tit.items(), key=lambda kv: (-kv[1], kv[0]))
    pt = {}; pc = {}
    for y, c in W:
        pt[PAIS_C[c]] = pt.get(PAIS_C[c], 0) + 1; pc.setdefault(PAIS_C[c], set()).add(c)
    r["pais"] = sorted(pt.items(), key=lambda kv: (-kv[1], kv[0])); r["pais_clubs"] = {k: len(v) for k, v in pc.items()}
    r["distintos"] = len(tit)
    r["unicos"] = sorted([c for c, n in tit.items() if n == 1], key=lambda c: [y for y, x in W if x == c][0])
    primera = {}
    for y, c in W: primera.setdefault(c, y)
    r["primera"] = primera
    ultimo = {}
    for y, c in W: ultimo[c] = y
    r["ultimo"] = ultimo
    # décadas
    decs = sorted({y // 10 * 10 for y, c in W})
    r["decs"] = decs
    r["dec_pais"] = {d: {} for d in decs}; r["dec_club"] = {d: {} for d in decs}; r["dec_nuevos"] = {d: 0 for d in decs}
    for y, c in W:
        d = y // 10 * 10
        r["dec_pais"][d][PAIS_C[c]] = r["dec_pais"][d].get(PAIS_C[c], 0) + 1
        r["dec_club"][d][c] = r["dec_club"][d].get(c, 0) + 1
        if primera[c] == y: r["dec_nuevos"][d] += 1
    r["dec_n"] = {d: sum(1 for y, c in W if y // 10 * 10 == d) for d in decs}
    r["dec_dist"] = {d: len(r["dec_club"][d]) for d in decs}
    r["rach_club"] = rachas(W, lambda x: x[1])[:5]; r["rach_pais"] = rachas(W, lambda x: PAIS_C[x[1]])[:5]
    # sequías (años entre dos títulos seguidos del mismo club) y espera actual
    gaps = []
    for c in tit:
        ys = [y for y, x in W if x == c]
        for a, b in zip(ys, ys[1:]): gaps.append((b - a, c, a, b))
    r["gaps"] = sorted(gaps, key=lambda g: (-g[0], g[1]))[:5]
    r["espera"] = sorted(((2026 - ultimo[c], c, ultimo[c]) for c in tit), key=lambda t: (-t[0], t[1]))
    # campeones de fuera de los cinco grandes países
    fuera = [(y, c) for y, c in W if PAIS_C[c] not in GRANDES5]
    r["fuera"] = fuera; r["fuera_ult"] = fuera[-1]
    r["fuera_dec"] = {d: sum(1 for y, c in fuera if y // 10 * 10 == d) for d in decs}
    # título nº de cada edición
    cuenta = {}; num_t = []
    for y, c in W:
        cuenta[c] = cuenta.get(c, 0) + 1; num_t.append(cuenta[c])
    r["num"] = num_t
    r["revalida"] = sum(1 for a, b in zip(W, W[1:]) if a[1] == b[1])
    r["top3"] = sum(n for c, n in r["tit"][:3])
    return r

def copa_europa(L, p, k):
    es = L.lang == "es"; r = calc_copa(); W = r["W"]; n = r["n"]
    ruta = "curiosidades/" + p[L.lang] + "/"
    h = cabecera(L, p["t"][k] + " | TIKITEXTO", p["d"][k], ruta, p["t"][k], p["ic"])
    h = D.alinear(L, h, ruta, p[L.lang], (p["es"], p["en"]))
    h = h.replace(L.ui["checked"], p["fecha"][k])
    assert r["tit"][0][1] > 2 * r["tit"][1][1]
    top = r["tit"][0]; rc = r["rach_club"][0]; rp = r["rach_pais"]; gap = r["gaps"][0]
    uni = r["unicos"]; cl = lambda c: cclub(L, c); pa = lambda c: cpais(L, c)
    h += f'<div class="caja">{e(p["d"][k])}</div>\n' + SCRIPT
    h += h2("Lo más llamativo en 7 datos" if es else "The key findings in 7 numbers")
    h += lista([
        (f"<b>{cl(top[0])}</b> ha ganado {top[1]} de las {n} ediciones ({dec(L, 100 * top[1] / n, 0)} %), más del doble que el siguiente, {cl(r['tit'][1][0])} ({r['tit'][1][1]})." if es else f"<b>{cl(top[0])}</b> has won {top[1]} of the {n} editions ({dec(L, 100 * top[1] / n, 0)} %), more than double the next club, {cl(r['tit'][1][0])} ({r['tit'][1][1]})."),
        (f"Solo <b>{r['distintos']} clubes</b> han ganado el torneo en {n} ediciones, y los tres que más lo han hecho suman {r['top3']} títulos ({dec(L, 100 * r['top3'] / n, 0)} %)." if es else f"Only <b>{r['distintos']} clubs</b> have won the tournament in {n} editions, and the top three alone account for {r['top3']} titles ({dec(L, 100 * r['top3'] / n, 0)} %)."),
        (f"<b>{pa(r['pais'][0][0])}</b> lidera por países con {r['pais'][0][1]} títulos, por delante de {pa(r['pais'][1][0])} ({r['pais'][1][1]}) e {pa(r['pais'][2][0])} ({r['pais'][2][1]})." if es else f"<b>{pa(r['pais'][0][0])}</b> leads by country with {r['pais'][0][1]} titles, ahead of {pa(r['pais'][1][0])} ({r['pais'][1][1]}) and {pa(r['pais'][2][0])} ({r['pais'][2][1]})."),
        (f"La mayor racha de un club son <b>{len(rc)} títulos seguidos</b> ({cl(rc[0][1])}, {rc[0][0]}-{rc[-1][0]}); la de un país, <b>{len(rp[0])}</b> ({pa(PAIS_C[rp[0][0][1]])}, {rp[0][0][0]}-{rp[0][-1][0]})." if es else f"The longest run by a club is <b>{len(rc)} titles in a row</b> ({cl(rc[0][1])}, {rc[0][0]}–{rc[-1][0]}); by a country, <b>{len(rp[0])}</b> ({pa(PAIS_C[rp[0][0][1]])}, {rp[0][0][0]}–{rp[0][-1][0]})."),
        (f"La sequía más larga entre dos títulos del mismo club fue la de <b>{cl(gap[1])}: {gap[0]} años</b> ({gap[2]}-{gap[3]})." if es else f"The longest drought between two titles for the same club was <b>{cl(gap[1])}'s: {gap[0]} years</b> ({gap[2]}–{gap[3]})."),
        (f"<b>{len(uni)} clubes</b> ganaron una sola vez y no han repetido: {', '.join(cl(c) for c in uni)}." if es else f"<b>{len(uni)} clubs</b> won once and have not repeated: {', '.join(cl(c) for c in uni)}."),
        (f"El último campeón de fuera de los cinco grandes países (España, Inglaterra, Italia, Alemania y Francia) fue el <b>{cl(r['fuera_ult'][1])} en {r['fuera_ult'][0]}</b>." if es else f"The last champion from outside the big five countries (Spain, England, Italy, Germany and France) was <b>{cl(r['fuera_ult'][1])} in {r['fuera_ult'][0]}</b>."),
    ])
    h += h2(f"Títulos por club ({n} ediciones)" if es else f"Titles per club ({n} editions)")
    h += barras("Títulos por club" if es else "Titles per club", [(cl(c), t) for c, t in r["tit"]], color="#2563eb")
    h += par((f"Los {len(uni)} clubes de un solo título son una prueba de lo cerrado que está el palmarés: de los {r['distintos']} campeones, {len([1 for c, t in r['tit'] if t >= 3])} tienen tres o más copas y concentran {sum(t for c, t in r['tit'] if t >= 3)} de los {n} títulos." if es else f"The {len(uni)} one-time winners show how closed the roll of honour is: of the {r['distintos']} champions, {len([1 for c, t in r['tit'] if t >= 3])} have three or more cups and hold {sum(t for c, t in r['tit'] if t >= 3)} of the {n} titles."))
    h += h2("Títulos por país" if es else "Titles per country")
    h += barras("Títulos por país" if es else "Titles per country", [(pa(c), t) for c, t in r["pais"]], color="#0f9d58")
    h += C.tabla(("País", "Títulos", "Clubes distintos campeones") if es else ("Country", "Titles", "Different winning clubs"), [(pa(c), t, r["pais_clubs"][c]) for c, t in r["pais"]])
    h += par((f"Inglaterra reparte sus {dict(r['pais'])['EN']} títulos entre {r['pais_clubs']['EN']} clubes distintos; España concentra sus {dict(r['pais'])['ES']} en solo {r['pais_clubs']['ES']} clubes (Real Madrid y Barcelona)." if es else f"England spreads its {dict(r['pais'])['EN']} titles across {r['pais_clubs']['EN']} different clubs; Spain concentrates all {dict(r['pais'])['ES']} in just {r['pais_clubs']['ES']} clubs (Real Madrid and Barcelona)."))
    h += h2("Década a década: quién ganó" if es else "Decade by decade: who won")
    h += columnas("Clubes distintos campeones por década" if es else "Different champion clubs per decade", [(f"{d}s", r["dec_dist"][d]) for d in r["decs"]], color="#7c3aed")
    filas = []
    for d in r["decs"]:
        lider = sorted(r["dec_club"][d].items(), key=lambda kv: (-kv[1], kv[0]))
        pl = sorted(r["dec_pais"][d].items(), key=lambda kv: (-kv[1], kv[0]))
        filas.append((f"{d}s", r["dec_n"][d], ", ".join(f"{cl(c)} ({t})" for c, t in lider[:2]), ", ".join(f"{pa(c)} ({t})" for c, t in pl[:2]), r["dec_dist"][d]))
    h += C.tabla(("Década", "Ediciones", "Clubes con más títulos", "Países con más títulos", "Clubes distintos") if es else ("Decade", "Editions", "Clubs with most titles", "Countries with most titles", "Different clubs"), filas)
    h += par((f"La década de 1950 solo tiene {r['dec_n'][1950]} ediciones (la Copa empezó en 1956) y la de 2020, {r['dec_n'][2020]} hasta 2026. Las décadas más repartidas fueron las de {' y '.join(str(d) + 's' for d in r['decs'] if r['dec_dist'][d] == max(r['dec_dist'].values()))}, con {max(r['dec_dist'].values())} campeones distintos." if es else f"The 1950s have only {r['dec_n'][1950]} editions (the Cup began in 1956) and the 2020s {r['dec_n'][2020]} up to 2026. The most evenly spread decades were the {' and '.join(str(d) + 's' for d in r['decs'] if r['dec_dist'][d] == max(r['dec_dist'].values()))}, with {max(r['dec_dist'].values())} different champions."))
    h += h2("Rachas: los reinados más largos" if es else "Streaks: the longest reigns")
    filas = [(cl(x[0][1]), len(x), f"{x[0][0]}-{x[-1][0]}") for x in r["rach_club"] if len(x) >= 2]
    h += C.tabla(("Club", "Títulos seguidos", "Años") if es else ("Club", "Titles in a row", "Years"), filas)
    filas = [(pa(PAIS_C[x[0][1]]), len(x), f"{x[0][0]}-{x[-1][0]}") for x in r["rach_pais"] if len(x) >= 3]
    h += par("Y por países, las series de campeones del mismo país:" if es else "And by country, the runs of champions from the same country:")
    h += C.tabla(("País", "Ediciones seguidas", "Años") if es else ("Country", "Editions in a row", "Years"), filas)
    larg = sum(len(x) - 1 for x in rachas(W, lambda x: x[1]) if len(x) >= 3); nlarg = sum(1 for x in rachas(W, lambda x: x[1]) if len(x) >= 3)
    assert r["revalida"] / (n - 1) < 0.25 and r["revalida"] > 0
    h += par((f"Solo {r['revalida']} veces de {n - 1} posibles el campeón logró revalidar el título la temporada siguiente: menos de una de cada cuatro. Además, {larg} de esas {r['revalida']} repeticiones pertenecen a las {nlarg} series de tres o más títulos seguidos (Real Madrid 1956-1960, Ajax, Bayern y Real Madrid 2016-2018)." if es else f"Only {r['revalida']} times out of {n - 1} possible did the champion retain the title the following season: fewer than one in four. Moreover, {larg} of those {r['revalida']} repeats belong to the {nlarg} streaks of three or more titles (Real Madrid 1956–1960, Ajax, Bayern and Real Madrid 2016–2018)."))
    h += h2("Sequías: cuánto se puede tardar en volver a ganar" if es else "Droughts: how long a club can wait")
    h += C.tabla(("Club", "Entre los títulos de", "Años de espera") if es else ("Club", "Between the titles of", "Years waited"), [(cl(c), f"{a} y {b}" if es else f"{a} and {b}", g) for g, c, a, b in r["gaps"]])
    h += par("Cuenta solo el tiempo entre dos títulos del mismo club; la espera actual de los clubes que no ganan desde hace más tiempo está en la tabla siguiente." if es else "This counts only the time between two titles of the same club; the current wait of the clubs that have gone longest without winning is in the next table.")
    h += C.tabla(("Club", "Último título", "Años sin ganar (hasta 2026)") if es else ("Club", "Last title", "Years without winning (to 2026)"), [(cl(c), y, a) for a, c, y in r["espera"][:8]])
    h += h2("Los campeones de fuera de los cinco grandes países" if es else "Champions from outside the big five countries")
    h += columnas("Títulos de campeones de fuera de ES/EN/IT/DE/FR por década" if es else "Titles from outside ES/EN/IT/DE/FR per decade", [(f"{d}s", r["fuera_dec"][d]) for d in r["decs"]], color="#d97706")
    assert {c for y, c in r["fuera"]} == {"Benfica", "Celtic", "Feyenoord", "Ajax", "Steaua de Bucarest", "Oporto", "PSV Eindhoven", "Estrella Roja"} and all(PAIS_C[c] in GRANDES5 for y, c in W if y > r["fuera_ult"][0])
    h += par((f"Entre 1956 y 2026 hubo {len(r['fuera'])} títulos de clubes de países distintos de España, Inglaterra, Italia, Alemania y Francia: Benfica, Celtic, Feyenoord, Ajax, Steaua, Oporto, PSV y Estrella Roja. Desde {r['fuera_ult'][0]}, último año con un campeón de fuera del grupo, los {2026 - r['fuera_ult'][0]} títulos siguientes han ido a esos cinco países." if es else f"Between 1956 and 2026 there were {len(r['fuera'])} titles won by clubs from countries other than Spain, England, Italy, Germany and France: Benfica, Celtic, Feyenoord, Ajax, Steaua, Porto, PSV and Red Star. Since {r['fuera_ult'][0]}, the last year with a champion from outside the group, the next {2026 - r['fuera_ult'][0]} titles have all gone to those five countries."))
    h += h2(f"Las {n} ediciones en una tabla filtrable" if es else f"All {n} editions in a filterable table")
    rows = [(y, cl(c), pa(PAIS_C[c]), r["num"][i]) for i, (y, c) in reversed(list(enumerate(W)))]
    h += tabla_f(("Año", "Campeón", "País", "Título nº del club") if es else ("Year", "Champion", "Country", "Club's title no."), rows,
                 "Escribe un club, un país o un año para filtrar; pulsa una cabecera para ordenar." if es else "Type a club, a country or a year to filter; click a header to sort.")
    h += h2("Cómo hemos hecho este estudio" if es else "How we made this study")
    h += par(("Todas las cifras las calcula un programa a partir de la lista de campeones de la Copa de Europa (1956-1992) y la Champions League (desde 1993) que usamos en nuestras páginas de campeones, contrastada con UEFA.com. Una «sequía» es el tiempo entre dos títulos consecutivos del mismo club; la «espera» se cuenta hasta 2026. Cada país se asigna según el club (el Estrella Roja de 1991 representa a Yugoslavia). La interpretación es de TIKITEXTO; si ves un error, escríbenos desde la página de contacto." if es else "Every figure is calculated by a program from the list of European Cup (1956–1992) and Champions League (from 1993) winners that we use on our champions pages, checked against UEFA.com. A “drought” is the time between two consecutive titles of the same club; the “wait” is counted up to 2026. Each country is assigned by club (Red Star in 1991 stands for Yugoslavia). The interpretation is TIKITEXTO's; if you spot a mistake, write to us from the contact page."))
    h += C.faq(L, [
        ("¿Quién ha ganado más Copas de Europa y Champions League?", "Who has won the most European Cups and Champions Leagues?",
         f"El Real Madrid, con {top[1]} títulos en {n} ediciones; le siguen {cl(r['tit'][1][0])} ({r['tit'][1][1]}) y, con {r['tit'][2][1]} cada uno, {cl(r['tit'][2][0])} y {cl(r['tit'][3][0])}.",
         f"Real Madrid, with {top[1]} titles in {n} editions; next come {cl(r['tit'][1][0])} ({r['tit'][1][1]}) and, with {r['tit'][2][1]} each, {cl(r['tit'][2][0])} and {cl(r['tit'][3][0])}."),
        ("¿Qué país tiene más Champions League?", "Which country has the most Champions League titles?",
         f"España, con {r['pais'][0][1]} títulos, seguida de Inglaterra ({r['pais'][1][1]}) e Italia ({r['pais'][2][1]}).", f"Spain, with {r['pais'][0][1]} titles, followed by England ({r['pais'][1][1]}) and Italy ({r['pais'][2][1]})."),
        ("¿Cuál es la mayor racha de títulos consecutivos?", "What is the longest run of consecutive titles?",
         f"Cinco: el Real Madrid ganó las cinco primeras ediciones (1956-1960). Después han ganado tres seguidas el Ajax (1971-1973), el Bayern (1974-1976) y el Real Madrid (2016-2018).", f"Five: Real Madrid won the first five editions (1956–1960). Since then Ajax (1971–1973), Bayern (1974–1976) and Real Madrid (2016–2018) have each won three in a row."),
        ("¿Cuántos clubes distintos han sido campeones de Europa?", "How many different clubs have been European champions?",
         f"{r['distintos']} clubes en {n} ediciones. De ellos, {len(uni)} han ganado una sola vez: {', '.join(cl(c) for c in uni)}.", f"{r['distintos']} clubs in {n} editions. Of them, {len(uni)} have won only once: {', '.join(cl(c) for c in uni)}."),
        ("¿Cuándo ganó por última vez un club de fuera de los cinco grandes países?", "When did a club from outside the big five countries last win?",
         f"En {r['fuera_ult'][0]}, con el {cl(r['fuera_ult'][1])}. Desde entonces todos los campeones han sido de España, Inglaterra, Italia, Alemania o Francia.", f"In {r['fuera_ult'][0]}, with {cl(r['fuera_ult'][1])}. Since then every champion has come from Spain, England, Italy, Germany or France.")])
    src = '<a href="https://www.uefa.com/uefachampionsleague/history/" rel="noopener" target="_blank">UEFA.com · historia de la Champions League</a>'
    h += f'<p class="fecha">{"Fuente de los datos" if es else "Data source"}: {src}. {e(p["fecha"][k])}.</p>\n'
    return ruta, h + pie(L)

# ---------------- Eurocopa 1960-2024 ----------------
# (año, sede, campeón, subcampeón, resultado, selecciones, nota)  — UEFA.com; 1968: la final se repitió (1-1 y 2-0)
EURO = [
 (1960, "Francia", "Unión Soviética", "Yugoslavia", "2-1 (prórroga)", 4), (1964, "España", "España", "Unión Soviética", "2-1", 4),
 (1968, "Italia", "Italia", "Yugoslavia", "1-1 y 2-0 en el desempate", 4), (1972, "Bélgica", "Alemania Occidental", "Unión Soviética", "3-0", 4),
 (1976, "Yugoslavia", "Checoslovaquia", "Alemania Occidental", "2-2 (5-3 en penaltis)", 4), (1980, "Italia", "Alemania Occidental", "Bélgica", "2-1", 8),
 (1984, "Francia", "Francia", "España", "2-0", 8), (1988, "Alemania Occidental", "Países Bajos", "Unión Soviética", "2-0", 8),
 (1992, "Suecia", "Dinamarca", "Alemania", "2-0", 8), (1996, "Inglaterra", "Alemania", "República Checa", "2-1 (gol de oro)", 16),
 (2000, "Bélgica y Países Bajos", "Francia", "Italia", "2-1 (gol de oro)", 16), (2004, "Portugal", "Grecia", "Portugal", "1-0", 16),
 (2008, "Austria y Suiza", "España", "Alemania", "1-0", 16), (2012, "Polonia y Ucrania", "España", "Italia", "4-0", 16),
 (2016, "Francia", "Portugal", "Francia", "1-0 (prórroga)", 24), (2020, "11 países (jugada en 2021)", "Italia", "Inglaterra", "1-1 (3-2 en penaltis)", 24),
 (2024, "Alemania", "España", "Inglaterra", "2-1", 24)]
SEL_EU = {"Unión Soviética": "Soviet Union", "Yugoslavia": "Yugoslavia", "España": "Spain", "Italia": "Italy", "Alemania Occidental": "West Germany", "Checoslovaquia": "Czechoslovakia", "Bélgica": "Belgium",
          "Francia": "France", "Países Bajos": "Netherlands", "Dinamarca": "Denmark", "Alemania": "Germany", "República Checa": "Czech Republic", "Grecia": "Greece", "Portugal": "Portugal", "Inglaterra": "England",
          "Suecia": "Sweden", "Austria y Suiza": "Austria and Switzerland", "Bélgica y Países Bajos": "Belgium and the Netherlands", "Polonia y Ucrania": "Poland and Ukraine",
          "11 países (jugada en 2021)": "11 countries (played in 2021)"}
def seu(L, s): return s if L.lang == "es" else SEL_EU.get(s, s)
def celda_eu(L, v):
    if L.lang == "es": return v
    for a, b in (("(prórroga)", "(a.e.t.)"), ("(gol de oro)", "(golden goal)"), ("(5-3 en penaltis)", "(5–3 on pens)"), ("(3-2 en penaltis)", "(3–2 on pens)"), ("1-1 y 2-0 en el desempate", "1–1 and 2–0 in the replay")): v = v.replace(a, b)
    return v
def marc_eu(res):
    m = re.match(r"(\d+)-(\d+)", res); a, b = int(m.group(1)), int(m.group(2))
    if res.startswith("1-1 y 2-0"): a, b = 2, 0
    return a, b

def calc_euro():
    r = {"E": EURO, "n": len(EURO)}
    tit = {}
    unif = {"Alemania Occidental": "Alemania"}
    for x in EURO:
        s = unif.get(x[2], x[2]); tit[s] = tit.get(s, 0) + 1
    r["tit"] = sorted(tit.items(), key=lambda kv: (-kv[1], kv[0]))
    fin = {}
    for x in EURO:
        for s in (x[2], x[3]): s = unif.get(s, s); fin[s] = fin.get(s, 0) + 1
    r["fin"] = fin
    r["perd"] = sorted(((s, n) for s, n in fin.items() if s not in tit), key=lambda t: (-t[1], t[0]))
    r["perdidas"] = {s: fin[s] - tit.get(s, 0) for s in fin}
    r["anf"] = [x[0] for x in EURO if x[1] == x[2]]
    r["anf_final"] = [x[0] for x in EURO if x[1] == x[3]]
    r["pror"] = [x[0] for x in EURO if "prórroga" in x[4] or "gol de oro" in x[4]]
    r["pen"] = [x[0] for x in EURO if "penaltis" in x[4]]
    g = [sum(marc_eu(x[4])) for x in EURO]; r["goles"] = sum(g); r["goles_med"] = sum(g) / len(EURO)
    r["gol1"] = [x[0] for x in EURO if abs(marc_eu(x[4])[0] - marc_eu(x[4])[1]) == 1]
    r["mayor"] = max(EURO, key=lambda x: abs(marc_eu(x[4])[0] - marc_eu(x[4])[1]))
    r["equipos"] = [(x[0], x[5]) for x in EURO]
    r["revalida"] = [(a[0], b[0], unif.get(a[2], a[2])) for a, b in zip(EURO, EURO[1:]) if unif.get(a[2], a[2]) == unif.get(b[2], b[2])]
    r["este"] = [x[0] for x in EURO if x[2] in ("Unión Soviética", "Checoslovaquia")]
    return r

def eurocopa(L, p, k):
    es = L.lang == "es"; r = calc_euro(); E = r["E"]; n = r["n"]; sl = lambda s: seu(L, s)
    ruta = "curiosidades/" + p[L.lang] + "/"
    h = cabecera(L, p["t"][k] + " | TIKITEXTO", p["d"][k], ruta, p["t"][k], p["ic"])
    h = D.alinear(L, h, ruta, p[L.lang], (p["es"], p["en"]))
    h = h.replace(L.ui["checked"], p["fecha"][k])
    top = r["tit"][0]; mayor = r["mayor"]; mm = marc_eu(mayor[4]); perd = r["perd"]
    h += f'<div class="caja">{e(p["d"][k])}</div>\n' + SCRIPT
    h += h2("Lo más llamativo en 6 datos" if es else "The key findings in 6 numbers")
    h += lista([
        (f"<b>{sl(top[0])}</b> es la selección con más Eurocopas ({top[1]}), seguida de {sl(r['tit'][1][0])} ({r['tit'][1][1]}) y, con {r['tit'][2][1]} cada una, {' y '.join(sl(s) for s, t in r['tit'] if t == r['tit'][2][1])} (Alemania incluye a Alemania Occidental)." if es else f"<b>{sl(top[0])}</b> is the nation with most European Championships ({top[1]}), followed by {sl(r['tit'][1][0])} ({r['tit'][1][1]}) and, with {r['tit'][2][1]} each, {' and '.join(sl(s) for s, t in r['tit'] if t == r['tit'][2][1])} (Germany includes West Germany)."),
        (f"Solo <b>{len(r['anf'])} de {n}</b> anfitriones levantaron el trofeo en casa ({', '.join(map(str, r['anf']))}), y {len(r['anf_final'])} más perdieron la final que jugaron como locales ({', '.join(map(str, r['anf_final']))})." if es else f"Only <b>{len(r['anf'])} of {n}</b> hosts lifted the trophy at home ({', '.join(map(str, r['anf']))}), and {len(r['anf_final'])} more lost a final they played as hosts ({', '.join(map(str, r['anf_final']))})."),
        (f"<b>{len(r['pror'])} finales</b> necesitaron la prórroga o el gol de oro ({', '.join(map(str, r['pror']))}) y <b>{len(r['pen'])}</b> se decidieron en los penaltis ({', '.join(map(str, r['pen']))})." if es else f"<b>{len(r['pror'])} finals</b> needed extra time or a golden goal ({', '.join(map(str, r['pror']))}) and <b>{len(r['pen'])}</b> were decided on penalties ({', '.join(map(str, r['pen']))})."),
        (f"La media es de <b>{dec(L, r['goles_med'], 2)} goles por final</b> ({r['goles']} en {n}, contando el desempate de 1968 y sin los penaltis); la mayor diferencia fue el {mm[0]}-{mm[1]} de {mayor[0]}." if es else f"The average is <b>{dec(L, r['goles_med'], 2)} goals per final</b> ({r['goles']} in {n}, counting the 1968 replay and not penalties); the biggest margin was the {mm[0]}–{mm[1]} of {mayor[0]}."),
        (f"El torneo pasó de <b>4 selecciones en 1960 a 24 desde 2016</b>: cada ampliación (8 en 1980, 16 en 1996, 24 en 2016) multiplicó los partidos." if es else f"The tournament grew from <b>4 teams in 1960 to 24 since 2016</b>: each expansion (8 in 1980, 16 in 1996, 24 in 2016) multiplied the number of matches."),
        (f"Solo <b>{len(r['revalida'])} selección</b> ha ganado dos ediciones seguidas: " + ", ".join(f"{sl(s)} ({a} y {b})" for a, b, s in r["revalida"]) + "." if es else f"Only <b>{len(r['revalida'])} nation</b> has won two editions in a row: " + ", ".join(f"{sl(s)} ({a} and {b})" for a, b, s in r["revalida"]) + "."),
    ])
    h += h2("Títulos por selección" if es else "Titles per nation")
    h += barras("Títulos por selección" if es else "Titles per nation", [(sl(s), t) for s, t in r["tit"]], color="#d97706")
    h += par("Alemania Occidental y Alemania se cuentan juntas (1972, 1980 y 1996); la Unión Soviética, Checoslovaquia y Yugoslavia ya no existen como selecciones, así que sus títulos o finales no pertenecen a nadie hoy." if es else "West Germany and Germany are counted together (1972, 1980 and 1996); the Soviet Union, Czechoslovakia and Yugoslavia no longer exist as national teams, so their titles and finals belong to no one today.")
    h += h2("Finalistas que nunca ganaron" if es else "Finalists who never won")
    h += par(", ".join(f"{sl(s)} ({t} {('final' if t == 1 else 'finales') if es else ('final' if t == 1 else 'finals')})" for s, t in perd) + ".")
    mx = max(t for s_, t in perd); masv = [sl(s_) for s_, t in perd if t == mx]
    assert [x[0] for x in E if x[3] == "Inglaterra"] == [2020, 2024]
    h += par((f"Es el reverso del palmarés: {' y '.join(masv)} ({mx} finales cada una) son las que más veces han llegado a la final sin ganarla. Inglaterra jugó dos seguidas (2020 y 2024) y perdió ambas." if es else f"It is the flip side of the roll of honour: {' and '.join(masv)} ({mx} finals each) have reached the most finals without winning. England played two in a row (2020 and 2024) and lost both."))
    h += h2("El torneo ha crecido: selecciones por edición" if es else "The tournament has grown: teams per edition")
    h += columnas("Selecciones por edición" if es else "Teams per edition", r["equipos"], color="#2563eb")
    h += par("Entre 1960 y 1976 solo cuatro selecciones jugaban la fase final (semifinales y final); desde 1980 hay fase de grupos, desde 1996 son 16 y desde 2016, 24. A más equipos, más variedad de campeones: Grecia (2004) y Dinamarca (1992, que entró a última hora por la exclusión de Yugoslavia) son las dos grandes sorpresas." if es else "Between 1960 and 1976 only four teams played the final tournament (semi-finals and final); since 1980 there has been a group stage, since 1996 there have been 16 teams and since 2016, 24. More teams brought more variety of champions: Greece (2004) and Denmark (1992, who came in late after Yugoslavia's exclusion) are the two great surprises.")
    h += h2("Los resultados de las 17 finales" if es else "The results of all 17 finals")
    h += columnas("Goles por final" if es else "Goals per final", [(x[0], sum(marc_eu(x[4]))) for x in E], color="#dc2626")
    h += par("En 1968 la final acabó 1-1 y se repitió dos días después (2-0 para Italia): es el único desempate en una final. Los goles de la gráfica no incluyen los penaltis de 1976 ni de 2020." if es else "In 1968 the final ended 1–1 and was replayed two days later (2–0 to Italy): it is the only replay in a final. The goals in the chart do not include the penalties of 1976 and 2020.")
    h += h2("Las 17 ediciones en una tabla filtrable" if es else "All 17 editions in a filterable table")
    rows = [(x[0], sl(x[1]), sl(x[2]), sl(x[3]), celda_eu(L, x[4]), x[5]) for x in reversed(E)]
    h += tabla_f(("Año", "Sede", "Campeón", "Subcampeón", "Final", "Selecciones") if es else ("Year", "Host", "Champion", "Runner-up", "Final", "Teams"), rows,
                 "Escribe una selección o un año para filtrar; pulsa una cabecera para ordenar." if es else "Type a nation or a year to filter; click a header to sort.")
    h += h2("Cómo hemos hecho este estudio" if es else "How we made this study")
    h += par(("Las cifras las calcula un programa a partir de las 17 finales (1960-2024) con los datos de UEFA.com. Contamos Alemania Occidental y Alemania como una sola selección en la clasificación. La Eurocopa de 2020 se jugó en 2021 y en 11 países, por eso no la contamos como «anfitrión campeón» aunque Italia acogió partidos. El número de goles de 1968 cuenta el desempate (2-0); los de 1976 y 2020 no incluyen los penaltis. La interpretación es de TIKITEXTO; si ves un error, escríbenos desde la página de contacto." if es else "A program calculates the figures from the 17 finals (1960–2024) using UEFA.com data. We count West Germany and Germany as a single nation in the ranking. Euro 2020 was played in 2021 and in 11 countries, so we do not count it as a “host champion” even though Italy staged matches. The 1968 goal count uses the replay (2–0); those of 1976 and 2020 exclude the penalties. The interpretation is TIKITEXTO's; if you spot a mistake, write to us from the contact page."))
    h += C.faq(L, [
        ("¿Qué selección ha ganado más Eurocopas?", "Which nation has won the most European Championships?",
         f"España, con {top[1]} títulos (1964, 2008, 2012 y 2024); le sigue Alemania con {r['tit'][1][1]}, contando los de Alemania Occidental.", f"Spain, with {top[1]} titles (1964, 2008, 2012 and 2024); Germany follows with {r['tit'][1][1]}, counting those of West Germany."),
        ("¿Cuántos anfitriones han ganado la Eurocopa?", "How many hosts have won the European Championship?",
         f"{len(r['anf'])}: {', '.join(map(str, r['anf']))} (España, Italia y Francia).", f"{len(r['anf'])}: {', '.join(map(str, r['anf']))} (Spain, Italy and France)."),
        ("¿Cuántas finales de la Eurocopa se han decidido en los penaltis?", "How many European Championship finals have gone to penalties?",
         f"{len(r['pen'])}: la de {r['pen'][0]} (Checoslovaquia ante Alemania Occidental) y la de {r['pen'][1]} (Italia ante Inglaterra).", f"{len(r['pen'])}: {r['pen'][0]} (Czechoslovakia against West Germany) and {r['pen'][1]} (Italy against England)."),
        ("¿Cuántos equipos juegan la Eurocopa?", "How many teams play in the European Championship?",
         "Desde 2016, 24. Antes fueron 16 (1996-2012), 8 (1980-1992) y 4 (1960-1976).", "Since 2016, 24. Before that there were 16 (1996–2012), 8 (1980–1992) and 4 (1960–1976)."),
        ("¿Qué selecciones han llegado a la final de la Eurocopa sin ganarla nunca?", "Which nations have reached a European Championship final without ever winning?",
         ", ".join(f"{sl(s)} ({t})" for s, t in perd) + ".", ", ".join(f"{sl(s)} ({t})" for s, t in perd) + ".")])
    src = '<a href="https://www.uefa.com/" rel="noopener" target="_blank">UEFA.com · historia de la Eurocopa</a>'
    h += f'<p class="fecha">{"Fuente de los datos" if es else "Data source"}: {src}. {e(p["fecha"][k])}.</p>\n'
    return ruta, h + pie(L)

if __name__ == "__main__":
    out = []
    for lg in LANGS:
        L = Idioma(lg); k = 0 if lg == "es" else 1
        for p, fn in zip(PAGINAS, (champions, mundiales) + tuple(globals()[x["fn"]] for x in PAGINAS[2:])):
            ruta, cont = fn(L, p, k)
            cont = C.con_huecos(L, cont)
            d = os.path.join(C.RAIZ, L.prefix + ruta); os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont)
            out.append(L.prefix + ruta)
    print(len(out), "páginas"); print("\n".join(out))
