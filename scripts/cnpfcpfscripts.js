document.addEventListener('DOMContentLoaded', () => {
    // === Elementos do DOM ===
    const inputField = document.getElementById('inputField');
    const validateBtn = document.getElementById('validateBtn');
    const generateBtn = document.getElementById('generateBtn');
    const resultCard = document.getElementById('resultCard');
    const resultStatus = document.getElementById('resultStatus');
    const resultDocument = document.getElementById('resultDocument');

    // Botões de Ação e Utilidade
    const copyBtn = document.getElementById('copyBtn');
    const shareBtn = document.getElementById('shareBtn');
    const historyBtn = document.getElementById('historyBtn');
    const tipsBtn = document.getElementById('tipsBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const clearHistoryBtn = document.getElementById('clearHistory');

    // Modais
    const historyModal = document.getElementById('historyModal');
    const tipsModal = document.getElementById('tipsModal');
    const aboutModal = document.getElementById('aboutModal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const historyList = document.getElementById('historyList');
    const toast = document.getElementById('toast');

    // Estado da Aplicação
    let history = JSON.parse(localStorage.getItem('cpfCnpjHistory')) || [];

    // =========================================================================
    // 1. LÓGICA MATEMÁTICA (PADRÃO GOVERNO BRASILEIRO - MÓDULO 11)
    // =========================================================================

    const clean = (doc) => String(doc || '').replace(/\D/g, '');

    const isRepeated = (doc) => {
        // recebe apenas dígitos (usando clean antes)
        if (!doc || doc.length === 0) return false;
        return doc.split('').every(char => char === doc[0]);
    };

    const calcDigit = (base, weights) => {
        // base: string de dígitos; weights: array de números (mesmo tamanho que base)
        let sum = 0;
        for (let i = 0; i < base.length; i++) {
            sum += parseInt(base[i], 10) * weights[i];
        }
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    // --- CPF ---
    const validateCPF = (cpf) => {
        const c = clean(cpf);
        if (c.length !== 11) return false;
        if (isRepeated(c)) return false;

        const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
        const d1 = calcDigit(c.substring(0, 9), w1);

        const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
        const d2 = calcDigit(c.substring(0, 9) + String(d1), w2);

        return c.slice(-2) === `${d1}${d2}`;
    };

    // --- Geração de CPF (aceita baseInput: string com 9 dígitos não formatada) ---
    const generateCPF = (mask = true, baseInput = null) => {
        let base;
        if (baseInput) {
            const cleaned = clean(baseInput);
            // Aceita apenas se tiver 9 dígitos (base sem DVs)
            if (cleaned.length === 9) base = cleaned;
        }

        const rnd = () => Math.floor(Math.random() * 10);
        if (!base) {
            base = Array.from({ length: 9 }, () => rnd()).join('');
            while (isRepeated(base)) base = Array.from({ length: 9 }, () => rnd()).join('');
        }

        const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
        const d1 = calcDigit(base, w1);

        const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
        const d2 = calcDigit(base + String(d1), w2);

        const cpf = `${base}${d1}${d2}`;
        return mask ? formatCPF(cpf) : cpf;
    };

    // --- CNPJ ---
    const validateCNPJ = (cnpj) => {
        const c = clean(cnpj);
        if (c.length !== 14) return false;
        if (isRepeated(c)) return false;

        const base12 = c.substring(0, 12);
        const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const d1 = calcDigit(base12, w1);

        const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const d2 = calcDigit(base12 + String(d1), w2);

        return c.slice(-2) === `${d1}${d2}`;
    };

    const generateCNPJ = (mask = true, baseInput = null) => {
        let base;

        if (baseInput) {
            const cleaned = clean(baseInput);
            if (cleaned.length === 12) {
                base = cleaned; // base de 12 (raiz + filial sem DVs)
            } else if (cleaned.length === 8) {
                base = cleaned + '0001'; // raiz -> adiciona filial padrão
            }
        }

        const rnd = () => Math.floor(Math.random() * 10);
        if (!base) {
            const root = Array.from({ length: 8 }, () => rnd()).join('');
            base = root + '0001';
            while (isRepeated(base.slice(0, 8))) {
                // evita raiz repetida (00000000, etc)
                const newRoot = Array.from({ length: 8 }, () => rnd()).join('');
                base = newRoot + '0001';
            }
        }

        const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const d1 = calcDigit(base, w1);

        const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const d2 = calcDigit(base + String(d1), w2);

        const cnpj = `${base}${d1}${d2}`;
        return mask ? formatCNPJ(cnpj) : cnpj;
    };

    // --- Formatação (sempre limpa antes) ---
    const formatCPF = (v) => {
        const s = clean(v);
        return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    };
    const formatCNPJ = (v) => {
        const s = clean(v);
        return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    };

    // =========================================================================
    // 2. LÓGICA DE INTERFACE E UTILITÁRIOS
    // =========================================================================

    const showToast = (msg) => {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const updateHistoryUI = () => {
        if (!historyList) return;
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; color:var(--on-surface-variant);">Nenhum histórico recente.</p>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = 'padding: 10px; border-bottom: 1px solid var(--outline); display: flex; justify-content: space-between; align-items: center;';

            const badgeColor = item.isValid ? 'var(--success)' : (item.action === 'Gerado' ? 'var(--warning)' : 'var(--error)');
            const icon = item.isValid ? 'check_circle' : (item.action === 'Gerado' ? 'auto_awesome' : 'error');

            div.innerHTML = `
                <div>
                    <span style="font-family: monospace; font-size: 16px; font-weight: bold;">${item.doc}</span>
                    <div style="font-size: 12px; color: var(--on-surface-variant);">${new Date(item.date).toLocaleString()}</div>
                </div>
                <div style="display:flex; align-items:center; gap:5px; color:${badgeColor}; font-weight:600; font-size:14px;">
                    <i class="material-icons" style="font-size:16px">${icon}</i>
                    ${item.action}
                </div>
            `;
            historyList.appendChild(div);
        });
    };

    const addToHistory = (doc, isValid, action) => {
        const newItem = {
            doc,
            isValid,
            action: isValid ? (action === 'validate' ? 'Válido' : 'Gerado') : 'Inválido',
            date: Date.now()
        };
        history.unshift(newItem);
        if (history.length > 50) history.pop(); // Mantém apenas os últimos 50
        localStorage.setItem('cpfCnpjHistory', JSON.stringify(history));
    };

    const showResult = (doc, isValid, type) => {
        if (!resultCard || !resultStatus || !resultDocument) return;
        resultCard.classList.add('visible');
        resultDocument.textContent = doc;

        resultStatus.className = 'result-status';
        if (type === 'generate') {
            resultStatus.classList.add('status-generated');
            resultStatus.textContent = 'Documento Gerado';
            addToHistory(doc, true, 'generate');
        } else {
            if (isValid) {
                resultStatus.classList.add('status-valid');
                resultStatus.innerHTML = '<i class="material-icons" style="vertical-align:bottom; font-size:18px">check</i> Documento Válido';
            } else {
                resultStatus.classList.add('status-invalid');
                resultStatus.innerHTML = '<i class="material-icons" style="vertical-align:bottom; font-size:18px">close</i> Documento Inválido';
            }
            addToHistory(doc, isValid, 'validate');
        }
    };

    // =========================================================================
    // 3. MÁSCARA E RESTRIÇÃO DE INPUT
    // =========================================================================

    if (inputField) {
        inputField.addEventListener('input', (e) => {
            let value = e.target.value;
            // Remove tudo que não for dígito
            const cleanedValue = value.replace(/\D/g, '');

            // Restringe o tamanho máximo para 14 (o maior possível)
            e.target.value = cleanedValue.substring(0, 14);
        });

        // Restrição de tamanho na saída (evento de foco perdido)
        inputField.addEventListener('blur', (e) => {
            const cleanInput = clean(e.target.value);
            const len = cleanInput.length;
            
            // Aceita apenas 9, 11, 12 ou 14 dígitos (tamanhos úteis para o app)
            if (len > 0 && len !== 9 && len !== 11 && len !== 12 && len !== 14) {
                // Limpa o campo se o tamanho for inválido e notifica o usuário
                e.target.value = '';
                showToast(`Entrada inválida. Use 9, 11, 12 ou 14 dígitos. Você digitou ${len}.`);
                return;
            } 
            
            // Auto-formata se o tamanho for de um documento completo (11 ou 14)
            if (len === 11) {
                e.target.value = formatCPF(cleanInput);
            } else if (len === 14) {
                e.target.value = formatCNPJ(cleanInput);
            }
        });
    }

    // =========================================================================
    // 4. HANDLERS DE EVENTOS
    // =========================================================================

    // Botão VALIDAR
    if (validateBtn) {
        validateBtn.addEventListener('click', () => {
            const input = inputField.value.trim();
            const cleanInput = clean(input);

            if (!cleanInput) {
                showToast('Por favor, digite um número.');
                return;
            }

            let isValid = false;
            let formatted = input;
            const len = cleanInput.length;

            if (len === 11) {
                isValid = validateCPF(cleanInput);
                formatted = formatCPF(cleanInput);
            } else if (len === 14) {
                isValid = validateCNPJ(cleanInput);
                formatted = formatCNPJ(cleanInput);
            } else {
                // Se o tamanho não for 11 ou 14, notifica que deve usar o Gerar
                showToast('Para validar, use 11 (CPF) ou 14 (CNPJ) dígitos completos.');
                return;
            }

            inputField.value = formatted; // Auto formata o input
            showResult(formatted, isValid, 'validate');
        });
    }

    // Botão GERAR
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const rawInput = inputField.value || '';
            const input = clean(rawInput);
            const len = input.length;
            let result;

            // ***** CORREÇÃO APLICADA AQUI *****
            // Bloqueia qualquer tamanho que não seja 0, 8, 9 ou 12.
            // Isso impede que 1, 2, ... 7, 10, 11, 13 e 14 caiam na geração aleatória.
            if (len !== 0 && len !== 8 && len !== 9 && len !== 12) {
                showToast(`Não é possível gerar. Use 9, 12 (Base) ou campo vazio. O tamanho atual é ${len}.`);
                return;
            }

            // Lógica de decisão baseada no tamanho do input
            if (len === 9) {
                // 9 dígitos = Base de CPF (gera os 2 dígitos verificadores)
                result = generateCPF(true, input);
            } else if (len === 12 || len === 8) {
                // 8 dígitos (Raiz CNPJ) ou 12 dígitos (Base CNPJ sem DVs)
                result = generateCNPJ(true, input);
            } else {
                // Se vazio (len === 0), sorteia um novo (50/50)
                const randomChoice = Math.random() > 0.5;
                result = randomChoice ? generateCPF() : generateCNPJ();
            }

            inputField.value = result;
            showResult(result, true, 'generate');
        });
    }

    // Botão COPIAR
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = resultDocument.textContent;
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => showToast('Copiado para a área de transferência!'))
                .catch(() => showToast('Não foi possível copiar (permissão negada).'));
        });
    }

    // Botão COMPARTILHAR
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const text = resultDocument.textContent;
            if (!text) return;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Valida Brasil',
                        text: `Documento validado/gerado: ${text}`,
                    });
                } catch (err) {
                    console.log('Compartilhamento cancelado ou falhou', err);
                    showToast('Compartilhamento cancelado.');
                }
            } else {
                showToast('Compartilhamento não suportado neste navegador.');
            }
        });
    }

    // =========================================================================
    // 5. MODAIS E CONTEÚDO (PRIVACIDADE E HISTÓRICO)
    // =========================================================================

    const openModal = (modal) => {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impede rolagem do fundo
    };

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    const setupPrivacyContent = () => {
        if (!aboutModal) return;
        const privacyContent = aboutModal.querySelector('.modal-section');
        if (privacyContent) {
            privacyContent.innerHTML = `
                <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid var(--success); margin-bottom: 20px;">
                    <h3 style="color: var(--success); margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
                        <i class="material-icons">security</i> SIGILO TOTAL GARANTIDO
                    </h3>
                    <p style="color: var(--on-surface); font-weight: 500;">
                        NENHUM dado é enviado para a internet.
                    </p>
                </div>
                <h3>Como funciona a segurança?</h3>
                <p>Este aplicativo opera 100% no seu navegador (Client-Side).</p>
                <ul style="margin-left: 20px; color: var(--on-surface-variant); margin-bottom: 15px;">
                    <li>O código de validação roda apenas no seu celular/computador.</li>
                    <li>Não possuímos banco de dados nem servidores de armazenamento.</li>
                    <li>O histórico fica salvo apenas na memória temporária do seu navegador (LocalStorage) e você pode apagá-lo a qualquer momento.</li>
                </ul>
                <p>Sinta-se seguro para validar documentos fiscais aqui.</p>
            `;
        }
    };

    // Eventos dos Botões de Modal
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            updateHistoryUI();
            openModal(historyModal);
        });
    }

    if (tipsBtn) {
        tipsBtn.addEventListener('click', () => openModal(tipsModal));
    }

    if (aboutBtn) {
        aboutBtn.addEventListener('click', () => {
            setupPrivacyContent();
            openModal(aboutModal);
        });
    }

    // Fechar Modais
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Limpar Histórico
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            history = [];
            localStorage.removeItem('cpfCnpjHistory');
            updateHistoryUI();
            showToast('Histórico apagado com sucesso.');
        });
    }

    // Inicializa UI com histórico (se houver)
    updateHistoryUI();
});
