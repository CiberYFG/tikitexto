# -*- coding: utf-8 -*-
"""Artículos largos (parte O, 23-nov-2026): clubes más antiguos, apodos de clubes y selecciones, modelos de propiedad,
evolución del lateral, Serie A y Copa Libertadores. Texto propio de TIKITEXTO. Contenido histórico y atemporal: se evitan
cifras que cambian cada temporada. Datos contrastados con FIFA, UEFA, Conmebol, The FA y las federaciones."""

FIFA = ("FIFA.com", "https://www.fifa.com/")
UEFA = ("UEFA.com", "https://www.uefa.com/")
THEFA = ("The FA (Football Association)", "https://www.thefa.com/")
CONMEBOL = ("CONMEBOL", "https://www.conmebol.com/")
FIGC = ("FIGC (Federación Italiana de Fútbol)", "https://www.figc.it/")
DFL = ("DFL (Bundesliga)", "https://www.bundesliga.com/")
LALIGA = ("LaLiga", "https://www.laliga.com/")
RSSSF = ("RSSSF (archivo de estadísticas del fútbol)", "https://www.rsssf.org/")

ANTIGUOS = dict(
    slug="los-clubes-de-futbol-mas-antiguos-del-mundo-sheffield-notts-county-y-los-pioneros",
    titulo="Los clubes de fútbol más antiguos del mundo: de Sheffield FC a los pioneros de España, Italia y Argentina",
    desc="Qué clubes de fútbol siguen existiendo desde el siglo XIX: Sheffield FC (1857), Hallam, Notts County, Queen's Park y los pioneros de Italia, España, Países Bajos y Argentina. Fechas y curiosidades.",
    resumen="Antes de las ligas y los Mundiales hubo clubes que jugaban con sus propias reglas. Algunos de ellos siguen vivos hoy. Este repaso cuenta cuáles son los más antiguos, por qué se discute el título y cómo nacieron los pioneros de otros países.",
    secciones=[
        ("Cuál es el club más antiguo del mundo", [
            "La respuesta más aceptada es el Sheffield Football Club, fundado el 24 de octubre de 1857 en la ciudad inglesa de Sheffield. La FIFA lo reconoce como el club de fútbol más antiguo del mundo del que se tiene constancia que sigue en activo. Sus fundadores eran jóvenes de clase acomodada que querían mantenerse en forma fuera de la temporada de críquet, y redactaron sus propias reglas, conocidas como las «reglas de Sheffield». Esas normas influyeron en el fútbol moderno: de ellas proceden ideas como el saque de esquina o el tiro libre por falta, que más tarde adoptó la Football Association.",
            "Poco después apareció el Hallam FC, fundado en 1860 también en Sheffield y con un campo, Sandygate Road, que se considera el estadio más antiguo del mundo donde se sigue jugando. Los partidos entre Sheffield y Hallam, jugados desde el 26 de diciembre de 1860, se conocen como el derbi más antiguo del fútbol. Otro club inglés muy antiguo es el Cray Wanderers, fundado también en 1860 en el sur de Londres, y el escocés Queen's Park, de Glasgow, que nació en 1867 y es el club más antiguo de Escocia.",
        ]),
        ("El primer club profesional: Notts County", [
            "El Notts County, de la ciudad de Nottingham, se fundó en 1862 y es el club profesional más antiguo del mundo según la FIFA y la FA. Fue uno de los doce clubes fundadores de la Football League en 1888, la primera liga profesional del mundo. Aunque hoy compite en categorías modestas, su historia ilustra cómo el fútbol pasó de un pasatiempo de amigos a un espectáculo con equipos regulares, calendarios de partidos y público de pago.",
            "También son muy antiguos el Stoke City, que reclama la fecha de 1863, y el Nottingham Forest, fundado en 1865. Ambos formaron parte de la primera época del fútbol organizado inglés, aunque los historiadores discuten la fecha exacta de algunos clubes porque los primeros registros son escasos y muchos equipos empezaron a existir años antes de redactar un acta de fundación formal.",
        ]),
        ("Los pioneros fuera de Inglaterra", [
            "El fútbol salió de Inglaterra gracias a trabajadores, marineros, estudiantes y empresarios británicos. En España, el club más antiguo en activo es el Recreativo de Huelva, fundado el 23 de diciembre de 1889 y conocido como «el Decano». El Athletic Club de Bilbao nació en 1898, el FC Barcelona en 1899, de la mano del suizo Hans Gamper, y el Madrid Football Club, que más tarde se convertiría en el Real Madrid, en 1902.",
            "En Italia, el Genoa se fundó en 1893 y es el club de fútbol más antiguo del país todavía activo; la Juventus apareció en 1897. En los Países Bajos, el club HFC Haarlem se creó en 1879, y en Dinamarca el Kjøbenhavns Boldklub nació en 1876. En Alemania, el Bayern de Múnich se fundó en 1900, el mismo año que el Ajax en los Países Bajos. En Sudamérica, River Plate nació en 1901 y Boca Juniors en 1905, ambos en el puerto de Buenos Aires, mientras que el Fluminense de Río de Janeiro se fundó en 1902.",
        ]),
        ("Por qué se discute la fecha de fundación", [
            "Saber cuál es el club más antiguo no siempre es sencillo. Algunos clubes empezaron como secciones de otros deportes, como el críquet, y adoptaron el fútbol años después; otros se fundaron, desaparecieron y volvieron a crearse con el mismo nombre; y otros han cambiado de nombre o de lugar. Por eso es habitual encontrar fechas distintas según se cuente la creación del club, el primer partido de fútbol o la inscripción en una federación.",
            "El caso del Genoa es un buen ejemplo: nació en 1893 como un club de críquet y atletismo, y su sección de fútbol se consolidó pocos años después. En España, el Recreativo de Huelva nació impulsado por la comunidad británica vinculada a las minas de Riotinto. Todos estos matices explican que las listas de clubes antiguos varíen según la fuente, y que convenga usar siempre referencias oficiales como las de la FIFA o las federaciones nacionales.",
        ]),
        ("Lo que cuentan estos clubes", [
            "Más allá de la anécdota, los clubes pioneros recuerdan que el fútbol que conocemos nació de forma gradual, con reglas distintas en cada ciudad, y que la unificación de normas fue un proceso largo. En TIKITEXTO puedes repasar ese camino en nuestros artículos sobre los orígenes del fútbol moderno y sobre la liga más antigua del mundo, además de los datos de campeones y récords con fuentes oficiales.",
        ]),
    ],
    fuentes=[FIFA, THEFA, LALIGA, FIGC],
    relac=["origenes-del-futbol-moderno-de-1863-a-hoy", "liga-de-futbol-mas-antigua-del-mundo", "historia-del-futbol-en-espana-de-los-primeros-clubes-a-laliga", "como-funciona-un-club-de-futbol-por-dentro"],
    faq=[
        ("¿Cuál es el club de fútbol más antiguo del mundo?", "", "El Sheffield FC, fundado en 1857 y reconocido por la FIFA como el club más antiguo en activo.", ""),
        ("¿Cuál es el club profesional más antiguo?", "", "El Notts County, fundado en 1862 en Nottingham.", ""),
        ("¿Cuál es el club más antiguo de España?", "", "El Recreativo de Huelva, fundado en 1889 y conocido como «el Decano».", ""),
        ("¿Qué es el derbi más antiguo del fútbol?", "", "El de Sheffield FC y Hallam FC, que se juega desde el 26 de diciembre de 1860.", ""),
    ],
)

