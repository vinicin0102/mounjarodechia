/* =========================================================================
   Mounjaro de Chia — CONTEÚDO DO FUNIL
   Para mudar uma pergunta, edite o objeto — nunca o HTML.

   Tipos de etapa:
     quiz       resposta única (avança sozinho) ou `multi: true`
     measure    régua arrastável (peso / altura)
     form       campo de texto (nome)
     loading    tela de análise com checks animados
     vsl        vídeo + conteúdo que só aparece depois de N segundos
     projection gráfico antes/depois
     offer      vídeo + cartões de oferta

   Layouts de `quiz`:
     emoji      emoji à esquerda + texto        (1 coluna)
     image      cartão grande com imagem em cima (2 colunas)
     thumb      miniatura à esquerda + texto     (1 coluna)
     thumb-top  miniatura em cima + texto        (2 colunas)

   Imagens: enquanto `img` for null, o funil desenha um placeholder em SVG
   e funciona normalmente. Para usar suas fotos, troque por um caminho:
     img: 'assets/img/genero-mulher.webp'

   Tokens disponíveis em qualquer texto:
     {{marca}} {{nome}} {{delta}} {{area}} {{corpo}} {{faixa}}
     {{pesoAtual}} {{pesoObjetivo}} {{imc}} {{peso30}} {{perda30}}
   ========================================================================= */

