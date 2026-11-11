#!/usr/bin/env node
// ============================================================
// Baixa as mídias de exercício (GIF + imagem) do dataset
// hasaneyldrm/exercises-dataset para public/exercise-media/.
//
// IMPORTANTE: as mídias são © Gym Visual, redistribuídas "com
// permissão" a 180x180. Uso PESSOAL/TESTE local tudo bem; para
// uso COMERCIAL/público é preciso licenciar com a Gym Visual
// (https://gymvisual.com). Esta pasta fica no .gitignore e NÃO
// deve ser commitada nem publicada sem licença.
//
// Uso:
//   node scripts/fetch-media.mjs          # baixa só os 38 do plano
//   node scripts/fetch-media.mjs --all    # baixa todos os 1.324 (~140 MB)
// ============================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "exercise-media");
const RAW = "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main";

const all = process.argv.includes("--all");

function load(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "src", "lib", rel), "utf8"));
}

// Monta a lista de caminhos de mídia a baixar.
let paths = [];
if (all) {
  for (const e of load("exercise-catalog.json")) {
    if (e.gif) paths.push(e.gif);
    if (e.image) paths.push(e.image);
  }
} else {
  const map = load("exercise-media-map.json");
  for (const k of Object.keys(map)) {
    if (map[k].gif) paths.push(map[k].gif);
    if (map[k].image) paths.push(map[k].image);
  }
}
paths = [...new Set(paths)];

async function download(rel) {
  const dest = path.join(OUT, rel);
  if (fs.existsSync(dest)) return "skip";
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(`${RAW}/${rel}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} em ${rel}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return "ok";
}

console.log(`Baixando ${paths.length} arquivos para public/exercise-media/ ...`);
let ok = 0, skip = 0, fail = 0;
for (let i = 0; i < paths.length; i++) {
  try {
    const r = await download(paths[i]);
    r === "ok" ? ok++ : skip++;
  } catch (e) {
    fail++;
    console.warn(`  falhou: ${paths[i]} — ${e.message}`);
  }
  if ((i + 1) % 20 === 0 || i === paths.length - 1) {
    process.stdout.write(`\r  ${i + 1}/${paths.length}  (novos ${ok}, já tinha ${skip}, falhas ${fail})`);
  }
}
console.log(`\nConcluído. Mídia em: ${OUT}`);
console.log('Lembre: defina NEXT_PUBLIC_EXERCISE_MEDIA="gymvisual" no .env.local para exibir os GIFs.');
