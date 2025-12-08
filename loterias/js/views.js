import { MODALIDADES } from './modalidades.js';
import { state } from './app.js';
import { showMessage } from './utils.js';

export function showCalculadora() {
    const content = `
        <h2>💰 Calculadora de Preços</h2>
        <p class="text-body" style="margin-top: 8px;">
            Calcule valores de apostas para diferentes modalidades
        </p>
        
        <div class="modalidade-grid">
            ${Object.values(MODALIDADES).map(mod => `
                <div class="modalidade-card" onclick="selectModalidade(${mod.id}, 'calculadora')">
                    <div class="modalidade-icon">${mod.icon}</div>
                    <h4>${mod.nome}</h4>
                    <p class="text-caption" style="margin-top: 8px;">${mod.desc}</p>
                    <div style="margin-top: 16px;">
                        <span class="text-label">Clique para calcular</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

export function verDetalhesAposta(apostaId) {
    let apostaEncontrada = null;
    let modalidadeId = null;
    
    // Buscar aposta em todas as modalidades
    Object.entries(state.apostas).forEach(([modId, apostas]) => {
        const encontrada = apostas.find(a => a.id === apostaId);
        if (encontrada) {
            apostaEncontrada = encontrada;
            modalidadeId = modId;
        }
    });
    
    if (!apostaEncontrada) {
        showMessage('Aposta não encontrada', 'error');
        return;
    }
    
    const mod = MODALIDADES[modalidadeId];
    const content = `
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                <div>
                    <h2>${mod.icon} ${apostaEncontrada.nome}</h2>
                    <p class="text-caption">
                        ${mod.nome} • ${new Date(apostaEncontrada.data).toLocaleDateString('pt-BR')}
                    </p>
                </div>
                <button class="btn btn-text" onclick="showApostasSalvas()">
                    ← Voltar
                </button>
            </div>
            
            <div class="card">
                <h4 style="margin-bottom: 16px;">Detalhes da Aposta</h4>
                <div class="grid-2">
                    <div>
                        <p class="text-label">ID da Aposta</p>
                        <p class="text-body">${apostaEncontrada.id}</p>
                    </div>
                    <div>
                        <p class="text-label">Valor</p>
                        <p class="text-body" style="color: var(--md-primary); font-weight: 600;">
                            R$ ${apostaEncontrada.preco.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 24px;">
                <h4 style="margin-bottom: 16px;">Números Selecionados</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
                    ${apostaEncontrada.numeros.map(num => `
                        <div style="
                            width: 56px; height: 56px;
                            display: flex; align-items: center; justify-content: center;
                            background: var(--md-surface-3); color: var(--md-text-primary);
                            border-radius: 28px; font-weight: 600; font-size: 1.125rem;
                            border: 2px solid var(--md-outline);
                        ">
                            ${String(num).padStart(2, '0')}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="card-actions" style="margin-top: 24px;">
                <button class="btn btn-tonal" onclick="exportAposta(${apostaId})">
                    📥 Exportar Aposta
                </button>
                <button class="btn btn-text" onclick="excluirAposta(${apostaId})">
                    🗑️ Excluir Aposta
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

// Exportar funções para uso global
window.verDetalhesAposta = verDetalhesAposta;