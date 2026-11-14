"use client";
import React, { useState, useEffect, useRef } from "react";
import { Dumbbell, Flame, LineChart as LineIcon, MessageCircle, User, Check, RotateCcw, Play, Pause, Plus, ChevronRight, Sparkles, Replace, Trophy, Calendar, Send, Scale, Info, Loader2, X, Cog, Hand, LogOut, Timer, Pencil, Trash2, Wand2 } from "lucide-react";
import BodyMap, { BodySexContext, MUSCLE_NAMES, musclesOf, sideOf } from "@/components/BodyMap";
import { InstallBanner, InstallButton } from "@/components/InstallApp";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { LIB, LIB_BY_ID, byGroup, byPattern, makeExercise, buildPlan, buildCustomPlan, planToConfig, autoDayName, GROUP_ORDER, GROUP_LABELS, GROUP_BODY, dayLetter } from "@/lib/exercises";
import { gifUrls } from "@/lib/media";
import { loadState, patchState, signOut, askCoach } from "@/lib/data";

/* ============================== TEMA ============================== */
const C = {
  bg: "#13161B", bg2: "#181C23", card: "#20252E", card2: "#272D38",
  line: "#323A47", text: "#EEF1F5", mut: "#8B93A1", mut2: "#5E6675",
  amber: "#FF8A3D", amberSoft: "#FFB07A", mint: "#46E0A0", mintDim: "#1E5E45",
  indigo: "#8C7BFF", red: "#FF6B6B", muscle: "#39424F", hl: "#FF5630",
};
const display = { fontFamily: "'Space Grotesk', system-ui, sans-serif" };
const body = { fontFamily: "'Inter', system-ui, sans-serif" };

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

