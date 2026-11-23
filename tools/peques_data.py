# -*- coding: utf-8 -*-
"""Rincón de los peques (solo español): chistes, adivinanzas, trabalenguas, verdadero o falso y sopas de letras.
Textos propios de TIKITEXTO, pensados para niños (sin datos personales ni enlaces externos)."""

# (pregunta, respuesta)
CHISTES = [
 ("¿Por qué el balón fue al médico?", "Porque se sentía desinflado."),
 ("¿Cuál es el colmo de un portero?", "Que se le escape un suspiro."),
 ("¿Por qué los futbolistas son buenos pescadores?", "Porque siempre llenan la red."),
 ("¿Qué hace un futbolista en el cine?", "Pedir un pase."),
 ("¿Por qué el entrenador llevaba un paraguas?", "Porque esperaba una lluvia de goles."),
 ("¿Qué animal es el mejor portero?", "El pulpo, porque tiene ocho manos."),
 ("¿Qué animal es el mejor delantero?", "El ciempiés, porque nunca se queda sin botas."),
 ("¿Por qué la jirafa es la reina de los córners?", "Porque llega al balón sin saltar."),
 ("¿Qué hace una abeja en el campo de fútbol?", "Zumba por la banda."),
 ("¿Cuál es el deporte favorito de los fantasmas?", "El «bú-tbol»."),
 ("¿Por qué el pulpo no puede jugar de defensa?", "Porque le pitarían mano a cada momento."),
 ("¿Qué es lo único que nunca se queja de que lo pisen en el fútbol?", "El césped."),
 ("¿Por qué los futbolistas son buenos músicos?", "Porque saben tocar el balón."),
 ("¿Por qué los porteros nunca se pierden?", "Porque siempre están en su área."),
 ("¿Qué le dice una portería a otra?", "«¡Qué buena red tienes!»"),
 ("¿Por qué el árbitro siempre tiene la razón?", "Porque lleva el silbato y el que tiene el silbato tiene la última palabra."),
 ("¿Qué le dijo el balón al delantero?", "«¡Deja de darme patadas, que solo quiero rodar!»"),
 ("¿Por qué el delantero llevaba una escalera?", "Porque quería meter el balón por el ángulo."),
]
# chistes en forma de diálogo (texto completo)
DIALOGOS = [
 "—Mamá, hoy he marcado tres goles. —¡Qué bien, hijo! ¿Y en qué portería? —En la nuestra.",
 "—Doctor, me siento como un balón. —Tranquilo, con unos buenos pases se le quita.",
 "—Papá, ¿qué es un córner? —Es el rincón donde se va a pensar cuando fallas un penalti.",
 "—¿Sabes por qué el campo de fútbol es de césped? —No. —Porque con ladrillos dolería mucho más.",
 "—Entrenador, ¿puedo jugar de portero? —¿Tienes experiencia? —Sí, ¡me encanta parar la tele cuando hay anuncios!",
]

# (adivinanza, respuesta)
ADIVINANZAS = [
 ("Soy redonda y salto mucho, me pegan y no me quejo; y si entro en la red, todos gritan: «¡Gol!». ¿Quién soy?", "El balón."),
 ("Con guantes y sin ser boxeador, paro lo que otros disparan con furor. ¿Quién soy?", "El portero."),
 ("Visto de negro y llevo un silbato; sin mí nadie sabe si es falta o si es gato. ¿Quién soy?", "El árbitro."),
 ("Tengo dos palos y un larguero, y una red donde cae el balón. ¿Qué soy?", "La portería."),
 ("Soy amarilla o roja, y cuando sales de tu bolsillo, hay un jugador que se pone a temblar. ¿Qué soy?", "La tarjeta."),
 ("Es verde, lo pisan todos, nadie le pide perdón. ¿Qué es?", "El césped."),
 ("Cuando entro en la red, todos gritan sin parar. ¿Qué soy?", "Un gol."),
 ("Desde un punto blanco te miro, y entre tú y yo solo hay un portero. ¿Qué es?", "Un penalti."),
 ("Cada cuatro años, mil millones me miran. Soy una copa dorada. ¿Qué soy?", "La Copa del Mundo."),
 ("Llevo un número en la espalda y mi color es el de mi equipo. ¿Qué soy?", "La camiseta."),
 ("Estoy en una esquina del campo y sirvo para sacar el balón con ventaja. ¿Qué soy?", "El córner."),
 ("Me siento en el banquillo esperando mi momento. ¿Quién soy?", "El suplente."),
 ("No juego, pero mando; grito desde la banda y enseño tácticas. ¿Quién soy?", "El entrenador."),
 ("Tengo muchas gradas y siempre estoy lleno de gente que canta. ¿Qué soy?", "El estadio."),
]

