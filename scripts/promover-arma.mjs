#!/usr/bin/env node
// Promueve una ficha externa revisada (.data/armas/<slug>.json) al catálogo estático
// (src/three/data/armas-externas.json), que se publica con la app. Uso: node scripts/promover-arma.mjs <slug>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const slug = process.argv[2];
if (!slug) { console.error('Uso: node scripts/promover-arma.mjs <slug>'); process.exit(1); }
const src = `.data/armas/${slug}.json`;
if (!existsSync(src)) { console.error(`No existe ${src}`); process.exit(1); }
const ficha = JSON.parse(readFileSync(src, 'utf8'));
const dest = 'src/three/data/armas-externas.json';
const lista = existsSync(dest) ? JSON.parse(readFileSync(dest, 'utf8')) : [];
const i = lista.findIndex(f => f.slug === ficha.slug);
const revisada = { ...ficha, revisado: true };
if (i >= 0) lista[i] = revisada; else lista.push(revisada);
writeFileSync(dest, JSON.stringify(lista, null, 2) + '\n');
console.log(`${ficha.name} (${ficha.origen}) promovida a ${dest}. Revisa el JSON, ajusta lo que haga falta y haz commit.`);
