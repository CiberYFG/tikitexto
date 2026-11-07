#!/usr/bin/env python3
"""Artículos largos de análisis (solo español): carpeta articulos/ + índice.
Textos en articulos_a.py, articulos_b.py y articulos_c.py.
Orden: curiosidades.py -> curiosidades_datos.py -> curiosidades_historia.py -> curiosidades_temas.py -> curiosidades_articulos.py -> seo.py"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
from articulos_meta import meta
from curiosidades import e, cabecera, pie, Idioma, LIBRO
from articulos_a import ARTICULOS_A
from articulos_b import ARTICULOS_B
from articulos_c import ARTICULOS_C
from articulos_d import ARTICULOS_D
from articulos_e import ARTICULOS_E

ARTICULOS = ARTICULOS_A + ARTICULOS_B + ARTICULOS_C + ARTICULOS_D + ARTICULOS_E
SLUGS = {a["slug"] for a in ARTICULOS}
FECHA = "Artículo de TIKITEXTO · 3 de noviembre de 2026"
HUB = "articulos"
HUB_T = "Artículos de fútbol: análisis, reglas e historia explicados"
HUB_D = "Artículos largos y originales sobre fútbol: reglas, posiciones, tácticas, Balón de Oro, penaltis, fuera de juego, xG, fichajes y dorsales."
EXTRA_CSS = ".articulo p { font-size: 1.06rem; line-height: 1.78; margin: 0 0 17px; max-width: 72ch; } .articulo h2 { margin-top: 34px; } .articulo .fuentes { font-size: .92rem; color: var(--suave); }"

def solo_es(h, col=None):
    """cabecera() genera hreflang y selector de 6 idiomas: estas páginas solo existen en español"""
    h = re.sub(r'<link rel="alternate" hreflang="(?!es")(?!x-default")[^>]*>\n', "", h)
    h = re.sub(r'<p class="idiomas"[^\n]*</p>\n', "", h)
    css = EXTRA_CSS + C.CSS_TC
    if col:
        l, d = col
        css += (f":root {{ --c: {l}; }} :root[data-tema=\"oscuro\"] {{ --c: {d}; }} "
                f".hero, :root[data-tema=\"oscuro\"] .hero {{ background: radial-gradient(120% 100% at 50% 0%, color-mix(in srgb, var(--c) 78%, #fff) 0%, color-mix(in srgb, var(--c) 78%, #000) 55%, color-mix(in srgb, var(--c) 35%, #000) 100%); }} "
                ".articulo { counter-reset: sec; } .articulo h2 { counter-increment: sec; display: flex; align-items: center; gap: 12px; border-left: 0; padding-left: 0; } "
                ".articulo h2::before { content: counter(sec); flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--c); color: #fff; font-size: .95rem; } "
                ".indice a { border-color: color-mix(in srgb, var(--c) 40%, transparent); } .indice a:hover { border-color: var(--c); background: color-mix(in srgb, var(--c) 12%, var(--caja)); } "
                ".caja { border-left: 8px solid var(--c); }")
    return h.replace("</style>", css + "\n</style>", 1)

def ruta_de(slug):
    return ("articulos/" if slug in SLUGS else "curiosidades/") + slug + "/"

def mins(a):
    return sum(len(p.split()) for _, ps in a["secciones"] for p in ps) // 200 + 1

def pagina(L, a):
    ruta = "articulos/" + a["slug"] + "/"
    m = meta(a["slug"])
    h = cabecera(L, a["titulo"] + " | TIKITEXTO", a["desc"], ruta, a["titulo"], LIBRO)
    h = solo_es(h, m["c"]).replace(L.ui["checked"], FECHA + f" · {mins(a)} min de lectura")
    h += f'<div class="caja">{m["e"]} {e(a["resumen"])}</div>\n'
    h += '<p class="indice">' + "".join(f'<a href="#s{i}">{e(t)}</a>' for i, (t, _) in enumerate(a["secciones"])) + '</p>\n<div class="articulo">\n'
    for i, (t, ps) in enumerate(a["secciones"]):
        h += f'<h2 id="s{i}">{e(t)}</h2>\n' + "".join(f"<p>{e(p.replace(' %', chr(160) + '%'))}</p>\n" for p in ps)
    h += '</div>\n'
    h += C.faq(L, a.get("faq", []))
    fu = []
    for n, u in a["fuentes"]:
        fu.append(f'<a href="{u}" rel="noopener" target="_blank">{e(n)}</a>' if u else e(n))
    h += f'<p class="fecha fuentes">Fuentes y notas: {" · ".join(fu)}. Texto redactado por el equipo de TIKITEXTO a partir de la información pública de las organizaciones citadas. Si detectas un error o una cifra desactualizada, escríbenos desde la página de contacto y lo corregiremos.</p>\n'
    por = {x["slug"]: x for x in ARTICULOS}
    h += '<div class="gr" style="--c:%s"><h2>Te puede interesar</h2><a class="todo" href="/%s/">Todos los artículos →</a></div>\n<div class="tarjetas">\n' % (m["c"][0], HUB)
    for r in a["relac"]:
        if r in por:
            x = por[r]; mr = meta(r)
            h += f'<a class="tarjeta tc" href="/{ruta_de(r)}" style="--c:{mr["c"][0]}"><span class="emo" aria-hidden="true">{mr["e"]}</span><b>{e(x["titulo"])}</b><span class="min">{mins(x)} min de lectura</span></a>\n'
        else:
            h += f'<a class="tarjeta tc" href="/{ruta_de(r)}" style="--c:{m["c"][0]}"><span class="emo" aria-hidden="true">⚽</span><b>{e(r.replace("-", " ").capitalize())}</b></a>\n'
    h += '</div>\n'
    return ruta, h + pie(L, "", False)

def hub(L):
    ruta = HUB + "/"
    h = cabecera(L, HUB_T + " | TIKITEXTO", HUB_D, ruta, HUB_T, LIBRO)
    h = solo_es(h).replace(L.ui["checked"], FECHA)
    h += f'<div class="caja">{e(HUB_D)}</div>\n<div class="tarjetas">\n'
    for a in ARTICULOS:
        m = meta(a["slug"])
        h += f'<a class="tarjeta tc" href="/{HUB}/{a["slug"]}/" style="--c:{m["c"][0]}"><span class="emo" aria-hidden="true">{m["e"]}</span><b>{e(a["titulo"])}</b><span>{e(a["desc"][:110].rsplit(" ", 1)[0])}…</span><span class="min">{mins(a)} min de lectura</span></a>\n'
    return ruta, h + '</div>\n' + pie(L, "", False)

if __name__ == "__main__":
    C.LANGS = ["es"]
    L = Idioma("es")
    out = []
    for ruta, cont in [hub(L)] + [pagina(L, a) for a in ARTICULOS]:
        cont = C.con_huecos(L, cont)
        d = os.path.join(C.RAIZ, ruta); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont); out.append(ruta)
    print(len(out), "páginas")
