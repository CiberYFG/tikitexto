# -*- coding: utf-8 -*-
"""Lector mínimo de FBX binario (7.x) para tools/cuerpo_rb.py. Sin dependencias externas salvo numpy."""
import struct, zlib
import numpy as np


class Nodo:
    __slots__ = ("nombre", "props", "hijos")

    def __init__(self, nombre, props, hijos):
        self.nombre, self.props, self.hijos = nombre, props, hijos

    def hijo(self, nombre):
        for h in self.hijos:
            if h.nombre == nombre:
                return h
        return None

    def todos(self, nombre):
        return [h for h in self.hijos if h.nombre == nombre]

    def val(self, nombre, i=0, defecto=None):
        h = self.hijo(nombre)
        return h.props[i] if h is not None and len(h.props) > i else defecto


def _array(b, p, tipo):
    n, enc, clen = struct.unpack_from("<III", b, p)
    p += 12
    datos = b[p:p + clen]
    p += clen
    if enc == 1:
        datos = zlib.decompress(datos)
    dt = {"f": "<f4", "d": "<f8", "l": "<i8", "i": "<i4", "b": "u1"}[tipo]
    return np.frombuffer(datos, dtype=dt, count=n), p


def _prop(b, p):
    t = chr(b[p]); p += 1
    if t == "Y": return struct.unpack_from("<h", b, p)[0], p + 2
    if t == "C": return b[p] != 0, p + 1
    if t == "I": return struct.unpack_from("<i", b, p)[0], p + 4
    if t == "F": return struct.unpack_from("<f", b, p)[0], p + 4
    if t == "D": return struct.unpack_from("<d", b, p)[0], p + 8
    if t == "L": return struct.unpack_from("<q", b, p)[0], p + 8
    if t in "fdlib": return _array(b, p, t)
    if t in "SR":
        n = struct.unpack_from("<I", b, p)[0]; p += 4
        d = b[p:p + n]
        return (d.decode("utf-8", "replace") if t == "S" else bytes(d)), p + n
    raise ValueError("tipo de propiedad FBX desconocido: %r" % t)


def _nodo(b, p, v75):
    if v75:
        fin, np_, _ll = struct.unpack_from("<QQQ", b, p); p += 24
    else:
        fin, np_, _ll = struct.unpack_from("<III", b, p); p += 12
    nl = b[p]; p += 1
    if fin == 0:
        return None, p
    nombre = b[p:p + nl].decode("ascii", "replace"); p += nl
    props = []
    for _ in range(np_):
        v, p = _prop(b, p)
        props.append(v)
    hijos = []
    while p < fin:
        h, p = _nodo(b, p, v75)
        if h is None:
            break
        hijos.append(h)
    return Nodo(nombre, props, hijos), fin


def leer(ruta):
    b = open(ruta, "rb").read()
    if b[:20] != b"Kaydara FBX Binary  ":
        raise ValueError("no es un FBX binario")
    ver = struct.unpack_from("<I", b, 23)[0]
    p, hijos = 27, []
    while p < len(b) - 160:
        h, p = _nodo(b, p, ver >= 7500)
        if h is None:
            break
        hijos.append(h)
    return Nodo("", [ver], hijos)
