#!/usr/bin/env python3
"""Páginas estáticas de duelos del COMPARADOR (es/en) para SEO: «X vs Y».
Datos: comparador_data.py. Rutas: comparador/<a>-vs-<b>/ y en/football-comparator/<a>-vs-<b>/.
Orden: ... -> comparador.py -> comparador_duelos.py -> seo.py -> csp.py -> buscador.py"""
import re, fecha_sitio as _FS
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
from curiosidades import e, DOM, RAIZ
import comparador as CP
import comparador_data as CD

# 23-nov-2026: AdSense rechazó la web por «contenido de poco valor». Las ~45 páginas de duelo extra (misma plantilla,
# ~45 % de texto compartido) se retiraron; solo se generan los duelos destacados de DATOS[modo]["duelos"] (21 pares).
# EXTRA queda vacío a propósito; la lista anterior se conserva en EXTRA_RETIRADOS por si se quiere recuperar alguno
# con texto editorial propio (no volver a generar páginas de duelo en masa).
EXTRA = {}
EXTRA_RETIRADOS = {
 "jugadores": [("messi","maradona"),("messi","pele"),("cristiano","pele"),("cristiano","mbappe"),("messi","mbappe"),("haaland","kane"),
               ("benzema","lewandowski"),("modric","iniesta"),("rodri","pedri"),("vinicius","mbappe"),("bellingham","yamal"),("ronaldo9","henry"),
               ("zidane","iniesta"),("neymar","messi"),("cruyff","pele"),("casillas","ramos"),("salah","kane"),("ronaldinho","messi")],
 "equipos": [("real-madrid","bayern"),("real-madrid","liverpool"),("barcelona","bayern"),("real-madrid","milan"),("barcelona","man-city"),
             ("juventus","inter"),("chelsea","arsenal"),("atletico","real-madrid"),("man-city","liverpool"),("psg","barcelona")],
 "selecciones": [("argentina","brasil"),("espana","alemania"),("italia","alemania"),("francia","brasil"),("espana","portugal"),
                 ("inglaterra","alemania"),("argentina","francia"),("brasil","italia"),("paises-bajos","belgica")],
 "entrenadores": [("guardiola","mourinho"),("ancelotti","zidane"),("guardiola","klopp"),("simeone","ancelotti"),("ferguson","guardiola"),
                  ("luis-enrique","guardiola"),("flick","luis-enrique"),("deschamps","scaloni")],
}
T = {
 "es": dict(vs="vs", h="Comparativa", full="{a} vs {b}: quién tiene más títulos y récords", t="{a} vs {b}: comparativa de títulos y récords | TIKITEXTO",
            d="{a} contra {b} cara a cara: {res} Tabla completa con datos de UEFA, FIFA y France Football.",
            stat="Estadística", gana="Gana", empate="Empate", info="Dato informativo", tab="Tabla comparativa", ver="Resumen del duelo",
            anim="Ver el duelo animado", otros="Otros duelos", com="Comparador de fútbol", cur="Curiosidades", jugar="⚽ Jugar",
            pt="puntos", leg="Datos de uso informativo: revisados con UEFA, FIFA y France Football; altura y peso son valores aproximados de perfil. Sin escudos ni fotos.",
            sobre="Sobre TIKITEXTO", fuentes="Fuentes", faqt="Preguntas frecuentes", areas="Quién lidera en cada área", perfiles="Perfiles", leer="Cómo leer esta comparativa"),
 "en": dict(vs="vs", h="Head to head", full="{a} vs {b}: who has more trophies and records", t="{a} vs {b}: trophies and records compared | TIKITEXTO",
            d="{a} vs {b} head to head: {res} Full table with UEFA, FIFA and France Football data.",
            stat="Statistic", gana="Wins", empate="Tie", info="Informational", tab="Comparison table", ver="Duel summary",
            anim="See the animated duel", otros="More duels", com="Football comparator", cur="Trivia", jugar="⚽ Play",
            pt="points", leg="For information only: checked against UEFA, FIFA and France Football; height and weight are approximate profile values. No crests or photos.",
            sobre="About TIKITEXTO", fuentes="Fuentes", faqt="Frequently asked questions", areas="Who leads in each area", perfiles="Profiles", leer="How to read this comparison"),
}
T["en"]["fuentes"] = "Sources"

