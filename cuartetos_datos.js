/* CUARTETOS TIKITEXTO · datos (15-nov-2026)
   Cada jugador: «Nombre|selección|posición|clubes|marcas». Clubes: lista CERRADA de 13 (hay que anotar TODOS por los que pasó en el primer equipo).
   Marcas: b = ganó el Balón de Oro · w = campeón del mundo con su selección.
   Se excluyeron a propósito los jugadores en activo de España (plantilla 2026 por confirmar) y los premios recientes dudosos.
   Revisar cada verano (fichajes y retiradas). Sin escudos, fotos ni logos: solo texto. */

export const CLUBES = {
  RM: "Real Madrid", FCB: "Barcelona", ATM: "Atlético", BAY: "Bayern", JUV: "Juventus", MIL: "Milan", INT: "Inter",
  MUN: "Manchester United", LIV: "Liverpool", CHE: "Chelsea", ARS: "Arsenal", MCI: "Manchester City", PSG: "PSG",
};
export const SELECCIONES = { ES: "España", FR: "Francia", DE: "Alemania", IT: "Italia", EN: "Inglaterra", BR: "Brasil", AR: "Argentina", PT: "Portugal", NL: "Países Bajos", UY: "Uruguay", HR: "Croacia", BE: "Bélgica" };
export const POSICIONES = { P: "Porteros", D: "Defensas", M: "Centrocampistas", F: "Delanteros" };

