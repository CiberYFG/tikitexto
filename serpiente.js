/* CRACKS OCULTOS · juego de letras (15-nov-2026)
   Una cuadrícula 5×6 esconde los nombres de un tema (p. ej. «Leyendas de Brasil»): cada letra pertenece a un nombre.
   Se descubren deslizando el dedo por letras vecinas (también en diagonal). Contrarreloj: cada cuadrícula completa suma tiempo.
   Módulo ES; todo es propio (canvas + sonidos sintetizados). Sin escudos, fotos ni logos. */

const C = 5, R = 6, N = C * R;
const TIEMPO = 120, TIEMPO_MAX = 150, BONUS_T = 30, COSTE_PISTA = 10, COSTE_PISTA_SEG = 5, COSTE_VER = 15;
const COLS = ["#19e6ff", "#ff3dcb", "#ffe94a", "#41ff8a", "#ff9a1f", "#c77dff", "#ff6b7c", "#7dd3fc"];

/* Nombres sin tildes ni espacios (A-Z), de 3 a 9 letras. Equipos, estadios y leyendas MUY conocidos. Cada tema tiene 10+ para poder combinar. */
const TEMAS = [
  /* Equipos */
  { t: "Equipos de LaLiga", n: "MADRID BARCA ATLETI SEVILLA VALENCIA BETIS ATHLETIC GETAFE OSASUNA CELTA ESPANYOL MALLORCA GIRONA RAYO ALAVES" },
  { t: "Equipos de la Premier League", n: "LIVERPOOL ARSENAL CHELSEA TOTTENHAM EVERTON WESTHAM UNITED CITY NEWCASTLE LEICESTER FULHAM BRIGHTON WOLVES LEEDS" },
  { t: "Equipos de la Serie A", n: "JUVENTUS MILAN INTER NAPOLI ROMA LAZIO ATALANTA TORINO GENOA BOLOGNA UDINESE SAMPDORIA PARMA CAGLIARI VERONA" },
  { t: "Equipos de la Bundesliga", n: "BAYERN DORTMUND LEIPZIG SCHALKE HAMBURGO STUTTGART BREMEN WOLFSBURG FRANKFURT COLONIA MAINZ HERTHA FREIBURG" },
  { t: "Grandes de Europa", n: "PSG BENFICA PORTO SPORTING AJAX CELTIC RANGERS MONACO LYON MARSELLA SHAKHTAR ZENIT FEYENOORD PSV" },
  { t: "Equipos de Sudamérica", n: "BOCA RIVER FLAMENGO SANTOS PALMEIRAS NACIONAL RACING VASCO GREMIO CRUZEIRO BOTAFOGO VELEZ" },
  /* Estadios */
  { t: "Estadios famosos de España", n: "BERNABEU CAMPNOU CALDERON MESTALLA SANMAMES RIAZOR ROMAREDA ANOETA SADAR CARRANZA SARRIA" },
  { t: "Estadios famosos de Europa", n: "ALLIANZ SANSIRO ANFIELD WEMBLEY EMIRATES ETIHAD OLIMPICO WESTFALEN HAMPDEN DRAGAO LUZ BERNABEU CAMPNOU" },
  { t: "Estadios míticos del mundo", n: "MARACANA AZTECA BOMBONERA MORUMBI WEMBLEY BERNABEU CAMPNOU SANSIRO ANFIELD MINEIRAO" },
  /* Leyendas de clubes */
  { t: "Leyendas del Real Madrid", n: "RAUL CASILLAS RAMOS MODRIC KROOS BENZEMA ZIDANE FIGO PUSKAS GENTO HIERRO MARCELO CARVAJAL VINICIUS GUTI MORIENTES BALE ISCO RONALDO" },
  { t: "Leyendas del Barcelona", n: "MESSI XAVI INIESTA PUYOL KOEMAN ROMARIO RIVALDO PIQUE BUSQUETS VALDES ETOO HENRY SUAREZ NEYMAR CRUYFF LAUDRUP ALVES ABIDAL LARSSON" },
  { t: "Leyendas del Atlético de Madrid", n: "GRIEZMANN TORRES GABI GODIN FORLAN SIMEONE ARAGONES AGUERO FALCAO KOKE OBLAK COSTA GARATE VIERI FUTRE KIKO CAMINERO PANTIC" },
  { t: "Leyendas del Athletic Club", n: "ZARRA IRIBAR ADURIZ LLORENTE SUSAETA IRAOLA MUNIAIN URZAIZ GUERRERO PICHICHI GAINZA WILLIAMS GOROSTIZA VALVERDE" },
  { t: "Leyendas del Milan", n: "MALDINI BARESI BAGGIO KAKA GULLIT RIJKAARD VANBASTEN PIRLO SEEDORF NESTA TASSOTTI DONADONI GATTUSO INZAGHI RIVERA WEAH BOBAN PAPIN ALTAFINI SAVICEVIC" },
  { t: "Leyendas del Inter", n: "ZANETTI MILITO SNEIJDER SAMUEL CAMBIASSO STANKOVIC MATERAZZI FACCHETTI MAZZOLA SUAREZ RONALDO VIERI ETOO MAICON CESAR BERGOMI MATTHAUS BREHME ZAMORANO RECOBA ICARDI LUKAKU" },
  { t: "Leyendas de la Juventus", n: "BUFFON DELPIERO PLATINI ZIDANE NEDVED TREZEGUET VIALLI BONIPERTI CHIELLINI BARZAGLI PIRLO VIDAL TEVEZ DYBALA SCIREA CABRINI ZOFF BETTEGA DESCHAMPS CONTE TARDELLI THURAM BONUCCI RONALDO" },
  { t: "Leyendas del Bayern", n: "MULLER MAIER KAHN LAHM MATTHAUS ROBBEN RIBERY KIMMICH NEUER ELBER EFFENBERG BASLER HOENESS BREITNER LIZARAZU KLOSE TONI PIZARRO SCHOLL KROOS KANE OLIC ALABA GOMEZ" },
  { t: "Leyendas del Liverpool", n: "GERRARD DALGLISH RUSH HYYPIA CARRAGHER OWEN FOWLER SALAH SUAREZ TORRES ALONSO KEEGAN HANSEN SOUNESS BARNES SHANKLY PAISLEY FIRMINO MANE VANDIJK ALISSON HENDERSON" },
  { t: "Leyendas del Manchester United", n: "GIGGS SCHOLES KEANE CANTONA BECKHAM ROONEY RONALDO FERDINAND VIDIC STAM NEVILLE BEST CHARLTON LAW SOLSKJAER YORKE COLE IRWIN BRUCE ROBSON HUGHES TEVEZ CARRICK EVRA" },
  { t: "Leyendas del Arsenal", n: "HENRY BERGKAMP VIEIRA ADAMS KEOWN SEAMAN PIRES LJUNGBERG CAMPBELL COLE FABREGAS WILSHERE WRIGHT DIXON PARLOUR OVERMARS ANELKA VANPERSIE SAKA ODEGAARD RICE ARTETA LEHMANN" },
  /* Leyendas de selecciones */
  { t: "Leyendas de España", n: "INIESTA XAVI CASILLAS PUYOL RAMOS VILLA TORRES RAUL BUSQUETS HIERRO FABREGAS ALONSO PIQUE SILVA NAVAS CAPDEVILA MORIENTES" },
  { t: "Leyendas de Brasil", n: "PELE ROMARIO RONALDO RIVALDO KAKA NEYMAR ZICO SOCRATES GARRINCHA CAFU TAFFAREL BEBETO VINICIUS RAPHINHA ALISSON DUNGA TOSTAO DIDA JAIRZINHO FALCAO ADRIANO" },
  { t: "Leyendas de Argentina", n: "MESSI MARADONA KEMPES DIMARIA RIQUELME AGUERO TEVEZ ZANETTI CRESPO OTAMENDI ARDILES CANIGGIA SIMEONE ORTEGA DYBALA MARTINEZ ALVAREZ FILLOL VALDANO" },
  { t: "Leyendas de Francia", n: "ZIDANE HENRY PLATINI MBAPPE KANTE POGBA VIEIRA THURAM BLANC PIRES MAKELELE BENZEMA FONTAINE KOPA LLORIS BARTHEZ LIZARAZU DESAILLY CANTONA RIBERY VARANE GIROUD GRIEZMANN" },
  { t: "Leyendas de Italia", n: "BUFFON MALDINI BARESI BAGGIO TOTTI PIRLO ROSSI NESTA ZOFF VIERI INZAGHI GATTUSO BERGOMI BONUCCI RIVERA RIVA SCIREA ZOLA DONADONI TARDELLI CONTE MAZZOLA CANNAVARO CHIELLINI" },
  { t: "Leyendas de Alemania", n: "MULLER KLOSE KAHN MATTHAUS NEUER KROOS OZIL LAHM PODOLSKI BALLACK VOLLER BREITNER MAIER HAMANN GOTZE REUS MUSIALA WIRTZ HAVERTZ KIMMICH SANE" },
  { t: "Leyendas de los Países Bajos", n: "CRUYFF GULLIT RIJKAARD KOEMAN BERGKAMP SNEIJDER ROBBEN SEEDORF DAVIDS STAM NEESKENS KROL DEJONG DEPAY BLIND OVERMARS KUYT VANBASTEN" },
  { t: "Leyendas de Portugal", n: "EUSEBIO FIGO RONALDO PEPE DECO NANI COENTRAO CARVALHO QUARESMA BERNARDO SILVA MOUTINHO COSTINHA MANICHE PAULETA CANCELO DIAS LEAO RAMOS" },
  /* Por premios y puestos */
  { t: "Ganadores del Balón de Oro", n: "MESSI MODRIC KAKA ZIDANE CRUYFF PLATINI BAGGIO NEDVED RIVALDO OWEN BENZEMA RODRI EUSEBIO YASHIN WEAH BLOKHIN CHARLTON MATTHEWS KOPA KANE DEMBELE" },
  { t: "Porteros históricos", n: "CASILLAS BUFFON KAHN YASHIN NEUER COURTOIS ZOFF BANKS OBLAK ALISSON CECH SEAMAN BARTHEZ LLORIS TAFFAREL SHILTON MAIER EDERSON HIGUITA KEYLOR DEGEA" },
  { t: "Delanteros de leyenda", n: "HENRY SUAREZ ETOO DROGBA RAUL VILLA TORRES KLOSE SHEARER ROMARIO RONALDO KANE HAALAND EUSEBIO MULLER CRESPO FORLAN OWEN LINEKER BERGKAMP" },
].map((x) => ({ t: x.t, n: x.n.split(" ") }));