APODOS = dict(
    slug="apodos-de-clubes-y-selecciones-de-futbol-origen-de-merengues-colchoneros-gunners-y-azzurri",
    titulo="Apodos de clubes y selecciones de fútbol: el origen de merengues, colchoneros, gunners, azzurri y más",
    desc="Por qué al Real Madrid le llaman «merengues», al Atlético «colchoneros» y al Arsenal «gunners». El origen de los apodos de clubes y selecciones más famosos del fútbol.",
    resumen="Los apodos del fútbol cuentan historias: colores de camiseta, oficios, canciones y barrios. Esta guía explica de dónde vienen los más conocidos de clubes y selecciones.",
    secciones=[
        ("Por qué los equipos tienen apodos", [
            "Casi todos los clubes de fútbol tienen uno o varios apodos, y casi siempre nacieron de forma espontánea: la afición, la prensa o los rivales empezaron a usarlos y, con el tiempo, el club los adoptó como propios. Algunos remiten al color de la camiseta, otros a la profesión de los fundadores, otros a una canción o a una anécdota. Conocerlos ayuda a entender la historia de cada club, porque suelen condensar en una palabra su origen social o su identidad.",
            "Conviene tener en cuenta que muchos apodos tienen más de una explicación, porque la tradición oral los ha ido adornando con los años. En este repaso nos quedamos con las versiones más aceptadas y señalamos cuando existe duda.",
        ]),
        ("Apodos de color: blancos, rojiblancos y azulgranas", [
            "Al Real Madrid se le llama «los merengues» por el color blanco de su camiseta, que recuerda al merengue, el dulce hecho con claras de huevo batidas. También se le llama «los blancos». Al Barcelona se le conoce como «blaugrana» (o «azulgrana»), por los colores de su camiseta, y también como «el Barça». El Atlético de Madrid es «los colchoneros» porque las rayas rojas y blancas de su camiseta recordaban a los colchones de la época, y también «los rojiblancos» o «los indios».",
            "En Italia, el Milan es «rossoneri» (rojinegros) y el Inter es «nerazzurri» (negro y azul); este club nació en 1908 de una escisión del Milan para aceptar jugadores extranjeros, y su nombre, Internazionale, lo recuerda. La Juventus es «bianconeri» (blanquinegros) y también «la Vecchia Signora», la «vieja señora», un apodo cariñoso que juega con la veteranía del club. En Inglaterra, el Newcastle United es «las urracas» («Magpies») por sus rayas blancas y negras.",
        ]),
        ("Apodos de oficio, barrio y canción", [
            "Muchos apodos ingleses vienen del oficio o del origen de los fundadores. El Arsenal es «los artilleros» («Gunners») porque nació en 1886 como un club de trabajadores de la fábrica de armamento Royal Arsenal, en Woolwich, al sureste de Londres. El West Ham United es «los martillos» («Hammers») porque su origen está en el equipo de los trabajadores de los astilleros Thames Ironworks. El Tottenham Hotspur es «los espuelas» («Spurs») por el nombre del club, inspirado en Harry Hotspur, personaje histórico y de las obras de Shakespeare; su emblema incluye un gallo con espuelas.",
            "El Everton es «los toffees» por una tradición que lo relaciona con las golosinas que se vendían cerca de su primer estadio, y el Manchester United es «los diablos rojos» («Red Devils»), un apodo que se popularizó en los años sesenta. En España, el Villarreal es «el Submarino Amarillo», un guiño a la canción «Yellow Submarine» de The Beatles y a su camiseta amarilla, mientras que el Athletic Club es «los leones» por su estadio, San Mamés, que se conoce como «La Catedral».",
        ]),
        ("Apodos de selecciones", [
            "Las selecciones también tienen apodos muy conocidos. España es «la Roja» por el color de su camiseta, y Francia es «Les Bleus», por el azul. Italia es la «Squadra Azzurra» o los «azzurri», el azul de la casa real de Saboya, cuyos colores heredó el equipo nacional. Inglaterra es «los Tres Leones» por el emblema de su escudo, y los Países Bajos son «Oranje» o «la Naranja Mecánica» en su época más famosa, por el color naranja de la casa real de Orange.",
            "Alemania es «Die Mannschaft» («el equipo»), un nombre que su federación adoptó oficialmente en 2015. Argentina es «la Albiceleste» por sus colores blanco y celeste, y Brasil es la «Canarinha» («canario») por el amarillo de su camiseta, que sustituyó al blanco tras el trauma del Maracanazo de 1950. Uruguay es «la Celeste», y Croacia, «los Vatreni» («los ardientes»), por el rojo de su camiseta a cuadros.",
        ]),
        ("Cuando el apodo se convierte en identidad", [
            "Un apodo bien elegido puede convertirse en parte de la identidad de un club. Los aficionados lo usan en cánticos, bufandas y pancartas, y muchos clubes lo incorporan a su escudo, a su mascota o a su comunicación. En nuestros artículos sobre la cultura de grada y la historia de las camisetas puedes seguir profundizando en cómo los colores y los símbolos construyen la identidad de un club.",
        ]),
    ],
    fuentes=[UEFA, LALIGA, THEFA, FIGC],
    relac=["historia-de-las-camisetas-de-futbol-colores-dorsales-y-patrocinios", "cultura-de-grada-canticos-penas-y-rituales-del-aficionado", "derbis-y-rivalidades-mas-famosas-del-futbol", "glosario-del-futbol-terminos-y-jerga-explicados"],
    faq=[
        ("¿Por qué al Real Madrid le llaman «merengues»?", "", "Por su camiseta blanca, que recuerda al merengue, el dulce de clara de huevo batida.", ""),
        ("¿Por qué al Atlético le llaman «colchoneros»?", "", "Porque las rayas rojas y blancas de su camiseta recordaban a las de los colchones de la época.", ""),
        ("¿Por qué el Arsenal es «los gunners»?", "", "Porque nació en 1886 como club de los trabajadores de la fábrica de armamento Royal Arsenal, en Woolwich.", ""),
        ("¿Qué significa «azzurri»?", "", "Es el apodo de la selección italiana por el azul de la casa de Saboya, cuyo color heredó el equipo nacional.", ""),
    ],
)

