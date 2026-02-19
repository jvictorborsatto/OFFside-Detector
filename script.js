/* =================================================
   OFFSIDE DETECTOR 
================================================= */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const resetBtn = document.getElementById("reset");
const btnDirecao = document.getElementById("direcao");
const resultado = document.getElementById("resultado");

// Botões para eixos Y e Z
const btnEixoY = document.getElementById("eixoY");
const btnEixoZ = document.getElementById("eixoZ");

let img = new Image();
let pontos = [];
let direcaoAtaque = 1;

// Objetos para armazenar os pontos de fuga
let fugaX = null; // Eixo X (usado para impedimento)
let fugaY = null; // Eixo Y
let fugaZ = null; // Eixo Z

// Controle dos eixos
let usarEixoY = false; // Por padrão, não usa eixo Y (assume linhas horizontais)
let usarEixoZ = false; // Por padrão, não usa eixo Z (assume linhas verticais)

// NOVO: Variável para armazenar os dados do último triângulo desenhado
let ultimoTriangulo = {
    peA: null,
    avA: null,
    peD: null,
    avD: null,
    projA: null,
    projD: null,
    fugaX: null,
    ativo: false
};

/* =================================================
   ZOOM
================================================= */

let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let zoomAtivo = false;

canvas.addEventListener("contextmenu", e => e.preventDefault());

canvas.addEventListener("mousedown", e => {
    if (e.button === 2) zoomAtivo = true;
});

canvas.addEventListener("mouseup", e => {
    if (e.button === 2) {
        zoomAtivo = false;
        zoom = 1;
        offsetX = 0;
        offsetY = 0;
        redesenhar();
    }
});

canvas.addEventListener("wheel", e => {
    if (!zoomAtivo) return;
    e.preventDefault();

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = zoom * factor;

    offsetX = mx - (mx - offsetX) * (newZoom / zoom);
    offsetY = my - (my - offsetY) * (newZoom / zoom);

    zoom = newZoom;

    redesenhar();
});

/* =================================================
   LOAD IMAGE
================================================= */

upload.addEventListener("change", e => {
    const reader = new FileReader();
    reader.onload = () => img.src = reader.result;
    reader.readAsDataURL(e.target.files[0]);
});

img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    redesenhar();
};

/* =================================================
   BOTÕES DOS EIXOS
================================================= */

btnEixoY.addEventListener("click", () => {
    usarEixoY = !usarEixoY;
    btnEixoY.innerText = usarEixoY ? "Eixo Y: ON" : "Eixo Y: OFF";
    btnEixoY.style.backgroundColor = usarEixoY ? "#9933ff" : "#6b7280";
    
    // Resetar pontos quando mudar a configuração
    resetBtn.click();
    
    console.log(`Modo eixo Y: ${usarEixoY ? "ativado" : "desativado (linhas horizontais)"}`);
});

btnEixoZ.addEventListener("click", () => {
    usarEixoZ = !usarEixoZ;
    btnEixoZ.innerText = usarEixoZ ? "Eixo Z: ON" : "Eixo Z: OFF";
    btnEixoZ.style.backgroundColor = usarEixoZ ? "#10b981" : "#6b7280";
    
    // Resetar pontos quando mudar a configuração
    resetBtn.click();
    
    console.log(`Modo eixo Z: ${usarEixoZ ? "ativado" : "desativado (linhas verticais)"}`);
});

/* =================================================
   MOUSE
================================================= */

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();

    let x = (e.clientX - rect.left) * (canvas.width / rect.width);
    let y = (e.clientY - rect.top) * (canvas.height / rect.height);

    x = (x - offsetX) / zoom;
    y = (y - offsetY) / zoom;

    return { x, y };
}

