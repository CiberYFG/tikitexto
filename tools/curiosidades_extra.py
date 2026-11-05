#!/usr/bin/env python3
"""Historias del fútbol (historias/) y Rincón de los peques (peques/): solo español.
Datos en historias_data.py y peques_data.py.
Orden: curiosidades.py -> curiosidades_datos.py -> curiosidades_historia.py -> curiosidades_temas.py -> curiosidades_articulos.py -> curiosidades_extra.py -> seo.py -> csp.py"""
import os, random, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import curiosidades as C
from curiosidades import e, cabecera, pie, entrada, Idioma, LIBRO, BALON, COPA
from curiosidades_articulos import solo_es
import historias_data as H
import peques_data as P

FECHA_H = "Historias de TIKITEXTO · 5 de noviembre de 2026"
FECHA_P = "Rincón de los peques · TIKITEXTO"
HUB_H = "historias"
HUB_H_T = "Historias y anécdotas del fútbol"
HUB_H_D = "Historias cortas y curiosas del fútbol: Mundiales increíbles, quién inventó cada cosa, sorpresas, récords raros, mitos y anécdotas de leyendas."
HUB_P = "peques"
HUB_P_T = "Fútbol para peques: chistes, adivinanzas, trabalenguas y sopas de letras"
HUB_P_D = "Un rincón de fútbol para niños: chistes, adivinanzas, trabalenguas, verdadero o falso y sopas de letras con palabras del fútbol. Sin registro y gratis."
COLOR_H = ("#7c3aed", "#b79bff")
COLOR_P = ("#0f9d58", "#4ade80")

CSS_X = """
.hist-emo { display: grid; place-items: center; font-size: 1.9rem; line-height: 1; }
.chistes { list-style: none; padding: 0; margin: 10px 0 20px; display: grid; gap: 10px; }
.chistes li { background: var(--caja); border: 1px solid var(--linea); border-radius: 14px; padding: 12px 16px; box-shadow: var(--sombra); line-height: 1.55; }
.sopa-box { margin: 26px 0 8px; }
.sopa { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 3px; max-width: 520px; margin: 12px 0; touch-action: manipulation; }
.cel { aspect-ratio: 1; min-width: 0; padding: 0; border: 1px solid var(--linea); border-radius: 8px; background: var(--caja); color: var(--texto); font-weight: 800; font-size: clamp(.85rem, 3.8vw, 1.25rem); cursor: pointer; font-family: inherit; }
.cel:hover { border-color: var(--acento); }
.cel.ini { background: color-mix(in srgb, var(--acento) 30%, var(--caja)); border-color: var(--acento); }
.cel.ok { background: color-mix(in srgb, #16a34a 35%, var(--caja)); border-color: #16a34a; }
.pal { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.pal li { padding: 4px 12px; border-radius: 999px; border: 1px solid var(--linea); background: var(--caja); font-weight: 800; font-size: .9rem; }
.pal li.ok { text-decoration: line-through; opacity: .6; background: color-mix(in srgb, #16a34a 25%, var(--caja)); }
.ganas { font-weight: 800; font-size: 1.1rem; }
.reini { font: inherit; font-weight: 800; padding: 8px 16px; border-radius: 999px; border: 1px solid var(--linea); background: var(--caja); color: var(--texto); cursor: pointer; }
.trab p { margin: 0; }
"""

