// Global variables
let gameArea = document.getElementById('gameArea');
let player = document.getElementById('player');
let scoreElement = document.getElementById('scoreValue');
let livesElement = document.getElementById('livesValue');
let startButton = document.getElementById('startButton');

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;
let playerX = gameArea.offsetWidth / 2 - 30; // Center the player
let playerY = gameArea.offsetHeight - 100;
let keys = {};
let lasers = [];
let enemies = [];
let meteors = [];
let comets = [];
let gameLoopInterval;
let enemySpawnInterval;
let meteorSpawnInterval;
let cometSpawnInterval;

// Initialize game
window.onload = function() {
    updatePlayerPosition();
    startButton.addEventListener('click', startGame);

    // Add keyboard event listeners
    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        
        // Space key to shoot
        if (e.key === ' ' && gameRunning) {
            shootLaser();
        }
    });

    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });
};

// Game control functions
function startGame() {
    if (gameRunning) return;

    // Reset game state
    resetGame();
    
    // Start game loops
    gameLoopInterval = setInterval(gameLoop, 20); // 50 FPS
    enemySpawnInterval = setInterval(spawnEnemy, 2000); // Spawn enemy every 2 seconds
    meteorSpawnInterval = setInterval(spawnMeteor, 3500); // Spawn meteor every 3.5 seconds
    cometSpawnInterval = setInterval(spawnComet, 5000); // Spawn comet every 5 seconds

    gameRunning = true;
    startButton.textContent = 'Restart Game';
}

function resetGame() {
    // Clear previous intervals if they exist
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (enemySpawnInterval) clearInterval(enemySpawnInterval);
    if (meteorSpawnInterval) clearInterval(meteorSpawnInterval);
    if (cometSpawnInterval) clearInterval(cometSpawnInterval);

    // Reset game state
    score = 0;
    lives = 3;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    // Reset player position
    playerX = gameArea.offsetWidth / 2 - 30;
    playerY = gameArea.offsetHeight - 100;
    updatePlayerPosition();

    // Clear all game elements
    lasers = [];
    enemies = [];
    meteors = [];
    comets = [];
    
    // Clear DOM elements
    removeAllGameElements();
}

function gameLoop() {
    movePlayer();
    moveLasers();
    moveEnemies();
    moveMeteors();
    moveComets();
    checkCollisions();
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoopInterval);
    clearInterval(enemySpawnInterval);
    clearInterval(meteorSpawnInterval);
    clearInterval(cometSpawnInterval);
    alert(`Game Over! Your score: ${score}`);
    startButton.textContent = 'Start New Game';
}

// Player movement
function movePlayer() {
    const moveSpeed = 8;
    
    // Left arrow or A key
    if ((keys['ArrowLeft'] || keys['a']) && playerX > 0) {
        playerX -= moveSpeed;
    }
    
    // Right arrow or D key
    if ((keys['ArrowRight'] || keys['d']) && playerX < gameArea.offsetWidth - 60) {
        playerX += moveSpeed;
    }
    
    // Up arrow or W key
    if ((keys['ArrowUp'] || keys['w']) && playerY > 0) {
        playerY -= moveSpeed;
    }
    
    // Down arrow or S key
    if ((keys['ArrowDown'] || keys['s']) && playerY < gameArea.offsetHeight - 80) {
        playerY += moveSpeed;
    }
    
    updatePlayerPosition();
}

function updatePlayerPosition() {
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
}

// Shooting mechanics
function shootLaser() {
    const laser = document.createElement('div');
    laser.classList.add('laser');
    laser.style.left = (playerX + 28) + 'px'; // Center the laser on the player
    laser.style.top = playerY + 'px';
    gameArea.appendChild(laser);
    
    lasers.push({
        element: laser,
        x: playerX + 28,
        y: playerY
    });
}

