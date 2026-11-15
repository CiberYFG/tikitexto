/* CLASES TIKITEXTO · clases animadas de fútbol (15-nov-2026)
   Un profe-monigote (personalizable) o una pizarra digital explican una regla; la voz sale del navegador (speechSynthesis),
   los subtítulos van siempre y el sonido de ambiente se sintetiza (WebAudio). Módulo ES; todo propio: sin escudos, fotos ni logos. */
import { LECCIONES } from "./clases_datos.js";

const W = 800, H = 520;
const FUENTE = '"Segoe Print","Chalkboard SE","Comic Neue","Comic Sans MS",system-ui,sans-serif';
const PIELES = ["#ffdbb4", "#f1c27d", "#d29b6b", "#a8693f", "#6b4226"];
const PELOS = ["#2b1b12", "#6b4423", "#c98b3c", "#e6c36a", "#8a8f99", "#d3342f"];
const ROPAS = [{ n: "Azul", c: "#2f6fe4", d: "#1d3f8a" }, { n: "Rojo", c: "#d93b3b", d: "#7d1f1f" }, { n: "Verde", c: "#2fa564", d: "#17613b" },
  { n: "Negro", c: "#2a2f3a", d: "#14171d" }, { n: "Morado", c: "#8b4fd6", d: "#4b2a80" }, { n: "Naranja", c: "#f08a24", d: "#8a4b0c" }];
const VELS = [0.85, 1, 1.2];
const CFG0 = { piel: 1, pelo: 0, peloE: "corto", ropa: "traje", color: 0, acc: "ninguno", voz: "", tono: 1, vel: 1, amb: "estadio", vista: "profe", vozOn: true };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (p) => 1 - Math.pow(1 - p, 3);
const back = (p) => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };

