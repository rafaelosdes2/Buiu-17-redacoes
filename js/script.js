/* ============================================================
   Comportamento do site
   - monta o acordeão a partir de js/redacoes.js
   - busca por título/tema
   - animação da linha do tempo
   - barra do topo
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. Monta o acordeão ---------- */
  const caixa = document.getElementById('accordion');

  function numero(i) {
    return String(i + 1).padStart(2, '0');
  }

  function montar(lista) {
    caixa.innerHTML = '';

    if (lista.length === 0) {
      caixa.innerHTML = '<p class="sem-resultado">Nenhuma redação encontrada.</p>';
      return;
    }

    lista.forEach(function (red) {
      const item = document.createElement('div');
      item.className = 'acc-item';

      const corpo = red.texto.length
        ? red.texto.map(function (p) { return '<p>' + p + '</p>'; }).join('')
        : '<p class="acc-vazia">O texto desta redação ainda não foi incluído no portfólio.</p>';

      item.innerHTML =
        '<button class="acc-head" aria-expanded="false">' +
          '<span class="acc-idx">' + numero(red.indice) + '</span>' +
          '<span class="acc-txt">' +
            '<span class="acc-titulo">' + red.titulo + '</span>' +
            '<span class="acc-tema">' + red.tema + '</span>' +
          '</span>' +
          '<span class="acc-sinal" aria-hidden="true"></span>' +
        '</button>' +
        '<div class="acc-painel">' +
          '<div class="acc-conteudo">' + corpo + '</div>' +
        '</div>';

      caixa.appendChild(item);
    });

    ligarCliques();
  }

  /* ---------- 2. Abrir e fechar ---------- */
  function ligarCliques() {
    caixa.querySelectorAll('.acc-head').forEach(function (botao) {
      botao.addEventListener('click', function () {
        const item   = botao.parentElement;
        const painel = item.querySelector('.acc-painel');
        const aberto = item.classList.contains('aberto');

        // fecha todos os outros
        caixa.querySelectorAll('.acc-item.aberto').forEach(function (outro) {
          if (outro !== item) {
            outro.classList.remove('aberto');
            outro.querySelector('.acc-painel').style.maxHeight = null;
            outro.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
          }
        });

        if (aberto) {
          item.classList.remove('aberto');
          painel.style.maxHeight = null;
          botao.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('aberto');
          painel.style.maxHeight = painel.scrollHeight + 'px';
          botao.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------- 3. Busca ---------- */
  const campo    = document.getElementById('busca');
  const contador = document.getElementById('contador');

  // guarda o índice original para a numeração não mudar ao filtrar
  const TODAS = REDACOES.map(function (r, i) {
    return { titulo: r.titulo, tema: r.tema, texto: r.texto, indice: i };
  });

  function limpar(txt) {
    return txt.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function atualizarContador(n) {
    contador.textContent = n === TODAS.length
      ? TODAS.length + ' redações'
      : n + ' de ' + TODAS.length;
  }

  campo.addEventListener('input', function () {
    const termo = limpar(campo.value.trim());
    const filtradas = termo === ''
      ? TODAS
      : TODAS.filter(function (r) {
          return limpar(r.titulo).includes(termo) || limpar(r.tema).includes(termo);
        });
    montar(filtradas);
    atualizarContador(filtradas.length);
  });

  montar(TODAS);
  atualizarContador(TODAS.length);

  /* ---------- 4. Linha do tempo aparecendo ---------- */
  const itens = document.querySelectorAll('.tl-item');

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visivel');
          observador.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    itens.forEach(function (i) { observador.observe(i); });
  } else {
    itens.forEach(function (i) { i.classList.add('visivel'); });
  }

  /* ---------- 5. Barra do topo ---------- */
  const barra = document.querySelector('.topbar');
  window.addEventListener('scroll', function () {
    barra.classList.toggle('scrolled', window.scrollY > 40);
  });

  /* ---------- 6. Visor de fotos ---------- */
  const visor   = document.getElementById('visor');
  const visorImg = document.getElementById('visorImg');
  const molduras = Array.prototype.slice.call(document.querySelectorAll('.moldura'));
  let atual = 0;

  function abrir(i) {
    atual = (i + molduras.length) % molduras.length;
    visorImg.src = molduras[atual].dataset.src;
    visor.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function fechar() {
    visor.hidden = true;
    visorImg.src = '';
    document.body.style.overflow = '';
  }

  molduras.forEach(function (m, i) {
    m.addEventListener('click', function () { abrir(i); });
  });

  document.getElementById('visorFechar').addEventListener('click', fechar);
  document.getElementById('visorAnt').addEventListener('click', function (e) {
    e.stopPropagation(); abrir(atual - 1);
  });
  document.getElementById('visorProx').addEventListener('click', function (e) {
    e.stopPropagation(); abrir(atual + 1);
  });

  visor.addEventListener('click', function (e) {
    if (e.target === visor) fechar();
  });

  document.addEventListener('keydown', function (e) {
    if (visor.hidden) return;
    if (e.key === 'Escape')     fechar();
    if (e.key === 'ArrowLeft')  abrir(atual - 1);
    if (e.key === 'ArrowRight') abrir(atual + 1);
  });

});
