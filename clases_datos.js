/* CLASES TIKITEXTO · lecciones (datos). Cada lección es una lista de escenas sobre una pizarra de 600×300.
   Escena: { say: texto que dice el profe (y subtítulo), min: segundos mínimos, limpia: borra la pizarra, señala: id de lo que apunta el profe,
             items: [...] }  ·  "at" y "d" son fracciones (0-1) de la duración de la escena.
   Tipos de item: campo, jug, balon, linea, flecha, texto, caja, tarjeta, marca, foco, mueve, borra, sonido.
   Reglas: IFAB (Reglas de Juego, reglas 11 y 12), FIFA y UEFA. Revisar si cambian las Reglas de Juego (cada verano) o los formatos. */

const AZ = "#3b82f6", RO = "#ef4444", PO = "#facc15", AM = "#ffd23a", VE = "#41d98a", BL = "#f8fafc";

/* Campo ampliado (7,5 px por metro): la portería rival queda a la derecha. m(x, y) pasa de metros a pizarra. */
const ZX = -212, ZY = 150 - 7.5 * 34;
const m = (x, y) => [ZX + 7.5 * x, ZY + 7.5 * y];
const J = (id, eq, x, y, n, at) => { const p = m(x, y); return { k: "jug", id, eq, x: p[0], y: p[1], n, at: at || 0 }; };

