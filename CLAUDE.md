# TIKITEXTO · guía del proyecto

**Desde el 1-nov-2026 TIKITEXTO se presenta como una base de datos y curiosidades del fútbol (historia, récords y rankings con fuentes) que además tiene una sección de juegos interactivos** (adivinar el nombre en 6 intentos, ahorcado, etc., con ranking mundial). No volver a llamarlo «juego diario» en portada, título, meta, JSON-LD, manifest ni FAQ. Idioma de trabajo: **español**.
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
5. Si se añaden anuncios o cookies no técnicas: actualizar `privacidad.html` y `cookies.html` y añadir antes un aviso de consentimiento. La medición de visitas **sin cookies** (Cloudflare Web Analytics, token público al final de `index.html`) está **activa por defecto** con aviso informativo (`#cmp`, clave `tikitexto:consentimiento` = `si`/`no`; `tikitexto:sin-medicion=1` equivale a `no`) y se puede desactivar (opt-out) desde «Configurar cookies» (`#abrirCookies`). No convertirla en obligatoria (cookie wall no válida). Cualquier otra analítica requiere actualizar los textos legales. Antes de AdSense hará falta una CMP certificada por Google (TCF) y actualizar los textos legales. Contacto público: admin.tikitexto@gmail.com. Titular identificado como **Yago Fernández Galán** en `aviso-legal.html`, `privacidad.html` y `sobre-tikitexto.html` (con publicidad hay actividad económica y la LSSI art. 10 exige identificar al titular; «Yago» o «Yago Fernández» no bastan para identificarlo). **Pendiente del titular:** domicilio a efectos de notificaciones y NIF (hoy se ofrecen «por correo a quien los solicite»); conviene consultarlo con una gestoría antes de activar anuncios.
7. Seguridad: `index.html`, páginas legales y `tools/seo.py` llevan una meta CSP (+ referrer). Si se añade un dominio externo (scripts, conexiones), ampliar la CSP en esos tres sitios. Los textos del banner están en `i18n/fuente.txt`.
6. No subir secretos. La URL y la clave **pública** (publishable) de Supabase están en `index.html` a propósito; la `service_role` jamás.

## Curiosidades (contenido)
- `tools/curiosidades.py` genera `curiosidades/` y `{en,pt,fr,it,de}/curiosidades/` (índice, `campeones/`, `ligas/`, `trofeos/`) en los 6 idiomas (textos en `tools/cur_tr/<idioma>.py`, con `hreflang`), ilustraciones SVG propias (sin fotos ni escudos). No editar a mano esos `index.html`; los datos están en el script. Tras cambiarlo: ejecutarlo y luego `tools/seo.py` (sitemap). Revisar siempre los datos con fuentes oficiales antes de publicar.

- `tools/curiosidades_datos.py` genera 9 páginas de **récords y rankings con fuentes** (+ índice `curiosidades/datos/`) solo en **es y en** (slugs distintos por idioma; hreflang es/en/x-default corregido con `alinear()`): goleadores de Champions, Mundial y selecciones, partidos con la selección, Balón de Oro, entrenadores con más Champions, Eurocopa, Pichichi, Bota de Oro. Cada una lleva fecha de los datos, enlace a la fuente (webs oficiales/Al Jazeera) y botón de jugar. Orden: `curiosidades.py` → `curiosidades_datos.py` → `seo.py` (el sitemap las importa). Para actualizar: cambiar los datos del script y la fecha, y regenerar. Verificar con fuentes antes de publicar. Test 3n.

- En `index.html`, la sección `.curio` («Para leer · no es un juego», estilo editorial) va **antes** de `.info` (cuadro azul intenso con rayos y botones de cristal, tema claro/oscuro) y enlaza a las curiosidades (los enlaces `a[data-curio]` se prefijan con el idioma). La descripción de la web menciona historia, datos y estadísticas; si se cambia, actualizar `fuente.txt` y `tools/seo.py`.