PROPIEDAD = dict(
    slug="quien-es-el-dueno-de-un-club-de-futbol-socios-regla-50-1-sad-y-multipropiedad",
    titulo="¿Quién es el dueño de un club de fútbol? Socios, regla 50+1, sociedades anónimas y multipropiedad",
    desc="Los modelos de propiedad de los clubes de fútbol: clubes de socios (Real Madrid, Barcelona, Athletic, Osasuna), regla 50+1 alemana, SAD, fondos y grupos con varios clubes. Ventajas e inconvenientes.",
    resumen="No todos los clubes tienen dueño. Algunos pertenecen a sus socios, otros a empresarios o a fondos, y hay grupos que controlan varios equipos a la vez. Esta guía explica cada modelo y sus consecuencias.",
    secciones=[
        ("Tres formas de ser dueño de un club", [
            "En el fútbol conviven tres grandes modelos de propiedad. El primero es el club de socios: la entidad pertenece a sus aficionados, que votan para elegir al presidente y a la junta directiva. El segundo es la sociedad anónima, en la que un accionista, un grupo o un fondo de inversión posee el club, como cualquier empresa. El tercero son los modelos mixtos, como el alemán, que combinan la participación de los socios con inversores externos, pero con límites para evitar el control total por parte de un propietario.",
            "Cada modelo tiene consecuencias. En un club de socios, las decisiones deben respetar la voluntad de una mayoría de aficionados, pero a cambio el club tiene menos capacidad de captar capital rápido. En una sociedad anónima, el propietario puede invertir fuertemente, pero también puede cambiar el rumbo del club, venderlo o ponerlo en riesgo si las cuentas fallan.",
        ]),
        ("Los clubes de socios en España", [
            "En España, una ley de 1990 obligó a los clubes profesionales a convertirse en sociedades anónimas deportivas (SAD), con la excepción de los que tuvieran un balance económico positivo en los años anteriores. Cuatro clubes se acogieron a esa excepción y conservaron su modelo de socios: el Real Madrid, el FC Barcelona, el Athletic Club y el Club Atlético Osasuna. Son clubes con miles de socios que votan en elecciones o en asambleas, y cuyos presidentes tienen que rendir cuentas ante ellos.",
            "El resto de los clubes de LaLiga son SAD, con accionistas privados, que pueden ser empresarios locales, familias o grupos inversores extranjeros. Algunos mantienen una fuerte identidad local, y otros se han convertido en negocios internacionales. La diferencia entre unos y otros se nota en las decisiones sobre fichajes, estadios y presupuestos.",
        ]),
        ("La regla 50+1 de Alemania", [
            "En Alemania, la Bundesliga aplica la llamada «regla 50+1». Según ella, un inversor externo no puede controlar la mayoría de los derechos de voto de un club: el 50 % más uno debe seguir en manos de la asociación de socios. Su objetivo es proteger la influencia de los aficionados y evitar que un propietario tome decisiones sin su apoyo. Esta regla ayuda a explicar por qué las entradas en Alemania son en general más baratas que en otras grandes ligas y por qué los estadios suelen estar llenos.",
            "Existen excepciones históricas. El Bayer Leverkusen y el Wolfsburgo, vinculados a las empresas Bayer y Volkswagen, pueden ser propiedad de la compañía porque llevan más de veinte años recibiendo su apoyo, y el Hoffenheim recibió la excepción por la inversión de su benefactor Dietmar Hopp. El RB Leipzig, vinculado a una marca de bebidas energéticas, cumple la norma con una estructura de pocos socios con derecho a voto, algo que ha generado mucha polémica entre las aficiones alemanas.",
        ]),
        ("Dueños privados y fondos", [
            "En la Premier League, la mayoría de los clubes son propiedad de empresarios, familias o fondos de inversión. El Manchester City está en manos del City Football Group, un grupo con capital de Abu Dabi desde 2008, y el París Saint-Germain pertenece desde 2011 a Qatar Sports Investments. En el Manchester United, la familia estadounidense Glazer compró el club en 2005 y, en 2024, el empresario británico Jim Ratcliffe, de la empresa Ineos, adquirió una participación minoritaria y asumió la dirección deportiva.",
            "Los dueños privados pueden aportar inversión, estadios modernos y estabilidad financiera, pero también generan críticas, sobre todo cuando asumen deudas del club o toman decisiones sin consultar a la afición. Por eso existen reglas de control económico, como el fair play financiero de la UEFA, que limitan los gastos de los clubes en relación con sus ingresos.",
        ]),
        ("Multipropiedad: varios clubes, un mismo dueño", [
            "Un fenómeno creciente es la multipropiedad: un mismo grupo controla varios clubes de distintos países. El City Football Group tiene participaciones en equipos de Europa, Estados Unidos, Asia y Sudamérica; Red Bull gestiona clubes en Alemania, Austria y otros países; y la familia Pozzo ha dirigido a la vez al Udinese, al Watford y al Granada. Estos modelos permiten compartir ojeadores y fichar talentos, pero plantean un problema de competencia si dos clubes del mismo grupo se enfrentan.",
            "La UEFA lo regula: un mismo propietario no puede controlar dos clubes que participen en la misma competición europea, y por eso en 2017 el RB Salzburgo y el RB Leipzig tuvieron que modificar su estructura para poder jugar la misma Champions. En nuestras páginas de TIKITEXTO puedes ampliar cómo funcionan los clubes, de dónde sale su dinero y qué es el control económico.",
        ]),
    ],
    fuentes=[UEFA, LALIGA, DFL, ("Premier League", "https://www.premierleague.com/")],
    relac=["como-funciona-un-club-de-futbol-por-dentro", "de-donde-sale-el-dinero-de-un-club-de-futbol-ingresos-y-gastos", "que-es-el-control-economico-en-el-futbol-fair-play-financiero", "historia-de-la-premier-league-de-1992-a-hoy-invencibles-leicester-y-globalizacion"],
    faq=[
        ("¿Qué clubes españoles son de socios?", "", "El Real Madrid, el FC Barcelona, el Athletic Club y el Club Atlético Osasuna. El resto de los clubes profesionales son sociedades anónimas deportivas.", ""),
        ("¿Qué es la regla 50+1?", "", "Una norma alemana según la cual la asociación de socios debe conservar el 50 % más uno de los derechos de voto de un club.", ""),
        ("¿Qué es una SAD?", "", "Una sociedad anónima deportiva: la forma jurídica que adoptaron en España la mayoría de los clubes tras la ley de 1990.", ""),
        ("¿Puede un mismo dueño tener dos clubes en la Champions?", "", "No. La UEFA no permite que un mismo propietario controle a dos equipos de la misma competición europea.", ""),
    ],
)

