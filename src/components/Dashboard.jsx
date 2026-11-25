"use client";
import React, { useState, useEffect, useRef } from "react";
import { Dumbbell, Flame, LineChart as LineIcon, MessageCircle, User, Check, RotateCcw, Play, Pause, Plus, Minus, ChevronRight, Sparkles, Replace, Trophy, Calendar, Send, Scale, Info, Loader2, X, Cog, Hand, LogOut, Timer, Pencil, Trash2, Wand2, MoreVertical, MoreHorizontal, SlidersHorizontal, LayoutGrid, BarChart3, Target, Ruler, HeartPulse, Search, ChevronLeft, BookOpen, MapPin } from "lucide-react";
import BodyMap, { BodySexContext, MUSCLE_NAMES, musclesOf, sideOf } from "@/components/BodyMap";
import { InstallBanner, InstallButton } from "@/components/InstallApp";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { LIB_BY_ID, byGroup, byPattern, makeExercise, buildPlan, buildCustomPlan, planToConfig, planFromAIJson, startingLoad, LIB_IDS_SPEC, autoDayName, GROUP_ORDER, GROUP_LABELS, dayLetter } from "@/lib/exercises";
import { gifUrls, catalogMediaUrls, MEDIA_MAP } from "@/lib/media";
import { loadState, patchState, signOut, askCoach } from "@/lib/data";
import { APP_VERSION } from "@/lib/version";

/* ============================== TEMA ============================== */
const C = {
  bg: "#13161B", bg2: "#181C23", card: "#20252E", card2: "#272D38",
  line: "#323A47", text: "#EEF1F5", mut: "#8B93A1", mut2: "#5E6675",
  amber: "#FF8A3D", amberSoft: "#FFB07A", mint: "#46E0A0", mintDim: "#1E5E45",
  indigo: "#8C7BFF", red: "#FF6B6B", muscle: "#39424F", hl: "#FF5630",
};
const display = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };
const body = { fontFamily: "'Inter', system-ui, sans-serif" };
// Rótulos condensados em caixa alta (seções, menu inferior, botões de ação).
const label = { fontFamily: "'Barlow Condensed', 'Inter', system-ui, sans-serif", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700 };
// Superfícies "vidro" (menu inferior, cabeçalho, popovers).
const GLASS = { background: "rgba(32,37,46,.78)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,.07)" };
const CTA_BG = `linear-gradient(90deg, ${C.amber} 0%, #FFA766 100%)`;

/* ============================== PEÇAS DE LAYOUT ==============================
   Cabeçalho de tela, botões redondos, menu de opções (⋮), rótulo de seção,
   controle segmentado e linhas de lista — usados em todas as telas. */
