/* COMPARADOR TIKITEXTO · motor (es/en). Datos en comparador_datos.js (generado por tools/comparador.py) */
(function () {
  "use strict";
  var D = window.CP_DATA; if (!D) return;
  var K = document.documentElement.lang.indexOf("en") === 0 ? 1 : 0;
  var UI = [
    { jug: "Jugadores", eq: "Equipos", sel: "Selecciones", ent: "Entrenadores", cambia: "Cambiar", buscar: "Buscar…", vacio: "Sin resultados", gana: "gana", empate: "EMPATE ÉPICO", por: "por", cop: "Enlace copiado", sh: "Compartir", al: "Aleatorio", inter: "Intercambiar", pts: "ventajas", cerrar: "Cerrar", elige: "Elige", nd: "sin dato", anios: "Años", ant: "Mismo elemento: elige otro" },
    { jug: "Players", eq: "Clubs", sel: "National teams", ent: "Managers", cambia: "Change", buscar: "Search…", vacio: "No results", gana: "wins", empate: "EPIC DRAW", por: "by", cop: "Link copied", sh: "Share", al: "Random", inter: "Swap", pts: "edges", cerrar: "Close", elige: "Pick", nd: "no data", anios: "Years", ant: "Same item: pick another" }
  ][K];
  var MODOS = [["jugadores", UI.jug], ["equipos", UI.eq], ["selecciones", UI.sel], ["entrenadores", UI.ent]];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var S = { modo: "jugadores", a: null, b: null, slot: null };
  var raiz = $("#cpApp"); if (!raiz) return;

  function norm(t) { return String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function M() { return D[S.modo]; }
  function item(id) { return M().items.filter(function (x) { return x.id === id; })[0]; }
  function nombre(x) { return (K && x.ne) || x.n; }
  function iniciales(n) { var p = n.replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter(Boolean); return (p.length > 1 ? p[0][0] + p[p.length - 1][0] : n.slice(0, 2)).toUpperCase(); }
  function lum(h) { var n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
  function cols(x) { var c = x.c; return lum(c[0]) < 0.28 ? [c[1], c[0]] : c; }
  function fmt(k, v) { if (v === null || v === undefined) return "—"; return (k === "nac" || k === "fund") ? String(v) : v.toLocaleString(K ? "en-US" : "es-ES", { useGrouping: v >= 10000 }); }
  function stat(k) { return M().stats.filter(function (s) { return s.k === k; })[0]; }

  /* ===== estructura ===== */
  raiz.innerHTML =
    '<div class="cp-modos" role="tablist"><i class="cp-ind"></i>' + MODOS.map(function (m, i) { return '<button type="button" role="tab" data-modo="' + m[0] + '" aria-selected="' + (i === 0) + '">' + m[1] + '</button>'; }).join("") + '</div>' +
    '<div class="cp-arena"><div class="cp-lado" data-lado="a"></div><div class="cp-vs" aria-hidden="true"><span class="r r3"></span><span class="r r1"></span><span class="r r2"></span><span class="onda"></span><b>VS</b></div><div class="cp-lado" data-lado="b"></div></div>' +
    '<div class="cp-acc"><button type="button" class="cp-btn" data-acc="swap">⇄ ' + UI.inter + '</button><button type="button" class="cp-btn cp-btn--g" data-acc="rand">🎲 ' + UI.al + '</button><button type="button" class="cp-btn" data-acc="share">🔗 ' + UI.sh + '</button></div>' +
    '<div class="cp-chips" data-chips></div>' +
    '<div class="cp-res" data-res aria-live="polite"></div>' +
    '<div class="cp-picker" hidden role="dialog" aria-modal="true"><div class="cp-picker__c"><div class="cp-picker__t"><input type="search" autocomplete="off" aria-label="' + UI.buscar + '" placeholder="' + UI.buscar + '"><button type="button" class="cp-picker__x" aria-label="' + UI.cerrar + '">✕</button></div><div class="cp-opciones"></div></div></div>' +
    '<div class="cp-toast" role="status"></div>';
  var pk = $(".cp-picker"), pin = $("input", pk), pop = $(".cp-opciones", pk), toast = $(".cp-toast");

  function aviso(t) { toast.textContent = t; toast.classList.add("on"); clearTimeout(aviso.t); aviso.t = setTimeout(function () { toast.classList.remove("on"); }, 1800); }

  /* ===== holos ===== */
  function holo(lado, x) {
    var c = cols(x), el = $('[data-lado="' + lado + '"]');
    el.innerHTML = '<button type="button" class="cp-holo nuevo" style="--c1:' + c[0] + ';--c2:' + c[1] + '" aria-label="' + UI.cambia + ': ' + esc(nombre(x)) + '"><span class="cp-brillo"></span><span class="cp-orbe">' + esc(iniciales(nombre(x))) + '</span><span class="cp-nombre">' + esc(nombre(x)) + '</span><span class="cp-sub2">' + esc(x.p[K] + (x.pa[K] && x.pa[K] !== x.p[K] ? " · " + x.pa[K] : "")) + '</span><span class="cp-cambia">⟳ ' + UI.cambia + '</span></button>';
    var b = $(".cp-holo", el);
    b.addEventListener("click", function () { abre(lado); });
    if (!RM) {
      b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; b.style.transform = "rotateY(" + (px * 12).toFixed(1) + "deg) rotateX(" + (-py * 12).toFixed(1) + "deg) translateZ(6px)"; });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    }
  }

  /* ===== selector ===== */
  function abre(lado) { S.slot = lado; pin.value = ""; pk.hidden = false; lista(""); setTimeout(function () { pin.focus(); }, 30); }
  function cierra() { pk.hidden = true; }
  function lista(q) {
    q = norm(q.trim()); var otro = S.slot === "a" ? S.b : S.a;
    var h = M().items.filter(function (x) { return !q || norm(x.n + " " + (x.ne || "") + " " + x.pa[0] + " " + x.pa[1]).indexOf(q) >= 0; }).map(function (x) {
      var c = cols(x);
      return '<button type="button" class="cp-op" data-id="' + x.id + '" style="--c1:' + c[0] + ';--c2:' + c[1] + '"' + (x.id === otro ? " disabled" : "") + '><i></i><span><b>' + esc(nombre(x)) + '</b><small>' + esc(x.p[K] + " · " + x.pa[K]) + '</small></span></button>';
    }).join("");
    pop.innerHTML = h || '<p class="cp-vacio">' + UI.vacio + '</p>';
  }
  pin.addEventListener("input", function () { lista(pin.value); });
  pop.addEventListener("click", function (e) { var b = e.target.closest(".cp-op"); if (!b || b.disabled) return; S[S.slot] = b.dataset.id; cierra(); pinta(true); });
  $(".cp-picker__x", pk).addEventListener("click", cierra);
  pk.addEventListener("click", function (e) { if (e.target === pk) cierra(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pk.hidden) cierra(); });

  /* ===== modos / acciones ===== */
  function modo(m, a, b) {
    S.modo = m; var d = M();
    var par = d.duelos[0]; S.a = a && item(a) ? a : par[0]; S.b = b && item(b) ? b : par[1];
    var i = MODOS.map(function (x) { return x[0]; }).indexOf(m);
    $(".cp-ind").style.transform = "translateX(" + (i * 100) + "%)";
    [].forEach.call(raiz.querySelectorAll("[data-modo]"), function (t) { t.setAttribute("aria-selected", t.dataset.modo === m); });
    $("[data-chips]").innerHTML = d.duelos.map(function (p) { return '<button type="button" class="cp-chip" data-a="' + p[0] + '" data-b="' + p[1] + '">' + esc(nombre(item(p[0])).split(" ").slice(-1)[0] === nombre(item(p[0])) ? nombre(item(p[0])) : nombre(item(p[0]))) + ' vs ' + esc(nombre(item(p[1]))) + '</button>'; }).join("");
    pinta(true);
  }
  raiz.addEventListener("click", function (e) {
    var t = e.target.closest("[data-modo]"); if (t) { modo(t.dataset.modo); return; }
    var c = e.target.closest(".cp-chip"); if (c) { S.a = c.dataset.a; S.b = c.dataset.b; pinta(true); return; }
    var a = e.target.closest("[data-acc]"); if (!a) return;
    if (a.dataset.acc === "swap") { var x = S.a; S.a = S.b; S.b = x; pinta(true); }
    else if (a.dataset.acc === "rand") { var it = M().items, i = Math.floor(Math.random() * it.length), j; do { j = Math.floor(Math.random() * it.length); } while (j === i); S.a = it[i].id; S.b = it[j].id; pinta(true); }
    else { var u = location.href.split("?")[0] + "?m=" + S.modo + "&a=" + S.a + "&b=" + S.b; if (navigator.clipboard) navigator.clipboard.writeText(u).then(function () { aviso(UI.cop); }, function () { aviso(u); }); else aviso(u); }
  });

  /* ===== resultado ===== */
  var anim = 0;
  function cuenta(el, fin, k, ms) {
    if (RM || fin === null || fin === undefined || k === "nac" || k === "fund") { el.textContent = fmt(k, fin); return; }
    var t0 = performance.now(); (function f(t) { var p = Math.min(1, (t - t0) / ms), q = 1 - Math.pow(1 - p, 3); el.textContent = fmt(k, Math.round(fin * q)); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  function pinta(nuevo) {
    var A = item(S.a), B = item(S.b), d = M(); if (!A || !B) return;
    holo("a", A); holo("b", B);
    var vs = $(".cp-vs"); vs.classList.remove("golpe"); void vs.offsetWidth; vs.classList.add("golpe");
    try { history.replaceState(null, "", "?m=" + S.modo + "&a=" + S.a + "&b=" + S.b); } catch (x) {}
    var pa = 0, pb = 0, filas = "";
    d.stats.forEach(function (s, i) {
      var va = A.v[s.k], vb = B.v[s.k], ga = "", ok = va !== null && va !== undefined && vb !== null && vb !== undefined;
      if (s.g && ok) { if (va > vb) { pa++; ga = " gA"; } else if (vb > va) { pb++; ga = " gB"; } }
      var mx = Math.max(va || 0, vb || 0) || 1, wa = ok || (va !== null && va !== undefined) ? (va || 0) / mx * 100 : 0, wb = (vb !== null && vb !== undefined) ? (vb || 0) / mx * 100 : 0;
      var nota = "";
      if (s.k === "wc") nota = [A, B].map(function (x) { return x.v._anios && x.v._anios.length ? esc(nombre(x)) + ": " + x.v._anios.join(", ") : ""; }).filter(Boolean).join(" · ");
      if (s.k === "gol") nota = [A, B].map(function (x) { return x.v._gol ? esc(nombre(x)) + ": " + esc(x.v._gol) : ""; }).filter(Boolean).join(" · ");
      filas += '<div class="cp-fila' + ga + (va == null || vb == null ? " nulo" : "") + '" data-i="' + i + '"><span class="lab">' + esc(s[K ? "en" : "es"]) + (s.u ? " (" + s.u + ")" : "") + '</span><div class="vals"><b class="v va" data-k="' + s.k + '" data-v="' + (va == null ? "" : va) + '">—</b><div class="ba2"><span class="A"><i style="--w:0%;--d:' + (i * .06) + 's" data-w="' + wa.toFixed(1) + '"></i></span><span class="B"><i style="--w:0%;--d:' + (i * .06) + 's" data-w="' + wb.toFixed(1) + '"></i></span></div><b class="v vb" data-k="' + s.k + '" data-v="' + (vb == null ? "" : vb) + '">—</b></div>' + (nota ? '<span class="nota">' + nota + '</span>' : "") + '</div>';
    });
    var tot = pa + pb || 1, ver;
    if (pa === pb) ver = UI.empate; else ver = nombre(pa > pb ? A : B).toUpperCase() + " " + UI.gana + " " + UI.por + " " + Math.max(pa, pb) + "–" + Math.min(pa, pb);
    var res = $("[data-res]");
    res.style.setProperty("--ca1", "#19e6ff"); res.style.setProperty("--cb1", "#ff2fd6");
    res.innerHTML = '<div class="cp-marcador"><div><div class="nom">' + esc(nombre(A)) + '</div><div class="pt pa" data-pt="' + pa + '">0</div></div><div class="gui">–</div><div><div class="nom">' + esc(nombre(B)) + '</div><div class="pt pb" data-pt="' + pb + '">0</div></div></div>' +
      '<div class="cp-veredicto">' + esc(ver) + '</div><div class="cp-barra-pod"><i class="ia" style="width:0"></i><i class="ib" style="width:0"></i></div>' +
      '<div class="cp-cols"><div class="cp-radar"><canvas aria-label="radar"></canvas></div><div class="cp-filas">' + filas + '</div></div>' +
      '<p class="cp-aviso">' + esc(D.fecha[K]) + '</p>';
    var id = ++anim;
    [].forEach.call(res.querySelectorAll(".cp-fila"), function (f, i) {
      setTimeout(function () {
        if (id !== anim) return; f.classList.add("on");
        [].forEach.call(f.querySelectorAll("b.v"), function (b) { var v = b.dataset.v; cuenta(b, v === "" ? null : +v, b.dataset.k, 900); });
        [].forEach.call(f.querySelectorAll(".ba2 i"), function (n) { n.style.setProperty("--w", n.dataset.w + "%"); });
      }, RM ? 0 : 120 + i * 70);
    });
    [].forEach.call(res.querySelectorAll(".pt"), function (n) { var v = +n.dataset.pt, t0 = performance.now(); (function f(t) { var p = RM ? 1 : Math.min(1, (t - t0) / 1100); n.textContent = Math.round(v * p); if (p < 1) requestAnimationFrame(f); })(t0); });
    setTimeout(function () { var a = $(".ia", res), b = $(".ib", res); if (a) { a.style.width = (pa / tot * 100) + "%"; b.style.width = (pb / tot * 100) + "%"; } }, 80);
    radar(A, B, d, id);
    if (nuevo && pa !== pb && !RM) { var r = res.getBoundingClientRect(); chispas(innerWidth / 2, Math.max(120, Math.min(r.top + 90, innerHeight - 80)), pa > pb ? "#19e6ff" : "#ff2fd6"); }
    window.TIKI_CP.S = S; window.TIKI_CP.res = { pa: pa, pb: pb, ver: ver };
  }

  /* ===== radar ===== */
  function radar(A, B, d, id) {
    var cv = $(".cp-radar canvas"), w = cv.parentNode.clientWidth || 320, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = w * dpr; cv.height = w * dpr; var g = cv.getContext("2d"); g.scale(dpr, dpr);
    var ks = d.radar, n = ks.length, cx = w / 2, cy = w / 2, R = w * .25;
    var mx = ks.map(function (k) { return Math.max(A.v[k] || 0, B.v[k] || 0) || 1; });
    function pt(i, f) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f]; }
    function poli(o, col, rgb, p) {
      g.beginPath(); ks.forEach(function (k, i) { var q = pt(i, Math.max(.04, (o.v[k] || 0) / mx[i]) * p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath();
      g.fillStyle = "rgba(" + rgb + ",.22)"; g.fill(); g.shadowColor = col; g.shadowBlur = 16; g.strokeStyle = col; g.lineWidth = 2.4; g.stroke(); g.shadowBlur = 0;
      ks.forEach(function (k, i) { var q = pt(i, Math.max(.04, (o.v[k] || 0) / mx[i]) * p); g.beginPath(); g.arc(q[0], q[1], 3.4, 0, 7); g.fillStyle = "#fff"; g.fill(); });
    }
    var t0 = performance.now();
    (function f(t) {
      if (id !== anim) return;
      var p = RM ? 1 : 1 - Math.pow(1 - Math.min(1, (t - t0) / 1100), 3); g.clearRect(0, 0, w, w);
      g.lineWidth = 1; for (var r = 1; r <= 4; r++) { g.beginPath(); ks.forEach(function (k, i) { var q = pt(i, r / 4); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.strokeStyle = "rgba(120,160,255," + (.1 + r * .05) + ")"; g.stroke(); }
      ks.forEach(function (k, i) { var q = pt(i, 1); g.beginPath(); g.moveTo(cx, cy); g.lineTo(q[0], q[1]); g.strokeStyle = "rgba(120,160,255,.2)"; g.stroke(); });
      var sw = RM ? 0 : (t * .0012) % (Math.PI * 2); if (!RM) { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R * 1.05, sw - .5, sw); g.closePath(); var gr = g.createRadialGradient(cx, cy, 0, cx, cy, R); gr.addColorStop(0, "rgba(25,230,255,.0)"); gr.addColorStop(1, "rgba(25,230,255,.22)"); g.fillStyle = gr; g.fill(); }
      poli(A, "#19e6ff", "25,230,255", p); poli(B, "#ff2fd6", "255,47,214", p);
      g.fillStyle = "#b9c8ee"; g.font = "700 " + Math.max(9, w * .031) + "px ui-sans-serif,system-ui,sans-serif"; g.textBaseline = "middle";
      ks.forEach(function (k, i) { var s = stat(k), l = s[K ? "en" : "es"]; if (l.length > 15) l = l.slice(0, 14) + "…"; var q = pt(i, 1.2); g.textAlign = q[0] < cx - 6 ? "right" : q[0] > cx + 6 ? "left" : "center"; g.fillText(l, q[0], q[1] + (q[1] > cy + 6 ? 6 : q[1] < cy - 6 ? -4 : 0)); });
      if (!RM) requestAnimationFrame(f);
    })(t0);
  }

  /* ===== fondo ===== */
  var bg = $("#cpFondo"), bx = bg && bg.getContext("2d"), P = [], W = 0, H = 0, ch = [];
  function tam() { if (!bg) return; var d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; bg.width = W * d; bg.height = H * d; bx.setTransform(d, 0, 0, d, 0, 0); var n = Math.round(Math.min(90, W * H / 16000)); P = []; for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.8 + .6, h: [190, 280, 320][i % 3] }); }
  function chispas(x, y, col) { for (var i = 0; i < 46; i++) { var a = Math.random() * 6.283, v = Math.random() * 5 + 1.5; ch.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, l: 1, c: Math.random() < .3 ? "#ffd23a" : col }); } }
  function fondo(t) {
    bx.clearRect(0, 0, W, H);
    var gr = bx.createRadialGradient(W * (.5 + Math.sin(t * 4e-5) * .25), H * .15, 0, W * .5, H * .4, Math.max(W, H) * .85); gr.addColorStop(0, "rgba(70,40,160,.38)"); gr.addColorStop(.5, "rgba(10,20,70,.25)"); gr.addColorStop(1, "rgba(4,3,15,0)"); bx.fillStyle = gr; bx.fillRect(0, 0, W, H);
    bx.strokeStyle = "rgba(60,120,255,.1)"; bx.lineWidth = 1; var off = (t * .02) % 48, hz = H * .62;
    for (var y = 0; y < 14; y++) { var yy = hz + Math.pow((y + off / 48) / 14, 2.2) * (H - hz); bx.beginPath(); bx.moveTo(0, yy); bx.lineTo(W, yy); bx.stroke(); }
    for (var x = -10; x <= 10; x++) { bx.beginPath(); bx.moveTo(W / 2 + x * 14, hz); bx.lineTo(W / 2 + x * W * .11, H); bx.stroke(); }
    P.forEach(function (p, i) {
      p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      for (var j = i + 1; j < P.length; j++) { var q = P[j], dx = p.x - q.x, dy = p.y - q.y, dd = dx * dx + dy * dy; if (dd < 14000) { bx.strokeStyle = "hsla(" + p.h + ",100%,65%," + (.22 * (1 - dd / 14000)) + ")"; bx.beginPath(); bx.moveTo(p.x, p.y); bx.lineTo(q.x, q.y); bx.stroke(); } }
      bx.fillStyle = "hsla(" + p.h + ",100%,70%,.85)"; bx.shadowColor = "hsl(" + p.h + ",100%,60%)"; bx.shadowBlur = 8; bx.beginPath(); bx.arc(p.x, p.y, p.r, 0, 7); bx.fill(); bx.shadowBlur = 0;
    });
    ch = ch.filter(function (c) { return c.l > 0; }); ch.forEach(function (c) { c.x += c.vx; c.y += c.vy; c.vy += .12; c.l -= .02; bx.globalAlpha = Math.max(0, c.l); bx.fillStyle = c.c; bx.shadowColor = c.c; bx.shadowBlur = 10; bx.fillRect(c.x, c.y, 3, 3); }); bx.globalAlpha = 1; bx.shadowBlur = 0;
  }
  function bucle(t) { if (!document.hidden) fondo(t); requestAnimationFrame(bucle); }
  if (bg) { tam(); addEventListener("resize", function () { tam(); if (RM) fondo(0); }); if (RM) fondo(0); else requestAnimationFrame(bucle); }
  var rz; addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { if (item(S.a)) radar(item(S.a), item(S.b), M(), anim); }, 250); });

  /* ===== arranque ===== */
  window.TIKI_CP = { S: S, D: D, modo: modo, pinta: pinta };
  var q = new URLSearchParams(location.search), m = q.get("m");
  modo(D[m] ? m : "jugadores", q.get("a"), q.get("b"));
})();