def pares(d):
    out = []
    for m, _ in CP.MODOS:
        vistos = set()
        for a, b in list(d[m]["duelos"]) + list(EXTRA.get(m, [])):
            if a == b or (a, b) in vistos or (b, a) in vistos: continue
            vistos.add((a, b)); out.append((m, a, b))
    return out

def nom(x, k): return x["n"] if k == 0 or "ne" not in x else x["ne"]
def fmt(v): return "—" if v is None else str(v)

def analiza(bl, A, B):
    """Devuelve filas (stat, va, vb, ganador 'a'|'b'|'='|None) y marcador."""
    filas = []; pa = pb = 0
    for s in bl["stats"]:
        va, vb = A["v"].get(s["k"]), B["v"].get(s["k"]); g = None
        if s.get("g") and va is not None and vb is not None:
            g = "a" if va > vb else "b" if vb > va else "="
            if g == "a": pa += 1
            elif g == "b": pb += 1
        filas.append((s, va, vb, g))
    return filas, pa, pb

def resumen(lg, A, B, filas, pa, pb):
    k = 0 if lg == "es" else 1; na, nb = nom(A, k), nom(B, k)
    if pa > pb: r = (f"{na} gana {pa} de las {pa+pb} estadísticas comparables frente a {pb} de {nb}.", f"{na} wins {pa} of the {pa+pb} comparable statistics against {pb} for {nb}.")
    elif pb > pa: r = (f"{nb} gana {pb} de las {pa+pb} estadísticas comparables frente a {pa} de {na}.", f"{nb} wins {pb} of the {pa+pb} comparable statistics against {pa} for {na}.")
    else: r = (f"{na} y {nb} empatan a {pa} estadísticas comparables.", f"{na} and {nb} are level at {pa} comparable statistics.")
    return r[k]

def frases(lg, A, B, filas):
    k = 0 if lg == "es" else 1; na, nb = nom(A, k), nom(B, k); out = []
    for s, va, vb, g in filas:
        if g is None: continue
        et = s["es"] if k == 0 else s["en"]
        if g == "=": out.append((f"{et}: igualados a {va}.", f"{et}: level on {va}.")[k])
        else:
            w, l, vw, vl = (na, nb, va, vb) if g == "a" else (nb, na, vb, va)
            out.append((f"{et}: {w} ({vw}) supera a {l} ({vl}).", f"{et}: {w} ({vw}) ahead of {l} ({vl}).")[k])
    return out

AREAS = {
 "jugadores": [("prem", ("Premios individuales", "Individual awards"), ("bdo", "botas")),
               ("tit", ("Títulos colectivos", "Team trophies"), ("ucl_t", "mundial", "cont")),
               ("rend", ("Goles y partidos", "Goals and appearances"), ("ucl_g", "ucl_p", "sel_g", "sel_p", "wc_g"))],
 "equipos": [("tit", ("Títulos", "Trophies"), ("ucl", "liga_t", "mcl", "uel", "usc")), ("fin", ("Finales de Champions", "Champions League finals"), ("fin", "fin_g"))],
 "selecciones": [("wc", ("Mundiales", "World Cups"), ("wc", "wc_f")), ("cont", ("Torneos continentales", "Continental tournaments"), ("cont",)), ("ind", ("Figuras individuales", "Individual stars"), ("bdo", "gol"))],
 "entrenadores": [("tit", ("Grandes títulos", "Major trophies"), ("ucl", "mundial", "cont")), ("lig", ("Ligas nacionales", "Domestic leagues"), ("ligas",))],
}
EXPL = {
 "prem": ("Los premios individuales reconocen una temporada concreta y dependen de la votación y de los títulos del equipo, así que miden el nivel máximo más que la regularidad.",
          "Individual awards recognise one specific season and depend on voting and on the team's trophies, so they measure peak level more than consistency."),
 "tit": ("Los títulos son colectivos: dependen también de los compañeros, del club o la selección y de la época, por eso conviene leerlos junto al rendimiento individual.",
         "Trophies are collective: they also depend on teammates, the club or national team and the era, so they are best read alongside individual output."),
 "rend": ("Los goles y los partidos miden la regularidad a lo largo de los años: quien juega más partidos tiene más oportunidades, de modo que la media por partido cuenta tanto como el total.",
          "Goals and appearances measure consistency over the years: whoever plays more games has more chances, so the per-game average matters as much as the total."),
 "fin": ("Llegar a la final de la Champions League es la señal más clara de regularidad en la élite europea, y ganarla marca la diferencia entre un buen ciclo y uno histórico.",
         "Reaching a Champions League final is the clearest sign of consistency at the top of European football, and winning it separates a good cycle from a historic one."),
 "wc": ("El Mundial se juega cada cuatro años, así que cada título pesa mucho en la historia de una selección; las finales perdidas se muestran como contexto y no puntúan.",
        "The World Cup is played every four years, so every title weighs heavily in a national team's history; lost finals are shown as context and do not score."),
 "cont": ("Los torneos continentales (Eurocopa y Copa América) tienen más ediciones y más historia en unos países que en otros, por lo que las cifras no siempre son comparables en igualdad de condiciones.",
          "Continental tournaments (the Euros and the Copa América) have more editions and more history in some countries than in others, so figures are not always like-for-like."),
 "ind": ("Los Balones de Oro y el máximo goleador de cada selección cuentan la historia de sus mejores figuras, no la del conjunto.",
         "Ballons d'Or and each national team's top scorer tell the story of its best individuals, not of the squad as a whole."),
 "lig": ("Las ligas se ganan a lo largo de una temporada entera, por lo que premian la regularidad, aunque cada país tenga un nivel de competencia distinto.",
         "Leagues are won over a whole season, so they reward consistency, although each country has a different level of competition."),
}
CLAVES_FINAL = {"fin", "fin_g"}

