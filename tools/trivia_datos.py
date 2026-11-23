# -*- coding: utf-8 -*-
"""Genera /trivia_datos.js: hechos para Trivia TIKITEXTO (módulo ES, 6 idiomas).
Todo sale de datos ya contrastados del repositorio: tools/hist_data.py (finales de Champions 2007-2026 y Mundiales),
tools/curiosidades.py (campeones de la Copa de Europa/Champions 1956-2026) y la lista del Balón de Oro (France Football).
Orden: ... -> curiosidades_historia.py -> trivia_datos.py -> seo.py -> csp.py -> buscador.py (solo hace falta regenerar si cambian los datos)."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import hist_data as H
import curiosidades as C

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FECHA = "21-nov-2026"

# Balón de Oro masculino (France Football). 2020 no se entregó. 2025: Dembélé; 2026: Kane.
ORO = [(1956, "Stanley Matthews"), (1957, "Alfredo Di Stéfano"), (1958, "Raymond Kopa"), (1959, "Alfredo Di Stéfano"), (1960, "Luis Suárez"),
       (1961, "Omar Sívori"), (1962, "Josef Masopust"), (1963, "Lev Yashin"), (1964, "Denis Law"), (1965, "Eusébio"), (1966, "Bobby Charlton"),
       (1967, "Flórián Albert"), (1968, "George Best"), (1969, "Gianni Rivera"), (1970, "Gerd Müller"), (1971, "Johan Cruyff"), (1972, "Franz Beckenbauer"),
       (1973, "Johan Cruyff"), (1974, "Johan Cruyff"), (1975, "Oleg Blokhin"), (1976, "Franz Beckenbauer"), (1977, "Allan Simonsen"), (1978, "Kevin Keegan"),
       (1979, "Kevin Keegan"), (1980, "Karl-Heinz Rummenigge"), (1981, "Karl-Heinz Rummenigge"), (1982, "Paolo Rossi"), (1983, "Michel Platini"),
       (1984, "Michel Platini"), (1985, "Michel Platini"), (1986, "Igor Belanov"), (1987, "Ruud Gullit"), (1988, "Marco van Basten"), (1989, "Marco van Basten"),
       (1990, "Lothar Matthäus"), (1991, "Jean-Pierre Papin"), (1992, "Marco van Basten"), (1993, "Roberto Baggio"), (1994, "Hristo Stoichkov"),
       (1995, "George Weah"), (1996, "Matthias Sammer"), (1997, "Ronaldo Nazário"), (1998, "Zinedine Zidane"), (1999, "Rivaldo"), (2000, "Luís Figo"),
       (2001, "Michael Owen"), (2002, "Ronaldo Nazário"), (2003, "Pavel Nedvěd"), (2004, "Andriy Shevchenko"), (2005, "Ronaldinho"), (2006, "Fabio Cannavaro"),
       (2007, "Kaká"), (2008, "Cristiano Ronaldo"), (2009, "Lionel Messi"), (2010, "Lionel Messi"), (2011, "Lionel Messi"), (2012, "Lionel Messi"),
       (2013, "Cristiano Ronaldo"), (2014, "Cristiano Ronaldo"), (2015, "Lionel Messi"), (2016, "Cristiano Ronaldo"), (2017, "Cristiano Ronaldo"),
       (2018, "Luka Modrić"), (2019, "Lionel Messi"), (2021, "Lionel Messi"), (2022, "Karim Benzema"), (2023, "Lionel Messi"), (2024, "Rodri"),
       (2025, "Ousmane Dembélé"), (2026, "Harry Kane")]

# nombres en es, en, pt, fr, it, de
N = {
 # clubes
 "Real Madrid": ["Real Madrid"] * 6, "Barcelona": ["Barcelona", "Barcelona", "Barcelona", "Barcelone", "Barcellona", "Barcelona"],
 "Atlético de Madrid": ["Atlético de Madrid", "Atlético Madrid", "Atlético de Madrid", "Atlético de Madrid", "Atlético Madrid", "Atlético Madrid"],
 "Milan": ["Milan", "AC Milan", "Milan", "Milan", "Milan", "AC Mailand"], "Inter": ["Inter", "Inter Milan", "Inter de Milão", "Inter Milan", "Inter", "Inter Mailand"],
 "Juventus": ["Juventus"] * 6, "Benfica": ["Benfica"] * 6, "Celtic": ["Celtic"] * 6, "Feyenoord": ["Feyenoord"] * 6, "Ajax": ["Ajax"] * 6,
 "Manchester United": ["Manchester United"] * 6, "Manchester City": ["Manchester City"] * 6, "Liverpool": ["Liverpool"] * 6, "Chelsea": ["Chelsea"] * 6,
 "Tottenham": ["Tottenham"] * 6, "Arsenal": ["Arsenal"] * 6, "Nottingham Forest": ["Nottingham Forest"] * 6, "Aston Villa": ["Aston Villa"] * 6,
 "Bayern de Múnich": ["Bayern de Múnich", "Bayern Munich", "Bayern de Munique", "Bayern Munich", "Bayern Monaco", "Bayern München"],
 "Borussia Dortmund": ["Borussia Dortmund"] * 6,
 "Hamburgo": ["Hamburgo", "Hamburg", "Hamburgo", "Hambourg", "Amburgo", "Hamburger SV"],
 "Steaua de Bucarest": ["Steaua de Bucarest", "Steaua Bucharest", "Steaua Bucareste", "Steaua Bucarest", "Steaua Bucarest", "Steaua Bukarest"],
 "Oporto": ["Oporto", "Porto", "Porto", "Porto", "Porto", "FC Porto"], "PSV Eindhoven": ["PSV Eindhoven"] * 6,
 "Estrella Roja": ["Estrella Roja", "Red Star Belgrade", "Estrela Vermelha", "Étoile rouge de Belgrade", "Stella Rossa", "Roter Stern Belgrad"],
 "Olympique de Marsella": ["Olympique de Marsella", "Marseille", "Olympique de Marselha", "Olympique de Marseille", "Olympique Marsiglia", "Olympique Marseille"],
 "París Saint-Germain": ["París Saint-Germain", "Paris Saint-Germain", "Paris Saint-Germain", "Paris Saint-Germain", "Paris Saint-Germain", "Paris Saint-Germain"],
 # selecciones y países
 "Uruguay": ["Uruguay"] * 6, "Argentina": ["Argentina"] * 6, "Italia": ["Italia", "Italy", "Itália", "Italie", "Italia", "Italien"],
 "Checoslovaquia": ["Checoslovaquia", "Czechoslovakia", "Tchecoslováquia", "Tchécoslovaquie", "Cecoslovacchia", "Tschechoslowakei"],
 "Francia": ["Francia", "France", "França", "France", "Francia", "Frankreich"], "Hungría": ["Hungría", "Hungary", "Hungria", "Hongrie", "Ungheria", "Ungarn"],
 "Brasil": ["Brasil", "Brazil", "Brasil", "Brésil", "Brasile", "Brasilien"], "Suiza": ["Suiza", "Switzerland", "Suíça", "Suisse", "Svizzera", "Schweiz"],
 "Alemania Occidental": ["Alemania Occidental", "West Germany", "Alemanha Ocidental", "Allemagne de l'Ouest", "Germania Ovest", "Westdeutschland"],
 "Alemania": ["Alemania", "Germany", "Alemanha", "Allemagne", "Germania", "Deutschland"], "Suecia": ["Suecia", "Sweden", "Suécia", "Suède", "Svezia", "Schweden"],
 "Chile": ["Chile", "Chile", "Chile", "Chili", "Cile", "Chile"], "Inglaterra": ["Inglaterra", "England", "Inglaterra", "Angleterre", "Inghilterra", "England"],
 "México": ["México", "Mexico", "México", "Mexique", "Messico", "Mexiko"], "Países Bajos": ["Países Bajos", "Netherlands", "Países Baixos", "Pays-Bas", "Paesi Bassi", "Niederlande"],
 "España": ["España", "Spain", "Espanha", "Espagne", "Spagna", "Spanien"], "Estados Unidos": ["Estados Unidos", "United States", "Estados Unidos", "États-Unis", "Stati Uniti", "USA"],
 "Corea del Sur": ["Corea del Sur", "South Korea", "Coreia do Sul", "Corée du Sud", "Corea del Sud", "Südkorea"], "Japón": ["Japón", "Japan", "Japão", "Japon", "Giappone", "Japan"],
 "Croacia": ["Croacia", "Croatia", "Croácia", "Croatie", "Croazia", "Kroatien"], "Catar": ["Catar", "Qatar", "Catar", "Qatar", "Qatar", "Katar"],
 "Rusia": ["Rusia", "Russia", "Rússia", "Russie", "Russia", "Russland"], "Sudáfrica": ["Sudáfrica", "South Africa", "África do Sul", "Afrique du Sud", "Sudafrica", "Südafrika"],
 "Canadá": ["Canadá", "Canada", "Canadá", "Canada", "Canada", "Kanada"],
 # ciudades
 "Atenas": ["Atenas", "Athens", "Atenas", "Athènes", "Atene", "Athen"], "Moscú": ["Moscú", "Moscow", "Moscou", "Moscou", "Mosca", "Moskau"],
 "Roma": ["Roma", "Rome", "Roma", "Rome", "Roma", "Rom"], "Londres": ["Londres", "London", "Londres", "Londres", "Londra", "London"],
 "Múnich": ["Múnich", "Munich", "Munique", "Munich", "Monaco di Baviera", "München"], "Lisboa": ["Lisboa", "Lisbon", "Lisboa", "Lisbonne", "Lisbona", "Lissabon"],
 "Milán": ["Milán", "Milan", "Milão", "Milan", "Milano", "Mailand"], "Berlín": ["Berlín", "Berlin", "Berlim", "Berlin", "Berlino", "Berlin"],
 "Kiev": ["Kiev", "Kyiv", "Kiev", "Kiev", "Kiev", "Kiew"], "Oporto (ciudad)": ["Oporto", "Porto", "Porto", "Porto", "Porto", "Porto"],
 "París": ["París", "Paris", "Paris", "Paris", "Parigi", "Paris"], "Estambul": ["Estambul", "Istanbul", "Istambul", "Istanbul", "Istanbul", "Istanbul"],
 "Cardiff": ["Cardiff"] * 6, "Budapest": ["Budapest", "Budapest", "Budapeste", "Budapest", "Budapest", "Budapest"], "Madrid": ["Madrid"] * 6,
}
PAIS_SEP = re.compile(r"\s+y\s+|,\s*")


def fail(msg):
    print("ERROR trivia_datos:", msg)
    sys.exit(1)


def clave_club(x):
    return x


def main():
    ch = {a: b for a, b in C.CHAMPIONS}
    finales = []
    for f in H.CHAMPIONS:
        y, camp, sub, res, ciu = f[0], f[1], f[2], f[3], f[4]
        if ch.get(y) != camp:
            fail("campeón %d no coincide: %s vs %s" % (y, ch.get(y), camp))
        finales.append([y, camp, sub, res, "Oporto (ciudad)" if ciu == "Oporto" else ciu])
    campeones = [[a, b] for a, b in C.CHAMPIONS]
    mund = []
    for m in H.MUNDIALES:
        y, sede, camp, sub, res, gol, nsel = m[:7]
        mm = re.match(r"^(.*) \((\d+)\)$", gol)
        scorer = None
        if mm and " y " not in mm.group(1) and not mm.group(1).startswith("Seis"):
            scorer = [mm.group(1), int(mm.group(2))]
        mund.append([y, [s for s in PAIS_SEP.split(sede) if s], camp, sub, res, scorer, nsel])
    # comprobaciones de nombres
    falta = set()
    for y, camp in campeones:
        if camp not in N: falta.add(camp)
    for f in finales:
        for k in (f[1], f[2], f[4]):
            if k not in N: falta.add(k)
    for m in mund:
        for k in m[1] + [m[2], m[3]]:
            if k not in N: falta.add(k)
    if falta:
        fail("faltan nombres: %s" % sorted(falta))
    for k, v in N.items():
        if len(v) != 6 or not all(v): fail("nombre incompleto " + k)
    años = [a for a, _ in ORO]
    if len(ORO) != 70 or len(set(n for _, n in ORO)) != 48 or 2020 in años:
        fail("Balón de Oro: %d premios, %d ganadores" % (len(ORO), len(set(n for _, n in ORO))))
    datos = {"fecha": FECHA, "N": N, "campeones": campeones, "finales": finales, "mundiales": mund, "oro": [list(x) for x in ORO]}
    js = ("/* TRIVIA TIKITEXTO · hechos (generado por tools/trivia_datos.py; no editar a mano).\n"
          "   Fuentes: UEFA.com (Copa de Europa y Champions League), FIFA.com (Mundiales) y France Football (Balón de Oro). Revisado el %s. */\n"
          "export const T = %s;\n") % (FECHA, json.dumps(datos, ensure_ascii=False, separators=(",", ":")))
    with open(os.path.join(RAIZ, "trivia_datos.js"), "w", encoding="utf-8") as f:
        f.write(js)
    print("trivia_datos.js:", len(js), "bytes;", len(campeones), "campeones,", len(finales), "finales,", len(mund), "mundiales,", len(ORO), "Balones de Oro")


if __name__ == "__main__":
    main()
