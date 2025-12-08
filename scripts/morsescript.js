// Mapeamento Morse
const DOT = 200, DASH = 600, S = 200, L = 600, W = 1000;

const MAP = {
  A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",
  I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",
  P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",
  W:".--",X:"-..-",Y:"-.--",Z:"--..",
  "0":"-----","1":".----","2":"..---","3":"...--","4":"....-",
  "5":".....","6":"-....","7":"--...","8":"---..","9":"----."
};

const REV = Object.fromEntries(Object.entries(MAP).map(([k,v])=>[v,k]));
REV["/"] = " ";

// Função utilitária para selecionar elemento por ID
const $ = id => document.getElementById(id);

// Estado
let dir = "t2m";
let ctx = null;

// Elementos
const inputEl = $("input");
const outputEl = $("output");
const btnT2M = $("btn-t2m");
const btnM2T = $("btn-m2t");
const btnPlay = $("btn-play");
const btnCopy = $("btn-copy");
const btnClear = $("btn-clear");
const btnGuide = $("btn-guide");
const guideBox = $("guide-box");
const snack = $("snack");
const labelInput = $("label-input");
const labelOutput = $("label-output");

// Eventos
inputEl.addEventListener("input", update);
btnT2M.addEventListener("click", () => setDir("t2m"));
btnM2T.addEventListener("click", () => setDir("m2t"));
btnPlay.addEventListener("click", playMorse);
btnClear.addEventListener("click", () => {
  inputEl.value = "";
  outputEl.value = "";
});
btnCopy.addEventListener("click", async () => {
  await navigator.clipboard.writeText(outputEl.value);
  showSnack("Copiado");
});
btnGuide.addEventListener("click", () => {
  guideBox.style.display = guideBox.style.display === "none" ? "block" : "none";
});

// Funções
function update() {
  outputEl.value = dir === "t2m"
    ? [...inputEl.value.toUpperCase()].map(c => c === " " ? " / " : MAP[c] || "?").join(" ")
    : inputEl.value.trim().split(/\s+/).map(c => REV[c] || "?").join("");
}

function setDir(d) {
  dir = d;
  btnT2M.classList.toggle("active", d === "t2m");
  btnM2T.classList.toggle("active", d === "m2t");
  labelInput.textContent = d === "t2m" ? "Digite o texto" : "Digite o código Morse";
  labelOutput.textContent = d === "t2m" ? "Código Morse" : "Texto traduzido";
  update();
}

async function playMorse() {
  if (!outputEl.value) return showSnack("Nada pra tocar");
  ctx ??= new AudioContext();
  for (const word of outputEl.value.split(" ")) {
    if (word === "/") { await pause(W); continue; }
    for (const c of word) {
      tone(c === "." ? DOT : DASH);
      await pause(c === "." ? DOT : DASH);
      await pause(S);
    }
    await pause(L);
  }
}

function tone(ms) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.value = 0.25;
  osc.start();
  osc.stop(ctx.currentTime + ms / 1000);
}

const pause = ms => new Promise(res => setTimeout(res, ms));

function showSnack(msgText) {
  snack.textContent = msgText;
  snack.classList.add("show");
  setTimeout(() => snack.classList.remove("show"), 2200);
}