def _et(s, k): return s["es"] if k == 0 else s["en"]

def brecha(fs, na, nb, k):
    """Frase calculada con la mayor distancia entre ambos dentro de un área (sin texto genérico repetido)."""
    c = [(abs(f[1] - f[2]), f) for f in fs if f[3] in ("a", "b") and isinstance(f[1], (int, float)) and isinstance(f[2], (int, float))]
    if not c: return ""
    d, f = max(c, key=lambda x: (x[0], x[1][0]["k"]))
    w, l, vw, vl = (na, nb, f[1], f[2]) if f[3] == "a" else (nb, na, f[2], f[1])
    if d == 0: return ""
    return (f"La mayor distancia está en «{f[0]['es']}»: {w} suma {fmt(vw)} y {l} {fmt(vl)}, una diferencia de {fmt(d)}.",
            f"The biggest gap is in “{f[0]['en']}”: {w} has {fmt(vw)} and {l} {fmt(vl)}, a difference of {fmt(d)}.")[k]

def areas_html(lg, m, bl, A, B, filas):
    k = 0 if lg == "es" else 1; na, nb = nom(A, k), nom(B, k); por = {s["k"]: (s, va, vb, g) for s, va, vb, g in filas}; out = ""
    for clave, titulo, ks in AREAS.get(m, []):
        fs = [por[x] for x in ks if x in por and (por[x][1] is not None or por[x][2] is not None)]
        if not fs: continue
        wa = sum(1 for f in fs if f[3] == "a"); wb = sum(1 for f in fs if f[3] == "b"); ct = sum(1 for f in fs if f[3] in ("a", "b", "="))
        det = "; ".join(f"{_et(f[0], k)}: {na} {fmt(f[1])}, {nb} {fmt(f[2])}" for f in fs)
        if ct == 0: veredicto = ("Son datos de contexto: no puntúan en el marcador.", "These are context figures: they do not count towards the score.")[k]
        elif wa > wb: veredicto = (f"{na} lidera esta área ({wa} de {ct} apartados comparables).", f"{na} leads this area ({wa} of {ct} comparable items).")[k]
        elif wb > wa: veredicto = (f"{nb} lidera esta área ({wb} de {ct} apartados comparables).", f"{nb} leads this area ({wb} of {ct} comparable items).")[k]
        else: veredicto = (f"El área está igualada entre {na} y {nb}.", f"The area is level between {na} and {nb}.")[k]
        out += f"<h3>{e(titulo[k])}</h3><p>{e(det)}. {e(veredicto)} {e(brecha(fs, na, nb, k))}</p>\n"
    return out

def destacados(lg, bl, X, n=5):
    k = 0 if lg == "es" else 1; out = []
    for s in bl["stats"]:
        v = X["v"].get(s["k"])
        if s.get("g") and v: out.append(f"{_et(s, k)}: {v}")
        if len(out) >= n: break
    return "; ".join(out)

