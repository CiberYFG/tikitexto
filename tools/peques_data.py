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

# Sopas de letras: palabras sin tildes, en horizontal, vertical y diagonal (de izquierda a derecha y de arriba abajo)
SOPAS = [
 dict(id="campo", titulo="Sopa 1 · En el campo", n=10, semilla=11,
      palabras=["BALON", "GOL", "PORTERO", "ARBITRO", "CAMPO", "CORNER", "PASE", "REGATE", "REDES", "PITO"]),
 dict(id="equipo", titulo="Sopa 2 · En el equipo", n=11, semilla=23,
      palabras=["CAPITAN", "DEFENSA", "DELANTERO", "SUPLENTE", "BANQUILLO", "ENTRENADOR", "CAMISETA", "BOTAS", "MEDIO", "EQUIPO"]),
 dict(id="mundial", titulo="Sopa 3 · El Mundial", n=12, semilla=37,
      palabras=["MUNDIAL", "COPA", "ESTADIO", "AFICION", "BANDERA", "HIMNO", "FINAL", "MEDALLA", "SELECCION", "CAMPEON", "TROFEO"]),
]
