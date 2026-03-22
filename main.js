const btn = document.querySelector('#btnFalar');
const input = document.querySelector('#texto');
const display = document.querySelector('#display');

btn.addEventListener('click', () => {
  const mensagem = input.value;
  
  if (mensagem !== "") {
    // 1. Atualiza o Letreiro
    display.innerText = mensagem;

    // 2. Executa a Voz (Web Speech API)
    const fala = new SpeechSynthesisUtterance();
    fala.text = mensagem;
    fala.lang = 'pt-BR';
    fala.rate = 1; // Velocidade normal
    
    window.speechSynthesis.speak(fala);
    
    // Limpa o input para a próxima frase
    input.value = "";
  }
});