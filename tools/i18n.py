#!/usr/bin/env python3
"""Genera i18n/<idioma>.js a partir de i18n/fuente.txt (un archivo por idioma, solo se descarga el elegido)."""
import json, os, sys
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDIOMAS = ["en", "pt", "fr", "it", "de"]
d = {c: {} for c in IDIOMAS}; p = {c: [] for c in IDIOMAS}; n = {c: {} for c in IDIOMAS}
for num, l in enumerate(open(os.path.join(RAIZ, "i18n", "fuente.txt"), encoding="utf-8"), 1):
    l = l.rstrip("\n")
    if not l.strip() or l.startswith("#"): continue
    q = [x.strip() for x in l.split(" ||| ")]
    if q[0] == "P":
        if len(q) != 7: sys.exit("Línea %d: patrón con %d columnas" % (num, len(q)))
        for i, c in enumerate(IDIOMAS): p[c].append([q[1], q[2 + i]])
    elif q[0] == "N":
        if len(q) != 7: sys.exit("Línea %d: nombre con %d columnas" % (num, len(q)))
        for i, c in enumerate(IDIOMAS): n[c][q[1]] = q[2 + i]
    else:
        if len(q) != 6: sys.exit("Línea %d: %d columnas (hacen falta 6)" % (num, len(q)))
        for i, c in enumerate(IDIOMAS): d[c][q[0]] = q[1 + i]
for c in IDIOMAS:
    js = json.dumps({"d": d[c], "p": p[c], "n": n[c]}, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    open(os.path.join(RAIZ, "i18n", c + ".js"), "w", encoding="utf-8").write("window.TIKI_D=" + js + ";\n")
    print(c, len(d[c]), "textos", len(p[c]), "patrones", len(n[c]), "nombres")