export function abrir(api, raiz) {
  const t$ = (s) => (api.t ? api.t(s) : s);
  const dat = api.datos();
  if (!dat.cfg) dat.cfg = {};
  if (!dat.hechas) dat.hechas = {};
  const cfg = Object.assign({}, CFG0, dat.cfg);
  const guardarCfg = () => { dat.cfg = Object.assign({}, cfg); try { api.guardar(); } catch (e) { /* opcional */ } };
  let vivo = true;

  raiz.innerHTML =
    '<div class="cl-cab"><button class="cl-btn" data-cl="salir" aria-label="Salir">✕</button><b class="cl-tit" data-tit>Clases de fútbol</b>' +
    '<button class="cl-btn cl-btn--txt" data-cl="profe">🧑‍🏫 <span>Profe</span></button></div>' +
    '<div class="cl-menu" data-menu><div class="cl-caja cl-caja--m"><p class="cl-kicker">NO ES UN JUEGO · ES UNA CLASE</p><h2 class="cl-h">Clases de fútbol</h2>' +
    '<p class="cl-sub">Mini vídeos animados con pizarra, profe con voz y sonido de estadio. Al acabar, un minitest.</p><div class="cl-lista" data-lista></div></div></div>' +
    '<div class="cl-pl" data-pl hidden><div class="cl-lienzo" data-lienzo><canvas data-cv></canvas></div>' +
    '<p class="cl-giro">📱 Gira el móvil para verlo más grande</p><div class="cl-ctl"><div class="cl-prog" data-prog></div><div class="cl-fila">' +
    '<button class="cl-btn" data-cl="ant" aria-label="Escena anterior">⏮</button><button class="cl-btn cl-btn--g" data-cl="play" aria-label="Pausa o reproducir">⏸</button><button class="cl-btn" data-cl="sig" aria-label="Escena siguiente">⏭</button>' +
    '<button class="cl-btn cl-btn--txt" data-cl="vel">1×</button><button class="cl-btn cl-btn--txt" data-cl="voz">🗣 Voz</button>' +
    '<button class="cl-btn cl-btn--txt" data-cl="amb">🔊 Estadio</button><button class="cl-btn cl-btn--txt" data-cl="vista">🖍 Pizarra</button></div></div></div>' +
    '<div class="cl-modal" data-quiz hidden><div class="cl-caja"><p class="cl-kicker" data-qk>MINITEST</p><h3 class="cl-h" data-qp></h3><div class="cl-ops" data-qo></div><p class="cl-res" data-qr></p>' +
    '<div class="cl-bots"><button class="cl-sec" data-cl="otra">Otra clase</button><button class="cl-sec" data-cl="repetir">Repetir clase</button></div></div></div>' +
    '<div class="cl-modal" data-aj hidden><div class="cl-caja cl-caja--aj"><h3 class="cl-h">Tu profe</h3><div class="cl-prev"><canvas data-prev width="220" height="300"></canvas></div><div class="cl-ajs" data-ajs></div>' +
    '<div class="cl-bots"><button class="cl-sec" data-cl="probar">🔈 Probar voz</button><button class="cl-jugar" data-cl="ajok">Listo</button></div></div></div>';

  const $ = (s) => raiz.querySelector(s);
  const cv = $("[data-cv]"), g = cv.getContext("2d"), lienzo = $("[data-lienzo]");
  const K = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  cv.width = W * K; cv.height = H * K;

  /* ---------- sonido (todo sintetizado) ---------- */
  let AC = null, amb = null, ruido = null;
  const sonidoOn = () => { try { return api.sonido() !== false; } catch (e) { return true; } };
  function ctxAudio() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  }
  function bufRuido() {
    if (ruido || !AC) return ruido;
    const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = b.getChannelData(0); let l = 0;
    for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; l = (l + 0.04 * w) / 1.04; d[i] = l * 6; }
    ruido = b; return b;
  }
  function pararAmbiente() { if (amb) { try { amb.parar(); } catch (e) { /* ok */ } amb = null; } }
  function ponerAmbiente() {
    pararAmbiente();
    if (!sonidoOn() || cfg.amb === "off" || !vivo) return;
    const a = ctxAudio(); if (!a) return;
    const nodos = [], timers = [];
    const out = a.createGain(); out.gain.value = 0; out.connect(a.destination); out.gain.linearRampToValueAtTime(1, a.currentTime + 1.5);
    if (cfg.amb === "estadio") {
      const s = a.createBufferSource(); s.buffer = bufRuido(); s.loop = true;
      const f = a.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 520; f.Q.value = 0.5;
      const v = a.createGain(); v.gain.value = 0.16; s.connect(f); f.connect(v); v.connect(out); s.start(); nodos.push(s);
      const lfo = a.createOscillator(), lg = a.createGain(); lfo.frequency.value = 0.11; lg.gain.value = 0.06; lfo.connect(lg); lg.connect(v.gain); lfo.start(); nodos.push(lfo);
      const ooh = () => {
        if (!amb) return; const t = a.currentTime, s2 = a.createBufferSource(); s2.buffer = bufRuido(); s2.loop = true;
        const f2 = a.createBiquadFilter(); f2.type = "bandpass"; f2.frequency.value = 760; f2.Q.value = 0.9; const v2 = a.createGain();
        v2.gain.setValueAtTime(0, t); v2.gain.linearRampToValueAtTime(0.22, t + 0.8); v2.gain.linearRampToValueAtTime(0, t + 2.2);
        s2.connect(f2); f2.connect(v2); v2.connect(out); s2.start(t); s2.stop(t + 2.4);
        timers.push(setTimeout(ooh, 6000 + Math.random() * 7000));
      };
      timers.push(setTimeout(ooh, 3000));
    } else {
      /* música suave: acorde lento + notas sueltas de pentatónica */
      [220, 277.18, 329.63].forEach((fr, i) => {
        const o = a.createOscillator(); o.type = "triangle"; o.frequency.value = fr; const gg = a.createGain(); gg.gain.value = 0.035;
        const lp = a.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; o.connect(lp); lp.connect(gg); gg.connect(out); o.start(); nodos.push(o);
        const l = a.createOscillator(), lgn = a.createGain(); l.frequency.value = 0.08 + i * 0.03; lgn.gain.value = 0.018; l.connect(lgn); lgn.connect(gg.gain); l.start(); nodos.push(l);
      });
      const NOTAS = [440, 493.88, 554.37, 659.25, 739.99, 880];
      const nota = () => {
        if (!amb) return; const t = a.currentTime, o = a.createOscillator(), gg = a.createGain(); o.type = "sine"; o.frequency.value = NOTAS[Math.floor(Math.random() * NOTAS.length)];
        gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(0.05, t + 0.02); gg.gain.exponentialRampToValueAtTime(0.0008, t + 1.6);
        o.connect(gg); gg.connect(out); o.start(t); o.stop(t + 1.7);
        timers.push(setTimeout(nota, 700 + Math.random() * 1800));
      };
      timers.push(setTimeout(nota, 800));
    }
    amb = { parar: function () { timers.forEach(clearTimeout); const t = a.currentTime; try { out.gain.cancelScheduledValues(t); out.gain.setTargetAtTime(0, t, 0.15); } catch (e) { /* ok */ }
      setTimeout(function () { nodos.forEach(function (n) { try { n.stop(); } catch (e) { /* ok */ } }); try { out.disconnect(); } catch (e) { /* ok */ } }, 700); } };
  }
  function fx(tipo) {
    if (!sonidoOn() || !vivo) return; const a = ctxAudio(); if (!a) return; const t = a.currentTime;
    if (tipo === "tiza") {
      const s = a.createBufferSource(); s.buffer = bufRuido(); const f = a.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2600; const v = a.createGain();
      v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(0.07, t + 0.02); v.gain.exponentialRampToValueAtTime(0.0005, t + 0.28);
      s.connect(f); f.connect(v); v.connect(a.destination); s.start(t, Math.random()); s.stop(t + 0.3);
    } else if (tipo === "pop") {
      const o = a.createOscillator(), v = a.createGain(); o.type = "sine"; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(760, t + 0.09);
      v.gain.setValueAtTime(0.09, t); v.gain.exponentialRampToValueAtTime(0.0005, t + 0.16); o.connect(v); v.connect(a.destination); o.start(t); o.stop(t + 0.18);
    } else if (tipo === "silbato") {
      const o = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(), v = a.createGain(); o.type = "sine"; o.frequency.value = 2850; l.frequency.value = 38; lg.gain.value = 90;
      l.connect(lg); lg.connect(o.frequency); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(0.1, t + 0.03); v.gain.setValueAtTime(0.1, t + 0.5); v.gain.exponentialRampToValueAtTime(0.0005, t + 0.7);
      o.connect(v); v.connect(a.destination); o.start(t); l.start(t); o.stop(t + 0.72); l.stop(t + 0.72);
    } else if (tipo === "bien" || tipo === "mal") {
      [tipo === "bien" ? [523, 659] : [260, 196]].forEach(function (par) {
        par.forEach(function (fr, i) { const o = a.createOscillator(), v = a.createGain(); o.type = tipo === "bien" ? "triangle" : "sawtooth"; o.frequency.value = fr;
          v.gain.setValueAtTime(0.0001, t + i * 0.11); v.gain.linearRampToValueAtTime(0.08, t + i * 0.11 + 0.02); v.gain.exponentialRampToValueAtTime(0.0005, t + i * 0.11 + 0.25);
          o.connect(v); v.connect(a.destination); o.start(t + i * 0.11); o.stop(t + i * 0.11 + 0.28); });
      });
    }
  }

  /* ---------- voz ---------- */
  const SS = ("speechSynthesis" in window) ? window.speechSynthesis : null;
  let voces = [];
  function cargaVoces() { try { voces = SS ? SS.getVoices().filter(function (v) { return /^es/i.test(v.lang); }) : []; } catch (e) { voces = []; } }
  cargaVoces(); if (SS) { try { SS.addEventListener("voiceschanged", cargaVoces); } catch (e) { /* ok */ } }
  let tokVoz = 0, usaVoz = false, vozFin = true, vozIni = false;
  function paraVoz() { tokVoz++; usaVoz = false; vozFin = true; if (SS) { try { SS.cancel(); } catch (e) { /* ok */ } } }
  function habla(texto, alFin) {
    paraVoz();
    if (!SS || !cfg.vozOn || !sonidoOn() || !voces.length) return false;
    const mi = tokVoz; usaVoz = true; vozFin = false; vozIni = false;
    try {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "es-ES"; u.rate = cfg.vel; u.pitch = cfg.tono; u.volume = 1;
      const v = voces.find(function (x) { return x.voiceURI === cfg.voz; }) || voces.find(function (x) { return /es-ES/i.test(x.lang); }) || voces[0]; if (v) u.voice = v;
      u.onstart = function () { if (mi === tokVoz) vozIni = true; };
      const fin = function () { if (mi === tokVoz) { vozFin = true; if (alFin) alFin(); } };
      u.onend = fin; u.onerror = fin;
      SS.speak(u);
      setTimeout(function () { if (mi === tokVoz && !vozIni) { try { SS.cancel(); } catch (e) { /* ok */ } usaVoz = false; vozFin = true; } }, 1800);
      return true;
    } catch (e) { usaVoz = false; vozFin = true; return false; }
  }

  /* ---------- reproductor ---------- */
  let lec = null, I = 0, T = 0, D = 5, play = false, hold = 0, quizAbierto = false, fired = new Set(), reloj = 0, ultimo = 0, vozMaxT = 0;
  const duracion = (es) => Math.max(es.min || 4, es.say.length / (15 * cfg.vel));

  function geom() {
    return cfg.vista === "pizarra" ? { x: 16, y: 14, w: 768, h: 396, sc: 1.25, ox: 25, oy: 24 } : { x: 16, y: 14, w: 620, h: 396, sc: 1, ox: 26, oy: 62 };
  }

  /* El "mundo" de la pizarra tras jugar las escenas anteriores y una parte (t) de la actual */
  function mundo(i, t) {
    const ents = [], porId = {};
    const aplica = (es, tt, Dd) => {
      if (es.limpia) { ents.length = 0; for (const k in porId) delete porId[k]; }
      for (let n = 0; n < es.items.length; n++) {
        const it = es.items[n], at = (it.at || 0) * Dd;
        if (tt < at) continue;
        if (it.k === "borra") { const e = porId[it.id]; if (e) { ents.splice(ents.indexOf(e), 1); delete porId[it.id]; } continue; }
        if (it.k === "sonido") continue;
        if (it.k === "mueve") {
          const e = porId[it.id]; if (!e) continue; const p = clamp((tt - at) / Math.max(0.01, (it.dur || .2) * Dd), 0, 1), q = ease(p);
          if (e._x0 === undefined || e._mv !== n) { e._x0 = e.x; e._y0 = e.y; e._mv = n; }
          e.x = e._x0 + (it.x - e._x0) * q; e.y = e._y0 + (it.y - e._y0) * q; if (p >= 1) { e._x0 = undefined; e.x = it.x; e.y = it.y; }
          continue;
        }
        const e = Object.assign({}, it); e.p = clamp((tt - at) / Math.max(0.01, (it.d || .12) * Dd), 0, 1); e.at0 = at;
        ents.push(e); if (it.id) porId[it.id] = e;
      }
    };
    for (let s = 0; s < i; s++) aplica(lec.escenas[s], Infinity, 1);
    aplica(lec.escenas[i], t, D);
    return { ents, porId };
  }

  function empezarEscena(i, auto) {
    I = clamp(i, 0, lec.escenas.length - 1); const es = lec.escenas[I];
    T = 0; hold = 0; fired = new Set(); D = duracion(es); vozMaxT = D * 2.5 + 4;
    habla(es.say); pintarProg();
    if (!play && auto !== false) setPlay(true);
  }
  function setPlay(v) {
    play = v; const b = $("[data-cl=play]"); if (b) b.textContent = v ? "⏸" : "▶";
    if (SS && usaVoz) { try { v ? SS.resume() : SS.pause(); } catch (e) { /* ok */ } }
    if (v) ctxAudio();
  }
  function cargaLeccion(l) {
    lec = l; $("[data-menu]").hidden = true; $("[data-pl]").hidden = false; $("[data-tit]").textContent = l.titulo; $("[data-quiz]").hidden = true; quizAbierto = false;
    ajustar(); ctxAudio(); ponerAmbiente(); play = true; empezarEscena(0); setPlay(true); pintaBotones();
  }
  function finLeccion() {
    play = false; paraVoz(); setPlay(false); fx("silbato"); abrirQuiz();
  }
  function avanza() { if (I >= lec.escenas.length - 1) finLeccion(); else empezarEscena(I + 1); }

  function actualizar(dt) {
    if (!lec || !play || quizAbierto) return;
    const es = lec.escenas[I]; let d = dt;
    if (usaVoz && vozFin && T < D) d *= 4;           // la voz ya acabó: termina rápido de dibujar
    T += d;
    /* sonidos de lo que va apareciendo */
    for (let n = 0; n < es.items.length; n++) {
      const it = es.items[n]; if (fired.has(n)) continue; if (T >= (it.at || 0) * D) {
        fired.add(n);
        if (it.k === "sonido") fx(it.s); else if (it.k === "linea" || it.k === "flecha") fx("tiza"); else if (it.k !== "mueve" && it.k !== "borra") fx("pop");
      }
    }
    if (usaVoz && !vozFin && T > vozMaxT) { vozFin = true; }    // por si el navegador no avisa del final
    if (T >= D && (!usaVoz || vozFin)) { hold += dt; if (hold >= 0.55) avanza(); }
  }

  /* ---------- dibujo ---------- */
  function pizarra() {
    const gm = geom(), w = mundo(I, T);
    g.save(); g.setTransform(K, 0, 0, K, 0, 0);
    const fondo = g.createLinearGradient(0, 0, 0, H); fondo.addColorStop(0, "#1b2340"); fondo.addColorStop(1, "#0b1020"); g.fillStyle = fondo; g.fillRect(0, 0, W, H);
    /* marco de madera + pizarra */
    g.fillStyle = "#8b5a2b"; rr(gm.x - 8, gm.y - 8, gm.w + 16, gm.h + 16, 14); g.fill();
    g.fillStyle = "#6e4420"; rr(gm.x - 8, gm.y + gm.h - 2, gm.w + 16, 10, 4); g.fill();
    const sl = g.createLinearGradient(0, gm.y, 0, gm.y + gm.h); sl.addColorStop(0, "#1e4a35"); sl.addColorStop(1, "#143826"); g.fillStyle = sl; rr(gm.x, gm.y, gm.w, gm.h, 8); g.fill();
    g.save(); rr(gm.x, gm.y, gm.w, gm.h, 8); g.clip();
    g.translate(gm.ox, gm.oy); g.scale(gm.sc, gm.sc);
    g.beginPath(); g.rect(-30, -60, 660, 420); g.clip();
    for (const e of w.ents) dibujaEnt(e);
    g.restore();
    /* profe */
    if (cfg.vista === "profe") {
      let ap = null; const es = lec.escenas[I];
      if (es.señala && w.porId[es.señala]) { const e = w.porId[es.señala]; ap = [gm.ox + e.x * gm.sc, gm.oy + e.y * gm.sc]; }
      dibujaProfe(g, 712, 412, cfg, reloj, hablandoAhora(), ap);
    }
    /* subtítulo */
    const es = lec.escenas[I];
    g.fillStyle = "rgba(4,7,18,.82)"; rr(16, 424, 768, 88, 14); g.fill();
    g.fillStyle = "#fff"; g.font = "700 17px " + FUENTE; g.textAlign = "center"; g.textBaseline = "middle";
    const lin = envuelve(es.say, 740); const mx = Math.min(lin.length, 4), y0 = 468 - (mx - 1) * 12;
    for (let i = 0; i < mx; i++) g.fillText(lin[i], 400, y0 + i * 24);
    g.textBaseline = "alphabetic";
    /* pausa */
    if (!play && !quizAbierto) { g.fillStyle = "rgba(0,0,0,.45)"; rr(gm.x, gm.y, gm.w, gm.h, 8); g.fill(); g.fillStyle = "#fff"; g.beginPath(); const cx = gm.x + gm.w / 2, cy = gm.y + gm.h / 2;
      g.moveTo(cx - 22, cy - 34); g.lineTo(cx + 34, cy); g.lineTo(cx - 22, cy + 34); g.closePath(); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.55)"; g.font = "700 12px system-ui"; g.textAlign = "right"; g.fillText((I + 1) + "/" + lec.escenas.length, gm.x + gm.w - 10, gm.y + 18);
    g.restore();
  }
  function hablandoAhora() { return play && !quizAbierto && ((usaVoz && !vozFin && vozIni) || (!usaVoz && T < D)); }
  function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function envuelve(txt, ancho) {
    g.font = "700 17px " + FUENTE; const pal = txt.split(" "), lin = []; let cur = "";
    for (const p of pal) { const t = cur ? cur + " " + p : p; if (g.measureText(t).width > ancho && cur) { lin.push(cur); cur = p; } else cur = t; }
    if (cur) lin.push(cur); return lin;
  }

  function dibujaEnt(e) {
    const p = e.p, q = ease(p); g.save();
    switch (e.k) {
      case "campo": return campo(e), g.restore();
      case "jug": {
        const s = back(p), r = 12 * Math.max(0.01, s); g.globalAlpha = Math.min(1, p * 2);
        g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.ellipse(e.x + 2, e.y + 4, r, r * .7, 0, 0, 6.3); g.fill();
        g.fillStyle = e.eq === "a" ? "#3b82f6" : e.eq === "r" ? "#ef4444" : "#facc15"; g.beginPath(); g.arc(e.x, e.y, r, 0, 6.3); g.fill();
        g.lineWidth = 2; g.strokeStyle = "#fff"; g.stroke();
        g.fillStyle = e.eq === "p" ? "#3a2c00" : "#fff"; g.font = "800 " + Math.round(11 * s) + "px system-ui"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(e.n || "", e.x, e.y + 1); break;
      }
      case "balon": { const s = back(p), r = 6 * s; g.fillStyle = "#fff"; g.beginPath(); g.arc(e.x, e.y, r, 0, 6.3); g.fill(); g.strokeStyle = "#111"; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = "#111"; g.beginPath(); g.arc(e.x, e.y, r * .38, 0, 6.3); g.fill(); break; }
      case "linea": case "flecha": {
        const x2 = e.x1 + (e.x2 - e.x1) * q, y2 = e.y1 + (e.y2 - e.y1) * q; g.strokeStyle = e.c || "#fff"; g.lineWidth = e.w || 3; g.lineCap = "round";
        if (e.dash) g.setLineDash([9, 7]); g.beginPath(); g.moveTo(e.x1, e.y1); g.lineTo(x2, y2); g.stroke(); g.setLineDash([]);
        if (e.k === "flecha" && p > 0.05) { const a = Math.atan2(e.y2 - e.y1, e.x2 - e.x1); g.fillStyle = e.c || "#fff"; g.beginPath(); g.moveTo(x2, y2); g.lineTo(x2 - 12 * Math.cos(a - .45), y2 - 12 * Math.sin(a - .45)); g.lineTo(x2 - 12 * Math.cos(a + .45), y2 - 12 * Math.sin(a + .45)); g.closePath(); g.fill(); }
        break;
      }
      case "texto": {
        g.globalAlpha = q; g.fillStyle = e.c || "#fff"; g.font = "700 " + (e.sz || 18) + "px " + FUENTE; g.textAlign = e.al === "l" ? "left" : e.al === "r" ? "right" : "center"; g.textBaseline = "middle";
        const ls = String(e.t).split("\n"); ls.forEach(function (l, i) { g.fillText(l, e.x, e.y + (i - (ls.length - 1) / 2) * (e.sz || 18) * 1.2 + (1 - q) * 8); }); break;
      }
      case "caja": {
        const s = back(p); g.translate(e.x + e.w / 2, e.y + e.h / 2); g.scale(Math.max(.01, s), Math.max(.01, s)); g.globalAlpha = Math.min(1, p * 2);
        if (e.fill !== 0) { g.fillStyle = e.c; rr(-e.w / 2, -e.h / 2, e.w, e.h, 12); g.globalAlpha *= .9; g.fill(); g.globalAlpha = Math.min(1, p * 2); }
        g.strokeStyle = "#fff"; g.lineWidth = e.fill === 0 ? 3 : 2; if (e.fill === 0) g.strokeStyle = e.c; rr(-e.w / 2, -e.h / 2, e.w, e.h, 12); g.stroke();
        if (e.t) { g.fillStyle = (e.c === AMc) ? "#2a1c00" : "#fff"; g.font = "800 " + (e.t.indexOf("\n") >= 0 ? 17 : 19) + "px " + FUENTE; g.textAlign = "center"; g.textBaseline = "middle";
          const ls = e.t.split("\n"); ls.forEach(function (l, i) { g.fillText(l, 0, (i - (ls.length - 1) / 2) * 22); }); }
        break;
      }
      case "tarjeta": {
        const s = back(p); g.translate(e.x, e.y - (1 - q) * 30); g.rotate(-0.12 + Math.sin(reloj * 1.6 + e.x) * 0.02); g.scale(Math.max(.01, s), Math.max(.01, s)); g.globalAlpha = Math.min(1, p * 2);
        g.shadowColor = "rgba(0,0,0,.4)"; g.shadowBlur = 10; g.shadowOffsetY = 4; g.fillStyle = e.c === "am" ? "#ffd400" : "#e11d2e"; rr(-30, -43, 60, 86, 8); g.fill(); g.shadowColor = "transparent"; g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 2; g.stroke(); break;
      }
      case "marca": {
        const s = back(p); g.translate(e.x, e.y); g.scale(Math.max(.01, s), Math.max(.01, s)); g.fillStyle = e.ok ? "#22c55e" : "#ef4444"; g.beginPath(); g.arc(0, 0, 15, 0, 6.3); g.fill();
        g.strokeStyle = "#fff"; g.lineWidth = 4; g.lineCap = "round"; g.beginPath();
        if (e.ok) { g.moveTo(-7, 1); g.lineTo(-2, 7); g.lineTo(8, -6); } else { g.moveTo(-6, -6); g.lineTo(6, 6); g.moveTo(6, -6); g.lineTo(-6, 6); } g.stroke(); break;
      }
      case "foco": {
        g.globalAlpha = q; g.strokeStyle = e.c || "#ffd23a"; g.lineWidth = 3; g.setLineDash([6, 5]); g.lineDashOffset = -reloj * 20; g.beginPath(); g.arc(e.x, e.y, (e.r || 18) + Math.sin(reloj * 4) * 2, 0, 6.3); g.stroke(); break;
      }
    }
    g.restore();
  }
  const AMc = "#ffd23a";

  function campo(e) {
    const X = (mx) => e.x0 + e.esc * mx, Y = (my) => e.y0 + e.esc * my, s = e.esc;
    g.globalAlpha = ease(e.p);
    for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? "#2a7a4b" : "#2f8553"; g.fillRect(X(i * 10.5), Y(0), 10.5 * s + 1, 68 * s); }
    g.strokeStyle = "rgba(255,255,255,.88)"; g.lineWidth = 2; g.strokeRect(X(0), Y(0), 105 * s, 68 * s);
    g.beginPath(); g.moveTo(X(52.5), Y(0)); g.lineTo(X(52.5), Y(68)); g.stroke();
    g.beginPath(); g.arc(X(52.5), Y(34), 9.15 * s, 0, 6.3); g.stroke(); g.fillStyle = "#fff"; g.beginPath(); g.arc(X(52.5), Y(34), 2, 0, 6.3); g.fill();
    for (const lado of [0, 1]) {
      const sg = lado ? -1 : 1, x0 = lado ? 105 : 0;
      g.strokeRect(lado ? X(105 - 16.5) : X(0), Y(13.84), 16.5 * s, 40.32 * s); g.strokeRect(lado ? X(105 - 5.5) : X(0), Y(24.84), 5.5 * s, 18.32 * s);
      g.beginPath(); g.arc(X(x0 + sg * 11), Y(34), 2, 0, 6.3); g.fill();
      const a = Math.acos((16.5 - 11) / 9.15); g.beginPath(); g.arc(X(x0 + sg * 11), Y(34), 9.15 * s, lado ? Math.PI - a : -a, lado ? Math.PI + a : a); g.stroke();
      g.lineWidth = 3; g.strokeRect(lado ? X(105) : X(-2.4), Y(30.34), 2.4 * s, 7.32 * s); g.lineWidth = 2;
    }
  }

  /* ---------- el profe (monigote personalizable) ---------- */
  function trazo(c, pts, ancho, col) { c.strokeStyle = col; c.lineWidth = ancho; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); }
  function dibujaProfe(c, cx, F, cf, tt, habla, apunta) {
    c.save(); c.translate(cx, F); const S = cf.vista === "profe" && cf.__prev ? 1 : 1.1; c.scale(S, S); c.lineCap = "round"; c.lineJoin = "round";
    const resp = Math.sin(tt * 2) * 1.6, piel = PIELES[cf.piel] || PIELES[1], ropa = ROPAS[cf.color] || ROPAS[0];
    const trajeC = "#262c3c", panta = cf.ropa === "traje" ? "#262c3c" : cf.ropa === "chandal" ? ropa.d : "#1b2236";
    /* piernas y zapatos */
    if (cf.ropa === "camiseta") { trazo(c, [[-15, -100], [-16, -50], [-18, -8]], 14, piel); trazo(c, [[15, -100], [16, -50], [18, -8]], 14, piel);
      trazo(c, [[-16, -44], [-18, -8]], 15, "#f4f4f4"); trazo(c, [[16, -44], [18, -8]], 15, "#f4f4f4"); } else { trazo(c, [[-15, -104], [-16, -52], [-18, -8]], 16, panta); trazo(c, [[15, -104], [16, -52], [18, -8]], 16, panta); }
    c.fillStyle = "#12141b"; c.beginPath(); c.ellipse(-24, -2, 17, 8, 0, 0, 6.3); c.ellipse(24, -2, 17, 8, 0, 0, 6.3); c.fill();
    if (cf.ropa === "camiseta") { c.fillStyle = "#1b2236"; rr2(c, -34, -112, 68, 30, 10); c.fill(); }
    /* brazos (detrás del torso) */
    const hombroI = [-33, -205 + resp], hombroD = [33, -205 + resp], mang = cf.ropa === "camiseta" ? piel : (cf.ropa === "traje" ? trajeC : ropa.c);
    let manoI, manoD, codoI, codoD;
    if (apunta) {
      const dx = (apunta[0] - cx) / S - hombroI[0], dy = (apunta[1] - F) / S - hombroI[1], L = Math.hypot(dx, dy) || 1, k = Math.min(1, 108 / L), ux = dx / L, uy = dy / L;
      manoI = [hombroI[0] + dx * k, hombroI[1] + dy * k]; if (L < 108) { manoI = [hombroI[0] + ux * 108, hombroI[1] + uy * 108]; }
      codoI = [hombroI[0] + ux * 52 + uy * 8, hombroI[1] + uy * 52 - ux * 8];
    } else { const a = Math.sin(tt * 3) * (habla ? 1 : 0.3); codoI = [-52 + a * 4, -160]; manoI = [-60 + a * 8, -112 - (habla ? 24 : 0) + a * 6]; }
    const b = habla ? Math.sin(tt * 5.2) : Math.sin(tt * 1.4) * 0.3;
    codoD = [54, -158]; manoD = [62 + b * 10, -108 - (habla ? 34 : 0) - b * 12];
    const brazo = (h, co, ma) => { const dd = cf.ropa === "camiseta"; trazo(c, [h, co], 13, mang); trazo(c, [co, ma], 12, dd ? piel : mang); c.fillStyle = piel; c.beginPath(); c.arc(ma[0], ma[1], 8, 0, 6.3); c.fill(); };
    brazo(hombroI, codoI, manoI); brazo(hombroD, codoD, manoD);
    /* torso */
    const tc = cf.ropa === "traje" ? trajeC : ropa.c; c.fillStyle = tc; rr2(c, -36, -216 + resp, 72, 118, 20); c.fill();
    if (cf.ropa === "traje") { c.fillStyle = "#fff"; c.beginPath(); c.moveTo(-11, -216 + resp); c.lineTo(11, -216 + resp); c.lineTo(0, -160 + resp); c.closePath(); c.fill();
      c.fillStyle = ropa.c; c.beginPath(); c.moveTo(-5, -212 + resp); c.lineTo(5, -212 + resp); c.lineTo(8, -160 + resp); c.lineTo(0, -148 + resp); c.lineTo(-8, -160 + resp); c.closePath(); c.fill();
      c.strokeStyle = "rgba(255,255,255,.18)"; c.lineWidth = 2; c.beginPath(); c.moveTo(-11, -216 + resp); c.lineTo(-2, -150 + resp); c.moveTo(11, -216 + resp); c.lineTo(2, -150 + resp); c.stroke(); }
    else if (cf.ropa === "chandal") { c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -216 + resp); c.lineTo(0, -100); c.moveTo(-30, -190 + resp); c.lineTo(-30, -104); c.moveTo(30, -190 + resp); c.lineTo(30, -104); c.stroke(); }
    else { c.fillStyle = "rgba(255,255,255,.9)"; c.font = "900 38px system-ui"; c.textAlign = "center"; c.fillText("10", 0, -140 + resp); }
    if (cf.acc === "silbato") { c.strokeStyle = "#cbd5e1"; c.lineWidth = 2; c.beginPath(); c.moveTo(-9, -224 + resp); c.lineTo(0, -178 + resp); c.lineTo(9, -224 + resp); c.stroke(); c.fillStyle = "#e2e8f0"; c.beginPath(); c.arc(0, -176 + resp, 7, 0, 6.3); c.fill(); }
    /* cabeza */
    c.save(); c.translate(0, -262 + resp * .6); c.rotate(apunta ? -0.07 : Math.sin(tt * 1.1) * 0.03);
    c.fillStyle = piel; c.beginPath(); c.arc(0, 0, 35, 0, 6.3); c.fill();
    const pel = PELOS[cf.pelo] || PELOS[0]; c.fillStyle = pel;
    if (cf.peloE !== "calvo") { c.beginPath(); c.arc(0, -3, 36, Math.PI * 1.04, Math.PI * 1.96); c.lineTo(30, -12); c.quadraticCurveTo(0, -20, -30, -12); c.closePath(); c.fill(); }
    if (cf.peloE === "largo") { rr2(c, -38, -10, 14, 56, 7); c.fill(); rr2(c, 24, -10, 14, 56, 7); c.fill(); }
    if (cf.peloE === "rizos") { for (let i = 0; i < 9; i++) { const a = Math.PI * 1.05 + i * 0.12 * Math.PI; c.beginPath(); c.arc(Math.cos(a) * 33, Math.sin(a) * 33 - 2, 11, 0, 6.3); c.fill(); } }
    const ojo = (Math.floor(tt * 1.0) % 4 === 3 && (tt * 10) % 10 < 1.2) ? 0.5 : 4.2;
    c.fillStyle = "#1b1b1b"; c.beginPath(); c.ellipse(-13, 2, 4, ojo, 0, 0, 6.3); c.ellipse(13, 2, 4, ojo, 0, 0, 6.3); c.fill();
    c.strokeStyle = pel === "#d3342f" || cf.peloE === "calvo" ? "#4a3322" : pel; c.lineWidth = 3; c.beginPath(); c.moveTo(-19, -8); c.lineTo(-8, -10); c.moveTo(8, -10); c.lineTo(19, -8); c.stroke();
    if (habla) { const ab = 2 + 8 * Math.abs(Math.sin(tt * 13)); c.fillStyle = "#6b1c1c"; c.beginPath(); c.ellipse(0, 19, 9, ab, 0, 0, 6.3); c.fill(); }
    else { c.strokeStyle = "#6b1c1c"; c.lineWidth = 3; c.beginPath(); c.arc(0, 12, 10, 0.2, Math.PI - 0.2); c.stroke(); }
    if (cf.acc === "gafas") { c.strokeStyle = "#111"; c.lineWidth = 3; c.beginPath(); c.arc(-13, 2, 11, 0, 6.3); c.moveTo(24, 2); c.arc(13, 2, 11, 0, 6.3); c.moveTo(-2, 2); c.lineTo(2, 2); c.stroke(); }
    if (cf.acc === "gorra") { c.fillStyle = ropa.c; c.beginPath(); c.arc(0, -6, 37, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill(); c.beginPath(); c.ellipse(24, -10, 26, 6, -0.05, 0, 6.3); c.fill(); }
    c.restore(); c.restore();
  }
  function rr2(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  /* ---------- interfaz ---------- */
  function ajustar() {
    if (!lec) return; const r = raiz.getBoundingClientRect(), cab = 64, ctl = 120;
    const aw = Math.max(200, r.width - 16), ah = Math.max(160, r.height - cab - ctl), k = Math.min(aw / W, ah / H);
    cv.style.width = Math.floor(W * k) + "px"; cv.style.height = Math.floor(H * k) + "px";
  }
  function pintarProg() {
    if (!lec) return; const box = $("[data-prog]"); let h = "";
    for (let i = 0; i < lec.escenas.length; i++) h += '<button type="button" class="cl-pt' + (i === I ? " on" : i < I ? " ya" : "") + '" data-esc="' + i + '" aria-label="Escena ' + (i + 1) + '"></button>';
    box.innerHTML = h;
  }
  function pintaBotones() {
    $("[data-cl=vel]").textContent = cfg.vel + "×"; $("[data-cl=voz]").textContent = cfg.vozOn ? "🗣 Voz" : "🔇 Sin voz";
    $("[data-cl=amb]").textContent = cfg.amb === "estadio" ? "🔊 Estadio" : cfg.amb === "musica" ? "🎵 Música" : "🔈 Sin fondo";
    $("[data-cl=vista]").textContent = cfg.vista === "profe" ? "🖍 Pizarra" : "🧑‍🏫 Profe";
  }
  function menu() {
    let h = ""; LECCIONES.forEach(function (l, i) {
      h += '<button type="button" class="cl-card" data-leccion="' + i + '"><span class="cl-em">' + l.emoji + '</span><span class="cl-ct"><b>' + l.titulo + '</b><small>' + l.desc + '</small></span><span class="cl-du">' + l.dur + (dat.hechas[l.id] ? ' · ✅' : '') + '</span></button>';
    });
    $("[data-lista]").innerHTML = h;
  }
  menu();

  /* minitest */
  let qi = 0, qok = 0;
  function abrirQuiz() { quizAbierto = true; qi = 0; qok = 0; $("[data-quiz]").hidden = false; $("[data-qr]").textContent = ""; pintaPregunta(); }
  function pintaPregunta() {
    const q = lec.quiz[qi]; $("[data-qk]").textContent = "MINITEST · " + (qi + 1) + "/" + lec.quiz.length; $("[data-qp]").textContent = q.p;
    const ord = q.o.map(function (t, i) { return { t: t, i: i }; }).sort(function () { return Math.random() - .5; });
    $("[data-qo]").innerHTML = ord.map(function (o) { return '<button type="button" class="cl-op" data-op="' + o.i + '">' + o.t + '</button>'; }).join("");
    $("[data-qo]").classList.remove("hecho"); raiz.querySelectorAll("[data-cl=otra],[data-cl=repetir]").forEach(function (b) { b.hidden = true; });
  }
  function respuesta(btn) {
    const q = lec.quiz[qi], bien = +btn.dataset.op === q.c; if ($("[data-qo]").classList.contains("hecho")) return;
    $("[data-qo]").classList.add("hecho"); btn.classList.add(bien ? "ok" : "mal"); if (!bien) raiz.querySelector('[data-op="' + q.c + '"]').classList.add("ok");
    if (bien) qok++; fx(bien ? "bien" : "mal");
    setTimeout(function () {
      if (!vivo) return; qi++;
      if (qi < lec.quiz.length) { pintaPregunta(); return; }
      let msg = "Has acertado " + qok + " de " + lec.quiz.length + ". ";
      if (qok >= 2 && !dat.hechas[lec.id]) { dat.hechas[lec.id] = true; try { api.tiki(); } catch (e) { /* ok */ } msg += "🎁 +1 tikitexto por aprobar la clase."; try { api.victoria(); } catch (e) { /* ok */ } }
      else if (qok >= 2) msg += "¡Aprobada!"; else msg += "Repite la clase y lo clavas.";
      guardarCfg(); $("[data-qp]").textContent = "¡Clase terminada!"; $("[data-qo]").innerHTML = ""; $("[data-qr]").textContent = msg;
      raiz.querySelectorAll("[data-cl=otra],[data-cl=repetir]").forEach(function (b) { b.hidden = false; }); menu();
    }, 900);
  }

  /* panel de personalización */
  function pintaAjustes() {
    const sw = (arr, key, nombre, col) => '<div class="cl-grp"><span>' + nombre + '</span><div class="cl-sws">' + arr.map(function (v, i) { return '<button type="button" class="cl-sw' + (cfg[key] === i ? " on" : "") + '" style="background:' + col(v, i) + '" data-aj="' + key + '" data-v="' + i + '" aria-label="' + nombre + ' ' + (i + 1) + '"></button>'; }).join("") + '</div></div>';
    const ch = (opts, key, nombre) => '<div class="cl-grp"><span>' + nombre + '</span><div class="cl-chs">' + opts.map(function (o) { return '<button type="button" class="cl-ch' + (cfg[key] === o[0] ? " on" : "") + '" data-aj="' + key + '" data-s="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</div></div>';
    const vopts = voces.length ? '<select data-ajv>' + voces.map(function (v) { return '<option value="' + v.voiceURI + '"' + (v.voiceURI === cfg.voz ? " selected" : "") + '>' + v.name + ' (' + v.lang + ')</option>'; }).join("") + '</select>' : '<small class="cl-aviso">Tu navegador no tiene voces en español: la clase irá con subtítulos.</small>';
    $("[data-ajs]").innerHTML = sw(PIELES, "piel", "Piel", function (v) { return v; }) + ch([["corto", "Corto"], ["largo", "Largo"], ["rizos", "Rizos"], ["calvo", "Calvo"]], "peloE", "Pelo") +
      sw(PELOS, "pelo", "Color de pelo", function (v) { return v; }) + ch([["traje", "Traje"], ["chandal", "Chándal"], ["camiseta", "Camiseta"]], "ropa", "Ropa") +
      sw(ROPAS, "color", "Color de ropa", function (v) { return v.c; }) + ch([["ninguno", "Nada"], ["gafas", "Gafas"], ["gorra", "Gorra"], ["silbato", "Silbato"]], "acc", "Accesorio") +
      '<div class="cl-grp"><span>Voz</span>' + vopts + '</div><div class="cl-grp"><span>Tono de voz</span><input type="range" min="0.6" max="1.6" step="0.1" value="' + cfg.tono + '" data-ajt></div>';
  }
  let prevT = 0, prevRaf = 0;
  function bucleprev() {
    const p = $("[data-prev]"); if (!p || $("[data-aj]").hidden || !vivo) return; const c = p.getContext("2d"); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 220, 300);
    const fo = c.createLinearGradient(0, 0, 0, 300); fo.addColorStop(0, "#26335e"); fo.addColorStop(1, "#111a36"); c.fillStyle = fo; c.fillRect(0, 0, 220, 300);
    prevT += 0.016; const c2 = Object.assign({}, cfg, { __prev: true }); c.save(); c.scale(0.86, 0.86); dibujaProfe(c, 128, 345, c2, prevT, (prevT % 4) < 1.2, null); c.restore();
    prevRaf = requestAnimationFrame(bucleprev);
  }

  /* ---------- eventos ---------- */
  function salirLeccion() { play = false; paraVoz(); pararAmbiente(); lec = null; $("[data-pl]").hidden = true; $("[data-menu]").hidden = false; $("[data-quiz]").hidden = true; quizAbierto = false; $("[data-tit]").textContent = "Clases de fútbol"; menu(); }
  function cerrar() {
    vivo = false; paraVoz(); pararAmbiente(); cancelAnimationFrame(raf); cancelAnimationFrame(prevRaf);
    window.removeEventListener("resize", ajustar); document.removeEventListener("keydown", tecla, true);
    try { guardarCfg(); } catch (e) { /* ok */ } if (api.salir) api.salir();
  }
  raiz.addEventListener("click", function (ev) {
    const o = ev.target.closest ? ev.target : null; if (!o) return;
    const lc = o.closest("[data-leccion]"); if (lc) { cargaLeccion(LECCIONES[+lc.dataset.leccion]); return; }
    const pt = o.closest("[data-esc]"); if (pt && lec) { empezarEscena(+pt.dataset.esc); return; }
    const op = o.closest("[data-op]"); if (op) { respuesta(op); return; }
    const aj = o.closest("[data-aj]"); if (aj && aj.dataset.aj && aj.dataset.aj !== "") {
      if (aj.dataset.v !== undefined) cfg[aj.dataset.aj] = +aj.dataset.v; else cfg[aj.dataset.aj] = aj.dataset.s; pintaAjustes(); return;
    }
    if (o.closest("[data-cv]") && lec && !quizAbierto) { setPlay(!play); return; }
    const a = o.closest("[data-cl]"); if (!a) return; const x = a.dataset.cl;
    if (x === "salir") { if (lec) salirLeccion(); else cerrar(); }
    else if (x === "play") setPlay(!play);
    else if (x === "ant") empezarEscena(I > 0 && T < 2 ? I - 1 : I);
    else if (x === "sig") avanza();
    else if (x === "vel") { cfg.vel = VELS[(VELS.indexOf(cfg.vel) + 1) % VELS.length]; pintaBotones(); guardarCfg(); if (lec) empezarEscena(I); }
    else if (x === "voz") { cfg.vozOn = !cfg.vozOn; pintaBotones(); guardarCfg(); if (lec) empezarEscena(I); }
    else if (x === "amb") { cfg.amb = cfg.amb === "estadio" ? "musica" : cfg.amb === "musica" ? "off" : "estadio"; pintaBotones(); guardarCfg(); ponerAmbiente(); }
    else if (x === "vista") { cfg.vista = cfg.vista === "profe" ? "pizarra" : "profe"; pintaBotones(); guardarCfg(); }
    else if (x === "profe") { if (lec) setPlay(false); cargaVoces(); pintaAjustes(); $("[data-aj]").hidden = false; cancelAnimationFrame(prevRaf); bucleprev(); }
    else if (x === "ajok") { $("[data-aj]").hidden = true; cancelAnimationFrame(prevRaf); guardarCfg(); }
    else if (x === "probar") { ctxAudio(); habla("Hola, soy tu profe de Tikitexto. Hoy vamos a aprender fútbol."); }
    else if (x === "otra") salirLeccion();
    else if (x === "repetir") { $("[data-quiz]").hidden = true; quizAbierto = false; play = true; empezarEscena(0); setPlay(true); }
  });
  raiz.addEventListener("change", function (ev) { if (ev.target.matches && ev.target.matches("[data-ajv]")) { cfg.voz = ev.target.value; } });
  raiz.addEventListener("input", function (ev) { if (ev.target.matches && ev.target.matches("[data-ajt]")) { cfg.tono = +ev.target.value; } });
  function tecla(ev) {
    if (!vivo) return;
    if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); if (!$("[data-aj]").hidden) { $("[data-aj]").hidden = true; cancelAnimationFrame(prevRaf); } else if (lec) salirLeccion(); else cerrar(); return; }
    if (!lec || quizAbierto || !$("[data-aj]").hidden) return;
    if (ev.code === "Space") { ev.preventDefault(); setPlay(!play); }
    else if (ev.key === "ArrowRight") avanza(); else if (ev.key === "ArrowLeft") empezarEscena(Math.max(0, I - 1));
  }
  document.addEventListener("keydown", tecla, true);
  window.addEventListener("resize", ajustar);
  pintaBotones();

  let raf = 0;
  function bucle(ts) {
    if (!vivo) return; const dt = Math.min(0.1, (ts - (ultimo || ts)) / 1000); ultimo = ts; reloj += dt;
    if (lec) { actualizar(dt); pizarra(); }
    raf = requestAnimationFrame(bucle);
  }
  raf = requestAnimationFrame(bucle);
  return { cerrar: cerrar, cargaLeccion: cargaLeccion, LECCIONES: LECCIONES, S: function () { return { I: I, T: T, D: D, play: play, usaVoz: usaVoz, lec: lec && lec.id, quiz: quizAbierto }; }, avanza: avanza, empezarEscena: empezarEscena, respuesta: respuesta, mundo: function () { return mundo(I, T); }, cfg: cfg };
}