function ScreenHeader({ title, sub, children }) {
  return (
    <div style={{ paddingTop: "calc(env(safe-area-inset-top) + 10px)" }} className="sticky top-0 z-40 -mx-4 px-4 pb-3 lg:static lg:mx-0 lg:px-0 lg:pt-0 tc-head">
      <div className="flex items-center justify-between gap-3 min-h-[44px]">
        <div className="min-w-0 flex items-center gap-2">
          <Dumbbell size={22} color={C.amber} className="shrink-0 -rotate-45" />
          <div className="min-w-0">
            <h1 style={{ color: C.text, ...display }} className="text-[24px] lg:text-[28px] font-bold leading-none truncate">{title}</h1>
            {sub && <p style={{ color: C.mut2, ...body }} className="text-xs mt-1 truncate">{sub}</p>}
          </div>
        </div>
        {children && <div style={GLASS} className="shrink-0 rounded-full flex items-center p-1 gap-0.5">{children}</div>}
      </div>
    </div>
  );
}
function IconBtn({ icon: Icon, onClick, label: aria, active }) {
  return (
    <button onClick={onClick} aria-label={aria} title={aria} style={{ color: active ? C.amber : C.text }}
      className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/10 hover:bg-white/10">
      <Icon size={18} />
    </button>
  );
}
// Menu de opções estilo popover: botão ⋮ (ou outro ícone) que abre uma lista de ações.
function OptionsMenu({ items, icon: Icon = MoreVertical, ariaLabel = "Mais opções", align = "right", trigger }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close); window.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); window.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger ? trigger(() => setOpen((o) => !o)) : <IconBtn icon={Icon} label={ariaLabel} onClick={() => setOpen((o) => !o)} active={open} />}
      {open && (
        <div role="menu" style={{ ...GLASS, background: "rgba(27,31,39,.96)", boxShadow: "0 18px 50px rgba(0,0,0,.5)" }}
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-[calc(100%+8px)] z-[70] min-w-[230px] rounded-2xl py-1.5 tc-pop`}>
          {items.filter(Boolean).map((it, i) => {
            const I = it.icon;
            return (
              <button key={i} role="menuitem" onClick={() => { setOpen(false); it.onClick(); }}
                style={{ color: it.danger ? C.red : C.text, ...body }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[15px] active:bg-white/5 hover:bg-white/5">
                {I && <I size={18} style={{ color: it.danger ? C.red : C.mut }} className="shrink-0" />}
                <span className="flex-1 min-w-0">{it.label}{it.hint && <span style={{ color: C.mut2 }} className="block text-xs">{it.hint}</span>}</span>
                {it.chevron && <ChevronRight size={16} style={{ color: C.mut2 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
function SectionLabel({ children, right, className = "" }) {
  return (
    <div className={`flex items-center justify-between gap-3 mt-6 mb-3 ${className}`}>
      <p style={{ color: C.text, ...label }} className="text-[13px]">{children}</p>
      {right}
    </div>
  );
}
// Controle segmentado em pílula (abas internas).
function Segmented({ options, value, onChange, size = "md" }) {
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.line}` }} className="rounded-full p-1 flex gap-1">
      {options.map(([v, l]) => {
        const on = value === v;
        return (
          <button key={v} onClick={() => onChange(v)} style={{ background: on ? C.card2 : "transparent", color: on ? C.amber : C.mut, boxShadow: on ? "inset 0 0 0 1px rgba(255,138,61,.25)" : "none", ...label }}
            className={`flex-1 rounded-full ${size === "sm" ? "py-1.5 text-[11px]" : "py-2 text-[12px]"} px-2 whitespace-nowrap`}>{l}</button>
        );
      })}
    </div>
  );
}
// Pílula de filtro / chip (ex.: "5 músculos ▾", "Peso livre").
function Chip({ children, on, onClick, icon: Icon }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag onClick={onClick} style={{ background: on ? "rgba(255,138,61,.14)" : C.card, color: on ? C.amber : C.text, border: `1px solid ${on ? "rgba(255,138,61,.45)" : C.line}`, ...body }}
      className="shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap">
      {Icon && <Icon size={14} style={{ color: on ? C.amber : C.mut }} />}{children}
    </Tag>
  );
}
// Grupo de linhas no estilo "lista de ajustes": fundo contínuo e divisórias finas.
function ListGroup({ children }) {
  return <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl overflow-hidden divide-y divide-[#2A313C]">{children}</div>;
}
function ListRow({ icon: Icon, title, value, onClick, chevron = !!onClick, danger, right, sub }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${onClick ? "active:bg-white/5 hover:bg-white/5" : ""}`}>
      {Icon && <span style={{ background: C.bg2, color: danger ? C.red : C.mut }} className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center"><Icon size={17} /></span>}
      <span className="flex-1 min-w-0">
        <span style={{ color: danger ? C.red : C.text, ...body }} className="block text-[15px] font-medium truncate">{title}</span>
        {sub && <span style={{ color: C.mut2, ...body }} className="block text-xs mt-0.5 leading-snug">{sub}</span>}
      </span>
      {value != null && <span style={{ color: C.mut, ...body }} className="text-sm text-right shrink-0 max-w-[50%] truncate">{value}</span>}
      {right}
      {chevron && <ChevronRight size={17} style={{ color: C.mut2 }} className="shrink-0" />}
    </Tag>
  );
}
// Botão de ação principal flutuante (pílula com gradiente).
function FloatingCTA({ children, onClick, disabled, tone = "amber", icon: Icon }) {
  const bg = disabled ? C.card2 : tone === "mint" ? `linear-gradient(90deg, ${C.mint}, #7CF5B8)` : CTA_BG;
  const glow = disabled ? "none" : tone === "mint" ? "0 12px 34px rgba(70,224,160,.32)" : "0 12px 34px rgba(255,138,61,.35)";
  return (
    <div className="sticky bottom-[calc(92px+env(safe-area-inset-bottom))] lg:bottom-5 mt-5 z-30">
      <button onClick={onClick} disabled={disabled} style={{ background: bg, color: disabled ? C.mut : C.bg, boxShadow: glow, border: disabled ? `1px solid ${C.line}` : "none", ...label }}
        className="w-full rounded-full py-4 text-[17px] flex items-center justify-center gap-2 lg:max-w-md lg:mx-auto">
        {Icon && <Icon size={19} />}{children}
      </button>
    </div>
  );
}

/* ============================== DATA / IDADE ============================== */
// Calcula a idade (anos) a partir de uma data "YYYY-MM-DD".
function ageFromBirthdate(bd) {
  if (!bd) return 0;
  const d = new Date(`${bd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 0;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a -= 1;
  return a > 0 && a < 120 ? a : 0;
}
// Estima uma data de nascimento base (1º de janeiro) a partir da idade — usado
// para quem já tinha cadastro só com a idade, para pré-preencher o campo de data.
function birthdateFromAge(age) {
  const a = +age;
  if (!a || a < 5 || a > 120) return "";
  return `${new Date().getFullYear() - a}-01-01`;
}
// Progressão de carga padrão (desligada).
const DEFAULT_PROGRESSION = { enabled: false, stepKg: 2.5 };
// Dado o último registro de uma série, sugere a carga do próximo treino.
function suggestKg(last, progression) {
  const base = num(last?.kg);
  if (!base) return null;
  if (progression?.enabled) {
    const step = num(progression.stepKg) || 0;
    return +(base + step).toFixed(2);
  }
  return base;
}

const EQUIP = {
  maquina: { label: "Máquina", short: "Máquina", icon: Cog },
  livre: { label: "Peso livre", short: "Peso livre", icon: Dumbbell },
  cabo: { label: "Polia / Cabo", short: "Polia", icon: Cog },
  corpo: { label: "Peso do corpo", short: "Corpo", icon: Hand },
};

/* ============================== IA (via rota server-side) ============================== */
const COACH_SYSTEM =
  "Você é o Coach do app TreinoCerto, um assistente de academia em português do Brasil. " +
  "Ajude com técnica de exercícios, ajustes de treino e orientações gerais de alimentação para quem treina. " +
  "Seja prático, direto e motivador, em poucos parágrafos. " +
  "Você NÃO é médico, nutricionista nem farmacêutico. Para MEDICAÇÃO, suplementos, doses, lesões, dores persistentes ou condições de saúde, " +
  "dê apenas informação geral e oriente a procurar um profissional. Nunca recomende doses ou remédios específicos, dietas extremas ou jejum prolongado.";
// Mantém a mesma assinatura usada na UI; agora chama /api/coach (chave protegida no servidor).
const callClaude = (messages, system) => askCoach(messages, system);

// Sistema do chat do coach: além de orientar, ele PODE propor mudanças no treino.
// Quando o usuário pede para mudar/montar/ajustar o treino, o coach responde
// normalmente e, no fim, inclui UM bloco <plano>{json}</plano> que o app
// transforma em botão "Aplicar ao meu plano" (o usuário confirma).
const COACH_CHAT_SYSTEM =
  COACH_SYSTEM +
  " Você também pode ajustar o treino da pessoa. Quando ela pedir para montar, mudar, trocar, adicionar ou tirar exercícios do treino, " +
  "explique brevemente o que mudou e, no FINAL da resposta, inclua UM bloco EXATAMENTE neste formato (sem markdown dentro dele): " +
  '<plano>{"days":[{"name":"Peito e Tríceps","exercises":[{"refId":"supino_maquina","sets":4,"reps":"10-12","rest":75}]}]}</plano>. ' +
  "Regras do bloco: use SOMENTE estes ids no campo refId: " + LIB_IDS_SPEC + ". " +
  "Respeite as limitações e o objetivo da pessoa. Inclua o bloco <plano> SOMENTE quando a pessoa realmente quer mudar o treino; em dúvidas gerais, responda sem bloco. Nunca invente ids.";

// Extrai o bloco <plano>...</plano> de uma resposta do coach.
// Retorna { clean, config } — clean é o texto sem o bloco; config é o JSON do plano.
function extractPlanBlock(text) {
  if (!text) return { clean: text, config: null };
  const m = text.match(/<plano>([\s\S]*?)<\/plano>/i);
  if (!m) return { clean: text, config: null };
  const clean = text.replace(m[0], "").trim();
  try {
    const raw = m[1];
    const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    if (json && Array.isArray(json.days) && json.days.length) return { clean, config: json };
  } catch { /* bloco malformado: ignora e mostra só o texto */ }
  return { clean, config: null };
}

/* ============================== MAPA MUSCULAR ==============================
   Boneco anatômico (MuscleMap, MIT) em src/components/BodyMap.jsx. */
function MuscleMap({ body: b, size = 96 }) {
  return <BodyMap body={b} height={Math.round(size * 1.9)} />;
}

/* ============================== MÍDIA DO EXERCÍCIO (GIF ou SVG) ==============================
   Com a fonte "gymvisual" ligada e GIF disponível: mostra o GIF do exercício
   com um selo do músculo trabalhado no canto. Sem GIF (ou se falhar):
   mostra o boneco anatômico. O app nunca fica sem imagem. */
function ExerciseMedia({ refId, body: b, size = 66, radius = 12, badge = true, tall = false }) {
  const urls = gifUrls(refId);
  const [i, setI] = useState(0);
  if (urls.length && i < urls.length) {
    const bs = Math.max(20, Math.round(size * 0.36));
    return (
      <div style={{ width: size, height: size, borderRadius: radius, background: "#fff" }} className="relative overflow-hidden shrink-0">
        <img key={i} src={urls[i]} alt="" width={size} height={size} loading="lazy" decoding="async"
          onError={() => setI(i + 1)} style={{ width: size, height: size, objectFit: "contain" }} />
        {badge && size >= 40 && (
          <div style={{ width: bs, height: bs, background: C.bg2, border: `1px solid ${C.line}`, borderRadius: Math.round(bs * 0.28) }}
            className="absolute bottom-1 right-1 flex items-center justify-center">
            <BodyMap body={b} height={Math.round(bs * 0.9)} glow={false} />
          </div>
        )}
      </div>
    );
  }
  // Sem GIF: boneco em formato retrato (corpo inteiro cabe melhor).
  const h = tall ? Math.round(size * 1.3) : size;
  return (
    <div style={{ width: size, height: h, borderRadius: radius, background: `radial-gradient(circle at 50% 35%, ${C.card2} 0%, ${C.bg2} 80%)` }}
      className="flex items-center justify-center shrink-0 overflow-hidden">
      <BodyMap body={b} height={Math.round(h * 0.94)} glow={h >= 100} />
    </div>
  );
}

/* ============================== ANIMAÇÃO DO MOVIMENTO ============================== */
function MoveFigure({ anim, size = 100 }) {
  const stroke = C.amber, skin = C.amberSoft, bar = C.text;
  const cm = { fill: "none", stroke, strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" };
  const head = (cx, cy) => <circle cx={cx} cy={cy} r="8" fill={skin} stroke={stroke} strokeWidth="3" />;
  const cls = `an-${anim}`;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
      {anim === "squat" && (<g className={cls}>{head(60, 22)}<line x1="60" y1="30" x2="60" y2="66" {...cm} /><line x1="44" y1="30" x2="76" y2="30" stroke={bar} strokeWidth="4" strokeLinecap="round" /><line x1="60" y1="66" x2="48" y2="92" {...cm} /><line x1="48" y1="92" x2="50" y2="110" {...cm} /><line x1="60" y1="66" x2="72" y2="92" {...cm} /><line x1="72" y1="92" x2="70" y2="110" {...cm} /></g>)}
      {(anim === "bench" || anim === "fly" || anim === "pushup") && (<g className={`an-${anim}`}><line x1="20" y1="78" x2="100" y2="78" stroke={C.line} strokeWidth="6" strokeLinecap="round" />{head(34, 62)}<line x1="42" y1="64" x2="86" y2="64" {...cm} /><g className="arm"><line x1="70" y1="64" x2="70" y2="42" {...cm} /><line x1="58" y1="42" x2="82" y2="42" stroke={bar} strokeWidth="4" strokeLinecap="round" /></g><line x1="86" y1="64" x2="100" y2="58" {...cm} /></g>)}
      {anim === "pulldown" && (<g className={cls}><line x1="20" y1="14" x2="100" y2="14" stroke={C.line} strokeWidth="4" />{head(60, 40)}<line x1="60" y1="48" x2="60" y2="82" {...cm} /><g className="arm"><line x1="60" y1="52" x2="44" y2="30" {...cm} /><line x1="60" y1="52" x2="76" y2="30" {...cm} /><line x1="40" y1="30" x2="80" y2="30" stroke={bar} strokeWidth="4" strokeLinecap="round" /></g><line x1="60" y1="82" x2="50" y2="106" {...cm} /><line x1="60" y1="82" x2="70" y2="106" {...cm} /></g>)}
      {anim === "row" && (<g className={cls}>{head(36, 40)}<line x1="40" y1="46" x2="74" y2="60" {...cm} /><g className="arm"><line x1="74" y1="60" x2="92" y2="50" {...cm} /><circle cx="94" cy="49" r="4" fill={bar} /></g><line x1="74" y1="60" x2="80" y2="96" {...cm} /><line x1="80" y1="96" x2="64" y2="108" {...cm} /><line x1="80" y1="96" x2="92" y2="108" {...cm} /></g>)}
      {(anim === "press" || anim === "lateral") && (<g className={cls}>{head(60, 26)}<line x1="60" y1="34" x2="60" y2="74" {...cm} /><g className="arm"><line x1="60" y1="42" x2="40" y2="30" {...cm} /><line x1="60" y1="42" x2="80" y2="30" {...cm} /><circle cx="38" cy="29" r="5" fill={bar} /><circle cx="82" cy="29" r="5" fill={bar} /></g><line x1="60" y1="74" x2="50" y2="104" {...cm} /><line x1="60" y1="74" x2="70" y2="104" {...cm} /></g>)}
      {(anim === "curl" || anim === "pushdown") && (<g className={cls}>{head(60, 24)}<line x1="60" y1="32" x2="60" y2="76" {...cm} /><line x1="60" y1="40" x2="48" y2="56" {...cm} /><g className="arm"><line x1="48" y1="56" x2="50" y2="40" {...cm} /><circle cx="51" cy="38" r="5" fill={bar} /></g><line x1="60" y1="76" x2="52" y2="104" {...cm} /><line x1="60" y1="76" x2="68" y2="104" {...cm} /></g>)}
      {(anim === "legpress" || anim === "legext") && (<g className={cls}>{head(28, 50)}<line x1="34" y1="54" x2="62" y2="58" {...cm} /><g className="arm"><line x1="62" y1="58" x2="84" y2="48" {...cm} /><line x1="84" y1="48" x2="92" y2="66" {...cm} /></g><rect x="92" y="40" width="8" height="44" rx="3" fill={C.line} /></g>)}
      {anim === "hipthrust" && (<g className={cls}><line x1="18" y1="44" x2="46" y2="44" stroke={C.line} strokeWidth="6" strokeLinecap="round" />{head(30, 38)}<g className="arm"><line x1="40" y1="50" x2="72" y2="58" {...cm} /><line x1="72" y1="58" x2="92" y2="84" {...cm} /><line x1="92" y1="84" x2="100" y2="100" {...cm} /><line x1="64" y1="52" x2="80" y2="52" stroke={bar} strokeWidth="5" strokeLinecap="round" /></g></g>)}
      {anim === "abduction" && (<g className={cls}>{head(60, 30)}<line x1="60" y1="38" x2="60" y2="68" {...cm} /><g className="arm"><line x1="60" y1="68" x2="42" y2="98" {...cm} /><line x1="60" y1="68" x2="78" y2="98" {...cm} /></g></g>)}
      {anim === "lunge" && (<g className={cls}>{head(54, 26)}<line x1="54" y1="34" x2="56" y2="64" {...cm} /><g className="arm"><line x1="56" y1="64" x2="38" y2="90" {...cm} /><line x1="38" y1="90" x2="38" y2="108" {...cm} /><line x1="56" y1="64" x2="80" y2="84" {...cm} /><line x1="80" y1="84" x2="80" y2="108" {...cm} /></g></g>)}
      {(anim === "plank" || anim === "crunch") && (<g className={cls}>{head(28, 64)}<line x1="34" y1="66" x2="92" y2="80" {...cm} /><g className="arm"><line x1="40" y1="68" x2="40" y2="88" {...cm} /><line x1="92" y1="80" x2="78" y2="100" {...cm} /><line x1="92" y1="80" x2="98" y2="100" {...cm} /></g></g>)}
      {anim === "run" && (<g className={cls}>{head(58, 26)}<line x1="58" y1="34" x2="60" y2="64" {...cm} /><g className="arm"><line x1="59" y1="42" x2="44" y2="50" {...cm} /><line x1="59" y1="42" x2="74" y2="36" {...cm} /><line x1="60" y1="64" x2="44" y2="92" {...cm} /><line x1="60" y1="64" x2="78" y2="86" {...cm} /></g></g>)}
    </svg>
  );
}

/* ============================== TIMER ============================== */
function RestTimer({ seconds, onDone, onSkip }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { onDone && onDone(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, running]);
  const pct = Math.max(0, (left / seconds) * 100);
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");
  return (
    <div style={{ background: C.card2, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mt-2">
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: C.mint, ...body }} className="text-xs font-semibold uppercase tracking-wide">Descanso</span>
        <span style={{ color: C.text, ...display }} className="text-2xl font-bold tabular-nums">{mm}:{ss}</span>
      </div>
      <div style={{ background: C.bg }} className="h-2 rounded-full overflow-hidden mb-3">
        <div style={{ width: `${pct}%`, background: C.mint, transition: "width 1s linear" }} className="h-full" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => setRunning((r) => !r)} style={{ background: C.card, color: C.text }} className="flex-1 rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-1">{running ? <Pause size={16} /> : <Play size={16} />}{running ? "Pausar" : "Continuar"}</button>
        <button onClick={onSkip} style={{ background: C.mintDim, color: C.mint }} className="flex-1 rounded-xl py-2 text-sm font-semibold">Pular descanso</button>
      </div>
    </div>
  );
}

/* ============================== CARD DE EXERCÍCIO ============================== */
function EquipBadge({ equip }) {
  const e = EQUIP[equip] || EQUIP.maquina;
  const Icon = e.icon;
  return <span style={{ background: C.bg2, color: C.amberSoft, border: `1px solid ${C.line}`, ...body }} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"><Icon size={11} /> {e.short}</span>;
}

// "10-12" -> "10"; "30s" -> "30s"
const repsHint = (reps) => String(reps || "").split("-")[0];
const num = (v) => { const n = parseFloat(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };
// Cardio conta como 1 bloco (duração/distância); o resto usa ex.sets.
const isCardio = (ex) => ex?.group === "cardio";
const setCountOf = (ex) => (isCardio(ex) ? 1 : (ex?.sets || 1));

// Painel de cardio: duração (min) e distância (km) no lugar de séries×reps×peso.
function CardioPanel({ ex, done, log, onToggle, onLog }) {
  const isDone = done.includes(0);
  const row = log?.[0] || {};
  const suggMin = parseInt(String(ex.reps), 10) || 20;
  const inputCls = "w-full bg-transparent outline-none text-lg font-bold tabular-nums";
  const complete = () => {
    if (!isDone && (row.min == null || row.min === "")) onLog(0, "min", String(suggMin));
    onToggle(0);
  };
  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2">
        <div style={{ background: isDone ? "rgba(70,224,160,.12)" : "rgba(19,22,27,.55)", border: `1px solid ${isDone ? C.mintDim : "rgba(255,255,255,.05)"}` }} className="rounded-2xl px-3 py-2">
          <p style={{ color: C.mut2, ...label }} className="text-[11px] flex items-center gap-1"><Timer size={11} /> Duração (min)</p>
          <input value={row.min ?? ""} onChange={(e) => onLog(0, "min", e.target.value)} inputMode="numeric" placeholder={String(suggMin)} aria-label="Duração em minutos" style={{ color: C.text, ...body }} className={inputCls} />
        </div>
        <div style={{ background: isDone ? "rgba(70,224,160,.12)" : "rgba(19,22,27,.55)", border: `1px solid ${isDone ? C.mintDim : "rgba(255,255,255,.05)"}` }} className="rounded-2xl px-3 py-2">
          <p style={{ color: C.mut2, ...label }} className="text-[11px] flex items-center gap-1"><MapPin size={11} /> Distância (km)</p>
          <input value={row.km ?? ""} onChange={(e) => onLog(0, "km", e.target.value)} inputMode="decimal" placeholder="opcional" aria-label="Distância em km" style={{ color: C.text, ...body }} className={inputCls} />
        </div>
      </div>
      <button onClick={complete} style={{ background: isDone ? C.mintDim : C.card2, color: isDone ? C.mint : C.text, border: `1px solid ${isDone ? C.mint : C.line}`, ...body }} className="w-full rounded-2xl py-2.5 mt-2 text-sm font-semibold flex items-center justify-center gap-2">
        <Check size={16} strokeWidth={3} /> {isDone ? "Cardio concluído" : "Marcar cardio como feito"}
      </button>
    </div>
  );
}

function SetTable({ ex, done, log, prev, onToggle, onLog, onBlurCell, progression, startKg }) {
  const inputCls = "w-full bg-transparent text-center outline-none text-sm font-semibold tabular-nums py-2";
  return (
    <div className="mt-3">
      <div style={{ color: C.mut2, ...label }} className="grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 px-2 text-[11px] mb-1.5">
        <span>Série</span><span className="text-center">Reps</span><span className="text-center">Peso (kg)</span><span />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: ex.sets }).map((_, i) => {
          const isDone = done.includes(i);
          const row = log?.[i] || {};
          const last = prev?.[i];
          // Sugestão: progressão sobre o último treino; sem histórico, a carga inicial do perfil.
          const sugg = suggestKg(last, progression) ?? (startKg != null ? startKg : null);
          return (
            <div key={i} style={{ background: isDone ? "rgba(70,224,160,.12)" : "rgba(19,22,27,.55)", border: `1px solid ${isDone ? C.mintDim : "rgba(255,255,255,.05)"}` }}
              className="grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 items-center rounded-2xl px-2 py-1 transition-colors">
              <span style={{ color: isDone ? C.mint : C.amber, ...display }} className="text-sm font-bold text-center">{i + 1}</span>
              <input value={row.reps ?? ""} onChange={(e) => onLog(i, "reps", e.target.value)} onBlur={() => onBlurCell?.(i, "reps")} inputMode="numeric"
                placeholder={last?.reps ? String(last.reps) : repsHint(ex.reps)} aria-label={`Repetições da série ${i + 1}`}
                style={{ color: C.text, ...body }} className={inputCls} />
              <input value={row.kg ?? ""} onChange={(e) => onLog(i, "kg", e.target.value)} onBlur={() => onBlurCell?.(i, "kg")} inputMode="decimal"
                placeholder={sugg != null ? String(sugg) : "—"} aria-label={`Peso da série ${i + 1}`}
                style={{ color: C.text, ...body }} className={inputCls} />
              <button onClick={() => onToggle(i)} aria-label={isDone ? `Desmarcar série ${i + 1}` : `Concluir série ${i + 1}`}
                style={{ background: isDone ? C.mint : C.card2, border: `1px solid ${isDone ? C.mint : C.line}` }}
                className="w-9 h-9 rounded-full flex items-center justify-center justify-self-end">
                <Check size={16} color={isDone ? C.bg : C.mut} strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>
      <p style={{ color: C.mut2, ...body }} className="text-[11px] mt-2 px-1 leading-snug">
        O peso em cinza é uma <b style={{ color: C.mut }}>sugestão inicial</b> pelo seu perfil. Digite o seu na 1ª série — as próximas pegam o mesmo valor; dá pra <b style={{ color: C.mut }}>alterar cada série</b>.
      </p>
    </div>
  );
}

function ExerciseCard({ ex, idx, done, log, prev, onToggleSet, onLog, onBlurCell, onSwap, onSwapTo, onOpen, onAddSet, onRemoveSet, onRemoveExercise, progression, startKg }) {
  const cardio = isCardio(ex);
  const total = setCountOf(ex);
  const completed = done.length;
  const allDone = completed >= total;
  const [resting, setResting] = useState(false);

  // variantes de equipamento do mesmo padrão de movimento
  const variants = byPattern(ex.pattern);
  const equipsAvail = [...new Set(variants.map((v) => v.equip))];
  const handleSet = (i) => {
    const was = done.includes(i);
    // Ao concluir sem digitar, usa o último treino (ou a meta) como valor.
    if (!was) {
      const row = log?.[i] || {};
      if (row.reps == null || row.reps === "") onLog(i, "reps", prev?.[i]?.reps ? String(prev[i].reps) : repsHint(ex.reps));
      const sugg = suggestKg(prev?.[i], progression) ?? (startKg != null ? startKg : null);
      if ((row.kg == null || row.kg === "") && sugg != null) onLog(i, "kg", String(sugg));
    }
    onToggleSet(i);
    if (!was && completed + 1 < total) setResting(true);
  };
  const switchEquip = (equip) => {
    const target = variants.find((v) => v.equip === equip);
    if (target && target.id !== ex.refId) onSwapTo(idx, target);
  };
  const best = (prev || []).reduce((m, s) => Math.max(m, num(s?.kg)), 0);
  const meta = progression?.enabled && best > 0 ? +(best + (num(progression.stepKg) || 0)).toFixed(2) : 0;

  return (
    <div id={`ex-${idx}`} style={{ background: allDone ? "linear-gradient(180deg, rgba(70,224,160,.07), rgba(32,37,46,.6))" : "rgba(32,37,46,.6)", border: `1px solid ${allDone ? C.mintDim : "rgba(255,255,255,.06)"}` }} className="rounded-3xl p-3.5 scroll-mt-24">
      <div className="flex gap-3.5 items-center">
        <button onClick={() => onOpen("geral")} aria-label={`Ver detalhes de ${ex.name}`} className="shrink-0 relative">
          <ExerciseMedia refId={ex.refId} body={ex.body} size={88} radius={18} />
          {allDone && <span style={{ background: C.mint }} className="absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center"><Check size={14} color={C.bg} strokeWidth={3} /></span>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span style={{ background: "rgba(255,138,61,.12)", color: C.amber, ...label }} className="rounded-md px-2 py-0.5 text-[10px]">{(EQUIP[ex.equip] || EQUIP.maquina).short}</span>
            {best > 0 && <span style={{ background: "rgba(70,224,160,.12)", color: C.mint, ...label }} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px]"><Trophy size={10} /> Último {best}kg</span>}
            {meta > 0 && <span style={{ background: "rgba(140,123,255,.14)", color: C.indigo, ...label }} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px]"><LineIcon size={10} /> Meta {meta}kg</span>}
          </div>
          <button onClick={() => onOpen("geral")} className="text-left block"><h3 style={{ color: C.text, ...body }} className="font-semibold leading-snug text-[16px]">{ex.name}</h3></button>
          {cardio
            ? <p style={{ color: C.mut, ...body }} className="text-[13px] mt-0.5 flex items-center gap-1"><Timer size={12} /> {ex.reps}</p>
            : <p style={{ color: C.mut, ...body }} className="text-[13px] mt-0.5">{total} séries • {ex.reps} reps{(best || startKg) ? ` • ${best || startKg} kg` : ""}</p>}
          <p style={{ color: C.mut2, ...body }} className="text-[11px] mt-0.5 flex items-center gap-1 truncate"><span style={{ color: C.hl }}>{ex.muscle}</span>{cardio ? "" : <> · <Timer size={11} /> {ex.rest}s</>}</p>
        </div>
        <OptionsMenu ariaLabel={`Opções de ${ex.name}`} items={[
          { icon: Info, label: "Ver detalhes", onClick: () => onOpen("geral") },
          { icon: Play, label: "Como fazer", onClick: () => onOpen("como") },
          { icon: Replace, label: "Trocar exercício", hint: "Mesmo grupo muscular", onClick: () => onSwap(idx) },
          ...(cardio ? [] : equipsAvail.filter((eq) => eq !== ex.equip).map((eq) => ({ icon: EQUIP[eq].icon, label: `Fazer com ${EQUIP[eq].label.toLowerCase()}`, onClick: () => switchEquip(eq) }))),
          onAddSet && !cardio ? { icon: Plus, label: "Adicionar série", onClick: () => onAddSet(idx) } : null,
          onRemoveSet && !cardio && total > 1 ? { icon: Minus, label: "Remover série", onClick: () => onRemoveSet(idx) } : null,
          onRemoveExercise ? { icon: Trash2, label: "Remover exercício", danger: true, onClick: () => onRemoveExercise(idx) } : null,
        ]} />
      </div>

      {/* alternar peso livre / máquina */}
      {!cardio && equipsAvail.length > 1 && (
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto overscroll-x-contain no-scrollbar">
          {equipsAvail.map((eq) => {
            const on = ex.equip === eq;
            const E = EQUIP[eq];
            return <Chip key={eq} on={on} icon={E.icon} onClick={() => switchEquip(eq)}>{E.short}</Chip>;
          })}
        </div>
      )}

      {cardio ? (
        <CardioPanel ex={ex} done={done} log={log} onToggle={onToggleSet} onLog={onLog} />
      ) : (
        <>
          <SetTable ex={ex} done={done} log={log} prev={prev} onToggle={handleSet} onLog={onLog} onBlurCell={onBlurCell} progression={progression} startKg={startKg} />
          {(onAddSet || onRemoveSet) && (
            <div className="flex items-center justify-center gap-2 mt-2.5">
              <button onClick={() => onRemoveSet(idx)} disabled={total <= 1} aria-label="Remover uma série"
                style={{ background: C.card, color: total <= 1 ? C.mut2 : C.mut, border: `1px solid ${C.line}`, ...label }} className="rounded-full px-3.5 py-1.5 text-[12px] flex items-center gap-1"><Minus size={14} /> Série</button>
              <span style={{ color: C.mut2, ...body }} className="text-xs tabular-nums w-8 text-center">{total} séries</span>
              <button onClick={() => onAddSet(idx)} disabled={total >= 10} aria-label="Adicionar uma série"
                style={{ background: C.card, color: total >= 10 ? C.mut2 : C.amberSoft, border: `1px solid ${C.line}`, ...label }} className="rounded-full px-3.5 py-1.5 text-[12px] flex items-center gap-1"><Plus size={14} /> Série</button>
            </div>
          )}
          {resting && !allDone && <RestTimer seconds={ex.rest} onDone={() => setResting(false)} onSkip={() => setResting(false)} />}
        </>
      )}
    </div>
  );
}

/* ============================== TELA: HOJE ============================== */
function useElapsed(startedAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  if (!startedAt) return "0:00";
  const s = Math.max(0, Math.floor((now - startedAt) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

// Volume = soma de peso × reps das séries concluídas.
function sessionVolume(day, session) {
  return day.exercises.reduce((acc, _e, i) => {
    const done = session.sets[i] || [];
    const log = session.log?.[i] || {};
    return acc + done.reduce((a, s) => a + num(log[s]?.kg) * num(log[s]?.reps), 0);
  }, 0);
}

function TodayScreen({ profile, plan, setPlan, session, setSession, tracking, onComplete, goPlan, goCoach, goProgress }) {
  const [detail, setDetail] = useState(null); // { item, idx, tab }
  const [swapFor, setSwapFor] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const dayIdx = plan.cycleIndex % plan.days.length;
  const day = plan.days[dayIdx];
  const totalSets = day.exercises.reduce((a, e) => a + setCountOf(e), 0);
  const doneSets = day.exercises.reduce((a, e, i) => a + Math.min((session.sets[i] || []).length, setCountOf(e)), 0);
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;
  const allDone = day.exercises.length > 0 && day.exercises.every((e, i) => (session.sets[i] || []).length >= setCountOf(e));
  const elapsed = useElapsed(session.startedAt);
  const volume = Math.round(sessionVolume(day, session));

  const toggleSet = (exIdx, setIdx) => setSession((s) => {
    const sets = { ...s.sets }; const arr = sets[exIdx] ? [...sets[exIdx]] : [];
    const pos = arr.indexOf(setIdx); if (pos >= 0) arr.splice(pos, 1); else arr.push(setIdx);
    // O cronômetro NÃO começa aqui — só quando a pessoa aperta "Iniciar treino".
    sets[exIdx] = arr; return { ...s, sets };
  });
  const logSet = (exIdx, setIdx, field, value) => setSession((s) => {
    const log = { ...(s.log || {}) };
    const ex = { ...(log[exIdx] || {}) };
    ex[setIdx] = { ...(ex[setIdx] || {}), [field]: value.replace(/[^\d.,]/g, "").slice(0, 6) };
    log[exIdx] = ex;
    return { ...s, log };
  });
  // Ao sair do campo, repete o valor digitado nas próximas séries ainda vazias
  // (mesmo peso/reps para o exercício todo); cada série continua editável.
  const propagateCell = (exIdx, setIdx, field) => setSession((s) => {
    const log = { ...(s.log || {}) };
    const ex = { ...(log[exIdx] || {}) };
    const val = ex[setIdx]?.[field];
    if (val == null || val === "") return s;
    const total = day.exercises[exIdx]?.sets || 0;
    let changed = false;
    for (let j = setIdx + 1; j < total; j++) {
      const cur = ex[j] || {};
      if (cur[field] == null || cur[field] === "") { ex[j] = { ...cur, [field]: val }; changed = true; }
    }
    if (!changed) return s;
    log[exIdx] = ex;
    return { ...s, log };
  });
  const swapTo = (exIdx, libItem, keepProgress) => {
    setPlan((p) => {
      const days = p.days.map((d, di) => {
        if (di !== p.cycleIndex % p.days.length) return d;
        return { ...d, exercises: d.exercises.map((e, ei) => ei === exIdx ? makeExercise(libItem, profile.goal) : e) };
      });
      return { ...p, days };
    });
    setSession((s) => {
      const log = { ...(s.log || {}) }; delete log[exIdx];
      if (keepProgress) return { ...s, log };
      const sets = { ...s.sets }; delete sets[exIdx];
      return { ...s, sets, log };
    });
    setSwapFor(null);
  };
  // Edita os exercícios do dia atual do plano.
  const patchDay = (fn) => setPlan((p) => {
    const di = p.cycleIndex % p.days.length;
    return { ...p, days: p.days.map((d, k) => (k !== di ? d : { ...d, exercises: fn(d.exercises) })) };
  });
  const addSet = (exIdx) => patchDay((exs) => exs.map((e, ei) => (ei !== exIdx ? e : { ...e, sets: Math.min(10, (e.sets || 1) + 1) })));
  const removeSet = (exIdx) => {
    const old = day.exercises[exIdx]?.sets || 1;
    if (old <= 1) return;
    const removedIdx = old - 1;
    patchDay((exs) => exs.map((e, ei) => (ei !== exIdx ? e : { ...e, sets: old - 1 })));
    setSession((s) => {
      const sets = { ...s.sets }; const log = { ...(s.log || {}) };
      if (sets[exIdx]) sets[exIdx] = sets[exIdx].filter((i) => i !== removedIdx);
      if (log[exIdx]) { const e = { ...log[exIdx] }; delete e[removedIdx]; log[exIdx] = e; }
      return { ...s, sets, log };
    });
  };
  const addExercise = (libItem) => {
    patchDay((exs) => [...exs, makeExercise(libItem, profile.goal)]);
    setAddOpen(false);
  };
  const removeExercise = (exIdx) => {
    if (day.exercises.length <= 1) { window.alert("O treino precisa ter ao menos um exercício."); return; }
    if (!window.confirm(`Remover "${day.exercises[exIdx].name}" do treino de hoje?`)) return;
    patchDay((exs) => exs.filter((_, ei) => ei !== exIdx));
    // Reindexa o progresso: os exercícios após o removido "sobem" um índice.
    setSession((s) => {
      const sets = {}; const log = {};
      Object.keys(s.sets || {}).forEach((k) => { const i = +k; if (i < exIdx) sets[i] = s.sets[k]; else if (i > exIdx) sets[i - 1] = s.sets[k]; });
      Object.keys(s.log || {}).forEach((k) => { const i = +k; if (i < exIdx) log[i] = s.log[k]; else if (i > exIdx) log[i - 1] = s.log[k]; });
      return { ...s, sets, log };
    });
  };

  // Marca todas as séries de todos os exercícios como feitas (preenchendo peso/reps
  // sugeridos quando vazios), para finalizar sem marcar uma a uma.
  const markAllDone = () => {
    if (allDone) return;
    if (!window.confirm("Marcar TODAS as séries de todos os exercícios como feitas?")) return;
    setSession((s) => {
      const sets = { ...s.sets }; const log = { ...(s.log || {}) };
      day.exercises.forEach((ex, i) => {
        const count = setCountOf(ex);
        const prev = tracking.lastLoads?.[ex.refId];
        const sKg = startingLoad(ex.refId, profile);
        const exLog = { ...(log[i] || {}) };
        const arr = [];
        for (let k = 0; k < count; k++) {
          arr.push(k);
          const row = { ...(exLog[k] || {}) };
          if (isCardio(ex)) {
            if (row.min == null || row.min === "") row.min = String(parseInt(String(ex.reps), 10) || 20);
          } else {
            if (row.reps == null || row.reps === "") row.reps = prev?.[k]?.reps ? String(prev[k].reps) : repsHint(ex.reps);
            const sugg = suggestKg(prev?.[k], profile.progression) ?? (sKg != null ? sKg : null);
            if ((row.kg == null || row.kg === "") && sugg != null) row.kg = String(sugg);
          }
          exLog[k] = row;
        }
        sets[i] = arr; log[i] = exLog;
      });
      return { ...s, sets, log };
    });
  };
  const clearMarks = () => {
    if (!doneSets) return;
    if (!window.confirm("Limpar todas as marcações de séries deste treino?")) return;
    setSession((s) => ({ ...s, sets: {} }));
  };

  const hasProgress = doneSets > 0;
  const switchDay = (di) => {
    if (di === dayIdx) return;
    if (hasProgress && !window.confirm("Você já marcou séries no treino de hoje. Trocar de treino apaga esse progresso. Continuar?")) return;
    setPlan((p) => ({ ...p, cycleIndex: di }));
    setSession({ sets: {} });
  };
  const startWorkout = () => {
    setSession((s) => ({ ...s, startedAt: s.startedAt || Date.now() }));
    document.getElementById("ex-0")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const st = dayStats(day);
  const equipCount = day.exercises.reduce((m, e) => ({ ...m, [e.equip]: (m[e.equip] || 0) + 1 }), {});
  const mainEquip = Object.entries(equipCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10">
      <ScreenHeader title="Hoje" sub={`Treino ${day.id} · ${day.name}`}>
        <IconBtn icon={SlidersHorizontal} label="Montar / personalizar plano" onClick={goPlan} />
        <OptionsMenu items={[
          { icon: Play, label: session.startedAt ? "Continuar treino" : "Iniciar treino", onClick: startWorkout },
          { icon: Calendar, label: "Ver plano completo", onClick: goPlan, chevron: true },
          { icon: Sparkles, label: "Sugerir um novo treino", hint: "Peça ao coach de IA", onClick: goCoach },
          { icon: Scale, label: "Registrar peso", onClick: goProgress },
        ]} />
      </ScreenHeader>

      <InstallBanner C={C} body={body} />

      {/* Seletor de dias do ciclo (A, B, C…) */}
      <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain no-scrollbar py-1 -mx-1 px-1">
        {plan.days.map((d, di) => {
          const on = di === dayIdx;
          const past = di < dayIdx;
          return (
            <button key={d.id} onClick={() => switchDay(di)} aria-label={`Treino ${d.id}: ${d.name}`}
              style={{ background: on ? C.card2 : "transparent", color: on ? C.text : past ? C.amber : C.mut, boxShadow: on ? "inset 0 0 0 1px rgba(255,255,255,.08)" : "none", ...label }}
              className={`shrink-0 h-11 rounded-full flex items-center justify-center text-[14px] ${on ? "px-4" : "w-11"}`}>
              {past ? <Check size={18} strokeWidth={3} /> : on ? `Treino ${d.id}` : d.id}
            </button>
          );
        })}
        <button onClick={goPlan} aria-label="Ver ciclo de treinos" style={{ color: C.mut }} className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"><RotateCcw size={17} /></button>
      </div>

      {/* Chips de resumo */}
      <div className="flex gap-2 overflow-x-auto overscroll-x-contain no-scrollbar mt-3 -mx-4 px-4 lg:mx-0 lg:px-0">
        <Chip icon={Target}>{st.muscles.length} músculo{st.muscles.length === 1 ? "" : "s"}</Chip>
        <Chip icon={Timer}>~{st.minutes} min</Chip>
        {mainEquip && <Chip icon={(EQUIP[mainEquip] || EQUIP.maquina).icon}>{(EQUIP[mainEquip] || EQUIP.maquina).label}</Chip>}
      </div>

      {/* Placar do treino */}
      <div style={{ background: `radial-gradient(130% 160% at 100% 0%, rgba(255,138,61,.16) 0%, rgba(32,37,46,.7) 50%)`, border: "1px solid rgba(255,255,255,.06)" }} className="rounded-3xl p-4 mt-4 flex items-center gap-4">
        <ProgressRing pct={pct} size={60} />
        <div className="flex-1 grid grid-cols-3 gap-2">
          <HeroStat icon={Timer} label="Duração" value={elapsed} live={!!session.startedAt && !allDone} />
          <HeroStat icon={Check} label="Séries" value={`${doneSets}/${totalSets}`} />
          <HeroStat icon={Dumbbell} label="Volume kg" value={volume.toLocaleString("pt-BR")} />
        </div>
      </div>

      <DayMuscles day={day} />

      <SectionLabel right={<OptionsMenu ariaLabel="Opções da lista" items={[
        !allDone ? { icon: Check, label: "Concluir todas as séries", hint: "Marca o treino inteiro de uma vez", onClick: markAllDone } : null,
        doneSets ? { icon: RotateCcw, label: "Limpar marcações", onClick: clearMarks } : null,
        { icon: Plus, label: "Adicionar exercício", onClick: () => setAddOpen(true) },
        { icon: Calendar, label: "Trocar treino do dia", onClick: goPlan },
        { icon: Sparkles, label: "Pedir ajuste ao coach", onClick: goCoach },
      ]} trigger={(t) => <button onClick={t} aria-label="Opções da lista" style={GLASS} className="w-9 h-9 rounded-full flex items-center justify-center"><MoreHorizontal size={18} color={C.text} /></button>} />}>
        {day.exercises.length} exercícios
      </SectionLabel>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 items-start">
        {day.exercises.map((ex, i) => (
          <ExerciseCard key={`${dayIdx}-${i}`} ex={ex} idx={i} done={session.sets[i] || []}
            log={session.log?.[i]} prev={tracking.lastLoads?.[ex.refId]}
            onToggleSet={(setIdx) => toggleSet(i, setIdx)}
            onLog={(setIdx, field, v) => logSet(i, setIdx, field, v)}
            onBlurCell={(setIdx, field) => propagateCell(i, setIdx, field)}
            onSwap={(idx) => setSwapFor(idx)}
            onSwapTo={(idx, li) => swapTo(idx, li, true)}
            onOpen={(tab) => setDetail({ item: ex, idx: i, tab })}
            onAddSet={addSet} onRemoveSet={removeSet} onRemoveExercise={removeExercise}
            progression={profile.progression} startKg={startingLoad(ex.refId, profile)} />
        ))}
      </div>

      {/* Ações rápidas (linhas com ícone e seta) */}
      <div className="mt-5 divide-y divide-[#2A313C]" style={{ borderTop: `1px solid #2A313C`, borderBottom: `1px solid #2A313C` }}>
        {[
          { icon: Plus, t: "Adicionar exercício", fn: () => setAddOpen(true) },
          { icon: Replace, t: "Trocar treino do dia", fn: goPlan },
          { icon: Sparkles, t: "Pedir um treino ao coach", fn: goCoach },
          { icon: Scale, t: "Registrar peso", fn: goProgress },
        ].map((r) => (
          <button key={r.t} onClick={r.fn} className="w-full flex items-center gap-3 py-3.5 text-left active:bg-white/5 hover:bg-white/5">
            <span style={{ background: C.card, color: C.mut }} className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"><r.icon size={16} /></span>
            <span style={{ color: C.text, ...label }} className="flex-1 text-[14px]">{r.t}</span>
            <ChevronRight size={17} style={{ color: C.mut2 }} />
          </button>
        ))}
      </div>

      {allDone
        ? <FloatingCTA tone="mint" icon={Trophy} onClick={onComplete}>Finalizar treino</FloatingCTA>
        : !session.startedAt
          ? <FloatingCTA icon={Play} onClick={startWorkout}>Iniciar treino</FloatingCTA>
          : <FloatingCTA icon={Check} onClick={markAllDone}>Concluir todas as séries</FloatingCTA>}

      {detail && (
        <ExerciseDetail item={detail.item} startTab={detail.tab} prevLoads={tracking.lastLoads}
          canUseToday={detail.idx != null && (detail.item.id || detail.item.refId) !== day.exercises[detail.idx]?.refId}
          onUseToday={(li) => { swapTo(detail.idx, li, false); setDetail(null); }}
          onClose={() => setDetail(null)}
          onOpenItem={(li) => setDetail((d) => ({ item: li, idx: d?.idx ?? null, tab: "geral" }))} />
      )}

      {swapFor !== null && <SwapSheet ex={day.exercises[swapFor]} onClose={() => setSwapFor(null)} onPick={(li) => swapTo(swapFor, li, false)} askSwapAI={async (e, reason) => {
        const prompt = `A pessoa quer substituir "${e.name}" (músculo ${e.muscle}). Limitação: "${reason || "não informada"}". Sugira 1 a 2 alternativas para o MESMO grupo muscular respeitando a limitação. Diga nome e uma frase de execução. Se for dor/lesão, lembre de procurar avaliação profissional. Seja breve.`;
        return await callClaude([{ role: "user", content: prompt }], COACH_SYSTEM);
      }} />}

      {addOpen && <AddExerciseSheet existing={day.exercises} onClose={() => setAddOpen(false)} onPick={addExercise} />}
    </div>
  );
}

function ProgressRing({ pct, size = 64 }) {
  const r = (size - 8) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={C.line} strokeWidth="6" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={pct >= 100 ? C.mint : C.amber} strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .4s" }} />
      </svg>
      <span style={{ color: C.text, ...display }} className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</span>
    </div>
  );
}

function HeroStat({ icon: Icon, label: text, value, live }) {
  return (
    <div className="min-w-0">
      <p style={{ color: C.text, ...display }} className="text-lg font-bold tabular-nums leading-none flex items-center gap-1.5 truncate">
        {live && <span style={{ background: C.mint }} className="w-2 h-2 rounded-full an-pulse shrink-0" />}{value}
      </p>
      <p style={{ color: C.mut2, ...body }} className="text-[11px] mt-1 flex items-center gap-1 truncate"><Icon size={11} className="shrink-0" /> {text}</p>
    </div>
  );
}

/* ============================== DETALHE DO EXERCÍCIO ==============================
   Tela cheia no celular / painel lateral no computador. Abre ao tocar no
   exercício: GIF grande, músculos (primário/secundário) com recorte do boneco,
   seu progresso, equipamento e exercícios similares. */
const GROUP_LABEL = { peito: "Peito", costas: "Costas", pernas: "Pernas", gluteo: "Glúteos", ombro: "Ombros", biceps: "Bíceps", triceps: "Tríceps", core: "Core", cardio: "Cardio" };

function MuscleThumb({ slug, size = 56, main = true, bare = false }) {
  return (
    <div style={{ width: size, height: size, background: bare ? "transparent" : `radial-gradient(circle at 50% 45%, ${C.card2} 0%, ${C.bg} 85%)`, border: bare ? "none" : `1px solid ${C.line}` }}
      className="rounded-xl shrink-0 overflow-hidden flex items-center justify-center">
      <BodyMap body={{ side: sideOf(slug) }} highlight={main ? { main: [slug], sec: [] } : { main: [], sec: [slug] }} crop={[slug]} height={size} glow={false} />
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2.5">
      <p style={{ color: C.text, ...label }} className="text-[13px]">{children}</p>
      {right}
    </div>
  );
}

function ExerciseDetail({ item, startTab = "geral", prevLoads, canUseToday, onUseToday, onClose, onOpenItem }) {
  const refId = item.refId || item.id;
  const lib = LIB_BY_ID[refId] || item;
  const [tab, setTab] = useState(startTab);
  const urls = gifUrls(refId);
  const [gi, setGi] = useState(0);
  const hasGif = urls.length > 0 && gi < urls.length;
  const { main, sec } = musclesOf(lib.body);
  const prev = prevLoads?.[refId];
  const best = (prev || []).reduce((m, s) => Math.max(m, num(s?.kg)), 0);
  const similar = byGroup(lib.group).filter((e) => e.id !== refId);
  const E = EQUIP[lib.equip] || EQUIP.maquina; const EIcon = E.icon;

  const panelRef = useRef(null);
  useEffect(() => { setTab(startTab); setGi(0); panelRef.current?.scrollTo({ top: 0 }); }, [refId, startTab]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ background: "rgba(0,0,0,.6)" }} className="fixed inset-0 z-[60] flex justify-end">
      <div ref={panelRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={lib.name}
        style={{ background: C.bg2, borderLeft: `1px solid ${C.line}` }} className="w-full lg:max-w-[560px] h-full overflow-y-auto an-slide">
        {/* mídia */}
        <div style={{ background: hasGif ? "#fff" : `radial-gradient(circle at 50% 40%, ${C.card2} 0%, ${C.bg} 80%)` }} className="relative h-[340px] lg:h-[380px] flex items-center justify-center">
          {hasGif
            ? <img key={gi} src={urls[gi]} alt={`Execução: ${lib.name}`} onError={() => setGi(gi + 1)} className="h-full w-full object-contain" />
            : <div className="flex items-center gap-4"><MoveFigure anim={lib.anim} size={190} /><BodyMap body={lib.body} height={210} /></div>}
          <button onClick={onClose} aria-label="Fechar" style={{ background: "rgba(19,22,27,.75)", color: C.text, top: "calc(env(safe-area-inset-top) + 12px)" }}
            className="absolute left-3 w-10 h-10 rounded-full flex items-center justify-center"><X size={20} /></button>
          {hasGif && <div style={{ background: C.bg2, border: `1px solid ${C.line}` }} className="absolute bottom-8 right-3 rounded-xl p-1.5"><BodyMap body={lib.body} height={74} glow={false} /></div>}
        </div>

        {/* folha */}
        <div style={{ background: C.bg2 }} className="relative -mt-5 rounded-t-3xl px-5 pt-5 pb-28">
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span style={{ background: C.card2, color: C.mut, border: `1px solid ${C.line}`, ...body }} className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">{GROUP_LABEL[lib.group] || lib.group}</span>
            <EquipBadge equip={lib.equip} />
          </div>
          <h2 style={{ color: C.text, ...display }} className="text-[26px] leading-tight font-bold">{lib.name}</h2>

          <div className="mt-4"><Segmented options={[["geral", "Visão geral"], ["como", "Como fazer"]]} value={tab} onChange={setTab} /></div>

          {tab === "geral" ? (
            <>
              <SectionTitle>Músculos</SectionTitle>
              <div className="space-y-2">
                {[...main.map((s) => [s, true]), ...sec.map((s) => [s, false])].map(([s, isMain]) => (
                  <div key={s} className="flex items-center gap-3">
                    <MuscleThumb slug={s} main={isMain} />
                    <span style={{ color: C.text, ...body }} className="flex-1 text-[15px] font-semibold">{MUSCLE_NAMES[s] || s}</span>
                    <span style={{ background: isMain ? "rgba(255,138,61,.14)" : C.card, color: isMain ? C.amber : C.mut, border: `1px solid ${isMain ? "rgba(255,138,61,.35)" : C.line}`, ...body }}
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">{isMain ? "Primário" : "Secundário"}</span>
                  </div>
                ))}
              </div>

              <SectionTitle>Seu progresso</SectionTitle>
              <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-4">
                {prev && prev.some((r) => r?.kg || r?.reps) ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span style={{ color: C.text, ...display }} className="text-2xl font-bold">{best ? `${best} kg` : "—"}</span>
                      <span style={{ color: C.mut2, ...body }} className="text-xs">melhor carga do último treino</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {prev.map((r, i) => (r?.kg || r?.reps) ? <span key={i} style={{ background: C.bg2, color: C.mut, border: `1px solid ${C.line}`, ...body }} className="rounded-lg px-2 py-1 text-[11px] font-semibold">S{i + 1} · {r.kg ? `${r.kg}kg` : "—"} × {r.reps || "—"}</span> : null)}
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ color: C.text, ...body }} className="text-[15px] font-semibold">Nenhuma série registrada ainda</p>
                    <p style={{ color: C.mut2, ...body }} className="text-xs mt-1 leading-relaxed">Conclua um treino com este exercício para ver aqui sua melhor carga e a evolução.</p>
                  </>
                )}
              </div>

              <SectionTitle>Equipamento</SectionTitle>
              <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-3 flex items-center gap-3">
                <div style={{ background: C.bg, color: C.amber }} className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"><EIcon size={20} /></div>
                <div className="min-w-0"><p style={{ color: C.mut2, ...body }} className="text-[10px] font-bold uppercase tracking-wide">{E.label}</p><p style={{ color: C.text, ...body }} className="text-sm font-semibold truncate">{lib.machine}</p></div>
              </div>

              {similar.length > 0 && (
                <>
                  <SectionTitle>Exercícios similares</SectionTitle>
                  <div className="flex gap-3 overflow-x-auto overscroll-x-contain pb-2 -mx-5 px-5 scroll-px-5 snap-x">
                    {similar.map((s) => (
                      <button key={s.id} onClick={() => onOpenItem(s)} className="w-[116px] shrink-0 text-left snap-start">
                        <ExerciseMedia refId={s.id} body={s.body} size={116} radius={16} badge={false} />
                        <p style={{ color: C.text, ...body }} className="text-xs font-semibold mt-1.5 leading-snug line-clamp-2">{s.name}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <SectionTitle>Passo a passo</SectionTitle>
              <ol className="space-y-2.5">
                {lib.instr.map((s, k) => (
                  <li key={k} className="flex gap-3">
                    <span style={{ background: C.card2, color: C.amber, ...display }} className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold">{k + 1}</span>
                    <span style={{ color: C.text, ...body }} className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
              <div style={{ background: C.mintDim }} className="rounded-2xl p-3 mt-4"><p style={{ color: C.mint, ...body }} className="text-sm leading-relaxed"><b>Postura:</b> {lib.cue}</p></div>
              <SectionTitle>Músculos trabalhados</SectionTitle>
              <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-3 flex items-center gap-4">
                <BodyMap body={lib.body} height={200} />
                <p style={{ color: C.mut, ...body }} className="text-xs leading-relaxed"><b style={{ color: C.hl }}>Alvo</b> em laranja forte, auxiliares em laranja claro. Sinta o alvo trabalhando durante todo o movimento.</p>
              </div>
            </>
          )}
        </div>

        {canUseToday && (
          <div style={{ background: `linear-gradient(0deg, ${C.bg2} 60%, transparent)` }} className="sticky bottom-0 px-5 pb-5 pt-6">
            <button onClick={() => onUseToday(lib)} style={{ background: C.amber, color: C.bg, ...display }} className="w-full rounded-full py-3.5 font-bold flex items-center justify-center gap-2"><Replace size={18} /> Usar no treino de hoje</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Faixa "Músculos trabalhados" do treino do dia. */
function DayMuscles({ day }) {
  const slugs = [];
  day.exercises.forEach((e) => musclesOf(e.body).main.forEach((s) => { if (!slugs.includes(s)) slugs.push(s); }));
  if (!slugs.length) return null;
  return (
    <div>
      <SectionLabel>Músculos trabalhados</SectionLabel>
      <div className="flex gap-2.5 overflow-x-auto overscroll-x-contain no-scrollbar pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
        {slugs.map((s) => (
          <div key={s} style={{ background: "rgba(32,37,46,.7)", border: "1px solid rgba(255,255,255,.06)" }} className="w-[84px] rounded-2xl pt-2 pb-2 flex flex-col items-center gap-1.5 shrink-0">
            <MuscleThumb slug={s} size={52} bare />
            <span style={{ color: C.mut, ...body }} className="text-[11px] font-medium text-center leading-tight px-1 truncate w-full">{MUSCLE_NAMES[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SwapSheet({ ex, onClose, onPick, askSwapAI }) {
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState("todos");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiText, setAiText] = useState("");
  let alts = byGroup(ex.group).filter((e) => e.id !== ex.refId);
  if (filter !== "todos") alts = alts.filter((a) => filter === "livre" ? (a.equip === "livre" || a.equip === "corpo") : a.equip === filter);

  const askAI = async () => {
    setAiBusy(true); setAiText("");
    try { setAiText(await askSwapAI(ex, reason)); }
    catch { setAiText("Não consegui falar com o coach agora. Escolha uma alternativa da lista."); }
    finally { setAiBusy(false); }
  };
  const filters = [["todos", "Todos"], ["maquina", "Máquina"], ["livre", "Peso livre"], ["cabo", "Polia"]];

  return (
    <div onClick={onClose} style={{ background: "rgba(0,0,0,.6)" }} className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg2, border: `1px solid ${C.line}` }} className="w-full max-w-[480px] lg:max-w-[560px] rounded-t-[28px] lg:rounded-3xl px-5 pb-5 pt-2.5 max-h-[88vh] overflow-y-auto an-sheet">
        <div style={{ background: C.line }} className="w-10 h-1 rounded-full mx-auto mb-3 lg:hidden" />
        <div className="relative flex items-center justify-center mb-1">
          <h3 style={{ color: C.text, ...display }} className="text-lg font-bold">Trocar exercício</h3>
          <button onClick={onClose} aria-label="Fechar" style={{ color: C.mut, background: C.card }} className="absolute right-0 w-8 h-8 rounded-full flex items-center justify-center"><X size={17} /></button>
        </div>
        <p style={{ color: C.mut, ...body }} className="text-xs mb-4 text-center">Mesmo grupo: <b style={{ color: C.hl }}>{ex.muscle}</b></p>

        <div className="mb-3"><Segmented size="sm" options={filters} value={filter} onChange={setFilter} /></div>

        <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-3 mb-3">
          <p style={{ color: C.text, ...body }} className="text-xs mb-2">Tem alguma limitação? (opcional)</p>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="ex.: dor no ombro, joelho sensível..." style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, ...body }} className="w-full rounded-xl px-3 py-2 text-sm outline-none" />
          <button onClick={askAI} disabled={aiBusy} style={{ background: C.indigo, color: "#fff", ...body }} className="w-full rounded-xl py-2 mt-2 text-sm font-semibold flex items-center justify-center gap-2">{aiBusy ? <Loader2 size={16} className="an-spin" /> : <Sparkles size={16} />} Pedir sugestão ao coach</button>
          {aiText && <p style={{ color: C.text, ...body }} className="text-xs leading-relaxed mt-2 whitespace-pre-wrap">{aiText}</p>}
        </div>

        <div className="divide-y divide-[#2A313C]">
          {alts.map((a) => (
            <button key={a.id} onClick={() => onPick(a)} className="w-full py-3 flex items-center gap-3.5 text-left active:bg-white/5 hover:bg-white/5">
              <ExerciseMedia refId={a.id} body={a.body} size={56} radius={14} />
              <div className="flex-1 min-w-0">
                <p style={{ color: C.text, ...body }} className="font-semibold text-[15px] leading-snug">{a.name}</p>
                <p style={{ color: C.mut2, ...body }} className="text-xs mt-0.5">{(EQUIP[a.equip] || EQUIP.maquina).label}</p>
              </div>
              <ChevronRight size={18} style={{ color: C.mut2 }} />
            </button>
          ))}
          {alts.length === 0 && <p style={{ color: C.mut2, ...body }} className="text-sm text-center py-4">Nenhuma alternativa com esse filtro.</p>}
        </div>
      </div>
    </div>
  );
}

/* Folha para adicionar um exercício ao treino do dia. */
function AddExerciseSheet({ existing, onClose, onPick }) {
  const [group, setGroup] = useState(GROUP_ORDER[0]);
  const have = new Set((existing || []).map((e) => e.refId));
  const list = byGroup(group);
  return (
    <div onClick={onClose} style={{ background: "rgba(0,0,0,.6)" }} className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg2, border: `1px solid ${C.line}` }} className="w-full max-w-[480px] lg:max-w-[560px] rounded-t-[28px] lg:rounded-3xl px-5 pb-5 pt-2.5 max-h-[88vh] overflow-y-auto an-sheet">
        <div style={{ background: C.line }} className="w-10 h-1 rounded-full mx-auto mb-3 lg:hidden" />
        <div className="relative flex items-center justify-center mb-1">
          <h3 style={{ color: C.text, ...display }} className="text-lg font-bold">Adicionar exercício</h3>
          <button onClick={onClose} aria-label="Fechar" style={{ color: C.mut, background: C.card }} className="absolute right-0 w-8 h-8 rounded-full flex items-center justify-center"><X size={17} /></button>
        </div>
        <p style={{ color: C.mut, ...body }} className="text-xs mb-3 text-center">Escolha o grupo e toque para incluir no treino de hoje.</p>

        <div className="flex gap-1.5 mb-3 overflow-x-auto overscroll-x-contain no-scrollbar -mx-5 px-5">
          {GROUP_ORDER.map((g) => <Chip key={g} on={group === g} onClick={() => setGroup(g)}>{GROUP_LABELS[g]}</Chip>)}
        </div>

        <div className="divide-y divide-[#2A313C]">
          {list.map((a) => (
            <button key={a.id} onClick={() => onPick(a)} className="w-full py-3 flex items-center gap-3.5 text-left active:bg-white/5 hover:bg-white/5">
              <ExerciseMedia refId={a.id} body={a.body} size={56} radius={14} />
              <div className="flex-1 min-w-0">
                <p style={{ color: C.text, ...body }} className="font-semibold text-[15px] leading-snug">{a.name}</p>
                <p style={{ color: C.mut2, ...body }} className="text-xs mt-0.5 flex items-center gap-1.5">{(EQUIP[a.equip] || EQUIP.maquina).label}{have.has(a.id) && <span style={{ background: C.mintDim, color: C.mint, ...label }} className="rounded-md px-1.5 py-0.5 text-[10px]">já no treino</span>}</p>
              </div>
              <Plus size={18} style={{ color: C.amber }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== TELA: PLANO ==============================
   Mostra a divisão em ciclo (A → B → C → A…), o próximo dia e permite
   escolher qual treino fazer hoje. Toque num exercício abre o detalhe. */
function dayStats(d) {
  const sets = d.exercises.reduce((a, e) => a + setCountOf(e), 0);
  const secs = d.exercises.reduce((a, e) => a + setCountOf(e) * (40 + (e.rest || 60)), 0);
  const muscles = [];
  d.exercises.forEach((e) => musclesOf(e.body).main.forEach((s) => { if (!muscles.includes(s)) muscles.push(s); }));
  return { sets, minutes: Math.max(10, Math.round(secs / 60 / 5) * 5), muscles };
}

function PlanScreen({ profile, plan, setPlan, session, setSession, buildFromConfig, aiBusy, tracking, goToday }) {
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(false);
  const nextIdx = plan.cycleIndex % plan.days.length;
  const hasProgress = Object.values(session?.sets || {}).some((a) => a?.length);
  const order = plan.days.map((d) => d.id).join(" → ");

  const doToday = (di) => {
    if (di !== nextIdx) {
      if (hasProgress && !window.confirm("Você já marcou séries no treino de hoje. Trocar de treino apaga esse progresso. Continuar?")) return;
      setPlan((p) => ({ ...p, cycleIndex: di }));
      setSession({ sets: {} });
    }
    goToday();
  };

  if (editing) {
    return (
      <PlanBuilder
        profile={profile}
        initialConfig={planToConfig(plan)}
        initialPerWeek={plan.daysPerWeek}
        aiBusy={aiBusy}
        onCancel={() => setEditing(false)}
        onBuild={async (cfg, useAI, opts) => { const ok = await buildFromConfig(cfg, useAI, opts); if (ok) setEditing(false); }}
      />
    );
  }

  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10">
      <ScreenHeader title="Plano" sub={`${plan.days.length} treino${plan.days.length > 1 ? "s" : ""} em ciclo · ${order} → ${plan.days[0]?.id}`}>
        <IconBtn icon={SlidersHorizontal} label="Montar / personalizar" onClick={() => setEditing(true)} />
        <OptionsMenu items={[
          { icon: Pencil, label: "Editar treinos", hint: "Escolher grupos de cada dia", onClick: () => setEditing(true) },
          { icon: Sparkles, label: "Montar com IA", hint: "O coach pergunta suas preferências", onClick: () => setEditing(true) },
          { icon: Play, label: "Ir para o treino de hoje", onClick: goToday },
        ]} />
      </ScreenHeader>

      <SectionLabel className="!mt-2">Personalização</SectionLabel>
      <div className="grid grid-cols-2 gap-3 lg:max-w-xl">
        {[
          { icon: Plus, t: "Montar / personalizar o plano", fn: () => setEditing(true) },
          { icon: Sparkles, t: "Gerar plano com IA", fn: () => setEditing(true) },
        ].map((b) => (
          <button key={b.t} onClick={b.fn} style={{ background: "rgba(32,37,46,.7)", border: "1px solid rgba(255,255,255,.06)" }} className="rounded-3xl p-4 h-[124px] flex flex-col justify-between text-left active:bg-white/5 hover:bg-white/5">
            <span style={{ background: C.card2, color: C.text }} className="w-10 h-10 rounded-full flex items-center justify-center"><b.icon size={18} /></span>
            <span style={{ color: C.text, ...body }} className="text-sm font-medium leading-snug">{b.t}</span>
          </button>
        ))}
      </div>
      <p style={{ color: C.mut2, ...body }} className="text-xs mt-3 leading-relaxed">
        Ao finalizar um treino, o próximo do ciclo vira o de <b style={{ color: C.text }}>Hoje</b>.
        {plan.daysPerWeek ? ` Meta de ${plan.daysPerWeek}×/semana (~${Math.round(plan.daysPerWeek * 4)} treinos/mês).` : ""}{" "}
        {plan.source === "ai" ? "Plano atual feito pela IA." : plan.source === "custom" ? "Plano atual montado por você." : "Plano atual: modelo base."}
      </p>

      <SectionLabel>Seus treinos</SectionLabel>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 items-start">
        {plan.days.map((d, di) => {
          const isNext = di === nextIdx;
          const st = dayStats(d);
          return (
            <div key={d.id} style={{ background: isNext ? `radial-gradient(140% 90% at 100% 0%, rgba(255,138,61,.16) 0%, rgba(32,37,46,.75) 55%)` : "rgba(32,37,46,.6)", border: `1px solid ${isNext ? "rgba(255,138,61,.45)" : "rgba(255,255,255,.06)"}` }} className="rounded-3xl p-4 min-w-0">
              <div className="flex items-start gap-3">
                <span style={{ background: isNext ? CTA_BG : C.card2, color: isNext ? C.bg : C.mut, ...display }} className="rounded-2xl w-11 h-11 shrink-0 flex items-center justify-center font-bold text-lg">{d.id}</span>
                <div className="flex-1 min-w-0">
                  {isNext && <span style={{ color: C.amber, ...label }} className="text-[11px]">Treino de hoje</span>}
                  <h3 style={{ color: C.text, ...display }} className="font-bold leading-tight truncate text-[17px]">{d.name}</h3>
                  <p style={{ color: C.mut, ...body }} className="text-xs mt-0.5">{d.exercises.length} exercícios • {st.sets} séries • ~{st.minutes} min</p>
                </div>
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar mt-3">
                {st.muscles.slice(0, 6).map((s) => (
                  <span key={s} style={{ background: C.bg2, color: C.mut, ...body }} className="shrink-0 rounded-full pl-0.5 pr-2.5 py-0.5 text-[11px] font-medium flex items-center gap-1">
                    <span className="rounded-full overflow-hidden"><MuscleThumb slug={s} size={20} /></span>{MUSCLE_NAMES[s]}
                  </span>
                ))}
              </div>

              <div className="mt-2 divide-y divide-[#2A313C]">
                {d.exercises.map((e, i) => (
                  <button key={i} onClick={() => setDetail(e)} className="w-full min-w-0 flex items-center gap-3 text-left py-2 active:bg-white/5 hover:bg-white/5">
                    <ExerciseMedia refId={e.refId} body={e.body} size={44} radius={12} badge={false} />
                    <span className="flex-1 min-w-0">
                      <span style={{ color: C.text, ...body }} className="block text-sm font-medium truncate">{e.name}</span>
                      <span style={{ color: C.mut2, ...body }} className="block text-xs">{isCardio(e) ? e.reps : `${e.sets} séries • ${e.reps} reps`}</span>
                    </span>
                    <ChevronRight size={16} style={{ color: C.mut2 }} className="shrink-0" />
                  </button>
                ))}
              </div>

              <button onClick={() => doToday(di)}
                style={{ background: isNext ? CTA_BG : C.card2, color: isNext ? C.bg : C.text, ...label }}
                className="w-full rounded-full py-3 mt-3 text-[15px] flex items-center justify-center gap-2">
                <Play size={16} /> {isNext ? "Ir para o treino" : "Fazer este hoje"}
              </button>
            </div>
          );
        })}
      </div>

      {detail && <ExerciseDetail item={detail} prevLoads={tracking?.lastLoads} onClose={() => setDetail(null)} onOpenItem={(li) => setDetail(li)} />}
    </div>
  );
}

/* ====================== CONSTRUTOR DE PLANO ====================== */
const FOCUS_OPTS = [
  { v: "", l: "Equilibrado" },
  { v: "abdômen / core", l: "Abdômen" },
  { v: "glúteos", l: "Glúteos" },
  { v: "pernas", l: "Pernas" },
  { v: "braços (bíceps e tríceps)", l: "Braços" },
  { v: "peito", l: "Peito" },
  { v: "costas", l: "Costas" },
  { v: "ombros", l: "Ombros" },
];

function PlanBuilder({ profile, initialConfig, initialPerWeek, aiBusy, onCancel, onBuild }) {
  const [days, setDays] = useState(() => {
    const base = (initialConfig && initialConfig.length ? initialConfig : [{ name: "", groups: [] }]);
    return base.map((d) => ({ name: d.name || "", groups: [...(d.groups || [])] }));
  });
  const [perWeek, setPerWeek] = useState(initialPerWeek || 3);
  // Fluxo "Montar com IA": antes de gerar, o coach pergunta as preferências.
  const [aiOpen, setAiOpen] = useState(false);
  const [focus, setFocus] = useState("");
  const [focusText, setFocusText] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [note, setNote] = useState("");

  const toggleGroup = (di, g) => setDays((ds) => ds.map((d, i) => i !== di ? d : ({ ...d, groups: d.groups.includes(g) ? d.groups.filter((x) => x !== g) : [...d.groups, g] })));
  const setName = (di, v) => setDays((ds) => ds.map((d, i) => i !== di ? d : ({ ...d, name: v })));
  const addDay = () => setDays((ds) => [...ds, { name: "", groups: [] }]);
  const removeDay = (di) => setDays((ds) => ds.length <= 1 ? ds : ds.filter((_, i) => i !== di));

  const totalGroups = days.reduce((n, d) => n + d.groups.length, 0);
  const valid = days.some((d) => d.groups.length > 0);
  const nTreinos = days.filter((d) => d.groups.length > 0).length;
  const cycleWeeks = Math.max(1, Math.ceil(nTreinos / Math.max(1, perWeek)));

  const buildBase = () => onBuild(days, false, { daysPerWeek: perWeek });
  const buildAI = () => onBuild(days, true, {
    daysPerWeek: perWeek,
    focus: (focusText.trim() || focus || "").trim(),
    minutes,
    note: note.trim(),
  });

  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10">
      <ScreenHeader title="Montar plano" sub="Escolha os grupos de cada treino">
        <IconBtn icon={X} label="Cancelar" onClick={onCancel} />
      </ScreenHeader>

      {/* Como funciona + frequência semanal (deixa claro dia / semana / mês) */}
      <div style={{ background: `radial-gradient(120% 140% at 0% 0%, rgba(140,123,255,.15) 0%, ${C.card} 50%)`, border: `1px solid ${C.line}` }} className="rounded-3xl p-4 mt-3">
        <p style={{ color: C.text, ...body }} className="text-sm leading-relaxed">
          Cada cartão abaixo é <b style={{ color: C.indigo }}>um treino</b> (um dia na academia) — pode ter um grupo só (ex.: <b style={{ color: C.text }}>só perna</b>) ou vários. Os treinos entram em <b style={{ color: C.text }}>ciclo</b> (A → B → C → A…): ao terminar um, o próximo vira o de <b style={{ color: C.text }}>Hoje</b>.
        </p>
        <div className="mt-3">
          <p style={{ color: C.mut, ...body }} className="text-xs font-semibold mb-1.5">Quantos dias por semana você pretende treinar?</p>
          <div className="flex gap-1.5 flex-wrap">
            {[2, 3, 4, 5, 6].map((n) => {
              const on = perWeek === n;
              return <button key={n} onClick={() => setPerWeek(n)} style={{ background: on ? C.indigo : C.bg2, color: on ? "#fff" : C.mut, border: `1px solid ${on ? C.indigo : C.line}`, ...body }} className="rounded-lg px-3.5 py-1.5 text-xs font-semibold">{n}× / semana</button>;
            })}
          </div>
        </div>
        {nTreinos > 0 && (
          <p style={{ color: C.mut2, ...body }} className="text-xs mt-3 leading-snug">
            Você montou <b style={{ color: C.text }}>{nTreinos} treino{nTreinos > 1 ? "s" : ""}</b> no ciclo. Treinando <b style={{ color: C.text }}>{perWeek}×/semana</b>, o ciclo inteiro se repete a cada {cycleWeeks === 1 ? "~1 semana" : `~${cycleWeeks} semanas`} — cerca de {Math.round(perWeek * 4)} treinos por mês.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 items-start mt-4">
        {days.map((d, di) => (
          <div key={di} style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-3xl p-4 min-w-0">
            <div className="flex items-center gap-3">
              <span style={{ background: C.bg2, color: C.mut, ...display }} className="rounded-xl w-9 h-9 shrink-0 flex items-center justify-center font-bold">{dayLetter(di)}</span>
              <input
                value={d.name}
                onChange={(e) => setName(di, e.target.value)}
                placeholder={autoDayName(d.groups) || "Nome do dia (opcional)"}
                style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, ...body }}
                className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm outline-none" />
              {days.length > 1 && (
                <button onClick={() => removeDay(di)} aria-label="Remover dia" style={{ color: C.mut2 }} className="shrink-0 p-2 rounded-lg active:bg-white/5 hover:bg-white/5"><Trash2 size={16} /></button>
              )}
            </div>

            <div className="flex gap-1.5 flex-wrap mt-3">
              {GROUP_ORDER.map((g) => {
                const on = d.groups.includes(g);
                return (
                  <button key={g} onClick={() => toggleGroup(di, g)}
                    style={{ background: on ? C.amber : C.bg2, color: on ? C.bg : C.mut, border: `1px solid ${on ? C.amber : C.line}`, ...body }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold">
                    {GROUP_LABELS[g]}
                  </button>
                );
              })}
            </div>

            <p style={{ color: C.mut2, ...body }} className="text-xs mt-3">
              {d.groups.length ? `${d.groups.length} grupo${d.groups.length > 1 ? "s" : ""} selecionado${d.groups.length > 1 ? "s" : ""}` : "Toque nos grupos que quer treinar neste dia."}
            </p>
          </div>
        ))}

        <button onClick={addDay} style={{ border: `1px dashed ${C.line}`, color: C.mut, ...display }} className="rounded-3xl p-4 min-w-0 flex items-center justify-center gap-2 font-bold text-sm min-h-[88px] active:bg-white/5 hover:bg-white/5">
          <Plus size={18} /> Adicionar dia
        </button>
      </div>

      {/* Preferências para a IA (aparece ao escolher "Montar com IA") */}
      {aiOpen && (
        <div style={{ background: C.card, border: `1px solid ${C.indigo}` }} className="rounded-3xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-1">
            <div style={{ background: C.indigo }} className="rounded-lg w-7 h-7 flex items-center justify-center shrink-0"><Sparkles size={15} color="#fff" /></div>
            <p style={{ color: C.text, ...display }} className="font-bold">Antes de montar, me conta:</p>
          </div>
          <p style={{ color: C.mut2, ...body }} className="text-xs mb-3">O coach usa isso para montar um plano sob medida — não aleatório.</p>

          <p style={{ color: C.mut, ...body }} className="text-xs font-semibold mb-1.5">Tem alguma preferência de foco?</p>
          <div className="flex gap-1.5 flex-wrap">
            {FOCUS_OPTS.map((o) => {
              const on = focus === o.v;
              return <button key={o.l} onClick={() => { setFocus(o.v); setFocusText(""); }} style={{ background: on ? C.indigo : C.bg2, color: on ? "#fff" : C.mut, border: `1px solid ${on ? C.indigo : C.line}`, ...body }} className="rounded-lg px-3 py-1.5 text-xs font-semibold">{o.l}</button>;
            })}
          </div>
          <input value={focusText} onChange={(e) => { setFocusText(e.target.value); if (e.target.value) setFocus(""); }} placeholder="ou escreva: ex. quero priorizar glúteo e abdômen"
            style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, ...body }} className="w-full rounded-xl px-3 py-2 text-sm outline-none mt-2" />

          <p style={{ color: C.mut, ...body }} className="text-xs font-semibold mb-1.5 mt-4">Quanto tempo por treino?</p>
          <div className="flex gap-1.5 flex-wrap">
            {[30, 45, 60, 75].map((m) => {
              const on = minutes === m;
              return <button key={m} onClick={() => setMinutes(m)} style={{ background: on ? C.indigo : C.bg2, color: on ? "#fff" : C.mut, border: `1px solid ${on ? C.indigo : C.line}`, ...body }} className="rounded-lg px-3 py-1.5 text-xs font-semibold">{m >= 75 ? "75+ min" : `${m} min`}</button>;
            })}
          </div>

          <p style={{ color: C.mut, ...body }} className="text-xs font-semibold mb-1.5 mt-4">Algum objetivo específico para este plano? (opcional)</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="ex.: competição em 3 meses, voltar a treinar devagar, melhorar resistência..."
            style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, ...body }} className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none" />

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button onClick={() => setAiOpen(false)} style={{ background: C.bg2, color: C.mut, border: `1px solid ${C.line}`, ...body }} className="sm:flex-none rounded-2xl px-4 py-3 font-semibold text-sm">Voltar</button>
            <button onClick={buildAI} disabled={!valid || aiBusy} style={{ background: valid && !aiBusy ? C.indigo : C.card, color: valid && !aiBusy ? "#fff" : C.mut2, ...display }} className="flex-1 rounded-2xl py-3 font-bold text-base flex items-center justify-center gap-2">
              {aiBusy ? <Loader2 size={18} className="an-spin" /> : <Sparkles size={18} />} {aiBusy ? "Gerando…" : "Gerar plano com IA"}
            </button>
          </div>
        </div>
      )}

      {!aiOpen && (
        <>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <button onClick={buildBase} disabled={!valid || aiBusy}
              style={{ background: valid && !aiBusy ? C.amber : C.card, color: valid && !aiBusy ? C.bg : C.mut2, ...display }}
              className="flex-1 rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2">
              <Dumbbell size={18} /> Montar sem IA
            </button>
            <button onClick={() => setAiOpen(true)} disabled={!valid || aiBusy}
              style={{ background: valid ? C.indigo : C.card, color: valid ? "#fff" : C.mut2, ...display }}
              className="flex-1 rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2">
              <Sparkles size={18} /> Montar com IA
            </button>
          </div>
          <p style={{ color: C.mut2, ...body }} className="text-xs mt-3 leading-snug">
            <b style={{ color: C.mut }}>Sem IA</b>: o app escolhe os exercícios dos grupos marcados, respeitando sua preferência de equipamento e objetivo. <b style={{ color: C.mut }}>Com IA</b>: o coach pergunta suas preferências (foco, tempo, objetivo) e monta sob medida.
            {totalGroups === 0 ? " Escolha ao menos um grupo para liberar os botões." : ""}
          </p>
        </>
      )}
    </div>
  );
}

/* ============================== TELA: EVOLUÇÃO ============================== */
function ProgressScreen({ profile, tracking, addWeight }) {
  const [val, setVal] = useState("");
  const data = [...tracking.weightLog].sort((a, b) => a.date.localeCompare(b.date)).map((w) => ({ label: w.date.slice(5), peso: w.weight }));
  const first = tracking.weightLog[0]?.weight;
  const last = tracking.weightLog[tracking.weightLog.length - 1]?.weight;
  const diff = first != null && last != null ? +(last - first).toFixed(1) : 0;
  const goalW = profile.goalWeight;
  // Carga/volume levantado por treino (peso × reps das séries concluídas).
  const vol = (tracking.history || []).filter((h) => h.volume > 0).map((h) => ({ label: h.date.slice(5), volume: Math.round(h.volume) }));
  const lastVol = vol.length ? vol[vol.length - 1].volume : 0;
  const bestVol = vol.reduce((m, v) => Math.max(m, v.volume), 0);
  const totalVol = vol.reduce((a, v) => a + v.volume, 0);
  const submit = () => { const n = parseFloat(String(val).replace(",", ".")); if (!n || n < 25 || n > 350) return; addWeight(n); setVal(""); };
  const weightRef = useRef(null);
  // Semana atual (domingo → sábado) com os treinos feitos em cada dia.
  const now = new Date();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - now.getDay() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const items = (tracking.history || []).filter((h) => h.date === key);
    const mins = items.reduce((a, h) => a + (h.minutes || 0), 0);
    return { key, day: d.getDate(), dow: ["Do", "Se", "Te", "Qu", "Qu", "Se", "Sá"][i], done: items.length > 0, mins, isToday: key === today() };
  });
  const weekCount = week.filter((w) => w.done).length;
  const weekMins = week.reduce((a, w) => a + w.mins, 0);
  const fmtMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}min` : `${m}min`;
  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10">
      <ScreenHeader title="Evolução" sub={`${week[0].day}/${String(new Date(week[0].key + "T00:00").getMonth() + 1).padStart(2, "0")} – ${week[6].day}/${String(new Date(week[6].key + "T00:00").getMonth() + 1).padStart(2, "0")}`}>
        <IconBtn icon={Scale} label="Registrar peso" onClick={() => { weightRef.current?.focus(); weightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }} />
      </ScreenHeader>

      {/* Semana: anel em volta dos dias treinados */}
      <div className="grid grid-cols-7 gap-1 lg:max-w-2xl">
        {week.map((w) => (
          <div key={w.key} className="flex flex-col items-center gap-1.5">
            <span style={{ color: C.mut2, ...label }} className="text-[11px]">{w.dow}</span>
            <span style={{ color: w.done ? C.text : C.mut, border: `2px solid ${w.done ? C.amber : w.isToday ? C.line : "rgba(255,255,255,.06)"}`, background: w.isToday ? C.card2 : "transparent", boxShadow: w.done ? "0 0 14px rgba(255,138,61,.25)" : "none", ...display }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">{w.day}</span>
            <span style={{ color: C.mut2, ...body }} className="text-[10px] h-3 leading-3">{w.mins ? fmtMin(w.mins) : ""}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 lg:max-w-2xl">
        {[
          { v: tracking.history.length, t: "Total de treinos", icon: Dumbbell, c: C.amber },
          { v: weekCount, t: "Treinos nesta semana", icon: Flame, c: C.amber },
          { v: last != null ? `${last}kg` : "—", t: "Peso atual", icon: Scale, c: C.mint },
          { v: `${diff > 0 ? "+" : ""}${diff}kg`, t: "Variação de peso", icon: LineIcon, c: diff <= 0 ? C.mint : C.amber },
        ].map((s) => (
          <div key={s.t} style={{ background: "rgba(32,37,46,.7)", border: "1px solid rgba(255,255,255,.06)" }} className="rounded-3xl p-4 relative">
            <span style={{ background: C.bg2, color: s.c }} className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"><s.icon size={16} /></span>
            <p style={{ color: C.text, ...display }} className="text-2xl font-bold leading-none mt-1">{s.v}</p>
            <p style={{ color: C.mut, ...body }} className="text-xs mt-2">{s.t}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Progresso semanal</SectionLabel>
      <div style={{ background: "rgba(32,37,46,.7)", border: "1px solid rgba(255,255,255,.06)" }} className="rounded-3xl p-4 flex gap-8 mb-3 lg:max-w-2xl">
        <div><p style={{ color: C.text, ...display }} className="text-2xl font-bold leading-none">{weekMins ? fmtMin(weekMins) : "—"}</p><p style={{ color: C.mut2, ...body }} className="text-xs mt-1.5">Total esta semana</p></div>
        <div><p style={{ color: C.text, ...display }} className="text-2xl font-bold leading-none">{weekCount ? fmtMin(Math.round(weekMins / weekCount)) : "—"}</p><p style={{ color: C.mut2, ...body }} className="text-xs mt-1.5">Média por treino</p></div>
      </div>

      <SectionLabel>Peso corporal</SectionLabel>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1fr)_2fr] items-start">
      <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-4">
        <p style={{ color: C.text, ...body }} className="text-sm font-semibold mb-2 flex items-center gap-1"><Scale size={16} style={{ color: C.amber }} /> Registrar peso de hoje</p>
        <div className="flex gap-2">
          <input ref={weightRef} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} inputMode="decimal" placeholder="ex.: 82.5" style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, ...body }} className="flex-1 min-w-0 rounded-full px-4 py-2.5 outline-none" />
          <button onClick={submit} style={{ background: CTA_BG, color: C.bg, ...label }} className="rounded-full px-5 text-[15px] flex items-center gap-1"><Plus size={18} /> Salvar</button>
        </div>
        <p style={{ color: C.mut2, ...body }} className="text-xs mt-2">Diário, semanal ou mensal — o gráfico monta sozinho. Medidas corporais merecem acompanhamento à parte (a cada 2–4 semanas).</p>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-4">
        <p style={{ color: C.mut, ...body }} className="text-xs font-semibold uppercase tracking-wide mb-2">Peso ao longo do tempo</p>
        {data.length >= 1 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.mut2, fontSize: 11 }} stroke={C.line} />
              <YAxis tick={{ fill: C.mut2, fontSize: 11 }} stroke={C.line} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip contentStyle={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 12, color: C.text }} labelStyle={{ color: C.mut }} />
              {goalW ? <ReferenceLine y={goalW} stroke={C.mint} strokeDasharray="5 4" label={{ value: `meta ${goalW}kg`, fill: C.mint, fontSize: 10, position: "insideTopRight" }} /> : null}
              <Line type="monotone" dataKey="peso" stroke={C.amber} strokeWidth={3} dot={{ fill: C.amber, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p style={{ color: C.mut2, ...body }} className="text-sm py-8 text-center">Registre seu peso para ver o gráfico.</p>}
      </div>
      </div>

      {/* Carga de treino (quanto peso a pessoa está levantando) */}
      <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 mt-3">
        <p style={{ color: C.text, ...body }} className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Dumbbell size={16} style={{ color: C.mint }} /> Carga nos treinos</p>
        <p style={{ color: C.mut2, ...body }} className="text-xs mb-3">Volume = soma de peso × repetições das séries concluídas em cada treino.</p>
        <div className="grid grid-cols-3 gap-2 mb-3 lg:max-w-2xl">
          <Stat label="Último treino" value={lastVol ? `${lastVol.toLocaleString("pt-BR")}kg` : "—"} color={C.text} />
          <Stat label="Recorde" value={bestVol ? `${bestVol.toLocaleString("pt-BR")}kg` : "—"} color={C.mint} />
          <Stat label="Total acumulado" value={totalVol ? `${totalVol.toLocaleString("pt-BR")}kg` : "—"} color={C.amber} />
        </div>
        {vol.length >= 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vol} margin={{ top: 6, right: 6, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={C.line} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.mut2, fontSize: 11 }} stroke={C.line} />
              <YAxis tick={{ fill: C.mut2, fontSize: 11 }} stroke={C.line} width={48} />
              <Tooltip cursor={{ fill: "rgba(255,255,255,.04)" }} contentStyle={{ background: C.bg2, border: `1px solid ${C.line}`, borderRadius: 12, color: C.text }} labelStyle={{ color: C.mut }} formatter={(v) => [`${Number(v).toLocaleString("pt-BR")} kg`, "Volume"]} />
              <Bar dataKey="volume" fill={C.mint} radius={[6, 6, 0, 0]} maxBarSize={46} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ color: C.mut2, ...body }} className="text-sm py-8 text-center">Finalize um treino registrando os pesos para acompanhar sua carga aqui.</p>}
      </div>
    </div>
  );
}
function Stat({ label, value, color }) {
  return <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-3 text-center"><p style={{ color, ...display }} className="text-lg font-bold leading-none">{value}</p><p style={{ color: C.mut2, ...body }} className="text-[10px] mt-1 leading-tight">{label}</p></div>;
}

/* ============================== TELA: COACH ============================== */
function CoachScreen({ profile, plan, chat, setChat, onApplyPlan }) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, busy]);
  const send = async (preset) => {
    const text = (preset || input).trim();
    if (!text || busy) return;
    const next = [...chat, { role: "user", content: text }];
    setChat(next); setInput(""); setBusy(true);
    try {
      const planSummary = (plan?.days || []).map((d) => `${d.id} "${d.name}": ${d.exercises.map((e) => e.refId).join(", ")}`).join(" | ") || "nenhum";
      const ctx = `Contexto: objetivo=${profile.goal}, nível=${profile.level}, peso=${profile.weight}kg, meta=${profile.goalWeight}kg, altura=${profile.height}cm, limitações="${profile.limits || "nenhuma"}". Treino atual (id, nome, exercícios): ${planSummary}.`;
      // Envia só o texto puro ao modelo (sem blocos <plano> antigos nem botões).
      const msgs = next.map((m) => ({ role: m.role, content: m.content }));
      msgs[msgs.length - 1] = { role: "user", content: `${ctx}\n\nPergunta: ${text}` };
      const reply = await callClaude(msgs, COACH_CHAT_SYSTEM);
      const { clean, config } = extractPlanBlock(reply || "");
      setChat([...next, { role: "assistant", content: clean || "Desculpe, não consegui responder agora.", plan: config }]);
    } catch { setChat([...next, { role: "assistant", content: "Não consegui me conectar agora. Tente novamente." }]); }
    finally { setBusy(false); }
  };
  const presets = ["Monte um treino de 40 min focado em abdômen", "Como melhorar minha técnica no agachamento?", "Estou com dor no ombro, troca meu treino de hoje"];
  return (
    <div className="pb-[calc(10rem+env(safe-area-inset-bottom))] lg:pb-24 flex flex-col lg:max-w-3xl" style={{ minHeight: "70vh" }}>
      <ScreenHeader title="Coach" sub="Treino, técnica e alimentação">
        <OptionsMenu items={[
          { icon: RotateCcw, label: "Nova conversa", onClick: () => setChat([]) },
        ]} />
      </ScreenHeader>
      <div className="flex-1 space-y-3">
        {chat.length === 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-4">
            <p style={{ color: C.text, ...body }} className="text-sm leading-relaxed">Olá! Sou seu coach. Posso ajudar com execução de exercícios, ajustes no treino e alimentação geral.</p>
            <div className="mt-3 divide-y divide-[#2A313C]">{presets.map((p) => <button key={p} onClick={() => send(p)} style={{ color: C.text, ...body }} className="w-full text-left py-3 text-sm flex items-center gap-3 active:bg-white/5 hover:bg-white/5"><Sparkles size={15} style={{ color: C.amber }} className="shrink-0" /><span className="flex-1">{p}</span><ChevronRight size={16} style={{ color: C.mut2 }} /></button>)}</div>
          </div>
        )}
        {chat.map((m, i) => {
          const nDays = m.plan?.days?.length || 0;
          const nEx = (m.plan?.days || []).reduce((a, d) => a + (d.exercises?.length || 0), 0);
          return (
            <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div style={{ background: m.role === "user" ? C.amber : C.card, color: m.role === "user" ? C.bg : C.text, border: m.role === "user" ? "none" : `1px solid ${C.line}`, ...body }} className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap">{m.content}</div>
              {m.plan && nDays > 0 && (
                <div style={{ background: C.card2, border: `1px solid ${C.indigo}` }} className="rounded-2xl p-3 mt-2 max-w-[85%] w-full">
                  <p style={{ color: C.text, ...body }} className="text-xs font-semibold flex items-center gap-1.5"><Wand2 size={14} style={{ color: C.indigo }} /> O coach sugeriu um treino</p>
                  <p style={{ color: C.mut2, ...body }} className="text-[11px] mt-0.5">{nDays} treino{nDays > 1 ? "s" : ""} · {nEx} exercício{nEx > 1 ? "s" : ""}</p>
                  <button onClick={() => onApplyPlan(m.plan)} style={{ background: C.indigo, color: "#fff", ...display }} className="w-full rounded-xl py-2 mt-2 text-sm font-bold flex items-center justify-center gap-1.5"><Check size={15} /> Aplicar ao meu treino</button>
                </div>
              )}
            </div>
          );
        })}
        {busy && <div className="flex justify-start"><div style={{ background: C.card, border: `1px solid ${C.line}`, color: C.mut }} className="rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2"><Loader2 size={14} className="an-spin" /> digitando...</div></div>}
        <div ref={endRef} />
      </div>
      <div style={{ background: `linear-gradient(0deg, ${C.bg} 70%, transparent)` }} className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] lg:bottom-0 left-0 lg:left-64 right-0 px-4 lg:px-8 pb-2 lg:pb-5 pt-4 z-30">
        <div style={GLASS} className="mx-auto lg:mx-0 max-w-[480px] md:max-w-[720px] lg:max-w-3xl flex items-center gap-2 rounded-full p-1.5 pl-4">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escreva sua dúvida..." style={{ color: C.text, ...body }} className="flex-1 min-w-0 bg-transparent py-2 outline-none text-sm" />
          <button onClick={() => send()} disabled={busy} aria-label="Enviar" style={{ background: CTA_BG }} className="rounded-full w-10 h-10 shrink-0 flex items-center justify-center"><Send size={17} color={C.bg} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================== ONBOARDING ============================== */
function SetupSeg({ field, options, p, set }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => { const on = p[field] === o.v; return <button key={o.v} onClick={() => set(field, o.v)} style={{ background: on ? "rgba(255,138,61,.14)" : C.card, color: on ? C.amber : C.mut, border: `1px solid ${on ? "rgba(255,138,61,.5)" : C.line}`, ...body }} className="rounded-full py-2.5 text-xs font-semibold">{o.l}</button>; })}
    </div>
  );
}
function SetupField({ label, k, ph, unit, p, set }) {
  return (
    <div>
      <label style={{ color: C.mut, ...body }} className="text-xs font-semibold">{label}</label>
      <div className="flex items-center mt-1" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12 }}>
        <input value={p[k]} onChange={(e) => set(k, e.target.value)} placeholder={ph} inputMode={k === "name" ? "text" : "decimal"} style={{ color: C.text, ...body }} className="flex-1 bg-transparent px-3 py-2.5 outline-none text-sm" />
        {unit && <span style={{ color: C.mut2, ...body }} className="text-xs pr-3">{unit}</span>}
      </div>
    </div>
  );
}
function SetupDateField({ label, k, p, set }) {
  const age = ageFromBirthdate(p[k]);
  return (
    <div>
      <label style={{ color: C.mut, ...body }} className="text-xs font-semibold">{label}</label>
      <div className="flex items-center mt-1" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12 }}>
        <input type="date" value={p[k] || ""} onChange={(e) => set(k, e.target.value)} max={today()} min="1920-01-01"
          style={{ color: C.text, colorScheme: "dark", ...body }} className="flex-1 bg-transparent px-3 py-2.5 outline-none text-sm" />
        {age > 0 && <span style={{ color: C.amberSoft, ...body }} className="text-xs font-semibold pr-3 whitespace-nowrap">{age} anos</span>}
      </div>
    </div>
  );
}
function Setup({ onDone, initial, embedded = false }) {
  const [p, setP] = useState(() => {
    const base = initial || { name: "", sex: "masc", age: "", height: "", weight: "", goalWeight: "", bodyNow: "magro", bodyGoal: "definido", level: "iniciante", goal: "hipertrofia", equip: "ambos", limits: "" };
    // Quem já tinha só idade cadastrada ganha uma data base estimada e editável.
    return { ...base, birthdate: base.birthdate || birthdateFromAge(base.age) };
  });
  const set = (k, v) => setP((s) => ({ ...s, [k]: v }));
  const valid = p.name && p.height && p.weight;
  const submit = () => {
    const age = ageFromBirthdate(p.birthdate) || +p.age || 0;
    onDone({ ...p, birthdate: p.birthdate || birthdateFromAge(age), age, height: +p.height || 0, weight: +p.weight || 0, goalWeight: +p.goalWeight || 0, progression: p.progression || DEFAULT_PROGRESSION });
  };
  return (
    <div style={embedded ? { paddingBottom: "calc(env(safe-area-inset-bottom) + 7rem)" } : { background: `radial-gradient(90% 50% at 50% -8%, rgba(255,138,61,.12) 0%, rgba(19,22,27,0) 70%), ${C.bg}`, minHeight: "100vh", paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }} className={embedded ? "" : "px-4"}>
      <div className={embedded ? "lg:max-w-xl" : "mx-auto max-w-[480px] md:max-w-[560px]"}>
        {!embedded && <div className="flex items-center gap-2 mb-1"><Dumbbell size={26} color={C.amber} className="-rotate-45" /><h1 style={{ color: C.text, ...display }} className="text-2xl font-bold">TreinoCerto</h1></div>}
        {!embedded && <p style={{ color: C.mut, ...body }} className="text-sm mb-5">Vamos montar seu plano. Leva 1 minuto.</p>}
        <div className="space-y-4">
          <SetupField p={p} set={set} label="Como te chamamos?" k="name" ph="seu nome" />
          <SetupDateField p={p} set={set} label="Data de nascimento" k="birthdate" />
          <div className="grid grid-cols-2 gap-2">
            <SetupField p={p} set={set} label="Altura" k="height" ph="175" unit="cm" />
            <SetupField p={p} set={set} label="Peso" k="weight" ph="80" unit="kg" />
          </div>
          <div><label style={{ color: C.mut, ...body }} className="text-xs font-semibold">Sexo</label><div className="mt-1"><SetupSeg p={p} set={set} field="sex" options={[{ v: "masc", l: "Masculino" }, { v: "fem", l: "Feminino" }, { v: "outro", l: "Outro" }]} /></div></div>
          <div><label style={{ color: C.mut, ...body }} className="text-xs font-semibold">Seu objetivo</label><div className="mt-1"><SetupSeg p={p} set={set} field="goal" options={[{ v: "emagrecer", l: "Emagrecer" }, { v: "hipertrofia", l: "Ganhar massa" }, { v: "forca", l: "Força" }, { v: "saude", l: "Saúde" }]} /></div></div>
          <SetupField p={p} set={set} label="Peso que você quer alcançar" k="goalWeight" ph="75" unit="kg" />
          <div><label style={{ color: C.mut, ...body }} className="text-xs font-semibold">Como está seu corpo hoje?</label><div className="mt-1"><SetupSeg p={p} set={set} field="bodyNow" options={[{ v: "magro", l: "Magro" }, { v: "medio", l: "Médio" }, { v: "acima", l: "Acima do peso" }]} /></div></div>
          <div><label style={{ color: C.mut, ...body }} className="text-xs font-semibold">Onde quer chegar?</label><div className="mt-1"><SetupSeg p={p} set={set} field="bodyGoal" options={[{ v: "definido", l: "Definido" }, { v: "musculoso", l: "Musculoso" }, { v: "magro", l: "Mais magro" }]} /></div></div>
          <div><label style={{ color: C.mut, ...body }} className="text-xs font-semibold">Seu nível</label><div className="mt-1"><SetupSeg p={p} set={set} field="level" options={[{ v: "iniciante", l: "Iniciante" }, { v: "intermediario", l: "Intermediário" }, { v: "avancado", l: "Avançado" }]} /></div></div>
          <div><label style={{ color: C.mut, ...body }} className="text-xs font-semibold">Prefere treinar com</label><div className="mt-1"><SetupSeg p={p} set={set} field="equip" options={[{ v: "maquina", l: "Máquinas" }, { v: "livre", l: "Peso livre" }, { v: "ambos", l: "Tanto faz" }]} /></div></div>
          <div><label style={{ color: C.mut, ...body }} className="text-xs font-semibold">Alguma limitação? (opcional)</label><textarea value={p.limits} onChange={(e) => set("limits", e.target.value)} rows={2} placeholder="ex.: dor no joelho, ombro, hérnia..." style={{ background: C.card, color: C.text, border: `1px solid ${C.line}`, ...body }} className="w-full rounded-xl px-3 py-2.5 mt-1 outline-none text-sm resize-none" /></div>
          <button onClick={submit} disabled={!valid} style={{ background: valid ? CTA_BG : C.card, color: valid ? C.bg : C.mut2, boxShadow: valid ? "0 12px 34px rgba(255,138,61,.3)" : "none", ...label }} className="w-full rounded-full py-4 text-[17px] mt-2">{embedded ? "Salvar e refazer plano" : "Montar meu plano"}</button>
          <p style={{ color: C.mut2, ...body }} className="text-xs leading-relaxed text-center px-2">Ferramenta de orientação — não substitui educador físico ou médico. Faça avaliação profissional, principalmente com limitações ou condições de saúde.</p>
        </div>
      </div>
    </div>
  );
}

/* ============================== MODAL DE PESO PÓS-TREINO ============================== */
function WeighInModal({ nextDay, onSave, onSkip }) {
  const [val, setVal] = useState("");
  const save = () => { const n = parseFloat(String(val).replace(",", ".")); onSave(n && n >= 25 && n <= 350 ? n : null); };
  return (
    <div style={{ background: "rgba(0,0,0,.65)" }} className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div style={{ background: C.bg2, border: `1px solid ${C.line}`, maxWidth: 380 }} className="w-full rounded-3xl p-6 text-center">
        <div style={{ background: C.mintDim }} className="rounded-full w-14 h-14 mx-auto flex items-center justify-center mb-3"><Trophy size={26} style={{ color: C.mint }} /></div>
        <h3 style={{ color: C.text, ...display }} className="text-xl font-bold">Treino concluído!</h3>
        <p style={{ color: C.mut, ...body }} className="text-sm mt-1 mb-4">Registre seu peso de hoje para acompanhar a evolução (opcional).</p>
        <div className="flex items-center gap-2 mb-4" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: "4px 4px 4px 14px" }}>
          <Scale size={18} style={{ color: C.amber }} />
          <input value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" autoFocus placeholder="seu peso" style={{ color: C.text, ...body }} className="flex-1 bg-transparent py-2.5 outline-none text-base" />
          <span style={{ color: C.mut2, ...body }} className="text-sm pr-2">kg</span>
        </div>
        <button onClick={save} style={{ background: C.mint, color: C.bg, ...display }} className="w-full rounded-2xl py-3 font-bold mb-2">Salvar e continuar</button>
        <button onClick={onSkip} style={{ color: C.mut, ...body }} className="w-full py-2 text-sm font-semibold">Agora não</button>
        {nextDay && <p style={{ color: C.mut2, ...body }} className="text-xs mt-3">Próximo: Treino {nextDay.id} — {nextDay.name}</p>}
      </div>
    </div>
  );
}

/* ============================== TELA: EXERCÍCIOS ==============================
   Navega o catálogo completo (1.324, MIT — nomes em inglês do dataset) por
   músculo ou equipamento, com busca. A aba "Do app" mostra os 38 exercícios da
   biblioteca do TreinoCerto (com passo a passo em português).
   O catálogo é carregado sob demanda (import dinâmico) para não pesar o app. */
const TARGET_INFO = {
  pectorals: ["Peitoral", "chest"], delts: ["Ombros", "deltoids"], lats: ["Dorsais", "upperBack"],
  "upper back": ["Costas (parte alta)", "upperBack"], traps: ["Trapézio", "trapezius"], spine: ["Lombar", "lowerBack"],
  biceps: ["Bíceps", "biceps"], triceps: ["Tríceps", "triceps"], forearms: ["Antebraço", "forearm"],
  abs: ["Abdômen", "abs"], "serratus anterior": ["Serrátil", "obliques"], quads: ["Quadríceps", "quadriceps"],
  hamstrings: ["Posteriores", "hamstring"], glutes: ["Glúteos", "gluteal"], adductors: ["Adutores", "adductors"],
  abductors: ["Abdutores", "gluteal"], calves: ["Panturrilhas", "calves"], "levator scapulae": ["Elevador da escápula", "trapezius"],
  "cardiovascular system": ["Cardio", null],
};
const TARGET_ORDER = Object.keys(TARGET_INFO);
const EQUIP_SECTIONS = [
  ["Pesos livres", { dumbbell: "Halteres", barbell: "Barra", "ez barbell": "Barra W", "olympic barbell": "Barra olímpica", "trap bar": "Barra hexagonal", kettlebell: "Kettlebell", weighted: "Anilha / com peso", "medicine ball": "Medicine ball" }],
  ["Máquinas e polias", { cable: "Polia / cabo", "leverage machine": "Máquina articulada", "smith machine": "Smith", "sled machine": "Leg press / trenó", assisted: "Máquina assistida", "stationary bike": "Bicicleta ergométrica", "elliptical machine": "Elíptico", "stepmill machine": "Escada (stepmill)", "skierg machine": "SkiErg", "upper body ergometer": "Ergômetro de braço" }],
  ["Peso do corpo e acessórios", { "body weight": "Peso do corpo", band: "Elástico", "resistance band": "Faixa elástica", "stability ball": "Bola suíça", "bosu ball": "Bosu", rope: "Corda", roller: "Rolo", "wheel roller": "Roda abdominal", tire: "Pneu", hammer: "Marreta" }],
];
const EQUIP_PT = Object.assign({}, ...EQUIP_SECTIONS.map(([, m]) => m));
const EQUIP_FREE = new Set(Object.keys(EQUIP_SECTIONS[0][1]));
const EQUIP_MACHINE = new Set(Object.keys(EQUIP_SECTIONS[1][1]));
const equipIcon = (eq) => EQUIP_FREE.has(eq) ? Dumbbell : EQUIP_MACHINE.has(eq) ? Cog : Hand;
const targetPT = (t) => TARGET_INFO[t]?.[0] || t;
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
// Liga o catálogo à biblioteca do app (datasetId → refId), quando existe.
const LIB_BY_DATASET = Object.fromEntries(Object.entries(MEDIA_MAP).map(([refId, m]) => [m.datasetId, refId]));

function CatalogThumb({ item, size = 56 }) {
  const urls = catalogMediaUrls(item.gif);
  const [i, setI] = useState(0);
  if (i < urls.length) {
    return (
      <div style={{ width: size, height: size, background: "#fff" }} className="rounded-2xl overflow-hidden shrink-0">
        <img key={i} src={urls[i]} alt="" loading="lazy" decoding="async" onError={() => setI(i + 1)} style={{ width: size, height: size, objectFit: "contain" }} />
      </div>
    );
  }
  const slug = TARGET_INFO[item.target]?.[1];
  if (!slug) return <div style={{ width: size, height: size, background: C.card2, color: C.amber }} className="rounded-2xl shrink-0 flex items-center justify-center"><HeartPulse size={size * 0.42} /></div>;
  return <div className="rounded-2xl overflow-hidden shrink-0"><MuscleThumb slug={slug} size={size} /></div>;
}

function CatalogRow({ item, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 py-2.5 text-left active:bg-white/5 hover:bg-white/5">
      <CatalogThumb item={item} />
      <span className="flex-1 min-w-0">
        <span style={{ color: C.text, ...body }} className="block text-[15px] font-medium leading-snug line-clamp-2">{capitalize(item.name)}</span>
        <span style={{ color: C.mut2, ...body }} className="block text-xs mt-0.5 truncate">{targetPT(item.target)} · {EQUIP_PT[item.equipment] || item.equipment}</span>
      </span>
      {LIB_BY_DATASET[item.id] && <span style={{ background: "rgba(255,138,61,.14)", color: C.amber, ...label }} className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px]">No app</span>}
      <ChevronRight size={17} style={{ color: C.mut2 }} className="shrink-0" />
    </button>
  );
}

function CatalogSheet({ item, onClose, onOpenLib }) {
  const urls = catalogMediaUrls(item.gif);
  const [gi, setGi] = useState(0);
  const url = urls[gi]; const err = gi >= urls.length;
  const slug = TARGET_INFO[item.target]?.[1];
  const libId = LIB_BY_DATASET[item.id];
  const EI = equipIcon(item.equipment);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ background: "rgba(0,0,0,.6)" }} className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center">
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label={item.name} style={{ background: C.bg2, border: `1px solid ${C.line}` }}
        className="w-full max-w-[480px] lg:max-w-[520px] rounded-t-[28px] lg:rounded-3xl px-5 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+20px)] max-h-[90vh] overflow-y-auto an-sheet">
        <div style={{ background: C.line }} className="w-10 h-1 rounded-full mx-auto mb-3 lg:hidden" />
        <div className="flex justify-end"><button onClick={onClose} aria-label="Fechar" style={{ color: C.mut, background: C.card }} className="w-8 h-8 rounded-full flex items-center justify-center"><X size={17} /></button></div>
        <div style={{ background: url && !err ? "#fff" : `radial-gradient(circle at 50% 40%, ${C.card2} 0%, ${C.bg} 80%)` }} className="rounded-3xl h-[240px] mt-2 flex items-center justify-center overflow-hidden">
          {url && !err
            ? <img key={gi} src={url} alt={`Execução: ${item.name}`} onError={() => setGi(gi + 1)} className="h-full w-full object-contain" />
            : slug ? <BodyMap body={{ side: sideOf(slug) }} highlight={{ main: [slug], sec: [] }} height={220} /> : <HeartPulse size={64} color={C.amber} />}
        </div>
        <h2 style={{ color: C.text, ...display }} className="text-[22px] leading-tight font-bold mt-4">{capitalize(item.name)}</h2>
        <p style={{ color: C.mut2, ...body }} className="text-xs mt-1">Nome original do catálogo (em inglês).</p>
        <div className="mt-4"><ListGroup>
          <ListRow icon={Target} title="Músculo-alvo" value={targetPT(item.target)} />
          <ListRow icon={EI} title="Equipamento" value={EQUIP_PT[item.equipment] || item.equipment} />
        </ListGroup></div>
        {libId ? (
          <button onClick={() => onOpenLib(libId)} style={{ background: CTA_BG, color: C.bg, ...label }} className="w-full rounded-full py-3.5 mt-4 text-[16px] flex items-center justify-center gap-2"><Info size={17} /> Ver passo a passo no app</button>
        ) : (
          <p style={{ color: C.mut2, ...body }} className="text-xs mt-4 leading-relaxed">Este exercício ainda não faz parte da biblioteca do app, então não tem passo a passo em português. Dúvidas de execução? Pergunte ao Coach.</p>
        )}
      </div>
    </div>
  );
}

function ExercisesScreen({ tracking }) {
  const [catalog, setCatalog] = useState(null);
  const [mode, setMode] = useState("musculo");
  const [cat, setCat] = useState(null); // { kind: "target" | "equip", key }
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const [item, setItem] = useState(null);
  const [libItem, setLibItem] = useState(null);
  const [limit, setLimit] = useState(60);
  const searchRef = useRef(null);

  useEffect(() => { let alive = true; import("@/lib/exercise-catalog.json").then((m) => { if (alive) setCatalog(m.default || m); }); return () => { alive = false; }; }, []);
  useEffect(() => { setLimit(60); }, [cat, q, mode]);
  useEffect(() => { if (searching) searchRef.current?.focus(); }, [searching]);

  const counts = (key) => (catalog || []).reduce((m, e) => { m[e[key]] = (m[e[key]] || 0) + 1; return m; }, {});
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const term = norm(q.trim());
  const matches = (e) => !term || norm(e.name).includes(term) || norm(targetPT(e.target)).includes(term) || norm(EQUIP_PT[e.equipment]).includes(term);

  let list = null; let title = "Exercícios"; let sub = catalog ? `${catalog.length.toLocaleString("pt-BR")} no catálogo` : "Carregando catálogo…";
  if (catalog && cat) {
    list = catalog.filter((e) => (cat.kind === "target" ? e.target === cat.key : e.equipment === cat.key) && matches(e));
    title = cat.kind === "target" ? targetPT(cat.key) : (EQUIP_PT[cat.key] || cat.key);
    sub = `${list.length} exercício${list.length === 1 ? "" : "s"}`;
  } else if (catalog && term) {
    list = catalog.filter(matches);
    sub = `${list.length} resultado${list.length === 1 ? "" : "s"} para "${q.trim()}"`;
  }
  const back = () => { setCat(null); setQ(""); setSearching(false); window.scrollTo({ top: 0 }); };
  const openCat = (kind, key) => { setCat({ kind, key }); setQ(""); setSearching(false); window.scrollTo({ top: 0 }); };

  const tc = counts("target"); const ec = counts("equipment");
  const libGroups = GROUP_ORDER.map((g) => [g, byGroup(g)]).filter(([, l]) => l.length);

  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-3xl">
      <ScreenHeader title={title} sub={sub}>
        {cat && <IconBtn icon={ChevronLeft} label="Voltar" onClick={back} />}
        <IconBtn icon={searching ? X : Search} label={searching ? "Fechar busca" : "Buscar exercício"} active={searching}
          onClick={() => { if (searching) { setSearching(false); setQ(""); } else setSearching(true); }} />
      </ScreenHeader>

      {searching && (
        <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-full flex items-center gap-2 px-4 mb-3">
          <Search size={16} style={{ color: C.mut2 }} />
          <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={cat ? `Buscar em ${title}…` : "Nome (em inglês), músculo ou equipamento"}
            style={{ color: C.text, ...body }} className="flex-1 min-w-0 bg-transparent py-3 outline-none text-sm" />
        </div>
      )}

      {!catalog && <div className="py-16 flex justify-center"><Loader2 className="an-spin" color={C.amber} size={28} /></div>}

      {catalog && list && (
        <>
          <div className="divide-y divide-[#2A313C]">
            {list.slice(0, limit).map((e) => <CatalogRow key={e.id} item={e} onClick={() => setItem(e)} />)}
          </div>
          {list.length === 0 && <p style={{ color: C.mut2, ...body }} className="text-sm text-center py-10">Nada encontrado. Os nomes do catálogo estão em inglês — tente, por exemplo, "curl", "press" ou "squat".</p>}
          {list.length > limit && (
            <button onClick={() => setLimit((l) => l + 60)} style={{ background: C.card, color: C.text, border: `1px solid ${C.line}`, ...label }} className="w-full rounded-full py-3 mt-3 text-[14px]">Mostrar mais ({list.length - limit})</button>
          )}
        </>
      )}

      {catalog && !list && (
        <>
          <Segmented options={[["musculo", "Por músculo"], ["equip", "Equipamentos"], ["app", "Do app"]]} value={mode} onChange={setMode} />

          {mode === "musculo" && (
            <div className="divide-y divide-[#2A313C] mt-2">
              {TARGET_ORDER.filter((t) => tc[t]).map((t) => {
                const slug = TARGET_INFO[t][1];
                return (
                  <button key={t} onClick={() => openCat("target", t)} className="w-full flex items-center gap-4 py-3 text-left active:bg-white/5 hover:bg-white/5">
                    {slug ? <MuscleThumb slug={slug} size={60} /> : <span style={{ background: C.card2, color: C.amber }} className="w-[60px] h-[60px] rounded-xl flex items-center justify-center shrink-0"><HeartPulse size={26} /></span>}
                    <span className="flex-1 min-w-0">
                      <span style={{ color: C.text, ...body }} className="block text-[16px] font-semibold">{targetPT(t)}</span>
                      <span style={{ color: C.mut2, ...body }} className="block text-xs mt-0.5">{tc[t]} exercício{tc[t] === 1 ? "" : "s"}</span>
                    </span>
                    <ChevronRight size={17} style={{ color: C.mut2 }} />
                  </button>
                );
              })}
            </div>
          )}

          {mode === "equip" && EQUIP_SECTIONS.map(([sec, map]) => {
            const keys = Object.keys(map).filter((k) => ec[k]).sort((a, b) => ec[b] - ec[a]);
            if (!keys.length) return null;
            return (
              <div key={sec}>
                <SectionLabel>{sec}</SectionLabel>
                <div className="divide-y divide-[#2A313C]">
                  {keys.map((k) => {
                    const I = equipIcon(k);
                    return (
                      <button key={k} onClick={() => openCat("equip", k)} className="w-full flex items-center gap-4 py-3 text-left active:bg-white/5 hover:bg-white/5">
                        <span style={{ background: C.text, color: C.bg }} className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0"><I size={24} /></span>
                        <span className="flex-1 min-w-0">
                          <span style={{ color: C.text, ...body }} className="block text-[16px] font-semibold">{map[k]}</span>
                          <span style={{ color: C.mut2, ...body }} className="block text-xs mt-0.5">{ec[k]} exercício{ec[k] === 1 ? "" : "s"}</span>
                        </span>
                        <ChevronRight size={17} style={{ color: C.mut2 }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {mode === "app" && (
            <>
              <p style={{ color: C.mut2, ...body }} className="text-xs mt-3 leading-relaxed">Exercícios que o app usa nos planos, com passo a passo em português, músculos e sua última carga.</p>
              {libGroups.map(([g, l]) => (
                <div key={g}>
                  <SectionLabel>{GROUP_LABELS[g]}</SectionLabel>
                  <div className="divide-y divide-[#2A313C]">
                    {l.map((e) => {
                      const best = (tracking?.lastLoads?.[e.id] || []).reduce((m, s) => Math.max(m, num(s?.kg)), 0);
                      return (
                        <button key={e.id} onClick={() => setLibItem(e)} className="w-full flex items-center gap-3.5 py-2.5 text-left active:bg-white/5 hover:bg-white/5">
                          <ExerciseMedia refId={e.id} body={e.body} size={56} radius={16} badge={false} />
                          <span className="flex-1 min-w-0">
                            <span style={{ color: C.text, ...body }} className="block text-[15px] font-medium leading-snug">{e.name}</span>
                            <span style={{ color: C.mut2, ...body }} className="block text-xs mt-0.5">{(EQUIP[e.equip] || EQUIP.maquina).label}{best ? ` · último ${best} kg` : ""}</span>
                          </span>
                          <ChevronRight size={17} style={{ color: C.mut2 }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
          <p style={{ color: C.mut2, ...body }} className="text-[11px] mt-6 leading-relaxed">Catálogo: exercises-dataset (MIT). Nomes do catálogo em inglês.</p>
        </>
      )}

      {item && <CatalogSheet item={item} onClose={() => setItem(null)} onOpenLib={(id) => { setItem(null); setLibItem(LIB_BY_ID[id]); }} />}
      {libItem && <ExerciseDetail item={libItem} prevLoads={tracking?.lastLoads} onClose={() => setLibItem(null)} onOpenItem={(li) => setLibItem(li)} />}
    </div>
  );
}

/* ============================== APP ============================== */
export default function Dashboard({ userName }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);
  const [tracking, setTracking] = useState({ weightLog: [], history: [] });
  const [session, setSession] = useState({ sets: {} });
  const [chat, setChat] = useState([]);
  const [tab, setTab] = useState("today");
  const [aiBusy, setAiBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [weighIn, setWeighIn] = useState(null);

  useEffect(() => {
    (async () => {
      const st = await loadState();
      if (st) {
        setProfile(st.profile ?? null);
        setPlan(st.plan ?? null);
        setTracking(st.tracking ?? { weightLog: [], history: [] });
        setSession(st.session ?? { sets: {} });
        setChat(st.chat ?? []);
      }
      setReady(true);
    })();
  }, []);
  // Persiste cada fatia do estado no Postgres (upsert por usuário).
  useEffect(() => { if (ready) patchState({ profile }); }, [profile, ready]);
  useEffect(() => { if (ready) patchState({ plan }); }, [plan, ready]);
  useEffect(() => { if (ready) patchState({ tracking }); }, [tracking, ready]);
  useEffect(() => { if (ready) patchState({ session }); }, [session, ready]);
  useEffect(() => { if (ready) patchState({ chat }); }, [chat, ready]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  const finishSetup = (pr) => {
    setProfile(pr); setPlan(buildPlan(pr));
    if (pr.weight) setTracking((t) => t.weightLog.length ? t : { ...t, weightLog: [{ date: today(), weight: pr.weight }] });
    setSession({ sets: {} }); setTab("today");
  };
  const completeDay = () => {
    const day = plan.days[plan.cycleIndex % plan.days.length];
    const next = plan.days[(plan.cycleIndex + 1) % plan.days.length];
    // Guarda as cargas de cada exercício para pré-preencher o próximo treino.
    const lastLoads = {};
    day.exercises.forEach((e, i) => {
      const log = session.log?.[i] || {};
      const rows = Array.from({ length: e.sets }, (_, s) => ({ kg: num(log[s]?.kg) || null, reps: num(log[s]?.reps) || null }));
      if (rows.some((r) => r.kg || r.reps)) lastLoads[e.refId] = rows;
    });
    const volume = Math.round(sessionVolume(day, session));
    const minutes = session.startedAt ? Math.round((Date.now() - session.startedAt) / 60000) : null;
    setTracking((t) => ({ ...t, lastLoads: { ...(t.lastLoads || {}), ...lastLoads }, history: [...t.history, { date: today(), dayId: day.id, name: day.name, volume, minutes }] }));
    setWeighIn({ next });
  };
  const closeWeighIn = (weight) => {
    if (weight) addWeight(weight);
    setPlan((p) => ({ ...p, cycleIndex: (p.cycleIndex + 1) % p.days.length }));
    setSession({ sets: {} });
    const n = weighIn?.next;
    setWeighIn(null); setTab("plan");
    if (n) showToast(`Tudo certo! Próximo: Treino ${n.id} — ${n.name}`);
  };
  const addWeight = (w) => setTracking((t) => { const d = today(); return { ...t, weightLog: [...t.weightLog.filter((x) => x.date !== d), { date: d, weight: w }] }; });

  // Monta o plano a partir da configuração do construtor (dias + grupos escolhidos).
  // useAI=false: o próprio app escolhe os exercícios. useAI=true: a IA distribui.
  const buildFromConfig = async (daysConfig, useAI, opts = {}) => {
    if (!profile) return false;
    const daysPerWeek = opts.daysPerWeek || profile.daysPerWeek || 3;
    const clean = (daysConfig || [])
      .map((d) => ({ name: (d.name || "").trim(), groups: (d.groups || []).filter((g) => GROUP_ORDER.includes(g)) }))
      .filter((d) => d.groups.length);
    if (!clean.length) { showToast("Escolha ao menos um grupo para montar o plano."); return false; }

    if (!useAI) {
      const plan = buildCustomPlan(profile, clean);
      if (!plan) { showToast("Não encontrei exercícios para esses grupos."); return false; }
      setPlan({ ...plan, daysPerWeek }); setSession({ sets: {} }); showToast("Plano montado!");
      return true;
    }

    setAiBusy(true);
    try {
      // Nº de exercícios por dia conforme o tempo disponível por treino.
      const mins = opts.minutes || 60;
      const perDay = mins <= 30 ? "3 a 4" : mins <= 45 ? "4 a 5" : mins <= 60 ? "5 a 6" : "6 a 8";
      const daysSpec = clean.map((d, i) => `${dayLetter(i)}${d.name ? ` "${d.name}"` : ""}: grupos=${d.groups.join(",")}`).join(" | ");
      const prefs = [
        opts.focus ? `FOCO pedido pelo usuário: ${opts.focus} (dê mais volume/prioridade a isso, sem ignorar os grupos escolhidos).` : "",
        `Tempo por treino: ~${mins} min, então ${perDay} exercícios por dia.`,
        `Frequência: ${daysPerWeek}x por semana.`,
        opts.note ? `Objetivo específico: ${opts.note}.` : "",
      ].filter(Boolean).join(" ");
      const sys = "Você monta treinos de academia. Responda APENAS com JSON válido, sem markdown.";
      const prompt = `Monte um plano RESPEITANDO EXATAMENTE os dias e grupos que o usuário escolheu. Dias: ${daysSpec}. Em cada dia use SOMENTE exercícios dos grupos daquele dia. ${prefs} Perfil: objetivo=${profile.goal}, nível=${profile.level}, equip preferido=${profile.equip}, peso=${profile.weight}kg, meta=${profile.goalWeight}kg, limitações="${profile.limits || "nenhuma"}". Use SOMENTE estes ids (refId), com seus grupos entre parênteses: ${LIB_IDS_SPEC}. Respeite limitações. Formato: {"days":[{"id":"A","name":"...","exercises":[{"refId":"...","sets":4,"reps":"10-12","rest":75}]}]}. Só o JSON.`;
      const raw = await callClaude([{ role: "user", content: prompt }], sys);
      const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
      const plan = planFromAIJson(profile, json, "ai", { daysPerWeek });
      if (!plan) throw new Error("vazio");
      setPlan(plan); setSession({ sets: {} }); showToast("Plano personalizado pela IA!");
      return true;
    } catch {
      // Fallback: monta sem IA com os mesmos grupos, em vez de deixar o usuário na mão.
      const plan = buildCustomPlan(profile, clean);
      if (plan) { setPlan({ ...plan, daysPerWeek }); setSession({ sets: {} }); showToast("IA indisponível — montei com os grupos que você escolheu."); return true; }
      showToast("Não consegui gerar o plano agora."); return false;
    } finally { setAiBusy(false); }
  };

  // O coach propõe um treino no chat; aqui o usuário confirma e o app aplica.
  const applyCoachPlan = (json) => {
    if (!profile) return;
    const built = planFromAIJson(profile, json, "ai", { daysPerWeek: plan?.daysPerWeek || profile.daysPerWeek || 3 });
    if (!built) { showToast("O coach não enviou um treino válido."); return; }
    setPlan(built); setSession({ sets: {} }); setTab("plan");
    showToast("Treino do coach aplicado!");
  };

  if (!ready) return <div style={{ background: C.bg, minHeight: "100vh" }} className="flex items-center justify-center"><Loader2 className="an-spin" color={C.amber} size={32} /></div>;
  if (!profile || !plan) return <><Styles /><Setup onDone={finishSetup} /></>;

  const tabs = [{ k: "today", icon: Flame, label: "Hoje" }, { k: "plan", icon: LayoutGrid, label: "Plano" }, { k: "progress", icon: BarChart3, label: "Evolução" }, { k: "exercises", icon: BookOpen, label: "Exercícios" }, { k: "coach", icon: MessageCircle, label: "Coach" }, { k: "settings", icon: User, label: "Perfil" }];
  const firstName = profile.name.split(" ")[0];
  const go = (k) => { setTab(k); window.scrollTo({ top: 0 }); };

  return (
    <BodySexContext.Provider value={profile.sex}>
    <div style={{ background: `radial-gradient(90% 50% at 50% -8%, rgba(255,138,61,.10) 0%, rgba(19,22,27,0) 70%), ${C.bg}`, backgroundAttachment: "fixed", minHeight: "100vh", ...body }} className="overflow-x-clip">
      <Styles />

      {/* Menu lateral (computador) */}
      <aside style={{ background: "rgba(24,28,35,.85)", borderRight: "1px solid rgba(255,255,255,.06)" }} className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-40 flex-col p-5">
        <div className="flex items-center gap-2.5 mb-8">
          <Dumbbell size={26} color={C.amber} className="-rotate-45" />
          <span style={{ color: C.text, ...display }} className="text-xl font-bold">TreinoCerto</span>
        </div>
        <nav className="space-y-1">
          {tabs.map((t) => {
            const on = tab === t.k; const Icon = t.icon;
            return (
              <button key={t.k} onClick={() => go(t.k)} style={{ background: on ? C.card2 : "transparent", color: on ? C.text : C.mut, boxShadow: on ? "inset 0 0 0 1px rgba(255,255,255,.07)" : "none", ...label }}
                className="w-full rounded-full px-4 py-3 text-[15px] flex items-center gap-3 text-left hover:bg-white/5">
                <Icon size={19} color={on ? C.amber : C.mut} /> {t.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <InstallButton C={C} body={body} />
          <div style={{ border: `1px solid ${C.line}` }} className="rounded-xl p-3 flex items-center gap-2.5">
            <div style={{ background: C.card2, color: C.amber, ...display }} className="rounded-full w-9 h-9 flex items-center justify-center font-bold">{firstName.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0"><p style={{ color: C.text }} className="text-sm font-semibold truncate">{profile.name}</p><p style={{ color: C.mut2 }} className="text-xs truncate">{profile.goal} · {profile.level}</p></div>
          </div>
          <p style={{ color: C.mut2, ...body }} className="text-[11px] text-center">TreinoCerto v{APP_VERSION}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
      <div className="mx-auto px-4 pb-4 max-w-[480px] md:max-w-[720px] lg:max-w-[1180px] lg:px-8 lg:py-8">
        {tab === "today" && <TodayScreen profile={profile} plan={plan} setPlan={setPlan} session={session} setSession={setSession} tracking={tracking} onComplete={completeDay} goPlan={() => go("plan")} goCoach={() => go("coach")} goProgress={() => go("progress")} />}
        {tab === "plan" && <PlanScreen profile={profile} plan={plan} setPlan={setPlan} session={session} setSession={setSession} buildFromConfig={buildFromConfig} aiBusy={aiBusy} tracking={tracking} goToday={() => go("today")} />}
        {tab === "progress" && <ProgressScreen profile={profile} tracking={tracking} addWeight={(w) => { addWeight(w); showToast("Peso registrado!"); }} />}
        {tab === "exercises" && <ExercisesScreen tracking={tracking} />}
        {tab === "coach" && <CoachScreen profile={profile} plan={plan} chat={chat} setChat={setChat} onApplyPlan={applyCoachPlan} />}
        {tab === "settings" && <SettingsScreen profile={profile} tracking={tracking} setProfile={setProfile} setPlan={setPlan} showToast={showToast} onReset={async () => { setProfile(null); setPlan(null); setTracking({ weightLog: [], history: [] }); setSession({ sets: {} }); setChat([]); await patchState({ profile: null, plan: null, tracking: { weightLog: [], history: [] }, session: { sets: {} }, chat: [] }); }} onSignOut={async () => { await signOut(); window.location.reload(); }} />}
      </div>
      </div>

      {/* Menu inferior flutuante (celular/tablet) */}
      <nav style={{ bottom: "calc(env(safe-area-inset-bottom) + 10px)" }} className="lg:hidden fixed left-3 right-3 z-40">
        <div style={{ ...GLASS, boxShadow: "0 14px 40px rgba(0,0,0,.45)" }} className="mx-auto max-w-[480px] md:max-w-[620px] grid grid-cols-6 rounded-full p-1">
          {tabs.map((t) => {
            const on = tab === t.k; const Icon = t.icon;
            return (
              <button key={t.k} onClick={() => go(t.k)} aria-current={on ? "page" : undefined}
                style={{ background: on ? "rgba(255,255,255,.09)" : "transparent" }}
                className="rounded-full py-2 flex flex-col items-center gap-0.5 transition-colors">
                <Icon size={20} color={on ? C.amber : C.mut} strokeWidth={on ? 2.4 : 2} />
                <span style={{ color: on ? C.text : C.mut, ...label, letterSpacing: ".02em" }} className="text-[10px] leading-none mt-0.5">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      {weighIn && <WeighInModal nextDay={weighIn.next} onSave={closeWeighIn} onSkip={() => closeWeighIn(null)} />}
      {toast && <div style={{ background: "rgba(30,94,69,.95)", border: `1px solid ${C.mint}`, color: C.mint, maxWidth: 440, backdropFilter: "blur(12px)" }} className="fixed top-[calc(env(safe-area-inset-top)+14px)] lg:top-auto lg:bottom-8 left-1/2 lg:left-[calc(50%+8rem)] -translate-x-1/2 z-50 rounded-full px-5 py-3 text-sm font-semibold text-center w-[calc(100%-2rem)] lg:w-auto an-toast">{toast}</div>}
    </div>
    </BodySexContext.Provider>
  );
}

const GOAL_LABEL = { emagrecer: "Emagrecer", hipertrofia: "Ganhar massa", forca: "Força", saude: "Saúde" };
const LEVEL_LABEL = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" };
const EQUIP_PREF_LABEL = { maquina: "Máquinas", livre: "Peso livre", ambos: "Tanto faz" };

function SettingsScreen({ profile, tracking, onReset, onSignOut, setProfile, setPlan, showToast }) {
  const [editing, setEditing] = useState(false);
  if (editing) return (
    <div>
      <ScreenHeader title="Editar perfil"><IconBtn icon={X} label="Cancelar" onClick={() => setEditing(false)} /></ScreenHeader>
      <Setup embedded initial={profile} onDone={(np) => { setProfile(np); setPlan(buildPlan(np)); setEditing(false); showToast("Perfil e plano atualizados!"); }} />
    </div>
  );
  const prog = profile.progression || DEFAULT_PROGRESSION;
  const bd = profile.birthdate || birthdateFromAge(profile.age);
  const age = ageFromBirthdate(bd) || profile.age;
  const setProg = (patch) => setProfile((pr) => ({ ...pr, progression: { ...DEFAULT_PROGRESSION, ...(pr.progression || {}), ...patch } }));
  const hist = tracking?.history || [];
  const records = Object.keys(tracking?.lastLoads || {}).length;
  const mins = hist.reduce((a, h) => a + (h.minutes || 0), 0);
  const toggle = (
    <button onClick={() => setProg({ enabled: !prog.enabled })} aria-label="Ligar/desligar progressão" aria-pressed={prog.enabled}
      style={{ background: prog.enabled ? C.amber : C.card2, border: `1px solid ${prog.enabled ? C.amber : C.line}` }}
      className="relative shrink-0 w-12 h-7 rounded-full transition-colors">
      <span style={{ background: prog.enabled ? C.bg : C.mut, left: prog.enabled ? 22 : 3 }} className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all" />
    </button>
  );
  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-xl">
      <ScreenHeader title="Perfil">
        <IconBtn icon={Pencil} label="Editar perfil" onClick={() => setEditing(true)} />
      </ScreenHeader>

      <div className="flex items-center gap-3 mt-1">
        <div style={{ background: CTA_BG, color: C.bg, ...display }} className="rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold shrink-0">{profile.name.slice(0, 1).toUpperCase()}</div>
        <div className="min-w-0">
          <p style={{ color: C.text, ...display }} className="text-lg font-bold truncate">{profile.name}</p>
          <span style={{ background: "rgba(255,138,61,.14)", color: C.amber, ...label }} className="inline-block rounded-full px-2.5 py-0.5 text-[11px] mt-0.5">{GOAL_LABEL[profile.goal] || profile.goal} · {LEVEL_LABEL[profile.level] || profile.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 mt-5" style={{ borderTop: "1px solid #2A313C", borderBottom: "1px solid #2A313C" }}>
        {[[hist.length, "Total de treinos"], [records, "Exercícios com carga"], [mins >= 60 ? `${Math.floor(mins / 60)}h` : `${mins}min`, "Tempo ativo"]].map(([v, t], i) => (
          <div key={t} className="py-3.5 px-1" style={{ borderLeft: i ? "1px solid #2A313C" : "none", paddingLeft: i ? 14 : 0 }}>
            <p style={{ color: C.text, ...display }} className="text-xl font-bold leading-none">{v}</p>
            <p style={{ color: C.mut2, ...body }} className="text-[11px] mt-1 leading-tight">{t}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Perfil e ajustes</SectionLabel>
      <ListGroup>
        <ListRow icon={Calendar} title="Nascimento" value={`${bd ? bd.split("-").reverse().join("/") : "—"} · ${age || "—"} anos`} onClick={() => setEditing(true)} />
        <ListRow icon={Ruler} title="Altura / Peso" value={`${profile.height}cm · ${profile.weight}kg`} onClick={() => setEditing(true)} />
        <ListRow icon={Target} title="Meta de peso" value={`${profile.goalWeight || "—"} kg`} onClick={() => setEditing(true)} />
        <ListRow icon={Dumbbell} title="Equipamento" value={EQUIP_PREF_LABEL[profile.equip] || profile.equip || "Tanto faz"} onClick={() => setEditing(true)} />
        <ListRow icon={HeartPulse} title="Limitações" value={profile.limits || "Nenhuma"} onClick={() => setEditing(true)} />
      </ListGroup>

      <SectionLabel>Treino</SectionLabel>
      <ListGroup>
        <ListRow icon={LineIcon} title="Progressão de carga" sub="Sugere um pouco mais de carga a cada treino." right={toggle} />
        {prog.enabled && (
          <div className="px-4 py-3">
            <Segmented size="sm" options={[1, 2.5, 5].map((s) => [s, `+${String(s).replace(".", ",")} kg`])} value={num(prog.stepKg)} onChange={(s) => setProg({ stepKg: s })} />
          </div>
        )}
        <ListRow icon={RotateCcw} title="Editar e refazer plano" onClick={() => setEditing(true)} />
      </ListGroup>

      <SectionLabel>Conta</SectionLabel>
      <ListGroup>
        <ListRow icon={LogOut} title="Sair da conta" onClick={onSignOut} />
        <ListRow icon={Trash2} title="Apagar tudo e recomeçar" danger onClick={() => { if (window.confirm("Apagar perfil, plano, histórico e conversas? Isso não pode ser desfeito.")) onReset(); }} />
      </ListGroup>
      <div className="mt-4 lg:hidden"><InstallButton C={C} body={body} /></div>
      <p style={{ color: C.mut2, ...body }} className="text-xs text-center mt-5">TreinoCerto · versão {APP_VERSION}</p>
    </div>
  );
}
function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

/* ============================== ESTILOS ============================== */
function Styles() {
  return (
    <style>{`
      * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
      body { margin: 0; }
      .an-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      .an-slide { animation: slidein .25s ease; } @keyframes slidein { from { transform: translateY(24px); opacity: .4; } to { transform: none; opacity: 1; } }
      @media (min-width: 1024px) { .an-slide { animation-name: slidex; } @keyframes slidex { from { transform: translateX(40px); opacity: .4; } to { transform: none; opacity: 1; } } }
      .an-pulse { animation: pulse 1.4s ease-in-out infinite; } @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
      .no-scrollbar { scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }
      .tc-pop { animation: tcpop .16s ease-out; transform-origin: top right; } @keyframes tcpop { from { transform: scale(.94); opacity: 0; } to { transform: none; opacity: 1; } }
      .an-sheet { animation: sheetin .25s cubic-bezier(.2,.8,.2,1); } @keyframes sheetin { from { transform: translateY(40px); opacity: .5; } to { transform: none; opacity: 1; } }
      @media (max-width: 1023px) { .tc-head { background: linear-gradient(180deg, rgba(19,22,27,.96) 0%, rgba(19,22,27,.88) 75%, rgba(19,22,27,0) 100%); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); } }
      input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      .an-toast { animation: pop .25s ease; } @keyframes pop { from { transform: translate(-50%,8px); opacity: 0; } to { transform: translate(-50%,0); opacity: 1; } }
      .an-squat { animation: squat 1.8s ease-in-out infinite; transform-origin: 60px 110px; } @keyframes squat { 0%,100% { transform: translateY(0) scaleY(1);} 50% { transform: translateY(14px) scaleY(.82);} }
      .an-bench .arm,.an-fly .arm,.an-pushup .arm { animation: bench 1.8s ease-in-out infinite; transform-origin: 70px 64px; } @keyframes bench { 0%,100% { transform: translateY(0);} 50% { transform: translateY(16px);} }
      .an-pulldown .arm { animation: pulldown 1.8s ease-in-out infinite; transform-origin: 60px 30px; } @keyframes pulldown { 0%,100% { transform: translateY(0);} 50% { transform: translateY(14px) scaleY(.8);} }
      .an-row .arm { animation: row 1.6s ease-in-out infinite; } @keyframes row { 0%,100% { transform: translateX(0);} 50% { transform: translateX(-16px);} }
      .an-press .arm,.an-lateral .arm { animation: press 1.8s ease-in-out infinite; transform-origin: 60px 42px; } @keyframes press { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-12px);} }
      .an-curl .arm,.an-pushdown .arm { animation: curl 1.4s ease-in-out infinite; transform-origin: 48px 56px; } @keyframes curl { 0%,100% { transform: rotate(0);} 50% { transform: rotate(-38deg);} }
      .an-legpress .arm,.an-legext .arm { animation: legp 1.6s ease-in-out infinite; transform-origin: 62px 58px; } @keyframes legp { 0%,100% { transform: scaleX(1);} 50% { transform: scaleX(.7);} }
      .an-hipthrust .arm { animation: hip 1.8s ease-in-out infinite; transform-origin: 40px 50px; } @keyframes hip { 0%,100% { transform: rotate(0);} 50% { transform: rotate(-16deg);} }
      .an-abduction .arm { animation: abd 1.6s ease-in-out infinite; transform-origin: 60px 68px; } @keyframes abd { 0%,100% { transform: scaleX(.6);} 50% { transform: scaleX(1.15);} }
      .an-lunge .arm { animation: lunge 2s ease-in-out infinite; transform-origin: 56px 64px; } @keyframes lunge { 0%,100% { transform: translateY(0);} 50% { transform: translateY(10px);} }
      .an-plank .arm,.an-crunch .arm { animation: cr 1.8s ease-in-out infinite; transform-origin: 92px 80px; } @keyframes cr { 0%,100% { transform: rotate(0);} 50% { transform: rotate(-14deg);} }
      .an-run .arm { animation: run .7s ease-in-out infinite; transform-origin: 59px 50px; } @keyframes run { 0%,100% { transform: rotate(-12deg);} 50% { transform: rotate(12deg);} }
      @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
      input::placeholder, textarea::placeholder { color: ${C.mut2}; }
    `}</style>
  );
}
