# -*- coding: utf-8 -*-
"""Artículos largos (parte I, 13-nov-2026). Entrenador, calendario, historia de la Champions, tecnología, balón parado y psicología.
Texto propio de TIKITEXTO, basado en información pública de la UEFA, la FIFA, el IFAB y las federaciones."""

ENTRENADOR = dict(
    slug="que-hace-un-entrenador-de-futbol-funciones-y-cuerpo-tecnico",
    titulo="Qué hace un entrenador de fútbol: funciones y cuerpo técnico",
    desc="Qué hace realmente un entrenador de fútbol y quién forma su cuerpo técnico: ayudantes, preparadores físicos, entrenador de porteros, analistas y médicos, y cómo se reparten el trabajo durante la semana.",
    resumen="Desde la grada parece que el entrenador solo elige once jugadores y grita instrucciones desde la banda. Su trabajo real empieza mucho antes del partido y lo comparte con un equipo de especialistas. Este artículo explica qué hace cada uno.",
    secciones=[
        ("Mucho más que elegir la alineación", [
            "La función más visible del entrenador es decidir quién juega y cómo se coloca el equipo, pero esa decisión es solo el final de un proceso largo. Durante la semana planifica los entrenamientos, define el estilo de juego que quiere practicar, estudia al rival y habla con los jugadores para mantener un grupo que funcione.",
            "También es el principal intermediario entre el vestuario y el club. Habla con el director deportivo sobre qué refuerzos necesita, con los médicos sobre quién está disponible y con los propios futbolistas sobre sus minutos, sus dudas y su rendimiento. Muchos entrenadores dicen que gestionar personas ocupa más tiempo que dibujar tácticas.",
        ]),
        ("El cuerpo técnico, un equipo dentro del equipo", [
            "Ningún entrenador profesional trabaja solo. El segundo entrenador o ayudante dirige parte de las sesiones, aporta una segunda opinión y suele ser la persona de máxima confianza del primero. A su lado trabajan el preparador físico, que diseña la carga de entrenamiento para que los jugadores lleguen en buena forma sin lesionarse, y el entrenador de porteros, que dedica las sesiones a los guardametas porque su técnica es muy distinta a la del resto.",
            "Los clubes grandes añaden analistas de vídeo, que preparan resúmenes del rival y de los propios errores, y analistas de datos, que convierten las estadísticas en información útil. El área médica, con médicos y fisioterapeutas, completa el grupo y decide, junto al entrenador, cuándo es seguro que un lesionado vuelva.",
        ]),
        ("Cómo se reparte una semana de competición", [
            "En un equipo que juega una vez por semana, el día siguiente al partido se dedica a la recuperación: los titulares hacen ejercicio suave y los suplentes completan más carga. A mitad de semana llegan las sesiones más intensas, con trabajo físico y táctico, y en los últimos días se baja la carga y se ensayan jugadas concretas, como los saques de esquina o la salida del balón.",
            "Si hay dos o tres partidos en pocos días, la semana cambia: casi no hay entrenamiento fuerte y se prioriza descansar, recuperar y repasar vídeo. Por eso las plantillas amplias importan: permiten rotar jugadores sin perder demasiado nivel.",
        ]),
        ("Durante el partido: decisiones en tiempo real", [
            "En la banda, el entrenador observa si el plan funciona. Si el rival cambia de sistema o un jugador está cansado, puede ajustar la posición de varios futbolistas o hacer una sustitución. Las Reglas de Juego permiten un número limitado de cambios en cada partido, y elegir cuándo usarlos es una decisión estratégica.",
            "Mientras tanto, parte del cuerpo técnico trabaja en otro sitio: algunos analistas siguen el partido desde lo alto del estadio, donde la visión general del campo es mejor, y envían mensajes a la banda. El descanso es un momento clave para corregir lo que no ha salido bien.",
        ]),
        ("Cómo se llega a ser entrenador", [
            "En la mayoría de países, para dirigir a un equipo profesional hay que obtener títulos oficiales de entrenador, organizados por las federaciones nacionales siguiendo marcos que establece la UEFA. Estos cursos combinan teoría táctica, metodología, psicología y gestión de grupos, y se hacen por niveles.",
            "Algunos entrenadores fueron grandes futbolistas; otros apenas jugaron a nivel profesional y construyeron su carrera desde los banquillos de categorías inferiores. Lo habitual es empezar en el fútbol base, pasar por clubes pequeños y, con resultados y contactos, dar el salto a equipos mayores. Es una profesión con mucha inestabilidad: un mal tramo de resultados puede costar el puesto.",
        ]),
        ('Estilos de liderazgo en el banquillo', [
            'No todos los entrenadores dirigen igual. Algunos son muy exigentes y controlan cada detalle; otros dan más libertad a los jugadores y confían en su criterio. Ninguno de los dos modelos garantiza el éxito: lo que funciona en un vestuario con jugadores jóvenes puede no servir en uno lleno de veteranos con mucha experiencia.',
            'Por eso se suele decir que un buen entrenador adapta su método a las personas que tiene. También influye la comunicación: explicar con claridad qué se espera de cada jugador y por qué, aunque no juegue, evita malentendidos y ayuda a que el grupo se sienta parte del proyecto. Un suplente que entiende su papel suele aportar más que uno que se siente olvidado.',
            'Otro aspecto clave es la relación con la prensa y con la afición. El entrenador es la cara pública del equipo: responde después de cada partido, explica sus decisiones y debe manejar preguntas incómodas. Saber transmitir calma en los malos momentos y no presumir en los buenos forma parte del oficio.',
        ]),
    ],
    fuentes=[("UEFA.com (formación de entrenadores)", "https://www.uefa.com/"), ("FIFA.com", "https://www.fifa.com/"), ("IFAB (Reglas de Juego)", "https://www.theifab.com/")],
    relac=["como-funciona-un-club-de-futbol-por-dentro", "formaciones-tacticas-442-433-explicadas", "preparacion-fisica-del-futbolista-entrenamiento-alimentacion-y-descanso"],
    faq=[("¿Quién forma el cuerpo técnico de un equipo?", "", "Normalmente el entrenador, un segundo entrenador, un preparador físico, un entrenador de porteros y, en clubes grandes, analistas de vídeo y datos más el equipo médico.", ""),
         ("¿Qué hace el segundo entrenador?", "", "Ayuda a dirigir los entrenamientos, aporta otra opinión táctica y apoya al primer entrenador durante el partido.", ""),
         ("¿Hace falta ser exjugador para ser entrenador?", "", "No. Lo que se exige son los títulos oficiales de entrenador; muchos técnicos de éxito apenas jugaron a nivel profesional.", "")],
)

