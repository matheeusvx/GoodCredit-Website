/* ============================================================
   GOODCREDIT — Main JavaScript
   Interactivity: header, mobile menu, animations, FAQ,
   simulator UI, WhatsApp integration
   ============================================================ */

const GC_WHATSAPP = '5511910510873';

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initFAQ();
  initCounters();
  initSmoothScroll();
  initSimulatorUI();
});


/* ─── Header Scroll Effect ─── */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ─── Mobile Menu ─── */
function initMobileMenu() {
  const toggle = document.querySelector('.header__toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const body = document.body;

  if (!toggle || !mobileNav) return;

  const menuIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  let isOpen = false;

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    mobileNav.classList.toggle('mobile-nav--open', isOpen);
    toggle.innerHTML = isOpen ? closeIcon : menuIcon;
    body.style.overflow = isOpen ? 'hidden' : '';

    const header = document.querySelector('.header');
    if (header && isOpen) {
      header.classList.add('header--scrolled');
    }
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      isOpen = false;
      mobileNav.classList.remove('mobile-nav--open');
      toggle.innerHTML = menuIcon;
      body.style.overflow = '';
    });
  });
}


/* ─── Scroll Animations (IntersectionObserver) ─── */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll, .animate-stagger');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  elements.forEach(el => observer.observe(el));
}


/* ─── FAQ Accordion ─── */
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq__question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq__item--open');
      items.forEach(i => i.classList.remove('faq__item--open'));
      if (!isOpen) {
        item.classList.add('faq__item--open');
      }
    });
  });
}


/* ─── Animated Counters ─── */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.counter, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = prefix + current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}


/* ─── Smooth Scroll for Anchors ─── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}


/* ─── Simulator UI Controller ─── */
function initSimulatorUI() {
  const form = document.getElementById('simulator-form');
  if (!form || typeof GCSimulator === 'undefined') return;

  // Apply currency masks
  const currencyInputs = form.querySelectorAll('[data-currency]');
  currencyInputs.forEach(input => GCSimulator.applyMask(input));

  // FGTS toggle
  const fgtsToggle = document.getElementById('sim-has-fgts');
  const fgtsGroup = document.getElementById('fgts-value-group');
  if (fgtsToggle && fgtsGroup) {
    fgtsToggle.addEventListener('change', () => {
      fgtsGroup.style.display = fgtsToggle.value === 'sim' ? 'block' : 'none';
      if (fgtsToggle.value === 'nao') {
        const fgtsInput = document.getElementById('sim-fgts-value');
        if (fgtsInput) fgtsInput.value = '';
      }
    });
  }

  // Bank selector - card selection
  const bankCards = form.querySelectorAll('.bank-card');
  const bankInput = document.getElementById('sim-bank');
  bankCards.forEach(card => {
    card.addEventListener('click', () => {
      bankCards.forEach(c => c.classList.remove('bank-card--selected'));
      card.classList.add('bank-card--selected');
      if (bankInput) bankInput.value = card.dataset.bank;
      checkAmortizationCompat();
    });
  });

  // Amortization compatibility check on bank or amortization change
  const amortInputs = form.querySelectorAll('input[name="sim-amortization"]');
  amortInputs.forEach(input => {
    input.addEventListener('change', checkAmortizationCompat);
  });

  function checkAmortizationCompat() {
    if (!bankInput || typeof GCSimulator === 'undefined') return;
    const bankId = bankInput.value;
    if (!bankId) return;

    const allowed = GCSimulator.getBankAmortization(bankId);
    const selected = form.querySelector('input[name="sim-amortization"]:checked');
    const amortWarning = document.getElementById('amort-warning');

    if (selected && !allowed.includes(selected.value)) {
      // Auto-adjust
      const defaultAmort = GCSimulator.BANKS[bankId].defaultAmortization;
      const correctInput = form.querySelector(`input[name="sim-amortization"][value="${defaultAmort}"]`);
      if (correctInput) correctInput.checked = true;
      if (amortWarning) {
        amortWarning.style.display = 'flex';
        amortWarning.textContent = 'O sistema de amortização foi ajustado automaticamente conforme a política do banco selecionado.';
      }
    } else {
      if (amortWarning) amortWarning.style.display = 'none';
    }
  }

  // Calculate button
  const calcBtn = document.getElementById('sim-calculate');
  if (calcBtn) {
    calcBtn.addEventListener('click', (e) => {
      e.preventDefault();
      runSimulation();
    });
  }
}


