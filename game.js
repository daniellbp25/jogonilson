let canvas, ctx;
let heroi, inimigo, cenario, explosaoImage;
let xHeroi, yHeroi, xInimigo, yInimigo;
let tirosHeroi = [], tirosInimigo = [];
let explosoes = [];
let yCenario1, yCenario2;
let velocidadeCenario = 5;
let gameOver = false;
let youWin = false;

let musicaAcao, somTiro, somExplosao;

function iniciarJogo() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    heroi = new Image();
    heroi.src = 'img/heroi.jpg';

    inimigo = new Image();
    inimigo.src = 'img/inimigo.jpg';

    cenario = new Image();
    cenario.src = 'img/cenario.jpg';

    explosaoImage = new Image();
    explosaoImage.src = 'img/explosao.png';

    musicaAcao = document.getElementById('musicaAcao');
    somTiro = document.getElementById('somTiro');
    somExplosao = document.getElementById('somExplosao');

    musicaAcao.play();

    heroi.onload = function() {
        xHeroi = canvas.width / 2 - heroi.width / 2;
        yHeroi = canvas.height - 100;
        desenhar();
    }

    inimigo.onload = function() {
        xInimigo = Math.random() * (canvas.width - 80);
        yInimigo = 0;
        desenhar();
    }

    cenario.onload = function() {
        yCenario1 = 0;
        yCenario2 = -canvas.height;
        desenhar();
    }

    document.addEventListener('keydown', movimentar);
    setInterval(movimentarInimigo, 500);
    setInterval(atirarInimigo, 2000);
    setInterval(desenhar, 20);
}

function desenhar() {
    if (gameOver || youWin) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cenario, 0, yCenario1, canvas.width, canvas.height);
    ctx.drawImage(cenario, 0, yCenario2, canvas.width, canvas.height);

    yCenario1 += velocidadeCenario;
    yCenario2 += velocidadeCenario;

    if (yCenario1 >= canvas.height) {
        yCenario1 = -canvas.height;
    }
    if (yCenario2 >= canvas.height) {
        yCenario2 = -canvas.height;
    }

    ctx.drawImage(heroi, xHeroi, yHeroi, 80, 80);
    ctx.drawImage(inimigo, xInimigo, yInimigo, 80, 80);

    tirosHeroi.forEach((tiro, index) => {
        ctx.fillStyle = 'blue';
        ctx.fillRect(tiro.x, tiro.y, 5, 10);
        tiro.y -= 5;

        if (tiro.y < 0) {
            tirosHeroi.splice(index, 1);
        } else if (colisao(tiro, xInimigo, yInimigo, 80, 80)) {
            explosoes.push({ x: xInimigo, y: yInimigo, tempo: 0 });
            somExplosao.play();
            tirosHeroi.splice(index, 1);
            reposicionarInimigo();
            mostrarYouWin();
        }
    });

    tirosInimigo.forEach((tiro, index) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(tiro.x, tiro.y, 5, 10);
        tiro.y += 5;

        if (tiro.y > canvas.height) {
            tirosInimigo.splice(index, 1);
        } else if (colisao(tiro, xHeroi, yHeroi, 80, 80)) {
            explosoes.push({ x: xHeroi, y: yHeroi, tempo: 0 });
            somExplosao.play();
            tirosInimigo.splice(index, 1);
            mostrarGameOver();
        }
    });

    explosoes.forEach((explosao, index) => {
        let frame = Math.floor(explosao.tempo / 7);
        ctx.drawImage(explosaoImage, frame * 64, 0, 64, 64, explosao.x, explosao.y, 80, 80);
        explosao.tempo += 1;
        if (explosao.tempo > 20) {
            explosoes.splice(index, 1);
        }
    });

    if (colisao({ x: xHeroi, y: yHeroi, width: 80, height: 80 }, xInimigo, yInimigo, 80, 80)) {
        explosoes.push({ x: xHeroi, y: yHeroi, tempo: 0 });
        explosoes.push({ x: xInimigo, y: yInimigo, tempo: 0 });
        somExplosao.play();
        mostrarGameOver();
    }
}

function movimentar(evento) {
    if (gameOver || youWin) return;

    switch (evento.key) {
        case 'ArrowLeft':
            xHeroi = Math.max(0, xHeroi - 50);
            break;
        case 'ArrowRight':
            xHeroi = Math.min(canvas.width - 80, xHeroi + 50);
            break;
        case ' ':
            atirarHeroi();
            break;
    }
    desenhar();
}

function movimentarInimigo() {
    if (gameOver || youWin) return;

    let direcao = Math.floor(Math.random() * 3);
    switch (direcao) {
        case 0:
            xInimigo = Math.max(0, xInimigo - 50);
            break;
        case 1:
            xInimigo = Math.min(canvas.width - 80, xInimigo + 50);
            break;
        case 2:
            yInimigo = Math.min(canvas.height - 80, yInimigo + 50);
            break;
    }
    desenhar();
}

function atirarHeroi() {
    let tiro = { x: xHeroi + 37.5, y: yHeroi - 10 };
    tirosHeroi.push(tiro);
    somTiro.play();
}

function atirarInimigo() {
    let tiro = { x: xInimigo + 37.5, y: yInimigo + 80 };
    tirosInimigo.push(tiro);
    somTiro.play();
}

function colisao(tiro, x, y, largura, altura) {
    return tiro.x > x && tiro.x < x + largura && tiro.y > y && tiro.y < y + altura;
}

function reposicionarInimigo() {
    xInimigo = Math.random() * (canvas.width - 80);
    yInimigo = 0;
}

function mostrarGameOver() {
    gameOver = true;
    document.getElementById('gameOverContainer').style.display = 'block';
    musicaAcao.pause();
}

function mostrarYouWin() {
    youWin = true;
    document.getElementById('youWinContainer').style.display = 'block';
    musicaAcao.pause();
}

function reiniciarJogo() {
    gameOver = false;
    youWin = false;
    document.getElementById('gameOverContainer').style.display = 'none';
    document.getElementById('youWinContainer').style.display = 'none';

    xHeroi = canvas.width / 2 - heroi.width / 2;
    yHeroi = canvas.height - 100;
    xInimigo = Math.random() * (canvas.width - 80);
    yInimigo = 0;

    tirosHeroi = [];
    tirosInimigo = [];
    explosoes = [];
    yCenario1 = 0;
    yCenario2 = -canvas.height;

    musicaAcao.currentTime = 0;
    musicaAcao.play();
    
    desenhar();
}