CALENDARIO = dict(
    slug="calendario-del-futbol-temporadas-ventanas-de-fichajes-y-fechas-fifa",
    titulo="El calendario del fútbol: temporadas, ventanas de fichajes y fechas FIFA",
    desc="Cómo se organiza el año futbolístico: cuándo empiezan y acaban las temporadas, qué son las ventanas de fichajes, las fechas FIFA con selecciones y por qué a veces los clubes protestan por tantos partidos.",
    resumen="El fútbol parece no parar nunca, pero tiene un calendario con reglas: temporadas, parones, plazos para fichar y semanas reservadas a las selecciones. Este artículo explica cómo encajan todas las piezas y por qué el calendario genera tantos debates.",
    secciones=[
        ("La temporada: de verano a primavera", [
            "En la mayor parte de Europa, incluida España, la temporada de liga empieza en agosto y termina en mayo. Entre medias hay un parón por Navidad en algunos países, mientras que otros, como Inglaterra, aprovechan esas fechas para jugar más partidos. En cambio, muchas ligas de América y Asia siguen el año natural, de enero a diciembre.",
            "Esta diferencia tiene consecuencias prácticas: un futbolista puede cambiarse de hemisferio a mitad de una temporada y encontrarse con una competición que empieza o termina en otro momento. También explica por qué algunos torneos mundiales se disputan en fechas que alteran los campeonatos nacionales.",
        ]),
        ("Competiciones que se superponen", [
            "Un club importante no solo juega la liga. Además disputa la copa nacional y, si se clasifica, una competición europea como la Champions League, la Europa League o la Conference League. Eso significa partidos entre semana y mucha carga para los jugadores clave.",
            "Cada federación fija sus propias fechas, pero la UEFA coordina las jornadas europeas para que no choquen entre sí. Los equipos que llegan lejos en varias competiciones pueden jugar más de cincuenta partidos oficiales en una temporada, sin contar los amistosos de pretemporada.",
        ]),
        ("Las ventanas de fichajes", [
            "Un club no puede inscribir jugadores cuando quiera. Los traspasos se hacen en periodos fijados por las federaciones, llamados ventanas o mercados. En Europa suele haber una ventana larga en verano, que abarca los meses posteriores al final de la temporada, y una más corta en invierno, hacia enero.",
            "Cuando se cierra la ventana, un club ya no puede incorporar jugadores nuevos, salvo excepciones como futbolistas sin contrato. Por eso el último día del mercado se llena de rumores y negociaciones contra reloj. Las fechas exactas de cada país las publican sus federaciones y pueden variar un poco de una temporada a otra.",
        ]),
        ("Las fechas FIFA y los parones de selecciones", [
            "La FIFA reserva varias ventanas al año para que las selecciones jueguen sus partidos. Durante esos días los clubes deben ceder a los futbolistas convocados, y las ligas nacionales paran. En esas fechas se juegan clasificaciones para Mundiales y Eurocopas, torneos continentales y amistosos.",
            "Para los clubes, estos parones son un arma de doble filo: los jugadores se desgastan viajando y jugando con sus países, y a veces vuelven lesionados. Para las selecciones, son la única oportunidad de entrenar juntas, ya que el resto del año los jugadores están repartidos en distintos clubes.",
        ]),
        ("Por qué el calendario genera polémica", [
            "A medida que han aparecido nuevos formatos y más partidos, jugadores, entrenadores y sindicatos han alertado de que hay demasiada carga. Los futbolistas piden más descanso entre partidos y vacaciones suficientes, y los clubes se quejan cuando pierden jugadores por lesiones sufridas con la selección.",
            "Las competiciones, por su parte, argumentan que más partidos significan más ingresos y más espectáculo. Encontrar el equilibrio entre salud de los jugadores y negocio es uno de los debates abiertos del fútbol moderno, y cada cierto tiempo se revisan los formatos y las fechas.",
            'Además, el calendario afecta a los aficionados: los horarios de los partidos se reparten entre viernes, sábado, domingo y lunes para adaptarse a las televisiones, y no siempre coinciden con lo que más cómodo resulta a quien viaja para ver a su equipo. Consultar la web oficial de cada competición es la mejor forma de conocer las fechas y horas confirmadas, que a veces se modifican con poca antelación.',
        ]),
        ('Pretemporada y descansos', [
            'Antes de que arranque la liga, los clubes dedican semanas a la pretemporada. Es el periodo en que los jugadores recuperan la forma física tras las vacaciones, se prueban sistemas tácticos y se integran los fichajes. Suele incluir viajes y amistosos contra equipos de distintos países, que además tienen un componente comercial.',
            'Las vacaciones de los futbolistas son cortas, normalmente de unas pocas semanas, y cuando hay un Mundial o una Eurocopa se reducen todavía más para los internacionales. Los médicos recuerdan que el descanso no es un lujo: el cuerpo necesita tiempo para recuperarse del desgaste de once meses de competición.',
            'En las categorías de base y en el fútbol aficionado el calendario es más relajado, pero también tiene fechas clave: inscripciones, torneos de fin de temporada y parones escolares. Conocer estas fechas ayuda a las familias a organizarse.',
        ]),
    ],
    fuentes=[("UEFA.com (calendario de competiciones)", "https://www.uefa.com/"), ("FIFA.com (calendario internacional)", "https://www.fifa.com/"), ("LaLiga.com", "https://www.laliga.com/")],
    relac=["como-se-ficha-a-un-futbolista-paso-a-paso", "champions-europa-league-conference-league-diferencias", "formatos-de-competicion-liga-copa-y-playoff"],
    faq=[("¿Cuándo empieza y termina la temporada en España?", "", "La liga suele empezar en agosto y terminar en mayo, con la fecha exacta fijada cada año por la competición.", ""),
         ("¿Qué es una ventana de fichajes?", "", "Un periodo en el que los clubes pueden inscribir jugadores nuevos; fuera de él, normalmente no se pueden incorporar futbolistas.", ""),
         ("¿Qué son las fechas FIFA?", "", "Semanas reservadas por la FIFA para que las selecciones jueguen partidos y las ligas de clubes se detengan.", "")],
)

