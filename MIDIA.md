# Mídia dos exercícios — GIFs realistas + chave de rollback

O app agora pode mostrar **GIFs 3D realistas** de cada exercício (com a máquina e o músculo em destaque, estilo Befit), vindos do dataset [`hasaneyldrm/exercises-dataset`](https://github.com/hasaneyldrm/exercises-dataset). Nossos 38 exercícios já estão mapeados para os GIFs certos.

## Licença — leia antes de publicar

- A **estrutura e os nomes** do dataset são MIT (livres). O arquivo `src/lib/exercise-media-map.json` e `src/lib/exercise-catalog.json` (só texto/estrutura) podem ficar no repositório.
- **As mídias (GIFs/imagens) são © Gym Visual**, redistribuídas "com permissão" a 180×180. **Uso pessoal/teste local: ok. Uso comercial/público: precisa licenciar com a [Gym Visual](https://gymvisual.com).**
- Por isso a pasta `public/exercise-media/` está no `.gitignore` e **não é commitada nem publicada**. Os arquivos ficam só na sua máquina.

## Como ligar os GIFs (teste pessoal)

1. Baixe as mídias dos 38 exercícios do plano:
   ```bash
   node scripts/fetch-media.mjs          # ~4,4 MB (38 GIFs + 38 imagens)
   # ou, para a biblioteca inteira (1.324):
   node scripts/fetch-media.mjs --all    # ~140 MB
   ```
2. No `.env.local`, ligue a fonte de mídia:
   ```
   NEXT_PUBLIC_EXERCISE_MEDIA=gymvisual
   ```
3. `npm run dev`. Os cards passam a mostrar os GIFs.

## Rollback (voltar ao nosso SVG próprio)

Uma linha — troque no `.env.local`:
```
NEXT_PUBLIC_EXERCISE_MEDIA=svg
```
Pronto. O app volta a usar o **mapa muscular SVG** (100% nosso, seguro para comercial). Nenhum outro código muda, e qualquer GIF que falhe ao carregar também cai automaticamente no SVG — o app nunca fica sem imagem.

## Caminho para produção

Quando decidir seguir comercial:
1. Feche a **licença com a Gym Visual** (provavelmente mais barato/rápido que gerar 38 animações por IA).
2. Suba as mídias licenciadas para um CDN/Cloudflare R2/Supabase Storage e aponte:
   ```
   NEXT_PUBLIC_EXERCISE_MEDIA_BASE=https://seu-cdn/exercise-media
   ```
3. Mantenha `NEXT_PUBLIC_EXERCISE_MEDIA=gymvisual`.

Sobre a **AGPL do openGym**: ela não nos afeta, porque não copiamos código do openGym — só usamos o dataset (parte MIT) e construímos o resto do zero. Usamos o openGym apenas como referência de ideias.
