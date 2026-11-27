# -*- coding: utf-8 -*-
"""Genera buscador.json: índice de búsqueda de todas las páginas del sitemap (título, descripción, secciones).
Se ejecuta DESPUÉS de seo.py y csp.py (usa el sitemap ya sin páginas noindex)."""
import html, json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUIR = ("privacidad", "aviso-legal", "cookies", "accesibilidad", "contacto", "404", "googlee")

def limpia(t):
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()

def tipo(ruta):
    r = re.sub(r"^(en|pt|fr|it|de)/", "", ruta)
    for pref, t in (("articulos/", "art"), ("historias/", "his"), ("peques/", "peq"), ("curiosidades/datos/", "dat"),
                    ("curiosidades/", "cur"), ("adivina-", "jue"), ("guess-", "jue"), ("fussball", "jue"), ("nationalmannschaft", "jue"),
                    ("trainer-", "jue"), ("stadion-", "jue"), ("sobre-", "sob")):
        if r.startswith(pref):
            return t
    return "jue" if r == "" else "cur"

def main():
    sm = open(os.path.join(RAIZ, "sitemap.xml"), encoding="utf-8").read()
    rutas = re.findall(r"<loc>https://tikitexto\.com/([^<]*)</loc>", sm)
    out = []
    for r in rutas:
        if any(r.startswith(x) or r.split("/")[-1].startswith(x) for x in EXCLUIR):
            continue
        f = os.path.join(RAIZ, r, "index.html") if (r == "" or r.endswith("/")) else os.path.join(RAIZ, r)
        if not os.path.exists(f):
            continue
        h = open(f, encoding="utf-8").read()
        m = re.search(r"<html[^>]*lang=\"([a-zA-Z-]+)\"", h)
        lang = (m.group(1) if m else "es")[:2].lower()
        t = re.search(r"<title>(.*?)</title>", h, re.S)
        d = re.search(r'<meta name="description" content="([^"]*)"', h)
        titulo = limpia(t.group(1)).replace(" | TIKITEXTO", "") if t else r
        desc = limpia(d.group(1)) if d else ""
        # palabras clave: títulos de sección y preguntas frecuentes
        cuerpo = re.split(r"<body", h, maxsplit=1)[-1]
        kw = [limpia(x) for x in re.findall(r"<h[23][^>]*>(.*?)</h[23]>", cuerpo, re.S)]
        kw += [limpia(x) for x in re.findall(r"<summary[^>]*>(.*?)</summary>", cuerpo, re.S)]
        kw = [k for k in dict.fromkeys(kw) if 2 < len(k) < 140][:24]
        out.append({"u": "/" + r, "l": lang, "t": tipo(r), "n": titulo[:120], "d": desc[:200], "k": " · ".join(kw)[:600]})
    # el ahorcado y los modos de la portada no tienen página propia
    extra = [("/?modo=ahorcado", "Ahorcado TIKITEXTO", "Ahorcado de fútbol: adivina el jugador letra a letra con 5 fallos.", "ahorcado hangman pendu forca"),
             ("/?modo=chapas", "Chapas TIKITEXTO", "Juego de chapas de fútbol: mueve una chapa por turno, empuja el balón a gol y desbloquea estilos de chapas, balones, estelas y estadios.", "chapas fútbol bottle caps metegol turnos rival estilos"),
             ("/?modo=serpiente", "Cracks Ocultos", "Juego de letras: descubre en la cuadrícula los nombres de futbolistas de un tema deslizando el dedo, contrarreloj.", "cracks ocultos sopa de letras futbolistas cuadricula nombres juego palabras"),
             ("/?modo=clases", "Vídeos de fútbol", "Clases animadas con profe, pizarra y voz en 6 idiomas: el fuera de juego, cómo se gana un torneo, las tarjetas, el VAR, las posiciones, las reglas básicas, el penalti y la tanda, los fichajes, cómo funciona una liga, la mano, las tácticas, el xG, los saques (banda, meta y esquina), las faltas y la ventaja, el portero, el formato de la Champions, el tiempo de juego y las estadísticas.", "videos clases animadas explicacion fuera de juego tarjetas torneo var posiciones formaciones reglas penalti tanda fichajes traspasos clausula liga mano tacticas xg goles esperados saques banda meta esquina corner faltas tiro libre ventaja barrera portero ocho segundos champions formato 36 equipos descuento prorroga tiempo estadisticas posesion fases pizarra profe youtube"),
             ("/?modo=cuartetos", "Cuartetos TIKITEXTO", "Juego de letras: agrupa 16 nombres de futbolistas, clubes y estadios en 4 grupos de 4 con algo en común. Reto diario y modo libre.", "cuartetos connections agrupar grupos nombres futbolistas clubes estadios reto diario puzzle"),
             ("/?modo=pasapalabra", "Pasapalabra de fútbol", "Juego de letras: el rosco del fútbol con 26 letras, una pista por letra sobre jugadores, clubes y estadios y 3 minutos para completarlo.", "pasapalabra rosco letras futbol jugadores clubes estadios pista tiempo"),
             ("/?modo=duelo", "Duelo de datos", "Juego de datos: dos futbolistas, equipos, selecciones o entrenadores frente a frente; elige quién tiene más Balones de Oro, Champions, goles o Mundiales. Cada ronda es más ajustada.", "duelo de datos quien tiene mas comparar balones de oro champions goles mundiales jugadores equipos selecciones entrenadores cifras trivia"),
             ("/?modo=logros", "Vitrina de logros", "Tus medallas de bronce, plata y oro: 26 logros que se desbloquean solos con tus marcas en todos los juegos, con barras de progreso y rangos de Aficionado a Leyenda.", "logros vitrina medallas trofeos bronce plata oro rango aficionado leyenda progreso achievements trophy cabinet"),
             ("/?modo=trivia", 'Trivia TIKITEXTO', 'Juego de preguntas de fútbol: 10 preguntas cada vez más difíciles sobre Champions, Mundiales, Balón de Oro y récords. Reto diario y modo libre por categorías.', 'trivia preguntas quiz futbol test cultura general champions mundiales balon de oro reto diario respuestas'),
             ("/?modo=lineatiempo", 'Línea del tiempo del fútbol', 'Juego de historia: coloca en su sitio de la línea del tiempo Mundiales, finales de Champions, primeros Balones de Oro y hitos de las reglas del fútbol. Cada acierto la hace más difícil.', 'linea del tiempo cronologia historia futbol ordenar años mundiales champions balon de oro hitos reglas timeline cuando paso'),
             ("/?modo=sopa", 'Sopa de letras de fútbol', 'Juego de letras contrarreloj: encuentra equipos, estadios y leyendas del fútbol escondidos en una cuadrícula con diagonales y nombres al revés. Cada cuadrícula suma tiempo y sube de nivel.', 'sopa de letras futbol cuadricula palabras escondidas equipos estadios leyendas buscar nombres contrarreloj word search'),
             ("/?modo=parejas", 'Memoria de parejas de fútbol', 'Juego de memoria contrarreloj: encuentra las parejas jugador con su selección, club con su estadio y estadio con su país en tableros cada vez más grandes.', 'memoria parejas cartas futbol memory jugadores selecciones clubes estadios paises contrarreloj'),
            ("/?modo=cruces", 'Cruces: cuadrícula de fútbol 3×3', 'Juego de letras: rellena una cuadrícula 3×3 con jugadores que encajen con el club de la fila y la condición de la columna (selección, Balón de Oro, campeón del mundo o posición). Reto diario y modo libre.', 'cruces cuadricula 3x3 futbol jugadores clubes selecciones balon de oro campeon del mundo reto diario grid'),
            ("/?modo=mapas", 'Clava el sitio: juego de mapas de fútbol', 'Juego de mapas: sitúa en un mapamundi con zoom estadios, ciudades natales de jugadores, ciudades de clubes, sedes de finales y curiosidades. Cuanto más cerca clavas el pin, más puntos. Reto diario y modo libre.', 'clava el sitio mapas mapa mundi futbol estadios ciudad natal jugadores clubes finales geografia ubicacion pin zoom reto diario'),
            ('/?modo=zoomout', 'Zoom out: reconoce la ciudad mientras el mapa se aleja', 'Minijuego de mapas: el mapa se aleja poco a poco desde una ciudad y tienes que reconocerla entre cuatro opciones. Cuanto antes aciertes, más puntos. Reto diario y partida libre.', 'zoom out mapa ciudad reconocer adivinar alejar geografia futbol'),
            ('/?modo=brujula', 'Brújula del fútbol: ¿hacia dónde queda el estadio?', 'Minijuego de mapas: elige el rumbo entre ocho de un estadio o club a otro, o decide cuál de tres lugares está más cerca. Reto diario y partida libre.', 'brujula del futbol rumbo direccion norte sur este oeste cercano estadio mapa'),
            ('/?modo=rutacrack', 'Ruta del crack: adivina al jugador por las ciudades de sus clubes', 'Minijuego de mapas: unos pines marcan las ciudades de los grandes clubes por los que pasó una leyenda y tienes que adivinar qué jugador es. Pista opcional. Reto diario y partida libre.', 'ruta del crack jugador clubes ciudades pines mapa adivinar leyenda futbol'),
            ('/?modo=encuentrapais', 'Encuentra el país: mapa mudo del mundo', 'Minijuego de mapas: toca en un mapa mudo el país que te piden o adivina cuál está resaltado entre cuatro nombres. Reto diario y partida libre.', 'encuentra el pais mapa mudo paises geografia tocar resaltado futbol'),
            ("/?modo=racha", 'Racha diaria', 'Tu racha de días seguidos completando un reto diario (diario, Cuartetos, Trivia, Cruces, Clava el sitio o los minijuegos de mapas) con tarjeta para compartir.', 'racha diaria dias seguidos reto diario compartir'),
             ("/?modo=toques", "Toques: mantén el balón en el aire", "Videojuego: mueve solo el pie y da toques al balón. Suma puntos y desbloquea equipaciones, balones y fondos (callejón, playa, estadio, pirámides…).", "toques keepy uppy malabares balon pie puntos equipaciones fondos desbloquear videojuego"),
             ("/?modo=pertenece", "¿A qué pertenece?", "Juego de letras: un jugador, un club o un estadio y cuatro opciones; elige a qué pertenece. Cada ronda es más difícil y el tiempo baja.", "pertenece a que pertenece quiz trivia opciones jugador club estadio pregunta letras"),
             ("/?modo=slalom", "TIKI RUSH · Corredor de Tikitexto", "Videojuego 3D de regates: corre por el campo, esquiva obstáculos móviles, gasta monedas en equipaciones y busca la caja sorpresa con tikitextos.", "tiki rush slalom vestuario caja sorpresa regates corredor runner 3d defensas vallas carriles videojuego endless"),
             ("/?modo=tirolibre", "Tiros libres 3D", "Videojuego 3D de faltas: apunta, da efecto al balón para rodear la barrera y supera a un portero que te lee en un estadio.", "tiros libres faltas 3d free kick barrera efecto portero videojuego estadio"),
             ("/?modo=pinball", "Pinball Golazo", "El flíper del fútbol: golpea la bola con las botas, rebota en los defensas, mete gol al portero y completa T-I-K-I para multiplicar.", "pinball flipper futbol juego bola portero gol botas"),
             ("/?modo=penaltis", "Penaltis 3D", "Juego de penaltis en 3D: tira con tres barras (dirección, altura y fuerza) y para los del rival como portero, con joystick o WASD.", "penaltis 3d portero tanda lanzar parar futbol"),
             ("/?modo=diario", "Adivina el futbolista en 6 intentos", "El juego de adivinar el nombre oculto de un futbolista, con ranking mundial.", "jugador diario nombre oculto ranking")]
    for u, n, d, k in extra:
        out.append({"u": u, "l": "es", "t": "jue", "n": n, "d": d, "k": k})
    out.sort(key=lambda x: (x["l"], x["u"]))
    with open(os.path.join(RAIZ, "buscador.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print("buscador.json:", len(out), "páginas,", os.path.getsize(os.path.join(RAIZ, "buscador.json")) // 1024, "KB")

if __name__ == "__main__":
    main()