function moveLasers() {
    const laserSpeed = 10;
    for (let i = 0; i < lasers.length; i++) {
        lasers[i].y -= laserSpeed;
        lasers[i].element.style.top = lasers[i].y + 'px';
        
        // Remove lasers that go off-screen
        if (lasers[i].y < 0) {
            gameArea.removeChild(lasers[i].element);
            lasers.splice(i, 1);
            i--;
        }
    }
}

// Enemy spawning and movement
function spawnEnemy() {
    if (!gameRunning) return;
    
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    
    const enemyX = Math.random() * (gameArea.offsetWidth - 40);
    const enemyY = 0;
    
    enemy.style.left = enemyX + 'px';
    enemy.style.top = enemyY + 'px';
    gameArea.appendChild(enemy);
    
    enemies.push({
        element: enemy,
        x: enemyX,
        y: enemyY,
        speed: 2 + Math.random() * 2 // Random speed between 2 and 4
    });
}

function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += enemies[i].speed;
        enemies[i].element.style.top = enemies[i].y + 'px';
        
        // Remove enemies that go off-screen and reduce lives
        if (enemies[i].y > gameArea.offsetHeight) {
            gameArea.removeChild(enemies[i].element);
            enemies.splice(i, 1);
            i--;
            // Player loses a life when enemy passes
            reduceLife();
        }
    }
}

// Meteor spawning and movement
function spawnMeteor() {
    if (!gameRunning) return;
    
    const meteor = document.createElement('div');
    meteor.classList.add('meteor');
    
    const meteorX = Math.random() * (gameArea.offsetWidth - 30);
    const meteorY = 0;
    
    meteor.style.left = meteorX + 'px';
    meteor.style.top = meteorY + 'px';
    gameArea.appendChild(meteor);
    
    meteors.push({
        element: meteor,
        x: meteorX,
        y: meteorY,
        speed: 3 + Math.random() * 3, // Random speed between 3 and 6
        rotation: 0,
        rotationSpeed: Math.random() * 10 - 5 // Random rotation between -5 and 5 degrees
    });
}

function moveMeteors() {
    for (let i = 0; i < meteors.length; i++) {
        meteors[i].y += meteors[i].speed;
        meteors[i].rotation += meteors[i].rotationSpeed;
        meteors[i].element.style.top = meteors[i].y + 'px';
        meteors[i].element.style.transform = `rotate(${meteors[i].rotation}deg)`;
        
        // Remove meteors that go off-screen
        if (meteors[i].y > gameArea.offsetHeight) {
            gameArea.removeChild(meteors[i].element);
            meteors.splice(i, 1);
            i--;
        }
    }
}

// Comet spawning and movement
function spawnComet() {
    if (!gameRunning) return;
    
    const comet = document.createElement('div');
    comet.classList.add('comet');
    
    const cometX = Math.random() * (gameArea.offsetWidth - 20);
    const cometY = 0;
    
    comet.style.left = cometX + 'px';
    comet.style.top = cometY + 'px';
    gameArea.appendChild(comet);
    
    comets.push({
        element: comet,
        x: cometX,
        y: cometY,
        speedY: 4 + Math.random() * 3, // Random vertical speed between 4 and 7
        speedX: Math.random() * 4 - 2, // Random horizontal speed between -2 and 2
        rotation: Math.random() * 360 // Random initial rotation
    });
}

function moveComets() {
    for (let i = 0; i < comets.length; i++) {
        comets[i].y += comets[i].speedY;
        comets[i].x += comets[i].speedX;
        comets[i].element.style.top = comets[i].y + 'px';
        comets[i].element.style.left = comets[i].x + 'px';
        comets[i].element.style.transform = `rotate(${comets[i].rotation}deg)`;
        
        // Remove comets that go off-screen
        if (comets[i].y > gameArea.offsetHeight || 
            comets[i].x < -20 || 
            comets[i].x > gameArea.offsetWidth) {
            gameArea.removeChild(comets[i].element);
            comets.splice(i, 1);
            i--;
        }
    }
}

