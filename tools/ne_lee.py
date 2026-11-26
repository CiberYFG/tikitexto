"""Lector mínimo de shapefile (.shp/.dbf) en Python puro."""
import struct

def lee_dbf(ruta, enc="utf-8"):
    with open(ruta, "rb") as f:
        d = f.read()
    n, cab, lreg = struct.unpack("<xxxxIHH", d[:12])
    campos = []
    p = 32
    while d[p] != 0x0D:
        nom = d[p:p+11].split(b"\0")[0].decode("ascii")
        tipo = chr(d[p+11]); ln = d[p+16]; dec = d[p+17]
        campos.append((nom, tipo, ln, dec))
        p += 32
    filas = []
    for i in range(n):
        reg = d[cab + i*lreg: cab + (i+1)*lreg]
        if reg[:1] == b"*":
            filas.append(None); continue
        o = 1; fila = {}
        for nom, tipo, ln, dec in campos:
            raw = reg[o:o+ln]; o += ln
            s = raw.decode(enc, "replace").strip()
            if tipo in "NF":
                try:
                    fila[nom] = float(s) if (dec or "." in s) else int(s)
                except ValueError:
                    fila[nom] = None
            else:
                fila[nom] = s
        filas.append(fila)
    return [c[0] for c in campos], filas

def lee_shp(ruta):
    """Devuelve lista de (tipo, partes, bbox) donde partes = lista de listas [(x,y),...]. Puntos: partes=[[(x,y)]]."""
    with open(ruta, "rb") as f:
        d = f.read()
    tipo_f = struct.unpack("<i", d[32:36])[0]
    p = 100
    out = []
    while p < len(d):
        num, ln = struct.unpack(">ii", d[p:p+8])
        p += 8
        cont = d[p:p+ln*2]
        p += ln*2
        t = struct.unpack("<i", cont[:4])[0]
        if t == 0:
            out.append((0, [], None)); continue
        if t in (1, 11, 21):
            x, y = struct.unpack("<dd", cont[4:20])
            out.append((1, [[(x, y)]], (x, y, x, y)))
        elif t in (3, 5, 13, 15, 23, 25):
            bb = struct.unpack("<4d", cont[4:36])
            npart, npts = struct.unpack("<ii", cont[36:44])
            partes = list(struct.unpack("<%di" % npart, cont[44:44+4*npart]))
            o = 44 + 4*npart
            pts = struct.unpack("<%dd" % (2*npts), cont[o:o+16*npts])
            xy = list(zip(pts[0::2], pts[1::2]))
            partes.append(npts)
            lis = [xy[partes[i]:partes[i+1]] for i in range(npart)]
            out.append((3 if t in (3,13,23) else 5, lis, bb))
        else:
            raise ValueError("tipo shp no soportado %d" % t)
    return tipo_f, out
