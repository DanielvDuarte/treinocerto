// ============================================================
// Camada de mídia dos exercícios — com CHAVE DE ROLLBACK.
//
// Hoje usamos os GIFs do dataset (© Gym Visual) para TESTE PESSOAL.
// Essas mídias NÃO podem ser distribuídas num app comercial sem
// licença da Gym Visual. Por isso tudo passa por aqui:
//
//   NEXT_PUBLIC_EXERCISE_MEDIA = "gymvisual"  -> mostra os GIFs
//   NEXT_PUBLIC_EXERCISE_MEDIA = "svg"        -> volta ao nosso SVG próprio
//
// Padrão = "svg" (100% nosso, seguro para comercial). Para testar com
// os GIFs, defina a env como "gymvisual" e rode o script de download.
// Reverter = trocar a env de volta para "svg" (ou remover). Rollback
// instantâneo, sem tocar no resto do código.
// ============================================================
import MEDIA_MAP from "./exercise-media-map.json";

const SOURCE = (process.env.NEXT_PUBLIC_EXERCISE_MEDIA || "svg").toLowerCase();

// Onde os arquivos de mídia são servidos. Local por padrão (pasta
// public/exercise-media, que fica no .gitignore). Pode apontar depois
// para um CDN/Supabase Storage/Cloudflare R2 quando/ se for licenciado.
const BASE = (process.env.NEXT_PUBLIC_EXERCISE_MEDIA_BASE || "/exercise-media").replace(/\/$/, "");

export const MEDIA_ENABLED = SOURCE === "gymvisual";

// Retorna a URL do GIF de um exercício nosso (refId), ou null se não houver
// mapeamento / se a fonte estiver em "svg".
export function gifFor(refId) {
  if (!MEDIA_ENABLED) return null;
  const m = MEDIA_MAP[refId];
  if (!m) return null;
  return `${BASE}/${m.gif}`;
}

export function imageFor(refId) {
  if (!MEDIA_ENABLED) return null;
  const m = MEDIA_MAP[refId];
  if (!m) return null;
  return `${BASE}/${m.image}`;
}

// Para o catálogo completo (1.324): monta a URL a partir do caminho do item.
export function catalogMedia(path) {
  if (!MEDIA_ENABLED || !path) return null;
  return `${BASE}/${path}`;
}

export const MEDIA_SOURCE = SOURCE;
export { MEDIA_MAP };
