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
        pi.click("#portalJuegos"); pi.wait_for_timeout(300)
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
        if pgi.is_visible("#portalJuegos"): pgi.click("#portalJuegos"); pgi.wait_for_timeout(300)
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
        check("temas: 12 páginas es/en con ≥7 curiosidades", not malas_t and len(_td.TEMAS) == 12, ", ".join(malas_t)[:150])
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
        check("portada: Saber con enlaces reales", ph.evaluate("document.querySelectorAll('.portal__chips a[href]').length >= 8") and ph.get_attribute('.portal__enlace', 'href') == 'curiosidades/')
        ph.click('#portalJuegos'); ph.wait_for_timeout(300)
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
        check("curiosidades: al pulsar el tema se ven sus categorías", pv.locator("details.tema[open] details.tema").count() == 6)
        pv.goto(BASE + "articulos/", wait_until="networkidle", timeout=60000)
        n_art = pv.evaluate("document.querySelectorAll('details.tema a.tarjeta').length")
        check("articulos: 57 artículos agrupados en 6 temas", n_art == 57 and pv.locator("details.tema").count() == 6, str(n_art))
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
        cx.close()
    except Exception as e:
        check("penaltis 3D", False, str(e)[:150])

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

print(f"\n{len(ok)} correctas, {len(fallos)} con fallo")
if fallos:
    print("FALLOS:\n - " + "\n - ".join(fallos))
    sys.exit(1)