LATERAL = dict(
    slug="evolucion-del-lateral-en-el-futbol-de-defensor-a-carrilero-y-lateral-interior",
    titulo="Evolución del lateral en el fútbol: de defensor a carrilero, extremo y lateral interior",
    desc="Cómo ha cambiado la posición de lateral en la historia del fútbol: de la defensa pura a los laterales ofensivos de Brasil, los carrileros de los sistemas con tres centrales y el lateral que juega por dentro.",
    resumen="Los laterales ya no se limitan a defender la banda. Esta guía cuenta cómo pasaron de marcadores a jugadores decisivos en ataque, con ejemplos de cada época y las tácticas que lo explican.",
    secciones=[
        ("Los laterales de antes: defender y despejar", [
            "En los primeros sistemas tácticos, como el 2-3-5 y el «WM» de los años treinta, los defensas de las bandas tenían una misión clara: marcar al extremo rival y despejar el balón. Se les exigía fuerza, colocación y contundencia, y se valoraba que no se aventuraran más allá de la línea del centro del campo. Se les consideraba defensas puros, y subir al ataque era una excepción que podía ser reprochada por el entrenador.",
            "Esa idea cambió poco a poco. Los entrenadores empezaron a descubrir que las bandas eran un espacio amplio, con menos rivales que el centro del campo, y que un lateral que subiera podía generar superioridad numérica. El primero en hacerlo de forma sistemática fue el fútbol brasileño de los años cincuenta y sesenta, con jugadores como Djalma Santos y Nílton Santos, este último apodado «la Enciclopedia» por su dominio del juego, que se incorporaban al ataque con naturalidad.",
        ]),
        ("El lateral ofensivo: Facchetti, Cafu y Roberto Carlos", [
            "En los años sesenta, el italiano Giacinto Facchetti revolucionó el puesto en el Inter de Helenio Herrera. Era un lateral izquierdo alto, rápido y técnico que subía por la banda con velocidad y llegó a marcar casi sesenta goles en su carrera, algo insólito para un defensa. Su ejemplo influyó en toda una generación de laterales que se atrevieron a atacar.",
            "La gran edad de oro de los laterales llegó con Brasil. Cafú, por la derecha, y Roberto Carlos, por la izquierda, fueron los dos laterales titulares de la selección campeona del mundo en 2002 y de grandes clubes europeos. Roberto Carlos, además, es recordado por un tiro libre con efecto, ante Francia en 1997, que desafió a la física. Después llegaron laterales como Dani Alves o Marcelo, que convirtieron la banda en una zona de creación, con asistencias, regates y goles.",
        ]),
        ("El carrilero: una banda entera para uno solo", [
            "En los sistemas con tres centrales, como el 3-5-2 o el 3-4-3, desaparece el lateral tradicional y aparece el carrilero, también llamado «wing-back». Su misión es cubrir toda la banda, de arriba abajo: defiende cuando el equipo pierde el balón y se convierte en extremo cuando lo recupera. Exige una condición física extraordinaria y mucha inteligencia táctica, porque debe saber cuándo subir y cuándo quedarse.",
            "Este sistema se hizo muy popular en el fútbol italiano y ganó mucho protagonismo en Inglaterra cuando Antonio Conte lo utilizó en el Chelsea de 2016-17 para ganar la Premier League. Hoy lo usan clubes de todo el mundo, y jugadores como Achraf Hakimi, que ha jugado como carrilero en el Inter y en el París Saint-Germain, son ejemplos de la nueva generación del puesto.",
        ]),
        ("El lateral interior: jugar por dentro", [
            "La última evolución es la del lateral que, con el balón, se mueve hacia el centro del campo. Pep Guardiola fue uno de sus grandes impulsores: en el Bayern de Múnich, en 2013, trasladó a Philipp Lahm al centro del campo en las fases de posesión. Más tarde, en el Manchester City, utilizó a defensas como John Stones o Kyle Walker de una forma híbrida: eran defensas cuando el equipo defendía y se convertían en centrocampistas cuando atacaba.",
            "Con esta fórmula, el lateral ayuda a controlar el centro del campo, protege al equipo frente a los contraataques y libera la banda para el extremo. También se ha aplicado en Inglaterra con Trent Alexander-Arnold, un lateral derecho del Liverpool que destacaba por su pase largo y su visión de juego, lo que llevó a su entrenador a utilizarlo en ocasiones como organizador desde una posición más centrada.",
        ]),
        ("Qué se le pide hoy a un lateral", [
            "Un lateral moderno debe combinar cualidades muy distintas: velocidad para correr cuarenta o cincuenta metros en repetición, calidad técnica para centrar y combinar, inteligencia para saber cuándo cerrar por dentro, y disciplina para defender el duelo individual contra un extremo. Por eso es una de las posiciones más exigentes físicamente y una de las que más ha evolucionado. En nuestros artículos sobre posiciones y formaciones puedes ver cómo encaja cada jugador en un sistema.",
            "El entrenamiento del lateral moderno también ha cambiado: se trabaja la resistencia a las repeticiones de sprints, el pase largo y la lectura de los espacios interiores. En el fútbol base es frecuente que algunos extremos acaben convertidos en laterales, porque su velocidad y su regate resultan muy útiles en una posición que tiene mucho espacio por delante.",
        ]),
    ],
    fuentes=[UEFA, FIFA, RSSSF],
    relac=["posiciones-del-futbol-que-hace-cada-jugador", "formaciones-tacticas-442-433-explicadas", "grandes-ideas-tacticas-de-la-historia-del-futbol-y-los-entrenadores-que-las-crearon", "estilos-de-juego-en-el-futbol-posesion-contraataque-y-presion"],
    faq=[
        ("¿Qué es un carrilero?", "", "Un jugador que ocupa toda la banda en sistemas con tres centrales, defendiendo y atacando por ese carril.", ""),
        ("¿Qué es un lateral interior?", "", "Un lateral que, con balón, se mueve hacia el centro del campo para ayudar a controlar el juego.", ""),
        ("¿Quién revolucionó el puesto de lateral en los años sesenta?", "", "Giacinto Facchetti, del Inter de Helenio Herrera, que subía por la banda con una velocidad y una técnica inusuales en un defensa.", ""),
        ("¿Quiénes fueron los laterales de Brasil campeón del mundo en 2002?", "", "Cafú por la derecha y Roberto Carlos por la izquierda.", ""),
    ],
)

