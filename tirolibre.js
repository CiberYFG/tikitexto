/* TIROS LIBRES 3D · TIKITEXTO (15-nov-2026)
   Módulo propio (carga diferida). Reutiliza el estadio, los cuerpos y el sonido de penaltis.js (three.js en lib/, MIT).
   Cinco faltas desde posiciones distintas: apunta tocando la portería, da efecto con el deslizador y para la barra de fuerza
   en el verde. La barrera salta, el portero lee el tiro y el balón curva de verdad (física propia con arrastre y efecto Magnus).
   Todo se dibuja con código: sin escudos, fotos, logos ni marcas. */
import * as THREE from "./lib/three.module.min.js";
import { crearEscena, crearAudio, POSES, precargar as precargarCuerpos, planPortero, estadoPortero, tocaPortero } from "./penaltis.js";

export function precargar() { return precargarCuerpos(); }

const GW = 7.32, GH = 2.44, HW = GW / 2, RB = 0.11, DEPTH = 2.0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const tri = (x) => Math.abs((((x % 2) + 2) % 2) - 1);
const gauss = () => { let s = 0; for (let i = 0; i < 4; i++) s += Math.random(); return (s - 2) * 1.73; };

/* Física del balón: gravedad, rozamiento con el aire y efecto (Magnus) alrededor del eje vertical */
const G = 9.81, KD = 0.0125, KM = 0.26, VERDE = [0.73, 0.89], MAX_TIROS = 5;
function paso(p, v, c, h) {
  const sp = Math.hypot(v.x, v.y, v.z);
  v.x += (-KD * sp * v.x - KM * c * v.z) * h; v.z += (-KD * sp * v.z + KM * c * v.x) * h; v.y += (-G - KD * sp * v.y) * h;
  p.x += v.x * h; p.y += v.y * h; p.z += v.z * h;
  if (p.y < RB && v.y < 0) {
    const imp = -v.y; p.y = RB;
    if (imp > 1.2) { v.y = imp * 0.6; v.x *= 0.92; v.z *= 0.92; } else { v.y = 0; const f = Math.pow(0.5, h); v.x *= f; v.z *= f; }
  }
}
/* Vuela sin obstáculos hasta cruzar la línea de gol (z = 0): devuelve el cruce y, si se pide, la trayectoria */
function vuela(p0, v0, c, trazo) {
  const p = p0.clone(), v = v0.clone(), pts = []; let t = 0;
  while (t < 4) {
    const pz = p.z; paso(p, v, c, 1 / 120); t += 1 / 120;
    if (trazo && Math.round(t * 120) % 4 === 0) pts.push(p.clone());
    if (p.z <= 0 && pz > 0) { const k = pz / (pz - p.z); return { x: lerp(p.x - v.x / 120, p.x, k), y: lerp(p.y - v.y / 120, p.y, k), t: t, pts: pts, v: v.clone() }; }
    if (p.z > 60) break;
  }
  return { x: p.x, y: p.y, t: t, pts: pts, v: v.clone(), fallo: true };
}
/* Velocidad inicial para que, con ese efecto y esa velocidad, el balón cruce la línea en (tx, ty) */
function resolver(p0, tx, ty, vel, c) {
  const dx = tx - p0.x, dz = -p0.z, T0 = Math.hypot(dx, dz) / vel * 1.08, v = new THREE.Vector3(dx / T0, (ty - p0.y) / T0 + 0.5 * G * T0, dz / T0);
  for (let i = 0; i < 9; i++) {
    const r = vuela(p0, v, c, false); if (r.fallo) break;
    const ex = tx - r.x, ey = ty - r.y; if (Math.abs(ex) < 0.01 && Math.abs(ey) < 0.01) break;
    v.x += ex / r.t * 0.9; v.y += ey / r.t * 0.9;
  }
  return v;
}

const DIF = {
  facil: { rt: 0.36, sig: 1.5, reach: 0.78, salta: 0, necesita: 2, verde: 1.0 },
  normal: { rt: 0.24, sig: 0.95, reach: 0.86, salta: 0.5, necesita: 3, verde: 0.8 },
  dificil: { rt: 0.15, sig: 0.55, reach: 0.95, salta: 1, necesita: 3, verde: 0.6 },
};
const RUN = 0.62, GOLPE = 0.55, CONTACTO = GOLPE * 0.55, DUR_PARADA = 0.42;

