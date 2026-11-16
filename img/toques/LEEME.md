# Fotos de fondo para «Toques» (opcional)

El juego **Toques** pinta cada fondo (callejón, playa, estadio, palacio, pirámides, coliseo, muralla, torre, Nueva York) con código propio.
Si quieres usar **fotos reales**, copia aquí un `.jpg` por fondo con **exactamente estos nombres** y añade su entrada en `lista.json`:

`callejon.jpg · playa.jpg · estadio.jpg · palacio.jpg · piramides.jpg · coliseo.jpg · muralla.jpg · torre.jpg · nuevayork.jpg`

Ejemplo de `lista.json` (solo los fondos que tengan foto; el resto se sigue pintando con código):

```json
{
  "piramides": { "autor": "Nombre del autor", "licencia": "CC0", "url": "https://…" },
  "playa": { "autor": "Nombre del autor", "licencia": "Dominio público", "url": "https://…" }
}
```

Reglas:
- Solo fotos de **dominio público / CC0** (o con licencia que permita uso comercial y que cumplas, p. ej. CC BY con atribución). Fuentes habituales: Wikimedia Commons (filtrar por licencia), Pexels, Unsplash, Pixabay.
- **Sin escudos, logos ni personas identificables** (derechos de imagen). Mejor paisajes y monumentos.
- Formato JPG, ancho 1600-2000 px y menos de 400 KB cada una (calidad ~70-75).
- Guarda siempre autor, licencia y URL en `lista.json`: se muestra como crédito al jugar.