/* ============ 1 · FUERA DE JUEGO ============ */
const fuera = {
  id: "fuera-de-juego", emoji: "🚩", titulo: "El fuera de juego", desc: "La regla más famosa y más discutida, explicada con una línea.", dur: "≈ 2 min", thumb: 3,
  escenas: [
    { say: "Hoy vamos con la regla más famosa y más discutida del fútbol: el fuera de juego. Verás que es más fácil de lo que parece.", min: 5,
      items: [{ k: "campo", x0: ZX, y0: ZY, esc: 7.5 }, { k: "texto", x: 300, y: 36, id: "tt", t: "FUERA DE JUEGO", c: AM, sz: 30, al: "c", at: .3 }] },
    { say: "Tenemos un equipo atacante, en azul, y uno defensor, en rojo. Al fondo está el portero, que casi siempre es el último adversario.", min: 6, señala: "d1",
      items: [J("p", "p", 104, 34, "1", .05), J("d1", "r", 88, 24, "4", .2), J("d2", "r", 84, 42, "5", .3),
        J("a4", "a", 66, 34, "8", .5), J("a1", "a", 91, 30, "9", .6), J("a2", "a", 88, 46, "7", .7), J("a3", "a", 80, 56, "11", .8),
        { k: "balon", id: "b", x: m(68, 34)[0], y: m(68, 34)[1], at: .9 }] },
    { say: "El penúltimo adversario suele ser el último defensor de campo. Imagina una línea que pasa por él, paralela a la línea de meta: esa es la línea del fuera de juego.", min: 8, señala: "d1",
      items: [{ k: "borra", id: "tt", at: 0 }, { k: "foco", x: m(88, 24)[0], y: m(88, 24)[1], r: 20, c: AM, at: .05 },
        { k: "linea", id: "lf", x1: m(88, 14)[0], y1: 8, x2: m(88, 54)[0], y2: 292, c: AM, dash: 1, w: 3, at: .25, d: .4 },
        { k: "texto", x: m(88, 14)[0] - 8, y: 24, t: "línea de\nfuera de juego", c: AM, sz: 15, al: "r", at: .7 }] },
    { say: "Un delantero está en posición de fuera de juego si, cuando le pasan el balón, está más cerca de la meta rival que el balón y que el penúltimo adversario. Este delantero se ha pasado de la línea: fuera de juego.", min: 11, señala: "a1",
      items: [{ k: "flecha", id: "ps1", x1: m(68, 34)[0], y1: m(68, 34)[1], x2: m(90, 30)[0] - 10, y2: m(90, 30)[1], c: BL, at: .15, d: .25 },
        { k: "marca", id: "x1", x: m(91, 30)[0] + 28, y: m(91, 30)[1] + 2, ok: false, at: .55 },
        { k: "sonido", s: "silbato", at: .55 },
        { k: "texto", id: "t1", x: m(91, 30)[0] - 4, y: 262, t: "¡FUERA DE JUEGO!", c: "#ff6b6b", sz: 20, al: "c", at: .6 }] },
    { say: "Si el delantero está a la misma altura que el defensa, alineado con la línea, está en juego. Estar a la par es legal.", min: 7, señala: "a2",
      items: [{ k: "borra", id: "ps1", at: 0 }, { k: "borra", id: "x1", at: 0 }, { k: "borra", id: "t1", at: 0 },
        { k: "flecha", id: "ps2", x1: m(68, 35)[0], y1: m(68, 35)[1], x2: m(88, 45)[0] - 10, y2: m(88, 46)[1] - 4, c: BL, at: .2, d: .25 },
        { k: "marca", id: "ok2", x: m(88, 46)[0], y: m(88, 46)[1] - 26, ok: true, at: .55 },
        { k: "texto", id: "t2", x: m(88, 46)[0], y: 262, t: "A la par: en juego", c: VE, sz: 20, al: "c", at: .6 }] },
    { say: "Y si te quedas por detrás de la línea, claro, estás en juego. Este delantero puede recibir el balón sin ningún problema.", min: 6, señala: "a3",
      items: [{ k: "borra", id: "ps2", at: 0 }, { k: "borra", id: "ok2", at: 0 }, { k: "borra", id: "t2", at: 0 },
        { k: "flecha", id: "ps3", x1: m(68, 36)[0], y1: m(68, 36)[1], x2: m(80, 55)[0] - 6, y2: m(80, 56)[1] - 6, c: BL, at: .2, d: .25 },
        { k: "marca", id: "ok3", x: m(80, 56)[0], y: m(80, 56)[1] - 26, ok: true, at: .55 },
        { k: "texto", id: "t3", x: m(80, 56)[0], y: 262, t: "Por detrás: en juego", c: VE, sz: 20, al: "c", at: .6 }] },
    { say: "Ojo: lo que importa es dónde estás en el momento del pase, no dónde acabas. Si estabas en línea cuando te pasaron y luego corres hacia la meta, no hay fuera de juego.", min: 10, señala: "a2",
      items: [{ k: "borra", id: "ps3", at: 0 }, { k: "borra", id: "ok3", at: 0 }, { k: "borra", id: "t3", at: 0 },
        { k: "texto", id: "t4", x: 300, y: 262, t: "Cuenta el momento del pase", c: AM, sz: 20, al: "c", at: .1 },
        { k: "mueve", id: "a2", x: m(98, 46)[0], y: m(98, 46)[1], at: .35, dur: .35 },
        { k: "flecha", id: "ps4", x1: m(88, 46)[0] + 4, y1: m(88, 46)[1] + 18, x2: m(98, 46)[0] - 4, y2: m(98, 46)[1] + 18, c: AZ, at: .35, d: .35 }] },
    { say: "Tampoco hay fuera de juego si recibes el balón directamente de un saque de banda, de un córner o de un saque de puerta. Y nunca puede haberlo en tu propio campo.", min: 10, limpia: true,
      items: [{ k: "texto", x: 300, y: 36, t: "NUNCA HAY FUERA DE JUEGO EN…", c: AM, sz: 22, al: "c", at: 0 },
        { k: "caja", x: 120, y: 70, w: 360, h: 42, t: "Saque de banda", c: AZ, at: .15 }, { k: "caja", x: 120, y: 122, w: 360, h: 42, t: "Saque de esquina (córner)", c: AZ, at: .3 },
        { k: "caja", x: 120, y: 174, w: 360, h: 42, t: "Saque de puerta", c: AZ, at: .45 }, { k: "caja", x: 120, y: 226, w: 360, h: 42, t: "Tu propio campo", c: AZ, at: .6 }] },
    { say: "Además, estar en posición de fuera de juego no es falta por sí solo: el árbitro la castiga solo si ese jugador interviene en la jugada, tocando el balón o molestando a un rival. La sanción es un tiro libre indirecto para el otro equipo.", min: 12, limpia: true,
      items: [{ k: "texto", x: 300, y: 40, t: "¿CUÁNDO SE SANCIONA?", c: AM, sz: 24, al: "c", at: 0 },
        { k: "caja", x: 60, y: 70, w: 480, h: 50, t: "1 · Estar en posición de fuera de juego", c: AZ, at: .12 },
        { k: "caja", x: 60, y: 132, w: 480, h: 50, t: "2 · Intervenir en la jugada", c: AZ, at: .35 },
        { k: "caja", x: 60, y: 194, w: 480, h: 50, t: "= Tiro libre indirecto para el rival", c: "#ef4444", at: .6 }, { k: "sonido", s: "silbato", at: .6 }] },
    { say: "Hoy, además, el VAR y las líneas virtuales ayudan a medir los casos más ajustados. Ya sabes lo básico. La próxima vez que lo veas en un partido, ¡lo entenderás al instante!", min: 7, limpia: true,
      items: [{ k: "texto", x: 300, y: 130, t: "¡Ya lo sabes!", c: AM, sz: 40, al: "c", at: .1 }, { k: "texto", x: 300, y: 190, t: "Míralo en el próximo partido", c: BL, sz: 20, al: "c", at: .5 }] },
  ],
};

/* ============ 2 · CÓMO SE GANA UN TORNEO ============ */
const fila = (y, c, n, pj, g, e, p, pts, at) => [
  { k: "texto", x: 30, y, t: n, c, sz: 17, al: "l", at }, { k: "texto", x: 230, y, t: pj, c: BL, sz: 17, al: "c", at },
  { k: "texto", x: 290, y, t: g, c: BL, sz: 17, al: "c", at }, { k: "texto", x: 340, y, t: e, c: BL, sz: 17, al: "c", at },
  { k: "texto", x: 390, y, t: p, c: BL, sz: 17, al: "c", at }, { k: "texto", x: 470, y, t: pts, c: AM, sz: 19, al: "c", at }];
