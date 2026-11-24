# -*- coding: utf-8 -*-
"""Fecha de la última actualización REAL del sitio (se muestra en el pie de las páginas generadas).
Cambiar solo cuando se publiquen cambios de verdad; NO sustituye a «Datos revisados el…», que indica cuándo se contrastaron los datos de cada página."""
DIA, MES, ANO = 24, 11, 2026
_M = {"es": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
      "en": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      "pt": ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
      "fr": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      "it": ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
      "de": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]}
def texto(lang):
    m = _M[lang][MES - 1]
    return {"es": f"Sitio actualizado el {DIA} de {m} de {ANO}", "en": f"Site updated on {DIA} {m} {ANO}", "pt": f"Site atualizado em {DIA} de {m} de {ANO}",
            "fr": f"Site mis à jour le {DIA} {m} {ANO}", "it": f"Sito aggiornato il {DIA} {m} {ANO}", "de": f"Website aktualisiert am {DIA}. {m} {ANO}"}[lang]
def iso(): return "%04d-%02d-%02d" % (ANO, MES, DIA)