SOPA_JS = """<script>(function(){document.querySelectorAll('.sopa-box').forEach(function(box){
var g=box.querySelector('.sopa'),n=+g.dataset.n,pal=g.dataset.words.split(','),cs=[].slice.call(g.querySelectorAll('.cel')),li=[].slice.call(box.querySelectorAll('.pal li')),ini=null,hechas=0,fin=box.querySelector('.ganas');
function quita(){cs.forEach(function(x){x.classList.remove('ini')});}
g.addEventListener('click',function(ev){var b=ev.target.closest('.cel');if(!b)return;var r=+b.dataset.r,c=+b.dataset.c;
if(!ini){ini=[r,c];b.classList.add('ini');return;}
var r0=ini[0],c0=ini[1];quita();ini=null;if(r0===r&&c0===c)return;
var dr=r-r0,dc=c-c0;if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)))return;
var len=Math.max(Math.abs(dr),Math.abs(dc))+1,sr=Math.sign(dr),sc=Math.sign(dc),s='',arr=[];
for(var i=0;i<len;i++){var x=cs[(r0+sr*i)*n+(c0+sc*i)];s+=x.textContent;arr.push(x);}
var k=pal.indexOf(s);if(k<0)k=pal.indexOf(s.split('').reverse().join(''));
if(k<0||li[k].classList.contains('ok'))return;
arr.forEach(function(x){x.classList.add('ok');});li[k].classList.add('ok');hechas++;if(hechas===pal.length)fin.hidden=false;});
box.querySelector('.reini').addEventListener('click',function(){cs.forEach(function(x){x.classList.remove('ok','ini');});li.forEach(function(x){x.classList.remove('ok');});hechas=0;ini=null;fin.hidden=true;});
});})();</script>
"""

def emo(x):
    return f'<span class="hist-emo" aria-hidden="true">{x}</span>'

def tarjeta(href, emoji, color, titulo, sub):
    return f'<a class="tarjeta tc" href="{href}" style="--c:{color}"><span class="emo" aria-hidden="true">{emoji}</span><b>{e(titulo)}</b><span>{e(sub)}</span></a>\n'

def base(L, titulo, desc, ruta, col, fecha, icono=LIBRO):
    h = cabecera(L, titulo + " | TIKITEXTO", desc, ruta, titulo, icono)
    h = solo_es(h, col).replace(L.ui["checked"], fecha)
    return h.replace("</style>", CSS_X + "</style>", 1)

# ---------- historias ----------
def pagina_coleccion(L, c):
    ruta = f"{HUB_H}/{c['slug']}/"
    h = base(L, c["titulo"], c["desc"], ruta, c["c"], FECHA_H)
    h += f'<div class="caja">{c["emoji"]} {e(c["intro"])}</div>\n'
    h += '<p class="indice">' + "".join(f'<a href="#h{i}">{e(t)}</a>' for i, (t, _, _) in enumerate(c["items"])) + '</p>\n'
    for i, (t, ps, dato) in enumerate(c["items"]):
        h += entrada(L, emo(c["emoji"]), str(i + 1), e(t), [e(x) for x in ps], e(dato), f"h{i}")
    fu = " · ".join(f'<a href="{u}" rel="noopener" target="_blank">{e(n)}</a>' for n, u in c["fuentes"])
    h += f'<p class="fecha fuentes">Fuentes y notas: {fu}. Texto redactado por el equipo de TIKITEXTO a partir de información pública de las organizaciones citadas. Si ves un error, escríbenos desde la página de contacto.</p>\n'
    h += f'<div class="gr" style="--c:{c["c"][0]}"><h2>Más historias</h2><a class="todo" href="/{HUB_H}/">Todas las historias →</a></div>\n<div class="tarjetas">\n'
    for o in [x for x in H.COLECCIONES if x is not c][:4]:
        h += tarjeta(f"/{HUB_H}/{o['slug']}/", o["emoji"], o["c"][0], o["titulo"], f"{len(o['items'])} historias")
    return ruta, h + '</div>\n' + pie(L, "", False)

def hub_historias(L):
    ruta = HUB_H + "/"
    h = base(L, HUB_H_T, HUB_H_D, ruta, COLOR_H, FECHA_H)
    h += f'<div class="caja">{e(HUB_H_D)}</div>\n<div class="tarjetas">\n'
    for c in H.COLECCIONES:
        h += tarjeta(f"/{HUB_H}/{c['slug']}/", c["emoji"], c["c"][0], c["titulo"], c["desc"][:105].rsplit(" ", 1)[0] + "…")
    h += '</div>\n'
    h += f'<div class="gr" style="--c:#16a34a"><h2>🧒 Para los más pequeños</h2><a class="todo" href="/{HUB_P}/">Rincón de los peques →</a></div>\n'
    return ruta, h + pie(L, "", False)

