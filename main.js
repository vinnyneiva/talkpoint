const btnFalar = document.querySelector('#btnFalar');
const btnSalvar = document.querySelector('#btnSalvar');
const input = document.querySelector('#texto');
const display = document.querySelector('#display');
const containerFavoritos = document.querySelector('#favoritos');
const checkVoz = document.querySelector('#checkVoz');

// Menu Lateral
const sidebar = document.querySelector('#sidebar');
const btnMenu = document.querySelector('#btnMenu');
const btnClose = document.querySelector('#btnClose');

// 1. Carrega frases
let meusFavoritos = JSON.parse(localStorage.getItem('talkpoint_frases')) || ["Sim", "Não", "Obrigado", "Banheiro", "Água", "Ajuda"];

// --- FUNÇÕES DO MENU (Ajustadas) ---

const fecharMenu = () => {
  sidebar.style.left = '-300px';
  btnMenu.style.left = '20px';
  btnMenu.innerText = '☰ Frases';
  btnMenu.style.color = '#00ffcc';
  btnMenu.style.borderColor = '#00ffcc';
};

// ESSA É A ÚNICA FUNÇÃO QUE O BTNMENU DEVE TER
btnMenu.addEventListener('click', () => {
  // Se estiver fechado (ou vazio no início), ABRE
  if (sidebar.style.left === '-300px' || sidebar.style.left === '') {
    sidebar.style.left = '0px';
    btnMenu.style.left = '325px'; 
    btnMenu.innerText = '✕';
    btnMenu.style.color = '#ff5555';
    btnMenu.style.borderColor = '#ff5555';
  } else {
    // Se estiver aberto, FECHA
    fecharMenu();
  }
});

btnClose.addEventListener('click', fecharMenu);

// Fecha ao clicar no letreiro
display.addEventListener('click', () => {
  if (sidebar.style.left === '0px') fecharMenu();
});

// --- RESTO DO CÓDIGO (Voz, Renderização, Salvar) ---

function falar(texto) {
  if (texto !== "") {
    display.innerText = texto;
    if (checkVoz.checked) {
      const fala = new SpeechSynthesisUtterance(texto);
      const vozes = window.speechSynthesis.getVoices();
      const vozBR = vozes.find(v => v.lang.includes('pt-BR'));
      if (vozBR) fala.voice = vozBR;
      fala.rate = 0.9;
      window.speechSynthesis.speak(fala);
    }
  }
}

function renderizarBotoes() {
  containerFavoritos.innerHTML = ''; 
  meusFavoritos.forEach((frase, index) => {
    const btnFrase = document.createElement('button');
    btnFrase.innerText = frase;
    btnFrase.className = 'btn-favorito'; // Dica: use classes para CSS se quiser
    btnFrase.style.textAlign = 'left';
    btnFrase.style.padding = '12px';
    btnFrase.style.background = '#222';
    btnFrase.style.color = '#00ffcc';
    btnFrase.style.border = '1px solid #333';
    btnFrase.style.borderRadius = '5px';
    btnFrase.style.cursor = 'pointer';

    let clickTimer;
    btnFrase.addEventListener('click', () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
        clickTimer = null;
        if (confirm(`Apagar "${frase}"?`)) {
          meusFavoritos.splice(index, 1);
          localStorage.setItem('talkpoint_frases', JSON.stringify(meusFavoritos));
          renderizarBotoes();
        }
      } else {
        clickTimer = setTimeout(() => {
          falar(frase);
          fecharMenu(); 
          clickTimer = null;
        }, 250);
      }
    });
    containerFavoritos.appendChild(btnFrase);
  });
}

btnSalvar.addEventListener('click', () => {
  const novaFrase = input.value.trim();
  if (novaFrase && !meusFavoritos.includes(novaFrase)) {
    meusFavoritos.push(novaFrase);
    localStorage.setItem('talkpoint_frases', JSON.stringify(meusFavoritos));
    renderizarBotoes();
    input.value = "";
  }
});

btnFalar.addEventListener('click', () => {
  if (input.value.trim() !== "") {
    falar(input.value);
    input.value = "";
  }
});

renderizarBotoes();
window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();