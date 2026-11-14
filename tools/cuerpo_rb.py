# -*- coding: utf-8 -*-
"""Genera los cuerpos 3D de Penaltis (lib/cuerpo/) a partir de un avatar real de futbolista.

Modelo de origen: «Sports_Male_02» de Microsoft Rocketbox Avatar Library
(https://github.com/microsoft/Microsoft-Rocketbox, licencia MIT; ver lib/cuerpo/LICENCIA-Rocketbox.txt).
Los archivos de origen NO están en este repositorio (75 MB). Para regenerar:

    git clone --depth 1 --filter=blob:none --sparse https://github.com/microsoft/Microsoft-Rocketbox rb
    cd rb && git sparse-checkout set Assets/Avatars/Professions/Sports_Male_02
    python3 tools/cuerpo_rb.py rb/Assets/Avatars/Professions/Sports_Male_02

Qué hace:
  1. Lee el FBX (malla de 4.095 vértices, 80 huesos Biped) con tools/fbx_lee.py.
  2. Baja los brazos a la posición de reposo del juego (colgando), relaja los dedos y, para el
     portero, abre las manos y las engorda (guantes).
  3. Reduce el esqueleto a los 15 huesos que usan las poses de penaltis.js y escala el cuerpo
     para que la cadera quede a 0,95 m.
  4. Monta un atlas (cuerpo + cabeza) y borra de él la equipación original (rayas, dorsal,
     patrocinador y escudo ficticios): la tela se pinta en el juego con los colores de cada equipo.
     Las máscaras (camiseta, pantalón, medias, ribetes, piel, pelo, botas, manos) van en m1/m2.
  5. Escribe lib/cuerpo/{jugador,portero}.bin y lib/cuerpo/{base,normal}.webp, {m1,m2}.png.

Requiere: numpy, scipy, opencv (cv2) y Pillow."""
import json, os, struct, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fbx_lee  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(RAIZ, "lib", "cuerpo")

# Huesos del juego (el orden es el índice de skinIndex). I = x negativa, D = x positiva (el cuerpo mira a +z).
HUESOS = ["cadera", "torso", "cabeza", "hombroI", "hombroD", "codoI", "codoD", "caderaI", "caderaD",
          "rodillaI", "rodillaD", "manoI", "manoD", "pieI", "pieD"]
PADRES = {"torso": "cadera", "cabeza": "torso", "hombroI": "torso", "hombroD": "torso", "codoI": "hombroI",
          "codoD": "hombroD", "manoI": "codoI", "manoD": "codoD", "caderaI": "cadera", "caderaD": "cadera",
          "rodillaI": "caderaI", "rodillaD": "caderaD", "pieI": "rodillaI", "pieD": "rodillaD"}


# ───────────────────────── lectura del FBX ─────────────────────────
def mat(a):
    """Matriz FBX (16 valores, traslación en la última fila) → 4×4 para vectores columna."""
    return np.array(a, dtype=np.float64).reshape(4, 4).T


class Modelo:
    pass


