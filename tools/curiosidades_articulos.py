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
from articulos_f import ARTICULOS_F
from articulos_g import ARTICULOS_G
from articulos_h import ARTICULOS_H
from articulos_i import ARTICULOS_I
from articulos_j import ARTICULOS_J
from articulos_k import ARTICULOS_K
from articulos_l import ARTICULOS_L
from articulos_m import ARTICULOS_M
from articulos_n import ARTICULOS_N
from articulos_o import ARTICULOS_O
from articulos_meta import ORO

ARTICULOS = ARTICULOS_A + ARTICULOS_B + ARTICULOS_C + ARTICULOS_D + ARTICULOS_E + ARTICULOS_F + ARTICULOS_G + ARTICULOS_H + ARTICULOS_I + ARTICULOS_J + ARTICULOS_K + ARTICULOS_L + ARTICULOS_M + ARTICULOS_N + ARTICULOS_O
SLUGS = {a["slug"] for a in ARTICULOS}
FECHA = "Artículo de TIKITEXTO · 3 de noviembre de 2026"
FECHA_L = "Artículo de TIKITEXTO · 15 de noviembre de 2026"
FECHA_M = "Artículo de TIKITEXTO · 18 de noviembre de 2026"
FECHA_N = "Artículo de TIKITEXTO · 23 de noviembre de 2026"
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
    h = solo_es(h, m["c"]).replace(L.ui["checked"], (FECHA_N if (a in ARTICULOS_N or a in ARTICULOS_O) else FECHA_M if a in ARTICULOS_M else FECHA_L if a in ARTICULOS_L else FECHA) + f" · {mins(a)} min de lectura")
    if a["slug"] in ORO:
        h = C.inyecta_css(h, HERO_ORO)
        h += '<a class="oro-cab" href="/articulos/balon-de-oro/">🏆 BALÓN DE ORO · toda la categoría</a>\n'
    h += '<p class="fecha">Por el <a href="/sobre-tikitexto.html">equipo editorial de TIKITEXTO</a> · <a href="/sobre-tikitexto.html#editorial">cómo elaboramos el contenido</a> · <a href="/contacto.html">¿Algún error? Escríbenos</a></p>\n'
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
    from articulos_meta import CATS
    for _, em, tit, _d, col, sls in CATS:
        if a["slug"] in sls:
            otros = [s for s in sls if s != a["slug"] and s in por and s not in a["relac"]]
            if otros:
                h += f'<h2>Más sobre: {e(tit)}</h2>\n<ul style="margin:0 0 18px;padding-left:20px;line-height:1.7">\n' + "".join(f'<li><a href="/articulos/{s}/">{e(por[s]["titulo"])}</a></li>\n' for s in otros) + '</ul>\n'
            break
    return ruta, h + pie(L, "", False)

HERO_ORO = """
.hero { background: linear-gradient(135deg, #5c4000 0%, #9a7208 55%, #6b4a00 100%) !important; }
:root[data-tema="oscuro"] .hero { background: linear-gradient(135deg, #2b1f00 0%, #6a4d00 55%, #3a2a00 100%) !important; }
.hero::before { background: repeating-conic-gradient(from 0deg, rgba(255,226,122,.24) 0 5deg, rgba(255,226,122,0) 5deg 14deg) !important; }
.hero::after { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; background: linear-gradient(105deg, transparent 38%, rgba(255,236,150,.5) 50%, transparent 62%); background-size: 250% 100%; animation: oroBarrido 4.5s linear infinite; }
.hero h1 { text-shadow: 0 2px 10px rgba(0,0,0,.45); }
.articulo h2::before { background: linear-gradient(135deg, #f5c542, #b8860b) !important; color: #3a2a00 !important; }
.caja { border-left-color: #e8b923 !important; }
@media (prefers-reduced-motion: reduce) { .hero::after { animation: none; } }
"""
ORO_DESC = ("Todo sobre el Balón de Oro en un solo sitio: cómo se elige, quién lo ha ganado, qué países y clubes dominan, "
            "el Balón de Oro femenino, los trofeos de la gala, la relación con el Mundial y la edad de los ganadores. Estadística propia y fuentes oficiales.")

