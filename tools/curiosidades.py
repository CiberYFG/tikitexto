#!/usr/bin/env python3
"""Genera las páginas de «Curiosidades del fútbol» (curiosidades/, /campeones/, /ligas/, /trofeos/).
Ilustraciones: SVG propios (sin fotos ni escudos). Ejecutar: python3 tools/curiosidades.py  y luego tools/seo.py (sitemap)."""
import os, html, json
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOM = "https://tikitexto.com/"
FECHA = "31 de octubre de 2026"
e = html.escape

CSP = ("<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; "
       "style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; media-src 'self' data:; "
       "connect-src 'self' https://dvybttkqvrpzrvpnszxc.supabase.co https://cloudflareinsights.com; "
       "object-src 'none'; base-uri 'self'; form-action 'self'\">\n<meta name=\"referrer\" content=\"strict-origin-when-cross-origin\">\n")
CSS = """:root { color-scheme: light; --fondo: #eef3fc; --texto: #12203a; --suave: #55657f; --acento: #1747d6; --acento2: #e8a500; --caja: #ffffff; --linea: rgba(40,70,140,.16); --sombra: 0 1px 2px rgba(20,50,130,.06), 0 10px 26px rgba(20,60,160,.09); --serif: ui-sans-serif, system-ui, -apple-system, "Segoe UI Variable Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
:root[data-tema="oscuro"] { color-scheme: dark; --fondo: #070d1c; --texto: #e9eefb; --suave: #9fb0d2; --acento: #6b9bff; --acento2: #ffd84d; --caja: #0f1932; --linea: rgba(150,180,255,.16); --sombra: 0 1px 2px rgba(0,0,0,.4), 0 10px 26px rgba(0,0,0,.35); }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--fondo); color: var(--texto); font: 17px/1.7 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; -webkit-font-smoothing: antialiased; }
main { max-width: 760px; margin: 0 auto; padding: 0 18px 60px; }
a { color: var(--acento); text-underline-offset: 3px; }
.barra { position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--fondo) 86%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--linea); }
.barra div { max-width: 760px; margin: 0 auto; padding: 8px 18px; display: flex; align-items: center; gap: 10px; }
.barra .marca { font-weight: 900; letter-spacing: .03em; text-decoration: none; color: var(--texto); font-size: 1.05rem; }
.barra .marca i { font-style: normal; color: var(--acento); }
.barra .miga { font-size: .84rem; color: var(--suave); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 6px; }
.barra .miga a { color: var(--suave); }
.barra .tema { border: 1px solid var(--linea); background: var(--caja); color: var(--texto); width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1rem; }
.barra .cta { background: linear-gradient(135deg, #ffd84d, #ffb400); color: #1a1500; font-weight: 800; font-size: .86rem; padding: 8px 15px; border-radius: 999px; text-decoration: none; white-space: nowrap; box-shadow: 0 4px 12px rgba(255,180,0,.35); }
.hero { position: relative; isolation: isolate; overflow: hidden; display: grid; grid-template-columns: 1fr 92px; gap: 18px; align-items: center; margin: 22px 0 8px; padding: 30px 26px; border-radius: 26px; color: #fff;
  background: radial-gradient(120% 100% at 50% 0%, #2f7bff 0%, #1448e0 45%, #0a24a8 100%); box-shadow: 0 18px 40px rgba(20,72,224,.32), inset 0 0 0 1px rgba(255,255,255,.22); }
:root[data-tema="oscuro"] .hero { background: radial-gradient(120% 100% at 50% 0%, #2455d6 0%, #12338f 48%, #081447 100%); }
.hero::before { content: ""; position: absolute; z-index: -1; left: 50%; top: 40%; width: 230%; aspect-ratio: 1; transform: translate(-50%,-50%); background: repeating-conic-gradient(from 0deg, rgba(255,255,255,.17) 0 5deg, rgba(255,255,255,0) 5deg 14deg); -webkit-mask-image: radial-gradient(circle, #000 8%, transparent 62%); mask-image: radial-gradient(circle, #000 8%, transparent 62%); animation: rayos 60s linear infinite; }
@keyframes rayos { to { transform: translate(-50%,-50%) rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .hero::before { animation: none; } html { scroll-behavior: auto; } }
.hero svg { width: 92px; height: 92px; color: #fff; background: rgba(255,255,255,.16); border-radius: 26px; padding: 16px; border: 1px solid rgba(255,255,255,.4); }
.etiqueta { margin: 0 0 6px; font-size: .72rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: #ffd84d; }
h1 { font-family: var(--serif); font-size: clamp(1.8rem, 5.2vw, 2.6rem); margin: 0; line-height: 1.1; font-weight: 900; letter-spacing: -.02em; text-shadow: 0 2px 14px rgba(0,20,120,.5); }
h2 { font-family: var(--serif); font-size: 1.5rem; font-weight: 850; letter-spacing: -.01em; margin: 44px 0 10px; line-height: 1.2; padding-left: 14px; border-left: 6px solid var(--acento); }
h3 { font-family: var(--serif); font-size: 1.12rem; font-weight: 800; margin: 0 0 4px; }
p { margin: 0 0 14px; }
.fecha { color: var(--suave); font-size: .88rem; margin: 6px 0 18px; }
.hero .fecha { color: rgba(255,255,255,.82); margin: 8px 0 0; }
.caja { background: var(--caja); border-radius: 18px; padding: 18px 20px; margin: 18px 0; border: 1px solid var(--linea); box-shadow: var(--sombra); font-size: 1.05rem; line-height: 1.65; border-left: 6px solid var(--acento2); }
.foto { margin: 22px 0; } .foto img { width: 100%; height: auto; border-radius: 16px; display: block; } .foto figcaption { font-size: .8rem; color: var(--suave); margin-top: 6px; }
.tarjetas { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin: 18px 0; }
.tarjeta { display: block; background: var(--caja); border-radius: 20px; padding: 18px; text-decoration: none; color: inherit; border: 1px solid var(--linea); box-shadow: var(--sombra); transition: transform .15s, border-color .15s, box-shadow .15s; }
.tarjeta:hover, .tarjeta:focus-visible { border-color: var(--acento); outline: none; transform: translateY(-3px); box-shadow: 0 14px 30px rgba(20,72,224,.22); }
.tarjeta svg { width: 54px; height: 54px; color: var(--acento); }
.tarjeta b { display: block; margin-top: 8px; font-family: var(--serif); font-weight: 800; font-size: 1.08rem; line-height: 1.25; }
.tarjeta span { color: var(--suave); font-size: .88rem; }
.entrada { display: grid; grid-template-columns: 78px 1fr; gap: 16px; background: var(--caja); border-radius: 20px; padding: 18px; margin: 16px 0; border: 1px solid var(--linea); box-shadow: var(--sombra); }
.entrada .ano { text-align: center; }
.entrada .ano svg { width: 56px; height: 56px; color: var(--acento); }
.entrada .ano b { display: block; font-size: 1.02rem; color: var(--acento2); font-weight: 900; }
.entrada p { margin: 6px 0; }
.faq details { background: var(--caja); border: 1px solid var(--linea); border-radius: 14px; padding: 12px 16px; margin: 8px 0; box-shadow: var(--sombra); }
.faq summary { cursor: pointer; font-weight: 800; font-size: 1rem; }
.faq details[open] summary { color: var(--acento); margin-bottom: 6px; }
.faq details p { margin: 6px 0 2px; line-height: 1.6; }
.dato { background: color-mix(in srgb, var(--acento) 10%, transparent); border-left: 4px solid var(--acento); padding: 10px 14px; border-radius: 0 12px 12px 0; font-size: .95rem; margin: 12px 0 0; }
@media (max-width: 560px) { th, td { padding: 8px 8px; font-size: .86rem; } .entrada { grid-template-columns: 1fr; } .entrada .ano { display: flex; align-items: center; gap: 10px; text-align: left; } .hero { grid-template-columns: 1fr; padding: 24px 20px; } .hero svg { display: none; } .barra .miga { display: none; } .barra div { justify-content: space-between; } }
table { width: 100%; border-collapse: separate; border-spacing: 0; background: var(--caja); border-radius: 18px; overflow: hidden; font-size: .94rem; border: 1px solid var(--linea); box-shadow: var(--sombra); font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 9px 13px; border-bottom: 1px solid var(--linea); vertical-align: top; }
th { color: #fff; font-weight: 800; font-size: .76rem; letter-spacing: .07em; text-transform: uppercase; background: linear-gradient(135deg, #1747d6, #0a2fb0); border-bottom: 0; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:nth-child(even) td { background: color-mix(in srgb, var(--acento) 4%, transparent); }
tbody tr:hover td { background: color-mix(in srgb, var(--acento) 11%, transparent); }
tbody tr:nth-child(-n+3) td:first-child { font-weight: 900; color: var(--acento2); }
tbody tr:first-child td { font-weight: 700; }
.tabla-scroll { overflow-x: auto; margin: 14px 0; border-radius: 18px; }
.indice { display: flex; flex-wrap: wrap; gap: 8px; font-size: .9rem; margin: 14px 0 0; }
.indice a { background: var(--caja); border: 1px solid var(--linea); border-radius: 999px; padding: 5px 14px; text-decoration: none; font-weight: 600; }
.indice a:hover { border-color: var(--acento); background: color-mix(in srgb, var(--acento) 10%, var(--caja)); }
.ilustra { display: block; width: 100%; height: auto; margin: 20px 0; border-radius: 18px; background: var(--caja); border: 1px solid var(--linea); color: var(--acento); box-shadow: var(--sombra); }
.legal-nav { margin: 40px 0 0; padding-top: 18px; border-top: 1px solid var(--linea); font-size: .88rem; display: flex; flex-wrap: wrap; gap: 6px 16px; }
.legal-nav a { color: var(--suave); }
a:focus-visible, button:focus-visible { outline: 3px solid var(--acento2); outline-offset: 2px; }
.jugar { display: inline-block; margin: 14px 0; padding: 15px 28px; background: linear-gradient(135deg, #2f7bff, #1448e0); color: #fff; font-weight: 800; border-radius: 16px; text-decoration: none; box-shadow: 0 8px 22px rgba(20,72,224,.4); transition: transform .15s; }
.jugar:hover { transform: translateY(-2px); }
.mas { margin-top: 44px; } .mas h2 { margin-top: 0; }
/* Huecos de anuncios: ocultos mientras no haya anuncios. Para ver dónde irían: ?huecos=1 (y ?huecos=0 para quitar). */
.hueco { display: none; }
html.huecos .hueco { display: flex; align-items: center; justify-content: center; flex-direction: column; margin: 22px 0; min-height: 110px; border: 2px dashed var(--linea); border-radius: 14px; color: var(--suave); font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; background: color-mix(in srgb, var(--acento2) 5%, transparent); }
html.huecos .hueco--lat { display: none; }
@media (min-width: 1360px) { html.huecos .hueco--lat { display: flex; position: fixed; top: 96px; width: 160px; min-height: 600px; margin: 0; }
  html.huecos .hueco--izq { left: calc(50% - 380px - 190px); } html.huecos .hueco--der { right: calc(50% - 380px - 190px); } }
html.huecos .hueco--ancla { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; margin: 0; border-radius: 0; border-width: 2px 0 0; min-height: 60px; background: var(--fondo); }
html.huecos .hueco--ancla button { position: absolute; right: 8px; top: 6px; border: 0; background: var(--caja); color: var(--texto); border-radius: 50%; width: 26px; height: 26px; cursor: pointer; }
html.huecos body { padding-bottom: 64px; }
"""

