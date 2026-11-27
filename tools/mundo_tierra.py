#!/usr/bin/env python3
"""Máscara de tierra firme para el globo de la pantalla «¿Cómo quieres jugar?» (27-nov-2026).

Uso:  python3 tools/mundo_tierra.py CARPETA_CON_LOS_SHAPEFILES   (la misma que usa mapas_construir.py)

Dibuja los países de Natural Earth 50m (dominio público) en una imagen equirrectangular de 1024×512
(tierra = blanco, mar = negro, con suavizado) y la guarda en mapas/tierra.png. `split.js` la lee como
textura del globo y le pone encima los colores de cada reino. Requiere Pillow. No lleva escudos ni fotos."""
import os, sys
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
import mapas_construir as MC  # noqa: E402

W, H, SS = 1024, 512, 3  # tamaño final y sobremuestreo para suavizar los bordes


def main(base):
    filas, geo = MC.carga("ne_50m_admin_0_countries", base)
    img = Image.new("L", (W * SS, H * SS), 0)
    d = ImageDraw.Draw(img)
    n = 0
    for f, (t, partes, bb) in zip(filas, geo):
        if f is None or not partes:
            continue
        for a in partes:
            if len(a) < 3:
                continue
            pts = [((lon + 180.0) / 360.0 * W * SS, (90.0 - lat) / 180.0 * H * SS) for lon, lat in a]
            d.polygon(pts, fill=255)
            n += 1
    img = img.resize((W, H), Image.LANCZOS)
    # 16 niveles de gris bastan (el borde suave) y el PNG pesa mucho menos
    img = img.point(lambda v: min(255, int(round(v / 17.0)) * 17))
    out = os.path.join(RAIZ, "mapas", "tierra.png")
    img.save(out, optimize=True)
    print("anillos dibujados:", n, "->", out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1])
