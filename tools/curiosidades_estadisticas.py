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
    h += par(("Cada cifra de esta página la calcula un programa a partir de las 20 finales recogidas en nuestra página de <a href=\"../champions-20-anos/\">las últimas 20 finales</a>, cuyos marcadores, sedes y asistencias proceden de UEFA.com. Los goles cuentan los marcados en juego (90 minutos y prórroga) y no los de las tandas de penaltis. La interpretación es del equipo editorial de TIKITEXTO; si ves un error, escríbenos desde la página de contacto." if es else "Every figure on this page is computed by a program from the 20 finals listed on our <a href=\"../champions-league-last-20-finals/\">last 20 finals</a> page, whose scores, venues and attendances come from UEFA.com. Goals count those scored in play (90 minutes and extra time), not in penalty shoot-outs. The interpretation is by the TIKITEXTO editorial team; if you spot an error, write to us from the contact page."))
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
    h += par(("Las cifras las calcula un programa a partir de las 23 ediciones de nuestra página <a href=\"../mundiales-edicion-por-edicion/\">todos los Mundiales, edición por edición</a>, con datos de FIFA.com. Contamos Alemania Occidental y Alemania como una sola selección en la clasificación de títulos. Los goles de las finales no incluyen las tandas de penaltis. La interpretación es del equipo editorial de TIKITEXTO." if es else "A program computes the figures from the 23 editions on our <a href=\"../world-cups-edition-by-edition/\">every World Cup, edition by edition</a> page, with data from FIFA.com. We count West Germany and Germany as one nation in the title ranking. Final goals do not include penalty shoot-outs. The interpretation is by the TIKITEXTO editorial team."))
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

if __name__ == "__main__":
    out = []
    for lg in LANGS:
        L = Idioma(lg); k = 0 if lg == "es" else 1
        for p, fn in zip(PAGINAS, (champions, mundiales)):
            ruta, cont = fn(L, p, k)
            cont = C.con_huecos(L, cont)
            d = os.path.join(C.RAIZ, L.prefix + ruta); os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont)
            out.append(L.prefix + ruta)
    print(len(out), "páginas"); print("\n".join(out))
