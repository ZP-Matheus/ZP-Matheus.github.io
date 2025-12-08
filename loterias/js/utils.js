// Funções utilitárias gerais
export function showMessage(text, type = 'info') {
    const container = document.getElementById('message-container') || createMessageContainer();

    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.innerHTML = text;

    container.innerHTML = '';
    container.appendChild(message);

    // Auto-remover mensagem após 5 segundos
    setTimeout(() => {
        if (message.parentNode === container) {
            container.removeChild(message);
        }
    }, 5000);
}

function createMessageContainer() {
    const container = document.createElement('div');
    container.id = 'message-container';
    const contentArea = document.getElementById('content-area');
    if (contentArea) {
        contentArea.insertBefore(container, contentArea.firstChild);
    }
    return container;
}

export function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportAllData(state) {
    const dataStr = JSON.stringify(state, null, 2);
    const filename = `backup_loterias_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(dataStr, filename, 'application/json');
    showMessage('Dados exportados com sucesso!', 'success');
}

export function clearAllData() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('loterias_caixa_material_you');
        location.reload();
    }
}

// Views
export function showConsultarAposta() {
    document.getElementById('content-area').innerHTML = `
        <h2>🔍 Consultar Aposta</h2>
        <div class="card">
            <h4 style="margin-bottom: 16px;">Buscar Aposta</h4>
            <div class="input-group">
                <input type="text" 
                       class="number-input" 
                       placeholder="Digite o ID ou nome da aposta">
                <button class="btn btn-filled">Buscar</button>
            </div>
            <p class="text-caption" style="margin-top: 16px;">
                Em desenvolvimento - Em breve você poderá buscar apostas específicas por ID, nome ou data.
            </p>
        </div>
    `;
}

export function showGerarNumeros() {
    document.getElementById('content-area').innerHTML = `
        <h2>🎲 Gerar Números Aleatórios</h2>
        <div class="card">
            <h4 style="margin-bottom: 16px;">Gerador de Números</h4>
            <p class="text-body">
                Selecione uma modalidade para gerar números aleatórios.
            </p>
            <div style="margin-top: 20px;">
                <button class="btn btn-filled" onclick="window.showView('apostar')">
                    Ir para Apostas →
                </button>
            </div>
        </div>
    `;
}

export function showCalculadoraForm() {
    if (!window.state || !window.state.currentModalidade || !window.MODALIDADES) {
        showMessage('Erro ao carregar a calculadora', 'error');
        return;
    }

    const mod = window.MODALIDADES[window.state.currentModalidade];

    const content = `
        <div style="max-width: 600px; margin: 0 auto;">
            <h2>💰 Calculadora - ${mod.nome}</h2>
            <p class="text-body" style="margin-top: 8px;">
                Calcule o preço total de múltiplas apostas
            </p>
            
            <div class="grid-2" style="margin-top: 32px;">
                <div class="card">
                    <h4 style="margin-bottom: 12px;">Números por aposta</h4>
                    <input type="range" 
                           id="qtd-range"
                           min="${mod.min}" 
                           max="${mod.max}" 
                           value="${mod.min}"
                           style="width: 100%; margin: 16px 0;"
                           oninput="window.updateCalculadora()">
                    <div style="text-align: center; font-size: 2rem; color: var(--md-primary);">
                        <span id="qtd-display">${mod.min}</span>
                    </div>
                </div>
                
                <div class="card">
                    <h4 style="margin-bottom: 12px;">Quantidade de apostas</h4>
                    <input type="number"
                           id="qtd-apostas"
                           class="number-input"
                           value="1"
                           min="1"
                           max="100"
                           style="text-align: center; font-size: 1.5rem;"
                           oninput="window.updateCalculadora()">
                    <p class="text-caption" style="text-align: center; margin-top: 8px;">
                        apostas
                    </p>
                </div>
            </div>
            
            <div class="price-display" style="margin-top: 32px;">
                <div class="price-label">Preço Total</div>
                <div class="price-value" id="total-price">R$ ${mod.precoBase.toFixed(2)}</div>
                <div class="price-subtitle" id="price-breakdown">1 aposta de ${mod.min} números</div>
            </div>
            
            <button class="btn btn-text" onclick="window.showView('calculadora')" style="margin-top: 24px;">
                ← Voltar
            </button>
        </div>
    `;

    document.getElementById('content-area').innerHTML = content;
    updateCalculadora();
}

export function updateCalculadora() {
    const qtdRange = document.getElementById('qtd-range');
    const qtdApostas = document.getElementById('qtd-apostas');

    if (!qtdRange || !qtdApostas || !window.state || !window.calcularPrecoAposta) return;

    const qtd = parseInt(qtdRange.value);
    const apostas = parseInt(qtdApostas.value) || 1;
    const precoUnitario = window.calcularPrecoAposta(qtd, window.state.currentModalidade);
    const precoTotal = precoUnitario * apostas;

    const qtdDisplay = document.getElementById('qtd-display');
    const totalPrice = document.getElementById('total-price');
    const priceBreakdown = document.getElementById('price-breakdown');

    if (qtdDisplay) qtdDisplay.textContent = qtd;
    if (totalPrice) totalPrice.textContent = `R$ ${precoTotal.toFixed(2)}`;
    if (priceBreakdown) {
        priceBreakdown.textContent = `${apostas} ${apostas === 1 ? 'aposta' : 'apostas'} de ${qtd} números`;
    }
}

export function showRapidinha() {
    document.getElementById('content-area').innerHTML = `
        <h2>⚡ Rapidinha</h2>
        <div class="card">
            <h4 style="margin-bottom: 16px;">Aposta Rápida</h4>
            <p class="text-body">
                Gere uma aposta rápida com números aleatórios para qualquer modalidade.
            </p>
            <div style="margin-top: 20px;">
                <button class="btn btn-filled" onclick="window.showView('apostar')">
                    Criar Aposta Rápida →
                </button>
            </div>
        </div>
    `;
}

export function showCombinarApostas() {
    document.getElementById('content-area').innerHTML = `
        <h2>🔄 Combinar Apostas</h2>
        <div class="card">
            <h4 style="margin-bottom: 16px;">Combinador de Apostas</h4>
            <p class="text-body">
                Combine múltiplas apostas para criar novas combinações.
            </p>
            <p class="text-caption" style="margin-top: 16px;">
                Em desenvolvimento - Em breve você poderá combinar apostas existentes para criar novas jogadas.
            </p>
        </div>
    `;
}

export function showGuia() {
    document.getElementById('content-area').innerHTML = `
        <h2>📘 Guia das Modalidades</h2>
        <div class="grid-2">
            <div class="card">
                <h4>Mega-Sena</h4>
                <p class="text-caption">Sorteios: Quartas e Sábados</p>
                <p class="text-body">Acertando 6 números você ganha o prêmio principal.</p>
            </div>
            <div class="card">
                <h4>Lotofácil</h4>
                <p class="text-caption">Sorteios: Segunda, Quarta e Sexta</p>
                <p class="text-body">Acertando 15 números entre os 25 sorteados.</p>
            </div>
            <div class="card">
                <h4>Quina</h4>
                <p class="text-caption">Sorteios: Terça, Quinta e Sábado</p>
                <p class="text-body">Acertando 5 números você ganha o prêmio principal.</p>
            </div>
            <div class="card">
                <h4>Lotomania</h4>
                <p class="text-caption">Sorteios: Sábado</p>
                <p class="text-body">Escolha 50 números e concorra a vários prêmios.</p>
            </div>
        </div>
    `;
}

export function showComoUsar() {
    document.getElementById('content-area').innerHTML = `
        <h2>🎓 Como Usar</h2>
        <div class="card">
            <h4>Passo a Passo</h4>
            <ol style="margin: 16px 0 16px 20px; color: var(--md-text-secondary);">
                <li style="margin-bottom: 8px;">Selecione "Fazer Aposta" no menu</li>
                <li style="margin-bottom: 8px;">Escolha a modalidade desejada</li>
                <li style="margin-bottom: 8px;">Adicione seus números ou gere aleatórios</li>
                <li style="margin-bottom: 8px;">Confira o valor e salve sua aposta</li>
                <li>Consulte resultados na seção "Resultados"</li>
            </ol>
            <p class="text-caption">
                Todas as apostas são salvas localmente no seu navegador.
            </p>
        </div>
    `;
}

export function showLogs(state) {
    let logsContent = '';
    if (state && state.logs && state.logs.aplicacao) {
        Object.entries(state.logs.aplicacao).forEach(([data, logs]) => {
            logsContent += `<h4>${data}</h4>`;
            logs.forEach(log => {
                logsContent += `
                    <div style="margin-bottom: 8px; padding: 8px; background: var(--md-surface-2); border-radius: var(--radius-sm);">
                        <div style="font-size: 0.875rem; color: var(--md-text-secondary);">
                            ${new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        <div>${log.acao}</div>
                    </div>
                `;
            });
        });
    }

    document.getElementById('content-area').innerHTML = `
        <h2>📋 Logs do Sistema</h2>
        <div class="card">
            <h4 style="margin-bottom: 16px;">Atividades Registradas</h4>
            <div style="max-height: 400px; overflow-y: auto;">
                ${logsContent || '<p class="text-caption">Nenhum log registrado ainda.</p>'}
            </div>
            <button class="btn btn-text" onclick="window.clearLogs()" style="margin-top: 16px;">
                Limpar Logs
            </button>
        </div>
    `;
}

export function clearLogs() {
    if (confirm('Limpar todos os logs?')) {
        if (window.state) {
            window.state.logs = { aplicacao: {}, usuario: {} };
            if (window.saveState) {
                window.saveState();
            }
            showLogs(window.state);
        }
    }
}

// Exportar funções para escopo global
window.showCalculadoraForm = showCalculadoraForm;
window.updateCalculadora = updateCalculadora;
window.showConsultarAposta = showConsultarAposta;
window.showGerarNumeros = showGerarNumeros;
window.showRapidinha = showRapidinha;
window.showCombinarApostas = showCombinarApostas;
window.showGuia = showGuia;
window.showComoUsar = showComoUsar;
window.showLogs = showLogs;
window.clearLogs = clearLogs;