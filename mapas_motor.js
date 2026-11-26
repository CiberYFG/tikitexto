/* MAPAS · motor del mapa (26-nov-2026)
   Mapa propio en <canvas> 2D: Web Mercator, arrastrar, zoom con dos dedos / rueda / doble toque, inercia,
   teselas 10m bajo demanda (mapas/t/x_y.bin), mundo 50m siempre cargado (mapas/mundo.bin), ciudades y países con
   etiquetas por zoom y sin solaparse, carreteras que aparecen al acercarte y marcadores/línea de resultado.
   Datos: Natural Earth (dominio público), convertidos con tools/mapas_construir.py. Sin recursos externos ni dependencias.
   API: crearMapa(contenedor, opciones) → { vista, volarA, encuadra, ponMarcadores, setTema, setEtiquetas, destruir, ... } */

const G = 262144, NT = 16, EXT = G / NT, ZT = 4.3, ZMAX = 9.6;
const LAT_MAX = 85.0511287798;
export const IDIOMAS = ["es", "en", "pt", "fr", "it", "de"];

/* ───── proyección ───── */
export function proyecta(lon, lat) {
  lat = Math.max(-LAT_MAX, Math.min(LAT_MAX, lat));
  return { x: (lon + 180) / 360, y: 0.5 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / (2 * Math.PI) };
}
export function invierte(x, y) {
  const n = Math.PI - 2 * Math.PI * y;
  return { lon: x * 360 - 180, lat: (Math.atan(Math.sinh(n)) * 180) / Math.PI };
}
export function distanciaKm(a, b) {
  const R = 6371.0088, r = Math.PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lon - a.lon) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/* ───── estilos (atlas de papel / atlas nocturno) ───── */
export const TEMAS = {
  claro: {
    mar: "#bcd9ec", marOnda: "#a9cde5", tierra: ["#f4efe2", "#efe8d4", "#f6f0df", "#ece5d1", "#f2ecd9", "#eae3cf", "#f5efe4"],
    frontera: "rgba(150,132,104,.75)", costa: "#6f9fc2", lago: "#bcd9ec", rio: "#8bb8d6",
    vias: ["#e07b2a", "#eba24d", "#d9cfb6"], viasBorde: "rgba(255,255,255,.7)",
    texto: "#26323f", halo: "rgba(255,255,255,.88)", pais: "#6b5f4b", agua: "#3f7aa6", punto: "#2b3744", capital: "#b3261e",
    escala: "#26323f", pin: "#e0321f", real: "#0b8f4d", linea: "#e0321f",
  },
  oscuro: {
    mar: "#0a1829", marOnda: "#0d2036", tierra: ["#18283d", "#1b2d44", "#16263a", "#1d3048", "#1a2b41", "#172739", "#1c2f47"],
    frontera: "rgba(170,200,235,.38)", costa: "#4f86b8", lago: "#0a1829", rio: "#2f6e9f",
    vias: ["#f0a93a", "#a98a4c", "#4a5d73"], viasBorde: "rgba(5,12,22,.55)",
    texto: "#dbe8f6", halo: "rgba(6,14,26,.9)", pais: "#8da6c2", agua: "#5b93c2", punto: "#e9f2fc", capital: "#ffcf4a",
    escala: "#cfe0f2", pin: "#ff5b45", real: "#34e089", linea: "#ff7a66",
  },
};

/* Mares y océanos (etiquetas a mano, 6 idiomas: es, en, pt, fr, it, de) */
const MARES = [
  [-38, 28, 0.5, 4.6, ["Océano Atlántico", "Atlantic Ocean", "Oceano Atlântico", "océan Atlantique", "Oceano Atlantico", "Atlantischer Ozean"]],
  [-150, 12, 0.5, 4.6, ["Océano Pacífico", "Pacific Ocean", "Oceano Pacífico", "océan Pacifique", "Oceano Pacifico", "Pazifischer Ozean"]],
  [78, -14, 0.5, 4.6, ["Océano Índico", "Indian Ocean", "Oceano Índico", "océan Indien", "Oceano Indiano", "Indischer Ozean"]],
  [10, 80, 1.5, 4.6, ["Océano Ártico", "Arctic Ocean", "Oceano Ártico", "océan Arctique", "Oceano Artico", "Arktischer Ozean"]],
  [17, 35, 3.2, 7, ["Mar Mediterráneo", "Mediterranean Sea", "Mar Mediterrâneo", "mer Méditerranée", "Mar Mediterraneo", "Mittelmeer"]],
  [3, 56, 4.5, 8, ["Mar del Norte", "North Sea", "Mar do Norte", "mer du Nord", "Mare del Nord", "Nordsee"]],
  [-75, 15, 3.8, 7, ["Mar Caribe", "Caribbean Sea", "Mar do Caribe", "mer des Caraïbes", "Mar dei Caraibi", "Karibisches Meer"]],
  [34, 43.5, 4.6, 8, ["Mar Negro", "Black Sea", "Mar Negro", "mer Noire", "Mar Nero", "Schwarzes Meer"]],
  [19, 58.5, 4.8, 8, ["Mar Báltico", "Baltic Sea", "Mar Báltico", "mer Baltique", "Mar Baltico", "Ostsee"]],
  [-90, 25, 4, 7, ["Golfo de México", "Gulf of Mexico", "Golfo do México", "golfe du Mexique", "Golfo del Messico", "Golf von Mexiko"]],
  [-5, 45, 5, 8, ["Golfo de Vizcaya", "Bay of Biscay", "Golfo da Biscaia", "golfe de Gascogne", "Golfo di Biscaglia", "Golf von Biskaya"]],
  [15, 42.8, 5.4, 8.5, ["Mar Adriático", "Adriatic Sea", "Mar Adriático", "mer Adriatique", "Mare Adriatico", "Adria"]],
  [38.5, 20.5, 4.8, 8, ["Mar Rojo", "Red Sea", "Mar Vermelho", "mer Rouge", "Mar Rosso", "Rotes Meer"]],
  [-20, -50, 1.2, 4, ["Océano Austral", "Southern Ocean", "Oceano Antártico", "océan Austral", "Oceano Antartico", "Südpolarmeer"]],
];

