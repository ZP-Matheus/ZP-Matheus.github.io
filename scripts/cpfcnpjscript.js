// Modular JS - Material You
const $ = id => document.getElementById(id);

const state = { history: [], currentResult: null };
const inputField = $('inputField');
const validateBtn = $('validateBtn');
const generateBtn = $('generateBtn');
const resultCard = $('resultCard');
const resultStatus = $('resultStatus');
const resultDocument = $('resultDocument');
const copyBtn = $('copyBtn');
const shareBtn = $('shareBtn');
const historyBtn = $('historyBtn');
const tipsBtn = $('tipsBtn');
const aboutBtn = $('aboutBtn');
const clearHistoryBtn = $('clearHistory');
const toast = $('toast');
const historyModal = $('historyModal');
const tipsModal = $('tipsModal');
const aboutModal = $('aboutModal');

function loadHistory() {
    try { state.history = JSON.parse(localStorage.getItem('cpfCnpjHistory')) || []; }
    catch { state.history = []; }
}

function saveHistory() { localStorage.setItem('cpfCnpjHistory', JSON.stringify(state.history)); }

function cleanDoc(doc) { return doc.replace(/\D/g,''); }
function allSameDigits(doc) { return doc.length > 0 && [...doc].every(c => c===doc[0]); }

function calcCPFDigit(base, w){let s=0;for(let i=0;i<base.length;i++)s+=parseInt(base[i])*(w-i);return s%11<2?0:11-(s%11);}
function isValidCPF(c){const n=cleanDoc(c);if(n.length!==11||allSameDigits(n))return false;const d1=calcCPFDigit(n.slice(0,9),10);const d2=calcCPFDigit(n.slice(0,9)+d1,11);return n.slice(-2)===`${d1}${d2}`;}
function formatCPF(c){const n=cleanDoc(c);return n.length!==11?c:`${n.slice(0,3)}.${n.slice(3,6)}.${n.slice(6,9)}-${n.slice(9,11)}`;}
function generateCPF(base=null){if(!base)base=Array.from({length:9},()=>Math.floor(Math.random()*10)).join('');const d1=calcCPFDigit(base,10),d2=calcCPFDigit(base+d1,11);return formatCPF(base+d1+d2);}

function calcCNPJDigit(base,w){let s=0,weight=w;for(let i=base.length-1;i>=0;i--){s+=parseInt(base[i])*weight;weight--;if(weight===1)weight=9;}return s%11<2?0:11-(s%11);}
function isValidCNPJ(c){const n=cleanDoc(c);if(n.length!==14||allSameDigits(n))return false;const d1=calcCNPJDigit(n.slice(0,12),5),d2=calcCNPJDigit(n.slice(0,12)+d1,6);return n.slice(-2)===`${d1}${d2}`;}
function formatCNPJ(c){const n=cleanDoc(c);return n.length!==14?c:`${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12,14)}`;}
function generateCNPJ(base=null){if(!base)base=Array.from({length:12},()=>Math.floor(Math.random()*10)).join('');const d1=calcCNPJDigit(base,5),d2=calcCNPJDigit(base+d1,6);return formatCNPJ(base+d1+d2);}

function detectType(input){const n=cleanDoc(input);if(n.length===11)return'CPF';if(n.length===14)return'CNPJ';if(n.length===9)return'CPF_BASE';if(n.length===12)return'CNPJ_BASE';return'UNKNOWN';}

function validateDoc(input){const n=cleanDoc(input);const type=detectType(n);switch(type){case'CPF':return{