COPA = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10h24v14c0 9-5 15-12 15s-12-6-12-15V10z"/><path d="M20 14h-8c0 9 4 14 10 15M44 14h8c0 9-4 14-10 15"/><path d="M32 39v10M22 54h20M26 49h12"/></svg>'
BALON = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="32" cy="32" r="22"/><path d="M32 22l9 7-3 11H26l-3-11 9-7z"/><path d="M32 22V10M41 29l12-4M38 40l7 10M26 40l-7 10M23 29l-12-4"/></svg>'
LIGA = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="14" width="48" height="36" rx="4"/><path d="M32 14v36M8 32h48"/><circle cx="32" cy="32" r="7"/><path d="M8 24h6v16H8M56 24h-6v16h6"/></svg>'
LIBRO = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14c8-3 16-3 22 2 6-5 14-5 22-2v36c-8-3-16-3-22 2-6-5-14-5-22-2V14z"/><path d="M32 16v36"/></svg>'
ESTADIO = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="32" cy="38" rx="24" ry="10"/><ellipse cx="32" cy="38" rx="12" ry="4"/><path d="M8 38V26c0-5 11-9 24-9s24 4 24 9v12"/></svg>'


CHAMPIONS = [(1956,"Real Madrid"),(1957,"Real Madrid"),(1958,"Real Madrid"),(1959,"Real Madrid"),(1960,"Real Madrid"),(1961,"Benfica"),(1962,"Benfica"),(1963,"Milan"),(1964,"Inter"),(1965,"Inter"),(1966,"Real Madrid"),(1967,"Celtic"),(1968,"Manchester United"),(1969,"Milan"),(1970,"Feyenoord"),(1971,"Ajax"),(1972,"Ajax"),(1973,"Ajax"),(1974,"Bayern de Múnich"),(1975,"Bayern de Múnich"),(1976,"Bayern de Múnich"),(1977,"Liverpool"),(1978,"Liverpool"),(1979,"Nottingham Forest"),(1980,"Nottingham Forest"),(1981,"Liverpool"),(1982,"Aston Villa"),(1983,"Hamburgo"),(1984,"Liverpool"),(1985,"Juventus"),(1986,"Steaua de Bucarest"),(1987,"Oporto"),(1988,"PSV Eindhoven"),(1989,"Milan"),(1990,"Milan"),(1991,"Estrella Roja"),(1992,"Barcelona"),(1993,"Olympique de Marsella"),(1994,"Milan"),(1995,"Ajax"),(1996,"Juventus"),(1997,"Borussia Dortmund"),(1998,"Real Madrid"),(1999,"Manchester United"),(2000,"Real Madrid"),(2001,"Bayern de Múnich"),(2002,"Real Madrid"),(2003,"Milan"),(2004,"Oporto"),(2005,"Liverpool"),(2006,"Barcelona"),(2007,"Milan"),(2008,"Manchester United"),(2009,"Barcelona"),(2010,"Inter"),(2011,"Barcelona"),(2012,"Chelsea"),(2013,"Bayern de Múnich"),(2014,"Real Madrid"),(2015,"Barcelona"),(2016,"Real Madrid"),(2017,"Real Madrid"),(2018,"Real Madrid"),(2019,"Liverpool"),(2020,"Bayern de Múnich"),(2021,"Chelsea"),(2022,"Real Madrid"),(2023,"Manchester City"),(2024,"Real Madrid"),(2025,"París Saint-Germain"),(2026,"París Saint-Germain")]
FINALES_RECIENTES = [(2026,"París Saint-Germain","Arsenal","1-1 (4-3 en penaltis)","Budapest"),(2025,"París Saint-Germain","Inter","5-0","Múnich"),(2024,"Real Madrid","Borussia Dortmund","2-0","Londres"),(2023,"Manchester City","Inter","1-0","Estambul"),(2022,"Real Madrid","Liverpool","1-0","París"),(2021,"Chelsea","Manchester City","1-0","Oporto"),(2020,"Bayern de Múnich","París Saint-Germain","1-0","Lisboa"),(2019,"Liverpool","Tottenham","2-0","Madrid"),(2018,"Real Madrid","Liverpool","3-1","Kiev"),(2017,"Real Madrid","Juventus","4-1","Cardiff"),(2016,"Real Madrid","Atlético de Madrid","1-1 (5-3 en penaltis)","Milán"),(2015,"Barcelona","Juventus","3-1","Berlín")]
MUNDIAL = [(1930,"Uruguay","Argentina","4-2","Uruguay"),(1934,"Italia","Checoslovaquia","2-1 (prórroga)","Italia"),(1938,"Italia","Hungría","4-2","Francia"),(1950,"Uruguay","Brasil","2-1 (liguilla final)","Brasil"),(1954,"Alemania Occidental","Hungría","3-2","Suiza"),(1958,"Brasil","Suecia","5-2","Suecia"),(1962,"Brasil","Checoslovaquia","3-1","Chile"),(1966,"Inglaterra","Alemania Occidental","4-2 (prórroga)","Inglaterra"),(1970,"Brasil","Italia","4-1","México"),(1974,"Alemania Occidental","Países Bajos","2-1","Alemania Occidental"),(1978,"Argentina","Países Bajos","3-1 (prórroga)","Argentina"),(1982,"Italia","Alemania Occidental","3-1","España"),(1986,"Argentina","Alemania Occidental","3-2","México"),(1990,"Alemania Occidental","Argentina","1-0","Italia"),(1994,"Brasil","Italia","0-0 (3-2 en penaltis)","Estados Unidos"),(1998,"Francia","Brasil","3-0","Francia"),(2002,"Brasil","Alemania","2-0","Corea del Sur y Japón"),(2006,"Italia","Francia","1-1 (5-3 en penaltis)","Alemania"),(2010,"España","Países Bajos","1-0 (prórroga)","Sudáfrica"),(2014,"Alemania","Argentina","1-0 (prórroga)","Brasil"),(2018,"Francia","Croacia","4-2","Rusia"),(2022,"Argentina","Francia","3-3 (4-2 en penaltis)","Catar"),(2026,"España","Argentina","1-0 (prórroga)","Estados Unidos, México y Canadá")]

