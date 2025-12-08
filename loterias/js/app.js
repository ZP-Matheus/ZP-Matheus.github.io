// Configurações principais
import { MODALIDADES, TABELA_PRECOS, calcularPrecoAposta } from './modalidades.js';
import { showCalculadora, verDetalhesAposta } from './views.js';
import { selectModalidade, showApostaForm, showApostasSalvas } from './apostas.js';
import { fetchResultados } from './resultados.js';
import {
    showMessage,
    downloadFile,
    exportAllData,
    clearAllData,
    showLogs,
    showConsultarAposta,
    showGerarNumeros,
    showRapidinha,
    showCombinarApostas,
    showGuia,
    showComoUsar,
    showCalculadoraForm,
    updateCalculadora
} from './utils.js';

const APP_CONFIG = {
    name: 'Super Loterias Caixa',
    version: '2.0.0',
    storageKey: 'loterias_caixa_material_you',
    apiBase: 'https://loteriascaixa-api.herokuapp.com/api'
};

// Estado global da aplicação
const state = {
    currentView: 'home',
    currentModalidade: null,
    currentNumbers: [],
    apostas: {},
    resultados: {},
    logs: {
        aplicacao: {},
        usuario: {}
    },
    lastUpdate: new Date().toISOString()
};

// Exportar state para uso global
window.state = state;
window.MODALIDADES = MODALIDADES;
window.calcularPrecoAposta = calcularPrecoAposta;

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    await loadState();
    updateUIStats();

    // Marcar item ativo na navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNav = document.querySelector(`[data-view="${state.currentView}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Mostrar view inicial
    showView(state.currentView);
}

// Gerenciamento de estado
async function loadState() {
    const saved = localStorage.getItem(APP_CONFIG.storageKey);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
        } catch (error) {
            console.error('Erro ao carregar estado:', error);
            showMessage('Erro ao carregar dados salvos', 'error');
        }
    }
    updateUIStats();
}

async function saveState() {
    state.lastUpdate = new Date().toISOString();
    try {
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(state));
        updateUIStats();
    } catch (error) {
        console.error('Erro ao salvar estado:', error);
        showMessage('Erro ao salvar dados', 'error');
    }
}

// Logging
function logApp(acao, dados) {
    const data = new Date().toISOString().split('T')[0];
    if (!state.logs.aplicacao[data]) {
        state.logs.aplicacao[data] = [];
    }
    state.logs.aplicacao[data].push({
        timestamp: new Date().toISOString(),
        acao,
        dados
    });
    saveState();
}

function logUser(acao, opcao, modalidade, dados) {
    const data = new Date().toISOString().split('T')[0];
    const chave = `${opcao}_${modalidade || 'geral'}`;
    if (!state.logs.usuario[chave]) {
        state.logs.usuario[chave] = {};
    }
    if (!state.logs.usuario[chave][data]) {
        state.logs.usuario[chave][data] = [];
    }
    state.logs.usuario[chave][data].push({
        timestamp: new Date().toISOString(),
        acao,
        dados
    });
    saveState();
}

// Atualizar estatísticas na UI
function updateUIStats() {
    const totalApostas = Object.values(state.apostas).reduce((acc, arr) => acc + arr.length, 0);

    const totalApostasEl = document.getElementById('total-apostas');
    const apostasCountEl = document.getElementById('apostas-count');
    const lastUpdateEl = document.getElementById('last-update');

    if (totalApostasEl) totalApostasEl.textContent = totalApostas;
    if (apostasCountEl) apostasCountEl.textContent = totalApostas;

    if (lastUpdateEl) {
        const lastUpdate = new Date(state.lastUpdate);
        lastUpdateEl.textContent = lastUpdate.toLocaleDateString('pt-BR');
    }
}

// Navegação entre views
function showView(viewId, event) {
    state.currentView = viewId;

    // Atualizar navegação ativa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    if (event) {
        event.target.closest('.nav-item').classList.add('active');
    } else {
        const navItem = document.querySelector(`[data-view="${viewId}"]`);
        if (navItem) navItem.classList.add('active');
    }

    // Carregar view
    switch (viewId) {
        case 'home':
            showHome();
            break;
        case 'resultados':
            showResultadosView();
            break;
        case 'apostar':
            showModalidadesView('apostar');
            break;
        case 'verApostas':
            showApostasSalvas();
            break;
        case 'consultar':
            showConsultarAposta();
            break;
        case 'gerar':
            showGerarNumeros();
            break;
        case 'calculadora':
            showCalculadora();
            break;
        case 'rapidinha':
            showRapidinha();
            break;
        case 'combinar':
            showCombinarApostas();
            break;
        case 'guia':
            showGuia();
            break;
        case 'comoUsar':
            showComoUsar();
            break;
        default:
            showHome();
    }

    logApp('navigacao', { view: viewId });
}

