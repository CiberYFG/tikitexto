# -*- coding: utf-8 -*-
"""Páginas puente (meta refresh + canonical) para URLs retiradas que Google todavía muestra.
GitHub Pages no admite redirecciones 301, así que cada puente es un HTML mínimo (sin scripts ni CSP: no carga nada)
que lleva al visitante a la página equivalente y le dice a Google cuál es la canónica.
Solo se crea si la ruta NO existe ya como página real. Para retirar una página con impresiones en Search Console: añadirla a PUENTES.
Orden: independiente (se puede ejecutar en cualquier momento; regenerar.sh lo llama al final de los generadores)."""
import html, os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOM = "https://tikitexto.com/"

CLASES_ES = ["como-funciona-una-liga", "reglas-basicas-del-futbol", "saques-banda-meta-esquina"]
CLASES_EN = ["added-time-and-extra-time-explained", "basic-football-tactics", "basic-rules-of-football", "champions-league-format-explained",
             "football-statistics-explained", "football-transfers-loans-release-clauses", "fouls-free-kicks-and-advantage", "handball-rule-explained",
             "how-a-football-league-works", "how-a-football-tournament-is-won", "how-the-var-works", "offside-rule-explained",
             "penalty-kick-and-shootout-rules", "yellow-and-red-cards-explained"]
DUELOS_ES = ["liverpool-vs-man-united", "argentina-vs-brasil", "argentina-vs-francia", "atletico-vs-real-madrid", "barcelona-vs-bayern", "chelsea-vs-arsenal",
             "espana-vs-argentina", "espana-vs-portugal", "ferguson-vs-guardiola", "ferguson-vs-wenger", "flick-vs-luis-enrique", "francia-vs-inglaterra",
             "inter-vs-milan", "italia-vs-alemania", "italia-vs-uruguay", "juventus-vs-inter", "man-city-vs-liverpool", "messi-vs-maradona", "psg-vs-barcelona",
             "real-madrid-vs-barcelona", "real-madrid-vs-bayern", "real-madrid-vs-liverpool", "real-madrid-vs-milan"]
DUELOS_EN = ["ancelotti-vs-zidane", "atletico-vs-real-madrid", "barcelona-vs-bayern", "barcelona-vs-man-city", "bellingham-vs-yamal", "casillas-vs-ramos",
             "chelsea-vs-arsenal", "cristiano-vs-mbappe", "cristiano-vs-pele", "cruyff-vs-pele", "deschamps-vs-scaloni", "espana-vs-portugal", "flick-vs-luis-enrique",
             "francia-vs-inglaterra", "guardiola-vs-ancelotti", "guardiola-vs-klopp", "guardiola-vs-mourinho", "inglaterra-vs-alemania", "inter-vs-milan",
             "juventus-vs-inter", "liverpool-vs-man-united", "luis-enrique-vs-guardiola", "man-city-vs-arsenal", "man-city-vs-liverpool", "messi-vs-maradona",
             "messi-vs-mbappe", "modric-vs-iniesta", "mourinho-vs-klopp", "neymar-vs-messi", "pele-vs-maradona", "psg-vs-barcelona", "real-madrid-vs-barcelona",
             "real-madrid-vs-milan", "rodri-vs-pedri", "ronaldinho-vs-messi", "ronaldo9-vs-henry", "yamal-vs-vinicius", "zidane-vs-iniesta", "zidane-vs-luis-enrique"]

PUENTES = {}
PUENTES["clases/como-funciona-una-liga/"] = "articulos/formatos-de-competicion-liga-copa-y-playoff/"
PUENTES["clases/reglas-basicas-del-futbol/"] = "articulos/reglas-basicas-del-futbol-para-principiantes/"
PUENTES["clases/saques-banda-meta-esquina/"] = "clases/"
for s in CLASES_EN: PUENTES["en/classes/" + s + "/"] = "en/classes/"
for s in DUELOS_ES: PUENTES["comparador/" + s + "/"] = "comparador/"
for s in DUELOS_EN: PUENTES["en/football-comparator/" + s + "/"] = "en/football-comparator/"

PLANTILLA = """<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo}</title>
<link rel="canonical" href="{destino}">
<meta http-equiv="refresh" content="0; url={destino}">
</head>
<body>
<p><a href="{destino}">{texto}</a></p>
</body>
</html>
"""


def main():
    n = 0
    for origen, destino in PUENTES.items():
        p = os.path.join(RAIZ, origen, "index.html")
        if os.path.exists(p) and "http-equiv=\"refresh\"" not in open(p, encoding="utf-8").read(): continue  # página real: no se toca
        en = origen.startswith("en/")
        html_ = PLANTILLA.format(lang="en" if en else "es", destino=html.escape(DOM + destino), titulo="TIKITEXTO" ,
                                 texto="This page has moved. Continue to TIKITEXTO." if en else "Esta página se ha movido. Continuar en TIKITEXTO.")
        os.makedirs(os.path.dirname(p), exist_ok=True)
        if not os.path.exists(p) or open(p, encoding="utf-8").read() != html_:
            open(p, "w", encoding="utf-8").write(html_); n += 1
    print("puentes: %d páginas creadas o actualizadas (de %d)" % (n, len(PUENTES)))


if __name__ == "__main__":
    main()
