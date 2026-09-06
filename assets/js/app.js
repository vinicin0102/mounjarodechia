/* =========================================================================
   Mounjaro de Chia — motor do funil

   Não há nada de conteúdo aqui. Perguntas ficam em funnel.js, preços e
   integrações em config.js. Este arquivo só sabe renderizar tipos de etapa.
   ========================================================================= */

(() => {
'use strict';

/* ------------------------------------------------------------------ ATALHOS */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls)  n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

const app        = $('#app');
const actionbar  = $('#actionbar');
const topbar     = $('#topbar');
const progressEl = $('#progress');
const btnBack    = $('#btn-back');

/* Etapas que entram na contagem "X de N". */
const NUMBERED = FUNNEL
  .filter(s => ['quiz', 'measure', 'form'].includes(s.type))
  .map(s => s.id);

const STORAGE = 'mdc.funil.v1';

/* -------------------------------------------------------------------- A/B */

/* Sorteia uma vez e guarda: a mesma pessoa precisa ver sempre a mesma
   variante, senão o teste não mede nada. */
function variante() {
  if (!CONFIG.ab || !CONFIG.ab.ativo) return 'A';
  let v = null;
  try { v = localStorage.getItem('mdc.ab'); } catch {}
  if (v !== 'A' && v !== 'B') {
    v = Math.random() < 0.5 ? 'A' : 'B';
    try { localStorage.setItem('mdc.ab', v); } catch {}
  }
  return v;
}

/* Mescla CONFIG.ab.B por cima do CONFIG quando a variante é B. */
function fundir(base, over) {
  if (!over || typeof over !== 'object') return base;
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  for (const k of Object.keys(over)) {
    out[k] = (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]))
      ? fundir(base[k] || {}, over[k])
      : over[k];
  }
  return out;
}

const AB  = variante();
const CFG = AB === 'B' ? fundir(CONFIG, CONFIG.ab.B) : CONFIG;

/* ----------------------------------------------------------------- ESTADO */

const state = {
  step: 0,
  genero: 'f',          // definido na etapa 1; 'f' é o padrão do tráfego
  respostas: {},        // { [idDaEtapa]: valor }
  nome: '',
};

function salvar() {
  if (!CFG.comportamento.salvarProgresso) return;
  try {
    localStorage.setItem(STORAGE, JSON.stringify({
      step: state.step, genero: state.genero,
      respostas: state.respostas, nome: state.nome, ts: Date.now(),
    }));
  } catch {}
}

function carregar() {
  if (!CFG.comportamento.salvarProgresso) return;
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return;
    const d = JSON.parse(raw);
    // Progresso de mais de 24h é lixo: a pessoa voltou por outro anúncio.
    if (!d || Date.now() - (d.ts || 0) > 864e5) return;
    Object.assign(state, {
      step: d.step | 0, genero: d.genero || 'f',
      respostas: d.respostas || {}, nome: d.nome || '',
    });
  } catch {}
}

/* -------------------------------------------------------------- DERIVADOS */

/* Tudo que os textos podem interpolar com {{token}}. Recalculado a cada
   render, porque cada resposta nova muda os números seguintes. */
function derivados() {
  const r = state.respostas;

  const pesoAtual    = Number(r['peso-atual'])    || 0;
  const altura       = Number(r['altura'])        || 0;
  const pesoObjetivo = Number(r['peso-objetivo']) || 0;

  // Meta declarada na etapa 1, usada enquanto a régua de peso não veio.
  const metaOpt   = opcaoEscolhida('meta-peso');
  const metaDecl  = metaOpt ? metaOpt.meta : 8;

  const delta = (pesoAtual && pesoObjetivo && pesoAtual > pesoObjetivo)
    ? Math.round(pesoAtual - pesoObjetivo)
    : metaDecl;

  const imc = (pesoAtual && altura)
    ? (pesoAtual / Math.pow(altura / 100, 2)).toFixed(1).replace('.', ',')
    : '—';

  /* Projeção de 30 dias. Limitada a ~7% do peso corporal para não prometer
     25 kg no primeiro mês para quem marcou "Mais de 20 Kg" — a promessa
     grande fica no protocolo inteiro, não no primeiro mês. */
  const perda30 = pesoAtual
    ? Math.max(2, Math.min(delta, Math.round(pesoAtual * 0.07)))
    : Math.min(delta, 6);
  const peso30 = pesoAtual ? pesoAtual - perda30 : 0;

  const areaOpts = (r['area-gordura'] || []);
  const area = listar(Array.isArray(areaOpts) ? areaOpts : [areaOpts]) || 'gordura localizada';

  const corpoOpt = opcaoEscolhida('tipo-corpo');
  const idadeOpt = opcaoEscolhida('idade');

  return {
    marca: CFG.marca,
    // `g` existe para caminhos de imagem: 'antes-{{g}}.webp' vira 'antes-f.webp'.
    g: state.genero,
    nome: state.nome || 'você',
    delta, imc, perda30,
    pesoAtual: pesoAtual || '—',
    pesoObjetivo: pesoObjetivo || '—',
    peso30: peso30 || '—',
    area,
    corpo: corpoOpt ? corpoOpt.title.toLowerCase() : 'seu perfil',
    faixa: idadeOpt && idadeOpt.faixa ? idadeOpt.faixa : 'na sua faixa de idade',
  };
}

