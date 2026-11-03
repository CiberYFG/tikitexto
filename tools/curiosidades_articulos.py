#!/usr/bin/env python3
"""Artículos largos de análisis (solo español): carpeta articulos/ + índice.
Textos en articulos_a.py, articulos_b.py y articulos_c.py.
Orden: curiosidades.py -> curiosidades_datos.py -> curiosidades_historia.py -> curiosidades_temas.py -> curiosidades_articulos.py -> seo.py"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
from curiosidades import e, cabecera, pie, Idioma, LIBRO
from articulos_a import ARTICULOS_A
from articulos_b import ARTICULOS_B
from articulos_c import ARTICULOS_C

ARTICULOS = ARTICULOS_A + ARTICULOS_B + ARTICULOS_C
SLUGS = {a["slug"] for a in ARTICULOS}
FECHA = "Artículo de TIKITEXTO · 3 de noviembre de 2026"
HUB = "articulos"
HUB_T = "Artículos de fútbol: análisis, reglas e historia explicados"
HUB_D = "Artículos largos y originales sobre fútbol: cómo se elige el Balón de Oro, la Bota de Oro, penaltis, fuera de juego, xG, fichajes, dorsales y estadísticas propias de TIKITEXTO."
EXTRA_CSS = ".articulo p { font-size: 1.06rem; line-height: 1.78; margin: 0 0 17px; max-width: 72ch; } .articulo h2 { margin-top: 34px; } .articulo .fuentes { font-size: .92rem; color: var(--suave); }"

def solo_es(h):
    """cabecera() genera hreflang y selector de 6 idiomas: estas páginas solo existen en español"""
    h = re.sub(r'<link rel="alternate" hreflang="(?!es")(?!x-default")[^>]*>\n', "", h)
    h = re.sub(r'<p class="idiomas"[^\n]*</p>\n', "", h)
    return h.replace("</style>", EXTRA_CSS + "\n</style>", 1)

def ruta_de(slug):
    return ("articulos/" if slug in SLUGS else "curiosidades/") + slug + "/"

def pagina(L, a):
    ruta = "articulos/" + a["slug"] + "/"
    h = cabecera(L, a["titulo"] + " | TIKITEXTO", a["desc"], ruta, a["titulo"], LIBRO)
    h = solo_es(h).replace(L.ui["checked"], FECHA)
    h += f'<div class="caja">{e(a["resumen"])}</div>\n'
    h += '<p class="indice">' + "".join(f'<a href="#s{i}">{e(t)}</a>' for i, (t, _) in enumerate(a["secciones"])) + '</p>\n<div class="articulo">\n'
    for i, (t, ps) in enumerate(a["secciones"]):
        h += f'<h2 id="s{i}">{e(t)}</h2>\n' + "".join(f"<p>{e(p.replace(' %', chr(160) + '%'))}</p>\n" for p in ps)
    h += '</div>\n'
    fu = []
    for n, u in a["fuentes"]:
        fu.append(f'<a href="{u}" rel="noopener" target="_blank">{e(n)}</a>' if u else e(n))
    h += f'<p class="fecha fuentes">Fuentes y notas: {" · ".join(fu)}. Texto redactado por el equipo de TIKITEXTO a partir de la información pública de las organizaciones citadas. Si detectas un error o una cifra desactualizada, escríbenos desde la página de contacto y lo corregiremos.</p>\n'
    rel = [r for r in a["relac"]]
    nombres = {x["slug"]: x["titulo"] for x in ARTICULOS}
    h += '<h2>Sigue leyendo</h2>\n<p class="indice">' + "".join(
        f'<a href="/{ruta_de(r)}">{e(nombres.get(r, r.replace("-", " ").capitalize()))}</a>' for r in rel) + f'<a href="/{HUB}/">Todos los artículos</a></p>\n'
    return ruta, h + pie(L)

def hub(L):
    ruta = HUB + "/"
    h = cabecera(L, HUB_T + " | TIKITEXTO", HUB_D, ruta, HUB_T, LIBRO)
    h = solo_es(h).replace(L.ui["checked"], FECHA)
    h += f'<div class="caja">{e(HUB_D)}</div>\n<div class="tarjetas">\n'
    for a in ARTICULOS:
        palabras = sum(len(p.split()) for _, ps in a["secciones"] for p in ps)
        h += f'<a class="tarjeta" href="/{HUB}/{a["slug"]}/">{LIBRO}<b>{e(a["titulo"])}</b><span>{e(a["desc"][:110].rsplit(" ", 1)[0])}… · {palabras // 200 + 1} min de lectura</span></a>\n'
    return ruta, h + '</div>\n' + pie(L)

if __name__ == "__main__":
    C.LANGS = ["es"]
    L = Idioma("es")
    out = []
    for ruta, cont in [hub(L)] + [pagina(L, a) for a in ARTICULOS]:
        cont = C.con_huecos(L, cont)
        d = os.path.join(C.RAIZ, ruta); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont); out.append(ruta)
    print(len(out), "páginas")
