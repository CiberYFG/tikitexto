# -*- coding: utf-8 -*-
"""Artículos largos (parte A). Texto propio de TIKITEXTO. Cada artículo: slug, título, descripción, resumen,
secciones [(h2, [párrafos])], fuentes [(nombre, url)], relacionados [slug de curiosidades]."""

LETRAS = dict(
    slug="letras-mas-frecuentes-nombres-futbolistas",
    titulo="Las letras más frecuentes en los nombres de futbolistas (análisis propio)",
    desc="Qué letra aparece más en los apellidos de los futbolistas, cuál es la longitud típica y cómo acaban los nombres. Estadísticas calculadas sobre 368 jugadores de la base de TIKITEXTO.",
    resumen="Hemos contado, letra a letra, los 368 nombres de futbolistas de nuestra base de datos. La A aparece en casi siete de cada diez nombres, la mayoría tiene entre 5 y 8 letras y el 17 % lleva una letra doble. Aquí están los números y lo que podemos aprender de ellos.",
    secciones=[
        ("Cómo se ha hecho este recuento", [
            "En TIKITEXTO guardamos una lista de futbolistas, actuales y de leyenda, que usamos como respuestas en los juegos de adivinar el nombre. Para este artículo hemos tomado los 368 jugadores de esa lista y los hemos pasado por un proceso sencillo: se escribe cada nombre en mayúsculas, se quitan las tildes y los espacios y se cuentan las letras. El nombre que contamos es el que usa la gente para referirse al jugador, normalmente el apellido (Casillas, Buffon) o el nombre de juego (Pelé, Gavi), y en unos pocos casos nombre y apellido juntos.",
            "Conviene decir desde el principio qué es y qué no es este estudio. No es un análisis de todos los futbolistas del mundo, porque nuestra lista está hecha a mano y tiende a incluir nombres conocidos por el público hispanohablante, con mucha presencia de LaLiga y de selecciones europeas y sudamericanas. Es, más bien, una fotografía bastante fiel de los nombres que a un aficionado le cuesta menos recordar, que son justo los que aparecen en un juego. Por eso los resultados nos sirven para entender cómo suenan los nombres del fútbol que se ve en España y América Latina.",
        ]),
        ("La A manda: el ranking completo de las primeras letras", [
            "Sumando todas las letras de todos los nombres salen 2.533 caracteres. La letra más repetida es la A, con un 13,3 % del total, seguida de la E (9,2 %), la I (8,1 %), la R (8,0 %), la O (7,4 %) y la N (7,3 %). Después vienen la S (5,4 %), la L (5,3 %), la D (3,9 %), la M (3,6 %), la C (3,5 %) y la U (3,3 %). Las seis primeras letras suman cerca de la mitad de todo lo que se escribe en un nombre.",
            "Es llamativo que la A le saque tanta ventaja a la E. En el español corriente suele ser la E la letra más frecuente, y aquí es la A. La explicación está en los nombres. Muchísimos apellidos de futbolistas acaban en -a o llevan una A dentro por su origen español, portugués, italiano o árabe (Casillas, Maradona, Ronaldo, Salah, Ancelotti...). Los apellidos de origen germánico o anglosajón aportan más consonantes y menos vocales, pero nuestra lista pesa a favor de las lenguas latinas.",
            "Las vocales, en conjunto, suponen el 41,3 % de las letras. Es una proporción bastante habitual en lenguas con muchas sílabas abiertas como el español, el italiano o el portugués. Si la lista fuera de futbolistas de Europa del Este o de Escandinavia, seguramente veríamos más consonantes y una caída de la A.",
        ]),
        ("No es lo mismo cuántas veces sale una letra que en cuántos nombres sale", [
            "Para adivinar un nombre importa más una segunda cifra: en qué porcentaje de nombres aparece la letra al menos una vez. Una letra puede repetirse mucho en un solo nombre largo y aun así estar ausente en la mayoría. Por eso hemos calculado también la presencia. La A está en el 68 % de los nombres, la E en el 49 %, la I en el 46 %, la R en el 45 %, la O en el 44 % y la N en el 43 %. Después quedan la S y la L, con un 32 % cada una, la D con un 25 % y la M con un 23 %.",
            "Traducido a la práctica: si pruebas la A, en dos de cada tres nombres acertarás. Si pruebas la E, la I, la R, la O o la N, la probabilidad ronda la mitad, es decir, una moneda al aire. Cualquier letra por debajo del 25 % es ya una apuesta arriesgada para abrir la partida. Esta tabla de presencia es más útil que la de frecuencia total y es la que usaremos en el artículo de estrategia para escoger la primera palabra.",
        ]),
        ("Cómo empiezan y cómo terminan los nombres", [
            "Las iniciales más comunes son la C y la S, con 29 nombres cada una (alrededor del 8 % de la lista), seguidas muy de cerca por la B y la M, con 28. Detrás aparecen la R (24), la G (23), la D (20) y la A (19). Es una distribución bastante repartida: ninguna inicial supera el 8 %, de modo que adivinar la primera letra por probabilidad es casi imposible.",
            "El final es mucho más predecible. El 15,5 % de los nombres acaba en O (57 nombres), el 13,3 % en A (49), el 11 % en S (41) y el 10,9 % en N (40). Terminar en E (33) o en I (31) también es frecuente. Si juntamos O, A, S y N, algo más del 50 % de los nombres acaba en una de esas cuatro letras. Es una buena pista cuando solo te falta la última casilla.",
        ]),
        ("La longitud típica de un nombre de futbolista", [
            "La longitud media es de 6,9 letras. Los nombres de siete letras son los más habituales (78 de los 368), seguidos por los de seis (73) y los de ocho (62). Entre cinco y ocho letras se concentra el 73 % de la lista. Los extremos son raros: solo dos nombres tienen tres letras, mientras que los de doce letras son tres, y casi siempre son nombre y apellido unidos.",
            "Esta distribución explica por qué un tablero de cinco o seis casillas parece tan natural para este tipo de juegos. Si la longitud fuera más variable, los jugadores tendrían que ajustar mucho más su estrategia. Aquí, saber que el nombre tiene siete letras ya descarta casi nada, porque es lo más común; en cambio, un nombre de cuatro o de diez es una información valiosa porque son menos frecuentes.",
        ]),
        ("Las letras raras: K, Z, J, W, Q y X", [
            "Todas las letras del alfabeto aparecen en algún nombre, pero con diferencias enormes. La K se repite 54 veces, la Z 37, la J 18 y la W 10. La Q aparece solo 3 veces y la X, 2. Es decir, la Q y la X juntas suman menos del 0,2 % de todas las letras. Conviene guardarlas para el final, cuando ya no te quede otra opción.",
            "Hay un matiz: las letras raras suelen indicar el origen del nombre. Una K o una W apunta a nombres de origen alemán, nórdico, eslavo o anglosajón; una Z, a apellidos españoles e italianos terminados en -ez o -zzi; una J, a apellidos españoles, portugueses o franceses. Si ya has descubierto una K, es bastante probable que el resto del nombre también tenga consonantes poco habituales en español.",
        ]),
        ("Letras dobles y diferencias por posición", [
            "El 17 % de los nombres (64 de 368) contiene una letra doble, como la LL de Casillas o la SS de Messi. Es un dato útil porque en un juego de adivinar, una letra repetida cambia mucho la forma del nombre. Si ya sabes que hay una consonante doble, puedes descartar muchas posibilidades.",
            "También hemos mirado si los nombres cambian según la posición en el campo. Los resultados son más parecidos de lo que se podría pensar: la A es la primera letra en porteros, defensas, medios y delanteros. Hay pequeños matices, como que los defensas tienen una A más alta (14,8 %) y los delanteros una O más presente (8,6 %), pero con 36 porteros y 94 defensas la muestra es demasiado pequeña para sacar conclusiones fuertes. Los nombres de los porteros son los más largos de media, con 7,1 letras, frente a 6,8 de los delanteros, una diferencia que no creemos que signifique nada.",
        ]),
        ("Qué nos enseña todo esto", [
            "Tres ideas resumen el análisis. La primera, que los nombres del fútbol que conocemos están dominados por las vocales abiertas y por una terminación en O o A. La segunda, que las letras más rentables al empezar a adivinar son A, E, I, R, O y N, mucho más que la S o la L, que quedan en un segundo escalón. Y la tercera, que cuanto más rara es una letra, más información da cuando aparece, porque reduce de golpe la lista de candidatos.",
            "Hemos preferido ser prudentes con las cifras. Son estadísticas de una lista concreta y con un criterio de selección humano, no de todos los futbolistas de la historia. Si algún día ampliamos la base de TIKITEXTO volveremos a hacer el recuento y actualizaremos este artículo con los nuevos porcentajes.",
        ]),
    ],
    fuentes=[("Base de datos de jugadores de TIKITEXTO (368 nombres, recuento propio a 3 de noviembre de 2026)", "")],
    relac=["trucos-adivinar-futbolista-6-intentos", "numeros-camiseta-dorsales-historia"],
)