const torneo = {
  id: "como-se-gana-un-torneo", emoji: "🏆", titulo: "Cómo se gana un torneo", desc: "De la fase de grupos a la final, fase a fase.", dur: "≈ 2 min", thumb: 3,
  escenas: [
    { say: "¿Cómo se gana un torneo? Siguiendo un camino con varias fases, desde la fase de grupos hasta la gran final. Vamos paso a paso.", min: 5,
      items: [{ k: "texto", x: 300, y: 110, t: "¿CÓMO SE GANA\nUN TORNEO?", c: AM, sz: 34, al: "c", at: .1 }, { k: "texto", x: 300, y: 230, t: "fase a fase  🏆", c: BL, sz: 24, al: "c", at: .6 }] },
    { say: "Casi todos los torneos empiezan con una fase de grupos: los equipos se reparten en grupos y juegan todos contra todos. Una victoria vale tres puntos, un empate uno y una derrota cero.", min: 10, limpia: true,
      items: [{ k: "texto", x: 300, y: 28, t: "FASE DE GRUPOS · GRUPO A", c: AM, sz: 20, al: "c", at: 0 },
        { k: "texto", x: 230, y: 62, t: "PJ", c: "#9fb3c8", sz: 14, al: "c", at: .05 }, { k: "texto", x: 290, y: 62, t: "G", c: "#9fb3c8", sz: 14, al: "c", at: .05 }, { k: "texto", x: 340, y: 62, t: "E", c: "#9fb3c8", sz: 14, al: "c", at: .05 },
        { k: "texto", x: 390, y: 62, t: "P", c: "#9fb3c8", sz: 14, al: "c", at: .05 }, { k: "texto", x: 470, y: 62, t: "PTS", c: "#9fb3c8", sz: 14, al: "c", at: .05 },
        ...fila(96, "#ff7b7b", "● Rojo", "3", "2", "1", "0", "7", .15), ...fila(136, "#7bb0ff", "● Azul", "3", "1", "1", "1", "4", .3),
        ...fila(176, "#7be0a6", "● Verde", "3", "1", "0", "2", "3", .45), ...fila(216, "#ffe27a", "● Amarillo", "3", "0", "2", "1", "2", .6),
        { k: "texto", x: 300, y: 270, t: "Victoria = 3 pts · Empate = 1 pt · Derrota = 0", c: BL, sz: 16, al: "c", at: .78 }] },
    { say: "Al acabar, se ordena la tabla por puntos. Si hay empate, se miran desempates, como la diferencia de goles; cada torneo fija los suyos. Los primeros de cada grupo pasan de ronda.", min: 10, señala: null,
      items: [{ k: "caja", x: 18, y: 78, w: 520, h: 76, t: "", c: VE, fill: 0, at: .1 }, { k: "texto", x: 570, y: 122, t: "¡Pasan!", c: VE, sz: 18, al: "c", at: .3 },
        { k: "marca", x: 560, y: 90, ok: true, at: .4 }, { k: "texto", x: 300, y: 292, t: "", c: BL, sz: 1, al: "c", at: 0 }] },
    { say: "Después llegan las eliminatorias. Aquí el que pierde se va a casa: octavos, cuartos, semifinales y la gran final. Cada ronda reduce a la mitad los equipos que quedan.", min: 11, limpia: true,
      items: [{ k: "texto", x: 300, y: 28, t: "ELIMINATORIAS", c: AM, sz: 22, al: "c", at: 0 },
        { k: "caja", x: 20, y: 215, w: 130, h: 60, t: "Octavos\n16 equipos", c: AZ, at: .1 }, { k: "caja", x: 170, y: 170, w: 130, h: 60, t: "Cuartos\n8 equipos", c: AZ, at: .3 },
        { k: "caja", x: 320, y: 125, w: 130, h: 60, t: "Semifinales\n4 equipos", c: AZ, at: .5 }, { k: "caja", x: 470, y: 80, w: 120, h: 60, t: "Final\n2 equipos", c: "#ef4444", at: .7 },
        { k: "texto", x: 530, y: 62, t: "🏆", c: BL, sz: 34, al: "c", at: .85 }] },
    { say: "Si en una eliminatoria a partido único se empata tras los noventa minutos, se juega una prórroga de dos tiempos de quince minutos. Si sigue el empate, se decide desde el punto de penalti: tandas de cinco lanzamientos y, si hace falta, muerte súbita.", min: 14, limpia: true,
      items: [{ k: "texto", x: 300, y: 36, t: "¿Y SI HAY EMPATE?", c: AM, sz: 24, al: "c", at: 0 },
        { k: "caja", x: 20, y: 110, w: 160, h: 80, t: "90 minutos\n1 – 1", c: AZ, at: .1 }, { k: "flecha", x1: 184, y1: 150, x2: 216, y2: 150, c: BL, at: .3, d: .1 },
        { k: "caja", x: 220, y: 110, w: 170, h: 80, t: "Prórroga\n2 × 15 min", c: "#a855f7", at: .4 }, { k: "flecha", x1: 394, y1: 150, x2: 426, y2: 150, c: BL, at: .6, d: .1 },
        { k: "caja", x: 430, y: 110, w: 150, h: 80, t: "Penaltis\n5 + 5", c: "#ef4444", at: .7 }, { k: "texto", x: 300, y: 250, t: "Si sigue igual: muerte súbita", c: BL, sz: 17, al: "c", at: .85 }] },
    { say: "En otras competiciones, como la Champions, las eliminatorias son a doble partido, ida y vuelta, y se suman los goles de los dos encuentros. Desde dos mil veintiuno, el gol fuera de casa ya no vale doble.", min: 13, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "IDA Y VUELTA", c: AM, sz: 24, al: "c", at: 0 },
        { k: "caja", x: 30, y: 80, w: 240, h: 56, t: "Ida:  Rojo 2 – 1 Azul", c: AZ, at: .15 }, { k: "caja", x: 330, y: 80, w: 240, h: 56, t: "Vuelta:  Azul 2 – 0 Rojo", c: AZ, at: .35 },
        { k: "texto", x: 300, y: 192, t: "Global:  Rojo 2  –  Azul 3", c: BL, sz: 24, al: "c", at: .6 }, { k: "texto", x: 300, y: 240, t: "¡Pasa el Azul!", c: VE, sz: 28, al: "c", at: .75 }] },
    { say: "Los formatos cambian. El Mundial de dos mil veintiséis fue el primero con cuarenta y ocho selecciones, repartidas en doce grupos de cuatro. Pasaron los dos primeros de cada grupo y los ocho mejores terceros, y después todo fueron eliminatorias hasta la final.", min: 15, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "MUNDIAL 2026", c: AM, sz: 24, al: "c", at: 0 },
        { k: "caja", x: 20, y: 70, w: 270, h: 52, t: "48 selecciones", c: AZ, at: .1 }, { k: "caja", x: 310, y: 70, w: 270, h: 52, t: "12 grupos de 4", c: AZ, at: .25 },
        { k: "caja", x: 20, y: 140, w: 560, h: 52, t: "Pasan 2 por grupo + 8 mejores terceros = 32", c: VE, at: .45 },
        { k: "caja", x: 20, y: 210, w: 560, h: 52, t: "Dieciseisavos → Octavos → Cuartos → Semis → Final", c: "#ef4444", at: .7 }] },
    { say: "Y la Champions League actual tiene una liga de treinta y seis equipos, con ocho partidos para cada uno. Los ocho primeros pasan directos a octavos, y del noveno al vigésimo cuarto juegan una ronda previa para acompañarlos.", min: 14, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "CHAMPIONS LEAGUE", c: AM, sz: 24, al: "c", at: 0 },
        { k: "caja", x: 20, y: 70, w: 560, h: 46, t: "Liga de 36 equipos · 8 partidos cada uno", c: AZ, at: .1 },
        { k: "caja", x: 20, y: 130, w: 560, h: 46, t: "Puestos 1 a 8 → directos a octavos", c: VE, at: .35 },
        { k: "caja", x: 20, y: 190, w: 560, h: 46, t: "Puestos 9 a 24 → ronda previa (ida y vuelta)", c: "#a855f7", at: .55 },
        { k: "caja", x: 20, y: 250, w: 560, h: 42, t: "Puestos 25 a 36 → eliminados", c: "#ef4444", at: .75 }] },
    { say: "Ya conoces el camino: grupos, eliminatorias, prórroga, penaltis y final. ¡Ya puedes seguir cualquier torneo como un experto!", min: 6, limpia: true,
      items: [{ k: "texto", x: 300, y: 140, t: "¡A por la copa!  🏆", c: AM, sz: 38, al: "c", at: .1 }] },
  ],
};

