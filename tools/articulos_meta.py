# -*- coding: utf-8 -*-
"""Color y emoji de cada artículo (sin dependencias). c = (acento claro, acento oscuro)."""
META = {
    "letras-mas-frecuentes-nombres-futbolistas": dict(c=("#7c3aed", "#b79bff"), e="🔤"),
    "trucos-adivinar-futbolista-6-intentos": dict(c=("#0f9d58", "#4ade80"), e="🎯"),
    "como-se-elige-el-balon-de-oro": dict(c=("#c98a00", "#ffd84d"), e="🏆"),
    "como-funciona-la-bota-de-oro": dict(c=("#ea580c", "#fb923c"), e="👟"),
    "premios-individuales-futbol-diferencias": dict(c=("#db2777", "#f472b6"), e="🥇"),
    "mundial-fase-de-grupos-desempates-y-formato-2026": dict(c=("#0891b2", "#22d3ee"), e="🌍"),
    "historia-tandas-de-penaltis": dict(c=("#dc2626", "#f87171"), e="🥅"),
    "fuera-de-juego-regla-historia-var": dict(c=("#4338ca", "#818cf8"), e="🚩"),
    "sentencia-bosman-clausulas-de-rescision-y-traspasos": dict(c=("#4d7c0f", "#a3e635"), e="✍️"),
    "que-son-los-goles-esperados-xg": dict(c=("#a21caf", "#e879f9"), e="📈"),
    "numeros-camiseta-dorsales-historia": dict(c=("#92400e", "#fbbf24"), e="🔟"),
    "remontadas-historicas-champions-league": dict(c=("#1d4ed8", "#60a5fa"), e="🔥"),
}
def meta(slug):
    return META.get(slug, dict(c=("#1747d6", "#6b9bff"), e="📖"))
