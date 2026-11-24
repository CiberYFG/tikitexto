/* TRIVIA TIKITEXTO · juego de preguntas (23-nov-2026) · módulo ES, sonidos sintetizados, sin escudos, fotos ni logos
   10 preguntas de dificultad creciente (4 fáciles, 4 medias, 2 difíciles) con 4 respuestas y 15 s cada una. Las preguntas se generan
   a partir de datos ya contrastados: Champions 1956-2026, Mundiales 1930-2026 y Balón de Oro (trivia_datos.js, fuentes UEFA, FIFA y
   France Football) y de los récords del Comparador (comparador_datos.js). «Reto de hoy»: las mismas 10 preguntas para todo el mundo
   (semilla = fecha local) y un solo intento al día; «Modo libre»: por categorías. */
import { T } from "./trivia_datos.js";
import { LAB } from "./duelo.js";

const NPREG = 10, TIEMPO = 15, PAUSA_OK = 1700, PAUSA_KO = 2700, UMBRAL_DIA = 7;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const LANGS = ["es", "en", "pt", "fr", "it", "de"];
const SLOTS = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2];

/* ── aleatorio con semilla (mulberry32) ── */
export function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function semillaDe(txt) { let h = 2166136261; for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const barajar = (a, rng) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = r[i]; r[i] = r[j]; r[j] = t; } return r; };
const unicos = (a) => Array.from(new Set(a));