TRABALENGUAS = [
 "Pepe pasa el balón a Pablo, Pablo pasa el balón a Paco y Paco pierde el balón para Pepe.",
 "El delantero deslumbrante dribla a la defensa desorientada y dispara desde dentro del área.",
 "Cuando cuentes cuántos goles cuenta Cuco, cuenta cuántos cuenta cuando Cuco cuenta.",
 "El árbitro Arturo arbitra al equipo azul y al equipo amarillo con atención y sin prisa.",
 "Si el portero pierde el partido, ¿cuánto pierde el portero perdido?",
 "El campeón canta con la copa y la copa canta con el campeón.",
 "Un gol, dos goles, tres goles, ¡y cuatro goles hizo el goleador en el gran estadio!",
]

# (afirmación, verdadero?, explicación)
VERDADERO_FALSO = [
 ("Un equipo de fútbol juega con once jugadores en el campo.", True, "Once jugadores por equipo, incluido el portero."),
 ("El portero puede coger el balón con las manos en cualquier parte del campo.", False, "Solo puede hacerlo dentro de su área."),
 ("Un partido de fútbol de adultos tiene dos partes de 45 minutos.", True, "Y entre las dos hay un descanso."),
 ("Si el balón sale por la banda, se saca de córner.", False, "Se saca de banda; el córner es cuando sale por la línea de fondo tras tocarlo un defensor."),
 ("La tarjeta roja significa que el jugador debe irse del partido.", True, "Si te expulsan, tu equipo juega con uno menos."),
 ("El Mundial se juega cada cuatro años.", True, "Es el torneo de selecciones más importante del mundo."),
 ("En el fútbol se puede marcar gol con la cabeza.", True, "Con la cabeza, con el pie o con el pecho. Con la mano, no."),
 ("Un gol en el fútbol vale dos puntos.", False, "Cada gol cuenta uno."),
 ("Los equipos pueden cambiar jugadores durante el partido.", True, "Son los cambios o sustituciones."),
 ("El árbitro usa un silbato para empezar y parar el juego.", True, "Y también para señalar faltas."),
 ("Un defensor puede coger el balón con la mano si el portero no está.", False, "Solo el portero puede, y dentro de su área."),
 ("El balón del fútbol es redondo.", True, "Y su tamaño oficial en adultos es el número 5."),
]

