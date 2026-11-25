#!/bin/bash
# regenera todo en el directorio actual (wip o repo)
set -e
for s in curiosidades curiosidades_datos curiosidades_historia curiosidades_estadisticas curiosidades_temas curiosidades_articulos curiosidades_extra comparador comparador_duelos; do python3 tools/$s.py > /dev/null; done
python3 tools/puentes.py > /dev/null
python3 tools/seo.py > /dev/null
[ -f tools/menu_paginas.py ] && python3 tools/menu_paginas.py
python3 tools/csp.py | tail -1
python3 tools/titulos.py
python3 tools/lastmod.py
python3 tools/buscador.py | tail -1
