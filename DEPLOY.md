# Como colocar o TreinoCerto no ar (começando de graça)

Dois caminhos:
- **A — grátis e rápido:** GitHub/GitLab + Vercel + Supabase. Sem servidor para administrar; deploy a cada push. Use este no começo.
- **B — container próprio:** Docker + CI (inclusos). Para auto-hospedar depois.

O único custo real é a **API da Anthropic** (coach de IA), paga por uso. O resto cabe em planos gratuitos. Para os GIFs de exercício, veja `MIDIA.md` (uso pessoal é livre; comercial exige licença da Gym Visual).

## 1. Versionar

```bash
cd treinocerto
git init && git add . && git commit -m "TreinoCerto: versão inicial"
# GitHub:
git remote add origin https://github.com/SEU_USUARIO/treinocerto.git
git branch -M main && git push -u origin main
```
O `.gitignore` já exclui `node_modules`, `.next`, `.env*` e `public/exercise-media/` (mídia da Gym Visual).

## 2. Banco (Supabase)

1. Crie um projeto. Anote em **Settings → API**: `Project URL` e `anon public key`.
2. **SQL Editor → New query** → cole e rode `supabase/schema.sql` (cria `app_data`, RLS e os triggers).
3. **Authentication → Providers**: habilite **Google** (Client ID/Secret do Google Cloud) e, se tiver Apple Developer, **Apple**. O redirect URI é o que o Supabase mostra (`https://SEU.supabase.co/auth/v1/callback`).
4. **Authentication → URL Configuration**: Site URL = sua URL; Redirect URLs inclui `.../auth/callback`.

## 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```
Preencha Supabase + `ANTHROPIC_API_KEY` (sem `NEXT_PUBLIC_`, fica só no servidor) + `NEXT_PUBLIC_SITE_URL`. Mídia: `NEXT_PUBLIC_EXERCISE_MEDIA=svg` (ou `gymvisual` para testar com GIFs — ver `MIDIA.md`).

## 4. Rodar

```bash
npm install
node scripts/fetch-media.mjs     # opcional: baixa os GIFs p/ teste
npm run dev
```

## 5. Deploy grátis (Vercel)

1. Suba no GitHub/GitLab, importe em [vercel.com](https://vercel.com).
2. **Settings → Environment Variables**: as mesmas do `.env.local` (`NEXT_PUBLIC_SITE_URL` = URL de produção). **Deixe `NEXT_PUBLIC_EXERCISE_MEDIA=svg` em produção** enquanto não licenciar os GIFs.
3. Deploy. Depois, no Supabase, adicione a URL de produção em Site URL / Redirect URLs.

## 6. Container (Caminho B)

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://SEU.supabase.co" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_anon_key" \
  --build-arg NEXT_PUBLIC_SITE_URL="http://localhost:3000" \
  -t treinocerto:latest .

docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://SEU.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="sua_anon_key" \
  -e NEXT_PUBLIC_SITE_URL="http://localhost:3000" \
  -e ANTHROPIC_API_KEY="sk-ant-..." \
  treinocerto:latest
```

CI/CD: `.gitlab-ci.yml` e `.github/workflows/ci.yml` validam o build a cada push e publicam a imagem no registry ao criar uma tag (`git tag v1.0.0 && git push --tags`). Free tiers de container: Render, Railway, Fly.io.

## 7. Celular / lojas

- **Agora:** abra a URL no celular → "Adicionar à tela de início" (PWA já configurado).
- **Google Play:** empacote o PWA como TWA (Bubblewrap).
- **App Store:** envelope com Capacitor.

## Custos

| Item | Plano | Custo |
|------|-------|-------|
| Código (GitHub/GitLab) | privado | grátis |
| Web (Vercel) | Hobby | grátis |
| Banco + Auth (Supabase) | Free | grátis |
| Coach IA (Anthropic) | uso | centavos/conversa |
| GIFs de exercício | Gym Visual | grátis p/ teste; licença p/ comercial |
