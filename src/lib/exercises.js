// Biblioteca de exercícios e lógica de montagem de plano (sem dependência de React).

export const LIB = [
  // ---- PEITO (pattern: supino / crucifixo) ----
  { id: "supino_maquina", name: "Supino reto na máquina", muscle: "Peitoral", group: "peito", pattern: "supino", equip: "maquina", machine: "Máquina de supino", anim: "press", body: { side: "front", key: "peito" }, reps: "10-12", instr: ["Ajuste o banco para as alças ficarem na linha do peito.", "Empurre para a frente estendendo os cotovelos sem travar.", "Volte controlando até sentir o peito alongar."], cue: "Escápulas apoiadas, cotovelos a ~45° do tronco." },
  { id: "supino_barra", name: "Supino reto com barra", muscle: "Peitoral", group: "peito", pattern: "supino", equip: "livre", machine: "Banco + barra olímpica", anim: "bench", body: { side: "front", key: "peito" }, reps: "8-12", instr: ["Deite com os pés firmes no chão.", "Pegada um pouco mais larga que os ombros.", "Desça a barra até a linha do meio do peito.", "Empurre para cima sem travar os cotovelos."], cue: "Cotovelos a ~45°, escápulas retraídas, lombar neutra." },
  { id: "supino_halter", name: "Supino com halteres", muscle: "Peitoral", group: "peito", pattern: "supino", equip: "livre", machine: "Banco + halteres", anim: "bench", body: { side: "front", key: "peito" }, reps: "8-12", instr: ["Um halter em cada mão sobre o peito.", "Desça alinhando com o peito.", "Suba juntando levemente no topo."], cue: "Punhos neutros, ombros para baixo." },
  { id: "crucifixo_maq", name: "Crucifixo na máquina (peck deck)", muscle: "Peitoral", group: "peito", pattern: "crucifixo", equip: "maquina", machine: "Peck deck", anim: "fly", body: { side: "front", key: "peito" }, reps: "10-15", instr: ["Braços na altura do peito.", "Junte à frente sem dobrar muito o cotovelo.", "Volte devagar."], cue: "Movimento de abraço, cotovelos fixos." },
  { id: "crucifixo_cabo", name: "Crucifixo na polia (crossover)", muscle: "Peitoral", group: "peito", pattern: "crucifixo", equip: "cabo", machine: "Polias altas", anim: "fly", body: { side: "front", key: "peito" }, reps: "12-15", instr: ["Polias acima da cabeça.", "Cruze as mãos à frente do quadril.", "Volte controlando."], cue: "Tronco levemente inclinado, peito aberto." },
  { id: "flexao", name: "Flexão de braço", muscle: "Peitoral", group: "peito", pattern: "supino", equip: "corpo", machine: "Peso do corpo", anim: "pushup", body: { side: "front", key: "peito" }, reps: "10-20", instr: ["Mãos um pouco mais largas que o ombro.", "Corpo reto da cabeça aos pés.", "Desça até quase tocar o chão e empurre."], cue: "Não deixe o quadril cair." },
  // ---- COSTAS (pattern: puxada / remada) ----
  { id: "remada_maquina", name: "Remada na máquina", muscle: "Dorsais", group: "costas", pattern: "remada", equip: "maquina", machine: "Máquina de remada", anim: "row", body: { side: "back", key: "lats" }, reps: "10-12", instr: ["Peito apoiado, pegue os pegadores.", "Puxe levando os cotovelos para trás.", "Aperte as escápulas e volte controlando."], cue: "Não use impulso; cotovelos rentes ao corpo." },
  { id: "puxada_aberta", name: "Puxada frontal aberta", muscle: "Dorsais", group: "costas", pattern: "puxada", equip: "maquina", machine: "Polia alta (barra)", anim: "pulldown", body: { side: "back", key: "lats" }, reps: "10-12", instr: ["Joelhos presos sob o apoio.", "Pegada aberta na barra.", "Puxe até a parte alta do peito.", "Suba controlando."], cue: "Puxe com os cotovelos, peito aberto." },
  { id: "puxada_neutra", name: "Puxada pegada neutra", muscle: "Dorsais", group: "costas", pattern: "puxada", equip: "maquina", machine: "Polia alta (triângulo)", anim: "pulldown", body: { side: "back", key: "lats" }, reps: "10-12", instr: ["Use o pegador em V.", "Puxe até o peito.", "Controle a volta."], cue: "Boa opção se a puxada aberta incomodar o ombro." },
  { id: "remada_sentada", name: "Remada sentada (polia baixa)", muscle: "Dorsais", group: "costas", pattern: "remada", equip: "cabo", machine: "Polia baixa + triângulo", anim: "row", body: { side: "back", key: "lats" }, reps: "10-12", instr: ["Joelhos levemente flexionados.", "Puxe o triângulo ao abdômen.", "Aperte as escápulas e volte."], cue: "Tronco firme, evite balançar." },
  { id: "remada_curvada", name: "Remada curvada com barra", muscle: "Dorsais", group: "costas", pattern: "remada", equip: "livre", machine: "Barra", anim: "row", body: { side: "back", key: "lats" }, reps: "8-12", instr: ["Tronco inclinado ~45°, coluna reta.", "Puxe a barra ao umbigo.", "Desça controlando."], cue: "Não arredonde as costas, joelhos semiflexionados." },
  { id: "remada_serrote", name: "Remada serrote (halter)", muscle: "Dorsais", group: "costas", pattern: "remada", equip: "livre", machine: "Halter + banco", anim: "row", body: { side: "back", key: "lats" }, reps: "10-12 cada", instr: ["Apoie um joelho e a mão no banco.", "Puxe o halter ao lado do tronco.", "Desça controlando e troque o lado."], cue: "Coluna neutra, cotovelo junto ao corpo." },
  // ---- OMBRO (pattern: desenvolvimento / elevacao_lateral) ----
  { id: "desenvolvimento_maquina", name: "Desenvolvimento na máquina", muscle: "Deltoides", group: "ombro", pattern: "desenvolvimento", equip: "maquina", machine: "Máquina de ombros", anim: "press", body: { side: "front", key: "delts" }, reps: "10-12", instr: ["Pegadores na altura dos ombros.", "Empurre para cima sem travar.", "Volte controlando."], cue: "Boa opção se sentir instabilidade com halteres." },
  { id: "desenvolvimento_halter", name: "Desenvolvimento com halteres", muscle: "Deltoides", group: "ombro", pattern: "desenvolvimento", equip: "livre", machine: "Banco + halteres", anim: "press", body: { side: "front", key: "delts" }, reps: "10-12", instr: ["Halteres na altura das orelhas.", "Empurre para cima.", "Desça controlando."], cue: "Não arqueie demais a lombar." },
  { id: "elevacao_lateral", name: "Elevação lateral", muscle: "Deltoide lateral", group: "ombro", pattern: "elevacao_lateral", equip: "livre", machine: "Halteres", anim: "lateral", body: { side: "front", key: "delts" }, reps: "12-15", instr: ["Halteres ao lado do corpo.", "Eleve até a linha dos ombros.", "Desça devagar."], cue: "Lidere com os cotovelos, leve flexão." },
  { id: "elevacao_lateral_cabo", name: "Elevação lateral na polia", muscle: "Deltoide lateral", group: "ombro", pattern: "elevacao_lateral", equip: "cabo", machine: "Polia baixa", anim: "lateral", body: { side: "front", key: "delts" }, reps: "12-15", instr: ["Cabo passando atrás do corpo.", "Eleve o braço até a linha do ombro.", "Volte controlando."], cue: "Tensão constante; ótimo para o deltoide lateral." },
  // ---- BÍCEPS (pattern: rosca) ----
  { id: "rosca_scott", name: "Rosca Scott na máquina", muscle: "Bíceps", group: "biceps", pattern: "rosca", equip: "maquina", machine: "Máquina Scott", anim: "curl", body: { side: "front", key: "biceps" }, reps: "10-12", instr: ["Braços apoiados no banco inclinado.", "Suba o peso flexionando.", "Desça até quase estender."], cue: "Não solte de uma vez na descida." },
  { id: "rosca_direta", name: "Rosca direta com barra", muscle: "Bíceps", group: "biceps", pattern: "rosca", equip: "livre", machine: "Barra W", anim: "curl", body: { side: "front", key: "biceps" }, reps: "10-12", instr: ["Cotovelos junto ao corpo.", "Suba flexionando.", "Desça controlando totalmente."], cue: "Não balance o tronco." },
  { id: "rosca_alternada", name: "Rosca alternada", muscle: "Bíceps", group: "biceps", pattern: "rosca", equip: "livre", machine: "Halteres", anim: "curl", body: { side: "front", key: "biceps" }, reps: "10-12 cada", instr: ["Suba um braço de cada vez.", "Gire o punho ao subir.", "Desça e troque."], cue: "Controle a fase negativa." },
  { id: "rosca_cabo", name: "Rosca na polia", muscle: "Bíceps", group: "biceps", pattern: "rosca", equip: "cabo", machine: "Polia baixa + barra", anim: "curl", body: { side: "front", key: "biceps" }, reps: "12-15", instr: ["Cabo na polia baixa.", "Flexione mantendo cotovelos fixos.", "Volte controlando."], cue: "Tensão constante do começo ao fim." },
  // ---- TRÍCEPS (pattern: triceps_ext) ----
  { id: "triceps_maquina", name: "Tríceps na máquina", muscle: "Tríceps", group: "triceps", pattern: "triceps_ext", equip: "maquina", machine: "Máquina de tríceps", anim: "pushdown", body: { side: "back", key: "triceps" }, reps: "10-12", instr: ["Ajuste o banco e os pegadores.", "Estenda os braços.", "Volte controlando."], cue: "Só o antebraço se move." },
  { id: "triceps_pulley", name: "Tríceps na polia (corda)", muscle: "Tríceps", group: "triceps", pattern: "triceps_ext", equip: "cabo", machine: "Polia alta + corda", anim: "pushdown", body: { side: "back", key: "triceps" }, reps: "12-15", instr: ["Cotovelos colados ao corpo.", "Estenda para baixo e abra a corda no fim.", "Suba controlando."], cue: "Cotovelos fixos." },
  { id: "triceps_testa", name: "Tríceps testa", muscle: "Tríceps", group: "triceps", pattern: "triceps_ext", equip: "livre", machine: "Barra W + banco", anim: "pushdown", body: { side: "back", key: "triceps" }, reps: "10-12", instr: ["Deitado, barra acima da testa.", "Flexione levando à testa.", "Estenda de volta."], cue: "Cotovelos apontando ao teto, parados." },
  // ---- PERNAS / QUADRÍCEPS (pattern: agachamento / extensora) ----
  { id: "leg_press", name: "Leg press 45°", muscle: "Quadríceps/Glúteo", group: "pernas", pattern: "agachamento", equip: "maquina", machine: "Leg press 45°", anim: "legpress", body: { side: "front", key: "quads" }, reps: "10-15", instr: ["Pés na largura dos ombros.", "Desça flexionando até ~90°.", "Empurre sem travar os joelhos."], cue: "Quadril sempre apoiado no encosto." },
  { id: "agachamento", name: "Agachamento livre com barra", muscle: "Quadríceps/Glúteo", group: "pernas", pattern: "agachamento", equip: "livre", machine: "Barra + suporte", anim: "squat", body: { side: "front", key: "quads" }, reps: "8-12", instr: ["Barra no trapézio, pés na largura dos ombros.", "Empurre o quadril para trás e desça.", "Vá até as coxas paralelas e suba."], cue: "Joelhos seguem a ponta dos pés, peito erguido." },
  { id: "hack", name: "Agachamento hack", muscle: "Quadríceps", group: "pernas", pattern: "agachamento", equip: "maquina", machine: "Máquina hack", anim: "legpress", body: { side: "front", key: "quads" }, reps: "10-12", instr: ["Costas no apoio, ombros sob as almofadas.", "Desça flexionando os joelhos.", "Empurre de volta."], cue: "Pés mais à frente poupam o joelho." },
  { id: "cadeira_extensora", name: "Cadeira extensora", muscle: "Quadríceps", group: "pernas", pattern: "extensora", equip: "maquina", machine: "Cadeira extensora", anim: "legext", body: { side: "front", key: "quads" }, reps: "12-15", instr: ["Apoio acima do tornozelo.", "Estenda até quase travar.", "Desça devagar."], cue: "Pausa de 1s no topo." },
  { id: "afundo", name: "Avanço (afundo) com halteres", muscle: "Quadríceps/Glúteo", group: "pernas", pattern: "agachamento", equip: "livre", machine: "Halteres", anim: "lunge", body: { side: "front", key: "quads" }, reps: "10-12 cada", instr: ["Passo à frente.", "Desça até o joelho de trás quase tocar.", "Volte empurrando com o calcanhar da frente."], cue: "Joelho alinhado ao pé, tronco ereto." },
  // ---- POSTERIOR DE COXA (pattern: flexora) ----
  { id: "cadeira_flexora", name: "Mesa flexora", muscle: "Posterior de coxa", group: "pernas", pattern: "flexora", equip: "maquina", machine: "Mesa flexora", anim: "legext", body: { side: "back", key: "hams" }, reps: "12-15", instr: ["Apoio sobre o tendão de Aquiles.", "Traga o calcanhar ao glúteo.", "Volte controlando."], cue: "Quadril apoiado, sem levantar a bacia." },
  { id: "stiff", name: "Stiff com barra", muscle: "Posterior de coxa", group: "pernas", pattern: "flexora", equip: "livre", machine: "Barra", anim: "row", body: { side: "back", key: "hams" }, reps: "10-12", instr: ["Joelhos levemente flexionados.", "Desça a barra rente às pernas empurrando o quadril atrás.", "Suba contraindo o posterior."], cue: "Coluna reta; sinta o alongamento atrás da coxa." },
  // ---- GLÚTEO (pattern: hip / abducao) ----
  { id: "gluteo_maquina", name: "Glúteo na máquina (coice)", muscle: "Glúteo", group: "gluteo", pattern: "hip", equip: "maquina", machine: "Máquina de glúteo", anim: "abduction", body: { side: "back", key: "glutes" }, reps: "12-15 cada", instr: ["Apoie o pé na plataforma.", "Empurre para trás contraindo o glúteo.", "Volte controlando."], cue: "Evite arquear a lombar; foco no glúteo." },
  { id: "elevacao_pelvica", name: "Elevação pélvica (hip thrust)", muscle: "Glúteo", group: "gluteo", pattern: "hip", equip: "livre", machine: "Banco + barra/anilha", anim: "hipthrust", body: { side: "back", key: "glutes" }, reps: "10-15", instr: ["Costas no banco, peso sobre o quadril.", "Suba até o corpo ficar reto.", "Aperte o glúteo 1s e desça."], cue: "Empurre pelos calcanhares, queixo levemente para baixo." },
  { id: "cadeira_abdutora", name: "Cadeira abdutora", muscle: "Glúteo médio", group: "gluteo", pattern: "abducao", equip: "maquina", machine: "Cadeira abdutora", anim: "abduction", body: { side: "back", key: "glutes" }, reps: "15-20", instr: ["Joelhos contra os apoios.", "Abra as pernas até o limite confortável.", "Volte devagar."], cue: "Incline o tronco à frente para focar o glúteo." },
  // ---- CORE ----
  { id: "abdominal_maquina", name: "Abdominal na máquina", muscle: "Core", group: "core", pattern: "core", equip: "maquina", machine: "Máquina de abdominal", anim: "crunch", body: { side: "front", key: "abs" }, reps: "12-15", instr: ["Ajuste o apoio no peito.", "Flexione o tronco contraindo o abdômen.", "Volte controlando."], cue: "Movimento curto e controlado." },
  { id: "prancha", name: "Prancha", muscle: "Core", group: "core", pattern: "core", equip: "corpo", machine: "Peso do corpo", anim: "plank", body: { side: "front", key: "abs" }, reps: "30-45s", instr: ["Apoie antebraços e pontas dos pés.", "Corpo reto e firme.", "Segure o tempo."], cue: "Contraia abdômen e glúteo, quadril nivelado." },
  { id: "abdominal_supra", name: "Abdominal supra", muscle: "Core", group: "core", pattern: "core", equip: "corpo", machine: "Colchonete", anim: "crunch", body: { side: "front", key: "abs" }, reps: "15-20", instr: ["Joelhos flexionados.", "Eleve o tronco contraindo.", "Desça devagar."], cue: "Não puxe o pescoço com as mãos." },
  // ---- CARDIO ----
  { id: "esteira", name: "Esteira", muscle: "Cardiovascular", group: "cardio", pattern: "cardio", equip: "maquina", machine: "Esteira", anim: "run", body: { side: "front", key: "full" }, reps: "15-25 min", instr: ["Aquecimento leve.", "Mantenha ritmo levemente ofegante.", "Desacelere no fim."], cue: "Postura ereta, passada confortável." },
  { id: "bike", name: "Bicicleta ergométrica", muscle: "Cardiovascular", group: "cardio", pattern: "cardio", equip: "maquina", machine: "Bike ergométrica", anim: "run", body: { side: "front", key: "full" }, reps: "15-25 min", instr: ["Banco na altura do quadril.", "Pedale em ritmo constante."], cue: "Joelho não trava embaixo; baixo impacto." },
];
export const LIB_BY_ID = Object.fromEntries(LIB.map((e) => [e.id, e]));
export const byGroup = (g) => LIB.filter((e) => e.group === g);
export const byPattern = (p) => LIB.filter((e) => e.pattern === p);

