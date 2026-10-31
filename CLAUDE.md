# TIKITEXTO · guía del proyecto

Juego diario de fútbol (adivinar el nombre en 6 intentos) con ranking mundial. Idioma de trabajo: **español**.
Web: https://tikitexto.com · Repositorio: CiberYFG/tikitexto · Alojamiento: GitHub Pages (rama `main`).

## Estructura
- `index.html`: **todo el juego en un solo archivo** (HTML + CSS + JS + datos). No lo partas en varios sin que se pida. Excepción pedida: los diccionarios de idioma viven en `i18n/` (ver «Idiomas»).
- `sw.js`: service worker (red primero para la página, caché de respaldo). Si cambias la lista `SHELL` o quieres vaciar caché, sube `VERSION`.
- `manifest.webmanifest` e `icons/`: PWA instalable. Todas las rutas son **relativas**.
- `privacidad.html`: política de privacidad (borrador, sin datos personales del titular a propósito).
- `CNAME`, `googlee84deb3f856f064d.html`: dominio y verificación de Google Search Console. **No borrar.**
- `sitemap.xml`, `robots.txt`: SEO.
- `tests/check_site.py` + `.github/workflows/comprobar-sitio.yml`: comprobación automática cada 6 h (solo lectura).

## Reglas
1. **Nunca** usar la palabra "Wordle" ni nombres derivados (…dle) como referencia al juego, en ningún sitio (código, textos, README, commits). Los nombres de jugadores/equipos que acaben en "dle" no cuentan.
2. Antes de editar: `git pull`. Un commit por cambio, con mensaje claro. Subir a `main` publica la web en 1-2 minutos: probar antes.
3. No romper juegos, diseño ni archivos existentes. Comprobar que el JS compila y, si se puede, probar en un navegador.
4. Las referencias a clubes/jugadores son solo texto. **No** usar escudos, fotos ni logos (derechos de autor).
5. Si se añaden anuncios o cookies no técnicas: actualizar `privacidad.html` y `cookies.html` y añadir antes un aviso de consentimiento. La medición de visitas **sin cookies** (Cloudflare Web Analytics, token público al final de `index.html`) está **activa por defecto** con aviso informativo (`#cmp`, clave `tikitexto:consentimiento` = `si`/`no`; `tikitexto:sin-medicion=1` equivale a `no`) y se puede desactivar (opt-out) desde «Configurar cookies» (`#abrirCookies`). No convertirla en obligatoria (cookie wall no válida). Cualquier otra analítica requiere actualizar los textos legales. Antes de AdSense hará falta una CMP certificada por Google (TCF) y actualizar los textos legales. Contacto público: admin.tikitexto@gmail.com (no publicar nombre del titular salvo obligación legal).
7. Seguridad: `index.html`, páginas legales y `tools/seo.py` llevan una meta CSP (+ referrer). Si se añade un dominio externo (scripts, conexiones), ampliar la CSP en esos tres sitios. Los textos del banner están en `i18n/fuente.txt`.
6. No subir secretos. La URL y la clave **pública** (publishable) de Supabase están en `index.html` a propósito; la `service_role` jamás.

## Curiosidades (contenido)
- `tools/curiosidades.py` genera `curiosidades/` y `{en,pt,fr,it,de}/curiosidades/` (índice, `campeones/`, `ligas/`, `trofeos/`) en los 6 idiomas (textos en `tools/cur_tr/<idioma>.py`, con `hreflang`), ilustraciones SVG propias (sin fotos ni escudos). No editar a mano esos `index.html`; los datos están en el script. Tras cambiarlo: ejecutarlo y luego `tools/seo.py` (sitemap). Revisar siempre los datos con fuentes oficiales antes de publicar.

- En `index.html`, la sección `.curio` («Para leer · no es un juego», estilo editorial) va justo debajo de `.info` y enlaza a las curiosidades (los enlaces `a[data-curio]` se prefijan con el idioma). La descripción de la web menciona historia, datos y estadísticas; si se cambia, actualizar `fuente.txt` y `tools/seo.py`.

## Ranking (Supabase)
- Tabla `jugadores` con RLS sin políticas; todo pasa por funciones RPC (`reclamar_nombre`, `registrar_acierto`, `ranking_top`, `recuperar_cuenta`, `eliminar_cuenta`).
- El SQL (`ranking-supabase.sql`) **no está en el repositorio**: lo guarda el titular. Pedirlo antes de tocar el servidor; cualquier cambio de SQL lo ejecuta él en Supabase → SQL Editor → Run.
- Una cuenta por dispositivo/navegador, con código de recuperación. El filtro de nicknames existe en cliente y en servidor.

## Probar en local
`python -m http.server 8000` en la raíz y abrir http://localhost:8000/ .
Tests: `BASE_URL=http://localhost:8000/ SKIP_RANKING=1 python tests/check_site.py` (requiere `pip install playwright` y `playwright install chromium`).