def cargar(carpeta):
    fbx = [f for f in os.listdir(os.path.join(carpeta, "Export")) if f.endswith(".fbx") and "facial" not in f][0]
    r = fbx_lee.leer(os.path.join(carpeta, "Export", fbx))
    ob = r.hijo("Objects")
    g = ob.hijo("Geometry")
    m = Modelo()
    V = np.array(g.hijo("Vertices").props[0], dtype=np.float64).reshape(-1, 3)
    m.V = np.stack([V[:, 0], V[:, 2], -V[:, 1]], 1)  # PreRotation −90° en X: Z arriba → Y arriba (cm)
    pvi = np.array(g.hijo("PolygonVertexIndex").props[0]).reshape(-1, 3).copy()
    pvi[:, 2] = -pvi[:, 2] - 1
    m.tri = pvi
    N = np.array(g.hijo("LayerElementNormal").hijo("Normals").props[0], dtype=np.float64).reshape(-1, 3)
    m.N = np.stack([N[:, 0], N[:, 2], -N[:, 1]], 1).reshape(-1, 3, 3)  # por esquina
    uv = g.hijo("LayerElementUV")
    m.UV = np.array(uv.hijo("UV").props[0], dtype=np.float64).reshape(-1, 2)
    m.uvi = np.array(uv.hijo("UVIndex").props[0]).reshape(-1, 3)
    m.mat = np.array(g.hijo("LayerElementMaterial").hijo("Materials").props[0])  # 0 cuerpo, 1 cabeza
    # huesos
    modelos = {x.props[0]: x.props[1].split("\x00")[0] for x in ob.todos("Model")}
    padre = {}
    con = r.hijo("Connections").hijos
    for c in con:
        if c.props[0] == "OO" and c.props[1] in modelos and c.props[2] in modelos:
            padre[modelos[c.props[1]]] = modelos[c.props[2]]
    cl_de = {}  # cluster id → nombre de hueso
    ids_cl = {d.props[0]: d for d in ob.todos("Deformer") if d.props[2] == "Cluster"}
    for c in con:
        if c.props[0] == "OO" and c.props[2] in ids_cl and c.props[1] in modelos:
            cl_de[c.props[2]] = modelos[c.props[1]]
    m.huesos, m.G = [], {}
    W = np.zeros((len(m.V), len(ids_cl)))
    for i, (cid, d) in enumerate(ids_cl.items()):
        nombre = cl_de[cid]
        m.huesos.append(nombre)
        m.G[nombre] = mat(d.hijo("TransformLink").props[0])
        if d.hijo("Indexes") is not None:
            W[np.array(d.hijo("Indexes").props[0]), i] = np.array(d.hijo("Weights").props[0])
    W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    m.W = W
    m.padre = padre
    return m


def hijos_de(m, hueso):
    """El hueso y todos sus descendientes (solo los que deforman la malla)."""
    out = []
    for h in m.huesos:
        p = h
        while p is not None:
            if p == hueso:
                out.append(h)
                break
            p = m.padre.get(p)
    return out


def cabeza_de(G, hueso):
    return G[hueso][:3, 3].copy()


