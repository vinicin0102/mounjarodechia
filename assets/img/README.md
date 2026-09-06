# Pasta de imagens

Todos os caminhos abaixo **já estão ligados no código**. Salve o arquivo com o
nome exato da tabela e ele entra no ar — não é preciso editar nada.

Enquanto o arquivo não existir, o funil desenha um placeholder em SVG no lugar.
Ou seja: **nunca fica um buraco branco na tela**, e você pode subir as imagens
aos poucos, uma de cada vez.

Para conferir, é só recarregar a página com o servidor local rodando.

---

## Formato

- **`.webp`**, qualidade 80–85. É o formato mais leve e todo navegador atual
  lê. Se você só tem `.jpg`/`.png`, converta em <https://squoosh.app> — o funil
  vive de tráfego pago no celular, e cada 100 KB a mais derruba conversão.
- **Peso alvo: até 150 KB por imagem.** As miniaturas, bem menos.
- As medidas abaixo são o **mínimo**; maior funciona, só pesa mais.
- Se preferir outra extensão, mude o campo `img` em `assets/js/funnel.js`.

---

## `quiz/` — cartões das perguntas

### Gênero (etapa 2) — cartão grande, lado a lado

| Arquivo | Proporção | Tamanho |
|---|---|---|
| `genero-mulher.webp` | 3:4 (retrato) | 600 × 800 |
| `genero-homem.webp` | 3:4 (retrato) | 600 × 800 |

Corpo inteiro ou da cintura pra cima, fundo limpo. É a primeira imagem que a
pessoa vê: precisa dela se reconhecer ali.

### Tipo de corpo (etapa 4) — miniatura de 64 px ao lado do texto

| Arquivo | Proporção | Tamanho |
|---|---|---|
| `corpo-f-regular.webp` | 1:1 | 256 × 256 |
| `corpo-f-flacido.webp` | 1:1 | 256 × 256 |
| `corpo-f-sobrepeso.webp` | 1:1 | 256 × 256 |
| `corpo-m-regular.webp` | 1:1 | 256 × 256 |
| `corpo-m-flacido.webp` | 1:1 | 256 × 256 |
| `corpo-m-sobrepeso.webp` | 1:1 | 256 × 256 |

Aparecem pequenas e lado a lado na vertical: as três precisam ser
**distinguíveis num relance**. Mesma pose, mesmo enquadramento, mesmo fundo —
só o corpo muda. Se as três parecerem iguais em 64 px, a etapa não cumpre a
função.

### Áreas de gordura (etapa 5) — grade de 2 colunas

| Arquivo | Proporção | Tamanho |
|---|---|---|
| `area-f-abdomen.webp` | 1:1 | 400 × 400 |
| `area-f-peito.webp` | 1:1 | 400 × 400 |
| `area-f-flancos.webp` | 1:1 | 400 × 400 |
| `area-f-bracos.webp` | 1:1 | 400 × 400 |
| `area-m-abdomen.webp` | 1:1 | 400 × 400 |
| `area-m-peito.webp` | 1:1 | 400 × 400 |
| `area-m-flancos.webp` | 1:1 | 400 × 400 |
| `area-m-bracos.webp` | 1:1 | 400 × 400 |

O ideal é o mesmo corpo nas quatro, com a região em destaque (círculo, brilho
ou seta). Assim a pessoa marca a área, não a foto que achou mais bonita.

---

## `analise/` — carrossel da tela "Montando seu protocolo"

| Arquivo | Proporção | Tamanho |
|---|---|---|
| `carrossel-1.webp` | 16:10 | 800 × 500 |
| `carrossel-2.webp` | 16:10 | 800 × 500 |
| `carrossel-3.webp` | 16:10 | 800 × 500 |
| `carrossel-4.webp` | 16:10 | 800 × 500 |

Passam sozinhas durante os 8 segundos da análise. A sequência que funciona
é a que mostra o produto virando resultado: ingredientes → preparo → rotina →
resultado. Prints de depoimento também cabem aqui.

Para usar mais ou menos de quatro, edite a lista `carousel` na etapa
`analise-2` em `assets/js/funnel.js`.

---

## `projecao/` — antes e depois (etapa 19)

| Arquivo | Proporção | Tamanho |
|---|---|---|
| `antes-f.webp` | 2:3 | 400 × 600 |
| `depois-f.webp` | 2:3 | 400 × 600 |
| `antes-m.webp` | 2:3 | 400 × 600 |
| `depois-m.webp` | 2:3 | 400 × 600 |

⚠️ **Pense duas vezes antes de colocar foto aqui.**

Sem esses arquivos, o funil desenha uma silhueta calculada a partir do IMC real
da pessoa: quem vai perder 4 kg vê uma diferença de 4 kg. Com foto fixa, todo
mundo passa a ver a **mesma** transformação — inclusive quem projetou 3 kg.
É exatamente esse descolamento entre a imagem e o número logo abaixo dela que
gera reembolso e reclamação.

Se for usar foto, use transformação discreta e mantenha o aviso de estimativa
(campo `nota` da etapa `projecao`). Depoimento real com autorização por escrito
é o único caso em que isso é seguro.

---

## `oferta/` — mockups dos planos (etapa 21)

| Arquivo | Proporção | Tamanho |
|---|---|---|
| `oferta-completo.webp` | livre (largura manda) | 800 de largura |
| `oferta-premium.webp` | livre (largura manda) | 800 de largura |

Mockup do produto: ebook, celular com a receita aberta, kit dos bônus. A altura
é livre — a imagem ocupa a largura do cartão e mantém a proporção.

Caminho definido em `assets/js/config.js`, campo `imagem` de cada oferta.

---

## Raiz — marca

| Arquivo | O que é |
|---|---|
| `logo.svg` | Logo do topo. Reconstrução vetorial do criativo. |
| `favicon.svg` | Ícone da aba. |

Para usar a logo original em vez da vetorizada, salve como `logo.webp`
(cerca de 340 × 84, fundo transparente) e troque o `src` **e** o `preload`
no `index.html`.
