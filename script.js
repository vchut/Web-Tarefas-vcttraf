/* ==========================================
    CONFIGURAÇÕES INICIAIS
========================================== */
const tasks = [
  { name: "Academia", key: "academia", max: 100 },
  { name: "Acordar Cedo", key: "acordar", max: 100 },
  { name: "Leitura", key: "leitura", max: 100 },
  { name: "Água", key: "agua", max: 30 }, // limite mensal
  { name: "Humor", key: "humor", max: 100 },
  { name: "Estudos", key: "estudos", max: 100 }
];

const estudos = ["JavaScript","Python","SQL","React Native","Node.js","CSS","HTML"];

function load(key){ return parseInt(localStorage.getItem(key) || 0); }
function save(key,val){ localStorage.setItem(key,val); }

/* ==========================================
    HISTÓRICO DE ÁGUA
========================================== */
const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function getWeekHistory(){ 
  return JSON.parse(localStorage.getItem("agua_hist") || "[0,0,0,0,0,0,0]"); 
}
function saveWeekHistory(hist){ 
  localStorage.setItem("agua_hist", JSON.stringify(hist)); 
}

function monthlyReset(){
  const mesAtual = new Date().getMonth();
  const salvo = load("mes_salvo");
  if(salvo !== mesAtual){
    save("mes_salvo", mesAtual);
    save("agua_mes", 0);
    saveWeekHistory([0,0,0,0,0,0,0]);
  }
}

/* ==========================================
    NAVEGAÇÃO
========================================== */
function navigate(page){
  const routes = { dashboard: renderDashboard, stats: renderStats, humor: renderHumor, agua: renderAgua };
  routes[page]?.();
}

/* ==========================================
    RESET
========================================== */
function reset(key){
  save(key, 0);
  navigate("dashboard");
}

/* ==========================================
    DASHBOARD COM ANIMAÇÃO SUAVE
========================================== */
function renderDashboard(){
  const area = document.getElementById("content");
  area.innerHTML = "<h1>Dashboard</h1><div id='cards'></div>";
  const cards = document.getElementById("cards");

  tasks.forEach(task=>{
    const p = load(task.key);
    const c = document.createElement("div");
    c.className="card";
    c.innerHTML=`
      <h2>${task.name}</h2>
      <div class='progress-bar'><div class='progress' id='progress-${task.key}' style='width:0%'></div></div>
      <button class='btn' onclick="inc('${task.key}')">+10%</button>
      <button class='btn reset' onclick="reset('${task.key}')">Reiniciar</button>
    `;
    cards.appendChild(c);

    // anima a barra para o valor atual
    animateProgress(task.key, p, task.max);

    if(task.key==="estudos"){
      estudos.forEach(lang=>{
        const key = "est_" + lang;
        const p2 = load(key);
        const sub = document.createElement("div");
        sub.className = "card sub-card";
        sub.innerHTML=`
          <h3>${lang}</h3>
          <div class='progress-bar'><div class='progress' id='progress-${key}' style='width:0%'></div></div>
          <button class='btn' onclick="inc('${key}')">+10%</button>
          <button class='btn reset' onclick="reset('${key}')">Reiniciar</button>
        `;
        cards.appendChild(sub);
        animateProgress(key, p2, 100);
      });
    }
  });
}

/* ==========================================
    FUNÇÃO DE ANIMAÇÃO SUAVE
========================================== */
function animateProgress(key, target, max){
  const progressBar = document.getElementById(`progress-${key}`);
  if(!progressBar) return;
  let current = 0;
  const interval = setInterval(()=>{
    if(current >= target) {
      clearInterval(interval);
      return;
    }
    current += 1;
    let percent = (current/max)*100;
    if(percent > 100) percent = 100;
    progressBar.style.width = percent + "%";
  }, 15); // velocidade da animação (15ms)
}

/* ==========================================
    ESTATÍSTICAS / PIRÂMIDE
========================================== */
function renderStats(){
  const area = document.getElementById("content");
  area.innerHTML = "<h1>Estatísticas</h1>";
  let html = "<div class='card'><h2>Resumo</h2>";
  tasks.forEach(t=> html+= `<p>${t.name}: ${load(t.key)}%</p>`);
  html += "</div>";
  area.innerHTML += html;
  renderStatsPyramid();
}

