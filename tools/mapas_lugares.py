#!/usr/bin/env python3
"""Banco de lugares del juego «Clava el sitio» (mapas.js).

Genera `mapas_lugares.js` (módulo ES). Cada lugar: tipo, nombre, subtítulo, coordenadas y la ciudad
(para mostrar «Ciudad, País» traducidos con los nombres de Natural Earth cuando existe).

Tipos:  est = estadio · nac = ciudad natal de un jugador · club = ciudad de un club
        sed = sede de una final (Mundial / Champions) · cur = curiosidad (pregunta propia en 6 idiomas)

Validación (python3 tools/mapas_lugares.py --check): cada lugar debe estar a menos de DMAX km de su ciudad
de referencia (la de Natural Earth si existe, o las coordenadas dadas). Así se cazan signos o cifras mal puestos.
Las coordenadas son de dominio común (ubicación de estadios y ciudades); revisadas con la ciudad más cercana.
"""
import json, math, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)

# ---------------------------------------------------------------- estadios
# (id, nombre, club o uso, ciudad NE (ASCII) o None, ciudad si no está en NE, ISO, lat, lon, dificultad 1-3)
ESTADIOS = [
    ("bernabeu", "Santiago Bernabéu", "Real Madrid", "Madrid", "", "ES", 40.4531, -3.6883, 1),
    ("campnou", "Camp Nou", "FC Barcelona", "Barcelona", "", "ES", 41.3809, 2.1228, 1),
    ("metropolitano", "Metropolitano", "Atlético de Madrid", "Madrid", "", "ES", 40.4362, -3.5994, 1),
    ("mestalla", "Mestalla", "Valencia CF", "Valencia", "", "ES", 39.4747, -0.3583, 1),
    ("sanchezpizjuan", "Ramón Sánchez-Pizjuán", "Sevilla FC", "Seville", "", "ES", 37.3840, -5.9706, 2),
    ("sanmames", "San Mamés", "Athletic Club", "Bilbao", "", "ES", 43.2641, -2.9494, 2),
    ("anoeta", "Reale Arena (Anoeta)", "Real Sociedad", "San Sebastian", "", "ES", 43.3013, -1.9738, 2),
    ("anfield", "Anfield", "Liverpool", "Liverpool", "", "GB", 53.4308, -2.9608, 1),
    ("oldtrafford", "Old Trafford", "Manchester United", "Manchester", "", "GB", 53.4631, -2.2913, 1),
    ("etihad", "Etihad Stadium", "Manchester City", "Manchester", "", "GB", 53.4831, -2.2004, 2),
    ("emirates", "Emirates Stadium", "Arsenal", "London", "", "GB", 51.5549, -0.1084, 1),
    ("stamford", "Stamford Bridge", "Chelsea", "London", "", "GB", 51.4817, -0.1910, 1),
    ("wembley", "Wembley", "", "London", "", "GB", 51.5560, -0.2796, 1),
    ("stjames", "St James' Park", "Newcastle United", "Newcastle", "", "GB", 54.9756, -1.6217, 2),
    ("villapark", "Villa Park", "Aston Villa", "Birmingham", "", "GB", 52.5090, -1.8847, 3),
    ("celticpark", "Celtic Park", "Celtic", "Glasgow", "", "GB", 55.8497, -4.2056, 2),
    ("sansiro", "San Siro (Giuseppe Meazza)", "Milan · Inter", "Milan", "", "IT", 45.4781, 9.1240, 1),
    ("olimpicoroma", "Stadio Olimpico", "Roma · Lazio", "Rome", "", "IT", 41.9341, 12.4547, 1),
    ("allianzstadium", "Allianz Stadium", "Juventus", "Turin", "", "IT", 45.1096, 7.6412, 2),
    ("stadiomaradona", "Diego Armando Maradona", "SSC Napoli", "Naples", "", "IT", 40.8279, 14.1931, 1),
    ("gewiss", "Gewiss Stadium", "Atalanta", "Bergamo", "", "IT", 45.7089, 9.6808, 3),
    ("allianzarena", "Allianz Arena", "Bayern München", "Munich", "", "DE", 48.2188, 11.6247, 1),
    ("signalIduna", "Signal Iduna Park", "Borussia Dortmund", "Dortmund", "", "DE", 51.4926, 7.4519, 1),
    ("olimpiaberlin", "Olympiastadion Berlin", "Hertha BSC", "Berlin", "", "DE", 52.5147, 13.2395, 2),
    ("veltins", "Veltins-Arena", "Schalke 04", None, "Gelsenkirchen", "DE", 51.5546, 7.0678, 3),
    ("weserstadion", "Weserstadion", "Werder Bremen", "Bremen", "", "DE", 53.0664, 8.8376, 3),
    ("parcdesprinces", "Parc des Princes", "Paris Saint-Germain", "Paris", "", "FR", 48.8414, 2.2530, 1),
    ("stadedefrance", "Stade de France", "", None, "Saint-Denis", "FR", 48.9245, 2.3601, 2),
    ("velodrome", "Stade Vélodrome", "Olympique de Marseille", "Marseille", "", "FR", 43.2698, 5.3959, 2),
    ("groupama", "Groupama Stadium", "Olympique de Lyon", "Lyon", "", "FR", 45.7653, 4.9822, 3),
    ("louis2", "Stade Louis II", "AS Monaco", "Monaco", "", "MC", 43.7277, 7.4157, 3),
    ("johancruijff", "Johan Cruijff Arena", "Ajax", "Amsterdam", "", "NL", 52.3144, 4.9419, 1),
    ("dekuip", "De Kuip", "Feyenoord", "Rotterdam", "", "NL", 51.8939, 4.5231, 2),
    ("luz", "Estádio da Luz", "Benfica", "Lisbon", "", "PT", 38.7527, -9.1847, 2),
    ("dragao", "Estádio do Dragão", "FC Porto", "Porto", "", "PT", 41.1618, -8.5834, 2),
    ("alvalade", "José Alvalade", "Sporting CP", "Lisbon", "", "PT", 38.7613, -9.1608, 3),
    ("maracana", "Maracaná", "", "Rio de Janeiro", "", "BR", -22.9122, -43.2302, 1),
    ("morumbi", "Morumbi", "São Paulo FC", "Sao Paulo", "", "BR", -23.6003, -46.7202, 2),
    ("mineirao", "Mineirão", "Cruzeiro · Atlético Mineiro", "Belo Horizonte", "", "BR", -19.8659, -43.9710, 3),
    ("bombonera", "La Bombonera", "Boca Juniors", "Buenos Aires", "", "AR", -34.6356, -58.3646, 1),
    ("monumental", "El Monumental", "River Plate", "Buenos Aires", "", "AR", -34.5453, -58.4497, 1),
    ("centenario", "Estadio Centenario", "", "Montevideo", "", "UY", -34.8944, -56.1527, 2),
    ("nacionalchile", "Estadio Nacional Julio Martínez", "", "Santiago", "", "CL", -33.4650, -70.6108, 3),
    ("hernandosiles", "Estadio Hernando Siles", "", "La Paz", "", "BO", -16.5048, -68.1306, 3),
    ("elcampin", "El Campín", "Millonarios · Santa Fe", "Bogota", "", "CO", 4.6459, -74.0770, 3),
    ("azteca", "Estadio Azteca", "", "Mexico City", "", "MX", 19.3029, -99.1505, 1),
    ("metlife", "MetLife Stadium", "", None, "East Rutherford", "US", 40.8135, -74.0745, 2),
    ("rosebowl", "Rose Bowl", "", "Pasadena", "", "US", 34.1613, -118.1676, 3),
    ("bmofield", "BMO Field", "Toronto FC", "Toronto", "", "CA", 43.6332, -79.4186, 3),
    ("lusail", "Estadio Lusail", "", None, "Lusail", "QA", 25.4210, 51.4906, 2),
    ("luzhniki", "Luzhniki", "", "Moscow", "", "RU", 55.7158, 37.5536, 2),
    ("ataturk", "Estadio Olímpico Atatürk", "", "Istanbul", "", "TR", 41.0743, 28.7650, 3),
    ("puskasarena", "Puskás Aréna", "", "Budapest", "", "HU", 47.5030, 19.0969, 3),
    ("maksimir", "Maksimir", "Dinamo Zagreb", "Zagreb", "", "HR", 45.8183, 16.0182, 3),
    ("soccercity", "Soccer City (FNB)", "", "Johannesburg", "", "ZA", -26.2347, 27.9826, 2),
    ("cairointl", "Estadio Internacional de El Cairo", "Al Ahly", "Cairo", "", "EG", 30.0716, 31.3166, 3),
    ("yokohama", "Estadio Internacional de Yokohama", "", "Yokohama", "", "JP", 35.5100, 139.6064, 3),
]