const rnd = (a, b) => a + Math.random() * (b - a);
const mezcla = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
const VEC = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const vecinas = (i) => { const r = Math.floor(i / C), c = i % C, o = []; for (let k = 0; k < 8; k++) { const rr = r + VEC[k][0], cc = c + VEC[k][1]; if (rr >= 0 && rr < R && cc >= 0 && cc < C) o.push(rr * C + cc); } return o; };
const NEI = []; for (let i = 0; i < N; i++) NEI.push(vecinas(i));

/* Reparte los 30 huecos en caminos que deletrean cada nombre (retroceso aleatorio con límite de nodos). */
function rellenar(nombres) {
  const dueño = new Array(N).fill(-1), cam = new Array(nombres.length), usado = new Array(nombres.length).fill(false);
  let nodos = 0;
  function camino(idx, path, resto) {
    if (++nodos > 60000) return false;
    const L = nombres[idx].length;
    if (path.length === L) { cam[idx] = path.slice(); usado[idx] = true; if (colocar(resto - 1)) return true; usado[idx] = false; return false; }
    const ult = path[path.length - 1], vs = mezcla(NEI[ult]);
    for (let k = 0; k < vs.length; k++) {
      const v = vs[k]; if (dueño[v] !== -1) continue;
      dueño[v] = idx; path.push(v);
      if (camino(idx, path, resto)) return true;
      path.pop(); dueño[v] = -1;
    }
    return false;
  }
  function colocar(resto) {
    if (resto === 0) return true;
    let f = 0; while (f < N && dueño[f] !== -1) f++;
    if (f >= N) return false;
    const orden = mezcla(nombres.map((_, i) => i).filter((i) => !usado[i]));
    for (let k = 0; k < orden.length; k++) {
      const i = orden[k]; dueño[f] = i;
      if (camino(i, [f], resto)) return true;
      dueño[f] = -1;
      if (nodos > 60000) return false;
    }
    return false;
  }
  return colocar(nombres.length) ? cam : null;
}
function generar(evitar) {
  for (let intento = 0; intento < 400; intento++) {
    const tema = mezcla(TEMAS.filter((x) => x !== evitar))[0], pool = mezcla(tema.n);
    let suma = 0; const eleg = [];
    for (let i = 0; i < pool.length && suma < N; i++) { if (suma + pool[i].length <= N) { eleg.push(pool[i]); suma += pool[i].length; } }
    if (suma !== N || eleg.length < 4 || eleg.length > 8) continue;
    const cam = rellenar(eleg); if (!cam) continue;
    const grid = new Array(N), nombres = eleg.map((s, i) => { cam[i].forEach((c, k) => { grid[c] = s[k]; }); return { s: s, cells: cam[i], col: COLS[i % COLS.length], ok: false, pista: 0, rev: false }; });
    return { tema: tema, nombres: nombres, grid: grid };
  }
  return null;
}

