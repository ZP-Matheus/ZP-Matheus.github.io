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

const $ = id => document.getElementById(id);
let dir = "t2m", ctx;

$("input").addEventListener("input", update);

function update() {
  $("output").value = dir === "t2m"
    ? [...$("input").value.toUpperCase()].map(c => c === " " ? " / " : MAP[c] || "?").join(" ")
    : $("input").value.trim().split(/\s+/).map(c => REV[c] || "?").join("");
}

$("btn-t2m").addEventListener("click", () => setDir("t2m"));
$("btn-m2t").addEventListener("click", () => setDir("m2t"));

function setDir(d) {
  dir = d;
  $("btn-t2m").classList.toggle("active", d === "t2m");
  $("btn-m2t").classList.toggle("active", d === "m2t");
  $("label-input").textContent = d === "t2m" ? "Digite o texto" : "Digite o código Morse";
  $("label-output").textContent = d === "t2m" ? "Código Morse" : "Texto traduzido";
  update();
}

$("btn-play").addEventListener("click", async () => {
  if (!$("output").value) return msg("Nada pra tocar");
  ctx ??= new AudioContext();
  for (const word of $("output").value.split(" ")) {
    if (word === "/") { await pause(W); continue; }
    for (const c of word) {
      tone(c === "." ? DOT : DASH);
      await pause(c === "." ? DOT : DASH);
      await pause(S);
    }
    await pause(L);
  }
});

function tone(ms) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  g.gain.value = 0.25; o.start(); o.stop(ctx.currentTime + ms / 1000);
}

const pause = ms => new Promise(r => setTimeout(r, ms));

$("btn-clear").addEventListener("click", () => {
  $("input").value = "";
  $("output").value = "";
});

$("btn-copy").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("output").value);
  msg("Copiado");
});

$("btn-guide").addEventListener("click", () => {
  $("guide-box").style.display = $("guide-box").style.display === "none" ? "block" : "none";
});

function msg(t) {
  const s = $("snack"); 
  s.textContent = t; 
  s.classList.add("show");
  setTimeout(() => s.classList.remove("show"), 2200);
}