def perfil_txt(lg, m, bl, X):
    k = 0 if lg == "es" else 1; n = nom(X, k); v = X["v"]; pos = X["p"][k]; pais = X["pa"][k]; partes = []
    if m == "jugadores":
        partes.append((f"{n}: {pos.lower()} de {pais}, nacido en {v.get('nac')}.", f"{n}: {pos.lower()} from {pais}, born in {v.get('nac')}.")[k])
        if v.get("alt"): partes.append((f"Altura aproximada: {v['alt']} cm.", f"Approximate height: {v['alt']} cm.")[k])
    elif m == "equipos":
        partes.append((f"{n}: club de {pais} fundado en {v.get('fund')}.", f"{n}: {pais} club founded in {v.get('fund')}.")[k])
    elif m == "selecciones":
        if v.get("_anios"): partes.append((f"Mundiales ganados en: {', '.join(str(a) for a in v['_anios'])}.", f"World Cups won in: {', '.join(str(a) for a in v['_anios'])}.")[k])
        if v.get("_gol"): partes.append((f"Máximo goleador de la selección: {v['_gol']} ({v.get('gol')} goles).", f"National team top scorer: {v['_gol']} ({v.get('gol')} goals).")[k])
    else:
        partes.append((f"{n}: entrenador de {pais}, nacido en {v.get('nac')}.", f"{n}: manager from {pais}, born in {v.get('nac')}.")[k])
    d = destacados(lg, bl, X)
    if d: partes.append((f"Cifras principales: {d}.", f"Key figures: {d}.")[k])
    return " ".join(partes)

def perfiles_html(lg, m, bl, A, B):
    k = 0 if lg == "es" else 1; out = ""
    for X in (A, B): out += f"<h3>{e(nom(X, k))}</h3><p>{e(perfil_txt(lg, m, bl, X))}</p>\n"
    na, nb = A["v"].get("nac"), B["v"].get("nac")
    if m in ("jugadores", "entrenadores") and na and nb:
        dif = abs(na - nb); a_, b_ = nom(A, k), nom(B, k)
        if dif == 0: t = (f"{a_} y {b_} nacieron el mismo año ({na}), así que compartieron generación.", f"{a_} and {b_} were born in the same year ({na}), so they belong to the same generation.")[k]
        elif dif <= 3: t = (f"{a_} nació en {na} y {b_} en {nb}: solo {dif} años de diferencia, así que sus carreras coincidieron casi por completo.", f"{a_} was born in {na} and {b_} in {nb}: only {dif} years apart, so their careers overlapped almost entirely.")[k]
        elif dif <= 9: t = (f"{a_} nació en {na} y {b_} en {nb}: {dif} años de diferencia, por lo que sus carreras coincidieron durante buena parte del tiempo.", f"{a_} was born in {na} and {b_} in {nb}: {dif} years apart, so their careers overlapped for a good part of the time.")[k]
        else: t = (f"{a_} nació en {na} y {b_} en {nb}: {dif} años de diferencia, por lo que pertenecen a épocas distintas y sus cifras no se consiguieron en las mismas condiciones.", f"{a_} was born in {na} and {b_} in {nb}: {dif} years apart, so they belong to different eras and their figures were not achieved under the same conditions.")[k]
        out += f"<p>{e(t)}</p>\n"
    return out

LEER = (("Las filas con ganador puntúan: gana quien tiene la cifra más alta y el marcador de arriba cuenta cuántas filas gana cada uno. Las filas informativas (altura, peso, año de nacimiento o fundación, finales perdidas) se muestran como contexto y no puntúan. Un guion (—) significa que la cifra no se ha podido contrastar con fuentes oficiales, y no cuenta para nadie. Los datos se revisan después de cada temporada y de cada gran torneo; la fecha figura al final de la página.",
         "Rows with a winner score: whoever has the higher figure wins, and the score above counts how many rows each side wins. Informational rows (height, weight, year of birth or founding, lost finals) are shown for context and do not score. A dash (—) means the figure could not be checked against official sources and counts for nobody. The data is reviewed after every season and every major tournament; the date appears at the bottom of the page."),)