export function precargar() { return Promise.resolve(); }

function crearAudio(api) {
  let ac = null, master = null;
  function ok() {
    if (!api.sonido || !api.sonido()) return false;
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); } catch (e) { ac = null; return false; } }
    if (ac.state === "suspended") { try { ac.resume(); } catch (e) { /* opcional */ } }
    return true;
  }
  function tono(f, d, tipo, v, f2, ret) {
    if (!ok()) return;
    const t0 = ac.currentTime + (ret || 0), o = ac.createOscillator(), g = ac.createGain();
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + d + 0.03);
  }
  const esc = [0, 2, 4, 7, 9, 12, 14, 16, 19];
  return {
    activar: ok,
    letra: (n) => tono(392 * Math.pow(2, esc[Math.min(n, esc.length - 1)] / 12), 0.13, "triangle", 0.22),
    quita: () => tono(300, 0.06, "sine", 0.12),
    ok: (n) => { [523, 659, 784, 1047].forEach((f, i) => tono(f * (1 + Math.min(n, 4) * 0.03), 0.22, "triangle", 0.26, 0, i * 0.07)); },
    mal: () => { tono(180, 0.22, "sawtooth", 0.2, 110); },
    otro: () => { tono(330, 0.12, "square", 0.14); tono(262, 0.16, "square", 0.14, 0, 0.1); },
    pista: () => { tono(880, 0.1, "sine", 0.22); tono(1320, 0.18, "sine", 0.2, 0, 0.09); },
    tic: () => tono(1000, 0.05, "square", 0.1),
    completa: () => { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, 0.25, "triangle", 0.26, 0, i * 0.08)); },
    tiki: () => [440, 554, 659, 880].forEach((f, i) => tono(f, 0.16, "square", 0.18, 0, i * 0.06)),
    fin: () => [440, 370, 311, 220].forEach((f, i) => tono(f, 0.3, "triangle", 0.26, 0, i * 0.18)),
  };
}