function SetTable({ ex, done, log, prev, onToggle, onLog }) {
  const inputCls = "w-full bg-transparent text-center outline-none text-sm font-semibold tabular-nums py-2";
  return (
    <div className="mt-3">
      <div style={{ color: C.mut2, ...body }} className="grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 px-2 text-[10px] font-bold uppercase tracking-wider mb-1.5">
        <span>Série</span><span className="text-center">Reps</span><span className="text-center">Peso (kg)</span><span />
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: ex.sets }).map((_, i) => {
          const isDone = done.includes(i);
          const row = log?.[i] || {};
          const last = prev?.[i];
          return (
            <div key={i} style={{ background: isDone ? "rgba(70,224,160,.12)" : C.bg2, border: `1px solid ${isDone ? C.mintDim : C.line}` }}
              className="grid grid-cols-[40px_minmax(0,1fr)_minmax(0,1fr)_44px] gap-2 items-center rounded-xl px-2 py-1 transition-colors">
              <span style={{ color: isDone ? C.mint : C.amber, ...display }} className="text-sm font-bold text-center">{i + 1}</span>
              <input value={row.reps ?? ""} onChange={(e) => onLog(i, "reps", e.target.value)} inputMode="numeric"
                placeholder={last?.reps ? String(last.reps) : repsHint(ex.reps)} aria-label={`Repetições da série ${i + 1}`}
                style={{ color: C.text, ...body }} className={inputCls} />
              <input value={row.kg ?? ""} onChange={(e) => onLog(i, "kg", e.target.value)} inputMode="decimal"
                placeholder={last?.kg ? String(last.kg) : "—"} aria-label={`Peso da série ${i + 1}`}
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
    </div>
  );
}

function ExerciseCard({ ex, idx, done, log, prev, onToggleSet, onLog, onSwap, onSwapTo, onOpen }) {
  const total = ex.sets;
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
      if ((row.kg == null || row.kg === "") && prev?.[i]?.kg) onLog(i, "kg", String(prev[i].kg));
    }
    onToggleSet(i);
    if (!was && completed + 1 < total) setResting(true);
  };
  const switchEquip = (equip) => {
    const target = variants.find((v) => v.equip === equip);
    if (target && target.id !== ex.refId) onSwapTo(idx, target);
  };
  const best = (prev || []).reduce((m, s) => Math.max(m, num(s?.kg)), 0);

  return (
    <div style={{ background: C.card, border: `1px solid ${allDone ? C.mintDim : C.line}` }} className="rounded-3xl p-4">
      <div className="flex gap-3 items-start">
        <button onClick={() => onOpen("geral")} aria-label={`Ver detalhes de ${ex.name}`} className="shrink-0"><ExerciseMedia refId={ex.refId} body={ex.body} size={88} radius={16} tall /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <EquipBadge equip={ex.equip} />
            {best > 0 && <span style={{ background: "rgba(70,224,160,.12)", color: C.mint, border: `1px solid ${C.mintDim}`, ...body }} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"><Trophy size={10} /> Último: {best}kg</span>}
          </div>
          <div className="flex items-start justify-between gap-2">
            <button onClick={() => onOpen("geral")} className="text-left"><h3 style={{ color: C.text, ...display }} className="font-bold leading-tight text-[17px] hover:underline decoration-1 underline-offset-2">{ex.name}</h3></button>
            {allDone && <Check size={20} style={{ color: C.mint }} className="shrink-0" />}
          </div>
          <p style={{ color: C.hl, ...body }} className="text-xs font-semibold mt-0.5">{ex.muscle}</p>
          <p style={{ color: C.mut, ...body }} className="text-xs mt-1 flex items-center gap-1">{ex.sets} séries · {ex.reps} reps · <Timer size={12} /> {ex.rest}s</p>
        </div>
      </div>

      {/* alternar peso livre / máquina */}
      {equipsAvail.length > 1 && (
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span style={{ color: C.mut2, ...body }} className="text-[10px] uppercase tracking-wide mr-1">Fazer com:</span>
          {equipsAvail.map((eq) => {
            const on = ex.equip === eq;
            const E = EQUIP[eq]; const Icon = E.icon;
            return <button key={eq} onClick={() => switchEquip(eq)} style={{ background: on ? C.amber : C.bg2, color: on ? C.bg : C.mut, border: `1px solid ${on ? C.amber : C.line}`, ...body }} className="rounded-lg px-2 py-1 text-[11px] font-semibold flex items-center gap-1"><Icon size={12} />{E.short}</button>;
          })}
        </div>
      )}

      <SetTable ex={ex} done={done} log={log} prev={prev} onToggle={handleSet} onLog={onLog} />

      {resting && !allDone && <RestTimer seconds={ex.rest} onDone={() => setResting(false)} onSkip={() => setResting(false)} />}

      <div className="flex gap-2 mt-3">
        <button onClick={() => onOpen("como")} style={{ background: C.bg2, color: C.mut, border: `1px solid ${C.line}` }} className="flex-1 rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1"><Info size={14} /> Como fazer</button>
        <button onClick={() => onSwap(idx)} style={{ background: C.bg2, color: C.amberSoft, border: `1px solid ${C.line}` }} className="flex-1 rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1"><Replace size={14} /> Trocar</button>
      </div>
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

function TodayScreen({ profile, plan, setPlan, session, setSession, tracking, onComplete }) {
  const [detail, setDetail] = useState(null); // { item, idx, tab }
  const [swapFor, setSwapFor] = useState(null);
  const dayIdx = plan.cycleIndex % plan.days.length;
  const day = plan.days[dayIdx];
  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = day.exercises.reduce((a, e, i) => a + ((session.sets[i] || []).length), 0);
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;
  const allDone = day.exercises.every((e, i) => (session.sets[i] || []).length >= e.sets);
  const elapsed = useElapsed(session.startedAt);
  const volume = Math.round(sessionVolume(day, session));

  const toggleSet = (exIdx, setIdx) => setSession((s) => {
    const sets = { ...s.sets }; const arr = sets[exIdx] ? [...sets[exIdx]] : [];
    const pos = arr.indexOf(setIdx); if (pos >= 0) arr.splice(pos, 1); else arr.push(setIdx);
    sets[exIdx] = arr; return { ...s, sets, startedAt: s.startedAt || Date.now() };
  });
  const logSet = (exIdx, setIdx, field, value) => setSession((s) => {
    const log = { ...(s.log || {}) };
    const ex = { ...(log[exIdx] || {}) };
    ex[setIdx] = { ...(ex[setIdx] || {}), [field]: value.replace(/[^\d.,]/g, "").slice(0, 6) };
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

  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10">
      <InstallBanner C={C} body={body} />

      <div style={{ background: `radial-gradient(120% 140% at 100% 0%, rgba(255,138,61,.18) 0%, ${C.card} 45%, ${C.bg2} 100%)`, border: `1px solid ${C.line}` }} className="rounded-3xl p-5 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p style={{ color: C.amber, ...body }} className="text-xs font-bold uppercase tracking-widest">Treino {day.id} · Hoje</p>
            <h2 style={{ color: C.text, ...display }} className="text-2xl lg:text-3xl font-bold mt-0.5 truncate">{day.name}</h2>
            <p style={{ color: C.mut, ...body }} className="text-xs mt-1">{day.exercises.length} exercícios · {totalSets} séries</p>
          </div>
          <ProgressRing pct={pct} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <HeroStat icon={Timer} label="Duração" value={elapsed} live={!!session.startedAt && !allDone} />
          <HeroStat icon={Check} label="Séries" value={`${doneSets}/${totalSets}`} />
          <HeroStat icon={Dumbbell} label="Volume (kg)" value={volume.toLocaleString("pt-BR")} />
        </div>
      </div>

      <DayMuscles day={day} />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 items-start">
        {day.exercises.map((ex, i) => (
          <ExerciseCard key={`${dayIdx}-${i}`} ex={ex} idx={i} done={session.sets[i] || []}
            log={session.log?.[i]} prev={tracking.lastLoads?.[ex.refId]}
            onToggleSet={(setIdx) => toggleSet(i, setIdx)}
            onLog={(setIdx, field, v) => logSet(i, setIdx, field, v)}
            onSwap={(idx) => setSwapFor(idx)}
            onSwapTo={(idx, li) => swapTo(idx, li, true)}
            onOpen={(tab) => setDetail({ item: ex, idx: i, tab })} />
        ))}
      </div>

      <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] lg:bottom-4 mt-4 z-30">
        <button onClick={onComplete} disabled={!allDone}
          style={{ background: allDone ? `linear-gradient(90deg, ${C.mint}, #7CF5B8)` : C.card, color: allDone ? C.bg : C.mut2, border: `1px solid ${allDone ? C.mint : C.line}`, boxShadow: allDone ? "0 10px 30px rgba(70,224,160,.25)" : "none", ...display }}
          className="w-full rounded-full py-4 font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2 lg:max-w-md lg:mx-auto">
          <Trophy size={20} /> {allDone ? "Finalizar treino" : `Faltam ${totalSets - doneSets} séries`}
        </button>
      </div>

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

function HeroStat({ icon: Icon, label, value, live }) {
  return (
    <div style={{ background: "rgba(19,22,27,.55)", border: `1px solid ${C.line}` }} className="rounded-2xl px-3 py-2.5">
      <p style={{ color: C.text, ...display }} className="text-lg font-bold tabular-nums leading-none flex items-center gap-1.5">
        {live && <span style={{ background: C.mint }} className="w-2 h-2 rounded-full an-pulse" />}{value}
      </p>
      <p style={{ color: C.mut2, ...body }} className="text-[10px] mt-1 flex items-center gap-1 uppercase tracking-wide"><Icon size={11} /> {label}</p>
    </div>
  );
}

/* ============================== DETALHE DO EXERCÍCIO ==============================
   Tela cheia no celular / painel lateral no computador. Abre ao tocar no
   exercício: GIF grande, músculos (primário/secundário) com recorte do boneco,
   seu progresso, equipamento e exercícios similares. */
const GROUP_LABEL = { peito: "Peito", costas: "Costas", pernas: "Pernas", gluteo: "Glúteos", ombro: "Ombros", biceps: "Bíceps", triceps: "Tríceps", core: "Core", cardio: "Cardio" };

function MuscleThumb({ slug, size = 56, main = true }) {
  return (
    <div style={{ width: size, height: size, background: `radial-gradient(circle at 50% 45%, ${C.card2} 0%, ${C.bg} 85%)`, border: `1px solid ${C.line}` }}
      className="rounded-xl shrink-0 overflow-hidden flex items-center justify-center">
      <BodyMap body={{ side: sideOf(slug) }} highlight={main ? { main: [slug], sec: [] } : { main: [], sec: [slug] }} crop={[slug]} height={size} glow={false} />
    </div>
  );
}

function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2.5">
      <p style={{ color: C.mut, ...body }} className="text-[11px] font-bold uppercase tracking-widest">{children}</p>
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

          <div style={{ background: C.bg, border: `1px solid ${C.line}` }} className="grid grid-cols-2 rounded-full p-1 mt-4">
            {[["geral", "Visão geral"], ["como", "Como fazer"]].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ background: tab === k ? C.card2 : "transparent", color: tab === k ? C.text : C.mut, ...body }}
                className="rounded-full py-2 text-xs font-bold uppercase tracking-wide">{l}</button>
            ))}
          </div>

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
    <div className="mb-4">
      <p style={{ color: C.mut, ...body }} className="text-[11px] font-bold uppercase tracking-widest mb-2">Músculos trabalhados</p>
      <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1">
        {slugs.map((s) => (
          <div key={s} style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-1.5 pr-3 flex items-center gap-2 shrink-0">
            <MuscleThumb slug={s} size={44} />
            <span style={{ color: C.text, ...body }} className="text-xs font-semibold">{MUSCLE_NAMES[s]}</span>
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
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg2, border: `1px solid ${C.line}` }} className="w-full max-w-[480px] lg:max-w-[560px] rounded-t-3xl lg:rounded-3xl p-5 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 style={{ color: C.text, ...display }} className="text-lg font-bold">Trocar exercício</h3>
          <button onClick={onClose} style={{ color: C.mut }}><X size={20} /></button>
        </div>
        <p style={{ color: C.mut, ...body }} className="text-xs mb-3">Mesmo grupo: <b style={{ color: C.hl }}>{ex.muscle}</b></p>

        <div className="flex gap-1.5 mb-3 flex-wrap">
          {filters.map(([v, l]) => <button key={v} onClick={() => setFilter(v)} style={{ background: filter === v ? C.amber : C.card, color: filter === v ? C.bg : C.mut, border: `1px solid ${filter === v ? C.amber : C.line}`, ...body }} className="rounded-lg px-3 py-1.5 text-xs font-semibold">{l}</button>)}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-3 mb-3">
          <p style={{ color: C.text, ...body }} className="text-xs mb-2">Tem alguma limitação? (opcional)</p>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="ex.: dor no ombro, joelho sensível..." style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, ...body }} className="w-full rounded-xl px-3 py-2 text-sm outline-none" />
          <button onClick={askAI} disabled={aiBusy} style={{ background: C.indigo, color: "#fff", ...body }} className="w-full rounded-xl py-2 mt-2 text-sm font-semibold flex items-center justify-center gap-2">{aiBusy ? <Loader2 size={16} className="an-spin" /> : <Sparkles size={16} />} Pedir sugestão ao coach</button>
          {aiText && <p style={{ color: C.text, ...body }} className="text-xs leading-relaxed mt-2 whitespace-pre-wrap">{aiText}</p>}
        </div>

        <div className="space-y-2">
          {alts.map((a) => (
            <button key={a.id} onClick={() => onPick(a)} style={{ background: C.card, border: `1px solid ${C.line}` }} className="w-full rounded-2xl p-3 flex items-center gap-3 text-left">
              <ExerciseMedia refId={a.id} body={a.body} size={56} radius={12} />
              <div className="flex-1 min-w-0">
                <p style={{ color: C.text, ...display }} className="font-bold text-sm leading-tight">{a.name}</p>
                <div className="mt-1"><EquipBadge equip={a.equip} /></div>
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

/* ============================== TELA: PLANO ==============================
   Mostra a divisão em ciclo (A → B → C → A…), o próximo dia e permite
   escolher qual treino fazer hoje. Toque num exercício abre o detalhe. */
function dayStats(d) {
  const sets = d.exercises.reduce((a, e) => a + (e.sets || 0), 0);
  const secs = d.exercises.reduce((a, e) => a + (e.sets || 0) * (40 + (e.rest || 60)), 0);
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
        aiBusy={aiBusy}
        onCancel={() => setEditing(false)}
        onBuild={async (cfg, useAI) => { const ok = await buildFromConfig(cfg, useAI); if (ok) setEditing(false); }}
      />
    );
  }

  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 style={{ color: C.text, ...display }} className="text-xl lg:text-2xl font-bold">Seu plano</h2>
          <p style={{ color: C.mut, ...body }} className="text-sm mt-1 leading-relaxed">
            Divisão <b style={{ color: C.text }}>{plan.splitName}</b> em ciclo: {order} → {plan.days[0]?.id}… Ao finalizar um treino, o próximo dia vira o de <b style={{ color: C.text }}>Hoje</b>. Quer treinar outro? Escolha abaixo.
          </p>
        </div>
        <button onClick={() => setEditing(true)} style={{ background: C.amber, color: C.bg, ...display }} className="shrink-0 rounded-full px-3 py-2.5 text-sm font-bold flex items-center gap-1.5">
          <Pencil size={15} /> <span className="hidden sm:inline">Montar / Personalizar</span><span className="sm:hidden">Montar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 items-start mt-4">
        {plan.days.map((d, di) => {
          const isNext = di === nextIdx;
          const st = dayStats(d);
          return (
            <div key={d.id} style={{ background: C.card, border: `1px solid ${isNext ? C.amber : C.line}` }} className="rounded-3xl p-4 min-w-0">
              <div className="flex items-start gap-3">
                <span style={{ background: isNext ? C.amber : C.bg2, color: isNext ? C.bg : C.mut, ...display }} className="rounded-xl w-9 h-9 shrink-0 flex items-center justify-center font-bold">{d.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 style={{ color: C.text, ...display }} className="font-bold leading-tight truncate">{d.name}</h3>
                    {isNext && <span style={{ background: "rgba(255,138,61,.14)", color: C.amber, ...body }} className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase">Hoje</span>}
                  </div>
                  <p style={{ color: C.mut2, ...body }} className="text-xs mt-0.5">{d.exercises.length} exercícios · {st.sets} séries · ~{st.minutes} min</p>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap mt-3">
                {st.muscles.slice(0, 5).map((s) => (
                  <span key={s} style={{ background: C.bg2, color: C.mut, border: `1px solid ${C.line}`, ...body }} className="rounded-full pl-0.5 pr-2 py-0.5 text-[11px] font-semibold flex items-center gap-1">
                    <span className="rounded-full overflow-hidden"><MuscleThumb slug={s} size={20} /></span>{MUSCLE_NAMES[s]}
                  </span>
                ))}
              </div>

              <div className="mt-3 space-y-1">
                {d.exercises.map((e, i) => (
                  <button key={i} onClick={() => setDetail(e)} className="w-full min-w-0 flex items-center gap-2.5 text-left rounded-xl p-1 active:bg-white/5 hover:bg-white/5">
                    <ExerciseMedia refId={e.refId} body={e.body} size={40} radius={10} badge={false} />
                    <span style={{ color: C.text, ...body }} className="text-sm flex-1 min-w-0 truncate">{e.name}</span>
                    <span style={{ color: C.mut, ...body }} className="text-xs shrink-0">{e.sets}×{e.reps}</span>
                    <ChevronRight size={16} style={{ color: C.mut2 }} className="shrink-0" />
                  </button>
                ))}
              </div>

              <button onClick={() => doToday(di)}
                style={{ background: isNext ? C.amber : C.bg2, color: isNext ? C.bg : C.text, border: `1px solid ${isNext ? C.amber : C.line}`, ...display }}
                className="w-full rounded-full py-3 mt-3 font-bold text-sm flex items-center justify-center gap-2">
                <Play size={16} /> {isNext ? "Ir para o treino de hoje" : "Fazer este treino hoje"}
              </button>
            </div>
          );
        })}
      </div>

      <button onClick={() => setEditing(true)} style={{ background: C.card, border: `1px solid ${C.line}` }} className="w-full text-left rounded-3xl p-4 mt-4 flex items-center gap-3 active:bg-white/5 hover:bg-white/5">
        <div style={{ background: C.indigo }} className="rounded-xl w-10 h-10 shrink-0 flex items-center justify-center"><Wand2 size={18} color="#fff" /></div>
        <div className="flex-1 min-w-0">
          <p style={{ color: C.text, ...body }} className="text-sm font-semibold">Montar / personalizar o plano</p>
          <p style={{ color: C.mut2, ...body }} className="text-xs leading-snug">Escolha o que quer treinar em cada dia (só perna, braço, abdômen…) e gere com ou sem IA. {plan.source === "ai" ? "O plano atual foi feito pela IA." : plan.source === "custom" ? "O plano atual foi montado por você." : "Hoje você usa o modelo base."}</p>
        </div>
        <ChevronRight size={18} style={{ color: C.mut2 }} className="shrink-0" />
      </button>

      {detail && <ExerciseDetail item={detail} prevLoads={tracking?.lastLoads} onClose={() => setDetail(null)} onOpenItem={(li) => setDetail(li)} />}
    </div>
  );
}

/* ====================== CONSTRUTOR DE PLANO ====================== */
function PlanBuilder({ profile, initialConfig, aiBusy, onCancel, onBuild }) {
  const [days, setDays] = useState(() => {
    const base = (initialConfig && initialConfig.length ? initialConfig : [{ name: "", groups: [] }]);
    return base.map((d) => ({ name: d.name || "", groups: [...(d.groups || [])] }));
  });

  const toggleGroup = (di, g) => setDays((ds) => ds.map((d, i) => i !== di ? d : ({ ...d, groups: d.groups.includes(g) ? d.groups.filter((x) => x !== g) : [...d.groups, g] })));
  const setName = (di, v) => setDays((ds) => ds.map((d, i) => i !== di ? d : ({ ...d, name: v })));
  const addDay = () => setDays((ds) => [...ds, { name: "", groups: [] }]);
  const removeDay = (di) => setDays((ds) => ds.length <= 1 ? ds : ds.filter((_, i) => i !== di));

  const totalGroups = days.reduce((n, d) => n + d.groups.length, 0);
  const valid = days.some((d) => d.groups.length > 0);

  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10">
      <div className="flex items-center justify-between gap-3">
        <h2 style={{ color: C.text, ...display }} className="text-xl lg:text-2xl font-bold">Montar seu plano</h2>
        <button onClick={onCancel} style={{ color: C.mut, ...body }} className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold flex items-center gap-1"><X size={16} /> Cancelar</button>
      </div>
      <p style={{ color: C.mut, ...body }} className="text-sm mt-1 leading-relaxed">
        Monte cada dia escolhendo os grupos que quer treinar — pode ser um só (ex.: <b style={{ color: C.text }}>só perna</b>) ou vários juntos. Adicione quantos dias quiser; eles entram em ciclo (A → B → C…).
      </p>

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

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <button onClick={() => onBuild(days, false)} disabled={!valid || aiBusy}
          style={{ background: valid && !aiBusy ? C.amber : C.card, color: valid && !aiBusy ? C.bg : C.mut2, ...display }}
          className="flex-1 rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2">
          <Dumbbell size={18} /> Montar sem IA
        </button>
        <button onClick={() => onBuild(days, true)} disabled={!valid || aiBusy}
          style={{ background: valid ? C.indigo : C.card, color: valid ? "#fff" : C.mut2, ...display }}
          className="flex-1 rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2">
          {aiBusy ? <Loader2 size={18} className="an-spin" /> : <Sparkles size={18} />} {aiBusy ? "Gerando…" : "Montar com IA"}
        </button>
      </div>
      <p style={{ color: C.mut2, ...body }} className="text-xs mt-3 leading-snug">
        <b style={{ color: C.mut }}>Sem IA</b>: o app escolhe os exercícios dos grupos marcados, respeitando sua preferência de equipamento e objetivo. <b style={{ color: C.mut }}>Com IA</b>: o coach distribui séries, repetições e descanso considerando também suas limitações.
        {totalGroups === 0 ? " Escolha ao menos um grupo para liberar os botões." : ""}
      </p>
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
  const submit = () => { const n = parseFloat(String(val).replace(",", ".")); if (!n || n < 25 || n > 350) return; addWeight(n); setVal(""); };
  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10">
      <h2 style={{ color: C.text, ...display }} className="text-xl lg:text-2xl font-bold mb-3">Sua evolução</h2>
      <div className="grid grid-cols-3 gap-2 mb-3 lg:max-w-2xl">
        <Stat label="Peso atual" value={last != null ? `${last}kg` : "—"} color={C.text} />
        <Stat label="Variação" value={`${diff > 0 ? "+" : ""}${diff}kg`} color={diff <= 0 ? C.mint : C.amber} />
        <Stat label="Treinos feitos" value={tracking.history.length} color={C.amber} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1fr)_2fr] items-start">
      <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-4">
        <p style={{ color: C.text, ...body }} className="text-sm font-semibold mb-2 flex items-center gap-1"><Scale size={16} style={{ color: C.amber }} /> Registrar peso de hoje</p>
        <div className="flex gap-2">
          <input value={val} onChange={(e) => setVal(e.target.value)} inputMode="decimal" placeholder="ex.: 82.5" style={{ background: C.bg, color: C.text, border: `1px solid ${C.line}`, ...body }} className="flex-1 min-w-0 rounded-xl px-3 py-2.5 outline-none" />
          <button onClick={submit} style={{ background: C.amber, color: C.bg, ...display }} className="rounded-xl px-5 font-bold flex items-center gap-1"><Plus size={18} /> Salvar</button>
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
    </div>
  );
}
function Stat({ label, value, color }) {
  return <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-3 text-center"><p style={{ color, ...display }} className="text-lg font-bold leading-none">{value}</p><p style={{ color: C.mut2, ...body }} className="text-[10px] mt-1 leading-tight">{label}</p></div>;
}

