#!/usr/bin/env python3
"""Convierte los shapefiles de Natural Earth (dominio público) en los archivos
compactos que lee `mapas.js`.

Uso:  python3 tools/mapas_construir.py CARPETA_CON_LOS_SHAPEFILES

La carpeta debe contener las subcarpetas descomprimidas de estos zips
(https://naciscdn.org/naturalearth/<escala>/<categoria>/<nombre>.zip):
  ne_10m_admin_0_countries  ne_10m_coastline  ne_10m_lakes
  ne_10m_populated_places   ne_10m_roads
  ne_50m_admin_0_countries  ne_50m_coastline  ne_50m_lakes
  ne_50m_rivers_lake_centerlines

Genera (todo relativo a la raíz del repositorio):
  mapas/mundo.bin      mapa del mundo simplificado (50m), siempre cargado
  mapas/t/<x>_<y>.bin  teselas 10m (rejilla 16x16 en Web Mercator), bajo demanda
  mapas/t/index.json   lista de las teselas que existen (las demás son mar abierto)
  mapas/ciudades.json  geometría de las 7.342 ciudades
  mapas/n_<id>.json    nombres de ciudades por idioma (es,en,pt,fr,it,de)
  mapas/paises.json    etiquetas de países (posición, zoom y nombres)

Formato binario (idéntico en mundo y teselas):
  'T1' + byte shift (las coordenadas van divididas entre 2**shift) + 5 secciones
  (tierra, lagos, costa, fronteras, carreteras/ríos).
  Cada sección: uvarint nItems; por item: byte attr, uvarint nPts,
  primer punto (zigzag, relativo al origen de la tesela) y deltas zigzag.
  Las coordenadas son enteros en una rejilla global de 2^18 unidades que
  cubre todo el mundo (x = longitud, y = Mercator, y=0 arriba).
"""
import json, math, os, struct, sys
from collections import defaultdict

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
from ne_lee import lee_dbf, lee_shp  # noqa: E402

G = 1 << 18            # unidades por vuelta al mundo
NT = 16                # teselas por lado (z=4)
EXT = G // NT          # unidades por tesela
MARGEN = 16            # solape entre teselas (unidades)
LAT_MAX = 85.0511287798
IDIOMAS = ["es", "en", "pt", "fr", "it", "de"]


def proyecta(lon, lat):
    lat = max(-LAT_MAX, min(LAT_MAX, lat))
    x = (lon + 180.0) / 360.0
    y = 0.5 - math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) / (2 * math.pi)
    return (int(round(x * G)), int(round(y * G)))


def anillo_q(anillo):
    """Cuantiza una lista de (lon,lat) y quita repetidos consecutivos."""
    out = []
    for lon, lat in anillo:
        p = proyecta(lon, lat)
        if not out or out[-1] != p:
            out.append(p)
    return out


def limpia(s):
    return s.replace("\x00", "").strip() if isinstance(s, str) else s


# ---------------------------------------------------------------- DP
def simplifica(pts, tol):
    """Douglas-Peucker iterativo sobre enteros. Conserva extremos."""
    n = len(pts)
    if n < 3 or tol <= 0:
        return pts
    keep = [False] * n
    keep[0] = keep[-1] = True
    pila = [(0, n - 1)]
    t2 = tol * tol
    while pila:
        a, b = pila.pop()
        if b <= a + 1:
            continue
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        l2 = dx * dx + dy * dy
        mejor, imax = -1.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            if l2 == 0:
                d = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = ((px - ax) * dx + (py - ay) * dy) / l2
                t = 0.0 if t < 0 else (1.0 if t > 1 else t)
                qx, qy = ax + t * dx, ay + t * dy
                d = (px - qx) ** 2 + (py - qy) ** 2
            if d > mejor:
                mejor, imax = d, i
        if mejor > t2:
            keep[imax] = True
            pila.append((a, imax)); pila.append((imax, b))
    return [p for p, k in zip(pts, keep) if k]


# ------------------------------------------------------------ recortes
def recorta_anillo(pts, x0, y0, x1, y1):
    """Sutherland-Hodgman. pts: anillo abierto (sin repetir el primero)."""
    def pasa(entrada, dentro, corta):
        if not entrada:
            return []
        out = []
        prev = entrada[-1]
        pd = dentro(prev)
        for cur in entrada:
            cd = dentro(cur)
            if cd:
                if not pd:
                    out.append(corta(prev, cur))
                out.append(cur)
            elif pd:
                out.append(corta(prev, cur))
            prev, pd = cur, cd
        return out

    def cx(x):
        return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))

    def cy(y):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)
    p = pts
    p = pasa(p, lambda q: q[0] >= x0, cx(x0))
    p = pasa(p, lambda q: q[0] <= x1, cx(x1))
    p = pasa(p, lambda q: q[1] >= y0, cy(y0))
    p = pasa(p, lambda q: q[1] <= y1, cy(y1))
    out = []
    for x, y in p:
        q = (int(round(x)), int(round(y)))
        if not out or out[-1] != q:
            out.append(q)
    if len(out) > 1 and out[0] == out[-1]:
        out.pop()
    return out


