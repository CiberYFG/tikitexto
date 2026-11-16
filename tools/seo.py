#!/usr/bin/env python3
"""Genera las páginas de búsqueda (una por modo en español y una por idioma) y el sitemap.xml.
Uso: python3 tools/seo.py   (desde cualquier carpeta). Las traducciones de los modos y de las
preguntas frecuentes salen de i18n/fuente.txt; el resto de textos está aquí."""
import html, json, os, sys as _sys
_sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))
import seo_extra as XT
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOM = "https://tikitexto.com/"
LANGS = ["es", "en", "pt", "fr", "it", "de"]
HREFLANG = {"es": "es", "en": "en", "pt": "pt-BR", "fr": "fr", "it": "it", "de": "de"}
NOMBRE_IDIOMA = {"es": "Español", "en": "English", "pt": "Português", "fr": "Français", "it": "Italiano", "de": "Deutsch"}

# ---- diccionario (para reutilizar traducciones) ----
D = {}
for l in open(os.path.join(RAIZ, "i18n", "fuente.txt"), encoding="utf-8"):
    q = [x.strip() for x in l.rstrip("\n").split(" ||| ")]
    if len(q) == 6 and not l.startswith("#") and q[0] not in ("P", "N"): D[q[0]] = dict(zip(LANGS[1:], q[1:]))
def T(clave, lang): return clave if lang == "es" else D[clave][lang]

FAQ_CLAVES = ["¿Cómo se juega a TIKITEXTO?", "¿Es gratis? ¿Hay que registrarse?", "¿Cada cuánto hay un reto nuevo?", "¿En qué idiomas está disponible?", "¿Se puede instalar en el móvil?", "¿Solo es un juego?"]
FAQ_RESP = ["Escribe un nombre con el mismo número de letras que las casillas y pulsa Intro. Verde: letra bien colocada; amarillo: está en otra posición; gris: no está en el nombre. Tienes 6 intentos.",
            "Es gratis y no pide correo ni contraseña: solo eliges un nickname para el ranking mundial. Se guarda un código de recuperación por si cambias de dispositivo.",
            "El Tikitexto diario cambia cada día y es el mismo para todo el mundo. Los demás modos puedes jugarlos tantas veces como quieras.",
            "En español, inglés, portugués, francés, italiano y alemán.",
            "Sí. Es una app web (PWA): desde el navegador, elige «Añadir a la pantalla de inicio».",
            "No. TIKITEXTO es, ante todo, una base de datos y curiosidades del fútbol: historia de la Champions y del Mundial, récords con fuentes, cómo se fundaron las ligas y cómo nacieron los trofeos. Además tiene una sección de juegos interactivos."]

# ---- textos por idioma de las páginas de idioma ----
UI = {
 "es": dict(jugar="Jugar ahora", como="Cómo se juega", modos="Modos de juego", faq="Preguntas frecuentes", legal="Aviso legal", priv="Privacidad", cook="Cookies", acc="Accesibilidad", nota="Las páginas legales están disponibles solo en español.",
            pasos=["Escribe un nombre con el número de letras que indican las casillas.", "Pulsa Intro: verde = letra bien colocada, amarillo = está en otra posición, gris = no está en el nombre.", "Tienes 6 intentos. Si te atascas, usa la pista."]),
 "en": dict(jugar="Play now", como="How to play", modos="Game modes", faq="Frequently asked questions", legal="Legal notice", priv="Privacy", cook="Cookies", acc="Accessibility", nota="The legal pages are only available in Spanish.",
            pasos=["Type a name with the number of letters shown by the squares.", "Press Enter: green = letter in the right place, yellow = it is elsewhere in the name, grey = not in the name.", "You have 6 attempts. If you get stuck, use the hint."]),
 "pt": dict(jugar="Jogar agora", como="Como se joga", modos="Modos de jogo", faq="Perguntas frequentes", legal="Aviso legal", priv="Privacidade", cook="Cookies", acc="Acessibilidade", nota="As páginas legais estão disponíveis apenas em espanhol.",
            pasos=["Digite um nome com o número de letras indicado pelas casas.", "Aperte Enter: verde = letra no lugar certo, amarelo = está em outra posição, cinza = não está no nome.", "Você tem 6 tentativas. Se travar, use a dica."]),
 "fr": dict(jugar="Jouer maintenant", como="Comment jouer", modos="Modes de jeu", faq="Questions fréquentes", legal="Mentions légales", priv="Confidentialité", cook="Cookies", acc="Accessibilité", nota="Les pages légales sont uniquement disponibles en espagnol.",
            pasos=["Saisis un nom avec le nombre de lettres indiqué par les cases.", "Appuie sur Entrée : vert = lettre bien placée, jaune = elle est ailleurs dans le nom, gris = absente du nom.", "Tu as 6 essais. Si tu bloques, utilise l'indice."]),
 "it": dict(jugar="Gioca ora", como="Come si gioca", modos="Modalità di gioco", faq="Domande frequenti", legal="Note legali", priv="Privacy", cook="Cookie", acc="Accessibilità", nota="Le pagine legali sono disponibili solo in spagnolo.",
            pasos=["Scrivi un nome con il numero di lettere indicato dalle caselle.", "Premi Invio: verde = lettera al posto giusto, giallo = è in un'altra posizione, grigio = non è nel nome.", "Hai 6 tentativi. Se sei bloccato, usa l'indizio."]),
 "de": dict(jugar="Jetzt spielen", como="So wird gespielt", modos="Spielmodi", faq="Häufige Fragen", legal="Impressum", priv="Datenschutz", cook="Cookies", acc="Barrierefreiheit", nota="Die rechtlichen Seiten gibt es nur auf Spanisch.",
            pasos=["Gib einen Namen mit der Anzahl Buchstaben ein, die die Felder zeigen.", "Drücke Enter: grün = Buchstabe an der richtigen Stelle, gelb = kommt woanders im Namen vor, grau = nicht im Namen.", "Du hast 6 Versuche. Wenn du nicht weiterkommst, nutze den Hinweis."]),
}
LANDING = {
 "en": dict(titulo="Football (soccer) facts, history and trivia, plus interactive games | TIKITEXTO", desc="A football (soccer) database and trivia site: Champions League and World Cup history, records and sourced rankings. Plus free interactive games to test what you know.", h1="Football (soccer) facts, history and trivia", lead="The last 20 Champions League finals, every World Cup, records and sourced rankings. And interactive games to test what you know."),
 "pt": dict(titulo="Dados e curiosidades do futebol, e jogos interativos | TIKITEXTO", desc="Base de dados e curiosidades do futebol: história da Liga dos Campeões e das Copas do Mundo, recordes e rankings com fontes. Além disso, jogos interativos grátis para testar o que você sabe.", h1="Dados, história e curiosidades do futebol", lead="As últimas 20 finais da Liga dos Campeões, todas as Copas do Mundo, recordes e rankings com fontes. E, além disso, jogos interativos para testar o que você sabe."),
 "fr": dict(titulo="Données et curiosités du football, et jeux interactifs | TIKITEXTO", desc="Base de données et curiosités du football : histoire de la Ligue des champions et des Coupes du monde, records et classements sourcés. Et des jeux interactifs gratuits pour tester tes connaissances.", h1="Données, histoire et curiosités du football", lead="Les 20 dernières finales de la Ligue des champions, toutes les Coupes du monde, records et classements sourcés. Et des jeux interactifs pour tester tes connaissances."),
 "it": dict(titulo="Dati e curiosità sul calcio, e giochi interattivi | TIKITEXTO", desc="Database e curiosità sul calcio: storia della Champions League e dei Mondiali, record e classifiche con fonti. In più, giochi interattivi gratuiti per mettere alla prova ciò che sai.", h1="Dati, storia e curiosità sul calcio", lead="Le ultime 20 finali di Champions League, tutti i Mondiali, record e classifiche con fonti. E giochi interattivi per mettere alla prova ciò che sai."),
 "de": dict(titulo="Fußball-Daten und Wissenswertes, plus interaktive Spiele | TIKITEXTO", desc="Fußball-Datenbank und Wissenswertes: Geschichte der Champions League und der Weltmeisterschaften, Rekorde und Ranglisten mit Quellen. Dazu kostenlose interaktive Spiele, um dein Wissen zu testen.", h1="Fußball-Daten, Geschichte und Wissenswertes", lead="Die letzten 20 Champions-League-Finals, alle Weltmeisterschaften, Rekorde und Ranglisten mit Quellen. Und interaktive Spiele, um dein Wissen zu testen."),
}
import sys as _sys
_sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seo_en_de import MODOS_EN, MODOS_DE, LABELS as LABELS_ED
MODOS_LISTA = [("Adivina el jugador", "jugadores"), ("Adivina el equipo", "equipos"), ("Adivina la selección", "selecciones"), ("Adivina el entrenador", "entrenadores"), ("Adivina el estadio", "estadios_es")]