const J = `
Messi|AR|F|FCB,PSG|bw
Cristiano Ronaldo|PT|F|MUN,RM,JUV|b
Modrić|HR|M|RM|b
Kaká|BR|M|MIL,RM|bw
Zidane|FR|M|JUV,RM|bw
Ronaldo Nazário|BR|F|FCB,INT,RM,MIL|bw
Ronaldinho|BR|F|PSG,FCB,MIL|bw
Rivaldo|BR|F|FCB,MIL|bw
Cannavaro|IT|D|INT,JUV,RM|bw
Benzema|FR|F|RM|b
Beckenbauer|DE|D|BAY|bw
Gerd Müller|DE|F|BAY|bw
Matthäus|DE|M|BAY,INT|bw
Rummenigge|DE|F|BAY,INT|b
Platini|FR|M|JUV|b
Van Basten|NL|F|MIL|b
Gullit|NL|M|MIL,CHE|b
Cruyff|NL|F|FCB|b
Baggio|IT|F|JUV,MIL,INT|b
Figo|PT|M|FCB,RM,INT|b
Paolo Rossi|IT|F|JUV,MIL|bw
Owen|EN|F|LIV,RM,MUN|b
Sammer|DE|M|INT|b
Papin|FR|F|MIL,BAY|b
Bobby Charlton|EN|M|MUN|bw
Casillas|ES|P|RM|w
Xavi|ES|M|FCB|w
Iniesta|ES|M|FCB|w
Puyol|ES|D|FCB|w
Piqué|ES|D|FCB,MUN|w
Sergio Ramos|ES|D|RM,PSG|w
Busquets|ES|M|FCB|w
David Villa|ES|F|FCB,ATM|w
Fernando Torres|ES|F|ATM,LIV,CHE,MIL|w
Raúl|ES|F|RM|
Fàbregas|ES|M|ARS,FCB,CHE|w
Xabi Alonso|ES|M|LIV,RM,BAY|w
David Silva|ES|M|MCI|w
Mata|ES|M|CHE,MUN|w
Pedro|ES|F|FCB,CHE|w
Hierro|ES|D|RM|
Henry|FR|F|ARS,FCB,JUV|w
Thuram|FR|D|JUV,FCB|w
Desailly|FR|D|MIL,CHE|w
Vieira|FR|M|ARS,JUV,INT,MCI|w
Makélélé|FR|M|RM,CHE,PSG|
Pires|FR|M|ARS|w
Barthez|FR|P|MUN|w
Blanc|FR|D|FCB,INT,MUN|w
Deschamps|FR|M|JUV,CHE|w
Lizarazu|FR|D|BAY|w
Mbappé|FR|F|PSG,RM|w
Griezmann|FR|F|ATM,FCB|w
Pogba|FR|M|MUN,JUV|w
Kanté|FR|M|CHE|w
Varane|FR|D|RM,MUN|w
Giroud|FR|F|ARS,CHE,MIL|w
Ribéry|FR|M|BAY|
Neuer|DE|P|BAY|w
Lahm|DE|D|BAY|w
Kroos|DE|M|BAY,RM|w
Thomas Müller|DE|F|BAY|w
Klose|DE|F|BAY|w
Özil|DE|M|RM,ARS|w
Khedira|DE|M|RM,JUV|w
Schweinsteiger|DE|M|BAY,MUN|w
Götze|DE|M|BAY|w
Kahn|DE|P|BAY|
Ballack|DE|M|BAY,CHE|
Boateng|DE|D|MCI,BAY|w
Hummels|DE|D|BAY|w
Gündoğan|DE|M|MCI,FCB|
Havertz|DE|F|CHE,ARS|
Sané|DE|F|MCI,BAY|
Kimmich|DE|M|BAY|
Podolski|DE|F|BAY,ARS,INT|w
Klinsmann|DE|F|INT,BAY|w
Brehme|DE|D|BAY,INT|w
Buffon|IT|P|JUV,PSG|w
Maldini|IT|D|MIL|
Baresi|IT|D|MIL|
Pirlo|IT|M|MIL,INT,JUV|w
Totti|IT|F||w
Nesta|IT|D|MIL|w
Gattuso|IT|M|MIL|w
Inzaghi|IT|F|JUV,MIL|w
Del Piero|IT|F|JUV|w
Zambrotta|IT|D|JUV,FCB,MIL|w
Materazzi|IT|D|INT|w
Toni|IT|F|BAY,JUV|w
Chiellini|IT|D|JUV|
Bonucci|IT|D|INT,JUV,MIL|
Zola|IT|F|CHE|
Vieri|IT|F|ATM,JUV,INT,MIL|
Zoff|IT|P|JUV|w
Beckham|EN|M|MUN,RM,MIL,PSG|
Rooney|EN|F|MUN|
Gerrard|EN|M|LIV|
Lampard|EN|M|CHE,MCI|
Terry|EN|D|CHE|
Lineker|EN|F|FCB|
Scholes|EN|M|MUN|
Rio Ferdinand|EN|D|MUN|
Ashley Cole|EN|D|ARS,CHE|
Sterling|EN|F|LIV,MCI,CHE,ARS|
Stones|EN|D|MCI|
Joe Hart|EN|P|MCI|
Bellingham|EN|M|RM|
Declan Rice|EN|M|ARS|
Foden|EN|M|MCI|
Walker|EN|D|MCI|
Saka|EN|F|ARS|
Romário|BR|F|FCB|w
Cafu|BR|D|MIL|w
Roberto Carlos|BR|D|INT,RM|w
Dani Alves|BR|D|FCB,JUV,PSG|
Neymar|BR|F|FCB,PSG|
Thiago Silva|BR|D|MIL,PSG,CHE|
Marcelo|BR|D|RM|
Casemiro|BR|M|RM,MUN|
Dida|BR|P|MIL|w
Alisson|BR|P|LIV|
Ederson|BR|P|MCI|
Gabriel Jesus|BR|F|MCI,ARS|
Vinícius Jr.|BR|F|RM|
Lúcio|BR|D|BAY,INT|w
Gilberto Silva|BR|M|ARS|w
Adriano|BR|F|INT|
Robinho|BR|F|RM,MCI,MIL|
Coutinho|BR|M|INT,LIV,FCB,BAY|
David Luiz|BR|D|CHE,PSG,ARS|
Fernandinho|BR|M|MCI|
Maradona|AR|M|FCB|w
Di María|AR|F|RM,MUN,PSG,JUV|w
Agüero|AR|F|ATM,MCI|
Tévez|AR|F|MUN,MCI,JUV|
Mascherano|AR|M|LIV,FCB|
Zanetti|AR|D|INT|
Crespo|AR|F|INT,MIL,CHE|
Simeone|AR|M|ATM,INT|
Higuaín|AR|F|RM,JUV,MIL,CHE|
Julián Álvarez|AR|F|MCI,ATM|w
Enzo Fernández|AR|M|CHE|w
Mac Allister|AR|M|LIV|w
Lautaro Martínez|AR|F|INT|w
Dybala|AR|F|JUV|w
Dibu Martínez|AR|P|ARS|w
De Paul|AR|M|ATM|w
Riquelme|AR|M|FCB|
Saviola|AR|F|FCB,RM|
Heinze|AR|D|PSG,MUN,RM|
Pepe|PT|D|RM|
Deco|PT|M|FCB,CHE|
Bernardo Silva|PT|M|MCI|
Cancelo|PT|D|JUV,MCI,BAY,FCB|
João Félix|PT|F|ATM,CHE,FCB,MIL|
Rui Costa|PT|M|MIL|
Nani|PT|F|MUN|
Ricardo Carvalho|PT|D|CHE,RM|
Bruno Fernandes|PT|M|MUN|
Rúben Dias|PT|D|MCI|
Rijkaard|NL|M|MIL|
Koeman|NL|D|FCB|
Bergkamp|NL|F|INT,ARS|
Robben|NL|F|CHE,RM,BAY|
Sneijder|NL|M|RM,INT|
Van Persie|NL|F|ARS,MUN|
Van der Sar|NL|P|JUV,MUN|
Seedorf|NL|M|RM,INT,MIL|
Davids|NL|M|MIL,JUV,INT,FCB|
Stam|NL|D|MUN,MIL|
Van Dijk|NL|D|LIV|
Frenkie de Jong|NL|M|FCB|
Depay|NL|F|MUN,FCB,ATM|
De Ligt|NL|D|JUV,BAY,MUN|
Overmars|NL|F|ARS,FCB|
Kluivert|NL|F|MIL,FCB|
Luis Suárez|UY|F|LIV,FCB,ATM|
Forlán|UY|F|MUN,ATM,INT|
Godín|UY|D|ATM,INT|
Cavani|UY|F|PSG,MUN|
Valverde|UY|M|RM|
Araújo|UY|D|FCB|
Recoba|UY|M|INT|
Rakitić|HR|M|FCB|
Mandžukić|HR|F|ATM,BAY,JUV,MIL|
Perišić|HR|M|INT,BAY|
Šuker|HR|F|RM,ARS|
Kovačić|HR|M|INT,RM,CHE,MCI|
Gvardiol|HR|D|MCI|
Brozović|HR|M|INT|
Boban|HR|M|MIL|
Prosinečki|HR|M|RM,FCB|
Hazard|BE|F|CHE,RM|
De Bruyne|BE|M|CHE,MCI|
Courtois|BE|P|ATM,CHE,RM|
Lukaku|BE|F|CHE,INT,MUN|
Kompany|BE|D|MCI|
Witsel|BE|M|ATM|
Carrasco|BE|F|ATM|
Doku|BE|F|MCI|
Origi|BE|F|LIV,MIL|
`.trim().split("\n").map((l) => { const q = l.split("|"); return { n: q[0], s: q[1], p: q[2], c: q[3] ? q[3].split(",") : [], b: q[4].indexOf("b") >= 0, w: q[4].indexOf("w") >= 0 }; });
export const JUGADORES = J;