## Huecos de anuncios (aún sin anuncios)
- Hay **huecos vacíos y ocultos** (`.hueco`, no cargan nada externo): portada (`--medio` tras curiosidades, `--pie`, laterales `--lat` ≥1300 px, `--ancla` inferior con ✕) y páginas de curiosidades/datos (laterales ≥1360 px, uno cada 2 secciones `h2` o cada 3 `.entrada` — función `con_huecos` en `tools/curiosidades.py` —, uno al final y un ancla). Ver dónde irían: `?huecos=1` (se guarda en `tikitexto:huecos`; `?huecos=0` lo quita). Test 3o.
- **5-nov-2026 (decisión del titular, solicitud de AdSense en curso):** `aviso-legal.html`, `privacidad.html`, `cookies.html` y el aviso de visitas **ya no mencionan anuncios ni publicidad** (para no contradecir la solicitud). **Antes de activar ningún anuncio hay que volver a añadir** los apartados de publicidad/cookies publicitarias y el consentimiento. Se mantienen la meta `google-adsense-account`, `ads.txt` y los huecos ocultos. Test 3t lo vigila. Antes de activarlos falta: CMP certificada de Google (Funding Choices, se crea en el panel de AdSense), `ads.txt` con el ID de editor, ampliar la CSP, y revisar el aviso legal (con ingresos puede exigirse identificar al titular, LSSI art. 10).
- AdSense: todas las páginas llevan `<meta name="google-adsense-account" content="ca-pub-3562310629171137">` (verificación sin cargar nada) y existe `ads.txt` en la raíz. **No** se ha puesto el `<script async src="…adsbygoogle.js…">`: cargaría Google en todas las visitas sin consentimiento. Se añadirá solo con la CMP certificada (y ampliando la CSP).
- **No poner ningún script de anuncios sin** CMP certificada (TCF) + actualizar `privacidad.html`/`cookies.html` + ampliar la CSP (regla 5/7). Después, mostrar los huecos con `html.huecos` solo si hay consentimiento y rellenarlos.
- Curiosidades rediseñadas (misma tipografía que el juego, cabecera azul con rayos, barra superior con «Jugar» y botón claro/oscuro `data-tema-btn` que usa `tikitexto:tema`, JSON-LD Article). Fotos opcionales por slug en `img/curiosidades/` + `creditos.json` (ver `LEEME.md`; solo libres, sin escudos/logos/jugadores). En la portada la sección `.curio` va **antes** de «¿Qué es TIKITEXTO?»; el enlace IV (datos) solo es/en (`data-solo-es-en`).

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
- **No hay vibración** en ningún sitio (se quitó a petición del titular); no volver a añadirla.

## Ajustes y estadios de EE. UU.
- Botón ⚙ (`#botonAjustes`) abre el panel de ajustes: idioma, sonido y «Mi cuenta». Se guardan en `localStorage` `tikitexto:ajustes` (`{sonido}`); la API es `TIKI.ajustes.sonido()`. Todo sonido nuevo debe respetarla.
- Estadios: zona `us` (10 estadios de EE. UU.) y modo `estadios_us`; `mu` también la incluye. Pistas traducidas en `fuente.txt`.

## Ahorcado TIKITEXTO (modo especial)
- Tarjeta `.ah-card` en la portada (encima de NOVEDAD), pantalla propia `#pantallaAhorcado`, lógica en el bloque «AHORCADO TIKITEXTO» de `index.html` (`abrirAhorcado`, `ahLetra`, `ahFin`, `TUT_AH`). Enlace directo: `?modo=ahorcado`.
- 5 fallos, sin pistas, 50 jugadores en `AH_JUGADORES` (nombres con tildes; se juega sobre A–Z; un hueco = espacio entre palabras). Cada 3 victorias seguidas, +1 tikitexto (`AH_PARA_TIKI`). Mejor racha en `perfil().nv.a`; tutorial visto en `perfil().nv.tut.ahorcado`.
- Título y dibujo «arcoíris» con `filter: hue-rotate` (clases `.ah-arco`, `.ah-svg`); respeta `prefers-reduced-motion` y el sonido de ajustes.
- Textos nuevos en `i18n/fuente.txt`; tests en `tests/check_site.py` (3k).

## Invitado, nickname e intro
- **Sin cuenta se juega como invitado** (perfil local con clave `""`; `esInvitado()`, `tieneCuenta()` es verdadero para invitados). El nickname se pide una sola vez con `pedirNickname()` tras el primer acierto (`NICK_UMBRALES`), y siempre se puede elegir desde el aviso gris «Estás jugando como invitado» (`#chipInvitado`, lleva a Ajustes), desde «Ver ranking» (`#botonNick`) o desde Ajustes. El modal `#modalCuenta` se puede cerrar (X / Esc) para invitados.
- Al crear la cuenta, el perfil de invitado se hereda (`aceptarCuenta(..., heredar)`): estadísticas, récords y tikitextos (hasta 10 se envían al servidor con `pend`).
- **No hay pantalla «guarda tu código»**: el código de recuperación se ve en Ajustes → «Mi cuenta» → «¿Cuál es mi código?» (`TIKI.cuenta`, definido en el script principal) y en el ranking (`#botonCodigo`).
- Intro: arranca sola (`.intro--play` en el HTML), dura ~1,5 s, sin sonido ni «Toca para empezar»; un toque la salta; se ve una vez por sesión.
- Tutorial general: ya no sale al entrar; sale (y se puede cerrar) la primera vez que se toca un juego (`tutorialPendiente`, `PRIMERA_VEZ`, en `iniciarPartida`). Primera visita = solo selector de idioma.
- Tests: `tests/check_site.py` 3l.

## ¿Cuánto costó? (margen)
- Margen para dar por bueno un importe, en millones (`nvMargen`): hasta 25 → ±4 · 25-50 → ±5 · 50-100 → ±10 · más de 100 → ±15. Textos del tutorial y del panel actualizados en `fuente.txt`.
- «¿Quién tiene más tarjetas?»: cifras **exactas** de carrera (`NV_TARJ`: nombre, perfil, amarillas, rojas, grupo P/D/M/F). Fuente: fichas de Soccerway (filas «Total» de Liga, Copas, Competiciones internacionales y Selección, sumadas; 31-10-2026); Messi y Cristiano según Planet Football/Transfermarkt. Soccerway puede quedarse corto con temporadas antiguas: por eso solo hay jugadores modernos y se excluyeron Benzema, Salah y los veteranos. Un duelo es válido solo si la diferencia es ≥ 15 tarjetas y ≥ 25 % del mayor (`nvParValido`); el 50 % de las rondas intentan misma posición (`nvElegirPar`). Para añadir jugadores: buscar «soccerway player <nombre> stats», abrir la ficha y sumar las dos últimas cifras de cada fila Total (amarillas, rojas). Tests: `check_site.py` 3m.