# ---- páginas por modo (español) ----
MODOS_ES = [
 dict(slug="adivina-el-jugador", modo="jugadores", titulo="Adivina el jugador de fútbol del día | TIKITEXTO", desc="Adivina el futbolista oculto en 6 intentos: jugadores actuales y leyendas. Juego de fútbol gratis con ranking mundial y sin registro.", h1="Adivina el jugador de fútbol",
      lead="Un futbolista oculto y seis intentos para descubrirlo. Escribe su apellido o su nombre de juego y los colores te dirán qué letras has acertado. Hay estrellas actuales y leyendas de LaLiga, la Premier League, la Serie A, la Bundesliga y más.",
      qa=[("¿Qué jugadores aparecen?", "Futbolistas actuales y leyendas de las grandes ligas europeas y de selecciones de todo el mundo, de porteros a delanteros."), ("¿Hay pistas?", "Sí. El botón «Pista» muestra una descripción del jugador y las letras que ya has acertado en su posición.")]),
 dict(slug="adivina-el-equipo", modo="equipos", titulo="Adivina el equipo de fútbol | TIKITEXTO", desc="Adivina el club de fútbol oculto en 6 intentos: equipos de España, Inglaterra, Italia, Alemania, Francia y el resto del mundo. Gratis y con ranking.", h1="Adivina el equipo de fútbol",
      lead="Descubre el club oculto con seis intentos. Hay equipos de LaLiga, la Premier League, la Serie A, la Bundesliga, la Ligue 1, Portugal, Sudamérica y más. Cada letra se colorea para guiarte hasta el nombre.",
      qa=[("¿De qué ligas son los equipos?", "De España, Inglaterra, Italia, Alemania, Francia, Portugal, Países Bajos, Turquía, Sudamérica, Norteamérica y otras ligas del mundo."), ("¿Cómo se escriben los nombres?", "Sin espacios y sin tildes: por ejemplo, REALMADRID o MANCITY. El tablero te indica cuántas letras tiene.")]),
 dict(slug="adivina-la-seleccion", modo="selecciones", titulo="Adivina la selección de fútbol | TIKITEXTO", desc="Adivina la selección nacional oculta en 6 intentos con pistas de Mundiales y Eurocopas. Juego de fútbol gratis con ranking mundial.", h1="Adivina la selección nacional",
      lead="Una selección oculta y seis intentos. Las pistas hablan de Mundiales, Eurocopas, apodos y estrellas históricas. Hay selecciones de Europa, América, África, Asia y Oceanía.",
      qa=[("¿Qué selecciones hay?", "Más de sesenta selecciones de los cinco continentes, desde las campeonas del mundo hasta sorpresas de cada torneo."), ("¿Puedo jugar todas las veces que quiera?", "Sí. Solo el Tikitexto diario puntúa una vez al día; el resto de modos son ilimitados.")]),
 dict(slug="adivina-el-entrenador", modo="entrenadores", titulo="Adivina el entrenador de fútbol | TIKITEXTO", desc="Adivina el entrenador de fútbol oculto en 6 intentos: técnicos legendarios y actuales. Juego gratis con ranking mundial y sin registro.", h1="Adivina el entrenador de fútbol",
      lead="Seis intentos para descubrir al entrenador oculto. Hay técnicos legendarios y actuales de clubes y selecciones de todo el mundo, con pistas sobre sus títulos y su estilo de juego.",
      qa=[("¿Qué entrenadores aparecen?", "Técnicos históricos y actuales de LaLiga, la Premier League, la Serie A, la Bundesliga, la Ligue 1 y de selecciones."), ("¿Hay pista?", "Sí. Puedes ver una descripción del entrenador, pero te recomendamos intentarlo primero sin ella.")]),
 dict(slug="adivina-el-estadio", modo="estadios_es", titulo="Adivina el estadio de fútbol | TIKITEXTO", desc="Adivina el estadio de fútbol oculto en 6 intentos: LaLiga, Premier League, Europa y resto del mundo. Gratis, con ranking mundial.", h1="Adivina el estadio de fútbol",
      lead="Un estadio oculto y seis intentos para descubrirlo. Elige entre estadios de la liga española, la liga inglesa, Europa o el resto del mundo, con pistas sobre la ciudad y su historia.",
      qa=[("¿Qué estadios hay?", "Campos míticos de España e Inglaterra, grandes estadios europeos y recintos de Mundiales de todo el mundo."), ("¿Puedo elegir la competición?", "Sí. Al pulsar «Estadios» en el juego eliges entre liga española, liga inglesa, Europa o resto del mundo.")]),
]

