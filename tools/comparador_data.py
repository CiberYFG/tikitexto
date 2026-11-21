#!/usr/bin/env python3
"""Datos del COMPARADOR TIKITEXTO (16-nov-2026). Se exportan a /comparador_datos.js (lo lee comparador.js) y se usan para las tablas estáticas de las páginas.
Reglas: solo cifras que se pueden contrastar (UEFA, FIFA, RSSSF, France Football, webs de clubes/federaciones). Si una cifra no está clara, va a None
(se muestra «—» y no cuenta para el marcador). Los títulos de Champions de los clubes, los Mundiales y las finales se CALCULAN desde hist_data.py.
Sin escudos, fotos ni logos: cada ficha lleva solo dos colores para el brillo.
Actualizar tras cada temporada/Mundial: títulos, goles y partidos de los jugadores en activo, y las ligas de los clubes."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hist_data as H

FECHA = ("Datos a 21 de noviembre de 2026", "Data as of 21 November 2026")

# ───────────────────────── estadísticas por modo ─────────────────────────
# (clave, español, inglés, unidad, ganador: 1 = más es mejor · 0 = solo informativo)
STATS = {
 "jugadores": [
  ("bdo", "Balones de Oro", "Ballons d'Or", "", 1),
  ("ucl_t", "Champions League ganadas", "Champions League titles", "", 1),
  ("mundial", "Mundiales ganados", "World Cups won", "", 1),
  ("cont", "Eurocopas / Copas América", "Euros / Copa Américas", "", 1),
  ("botas", "Botas de Oro europeas", "European Golden Shoes", "", 1),
  ("ucl_g", "Goles en Champions", "Champions League goals", "", 1),
  ("ucl_p", "Partidos en Champions", "Champions League games", "", 1),
  ("sel_g", "Goles con la selección", "International goals", "", 1),
  ("sel_p", "Partidos con la selección", "International caps", "", 1),
  ("wc_g", "Goles en Mundiales", "World Cup goals", "", 1),
  ("alt", "Altura", "Height", " cm", 0),
  ("peso", "Peso (aprox.)", "Weight (approx.)", " kg", 0),
  ("nac", "Año de nacimiento", "Year of birth", "", 0),
 ],
 "equipos": [
  ("ucl", "Copas de Europa / Champions", "European Cups / Champions Leagues", "", 1),
  ("liga_t", "Ligas nacionales", "Domestic league titles", "", 1),
  ("mcl", "Mundiales de clubes FIFA", "FIFA Club World Cups", "", 1),
  ("fin", "Finales de Champions (2007-2026)", "Champions League finals (2007–2026)", "", 1),
  ("fin_g", "Finales ganadas (2007-2026)", "Finals won (2007–2026)", "", 1),
  ("fund", "Año de fundación", "Year founded", "", 0),
 ],
 "selecciones": [
  ("wc", "Mundiales ganados", "World Cups won", "", 1),
  ("wc_f", "Finales perdidas del Mundial", "World Cup finals lost", "", 0),
  ("cont", "Eurocopas / Copas América", "Euros / Copa Américas", "", 1),
  ("bdo", "Balones de Oro de sus jugadores", "Ballons d'Or won by its players", "", 1),
  ("gol", "Goles del máximo goleador", "Goals by the top scorer", "", 1),
 ],
 "entrenadores": [
  ("ucl", "Champions League ganadas", "Champions League titles", "", 1),
  ("mundial", "Mundiales como seleccionador", "World Cups as manager", "", 1),
  ("cont", "Eurocopas / Copas América como seleccionador", "Euros / Copa Américas as manager", "", 1),
  ("ligas", "Ligas nacionales ganadas", "League titles won", "", 1),
  ("nac", "Año de nacimiento", "Year of birth", "", 0),
 ],
}
# ejes del radar (claves de arriba)
RADAR = {
 "jugadores": ["bdo", "ucl_t", "mundial", "ucl_g", "sel_g", "botas"],
 "equipos": ["ucl", "liga_t", "mcl", "fin", "fin_g"],
 "selecciones": ["wc", "wc_f", "cont", "bdo", "gol"],
 "entrenadores": ["ucl", "mundial", "cont", "ligas"],
}

# ───────────────────────── jugadores ─────────────────────────
# id, nombre, (posición es, en), (país es, en), color1, color2, datos
P = lambda **k: k
JUGADORES = [
 ("messi", "Lionel Messi", ("Delantero", "Forward"), ("Argentina", "Argentina"), "#6cc0ff", "#ffffff",
  P(nac=1987, alt=170, peso=72, bdo=8, ucl_t=4, mundial=1, cont=2, botas=6, ucl_g=129, ucl_p=163, sel_g=126, sel_p=208, wc_g=21)),
 ("cristiano", "Cristiano Ronaldo", ("Delantero", "Forward"), ("Portugal", "Portugal"), "#ff3d4d", "#17c964",
  P(nac=1985, alt=187, peso=83, bdo=5, ucl_t=5, mundial=0, cont=1, botas=4, ucl_g=140, ucl_p=183, sel_g=146, sel_p=234, wc_g=11)),
 ("mbappe", "Kylian Mbappé", ("Delantero", "Forward"), ("Francia", "France"), "#2f6bff", "#ff3d4d",
  P(nac=1998, alt=178, peso=73, bdo=0, ucl_t=0, mundial=1, cont=0, botas=1, ucl_g=74, ucl_p=102, sel_g=None, sel_p=None, wc_g=22)),
 ("haaland", "Erling Haaland", ("Delantero", "Forward"), ("Noruega", "Norway"), "#6cd3ff", "#ff3d4d",
  P(nac=2000, alt=195, peso=88, bdo=0, ucl_t=1, mundial=0, cont=0, botas=1, ucl_g=62, ucl_p=61, sel_g=None, sel_p=None, wc_g=7)),
 ("yamal", "Lamine Yamal", ("Delantero", "Forward"), ("España", "Spain"), "#ff3d4d", "#ffd23a",
  P(nac=2007, alt=180, peso=None, bdo=0, ucl_t=0, mundial=1, cont=1, botas=0, ucl_g=None, ucl_p=None, sel_g=None, sel_p=None, wc_g=None)),
 ("lewandowski", "Robert Lewandowski", ("Delantero", "Forward"), ("Polonia", "Poland"), "#ff3d4d", "#ffffff",
  P(nac=1988, alt=185, peso=80, bdo=0, ucl_t=1, mundial=0, cont=0, botas=2, ucl_g=109, ucl_p=144, sel_g=89, sel_p=167, wc_g=None)),
 ("benzema", "Karim Benzema", ("Delantero", "Forward"), ("Francia", "France"), "#2f6bff", "#ffffff",
  P(nac=1987, alt=185, peso=81, bdo=1, ucl_t=5, mundial=0, cont=0, botas=0, ucl_g=90, ucl_p=152, sel_g=37, sel_p=97, wc_g=3)),
 ("modric", "Luka Modrić", ("Centrocampista", "Midfielder"), ("Croacia", "Croatia"), "#ff3d4d", "#ffffff",
  P(nac=1985, alt=172, peso=66, bdo=1, ucl_t=6, mundial=0, cont=0, botas=0, ucl_g=None, ucl_p=None, sel_g=None, sel_p=208, wc_g=None)),
 ("kane", "Harry Kane", ("Delantero", "Forward"), ("Inglaterra", "England"), "#ffffff", "#ff3d4d",
  P(nac=1993, alt=188, peso=86, bdo=1, ucl_t=0, mundial=0, cont=0, botas=2, ucl_g=58, ucl_p=73, sel_g=85, sel_p=121, wc_g=14)),
 ("salah", "Mohamed Salah", ("Delantero", "Forward"), ("Egipto", "Egypt"), "#ff3d4d", "#ffd23a",
  P(nac=1992, alt=175, peso=71, bdo=0, ucl_t=1, mundial=0, cont=0, botas=0, ucl_g=50, ucl_p=98, sel_g=None, sel_p=None, wc_g=2)),
 ("neymar", "Neymar", ("Delantero", "Forward"), ("Brasil", "Brazil"), "#ffdf00", "#17c964",
  P(nac=1992, alt=175, peso=68, bdo=0, ucl_t=1, mundial=0, cont=0, botas=0, ucl_g=None, ucl_p=None, sel_g=80, sel_p=130, wc_g=8)),
 ("vinicius", "Vinícius Júnior", ("Delantero", "Forward"), ("Brasil", "Brazil"), "#ffdf00", "#17c964",
  P(nac=2000, alt=176, peso=73, bdo=0, ucl_t=2, mundial=0, cont=0, botas=0, ucl_g=None, ucl_p=None, sel_g=None, sel_p=None, wc_g=5)),
 ("bellingham", "Jude Bellingham", ("Centrocampista", "Midfielder"), ("Inglaterra", "England"), "#ffffff", "#ff3d4d",
  P(nac=2003, alt=186, peso=None, bdo=0, ucl_t=1, mundial=0, cont=0, botas=0, ucl_g=None, ucl_p=None, sel_g=None, sel_p=None, wc_g=8)),
 ("rodri", "Rodri", ("Centrocampista", "Midfielder"), ("España", "Spain"), "#ff3d4d", "#ffd23a",
  P(nac=1996, alt=191, peso=82, bdo=1, ucl_t=1, mundial=1, cont=1, botas=0, ucl_g=None, ucl_p=None, sel_g=None, sel_p=None, wc_g=None)),
 ("pedri", "Pedri", ("Centrocampista", "Midfielder"), ("España", "Spain"), "#ff3d4d", "#ffd23a",
  P(nac=2002, alt=174, peso=None, bdo=0, ucl_t=0, mundial=1, cont=1, botas=0, ucl_g=None, ucl_p=None, sel_g=None, sel_p=None, wc_g=None)),
 ("ronaldinho", "Ronaldinho", ("Centrocampista", "Midfielder"), ("Brasil", "Brazil"), "#ffdf00", "#17c964",
  P(nac=1980, alt=181, peso=80, bdo=1, ucl_t=1, mundial=1, cont=1, botas=0, ucl_g=None, ucl_p=None, sel_g=33, sel_p=97, wc_g=None)),
 ("zidane", "Zinedine Zidane", ("Centrocampista", "Midfielder"), ("Francia", "France"), "#2f6bff", "#ffffff",
  P(nac=1972, alt=185, peso=80, bdo=1, ucl_t=1, mundial=1, cont=1, botas=0, ucl_g=None, ucl_p=None, sel_g=31, sel_p=108, wc_g=5)),
 ("iniesta", "Andrés Iniesta", ("Centrocampista", "Midfielder"), ("España", "Spain"), "#ff3d4d", "#ffd23a",
  P(nac=1984, alt=171, peso=68, bdo=0, ucl_t=4, mundial=1, cont=2, botas=0, ucl_g=None, ucl_p=None, sel_g=13, sel_p=131, wc_g=1)),
 ("xavi", "Xavi Hernández", ("Centrocampista", "Midfielder"), ("España", "Spain"), "#ff3d4d", "#ffd23a",
  P(nac=1980, alt=170, peso=68, bdo=0, ucl_t=4, mundial=1, cont=2, botas=0, ucl_g=None, ucl_p=None, sel_g=13, sel_p=133, wc_g=None)),
 ("ramos", "Sergio Ramos", ("Defensa", "Defender"), ("España", "Spain"), "#ff3d4d", "#ffd23a",
  P(nac=1986, alt=184, peso=82, bdo=0, ucl_t=4, mundial=1, cont=2, botas=0, ucl_g=None, ucl_p=None, sel_g=23, sel_p=180, wc_g=None)),
 ("casillas", "Iker Casillas", ("Portero", "Goalkeeper"), ("España", "Spain"), "#ff3d4d", "#ffd23a",
  P(nac=1981, alt=185, peso=84, bdo=0, ucl_t=3, mundial=1, cont=2, botas=0, ucl_g=0, ucl_p=None, sel_g=0, sel_p=167, wc_g=0)),
 ("maradona", "Diego Maradona", ("Centrocampista", "Midfielder"), ("Argentina", "Argentina"), "#6cc0ff", "#ffffff",
  P(nac=1960, alt=165, peso=None, bdo=0, ucl_t=0, mundial=1, cont=0, botas=0, ucl_g=None, ucl_p=None, sel_g=34, sel_p=91, wc_g=8)),
 ("pele", "Pelé", ("Delantero", "Forward"), ("Brasil", "Brazil"), "#ffdf00", "#17c964",
  P(nac=1940, alt=173, peso=None, bdo=0, ucl_t=0, mundial=3, cont=0, botas=0, ucl_g=None, ucl_p=None, sel_g=77, sel_p=92, wc_g=12)),
 ("cruyff", "Johan Cruyff", ("Delantero", "Forward"), ("Países Bajos", "Netherlands"), "#ff8a1f", "#ffffff",
  P(nac=1947, alt=180, peso=71, bdo=3, ucl_t=3, mundial=0, cont=0, botas=0, ucl_g=None, ucl_p=None, sel_g=33, sel_p=48, wc_g=3)),
 ("ronaldo9", "Ronaldo Nazário", ("Delantero", "Forward"), ("Brasil", "Brazil"), "#ffdf00", "#17c964",
  P(nac=1976, alt=183, peso=82, bdo=2, ucl_t=0, mundial=2, cont=1, botas=1, ucl_g=None, ucl_p=None, sel_g=62, sel_p=98, wc_g=15)),
 ("henry", "Thierry Henry", ("Delantero", "Forward"), ("Francia", "France"), "#2f6bff", "#ff3d4d",
  P(nac=1977, alt=188, peso=83, bdo=0, ucl_t=1, mundial=1, cont=1, botas=2, ucl_g=50, ucl_p=112, sel_g=51, sel_p=123, wc_g=None)),
]

# ───────────────────────── equipos ─────────────────────────
# id, nombre, (liga es, en), color1, color2, nombre en hist_data, datos fijos
def _fin(club):
    jug = [x for x in H.CHAMPIONS if 2007 <= x[0] <= 2026 and club in (x[1], x[2])]
    gan = [x for x in jug if x[1] == club]
    return len(jug), len(gan)

def _ucl(club):
    from curiosidades import CHAMPIONS as TODAS
    return sum(1 for x in TODAS if x[1] == club)

EQUIPOS = [
 ("real-madrid", "Real Madrid", ("España", "Spain"), "#f4f4ff", "#d4af37", "Real Madrid", dict(liga_t=36, mcl=5, fund=1902)),
 ("barcelona", "FC Barcelona", ("España", "Spain"), "#a50044", "#2e6bd6", "Barcelona", dict(liga_t=29, mcl=3, fund=1899)),
 ("atletico", "Atlético de Madrid", ("España", "Spain"), "#e5322b", "#2a3a8f", "Atlético de Madrid", dict(liga_t=11, mcl=0, fund=1903)),
 ("bayern", "Bayern de Múnich", ("Alemania", "Germany"), "#dc052d", "#2b8cff", "Bayern de Múnich", dict(liga_t=35, mcl=2, fund=1900)),
 ("dortmund", "Borussia Dortmund", ("Alemania", "Germany"), "#fde100", "#ffffff", "Borussia Dortmund", dict(liga_t=8, mcl=0, fund=1909)),
 ("liverpool", "Liverpool", ("Inglaterra", "England"), "#e0203a", "#10d6c4", "Liverpool", dict(liga_t=20, mcl=1, fund=1892)),
 ("man-united", "Manchester United", ("Inglaterra", "England"), "#e0291c", "#fbe122", "Manchester United", dict(liga_t=20, mcl=1, fund=1878)),
 ("man-city", "Manchester City", ("Inglaterra", "England"), "#6cabdd", "#ffffff", "Manchester City", dict(liga_t=10, mcl=1, fund=1880)),
 ("arsenal", "Arsenal", ("Inglaterra", "England"), "#ef0107", "#ffffff", "Arsenal", dict(liga_t=14, mcl=0, fund=1886)),
 ("chelsea", "Chelsea", ("Inglaterra", "England"), "#2f6bff", "#ffffff", "Chelsea", dict(liga_t=6, mcl=2, fund=1905)),
 ("milan", "AC Milan", ("Italia", "Italy"), "#fb2d2d", "#ffffff", "Milan", dict(liga_t=19, mcl=1, fund=1899)),
 ("inter", "Inter de Milán", ("Italia", "Italy"), "#2f8cff", "#ffffff", "Inter", dict(liga_t=21, mcl=1, fund=1908)),
 ("juventus", "Juventus", ("Italia", "Italy"), "#f4f4ff", "#8a8aa0", "Juventus", dict(liga_t=36, mcl=0, fund=1897)),
 ("psg", "París Saint-Germain", ("Francia", "France"), "#2a6bd6", "#ff3d4d", "París Saint-Germain", dict(liga_t=14, mcl=0, fund=1970)),
]

# ───────────────────────── selecciones ─────────────────────────
# id, nombre es, nombre en, color1, color2, nombres en hist_data, datos fijos, (goleador histórico)
SELECCIONES = [
 ("argentina", "Argentina", "Argentina", "#6cc0ff", "#ffffff", ("Argentina",), dict(cont=16, bdo=8, gol=126), "Lionel Messi"),
 ("brasil", "Brasil", "Brazil", "#ffdf00", "#17c964", ("Brasil",), dict(cont=9, bdo=5, gol=80), "Neymar"),
 ("francia", "Francia", "France", "#2f6bff", "#ff3d4d", ("Francia",), dict(cont=2, bdo=8, gol=None), ""),
 ("alemania", "Alemania", "Germany", "#f4f4ff", "#ffd23a", ("Alemania", "Alemania Occidental"), dict(cont=3, bdo=7, gol=71), "Miroslav Klose"),
 ("italia", "Italia", "Italy", "#2f8cff", "#ffffff", ("Italia",), dict(cont=2, bdo=5, gol=35), "Gigi Riva"),
 ("espana", "España", "Spain", "#ff3d4d", "#ffd23a", ("España",), dict(cont=4, bdo=4, gol=59), "David Villa"),
 ("inglaterra", "Inglaterra", "England", "#ffffff", "#ff3d4d", ("Inglaterra",), dict(cont=0, bdo=6, gol=85), "Harry Kane"),
 ("portugal", "Portugal", "Portugal", "#ff3d4d", "#17c964", ("Portugal",), dict(cont=1, bdo=7, gol=146), "Cristiano Ronaldo"),
 ("paises-bajos", "Países Bajos", "Netherlands", "#ff8a1f", "#ffffff", ("Países Bajos",), dict(cont=1, bdo=7, gol=None), ""),
 ("uruguay", "Uruguay", "Uruguay", "#6cc0ff", "#ffffff", ("Uruguay",), dict(cont=15, bdo=0, gol=None), ""),
 ("croacia", "Croacia", "Croatia", "#ff3d4d", "#ffffff", ("Croacia",), dict(cont=0, bdo=1, gol=45), "Davor Šuker"),
 ("belgica", "Bélgica", "Belgium", "#ff3d4d", "#ffd23a", ("Bélgica",), dict(cont=0, bdo=0, gol=93), "Romelu Lukaku"),
]

# ───────────────────────── entrenadores ─────────────────────────
# id, nombre, (rol es, en), color1, color2, datos
ENTRENADORES = [
 ("ancelotti", "Carlo Ancelotti", ("Italia", "Italy"), "#ffffff", "#17c964", dict(nac=1959, ucl=5, mundial=0, cont=0, ligas=6)),
 ("guardiola", "Pep Guardiola", ("España", "Spain"), "#6cabdd", "#ffffff", dict(nac=1971, ucl=3, mundial=0, cont=0, ligas=12)),
 ("mourinho", "José Mourinho", ("Portugal", "Portugal"), "#ff3d4d", "#17c964", dict(nac=1963, ucl=2, mundial=0, cont=0, ligas=8)),
 ("klopp", "Jürgen Klopp", ("Alemania", "Germany"), "#e0203a", "#ffd23a", dict(nac=1967, ucl=1, mundial=0, cont=0, ligas=3)),
 ("ferguson", "Alex Ferguson", ("Escocia", "Scotland"), "#e0291c", "#ffffff", dict(nac=1941, ucl=2, mundial=0, cont=0, ligas=16)),
 ("wenger", "Arsène Wenger", ("Francia", "France"), "#ef0107", "#ffffff", dict(nac=1949, ucl=0, mundial=0, cont=0, ligas=4)),
 ("luis-enrique", "Luis Enrique", ("España", "Spain"), "#2a6bd6", "#ff3d4d", dict(nac=1970, ucl=3, mundial=0, cont=0, ligas=5)),
 ("zidane", "Zinedine Zidane", ("Francia", "France"), "#2f6bff", "#ffffff", dict(nac=1972, ucl=3, mundial=0, cont=0, ligas=2)),
 ("flick", "Hansi Flick", ("Alemania", "Germany"), "#a50044", "#2e6bd6", dict(nac=1965, ucl=1, mundial=0, cont=0, ligas=4)),
 ("arteta", "Mikel Arteta", ("España", "Spain"), "#ef0107", "#ffffff", dict(nac=1982, ucl=0, mundial=0, cont=0, ligas=1)),
 ("simeone", "Diego Simeone", ("Argentina", "Argentina"), "#e5322b", "#2a3a8f", dict(nac=1970, ucl=0, mundial=0, cont=0, ligas=None)),
 ("del-bosque", "Vicente del Bosque", ("España", "Spain"), "#ff3d4d", "#ffd23a", dict(nac=1950, ucl=2, mundial=1, cont=1, ligas=3)),
 ("deschamps", "Didier Deschamps", ("Francia", "France"), "#2f6bff", "#ff3d4d", dict(nac=1968, ucl=0, mundial=1, cont=0, ligas=1)),
 ("scaloni", "Lionel Scaloni", ("Argentina", "Argentina"), "#6cc0ff", "#ffffff", dict(nac=1978, ucl=0, mundial=1, cont=2, ligas=None)),
 ("de-la-fuente", "Luis de la Fuente", ("España", "Spain"), "#ff3d4d", "#ffd23a", dict(nac=1961, ucl=0, mundial=1, cont=1, ligas=0)),
]

# duelos sugeridos (a, b) por modo
DUELOS = {
 "jugadores": [("messi", "cristiano"), ("mbappe", "haaland"), ("yamal", "vinicius"), ("zidane", "ronaldinho"), ("pele", "maradona"), ("xavi", "iniesta")],
 "equipos": [("real-madrid", "barcelona"), ("liverpool", "man-united"), ("bayern", "psg"), ("inter", "milan"), ("man-city", "arsenal")],
 "selecciones": [("espana", "argentina"), ("brasil", "alemania"), ("francia", "inglaterra"), ("italia", "uruguay"), ("portugal", "croacia")],
 "entrenadores": [("guardiola", "ancelotti"), ("mourinho", "klopp"), ("zidane", "luis-enrique"), ("del-bosque", "deschamps"), ("ferguson", "wenger")],
}


def construir():
    """Devuelve {modo: {stats, radar, items}} con todo calculado."""
    out = {}
    out["jugadores"] = dict(items=[
        dict(id=i, n=n, p=[pos[0], pos[1]], pa=[pais[0], pais[1]], c=[c1, c2], v=v) for i, n, pos, pais, c1, c2, v in JUGADORES])
    eq = []
    for i, n, liga, c1, c2, hd, fijos in EQUIPOS:
        v = dict(fijos); v["ucl"] = _ucl(hd); v["fin"], v["fin_g"] = _fin(hd)
        eq.append(dict(id=i, n=n, p=[liga[0], liga[1]], pa=[liga[0], liga[1]], c=[c1, c2], v=v))
    out["equipos"] = dict(items=eq)
    sel = []
    for i, nes, nen, c1, c2, hd, fijos, golr in SELECCIONES:
        gan = [m for m in H.MUNDIALES if m[2] in hd]; per = [m for m in H.MUNDIALES if m[3] in hd]
        v = dict(fijos); v["wc"] = len(gan); v["wc_f"] = len(per)
        v["_anios"] = [m[0] for m in gan]; v["_gol"] = golr
        sel.append(dict(id=i, n=nes, ne=nen, p=["Selección", "National team"], pa=[nes, nen], c=[c1, c2], v=v))
    out["selecciones"] = dict(items=sel)
    out["entrenadores"] = dict(items=[
        dict(id=i, n=n, p=["Entrenador", "Manager"], pa=[pais[0], pais[1]], c=[c1, c2], v=v) for i, n, pais, c1, c2, v in ENTRENADORES])
    for m in out:
        out[m]["stats"] = [dict(k=k, es=es, en=en, u=u, g=g) for k, es, en, u, g in STATS[m]]
        out[m]["radar"] = RADAR[m]
        out[m]["duelos"] = [list(d) for d in DUELOS[m]]
        ids = {x["id"] for x in out[m]["items"]}
        assert all(a in ids and b in ids for a, b in DUELOS[m]), m
        assert len(ids) == len(out[m]["items"]), m
    return out


if __name__ == "__main__":
    d = construir()
    for m, x in d.items():
        print(m, len(x["items"]), "fichas")
    for x in d["equipos"]["items"]: print(x["n"], x["v"])
    for x in d["selecciones"]["items"]: print(x["n"], x["v"])
