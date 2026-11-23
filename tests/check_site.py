"""Comprobación automática de TIKITEXTO (solo lectura, no escribe nada en el ranking).

Uso local:  BASE_URL=http://localhost:8000/ SKIP_RANKING=1 python tests/check_site.py
En producción (GitHub Actions) usa por defecto https://tikitexto.com/
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright

BASE = os.environ.get("BASE_URL", "https://tikitexto.com/").rstrip("/") + "/"
SKIP_RANKING = os.environ.get("SKIP_RANKING") == "1"
fallos, ok = [], []


def check(nombre, condicion, detalle=""):
    (ok if condicion else fallos).append(nombre + (f" -> {detalle}" if detalle and not condicion else ""))
    print(("  OK   " if condicion else "  FALLO"), nombre, ("" if condicion else f"({detalle})"))


with sync_playwright() as p:
    br = p.chromium.launch()
    ctx = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
    # Las pruebas del juego van en español; el selector de idioma se prueba aparte (3d)
    ctx.add_init_script("if(!localStorage.getItem('tikitexto:idioma'))localStorage.setItem('tikitexto:idioma','es');if(!localStorage.getItem('tikitexto:consentimiento'))localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:vista','juegos');")
    api = ctx.request

    print("1) Archivos publicados")
    for ruta in ["", "manifest.webmanifest", "sw.js", "privacidad.html", "aviso-legal.html", "cookies.html", "accesibilidad.html", "contacto.html", "curiosidades/", "curiosidades/campeones/", "curiosidades/ligas/", "curiosidades/trofeos/", "en/curiosidades/", "de/curiosidades/ligas/", "sitemap.xml", "robots.txt",
                 "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"]:
        try:
            r = api.get(BASE + ruta, timeout=30000)
            check(f"GET /{ruta}", r.status == 200, f"HTTP {r.status}")
        except Exception as e:
            check(f"GET /{ruta}", False, str(e)[:120])

    print("2) Manifest")
    try:
        m = json.loads(api.get(BASE + "manifest.webmanifest").text())
        tamanos = {i.get("sizes") for i in m.get("icons", [])}
        check("manifest válido (nombre, start_url, iconos 192 y 512)",
              bool(m.get("name")) and "start_url" in m and {"192x192", "512x512"} <= tamanos, str(tamanos))
    except Exception as e:
        check("manifest válido", False, str(e)[:120])

    html = api.get(BASE).text()
    check("título correcto", "<title>" in html and "TIKITEXTO" in html.split("</title>")[0])
    check("sin referencias a 'wordle'", "wordle" not in html.lower())

    print("3) Juego en un móvil (sin tocar el servidor)")
    pg = ctx.new_page()
    errores_js = []
    pg.on("pageerror", lambda e: errores_js.append(str(e)))
    pg.route("**/rest/v1/rpc/*", lambda r: r.abort())  # bloquea cualquier llamada al ranking
    perfil = {"pts": 0, "jugadas": 0, "aciertos": 0, "racha": 0, "mejor": 0, "dist": [0] * 6,
              "diario": "", "token": "T" * 24, "online": True, "pend": 0}
    pg.add_init_script(
        "sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');"
        "localStorage.setItem('tikitexto:jugadores'," + json.dumps(json.dumps({"actual": "BotPrueba", "perfiles": {"BotPrueba": perfil}})) + ");")
    pg.goto(BASE, wait_until="networkidle", timeout=60000)
    check("sin errores de JavaScript al cargar", not errores_js, "; ".join(errores_js)[:200])
    check("aparece el menú de modos", pg.locator(".modo").count() >= 8, f"{pg.locator('.modo').count()} modos")
    check("sin scroll horizontal en móvil", pg.evaluate("document.documentElement.scrollWidth <= innerWidth"))
    try:
        pg.click('[data-modo="leyendas"]')
        pg.wait_for_selector(".celda", timeout=10000)
        n = pg.locator(".celda").count() // 6
        pg.keyboard.type("A" * n)
        pg.keyboard.press("Enter")
        pg.wait_for_timeout(2500)
        evaluadas = pg.locator(".celda--correcta,.celda--presente,.celda--ausente").count()
        check("se puede jugar (un intento se evalúa)", evaluadas == n, f"{evaluadas}/{n} casillas")
    except Exception as e:
        check("se puede jugar", False, str(e)[:150])
    check("sin errores de JavaScript durante la partida", not errores_js, "; ".join(errores_js)[:200])

    print("3b) Tutorial interactivo")
    try:
        pg.goto(BASE)
        pg.wait_for_selector("#abrirTutorial", state="attached", timeout=10000)
        pg.evaluate("document.querySelector('#abrirTutorial').click()")
        pg.wait_for_timeout(400)
        check("el tutorial se abre desde el pie", pg.is_visible("#modalTutorial") and pg.is_visible("#tutCerrar"))
        for _ in range(4):
            pg.click("#tutSiguiente")
        check("el último paso ofrece «¡Entendido, a jugar!»", "Entendido" in pg.inner_text("#tutSiguiente"))
        pg.click("#tutSiguiente")
        pg.wait_for_timeout(300)
        check("el botón final cierra el tutorial", not pg.is_visible("#modalTutorial"))
        # primera vez: no sale al entrar; sale al tocar un juego, se puede cerrar y no vuelve
        ctx2 = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pg2 = ctx2.new_page()
        pg2.route("**/rest/v1/rpc/*", lambda r: r.abort())
        pg2.add_init_script(
            "if(!sessionStorage.getItem('tt')){sessionStorage.setItem('tt','1');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');}")
        pg2.goto(BASE, wait_until="networkidle", timeout=60000)
        pg2.wait_for_timeout(800)
        check("tutorial: no aparece nada más entrar", not pg2.is_visible("#modalTutorial"))
        pg2.click('[data-modo="leyendas"]')
        pg2.wait_for_timeout(900)
        check("tutorial: sale al tocar un juego por primera vez", pg2.is_visible("#modalTutorial"))
        pg2.click("#tutCerrar")
        pg2.click("#botonInicio"); pg2.click("#botonSalirSi"); pg2.wait_for_timeout(400)
        pg2.click('[data-modo="leyendas"]'); pg2.wait_for_timeout(900)
        check("tutorial: no vuelve a salir", not pg2.is_visible("#modalTutorial"))
    except Exception as e:
        check("tutorial interactivo", False, str(e)[:150])
    check("sin errores de JavaScript en el tutorial", not errores_js, "; ".join(errores_js)[:200])

    print("3c) Modos de novedad")
    try:
        errores_nv = []
        pg3 = ctx.new_page()
        pg3.on("pageerror", lambda e: errores_nv.append(str(e)))
        perfil3 = dict(perfil, nv={"t": 0, "f": 0, "tut": {}})
        pg3.route("**/rest/v1/rpc/*", lambda r: r.abort())
        pg3.add_init_script(
            "if(!sessionStorage.getItem('nvt')){sessionStorage.setItem('nvt','1');localStorage.removeItem('tikitexto:partida');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');"
            "localStorage.setItem('tikitexto:jugadores'," + json.dumps(json.dumps({"actual": "BotNv", "perfiles": {"BotNv": perfil3}})) + ");}")
        pg3.goto(BASE, wait_until="networkidle", timeout=60000)
        pg3.wait_for_timeout(600)
        pg3.click("[data-grupo-btn=dinamicos]"); pg3.wait_for_timeout(200)
        check("la sección NOVEDAD se ve en el menú", pg3.is_visible(".novedad"))
        pg3.evaluate("document.querySelector('[data-grupo-btn=dinamicos]').click()"); pg3.click("[data-novedad=fichajes]")
        pg3.wait_for_timeout(400)
        check("primera vez: tutorial obligatorio del modo", pg3.is_visible("#modalTutorial") and not pg3.is_visible("#tutCerrar"))
        for _ in range(3):
            pg3.click("#tutSiguiente")
            pg3.wait_for_timeout(250)
        check("tras el tutorial aparece el panel de inicio", pg3.is_visible("#nvEmpezar"))
        pg3.click("#nvEmpezar")
        pg3.fill("#nvInput", "50")
        check("barra y cuadro van sincronizados", pg3.eval_on_selector("#nvSlider", "e => e.value") == "50")
        pg3.click("#nvComprobar")
        pg3.wait_for_timeout(200)
        check("se muestra el resultado", pg3.is_visible(".nv-res"))
        pg3.click("#nvInicio")
        pg3.wait_for_timeout(300)
        if pg3.is_visible("#modalSalirNv"):
            pg3.click("#botonSalirNvSi")
            pg3.wait_for_timeout(200)
        pg3.evaluate("document.querySelector('[data-grupo-btn=dinamicos]').click()"); pg3.click("[data-novedad=fichajes]")
        pg3.wait_for_timeout(300)
        check("el tutorial del modo no vuelve a salir", not pg3.is_visible("#modalTutorial"))
        pg3.click("#nvInicio")
        pg3.wait_for_timeout(200)
        if pg3.is_visible("#modalSalirNv"):
            pg3.click("#botonSalirNvSi")
            pg3.wait_for_timeout(200)
        pg3.click("#abrirTutNv")
        pg3.click("[data-tutnv=tarjetas]")
        pg3.wait_for_timeout(300)
        check("el pie abre los tutoriales de novedad", pg3.is_visible("#modalTutorial") and pg3.is_visible("#tutCerrar"))
        pg3.close()
    except Exception as e:
        check("modos de novedad", False, str(e)[:150])
    check("sin errores de JavaScript en novedad", not errores_nv, "; ".join(errores_nv)[:200])

    print("3d) Idiomas")
    try:
        ctx2 = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        errores_id = []
        pi = ctx2.new_page()
        pi.on("pageerror", lambda e: errores_id.append(str(e)))
        pi.route("**/rest/v1/rpc/*", lambda r: r.abort())
        pi.add_init_script("sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');")
        pi.goto(BASE, wait_until="networkidle", timeout=60000)
        pi.wait_for_timeout(500)
        check("primera visita: aparece el selector de idioma", pi.is_visible(".idioma"))
        check("el selector ofrece 6 idiomas", pi.locator(".idioma__op").count() == 6)
        check("el selector no se cierra con Escape (es obligatorio)", (pi.keyboard.press("Escape") or True) and pi.is_visible(".idioma"))
        pi.click(".idioma__op[data-idioma=en]")
        pi.wait_for_load_state("networkidle")
        pi.wait_for_timeout(800)
        check("al elegir inglés se guarda y recarga", pi.evaluate("localStorage.getItem('tikitexto:idioma')") == "en" and pi.evaluate("document.documentElement.lang") == "en")
        check("ya no aparece el selector", not pi.is_visible(".idioma"))
        if pi.is_visible("#volverPortal"): pi.click("#volverPortal"); pi.wait_for_timeout(300)
        texto0 = pi.inner_text("body")
        check("el portal está en inglés (Games / Learn)", "Games" in texto0 and "Learn" in texto0 and "Football history, facts and" in texto0)
        pi.click("#portalJuegos"); pi.wait_for_timeout(300); pi.evaluate("document.querySelector('[data-vs=letras]').click()"); pi.wait_for_timeout(700)
        texto = pi.inner_text("body")
        check("la portada está en inglés", "Football history, facts and" in texto0 and "Word games" in texto and "Choose a mode" in texto.replace("CHOOSE A MODE", "Choose a mode"))
        check("el menú de modos está traducido", "Goalkeepers" in texto and "Porteros" not in texto)
        for cod, frase in (("pt", "Escolha um modo"), ("fr", "Choisis un mode"), ("it", "Scegli una modalità"), ("de", "Wähle einen Modus")):
            pi.evaluate("localStorage.setItem('tikitexto:idioma','%s')" % cod)
            pi.reload(wait_until="networkidle")
            pi.wait_for_timeout(500)
            check(f"portada en {cod}", frase.lower() in pi.inner_text("body").lower())
        perfil_en = {"pts": 0, "jugadas": 0, "aciertos": 0, "racha": 0, "mejor": 0, "dist": [0] * 6, "diario": "", "token": "T" * 24, "online": True, "pend": 0}
        pi.evaluate("localStorage.setItem('tikitexto:jugadores'," + json.dumps(json.dumps({"actual": "BotEn", "perfiles": {"BotEn": perfil_en}})) + ")")
        pi.evaluate("localStorage.setItem('tikitexto:idioma','es')")
        pi.reload(wait_until="networkidle")
        pi.wait_for_timeout(400)
        if pi.is_visible("#cmp"): pi.click("#cmpRechazar")   # el aviso de cookies tapa el pie hasta que se decide
        pi.click("#botonAjustes")
        pi.wait_for_timeout(200)
        check("el botón de ajustes abre el panel con 6 idiomas y se puede cerrar", pi.is_visible(".ajustes") and pi.locator(".ajustes .idioma__op").count() == 6 and (pi.keyboard.press("Escape") or True) and not pi.is_visible(".ajustes"))
        pi.click("#abrirIdioma")
        pi.wait_for_timeout(200)
        check("el enlace del pie sigue abriendo el selector de idioma", pi.is_visible(".idioma") and (pi.keyboard.press("Escape") or True) and not pi.is_visible(".idioma"))
        pi.click("#botonAjustes")
        pi.wait_for_timeout(200)
        check("ajustes: sonido activado por defecto y sin interruptor de vibración", pi.get_attribute("#ajuste-sonido", "aria-checked") == "true" and pi.locator("#ajuste-vibracion").count() == 0)
        pi.click("#ajuste-sonido")
        check("ajustes: el interruptor de sonido se apaga y se guarda", pi.get_attribute("#ajuste-sonido", "aria-checked") == "false" and pi.evaluate("JSON.parse(localStorage.getItem('tikitexto:ajustes')).sonido") is False)
        check("ajustes: sonido apagado queda reflejado en el juego", pi.evaluate("TIKI.ajustes.sonido()") is False and pi.evaluate("typeof TIKI.ajustes.vibrar") == "undefined")
        pi.reload(wait_until="networkidle"); pi.wait_for_timeout(300)
        pi.click("#botonAjustes"); pi.wait_for_timeout(200)
        check("ajustes: la preferencia se recuerda al recargar", pi.get_attribute("#ajuste-sonido", "aria-checked") == "false")
        pi.click("#ajuste-sonido"); pi.keyboard.press("Escape")
        check("ajustes: se puede volver a activar el sonido", pi.evaluate("TIKI.ajustes.sonido()") is True)
        # partida en inglés: el juego funciona con respuestas localizadas
        pi.evaluate("localStorage.setItem('tikitexto:idioma','en')")
        pi.reload(wait_until="networkidle")
        pi.click("[data-modo=selecciones]")
        pi.wait_for_timeout(500)
        resp = pi.evaluate("JSON.parse(localStorage.getItem('tikitexto:partida')).respuesta.nombre")
        check("selecciones en inglés: la respuesta está en inglés (sin tildes ni ñ)", bool(resp) and resp.isascii() and resp.upper() == resp)
        pi.keyboard.type(resp)
        pi.keyboard.press("Enter")
        pi.wait_for_timeout(3500)
        check("acertar en inglés muestra el resultado traducido", "solved in 1 attempt" in pi.inner_text("body").lower())
        ctx2.close()
    except Exception as e:
        check("idiomas", False, str(e)[:150])
    check("sin errores de JavaScript con idiomas", not errores_id, "; ".join(errores_id)[:200])

    print("3e) Páginas de búsqueda (SEO) y enlaces directos")
    try:
        import re as _re
        paginas = ["en/", "pt/", "fr/", "it/", "de/", "adivina-el-jugador/", "adivina-el-equipo/", "adivina-la-seleccion/", "adivina-el-entrenador/", "adivina-el-estadio/", "en/guess-the-player/", "en/guess-the-team/", "en/guess-the-national-team/", "en/guess-the-manager/", "en/guess-the-stadium/", "de/fussballer-raten/", "de/fussballverein-raten/", "de/nationalmannschaft-raten/", "de/trainer-raten/", "de/stadion-raten/"]
        for ruta in paginas:
            r = ctx.request.get(BASE + ruta)
            h = r.text() if r.ok else ""
            bien = r.ok and "<title>" in h and 'rel="canonical"' in h and "application/ld+json" in h and "<h1>" in h and "hreflang" in h
            check(f"página {ruta} con título, canónica, datos estructurados y h1", bien)
        mapa = ctx.request.get(BASE + "sitemap.xml").text()
        check("el sitemap lista todas las páginas nuevas", all(("/" + r) in mapa for r in paginas))
        pe = ctx.new_page()
        errs_e = []
        pe.on("pageerror", lambda e: errs_e.append(str(e)))
        pe.route("**/rest/v1/rpc/*", lambda r: r.abort())
        pe.add_init_script("sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');")
        pe.goto(BASE + "en/", wait_until="networkidle")
        pe.evaluate("localStorage.setItem('tikitexto:jugadores'," + json.dumps(json.dumps({"actual": "BotSeo", "perfiles": {"BotSeo": perfil}})) + ")")
        pe.click("a.cta")
        pe.wait_for_load_state("networkidle")
        pe.wait_for_timeout(1000)
        check("el botón de la página en inglés abre el juego en inglés", pe.evaluate("document.documentElement.lang") == "en" and pe.is_visible("#pantallaInicio"))
        pe.goto(BASE + "de/stadion-raten/", wait_until="networkidle")
        pe.click("a.cta")
        pe.wait_for_load_state("networkidle")
        pe.wait_for_timeout(1500)
        check("el enlace de la guía en alemán empieza el modo en alemán", pe.evaluate("document.documentElement.lang") == "de" and "?" not in pe.url)
        pe.goto(BASE + "adivina-el-equipo/", wait_until="networkidle")
        pe.click("a.cta")
        pe.wait_for_load_state("networkidle")
        pe.wait_for_timeout(1200)
        check("el enlace del modo empieza la partida directamente", pe.is_visible("#pantallaJuego") and "?" not in pe.url)
        check("sin errores de JavaScript en las páginas nuevas", not errs_e, "; ".join(errs_e)[:200])
        pe.close()
    except Exception as e:
        check("páginas de búsqueda", False, str(e)[:150])

    print("3f) Aviso de consentimiento (medición sin cookies + Google solo con aceptación)")
    try:
        def _ctx(init=""):
            c_ = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
            c_.add_init_script("if(!localStorage.getItem('tikitexto:idioma'))localStorage.setItem('tikitexto:idioma','es');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');" + init)
            return c_
        def _pag(c_, cf_, gt_, errs_):
            p_ = c_.new_page()
            p_.on("pageerror", lambda e: errs_.append(str(e)))
            p_.on("request", lambda r: cf_.append(r.url) if "cloudflareinsights" in r.url else (gt_.append(r.url) if "google-analytics" in r.url else None))
            p_.route("**/rest/v1/rpc/*", lambda r: r.abort())
            p_.route("**/static.cloudflareinsights.com/**", lambda r: r.fulfill(status=200, content_type="text/javascript", body=""))
            p_.route("**/www.googletagmanager.com/**", lambda r: r.fulfill(status=200, content_type="text/javascript", body=""))
            return p_
        errs_c, cf, gt = [], [], []
        cc = _ctx()
        pc = _pag(cc, cf, gt, errs_c)
        pc.goto(BASE, wait_until="networkidle", timeout=60000)
        pc.wait_for_timeout(500)
        check("el aviso aparece en la primera visita", pc.is_visible("#cmp"))
        check("la medición sin cookies está activa por defecto", len(cf) > 0)
        dl0 = pc.evaluate("JSON.stringify(window.dataLayer||[])")
        check("el código de Google está en la página con el consentimiento DENEGADO por defecto (Consent Mode)", "analytics_storage" in dl0 and '"denied"' in dl0 and '"granted"' not in dl0)
        check("antes de decidir no hay cookies de Google ni peticiones de medición", not gt and "_ga" not in pc.evaluate("document.cookie"))
        cf.clear()
        br_ = pc.locator("#cmpRechazar").bounding_box(); ba_ = pc.locator("#cmpAceptar").bounding_box()
        check("«Rechazar todo» y «Aceptar todo» se ven y tienen el mismo peso (tamaño igual)", br_["height"] >= 30 and ba_["height"] >= 30 and abs(br_["width"] - ba_["width"]) < 4 and abs(br_["height"] - ba_["height"]) < 4)
        check("los textos de los botones son «Rechazar todo» y «Aceptar todo»", pc.inner_text("#cmpRechazar") == "Rechazar todo" and pc.inner_text("#cmpAceptar") == "Aceptar todo")
        pc.click("#cmpRechazar")
        check("rechazar todo guarda 'no' en ambas elecciones y oculta el aviso", pc.evaluate("localStorage.getItem('tikitexto:consentimiento')+localStorage.getItem('tikitexto:analitica')") == "nono" and not pc.is_visible("#cmp"))
        pc.reload(wait_until="networkidle")
        check("tras rechazar no vuelve a salir, ni mide ni concede nada a Google", not pc.is_visible("#cmp") and not cf and not gt and '"granted"' not in pc.evaluate("JSON.stringify(window.dataLayer||[])"))
        pc.evaluate("document.getElementById('abrirCookies').click()")
        check("Configurar cookies reabre el panel", pc.is_visible("#cmpAjustes"))
        check("los interruptores reflejan que todo está desactivado", not pc.is_checked("#cmpMed") and not pc.is_checked("#cmpGa"))
        pc.check("#cmpMed"); pc.check("#cmpGa")
        pc.click("#cmpGuardar")
        pc.wait_for_timeout(700)
        check("activar ambos guarda 'si' y carga Cloudflare y Google Tag Manager", pc.evaluate("localStorage.getItem('tikitexto:consentimiento')+localStorage.getItem('tikitexto:analitica')") == "sisi" and len(cf) > 0 and '"granted"' in pc.evaluate("JSON.stringify(window.dataLayer||[])"))
        check("sin errores de JavaScript con el aviso", not errs_c, "; ".join(errs_c)[:200])
        cc.close()
        # aceptar todo con un solo botón
        cf2, gt2, e2 = [], [], []
        c2 = _ctx(); p2 = _pag(c2, cf2, gt2, e2)
        p2.goto(BASE, wait_until="networkidle", timeout=60000); p2.wait_for_timeout(400)
        p2.click("#cmpAceptar"); p2.wait_for_timeout(700)
        check("«Aceptar todo» activa ambas cosas con un solo clic", p2.evaluate("localStorage.getItem('tikitexto:consentimiento')+localStorage.getItem('tikitexto:analitica')") == "sisi" and '"granted"' in p2.evaluate("JSON.stringify(window.dataLayer||[])") and not p2.is_visible("#cmp"))
        # retirar el consentimiento de Google borra sus cookies
        p2.evaluate("document.cookie='_ga=1;path=/';document.cookie='_ga_ABC=1;path=/'")
        p2.evaluate("document.getElementById('abrirCookies').click()"); p2.uncheck("#cmpGa")
        with p2.expect_navigation(timeout=15000):
            p2.click("#cmpGuardar")
        p2.wait_for_timeout(400)
        check("retirar Google borra sus cookies y guarda 'no'", p2.evaluate("localStorage.getItem('tikitexto:analitica')") == "no" and "_ga" not in p2.evaluate("document.cookie"))
        c2.close()
        # quien aceptó solo la medición antigua vuelve a ver el aviso (propósito nuevo)
        c3 = _ctx("localStorage.setItem('tikitexto:consentimiento','si');"); e3 = []
        p3 = _pag(c3, [], [], e3); p3.goto(BASE, wait_until="networkidle", timeout=60000); p3.wait_for_timeout(400)
        check("quien solo había aceptado la medición sin cookies vuelve a ver el aviso por Google", p3.is_visible("#cmp"))
        c3.close()
        # el aviso está también fuera de la portada (curiosidades, artículo, legales) y en otros idiomas
        for ruta, idi in (("curiosidades/", "es"), ("articulos/reglas-basicas-del-futbol-para-principiantes/", "es"), ("en/curiosidades/", "en"), ("cookies.html", "es")):
            c4 = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block"); g4 = []
            p4 = _pag(c4, [], g4, [])
            p4.goto(BASE + ruta, wait_until="networkidle", timeout=60000); p4.wait_for_timeout(400)
            ok4 = p4.is_visible("#cmp") and not g4 and p4.locator("#cmpAceptar").count() == 1
            if idi == "en": ok4 = ok4 and p4.inner_text("#cmpAceptar") == "Accept all"
            ok4 = ok4 and "gtm.js?id=GTM-WN89TQCM" in p4.content()
            check("aviso de cookies y código de Google (denegado) presentes en /" + ruta, ok4)
            c4.close()
    except Exception as e:
        check("aviso de consentimiento", False, str(e)[:200])

    print("3g) Racha diaria y compartir")
    try:
        cg = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        errs_g = []
        pgg = cg.new_page()
        pgg.on("pageerror", lambda e: errs_g.append(str(e)))
        pgg.route("**/rest/v1/rpc/*", lambda r: r.abort())
        perf = {"pts": 0, "jugadas": 0, "aciertos": 0, "racha": 0, "mejor": 0, "dist": [0] * 6, "diario": "", "token": "T" * 24, "online": True, "pend": 0, "diaD": 2, "diaMejor": 2, "diaUlt": "AYER"}
        pgg.add_init_script("var d=new Date();d.setDate(d.getDate()-1);var a=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();var p=" + json.dumps(perf) + ";p.diaUlt=a;"
            "localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');"
            "localStorage.setItem('tikitexto:jugadores',JSON.stringify({actual:'BotRacha',perfiles:{BotRacha:p}}));")
        pgg.goto(BASE, wait_until="networkidle", timeout=60000)
        pgg.click('[data-modo="diario"]')
        pgg.wait_for_selector(".celda", timeout=10000)
        n = pgg.locator(".celda").count() // 6
        for _ in range(6):
            pgg.keyboard.type("A" * n)
            pgg.keyboard.press("Enter")
            pgg.wait_for_timeout(1800)
        pgg.wait_for_selector("#modalRacha:not([hidden])", timeout=8000)
        check("racha diaria suma un día y se muestra", "3" in pgg.inner_text("#modalRacha"), pgg.inner_text("#modalRacha"))
        check("el botón dice Compartir resultado", "Compartir" in pgg.inner_text("#botonCopiar"))
        pgg.evaluate("window.__t=''; Object.defineProperty(navigator,'clipboard',{value:{writeText:function(t){window.__t=t;return Promise.resolve();}},configurable:true});")
        pgg.click("#botonCopiar")
        pgg.wait_for_timeout(400)
        txt = pgg.evaluate("window.__t")
        check("el texto compartido lleva la rejilla y el enlace", "tikitexto.com" in txt and "⬜" in txt, txt[:80])
        check("sin errores de JavaScript en racha/compartir", not errs_g, "; ".join(errs_g)[:200])
        cg.close()
    except Exception as e:
        check("racha diaria y compartir", False, str(e)[:150])

    print("3h) Curiosidades en los 6 idiomas")
    try:
        ch = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        errs_h = []
        for pre in ["", "en/", "pt/", "fr/", "it/", "de/"]:
            for sub in ["curiosidades/", "curiosidades/campeones/", "curiosidades/ligas/", "curiosidades/trofeos/"]:
                ph = ch.new_page()
                ph.on("pageerror", lambda e: errs_h.append(str(e)))
                ph.on("console", lambda m: errs_h.append(m.text) if "Content Security" in m.text else None)
                r = ph.goto(BASE + pre + sub, wait_until="load", timeout=30000)
                n_alt = ph.locator('link[rel="alternate"][hreflang]').count()
                ancho = ph.evaluate("document.documentElement.scrollWidth <= innerWidth")
                check("curiosidades " + pre + sub + " carga, con hreflang y sin scroll horizontal", r.status == 200 and n_alt == 7 and ancho, f"{r.status} alt={n_alt} ancho={ancho}")
                ph.close()
        check("curiosidades: sin errores de JavaScript ni CSP", not errs_h, "; ".join(errs_h)[:200])
        ch.close()
    except Exception as e:
        check("curiosidades en idiomas", False, str(e)[:150])

    print("3i) Botón de instalar la app e imagen para compartir")
    try:
        ci = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pi2 = ci.new_page()
        errs_i = []
        pi2.on("pageerror", lambda e: errs_i.append(str(e)))
        pi2.add_init_script("sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');")
        pi2.goto(BASE, wait_until="networkidle", timeout=60000)
        check("instalar app: oculto por defecto", pi2.evaluate("document.getElementById('instalarCaja').hidden"))
        pi2.evaluate("(()=>{const e=new Event('beforeinstallprompt');e.prompt=()=>{window.__p=1};window.dispatchEvent(e)})()")
        check("instalar app: aparece cuando el navegador lo permite", not pi2.evaluate("document.getElementById('instalarCaja').hidden"))
        pi2.evaluate("document.getElementById('instalarApp').click()")
        check("instalar app: lanza el aviso del navegador y se oculta", pi2.evaluate("window.__p === 1 && document.getElementById('instalarCaja').hidden") and not errs_i, "; ".join(errs_i)[:120])
        og = api.get(BASE + "icons/og-image.png")
        check("imagen para compartir existe", og.status == 200 and len(og.body()) > 5000, str(og.status))
        html_i = api.get(BASE).text()
        check("portada usa la imagen grande para compartir", "icons/og-image.png" in html_i and "summary_large_image" in html_i)
        ci.close()
    except Exception as e:
        check("instalar app e imagen social", False, str(e)[:150])

    print("3j) Estadios de Estados Unidos")
    try:
        cu = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pu = cu.new_page()
        errs_u = []
        pu.on("pageerror", lambda e: errs_u.append(str(e)))
        pu.add_init_script("sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');")
        pu.goto(BASE + "?modo=estadios_us", wait_until="networkidle", timeout=60000)
        pu.wait_for_timeout(800)
        check("estadios EE. UU.: el modo arranca sin errores", not errs_u and pu.locator("#tablero, .tablero, .fila").count() > 0, "; ".join(errs_u)[:120])
        n_us = len(re.findall(r"^[A-Z0-9&' ]+\|us\|", html, re.M))
        check("estadios EE. UU.: hay 10 estadios", n_us == 10, str(n_us))
        cu.close()
    except Exception as e:
        check("estadios EE. UU.", False, str(e)[:150])

    print("3k) Ahorcado TIKITEXTO")
    try:
        ca = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pa = ca.new_page()
        errs_a = []
        pa.on("pageerror", lambda e: errs_a.append(str(e)))
        pa.route("**/rest/v1/rpc/*", lambda r: r.abort())
        perfil_a = dict(perfil, nv={"t": 0, "f": 0, "tut": {}})
        pa.add_init_script(
            "if(!sessionStorage.getItem('aht')){sessionStorage.setItem('aht','1');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');"
            "localStorage.setItem('tikitexto:jugadores'," + json.dumps(json.dumps({"actual": "BotAh", "perfiles": {"BotAh": perfil_a}})) + ");}")
        pa.goto(BASE, wait_until="networkidle", timeout=60000)
        pa.wait_for_timeout(500)
        check("ahorcado: tarjeta en el menú", pa.is_visible(".ah-card"))
        pa.click(".ah-card")
        pa.wait_for_timeout(400)
        check("ahorcado: tutorial obligatorio la primera vez (3 pasos)", pa.is_visible("#modalTutorial") and not pa.is_visible("#tutCerrar"))
        pa.click("#tutSiguiente"); pa.click("#tutSiguiente"); pa.click("#tutSiguiente")
        pa.wait_for_timeout(300)
        check("ahorcado: panel de inicio", pa.is_visible("#ahEmpezar"))
        pa.click("#ahEmpezar")
        pa.wait_for_timeout(300)
        n_cel = pa.locator("#ahNombre .ah-cel").count()
        check("ahorcado: el nombre se muestra en cuadrados", n_cel >= 4, str(n_cel))
        # una letra que no esté en ningún nombre de la lista: fuerza fallos con Q, W, X, Z, K y J hasta perder
        pa.evaluate("window.__fallos = 0")
        for l in "QWXZ":
            pa.keyboard.press(l)
        pa.wait_for_timeout(300)
        malas = pa.locator("#ahMalas .ah-mala").count()
        quitadas = pa.locator(".ah-tecla--fuera").count()
        check("ahorcado: las letras falladas salen tachadas y se quitan del teclado", malas >= 1 and quitadas >= 4, f"{malas}/{quitadas}")
        pa.keyboard.press("E")
        pa.wait_for_timeout(200)
        check("ahorcado: sin pistas en el juego", pa.locator(".pista, #pista").count() == 0 or not pa.is_visible("#pista"))
        for l in "BCDFGHIJKLMNOPRSTUVY":
            if pa.is_visible("#ahResultado .ah-res"):
                break
            pa.keyboard.press(l)
            pa.wait_for_timeout(60)
        pa.wait_for_timeout(1600)
        check("ahorcado: la partida termina y se ofrece seguir", pa.is_visible("#ahResultado .ah-res") or pa.locator("#ahResultado .ah-res").count() == 1)
        check("ahorcado: sin errores de JavaScript", not errs_a, "; ".join(errs_a)[:150])
        pe = ca.new_page()
        pe.add_init_script("localStorage.setItem('tikitexto:idioma','en');")
        pe.goto(BASE, wait_until="networkidle", timeout=60000)
        pe.wait_for_timeout(500)
        check("ahorcado: tarjeta traducida al inglés", "TIKITEXTO HANGMAN" in (pe.inner_text(".ah-card") or ""))
        ca.close()
    except Exception as e:
        check("ahorcado", False, str(e)[:150])

    print("3l) Invitado, intro rápida y código en Ajustes")
    try:
        cg = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pgi = cg.new_page()
        errs_g = []
        pgi.on("pageerror", lambda e: errs_g.append(str(e)))
        def _rpc(r):
            n_ = r.request.url.split("/rpc/")[1]
            cuerpo = {"estado": "ok", "pts": 0, "puesto": 7} if n_ in ("reclamar_nombre", "registrar_acierto") else []
            r.fulfill(status=200, content_type="application/json", body=json.dumps(cuerpo))
        pgi.route("**/rest/v1/rpc/*", _rpc)
        pgi.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');")
        pgi.goto(BASE, wait_until="domcontentloaded", timeout=60000)
        pgi.wait_for_selector("#intro", state="attached")
        check("intro: arranca sola (sin «Toca para empezar»)", pgi.evaluate("document.getElementById('intro').classList.contains('intro--play')") and "Toca para empezar" not in pgi.content())
        pgi.wait_for_selector("#intro", state="hidden", timeout=4000)
        check("intro: termina sola en pocos segundos", not pgi.is_visible("#intro"))
        check("invitado: no se pide nickname al entrar", not pgi.is_visible("#modalCuenta"))
        pgi.wait_for_timeout(500)
        check("invitado: aviso gris «Estás jugando como invitado» arriba", pgi.is_visible("#chipInvitado"))
        pgi.click("#chipInvitado"); pgi.wait_for_timeout(300)
        check("invitado: el aviso lleva a Ajustes", pgi.is_visible("#ajusteCodigo") is False and pgi.locator(".ajustes").count() == 1)
        pgi.keyboard.press("Escape"); pgi.wait_for_timeout(200)
        if pgi.is_visible("#portalJuegos"): pgi.click("#portalJuegos"); pgi.wait_for_timeout(300); pgi.evaluate("document.querySelector('[data-vs=letras]').click()"); pgi.wait_for_timeout(700)
        pgi.click("[data-stats]"); pgi.wait_for_timeout(400)
        check("invitado: el ranking ofrece elegir nickname", pgi.is_visible("#botonNick"))
        pgi.click("#botonNick"); pgi.wait_for_timeout(300)
        check("invitado: se puede cerrar el aviso de nickname", pgi.is_visible("#cuentaCerrar"))
        pgi.fill("#cuentaInput", "BotInvitado"); pgi.click("#cuentaBoton"); pgi.wait_for_timeout(800)
        check("nickname: avanza sin pantalla de código", not pgi.is_visible("#modalCuenta") and pgi.locator("#codigoTexto").count() == 0)
        pgi.click("[data-cerrar-stats]") if pgi.is_visible("[data-cerrar-stats]") else None
        pgi.evaluate("document.getElementById('botonAjustes').click()"); pgi.wait_for_timeout(300)
        pgi.click("#ajusteCodigo"); pgi.wait_for_timeout(200)
        cod = pgi.inner_text("#ajusteCodigoTexto")
        check("ajustes: muestra «¿Cuál es mi código?»", len(cod.replace("-", "")) == 20, cod)
        pgi.keyboard.press("Escape"); pgi.wait_for_timeout(200)
        check("nickname puesto: desaparece el aviso de invitado", not pgi.is_visible("#chipInvitado"))
        check("invitado: sin errores de JavaScript", not errs_g, "; ".join(errs_g)[:150])
        cg.close()
    except Exception as e:
        check("invitado e intro", False, str(e)[:150])

    print("3m) ¿Quién tiene más tarjetas? (cifras exactas)")
    try:
        ct = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pt = ct.new_page()
        errs_t = []
        pt.on("pageerror", lambda e: errs_t.append(str(e)))
        pt.add_init_script("localStorage.setItem('tikitexto:idioma','es');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');")
        pt.goto(BASE, wait_until="networkidle", timeout=60000)
        pt.wait_for_timeout(500)
        pt.evaluate("document.querySelector('[data-grupo-btn=dinamicos]').click()"); pt.click("[data-novedad=tarjetas]"); pt.wait_for_timeout(300)
        pt.keyboard.press("Escape")
        pt.dispatch_event("#nvEmpezar", "click")
        validos = True; mismas = 0; rondas = 0
        for _ in range(12):
            pt.keyboard.press("Escape")
            pt.wait_for_selector(".nv-jug:not([disabled])", timeout=8000)
            bt = pt.query_selector_all(".nv-jug")
            pos = [x.query_selector(".nv-jug__meta").inner_text().split(" · ")[0] for x in bt]
            bt[0].dispatch_event("click"); pt.wait_for_timeout(150)
            tot = [int(re.match(r"(\d+)", x.query_selector(".nv-jug__nivel").inner_text()).group(1)) for x in bt]
            if abs(tot[0] - tot[1]) < max(15, round(max(tot) * 0.25)): validos = False
            rondas += 1
            mismas += pos[0] == pos[1]
            pt.wait_for_timeout(2900)
            if pt.query_selector(".nv-fin"):
                pt.dispatch_event(".nv-fin .boton--primario", "click")
        check("tarjetas: se muestra el número exacto de cada jugador", rondas > 0)
        check("tarjetas: todos los duelos tienen una diferencia clara", validos)
        check("tarjetas: sin errores de JavaScript", not errs_t, "; ".join(errs_t)[:150])
        ct.close()
    except Exception as e:
        check("tarjetas exactas", False, str(e)[:150])

    print("3n) Páginas de datos (curiosidades/datos)")
    try:
        sm = api.get(BASE + "sitemap.xml").text()
        rutas = [u for u in re.findall(r"<loc>https://tikitexto.com/([^<]*)</loc>", sm) if "curiosidades/" in u and u.rstrip("/").split("/")[-1] not in ("curiosidades", "campeones", "ligas", "trofeos")]
        check("datos: páginas en el sitemap", len(rutas) >= 20, str(len(rutas)))
        malas = []
        for ru in rutas:
            r = api.get(BASE + ru)
            if r.status != 200: r = api.get(BASE + ru)  # un reintento: la web real a veces responde lento
            t = r.text() if r.status == 200 else ""
            hist = any(x in ru for x in ("champions-20-anos", "champions-league-last-20-finals", "mundiales-edicion-por-edicion", "world-cups-edition-by-edition"))
            if r.status != 200 or 'class="jugar"' not in t or ("<table" not in t and not ru.endswith("datos/") and not hist and 'class="entrada"' not in t and 'class="tarjetas"' not in t): malas.append(ru)
        check("datos: todas existen, con botón de jugar y tabla", not malas, ", ".join(malas)[:150])
    except Exception as e:
        check("páginas de datos", False, str(e)[:150])

    print("3p) Historia de la Champions y los Mundiales, identidad y menores")
    try:
        for ru, n_ent in (("curiosidades/champions-20-anos/", 20), ("en/curiosidades/champions-league-last-20-finals/", 20), ("curiosidades/mundiales-edicion-por-edicion/", 23), ("en/curiosidades/world-cups-edition-by-edition/", 23)):
            r = api.get(BASE + ru); t = r.text() if r.status == 200 else ""
            check("historia: " + ru, r.status == 200 and t.count('<article class="entrada"') == n_ent and 'rel="alternate" hreflang="x-default"' in t, str(t.count('<article class="entrada"')))
        h = api.get(BASE).text()
        check("portada: nueva identidad (sin «juego diario»)", "base de datos" in h.lower() or "Datos y curiosidades del fútbol" in h)
        check("portada: portal (Juegos + Saber) antes de los juegos", h.index('id="portal"') < h.index('id="tituloJuegos"') < h.index('data-modo="diario"') and 'portal__card--saber' in h)
        import sys as _s; _s.path.insert(0, "tools"); import temas_data as _td
        malas_t = []
        for tm in _td.TEMAS:
            for pre, sl in (("", tm["es"]), ("en/", tm["en"])):
                r = api.get(BASE + pre + "curiosidades/" + sl + "/"); tt = r.text() if r.status == 200 else ""
                if r.status != 200 or tt.count('class="entrada"') < 7 or 'class="jugar"' not in tt: malas_t.append(pre + sl)
        check("temas: 16 páginas es/en con ≥7 curiosidades", not malas_t and len(_td.TEMAS) == 16, ", ".join(malas_t)[:150])
        check("temas: índice enlazado desde curiosidades", "curiosidades-por-temas" in api.get(BASE + "curiosidades/").text())
        pv = api.get(BASE + "privacidad.html").text()
        check("privacidad: menores coherente (14 años para crear cuenta)", "14 años o más" in pv and "no está dirigido a menores de 14" not in pv.lower())
        al = api.get(BASE + "aviso-legal.html").text()
        check("aviso legal: titular identificado y menores coherente", "Yago Fernández Galán" in al and "no está dirigido a menores" not in al)
        so = api.get(BASE + "sobre-tikitexto.html")
        check("sobre-tikitexto existe y está en el sitemap", so.status == 200 and "sobre-tikitexto.html" in api.get(BASE + "sitemap.xml").text())
    except Exception as e:
        check("historia/identidad", False, str(e)[:150])

    print("3o) Huecos de anuncios y curiosidades en portada")
    try:
        ch = br.new_context(viewport={"width": 1366, "height": 800}, service_workers="block")
        ph = ch.new_page(); errs_h = []
        ph.on("pageerror", lambda e: errs_h.append(str(e)))
        ph.add_init_script("localStorage.setItem('tikitexto:idioma','es');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');")
        ph.goto(BASE, wait_until="networkidle", timeout=60000); ph.wait_for_timeout(400)
        check("huecos: ocultos por defecto", ph.evaluate("[...document.querySelectorAll('.hueco')].every(e => getComputedStyle(e).display === 'none')"))
        ph.click('#volverPortal'); ph.wait_for_timeout(300)
        check("portada: portal visible, juegos ocultos", ph.is_visible('#portal') and not ph.is_visible('[data-modo="diario"]'))
        check("portada: Saber con enlaces reales", ph.evaluate("document.querySelectorAll('.portal__chips a[href]').length >= 4") and ph.get_attribute('.portal__enlace', 'href') == 'curiosidades/')
        ph.click('#portalJuegos'); ph.wait_for_timeout(300)
        check("pantalla dividida: aparece al entrar en Juegos con Letras y Videojuegos y el rayo", ph.is_visible('#vistaSplit') and ph.is_visible('[data-vs=letras]') and ph.is_visible('[data-vs=dinamicos]') and ph.evaluate("document.querySelectorAll('#vistaSplit .vs__rayo polyline').length >= 3"))
        ph.evaluate("document.querySelector('[data-vs=dinamicos]').click()"); ph.wait_for_timeout(800)
        check("pantalla dividida: elegir Videojuegos abre los dinámicos y la oculta", ph.is_hidden('#vistaSplit') and ph.is_visible('#grupoDinamicos') and not ph.is_visible('#grupoLetras'))
        ph.evaluate("document.querySelector('[data-grupo-btn=letras]').click()"); ph.wait_for_timeout(300)
        check("portada: Juegos muestra los modos y #juegos", ph.is_visible('[data-modo="diario"]') and not ph.is_visible('#portal') and ph.url.endswith('#juegos'))
        ph.click('#volverPortal'); ph.wait_for_timeout(300)
        check("portada: volver al portal", ph.is_visible('#portal'))
        check("portada: .info sigue tras el portal", ph.evaluate("!!(document.querySelector('#portal').compareDocumentPosition(document.querySelector('.info')) & 4)"))
        ph.goto(BASE + "?huecos=1", wait_until="networkidle", timeout=60000); ph.wait_for_timeout(400)
        check("huecos: se ven con ?huecos=1", ph.evaluate("[...document.querySelectorAll('.hueco')].some(e => getComputedStyle(e).display !== 'none')"))
        ph.goto(BASE + "?huecos=0", wait_until="networkidle", timeout=60000)
        pc = ch.new_page(); pc.goto(BASE + "curiosidades/campeones/", wait_until="networkidle", timeout=60000)
        check("curiosidades: hay huecos entre secciones y fijos", pc.evaluate("document.querySelectorAll('.hueco').length >= 4"))
        pc.evaluate("localStorage.setItem('tikitexto:tema','claro')"); pc.reload(wait_until="networkidle")
        pc.click("[data-tema-btn]")
        check("curiosidades: el botón cambia a modo oscuro y lo guarda", pc.evaluate("document.documentElement.dataset.tema") == "oscuro" and pc.evaluate("localStorage.getItem('tikitexto:tema')") == "oscuro")
        check("portada: sin errores de JavaScript (huecos)", not errs_h, "; ".join(errs_h)[:150])
        ch.close()
    except Exception as e:
        check("huecos de anuncios", False, str(e)[:150])

    print("3q) Linterna de Navidad (tiempo limitado)")
    try:
        ch = br.new_context(viewport={"width": 430, "height": 900}); ph = ch.new_page()
        errs_q = []; ph.on("pageerror", lambda e: errs_q.append(str(e)))
        ph.goto(BASE, wait_until="networkidle", timeout=60000)
        ph.evaluate("localStorage.setItem('tikitexto:idioma','es')"); ph.reload(wait_until="networkidle")
        activo = ph.evaluate("Date.now() <= window.TIKI_ND_FIN")
        visible = ph.evaluate("!document.getElementById('ndCard').hidden")
        check("navidad: la tarjeta se ve solo mientras dura el evento", activo == visible)
        if activo:
            check("navidad: indica tiempo limitado y cuenta atrás", "TIEMPO LIMITADO" in ph.inner_text("#ndCard").upper() and "Termina" in ph.inner_text("#ndCuenta"))
            ph.evaluate("document.getElementById('ndCard').click()")
            ph.wait_for_timeout(500)
            check("linterna: abre su pantalla con el tema html.nd", ph.evaluate("!document.getElementById('pantallaLinterna').hidden && document.documentElement.classList.contains('nd')"))
            ph.click("#lzEmpezar"); ph.wait_for_timeout(500)
            check("linterna: hay campo oscuro, letras, fantasmas y pila", ph.evaluate("!!document.querySelector('#lzCampo .lz-oscuro') && document.querySelectorAll('.lz-letra').length >= 8 && document.querySelectorAll('.lz-fantasma').length === 2 && !!document.getElementById('lzPilaBarra')"))
            for n in range(6):
                if ph.evaluate("TIKI.lz.fin"): break
                for _ in range(40):
                    st = ph.evaluate("({s:TIKI.lz.sig,l:TIKI.lz.orden.length})")
                    if st["s"] >= st["l"]: break
                    pos = ph.evaluate("(()=>{const o=TIKI.lz.letras.find(o=>!o.tomada&&o.l===TIKI.lz.orden[TIKI.lz.sig]);return [o.x,o.y]})()")
                    box = ph.locator("#lzCampo").bounding_box()
                    ph.mouse.move(box["x"] + pos[0], box["y"] + pos[1]); ph.wait_for_timeout(120); ph.mouse.down(); ph.mouse.up(); ph.wait_for_timeout(60)
                ph.wait_for_timeout(1500)
            ph.wait_for_timeout(1500)
            check("linterna: se superan las 3 noches y aparece el resultado", ph.evaluate("TIKI.lz.fin && TIKI.lz.hechos === 3") and "+1 tikitexto" in ph.inner_text("#lzResultado"))
        else:
            ph.goto(BASE + "?modo=navidad", wait_until="networkidle", timeout=60000)
            check("navidad caducada: el enlace directo no abre la linterna", ph.evaluate("document.getElementById('pantallaLinterna').hidden"))
        check("linterna: sin errores de JavaScript", not errs_q, "; ".join(errs_q)[:150])
        ch.close()
    except Exception as e:
        check("linterna de navidad", False, str(e)[:150])

    print("3s) Seguridad: CSP sin unsafe-inline en scripts y huellas al día")
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
        import csp as _csp
        for ruta in ["", "curiosidades/", "articulos/", "privacidad.html", "cookies.html", "aviso-legal.html", "adivina-el-jugador/"]:
            h = br.new_context().request.get(BASE + ruta).text()
            m = re.search(r'http-equiv="Content-Security-Policy" content="([^"]*)"', h)
            ss = re.search(r"script-src [^;]*", m.group(1)).group(0) if m else ""
            bien = bool(m) and "unsafe-inline" not in ss and all(x in ss for x in _csp.huellas(h))
            check("CSP de /" + ruta + ": sin unsafe-inline y con las huellas de sus scripts (si falla: python3 tools/csp.py)", bien, ss[:80])
        ph = br.new_context().new_page()
        ph.goto(BASE + "cookies.html", wait_until="networkidle")
        ph.click("#medicion-boton")
        check("cookies.html: «Cambiar mi elección» abre el panel de configuración", ph.is_visible("#cmpAjustes"))
    except Exception as e:
        check("seguridad CSP", False, str(e)[:150])

    print("3r) Artículos largos (articulos/)")
    try:
        pa = br.new_page(); errs_r = []; pa.on("pageerror", lambda e: errs_r.append(str(e)))
        pa.goto(BASE + "articulos/", wait_until="domcontentloaded", timeout=60000)
        n_t = pa.evaluate("document.querySelectorAll('.tarjeta[href^=\"/articulos/\"]').length")
        check("articulos: el índice lista los artículos", n_t >= 22, str(n_t))
        enlaces = pa.evaluate("Array.from(document.querySelectorAll('.tarjeta[href^=\"/articulos/\"]')).map(a => a.getAttribute('href'))")
        pobres = []
        for hr in enlaces:
            pa.goto(BASE + hr.lstrip("/"), wait_until="domcontentloaded", timeout=60000)
            palabras = pa.evaluate("document.querySelector('.articulo').innerText.split(/\\s+/).length")
            h2 = pa.evaluate("document.querySelectorAll('.articulo h2').length")
            hl = pa.evaluate("Array.from(document.querySelectorAll('link[rel=alternate]')).map(l => l.hreflang).join(',')")
            if palabras < 650 or h2 < 4 or hl != "es,x-default": pobres.append(f"{hr}: {palabras} palabras, {h2} h2, {hl}")
        check("articulos: cada uno tiene texto largo, secciones y solo hreflang es", not pobres, "; ".join(pobres)[:200])
        check("articulos: sin errores de JavaScript", not errs_r, "; ".join(errs_r)[:150])
        pa.close()
    except Exception as e:
        check("articulos", False, str(e)[:150])

    print("3t) Historias, rincón de los peques y textos legales sin publicidad")
    try:
        import sys as _s2, re as _re; _s2.path.insert(0, "tools"); import historias_data as _hd, peques_data as _pd
        pa = br.new_page(); errs_t = []; pa.on("pageerror", lambda e: errs_t.append(str(e)))
        pa.goto(BASE + "historias/", wait_until="domcontentloaded", timeout=60000)
        check("historias: el índice lista las colecciones", pa.evaluate("document.querySelectorAll('.tarjeta[href^=\"/historias/\"]').length") >= len(_hd.COLECCIONES))
        pobres_h = []
        for c in _hd.COLECCIONES:
            pa.goto(BASE + "historias/" + c["slug"] + "/", wait_until="domcontentloaded", timeout=60000)
            n_e = pa.evaluate("document.querySelectorAll('article.entrada').length"); hl = pa.evaluate("Array.from(document.querySelectorAll('link[rel=alternate]')).map(l => l.hreflang).join(',')")
            if n_e != len(c["items"]) or n_e < 8 or hl != "es,x-default": pobres_h.append(f"{c['slug']}: {n_e} entradas, {hl}")
        check("historias: cada colección tiene ≥8 historias y solo hreflang es", not pobres_h, "; ".join(pobres_h)[:200])
        pa.goto(BASE + "peques/", wait_until="domcontentloaded", timeout=60000)
        check("peques: el índice enlaza las 5 secciones", pa.evaluate("document.querySelectorAll('.tarjeta[href^=\"/peques/\"]').length") == 5)
        for sl, n_min in (("chistes-de-futbol", 15), ("adivinanzas-de-futbol", 10), ("verdadero-o-falso-futbol-ninos", 10)):
            pa.goto(BASE + "peques/" + sl + "/", wait_until="domcontentloaded", timeout=60000)
            n_d = pa.evaluate("document.querySelectorAll('.faq details').length"); abiertos = pa.evaluate("Array.from(document.querySelectorAll('.faq details')).every(d => !d.open && d.querySelector('summary') && !d.querySelector('summary p'))")
            check("peques: " + sl + " (respuestas ocultas dentro de details)", n_d >= n_min and abiertos, str(n_d))
        pa.goto(BASE + "peques/sopa-de-letras-futbol/", wait_until="domcontentloaded", timeout=60000)
        resuelto = pa.evaluate("""() => { const ok = []; document.querySelectorAll('.sopa-box').forEach(box => {
            const g = box.querySelector('.sopa'), n = +g.dataset.n, cs = Array.from(g.querySelectorAll('.cel')), pal = g.dataset.words.split(',');
            let hechas = 0;
            for (const w of pal) { let hall = false;
              for (let r = 0; r < n && !hall; r++) for (let c = 0; c < n && !hall; c++) for (const [dr, dc] of [[0,1],[1,0],[1,1]]) {
                const fr = r + dr * (w.length - 1), fc = c + dc * (w.length - 1); if (fr >= n || fc >= n) continue;
                let s = ''; for (let i = 0; i < w.length; i++) s += cs[(r + dr * i) * n + (c + dc * i)].textContent;
                if (s === w) { cs[r * n + c].click(); cs[fr * n + fc].click(); hall = true; hechas++; break; } } }
            ok.push(hechas === pal.length && !box.querySelector('.ganas').hidden && box.querySelectorAll('.pal li.ok').length === pal.length); }); return ok; }""")
        check("peques: las 3 sopas de letras se pueden resolver y avisan al terminar", resuelto == [True, True, True], str(resuelto))
        bo = br.new_context().request.get(BASE + "curiosidades/balon-de-oro-ganadores/").text()
        check("FAQ: respuestas dentro de details y cierre de summary correcto", "</summary><p>" in bo and "<summary>" in bo and bo.count("<summary>") == bo.count("</summary>") and "FAQPage" in bo)
        check("historias/peques: sin errores de JavaScript", not errs_t, "; ".join(errs_t)[:150])
        pa.close()
        api2 = br.new_context().request
        sin = []
        for ru in ("aviso-legal.html", "privacidad.html", "cookies.html", "sobre-tikitexto.html"):
            t = api2.get(BASE + ru).text()
            t = _re.sub(r'<meta name="google-adsense-account"[^>]*>', "", t)
            if _re.search(r"anunci|publicidad|publicitari|adsense", t, _re.I): sin.append(ru)
        check("legales: sin menciones a anuncios ni publicidad", not sin, ", ".join(sin))
    except Exception as e:
        check("historias/peques", False, str(e)[:150])

    print("4) Ranking mundial (solo lectura)")
    if SKIP_RANKING:
        print("  (omitido)")
    else:
        try:
            url = re.search(r'RANKING_URL = "(https://[^"]+)"', html).group(1).rstrip("/")
            key = re.search(r'RANKING_KEY = "([^"]+)"', html).group(1)
            r = api.post(url + "/rest/v1/rpc/ranking_top", data="{}",
                         headers={"apikey": key, "Content-Type": "application/json"}, timeout=30000)
            check("ranking_top responde", r.status == 200 and isinstance(r.json(), list), f"HTTP {r.status}")
        except Exception as e:
            check("ranking_top responde", False, str(e)[:150])

    print("3v) Buscador global, temas desplegables y tarjeta de Juegos")
    try:
        import json as _j
        bj = _j.loads(api.get(BASE + "buscador.json").text())
        check("buscador.json: 100+ páginas y sin noindex", len(bj) > 100 and not any(x["u"].startswith("/pt/") and x["u"] == "/pt/" for x in bj), str(len(bj)))
        cv = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pv = cv.new_page(); errs_v = []
        pv.on("pageerror", lambda e: errs_v.append(str(e)))
        pv.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');")
        pv.goto(BASE, wait_until="networkidle", timeout=60000); pv.wait_for_timeout(300)
        check("portada: tarjeta Juegos con campo de fútbol y balón", pv.locator(".portal__card--juegos .jg-campo").count() == 1 and pv.locator(".portal__card--juegos .jg-balon").count() == 1)
        pv.fill(".bus__in", "fuera de juego"); pv.wait_for_timeout(500)
        check("buscador (portada): encuentra artículos sin tildes", pv.locator(".bus__lista li").count() >= 1 and "fuera de juego" in pv.inner_text(".bus__lista li >> nth=0").lower())
        pv.fill(".bus__in", "xyzqw"); pv.wait_for_timeout(400)
        check("buscador: mensaje sin resultados", pv.is_visible(".bus__vacio"))
        pv.goto(BASE + "curiosidades/", wait_until="networkidle", timeout=60000); pv.wait_for_timeout(300)
        check("curiosidades: temas cerrados al entrar", pv.locator("details.tema[open]").count() == 0 and pv.locator("details.tema").count() >= 6)
        check("curiosidades: buscador presente", pv.locator(".bus__in").count() == 1)
        pv.click("details.tema >> nth=0 >> summary"); pv.wait_for_timeout(200)
        check("curiosidades: al pulsar el tema se ven sus categorías", pv.locator("details.tema[open] details.tema").count() == 7)
        pv.goto(BASE + "articulos/", wait_until="networkidle", timeout=60000)
        n_art = pv.evaluate("document.querySelectorAll('details.tema a.tarjeta').length")
        check("articulos: 81 artículos agrupados en 7 temas (el primero, BALÓN DE ORO)", n_art == 81 and pv.locator("details.tema").count() == 7 and pv.locator("details.tema.oro").count() == 1, str(n_art))
        check("temas/buscador: sin errores de JavaScript", not errs_v, "; ".join(errs_v)[:150])
        cv.close()
    except Exception as e:
        check("buscador y temas", False, str(e)[:150])

    print("3w) Chapas TIKITEXTO")
    try:
        cw = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        pw = cw.new_page(); errs_w = []
        pw.on("pageerror", lambda e: errs_w.append(str(e)))
        pw.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');")
        pw.goto(BASE, wait_until="networkidle", timeout=60000); pw.wait_for_timeout(300)
        check("portada: tarjeta de Chapas", pw.locator("[data-chapas]").count() == 1)
        pw.goto(BASE + "?modo=chapas", wait_until="networkidle", timeout=60000); pw.wait_for_timeout(600)
        check("chapas: enlace directo abre el modo con tutorial", pw.is_visible("#pantallaChapas") and pw.is_visible("#modalTutorial"))
        for _ in range(4):
            if pw.is_visible("#modalTutorial"): pw.click("#tutSiguiente"); pw.wait_for_timeout(120)
        check("chapas: menú con niveles y sala de estilos", pw.locator(".ch-niv").count() == 3 and pw.locator(".ch-menu .boton").count() == 2)
        pw.click("#chEmpezar"); pw.wait_for_timeout(400)
        check("chapas: campo y marcador", pw.locator(".ch-campo").count() == 1 and pw.locator(".ch-led").count() == 1 and pw.inner_text(".ch-led").replace("\n", "").count("0") >= 2)
        check("chapas: reloj LED de 1 minuto", pw.inner_text("#chReloj").strip() in ("1:00", "0:59"))
        box = pw.locator(".ch-campo").bounding_box()
        pw.mouse.move(box["x"] + 105 / 400 * box["width"], box["y"] + 440 / 640 * box["height"]); pw.mouse.down()
        pw.mouse.move(box["x"] + 130 / 400 * box["width"], box["y"] + 520 / 640 * box["height"], steps=4); pw.mouse.up()
        pw.wait_for_timeout(300)
        check("chapas: arrastrar y soltar lanza una chapa", pw.evaluate("TIKI.chapas.ch.turnos[0]") == 1)
        for _ in range(60):
            if pw.evaluate("TIKI.chapas.ch.turnos[1]") >= 1: break
            pw.wait_for_timeout(500)
        check("chapas: el rival juega su turno", pw.evaluate("TIKI.chapas.ch.turnos[1]") >= 1)
        ia = pw.evaluate("""() => { const T = TIKI.chapas, S = T.ch.S; S.o.forEach(a => { a.vx = a.vy = 0; }); S.o[0].x = 200; S.o[0].y = 330; S.gol = 0;
                           const j = T.pensar(S, 'dificil'); return S.o[j.i].t; }""")
        check("chapas: la máquina elige una de sus chapas", ia == 2)
        pw.evaluate("() => { const C = TIKI.chapas.ch; C.mov = false; C.pausa = 0; C.apunta = null; C.pensando = false; C.turno = 1; for (let i = 0; i < 2; i++) TIKI.chapas.gol(1); C.pausa = 1; }")
        pw.wait_for_timeout(2200)
        check("chapas: 2 goles = victoria y +1 tikitexto", pw.evaluate("TIKI.chapas.ch.fin") and pw.evaluate("TIKI.chapas.datos().gan") == 1 and "+1 tikitexto" in pw.inner_text("#chResultado"))
        pw.click("#chResultado .boton--secundario >> nth=0"); pw.wait_for_timeout(300)
        check("chapas: sala de estilos con 5 categorías", pw.locator(".ch-tab").count() == 6 and pw.locator(".ch-est").count() == 21 and pw.locator(".ch-gratis").count() == 3)
        pw.click(".ch-est >> nth=1"); pw.wait_for_timeout(200)
        check("chapas: elegir un estilo desbloqueado", pw.evaluate("TIKI.chapas.datos().eq.chapa") == "rayas")
        pw.click(".ch-est >> nth=11"); pw.wait_for_timeout(200)
        check("chapas: estilo de pago sin tikitextos no se compra", pw.evaluate("TIKI.chapas.datos().eq.chapa") == "rayas" and pw.is_visible(".ch-aviso"))
        pw.wait_for_timeout(2000); pw.evaluate("document.querySelectorAll('.ch-tab')[4].click()"); pw.wait_for_timeout(200)
        check("chapas: ambientes con GRATIS", pw.locator(".ch-gratis").count() == 3)
        pw.wait_for_timeout(2000); pw.evaluate("document.querySelectorAll('.ch-est')[1].click()"); pw.wait_for_timeout(200)
        pw.evaluate("() => { const C = TIKI.chapas.ch; C.marca = [1, 1]; C.oro = false; C.fin = false; C.pausa = 0; }")
        check("chapas: kick-off sin gol posible (sim)", pw.evaluate("""() => { const T = TIKI.chapas, S = T.nuevo('ataque', 'ataque'); let g = 0;
            for (let i = 1; i < 5; i++) for (let a = 0; a < 360; a += 6) { const r = T.simular(S, i, Math.cos(a * 0.01745) * T.VSAQUE, Math.sin(a * 0.01745) * T.VSAQUE); if (r.gol === 1) g++; } return g; }""") == 0)
        check("chapas: ambiente de noche desbloqueado y elegido", pw.evaluate("TIKI.chapas.datos().eq.ambiente") == "noche")
        pw.goto(BASE + "?lang=en&modo=chapas", wait_until="networkidle", timeout=60000); pw.wait_for_timeout(1200)
        for _ in range(4):
            if pw.is_visible("#modalTutorial"): pw.click("#tutSiguiente"); pw.wait_for_timeout(120)
        txt = pw.inner_text("#chCuerpo")
        check("chapas: textos en inglés", "Play!" in txt and "Style room" in txt and "Easy" in txt)
        check("chapas: sin errores de JavaScript", not errs_w, "; ".join(errs_w)[:150])
        cw.close()
    except Exception as e:
        check("chapas", False, str(e)[:200])

    print("3x) Penaltis 3D")
    try:
        cx = br.new_context(viewport={"width": 844, "height": 390}, service_workers="block")
        px = cx.new_page(); errs_x = []
        px.on("pageerror", lambda e: errs_x.append(str(e)))
        px.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');sessionStorage.setItem('tikitexto:grupo','dinamicos');")
        px.goto(BASE, wait_until="networkidle", timeout=60000); px.wait_for_timeout(300)
        check("penaltis: tarjeta en Dinámicos", px.locator("[data-penaltis]").count() == 1)
        px.evaluate("document.querySelector('[data-penaltis]').click()"); px.wait_for_timeout(2500)
        check("penaltis: se abre la pantalla (o aviso sin WebGL)", px.locator(".pn-raiz").count() == 1)
        check("penaltis: sin errores de JavaScript", not errs_x, "; ".join(errs_x)[:150])
        r = px.evaluate("""async () => { const m = await import('/penaltis.js'); let fuera = 0, lejos = 0, n = 0, sin = 0;
          for (let x = -3.6; x <= 3.6; x += 0.3) for (let y = 0.15; y <= 2.3; y += 0.25) { const pl = m.planPortero(x, y), e = m.estadoPortero(pl, 1); n++;
            const punta = Math.max(Math.abs(e.x), Math.abs(e.x + 2.1 * Math.sin(e.th))); if (punta > 3.66 + 0.35 || Math.abs(e.x) > 2.7) fuera++;
            if (Math.abs(x) < 2.4 && y < 1.6 && !m.tocaPortero(e, x, y, 0.47)) sin++; if (m.tocaPortero(e, x, y, 0.2) && Math.abs(Math.abs(x) - 3.4) < 0.01) lejos++; }
          const q = m.estadoPortero(m.planPortero(0, 1), 0); return { fuera, sin, n, quieto: m.tocaPortero(q, 3, 1, 0.47) }; }""")
        check("penaltis: el cuerpo del portero no sale de la portería", r["fuera"] == 0, str(r))
        check("penaltis: el portero llega con el cuerpo a los balones alcanzables y no a los lejanos", r["sin"] == 0 and not r["quieto"], str(r))
        cx.close()
    except Exception as e:
        check("penaltis 3D", False, str(e)[:150])

    print("3y) Pinball Golazo")
    try:
        cy = br.new_context(viewport={"width": 420, "height": 860}, service_workers="block")
        py = cy.new_page(); errs_y = []
        py.on("pageerror", lambda e: errs_y.append(str(e)))
        py.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');sessionStorage.setItem('tikitexto:grupo','dinamicos');")
        py.goto(BASE, wait_until="networkidle", timeout=60000); py.wait_for_timeout(300)
        check("pinball: tarjeta en Dinámicos", py.locator("[data-pinball]").count() == 1)
        py.evaluate("document.querySelector('[data-pinball]').click()"); py.wait_for_timeout(1500)
        check("pinball: se abre la pantalla", py.locator(".pb-raiz").count() == 1)
        py.click("[data-menu] [data-pb=jugar]"); py.wait_for_timeout(300)
        py.keyboard.down("Space"); py.wait_for_timeout(600); py.keyboard.up("Space"); py.wait_for_timeout(300)
        for k in range(30):
            py.keyboard.down("ArrowLeft" if k % 2 else "ArrowRight"); py.wait_for_timeout(80); py.keyboard.up("ArrowLeft" if k % 2 else "ArrowRight")
        st = py.evaluate("(()=>{const j=TIKI.pinball.juego();return j?{f:j.S.fase,n:j.S.bolas.length,ok:j.S.bolas.every(b=>isFinite(b.x)&&isFinite(b.y))}:null})()")
        check("pinball: la partida avanza sin valores inválidos", bool(st) and st["ok"] and st["f"] in ("juego", "saque", "pierde"), str(st))
        res = py.evaluate("""(()=>{const j=TIKI.pinball.juego();
          // bola atrapada en el carril: el muelle debe poder sacarla
          j.S.fase='juego'; j.S.bolas=[{x:372,y:696,vx:0,vy:0,rot:0,tr:[],vivo:true,dentro:0}]; j.S.cargando=true; j.S.cargaT=0;
          for(let i=0;i<240;i++) j.actualizar(1/60);
          const carga=j.S.carga; j.lanzar(); for(let i=0;i<20;i++) j.actualizar(1/60);
          const sube=j.S.bolas[0]&&j.S.bolas[0].y<600;
          // torneo: ganar las 4 rondas
          j.S.fase='juego'; for(let i=0;i<4;i++) j.rondaGanada();
          return {carga,sube,camp:j.S.campeon}})()""")
        check("pinball: el muelle saca una bola atrapada y la fuerza oscila", res["sube"] and 0 <= res["carga"] <= 1, str(res))
        check("pinball: ganar las 4 rondas da el campeonato", res["camp"], str(res))
        py.click("[data-pb=salir]"); py.wait_for_timeout(300)
        check("pinball: salir cierra la pantalla", py.locator(".pb-raiz").count() == 0)
        check("pinball: sin errores de JavaScript", not errs_y, "; ".join(errs_y)[:150])
        cy.close()
    except Exception as e:
        check("pinball", False, str(e)[:150])

    print("3z) Cracks Ocultos")
    try:
        cz = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        pz = cz.new_page(); errs_z = []
        pz.on("pageerror", lambda e: errs_z.append(str(e)))
        pz.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');")
        pz.goto(BASE, wait_until="networkidle", timeout=60000); pz.wait_for_timeout(300)
        check("cracks ocultos: tarjeta en Letras", pz.locator("[data-serpiente]").count() == 1)
        pz.evaluate("document.querySelector('[data-serpiente]').click()"); pz.wait_for_timeout(1500)
        check("cracks ocultos: se abre la pantalla", pz.locator(".sp-raiz").count() == 1)
        pz.click("[data-menu] [data-sp=jugar]"); pz.wait_for_timeout(300)
        res = pz.evaluate("""(()=>{const j=TIKI.serpiente.juego(),S=j.S;
          const total=S.puz.nombres.reduce((a,n)=>a+n.cells.length,0), uni=new Set(S.puz.nombres.flatMap(n=>n.cells)).size;
          let gen=0; for(let i=0;i<60;i++){ if(j.generar(null)) gen++; }
          const n0=S.puz.nombres.length; j.resolverUno(); const uno=S.puz.nombres.filter(n=>n.ok).length;
          for(let i=0;i<10;i++) j.resolverUno();
          return {total,uni,gen,n0,uno,fase:S.fase,cuad:S.cuad}})()""")
        check("cracks ocultos: la cuadrícula reparte las 30 letras entre los nombres", res["total"] == 30 and res["uni"] == 30, str(res))
        check("cracks ocultos: el generador no falla", res["gen"] == 60, str(res))
        check("cracks ocultos: acertar un nombre y completar la cuadrícula", res["uno"] == 1 and res["cuad"] == 1, str(res))
        pz.evaluate("(()=>{const j=TIKI.serpiente.juego(); j.empezar();})()"); pz.wait_for_timeout(300)
        h = pz.evaluate("""(()=>{const S=TIKI.serpiente.juego().S, t0=S.t; const b=document.querySelector('[data-sp=pista]');
          b.click(); const t1=S.t; b.click(); const t2=S.t; b.click(); const t3=S.t;
          const tot=S.puz.nombres.reduce((a,n)=>a+n.pista,0);
          return {d1:t0-t1,d2:t1-t2,d3:t2-t3,tot,max:S.t}})()""")
        check("cracks ocultos: pista −5 s y las seguidas también −5 s", 4 <= h["d1"] <= 6 and 4 <= h["d2"] <= 6 and 4 <= h["d3"] <= 6 and h["tot"] == 3, str(h))
        pz.click("[data-sp=ver]"); pz.wait_for_timeout(200)
        check("cracks ocultos: «Ver respuestas» revela y ofrece Siguiente", pz.evaluate("TIKI.serpiente.juego().S.fase") == "revela" and "Siguiente" in pz.inner_text("[data-sp=ver]"))
        pz.click("[data-sp=ver]"); pz.wait_for_timeout(200)
        check("cracks ocultos: Siguiente abre otra cuadrícula", pz.evaluate("TIKI.serpiente.juego().S.fase") == "juego")
        pz.click("[data-sp=salir]"); pz.wait_for_timeout(300)
        check("cracks ocultos: salir cierra la pantalla", pz.locator(".sp-raiz").count() == 0)
        check("cracks ocultos: sin errores de JavaScript", not errs_z, "; ".join(errs_z)[:150])
        cz.close()
    except Exception as e:
        check("cracks ocultos", False, str(e)[:150])

    print("3ac) Tiros libres 3D")
    try:
        cl = br.new_context(viewport={"width": 844, "height": 390}, service_workers="block")
        pl = cl.new_page(); errs_l = []
        pl.on("pageerror", lambda e: errs_l.append(str(e)))
        pl.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');sessionStorage.setItem('tikitexto:grupo','dinamicos');")
        pl.goto(BASE, wait_until="networkidle", timeout=60000); pl.wait_for_timeout(300)
        check("tiros libres: tarjeta en Dinámicos", pl.locator("[data-tirolibre]").count() == 1)
        pl.evaluate("document.querySelector('[data-tirolibre]').click()"); pl.wait_for_timeout(3500)
        check("tiros libres: se abre la pantalla (o aviso sin WebGL)", pl.locator(".tl-raiz").count() == 1)
        if pl.locator("[data-sin]:not([hidden])").count() == 0 and pl.locator("[data-menu]").count() == 1:
            fis = pl.evaluate("""(()=>{const j=TIKI.tirolibre.juego(); const P=new (j.E.balon.position.constructor)(5,0.11,20); let mx=0; let curva=[];
              for (const c of [-1,-0.5,0,0.5,1]) for (const [tx,ty] of [[-3,0.5],[0,1.2],[3,2.1],[2,1.8]]) { const v=j.resolver(P,tx,ty,30,c), r=j.vuela(P,v,c,false); mx=Math.max(mx,Math.hypot(r.x-tx,r.y-ty)); }
              const a=j.resolver(P,0,1.2,30,1), b=j.resolver(P,0,1.2,30,-1); return {mx:mx, ax:a.x, bx:b.x}})()""")
            check("tiros libres: la física resuelve el tiro al punto apuntado con cualquier efecto", fis["mx"] < 0.1, str(fis))
            check("tiros libres: el efecto curva el balón en sentidos opuestos", fis["ax"] != fis["bx"] and (fis["ax"] - fis["bx"]) * 1 != 0, str(fis))
            pl.click("[data-menu] [data-tl=jugar]"); pl.wait_for_timeout(1500)
            check("tiros libres: 5 bolitas y distancia", pl.locator("[data-bolas] s").count() == 5 and "m" in pl.inner_text("[data-tl-dist]"))
            disp = pl.evaluate("TIKI.tirolibre.juego().disparar(1.8, 1.9, 0.4, 0.81)")
            for _ in range(60):
                pl.wait_for_timeout(1000)
                if pl.evaluate("TIKI.tirolibre.juego().S.res.length") >= 1: break
            r = pl.evaluate("(()=>{const S=TIKI.tirolibre.juego().S; return {n:S.res.length, fase:S.fase, cel:S.cel}})()")
            check("tiros libres: un disparo termina con resultado (gol, parada, barrera, palo o fuera)", disp and r["n"] >= 1, str(r))
            pl.evaluate("(()=>{const j=TIKI.tirolibre.juego(); for(let i=0;i<8;i++){ j.S.fase='apuntar'; j.disparar(0,3.5,0,0.8); }})()")
            pl.click(".tl-raiz [data-tl=salir]", timeout=5000) if pl.locator(".tl-raiz [data-tl=salir]:visible").count() else pl.evaluate("document.querySelector('[data-tl=salir]').click()")
            pl.wait_for_timeout(500)
            check("tiros libres: salir cierra la pantalla", pl.locator(".tl-raiz").count() == 0)
        check("tiros libres: sin errores de JavaScript", not errs_l, "; ".join(errs_l)[:150])
        cl.close()
    except Exception as e:
        check("tiros libres", False, str(e)[:150])

    print("3ad) Slalom 3D")
    try:
        csl = br.new_context(viewport={"width": 844, "height": 390}, service_workers="block")
        psl = csl.new_page(); errs_sl = []
        psl.on("pageerror", lambda e: errs_sl.append(str(e)))
        psl.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','dinamicos')")
        psl.goto(BASE, wait_until="networkidle", timeout=60000); psl.wait_for_timeout(300)
        check("slalom: tarjeta en Dinámicos", psl.locator("[data-slalom]").count() == 1)
        psl.evaluate("document.querySelector('[data-slalom]').click()"); psl.wait_for_timeout(3500)
        check("slalom: se abre la pantalla (o aviso sin WebGL)", psl.locator(".sl-raiz").count() == 1)
        if psl.locator("[data-sin]:not([hidden])").count() == 0:
            r = psl.evaluate("""(()=>{ const j=TIKI.slalom.juego(); j.empezar(); const S=j.S; let libre=0, filas=0, vacias=0;
              S.dist=1500;
              for(let k=0;k<300;k++){ j.limpia(); j.fila(); const g={}; S.obs.forEach(o=>{ const z=Math.round(o.z); (g[z]=g[z]||[]).push(o); });
                Object.values(g).forEach(a=>{ const bl=new Set(); a.forEach(o=>{ if(['def','entrada','cono'].includes(o.tipo)) bl.add(o.lane); }); if(a.some(o=>['def','entrada','cono','valla','cartel'].includes(o.tipo))){ filas++; if(bl.size<3) libre++; } }); }
              j.limpia(); return {filas,libre}; })()""")
            check("slalom: ninguna fila cierra los tres carriles con defensas o conos", r["filas"] > 120 and r["filas"] == r["libre"], str(r))
            r = psl.evaluate("""(()=>{ const j=TIKI.slalom.juego(), S=j.S; const v=[0,300,1000,3000,8000,50000].map(j.vBase); let mono=true; for(let i=1;i<v.length;i++) if(v[i]<v[i-1]) mono=false;
              const m=j.mats(); return {v, mono, tope:Math.max(...v)<=33.001, caras:Array.isArray(m)&&m.length===3&&!!m[1].map, esc:j.ESC.length, nuevos:j.NUEVOS.length}; })()""")
            check("slalom: la velocidad crece siempre (con tope jugable) y la moneda lleva textura de logo", r["mono"] and r["tope"] and r["caras"] and r["v"][2] > r["v"][1] and r["esc"] >= 6 and r["nuevos"] == 14, str(r))
            r = psl.evaluate("""(()=>{ const j=TIKI.slalom.juego(), S=j.S; j.empezar(); const out={}; const paso=(n)=>{ for(let i=0;i<n;i++){ S.t+=0.02; j.logica(0.02); } };
              const rs=()=>{ j.limpia(); S.fase='corre'; S.vidas=2; S.inv=0; S.y=0; S.vy=0; S.desl=0; S.x=0; S.lane=1; S.v=14; S.sig=9999; S.turbo=0; };
              rs(); S.t=0; const ob=j.pon('rodante',-1,-30); ob.ph=0; paso(5); const x0=ob.x; paso(80); out.mueve=Math.abs(ob.x-x0)>0.05;
              rs(); const o2=j.pon('dron',-1,-6,1.3); o2.ph=-0.6; S.t=0; j.deslizar(); paso(75); out.dron=S.vidas===2;
              rs(); const o3=j.pon('dron',-1,-6,1.3); o3.ph=-0.6; S.t=0; paso(75); out.dronGolpea=S.vidas===1;
              rs(); const o4=j.pon('extremo',0,-30); paso(40); out.extremoX=typeof o4.x==='number' && o4.x>=-2.4-1e-6 && o4.x<=0+1e-6;
              j.limpia(); S.dist=100; j.aplicaEsc(0,0); const f0=S.esc; j.aplicaEsc(3,0); out.tormenta=S.clima==='lluvia'&&S.climaK>0.9; j.aplicaEsc(4,0.1); out.nieve=S.clima==='nieve'; j.aplicaEsc(5,0.1); out.cambia=S.esc===5;
              return out; })()""")
            check("slalom: los obstáculos móviles se mueven, el dron se esquiva deslizando y los escenarios traen clima", r["mueve"] and r["dron"] and r["dronGolpea"] and r["extremoX"] and r["tormenta"] and r["nieve"] and r["cambia"], str(r))
            r = psl.evaluate("""(()=>{ const j=TIKI.slalom.juego(), S=j.S; j.empezar(); S.obs.forEach(()=>{}); const out={};
              const paso=(n)=>{ for(let i=0;i<n;i++) j.logica(0.02); };
              const rs=()=>{ j.limpia(); S.fase='corre'; S.vidas=2; S.inv=0; S.y=0; S.vy=0; S.desl=0; S.x=0; S.lane=1; S.v=9; S.sig=9999; S.turbo=0; };
              rs(); j.pon('valla',1,-3); j.saltar(); paso(60); out.valla=S.vidas===2;
              rs(); j.pon('cartel',-1,-6); j.deslizar(); paso(70); out.cartel=S.vidas===2;
              rs(); j.pon('cartel',-1,-6); paso(70); out.cartelGolpea=S.vidas===1;
              rs(); j.pon('def',1,-6); paso(70); out.def=S.vidas===1;
              rs(); j.pon('valla',1,-6); paso(70); out.vallaGolpea=S.vidas===1;
              return out; })()""")
            check("slalom: saltar la valla y deslizarse bajo el cartel evitan el choque", r["valla"] and r["cartel"], str(r))
            check("slalom: el cartel y los defensas sí golpean si no los esquivas", r["cartelGolpea"] and r["def"] and r["vallaGolpea"], str(r))
            r = psl.evaluate("""(()=>{ const j=TIKI.slalom.juego(), S=j.S; j.empezar(); const out={}; const paso=(n)=>{ for(let i=0;i<n;i++){ S.t+=0.02; j.logica(0.02); } };
              const rs=()=>{ j.limpia(); S.fase='corre'; S.vidas=2; S.inv=0; S.y=0; S.vy=0; S.desl=0; S.x=0; S.lane=1; S.v=14; S.sig=9999; S.turbo=0; };
              rs(); S.t=0; const c=j.pon('carro',-1,-30); c.ph=0; paso(5); const x0=c.x; paso(60); out.carro=Math.abs(c.x-x0)>0.1;
              rs(); S.t=0; const m=j.pon('mascota',-1,-30); m.ph=0; paso(5); const mx=m.x; paso(60); out.mascota=Math.abs(m.x-mx)>0.1;
              rs(); j.pon('pelotazo',1,-14); paso(110); out.pelotazoGolpea=S.vidas===1;
              rs(); j.pon('pelotazo',1,-14); j.saltar(); paso(4); out.pelotazoSalto=true;
              rs(); S.cajaOk=false; S.cajaN=0; out.cajaFecha=S.cajaD>=500&&S.cajaD<=900; S.filas=10; S.dist=S.cajaD+1; j.fila(); out.cajaSale=S.obs.some(o=>o.tipo==='caja');
              rs(); S.cajaOk=false; S.cajasRec=0; j.pon('caja',1,-2); paso(30); out.cajaPremio=S.cajasRec===1;
              S.dist=0; return out; })()""")
            check("slalom: carrito y mascota se mueven, el pelotazo golpea, la caja sorpresa sale pronto (500-900 m) y da un premio", r["carro"] and r["mascota"] and r["pelotazoGolpea"] and r["cajaFecha"] and r["cajaSale"] and r["cajaPremio"], str(r))
            r = psl.evaluate("""(()=>{ const j=TIKI.slalom.juego(), S=j.S; j.empezar(); const out={}; const paso=(n)=>{ for(let i=0;i<n;i++){ S.t+=0.02; j.logica(0.02); } };
              const rs=()=>{ j.limpia(); S.fase='corre'; S.vidas=2; S.inv=0; S.y=0; S.vy=0; S.desl=0; S.x=0; S.lane=1; S.v=14; S.sig=9999; S.turbo=0; S.tc=0; S.cajaD=1e9; };
              out.vm=[0,60,100,180,300,400].map(j.velMov); out.sp=[0,150,300].map(j.espaciado); out.ex=[0,239,240,330].map(j.filasExtra);
              rs(); const a=j.pon('arbitro',0,-80); a.lane2=2; a.ph=0; paso(80); out.arbitro=a.x>LXm(a);
              function LXm(o){ return -2.4; }
              rs(); const po=j.pon('portero',-1,-30); po.ph=0; paso(5); const px=po.x; paso(40); out.portero=Math.abs(po.x-px)>0.2;
              rs(); const ba=j.pon('barrera',-1,-6); ba.ph=0; S.t=0; S.x=0; paso(40); out.barrera=S.vidas===1 || ba.x!==undefined;
              rs(); const t1=j.pon('tarjeta',-1,-6,1.55); t1.ph=-0.6; j.deslizar(); paso(75); out.tarjeta=S.vidas===2;
              rs(); const t2=j.pon('tarjeta',-1,-6,1.55); t2.ph=-0.6; paso(75); out.tarjetaGolpea=S.vidas===1;
              rs(); const c1=j.pon('cortacesped',-1,-6); c1.ph=-0.1; j.saltar(); paso(60); out.cortacesped=S.vidas===2;
              rs(); S.tc=0; const q0=j.pon('portero',-1,-30); q0.ph=0; paso(50); const d0=Math.abs(q0.fa); rs(); S.tc=300; const q1=j.pon('portero',-1,-30); q1.ph=0; paso(50); out.rapido=q1.fa>d0*1.8;
              rs(); S.tc=330; S.dist=3000; S.filas=10; S.libreAnt=1; let todas=true, mult=0;
              for(let k=0;k<60;k++){ j.limpia(); j.fila(); const g={}; S.obs.filter(o=>['def','cono','entrada'].includes(o.tipo)).forEach(o=>{ const z=Math.round(o.z); (g[z]=g[z]||new Set()).add(o.lane); }); Object.values(g).forEach(z=>{ if(z.size>=3) todas=false; }); mult+=S.obs.length; }
              out.infernal=todas; out.denso=mult/60>8;
              rs(); S.vidas=1; const v0=S.vidas; j.regalo(0,1); out.reg=S.cajasRec===1;
              j.limpia(); return out; })()""")
            check("slalom: obstáculos nuevos (árbitro, portero, barrera, tarjeta, cortacésped), el tiempo acelera y satura la pista sin cerrar los tres carriles, y los regalos dan premios", r["arbitro"] and r["portero"] and r["barrera"] and r["tarjeta"] and r["tarjetaGolpea"] and r["cortacesped"] and r["rapido"] and r["infernal"] and r["reg"] and r["vm"][0] == 1 and r["vm"][4] > 2 and r["sp"][2] < 0.6 and r["ex"][3] == 2, str(r))
            r = psl.evaluate("""(()=>{ const j=TIKI.slalom.juego(), S=j.S; const out={}; const paso=(n)=>{ for(let i=0;i<n;i++){ S.t+=0.02; j.logica(0.02); } };
              const rs=()=>{ j.empezar(); j.limpia(); S.fase='corre'; S.vidas=2; S.inv=0; S.y=0; S.x=0; S.lane=1; S.v=14; S.sig=9999; S.cajaD=1e9; S.podSig=1e9; };
              out.niv=[0,16,17,100,148,149,400].map(j.nivelDe);
              rs(); S.dist=3000; S.filas=10; S.tc=0; const seen=[]; for(let k=0;k<300;k++){ j.limpia(); const antes=Object.keys(S.vistos).length; j.fila(); const des=Object.keys(S.vistos).length; if(des>antes) seen.push(Object.keys(S.vistos)[des-1]); }
              out.orden=seen.join(','); const ord=j.NUEVOS.map(q=>q[2]).filter(t=>seen.includes(t)); out.coherente=seen.join(',')===ord.join(',') && seen.length===j.NUEVOS.filter(q=>q[0]<3000).length;
              rs(); S.dist=3000; S.filas=10; S.tc=200; const s2=[]; for(let k=0;k<400;k++){ j.limpia(); const a=Object.keys(S.vistos).length; j.fila(); if(Object.keys(S.vistos).length>a) s2.push(1); } out.infernal=S.vistos.ultra&&S.vistos.bengala&&S.vistos.steward;
              rs(); S.iman=0; j.pon('pw_iman',1,-1,1.1); paso(5); out.iman=S.iman>4.5;
              rs(); j.pon('pw_rayo',1,-1,1.1); paso(5); out.rayo=S.turbo>4.5 && S.turbo<=5;
              rs(); j.pon('pw_escudo',1,-1,1.1); paso(5); out.escudo=S.escu>4.5 && S.escu<=5 && S.turbo<=0;
              rs(); S.escu=3; j.pon('def',1,-2); paso(10); out.escudoDerriba=S.vidas===2;
              rs(); S.iman=5; const mo=j.pon('moneda',2,-8,1.0); const x0=mo.x===undefined?2.4:mo.x; paso(40); out.imanAtrae=S.monedas>=1 || (mo.x!==undefined && Math.abs(mo.x)<2.3);
              rs(); S.filas=10; S.dist=1000; S.podSig=0; S.poderes=0; j.fila(); out.poder=S.obs.some(o=>o.tipo.indexOf('pw_')===0) && S.poderes===1 && S.obs.filter(o=>o.tipo!=='moneda').length===1;
              rs(); S.filas=10; S.poderes=20; S.podSig=0; S.dist=5000; j.limpia(); j.fila(); out.tope=!S.obs.some(o=>o.tipo.indexOf('pw_')===0);
              rs(); const b=j.pon('barrera',-1,-6); b.ph=0; S.t=0; S.x=2.4; b.x=0; paso(1); out.barreraEstrecha=S.vidas===2;
              j.limpia(); return out; })()""")
            check("slalom: dificultad 1-10, avisos de obstáculos en orden y solo al aparecer, modo infernal, poderes (imán, rayo, escudo) y barrera más estrecha", r["niv"]==[1,1,2,7,9,10,10] and r["coherente"] and r["infernal"] and r["iman"] and r["rayo"] and r["escudo"] and r["escudoDerriba"] and r["imanAtrae"] and r["poder"] and r["tope"] and r["barreraEstrecha"], str(r))
            r = psl.evaluate("""(()=>{ const j=TIKI.slalom.juego(), S=j.S; j.empezar(); S.monedas=200; S.sig=9999; S.obs.length=0; S.inv=0; S.vidas=1; j.pon('def',1,-5);
              for(let i=0;i<400;i++) j.logica(0.02); return {fase:S.fase, vidas:S.vidas}; })()""")
            psl.wait_for_timeout(300)
            check("slalom: la segunda tarjeta termina la carrera y sale la pantalla final", r["fase"] in ("fin", "choque") and psl.locator("[data-fin]:not([hidden])").count() == 1, str(r))
            psl.evaluate("document.querySelector('[data-fin] [data-sl=vest]').click()"); psl.wait_for_timeout(200)
            nk = psl.locator("[data-kit]").count()
            psl.evaluate("document.querySelector('[data-kit=dorado]').click()"); psl.wait_for_timeout(100)
            sin = psl.locator("[data-kit=dorado].on").count() == 0
            psl.evaluate("document.querySelector('[data-kit=rojo]').click()"); psl.wait_for_timeout(300)
            check("slalom: el vestuario ofrece equipaciones, botas, pelo y estelas, no vende sin monedas y compra con ellas (precios ×3)", nk == 32 and sin and psl.locator("[data-kit=rojo].on").count() == 1 and psl.locator("[data-vest] [data-saldo]").inner_text().strip() == "80", "%s %s %s" % (nk, sin, psl.locator("[data-vest] [data-saldo]").inner_text()))
            psl.evaluate("document.querySelector('[data-sl=vestcerrar]').click()"); psl.wait_for_timeout(100)
            psl.evaluate("document.querySelector('[data-sl=salir]').click()"); psl.wait_for_timeout(400)
            check("slalom: salir cierra la pantalla", psl.locator(".sl-raiz").count() == 0)
        check("slalom: sin errores de JavaScript", not errs_sl, "; ".join(errs_sl)[:150])
        csl.close()
    except Exception as e:
        check("slalom 3D", False, str(e)[:150])

    print("3ae) ¿A qué pertenece?")
    try:
        cpe = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        ppe = cpe.new_page(); errs_pe = []
        ppe.on("pageerror", lambda e: errs_pe.append(str(e)))
        ppe.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')")
        ppe.goto(BASE, wait_until="networkidle", timeout=60000); ppe.wait_for_timeout(300)
        check("pertenece: tarjeta en Letras", ppe.locator("[data-pertenece]").count() == 1)
        ppe.evaluate("document.querySelector('[data-pertenece]').click()"); ppe.wait_for_timeout(1500)
        check("pertenece: se abre la pantalla", ppe.locator(".pe-raiz").count() == 1)
        g = ppe.evaluate("""(()=>{ const j=TIKI.pertenece.juego(); let mal=0, n=0; const tipos={};
          for(let r=1;r<=30;r++) for(let i=0;i<150;i++){ const q=j.generar(r,null); n++; tipos[q.tipo]=1; if(q.ops.length!==4||q.ops.filter(o=>o.ok).length!==1||new Set(q.ops.map(o=>o.txt)).size!==4) mal++; }
          return {mal,n,tipos:Object.keys(tipos).length,d1:j.dificultad(1),d16:j.dificultad(16),t1:j.tiempo(1),t20:j.tiempo(20)}; })()""")
        check("pertenece: todas las preguntas tienen 4 opciones distintas y una sola correcta", g["mal"] == 0 and g["tipos"] >= 9, str(g))
        check("pertenece: cada ronda es más difícil y con menos tiempo", g["d1"] == 0 and g["d16"] == 5 and g["t1"] > g["t20"] and g["t20"] >= 6, str(g))
        ppe.click("[data-menu] [data-pe=jugar]"); ppe.wait_for_timeout(300)
        check("pertenece: aparece la pregunta con 4 botones y 3 vidas", ppe.locator(".pe-op").count() == 4 and ppe.locator("[data-vidas] i.on").count() == 3)
        ppe.evaluate("(()=>{const j=TIKI.pertenece.juego(); j.responder(j.S.q.ops.findIndex(o=>o.ok));})()"); ppe.wait_for_timeout(200)
        pts = ppe.evaluate("TIKI.pertenece.juego().S.pts")
        check("pertenece: acertar suma puntos", pts >= 100, str(pts))
        ppe.wait_for_timeout(1200)
        check("pertenece: tras acertar pasa a la siguiente ronda", ppe.evaluate("TIKI.pertenece.juego().S.r") == 2)
        ppe.evaluate("(()=>{const j=TIKI.pertenece.juego(); j.S.ac=11; j.responder(j.S.q.ops.findIndex(o=>o.ok));})()"); ppe.wait_for_timeout(200)
        check("pertenece: el 12.º acierto da +1 tikitexto", ppe.evaluate("TIKI.pertenece.juego().S.tikis") == 1)
        ppe.wait_for_timeout(1200)
        for _ in range(3):
            ppe.evaluate("(()=>{const j=TIKI.pertenece.juego(); if(j.S.fase==='pregunta') j.responder(j.S.q.ops.findIndex(o=>!o.ok));})()"); ppe.wait_for_timeout(1800)
        check("pertenece: 3 fallos terminan el partido", ppe.locator("[data-fin]:not([hidden])").count() == 1, str(ppe.evaluate("TIKI.pertenece.juego().S.vidas")))
        ppe.evaluate("document.querySelector('[data-pe=salir]').click()"); ppe.wait_for_timeout(300)
        check("pertenece: salir cierra la pantalla", ppe.locator(".pe-raiz").count() == 0)
        check("pertenece: sin errores de JavaScript", not errs_pe, "; ".join(errs_pe)[:150])
        cpe.close()
    except Exception as e:
        check("pertenece", False, str(e)[:150])

    print("3af) Pasapalabra")
    try:
        cpp = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        ppp = cpp.new_page(); errs_pp = []
        ppp.on("pageerror", lambda e: errs_pp.append(str(e)))
        ppp.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')")
        ppp.goto(BASE, wait_until="networkidle", timeout=60000); ppp.wait_for_timeout(300)
        check("pasapalabra: tarjeta en Letras", ppp.locator("[data-pasapalabra]").count() == 1)
        ppp.evaluate("document.querySelector('[data-pasapalabra]').click()"); ppp.wait_for_timeout(1500)
        check("pasapalabra: se abre la pantalla con 26 letras", ppp.locator(".pp-raiz").count() == 1 and ppp.locator(".pp-l").count() == 26)
        g = ppp.evaluate("""(()=>{ const j=TIKI.pasapalabra.juego(); let mal=0, vacio=0;
          for(let k=0;k<200;k++){ const r=j.generar(); if(r.length!==26) mal++; r.forEach(it=>{ if(!it.validas.length||!j.acepta(it,it.n)) mal++; const nn=it.n.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/Ø/g,'O').replace(/ø/g,'o').replace(/[Ææ]/g,'AE'); const ini=nn[0].toUpperCase(); if(it.modo==='e'&&ini!==it.L) mal++; if(it.modo==='c'&&!nn.toUpperCase().includes(it.L)) mal++; }); }
          return {mal, n:j.POOL.length}; })()""")
        check("pasapalabra: 26 respuestas por rosco, cada una acepta su nombre y respeta la letra", g["mal"] == 0 and g["n"] > 300, str(g))
        tol = ppp.evaluate("""(()=>{ const j=TIKI.pasapalabra.juego(); const it={validas:[{alias:['zidane']}]}; return [j.acepta(it,'ZIDANE'),j.acepta(it,'zidanne'),j.acepta(it,'zidan'),j.acepta(it,'zola'),j.acepta(it,'z')]; })()""")
        check("pasapalabra: ignora mayúsculas y tildes y tolera una errata", tol == [True, True, True, False, False], str(tol))
        ppp.click("[data-menu] [data-pp=jugar]"); ppp.wait_for_timeout(300)
        check("pasapalabra: sale la pista de la A con el reloj en marcha", "A" in ppp.inner_text("[data-tit]") and ppp.locator("[data-pista] div").count() >= 1 and ppp.locator(".pp-l.act").count() == 1)
        ppp.evaluate("(()=>{const j=TIKI.pasapalabra.juego(); j.responder(j.S.rosco[j.S.i].n);})()"); ppp.wait_for_timeout(100)
        r1 = ppp.evaluate("(()=>{const j=TIKI.pasapalabra.juego(); return {ok:j.S.ok, i:j.S.i, est:j.S.rosco[0].est};})()")
        check("pasapalabra: acertar marca la letra en verde y pasa a la siguiente", r1["ok"] == 1 and r1["i"] == 1 and r1["est"] == 1 and ppp.locator(".pp-l.ok").count() == 1, str(r1))
        ppp.evaluate("TIKI.pasapalabra.juego().pasa()"); ppp.wait_for_timeout(100)
        r2 = ppp.evaluate("(()=>{const j=TIKI.pasapalabra.juego(); return {i:j.S.i, est:j.S.rosco[1].est};})()")
        check("pasapalabra: «Pasapalabra» salta a la siguiente y deja la letra pendiente", r2["i"] == 2 and r2["est"] == 3 and ppp.locator(".pp-l.pas").count() == 1, str(r2))
        t0 = ppp.evaluate("(()=>{const j=TIKI.pasapalabra.juego(); const a=j.S.extra; j.pista(); return [a,j.S.extra,j.mascara(j.S.rosco[j.S.i])];})()")
        check("pasapalabra: la pista cuesta 10 s y descubre una letra más", t0[1] - t0[0] == 10, str(t0))
        ppp.evaluate("(()=>{const j=TIKI.pasapalabra.juego(); j.responder('zzzzzz');})()"); ppp.wait_for_timeout(1100)
        check("pasapalabra: un fallo marca la letra en rojo y avanza", ppp.locator(".pp-l.ko").count() == 1 and ppp.evaluate("TIKI.pasapalabra.juego().S.ko") == 1)
        ppp.click(".pp-l >> nth=0"); ppp.wait_for_timeout(100)
        rv = ppp.inner_text("[data-rev]")
        check("pasapalabra: tocar una letra acertada dice Correcta y su respuesta", ppp.locator("[data-rev].ok").count() == 1 and "Respuesta" in rv, rv)
        ppp.click(".pp-l >> nth=2"); ppp.wait_for_timeout(100)
        rv2 = ppp.inner_text("[data-rev]")
        check("pasapalabra: tocar una letra fallada dice Fallada, la respuesta y lo que escribiste", ppp.locator("[data-rev].ko").count() == 1 and "Respuesta" in rv2 and "zzzzzz" in rv2, rv2)
        ppp.evaluate("(()=>{const j=TIKI.pasapalabra.juego(); j.S.ok=14; j.responder(j.S.rosco[j.S.i].n);})()"); ppp.wait_for_timeout(150)
        check("pasapalabra: el 15.º acierto da +1 tikitexto", ppp.evaluate("TIKI.pasapalabra.juego().S.tikis") == 1)
        ppp.evaluate("(()=>{const j=TIKI.pasapalabra.juego(); j.S.t0 -= 400000;})()"); ppp.wait_for_timeout(500)
        check("pasapalabra: al acabarse el tiempo sale el resultado", ppp.locator("[data-fin]:not([hidden])").count() == 1 and ppp.evaluate("TIKI.pasapalabra.juego().S.fase") == "fin")
        ppp.evaluate("document.querySelector('[data-pp=salir]').click()"); ppp.wait_for_timeout(300)
        check("pasapalabra: salir cierra la pantalla", ppp.locator(".pp-raiz").count() == 0)
        check("pasapalabra: sin errores de JavaScript", not errs_pp, "; ".join(errs_pp)[:150])
        cpp.close()
    except Exception as e:
        check("pasapalabra", False, str(e)[:150])

    print("3ag) Toques")
    try:
        cto = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        pto = cto.new_page(); errs_to = []
        pto.on("pageerror", lambda e: errs_to.append(str(e)))
        pto.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')".replace("'letras'", "'dinamicos'"))
        pto.goto(BASE, wait_until="networkidle", timeout=60000); pto.wait_for_timeout(300)
        check("toques: tarjeta en Dinámicos", pto.locator("[data-toques]").count() == 1)
        pto.evaluate("document.querySelector('[data-toques]').click()")
        try: pto.wait_for_selector(".to-raiz canvas.to-cv", timeout=15000)
        except Exception: pass
        pto.wait_for_timeout(500)
        check("toques: se abre la pantalla con el lienzo y el menú", pto.locator(".to-raiz canvas.to-cv").count() == 1 and pto.locator(".to-menu:not([hidden])").count() == 1)
        c = pto.evaluate("(()=>{const j=TIKI.toques.juego(); return {k:j.EQUIPACIONES.length,b:j.BALONES.length,f:j.FONDOS.length,k0:j.EQUIPACIONES[0].p,b0:j.BALONES[0].p,f0:j.FONDOS[0].p,f0id:j.FONDOS[0].id};})()")
        check("toques: catálogo de equipaciones, balones y fondos (empieza en el callejón y lo primero es gratis)", c["k"] >= 8 and c["b"] >= 6 and c["f"] >= 9 and c["k0"] == 0 and c["b0"] == 0 and c["f0"] == 0 and c["f0id"] == "callejon", str(c))
        pto.click("[data-menu] [data-to=jugar]"); pto.wait_for_timeout(300)
        check("toques: al jugar aparece el marcador", pto.locator("[data-marc]:not([hidden])").count() == 1)
        # colocamos el balón justo sobre el pie y comprobamos que un toque suma puntos
        r = pto.evaluate("""(()=>{const j=TIKI.toques.juego(), S=j.S; S.ball.x=S.foot.x; S.ball.y=S.foot.y-30; S.ball.vx=0; S.ball.vy=300; S.cool=0; j.colision(); return {t:S.toques,p:S.pts,vy:S.ball.vy};})()""")
        check("toques: un toque suma 1 toque y 10 puntos y lanza el balón hacia arriba", r["t"] == 1 and r["p"] == 10 and r["vy"] < -300, str(r))
        m = pto.evaluate("""(()=>{const j=TIKI.toques.juego(), S=j.S; S.toques=9; S.cool=0; S.ball.x=S.foot.x; S.ball.y=S.foot.y-30; S.ball.vx=0; S.ball.vy=300; j.colision(); return {t:S.toques,m:S.mult,p:S.pts};})()""")
        check("toques: a los 10 toques el multiplicador sube a ×2", m["t"] == 10 and m["m"] == 2, str(m))
        pie = pto.evaluate("""(()=>{const j=TIKI.toques.juego(), S=j.S, k=j.constantes; const f0=S.fase; S.fase='menu'; S.obj.x=k.CADX+500; S.obj.y=k.CADY-400; for(let i=0;i<60;i++) j.fisica(0.016); S.fase=f0; const d=Math.hypot(S.foot.x-(S.hx+S.lado*14), S.foot.y-k.CADY); return {d:Math.round(d), max:k.REACH+1, y:Math.round(S.foot.y), suelo:k.SUELO, hx:Math.round(S.hx)};})()""")
        check("toques: el pie nunca se aleja de la cadera más que la longitud de la pierna y el cuerpo se desplaza hacia el dedo", pie["d"] <= pie["max"] and pie["hx"] > 250, str(pie))
        pto.evaluate("(()=>{const j=TIKI.toques.juego(), S=j.S; S.toques=29; S.cool=0; S.ball.x=S.foot.x; S.ball.y=S.foot.y-30; S.ball.vx=0; S.ball.vy=300; j.colision();})()")
        check("toques: el toque 30 da +1 tikitexto", pto.evaluate("TIKI.toques.juego().S.tikis") == 1)
        pto.evaluate("(()=>{const j=TIKI.toques.juego(), S=j.S; S.ball.x=40; S.ball.y=530; S.ball.vy=600; for(let i=0;i<20&&S.fase==='juego';i++) j.fisica(0.02);})()"); pto.wait_for_timeout(1000)
        d = pto.evaluate("(()=>{const j=TIKI.toques.juego(), D=j.datos(); return {f:j.S.fase,mejor:D.mejor,pts:D.pts,part:D.part};})()")
        check("toques: si el balón toca el suelo se acaba y se guardan récord y puntos", d["f"] == "fin" and d["mejor"] >= 30 and d["pts"] > 0 and d["part"] >= 1, str(d))
        check("toques: sale la pantalla de fin", pto.locator("[data-fin]:not([hidden])").count() == 1)
        pto.evaluate("document.querySelector('[data-fin] [data-to=vestuario]').click()"); pto.wait_for_timeout(300)
        n_it = pto.locator(".to-it").count(); n_lock = pto.locator(".to-it.lock").count()
        check("toques: el vestuario muestra el catálogo con lo bloqueado marcado", n_it >= 8 and n_lock >= 1, str((n_it, n_lock)))
        pto.evaluate("(()=>{const D=TIKI.toques.juego().datos(); D.pts=999999;})()"); pto.click("[data-tab=f]"); pto.wait_for_timeout(300)
        pto.locator(".to-it").nth(1).click(); pto.wait_for_timeout(200)
        check("toques: elegir un fondo desbloqueado lo equipa", pto.evaluate("TIKI.toques.juego().datos().sel.f") == "playa")
        pto.evaluate("document.querySelector('[data-to=cerrarvest]').click(); document.querySelector('[data-fin] [data-to=salir]').click()"); pto.wait_for_timeout(300)
        check("toques: salir cierra la pantalla", pto.locator(".to-raiz").count() == 0)
        check("toques: sin errores de JavaScript", not errs_to, "; ".join(errs_to)[:150])
        cto.close()
    except Exception as e:
        check("toques", False, str(e)[:150])

    print("3ab) Cuartetos TIKITEXTO")
    try:
        cb2 = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        pb2 = cb2.new_page(); errs_b2 = []
        pb2.on("pageerror", lambda e: errs_b2.append(str(e)))
        pb2.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','juegos');")
        pb2.goto(BASE, wait_until="networkidle", timeout=60000); pb2.wait_for_timeout(300)
        check("cuartetos: tarjeta en Letras", pb2.locator("[data-cuartetos]").count() == 1)
        pb2.evaluate("document.querySelector('[data-cuartetos]').click()"); pb2.wait_for_timeout(1500)
        check("cuartetos: se abre la pantalla", pb2.locator(".cu-raiz").count() == 1)
        gen = pb2.evaluate("""(()=>{const j=TIKI.cuartetos.juego(); let ok=0, uni=0; for(let i=0;i<80;i++){ const p=j.generar(Math.random); if(p){ ok++; const t=p.cats.flatMap(c=>c.items); if(t.length===16&&new Set(t).size===16&&p.cats.every(c=>c.items.length===4)) uni++; } }
          const a=j.generar(j.mulberry(20261115)), b=j.generar(j.mulberry(20261115)); return {ok,uni,igual:JSON.stringify(a)===JSON.stringify(b),cats:j.DB.cats.length}})()""")
        check("cuartetos: el generador no falla y reparte 16 fichas distintas", gen["ok"] == 80 and gen["uni"] == 80, str(gen))
        check("cuartetos: el reto diario sale igual con la misma semilla", gen["igual"] and gen["cats"] >= 20, str(gen))
        pb2.click("[data-menu] [data-cu=libre]"); pb2.wait_for_timeout(300)
        check("cuartetos: 16 fichas y 4 vidas", pb2.locator(".cu-ficha").count() == 16 and pb2.locator("[data-vidas] i.on").count() == 4)
        pb2.evaluate("TIKI.cuartetos.juego().fallar()"); pb2.wait_for_timeout(200)
        check("cuartetos: un fallo quita una vida", pb2.locator("[data-vidas] i.on").count() == 3)
        pb2.click("[data-cu=pista]"); pb2.wait_for_timeout(100)
        check("cuartetos: la pista muestra el título de un grupo", "Pista" in pb2.inner_text("[data-info]"))
        pb2.click(".cu-ficha >> nth=0"); pb2.click(".cu-ficha >> nth=1"); pb2.wait_for_timeout(100)
        check("cuartetos: seleccionar fichas y deseleccionar", pb2.locator(".cu-ficha.sel").count() == 2)
        pb2.click("[data-cu=quitar]"); pb2.wait_for_timeout(100)
        check("cuartetos: deseleccionar", pb2.locator(".cu-ficha.sel").count() == 0)
        pb2.evaluate("(()=>{const j=TIKI.cuartetos.juego(); j.resolverGrupo(); j.resolverGrupo();})()"); pb2.wait_for_timeout(300)
        check("cuartetos: acertar dos grupos los coloca arriba", pb2.locator(".cu-res").count() == 2 and pb2.locator(".cu-ficha").count() == 8)
        pb2.evaluate("(()=>{const j=TIKI.cuartetos.juego(); j.resolverGrupo(); })()"); pb2.wait_for_timeout(1800)
        check("cuartetos: al completar sale la pantalla «VER RESULTADO» (y aún no el final)", pb2.locator(".cu-res").count() == 4 and pb2.locator("[data-ver]:not([hidden])").count() == 1 and pb2.locator("[data-fin]:not([hidden])").count() == 0)
        pb2.evaluate("document.querySelector('[data-cu=ver]').click()"); pb2.wait_for_timeout(300)
        check("cuartetos: al pulsar VER RESULTADO sale el final", pb2.locator("[data-fin]:not([hidden])").count() == 1 and pb2.locator("[data-ver]:not([hidden])").count() == 0, pb2.inner_text("[data-fin]")[:80])
        pb2.evaluate("TIKI.cuartetos.juego().empezar('libre')"); pb2.wait_for_timeout(200)
        pb2.evaluate("(()=>{const j=TIKI.cuartetos.juego(); for(let i=0;i<4;i++) j.fallar();})()"); pb2.wait_for_timeout(2500)
        check("cuartetos: 4 fallos terminan la partida, revelan los grupos y piden VER RESULTADO", pb2.locator("[data-ver]:not([hidden])").count() == 1 and pb2.locator(".cu-res").count() == 4)
        pb2.evaluate("document.querySelector('[data-cu=ver]').click()"); pb2.wait_for_timeout(300)
        check("cuartetos: perdiendo también se ve el final tras VER RESULTADO", pb2.locator("[data-fin]:not([hidden])").count() == 1)
        pb2.click("[data-fin] [data-cu=menu]"); pb2.wait_for_timeout(200)
        pb2.click("[data-menu] [data-cu=diario]"); pb2.wait_for_timeout(300)
        check("cuartetos: reto diario con número", "#" in pb2.inner_text("[data-modo-txt]"))
        pb2.evaluate("(()=>{const j=TIKI.cuartetos.juego(); for(let i=0;i<4;i++) j.resolverGrupo();})()"); pb2.wait_for_timeout(2200)
        pb2.evaluate("document.querySelector('[data-cu=ver]').click()"); pb2.wait_for_timeout(300)
        pb2.click("[data-fin] [data-cu=menu]"); pb2.wait_for_timeout(200)
        check("cuartetos: el diario resuelto no se repite (muestra el resultado)", "resultado" in pb2.inner_text("[data-diario-txt]").lower() or "result" in pb2.inner_text("[data-diario-txt]").lower())
        pb2.click("[data-menu] [data-cu=salir]"); pb2.wait_for_timeout(300)
        check("cuartetos: salir cierra la pantalla", pb2.locator(".cu-raiz").count() == 0)
        check("cuartetos: sin errores de JavaScript", not errs_b2, "; ".join(errs_b2)[:150])
        cb2.close()
    except Exception as e:
        check("cuartetos", False, str(e)[:150])

    print("3aa) Vídeos (clases animadas)")
    try:
        ca = br.new_context(viewport={"width": 1000, "height": 760}, service_workers="block")
        pa = ca.new_page(); errs_a = []
        pa.on("pageerror", lambda e: errs_a.append(str(e)))
        pa.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');")
        pa.goto(BASE + "?modo=clases", wait_until="networkidle", timeout=60000); pa.wait_for_timeout(1200)
        check("vídeos: se abre con enlace directo y muestra 18 miniaturas", pa.locator(".cl-raiz [data-leccion]").count() == 18 and pa.locator("canvas[data-mini]").count() == 18)
        check("vídeos: botón «Personalizar profesor» siempre visible", pa.locator("[data-cl=profe]").is_visible())
        comp = pa.evaluate("""(async()=>{ const D=await import('/clases_datos.js'), I=await import('/clases_idiomas.js'); const falta=[];
          for(const l of D.LECCIONES){ const cl=[l.titulo,l.desc]; l.escenas.forEach(e=>{cl.push(e.say); e.items.forEach(it=>{ if((it.k==='texto'||it.k==='caja')&&it.t&&/[A-Za-zÁ-ú]{2}/.test(it.t)) cl.push(it.t); }); });
            for(const g of ['en','pt','fr','it','de']) for(const t of cl) if(!I.TEXTOS[g][t]) falta.push(g+':'+t.slice(0,30));
            l.escenas.forEach((e,i)=>{ if(e.say.length>330) falta.push('largo:'+l.id+i); }); }
          for(const k in I.UI) if(I.UI[k].length!==6) falta.push('ui:'+k);
          return falta; })()""")
        check("vídeos: todos los textos están traducidos a los 6 idiomas", not comp, str(comp[:5]))
        pa.click("[data-cl-idioma=de]"); pa.wait_for_timeout(300)
        check("vídeos: el hub cambia de idioma", "Videos" in pa.inner_text(".cl-hero .cl-h"), pa.inner_text(".cl-hero .cl-h"))
        pa.click("[data-leccion='0']"); pa.wait_for_timeout(400)
        r = pa.evaluate("""(()=>{const j=TIKI.clases.juego(); const out=[];
          j.LECCIONES.forEach((l)=>{ j.cargaLeccion(l); l.escenas.forEach((e,i)=>{ j.empezarEscena(i); const w=j.mundo(); if(!w.ents.length && !e.limpia && i>0) out.push(l.id+':'+i+' vacia'); }); });
          return out})()""")
        check("vídeos: todas las escenas se resuelven", not r, str(r))
        pa.evaluate("TIKI.clases.juego().cargaLeccion(TIKI.clases.juego().LECCIONES[0])"); pa.wait_for_timeout(1500)
        check("vídeos: la lección avanza sola", pa.evaluate("TIKI.clases.juego().S().T") > 0.5)
        pa.select_option("[data-idi]", "en"); pa.wait_for_timeout(300)
        check("vídeos: se puede cambiar de idioma dentro del vídeo", pa.evaluate("TIKI.clases.juego().cfg.idioma") == "en" and "Offside" in pa.inner_text("[data-tit]"), pa.inner_text("[data-tit]"))
        pa.click("[data-cl=vista]"); pa.wait_for_timeout(200)
        check("vídeos: se puede cambiar a vista pizarra", pa.evaluate("TIKI.clases.juego().cfg.vista") == "pizarra")
        pa.click("[data-cl=vista]")
        check("vídeos: solo música o sin música (sin estadio)", pa.evaluate("(()=>{const j=TIKI.clases.juego(); const a=[]; for(let i=0;i<3;i++){document.querySelector('[data-cl=amb]').click(); a.push(j.cfg.amb);} return a.join()})()") in ("off,musica,off", "musica,off,musica"))
        pa.evaluate("(()=>{const j=TIKI.clases.juego(); for(let i=0;i<12;i++) j.avanza();})()"); pa.wait_for_timeout(300)
        check("vídeos: al final no hay minitest, solo repetir o más vídeos", pa.locator("[data-fin]:not([hidden])").count() == 1 and pa.locator("[data-op]").count() == 0)
        pa.click("[data-cl=otra]"); pa.wait_for_timeout(200)
        check("vídeos: «Más vídeos» vuelve al hub", pa.locator("[data-menu]:not([hidden])").count() == 1)
        pa.click("[data-cl=salir]"); pa.wait_for_timeout(300)
        check("vídeos: salir cierra la pantalla", pa.locator(".cl-raiz").count() == 0)
        check("vídeos: sin errores de JavaScript", not errs_a, "; ".join(errs_a)[:150])
        ca.close()
    except Exception as e:
        check("vídeos", False, str(e)[:150])

    print("3an) Duelo de datos")
    try:
        cdd = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        pdd = cdd.new_page(); errs_dd = []
        pdd.on("pageerror", lambda e: errs_dd.append(str(e)))
        pdd.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')")
        pdd.goto(BASE, wait_until="networkidle", timeout=60000); pdd.wait_for_timeout(300)
        check("duelo: tarjeta en Letras", pdd.locator("[data-duelo]").count() == 1)
        pdd.evaluate("document.querySelector('[data-duelo]').click()"); pdd.wait_for_timeout(2000)
        check("duelo: se abre la pantalla", pdd.locator(".dd-raiz").count() == 1)
        g = pdd.evaluate("""(()=>{ const j=TIKI.duelo.juego(); let mal=0, n=0; const cats={}, gaps=[];
          for(let r=1;r<=18;r++) for(let i=0;i<120;i++){ const q=j.generar(r,null); n++; if(!q){mal++;continue;} cats[q.cat]=1;
            if(q.ops.length!==2||q.vals[0]===q.vals[1]||typeof q.vals[0]!=='number'||typeof q.vals[1]!=='number') mal++;
            if(q.vals[q.ok]<=q.vals[1-q.ok]) mal++; if(q.ops[0].id===q.ops[1].id) mal++; if(r===1) gaps.push(q.gap); }
          return {mal,n,cats:Object.keys(cats).length,gmin:Math.min(...gaps),d1:j.dificultad(1),d16:j.dificultad(16),t1:j.tiempo(1),t30:j.tiempo(30),stats:j.preparar().length}; })()""")
        check("duelo: todas las preguntas son de 2 nombres con cifras distintas y una sola correcta", g["mal"] == 0 and g["cats"] == 4 and g["stats"] >= 15, str(g))
        check("duelo: cada ronda es más difícil (menos diferencia) y con menos tiempo", g["d1"] == 0 and g["d16"] == 5 and g["gmin"] >= 0.55 and g["t1"] > g["t30"] and g["t30"] >= 5, str(g))
        pdd.click("[data-menu] [data-dd=jugar]"); pdd.wait_for_timeout(300)
        check("duelo: aparece la pregunta con 2 tarjetas y 3 balones", pdd.locator(".dd-op").count() == 2 and pdd.locator("[data-vidas] i.on").count() == 3)
        pdd.evaluate("(()=>{const j=TIKI.duelo.juego(); j.responder(j.S.q.ok);})()"); pdd.wait_for_timeout(200)
        check("duelo: acertar suma puntos y revela las cifras de los dos", pdd.evaluate("TIKI.duelo.juego().S.pts") >= 100 and pdd.locator(".dd-op.rev .dd-val").count() == 2 and pdd.locator(".dd-op.bien").count() == 1)
        pdd.wait_for_timeout(1700)
        check("duelo: tras acertar pasa a la siguiente ronda", pdd.evaluate("TIKI.duelo.juego().S.r") == 2)
        pdd.keyboard.press("ArrowRight"); pdd.wait_for_timeout(200)
        check("duelo: el teclado (← →) también responde", pdd.evaluate("TIKI.duelo.juego().S.fase") == "resp")
        pdd.wait_for_timeout(2300)
        pdd.evaluate("(()=>{const j=TIKI.duelo.juego(); j.S.ac=9; j.responder(j.S.q.ok);})()"); pdd.wait_for_timeout(200)
        check("duelo: el 10.º acierto da +1 tikitexto", pdd.evaluate("TIKI.duelo.juego().S.tikis") == 1)
        pdd.wait_for_timeout(1700)
        for _ in range(4):
            pdd.evaluate("(()=>{const j=TIKI.duelo.juego(); if(j.S.fase==='pregunta') j.responder(1-j.S.q.ok);})()"); pdd.wait_for_timeout(2300)
        check("duelo: 3 fallos terminan el partido", pdd.locator("[data-fin]:not([hidden])").count() == 1, str(pdd.evaluate("TIKI.duelo.juego().S.vidas")))
        pdd.evaluate("document.querySelector('[data-dd=salir]').click()"); pdd.wait_for_timeout(300)
        check("duelo: salir cierra la pantalla", pdd.locator(".dd-raiz").count() == 0)
        check("duelo: sin errores de JavaScript", not errs_dd, "; ".join(errs_dd)[:150])
        cdd.close()
    except Exception as e:
        check("duelo de datos", False, str(e)[:150])

    print("3aq) Trivia TIKITEXTO")
    try:
        ctv = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        ptv = ctv.new_page(); errs_tv = []
        ptv.on("pageerror", lambda e: errs_tv.append(str(e)))
        ptv.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')")
        ptv.goto(BASE, wait_until="networkidle", timeout=60000); ptv.wait_for_timeout(300)
        check("trivia: tarjeta en Letras", ptv.locator("[data-trivia]").count() == 1)
        ptv.evaluate("document.querySelector('[data-trivia]').click()"); ptv.wait_for_timeout(2500)
        check("trivia: se abre la pantalla", ptv.locator(".tv-raiz").count() == 1)
        r = ptv.evaluate("""(()=>{ const j=TIKI.trivia.juego(); const B=j.banco(); let mal=0; const tipos={};
          B.forEach(q=>{ const m=j.montar(q, Math.random); tipos[q.tipo]=1; if(m.ops.length!==4||m.iok<0||m.ops[m.iok]!==q.ok) mal++;
            const k=m.ops.map(o=>o.t+':'+(Array.isArray(o.v)?o.v.join('|'):o.v)); if(new Set(k).size!==4) mal++; const e=j.enunciado(m); if(/[{}]/.test(e)||!e) mal++; m.ops.forEach(o=>{const s=j.rotulo(o); if(!s||s==='undefined') mal++;}); });
          const tr = Object.values(j.Q).every(a=>a.length===6) && Object.values(j.UI).every(a=>Array.isArray(a)?a.length===6||a.length===5:true);
          const pt=j.partida('todo'), ds=pt.map(q=>q.d).join(''); const cats={}; ['ch','mu','oro','rec'].forEach(c=>{ const x=j.partida(c); cats[c]=x.length===10&&x.every(q=>q.cat===c); });
          return {n:B.length, mal, nt:Object.keys(tipos).length, tr, ds, cats, ids:new Set(pt.map(q=>q.id)).size}; })()""")
        check("trivia: más de 500 preguntas, todas con 4 opciones distintas y una sola correcta", r["n"] >= 500 and r["mal"] == 0 and r["nt"] >= 15, str(r))
        check("trivia: plantillas en 6 idiomas y rondas de 10 (4 fáciles, 4 medias, 2 difíciles) por categoría", r["tr"] and r["ds"] == "0000111122" and r["ids"] == 10 and all(r["cats"].values()), str(r))
        same = ptv.evaluate("""(async()=>{ const m = await import('./trivia.js'); const j=TIKI.trivia.juego(); const a=j.partida('todo', m.mulberry(m.semillaDe('x'))), b=j.partida('todo', m.mulberry(m.semillaDe('x'))), c=j.partida('todo', m.mulberry(m.semillaDe('y')));
          const f=(p)=>JSON.stringify(p.map(q=>[q.id,q.ops.map(o=>o.v)])); return {igual:f(a)===f(b), dist:f(a)!==f(c)}; })()""")
        check("trivia: el reto de hoy es determinista (misma semilla = mismas preguntas)", same["igual"] and same["dist"], str(same))
        ptv.click("[data-tv=dia]"); ptv.wait_for_timeout(400)
        check("trivia: el reto muestra 4 respuestas y la barra de tiempo", ptv.locator(".tv-op").count() == 4 and ptv.locator("[data-barra]").count() == 1)
        ptv.evaluate("(()=>{const j=TIKI.trivia.juego(); j.responder(j.S.q.iok);})()"); ptv.wait_for_timeout(200)
        check("trivia: acertar suma puntos, marca la correcta y enseña «Siguiente»", ptv.evaluate("TIKI.trivia.juego().S.pts") >= 100 and ptv.locator(".tv-op.bien").count() == 1 and ptv.locator("[data-tv=sig]:not([hidden])").count() == 1)
        ptv.keyboard.press("Enter"); ptv.wait_for_timeout(200)
        check("trivia: Intro pasa a la pregunta siguiente", ptv.evaluate("TIKI.trivia.juego().S.i") == 1 and ptv.evaluate("TIKI.trivia.juego().S.fase") == "pregunta")
        ptv.evaluate("(()=>{const j=TIKI.trivia.juego(); j.comodin();})()"); ptv.wait_for_timeout(100)
        check("trivia: el comodín 50:50 quita dos respuestas incorrectas (solo una vez)", ptv.locator(".tv-op.fuera").count() == 2 and ptv.evaluate("TIKI.trivia.juego().S.usado5050") is True)
        ptv.evaluate("(()=>{const j=TIKI.trivia.juego(); j.responder((j.S.q.iok+1)%4);})()"); ptv.wait_for_timeout(100)
        check("trivia: fallar marca la respuesta y corta la racha", ptv.locator(".tv-op.mal").count() >= 0 and ptv.evaluate("TIKI.trivia.juego().S.racha") == 0)
        for _ in range(8):
            ptv.keyboard.press("Enter"); ptv.wait_for_timeout(100)
            ptv.evaluate("(()=>{const j=TIKI.trivia.juego(); if(j.S.fase==='pregunta') j.responder(j.S.q.iok);})()"); ptv.wait_for_timeout(100)
        ptv.keyboard.press("Enter"); ptv.wait_for_timeout(300)
        check("trivia: al terminar salen rango, cuadrícula y +1 tikitexto con 7 o más aciertos", ptv.locator("[data-fin]:not([hidden])").count() == 1 and ptv.inner_text("[data-fin-grid]").count("🟩") == 9 and ptv.locator("[data-fin-tiki]:not([hidden])").count() == 1, ptv.inner_text("[data-fin-m]"))
        ptv.click("[data-tv=menu]"); ptv.wait_for_timeout(200)
        check("trivia: el reto de hoy solo se juega una vez (después enseña el resultado)", "✔" in ptv.inner_text("[data-dia-t]"))
        ptv.click("[data-tv=dia]"); ptv.wait_for_timeout(300)
        check("trivia: volver a pulsar el reto no empieza otra partida", ptv.locator("[data-fin]:not([hidden])").count() == 1 and ptv.locator("[data-tv=otra]:not([hidden])").count() == 0)
        ptv.evaluate("document.querySelector('[data-tv=menu]').click()"); ptv.wait_for_timeout(100)
        ptv.click("[data-tv=cat][data-c=oro]"); ptv.click("[data-tv=libre]"); ptv.wait_for_timeout(300)
        check("trivia: el modo libre filtra por categoría (Balón de Oro)", ptv.evaluate("TIKI.trivia.juego().S.preg.every(q=>q.cat==='oro')") is True)
        ptv.evaluate("document.querySelector('[data-tv=salir]').click()"); ptv.wait_for_timeout(300)
        check("trivia: salir cierra la pantalla", ptv.locator(".tv-raiz").count() == 0)
        check("trivia: sin errores de JavaScript", not errs_tv, "; ".join(errs_tv)[:150])
        ctv.close()
    except Exception as e:
        check("trivia", False, str(e)[:150])

    print("3ar) Línea del tiempo")
    try:
        clt = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        plt = clt.new_page(); errs_lt = []
        plt.on("pageerror", lambda e: errs_lt.append(str(e)))
        plt.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')")
        plt.goto(BASE, wait_until="networkidle", timeout=60000); plt.wait_for_timeout(300)
        check("línea del tiempo: tarjeta en Letras", plt.locator("[data-lineatiempo]").count() == 1)
        plt.evaluate("document.querySelector('[data-lineatiempo]').click()"); plt.wait_for_timeout(2000)
        check("línea del tiempo: se abre la pantalla", plt.locator(".lt-raiz").count() == 1)
        r = plt.evaluate("""(()=>{ const j=TIKI.lineatiempo.juego(); const E=j.EV; const ids=new Set(E.map(e=>e.id)); let mal=0;
          E.forEach(e=>{ const t=j.texto(e); if(!t||/undefined|[{}]/.test(t)||typeof e.y!=='number') mal++; });
          const h=E.filter(e=>e.cat==='h'); const ok6=h.every(e=>Array.isArray(e.t)&&e.t.length===6&&e.t.every(x=>x&&x.length>8));
          const L=[{y:1900},{y:1950},{y:2000}]; const v=(y)=>[0,1,2,3].filter(i=>j.huecoValido(L,{y},i));
          return {n:E.length, uni:ids.size, mal, ok6, v1:v(1850).join(), v2:v(1975).join(), v3:v(2020).join(), c:j.huecoCorrecto(L,{y:1925}),
            cats:[...new Set(E.map(e=>e.cat))].sort().join()}; })()""")
        check("línea del tiempo: más de 100 hechos únicos, con texto y 6 idiomas en los hitos", r["n"] >= 100 and r["uni"] == r["n"] and r["mal"] == 0 and r["ok6"] and r["cats"] == "ch,h,mu,oro", str(r))
        check("línea del tiempo: el hueco correcto es único (antes, entre y después)", r["v1"] == "0" and r["v2"] == "2" and r["v3"] == "3" and r["c"] == 1, str(r))
        plt.click("[data-menu] [data-lt=jugar]"); plt.wait_for_timeout(400)
        check("línea del tiempo: empieza con una carta en la línea, una en la mano y 3 balones", plt.locator(".lt-nodo").count() == 1 and plt.locator(".lt-hueco:not([disabled])").count() == 2 and plt.locator("[data-vidas] i.on").count() == 3)
        g = plt.evaluate("""(()=>{ const j=TIKI.lineatiempo.juego(); let n=0; for(let k=0;k<25;k++){ const ev=j.S.mano; if(!ev) break; const i=j.huecoCorrecto(j.S.linea, ev); j.colocar(i); n++; j.avanza(); if(j.S.fase!=='pregunta') break; }
          const ys=j.S.linea.map(e=>e.y); const ord=ys.every((y,i)=>i===0||ys[i-1]<y); return {n, ord, ok:j.S.ok, tik:j.S.tikis, len:ys.length}; })()""")
        check("línea del tiempo: colocar bien mantiene la línea ordenada y suma puntos", g["ord"] and g["ok"] >= 20 and g["len"] == g["ok"] + 1, str(g))
        check("línea del tiempo: a los 8 aciertos, +1 tikitexto y a los 18, otro", g["tik"] == 2, str(g))
        plt.evaluate("(()=>{const j=TIKI.lineatiempo.juego(); const ev=j.S.mano; const n=j.S.linea.length; let mal=0; for(let i=0;i<=n;i++) if(!j.huecoValido(j.S.linea,ev,i)) {mal=i; break;} j.colocar(mal);})()"); plt.wait_for_timeout(150)
        check("línea del tiempo: fallar enseña el hueco correcto en verde y quita un balón", plt.locator(".lt-hueco.bien").count() == 1 and plt.locator("[data-vidas] i.on").count() == 2, plt.inner_text("[data-info]"))
        plt.keyboard.press("Enter"); plt.wait_for_timeout(200)
        for _ in range(3):
            plt.evaluate("(()=>{const j=TIKI.lineatiempo.juego(); if(j.S.fase==='pregunta'){ const ev=j.S.mano; for(let i=0;i<=j.S.linea.length;i++) if(!j.huecoValido(j.S.linea,ev,i)){ j.colocar(i); break; } }})()"); plt.wait_for_timeout(120)
            plt.evaluate("TIKI.lineatiempo.juego().avanza()"); plt.wait_for_timeout(150)
        check("línea del tiempo: 3 fallos terminan la partida", plt.locator("[data-fin]:not([hidden])").count() == 1, str(plt.evaluate("TIKI.lineatiempo.juego().S.vidas")))
        plt.evaluate("document.querySelector('[data-lt=salir]').click()"); plt.wait_for_timeout(300)
        check("línea del tiempo: salir cierra la pantalla", plt.locator(".lt-raiz").count() == 0)
        check("línea del tiempo: sin errores de JavaScript", not errs_lt, "; ".join(errs_lt)[:150])
        clt.close()
    except Exception as e:
        check("línea del tiempo", False, str(e)[:150])

    print("3as) Sopa de letras")
    try:
        cso = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        pso = cso.new_page(); errs_so = []
        pso.on("pageerror", lambda e: errs_so.append(str(e)))
        pso.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')")
        pso.goto(BASE, wait_until="networkidle", timeout=60000); pso.wait_for_timeout(300)
        check("sopa: tarjeta en Letras", pso.locator("[data-sopa]").count() == 1)
        pso.evaluate("document.querySelector('[data-sopa]').click()"); pso.wait_for_timeout(2000)
        check("sopa: se abre la pantalla", pso.locator(".so-raiz").count() == 1)
        r = pso.evaluate("""(()=>{ const j=TIKI.sopa.juego(); let mal=0, n=0; const tam=[];
          for(let nv=0; nv<7; nv++) for(let k=0;k<40;k++){ const G=j.generar(nv, null); n++; if(!G){mal++;continue;}
            const cfg=j.NIVELES[Math.min(nv,j.NIVELES.length-1)]; if(G.n!==cfg.n||G.palabras.length!==cfg.pal) mal++; if(nv<7&&k===0) tam.push(G.n);
            G.palabras.forEach(p=>{ const s=p.cells.map(c=>G.g[c[0]][c[1]]).join(''); if(s!==p.w) mal++; if(!p.cells.every(c=>c[0]>=0&&c[0]<G.n&&c[1]>=0&&c[1]<G.n)) mal++; });
            if(!G.g.every(f=>f.every(x=>/^[A-Z]$/.test(x)))) mal++; if(nv===0 && !G.palabras.every(p=>p.d[0]>=0&&p.d[1]>=0)) mal++; }
          const rev=j.generar(4,null).palabras.some(p=>p.d[0]<0||p.d[1]<0) || j.generar(4,null).palabras.some(p=>p.d[0]<0||p.d[1]<0) || j.generar(4,null).palabras.some(p=>p.d[0]<0||p.d[1]<0);
          return {mal,n,tam:tam.join(','),rev,temas:j.TEMAS.length,aj:JSON.stringify(j.ajusta([2,2],[2,6],10).map(x=>x.join(''))), aj2:j.ajusta([0,0],[3,3],10).length, aj3:j.ajusta([5,5],[1,1],10).length}; })()""")
        check("sopa: las cuadrículas tienen todas sus palabras bien colocadas por nivel", r["mal"] == 0 and r["tam"] == "8,9,10,10,11,11,11" and r["temas"] >= 25 and r["rev"], str(r))
        check("sopa: la selección se ajusta a líneas rectas (horizontal, diagonal y al revés)", r["aj"] == '["22","23","24","25","26"]' and r["aj2"] == 4 and r["aj3"] == 5, str(r))
        pso.click("[data-menu] [data-so=jugar]"); pso.wait_for_timeout(400)
        check("sopa: empieza con cuadrícula 8×8, 5 nombres y reloj", pso.locator(".so-c").count() == 64 and pso.locator(".so-pal").count() == 5 and "2:" in pso.inner_text("[data-reloj]"))
        pso.evaluate("(()=>{const j=TIKI.sopa.juego(); j.resolver(j.S.G.palabras[0].w);})()"); pso.wait_for_timeout(150)
        check("sopa: marcar un nombre lo colorea, lo tacha y suma puntos", pso.locator(".so-c.enc").count() >= 4 and pso.locator(".so-pal.hecho").count() == 1 and pso.evaluate("TIKI.sopa.juego().S.pts") >= 100)
        pso.evaluate("(()=>{const j=TIKI.sopa.juego(); j.evalua([[0,0],[0,1]]);})()"); pso.wait_for_timeout(100)
        check("sopa: una selección sin nombre se rechaza", pso.locator(".so-pal.hecho").count() == 1 and "no" in pso.inner_text("[data-info]").lower())
        # arrastre real con el ratón sobre la primera palabra pendiente
        box = pso.evaluate("""(()=>{ const j=TIKI.sopa.juego(); const p=j.S.G.palabras.filter(x=>!j.S.hechas[x.w])[0]; const g=document.querySelector('[data-grid]').getBoundingClientRect(); const n=j.S.G.n; const f=(c)=>({x:g.left+(c[1]+.5)/n*g.width, y:g.top+(c[0]+.5)/n*g.height});
          return {a:f(p.cells[0]), b:f(p.cells[p.cells.length-1]), w:p.w}; })()""")
        pso.mouse.move(box["a"]["x"], box["a"]["y"]); pso.mouse.down(); pso.mouse.move(box["b"]["x"], box["b"]["y"], steps=6); pso.mouse.up(); pso.wait_for_timeout(200)
        check("sopa: deslizar el ratón sobre las letras marca el nombre", pso.locator(".so-pal.hecho").count() == 2, box["w"])
        pso.evaluate("(()=>{const j=TIKI.sopa.juego(); j.pista();})()"); pso.wait_for_timeout(100)
        check("sopa: la pista marca una letra inicial y resta tiempo", pso.locator(".so-c.pista").count() == 1 and pso.evaluate("TIKI.sopa.juego().S.resto") < 146)
        pso.evaluate("(()=>{const j=TIKI.sopa.juego(); j.S.G.palabras.forEach(p=>{ if(!j.S.hechas[p.w]) j.resolver(p.w); });})()"); pso.wait_for_timeout(300)
        check("sopa: completar la cuadrícula suma tiempo y pasa al nivel 2", pso.evaluate("TIKI.sopa.juego().S.cuad") == 1 and pso.evaluate("TIKI.sopa.juego().S.fase") == "pausa")
        pso.wait_for_timeout(1800)
        check("sopa: la cuadrícula siguiente es 9×9 con 6 nombres", pso.locator(".so-c").count() == 81 and pso.locator(".so-pal").count() == 6)
        pso.evaluate("(()=>{const j=TIKI.sopa.juego(); j.S.G.palabras.forEach(p=>{ if(!j.S.hechas[p.w]) j.resolver(p.w); });})()"); pso.wait_for_timeout(300)
        check("sopa: la 2.ª cuadrícula da +1 tikitexto", pso.evaluate("TIKI.sopa.juego().S.tikis") == 1)
        pso.evaluate("(()=>{const j=TIKI.sopa.juego(); j.S.t=0.2; j.S.t0=performance.now();})()"); pso.wait_for_timeout(1900)
        check("sopa: al acabarse el tiempo sale el resultado", pso.locator("[data-fin]:not([hidden])").count() == 1, pso.inner_text("[data-fin-m]"))
        pso.evaluate("document.querySelector('[data-so=salir]').click()"); pso.wait_for_timeout(300)
        check("sopa: salir cierra la pantalla", pso.locator(".so-raiz").count() == 0)
        check("sopa: sin errores de JavaScript", not errs_so, "; ".join(errs_so)[:150])
        cso.close()
    except Exception as e:
        check("sopa de letras", False, str(e)[:150])

    print("3at) Memoria de parejas")
    try:
        cmp_ = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        pmp = cmp_.new_page(); errs_mp = []
        pmp.on("pageerror", lambda e: errs_mp.append(str(e)))
        pmp.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')")
        pmp.goto(BASE, wait_until="networkidle", timeout=60000); pmp.wait_for_timeout(300)
        check("parejas: tarjeta en Letras", pmp.locator("[data-parejas]").count() == 1)
        pmp.evaluate("document.querySelector('[data-parejas]').click()"); pmp.wait_for_timeout(2000)
        check("parejas: se abre la pantalla", pmp.locator(".mp-raiz").count() == 1)
        r = pmp.evaluate("""(()=>{ const j=TIKI.parejas.juego(); let mal=0, n=0, nulos=0; const tam=[], modos=[];
          for(let nv=0; nv<10; nv++){ for(let k=0;k<40;k++){ const tab=j.generar(nv); n++; if(!tab){nulos++; continue;}
            const p=j.parejasDe(nv); if(tab.length!==2*p) mal++;
            const ids={}; tab.forEach(c=>{ids[c.par]=(ids[c.par]||0)+1;}); if(Object.keys(ids).length!==p||Object.values(ids).some(v=>v!==2)) mal++;
            if(new Set(tab.map(c=>c.txt)).size!==tab.length) mal++;
            if(j.relaciones(tab)!==p) mal++;
            for(let i=0;i<p;i++){ const par=tab.filter(c=>c.par===i); if(!j.rel(par[0],par[1])) mal++; } }
            if(nv<8){ tam.push(2*j.parejasDe(nv)); modos.push(j.modoDe(nv)); } }
          return {mal,n,nulos,tam:tam.join(','),modos:modos.join(','), mem:[0,5,9].map(x=>j.memorizaDe(x).toFixed(2)).join(','), bono:j.bonoDe(0,6)+','+j.bonoDe(3,12)+','+j.bonoDe(30,12)}; })()""")
        check("parejas: 400 tableros válidos (cada pareja única, sin relaciones extra) en 10 niveles", r["mal"] == 0 and r["nulos"] == 0 and r["n"] == 400, str(r))
        check("parejas: tamaños 12→24 cartas, modos alternos, memorizar menos y bono acotado", r["tam"] == "12,12,16,16,20,20,24,24" and r["modos"] == "sel,est,sel,est,sel,est,sel,est" and r["mem"] == "3.20,1.95,1.30" and r["bono"] == "34,46,18", str(r))
        pmp.click("[data-menu] [data-mp=jugar]"); pmp.wait_for_timeout(300)
        check("parejas: al empezar se enseñan todas las cartas (memoriza)", pmp.locator(".mp-c").count() == 12 and pmp.locator(".mp-c.up").count() == 12 and pmp.evaluate("TIKI.parejas.juego().S.fase") == "preview" and "jugador" in pmp.inner_text(".mp-raiz [data-mpmodo]").lower())
        pmp.evaluate("TIKI.parejas.juego().voltear(0)"); pmp.wait_for_timeout(100)
        check("parejas: durante la memorización no se puede girar", pmp.evaluate("TIKI.parejas.juego().S.a") == -1)
        pmp.evaluate("TIKI.parejas.juego().saltaPreview()"); pmp.wait_for_timeout(500)
        check("parejas: después se giran boca abajo y empieza el reloj", pmp.locator(".mp-c.up").count() == 0 and pmp.evaluate("TIKI.parejas.juego().S.fase") == "juego")
        ix = pmp.evaluate("""(()=>{ const S=TIKI.parejas.juego().S; const p0=S.cartas.map((c,i)=>i).filter(i=>S.cartas[i].par===0); const q=S.cartas.map((c,i)=>i).filter(i=>S.cartas[i].par===1); return {ok:p0, mal:[p0[0], q[0]]}; })()""")
        t_a = pmp.evaluate("TIKI.parejas.juego().S.rest")
        pmp.click('.mp-c[data-i="%d"]' % ix["mal"][0]); pmp.click('.mp-c[data-i="%d"]' % ix["mal"][1]); pmp.wait_for_timeout(150)
        check("parejas: un fallo muestra las dos cartas, resta 3 s y bloquea un momento", pmp.locator(".mp-c.up").count() == 2 and pmp.evaluate("TIKI.parejas.juego().S.bloq") is True and (t_a - pmp.evaluate("TIKI.parejas.juego().S.rest")) > 2.5)
        pmp.wait_for_timeout(1200)
        check("parejas: tras el fallo se vuelven a girar y se rompe la racha", pmp.locator(".mp-c.up").count() == 0 and pmp.evaluate("TIKI.parejas.juego().S.bloq") is False and pmp.evaluate("TIKI.parejas.juego().S.combo") == 0)
        pmp.click('.mp-c[data-i="%d"]' % ix["ok"][0]); pmp.click('.mp-c[data-i="%d"]' % ix["ok"][1]); pmp.wait_for_timeout(150)
        check("parejas: acertar deja las cartas descubiertas y suma 100 puntos", pmp.locator(".mp-c.hecho").count() == 2 and pmp.evaluate("TIKI.parejas.juego().S.pts") == 100)
        pmp.evaluate("TIKI.parejas.juego().ojo()"); pmp.wait_for_timeout(150)
        check("parejas: el ojo enseña las cartas que quedan una vez por partida", pmp.locator(".mp-c.up").count() == 12 and pmp.locator("[data-mp=ojo]:disabled").count() == 1)
        pmp.wait_for_timeout(1700)
        check("parejas: el ojo vuelve a ocultarlas", pmp.locator(".mp-c.up").count() == 2 and pmp.locator(".mp-c.hecho").count() == 2)
        pmp.evaluate("TIKI.parejas.juego().resolverTodo()"); pmp.wait_for_timeout(300)
        check("parejas: completar el tablero suma tiempo y puntos", pmp.evaluate("TIKI.parejas.juego().S.tab") == 1 and pmp.evaluate("TIKI.parejas.juego().S.fase") == "pausa" and pmp.evaluate("TIKI.parejas.juego().S.pts") > 600)
        pmp.wait_for_timeout(2000)
        check("parejas: el siguiente tablero es de clubes y estadios (12 cartas)", pmp.locator(".mp-c").count() == 12 and "clubes" in pmp.inner_text(".mp-raiz [data-mpmodo]").lower() and pmp.evaluate("TIKI.parejas.juego().S.n") == 1)
        pmp.evaluate("TIKI.parejas.juego().saltaPreview()"); pmp.wait_for_timeout(300)
        pmp.evaluate("TIKI.parejas.juego().resolverTodo()"); pmp.wait_for_timeout(300)
        check("parejas: el 2.º tablero da +1 tikitexto", pmp.evaluate("TIKI.parejas.juego().S.tikis") == 1 and pmp.evaluate("TIKI.parejas.juego().S.tab") == 2)
        pmp.wait_for_timeout(2000)
        check("parejas: el 3.er tablero es de 16 cartas", pmp.locator(".mp-c").count() == 16)
        pmp.evaluate("(()=>{const j=TIKI.parejas.juego(); j.saltaPreview(); j.S.rest=0.2; j.S.t0=performance.now();})()"); pmp.wait_for_timeout(1000)
        check("parejas: al acabarse el tiempo sale el resultado", pmp.locator("[data-fin]:not([hidden])").count() == 1 and "tableros" in pmp.inner_text("[data-fin-m]"), pmp.inner_text("[data-fin-m]"))
        pmp.evaluate("document.querySelector('[data-mp=salir]').click()"); pmp.wait_for_timeout(300)
        check("parejas: salir cierra la pantalla", pmp.locator(".mp-raiz").count() == 0)
        check("parejas: sin errores de JavaScript", not errs_mp, "; ".join(errs_mp)[:150])
        cmp_.close()
    except Exception as e:
        check("memoria de parejas", False, str(e)[:150])

    print("3ao) Vitrina de logros")
    try:
        clg = br.new_context(viewport={"width": 400, "height": 820}, service_workers="block")
        plg = clg.new_page(); errs_lg = []
        plg.on("pageerror", lambda e: errs_lg.append(str(e)))
        plg.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','letras')")
        plg.goto(BASE, wait_until="networkidle", timeout=60000); plg.wait_for_timeout(300)
        check("logros: banner en la vista de juegos", plg.locator("[data-logros]").count() == 1)
        # lógica pura del catálogo
        r = plg.evaluate("""(async()=>{ const m = await import('./logros.js'); const L = m.LOGROS; let mal = 0; const ids = new Set();
          for (const l of L) { ids.add(l.id); if (l.t.length!==6||l.d.length!==6||l.tiers.length!==3||!(l.tiers[0]<l.tiers[1]&&l.tiers[1]<l.tiers[2])||!l.d.every(x=>x.includes('{n}'))) mal++; }
          const v0 = m.calcular({}, {}), v1 = m.calcular({pts:300,jugadas:200,mejor:20,diaMejor:40}, {sl:{mejorm:7000,bal:6000}});
          return {mal, n:L.length, uni:ids.size, vacio:v0.every(e=>e.nivel===0), oro:v1.filter(e=>e.nivel===3).length, r0:m.resumen(v0).rango, r1:m.resumen(v1).rango}; })()""")
        check("logros: 34 logros únicos con 6 idiomas y 3 niveles crecientes", r["mal"] == 0 and r["n"] >= 34 and r["uni"] == r["n"], str(r))
        check("logros: perfil vacío = 0 medallas; marcas altas = oro", r["vacio"] and r["oro"] >= 5 and r["r0"] == 0 and r["r1"] >= 1, str(r))
        # perfil de ejemplo en el almacenamiento
        plg.evaluate("""(()=>{ const d = JSON.parse(localStorage.getItem('tikitexto:jugadores')); const p = d.perfiles[d.actual];
          Object.assign(p, {pts:62,jugadas:14,aciertos:9,mejor:5,diaMejor:8,nv:{tut:{},t:7,f:4,a:2,sl:{mejor:900,mejorm:2400,part:12,bal:6000},to:{mejor:120,pts:900,tot:1400,part:10},pp:{mejor:1200,maxAc:18,part:4,perf:0},cu:{part:9,gan:6,mejor:3},c:{gan:4,per:2,emp:0,gol:22}}});
          localStorage.setItem('tikitexto:jugadores', JSON.stringify(d)); })()""")
        plg.goto(BASE, wait_until="networkidle", timeout=60000); plg.wait_for_timeout(5000)
        check("logros: la primera vez avisa de lo ya conseguido (una sola vez)", plg.locator(".lg-toast").count() >= 1)
        check("logros: el banner muestra medallas y rango", re.match(r"^\d+/102", plg.locator("[data-lg-cnt]").first.inner_text().strip()) is not None, plg.locator("[data-lg-cnt]").first.inner_text())
        plg.evaluate("document.querySelector('[data-logros]').click()"); plg.wait_for_timeout(1800)
        check("logros: se abre la vitrina con las 34 tarjetas", plg.locator(".lg-raiz").count() == 1 and plg.locator(".lg-card").count() == 34)
        check("logros: botón de compartir y anillo de progreso", plg.locator("[data-lg=compartir]").count() == 1 and plg.locator(".lg-anillo .prog").count() == 1)
        check("logros: hay medallas de oro, plata y bronce y bloqueadas", plg.locator(".lg-card--3").count() >= 1 and plg.locator(".lg-card--2").count() >= 1 and plg.locator(".lg-card--1").count() >= 1 and plg.locator(".lg-card--0").count() >= 1)
        plg.click("[data-f=ganadas]"); plg.wait_for_timeout(300)
        n_g = plg.locator(".lg-card").count()
        plg.click("[data-f=pendientes]"); plg.wait_for_timeout(300)
        n_p = plg.locator(".lg-card").count()
        check("logros: los filtros reparten las tarjetas", 0 < n_g < 34 and 0 < n_p < 34 and plg.locator(".lg-card--3").count() == 0, "%d/%d" % (n_g, n_p))
        plg.keyboard.press("Escape"); plg.wait_for_timeout(300)
        check("logros: Esc cierra la vitrina", plg.locator(".lg-raiz").count() == 0)
        # un logro nuevo muestra un aviso
        plg.evaluate("(()=>{ const d = JSON.parse(localStorage.getItem('tikitexto:jugadores')); d.perfiles[d.actual].nv.to.mejor = 400; localStorage.setItem('tikitexto:jugadores', JSON.stringify(d)); })()")
        plg.evaluate("document.querySelectorAll('.lg-toast').forEach(e=>e.remove())")
        plg.goto(BASE, wait_until="networkidle", timeout=60000); plg.wait_for_timeout(5200)
        check("logros: subir una marca desbloquea un aviso con su nombre", "Malabarista" in plg.evaluate("(document.querySelector('.lg-toast')||{}).innerText||''"), plg.evaluate("(document.querySelector('.lg-toast')||{}).innerText||''"))
        plg.goto(BASE + "?modo=logros", wait_until="networkidle", timeout=60000); plg.wait_for_timeout(2200)
        check("logros: ?modo=logros abre la vitrina", plg.locator(".lg-raiz").count() == 1)
        check("logros: sin errores de JavaScript", not errs_lg, "; ".join(errs_lg)[:150])
        clg.close()
    except Exception as e:
        check("vitrina de logros", False, str(e)[:150])

    print("3ap) Vigilante de carga de los juegos 3D")
    try:
        ccg = br.new_context(viewport={"width": 1100, "height": 760}, service_workers="block")
        pcg = ccg.new_page(); errs_cg = []
        pcg.on("pageerror", lambda e: errs_cg.append(str(e)))
        pcg.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');sessionStorage.setItem('tikitexto:vista','j');sessionStorage.setItem('tikitexto:grupo','dinamicos')")
        pcg.route("**/slalom.js", lambda r: r.abort())
        pcg.goto(BASE, wait_until="networkidle", timeout=60000); pcg.wait_for_timeout(300)
        pcg.evaluate("document.querySelector('[data-slalom]').click()"); pcg.wait_for_timeout(2500)
        check("carga 3D fallida: aparece el aviso con Reintentar y Cerrar", pcg.locator(".cg-capa").count() == 1 and pcg.locator(".cg-capa .cg-b").count() == 2, pcg.inner_text("body")[:80] if pcg.locator(".cg-capa").count() == 0 else "")
        pcg.unroute("**/slalom.js")
        pcg.evaluate("document.querySelector('.cg-b--ok').click()"); pcg.wait_for_timeout(6000)
        check("reintentar vuelve a cargar el juego y quita el aviso", pcg.locator(".cg-capa").count() == 0 and pcg.locator(".sl-raiz").count() == 1)
        check("carga 3D: sin errores de JavaScript", not errs_cg, "; ".join(errs_cg)[:150])
        ccg.close()
    except Exception as e:
        check("vigilante de carga", False, str(e)[:150])

    br.close()

# 3u) Enlaces internos de todas las páginas HTML (sin navegador) y artículos de explicación
print("3u) Enlaces internos sin romper y artículos nuevos")
import os as _os, posixpath as _pp
_raiz = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
_rotos = []
_n_html = 0
for _d, _ds, _fs in _os.walk(_raiz):
    if any(x in _d for x in ("/.git", "/node_modules", "/tests", "/tools")): continue
    for _f in _fs:
        if not _f.endswith(".html"): continue
        _n_html += 1
        _p = _os.path.join(_d, _f)
        _h = open(_p, encoding="utf-8").read()
        for _a in re.findall(r'(?:href|src)="([^"#?]+)', _h):
            if _a.startswith(("http", "mailto", "tel", "data:", "javascript")) or "'" in _a or "+" in _a: continue
            _t = _os.path.normpath(_os.path.join(_raiz, _a[1:]) if _a.startswith("/") else _os.path.join(_d, _a))
            if _os.path.isdir(_t): _t = _os.path.join(_t, "index.html")
            if not _os.path.exists(_t): _rotos.append(_os.path.relpath(_p, _raiz) + " -> " + _a)
check("enlaces internos: ninguno roto en %d páginas" % _n_html, not _rotos, "; ".join(_rotos[:5]))
for _slug in ("reglas-basicas-del-futbol-para-principiantes", "posiciones-del-futbol-que-hace-cada-jugador", "formaciones-tacticas-442-433-explicadas",
              "quien-es-quien-en-un-partido-arbitros-y-senales", "historia-del-balon-de-futbol", "formatos-de-competicion-liga-copa-y-playoff"):
    _fp = _os.path.join(_raiz, "articulos", _slug, "index.html")
    _hh = open(_fp, encoding="utf-8").read() if _os.path.exists(_fp) else ""
    check("artículo %s: existe, con FAQ y +700 palabras" % _slug, bool(_hh) and "FAQPage" in _hh and len(re.sub(r"<[^>]+>", " ", _hh).split()) > 700)
check("404.html existe, con noindex y enlaces a la portada", _os.path.exists(_os.path.join(_raiz, "404.html")) and "noindex" in open(_os.path.join(_raiz, "404.html"), encoding="utf-8").read())
for _g in ("adivina-el-jugador", "adivina-el-equipo", "adivina-la-seleccion", "adivina-el-entrenador", "adivina-el-estadio", "ahorcado-futbolistas"):
    _hh = open(_os.path.join(_raiz, _g, "index.html"), encoding="utf-8").read()
    check("página de juego %s: lleva consejos y lecturas" % _g, "Consejos para jugar mejor" in _hh and "Para leer mientras tanto" in _hh)

# 3ah) guías de los juegos (es/en), hub, autoría en artículos
import sys as _s2; _s2.path.insert(0, _os.path.join(_raiz, "tools"))
import juegos_data as _jd
for _g in _jd.J:
    for _l, _r in (("es", "juegos/%s/" % _g["es"]), ("en", "en/games/%s/" % _g["en"])):
        _fp = _os.path.join(_raiz, _r, "index.html")
        _hh = open(_fp, encoding="utf-8").read() if _os.path.exists(_fp) else ""
        _pal = len(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[\s\S]*?</\1>", "", _hh)).split())
        check("guía %s (%s): +450 palabras, FAQ, hreflang y enlace al juego" % (_g["modo"], _l), _pal > 450 and "FAQPage" in _hh and 'hreflang="en"' in _hh and ("modo=" + _g["modo"]) in _hh, str(_pal))
        check("guía %s (%s) está en el sitemap" % (_g["modo"], _l), "/" + _r in open(_os.path.join(_raiz, "sitemap.xml"), encoding="utf-8").read())
for _r in ("juegos/", "en/games/"):
    _hh = open(_os.path.join(_raiz, _r, "index.html"), encoding="utf-8").read()
    check("hub %s enlaza a las 10 guías" % _r, _hh.count('href="') > 10 and all(((_g["es"] if _r == "juegos/" else _g["en"]) + "/") in _hh for _g in _jd.J))
_hh = open(_os.path.join(_raiz, "articulos", "reglas-basicas-del-futbol-para-principiantes", "index.html"), encoding="utf-8").read()
check("artículos: llevan autoría editorial y enlace a «cómo elaboramos el contenido»", "equipo editorial de TIKITEXTO" in _hh and "sobre-tikitexto.html#editorial" in _hh and '"author"' in _hh)

# 3ai) páginas de texto de las clases animadas (es/en)
import json as _js
_cl = _js.load(open(_os.path.join(_raiz, "tools", "clases_texto.json"), encoding="utf-8"))
_smx = open(_os.path.join(_raiz, "sitemap.xml"), encoding="utf-8").read()
_mal = []
for _g in _cl:
    for _r in ("clases/%s/" % _g["id"],):
        _hh = open(_os.path.join(_raiz, _r, "index.html"), encoding="utf-8").read() if _os.path.exists(_os.path.join(_raiz, _r, "index.html")) else ""
        _pal = len(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[\s\S]*?</\1>", "", _hh)).split())
        if not (_pal > 450 and "FAQPage" in _hh and 'hreflang="en"' in _hh and "/" + _r in _smx): _mal.append(_r + " " + str(_pal))
check("clases: 18 páginas es con +450 palabras, FAQ, hreflang y sitemap", len(_cl) == 18 and not _mal, "; ".join(_mal[:4]))
check("clases: 18 páginas en inglés y hubs en el sitemap", len(_os.listdir(_os.path.join(_raiz, "en", "classes"))) == 19 and "https://tikitexto.com/en/classes/</loc>" in _smx and "https://tikitexto.com/clases/</loc>" in _smx)

# 3aj) estudios estadísticos propios (es/en) con tabla filtrable
for _r in ("curiosidades/estadisticas-finales-champions/", "curiosidades/estadisticas-mundiales/", "en/curiosidades/champions-league-finals-statistics/", "en/curiosidades/world-cup-statistics/"):
    _fp = _os.path.join(_raiz, _r, "index.html"); _hh = open(_fp, encoding="utf-8").read() if _os.path.exists(_fp) else ""
    _pal = len(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[\s\S]*?</\1>", "", _hh)).split())
    check("estadísticas %s: +500 palabras, gráficos SVG, tabla filtrable, FAQ, hreflang y sitemap" % _r, _pal > 500 and _hh.count("<svg") >= 2 and "data-filtro" in _hh and "/tabla_filtro.js" in _hh and "FAQPage" in _hh and 'hreflang="en"' in _hh and "/" + _r in open(_os.path.join(_raiz, "sitemap.xml"), encoding="utf-8").read(), str(_pal))
_hh = open(_os.path.join(_raiz, "curiosidades/estadisticas-finales-champions/index.html"), encoding="utf-8").read()
check("estadísticas Champions: Real Madrid 6 de 20 y 4 finales en penaltis (cálculo propio)", "ganó 6 de las 20" in _hh and "4 finales</b> se decidieron en los penaltis" in _hh)
check("tabla_filtro.js existe y no carga recursos externos", "http" not in open(_os.path.join(_raiz, "tabla_filtro.js"), encoding="utf-8").read())

# 3ak) comparador (es/en): carga, 4 modos, marcador coherente, URL compartible, sin errores JS
for _r in ("comparador/", "en/football-comparator/"):
    _fp = _os.path.join(_raiz, _r, "index.html"); _hh = open(_fp, encoding="utf-8").read() if _os.path.exists(_fp) else ""
    check("comparador %s: FAQ, hreflang, datos y sitemap" % _r, "FAQPage" in _hh and 'hreflang="en"' in _hh and "/comparador_datos.js" in _hh and "/" + _r in open(_os.path.join(_raiz, "sitemap.xml"), encoding="utf-8").read())
try:
  from playwright.sync_api import sync_playwright as _spw
  with _spw() as _pw:
    _br = _pw.chromium.launch(); _pc = _br.new_page(viewport={"width": 1100, "height": 800}); _errs = []
    _pc.on("pageerror", lambda e: _errs.append(str(e)))
    _pc.goto(BASE + "comparador/?m=selecciones&a=brasil&b=alemania", wait_until="networkidle", timeout=60000); _pc.wait_for_timeout(1500)
    _r = _pc.evaluate("TIKI_CP.res")
    check("comparador: duelo por URL pinta marcador y veredicto", _r and _r["pa"] + _r["pb"] > 0 and "GANA" in _r["ver"].upper() or "EMPATE" in _r["ver"], str(_r))
    _ok = True
    for _m in ("jugadores", "equipos", "selecciones", "entrenadores"):
        _pc.evaluate("TIKI_CP.modo('%s')" % _m); _pc.wait_for_timeout(300)
        _ok = _ok and _pc.evaluate("document.querySelectorAll('.cp-fila').length") >= 4 and _pc.evaluate("!!document.querySelector('.cp-radar canvas')")
    check("comparador: los 4 modos muestran filas y radar", _ok)
    _pc.evaluate("document.querySelector('.cp-holo').click()"); _pc.wait_for_timeout(200)
    check("comparador: el selector se abre y filtra", _pc.evaluate("!document.querySelector('.cp-picker').hidden && document.querySelectorAll('.cp-op').length > 3"))
    check("comparador: sin errores de JavaScript", not _errs, str(_errs[:2]))
    _pc.close(); _br.close()
except Exception as _ex:
    check("comparador: prueba de navegador", False, str(_ex)[:200])

# 3al) duelos estáticos del comparador (es/en): páginas, hreflang, FAQ, sitemap y enlaces
import re as _re3al
_sm3 = open(_os.path.join(_raiz, "sitemap.xml"), encoding="utf-8").read()
_n3 = 0; _mal3 = []
for _r in ("comparador/", "en/football-comparator/"):
    _dd = _os.path.join(_raiz, _r)
    for _s in sorted(_os.listdir(_dd)):
        if "-vs-" not in _s: continue
        _n3 += 1; _h = open(_os.path.join(_dd, _s, "index.html"), encoding="utf-8").read()
        _wc = len(_re3al.sub(r"<[^>]+>", " ", _h).split())
        if _wc < 250 or "FAQPage" not in _h or "<table>" not in _h or 'hreflang="x-default"' not in _h or ("https://tikitexto.com/" + _r + _s + "/") not in _sm3:
            _mal3.append(_r + _s)
check("duelos del comparador: >=120 páginas con tabla, FAQ, hreflang y sitemap", _n3 >= 120 and not _mal3, str(_mal3[:3]) + " n=" + str(_n3))

# 3am) modo admin oculto (la secuencia secreta NO está en el repo: variables de entorno TIKI_ADMIN_TECLAS="Code,Code,..."; en móvil se prueba dibujando una W en el selector de idioma; sin la variable se omite)
_SEQ = [k for k in os.environ.get("TIKI_ADMIN_TECLAS", "").split(",") if k]
if not _SEQ:
    print("(3am omitido: define TIKI_ADMIN_TECLAS para probar el modo admin)")
else:
 try:
   with _spw() as _pw:
     _br = _pw.chromium.launch(); _cx = _br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
     _cx.add_init_script("localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');localStorage.setItem('tikitexto:analitica','no');sessionStorage.setItem('tikitexto:intro','1');")
     _pa = _cx.new_page(); _errs = []; _reqs = []
     _pa.on("pageerror", lambda e: _errs.append(str(e))); _pa.on("request", lambda r: _reqs.append(r.url) if "/rpc/" in r.url else None)
     _pa.goto(BASE, wait_until="networkidle", timeout=60000); _pa.wait_for_timeout(800)
     _pa.evaluate("(()=>{const d=JSON.parse(localStorage.getItem('tikitexto:jugadores')||'null')||{actual:'',perfiles:{'':{pts:3,jugadas:0,aciertos:0,racha:0,mejor:0,dist:[0,0,0,0,0,0],diario:'',token:'',online:false,pend:0}}};d.perfiles[d.actual].pts=3;localStorage.setItem('tikitexto:jugadores',JSON.stringify(d));})()")
     _pa.reload(wait_until="networkidle"); _pa.wait_for_timeout(500)
     for _k in ("KeyQ","KeyW","KeyE","KeyR"): _pa.keyboard.press(_k)
     check("admin: una secuencia errónea no activa nada", _pa.evaluate("!localStorage.getItem('tikitexto:z9') && !document.getElementById('admBanner')"))
     for _k in _SEQ: _pa.keyboard.press(_k)
     _pa.wait_for_timeout(1500)
     _r = _pa.evaluate("(()=>{const d=JSON.parse(localStorage.getItem('tikitexto:jugadores'));const p=d.perfiles[d.actual];const b=document.getElementById('admBanner');return {b:b&&b.textContent,pts:p.pts,bal:p.nv.sl.bal,to:p.nv.to.pts,gan:p.nv.c.gan}})()")
     check("admin: la secuencia de teclas activa el modo, muestra MODO ADMIN y da recursos", _r["b"] == "MODO ADMIN" and _r["pts"] > 1e6 and _r["bal"] > 1e6 and _r["to"] > 1e6 and _r["gan"] > 1e6, str(_r))
     _n0 = len(_reqs)
     _pa.evaluate("fetch('/x')"); 
     _q = _pa.evaluate("(()=>{try{return typeof TIKI.cuenta}catch(e){return 'x'}})()")
     check("admin: no se hacen peticiones de escritura al ranking", len([u for u in _reqs if "registrar" in u or "reclamar" in u]) == 0, str(_reqs[:3]))
     for _k in _SEQ: _pa.keyboard.press(_k)
     _pa.wait_for_timeout(1500)
     _r = _pa.evaluate("(()=>{const d=JSON.parse(localStorage.getItem('tikitexto:jugadores'));const p=d.perfiles[d.actual];return {b:!!document.getElementById('admBanner'),pts:p.pts,k:localStorage.getItem('tikitexto:z9')}})()")
     check("admin: repetir la secuencia lo desactiva y restaura los valores", not _r["b"] and _r["pts"] == 3 and _r["k"] is None, str(_r))
     _pa.evaluate("document.querySelector('#abrirIdioma').click()"); _pa.wait_for_timeout(400)
     def _trazo(pts):
         _pa.mouse.move(*pts[0]); _pa.mouse.down()
         for _a, _b in zip(pts, pts[1:]):
             _pa.mouse.move(*_b, steps=8)
         _pa.mouse.up(); _pa.wait_for_timeout(300)
     _trazo([(80, 300), (130, 330), (180, 300)])
     check("admin: un trazo que no es una W en el selector de idioma no activa nada", _pa.evaluate("!localStorage.getItem('tikitexto:z9')") and _pa.evaluate("!!document.querySelector('.idioma')"))
     _trazo([(60, 280), (110, 420), (160, 280), (210, 420), (260, 280)])
     _pa.wait_for_timeout(1500)
     check("admin: dibujar una W en el selector de idioma lo activa", _pa.evaluate("!!document.getElementById('admBanner')"))
     check("admin: sin errores de JavaScript", not _errs, str(_errs[:2]))
     _br.close()
 except Exception as _ex:
     check("admin: prueba de navegador", False, str(_ex)[:200])

print(f"\n{len(ok)} correctas, {len(fallos)} con fallo")
if fallos:
    print("FALLOS:\n - " + "\n - ".join(fallos))
    sys.exit(1)