## Historia de la Champions y los Mundiales · «Sobre TIKITEXTO» · menores (1-nov-2026)
- `tools/hist_data.py` (datos) + `tools/curiosidades_historia.py` generan 4 páginas (solo es/en): `curiosidades/champions-20-anos/` (en: `champions-league-last-20-finals`) con las finales 2007-2026 (marcador, sede, asistencia, goleadores, curiosidad) y `curiosidades/mundiales-edicion-por-edicion/` (en: `world-cups-edition-by-edition`) con los 23 Mundiales. Orden: `curiosidades.py` → `curiosidades_datos.py` → `curiosidades_historia.py` → `seo.py`. Fuentes: UEFA y FIFA; los detalles que no se pudieron contrastar con la fuente se redactaron con cautela. Actualizar tras cada final/Mundial.
- La portada pone la sección `.curio` (azul con rayos) **justo bajo el título**, antes de «Juegos interactivos» (`h2.inicio__juegos`). Los items nuevos llevan `data-curio-en` para el slug en inglés y `data-solo-es-en`.
- `sobre-tikitexto.html` (quiénes somos, fuentes, correcciones) enlazada desde el pie, las páginas legales, las curiosidades y el sitemap.
- Menores: para **crear cuenta hay que tener ≥14 años** (art. 7 LOPDGDD); sin cuenta se puede jugar como invitado y leer curiosidades. Aviso en el modal de cuenta, `privacidad.html#menores` y `aviso-legal.html` deben decir lo mismo. Si hay anuncios, no personalizados a menores.

## Refuerzo de búsquedas / FAQ (4-nov-2026)
- `C.faq(L, pares)` en `tools/curiosidades.py` pinta «Preguntas frecuentes» (details/summary) + JSON-LD FAQPage, solo es/en. En datos: clave `faq=[(preg_es, preg_en, resp_es, resp_en)]` en cada entrada; en historia: llamada directa. Hecho en Balón de Oro (actualizado con Kane 2026 y puntos de Messi), Mundiales y Champions 20 años. Pendiente: resto de páginas de datos, ligas y trofeos.
- Balón de Oro 2026: Kane (26-oct-2026, London Palladium; Mbappé 2.º, Yamal 3.º). Revisar cada octubre.

## Refuerzo de búsquedas, ronda 2 (6-nov-2026)
- Search Console (primeros días): clics solo en inglés por «most ballon d'or»/«how many ballon d'or has ronaldo won»; impresiones sin clic en «datos curiosos de Messi», «liga más antigua del mundo», «trofeo más importante del fútbol», Bota de Oro, goleadores del Mundial, partidos con la selección, ganadores de Champions en it/de/pt.
- FAQ (`C.faq`, JSON-LD) añadido a **todas** las páginas de datos (clave `faq` en cada entrada), ligas, trofeos, campeones (es/en; pt/fr/it/de con `faq_otros`/`faq2` en `curiosidades.py`) y a los temas (`FAQ_TEMAS` en `curiosidades_temas.py`). Los artículos admiten clave `faq`.
- Messi, Cristiano, Real Madrid y Balón de Oro: títulos reescritos («Datos curiosos de…») y más hechos (`_EXTRA` al final de `temas_data.py`; Messi 15).
- 4 artículos nuevos en `tools/articulos_d.py`: liga más antigua del mundo, trofeos más importantes, países con más Balones de Oro, Messi o Cristiano en números (16 artículos en total; `articulos_meta.py`). El ahorcado lleva «ahorcado de fútbol» en el título.
- Pendiente: contrastar con fuentes oficiales las cifras de los artículos nuevos y de `historias_data.py`; revisar Search Console (pestaña Páginas, posición) en 3-5 días.

## Historias y rincón de los peques (5-nov-2026, solo español)
- `tools/historias_data.py` (6 colecciones, 58 historias cortas: Mundiales, orígenes, sorpresas, récords raros, mitos, leyendas) + `tools/peques_data.py` (chistes, adivinanzas, trabalenguas, verdadero/falso, 3 sopas de letras) + `tools/curiosidades_extra.py` generan `historias/` y `peques/` (hub + páginas, hreflang solo es, `data-solo-es` en portada, grupos en `curiosidades/`). Orden: … → `curiosidades_articulos.py` → `curiosidades_extra.py` → `seo.py` → `csp.py`.
- La sopa de letras usa un script en línea (clic en primera y última letra; huella con `csp.py`). Las palabras van sin tildes; si cambias `SOPAS`, regenera. Contenido infantil: sin datos personales ni enlaces externos. Datos redactados con información pública: revisar cifras antes de añadir. Test 3t.
- `C.faq(L, pares, titulo=None, ld=True)`: con `ld=False` no emite JSON-LD (chistes, adivinanzas). Se corrigió el cierre `</summary>` que faltaba.