/* Clubes por país y estadios por país (nombres originales; no se traducen) */
export const CLUBES_PAIS = {
  "Inglaterra": ["Liverpool", "Arsenal", "Chelsea", "Tottenham", "Everton", "Newcastle", "Aston Villa", "West Ham", "Manchester City", "Manchester United"],
  "España": ["Real Madrid", "Barcelona", "Atlético", "Sevilla", "Valencia", "Villarreal", "Betis", "Athletic", "Real Sociedad", "Celta"],
  "Italia": ["Juventus", "Milan", "Inter", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", "Torino", "Sampdoria"],
  "Alemania": ["Bayern", "Dortmund", "Leverkusen", "Leipzig", "Schalke", "Werder Bremen", "Wolfsburgo", "Stuttgart", "Eintracht Frankfurt", "Gladbach"],
  "Francia": ["PSG", "Marseille", "Lyon", "Monaco", "Lille", "Nice", "Bordeaux", "Rennes", "Lens", "Nantes"],
  "Portugal": ["Benfica", "Porto", "Sporting", "Braga", "Vitória", "Boavista"],
  "Países Bajos": ["Ajax", "PSV", "Feyenoord", "AZ", "Twente", "Utrecht"],
};
export const ESTADIOS_PAIS = {
  "Inglaterra": ["Anfield", "Old Trafford", "Stamford Bridge", "Emirates Stadium", "Etihad Stadium", "Wembley", "St James' Park", "Goodison Park"],
  "España": ["Santiago Bernabéu", "Camp Nou", "Metropolitano", "Mestalla", "Sánchez-Pizjuán", "San Mamés", "Benito Villamarín", "Anoeta"],
  "Italia": ["San Siro", "Stadio Olimpico", "Allianz Stadium", "Stadio Maradona", "Artemio Franchi", "Luigi Ferraris"],
  "Alemania": ["Allianz Arena", "Signal Iduna Park", "Veltins-Arena", "Weserstadion", "Volksparkstadion", "Olympiastadion"],
  "Francia": ["Parc des Princes", "Stade Vélodrome", "Groupama Stadium", "Stade de France", "Stade Louis II"],
  "Brasil": ["Maracaná", "Morumbi", "Mineirão", "Arena Corinthians", "Beira-Rio"],
  "Argentina": ["La Bombonera", "El Monumental", "El Cilindro", "Libertadores de América"],
  "Portugal": ["Estádio da Luz", "Estádio do Dragão", "José Alvalade", "Estádio D. Afonso Henriques"],
  "Países Bajos": ["Johan Cruijff Arena", "De Kuip", "Philips Stadion"],
};