def rot_eje(eje, ang):
    eje = np.asarray(eje, dtype=np.float64)
    eje = eje / np.linalg.norm(eje)
    x, y, z = eje
    c, s = np.cos(ang), np.sin(ang)
    C = 1 - c
    return np.array([[c + x * x * C, x * y * C - z * s, x * z * C + y * s],
                     [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
                     [z * x * C - y * s, z * y * C + x * s, c + z * z * C]])


def rot_entre(a, b):
    """Rotación más corta que lleva la dirección a hasta b."""
    a = a / np.linalg.norm(a)
    b = b / np.linalg.norm(b)
    eje = np.cross(a, b)
    s = np.linalg.norm(eje)
    if s < 1e-9:
        return np.eye(3)
    return rot_eje(eje / s, np.arctan2(s, np.dot(a, b)))


def girar(m, G, hueso, R, pivote=None):
    """Gira un hueso (y su descendencia) alrededor de su articulación, en espacio de mundo."""
    p = cabeza_de(G, hueso) if pivote is None else pivote
    T = np.eye(4)
    T[:3, :3] = R
    T[:3, 3] = p - R @ p
    for h in hijos_de(m, hueso):
        G[h] = T @ G[h]


def escalar(m, G, hueso, k):
    p = cabeza_de(G, hueso)
    T = np.eye(4)
    T[:3, :3] *= k
    T[:3, 3] = p - k * p
    for h in hijos_de(m, hueso):
        G[h] = T @ G[h]


def deformar(m, G):
    """Skinning lineal con las matrices nuevas. Devuelve posiciones y normales por esquina."""
    n = len(m.V)
    Vh = np.concatenate([m.V, np.ones((n, 1))], 1)
    P = np.zeros((n, 3))
    Ms = []
    for i, h in enumerate(m.huesos):
        M = G[h] @ np.linalg.inv(m.G0[h])
        Ms.append(M)
        P += m.W[:, [i]] * (Vh @ M.T)[:, :3]
    # normales: mezcla de las rotaciones (sin escala)
    Nn = np.zeros_like(m.N)
    for i, M in enumerate(Ms):
        R = M[:3, :3]
        R = R / np.cbrt(max(np.linalg.det(R), 1e-9))
        for k in range(3):
            w = m.W[m.tri[:, k], i][:, None]
            Nn[:, k] += w * (m.N[:, k] @ R.T)
    Nn /= np.maximum(np.linalg.norm(Nn, axis=2, keepdims=True), 1e-9)
    return P, Nn


# ───────────────────────── pose de reposo del juego ─────────────────────────
def B(lado, nombre):
    return "Bip01 %s %s" % (lado, nombre)


def reposo(m, portero=False):
    """Brazos colgando (como el reposo que esperan las poses), dedos relajados; portero: guantes."""
    G = {k: v.copy() for k, v in m.G0.items()}
    for lado, sx in (("L", 1.0), ("R", -1.0)):
        obj = np.array([sx * 0.085, -1.0, 0.02])
        ua, fa, hd = B(lado, "UpperArm"), B(lado, "Forearm"), B(lado, "Hand")
        girar(m, G, ua, rot_entre(cabeza_de(G, fa) - cabeza_de(G, ua), obj))
        girar(m, G, fa, rot_entre(cabeza_de(G, hd) - cabeza_de(G, fa), obj))
        # palma mirando al muslo, pulgar hacia delante: se corrige el giro del antebrazo sobre su eje
        eje = cabeza_de(G, hd) - cabeza_de(G, fa)
        eje /= np.linalg.norm(eje)
        d1, d4 = cabeza_de(G, B(lado, "Finger1")), cabeza_de(G, B(lado, "Finger4"))
        nudillos = d1 - d4            # del meñique al índice
        nudillos -= eje * np.dot(nudillos, eje)
        quiero = np.array([0.0, 0.0, 1.0]) - eje * eje[2]   # el índice, hacia delante
        a = np.arctan2(np.dot(np.cross(nudillos, quiero), eje), np.dot(nudillos, quiero))
        girar(m, G, fa, rot_eje(eje, a * 0.55))   # la mitad del giro en el antebrazo…
        girar(m, G, hd, rot_eje(eje, a * 0.45))   # …y el resto en la muñeca
        girar(m, G, hd, rot_entre(cabeza_de(G, B(lado, "Finger2")) - cabeza_de(G, hd), eje))
        # dedos
        palma = np.array([-sx, 0.0, 0.0])   # la palma mira hacia el cuerpo
        for d in (1, 2, 3, 4):
            base = B(lado, "Finger%d" % d)
            dire = cabeza_de(G, B(lado, "Finger%d1" % d)) - cabeza_de(G, base)
            flex = np.cross(dire, palma)        # eje de flexión
            if np.linalg.norm(flex) < 1e-6:
                continue
            flex /= np.linalg.norm(flex)
            curva = (-0.06, -0.05, -0.04) if portero else (0.22 + 0.05 * d, 0.3, 0.22)
            for seg, ang in zip(("", "1", "2"), curva):
                girar(m, G, base + seg, rot_eje(flex, -ang))
            if portero:   # dedos abiertos en abanico
                girar(m, G, base, rot_eje(palma, sx * (d - 2.5) * 0.085))
        if portero:
            girar(m, G, B(lado, "Finger0"), rot_eje(palma, -sx * 0.3))
            escalar(m, G, hd, 1.3)
    return G


# ───────────────────────── esqueleto del juego ─────────────────────────
def reparto(hueso):
    """Hueso Biped → {hueso del juego: fracción}. Biped L está en +x (= «D» en el juego)."""
    h = hueso.replace("Bip01 ", "")
    lado = "D" if h.startswith("L ") else "I" if h.startswith("R ") else ""
    n = h[2:] if lado else h
    if lado:
        if n == "Clavicle": return {"torso": 1}
        if n == "UpperArm": return {"hombro" + lado: 1}
        if n == "Forearm": return {"codo" + lado: 1}
        if n == "Hand" or n.startswith("Finger"): return {"mano" + lado: 1}
        if n == "Thigh": return {"cadera" + lado: 1}
        if n == "Calf": return {"rodilla" + lado: 1}
        if n in ("Foot", "Toe0"): return {"pie" + lado: 1}
    if n == "Pelvis": return {"cadera": 1}
    if n == "Spine": return {"cadera": 0.6, "torso": 0.4}
    if n == "Spine1": return {"cadera": 0.12, "torso": 0.88}
    if n == "Spine2": return {"torso": 1}
    if n == "Neck": return {"torso": 0.6, "cabeza": 0.4}
    return {"cabeza": 1}   # cabeza y huesos de la cara


def pesos_juego(m):
    M = np.zeros((len(m.huesos), len(HUESOS)))
    for i, h in enumerate(m.huesos):
        for k, f in reparto(h).items():
            M[i, HUESOS.index(k)] = f
    W = m.W @ M
    orden = np.argsort(-W, axis=1)[:, :4]
    w4 = np.take_along_axis(W, orden, 1)
    w4 /= w4.sum(1, keepdims=True)
    q = np.round(w4 * 255).astype(np.int32)
    q[:, 0] += 255 - q.sum(1)
    return orden.astype(np.uint8), q.astype(np.uint8)


def construir(m, portero=False):
    """Devuelve la malla lista para el juego (metros, mirando a +z, pies en y = 0)."""
    G = reposo(m, portero)
    P, N = deformar(m, G)
    y0 = P[:, 1].min()
    muslo = 0.5 * (cabeza_de(G, B("L", "Thigh")) + cabeza_de(G, B("R", "Thigh")))
    k = 0.92 / (muslo[1] - y0)
    off = np.array([0.0, -y0, -muslo[2]])
    P = (P + off) * k

    def piv(h):
        return ((cabeza_de(G, h) + off) * k)

    pv = {"torso": piv("Bip01 Spine"), "cabeza": piv("Bip01 Head")}
    for lado, s in (("L", "D"), ("R", "I")):
        pv["hombro" + s] = piv(B(lado, "UpperArm")); pv["codo" + s] = piv(B(lado, "Forearm")); pv["mano" + s] = piv(B(lado, "Hand"))
        pv["cadera" + s] = piv(B(lado, "Thigh")); pv["rodilla" + s] = piv(B(lado, "Calf")); pv["pie" + s] = piv(B(lado, "Foot"))
    pv["cadera"] = np.array([0.0, 0.95, 0.0])
    pv["torso"][0] = pv["cabeza"][0] = 0.0
    # vértices únicos (posición + uv + normal)
    skI, skW = pesos_juego(m)
    claves, verts, idx = {}, [], np.zeros((len(m.tri), 3), np.int64)
    nq = np.round(N * 127).astype(np.int32)
    for t in range(len(m.tri)):
        for c in range(3):
            key = (int(m.tri[t, c]), int(m.uvi[t, c]), int(m.mat[t]), int(nq[t, c, 0]), int(nq[t, c, 1]), int(nq[t, c, 2]))
            j = claves.get(key)
            if j is None:
                j = claves[key] = len(verts)
                verts.append((m.tri[t, c], m.uvi[t, c], m.mat[t], t, c))
            idx[t, c] = j
    verts = np.array(verts)
    o = Modelo()
    o.pos = P[verts[:, 0]].astype(np.float32)
    o.nor = N[verts[:, 3], verts[:, 4]]
    uv = m.UV[verts[:, 1]].copy()
    uv[:, 0] = uv[:, 0] * 0.5 + 0.5 * verts[:, 2]     # atlas: cuerpo a la izquierda, cabeza a la derecha
    o.uv = uv.astype(np.float32)
    o.skI, o.skW = skI[verts[:, 0]], skW[verts[:, 0]]
    o.idx = idx
    o.orig = verts[:, 0]
    o.pivotes = {k2: [round(float(x), 4) for x in v] for k2, v in pv.items()}
    o.escala = k
    return o


def empaquetar(nombre, o, extra):
    n = len(o.pos)
    meta = dict(v=2, n=n, tri=len(o.idx), huesos=HUESOS, padres=[HUESOS.index(PADRES[h]) if h in PADRES else -1 for h in HUESOS],
                pivotes=o.pivotes, alto=round(float(o.pos[:, 1].max()), 4))
    meta.update(extra)
    cab = json.dumps(meta, separators=(",", ":")).encode()
    cab += b" " * ((4 - (len(cab) + 4) % 4) % 4)
    nor = np.clip(np.round(o.nor * 127), -127, 127).astype(np.int8)
    partes = [struct.pack("<I", len(cab)), cab, o.pos.tobytes(), nor.tobytes(), o.uv.tobytes(), o.skI.tobytes(), o.skW.tobytes(), o.idx.astype(np.uint16).tobytes()]
    ruta = os.path.join(SALIDA, nombre + ".bin")
    with open(ruta, "wb") as f:
        f.write(b"".join(partes))
    print("%s.bin: %d vértices, %d triángulos, %.0f KB" % (nombre, n, len(o.idx), os.path.getsize(ruta) / 1024))


# ───────────────────────── texturas: atlas y máscaras ─────────────────────────
T = 2048   # resolución de trabajo (la de origen); el atlas final es 2048×1024


def clase_islas(m):
    """Clasifica cada triángulo del material «cuerpo» por la isla UV a la que pertenece."""
    def cat(h):
        h = h.replace("Bip01 ", "")
        if h == "Pelvis": return 0
        if h in ("Spine", "Spine1", "Spine2", "Neck", "L Clavicle", "R Clavicle"): return 1
        if "UpperArm" in h: return 2
        if "Forearm" in h: return 3
        if "Hand" in h or "Finger" in h: return 4
        if "Thigh" in h: return 5
        if "Calf" in h: return 6
        if "Foot" in h or "Toe" in h: return 7
        return 8
    cats = np.array([cat(h) for h in m.huesos])
    Wc = np.stack([m.W[:, cats == c].sum(1) for c in range(9)], 1)
    tc = (Wc[m.tri[:, 0]] + Wc[m.tri[:, 1]] + Wc[m.tri[:, 2]]).argmax(1)
    par = {}

    def f(x):
        while par.setdefault(x, x) != x:
            par[x] = par[par[x]]
            x = par[x]
        return x
    cuerpo = np.where(m.mat == 0)[0]
    for t in cuerpo:
        a, b, c = m.uvi[t]
        par[f(a)] = f(b)
        par[f(b)] = f(c)
    islas = {}
    for t in cuerpo:
        islas.setdefault(f(m.uvi[t][0]), []).append(t)
    # clases: 1 camiseta, 2 pantalón, 3 medias, 4 piel de pierna, 5 piel de brazo, 6 mano, 7 bota
    clase = np.zeros(len(m.tri), np.uint8)
    for ts in islas.values():
        ts = np.array(ts)
        n = np.bincount(tc[ts], minlength=9)
        if n[4]:
            clase[ts] = np.where(tc[ts] == 4, 6, 5)
        elif n[7] and not n[6]: clase[ts] = 7
        elif n[6] and n[7]: clase[ts] = 3
        elif n[5] and n[6]: clase[ts] = 4
        elif n[0] or n[5]: clase[ts] = 2
        else: clase[ts] = 1
    return clase


def texturas(m, carpeta):
    import cv2
    from PIL import Image
    from scipy import ndimage

    def abre(nombre):
        f = [x for x in os.listdir(os.path.join(carpeta, "Textures")) if x.endswith(nombre + ".tga")][0]
        return np.array(Image.open(os.path.join(carpeta, "Textures", f)).convert("RGB"))
    cuerpo, cabeza = abre("body_color"), abre("head_color")
    ncuerpo, ncabeza = abre("body_normal"), abre("head_normal")
    # etiquetas por texel (cuerpo), extendidas a los márgenes para que el filtrado no meta ceros
    clase = clase_islas(m)
    lab = np.zeros((T, T), np.uint8)
    for t in np.where(m.mat == 0)[0]:
        p = m.UV[m.uvi[t]]
        cv2.fillConvexPoly(lab, np.round(np.stack([p[:, 0] * T, (1 - p[:, 1]) * T], 1)).astype(np.int32), int(clase[t]))
    ind = ndimage.distance_transform_edt(lab == 0, return_distances=False, return_indices=True)
    lab = lab[ind[0], ind[1]]
    hsv = cv2.cvtColor(cuerpo, cv2.COLOR_RGB2HSV).astype(np.int32)
    Hh, Ss, Vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    tela = (lab >= 1) & (lab <= 3)
    naranja = ((Hh <= 14) | (Hh >= 172)) & (Ss > 150) & (Vv > 70)
    ribete = np.zeros((T, T), np.float32)
    ribete[(lab <= 2) & (lab >= 1) & naranja] = 1
    yy, xx = np.mgrid[0:T, 0:T]
    ribete[(np.abs(xx - 0.5 * T) < 0.097 * T) & (yy > 0.535 * T) & (yy < 0.67 * T)] = 0   # fuera el patrocinador ficticio del pecho
    ribete[(lab == 3) & (Vv < 90)] = 1          # aros de las medias
    ribete = cv2.GaussianBlur(ribete, (0, 0), 1.6)
    # sombreado de la tela a partir del mapa de normales (alturas integradas, paso alto)
    nx = ncuerpo[..., 0].astype(np.float64) / 127.5 - 1
    ny = ncuerpo[..., 1].astype(np.float64) / 127.5 - 1
    nz = np.maximum(ncuerpo[..., 2].astype(np.float64) / 127.5 - 1, 0.2)
    gx, gy = -nx / nz, ny / nz                   # pendientes (verde hacia arriba: convención de 3ds Max)
    fx = np.fft.fftfreq(T)[None, :] * 2 * np.pi
    fy = np.fft.fftfreq(T)[:, None] * 2 * np.pi
    den = fx ** 2 + fy ** 2
    den[0, 0] = 1
    alt = np.real(np.fft.ifft2((-1j * fx * np.fft.fft2(gx) - 1j * fy * np.fft.fft2(gy)) / den))
    alt -= cv2.GaussianBlur(alt, (0, 0), 28)
    alt = cv2.GaussianBlur(alt, (0, 0), 1.2)
    sombra = np.clip(1.0 + alt / (np.percentile(np.abs(alt[tela]), 97) + 1e-9) * 0.2, 0.62, 1.22)
    # interior del cuello: oscuro
    comp, _n = ndimage.label((lab == 1) & (Vv < 30))
    hueco = (comp == comp[int(0.477 * T), int(0.5 * T)]) & (comp > 0) & (np.hypot(xx - 0.5 * T, yy - 0.477 * T) < 0.07 * T)
    hueco = cv2.GaussianBlur(hueco.astype(np.float32), (0, 0), 2.0)
    sombra = sombra * (1 - 0.72 * hueco)
    base_c = cuerpo.astype(np.float32).copy()
    gris = np.clip(sombra * 200, 0, 255).astype(np.float32)
    base_c[tela] = gris[tela][:, None]
    # botas: se dejan en gris (luminancia) para poder teñirlas
    lum = cuerpo.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    # cabeza: pelo por color (oscuro) dentro de la isla principal
    hsvc = cv2.cvtColor(cabeza, cv2.COLOR_RGB2HSV).astype(np.int32)
    labc = np.zeros((T, T), np.uint8)
    isla_cab = np.zeros((T, T), np.uint8)
    for t in np.where(m.mat == 1)[0]:
        p = m.UV[m.uvi[t]]
        pts = np.round(np.stack([p[:, 0] * T, (1 - p[:, 1]) * T], 1)).astype(np.int32)
        cv2.fillConvexPoly(isla_cab, pts, 1)
    comp, _n = ndimage.label(isla_cab > 0)
    piel_cab = comp == (np.bincount(comp.ravel())[1:].argmax() + 1)   # la isla grande (cara, cuello y cuero cabelludo)
    piel_cab = ndimage.binary_dilation(piel_cab, iterations=6)
    lumc = cabeza.astype(np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    suave = cv2.GaussianBlur(lumc, (0, 0), 3)
    pelo = np.clip((118 - suave) / 30, 0, 1) * piel_cab
    pelo[(yy > 0.33 * T) & (np.abs(xx - 0.5 * T) < 0.2 * T) & (yy < 0.62 * T)] *= 0.0   # cara: cejas y sombras se quedan como están
    pelo = cv2.GaussianBlur(pelo.astype(np.float32), (0, 0), 2)
    piel_m = piel_cab.astype(np.float32) * (1 - pelo)
    del labc, hsvc
    # tonos medios (para teñir por multiplicación en el juego)
    piel_base = np.concatenate([cuerpo[(lab == 4) | (lab == 5)], cabeza[(piel_m > 0.9)][::7]]).reshape(-1, 3).mean(0)
    pelo_base = cabeza[pelo > 0.9].reshape(-1, 3).mean(0)

    def mitad(a, interp=cv2.INTER_AREA):
        return cv2.resize(a, (T // 2, T // 2), interpolation=interp)

    def atlas(izq, der):
        return np.concatenate([mitad(izq), mitad(der)], 1)
    z = np.zeros((T, T), np.float32)
    f32 = lambda b: b.astype(np.float32)
    m1 = np.stack([atlas(f32(lab == 1), z), atlas(f32(lab == 2), z), atlas(f32(lab == 3), z), atlas(ribete * tela, z)], 2)
    brazo = f32(lab == 5) * 0.5 + f32(lab == 6)
    m2 = np.stack([atlas(f32((lab >= 4) & (lab <= 6)), piel_m), atlas(z, pelo), atlas(f32(lab == 7), z), atlas(brazo, z)], 2)
    base = np.concatenate([mitad(base_c), mitad(cabeza.astype(np.float32))], 1)
    normal = np.concatenate([mitad(ncuerpo), mitad(ncabeza)], 1)
    Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).save(os.path.join(SALIDA, "base.webp"), quality=90, method=6)
    Image.fromarray(normal).save(os.path.join(SALIDA, "normal.webp"), quality=92, method=6)
    Image.fromarray(np.clip(m1 * 255, 0, 255).astype(np.uint8), "RGBA").save(os.path.join(SALIDA, "m1.png"), optimize=True)
    Image.fromarray(np.clip(m2 * 255, 0, 255).astype(np.uint8), "RGBA").save(os.path.join(SALIDA, "m2.png"), optimize=True)
    for f in ("base.webp", "normal.webp", "m1.png", "m2.png"):
        print("%s: %.0f KB" % (f, os.path.getsize(os.path.join(SALIDA, f)) / 1024))
    return dict(pielBase=[round(float(x) / 255, 4) for x in piel_base], peloBase=[round(float(x) / 255, 4) for x in pelo_base]), clase


def dorsal(m, o, clase):
    """Matriz 2×3 que lleva la uv del atlas a las coordenadas (0..1) del dorsal en la espalda."""
    es_cam = np.zeros(len(m.V), bool)
    es_cam[m.tri[clase == 1].ravel()] = True
    sel = es_cam[o.orig] & (o.nor[:, 2] < -0.55) & (np.abs(o.pos[:, 0]) < 0.17) & (o.pos[:, 1] > 1.08) & (o.pos[:, 1] < 1.5)
    sel &= (o.uv[:, 0] > 0.18) & (o.uv[:, 0] < 0.32)      # solo la isla del tronco
    A = np.concatenate([o.uv[sel], np.ones((sel.sum(), 1))], 1)
    yc, lado = 1.305, 0.34
    obj = np.stack([0.5 - o.pos[sel, 0] / lado, 0.5 + (o.pos[sel, 1] - yc) / lado], 1)   # visto desde atrás, −x queda a la derecha
    sol = np.linalg.lstsq(A, obj, rcond=None)[0]
    err = np.abs(A @ sol - obj).max()
    print("dorsal: %d vértices, error máx %.3f" % (sel.sum(), err))
    return [round(float(x), 5) for x in sol.T.ravel()]


def main():
    carpeta = sys.argv[1]
    os.makedirs(SALIDA, exist_ok=True)
    m = cargar(carpeta)
    m.G0 = m.G
    extra, clase = texturas(m, carpeta)
    for nombre, por in (("jugador", False), ("portero", True)):
        o = construir(m, por)
        e = dict(extra)
        e["dorsal"] = dorsal(m, o, clase)
        empaquetar(nombre, o, e)


if __name__ == "__main__":
    main()