## Curiosidades por temas (2-nov-2026)
- `tools/temas_data.py` (datos) + `tools/curiosidades_temas.py` generan 12 páginas es/en (Champions, Mundial, Real Madrid, Barça, LaLiga, Premier League, Messi, Cristiano, Balón de Oro, Eurocopa, Man. United, Liverpool) + índice `curiosidades/curiosidades-por-temas/` (en: `football-trivia-by-topic`). Cada tema: lista de `hechos` (título es/en, texto es/en) y fuentes. Orden: `curiosidades.py` → `curiosidades_datos.py` → `curiosidades_historia.py` → `curiosidades_temas.py` → `seo.py`.
- Cifras contrastadas el 2-nov-2026 (palmarés de LaLiga, LaLiga 2025-26, palmarés del Real Madrid; prensa para el título del Arsenal 2025-26). Las cifras que cambian cada temporada (títulos, goleadores) hay que revisarlas tras cada temporada/Mundial. Test 3p.
- Para añadir un tema: añadir un `dict` a `TEMAS` (≥7 hechos), regenerar y ampliar el `12` de la tarjeta de portada/test si cambia.


## Linterna de Navidad (10-nov-2026, tiempo limitado; antes «Linterna maldita» de Halloween)
- Juego propio (no usa el motor de adivinar nombres): pantalla `#pantallaLinterna`, bloque «LINTERNA DE NAVIDAD» de `index.html` (`abrirLinterna`, `lzNoche`, `lzBucle`, `lzIntentar`, `lzFin`). A oscuras en un bosque nevado, la linterna sigue al dedo/ratón; hay que tocar EN ORDEN las letras del nombre de una leyenda (pool `LEYENDAS`, nombres de 4-9 letras, pista = «🎁 Pista del regalo: …»). Pila de 70 s compartida: error −5 s, 2 muñecos de nieve ⛄ que drenan ×3.5 si se iluminan, «Destello» (−8 s, 1 por noche), +15 s por nombre. +1 tikitexto al encontrar el 2.º nombre de la partida (`LZ_PARA_TIKI`, una vez por partida; la 3.ª noche cuenta para el récord) (sin cambios de servidor). Récord en `perfil().nv.l`. `TIKI.lz` solo para tests.
- El aspecto sale de `LZ_TEMAS[tema]` (`clase`, `titulo`, `enemigo`, `susto`, `decor`, `intro`) y de las variables CSS `--lz-*` bajo `html.nd` (paleta azul noche, rojo y dorado; decorado `.nd-deco`). Para otra temporada (p. ej. Halloween 2027): añadir un tema a `LZ_TEMAS`, un bloque `html.<clase>`, cambiar la tarjeta/textos de `fuente.txt` y `ND_FIN`.
- Tarjeta `#ndCard` (`data-navidad`) con cuenta atrás `#ndCuenta`. **Caduca con `ND_FIN`** (hoy 6-ene-2027 23:59, Reyes; `window.TIKI_ND_FIN`): la tarjeta se oculta y `?modo=navidad` no abre nada. Para ampliar basta cambiar la fecha. Para retirar el modo: quitar tarjeta, `.nd-deco`, pantalla, bloque JS/CSS, textos de `fuente.txt` y test 3q (o dejar el código para la próxima temporada). Textos en los 6 idiomas en `fuente.txt` (regenerar con `python3 tools/i18n.py`).

## Artículos largos de análisis (3-nov-2026)
- `tools/articulos_a.py`, `articulos_b.py`, `articulos_c.py` (textos propios, solo español; cada artículo: slug, título, descripción, resumen, secciones, fuentes, relacionados) + `tools/curiosidades_articulos.py` generan `articulos/` (índice) y `articulos/<slug>/` (16 artículos de 700-1.400 palabras (los 4 últimos en `articulos_d.py`, con clave `faq`)). Orden: `curiosidades.py` → `curiosidades_datos.py` → `curiosidades_historia.py` → `curiosidades_temas.py` → `curiosidades_articulos.py` → `seo.py` → `csp.py` (el sitemap los importa). Solo hreflang es; en la portada el enlace lleva `data-solo-es` (se oculta en otros idiomas).
- El artículo `letras-mas-frecuentes-nombres-futbolistas` usa **estadística propia** calculada sobre los 368 jugadores de `JUGADORES` (3-nov-2026); si cambia la lista, recontar y actualizar cifras. Los demás están redactados con información pública (Bosman, IFAB, FIFA, UEFA, France Football…): **revisar cifras con fuentes antes de dar por definitivos** los datos que cambian (Balón de Oro, Bota de Oro, reglamento del Mundial 2026). No copiar texto de otras webs. Test 3r.

- **13-nov-2026:** `tools/articulos_i.py` (6 artículos más, 49 en total: entrenador y cuerpo técnico, calendario, historia de la Champions, tecnología, balón parado, psicología). Se añadieron a `META`, a `CATS` y a los imports de `curiosidades_articulos.py`/`articulos_meta.py`. El test exige ≥650 palabras por artículo, 6 temas y 49 artículos (`check_site.py` 3r).

