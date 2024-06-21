let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;

let canvas = document.getElementById("canvas");
canvas.width = WIDTH
canvas.height = HEIGHT;

// Constants but leave them able to be changed
let FPS = 60;
let M_PER_S = 1000;

let GRAVITY = 20;
let PLAYER_RADIUS = 25;
let ENEMY_WIDTH = 80;
let ENEMY_SEGMENT_HEIGHT = HEIGHT / 4;

// Globals
let yGrav = GRAVITY / FPS;
let playerX = Math.max(WIDTH / 4 - PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
let yVel = 1;
let yVelInc = 300 / FPS;
let playerY = HEIGHT / 2;
let frame = 0;
let prevdelta = 0;
let enemies = [];
let keypress = false;
let score = 0;
let highScore = -1;
let deaths = -1;

function drawPlayer(ctx, x, y, size = 1) {
    ctx.beginPath();
    ctx.arc(x, y, PLAYER_RADIUS * size, 0, 2 * Math.PI);
    ctx.fillStyle = "rgb(150, 255, 150)";
    ctx.fill();
}

function startGame() {
    const ctx = document.getElementById("canvas").getContext("2d");
    if (score > highScore) {
        highScore = score;
    }

    deaths += 1;
    yGrav = GRAVITY / FPS;
    yVelInc = 300 / FPS;
    yVel = 1;
    enemies = []
    score = 0;
    frame = 0;
    playerX = Math.max(WIDTH / 4 - PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
    playerY = HEIGHT / 2;
    prevdelta = 0;

    // background
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "rgb(180, 220, 255)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    enemies.push(new Enemy(Math.floor(Math.random() * 4)))
    window.requestAnimationFrame(gameLoop);
}

class Enemy {
    constructor(opening_index) {
        this.opening_index = opening_index;
        this.x = WIDTH - (ENEMY_WIDTH / 2);
        this.scored = false;
    }
    draw(ctx) {
        this.x -= 2;
        ctx.fillStyle = "beige";
        ctx.fillRect(
            this.x,
            0,
            ENEMY_WIDTH,
            this.opening_index * ENEMY_SEGMENT_HEIGHT
        );
        let secondHeight = (this.opening_index + 1) * ENEMY_SEGMENT_HEIGHT;
        ctx.fillRect(this.x, secondHeight, ENEMY_WIDTH, HEIGHT - secondHeight);
    }
    check_player() {
        let closestX, closestY;
        if (playerX >= this.x && playerX <= this.x + ENEMY_WIDTH) {
            if (playerX > this.x + (ENEMY_WIDTH / 2) && !this.scored) {
                score++;
                this.scored = true;
            }
            closestX = playerX;
        }
        else if (Math.abs(this.x - playerX) < Math.abs(playerX - this.x - ENEMY_WIDTH)) {
            closestX = this.x;
        }
        else {
            closestX = this.x + ENEMY_WIDTH;
        }

        if ((playerY <= this.opening_index * ENEMY_SEGMENT_HEIGHT)
            || (playerY >= (this.opening_index + 1) * ENEMY_SEGMENT_HEIGHT)) {
            closestY = playerY;
        } else if (Math.abs(playerY - this.opening_index * ENEMY_SEGMENT_HEIGHT) < Math.abs((this.opening_index + 1) * ENEMY_SEGMENT_HEIGHT - playerY)) {
            closestY = this.opening_index * ENEMY_SEGMENT_HEIGHT;
        }
        else {
            closestY = (this.opening_index + 1) * ENEMY_SEGMENT_HEIGHT;
        }

        if (Math.sqrt(Math.pow(playerX - closestX, 2) + Math.pow(playerY - closestY, 2)) < PLAYER_RADIUS) {
            return true;
        }
        else {
            return false;
        }
    }
}


function gameLoop(delta) {
    if (delta - prevdelta >= M_PER_S / FPS) {
        const ctx = document.getElementById("canvas").getContext("2d");

        // background
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "rgb(180, 220, 255)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        for (let i = 0, n = enemies.length; i < n; i++) {
            enemies[i].draw(ctx)
            if (enemies[i].check_player()) {
                drawPlayer(ctx, playerX, playerY);
                startGame();
                return;
            }
        }
        if (enemies[enemies.length - 1].x <= 10) {
            enemies.pop();
        }

        drawPlayer(ctx, playerX, playerY);

        ctx.font = "1em rubik";
        ctx.fillStyle = "black";
        ctx.fillText(`Score: ${score} Highscore: ${highScore}`, 20, 50);

        playerY += yVel;

        yVel += yGrav;

        if (playerY >= HEIGHT) {
            startGame();
            return;
            yVel = 0;
            playerY = HEIGHT - PLAYER_RADIUS;
        } else if (playerY <= PLAYER_RADIUS) {
            playerY = PLAYER_RADIUS;
            yVel = 0.1;
        }

        if (frame == 120) {
            frame = 0;
            enemies.push(new Enemy(Math.floor(Math.random() * 4)))
        } else {
            frame += 1;
        }
        prevdelta = delta;
    }

    window.requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if (keypress) { return; }
    if (e.key == "ArrowUp" || e.key == " ") {
        if (yVel >= 0) {
            yVel = -yVelInc;
        } else if (yVel > -(yVelInc * 3)) {
            yVel -= yVelInc;
        }
        keypress = true;
    }
});

document.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (keypress) { return; }
    if (yVel >= 0) {
        yVel = -yVelInc;
    } else if (yVel > -(yVelInc * 3)) {
        yVel -= yVelInc;
    }
    keypress = true;
}, {passive:false});

document.addEventListener("touchend", (e) => {
    e.preventDefault();
    keypress = false;
}, {passive:false});

document.addEventListener("keyup", (e) => {
    keypress = false;
});

startGame();
