/* TIKITEXTO · pantalla «mundo» al entrar en «Juegos» (Letras · Videojuegos · Mapas).
   Un globo terráqueo visto desde el polo norte y dividido en tres reinos (tres cuñas de colores que se juntan en el logo).
   Todo se dibuja aquí: el globo (canvas 2D, píxel a píxel, con una máscara de tierra propia en mapas/tierra.png), las estrellas,
   las etiquetas (botones reales que viajan con el globo), el giro lento, el arrastre con inercia y la inmersión al elegir.
   Sin dependencias ni recursos externos. Respeta prefers-reduced-motion. Atajos: 1 = letras, 2 = videojuegos, 3 = mapas;
   ← → giran el globo. Esc lo gestiona index.html. Si no hay canvas, queda el respaldo de franjas del CSS. */
(function () {
  "use strict";
  var sp = document.getElementById("vistaSplit");
  if (!sp) return;
  var h = document.documentElement, TAU = Math.PI * 2;
  var reducido = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  var mundo = sp.querySelector(".vs__mundo"), cv = sp.querySelector(".vs__globo"), est = sp.querySelector(".vs__estrellas");
  var hub = sp.querySelector(".vs__hub"), velo = sp.querySelector(".vs__velo");
  var ctx = null, ectx = null;
  try { ctx = cv && cv.getContext("2d"); ectx = est && est.getContext("2d"); } catch (e) { ctx = null; }
  if (!ctx || !mundo) return; /* sin canvas: franjas del CSS y manejadores de index.html */

  /* Reinos: la longitud se reparte en tres cuñas de 120°, con las fronteras en −20°, 100° y 220° (cortan el Atlántico y el Pacífico):
     0 = Letras (Europa, África, Oriente Medio, India), 1 = Mapas (Asia oriental y Pacífico), 2 = Videojuegos (América). */
  var NOM = ["letras", "mapas", "dinamicos"], REINO = { letras: 0, mapas: 1, dinamicos: 2 };
  var ORDEN_TECLAS = ["letras", "dinamicos", "mapas"];
  var COL0 = 455.11; /* columna de la textura (1024 = 360°) donde empieza la cuña 0 */
  var CC = [COL0 + 170.667, COL0 + 512, COL0 + 853.333]; /* columna central de cada cuña */
  var OFF0 = CC[0] - 426.667; /* con el giro a 0, Letras arriba a la izquierda, Videojuegos arriba a la derecha y Mapas abajo */
  var PAL = [
    { o: [4, 46, 54], t: [40, 218, 152], c: [170, 255, 224] },
    { o: [8, 40, 88], t: [255, 206, 58], c: [255, 244, 176] },
    { o: [46, 12, 74], t: [255, 84, 156], c: [255, 200, 230] }
  ];

  var lados = {};
  Array.prototype.forEach.call(sp.querySelectorAll(".vs__lado"), function (el) {
    lados[el.getAttribute("data-vs")] = el; el.style.left = "0"; el.style.top = "0";
  });
  if (hub) { hub.style.left = "0"; hub.style.top = "0"; }

  var E = {
    abierto: false, W: 0, H: 0, D: 0, R: 0, k: 1, rho: 0.6, base: { x: 0, y: 0 }, cx: 0, cy: 0,
    spin: 0, vel: 0, auto: 0.052, hover: null, foco: null, drag: null, ptr: { x: 0, y: 0, on: false },
    p: 1, t0: 0, sel: null, selT0: 0, fin: false, raf: 0, last: 0, timers: [], bri: [1, 1, 1], briT: [1, 1, 1],
    pos: {}, anclas: {}, tierra: false, tierraCargando: false, coste: 0, lentos: 0, nMax: 460, estT: 0, fuga: null
  };
  var TEX = new Uint8Array(1024 * 512);
  var LR = new Uint8Array(48), LG = new Uint8Array(48), LB = new Uint8Array(48);
  var G = { N: 0, cnt: 0, P: null, BC: null, RW: null, SH: null, RR: null, RIM: null, GR: null, img: null, u32: null };

  function ease(p) { return 1 - Math.pow(1 - p, 3); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mod1024(v) { v = v % 1024; return v < 0 ? v + 1024 : v; }

  /* ---------- tabla de colores (cuña × nivel de tierra) ---------- */
  function tabla() {
    var r, l, c, f, cst, j, v, p, b, t;
    for (r = 0; r < 3; r++) {
      p = PAL[r]; b = E.bri[r];
      for (l = 0; l < 16; l++) {
        f = l / 15; cst = (1 - Math.abs(2 * f - 1)) * 0.5; j = r * 16 + l;
        for (c = 0; c < 3; c++) {
          v = p.o[c] + (p.t[c] - p.o[c]) * f; v += (p.c[c] - v) * cst; v *= b; v = v > 255 ? 255 : v;
          t = c === 0 ? LR : c === 1 ? LG : LB; t[j] = v;
        }
      }
    }
  }

  /* ---------- precálculo por píxel (se rehace solo si cambia el tamaño) ---------- */
  function prepara(N) {
    var half = N / 2, tot = N * N, P = new Int32Array(tot), BC = new Float32Array(tot), RW = new Int32Array(tot), SH = new Uint16Array(tot);
    var RR = new Float32Array(tot), RIM = new Uint8Array(tot), GR = new Uint8Array(tot), n = 0, iy, ix, x, y, r2, r, z, ang, phi, row, d, sh, dpx, q, anillos = [], lx, ly, lz, ln;
    for (q = 15; q < 90; q += 15) anillos.push(Math.cos(q * Math.PI / 180));
    lx = -0.42; ly = -0.5; lz = 0.76; ln = Math.sqrt(lx * lx + ly * ly + lz * lz); lx /= ln; ly /= ln; lz /= ln;
    for (iy = 0; iy < N; iy++) for (ix = 0; ix < N; ix++) {
      x = (ix + 0.5 - half) / half; y = (iy + 0.5 - half) / half; r2 = x * x + y * y;
      if (r2 > 1) continue;
      r = Math.sqrt(r2); z = Math.sqrt(1 - r2); ang = Math.atan2(y, x); phi = Math.asin(z);
      row = Math.min(255, ((1 - phi / (Math.PI / 2)) * 256) | 0);
      d = x * lx + y * ly + z * lz; if (d < 0) d = 0;
      sh = (0.4 + 0.72 * d) * (0.62 + 0.38 * Math.pow(z, 0.45));
      P[n] = iy * N + ix; BC[n] = -ang / TAU * 1024; RW[n] = row * 1024; SH[n] = Math.min(330, (sh * 256) | 0);
      RIM[n] = (Math.pow(1 - z, 3) * 110) | 0; RR[n] = r * half;
      dpx = 9; for (q = 0; q < anillos.length; q++) dpx = Math.min(dpx, Math.abs(r - anillos[q]) * half);
      GR[n] = dpx < 0.75 ? 1 : 0;
      n++;
    }
    cv.width = N; cv.height = N;
    G.N = N; G.cnt = n; G.P = P; G.BC = BC; G.RW = RW; G.SH = SH; G.RR = RR; G.RIM = RIM; G.GR = GR;
    G.img = ctx.createImageData(N, N); G.u32 = new Uint32Array(G.img.data.buffer);
  }

  /* ---------- dibujo del globo ---------- */
  function renderGlobo(spin) {
    if (!G.N) return;
    var cnt = G.cnt, P = G.P, BC = G.BC, RW = G.RW, SH = G.SH, RR = G.RR, RIM = G.RIM, GR = G.GR, u = G.u32;
    var off = mod1024(OFF0 - spin * 1024 / TAU), sw = Math.max(1.4, G.N / 150), sw5 = sw * 5;
    var k, lc, rc, f, ri, fr, d, px, L, j, s, r, g, b, a, q;
    for (k = 0; k < cnt; k++) {
      lc = BC[k] + off; if (lc < 0) lc += 1024; else if (lc >= 1024) lc -= 1024;
      rc = lc - COL0; if (rc < 0) rc += 1024;
      f = rc * 0.0029296875; ri = f | 0; fr = f - ri; d = fr < 0.5 ? fr : 1 - fr; px = d * 2.0944 * RR[k];
      L = TEX[RW[k] + (lc | 0)] >> 4; j = (ri << 4) + L; s = SH[k];
      r = (LR[j] * s) >> 8; g = (LG[j] * s) >> 8; b = (LB[j] * s) >> 8;
      a = RIM[k] + (GR[k] ? 24 : 0);
      if (px < sw5) { q = 1 - px / sw5; a += (q * q * 150) | 0; if (px < sw) a += 105; }
      r += a; g += a; b += a;
      u[P[k]] = 0xff000000 | ((b > 255 ? 255 : b) << 16) | ((g > 255 ? 255 : g) << 8) | (r > 255 ? 255 : r);
    }
    ctx.putImageData(G.img, 0, 0);
  }

  /* ---------- estrellas ---------- */
  var estrellas = [];
  function creaEstrellas() {
    var n = clamp(Math.round(E.W * E.H / 9000), 60, 230), i, s = 7;
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    estrellas = [];
    for (i = 0; i < n; i++) estrellas.push({ x: rnd() * E.W, y: rnd() * E.H, z: rnd() < 0.18 ? 2 : 1, a: 0.3 + rnd() * 0.6, v: 0.7 + rnd() * 2.2, f: rnd() * TAU });
  }
  function pintaEstrellas(t) {
    if (!ectx) return;
    var i, s, a;
    ectx.clearRect(0, 0, est.width, est.height); ectx.fillStyle = "#fff";
    for (i = 0; i < estrellas.length; i++) {
      s = estrellas[i]; a = s.a * (reducido ? 0.8 : 0.62 + 0.38 * Math.sin(t * 0.001 * s.v + s.f));
      ectx.globalAlpha = a; ectx.fillRect(s.x, s.y, s.z, s.z);
    }
    var fg = E.fuga;
    if (fg && !reducido) {
      var q = (t - fg.t0) / 800;
      if (q >= 1) E.fuga = null;
      else {
        var hx = fg.x + fg.dx * q * fg.l * 2.2, hy = fg.y + fg.dy * q * fg.l * 2.2, gr = ectx.createLinearGradient(hx, hy, hx - fg.dx * fg.l, hy - fg.dy * fg.l);
        gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        ectx.globalAlpha = 1 - q * q; ectx.strokeStyle = gr; ectx.lineWidth = 1.6; ectx.beginPath(); ectx.moveTo(hx, hy); ectx.lineTo(hx - fg.dx * fg.l, hy - fg.dy * fg.l); ectx.stroke();
      }
    } else if (!fg && !reducido && t - E.estT > 6500) {
      E.estT = t; E.fuga = { t0: t, x: E.W * (0.1 + Math.random() * 0.5), y: E.H * Math.random() * 0.4, dx: 0.8, dy: 0.45, l: 90 + Math.random() * 60 };
    }
    ectx.globalAlpha = 1;
  }

  /* ---------- medidas ---------- */
  function medir() {
    E.W = sp.clientWidth || window.innerWidth; E.H = sp.clientHeight || window.innerHeight;
    var ancho = E.W / E.H >= 1.05, top = ancho ? 56 : 108, bot = 12, cm = document.getElementById("cmp"), rb = cm && cm.getBoundingClientRect(), b2, libre;
    /* si el aviso de cookies ocupa la parte baja, el globo cabe entero por encima (solo si queda sitio suficiente) */
    if (rb && rb.height > 0 && rb.top > E.H * 0.4 && rb.top < E.H) { b2 = E.H - rb.top + 8; if (E.H - top - b2 >= 0.58 * E.H) bot = Math.max(bot, b2); }
    libre = E.H - top - bot;
    E.D = Math.max(180, Math.min(E.W * (ancho ? 0.96 : 0.98), libre)); E.R = E.D / 2;
    E.base = { x: E.W / 2, y: top + (ancho ? libre / 2 : (libre - E.D) * 0.3 + E.D / 2) };
    E.k = clamp(E.D / 520, 0.6, 1.12); E.rho = 0.6;
    sp.style.setProperty("--vs-k", E.k.toFixed(3));
    sp.classList.toggle("vs--compacto", ancho && E.H < 480);
    mundo.style.width = E.D + "px"; mundo.style.height = E.D + "px";
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5), N = clamp(Math.round(E.D * dpr * 0.9), 200, E.nMax);
    if (N !== G.N) prepara(N);
    if (est) { est.width = E.W; est.height = E.H; creaEstrellas(); }
  }

  /* ---------- reparto de reinos y posiciones ---------- */
  function offActual() { return mod1024(OFF0 - E.spin * 1024 / TAU); }
  function reinoEn(x, y) {
    var dx = x - E.cx, dy = y - E.cy, r = Math.hypot(dx, dy), hubR = hub ? hub.offsetWidth * 0.6 : 0;
    if (r > E.R || r < hubR) return null;
    var lc = mod1024(-Math.atan2(dy, dx) / TAU * 1024 + offActual()), rc = mod1024(lc - COL0);
    return NOM[Math.min(2, (rc * 0.0029296875) | 0)];
  }
  function angDe(e) { return Math.atan2(e.clientY - E.cy, e.clientX - E.cx); }

  function pinta(ts, dt) {
    var e = ease(E.p), sv = E.spin + (1 - e) * 2.2, offc = OFF0 - sv * 1024 / TAU, rho = E.rho * E.R * (0.35 + 0.65 * e), i, n, ang, x, y;
    var s = 0.55 + 0.45 * e, tx = 0, ty = 0, cx = E.cx, cy = E.cy, q = 0, z = 0;
    for (i = 0; i < 3; i++) {
      n = NOM[i]; ang = -(CC[i] - offc) * TAU / 1024; x = cx + Math.cos(ang) * rho; y = cy + Math.sin(ang) * rho;
      E.pos[n] = { x: x, y: y }; E.anclas[n] = { x: Math.round(x), y: Math.round(y) };
      lados[n].style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%)";
    }
    if (E.sel) {
      q = Math.min(1, (ts - E.selT0) / 620); z = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      var P0 = E.pos[E.sel], p0x = P0.x - cx, p0y = P0.y - cy; s = 1 + 3.6 * z;
      tx = P0.x * (1 - z) + (E.W / 2) * z - cx - s * p0x; ty = P0.y * (1 - z) + (E.H / 2) * z - cy - s * p0y;
      if (velo) velo.style.opacity = Math.max(0, (q - 0.5) / 0.5).toFixed(3);
    }
    mundo.style.transform = "translate3d(" + (cx - E.D / 2 + tx).toFixed(1) + "px," + (cy - E.D / 2 + ty).toFixed(1) + "px,0) scale(" + s.toFixed(4) + ")";
    mundo.style.opacity = Math.min(1, e * 1.8).toFixed(3);
    if (hub) hub.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
    /* brillo del reino apuntado */
    var hv = E.hover || E.foco, cambio = false, r, k = reducido ? 1 : 1 - Math.exp(-(dt || 0.016) * 10);
    for (r = 0; r < 3; r++) {
      E.briT[r] = hv && REINO[hv] === r ? 1.3 : 1;
      if (Math.abs(E.briT[r] - E.bri[r]) > 0.004) { E.bri[r] += (E.briT[r] - E.bri[r]) * k; cambio = true; }
    }
    if (cambio || !E.tablaOk) { tabla(); E.tablaOk = true; }
    var t0 = performance.now();
    renderGlobo(sv);
    return { q: q, coste: performance.now() - t0 };
  }

  function bucle(ts) {
    E.raf = 0;
    if (!E.abierto) return;
    var dt = Math.min(0.05, (ts - (E.last || ts)) / 1000), seguir = true, k, o, r;
    E.last = ts;
    if (E.p < 1) E.p = Math.min(1, (ts - E.t0) / 750);
    if (!E.drag) {
      var tg = (E.hover || E.foco) && !E.sel ? E.auto * 0.1 : E.auto;
      E.vel += (tg - E.vel) * (1 - Math.exp(-dt * 1.8)); E.spin += E.vel * dt;
    }
    o = { x: E.base.x, y: E.base.y };
    if (E.ptr.on && !E.sel) { o.x += (E.ptr.x / E.W - 0.5) * E.W * 0.02; o.y += (E.ptr.y / E.H - 0.5) * E.H * 0.02; }
    k = 1 - Math.exp(-dt * 7); E.cx += (o.x - E.cx) * k; E.cy += (o.y - E.cy) * k;
    r = pinta(ts, dt);
    E.coste = E.coste * 0.9 + r.coste * 0.1;
    if (E.coste > 13 && E.nMax > 220 && ++E.lentos > 25) { E.lentos = 0; E.nMax = Math.max(220, Math.round(G.N * 0.8)); medir(); } else if (E.coste <= 13) E.lentos = 0;
    if (!E.estUlt || ts - E.estUlt > 45) { E.estUlt = ts; pintaEstrellas(ts); }
    if (E.sel && r.q >= 1 && !E.fin) { E.fin = true; terminar(); seguir = false; }
    if (seguir && E.abierto) E.raf = requestAnimationFrame(bucle);
  }
  function pide() {
    if (!E.abierto) return;
    if (reducido) { if (!E.sel) { E.cx = E.base.x; E.cy = E.base.y; pinta(0, 1); } }
    else if (!E.raf) E.raf = requestAnimationFrame(bucle);
  }

  /* ---------- textura de tierra (solo al abrir por primera vez) ---------- */
  function cargaTierra() {
    if (E.tierra || E.tierraCargando) return;
    E.tierraCargando = true;
    var im = new Image();
    im.onload = function () {
      try {
        var c = document.createElement("canvas"), x, d, i;
        c.width = 1024; c.height = 512; x = c.getContext("2d"); x.drawImage(im, 0, 0, 1024, 512);
        d = x.getImageData(0, 0, 1024, 512).data;
        for (i = 0; i < 1024 * 512; i++) TEX[i] = d[i * 4];
        E.tierra = true; pide();
      } catch (e) {}
    };
    im.onerror = function () { E.tierraCargando = false; };
    im.src = "mapas/tierra.png";
  }

  /* ---------- abrir, cerrar, elegir ---------- */
  function libera() { E.timers.forEach(clearTimeout); E.timers = []; if (E.raf) { cancelAnimationFrame(E.raf); E.raf = 0; } }
  function abrir() {
    libera(); medir(); cargaTierra();
    E.abierto = true; E.sel = null; E.fin = false; E.hover = null; E.foco = null; E.drag = null; E.last = 0; E.estUlt = 0; E.coste = 0; E.lentos = 0;
    E.spin = 0; E.vel = E.auto; E.cx = E.base.x; E.cy = E.base.y; E.bri = [1, 1, 1]; E.tablaOk = false;
    E.t0 = performance.now(); E.p = reducido ? 1 : 0;
    if (velo) { velo.style.opacity = "0"; velo.style.background = ""; }
    sp.classList.remove("vs--elige", "vs--fuera"); sp.classList.add("vs--abre");
    Object.keys(lados).forEach(function (n) { lados[n].classList.remove("vs--resalta"); });
    pinta(E.t0, 0.016); pintaEstrellas(E.t0);
    E.timers.push(setTimeout(function () { sp.classList.remove("vs--abre"); }, 1000));
    if (!reducido) E.raf = requestAnimationFrame(bucle);
  }
  function cerrar() {
    E.abierto = false; libera();
    sp.hidden = true; sp.classList.remove("vs--elige", "vs--fuera", "vs--abre"); h.classList.remove("vs-abierto");
    if (velo) velo.style.opacity = "0";
  }
  function terminar() {
    sp.classList.add("vs--fuera");
    E.timers.push(setTimeout(cerrar, reducido ? 0 : 190));
  }
  function elegir(n) {
    if (E.sel || !E.abierto || !lados[n]) return;
    var tab = document.querySelector('[data-grupo-btn="' + n + '"]'), p = PAL[REINO[n]];
    if (tab) tab.click();
    window.scrollTo(0, 0); h.classList.remove("vs-abierto");
    E.sel = n; E.drag = null;
    if (reducido) { terminar(); return; }
    if (velo) velo.style.background = "radial-gradient(circle at 50% 50%, rgb(" + p.t.join(",") + ") 0, rgb(" + p.o.join(",") + ") 62%, #05060f 100%)";
    sp.classList.add("vs--elige"); E.selT0 = performance.now(); E.p = 1;
    if (!E.raf) E.raf = requestAnimationFrame(bucle);
  }
  function resalta(n) {
    E.hover = n;
    Object.keys(lados).forEach(function (m) { lados[m].classList.toggle("vs--resalta", m === n); });
    pide();
  }

  /* ---------- eventos ---------- */
  Object.keys(lados).forEach(function (n) {
    var el = lados[n];
    el.addEventListener("click", function () { elegir(n); });
    el.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse" && !E.drag) resalta(n); });
    el.addEventListener("pointerleave", function () { if (E.hover === n) resalta(null); });
    el.addEventListener("focus", function () { var v = false; try { v = el.matches(":focus-visible"); } catch (e) {} if (v) { E.foco = n; pide(); } });
    el.addEventListener("blur", function () { if (E.foco === n) { E.foco = null; pide(); } });
  });
  mundo.addEventListener("pointerdown", function (e) {
    if (E.sel || !E.abierto || (e.button !== undefined && e.button > 0)) return;
    E.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), a: angDe(e), mov: 0, lt: performance.now() };
    try { mundo.setPointerCapture(e.pointerId); } catch (x) {}
    mundo.classList.add("vs--arrastra");
  });
  mundo.addEventListener("pointermove", function (e) {
    var d = E.drag, a, da, now, dtt;
    if (d && e.pointerId === d.id) {
      d.mov = Math.max(d.mov, Math.hypot(e.clientX - d.x0, e.clientY - d.y0));
      a = angDe(e);
      if (d.mov > 6) {
        da = d.a - a; if (da > Math.PI) da -= TAU; else if (da < -Math.PI) da += TAU;
        E.spin += da; now = performance.now(); dtt = Math.max(0.008, (now - d.lt) / 1000); d.lt = now;
        E.vel += (clamp(da / dtt, -7, 7) - E.vel) * 0.35;
        pide();
      }
      d.a = a;
    } else if (e.pointerType === "mouse") {
      var n = reinoEn(e.clientX, e.clientY);
      if (n !== E.hover) resalta(n);
    }
  });
  function suelta(e, cancela) {
    var d = E.drag;
    if (!d || e.pointerId !== d.id) return;
    E.drag = null; mundo.classList.remove("vs--arrastra");
    if (!cancela && d.mov <= 8 && performance.now() - d.t0 < 700) { var n = reinoEn(e.clientX, e.clientY); if (n) elegir(n); }
    pide();
  }
  mundo.addEventListener("pointerup", function (e) { suelta(e, false); });
  mundo.addEventListener("pointercancel", function (e) { suelta(e, true); });
  mundo.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse" && !E.drag && E.hover && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".vs__lado"))) resalta(null); });
  sp.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    E.ptr.x = e.clientX; E.ptr.y = e.clientY; E.ptr.on = true;
  });
  sp.addEventListener("pointerleave", function () { E.ptr.on = false; });
  document.addEventListener("keydown", function (e) {
    if (!E.abierto || sp.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    var i = "123".indexOf(e.key);
    if (e.key.length === 1 && i >= 0) { e.preventDefault(); elegir(ORDEN_TECLAS[i]); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); E.spin += (e.key === "ArrowLeft" ? -1 : 1) * 0.26; pide(); }
  });
  document.addEventListener("click", function () { /* al aceptar o rechazar las cookies el aviso desaparece: el globo recupera el sitio */
    if (!E.abierto) return;
    setTimeout(function () { if (E.abierto && !E.sel) { medir(); pide(); } }, 140);
  });
  window.addEventListener("resize", function () { if (!E.abierto) return; medir(); if (!E.sel) { E.cx = E.base.x; E.cy = E.base.y; } pide(); });

  sp.classList.add("vs--globo");

  /* Solo para pruebas */
  window.TIKI_SPLIT = {
    abrir: abrir, cerrar: cerrar, elegir: elegir,
    info: function () {
      return {
        abierto: E.abierto, o: E.W / E.H >= 1.05 ? "h" : "v", W: E.W, H: E.H, nombres: ORDEN_TECLAS.slice(), centro: { x: E.cx, y: E.cy }, base: { x: E.base.x, y: E.base.y },
        R: E.R, D: E.D, anclas: JSON.parse(JSON.stringify(E.anclas)), sel: E.sel, reducido: reducido, spin: E.spin, tierra: E.tierra, N: G.N, coste: E.coste
      };
    },
    reino: function (x, y) { return reinoEn(x, y); }
  };
})();