canvas.addEventListener("click", e => {
    // Calcular total de pontos necessários
    let totalPontosNecessarios = 4; // Eixo X sempre presente (4 pontos)
    
    if (usarEixoY) totalPontosNecessarios += 4; // +4 para eixo Y
    if (usarEixoZ) totalPontosNecessarios += 4; // +4 para eixo Z
    
    totalPontosNecessarios += 4; // +4 para os jogadores
    
    if (pontos.length >= totalPontosNecessarios) return;
    
    pontos.push(getMousePos(e));
    
    // Mostrar instruções baseado em quantos pontos já foram marcados
    const totalPontos = pontos.length;
    
    let idx = 0;
    
    // Eixo X (sempre presente)
    if (totalPontos <= 4) {
        console.log(`Eixo X - Linha 1: ponto ${totalPontos}/2`);
    } 
    else if (totalPontos <= 8) {
        console.log(`Eixo X - Linha 2: ponto ${totalPontos - 4}/2`);
    }
    // Eixo Y (opcional)
    else if (usarEixoY && totalPontos <= 12) {
        console.log(`Eixo Y - Linha 1: ponto ${totalPontos - 8}/2`);
    }
    else if (usarEixoY && totalPontos <= 16) {
        console.log(`Eixo Y - Linha 2: ponto ${totalPontos - 12}/2`);
    }
    // Eixo Z (opcional)
    else if (usarEixoZ && !usarEixoY && totalPontos <= 12) {
        console.log(`Eixo Z - Linha 1: ponto ${totalPontos - 8}/2`);
    }
    else if (usarEixoZ && !usarEixoY && totalPontos <= 16) {
        console.log(`Eixo Z - Linha 2: ponto ${totalPontos - 12}/2`);
    }
    else if (usarEixoZ && usarEixoY && totalPontos <= 20) {
        console.log(`Eixo Z - Linha 1: ponto ${totalPontos - 16}/2`);
    }
    else if (usarEixoZ && usarEixoY && totalPontos <= 24) {
        console.log(`Eixo Z - Linha 2: ponto ${totalPontos - 20}/2`);
    }
    // Jogadores (sempre os últimos 4 pontos)
    else {
        const jogadorIdx = totalPontos - (totalPontosNecessarios - 4);
        if (jogadorIdx === 1) {
            console.log(`Jogador 1 (Atacante) - Pé`);
        } else if (jogadorIdx === 2) {
            console.log(`Jogador 1 (Atacante) - Avançado`);
        } else if (jogadorIdx === 3) {
            console.log(`Jogador 2 (Defensor) - Pé`);
        } else if (jogadorIdx === 4) {
            console.log(`Jogador 2 (Defensor) - Avançado`);
        }
    }

    redesenhar();

    // Quando completar todos os pontos, calcular e analisar
    if (pontos.length === totalPontosNecessarios) {
        calcularPontosFuga();
        analisar();
    }
});

/* ================================================= */

btnDirecao.onclick = () => {
    direcaoAtaque *= -1;
    btnDirecao.innerText = direcaoAtaque === 1 ? "⇦ Gol/Goal " : "Gol/Goal ⇨";

    let totalPontosNecessarios = 4; // Eixo X sempre presente
    if (usarEixoY) totalPontosNecessarios += 4;
    if (usarEixoZ) totalPontosNecessarios += 4;
    totalPontosNecessarios += 4; // Jogadores
    
    if (pontos.length === totalPontosNecessarios) analisar();
};

resetBtn.onclick = () => {
    pontos = [];
    fugaX = null;
    fugaY = null;
    fugaZ = null;
    resultado.innerText = "";
    ultimoTriangulo.ativo = false; // NOVO: Limpa os triângulos
    redesenhar();
};

/* =================================================
   GEOMETRIA
================================================= */

const linha = (p1, p2) => ({
    a: p2.y - p1.y,
    b: p1.x - p2.x,
    c: p2.x * p1.y - p1.x * p2.y
});

const intersecao = (l1, l2) => {
    const det = l1.a * l2.b - l2.a * l1.b;
    return {
        x: (l2.b * (-l1.c) - l1.b * (-l2.c)) / det,
        y: (l1.a * (-l2.c) - l2.a * (-l1.c)) / det
    };
};

const distancia = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Função para encontrar ponto de interseção entre duas retas (dadas por ponto e direção)
const intersecaoRetaPontoDirecao = (p1, dir1, p2, dir2) => {
    // Resolve o sistema: p1 + t1*dir1 = p2 + t2*dir2
    const det = dir1.x * dir2.y - dir1.y * dir2.x;
    if (Math.abs(det) < 0.0001) return null; // Retas paralelas
    
    const t1 = ((p2.x - p1.x) * dir2.y - (p2.y - p1.y) * dir2.x) / det;
    
    return {
        x: p1.x + t1 * dir1.x,
        y: p1.y + t1 * dir1.y
    };
};

/* =================================================
   CÁLCULO DOS PONTOS DE FUGA
================================================= */

function calcularPontosFuga() {
    let idx = 0;
    
    // Eixo X (sempre presente - 4 pontos)
    const x1a = pontos[idx++];
    const x1b = pontos[idx++];
    const x2a = pontos[idx++];
    const x2b = pontos[idx++];
    fugaX = intersecao(linha(x1a, x1b), linha(x2a, x2b));
    
    // Eixo Y (opcional)
    if (usarEixoY) {
        const y1a = pontos[idx++];
        const y1b = pontos[idx++];
        const y2a = pontos[idx++];
        const y2b = pontos[idx++];
        fugaY = intersecao(linha(y1a, y1b), linha(y2a, y2b));
    } else {
        fugaY = null; // Representa linhas horizontais
    }
    
    // Eixo Z (opcional)
    if (usarEixoZ) {
        const z1a = pontos[idx++];
        const z1b = pontos[idx++];
        const z2a = pontos[idx++];
        const z2b = pontos[idx++];
        fugaZ = intersecao(linha(z1a, z1b), linha(z2a, z2b));
    } else {
        fugaZ = null; // Representa linhas verticais
    }
}