def recorta_linea(pts, x0, y0, x1, y1):
    """Recorta una polilínea (Liang-Barsky por tramo). Devuelve lista de polilíneas."""
    res, cur = [], []
    for i in range(len(pts) - 1):
        ax, ay = pts[i]; bx, by = pts[i + 1]
        dx, dy = bx - ax, by - ay
        t0, t1 = 0.0, 1.0
        ok = True
        for p, q in ((-dx, ax - x0), (dx, x1 - ax), (-dy, ay - y0), (dy, y1 - ay)):
            if p == 0:
                if q < 0:
                    ok = False; break
            else:
                r = q / p
                if p < 0:
                    if r > t1: ok = False; break
                    if r > t0: t0 = r
                else:
                    if r < t0: ok = False; break
                    if r < t1: t1 = r
        if not ok:
            if len(cur) > 1:
                res.append(cur)
            cur = []
            continue
        sx = (int(round(ax + t0 * dx)), int(round(ay + t0 * dy)))
        ex = (int(round(ax + t1 * dx)), int(round(ay + t1 * dy)))
        if not cur:
            cur = [sx]
        elif cur[-1] != sx:
            res.append(cur); cur = [sx]
        if cur[-1] != ex:
            cur.append(ex)
        if t1 < 1.0:
            if len(cur) > 1:
                res.append(cur)
            cur = []
    if len(cur) > 1:
        res.append(cur)
    return res


# ------------------------------------------------------------- binario
def uvarint(n, out):
    while n >= 0x80:
        out.append((n & 0x7F) | 0x80)
        n >>= 7
    out.append(n)


def zig(n):
    return (n << 1) ^ (n >> 63) if n < 0 else n << 1


def escribe_items(items, ox, oy, out, shift, minpts):
    """Escribe los items; las coordenadas se dividen entre 2**shift (rejilla más gruesa)."""
    lis = []
    d = 1 << shift
    for attr, pts in items:
        q = []
        for x, y in pts:
            p = (int(round(x / d)), int(round(y / d)))
            if not q or q[-1] != p:
                q.append(p)
        if len(q) >= minpts:
            lis.append((attr, q))
    uvarint(len(lis), out)
    ox //= d; oy //= d
    for attr, pts in lis:
        out.append(attr & 0xFF)
        uvarint(len(pts), out)
        px, py = pts[0]
        uvarint(zig(px - ox), out); uvarint(zig(py - oy), out)
        for x, y in pts[1:]:
            uvarint(zig(x - px), out); uvarint(zig(y - py), out)
            px, py = x, y


def serializa(secciones, ox, oy, shift=0):
    out = bytearray(b"T1")
    out.append(shift)
    for items, minpts in zip(secciones, (4, 4, 2, 2, 2)):
        escribe_items(items, ox, oy, out, shift, minpts)
    return bytes(out)


# ------------------------------------------------------------- capas
def carga(nombre, base):
    d = os.path.join(base, nombre)
    campos, filas = lee_dbf(os.path.join(d, nombre + ".dbf"))
    _, geo = lee_shp(os.path.join(d, nombre + ".shp"))
    return filas, geo


def paises(base, escala):
    filas, geo = carga("ne_%sm_admin_0_countries" % escala, base)
    out = []
    for i, (f, (t, partes, bb)) in enumerate(zip(filas, geo)):
        if f is None or not partes:
            continue
        col = f.get("MAPCOLOR7") or 1
        anillos = [anillo_q(a) for a in partes]
        anillos = [a for a in anillos if len(a) >= 3]
        out.append(dict(i=i, f=f, color=int(col), anillos=anillos))
    return out


def bordes_compartidos(lista):
    """Polilíneas de las aristas que comparten dos países distintos."""
    ed = defaultdict(set)
    for c in lista:
        for a in c["anillos"]:
            n = len(a)
            for k in range(n):
                p, q = a[k], a[(k + 1) % n]
                if p != q:
                    ed[(min(p, q), max(p, q))].add(c["i"])
    res = []
    for c in lista:
        for a in c["anillos"]:
            n = len(a)
            flags = []
            for k in range(n):
                p, q = a[k], a[(k + 1) % n]
                v = ed.get((min(p, q), max(p, q)), ())
                flags.append(len(v) > 1 and c["i"] == min(v))
            if not any(flags):
                continue
            if all(flags):
                res.append(a + [a[0]])
                continue
            ini = next(k for k in range(n) if not flags[k])
            run = None
            for s in range(n):
                k = (ini + s) % n
                if flags[k]:
                    if run is None:
                        run = [a[k]]
                    run.append(a[(k + 1) % n])
                else:
                    if run:
                        res.append(run); run = None
            if run:
                res.append(run)
    return res


