# TIKITEXTO · guía del proyecto

Juego diario de fútbol (adivinar el nombre en 6 intentos) con ranking mundial. Idioma de trabajo: **español**.
Web: https://tikitexto.com · Repositorio: CiberYFG/tikitexto · Alojamiento: GitHub Pages (rama `main`).

## Estructura
- `index.html`: **todo el juego en un solo archivo** (HTML + CSS + JS + datos). No lo partas en varios sin que se pida.
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
5. Si se añaden anuncios o cookies no técnicas: actualizar `privacidad.html` y `cookies.html` y añadir antes un aviso de consentimiento. Ya hay medición de visitas **sin cookies** (Cloudflare Web Analytics, token público al final de `index.html`; se puede desactivar con `tikitexto:sin-medicion` en `localStorage`). Cualquier otra analítica requiere actualizar los textos legales.
6. No subir secretos. La URL y la clave **pública** (publishable) de Supabase están en `index.html` a propósito; la `service_role` jamás.

## Ranking (Supabase)
- Tabla `jugadores` con RLS sin políticas; todo pasa por funciones RPC (`reclamar_nombre`, `registrar_acierto`, `ranking_top`, `recuperar_cuenta`, `eliminar_cuenta`).
- El SQL (`ranking-supabase.sql`) **no está en el repositorio**: lo guarda el titular. Pedirlo antes de tocar el servidor; cualquier cambio de SQL lo ejecuta él en Supabase → SQL Editor → Run.
- Una cuenta por dispositivo/navegador, con código de recuperación. El filtro de nicknames existe en cliente y en servidor.

## Probar en local
`python -m http.server 8000` en la raíz y abrir http://localhost:8000/ .
Tests: `BASE_URL=http://localhost:8000/ SKIP_RANKING=1 python tests/check_site.py` (requiere `pip install playwright` y `playwright install chromium`).