/* ───── decodificación binaria ───── */
function decodifica(buf) {
  const d = new Uint8Array(buf);
  if (d[0] !== 84 || d[1] !== 49) throw new Error("formato de mapa no válido");
  const shift = d[2];
  let p = 3;
  const uv = () => { let n = 0, m = 1, b; do { b = d[p++]; n += (b & 127) * m; m *= 128; } while (b >= 128); return n; };
  const secs = [];
  for (let s = 0; s < 5; s++) {
    const g = new Map(), n = uv(), cierra = s < 2;
    for (let i = 0; i < n; i++) {
      const attr = d[p++], np = uv();
      let path = g.get(attr);
      if (!path) { path = new Path2D(); g.set(attr, path); }
      let a = uv(), b = uv();
      let x = a & 1 ? -(a + 1) / 2 : a / 2, y = b & 1 ? -(b + 1) / 2 : b / 2;
      path.moveTo(x, y);
      for (let k = 1; k < np; k++) {
        a = uv(); b = uv();
        x += a & 1 ? -(a + 1) / 2 : a / 2; y += b & 1 ? -(b + 1) / 2 : b / 2;
        path.lineTo(x, y);
      }
      if (cierra) path.closePath();
    }
    secs.push(g);
  }
  return { shift: shift, secs: secs };
}

const hoyLuz = () => Date.now();