def lineas_de(geo, filas, filtro=None):
    out = []
    for f, (t, partes, bb) in zip(filas, geo):
        if f is None or not partes:
            continue
        if filtro and not filtro(f):
            continue
        for a in partes:
            q = anillo_q(a)
            if len(q) >= 2:
                out.append((f, q))
    return out


def clase_carretera(f):
    t = f.get("type") or ""
    if "Ferry" in t or t == "Track":
        return None
    if t == "Major Highway":
        c = 0
    elif t in ("Secondary Highway", "Beltway", "Bypass"):
        c = 1
    else:
        c = 2
    mz = f.get("min_zoom")
    if mz is None:
        mz = 7.0
    return c, max(3.0, min(9.5, float(mz)))


def banda_zoom(mz):
    """min_zoom -> byte (0.25 por paso) para filtrar al dibujar."""
    return int(round(mz * 4))


# ------------------------------------------------------------ construcción
def construye_mundo(base, salida):
    pa = paises(base, "50")
    tierra = []
    for c in pa:
        for a in c["anillos"]:
            s = simplifica(a + [a[0]], 20)[:-1]
            if len(s) >= 3:
                tierra.append((c["color"], s + [s[0]]))
    fl, gl = carga("ne_50m_lakes", base)
    lagos = []
    for f, g in zip(fl, gl):
        for a in g[1]:
            s = simplifica(anillo_q(a) + [anillo_q(a)[0]], 16)
            if len(s) >= 4:
                lagos.append((0, s))
    fc, gc = carga("ne_50m_coastline", base)
    costa = [(0, simplifica(q, 20)) for f, q in lineas_de(gc, fc)]
    bord = [(0, simplifica(b, 20)) for b in bordes_compartidos(pa)]
    fr, gr = carga("ne_50m_rivers_lake_centerlines", base)
    rios = []
    for f, q in lineas_de(gr, fr):
        mz = f.get("min_zoom")
        mz = 4.0 if mz is None else max(2.0, min(9.0, float(mz)))
        rios.append((banda_zoom(mz), simplifica(q, 14)))
    data = serializa([tierra, lagos, costa, bord, rios], 0, 0, shift=2)
    with open(os.path.join(salida, "mundo.bin"), "wb") as fh:
        fh.write(data)
    print("mundo.bin", len(data), "bytes;", len(tierra), "anillos,", len(costa), "costas,",
          len(bord), "fronteras,", len(rios), "ríos")


