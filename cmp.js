/* TIKITEXTO · aviso de cookies y medición (compartido por todas las páginas).
 * - Almacenamiento necesario: siempre activo, no necesita consentimiento.
 * - Medición de visitas SIN cookies (Cloudflare Web Analytics): activa salvo que se rechace.
 * - Google Tag Manager / Google Analytics (CON cookies): el código está en el <head> (lo añade tools/csp.py) con el consentimiento DENEGADO por defecto (Consent Mode); aquí solo se concede si el visitante acepta.
 * Elección guardada en localStorage: "tikitexto:consentimiento" (si/no, medición sin cookies) y "tikitexto:analitica" (si/no, Google).
 * Cualquier otra etiqueta que se añada dentro de Tag Manager también queda bajo este consentimiento. */
(function () {
  "use strict";
  var GTM_ID = "GTM-WN89TQCM";          // contenedor de Google Tag Manager (vacío = no se ofrece Google)
  var CF_TOKEN = "dab3fe665e7c48fb81d093154d9bd1ea"; // Cloudflare Web Analytics (token público)
  var K = "tikitexto:consentimiento", KG = "tikitexto:analitica";

  var D = {
    es: { t1: "Contamos las visitas de forma anónima y sin cookies.", t2: " Si lo aceptas, también usamos Google Analytics (mediante Google Tag Manager, con cookies) para saber qué contenidos te interesan y mejorar la web.", mas: "Más información", rech: "Rechazar todo", conf: "Configurar", acep: "Aceptar todo", h: "Configurar cookies", nec: "Almacenamiento necesario", necd: "Sesión, partida, tema e idioma. Siempre activo: sin él el juego no funciona.", med: "Medición de visitas sin cookies", medd: "Estadísticas anónimas y agregadas (Cloudflare Web Analytics). Activa por defecto; puedes desactivarla.", ga: "Google Analytics (con cookies)", gad: "Cookies de Google para entender qué contenidos interesan. Desactivada por defecto: solo se carga si la aceptas.", guard: "Guardar elección" },
    en: { t1: "We count visits anonymously and without cookies.", t2: " If you accept, we also use Google Analytics (through Google Tag Manager, with cookies) to learn which content interests you and improve the site.", mas: "More information", rech: "Reject all", conf: "Settings", acep: "Accept all", h: "Cookie settings", nec: "Necessary storage", necd: "Session, game, theme and language. Always on: the game does not work without it.", med: "Cookie-free visit measurement", medd: "Anonymous, aggregated statistics (Cloudflare Web Analytics). On by default; you can turn it off.", ga: "Google Analytics (with cookies)", gad: "Google cookies to understand which content is of interest. Off by default: it only loads if you accept.", guard: "Save choice" },
    pt: { t1: "Contamos as visitas de forma anónima e sem cookies.", t2: " Se aceitar, também usamos o Google Analytics (através do Google Tag Manager, com cookies) para saber que conteúdos lhe interessam e melhorar o site.", mas: "Mais informações", rech: "Rejeitar tudo", conf: "Configurar", acep: "Aceitar tudo", h: "Configurar cookies", nec: "Armazenamento necessário", necd: "Sessão, partida, tema e idioma. Sempre ativo: sem ele o jogo não funciona.", med: "Medição de visitas sem cookies", medd: "Estatísticas anónimas e agregadas (Cloudflare Web Analytics). Ativa por defeito; pode desativá-la.", ga: "Google Analytics (com cookies)", gad: "Cookies da Google para perceber que conteúdos interessam. Desativada por defeito: só carrega se a aceitar.", guard: "Guardar escolha" },
    fr: { t1: "Nous comptons les visites de façon anonyme et sans cookies.", t2: " Si vous acceptez, nous utilisons aussi Google Analytics (via Google Tag Manager, avec cookies) pour savoir quels contenus vous intéressent et améliorer le site.", mas: "Plus d'informations", rech: "Tout refuser", conf: "Paramétrer", acep: "Tout accepter", h: "Paramétrer les cookies", nec: "Stockage nécessaire", necd: "Session, partie, thème et langue. Toujours actif : sans lui, le jeu ne fonctionne pas.", med: "Mesure des visites sans cookies", medd: "Statistiques anonymes et agrégées (Cloudflare Web Analytics). Activée par défaut ; vous pouvez la désactiver.", ga: "Google Analytics (avec cookies)", gad: "Cookies Google pour comprendre quels contenus intéressent. Désactivé par défaut : ne se charge que si vous acceptez.", guard: "Enregistrer le choix" },
    it: { t1: "Contiamo le visite in forma anonima e senza cookie.", t2: " Se accetti, usiamo anche Google Analytics (tramite Google Tag Manager, con cookie) per capire quali contenuti ti interessano e migliorare il sito.", mas: "Maggiori informazioni", rech: "Rifiuta tutto", conf: "Configura", acep: "Accetta tutto", h: "Configura i cookie", nec: "Archiviazione necessaria", necd: "Sessione, partita, tema e lingua. Sempre attiva: senza di essa il gioco non funziona.", med: "Misurazione delle visite senza cookie", medd: "Statistiche anonime e aggregate (Cloudflare Web Analytics). Attiva per impostazione predefinita; puoi disattivarla.", ga: "Google Analytics (con cookie)", gad: "Cookie di Google per capire quali contenuti interessano. Disattivato per impostazione predefinita: si carica solo se accetti.", guard: "Salva la scelta" },
    de: { t1: "Wir zählen Besuche anonym und ohne Cookies.", t2: " Wenn du zustimmst, nutzen wir außerdem Google Analytics (über den Google Tag Manager, mit Cookies), um zu erfahren, welche Inhalte dich interessieren, und die Seite zu verbessern.", mas: "Mehr Informationen", rech: "Alle ablehnen", conf: "Einstellungen", acep: "Alle akzeptieren", h: "Cookie-Einstellungen", nec: "Notwendiger Speicher", necd: "Sitzung, Spiel, Design und Sprache. Immer aktiv: ohne ihn funktioniert das Spiel nicht.", med: "Besuchsmessung ohne Cookies", medd: "Anonyme, aggregierte Statistiken (Cloudflare Web Analytics). Standardmäßig aktiv; du kannst sie ausschalten.", ga: "Google Analytics (mit Cookies)", gad: "Google-Cookies, um zu verstehen, welche Inhalte interessieren. Standardmäßig aus: wird nur geladen, wenn du zustimmst.", guard: "Auswahl speichern" }
  };

  function lang() {
    var l = "";
    try { l = localStorage.getItem("tikitexto:idioma") || ""; } catch (e) { /* sin almacenamiento */ }
    if (!D[l]) l = (document.documentElement.lang || "es").slice(0, 2).toLowerCase();
    return D[l] ? l : "es";
  }
  function leer(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function poner(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
  function medicion() { // true = medición sin cookies permitida (elección anterior incluida)
    var v = leer(K);
    if (v === "si" || v === "no") return v === "si";
    return leer("tikitexto:sin-medicion") !== "1";
  }

  /* ---- Cargas ---- */
  var cfCargado = false, gtmActivo = false;
  function cargarCf() {
    if (cfCargado) return; cfCargado = true;
    var s = document.createElement("script");
    s.defer = true; s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", '{"token": "' + CF_TOKEN + '"}');
    document.head.appendChild(s);
  }
  function consentir(v) { // modo de consentimiento de Google: el código de Tag Manager ya está en <head> con todo denegado
    if (!GTM_ID || typeof window.gtag !== "function") return;
    window.gtag("consent", "update", { analytics_storage: v ? "granted" : "denied" });
  }
  function borrarCookiesGoogle() {
    var partes = location.hostname.split("."), doms = ["", location.hostname, "." + location.hostname];
    if (partes.length > 2) doms.push("." + partes.slice(-2).join("."));
    else doms.push("." + location.hostname);
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n === "_ga" || n.indexOf("_ga_") === 0 || n === "_gid" || n.indexOf("_gat") === 0 || n.indexOf("_gcl_") === 0) {
        doms.forEach(function (d) { document.cookie = n + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/" + (d ? ";domain=" + d : ""); });
      }
    });
  }
  function aplicar() {
    if (medicion()) cargarCf();
    if (leer(KG) === "si") { consentir(true); gtmActivo = true; }
    else {
      consentir(false);
      if (gtmActivo || /(^|;\s*)_ga/.test(document.cookie)) { borrarCookiesGoogle(); if (gtmActivo) location.reload(); }
    }
  }

  /* ---- Interfaz ---- */
  function estilo() {
    if (document.getElementById("cmpEstilo")) return;
    var st = document.createElement("style"); st.id = "cmpEstilo";
    st.textContent = ".cmp{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;justify-content:center;padding:8px;pointer-events:none;font:15px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
      ".cmp[hidden]{display:none}" +
      ".cmp__caja{pointer-events:auto;width:min(620px,100%);max-height:90vh;overflow:auto;background:#10203a;color:#fff;border:1px solid #3a5380;border-radius:14px;padding:14px 16px;box-shadow:0 10px 34px rgba(0,0,0,.4)}" +
      ".cmp__caja h2{margin:0 0 6px;font-size:1rem}.cmp__caja p{margin:0 0 10px}.cmp__caja a{color:#8fd0ff;text-decoration:underline}" +
      ".cmp__fila{display:flex;flex-wrap:wrap;gap:8px}" +
      ".cmp__fila button{flex:1 1 140px;min-height:44px;padding:10px 14px;font:inherit;font-weight:700;color:#10203a;background:#fff;border:2px solid #fff;border-radius:10px;cursor:pointer}" +
      "#cmpPrincipal .cmp__fila button{flex:1 1 calc(50% - 4px)}#cmpPrincipal #cmpConfig{flex:1 1 100%;order:3;min-height:36px;background:transparent;color:#fff;border-color:#3a5380;font-weight:600}" +
      ".cmp__fila button:hover{background:#dfeaff;border-color:#dfeaff;color:#10203a}.cmp__fila button:focus-visible{outline:3px solid #ffd54a;outline-offset:2px}" +
      ".cmp__opcion{display:flex;gap:10px;align-items:flex-start;margin:8px 0;padding:10px;background:#1a2f52;border:1px solid #3a5380;border-radius:10px}" +
      ".cmp__opcion input{margin-top:3px;width:18px;height:18px;accent-color:#4fc3f7}.cmp__opcion small{display:block;color:#c3d3ee;font-size:.82rem}";
    document.head.appendChild(st);
  }
  function construir() {
    var t = D[lang()], c = document.getElementById("cmp");
    if (c) c.parentNode.removeChild(c);
    c = document.createElement("div");
    c.className = "cmp"; c.id = "cmp"; c.hidden = true;
    c.setAttribute("role", "dialog"); c.setAttribute("aria-modal", "false"); c.setAttribute("aria-labelledby", "cmpTitulo"); c.setAttribute("data-no-t", "");
    c.setAttribute("translate", "no");
    c.innerHTML =
      '<div class="cmp__caja"><div id="cmpPrincipal"><p id="cmpTitulo"></p>' +
      '<div class="cmp__fila"><button type="button" id="cmpRechazar"></button><button type="button" id="cmpConfig"></button><button type="button" id="cmpAceptar"></button></div></div>' +
      '<div id="cmpAjustes" hidden><h2></h2>' +
      '<div class="cmp__opcion"><input type="checkbox" checked disabled id="cmpNec"><label for="cmpNec"><span></span><small></small></label></div>' +
      '<div class="cmp__opcion"><input type="checkbox" id="cmpMed"><label for="cmpMed"><span></span><small></small></label></div>' +
      (GTM_ID ? '<div class="cmp__opcion"><input type="checkbox" id="cmpGa"><label for="cmpGa"><span></span><small></small></label></div>' : "") +
      '<div class="cmp__fila"><button type="button" id="cmpGuardar"></button><button type="button" id="cmpTodo"></button></div></div></div>';
    document.body.appendChild(c);
    var $ = function (id) { return document.getElementById(id); };
    var txt = $("cmpTitulo");
    txt.appendChild(document.createTextNode(t.t1 + (GTM_ID ? t.t2 : "") + " "));
    var a = document.createElement("a"); a.href = "/cookies.html"; a.textContent = t.mas; txt.appendChild(a);
    $("cmpRechazar").textContent = t.rech; $("cmpConfig").textContent = t.conf; $("cmpAceptar").textContent = t.acep;
    c.querySelector("h2").textContent = t.h;
    var ops = c.querySelectorAll(".cmp__opcion"), datos = [[t.nec, t.necd], [t.med, t.medd], [t.ga, t.gad]];
    for (var i = 0; i < ops.length; i++) { ops[i].querySelector("span").textContent = datos[i][0]; ops[i].querySelector("small").textContent = datos[i][1]; }
    $("cmpGuardar").textContent = t.guard; $("cmpTodo").textContent = t.acep;
    return c;
  }

  function iniciar() {
    estilo();
    var c = construir();
    var $ = function (id) { return document.getElementById(id); };
    function mostrar(ajustes) {
      $("cmpMed").checked = medicion();
      if ($("cmpGa")) $("cmpGa").checked = leer(KG) === "si";
      $("cmpPrincipal").hidden = !!ajustes; $("cmpAjustes").hidden = !ajustes; c.hidden = false;
      if (ajustes) $("cmpGuardar").focus();
    }
    function decidir(med, ga) {
      poner(K, med ? "si" : "no");
      if (med) { try { localStorage.removeItem("tikitexto:sin-medicion"); } catch (e) { /* */ } } else poner("tikitexto:sin-medicion", "1");
      if (GTM_ID) poner(KG, ga ? "si" : "no");
      c.hidden = true;
      aplicar();
    }
    $("cmpAceptar").addEventListener("click", function () { decidir(true, true); });
    $("cmpTodo").addEventListener("click", function () { decidir(true, true); });
    $("cmpRechazar").addEventListener("click", function () { decidir(false, false); });
    $("cmpConfig").addEventListener("click", function () { mostrar(true); });
    $("cmpGuardar").addEventListener("click", function () { decidir($("cmpMed").checked, $("cmpGa") ? $("cmpGa").checked : false); });
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("#abrirCookies, [data-abrir-cookies]");
      if (t) { e.preventDefault(); mostrar(true); }
    });
    window.TIKI_CMP = { limpiar: borrarCookiesGoogle, abrir: function () { mostrar(true); }, estado: function () { return { medicion: medicion(), google: leer(KG) === "si" }; } };

    aplicar(); // la medición sin cookies funciona salvo rechazo; Google solo con aceptación expresa
    var sinElegir = leer(K) === null && leer("tikitexto:sin-medicion") !== "1";
    var preguntar = sinElegir || (GTM_ID && leer(KG) === null);
    var esJuego = !!document.getElementById("botonAjustes"), idioma = !!leer("tikitexto:idioma");
    if (preguntar && !/bot|crawl|spider|lighthouse/i.test(navigator.userAgent || "") && (!esJuego || idioma)) c.hidden = false;
    if (location.hash === "#configurar-cookies") mostrar(true);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