LIGAS = [
 ("🏴","1888","Inglaterra · Football League y Premier League","La liga más antigua del mundo",
  ["El 17 de abril de 1888, en un hotel de Manchester, se fundó la <b>Football League</b> por iniciativa de William McGregor, directivo del Aston Villa. Cansado de que los clubes jugaran amistosos sueltos y sin calendario fijo, propuso una competición regular. Empezó con 12 equipos y ganó la primera edición el Preston North End, que no perdió ningún partido de liga (los llamados «Invencibles»).",
   "En 1992, los clubes de la primera división se separaron de la Football League y crearon la <b>Premier League</b>, con el objetivo de negociar por su cuenta los derechos de televisión. Su primera campeona fue el Manchester United en 1992-93."],
  "La Football League (1888) es la primera liga profesional de la historia y la Premier League es su evolución desde 1992."),
 ("🇪🇸","1929","España · La Liga","El campeonato nacional que empezó con diez equipos",
  ["Hasta 1929, el campeón de España se decidía en la Copa del Rey. La Real Federación Española de Fútbol impulsó un campeonato nacional de liga con formato de todos contra todos, y la primera temporada arrancó en febrero de 1929 con diez equipos en Primera: Arenas Club, Athletic Club, Atlético de Madrid, Barcelona, Espanyol, Europa, Racing de Santander, Real Madrid, Real Sociedad y Real Unión.",
   "El primer campeón fue el FC Barcelona. Hoy la competición se conoce como La Liga, organizada por la Liga Nacional de Fútbol Profesional (LaLiga), creada en 1984."],
  "Se jugó por primera vez en 1929 y su primer campeón fue el Barcelona."),
 ("🇮🇹","1898","Italia · Serie A","Un campeonato de un solo día en Turín",
  ["El primer campeonato italiano se disputó el 8 de mayo de 1898 en Turín, organizado por la Federación Italiana de Fútbol (entonces FIF): en una sola jornada, el Genoa se proclamó campeón. Durante décadas se jugó por eliminatorias y grupos regionales.",
   "La <b>Serie A</b> tal como la conocemos, con un grupo único de todos contra todos, empezó en la temporada 1929-30, y ese año el campeón fue el Ambrosiana (el actual Inter)."],
  "El primer torneo es de 1898; la Serie A con grupo único arrancó en 1929-30."),
 ("🇩🇪","1963","Alemania · Bundesliga","Nació para que Alemania subiera de nivel",
  ["Antes de 1963, el campeón alemán se decidía en una fase final entre campeones regionales. Tras el decepcionante papel de la selección en el Mundial de 1962, la federación (DFB) aprobó el 28 de julio de 1962 en Dortmund crear una liga profesional nacional. La Bundesliga echó a andar en agosto de 1963 con 16 clubes.",
   "El primer campeón fue el 1. FC Köln en 1963-64."],
  "La Bundesliga se aprobó en 1962 y empezó a jugarse en 1963."),
 ("🇫🇷","1932","Francia · Ligue 1","Del profesionalismo a la «Ligue 1»",
  ["El fútbol francés profesionalizó su campeonato en 1932, con el nombre de Division Nationale. La primera temporada (1932-33) la ganó el Olympique Lillois.",
   "El nombre actual, <b>Ligue 1</b>, se usa desde 2002, cuando se renombró la antigua Division 1."],
  "El campeonato profesional francés nació en 1932 y se llama Ligue 1 desde 2002."),
 ("🇵🇹","1934","Portugal · Primeira Liga","Del campeonato por copa a la liga",
  ["Portugal decidía antes a su campeón en el «Campeonato de Portugal», un torneo de eliminatorias. En 1934-35 se jugó por primera vez el Campeonato da Liga, un formato de liga todos contra todos, y lo ganó el FC Porto.",
   "Hoy se llama Primeira Liga y los llamados «tres grandes» (Benfica, Porto y Sporting) se reparten casi todos los títulos."],
  "La primera liga portuguesa se jugó en 1934-35 y la ganó el Oporto."),
 ("🇳🇱","1956","Países Bajos · Eredivisie","El profesionalismo llega tarde, pero con fuerza",
  ["Los Países Bajos tuvieron campeonato nacional desde finales del siglo XIX, pero el fútbol profesional no se autorizó hasta 1954. La Eredivisie («primera división de honor») nació en 1956-57 como primera liga profesional y su primer campeón fue el Ajax."],
  "La Eredivisie arrancó en 1956-57 con el Ajax como primer campeón."),
 ("🏴","1890","Escocia · Scottish Premiership","La liga que se creó en 1890",
  ["La Scottish Football League se fundó en 1890 y su primera temporada (1890-91) terminó con un reparto del título entre Dumbarton y Rangers. Se llama Scottish Premiership desde 2013."],
  "Una de las ligas más antiguas del mundo: 1890, con título compartido en su primera temporada."),
 ("🇧🇷","1971","Brasil · Brasileirão","Un país tan grande que tardó en tener una liga única",
  ["Por las enormes distancias, Brasil jugó durante décadas campeonatos estatales. En 1959 se creó la <b>Taça Brasil</b>, que ganó el Bahía, y en 1967 el torneo Roberto Gomes Pedrosa. En 1971 nació el Campeonato Brasileiro unificado, que ganó el Atlético Mineiro.",
   "En 2010, la federación (CBF) reconoció oficialmente como títulos brasileños los de la Taça Brasil y el Robertão."],
  "El Brasileirão unificado es de 1971, pero se reconocen títulos desde 1959."),
 ("🇦🇷","1891","Argentina · Primera División","La liga con raíces británicas",
  ["Los ingleses y escoceses que trabajaban en Buenos Aires llevaron el fútbol a finales del siglo XIX. El primer campeonato se jugó en 1891, y lo ganó el Old Caledonians. En 1893 se fundó la asociación que luego sería la AFA, de la mano del escocés Alexander Watson Hutton, considerado el «padre del fútbol argentino».",
   "El campeonato se profesionalizó en 1931."],
  "Primer campeonato en 1891; profesionalismo en 1931."),
 ("🇲🇽","1943","México · Liga MX","El campeonato profesional mexicano",
  ["México tuvo un campeonato aficionado desde 1902. En la temporada 1943-44 nació la liga profesional y la ganó el Asturias, un club hoy desaparecido. Desde entonces, la Liga MX ha cambiado varias veces de formato (torneos Apertura y Clausura, liguilla…)."],
  "La liga profesional mexicana empezó en 1943-44."),
 ("🇺🇸","1996","Estados Unidos · MLS","Una liga nacida gracias a un Mundial",
  ["La Major League Soccer se fundó en 1993, como condición para que Estados Unidos organizara el Mundial de 1994. Su primer partido se jugó en 1996, con diez equipos, y su primer campeón fue el D.C. United.",
   "Desde entonces ha crecido hasta unos treinta clubes, incluyendo equipos de Canadá."],
  "Se fundó en 1993 y se estrenó en 1996, tras el Mundial de 1994."),
 ("🇯🇵","1993","Japón · J.League","Una liga profesional creada desde cero",
  ["Hasta los años 90, el fútbol japonés era semiprofesional. La J.League se fundó en 1991 y empezó a jugarse en 1993 con diez clubes. El primer campeón fue el Verdy Kawasaki (hoy Tokyo Verdy). Su creación impulsó el nivel del fútbol asiático y la clasificación de Japón a los Mundiales."],
  "Nacida en 1991 y estrenada en 1993, es el ejemplo de liga creada de la nada."),
]

TROFEOS = [
 ("🏆","1872","Inglaterra · FA Cup","La copa más antigua del mundo",
  ["Se creó por idea de Charles W. Alcock, secretario de la Football Association, tras el éxito de una copa escolar en Harrow. La primera final se jugó el 16 de marzo de 1872 en el Kennington Oval de Londres y la ganó el Wanderers por 1-0 al Royal Engineers.",
   "Es famosa por sus sorpresas: clubes de categorías inferiores pueden eliminar a los grandes."],"Primera final: 1872, Wanderers 1-0 Royal Engineers."),
 ("🏆","1960","Inglaterra · Copa de la Liga (League Cup)","Un torneo nuevo para llenar el calendario",
  ["Se creó en 1960-61 como competición paralela a la Football League. Al principio algunos grandes clubes la ignoraron, pero hoy es un título más. El primer campeón fue el Aston Villa."],"Primera edición: 1960-61, campeón Aston Villa."),
 ("🏆","1903","España · Copa del Rey","Nació como «Copa de la Coronación»",
  ["La primera edición, en 1903, se jugó para celebrar la coronación de Alfonso XIII y se llamó Copa de la Coronación. Ganó el Athletic Club al Madrid FC por 3-2. Ha tenido varios nombres según el momento político (Copa del Presidente, Copa del Generalísimo…) y hoy es la Copa del Rey.",
   "Hasta 1929 decidía al campeón de España, antes de que existiera La Liga."],"Primer ganador: Athletic Club, 1903."),
 ("🥇","1953","España · Trofeo Pichichi","El premio al máximo goleador",
  ["Lo entrega el diario Marca desde la temporada 1952-53 al máximo goleador de Primera División. Lleva el nombre de Rafael Moreno «Pichichi», delantero del Athletic Club de los años veinte. El primer ganador fue Telmo Zarra."],"Premio de Marca al máximo goleador, con el nombre de «Pichichi»."),
 ("🏆","1922","Italia · Coppa Italia","Nacida en 1922",
  ["La Coppa Italia se disputó por primera vez en 1921-22 y la ganó el Vado. Tuvo varias pausas y se juega con regularidad desde 1958. Es el torneo de eliminatorias del fútbol italiano."],"Primera Coppa Italia: 1922, campeón Vado."),
 ("🛡️","1924","Italia · Scudetto","El escudo tricolor del campeón",
  ["Desde 1924, el campeón italiano luce en la camiseta un escudo con los colores de la bandera, el Scudetto. De ahí viene la expresión «ganar el Scudetto» para decir que se ha ganado la liga."],"Se usa desde 1924 como símbolo del campeón de Italia."),
 ("🏆","1935","Alemania · DFB-Pokal","La copa que nació con otro nombre",
  ["Nació en 1935 con el nombre de Tschammer-Pokal. El primer ganador fue el 1. FC Nürnberg. Tras la guerra se retomó con su nombre actual de DFB-Pokal. Su final se juega en el Estadio Olímpico de Berlín desde 1985."],"Primera edición: 1935, 1. FC Nürnberg."),
 ("🥣","1949","Alemania · La Meisterschale","El plato de plata del campeón",
  ["El campeón alemán recibe desde 1949 la Meisterschale, una bandeja de plata de unos once kilos. Se entregó por primera vez al VfR Mannheim. Hoy la recibe el campeón de la Bundesliga."],"Una gran bandeja de plata, no una copa."),
 ("🏆","1918","Francia · Copa de Francia","Una copa en honor a Charles Simon",
  ["Se creó en 1917-18, con la guerra de fondo, por iniciativa de Henri Delaunay y en homenaje a Charles Simon, dirigente fallecido en combate. El primer campeón fue el Olympique de Pantin. Henri Delaunay, secretario de la federación, sería después el impulsor de la Eurocopa."],"Primera Copa de Francia: 1918, Olympique de Pantin."),
 ("🏆","1939","Portugal · Taça de Portugal","La copa lusa",
  ["La primera edición oficial se jugó en 1938-39 y la ganó la Académica de Coimbra. La final se disputa en el Estadio Nacional de Jamor, cerca de Lisboa."],"Primera Taça de Portugal: 1938-39, Académica de Coimbra."),
 ("🏆","1989","Brasil · Copa de Brasil","Para que los clubes pequeños tengan opciones",
  ["Se creó en 1989 para dar a los equipos de todo el país, no solo a los grandes de Río y São Paulo, la posibilidad de jugar una competición nacional y clasificarse para torneos continentales. El primer campeón fue el Grêmio."],"Nació en 1989 y su primer campeón fue el Grêmio."),
 ("🏆","1960","Sudamérica · Copa Libertadores","El gran torneo de clubes de América del Sur",
  ["La primera Copa Libertadores se jugó en 1960, y la ganó el Peñarol de Uruguay. Se creó como competición continental inspirada en la Copa de Europa de clubes. Lleva el nombre de los libertadores de América del Sur."],"Primera edición: 1960, campeón Peñarol."),
 ("🏆","1913","Estados Unidos · U.S. Open Cup","La copa más antigua del país",
  ["Es el torneo más antiguo del fútbol estadounidense: la primera edición fue en 1913-14 y la ganó el Brooklyn Field Club. Desde 1999 lleva el nombre de Lamar Hunt, pionero del fútbol en Estados Unidos y fundador de la MLS."],"Primera edición: 1913-14; hoy se llama Lamar Hunt U.S. Open Cup."),
 ("🏆","1996","Estados Unidos · MLS Cup","La final de la liga estadounidense",
  ["La MLS decide su campeón con una fase final de eliminatorias, y la primera MLS Cup se jugó en 1996 con el D.C. United como campeón. El trofeo se llama Philip F. Anschutz Trophy."],"Primera MLS Cup: 1996, D.C. United."),
 ("🏆","2012","Argentina · Copa Argentina","Una copa de todos los niveles",
  ["La Copa Argentina existió con distintos formatos desde 1969, pero se relanzó en 2011-12 con equipos de todas las categorías. El primer campeón de esa nueva etapa fue Boca Juniors."],"Relanzada en 2011-12, la ganó primero Boca Juniors."),
 ("🌍","1930","Mundial · Copa Jules Rimet y trofeo actual","El trofeo que cambió",
  ["El primer trofeo del Mundial se llamó Copa Jules Rimet, en honor al presidente de la FIFA que impulsó el torneo en 1930. Brasil se quedó con ella en propiedad al ganar su tercer Mundial en 1970. Fue robada en 1966 y encontrada por un perro llamado Pickles, y en 1983 volvió a ser sustraída y no se recuperó.",
   "Desde 1974 se entrega el trofeo actual, diseñado por el escultor italiano Silvio Gazzaniga, de oro de 18 quilates. Los campeones no se lo quedan: reciben una réplica."],"Copa Jules Rimet (1930-1970) y trofeo de la FIFA (desde 1974)."),
 ("🏆","1956","Europa · Copa de Europa y Champions League","La «Orejona»",
  ["La Copa de Europa nació en 1955-56 por iniciativa del periodista francés Gabriel Hanot, del diario L'Équipe. El Real Madrid ganó las cinco primeras ediciones. El trofeo actual, apodado «la Orejona» por sus asas, se utiliza desde 1967.",
   "Antes, el club que la ganaba tres veces seguidas o cinco en total se quedaba con el trofeo original; hoy recibe una réplica y una insignia especial."],"Lanzada en 1955-56, impulsada por Gabriel Hanot."),
 ("🥇","1956","Mundial · Balón de Oro","El premio creado por una revista",
  ["Lo creó en 1956 la revista France Football, de la mano de Gabriel Hanot. El primer ganador fue el inglés Stanley Matthews. Durante años solo lo podían ganar jugadores europeos, y desde 1995 puede ganarlo cualquier jugador del mundo."],"El primer Balón de Oro fue para Stanley Matthews (1956)."),
 ("🇪🇺","1960","Europa · Eurocopa","El sueño de Henri Delaunay",
  ["Henri Delaunay, secretario de la federación francesa y de la UEFA, propuso un torneo de selecciones europeas ya en los años veinte, pero no vio su primera edición, que se jugó en 1960 y ganó la Unión Soviética. El trofeo lleva su nombre."],"Primera Eurocopa: 1960, campeona la Unión Soviética."),
]