/* ============ 3 · TARJETAS ============ */
const lista = (arr, x, y0, paso, c, at0, dat) => arr.map((t, i) => ({ k: "texto", x, y: y0 + i * paso, t, c, sz: 18, al: "l", at: at0 + i * dat }));
const tarjetas = {
  id: "tarjetas-amarillas-y-rojas", emoji: "🟨", titulo: "Tarjetas amarillas y rojas", desc: "Los principales motivos para cada tarjeta.", dur: "≈ 2 min", thumb: 2,
  escenas: [
    { say: "Las tarjetas son la forma que tiene el árbitro de sancionar la mala conducta. Hoy veremos qué se castiga con amarilla y qué con roja.", min: 6,
      items: [{ k: "texto", x: 300, y: 50, t: "LAS TARJETAS", c: AM, sz: 32, al: "c", at: .1 },
        { k: "tarjeta", x: 220, y: 175, c: "am", at: .35 }, { k: "tarjeta", x: 380, y: 175, c: "ro", at: .6 }, { k: "sonido", s: "silbato", at: .35 }] },
    { say: "La amarilla es una amonestación. Se enseña por una falta imprudente, por conducta antideportiva, por protestar al árbitro, por retrasar la reanudación del juego, por no respetar la distancia en una barrera o un córner, o por entrar o salir del campo sin permiso.", min: 17, limpia: true,
      items: [{ k: "tarjeta", x: 80, y: 130, c: "am", at: 0 }, { k: "texto", x: 80, y: 220, t: "AMARILLA", c: AM, sz: 18, al: "c", at: .05 },
        ...lista(["Falta imprudente (temeraria)", "Conducta antideportiva", "Protestar al árbitro", "Perder tiempo", "No respetar la distancia", "Entrar o salir sin permiso"], 170, 50, 40, BL, .12, .12)] },
    { say: "Ojo: dos amarillas en el mismo partido equivalen a una roja. El jugador se va del campo y su equipo se queda con uno menos, sin poder sustituirlo.", min: 10, limpia: true,
      items: [{ k: "texto", x: 300, y: 40, t: "2 AMARILLAS = ROJA", c: AM, sz: 26, al: "c", at: 0 },
        { k: "tarjeta", x: 150, y: 150, c: "am", at: .15 }, { k: "texto", x: 220, y: 156, t: "+", c: BL, sz: 36, al: "c", at: .3 }, { k: "tarjeta", x: 290, y: 150, c: "am", at: .35 },
        { k: "texto", x: 370, y: 156, t: "=", c: BL, sz: 36, al: "c", at: .55 }, { k: "tarjeta", x: 450, y: 150, c: "ro", at: .65 }, { k: "sonido", s: "silbato", at: .65 },
        { k: "texto", x: 300, y: 262, t: "Tu equipo juega con uno menos", c: "#ff8a8a", sz: 18, al: "c", at: .8 }] },
    { say: "La roja directa se enseña por juego brusco grave, por conducta violenta, por escupir o morder a alguien, por lanzar insultos o gestos ofensivos, o por impedir un gol o una ocasión manifiesta de gol con una falta o con la mano.", min: 17, limpia: true,
      items: [{ k: "tarjeta", x: 80, y: 130, c: "ro", at: 0 }, { k: "texto", x: 80, y: 220, t: "ROJA\nDIRECTA", c: "#ff7b7b", sz: 18, al: "c", at: .05 },
        ...lista(["Juego brusco grave", "Conducta violenta", "Escupir o morder", "Insultos o gestos ofensivos", "Evitar un gol con la mano", "Frenar una ocasión clara de gol"], 170, 50, 40, BL, .12, .12)] },
    { say: "En las entradas, la clave es la intensidad. Si es imprudente o temeraria, amarilla. Si se usa fuerza excesiva y se pone en peligro al rival, roja.", min: 10, limpia: true,
      items: [{ k: "texto", x: 300, y: 36, t: "LA ENTRADA", c: AM, sz: 24, al: "c", at: 0 },
        { k: "tarjeta", x: 110, y: 130, c: "am", at: .15 }, { k: "caja", x: 180, y: 90, w: 380, h: 80, t: "Imprudente o temeraria", c: AM, at: .25 },
        { k: "tarjeta", x: 110, y: 235, c: "ro", at: .5 }, { k: "caja", x: 180, y: 195, w: 380, h: 80, t: "Fuerza excesiva que pone en peligro", c: "#ef4444", at: .6 }] },
    { say: "Y recuerda: en muchas competiciones, acumular amarillas en distintos partidos lleva a una sanción. El número exacto depende de cada torneo.", min: 9, limpia: true,
      items: [{ k: "texto", x: 300, y: 36, t: "AMARILLAS ACUMULADAS", c: AM, sz: 24, al: "c", at: 0 },
        { k: "tarjeta", x: 120, y: 130, c: "am", at: .2 }, { k: "tarjeta", x: 220, y: 130, c: "am", at: .35 }, { k: "tarjeta", x: 320, y: 130, c: "am", at: .5 },
        { k: "texto", x: 300, y: 250, t: "…y llega el partido de sanción", c: "#ff8a8a", sz: 20, al: "c", at: .7 }] },
    { say: "Ya sabes cuándo se enseña cada tarjeta. ¡Y a ver si el árbitro acierta en el próximo partido!", min: 5, limpia: true,
      items: [{ k: "tarjeta", x: 260, y: 150, c: "am", at: .2 }, { k: "tarjeta", x: 340, y: 150, c: "ro", at: .4 }] },
  ],
};


