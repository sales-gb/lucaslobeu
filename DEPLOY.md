# Deploy — Lucas Lobeu (Cloudflare Workers + D1 + R2)

Guia passo a passo para subir o site na Cloudflare. Pensado para a **sua conta**
agora (preview para mostrar ao cliente) e depois migrar para a conta dele.

O site roda em **Cloudflare Workers** (via OpenNext), com **D1** (banco) e **R2**
(imagens). Tudo cabe no plano gratuito.

> Já validado localmente: o build do Worker, o boot em runtime e as migrações do
> D1 funcionam. Só faltam os passos que dependem da sua conta (abaixo).

---

## 0. Antes de começar

- O projeto já está configurado: `wrangler.toml`, `open-next.config.ts`, adapters
  de D1/R2 e os scripts `npm run deploy` / `npm run preview`.
- **Sobre o Worker que você criou pelo painel (Git):** o build dele falha porque o
  comando estava como `pnpm run build` (gera Next, não o Worker do OpenNext).
  Recomendo **deletar** esse Worker e subir pela linha de comando (CLI), que dá
  mais controle e visibilidade:
  - Workers & Pages → `lucaslobeu` → **Settings** → **Delete**.

Os comandos abaixo você roda no terminal **dentro da pasta do projeto**. Aqui no
chat, pode prefixar com `!` para eu ver a saída (ex.: `! npx wrangler login`).

---

## 1. Login na Cloudflare

```bash
npx wrangler login
```
Abre o navegador, você autoriza, pronto. (Confirma com `npx wrangler whoami`.)

---

## 2. Criar o banco D1

```bash
npx wrangler d1 create lucaslobeu-db
```
Isso imprime um bloco com `database_id = "xxxxxxxx-...."`. **Copie esse id** e cole
no `wrangler.toml`, substituindo `REPLACE_WITH_D1_ID`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "lucaslobeu-db"
database_id = "COLE_O_ID_AQUI"
migrations_dir = "src/lib/db/migrations"
```

### Aplicar o schema (criar as tabelas) no D1
```bash
npx wrangler d1 migrations apply lucaslobeu-db --remote
```
Deve listar as 10 migrações (`0000` … `0009`) com ✅.

---

## 3. Criar o bucket R2 (imagens)

```bash
npx wrangler r2 bucket create lucaslobeu-media
```

### Habilitar acesso público no bucket
1. Painel → **R2** → `lucaslobeu-media` → **Settings**.
2. Em **Public access** → **R2.dev subdomain** → **Allow Access**.
3. Copie a URL gerada (algo como `https://pub-xxxxxxxxxxxx.r2.dev`).
4. Cole no `wrangler.toml` em `R2_PUBLIC_URL`:

```toml
[vars]
R2_PUBLIC_URL = "https://pub-xxxxxxxxxxxx.r2.dev"
```

---

## 4. Definir os secrets

Esses valores NÃO ficam no código. Pegue os do seu `.env` e rode (cada comando
pede para você colar o valor):

```bash
npx wrangler secret put AUTH_SECRET            # mesmo valor do seu NEXTAUTH_SECRET
npx wrangler secret put NEXTAUTH_SECRET        # idem (compatibilidade)
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

> Não tem um secret de auth ainda? Gere um: `openssl rand -base64 32`.

---

## 5. Primeiro deploy

```bash
npm run deploy
```
Isso roda `opennextjs-cloudflare build` e publica. No fim ele mostra a URL pública,
algo como:

```
https://lucaslobeu-portfolio.gabrielsales081.workers.dev
```

---

## 6. Ajustes pós-deploy (necessários para o login funcionar)

1. **NEXTAUTH_URL** — no `wrangler.toml`, troque pela URL real do passo 5:
   ```toml
   NEXTAUTH_URL = "https://lucaslobeu-portfolio.gabrielsales081.workers.dev"
   ```
   Rode `npm run deploy` de novo para aplicar.

2. **Google OAuth** — no [Google Cloud Console](https://console.cloud.google.com)
   → APIs & Services → Credentials → seu OAuth Client → **Authorized redirect URIs**,
   adicione:
   ```
   https://lucaslobeu-portfolio.gabrielsales081.workers.dev/api/auth/callback/google
   ```
   (e a Authorized JavaScript origin: a mesma URL sem o caminho).

3. **Login do admin** já está liberado para `gabrielsales081@gmail.com` e
   `lucaslobeu@gmail.com` (whitelist em `src/lib/auth.config.ts`). Acesse
   `…workers.dev/admin/login` e entre com o Google.

Agora é só cadastrar projetos/clientes no admin — o conteúdo aparece no site na
hora (as páginas leem o D1 a cada request).

---

## 7. Atualizações futuras

Toda vez que mudar o código:
```bash
npm run deploy
```
Mudou o schema (novas migrações)? Rode também:
```bash
npx wrangler d1 migrations apply lucaslobeu-db --remote
```

Quer testar o build de produção localmente antes de subir:
```bash
npm run preview      # builda + roda em workerd em http://localhost:8787
```

---

## 8. Migrar para a conta do cliente (depois)

Quando ele te passar a conta/domínio:

1. `npx wrangler logout` e `npx wrangler login` **na conta dele**.
2. Repita os passos 2–6 (cria D1 + R2 + secrets + deploy) na conta dele. Como o
   banco começa limpo, é rápido — ele cadastra o conteúdo pelo admin.
   - Se quiser levar o conteúdo que já existir: `npx wrangler d1 export lucaslobeu-db --remote --output dump.sql` na sua conta e
     `npx wrangler d1 execute lucaslobeu-db --remote --file dump.sql` na dele.
3. **Domínio próprio:** Workers & Pages → o Worker → **Domains & Routes** →
   **Add Custom Domain** → `lucaslobeu.com`. A Cloudflare emite o HTTPS sozinha.
   Depois ajuste `NEXTAUTH_URL` para `https://lucaslobeu.com` e adicione a redirect
   URI do Google para esse domínio.

---

## 9. Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `database_id` inválido no deploy | placeholder no wrangler.toml | cole o id real (passo 2) |
| Imagens não aparecem em produção | R2 sem acesso público / `R2_PUBLIC_URL` errado | passo 3 |
| Login redireciona e dá erro | redirect URI do Google ou `NEXTAUTH_URL` errados | passo 6 |
| Páginas mostram conteúdo de exemplo | banco vazio (normal no início) | cadastre no `/admin` |
| Upload falha em produção | (não deve ocorrer) o servidor confia no WebP do navegador | conferir R2/secret |

> Os scripts locais de banco (`npm run seed`, `scripts/clean-db.ts`) atuam só no
> `local.db` de desenvolvimento — não tocam no D1 de produção.
