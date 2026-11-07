# -*- coding: utf-8 -*-
"""Artículos largos (parte E, 7-nov-2026). Guías de explicación (reglas, posiciones, tácticas, árbitros, balón y formatos).
Texto propio de TIKITEXTO, basado en información pública del IFAB, la FIFA y la UEFA."""

REGLAS = dict(
    slug="reglas-basicas-del-futbol-para-principiantes",
    titulo="Reglas básicas del fútbol explicadas para principiantes",
    desc="Guía sencilla de las reglas del fútbol: cuántos jugadores hay, cuánto dura un partido, qué es un córner, un saque de banda o una falta, cuándo se saca tarjeta y cómo se decide un empate.",
    resumen="Si nunca has seguido un partido o quieres explicárselo a alguien, esta guía repasa en lenguaje llano las reglas esenciales del fútbol: el campo, los jugadores, la duración, las faltas, las tarjetas y las formas de reanudar el juego.",
    secciones=[
        ("Quién escribe las reglas", [
            "Las reglas del fútbol se llaman oficialmente Reglas de Juego y son 17. Las mantiene el IFAB (International Football Association Board), un organismo creado en 1886 por las federaciones de Inglaterra, Escocia, Gales e Irlanda, al que más tarde se unió la FIFA. Cada año el IFAB revisa el reglamento y publica los cambios que entran en vigor en la temporada siguiente.",
            "Por eso un partido se juega igual en un parque que en la final de un Mundial, con pequeñas diferencias en competiciones infantiles o aficionadas. Lo que cambia entre torneos suelen ser detalles organizativos: cuántos cambios se permiten, cómo se desempata o si hay prórroga.",
        ]),
        ("El campo, el balón y la portería", [
            "El campo es un rectángulo de césped natural o artificial con una línea de banda en cada lateral, una línea de meta en cada fondo y una línea central que lo divide en dos mitades. En competiciones internacionales mide entre 100 y 110 metros de largo y entre 64 y 75 de ancho. Alrededor de cada portería hay dos rectángulos: el área pequeña y, más grande, el área de penalti.",
            "La portería mide 7,32 metros de ancho por 2,44 de alto, con dos postes, un larguero y una red. El balón es esférico, con una circunferencia de entre 68 y 70 centímetros y un peso inicial de entre 410 y 450 gramos. Para marcar gol, el balón debe cruzar por completo la línea de meta, entre los palos y bajo el larguero.",
        ]),
        ("Jugadores, tiempo y cambios", [
            "Cada equipo juega con once jugadores, uno de ellos portero, que es el único autorizado a tocar el balón con las manos y solo dentro de su área. Un partido no puede empezar ni continuar si un equipo tiene menos de siete jugadores.",
            "Un partido de adultos dura 90 minutos, divididos en dos partes de 45 con un descanso de unos 15. El árbitro añade al final de cada parte el tiempo perdido por lesiones, cambios o interrupciones. En las eliminatorias que no admiten empate se juega una prórroga de dos partes de 15 minutos y, si sigue el empate, se decide en una tanda de penaltis. Hoy la mayoría de grandes competiciones permiten hasta cinco cambios por equipo, aunque el número exacto depende de cada torneo.",
        ]),
        ("Cómo se reanuda el juego", [
            "Cuando el balón sale por la línea de banda, se saca de banda con las manos desde el punto por donde salió, con los dos pies en el suelo y el balón pasando por encima de la cabeza. Si sale por la línea de meta tras tocarlo un jugador del equipo defensor, se concede un córner al ataque. Si lo tocó un atacante, se saca de puerta con el balón en el área pequeña.",
            "Al empezar cada parte y después de cada gol se saca desde el centro del campo. Cuando el árbitro detiene el juego sin que haya falta, lo reanuda con un balón a tierra, soltando la pelota para que se dispute.",
        ]),
        ("Faltas, penaltis y tarjetas", [
            "Una falta es una acción ilegal: empujar, zancadillear, agarrar, entrar con fuerza excesiva o tocar el balón con la mano de forma voluntaria. Se castiga con un tiro libre para el equipo contrario. Si la falta ocurre dentro del área del infractor, la sanción es un penalti: un lanzamiento desde once metros de la portería, solo con el portero defendiendo.",
            "El árbitro puede mostrar tarjeta amarilla, que es una amonestación, o tarjeta roja, que supone la expulsión. Dos amarillas en el mismo partido equivalen a una roja. Se expulsa directamente por juego brusco grave, conducta violenta, escupir, impedir una ocasión clara de gol de forma antirreglamentaria o insultar de manera ofensiva. El equipo del expulsado juega con uno menos y no puede sustituirle.",
        ]),
        ("El fuera de juego y la regla de la cesión", [
            "El fuera de juego se pita cuando un atacante recibe el balón estando más cerca de la línea de meta contraria que el balón y que el penúltimo adversario, y participa en la jugada. No hay fuera de juego en los saques de banda, de puerta ni de esquina. Es la regla más discutida del fútbol, y en TIKITEXTO tienes un artículo dedicado a su historia y a cómo la revisa el VAR.",
            "Otra regla útil es la cesión al portero: desde 1992, el portero no puede coger con las manos un pase hecho con el pie por un compañero, lo que obligó a los porteros a mejorar su juego con los pies y aceleró el fútbol.",
        ]),
        ("Cómo se decide quién gana", [
            "Gana el equipo que marca más goles. En una liga, la victoria da tres puntos, el empate uno y la derrota ninguno, y el campeón es quien más puntos suma al final de la temporada. En una copa o una eliminatoria se pasa de ronda ganando, y si hay empate se recurre a la prórroga y a los penaltis. Si quieres comprobar lo que has aprendido, puedes jugar a adivinar el jugador, el club o la selección en los juegos de TIKITEXTO.",
        ]),
    ],
    fuentes=[("IFAB (Reglas de Juego)", "https://www.theifab.com/"), ("FIFA.com", "https://www.fifa.com/"), ("UEFA.com", "https://www.uefa.com/")],
    relac=["fuera-de-juego-regla-historia-var", "quien-es-quien-en-un-partido-arbitros-y-senales", "formatos-de-competicion-liga-copa-y-playoff"],
    faq=[("¿Cuántos jugadores hay en un equipo de fútbol?", "", "Once en el campo, uno de ellos portero. Además hay suplentes en el banquillo según permita cada competición.", ""),
         ("¿Cuánto dura un partido de fútbol?", "", "90 minutos en dos partes de 45, más el tiempo añadido por el árbitro. En eliminatorias, si hay empate, se juegan 30 minutos de prórroga y después penaltis.", ""),
         ("¿Cuándo se saca tarjeta roja?", "", "Por juego brusco grave, conducta violenta, escupir, impedir una ocasión clara de gol de forma antirreglamentaria, insultar de manera ofensiva o acumular dos amarillas.", "")],
)