function runSimulation() {
  if (typeof GCSimulator === 'undefined') return;

  const form = document.getElementById('simulator-form');
  if (!form) return;

  const resultContainer = document.getElementById('simulator-result');
  const resultContent = document.getElementById('result-content');
  const resultAlerts = document.getElementById('result-alerts');

  // Gather inputs
  const propertyValue = GCSimulator.parseCurrency(document.getElementById('sim-property-value')?.value || '0');
  const downPayment = GCSimulator.parseCurrency(document.getElementById('sim-down-payment')?.value || '0');
  const income = GCSimulator.parseCurrency(document.getElementById('sim-income')?.value || '0');
  const hasFgts = document.getElementById('sim-has-fgts')?.value === 'sim';
  const fgtsValue = hasFgts ? GCSimulator.parseCurrency(document.getElementById('sim-fgts-value')?.value || '0') : 0;
  const bankId = document.getElementById('sim-bank')?.value || '';
  const modalidade = document.getElementById('sim-modalidade')?.value || 'usado';
  const uf = document.getElementById('sim-uf')?.value || 'SP';
  const termMonths = parseInt(document.getElementById('sim-term')?.value || '360', 10);
  const amortization = form.querySelector('input[name="sim-amortization"]:checked')?.value || 'SAC';

  // Validate required fields
  if (!bankId) {
    showSimError('Por favor, selecione um banco.');
    return;
  }
  if (propertyValue <= 0) {
    showSimError('Informe o valor do imóvel.');
    return;
  }
  if (income <= 0) {
    showSimError('Informe a renda bruta familiar.');
    return;
  }

  // Run calculation
  const result = GCSimulator.calculate({
    propertyValue,
    downPayment,
    income,
    hasFgts,
    fgtsValue,
    bankId,
    modalidade,
    uf,
    termMonths,
    amortization
  });

  // Display result
  if (resultContainer) {
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (resultAlerts) {
    resultAlerts.innerHTML = '';

    if (result.errors.length > 0) {
      result.errors.forEach(err => {
        resultAlerts.innerHTML += `<div class="simulator-pro__alert simulator-pro__alert--error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span>${err}</span>
        </div>`;
      });
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warn => {
        resultAlerts.innerHTML += `<div class="simulator-pro__alert simulator-pro__alert--warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>${warn}</span>
        </div>`;
      });
    }
  }

  if (resultContent && result.success) {
    const fmt = GCSimulator.formatCurrency;
    resultContent.innerHTML = `
      <div class="simulator-pro__result-header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>Resultado da Simulação</span>
      </div>
      <div class="simulator-pro__result-body">
        <div class="simulator-pro__result-highlight">
          <div class="simulator-pro__result-highlight-label">Primeira parcela estimada</div>
          <div class="simulator-pro__result-highlight-value">${fmt(result.firstPayment)}</div>
          ${result.amortization === 'SAC' ? `<div class="simulator-pro__result-highlight-sub">Última parcela: ${fmt(result.lastPayment)}</div>` : ''}
        </div>

        <div class="simulator-pro__result-rows">
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Banco</span>
            <span class="simulator-pro__result-value">${result.bankName}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Condição</span>
            <span class="simulator-pro__result-value">${result.productName}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Valor do imóvel</span>
            <span class="simulator-pro__result-value">${fmt(result.propertyValue)}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Entrada própria</span>
            <span class="simulator-pro__result-value">${fmt(result.downPayment)}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">FGTS considerado</span>
            <span class="simulator-pro__result-value">${fmt(result.fgtsUsed)}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Valor financiado</span>
            <span class="simulator-pro__result-value" style="font-weight:700;">${fmt(result.financedValue)}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">LTV</span>
            <span class="simulator-pro__result-value">${result.ltvPercent}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Prazo</span>
            <span class="simulator-pro__result-value">${result.termMonths} meses</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Sistema</span>
            <span class="simulator-pro__result-value">${result.amortization}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Taxa referência</span>
            <span class="simulator-pro__result-value">${result.annualRate.toFixed(4)}% a.a. + ${result.indexer}</span>
          </div>
          <div class="simulator-pro__result-row">
            <span class="simulator-pro__result-label">Comprometimento de renda</span>
            <span class="simulator-pro__result-value ${result.incomeCommitment > 30 ? 'text-warning' : ''}">${result.incomeCommitmentPercent}</span>
          </div>
        </div>

        <div class="simulator-pro__disclaimer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <p>Esta simulação é aproximada e serve apenas como referência. A aprovação, taxa final, valor de parcela e condições dependem da política vigente do banco, análise de crédito, avaliação do imóvel e validação documental. Não estão inclusos seguros, tarifas, TR, IPCA, taxas administrativas, avaliação, cartório ou custos acessórios.</p>
        </div>

        <div class="simulator-pro__cta">
          <a href="#" onclick="sendSimToWhatsApp(); return false;" class="btn btn--whatsapp btn--lg btn--block btn--pill">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Enviar simulação para um especialista
          </a>
        </div>
      </div>
    `;
  }
}