TRUCOS = dict(
    slug="trucos-adivinar-futbolista-6-intentos",
    titulo="Cómo adivinar un futbolista en 6 intentos: estrategia paso a paso",
    desc="Guía de estrategia para adivinar el nombre de un futbolista en seis intentos: qué letras probar primero, cómo leer los colores y cómo usar las pistas, con datos propios.",
    resumen="Adivinar el nombre oculto en seis intentos no es cuestión de suerte, es cuestión de información. Esta guía explica cómo elegir la primera palabra, cómo interpretar cada color y cuándo conviene arriesgar, apoyándose en el recuento de letras de nuestra propia base de datos.",
    secciones=[
        ("El problema: seis intentos y mucha información que aprovechar", [
            "Un juego de adivinar el nombre de un futbolista parece sencillo: escribes una palabra, el tablero te dice qué letras están bien colocadas, cuáles están en el nombre pero en otro sitio y cuáles no están, y con esa información ajustas el siguiente intento. En la práctica, la diferencia entre acertar en tres intentos y fallar en seis suele estar en cómo se aprovecha cada intento, no en cuánto fútbol sabes.",
            "La idea de fondo es que cada intento es una pregunta. Una buena pregunta reparte los posibles nombres en grupos del mismo tamaño, de manera que sea cual sea la respuesta, te quedes con menos candidatos. Una mala pregunta, como un nombre muy raro, casi siempre devuelve el mismo resultado (todo gris) y no te enseña nada. Estas ideas son las mismas que se usan en cualquier juego de deducción.",
        ]),
        ("Primer intento: las letras que más información dan", [
            "Según nuestro recuento de 368 nombres de futbolistas, la A aparece en el 68 % de los nombres, la E en el 49 %, la I en el 46 %, la R en el 45 %, la O en el 44 % y la N en el 43 %. La S y la L están en el 32 %. Esas son las letras con las que conviene abrir, porque son las que tienen más posibilidades de dar un acierto o un amarillo.",
            "Esto tiene una consecuencia práctica: elige como primer intento un nombre real que contenga varias de esas letras y ninguna repetida. Un nombre con A, E, R, O y N, por ejemplo, tiene mucha más información que uno con la misma letra dos veces. Evita de entrada letras raras como la K, la Z, la J o la W: aunque haya nombres que las lleven, en la mayoría de los casos lo único que recibirás es un gris.",
            "Si el tablero tiene muchas casillas, usa el primer intento para explorar y no pienses todavía en acertar. El objetivo del primer intento no es ganar, es conseguir el máximo de letras confirmadas o descartadas.",
        ]),
        ("Segundo intento: complementar, no repetir", [
            "El error más común en el segundo intento es repetir las mismas letras en otra posición. Si en el primero probaste A, E, R, O y N, el segundo debería usar letras distintas con buena presencia, como la I, la S, la L, la D o la M, aunque ya sepas que alguna letra del primero está bien. Con dos intentos bien diseñados cubres casi todas las consonantes y vocales frecuentes.",
            "Hay una excepción: si el primer intento te ha dado varios verdes, usa el segundo para confirmar la estructura del nombre. Cuando ya conoces tres o cuatro letras bien colocadas, la lista de candidatos baja a unas pocas decenas y lo más rentable es proponer un nombre que realmente exista y encaje con el patrón.",
        ]),
        ("Cómo leer los colores", [
            "Verde significa que la letra está en el nombre y en esa posición. Amarillo significa que la letra está en el nombre, pero en otra posición. Gris significa que la letra no está, aunque con una salvedad que se olvida a menudo: si escribes una letra repetida, el gris puede significar que no hay una segunda aparición, no que la letra no exista. Por ejemplo, si el nombre tiene una sola S y tú escribes dos, una saldrá coloreada y la otra gris.",
            "Un amarillo es una pista de posición, no solo de existencia. Si una A es amarilla en la segunda casilla, ya sabes que el nombre no tiene la A en la posición dos, y eso descarta muchos candidatos. Conviene apuntar mentalmente dónde no puede estar cada letra amarilla y moverla de casilla en el siguiente intento.",
            "Los grises también hablan. Con tres o cuatro letras descartadas, el patrón de vocales y consonantes que queda suele sugerir nombres concretos. Si todas las vocales frecuentes han salido grises, estás ante un nombre poco común y hay que pensar en letras raras.",
        ]),
        ("Usar la longitud, la terminación y la posición", [
            "Tres datos del tablero ayudan antes incluso de escribir. El primero es la longitud: según nuestro recuento, el 73 % de los nombres tiene entre cinco y ocho letras, así que un nombre de cuatro o de diez es muy informativo. El segundo es la terminación: más de la mitad de los nombres acaba en O, A, S o N, de modo que si te falta la última casilla, empieza por esas. El tercero es la posición del jugador, si el modo te la da: un portero, un defensa o un delantero reduce muchísimo la lista de candidatos.",
            "Otro truco es pensar en la estructura de las sílabas. Los nombres en español y portugués alternan vocal y consonante con mucha regularidad, de modo que un patrón como consonante-vocal-consonante-consonante-vocal suele encajar con apellidos que ya conoces. Los nombres de origen germánico, en cambio, acumulan consonantes seguidas.",
        ]),
        ("La pista: cuándo usarla y cuándo no", [
            "Muchos modos incluyen un botón de pista con una breve descripción del jugador. Nuestro consejo es no usarla en el primer intento. Primero conviene explorar con las letras frecuentes y ver qué patrón sale; la pista funciona mucho mejor cuando ya tienes dos o tres letras confirmadas, porque en ese punto sirve para elegir entre un puñado de candidatos.",
            "Una pista del tipo «delantero español campeón del mundo en 2010» es poderosa si ya sabes que el nombre tiene siete letras y empieza por V. Pero si la lees antes de empezar, suele inducirte a un nombre concreto y a fijarte en él aunque las letras no encajen. Es más eficaz como confirmación que como punto de partida.",
        ]),
        ("Cuándo conviene arriesgar", [
            "En los dos últimos intentos, cambia de estrategia. Hasta el cuarto intento lo mejor suele ser explorar, pero con dos intentos por delante ya no tiene sentido gastar uno en una palabra que solo sirve para descartar letras. Si tienes una hipótesis razonable, juégala. Un acierto en el quinto intento vale mucho más que un descarte brillante que te deja sin margen.",
            "Una regla práctica: si quedan más de cuatro candidatos posibles, usa el intento para repartirlos; si quedan dos o tres, elige el más probable y confía en tu intuición futbolística. Si dudas entre un jugador muy conocido y uno poco conocido, apuesta por el conocido, porque los juegos tienden a incluir más nombres reconocibles que desconocidos.",
        ]),
        ("Errores típicos que cuestan una partida", [
            "Hay cinco errores que se repiten. Primero, abrir con un nombre exótico que no confirma ninguna letra. Segundo, repetir letras grises ya descartadas, algo más habitual de lo que parece cuando se juega rápido. Tercero, olvidar que una letra amarilla no puede volver a la misma casilla. Cuarto, escribir una palabra que no puede ser la solución porque contradice pistas anteriores. Y quinto, dejarse llevar por el favorito personal: aunque creas que el jugador es tu ídolo, si las letras no encajan, no lo es.",
            "Con práctica, el proceso se vuelve casi automático. Si juegas a menudo, comprobarás que los intentos de apertura se repiten y que los patrones se reconocen al instante. Y si quieres un empujón, prueba los distintos modos de TIKITEXTO, desde jugadores y entrenadores hasta equipos y estadios, porque cada uno tiene un vocabulario distinto y entrena un tipo de intuición diferente.",
        ]),
    ],
    fuentes=[("Recuento propio de letras de la base de TIKITEXTO (3 de noviembre de 2026)", "")],
    relac=["letras-mas-frecuentes-nombres-futbolistas", "numeros-camiseta-dorsales-historia"],
)