POSICIONES = dict(
    slug="posiciones-del-futbol-que-hace-cada-jugador",
    titulo="Posiciones del fútbol: qué hace cada jugador sobre el campo",
    desc="Portero, centrales, laterales, pivote, interior, extremo y delantero: qué hace cada posición del fútbol, qué dorsales llevaban tradicionalmente y por qué se habla de falso nueve o carrilero.",
    resumen="Un equipo de once jugadores se organiza en líneas con funciones distintas. Este artículo explica, en lenguaje sencillo, qué hace cada posición, qué cualidades piden y cómo han cambiado los roles con la táctica moderna.",
    secciones=[
        ("Por qué existen las posiciones", [
            "En los primeros años del fútbol, casi todo el mundo atacaba y casi todo el mundo defendía. Con el tiempo, los equipos descubrieron que repartir tareas daba ventaja: unos jugadores se centran en evitar goles, otros en conectar el juego y otros en marcarlos. Eso dio lugar a las líneas clásicas: portería, defensa, mediocampo y delantera.",
            "Las posiciones no son una jaula. Un lateral sube a atacar, un delantero baja a recuperar el balón y un portero participa en la salida con los pies. Pero entender el papel básico de cada puesto ayuda a seguir un partido y a leer una alineación.",
        ]),
        ("El portero", [
            "Es el único jugador que puede usar las manos, siempre dentro de su área. Su misión principal es parar los disparos y evitar el gol, pero también dirige a la defensa, sale a cortar centros y, cada vez más, inicia el juego con pases largos o cortos. Las cualidades clave son los reflejos, la colocación, la valentía y una buena comunicación con sus compañeros.",
        ]),
        ("Defensas: centrales y laterales", [
            "Los centrales protegen la zona más peligrosa, delante del portero. Despejan balones, ganan duelos aéreos y cortan a los delanteros rivales; en los equipos modernos también deben saber sacar el balón jugado. Suelen ser jugadores altos, fuertes y con buena lectura del juego.",
            "Los laterales ocupan las bandas de la defensa. Defienden a los extremos rivales, pero también suben por el costado para centrar o crear superioridad en ataque. Por eso necesitan resistencia: recorren muchos kilómetros por partido. En los esquemas con cinco defensas aparecen los carrileros, que cubren toda la banda y mezclan funciones de lateral y extremo.",
        ]),
        ("Centrocampistas: el motor del equipo", [
            "El pivote o mediocentro defensivo se coloca delante de la defensa. Rompe los ataques rivales, reparte el primer pase y da equilibrio al equipo. Los interiores o centrocampistas centrales unen defensa y ataque: recuperan, distribuyen y se incorporan al área. El mediapunta o media punta se sitúa detrás del delantero y se dedica a crear: busca el último pase, dispara desde fuera y encuentra espacios entre líneas.",
            "En el centro del campo se decide el control del partido. Un equipo que domina esta zona suele tener más posesión y más ocasiones.",
        ]),
        ("Atacantes: extremos y delanteros", [
            "Los extremos juegan abiertos, pegados a la banda. Su trabajo es regatear al lateral, centrar al área o cerrarse hacia dentro para disparar. Los delanteros centro son los especialistas en marcar: se mueven en el área, rematan de cabeza o de pie y fijan a los centrales rivales. Algunos equipos usan un segundo punta, que juega junto al delantero y se mueve entre líneas.",
            "Existe también el llamado falso nueve: un delantero que, en vez de quedarse en el área, retrocede al centro del campo para recibir, crear superioridad y dejar a los centrales sin referencia. Es una idea táctica que se hizo muy popular a partir de finales de la primera década de este siglo.",
        ]),
        ("Si estás empezando a jugar", [
            "En el fútbol base, los entrenadores suelen rotar a los niños por varias posiciones antes de especializarles. Es una buena idea: jugar de defensa enseña a leer al delantero, jugar de delantero enseña a anticipar al defensor y pasar por el centro del campo obliga a mirar el juego en todas las direcciones.",
            "Para elegir tu sitio, pregúntate qué disfrutas más. Si te gusta anticipar y mandar, quizá seas central o pivote; si te atraen el regate y la velocidad, extremo; si prefieres el último pase, mediapunta; y si lo tuyo es el remate, delantero centro. Lo importante es que la posición se adapte a tus cualidades y que te diviertas.",
        ]),
        ("Los números tradicionales", [
            "Durante décadas, los dorsales del 1 al 11 indicaban la posición: el 1 para el portero, el 2 y el 3 para los laterales, el 4 y el 5 para los centrales o el centro del campo, el 9 para el delantero centro y el 10 para el jugador creativo. Hoy cada jugador elige su número con más libertad, pero esa tradición sigue viva, y por eso se dice «el 9» para hablar de un goleador o «el 10» para un genio del pase. Tienes más detalles en nuestro artículo sobre la historia de los dorsales.",
        ]),
        ("Cómo se ve esto en el juego", [
            "Al escribir una alineación se suele indicar la formación, como 4-3-3 o 4-4-2, en la que los números cuentan los jugadores de cada línea sin contar al portero. Esa es la base de la táctica, de la que hablamos en otro artículo. Para practicar con nombres reales, puedes jugar a adivinar el futbolista en TIKITEXTO y fijarte en qué posición ocupa cada uno.",
        ]),
    ],
    fuentes=[("FIFA.com", "https://www.fifa.com/"), ("UEFA.com", "https://www.uefa.com/"), ("IFAB (Reglas de Juego)", "https://www.theifab.com/")],
    relac=["reglas-basicas-del-futbol-para-principiantes", "formaciones-tacticas-442-433-explicadas", "numeros-camiseta-dorsales-historia"],
    faq=[("¿Cuántas posiciones hay en el fútbol?", "", "Las básicas son cuatro líneas: portero, defensas, centrocampistas y delanteros. Dentro de ellas hay roles más específicos: central, lateral, carrilero, pivote, interior, mediapunta, extremo y delantero centro.", ""),
         ("¿Qué es un falso nueve?", "", "Un delantero que retrocede al centro del campo en lugar de quedarse en el área, para crear superioridad y descolocar a los centrales rivales.", ""),
         ("¿Qué hace un pivote?", "", "Se coloca delante de la defensa, corta los ataques rivales y reparte el primer pase. Da equilibrio entre defensa y mediocampo.", "")],
)

