/* =========================================================================
   Mounjaro de Chia — CONFIGURAÇÃO
   Este é o único arquivo que você precisa editar para colocar no ar:
   pixel, players de vídeo, links de checkout e preços.
   O conteúdo das perguntas fica em funnel.js. A lógica fica em app.js.
   ========================================================================= */

const CONFIG = {

  /* --------------------------------------------------------------- MARCA
     O nome sai em todos os textos via o token {{marca}}. Se um dia for
     preciso trocar "Mounjaro de Chia" (ver a nota sobre marca registrada
     no README), troque aqui e o funil inteiro acompanha. */
  marca: 'Mounjaro de Chia',


  /* ------------------------------------------------------------ RASTREIO
     Deixe vazio para desligar. Nada é carregado enquanto estiver vazio —
     o funil funciona normalmente sem pixel para você testar. */
  tracking: {
    metaPixelId:   '',   // ex.: '1234567890123456'
    tiktokPixelId: '',   // ex.: 'CXXXXXXXXXXXXXXXXXXX'
    ga4Id:         '',   // ex.: 'G-XXXXXXXXXX'

    // Dispara ViewContent a cada etapa do quiz. Deixe false para não
    // poluir o pixel: o padrão só manda os eventos que importam.
    eventoPorEtapa: false,
  },


  /* -------------------------------------------------------------- VÍDEOS
     Player de VSL (ConverteAI/VTurb, Panda, Vimeo...).
     `revealAt` = SEGUNDO DO VÍDEO em que o botão aparece. É tempo
     assistido, não tempo de tela: pausar o vídeo pausa a contagem.
     Para testar rápido, troque temporariamente por 5.

     Como preencher para ConverteAI/VTurb: pegue o ID da conta e o ID do
     player no embed que a plataforma te dá. Se preferir outro player,
     troque `embed` por qualquer HTML de iframe. */
  video: {
    // ID da sua conta ConverteAI/VTurb. Vazio = usa `embed` manual.
    converteAccount: '',

    vsl1:     { player: '', embed: '', revealAt: 760 },  // VSL do meio do funil
    vslFinal: { player: '', embed: '', revealAt: 260 },  // VSL da oferta
  },


  /* -------------------------------------------------------------- OFERTAS
     A ordem da lista é a ordem na tela. O plano de entrada vem primeiro:
     ancora o preço e deixa o premium logo abaixo, como upgrade.

     ⚠️ TROQUE OS LINKS DE CHECKOUT pelos SEUS. Os campos abaixo estão
     propositalmente vazios — o botão fica desabilitado até você preencher,
     para não subir no ar apontando para lugar nenhum. */
  ofertas: [
    {
      id:       'completo',
      nome:     'PLANO COMPLETO',
      imagem:   null,                     // ← 'assets/img/oferta-completo.webp'
      ph:       'oferta-completo',
      de:       'R$ 97,00',
      por:      'R$ 47,00',
      parcela:  'ou 12x no cartão • Pix aprovado na hora',
      checkout: '',                       // ← cole aqui o seu link
      cta:      'QUERO O PLANO COMPLETO — R$47',
      evento:   'checkout_click_completo',
      destaque: false,
      itens: [
        'Receita original do Mounjaro de Chia',
        'Protocolo de 30 dias passo a passo',
        '12 variações da receita para não enjoar',
        'Guia de horários e dosagem',
        'Acesso imediato e vitalício',
      ],
    },
    {
      id:       'premium',
      nome:     'PLANO PREMIUM',
      imagem:   null,                     // ← 'assets/img/oferta-premium.webp'
      ph:       'oferta-premium',
      de:       'R$ 197,00',
      por:      'R$ 97,00',
      parcela:  'ou 12x no cartão • Pix aprovado na hora',
      checkout: '',                       // ← cole aqui o seu link
      cta:      'QUERO O PLANO PREMIUM — R$97',
      evento:   'checkout_click_premium',
      destaque: true,
      itens: [
        'Tudo do Plano Completo',
        'Cardápio de 30 dias montado',
        'Protocolo anti-efeito-sanfona',
        'Lista de compras semanal',
        'Grupo de acompanhamento',
        'Bônus: 50 receitas detox',
      ],
    },
  ],


  /* -------------------------------------------------------- TESTE A/B
     Sorteia a variante na primeira visita e guarda no navegador, para a
     pessoa ver sempre a mesma. A variante vai junto nos eventos de pixel,
     o que permite atribuir venda por variante depois.
     Deixe `ativo: false` enquanto não estiver testando nada. */
  ab: {
    ativo: false,
    // Sobrescreve qualquer campo do CONFIG quando a variante B é sorteada.
    // Ex.: { video: { vsl1: { revealAt: 540 } } }
    B: {},
  },


  /* --------------------------------------------------------- COMPORTAMENTO */
  comportamento: {
    // Avança sozinho ao tocar numa opção de resposta única.
    avancoAutomatico: true,
    // Milissegundos entre o toque e o avanço (deixa a seleção ser vista).
    atrasoAvanco: 260,
    // Guarda as respostas no navegador: se a pessoa fechar e voltar, o
    // funil retoma de onde parou em vez de recomeçar.
    salvarProgresso: true,
    // Repassa utm_*, fbclid, gclid e ttclid para o link de checkout.
    repassarUtms: true,
  },


  /* ------------------------------------------------------------- RODAPÉ
     Aviso legal da página de oferta. Neste nicho ele não é opcional:
     é o que sustenta a promessa em caso de reclamação, e é a primeira
     coisa que a revisão de anúncio do Meta procura. */
  legal: {
    empresa:  'SUA EMPRESA LTDA — CNPJ 00.000.000/0001-00',
    email:    'suporte@seudominio.com.br',
    termos:   '#',
    privacidade: '#',
    aviso:
      'Os resultados variam de pessoa para pessoa e dependem de fatores ' +
      'individuais como alimentação, rotina, metabolismo e adesão ao ' +
      'protocolo. Os depoimentos apresentados são experiências individuais ' +
      'e não representam garantia de resultado. Este produto é um material ' +
      'informativo de receitas e hábitos alimentares: não é medicamento, ' +
      'não substitui acompanhamento médico ou nutricional e não tem ' +
      'qualquer relação com medicamentos de prescrição. Gestantes, ' +
      'lactantes, pessoas em uso de medicação contínua ou com condições ' +
      'de saúde preexistentes devem consultar um profissional antes de ' +
      'iniciar qualquer mudança alimentar.',
  },
};