CHAMPIONS = dict(
    slug="historia-de-la-champions-league-de-la-copa-de-europa-a-hoy",
    titulo="Historia de la Champions League: de la Copa de Europa a hoy",
    desc="Repaso a la historia de la Champions League: cómo nació la Copa de Europa en los años cincuenta, el dominio inicial del Real Madrid, el cambio de nombre y los formatos que ha tenido hasta la actualidad.",
    resumen="La Champions League es hoy la competición de clubes más seguida del mundo, pero empezó siendo un torneo de eliminatorias directas. Este artículo cuenta cómo nació, cómo ha cambiado su formato y qué momentos marcaron su historia.",
    secciones=[
        ("Un periódico y una idea", [
            "A mediados de los años cincuenta, el periódico francés L'Équipe impulsó la creación de una competición que enfrentara a los mejores clubes de Europa. La UEFA, que se había fundado en 1954, se encargó de organizarla. La primera edición de la Copa de Europa de Campeones de Club se jugó en la temporada 1955-56 y reunió a campeones de liga de distintos países.",
            "El formato era sencillo: eliminatorias a ida y vuelta, en las que pasaba el equipo que sumaba mejor resultado, hasta llegar a una final. No había fase de grupos ni segundas oportunidades. Un mal partido podía dejar fuera a un favorito.",
        ]),
        ("El Real Madrid, primer gran dominador", [
            "El Real Madrid ganó las cinco primeras ediciones consecutivas, entre 1956 y 1960. Aquel equipo, con figuras como Alfredo Di Stéfano y Ferenc Puskás, convirtió el torneo en símbolo del club y lo hizo famoso fuera de España. Desde entonces, la relación entre el Madrid y la competición ha sido tan estrecha que el club es el que más veces la ha conquistado.",
            "En las décadas siguientes otros equipos europeos construyeron sus propias épocas doradas. Clubes de Italia, Inglaterra, Alemania, Países Bajos y Portugal ganaron la copa en distintos momentos, lo que demostró que el torneo era realmente continental.",
        ]),
        ("Del K.O. al nacimiento de la Champions", [
            "Con el tiempo, la UEFA fue modificando el formato. En los primeros años noventa introdujo una fase de grupos, que garantizaba a los equipos más partidos y, por tanto, más ingresos. En la temporada 1992-93 la competición pasó a llamarse oficialmente Liga de Campeones, o Champions League.",
            "Otro cambio importante fue abrir la competición a equipos que no habían sido campeones de liga. Antes solo participaba el campeón de cada país; después pudieron entrar también los mejores clasificados de las grandes ligas. Esto elevó el nivel y el atractivo del torneo, pero también despertó debates sobre si perdía su esencia de copa de campeones.",
        ]),
        ("Un torneo que se reinventa", [
            "Los formatos han seguido evolucionando. En los últimos años se ha hablado de más equipos, nuevas fases y un calendario ampliado, con el objetivo de aumentar el número de partidos de alto nivel. Quien quiera conocer el formato vigente debe consultarlo siempre en la UEFA, porque las reglas se modifican entre ciclos.",
            "Lo que sí ha permanecido es el protagonismo del himno, el balón estrella en el logotipo y la noche de partidos entre semana que muchos aficionados consideran un ritual. Esa identidad visual y sonora, que se consolidó a partir de los años noventa, ayudó a que la competición se reconociera en todo el mundo.",
        ]),
        ("Noches que se recuerdan", [
            "Si algo define a la Champions son sus remontadas y finales dramáticas. Cada generación de aficionados guarda su noche favorita: un gol en el tiempo añadido, una tanda de penaltis o una vuelta imposible. Las finales, que se juegan en un estadio elegido con antelación por la UEFA, se convierten en un acontecimiento para la ciudad anfitriona.",
            "Por eso, además de títulos, la historia de la Champions es una colección de momentos. Puedes consultar nuestras páginas de datos y la de las últimas finales para ver marcadores, sedes y goleadores en detalle.",
        ]),
        ('Ediciones y récords que definen la competición', [
            'A lo largo de su historia, la competición ha acumulado récords de goles, de títulos y de finales jugadas. Los clubes más laureados concentran gran parte de los trofeos, pero también hay campeones sorpresa que ganaron cuando nadie los esperaba, y subcampeones que perdieron varias finales sin levantar la copa.',
            'Para consultar los datos actualizados conviene acudir a la UEFA, que mantiene el archivo oficial de resultados y estadísticas. En TIKITEXTO publicamos páginas de datos con fecha de actualización y enlace a las fuentes, de modo que puedas comprobar cualquier cifra por tu cuenta.',
            'Entender esta historia ayuda a ver la Champions como lo que es: un torneo que ha cambiado de formato varias veces, pero que sigue basándose en una idea sencilla, la de enfrentar a los mejores equipos del continente en partidos de máxima exigencia.',
        ]),
    ],
    fuentes=[("UEFA.com (historia de la Champions League)", "https://www.uefa.com/uefachampionsleague/history/"), ("UEFA.com", "https://www.uefa.com/"), ("RSSSF (archivo de resultados)", "https://www.rsssf.org/")],
    relac=["remontadas-historicas-champions-league", "champions-europa-league-conference-league-diferencias", "trofeos-mas-importantes-del-futbol"],
    faq=[("¿Cuándo se jugó la primera Copa de Europa?", "", "En la temporada 1955-56, organizada por la UEFA con el impulso del periódico L'Équipe.", ""),
         ("¿Quién ganó las primeras ediciones?", "", "El Real Madrid ganó las cinco primeras, de 1956 a 1960.", ""),
         ("¿Cuándo se llamó Champions League?", "", "El nombre oficial de Liga de Campeones empezó con la temporada 1992-93.", "")],
)