FORMACIONES = dict(
    slug="formaciones-tacticas-442-433-explicadas",
    titulo="Formaciones tácticas del fútbol: 4-4-2, 4-3-3 y 3-5-2 explicadas",
    desc="Qué significan los números de una formación, cómo funcionan el 4-4-2, el 4-3-3, el 4-2-3-1 o el 3-5-2 y cómo han evolucionado los esquemas tácticos del fútbol desde el WM hasta hoy.",
    resumen="Cuando se anuncia que un equipo juega en 4-3-3 o 3-5-2, se describe cómo se reparten los jugadores sobre el campo. Esta guía explica cómo leer una formación y qué ventajas y riesgos tiene cada esquema.",
    secciones=[
        ("Cómo se lee una formación", [
            "Una formación es un código de números que cuenta los jugadores de campo de cada línea, de atrás hacia delante, sin incluir al portero. Un 4-4-2 significa cuatro defensas, cuatro centrocampistas y dos delanteros. Un 4-2-3-1 divide el centro en dos capas: dos pivotes y tres jugadores creativos detrás de un único delantero.",
            "Las formaciones son un punto de partida, no una fotografía fija. Durante el partido, los jugadores se mueven: un 4-3-3 con balón puede parecer un 3-4-3 y, sin él, convertirse en un 4-5-1. Por eso los entrenadores hablan de sistemas con y sin balón.",
        ]),
        ("De la pirámide al WM", [
            "En los primeros años del fútbol, el esquema habitual era muy ofensivo: dos defensas, tres medios y cinco delanteros. Un cambio en el reglamento del fuera de juego en 1925 redujo de tres a dos el número de adversarios que debía haber entre el atacante y la línea de meta, lo que provocó muchos más goles. Herbert Chapman, entrenador del Arsenal, respondió retrasando a un centrocampista para formar una línea de tres defensas. Nació el sistema WM, llamado así por la forma que dibujaban los jugadores sobre la pizarra.",
            "El WM dominó el fútbol europeo durante años y es el antecedente directo de las defensas con tres o cuatro jugadores de hoy.",
        ]),
        ("4-4-2: el clásico", [
            "El 4-4-2 es seguramente la formación más extendida de la historia. Tiene dos líneas muy ordenadas de cuatro jugadores, lo que facilita defender en bloque, y dos delanteros que se acompañan. Sus puntos fuertes son el equilibrio y la sencillez. Su punto débil es que puede quedar corto en el centro del campo frente a equipos con tres centrocampistas.",
            "En los años ochenta y noventa, el Milan de Arrigo Sacchi lo convirtió en una máquina de presión alta y marcaje en zona, y desde entonces se estudia como ejemplo de equipo compacto.",
        ]),
        ("4-3-3: el ataque con extremos", [
            "El 4-3-3 apuesta por tres centrocampistas y tres atacantes: un delantero centro y dos extremos. Ofrece superioridad en el medio y mucha amplitud en ataque. Es la formación de los equipos que quieren dominar el balón. Su riesgo está en los espacios que dejan los extremos al defender, que obliga a los centrocampistas y laterales a cubrir mucho terreno.",
        ]),
        ("4-2-3-1 y 3-5-2", [
            "El 4-2-3-1 se hizo muy popular a partir de los años 2000. Con dos pivotes protegiendo a la defensa y tres jugadores creativos detrás del delantero, combina seguridad y creación. Funciona especialmente bien cuando hay un mediapunta con visión de juego.",
            "El 3-5-2 usa tres centrales, cinco centrocampistas (dos de ellos carrileros) y dos delanteros. Tiene mucha presencia en el centro y las bandas, pero exige carrileros incansables y centrales rápidos para cubrir los espacios que dejan detrás. También se escribe 5-3-2 cuando los carrileros se pegan a la defensa.",
        ]),
        ("Más allá de los números: bloques y presión", [
            "Dos equipos con el mismo 4-4-2 pueden jugar de forma muy distinta. La diferencia está en la altura del bloque: un bloque alto presiona cerca de la portería rival y deja mucho espacio a la espalda de la defensa; un bloque bajo espera cerca del propio área y busca salir al contraataque. En medio queda el bloque medio, que cede la primera línea y cierra los pasillos interiores.",
            "También importa lo que ocurre justo después de perder el balón. El gegenpressing, popularizado por entrenadores alemanes como Jürgen Klopp, consiste en presionar de inmediato para recuperarlo antes de que el rival se organice. Es una idea de comportamiento, no de dibujo, y puede aplicarse con casi cualquier formación.",
            "Por eso, cuando veas una alineación en la tele, conviene mirar no solo los números sino también dónde se colocan los jugadores cuando el equipo defiende y cuando ataca.",
        ]),
        ("Otras ideas importantes", [
            "Algunos hitos tácticos: el 4-2-4 de la selección de Brasil en el Mundial de 1958; el «catenaccio» del Inter de Helenio Herrera en los años sesenta, que reforzaba la defensa con un líbero; y el «fútbol total» del Ajax y de la selección de los Países Bajos en los setenta, donde los jugadores intercambiaban posiciones sin perder la estructura.",
            "Hoy la mayoría de entrenadores combinan ideas: presión tras pérdida, laterales que se convierten en centrocampistas y delanteros que bajan a asociarse. Una buena forma de ver tácticas en acción es repasar las finales de la Champions League y los Mundiales, que repasamos en nuestras páginas de historia.",
        ]),
    ],
    fuentes=[("UEFA.com", "https://www.uefa.com/"), ("FIFA.com", "https://www.fifa.com/"), ("The Football Association", "https://www.thefa.com/")],
    relac=["posiciones-del-futbol-que-hace-cada-jugador", "fuera-de-juego-regla-historia-var", "champions-20-anos"],
    faq=[("¿Qué significa 4-3-3?", "", "Cuatro defensas, tres centrocampistas y tres delanteros, sin contar al portero.", ""),
         ("¿Cuál es la mejor formación del fútbol?", "", "Ninguna lo es de forma absoluta. Depende de los jugadores disponibles y del estilo del entrenador: el 4-4-2 da equilibrio, el 4-3-3 domina el balón y el 3-5-2 refuerza el centro.", ""),
         ("¿Qué es el sistema WM?", "", "Un esquema creado en Inglaterra en los años veinte y treinta con tres defensas, dos interiores, dos medios y tres delanteros, nacido tras el cambio del fuera de juego de 1925.", "")],
)