/* "abdômen", "abdômen e flancos", "abdômen, flancos e braços" */
function listar(arr) {
  const a = arr.filter(Boolean).map(s => String(s).toLowerCase());
  if (!a.length) return '';
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1];
}

/* Devolve o OBJETO da opção escolhida (não só o texto), para ler campos
   extras como `meta` e `faixa`. */
function opcaoEscolhida(idEtapa) {
  const etapa = FUNNEL.find(s => s.id === idEtapa);
  if (!etapa) return null;
  const valor = state.respostas[idEtapa];
  if (valor == null) return null;
  return (opcoesDe(etapa) || []).find(o => (o.value || o.title) === valor) || null;
}

function opcoesDe(etapa) {
  if (etapa.optionsBy) return etapa.optionsBy[state.genero] || etapa.optionsBy.f;
  return etapa.options || [];
}

/* ------------------------------------------------------------- TEXTO/TOKENS */

function tk(str) {
  if (!str) return '';
  const d = derivados();
  return String(str).replace(/\{\{(\w+)\}\}/g, (m, k) => (k in d ? d[k] : m));
}

/* Escolhe entre `campo` e `campoBy` (variação por gênero). */
function porGenero(etapa, campo) {
  const by = etapa[campo + 'By'];
  if (by) return by[state.genero] || by.f;
  return etapa[campo];
}

/* ---------------------------------------------------------------- RASTREIO */

const track = (() => {
  const t = CFG.tracking || {};
  let pronto = false;

  function init() {
    if (pronto) return; pronto = true;

    if (t.metaPixelId) {
      /* eslint-disable */
      !function(f,b,e,v,n,t2,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t2=b.createElement(e);t2.async=!0;
      t2.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t2,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', t.metaPixelId);
      window.fbq('track', 'PageView');
    }

    if (t.tiktokPixelId) {
      /* eslint-disable */
      !function(w,d,s){w.TiktokAnalyticsObject=s;var ttq=w[s]=w[s]||[];
      ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];
      ttq.setAndDefer=function(t3,e){t3[e]=function(){t3.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.load=function(e){var r='https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
      ttq._o=ttq._o||{};ttq._o[e]={};var o=d.createElement('script');o.type='text/javascript';
      o.async=!0;o.src=r+'?sdkid='+e+'&lib='+s;var a=d.getElementsByTagName('script')[0];
      a.parentNode.insertBefore(o,a)};ttq.load(t.tiktokPixelId);ttq.page()}(window,document,'ttq');
      /* eslint-enable */
    }

    if (t.ga4Id) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + t.ga4Id;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', t.ga4Id);
    }
  }

  return function (evento, params) {
    init();
    const p = Object.assign({ variante: AB }, params || {});
    if (window.fbq)  window.fbq('trackCustom', evento, p);
    if (window.ttq)  window.ttq.track(evento, p);
    if (window.gtag) window.gtag('event', evento, p);
    // Sempre no console: dá para conferir o funil sem nenhum pixel ligado.
    if (location.hostname === 'localhost' || location.protocol === 'file:') {
      console.debug('[track]', evento, p);
    }
  };
})();

/* ----------------------------------------------------------------- UTMS */

/* Repassa os parâmetros da campanha para o checkout: sem isso a venda
   chega na plataforma sem origem e a otimização do anúncio fica cega. */
function comUtms(url) {
  if (!url || !CFG.comportamento.repassarUtms) return url;
  try {
    const destino = new URL(url, location.href);
    const origem  = new URLSearchParams(location.search);
    const chaves  = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term',
                     'fbclid','gclid','ttclid','xcod','sck','src'];
    for (const k of chaves) {
      const v = origem.get(k);
      if (v && !destino.searchParams.has(k)) destino.searchParams.set(k, v);
    }
    return destino.toString();
  } catch { return url; }
}

/* ------------------------------------------------------------------ MÍDIA */

/* Devolve <img> se houver foto configurada, senão o desenho de reserva.

   Os caminhos em funnel.js já apontam para os arquivos esperados em
   assets/img/, mesmo que eles ainda não existam: o onerror cai no
   placeholder. Na prática isso significa que colocar a foto na pasta com o
   nome certo já a coloca no ar, sem editar código, e que um arquivo faltando
   nunca deixa um buraco branco na tela.

   A reserva é `opt.svg` (SVG já pronto) ou `opt.ph` (chave do PH). */