const PLANTILLA = `
<canvas class="tl-cv"></canvas><div class="tl-vineta"></div>
<div class="tl-cab">
  <button type="button" class="tl-btn" data-tl="salir" aria-label="Salir">✕</button>
  <div class="tl-marcador"><b data-tl-goles data-no-t>0</b><span class="tl-bolas" data-bolas></span><small data-tl-dist data-no-t>–</small></div>
  <button type="button" class="tl-btn" data-tl="fs" aria-label="Pantalla completa">⛶</button>
</div>
<div class="tl-aviso" data-aviso data-no-t></div>
<div class="tl-pie" data-pie hidden>
  <label class="tl-efecto"><span>⟲ Efecto ⟳</span><input type="range" min="-100" max="100" value="0" step="1" data-efecto aria-label="Efecto"></label>
  <button type="button" class="tl-chuta" data-tl="chuta"><span data-chuta-txt>¡CHUTAR!</span></button>
  <div class="tl-fuerza" data-fuerza hidden><span>Fuerza</span><div class="tl-barra"><u data-verde></u><i data-marca></i></div></div>
</div>
<p class="tl-pista" data-pista></p>
<div class="tl-menu" data-menu>
  <div class="tl-caja">
    <p class="tl-kicker">Videojuego 3D</p>
    <h2>TIROS LIBRES</h2>
    <p class="tl-sub">Cinco faltas, una barrera y un portero que te lee. Haz que el balón dé la vuelta a la barrera.</p>
    <div class="tl-difs" data-difs><button type="button" data-dif="facil">Fácil</button><button type="button" data-dif="normal">Normal</button><button type="button" data-dif="dificil">Difícil</button></div>
    <ul class="tl-como">
      <li><b>1</b><span>Toca la portería para apuntar. Verás la trayectoria en puntos.</span></li>
      <li><b>2</b><span>Mueve el deslizador para dar efecto y rodear la barrera.</span></li>
      <li><b>3</b><span>Pulsa ¡CHUTAR! y vuelve a tocar para parar la barra de fuerza en el verde.</span></li>
    </ul>
    <p class="tl-rec" data-rec data-no-t></p>
    <button type="button" class="tl-jugar" data-tl="jugar">¡Jugar!</button>
  </div>
</div>
<div class="tl-fin" data-fin hidden>
  <div class="tl-caja">
    <h2 data-fin-t></h2>
    <p class="tl-fin-m" data-fin-m data-no-t></p>
    <p class="tl-fin-tiki" data-fin-tiki hidden>⚡ +1 tikitexto</p>
    <div class="tl-fin-b"><button type="button" class="tl-jugar" data-tl="jugar">Jugar otra vez</button><button type="button" class="tl-sec" data-tl="salir">Salir</button></div>
  </div>
</div>
<div class="tl-gira" data-gira><div><span class="tl-gira__mov">📱</span><b>Gira el móvil</b><small>Este modo solo funciona en horizontal.</small></div></div>
<div class="tl-sin" data-sin hidden><div><b>No se puede mostrar el 3D</b><small>Tu dispositivo o navegador no admite gráficos 3D (WebGL).</small><button type="button" class="tl-sec" data-tl="salir">Salir</button></div></div>
`;