/* =================================================
   TRIÂNGULO RETÂNGULO COM CORREÇÃO DE PERSPECTIVA
================================================= */

function projetarComPerspectiva(pe, avancado) {
    // Direção das linhas de mesma coordenada Y (profundidade constante)
    // Essas linhas convergem para o ponto de fuga Y (ou são horizontais se Y estiver OFF)
    let dirY;
    if (usarEixoY && fugaY) {
        // Direção apontando para o ponto de fuga Y
        dirY = {
            x: fugaY.x - pe.x,
            y: fugaY.y - pe.y
        };
    } else {
        // Modo sem eixo Y: direção horizontal (paralela à borda da imagem)
        dirY = { x: 1, y: 0 }; // Vetor horizontal para a direita
    }
    
    // Direção vertical (eixo Z)
    let dirZ;
    if (usarEixoZ && fugaZ) {
        // Direção apontando para o ponto de fuga Z (linhas verticais em perspectiva)
        dirZ = {
            x: fugaZ.x - avancado.x,
            y: fugaZ.y - avancado.y
        };
    } else {
        // Modo sem eixo Z: direção vertical (paralela à borda da imagem)
        dirZ = { x: 0, y: 1 }; // Vetor vertical para baixo
    }
    
    // O ponto projetado é a interseção entre:
    // 1. A reta que parte do PÉ na direção Y (cateto horizontal)
    // 2. A reta que parte do AVANÇADO na direção Z (cateto vertical)
    const proj = intersecaoRetaPontoDirecao(pe, dirY, avancado, dirZ);
    
    return proj;
}

/* =================================================
   DESENHO
================================================= */

function ponto(p, cor) {
    if (!p) return;
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 / zoom, 0, Math.PI * 2);
    ctx.fill();
}