function figura(opt, cls) {
  const box = el('div', cls || 'opt__figure');
  const reserva = opt.svg || (opt.ph && PH[opt.ph] ? PH[opt.ph]() : '');

  if (opt.img) {
    const img = el('img');
    img.src = tk(opt.img);          // aceita {{g}} para variar por gênero
    img.alt = opt.title || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = () => { box.innerHTML = reserva; };
    box.appendChild(img);
  } else {
    box.innerHTML = reserva;
  }
  return box;
}

const ICON_CHECK =
  '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">' +
  '<path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="3" ' +
  'stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* --------------------------------------------------------- BARRA DE AÇÃO */

function limparAcoes() {
  actionbar.innerHTML = '';
  actionbar.hidden = true;
  medirAcoes();
}

function acoes(botoes) {
  actionbar.innerHTML = '';
  const inner = el('div', 'actionbar__inner');
  botoes.forEach(b => inner.appendChild(b));
  actionbar.appendChild(inner);
  actionbar.hidden = false;
  medirAcoes();
}

/* O padding inferior do conteúdo depende da altura real da barra, que muda
   quando o CTA quebra em duas linhas ou quando há dois botões. */
function medirAcoes() {
  requestAnimationFrame(() => {
    const h = actionbar.hidden ? 0 : actionbar.offsetHeight;
    document.documentElement.style.setProperty('--actionbar-h', h + 'px');
  });
}

function botao(texto, sub, onClick, cls) {
  const b = el('button', 'btn' + (cls ? ' ' + cls : ''));
  b.type = 'button';
  b.appendChild(el('span', null, tk(texto)));
  if (sub) b.appendChild(el('span', 'btn__sub', tk(sub)));
  b.addEventListener('click', onClick);
  return b;
}

/* ------------------------------------------------------------- PROGRESSO */

function pintarProgresso(etapa) {
  const i = NUMBERED.indexOf(etapa.id);
  if (i < 0) { progressEl.hidden = true; return; }

  progressEl.hidden = false;
  const total = NUMBERED.length;
  const pct   = Math.round(((i + 1) / total) * 100);

  $('#progress-label').textContent = `Etapa ${i + 1} de ${total}`;
  $('#progress-pct').textContent   = pct + '%';
  $('#progress-fill').style.width  = pct + '%';
  $('#progress-bar').setAttribute('aria-valuenow', String(pct));
}

/* ------------------------------------------------------------- NAVEGAÇÃO */

function irPara(i, viaHash) {
  state.step = Math.max(0, Math.min(FUNNEL.length - 1, i));
  salvar();
  if (!viaHash) {
    const id = FUNNEL[state.step].id;
    if (location.hash !== '#/' + id) {
      history.pushState({ step: state.step }, '', '#/' + id);
    }
  }
  render();
}

const avancar = () => irPara(state.step + 1);
const voltar  = () => { if (state.step > 0) history.back(); };

window.addEventListener('popstate', () => {
  const id = location.hash.replace('#/', '');
  const i  = FUNNEL.findIndex(s => s.id === id);
  if (i >= 0 && i !== state.step) irPara(i, true);
});

/* ------------------------------------------------------------ RESPOSTAS */

function responder(etapa, valor) {
  state.respostas[etapa.id] = valor;
  if (etapa.id === 'genero') state.genero = valor;
  salvar();
  track('quiz_' + etapa.id.replace(/-/g, '_'), { resposta: String(valor) });
}

/* =========================================================================
   RENDER
   ========================================================================= */

function render() {
  const etapa = FUNNEL[state.step];
  app.innerHTML = '';
  limparAcoes();
  pintarProgresso(etapa);

  btnBack.classList.toggle('is-hidden', state.step === 0);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

  const box = el('div', 'step');
  app.appendChild(box);

  ({
    quiz:       renderQuiz,
    measure:    renderMeasure,
    form:       renderForm,
    loading:    renderLoading,
    vsl:        renderVsl,
    projection: renderProjection,
    offer:      renderOffer,
  }[etapa.type] || renderQuiz)(etapa, box);

  if (CFG.tracking.eventoPorEtapa) track('etapa_view', { etapa: etapa.id });
}

/* ------------------------------------------------------------------ QUIZ */

