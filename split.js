/* TIKITEXTO · pantalla dividida al entrar en «Juegos» (Letras · Videojuegos · Mapas).
   Una «Y» de tres cuñas separadas por rayos. Todo se calcula aquí (geometría de los recortes, rayos,
   centro que respira y sigue al ratón, cuña que crece al apuntarla y animación al elegir).
   Sin dependencias ni recursos externos. Respeta prefers-reduced-motion.
   Atajos: 1 = letras, 2 = videojuegos, 3 = mapas. Esc lo gestiona index.html. */
(function () {
  "use strict";
  var sp = document.getElementById("vistaSplit");
  if (!sp) return;
  var h = document.documentElement, RAD = Math.PI / 180;
  var reducido = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  var lados = {}, txts = {};
  Array.prototype.forEach.call(sp.querySelectorAll(".vs__lado"), function (el) {
    var n = el.getAttribute("data-vs"); lados[n] = el; txts[n] = el.querySelector(".vs__txt");
    txts[n].style.left = "0"; txts[n].style.top = "0";
  });
  var hub = sp.querySelector(".vs__hub");
  var svg = sp.querySelector(".vs__rayo");
  var grupos = Array.prototype.slice.call(svg.querySelectorAll("g"));
  if (hub) { hub.style.left = "0"; hub.style.top = "0"; }

  /* Rayos (grados, sentido horario con y hacia abajo) y reparto de las cuñas: la cuña i está entre el rayo i y el i+1.
     Horizontal: Y con el tronco hacia abajo (Mapas abajo, Letras a la izquierda, Videojuegos a la derecha).
     Vertical: Y invertida (Letras arriba, Videojuegos abajo a la izquierda, Mapas abajo a la derecha). */
  var DISP = {
    h: { ang: [24, 156, 270], nom: ["mapas", "letras", "dinamicos"], cy: 0.46 },
    v: { ang: [90, 204, 336], nom: ["dinamicos", "letras", "mapas"], cy: 0.5 }
  };
  var ORDEN_TECLAS = ["letras", "dinamicos", "mapas"];

  var E = {
    abierto: false, W: 0, H: 0, min: 0, o: "h", d: DISP.h, base: { x: 0, y: 0 }, c: { x: 0, y: 0 },
    hover: null, foco: null, ptr: { x: 0, y: 0, on: false }, p: 1, t0: 0, sel: null, selT0: 0, selC0: null, fin: false,
    top: 0, raf: 0, last: 0, areas: [0, 0, 0], anclas: {}, timers: []
  };

  function ease(p) { return 1 - Math.pow(1 - p, 3); }
  function hash(k, j) { var s = Math.sin(k * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); }

  /* ---------- medidas ---------- */
  function medir() {
    E.W = sp.clientWidth || window.innerWidth; E.H = sp.clientHeight || window.innerHeight;
    E.o = E.W / E.H >= 1.05 ? "h" : "v"; E.d = DISP[E.o];
    E.min = Math.min(E.W, E.H);
    E.top = E.o === "v" ? 112 : 0; /* franja del botón «Inicio» y del título: los textos de las cuñas no entran ahí */
    E.base = { x: E.W / 2, y: E.H * E.d.cy };
    sp.classList.toggle("vs--v", E.o === "v");
    sp.style.setProperty("--vs-k", Math.max(0.58, Math.min(1.15, E.min / 720)).toFixed(3));
    svg.setAttribute("viewBox", "0 0 " + E.W + " " + E.H);
    colocaFx();
  }

  /* ---------- decoración alrededor del texto de cada cuña ---------- */
  var fxL = [], fxD = [];
  function creaFx() {
    var cl = lados.letras && lados.letras.querySelector(".vs__fx"), cd = lados.dinamicos && lados.dinamicos.querySelector(".vs__fx");
    var letras = "TIKITEXTOGOLAZO", cls = ["g", "y", "n"], k, s;
    if (cl) for (k = 0; k < 12; k++) {
      s = document.createElement("span"); s.className = "vs__t vs__t--" + cls[k % 3]; s.textContent = letras.charAt(k);
      s.style.transform = "rotate(" + ((k * 37) % 30 - 15) + "deg)"; cl.appendChild(s); fxL.push(s);
    }
    var em = ["⚽", "🎮", "⚡", "🏆", "🕹️", "🥅", "🔥", "⚽"];
    if (cd) for (k = 0; k < em.length; k++) {
      s = document.createElement("span"); s.className = "vs__e"; s.textContent = em[k];
      s.style.fontSize = (26 + (k * 7) % 22) + "px"; cd.appendChild(s); fxD.push(s);
    }
  }
  function colocaFx() {
    var k = parseFloat(sp.style.getPropertyValue("--vs-k")) || 1, rx = 255 * k, ry = 168 * k, i, an;
    for (i = 0; i < fxL.length; i++) { an = i / fxL.length * 6.2832 + 0.3; fxL[i].style.left = Math.round(Math.cos(an) * rx - 20 * k) + "px"; fxL[i].style.top = Math.round(Math.sin(an) * ry - 20 * k) + "px"; }
    for (i = 0; i < fxD.length; i++) { an = i / fxD.length * 6.2832 + 0.7; fxD[i].style.left = Math.round(Math.cos(an) * rx * 1.02 - 18) + "px"; fxD[i].style.top = Math.round(Math.sin(an) * ry * 1.02 - 18) + "px"; }
  }

  /* ---------- geometría ---------- */
  function lejos(c) {
    var m = 0, xs = [0, E.W], ys = [0, E.H];
    for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) m = Math.max(m, Math.hypot(xs[a] - c.x, ys[b] - c.y));
    return m;
  }
  /* Rayo desde c con ángulo a: línea recta o zigzag de rayo (vértices a distancias fijas del centro). */
  function rayo(c, a, j, R, Rp, t, zig) {
    var dx = Math.cos(a * RAD), dy = Math.sin(a * RAD), pts = [{ x: c.x, y: c.y }];
    if (zig) {
      var st = Math.max(46, E.min * 0.085), n = Math.ceil(R / st), amp = E.min * 0.03, k, dist, f;
      if (n > 26) { n = 26; st = R / n; }
      for (k = 1; k <= n; k++) {
        dist = k * st; if (dist >= Rp - st * 0.3) break;
        f = (k % 2 ? 1 : -1) * (0.5 + 0.5 * hash(k, j)) * amp * (1 + (reducido ? 0 : 0.16 * Math.sin(t * 0.0017 + k * 0.9 + j * 2)));
        pts.push({ x: c.x + dx * dist - dy * f, y: c.y + dy * dist + dx * f });
      }
    }
    pts.push({ x: c.x + dx * Rp, y: c.y + dy * Rp });
    return pts;
  }
  function cuna(i, rays, c, Rp) {
    var a = E.d.ang[i], b = E.d.ang[(i + 1) % 3], ra = rays[i], rb = rays[(i + 1) % 3], pts = ra.slice(), g, k;
    if (b <= a) b += 360;
    for (g = a + 9; g < b - 1; g += 9) pts.push({ x: c.x + Math.cos(g * RAD) * Rp, y: c.y + Math.sin(g * RAD) * Rp });
    for (k = rb.length - 1; k >= 1; k--) pts.push(rb[k]);
    return pts;
  }
  function corte(poly, ax, v, mayor) {
    var out = [], n = poly.length, i, a, b, da, db, t;
    for (i = 0; i < n; i++) {
      a = poly[i]; b = poly[(i + 1) % n];
      da = mayor ? a[ax] - v : v - a[ax]; db = mayor ? b[ax] - v : v - b[ax];
      if (da >= 0) out.push(a);
      if ((da >= 0) !== (db >= 0)) { t = da / (da - db); out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); }
    }
    return out;
  }
  function recorta(p) { return corte(corte(corte(corte(p, "x", 0, true), "x", E.W, false), "y", 0, true), "y", E.H, false); }
  function medidas(p) {
    var A = 0, cx = 0, cy = 0, n = p.length, i, a, b, cr;
    for (i = 0; i < n; i++) { a = p[i]; b = p[(i + 1) % n]; cr = a.x * b.y - b.x * a.y; A += cr; cx += (a.x + b.x) * cr; cy += (a.y + b.y) * cr; }
    A /= 2;
    if (Math.abs(A) < 1) return { a: 0, x: E.W / 2, y: E.H / 2 };
    return { a: Math.abs(A), x: cx / (6 * A), y: cy / (6 * A) };
  }
  function poligono(p) {
    if (p.length < 3) return "polygon(0px 0px,0px 0px,0px 0px)";
    var s = "polygon(", i;
    for (i = 0; i < p.length; i++) s += (i ? "," : "") + p[i].x.toFixed(1) + "px " + p[i].y.toFixed(1) + "px";
    return s + ")";
  }
  function bis(i) { var a = E.d.ang[i], b = E.d.ang[(i + 1) % 3]; if (b <= a) b += 360; return (a + b) / 2; }
  function idx(n) { return E.d.nom.indexOf(n); }

  /* ---------- dibujo ---------- */
  function pinta(t) {
    var c = E.c, d = E.d, R = lejos(c) * 1.1, e = ease(E.p), Rp = Math.max(8, R * e), rz = [], rs = [], j, i, n, el, pz, ps, m, mz, pts, s;
    for (j = 0; j < 3; j++) { rz.push(rayo(c, d.ang[j], j, R, Rp, t, true)); rs.push(rayo(c, d.ang[j], j, R, Rp, t, false)); }
    for (i = 0; i < 3; i++) {
      n = d.nom[i]; el = lados[n];
      pz = recorta(cuna(i, rz, c, Rp)); ps = recorta(cuna(i, rs, c, Rp));
      s = poligono(pz); el.style.clipPath = s; el.style.webkitClipPath = s;
      m = medidas(E.top ? corte(ps, "y", E.top, true) : ps); mz = medidas(pz);
      E.areas[i] = mz.a / (E.W * E.H); E.anclas[n] = { x: m.x, y: m.y };
      txts[n].style.transform = "translate3d(" + m.x.toFixed(1) + "px," + m.y.toFixed(1) + "px,0)";
    }
    for (j = 0; j < 3; j++) {
      pts = rz[j].map(function (q) { return q.x.toFixed(1) + "," + q.y.toFixed(1); }).join(" ");
      var pl = grupos[j].querySelectorAll("polyline"), k;
      for (k = 0; k < pl.length; k++) pl[k].setAttribute("points", pts);
      var ch = grupos[j].querySelector("circle");
      if (ch) {
        if (reducido || E.sel || E.p < 1) ch.setAttribute("r", "0");
        else {
          var tot = 0, q = rz[j], seg = [], acc, pos, u;
          for (k = 1; k < q.length; k++) { u = Math.hypot(q[k].x - q[k - 1].x, q[k].y - q[k - 1].y); seg.push(u); tot += u; }
          pos = (((t * 0.00042) + j / 3) % 1) * tot * 0.62 + 40; acc = 0;
          for (k = 0; k < seg.length; k++) {
            if (acc + seg[k] >= pos) { u = (pos - acc) / seg[k]; ch.setAttribute("cx", (q[k].x + (q[k + 1].x - q[k].x) * u).toFixed(1)); ch.setAttribute("cy", (q[k].y + (q[k + 1].y - q[k].y) * u).toFixed(1)); ch.setAttribute("r", "4.5"); break; }
            acc += seg[k];
          }
        }
      }
    }
    if (hub) {
      var sc = E.sel ? 1 - Math.min(1, (t - E.selT0) / 260) : e;
      hub.style.transform = "translate3d(" + c.x.toFixed(1) + "px," + c.y.toFixed(1) + "px,0) scale(" + Math.max(0, sc).toFixed(3) + ")";
    }
  }

  function objetivo(t) {
    var b = E.base, tx = b.x, ty = b.y, n = E.hover || E.foco, a;
    if (!reducido) {
      tx += Math.sin(t * 0.0009) * E.W * 0.006; ty += Math.cos(t * 0.0007) * E.H * 0.006;
      if (E.ptr.on) { tx += (E.ptr.x / E.W - 0.5) * E.W * 0.05; ty += (E.ptr.y / E.H - 0.5) * E.H * 0.05; }
    }
    if (n && idx(n) >= 0) { a = bis(idx(n)) * RAD; tx -= Math.cos(a) * E.min * 0.085; ty -= Math.sin(a) * E.min * 0.085; }
    return { x: tx, y: ty };
  }

  function bucle(ts) {
    E.raf = 0;
    if (!E.abierto) return;
    var dt = Math.min(0.05, (ts - (E.last || ts)) / 1000), seguir = true;
    E.last = ts;
    if (E.p < 1) E.p = Math.min(1, (ts - E.t0) / 560);
    if (E.sel) {
      var q = Math.min(1, (ts - E.selT0) / 440), z = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2, i = idx(E.sel), a = bis(i < 0 ? 0 : i) * RAD, R2 = 2.4 * Math.max(E.W, E.H);
      E.c.x = E.selC0.x + (E.base.x - Math.cos(a) * R2 - E.selC0.x) * z; E.c.y = E.selC0.y + (E.base.y - Math.sin(a) * R2 - E.selC0.y) * z;
      if (q >= 1 && !E.fin) { E.fin = true; terminar(); seguir = false; }
    } else {
      var o = objetivo(ts), k = 1 - Math.exp(-dt * 9);
      E.c.x += (o.x - E.c.x) * k; E.c.y += (o.y - E.c.y) * k;
    }
    pinta(ts);
    if (seguir && E.abierto && !reducido) E.raf = requestAnimationFrame(bucle);
  }
  function pide() {
    if (!E.abierto) return;
    if (reducido) {
      if (E.sel) return;
      var o = objetivo(0); E.c.x = o.x; E.c.y = o.y; pinta(0);
    } else if (!E.raf) E.raf = requestAnimationFrame(bucle);
  }

  /* ---------- abrir, cerrar, elegir ---------- */
  function libera() { E.timers.forEach(clearTimeout); E.timers = []; if (E.raf) { cancelAnimationFrame(E.raf); E.raf = 0; } }
  function abrir() {
    libera(); medir();
    E.abierto = true; E.sel = null; E.fin = false; E.hover = null; E.foco = null; E.last = 0;
    E.c = { x: E.base.x, y: E.base.y }; E.t0 = performance.now(); E.p = reducido ? 1 : 0;
    sp.classList.remove("vs--elige", "vs--fuera"); sp.classList.add("vs--abre");
    Object.keys(lados).forEach(function (n) { lados[n].classList.remove("vs__lado--sel"); });
    pinta(E.t0);
    E.timers.push(setTimeout(function () { sp.classList.remove("vs--abre"); }, 900));
    if (!reducido) E.raf = requestAnimationFrame(bucle);
  }
  function cerrar() {
    E.abierto = false; libera();
    sp.hidden = true; sp.classList.remove("vs--elige", "vs--fuera", "vs--abre"); h.classList.remove("vs-abierto");
  }
  function terminar() {
    sp.classList.add("vs--fuera");
    E.timers.push(setTimeout(cerrar, reducido ? 0 : 190));
  }
  function elegir(n) {
    if (E.sel || !E.abierto || !lados[n]) return;
    var tab = document.querySelector('[data-grupo-btn="' + n + '"]');
    if (tab) tab.click();
    window.scrollTo(0, 0); h.classList.remove("vs-abierto");
    E.sel = n; lados[n].classList.add("vs__lado--sel");
    if (reducido) { terminar(); return; }
    sp.classList.add("vs--elige"); E.selT0 = performance.now(); E.selC0 = { x: E.c.x, y: E.c.y }; E.p = 1;
    if (!E.raf) E.raf = requestAnimationFrame(bucle);
  }

  /* ---------- eventos ---------- */
  creaFx();
  Object.keys(lados).forEach(function (n) {
    var el = lados[n];
    el.addEventListener("click", function () { elegir(n); });
    el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { E.hover = n; pide(); } });
    el.addEventListener("pointerleave", function () { if (E.hover === n) { E.hover = null; pide(); } });
    el.addEventListener("focus", function () { var v = false; try { v = el.matches(":focus-visible"); } catch (e) {} if (v) { E.foco = n; pide(); } });
    el.addEventListener("blur", function () { if (E.foco === n) { E.foco = null; pide(); } });
  });
  sp.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    E.ptr.x = e.clientX; E.ptr.y = e.clientY; E.ptr.on = true; pide();
  });
  sp.addEventListener("pointerleave", function () { E.ptr.on = false; pide(); });
  document.addEventListener("keydown", function (e) {
    if (!E.abierto || sp.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    var i = "123".indexOf(e.key);
    if (e.key.length === 1 && i >= 0) { e.preventDefault(); elegir(ORDEN_TECLAS[i]); }
  });
  window.addEventListener("resize", function () { if (!E.abierto) return; medir(); if (!E.sel) { E.c = { x: E.base.x, y: E.base.y }; } pide(); if (reducido) pinta(0); });

  /* Solo para pruebas */
  window.TIKI_SPLIT = {
    abrir: abrir, cerrar: cerrar, elegir: elegir,
    info: function () {
      return { abierto: E.abierto, o: E.o, W: E.W, H: E.H, nombres: E.d.nom.slice(), areas: E.areas.slice(), anclas: JSON.parse(JSON.stringify(E.anclas)), centro: { x: E.c.x, y: E.c.y }, base: { x: E.base.x, y: E.base.y }, sel: E.sel, reducido: reducido };
    }
  };
})();