function linhaTracejada(a, b, cor) {
    if (!a || !b) return;
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([8 / zoom, 6 / zoom]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
}

function linhaSolida(a, b, cor) {
    if (!a || !b) return;
    ctx.strokeStyle = cor;
    ctx.lineWidth = 3 / zoom;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
}

/* ===== linha de impedimento completa ===== */

function linhaPerspectivaCompleta(p, fuga, cor) {
    if (!p || !fuga) return;
    
    const dx = fuga.x - p.x;
    const dy = fuga.y - p.y;

    const t = 5000;

    const p1 = { x: p.x - dx * t, y: p.y - dy * t };
    const p2 = { x: p.x + dx * t, y: p.y + dy * t };

    ctx.strokeStyle = cor;
    ctx.lineWidth = 4 / zoom;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

// NOVO: Função para desenhar os triângulos armazenados
function desenharTriangulosArmazenados() {
    if (!ultimoTriangulo.ativo) return;
    
    const t = ultimoTriangulo;
    
    // Linhas sólidas do pé ao avançado (hipotenusa)
    //linhaSolida(t.peA, t.avA, "#ff3b3b");
    //linhaSolida(t.peD, t.avD, "#ffd400");

    // Catetos tracejados
    linhaTracejada(t.peA, t.projA, "#ff3b3b");
    linhaTracejada(t.avA, t.projA, "#ff3b3b");
    linhaTracejada(t.peD, t.projD, "#ffd400");
    linhaTracejada(t.avD, t.projD, "#ffd400");

    // Pontos projetados
    ponto(t.projA, "#ff3b3b");
    ponto(t.projD, "#ffd400");

    // Linhas VAR
    linhaPerspectivaCompleta(t.projA, t.fugaX, "#ff3b3b");
    linhaPerspectivaCompleta(t.projD, t.fugaX, "#ffd400");
}

/* ================================================= */

function redesenhar() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(zoom, 0, 0, zoom, offsetX, offsetY);

    ctx.drawImage(img, 0, 0);

    // Calcular quantos pontos são necessários para os eixos
    let pontosEixos = 4; // Eixo X
    if (usarEixoY) pontosEixos += 4;
    if (usarEixoZ) pontosEixos += 4;
    
    // Desenhar todos os pontos com cores diferentes por categoria
    pontos.forEach((p, i) => {
        let cor = "#226b70"; // Azul padrão
        
        // Eixo X (sempre presente - primeiros 4 pontos)
        if (i < 4) {
            cor = "#0066ff"; // Eixo X - Azul forte
        }
        // Eixo Y (opcional)
        else if (usarEixoY && i < 8) {
            cor = "#9933ff"; // Eixo Y - Roxo
        }
        // Eixo Z (opcional) - quando Y está OFF
        else if (usarEixoZ && !usarEixoY && i < 8) {
            cor = "#00cc66"; // Eixo Z - Verde
        }
        // Eixo Z (opcional) - quando Y está ON
        else if (usarEixoZ && usarEixoY && i < 12) {
            cor = "#00cc66"; // Eixo Z - Verde
        }
        // Jogadores (sempre os últimos pontos)
        else {
            // Calcular a posição relativa do jogador (0 a 3)
            // independente de quantos pontos já foram marcados
            const posJogador = i - pontosEixos;
            
            // Mesmo que ainda não tenha completado todos os pontos dos eixos,
            // se já passou da quantidade de pontos dos eixos, é um jogador
            if (i >= pontosEixos) {
                if (posJogador === 0 || posJogador === 1) {
                    cor = "#ff3b3b"; // Atacante - Vermelho (pé e avançado)
                } else {
                    cor = "#ffd400"; // Defensor - Amarelo (pé e avançado)
                }
            }
        }

        ponto(p, cor);
    });

    // Resto do código permanece igual...
    // Desenhar os pontos de fuga se existirem
    if (fugaX) {
        ponto(fugaX, "#0066ff");
        ctx.fillStyle = "#ffffff";
        ctx.font = `${16 / zoom}px Arial`;
        ctx.fillText("X", fugaX.x + 10 / zoom, fugaX.y - 10 / zoom);
    }

    if (fugaY && usarEixoY) {
        ponto(fugaY, "#9933ff");
        ctx.fillStyle = "#ffffff";
        ctx.font = `${16 / zoom}px Arial`;
        ctx.fillText("Y", fugaY.x + 10 / zoom, fugaY.y - 10 / zoom);
    } else if (!usarEixoY) {
        // Mostrar indicador de linhas horizontais
        ctx.fillStyle = "#ffffff";
        ctx.font = `${16 / zoom}px Arial`;
        ctx.fillText("Y: Horizontal", 20 / zoom, 60 / zoom);
    }

    if (fugaZ && usarEixoZ) {
        ponto(fugaZ, "#00cc66");
        ctx.fillStyle = "#ffffff";
        ctx.font = `${16 / zoom}px Arial`;
        ctx.fillText("Z", fugaZ.x + 10 / zoom, fugaZ.y - 10 / zoom);
    } else if (!usarEixoZ) {
        // Mostrar indicador de linhas verticais
        ctx.fillStyle = "#ffffff";
        ctx.font = `${16 / zoom}px Arial`;
        ctx.fillText("Z: Vertical", 20 / zoom, 80 / zoom);
    }

    // Desenhar os triângulos se existirem
    desenharTriangulosArmazenados();
}

/* =================================================
   ANALISAR
================================================= */

function analisar() {
    // Calcular total de pontos necessários
    let totalPontosNecessarios = 4; // Eixo X sempre presente
    if (usarEixoY) totalPontosNecessarios += 4;
    if (usarEixoZ) totalPontosNecessarios += 4;
    totalPontosNecessarios += 4; // Jogadores
    
    if (pontos.length < totalPontosNecessarios) {
        console.error("Pontos insuficientes");
        return;
    }

    // Verificar se temos o ponto de fuga X
    if (!fugaX) {
        console.error("Ponto de fuga X não calculado");
        return;
    }

    // Encontrar os pontos dos jogadores (sempre os últimos 4)
    const jogadoresStart = pontos.length - 4;
    const peA = pontos[jogadoresStart];     // Atacante - Pé
    const avA = pontos[jogadoresStart + 1]; // Atacante - Avançado
    const peD = pontos[jogadoresStart + 2]; // Defensor - Pé
    const avD = pontos[jogadoresStart + 3]; // Defensor - Avançado

    // Projetar os pontos usando correção de perspectiva
    const projA = projetarComPerspectiva(peA, avA);
    const projD = projetarComPerspectiva(peD, avD);

    if (!projA || !projD) {
        console.error("Erro ao projetar pontos");
        return;
    }

    // ARMAZENAR os dados do triângulo para redesenho posterior
    ultimoTriangulo = {
        peA: peA,
        avA: avA,
        peD: peD,
        avD: avD,
        projA: projA,
        projD: projD,
        fugaX: fugaX,
        ativo: true
    };

    redesenhar();

    /* ===== TRIÂNGULOS COM CORREÇÃO DE PERSPECTIVA ===== */
    // Os desenhos agora são feitos pela função desenharTriangulosArmazenados()
    // que é chamada dentro de redesenhar()

    /* ===== CÁLCULO ===== */
    const dA = distancia(projA, fugaX);
    const dD = distancia(projD, fugaX);
    const impedido = direcaoAtaque === 1 ? dA < dD : dA > dD;

    resultado.innerHTML = impedido ? "🚨 <span style='color:red'>OFFSIDE</span>" : "✅ <span style='color:#00ff7f'>LEGAL</span>";
}