ARBITROS = dict(
    slug="quien-es-quien-en-un-partido-arbitros-y-senales",
    titulo="Quién es quién en un partido: árbitros, asistentes, VAR y señales básicas",
    desc="Qué hace el árbitro, los asistentes, el cuarto árbitro y el VAR; qué significan las señales del árbitro, por qué existen las tarjetas y cómo funcionan la tecnología de línea de gol y el spray evanescente.",
    resumen="Un partido profesional lo supervisa un equipo arbitral completo. Esta guía explica qué hace cada uno, qué señales se ven más a menudo y para qué sirve la tecnología que ayuda a decidir.",
    secciones=[
        ("El equipo arbitral", [
            "En un partido profesional hay un árbitro principal, que dirige el juego y toma las decisiones sobre el campo, y dos árbitros asistentes, que se colocan en las bandas con una bandera para señalar fueras de juego, saques de banda, córners y de puerta. A ellos se suma un cuarto árbitro, que controla los cambios, el tiempo añadido y la zona técnica de los banquillos.",
            "Desde que se introdujo la ayuda por vídeo, el equipo se completa con el VAR (Video Assistant Referee) y, en muchos torneos, un asistente del VAR. Estos jueces trabajan en una sala de vídeo y comunican con el árbitro por radio.",
        ]),
        ("Qué mide el árbitro", [
            "El árbitro aplica las Reglas de Juego, controla el tiempo, anota los goles y las sanciones y decide cuándo parar el partido. Lleva un silbato, un reloj, un set de tarjetas amarilla y roja y, en muchos partidos, un spray evanescente para marcar la distancia de la barrera en los tiros libres.",
            "Tiene la ley de la ventaja: si una infracción no perjudica al equipo que la sufre, puede dejar seguir el juego. Para señalarlo, extiende los dos brazos hacia delante.",
        ]),
        ("Las señales más habituales", [
            "El árbitro señala un tiro libre directo apuntando con el brazo en la dirección en que atacará el equipo beneficiado. Si el tiro libre es indirecto, levanta el brazo por encima de la cabeza y lo mantiene hasta que alguien toque el balón. Para un penalti, señala con el dedo el punto de penalti. Para un córner, apunta con el brazo hacia la esquina correspondiente.",
            "Los asistentes levantan la bandera cuando ven un fuera de juego y, según su posición, indican de qué lado se reanuda el juego. Un cuarto árbitro muestra un panel luminoso con los cambios y los minutos de añadido.",
        ]),
        ("De dónde vienen las tarjetas", [
            "Las tarjetas amarilla y roja se usaron por primera vez en el Mundial de México 1970. La idea fue de Ken Aston, un árbitro inglés que dirigía el cuerpo arbitral de la FIFA. Se cuenta que se le ocurrió mirando un semáforo: amarillo para avisar y rojo para detenerse. Antes, un árbitro tenía que amonestar o expulsar de viva voz, lo que producía confusión cuando los jugadores no entendían el idioma.",
            "Hoy una tarjeta es universal. El jugador amonestado queda advertido y una segunda amarilla en el mismo partido se convierte en roja. En muchas competiciones, acumular un número de amarillas implica un partido de sanción.",
        ]),
        ("Tecnología que ayuda al árbitro", [
            "La tecnología de línea de gol, aprobada por el IFAB en 2012, avisa al árbitro mediante un reloj cuando el balón ha cruzado por completo la línea. Se usó por primera vez en un Mundial en 2014. El VAR se aprobó en 2018 y se estrenó en una Copa del Mundo ese mismo año en Rusia. Solo se revisa un conjunto limitado de decisiones: goles (y las infracciones que los preceden), penaltis, tarjetas rojas directas y confusiones de identidad.",
            "El fuera de juego semiautomático, que usa cámaras y un sensor dentro del balón, se estrenó en el Mundial de 2022. Mide la posición del cuerpo de los jugadores y ayuda a decidir más rápido. Si quieres saber más sobre cómo se revisa un fuera de juego, tienes un artículo completo en TIKITEXTO.",
        ]),
        ("El tiempo añadido", [
            "El árbitro no para el reloj durante el partido: el tiempo corre sin detenerse y, al final de cada parte, se compensa lo que se ha perdido en lesiones, cambios, celebraciones de goles y otras interrupciones. El cuarto árbitro muestra en un panel luminoso el mínimo de minutos añadidos, aunque el árbitro puede alargarlo si el juego vuelve a detenerse.",
            "En el Mundial de 2022 se hizo muy visible una indicación del responsable arbitral de la FIFA, Pierluigi Collina: calcular con más precisión el tiempo perdido. Por eso hubo partidos con añadidos de diez minutos o más, algo poco habitual hasta entonces.",
        ]),
        ("Respeto al árbitro", [
            "El fútbol tiene reglas escritas, pero también una cultura de juego limpio. Por costumbre, el capitán es quien canaliza el diálogo con el árbitro, y los reglamentos sancionan las protestas excesivas. En el fútbol base, los clubes recuerdan a las familias que los árbitros son, con frecuencia, jóvenes que están aprendiendo.",
        ]),
    ],
    fuentes=[("IFAB (Reglas de Juego y protocolo VAR)", "https://www.theifab.com/"), ("FIFA.com", "https://www.fifa.com/"), ("UEFA.com", "https://www.uefa.com/")],
    relac=["fuera-de-juego-regla-historia-var", "reglas-basicas-del-futbol-para-principiantes", "historia-tandas-de-penaltis"],
    faq=[("¿Qué hace el VAR?", "", "Ayuda al árbitro revisando por vídeo goles, penaltis, tarjetas rojas directas y confusiones de identidad. La decisión final siempre es del árbitro del campo.", ""),
         ("¿Cuándo se inventaron las tarjetas amarilla y roja?", "", "Se usaron por primera vez en el Mundial de México 1970, por idea del árbitro inglés Ken Aston.", ""),
         ("¿Qué hace el cuarto árbitro?", "", "Controla los cambios, muestra el tiempo añadido y vigila la zona técnica de los banquillos.", "")],
)