// Collision detection
function checkCollisions() {
    // Check laser collisions with enemies
    for (let i = 0; i < lasers.length; i++) {
        const laser = lasers[i];
        
        // Check collision with enemies
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            if (isColliding(laser, enemy, 4, 40)) {
                // Remove both laser and enemy
                gameArea.removeChild(laser.element);
                gameArea.removeChild(enemy.element);
                lasers.splice(i, 1);
                enemies.splice(j, 1);
                i--;
                
                // Increase score
                increaseScore(100);
                break;
            }
        }
        
        // Check collision with meteors if laser still exists
        if (i >= 0 && i < lasers.length) {
            for (let j = 0; j < meteors.length; j++) {
                const meteor = meteors[j];
                if (isColliding(laser, meteor, 4, 30)) {
                    // Remove both laser and meteor
                    gameArea.removeChild(laser.element);
                    gameArea.removeChild(meteor.element);
                    lasers.splice(i, 1);
                    meteors.splice(j, 1);
                    i--;
                    
                    // Increase score
                    increaseScore(150);
                    break;
                }
            }
        }
        
        // Check collision with comets if laser still exists
        if (i >= 0 && i < lasers.length) {
            for (let j = 0; j < comets.length; j++) {
                const comet = comets[j];
                if (isColliding(laser, comet, 4, 20)) {
                    // Remove both laser and comet
                    gameArea.removeChild(laser.element);
                    gameArea.removeChild(comet.element);
                    lasers.splice(i, 1);
                    comets.splice(j, 1);
                    i--;
                    
                    // Increase score
                    increaseScore(200);
                    break;
                }
            }
        }
    }
    
    // Check player collision with enemies
    for (let i = 0; i < enemies.length; i++) {
        if (isColliding(
            { x: playerX, y: playerY }, 
            enemies[i],
            60, 40
        )) {
            // Remove enemy and reduce player life
            gameArea.removeChild(enemies[i].element);
            enemies.splice(i, 1);
            i--;
            reduceLife();
        }
    }
    
    // Check player collision with meteors
    for (let i = 0; i < meteors.length; i++) {
        if (isColliding(
            { x: playerX, y: playerY }, 
            meteors[i],
            60, 30
        )) {
            // Remove meteor and reduce player life
            gameArea.removeChild(meteors[i].element);
            meteors.splice(i, 1);
            i--;
            reduceLife();
        }
    }
    
    // Check player collision with comets
    for (let i = 0; i < comets.length; i++) {
        if (isColliding(
            { x: playerX, y: playerY }, 
            comets[i],
            60, 40
        )) {
            // Remove comet and reduce player life
            gameArea.removeChild(comets[i].element);
            comets.splice(i, 1);
            i--;
            reduceLife();
        }
    }
}

function isColliding(obj1, obj2, size1, size2) {
    // Simple rectangular collision detection
    return obj1.x < obj2.x + size2 &&
           obj1.x + size1 > obj2.x &&
           obj1.y < obj2.y + size2 &&
           obj1.y + size1 > obj2.y;
}

// Game state functions
function increaseScore(points) {
    score += points;
    scoreElement.textContent = score;
}

function reduceLife() {
    lives--;
    livesElement.textContent = lives;
    
    if (lives <= 0) {
        gameOver();
    }
}

// Helper functions
function removeAllGameElements() {
    // Remove all lasers
    for (let laser of lasers) {
        if (laser.element.parentNode === gameArea) {
            gameArea.removeChild(laser.element);
        }
    }
    
    // Remove all enemies
    for (let enemy of enemies) {
        if (enemy.element.parentNode === gameArea) {
            gameArea.removeChild(enemy.element);
        }
    }
    
    // Remove all meteors
    for (let meteor of meteors) {
        if (meteor.element.parentNode === gameArea) {
            gameArea.removeChild(meteor.element);
        }
    }
    
    // Remove all comets
    for (let comet of comets) {
        if (comet.element.parentNode === gameArea) {
            gameArea.removeChild(comet.element);
        }
    }
}