# -*- coding: utf-8 -*-
"""Ajusta títulos y descripciones demasiado largos de las páginas del sitemap (solo etiquetas <title>, og/twitter y meta description).
No toca el h1, el texto de la página ni el JSON-LD.
Reglas: título ≤ 62 caracteres con la marca « | TIKITEXTO »; si no cabe se quita la marca; si aun así pasa de 65 se corta antes de «: » o «? »
(solo si queda ≥ 25 caracteres). Descripción ≤ 155: se corta en el último punto, dos puntos o coma antes del límite (o en una palabra).
CAMBIOS: títulos/descripciones escritos a mano para páginas con muchas impresiones y pocos clics (ruta → (título, descripción)).
Orden: … → csp.py → titulos.py → lastmod.py → buscador.py (idempotente; regenerar.sh ya lo hace)."""
import html, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARCA = " | TIKITEXTO"
MAX_T, LIM_T, MAX_D = 62, 65, 155

CAMBIOS = {
    "curiosidades/ligas/": ("Fundación de las ligas de fútbol: años y primeros campeones", "Cuándo y cómo nacieron 13 ligas: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Brasileirão, MLS y más. Años y primeros campeones."),
    "curiosidades/trofeos/": ("Historia de los trofeos de fútbol más importantes", "Cómo nacieron la FA Cup, la Copa del Rey, la Copa del Mundo, la Champions League y el Balón de Oro, entre otros trofeos de nueve países."),
    "en/curiosidades/ballon-dor-winners/": ("Ballon d'Or winners: who has won the most? Full list", "Who has won the most Ballon d'Or awards? Messi 8, Cristiano Ronaldo 5. Full list of winners, top countries and the latest winner, Harry Kane (2026)."),
    "articulos/paises-con-mas-balones-de-oro/": ("¿Qué países tienen más Balones de Oro? Ranking completo", "Qué países han ganado más Balones de Oro: Argentina y Francia (8), Portugal, Alemania y Países Bajos (7), Inglaterra (6). Ranking con sus jugadores."),
    "articulos/champions-europa-league-conference-league-diferencias/": ("Champions, Europa League y Conference League: diferencias", "Las tres competiciones de clubes de la UEFA explicadas: quién juega cada una, cómo se clasifican los equipos y en qué se diferencian."),
    "articulos/origenes-del-futbol-moderno-de-1863-a-hoy/": ("Orígenes del fútbol moderno: de 1863 a hoy", "Cómo nació el fútbol actual: la Football Association de 1863, el primer internacional de 1872, la FIFA de 1904 y el primer Mundial de 1930."),
    "peques/adivinanzas-de-futbol/": ("Adivinanzas de fútbol para niños, con respuesta", "Adivinanzas de fútbol para niños con la respuesta escondida. ¿Cuántas aciertas sin mirar? Para jugar en familia o en clase."),
    "curiosidades/mas-partidos-con-la-seleccion/": ("Jugadores con más partidos con su selección: ranking", "Los futbolistas con más internacionalidades de la historia: Cristiano Ronaldo, Messi, Modrić, Al-Mutawa, Sergio Ramos… ranking actualizado."),
}


def corta_titulo(t):
    if not t.endswith(MARCA) or len(t) <= MAX_T: return t
    base = t[:-len(MARCA)]
    if len(base) <= LIM_T: return base
    m = re.search(r"^(.{25,}?)(?:: |\? |: ¿)", base)
    if m:
        cab = m.group(1) + ("?" if base[len(m.group(1)):len(m.group(1)) + 1] == "?" else "")
        if len(cab) <= LIM_T: return cab
    return base  # sin marca; el título largo se deja tal cual (no se mutila)


def corta_desc(d):
    if len(d) <= 158: return d
    c = d[:MAX_D + 1]
    for sep in (". ", ": ", ", "):
        i = c.rfind(sep)
        if i >= 90: return c[:i].rstrip(" ,:;") + ("." if sep != ". " else ".")
    i = c.rfind(" ")
    return c[:i].rstrip(" ,:;.") + "…"


def sust(txt, patron, nuevo):
    return re.sub(patron, lambda m: m.group(1) + html.escape(nuevo, quote=True).replace("&#x27;", "'") + m.group(3), txt, count=1, flags=re.S)


def main(ver=False):
    sm = open(os.path.join(RAIZ, "sitemap.xml"), encoding="utf-8").read()
    n = 0
    for loc in re.findall(r"<loc>https://tikitexto.com/([^<]*)</loc>", sm):
        if loc == "" or loc.rstrip("/") in ("en", "pt", "fr", "it", "de"): continue
        p = os.path.join(RAIZ, loc + "index.html" if loc.endswith("/") else loc)
        if not os.path.exists(p): continue
        t = open(p, encoding="utf-8").read(); o = t
        mt = re.search(r"(<title>)(.*?)(</title>)", t, re.S); md = re.search(r'(<meta name="description" content=")(.*?)(">)', t, re.S)
        if not mt or not md: continue
        tit, des = html.unescape(mt.group(2)), html.unescape(md.group(2))
        if loc in CAMBIOS:
            tit, des = CAMBIOS[loc]
            if len(tit + MARCA) <= MAX_T + 3: tit += MARCA
        else:
            tit, des = corta_titulo(tit), corta_desc(des)
        t = sust(t, r"(<title>)(.*?)(</title>)", tit)
        t = sust(t, r'(<meta name="description" content=")(.*?)(">)', des)
        t = sust(t, r'(<meta property="og:title" content=")(.*?)(">)', tit)
        t = sust(t, r'(<meta property="og:description" content=")(.*?)(">)', des)
        t = sust(t, r'(<meta name="twitter:title" content=")(.*?)(">)', tit)
        t = sust(t, r'(<meta name="twitter:description" content=")(.*?)(">)', des)
        if t != o:
            n += 1
            if not ver: open(p, "w", encoding="utf-8").write(t)
    print("titulos: %d páginas ajustadas" % n)


if __name__ == "__main__":
    main("--check" in sys.argv)