LANGS = ["es", "en", "pt", "fr", "it", "de"]
HREFLANG = {"es": "es", "en": "en", "pt": "pt-BR", "fr": "fr", "it": "it", "de": "de"}
NOMBRE_IDIOMA = {"es": "Español", "en": "English", "pt": "Português", "fr": "Français", "it": "Italiano", "de": "Deutsch"}
import importlib, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

UI_ES = {
 "back": "‹ Volver al juego", "crumb": "Curiosidades del fútbol", "checked": "Datos revisados el 31 de octubre de 2026",
 "play": "⚽ Juega a los juegos de fútbol de TIKITEXTO", "nav": ["Curiosidades", "Aviso legal", "Privacidad", "Cookies", "Accesibilidad", "Contacto"],
 "disc": "TIKITEXTO no está afiliado a clubes, jugadores, federaciones ni competiciones. Los nombres se usan solo como referencia informativa. Ilustraciones propias.",
 "nutshell": "En una frase:",
 "idx_title": "Curiosidades del fútbol: campeones, ligas y trofeos | TIKITEXTO",
 "idx_desc": "Historia y datos del fútbol: ganadores de la Champions League y del Mundial, cómo se fundaron las ligas más famosas y cómo nacieron los trofeos más importantes.",
 "idx_h1": "Curiosidades del fútbol",
 "idx_caja": 'Datos, historia y números del fútbol mundial. Si te gusta, pon a prueba lo que sabes en <a href="{play}">TIKITEXTO</a>.',
 "cards": [("Campeones", "Ganadores de la Champions League y del Mundial, con finales y marcadores."),
           ("Fundación de las ligas", "Cómo nacieron 13 ligas del mundo: años, primeros campeones y curiosidades."),
           ("Trofeos", "La historia de las copas y premios de España, Inglaterra, Italia, Alemania, Francia, Portugal, Brasil, EE. UU. y Argentina.")],
 "latest_h": "Lo último",
 "latest": '<b>Mundial 2026:</b> España, campeona tras vencer 1-0 a Argentina en la prórroga de la final del 19 de julio en el MetLife Stadium. <b>Champions 2025-26:</b> el PSG revalidó el título al ganar al Arsenal en los penaltis (1-1, 4-3) el 30 de mayo en Budapest. <a href="{champ}">Ver todos los campeones</a>.',
 "ch_title": "Ganadores de la Champions League y del Mundial: lista completa | TIKITEXTO",
 "ch_desc": "Todos los campeones de la Champions League (Copa de Europa) y de la Copa del Mundo, con finales recientes, marcadores y cuántos títulos tiene cada club y selección.",
 "ch_h1": "Ganadores de la Champions League y del Mundial",
 "ch_caja": "La Copa de Europa nació en 1955-56 y desde 1992-93 se llama Champions League. El Mundial se juega desde 1930, cada cuatro años, salvo 1942 y 1946 por la Segunda Guerra Mundial.",
 "ch_idx": ["Champions League", "Copa del Mundo", "Ranking de títulos"],
 "tl1": ["Primera Copa de Europa", "Nace la Champions", "Finales recientes", "PSG bicampeón"], "tl1_t": "Línea de tiempo de la Champions League",
 "ch_h2a": "Campeones de la Champions League y la Copa de Europa",
 "ch_p1": "Estas son las últimas finales, con su marcador. La edición de 2026 se jugó el 30 de mayo en Budapest: el PSG empató 1-1 con el Arsenal y ganó 4-3 en la tanda de penaltis, con lo que revalidó el título.",
 "ch_h3all": "Todos los campeones, año a año",
 "ch_h2b": "Campeones de la Copa del Mundo",
 "ch_p2": "El Mundial de 2026, el primero con 48 selecciones y organizado por Estados Unidos, México y Canadá, terminó el 19 de julio en el MetLife Stadium con la segunda estrella de España: venció 1-0 a Argentina en la prórroga con un gol de Ferran Torres, tras un pase de Nico Williams.",
 "tl2": ["Uruguay", "Maracanazo", "Brasil, 3.ª", "Francia", "España", "Argentina", "España"], "tl2_t": "Línea de tiempo de los Mundiales",
 "ch_h2c": "Ranking de títulos", "rk1": "Champions League / Copa de Europa", "rk2": "Copa del Mundo (Alemania Occidental y Alemania se cuentan juntas)",
 "th_year": "Año", "th_champ": "Campeón", "th_runner": "Subcampeón", "th_result": "Resultado", "th_venue": "Sede", "th_final": "Final", "th_club": "Club", "th_titles": "Títulos", "th_team": "Selección", "th_host": "País anfitrión",
 "pens": "{s} ({p} en penaltis)", "aet": "{s} (prórroga)", "round": "{s} (liguilla final)",
 "ch_src": "Fuentes: UEFA y FIFA (palmarés oficiales). Los marcadores de prórroga o penaltis se indican entre paréntesis.",
 "li_title": "Cómo se fundaron las ligas de fútbol más famosas del mundo | TIKITEXTO",
 "li_desc": "Historia de la fundación de 13 ligas: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Primeira Liga, Eredivisie, Brasileirão, MLS y más. Años, primeros campeones y curiosidades.",
 "li_h1": "Cómo se fundaron las ligas de fútbol más famosas del mundo",
 "li_caja": "Trece ligas, de la más antigua (Inglaterra, 1888) a las más recientes. Cada una incluye cuándo nació, quién ganó la primera edición y su dato clave.",
 "li_tl": ["Inglaterra", "Escocia", "Argentina", "Italia", "España", "Francia", "Portugal", "P. Bajos", "Alemania", "Brasil", "Japón", "EE. UU."], "li_tl_t": "Línea de tiempo de la fundación de las ligas",
 "li_idx": ["Inglaterra", "España", "Italia", "Alemania", "Francia", "Portugal", "Países Bajos", "Escocia", "Brasil", "Argentina", "México", "Estados Unidos", "Japón"],
 "li_src": "Fuentes: federaciones y organizadores de cada competición. Cuando una liga tuvo varias etapas, se indica la fecha de su formato actual.",
 "tr_title": "Historia de los trofeos de fútbol más importantes del mundo | TIKITEXTO",
 "tr_desc": "Cómo nacieron la FA Cup, la Copa del Rey, la Copa del Mundo, la Champions League, el Balón de Oro y otros trofeos de España, Inglaterra, Italia, Alemania, Francia, Portugal, Brasil, Estados Unidos y Argentina.",
 "tr_h1": "Historia de los trofeos de fútbol más importantes del mundo",
 "tr_caja": "{n} trofeos y premios, ordenados por países, con el año de su primera edición y su primer ganador.",
 "tr_idx": ["FA Cup", "Copa de la Liga", "Copa del Rey", "Pichichi", "Coppa Italia", "Scudetto", "DFB-Pokal", "Meisterschale", "Copa de Francia", "Taça de Portugal", "Copa de Brasil", "Copa Libertadores", "U.S. Open Cup", "MLS Cup", "Copa Argentina", "Copa del Mundo", "Champions League", "Balón de Oro", "Eurocopa"],
 "tr_src": "Fuentes: federaciones y organizadores de cada competición. Algunos trofeos tuvieron varios nombres y etapas; se indica el año de su primera edición.",
}
NOMBRES_ES = {}