# ---------------------------------------------------------------- ciudades natales
# (id, jugador, ciudad NE (ASCII) o None, ciudad si no está en NE, ISO, lat, lon, dificultad)
NATALES = [
    ("messi", "Lionel Messi", "Rosario", "", "AR", -32.9468, -60.6393, 1),
    ("cristiano", "Cristiano Ronaldo", "Funchal", "", "PT", 32.6669, -16.9241, 1),
    ("maradona", "Diego Maradona", None, "Lanús", "AR", -34.7061, -58.3957, 2),
    ("pele", "Pelé", None, "Três Corações", "BR", -21.6947, -45.2547, 3),
    ("neymar", "Neymar", None, "Mogi das Cruzes", "BR", -23.5225, -46.1883, 3),
    ("ronaldinho", "Ronaldinho", "Porto Alegre", "", "BR", -30.0346, -51.2177, 2),
    ("ronaldonazario", "Ronaldo Nazário", "Rio de Janeiro", "", "BR", -22.9068, -43.1729, 2),
    ("kaka", "Kaká", "Brasilia", "", "BR", -15.7939, -47.8828, 3),
    ("zidane", "Zinedine Zidane", "Marseille", "", "FR", 43.2965, 5.3698, 1),
    ("mbappe", "Kylian Mbappé", "Paris", "", "FR", 48.8566, 2.3522, 1),
    ("benzema", "Karim Benzema", "Lyon", "", "FR", 45.7640, 4.8357, 2),
    ("vieira", "Patrick Vieira", "Dakar", "", "SN", 14.7167, -17.4677, 3),
    ("cruyff", "Johan Cruyff", "Amsterdam", "", "NL", 52.3676, 4.9041, 1),
    ("seedorf", "Clarence Seedorf", "Paramaribo", "", "SR", 5.8520, -55.2038, 3),
    ("beckenbauer", "Franz Beckenbauer", "Munich", "", "DE", 48.1351, 11.5820, 1),
    ("klose", "Miroslav Klose", "Opole", "", "PL", 50.6751, 17.9213, 3),
    ("podolski", "Lukas Podolski", "Gliwice", "", "PL", 50.2945, 18.6714, 3),
    ("kroos", "Toni Kroos", None, "Greifswald", "DE", 54.0865, 13.3922, 3),
    ("ozil", "Mesut Özil", None, "Gelsenkirchen", "DE", 51.5177, 7.0857, 2),
    ("eusebio", "Eusébio", "Maputo", "", "MZ", -25.9692, 32.5732, 3),
    ("pepe", "Pepe", "Maceio", "", "BR", -9.6658, -35.7353, 3),
    ("puskas", "Ferenc Puskás", "Budapest", "", "HU", 47.4979, 19.0402, 2),
    ("distefano", "Alfredo Di Stéfano", "Buenos Aires", "", "AR", -34.6037, -58.3816, 2),
    ("iniesta", "Andrés Iniesta", None, "Fuentealbilla", "ES", 39.2000, -1.5500, 3),
    ("xavi", "Xavi Hernández", None, "Terrassa", "ES", 41.5667, 2.0167, 3),
    ("casillas", "Iker Casillas", None, "Móstoles", "ES", 40.3223, -3.8649, 3),
    ("raul", "Raúl González", "Madrid", "", "ES", 40.4168, -3.7038, 2),
    ("ramos", "Sergio Ramos", None, "Camas", "ES", 37.4033, -6.0333, 3),
    ("torres", "Fernando Torres", None, "Fuenlabrada", "ES", 40.2842, -3.7942, 3),
    ("pedri", "Pedri", None, "Tegueste", "ES", 28.5167, -16.3333, 3),
    ("gavi", "Gavi", None, "Los Palacios y Villafranca", "ES", 37.1639, -5.9250, 3),
    ("yamal", "Lamine Yamal", None, "Esplugues de Llobregat", "ES", 41.3764, 2.0880, 2),
    ("hakimi", "Achraf Hakimi", "Madrid", "", "ES", 40.4168, -3.7038, 3),
    ("figo", "Luís Figo", None, "Almada", "PT", 38.6790, -9.1569, 3),
    ("beckham", "David Beckham", "London", "", "GB", 51.5074, -0.1278, 2),
    ("rooney", "Wayne Rooney", "Liverpool", "", "GB", 53.4084, -2.9916, 2),
    ("bale", "Gareth Bale", "Cardiff", "", "GB", 51.4816, -3.1791, 2),
    ("best", "George Best", "Belfast", "", "GB", 54.5973, -5.9301, 3),
    ("haaland", "Erling Haaland", "Leeds", "", "GB", 53.8008, -1.5491, 2),
    ("zlatan", "Zlatan Ibrahimović", "Malmo", "", "SE", 55.6050, 13.0038, 2),
    ("lewandowski", "Robert Lewandowski", "Warsaw", "", "PL", 52.2297, 21.0122, 2),
    ("modric", "Luka Modrić", "Zadar", "", "HR", 44.1194, 15.2314, 3),
    ("drogba", "Didier Drogba", "Abidjan", "", "CI", 5.3600, -4.0083, 2),
    ("weah", "George Weah", "Monrovia", "", "LR", 6.3005, -10.7969, 3),
    ("maldini", "Paolo Maldini", "Milan", "", "IT", 45.4642, 9.1900, 2),
    ("totti", "Francesco Totti", "Rome", "", "IT", 41.9028, 12.4964, 2),
    ("buffon", "Gianluigi Buffon", None, "Carrara", "IT", 44.0793, 10.0976, 3),
    ("valderrama", "Carlos Valderrama", "Santa Marta", "", "CO", 11.2408, -74.1990, 3),
    ("suarez", "Luis Suárez", "Salto", "", "UY", -31.3833, -57.9667, 3),
    ("son", "Son Heung-min", "Chuncheon", "", "KR", 37.8813, 127.7298, 3),
    ("hugosanchez", "Hugo Sánchez", "Mexico City", "", "MX", 19.4326, -99.1332, 2),
]