## Reestructura de curiosidades (3-nov-2026)
- La caja azul `.curio` de la portada es clicable entera (va al `href` de `.curio__todo a`, con prefijo de idioma); los enlaces y botones internos siguen funcionando.
- `curiosidades/` (es/en) se agrupa por secciones de color (`.gr`, `CSS_TC` en `tools/curiosidades.py`): artículos (solo es), récords, historia, temas, campeones/ligas/trofeos. pt/fr/it/de mantienen 3 tarjetas de color. **Se eliminó el bloque duplicado «Sigue leyendo»** (`pie(L, extra, con_seguir=False)` en índice y artículos).
- `tools/articulos_meta.py` da color (claro/oscuro) y emoji a cada artículo: hero, secciones numeradas y tarjetas «Te puede interesar». Un artículo nuevo debe añadirse a `META`.
- **Fuentes visibles:** no citar Wikipedia como fuente en páginas, textos ni i18n (decisión del titular, 3-nov-2026: poco profesional y riesgo para la monetización por falta de originalidad). Enlazar a fuentes oficiales (UEFA.com, FIFA.com, LaLiga.com, webs de clubes, France Football, RSSSF) y **contrastar las cifras con ellas** antes de publicar.

## Seguridad / CSP con huellas (3-nov-2026)
- Observatory de Mozilla daba D (35): falta de cabeceras HTTP (HSTS, X-Frame-Options, X-Content-Type-Options: imposibles en GitHub Pages sin Cloudflare delante) y CSP con `unsafe-inline`. Lo de la CSP se arregló: **ningún script lleva `unsafe-inline`; cada script en línea se autoriza con su huella sha256** en la meta CSP.
- **Tras tocar cualquier `<script>` en línea de cualquier página (o regenerar páginas), ejecutar `python3 tools/csp.py`** (último paso del orden: … → `seo.py` → `csp.py`). `python3 tools/csp.py --check` solo comprueba. Si se olvida, el script queda bloqueado y la página deja de funcionar. Test 3s.
- `index.html` lleva un script anti-clickjacking (sustituye a `X-Frame-Options`, que la meta no puede dar). Las metas CSP de los generadores (`seo.py`, `curiosidades.py`) siguen con `unsafe-inline` y `csp.py` las reescribe.
- **Hecho el 3-nov-2026:** el dominio está en Cloudflare (nameservers `elsa`/`mike`; DNS en Porkbun solo como registrador; SSL Full (strict)). Cabeceras: HSTS 6 meses (sin includeSubDomains ni preload) y `nosniff` desde SSL/TLS → Edge Certificates; `X-Frame-Options: DENY` con una Response Header Transform Rule. Observatory: **A+ (115)**. Los registros A/CNAME/TXT `_acme-challenge` no se tocan. No activar la configuración automática de Web Analytics (ya está el script a mano: contaría doble).

## Auditoría y refuerzo de calidad para AdSense (8-nov-2026)
- Auditoría completa: 0 referencias a Wikipedia/Wordle, fuentes externas solo oficiales (UEFA, FIFA, LaLiga, IFAB, RSSSF, France Football…), nicknames del ranking escapados con `esc()`, `?inv=` validado con regex, CSP con huellas sha256. Se corrigieron 5 enlaces rotos en los artículos nuevos (`relac` con prefijo `curiosidades/` de más en `articulos_d.py`).
- `tools/articulos_e.py` (6 artículos nuevos de explicación, 22 en total): reglas básicas, posiciones, formaciones tácticas, árbitros y señales, historia del balón y formatos de competición. Cifras de reglas del IFAB/FIFA/UEFA; revisar si cambian las Reglas de Juego (cada verano) o los formatos (Champions, Mundial).
- `tools/seo_extra.py`: bloque «Consejos para jugar mejor» + «Para leer mientras tanto» en las páginas de cada juego (es y en) y en el ahorcado. `seo.py` lo antepone a «Más modos para jugar». Las rutas de es son relativas a la raíz y las de en, relativas a `en/curiosidades/`.
- `sobre-tikitexto.html`: nuevas secciones «Cómo elaboramos el contenido» (política editorial) y «Qué no hacemos».
- `404.html`: página de error con navegación (noindex). La reescribe `csp.py` como al resto.
- Test 3u en `check_site.py`: sin enlaces internos rotos en ninguna página HTML, artículos nuevos con FAQ y +700 palabras, 404 y bloques de las páginas de juego.