class Idioma:
    def __init__(self, lang):
        self.lang = lang
        self.prefix = "" if lang == "es" else lang + "/"
        if lang == "es":
            self.ui = UI_ES; self.nombres = {}; self.paises = {}; self.ciudades = {}
            self.ligas = LIGAS; self.trofeos = TROFEOS
        else:
            m = importlib.import_module("cur_tr." + lang)
            self.ui = m.UI; self.nombres = m.NOMBRES; self.paises = m.PAISES; self.ciudades = m.CIUDADES
            self.ligas = [(LIGAS[k][0], LIGAS[k][1]) + tuple(x) for k, x in enumerate(m.LIGAS)]
            self.trofeos = [(TROFEOS[k][0], TROFEOS[k][1]) + tuple(x) for k, x in enumerate(m.TROFEOS)]
            assert len(m.LIGAS) == len(LIGAS) and len(m.TROFEOS) == len(TROFEOS), lang
    def club(self, x): return self.nombres.get(x, x)
    def pais(self, x): return self.paises.get(x, x)
    def ciudad(self, x): return self.ciudades.get(x, x)
    def url(self, ruta): return "/" + self.prefix + ruta
    def play(self): return "/" if self.lang == "es" else "/?lang=" + self.lang

JUGAR = {"es": "⚽ Jugar", "en": "⚽ Play", "pt": "⚽ Jogar", "fr": "⚽ Jouer", "it": "⚽ Gioca", "de": "⚽ Spielen"}
PUB = {"es": "Publicidad", "en": "Advertisement", "pt": "Publicidade", "fr": "Publicité", "it": "Pubblicità", "de": "Werbung"}
MAS = {"es": "Sigue leyendo", "en": "Keep reading", "pt": "Continue lendo", "fr": "Continuer la lecture", "it": "Continua a leggere", "de": "Weiterlesen"}
ICONO_RUTA = {"curiosidades/campeones/": "COPA", "curiosidades/ligas/": "LIGA", "curiosidades/trofeos/": "COPA", "curiosidades/": "LIBRO"}
HUECOS_JS = ("<script>(function(){try{var q=new URLSearchParams(location.search).get('huecos');if(q==='1')localStorage.setItem('tikitexto:huecos','1');if(q==='0')localStorage.removeItem('tikitexto:huecos');"
             "if(localStorage.getItem('tikitexto:huecos')==='1')document.documentElement.classList.add('huecos');}catch(e){}"
             "document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-cerrar-hueco]');if(b)b.parentNode.style.display='none';var t=e.target.closest&&e.target.closest('[data-tema-btn]');if(t){var n=document.documentElement.dataset.tema==='oscuro'?'claro':'oscuro';document.documentElement.dataset.tema=n;try{localStorage.setItem('tikitexto:tema',n);}catch(x){}}});})();</script>\n")

TEMA_JS = """<script>(function(){try{var g=localStorage.getItem('tikitexto:tema');var o=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.tema=g||(o?'oscuro':'claro');}catch(e){document.documentElement.dataset.tema='claro';}})();</script>"""

SOBRE = {"es": "Sobre TIKITEXTO", "en": "About TIKITEXTO", "pt": "Sobre o TIKITEXTO", "fr": "À propos de TIKITEXTO", "it": "Chi siamo", "de": "Über TIKITEXTO"}

def hueco(L, tipo=""):
    cls = "hueco" + (" hueco--" + tipo if tipo else "")
    cerrar = '<button type="button" data-cerrar-hueco aria-label="✕">✕</button>' if tipo == "ancla" else ""
    return f'<aside class="{cls}" aria-label="{e(PUB[L.lang])}" data-hueco="{tipo or "medio"}">{e(PUB[L.lang])}{cerrar}</aside>\n'

def con_huecos(L, h):
    """inserta un hueco de anuncio cada 2 secciones (h2) o cada 3 entradas, sin tocar el contenido"""
    import re
    marcas = [m.start() for m in re.finditer(r'<h2[ >]|<article class="entrada"', h)]
    if len(marcas) < 4: return h
    paso = 3 if '<article class="entrada"' in h else 2
    sitios = [m for k, m in enumerate(marcas) if k and k % paso == 0 and k < len(marcas) - 1]
    for pos in reversed(sitios): h = h[:pos] + hueco(L) + h[pos:]
    return h

def cabecera(L, titulo, desc, ruta, h1, icono=None):
    u = L.ui
    alt = "".join(f'<link rel="alternate" hreflang="{HREFLANG[c]}" href="{DOM}{"" if c == "es" else c + "/"}{ruta}">\n' for c in LANGS)
    alt += f'<link rel="alternate" hreflang="x-default" href="{DOM}{ruta}">\n'
    sel = " · ".join((f'<b>{NOMBRE_IDIOMA[c]}</b>' if c == L.lang else f'<a href="/{"" if c == "es" else c + "/"}{ruta}" hreflang="{HREFLANG[c]}" lang="{HREFLANG[c]}">{NOMBRE_IDIOMA[c]}</a>') for c in LANGS)
    return f"""<!DOCTYPE html>
<html lang="{HREFLANG[L.lang]}">
<head>
<meta charset="utf-8">
{CSP}<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-adsense-account" content="ca-pub-3562310629171137">
<title>{e(titulo)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{DOM}{L.prefix}{ruta}">
{alt}<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="{DOM}{L.prefix}{ruta}">
<meta property="og:image" content="https://tikitexto.com/icons/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{json.dumps({"@context": "https://schema.org", "@type": "Article", "headline": h1, "description": desc, "inLanguage": HREFLANG[L.lang], "mainEntityOfPage": DOM + L.prefix + ruta, "image": "https://tikitexto.com/icons/og-image.png", "publisher": {"@type": "Organization", "name": "TIKITEXTO", "url": DOM}}, ensure_ascii=False)}</script>
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png">
{TEMA_JS}
<style>
{CSS}.idiomas {{ font-size: .85rem; color: var(--suave); margin: 0 0 14px; }}
</style>
</head>
<body>
{HUECOS_JS}<header class="barra"><div><a class="marca" href="{L.play()}" aria-label="{e(u['back'])}">TIKI<i>TEXTO</i></a><span class="miga"><a href="{L.url('curiosidades/')}">{e(u['crumb'])}</a></span><button type="button" class="tema" data-tema-btn aria-label="🌓" title="🌓">🌓</button><a class="cta" href="{L.play()}">{e(JUGAR[L.lang])}</a></div></header>
{hueco(L, "lat izq").replace('hueco--lat izq', 'hueco--lat hueco--izq')}{hueco(L, "lat der").replace('hueco--lat der', 'hueco--lat hueco--der')}<main>
<p class="idiomas" translate="no">🌐 {sel}</p>
<div class="hero"><div><p class="etiqueta">{e(u['crumb'])}</p><h1>{e(h1)}</h1><p class="fecha">{e(u['checked'])}</p></div>{icono or globals().get(ICONO_RUTA.get(ruta, "BALON"), BALON)}</div>
"""

CSS_TC = """
.gr { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 38px 0 6px; padding: 12px 18px; border-radius: 18px; background: color-mix(in srgb, var(--c) 14%, var(--caja)); border: 1px solid color-mix(in srgb, var(--c) 35%, transparent); border-left: 9px solid var(--c); }
.gr h2 { margin: 0; padding: 0; border: 0; font-size: 1.28rem; flex: 1 1 auto; }
.gr a.todo { font-weight: 800; font-size: .88rem; color: var(--c); text-decoration: none; white-space: nowrap; }
.gr a.todo:hover { text-decoration: underline; }
.gr-d { margin: 0 2px 4px; color: var(--suave); font-size: .95rem; }
.tc { position: relative; border-top: 6px solid var(--c) !important; }
.tc .emo { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 16px; font-size: 28px; background: color-mix(in srgb, var(--c) 16%, var(--caja)); }
.tc svg { color: var(--c) !important; }
.tc:hover, .tc:focus-visible { border-color: var(--c) !important; box-shadow: 0 14px 30px color-mix(in srgb, var(--c) 32%, transparent) !important; }
.tc .min { display: inline-block; margin-top: 8px; padding: 2px 10px; border-radius: 999px; font-size: .76rem; font-weight: 800; color: var(--c); background: color-mix(in srgb, var(--c) 13%, transparent); }
.tema { margin: 14px 0; border-radius: 22px; border: 1px solid color-mix(in srgb, var(--c) 42%, transparent); background: color-mix(in srgb, var(--c) 7%, var(--caja)); overflow: hidden; }
.tema > summary, a.tema { list-style: none; cursor: pointer; display: grid; grid-template-columns: 3.4rem 1fr auto 1.4rem; gap: 14px; align-items: center; padding: 16px 18px; text-decoration: none; color: inherit; }
.tema > summary::-webkit-details-marker { display: none; }
.tema > summary:hover, a.tema:hover { background: color-mix(in srgb, var(--c) 14%, var(--caja)); }
.tema > summary:focus-visible, a.tema:focus-visible { outline: 3px solid var(--c); outline-offset: -3px; }
.tema .t-emo { display: grid; place-items: center; width: 3.4rem; height: 3.4rem; border-radius: 18px; font-size: 1.9rem; background: color-mix(in srgb, var(--c) 20%, var(--caja)); }
.tema .t-t b { display: block; font-size: 1.18rem; line-height: 1.2; }
.tema .t-t span { display: block; margin-top: 3px; font-size: .9rem; line-height: 1.4; color: var(--suave); font-weight: 500; }
.tema .t-n { font-size: .78rem; font-weight: 800; padding: 4px 11px; border-radius: 999px; color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent); white-space: nowrap; }
.tema .t-f::before { content: "›"; display: block; font-size: 1.9rem; font-weight: 800; line-height: 1; color: var(--c); transition: transform .2s; }
.tema[open] > summary .t-f::before { transform: rotate(90deg); }
.tema[open] > summary { background: color-mix(in srgb, var(--c) 16%, var(--caja)); }
.tema-c { padding: 4px 16px 18px; }
.tema-c .tarjetas { margin: 10px 0 0; }
.tema-c .tema { background: var(--caja); }
@media (max-width: 560px) { .tema > summary, a.tema { grid-template-columns: 2.8rem 1fr 1.2rem; padding: 14px; } .tema .t-n { display: none; } .tema .t-emo { width: 2.8rem; height: 2.8rem; font-size: 1.5rem; } }
.tema-h { margin: 26px 0 6px; font-size: 1.15rem; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0 0; }
.chips a { border: 1px solid color-mix(in srgb, var(--c) 45%, transparent); background: color-mix(in srgb, var(--c) 10%, var(--caja)); color: var(--texto); border-radius: 999px; padding: 5px 14px; font-size: .88rem; font-weight: 700; text-decoration: none; }
.chips a:hover { background: var(--c); color: #fff; }
"""