# ---------------------------------------------------------------- clubes
# (id, club, ciudad NE (ASCII), ciudad si no está en NE, ISO, lat, lon, dificultad)
CLUBES = [
    ("realmadrid", "Real Madrid", "Madrid", "", "ES", 40.4168, -3.7038, 1),
    ("barcelona", "FC Barcelona", "Barcelona", "", "ES", 41.3874, 2.1686, 1),
    ("athletic", "Athletic Club", "Bilbao", "", "ES", 43.2630, -2.9350, 2),
    ("villarreal", "Villarreal CF", None, "Villarreal", "ES", 39.9440, -0.1010, 3),
    ("celta", "Celta de Vigo", "Vigo", "", "ES", 42.2406, -8.7207, 2),
    ("realsociedad", "Real Sociedad", "San Sebastian", "", "ES", 43.3183, -1.9812, 2),
    ("liverpool", "Liverpool", "Liverpool", "", "GB", 53.4084, -2.9916, 1),
    ("manutd", "Manchester United", "Manchester", "", "GB", 53.4808, -2.2426, 1),
    ("arsenal", "Arsenal", "London", "", "GB", 51.5074, -0.1278, 1),
    ("newcastle", "Newcastle United", "Newcastle", "", "GB", 54.9783, -1.6178, 2),
    ("celtic", "Celtic", "Glasgow", "", "GB", 55.8642, -4.2518, 2),
    ("juventus", "Juventus", "Turin", "", "IT", 45.0703, 7.6869, 1),
    ("milan", "AC Milan", "Milan", "", "IT", 45.4642, 9.1900, 1),
    ("napoli", "SSC Napoli", "Naples", "", "IT", 40.8518, 14.2681, 1),
    ("atalanta", "Atalanta", "Bergamo", "", "IT", 45.6983, 9.6773, 3),
    ("fiorentina", "Fiorentina", "Florence", "", "IT", 43.7696, 11.2558, 2),
    ("bayern", "Bayern München", "Munich", "", "DE", 48.1351, 11.5820, 1),
    ("dortmund", "Borussia Dortmund", "Dortmund", "", "DE", 51.5136, 7.4653, 2),
    ("schalke", "Schalke 04", None, "Gelsenkirchen", "DE", 51.5177, 7.0857, 3),
    ("leverkusen", "Bayer Leverkusen", None, "Leverkusen", "DE", 51.0459, 6.9840, 3),
    ("psg", "Paris Saint-Germain", "Paris", "", "FR", 48.8566, 2.3522, 1),
    ("marsella", "Olympique de Marseille", "Marseille", "", "FR", 43.2965, 5.3698, 2),
    ("ajax", "Ajax", "Amsterdam", "", "NL", 52.3676, 4.9041, 1),
    ("psv", "PSV", "Eindhoven", "", "NL", 51.4416, 5.4697, 3),
    ("feyenoord", "Feyenoord", "Rotterdam", "", "NL", 51.9244, 4.4777, 2),
    ("benfica", "Benfica", "Lisbon", "", "PT", 38.7223, -9.1393, 2),
    ("oporto", "FC Porto", "Porto", "", "PT", 41.1579, -8.6291, 2),
    ("galatasaray", "Galatasaray", "Istanbul", "", "TR", 41.0082, 28.9784, 2),
    ("olympiacos", "Olympiacos", "Piraievs", "", "GR", 37.9425, 23.6470, 3),
    ("zenit", "Zenit", "St. Petersburg", "", "RU", 59.9343, 30.3351, 3),
    ("shakhtar", "Shakhtar Donetsk", "Donetsk", "", "UA", 48.0159, 37.8029, 3),
    ("estrellaroja", "Red Star Belgrade", "Belgrade", "", "RS", 44.7866, 20.4489, 3),
    ("boca", "Boca Juniors", "Buenos Aires", "", "AR", -34.6037, -58.3816, 1),
    ("flamengo", "Flamengo", "Rio de Janeiro", "", "BR", -22.9068, -43.1729, 1),
    ("santos", "Santos", "Santos", "", "BR", -23.9608, -46.3336, 2),
    ("penarol", "Peñarol", "Montevideo", "", "UY", -34.9011, -56.1645, 2),
    ("colocolo", "Colo-Colo", "Santiago", "", "CL", -33.4489, -70.6693, 3),
    ("america", "Club América", "Mexico City", "", "MX", 19.4326, -99.1332, 2),
    ("alahly", "Al Ahly", "Cairo", "", "EG", 30.0444, 31.2357, 3),
    ("alnassr", "Al-Nassr", "Riyadh", "", "SA", 24.7136, 46.6753, 2),
]