/* ====================== MONTAGEM DO PLANO ====================== */
export function restFor(goal, group) {
  if (group === "cardio") return 60;
  if (goal === "emagrecer") return 45;
  if (goal === "forca") return 120;
  return 75;
}
export function prefMatch(e, pref) {
  if (!pref || pref === "ambos") return true;
  if (pref === "maquina") return e.equip === "maquina";
  if (pref === "livre") return e.equip === "livre" || e.equip === "corpo";
  return true;
}
export function pick(group, n, used, pref) {
  let opts = byGroup(group).filter((e) => !used.has(e.id) && !used.has(e.pattern));
  let pref1 = opts.filter((e) => prefMatch(e, pref));
  const ordered = [...pref1, ...opts.filter((e) => !pref1.includes(e))];
  const out = [];
  for (const e of ordered) {
    if (out.length >= n) break;
    out.push(e); used.add(e.id); used.add(e.pattern);
  }
  return out;
}
export function makeExercise(li, goal) {
  return {
    refId: li.id, name: li.name, muscle: li.muscle, group: li.group,
    pattern: li.pattern, equip: li.equip, machine: li.machine, anim: li.anim,
    body: li.body, instr: li.instr, cue: li.cue,
    sets: li.group === "cardio" || li.group === "core" ? 3 : (goal === "emagrecer" ? 3 : 4),
    reps: li.reps, rest: restFor(goal, li.group),
  };
}
export function buildPlan(profile) {
  const { goal, level, equip: pref } = profile;
  let dayDefs;
  if (level === "iniciante") {
    dayDefs = [
      { id: "A", name: "Corpo inteiro A", g: [["peito", 1], ["costas", 1], ["pernas", 1], ["ombro", 1], ["core", 1]] },
      { id: "B", name: "Corpo inteiro B", g: [["pernas", 1], ["gluteo", 1], ["costas", 1], ["biceps", 1], ["triceps", 1]] },
    ];
  } else if (level === "avancado") {
    dayDefs = [
      { id: "A", name: "Peito e Tríceps", g: [["peito", 3], ["triceps", 2]] },
      { id: "B", name: "Costas e Bíceps", g: [["costas", 3], ["biceps", 2]] },
      { id: "C", name: "Pernas e Glúteo", g: [["pernas", 3], ["gluteo", 2]] },
      { id: "D", name: "Ombro e Core", g: [["ombro", 3], ["core", 2]] },
    ];
  } else {
    dayDefs = [
      { id: "A", name: "Peito, Ombro e Tríceps", g: [["peito", 2], ["ombro", 2], ["triceps", 1]] },
      { id: "B", name: "Costas e Bíceps", g: [["costas", 3], ["biceps", 2]] },
      { id: "C", name: "Pernas, Glúteo e Core", g: [["pernas", 3], ["gluteo", 1], ["core", 1]] },
    ];
  }
  const days = dayDefs.map((d) => {
    const used = new Set();
    let ex = [];
    d.g.forEach(([g, n]) => { ex = ex.concat(pick(g, n, used, pref).map((li) => makeExercise(li, goal))); });
    if (goal === "emagrecer") ex.push(makeExercise(LIB_BY_ID.esteira, goal));
    return { id: d.id, name: d.name, exercises: ex };
  });
  return { splitName: days.map((d) => d.id).join(""), days, cycleIndex: 0, source: "base" };
}

