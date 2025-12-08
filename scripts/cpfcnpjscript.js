document.addEventListener('DOMContentLoaded', () => {

const inputField = document.getElementById('inputField');
const validateBtn = document.getElementById('validateBtn');
const generateBtn = document.getElementById('generateBtn');
const resultCard = document.getElementById('resultCard');
const resultStatus = document.getElementById('resultStatus');
const resultDocument = document.getElementById('resultDocument');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const historyBtn = document.getElementById('historyBtn');
const tipsBtn = document.getElementById('tipsBtn');
const aboutBtn = document.getElementById('aboutBtn');
const clearHistoryBtn = document.getElementById('clearHistory');
const toast = document.getElementById('toast');

const historyModal = document.getElementById('historyModal');
const tipsModal = document.getElementById('tipsModal');
const aboutModal = document.getElementById('aboutModal');

const state = { history: [], currentResult: null };

// === Funções utilitárias ===
const showToast = (msg,dur=3000)=>{
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), dur);
};

const copyToClipboard = async (text)=>{
    try { await navigator.clipboard.writeText(text); showToast('Copiado!'); }
    catch { showToast('Erro ao copiar'); }
};

// Limpar entrada
const cleanDocument = doc => doc.replace(/\D/g, '');
const hasAllSameDigits = doc => doc.length>0 && [...doc].every(ch=>ch===doc[0]);

// CPF
const calculateCPFDigit = (base, weightStart)=>{
    let sum=0;
    for(let i=0;i<base.length;i++) sum+=parseInt(base[i])*(weightStart-i);
    const rem = sum%11;
    return rem<2?0:11-rem;
};
const isValidCPF = cpf=>{
    const n=cleanDocument(cpf);
    if(n.length!==11 || hasAllSameDigits(n)) return false;
    const dv1=calculateCPFDigit(n.slice(0,9),10);
    const dv2=calculateCPFDigit(n.slice(0,9)+dv1,11);
    return n.slice(-2)===`${dv1}${dv2}`;
};
const formatCPF = cpf=>{
    const n=cleanDocument(cpf);
    if(n.length!==11) return cpf;
    return `${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9,11)}`;
};
const generateCPF = (base=null)=>{
    if(!base) base=Array.from({length:9},()=>Math.floor(Math.random()*10)).join('');
    const dv1=calculateCPFDigit(base,10);
    const dv2=calculateCPFDigit(base+dv1,11);
    return formatCPF(base+dv1+dv2);
};

// CNPJ
const calculateCNPJDigit = (base, weightStart)=>{
    let sum=0,weight=weightStart;
    for(let i=base.length-1;i>=0;i--){
        sum+=parseInt(base[i])*weight;
        weight--; if(weight===1) weight=9;
    }
    const rem=sum%11;
    return rem<2?0:11-rem;
};
const isValidCNPJ = cnpj=>{
    const n=cleanDocument(cnpj);
    if(n.length!==14 || hasAllSameDigits(n)) return false;
    const dv1=calculateCNPJDigit(n.slice(0,12),5);
    const dv2=calculateCNPJDigit(n.slice(0,12)+dv1,6);
    return n.slice(-2)===`${dv1}${dv2}`;
};
const formatCNPJ = cnpj=>{
    const n=cleanDocument(cnpj);
    if(n.length!==14) return cnpj;
    return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12,14)}`;
};
const generateCNPJ = (base=null)=>{
    if(!base) base=Array.from({length:12},()=>Math.floor(Math.random()*10)).join('');
    const dv1=calculateCNPJDigit(base,5);
    const dv2=calculateCNPJDigit(base+dv1,6);
    return formatCNPJ(base+dv1+dv2);
};

// Detectar tipo
const detectDocumentType = input=>{
    const cleaned=cleanDocument(input);
    if(cleaned.length===11) return 'CPF';
    if(cleaned.length===14) return 'CNPJ';
    if(cleaned.length===9) return 'CPF_BASE';
    if(cleaned.length===12) return 'CNPJ_BASE';
    return 'UNKNOWN';
};

// Validar ou gerar
const validateDocument = input=>{
    const cleaned=cleanDocument(input);
    const type=detectDocumentType(cleaned);
    switch(type){
        case 'CPF': return {type, isValid:isValidCPF(cleaned), formatted:formatCPF(cleaned), message:isValidCPF(cleaned)?'Válido':'Inválido'};
        case 'CNPJ': return {type, isValid:isValidCNPJ(cleaned), formatted:formatCNPJ(cleaned), message:isValidCNPJ(cleaned)?'Válido':'Inválido'};
        default: return {type:'UNKNOWN', isValid:false, formatted:input, message:'Digite 11 ou 14 dígitos ou base para gerar'};
    }
};
const generateDocument = input=>{
    const cleaned=cleanDocument(input);
    const type=detectDocumentType(cleaned);
    if(type==='CPF_BASE') return {type:'CPF', isValid:true, formatted:generateCPF(cleaned), message:'Gerado'};
    if(type==='CNPJ_BASE') return {type:'CNPJ', isValid:true, formatted:generateCNPJ(cleaned), message:'Gerado'};
    return Math.random()>0.5 ? {type:'CPF', isValid:true, formatted:generateCPF(), message:'Gerado'} : {type:'CNPJ', isValid:true, formatted:generateCNPJ(), message:'Gerado'};
};

// Histórico
const loadHistory = ()=>{
    try { const saved=localStorage.getItem('cpfCnpjHistory'); state.history=saved?JSON.parse(saved):[]; } 
    catch { state.history=[]; }
};
const saveHistory = ()=>{ localStorage.setItem('cpfCnpjHistory',JSON.stringify(state.history)); };

const showResult=result=>{
    resultCard.classList.add('visible');
    resultDocument.textContent=result.formatted;
    resultStatus.className='result-status';
    resultStatus.classList.add(result.message==='Válido'?'status-valid':result.message==='Inválido'?'status-invalid':'status-generated');
    resultStatus.textContent=`${result.message} - ${result.type}`;
    if(result.type!=='UNKNOWN'){ state.history.unshift({...result, timestamp:Date.now()}); state.history=state.history.slice(0,50); saveHistory(); }
    state.currentResult=result;
};

// Eventos
// Eventos
validateBtn.addEventListener('click',()=>{ 
    const input=inputField.value.trim(); 
    if(!input){ 
        showToast('Digite um CPF ou CNPJ'); 
        return; 
    } 
    showResult(validateDocument(input)); 
});

// CORREÇÃO: Função de callback do generateBtn completa e fechada
generateBtn.addEventListener('click',()=>{ 
    const input=inputField.value.trim(); 
    showResult(generateDocument(input)); 
});
// Faltam os eventos para os modais, mas vamos fechar o DOMContentLoaded para o código rodar:
// ... (Adicione aqui os handlers para copyBtn, shareBtn, historyBtn, tipsBtn, etc., se desejar)

}); // <-- FECHAMENTO FINAL: do document.addEventListener('DOMContentLoaded', ...)
