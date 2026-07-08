/* ============================================================
   GOODCREDIT — Mortgage Simulator Engine
   Calculations, rates, amortization, currency formatting,
   and WhatsApp pre-filled messages
   ============================================================ */

(function (window) {
  'use strict';

  const GCSimulator = {};

  // North and Northeast states list
  const NORTH_NORTHEAST_UFS = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'MA', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO'
  ];

  // Brazilian States list
  GCSimulator.STATES = [
    { uf: 'AC', name: 'Acre', region: 'norte' },
    { uf: 'AL', name: 'Alagoas', region: 'nordeste' },
    { uf: 'AP', name: 'Amapá', region: 'norte' },
    { uf: 'AM', name: 'Amazonas', region: 'norte' },
    { uf: 'BA', name: 'Bahia', region: 'nordeste' },
    { uf: 'CE', name: 'Ceará', region: 'nordeste' },
    { uf: 'DF', name: 'Distrito Federal', region: 'centro-oeste' },
    { uf: 'ES', name: 'Espírito Santo', region: 'sudeste' },
    { uf: 'GO', name: 'Goiás', region: 'centro-oeste' },
    { uf: 'MA', name: 'Maranhão', region: 'nordeste' },
    { uf: 'MT', name: 'Mato Grosso', region: 'centro-oeste' },
    { uf: 'MS', name: 'Mato Grosso do Sul', region: 'centro-oeste' },
    { uf: 'MG', name: 'Minas Gerais', region: 'sudeste' },
    { uf: 'PA', name: 'Pará', region: 'norte' },
    { uf: 'PB', name: 'Paraíba', region: 'nordeste' },
    { uf: 'PR', name: 'Paraná', region: 'sul' },
    { uf: 'PE', name: 'Pernambuco', region: 'nordeste' },
    { uf: 'PI', name: 'Piauí', region: 'nordeste' },
    { uf: 'RJ', name: 'Rio de Janeiro', region: 'sudeste' },
    { uf: 'RN', name: 'Rio Grande do Norte', region: 'nordeste' },
    { uf: 'RS', name: 'Rio Grande do Sul', region: 'sul' },
    { uf: 'RO', name: 'Rondônia', region: 'norte' },
    { uf: 'RR', name: 'Roraima', region: 'norte' },
    { uf: 'SC', name: 'Santa Catarina', region: 'sul' },
    { uf: 'SP', name: 'São Paulo', region: 'sudeste' },
    { uf: 'SE', name: 'Sergipe', region: 'nordeste' },
    { uf: 'TO', name: 'Tocantins', region: 'norte' }
  ];

  // Bank Configuration details
  GCSimulator.BANKS = {
    'caixa': {
      id: 'caixa',
      name: 'Caixa Econômica',
      fixedRate: 11.49,
      indexer: 'TR',
      allowedAmortization: ['SAC', 'PRICE'],
      defaultAmortization: 'SAC',
      maxLTV: 0.80
    },
    'inter': {
      id: 'inter',
      name: 'Banco Inter',
      fixedRate: 9.50,
      indexer: 'IPCA',
      allowedAmortization: ['SAC'],
      defaultAmortization: 'SAC',
      maxLTV: 0.80
    },
    'bradesco_principal': {
      id: 'bradesco_principal',
      name: 'Bradesco Principal',
      fixedRate: 11.99,
      indexer: 'TR',
      allowedAmortization: ['SAC', 'PRICE'],
      defaultAmortization: 'SAC',
      maxLTV: 0.80
    },
    'bradesco_private': {
      id: 'bradesco_private',
      name: 'Bradesco Private',
      fixedRate: 11.70,
      indexer: 'TR',
      allowedAmortization: ['SAC', 'PRICE'],
      defaultAmortization: 'SAC',
      maxLTV: 0.80
    },
    'itau_uniclass': {
      id: 'itau_uniclass',
      name: 'Itaú Uniclass',
      fixedRate: 12.00,
      indexer: 'TR',
      allowedAmortization: ['PRICE'],
      defaultAmortization: 'PRICE',
      maxLTV: 0.80
    },
    'itau_personnalite': {
      id: 'itau_personnalite',
      name: 'Itaú Personnalité',
      fixedRate: 11.70,
      indexer: 'TR',
      allowedAmortization: ['PRICE'],
      defaultAmortization: 'PRICE',
      maxLTV: 0.80
    },
    'santander': {
      id: 'santander',
      name: 'Santander',
      fixedRate: 11.69,
      indexer: 'TR',
      allowedAmortization: ['SAC'],
      defaultAmortization: 'SAC',
      maxLTV: 0.80
    }
  };

  // Helper to determine if state is in North or Northeast
  function isNorthNortheast(uf) {
    return NORTH_NORTHEAST_UFS.includes(uf.toUpperCase());
  }

  // Get allowed amortization system for a bank
  GCSimulator.getBankAmortization = function (bankId) {
    const bank = GCSimulator.BANKS[bankId];
    return bank ? bank.allowedAmortization : ['SAC'];
  };

  // Currency utility formatting
  GCSimulator.formatCurrency = function (value) {
    if (value === undefined || value === null || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Parsing formatted currency back to number
  GCSimulator.parseCurrency = function (value) {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    let clean = value.replace(/[^\d]/g, '');
    let num = parseInt(clean, 10);
    if (isNaN(num)) return 0;
    return num / 100;
  };

  // Apply real-time BRL formatting mask to input
  GCSimulator.applyMask = function (inputEl) {
    if (!inputEl) return;

    // Helper to format input string to currency
    const formatValue = (val) => {
      let clean = val.replace(/[^\d]/g, '');
      if (clean === '') return '';
      let num = parseInt(clean, 10) / 100;
      return new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(num);
    };

    // Format initial value if any
    if (inputEl.value) {
      inputEl.value = formatValue(inputEl.value);
    }

    inputEl.addEventListener('input', (e) => {
      let cursorPosition = inputEl.selectionStart;
      let originalLength = inputEl.value.length;
      let formatted = formatValue(inputEl.value);
      inputEl.value = formatted;

      // Adjust cursor position
      let newLength = formatted.length;
      inputEl.setSelectionRange(cursorPosition + (newLength - originalLength), cursorPosition + (newLength - originalLength));
    });
  };

  // Determine rate and maxLTV based on bank and inputs (MCMV / Classe Média)
  GCSimulator.getRate = function (params) {
    const { bankId, income, propertyValue, modalidade, uf } = params;
    const bank = GCSimulator.BANKS[bankId];

    if (!bank) {
      return {
        rate: 11.49,
        indexer: 'TR',
        maxLTV: 0.80,
        productName: 'Padrão'
      };
    }

    // Default values
    let rate = bank.fixedRate;
    let indexer = bank.indexer;
    let maxLTV = bank.maxLTV;
    let productName = bank.name;

    // Caixa MCMV / Classe Média Check
    if (bankId === 'caixa' && income <= 13000) {
      const isNE = isNorthNortheast(uf);
      let appliedFaixa = null;

      if (income <= 2160 && propertyValue <= 275000) {
        appliedFaixa = 'Faixa 1';
        rate = isNE ? 4.5940 : 4.8548;
      } else if (income <= 2850 && propertyValue <= 275000) {
        appliedFaixa = 'Faixa 2';
        rate = isNE ? 4.8548 : 5.1162;
      } else if (income <= 3200 && propertyValue <= 275000) {
        appliedFaixa = 'Faixa 3';
        rate = isNE ? 5.1162 : 5.3782;
      } else if (income <= 3500 && propertyValue <= 275000) {
        appliedFaixa = 'Faixa 4';
        rate = isNE ? 5.3782 : 5.6408;
      } else if (income <= 4000 && propertyValue <= 275000) {
        appliedFaixa = 'Faixa 5';
        rate = 6.1678;
      } else if (income <= 5000 && propertyValue <= 275000) {
        appliedFaixa = 'Faixa 6';
        rate = 7.2290;
      } else if (income <= 9600 && propertyValue <= 400000) {
        appliedFaixa = 'Faixa 7';
        rate = 8.4722;
      } else if (income <= 13000 && propertyValue <= 600000) {
        appliedFaixa = 'Classe Média';
        rate = 10.47;
        maxLTV = (modalidade === 'novo') ? 0.80 : 0.60;
      }

      if (appliedFaixa) {
        productName = `Caixa MCMV (${appliedFaixa})`;
      } else {
        // Exceeded property limits for faixas, fall back to Caixa SBPE
        rate = 11.49;
        productName = 'Caixa SBPE';
      }
    } else if (bankId === 'santander') {
      // Santander rates depend on amortization (SAC vs PRICE)
      const isPrice = params.amortization === 'PRICE';
      rate = isPrice ? 14.04 : 11.69;
    }

    return {
      rate,
      indexer,
      maxLTV,
      productName
    };
  };

  // Perform mortgage simulation calculations
  GCSimulator.calculate = function (params) {
    const {
      propertyValue,
      downPayment,
      income,
      hasFgts,
      fgtsValue,
      bankId,
      modalidade,
      uf,
      termMonths
    } = params;

    const bank = GCSimulator.BANKS[bankId];
    const errors = [];
    const warnings = [];

    if (!bank) {
      return { success: false, errors: ['Banco inválido.'], warnings: [] };
    }

    // Resolve system of amortization compatibility
    let amortization = params.amortization || 'SAC';
    let amortizationAdjusted = false;

    if (!bank.allowedAmortization.includes(amortization)) {
      amortization = bank.defaultAmortization;
      amortizationAdjusted = true;
      warnings.push(`O sistema de amortização foi ajustado automaticamente conforme a política do banco selecionado.`);
    }

    // Resolve rate and limits
    const rateInfo = GCSimulator.getRate({
      bankId,
      income,
      propertyValue,
      modalidade,
      uf,
      amortization
    });

    const annualRate = rateInfo.rate;
    const indexer = rateInfo.indexer;
    const maxLTV = rateInfo.maxLTV;
    const productName = rateInfo.productName;

    // FGTS considered
    const fgtsUsed = hasFgts ? fgtsValue : 0;
    const totalEntry = downPayment + fgtsUsed;
    const financedValue = propertyValue - totalEntry;
    const ltv = financedValue / propertyValue;

    if (financedValue <= 0) {
      errors.push('O valor financiado deve ser maior do que zero. Ajuste o valor da entrada ou do FGTS.');
      return { success: false, errors, warnings };
    }

    // Check LTV limit
    if (ltv > maxLTV) {
      warnings.push(`Valor financiado acima do percentual recomendado para esta condição (${Math.round(maxLTV * 100)}%).`);
    }

    // Calculate monthly rate: i = (1 + annualRate/100)^(1/12) - 1
    const i = Math.pow(1 + (annualRate / 100), 1 / 12) - 1;
    const n = termMonths;

    let firstPayment = 0;
    let lastPayment = 0;

    if (amortization === 'PRICE') {
      // PRICE Formula: PMT = PV * i / (1 - (1 + i)^-n)
      firstPayment = financedValue * i / (1 - Math.pow(1 + i, -n));
      lastPayment = firstPayment; // Fixed payment
    } else {
      // SAC Formula
      const amortizationAmt = financedValue / n;
      // First payment: Amortization + PV * i
      firstPayment = amortizationAmt + financedValue * i;
      // Last payment: Amortization + balance_before_last_payment * i
      // Balance before last payment is exactly amortizationAmt
      lastPayment = amortizationAmt + amortizationAmt * i;
    }

    // Income commitment check based on first payment
    const incomeCommitment = (firstPayment / income) * 100;
    if (incomeCommitment > 30) {
      warnings.push('Atenção: A primeira parcela compromete mais de 30% da sua renda familiar bruta mensal.');
    }

    return {
      success: true,
      errors,
      warnings,
      bankName: bank.name,
      productName,
      propertyValue,
      downPayment,
      fgtsUsed,
      totalEntry,
      financedValue,
      ltv,
      ltvPercent: `${Math.round(ltv * 100)}%`,
      maxLTV,
      annualRate,
      monthlyRate: i * 100,
      indexer,
      termMonths,
      amortization,
      amortizationAdjusted,
      firstPayment,
      lastPayment,
      incomeCommitment,
      incomeCommitmentPercent: `${incomeCommitment.toFixed(1)}%`
    };
  };

  // Build url-encoded WhatsApp message with simulation details
  GCSimulator.buildWhatsAppMessage = function (result) {
    const fmt = GCSimulator.formatCurrency;
    const msg = `Olá! Fiz uma simulação de financiamento imobiliário no site da GoodCredit e gostaria de prosseguir com a análise:

🏦 Banco: ${result.bankName}
📋 Condição: ${result.productName}
🏠 Valor do Imóvel: ${fmt(result.propertyValue)}
💰 Entrada Recursos Próprios: ${fmt(result.downPayment)}
📥 FGTS considerado: ${fmt(result.fgtsUsed)}
💳 Valor Financiado Estimado: ${fmt(result.financedValue)} (${result.ltvPercent} do imóvel)
📅 Prazo: ${result.termMonths} meses
🔄 Amortização: ${result.amortization}
📈 Taxa de Referência: ${result.annualRate.toFixed(2)}% a.a. + ${result.indexer}
💵 Primeira Parcela: ${fmt(result.firstPayment)}
${result.amortization === 'SAC' ? `💵 Última Parcela: ${fmt(result.lastPayment)}\n` : ''}📉 Comprometimento de Renda: ${result.incomeCommitmentPercent}

Aguardo o retorno de um especialista.`;

    return encodeURIComponent(msg);
  };

  // Export to global scope
  window.GCSimulator = GCSimulator;

})(window);