const FUNNEL = [

  /* 0 ------------------------------------------------------------------- */
  {
    id: 'meta-peso',
    type: 'quiz',
    title: 'Quantos quilos você deseja perder com o {{marca}}?',
    layout: 'emoji',
    cols: 1,
    options: [
      { emoji: '🎯', title: 'Até 5 Kg',       meta: 5 },
      { emoji: '💪', title: '6 a 10 Kg',      meta: 8 },
      { emoji: '🔥', title: '11 a 15 Kg',     meta: 13 },
      { emoji: '⚡', title: '16 a 20 Kg',     meta: 18 },
      { emoji: '🚀', title: 'Mais de 20 Kg',  meta: 25 },
    ],
  },

  /* 1 ------------------------------------------------------------------- */
  {
    id: 'genero',
    type: 'quiz',
    title: 'Qual seu gênero?',
    subtitle: 'Selecione abaixo para personalizarmos seu protocolo',
    layout: 'image',
    cols: 2,
    options: [
      { value: 'f', title: 'Mulher', img: null, ph: 'genero-f' },
      { value: 'm', title: 'Homem',  img: null, ph: 'genero-m' },
    ],
  },

  /* 2 ------------------------------------------------------------------- */
  {
    id: 'idade',
    type: 'quiz',
    title: 'Qual é a sua idade?',
    layout: 'emoji',
    cols: 1,
    // `optionsBy` troca as opções conforme o gênero escolhido na etapa 1.
    optionsBy: {
      f: [
        { emoji: '👧',   title: 'Menos de 25', faixa: 'com menos de 25 anos' },
        { emoji: '👩',   title: '25 a 34',     faixa: 'entre 25 e 34 anos' },
        { emoji: '👱‍♀️', title: '35 a 44',     faixa: 'entre 35 e 44 anos' },
        { emoji: '🧑‍🦳', title: '45 a 54',     faixa: 'entre 45 e 54 anos' },
        { emoji: '👵',   title: '55+',         faixa: 'com 55 anos ou mais' },
      ],
      m: [
        { emoji: '👦',   title: 'Menos de 25', faixa: 'com menos de 25 anos' },
        { emoji: '👨',   title: '25 a 34',     faixa: 'entre 25 e 34 anos' },
        { emoji: '🧔',   title: '35 a 44',     faixa: 'entre 35 e 44 anos' },
        { emoji: '👨‍🦳', title: '45 a 54',     faixa: 'entre 45 e 54 anos' },
        { emoji: '👴',   title: '55+',         faixa: 'com 55 anos ou mais' },
      ],
    },
  },

  /* 3 ------------------------------------------------------------------- */
  {
    id: 'tipo-corpo',
    type: 'quiz',
    title: 'Como você classificaria seu corpo hoje?',
    layout: 'thumb',
    cols: 1,
    optionsBy: {
      f: [
        { title: 'Regular',   subtitle: 'Peso normal',     img: null, ph: 'corpo-f-1' },
        { title: 'Flácido',   subtitle: 'Pouca firmeza',   img: null, ph: 'corpo-f-2' },
        { title: 'Sobrepeso', subtitle: 'Gordura visível', img: null, ph: 'corpo-f-3' },
      ],
      m: [
        { title: 'Regular',   subtitle: 'Peso normal',     img: null, ph: 'corpo-m-1' },
        { title: 'Flácido',   subtitle: 'Pouca firmeza',   img: null, ph: 'corpo-m-2' },
        { title: 'Sobrepeso', subtitle: 'Gordura visível', img: null, ph: 'corpo-m-3' },
      ],
    },
  },

  /* 4 ------------------------------------------------------------------- */
  {
    id: 'area-gordura',
    type: 'quiz',
    /* Única etapa de múltipla escolha. Quem quer reduzir abdômen quase
       sempre quer os flancos junto, e resposta única obrigava a escolher
       só uma. Com `multi`, a etapa não avança sozinha: mostra CONTINUAR
       na primeira marcação. */
    multi: true,
    title: 'Em quais áreas você gostaria de reduzir mais gordura?',
    subtitle: 'Pode marcar mais de uma',
    layout: 'thumb-top',
    cols: 2,
    cta: 'CONTINUAR',
    options: [
      { title: 'Abdômen', img: null, ph: 'area-abdomen' },
      { title: 'Peito',   img: null, ph: 'area-peito' },
      { title: 'Flancos', img: null, ph: 'area-flancos' },
      { title: 'Braços',  img: null, ph: 'area-bracos' },
    ],
  },

  /* 5 ------------------------------------------------------------------- */
  {
    id: 'analise-1',
    type: 'loading',
    seconds: 6,
    /* Última tela antes da VSL 1: é aqui que a promessa de "protocolo
       personalizado" precisa virar algo concreto, com as respostas da
       própria pessoa na tela. */
    title: 'Analisando suas respostas...',
    subtitleBy: {
      f: 'Comparando seu perfil com o de mulheres {{faixa}} que também queriam reduzir {{area}}.',
      m: 'Comparando seu perfil com o de homens {{faixa}} que também queriam reduzir {{area}}.',
    },
    checks: [
      'Mapeando seu perfil: {{corpo}}, foco em {{area}}',
      'Comparando com quem perdeu {{delta}} kg no protocolo',
      'Ajustando o cálculo para quem está {{faixa}}',
    ],
  },

  /* 6 ------------------------------------------------------------------- */
  {
    id: 'vsl-1',
    type: 'vsl',
    video: 'vsl1',
    /* Quem escolheu "Até 5 Kg" costuma ser cerca de um quarto do tráfego e
       converte bem abaixo da média: a promessa de grande emagrecimento não
       é a dele. Para esse perfil a mensagem é sobre os últimos quilos. */
    hintBy: {
      by: 'meta-peso',
      'Até 5 Kg': 'Assista até o final para receber a receita ajustada para eliminar os últimos {{delta}} kg e definir {{area}}...',
      default:    'Assista até o final para receber a receita ajustada para perder {{delta}} kg e reduzir {{area}}...',
    },
    cta: 'PERSONALIZAR MINHA RECEITA',
  },

  /* 7 ------------------------------------------------------------------- */
  {
    id: 'peso-atual',
    type: 'measure',
    title: 'Qual é o seu peso atual?',
    kind: 'weight',
    min: 40, max: 200, initial: 80, step: 1,
    hint: 'Com isso ajustamos a dosagem ideal da receita para o seu peso.',
    drag: 'Arraste para ajustar o seu peso',
    cta: 'CONTINUAR',
  },

  /* 8 ------------------------------------------------------------------- */
  {
    id: 'altura',
    type: 'measure',
    title: 'Qual é a sua altura?',
    kind: 'height',
    min: 130, max: 220, initial: 165, step: 1,
    hint: 'Usaremos sua altura para calcular seu IMC e personalizar o protocolo.',
    drag: 'Arraste para ajustar',
    cta: 'CONTINUAR',
  },

  /* 9 ------------------------------------------------------------------- */
  {
    id: 'peso-objetivo',
    type: 'measure',
    title: 'Qual é o seu objetivo de peso?',
    kind: 'weight',
    min: 40, max: 200, initial: 65, step: 1,
    hint: 'É a partir daqui que montamos a projeção dos seus 30 dias.',
    drag: 'Arraste para ajustar o seu objetivo',
    cta: 'CONTINUAR',
  },

  /* 10 ------------------------------------------------------------------ */
  {
    id: 'impacto',
    type: 'quiz',
    title: 'Como o seu peso impacta sua vida hoje?',
    layout: 'emoji',
    cols: 1,
    optionsBy: {
      f: [
        { emoji: '📷', title: 'Evito tirar fotos por vergonha' },
        { emoji: '💔', title: 'Não me sinto mais desejada' },
        { emoji: '😞', title: 'Me sinto menos confiante' },
        { emoji: '🏠', title: 'Evito encontros ou situações sociais' },
        { emoji: '😴', title: 'Afeta minha energia e disposição' },
        { emoji: '✋', title: 'Nenhuma dessas' },
      ],
      m: [
        { emoji: '📷', title: 'Evito tirar fotos por vergonha' },
        { emoji: '💔', title: 'Não me sinto mais desejado' },
        { emoji: '😞', title: 'Me sinto menos confiante' },
        { emoji: '🏠', title: 'Evito encontros ou situações sociais' },
        { emoji: '😴', title: 'Afeta minha energia e disposição' },
        { emoji: '✋', title: 'Nenhuma dessas' },
      ],
    },
  },

  /* 11 ------------------------------------------------------------------ */
  {
    id: 'satisfacao',
    type: 'quiz',
    titleBy: {
      f: 'Você está realmente satisfeita com sua aparência?',
      m: 'Você está realmente satisfeito com sua aparência?',
    },
    layout: 'emoji',
    cols: 1,
    options: [
      { emoji: '😔', title: 'Não, me sinto acima do peso' },
      { emoji: '🤔', title: 'Mais ou menos, sei que posso melhorar' },
      { emoji: '💪', title: 'Quero mudar meu corpo e minha confiança' },
    ],
  },

  /* 12 ------------------------------------------------------------------ */
  {
    id: 'barreira',
    type: 'quiz',
    title: 'O que mais te impede de emagrecer hoje?',
    layout: 'emoji',
    cols: 1,
    options: [
      { emoji: '⏰', title: 'Falta de tempo / rotina corrida' },
      { emoji: '🍕', title: 'Falta de autocontrole' },
      { emoji: '😤', title: 'Já tentei de tudo e nada funciona' },
      { emoji: '💸', title: 'Alimentação cara ou difícil' },
    ],
  },

  /* 13 ------------------------------------------------------------------ */
  {
    id: 'agua',
    type: 'quiz',
    title: 'Quantos litros de água você costuma beber por dia?',
    layout: 'emoji',
    cols: 1,
    options: [
      { emoji: '☕', title: 'Bebo só café / pouca água' },
      { emoji: '💧', title: 'Até 2 litros' },
      { emoji: '💦', title: 'Entre 2 e 3 litros' },
      { emoji: '🌊', title: 'Mais de 3 litros' },
    ],
  },

  /* 14 ------------------------------------------------------------------ */
  {
    id: 'sono',
    type: 'quiz',
    title: 'Quantas horas de sono você tem por noite?',
    layout: 'emoji',
    cols: 1,
    options: [
      { emoji: '😵', title: 'Menos de 5 horas' },
      { emoji: '😐', title: 'Entre 5 e 7 horas' },
      { emoji: '😊', title: 'Entre 7 e 9 horas' },
      { emoji: '😴', title: 'Mais de 9 horas' },
    ],
  },

  /* 15 ------------------------------------------------------------------ */
  {
    id: 'rotina',
    type: 'quiz',
    title: 'Como é a sua rotina hoje?',
    layout: 'emoji',
    cols: 1,
    options: [
      { emoji: '🏃', title: 'Trabalho fora e tenho uma rotina corrida' },
      { emoji: '🪑', title: 'Trabalho sentado a maior parte do dia' },
      { emoji: '😰', title: 'Minha rotina é estressante e irregular' },
      { emoji: '🔄', title: 'Minha rotina mudou muito nos últimos anos' },
    ],
  },

  /* 16 ------------------------------------------------------------------ */
  {
    id: 'corpo-alvo',
    type: 'quiz',
    title: 'Qual é o corpo que você quer atingir?',
    layout: 'emoji',
    cols: 1,
    options: [
      { emoji: '💪',  title: 'Em forma',   subtitle: 'Corpo atlético e saudável' },
      { emoji: '🏋️', title: 'Tonificado', subtitle: 'Corpo firme com definição' },
    ],
  },

  /* 17 ------------------------------------------------------------------ */
  {
    id: 'nome',
    type: 'form',
    title: 'Qual seu nome?',
    subtitle: 'Vamos usar seu nome para montar seu protocolo personalizado do {{marca}}. 🧪',
    placeholder: 'Digite seu nome...',
    cta: 'CONTINUAR',
  },

  /* 18 ------------------------------------------------------------------ */
  {
    id: 'analise-2',
    type: 'loading',
    seconds: 8,
    title: 'Montando seu protocolo...',
    subtitle: '🧪 O sistema está analisando o seu perfil, {{nome}}...',
    carousel: ['ingredientes', 'preparo', 'rotina', 'resultado'],
    checks: [
      'Seu IMC é {{imc}}',
      'Ajustando a dosagem para {{pesoAtual}} kg',
      'Montando seu plano para perder {{delta}} kg',
      'Finalizando a fórmula de {{nome}}',
    ],
  },

  /* 19 ------------------------------------------------------------------ */
  {
    id: 'projecao',
    type: 'projection',
    /* Entra logo antes da oferta porque é ali que está o maior vazamento
       do funil: a maior parte de quem chega na oferta não clica no CTA.
       A ideia é a pessoa ver o resultado antes de começar a VSL final. */
    title: '{{nome}}, é isso que te espera em 30 dias',
    subtitle: 'De <strong>{{pesoAtual}} kg</strong> para <strong>{{peso30}} kg</strong> — <span class="accent-u">{{perda30}} quilos a menos</span> no primeiro mês.',
    antesLabel: 'Hoje',
    depoisLabel: 'Em 30 dias',
    imagens:   { antes: null, depois: null },
    nota: 'Projeção estimada com base nas suas respostas. Resultados variam de pessoa para pessoa.',
    cta:       'Sim, eu quero ter esse resultado',
    ctaSub:    'Protocolo personalizado de {{delta}} kg',
    ctaAlt:    'Não sei ainda, mas posso tentar',
    ctaAltSub: 'Ver o plano mesmo assim',
  },

  /* 20 ------------------------------------------------------------------ */
  {
    id: 'oferta',
    type: 'offer',
    video: 'vslFinal',
    note: 'Análise concluída com sucesso!',
    title: 'Analisamos suas respostas, {{nome}}!',
    /* "começando já nos próximos 30 dias" em vez de "em 30 dias": mantém a
       urgência sem prometer 25 kg em um mês para quem marcou "Mais de 20". */
    subtitle: 'Agora assista ao vídeo para descobrir como usar o <strong>{{marca}}</strong> para perder <span class="accent-u">{{delta}} quilos</span>, começando já nos próximos 30 dias...',
    title2: 'Fórmula personalizada para {{nome}}, com foco em {{area}}.',
  },
];
