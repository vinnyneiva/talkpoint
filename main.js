const btnFalar = document.querySelector('#btnFalar');
const btnSalvar = document.querySelector('#btnSalvar');
const input = document.querySelector('#texto');
const display = document.querySelector('#display');
const containerFavoritos = document.querySelector('#favoritos');
const checkVoz = document.querySelector('#checkVoz');

// 1. Carrega frases do celular ou usa as iniciais se for a primeira vez
let meusFavoritos = JSON.parse(localStorage.getItem('talkpoint_frases')) || ["Sim", "Não", "Obrigado", "Banheiro", "Água", "Ajuda"];

// 2. Função de Voz
function falar(texto) {
  if (texto !== "") {
    // 1. SEMPRE mostra na tela (o letreiro)
    display.innerText = texto;

    // 2. SÓ fala se a caixinha estiver marcada
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

// 3. Função para desenhar os botões na tela
function renderizarBotoes() {
  containerFavoritos.innerHTML = ''; 
  
  meusFavoritos.forEach((frase, index) => {
    const btnFrase = document.createElement('button');
    btnFrase.innerText = frase;
    btnFrase.style.padding = '10px 15px';
    btnFrase.style.fontSize = '1rem';
    btnFrase.style.background = '#111';
    btnFrase.style.color = '#00ffcc';
    btnFrase.style.border = '1px solid #333';
    btnFrase.style.borderRadius = '8px';
    btnFrase.style.cursor = 'pointer';

    // Variável para controlar o tempo entre cliques
    let clickTimer;

    btnFrase.addEventListener('click', () => {
      if (clickTimer) {
        // Se houver um timer rodando, significa que é o segundo clique
        clearTimeout(clickTimer);
        clickTimer = null;

        // Ação de APAGAR
        if (confirm(`Deseja apagar o botão "${frase}"?`)) {
          meusFavoritos.splice(index, 1);
          localStorage.setItem('talkpoint_frases', JSON.stringify(meusFavoritos));
          renderizarBotoes();
        }
      } else {
        // Primeiro clique: inicia o timer
        clickTimer = setTimeout(() => {
          // Se o tempo passar sem o segundo clique, ele FALA
          falar(frase);
          clickTimer = null;
        }, 250); // 250ms é o tempo ideal para distinguir clique de clique duplo
      }
    });

    containerFavoritos.appendChild(btnFrase);
  });
}

// 4. Salvar nova frase personalizada
btnSalvar.addEventListener('click', () => {
  const novaFrase = input.value.trim();
  if (novaFrase && !meusFavoritos.includes(novaFrase)) {
    meusFavoritos.push(novaFrase);
    localStorage.setItem('talkpoint_frases', JSON.stringify(meusFavoritos));
    renderizarBotoes();
    input.value = "";
  }
});

// 5. Botão de fala manual
btnFalar.addEventListener('click', () => {
  if (input.value.trim() !== "") {
    falar(input.value);
    input.value = "";
  }
});

// Inicialização
renderizarBotoes();
window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();