function renderQuiz(etapa, box) {
  const titulo = porGenero(etapa, 'title');
  box.appendChild(el('h1', 'step__title', tk(titulo)));

  const sub = porGenero(etapa, 'subtitle');
  if (sub) box.appendChild(el('p', 'step__sub', tk(sub)));

  const opts  = opcoesDe(etapa);
  const lista = el('div', 'options' + (etapa.cols === 2 ? ' options--2' : ''));

  // Em múltipla escolha a resposta é um array de títulos.
  const atual = state.respostas[etapa.id];
  const marcados = etapa.multi
    ? new Set(Array.isArray(atual) ? atual : [])
    : new Set(atual != null ? [atual] : []);

  opts.forEach(opt => {
    const valor = opt.value || opt.title;
    const b = el('button', 'opt opt--' + (etapa.layout || 'emoji'));
    b.type = 'button';
    if (marcados.has(valor)) b.classList.add('is-selected');

    if (etapa.layout === 'emoji') {
      b.appendChild(el('span', 'opt__emoji', opt.emoji || '•'));
    } else {
      b.appendChild(figura(opt));
    }

    const body = el('div', 'opt__body');
    body.appendChild(el('span', 'opt__title', tk(opt.title)));
    if (opt.subtitle) body.appendChild(el('span', 'opt__sub', tk(opt.subtitle)));
    b.appendChild(body);

    if (etapa.multi) b.appendChild(el('span', 'opt__check', ICON_CHECK));

    b.addEventListener('click', () => {
      if (etapa.multi) {
        marcados.has(valor) ? marcados.delete(valor) : marcados.add(valor);
        b.classList.toggle('is-selected', marcados.has(valor));
        state.respostas[etapa.id] = [...marcados];
        salvar();
        atualizarCtaMulti(etapa, marcados);
      } else {
        [...lista.children].forEach(c => c.classList.remove('is-selected'));
        b.classList.add('is-selected');
        responder(etapa, valor);
        if (CFG.comportamento.avancoAutomatico) {
          setTimeout(avancar, CFG.comportamento.atrasoAvanco);
        }
      }
    });

    lista.appendChild(b);
  });

  box.appendChild(lista);

  if (etapa.multi) atualizarCtaMulti(etapa, marcados);
  else if (!CFG.comportamento.avancoAutomatico) {
    acoes([botao(etapa.cta || 'CONTINUAR', null, () => {
      if (state.respostas[etapa.id] != null) avancar();
    })]);
  }
}

/* O CTA da etapa de múltipla escolha só existe depois da primeira marcação:
   antes disso ele só ocuparia espaço e sugeriria que dá para pular. */
function atualizarCtaMulti(etapa, marcados) {
  if (!marcados.size) { limparAcoes(); return; }
  acoes([botao(etapa.cta || 'CONTINUAR', null, () => {
    track('quiz_' + etapa.id.replace(/-/g, '_'), { resposta: [...marcados].join(', ') });
    avancar();
  })]);
}

/* --------------------------------------------------------------- MEDIDA */