export function crearMapa(cont, op) {
  op = op || {};
  const base = op.base || "mapas/";
  const idioma = IDIOMAS.indexOf(op.idioma) >= 0 ? op.idioma : "es";
  const fuente = op.fuente || '"TikiMapa", system-ui, sans-serif';
  let tema = op.tema === "claro" ? "claro" : "oscuro";
  let P = TEMAS[tema];
  const cv = document.createElement("canvas");
  cv.className = "mp-lienzo"; cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab;background:" + P.mar;
  cont.appendChild(cv);
  const mctx = cv.getContext("2d");
  let ctx = mctx;                       // destino actual de dibujo (principal u offscreen)
  const bg = document.createElement("canvas"), bctx = bg.getContext("2d");
  let bw = 300, bh = 300, bref = null, baseInvalida = true, ultimoRender = 0, tIdle = 0;
  let w = 300, h = 300, dpr = 1;
  let cx = 0.5, cy = 0.42, z = 1.4;
  let etiq = { paises: op.paises !== false, ciudades: op.ciudades !== false, mares: op.mares !== false, carreteras: op.carreteras !== false };
  let marcadores = [], destruido = false, sucio = true, raf = 0, interactivo = true;
  let mundo = null, indice = null;
  const teselas = new Map(); // clave -> {estado:"carga"|"lista"|"error", datos, uso}
  let ciudades = null, nombresC = null, paisesD = null;

  /* ───── datos ───── */
  const getBin = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u + " " + r.status); return r.arrayBuffer(); });
  const getJson = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(u + " " + r.status); return r.json(); });
  const listo = Promise.all([
    getBin(base + "mundo.bin").then((b) => { mundo = decodifica(b); invalida(); }),
    getJson(base + "t/index.json").then((j) => { indice = new Set(j); invalida(); }),
    getJson(base + "ciudades.json").then((j) => { ciudades = j.map((c) => { const q = proyecta(c[0], c[1]); return { x: q.x, y: q.y, lon: c[0], lat: c[1], pop: c[2], mz: c[3], cap: c[4], iso: c[5], asc: c[6] }; }); invalida(); }),
    getJson(base + "n_" + idioma + ".json").then((j) => { nombresC = j; invalida(); }),
    getJson(base + "paises.json").then((j) => { paisesD = j.map((c) => { const q = proyecta(c[0], c[1]); return { x: q.x, y: q.y, mn: c[2], mx: c[3], iso: c[4], pop: c[5], nom: c[6 + IDIOMAS.indexOf(idioma)] }; }).sort((a, b) => b.pop - a.pop); invalida(); }),
  ]).catch((e) => { try { console.error("mapa: no se pudo cargar", e); } catch (er) { /* sin consola */ } if (op.alError) op.alError(e); });

  function pedirTesela(tx, ty) {
    const k = tx + "_" + ty;
    let t = teselas.get(k);
    if (t) { t.uso = hoyLuz(); return t; }
    t = { estado: "carga", datos: null, uso: hoyLuz() };
    teselas.set(k, t);
    getBin(base + "t/" + k + ".bin").then((b) => { t.datos = decodifica(b); t.estado = "lista"; invalida(); }).catch(() => { t.estado = "error"; invalida(); });
    return t;
  }
  function limpiaTeselas() {
    if (teselas.size < 48) return;
    const orden = [...teselas.entries()].filter((e) => e[1].estado !== "carga").sort((a, b) => a[1].uso - b[1].uso);
    for (let i = 0; i < orden.length - 30; i++) teselas.delete(orden[i][0]);
  }

  /* ───── vista ───── */
  const anchoMundo = () => 256 * Math.pow(2, z);
  function zMin() { return Math.max(0.2, Math.log2(Math.max(w, 1) / 256)); }
  /* holgura: zonas de la pantalla tapadas por paneles (en píxeles). El mapa puede desplazarse esos píxeles más allá de sus bordes,
     así los puntos que hay que encuadrar nunca quedan debajo de un panel aunque estén muy separados. */
  let holg = { t: 0, r: 0, b: 0, l: 0 };
  const entre = (v, lo, hi) => (lo <= hi ? Math.max(lo, Math.min(hi, v)) : (lo + hi) / 2);
  function acota() {
    z = Math.max(zMin(), Math.min(ZMAX, z));
    const W = anchoMundo();
    const mx = w / 2 / W, my = h / 2 / W;
    cx = entre(cx, mx - holg.l / W, 1 - mx + holg.r / W);
    cy = entre(cy, my - holg.t / W, 1 - my + holg.b / W);
  }
  const aPantalla = (x, y) => { const W = anchoMundo(); return { x: w / 2 + (x - cx) * W, y: h / 2 + (y - cy) * W }; };
  const dePantalla = (sx, sy) => { const W = anchoMundo(); return { x: cx + (sx - w / 2) / W, y: cy + (sy - h / 2) / W }; };
  function pedir() { sucio = true; if (!raf && !destruido) raf = requestAnimationFrame(bucle); }
  function invalida() { baseInvalida = true; pedir(); }
  function cambio() {
    if (op.alMover) { try { op.alMover(vista()); } catch (e) { /* opcional */ } }
    clearTimeout(tIdle); tIdle = setTimeout(invalida, 130);   // al parar, la base se vuelve a pintar nítida
    pedir();
  }
  function vista() { const c = invierte(cx, cy); return { lon: c.lon, lat: c.lat, z: z, w: w, h: h }; }

  function medir() {
    const r = cont.getBoundingClientRect();
    const nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
    const nd = Math.min(window.devicePixelRatio || 1, 2.5);
    if (nw === w && nh === h && nd === dpr) return;
    w = nw; h = nh; dpr = nd;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const m = Math.round(Math.max(w, h) * 0.35);
    bw = w + 2 * m; bh = h + 2 * m;
    bg.width = Math.round(bw * dpr); bg.height = Math.round(bh * dpr);
    acota(); baseInvalida = true; pedir();
  }
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(medir) : null;
  if (ro) ro.observe(cont);
  window.addEventListener("resize", medir);
  medir();

  /* ───── animación de vuelo ───── */
  let vuelo = null, inercia = null;
  function volarA(lon, lat, zz, ms, alTerminar) {
    const q = proyecta(lon, lat);
    inercia = null;
    zz = Math.max(zMin(), Math.min(ZMAX, zz == null ? z : zz));
    if (!ms) { cx = q.x; cy = q.y; z = zz; acota(); cambio(); if (alTerminar) alTerminar(); return; }
    vuelo = { t0: performance.now(), ms: ms, x0: cx, y0: cy, z0: z, x1: q.x, y1: q.y, z1: zz, fin: alTerminar };
    pedir();
  }
  function encuadra(puntos, relleno, ms, zTope) {
    /* relleno: número (todos los lados) o {t, r, b, l} para dejar libres zonas tapadas por paneles */
    const R = typeof relleno === "object" && relleno ? { t: relleno.t || 0, r: relleno.r || 0, b: relleno.b || 0, l: relleno.l || 0 } : { t: relleno == null ? 60 : relleno, r: relleno == null ? 60 : relleno, b: relleno == null ? 60 : relleno, l: relleno == null ? 60 : relleno };
    if (!puntos.length) return;
    const ps = puntos.map((p) => proyecta(p.lon, p.lat));
    let x0 = 2, x1 = -1, y0 = 2, y1 = -1;
    ps.forEach((p) => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); });
    const dx = Math.max(x1 - x0, 1e-9), dy = Math.max(y1 - y0, 1e-9);
    const aw = Math.max(40, w - R.l - R.r), ah = Math.max(40, h - R.t - R.b);
    let zz = Math.log2(Math.min(aw / dx, ah / dy) / 256);
    zz = Math.min(zz, zTope == null ? 7.5 : zTope);
    zz = Math.max(zMin(), Math.min(ZMAX, zz));
    const W2 = 256 * Math.pow(2, zz);
    // el centro de la caja debe quedar en el centro del área libre (no en el de la pantalla)
    const ox = (w / 2 - (R.l + aw / 2)) / W2, oy = (h / 2 - (R.t + ah / 2)) / W2;
    const c = invierte((x0 + x1) / 2 + ox, (y0 + y1) / 2 + oy);
    holg = { t: R.t, r: R.r, b: R.b, l: R.l };
    volarA(c.lon, c.lat, zz, ms == null ? 900 : ms);
  }
  function pasoVuelo(ahora) {
    if (!vuelo) return false;
    const t = Math.min(1, (ahora - vuelo.t0) / vuelo.ms), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    // el zoom se interpola en escala logarítmica y el centro se corrige para que el movimiento sea suave
    z = vuelo.z0 + (vuelo.z1 - vuelo.z0) * e;
    cx = vuelo.x0 + (vuelo.x1 - vuelo.x0) * e; cy = vuelo.y0 + (vuelo.y1 - vuelo.y0) * e;
    acota();
    if (t >= 1) { const f = vuelo.fin; vuelo = null; if (f) { try { f(); } catch (e2) { /* opcional */ } } }
    return true;
  }

  /* ───── gestos ───── */
  const ptrs = new Map();
  let gest = null, ultimaPulsacion = 0;
  function pos(e) { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function zoomEn(sx, sy, nz) {
    nz = Math.max(zMin(), Math.min(ZMAX, nz));
    const antes = dePantalla(sx, sy);
    z = nz;
    const W = anchoMundo();
    cx = antes.x - (sx - w / 2) / W; cy = antes.y - (sy - h / 2) / W;
    acota();
  }
  cv.addEventListener("pointerdown", (e) => {
    if (!interactivo) return;
    cv.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, pos(e));
    vuelo = null; inercia = null;
    const t = performance.now();
    if (ptrs.size === 1) gest = { tipo: "pan", t0: t, mov: 0, vx: 0, vy: 0, tl: t, pdx: 0, pdy: 0, panning: false };
    else if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      gest = { tipo: "pinch", d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: z, mov: 99, tl: t, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    }
    cv.style.cursor = "grabbing";
  });
  cv.addEventListener("pointermove", (e) => {
    if (!ptrs.has(e.pointerId) || !gest) return;
    const p = pos(e), prev = ptrs.get(e.pointerId);
    ptrs.set(e.pointerId, p);
    if (gest.tipo === "pan" && ptrs.size === 1) {
      const dx = p.x - prev.x, dy = p.y - prev.y, W = anchoMundo(), t = performance.now();
      gest.mov += Math.abs(dx) + Math.abs(dy);
      gest.pdx += dx; gest.pdy += dy;
      if (gest.mov > 5 || gest.panning) { gest.panning = true; cx -= gest.pdx / W; cy -= gest.pdy / W; gest.pdx = gest.pdy = 0; acota(); cambio(); }
      const dt = Math.max(1, t - gest.tl);
      gest.vx = 0.7 * gest.vx + 0.3 * (-dx / W / dt); gest.vy = 0.7 * gest.vy + 0.3 * (-dy / W / dt); gest.tl = t;
    } else if (ptrs.size >= 2 && gest.tipo === "pinch") {
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const antes = dePantalla(gest.mx, gest.my);
      z = Math.max(zMin(), Math.min(ZMAX, gest.z0 + Math.log2(d / gest.d)));
      const W = anchoMundo();
      cx = antes.x - (mx - w / 2) / W; cy = antes.y - (my - h / 2) / W;
      gest.mx = mx; gest.my = my;
      acota(); cambio();
    }
  });
  function fin(e) {
    if (!ptrs.has(e.pointerId)) return;
    const g = gest;
    ptrs.delete(e.pointerId);
    try { cv.releasePointerCapture(e.pointerId); } catch (er) { /* ya liberado */ }
    if (ptrs.size === 0) {
      cv.style.cursor = "grab";
      const t = performance.now();
      if (g && g.tipo === "pan" && e.type === "pointerup") {
        if (g.mov <= 6 && t - g.t0 < 600) {
          const p = pos(e);
          if (t - ultimaPulsacion < 320) { ultimaPulsacion = 0; const q0 = dePantalla(p.x, p.y), ll = invierte(q0.x, q0.y); volarA(ll.lon, ll.lat, Math.min(ZMAX, z + 1.2), 320); }
          else { ultimaPulsacion = t; if (op.alTocar) { const q = dePantalla(p.x, p.y), ll = invierte(q.x, q.y); op.alTocar({ lon: ll.lon, lat: ll.lat, x: p.x, y: p.y }); } }
        } else if (t - g.tl < 80 && Math.hypot(g.vx, g.vy) * anchoMundo() > 0.05) {
          inercia = { vx: g.vx, vy: g.vy, t: t }; pedir();
        }
      }
      gest = null;
    } else if (ptrs.size === 1) {
      gest = { tipo: "pan", t0: performance.now(), mov: 99, vx: 0, vy: 0, tl: performance.now(), pdx: 0, pdy: 0, panning: true };
    }
  }
  cv.addEventListener("pointerup", fin);
  cv.addEventListener("pointercancel", fin);
  cv.addEventListener("wheel", (e) => {
    if (!interactivo) return;
    e.preventDefault();
    vuelo = null; inercia = null;
    const p = pos(e);
    const k = e.ctrlKey ? 0.015 : (e.deltaMode === 1 ? 0.25 : 0.006);
    zoomEn(p.x, p.y, z - e.deltaY * k);
    cambio();
  }, { passive: false });
  cv.addEventListener("dblclick", (e) => e.preventDefault());

  function teclado(e) {
    if (!interactivo || destruido) return;
    const t = e.target && e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA") return;
    const W = anchoMundo(), paso = 80 / W;
    if (e.key === "+" || e.key === "=") { volarA(vista().lon, vista().lat, z + 0.8, 220); }
    else if (e.key === "-" || e.key === "_") { volarA(vista().lon, vista().lat, z - 0.8, 220); }
    else if (e.key === "ArrowLeft") { cx -= paso; acota(); cambio(); }
    else if (e.key === "ArrowRight") { cx += paso; acota(); cambio(); }
    else if (e.key === "ArrowUp") { cy -= paso; acota(); cambio(); }
    else if (e.key === "ArrowDown") { cy += paso; acota(); cambio(); }
    else return;
    e.preventDefault();
  }
  document.addEventListener("keydown", teclado);

  /* ───── dibujo ───── */
  function dibujaGrupoTierra(datos, ox, oy, s) {
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    datos.secs[0].forEach((path, attr) => { ctx.fillStyle = P.tierra[(attr - 1 + 7) % 7]; ctx.fill(path, "evenodd"); });
    ctx.fillStyle = P.lago;
    datos.secs[1].forEach((path) => ctx.fill(path, "evenodd"));
  }
  function lineas(datos, ox, oy, s, sec, estilo, px, filtro) {
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    ctx.strokeStyle = estilo; ctx.lineWidth = px / s;
    datos.secs[sec].forEach((path, attr) => { if (!filtro || filtro(attr)) ctx.stroke(path); });
  }

  function mundoBloque(clip) {
    const W = anchoMundo(), s = W / (G / (1 << mundo.shift)), o = aPantalla(0, 0);
    dibujaGrupoTierra(mundo, o.x, o.y, s);
    if (clip) { /* los bordes del mundo se recortan fuera */ }
    lineas(mundo, o.x, o.y, s, 3, P.frontera, z > 5 ? 1.1 : 0.7);
    lineas(mundo, o.x, o.y, s, 2, P.costa, z > 5 ? 1.3 : z > 2.5 ? 0.9 : 0.65);
  }
  function rioMundo() {
    if (z > 7.4) return;
    const W = anchoMundo(), s = W / (G / (1 << mundo.shift)), o = aPantalla(0, 0);
    ctx.globalAlpha = z > 6.4 ? Math.max(0, 1 - (z - 6.4)) : 1;
    lineas(mundo, o.x, o.y, s, 4, P.rio, Math.min(1.5, 0.5 + (z - 3) * 0.15), (a) => a / 4 <= z + 0.6);
    ctx.globalAlpha = 1;
  }

  function dibujaTesela(t, tx, ty, capa) {
    const W = anchoMundo(), s = W / G, o = aPantalla((tx * EXT) / G, (ty * EXT) / G);
    if (capa === "tierra") dibujaGrupoTierra(t.datos, o.x, o.y, s);
    else if (capa === "frontera") lineas(t.datos, o.x, o.y, s, 3, P.frontera, z > 6 ? 1.3 : 0.9);
    else if (capa === "costa") lineas(t.datos, o.x, o.y, s, 2, P.costa, z > 6 ? 1.5 : 1);
    else if (capa === "via") {
      const cls = (c, px, col, borde) => {
        const filtro = (a) => a >> 6 === c && (((a & 63) + 12) / 4) <= z + 0.35;
        if (borde) lineas(t.datos, o.x, o.y, s, 4, P.viasBorde, px + 1.6, filtro);
        lineas(t.datos, o.x, o.y, s, 4, col, px, filtro);
      };
      const k = Math.max(0, z - 5);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      cls(2, 0.5 + k * 0.08, P.vias[2], false);
      cls(1, 0.7 + k * 0.15, P.vias[1], z > 7);
      cls(0, 1 + k * 0.22, P.vias[0], z > 6.5);
      ctx.lineCap = "butt";
    }
  }

  function dibujaMapa() {
    const W = anchoMundo();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = P.mar; ctx.fillRect(0, 0, w, h);
    if (!mundo) return;
    const modoTesela = z >= ZT && indice;
    let visibles = [];
    if (modoTesela) {
      const a = dePantalla(0, 0), b = dePantalla(w, h);
      const tx0 = Math.max(0, Math.floor(a.x * NT)), tx1 = Math.min(NT - 1, Math.floor(b.x * NT));
      const ty0 = Math.max(0, Math.floor(a.y * NT)), ty1 = Math.min(NT - 1, Math.floor(b.y * NT));
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
        const k = tx + "_" + ty;
        if (!indice.has(k)) continue;
        visibles.push({ tx: tx, ty: ty, t: pedirTesela(tx, ty) });
      }
      limpiaTeselas();
    }
    const faltan = visibles.filter((v) => v.t.estado !== "lista");
    if (!modoTesela) { mundoBloque(); rioMundo(); }
    else {
      if (faltan.length) {
        // mientras llegan las teselas se ve el mundo grueso solo en esas zonas
        ctx.save();
        ctx.beginPath();
        faltan.forEach((v) => { const o = aPantalla((v.tx * EXT) / G, (v.ty * EXT) / G), tw = (EXT / G) * W; ctx.rect(o.x - 1, o.y - 1, tw + 2, tw + 2); });
        ctx.clip();
        mundoBloque();
        ctx.restore();
      }
      const listas = visibles.filter((v) => v.t.estado === "lista");
      ctx.save();
      listas.forEach((v) => dibujaTesela(v.t, v.tx, v.ty, "tierra"));
      rioMundo();
      listas.forEach((v) => dibujaTesela(v.t, v.tx, v.ty, "frontera"));
      listas.forEach((v) => dibujaTesela(v.t, v.tx, v.ty, "costa"));
      if (etiq.carreteras && z >= 4.7) listas.forEach((v) => dibujaTesela(v.t, v.tx, v.ty, "via"));
      ctx.restore();
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ───── etiquetas ───── */
  let rejilla = null;
  const CEL = 48;
  function limpiaRejilla() { rejilla = new Map(); }
  function libre(x0, y0, x1, y1) {
    for (let gy = Math.floor(y0 / CEL); gy <= Math.floor(y1 / CEL); gy++) for (let gx = Math.floor(x0 / CEL); gx <= Math.floor(x1 / CEL); gx++) {
      const l = rejilla.get(gx + "," + gy);
      if (l) for (let i = 0; i < l.length; i++) { const b = l[i]; if (x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]) return false; }
    }
    return true;
  }
  function ocupa(x0, y0, x1, y1) {
    for (let gy = Math.floor(y0 / CEL); gy <= Math.floor(y1 / CEL); gy++) for (let gx = Math.floor(x0 / CEL); gx <= Math.floor(x1 / CEL); gx++) {
      const k = gx + "," + gy; let l = rejilla.get(k);
      if (!l) { l = []; rejilla.set(k, l); }
      l.push([x0, y0, x1, y1]);
    }
  }
  function texto(txt, x, y, px, peso, col, alineado, cursiva, sep) {
    ctx.font = (cursiva ? "italic " : "") + peso + " " + px + "px " + fuente;
    ctx.textAlign = alineado; ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) ctx.letterSpacing = (sep || 0) + "px";
    ctx.lineWidth = 3; ctx.strokeStyle = P.halo; ctx.lineJoin = "round";
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = col; ctx.fillText(txt, x, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  }
  function medida(txt, px, peso, cursiva, sep) {
    ctx.font = (cursiva ? "italic " : "") + peso + " " + px + "px " + fuente;
    if ("letterSpacing" in ctx) ctx.letterSpacing = (sep || 0) + "px";
    const m = ctx.measureText(txt).width;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    return m;
  }

  function dibujaEtiquetas() {
    if (!mundo) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    limpiaRejilla();
    // los marcadores (chincheta o balón y su rótulo) reservan su sitio: así ninguna ciudad se pinta debajo de ellos
    marcadores.forEach((m) => {
      if (m.tipo === "zona") return;
      const q0 = proyecta(m.lon, m.lat), p0 = aPantalla(q0.x, q0.y);
      ocupa(p0.x - 16, p0.y - 46, p0.x + 16, p0.y + 14);
      if (m.etiqueta) { const a0 = medida(m.etiqueta, 12, 700, false, 0) / 2 + 4; ocupa(p0.x - a0, p0.y + 4, p0.x + a0, p0.y + 30); }
    });
    const W = anchoMundo(), idx = IDIOMAS.indexOf(idioma);
    // mares
    if (etiq.mares) MARES.forEach((m) => {
      if (z < m[2] || z > m[3]) return;
      const q = proyecta(m[0], m[1]), p = aPantalla(q.x, q.y);
      if (p.x < -80 || p.x > w + 80 || p.y < -20 || p.y > h + 20) return;
      const txt = m[4][idx], px = z < 3 ? 12 : 13, a = medida(txt, px, 500, true, 2);
      if (!libre(p.x - a / 2, p.y - 9, p.x + a / 2, p.y + 9)) return;
      ocupa(p.x - a / 2, p.y - 9, p.x + a / 2, p.y + 9);
      texto(txt, p.x, p.y, px, 500, P.agua, "center", true, 2);
    });
    // 1) capitales y grandes ciudades, 2) países, 3) resto de ciudades
    const a0 = dePantalla(-40, -40), a1 = dePantalla(w + 40, h + 40);
    let nUsadas = 0;
    const ponCiudad = (i, c) => {
      const lim = c.cap ? c.mz - 0.6 : c.mz - 0.15;
      if (z < Math.max(2.4, lim)) return;
      const p = aPantalla(c.x, c.y);
      const r = c.pop > 5e6 ? 3.4 : c.pop > 1e6 ? 2.8 : c.pop > 2e5 ? 2.2 : 1.7;
      if (!libre(p.x - r - 1, p.y - r - 1, p.x + r + 1, p.y + r + 1)) return;
      const px = c.pop > 5e6 ? 13 : c.pop > 1e6 ? 12 : 11, peso = c.pop > 1e6 ? 600 : 500, txt = nombresC[i] || c.asc;
      const a = medida(txt, px, peso, false, 0);
      let lado = 1, bx = p.x + r + 4, by = p.y;
      if (!libre(bx - 1, by - 8, bx + a + 1, by + 8)) { lado = -1; bx = p.x - r - 4 - a; if (!libre(bx - 1, by - 8, bx + a + 1, by + 8)) { lado = 0; } }
      ocupa(p.x - r - 1, p.y - r - 1, p.x + r + 1, p.y + r + 1);
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832);
      ctx.fillStyle = c.cap ? P.capital : P.punto; ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = P.halo; ctx.stroke();
      if (c.cap) { ctx.beginPath(); ctx.arc(p.x, p.y, r + 2.4, 0, 6.2832); ctx.lineWidth = 1; ctx.strokeStyle = P.capital; ctx.stroke(); }
      if (lado !== 0) { ocupa(bx - 1, by - 8, bx + a + 1, by + 8); texto(txt, lado === 1 ? bx : bx + a, by, px, peso, P.texto, lado === 1 ? "left" : "right", false, 0); }
      nUsadas++;
    };
    const verCiudades = etiq.ciudades && ciudades && nombresC;
    if (verCiudades) for (let i = 0; i < ciudades.length && nUsadas < 120; i++) {
      const c = ciudades[i];
      if (!(c.cap || c.pop > 3e6)) continue;
      if (c.x < a0.x || c.x > a1.x || c.y < a0.y || c.y > a1.y) continue;
      ponCiudad(i, c);
    }
    if (etiq.paises && paisesD) {
      for (let i = 0; i < paisesD.length; i++) {
        const c = paisesD[i];
        if (z < c.mn - 0.2 || z > c.mx + 1.6) continue;
        const p = aPantalla(c.x, c.y);
        if (p.x < -60 || p.x > w + 60 || p.y < -20 || p.y > h + 20) continue;
        const px = z < 3 ? 10 : z < 6 ? 11 : 12, txt = c.nom.toUpperCase(), a = medida(txt, px, 700, false, 1.5);
        if (a > W * 0.6) continue;
        if (!libre(p.x - a / 2, p.y - 8, p.x + a / 2, p.y + 8)) continue;
        ocupa(p.x - a / 2, p.y - 8, p.x + a / 2, p.y + 8);
        texto(txt, p.x, p.y, px, 700, P.pais, "center", false, 1.5);
      }
    }
    if (verCiudades) for (let i = 0; i < ciudades.length && nUsadas < 460; i++) {
      const c = ciudades[i];
      if (c.cap || c.pop > 3e6) continue;
      if (c.x < a0.x || c.x > a1.x || c.y < a0.y || c.y > a1.y) continue;
      ponCiudad(i, c);
    }
  }

  /* ───── marcadores, línea y escala ───── */
  function pin(x, y, col, t, etiqueta) {
    const k = Math.min(1, t), e = 1 - Math.pow(1 - k, 3), yy = y - (1 - e) * 30;
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 2.2);
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    ctx.beginPath(); ctx.moveTo(x, yy);
    ctx.bezierCurveTo(x - 16, yy - 18, x - 13, yy - 38, x, yy - 38);
    ctx.bezierCurveTo(x + 13, yy - 38, x + 16, yy - 18, x, yy);
    ctx.fillStyle = col; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
    ctx.beginPath(); ctx.arc(x, yy - 25, 5, 0, 6.2832); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.restore();
    if (etiqueta) texto(etiqueta, x, yy + 12, 12, 700, P.texto, "center", false, 0);
  }
  function balon(x, y, col, t, etiqueta) {
    const k = Math.min(1, t), e = 1 - Math.pow(1 - k, 3), r = 13 * (0.4 + 0.6 * e);
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 2);
    ctx.beginPath(); ctx.arc(x, y, r + 7 + 4 * Math.sin(hoyLuz() / 260), 0, 6.2832);
    ctx.fillStyle = col + "33"; ctx.fill();
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = "#fff"; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke();
    ctx.fillStyle = "#16202b";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; ctx.lineTo(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42); }
    ctx.closePath(); ctx.fill();
    ctx.restore();
    if (etiqueta) texto(etiqueta, x, y + r + 14, 12, 700, P.texto, "center", false, 0);
  }
  function dibujaMarcadores() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ahora = hoyLuz();
    const ps = marcadores.map((m) => { const q = proyecta(m.lon, m.lat), p = aPantalla(q.x, q.y); return { m: m, x: p.x, y: p.y, t: Math.min(1, (ahora - m.t0) / 420) }; });
    // línea entre marcadores con "linea"
    const l = ps.filter((p) => p.m.linea);
    if (l.length === 2) {
      const prog = Math.min(1, Math.max(0, (ahora - Math.max(l[0].m.t0, l[1].m.t0) - 200) / 700)), e = 1 - Math.pow(1 - prog, 3);
      ctx.save();
      ctx.setLineDash([7, 7]); ctx.lineWidth = 2.5; ctx.strokeStyle = P.linea; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(l[0].x, l[0].y); ctx.lineTo(l[0].x + (l[1].x - l[0].x) * e, l[0].y + (l[1].y - l[0].y) * e); ctx.stroke();
      ctx.restore();
    }
    ps.forEach((p) => {
      const m = p.m;
      if (m.radioKm) {
        const W = anchoMundo(), kmPx = (40075.017 * Math.cos((m.lat * Math.PI) / 180)) / W, r = m.radioKm / kmPx;
        if (r > 6) { ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fillStyle = m.color + "22"; ctx.fill(); ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5; ctx.strokeStyle = m.color; ctx.stroke(); ctx.setLineDash([]); }
      }
    });
    ps.forEach((p) => { if (p.m.tipo === "pin") pin(p.x, p.y, p.m.color, p.t, p.m.etiqueta); else if (p.m.tipo === "balon") balon(p.x, p.y, p.m.color, p.t, p.m.etiqueta); /* "zona": solo el círculo */ });
    if (ps.some((p) => p.t < 1 || p.m.tipo === "balon")) pedir();
  }
  function dibujaEscala() {
    if (op.escala === false) return;
    const W = anchoMundo(), lat = invierte(cx, cy).lat, mpp = (40075016.686 * Math.cos((lat * Math.PI) / 180)) / W;
    const objetivo = 90 * mpp, pot = Math.pow(10, Math.floor(Math.log10(objetivo))), f = objetivo / pot;
    const paso = f >= 5 ? 5 : f >= 2 ? 2 : 1, m = paso * pot, px = m / mpp;
    const txt = m >= 1000 ? m / 1000 + " km" : m + " m";
    const x = 14, y = h - 14 - (op.escalaBajo || 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 3; ctx.strokeStyle = P.halo; ctx.lineCap = "butt";
    ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x, y); ctx.lineTo(x + px, y); ctx.lineTo(x + px, y - 5); ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = P.escala;
    ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x, y); ctx.lineTo(x + px, y); ctx.lineTo(x + px, y - 5); ctx.stroke();
    texto(txt, x, y - 13, 11, 600, P.escala, "left", false, 0);
  }

  /* La base (mar, tierra, líneas y etiquetas) se pinta en un lienzo más grande que la pantalla; al arrastrar o
     hacer zoom solo se desplaza/escala ese bitmap (barato) y al parar se vuelve a pintar nítido. */
  function renderBase() {
    const sw = w, sh = h;
    ctx = bctx; w = bw; h = bh;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujaMapa();
    dibujaEtiquetas();
    ctx = mctx; w = sw; h = sh;
    bref = { cx: cx, cy: cy, z: z };
    baseInvalida = false; ultimoRender = performance.now();
  }
  function cubre() {
    if (!bref) return false;
    const k = Math.pow(2, z - bref.z), c = aPantalla(bref.cx, bref.cy);
    const x0 = c.x - (bw * k) / 2, y0 = c.y - (bh * k) / 2;
    return k > 0.7 && k < 1.6 && x0 <= 0.5 && y0 <= 0.5 && x0 + bw * k >= w - 0.5 && y0 + bh * k >= h - 0.5;
  }
  function compone() {
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!bref) { mctx.fillStyle = P.mar; mctx.fillRect(0, 0, w, h); return; }
    const k = Math.pow(2, z - bref.z), c = aPantalla(bref.cx, bref.cy);
    let x0 = c.x - (bw * k) / 2, y0 = c.y - (bh * k) / 2;
    if (Math.abs(k - 1) < 1e-9) { x0 = Math.round(x0 * dpr) / dpr; y0 = Math.round(y0 * dpr) / dpr; }
    mctx.fillStyle = P.mar; mctx.fillRect(0, 0, w, h);
    mctx.drawImage(bg, 0, 0, bg.width, bg.height, x0, y0, bw * k, bh * k);
  }
  function bucle() {
    raf = 0;
    if (destruido) return;
    const hayVuelo = pasoVuelo(performance.now());
    if (inercia) {
      const t = performance.now(), dt = Math.min(40, t - inercia.t), W = anchoMundo();
      cx += inercia.vx * dt; cy += inercia.vy * dt; inercia.vx *= Math.pow(0.04, dt / 1000); inercia.vy *= Math.pow(0.04, dt / 1000); inercia.t = t;
      acota();
      if (Math.abs(inercia.vx * W) < 0.004 && Math.abs(inercia.vy * W) < 0.004) inercia = null;
      cambio();
    }
    if (sucio || hayVuelo) {
      sucio = false;
      const activo = ptrs.size > 0 || hayVuelo || inercia;
      if (baseInvalida || !cubre()) {
        if (!bref || !activo || performance.now() - ultimoRender > 45 || !cubre()) renderBase();
      }
      compone();
      dibujaMarcadores();
      dibujaEscala();
      if (hayVuelo) cambio();
    }
    if (vuelo || inercia || baseInvalida) pedir();
  }
  pedir();

  /* ───── API ───── */
  const M = {
    listo: listo,
    vista: vista,
    proyecta: proyecta,
    aPantalla: (lon, lat) => { const q = proyecta(lon, lat); return aPantalla(q.x, q.y); },
    dePantalla: (sx, sy) => { const q = dePantalla(sx, sy); return invierte(q.x, q.y); },
    volarA: volarA,
    encuadra: encuadra,
    zoomMas: (d) => { const v = vista(); volarA(v.lon, v.lat, z + (d == null ? 1 : d), 260); },
    ponMarcadores: (lista) => { const ahora = hoyLuz(); marcadores = lista.map((m) => Object.assign({ t0: ahora, tipo: "pin", color: "#e0321f" }, m)); invalida(); },
    marcadores: () => marcadores.slice(),
    nombreCiudad: (i) => (nombresC && nombresC[i]) || (ciudades && ciudades[i] && ciudades[i].asc) || "",
    nombrePais: (iso) => { const p = paisesD && paisesD.find((q) => q.iso === iso); return p ? p.nom : ""; },
    setTema: (t) => { tema = t === "claro" ? "claro" : "oscuro"; P = TEMAS[tema]; cv.style.background = P.mar; invalida(); },
    setEtiquetas: (o) => { etiq = Object.assign(etiq, o); invalida(); },
    setHolgura: (o) => { holg = Object.assign({ t: 0, r: 0, b: 0, l: 0 }, o || {}); acota(); invalida(); },
    setInteractivo: (v) => { interactivo = !!v; },
    redibuja: pedir,
    forzarDibujo: () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } baseInvalida = true; sucio = true; bucle(); },
    estadoTeselas: () => [...teselas.entries()].map((e) => e[0] + ":" + e[1].estado),
    destruir: () => { destruido = true; clearTimeout(tIdle); if (raf) cancelAnimationFrame(raf); if (ro) ro.disconnect(); window.removeEventListener("resize", medir); document.removeEventListener("keydown", teclado); cv.remove(); },
    canvas: cv,
    zMin: zMin,
    _t: { base: renderBase, compone: compone },
  };
  return M;
}