// Store last result for WhatsApp
let lastSimResult = null;

function sendSimToWhatsApp() {
  // Re-run to get fresh result
  const form = document.getElementById('simulator-form');
  if (!form || typeof GCSimulator === 'undefined') return;

  const propertyValue = GCSimulator.parseCurrency(document.getElementById('sim-property-value')?.value || '0');
  const downPayment = GCSimulator.parseCurrency(document.getElementById('sim-down-payment')?.value || '0');
  const income = GCSimulator.parseCurrency(document.getElementById('sim-income')?.value || '0');
  const hasFgts = document.getElementById('sim-has-fgts')?.value === 'sim';
  const fgtsValue = hasFgts ? GCSimulator.parseCurrency(document.getElementById('sim-fgts-value')?.value || '0') : 0;
  const bankId = document.getElementById('sim-bank')?.value || '';
  const modalidade = document.getElementById('sim-modalidade')?.value || 'usado';
  const uf = document.getElementById('sim-uf')?.value || 'SP';
  const termMonths = parseInt(document.getElementById('sim-term')?.value || '360', 10);
  const amortization = form.querySelector('input[name="sim-amortization"]:checked')?.value || 'SAC';

  const result = GCSimulator.calculate({
    propertyValue, downPayment, income, hasFgts, fgtsValue,
    bankId, modalidade, uf, termMonths, amortization
  });

  if (result.success) {
    const msg = GCSimulator.buildWhatsAppMessage(result);
    window.open(`https://wa.me/${GC_WHATSAPP}?text=${msg}`, '_blank');
  }
}

function showSimError(message) {
  const resultContainer = document.getElementById('simulator-result');
  const resultAlerts = document.getElementById('result-alerts');
  const resultContent = document.getElementById('result-content');

  if (resultContainer) resultContainer.style.display = 'block';
  if (resultContent) resultContent.innerHTML = '';
  if (resultAlerts) {
    resultAlerts.innerHTML = `<div class="simulator-pro__alert simulator-pro__alert--error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <span>${message}</span>
    </div>`;
  }

  if (resultContainer) {
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


/* ─── WhatsApp Link Functions ─── */
function openWhatsApp(customMessage) {
  const defaultMessage = 'Olá, gostaria de falar com um especialista da GoodCredit.';
  const message = encodeURIComponent(customMessage || defaultMessage);
  window.open(`https://wa.me/${GC_WHATSAPP}?text=${message}`, '_blank');
}

function openWhatsAppSimulacao() {
  const message = encodeURIComponent('Olá, gostaria de fazer uma simulação de financiamento imobiliário.');
  window.open(`https://wa.me/${GC_WHATSAPP}?text=${message}`, '_blank');
}

function openWhatsAppParceria() {
  const message = encodeURIComponent('Olá, sou corretor/imobiliária e gostaria de falar sobre parceria com a GoodCredit.');
  window.open(`https://wa.me/${GC_WHATSAPP}?text=${message}`, '_blank');
}

// Expose globally
window.openWhatsApp = openWhatsApp;
window.openWhatsAppSimulacao = openWhatsAppSimulacao;
window.openWhatsAppParceria = openWhatsAppParceria;
window.sendSimToWhatsApp = sendSimToWhatsApp;
window.runSimulation = runSimulation;
