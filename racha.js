/* RACHA DIARIA · tarjeta para compartir (módulo ES, carga perezosa). Solo lee la racha global (nv.rg); sin servidor ni datos personales. */
const RETOS = [
  { k: "d", ico: "🔤", n: "Diario" },
  { k: "cu", ico: "🧩", n: "Cuartetos" },
  { k: "tv", ico: "❓", n: "Trivia" },
  { k: "cr", ico: "✖️", n: "Cruces" },
  { k: "ma", ico: "🗺️", n: "Clava el sitio" },
  { k: "mj", ico: "🧭", n: "Minijuegos de mapas" },
];
const PLANTILLA = `
<div class="rc-fondo" aria-hidden="true"></div>
<div class="rc-cab"><button type="button" class="rc-x" data-rc="salir" aria-label="Cerrar">✕</button></div>
<main class="rc-caja" role="dialog" aria-modal="true" aria-label="Racha diaria">
  <p class="rc-kicker">Racha diaria</p>
  <div class="rc-llama" aria-hidden="true">🔥</div>
  <p class="rc-num" data-rc-n data-no-t>0</p>
  <p class="rc-dias" data-rc-d>días seguidos</p>
  <p class="rc-sub" data-rc-s></p>
  <div class="rc-datos">
    <div><b data-rc-m data-no-t>0</b><span>Mejor racha</span></div>
    <div><b data-rc-t data-no-t>0</b><span>Días con reto</span></div>
  </div>
  <p class="rc-hoy-t">Retos de hoy</p>
  <ul class="rc-hoy" data-rc-lista></ul>
  <canvas class="rc-cv" width="540" height="675" data-rc-cv aria-label="Tarjeta de tu racha"></canvas>
  <button type="button" class="rc-comp" data-rc="compartir">Compartir racha</button>
  <p class="rc-msg" data-rc-msg role="status"></p>
  <p class="rc-nota">Cada día que completas un reto diario cuenta para la racha. No da tikitextos y no se envía a ningún servidor.</p>
</main>`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s);
  let vivo = true, url = "";

  function pinta() {
    const a = api.actual();
    $("[data-rc-n]").textContent = a.racha;
    $("[data-rc-d]").textContent = a.racha === 1 ? "día seguido" : "días seguidos";
    $("[data-rc-s]").textContent = a.hecho ? "¡Hoy ya cuenta!" : a.racha > 0 ? "¡Hoy puedes mantenerla!" : "Completa un reto diario para empezar tu racha";
    $("[data-rc-m]").textContent = a.mejor;
    $("[data-rc-t]").textContent = a.total;
    $("[data-rc-lista]").innerHTML = RETOS.map((r) => '<li class="' + (a.retos.indexOf(r.k) >= 0 ? "ok" : "") + '"><i aria-hidden="true">' + r.ico + "</i><span>" + t(r.n) + "</span><b>" + (a.retos.indexOf(r.k) >= 0 ? "✔" : "·") + "</b></li>").join("");
    tarjeta(a);
  }

  /* Tarjeta 1080×1350 dibujada en canvas (se muestra a mitad de tamaño). Sin escudos, fotos ni nombre del jugador. */
  function tarjeta(a) {
    const cv = $("[data-rc-cv]"), W = 1080, H = 1350;
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    const fondo = g.createLinearGradient(0, 0, W, H); fondo.addColorStop(0, "#1a0b3d"); fondo.addColorStop(0.55, "#4a1608"); fondo.addColorStop(1, "#150a24");
    g.fillStyle = fondo; g.fillRect(0, 0, W, H);
    g.globalAlpha = 0.07; g.strokeStyle = "#ffd08a"; g.lineWidth = 3;
    for (let i = -H; i < W; i += 90) { g.beginPath(); g.moveTo(i, H); g.lineTo(i + H, 0); g.stroke(); }
    g.globalAlpha = 1;
    const halo = g.createRadialGradient(W / 2, 560, 40, W / 2, 560, 520); halo.addColorStop(0, "rgba(255,150,40,.55)"); halo.addColorStop(1, "rgba(255,150,40,0)");
    g.fillStyle = halo; g.fillRect(0, 0, W, H);
    g.textAlign = "center"; g.fillStyle = "#19e6ff"; g.font = "800 38px system-ui, sans-serif";
    if ("letterSpacing" in g) g.letterSpacing = "12px";
    g.fillText("TIKITEXTO", W / 2, 130);
    if ("letterSpacing" in g) g.letterSpacing = "0px";
    g.fillStyle = "#ffd08a"; g.font = "900 64px system-ui, sans-serif"; g.fillText(t("Racha diaria").toUpperCase(), W / 2, 220);
    g.font = "300px serif"; g.fillText("🔥", W / 2, 520);
    g.fillStyle = "#fff"; g.shadowColor = "rgba(255,160,60,.9)"; g.shadowBlur = 40;
    g.font = "900 380px system-ui, sans-serif"; g.fillText(String(a.racha), W / 2, 880); g.shadowBlur = 0;
    g.fillStyle = "#ffe6c8"; g.font = "800 70px system-ui, sans-serif"; g.fillText(t(a.racha === 1 ? "día seguido" : "días seguidos"), W / 2, 980);
    g.fillStyle = "rgba(255,255,255,.14)"; g.beginPath(); g.roundRect(150, 1040, 780, 120, 60); g.fill();
    g.fillStyle = "#fff"; g.font = "800 50px system-ui, sans-serif"; g.fillText(t("Mejor racha") + ": " + a.mejor, W / 2, 1118);
    g.fillStyle = "#19e6ff"; g.font = "800 46px system-ui, sans-serif"; g.fillText("tikitexto.com", W / 2, 1270);
    cv.getContext("2d").clearRect(0, 0, cv.width, cv.height); cv.getContext("2d").drawImage(c, 0, 0, cv.width, cv.height);
    cv._full = c;
  }

  function msg(s) { $("[data-rc-msg]").textContent = s ? t(s) : ""; }
  async function compartir() {
    const c = $("[data-rc-cv]")._full; if (!c) return;
    const a = api.actual();
    const blob = await new Promise((ok) => c.toBlob(ok, "image/png"));
    const texto = "🔥 " + a.racha + " " + t(a.racha === 1 ? "día seguido" : "días seguidos") + " · TIKITEXTO\nhttps://tikitexto.com/";
    try {
      const f = blob && typeof File === "function" ? new File([blob], "tikitexto-racha.png", { type: "image/png" }) : null;
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text: texto }); return; }
      if (navigator.share && !f) { await navigator.share({ text: texto }); return; }
    } catch (e) { if (e && e.name === "AbortError") return; }
    if (blob) {
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(blob);
      const l = document.createElement("a"); l.href = url; l.download = "tikitexto-racha.png"; document.body.appendChild(l); l.click(); l.remove();
      msg("Imagen descargada"); return;
    }
    try { await navigator.clipboard.writeText(texto); msg("¡Copiado!"); } catch (e) { /* sin portapapeles */ }
  }

  function cerrar() { if (!vivo) return; vivo = false; document.removeEventListener("keydown", tecla); if (url) URL.revokeObjectURL(url); api.salir(); }
  function tecla(e) { if (e.key === "Escape") cerrar(); }
  raiz.addEventListener("click", (e) => {
    const b = e.target.closest("[data-rc]"); if (!b) return;
    if (b.dataset.rc === "salir") cerrar(); else if (b.dataset.rc === "compartir") compartir();
  });
  document.addEventListener("keydown", tecla);
  pinta();
  return { cerrar, pinta, compartir, RETOS };
}