## Aviso de cookies compartido + Google Tag Manager con consentimiento (8-nov-2026)
- `cmp.js` (raíz) es el aviso de cookies y medición de **todas** las páginas: botones «Rechazar todo» / «Configurar» / «Aceptar todo» (los dos primeros con el mismo tamaño), textos en 6 idiomas dentro del propio archivo (ya no están en `fuente.txt`) y las mismas ids (`#cmp`, `#cmpAceptar`, `#cmpRechazar`, `#cmpMed`, `#cmpGa`…). `tools/csp.py` añade `<script src="/cmp.js" defer>` a cada página con CSP, así que sigue siendo el último paso de la regeneración.
- Elecciones en `localStorage`: `tikitexto:consentimiento` (si/no, Cloudflare sin cookies, activo salvo rechazo) y `tikitexto:analitica` (si/no, Google). **El código de Google Tag Manager (`GTM-WN89TQCM`) está en el `<head>` de todas las páginas** (lo inyecta `tools/csp.py`, constante `GTM_TAG`, porque Analytics exige verlo en el HTML) con **Consent Mode: `analytics_storage`/`ad_*` DENEGADOS por defecto**. `cmp.js` (`GTM_ID`) solo envía `gtag('consent','update',{analytics_storage:'granted'})` si `analitica` = si; al retirarlo se deniega, se borran `_ga*` y se recarga. Dentro de GTM, exigir `analytics_storage` en la etiqueta de GA4 (Configuración de consentimiento) para que no haya ni pings sin cookies antes de aceptar. Al cargar el script, Google recibe IP y navegador aunque no se acepte (dicho en `cookies.html` y `privacidad.html`). Quien aceptó solo la medición antigua vuelve a ver el aviso una vez. `window.TIKI_CMP.abrir()` abre la configuración (`#abrirCookies` o `[data-abrir-cookies]`).
- Dentro de GTM usar solo etiquetas integradas (GA4): las de HTML personalizado las bloquea la CSP (sin `unsafe-inline`/`unsafe-eval`). La CSP admite `googletagmanager.com`, `*.google-analytics.com` y `*.analytics.google.com` (`tools/csp.py`: `EXTRA`, `CONNECT_EXTRA`, `IMG_EXTRA`).
- `cookies.html`, `privacidad.html` y `sobre-tikitexto.html` actualizados. Siguen sin mencionar anuncios (test 3t).
- Test 3f reescrito (Google no carga antes de decidir, aceptar/rechazar todo, borrado de cookies, aviso en otras páginas e idiomas).


## Portada en portal Juegos / Saber (11-nov-2026)
- La portada (`#portal`) muestra dos cuadros: **Juegos** (RGB, `#portalJuegos`, abre la vista de juegos `.vj` con `#juegos` en la URL y botón `#volverPortal`) y **Saber** (azul con rayos, enlaza a `curiosidades/` y lleva chips con enlaces reales a artículos, historias, peques, datos, temas, Champions, Mundiales, campeones, ligas y trofeos; `data-solo-es`/`data-solo-es-en` y prefijo de idioma por `data-curio`). Los bloques de la portada marcados `.vp` se ven solo en el portal; `.vj` solo en la vista de juegos (`html.vista-j`, `sessionStorage tikitexto:vista`; `?modo=` y `#juegos` la activan). **No se cambió ninguna URL.**
- Los tests arrancan con la vista de juegos activa (init script); los de portal usan `#volverPortal`. Textos en `fuente.txt` (6 idiomas).

## Buscador, tarjeta Juegos de fútbol y Saber por temas (11-nov-2026)
- **Buscador global:** `tools/buscador.py` genera `buscador.json` (título, descripción y títulos de sección de cada página del `sitemap.xml`, más el ahorcado y el modo diario) y `buscador.js` (raíz) pinta la caja y los resultados (sin tildes, por idioma, sin servidor, con sus textos en 6 idiomas dentro del propio archivo). Se activa con `<div class="bus" data-buscador></div>` + `<script src="/buscador.js" defer>` (portada, `curiosidades/` y `articulos/`). **Orden completo: … → `seo.py` → `csp.py` → `buscador.py`** (usa el sitemap ya sin páginas noindex). Si añades páginas, regenerar. Test 3v.
- **Tarjeta Juegos:** noche de estadio (campo con líneas neón RGB, focos, balón que rueda y bota, chispas, borde conic RGB); todo CSS/SVG propio, respeta `prefers-reduced-motion`. Clases `.jg-*` en `index.html`.
- **Saber por temas:** `curiosidades/` y `articulos/` muestran primero los temas (`<details class="tema" name="…">`, acordeón exclusivo, cerrados al entrar); hay que pulsar el tema para ver sus tarjetas. Los 49 artículos se agrupan en 6 categorías (`CATS` en `tools/articulos_meta.py`: un artículo nuevo hay que añadirlo a `META` **y a una categoría**). Helpers `tema()`, `tema_enlace()`, `cats_articulos()` en `tools/curiosidades.py`. El contenido sigue en el HTML (indexable).