# ---------------------------------------------------------------- sedes de finales
# Mundiales: (año, estadio, ciudad NE o None, ciudad, ISO, lat, lon)
MUNDIALES_FINALES = [
    (1930, "Estadio Centenario", "Montevideo", "", "UY", -34.8944, -56.1527),
    (1934, "Stadio Nazionale PNF", "Rome", "", "IT", 41.9272, 12.4733),
    (1938, "Stade Olympique de Colombes", None, "Colombes", "FR", 48.9304, 2.2475),
    (1950, "Maracaná", "Rio de Janeiro", "", "BR", -22.9122, -43.2302),
    (1954, "Wankdorf", "Bern", "", "CH", 46.9655, 7.4655),
    (1958, "Råsunda", None, "Solna", "SE", 59.3711, 18.0014),
    (1962, "Estadio Nacional", "Santiago", "", "CL", -33.4650, -70.6108),
    (1966, "Wembley", "London", "", "GB", 51.5560, -0.2796),
    (1970, "Estadio Azteca", "Mexico City", "", "MX", 19.3029, -99.1505),
    (1974, "Olympiastadion", "Munich", "", "DE", 48.1745, 11.5470),
    (1978, "Estadio Monumental", "Buenos Aires", "", "AR", -34.5453, -58.4497),
    (1982, "Santiago Bernabéu", "Madrid", "", "ES", 40.4531, -3.6883),
    (1986, "Estadio Azteca", "Mexico City", "", "MX", 19.3029, -99.1505),
    (1990, "Stadio Olimpico", "Rome", "", "IT", 41.9341, 12.4547),
    (1994, "Rose Bowl", "Pasadena", "", "US", 34.1613, -118.1676),
    (1998, "Stade de France", None, "Saint-Denis", "FR", 48.9245, 2.3601),
    (2002, "Estadio Internacional de Yokohama", "Yokohama", "", "JP", 35.5100, 139.6064),
    (2006, "Olympiastadion", "Berlin", "", "DE", 52.5147, 13.2395),
    (2010, "Soccer City", "Johannesburg", "", "ZA", -26.2347, 27.9826),
    (2014, "Maracaná", "Rio de Janeiro", "", "BR", -22.9122, -43.2302),
    (2018, "Luzhniki", "Moscow", "", "RU", 55.7158, 37.5536),
    (2022, "Estadio Lusail", None, "Lusail", "QA", 25.4210, 51.4906),
    (2026, "MetLife Stadium", None, "East Rutherford", "US", 40.8135, -74.0745),
]
# Champions: año -> (estadio, ciudad NE o None, ciudad, ISO, lat, lon)  (año, ciudad y estadio según tools/hist_data.py)
CHAMPIONS_FINALES = {
    2007: ("Estadio Olímpico (OAKA)", "Athens", "", "GR", 38.0361, 23.7875),
    2008: ("Luzhniki", "Moscow", "", "RU", 55.7158, 37.5536),
    2009: ("Stadio Olimpico", "Rome", "", "IT", 41.9341, 12.4547),
    2010: ("Santiago Bernabéu", "Madrid", "", "ES", 40.4531, -3.6883),
    2011: ("Wembley", "London", "", "GB", 51.5560, -0.2796),
    2012: ("Allianz Arena", "Munich", "", "DE", 48.2188, 11.6247),
    2013: ("Wembley", "London", "", "GB", 51.5560, -0.2796),
    2014: ("Estádio da Luz", "Lisbon", "", "PT", 38.7527, -9.1847),
    2015: ("Olympiastadion", "Berlin", "", "DE", 52.5147, 13.2395),
    2016: ("San Siro", "Milan", "", "IT", 45.4781, 9.1240),
    2017: ("Millennium Stadium", "Cardiff", "", "GB", 51.4782, -3.1826),
    2018: ("NSK Olimpiyskiy", "Kiev", "", "UA", 50.4335, 30.5217),
    2019: ("Metropolitano", "Madrid", "", "ES", 40.4362, -3.5994),
    2020: ("Estádio da Luz", "Lisbon", "", "PT", 38.7527, -9.1847),
    2021: ("Estádio do Dragão", "Porto", "", "PT", 41.1618, -8.5834),
    2022: ("Stade de France", None, "Saint-Denis", "FR", 48.9245, 2.3601),
    2023: ("Atatürk Olímpico", "Istanbul", "", "TR", 41.0743, 28.7650),
    2024: ("Wembley", "London", "", "GB", 51.5560, -0.2796),
    2025: ("Allianz Arena", "Munich", "", "DE", 48.2188, 11.6247),
    2026: ("Puskás Aréna", "Budapest", "", "HU", 47.5030, 19.0969),
}