BALON = dict(
    slug="como-se-elige-el-balon-de-oro",
    titulo="Cómo se elige el Balón de Oro: votación, criterios y cambios a lo largo de la historia",
    desc="Quién vota el Balón de Oro, qué se valora, cuándo se abrió a jugadores no europeos y en qué se diferencia de otros premios. Explicado paso a paso.",
    resumen="El Balón de Oro lo concede la revista France Football desde 1956 y ha cambiado mucho: de premio solo para europeos a galardón mundial, de votar el año natural a votar la temporada. Este artículo explica cómo funciona hoy y cómo ha cambiado.",
    secciones=[
        ("El origen: una idea de periodistas", [
            "El Balón de Oro nació en 1956 de la mano de la revista francesa France Football, y su impulsor fue el periodista Gabriel Hanot. La idea era sencilla: preguntar a periodistas de distintos países europeos quién había sido el mejor jugador del año y premiarlo. El primer ganador fue el inglés Stanley Matthews. Durante casi cuarenta años el premio fue exclusivamente para futbolistas europeos, lo cual explica que durante décadas no figurara ningún jugador sudamericano, aunque Pelé o Maradona dominaran el fútbol mundial.",
            "Ese detalle importa a la hora de comparar épocas. Cuando alguien se pregunta por qué Pelé no ganó nunca el Balón de Oro, la respuesta más honesta es que no podía optar a él. Las reglas cambiaron después, y eso afecta a cualquier comparación histórica que se haga entre generaciones.",
        ]),
        ("Las grandes reformas", [
            "La primera gran reforma llegó en 1995, cuando el premio se abrió a jugadores de cualquier nacionalidad que jugaran en Europa. El primer ganador bajo esa norma fue el liberiano George Weah, del Milan. En 2007 se dio un paso más y se permitió votar a cualquier jugador del mundo, estuviera donde estuviera, y no solo a los que jugaban en clubes europeos.",
            "Entre 2010 y 2015 el premio se fusionó con el de mejor jugador de la FIFA y pasó a llamarse Balón de Oro de la FIFA. Durante esos años lo ganaron Messi y Cristiano Ronaldo. En 2016 ambas organizaciones volvieron a separarse: France Football recuperó el Balón de Oro y la FIFA creó su propio premio, The Best. Desde entonces conviven dos galardones con votantes y criterios diferentes, y es habitual que no coincidan.",
            "Otro cambio importante fue el calendario. Hasta 2021 se valoraba el año natural, de enero a diciembre. Desde 2022 se vota por temporada, es decir, el rendimiento entre agosto y julio. Eso favorece a los jugadores cuyo mejor rendimiento coincide con el final de una temporada y complica más las comparaciones con años anteriores.",
        ]),
        ("Quién vota y cómo", [
            "El voto lo emite un jurado de periodistas. En la versión actual hay un periodista por cada una de las cien mejores selecciones del ranking de la FIFA, es decir, cien votantes de países distintos. Cada votante ordena a sus jugadores favoritos y les asigna puntos en orden descendente. Gana el jugador que suma más puntos. La lista previa de nominados se elabora desde la propia organización con unos treinta nombres.",
            "El sistema por países tiene una ventaja: evita que un solo mercado mediático decida el premio. Y un inconveniente: algunos votantes siguen mucho más la liga de su país que el resto del mundo, de modo que la visibilidad de un jugador puede pesar más que su rendimiento puro. Es una de las razones por las que las votaciones generan discusiones.",
        ]),
        ("Qué criterios se supone que se valoran", [
            "Los criterios oficiales se pueden resumir en tres: el rendimiento individual y el carácter decisivo del jugador, el rendimiento del equipo y los títulos conseguidos, y la clase y el juego limpio. El orden de importancia no es fijo y cada votante lo interpreta a su manera. Algunos dan más peso a los trofeos colectivos, como una Champions o un Mundial; otros priorizan las estadísticas individuales, como los goles o las asistencias.",
            "Esa flexibilidad explica las polémicas. Un año puede ganar un delantero con muchos goles pero sin títulos, y otro, un centrocampista que ganó la competición más importante. Ninguna de las dos decisiones es incorrecta, porque el reglamento deja un margen de interpretación amplio. Por eso es más útil hablar de qué criterios han prevalecido en cada época que de si un ganador fue justo o injusto.",
        ]),
        ("La era Messi-Cristiano y lo que vino después", [
            "Entre 2008 y 2017, el premio se repartió entre Messi y Cristiano Ronaldo: cinco galardones para cada uno. Esa década hizo que muchos aficionados jóvenes crecieran pensando que el Balón de Oro era cosa de dos. En 2018 lo ganó Luka Modrić, que había conquistado la Champions con el Real Madrid y llegado a la final del Mundial con Croacia, lo que se interpretó como un cambio de ciclo.",
            "Después de 2018 hubo victorias de Messi (2019, 2021 y 2023), una edición cancelada en 2020 por la pandemia, y ganadores de perfil más variado, como Benzema en 2022 o Rodri en 2024. Cada una de esas votaciones tuvo sus debates, y el debate es parte del atractivo del premio: no hay una fórmula matemática que elija al ganador, y siempre queda margen para discutir.",
        ]),
        ("Diferencias con otros premios", [
            "Es habitual confundir el Balón de Oro con The Best, el premio de la FIFA, y con los trofeos de goleadores. En The Best votan capitanes y entrenadores de selecciones, periodistas y aficionados. En el Balón de Oro votan solo periodistas. Y mientras el Balón de Oro se centra en el mejor jugador de la temporada, el Trofeo Gerd Müller premia al máximo goleador y el Trofeo Kopa al mejor jugador joven.",
            "Si te interesa un repaso completo de todos los premios individuales y de sus diferencias, tenemos otro artículo dedicado a eso. Y si quieres consultar los ganadores año por año, la página de ganadores del Balón de Oro de TIKITEXTO recoge la lista completa con la fuente.",
        ]),
        ("Preguntas que se repiten", [
            "¿Puede ganar un portero? Sí, aunque ha ocurrido una sola vez: Lev Yashin en 1963. ¿Puede ganarlo un jugador que no ha ganado nada ese año? Sí, si el jurado valora más el rendimiento individual. ¿Cuenta el Mundial? Cuenta mucho cuando se juega, porque es el escaparate más visible. ¿Y los votos de los periodistas se conocen? En ediciones recientes, sí: se publican los resultados completos, con la clasificación de los treinta nominados, lo que permite ver lo ajustada o abultada que ha sido cada votación.",
        ]),
    ],
    fuentes=[("France Football (organizadora del Balón de Oro)", "https://www.francefootball.fr/"), ("FIFA", "https://www.fifa.com/")],
    relac=["premios-individuales-futbol-diferencias", "como-funciona-la-bota-de-oro", "balon-de-oro-ganadores"],
)