## Chapas TIKITEXTO (12-nov-2026, modo especial)
- Juego propio con `<canvas>` (pantalla `#pantallaChapas`, tarjeta `.ch-card` con `data-chapas` en la vista de juegos, bloque «CHAPAS TIKITEXTO» de `index.html`: `abrirChapas`, `chMenu`, `chEmpezar`, `chBucle`, `chSala`). Enlace directo: `?modo=chapas`. 4 chapas por equipo, un turno = mover UNA chapa (arrastrar hacia atrás y soltar); gana el primero a 3 goles o, tras 12 turnos cada uno, quien tenga más (empate → gol de oro). Campo lógico 400×640 (tú abajo, rival arriba).
- Física propia en `chPaso` (círculos con choques elásticos, postes, rebotes; dt 0,5) que **también usa la máquina**: `chPensar` simula candidatos con `chSimular` (fácil: apunta al balón con error; normal: heurística + ruido; difícil: más candidatos y casi sin error). Con tiempos de ~9 ms por jugada.
- Progreso en `perfil().nv.c` (`gan`, `per`, `emp`, `gol`, `golc`, `par`, `racha`, `mejor`, `gast`, `des`, `eq`, `niv`); tutorial en `nv.tut.chapas`. Cada 3 victorias, +1 tikitexto (`CH_PARA_TIKI`). **Sala de estilos** (`CH_EST`): chapa, balón, estela, césped y ambiente (día, noche, atardecer, neón, nieve, lluvia). Cada estilo se desbloquea por victorias/goles/partidas/racha (`u: ["gan",n]`…) o se **compra con tikitextos sin tocar el ranking**: el saldo es `perfil().pts − nv.c.gast` (`chDisponibles`). Todo se dibuja con código (sin escudos, fotos ni logos). Para añadir un estilo: entrada en `CH_EST`, su nombre en `fuente.txt` y, si es de un tipo nuevo, su dibujo (`chDibujarChapa/Balon/Estela`, `chFondo`).
- Textos en los 6 idiomas en `fuente.txt` (con patrones `P` para «Gana $1 partidos», «Cuesta $1 ⚡», «🎁 Estilo desbloqueado: $1»…). `TIKI.chapas` solo para tests. Test 3w. Está en el buscador (`tools/buscador.py`).

## Chapas v2 (12-nov-2026)
- Chapas ×0,8 (`CH_RC=20`), rozamiento alto (balón 0,955 / chapa 0,935 por frame), el campo termina en la línea (`CH_LX/CH_LY/CH_MX/CH_MY`; gol cuando el balón cruza la línea entero). Chapas con relieve 3D (`chDibujarChapa`) y banderas de selecciones (`chBandera`, clave `b` en `CH_EST.chapa`; `rv:1` = el rival juega de oscuro para no confundirse).
- Sonidos suaves sin saturar (`chTono`, `chSonGolpe`, `chSonTension`, `chSonSuelta`); respetan `TIKI.ajustes.sonido()`.
- **+1 tikitexto por cada victoria** (ya no cada 3). Marcador LED `.ch-led` (ids `chMy`, `chMr`, `chLadoYo`, `chLadoRv`).
- Estilos: 3 «GRATIS» (`u:["f"]`, insignia verde `.ch-gratis`) por categoría, estrellas de dificultad (`chTier`), nuevas estelas (hojas, confeti, rayos, oro) y ambientes (niebla, tormenta, aurora). Personalización rápida en el menú (`chRapido`). Textos nuevos en `fuente.txt`.