const UI = {
  kicker: ["Juego de preguntas", "Quiz game", "Jogo de perguntas", "Jeu de questions", "Gioco a quiz", "Quizspiel"],
  sub: ["10 preguntas de fútbol de dificultad creciente: Champions, Mundiales, Balón de Oro y récords.", "10 football questions of rising difficulty: Champions League, World Cups, Ballon d'Or and records.", "10 perguntas de futebol com dificuldade crescente: Champions, Copas do Mundo, Bola de Ouro e recordes.", "10 questions de football de difficulté croissante : Ligue des champions, Coupes du monde, Ballon d'Or et records.", "10 domande di calcio a difficoltà crescente: Champions, Mondiali, Pallone d'Oro e record.", "10 Fußballfragen mit steigender Schwierigkeit: Champions League, Weltmeisterschaften, Ballon d'Or und Rekorde."],
  p1: ["Lee la pregunta y elige entre 4 respuestas antes de que se acabe el tiempo.", "Read the question and pick one of 4 answers before time runs out.", "Leia a pergunta e escolha entre 4 respostas antes que o tempo acabe.", "Lis la question et choisis parmi 4 réponses avant la fin du temps.", "Leggi la domanda e scegli tra 4 risposte prima che finisca il tempo.", "Lies die Frage und wähle eine von 4 Antworten, bevor die Zeit abläuft."],
  p2: ["Más puntos cuanto más rápido aciertes y más racha lleves. Tienes un comodín 50:50.", "The faster you answer and the longer your streak, the more points. You get one 50:50 lifeline.", "Quanto mais rápido você acertar e maior a sequência, mais pontos. Você tem um coringa 50:50.", "Plus tu réponds vite et plus ta série est longue, plus tu gagnes de points. Tu as un joker 50:50.", "Più rispondi in fretta e più è lunga la serie, più punti fai. Hai un jolly 50:50.", "Je schneller du antwortest und je länger deine Serie, desto mehr Punkte. Du hast einen 50:50-Joker."],
  p3: ["Reto de hoy: con 7 o más aciertos, ⚡ +1 tikitexto. En modo libre, con 10 de 10.", "Today's challenge: 7 or more correct earns ⚡ +1 tikitext. In free play, 10 out of 10.", "Desafio de hoje: com 7 ou mais acertos, ⚡ +1 tikitexto. No modo livre, com 10 de 10.", "Défi du jour : à partir de 7 bonnes réponses, ⚡ +1 tikitexto. En mode libre, avec 10 sur 10.", "Sfida di oggi: con 7 o più risposte giuste, ⚡ +1 tikitexto. In modalità libera, con 10 su 10.", "Heutige Challenge: ab 7 richtigen Antworten ⚡ +1 Tikitext. Im freien Spiel bei 10 von 10."],
  dia: ["Reto de hoy", "Today's challenge", "Desafio de hoje", "Défi du jour", "Sfida di oggi", "Heutige Challenge"],
  diaSub: ["Las mismas 10 preguntas para todos · un intento", "The same 10 questions for everyone · one try", "As mesmas 10 perguntas para todos · uma tentativa", "Les mêmes 10 questions pour tous · un essai", "Le stesse 10 domande per tutti · un tentativo", "Dieselben 10 Fragen für alle · ein Versuch"],
  diaHecho: ["Ver resultado de hoy", "See today's result", "Ver resultado de hoje", "Voir le résultat du jour", "Vedi il risultato di oggi", "Heutiges Ergebnis ansehen"],
  libre: ["Modo libre", "Free play", "Modo livre", "Mode libre", "Modalità libera", "Freies Spiel"],
  elige: ["Elige categoría", "Pick a category", "Escolha a categoria", "Choisis la catégorie", "Scegli la categoria", "Kategorie wählen"],
  salir: ["Salir", "Exit", "Sair", "Quitter", "Esci", "Beenden"], otra: ["Jugar otra vez", "Play again", "Jogar de novo", "Rejouer", "Gioca ancora", "Nochmal spielen"],
  menu: ["Menú", "Menu", "Menu", "Menu", "Menu", "Menü"],
  cargando: ["Cargando preguntas…", "Loading questions…", "Carregando perguntas…", "Chargement des questions…", "Caricamento delle domande…", "Lade Fragen…"],
  preg: ["Pregunta", "Question", "Pergunta", "Question", "Domanda", "Frage"],
  bien: ["¡Correcto!", "Correct!", "Correto!", "Correct !", "Corretto!", "Richtig!"], mal: ["¡Fallo!", "Wrong!", "Errou!", "Raté !", "Sbagliato!", "Falsch!"], tarde: ["¡Se acabó el tiempo!", "Time's up!", "Acabou o tempo!", "Temps écoulé !", "Tempo scaduto!", "Zeit abgelaufen!"],
  sig: ["Siguiente →", "Next →", "Próxima →", "Suivante →", "Avanti →", "Weiter →"], ver: ["Ver resultado →", "See result →", "Ver resultado →", "Voir le résultat →", "Vedi il risultato →", "Ergebnis ansehen →"],
  fin: ["Fin de la ronda", "Round over", "Fim da rodada", "Fin de la manche", "Fine del round", "Runde vorbei"],
  rec: ["¡Nuevo récord!", "New record!", "Novo recorde!", "Nouveau record !", "Nuovo record!", "Neuer Rekord!"],
  aciertos: ["aciertos", "correct", "acertos", "bonnes réponses", "risposte giuste", "richtig"], puntos: ["puntos", "points", "pontos", "points", "punti", "Punkte"],
  tiki: ["⚡ +1 tikitexto", "⚡ +1 tikitext", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 tikitexto", "⚡ +1 Tikitext"],
  compartir: ["Compartir", "Share", "Compartilhar", "Partager", "Condividi", "Teilen"], copiado: ["¡Copiado!", "Copied!", "Copiado!", "Copié !", "Copiato!", "Kopiert!"],
  rangos: [["Suplente", "Titular", "Capitán", "Crack", "Leyenda"], ["Substitute", "Starter", "Captain", "Star player", "Legend"], ["Reserva", "Titular", "Capitão", "Craque", "Lenda"], ["Remplaçant", "Titulaire", "Capitaine", "Crack", "Légende"], ["Riserva", "Titolare", "Capitano", "Fuoriclasse", "Leggenda"], ["Ersatzspieler", "Stammspieler", "Kapitän", "Star", "Legende"]],
  racha: ["días seguidos", "days in a row", "dias seguidos", "jours d'affilée", "giorni di fila", "Tage in Folge"],
  cuantos: ["¿Cuántos?", "How many?", "Quantos?", "Combien ?", "Quanti?", "Wie viele?"],
  cat: {
    todo: ["Todo", "All", "Tudo", "Tout", "Tutto", "Alles"], ch: ["Champions", "Champions", "Champions", "Champions", "Champions", "Champions"],
    mu: ["Mundiales", "World Cups", "Copas do Mundo", "Coupes du monde", "Mondiali", "Weltmeisterschaften"], oro: ["Balón de Oro", "Ballon d'Or", "Bola de Ouro", "Ballon d'Or", "Pallone d'Oro", "Ballon d'Or"],
    rec: ["Récords", "Records", "Recordes", "Records", "Record", "Rekorde"],
  },
  pen: ["en penaltis", "on penalties", "nos pênaltis", "aux tirs au but", "ai rigori", "im Elfmeterschießen"], pro: ["prórroga", "after extra time", "após prorrogação", "après prolongation", "dopo i supplementari", "nach Verlängerung"],
  y: [" y ", " and ", " e ", " et ", " e ", " und "],
  fuente: ["Datos a", "Data as of", "Dados de", "Données au", "Dati al", "Stand"],
};
/* plantillas de pregunta: {y} año, {c} campeón, {s} rival, {n} nombre */
const Q = {
  ch_camp: ["¿Qué club fue campeón de Europa en {y}?", "Which club were European champions in {y}?", "Qual clube foi campeão europeu em {y}?", "Quel club a été champion d'Europe en {y} ?", "Quale club fu campione d'Europa nel {y}?", "Welcher Verein war {y} Europas Champion?"],
  ch_sub: ["Final de la Champions {y}: {c} ganó. ¿A quién derrotó?", "{y} Champions League final: {c} won. Who did they beat?", "Final da Champions {y}: o {c} ganhou. Quem derrotou?", "Finale de la Ligue des champions {y} : {c} a gagné. Qui a-t-il battu ?", "Finale di Champions {y}: ha vinto {c}. Chi ha battuto?", "Champions-League-Finale {y}: {c} gewann. Wen schlug man?"],
  ch_ciudad: ["¿En qué ciudad se jugó la final de la Champions de {y}?", "In which city was the {y} Champions League final played?", "Em que cidade foi jogada a final da Champions de {y}?", "Dans quelle ville s'est jouée la finale de la Ligue des champions {y} ?", "In quale città si giocò la finale di Champions del {y}?", "In welcher Stadt wurde das Champions-League-Finale {y} gespielt?"],
  ch_res: ["¿Con qué resultado ganó {c} la final de la Champions de {y}?", "What was the score when {c} won the {y} Champions League final?", "Com que placar o {c} ganhou a final da Champions de {y}?", "Quel a été le score de la victoire de {c} en finale de la Ligue des champions {y} ?", "Con che risultato ha vinto {c} la finale di Champions del {y}?", "Mit welchem Ergebnis gewann {c} das Champions-League-Finale {y}?"],
  ch_n: ["¿Cuántas Copas de Europa o Champions ha ganado {c}?", "How many European Cups or Champions Leagues has {c} won?", "Quantas Copas dos Campeões ou Champions o {c} ganhou?", "Combien de Coupes d'Europe ou Ligues des champions {c} a-t-il gagnées ?", "Quante Coppe dei Campioni o Champions ha vinto {c}?", "Wie viele Europapokale oder Champions-League-Titel hat {c} gewonnen?"],
  ch_mas: ["¿Qué club ha ganado más Copas de Europa o Champions?", "Which club has won the most European Cups or Champions Leagues?", "Qual clube ganhou mais Copas dos Campeões ou Champions?", "Quel club a gagné le plus de Coupes d'Europe ou de Ligues des champions ?", "Quale club ha vinto più Coppe dei Campioni o Champions?", "Welcher Verein hat die meisten Europapokale oder Champions-League-Titel gewonnen?"],
  mu_camp: ["¿Quién ganó el Mundial de {y}?", "Who won the {y} World Cup?", "Quem ganhou a Copa do Mundo de {y}?", "Qui a gagné la Coupe du monde {y} ?", "Chi ha vinto il Mondiale del {y}?", "Wer gewann die Weltmeisterschaft {y}?"],
  mu_sede: ["¿Qué país organizó el Mundial de {y}?", "Which country hosted the {y} World Cup?", "Qual país sediou a Copa do Mundo de {y}?", "Quel pays a organisé la Coupe du monde {y} ?", "Quale paese ha ospitato il Mondiale del {y}?", "Welches Land war Gastgeber der WM {y}?"],
  mu_sub: ["¿Quién fue el subcampeón del Mundial de {y}?", "Who were the runners-up at the {y} World Cup?", "Quem foi o vice-campeão da Copa do Mundo de {y}?", "Qui a été finaliste de la Coupe du monde {y} ?", "Chi fu il finalista del Mondiale del {y}?", "Wer wurde bei der WM {y} Vizeweltmeister?"],
  mu_gol: ["¿Quién fue el máximo goleador del Mundial de {y}?", "Who was the top scorer at the {y} World Cup?", "Quem foi o artilheiro da Copa do Mundo de {y}?", "Qui a été le meilleur buteur de la Coupe du monde {y} ?", "Chi fu il capocannoniere del Mondiale del {y}?", "Wer war Torschützenkönig der WM {y}?"],
  mu_golN: ["¿Cuántos goles marcó {n}, máximo goleador del Mundial de {y}?", "How many goals did {n}, top scorer at the {y} World Cup, score?", "Quantos gols marcou {n}, artilheiro da Copa do Mundo de {y}?", "Combien de buts {n}, meilleur buteur de la Coupe du monde {y}, a-t-il marqués ?", "Quanti gol segnò {n}, capocannoniere del Mondiale del {y}?", "Wie viele Tore erzielte {n}, Torschützenkönig der WM {y}?"],
  mu_nsel: ["¿Cuántas selecciones jugaron el Mundial de {y}?", "How many national teams played at the {y} World Cup?", "Quantas seleções jogaram a Copa do Mundo de {y}?", "Combien d'équipes ont joué la Coupe du monde {y} ?", "Quante nazionali hanno giocato il Mondiale del {y}?", "Wie viele Nationalmannschaften spielten bei der WM {y}?"],
  mu_n: ["¿Cuántos Mundiales ha ganado {c}?", "How many World Cups has {c} won?", "Quantas Copas do Mundo o(a) {c} ganhou?", "Combien de Coupes du monde {c} a-t-il gagnées ?", "Quanti Mondiali ha vinto {c}?", "Wie viele Weltmeistertitel hat {c} gewonnen?"],
  mu_primero: ["¿En qué año ganó {c} su primer Mundial?", "In which year did {c} win their first World Cup?", "Em que ano {c} ganhou sua primeira Copa do Mundo?", "En quelle année {c} a-t-il gagné sa première Coupe du monde ?", "In che anno {c} ha vinto il suo primo Mondiale?", "In welchem Jahr gewann {c} seinen ersten WM-Titel?"],
  oro_gan: ["¿Quién ganó el Balón de Oro en {y}?", "Who won the Ballon d'Or in {y}?", "Quem ganhou a Bola de Ouro em {y}?", "Qui a remporté le Ballon d'Or en {y} ?", "Chi vinse il Pallone d'Oro nel {y}?", "Wer gewann {y} den Ballon d'Or?"],
  oro_n: ["¿Cuántos Balones de Oro ha ganado {n}?", "How many Ballons d'Or has {n} won?", "Quantas Bolas de Ouro {n} ganhou?", "Combien de Ballons d'Or {n} a-t-il remportés ?", "Quanti Palloni d'Oro ha vinto {n}?", "Wie viele Ballons d'Or hat {n} gewonnen?"],
  oro_sin: ["¿En qué año no se entregó el Balón de Oro?", "In which year was the Ballon d'Or not awarded?", "Em que ano a Bola de Ouro não foi entregue?", "En quelle année le Ballon d'Or n'a-t-il pas été décerné ?", "In quale anno non fu assegnato il Pallone d'Oro?", "In welchem Jahr wurde der Ballon d'Or nicht vergeben?"],
  rec: ["{n}: ¿cuántos?", "{n}: how many?", "{n}: quantos?", "{n} : combien ?", "{n}: quanti?", "{n}: wie viele?"],
};
const SCORES = ["1-0", "2-0", "2-1", "3-0", "3-1", "4-1", "4-0", "5-0", "3-2"];

/* ── banco de preguntas (neutro respecto al idioma: solo claves) ── */
function numPool(v, min) {
  const paso = Math.max(1, Math.round(v * 0.12)), c = [];
  [-2, -1, 1, 2, 3, -3, 4].forEach((k) => { const x = v + k * paso; if (x >= (min == null ? 1 : min) && x !== v) c.push(x); });
  return unicos(c).map((x) => ({ t: "num", v: x }));
}
export function banco(D) {
  const B = [], P = (o) => B.push(o);
  const club = (k) => ({ t: "club", v: k }), pais = (k) => ({ t: "pais", v: k }), txt = (v) => ({ t: "txt", v: v }), ciu = (k) => ({ t: "ciudad", v: k });
  const cuenta = {}; T.campeones.forEach((x) => { cuenta[x[1]] = (cuenta[x[1]] || 0) + 1; });
  const anosDe = {}; T.campeones.forEach((x) => { (anosDe[x[1]] = anosDe[x[1]] || []).push(x[0]); });
  const clubesCamp = Object.keys(cuenta), clubesFin = unicos(T.finales.reduce((a, f) => a.concat([f[1], f[2]]), []));
  /* Champions */
  T.campeones.forEach((x) => {
    const y = x[0], c = x[1];
    let pool = clubesCamp.filter((k) => k !== c && anosDe[k].some((a) => Math.abs(a - y) <= 20));
    if (pool.length < 4) pool = clubesCamp.filter((k) => k !== c);
    P({ id: "ch_camp:" + y, cat: "ch", tipo: "ch_camp", d: y >= 2000 ? 0 : y >= 1980 ? 1 : 2, y: y, ok: club(c), pool: pool.map(club) });
  });
  T.finales.forEach((f) => {
    const y = f[0], c = f[1], s = f[2], res = f[3], ci = f[4];
    P({ id: "ch_sub:" + y, cat: "ch", tipo: "ch_sub", d: y >= 2015 ? 0 : 1, y: y, c: c, ok: club(s), pool: clubesFin.filter((k) => k !== s && k !== c).map(club) });
    P({ id: "ch_ciudad:" + y, cat: "ch", tipo: "ch_ciudad", d: y >= 2018 ? 1 : 2, y: y, ok: ciu(ci), pool: unicos(T.finales.map((g) => g[4])).filter((k) => k !== ci).map(ciu) });
    if (/^\d-\d$/.test(res)) P({ id: "ch_res:" + y, cat: "ch", tipo: "ch_res", d: 2, y: y, c: c, ok: txt(res), pool: SCORES.filter((k) => k !== res).map(txt) });
  });
  Object.keys(cuenta).filter((k) => cuenta[k] >= 2).forEach((k) => P({ id: "ch_n:" + k, cat: "ch", tipo: "ch_n", d: 1, c: k, ok: { t: "num", v: cuenta[k] }, pool: numPool(cuenta[k]) }));
  const top = Object.keys(cuenta).sort((a, b) => cuenta[b] - cuenta[a]);
  P({ id: "ch_mas", cat: "ch", tipo: "ch_mas", d: 0, ok: club(top[0]), pool: top.slice(1, 8).map(club) });
  /* Mundiales */
  const selecciones = unicos(T.mundiales.reduce((a, m) => a.concat([m[2], m[3]]), []));
  const norm = (k) => k === "Alemania Occidental" ? "Alemania" : k;
  const sedesTxt = (m) => m[1].join("|");
  T.mundiales.forEach((m) => {
    const y = m[0], camp = m[2], sub = m[3], sc = m[5], nsel = m[6];
    P({ id: "mu_camp:" + y, cat: "mu", tipo: "mu_camp", d: y >= 1998 ? 0 : y >= 1966 ? 1 : 2, y: y, ok: pais(camp), pool: selecciones.filter((k) => norm(k) !== norm(camp)).map(pais) });
    const sedes = unicos(T.mundiales.map(sedesTxt)).filter((k) => !k.split("|").some((z) => m[1].some((w) => norm(w) === norm(z))));
    P({ id: "mu_sede:" + y, cat: "mu", tipo: "mu_sede", d: y >= 1966 ? 1 : 2, y: y, ok: { t: "sedes", v: m[1] }, pool: sedes.map((k) => ({ t: "sedes", v: k.split("|") })) });
    P({ id: "mu_sub:" + y, cat: "mu", tipo: "mu_sub", d: y >= 1998 ? 1 : 2, y: y, ok: pais(sub), pool: selecciones.filter((k) => norm(k) !== norm(sub) && norm(k) !== norm(camp)).map(pais) });
    if (sc) {
      P({ id: "mu_gol:" + y, cat: "mu", tipo: "mu_gol", d: y >= 2002 ? 1 : 2, y: y, ok: txt(sc[0]), pool: unicos(T.mundiales.filter((z) => z[5] && z[5][0] !== sc[0]).map((z) => z[5][0])).map(txt) });
      P({ id: "mu_golN:" + y, cat: "mu", tipo: "mu_golN", d: 2, y: y, n: sc[0], ok: { t: "num", v: sc[1] }, pool: numPool(sc[1], 2) });
    }
    P({ id: "mu_nsel:" + y, cat: "mu", tipo: "mu_nsel", d: 2, y: y, ok: { t: "num", v: nsel }, pool: [12, 13, 15, 16, 20, 24, 32, 36, 40, 48].filter((k) => k !== nsel).map((k) => ({ t: "num", v: k })) });
  });
  const titulos = {}, primero = {}; T.mundiales.forEach((m) => { const k = m[2].replace("Alemania Occidental", "Alemania"); titulos[k] = (titulos[k] || 0) + 1; if (!primero[m[2]]) primero[m[2]] = m[0]; });
  Object.keys(titulos).forEach((k) => P({ id: "mu_n:" + k, cat: "mu", tipo: "mu_n", d: 1, c: k, ok: { t: "num", v: titulos[k] }, pool: numPool(titulos[k]) }));
  Object.keys(primero).filter((k) => k !== "Alemania Occidental" && k !== "Alemania").forEach((k) => P({ id: "mu_primero:" + k, cat: "mu", tipo: "mu_primero", d: 1, c: k, ok: txt(String(primero[k])), pool: T.mundiales.map((m) => m[0]).filter((a) => a !== primero[k]).map((a) => txt(String(a))) }));
  /* Balón de Oro */
  const nOro = {}, anosOro = {}; T.oro.forEach((x) => { nOro[x[1]] = (nOro[x[1]] || 0) + 1; (anosOro[x[1]] = anosOro[x[1]] || []).push(x[0]); });
  const ganadores = Object.keys(nOro);
  T.oro.forEach((x) => {
    const y = x[0], n = x[1];
    let pool = ganadores.filter((k) => k !== n && anosOro[k].some((a) => Math.abs(a - y) <= 18));
    if (pool.length < 4) pool = ganadores.filter((k) => k !== n);
    P({ id: "oro_gan:" + y, cat: "oro", tipo: "oro_gan", d: y >= 2008 ? 0 : y >= 1990 ? 1 : 2, y: y, ok: txt(n), pool: pool.map(txt) });
  });
  ganadores.filter((k) => nOro[k] >= 2).forEach((k) => P({ id: "oro_n:" + k, cat: "oro", tipo: "oro_n", d: /Messi|Cristiano/.test(k) ? 0 : 1, n: k, ok: { t: "num", v: nOro[k] }, pool: numPool(nOro[k]) }));
  P({ id: "oro_sin", cat: "oro", tipo: "oro_sin", d: 1, ok: txt("2020"), pool: ["2016", "2017", "2018", "2019", "2021", "2022"].map(txt) });
  /* récords del Comparador */
  if (D) ["jugadores", "equipos", "selecciones", "entrenadores"].forEach((cat) => {
    const bl = D[cat]; if (!bl) return;
    bl.stats.filter((s) => s.g === 1).forEach((st) => bl.items.forEach((it) => {
      const v = it.v[st.k]; if (typeof v !== "number" || !Number.isInteger(v) || v < 1) return;
      P({ id: "rec:" + cat + ":" + st.k + ":" + it.id, cat: "rec", tipo: "rec", d: v >= 40 ? 2 : 1, it: it, st: st, ok: { t: "num", v: v }, pool: numPool(v) });
    }));
  });
  return B;
}
/* una pregunta concreta con sus 4 opciones (pasar rng para repetir el mismo resultado) */
export function montar(q, rng) {
  const clave = (o) => o.t + ":" + (Array.isArray(o.v) ? o.v.join("|") : o.v);
  let pool = barajar(q.pool.filter((o) => clave(o) !== clave(q.ok)), rng), ops = [q.ok], vistos = new Set([clave(q.ok)]);
  for (const o of pool) { if (ops.length >= 4) break; if (!vistos.has(clave(o))) { vistos.add(clave(o)); ops.push(o); } }
  ops = q.ok.t === "num" ? ops.sort((a, b) => a.v - b.v) : (q.tipo === "mu_primero" || q.tipo === "oro_sin" ? ops.sort((a, b) => a.v - b.v) : barajar(ops, rng));
  return Object.assign({}, q, { ops: ops, iok: ops.indexOf(q.ok) });
}
/* las 10 preguntas de una ronda (4 fáciles, 4 medias, 2 difíciles; sin repetir ni abusar de un mismo tipo) */
export function partida(B, cat, rng) {
  const pool = B.filter((q) => cat === "todo" || q.cat === cat), usados = new Set(), porTipo = {}, porCat = {}, res = [];
  SLOTS.forEach((d) => {
    const filtros = [(q) => q.d === d && !usados.has(q.id) && (porTipo[q.tipo] || 0) < 2, (q) => !usados.has(q.id) && (porTipo[q.tipo] || 0) < 3, (q) => !usados.has(q.id)];
    let cand = []; for (const f of filtros) { cand = pool.filter(f); if (cand.length) break; }
    if (!cand.length) return;
    if (cat === "todo") { const mn = Math.min.apply(null, cand.map((q) => porCat[q.cat] || 0)); cand = cand.filter((q) => (porCat[q.cat] || 0) <= mn); }
    const q = cand[Math.floor(rng() * cand.length)]; usados.add(q.id); porTipo[q.tipo] = (porTipo[q.tipo] || 0) + 1; porCat[q.cat] = (porCat[q.cat] || 0) + 1; res.push(montar(q, rng));
  });
  return res;
}

const PLANTILLA = `
<div class="tv-fondo"></div>
<div class="tv-cab">
  <button type="button" class="tv-btn" data-tv="salir" aria-label="Salir">✕</button>
  <div class="tv-marc"><small data-ronda>1/10</small><b data-pts>0</b></div>
  <button type="button" class="tv-btn tv-btn--com" data-tv="5050" aria-label="50:50">50:50</button>
</div>
<div class="tv-puntos" data-puntos></div>
<div class="tv-tiempo"><i data-barra></i></div>
<div class="tv-info" data-info></div>
<div class="tv-carta" data-carta>
  <span class="tv-cat" data-cat></span>
  <p class="tv-sujeto" data-sujeto></p>
</div>
<div class="tv-ops" data-ops></div>
<div class="tv-pie"><button type="button" class="tv-sig" data-tv="sig" hidden></button></div>
<div class="tv-menu" data-menu>
  <div class="tv-caja">
    <p class="tv-kicker" data-k="kicker"></p>
    <h2 class="tv-titulo"><span>TRIVIA</span><span>TIKITEXTO</span></h2>
    <p class="tv-sub" data-k="sub"></p>
    <ul class="tv-como">
      <li><b>1</b><span data-k="p1"></span></li>
      <li><b>2</b><span data-k="p2"></span></li>
      <li><b>3</b><span data-k="p3"></span></li>
    </ul>
    <button type="button" class="tv-jugar tv-jugar--dia" data-tv="dia"><span data-dia-t></span><small data-dia-s></small></button>
    <p class="tv-elige" data-k="elige"></p>
    <div class="tv-chips" data-chips></div>
    <p class="tv-stats" data-stats></p>
    <button type="button" class="tv-sec" data-tv="salir" data-k="salir"></button>
  </div>
</div>
<div class="tv-fin" data-fin hidden>
  <div class="tv-caja tv-caja--s">
    <h3 data-k="fin"></h3>
    <p class="tv-rango" data-fin-rango></p>
    <p class="tv-res" data-fin-m></p>
    <p class="tv-res" data-fin-r></p>
    <p class="tv-grid" data-fin-grid aria-hidden="true"></p>
    <p class="tv-tikis" data-fin-tiki hidden data-k="tiki"></p>
    <button type="button" class="tv-jugar" data-tv="compartir" data-k="compartir"></button>
    <button type="button" class="tv-jugar tv-jugar--b" data-tv="otra" data-k="otra"></button>
    <button type="button" class="tv-sec" data-tv="menu" data-k="menu"></button>
  </div>
</div>
`;

export function abrir(api, raiz) {
  const loc = String((api && api.locale) || "es").slice(0, 2).toLowerCase(), L = Math.max(0, LANGS.indexOf(loc));
  const tr = (k) => UI[k][L];
  raiz.innerHTML = PLANTILLA; raiz.setAttribute("data-no-t", "");
  const $ = (s) => raiz.querySelector(s), $$ = (s) => Array.prototype.slice.call(raiz.querySelectorAll(s));
  $$("[data-k]").forEach((e) => { e.textContent = tr(e.dataset.k); });
  const datos = () => { const d = api.datos(); ["part", "ac", "mejor", "perf", "tiki", "dias", "racha", "rachaMax", "diaAc", "diaPts"].forEach((k) => { if (typeof d[k] !== "number") d[k] = 0; }); if (typeof d.dia !== "string") d.dia = ""; if (typeof d.diaGrid !== "string") d.diaGrid = ""; return d; };
  const S = { fase: "carga", cat: "todo", modo: "libre", preg: [], i: 0, pts: 0, racha: 0, ac: 0, grid: "", usado5050: false, lim: TIEMPO, t0: 0, tikis: 0, bloq: false, q: null };
  let raf = 0, vivo = true, ctx = null, hSig = 0, B = null, ultimoTic = 0, CP = null;

  function audio() { if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; } try { const A = window.AudioContext || window.webkitAudioContext; ctx = new A(); } catch (e) { ctx = null; } }
  function blip(f, dur, vol, tipo, f2, ret) {
    if (!ctx || !api.sonido()) return; const o = ctx.createOscillator(), g = ctx.createGain(), q = ctx.currentTime + (ret || 0);
    o.type = tipo || "sine"; o.frequency.setValueAtTime(f, q); if (f2) o.frequency.exponentialRampToValueAtTime(f2, q + dur);
    g.gain.setValueAtTime(vol, q); g.gain.exponentialRampToValueAtTime(0.0001, q + dur); o.connect(g); g.connect(ctx.destination); o.start(q); o.stop(q + dur + 0.02);
  }
  const sonBien = () => { blip(660, 0.1, 0.07, "triangle"); blip(990, 0.2, 0.07, "triangle", 0, 0.09); };
  const sonMal = () => blip(220, 0.28, 0.08, "sawtooth", 110);
  const sonTic = () => blip(880, 0.04, 0.03, "square");
  const sonFin = () => [523, 659, 784, 1046].forEach((f, i) => blip(f, 0.14, 0.07, "square", 0, i * 0.09));

  /* ── textos de una pregunta en el idioma actual ── */
  const nm = (k) => (T.N[k] ? T.N[k][L] : k);
  const unir = (a) => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + tr("y") + a[a.length - 1];
  const rotulo = (o) => o.t === "club" || o.t === "pais" || o.t === "ciudad" ? nm(o.v) : o.t === "sedes" ? unir(o.v.map(nm)) : String(o.v);
  function enunciado(q) {
    let s = Q[q.tipo][L];
    if (q.tipo === "rec") { const x = q.it, nom = (L !== 0 && x.ne) ? x.ne : x.n; return nom + " · " + (L === 0 ? q.st.es : L === 1 ? q.st.en : (LAB[q.st.es] ? LAB[q.st.es][L] : q.st.en)) + " — " + tr("cuantos"); }
    return s.replace("{y}", q.y).replace("{c}", q.c ? nm(q.c) : "").replace("{n}", q.n || "");
  }
  const trRes = (r) => r.replace("en penaltis", tr("pen")).replace("prórroga", tr("pro"));
  function ficha(q) {
    if (q.y == null) return "";
    if (q.cat === "ch") { const f = T.finales.filter((z) => z[0] === q.y)[0]; return f ? q.y + " · " + nm(f[1]) + " " + trRes(f[3]) + " " + nm(f[2]) + " · " + nm(f[4]) : q.y + " · " + nm(T.campeones.filter((z) => z[0] === q.y)[0][1]); }
    if (q.cat === "mu") { const m = T.mundiales.filter((z) => z[0] === q.y)[0]; return m ? q.y + " · " + nm(m[2]) + " – " + nm(m[3]) + " · " + unir(m[1].map(nm)) + (m[5] ? " · " + m[5][0] + " (" + m[5][1] + ")" : "") : ""; }
    if (q.cat === "oro") return q.y + " · " + q.ok.v;
    return "";
  }

  function pintaHud() { $("[data-ronda]").textContent = tr("preg") + " " + Math.min(S.i + 1, S.preg.length || NPREG) + "/" + (S.preg.length || NPREG); $("[data-pts]").textContent = String(S.pts); }
  function pintaPuntos() { let h = ""; for (let k = 0; k < NPREG; k++) { const c = S.grid[k]; h += '<i class="' + (c === "1" ? "ok" : c === "0" ? "ko" : k === S.i ? "ya" : "") + '"></i>'; } $("[data-puntos]").innerHTML = h; }
  function info(txt, cls) { const e = $("[data-info]"); e.className = "tv-info" + (cls ? " " + cls : ""); e.textContent = txt || ""; }
  const hoy = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const rango = (ac) => UI.rangos[L][ac >= 10 ? 4 : ac >= 9 ? 3 : ac >= 7 ? 2 : ac >= 4 ? 1 : 0];
  function pintaMenu() {
    const d = datos(), hecho = d.dia === hoy();
    $("[data-dia-t]").textContent = (hecho ? "✔ " : "📅 ") + (hecho ? tr("diaHecho") : tr("dia"));
    $("[data-dia-s]").textContent = hecho ? d.diaAc + "/" + NPREG + " · " + d.diaPts + " " + tr("puntos") : tr("diaSub");
    const cats = ["todo", "ch", "mu", "oro"].concat(CP ? ["rec"] : []);
    $("[data-chips]").innerHTML = cats.map((c) => '<button type="button" class="tv-chip' + (S.cat === c ? " on" : "") + '" data-tv="cat" data-c="' + c + '">' + UI.cat[c][L] + "</button>").join("") + '<button type="button" class="tv-chip tv-chip--go" data-tv="libre">▶ ' + tr("libre") + "</button>";
    $("[data-stats]").textContent = (d.mejor ? "🏆 " + d.mejor + " · " : "") + (d.racha > 1 ? "🔥 " + d.racha + " " + tr("racha") + " · " : "") + (d.part ? d.part + " ⚽ · " : "") + tr("fuente") + " " + T.fecha;
  }

  function mostrar() {
    S.q = S.preg[S.i]; S.bloq = false; S.fase = "pregunta"; S.lim = TIEMPO; S.t0 = performance.now();
    const q = S.q; $("[data-cat]").textContent = UI.cat[q.cat][L]; $("[data-sujeto]").textContent = enunciado(q);
    $("[data-carta]").classList.remove("ok", "ko"); $('[data-tv="sig"]').hidden = true; info("", "");
    const ops = $("[data-ops]"); ops.innerHTML = "";
    q.ops.forEach((o, i) => { const b = document.createElement("button"); b.type = "button"; b.className = "tv-op"; b.dataset.i = String(i); b.innerHTML = "<kbd>" + "ABCD"[i] + "</kbd><span></span>"; b.lastChild.textContent = rotulo(o); ops.appendChild(b); });
    $('[data-tv="5050"]').disabled = S.usado5050; pintaHud(); pintaPuntos();
  }
  function responder(i) {
    if (S.fase !== "pregunta" || S.bloq) return; S.bloq = true; S.fase = "resp";
    const q = S.q, ok = i === q.iok, resto = Math.max(0, S.lim - (performance.now() - S.t0) / 1000);
    $$(".tv-op").forEach((b, k) => { b.disabled = true; if (k === q.iok) b.classList.add("bien"); else if (k === i) b.classList.add("mal"); });
    S.grid += ok ? "1" : "0";
    if (ok) {
      S.racha++; S.ac++; const g = 100 + Math.round(resto / S.lim * 50) + 10 * Math.min(S.racha, 5); S.pts += g; $("[data-carta]").classList.add("ok"); sonBien(); info(tr("bien") + " +" + g, "bien");
    } else { S.racha = 0; $("[data-carta]").classList.add("ko"); sonMal(); info(i == null ? tr("tarde") : tr("mal"), "mal"); }
    const f = ficha(q); if (f) { const p = document.createElement("small"); p.className = "tv-ficha"; p.textContent = f; $("[data-info]").appendChild(p); }
    pintaHud(); pintaPuntos();
    const sig = $('[data-tv="sig"]'); sig.textContent = S.i + 1 >= S.preg.length ? tr("ver") : tr("sig"); sig.hidden = false;
    clearTimeout(hSig); hSig = setTimeout(avanza, ok ? PAUSA_OK : PAUSA_KO);
  }
  function avanza() { clearTimeout(hSig); if (!vivo || S.fase !== "resp") return; S.i++; if (S.i >= S.preg.length) termina(); else mostrar(); }
  function comodin() {
    if (S.fase !== "pregunta" || S.usado5050) return; S.usado5050 = true; $('[data-tv="5050"]').disabled = true;
    const q = S.q, malas = []; q.ops.forEach((o, k) => { if (k !== q.iok) malas.push(k); });
    barajar(malas, Math.random).slice(0, 2).forEach((k) => { const b = $('.tv-op[data-i="' + k + '"]'); if (b) { b.disabled = true; b.classList.add("fuera"); } }); blip(440, 0.12, 0.05, "triangle", 660);
  }
  function termina() {
    S.fase = "fin"; const d = datos(); d.part++; d.ac += S.ac; const nuevo = S.pts > d.mejor; if (nuevo) d.mejor = S.pts; if (S.ac === NPREG) d.perf++;
    let tiki = false;
    if (S.modo === "dia") {
      const ayer = new Date(); ayer.setDate(ayer.getDate() - 1); const sAyer = ayer.getFullYear() + "-" + String(ayer.getMonth() + 1).padStart(2, "0") + "-" + String(ayer.getDate()).padStart(2, "0");
      d.racha = d.dia === sAyer ? d.racha + 1 : 1; d.rachaMax = Math.max(d.rachaMax, d.racha); d.dias++; d.dia = hoy(); d.diaAc = S.ac; d.diaPts = S.pts; d.diaGrid = S.grid; tiki = S.ac >= UMBRAL_DIA; try { api.racha && api.racha("tv"); } catch (e) { /* opcional */ }
    } else tiki = S.ac === NPREG;
    if (tiki) { S.tikis++; d.tiki++; try { api.tiki(); } catch (e) { /* opcional */ } try { api.victoria(); } catch (e) { /* opcional */ } }
    try { api.guardar(); } catch (e) { /* opcional */ }
    sonFin(); muestraFin(S.ac, S.pts, S.grid, nuevo && S.modo !== "dia", S.tikis > 0);
  }
  function muestraFin(ac, pts, grid, nuevo, tiki) {
    $("[data-fin-rango]").textContent = rango(ac); $("[data-fin-m]").textContent = ac + "/" + NPREG + " " + tr("aciertos") + " · " + pts + " " + tr("puntos");
    $("[data-fin-r]").textContent = nuevo ? tr("rec") : "🏆 " + datos().mejor; $("[data-fin-grid]").textContent = grid.split("").map((c) => c === "1" ? "🟩" : "🟥").join("");
    $("[data-fin-tiki]").hidden = !tiki; $('[data-tv="otra"]').hidden = S.modo === "dia" || S.fase === "diaYa"; $("[data-fin]").hidden = false; pintaMenu();
  }
  function empezar(modo) {
    audio(); if (!B) { info(tr("cargando"), ""); return; }
    S.modo = modo; const d = datos();
    if (modo === "dia" && d.dia === hoy()) { S.fase = "diaYa"; $("[data-menu]").hidden = true; muestraFin(d.diaAc, d.diaPts, d.diaGrid, false, false); return; }
    const rng = modo === "dia" ? mulberry(semillaDe("tikitexto-trivia-" + hoy())) : Math.random;
    S.preg = partida(B, modo === "dia" ? "todo" : S.cat, rng); if (S.preg.length < 6) return;
    Object.assign(S, { fase: "pregunta", i: 0, pts: 0, racha: 0, ac: 0, grid: "", usado5050: false, tikis: 0 });
    $("[data-menu]").hidden = true; $("[data-fin]").hidden = true; mostrar(); cancelAnimationFrame(raf); raf = requestAnimationFrame(bucle);
  }
  function bucle() {
    if (!vivo) return; raf = requestAnimationFrame(bucle);
    if (S.fase !== "pregunta") return;
    const resto = S.lim - (performance.now() - S.t0) / 1000, k = clamp(resto / S.lim, 0, 1), b = $("[data-barra]");
    b.style.transform = "scaleX(" + k.toFixed(4) + ")"; b.className = k < 0.25 ? "rojo" : k < 0.5 ? "ambar" : "";
    if (resto < 3 && Math.ceil(resto) !== ultimoTic) { ultimoTic = Math.ceil(resto); sonTic(); }
    if (resto <= 0) responder(null);
  }
  function compartir() {
    const d = datos(), esDia = S.modo === "dia" || S.fase === "diaYa", ac = esDia ? d.diaAc : S.ac, grid = esDia ? d.diaGrid : S.grid;
    const txt = "TIKITEXTO Trivia " + (esDia ? hoy() + " " : "") + ac + "/" + NPREG + "\n" + grid.split("").map((c) => c === "1" ? "🟩" : "🟥").join("") + "\nhttps://tikitexto.com/?modo=trivia";
    const b = $('[data-tv="compartir"]');
    const copiado = () => { const t0 = tr("compartir"); b.textContent = tr("copiado"); setTimeout(() => { if (vivo) b.textContent = t0; }, 1600); };
    try { if (navigator.share) { navigator.share({ text: txt }).catch(() => { /* cancelado */ }); return; } } catch (e) { /* sin share */ }
    try { navigator.clipboard.writeText(txt).then(copiado, () => { /* sin permiso */ }); } catch (e) { /* sin portapapeles */ }
  }
  raiz.addEventListener("click", function (e) {
    audio();
    const op = e.target.closest ? e.target.closest(".tv-op") : null; if (op) { responder(+op.dataset.i); return; }
    const b = e.target.closest ? e.target.closest("[data-tv]") : null; if (!b) return; const a = b.dataset.tv;
    if (a === "salir") cerrar(); else if (a === "dia") empezar("dia"); else if (a === "libre") empezar("libre"); else if (a === "cat") { S.cat = b.dataset.c; pintaMenu(); }
    else if (a === "5050") comodin(); else if (a === "sig") avanza(); else if (a === "otra") empezar("libre"); else if (a === "compartir") compartir();
    else if (a === "menu") { $("[data-fin]").hidden = true; $("[data-menu]").hidden = false; S.fase = "menu"; pintaMenu(); }
  });
  const onKey = (e) => {
    if (e.key === "Escape") { cerrar(); return; }
    if (S.fase === "pregunta") { const k = e.key.toLowerCase(), i = "abcd".indexOf(k) >= 0 ? "abcd".indexOf(k) : ("1234".indexOf(k) >= 0 ? "1234".indexOf(k) : -1); if (i >= 0 && S.q && i < S.q.ops.length) responder(i); else if (k === "f") comodin(); }
    else if (S.fase === "resp" && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); avanza(); }
  };
  window.addEventListener("keydown", onKey);
  function cerrar() {
    if (!vivo) return; vivo = false; cancelAnimationFrame(raf); clearTimeout(hSig); window.removeEventListener("keydown", onKey);
    try { if (ctx) ctx.close(); } catch (e) { /* opcional */ }
    raiz.innerHTML = ""; if (api.salir) api.salir();
  }
  /* los récords salen del Comparador (se carga una vez como script de la propia web); si falla, la trivia sigue sin esa categoría */
  function listo(D) { CP = D || null; B = banco(CP); S.fase = "menu"; if (vivo) pintaMenu(); }
  pintaHud(); pintaPuntos();
  if (window.CP_DATA) listo(window.CP_DATA);
  else { const s = document.createElement("script"); s.src = "comparador_datos.js"; s.onload = function () { listo(window.CP_DATA); }; s.onerror = function () { listo(null); }; document.head.appendChild(s); }
  return { cerrar: cerrar, S: S, empezar: empezar, responder: responder, comodin: comodin, avanza: avanza, banco: () => B, partida: (c, r) => partida(B, c, r || Math.random), montar: montar, enunciado: enunciado, rotulo: rotulo, ficha: ficha, T: T, hoy: hoy, UI: UI, Q: Q };
}
