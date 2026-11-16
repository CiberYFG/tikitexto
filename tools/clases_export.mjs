// Exporta el texto de las lecciones (es/en) a tools/clases_texto.json para generar páginas indexables. Uso: node tools/clases_export.mjs
import { LECCIONES } from "../clases_datos.js";
import { TEXTOS } from "../clases_idiomas.js";
import { writeFileSync } from "fs";
const EN = TEXTOS.en, falta = [];
const t = (s) => { if (!s) return s; if (EN[s]) return EN[s]; falta.push(s.slice(0, 40)); return s; };
const out = LECCIONES.map((l) => ({ id: l.id, emoji: l.emoji, dur: l.dur, es: { titulo: l.titulo, desc: l.desc, say: l.escenas.map((e) => e.say).filter(Boolean) },
  en: { titulo: t(l.titulo), desc: t(l.desc), say: l.escenas.map((e) => e.say).filter(Boolean).map(t) } }));
writeFileSync(new URL("./clases_texto.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(out.length, "lecciones; sin traducción:", falta.length, falta.slice(0, 3));
