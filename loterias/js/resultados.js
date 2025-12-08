import { MODALIDADES } from './modalidades.js';
import { state, logUser } from './app.js';
import { showMessage, downloadFile } from './utils.js';

export async function fetchResultados(modalidadeId) {
    const container = document.getElementById('resultados-container');
    const mod = MODALIDADES[modalidadeId];

    if (!container) return;

    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p class="text-body">Buscando resultados da ${mod.nome}...</p>
        </div>
    `;

    try {
        // Simulação de API (substituir por API real)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Dados simulados
        const dataSimulada = {
            concurso: Math.floor(Math.random() * 1000) + 2500,
            data: new Date().toLocaleDateString('pt-BR'),
            dezenas: Array.from({ length: mod.min }, (_, i) =>
                String(Math.floor(Math.random() * mod.numeros) + 1).padStart(2, '0')
            ).sort((a, b) => parseInt(a) - parseInt(b))
        };

        state.resultados[modalidadeId] = dataSimulada;
        displayResultados(modalidadeId, dataSimulada);

    } catch (error) {
        container.innerHTML = `
            <div class="message message-error">
                <strong>Erro ao buscar resultados</strong><br>
                <span class="text-caption">${error.message}</span>
            </div>
        `;
    }
}

export function displayResultados(modalidadeId, data) {
    const mod = MODALIDADES[modalidadeId];
    const container = document.getElementById('resultados-container');

    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div>
                    <h3>${mod.nome} - Último Resultado</h3>
                    <p class="text-caption">Concurso ${data.concurso} • ${data.data}</p>
                </div>
                <button class="btn btn-tonal" onclick="Resultados.saveResultadoTxt(${modalidadeId})">
                    💾 Salvar
                </button>
            </div>
            
            <div style="margin: 24px 0;">
                <div style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
                    ${data.dezenas.map(num => `
                        <div style="
                            width: 56px; height: 56px;
                            display: flex; align-items: center; justify-content: center;
                            background: var(--md-primary); color: #000;
                            border-radius: 28px; font-weight: 600; font-size: 1.125rem;
                            box-shadow: var(--elevation-1);
                        ">
                            ${num}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="card-actions">
                <button class="btn btn-text" onclick="Resultados.fetchResultadoAnterior(${modalidadeId})">
                    ← Anterior
                </button>
                <button class="btn btn-text" onclick="Resultados.fetchProximoResultado(${modalidadeId})">
                    Próximo →
                </button>
            </div>
        </div>
    `;
    
    logUser('consulta_resultado', '1', mod.nome, data);
}

export function saveResultadoTxt(modalidadeId) {
    const mod = MODALIDADES[modalidadeId];
    const resultado = state.resultados[modalidadeId];
    
    if (!resultado) {
        showMessage('Nenhum resultado para salvar', 'error');
        return;
    }
    
    const content = `
${mod.nome} - Concurso ${resultado.concurso}
Data: ${resultado.data}
Números: ${resultado.dezenas.join(' ')}
    `.trim();
    
    const filename = `${mod.nome.replace(/\s+/g, '_')}_${resultado.concurso}.txt`;
    downloadFile(content, filename, 'text/plain');
    
    showMessage('Resultado salvo com sucesso!', 'success');
}

export function fetchResultadoAnterior(modalidadeId) {
    showMessage('Funcionalidade em desenvolvimento', 'warning');
}

export function fetchProximoResultado(modalidadeId) {
    showMessage('Funcionalidade em desenvolvimento', 'warning');
}

// Exportar funções para uso global
window.Resultados = {
    fetchResultados,
    saveResultadoTxt,
    fetchResultadoAnterior,
    fetchProximoResultado
};