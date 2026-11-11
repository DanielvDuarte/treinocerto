# TreinoCerto — versão web (Next.js + Supabase)

App de academia guiado: monta o treino conforme objetivo/limitações, mostra o músculo trabalhado, alterna **peso livre ⇄ máquina**, cronômetro de descanso, registro de peso ao fim do treino, gráfico de evolução e **coach de IA**. Login com **Google/Apple** e dados salvos no **Postgres (Supabase)** por usuário.

Stack: Next.js 14 (App Router) · Supabase (Auth + Postgres + RLS) · Anthropic (coach, via rota server-side) · PWA (instalável no celular).

---

## 1. Pré-requisitos

- Node.js 18.18+ (ou 20+)
- Conta no [Supabase](https://supabase.com) (plano free serve)
- Uma **API key da Anthropic** ([console.anthropic.com](https://console.anthropic.com))
- Para login Google: projeto no Google Cloud (OAuth)
- Para login Apple: conta **Apple Developer paga (US$99/ano)** — exigência da Apple. Se ainda não tiver, comece só com Google; o botão Apple fica pronto para quando ativar.

---

## 2. Criar o projeto no Supabase

1. Crie um projeto novo. Anote, em **Project Settings → API**:
   - `Project URL` → vira `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → vira `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Em **SQL Editor → New query**, cole e rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Isso cria a tabela `app_data`, as policies de RLS (cada usuário só acessa a própria linha) e o gatilho que cria a linha no primeiro login.

### Configurar os provedores de login

Em **Authentication → Providers**:

- **Google:** habilite e cole o `Client ID` e `Client Secret`. Para obtê-los:
  1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth client ID → Web application.
  2. Em **Authorized redirect URIs**, adicione o valor que o Supabase mostra na tela do provider (algo como `https://SEU-PROJETO.supabase.co/auth/v1/callback`).
- **Apple:** habilite e preencha com os dados do seu Apple Developer (Services ID, Team ID, Key ID e a chave .p8). A Apple também pede o mesmo redirect URI do Supabase.

Em **Authentication → URL Configuration**, defina:
- **Site URL:** `http://localhost:3000` (em produção, a URL real, ex.: `https://treinocerto.vercel.app`)
- **Redirect URLs:** adicione `http://localhost:3000/auth/callback` e a versão de produção.

---

## 3. Variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `ANTHROPIC_API_KEY` **não** tem o prefixo `NEXT_PUBLIC_` de propósito: ela fica só no servidor (rota `/api/coach`) e nunca é enviada ao navegador.

---

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`, entre com Google, preencha o cadastro e treine. Feche e reabra: os dados continuam lá (estão no Postgres).

---

## 5. Deploy (Vercel — caminho mais rápido)

1. Suba o repositório no GitHub/GitLab.
2. Em [vercel.com](https://vercel.com), importe o projeto.
3. Em **Settings → Environment Variables**, adicione as quatro variáveis (com `NEXT_PUBLIC_SITE_URL` = URL de produção).
4. Deploy. Depois, no Supabase, adicione a URL de produção em **Site URL** e **Redirect URLs**.

> Como você é DevOps: dá para auto-hospedar tanto o app (Docker + `next start` atrás do seu Nginx) quanto o **Supabase self-hosted** (docker-compose oficial deles, com Postgres). Encaixa com o GitLab CI e com a trilha de CKA/EX280. Posso te montar o `Dockerfile` e o pipeline quando quiser.

---

## 6. Instalar no celular (PWA) e ir para as lojas

- **Agora:** abra a URL no Chrome (Android) ou Safari (iPhone) → menu → **Adicionar à tela de início**. Roda em tela cheia, como app. (`public/manifest.json` + `public/sw.js` já estão configurados.)
- **Google Play:** empacote o PWA como **TWA** com [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).
- **App Store:** o caminho usual é envelopar com **Capacitor** (ou migrar a UI para Expo/React Native reaproveitando esta lógica). A Apple costuma rejeitar PWA "puro" empacotado, então Capacitor é o mais seguro.

---

## 7. Estrutura

```
treinocerto/
├─ supabase/schema.sql          # tabelas + RLS + triggers
├─ src/
│  ├─ middleware.js             # refresh de sessão
│  ├─ app/
│  │  ├─ layout.js              # fontes, PWA, registro do service worker
│  │  ├─ page.js                # decide: login (deslogado) ou app (logado)
│  │  ├─ globals.css            # tema + animações
│  │  ├─ auth/callback/route.js # troca o code OAuth pela sessão
│  │  └─ api/coach/route.js     # coach IA (Anthropic) — chave protegida
│  ├─ components/
│  │  ├─ Login.jsx              # botões Google/Apple
│  │  └─ Dashboard.jsx          # o app (Hoje, Plano, Evolução, Coach, Perfil)
│  └─ lib/
│     ├─ exercises.js           # biblioteca de exercícios + montagem do plano
│     ├─ data.js                # ler/gravar estado no Supabase + chamar /api/coach
│     └─ supabase/{client,server}.js
└─ public/                      # manifest, service worker, ícones
```

## Aviso

Ferramenta de orientação. Não substitui educador físico nem médico. O coach de IA dá informação geral e encaminha a profissionais para medicação, lesões e condições de saúde.