SERIEA = dict(
    slug="historia-de-la-serie-a-y-el-calcio-del-catenaccio-al-calciopoli-y-la-actualidad",
    titulo="Historia de la Serie A y el calcio: del catenaccio y el Gran Torino al Calciopoli y la actualidad",
    desc="El recorrido de la liga italiana desde su fundación en 1929: el Grande Torino, el catenaccio, la edad de oro de los años ochenta y noventa, el escándalo del Calciopoli de 2006 y los campeones actuales.",
    resumen="La Serie A ha vivido tragedias, ideas revolucionarias, fichajes de ensueño y un gran escándalo. Esta guía resume su historia, de los orígenes en 1929 a la actualidad.",
    secciones=[
        ("Los orígenes: de los grupos regionales a la Serie A", [
            "Durante los primeros años del fútbol italiano, el campeonato se disputaba por grupos regionales, y los equipos del norte, que concentraban la industria y la población, dominaban. En la temporada 1929-30 se jugó por primera vez un campeonato nacional con una sola categoría, que es el origen de la Serie A actual. El primer campeón de esa nueva era fue el Ambrosiana, nombre que tuvo el Inter durante el régimen fascista, que impuso cambiar los nombres que sonaban extranjeros.",
            "En esos años surgieron también los grandes clubes del país. La Juventus ganó cinco títulos consecutivos entre 1931 y 1935, y el Torino construyó en los años cuarenta un equipo legendario: el «Grande Torino», que ganó cinco ligas seguidas. Su historia terminó de forma trágica el 4 de mayo de 1949, cuando el avión que los traía de un partido en Lisboa se estrelló contra la basílica de Superga, cerca de Turín, y murieron 31 personas, incluida toda la plantilla.",
        ]),
        ("El catenaccio y la época de los grandes entrenadores", [
            "Italia es famosa por su escuela táctica. El «catenaccio» (el cerrojo) fue un sistema defensivo basado en la marca al hombre, un líbero libre detrás de los defensas y los contraataques rápidos. El entrenador argentino Helenio Herrera lo llevó a su máxima expresión en el «Grande Inter» de los años sesenta, que ganó tres ligas, dos Copas de Europa y dos Copas Intercontinentales. Mucha gente asocia el catenaccio con un fútbol defensivo, pero sus defensores subrayan que se trataba de un sistema muy disciplinado que aprovechaba los errores del rival.",
            "A finales de los años ochenta, el Milan de Arrigo Sacchi propuso lo contrario: una defensa en zona, presión alta y un bloque muy compacto. Con jugadores como Van Basten, Gullit y Rijkaard, ganó dos Copas de Europa seguidas (1989 y 1990) y cambió el pensamiento táctico de toda una generación de entrenadores. Italia demostró así que podía ser vanguardia tanto en la defensa como en el ataque.",
        ]),
        ("La edad de oro de los años ochenta y noventa", [
            "En los años ochenta y noventa, la Serie A era considerada la mejor liga del mundo. Atraía a las mayores estrellas: Diego Maradona llegó al Nápoles en 1984 por un traspaso que fue récord mundial y lideró al equipo hacia dos títulos de liga, en 1987 y 1990, los dos primeros de su historia. Platini, Zico, Falcao, Van Basten, Gullit, Baggio, Zidane o Ronaldo Nazário jugaron en Italia, que dominaba también las competiciones europeas.",
            "La liga tenía el mejor nivel de competitividad y los estadios, siempre llenos, eran famosos por su ambiente. Los equipos grandes, con presupuestos importantes, podían fichar a cualquier jugador. Esa época sigue siendo una referencia para los aficionados, que recuerdan cómo una jornada de Serie A reunía a los mejores futbolistas del planeta.",
        ]),
        ("El Calciopoli y los años posteriores", [
            "En 2006 estalló el escándalo conocido como «Calciopoli», que destapó una trama de relaciones indebidas entre directivos de clubes y árbitros. La justicia deportiva sancionó a la Juventus con la retirada de los títulos de 2004-05 y 2005-06 y el descenso a Serie B. El título de 2005-06 se concedió al Inter, y el de 2004-05 quedó vacante. Fue el mayor escándalo de la historia del fútbol italiano.",
            "Pese a todo, la Juventus regresó a la élite y ganó nueve ligas consecutivas entre 2011-12 y 2019-20. Después, el Inter ganó la liga 2020-21, el Milan la 2021-22 tras once años de sequía, el Nápoles la 2022-23, su primer título desde la época de Maradona, y el Inter la 2023-24, la vigésima de su historia, que le dio su segunda estrella. En los últimos años los clubes italianos han apostado por reformar sus estadios y mejorar su situación económica para recuperar protagonismo.",
        ]),
        ("Qué hace especial a la Serie A", [
            "La Serie A conserva una identidad propia: rivalidades históricas como el derbi de Milán, el Derby della Capitale o el Derbi de Italia, estadios con historia como San Siro, y una cultura táctica que sigue formando a entrenadores de todo el mundo. Aunque ya no domina el mercado como antes, sigue siendo una de las ligas más seguidas del planeta. En TIKITEXTO puedes consultar los palmarés de los grandes clubes italianos y los datos de las competiciones europeas con fuentes oficiales.",
        ]),
    ],
    fuentes=[FIGC, UEFA, FIFA],
    relac=["grandes-ideas-tacticas-de-la-historia-del-futbol-y-los-entrenadores-que-las-crearon", "derbis-y-rivalidades-mas-famosas-del-futbol", "historia-de-la-champions-league-de-la-copa-de-europa-a-hoy", "liga-de-futbol-mas-antigua-del-mundo"],
    faq=[
        ("¿Cuándo empezó la Serie A?", "", "La primera temporada con una sola categoría nacional fue la 1929-30, que ganó el Ambrosiana, nombre del Inter en esa época.", ""),
        ("¿Qué fue el Grande Torino?", "", "El equipo que ganó cinco ligas seguidas en los años cuarenta y desapareció en el accidente aéreo de Superga el 4 de mayo de 1949.", ""),
        ("¿Qué es el catenaccio?", "", "Un sistema defensivo italiano basado en la marca al hombre, un líbero y los contraataques rápidos, popularizado por el Inter de Helenio Herrera.", ""),
        ("¿Qué fue el Calciopoli?", "", "El escándalo de 2006 por el que la Juventus perdió los títulos de 2004-05 y 2005-06 y descendió a Serie B.", ""),
    ],
)

