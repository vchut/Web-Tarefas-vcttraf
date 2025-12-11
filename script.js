/* ============================================================
   CONFIGURAÇÕES INICIAIS
   - Lista de tarefas principais
   - Lista de linguagens estudadas
   - Funções simples de storage
============================================================ */

const tasks = [
  { name: "Academia",     key: "academia", max: 100 },
  { name: "Acordar Cedo",  key: "acordar",  max: 100 },
  { name: "Leitura",       key: "leitura",  max: 100 },
  { name: "Água",          key: "agua",     max: 100 }, // agora independente
  { name: "Humor",         key: "humor",    max: 100 },
  { name: "Estudos",       key: "estudos",  max: 100 }
];

// categorias internas da área de estudos
const estudos = ["JavaScript","Python","SQL","React Native","Node.js","CSS","HTML"];

// helpers simples
const load = key => parseInt(localStorage.getItem(key) || 0);
const save = (key, value) => localStorage.setItem(key, value);


/* ============================================================
   ÁGUA – CONTROLE MENSAL (separado do dashboard)
============================================================ */

const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function getWeekHistory() {
  return JSON.parse(localStorage.getItem("agua_hist") || "[0,0,0,0,0,0,0]");
}

function saveWeekHistory(hist) {
  localStorage.setItem("agua_hist", JSON.stringify(hist));
}

function monthlyReset() {
  const mesAtual = new Date().getMonth();
  const salvo = load("mes_salvo");

  if (salvo !== mesAtual) {
    save("mes_salvo", mesAtual);
    save("agua_mes", 0);
    saveWeekHistory([0,0,0,0,0,0,0]);
    // água do dashboard agora não sincroniza, então não resetamos
  }
}


/* ============================================================
   NAVEGAÇÃO ENTRE TELAS
============================================================ */

function navigate(page) {
  const routes = {
    dashboard: renderDashboard,
    stats:     renderStats,
    humor:     renderHumor,
    agua:      renderAgua
  };

  routes[page]?.();
}


/* ============================================================
   RESET UNIVERSAL
============================================================ */
function reset(key) {
  save(key, 0);

  if (key === "agua") {
    // reset do dashboard NÃO mexe no mensal
    save("agua", 0);
  }

  navigate("dashboard");
}


/* ============================================================
   DASHBOARD
   - cards principais
   - barras animadas
   - estudos com subcards
   - água funcionando independente do mensal
============================================================ */
function renderDashboard() {
  const area = document.getElementById("content");
  area.innerHTML = "<h1>Dashboard</h1><div id='cards'></div>";

  const cards = document.getElementById("cards");

  const showKeys = ["academia","acordar","leitura","humor","estudos","agua"];

  tasks.forEach(task => {
    if (!showKeys.includes(task.key)) return;

    let progressValue = load(task.key);

    // água do dashboard NÃO sincroniza com agua_mes
    if (task.key === "agua") {
      progressValue = load("agua"); // totalmente independente
    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h2>${task.name}</h2>

      <div class="progress-bar">
        <div class="progress" id="progress-${task.key}" style="width:0%"></div>
      </div>

      <button class="btn" onclick="inc('${task.key}')">+10%</button>
      <button class="btn reset" onclick="reset('${task.key}')">Reiniciar</button>
    `;

    cards.appendChild(card);

    animateProgress(task.key, progressValue, task.max);

    // subcards de estudos
    if (task.key === "estudos") {
      estudos.forEach(lang => {
        const subKey = "est_" + lang;
        const val = load(subKey);

        const sub = document.createElement("div");
        sub.className = "card sub-card";

        sub.innerHTML = `
          <h3>${lang}</h3>
          <div class="progress-bar">
            <div class="progress" id="progress-${subKey}" style="width:0%"></div>
          </div>
          <button class="btn" onclick="inc('${subKey}')">+10%</button>
          <button class="btn reset" onclick="reset('${subKey}')">Reiniciar</button>
        `;

        cards.appendChild(sub);
        animateProgress(subKey, val, 100);
      });
    }
  });
}


/* ============================================================
   ANIMAÇÃO DA BARRA
============================================================ */
function animateProgress(key, target, max) {
  const bar = document.getElementById(`progress-${key}`);
  if (!bar) return;

  let current = 0;

  const interval = setInterval(() => {
    if (current >= target) {
      clearInterval(interval);
      return;
    }

    current += 1;
    bar.style.width = Math.min((current / max) * 100, 100) + "%";

  }, 12);
}


/* ============================================================
   ESTATÍSTICAS GERAIS
============================================================ */

function renderStats() {
  const area = document.getElementById("content");
  area.innerHTML = "<h1>Estatísticas</h1>";

  let html = `<div class='card'><h2>Resumo</h2>`;
  tasks.forEach(t => {
    html += `<p>${t.name}: ${load(t.key)}%</p>`;
  });
  html += "</div>";

  area.innerHTML += html;
  renderStatsPyramid();
}

function renderStatsPyramid() {
  const area = document.getElementById("content");

  let html = `
    <div class="card">
      <h2>Progresso Visual</h2>
      <div class="pyramid-container">
  `;

  tasks.forEach(t => {
    const val = load(t.key);
    const height = val * 2;

    html += `
      <div class="bar">
        <div class="bar-value">${val}%</div>
        <div class="bar-fill" style="--target-height:${height}px"></div>
        <span class="bar-label">${t.name}</span>
      </div>
    `;
  });

  html += "</div></div>";
  area.innerHTML += html;
}


/* ============================================================
   HUMOR – TELA SIMPLES
============================================================ */
function renderHumor() {
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

  document.getElementById("humorDisplay").innerText =
    localStorage.getItem("emoji") || "Clique em um emoji!";
}

function setHumor(emoji) {
  localStorage.setItem("emoji", emoji);
  document.getElementById("humorDisplay").innerText = emoji;
}


/* ============================================================
   ÁGUA – TELA COMPLETA (controle mensal)
============================================================ */
function renderAgua() {
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

  hist.forEach((v, i) => {
    const altura = Math.min(v / metaMensal, 1) * alturaMax;

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

function resetAgua() {
  save("agua_mes", 0);
  saveWeekHistory([0,0,0,0,0,0,0]);
  renderAgua();
}

function createDrop() {
  const card = document.querySelector(".card");
  if (!card) return;

  const drop = document.createElement("div");
  drop.className = "drop";

  card.appendChild(drop);
  setTimeout(() => drop.remove(), 1400);
}

function addLitro() {
  const metaMensal = 30;
  let litros = load("agua_mes");

  litros = Math.min(litros + 1, metaMensal);
  save("agua_mes", litros);

  const hist = getWeekHistory();
  hist[new Date().getDay()] += 1;
  saveWeekHistory(hist);

  createDrop();
  renderAgua();
}


/* ============================================================
   INCREMENTO DE +10%
============================================================ */
function inc(key) {
  const task = tasks.find(t => t.key === key) || { max: 100 };
  const max = task.max;

  let v = load(key);
  v = Math.min(v + 10, max);

  save(key, v);
  animateProgress(key, v, max);
}


/* ============================================================
   TEMA / FUNDO
============================================================ */
function applyBackground() {
  const bg = localStorage.getItem("bgmode") || "light";
  document.documentElement.setAttribute("data-bg", bg);
}

function toggleBackground() {
  const current = localStorage.getItem("bgmode") || "light";
  const next = current === "light" ? "dark" : "light";

  localStorage.setItem("bgmode", next);
  applyBackground();
}


/* ============================================================
   INICIALIZAÇÃO DO APP
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  applyBackground();
  monthlyReset();
  navigate("dashboard");
});
