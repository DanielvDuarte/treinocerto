"use client";
// ============================================================
// Boneco anatômico (frente/costas, masculino/feminino).
// Contornos derivados do MuscleMap (Melih Colpan, MIT) — ver
// THIRD_PARTY_NOTICES.md. Os dados ficam em src/lib/body-paths.json
// (gerado a partir dos arquivos Swift do MuscleMap).
// ============================================================
import { createContext, useContext, useId, useLayoutEffect, useRef, useState } from "react";
import BODY from "@/lib/body-paths.json";

// Sexo do boneco ("masc" | "fem"), definido uma vez no topo do app.
export const BodySexContext = createContext("masc");

// Nossas chaves de músculo (exercises.js) -> partes do MuscleMap.
// "main" = músculo alvo (laranja forte); "sec" = ajudantes (laranja suave).
export const TARGETS = {
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

// Nome em português de cada parte do MuscleMap.
export const MUSCLE_NAMES = {
  chest: "Peitoral", deltoids: "Ombros", triceps: "Tríceps", biceps: "Bíceps", forearm: "Antebraço",
  abs: "Abdômen", obliques: "Oblíquos", quadriceps: "Quadríceps", adductors: "Adutores",
  gluteal: "Glúteos", calves: "Panturrilhas", upperBack: "Dorsais", rotatorCuff: "Manguito rotador",
  trapezius: "Trapézio", hamstring: "Posteriores", lowerBack: "Lombar",
};

// Em qual vista (frente/costas) o músculo aparece melhor.
export function sideOf(slug) {
  const backFirst = ["triceps", "trapezius", "calves"];
  if (BODY.maleFront.parts[slug] && !backFirst.includes(slug)) return "front";
  return BODY.maleBack.parts[slug] ? "back" : "front";
}

// Músculos de um exercício: primários e secundários (sem repetir).
export function musclesOf(body) {
  const t = TARGETS[body?.key] || TARGETS.full;
  return { main: t.main, sec: t.sec.filter((s) => !t.main.includes(s)) };
}

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
export default function BodyMap({ body, height = 120, sex: sexProp, glow = true, className, highlight, crop, cropPad = 0.35 }) {
  const ctxSex = useContext(BodySexContext);
  const sex = (sexProp || ctxSex) === "fem" ? "female" : "male";
  const side = body?.side === "back" ? "Back" : "Front";
  const data = BODY[`${sex}${side}`];
  const t = highlight || TARGETS[body?.key] || TARGETS.full;
  const main = new Set(t.main || []);
  const sec = new Set(t.sec || []);
  const uid = useId().replace(/:/g, "");
  // Recorte: mede os músculos pedidos (getBBox) e enquadra só aquela região.
  const cropRef = useRef(null);
  const [cropBox, setCropBox] = useState(null);
  const cropKey = crop ? crop.join(",") : "";
  useLayoutEffect(() => {
    if (!crop || !cropRef.current) { setCropBox(null); return; }
    const groups = [...cropRef.current.querySelectorAll("[data-slug]")].filter((g) => crop.includes(g.dataset.slug));
    if (!groups.length) return;
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    groups.forEach((g) => { const b = g.getBBox(); x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height); });
    const s = Math.max(x2 - x1, y2 - y1) * (1 + cropPad);
    setCropBox([(x1 + x2) / 2 - s / 2, (y1 + y2) / 2 - s / 2, s, s]);
  }, [cropKey, sex, side, cropPad]);
  const [x, y, w, h] = crop ? (cropBox || data.viewBox) : data.viewBox;
  const width = crop ? height : Math.round(height * (w / h));

  const fillFor = (slug) => {
    if (slug === "hair") return COLORS.hair;
    if (SKIN.has(slug)) return COLORS.skin;
    if (main.has(slug)) return `url(#g${uid})`;
    if (sec.has(slug)) return COLORS.sec;
    return COLORS.base;
  };
  const order = Object.keys(data.parts).sort((a, b) => (main.has(a) ? 1 : 0) - (main.has(b) ? 1 : 0));

  return (
    <svg ref={cropRef} viewBox={`${x} ${y} ${w} ${h}`} width={width} height={height} className={className} aria-hidden="true"
      preserveAspectRatio="xMidYMid meet" style={crop && !cropBox ? { visibility: "hidden" } : undefined}>
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
          <g key={slug} data-slug={slug} fill={fillFor(slug)} fillOpacity={sec.has(slug) && !isMain ? 0.55 : 1}
            stroke={COLORS.edge} strokeWidth={3} strokeLinejoin="round"
            filter={isMain && glow ? `url(#f${uid})` : undefined}>
            {data.parts[slug].map((d, i) => <path key={i} d={d} />)}
          </g>
        );
      })}
    </svg>
  );
}