/* Campo completo (3,9 px por metro): f(x, y) pasa de metros a pizarra. El equipo azul ataca hacia la derecha. */
const FX = 95, FY = 17.5, FE = 3.9;
const f = (x, y) => [FX + FE * x, FY + FE * y];
const F = (id, eq, x, y, n, at) => { const p = f(x, y); return { k: "jug", id, eq, x: p[0], y: p[1], n, at: at || 0 }; };
const CAMPO = { k: "campo", x0: FX, y0: FY, esc: FE };

/* ============ 4 · EL VAR ============ */
const var_ = {
  id: "como-funciona-el-var", emoji: "📺", titulo: "Cómo funciona el VAR", desc: "Quién lo maneja, cuándo puede intervenir y cómo se decide.", dur: "≈ 2 min", thumb: 2,
  escenas: [
    { say: "El VAR es el sistema de videoarbitraje. Hoy vemos qué es, quién lo maneja y en qué jugadas puede intervenir.", min: 5,
      items: [{ k: "texto", x: 300, y: 100, t: "EL VAR", c: AM, sz: 54, al: "c", at: .1 }, { k: "texto", x: 300, y: 170, t: "Video Assistant Referee", c: BL, sz: 22, al: "c", at: .5 }, { k: "texto", x: 300, y: 215, t: "📺", c: BL, sz: 38, al: "c", at: .7 }] },
    { say: "El árbitro principal sigue mandando en el campo. En una sala de vídeo, el VAR y sus ayudantes revisan las jugadas con muchas cámaras y le avisan por radio.", min: 9, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "¿QUIÉN ES QUIÉN?", c: AM, sz: 22, al: "c", at: 0 },
        { k: "caja", x: 30, y: 80, w: 230, h: 90, t: "Árbitro\nen el campo", c: AZ, at: .15 }, { k: "caja", x: 340, y: 80, w: 230, h: 90, t: "VAR y ayudantes\nen la sala de vídeo", c: "#a855f7", at: .35 },
        { k: "flecha", x1: 335, y1: 125, x2: 265, y2: 125, c: BL, at: .55, d: .15 }, { k: "texto", x: 300, y: 200, t: "radio", c: BL, sz: 16, al: "c", at: .65 },
        { k: "texto", x: 300, y: 255, t: "El que decide siempre es el árbitro", c: VE, sz: 18, al: "c", at: .8 }] },
    { say: "El VAR solo puede intervenir en cuatro tipos de jugadas: goles, penaltis, tarjetas rojas directas y confusiones de identidad al sancionar a un jugador.", min: 11, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "SOLO 4 SITUACIONES", c: AM, sz: 22, al: "c", at: 0 },
        { k: "caja", x: 40, y: 68, w: 240, h: 56, t: "1 · Goles", c: AZ, at: .12 }, { k: "caja", x: 320, y: 68, w: 240, h: 56, t: "2 · Penaltis", c: AZ, at: .3 },
        { k: "caja", x: 40, y: 150, w: 240, h: 70, t: "3 · Tarjetas rojas\ndirectas", c: "#ef4444", at: .5 }, { k: "caja", x: 320, y: 150, w: 240, h: 70, t: "4 · Confusión\nde jugador", c: "#a855f7", at: .7 }] },
    { say: "Para cambiar una decisión tiene que haber un error claro y evidente. Si la duda es pequeña, se mantiene lo que decidió el árbitro en el campo.", min: 9, limpia: true,
      items: [{ k: "texto", x: 300, y: 90, t: "ERROR CLARO\nY EVIDENTE", c: "#ff6b6b", sz: 40, al: "c", at: .1 }, { k: "marca", x: 300, y: 190, ok: false, at: .5 },
        { k: "texto", x: 300, y: 245, t: "Si hay duda, vale la decisión del árbitro", c: BL, sz: 18, al: "c", at: .7 }] },
    { say: "Mientras el juego sigue, el VAR comprueba cada jugada en silencio. Si ve un posible error, avisa al árbitro, que puede aceptar la información o ir a ver las imágenes en un monitor junto al campo.", min: 13, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "ASÍ SE REVISA", c: AM, sz: 22, al: "c", at: 0 },
        { k: "caja", x: 10, y: 100, w: 130, h: 80, t: "Jugada", c: AZ, at: .1 }, { k: "flecha", x1: 142, y1: 140, x2: 160, y2: 140, c: BL, at: .25, d: .06 },
        { k: "caja", x: 162, y: 100, w: 130, h: 80, t: "Revisión\nen silencio", c: "#a855f7", at: .3 }, { k: "flecha", x1: 294, y1: 140, x2: 312, y2: 140, c: BL, at: .45, d: .06 },
        { k: "caja", x: 314, y: 100, w: 130, h: 80, t: "¿Error claro?", c: "#f59e0b", at: .5 }, { k: "flecha", x1: 446, y1: 140, x2: 464, y2: 140, c: BL, at: .65, d: .06 },
        { k: "caja", x: 466, y: 100, w: 124, h: 80, t: "Decide el\nárbitro", c: VE, at: .7 }, { k: "texto", x: 300, y: 235, t: "A veces, tras ver el monitor", c: BL, sz: 16, al: "c", at: .85 }] },
    { say: "Cuando el árbitro va al monitor, dibuja un rectángulo en el aire con las dos manos, como una pantalla. Después, señala si hay gol, penalti o si todo sigue igual.", min: 11, limpia: true,
      items: [{ k: "caja", x: 170, y: 60, w: 260, h: 150, t: "", c: "#fff", fill: 0, at: .1, d: .3 }, { k: "texto", x: 300, y: 135, t: "TV", c: AM, sz: 54, al: "c", at: .5 },
        { k: "texto", x: 300, y: 250, t: "La señal de la revisión", c: BL, sz: 20, al: "c", at: .7 }, { k: "sonido", s: "silbato", at: .1 }] },
    { say: "En el fuera de juego hay además líneas virtuales y, en algunas competiciones, cámaras con un sistema semiautomático que ayuda a decidir mucho más rápido.", min: 10, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "FUERA DE JUEGO Y TECNOLOGÍA", c: AM, sz: 20, al: "c", at: 0 },
        { k: "caja", x: 30, y: 80, w: 250, h: 70, t: "Líneas virtuales", c: AZ, at: .15 }, { k: "caja", x: 320, y: 80, w: 250, h: 70, t: "Cámaras y sistema\nsemiautomático", c: "#a855f7", at: .4 },
        { k: "texto", x: 300, y: 215, t: "Decisiones más rápidas", c: VE, sz: 22, al: "c", at: .7 }] },
    { say: "Ahora ya sabes qué hace el VAR: ayuda al árbitro, pero no lo sustituye. La próxima vez que veas el rectángulo en el aire, sabrás lo que está pasando.", min: 8, limpia: true,
      items: [{ k: "texto", x: 300, y: 130, t: "El VAR ayuda,\nno sustituye", c: AM, sz: 38, al: "c", at: .1 }, { k: "texto", x: 300, y: 235, t: "📺", c: BL, sz: 36, al: "c", at: .6 }] },
  ],
};

