#!/usr/bin/env python3
"""Genera las páginas de búsqueda (una por modo en español y una por idioma) y el sitemap.xml.
Uso: python3 tools/seo.py   (desde cualquier carpeta). Las traducciones de los modos y de las
preguntas frecuentes salen de i18n/fuente.txt; el resto de textos está aquí."""
import html, json, os
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

FAQ_CLAVES = ["¿Cómo se juega a TIKITEXTO?", "¿Es gratis? ¿Hay que registrarse?", "¿Cada cuánto hay un reto nuevo?", "¿En qué idiomas está disponible?", "¿Se puede instalar en el móvil?"]
FAQ_RESP = ["Escribe un nombre con el mismo número de letras que las casillas y pulsa Intro. Verde: letra bien colocada; amarillo: está en otra posición; gris: no está en el nombre. Tienes 6 intentos.",
            "Es gratis y no pide correo ni contraseña: solo eliges un nickname para el ranking mundial. Se guarda un código de recuperación por si cambias de dispositivo.",
            "El Tikitexto diario cambia cada día y es el mismo para todo el mundo. Los demás modos puedes jugarlos tantas veces como quieras.",
            "En español, inglés, portugués, francés, italiano y alemán.",
            "Sí. Es una app web (PWA): desde el navegador, elige «Añadir a la pantalla de inicio»."]

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
 "en": dict(titulo="Daily football game: guess the player, team & stadium | TIKITEXTO", desc="Free daily football game: guess the player, team, stadium or national team in 6 tries. World ranking, no sign-up.", h1="Daily football guessing game", lead="A new hidden name every day: a player, a team, a stadium, a national team or a manager. Six attempts, colour clues after each one and a world ranking. Free and with no sign-up."),
 "pt": dict(titulo="Jogo diário de futebol: adivinhe o jogador, o time e o estádio | TIKITEXTO", desc="Jogo de futebol grátis todo dia: adivinhe o jogador, o time, o estádio ou a seleção em 6 tentativas. Com ranking mundial e sem cadastro.", h1="Jogo diário de adivinhar futebol", lead="Todo dia um nome novo escondido: um jogador, um time, um estádio, uma seleção ou um treinador. Seis tentativas, pistas em cores a cada uma e ranking mundial. Grátis e sem cadastro."),
 "fr": dict(titulo="Jeu quotidien de football : devine le joueur, l'équipe et le stade | TIKITEXTO", desc="Jeu de football gratuit chaque jour : devine le joueur, l'équipe, le stade ou la sélection en 6 essais. Classement mondial, sans inscription.", h1="Jeu quotidien de football à deviner", lead="Chaque jour, un nouveau nom caché : un joueur, une équipe, un stade, une sélection ou un entraîneur. Six essais, des indices en couleurs après chacun et un classement mondial. Gratuit et sans inscription."),
 "it": dict(titulo="Gioco quotidiano di calcio: indovina giocatore, squadra e stadio | TIKITEXTO", desc="Gioco di calcio gratuito ogni giorno: indovina giocatore, squadra, stadio o nazionale in 6 tentativi. Classifica mondiale, senza registrazione.", h1="Gioco quotidiano di calcio da indovinare", lead="Ogni giorno un nuovo nome nascosto: un giocatore, una squadra, uno stadio, una nazionale o un allenatore. Sei tentativi, indizi a colori dopo ognuno e classifica mondiale. Gratis e senza registrazione."),
 "de": dict(titulo="Tägliches Fußballspiel: Spieler, Team und Stadion erraten | TIKITEXTO", desc="Kostenloses tägliches Fußballspiel: Errate Spieler, Team, Stadion oder Nationalmannschaft in 6 Versuchen. Weltrangliste, ohne Anmeldung.", h1="Tägliches Fußball-Ratespiel", lead="Jeden Tag ein neuer versteckter Name: ein Spieler, ein Team, ein Stadion, eine Nationalmannschaft oder ein Trainer. Sechs Versuche, Farbhinweise nach jedem und eine Weltrangliste. Kostenlos und ohne Anmeldung."),
}
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

