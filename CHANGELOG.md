# Changelog — TreinoCerto

Registro de versões. A versão exibida no app vem de `src/lib/version.js`.
Sempre que houver correção ou novidade, suba o número lá e adicione uma entrada aqui.

Padrão: `MAJOR.MINOR.PATCH` — PATCH = correção, MINOR = nova função, MAJOR = mudança grande.

## [1.4.4] — 2026-11-25

### Alterado

- Durante o treino, o botão inferior deixou de ser o desabilitado "Faltam X séries"
  e virou **"Concluir todas as séries"** (clicável): marca o treino inteiro e já
  libera o **Finalizar treino**.

## [1.4.3] — 2026-11-25

### Adicionado

- **Concluir todas as séries** de uma vez (menu ⋮ da lista de exercícios): marca o
  treino inteiro, preenchendo peso/reps sugeridos quando vazios — útil para finalizar
  sem marcar série por série. Também há **Limpar marcações** para desfazer.
- O mesmo menu ganhou atalho **Adicionar exercício**.

## [1.4.2] — 2026-11-25

### Alterado

- **Cronômetro do treino** só começa ao apertar **"Iniciar treino"** — antes ele
  disparava ao marcar a primeira série. Sem botão de parar: só inicia e o contador
  de duração passa a correr no topo.
- Revertida a cor do botão "Iniciar treino" (voltou ao padrão) — o ajuste pedido
  era de comportamento, não de cor.

## [1.4.1] — 2026-11-25

### Alterado

- Botão **"Iniciar treino"** agora em **verde** (destaque), deixando a ação de
  começar o treino mais clara na tela Hoje.

## [1.4.0] — 2026-11-25

### Adicionado

- **Séries ajustáveis no treino**: botões **− / + Série** em cada exercício (e no
  menu ⋮) para adicionar ou remover séries durante o treino — ex.: fez uma série a
  mais, ou só conseguiu uma/duas com carga maior.
- **Adicionar exercício** direto na tela "Hoje" (ação rápida → folha com grupos →
  escolhe e inclui no treino do dia).
- **Remover exercício** do treino de hoje (menu ⋮ do card; mantém ao menos 1).
- **Cardio sem séries/reps**: esteira, bike e corrida agora usam **Duração (min)** e
  **Distância (km)** com um botão de concluir, em vez de séries × repetições × peso.

> Reaplicado sobre a repaginação visual do v1.3.0.

## [1.3.0] — 2026-11-24

### Adicionado

- **Aba Exercícios** no menu: navega os **1.324 exercícios** do catálogo
  - **Por músculo** (19 grupos, com o boneco anatômico destacando o músculo);
  - **Equipamentos** (pesos livres, máquinas e polias, peso do corpo e acessórios);
  - **Do app**: os 38 exercícios da biblioteca, com passo a passo e última carga;
  - **busca** por nome, músculo ou equipamento e detalhe de cada exercício. Quando o
    exercício também está na biblioteca, abre o passo a passo em português.
- O catálogo carrega só ao abrir a aba (não pesa o resto do app). Nomes do catálogo
  seguem em inglês, como no dataset original.

### Corrigido

- **GIFs dos exercícios sumiam** quando `NEXT_PUBLIC_EXERCISE_MEDIA_BASE` apontava para
  uma pasta local vazia (GIFs não baixados): agora o app tenta o CDN como reserva antes
  de cair para o boneco anatômico. Vale para o treino e para a aba Exercícios.

## [1.2.0] — 2026-11-24

### Alterado

- **Repaginação visual** inspirada em apps de treino modernos, mantendo as cores do
  TreinoCerto (laranja + verde-menta sobre fundo escuro):
  - **Menu inferior flutuante** em pílula com 5 abas (Hoje, Plano, Evolução, Coach,
    Perfil) e destaque em cápsula na aba ativa; menu lateral do computador no mesmo estilo.
  - **Cabeçalho por tela** com ícone + título grande e botões redondos de ação; menus de
    **opções (⋮)** em popover em vez de botões soltos.
  - **Hoje**: seletor de treinos do ciclo (A/B/C), chips de resumo, cartões quadrados de
    músculos, exercícios com miniatura e "séries • reps • kg", ações rápidas em lista e
    botão flutuante **Iniciar / Finalizar treino**.
  - **Plano**: atalhos de personalização em cartões e treinos com lista de exercícios.
  - **Evolução**: semana com anel nos dias treinados, cartões de números e progresso semanal.
  - **Perfil**: números no topo e listas de ajustes ("Perfil e ajustes", "Treino", "Conta").
  - Rótulos em fonte condensada (Barlow Condensed), controles segmentados em pílula e
    folhas inferiores com alça.
- "Apagar tudo e recomeçar" agora pede confirmação.

## [1.1.0] — 2026-11-25

### Adicionado

- **Data de nascimento** no cadastro (calcula a idade automaticamente); editável no
  Perfil. Quem já tinha só a idade recebe uma data base estimada e ajustável.
- **Construtor de plano mais claro**: deixa explícito que cada cartão é um treino em
  **ciclo** (A → B → C…), com seletor de **dias por semana** e resumo de treinos/mês.
- **IA pergunta preferências** antes de montar o plano (foco, tempo por treino e
  objetivo) — não monta mais de forma aleatória.
- **Progressão de carga** configurável no Perfil (liga/desliga + incremento de
  1 / 2,5 / 5 kg): sugere evoluir o peso a cada treino, com etiqueta de meta no card.
- **Coach pode alterar o treino** pela conversa: propõe um plano e o usuário aplica
  com um toque (botão "Aplicar ao meu treino").
- **Peso se propaga pelas séries**: ao digitar na 1ª série, as próximas pegam o mesmo
  valor (cada série continua editável); o peso do dia anterior vira sugestão.
- **Carga inicial sugerida** por exercício, calculada por sexo, peso, altura e nível
  (valores conservadores e editáveis), para já ter um ponto de partida no 1º treino.
- **Evolução** passa a mostrar a **carga/volume levantado** por treino (último,
  recorde, total acumulado e gráfico de barras).
- **Número de versão** visível na tela principal.

## [1.0.0]

- Versão base: onboarding, plano, treino guiado, evolução (peso), coach de IA,
  camada Supabase (dados + auth + RLS), mídia com rollback (SVG/GIF) e PWA.