BALON = dict(
    slug="historia-del-balon-de-futbol",
    titulo="Historia del balón de fútbol: de la vejiga de cerdo al balón con sensor",
    desc="Cómo ha cambiado el balón de fútbol: de las vejigas de cerdo cubiertas de cuero al Telstar de 1970, el Jabulani de 2010 y el balón con sensor del Mundial de 2022, y qué medidas fija hoy el reglamento.",
    resumen="El balón ha evolucionado más de lo que parece. Este artículo recorre sus materiales, las anécdotas de los Mundiales y las medidas oficiales que se usan hoy.",
    secciones=[
        ("Los primeros balones", [
            "Durante siglos, los balones eran una vejiga de cerdo o de buey inflada con aire, a menudo cubierta de cuero para que durara más. Eran irregulares, pesados cuando se mojaban y difíciles de controlar. Cada pueblo y cada escuela jugaba con el suyo, y no existían medidas oficiales.",
            "El gran avance llegó en el siglo XIX con el caucho vulcanizado. Charles Goodyear desarrolló el proceso y se fabricaron las primeras pelotas de goma, más resistentes y más redondas. Poco a poco, la vejiga de goma sustituyó a la de cerdo dentro de una funda de cuero cosida.",
        ]),
        ("La primera estandarización", [
            "Las primeras reglas de la Football Association, en 1863, no precisaban el tamaño del balón. En 1872 se fijó que debía ser esférico, con una circunferencia de entre 27 y 28 pulgadas (unos 68-71 cm) y un peso de entre 13 y 15 onzas. Es la base de las medidas actuales.",
            "Aun así, durante décadas cada fábrica hacía su balón y los clubes cambiaban de modelo según el partido. El caso más famoso fue el de la primera final de un Mundial, en 1930: Argentina y Uruguay discutieron qué balón usar y acordaron jugar la primera parte con uno argentino y la segunda con uno uruguayo. Argentina ganaba al descanso por 2-1 y Uruguay acabó ganando por 4-2.",
        ]),
        ("El cuero de antes y los problemas", [
            "Los balones de cuero absorbían el agua de la lluvia y el barro, por lo que podían ganar peso durante el partido. Los cordones que cerraban la abertura dañaban a los jugadores al cabecear. A mediados del siglo XX se impusieron los balones impermeabilizados, con válvula en lugar de cordones, y se popularizaron los blancos para que se vieran mejor con luz artificial.",
        ]),
        ("Telstar, el balón blanco y negro", [
            "El Mundial de México 1970 estrenó el Telstar, de Adidas, con 32 paneles: 12 negros y 20 blancos. Fue diseñado para verse mejor en las televisiones en blanco y negro de la época. Su nombre alude a los satélites de comunicaciones Telstar. El diseño, inspirado en un icosaedro truncado, es el que muchas personas imaginan cuando piensan en un balón de fútbol.",
        ]),
        ("Del cuero sintético a la tecnología", [
            "En los ochenta llegaron los materiales sintéticos, que no absorbían agua y mantenían el peso. En 2006 el Teamgeist redujo los paneles a 14, unidos por calor en lugar de coserse. En 2010, el Jabulani generó polémica: muchos porteros se quejaron de que su trayectoria era impredecible. El diseño posterior intentó corregirlo con más textura en la superficie.",
            "En 2022, el balón del Mundial de Qatar, el Al Rihla, incorporó un sensor dentro para enviar datos de movimiento a la sala del VAR y ayudar al fuera de juego semiautomático. Los balones actuales son, a la vez, un objeto de deporte y un dispositivo tecnológico.",
        ]),
        ("Cómo se prueba un balón", [
            "Un balón moderno se fabrica con varias capas: una cámara interior de látex o butilo, un refuerzo textil y una cubierta de paneles sintéticos, normalmente de poliuretano. Los paneles se unen con calor o con pegamento, en lugar de coserse, para evitar que absorban agua.",
            "Los balones que llevan el sello de calidad de la FIFA pasan pruebas de laboratorio: se mide la circunferencia, el peso, la forma, el bote, la absorción de agua y la pérdida de presión tras varios impactos. Es una de las razones por las que el balón de un partido oficial se comporta siempre de forma muy parecida.",
        ]),
        ("Medidas oficiales hoy", [
            "El reglamento actual fija que el balón debe ser esférico, de cuero o de otro material adecuado, con una circunferencia de entre 68 y 70 centímetros y un peso de entre 410 y 450 gramos al comenzar el partido. Su presión debe ser la adecuada para el juego. El balón de tamaño 5 es el estándar para adultos; los más pequeños (4, 3) se usan en categorías infantiles.",
            "Para jugar una competición oficial, el balón debe cumplir las normas de calidad de la FIFA y llevar la marca que lo certifica. Si te gusta la historia del deporte, en nuestras curiosidades de los Mundiales encontrarás qué balón se usó en cada edición.",
        ]),
    ],
    fuentes=[("FIFA.com", "https://www.fifa.com/"), ("IFAB (Reglas de Juego)", "https://www.theifab.com/"), ("The Football Association", "https://www.thefa.com/")],
    relac=["reglas-basicas-del-futbol-para-principiantes", "mundiales-edicion-por-edicion", "numeros-camiseta-dorsales-historia"],
    faq=[("¿Cuánto pesa un balón de fútbol?", "", "Entre 410 y 450 gramos al comenzar el partido, con una circunferencia de entre 68 y 70 centímetros.", ""),
         ("¿Cuál era el balón del Mundial de 1970?", "", "El Telstar, de Adidas, con 32 paneles blancos y negros pensado para verse en las televisiones en blanco y negro.", ""),
         ("¿Qué balón tenía sensor?", "", "El Al Rihla, del Mundial de Qatar 2022, que incluía un sensor para ayudar al fuera de juego semiautomático.", "")],
)

