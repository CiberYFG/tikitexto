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
