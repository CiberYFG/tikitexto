#!/usr/bin/env python3
"""Menú de navegación común de las páginas generadas (curiosidades, artículos, datos, guías…).
Una fila de enlaces que se desplaza en horizontal en el móvil y se ve entera en el ordenador.
Uso: nav(lang, pref, activo) con pref = "/" (rutas absolutas) o "../" * profundidad (rutas relativas)."""

ARIA = {"es": "Navegación principal", "en": "Main navigation", "pt": "Navegação principal", "fr": "Navigation principale", "it": "Navigazione principale", "de": "Hauptnavigation"}
SALTAR = {"es": "Saltar al contenido", "en": "Skip to content", "pt": "Saltar para o conteúdo", "fr": "Aller au contenu", "it": "Vai al contenuto", "de": "Zum Inhalt springen"}

# (clave, etiqueta, ruta relativa a la raíz; "" = portada)
_ES = [("home", "Inicio", ""), ("cur", "Curiosidades", "curiosidades/"), ("art", "Artículos", "articulos/"), ("rec", "Récords", "curiosidades/datos/"),
       ("cmp", "Comparador", "comparador/"), ("cla", "Clases", "clases/"), ("gui", "Guías", "juegos/"), ("sobre", "Sobre", "sobre-tikitexto.html")]
_EN = [("home", "Home", ""), ("cur", "Trivia", "en/curiosidades/"), ("rec", "Records", "en/curiosidades/datos/"), ("cmp", "Comparator", "en/football-comparator/"),
       ("cla", "Classes", "en/classes/"), ("gui", "Guides", "en/games/")]
_OTROS = {"pt": "Curiosidades", "fr": "Curiosités", "it": "Curiosità", "de": "Kuriositäten"}
_INICIO = {"pt": "Início", "fr": "Accueil", "it": "Home", "de": "Start"}


def items(lang):
    if lang == "es": return _ES
    if lang == "en": return _EN
    return [("home", _INICIO[lang], ""), ("cur", _OTROS[lang], lang + "/curiosidades/")]


def clave_de_ruta(ruta, defecto="cur"):
    """Sección activa a partir de la ruta (sin prefijo de idioma) de una página generada."""
    r = ruta.lstrip("/")
    for pre in ("en/", "pt/", "fr/", "it/", "de/"):
        if r.startswith(pre): r = r[len(pre):]
    if r.startswith("articulos"): return "art"
    if r.startswith("curiosidades/datos"): return "rec"
    if r.startswith("comparador") or r.startswith("football-comparator"): return "cmp"
    if r.startswith("clases") or r.startswith("classes"): return "cla"
    if r.startswith("juegos") or r.startswith("games"): return "gui"
    if r.startswith("sobre"): return "sobre"
    if r.startswith("curiosidades") or r == "": return "cur"
    return defecto


def nav(lang, pref, activo, extra_clase=""):
    a = []
    for clave, etiqueta, ruta in items(lang):
        if clave == "home" and lang != "es": href = pref + "?lang=" + lang
        else: href = pref + ruta
        cur = ' aria-current="page"' if clave == activo else ""
        a.append('<a href="%s"%s>%s</a>' % (href, cur, etiqueta))
    return '<nav class="menu%s" aria-label="%s">%s</nav>' % (" " + extra_clase if extra_clase else "", ARIA[lang], "".join(a))


def saltar(lang):
    return '<a class="saltar" href="#contenido">%s</a>' % SALTAR[lang]


CSS = """
.saltar { position: absolute; left: 12px; top: -60px; z-index: 100; padding: 10px 16px; font-weight: 800; color: #fff; background: #12203a; border-radius: 0 0 12px 12px; text-decoration: none; transition: top .15s; }
.saltar:focus { top: 0; }
.menu { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.menu::-webkit-scrollbar { display: none; }
.menu a { flex: none; padding: 7px 12px; font-size: .86rem; font-weight: 700; line-height: 1.2; color: var(--suave); text-decoration: none; border: 1px solid transparent; border-radius: 999px; white-space: nowrap; }
.menu a:hover { color: var(--texto); background: var(--caja); }
.menu a:focus-visible { outline: 3px solid var(--acento); outline-offset: 1px; }
.menu a[aria-current] { color: var(--acento); background: color-mix(in srgb, var(--acento) 12%, var(--caja)); border-color: color-mix(in srgb, var(--acento) 38%, transparent); }
.menu-pag { max-width: 760px; margin: 6px auto 0; padding: 0 6px 4px; }
"""

# Variante para las páginas de tools/seo.py (variables --t, --ts, --s, --a)
CSS_SEO = CSS.replace("var(--suave)", "var(--ts)").replace("var(--texto)", "var(--t)").replace("var(--caja)", "var(--s)").replace("var(--acento)", "var(--a)").replace(
    ".menu-pag { max-width: 760px; margin: 6px auto 0; padding: 0 6px 4px; }", ".menu-pag { max-width: 760px; margin: 4px auto 0; padding: 0 12px 6px; }")
