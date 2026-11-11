"use client";
// ============================================================
// Boneco anatômico (frente/costas, masculino/feminino).
// Contornos derivados do MuscleMap (Melih Colpan, MIT) — ver
// THIRD_PARTY_NOTICES.md. Os dados ficam em src/lib/body-paths.json
// (gerado a partir dos arquivos Swift do MuscleMap).
// ============================================================
import { createContext, useContext, useId } from "react";
import BODY from "@/lib/body-paths.json";

// Sexo do boneco ("masc" | "fem"), definido uma vez no topo do app.
export const BodySexContext = createContext("masc");

// Nossas chaves de músculo (exercises.js) -> partes do MuscleMap.
// "main" = músculo alvo (laranja forte); "sec" = ajudantes (laranja suave).
const TARGETS = {
  peito: { main: ["chest"], sec: ["deltoids", "triceps"] },
  delts: { main: ["deltoids"], sec: ["trapezius", "triceps"] },
  biceps: { main: ["biceps"], sec: ["forearm"] },
  triceps: { main: ["triceps"], sec: ["deltoids"] },
  abs: { main: ["abs"], sec: ["obliques"] },
  quads: { main: ["quadriceps"], sec: ["adductors", "gluteal", "calves"] },
  lats: { main: ["upperBack"], sec: ["rotatorCuff", "deltoids", "trapezius", "biceps"] },
  glutes: { main: ["gluteal"], sec: ["hamstring", "adductors"] },
  hams: { main: ["hamstring"], sec: ["gluteal", "calves"] },
  full: { main: ["chest", "deltoids", "abs", "quadriceps", "upperBack", "gluteal", "hamstring", "biceps", "triceps"], sec: ["obliques", "calves", "trapezius", "forearm", "lowerBack"] },
};

const SKIN = new Set(["head", "hair", "hands", "feet", "ankles", "knees", "neck"]);

const COLORS = {
  base: "#4A5464",      // músculo em repouso
  skin: "#363E4A",      // cabeça, mãos, pés
  hair: "#262C35",
  edge: "#181C23",      // contorno entre músculos (cor do fundo)
  main1: "#FF9A5C", main2: "#FF5630",
  sec: "#FFB07A",
};

/**
 * @param body  { side: "front"|"back", key: "peito"|... }
 * @param height altura em px (largura proporcional)
 * @param sex   opcional; senão usa o contexto
 * @param glow  brilho no músculo alvo
 */
export default function BodyMap({ body, height = 120, sex: sexProp, glow = true, className }) {
  const ctxSex = useContext(BodySexContext);
  const sex = (sexProp || ctxSex) === "fem" ? "female" : "male";
  const side = body?.side === "back" ? "Back" : "Front";
  const data = BODY[`${sex}${side}`];
  const t = TARGETS[body?.key] || TARGETS.full;
  const main = new Set(t.main);
  const sec = new Set(t.sec);
  const uid = useId().replace(/:/g, "");
  const [x, y, w, h] = data.viewBox;
  const width = Math.round(height * (w / h));

  const fillFor = (slug) => {
    if (slug === "hair") return COLORS.hair;
    if (SKIN.has(slug)) return COLORS.skin;
    if (main.has(slug)) return `url(#g${uid})`;
    if (sec.has(slug)) return COLORS.sec;
    return COLORS.base;
  };
  const order = Object.keys(data.parts).sort((a, b) => (main.has(a) ? 1 : 0) - (main.has(b) ? 1 : 0));

  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={width} height={height} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.main1} />
          <stop offset="100%" stopColor={COLORS.main2} />
        </linearGradient>
        {glow && (
          <filter id={`f${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </defs>
      {order.map((slug) => {
        const isMain = main.has(slug);
        return (
          <g key={slug} fill={fillFor(slug)} fillOpacity={sec.has(slug) && !isMain ? 0.55 : 1}
            stroke={COLORS.edge} strokeWidth={3} strokeLinejoin="round"
            filter={isMain && glow ? `url(#f${uid})` : undefined}>
            {data.parts[slug].map((d, i) => <path key={i} d={d} />)}
          </g>
        );
      })}
    </svg>
  );
}