CSS = """:root{--f:#f2f5fa;--s:#fff;--t:#151d2b;--ts:#5c6979;--a:#1f7a5a;--as:#e2f2ea;--b:#d8e0eb}
@media(prefers-color-scheme:dark){:root{--f:#0d131a;--s:#151d27;--t:#eaf0f7;--ts:#9aa8b8;--a:#3fe0a0;--as:#12362a;--b:#27323f}}
*{box-sizing:border-box}body{margin:0;background:var(--f);color:var(--t);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--a)}header,main,footer{max-width:760px;margin:0 auto;padding:0 16px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:14px;padding-bottom:6px;flex-wrap:wrap}
.m{font-weight:900;font-size:1.25rem;letter-spacing:.02em;text-decoration:none;color:var(--t)}.m span{color:var(--a)}
.l{display:flex;gap:6px;flex-wrap:wrap}.l a{padding:3px 9px;border-radius:999px;font-size:.8rem;font-weight:800;text-decoration:none;background:var(--s);border:1px solid var(--b);color:var(--ts)}.l a[aria-current]{background:var(--a);color:var(--f);border-color:var(--a)}
h1{font-size:clamp(1.7rem,6vw,2.3rem);line-height:1.15;margin:22px 0 10px}h2{font-size:1.2rem;margin:28px 0 8px}
.lead{font-size:1.05rem;color:var(--ts);margin:0 0 18px}
.cta{display:inline-block;padding:13px 26px;border-radius:14px;background:var(--a);color:var(--f);font-weight:900;font-size:1.05rem;text-decoration:none}
.cta:hover{filter:brightness(1.08)}ol,ul{padding-left:22px}li{margin:4px 0}
.g{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0}.g a{display:inline-block;padding:7px 14px;border-radius:999px;background:var(--as);font-weight:800;text-decoration:none}
details{border-top:1px solid var(--b);padding:10px 0}summary{font-weight:800;cursor:pointer}details p{margin:8px 0 0;color:var(--ts)}
footer{padding-top:26px;padding-bottom:36px;font-size:.85rem;color:var(--ts)}footer a{margin-right:12px}"""

def esc(s): return html.escape(s, quote=True)

def alternates(extra=""):
    out = []
    for c in LANGS:
        out.append('<link rel="alternate" hreflang="%s" href="%s">' % (HREFLANG[c], DOM + ("" if c == "es" else c + "/")))
    out.append('<link rel="alternate" hreflang="x-default" href="%s">' % DOM)
    return "\n".join(out)

