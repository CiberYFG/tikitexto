/* TIKITEXTO · «Estudio» de la sección Saber.
   - Hub con pestañas (una sola pantalla) cuando hay varios temas.
   - Banco de trabajo en las páginas interiores: índice lateral, progreso, secciones plegables y modo enfoque.
   - Tablas interactivas: filtro, orden, barras de datos, top N, filas fijadas, resumen y exportación CSV.
   Sin dependencias ni datos externos. Si algo falla, la página sigue siendo un documento normal. */
(function () {
  "use strict";
  var doc = document, html = doc.documentElement;
  var lg = (html.lang || "es").slice(0, 2);
  var TX = {
    es: { idx: "Índice", vistas: "vistas", plegar: "Plegar todo", abrir: "Abrir todo", enfoque: "Enfoque", filtrar: "Filtrar…", barras: "Barras", ninguna: "— ninguna —", mostrar: "Mostrar", todas: "Todas", top: "Top {n}", csv: "⬇ CSV", fij: "📌 Fijadas", limpiar: "✕", de: "{a} de {b} filas", nada: "Sin resultados", suma: "Suma", media: "Media", max: "Máx.", fijadas: "fijadas", tarj: "Filtrar tarjetas…", ir: "Abrir →", pistaFijar: "Pulsa una fila para fijarla" },
    en: { idx: "Contents", vistas: "seen", plegar: "Collapse all", abrir: "Expand all", enfoque: "Focus", filtrar: "Filter…", barras: "Bars", ninguna: "— none —", mostrar: "Show", todas: "All", top: "Top {n}", csv: "⬇ CSV", fij: "📌 Pinned", limpiar: "✕", de: "{a} of {b} rows", nada: "No results", suma: "Sum", media: "Mean", max: "Max", fijadas: "pinned", tarj: "Filter cards…", ir: "Open →", pistaFijar: "Click a row to pin it" },
    pt: { idx: "Índice", vistas: "vistas", plegar: "Recolher tudo", abrir: "Abrir tudo", enfoque: "Foco", filtrar: "Filtrar…", barras: "Barras", ninguna: "— nenhuma —", mostrar: "Mostrar", todas: "Todas", top: "Top {n}", csv: "⬇ CSV", fij: "📌 Fixadas", limpiar: "✕", de: "{a} de {b} linhas", nada: "Sem resultados", suma: "Soma", media: "Média", max: "Máx.", fijadas: "fixadas", tarj: "Filtrar cartões…", ir: "Abrir →", pistaFijar: "Clique numa linha para fixá-la" },
    fr: { idx: "Sommaire", vistas: "vues", plegar: "Tout replier", abrir: "Tout ouvrir", enfoque: "Focus", filtrar: "Filtrer…", barras: "Barres", ninguna: "— aucune —", mostrar: "Afficher", todas: "Toutes", top: "Top {n}", csv: "⬇ CSV", fij: "📌 Épinglées", limpiar: "✕", de: "{a} sur {b} lignes", nada: "Aucun résultat", suma: "Somme", media: "Moyenne", max: "Max.", fijadas: "épinglées", tarj: "Filtrer les cartes…", ir: "Ouvrir →", pistaFijar: "Cliquez sur une ligne pour l'épingler" },
    it: { idx: "Indice", vistas: "viste", plegar: "Comprimi tutto", abrir: "Apri tutto", enfoque: "Focus", filtrar: "Filtra…", barras: "Barre", ninguna: "— nessuna —", mostrar: "Mostra", todas: "Tutte", top: "Top {n}", csv: "⬇ CSV", fij: "📌 Fissate", limpiar: "✕", de: "{a} di {b} righe", nada: "Nessun risultato", suma: "Somma", media: "Media", max: "Max", fijadas: "fissate", tarj: "Filtra le schede…", ir: "Apri →", pistaFijar: "Clicca una riga per fissarla" },
    de: { idx: "Inhalt", vistas: "gesehen", plegar: "Alle zuklappen", abrir: "Alle öffnen", enfoque: "Fokus", filtrar: "Filtern…", barras: "Balken", ninguna: "— keine —", mostrar: "Zeigen", todas: "Alle", top: "Top {n}", csv: "⬇ CSV", fij: "📌 Gemerkt", limpiar: "✕", de: "{a} von {b} Zeilen", nada: "Keine Ergebnisse", suma: "Summe", media: "Mittel", max: "Max.", fijadas: "gemerkt", tarj: "Karten filtern…", ir: "Öffnen →", pistaFijar: "Zeile anklicken zum Merken" }
  };
  var T = TX[lg] || TX.en;
  function sget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  function el(tag, cls, txt) { var n = doc.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function slug(s, i) { var x = norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40); return x || ("s" + i); }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- barra de progreso de lectura ---------- */
  function progreso() {
    var b = el("div", "est-prog"); b.setAttribute("aria-hidden", "true"); doc.body.appendChild(b);
    function f() { var h = html.scrollHeight - innerHeight; b.style.width = (h > 0 ? Math.min(100, scrollY / h * 100) : 0) + "%"; }
    addEventListener("scroll", f, { passive: true }); addEventListener("resize", f); f();
  }

  /* ---------- hub de pestañas ---------- */
  function hub(main) {
    var temas = Array.prototype.filter.call(main.children, function (n) { return n.classList.contains("tema"); });
    if (temas.length < 3) return false;
    var cont = el("div", "est-hub"), tabs = el("div", "est-tabs"), stage = el("div", "est-stage");
    tabs.setAttribute("role", "tablist"); main.insertBefore(cont, temas[0]);
    try { previo(main, cont); } catch (e) { /* nada */ }
    var items = [];
    temas.forEach(function (t, i) {
      var emo = (t.querySelector(".t-emo") || {}).textContent || "•";
      var tit = (t.querySelector(".t-t b") || {}).textContent || "";
      var desc = (t.querySelector(".t-t span") || {}).textContent || "";
      var cnt = (t.querySelector(".t-n") || {}).textContent || "";
      var col = t.style.getPropertyValue("--c") || "";
      var link = t.tagName === "A" ? t.getAttribute("href") : null;
      var id = "est-p" + i;
      var b = el("button", "est-tab" + (t.classList.contains("lab") ? " lab" : "") + (t.classList.contains("oro") ? " oro" : ""));
      b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-controls", id); b.id = "est-t" + i;
      if (col) b.style.setProperty("--c", col);
      var te = el("span", "te", emo); te.setAttribute("aria-hidden", "true");
      var tt = el("span", "tt"); tt.appendChild(el("b", null, tit.split(" · ")[0])); tt.appendChild(el("small", null, cnt || desc.slice(0, 44)));
      b.appendChild(te); b.appendChild(tt); tabs.appendChild(b);
      var p = el("section", "est-panel"); p.id = id; p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", b.id); p.hidden = true;
      if (col) p.style.setProperty("--c", col);
      var ph = el("div", "est-ph"); ph.appendChild(el("span", "pe", emo));
      var pt = el("div"); pt.appendChild(el("h2", null, tit)); pt.appendChild(el("p", null, desc)); ph.appendChild(pt);
      if (cnt) ph.appendChild(el("span", "pn", cnt));
      p.appendChild(ph);
      if (link) { var a = el("a", "est-abrir", T.ir); a.href = link; p.appendChild(a); var d = el("p", null, desc); p.appendChild(d); }
      else { var c = t.querySelector(".tema-c"); if (c) while (c.firstChild) p.appendChild(c.firstChild); }
      stage.appendChild(p); items.push({ b: b, p: p });
      t.parentNode.removeChild(t);
    });
    cont.appendChild(tabs); cont.appendChild(stage);
    main.classList.add("est-hubpage");
    var caja = main.querySelector(":scope > .caja"), hd = main.querySelector(".hero > div");
    if (caja && hd) { var sub = el("p", "est-sub"); while (caja.firstChild) sub.appendChild(caja.firstChild); hd.appendChild(sub); caja.parentNode.removeChild(caja); }
    function sel(i, enfoca, ini) {
      items.forEach(function (x, k) { var on = k === i; x.b.setAttribute("aria-selected", on ? "true" : "false"); x.b.tabIndex = on ? 0 : -1; x.p.hidden = !on; });
      stage.scrollTop = 0; contar(items[i].p);
      if (!ini) { try { history.replaceState(null, "", "#tema-" + i); } catch (e) { /* nada */ } }
      if (enfoca) items[i].b.focus();
      if (!ini && innerWidth <= 820) items[i].b.scrollIntoView({ inline: "center", block: "nearest" });
    }
    items.forEach(function (x, i) {
      x.b.addEventListener("click", function () { sel(i); });
      x.b.addEventListener("keydown", function (ev) {
        var k = ev.key, n = items.length, j = null;
        if (k === "ArrowDown" || k === "ArrowRight") j = (i + 1) % n; else if (k === "ArrowUp" || k === "ArrowLeft") j = (i + n - 1) % n; else if (k === "Home") j = 0; else if (k === "End") j = n - 1;
        if (j !== null) { ev.preventDefault(); sel(j, true); }
      });
    });
    var ini = 0, m = /^#tema-(\d+)$/.exec(location.hash || "");
    if (m && items[+m[1]]) ini = +m[1]; else for (var q = 0; q < temas.length; q++) if (items[q].b.classList.contains("lab")) { ini = q; break; }
    sel(ini, false, true);
    function medir() { var r = cont.getBoundingClientRect(); html.style.setProperty("--hubtop", Math.max(120, Math.round(r.top + scrollY)) + "px"); }
    medir(); addEventListener("resize", medir); addEventListener("load", medir); setTimeout(medir, 500); setTimeout(medir, 1500);
    return true;
  }

  /* franja previa del hub: «Sigue donde lo dejaste» (lectura a medias) y «Dato del día» (rota por fecha) */
  var PRE = {
    es: { sig: "Sigue donde lo dejaste", sec: "secciones vistas", dia: "Dato del día", mas: "Ver más curiosidades de este tema →" },
    en: { sig: "Pick up where you left off", sec: "sections seen", dia: "Fact of the day", mas: "More facts on this topic →" },
    pt: { sig: "Continue de onde parou", sec: "seções vistas", dia: "Curiosidade do dia", mas: "Ver mais →" },
    fr: { sig: "Reprenez où vous en étiez", sec: "sections vues", dia: "Le fait du jour", mas: "Voir plus →" },
    it: { sig: "Riprendi da dove eri rimasto", sec: "sezioni viste", dia: "Il dato del giorno", mas: "Vedi altro →" },
    de: { sig: "Mach da weiter, wo du aufgehört hast", sec: "Abschnitte gesehen", dia: "Fakt des Tages", mas: "Mehr dazu →" }
  };
  function previo(main, cont) {
    var P = PRE[lg] || PRE.en, caja = el("div", "est-pre"), algo = false;
    var raw = sget("tikitexto:saber:ultimo"), o = null;
    try { o = raw ? JSON.parse(raw) : null; } catch (e) { o = null; }
    if (o && o.u && o.u !== location.pathname && /^\/[a-z0-9\-\/]+\/$/i.test(o.u)) {
      var a = el("a", "est-sig"); a.href = o.u;
      a.appendChild(el("b", null, P.sig)); a.appendChild(el("span", null, o.t)); a.appendChild(el("small", null, o.n + " / " + o.m + " " + P.sec + " →"));
      caja.appendChild(a); algo = true;
    }
    if (algo) main.insertBefore(caja, cont);
    if (lg !== "es" && lg !== "en") return;
    var ctrl = window.fetch ? fetch("/dato_dia.json", { credentials: "omit" }) : null; if (!ctrl) return;
    ctrl.then(function (r) { return r.ok ? r.json() : null; }).then(function (L) {
      if (!L || !L.length) return;
      var d = new Date(), n = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000), x = L[n % L.length], en = lg === "en";
      var c = el("a", "est-dia"); c.href = en ? x.ue : x.u;
      c.appendChild(el("small", null, "✨ " + P.dia)); c.appendChild(el("b", null, en ? x.he : x.h)); c.appendChild(el("span", null, en ? x.te : x.t)); c.appendChild(el("em", null, P.mas));
      caja.appendChild(c); if (!algo) main.insertBefore(caja, cont);
      medirTodo();
    }).catch(function () { /* sin red: no se muestra */ });
  }
  function medirTodo() { try { dispatchEvent(new Event("resize")); } catch (e) { /* nada */ } }

  /* cuenta animada de las cifras del laboratorio */
  function contar(panel) {
    if (reduce) return;
    Array.prototype.forEach.call(panel.querySelectorAll("[data-cuenta]"), function (n) {
      var fin = +n.getAttribute("data-cuenta"), t0 = null, txt = n.querySelector("small");
      var base = n.firstChild;
      function paso(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / 700), v = Math.round(fin * (1 - Math.pow(1 - k, 3))); base.nodeValue = String(v); if (k < 1) requestAnimationFrame(paso); }
      if (base && base.nodeType === 3) requestAnimationFrame(paso);
    });
  }

  /* ---------- banco de trabajo ---------- */
  function banco(main) {
    var art = main.querySelector(":scope > .articulo");
    if (art) { while (art.firstChild) main.insertBefore(art.firstChild, art); main.removeChild(art); main.classList.add("est-art"); }
    var hero = main.querySelector(".hero"), fin = main.querySelector(".est-fin");
    var hijos = Array.prototype.slice.call(main.children), start = hero ? hijos.indexOf(hero) + 1 : 0;
    var stop = fin ? hijos.indexOf(fin) : hijos.length;
    var nodos = hijos.slice(start, stop);
    var h2s = nodos.filter(function (n) { return n.tagName === "H2" && !n.classList.contains("tema-h"); });
    if (h2s.length < 2) return false;
    var grid = el("div", "est-grid"), rail = el("aside", "est-rail"), cont = el("div", "est-cont");
    rail.setAttribute("aria-label", T.idx);
    main.insertBefore(grid, nodos[0]); grid.appendChild(rail); grid.appendChild(cont);
    var secs = [], cur = null, intro = null;
    nodos.forEach(function (n) {
      if (n.tagName === "H2" && !n.classList.contains("tema-h")) {
        cur = el("section", "est-sec"); var body = el("div", "est-sec-b");
        var i = secs.length; if (!n.id) n.id = slug(n.textContent, i);
        cur.id = "sec-" + n.id; cur.appendChild(n); cur.appendChild(body); cur._b = body; cur._h = n; secs.push(cur); cont.appendChild(cur);
      } else if (cur) cur._b.appendChild(n);
      else { if (!intro) { intro = el("div", "est-intro"); cont.appendChild(intro); } intro.appendChild(n); }
    });
    // índice
    var key = "tikitexto:saber:" + location.pathname, vistas = [];
    try { vistas = JSON.parse(sget(key) || "[]"); } catch (e) { vistas = []; }
    rail.appendChild(el("h4", null, T.idx));
    var cuenta = el("p", "est-cuenta"); rail.appendChild(cuenta);
    var med = el("div", "est-medida"); var mi = el("i"); med.appendChild(mi); rail.appendChild(med);
    var ul = el("ul", "est-toc"); rail.appendChild(ul);
    var links = secs.map(function (s) {
      var li = el("li"), a = el("a", null, s._h.textContent.replace(/\s+/g, " ").trim()); a.href = "#" + s.id; li.appendChild(a); ul.appendChild(li);
      a.addEventListener("click", function () { s.classList.remove("cerrada"); s._h.setAttribute("aria-expanded", "true"); });
      return a;
    });
    function pinta() {
      var n = 0; secs.forEach(function (s, i) { var v = vistas.indexOf(s.id) !== -1; links[i].classList.toggle("vista", v); if (v) n++; });
      cuenta.textContent = n + " / " + secs.length + " " + T.vistas; mi.style.width = (n / secs.length * 100) + "%";
      try {
        var h1 = doc.querySelector("h1"), u = sget("tikitexto:saber:ultimo"), o = u ? JSON.parse(u) : null;
        if (n > 0 && n < secs.length && h1) sset("tikitexto:saber:ultimo", JSON.stringify({ u: location.pathname, t: h1.textContent.replace(/\s+/g, " ").trim().slice(0, 120), n: n, m: secs.length }));
        else if (n >= secs.length && o && o.u === location.pathname) sset("tikitexto:saber:ultimo", "");
      } catch (e) { /* sin almacenamiento */ }
    }
    pinta();
    // plegado
    secs.forEach(function (s) {
      var h = s._h; h.tabIndex = 0; h.setAttribute("role", "button"); h.setAttribute("aria-expanded", "true");
      function tog(ev) { if (ev.target.closest && ev.target.closest("a")) return; var c = s.classList.toggle("cerrada"); h.setAttribute("aria-expanded", c ? "false" : "true"); }
      h.addEventListener("click", tog);
      h.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); tog(ev); } });
    });
    var bt = el("div", "est-btns"), b1 = el("button", null, T.plegar), b2 = el("button", null, T.enfoque);
    b1.type = "button"; b2.type = "button"; b2.setAttribute("aria-pressed", "false");
    var plegado = false;
    b1.addEventListener("click", function () {
      plegado = !plegado; b1.textContent = plegado ? T.abrir : T.plegar;
      secs.forEach(function (s) { s.classList.toggle("cerrada", plegado); s._h.setAttribute("aria-expanded", plegado ? "false" : "true"); });
    });
    function enf(on) { html.classList.toggle("est-enfoque", on); b2.setAttribute("aria-pressed", on ? "true" : "false"); sset("tikitexto:saber:enfoque", on ? "1" : "0"); }
    b2.addEventListener("click", function () { enf(!html.classList.contains("est-enfoque")); });
    if (sget("tikitexto:saber:enfoque") === "1") enf(true);
    bt.appendChild(b1); bt.appendChild(b2); rail.appendChild(bt);
    // sección activa y vistas
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var i = secs.indexOf(e.target); if (i < 0) return;
          if (e.isIntersecting) {
            links.forEach(function (a) { a.removeAttribute("aria-current"); }); links[i].setAttribute("aria-current", "true");
            if (vistas.indexOf(e.target.id) === -1) { vistas.push(e.target.id); sset(key, JSON.stringify(vistas)); pinta(); }
            if (innerWidth <= 980) links[i].scrollIntoView({ inline: "center", block: "nearest" });
          }
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      secs.forEach(function (s) { io.observe(s); });
    }
    function abreHash() {
      var h = decodeURIComponent((location.hash || "").slice(1)); if (!h) return;
      var t = doc.getElementById(h); if (!t) return; var s = t.closest && t.closest(".est-sec"); if (s && s.classList.contains("cerrada")) { s.classList.remove("cerrada"); s._h.setAttribute("aria-expanded", "true"); }
    }
    addEventListener("hashchange", abreHash); abreHash();
    return true;
  }

  /* ---------- filtro de tarjetas en los listados ---------- */
  function filtroTarjetas(main) {
    var tj = main.querySelectorAll(".tarjeta"); if (tj.length < 9 || main.classList.contains("est-hubpage")) return;
    var primero = main.querySelector(".tarjetas"); if (!primero) return;
    var inp = el("input", "est-filtro"); inp.type = "search"; inp.placeholder = T.tarj; inp.setAttribute("aria-label", T.tarj);
    primero.parentNode.insertBefore(inp, primero);
    inp.addEventListener("input", function () { var q = norm(inp.value.trim()); Array.prototype.forEach.call(tj, function (t) { t.hidden = !!q && norm(t.textContent).indexOf(q) === -1; }); });
  }

  /* ---------- tablas interactivas ---------- */
  var NUM = /^[+−-]?\d[\d.,\s]*\s*(%|m|min|k|M)?$/;
  function num(s) {
    s = String(s).trim().replace(/ /g, " "); if (!NUM.test(s)) return NaN;
    var neg = /^[−-]/.test(s), x = s.replace(/^[+−-]/, "").replace(/[^\d.,\s]/g, "").replace(/\s+/g, "");
    var lc = x.lastIndexOf(","), ld = x.lastIndexOf(".");
    if (lc > -1 && ld > -1) { x = lc > ld ? x.replace(/\./g, "").replace(",", ".") : x.replace(/,/g, ""); }
    else if (lc > -1 || ld > -1) { var sep = lc > -1 ? "," : ".", pa = x.split(sep); if (pa.length > 2 || (pa.length === 2 && pa[1].length === 3 && pa[0].length <= 3 && pa[0] !== "0")) x = pa.join(""); else x = pa.join("."); }
    var v = parseFloat(x); return neg ? -v : v;
  }
  function fmt(v) { return (Math.round(v * 100) / 100).toLocaleString(lg === "es" ? "es-ES" : undefined); }
  function tabla(t) {
    if (t.dataset.est || !t.tHead || !t.tBodies[0]) return;
    var body = t.tBodies[0], filas = Array.prototype.slice.call(body.rows);
    if (filas.length < 4) return; t.dataset.est = "1"; t.classList.add("est-tabla");
    var cab = Array.prototype.slice.call(t.tHead.rows[0].cells), nc = cab.length;
    var esNum = cab.map(function (c, i) {
      var v = 0, tot = 0; filas.forEach(function (f) { var x = f.cells[i] ? f.cells[i].textContent.trim() : ""; if (x) { tot++; if (!isNaN(num(x))) v++; } });
      return tot > 0 && v / tot >= 0.8;
    });
    var envol = t.parentNode.classList.contains("tabla-scroll") ? t.parentNode : t;
    var tb = el("div", "est-tb"), inp = el("input"); inp.type = "search"; inp.placeholder = T.filtrar; inp.setAttribute("aria-label", T.filtrar); tb.appendChild(inp);
    var cols = []; cab.forEach(function (c, i) { if (esNum[i]) cols.push(i); });
    var selB = null, selN = null, colB = -1;
    if (cols.length) {
      var lb = el("label", null, T.barras); selB = el("select"); selB.setAttribute("aria-label", T.barras);
      var o0 = el("option", null, T.ninguna); o0.value = "-1"; selB.appendChild(o0);
      cols.forEach(function (i) { var o = el("option", null, cab[i].textContent.trim()); o.value = String(i); selB.appendChild(o); });
      lb.appendChild(selB); tb.appendChild(lb);
      var pref = cols.filter(function (i) { return !/^(a[nñ]o|year|ano|jahr|ann[eé]e|anno|n[.º°]?|#|pos)/i.test(cab[i].textContent.trim()) && i !== 0; });
      colB = pref.length ? pref[0] : -1; selB.value = String(colB);
    }
    if (filas.length > 12) {
      var lm = el("label", null, T.mostrar); selN = el("select"); selN.setAttribute("aria-label", T.mostrar);
      [[0, T.todas], [5, T.top.replace("{n}", 5)], [10, T.top.replace("{n}", 10)], [25, T.top.replace("{n}", 25)]].forEach(function (p) { var o = el("option", null, p[1]); o.value = p[0]; selN.appendChild(o); });
      lm.appendChild(selN); tb.appendChild(lm);
    }
    var bF = el("button", null, T.fij); bF.type = "button"; bF.setAttribute("aria-pressed", "false"); bF.hidden = true; tb.appendChild(bF);
    var bC = el("button", null, T.csv); bC.type = "button"; tb.appendChild(bC);
    var cnt = el("span", "est-n"); cnt.setAttribute("aria-live", "polite"); tb.appendChild(cnt);
    envol.parentNode.insertBefore(tb, envol);
    var res = el("p", "est-res"); envol.parentNode.insertBefore(res, envol.nextSibling);
    var orden = { i: -1, asc: true }, soloFij = false;
    function aplica() {
      var q = norm(inp.value.trim()), lim = selN ? +selN.value : 0, n = 0, vis = [];
      filas.forEach(function (f) {
        var ok = (!q || norm(f.textContent).indexOf(q) !== -1) && (!soloFij || f.classList.contains("est-pin"));
        if (ok && lim && n >= lim) ok = false; f.hidden = !ok; if (ok) { n++; vis.push(f); }
      });
      var npin = filas.filter(function (f) { return f.classList.contains("est-pin"); }).length;
      bF.hidden = !npin; bF.textContent = T.fij + " (" + npin + ")";
      cnt.textContent = n ? T.de.replace("{a}", n).replace("{b}", filas.length) : T.nada;
      // barras y resumen
      filas.forEach(function (f) { for (var i = 0; i < nc; i++) { var c = f.cells[i]; if (c) { c.classList.remove("est-b"); c.style.removeProperty("--w"); } } });
      res.textContent = "";
      if (colB > -1 && vis.length) {
        var vals = vis.map(function (f) { return num(f.cells[colB].textContent); }), mx = Math.max.apply(null, vals.filter(function (v) { return !isNaN(v); }));
        vis.forEach(function (f, k) { var v = vals[k]; if (!isNaN(v) && mx > 0) { f.cells[colB].classList.add("est-b"); f.cells[colB].style.setProperty("--w", Math.max(2, Math.round(Math.max(0, v) / mx * 100)) + "%"); } });
        var ok = vals.filter(function (v) { return !isNaN(v); }), s = ok.reduce(function (a, b) { return a + b; }, 0);
        var im = vals.indexOf(mx), quien = im > -1 ? vis[im].cells[0].textContent.trim() : "";
        var b = el("b", null, cab[colB].textContent.trim()); res.appendChild(b);
        res.appendChild(doc.createTextNode(" · " + T.suma + " " + fmt(s) + " · " + T.media + " " + fmt(s / ok.length) + " · " + T.max + " " + fmt(mx) + (quien ? " (" + quien + ")" : "")));
      }
      if (!res.textContent && filas.length > 4) res.textContent = T.pistaFijar;
    }
    inp.addEventListener("input", aplica); if (selB) selB.addEventListener("change", function () { colB = +selB.value; aplica(); }); if (selN) selN.addEventListener("change", aplica);
    bF.addEventListener("click", function () { soloFij = !soloFij; bF.setAttribute("aria-pressed", soloFij ? "true" : "false"); aplica(); });
    filas.forEach(function (f) { f.addEventListener("click", function (ev) { if (ev.target.closest && ev.target.closest("a")) return; f.classList.toggle("est-pin"); aplica(); }); });
    cab.forEach(function (th, i) {
      th.tabIndex = 0; th.setAttribute("role", "button");
      function ord() {
        var asc = !(orden.i === i && orden.asc); orden = { i: i, asc: asc };
        cab.forEach(function (x) { delete x.dataset.dir; }); th.dataset.dir = asc ? "asc" : "desc";
        filas.sort(function (a, b) {
          var x = a.cells[i].textContent.trim(), y = b.cells[i].textContent.trim(), r;
          if (esNum[i]) { var nx = num(x), ny = num(y); r = (isNaN(nx) ? -Infinity : nx) - (isNaN(ny) ? -Infinity : ny); if (!isFinite(r)) r = isNaN(nx) ? (isNaN(ny) ? 0 : -1) : 1; }
          else r = x.localeCompare(y, undefined, { sensitivity: "base" });
          return asc ? r : -r;
        });
        filas.forEach(function (f) { body.appendChild(f); }); aplica();
      }
      th.addEventListener("click", ord); th.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ord(); } });
    });
    bC.addEventListener("click", function () {
      var q = function (s) { s = String(s).replace(/\s+/g, " ").trim(); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      var out = [cab.map(function (c) { return q(c.textContent); }).join(";")];
      filas.forEach(function (f) { if (!f.hidden) out.push(Array.prototype.map.call(f.cells, function (c) { return q(c.textContent); }).join(";")); });
      try {
        var blob = new Blob(["﻿" + out.join("\n")], { type: "text/csv;charset=utf-8" }), a = el("a"); a.href = URL.createObjectURL(blob);
        a.download = "tikitexto-" + (location.pathname.replace(/\/+$/, "").split("/").pop() || "datos") + ".csv"; doc.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      } catch (e) { /* sin descarga */ }
    });
    aplica();
  }

  function init() {
    var main = doc.getElementById("contenido"); if (!main) return;
    html.classList.add("est-on");
    try { progreso(); } catch (e) { /* nada */ }
    try { if (!hub(main)) banco(main); } catch (e) { if (window.console) console.warn("estudio:", e); }
    try { filtroTarjetas(main); } catch (e) { /* nada */ }
    try { Array.prototype.forEach.call(doc.querySelectorAll("table"), tabla); } catch (e) { if (window.console) console.warn("tablas:", e); }
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init); else init();
})();
