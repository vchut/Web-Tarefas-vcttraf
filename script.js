/* ==========================================
      CONFIGURAÇÕES INICIAIS
========================================== */
const tasks = [
  { name: "Academia", key: "academia" },
  { name: "Acordar Cedo", key: "acordar" },
  { name: "Leitura", key: "leitura" },
  { name: "Água", key: "agua" },
  { name: "Humor", key: "humor" },
  { name: "Estudos", key: "estudos" }
];

const estudos = ["JavaScript","Python","SQL","React Native","Node.js","CSS","HTML"];

function load(key){ return parseInt(localStorage.getItem(key) || 0); }
function save(key,val){ localStorage.setItem(key,val); }

/* ==========================================
      HISTÓRICO DE ÁGUA
========================================== */
const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function getWeekHistory(){ return JSON.parse(localStorage.getItem("agua_hist") || "[0,0,0,0,0,0,0]"); }
function saveWeekHistory(hist){ localStorage.setItem("agua_hist", JSON.stringify(hist)); }

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
      DASHBOARD
========================================== */
function renderDashboard(){
  const area = document.getElementById("content");
  area.innerHTML = "<h1>Dashboard</h1><div id='cards'></div>";
  const cards = document.getElementById("cards");

  tasks.forEach(task=>{
    let p = load(task.key);
    let c=document.createElement("div");
    c.className="card";
    c.innerHTML = `
      <h2>${task.name}</h2>
      <div class='progress-bar'><div class='progress' style='width:${p}%'></div></div>
      <button class='btn' onclick="inc('${task.key}')">+ 10%</button>
      <button class='btn reset' onclick="reset('${task.key}')">Reiniciar</button>
    `;
    cards.appendChild(c);

    if(task.key==="estudos"){
      estudos.forEach(lang=>{
        let key = "est_" + lang;
        let p2 = load(key);
        let sub = document.createElement("div");
        sub.className = "card";
        sub.innerHTML = `
          <h3>${lang}</h3>
          <div class='progress-bar'><div class='progress' style='width:${p2}%'></div></div>
          <button class='btn' onclick="inc('${key}')">+ 10%</button>
          <button class='btn reset' onclick="reset('${key}')">Reiniciar</button>
        `;
        cards.appendChild(sub);
      });
    }
  });
}

/* ==========================================
      ESTATÍSTICAS / PIRÂMIDE
========================================== */
function renderStats(){
  const area = document.getElementById("content");
  area.innerHTML = "<h1>Estatísticas</h1>";
  let html = "<div class='card'><h2>Resumo</h2>";
  tasks.forEach(t=> html+= `<p>${t.name}: ${load(t.key)}%</p>`);
  html+="</div>";
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
    let val = load(t.key);
    let height = val*2;
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
  document.getElementById("humorDisplay").innerText = localStorage.getItem("emoji") || "";
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

  area.innerHTML = `
    <h1>Água Mensal</h1>
    <div class='card'>
      <p>Meta: 30 litros / mês</p>
      <p>Você já bebeu: ${litros} L</p>
      <button class='btn' onclick='addLitro()'>Beber 1L</button>
      <button class='btn reset' onclick='resetAgua()'>Reiniciar</button>
    </div>
  `;

  let grafico = "<h2>Consumo semanal</h2><div style='display:flex; gap:15px; margin-top:10px;'>";
  hist.forEach((v,i)=>{
    grafico+=`
      <div style="text-align:center;">
        <div style="
          width:30px;
          height:${v*10}px;
          background:#00c3ff;
          box-shadow:0 0 8px #00c3ff;
          border-radius:6px;">
        </div>
        <span>${diasSemana[i]}</span>
      </div>
    `;
  });
  grafico += "</div>";
  area.innerHTML += grafico;
}

function resetAgua(){
  save("agua_mes",0);
  saveWeekHistory([0,0,0,0,0,0,0]);
  renderAgua();
}

function createDrop(){
  const card = document.querySelector(".card");
  const drop = document.createElement("div");
  drop.className="drop";
  card.appendChild(drop);
  setTimeout(()=>drop.remove(),1400);
}

function addLitro(){
  let atual = load("agua_mes");
  atual = Math.min(atual+1,30);
  save("agua_mes",atual);

  let hist = getWeekHistory();
  let dia = new Date().getDay();
  hist[dia]+=1;
  saveWeekHistory(hist);

  createDrop();
  renderAgua();
}

/* ==========================================
      INCREMENTO GERAL
========================================== */
function inc(key){
  let v = load(key);
  save(key, Math.min(v+10,100));
  navigate("dashboard");
}

/* ==========================================
      FUNDO / TEMA
========================================== */
function applyBackground(){
  let bg = localStorage.getItem("bgmode") || "light";
  document.documentElement.setAttribute("data-bg",bg);
}

function toggleBackground(){
  let current = localStorage.getItem("bgmode") || "light";
  let next = current==="light"?"dark":"light";
  localStorage.setItem("bgmode",next);
  applyBackground();
}

document.addEventListener("DOMContentLoaded", ()=>{
  applyBackground();
  monthlyReset();
  navigate("dashboard");
});