# ---------------------------------------------------------------- curiosidades
# (id, ciudad NE o None, ciudad, ISO, lat, lon, dificultad, {pregunta 6 idiomas}, {dato 6 idiomas})
# idiomas: es, en, pt, fr, it, de
CURIOSIDADES = [
    ("sheffield", "Sheffield", "", "GB", 53.3811, -1.4701, 2,
     ["¿Dónde nació el club de fútbol más antiguo del mundo, el Sheffield FC (1857)?", "Where was the world's oldest football club, Sheffield FC (1857), born?", "Onde nasceu o clube de futebol mais antigo do mundo, o Sheffield FC (1857)?", "Où est né le plus vieux club de football du monde, Sheffield FC (1857) ?", "Dove è nato il club di calcio più antico del mondo, lo Sheffield FC (1857)?", "Wo wurde der älteste Fußballverein der Welt, Sheffield FC (1857), gegründet?"],
     ["El Sheffield FC se fundó en 1857 y la FIFA lo reconoce como el club más antiguo del mundo.", "Sheffield FC was founded in 1857 and FIFA recognises it as the oldest football club in the world.", "O Sheffield FC foi fundado em 1857 e a FIFA o reconhece como o clube mais antigo do mundo.", "Le Sheffield FC a été fondé en 1857 et la FIFA le reconnaît comme le plus ancien club du monde.", "Lo Sheffield FC fu fondato nel 1857 e la FIFA lo riconosce come il club più antico del mondo.", "Der Sheffield FC wurde 1857 gegründet und wird von der FIFA als ältester Fußballverein der Welt anerkannt."]),
    ("fifa1904", "Paris", "", "FR", 48.8566, 2.3522, 2,
     ["¿Dónde se fundó la FIFA en 1904?", "Where was FIFA founded in 1904?", "Onde foi fundada a FIFA em 1904?", "Où la FIFA a-t-elle été fondée en 1904 ?", "Dove fu fondata la FIFA nel 1904?", "Wo wurde die FIFA 1904 gegründet?"],
     ["La FIFA nació en París el 21 de mayo de 1904; hoy su sede está en Zúrich.", "FIFA was founded in Paris on 21 May 1904; today its headquarters are in Zurich.", "A FIFA nasceu em Paris em 21 de maio de 1904; hoje a sede fica em Zurique.", "La FIFA est née à Paris le 21 mai 1904 ; son siège est aujourd'hui à Zurich.", "La FIFA nacque a Parigi il 21 maggio 1904; oggi la sede è a Zurigo.", "Die FIFA wurde am 21. Mai 1904 in Paris gegründet; heute sitzt sie in Zürich."]),
    ("fa1863", "London", "", "GB", 51.5074, -0.1278, 2,
     ["¿Dónde se fundó la Football Association inglesa en 1863?", "Where was the English Football Association founded in 1863?", "Onde foi fundada a Football Association inglesa em 1863?", "Où l'English Football Association a-t-elle été fondée en 1863 ?", "Dove fu fondata la Football Association inglese nel 1863?", "Wo wurde 1863 die englische Football Association gegründet?"],
     ["La Football Association se fundó en una taberna de Londres en 1863 y aprobó las primeras reglas comunes del fútbol.", "The Football Association was founded in a London tavern in 1863 and agreed the first common rules of football.", "A Football Association foi fundada numa taberna de Londres em 1863 e aprovou as primeiras regras comuns do futebol.", "La Football Association a été fondée dans une taverne de Londres en 1863 et a adopté les premières règles communes du football.", "La Football Association fu fondata in una taverna di Londra nel 1863 e approvò le prime regole comuni del calcio.", "Die Football Association wurde 1863 in einer Londoner Taverne gegründet und beschloss die ersten gemeinsamen Fußballregeln."]),
    ("primerinternacional", "Glasgow", "", "GB", 55.8701, -4.3112, 3,
     ["¿Dónde se jugó en 1872 el primer partido internacional oficial entre selecciones (Escocia–Inglaterra)?", "Where was the first official international match between national teams (Scotland–England) played in 1872?", "Onde foi jogada em 1872 a primeira partida internacional oficial entre seleções (Escócia–Inglaterra)?", "Où a été joué en 1872 le premier match international officiel entre sélections (Écosse–Angleterre) ?", "Dove fu giocata nel 1872 la prima partita internazionale ufficiale tra nazionali (Scozia–Inghilterra)?", "Wo wurde 1872 das erste offizielle Länderspiel (Schottland–England) ausgetragen?"],
     ["Fue un 0-0 en Glasgow el 30 de noviembre de 1872, en el campo de críquet de Hamilton Crescent.", "It was a 0-0 draw in Glasgow on 30 November 1872, at the Hamilton Crescent cricket ground.", "Foi um 0 a 0 em Glasgow a 30 de novembro de 1872, no campo de críquete de Hamilton Crescent.", "Ce fut un 0-0 à Glasgow le 30 novembre 1872, sur le terrain de cricket de Hamilton Crescent.", "Fu uno 0-0 a Glasgow il 30 novembre 1872, nel campo da cricket di Hamilton Crescent.", "Es endete am 30. November 1872 in Glasgow 0:0, auf dem Cricketplatz von Hamilton Crescent."]),
    ("copadeeuropa1956", "Paris", "", "FR", 48.8414, 2.2530, 2,
     ["¿Dónde se jugó la primera final de la Copa de Europa, en 1956?", "Where was the first European Cup final played, in 1956?", "Onde foi jogada a primeira final da Taça dos Campeões Europeus, em 1956?", "Où s'est jouée la première finale de la Coupe d'Europe, en 1956 ?", "Dove si giocò la prima finale della Coppa dei Campioni, nel 1956?", "Wo wurde 1956 das erste Finale des Europapokals der Landesmeister gespielt?"],
     ["El Real Madrid ganó 4-3 al Stade de Reims en el Parque de los Príncipes y empezó su racha de cinco Copas de Europa seguidas.", "Real Madrid beat Stade de Reims 4-3 at the Parc des Princes and began their run of five straight European Cups.", "O Real Madrid venceu o Stade de Reims por 4 a 3 no Parque dos Príncipes e iniciou a sequência de cinco Taças dos Campeões seguidas.", "Le Real Madrid a battu le Stade de Reims 4-3 au Parc des Princes et a lancé sa série de cinq Coupes d'Europe d'affilée.", "Il Real Madrid batté 4-3 lo Stade de Reims al Parco dei Principi e iniziò la serie di cinque Coppe dei Campioni consecutive.", "Real Madrid schlug Stade Reims im Parc des Princes 4:3 und begann seine Serie von fünf Europapokalsiegen in Folge."]),
    ("bern1954", "Bern", "", "CH", 46.9655, 7.4655, 3,
     ["¿Dónde se jugó el «Milagro de Berna», la final del Mundial de 1954?", "Where was the 'Miracle of Bern', the 1954 World Cup final, played?", "Onde foi jogado o «Milagre de Berna», a final da Copa de 1954?", "Où s'est joué le « Miracle de Berne », la finale de la Coupe du monde 1954 ?", "Dove si giocò il «Miracolo di Berna», la finale del Mondiale 1954?", "Wo fand das «Wunder von Bern», das WM-Finale 1954, statt?"],
     ["Alemania Occidental remontó un 0-2 ante la gran Hungría y ganó 3-2 en el estadio Wankdorf.", "West Germany came back from 0-2 against the great Hungary side and won 3-2 at the Wankdorf stadium.", "A Alemanha Ocidental virou um 0 a 2 contra a grande Hungria e venceu por 3 a 2 no estádio Wankdorf.", "L'Allemagne de l'Ouest a renversé un 0-2 face à la grande Hongrie et s'est imposée 3-2 au stade du Wankdorf.", "La Germania Ovest rimontò dallo 0-2 contro la grande Ungheria e vinse 3-2 allo stadio Wankdorf.", "Westdeutschland drehte gegen das große Ungarn einen 0:2-Rückstand und gewann im Wankdorfstadion 3:2."]),
    ("maracanazo", "Rio de Janeiro", "", "BR", -22.9122, -43.2302, 2,
     ["¿Dónde ocurrió el «Maracanazo» de 1950, cuando Uruguay venció a Brasil?", "Where did the 1950 'Maracanazo' happen, when Uruguay beat Brazil?", "Onde aconteceu o «Maracanazo» de 1950, quando o Uruguai venceu o Brasil?", "Où a eu lieu le « Maracanaço » de 1950, quand l'Uruguay a battu le Brésil ?", "Dove avvenne il «Maracanazo» del 1950, quando l'Uruguay batté il Brasile?", "Wo geschah 1950 der «Maracanaço», als Uruguay Brasilien schlug?"],
     ["Uruguay ganó 2-1 a Brasil ante unas 170.000 personas en un estadio recién inaugurado y se llevó el Mundial de 1950.", "Uruguay beat Brazil 2-1 in front of around 170,000 people in a brand-new stadium and took the 1950 World Cup.", "O Uruguai venceu o Brasil por 2 a 1 diante de cerca de 170 mil pessoas num estádio recém-inaugurado e levou a Copa de 1950.", "L'Uruguay a battu le Brésil 2-1 devant quelque 170 000 personnes dans un stade tout neuf et a remporté la Coupe du monde 1950.", "L'Uruguay batté il Brasile 2-1 davanti a circa 170.000 persone in uno stadio appena inaugurato e vinse il Mondiale 1950.", "Uruguay schlug Brasilien vor rund 170.000 Zuschauern in einem neuen Stadion mit 2:1 und holte die WM 1950."]),
    ("manodedios", "Mexico City", "", "MX", 19.3029, -99.1505, 2,
     ["¿Dónde marcó Maradona la «Mano de Dios» y el «Gol del Siglo» ante Inglaterra, en 1986?", "Where did Maradona score the 'Hand of God' and the 'Goal of the Century' against England in 1986?", "Onde Maradona marcou a «Mão de Deus» e o «Gol do Século» contra a Inglaterra, em 1986?", "Où Maradona a-t-il marqué la « Main de Dieu » et le « But du siècle » contre l'Angleterre en 1986 ?", "Dove segnò Maradona la «Mano de Dios» e il «Gol del Secolo» contro l'Inghilterra, nel 1986?", "Wo erzielte Maradona 1986 gegen England die «Hand Gottes» und das «Jahrhunderttor»?"],
     ["Fue en los cuartos de final del Mundial de 1986, en el estadio Azteca de Ciudad de México (Argentina 2-1 Inglaterra).", "It was in the 1986 World Cup quarter-final, at the Azteca stadium in Mexico City (Argentina 2-1 England).", "Foi nas quartas de final da Copa de 1986, no estádio Azteca, na Cidade do México (Argentina 2 a 1 Inglaterra).", "C'était en quart de finale de la Coupe du monde 1986, au stade Azteca de Mexico (Argentine 2-1 Angleterre).", "Fu nei quarti di finale del Mondiale 1986, allo stadio Azteca di Città del Messico (Argentina 2-1 Inghilterra).", "Es war im Viertelfinale der WM 1986 im Aztekenstadion von Mexiko-Stadt (Argentinien 2:1 England)."]),
    ("copamundial1930", "Montevideo", "", "UY", -34.8944, -56.1527, 1,
     ["¿Dónde se jugó el primer Mundial de la historia, en 1930?", "Where was the very first World Cup played, in 1930?", "Onde foi jogada a primeira Copa do Mundo da história, em 1930?", "Où s'est disputée la toute première Coupe du monde, en 1930 ?", "Dove si giocò il primo Mondiale della storia, nel 1930?", "Wo wurde 1930 die allererste Weltmeisterschaft ausgetragen?"],
     ["Se jugó en Uruguay, con solo 13 selecciones, y todos los partidos fueron en Montevideo.", "It was held in Uruguay with just 13 teams, and every match was played in Montevideo.", "Foi no Uruguai, com apenas 13 seleções, e todos os jogos foram em Montevidéu.", "Elle a eu lieu en Uruguay avec seulement 13 équipes, et tous les matchs se sont joués à Montevideo.", "Si giocò in Uruguay con sole 13 nazionali e tutte le partite furono a Montevideo.", "Sie fand in Uruguay mit nur 13 Mannschaften statt, alle Spiele wurden in Montevideo ausgetragen."]),
    ("femenino1991", "Guangzhou", "", "CN", 23.1291, 113.2644, 3,
     ["¿Dónde se jugó la final del primer Mundial femenino, en 1991?", "Where was the final of the first Women's World Cup, in 1991, played?", "Onde foi jogada a final da primeira Copa do Mundo feminina, em 1991?", "Où s'est jouée la finale de la première Coupe du monde féminine, en 1991 ?", "Dove si giocò la finale del primo Mondiale femminile, nel 1991?", "Wo wurde 1991 das Finale der ersten Frauen-Weltmeisterschaft gespielt?"],
     ["Estados Unidos ganó 2-1 a Noruega en Cantón (China), en el estadio Tianhe, y se llevó el primer título.", "The United States beat Norway 2-1 in Guangzhou, China, at the Tianhe stadium, to take the first title.", "Os Estados Unidos venceram a Noruega por 2 a 1 em Cantão (China), no estádio Tianhe, e levaram o primeiro título.", "Les États-Unis ont battu la Norvège 2-1 à Canton (Chine), au stade Tianhe, et ont remporté le premier titre.", "Gli Stati Uniti batterono la Norvegia 2-1 a Canton (Cina), allo stadio Tianhe, e conquistarono il primo titolo.", "Die USA schlugen Norwegen in Guangzhou (China) im Tianhe-Stadion mit 2:1 und holten den ersten Titel."]),
    ("uefa", None, "Nyon", "CH", 46.3833, 6.2333, 3,
     ["¿Dónde tiene su sede la UEFA?", "Where is UEFA's headquarters?", "Onde fica a sede da UEFA?", "Où se trouve le siège de l'UEFA ?", "Dove ha sede la UEFA?", "Wo hat die UEFA ihren Sitz?"],
     ["La UEFA tiene su sede en Nyon, a orillas del lago Lemán (Suiza).", "UEFA has its headquarters in Nyon, on the shores of Lake Geneva (Switzerland).", "A UEFA tem a sua sede em Nyon, à beira do lago Lemano (Suíça).", "L'UEFA a son siège à Nyon, au bord du lac Léman (Suisse).", "La UEFA ha sede a Nyon, sulle rive del lago di Ginevra (Svizzera).", "Die UEFA hat ihren Sitz in Nyon am Genfersee (Schweiz)."]),
    ("fifa", "Zurich", "", "CH", 47.3769, 8.5417, 2,
     ["¿En qué ciudad tiene su sede la FIFA desde 1932?", "In which city has FIFA been headquartered since 1932?", "Em que cidade fica a sede da FIFA desde 1932?", "Dans quelle ville la FIFA a-t-elle son siège depuis 1932 ?", "In quale città ha sede la FIFA dal 1932?", "In welcher Stadt hat die FIFA seit 1932 ihren Sitz?"],
     ["La FIFA tiene su sede en Zúrich (Suiza) desde 1932.", "FIFA has been based in Zurich (Switzerland) since 1932.", "A FIFA tem sede em Zurique (Suíça) desde 1932.", "La FIFA a son siège à Zurich (Suisse) depuis 1932.", "La FIFA ha sede a Zurigo (Svizzera) dal 1932.", "Die FIFA hat ihren Sitz seit 1932 in Zürich (Schweiz)."]),
    ("balonoro2026", "London", "", "GB", 51.5074, -0.1278, 2,
     ["¿Dónde se entregó el Balón de Oro de 2026?", "Where was the 2026 Ballon d'Or awarded?", "Onde foi entregue a Bola de Ouro de 2026?", "Où le Ballon d'or 2026 a-t-il été remis ?", "Dove è stato assegnato il Pallone d'oro 2026?", "Wo wurde der Ballon d'Or 2026 verliehen?"],
     ["Harry Kane recibió el Balón de Oro el 26 de octubre de 2026 en el London Palladium, en Londres.", "Harry Kane received the Ballon d'Or on 26 October 2026 at the London Palladium, in London.", "Harry Kane recebeu a Bola de Ouro em 26 de outubro de 2026 no London Palladium, em Londres.", "Harry Kane a reçu le Ballon d'or le 26 octobre 2026 au London Palladium, à Londres.", "Harry Kane ha ricevuto il Pallone d'oro il 26 ottobre 2026 al London Palladium, a Londra.", "Harry Kane erhielt den Ballon d'Or am 26. Oktober 2026 im London Palladium in London."]),
]

