#!/usr/bin/env python3
"""Sustituye 'unsafe-inline' de script-src por huellas sha256 de los scripts en línea de cada página.
Ejecutar SIEMPRE al final (tras seo.py) y después de editar cualquier <script> de una página:
    python3 tools/csp.py          # reescribe las metas CSP
    python3 tools/csp.py --check  # solo comprueba (código de salida 1 si algo no coincide)
Los scripts JSON-LD (type=application/ld+json) no se ejecutan y no necesitan huella."""
import base64, hashlib, os, re, sys
from html.parser import HTMLParser

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSP_RE = re.compile(r'(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")')
SCRIPT_SRC_RE = re.compile(r"script-src [^;]*")
EXTRA = "https://static.cloudflareinsights.com"

class _P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.cur = None; self.buf = []; self.scripts = []
    def handle_starttag(self, tag, attrs):
        if tag == "script":
            a = dict(attrs)
            ejecutable = "src" not in a and (a.get("type") or "text/javascript").lower() in ("text/javascript", "module", "application/javascript")
            self.cur = ejecutable; self.buf = []
    def handle_data(self, d):
        if self.cur: self.buf.append(d)
    def handle_endtag(self, tag):
        if tag == "script":
            if self.cur: self.scripts.append("".join(self.buf))
            self.cur = None

def huellas(html):
    p = _P(); p.feed(html); p.close()
    return ["'sha256-" + base64.b64encode(hashlib.sha256(s.encode("utf-8")).digest()).decode() + "'" for s in p.scripts]

def directiva(html):
    return "script-src 'self' " + " ".join(sorted(set(huellas(html)))) + (" " if huellas(html) else "") + EXTRA

def procesar(ruta, solo_comprobar=False):
    s = open(ruta, encoding="utf-8").read()
    m = CSP_RE.search(s)
    if not m: return None
    nuevo = SCRIPT_SRC_RE.sub(directiva(s), m.group(2), count=1)
    if nuevo == m.group(2): return True
    if solo_comprobar: return False
    open(ruta, "w", encoding="utf-8").write(s[:m.start(2)] + nuevo + s[m.end(2):])
    return True

def paginas():
    for d, ds, fs in os.walk(RAIZ):
        ds[:] = [x for x in ds if x not in (".git", "node_modules", "tests")]
        for f in fs:
            if f.endswith(".html"): yield os.path.join(d, f)

if __name__ == "__main__":
    chk = "--check" in sys.argv
    mal = [p for p in paginas() if procesar(p, chk) is False]
    if chk:
        print(("FALLAN: " + ", ".join(mal)) if mal else "CSP al día"); sys.exit(1 if mal else 0)
    print("CSP actualizada en", sum(1 for _ in paginas()), "páginas")