def faq(lg, A, B, filas, pa, pb, bl):
    k = 0 if lg == "es" else 1; na, nb = nom(A, k), nom(B, k); qa = []
    res = resumen(lg, A, B, filas, pa, pb)
    qa.append((f"¿Quién tiene más títulos, {na} o {nb}?", f"Who has more trophies, {na} or {nb}?", res, res))
    for s, va, vb, g in filas:
        if g in ("a", "b") and s["k"] in ("bdo", "ucl_t", "ucl", "mundial", "wc", "ligas", "liga_t"):
            w, vw, vl = (na, va, vb) if g == "a" else (nb, vb, va)
            et_es, et_en = s["es"], s["en"]
            qa.append((f"¿Quién tiene más — {et_es} — entre {na} y {nb}?", f"Who has more — {et_en} — {na} or {nb}?",
                       f"{w}, con {vw} frente a {vl}.", f"{w}, with {vw} against {vl}."))
            break
    num = [(abs(va - vb) / max(abs(va), abs(vb), 1), s, va, vb, g) for s, va, vb, g in filas if g in ("a", "b") and isinstance(va, (int, float)) and isinstance(vb, (int, float))]
    if num:
        r, s, va, vb, g = max(num, key=lambda x: (x[0], x[1]["k"]))
        w, l, vw, vl = (na, nb, va, vb) if g == "a" else (nb, na, vb, va)
        qa.append((f"¿En qué se diferencian más {na} y {nb}?", f"Where do {na} and {nb} differ most?",
                   f"En «{s['es']}»: {w} tiene {fmt(vw)} y {l} {fmt(vl)}.", f"In “{s['en']}”: {w} has {fmt(vw)} and {l} {fmt(vl)}."))
    return qa

_NOIDX = set()

def pagina(lg, d, m, a, b, todos):
    t = T[lg]; k = 0 if lg == "es" else 1; L = C.Idioma(lg)
    bl = d[m]; items = {x["id"]: x for x in bl["items"]}; A, B = items[a], items[b]
    na, nb = nom(A, k), nom(B, k)
    filas, pa, pb = analiza(bl, A, B); res = resumen(lg, A, B, filas, pa, pb)
    base = {"es": "comparador/", "en": "en/football-comparator/"}; slug = f"{a}-vs-{b}"
    ruta = base[lg] + slug + "/"
    alt = f'<link rel="alternate" hreflang="es" href="{DOM}{base["es"]}{slug}/">\n<link rel="alternate" hreflang="en" href="{DOM}{base["en"]}{slug}/">\n<link rel="alternate" hreflang="x-default" href="{DOM}{base["es"]}{slug}/">\n'
    titulo = t["t"].format(a=na, b=nb); desc = t["d"].format(a=na, b=nb, res=res)
    h1 = f"{na} vs {nb}"
    trs = ""
    for s, va, vb, g in filas:
        ca = ' class="cp-w"' if g == "a" else ""; cb = ' class="cp-w"' if g == "b" else ""
        trs += f'<tr><td>{e(s["es"] if k == 0 else s["en"])}</td><td{ca}>{fmt(va)}</td><td{cb}>{fmt(vb)}</td></tr>\n'
    lis = "".join(f"<li>{e(x)}</li>" for x in frases(lg, A, B, filas))
    pq = faq(lg, A, B, filas, pa, pb, bl)
    fq = C.faq(L, pq, t["faqt"])
    otros = [x for x in todos if x[0] == m and (x[1], x[2]) != (a, b) and (a in x[1:] or b in x[1:])][:6]
    otros += [x for x in todos if x[0] == m and x not in otros and (x[1], x[2]) != (a, b)][:max(0, 8 - len(otros))]
    ol = "".join(f'<li><a href="/{base[lg]}{x[1]}-vs-{x[2]}/">{e(nom({i["id"]: i for i in d[m]["items"]}[x[1]], k))} vs {e(nom({i["id"]: i for i in d[m]["items"]}[x[2]], k))}</a></li>' for x in otros)
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": t["full"].format(a=na, b=nb), "description": desc, "inLanguage": lg,
          "mainEntityOfPage": DOM + ruta, "author": {"@type": "Organization", "name": "TIKITEXTO"}, "publisher": {"@type": "Organization", "name": "TIKITEXTO"}}
    fu = "".join(f'<li><a href="{u}" rel="noopener noreferrer" target="_blank">{e(n)}</a></li>' for n, u in CP.T[lg]["fu"])
    enlace = f'/{base[lg]}?m={m}&amp;a={a}&amp;b={b}'
    cur = "/curiosidades/" if lg == "es" else "/en/curiosidades/"
    return f"""<!DOCTYPE html>
<html lang="{lg}">
<head>
<meta charset="utf-8">
{C.CSP}<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-adsense-account" content="ca-pub-3562310629171137">
<meta name="theme-color" content="#04030f">
{'<meta name="robots" content="noindex, follow">' + chr(10) if (m, a, b) in _NOIDX else ''}<title>{e(titulo)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{DOM}{ruta}">
{alt}<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:type" content="article">
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
<header class="cp-top"><a class="cp-marca" href="{L.play()}">TIKI<i>TEXTO</i></a>
<nav class="cp-nav" aria-label="Info"><a href="/{base[lg]}">{e(t['com'])}</a><a href="{cur}">{e(t['cur'])}</a><a href="{L.play()}">{e(t['jugar'])}</a><span><b>{'ES' if lg == 'es' else '<a href="/' + base['es'] + slug + '/" hreflang="es">ES</a>'}</b> · <b>{'EN' if lg == 'en' else '<a href="/' + base['en'] + slug + '/" hreflang="en">EN</a>'}</b></span></nav></header>
<main class="cp">
<section class="cp-hero"><p class="cp-kicker">{e(t['h'])}</p><h1>{e(h1)}</h1><p class="cp-sub">{e(res)}</p>
<p><a class="cp-btn" href="{enlace}">{e(t['anim'])} →</a></p></section>
<div class="cp-texto">
<section><h2>{e(t['ver'])}</h2><ul>{lis}</ul></section>
<section><h2>{e(t['areas'])}</h2>
{areas_html(lg, m, bl, A, B, filas)}</section>
<section><h2>{e(t['perfiles'])}</h2>
{perfiles_html(lg, m, bl, A, B)}</section>
<section><h2>{e(t['tab'])}</h2>
<table><thead><tr><th>{e(t['stat'])}</th><th>{e(na)}</th><th>{e(nb)}</th></tr></thead><tbody>
{trs}</tbody></table></section>
<section>{fq}</section>
<section><h2>{e(t['otros'])}</h2><ul>{ol}</ul></section>
<section><h2>{e(t['fuentes'])}</h2><ul>{fu}</ul><p>{e(d['fecha'][k])}</p></section>
</div>
</main>
<p class="cp-legal">{e(t['leg'])}<br>{e(_FS.texto(lg))}<br><a href="/sobre-tikitexto.html">{e(t['sobre'])}</a><a href="/aviso-legal.html">Legal</a><a href="/privacidad.html">{'Privacidad' if lg == 'es' else 'Privacy'}</a><a href="/cookies.html">Cookies</a></p>
</body>
</html>
"""

