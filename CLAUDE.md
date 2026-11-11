# TreinoCerto

App web pessoal de treino de academia: monta o plano conforme objetivo e
limitações do usuário, mostra o exercício (GIF 3D real ou mapa muscular SVG),
cronômetro de descanso, troca de exercício (peso livre ⇄ máquina), registro de
peso ao fim do treino, gráfico de evolução e um coach de IA.

> Projeto **pessoal**, em fase de uso/teste. Ainda **não é comercial**.
> Não substitui educador físico nem médico; o coach dá orientação geral e
> encaminha a profissionais para medicação, lesões e condições de saúde.

## Stack

- **Next.js 14** (App Router) + **React 18**
- **Tailwind CSS**
- **Supabase** — Postgres (dados) + Auth (login Google/Apple) + RLS
- **Anthropic API** — coach de IA, via rota server-side (`/api/coach`)
- **recharts** (gráfico), **lucide-react** (ícones)
- **PWA** (manifest + service worker) para instalar no celular

## Estrutura

```
src/
  app/
    page.js                  # decide: tela de login (deslogado) ou app (logado)
    layout.js                # fontes, PWA, registro do service worker
    globals.css              # tema + animações
    auth/callback/route.js   # troca o code OAuth pela sessão
    api/coach/route.js       # coach IA (Anthropic) — chave só no servidor
  components/
    Login.jsx                # botões Google/Apple (Supabase OAuth)
    Dashboard.jsx            # o app inteiro: Hoje, Plano, Evolução, Coach, Perfil
    BodyMap.jsx              # boneco anatômico (frente/costas, masc/fem) — MuscleMap (MIT)
    InstallApp.jsx           # convite/botão "Instalar app" (PWA)
  lib/
    body-paths.json          # contornos do corpo (MuscleMap, MIT — ver THIRD_PARTY_NOTICES.md)
    exercises.js             # biblioteca dos 38 exercícios + montagem do plano
    exercise-media-map.json  # mapa dos 38 -> IDs/GIFs do dataset (texto MIT)
    exercise-catalog.json    # catálogo compacto dos 1.324 exercícios (MIT)
    media.js                 # CHAVE DE ROLLBACK da mídia (GIF x SVG)
    data.js                  # ler/gravar estado no Supabase + chamar /api/coach
    supabase/{client,server}.js
  middleware.js              # refresh da sessão Supabase
supabase/schema.sql          # tabela app_data + RLS + triggers (rodar no Supabase)
scripts/fetch-media.mjs      # baixa os GIFs p/ public/exercise-media (gitignored)
```

## Decisões importantes (contexto para quem for mexer)

- **Dados por usuário**: uma linha por usuário na tabela `app_data`, com o estado
  do app em colunas JSONB (`profile`, `plan`, `tracking`, `session`, `chat`).
  Escolha pragmática da v1; dá para normalizar depois.
- **Segurança**: **RLS** garante que cada usuário só lê/escreve a própria linha.
  O app mostra a tela de login antes de qualquer dado. Um gatilho cria a linha do
  usuário no primeiro login.
- **Coach IA**: só via `/api/coach` (server-side). `ANTHROPIC_API_KEY` **nunca**
  vai para o navegador (sem prefixo `NEXT_PUBLIC_`). Só usuário logado chama.
- **Mídia dos exercícios (licença!)**: os GIFs vêm do dataset
  `hasaneyldrm/exercises-dataset` e são **© Gym Visual**. Uso pessoal/teste ok;
  **uso comercial exige licença da Gym Visual**. Por isso:
  - `public/exercise-media/` está no `.gitignore` (nunca commitar/publicar).
  - Tudo passa por `src/lib/media.js`, controlado por env:
    `NEXT_PUBLIC_EXERCISE_MEDIA=svg` (padrão, nosso SVG próprio, seguro p/ comercial)
    ou `=gymvisual` (mostra os GIFs). Rollback = trocar essa env. Ver `MIDIA.md`.
  - A parte MIT (nomes/estrutura, nos `.json`) pode ficar no repo.
- **AGPL**: o projeto **openGym** (e a cópia `datomoliveira/openGyn`) foi usado só
  como referência de ideias; **nenhum código dele foi copiado**, então a AGPL não se
  aplica ao TreinoCerto. O boneco anatômico vem direto do **MuscleMap** (MIT), a
  mesma fonte que o openGym usa — não do código do openGym.
- **Layout**: celular = coluna única + barra inferior; `lg` (≥1024px) = menu lateral
  fixo e cards em grade. Treino: tabela SÉRIE/REPS/PESO; cargas do último treino
  ficam em `tracking.lastLoads[refId]` e pré-preenchem o próximo.
- **UI em português**; commits **sem** linha `Co-Authored-By`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`
(só servidor), `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_EXERCISE_MEDIA` (svg|gymvisual).

## Rodar localmente

```bash
npm install
node scripts/fetch-media.mjs     # opcional: baixa os 38 GIFs p/ teste
npm run dev                       # http://localhost:3000
```
Antes: criar o projeto no Supabase e rodar `supabase/schema.sql` (ver DEPLOY.md).

## Estado atual

- Feito: UI completa (onboarding, plano, treino guiado, evolução, coach),
  camada Supabase (dados + auth + RLS), rota do coach, mídia com rollback,
  PWA, Docker + CI (GitLab/GitHub), docs (README, DEPLOY, MIDIA).
- Repo: `github.com/DanielvDuarte/treinocerto`, branch `main`.

## Próximos passos (TODO)

1. Criar projeto no Supabase, rodar `schema.sql`, configurar OAuth **Google**
   (e Apple se houver conta Apple Developer); preencher `.env.local`.
2. Deploy: **Render** ou **Vercel** (grátis) rodando o app; Supabase guarda os dados.
3. Aba **"Exercícios"**: navegar os 1.324 do `exercise-catalog.json` por grupo
   muscular (dados já embutidos; falta a tela).
4. Se o teste agradar: fechar **licença da Gym Visual** para os GIFs em produção.

## Convenções

- Respostas/UI em português do Brasil.
- Commits sem `Co-Authored-By` e sem assinaturas de ferramenta.
- Não commitar segredos (`.env.local`) nem `public/exercise-media/`.
