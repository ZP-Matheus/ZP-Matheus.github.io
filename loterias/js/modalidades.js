export const MODALIDADES = {
    1: {
        id: 1,
        nome: 'MS',
        numeros: 60,
        min: 6,
        max: 20,
        precoBase: 6.00,
        icon: '⭐',
        desc: 'Selecione de 6 a 20 números (01–60)'
    },
    2: {
        id: 2,
        nome: 'LF',
        numeros: 25,
        min: 15,
        max: 20,
        precoBase: 3.50,
        icon: '🎯',
        desc: 'Selecione de 15 a 20 números (01–25)'
    },
    3: {
        id: 3,
        nome: 'QN',
        numeros: 80,
        min: 5,
        max: 15,
        precoBase: 3.00,
        icon: '5️⃣',
        desc: 'Selecione de 5 a 15 números (01–80)'
    },
    4: {
        id: 4,
        nome: 'LM',
        numeros: 100,
        min: 50,
        max: 50,
        precoBase: 3.00,
        icon: '🎲',
        desc: 'Selecione 50 números (01–100)'
    },
    5: {
        id: 5,
        nome: 'TM',
        numeros: 80,
        min: 10,
        max: 10,
        precoBase: 3.00,
        icon: '⏱️',
        desc: 'Selecione 10 números (01–80)'
    },
    6: {
        id: 6,
        nome: 'DS',
        numeros: 50,
        min: 6,
        max: 15,
        precoBase: 3.00,
        icon: '2️⃣',
        desc: 'Selecione de 6 a 15 números (01–50)'
    },
    7: {
        id: 7,
        nome: 'LT',
        numeros: 3,
        min: 14,
        max: 14,
        precoBase: 4.00,
        icon: '⚽',
        desc: 'Informe resultados de 14 jogos'
    },
    8: {
        id: 8,
        nome: 'DD',
        numeros: 31,
        min: 7,
        max: 15,
        precoBase: 2.50,
        icon: '🍀',
        desc: 'Selecione de 7 a 15 números (01–31)'
    },
    9: {
        id: 9,
        nome: 'MM',
        numeros: 50,
        min: 6,
        max: 12,
        precoBase: 6.00,
        icon: '💰',
        desc: 'Selecione 6–12 números + 2 extras'
    },
    10: {
        id: 10,
        nome: 'SS',
        numeros: 10,
        min: 7,
        max: 7,
        precoBase: 3.00,
        icon: '7️⃣',
        desc: 'Informe 7 dígitos (0–9)'
    }
};



// Tabela de preços por quantidade de números
export const TABELA_PRECOS = {
    1: { // Mega-Sena
        6: 6.00,
        7: 42.00,
        8: 168.00,
        9: 504.00,
        10: 1260.00,
        11: 2772.00,
        12: 5544.00,
        13: 10296.00,
        14: 18018.00,
        15: 30030.00,
        16: 48048.00,
        17: 74256.00,
        18: 111384.00,
        19: 162792.00,
        20: 232560.00
    },
    2: { // Lotofácil
        15: 3.50,
        16: 56.00,
        17: 476.00,
        18: 2856.00,
        19: 13566.00,
        20: 45220.00
    },
    3: { // Quina
        5: 3.00,
        6: 18.00,
        7: 63.00,
        8: 180.00,
        9: 450.00,
        10: 990.00,
        11: 1980.00,
        12: 3600.00,
        13: 6300.00,
        14: 10500.00,
        15: 17010.00
    },
    4: { // Lotomania (preço fixo)
        50: 3.00
    },
    5: { // Timemania (preço fixo)
        10: 3.00
    },
    6: { // Dupla-Sena
        6: 3.00,
        7: 21.00,
        8: 84.00,
        9: 252.00,
        10: 630.00,
        11: 1386.00,
        12: 2772.00,
        13: 5148.00,
        14: 9009.00,
        15: 15015.00
    },
    7: { // Loteca (preço fixo)
        14: 4.00
    },
    8: { // Dia de Sorte
        7: 2.50,
        8: 20.00,
        9: 90.00,
        10: 300.00,
        11: 825.00,
        12: 1980.00,
        13: 4290.00,
        14: 8580.00,
        15: 16380.00
    },
    9: { // +Milionária
        6: 6.00,
        7: 42.00,
        8: 168.00,
        9: 504.00,
        10: 1260.00,
        11: 2772.00,
        12: 5544.00
    },
    10: { // Super Sete (preço fixo)
        7: 3.00
    }
};

// Função para calcular preço da aposta
export function calcularPrecoAposta(qtdNumeros, modalidadeId) {
    const tabela = TABELA_PRECOS[modalidadeId];
    if (!tabela) {
        const mod = MODALIDADES[modalidadeId];
        return mod.precoBase * Math.max(qtdNumeros - mod.min + 1, 1);
    }

    const preco = tabela[qtdNumeros];
    if (preco === undefined) {
        const chaves = Object.keys(tabela).map(Number).sort((a, b) => a - b);
        const qtdValida = chaves.find(q => q >= qtdNumeros) || chaves[chaves.length - 1];
        return tabela[qtdValida] || MODALIDADES[modalidadeId].precoBase;
    }

    return preco;
}
// ... no final do arquivo, adicione:

window.calcularPrecoAposta = calcularPrecoAposta;

