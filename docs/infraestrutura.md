# Infraestrutura & Hospedagem — Decisão Técnica

Portfólio Lucas Lobeu · documento interno (técnico)

---

## Resumo da decisão

**Recomendação: hospedar 100% na Cloudflare. O Railway não é necessário.**

O código do projeto **já está construído para a Cloudflare** (`@opennextjs/cloudflare`,
`wrangler.toml` com bindings de D1 e R2). Migrar para o Railway agora seria andar
para trás: trocaria o banco D1 por Postgres, o storage R2 por volume/S3 e exigiria
re-trabalho, com custo mensal maior. Com as novas regras do projeto (só imagens,
vídeos ficam no Instagram, um único vídeo na Home), a Cloudflare cobre tudo —
provavelmente a **custo zero**.

---

## Por que essa pergunta mudou

O Railway tinha sentido na hipótese antiga: hospedar e servir **arquivos de vídeo
pesados**, que pedem disco, banda e um servidor "tradicional" sempre ligado.

Com o novo combinado, isso desaparece:

- **Não subimos vídeos.** As imagens dos projetos **linkam para o Instagram**, onde
  o vídeo já está publicado na melhor qualidade. O site guarda só a imagem (leve) e
  um link de saída.
- **Só existe um vídeo "de verdade": o da Home.** É um único arquivo, resolvido sem
  servidor dedicado (ver seção "O vídeo da Home").

Sem vídeo hospedado, não há motivo para um host com disco/banda dedicados. Sobra um
site estático + um painel admin pequeno + imagens — exatamente o ponto forte da
Cloudflare.

---

## O que cada peça faz (stack atual)

| Camada | Tecnologia | Para que serve |
|---|---|---|
| App / SSR | Next.js 16 em **Cloudflare Workers** (via OpenNext) | Renderiza o site e o painel admin |
| Banco de dados | **Cloudflare D1** (SQLite) | Projetos, mídias, textos, config da Home |
| Imagens | **Cloudflare R2** | Armazena as fotos (otimizadas para WebP) |
| Login | NextAuth v5 + Google OAuth | Acesso restrito ao admin |
| CDN / TLS / domínio | Cloudflare | HTTPS, cache global, proteção |

Tudo num só provedor: um deploy (`wrangler deploy`), uma fatura, um painel.

---

## Custos — Cloudflare vs. alternativas

Para o tráfego de um portfólio, os números abaixo ficam **dentro do plano gratuito**.

| | Cloudflare (recomendado) | Railway | Vercel |
|---|---|---|---|
| Hospedagem | Workers Free: 100k req/dia | ~US$ 5/mês (Hobby) + uso | Hobby grátis, mas **uso comercial exige Pro (US$ 20/mês)** |
| Banco | D1 Free: 5 GB | Postgres no plano pago | Externo (não incluso) |
| Imagens/Storage | R2 Free: 10 GB, **egress US$ 0** | Volume/S3 (com egress) | Externo (não incluso) |
| Custo realista deste projeto | **US$ 0/mês** | ~US$ 5/mês+ | ~US$ 20/mês |
| Esforço de migração | Nenhum (já configurado) | Alto (trocar D1→PG, R2→S3) | Médio (storage externo) |

O diferencial decisivo do R2: **não cobra egress** (banda de saída). Servir imagens
de um portfólio o dia todo não gera surpresa na fatura.

> Se um dia o tráfego crescer muito, o salto natural é o Workers Paid (US$ 5/mês),
> sem trocar de plataforma.

---

## O vídeo da Home

É o único vídeo que o site precisa exibir como vídeo. Duas opções, ambas sem Railway:

1. **YouTube/Vimeo não-listado, embutido (recomendado).** Zero manutenção, zero
   banda nossa, player adaptativo. Já existe o componente `VideoEmbed` com modo
   `background` (autoplay mudo em loop, sem controles) pronto para hero. Usa
   `youtube-nocookie` / `dnt=1`, sem cookies de rastreio.
2. **Um único MP4 no R2.** Totalmente self-hosted, sem marca de terceiro. Como é um
   só arquivo e pequeno, cabe folgado no R2. Bom se o cliente não quiser nenhum
   logo de plataforma.

> Atenção: **Instagram não serve para o vídeo de fundo da Home.** O embed do
> Instagram traz a moldura do post (UI, botões), não faz autoplay mudo em loop e é
> instável para uso como background. Instagram fica só para os **links de saída** das
> imagens de projeto — que é o uso correto.

---

## Imagens dos projetos → Instagram

Fluxo simples e barato:

1. Admin sobe a **imagem** (capa/thumb do trabalho) → otimizada para WebP → salva no R2.
2. A imagem recebe um **link para o post no Instagram**.
3. Visitante clica → vai para o Instagram, onde o vídeo está em qualidade máxima.

Nenhum vídeo trafega pelo nosso servidor. Custo de banda ~nulo.

---

## Modelo de segurança (resumo)

Acesso ao painel `/admin`:

- **Login Google está travado por whitelist de e-mails** (`signIn` callback em
  `auth.config.ts`). Qualquer outra conta Google é **recusada** — ver detalhes e a
  ressalva importante no documento de alinhamento.
- Middleware protege todas as rotas `/admin/*` (sem sessão → redireciona pro login).
- API de mídia exige sessão válida (401 sem login).
- Headers de segurança fortes já configurados (CSP, HSTS, X-Frame-Options DENY,
  nosniff, Permissions-Policy).
- Sessão via **JWT** assinado com `NEXTAUTH_SECRET` (definido como *secret* no deploy,
  nunca no código).

---

## Pendências técnicas antes do deploy

1. **Ativar o adapter R2.** Hoje `src/lib/storage/index.ts` usa o `localAdapter`
   fixo (correto para dev). Em produção, plugar o `createR2Adapter` no binding
   `MEDIA_BUCKET` + URL pública do bucket. (O próprio arquivo já tem o comentário/TODO.)
2. **Preencher o `wrangler.toml`:** `database_id` do D1 e `bucket_name` do R2 reais.
3. **Definir secrets:** `wrangler secret put NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`,
   `GOOGLE_CLIENT_SECRET`, e (se mantiver) `ADMIN_ALLOWED_EMAILS`.
4. **Fechar a segunda via de login (senha)** — ver documento de alinhamento, seção
   Segurança. É bloqueante para produção.
5. **Nota menor:** a mensagem de erro do upload diz "Máximo 10MB", mas o limite real
   é 30MB. Ajustar o texto em `src/app/api/media/route.ts`.