// Views principais
function showHome() {
    const totalApostas = Object.values(state.apostas).reduce((acc, arr) => acc + arr.length, 0);
    const totalInvestido = calcularTotalInvestido();
    const ultimaAposta = getUltimaAposta();

    const content = `
        <h2>Bem-vindo ao Super Loterias Caixa</h2>
        <p class="text-body" style="margin-top: 12px;">
            Aplicação completa para gerenciamento de apostas e resultados das loterias da Caixa.
        </p>
        
        <div class="divider"></div>
        
        <h3 style="margin-bottom: 20px;">⚡ Ações Rápidas</h3>
        
        <div class="grid-2" style="margin-bottom: 32px;">
            <div class="card">
                <div class="card-header">
                    <div>
                        <h4 class="card-title">Consultar Resultados</h4>
                        <p class="card-subtitle">Veja os últimos resultados</p>
                    </div>
                    <div class="modalidade-icon">📊</div>
                </div>
                <p class="text-caption" style="margin-bottom: 20px;">
                    Busque os resultados mais recentes de qualquer modalidade
                </p>
                <button class="btn btn-tonal" onclick="window.showView('resultados')">
                    Ver Resultados
                </button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div>
                        <h4 class="card-title">Nova Aposta</h4>
                        <p class="card-subtitle">Crie uma nova aposta</p>
                    </div>
                    <div class="modalidade-icon">🎯</div>
                </div>
                <p class="text-caption" style="margin-bottom: 20px;">
                    Faça uma aposta em qualquer uma das 10 modalidades
                </p>
                <button class="btn btn-filled" onclick="window.showView('apostar')">
                    Criar Aposta
                </button>
            </div>
        </div>
        
        <h3 style="margin-bottom: 20px;">📊 Suas Estatísticas</h3>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="text-label">Modalidades Usadas</div>
                <div class="stat-value">${Object.keys(state.apostas).length}</div>
                <div class="text-caption">de 10 disponíveis</div>
            </div>
            <div class="stat-card">
                <div class="text-label">Total Investido</div>
                <div class="stat-value">R$ ${totalInvestido.toFixed(2)}</div>
                <div class="text-caption">em apostas</div>
            </div>
            <div class="stat-card">
                <div class="text-label">Última Aposta</div>
                <div class="stat-value">${ultimaAposta}</div>
                <div class="text-caption">data da última aposta</div>
            </div>
        </div>
    `;

    document.getElementById('content-area').innerHTML = content;
}

function showResultadosView() {
    const content = `
        <h2>📊 Consultar Resultados</h2>
        <p class="text-body" style="margin-top: 8px;">
            Selecione uma modalidade para ver os últimos resultados.
        </p>
        
        <div class="modalidade-grid">
            ${Object.values(MODALIDADES).map(mod => `
                <div class="modalidade-card" onclick="window.Resultados.fetchResultados(${mod.id})">
                    <div class="modalidade-icon">${mod.icon}</div>
                    <h4>${mod.nome}</h4>
                    <p class="text-caption" style="margin-top: 8px;">${mod.desc}</p>
                    <div style="margin-top: 16px;">
                        <span class="text-label">Clique para buscar</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div id="resultados-container" style="margin-top: 32px;"></div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

function showModalidadesView(context) {
    state.currentView = context;
    
    const title = context === 'apostar' ? 'Nova Aposta' : 'Calculadora';
    const subtitle = context === 'apostar' 
        ? 'Selecione a modalidade para criar sua aposta'
        : 'Selecione a modalidade para calcular preços';
    
    const content = `
        <h2>${context === 'apostar' ? '🎯 Nova Aposta' : '💰 Calculadora'}</h2>
        <p class="text-body" style="margin-top: 8px;">${subtitle}</p>
        
        <div class="modalidade-grid">
            ${Object.values(MODALIDADES).map(mod => `
                <div class="modalidade-card" onclick="window.selectModalidade(${mod.id}, '${context}')">
                    <div class="modalidade-icon">${mod.icon}</div>
                    <h4>${mod.nome}</h4>
                    <p class="text-caption" style="margin-top: 8px;">${mod.desc}</p>
                    <div style="margin-top: 16px;">
                        <span class="text-label">${mod.min} a ${mod.max} números</span>
                        <div style="margin-top: 8px; color: var(--md-primary); font-weight: 600;">
                            R$ ${mod.precoBase.toFixed(2)}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('content-area').innerHTML = content;
}

// Funções utilitárias
function calcularTotalInvestido() {
    let total = 0;
    Object.values(state.apostas).forEach(apostas => {
        apostas.forEach(aposta => {
            total += aposta.preco || 0;
        });
    });
    return total;
}

function getUltimaAposta() {
    let ultimaData = null;
    Object.values(state.apostas).forEach(apostas => {
        apostas.forEach(aposta => {
            const data = new Date(aposta.data);
            if (!ultimaData || data > ultimaData) {
                ultimaData = data;
            }
        });
    });
    return ultimaData ? ultimaData.toLocaleDateString('pt-BR') : '-';
}

// Setup de event listeners
function setupEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const viewId = e.currentTarget.getAttribute('data-view');
            showView(viewId, e);
        });
    });
    
    // Botões do header
    document.getElementById('btn-export')?.addEventListener('click', () => exportAllData(state));
    document.getElementById('btn-clear')?.addEventListener('click', clearAllData);
    document.getElementById('btn-logs')?.addEventListener('click', () => showLogs(state));
}

// Exportar funções para o escopo global
window.showView = showView;
window.selectModalidade = selectModalidade;
window.verDetalhesAposta = verDetalhesAposta;
window.saveState = saveState;

export { state, APP_CONFIG, logApp, logUser, saveState };
