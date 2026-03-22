const get = (id) => document.querySelector(id);

// --- SELETORES ---
const elements = {
    input: get('#texto'),
    display: get('#display'),
    overlay: get('#letreiro-overlay'),
    letreiroTexto: get('#letreiro-texto'),
    sheet: get('#config-sheet'),
    sidebar: get('#sidebar'),
    containerFavoritos: get('#favoritos'),
    // Sliders e Selects
    selectModo: get('#selectModo'),
    selectEfeito: get('#selectEfeito'),
    corTexto: get('#corTexto'),
    corFundo: get('#corFundo'),
    selectFonte: get('#selectFonte'),
    rangeLetreiro: get('#rangeVelLetreiro'),
    valLetreiro: get('#valVelLetreiro'),
    rangeVoz: get('#rangeVelVoz'),
    valVoz: get('#valVelVoz'),
    rangeEstrobo: get('#rangeVelEstrobo'),
    valEstrobo: get('#valVelEstrobo'),
    checkVoz: get('#checkVoz')
};

// --- CATEGORIAS ---
let categorias = JSON.parse(localStorage.getItem('talkpoint_categorias')) || {
    "Geral": ["Sim", "Não", "Obrigado"],
    "Saúde": ["Ajuda", "Dor", "Banheiro"]
};

// --- FUNÇÃO PRINCIPAL ---
function falar(texto) {
    if (!texto || texto.trim() === "") return;
    
    elements.display.innerText = texto;
    const modo = elements.selectModo.value;

    if (modo !== "padrao") {
        elements.letreiroTexto.innerText = texto;
        
        const cT = elements.corTexto.value;
        const cF = elements.corFundo.value;
        elements.overlay.style.backgroundColor = cF;
        elements.letreiroTexto.style.color = cT;
        elements.letreiroTexto.style.fontFamily = elements.selectFonte.value;
        
        document.documentElement.style.setProperty('--cor-letra-strobo', cT);
        document.documentElement.style.setProperty('--cor-fundo-strobo', cF);

        elements.letreiroTexto.className = "";
        elements.letreiroTexto.style.animation = "none";
        elements.letreiroTexto.offsetHeight; 
        elements.letreiroTexto.style.animation = "";

        const estroboAtivo = elements.selectEfeito.value === "piscar";
        const tEstrobo = elements.rangeEstrobo.value + 's';

        if (modo === "rolar") {
            const mult = parseFloat(elements.rangeLetreiro.value || 1);
            const duracao = `${Math.max(5, texto.length / 3) / mult}s`;
            if (estroboAtivo) {
                elements.letreiroTexto.style.animation = `rolarLetreiro ${duracao} linear infinite, estrobo-anim ${tEstrobo} steps(1) infinite`;
            } else {
                elements.letreiroTexto.classList.add('animar-rolar');
                elements.letreiroTexto.style.animationDuration = duracao;
            }
        } else {
            elements.letreiroTexto.classList.add('modo-estatico');
            if (estroboAtivo) elements.letreiroTexto.style.animation = `estrobo-anim ${tEstrobo} steps(1) infinite`;
        }

        elements.overlay.classList.remove('escondido');
    }

    if (elements.checkVoz.checked) {
        window.speechSynthesis.cancel();
        const fala = new SpeechSynthesisUtterance(texto);
        fala.rate = parseFloat(elements.rangeVoz.value);
        window.speechSynthesis.speak(fala);
    }
}

// --- FECHAMENTO E CLIQUE FORA ---

// 1. Letreiro (Tela Cheia)
const fecharLetreiro = () => {
    elements.overlay.classList.add('escondido');
    window.speechSynthesis.cancel();
};
if(get('#btnFecharLetreiro')) get('#btnFecharLetreiro').onclick = fecharLetreiro;
elements.overlay.onclick = fecharLetreiro;

// 2. Sidebar (Lista de Favoritos)
const fecharSidebar = () => elements.sidebar.style.left = "-320px";
if(get('#btnMenu')) get('#btnMenu').onclick = () => elements.sidebar.style.left = "0px";
if(get('#btnClose')) get('#btnClose').onclick = fecharSidebar;

