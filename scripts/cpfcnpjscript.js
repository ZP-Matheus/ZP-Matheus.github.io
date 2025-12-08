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

    const clean = (doc) => doc.replace(/\D/g, '');

    const isRepeated = (doc) => {
        // Bloqueia números como 111.111.111-11 (matematicamente válidos, mas inválidos na regra de negócio)
        return doc.split('').every(char => char === doc[0]);
    };

    const calcDigit = (base, weights) => {
        let sum = 0;
        for (let i = 0; i < base.length; i++) {
            sum += parseInt(base[i]) * weights[i];
        }
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };

    // --- CPF ---
    const validateCPF = (cpf) => {
        const c = clean(cpf);
        if (c.length !== 11 || isRepeated(c)) return false;

        // Pesos para o 1º dígito (10 a 2)
        const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
        const d1 = calcDigit(c.substring(0, 9), w1);

        // Pesos para o 2º dígito (11 a 2)
        const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
        const d2 = calcDigit(c.substring(0, 9) + d1, w2);

        return c.slice(-2) === `${d1}${d2}`;
    };

    const generateCPF = (mask = true) => {
        const rnd = () => Math.floor(Math.random() * 10);
        let base = Array.from({ length: 9 }, rnd).join('');
        
        // Garante que não gerou repetidos
        while (isRepeated(base)) base = Array.from({ length: 9 }, rnd).join('');

        const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2];
        const d1 = calcDigit(base, w1);

        const w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
        const d2 = calcDigit(base + d1, w2);

        const cpf = `${base}${d1}${d2}`;
        return mask ? formatCPF(cpf) : cpf;
    };

    // --- CNPJ ---
    const validateCNPJ = (cnpj) => {
        const c = clean(cnpj);
        if (c.length !== 14 || isRepeated(c)) return false;

        // Pesos 1º dígito: 5,4,3,2,9,8,7,6,5,4,3,2
        const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const d1 = calcDigit(c.substring(0, 12), w1);

        // Pesos 2º dígito: 6,5,4,3,2,9,8,7,6,5,4,3,2
        const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const d2 = calcDigit(c.substring(0, 12) + d1, w2);

        return c.slice(-2) === `${d1}${d2}`;
    };

    const generateCNPJ = (mask = true) => {
        const rnd = () => Math.floor(Math.random() * 10);
        let base = Array.from({ length: 8 }, rnd).join(''); // Raiz
        base += '0001'; // Sufixo padrão de matriz

        const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const d1 = calcDigit(base, w1);

        const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const d2 = calcDigit(base + d1, w2);

        const cnpj = `${base}${d1}${d2}`;
        return mask ? formatCNPJ(cnpj) : cnpj;
    };

    // --- Formatação ---
    const formatCPF = (v) => v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    const formatCNPJ = (v) => v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");

    // =========================================================================
    // 2. LÓGICA DE INTERFACE E UTILITÁRIOS
    // =========================================================================

    const showToast = (msg) => {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    };

    const updateHistoryUI = () => {
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
    // 3. HANDLERS DE EVENTOS
    // =========================================================================

    // Botão VALIDAR
    validateBtn.addEventListener('click', () => {
        const input = inputField.value.trim();
        const cleanInput = clean(input);

        if (!cleanInput) {
            showToast('Por favor, digite um número.');
            return;
        }

        let isValid = false;
        let formatted = input;

        if (cleanInput.length === 11) {
            isValid = validateCPF(cleanInput);
            formatted = formatCPF(cleanInput);
        } else if (cleanInput.length === 14) {
            isValid = validateCNPJ(cleanInput);
            formatted = formatCNPJ(cleanInput);
        } else {
            showToast('Tamanho inválido (use 11 para CPF ou 14 para CNPJ).');
            return;
        }

        inputField.value = formatted; // Auto formata o input
        showResult(formatted, isValid, 'validate');
    });

    // Botão GERAR (Lógica consertada)
    generateBtn.addEventListener('click', () => {
        // Decide aleatoriamente se gera CPF ou CNPJ se o campo estiver vazio
        // Se o usuário digitou algo, tentamos inferir a intenção
        const input = clean(inputField.value);
        let result;

        if (input.length === 12 || input.length === 8) {
            // Intenção de CNPJ (Raiz 8 ou Base 12)
             result = generateCNPJ();
        } else {
            // Padrão ou Intenção de CPF
            // Se estiver vazio, 50% de chance para cada, ou padrão CPF
            const randomChoice = Math.random() > 0.5;
            result = randomChoice ? generateCPF() : generateCNPJ();
        }

        // Limpa o campo para mostrar que é um novo dado
        inputField.value = result;
        showResult(result, true, 'generate');
    });

    // Botão COPIAR
    copyBtn.addEventListener('click', () => {
        const text = resultDocument.textContent;
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => showToast('Copiado para a área de transferência!'));
    });

    // Botão COMPARTILHAR
    shareBtn.addEventListener('click', async () => {
        const text = resultDocument.textContent;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Valida Brasil',
                    text: `Documento validado/gerado: ${text}`,
                });
            } catch (err) {
                console.log('Compartilhamento cancelado');
            }
        } else {
            showToast('Compartilhamento não suportado neste navegador.');
        }
    });

    // =========================================================================
    // 4. MODAIS E CONTEÚDO (PRIVACIDADE E HISTÓRICO)
    // =========================================================================

    const openModal = (modal) => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impede rolagem do fundo
    };

    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Conteúdo Dinâmico de Privacidade (Sigilo Total)
    const setupPrivacyContent = () => {
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
    historyBtn.addEventListener('click', () => {
        updateHistoryUI();
        openModal(historyModal);
    });

    tipsBtn.addEventListener('click', () => openModal(tipsModal));
    
    aboutBtn.addEventListener('click', () => {
        setupPrivacyContent();
        openModal(aboutModal);
    });

    // Fechar Modais
    modalCloseButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            closeModal(e.target.closest('.modal'));
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Limpar Histórico
    clearHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        history = [];
        localStorage.removeItem('cpfCnpjHistory');
        updateHistoryUI();
        showToast('Histórico apagado com sucesso.');
        if (historyModal.classList.contains('active')) {
            updateHistoryUI(); // Atualiza visualmente se o modal estiver aberto
        }
    });
});
