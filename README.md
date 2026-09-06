# Mounjaro de Chia — funil de quiz

Funil de 16 etapas (quiz → VSL → réguas → projeção → oferta) em HTML, CSS e
JavaScript puro. Sem build, sem dependência, sem `npm install`: são arquivos
estáticos que sobem em qualquer lugar.

---

## Antes de subir: leia isto

Duas coisas que dão problema neste nicho e que o código não resolve sozinho.

**1. "Mounjaro" é marca registrada da Eli Lilly** (o medicamento tirzepatida).
Usar o nome num produto de chia é risco concreto de notificação extrajudicial e
de reprovação/bloqueio de conta no Meta Ads, que trata nome de medicamento como
alegação de saúde. O nome está centralizado em `CONFIG.marca` (`config.js`):
trocar lá muda o funil inteiro, porque todos os textos usam o token `{{marca}}`.

**2. A promessa "12 kg em 30 dias"** é o tipo de claim que reprova criativo e
gera reembolso. Por isso a projeção da etapa 19 **não** promete a meta cheia no
primeiro mês: ela limita a perda projetada a ~7% do peso corporal e diz
"começando já nos próximos 30 dias". O aviso legal do rodapé (`CONFIG.legal`)
é obrigatório — preencha o CNPJ e o e-mail de suporte antes de anunciar.

---

## Rodar localmente

```bash
python -m http.server 4321
```

Abra `http://localhost:4321`. Qualquer servidor estático serve; abrir o
`index.html` direto pelo `file://` também funciona, mas o `localStorage` fica
instável, então prefira o servidor.

Com o Claude Code, `.claude/launch.json` já está configurado: é só rodar o
preview com o nome `funil`.

---

## O que configurar antes de anunciar

Tudo em **`assets/js/config.js`**. Nada além desse arquivo precisa ser tocado
para colocar no ar.

| Campo | O que é | Sem isso |
|---|---|---|
| `ofertas[].checkout` | Link do seu checkout (Payt, Kiwify, Hotmart…) | O botão fica desabilitado avisando na tela |
| `video.vsl1` / `video.vslFinal` | Player da VSL + `revealAt` | Aparece um placeholder e o CTA libera em 5 s |
| `tracking.metaPixelId` etc. | Pixels | Nenhum script de rastreio é carregado |
| `legal.empresa` / `legal.email` | Rodapé legal | O rodapé sai com o texto de exemplo |
| `marca` | Nome do produto | — |

### Checkout

```js
checkout: 'https://checkout.suaplataforma.com.br/SEU_ID/?payment=pix',
```

Os parâmetros de campanha (`utm_*`, `fbclid`, `gclid`, `ttclid`, `xcod`, `sck`)
são repassados automaticamente para o link — sem isso a venda chega na
plataforma sem origem e a otimização do anúncio fica cega.

### VSL

`revealAt` é o **segundo do vídeo** em que o conteúdo abaixo aparece. É tempo
assistido, não tempo de tela: pausar o vídeo pausa a contagem.

```js
vsl1: { player: 'ID_DO_PLAYER', revealAt: 760 },   // ConverteAI/VTurb
```

Para testar sem esperar 12 minutos, troque `revealAt` por `5`.

Outro player qualquer entra por `embed`, que aceita HTML cru:

```js
vslFinal: { embed: '<iframe src="..." allow="autoplay"></iframe>', revealAt: 260 },
```

---

## Editar as perguntas

Tudo em **`assets/js/funnel.js`**. Cada etapa é um objeto; nunca é preciso
mexer no HTML.

```js
{
  id: 'agua',
  type: 'quiz',
  title: 'Quantos litros de água você bebe por dia?',
  layout: 'emoji',
  options: [
    { emoji: '💧', title: 'Até 2 litros' },
  ],
},
```

**Tipos de etapa:** `quiz` · `measure` (régua) · `form` · `loading` ·
`vsl` · `projection` · `offer`.

**Layouts de quiz:** `emoji` · `image` · `thumb` · `thumb-top`.

**Variações por gênero:** qualquer campo aceita o sufixo `By`.

```js
titleBy: { f: 'Você está satisfeita?', m: 'Você está satisfeito?' },
optionsBy: { f: [...], m: [...] },
```

**Tokens** válidos em qualquer texto:

`{{marca}}` `{{nome}}` `{{delta}}` `{{area}}` `{{corpo}}` `{{faixa}}`
`{{pesoAtual}}` `{{pesoObjetivo}}` `{{imc}}` `{{peso30}}` `{{perda30}}`

A barra de progresso ("Etapa 4 de 16") é calculada sozinha a partir das etapas
`quiz`, `measure` e `form` — adicionar uma pergunta não exige mexer em
percentual nenhum.

---

## Imagens

O funil roda inteiro **sem nenhuma foto**: `assets/js/placeholders.js` desenha
silhuetas em SVG no lugar. Para usar as suas, coloque o arquivo em
`assets/img/` e aponte o campo `img`:

```js
{ title: 'Mulher', img: 'assets/img/genero-mulher.webp', ph: 'genero-f' }
```

Deixe o `ph`: ele volta a ser usado se a imagem falhar em carregar.

A logo do topo é `assets/img/logo.svg`, uma reconstrução vetorial do criativo.
Para usar o arquivo original, salve como `assets/img/logo.webp` e troque o
`src` (e o `preload`) no `index.html`.

---

## Teste A/B

```js
ab: {
  ativo: true,
  B: { video: { vsl1: { revealAt: 540 } } },   // sobrepõe só o que muda
},
```

A variante é sorteada na primeira visita e guardada no navegador, então a mesma
pessoa vê sempre a mesma. Ela vai junto em todo evento de pixel (campo
`variante`), que é o que permite atribuir venda por variante depois.

---

## Deploy

Site estático — sobe em qualquer lugar sem configuração:

- **Vercel / Netlify:** conecte o repositório. Sem build command, sem output
  directory.
- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / `root`.
- **Hospedagem comum (cPanel, Hostinger):** jogue os arquivos na `public_html`.

O funil usa rotas por hash (`#/meta-peso`), então **não precisa** de regra de
rewrite para SPA, e cada etapa tem URL própria — dá para apontar um anúncio
direto para o meio do funil e o botão voltar do navegador funciona.

---

## Estrutura

```
index.html                  casca: topo, progresso, área do app, barra de ação
assets/css/style.css        design system (tokens em :root)
assets/js/config.js         ← preços, checkout, pixel, vídeo    (você edita)
assets/js/funnel.js         ← as 21 etapas e seus textos        (você edita)
assets/js/placeholders.js   silhuetas SVG enquanto não há fotos
assets/js/app.js            motor: rotas, estado, render, rastreio
assets/img/                 logo e favicon
```

## Eventos disparados

`funil_inicio` · `quiz_<etapa>` · `lead_nome` · `vsl_view` ·
`vsl_cta_visivel` · `vsl_cta_click` · `projecao_cta` · `oferta_view` ·
`oferta_pitch_visivel` · `checkout_click_<plano>` (+ `InitiateCheckout` no
pixel do Meta).

Com `tracking.eventoPorEtapa: true` sai também um `etapa_view` por tela — útil
para achar o vazamento do funil, ruim para deixar ligado o tempo todo.

Sem pixel configurado, os eventos vão só para o console em `localhost`, o que
permite conferir o funil inteiro antes de ligar qualquer rastreio.
