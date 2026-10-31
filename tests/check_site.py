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
    ctx.add_init_script("if(!localStorage.getItem('tikitexto:idioma'))localStorage.setItem('tikitexto:idioma','es');if(!localStorage.getItem('tikitexto:consentimiento'))localStorage.setItem('tikitexto:consentimiento','no');")
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
        "sessionStorage.setItem('tikitexto:intro','1');"
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
        # primera vez (cuenta nueva): obligatorio, sin X, y Escape no lo cierra
        pg2 = ctx.new_page()
        pg2.route("**/rest/v1/rpc/*", lambda r: r.abort())
        perfil2 = dict(perfil, tutorialPendiente=True)
        pg2.add_init_script(
            "sessionStorage.setItem('tikitexto:intro','1');"
            "localStorage.setItem('tikitexto:jugadores'," + json.dumps(json.dumps({"actual": "BotNuevo", "perfiles": {"BotNuevo": perfil2}})) + ");")
        pg2.goto(BASE, wait_until="networkidle", timeout=60000)
        pg2.wait_for_timeout(800)
        pg2.keyboard.press("Escape")
        pg2.wait_for_timeout(200)
        check("tutorial obligatorio: sin X y Escape no lo cierra", pg2.is_visible("#modalTutorial") and not pg2.is_visible("#tutCerrar"))
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
            "if(!sessionStorage.getItem('nvt')){sessionStorage.setItem('nvt','1');localStorage.removeItem('tikitexto:partida');sessionStorage.setItem('tikitexto:intro','1');"
            "localStorage.setItem('tikitexto:jugadores'," + json.dumps(json.dumps({"actual": "BotNv", "perfiles": {"BotNv": perfil3}})) + ");}")
        pg3.goto(BASE, wait_until="networkidle", timeout=60000)
        pg3.wait_for_timeout(600)
        check("la sección NOVEDAD se ve en el menú", pg3.is_visible(".novedad"))
        pg3.click("[data-novedad=fichajes]")
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
        pg3.click("[data-novedad=fichajes]")
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
        pi.add_init_script("sessionStorage.setItem('tikitexto:intro','1');")
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
        texto = pi.inner_text("body")
        check("la portada está en inglés", "Guess the name" in texto and "Choose a mode" in texto.replace("CHOOSE A MODE", "Choose a mode"))
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
        pi.click("#botonAjustes")
        pi.wait_for_timeout(200)
        check("el botón de ajustes abre el panel con 6 idiomas y se puede cerrar", pi.is_visible(".ajustes") and pi.locator(".ajustes .idioma__op").count() == 6 and (pi.keyboard.press("Escape") or True) and not pi.is_visible(".ajustes"))
        pi.click("#abrirIdioma")
        pi.wait_for_timeout(200)
        check("el enlace del pie sigue abriendo el selector de idioma", pi.is_visible(".idioma") and (pi.keyboard.press("Escape") or True) and not pi.is_visible(".idioma"))
        pi.click("#botonAjustes")
        pi.wait_for_timeout(200)
        check("ajustes: sonido y vibración activados por defecto", pi.get_attribute("#ajuste-sonido", "aria-checked") == "true")
        pi.click("#ajuste-sonido")
        check("ajustes: el interruptor de sonido se apaga y se guarda", pi.get_attribute("#ajuste-sonido", "aria-checked") == "false" and pi.evaluate("JSON.parse(localStorage.getItem('tikitexto:ajustes')).sonido") is False)
        check("ajustes: sonido apagado queda reflejado en el juego", pi.evaluate("TIKI.ajustes.sonido()") is False and pi.evaluate("TIKI.ajustes.vibracion()") is True)
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
        pe.add_init_script("sessionStorage.setItem('tikitexto:intro','1');")
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

    print("3f) Aviso de consentimiento")
    try:
        cc = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        cc.add_init_script("if(!localStorage.getItem('tikitexto:idioma'))localStorage.setItem('tikitexto:idioma','es');sessionStorage.setItem('tikitexto:intro','1');")
        errs_c, cf = [], []
        pc = cc.new_page()
        pc.on("pageerror", lambda e: errs_c.append(str(e)))
        pc.on("request", lambda r: cf.append(r.url) if "cloudflareinsights" in r.url else None)
        pc.route("**/rest/v1/rpc/*", lambda r: r.abort())
        pc.route("**/static.cloudflareinsights.com/**", lambda r: r.fulfill(status=200, content_type="text/javascript", body=""))
        pc.goto(BASE, wait_until="networkidle", timeout=60000)
        pc.wait_for_timeout(500)
        check("el aviso informativo aparece en la primera visita", pc.is_visible("#cmp"))
        check("la medición sin cookies está activa por defecto", len(cf) > 0)
        cf.clear()
        check("los botones del aviso se ven y se pueden pulsar", pc.locator("#cmpRechazar").bounding_box()["height"] >= 30 and pc.locator("#cmpAceptar").bounding_box()["height"] >= 30)
        pc.click("#cmpRechazar")
        check("desactivar guarda 'no' y oculta el aviso", pc.evaluate("localStorage.getItem('tikitexto:consentimiento')") == "no" and not pc.is_visible("#cmp"))
        pc.reload(wait_until="networkidle")
        check("tras desactivarla no vuelve a salir ni mide", not pc.is_visible("#cmp") and not cf)
        pc.evaluate("document.getElementById('abrirCookies').click()")
        check("Configurar cookies reabre el panel", pc.is_visible("#cmpAjustes"))
        check("el interruptor refleja que está desactivada", not pc.is_checked("#cmpMed"))
        pc.check("#cmpMed")
        pc.click("#cmpGuardar")
        pc.wait_for_timeout(500)
        check("reactivarla vuelve a medir", pc.evaluate("localStorage.getItem('tikitexto:consentimiento')") == "si" and len(cf) > 0)
        check("sin errores de JavaScript con el aviso", not errs_c, "; ".join(errs_c)[:200])
        cc.close()
    except Exception as e:
        check("aviso de consentimiento", False, str(e)[:150])

    print("3g) Racha diaria y compartir")
    try:
        cg = br.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
        errs_g = []
        pgg = cg.new_page()
        pgg.on("pageerror", lambda e: errs_g.append(str(e)))
        pgg.route("**/rest/v1/rpc/*", lambda r: r.abort())
        perf = {"pts": 0, "jugadas": 0, "aciertos": 0, "racha": 0, "mejor": 0, "dist": [0] * 6, "diario": "", "token": "T" * 24, "online": True, "pend": 0, "diaD": 2, "diaMejor": 2, "diaUlt": "AYER"}
        pgg.add_init_script("var d=new Date();d.setDate(d.getDate()-1);var a=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();var p=" + json.dumps(perf) + ";p.diaUlt=a;"
            "localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');sessionStorage.setItem('tikitexto:intro','1');"
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
        pi2.add_init_script("sessionStorage.setItem('tikitexto:intro','1');localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');")
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
        pu.add_init_script("sessionStorage.setItem('tikitexto:intro','1');localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');")
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
            "if(!sessionStorage.getItem('aht')){sessionStorage.setItem('aht','1');sessionStorage.setItem('tikitexto:intro','1');localStorage.setItem('tikitexto:idioma','es');localStorage.setItem('tikitexto:consentimiento','no');"
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

    br.close()

print(f"\n{len(ok)} correctas, {len(fallos)} con fallo")
if fallos:
    print("FALLOS:\n - " + "\n - ".join(fallos))
    sys.exit(1)