def rango_teselas(pts, margen):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    tx0 = max(0, (min(xs) - margen) // EXT); tx1 = min(NT - 1, (max(xs) + margen) // EXT)
    ty0 = max(0, (min(ys) - margen) // EXT); ty1 = min(NT - 1, (max(ys) + margen) // EXT)
    return tx0, tx1, ty0, ty1


def construye_teselas(base, salida):
    pa = paises(base, "10")
    tes = defaultdict(lambda: [[], [], [], [], []])  # tierra, lagos, costa, bordes, vías

    def mete_anillos(idx, attr, anillos):
        for a in anillos:
            if len(a) < 3:
                continue
            tx0, tx1, ty0, ty1 = rango_teselas(a, MARGEN)
            for ty in range(ty0, ty1 + 1):
                for tx in range(tx0, tx1 + 1):
                    r = recorta_anillo(a, tx * EXT - MARGEN, ty * EXT - MARGEN,
                                       (tx + 1) * EXT + MARGEN, (ty + 1) * EXT + MARGEN)
                    if len(r) >= 3:
                        tes[(tx, ty)][idx].append((attr, r + [r[0]]))

    def mete_lineas(idx, attr, pts):
        tx0, tx1, ty0, ty1 = rango_teselas(pts, MARGEN)
        for ty in range(ty0, ty1 + 1):
            for tx in range(tx0, tx1 + 1):
                for r in recorta_linea(pts, tx * EXT - MARGEN, ty * EXT - MARGEN,
                                       (tx + 1) * EXT + MARGEN, (ty + 1) * EXT + MARGEN):
                    if len(r) >= 2:
                        tes[(tx, ty)][idx].append((attr, r))

    for c in pa:
        mete_anillos(0, c["color"], c["anillos"])
    print("tierra recortada")
    fl, gl = carga("ne_10m_lakes", base)
    for f, g in zip(fl, gl):
        if f is None:
            continue
        mete_anillos(1, 0, [anillo_q(a) for a in g[1]])
    print("lagos recortados")
    fc, gc = carga("ne_10m_coastline", base)
    for f, q in lineas_de(gc, fc):
        mete_lineas(2, 0, q)
    print("costa recortada")
    for b in bordes_compartidos(pa):
        mete_lineas(3, 0, b)
    print("fronteras recortadas")
    fr, gr = carga("ne_10m_roads", base)
    nroad = 0
    for f, q in lineas_de(gr, fr, lambda f: clase_carretera(f) is not None):
        cl, mz = clase_carretera(f)
        attr = (cl << 6) | min(63, banda_zoom(mz) - 12)   # banda 0..: min_zoom 3..9.5
        mete_lineas(4, attr, q)
        nroad += 1
    print("carreteras recortadas:", nroad)
    os.makedirs(os.path.join(salida, "t"), exist_ok=True)
    for f in os.listdir(os.path.join(salida, "t")):
        os.remove(os.path.join(salida, "t", f))
    total = 0
    indice = []
    for (tx, ty), secs in sorted(tes.items()):
        if not any(secs[i] for i in (0, 2, 3, 4, 1)):
            continue
        # solo aporta si hay tierra, costa, lagos o vías
        data = serializa(secs, tx * EXT, ty * EXT)
        with open(os.path.join(salida, "t", "%d_%d.bin" % (tx, ty)), "wb") as fh:
            fh.write(data)
        total += len(data)
        indice.append("%d_%d" % (tx, ty))
    with open(os.path.join(salida, "t", "index.json"), "w") as fh:
        json.dump(indice, fh, separators=(",", ":"))
    print("teselas:", len(indice), "bytes totales:", total)


def construye_ciudades(base, salida):
    filas, geo = carga("ne_10m_populated_places", base)
    ciud, nombres = [], {k: [] for k in IDIOMAS}
    orden = []
    for f, g in zip(filas, geo):
        if f is None or not g[1]:
            continue
        lon, lat = g[1][0][0]
        pop = int(f.get("POP_MAX") or 0)
        mz = f.get("MIN_ZOOM")
        mz = 7.0 if mz is None else float(mz)
        cap = 1 if f.get("ADM0CAP") == 1 else 0
        orden.append((pop, lon, lat, mz, cap, f))
    orden.sort(key=lambda t: -t[0])
    for pop, lon, lat, mz, cap, f in orden:
        pais = limpia(f.get("ADM0NAME")) or ""
        ciud.append([round(lon, 4), round(lat, 4), pop, round(mz, 1), cap, limpia(f.get("ISO_A2")) or "",
                     limpia(f.get("NAMEASCII")) or ""])
        for k in IDIOMAS:
            n = limpia(f.get("NAME_" + k.upper())) or limpia(f.get("NAME")) or ""
            nombres[k].append(n)
    with open(os.path.join(salida, "ciudades.json"), "w", encoding="utf-8") as fh:
        json.dump(ciud, fh, ensure_ascii=False, separators=(",", ":"))
    for k in IDIOMAS:
        with open(os.path.join(salida, "n_%s.json" % k), "w", encoding="utf-8") as fh:
            json.dump(nombres[k], fh, ensure_ascii=False, separators=(",", ":"))
    print("ciudades:", len(ciud))


def construye_paises(base, salida):
    filas, geo = carga("ne_10m_admin_0_countries", base)
    out = []
    for f in filas:
        if f is None:
            continue
        if limpia(f.get("TYPE")) not in ("Sovereign country", "Country", "Sovereignty", "Dependency", "Disputed"):
            pass
        lx, ly = f.get("LABEL_X"), f.get("LABEL_Y")
        if lx is None or ly is None:
            continue
        ml, xl = f.get("MIN_LABEL"), f.get("MAX_LABEL")
        nom = {k: (limpia(f.get("NAME_" + k.upper())) or limpia(f.get("NAME")) or "") for k in IDIOMAS}
        out.append([round(lx, 3), round(ly, 3), round(ml if ml is not None else 4, 1),
                    round(xl if xl is not None else 9, 1), limpia(f.get("ISO_A2")) or "",
                    int(f.get("POP_EST") or 0)] + [nom[k] for k in IDIOMAS])
    with open(os.path.join(salida, "paises.json"), "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))
    print("países:", len(out))


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    base = sys.argv[1]
    salida = os.path.join(RAIZ, "mapas")
    os.makedirs(salida, exist_ok=True)
    solo = sys.argv[2] if len(sys.argv) > 2 else "todo"
    if solo in ("todo", "mundo"):
        construye_mundo(base, salida)
    if solo in ("todo", "ciudades"):
        construye_ciudades(base, salida)
        construye_paises(base, salida)
    if solo in ("todo", "teselas"):
        construye_teselas(base, salida)


if __name__ == "__main__":
    main()
