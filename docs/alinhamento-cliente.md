# Alinhamento do Projeto — Site Lucas Lobeu

Documento para alinharmos juntos como o site vai funcionar, o que você vai gerenciar,
onde fica hospedado e como fica a segurança do acesso. Qualquer ponto a gente ajusta.

---

## 1. Como o conteúdo vai funcionar

Combinamos o seguinte (e isso simplifica e barateia bastante o projeto):

- **Você sobe só imagens.** Cada trabalho entra no site como uma foto/capa.
- **A imagem leva para o Instagram.** Ao clicar, o visitante vai para o post do
  trabalho no seu Instagram, onde o vídeo já está publicado na melhor qualidade. Ou
  seja, **não precisamos subir vídeo nenhum** — o Instagram continua sendo a "casa"
  dos vídeos.
- **Único vídeo no site: o da Home** (aquele de abertura, de fundo). Esse a gente
  resolve à parte, sem precisar de servidor de vídeo.

> Sobre o DaVinci: o **DaVinci Resolve** é o programa onde você **edita** os vídeos —
> não é uma plataforma de publicação como o Vimeo ou o YouTube. Para o site, o que
> importa é **onde o vídeo final está publicado** (no seu caso, o Instagram). O DaVinci
> não entra nessa parte; é só a ferramenta de edição.

---

## 2. O que você vai poder fazer no painel

Painel administrativo (`/admin`), só para você:

- Adicionar, editar e remover **projetos/trabalhos**.
- Subir **imagens** (o sistema otimiza automaticamente, deixando o site rápido).
- Colar o **link do Instagram** de cada trabalho.
- Editar textos da página **Sobre**, configurações da **Home** e os **links**.

Você não precisa entender de código. É preencher campos e arrastar imagens.

---

## 3. Onde o site fica hospedado e quanto custa

Vamos hospedar tudo na **Cloudflare**, uma das maiores e mais confiáveis
infraestruturas do mundo (a mesma rede que entrega grande parte da internet).

- **HTTPS (cadeado) e velocidade global** inclusos.
- Imagens servidas de uma rede mundial — o site abre rápido em qualquer lugar.
- **Custo: praticamente R$ 0/mês** no nosso volume. O único custo recorrente
  esperado é o do **domínio** (o endereço `lucaslobeu.com`, na faixa de ~R$ 50–70/ano).

> Tínhamos cogitado outra hospedagem (Railway) quando a ideia era guardar vídeos
> pesados no próprio site. Como os vídeos ficam no Instagram, isso deixou de ser
> necessário — e a Cloudflare sai mais simples e mais barata.

---

## 4. Segurança do acesso (importante)

Você perguntou se o acesso é mesmo seguro, liberado **só** para os e-mails autorizados.
Resposta direta, com total transparência:

**Login pelo Google:** sim, está travado. Só os e-mails que cadastrarmos na lista
conseguem entrar. **Qualquer outra conta Google é recusada automaticamente** com a
mensagem "Acesso negado". Hoje a lista é a sua e a do desenvolvedor.

**Ressalva técnica (vou corrigir antes de publicar):** o painel também tem hoje uma
segunda forma de entrar, por **e-mail e senha**. Essa segunda porta, do jeito que está,
**não passa pela mesma lista de autorização** e usa uma senha que ficou definida na
fase de desenvolvimento. Antes de o site ir ao ar, vou **fechar essa segunda porta**
(deixando só o login Google, que é o mais seguro) ou, se você preferir manter senha,
trocá-la por uma senha forte e protegê-la com a mesma lista. Isso é um ajuste rápido
e já está no meu checklist de publicação.

Resumo do que protege o painel:

- Acesso restrito por e-mail (lista de autorizados).
- Todas as páginas do painel exigem login.
- Conexão sempre criptografada (HTTPS).
- Proteções contra os ataques web mais comuns já configuradas.

---

## 5. Estrutura do site (para confirmarmos)

- **Home** — abertura com o vídeo de fundo + trabalhos selecionados.
- **Projetos** — grade de trabalhos; cada um é uma imagem que leva ao Instagram.
- **Sobre** — sua bio/apresentação.
- **Contato / Links** — formas de contato e redes.
- **Painel admin** — área privada para você gerenciar tudo acima.

---

## 6. O que eu preciso de você

1. Confirmar que o fluxo "imagem no site → link para o Instagram" está certo.
2. Decidir o vídeo da Home: **YouTube/Vimeo não-listado** (mais simples, recomendo)
   ou **arquivo enviado direto** (sem logo de plataforma). Me diga sua preferência.
3. O(s) **e-mail(s)** que terão acesso ao painel.
4. Confirmar o **domínio** definitivo (ex.: `lucaslobeu.com`).

Com isso fechado, sigo para a publicação.