# ---------- peques ----------
def faq_pares(lista):
    return [(q, q, a, a) for q, a in lista]

def sopa(L, s):
    n = s["n"]; pal = s["palabras"]
    for intento in range(500):
        rnd = random.Random(s["semilla"] * 1000 + intento)
        g = [[None] * n for _ in range(n)]
        ok = True
        for w in sorted(pal, key=len, reverse=True):
            puesto = False
            for _ in range(400):
                dr, dc = rnd.choice([(0, 1), (1, 0), (1, 1)])
                r0 = rnd.randrange(n - (len(w) - 1) * dr); c0 = rnd.randrange(n - (len(w) - 1) * dc)
                celdas = [(r0 + dr * i, c0 + dc * i) for i in range(len(w))]
                if all(g[r][c] in (None, w[i]) for i, (r, c) in enumerate(celdas)):
                    for i, (r, c) in enumerate(celdas): g[r][c] = w[i]
                    puesto = True; break
            if not puesto: ok = False; break
        if ok: break
    else:
        raise SystemExit("no se pudo generar la sopa " + s["id"])
    letras = "ABCDEFGHILMNOPRSTU"
    celdas = "".join(f'<button type="button" class="cel" data-r="{r}" data-c="{c}">{g[r][c] or rnd.choice(letras)}</button>' for r in range(n) for c in range(n))
    return (f'<section class="sopa-box" id="{s["id"]}"><h2>{e(s["titulo"])}</h2>'
            f'<p>Toca la primera letra de una palabra y luego la última. Las palabras van en horizontal, en vertical o en diagonal (también al revés).</p>'
            f'<div class="sopa" style="--n:{n}" data-n="{n}" data-words="{",".join(pal)}">{celdas}</div>'
            f'<ul class="pal" aria-label="Palabras que buscar">' + "".join(f"<li>{e(w)}</li>" for w in pal) + '</ul>'
            f'<p class="ganas" role="status" hidden>🎉 ¡Las has encontrado todas! ¡Eres un crack!</p>'
            f'<button type="button" class="reini">Empezar de nuevo</button></section>\n')

PAGINAS_P = [
 dict(slug="chistes-de-futbol", emoji="😂", c=("#ea580c", "#fb923c"),
      titulo="Chistes de fútbol para niños", n=len(P.CHISTES) + len(P.DIALOGOS),
      desc="Chistes cortos y limpios de fútbol para reírse en casa o en el recreo: porteros, delanteros, árbitros y hasta un pulpo portero."),
 dict(slug="adivinanzas-de-futbol", emoji="🤔", c=("#0891b2", "#22d3ee"),
      titulo="Adivinanzas de fútbol con respuesta", n=len(P.ADIVINANZAS),
      desc="Adivinanzas de fútbol para niños con la respuesta escondida. ¿Cuántas aciertas sin mirar?"),
 dict(slug="trabalenguas-de-futbol", emoji="🗣️", c=("#db2777", "#f472b6"),
      titulo="Trabalenguas de fútbol", n=len(P.TRABALENGUAS),
      desc="Trabalenguas de fútbol para decir rápido sin equivocarte: porteros, goles, árbitros y copas."),
 dict(slug="verdadero-o-falso-futbol-ninos", emoji="✅", c=("#4338ca", "#818cf8"),
      titulo="Verdadero o falso de fútbol para niños", n=len(P.VERDADERO_FALSO),
      desc="Doce frases sobre fútbol: ¿verdaderas o falsas? Piensa tu respuesta y descubre la solución."),
 dict(slug="sopa-de-letras-futbol", emoji="🔤", c=("#16a34a", "#4ade80"),
      titulo="Sopa de letras de fútbol para jugar online", n=len(P.SOPAS),
      desc="Tres sopas de letras de fútbol para jugar en el móvil o el ordenador, con palabras del campo, del equipo y del Mundial."),
]