# --- Ampliación (23-nov-2026) ---
CHISTES_N = [
 ("¿Qué hace un portero cuando está aburrido?", "Cuenta los palos de su portería... ¡y siempre le salen tres!"),
 ("¿Por qué los futbolistas nunca pasan frío?", "Porque siempre están calentando."),
 ("¿Cuál es el postre favorito de los futbolistas?", "El tiramisú, porque siempre hay que tirarlo a puerta."),
 ("¿Por qué el delantero llevaba gafas?", "Porque quería ver la red de cerca."),
 ("¿Qué hace un balón cuando está triste?", "Se desinfla y pide un abrazo bien apretado."),
 ("¿Cuál es el colmo de un árbitro?", "Sacarle tarjeta roja a un semáforo."),
 ("¿Por qué la tortuga no puede jugar de extremo?", "Porque cuando llega a la banda ya han pitado el final."),
 ("¿Por qué el pingüino sería un gran entrenador?", "Porque siempre va de traje y mantiene la sangre fría."),
 ("¿Por qué el canguro es un maestro del remate?", "Porque salta a todos los balones."),
 ("¿Qué le dijo el larguero al poste?", "«Tú aguanta, que yo me encargo de que el balón rebote.»"),
 ("¿Por qué el reloj es el mejor amigo del árbitro?", "Porque le dice cuándo acaba el partido y cuánto descuento toca."),
 ("¿Qué le dijo el gol al delantero?", "«¡Por fin te encuentro, llevaba toda la tarde esperándote!»"),
]
DIALOGOS_N = [
 "—Profe, ¿por qué los futbolistas siempre corren? —Porque si se paran, el entrenador se enfada.",
 "—Mamá, hoy he metido un gol de chilena. —¿De Chile? —No, mamá, de las que se hacen cayendo de espaldas. —¡Con cuidado, que te vas a romper la camiseta!",
 "—Papá, en mi equipo yo soy el mejor jugador. —¿Y los demás? —Es que solo somos mi hermano y yo.",
 "—¿Por qué siempre te sientas en el banquillo? —Porque la silla del salón la ocupa mi hermano.",
 "—Entrenador, ¿puedo marcar con la mano? —No. —¿Y con la cabeza? —Sí. —¿Y con el pie? —También. —Entonces, ¿puedo marcar con la mano de mi hermano pequeño? —¡Pues no!",
]
ADIVINANZAS_N = [
 ("Estoy colgada de la portería y, sin mí, el gol no se vería. ¿Qué soy?", "La red."),
 ("Soy blanca y estoy pintada en el suelo; si el balón me cruza entero, el juego se detiene. ¿Qué soy?", "La línea del campo."),
 ("Corro con el balón, regateo a dos o tres, y cuando llego al área toca marcar. ¿Quién soy?", "El delantero."),
 ("Defiendo mi zona y no dejo pasar a nadie. ¿Quién soy?", "El defensa."),
 ("Reparto el juego, doy pases y no paro de correr entre el ataque y la defensa. ¿Quién soy?", "El centrocampista."),
 ("Cuando suena, el estadio entero se detiene; soy pequeño y agudo, y el árbitro me lleva en la boca. ¿Qué soy?", "El silbato."),
 ("Ayudo al árbitro mirando las jugadas en vídeo y me llaman con tres letras. ¿Quién soy?", "El VAR."),
 ("Me ponen en los pies, tengo tacos y me agarro al césped. ¿Qué soy?", "Las botas de fútbol."),
 ("Somos un grupo con la misma camiseta que nos ayudamos para ganar. ¿Qué somos?", "Un equipo."),
 ("Se canta en la grada, tiene letra y música, y anima a los once que están en el campo. ¿Qué es?", "Un cántico de la afición."),
]
TRABALENGUAS_N = [
 "El guardameta Gonzalo guarda con garbo el balón en su guante de gala.",
 "Tres tristes tigres tiran tres tiros a tres porterías tranquilas.",
 "Carlos coloca cinco conos cerca del córner y corre, corre, corre a colocar otros cuatro.",
 "Rápido regatea Ramiro y el rival rueda rendido tras el regate rápido.",
 "Si Sara saca un saque, el saque de Sara sale sin sorpresa y sin sustos.",
 "Un portero parado pide pases pequeños para no pasar penas ni apuros.",
]
VERDADERO_FALSO_N = [
 ("El Mundial de 2026 se juega en tres países: Estados Unidos, México y Canadá.", True, "Es la primera vez que un Mundial se reparte entre tres países y tiene 48 selecciones."),
 ("La portería de fútbol mide 7,32 metros de ancho.", True, "Y 2,44 metros de alto: es la medida oficial en el fútbol de once."),
 ("Un partido de fútbol siempre dura 120 minutos.", False, "Dura 90 minutos más el descuento. La prórroga solo se juega en algunas eliminatorias."),
 ("Si el balón toca el palo y entra, el gol es válido.", True, "Mientras cruce la línea entero, el gol cuenta."),
 ("El penalti se lanza desde once metros de la portería.", True, "Desde la marca blanca del área, a 11 metros."),
 ("Con dos tarjetas amarillas en un partido, el jugador es expulsado.", True, "La segunda amarilla equivale a una roja."),
 ("Brasil ha ganado cinco Mundiales masculinos.", True, "Los ganó en 1958, 1962, 1970, 1994 y 2002."),
 ("Para sacar de banda, el jugador puede usar las manos.", True, "Es de las pocas veces que un jugador de campo coge el balón con las manos: con las dos y por encima de la cabeza."),
 ("Un equipo puede tener 12 jugadores en el campo a la vez.", False, "Máximo once por equipo, incluido el portero."),
 ("La Champions League la juegan equipos de clubes de toda Europa.", True, "Se clasifican los mejores de las ligas europeas."),
 ("Un portero puede marcar un gol.", True, "Es muy raro, pero ha pasado, normalmente con un saque largo o un remate en un córner."),
 ("En una tanda de penaltis, cada equipo lanza primero cinco.", True, "Si siguen empatados, se continúa de uno en uno (muerte súbita)."),
 ("Un defensa y un portero visten exactamente el mismo color de camiseta.", False, "El portero lleva un color distinto para que el árbitro y los demás lo distingan."),
 ("El VAR sirve para ayudar al árbitro a revisar jugadas importantes con vídeo.", True, "Solo en jugadas clave: goles, penaltis, tarjetas rojas y errores de identidad."),
]
CHISTES.extend(CHISTES_N)
DIALOGOS.extend(DIALOGOS_N)
ADIVINANZAS.extend(ADIVINANZAS_N)
TRABALENGUAS.extend(TRABALENGUAS_N)
VERDADERO_FALSO.extend(VERDADERO_FALSO_N)

# Sopas de letras: palabras sin tildes, en horizontal, vertical y diagonal (de izquierda a derecha y de arriba abajo)
SOPAS = [
 dict(id="campo", titulo="Sopa 1 · En el campo", n=10, semilla=11,
      palabras=["BALON", "GOL", "PORTERO", "ARBITRO", "CAMPO", "CORNER", "PASE", "REGATE", "REDES", "PITO"]),
 dict(id="equipo", titulo="Sopa 2 · En el equipo", n=11, semilla=23,
      palabras=["CAPITAN", "DEFENSA", "DELANTERO", "SUPLENTE", "BANQUILLO", "ENTRENADOR", "CAMISETA", "BOTAS", "MEDIO", "EQUIPO"]),
 dict(id="mundial", titulo="Sopa 3 · El Mundial", n=12, semilla=37,
      palabras=["MUNDIAL", "COPA", "ESTADIO", "AFICION", "BANDERA", "HIMNO", "FINAL", "MEDALLA", "SELECCION", "CAMPEON", "TROFEO"]),
]
