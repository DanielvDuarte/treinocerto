// ============================================================
// Camada de mídia dos exercícios — com CHAVE DE ROLLBACK.
//
//   NEXT_PUBLIC_EXERCISE_MEDIA = "gymvisual"  -> mostra os GIFs
//   NEXT_PUBLIC_EXERCISE_MEDIA = "svg"        -> nosso mapa muscular SVG (padrão)
//
// No modo "gymvisual", por padrão os GIFs vêm do CDN jsDelivr (não precisa
// baixar nada). Para servir de uma pasta local ou CDN próprio (ex.: depois de
// licenciar), defina NEXT_PUBLIC_EXERCISE_MEDIA_BASE.
//
// Os GIFs são © Gym Visual: uso pessoal/teste ok; comercial exige licença.
// ============================================================
import MEDIA_MAP from "./exercise-media-map.json";

const SOURCE = (process.env.NEXT_PUBLIC_EXERCISE_MEDIA || "svg").toLowerCase();

// Bases padrão (ordem de tentativa). jsDelivr é mais confiável no navegador;
// raw.githubusercontent entra como reserva.
const DEFAULT_BASES = [
  "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main",
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main",
];
const CUSTOM = (process.env.NEXT_PUBLIC_EXERCISE_MEDIA_BASE || "").replace(/\/$/, "");
const BASES = CUSTOM ? [CUSTOM] : DEFAULT_BASES;

export const MEDIA_ENABLED = SOURCE === "gymvisual";

// Lista de URLs do GIF (primeira é a preferida; as seguintes são fallback).
export function gifUrls(refId) {
  if (!MEDIA_ENABLED) return [];
  const m = MEDIA_MAP[refId];
  if (!m) return [];
  return BASES.map((b) => `${b}/${m.gif}`);
}
// Compat: primeira URL, ou null.
export function gifFor(refId) {
  return gifUrls(refId)[0] || null;
}
export function imageUrls(refId) {
  if (!MEDIA_ENABLED) return [];
  const m = MEDIA_MAP[refId];
  if (!m) return [];
  return BASES.map((b) => `${b}/${m.image}`);
}
// Para o catálogo completo (1.324): URL a partir do caminho do item.
export function catalogMedia(path) {
  if (!MEDIA_ENABLED || !path) return null;
  return `${BASES[0]}/${path}`;
}

export const MEDIA_SOURCE = SOURCE;
export { MEDIA_MAP };
