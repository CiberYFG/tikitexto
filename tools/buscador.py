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
             ("/?modo=diario", "Adivina el futbolista en 6 intentos", "El juego de adivinar el nombre oculto de un futbolista, con ranking mundial.", "jugador diario nombre oculto ranking")]
    for u, n, d, k in extra:
        out.append({"u": u, "l": "es", "t": "jue", "n": n, "d": d, "k": k})
    out.sort(key=lambda x: (x["l"], x["u"]))
    with open(os.path.join(RAIZ, "buscador.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print("buscador.json:", len(out), "páginas,", os.path.getsize(os.path.join(RAIZ, "buscador.json")) // 1024, "KB")

if __name__ == "__main__":
    main()
