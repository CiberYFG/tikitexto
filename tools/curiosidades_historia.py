#!/usr/bin/env python3
"""Páginas de historia (es/en): las últimas 20 finales de la Champions y los Mundiales edición por edición.
Orden: curiosidades.py -> curiosidades_datos.py -> curiosidades_historia.py -> seo.py
Datos en tools/hist_data.py (Wikipedia: List of European Cup and UEFA Champions League finals; FIFA World Cup)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
import curiosidades_datos as D
from curiosidades import e, tabla, cabecera, pie, entrada, Idioma, COPA, BALON
import hist_data as H
C.LANGS = ["es", "en"]
LANGS = C.LANGS
DOM = C.DOM if hasattr(C, "DOM") else "https://tikitexto.com/"
W = "https://en.wikipedia.org/wiki/"

# slug es, slug en, título es/en, descripción es/en, fecha es/en, icono
PAGINAS = [
 dict(es="champions-20-anos", en="champions-league-last-20-finals", ic=COPA,
      t=("Las últimas 20 finales de la Champions League: historia y curiosidades", "The last 20 Champions League finals: history and curiosities"),
      d=("Todas las finales de la Champions de 2007 a 2026: marcador, estadio, asistencia, goleadores y la curiosidad de cada una.",
         "Every Champions League final from 2007 to 2026: score, stadium, attendance, scorers and the story behind each one."),
      fecha=("Datos a 31 de octubre de 2026", "Data as of 31 October 2026")),
 dict(es="mundiales-edicion-por-edicion", en="world-cups-edition-by-edition", ic=BALON,
      t=("Todos los Mundiales de fútbol, edición por edición (1930-2026)", "Every FIFA World Cup, edition by edition (1930–2026)"),
      d=("Historia de los 23 Mundiales: campeón, subcampeón, sede, máximo goleador y una curiosidad de cada edición.",
         "The story of all 23 World Cups: champion, runner-up, host, top scorer and a curiosity from every edition."),
      fecha=("Datos a 19 de julio de 2026", "Data as of 19 July 2026")),
]
for p in PAGINAS: D.todas_slugs[p["es"]] = D.todas_slugs[p["en"]] = (p["es"], p["en"])

def num(L, n): return f"{n:,}".replace(",", "." if L.lang == "es" else ",")

def champions(L, p):
    es = L.lang == "es"; k = 0 if es else 1
    ruta = "curiosidades/" + p[L.lang] + "/"
    h = cabecera(L, p["t"][k] + " | TIKITEXTO", p["d"][k], ruta, p["t"][k], p["ic"])
    h = D.alinear(L, h, ruta, p[L.lang], (p["es"], p["en"]))
    h = h.replace(L.ui["checked"], p["fecha"][k])
    h += f'<div class="caja">{e(p["d"][k])} ' + e("Veinte temporadas, de Atenas 2007 a Budapest 2026, con cuatro finales decididas en los penaltis y dos trasladadas por la pandemia y la guerra." if es else "Twenty seasons, from Athens 2007 to Budapest 2026, with four finals decided on penalties and two relocated because of the pandemic and the war.") + '</div>\n'
    h += '<p class="indice">' + "".join(f'<a href="#f{r[0]}">{r[0]}</a>' for r in reversed(H.CHAMPIONS)) + '</p>\n'
    h += tabla([("Año", "Campeón", "Subcampeón", "Resultado", "Sede") if es else ("Year", "Champion", "Runner-up", "Result", "Venue")][0],
               [(r[0], D.celda(L, r[1]), D.celda(L, r[2]), D.celda(L, r[3]), (r[4] if es else H_EN_CITY.get(r[4], r[4]))) for r in reversed(H.CHAMPIONS)])
    for r in reversed(H.CHAMPIONS):
        ano, camp, sub, res, ciudad, est, asis = r[:7]
        tit = r[7 + k]; ps = r[9 + k]; dato = r[11 + k]
        camp, sub = D.celda(L, camp), D.celda(L, sub)
        ciu = ciudad if es else H_EN_CITY.get(ciudad, ciudad)
        res2 = D.celda(L, res)
        if asis:
            sede = (f"{est} ({ciu}) · {num(L, asis)} espectadores" if es else f"{est} ({ciu}) · attendance {num(L, asis)}")
        else:
            sede = (f"{est} ({ciu}) · a puerta cerrada" if es else f"{est} ({ciu}) · behind closed doors")
        cab = f"{camp} {res2} {sub}"
        parr = [f"<b>{e(cab)}</b> · {e(sede)}."] + [e(x) for x in ps]
        h += entrada(L, p["ic"], str(ano), e(tit), parr, e(dato), f"f{ano}")
    srcs = f'<a href="{W}List_of_European_Cup_and_UEFA_Champions_League_finals" rel="noopener" target="_blank">Wikipedia · List of European Cup and UEFA Champions League finals</a>'
    h += f'<p class="fecha">{"Fuente" if es else "Source"}: {srcs}. {e(p["fecha"][k])}.</p>\n'
    return ruta, h + pie(L)

def mundiales(L, p):
    es = L.lang == "es"; k = 0 if es else 1
    ruta = "curiosidades/" + p[L.lang] + "/"
    h = cabecera(L, p["t"][k] + " | TIKITEXTO", p["d"][k], ruta, p["t"][k], p["ic"])
    h = D.alinear(L, h, ruta, p[L.lang], (p["es"], p["en"]))
    h = h.replace(L.ui["checked"], p["fecha"][k])
    h += f'<div class="caja">{e(p["d"][k])}</div>\n'
    h += '<p class="indice">' + "".join(f'<a href="#m{r[0]}">{r[0]}</a>' for r in reversed(H.MUNDIALES)) + '</p>\n'
    for r in reversed(H.MUNDIALES):
        ano, sede, camp, sub, final, goleador, n, t_es, t_en, x_es, x_en = r
        camp_, sub_ = D.P(L, camp), D.P(L, sub)
        sede_ = sede if es else H_EN_HOST.get(sede, D.P(L, sede))
        fin = D.celda(L, final)
        if es:
            ficha = f"<b>Final:</b> {e(camp_)} {e(fin)} {e(sub_)} · <b>Sede:</b> {e(sede_)} · <b>Selecciones:</b> {n} · <b>Máximo goleador:</b> {e(goleador)}."
        else:
            ficha = f"<b>Final:</b> {e(camp_)} {e(fin)} {e(sub_)} · <b>Host:</b> {e(sede_)} · <b>Teams:</b> {n} · <b>Top scorer:</b> {e(goleador.replace('Seis jugadores', 'Six players').replace(' y ', ' and '))}."
        h += entrada(L, p["ic"], str(ano), e(t_es if es else t_en), [ficha, e(x_es if es else x_en)], None, f"m{ano}")
    srcs = f'<a href="{W}FIFA_World_Cup" rel="noopener" target="_blank">Wikipedia · FIFA World Cup</a>'
    h += f'<p class="fecha">{"Fuente" if es else "Source"}: {srcs}. {e(p["fecha"][k])}.</p>\n'
    return ruta, h + pie(L)

H_EN_CITY = {"Atenas": "Athens", "Moscú": "Moscow", "Roma": "Rome", "Madrid": "Madrid", "Londres": "London", "Múnich": "Munich", "Lisboa": "Lisbon",
             "Milán": "Milan", "Berlín": "Berlin", "Kiev": "Kyiv", "Oporto": "Porto", "París": "Paris", "Estambul": "Istanbul", "Cardiff": "Cardiff", "Budapest": "Budapest"}
H_EN_HOST = {"Estados Unidos, México y Canadá": "United States, Mexico and Canada", "Corea del Sur y Japón": "South Korea and Japan"}

def cards(L):
    k = 0 if L.lang == "es" else 1
    return "".join(f'<a class="tarjeta" href="{L.url("curiosidades/" + p[L.lang] + "/")}">{p["ic"]}<b>{e(p["t"][k])}</b><span>{e(p["fecha"][k])}</span></a>\n' for p in PAGINAS)

if __name__ == "__main__":
    out = []
    for lg in LANGS:
        L = Idioma(lg)
        for p, fn in zip(PAGINAS, (champions, mundiales)):
            ruta, cont = fn(L, p)
            cont = C.con_huecos(L, cont)
            d = os.path.join(C.RAIZ, L.prefix + ruta)
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont)
            out.append(L.prefix + ruta)
    print(len(out), "páginas"); print("\n".join(out))
