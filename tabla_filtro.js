/* TIKITEXTO · filtro y orden de tablas (table[data-filtro]). Sin dependencias ni datos externos. */
(function () {
  var en = (document.documentElement.lang || "es").slice(0, 2) !== "es";
  var T = en ? { ph: "Filter…", of: "Showing {a} of {b}", none: "No results" } : { ph: "Filtrar…", of: "Mostrando {a} de {b}", none: "Sin resultados" };
  function norm(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  document.querySelectorAll("table[data-filtro]").forEach(function (t) {
    var body = t.tBodies[0], filas = Array.prototype.slice.call(body.rows), cab = t.tHead.rows[0].cells;
    var box = document.createElement("div"); box.className = "filtro";
    var inp = document.createElement("input"); inp.type = "search"; inp.placeholder = T.ph; inp.setAttribute("aria-label", T.ph);
    inp.style.cssText = "width:100%;max-width:340px;padding:8px 10px;margin:6px 0;border:1px solid #9aa5b8;border-radius:8px;font:inherit;background:transparent;color:inherit";
    var cnt = document.createElement("span"); cnt.style.cssText = "margin-left:10px;font-size:.85em;opacity:.8"; cnt.setAttribute("aria-live", "polite");
    box.appendChild(inp); box.appendChild(cnt); t.parentNode.parentNode.insertBefore(box, t.parentNode);
    function filtra() {
      var q = norm(inp.value.trim()), n = 0;
      filas.forEach(function (f) { var ok = !q || norm(f.textContent).indexOf(q) !== -1; f.hidden = !ok; if (ok) n++; });
      cnt.textContent = n ? T.of.replace("{a}", n).replace("{b}", filas.length) : T.none;
    }
    inp.addEventListener("input", filtra); filtra();
    Array.prototype.forEach.call(cab, function (th, i) {
      th.style.cursor = "pointer"; th.tabIndex = 0; th.setAttribute("role", "button");
      function orden() {
        var asc = th.dataset.dir !== "asc"; Array.prototype.forEach.call(cab, function (x) { delete x.dataset.dir; }); th.dataset.dir = asc ? "asc" : "desc";
        filas.sort(function (a, b) {
          var x = a.cells[i].textContent.trim(), y = b.cells[i].textContent.trim();
          var nx = parseFloat(x.replace(/[.,\s]/g, "")), ny = parseFloat(y.replace(/[.,\s]/g, ""));
          var r = (!isNaN(nx) && !isNaN(ny) && /^[\d.,\s]+/.test(x) && /^[\d.,\s]+/.test(y)) ? nx - ny : x.localeCompare(y, undefined, { sensitivity: "base" });
          return asc ? r : -r;
        });
        filas.forEach(function (f) { body.appendChild(f); });
      }
      th.addEventListener("click", orden); th.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); orden(); } });
    });
  });
})();