LIBERTADORES = dict(
    slug="historia-de-la-copa-libertadores-campeones-finales-y-el-fenomeno-brasileno",
    titulo="Historia de la Copa Libertadores: campeones, grandes finales y el dominio de los clubes brasileños",
    desc="Cómo nació la Copa Libertadores en 1960, qué clubes la han ganado más veces, la histórica final de Madrid entre River y Boca en 2018 y por qué los clubes de Brasil dominan los últimos años.",
    resumen="La Libertadores es la gran competición de clubes de Sudamérica. Este artículo explica su origen, sus campeones históricos y los cambios de formato más recientes, con las finales más recordadas.",
    secciones=[
        ("Cómo nació la competición", [
            "La Copa Libertadores de América es el torneo de clubes más importante de Sudamérica, organizado por la Conmebol, la confederación continental. Su nombre rinde homenaje a los libertadores que lideraron la independencia de los países sudamericanos. Nació en 1960, inspirada en el éxito de la Copa de Europa, que desde 1955 enfrentaba a los campeones de liga del continente europeo, y su primera edición la ganó el Peñarol de Uruguay, que derrotó al Olimpia de Paraguay en la final.",
            "El campeón de la Libertadores se enfrentaba al campeón de Europa en la Copa Intercontinental, que se disputó entre 1960 y 2004, y hoy se clasifica para el Mundial de Clubes de la FIFA. Con los años, el torneo creció: empezó con pocos participantes y hoy reúne a clubes de las diez federaciones sudamericanas, tras una fase previa y una fase de grupos con treinta y dos equipos.",
        ]),
        ("Los grandes campeones", [
            "El club con más títulos de la Libertadores es el Independiente de Avellaneda, con siete, entre ellos cuatro consecutivos entre 1972 y 1975, algo que ningún otro equipo ha repetido, lo que le valió el apodo de «Rey de Copas». Le siguen Boca Juniors, con seis títulos (1977, 1978, 2000, 2001, 2003 y 2007), el Peñarol, con cinco, y River Plate, con cuatro (1986, 1996, 2015 y 2018). Argentina y Uruguay dominaron las primeras décadas del torneo, con equipos que se hicieron famosos por su garra.",
            "También brillaron los equipos brasileños, empezando por el Santos de Pelé, que ganó la Libertadores de 1962 y 1963. En las décadas siguientes, clubes como el Flamengo, el São Paulo, el Grêmio o el Palmeiras la consiguieron, y cada vez con más frecuencia. La competición, además, ha dado partidos legendarios por su ambiente, con estadios que se llenan de fuego, humo y música en cada eliminatoria.",
        ]),
        ("La final de Madrid y el nuevo formato", [
            "Una de las finales más recordadas de la historia fue la de 2018, el «Superclásico» entre River Plate y Boca Juniors. Se jugaba a doble partido, pero el partido de vuelta, previsto en el Monumental de Buenos Aires, se suspendió tras el ataque de unos aficionados al autobús de Boca. La Conmebol decidió jugarlo en el estadio Santiago Bernabéu de Madrid el 9 de diciembre de 2018. River ganó por 3-1 en la prórroga y conquistó su cuarto título.",
            "Tras aquella experiencia, la Conmebol cambió el formato: desde 2019, la final se juega a un único partido en un estadio neutral, como la final de la Champions League europea. La primera final de este tipo se jugó en Lima, y la ganó el Flamengo por 2-1 al River en el último minuto. Esta decisión unificó la forma de decidir el campeón y dio una gran visibilidad al torneo.",
        ]),
        ("El fenómeno brasileño", [
            "Desde 2019, los clubes brasileños han ganado todas las ediciones de la Libertadores: Flamengo (2019 y 2022), Palmeiras (2020 y 2021), Fluminense (2023) y Botafogo (2024). Es una racha excepcional de seis títulos seguidos. Los expertos la atribuyen a la fuerza económica de los clubes brasileños, que gracias a los ingresos de televisión y a los patrocinios pueden retener a sus mejores jugadores y fichar a talentos de otros países sudamericanos.",
            "Este dominio ha abierto un debate: ¿se está perdiendo el equilibrio competitivo del torneo? Los aficionados de Argentina, Uruguay o Colombia piden fórmulas para que los clubes de todos los países sigan teniendo opciones, mientras que los clubes brasileños reivindican su trabajo. En todo caso, la Libertadores sigue siendo un torneo de gran emoción y de gran tradición.",
        ]),
        ("La Sudamericana y otras copas del continente", [
            "La Libertadores tiene una competición hermana, la Copa Sudamericana, que reúne a clubes que no se clasifican para la primera, y que se parece a la Europa League. También existen torneos de selecciones como la Copa América, la más antigua del mundo entre selecciones, y las eliminatorias sudamericanas para el Mundial, que muchos consideran las más difíciles del planeta. En nuestras páginas sobre los torneos continentales de selecciones puedes seguir profundizando.",
            "Para los aficionados, una de las señas de la Libertadores es su ambiente. Los estadios sudamericanos se llenan de banderas y cánticos, y las eliminatorias se viven como si fueran finales. Muchos jugadores cuentan que el torneo les enseñó a competir bajo presión antes de dar el salto a Europa, un camino que han seguido numerosos futbolistas sudamericanos.",
        ]),
    ],
    fuentes=[CONMEBOL, FIFA],
    relac=["torneos-continentales-de-selecciones-copa-america-copa-africana-y-copa-asiatica", "mundial-de-clubes-y-copa-intercontinental-historia-y-formato", "champions-europa-league-conference-league-diferencias", "derbis-y-rivalidades-mas-famosas-del-futbol"],
    faq=[
        ("¿Cuándo nació la Copa Libertadores?", "", "En 1960. La primera edición la ganó el Peñarol, que derrotó al Olimpia en la final.", ""),
        ("¿Qué club ha ganado más Libertadores?", "", "El Independiente de Avellaneda, con siete títulos, incluidos cuatro seguidos entre 1972 y 1975.", ""),
        ("¿Dónde se jugó la final River-Boca de 2018?", "", "En el estadio Santiago Bernabéu de Madrid, el 9 de diciembre de 2018. Ganó River por 3-1 en la prórroga.", ""),
        ("¿Desde cuándo se juega la final a partido único?", "", "Desde 2019, en un estadio neutral.", ""),
    ],
)

ARTICULOS_O = [ANTIGUOS, APODOS, PROPIEDAD, LATERAL, SERIEA, LIBERTADORES]