BOTA = dict(
    slug="como-funciona-la-bota-de-oro",
    titulo="Cómo funciona la Bota de Oro europea: puntos por gol según la liga",
    desc="La Bota de Oro no premia al que más goles marca, sino al que más puntos suma. Explicamos cómo se ponderan las ligas, con ejemplos y las diferencias con el Pichichi.",
    resumen="Un gol en una liga no vale lo mismo que en otra. La Bota de Oro europea multiplica los goles según la fuerza de la competición, y por eso el ganador puede no ser el máximo goleador de Europa. Aquí se explica el sistema y se compara con el Pichichi.",
    secciones=[
        ("Qué es la Bota de Oro", [
            "La Bota de Oro europea es un premio que se entrega cada temporada al jugador que más puntos suma en las ligas nacionales de Europa. Se concede desde la temporada 1967-68, y su primer ganador fue el portugués Eusébio. A diferencia de otros trofeos, no es un trofeo de una liga concreta, sino un premio continental que compara goleadores de campeonatos muy distintos entre sí.",
            "Esa comparación es el reto de fondo: marcar treinta goles en un campeonato competitivo no es lo mismo que marcarlos en uno con menos nivel medio. El premio intenta tenerlo en cuenta con un sistema de ponderación.",
        ]),
        ("El sistema de puntos", [
            "El reglamento actual funciona así: cada gol marcado en la liga nacional vale un número de puntos que depende de la categoría de la competición según el ranking de ligas de la UEFA. En las cinco grandes ligas europeas (España, Inglaterra, Italia, Alemania y Francia), cada gol vale dos puntos. En las ligas clasificadas entre la sexta y la vigesimoprimera, cada gol vale uno y medio. En el resto de ligas, cada gol vale un punto.",
            "El cálculo es muy sencillo. Si un delantero marca 30 goles en una de las cinco grandes ligas, suma 60 puntos. Si otro marca 36 en una liga del segundo grupo, suma 54. Aunque haya marcado más goles, el segundo jugador queda por detrás. Solo cuentan los goles de liga, no los de copa ni los de competiciones europeas.",
        ]),
        ("Un ejemplo para entenderlo", [
            "El ejemplo más claro es el de Lionel Messi en la temporada 2011-12. Marcó 50 goles en la liga española, y como LaLiga estaba entre las grandes ligas, cada gol valió dos puntos: 100 puntos en total. Es una de las puntuaciones más altas de la historia del premio. Más cerca en el tiempo, Robert Lewandowski ganó el premio con 41 goles en la Bundesliga en 2020-21, lo que le dio 82 puntos.",
            "Lo interesante de estos números es que la regla de los puntos no cambia mucho el resultado cuando un jugador domina en una gran liga. Donde de verdad importa es en los años ajustados. Si un goleador de una liga menor marca muchos tantos y otro de una gran liga marca algo menos, el sistema suele favorecer al segundo y alimenta discusiones sobre si es justo.",
        ]),
        ("Por qué el sistema genera debate", [
            "Los críticos dicen que el sistema penaliza a jugadores que marcan mucho en ligas menores, aunque rindan a un nivel altísimo. Los defensores responden que es imposible comparar competiciones sin algún tipo de peso, y que el ranking de la UEFA es el criterio más objetivo disponible. Ambas posturas tienen parte de razón.",
            "Hay además un debate de fondo: ¿debería contar también la competición europea? Un goleador de una liga pequeña que además brilla en la Champions está jugando contra los mejores del continente, pero esos goles no suman en el cómputo. Es una limitación conocida del premio.",
        ]),
        ("Bota de Oro frente a Pichichi", [
            "Se confunden a menudo, pero son premios distintos. El Pichichi lo concede el diario Marca al máximo goleador de LaLiga y se basa solo en goles. La Bota de Oro mide puntos ponderados y compara a todos los campeonatos europeos. Un jugador puede ganar el Pichichi y no la Bota de Oro si, por ejemplo, un goleador de la Premier League o de la Bundesliga suma más puntos.",
            "En los años en que un jugador de LaLiga gana ambos, lo normal es que haya dominado con claridad. Si te interesa la historia completa de los máximos goleadores de la liga española, puedes consultar nuestra página del Pichichi con los datos y la fuente.",
        ]),
        ("Cuántos goles hacen falta para ganar", [
            "No hay una cifra fija, pero la historia reciente da una idea. En las últimas temporadas el ganador ha rondado entre los 30 y los 40 goles en una de las grandes ligas, lo que equivale a entre 60 y 80 puntos. Las temporadas de 50 goles, como la de Messi en 2011-12, son excepcionales. Cuando el calendario tiene menos partidos, como en ligas de 18 equipos, el listón baja de forma natural.",
            "La competencia suele ser feroz. En un año cualquiera, tres o cuatro delanteros pueden ir a la par hasta las últimas jornadas, y el premio se decide por un solo tanto. Por eso cada jornada final tiene un componente de suspense más allá del título de liga.",
        ]),
        ("Cómo seguir la clasificación", [
            "Durante la temporada, la clasificación provisional se actualiza tras cada jornada. Es una forma divertida de seguir el campeonato: más que mirar solo los goles de un jugador, se puede calcular los puntos y ver quién va por delante. El cálculo manual es sencillo, y ayuda a entender mejor cuánto vale realmente cada gol.",
        ]),
    ],
    fuentes=[("UEFA (ranking de ligas y coeficientes)", "https://www.uefa.com/"), ("Marca (Pichichi)", "https://www.marca.com/")],
    relac=["como-se-elige-el-balon-de-oro", "premios-individuales-futbol-diferencias", "bota-de-oro-europea", "pichichi-historia"],
)

