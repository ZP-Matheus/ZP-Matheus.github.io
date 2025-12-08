import { MODALIDADES } from './modalidades.js';
import { state, logUser, saveState } from './app.js';
import { showMessage, downloadFile } from './utils.js';

// Gerenciamento de apostas
export function selectModalidade(modalidadeId, context) {
    state.currentModalidade = modalidadeId;
    state.currentNumbers = [];

    if (context === 'apostar') {
        showApostaForm();
    } else {
        showCalculadoraForm();
    }
}

export function showApostaForm() {
    const mod = MODALIDADES[state.currentModalidade];

    const content = `
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                    <h2>${mod.icon} ${mod.nome}</h2>
                    <p class="text-body" style="margin-top: 4px;">${mod.desc}</p>
                </div>
                <button class="btn btn-text" onclick="window.showView('apostar')">
                    ← Voltar
                </button>
            </div>
            
            <div id="message-container"></div>
            
            <div class="card">
                <h4 style="margin-bottom: 16px;">Seus Números</h4>
                <div class="number-chips" id="numbers-display">
                    ${state.currentNumbers.length === 0 ? 
                        '<div class="text-caption" style="text-align: center; width: 100%; padding: 16px;">Nenhum número adicionado ainda</div>' : 
                        state.currentNumbers.map(num => `
                            <div class="number-chip">
                                ${String(num).padStart(2, '0')}
                                <span class="remove" onclick="Apostas.removeNumber(${num})">×</span>
                            </div>
                        `).join('')
                    }
                </div>
                
                <div class="input-group" style="margin-top: 20px;">
                    <input type="number" 
                           id="number-input" 
                           class="number-input" 
                           placeholder="Digite um número de 1 a ${mod.numeros}"
                           min="1" 
                           max="${mod.numeros}">
                    <button class="btn btn-tonal" onclick="Apostas.addNumber()">Adicionar</button>
                    <button class="btn btn-text" onclick="Apostas.clearNumbers()">Limpar</button>
                    <button class="btn btn-text" onclick="Apostas.generateRandomNumbers()">🎲 Aleatório</button>
                </div>
            </div>
            
            <div class="price-display">
                <div class="price-label">Valor da Aposta</div>
                <div class="price-value" id="price-value">R$ 0,00</div>
                <div class="price-subtitle">${state.currentNumbers.length}/${mod.min} números mínimos</div>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 32px;">
                <button class="btn btn-filled" onclick="Apostas.saveAposta()" style="flex: 1;">
                    💾 Salvar Aposta
                </button>
                <button class="btn btn-outlined" onclick="window.showView('apostar')">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
    updateNumbersDisplay();
    updatePriceDisplay();
    
    // Adicionar evento de tecla Enter no input
    const input = document.getElementById('number-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addNumber();
            }
        });
        input.focus();
    }
}

export function addNumber() {
    const input = document.getElementById('number-input');
    const mod = MODALIDADES[state.currentModalidade];
    const num = parseInt(input.value);
    
    if (!num || num < 1 || num > mod.numeros) {
        showMessage('Número inválido!', 'error');
        return;
    }
    
    if (state.currentNumbers.includes(num)) {
        showMessage('Número já adicionado!', 'warning');
        return;
    }
    
    state.currentNumbers.push(num);
    input.value = '';
    input.focus();
    updateNumbersDisplay();
    updatePriceDisplay();
}

export function removeNumber(num) {
    state.currentNumbers = state.currentNumbers.filter(n => n !== num);
    updateNumbersDisplay();
    updatePriceDisplay();
}

export function clearNumbers() {
    state.currentNumbers = [];
    updateNumbersDisplay();
    updatePriceDisplay();
}

export function generateRandomNumbers() {
    const mod = MODALIDADES[state.currentModalidade];
    const qtd = mod.min;
    const numeros = [];
    
    while (numeros.length < qtd) {
        const num = Math.floor(Math.random() * mod.numeros) + 1;
        if (!numeros.includes(num)) {
            numeros.push(num);
        }
    }
    
    state.currentNumbers = numeros.sort((a, b) => a - b);
    updateNumbersDisplay();
    updatePriceDisplay();
    showMessage(`${qtd} números gerados aleatoriamente!`, 'success');
}

function updateNumbersDisplay() {
    const display = document.getElementById('numbers-display');
    const mod = MODALIDADES[state.currentModalidade];
    
    if (!display) return;
    
    if (state.currentNumbers.length === 0) {
        display.innerHTML = '<div class="text-caption" style="text-align: center; width: 100%; padding: 16px;">Nenhum número adicionado ainda</div>';
    } else {
        display.innerHTML = state.currentNumbers.map(num => `
            <div class="number-chip">
                ${String(num).padStart(2, '0')}
                <span class="remove" onclick="Apostas.removeNumber(${num})">×</span>
            </div>
        `).join('');
    }
    
    // Validar
    if (state.currentNumbers.length < mod.min) {
        showMessage(`Faltam ${mod.min - state.currentNumbers.length} números para completar a aposta mínima`, 'warning');
    } else if (state.currentNumbers.length > mod.max) {
        showMessage(`Ultrapassou o limite máximo de ${mod.max} números`, 'error');
    } else {
        clearMessage();
    }
}

function updatePriceDisplay() {
    const display = document.getElementById('price-value');
    if (!display) return;
    
    const mod = MODALIDADES[state.currentModalidade];
    const preco = calcularPrecoAposta(state.currentNumbers.length, state.currentModalidade);
    
    display.textContent = `R$ ${preco.toFixed(2)}`;
}

function calcularPrecoAposta(qtdNumeros, modalidadeId) {
    const tabela = {
        1: {6:6.00,7:42.00,8:168.00,9:504.00,10:1260.00,11:2772.00,12:5544.00,13:10296.00,14:18018.00,15:30030.00,16:48048.00,17:74256.00,18:111384.00,19:162792.00,20:232560.00},
        2: {15:3.50,16:56.00,17:476.00,18:2856.00,19:13566.00,20:45220.00},
        3: {5:3.00,6:18.00,7:63.00,8:180.00,9:450.00,10:990.00,11:1980.00,12:3600.00,13:6300.00,14:10500.00,15:17010.00},
        4: {50:3.00},
        5: {10:3.00},
        6: {6:3.00,7:21.00,8:84.00,9:252.00,10:630.00,11:1386.00,12:2772.00,13:5148.00,14:9009.00,15:15015.00},
        7: {14:4.00},
        8: {7:2.50,8:20.00,9:90.00,10:300.00,11:825.00,12:1980.00,13:4290.00,14:8580.00,15:16380.00},
        9: {6:6.00,7:42.00,8:168.00,9:504.00,10:1260.00,11:2772.00,12:5544.00},
        10: {7:3.00}
    }[modalidadeId];
    
    if (tabela && tabela[qtdNumeros] !== undefined) {
        return tabela[qtdNumeros];
    }
    
    const mod = MODALIDADES[modalidadeId];
    return mod.precoBase * Math.max(qtdNumeros - mod.min + 1, 1);
}

export async function saveAposta() {
    const mod = MODALIDADES[state.currentModalidade];
    
    if (state.currentNumbers.length < mod.min || state.currentNumbers.length > mod.max) {
        showMessage(`Aposta deve ter entre ${mod.min} e ${mod.max} números`, 'error');
        return;
    }
    
    const nome = prompt('Nome da aposta (ou deixe em branco para usar data/hora):') || 
                `aposta_${new Date().toISOString().replace(/[:.]/g, '-')}`;
    
    const aposta = {
        id: Date.now(),
        modalidade: state.currentModalidade,
        nome: nome,
        numeros: [...state.currentNumbers].sort((a, b) => a - b),
        data: new Date().toISOString(),
        preco: calcularPrecoAposta(state.currentNumbers.length, state.currentModalidade)
    };
    
    if (!state.apostas[state.currentModalidade]) {
        state.apostas[state.currentModalidade] = [];
    }
    state.apostas[state.currentModalidade].push(aposta);
    
    await saveApostaFile(aposta);
    saveState();
    
    showMessage('Aposta salva com sucesso!', 'success');
    
    setTimeout(() => {
        state.currentNumbers = [];
        showApostaForm();
    }, 1500);
    
    logUser('salvar_aposta', '2', mod.nome, aposta);
}

async function saveApostaFile(aposta) {
    const mod = MODALIDADES[aposta.modalidade];
    const content = aposta.numeros.map(n => String(n).padStart(2, '0')).join(' ');
    const filename = `${mod.nome.replace(/\s+/g, '_')}_${aposta.id}.txt`;
    downloadFile(content, filename, 'text/plain');
}

function clearMessage() {
    const container = document.getElementById('message-container');
    if (container) container.innerHTML = '';
}

// Views relacionadas a apostas
export function showApostasSalvas() {
    const totalApostas = Object.values(state.apostas).reduce((acc, arr) => acc + arr.length, 0);
    
    let content = `
        <h2>📁 Apostas Salvas</h2>
        <p class="text-body" style="margin-top: 8px;">
            Total de ${totalApostas} apostas registradas
        </p>
    `;
    
    if (totalApostas === 0) {
        content += `
            <div class="card" style="text-align: center; padding: 48px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📭</div>
                <h4 style="margin-bottom: 8px;">Nenhuma aposta salva</h4>
                <p class="text-body">Comece criando sua primeira aposta!</p>
                <button class="btn btn-filled" onclick="window.showView('apostar')" style="margin-top: 24px;">
                    Criar Primeira Aposta
                </button>
            </div>
        `;
    } else {
        Object.entries(state.apostas).forEach(([modalidadeId, apostas]) => {
            const mod = MODALIDADES[modalidadeId];
            content += `
                <h3 style="margin-top: 32px; margin-bottom: 16px;">${mod.icon} ${mod.nome}</h3>
            `;
            
            apostas.forEach(aposta => {
                content += `
                    <div class="aposta-item" onclick="verDetalhesAposta(${aposta.id})">
                        <div class="aposta-header">
                            <div>
                                <h4>${aposta.nome}</h4>
                                <p class="text-caption">${new Date(aposta.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div style="color: var(--md-primary); font-weight: 600;">
                                R$ ${aposta.preco.toFixed(2)}
                            </div>
                        </div>
                        <div class="aposta-numbers">
                            ${aposta.numeros.map(num => `
                                <div class="aposta-number">${String(num).padStart(2, '0')}</div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
        });
    }
    
    document.getElementById('content-area').innerHTML = content;
}

// Exportar funções para uso global
window.Apostas = {
    selectModalidade,
    addNumber,
    removeNumber,
    clearNumbers,
    generateRandomNumbers,
    saveAposta
};