const PLANTILLA = `
<canvas class="sp-fondo" data-fondo></canvas>
<div class="sp-cab">
  <button type="button" class="sp-btn" data-sp="salir" aria-label="Salir">✕</button>
  <div class="sp-marc"><div class="sp-reloj" data-reloj data-no-t>2:00</div><div class="sp-pts"><b data-pts data-no-t>0</b></div></div>
  <button type="button" class="sp-btn" data-sp="pausa" aria-label="Pausa">❚❚</button>
</div>
<div class="sp-tema"><small>Tema</small><b data-tema data-no-t></b></div>
<div class="sp-chips" data-chips></div>
<div class="sp-cur" data-cur data-no-t>&nbsp;</div>
<div class="sp-zona" data-zona><canvas class="sp-cv" data-cv></canvas></div>
<div class="sp-pie"><button type="button" class="sp-pista" data-sp="pista"><span>💡 Pista</span><small data-coste data-no-t>−10 s</small></button><button type="button" class="sp-pista sp-ver" data-sp="ver"><span data-vertxt>👁 Ver respuestas</span></button></div>
<div class="sp-menu" data-menu>
  <div class="sp-caja">
    <p class="sp-kicker">Juego de letras</p>
    <h2 class="sp-titulo" data-no-t><span>CRACKS</span><span>OCULTOS</span></h2>
    <div class="sp-mini" aria-hidden="true"><i>M</i><i>E</i><i>S</i><i>S</i><i>I</i></div>
    <p class="sp-mejor"><span>Mejor puntuación</span> <b data-mejor data-no-t>0</b></p>
    <button type="button" class="sp-jugar" data-sp="jugar">Jugar</button>
    <ul class="sp-como">
      <li><b>1</b><span>Cada letra de la cuadrícula forma parte de un futbolista del tema.</span></li>
      <li><b>2</b><span>Desliza el dedo por letras vecinas (también en diagonal) para descubrir los nombres.</span></li>
      <li><b>3</b><span>Cada cuadrícula completa suma tiempo. ¡Aguanta todo lo que puedas!</span></li>
    </ul>
  </div>
</div>
<div class="sp-pausa" data-pausa hidden>
  <div class="sp-caja sp-caja--s"><h3>Pausa</h3>
    <button type="button" class="sp-jugar" data-sp="seguir">Continuar</button>
    <button type="button" class="sp-sec" data-sp="salir">Salir</button></div>
</div>
<div class="sp-fin" data-fin hidden>
  <div class="sp-caja sp-caja--s"><p class="sp-kicker">Se acabó el tiempo</p>
    <h3 data-finpts data-no-t>0</h3>
    <p class="sp-nuevo" data-nuevo hidden>🏆 Nuevo récord</p>
    <p class="sp-datos"><span>Cuadrículas</span> <b data-fincuad data-no-t>0</b> · <span>Nombres</span> <b data-finnom data-no-t>0</b></p>
    <p class="sp-datos"><span>Mejor puntuación</span> <b data-finmejor data-no-t>0</b></p>
    <p class="sp-tikis" data-fintiki hidden>🎁 +1 tikitexto</p>
    <button type="button" class="sp-jugar" data-sp="jugar">Volver a jugar</button>
    <button type="button" class="sp-sec" data-sp="salir">Salir</button></div>
</div>`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  const reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s);
  const cv = $("[data-cv]"), ctx = cv.getContext("2d"), zona = $("[data-zona]"), fondo = $("[data-fondo]"), fctx = fondo.getContext("2d");
  const au = crearAudio(api);
  const fam = getComputedStyle(raiz).fontFamily || "system-ui, sans-serif";
  const datos = () => { const d = api.datos(); ["mejor", "part", "cuad", "nom"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); return d; };
  const loc = (n) => n.toLocaleString(api.locale || undefined);

  const S = {
    fase: "menu", t: TIEMPO, pts: 0, cuad: 0, nom: 0, combo: 0, puz: null, camino: [], toque: false, tikis: 0, ultimoTema: null,
    pistasSeguidas: 0, sacudida: 0, destello: 0, flashMal: 0, nuevoRecord: false, trans: 0, mal: 0, tic: 0,
  };
  let cs = 40, ox = 0, oy = 0, dpr = 1, raf = 0, ultimo = 0, vivo = true, tAnim = 0, sel = -1;
  const parts = [], popups = [];
  let letrasFondo = [];

  /* ── Interfaz ── */
  function pintarPts() { const e = $("[data-pts]"), v = loc(Math.floor(S.pts)); if (e.textContent !== v) { e.textContent = v; e.classList.remove("sp-sube"); void e.offsetWidth; e.classList.add("sp-sube"); } }
  function pintarReloj() {
    const s = Math.max(0, Math.ceil(S.t)), e = $("[data-reloj]"), v = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    if (e.textContent !== v) e.textContent = v;
    e.classList.toggle("sp-apuro", s <= 10 && S.fase === "juego");
  }
  function pintarChips() {
    const box = $("[data-chips]"); box.innerHTML = "";
    S.puz.nombres.forEach((n) => {
      const d = document.createElement("span"); d.className = "sp-chip" + (n.ok ? " ok" : "");
      d.setAttribute("data-no-t", "");
      if (n.ok || n.rev) { d.textContent = n.s; d.style.setProperty("--c", n.col); if (n.rev && !n.ok) d.classList.add("rev"); }
      else { d.textContent = n.s.split("").map((ch, k) => (k < n.pista ? ch : "·")).join(" "); if (n.pista) { d.classList.add("sp-con-pista"); d.style.setProperty("--c", n.col); } }
      box.appendChild(d);
    });
  }
  function pintarCur(txt, cls) { const e = $("[data-cur]"); e.textContent = txt || " "; e.className = "sp-cur" + (cls ? " " + cls : ""); }
  function popup(txt, x, y, c, sz) { if (popups.length > 8) popups.shift(); popups.push({ txt: txt, x: x, y: y, c: c || "#fff", sz: sz || 20, t: 0, max: 1.3 }); }
  function chispas(x, y, n, col, vel) {
    if (reducido) n = Math.ceil(n / 3);
    for (let i = 0; i < n && parts.length < 300; i++) { const a = Math.random() * 6.283, v = rnd(0.3, 1) * vel; parts.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - vel * 0.25, life: 0, max: rnd(0.4, 0.95), c: col, s: rnd(1.5, 3.6) }); }
  }
  const centro = (i) => [ox + (i % C + 0.5) * cs, oy + (Math.floor(i / C) + 0.5) * cs];

  /* ── Partida ── */
  function nuevaCuadricula() {
    const p = generar(S.ultimoTema);
    if (!p) { S.puz = generar(null); } else S.puz = p;
    S.ultimoTema = S.puz.tema; S.camino = []; S.toque = false; S.trans = 0; S.pistasSeguidas = 0; pintarCoste();
    $("[data-tema]").textContent = t(S.puz.tema.t);
    pintarChips(); pintarCur("");
  }
  function pintarCoste() { const e = $("[data-coste]"); if (e) e.textContent = "−" + (S.pistasSeguidas > 0 ? COSTE_PISTA_SEG : COSTE_PISTA) + " s"; }
  function pintarVer() { const e = $("[data-vertxt]"); if (e) e.textContent = S.fase === "revela" ? t("Siguiente →") : t("👁 Ver respuestas"); }
  function empezar() {
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; $("[data-pausa]").hidden = true;
    S.t = TIEMPO; S.pts = 0; S.cuad = 0; S.nom = 0; S.combo = 0; S.tikis = 0; S.nuevoRecord = false; S.ultimoTema = null;
    parts.length = 0; popups.length = 0; S.fase = "juego"; au.activar();
    nuevaCuadricula(); pintarVer(); pintarPts(); pintarReloj(); ajustar();
  }
  function darTiki() {
    try { api.tiki(); } catch (e) { /* opcional */ }
    S.tikis++; au.tiki(); popup("🎁 +1 tikitexto", ox + cs * C / 2, oy + cs * 1.2, "#ffe94a", 22);
  }
  function finPartida() {
    S.fase = "fin"; S.camino = []; au.fin();
    const d = datos(); d.part++; d.cuad += S.cuad; d.nom += S.nom;
    S.nuevoRecord = S.pts > d.mejor && S.pts > 0; if (S.nuevoRecord) d.mejor = Math.floor(S.pts);
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-finpts]").textContent = loc(Math.floor(S.pts)); $("[data-nuevo]").hidden = !S.nuevoRecord;
    $("[data-fincuad]").textContent = String(S.cuad); $("[data-finnom]").textContent = String(S.nom);
    $("[data-finmejor]").textContent = loc(d.mejor); $("[data-fintiki]").hidden = S.tikis === 0;
    setTimeout(function () { if (vivo && S.fase === "fin") { $("[data-fin]").hidden = false; if (S.nuevoRecord) { try { api.victoria(); } catch (e) { /* opcional */ } } } }, 700);
  }
  function evaluar() {
    const cam = S.camino; S.toque = false;
    if (cam.length < 2) { S.camino = []; pintarCur(""); return; }
    const s = cam.map((i) => S.puz.grid[i]).join(""), r = s.split("").reverse().join("");
    const idx = S.puz.nombres.findIndex((n) => !n.ok && (n.s === s || n.s === r));
    if (idx >= 0) {
      const n = S.puz.nombres[idx], a = cam.slice().sort((x, y) => x - y).join(","), b = n.cells.slice().sort((x, y) => x - y).join(",");
      if (a === b) { acierto(n); return; }
      au.otro(); pintarCur(t("Ese nombre está, pero por otro camino"), "otro"); S.camino = []; setTimeout(function () { if (vivo) pintarCur(""); }, 1200); return;
    }
    if (cam.length >= 3) { S.combo = 0; S.sacudida = reducido ? 0 : 1; S.flashMal = 1; au.mal(); pintarCur(s, "mal"); setTimeout(function () { if (vivo) pintarCur(""); }, 500); } else { pintarCur(""); }
    S.camino = [];
  }
  function acierto(n) {
    n.ok = true; S.combo++; S.nom++; S.pistasSeguidas = 0; pintarCoste();
    const v = Math.round(100 * n.s.length * (1 + Math.min(S.combo - 1, 6) * 0.25) * (n.pista ? 0.6 : 1));
    S.pts += v; au.ok(S.combo); S.destello = 0.6;
    const c = centro(n.cells[Math.floor(n.cells.length / 2)]); popup("+" + v, c[0], c[1], n.col, 24);
    n.cells.forEach((i) => { const p = centro(i); chispas(p[0], p[1], 8, n.col, 220); });
    if (S.combo >= 2) popup("COMBO ×" + S.combo, ox + cs * C / 2, oy - 6, "#ffe94a", 18);
    S.camino = []; pintarCur(n.s, "bien"); pintarChips(); pintarPts();
    setTimeout(function () { if (vivo) pintarCur(""); }, 900);
    if (S.puz.nombres.every((x) => x.ok)) completa();
  }
  function completa() {
    S.cuad++; S.t = Math.min(TIEMPO_MAX, S.t + BONUS_T); S.pts += 500 + S.cuad * 100; pintarPts(); pintarReloj();
    S.fase = "trans"; S.trans = 0; au.completa(); S.destello = 1;
    popup("¡" + t("Cuadrícula completa") + "!", ox + cs * C / 2, oy + cs * R / 2, "#41ff8a", 30);
    popup("+" + BONUS_T + " s", ox + cs * C / 2, oy + cs * R / 2 + 36, "#19e6ff", 24);
    for (let i = 0; i < 40; i++) chispas(ox + cs * C / 2, oy + cs * R / 2, 1, COLS[i % COLS.length], 420);
    if (S.cuad === 2 || S.cuad === 5) darTiki();
  }
  function pista() {
    if (S.fase !== "juego") return;
    const cand = S.puz.nombres.filter((n) => !n.ok && n.pista < n.cells.length); if (!cand.length) return;
    const mx = Math.max.apply(null, cand.map((n) => n.pista)), top = cand.filter((n) => n.pista === mx), n = top[Math.floor(Math.random() * top.length)];
    const coste = S.pistasSeguidas > 0 ? COSTE_PISTA_SEG : COSTE_PISTA; S.pistasSeguidas++;
    const q = centro(n.cells[n.pista]); n.pista++;
    S.t = Math.max(1, S.t - coste); au.pista(); pintarChips(); pintarReloj(); pintarCoste();
    chispas(q[0], q[1], 10, n.col, 160); popup("−" + coste + " s", ox + cs * C / 2, oy - 8, "#ff6b7c", 18);
  }
  function verRespuestas() {
    if (S.fase === "revela") { S.fase = "juego"; nuevaCuadricula(); pintarVer(); return; }
    if (S.fase !== "juego") return;
    S.t = Math.max(1, S.t - COSTE_VER); S.combo = 0; S.camino = []; S.toque = false; arrastre = false;
    S.puz.nombres.forEach((n) => { if (!n.ok) n.rev = true; });
    S.fase = "revela"; au.pista(); pintarChips(); pintarCur(""); pintarReloj(); pintarVer();
    popup("−" + COSTE_VER + " s", ox + cs * C / 2, oy - 8, "#ff6b7c", 18);
  }

  /* ── Entrada ── */
  function celdaEn(e) {
    const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * (cv.width / dpr / r.width), y = (e.clientY - r.top) * (cv.height / dpr / r.height);
    const c = Math.floor((x - ox) / cs), f = Math.floor((y - oy) / cs); if (c < 0 || c >= C || f < 0 || f >= R) return -1;
    const cx = ox + (c + 0.5) * cs, cy = oy + (f + 0.5) * cs; if (Math.hypot(x - cx, y - cy) > cs * 0.44) return -1;
    return f * C + c;
  }
  const bloqueada = (i) => S.puz.nombres.some((n) => n.ok && n.cells.indexOf(i) >= 0);
  const vecina = (a, b) => NEI[a].indexOf(b) >= 0;
  function añade(i) {
    const cam = S.camino;
    if (i < 0 || bloqueada(i)) return;
    if (!cam.length) { cam.push(i); au.letra(0); }
    else {
      const ult = cam[cam.length - 1];
      if (i === ult) return;
      if (cam.length >= 2 && i === cam[cam.length - 2]) { cam.pop(); au.quita(); }
      else if (vecina(ult, i) && cam.indexOf(i) < 0) { cam.push(i); au.letra(cam.length - 1); }
      else return;
    }
    pintarCur(cam.map((k) => S.puz.grid[k]).join(""), "");
  }
  let arrastre = false;
  function bajar(e) {
    if (S.fase !== "juego") return;
    e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* opcional */ } au.activar();
    const i = celdaEn(e);
    if (S.toque && S.camino.length) {
      const ult = S.camino[S.camino.length - 1];
      if (i === ult) { evaluar(); return; }
      if (i >= 0 && vecina(ult, i) && S.camino.indexOf(i) < 0) { arrastre = true; añade(i); return; }
      S.camino = []; S.toque = false;
    }
    S.camino = []; arrastre = true; añade(i);
  }
  function mover(e) {
    if (!arrastre || S.fase !== "juego") return;
    const i = celdaEn(e); if (i >= 0) añade(i);
    sel = i;
  }
  function subir() {
    if (!arrastre) return; arrastre = false;
    if (S.fase !== "juego") return;
    if (S.camino.length === 1) { S.toque = true; return; }
    evaluar();
  }
  function pausar(v) {
    if (S.fase !== "juego" && S.fase !== "pausa") return;
    S.fase = v ? "pausa" : "juego"; $("[data-pausa]").hidden = !v; arrastre = false;
  }
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf);
    document.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("resize", ajustar);
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  const onKey = (e) => {
    if (e.code === "Escape" || e.code === "KeyP") { if (S.fase === "juego" || S.fase === "pausa") { e.preventDefault(); pausar(S.fase === "juego"); } }
    else if ((e.code === "Space" || e.code === "Enter") && (S.fase === "menu" || S.fase === "fin")) { e.preventDefault(); empezar(); }
    else if (e.code === "KeyH" && S.fase === "juego") pista();
  };
  const onVis = () => { if (document.hidden && S.fase === "juego") pausar(true); };
  cv.addEventListener("pointerdown", bajar); cv.addEventListener("pointermove", mover); cv.addEventListener("pointerup", subir); cv.addEventListener("pointercancel", subir);
  raiz.addEventListener("click", function (e) {
    const b = e.target.closest && e.target.closest("[data-sp]"); if (!b) return;
    const a = b.dataset.sp;
    if (a === "salir") cerrar(); else if (a === "jugar") empezar(); else if (a === "pausa") pausar(S.fase === "juego"); else if (a === "seguir") pausar(false); else if (a === "pista") pista(); else if (a === "ver") verRespuestas();
  });
  raiz.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", onKey); document.addEventListener("visibilitychange", onVis); window.addEventListener("resize", ajustar);

  /* ── Dibujo ── */
  function ajustar() {
    const r = zona.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(160, r.width - 12), h = Math.max(200, r.height - 8);
    cs = Math.floor(Math.min(w / C, h / R)); const W = cs * C + 8, H = cs * R + 8;
    cv.style.width = W + "px"; cv.style.height = H + "px"; cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr); ox = 4; oy = 4;
    fondo.width = Math.ceil(raiz.clientWidth * Math.min(dpr, 1.5)); fondo.height = Math.ceil(raiz.clientHeight * Math.min(dpr, 1.5));
    letrasFondo = []; const n = Math.round(raiz.clientWidth * raiz.clientHeight / 26000);
    for (let i = 0; i < n; i++) letrasFondo.push({ x: Math.random(), y: Math.random(), l: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)], s: rnd(22, 70), v: rnd(0.004, 0.012), a: rnd(0.04, 0.1) });
  }
  function dibujarFondo(dt) {
    const w = fondo.width, h = fondo.height; fctx.clearRect(0, 0, w, h);
    const k = Math.min(dpr, 1.5); fctx.textAlign = "center"; fctx.textBaseline = "middle";
    letrasFondo.forEach((l) => {
      if (!reducido) { l.y -= l.v * dt; if (l.y < -0.1) { l.y = 1.1; l.x = Math.random(); } }
      fctx.globalAlpha = l.a; fctx.fillStyle = "#19e6ff"; fctx.font = "900 " + Math.round(l.s * k) + "px " + fam; fctx.fillText(l.l, l.x * w, l.y * h);
    });
    fctx.globalAlpha = 1;
  }
  function dibujar() {
    const c = ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    if (!S.puz) return;
    c.save();
    if (S.sacudida > 0) c.translate(Math.sin(tAnim * 70) * 5 * S.sacudida, 0);
    const p = S.puz, r = cs * 0.4;
    // líneas de nombres encontrados
    p.nombres.forEach((n) => {
      if (!n.ok && !n.rev) return; c.save(); c.strokeStyle = n.col; c.globalAlpha = n.ok ? 0.55 : 0.35; c.lineWidth = cs * 0.22; c.lineCap = c.lineJoin = "round"; c.shadowColor = n.col; c.shadowBlur = 14;
      c.beginPath(); n.cells.forEach((i, k) => { const q = centro(i); k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); c.restore();
    });
    // fichas
    for (let i = 0; i < N; i++) {
      const q = centro(i), dueño = p.nombres.find((n) => (n.ok || n.rev) && n.cells.indexOf(i) >= 0), enCam = S.camino.indexOf(i);
      c.save(); c.translate(q[0], q[1]);
      if (dueño) { if (!dueño.ok) c.globalAlpha = 0.75; c.shadowColor = dueño.col; c.shadowBlur = 14; c.fillStyle = dueño.col; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill(); c.shadowBlur = 0; c.fillStyle = "#06121c"; }
      else {
        const g = c.createRadialGradient(-r * 0.3, -r * 0.35, 2, 0, 0, r); g.addColorStop(0, "rgba(40,70,130,.95)"); g.addColorStop(1, "rgba(8,16,40,.95)");
        c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill();
        c.lineWidth = enCam >= 0 ? 3 : 1.5; c.strokeStyle = enCam >= 0 ? "#ffe94a" : "rgba(25,230,255,.4)"; if (enCam >= 0) { c.shadowColor = "#ffe94a"; c.shadowBlur = 14; } c.stroke(); c.shadowBlur = 0;
        c.fillStyle = enCam >= 0 ? "#ffe94a" : "#fff";
      }
      c.font = "900 " + Math.round(cs * 0.42) + "px " + fam; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(p.grid[i], 0, cs * 0.02);
      c.restore();
    }
    // pistas: cada letra revelada se redondea y se va llenando con el color de su nombre
    p.nombres.forEach((n) => { if (n.ok || n.rev) return; for (let k = 0; k < n.pista; k++) { const q = centro(n.cells[k]), v = (Math.sin(tAnim * 5 + k) + 1) / 2; c.save(); c.globalAlpha = 0.28 + v * 0.12; c.fillStyle = n.col; c.beginPath(); c.arc(q[0], q[1], r, 0, 6.283); c.fill(); c.globalAlpha = 0.9; c.strokeStyle = n.col; c.lineWidth = 4; c.shadowColor = n.col; c.shadowBlur = 12; c.beginPath(); c.arc(q[0], q[1], r + 2, 0, 6.283); c.stroke(); c.restore(); } });
    // camino actual
    if (S.camino.length > 1) {
      c.save(); c.strokeStyle = "#fff"; c.globalAlpha = 0.85; c.lineWidth = cs * 0.16; c.lineCap = c.lineJoin = "round"; c.shadowColor = "#ffe94a"; c.shadowBlur = 16;
      c.beginPath(); S.camino.forEach((i, k) => { const q = centro(i); k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); c.restore();
    }
    // partículas y textos
    c.save(); c.globalCompositeOperation = "lighter";
    parts.forEach((q) => { c.globalAlpha = 1 - q.life / q.max; c.fillStyle = q.c; c.beginPath(); c.arc(q.x, q.y, q.s, 0, 6.283); c.fill(); });
    c.restore(); c.globalAlpha = 1; c.textAlign = "center"; c.textBaseline = "middle";
    popups.forEach((q) => {
      const k = q.t / q.max, a = k < 0.12 ? k / 0.12 : k > 0.7 ? Math.max(0, (1 - k) / 0.3) : 1;
      c.save(); c.globalAlpha = a; c.font = "900 " + q.sz + "px " + fam; c.lineWidth = Math.max(3, q.sz / 5); c.strokeStyle = "rgba(0,0,0,.75)"; c.lineJoin = "round";
      c.strokeText(q.txt, q.x, q.y); c.fillStyle = q.c; c.fillText(q.txt, q.x, q.y); c.restore();
    });
    if (S.flashMal > 0) { c.fillStyle = "rgba(255,60,90," + (S.flashMal * 0.18).toFixed(3) + ")"; c.fillRect(0, 0, cv.width, cv.height); }
    if (S.destello > 0) { c.fillStyle = "rgba(255,255,255," + (S.destello * 0.18).toFixed(3) + ")"; c.fillRect(0, 0, cv.width, cv.height); }
    c.restore();
  }
  function actualizar(dt) {
    tAnim += dt;
    if (S.sacudida > 0) S.sacudida = Math.max(0, S.sacudida - dt * 3.5);
    if (S.flashMal > 0) S.flashMal = Math.max(0, S.flashMal - dt * 3);
    if (S.destello > 0) S.destello = Math.max(0, S.destello - dt * 1.8);
    for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.life += dt; if (q.life >= q.max) { parts.splice(i, 1); continue; } q.vy += 220 * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    for (let i = popups.length - 1; i >= 0; i--) { const q = popups[i]; q.t += dt; q.y -= 24 * dt; if (q.t >= q.max) popups.splice(i, 1); }
    if (S.fase === "juego") {
      S.t -= dt; pintarReloj();
      const s = Math.ceil(S.t); if (s <= 10 && s !== S.tic && s > 0) { S.tic = s; au.tic(); }
      if (S.t <= 0) { S.t = 0; pintarReloj(); finPartida(); }
    } else if (S.fase === "trans") { S.trans += dt; if (S.trans > 1.7) { S.fase = "juego"; nuevaCuadricula(); } }
  }
  function bucle(ms) {
    if (!vivo) return; raf = requestAnimationFrame(bucle);
    const dt = Math.min(0.05, (ms - ultimo) / 1000 || 0.016); ultimo = ms;
    if (S.fase !== "pausa") actualizar(dt);
    dibujarFondo(dt); dibujar();
  }
  $("[data-mejor]").textContent = loc(datos().mejor);
  S.puz = generar(null); $("[data-tema]").textContent = t(S.puz.tema.t); pintarChips();
  ajustar(); raf = requestAnimationFrame(bucle);
  /* Solo para las pruebas automáticas */
  function resolverUno() { const n = S.puz.nombres.find((x) => !x.ok); if (!n) return false; S.camino = n.cells.slice(); evaluar(); return true; }
  return { cerrar: cerrar, pista: pista, verRespuestas: verRespuestas, S: S, empezar: empezar, actualizar: actualizar, resolverUno: resolverUno, generar: generar, TEMAS: TEMAS, constantes: { C: C, R: R } };
}