TECNOLOGIA = dict(
    slug="tecnologia-en-el-futbol-linea-de-gol-balon-con-sensor-y-fuera-de-juego-semiautomatico",
    titulo="Tecnología en el fútbol: línea de gol, balón con sensor y fuera de juego semiautomático",
    desc="Qué tecnologías se usan en el fútbol moderno además del VAR: sistemas de línea de gol, balones con sensor, cámaras de seguimiento y fuera de juego semiautomático, y cómo ayudan a los árbitros.",
    resumen="El árbitro ya no está solo. Hoy dispone de sistemas que detectan si el balón cruzó la línea o si un jugador estaba adelantado. Este artículo explica qué hace cada tecnología, en qué se parecen y por qué el fútbol las adoptó poco a poco.",
    secciones=[
        ("Por qué el fútbol tardó en adoptar tecnología", [
            "Durante décadas, el fútbol defendió que las decisiones las tomara únicamente el árbitro, con sus errores incluidos. Se argumentaba que el juego debía ser igual en todos los niveles y que la tecnología costosa no estaría al alcance de los clubes modestos. Ese equilibrio empezó a romperse cuando algunos goles fantasma y errores muy visibles se vieron una y otra vez en televisión.",
            "Hoy el IFAB, que fija las Reglas de Juego, autoriza varias tecnologías, pero deja que cada competición decida si las usa y cuáles. Por eso no todos los torneos tienen los mismos sistemas.",
        ]),
        ("La tecnología de línea de gol", [
            "Es el sistema más antiguo de los actuales. Su función es sencilla: avisar al árbitro, en un segundo, de si el balón ha cruzado entera la línea de meta. Algunos sistemas usan cámaras de alta velocidad alrededor de la portería y otros emplean un campo magnético. En ambos casos, la información llega al reloj del árbitro mediante una vibración y un mensaje.",
            "Lo que hace útil esta tecnología es que decide solo hechos objetivos: el balón entró o no entró. No interpreta intenciones ni faltas. Por eso es una de las herramientas con menos controversia.",
        ]),
        ("El balón con sensor", [
            "Algunos torneos utilizan balones que llevan un sensor en el interior. Este dispositivo registra con precisión el instante en que un jugador golpea el balón, lo que resulta muy útil para saber en qué momento exacto se produjo un pase y valorar si había fuera de juego. El sensor no cambia las sensaciones del balón al jugar y se carga sin necesidad de abrirlo.",
            "Los datos de estos balones se combinan con las cámaras del estadio para sincronizar lo que ve el sistema con lo que pasa en el campo. Así se reduce el margen de error al marcar el momento de un pase.",
        ]),
        ("Fuera de juego semiautomático", [
            "El fuera de juego es una de las reglas más difíciles de aplicar a simple vista, porque se juzga en milésimas de segundo. Los sistemas semiautomáticos usan varias cámaras especiales para seguir a cada jugador y localizar puntos de su cuerpo, de modo que el ordenador puede avisar cuando detecta una posible infracción en el momento del pase.",
            "Se llaman semiautomáticos porque siempre interviene una persona: los árbitros del VAR confirman la decisión antes de comunicarla al árbitro principal. Además, en los estadios se muestra a menudo una animación en pantalla para que el público entienda por qué se anuló una jugada.",
        ]),
        ("Lo que la tecnología no puede resolver", [
            "Estos sistemas ayudan con hechos medibles, pero no pueden decidir todo. Cuando hay que valorar si una falta es merecedora de tarjeta o si una mano es voluntaria, sigue haciendo falta el criterio humano. Por eso hay discusiones incluso con el VAR.",
            "También se debate cuánto tiempo se pierde revisando jugadas y si la tecnología quita emoción a los goles. Los defensores de estas herramientas responden que corregir errores claros hace el juego más justo. Lo cierto es que el fútbol lleva años buscando un punto medio entre rapidez, justicia y emoción.",
        ]),
        ('Qué opinan jugadores y aficionados', [
            'La recepción de estas tecnologías ha sido desigual. Muchos jugadores agradecen que se corrijan errores claros, sobre todo los goles que no se concedían o se concedían sin llegar a entrar. Otros critican que las revisiones rompan el ritmo del partido y que la celebración de un gol quede en suspenso hasta que se confirma.',
            'Entre los aficionados también hay división. Quienes están en el estadio echan en falta información cuando una decisión tarda en explicarse; por eso muchas competiciones han empezado a mostrar en las pantallas las imágenes que se están revisando o a comunicar por megafonía qué se analiza.',
            'En el fútbol base y en las categorías inferiores, estas herramientas no existen, y las decisiones siguen siendo humanas. Eso recuerda que el reglamento es el mismo en todas partes, y que el árbitro, con o sin tecnología, es quien dirige el partido.',
        ]),
    ],
    fuentes=[("IFAB (Reglas de Juego y tecnología)", "https://www.theifab.com/"), ("FIFA.com (FIFA Quality Programme)", "https://www.fifa.com/"), ("UEFA.com", "https://www.uefa.com/")],
    relac=["como-funciona-el-var-en-el-futbol", "fuera-de-juego-regla-historia-var", "quien-es-quien-en-un-partido-arbitros-y-senales"],
    faq=[("¿Qué es la tecnología de línea de gol?", "", "Un sistema que avisa al árbitro en un instante si el balón ha cruzado por completo la línea de meta.", ""),
         ("¿El fuera de juego semiautomático decide solo?", "", "No: avisa de una posible infracción y los árbitros del VAR la confirman antes de comunicarla.", ""),
         ("¿Todos los torneos usan la misma tecnología?", "", "No; el IFAB las autoriza, pero cada competición decide cuáles aplica.", "")],
)