DMAX = 40.0  # km: máximo permitido entre el lugar y su ciudad de referencia


def haversine(a, b):
    r = math.pi / 180
    dl, dn = (b[0] - a[0]) * r, (b[1] - a[1]) * r
    h = math.sin(dl / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin(dn / 2) ** 2
    return 2 * 6371.0088 * math.asin(min(1, math.sqrt(h)))


def carga_ciudades():
    j = json.load(open(os.path.join(RAIZ, "mapas", "ciudades.json"), encoding="utf-8"))
    por = {}
    for i, c in enumerate(j):
        por.setdefault((c[6], c[5]), []).append((c[2], i))   # (ASCII, ISO) -> [(pop, índice)]
    return j, por


def resuelve(ci, iso, lat, lon, ciud, por, errores, nombre):
    """Devuelve el índice de la ciudad en ciudades.json (o -1) y comprueba la distancia."""
    idx = -1
    if ci:
        cand = por.get((ci, iso))
        if not cand:
            errores.append("%s: ciudad «%s» (%s) no está en Natural Earth" % (nombre, ci, iso))
        else:
            idx = min(cand, key=lambda t: haversine((lat, lon), (ciud[t[1]][1], ciud[t[1]][0])))[1]
            c = ciud[idx]
            d = haversine((lat, lon), (c[1], c[0]))
            if d > DMAX:
                errores.append("%s: %.0f km hasta «%s» de Natural Earth (máx. %d)" % (nombre, d, ci, DMAX))
    return idx


def main():
    comprueba = "--check" in sys.argv
    ciud, por = carga_ciudades()
    errores = []
    out = []   # [tipo, id, nombre, sub, lat, lon, ciudadIdx, ciudadTexto, iso, dif, extra]
    ids = set()

    def nuevo(fila):
        k = fila[1]   # los ids son únicos en TODO el conjunto (RECIENTES y el resultado guardado del reto diario buscan solo por id)
        if k in ids:
            errores.append("id repetido: %s (%s)" % (k, fila[0]))
        ids.add(k)
        out.append(fila)

    for (i, n, sub, ci, cf, iso, lat, lon, dif) in ESTADIOS:
        idx = resuelve(ci, iso, lat, lon, ciud, por, errores, "estadio " + i)
        nuevo(["est", i, n, sub, lat, lon, idx, cf, iso, dif, None])
    for (i, n, ci, cf, iso, lat, lon, dif) in NATALES:
        idx = resuelve(ci, iso, lat, lon, ciud, por, errores, "natal " + i)
        nuevo(["nac", i, n, "", lat, lon, idx, cf, iso, dif, None])
    for (i, n, ci, cf, iso, lat, lon, dif) in CLUBES:
        idx = resuelve(ci, iso, lat, lon, ciud, por, errores, "club " + i)
        nuevo(["club", i, n, "", lat, lon, idx, cf, iso, dif, None])
    # sedes de Mundial y Champions
    for (anio, est, ci, cf, iso, lat, lon) in MUNDIALES_FINALES:
        idx = resuelve(ci, iso, lat, lon, ciud, por, errores, "mundial %d" % anio)
        nuevo(["sed", "mundial%d" % anio, "Mundial %d" % anio, est, lat, lon, idx, cf, iso, 1 if anio >= 1990 else 2, "M"])
    import hist_data as H
    for fila in H.CHAMPIONS:
        anio, campeon, rival, marcador, ciudad_es, estadio_es = fila[0], fila[1], fila[2], fila[3], fila[4], fila[5]
        if anio not in CHAMPIONS_FINALES:
            errores.append("falta la final de Champions %d" % anio); continue
        est, ci, cf, iso, lat, lon = CHAMPIONS_FINALES[anio]
        idx = resuelve(ci, iso, lat, lon, ciud, por, errores, "champions %d" % anio)
        nuevo(["sed", "champions%d" % anio, "Champions %d" % anio, est, lat, lon, idx, cf, iso, 2, "C|%s – %s" % (campeon, rival)])
    for (i, ci, cf, iso, lat, lon, dif, q, d) in CURIOSIDADES:
        idx = resuelve(ci, iso, lat, lon, ciud, por, errores, "curiosidad " + i)
        nuevo(["cur", i, "", "", lat, lon, idx, cf, iso, dif, {"q": q, "d": d}])
    if errores:
        print("PROBLEMAS (%d):" % len(errores))
        for e in errores:
            print("  -", e)
        sys.exit(1 if comprueba else 0)
    # tipos y recuentos
    from collections import Counter
    print("lugares:", len(out), dict(Counter(f[0] for f in out)))
    if comprueba:
        return
    js = ("/* Banco de lugares de «Clava el sitio» · generado por tools/mapas_lugares.py (no editar a mano).\n"
          "   [tipo, id, nombre, subtítulo, lat, lon, índice de ciudad en mapas/ciudades.json (−1 si no está), ciudad (si no está), ISO, dificultad, extra] */\n"
          "export const LUGARES = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n")
    with open(os.path.join(RAIZ, "mapas_lugares.js"), "w", encoding="utf-8") as fh:
        fh.write(js)
    print("mapas_lugares.js:", len(js), "bytes")


if __name__ == "__main__":
    main()