def inyecta_css(h, css):
    return h.replace("</style>", css + "\n</style>", 1)

def seguir(L):
    u = L.ui
    t = list(zip((COPA, LIGA, BALON), ("campeones/", "ligas/", "trofeos/"), u["cards"]))
    h = f'<section class="mas"><h2>{e(MAS[L.lang])}</h2><div class="tarjetas">\n'
    for icono, sl, (b, sp) in t:
        h += f'<a class="tarjeta" href="{L.url("curiosidades/" + sl)}">{icono}<b>{e(b)}</b><span>{e(sp)}</span></a>\n'
    return h + '</div></section>\n'

def pie(L, extra="", con_seguir=False):
    u = L.ui; n = u["nav"]
    return f"""{extra}
<p><a class="jugar" href="{L.play()}">{e(u['play'])}</a></p>
{hueco(L)}{seguir(L) if con_seguir else ""}{hueco(L, "ancla")}
<nav class="legal-nav" aria-label="Info">
<a href="{L.url('curiosidades/')}">{e(n[0])}</a><a href="/sobre-tikitexto.html">{e(SOBRE[L.lang])}</a><a href="/aviso-legal.html">{e(n[1])}</a><a href="/privacidad.html">{e(n[2])}</a><a href="/cookies.html">{e(n[3])}</a><a href="/accesibilidad.html">{e(n[4])}</a><a href="/contacto.html">{e(n[5])}</a>
</nav>
<p class="fecha">{e(u['disc'])}</p>
</main>
</body>
</html>
"""

def entrada(L, icono, marca, titulo, parrafos, dato=None, id_=None):
    ps = "".join(f"<p>{p}</p>" for p in parrafos)
    d = f'<p class="dato"><b>{e(L.ui["nutshell"])}</b> {dato}</p>' if dato else ""
    i = f' id="{id_}"' if id_ else ""
    return f'<article class="entrada"{i}><div class="ano">{icono}<b>{e(marca)}</b></div><div><h3>{titulo}</h3>{ps}{d}</div></article>\n'

def linea_tiempo(puntos, titulo):
    n = len(puntos); w = 600; m = 46; paso = (w - 2 * m) / max(1, n - 1)
    s = [f'<svg class="ilustra" viewBox="0 0 {w} 130" role="img" aria-label="{e(titulo)}"><line x1="{m}" y1="65" x2="{w-m}" y2="65" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>']
    for k, (a, t) in enumerate(puntos):
        x = m + k * paso; arriba = (k % 2 == 0)
        ay = 30 if arriba else 112
        anc = "start" if k == 0 else ("end" if k == n - 1 else "middle")
        tx = x - 10 if k == 0 else (x + 10 if k == n - 1 else x)
        s.append(f'<circle cx="{x:.0f}" cy="65" r="6" fill="currentColor"/>')
        s.append(f'<text x="{tx:.0f}" y="{(ay if arriba else ay-14):.0f}" text-anchor="{anc}" font-size="15" font-weight="700" fill="currentColor">{e(str(a))}</text>'
                 f'<text x="{tx:.0f}" y="{(ay+14 if arriba else ay):.0f}" text-anchor="{anc}" font-size="11.5" fill="#7d8da1">{e(t)}</text>')
    s.append('</svg>')
    return "".join(s)

def faq(L, pares, titulo=None, ld=True):
    """Bloque «Preguntas frecuentes» visible + datos estructurados FAQPage (solo es/en).
    pares: lista de (pregunta_es, pregunta_en, respuesta_es, respuesta_en)."""
    import json
    if not pares or L.lang not in ("es", "en"): return ""
    k = 0 if L.lang == "es" else 1
    h = f'<h2>{titulo or ("Preguntas frecuentes" if k == 0 else "Frequently asked questions")}</h2>\n<div class="faq">\n'
    for q in pares:
        h += f'<details><summary>{e(q[k])}</summary><p>{e(q[k + 2])}</p></details>\n'
    if not ld: return h + '</div>\n'
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q[k], "acceptedAnswer": {"@type": "Answer", "text": q[k + 2]}} for q in pares]}
    return h + '</div>\n<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + '</script>\n'

def tabla(cab, filas):
    t = "<div class=\"tabla-scroll\"><table><thead><tr>" + "".join(f"<th>{e(c)}</th>" for c in cab) + "</tr></thead><tbody>"
    for f in filas:
        t += "<tr>" + "".join(f"<td>{e(str(c))}</td>" for c in f) + "</tr>"
    return t + "</tbody></table></div>"

def cuenta(lista):
    d = {}
    for x in lista: d[x] = d.get(x, 0) + 1
    return sorted(d.items(), key=lambda kv: (-kv[1], kv[0]))

def resultado(L, texto):
    """convierte el texto neutro (como en español) a la plantilla del idioma"""
    u = L.ui
    if "(prórroga)" in texto: return u["aet"].format(s=texto.split(" ")[0])
    if "en penaltis" in texto:
        sc, p = texto.split(" (")[0], texto.split(" (")[1].split(" ")[0]
        return u["pens"].format(s=sc, p=p)
    if "liguilla" in texto: return u["round"].format(s=texto.split(" ")[0])
    return texto


FAQ_LIGAS = [
 ("¿Cuál es la liga de fútbol más antigua del mundo?", "What is the oldest football league in the world?",
  "La Football League inglesa, fundada el 17 de abril de 1888 en Manchester con 12 clubes. Su primera campeona fue el Preston North End. Es la primera liga profesional de la historia y la Premier League es su evolución desde 1992.",
  "The English Football League, founded on 17 April 1888 in Manchester with 12 clubs. Its first champions were Preston North End. It is the first professional league in history, and the Premier League is its evolution since 1992."),
 ("¿Cuál fue la primera liga de fútbol del mundo?", "What was the first football league in the world?",
  "La Football League de Inglaterra, en la temporada 1888-89. La ganó el Preston North End.",
  "The Football League of England, in the 1888–89 season. Preston North End won it."),
 ("¿Cuándo se fundó LaLiga?", "When was La Liga founded?",
  "La primera temporada de LaLiga se jugó en 1929 con diez equipos en Primera, y el primer campeón fue el FC Barcelona.",
  "La Liga's first season was played in 1929 with ten teams in the top flight, and the first champions were FC Barcelona."),
 ("¿Cuándo se fundó la Serie A, la Bundesliga y la Ligue 1?", "When were Serie A, the Bundesliga and Ligue 1 founded?",
  "La Serie A con grupo único empezó en 1929-30 (el primer campeonato italiano fue en 1898), la Bundesliga en 1963 y la liga profesional francesa en 1932; el nombre Ligue 1 se usa desde 2002.",
  "Serie A as a single league began in 1929–30 (the first Italian championship was in 1898), the Bundesliga in 1963 and the French professional league in 1932; the name Ligue 1 has been used since 2002."),
 ("¿Cuál es la liga más antigua de Sudamérica?", "What is the oldest league in South America?",
  "La de Argentina: su primer campeonato se jugó en 1891 y lo ganó el Old Caledonians. Se profesionalizó en 1931.",
  "Argentina's: its first championship was played in 1891 and won by Old Caledonians. It turned professional in 1931."),
]
FAQ_TROFEOS = [
 ("¿Cuál es el trofeo más importante del fútbol?", "What is the most important trophy in football?",
  "A nivel de selecciones, la Copa del Mundo de la FIFA. A nivel de clubes, la Champions League (antes Copa de Europa), apodada «la Orejona» por sus asas.",
  "For national teams, the FIFA World Cup. For clubs, the Champions League (formerly the European Cup), nicknamed «Big Ears» for its handles."),
 ("¿Cuáles son los trofeos más importantes del fútbol?", "What are the most important football trophies?",
  "Los principales son la Copa del Mundo, la Eurocopa, la Copa América, la Champions League, la Copa Libertadores, las ligas nacionales y el Balón de Oro como premio individual.",
  "The main ones are the World Cup, the European Championship, the Copa América, the Champions League, the Copa Libertadores, the national leagues and the Ballon d'Or as an individual award."),
 ("¿Cuál es la copa más antigua del mundo?", "What is the oldest cup competition in the world?",
  "La FA Cup inglesa. Su primera final se jugó el 16 de marzo de 1872 en el Kennington Oval y la ganó el Wanderers por 1-0 al Royal Engineers.",
  "England's FA Cup. Its first final was played on 16 March 1872 at the Kennington Oval, and Wanderers beat the Royal Engineers 1-0."),
 ("¿Quién ganó el primer Mundial de fútbol?", "Who won the first football World Cup?",
  "Uruguay, que ganó 4-2 a Argentina en la final de 1930, jugada en Montevideo.",
  "Uruguay, who beat Argentina 4-2 in the 1930 final, played in Montevideo."),
 ("¿Qué es el Scudetto?", "What is the Scudetto?",
  "Un escudo con los colores de la bandera italiana que lleva en la camiseta el campeón de la liga de Italia desde 1924.",
  "A badge in the colours of the Italian flag worn on the shirt by the Italian league champions since 1924."),
]

FAQ_T = {"pt": "Perguntas frequentes", "fr": "Questions fréquentes", "it": "Domande frequenti", "de": "Häufige Fragen"}
def faq2(L, pares):
    """FAQ (pregunta, respuesta) para pt/fr/it/de, con FAQPage."""
    import json
    if L.lang not in FAQ_T or not pares: return ""
    h = f'<h2>{FAQ_T[L.lang]}</h2>\n<div class="faq">\n' + "".join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>\n' for q, a in pares)
    ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pares]}
    return h + '</div>\n<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + '</script>\n'