/* ============ 5 · POSICIONES Y FORMACIONES ============ */
const posiciones = {
  id: "posiciones-y-formaciones", emoji: "🧩", titulo: "Posiciones y formaciones", desc: "Qué hace cada jugador y qué significan el 4-4-2 o el 4-3-3.", dur: "≈ 2 min", thumb: 5,
  escenas: [
    { say: "En un equipo de fútbol cada jugador tiene una misión. Vamos a ver las posiciones y qué significan los números de las formaciones, como el cuatro-tres-tres.", min: 8,
      items: [CAMPO, { k: "texto", id: "tp", x: 300, y: 150, t: "POSICIONES Y\nFORMACIONES", c: AM, sz: 30, al: "c", at: .3 }] },
    { say: "El portero es el único jugador que puede usar las manos, y solo dentro de su área. Es la última línea de defensa y también empieza muchas jugadas.", min: 9, señala: "gk",
      items: [{ k: "borra", id: "tp", at: 0 }, F("gk", "p", 6, 34, "1", .1), { k: "foco", id: "fg", x: f(6, 34)[0], y: f(6, 34)[1], r: 20, c: AM, at: .3 }, { k: "texto", id: "tl1", x: f(6, 34)[0] + 60, y: f(6, 34)[1] - 40, t: "Portero", c: AM, sz: 20, al: "l", at: .5 }] },
    { say: "Los defensas protegen la portería. Los centrales juegan por el centro, y los laterales por las bandas, y también ayudan a atacar.", min: 9, señala: "d2",
      items: [{ k: "borra", id: "tl1", at: 0 }, { k: "borra", id: "fg", at: 0 }, F("d1", "a", 22, 9, "3", .1), F("d2", "a", 19, 26, "4", .25), F("d3", "a", 19, 42, "5", .4), F("d4", "a", 22, 59, "2", .55),
        { k: "texto", id: "tl2", x: f(30, 34)[0], y: f(30, 34)[1] - 6, t: "Defensas", c: AM, sz: 20, al: "l", at: .7 }] },
    { say: "Los centrocampistas conectan la defensa con el ataque. Recuperan el balón, reparten juego y llegan también al área rival.", min: 8, señala: "m2",
      items: [{ k: "borra", id: "tl2", at: 0 }, F("m1", "a", 42, 18, "8", .1), F("m2", "a", 38, 34, "6", .25), F("m3", "a", 42, 50, "10", .4), { k: "texto", id: "tl3", x: f(47, 34)[0], y: f(47, 34)[1] + 4, t: "Centrocampistas", c: AM, sz: 20, al: "l", at: .6 }] },
    { say: "Los delanteros, con extremos por fuera y un delantero centro, tienen la misión de marcar goles.", min: 7, señala: "f2",
      items: [{ k: "borra", id: "tl3", at: 0 }, F("f1", "a", 70, 12, "11", .1), F("f2", "a", 74, 34, "9", .25), F("f3", "a", 70, 56, "7", .4), { k: "texto", id: "tl4", x: f(88, 34)[0], y: f(88, 34)[1], t: "Delanteros", c: AM, sz: 20, al: "r", at: .6 }] },
    { say: "Los números de una formación cuentan los jugadores de campo, de atrás hacia delante, sin el portero. El cuatro-tres-tres son cuatro defensas, tres centrocampistas y tres delanteros.", min: 11,
      items: [{ k: "borra", id: "tl4", at: 0 }, { k: "texto", x: 300, y: 20, t: "4 – 3 – 3", c: AM, sz: 30, al: "c", at: .1 }, { k: "foco", x: f(19, 34)[0], y: f(19, 34)[1], r: 80, c: VE, at: .35 }, { k: "texto", x: 300, y: 292, t: "4 defensas · 3 medios · 3 delanteros", c: BL, sz: 15, al: "c", at: .7 }] },
    { say: "Otras formaciones famosas son el cuatro-cuatro-dos, equilibrada y con dos delanteros, y el tres-cinco-dos, con tres centrales y carrileros que suben y bajan por las bandas.", min: 12, limpia: true,
      items: [{ k: "texto", x: 300, y: 34, t: "OTRAS FORMACIONES", c: AM, sz: 22, al: "c", at: 0 },
        { k: "caja", x: 40, y: 70, w: 520, h: 56, t: "4-4-2 · Equilibrada, con dos delanteros", c: AZ, at: .15 }, { k: "caja", x: 40, y: 140, w: 520, h: 56, t: "4-3-3 · Ataque con extremos", c: AZ, at: .4 },
        { k: "caja", x: 40, y: 210, w: 520, h: 56, t: "3-5-2 · Tres centrales y carrileros", c: AZ, at: .65 }] },
    { say: "Cada entrenador elige la formación según sus jugadores y el rival. Y ahora, cuando oigas hablar de un cuatro-cuatro-dos, ya sabrás exactamente de qué hablan.", min: 8, limpia: true,
      items: [{ k: "texto", x: 300, y: 130, t: "Cada entrenador\nelige su dibujo", c: AM, sz: 34, al: "c", at: .1 }, { k: "texto", x: 300, y: 235, t: "🧩", c: BL, sz: 36, al: "c", at: .6 }] },
  ],
};