function renderStatsPyramid(){
  const area = document.getElementById("content");
  let html = `
    <div class="card">
      <h2>Progresso Visual</h2>
      <div class="pyramid-container">
  `;
  tasks.forEach(t=>{
    const val = load(t.key);
    const height = val*2;
    html += `
      <div class="bar">
        <div class="bar-value">${val}%</div>
        <div class="bar-fill" style="--target-height:${height}px" onanimationend="this.classList.add('grown')"></div>
        <span class="bar-label">${t.name}</span>
      </div>
    `;
  });
  html += "</div></div>";
  area.innerHTML += html;
}

/* ==========================================
    HUMOR
========================================== */
function renderHumor(){
  const area = document.getElementById("content");
  area.innerHTML = `
    <h1>Humor</h1>
    <div class='card'>
      <p>Como você está hoje?</p>
      <span class='emoji' onclick="setHumor('😡')">😡</span>
      <span class='emoji' onclick="setHumor('😐')">😐</span>
      <span class='emoji' onclick="setHumor('🙂')">🙂</span>
      <span class='emoji' onclick="setHumor('😄')">😄</span>
      <h2 id='humorDisplay'></h2>
    </div>
  `;
  document.getElementById("humorDisplay").innerText = localStorage.getItem("emoji") || "Clique em um emoji!";
}

function setHumor(e){
  localStorage.setItem("emoji", e);
  document.getElementById("humorDisplay").innerText = e;
}

/* ==========================================
    ÁGUA
========================================== */
function renderAgua(){
  const area = document.getElementById("content");
  const litros = load("agua_mes");
  const hist = getWeekHistory();

  const metaMensal = 30;
  const alturaMax = 120;

  area.innerHTML = `
    <h1>Água Mensal</h1>
    <div class='card'>
      <p>Meta: ${metaMensal} litros / mês</p>
      <p>Você já bebeu: <strong>${litros} L</strong></p>
      <button class='btn' onclick='addLitro()'>Beber 1L</button>
      <button class='btn reset' onclick='resetAgua()'>Reiniciar</button>
    </div>
  `;

  let grafico = "<h2>Consumo semanal</h2><div class='water-bar-container'>";
  hist.forEach((v,i)=>{
    const altura = Math.min(v/metaMensal,1)*alturaMax;
    grafico += `
      <div class="water-bar-column">
        <div class="water-bar-fill" style="height:${altura}px"></div>
        <span>${diasSemana[i]}</span>
      </div>
    `;
  });
  grafico += "</div>";
  area.innerHTML += `<div class='card'>${grafico}</div>`;
}

function resetAgua(){
  save("agua_mes",0);
  saveWeekHistory([0,0,0,0,0,0,0]);
  renderAgua();
}

function createDrop(){
  const card = document.querySelector(".card");
  if(!card) return;
  const drop = document.createElement("div");
  drop.className="drop";
  card.appendChild(drop);
  setTimeout(()=>drop.remove(),1400);
}

function addLitro(){
  const metaMensal = 30;
  let atual = load("agua_mes");
  atual = Math.min(atual + 1, metaMensal);
  save("agua_mes", atual);

  let hist = getWeekHistory();
  let dia = new Date().getDay();
  hist[dia] += 1;
  saveWeekHistory(hist);

  createDrop();
  renderAgua();
}

/* ==========================================
    INCREMENTO GERAL
========================================== */
function inc(key){
  let task = tasks.find(t=> t.key===key) || { max: 100 };
  let v = load(key);
  let max = task.max;
  v = Math.min(v+10,max);
  save(key, v);
  animateProgress(key, v, max);
}

/* ==========================================
    FUNDO / TEMA
========================================== */
function applyBackground(){
  let bg = localStorage.getItem("bgmode") || "light";
  document.documentElement.setAttribute("data-bg", bg);
}

function toggleBackground(){
  let current = localStorage.getItem("bgmode") || "light";
  let next = current === "light" ? "dark" : "light";
  localStorage.setItem("bgmode", next);
  applyBackground();
}

document.addEventListener("DOMContentLoaded", ()=>{
  applyBackground();
  monthlyReset();
  navigate("dashboard");
});
