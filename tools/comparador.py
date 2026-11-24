#!/usr/bin/env python3
"""COMPARADOR futurista (es/en): jugadores, equipos, selecciones y entrenadores.
Datos: tools/comparador_data.py (única fuente) -> /comparador_datos.js. Motor: /comparador.js + /comparador.css.
Páginas: comparador/ (es) y en/football-comparator/ (en). Orden: ... -> curiosidades_estadisticas.py -> comparador.py -> ... -> seo.py -> csp.py -> buscador.py"""
import fecha_sitio as _FS
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
from curiosidades import e, DOM, CSP, RAIZ
import comparador_data as CD

RUTAS = {"es": "comparador/", "en": "en/football-comparator/"}
T = {
 "es": dict(lang="es", t="Comparador de fútbol: jugadores, equipos, selecciones y entrenadores | TIKITEXTO",
            d="Compara cara a cara a Messi y Cristiano, al Real Madrid y el Barça, a España y Argentina o a Guardiola y Ancelotti: Balones de Oro, Champions, Mundiales, goles, altura y más, con gráficos animados.",
            h1="Comparador de fútbol", kick="TIKITEXTO · cara a cara", sub="Elige dos jugadores, dos equipos, dos selecciones o dos entrenadores y mira quién gana en títulos, goles y récords.",
            jugar="⚽ Jugar", cur="Curiosidades", sobre="Sobre TIKITEXTO", leg="Datos de uso informativo: revisados con UEFA, FIFA y France Football; altura y peso son valores aproximados de perfil. Sin escudos ni fotos.",
            que="¿Cómo funciona?", quep="Pulsa cada tarjeta para cambiar de jugador, equipo, selección o entrenador, o usa los duelos rápidos. Cada fila de la tabla compara una estadística; la corona marca quién la gana y el marcador cuenta cuántas gana cada lado. Las filas informativas (altura, peso, año de nacimiento o fundación) no puntúan.",
            duelos="Duelos destacados", fuentes="Fuentes", fu=[("UEFA.com", "https://www.uefa.com/"), ("FIFA.com", "https://www.fifa.com/"), ("France Football (Balón de Oro)", "https://www.francefootball.fr/"), ("RSSSF", "https://www.rsssf.org/")],
            faq=[("¿De dónde salen los datos del comparador?", "De las bases oficiales de UEFA y FIFA, de France Football para el Balón de Oro y de las webs de las federaciones; altura y peso son valores aproximados de perfil. La fecha de los datos aparece bajo el marcador."),
                 ("¿Qué estadísticas se comparan?", "En jugadores: Balones de Oro, Champions, Mundiales, torneos continentales, Botas de Oro, goles y partidos en Champions y con la selección, altura, peso y año de nacimiento. En equipos, selecciones y entrenadores: títulos, finales y palmarés."),
                 ("¿Por qué algunas filas muestran un guion?", "Cuando no hemos podido contrastar un dato con una fuente fiable preferimos no mostrarlo; esas filas no puntúan."),
                 ("¿Puedo compartir una comparación?", "Sí: el botón Compartir copia un enlace que abre exactamente el mismo duelo.")]),
 "en": dict(lang="en", t="Football comparator: players, clubs, national teams and managers | TIKITEXTO",
            d="Compare Messi and Ronaldo, Real Madrid and Barcelona, Spain and Argentina or Guardiola and Ancelotti head to head: Ballon d'Or, Champions League, World Cups, goals, height and more, with animated charts.",
            h1="Football comparator", kick="TIKITEXTO · head to head", sub="Pick two players, two clubs, two national teams or two managers and see who wins on trophies, goals and records.",
            jugar="⚽ Play", cur="Trivia", sobre="About TIKITEXTO", leg="For information only: checked against UEFA, FIFA and France Football; height and weight are approximate profile values. No crests or photos.",
            que="How does it work?", quep="Tap each card to change the player, club, national team or manager, or use the quick duels. Each row compares one statistic; the crown shows who wins it and the scoreboard counts how many each side takes. Informational rows (height, weight, birth or founding year) do not score.",
            duelos="Featured duels", fuentes="Sources", fu=[("UEFA.com", "https://www.uefa.com/"), ("FIFA.com", "https://www.fifa.com/"), ("France Football (Ballon d'Or)", "https://www.francefootball.fr/"), ("RSSSF", "https://www.rsssf.org/")],
            faq=[("Where does the comparator data come from?", "From UEFA and FIFA official records, France Football for the Ballon d'Or and federation websites; height and weight are approximate profile values. The data date is shown under the scoreboard."),
                 ("Which statistics are compared?", "For players: Ballon d'Or, Champions League, World Cups, continental titles, Golden Shoes, Champions League and national-team goals and appearances, height, weight and birth year. For clubs, national teams and managers: titles, finals and honours."),
                 ("Why do some rows show a dash?", "When we could not confirm a figure with a reliable source we prefer not to show it; those rows do not score."),
                 ("Can I share a comparison?", "Yes: the Share button copies a link that opens exactly the same duel.")]),
}
MODOS = [("jugadores", ("Jugadores", "Players")), ("equipos", ("Equipos", "Clubs")), ("selecciones", ("Selecciones", "National teams")), ("entrenadores", ("Entrenadores", "Managers"))]

def datos_js():
    d = CD.construir(); d["fecha"] = list(CD.FECHA)
    open(os.path.join(RAIZ, "comparador_datos.js"), "w", encoding="utf-8").write("window.CP_DATA=" + json.dumps(d, ensure_ascii=False, separators=(",", ":")) + ";\n")
    return d