def pagina_peque(L, p):
    ruta = f"{HUB_P}/{p['slug']}/"
    h = base(L, p["titulo"], p["desc"], ruta, p["c"], FECHA_P, BALON)
    s = p["slug"]
    if s == "chistes-de-futbol":
        h += f'<div class="caja">{p["emoji"]} Toca cada pregunta para ver la respuesta. Son chistes cortos y para todos los públicos.</div>\n'
        h += C.faq(L, faq_pares(P.CHISTES), "Chistes de pregunta y respuesta", ld=False)
        h += "<h2>Chistes de conversación</h2>\n<ul class=\"chistes\">" + "".join(f"<li>{e(x)}</li>" for x in P.DIALOGOS) + "</ul>\n"
    elif s == "adivinanzas-de-futbol":
        h += f'<div class="caja">{p["emoji"]} Lee la adivinanza, piensa y toca para ver la respuesta.</div>\n'
        h += C.faq(L, faq_pares(P.ADIVINANZAS), "Adivinanzas", ld=False)
    elif s == "trabalenguas-de-futbol":
        h += f'<div class="caja">{p["emoji"]} Di cada trabalenguas tres veces seguidas y cada vez más rápido. ¡Sin equivocarte!</div>\n<ul class="chistes trab">'
        h += "".join(f"<li><p>{e(x)}</p></li>" for x in P.TRABALENGUAS) + "</ul>\n"
    elif s == "verdadero-o-falso-futbol-ninos":
        h += f'<div class="caja">{p["emoji"]} Piensa si cada frase es verdadera o falsa y toca para ver si has acertado.</div>\n'
        pares = [(f, f, ("✅ Verdadero. " if v else "❌ Falso. ") + x, ("✅ Verdadero. " if v else "❌ Falso. ") + x) for f, v, x in P.VERDADERO_FALSO]
        h += C.faq(L, pares, "¿Verdadero o falso?", ld=False)
    elif s == "sopa-de-letras-futbol":
        h += f'<div class="caja">{p["emoji"]} Tres sopas de letras con palabras de fútbol. No hace falta registrarse y no se guarda nada.</div>\n'
        h += "".join(sopa(L, x) for x in P.SOPAS) + SOPA_JS
    h += f'<div class="gr" style="--c:{p["c"][0]}"><h2>Más para los peques</h2><a class="todo" href="/{HUB_P}/">Todo el rincón →</a></div>\n<div class="tarjetas">\n'
    for o in [x for x in PAGINAS_P if x is not p][:4]:
        h += tarjeta(f"/{HUB_P}/{o['slug']}/", o["emoji"], o["c"][0], o["titulo"], o["desc"][:90].rsplit(" ", 1)[0] + "…")
    return ruta, h + '</div>\n' + pie(L, "", False)

def hub_peques(L):
    ruta = HUB_P + "/"
    h = base(L, HUB_P_T, HUB_P_D, ruta, COLOR_P, FECHA_P, BALON)
    h += f'<div class="caja">🧒 {e(HUB_P_D)} Para los más mayores de la casa, también hay <a href="/{HUB_H}/">historias y anécdotas</a>.</div>\n<div class="tarjetas">\n'
    for p in PAGINAS_P:
        h += tarjeta(f"/{HUB_P}/{p['slug']}/", p["emoji"], p["c"][0], p["titulo"], p["desc"][:100].rsplit(" ", 1)[0] + "…")
    return ruta, h + '</div>\n' + pie(L, "", False)

def todas(L):
    return ([hub_historias(L)] + [pagina_coleccion(L, c) for c in H.COLECCIONES]
            + [hub_peques(L)] + [pagina_peque(L, p) for p in PAGINAS_P])

if __name__ == "__main__":
    C.LANGS = ["es"]
    L = Idioma("es")
    n = 0
    for ruta, cont in todas(L):
        cont = C.con_huecos(L, cont)
        d = os.path.join(C.RAIZ, ruta); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(cont); n += 1
    print(n, "páginas")