def oro_hub(L):
    ruta = HUB + "/balon-de-oro/"
    h = cabecera(L, "Balón de Oro: ganadores, récords y estadísticas propias | TIKITEXTO", ORO_DESC, ruta, "BALÓN DE ORO", C.BALON)
    h = solo_es(h, ("#b8860b", "#f5c542")).replace(L.ui["checked"], FECHA_L)
    h = C.inyecta_css(h, HERO_ORO)
    h += f'<div class="caja">🏆 {e(ORO_DESC)}</div>\n'
    h += '<div class="bus" data-buscador></div><script src="/buscador.js" defer></script>\n'
    h += ('<h2>Qué es el Balón de Oro</h2>\n'
          '<p>El Balón de Oro es el premio individual más prestigioso del fútbol. Lo concede la revista francesa France Football desde 1956, cuando lo ganó el inglés Stanley Matthews, y se vota por jurado de periodistas. '
          'En 2020 no se entregó por la pandemia, así que hasta 2026 se han concedido 70 premios masculinos a 48 jugadores distintos. Desde 2018 existe también una versión femenina.</p>\n'
          '<p>En esta categoría reunimos artículos propios, no resúmenes de otras webs: unos explican las reglas y la historia del premio y otros analizan los datos con estadística de TIKITEXTO, como los clubes y ligas de los ganadores, su edad por décadas o la relación entre el Mundial y el premio.</p>\n')
    h += '<h2>Los artículos de BALÓN DE ORO</h2>\n' + C.tarjetas_articulos(ORO)
    h += ('<h2>Datos rápidos</h2>\n<ul>\n'
          '<li>Primer ganador: Stanley Matthews, en 1956.</li>\n'
          '<li>Más premios: Lionel Messi (8) y Cristiano Ronaldo (5); entre ambos suman 13 de los 70.</li>\n'
          '<li>Único portero ganador: Lev Yashin, en 1963.</li>\n'
          '<li>Último ganador: Harry Kane, en 2026, el primer inglés desde Michael Owen en 2001.</li>\n'
          '<li>Balón de Oro femenino: desde 2018; Alexia Putellas y Aitana Bonmatí tienen tres cada una.</li>\n'
          '<li>Por clubes (recuento propio): Real Madrid y Barcelona, 12 cada uno.</li>\n</ul>\n')
    h += ('<h2>Más datos del Balón de Oro en TIKITEXTO</h2>\n<p class="chips" style="--c:#b8860b">'
          '<a href="/curiosidades/balon-de-oro-ganadores/">Ganadores y récords</a>'
          '<a href="/curiosidades/curiosidades-balon-de-oro/">Datos curiosos</a>'
          '<a href="/curiosidades/curiosidades-por-temas/">Curiosidades por temas</a></p>\n')
    h += C.faq(L, [
        ("¿Quién ha ganado más Balones de Oro?", "", "Lionel Messi, con ocho. Le sigue Cristiano Ronaldo, con cinco.", ""),
        ("¿Quién ganó el Balón de Oro 2026?", "", "Harry Kane, delantero inglés del Bayern de Múnich, en la gala celebrada en el London Palladium.", ""),
        ("¿Quién ganó el primer Balón de Oro?", "", "El inglés Stanley Matthews, en 1956.", ""),
        ("¿Hay Balón de Oro femenino?", "", "Sí, desde 2018. Alexia Putellas (2021, 2022 y 2026) y Aitana Bonmatí (2023, 2024 y 2025) tienen tres cada una.", "")])
    return ruta, h + pie(L, "", False)

def hub(L):
    ruta = HUB + "/"
    h = cabecera(L, HUB_T + " | TIKITEXTO", HUB_D, ruta, HUB_T, LIBRO)
    h = solo_es(h).replace(L.ui["checked"], FECHA)
    h = C.inyecta_css(h, C.CSS_TC)
    h += f'<div class="caja">{e(HUB_D)}</div>\n'
    h += '<div class="bus" data-buscador></div><script src="/buscador.js" defer></script>\n'
    h += '<h2 class="tema-h">Elige un tema</h2>\n' + C.cats_articulos("art")
    return ruta, h + pie(L, "", False)

if __name__ == "__main__":
    C.LANGS = ["es"]
    L = Idioma("es")
    out = []
    for ruta, cont in [hub(L), oro_hub(L)] + [pagina(L, a) for a in ARTICULOS]:
        cont = C.con_huecos(L, cont)
        d = os.path.join(C.RAIZ, ruta); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont); out.append(ruta)
    print(len(out), "páginas")
