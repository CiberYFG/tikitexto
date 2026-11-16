#!/usr/bin/env python3
"""Páginas estáticas de duelos del COMPARADOR (es/en) para SEO: «X vs Y».
Datos: comparador_data.py. Rutas: comparador/<a>-vs-<b>/ y en/football-comparator/<a>-vs-<b>/.
Orden: ... -> comparador.py -> comparador_duelos.py -> seo.py -> csp.py -> buscador.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
from curiosidades import e, DOM, RAIZ
import comparador as CP
import comparador_data as CD

# Duelos extra a los de DATOS[modo]["duelos"] (pares famosos y muy buscados). Solo ids existentes.
EXTRA = {
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
            sobre="Sobre TIKITEXTO", fuentes="Fuentes", faqt="Preguntas frecuentes"),
 "en": dict(vs="vs", h="Head to head", full="{a} vs {b}: who has more trophies and records", t="{a} vs {b}: trophies and records compared | TIKITEXTO",
            d="{a} vs {b} head to head: {res} Full table with UEFA, FIFA and France Football data.",
            stat="Statistic", gana="Wins", empate="Tie", info="Informational", tab="Comparison table", ver="Duel summary",
            anim="See the animated duel", otros="More duels", com="Football comparator", cur="Trivia", jugar="⚽ Play",
            pt="points", leg="For information only: checked against UEFA, FIFA and France Football; height and weight are approximate profile values. No crests or photos.",
            sobre="About TIKITEXTO", fuentes="Fuentes", faqt="Frequently asked questions"),
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

def faq(lg, A, B, filas, pa, pb, bl):
    k = 0 if lg == "es" else 1; na, nb = nom(A, k), nom(B, k); qa = []
    res = resumen(lg, A, B, filas, pa, pb)
    qa.append((f"¿Quién tiene más títulos, {na} o {nb}?", f"Who has more trophies, {na} or {nb}?", res + " Mira la tabla para ver cada título por separado.", res + " See the table for each trophy separately."))
    for s, va, vb, g in filas:
        if g in ("a", "b") and s["k"] in ("bdo", "ucl_t", "ucl", "mundial", "wc", "ligas", "liga_t"):
            w, vw, vl = (na, va, vb) if g == "a" else (nb, vb, va)
            et_es, et_en = s["es"], s["en"]
            qa.append((f"¿Quién tiene más — {et_es} — entre {na} y {nb}?", f"Who has more — {et_en} — {na} or {nb}?",
                       f"{w}, con {vw} frente a {vl}.", f"{w}, with {vw} against {vl}."))
            break
    qa.append(("¿De dónde salen estos datos?", "Where does this data come from?",
               "De las bases oficiales de UEFA y FIFA, France Football y las webs de las federaciones. La fecha aparece al final de la página y los datos que no hemos podido contrastar se muestran con un guion.",
               "From UEFA and FIFA official records, France Football and federation websites. The date is shown at the bottom and unconfirmed figures appear as a dash."))
    return qa

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
<title>{e(titulo)}</title>
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
<section><h2>{e(t['tab'])}</h2>
<table><thead><tr><th>{e(t['stat'])}</th><th>{e(na)}</th><th>{e(nb)}</th></tr></thead><tbody>
{trs}</tbody></table></section>
<section>{fq}</section>
<section><h2>{e(t['otros'])}</h2><ul>{ol}</ul></section>
<section><h2>{e(t['fuentes'])}</h2><ul>{fu}</ul><p>{e(d['fecha'][k])}</p></section>
</div>
</main>
<p class="cp-legal">{e(t['leg'])}<br><a href="/sobre-tikitexto.html">{e(t['sobre'])}</a><a href="/aviso-legal.html">Legal</a><a href="/privacidad.html">{'Privacidad' if lg == 'es' else 'Privacy'}</a><a href="/cookies.html">Cookies</a></p>
</body>
</html>
"""

def rutas():
    d = CD.construir(); return [(m, a, b) for m, a, b in pares(d)]

if __name__ == "__main__":
    d = CD.construir(); d["fecha"] = list(CD.FECHA); todos = pares(d)
    ids = {m: {x["id"] for x in d[m]["items"]} for m, _ in CP.MODOS}
    n = 0
    for m, a, b in todos:
        assert a in ids[m] and b in ids[m], (m, a, b)
        for lg in ("es", "en"):
            base = {"es": "comparador/", "en": "en/football-comparator/"}[lg]
            p = os.path.join(RAIZ, base, f"{a}-vs-{b}"); os.makedirs(p, exist_ok=True)
            open(os.path.join(p, "index.html"), "w", encoding="utf-8").write(pagina(lg, d, m, a, b, todos)); n += 1
    print("duelos:", len(todos), "pares ->", n, "páginas")