def faq_otros(L, tipo, ch_t=None, mu_t=None):
    r = ch_t[0][1] if ch_t else 0; b = mu_t[0][1] if mu_t else 5
    D = {
    "campeones": {
     "pt": [("Quem ganhou mais vezes a Liga dos Campeões?", f"O Real Madrid, com {r} títulos da Taça dos Campeões Europeus e da Liga dos Campeões."),
            ("Quem ganhou a última Liga dos Campeões?", "O Paris Saint-Germain, que venceu a final de 2026 nos pênaltis (4-3) depois de empatar 1-1 com o Arsenal em Budapeste."),
            ("Quais seleções ganharam mais Copas do Mundo?", f"O Brasil, com {b} títulos. Alemanha e Itália têm quatro cada, e a Argentina tem três."),
            ("Quem foi campeão da última Copa do Mundo?", "A Espanha, que venceu a Argentina por 1-0 na final de 2026, após a prorrogação.")],
     "fr": [("Quelle équipe a gagné le plus de Ligues des champions ?", f"Le Real Madrid, avec {r} titres en Coupe d'Europe et en Ligue des champions."),
            ("Qui a gagné la dernière Ligue des champions ?", "Le Paris Saint-Germain, vainqueur de la finale 2026 aux tirs au but (4-3) après un 1-1 contre Arsenal à Budapest."),
            ("Quelle sélection a gagné le plus de Coupes du monde ?", f"Le Brésil, avec {b} titres. L'Allemagne et l'Italie en ont quatre chacune, et l'Argentine trois."),
            ("Qui a gagné la dernière Coupe du monde ?", "L'Espagne, qui a battu l'Argentine 1-0 en finale 2026 après prolongation.")],
     "it": [("Quale squadra ha vinto più Champions League?", f"Il Real Madrid, con {r} titoli tra Coppa dei Campioni e Champions League."),
            ("Chi ha vinto l'ultima Champions League?", "Il Paris Saint-Germain, vincitore della finale 2026 ai rigori (4-3) dopo l'1-1 con l'Arsenal a Budapest."),
            ("Quale nazionale ha vinto più Mondiali?", f"Il Brasile, con {b} titoli. Germania e Italia ne hanno quattro ciascuna e l'Argentina tre."),
            ("Chi ha vinto l'ultimo Mondiale?", "La Spagna, che ha battuto l'Argentina 1-0 nella finale del 2026 dopo i tempi supplementari.")],
     "de": [("Welches Team hat die meisten Champions-League-Titel?", f"Real Madrid mit {r} Titeln im Europapokal der Landesmeister und in der Champions League."),
            ("Wer hat die letzte Champions League gewonnen?", "Paris Saint-Germain, das das Finale 2026 im Elfmeterschießen (4:3) nach einem 1:1 gegen den FC Arsenal in Budapest gewann."),
            ("Welche Nationalmannschaft hat die meisten Weltmeistertitel?", f"Brasilien mit {b} Titeln. Deutschland und Italien haben je vier, Argentinien drei."),
            ("Wer ist der aktuelle Weltmeister?", "Spanien, das im Finale 2026 nach Verlängerung 1:0 gegen Argentinien gewann.")]},
    "trofeos": {
     "pt": [("Qual é o troféu mais importante do futebol?", "Entre seleções, a Copa do Mundo da FIFA. Entre clubes, a Liga dos Campeões da UEFA."),
            ("Qual é a copa mais antiga do mundo?", "A FA Cup inglesa: a primeira final foi disputada em 16 de março de 1872."),
            ("Quem ganhou a primeira Copa do Mundo?", "O Uruguai, que venceu a Argentina por 4-2 na final de 1930.")],
     "fr": [("Quel est le trophée le plus important du football ?", "Pour les sélections, la Coupe du monde de la FIFA. Pour les clubs, la Ligue des champions de l'UEFA."),
            ("Quelle est la plus ancienne coupe du monde ?", "La FA Cup anglaise : la première finale a eu lieu le 16 mars 1872."),
            ("Qui a gagné la première Coupe du monde ?", "L'Uruguay, vainqueur de l'Argentine 4-2 en finale en 1930.")],
     "it": [("Qual è il trofeo più importante del calcio?", "Per le nazionali, la Coppa del Mondo FIFA. Per i club, la UEFA Champions League."),
            ("Qual è la coppa più antica del mondo?", "La FA Cup inglese: la prima finale si giocò il 16 marzo 1872."),
            ("Chi ha vinto il primo Mondiale?", "L'Uruguay, che batté l'Argentina 4-2 nella finale del 1930.")],
     "de": [("Welche Pokale gibt es im Fußball und welcher ist der wichtigste?", "Für Nationalmannschaften ist es die FIFA-Weltmeisterschaft, für Vereine die UEFA Champions League. Dazu kommen Kontinentalwettbewerbe, nationale Pokale und der Ballon d'Or."),
            ("Was ist der Weltmeisterschaftspokal?", "Seit 1974 wird der FIFA-Weltpokal aus 18-karätigem Gold vergeben. Zuvor gab es von 1930 bis 1970 den Jules-Rimet-Pokal. Die Weltmeister erhalten eine Nachbildung."),
            ("Wer war der erste Weltmeister?", "Uruguay, das 1930 im Finale Argentinien mit 4:2 besiegte.")]}}
    return faq2(L, D[tipo].get(L.lang, []))

def faq_campeones(L, ch_t, mu_t):
    k = L.lang
    if k not in ("es", "en"): return ""
    return faq(L, [
     ("¿Qué equipo ha ganado más Champions League?", "Which team has won the most Champions Leagues?",
      f"El Real Madrid, con {ch_t[0][1]} títulos de la Copa de Europa y la Champions. Le siguen el Milan ({ch_t[1][1]}) y el Bayern de Múnich y el Liverpool ({ch_t[2][1]} cada uno).",
      f"Real Madrid, with {ch_t[0][1]} European Cup and Champions League titles. Milan ({ch_t[1][1]}) and Bayern Munich and Liverpool ({ch_t[2][1]} each) follow."),
     ("¿Quién ganó la última Champions League?", "Who won the latest Champions League?",
      "El París Saint-Germain, que ganó la final de 2026 en los penaltis (4-3) tras empatar 1-1 con el Arsenal en Budapest.",
      "Paris Saint-Germain, who won the 2026 final on penalties (4-3) after a 1-1 draw with Arsenal in Budapest."),
     ("¿Qué selección ha ganado más Mundiales?", "Which national team has won the most World Cups?",
      f"Brasil, con {mu_t[0][1]}. Alemania e Italia tienen {mu_t[1][1]} cada una, y Argentina, {mu_t[3][1]}.",
      f"Brazil, with {mu_t[0][1]}. Germany and Italy have {mu_t[1][1]} each, and Argentina {mu_t[3][1]}."),
     ("¿Quién ganó el último Mundial?", "Who won the latest World Cup?",
      "España, que ganó 1-0 a Argentina en la final de 2026 tras la prórroga. El torneo se jugó en Estados Unidos, México y Canadá.",
      "Spain, who beat Argentina 1-0 after extra time in the 2026 final. The tournament was played in the United States, Mexico and Canada.")])

def pagina_campeones(L):
    u = L.ui; ruta = "curiosidades/campeones/"
    h = cabecera(L, u["ch_title"], u["ch_desc"], ruta, u["ch_h1"])
    ch_t = cuenta([L.club(c) for _, c in CHAMPIONS])
    mu_t = cuenta([L.pais("Alemania" if "Alemania" in c else c) for _, c, *_ in MUNDIAL])
    h += f'<div class="caja">{e(u["ch_caja"])}</div>\n'
    h += '<p class="indice"><a href="#champions">%s</a><a href="#mundial">%s</a><a href="#titulos">%s</a></p>\n' % tuple(e(x) for x in u["ch_idx"])
    h += linea_tiempo(list(zip([1956, 1992, 2010, 2026], u["tl1"])), u["tl1_t"])
    h += f'<h2 id="champions">{e(u["ch_h2a"])}</h2>\n<p>{e(u["ch_p1"])}</p>\n'
    h += tabla([u["th_year"], u["th_champ"], u["th_runner"], u["th_result"], u["th_venue"]], [(a, L.club(c), L.club(s), resultado(L, r), L.ciudad(v)) for a, c, s, r, v in FINALES_RECIENTES])
    h += f'<h3 style="margin-top:22px">{e(u["ch_h3all"])}</h3>\n'
    h += tabla([u["th_final"], u["th_champ"]], [(a, L.club(c)) for a, c in reversed(CHAMPIONS)])
    h += f'<h2 id="mundial">{e(u["ch_h2b"])}</h2>\n<p>{e(u["ch_p2"])}</p>\n'
    h += linea_tiempo(list(zip([1930, 1950, 1970, 1998, 2010, 2022, 2026], u["tl2"])), u["tl2_t"])
    h += tabla([u["th_year"], u["th_champ"], u["th_runner"], u["th_final"], u["th_host"]], [(a, L.pais(c), L.pais(s), resultado(L, r), L.pais(p)) for a, c, s, r, p in reversed(MUNDIAL)])
    h += f'<h2 id="titulos">{e(u["ch_h2c"])}</h2>\n'
    h += f'<p><b>{e(u["rk1"])}</b></p>' + tabla([u["th_club"], u["th_titles"]], ch_t[:8])
    h += f'<p style="margin-top:16px"><b>{e(u["rk2"])}</b></p>' + tabla([u["th_team"], u["th_titles"]], mu_t)
    h += faq_campeones(L, ch_t, mu_t) + faq_otros(L, "campeones", ch_t, mu_t)
    h += f'\n<p class="fecha">{e(u["ch_src"])}</p>'
    return ruta, h + pie(L)

def pagina_ligas(L):
    u = L.ui; ruta = "curiosidades/ligas/"
    h = cabecera(L, u["li_title"], u["li_desc"], ruta, u["li_h1"])
    h += f'<div class="caja">{e(u["li_caja"])}</div>\n'
    h += linea_tiempo(list(zip([1888, 1890, 1891, 1898, 1929, 1932, 1934, 1956, 1963, 1971, 1993, 1996], u["li_tl"])), u["li_tl_t"])
    h += '<p class="indice">' + "".join(f'<a href="#l{i}">{e(t)}</a>' for i, t in enumerate(u["li_idx"])) + '</p>\n'
    for i, (_, ano, tit, sub, ps, dato) in enumerate(L.ligas):
        h += entrada(L, LIGA, ano, f"{e(tit)} — {e(sub)}", ps, dato, f"l{i}")
    h += faq(L, FAQ_LIGAS)
    h += f'<p class="fecha">{e(u["li_src"])}</p>'
    return ruta, h + pie(L)