def tablas(lg, d):
    k = 0 if lg == "es" else 1; h = ""
    for m, (n_es, n_en) in MODOS:
        bloque = d[m]; items = {x["id"]: x for x in bloque["items"]}
        a, b = bloque["duelos"][0]; A, B = items[a], items[b]
        nom = lambda x: x["n"] if k == 0 or "ne" not in x else x["ne"]
        h += f'<h3>{e((n_es, n_en)[k])}: {e(nom(A))} vs {e(nom(B))}</h3>\n<table><thead><tr><th></th><th>{e(nom(A))}</th><th>{e(nom(B))}</th></tr></thead><tbody>\n'
        for s in bloque["stats"]:
            va, vb = A["v"].get(s["k"]), B["v"].get(s["k"])
            f = lambda v: "—" if v is None else str(v)
            h += f'<tr><td>{e(s["es"] if k == 0 else s["en"])}</td><td>{f(va)}</td><td>{f(vb)}</td></tr>\n'
        h += "</tbody></table>\n"
        import comparador_duelos as DU
        base = RUTAS[lg]
        h += "<p>" + " · ".join(f'<a href="/{base}{x}-vs-{y}/">{e(nom(items[x]))} vs {e(nom(items[y]))}</a>' for mm, x, y in DU.pares(d) if mm == m) + "</p>\n"
    return h

def pagina(lg, d):
    t = T[lg]; k = 0 if lg == "es" else 1; ruta = RUTAS[lg]; L = C.Idioma(lg)
    alt = "".join(f'<link rel="alternate" hreflang="{h}" href="{DOM}{RUTAS[c]}">\n' for c, h in (("es", "es"), ("en", "en"))) + f'<link rel="alternate" hreflang="x-default" href="{DOM}{RUTAS["es"]}">\n'
    ld = {"@context": "https://schema.org", "@type": "WebApplication", "name": t["h1"], "description": t["d"], "url": DOM + ruta, "applicationCategory": "SportsApplication", "operatingSystem": "Any", "inLanguage": lg, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}}
    faq = C.faq(L, [(p, p, r, r) for p, r in t["faq"]], t["h1"] and ("Preguntas frecuentes" if k == 0 else "Frequently asked questions"))
    fu = "".join(f'<li><a href="{u}" rel="noopener noreferrer" target="_blank">{e(n)}</a></li>' for n, u in t["fu"])
    cur = "/curiosidades/" if lg == "es" else "/en/curiosidades/"
    return f"""<!DOCTYPE html>
<html lang="{lg}">
<head>
<meta charset="utf-8">
{CSP}<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-adsense-account" content="ca-pub-3562310629171137">
<meta name="theme-color" content="#04030f">
<title>{e(t['t'])}</title>
<meta name="description" content="{e(t['d'])}">
<link rel="canonical" href="{DOM}{ruta}">
{alt}<meta property="og:title" content="{e(t['t'])}">
<meta property="og:description" content="{e(t['d'])}">
<meta property="og:type" content="website">
<meta property="og:url" content="{DOM}{ruta}">
<meta property="og:image" content="https://tikitexto.com/icons/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/favicon-48.png">
<link rel="stylesheet" href="/comparador.css">
</head>
<body class="cp-page">
<canvas id="cpFondo" aria-hidden="true"></canvas><div class="cp-scan"></div><div class="cp-vineta"></div>
<header class="cp-top"><a class="cp-marca" href="{L.play()}">TIKI<i>TEXTO</i></a>
<nav class="cp-nav" aria-label="Info"><a href="{cur}">{e(t['cur'])}</a><a href="{L.play()}">{e(t['jugar'])}</a><span><b>{'ES' if lg == 'es' else '<a href="/' + RUTAS['es'] + '" hreflang="es">ES</a>'}</b> · <b>{'EN' if lg == 'en' else '<a href="/' + RUTAS['en'] + '" hreflang="en">EN</a>'}</b></span></nav></header>
<main class="cp">
<section class="cp-hero"><p class="cp-kicker">{e(t['kick'])}</p><h1>{e(t['h1'])}</h1><p class="cp-sub">{e(t['sub'])}</p></section>
<div id="cpApp"></div>
<div class="cp-texto">
<section><h2>{e(t['que'])}</h2><p>{e(t['quep'])}</p></section>
<section><h2>{e(t['duelos'])}</h2>
{tablas(lg, d)}</section>
<section>{faq}</section>
<section><h2>{e(t['fuentes'])}</h2><ul>{fu}</ul><p>{e(d['fecha'][k])}</p></section>
</div>
</main>
<p class="cp-legal">{e(t['leg'])}<br>{e(_FS.texto(lg))}<br><a href="/sobre-tikitexto.html">{e(t['sobre'])}</a><a href="/aviso-legal.html">Legal</a><a href="/privacidad.html">{'Privacidad' if lg == 'es' else 'Privacy'}</a><a href="/cookies.html">Cookies</a></p>
<script src="/comparador_datos.js" defer></script>
<script src="/comparador.js" defer></script>
</body>
</html>
"""

if __name__ == "__main__":
    d = datos_js()
    for lg in ("es", "en"):
        p = os.path.join(RAIZ, RUTAS[lg]); os.makedirs(p, exist_ok=True)
        open(os.path.join(p, "index.html"), "w", encoding="utf-8").write(pagina(lg, d))
    print("comparador: es + en, datos", {m: len(v["items"]) for m, v in d.items() if isinstance(v, dict)})