PREMIOS = dict(
    slug="premios-individuales-futbol-diferencias",
    titulo="Premios individuales del fútbol: diferencias entre Balón de Oro, The Best, Pichichi, Zamora y más",
    desc="Balón de Oro, The Best, Pichichi, Zamora, Bota de Oro, Trofeo Kopa, Yashin, Gerd Müller y Puskás: quién los concede, qué premian y en qué se diferencian.",
    resumen="Cada temporada se reparten muchos premios individuales y es fácil mezclarlos. Esta guía los ordena por tipo y explica quién los concede, qué premian y cómo se eligen al ganador.",
    secciones=[
        ("Por qué hay tantos premios y por qué se confunden", [
            "Los premios individuales del fútbol han crecido con los años, y cada organización ha creado el suyo. El resultado es un mapa confuso donde cuesta saber cuál es oficial, cuál lo concede un periódico o una revista y cuáles dependen de la votación de aficionados. Lo útil es organizarlos por qué mide cada uno: el mejor jugador, el máximo goleador, el mejor portero, el mejor joven o el mejor gol.",
        ]),
        ("Los premios al mejor jugador", [
            "El Balón de Oro lo concede la revista France Football y lo vota un jurado de periodistas de todo el mundo. The Best lo concede la FIFA y lo votan capitanes de selecciones, seleccionadores, periodistas y aficionados, con un peso parecido para cada grupo. Existe además el premio de la UEFA al mejor jugador de la temporada en Europa y varios galardones del propio gremio de futbolistas.",
            "Los dos grandes, Balón de Oro y The Best, suelen coincidir en algunos años y discrepar en otros. La diferencia principal está en el electorado: periodistas por un lado, un abanico más amplio por el otro. También cambia el período evaluado, aunque en los últimos años ambos tienden a mirar la temporada.",
        ]),
        ("Los premios a goleadores", [
            "En el apartado de goles hay dos niveles. El Pichichi, de Marca, premia al máximo goleador de LaLiga y lleva el nombre del delantero del Athletic Club Rafael Moreno, apodado Pichichi. La Bota de Oro europea premia por puntos a todas las ligas del continente, dando más valor a los goles de las grandes ligas. Y el Trofeo Gerd Müller, creado en 2021 dentro de la gala del Balón de Oro, premia al máximo goleador del año.",
            "En las competiciones de selecciones existe además la Bota de Oro del Mundial, que premia al máximo goleador del torneo y en caso de empate se desempata por asistencias y minutos jugados.",
        ]),
        ("Los premios a porteros", [
            "El Trofeo Zamora lo concede Marca al portero de LaLiga con la mejor media de goles encajados por partido, y exige un mínimo de partidos jugados. Su nombre homenajea a Ricardo Zamora, el mítico portero español. El Trofeo Yashin, que se entrega en la gala del Balón de Oro desde 2019, premia al mejor portero del año y lleva el nombre de Lev Yashin, el único portero que ha ganado el Balón de Oro. Y el Guante de Oro del Mundial premia al mejor portero del torneo.",
            "Una diferencia importante: el Zamora es estadístico y depende en buena medida del rendimiento defensivo del equipo, mientras que el Yashin es una votación subjetiva que valora las actuaciones del portero.",
        ]),
        ("Los premios a jóvenes y los premios al mejor gol", [
            "El Trofeo Kopa se creó en 2018 y premia al mejor jugador menor de 21 años del año. Su nombre recuerda a Raymond Kopa, delantero francés del Real Madrid de los años cincuenta. En el Mundial existe el premio al mejor jugador joven del torneo.",
            "El Premio Puskás, que concede la FIFA desde 2009, premia el mejor gol del año. Lleva el nombre de Ferenc Puskás y se vota por un jurado y por aficionados. A diferencia de los demás, no compara temporadas completas, sino un solo momento.",
        ]),
        ("Tabla rápida de equivalencias", [
            "Si quieres una regla fácil: para el mejor jugador mira el Balón de Oro o The Best; para el máximo goleador de España, el Pichichi; para el máximo goleador de Europa, la Bota de Oro; para el mejor portero por estadísticas, el Zamora; para el mejor portero por votación, el Yashin; para el mejor joven, el Kopa; y para el mejor gol, el Puskás.",
        ]),
        ("Cómo se eligen los ganadores", [
            "Los premios estadísticos, como el Pichichi, el Zamora o la Bota de Oro, se deciden con números y no admiten discusión salvo por detalles de cálculo. Los premios de votación, como el Balón de Oro, The Best, el Yashin o el Puskás, dependen de las preferencias de los votantes y de cómo se haya configurado el jurado. Es la razón por la que unos generan debate año tras año y otros casi nunca.",
            "En resumen, entender un premio exige saber quién lo concede, a quién premia y con qué sistema. Con esas tres preguntas se resuelve casi cualquier duda.",
        ]),
    ],
    fuentes=[("France Football", "https://www.francefootball.fr/"), ("FIFA", "https://www.fifa.com/"), ("UEFA", "https://www.uefa.com/"), ("Marca", "https://www.marca.com/")],
    relac=["como-se-elige-el-balon-de-oro", "como-funciona-la-bota-de-oro", "balon-de-oro-ganadores", "pichichi-historia"],
)

ARTICULOS_A = [LETRAS, TRUCOS, BALON, BOTA, PREMIOS]