BALONPARADO = dict(
    slug="balon-parado-en-el-futbol-corners-faltas-y-jugadas-ensayadas",
    titulo="Balón parado en el fútbol: córners, faltas y jugadas ensayadas",
    desc="Qué es el balón parado y por qué decide tantos partidos: cómo se organizan córners y faltas, la defensa en zona y al hombre, las jugadas ensayadas y el papel de los especialistas.",
    resumen="Una gran parte de los goles nace con el balón detenido: un córner, una falta o un saque de banda. Este artículo explica cómo se preparan estas acciones, qué estrategias existen y por qué muchos entrenadores las entrenan tanto como el resto del juego.",
    secciones=[
        ("Qué se considera balón parado", [
            "Se llama balón parado a cualquier acción en la que el juego se reanuda con el balón quieto: saques de esquina, faltas directas e indirectas, penaltis, saques de banda y saques de puerta. Estos momentos son especiales porque el equipo que ataca puede colocar a sus jugadores con calma y buscar un golpe que las jugadas normales no ofrecen.",
            "Al detenerse el partido, el entrenador puede dar instrucciones, y los jugadores recuerdan lo que han trabajado en la semana. Por eso el balón parado suele ser el ámbito más ensayado de todo el fútbol.",
        ]),
        ("Los córners: ataque y defensa", [
            "En un córner, el equipo que ataca suele enviar el balón al área con la intención de que un compañero remate de cabeza. Hay dos tipos de envío: el que va hacia el palo cercano, donde se intenta un desvío a la red, y el que cae en el palo lejano, donde espera un rematador. También existen los córners cortos, en los que dos jugadores se pasan el balón antes de centrar.",
            "Para defender, los equipos usan marcaje al hombre, en el que cada defensor sigue a un rival, marcaje en zona, en el que cada uno cubre un espacio, o sistemas mixtos. Los porteros intervienen con mucho protagonismo, saliendo a por el balón o ayudando a ordenar la defensa.",
            'Un detalle que marca diferencias es la calidad del primer contacto. Si el defensor despeja lejos del área, el equipo gana tiempo para reorganizarse; si el balón queda cerca, el atacante tiene una segunda oportunidad. Por eso se entrena tanto la posición del cuerpo antes de saltar y la coordinación con el portero.',
        ]),
        ("Faltas y barreras", [
            "En una falta directa cercana al área, el equipo que ataca puede intentar un lanzamiento por encima o por un lateral de la barrera, la fila de defensores que se coloca a una distancia reglamentaria del balón. El tirador debe elegir si lanza directamente a portería o si busca un pase a un compañero.",
            "Los equipos suelen tener uno o dos especialistas en este tipo de golpeo. A veces dos jugadores se colocan junto al balón para despistar sobre quién va a lanzar. Del lado defensivo, el portero dirige la colocación de la barrera para tapar parte de la portería.",
            'Las Reglas de Juego fijan una distancia mínima entre el balón y la barrera y prohíben que los atacantes se metan dentro de ella cuando están a menos de un metro. En competiciones con espray evanescente, el árbitro marca con una línea blanca temporal dónde va el balón y dónde debe colocarse la barrera, lo que evita discusiones y ahorra tiempo.',
        ]),
        ("Jugadas ensayadas", [
            "Una jugada ensayada es una secuencia preparada de antemano: movimientos coordinados de varios jugadores para sorprender a la defensa. Puede incluir bloqueos legales, carreras al primer palo, pases atrás o simulaciones. Algunas se repiten durante todo un año y otras se estrenan en un partido importante.",
            "Para evitar que el rival las prepare, muchos entrenadores guardan una variante nueva para cierto encuentro. Los equipos analizan en vídeo cómo defiende su adversario el balón parado y buscan puntos débiles. De ahí que haya entrenadores especializados únicamente en estas acciones.",
        ]),
        ("Por qué importan tanto", [
            "En partidos muy igualados, un solo gol decide el resultado, y el balón parado ofrece una vía directa para conseguirlo. Los equipos que juegan con menos posesión pero tienen buenos rematadores aprovechan estas acciones para competir contra rivales más técnicos.",
            "Para los aficionados, fijarse en cómo se coloca un equipo en un córner ayuda a entender mejor el partido. Merece la pena observar quién se queda en el borde del área, quién ataca el primer palo y cómo se protege el contragolpe rival.",
            'Conviene recordar, eso sí, que el balón parado no sustituye al juego: sirve de complemento. Un equipo que depende solo de córners y faltas se vuelve previsible, y los rivales terminan preparándose para ellos. Los mejores equipos combinan una buena construcción del juego con acciones a balón parado bien trabajadas, de modo que tienen varias formas de llegar al gol y no dependen de una sola.',
        ]),
        ('Cómo practicarlo en un entrenamiento', [
            'Para entrenar el balón parado se necesita poco material: balones, conos y un portero. Los equipos suelen dedicar sesiones breves, de veinte o treinta minutos, a repasar córners ofensivos y defensivos y a probar variantes de faltas. Es habitual dividir al grupo en atacantes y defensores y repetir cada acción varias veces.',
            'Un consejo para equipos aficionados es asignar a cada jugador una tarea clara: quién lanza, quién ataca el primer palo, quién se queda atrás por si hay contragolpe. Cuando todos saben lo que tienen que hacer, mejora mucho la coordinación, aunque el equipo no tenga grandes especialistas.',
            'También conviene practicar la reacción tras el rechace: muchos goles de balón parado llegan en la segunda jugada, cuando el primer remate sale rebotado. Estar atento al rebote es una pequeña ventaja que se consigue con atención y repetición.',
        ]),
    ],
    fuentes=[("IFAB (Reglas de Juego: saques y faltas)", "https://www.theifab.com/"), ("UEFA.com (análisis técnico)", "https://www.uefa.com/"), ("FIFA.com", "https://www.fifa.com/")],
    relac=["reglas-basicas-del-futbol-para-principiantes", "formaciones-tacticas-442-433-explicadas", "historia-y-evolucion-del-portero"],
    faq=[("¿Qué es el balón parado?", "", "Cualquier jugada que se reanuda con el balón quieto: córner, falta, penalti, saque de banda o de puerta.", ""),
         ("¿Qué es una jugada ensayada?", "", "Una secuencia preparada de antemano en el entrenamiento para sorprender a la defensa rival.", ""),
         ("¿Qué diferencia hay entre marcaje al hombre y en zona?", "", "En el primero cada defensor sigue a un rival; en el segundo cada uno se encarga de un espacio del área.", "")],
)