def pagina(lang, ruta, titulo, desc, h1, lead, modo_cta, bloques, faq, hreflang_html, profundidad, migas=None, nota_idioma=True):
    u = UI[lang]
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
<meta property="og:image" content="https://tikitexto.com/icons/icon-512.png">
<meta name="twitter:card" content="summary">
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
<p><a href="%(base)saviso-legal.html">%(legal)s</a><a href="%(base)sprivacidad.html">%(priv)s</a><a href="%(base)scookies.html">%(cook)s</a><a href="%(base)saccesibilidad.html">%(acc)s</a></p>
<p>%(nota)s</p>
</footer>
</body>
</html>
""" % dict(lang=HREFLANG[lang] if lang != "es" else "es", titulo=esc(titulo), desc=esc(desc), canon=canon, alts=hreflang_html, loc=HREFLANG[lang].replace("-", "_") if lang != "es" else "es_ES",
           base=base, ld=ldj, css=CSS, sel=selector, h1=esc(h1), lead=esc(lead), cta=cta, jugar=esc(u["jugar"]), como=esc(u["como"]),
           pasos="".join("<li>%s</li>" % esc(p) for p in u["pasos"]), bloques=bloques, faqt=esc(u["faq"]), faq=faq_html,
           legal=esc(u["legal"]), priv=esc(u["priv"]), cook=esc(u["cook"]), acc=esc(u["acc"]), nota=esc(u["nota"]))

def escribir(ruta, contenido):
    destino = os.path.join(RAIZ, ruta, "index.html")
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    open(destino, "w", encoding="utf-8").write(contenido)

urls = [("", "es")]
# páginas de idioma
for lang in LANGS[1:]:
    L = LANDING[lang]; u = UI[lang]
    modos = "".join('<li><a href="../?lang=%s&modo=%s">%s</a></li>' % (lang, m, esc(T(n, lang))) for n, m in MODOS_LISTA)
    bloques = "<h2>%s</h2><ul class=\"g\">%s</ul>" % (esc(u["modos"]), modos)
    faq = [(T(FAQ_CLAVES[i], lang), T(FAQ_RESP[i], lang)) for i in range(5)]
    escribir(lang, pagina(lang, lang + "/", L["titulo"], L["desc"], L["h1"], L["lead"], None, bloques, faq, alternates(), 1))
    urls.append((lang + "/", lang))
# páginas de modo (español)
for m in MODOS_ES:
    u = UI["es"]
    otros = "".join('<li><a href="../%s/">%s</a></li>' % (o["slug"], esc(o["h1"])) for o in MODOS_ES if o["slug"] != m["slug"])
    bloques = '<h2>Más modos para jugar</h2><ul class="g">%s<li><a href="../">Todos los modos</a></li></ul>' % otros
    faq = m["qa"] + [(FAQ_CLAVES[1], FAQ_RESP[1]), (FAQ_CLAVES[2], FAQ_RESP[2])]
    migas = [("TIKITEXTO", DOM), (m["h1"], DOM + m["slug"] + "/")]
    escribir(m["slug"], pagina("es", m["slug"] + "/", m["titulo"], m["desc"], m["h1"], m["lead"], m["modo"], bloques, faq,
                               '<link rel="alternate" hreflang="es" href="%s%s/">' % (DOM, m["slug"]), 1, migas))
    urls.append((m["slug"] + "/", "es"))

# ---- sitemap ----
home_alts = "".join('<xhtml:link rel="alternate" hreflang="%s" href="%s%s"/>' % (HREFLANG[c], DOM, "" if c == "es" else c + "/") for c in LANGS) + '<xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % DOM
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for ruta, lang in urls:
    extra = home_alts if (ruta == "" or ruta.rstrip("/") in LANGS) else ""
    sm.append("  <url><loc>%s%s</loc>%s</url>" % (DOM, ruta, extra))
for p in ("privacidad.html", "aviso-legal.html", "cookies.html", "accesibilidad.html"):
    sm.append("  <url><loc>%s%s</loc></url>" % (DOM, p))
sm.append("</urlset>")
open(os.path.join(RAIZ, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm) + "\n")
print("páginas:", len(urls), [r for r, _ in urls])
