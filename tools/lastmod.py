# -*- coding: utf-8 -*-
"""Fechas reales de las páginas: añade <lastmod> al sitemap y datePublished/dateModified al JSON-LD tipo Article.

Cómo funciona: tools/fechas_paginas.json guarda, por página, la fecha de primera publicación («pub»), la última
modificación («mod») y la huella del contenido (sin las propias fechas). Si el contenido regenerado es igual que la
última vez, la fecha no cambia; si cambia, «mod» pasa a hoy. Así lastmod solo se mueve cuando la página cambia de verdad.
La primera vez se toma el historial de git (primer y último commit del archivo).
Orden: … → seo.py → menu_paginas.py → csp.py → lastmod.py → buscador.py (se puede repetir sin efecto).
Ejecutar con --check para ver cuántas páginas cambiarían sin escribir nada."""
import hashlib, json, os, re, subprocess, sys, datetime

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOM = "https://tikitexto.com/"
ARCH = os.path.join(RAIZ, "tools", "fechas_paginas.json")
HOY = datetime.date.today().isoformat()
RE_FECHAS = re.compile(r',\s*"date(?:Published|Modified)":\s*"[^"]*"')
RE_LD = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.S)


def git(*a):
    return subprocess.run(["git", "-C", RAIZ, *a], capture_output=True, text=True).stdout


def historial():
    primero, ultimo, fecha = {}, {}, None
    for l in git("log", "--name-only", "--pretty=format:@@%cs").splitlines():
        if l.startswith("@@"): fecha = l[2:]
        elif l.strip():
            ultimo.setdefault(l, fecha); primero[l] = fecha  # git log va de lo nuevo a lo viejo
    return primero, ultimo


def huella(txt):
    return hashlib.sha1(RE_FECHAS.sub("", txt).encode("utf-8")).hexdigest()[:16]


def ruta_html(loc):
    r = loc[len(DOM):]
    return r + "index.html" if (r == "" or r.endswith("/")) else r


def parchea(txt, pub, mod):
    def f(m):
        try: d = json.loads(RE_FECHAS.sub("", m.group(2)))
        except Exception: return m.group(0)
        if not isinstance(d, dict) or d.get("@type") != "Article": return m.group(0)
        cuerpo = RE_FECHAS.sub("", m.group(2)).rstrip()
        assert cuerpo.endswith("}")
        cuerpo = cuerpo[:-1] + ', "datePublished": "%s", "dateModified": "%s"}' % (pub, mod)
        return m.group(1) + cuerpo + m.group(3)
    return RE_LD.sub(f, txt)


def main(solo_ver=False):
    sm_p = os.path.join(RAIZ, "sitemap.xml")
    sm = open(sm_p, encoding="utf-8").read()
    sm = re.sub(r"<lastmod>[^<]*</lastmod>", "", sm)
    locs = re.findall(r"<loc>([^<]+)</loc>", sm)
    datos = json.load(open(ARCH, encoding="utf-8")) if os.path.exists(ARCH) else {}
    primero, ultimo = historial()
    nuevos = camb = 0
    mods = {}
    for loc in locs:
        rel = ruta_html(loc)
        p = os.path.join(RAIZ, rel)
        if not os.path.exists(p): continue
        txt = open(p, encoding="utf-8").read()
        h = huella(txt)
        d = datos.get(rel)
        if d is None:
            d = {"pub": primero.get(rel, HOY), "mod": ultimo.get(rel, HOY), "h": h}; nuevos += 1
        elif d["h"] != h:
            d["h"] = h; d["mod"] = HOY; camb += 1
        if d["mod"] < d["pub"]: d["mod"] = d["pub"]
        datos[rel] = d; mods[loc] = d["mod"]
        if not solo_ver:
            nt = parchea(txt, d["pub"], d["mod"])
            if nt != txt: open(p, "w", encoding="utf-8").write(nt)
    print("lastmod: %d páginas, %d nuevas en el registro, %d con contenido cambiado" % (len(mods), nuevos, camb))
    if solo_ver: return
    json.dump(dict(sorted(datos.items())), open(ARCH, "w", encoding="utf-8"), indent=0, ensure_ascii=False)
    sm = re.sub(r"(<loc>([^<]+)</loc>)", lambda m: m.group(1) + ("<lastmod>%s</lastmod>" % mods[m.group(2)] if m.group(2) in mods else ""), sm)
    open(sm_p, "w", encoding="utf-8").write(sm)


if __name__ == "__main__":
    main("--check" in sys.argv)
