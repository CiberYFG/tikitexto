#!/usr/bin/env python3
"""Añade el menú de navegación y el enlace «Saltar al contenido» a las páginas HTML escritas a mano
(legales, Sobre TIKITEXTO, contacto, accesibilidad y 404). Es idempotente: si la página ya lo lleva, no hace nada.
Orden: … → menu_paginas.py → csp.py → buscador.py"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import menu_sitio as MS

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEGALES = ["aviso-legal", "privacidad", "cookies", "accesibilidad", "contacto", "sobre-tikitexto"]

NOTA_NUEVA = ('<p class="nota-idioma" translate="no" style="margin:0 0 14px;padding:8px 12px;border-radius:10px;background:rgba(127,127,127,.12);font-size:.8rem">'
              '🌐 Solo en español (versión oficial) · Spanish only: use your browser\'s translate feature · Seulement en espagnol · Só em espanhol · Solo in spagnolo · Nur auf Spanisch.</p>')

CSS_LEG = MS.CSS + """
.cab-leg { max-width: 760px; margin: 0 auto; padding: 14px 18px 0; }
.marca-leg { font-weight: 900; font-size: 1.25rem; letter-spacing: .02em; text-decoration: none; color: var(--texto); }
.marca-leg span { color: var(--acento); }
.menu-pag { max-width: 760px; margin: 6px auto 0; padding: 0 6px 6px; }
"""
CSS_404 = MS.CSS_SEO + "\nmain .menu-pag { padding: 0; margin: 10px 0 0 -12px; }\n"


def parchea(nombre):
    ruta = os.path.join(RAIZ, nombre + ".html")
    if not os.path.exists(ruta): return False
    h = open(ruta, encoding="utf-8").read()
    if 'class="saltar"' in h: return False
    legal = nombre in LEGALES
    activo = "sobre" if nombre == "sobre-tikitexto" else None
    menu = MS.nav("es", "/", activo, "menu-pag")
    if legal:
        css, cab = CSS_LEG, '%s<header class="cab-leg"><a class="marca-leg" href="/" translate="no">TIKI<span>TEXTO</span></a></header>\n%s\n<main id="contenido">' % (MS.saltar("es"), menu)
        h = re.sub(r'<p class="nota-idioma".*?</p>', NOTA_NUEVA, h, count=1, flags=re.S)
        h = re.sub(r'\s*<p><a href="\./">‹ [^<]*</a></p>', "", h, count=1)
    else:
        css, cab = CSS_404, MS.saltar("es") + '<main id="contenido">'
        h = h.replace('<a class="m" href="/" translate="no">TIKI<span>TEXTO</span></a>', '<a class="m" href="/" translate="no">TIKI<span>TEXTO</span></a>\n' + menu, 1)
    if "<body>\n<main>" not in h: raise SystemExit("estructura inesperada en " + nombre)
    h = h.replace("<body>\n<main>", "<body>\n" + cab, 1)
    h = h.replace("</style>", css + "</style>", 1)
    open(ruta, "w", encoding="utf-8").write(h)
    return True


if __name__ == "__main__":
    hechas = [n for n in LEGALES + ["404"] if parchea(n)]
    print("menú añadido a: " + (", ".join(hechas) or "ninguna (ya lo llevaban)"))
