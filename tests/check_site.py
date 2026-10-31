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
    api = ctx.request

    print("1) Archivos publicados")
    for ruta in ["", "manifest.webmanifest", "sw.js", "privacidad.html", "aviso-legal.html", "cookies.html", "accesibilidad.html", "sitemap.xml", "robots.txt",
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
    check("título correcto", "<title>TIKITEXTO" in html)
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