## Chapas v3 (12-nov-2026)
- **Mejor de 3** (`CH_META=2`): a 2 goles gana; con 1-1 (o empate tras `(sin límite de turnos; hay reloj de 3 min)) empieza la **muerte súbita** (`chMuerte`: viñeta roja pulsante, latido, aviso, LED en rojo). Partidas de ~1-2 min: 3 pasos de física por frame, IA más rápida (260 ms), pausa de gol 55.
- Chapas a ×0,7 del tamaño original (`CH_RC=17.5`); rozamiento algo menor (balón 0,965 / chapa 0,95).
- **Formaciones** (`CH_EST.formacion`, campo `p` = 4 posiciones; el rival usa una al azar, espejada). **Saque suave** (`CH_VSAQUE=10`, solo el primer tiro tras cada saque): se verificó por simulación (141 000 tiros, todas las combinaciones de formaciones) que no hay gol directo; si cambias formaciones o la física, repetir con `TIKI.chapas.simular` (el test 3w lleva una comprobación).
- Desbloqueo por fases (`t` = 1/2/3 estrellas): banderas por **victorias 3/5/10** (reparto aleatorio fijo), estelas por **partidas jugadas 6/10/20**, balones por **goles 5/10/20**, césped, ambiente y formaciones con **tikitextos 3/5/10**. 3 estilos GRATIS por categoría.
- Sonidos con ruido filtrado (`chRuido`): toc de madera, golpe sordo, campanilla de poste, ovación y roce de red al marcar. Porterías con red de rombos y la red se agita al marcar (`ch.redT`).

## Chapas v4 (12-nov-2026)
- Rozamiento menor (balón 0,973 / chapa 0,962). **Reloj LED de 1:00 (antes 3:00)** (`ch.resto`, `chReloj`): al llegar a 0 (cuando nada se mueve) gana quien vaya por delante; con empate, muerte súbita. Ya no hay límite de turnos (`CH_TURNOS=99`).
- Formaciones revisadas: todas llevan una pieza en x=200 cerca de su portería (tiro recto al centro/±30 px no entra; comprobado por simulación a 10-26 de velocidad). `CH_VSAQUE=8` (con el rozamiento nuevo, 9 ya dejaba goles directos en el saque; con 8: 0 de 141 120 tiros). Repetir ambas simulaciones si se tocan formaciones o física.

## Juegos de letras / Juegos dinámicos (12-nov-2026)
- La vista de juegos (`.vj`) tiene dos pestañas (`.vj-sel`, botones `[data-grupo-btn]`, paneles `.vj-grupo[data-grupo]`): **Tikitexto · juegos de letras** (`#grupoLetras`: diario, ahorcado, «Elige un modo») y **Dinámicos** (`#grupoDinamicos`: Linterna de Navidad, Chapas, NOVEDAD —tarjetas/fichajes— y una tarjeta «Próximamente» para los futuros juegos, p. ej. 3D). La elección se guarda en `sessionStorage tikitexto:grupo`; `?modo=chapas|navidad|tarjetas|fichajes` abre «Dinámicos». **Un juego nuevo va en el panel que le toca**; los tests que pulsan tarjetas dinámicas deben cambiar antes de pestaña (`[data-grupo-btn=dinamicos]`). Textos en `fuente.txt`.

## Efectos en las pestañas de juegos + reloj de turno de Chapas (12-nov-2026)
- La pestaña «Aa Tikitexto» pasó a llamarse **«Letras»** («Adivina y descifra»). **El fondo de la página no se anima**: los efectos van dentro de los propios botones de pestaña (`canvas.vj-tab__fx`): letras de colores que caen en «Letras» y explosiones saturadas cuyos aros empujan partículas ajenas (choques → chispas) en «Dinámicos». Se pausan fuera de la vista de juegos y se desactivan con `prefers-reduced-motion`.
- Chapas: **10 s por turno** (`CH_TT`, `ch.tt`): aro alrededor del balón que se cierra; a ≤5 s pasa a naranja y se degrada a rojo; al agotarse se pierde el turno. Se pausa con cualquier `.modal` abierto. El marcador LED es `position: sticky` (`top: 66px`, bajo la cabecera). `CH_VSAQUE=8` (verificado por simulación).


## Penaltis 3D (12-nov-2026, modo especial en «Dinámicos»)
- Excepción a «todo en index.html»: `penaltis.js` (módulo ES, se importa al abrir), `penaltis.css` y `lib/three.module.min.js` (three.js r170, licencia en `lib/three.LICENSE.txt`). Todo con CSP `script-src 'self'`; sin recursos externos. Lanzador `abrirPenaltis()` en `index.html`; enlace directo `?modo=penaltis`; `TIKI.penaltis` solo para tests (`juego()` devuelve `{S,K,E,empezar,…}`). Tarjeta `.pn-card[data-penaltis]`.
- Tanda de 5 + muerte súbita; tiras apuntando con un toque + 1 barra de fuerza y paras con vista de portero (6 cuadrantes). Solo horizontal en móvil (aviso de girar), pantalla completa en PC. Dificultades facil/normal/dificil/leyenda (`DIF`). +1 tikitexto por tanda ganada; estadísticas en `perfil().nv.p`.
- **Cuerpos (13-nov-2026):** malla única y continua con esqueleto (`SkinnedMesh`), sin modelos externos ni licencias: `tools/cuerpo_bake.mjs` (Node) define el cuerpo con volúmenes anatómicos (SDF con mezcla suave), lo triangula con marching cubes y guarda `lib/cuerpo/{jugador,portero,jugador-lo}.bin` (pos, normales, región, oclusión ambiental, pesos de huesos). **Para cambiar proporciones o ropa: editar el script y ejecutar `node tools/cuerpo_bake.mjs` (~20 s) y subir los `.bin`.** `penaltis_cuerpo.js` los carga (`precargar()` antes de abrir el juego), tiñe por regiones con los colores del equipo (camisa/aros/rayas, pantalón, medias, botas, guantes, pelo) y monta los huesos con los mismos pivotes que usan las poses (`cadera`, `torso`, `cabeza`, `brI/brD.{s,e}`, `pI/pD.{h,k}`). Cara = decals (ojos, cejas, boca) pegados a la cabeza; dorsal = nombre de usuario (o «INVITADO nnn») y el 7. Estadio cerrado (4 gradas + esquinas), vallas LED nítidas (`texPublicidad`, 4096 px). Sin escudos ni fotos.
- **Tiro (13-nov-2026):** se apunta tocando/clicando la portería (rayo de cámara al plano z=0, `apunteDe`/`fijaApunte`, `S.sub` = apuntar → fuerza → tirado) y hay UNA barra de fuerza (rojo→verde, verde de ±4 % que pasa muy rápido; marcador no lineal `|s|^0.55`). Error de puntería ∝ distancia al verde (`lanzarTuyo`). Si el portero llega (`llegaP`), se lanza al punto exacto del balón (parada visible). Guantes en primera persona hechos desde cero en `mano()` (palma extruida, dedos de 3 falanges, pulgar, velcro). Culos y mofletes esféricos eliminados en `cuerpo_bake.mjs`.
- **Portero (13-nov-2026):** 6 cuadrantes (arriba/abajo × izquierda/centro/derecha tal como se ven), sin botón de parar: se elige tocando la zona o con Q W E / A S D (`elegirCelda`). Si el balón acaba en ese cuadrante (35 cm de margen en los bordes) es parada. Barra de fuerza pequeña con degradado.
- Textos en `fuente.txt` (6 idiomas). Test 3x. Está en el buscador.