PSICOLOGIA = dict(
    slug="psicologia-del-futbolista-presion-confianza-y-penaltis",
    titulo="Psicología del futbolista: presión, confianza y penaltis",
    desc="Cómo influye la mente en el rendimiento de un futbolista: la gestión de la presión, la confianza tras un error, el papel del psicólogo deportivo y por qué los penaltis son una prueba tan mental.",
    resumen="Un futbolista juega con las piernas, pero también con la cabeza. La presión del público, el miedo a fallar o la confianza después de un gol cambian el rendimiento. Este artículo explica cómo se trabajan estos aspectos y por qué los penaltis son el ejemplo más claro.",
    secciones=[
        ("Jugar bajo presión", [
            "Un jugador profesional actúa delante de miles de personas en el estadio y millones por televisión. Cada pase se comenta y cada error puede convertirse en tema de conversación durante días. Aprender a convivir con esa exposición es una parte esencial de la carrera, y muchos talentos jóvenes no consiguen consolidarse porque no soportan esa presión.",
            "Algunos futbolistas aprenden a concentrarse únicamente en la siguiente acción en lugar de pensar en el resultado. Otros usan rutinas fijas antes de salir al campo, como la manera de atarse las botas o de entrar al césped, para encontrar calma. Son recursos sencillos pero eficaces.",
        ]),
        ("La confianza y los errores", [
            "La confianza influye mucho en el rendimiento. Un jugador que acaba de marcar un gol suele arriesgar más y tomar mejores decisiones; uno que ha fallado una ocasión clara puede dudar en la siguiente. Por eso los entrenadores insisten en olvidar pronto el error y en pensar en la jugada que viene.",
            "Existe también la memoria de grupo: un equipo que ha ganado muchos partidos seguidos tiende a creer que puede remontar cualquier marcador, y uno que acumula derrotas puede bloquearse con facilidad. Cambiar esa dinámica requiere cuidar al grupo tanto como mejorar la táctica.",
        ]),
        ("El psicólogo deportivo", [
            "Cada vez más clubes cuentan con psicólogos deportivos que trabajan con los jugadores, sobre todo en categorías de cantera. Su labor incluye enseñar técnicas de concentración, ayudar a gestionar la frustración tras una derrota y acompañar a los futbolistas en momentos difíciles como una lesión larga o un cambio de club.",
            "También colaboran con el cuerpo técnico para mejorar la comunicación dentro del vestuario. No sustituyen al entrenador, pero aportan una mirada especializada sobre cómo se sienten los jugadores y qué necesitan para rendir.",
        ]),
        ("Penaltis: una prueba mental", [
            "Un penalti reúne toda la presión del fútbol en una sola acción: el balón está a once metros, el portero espera y el estadio guarda silencio. Técnicamente es un golpeo sencillo, pero emocionalmente es muy exigente, sobre todo cuando decide una eliminatoria.",
            "Muchos lanzadores repiten el mismo ritual: respirar, elegir un lado antes de tomar carrerilla y no cambiar de opinión. Los porteros, por su parte, estudian los hábitos de cada tirador. En una tanda, la decisión previa y la rutina valen casi tanto como la técnica.",
        ]),
        ("Cuidar la mente fuera del campo", [
            "La salud mental se ha convertido en un tema más abierto en el fútbol. Futbolistas de distintos países han hablado públicamente de la ansiedad, la presión mediática o el cansancio emocional. Sus testimonios han ayudado a que clubes y federaciones presten más atención al bienestar de los jugadores.",
            "Descansar, tener vida fuera del fútbol y contar con personas de confianza son hábitos que ayudan a los deportistas, igual que a cualquiera. Y para los aficionados, recordar que detrás de cada camiseta hay una persona ayuda a juzgar con más empatía un error en el campo.",
            'Los clubes también empiezan a educar a las familias de los jugadores jóvenes. Entender que la presión de los padres desde la banda puede afectar al rendimiento y a las ganas de jugar de un niño es un primer paso. Un entorno que valora el esfuerzo y el aprendizaje, y no solo el resultado, ayuda a formar futbolistas más seguros y personas más equilibradas, algo que a largo plazo también mejora el rendimiento deportivo.',
        ]),
        ('Consejos para jugadores jóvenes', [
            'Si juegas al fútbol en cualquier categoría, hay hábitos mentales que puedes practicar. Uno es fijar objetivos pequeños para cada partido, como ganar un duelo o dar un pase hacia delante, en lugar de pensar solo en ganar. Otro es respirar hondo antes de un lanzamiento importante y concentrarte en un único punto de la portería.',
            'Es útil también hablar con compañeros y entrenadores cuando algo te preocupa. Los equipos más sólidos suelen tener un ambiente en el que se puede reconocer un error sin miedo. Aprender de lo que sale mal es mucho más productivo que castigarse por ello.',
            'Por último, recuerda que disfrutar es parte del rendimiento. Los jugadores que se divierten suelen arriesgar más y rendir con mayor naturalidad. Si la presión empieza a quitarte las ganas de jugar, habla con un adulto de confianza o con un profesional.',
        ]),
    ],
    fuentes=[("UEFA.com (bienestar de los jugadores)", "https://www.uefa.com/"), ("FIFA.com", "https://www.fifa.com/"), ("FIFPRO (sindicato mundial de futbolistas)", "https://fifpro.org/")],
    relac=["historia-tandas-de-penaltis", "preparacion-fisica-del-futbolista-entrenamiento-alimentacion-y-descanso", "como-llegar-a-futbolista-profesional-camino-y-cantera"],
    faq=[("¿Por qué son tan difíciles los penaltis?", "", "Porque la técnica es sencilla, pero la presión de decidir un partido hace que la parte mental pese mucho.", ""),
         ("¿Qué hace un psicólogo deportivo?", "", "Enseña técnicas de concentración y gestión de emociones y acompaña a los jugadores en momentos difíciles.", ""),
         ("¿Qué es una rutina antes de lanzar?", "", "Una secuencia fija de gestos o respiraciones que ayuda al jugador a mantener la calma.", "")],
)

ARTICULOS_I = [ENTRENADOR, CALENDARIO, CHAMPIONS, TECNOLOGIA, BALONPARADO, PSICOLOGIA]