/* ============ 6 · REGLAS BÁSICAS ============ */
const reglas = {
  id: "reglas-basicas-del-futbol", emoji: "📏", titulo: "Las reglas básicas del fútbol", desc: "Campo, jugadores, tiempo, gol y saques en dos minutos.", dur: "≈ 2 min", thumb: 4,
  escenas: [
    { say: "Si nunca has visto un partido, este vídeo es para ti: las reglas básicas del fútbol explicadas en dos minutos.", min: 6,
      items: [CAMPO, { k: "texto", id: "tr", x: 300, y: 150, t: "REGLAS BÁSICAS\nDEL FÚTBOL", c: AM, sz: 32, al: "c", at: .3 }] },
    { say: "El campo es un rectángulo de entre noventa y ciento veinte metros de largo y entre cuarenta y cinco y noventa de ancho. En partidos internacionales las medidas son algo más ajustadas.", min: 11,
      items: [{ k: "borra", id: "tr", at: 0 }, { k: "texto", x: 300, y: 10, t: "largo: 90 – 120 m", c: AM, sz: 16, al: "c", at: .2 }, { k: "texto", x: 62, y: 150, t: "ancho:\n45 – 90 m", c: AM, sz: 14, al: "c", at: .5 }] },
    { say: "Cada equipo juega con once jugadores, uno de ellos portero. Si un equipo se queda con menos de siete, el partido no puede continuar.", min: 9, limpia: true,
      items: [{ k: "texto", x: 300, y: 36, t: "11 CONTRA 11", c: AM, sz: 30, al: "c", at: 0 }, { k: "caja", x: 60, y: 80, w: 480, h: 56, t: "11 jugadores por equipo, 1 de ellos portero", c: AZ, at: .2 },
        { k: "caja", x: 60, y: 156, w: 480, h: 56, t: "Con menos de 7, el partido se suspende", c: "#ef4444", at: .55 }] },
    { say: "Un partido dura noventa minutos, en dos tiempos de cuarenta y cinco, con un descanso de hasta quince minutos. El árbitro añade al final de cada tiempo el tiempo perdido.", min: 12, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "EL TIEMPO", c: AM, sz: 24, al: "c", at: 0 },
        { k: "caja", x: 20, y: 90, w: 150, h: 90, t: "1.ª parte\n45 min", c: AZ, at: .15 }, { k: "caja", x: 190, y: 90, w: 130, h: 90, t: "Descanso\n≤ 15 min", c: "#a855f7", at: .35 },
        { k: "caja", x: 340, y: 90, w: 150, h: 90, t: "2.ª parte\n45 min", c: AZ, at: .55 }, { k: "caja", x: 505, y: 90, w: 85, h: 90, t: "+ añadido", c: "#f59e0b", at: .8 }] },
    { say: "Es gol cuando el balón cruza entera la línea de meta, entre los postes y por debajo del larguero. La portería mide siete metros treinta y dos de ancho por dos metros cuarenta y cuatro de alto.", min: 13, limpia: true,
      items: [{ k: "caja", x: 120, y: 70, w: 360, h: 130, t: "", c: "#fff", fill: 0, at: .1, d: .3 }, { k: "texto", x: 300, y: 225, t: "7,32 m", c: AM, sz: 22, al: "c", at: .5 },
        { k: "texto", x: 82, y: 135, t: "2,44 m", c: AM, sz: 18, al: "c", at: .6 }, { k: "balon", id: "bg", x: 300, y: 150, at: .75 }, { k: "texto", x: 300, y: 36, t: "¡GOL!", c: VE, sz: 28, al: "c", at: .85 }] },
    { say: "Cuando el balón sale, hay un saque. Si sale por el lateral, saque de banda. Si sale por la línea de meta, saque de esquina si lo tocó último un defensor, o saque de puerta si lo tocó último un atacante.", min: 14, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "CUANDO EL BALÓN SALE", c: AM, sz: 22, al: "c", at: 0 },
        { k: "caja", x: 30, y: 70, w: 540, h: 56, t: "Por el lateral → saque de banda", c: AZ, at: .15 }, { k: "caja", x: 30, y: 140, w: 540, h: 56, t: "Por el fondo, último toque defensor → córner", c: "#a855f7", at: .4 },
        { k: "caja", x: 30, y: 210, w: 540, h: 56, t: "Por el fondo, último toque atacante → saque de puerta", c: "#f59e0b", at: .65 }] },
    { say: "Las faltas se castigan con tiro libre y, si ocurren dentro del área del equipo que defiende, con penalti. Un tiro libre directo puede ser gol directamente; en uno indirecto, otro jugador debe tocar antes el balón.", min: 14, limpia: true,
      items: [{ k: "texto", x: 300, y: 32, t: "LAS FALTAS", c: AM, sz: 24, al: "c", at: 0 },
        { k: "caja", x: 30, y: 70, w: 540, h: 56, t: "Falta fuera del área → tiro libre", c: AZ, at: .15 }, { k: "caja", x: 30, y: 140, w: 540, h: 56, t: "Falta dentro del área → penalti", c: "#ef4444", at: .4 },
        { k: "texto", x: 300, y: 240, t: "Directo: puede ser gol · Indirecto: otro toca antes", c: BL, sz: 16, al: "c", at: .7 }, { k: "sonido", s: "silbato", at: .4 }] },
    { say: "Y eso es lo esencial. Con estas reglas ya puedes seguir cualquier partido. ¡A disfrutar del fútbol!", min: 6, limpia: true,
      items: [{ k: "texto", x: 300, y: 135, t: "¡Ya puedes\nver un partido!", c: AM, sz: 38, al: "c", at: .1 }, { k: "texto", x: 300, y: 240, t: "⚽", c: BL, sz: 36, al: "c", at: .6 }] },
  ],
};

export const LECCIONES = [fuera, torneo, tarjetas, var_, posiciones, reglas];
