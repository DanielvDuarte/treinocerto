# Changelog — TreinoCerto

Registro de versões. A versão exibida no app vem de `src/lib/version.js`.
Sempre que houver correção ou novidade, suba o número lá e adicione uma entrada aqui.

Padrão: `MAJOR.MINOR.PATCH` — PATCH = correção, MINOR = nova função, MAJOR = mudança grande.

## [1.2.0] — 2026-11-25

### Adicionado

- **Séries ajustáveis no treino**: botões **− / + Série** em cada exercício para
  adicionar ou remover séries durante o treino (ex.: fez uma série a mais, ou só
  conseguiu uma/duas com carga maior).
- **Adicionar exercício** direto na tela "Hoje" (folha com grupos → escolhe e inclui).
- **Remover exercício** do treino de hoje (ícone de lixeira no card; mantém ao menos 1).
- **Cardio sem séries/reps**: esteira, bike e corrida agora usam **Duração (min)** e
  **Distância (km)**, com um botão de concluir — em vez de séries × repetições × peso.

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