// 3. Painel de Configurações (Bottom Sheet)
if(get('#btnAbrirConfig')) get('#btnAbrirConfig').onclick = () => elements.sheet.classList.add('sheet-open');
if(get('#btnFecharConfig')) get('#btnFecharConfig').onclick = () => elements.sheet.classList.remove('sheet-open');

// Clique fora para fechar TUDO (Sidebar e Config)
document.addEventListener('click', (e) => {
    // Se clicar no fundo do config-sheet (área escura)
    if (e.target === elements.sheet) elements.sheet.classList.remove('sheet-open');
    
    // Se clicar fora da sidebar enquanto ela está aberta
    if (elements.sidebar.style.left === "0px" && !elements.sidebar.contains(e.target) && e.target !== get('#btnMenu')) {
        fecharSidebar();
    }
});

// --- BOTÃO RESET ---
if(get('#btnReset')) {
    get('#btnReset').onclick = () => {
        if(confirm("Deseja resetar as cores e velocidades?")) {
            elements.corTexto.value = "#00ffcc";
            elements.corFundo.value = "#000000";
            elements.selectFonte.value = "sans-serif";
            elements.selectEfeito.value = "nenhum";
            elements.rangeLetreiro.value = 1;
            elements.rangeVoz.value = 1;
            elements.rangeEstrobo.value = 0.4;
            elements.valLetreiro.innerText = "1.0x";
            elements.valVoz.innerText = "1.0x";
            elements.valEstrobo.innerText = "Média";
            elements.selectModo.value = "rolar";
            elements.checkVoz.checked = false;
            document.documentElement.style.setProperty('--tempo-estrobo', '0.3s');
        }
    };
}

// --- CATEGORIAS ---
function renderizar() {
    elements.containerFavoritos.innerHTML = '';
    for (let cat in categorias) {
        const d = document.createElement('details');
        d.innerHTML = `<summary style="color:#00ffcc; padding:10px; cursor:pointer; list-style:none;"><strong>▸ ${cat.toUpperCase()}</strong></summary>`;
        const div = document.createElement('div');
        categorias[cat].forEach(f => {
            const b = document.createElement('button');
            b.innerText = f;
            b.style.cssText = "display:block; width:100%; margin:5px 0; padding:12px; background:#1a1a1a; color:#fff; border:1px solid #333; border-radius:8px; text-align:left;";
            b.onclick = () => { falar(f); fecharSidebar(); };
            div.appendChild(b);
        });
        d.appendChild(div);
        elements.containerFavoritos.appendChild(d);
    }
}

// Botões de Ação
if(get('#btnFalar')) get('#btnFalar').onclick = () => falar(elements.input.value);
if(get('#btnLimpar')) get('#btnLimpar').onclick = () => { elements.input.value = ""; elements.display.innerText = "(AGUARDANDO...)"; };
if(get('#btnSalvar')) {
    get('#btnSalvar').onclick = () => {
        const t = elements.input.value.trim();
        if(t) {
            const c = prompt("Categoria (Geral, Saúde...):", "Geral") || "Geral";
            if(!categorias[c]) categorias[c] = [];
            categorias[c].push(t);
            localStorage.setItem('talkpoint_categorias', JSON.stringify(categorias));
            renderizar();
        }
    };
}

// Sliders UI
elements.rangeLetreiro.oninput = () => elements.valLetreiro.innerText = elements.rangeLetreiro.value + 'x';
elements.rangeVoz.oninput = () => elements.valVoz.innerText = elements.rangeVoz.value + 'x';
elements.rangeEstrobo.oninput = () => {
    const v = elements.rangeEstrobo.value;
    elements.valEstrobo.innerText = v <= 0.1 ? "Urgente" : (v >= 0.3 ? "Lenta" : "Média");
    document.documentElement.style.setProperty('--tempo-estrobo', v + 's');
};

renderizar();
elements.selectEfeito.value = "nenhum";