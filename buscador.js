/* Buscador de TIKITEXTO: busca en todas las páginas (índice buscador.json), sin tildes, sin servidor. */
(function () {
  var T = {
    es: { ph: "Buscar en todo: artículos, datos, juegos…", vacio: "No hay resultados. Prueba con otra palabra (por ejemplo «Messi», «fuera de juego» o «Mundial»).", n: "resultados", lbl: "Buscar", art: "Artículo", his: "Historia", peq: "Peques", dat: "Récords", cur: "Curiosidad", jue: "Juego", sob: "Sobre nosotros" },
    en: { ph: "Search everything: articles, records, games…", vacio: "No results. Try another word (for example “Messi”, “offside” or “World Cup”).", n: "results", lbl: "Search", art: "Article", his: "Story", peq: "Kids", dat: "Records", cur: "Trivia", jue: "Game", sob: "About" }
  };
  T.pt = { ph: "Buscar em tudo…", vacio: "Sem resultados.", n: "resultados", lbl: "Buscar", art: "Artigo", his: "História", peq: "Crianças", dat: "Recordes", cur: "Curiosidade", jue: "Jogo", sob: "Sobre" };
  T.fr = { ph: "Tout rechercher…", vacio: "Aucun résultat.", n: "résultats", lbl: "Rechercher", art: "Article", his: "Histoire", peq: "Enfants", dat: "Records", cur: "Anecdote", jue: "Jeu", sob: "À propos" };
  T.it = { ph: "Cerca in tutto…", vacio: "Nessun risultato.", n: "risultati", lbl: "Cerca", art: "Articolo", his: "Storia", peq: "Bambini", dat: "Record", cur: "Curiosità", jue: "Gioco", sob: "Info" };
  T.de = { ph: "Alles durchsuchen…", vacio: "Keine Treffer.", n: "Treffer", lbl: "Suchen", art: "Artikel", his: "Geschichte", peq: "Kinder", dat: "Rekorde", cur: "Wissenswertes", jue: "Spiel", sob: "Über uns" };
  var EMO = { art: "✍️", his: "📖", peq: "🧒", dat: "📊", cur: "⚡", jue: "🎮", sob: "ℹ️" };
  var CSS = ".bus{margin:18px auto 4px;max-width:980px;position:relative;z-index:5}" +
    ".bus__f{display:flex;align-items:center;gap:10px;padding:4px 16px;border-radius:999px;background:var(--caja,var(--superficie,rgba(127,127,127,.12)));border:2px solid rgba(127,127,127,.35);box-shadow:0 6px 18px rgba(0,0,0,.08)}" +
    ".bus__f:focus-within{border-color:#1747d6;box-shadow:0 0 0 4px rgba(23,71,214,.22)}" +
    ".bus__lupa{font-size:1.15rem}.bus__in{flex:1;min-width:0;border:0;outline:0;background:transparent;color:inherit;font:600 1rem/1.2 inherit;padding:13px 0}" +
    ".bus__in::placeholder{opacity:.65}" +
    ".bus__res{margin-top:10px;padding:10px;border-radius:20px;background:var(--caja,var(--superficie,rgba(127,127,127,.12)));border:1px solid rgba(127,127,127,.3);max-height:70vh;overflow:auto;text-align:left}" +
    ".bus__n{margin:4px 8px 8px;font-size:.78rem;font-weight:800;opacity:.65;text-transform:uppercase;letter-spacing:.08em}.bus__vacio{margin:10px 8px;opacity:.8}" +
    ".bus__lista{list-style:none;margin:0;padding:0;display:grid;gap:6px}" +
    ".bus__lista a{display:grid;grid-template-columns:2.4rem 1fr auto;align-items:center;gap:12px;padding:9px 12px;border-radius:14px;text-decoration:none;color:inherit;border:1px solid transparent}" +
    ".bus__lista a:hover,.bus__lista a:focus-visible{background:rgba(23,71,214,.12);border-color:rgba(23,71,214,.4);outline:none}" +
    ".bus__emo{display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:12px;background:rgba(127,127,127,.15);font-size:1.25rem}" +
    ".bus__txt{display:grid;gap:2px;min-width:0}.bus__txt b{font-size:.95rem;line-height:1.25}.bus__txt em{font-style:normal;font-size:.8rem;opacity:.72;line-height:1.3}" +
    ".bus__tipo{font-size:.68rem;font-weight:800;padding:3px 9px;border-radius:999px;background:rgba(23,71,214,.14);color:inherit;white-space:nowrap}" +
    "@media(max-width:520px){.bus__lista a{grid-template-columns:2.2rem 1fr}.bus__tipo{display:none}}";
  function estilo() { if (document.getElementById("busCss")) return; var s = document.createElement("style"); s.id = "busCss"; s.textContent = CSS; document.head.appendChild(s); }
  function norm(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function idioma() {
    var l = ""; try { l = localStorage.getItem("tikitexto:idioma") || ""; } catch (e) {}
    l = l || document.documentElement.lang || "es"; l = l.slice(0, 2).toLowerCase();
    return T[l] ? l : "es";
  }
  var datos = null, cargando = null;
  function cargar() {
    if (datos) return Promise.resolve(datos);
    if (!cargando) cargando = fetch("/buscador.json").then(function (r) { return r.json(); }).then(function (d) {
      d.forEach(function (x) { x._n = norm(x.n); x._h = norm(x.n + " " + x.d + " " + x.k); }); datos = d; return d;
    });
    return cargando;
  }
  function buscar(q, lang) {
    var toks = norm(q).split(/\s+/).filter(function (t) { return t.length > 1 || /\d/.test(t); });
    if (!toks.length) return [];
    var res = [];
    datos.forEach(function (x) {
      if (x.l !== lang && x.l !== "es" && !(lang !== "es" && x.l === "en")) return;
      var p = 0;
      for (var i = 0; i < toks.length; i++) {
        if (x._h.indexOf(toks[i]) < 0) return;
        p += (x._n.indexOf(toks[i]) >= 0 ? 6 : 1);
      }
      if (x.l === lang) p += 5;
      if (x._n.indexOf(norm(q).trim()) >= 0) p += 8;
      res.push([p, x]);
    });
    res.sort(function (a, b) { return b[0] - a[0]; });
    // si el idioma pedido tiene resultados, solo ese idioma
    var mios = res.filter(function (r) { return r[1].l === lang; });
    return (mios.length ? mios : res).slice(0, 12).map(function (r) { return r[1]; });
  }
  function montar(c) {
    var lang = idioma(), t = T[lang];
    c.setAttribute("data-no-t", "");
    c.innerHTML = '<form class="bus__f" role="search" onsubmit="return false"><span class="bus__lupa" aria-hidden="true">🔍</span>' +
      '<input class="bus__in" type="search" autocomplete="off" spellcheck="false" enterkeyhint="search" aria-label="' + esc(t.lbl) + '" placeholder="' + esc(t.ph) + '">' +
      '</form><div class="bus__res" role="region" aria-live="polite" hidden></div>';
    var inp = c.querySelector(".bus__in"), res = c.querySelector(".bus__res"), tm;
    function pintar() {
      var q = inp.value.trim();
      if (q.length < 2) { res.hidden = true; res.innerHTML = ""; return; }
      cargar().then(function () {
        var r = buscar(q, lang);
        res.hidden = false;
        if (!r.length) { res.innerHTML = '<p class="bus__vacio">' + esc(t.vacio) + "</p>"; return; }
        res.innerHTML = '<p class="bus__n">' + r.length + " " + esc(t.n) + '</p><ul class="bus__lista">' + r.map(function (x) {
          return '<li><a href="' + esc(x.u) + '"><span class="bus__emo" aria-hidden="true">' + (EMO[x.t] || "⚡") + '</span><span class="bus__txt"><b>' + esc(x.n) + '</b><em>' + esc(x.d.length > 110 ? x.d.slice(0, 108).replace(/\s+\S*$/, "") + "…" : x.d) + '</em></span><span class="bus__tipo">' + esc(t[x.t] || "") + "</span></a></li>";
        }).join("") + "</ul>";
      });
    }
    inp.addEventListener("input", function () { clearTimeout(tm); tm = setTimeout(pintar, 120); });
    inp.addEventListener("focus", cargar);
    inp.addEventListener("keydown", function (e) { if (e.key === "Escape") { inp.value = ""; pintar(); } });
  }
  function init() { estilo(); document.querySelectorAll("[data-buscador]").forEach(montar); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