FORMATOS = dict(
    slug="formatos-de-competicion-liga-copa-y-playoff",
    titulo="Formatos de competición: liga, copa, grupos y play-off explicados",
    desc="Qué diferencia hay entre una liga, una copa, una fase de grupos y un play-off; cómo se desempata, qué pasa en la Champions League desde 2024-25 y por qué el Mundial 2026 tiene 48 selecciones.",
    resumen="Hay mil formas de organizar un torneo. Esta guía explica los formatos más comunes del fútbol, cómo se reparten los puntos y cómo se desempata.",
    secciones=[
        ("La liga: todos contra todos", [
            "En una liga, cada equipo juega contra todos los demás, normalmente a ida y vuelta (una vez en su campo y otra en el contrario). Gana la competición quien suma más puntos al final. La victoria da tres puntos, el empate uno y la derrota cero. Hasta 1981 en Inglaterra y hasta el Mundial de 1994 en la Copa del Mundo, la victoria valía solo dos puntos, un cambio pensado para premiar el juego ofensivo.",
            "Su ventaja es que premia la regularidad: es difícil ganar una liga con suerte. Sus desventajas, que puede haber partidos sin nada en juego al final y que la competición se alarga durante meses.",
        ]),
        ("Cómo se desempata", [
            "Cuando dos equipos terminan con los mismos puntos, hay criterios de desempate. Cada competición escoge los suyos: algunas miran primero la diferencia de goles y otras los resultados entre los equipos implicados. En LaLiga se aplica primero el enfrentamiento directo, mientras que en la Premier League se mira antes la diferencia de goles. Para saber qué criterios se usan hay que mirar el reglamento de cada torneo.",
        ]),
        ("La copa: eliminatoria directa", [
            "En una copa, los equipos se enfrentan en eliminatorias y el que pierde queda fuera. Puede ser a partido único o a doble partido, con ida y vuelta. Si hay empate al final, se recurre a la prórroga y, si persiste, a los penaltis. Durante muchos años, en las eliminatorias a doble partido los goles marcados fuera de casa valían doble en caso de empate global, pero la UEFA eliminó esa regla en 2021.",
            "La gracia de las copas es la sorpresa: un equipo pequeño puede eliminar a uno grande en un solo partido. La FA Cup inglesa, la más antigua del mundo, es el ejemplo clásico.",
        ]),
        ("Fase de grupos y eliminatorias", [
            "Los grandes torneos de selecciones, como el Mundial o la Eurocopa, combinan ambos formatos: una fase de grupos en la que los equipos juegan una mini-liga y una fase final de eliminatorias. El Mundial de 2026 será el primero con 48 selecciones, divididas en 12 grupos de cuatro; pasan a la siguiente ronda los dos primeros de cada grupo y los ocho mejores terceros, hasta completar 32 equipos que se enfrentan en eliminatorias.",
        ]),
        ("La nueva Champions League", [
            "Desde la temporada 2024-25, la Champions League sustituye los grupos por una fase de liga única de 36 equipos. Cada club juega ocho partidos contra ocho rivales distintos, cuatro en casa y cuatro fuera, y se ordena en una sola tabla. Los ocho primeros pasan directamente a octavos; del noveno al vigésimo cuarto juegan una ronda previa a doble partido; los demás quedan eliminados.",
        ]),
        ("Cómo se llega a un Mundial", [
            "Para llegar al Mundial hay que superar una fase de clasificación organizada por cada confederación: UEFA en Europa, CONMEBOL en Sudamérica, CAF en África, AFC en Asia, CONCACAF en Norteamérica, Centroamérica y el Caribe, y OFC en Oceanía. Cada una recibe un número de plazas fijado por la FIFA, y los países anfitriones se clasifican de forma automática.",
            "Las últimas plazas se reparten en un mini-torneo intercontinental de repesca. El sistema mezcla ligas de grupos, eliminatorias a doble partido y, en algunos casos, play-offs, lo que lo convierte en un buen ejemplo de cómo se combinan los formatos que hemos visto en este artículo.",
        ]),
        ("Ascensos, descensos y play-offs", [
            "En la mayoría de países las ligas se organizan en divisiones. Al final de la temporada, los últimos clasificados de una categoría descienden y los primeros de la inferior ascienden. Para decidir las últimas plazas se juegan a menudo play-offs: pequeñas eliminatorias entre equipos que acabaron cerca de la línea. El de la segunda división inglesa, que se decide en Wembley, es famoso por su dramatismo y por el dinero que está en juego.",
            "Entender los formatos ayuda a seguir las noticias y a disfrutar más de cada partido. Puedes ver cómo se aplican en la historia de la Champions League y los Mundiales que tienes en las páginas de curiosidades de TIKITEXTO.",
        ]),
    ],
    fuentes=[("UEFA.com", "https://www.uefa.com/"), ("FIFA.com", "https://www.fifa.com/"), ("LaLiga.com", "https://www.laliga.com/"), ("Premier League", "https://www.premierleague.com/")],
    relac=["mundial-fase-de-grupos-desempates-y-formato-2026", "historia-tandas-de-penaltis", "liga-de-futbol-mas-antigua-del-mundo"],
    faq=[("¿Cuántos puntos da una victoria en el fútbol?", "", "Tres puntos; el empate da uno y la derrota ninguno.", ""),
         ("¿Cuántos equipos juegan la Champions League desde 2024-25?", "", "36 equipos, que juegan una fase de liga de ocho partidos cada uno; los ocho primeros pasan directos a octavos.", ""),
         ("¿Cuántas selecciones jugarán el Mundial 2026?", "", "48, repartidas en 12 grupos de cuatro; pasan los dos primeros y los ocho mejores terceros.", "")],
)

ARTICULOS_E = [REGLAS, POSICIONES, FORMACIONES, ARBITROS, BALON, FORMATOS]