def pagina_trofeos(L):
    u = L.ui; ruta = "curiosidades/trofeos/"
    h = cabecera(L, u["tr_title"], u["tr_desc"], ruta, u["tr_h1"])
    h += f'<div class="caja">{e(u["tr_caja"].format(n=len(L.trofeos)))}</div>\n'
    h += '<p class="indice">' + "".join(f'<a href="#t{i}">{e(t)}</a>' for i, t in enumerate(u["tr_idx"])) + '</p>\n'
    for i, (_, ano, tit, sub, ps, dato) in enumerate(L.trofeos):
        h += entrada(L, COPA, ano, f"{e(tit)} — {e(sub)}", ps, dato, f"t{i}")
    h += faq(L, FAQ_TROFEOS) + faq_otros(L, "trofeos")
    h += f'<p class="fecha">{e(u["tr_src"])}</p>'
    return ruta, h + pie(L)

def _col(c):
    return f' style="--c:{c}"'

def tema(col, emoji, titulo, desc, n, cuerpo, name="cur", abierto=False):
    """Tema desplegable: hay que pulsarlo para ver su contenido (name = acordeón exclusivo)."""
    nn = f'<span class="t-n">{e(n)}</span>' if n else '<span class="t-n" style="padding:0"></span>'
    return (f'<details class="tema"{_col(col)} name="{name}"{" open" if abierto else ""}><summary><span class="t-emo" aria-hidden="true">{emoji}</span>'
            f'<span class="t-t"><b>{e(titulo)}</b><span>{e(desc)}</span></span>{nn}<span class="t-f" aria-hidden="true"></span></summary>'
            f'<div class="tema-c">{cuerpo}</div></details>\n')

def tema_enlace(col, emoji, titulo, desc, n, href):
    nn = f'<span class="t-n">{e(n)}</span>' if n else '<span class="t-n" style="padding:0"></span>'
    return (f'<a class="tema" href="{href}"{_col(col)}><span class="t-emo" aria-hidden="true">{emoji}</span>'
            f'<span class="t-t"><b>{e(titulo)}</b><span>{e(desc)}</span></span>{nn}<span class="t-f" aria-hidden="true"></span></a>\n')

def tarjetas_articulos(slugs):
    from articulos_meta import meta, todos
    por = {a["slug"]: a for a in todos()}
    h = '<div class="tarjetas">\n'
    for sl in slugs:
        a = por[sl]; m = meta(sl); mins = sum(len(p.split()) for _, ps in a["secciones"] for p in ps) // 200 + 1
        h += f'<a class="tarjeta tc" href="/articulos/{sl}/"{_col(m["c"][0])}><span class="emo" aria-hidden="true">{m["e"]}</span><b>{e(a["titulo"])}</b><span class="min">{mins} min de lectura</span></a>\n'
    return h + '</div>\n'

def cats_articulos(name="art"):
    from articulos_meta import CATS
    return "".join(tema(c, em, t, d, f"{len(sl)} artículos", tarjetas_articulos(sl), name) for _, em, t, d, c, sl in CATS)

def pagina_indice(L):
    u = L.ui; ruta = "curiosidades/"
    es = L.lang == "es"
    h = cabecera(L, u["idx_title"], u["idx_desc"], ruta, u["idx_h1"])
    h = inyecta_css(h, CSS_TC)
    h += f'<div class="caja">{u["idx_caja"].format(play=L.play())}</div>\n'
    clasicas = [(COPA, "campeones/", "#1747d6"), (LIGA, "ligas/", "#0f9d58"), (BALON, "trofeos/", "#c98a00")]
    if L.lang not in ("es", "en"):
        h += '<div class="tarjetas">\n'
        for (icono, sl, col), (b, sp) in zip(clasicas, u["cards"]):
            h += f'<a class="tarjeta tc" href="{L.url("curiosidades/" + sl)}"{_col(col)}>{icono}<b>{e(b)}</b><span>{e(sp)}</span></a>\n'
        h += f'</div>\n<h2>{e(u["latest_h"])}</h2>\n<div class="caja">{u["latest"].format(champ=L.url("curiosidades/campeones/"))}</div>\n'
        return ruta, h + pie(L, "", False)
    import hist_data as _H
    import temas_data as _T
    import articulos_a, articulos_b, articulos_c
    from articulos_meta import meta
    k = 0 if es else 1
    def grupo(col, titulo, desc, enlace=None, texto_enlace=""):
        a = f'<a class="todo" href="{enlace}">{e(texto_enlace)} →</a>' if enlace else ""
        return f'<div class="gr"{_col(col)}><h2>{e(titulo)}</h2>{a}</div>\n<p class="gr-d">{e(desc)}</p>\n'
    h += '<div class="bus" data-buscador></div><script src="/buscador.js" defer></script>\n'
    h += f'<h2 class="tema-h">{"Elige un tema" if es else "Pick a topic"}</h2>\n'
    # 1) artículos (solo español): categorías dentro del tema
    if es:
        h += tema("#7c3aed", "✍️", "Artículos de análisis", "49 textos largos y originales: reglas, tácticas, premios, historia y cómo funciona el fútbol por dentro.", "49 artículos", cats_articulos(), "cur")
    # 2) datos y récords
    dt = ("Récords y rankings con fuentes", "Goleadores de la Champions y del Mundial, Balón de Oro, Pichichi, Eurocopa, Bota de Oro y más, con la fuente y la fecha de los datos.") if es else ("Records and rankings, with sources", "Champions League and World Cup scorers, Ballon d'Or, Pichichi, the Euros, the Golden Shoe and more, with source and data date.")
    h += tema_enlace("#0f9d58", "📊", dt[0], dt[1], "9 páginas" if es else "9 pages", L.url("curiosidades/datos/"))
    # 3) historia
    hs = [(sl, t, f, ic) for sl, t, f, ic in _H.cards_meta(L.lang) if sl not in (_T_HUB := {"curiosidades-por-temas", "football-trivia-by-topic"})]
    cu = '<div class="tarjetas">\n'
    for sl, t, f, ic in hs:
        cu += f'<a class="tarjeta tc" href="{L.url("curiosidades/" + sl + "/")}"{_col("#dc2626")}>{globals()[ic]}<b>{e(t)}</b><span>{e(f)}</span></a>\n'
    cu += '</div>\n'
    h += tema("#dc2626", "🏟️", "Historia: Champions y Mundiales" if es else "History: Champions League and World Cups", "Las últimas 20 finales de la Champions y los 23 Mundiales, con marcador, sede y curiosidades." if es else "The last 20 Champions League finals and all 23 World Cups, with scores, venues and trivia.", f"{len(hs)} " + ("páginas" if es else "pages"), cu)
    # 4) temas
    hub_t = ("curiosidades-por-temas", "football-trivia-by-topic")[k]
    cu = f'<div class="chips"{_col("#ea580c")}>' + "".join(f'<a href="{L.url("curiosidades/" + t[L.lang] + "/")}">{e(t["t"][k])}</a>' for t in _T.TEMAS) + f'</div>\n<p><a href="{L.url("curiosidades/" + hub_t + "/")}">{"Ver todas las curiosidades por temas →" if es else "See all trivia by topic →"}</a></p>\n'
    h += tema("#ea580c", "⚡", "Curiosidades por equipos y jugadores" if es else "Trivia by club and player", "Real Madrid, Barça, Messi, Cristiano, Premier League y más." if es else "Real Madrid, Barça, Messi, Cristiano, the Premier League and more.", f"{len(_T.TEMAS)} " + ("temas" if es else "topics"), cu)
    # 4b) historias y peques (solo español)
    if es:
        import historias_data as _HD, peques_data as _PD
        cu = '<div class="tarjetas">\n'
        for c in _HD.COLECCIONES:
            cu += f'<a class="tarjeta tc" href="/historias/{c["slug"]}/"{_col(c["c"][0])}><span class="emo" aria-hidden="true">{c["emoji"]}</span><b>{e(c["titulo"])}</b><span class="min">{len(c["items"])} historias</span></a>\n'
        cu += '</div>\n<p><a href="/historias/">Ver todas las historias →</a></p>\n'
        h += tema("#7c3aed", "📖", "Historias y anécdotas", "Relatos cortos y variados: Mundiales increíbles, quién inventó cada cosa, sorpresas, récords raros, mitos y leyendas.", f"{sum(len(c['items']) for c in _HD.COLECCIONES)} historias", cu)
        h += tema_enlace("#16a34a", "🧒", "Rincón de los peques", "Chistes, adivinanzas, trabalenguas, verdadero o falso y sopas de letras de fútbol para niños.", "", "/peques/")
    # 5) clásicas
    cu = '<div class="tarjetas">\n'
    for (icono, sl, col), (b, sp) in zip(clasicas, u["cards"]):
        cu += f'<a class="tarjeta tc" href="{L.url("curiosidades/" + sl)}"{_col(col)}>{icono}<b>{e(b)}</b><span>{e(sp)}</span></a>\n'
    cu += '</div>\n'
    h += tema("#1747d6", "🏆", "Campeones, ligas y trofeos" if es else "Champions, leagues and trophies", "Ganadores año a año, el origen de las ligas y la historia de las copas." if es else "Winners year by year, how the leagues began and the story of the cups.", "3", cu)
    h += f'<h2>{e(u["latest_h"])}</h2>\n<div class="caja">{u["latest"].format(champ=L.url("curiosidades/campeones/"))}</div>\n'
    return ruta, h + pie(L, "", False)

if __name__ == "__main__":
    langs = [a for a in sys.argv[1:] if a in LANGS] or LANGS
    for lg in langs:
        L = Idioma(lg)
        for fn in (pagina_indice, pagina_campeones, pagina_ligas, pagina_trofeos):
            ruta, cont = fn(L)
            cont = con_huecos(L, cont)
            d = os.path.join(RAIZ, L.prefix + ruta)
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont)
            print("generada", L.prefix + ruta)