def pagina(lang, ruta, titulo, desc, h1, lead, modo_cta, bloques, faq, hreflang_html, profundidad, migas=None, nota_idioma=True, pasos=None, como=None):
    u = UI[lang]
    if pasos is not None: u = dict(u, pasos=pasos, como=como or u["como"])
    base = "../" * profundidad
    canon = DOM + ruta
    cta = '%s?lang=%s%s' % (base, lang, ("&modo=" + modo_cta) if modo_cta else "")
    selector = "".join('<a href="%s"%s hreflang="%s" lang="%s">%s</a>' % (
        base + ("" if c == "es" else c + "/") if (profundidad == 0 or ruta.rstrip("/") in ("en", "pt", "fr", "it", "de") or lang != "es" or True) else "", ' aria-current="page"' if c == lang and (lang != "es" or profundidad == 0) else "", HREFLANG[c], c, NOMBRE_IDIOMA[c]) for c in LANGS)
    faq_html = "".join("<details><summary>%s</summary><p>%s</p></details>" % (esc(q), esc(a)) for q, a in faq)
    ld = [{"@type": "WebPage", "@id": canon + "#pagina", "url": canon, "name": titulo, "description": desc, "inLanguage": HREFLANG[lang], "isPartOf": {"@id": DOM + "#web"}},
          {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}]
    if migas:
        ld.append({"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": h} for i, (n, h) in enumerate(migas)]})
    ldj = json.dumps({"@context": "https://schema.org", "@graph": ld}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return """<!doctype html>
<html lang="%(lang)s">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; media-src 'self' data:; connect-src 'self' https://dvybttkqvrpzrvpnszxc.supabase.co https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; form-action 'self'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-adsense-account" content="ca-pub-3562310629171137">
<title>%(titulo)s</title>
<meta name="description" content="%(desc)s">
<link rel="canonical" href="%(canon)s">
%(alts)s
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#f2f5fa">
<meta property="og:type" content="website">
<meta property="og:title" content="%(titulo)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:url" content="%(canon)s">
<meta property="og:site_name" content="TIKITEXTO">
<meta property="og:locale" content="%(loc)s">
<meta property="og:image" content="https://tikitexto.com/icons/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="%(base)sfavicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="%(base)sicons/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="%(base)sicons/favicon-96.png">
<link rel="icon" type="image/png" sizes="32x32" href="%(base)sicons/favicon-32.png">
<link rel="apple-touch-icon" href="%(base)sicons/apple-touch-icon.png">
<script type="application/ld+json">%(ld)s</script>
<style>%(css)s</style>
</head>
<body>
<header><a class="m" href="%(base)s?lang=%(lang)s" translate="no">TIKI<span>TEXTO</span></a><nav class="l" aria-label="Language">%(sel)s</nav></header>
<main>
<h1>%(h1)s</h1>
<p class="lead">%(lead)s</p>
<p><a class="cta" href="%(cta)s">%(jugar)s →</a></p>
<h2>%(como)s</h2>
<ol>%(pasos)s</ol>
%(bloques)s
<h2>%(faqt)s</h2>
%(faq)s
</main>
<footer>
<p><a href="%(curhref)s">%(curlabel)s</a><a href="%(guiahref)s">%(guialabel)s</a><a href="%(clhref)s">%(cllabel)s</a><a href="%(base)saviso-legal.html">%(legal)s</a><a href="%(base)sprivacidad.html">%(priv)s</a><a href="%(base)scookies.html">%(cook)s</a><a href="%(base)saccesibilidad.html">%(acc)s</a></p>
<p>%(nota)s</p>
</footer>
</body>
</html>
""" % dict(lang=HREFLANG[lang] if lang != "es" else "es", titulo=esc(titulo), desc=esc(desc), canon=canon, alts=hreflang_html, loc=HREFLANG[lang].replace("-", "_") if lang != "es" else "es_ES",
           base=base, ld=ldj, css=CSS, sel=selector, h1=esc(h1), lead=esc(lead), cta=cta, jugar=esc(u["jugar"]), como=esc(u["como"]),
           pasos="".join("<li>%s</li>" % esc(p) for p in u["pasos"]), bloques=bloques, faqt=esc(u["faq"]), faq=faq_html,
           clhref=base + ("clases/" if lang == "es" else "en/classes/"), cllabel=("Clases de fútbol" if lang == "es" else "Football lessons"), guiahref=base + ("juegos/" if lang == "es" else "en/games/"), guialabel=("Guías de los juegos" if lang == "es" else "Game guides"), curhref=base + ("" if lang == "es" else lang + "/") + "curiosidades/", curlabel=esc(CUR_LABEL[lang]), legal=esc(u["legal"]), priv=esc(u["priv"]), cook=esc(u["cook"]), acc=esc(u["acc"]), nota=esc(u["nota"]))

def escribir(ruta, contenido):
    destino = os.path.join(RAIZ, ruta, "index.html")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    open(destino, "w", encoding="utf-8").write(contenido)

CUR_LABEL = {"es": "Curiosidades del fútbol", "en": "Football trivia", "pt": "Curiosidades do futebol", "fr": "Curiosités du football", "it": "Curiosità sul calcio", "de": "Fußball-Wissenswertes"}
urls = [("", "es")]
# páginas de idioma
for lang in LANGS[1:]:
    L = LANDING[lang]; u = UI[lang]
    modos = "".join('<li><a href="../?lang=%s&modo=%s">%s</a></li>' % (lang, m, esc(T(n, lang))) for n, m in MODOS_LISTA)
    if lang in ("en", "de"):
        _lista = MODOS_EN if lang == "en" else MODOS_DE
        modos = "".join('<li><a href="%s/">%s</a></li>' % (g["slug"], esc(g["h1"])) for g in _lista)
    _cur = '<h2>%s</h2><ul class="g"><li><a href="curiosidades/">%s</a></li></ul>' % (esc(CUR_LABEL[lang]), esc(CUR_LABEL[lang]))
    bloques = _cur + "<h2>%s</h2><ul class=\"g\">%s</ul>" % (esc(u["modos"]), modos)
    faq = [(T(FAQ_CLAVES[i], lang), T(FAQ_RESP[i], lang)) for i in range(6)]
    escribir(lang, pagina(lang, lang + "/", L["titulo"], L["desc"], L["h1"], L["lead"], None, bloques, faq, alternates(), 1))
    urls.append((lang + "/", lang))
# alternates entre las páginas de modo en es / en / de (mismo modo)
MODO_SLUGS = {}
for _m in MODOS_ES: MODO_SLUGS.setdefault(_m["modo"], {})["es"] = _m["slug"]
for _m in MODOS_EN: MODO_SLUGS.setdefault(_m["modo"], {})["en"] = _m["slug"]
for _m in MODOS_DE: MODO_SLUGS.setdefault(_m["modo"], {})["de"] = _m["slug"]
def alts_modo(modo):
    d = MODO_SLUGS[modo]
    out = ['<link rel="alternate" hreflang="%s" href="%s%s%s/">' % (HREFLANG[c], DOM, "" if c == "es" else c + "/", d[c]) for c in ("es", "en", "de")]
    out.append('<link rel="alternate" hreflang="x-default" href="%s%s/">' % (DOM, d["es"]))
    return "\n".join(out)
# páginas de modo (español)
for m in MODOS_ES:
    u = UI["es"]
    otros = "".join('<li><a href="../%s/">%s</a></li>' % (o["slug"], esc(o["h1"])) for o in MODOS_ES if o["slug"] != m["slug"])
    otros += '<li><a href="../ahorcado-futbolistas/">Ahorcado de futbolistas</a></li>'
    bloques = XT.bloque("es", m["modo"], "../") + '<h2>Más modos para jugar</h2><ul class="g">%s<li><a href="../">Todos los modos</a></li></ul>' % otros
    faq = m["qa"] + [(FAQ_CLAVES[1], FAQ_RESP[1]), (FAQ_CLAVES[2], FAQ_RESP[2])]
    migas = [("TIKITEXTO", DOM), (m["h1"], DOM + m["slug"] + "/")]
    escribir(m["slug"], pagina("es", m["slug"] + "/", m["titulo"], m["desc"], m["h1"], m["lead"], m["modo"], bloques, faq,
                               alts_modo(m["modo"]), 1, migas))
    urls.append((m["slug"] + "/", "es"))


# ---- página del Ahorcado (es/en): modo especial con su propia entrada de búsqueda ----
AHORCADO = {
 "es": dict(slug="ahorcado-futbolistas", titulo="Ahorcado de fútbol: juega al ahorcado de futbolistas online gratis | TIKITEXTO", desc="Juega al ahorcado de fútbol, el ahorcado futbolero: adivina el nombre de un crack de fútbol letra a letra antes de cometer 5 fallos. Gratis, sin registro y con ranking.", h1="Ahorcado de futbolistas",
        lead="El clásico ahorcado con un giro futbolero: hay un jugador famoso escondido y cada cuadrado es una letra de su nombre. Toca letras del teclado; si fallas, el muñeco avanza. Tienes 5 fallos y no hay pistas.",
        qa=[("¿Cuántos fallos puedo cometer?", "Cinco. Con el quinto fallo, el muñeco se completa y pierdes la partida."), ("¿Qué jugadores aparecen?", "Medio centenar de futbolistas famosos, de leyendas como Pelé o Maradona a estrellas actuales."), ("¿Se gana algo?", "Cada 3 victorias seguidas ganas +1 tikitexto, y se guarda tu mejor racha."), ("¿Es gratis?", "Sí, gratis y sin registro: puedes jugar como invitado.")],
        otros="Más modos para jugar", todos="Todos los modos", cta="Jugar al ahorcado"),
 "en": dict(slug="football-hangman", titulo="Football hangman online, free | TIKITEXTO", desc="Play football (soccer) hangman: guess the famous player's name letter by letter before 5 mistakes. Free, no sign-up, with a worldwide ranking.", h1="Football hangman",
        lead="The classic hangman with a football twist: a famous player is hidden and every square is a letter of his name. Tap letters on the keyboard; each mistake brings the stick figure closer to the end. You get 5 mistakes and no hints.",
        qa=[("How many mistakes can I make?", "Five. On the fifth mistake the figure is complete and the round is over."), ("Which players appear?", "About fifty famous footballers, from legends like Pelé or Maradona to current stars."), ("Do I win anything?", "Every 3 wins in a row earns you +1 tikitexto, and your best streak is saved."), ("Is it free?", "Yes, free and with no sign-up: you can play as a guest.")],
        otros="More ways to play", todos="All game modes", cta="Play hangman"),
}
_AH_ALTS = '<link rel="alternate" hreflang="es" href="%sahorcado-futbolistas/">\n<link rel="alternate" hreflang="en" href="%sen/football-hangman/">\n<link rel="alternate" hreflang="x-default" href="%sahorcado-futbolistas/">' % (DOM, DOM, DOM)
for _l, _a in AHORCADO.items():
    _otros = "".join('<li><a href="%s">%s</a></li>' % (("../%s/" % o["slug"]) if _l == "es" else ("../%s/" % o["slug"]), esc(o["h1"])) for o in (MODOS_ES if _l == "es" else MODOS_EN))
    _bl = XT.bloque(_l, "ahorcado", "../" if _l == "es" else "../../") + '<h2>%s</h2><ul class="g">%s<li><a href="../">%s</a></li></ul>' % (_a["otros"], _otros, _a["todos"])
    _faq = _a["qa"]
    _ruta = ("" if _l == "es" else "en/") + _a["slug"] + "/"
    _migas = [("TIKITEXTO", DOM + ("" if _l == "es" else "en/")), (_a["h1"], DOM + _ruta)]
    escribir(_ruta, pagina(_l, _ruta, _a["titulo"], _a["desc"], _a["h1"], _a["lead"], "ahorcado", _bl, _faq, _AH_ALTS, 1 if _l == "es" else 2, _migas))


# ---- guías de los juegos nuevos (es/en) + hub ----
import juegos_data as _jd
_JT = {"es": ("Cómo se juega", "Reglas y puntuación", "Consejos para jugar mejor", "Más juegos", "Todas las guías de juegos", "Guías de los juegos de TIKITEXTO", "Guías de juegos de fútbol: cómo se juega, reglas y consejos | TIKITEXTO", "Aprende cómo se juega cada juego de TIKITEXTO: letras, 3D y retos de fútbol, con sus reglas, la puntuación, los consejos y las preguntas frecuentes.", "Cada juego de TIKITEXTO tiene su propia guía con las reglas, la puntuación, los trucos y las recompensas. Léelas antes de jugar o cuando te quedes atascado: todas se basan en cómo funciona el juego de verdad."),
       "en": ("How to play", "Rules and scoring", "Tips to play better", "More games", "All game guides", "TIKITEXTO game guides", "Football game guides: how to play, rules and tips | TIKITEXTO", "Learn how each TIKITEXTO game works: word games, 3D games and football challenges, with rules, scoring, tips and frequently asked questions.", "Every TIKITEXTO game has its own guide with the rules, scoring, tricks and rewards. Read them before playing or when you get stuck: they all describe how each game really works.")}
_JSL = {"es": ("juegos/", lambda g: "juegos/" + g["es"] + "/"), "en": ("en/games/", lambda g: "en/games/" + g["en"] + "/")}
def _alts_juego(g):
    return ('<link rel="alternate" hreflang="es" href="%sjuegos/%s/">\n<link rel="alternate" hreflang="en" href="%sen/games/%s/">\n<link rel="alternate" hreflang="x-default" href="%sjuegos/%s/">' % (DOM, g["es"], DOM, g["en"], DOM, g["es"]))
for _l in ("es", "en"):
    _t = _JT[_l]
    for g in _jd.J:
        _ul = lambda xs: "<ul>" + "".join("<li>%s</li>" % esc(x) for x in xs) + "</ul>"
        _otros = "".join('<li><a href="../%s/">%s</a></li>' % (o[_l], esc(o[_l + "_h1"])) for o in _jd.J if o is not g)
        _bl = "<h2>%s</h2>%s<h2>%s</h2>%s<h2>%s</h2><ul class=\"g\">%s<li><a href=\"../\">%s</a></li></ul>" % (_t[1], _ul(g[_l + "_reglas"]), _t[2], _ul(g[_l + "_cons"]), _t[3], _otros, _t[4])
        _ruta = _JSL[_l][1](g)
        _migas = [("TIKITEXTO", DOM + ("" if _l == "es" else "en/")), (_t[5], DOM + _JSL[_l][0]), (g[_l + "_h1"], DOM + _ruta)]
        escribir(_ruta, pagina(_l, _ruta, g[_l + "_t"], g[_l + "_d"], g[_l + "_h1"], g[_l + "_lead"], g["modo"], _bl, g[_l + "_qa"], _alts_juego(g), 2 if _l == "es" else 3, _migas, pasos=g[_l + "_pasos"], como=_t[0]))
    _items = "".join('<li><a href="%s/">%s</a></li>' % (g[_l], esc(g[_l + "_h1"])) for g in _jd.J)
    _hub_bl = '<h2>%s</h2><ul class="g">%s</ul>' % (_t[5], _items)
    _hub_alts = '<link rel="alternate" hreflang="es" href="%sjuegos/">\n<link rel="alternate" hreflang="en" href="%sen/games/">\n<link rel="alternate" hreflang="x-default" href="%sjuegos/">' % (DOM, DOM, DOM)
    _hub_faq = [("¿Hace falta registrarse?" if _l == "es" else "Do I need to sign up?", "No: todos los juegos se pueden jugar como invitado y con cuenta guardas tu progreso." if _l == "es" else "No: every game can be played as a guest and with an account your progress is saved."),
                ("¿Qué son los tikitextos?" if _l == "es" else "What are tikitextos?", "Son los puntos de TIKITEXTO: se ganan acertando o ganando partidas y cuentan para el ranking mundial." if _l == "es" else "They are TIKITEXTO points: you earn them by guessing or winning games and they count for the worldwide ranking.")]
    _hub_ruta = _JSL[_l][0]
    escribir(_hub_ruta, pagina(_l, _hub_ruta, _t[6], _t[7], _t[5], _t[8], None, _hub_bl, _hub_faq, _hub_alts, 1 if _l == "es" else 2, [("TIKITEXTO", DOM + ("" if _l == "es" else "en/")), (_t[5], DOM + _hub_ruta)], pasos=[(("Elige el juego que te interese en la lista." if _l == "es" else "Pick the game you like from the list.")), (("Lee las reglas, la puntuación y los consejos." if _l == "es" else "Read the rules, scoring and tips.")), (("Pulsa «Jugar» para empezar la partida." if _l == "es" else "Press “Play” to start the game."))], como=("Cómo usar las guías" if _l == "es" else "How to use the guides")))


# ---- clases animadas: página de texto por lección (es/en) + hub ----
_CL = json.load(open(os.path.join(RAIZ, "tools", "clases_texto.json"), encoding="utf-8"))
_CL_EN = {"fuera-de-juego": "offside-rule-explained", "como-se-gana-un-torneo": "how-a-football-tournament-is-won", "tarjetas-amarillas-y-rojas": "yellow-and-red-cards-explained",
  "como-funciona-el-var": "how-the-var-works", "posiciones-y-formaciones": "football-positions-and-formations", "reglas-basicas-del-futbol": "basic-rules-of-football",
  "penalti-y-tanda-de-penaltis": "penalty-kick-and-shootout-rules", "fichajes-traspasos-y-clausulas": "football-transfers-loans-release-clauses", "como-funciona-una-liga": "how-a-football-league-works",
  "la-mano-cuando-es-falta": "handball-rule-explained", "tacticas-basicas-del-futbol": "basic-football-tactics", "que-es-el-xg-goles-esperados": "what-is-xg-expected-goals",
  "saques-banda-meta-esquina": "throw-in-goal-kick-corner-rules", "faltas-tiros-libres-y-ventaja": "fouls-free-kicks-and-advantage", "el-portero-reglas-y-funciones": "goalkeeper-rules-and-role",
  "champions-league-formato-actual": "champions-league-format-explained", "el-tiempo-del-partido-descuento-y-prorroga": "added-time-and-extra-time-explained", "estadisticas-del-futbol-que-significan": "football-statistics-explained"}
_CLT = {"es": dict(base="clases/", hub="Clases de fútbol explicadas", hub_t="Clases de fútbol explicadas: reglas, tácticas y estadísticas | TIKITEXTO",
                   hub_d="18 clases de fútbol explicadas paso a paso: fuera de juego, VAR, tarjetas, penaltis, tácticas, xG, formato de la Champions y más. Texto de cada clase animada de TIKITEXTO.",
                   hub_l="TIKITEXTO tiene 18 clases animadas con profe y pizarra. Aquí tienes el texto de cada una para leerlo con calma, con las reglas explicadas de forma sencilla. Elige la que quieras y, si prefieres verla animada, ábrela en el reproductor.",
                   sec="Lo que se explica en la clase", otras="Más clases", todas="Todas las clases", verla="Ver la clase animada", dur="Duración de la clase animada",
                   pasos=["Lee la explicación de esta página con calma.", "Pulsa el botón para abrir la clase animada en el reproductor.", "Elige idioma, vista de pizarra o de profe y repite las escenas que quieras."],
                   como="Cómo usar esta clase", faqt=("¿Qué se explica en esta clase?", "¿Se puede ver en otros idiomas?", "¿De dónde salen las reglas?"),
                   faqr=("Esta página reúne todo lo que dice el profe en la clase «%s», en el mismo orden, para que puedas leerlo sin necesidad de reproducir nada.", "Sí. La clase animada se puede ver en español, inglés, portugués, francés, italiano y alemán desde el propio reproductor.", "De las Reglas de Juego del IFAB y de la normativa de FIFA y UEFA. Se revisan cuando cambian las reglas, normalmente cada verano."),
                   nota="Texto redactado por el equipo editorial de TIKITEXTO a partir de las Reglas de Juego del IFAB y la normativa de FIFA y UEFA."),
        "en": dict(base="en/classes/", hub="Football lessons explained", hub_t="Football lessons explained: rules, tactics and statistics | TIKITEXTO",
                   hub_d="18 football lessons explained step by step: offside, VAR, cards, penalties, tactics, xG, the Champions League format and more. The text of every animated TIKITEXTO lesson.",
                   hub_l="TIKITEXTO has 18 animated lessons with a teacher and a whiteboard. Here is the text of each one to read at your own pace, with the rules explained in a simple way. Pick any lesson and, if you prefer to watch it animated, open it in the player.",
                   sec="What the lesson explains", otras="More lessons", todas="All lessons", verla="Watch the animated lesson", dur="Animated lesson length",
                   pasos=["Read the explanation on this page at your own pace.", "Press the button to open the animated lesson in the player.", "Choose language, whiteboard or teacher view and replay any scene you like."],
                   como="How to use this lesson", faqt=("What does this lesson explain?", "Can I watch it in other languages?", "Where do the rules come from?"),
                   faqr=("This page gathers everything the teacher says in the lesson “%s”, in the same order, so you can read it without playing anything.", "Yes. The animated lesson can be watched in Spanish, English, Portuguese, French, Italian and German from the player itself.", "From the IFAB Laws of the Game and FIFA and UEFA regulations. They are reviewed when the rules change, usually every summer."),
                   nota="Text written by the TIKITEXTO editorial team from the IFAB Laws of the Game and FIFA and UEFA regulations.")}
def _cl_ruta(l, g): return _CLT[l]["base"] + (g["id"] if l == "es" else _CL_EN[g["id"]]) + "/"
def _cl_alts(g): return '<link rel="alternate" hreflang="es" href="%s%s">\n<link rel="alternate" hreflang="en" href="%s%s">\n<link rel="alternate" hreflang="x-default" href="%s%s">' % (DOM, _cl_ruta("es", g), DOM, _cl_ruta("en", g), DOM, _cl_ruta("es", g))
for _l in ("es", "en"):
    _c = _CLT[_l]
    for g in _CL:
        _d = g[_l]
        _txt = "<h2>%s</h2>" % esc(_c["sec"]) + "".join("<p>%s</p>" % esc(x) for x in _d["say"]) + '<p><strong>%s:</strong> %s</p>' % (esc(_c["dur"]), esc(g["dur"]))
        _otras = "".join('<li><a href="../%s/">%s</a></li>' % ((o["id"] if _l == "es" else _CL_EN[o["id"]]), esc(o[_l]["titulo"])) for o in _CL if o is not g)
        _bl = _txt + '<p><a class="cta" href="%s?lang=%s&modo=clases">%s →</a></p><h2>%s</h2><ul class="g">%s<li><a href="../">%s</a></li></ul><p>%s</p>' % ("../" * (2 if _l == "es" else 3), _l, esc(_c["verla"]), esc(_c["otras"]), _otras, esc(_c["todas"]), esc(_c["nota"]))
        _faq = [(_c["faqt"][0], _c["faqr"][0] % _d["titulo"]), (_c["faqt"][1], _c["faqr"][1]), (_c["faqt"][2], _c["faqr"][2])]
        _ruta = _cl_ruta(_l, g)
        _tt = ("%s: clase de fútbol explicada | TIKITEXTO" if _l == "es" else "%s: football lesson explained | TIKITEXTO") % _d["titulo"]
        _migas = [("TIKITEXTO", DOM + ("" if _l == "es" else "en/")), (_c["hub"], DOM + _c["base"]), (_d["titulo"], DOM + _ruta)]
        escribir(_ruta, pagina(_l, _ruta, _tt, _d["desc"], _d["titulo"], _d["desc"], "clases", _bl, _faq, _cl_alts(g), 2 if _l == "es" else 3, _migas, pasos=_c["pasos"], como=_c["como"]))
    _items = "".join('<li><a href="%s/">%s</a></li>' % ((g["id"] if _l == "es" else _CL_EN[g["id"]]), esc(g[_l]["titulo"])) for g in _CL)
    _hub_alts = '<link rel="alternate" hreflang="es" href="%sclases/">\n<link rel="alternate" hreflang="en" href="%sen/classes/">\n<link rel="alternate" hreflang="x-default" href="%sclases/">' % (DOM, DOM, DOM)
    escribir(_c["base"], pagina(_l, _c["base"], _c["hub_t"], _c["hub_d"], _c["hub"], _c["hub_l"], "clases", '<h2>%s</h2><ul class="g">%s</ul>' % (esc(_c["hub"]), _items), _hub_faq_cl if False else [(_c["faqt"][1], _c["faqr"][1]), (_c["faqt"][2], _c["faqr"][2])], _hub_alts, 1 if _l == "es" else 2, [("TIKITEXTO", DOM + ("" if _l == "es" else "en/")), (_c["hub"], DOM + _c["base"])], pasos=_c["pasos"], como=_c["como"]))

for lang, lista in (("en", MODOS_EN), ("de", MODOS_DE)):
    for m in lista:
        otros_t, todos_t = LABELS_ED[lang]
        otros = "".join('<li><a href="../%s/">%s</a></li>' % (o["slug"], esc(o["h1"])) for o in lista if o["slug"] != m["slug"])
        if lang == "en": otros += '<li><a href="../football-hangman/">Football hangman</a></li>'
        bloques = (XT.bloque("en", m["modo"], "../../") if lang == "en" else "") + '<h2>%s</h2><ul class="g">%s<li><a href="../">%s</a></li></ul>' % (otros_t, otros, todos_t)
        faq = m["qa"] + [(T(FAQ_CLAVES[1], lang), T(FAQ_RESP[1], lang)), (T(FAQ_CLAVES[2], lang), T(FAQ_RESP[2], lang))]
        ruta = lang + "/" + m["slug"] + "/"
        migas = [("TIKITEXTO", DOM + lang + "/"), (m["h1"], DOM + ruta)]
        escribir(ruta, pagina(lang, ruta, m["titulo"], m["desc"], m["h1"], m["lead"], m["modo"], bloques, faq, alts_modo(m["modo"]), 2, migas))
        urls.append((ruta, lang))

# ---- sitemap ----
home_alts = "".join('<xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>' % (HREFLANG[c], DOM, "" if c == "es" else c + "/") for c in LANGS) + '<xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % DOM
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for ruta, lang in urls:
    extra = home_alts if (ruta == "" or ruta.rstrip("/") in LANGS) else ""
    _sl = ruta.rstrip("/").split("/")[-1]
    for _modo, _d in MODO_SLUGS.items():
        if _sl in _d.values():
            extra = "".join('<xhtml:link rel="alternate" hreflang="%s" href="%s%s%s/"/>' % (HREFLANG[c], DOM, "" if c == "es" else c + "/", _d[c]) for c in ("es", "en", "de")) + '<xhtml:link rel="alternate" hreflang="x-default" href="%s%s/"/>' % (DOM, _d["es"])
    sm.append("  <url><loc>%s%s</loc>%s</url>" % (DOM, ruta, extra))
for sub in ("curiosidades/", "curiosidades/campeones/", "curiosidades/ligas/", "curiosidades/trofeos/"):
    alts = "".join('<xhtml:link rel="alternate" hreflang="%s" href="%s%s%s"/>' % (HREFLANG[c], DOM, "" if c == "es" else c + "/", sub) for c in LANGS) + '<xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>' % (DOM, sub)
    for c in LANGS:
        sm.append("  <url><loc>%s%s%s</loc>%s</url>" % (DOM, "" if c == "es" else c + "/", sub, alts))
# páginas de datos (solo es/en; slugs distintos por idioma)
_sys.path.insert(0, os.path.join(RAIZ, "tools"))
import curiosidades_datos as _cd
_es = _cd.paginas(_cd.Idioma("es")); _en = _cd.fix_en(_cd.paginas(_cd.Idioma("en")))
for _ra, _rb in [("datos", "datos")] + [(x["slug"], y["slug"]) for x, y in zip(_es, _en)]:
    _u = (DOM + "curiosidades/" + _ra + "/", DOM + "en/curiosidades/" + _rb + "/")
    _alts = '<xhtml:link rel="alternate" hreflang="es" href="%s"/><xhtml:link rel="alternate" hreflang="en" href="%s"/><xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % (_u[0], _u[1], _u[0])
    for _x in _u: sm.append("  <url><loc>%s</loc>%s</url>" % (_x, _alts))
import curiosidades_temas as _ct
for _pg in _ct.T.TEMAS + [dict(es=_ct.HUB[0], en=_ct.HUB[1])]:
    _u = (DOM + "curiosidades/" + _pg["es"] + "/", DOM + "en/curiosidades/" + _pg["en"] + "/")
    _alts = '<xhtml:link rel="alternate" hreflang="es" href="%s"/><xhtml:link rel="alternate" hreflang="en" href="%s"/><xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % (_u[0], _u[1], _u[0])
    for _x in _u: sm.append("  <url><loc>%s</loc>%s</url>" % (_x, _alts))
import curiosidades_articulos as _ca
sm.append("  <url><loc>%sarticulos/</loc></url>" % DOM)
sm.append("  <url><loc>%sarticulos/balon-de-oro/</loc></url>" % DOM)
for _a in _ca.ARTICULOS: sm.append("  <url><loc>%sarticulos/%s/</loc></url>" % (DOM, _a["slug"]))
import curiosidades_extra as _cx
sm.append("  <url><loc>%shistorias/</loc></url>" % DOM)
for _c in _cx.H.COLECCIONES: sm.append("  <url><loc>%shistorias/%s/</loc></url>" % (DOM, _c["slug"]))
sm.append("  <url><loc>%speques/</loc></url>" % DOM)
for _p in _cx.PAGINAS_P: sm.append("  <url><loc>%speques/%s/</loc></url>" % (DOM, _p["slug"]))
import curiosidades_historia as _ch
for _pg in _ch.PAGINAS:
    _u = (DOM + "curiosidades/" + _pg["es"] + "/", DOM + "en/curiosidades/" + _pg["en"] + "/")
    _alts = '<xhtml:link rel="alternate" hreflang="es" href="%s"/><xhtml:link rel="alternate" hreflang="en" href="%s"/><xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % (_u[0], _u[1], _u[0])
    for _x in _u: sm.append("  <url><loc>%s</loc>%s</url>" % (_x, _alts))
import curiosidades_estadisticas as _ce
for _pg in _ce.PAGINAS:
    _u = (DOM + "curiosidades/" + _pg["es"] + "/", DOM + "en/curiosidades/" + _pg["en"] + "/")
    _alts = '<xhtml:link rel="alternate" hreflang="es" href="%s"/><xhtml:link rel="alternate" hreflang="en" href="%s"/><xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % (_u[0], _u[1], _u[0])
    for _x in _u: sm.append("  <url><loc>%s</loc>%s</url>" % (_x, _alts))
_cmp_alts = '<xhtml:link rel="alternate" hreflang="es" href="%scomparador/"/><xhtml:link rel="alternate" hreflang="en" href="%sen/football-comparator/"/><xhtml:link rel="alternate" hreflang="x-default" href="%scomparador/"/>' % (DOM, DOM, DOM)
for _x in (DOM + "comparador/", DOM + "en/football-comparator/"): sm.append("  <url><loc>%s</loc>%s</url>" % (_x, _cmp_alts))
import comparador_duelos as _DU
for _m, _a, _b in _DU.rutas():
    _al = '<xhtml:link rel="alternate" hreflang="es" href="%scomparador/%s-vs-%s/"/><xhtml:link rel="alternate" hreflang="en" href="%sen/football-comparator/%s-vs-%s/"/><xhtml:link rel="alternate" hreflang="x-default" href="%scomparador/%s-vs-%s/"/>' % (DOM, _a, _b, DOM, _a, _b, DOM, _a, _b)
    for _r in ("comparador/", "en/football-comparator/"): sm.append("  <url><loc>%s%s%s-vs-%s/</loc>%s</url>" % (DOM, _r, _a, _b, _al))
_ah_alts = '<xhtml:link rel="alternate" hreflang="es" href="%sahorcado-futbolistas/"/><xhtml:link rel="alternate" hreflang="en" href="%sen/football-hangman/"/><xhtml:link rel="alternate" hreflang="x-default" href="%sahorcado-futbolistas/"/>' % (DOM, DOM, DOM)
for _x in (DOM + "ahorcado-futbolistas/", DOM + "en/football-hangman/"): sm.append("  <url><loc>%s</loc>%s</url>" % (_x, _ah_alts))

for _x in (DOM + "juegos/", DOM + "en/games/"): sm.append("  <url><loc>%s</loc>%s</url>" % (_x, '<xhtml:link rel="alternate" hreflang="es" href="%sjuegos/"/><xhtml:link rel="alternate" hreflang="en" href="%sen/games/"/><xhtml:link rel="alternate" hreflang="x-default" href="%sjuegos/"/>' % (DOM, DOM, DOM)))
for _g in _jd.J:
    _a = '<xhtml:link rel="alternate" hreflang="es" href="%sjuegos/%s/"/><xhtml:link rel="alternate" hreflang="en" href="%sen/games/%s/"/><xhtml:link rel="alternate" hreflang="x-default" href="%sjuegos/%s/"/>' % (DOM, _g["es"], DOM, _g["en"], DOM, _g["es"])
    for _x in (DOM + "juegos/" + _g["es"] + "/", DOM + "en/games/" + _g["en"] + "/"): sm.append("  <url><loc>%s</loc>%s</url>" % (_x, _a))

for _x in (DOM + "clases/", DOM + "en/classes/"): sm.append("  <url><loc>%s</loc>%s</url>" % (_x, '<xhtml:link rel="alternate" hreflang="es" href="%sclases/"/><xhtml:link rel="alternate" hreflang="en" href="%sen/classes/"/><xhtml:link rel="alternate" hreflang="x-default" href="%sclases/"/>' % (DOM, DOM, DOM)))
for _g in _CL:
    _a = '<xhtml:link rel="alternate" hreflang="es" href="%s%s"/><xhtml:link rel="alternate" hreflang="en" href="%s%s"/><xhtml:link rel="alternate" hreflang="x-default" href="%s%s"/>' % (DOM, _cl_ruta("es", _g), DOM, _cl_ruta("en", _g), DOM, _cl_ruta("es", _g))
    for _x in (DOM + _cl_ruta("es", _g), DOM + _cl_ruta("en", _g)): sm.append("  <url><loc>%s</loc>%s</url>" % (_x, _a))
for p in ("privacidad.html", "aviso-legal.html", "cookies.html", "accesibilidad.html", "contacto.html", "sobre-tikitexto.html"):
    sm.append("  <url><loc>%s%s</loc></url>" % (DOM, p))
sm.append("</urlset>")
open(os.path.join(RAIZ, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm) + "\n")
print("páginas:", len(urls), [r for r, _ in urls])