## Idiomas (es, en, pt-BR, fr, it, de)
- El juego está escrito en **español** (idioma base). Selector de idioma: botón 🌐 en la portada y enlace en el pie; la primera visita obliga a elegir. Se guarda en `localStorage` (`tikitexto:idioma`); al cambiarlo la página se recarga (se descarta la partida en curso). También vale `?lang=xx` en la URL.
- **Fuente de las traducciones: `i18n/fuente.txt`** (español ||| en ||| pt ||| fr ||| it ||| de; líneas `P` = patrones con `$1`/`$2`; líneas `N` = nombres de respuesta localizados). Tras editarlo: `python3 tools/i18n.py` genera `i18n/en.js`, `pt.js`, `fr.js`, `it.js`, `de.js` (se suben al repo). Solo se descarga el del idioma elegido (el español no descarga nada).
- El script «IDIOMAS» de `index.html` traduce el DOM con un observador. Si falta una entrada se muestra el español. **Regla: todo texto nuevo de interfaz (o pista nueva) necesita su línea en `fuente.txt` en los 5 idiomas**; si lleva números o nombres dinámicos, un patrón `P`. `data-no-t` evita traducir un elemento. `TIKI.t()` / `TIKI.nombre()` / `TIKI.locale` están disponibles en el script principal.
- Los nombres de jugadores no se traducen. Páginas legales: solo en español, con una nota multilingüe arriba.
- El filtro de nicknames del cliente incluye términos de los 6 idiomas; el del servidor (SQL) lo mantiene el titular.

## SEO
- `tools/seo.py` genera las páginas de búsqueda (`en/`, `pt/`, `fr/`, `it/`, `de/` y `adivina-el-jugador/`, `-equipo/`, `-seleccion/`, `-entrenador/`, `-estadio/`) y `sitemap.xml` (con `hreflang`). Ejecutarlo tras tocar textos o añadir modos/idiomas; no editar a mano esos `index.html`.
- También genera guías por modo en inglés (`en/guess-the-player/`…) y alemán (`de/fussballer-raten/`…); su contenido está en `tools/seo_en_de.py` y llevan `hreflang` es/en/de.
- Los botones de esas páginas enlazan a `../?lang=xx&modo=yy` (el juego arranca directamente ese modo).
- `index.html` lleva título/descripción optimizados, `hreflang`, datos estructurados (WebSite, WebApplication, FAQPage) y un bloque visible «¿Qué es TIKITEXTO?» con modos y preguntas frecuentes. Si se cambia el título o la descripción, añadir su traducción a `fuente.txt`.
- Evitar repetir palabras clave sin sentido: Google penaliza el relleno; mantener textos naturales.
- Pruebas: `tests/check_site.py` (3d idiomas, 3e páginas de búsqueda y enlaces directos). Se fijan en español salvo en esas secciones.

## Alcance internacional
- `icons/og-image.png` (1200×630, propia, sin escudos ni fotos) es la imagen al compartir en redes; va en `og:image`/`twitter:image` (portada, `tools/seo.py`, `tools/curiosidades.py`) con `summary_large_image`.
- Las páginas y descripciones en inglés dicen «football (soccer)» a propósito, para búsquedas de EE. UU. Mantener el texto natural.
- Botón «Instalar la app» (`#instalarCaja`/`#instalarApp`): oculto hasta que el navegador lanza `beforeinstallprompt`; sin cookies ni datos. Sus textos están en `fuente.txt`.
- Al acertar, vibración corta si el móvil la permite y no se pidió «reducir movimiento».

## Ajustes y estadios de EE. UU.
- Botón ⚙ (`#botonAjustes`) abre el panel de ajustes: idioma, sonido y vibración. Se guardan en `localStorage` `tikitexto:ajustes` (`{sonido,vibracion}`); la API es `TIKI.ajustes` (`sonido()`, `vibracion()`, `vibrar()`). Todo sonido o vibración nuevo debe respetarla.
- Estadios: zona `us` (10 estadios de EE. UU.) y modo `estadios_us`; `mu` también la incluye. Pistas traducidas en `fuente.txt`.

## Ahorcado TIKITEXTO (modo especial)
- Tarjeta `.ah-card` en la portada (encima de NOVEDAD), pantalla propia `#pantallaAhorcado`, lógica en el bloque «AHORCADO TIKITEXTO» de `index.html` (`abrirAhorcado`, `ahLetra`, `ahFin`, `TUT_AH`). Enlace directo: `?modo=ahorcado`.
- 5 fallos, sin pistas, 50 jugadores en `AH_JUGADORES` (nombres con tildes; se juega sobre A–Z; un hueco = espacio entre palabras). Cada 3 victorias seguidas, +1 tikitexto (`AH_PARA_TIKI`). Mejor racha en `perfil().nv.a`; tutorial visto en `perfil().nv.tut.ahorcado`.
- Título y dibujo «arcoíris» con `filter: hue-rotate` (clases `.ah-arco`, `.ah-svg`); respeta `prefers-reduced-motion`, sonido y vibración de ajustes.
- Textos nuevos en `i18n/fuente.txt`; tests en `tests/check_site.py` (3k).

## Invitado, nickname e intro
- **Sin cuenta se juega como invitado** (perfil local con clave `""`; `esInvitado()`, `tieneCuenta()` es verdadero para invitados). El nickname se pide con `pedirNickname()` cuando el invitado llega a 1, 4 y 10 tikitextos (`NICK_UMBRALES`), desde «Ver ranking» (`#botonNick`) o desde Ajustes. El modal `#modalCuenta` se puede cerrar (X / Esc) para invitados.
- Al crear la cuenta, el perfil de invitado se hereda (`aceptarCuenta(..., heredar)`): estadísticas, récords y tikitextos (hasta 10 se envían al servidor con `pend`).
- **No hay pantalla «guarda tu código»**: el código de recuperación se ve en Ajustes → «Mi cuenta» → «¿Cuál es mi código?» (`TIKI.cuenta`, definido en el script principal) y en el ranking (`#botonCodigo`).
- Intro: arranca sola (`.intro--play` en el HTML), dura ~1 s, sin sonido ni «Toca para empezar»; un toque la salta; se ve una vez por sesión. Primera visita: tutorial obligatorio (`PRIMERA_VEZ`).
- Tests: `tests/check_site.py` 3l.
