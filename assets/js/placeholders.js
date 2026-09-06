/* =========================================================================
   Mounjaro de Chia — placeholders em SVG

   Existem para que o funil rode inteiro ANTES de você ter as fotos. Cada
   opção do funnel.js tem um `ph` (chave daqui) e um `img` (caminho da foto
   real). Enquanto `img` for null, desenhamos o SVG abaixo.

   Para trocar por foto de verdade, edite funnel.js:
     { title: 'Mulher', img: 'assets/img/genero-mulher.webp', ph: 'genero-f' }

   Não precisa apagar o `ph`: ele vira o fallback se a imagem falhar.
   ========================================================================= */

const PH = (() => {

  /* `fit`: 'slice' preenche o quadro cortando as bordas (bom para retrato,
     que ocupa um cartão inteiro); 'meet' cabe inteiro sem cortar (bom para
     a silhueta de corpo dentro de uma miniatura quadrada, onde cortar a
     cabeça estraga a leitura). */
  const wrap = (vb, body, fit = 'slice') =>
    `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" ` +
    `aria-hidden="true" preserveAspectRatio="xMidYMid ${fit}">${body}</svg>`;

  /* Fundo suave padrão dos cartões. */
  const bg = (w, h) => `<rect width="${w}" height="${h}" fill="#E9FBF2"/>`;

  /* --------------------------------------------------------- silhuetas
     `t` é a largura relativa do tronco: 1 = magro, 1.5 = sobrepeso.
     Uma única função desenha todos os corpos — muda só o parâmetro. */
  const corpo = (t = 1, fem = true, fill = '#12B76A', op = 1) => {
    const cx = 100;
    const ombro = (fem ? 26 : 32) * t;
    const cintura = (fem ? 20 : 26) * t;
    const quadril = (fem ? 30 : 26) * t;
    const coxa = (fem ? 15 : 15) * t;

    return `
      <g fill="${fill}" opacity="${op}">
        <circle cx="${cx}" cy="42" r="20"/>
        <path d="
          M${cx - ombro} 78
          C${cx - ombro - 4} 100 ${cx - cintura} 118 ${cx - cintura} 140
          C${cx - cintura} 162 ${cx - quadril} 176 ${cx - quadril} 196
          L${cx - coxa - 6} 300 L${cx - coxa + 8} 300
          L${cx - 3} 200 L${cx + 3} 200
          L${cx + coxa - 8} 300 L${cx + coxa + 6} 300
          L${cx + quadril} 196
          C${cx + quadril} 176 ${cx + cintura} 162 ${cx + cintura} 140
          C${cx + cintura} 118 ${cx + ombro + 4} 100 ${cx + ombro} 78
          Z"/>
        <path d="M${cx - ombro} 80 L${cx - ombro - 12} 165 L${cx - ombro - 2} 168 L${cx - ombro + 10} 92 Z"/>
        <path d="M${cx + ombro} 80 L${cx + ombro + 12} 165 L${cx + ombro + 2} 168 L${cx + ombro - 10} 92 Z"/>
      </g>`;
  };

  /* Tronco isolado, usado nas etapas de área do corpo. */
  const tronco = (destaque) => {
    const zonas = {
      abdomen: `<ellipse cx="100" cy="132" rx="30" ry="26" fill="#F79009" opacity=".85"/>`,
      peito:   `<ellipse cx="100" cy="84"  rx="34" ry="20" fill="#F79009" opacity=".85"/>`,
      flancos: `<ellipse cx="66"  cy="126" rx="14" ry="24" fill="#F79009" opacity=".85"/>
                <ellipse cx="134" cy="126" rx="14" ry="24" fill="#F79009" opacity=".85"/>`,
      bracos:  `<ellipse cx="50"  cy="106" rx="12" ry="34" fill="#F79009" opacity=".85"/>
                <ellipse cx="150" cy="106" rx="12" ry="34" fill="#F79009" opacity=".85"/>`,
    };
    return wrap('0 0 200 200', `
      ${bg(200, 200)}
      <g fill="#0F1B17" opacity=".14">
        <circle cx="100" cy="34" r="17"/>
        <path d="M64 62 C60 82 72 100 72 124 C72 150 66 168 64 186 L136 186
                 C134 168 128 150 128 124 C128 100 140 82 136 62 Z"/>
        <path d="M64 64 L44 150 L56 154 L74 76 Z"/>
        <path d="M136 64 L156 150 L144 154 L126 76 Z"/>
      </g>
      ${zonas[destaque] || ''}
    `);
  };

  /* ------------------------------------------------------------ retrato
     Os dois cartões ficam lado a lado, então precisam se distinguir num
     relance: o feminino leva cabelo longo e ombros estreitos, o masculino
     cabelo curto e ombros largos. */
  const retrato = (fem) => {
    const corpoCor  = '#2ED08A';   // pele/tronco, tom claro
    const cabeloCor = '#0B6B3F';   // cabelo, tom escuro — é o contraste que
                                   // faz a silhueta ser lida como pessoa

    return wrap('0 0 300 400', `
      ${bg(300, 400)}
      <circle cx="150" cy="168" r="106" fill="#12B76A" opacity=".14"/>

      <!-- Ordem importa: tronco primeiro, cabelo depois. É assim que os
           cachos caem POR CIMA dos ombros em vez de sumirem atrás. -->

      <!-- tronco: ombros estreitos (f) ou largos (m) -->
      ${fem
        ? `<path d="M150 216 C114 216 86 248 78 300 C72 338 70 368 70 400
                    L230 400 C230 368 228 338 222 300 C214 248 186 216 150 216 Z"
                 fill="${corpoCor}"/>`
        : `<path d="M150 212 C104 212 66 246 58 302 C53 340 52 368 52 400
                    L248 400 C248 368 247 340 242 302 C234 246 196 212 150 212 Z"
                 fill="${corpoCor}"/>`}

      ${fem ? `
        <!-- massa de cabelo: desce pelas laterais e deixa o rosto livre -->
        <path d="M150 68 C104 68 84 106 84 152 L84 288
                 C84 300 104 302 108 288 L122 206
                 C122 176 130 152 150 152 C170 152 178 176 178 206
                 L192 288 C196 302 216 300 216 288 L216 152
                 C216 106 196 68 150 68 Z" fill="${cabeloCor}"/>` : ''}

      <!-- pescoço -->
      <rect x="134" y="184" width="32" height="42" rx="15" fill="${corpoCor}"/>

      <!-- cabeça -->
      <circle cx="150" cy="146" r="45" fill="${corpoCor}"/>

      <!-- cabelo por cima da testa -->
      ${fem
        ? `<path d="M107 140 C107 104 193 104 193 140
                    C193 112 174 98 150 98 C126 98 107 112 107 140 Z"
                 fill="${cabeloCor}"/>`
        : `<path d="M108 138 C108 110 192 110 192 138
                    C200 100 180 94 150 94 C120 94 100 100 108 138 Z"
                 fill="${cabeloCor}"/>`}
    `);
  };

  /* ----------------------------------------------------------- carrossel */
  const copo = () => wrap('0 0 400 250', `
    ${bg(400, 250)}
    <g>
      <path d="M150 60 L250 60 L238 210 C237 222 228 230 216 230
               L184 230 C172 230 163 222 162 210 Z"
            fill="#fff" stroke="#12B76A" stroke-width="4"/>
      <path d="M158 130 L242 130 L233 210 C232 222 224 230 213 230
               L187 230 C176 230 168 222 167 210 Z" fill="#12B76A" opacity=".28"/>
      <g fill="#0F1B17" opacity=".55">
        <circle cx="178" cy="158" r="4"/><circle cx="200" cy="146" r="4"/>
        <circle cx="220" cy="164" r="4"/><circle cx="190" cy="184" r="4"/>
        <circle cx="214" cy="196" r="4"/><circle cx="196" cy="212" r="4"/>
      </g>
    </g>
    <g fill="#12B76A" opacity=".5">
      <ellipse cx="88" cy="182" rx="34" ry="20" transform="rotate(-24 88 182)"/>
      <ellipse cx="316" cy="176" rx="30" ry="18" transform="rotate(18 316 176)"/>
    </g>
  `);

  const preparo = () => wrap('0 0 400 250', `
    ${bg(400, 250)}
    <rect x="70" y="150" width="260" height="18" rx="9" fill="#0F1B17" opacity=".12"/>
    <path d="M120 60 L280 60 L266 148 L134 148 Z" fill="#fff" stroke="#12B76A" stroke-width="4"/>
    <path d="M132 104 L268 104 L258 148 L142 148 Z" fill="#12B76A" opacity=".3"/>
    <g stroke="#12B76A" stroke-width="5" stroke-linecap="round" fill="none">
      <path d="M200 60 L214 26"/><path d="M170 60 L158 30"/>
    </g>
    <g fill="#12B76A"><circle cx="216" cy="22" r="7"/><circle cx="156" cy="26" r="7"/></g>
  `);

  const calendario = () => wrap('0 0 400 250', `
    ${bg(400, 250)}
    <rect x="96" y="52" width="208" height="164" rx="16" fill="#fff" stroke="#12B76A" stroke-width="4"/>
    <rect x="96" y="52" width="208" height="38" rx="16" fill="#12B76A"/>
    <rect x="96" y="76" width="208" height="14" fill="#12B76A"/>
    <g fill="#12B76A" opacity=".26">
      ${[0, 1, 2, 3, 4].map(c =>
        [0, 1, 2].map(r =>
          `<rect x="${118 + c * 34}" y="${106 + r * 34}" width="22" height="22" rx="6"/>`
        ).join('')).join('')}
    </g>
    <g fill="#12B76A">
      <rect x="118" y="106" width="22" height="22" rx="6"/>
      <rect x="152" y="106" width="22" height="22" rx="6"/>
      <rect x="186" y="106" width="22" height="22" rx="6"/>
    </g>
  `);

  const grafico = () => wrap('0 0 400 250', `
    ${bg(400, 250)}
    <g stroke="#D3DCD8" stroke-width="2">
      ${[0, 1, 2, 3].map(i => `<path d="M60 ${70 + i * 40} L344 ${70 + i * 40}"/>`).join('')}
    </g>
    <path d="M70 90 C130 96 160 140 210 168 C258 194 300 200 336 202"
          fill="none" stroke="#12B76A" stroke-width="6" stroke-linecap="round"/>
    <circle cx="70" cy="90" r="9" fill="#F04438"/>
    <circle cx="336" cy="202" r="9" fill="#12B76A"/>
  `);

  /* ------------------------------------------------------------ oferta */
  const oferta = (titulo, cor) => wrap('0 0 400 260', `
    <rect width="400" height="260" fill="${cor}" opacity=".1"/>
    <g transform="translate(96 30)">
      <rect x="6" y="8" width="140" height="196" rx="8" fill="#0F1B17" opacity=".16"/>
      <rect x="0" y="0" width="140" height="196" rx="8" fill="#fff" stroke="${cor}" stroke-width="3"/>
      <rect x="0" y="0" width="14" height="196" rx="4" fill="${cor}"/>
      <text x="80" y="84" text-anchor="middle" font-family="Poppins,Arial,sans-serif"
            font-size="13" font-weight="700" fill="#0F1B17">MOUNJARO</text>
      <text x="80" y="102" text-anchor="middle" font-family="Poppins,Arial,sans-serif"
            font-size="13" font-weight="700" fill="#0F1B17">DE CHIA</text>
      <text x="80" y="126" text-anchor="middle" font-family="Poppins,Arial,sans-serif"
            font-size="9" letter-spacing="1" fill="#6B7A75">${titulo}</text>
    </g>
    <g transform="translate(248 96)">
      <rect x="0" y="0" width="96" height="128" rx="6" fill="#fff" stroke="${cor}" stroke-width="3"/>
      <rect x="0" y="0" width="10" height="128" rx="3" fill="${cor}" opacity=".6"/>
    </g>
  `);

  /* ------------------------------------------------------------ registro */
  return {
    'genero-f': () => retrato(true),
    'genero-m': () => retrato(false),

    'corpo-f-1': () => wrap('0 0 200 320', corpo(0.92, true),  'meet'),
    'corpo-f-2': () => wrap('0 0 200 320', corpo(1.20, true),  'meet'),
    'corpo-f-3': () => wrap('0 0 200 320', corpo(1.55, true),  'meet'),
    'corpo-m-1': () => wrap('0 0 200 320', corpo(0.92, false), 'meet'),
    'corpo-m-2': () => wrap('0 0 200 320', corpo(1.20, false), 'meet'),
    'corpo-m-3': () => wrap('0 0 200 320', corpo(1.55, false), 'meet'),

    'area-abdomen': () => tronco('abdomen'),
    'area-peito':   () => tronco('peito'),
    'area-flancos': () => tronco('flancos'),
    'area-bracos':  () => tronco('bracos'),

    'ingredientes': copo,
    'preparo':      preparo,
    'rotina':       calendario,
    'resultado':    grafico,

    /* Antes/depois da projeção. `corpoFator` recebe a largura calculada a
       partir do IMC real, em vez de duas silhuetas fixas: assim a diferença
       na tela corresponde à diferença nos números logo acima dela. Duas
       figuras fixas mostrariam a mesma transformação enorme para quem vai
       perder 3 kg e para quem vai perder 20. */
    corpoFator: (t, fem, antes) =>
      wrap('0 0 200 320', corpo(t, fem, antes ? '#F04438' : '#12B76A', antes ? .7 : 1), 'meet'),

    /* Fallbacks fixos, usados se a pessoa pular as réguas de peso/altura. */
    'antes-f':  () => wrap('0 0 200 320', corpo(1.4,  true,  '#F04438', .7), 'meet'),
    'depois-f': () => wrap('0 0 200 320', corpo(1.05, true),                 'meet'),
    'antes-m':  () => wrap('0 0 200 320', corpo(1.4,  false, '#F04438', .7), 'meet'),
    'depois-m': () => wrap('0 0 200 320', corpo(1.05, false),                'meet'),

    'oferta-completo': () => oferta('PLANO COMPLETO', '#12B76A'),
    'oferta-premium':  () => oferta('PLANO PREMIUM',  '#E0B400'),
  };
})();