MIN_PALABRAS = 420   # un duelo con menos texto propio no se indexa (sigue disponible para los usuarios)

def _palabras(h):
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", h[h.index('<main'):h.index('</main>')], flags=re.S)
    return len(re.sub(r"<[^>]+>", " ", t).split())

def delgados():
    """pares cuyas páginas (en cualquier idioma) quedan por debajo de MIN_PALABRAS"""
    d = CD.construir(); d["fecha"] = list(CD.FECHA); todos = pares(d); out = set()
    for m, a, b in todos:
        if min(_palabras(pagina(lg, d, m, a, b, todos)) for lg in ("es", "en")) < MIN_PALABRAS: out.add((m, a, b))
    return out

def rutas():
    """duelos que van al sitemap (solo los que tienen texto suficiente)"""
    d = CD.construir(); fin = delgados(); return [(m, a, b) for m, a, b in pares(d) if (m, a, b) not in fin]

if __name__ == "__main__":
    d = CD.construir(); d["fecha"] = list(CD.FECHA); todos = pares(d)
    _NOIDX.update(delgados())
    ids = {m: {x["id"] for x in d[m]["items"]} for m, _ in CP.MODOS}
    n = 0
    for m, a, b in todos:
        assert a in ids[m] and b in ids[m], (m, a, b)
        for lg in ("es", "en"):
            base = {"es": "comparador/", "en": "en/football-comparator/"}[lg]
            p = os.path.join(RAIZ, base, f"{a}-vs-{b}"); os.makedirs(p, exist_ok=True)
            open(os.path.join(p, "index.html"), "w", encoding="utf-8").write(pagina(lg, d, m, a, b, todos)); n += 1
    print("duelos:", len(todos), "pares ->", n, "páginas")