export function abrir(api, raiz) {
  const t = (s) => (api.t ? api.t(s) : s);
  const movil = (window.matchMedia && matchMedia("(pointer: coarse)").matches) || /Android|iPhone|iPad/i.test(navigator.userAgent);
  const reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  raiz.innerHTML = PLANTILLA;
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  const cv = $(".tl-cv");
  let E = null;
  try { E = crearEscena(cv, movil, (api.nombre ? api.nombre() : "") || ("INVITADO " + (api.invitado ? api.invitado() : "")).trim()); } catch (e) { E = null; }
  if (!E) { $("[data-sin]").hidden = false; $("[data-menu]").hidden = true; $("[data-gira]").style.display = "none"; }
  const au = crearAudio(api);
  const datos = () => { const d = api.datos(); ["gan", "per", "gol", "mejor", "tandas", "golazos"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); if (!d.dif) d.dif = "normal"; return d; };

  const S = { fase: "menu", dif: datos().dif, res: [], n: 0, t: 0, tFase: 0, ciclo: 0, activo: true, ball: null, plan: null, shot: null, pos: null, aim: { x: 0, y: 1.3 }, efecto: 0, meter: 0, ph: 0, muro: [], cel: null, tikis: 0, orbita: 0, jump: 0, shake: 0 };
  const camP = new THREE.Vector3(), mira = new THREE.Vector3(), camIni = { v: false };
  let raf = 0, ultimo = 0, vivo = true, tFlash = 0, fpsAcum = 0, fpsN = 0, escala = 1, hAviso = 0;

  /* ── Interfaz ── */
  function aviso(txt, cls, ms) {
    const a = $("[data-aviso]"); a.className = "tl-aviso tl-aviso--" + (cls || "n"); a.textContent = t(txt); void a.offsetWidth; a.classList.add("tl-aviso--on");
    clearTimeout(hAviso); hAviso = setTimeout(function () { a.classList.remove("tl-aviso--on"); }, ms || 1700);
  }
  function pista(txt) { $("[data-pista]").textContent = txt ? t(txt) : ""; }
  function pintaMarcador() {
    let h = ""; for (let i = 0; i < MAX_TIROS; i++) h += '<s class="' + (i < S.res.length ? (S.res[i] ? "ok" : "ko") : i === S.res.length ? "ahora" : "") + '"></s>';
    $("[data-bolas]").innerHTML = h; $("[data-tl-goles]").textContent = String(S.res.filter(Boolean).length);
  }
  function pintaRecord() {
    const d = datos();
    $("[data-rec]").textContent = d.gan || d.per ? "🏆 " + d.gan + " · " + d.per + " · ⚽ " + d.gol : "";
    $$("[data-dif]").forEach((b) => b.classList.toggle("on", b.dataset.dif === S.dif));
  }
  $("[data-verde]").style.left = VERDE[0] * 100 + "%"; $("[data-verde]").style.width = (VERDE[1] - VERDE[0]) * 100 + "%";

  /* ── Colocación de cada falta ── */
  function elegirPosiciones() {
    const lados = [-1, 1, -1, 1, 0].sort(() => Math.random() - 0.5), out = [];
    for (let i = 0; i < MAX_TIROS; i++) {
      const d = rnd(17, 25.5), ang = lados[i] === 0 ? rnd(-0.08, 0.08) : lados[i] * rnd(0.2, 0.62);
      out.push({ x: clamp(Math.sin(ang) * d, -13, 13), z: Math.max(15, Math.cos(ang) * d) });
    }
    return out;
  }
  function colocar() {
    const { yo, cpu, porCpu, balon, espera, arbitro } = E, P = S.pos[S.n];
    S.dist = Math.hypot(P.x, P.z);
    yo.raiz.visible = true; cpu.raiz.visible = true; porCpu.raiz.visible = true; E.porYo.raiz.visible = false;
    [yo, cpu, porCpu].concat(espera).forEach((f) => { POSES.base(f); f.raiz.rotation.set(0, 0, 0); f.raiz.position.y = 0; });
    balon.position.set(P.x, RB, P.z); balon.rotation.set(0, 0, 0);
    S.ball = null; S.shot = null; S.cel = null; S.plan = null; S.efecto = 0; $("[data-efecto]").value = 0; S.aim = { x: 0, y: 1.3 };
    /* barrera a 9,15 m, cubriendo el lado del palo cercano */
    const lado = P.x >= 0 ? 1 : -1, tx = lado * 1.7, dx = tx - P.x, dz = -P.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
    const cx = P.x + ux * 9.15, cz = P.z + uz * 9.15, px = -uz, pz = ux, n = S.dist < 19.5 ? 3 : S.dist < 23 ? 4 : 5;
    const gente = [cpu].concat(espera); S.muro = [];
    espera.forEach((f, i) => { f.raiz.position.set(i < 3 ? -7 + i * 1.7 : 6 + (i - 3) * 1.7, 0, 30); f.raiz.rotation.y = Math.PI; });
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * 0.52, f = gente[i], x = cx + px * o, z = cz + pz * o;
      f.raiz.position.set(x, 0, z); f.raiz.rotation.y = Math.atan2(P.x - x, P.z - z); S.muro.push({ f: f, x: x, z: z });
    }
    if (n < 6) cpu.raiz.visible = true;
    const back = new THREE.Vector3(P.x, 0, P.z).normalize(), side = new THREE.Vector3(-back.z, 0, back.x);
    S.run = { a: new THREE.Vector3(P.x, 0, P.z).addScaledVector(back, 3.6).addScaledVector(side, 1.5), b: new THREE.Vector3(P.x, 0, P.z).addScaledVector(back, 0.55).addScaledVector(side, 0.2), ang: Math.atan2(-P.x, -P.z) };
    yo.raiz.position.copy(S.run.a); yo.raiz.rotation.y = S.run.ang;
    porCpu.raiz.position.set(0, 0, 0.2); porCpu.raiz.rotation.set(0, 0, 0);
    arbitro.raiz.position.set(P.x - 4, 0, P.z - 3); arbitro.raiz.rotation.y = Math.PI * 0.9;
    E.retic.visible = true; camIni.v = false; S.jump = 0;
  }
  function preparar() {
    colocar(); pintaMarcador(); S.fase = "apuntar"; S.tFase = S.t;
    $("[data-pie]").hidden = false; $("[data-fuerza]").hidden = true; $("[data-chuta-txt]").textContent = t("¡CHUTAR!");
    $("[data-tl-dist]").textContent = Math.round(S.dist) + " m";
    pista(movil ? "Toca la portería para apuntar" : "Haz clic en la portería para apuntar"); au.pitido();
  }
  function empezar() {
    S.res = []; S.n = 0; S.tikis = 0; S.pos = elegirPosiciones();
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; S.cel = null; au.iniciar(); au.ambiente(0.4);
    S.n = 0; preparar();
  }

  /* ── Tiro ── */
  function velocidadYTiro(m) {
    const D = DIF[S.dif], P = S.pos[S.n], p0 = new THREE.Vector3(P.x, RB, P.z);
    const e = Math.max(0, Math.abs(m - (VERDE[0] + VERDE[1]) / 2) - 0.07) * D.verde * 1.1 + (m < 0.12 ? 0.25 : 0);
    const ang = Math.random() * 6.283, r = Math.sqrt(Math.random()) * (0.04 + e * 3.2);
    let tx = S.aim.x + Math.cos(ang) * r, ty = S.aim.y + Math.sin(ang) * r * 0.8; if (m > VERDE[1]) ty += (m - VERDE[1]) * 4.5;
    const vel = 15 + 20 * clamp(m, 0, 1);
    return { p0: p0, tx: tx, ty: Math.max(ty, 0.12), vel: vel, v: resolver(p0, tx, Math.max(ty, 0.12), vel, S.efecto) };
  }
  function lanzar(m) {
    if (S.fase !== "apuntar" && S.fase !== "potencia") return;
    const D = DIF[S.dif], tiro = velocidadYTiro(m), cr = vuela(tiro.p0, tiro.v, S.efecto, false);
    S.shot = { v: tiro.v, p0: tiro.p0, c: S.efecto, m: m, cr: cr, tx: tiro.tx, ty: tiro.ty };
    /* el portero lee el tiro con retraso y con más error cuanto más efecto lleva */
    const sig = D.sig * (1 + Math.abs(S.efecto) * 0.8), px = cr.x + gauss() * sig, py = cr.y + gauss() * sig * 0.6;
    /* el portero se queda dentro de la portería: el plan solo fija a dónde se lanza su cuerpo (ver planPortero) */
    S.plan = Object.assign(planPortero(clamp(px, -HW, HW), clamp(py, 0.2, 2.3)), { rt: D.rt, reach: D.reach });
    S.jump = D.salta > 0 && Math.random() < D.salta ? 1 : 0;
    S.fase = "carrera"; S.tFase = S.t; E.retic.visible = false; scene_puntos(false);
    $("[data-pie]").hidden = true; pista(""); au.tension();
  }
  function contacto() {
    const sh = S.shot; S.ball = { p: E.balon.position, v: sh.v.clone(), t: 0, c: sh.c, listo: false, fin: false };
    S.fase = "vuelo"; S.tFase = S.t; au.golpe(sh.m);
  }
  function termina(cel, txt, cls) {
    if (S.ball.fin) return; S.ball.fin = true; S.cel = cel; S.res.push(cel === "gol"); pintaMarcador();
    aviso(txt, cls, 1800); S.tFase = S.t; S.fase = "resultado";
    if (cel === "gol") { au.rugido(true); S.shake = 0.5; } else { au.suspiro(); }
    const d = datos(); if (cel === "gol") d.gol++;
  }
  /* un paso de simulación con obstáculos: barrera, palos, portero */
  function simula(h) {
    const B = S.ball, p = B.p, v = B.v, sh = S.shot, D = DIF[S.dif]; const pz = p.z;
    paso(p, v, B.c, h); B.t += h;
    if (!B.fin) {
      /* barrera */
      const tq = B.t - (S.jump ? 0.12 : 99), salto = S.jump && tq > 0 && tq < 0.6 ? 0.55 * Math.sin(Math.PI * tq / 0.6) : 0;
      for (let i = 0; i < S.muro.length; i++) {
        const w = S.muro[i], dx = p.x - w.x, dz = p.z - w.z, d = Math.hypot(dx, dz);
        if (d < 0.27 + RB && p.y < 1.84 + salto) {
          const nx = dx / (d || 1), nz = dz / (d || 1), vn = v.x * nx + v.z * nz;
          if (vn < 0) { v.x -= 1.6 * vn * nx; v.z -= 1.6 * vn * nz; v.y = Math.abs(v.y) * 0.3 + 2.2; v.x *= 0.5; v.z *= 0.5; au.parada(); termina("barrera", "¡BARRERA!", "mal"); S.shake = 0.3; return; }
        }
      }
    }
    if (pz > 0 && p.z <= 0 && !B.fin) {
      const k = pz / (pz - p.z), x = lerp(p.x - v.x * h, p.x, k), y = lerp(p.y - v.y * h, p.y, k);
      const dpx = Math.abs(Math.abs(x) - HW);
      if ((y < GH + 0.12 && dpx < RB + 0.06) || (Math.abs(y - GH) < RB + 0.06 && Math.abs(x) < HW + 0.1)) {
        p.z = 0.05; v.z = Math.abs(v.z) * 0.45; v.x = (Math.abs(y - GH) < 0.17 ? (Math.random() - 0.5) * 3 : -Math.sign(x) * Math.abs(v.x) * 0.5 + (Math.random() - 0.5)); v.y = Math.abs(v.y) * 0.5 + 1.5;
        au.poste(); S.shake = 0.5; termina("palo", "¡AL PALO!", "par"); return;
      }
      if (Math.abs(x) < HW && y < GH) {
        /* parada solo si el balón toca el cuerpo del portero (piernas, torso, cabeza o brazos) en ese instante */
        const es = estadoPortero(S.plan, (B.t - S.plan.rt) / DUR_PARADA);
        if (tocaPortero(es, x, y, 0.22 + S.plan.reach * 0.3 + RB)) {
          p.z = 0.12; v.set((Math.random() - 0.5) * 7, 3 + Math.random() * 2, 5 + Math.random() * 3); au.parada(); S.shake = 0.35; termina("parada", "¡PARADA!", "par"); return;
        }
        E.red.x = x; E.red.y = y; E.red.t = 0; E.red.a = clamp(Math.hypot(v.x, v.z) / 14, 0.3, 1.6); au.red();
        const esq = Math.abs(x) > HW - 0.9 && (y > GH - 0.8 || y < 0.6);
        if (esq) { const d = datos(); d.golazos++; }
        termina("gol", esq ? "¡GOLAZO!" : "¡GOL!", "gol"); return;
      }
      termina("fuera", "¡FUERA!", "mal");
    }
    if ((B.t > 3.6 || (B.t > 0.8 && p.y <= RB + 0.01 && Math.hypot(v.x, v.z) < 0.6)) && !B.fin) termina("fuera", "¡FUERA!", "mal");
  }
  function resolverFalta() {
    if (S.res.length >= MAX_TIROS) { terminarSerie(); return; }
    S.n++; preparar();
  }
  function terminarSerie() {
    const d = datos(), goles = S.res.filter(Boolean).length, necesita = DIF[S.dif].necesita, gana = goles >= necesita;
    S.fase = "fin"; d.tandas++; d.dif = S.dif; if (goles > d.mejor) d.mejor = goles;
    if (gana) { d.gan++; try { api.tiki(); } catch (e) { /* opcional */ } S.tikis = 1; au.rugido(true); try { api.victoria(); } catch (e) { /* opcional */ } } else { d.per++; au.suspiro(); }
    try { api.guardar(); } catch (e) { /* opcional */ }
    $("[data-fin-t]").textContent = t(gana ? "¡Serie superada!" : "Serie fallida");
    $("[data-fin-m]").textContent = goles + " / " + MAX_TIROS + " ⚽ · " + t("Necesitas") + " " + necesita;
    $("[data-fin-tiki]").hidden = !S.tikis; $("[data-fin]").hidden = false; pintaRecord();
  }

  /* ── Puntos de trayectoria (ayuda visual) ── */
  const geo = new THREE.BufferGeometry(), NP = 48;
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NP * 3), 3));
  const puntos = E ? new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffe94a, size: 0.22, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false, fog: false })) : null;
  if (E) { puntos.frustumCulled = false; E.scene.add(puntos); }
  function scene_puntos(on) { if (puntos) puntos.visible = on; }
  function trazo() {
    if (!E || !puntos) return;
    const P = S.pos[S.n], p0 = new THREE.Vector3(P.x, RB, P.z), v = resolver(p0, S.aim.x, S.aim.y, 31, S.efecto), r = vuela(p0, v, S.efecto, true);
    const a = geo.attributes.position.array; let n = Math.min(NP, r.pts.length);
    for (let i = 0; i < NP; i++) { const q = r.pts[Math.min(i, r.pts.length - 1)] || p0; a[i * 3] = q.x; a[i * 3 + 1] = q.y; a[i * 3 + 2] = q.z; }
    geo.attributes.position.needsUpdate = true; geo.setDrawRange(0, n); puntos.visible = true;
  }

  /* ── Entrada ── */
  const rayo = new THREE.Raycaster(), ndc = new THREE.Vector2(), plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), pt = new THREE.Vector3();
  function apunteDe(e) {
    const r = E.renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    E.camara.updateMatrixWorld(); rayo.setFromCamera(ndc, E.camara);
    if (!rayo.ray.intersectPlane(plano, pt)) return null;
    return { x: clamp(pt.x, -HW - 0.6, HW + 0.6), y: clamp(pt.y, 0.12, GH + 0.6) };
  }
  function accion() {
    if (S.fase === "apuntar") { S.fase = "potencia"; S.tFase = S.t; S.ph = Math.random() * 2; $("[data-fuerza]").hidden = false; $("[data-chuta-txt]").textContent = t("¡YA!"); au.clic(); pista("Toca para parar la barra en el verde"); }
    else if (S.fase === "potencia") { au.clic(); lanzar(S.meter); }
  }
  raiz.addEventListener("pointerdown", function (e) {
    au.iniciar();
    if (e.target.closest && e.target.closest("[data-tl], [data-menu], [data-fin], .tl-cab, .tl-efecto, [data-dif]")) return;
    if (S.fase === "apuntar") { const a = apunteDe(e); if (a) { S.aim = a; au.clic(); } }
    else if (S.fase === "potencia") accion();
  });
  raiz.addEventListener("click", function (e) {
    const b = e.target.closest ? e.target.closest("[data-tl], [data-dif]") : null; if (!b) return;
    if (b.dataset.dif) { S.dif = b.dataset.dif; pintaRecord(); return; }
    const a = b.dataset.tl;
    if (a === "salir") cerrar(); else if (a === "jugar") empezar(); else if (a === "chuta") accion();
    else if (a === "fs") { try { if (document.fullscreenElement) document.exitFullscreen(); else if (raiz.requestFullscreen) raiz.requestFullscreen(); } catch (er) { /* opcional */ } }
  });
  $("[data-efecto]").addEventListener("input", function (e) { S.efecto = +e.target.value / 100; });
  const onKey = (e) => {
    if (e.key === " " || e.key === "Enter") { if (!$("[data-menu]").hidden || !$("[data-fin]").hidden) return; e.preventDefault(); if (!e.repeat) accion(); }
    else if (e.key === "ArrowLeft" && (S.fase === "apuntar" || S.fase === "potencia")) { S.efecto = clamp(S.efecto - 0.1, -1, 1); $("[data-efecto]").value = Math.round(S.efecto * 100); }
    else if (e.key === "ArrowRight" && (S.fase === "apuntar" || S.fase === "potencia")) { S.efecto = clamp(S.efecto + 0.1, -1, 1); $("[data-efecto]").value = Math.round(S.efecto * 100); }
  };
  window.addEventListener("keydown", onKey);
  function tamano() { const w = raiz.clientWidth || window.innerWidth, h = raiz.clientHeight || window.innerHeight; if (!E) return; E.renderer.setSize(w, h, false); E.camara.aspect = w / h; E.camara.updateProjectionMatrix(); }
  const hRes = () => tamano(); window.addEventListener("resize", hRes);
  const vertical = () => movil && window.innerHeight > window.innerWidth;
  try { if (movil && screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(function () { /* opcional */ }); } catch (e) { /* opcional */ }

  /* ── Figuras y cámara ── */
  function figuraPortero(f, tt, T) {
    const pl = S.plan; if (!f) return;
    const p = pl ? clamp((tt - pl.rt) / DUR_PARADA, 0, 1) : 0, es = estadoPortero(pl, p);
    f.raiz.position.x = es.x; f.raiz.position.y = es.y; f.raiz.rotation.z = -es.th;
    if (p <= 0.001 || !pl) POSES.quieto(f, T, true); else POSES.parada(f, p, pl.side, pl.alto);
  }
  function ponCamara(dt, T) {
    const c = E.camara; let tp = camP, ml = mira, fov = 42;
    const P = S.pos ? S.pos[Math.min(S.n, MAX_TIROS - 1)] : { x: 0, z: 20 };
    if (S.fase === "menu") {
      S.orbita += dt * 0.12; const a = S.orbita; tp = new THREE.Vector3(Math.sin(a) * 15, 3.4 + Math.sin(a * 0.7) * 0.8, 6 + Math.cos(a) * 12); ml = new THREE.Vector3(0, 1.2, 4); fov = 46;
    } else if (S.fase === "vuelo" && S.ball) {
      const b = S.ball.p, vh = new THREE.Vector3(S.ball.v.x, 0, S.ball.v.z), L = vh.length() || 1; vh.multiplyScalar(1 / L);
      tp = new THREE.Vector3(b.x - vh.x * 5.5, 1.9 + b.y * 0.3, Math.min(b.z - vh.z * 5.5, P.z + 4.5)); if (tp.z < 3.5) tp.z = 3.5;
      ml = new THREE.Vector3(b.x * 0.7, 1.1 + b.y * 0.3, Math.max(0, b.z - 7)); fov = 44;
    } else if (S.fase === "resultado" || S.fase === "fin") {
      tp = new THREE.Vector3(clamp(P.x * 0.35, -5, 5), 1.9, Math.min(P.z * 0.45, 12)); ml = new THREE.Vector3(0, 1.1, 0); fov = 46;
    } else {
      const back = new THREE.Vector3(P.x, 0, P.z).normalize(), a = S.aim || { x: 0, y: 1.2 };
      tp = new THREE.Vector3(P.x + back.x * 3.3, 1.5, P.z + back.z * 3.3); ml = new THREE.Vector3(a.x * 0.8, 1.15, 0); fov = 35;
    }
    if (!camIni.v) { camP.copy(tp); mira.copy(ml); camIni.v = true; }
    const k = 1 - Math.exp(-(S.fase === "vuelo" ? 5 : 3.2) * dt); camP.lerp(tp, k); mira.lerp(ml, k);
    c.position.copy(camP); if (!reducido && S.shake > 0) { c.position.x += (Math.random() - 0.5) * S.shake * 0.25; c.position.y += (Math.random() - 0.5) * S.shake * 0.25; }
    c.lookAt(mira); c.fov = lerp(c.fov, fov, 1 - Math.exp(-4 * dt)); c.updateProjectionMatrix();
  }

  /* ── Bucle ── */
  function bucle(ahora) {
    raf = requestAnimationFrame(bucle);
    if (!vivo || !E) return;
    let dt = Math.min((ahora - ultimo) / 1000, 0.1); ultimo = ahora; if (!(dt > 0)) dt = 0.016;
    const pausa = vertical(); $("[data-gira]").classList.toggle("on", pausa); S.activo = !pausa && !document.hidden; if (pausa) return;
    fpsAcum += dt; fpsN++; if (fpsAcum > 2.5) { const fps = fpsN / fpsAcum; if (fps < 26 && escala > 0.55) { escala -= 0.15; E.renderer.setPixelRatio((movil ? 1.5 : Math.min(window.devicePixelRatio || 1, 2)) * escala); tamano(); } fpsAcum = 0; fpsN = 0; }
    let esc = 1; if (S.fase === "vuelo" && S.ball && !S.ball.fin && S.ball.p.z < 3) esc = 0.55;
    const dtS = dt * esc; S.t += dtS; S.ciclo += dtS * 12; S.shake = Math.max(0, S.shake - dt * 0.9);
    const T = S.t, yo = E.yo, bal = E.balon;
    if (S.fase === "menu") { POSES.quieto(E.porCpu, T, true); POSES.quieto(yo, T, false); }
    if (S.fase === "apuntar" || S.fase === "potencia") {
      POSES.quieto(yo, T, false); POSES.quieto(E.porCpu, T, true);
      E.retic.position.set(S.aim.x, S.aim.y, 0.12); E.retic.visible = true; E.retic.scale.setScalar((1 + Math.sin(T * 8) * 0.06) * (0.9 + S.dist / 18));
      E.retic.children[0].material.color.setHex(Math.abs(S.aim.x) > HW - 0.1 || S.aim.y > GH - 0.1 ? 0xff5a6a : 0xffdd33);
      trazo();
      if (S.fase === "potencia") { S.meter = tri((T - S.tFase) * 1.15 + S.ph); $("[data-marca]").style.left = (S.meter * 100).toFixed(1) + "%"; }
    }
    if (S.fase === "carrera") {
      const tt = T - S.tFase, u = clamp(tt / (RUN + GOLPE * 0.6), 0, 1), ue = u * u * 0.6 + u * 0.4, R = S.run;
      yo.raiz.position.lerpVectors(R.a, R.b, ue); yo.raiz.rotation.y = R.ang;
      if (tt < RUN) POSES.carrera(yo, tt / RUN, S.ciclo); else POSES.golpeo(yo, (tt - RUN) / GOLPE);
      POSES.quieto(E.porCpu, T, true);
      if (tt >= RUN + CONTACTO) contacto();
    }
    if (S.fase === "vuelo" || S.fase === "resultado") {
      const B = S.ball;
      if (B) {
        const n = Math.max(1, Math.ceil(dtS / 0.004)), h = dtS / n;
        for (let i = 0; i < n; i++) {
          if (!B.fin) simula(h);
          else {
            const p = B.p, v = B.v; paso(p, v, 0, h);
            if (p.y <= RB + 0.001) { const f = Math.pow(0.35, h); v.x *= f; v.z *= f; }
            if (p.z < 0 && Math.abs(p.x) < HW && p.y < GH + 0.1) { v.x *= Math.pow(0.04, h); v.z *= Math.pow(0.04, h); v.y *= Math.pow(0.2, h); if (p.z < -DEPTH + RB) { p.z = -DEPTH + RB; v.z = 0; } if (Math.abs(p.x) > HW - RB) { p.x = Math.sign(p.x) * (HW - RB); v.x = 0; } }
            if (p.z < -8.3) { p.z = -8.3; v.z *= -0.2; v.x *= 0.5; }
          }
        }
        bal.rotation.x -= B.v.z * dtS * 2.2; bal.rotation.z += B.v.x * dtS * 2.2;
      }
      const tt = B ? B.t : 0;
      figuraPortero(E.porCpu, tt, T);
      const kt = T - S.tFase;
      if (S.fase === "vuelo") POSES.golpeo(yo, clamp((CONTACTO + kt) / GOLPE, 0, 1));
      else if (S.cel === "gol") POSES.festeja(yo, T); else POSES.derrota(yo, T);
      /* la barrera salta */
      const tq = B ? B.t - 0.12 : -1, sal = S.jump && tq > 0 && tq < 0.6 ? 0.55 * Math.sin(Math.PI * tq / 0.6) : 0;
      S.muro.forEach(function (w, i) { POSES.quieto(w.f, T + i, false); w.f.raiz.position.y = sal; });
      if (S.fase === "resultado" && T - S.tFase > 2.3) resolverFalta();
    } else {
      S.muro.forEach(function (w, i) { if (S.fase !== "menu") POSES.quieto(w.f, T + i, false); });
    }
    const R = E.red;
    if (R.t < 3) {
      R.t += dt; const pos = R.malla.geometry.attributes.position, arr = pos.array, o = R.orig, amp = R.a * Math.exp(-R.t * 2.4) * Math.cos(R.t * 14);
      for (let i = 0; i < arr.length; i += 3) { const dx = o[i] - R.x, dy = (o[i + 1] + 1.1) - R.y; arr[i + 2] = o[i + 2] - amp * Math.exp(-(dx * dx + dy * dy) / 0.9) * 0.9; }
      pos.needsUpdate = true;
    }
    tFlash += dt; if (tFlash > 0.09) { tFlash = 0; E.destellos.forEach((d) => d.offset.set(Math.random(), Math.random())); }
    E.vallaTex.offset.x = (E.vallaTex.offset.x + dt * 0.02) % 1;
    E.grupoGradas.forEach((g, i) => { g.offset.y = Math.sin(T * 3 + i) * 0.0016; });
    S.muro.length || E.espera.forEach((f, i) => POSES.quieto(f, T + i, false));
    POSES.quieto(E.arbitro, T, false);
    ponCamara(dt, T);
    E.renderer.render(E.scene, E.camara);
  }

  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf);
    window.removeEventListener("keydown", onKey); window.removeEventListener("resize", hRes);
    try { au.ambiente(0); } catch (e) { /* opcional */ }
    try { if (E) { E.renderer.dispose(); E.renderer.forceContextLoss(); } } catch (e) { /* opcional */ }
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* opcional */ }
    try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  function escenaMenu() {
    S.pos = [{ x: 4, z: 22 }]; S.n = 0; colocar(); E.retic.visible = false; S.muro = []; E.cpu.raiz.position.set(-3, 0, 9); E.cpu.raiz.rotation.y = 0.6;
    E.yo.raiz.position.set(2.6, 0, 10); E.yo.raiz.rotation.y = -2.6; E.espera.forEach((f, i) => { f.raiz.position.set(-7 + i * 2.6, 0, 26); f.raiz.rotation.y = Math.PI; });
  }
  pintaRecord(); if (E) { escenaMenu(); scene_puntos(false); } tamano(); S.fase = "menu";
  if (E) raf = requestAnimationFrame(function (n) { ultimo = n; bucle(n); });
  /* Solo para las pruebas automáticas */
  function disparar(tx, ty, efecto, m) { if (S.fase !== "apuntar") return false; S.aim = { x: tx, y: ty }; S.efecto = efecto || 0; S.meter = m == null ? 0.81 : m; lanzar(S.meter); return true; }
  return { cerrar: cerrar, S: S, E: E, empezar: empezar, disparar: disparar, resolver: resolver, vuela: vuela, DIF: DIF };
}