/* ============================== TELA: COACH ============================== */
function CoachScreen({ profile, chat, setChat }) {
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
      const ctx = `Contexto: objetivo=${profile.goal}, nível=${profile.level}, peso=${profile.weight}kg, meta=${profile.goalWeight}kg, altura=${profile.height}cm, limitações="${profile.limits || "nenhuma"}".`;
      const msgs = next.map((m) => ({ role: m.role, content: m.content }));
      msgs[msgs.length - 1] = { role: "user", content: `${ctx}\n\nPergunta: ${text}` };
      const reply = await callClaude(msgs, COACH_SYSTEM);
      setChat([...next, { role: "assistant", content: reply || "Desculpe, não consegui responder agora." }]);
    } catch { setChat([...next, { role: "assistant", content: "Não consegui me conectar agora. Tente novamente." }]); }
    finally { setBusy(false); }
  };
  const presets = ["Como melhorar minha técnica no agachamento?", "O que comer antes de treinar?", "Estou com dor no ombro, o que faço?"];
  return (
    <div className="pb-[calc(10rem+env(safe-area-inset-bottom))] lg:pb-24 flex flex-col lg:max-w-3xl" style={{ minHeight: "70vh" }}>
      <div className="flex items-center gap-2 mb-3">
        <div style={{ background: C.indigo }} className="rounded-xl w-9 h-9 flex items-center justify-center"><Sparkles size={18} color="#fff" /></div>
        <div><h2 style={{ color: C.text, ...display }} className="text-lg font-bold leading-none">Coach IA</h2><p style={{ color: C.mut, ...body }} className="text-xs">Dúvidas de treino, técnica e alimentação</p></div>
      </div>
      <div className="flex-1 space-y-3">
        {chat.length === 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-4">
            <p style={{ color: C.text, ...body }} className="text-sm leading-relaxed">Olá! Sou seu coach. Posso ajudar com execução de exercícios, ajustes no treino e alimentação geral.</p>
            <div className="space-y-2 mt-3">{presets.map((p) => <button key={p} onClick={() => send(p)} style={{ background: C.bg2, color: C.amberSoft, border: `1px solid ${C.line}`, ...body }} className="w-full text-left rounded-xl px-3 py-2 text-sm">{p}</button>)}</div>
          </div>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div style={{ background: m.role === "user" ? C.amber : C.card, color: m.role === "user" ? C.bg : C.text, border: m.role === "user" ? "none" : `1px solid ${C.line}`, ...body }} className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><div style={{ background: C.card, border: `1px solid ${C.line}`, color: C.mut }} className="rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2"><Loader2 size={14} className="an-spin" /> digitando...</div></div>}
        <div ref={endRef} />
      </div>
      <div style={{ background: C.bg }} className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] lg:bottom-0 left-0 lg:left-64 right-0 px-4 lg:px-8 pb-2 lg:pb-5 pt-2 z-30">
        <div className="mx-auto lg:mx-0 max-w-[480px] md:max-w-[720px] lg:max-w-3xl flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escreva sua dúvida..." style={{ background: C.card, color: C.text, border: `1px solid ${C.line}`, ...body }} className="flex-1 rounded-xl px-4 py-3 outline-none text-sm" />
          <button onClick={() => send()} disabled={busy} style={{ background: C.indigo }} className="rounded-xl w-12 flex items-center justify-center"><Send size={18} color="#fff" /></button>
        </div>
      </div>
    </div>
  );
}