function renderMeasure(etapa, box) {
  box.appendChild(el('h1', 'step__title', tk(porGenero(etapa, 'title'))));

  const unidade = etapa.kind === 'height' ? 'cm' : 'kg';
  let valor = Number(state.respostas[etapa.id]) || etapa.initial;
  valor = Math.min(etapa.max, Math.max(etapa.min, valor));

  const painel = el('div', 'measure');
  const leitura = el('div', 'measure__value');
  const numero  = el('span', null, String(valor));
  leitura.appendChild(numero);
  leitura.appendChild(el('span', 'measure__unit', unidade));
  painel.appendChild(leitura);

  /* régua ------------------------------------------------------------- */
  const PX = 12;                       // pixels por unidade
  const regua = el('div', 'ruler');
  regua.tabIndex = 0;
  regua.setAttribute('role', 'slider');
  regua.setAttribute('aria-label', tk(porGenero(etapa, 'title')));
  regua.setAttribute('aria-valuemin', String(etapa.min));
  regua.setAttribute('aria-valuemax', String(etapa.max));

  const ticks = el('div', 'ruler__ticks');
  for (let v = etapa.min; v <= etapa.max; v++) {
    const maior = v % 10 === 0;
    const t = el('span', 'ruler__tick' + (maior ? ' ruler__tick--major' : ''));
    t.style.left   = (v - etapa.min) * PX + 'px';
    t.style.height = maior ? '38px' : (v % 5 === 0 ? '26px' : '16px');
    ticks.appendChild(t);
    if (maior) {
      const lb = el('span', 'ruler__label', String(v));
      lb.style.left = (v - etapa.min) * PX + 'px';
      ticks.appendChild(lb);
    }
  }
  regua.appendChild(ticks);
  regua.appendChild(el('span', 'ruler__needle'));
  painel.appendChild(regua);

  if (etapa.drag) {
    painel.appendChild(el('p', 'measure__drag', '↔ ' + tk(etapa.drag)));
  }
  if (etapa.hint) {
    painel.appendChild(el('p', 'measure__hint', tk(etapa.hint)));
  }
  box.appendChild(painel);

  function pintar() {
    numero.textContent = String(valor);
    regua.setAttribute('aria-valuenow', String(valor));
    const centro = regua.offsetWidth / 2;
    ticks.style.transform = `translateX(${centro - (valor - etapa.min) * PX}px)`;
  }

  function definir(v) {
    const novo = Math.min(etapa.max, Math.max(etapa.min, Math.round(v)));
    if (novo === valor) return;
    valor = novo;
    pintar();
    if (navigator.vibrate) navigator.vibrate(3);
  }

  /* arraste — pointer events cobrem toque, mouse e caneta de uma vez */
  let arrastando = false, x0 = 0, v0 = 0;
  regua.addEventListener('pointerdown', e => {
    arrastando = true; x0 = e.clientX; v0 = valor;
    // Captura só melhora o arraste que sai do elemento; se o navegador
    // recusar o ponteiro, o arraste ainda funciona.
    try { regua.setPointerCapture(e.pointerId); } catch {}
  });
  regua.addEventListener('pointermove', e => {
    if (!arrastando) return;
    definir(v0 - (e.clientX - x0) / PX);
  });
  const soltar = () => { arrastando = false; };
  regua.addEventListener('pointerup', soltar);
  regua.addEventListener('pointercancel', soltar);

  regua.addEventListener('keydown', e => {
    const passo = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { definir(valor - passo); e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   { definir(valor + passo); e.preventDefault(); }
  });

  requestAnimationFrame(pintar);
  window.addEventListener('resize', pintar, { once: true });

  acoes([botao(etapa.cta || 'CONTINUAR', null, () => {
    responder(etapa, valor);
    avancar();
  })]);
}

/* ---------------------------------------------------------------- FORM */

function renderForm(etapa, box) {
  box.appendChild(el('h1', 'step__title', tk(porGenero(etapa, 'title'))));
  const sub = porGenero(etapa, 'subtitle');
  if (sub) box.appendChild(el('p', 'step__sub', tk(sub)));

  const campo = el('div', 'field');
  const input = el('input');
  input.type = 'text';
  input.placeholder = etapa.placeholder || '';
  input.value = state.nome;
  input.autocomplete = 'given-name';
  input.maxLength = 40;
  campo.appendChild(input);
  box.appendChild(campo);

  const enviar = () => {
    const v = input.value.trim();
    if (!v) { input.focus(); return; }
    // Só o primeiro nome, com a inicial maiúscula: é assim que ele aparece
    // no meio das frases nas telas seguintes.
    const primeiro = v.split(/\s+/)[0];
    state.nome = primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase();
    state.respostas[etapa.id] = state.nome;
    salvar();
    track('lead_nome');
    avancar();
  };

  input.addEventListener('keydown', e => { if (e.key === 'Enter') enviar(); });
  acoes([botao(etapa.cta || 'CONTINUAR', null, enviar)]);
}

/* ------------------------------------------------------------- LOADING */

function renderLoading(etapa, box) {
  const painel = el('div', 'loading');

  const anel = el('div', 'loading__ring', `
    <svg viewBox="0 0 100 100">
      <circle class="track" cx="50" cy="50" r="42"/>
      <circle class="bar"   cx="50" cy="50" r="42"
              stroke-dasharray="263.9" stroke-dashoffset="263.9"/>
    </svg>`);
  const pct = el('span', 'loading__pct', '0%');
  anel.appendChild(pct);
  painel.appendChild(anel);

  painel.appendChild(el('h1', 'step__title', tk(porGenero(etapa, 'title'))));
  const sub = porGenero(etapa, 'subtitle');
  if (sub) painel.appendChild(el('p', 'step__sub', tk(sub)));

  /* carrossel opcional */
  let itens = [];
  if (etapa.carousel && etapa.carousel.length) {
    const car = el('div', 'carousel');
    etapa.carousel.forEach((quadro, i) => {
      const item = el('div', 'carousel__item' + (i === 0 ? ' is-active' : ''));
      // Aceita { img, ph } ou só a chave do placeholder, como string.
      const cfg = typeof quadro === 'string' ? { ph: quadro } : quadro;
      item.appendChild(figura(cfg, 'carousel__figure'));
      car.appendChild(item);
      itens.push(item);
    });
    painel.appendChild(car);
  }

  /* checks */
  const ul = el('ul', 'checks');
  const linhas = (etapa.checks || []).map(texto => {
    const li = el('li', 'check');
    li.appendChild(el('span', 'check__icon', ICON_CHECK));
    li.appendChild(el('span', null, tk(texto)));
    ul.appendChild(li);
    return li;
  });
  painel.appendChild(ul);
  box.appendChild(painel);

  /* animação ---------------------------------------------------------- */
  const dur  = (etapa.seconds || 6) * 1000;
  const bar  = $('.bar', anel);
  const CIRC = 263.9;
  const t0   = performance.now();
  let carIdx = 0;

  const girar = itens.length ? setInterval(() => {
    itens[carIdx].classList.remove('is-active');
    carIdx = (carIdx + 1) % itens.length;
    itens[carIdx].classList.add('is-active');
  }, Math.max(1200, dur / (itens.length + 1))) : null;

  /* Trava de segurança: requestAnimationFrame não roda com a aba em segundo
     plano. Quem sai do navegador no meio da análise e volta depois ficaria
     preso nesta tela — o timer abaixo garante a saída de qualquer jeito. */
  let saiu = false;
  const meuStep = state.step;
  const sair = () => {
    if (saiu) return; saiu = true;
    if (girar) clearInterval(girar);
    // Se a pessoa apertou "voltar" no meio da análise, este timer não pode
    // arrastá-la para frente a partir da etapa onde ela está agora.
    if (state.step === meuStep) avancar();
  };
  const backstop = setTimeout(sair, dur + 2000);

  (function tick(now) {
    const p = Math.min(1, (now - t0) / dur);
    pct.textContent = Math.round(p * 100) + '%';
    bar.style.strokeDashoffset = String(CIRC * (1 - p));

    linhas.forEach((li, i) => {
      if (p >= (i + 1) / (linhas.length + 0.6)) li.classList.add('is-done');
    });

    if (p < 1) requestAnimationFrame(tick);
    else {
      clearTimeout(backstop);
      setTimeout(sair, 350);
    }
  })(t0);
}

/* ------------------------------------------------------------------ VSL */

/* Monta o player. Sem nada configurado, devolve um placeholder — o funil
   continua navegável para você testar o resto. */
function montarPlayer(chave) {
  const cfg = (CFG.video || {})[chave] || {};
  const frame = el('div', 'vsl__frame');

  if (cfg.embed) {
    frame.innerHTML = cfg.embed;
    return { frame, real: true };
  }

  if (cfg.player && CFG.video.converteAccount) {
    // Embed padrão ConverteAI/VTurb.
    const id = `vid-${CFG.video.converteAccount}-${cfg.player}`;
    frame.innerHTML = `<div id="${id}" style="display:block;margin:0 auto;width:100%"></div>`;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://scripts.converteai.net/${CFG.video.converteAccount}/players/${cfg.player}/player.js`;
    frame.appendChild(s);
    return { frame, real: true };
  }

  frame.appendChild(el('div', 'vsl__placeholder',
    '<div><strong>▶ Player não configurado</strong>' +
    'Abra <code>assets/js/config.js</code> e preencha ' +
    `<code>video.${chave}</code> com o ID do seu player ou um embed.<br>` +
    'Enquanto isso o botão aparece em 5 s, para você testar o funil.</div>'));
  return { frame, real: false };
}

/* Libera o conteúdo depois de N segundos ASSISTIDOS. Tenta o smartplayer
   (ConverteAI) e o <video> nativo; sem nenhum dos dois, cai para o relógio.
   Sem player configurado, libera em 5s para não travar o seu teste. */
function aoRevelar(segundos, real, callback) {
  /* A etapa em que o timer nasceu. Se a pessoa voltou, revelar o CTA na
     tela errada colocaria um botão de outra etapa na barra de ação. */
  const meuStep = state.step;
  const seguro = () => { if (state.step === meuStep) callback(); };

  if (!real) { setTimeout(seguro, 5000); return; }

  let feito = false;
  const disparar = () => { if (!feito) { feito = true; seguro(); } };

  const inicio = Date.now();
  const relogio = setInterval(() => {
    // Fallback: só vale se nenhum player reportou tempo até aqui.
    if ((Date.now() - inicio) / 1000 >= segundos) { clearInterval(relogio); disparar(); }
  }, 1000);

  // smartplayer da ConverteAI
  const buscar = setInterval(() => {
    const sp = window.smartplayer;
    const inst = sp && sp.instances && sp.instances[0];
    const video = document.querySelector('.vsl__frame video');

    if (inst && inst.on) {
      clearInterval(buscar);
      inst.on('timeupdate', () => {
        if (inst.video && inst.video.currentTime >= segundos) {
          clearInterval(relogio); disparar();
        }
      });
    } else if (video) {
      clearInterval(buscar);
      video.addEventListener('timeupdate', () => {
        if (video.currentTime >= segundos) { clearInterval(relogio); disparar(); }
      });
    }
  }, 500);
  setTimeout(() => clearInterval(buscar), 20000);
}

function renderVsl(etapa, box) {
  const painel = el('div', 'vsl');
  const { frame, real } = montarPlayer(etapa.video);
  painel.appendChild(frame);

  /* dica personalizada por resposta anterior */
  let dica = etapa.hint;
  if (etapa.hintBy) {
    const resp = state.respostas[etapa.hintBy.by];
    dica = etapa.hintBy[resp] || etapa.hintBy.default;
  }
  if (dica) painel.appendChild(el('p', 'vsl__hint', tk(dica)));

  box.appendChild(painel);
  track('vsl_view', { vsl: etapa.video });

  const seg = (CFG.video[etapa.video] || {}).revealAt || 0;
  aoRevelar(seg, real, () => {
    track('vsl_cta_visivel', { vsl: etapa.video });
    acoes([botao(etapa.cta || 'CONTINUAR', null, () => {
      track('vsl_cta_click', { vsl: etapa.video });
      avancar();
    }, 'btn--pulse')]);
  });
}

/* ------------------------------------------------------------- PROJEÇÃO */

function renderProjection(etapa, box) {
  const d = derivados();

  box.appendChild(el('h1', 'step__title step__title--lg', tk(porGenero(etapa, 'title'))));
  box.appendChild(el('p', 'step__sub', tk(porGenero(etapa, 'subtitle'))));

  const painel = el('div', 'projection');

  /* antes / depois */
  const altura = Number(state.respostas['altura']) || 0;
  const fem = state.genero === 'f';
  const svgAntes  = silhueta(d.pesoAtual, altura, fem, true);
  const svgDepois = silhueta(d.peso30,    altura, fem, false);

  const comp = el('div', 'compare');
  [
    { lbl: etapa.antesLabel,  cls: 'antes',  peso: d.pesoAtual,
      img: (etapa.imagens || {}).antes,  svg: svgAntes,  ph: 'antes-'  + state.genero },
    { lbl: etapa.depoisLabel, cls: 'depois', peso: d.peso30,
      img: (etapa.imagens || {}).depois, svg: svgDepois, ph: 'depois-' + state.genero },
  ].forEach(c => {
    const card = el('div', 'compare__card');
    card.appendChild(el('div', 'compare__label compare__label--' + c.cls, tk(c.lbl)));
    // Sem a foto, a reserva é a silhueta calculada pelo IMC — não o desenho
    // fixo, que mostraria a mesma transformação para qualquer resultado.
    card.appendChild(figura({ img: c.img, svg: c.svg, title: c.lbl }, 'compare__figure'));
    card.appendChild(el('div', 'compare__weight', c.peso + ' kg'));
    comp.appendChild(card);
  });
  painel.appendChild(comp);

  /* curva dos 30 dias */
  if (typeof d.pesoAtual === 'number' && typeof d.peso30 === 'number') {
    painel.appendChild(grafico(d.pesoAtual, d.peso30));
  }

  if (etapa.nota) painel.appendChild(el('p', 'projection__note', tk(etapa.nota)));
  box.appendChild(painel);

  acoes([
    botao(etapa.cta, etapa.ctaSub, () => {
      track('projecao_cta', { escolha: 'sim' });
      avancar();
    }),
    botao(etapa.ctaAlt, etapa.ctaAltSub, () => {
      track('projecao_cta', { escolha: 'talvez' });
      avancar();
    }, 'btn--ghost'),
  ]);
}

/* Largura da silhueta a partir do IMC real. Sem peso/altura (a pessoa pode
   ter entrado direto por um link), cai no placeholder fixo. */
function silhueta(peso, altura, fem, antes) {
  if (!PH.corpoFator || typeof peso !== 'number' || !altura) {
    const chave = (antes ? 'antes-' : 'depois-') + (fem ? 'f' : 'm');
    return PH[chave] ? PH[chave]() : '';
  }
  const imc = peso / Math.pow(altura / 100, 2);
  // IMC 21 = silhueta magra; cada ponto acima engrossa um pouco.
  const t = Math.max(0.85, Math.min(1.75, 0.9 + (imc - 21) * 0.055));
  return PH.corpoFator(t, fem, antes);
}

/* Curva de queda do peso ao longo de 30 dias. Desacelera no fim (ease-out),
   que é como a perda de peso realmente se comporta. */
function grafico(inicio, fim) {
  const W = 320, H = 150, PAD = 28;
  const pontos = [];
  for (let dia = 0; dia <= 30; dia++) {
    const t = dia / 30;
    const p = inicio - (inicio - fim) * (1 - Math.pow(1 - t, 1.8));
    pontos.push([
      PAD + (W - PAD * 2) * t,
      PAD + (H - PAD * 2) * ((inicio - p) / Math.max(1, inicio - fim)),
    ]);
  }
  const linha = pontos.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area  = linha + ` L${W - PAD} ${H - PAD + 10} L${PAD} ${H - PAD + 10} Z`;

  const wrap = el('div', 'chart');
  wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img"
         aria-label="Projeção de ${inicio} kg para ${fim} kg em 30 dias">
      <defs>
        <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#12B76A" stop-opacity=".28"/>
          <stop offset="100%" stop-color="#12B76A" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="gradLinha" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="#F04438"/>
          <stop offset="50%"  stop-color="#F79009"/>
          <stop offset="100%" stop-color="#12B76A"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#gradArea)"/>
      <path d="${linha}" fill="none" stroke="url(#gradLinha)" stroke-width="4"
            stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${pontos[0][0]}" cy="${pontos[0][1]}" r="6" fill="#F04438"/>
      <circle cx="${pontos[30][0]}" cy="${pontos[30][1]}" r="6" fill="#12B76A"/>
      <text x="${PAD}" y="${H - 6}" font-size="11" fill="#9AA8A3"
            font-family="Poppins,Arial,sans-serif">Hoje</text>
      <text x="${W - PAD}" y="${H - 6}" font-size="11" fill="#9AA8A3" text-anchor="end"
            font-family="Poppins,Arial,sans-serif">30 dias</text>
    </svg>`;
  return wrap;
}

/* --------------------------------------------------------------- OFERTA */

function renderOffer(etapa, box) {
  if (etapa.note) {
    const w = el('div', 'badge-wrap');
    w.appendChild(el('span', 'badge', ICON_CHECK + ' ' + tk(etapa.note)));
    box.appendChild(w);
  }

  box.appendChild(el('h1', 'step__title step__title--lg', tk(porGenero(etapa, 'title'))));
  box.appendChild(el('p', 'step__sub', tk(porGenero(etapa, 'subtitle'))));

  const painel = el('div', 'vsl');
  const { frame, real } = montarPlayer(etapa.video);
  painel.appendChild(frame);
  box.appendChild(painel);

  if (etapa.title2) {
    box.appendChild(el('p', 'step__sub', tk(etapa.title2)));
  }

  track('oferta_view');

  /* Os cartões só aparecem no pitch: mostrar preço antes da hora derruba a
     retenção do vídeo, que é o que faz a venda. */
  const area = el('div', 'reveal');
  box.appendChild(area);

  const seg = (CFG.video[etapa.video] || {}).revealAt || 0;
  aoRevelar(seg, real, () => {
    area.appendChild(planos());
    area.appendChild(rodape());
    area.classList.add('is-open');
    track('oferta_pitch_visivel');
    medirAcoes();
  });
}

function planos() {
  const lista = el('div', 'offer');

  (CFG.ofertas || []).forEach(of => {
    const card = el('div', 'offer__card' + (of.destaque ? ' offer__card--featured' : ''));
    card.appendChild(figura({ img: of.imagem, ph: of.ph, title: of.nome }, 'offer__figure'));

    const body = el('div', 'offer__body');
    body.appendChild(el('div', 'offer__name', of.nome));

    const ul = el('ul', 'offer__list');
    (of.itens || []).forEach(it => {
      const li = el('li');
      li.innerHTML = ICON_CHECK + '<span>' + tk(it) + '</span>';
      ul.appendChild(li);
    });
    body.appendChild(ul);

    const preco = el('div', 'offer__price');
    if (of.de) preco.appendChild(el('s', null, of.de));
    preco.appendChild(el('b', null, of.por));
    if (of.parcela) preco.appendChild(el('span', null, of.parcela));
    body.appendChild(preco);

    /* Sem link configurado o botão fica desabilitado, e não silenciosamente
       apontando para lugar nenhum. */
    if (of.checkout) {
      const a = el('a', 'btn' + (of.destaque ? ' btn--gold btn--pulse' : ''));
      a.href = comUtms(of.checkout);
      a.rel = 'noopener';
      a.appendChild(el('span', null, tk(of.cta)));
      a.addEventListener('click', () => {
        track(of.evento || 'checkout_click', { plano: of.id, preco: of.por });
        if (window.fbq) window.fbq('track', 'InitiateCheckout', { value: of.por, plano: of.id });
      });
      body.appendChild(a);
    } else {
      const b = el('button', 'btn');
      b.type = 'button';
      b.disabled = true;
      b.style.opacity = '.55';
      b.style.cursor = 'not-allowed';
      b.appendChild(el('span', null, 'CONFIGURE O CHECKOUT EM config.js'));
      body.appendChild(b);
    }

    card.appendChild(body);
    lista.appendChild(card);
  });

  return lista;
}

function rodape() {
  const L = CFG.legal || {};
  const f = el('footer', 'legal');
  if (L.aviso) f.appendChild(el('p', null, L.aviso));
  f.appendChild(el('p', null,
    [L.empresa, L.email].filter(Boolean).join(' • ')));
  f.appendChild(el('p', null,
    `<a href="${L.termos || '#'}">Termos de uso</a> • ` +
    `<a href="${L.privacidade || '#'}">Política de privacidade</a>`));
  f.appendChild(el('p', null,
    'Este site não é afiliado, endossado ou patrocinado pela Meta, ' +
    'pelo TikTok ou por qualquer laboratório farmacêutico. Marcas ' +
    'citadas pertencem aos seus respectivos titulares.'));
  return f;
}

/* ------------------------------------------------------------------ BOOT */

btnBack.addEventListener('click', voltar);
window.addEventListener('resize', medirAcoes);

carregar();

/* A URL manda: um anúncio pode apontar direto para #/meta-peso, e o botão
   voltar do navegador precisa funcionar como a pessoa espera. */
const alvo = location.hash.replace('#/', '');
const iAlvo = FUNNEL.findIndex(s => s.id === alvo);
if (iAlvo >= 0) state.step = iAlvo;
else history.replaceState({ step: state.step }, '', '#/' + FUNNEL[state.step].id);

track('funil_inicio', { etapa: FUNNEL[state.step].id });
render();

})();