/* ============================== ONBOARDING ============================== */
function SetupSeg({ field, options, p, set }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => { const on = p[field] === o.v; return <button key={o.v} onClick={() => set(field, o.v)} style={{ background: on ? C.amber : C.card, color: on ? C.bg : C.mut, border: `1px solid ${on ? C.amber : C.line}`, ...body }} className="rounded-xl py-2.5 text-xs font-semibold">{o.l}</button>; })}
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
function Setup({ onDone, initial }) {
  const [p, setP] = useState(initial || { name: "", sex: "masc", age: "", height: "", weight: "", goalWeight: "", bodyNow: "magro", bodyGoal: "definido", level: "iniciante", goal: "hipertrofia", equip: "ambos", limits: "" });
  const set = (k, v) => setP((s) => ({ ...s, [k]: v }));
  const valid = p.name && p.height && p.weight;
  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 24px)" }} className="px-4">
      <div className="mx-auto max-w-[480px] md:max-w-[560px]">
        <div className="flex items-center gap-2 mb-1"><div style={{ background: C.amber }} className="rounded-xl w-10 h-10 flex items-center justify-center"><Dumbbell size={22} color={C.bg} /></div><h1 style={{ color: C.text, ...display }} className="text-2xl font-bold">TreinoCerto</h1></div>
        <p style={{ color: C.mut, ...body }} className="text-sm mb-5">Vamos montar seu plano. Leva 1 minuto.</p>
        <div className="space-y-4">
          <SetupField p={p} set={set} label="Como te chamamos?" k="name" ph="seu nome" />
          <div className="grid grid-cols-3 gap-2">
            <SetupField p={p} set={set} label="Idade" k="age" ph="30" unit="anos" />
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
          <button onClick={() => onDone({ ...p, age: +p.age || 0, height: +p.height || 0, weight: +p.weight || 0, goalWeight: +p.goalWeight || 0 })} disabled={!valid} style={{ background: valid ? C.amber : C.card, color: valid ? C.bg : C.mut2, ...display }} className="w-full rounded-2xl py-4 font-bold text-base mt-2">Montar meu plano</button>
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
  const buildFromConfig = async (daysConfig, useAI) => {
    if (!profile) return false;
    const clean = (daysConfig || [])
      .map((d) => ({ name: (d.name || "").trim(), groups: (d.groups || []).filter((g) => GROUP_ORDER.includes(g)) }))
      .filter((d) => d.groups.length);
    if (!clean.length) { showToast("Escolha ao menos um grupo para montar o plano."); return false; }

    if (!useAI) {
      const plan = buildCustomPlan(profile, clean);
      if (!plan) { showToast("Não encontrei exercícios para esses grupos."); return false; }
      setPlan(plan); setSession({ sets: {} }); showToast("Plano montado!");
      return true;
    }

    setAiBusy(true);
    try {
      const allowed = LIB.map((e) => `${e.id}(${e.group},${e.equip})`).join("; ");
      const daysSpec = clean.map((d, i) => `${dayLetter(i)}${d.name ? ` "${d.name}"` : ""}: grupos=${d.groups.join(",")}`).join(" | ");
      const sys = "Você monta treinos. Responda APENAS com JSON válido, sem markdown.";
      const prompt = `Monte um plano RESPEITANDO EXATAMENTE os dias e grupos que o usuário escolheu. Dias: ${daysSpec}. Em cada dia use SOMENTE exercícios dos grupos daquele dia. Perfil: objetivo=${profile.goal}, nível=${profile.level}, equip preferido=${profile.equip}, peso=${profile.weight}kg, meta=${profile.goalWeight}kg, limitações="${profile.limits || "nenhuma"}". Use SOMENTE estes ids (refId), com seus grupos entre parênteses: ${allowed}. Respeite limitações. 4 a 6 exercícios por dia. Formato: {"days":[{"id":"A","name":"...","exercises":[{"refId":"...","sets":4,"reps":"10-12","rest":75}]}]}. Só o JSON.`;
      const raw = await callClaude([{ role: "user", content: prompt }], sys);
      const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
      const days = (json.days || []).map((d, i) => ({
        id: dayLetter(i),
        name: (d.name || "").trim() || autoDayName(clean[i]?.groups) || `Treino ${dayLetter(i)}`,
        exercises: (d.exercises || []).filter((e) => LIB_BY_ID[e.refId]).map((e) => {
          const b = makeExercise(LIB_BY_ID[e.refId], profile.goal);
          return { ...b, sets: e.sets || b.sets, reps: e.reps || b.reps, rest: e.rest || b.rest };
        }),
      })).filter((d) => d.exercises.length);
      if (!days.length) throw new Error("vazio");
      setPlan({ splitName: days.map((d) => d.id).join(""), days, cycleIndex: 0, source: "ai" });
      setSession({ sets: {} }); showToast("Plano personalizado pela IA!");
      return true;
    } catch {
      // Fallback: monta sem IA com os mesmos grupos, em vez de deixar o usuário na mão.
      const plan = buildCustomPlan(profile, clean);
      if (plan) { setPlan(plan); setSession({ sets: {} }); showToast("IA indisponível — montei com os grupos que você escolheu."); return true; }
      showToast("Não consegui gerar o plano agora."); return false;
    } finally { setAiBusy(false); }
  };

  if (!ready) return <div style={{ background: C.bg, minHeight: "100vh" }} className="flex items-center justify-center"><Loader2 className="an-spin" color={C.amber} size={32} /></div>;
  if (!profile || !plan) return <><Styles /><Setup onDone={finishSetup} /></>;

  const tabs = [{ k: "today", icon: Flame, label: "Hoje" }, { k: "plan", icon: Calendar, label: "Plano" }, { k: "progress", icon: LineIcon, label: "Evolução" }, { k: "coach", icon: MessageCircle, label: "Coach" }];
  const firstName = profile.name.split(" ")[0];

  return (
    <BodySexContext.Provider value={profile.sex}>
    <div style={{ background: C.bg, minHeight: "100vh", ...body }} className="overflow-x-clip">
      <Styles />

      {/* Menu lateral (computador) */}
      <aside style={{ background: C.bg2, borderRight: `1px solid ${C.line}` }} className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-40 flex-col p-5">
        <div className="flex items-center gap-2.5 mb-8">
          <div style={{ background: C.amber }} className="rounded-xl w-10 h-10 flex items-center justify-center"><Dumbbell size={22} color={C.bg} /></div>
          <span style={{ color: C.text, ...display }} className="text-xl font-bold">TreinoCerto</span>
        </div>
        <nav className="space-y-1">
          {[...tabs, { k: "settings", icon: User, label: "Perfil" }].map((t) => {
            const on = tab === t.k; const Icon = t.icon;
            return (
              <button key={t.k} onClick={() => setTab(t.k)} style={{ background: on ? "rgba(255,138,61,.12)" : "transparent", color: on ? C.amber : C.mut, ...body }}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold flex items-center gap-3 text-left">
                <Icon size={19} /> {t.label}
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
        </div>
      </aside>

      <div className="lg:pl-64">
      {/* Topo (celular/tablet) */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.line}`, paddingTop: "calc(env(safe-area-inset-top) + 12px)" }} className="lg:hidden sticky top-0 z-40 px-4 pb-3">
        <div className="mx-auto max-w-[480px] md:max-w-[720px] flex items-center justify-between">
          <div className="flex items-center gap-2"><div style={{ background: C.amber }} className="rounded-lg w-8 h-8 flex items-center justify-center"><Dumbbell size={18} color={C.bg} /></div><span style={{ color: C.text, ...display }} className="font-bold">Olá, {firstName}</span></div>
          <button onClick={() => setTab("settings")} style={{ color: tab === "settings" ? C.amber : C.mut }} aria-label="Perfil"><User size={20} /></button>
        </div>
      </div>
      <div className="mx-auto px-4 py-4 max-w-[480px] md:max-w-[720px] lg:max-w-[1180px] lg:px-8 lg:py-8">
        <p style={{ color: C.mut, ...body }} className="hidden lg:block text-sm mb-1">Olá, {firstName} 👋</p>
        {tab === "today" && <TodayScreen profile={profile} plan={plan} setPlan={setPlan} session={session} setSession={setSession} tracking={tracking} onComplete={completeDay} />}
        {tab === "plan" && <PlanScreen profile={profile} plan={plan} setPlan={setPlan} session={session} setSession={setSession} buildFromConfig={buildFromConfig} aiBusy={aiBusy} tracking={tracking} goToday={() => { setTab("today"); window.scrollTo({ top: 0 }); }} />}
        {tab === "progress" && <ProgressScreen profile={profile} tracking={tracking} addWeight={(w) => { addWeight(w); showToast("Peso registrado!"); }} />}
        {tab === "coach" && <CoachScreen profile={profile} chat={chat} setChat={setChat} />}
        {tab === "settings" && <SettingsScreen profile={profile} setProfile={setProfile} setPlan={setPlan} showToast={showToast} onReset={async () => { setProfile(null); setPlan(null); setTracking({ weightLog: [], history: [] }); setSession({ sets: {} }); setChat([]); await patchState({ profile: null, plan: null, tracking: { weightLog: [], history: [] }, session: { sets: {} }, chat: [] }); }} onSignOut={async () => { await signOut(); window.location.reload(); }} />}
      </div>
      </div>
      <div style={{ background: C.bg2, borderTop: `1px solid ${C.line}`, paddingBottom: "env(safe-area-inset-bottom)" }} className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-[480px] md:max-w-[720px] grid grid-cols-4">
          {tabs.map((t) => { const on = tab === t.k; const Icon = t.icon; return <button key={t.k} onClick={() => setTab(t.k)} className="py-2.5 flex flex-col items-center gap-0.5"><Icon size={22} color={on ? C.amber : C.mut2} /><span style={{ color: on ? C.amber : C.mut2, ...body }} className="text-[10px] font-semibold">{t.label}</span></button>; })}
        </div>
      </div>
      {weighIn && <WeighInModal nextDay={weighIn.next} onSave={closeWeighIn} onSkip={() => closeWeighIn(null)} />}
      {toast && <div style={{ background: C.mintDim, border: `1px solid ${C.mint}`, color: C.mint, maxWidth: 440 }} className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-8 left-1/2 lg:left-[calc(50%+8rem)] -translate-x-1/2 z-50 rounded-2xl px-4 py-3 text-sm font-semibold text-center mx-4 an-toast">{toast}</div>}
    </div>
    </BodySexContext.Provider>
  );
}

function SettingsScreen({ profile, onReset, onSignOut, setProfile, setPlan, showToast }) {
  const [editing, setEditing] = useState(false);
  if (editing) return <Setup initial={profile} onDone={(pp) => { const np = { ...pp, age: +pp.age || 0, height: +pp.height || 0, weight: +pp.weight || 0, goalWeight: +pp.goalWeight || 0 }; setProfile(np); setPlan(buildPlan(np)); setEditing(false); showToast("Perfil e plano atualizados!"); }} />;
  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-xl">
      <h2 style={{ color: C.text, ...display }} className="text-xl lg:text-2xl font-bold mb-3">Perfil</h2>
      <div style={{ background: C.card, border: `1px solid ${C.line}` }} className="rounded-2xl p-4 space-y-2">
        <Row k="Nome" v={profile.name} />
        <Row k="Idade / Altura / Peso" v={`${profile.age || "—"} anos · ${profile.height}cm · ${profile.weight}kg`} />
        <Row k="Meta de peso" v={`${profile.goalWeight || "—"}kg`} />
        <Row k="Objetivo / Nível" v={`${profile.goal} · ${profile.level}`} />
        <Row k="Equipamento" v={profile.equip || "ambos"} />
        <Row k="Limitações" v={profile.limits || "nenhuma"} />
      </div>
      <button onClick={() => setEditing(true)} style={{ background: C.amber, color: C.bg, ...display }} className="w-full rounded-2xl py-3 mt-3 font-bold">Editar e refazer plano</button>
      <button onClick={onSignOut} style={{ background: C.card, color: C.text, border: `1px solid ${C.line}`, ...body }} className="w-full rounded-2xl py-3 mt-2 font-semibold flex items-center justify-center gap-2"><LogOut size={16} /> Sair da conta</button>
      <button onClick={onReset} style={{ background: C.card, color: C.red, border: `1px solid ${C.line}`, ...body }} className="w-full rounded-2xl py-3 mt-2 font-semibold flex items-center justify-center gap-2"><RotateCcw size={16} /> Apagar tudo e recomeçar</button>
    </div>
  );
}
function Row({ k, v }) { return <div className="flex justify-between gap-3"><span style={{ color: C.mut, ...body }} className="text-sm">{k}</span><span style={{ color: C.text, ...body }} className="text-sm font-semibold text-right">{v}</span></div>; }
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
