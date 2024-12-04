'use strict';

import * as ljs from "littlejsengine";
import Enemy from "./enemy.js";
import Player from "./player.js";

// Image Sources
const imageSources = [
    './assets/player/idle.png',   // Texture index 0
    './assets/player/walk.png',   // Texture index 1
    './assets/player/death.png',  // Texture index 2

    // 156x212 Sprites (Texture indices 3-11)
    './assets/enemy/buffalo.png',
    './assets/enemy/camel_a.png',
    './assets/enemy/camel_b.png',
    './assets/enemy/elephant.png',
    './assets/enemy/elephant_baby.png',
    './assets/enemy/hippo.png',
    './assets/enemy/kangaroo.png',
    './assets/enemy/rhinoceros.png',
    './assets/enemy/zebra.png',

    // 126x144 Sprites (Texture indices 12-17)
    './assets/enemy/gorilla.png',
    './assets/enemy/lion_cub.png',
    './assets/enemy/lion.png',
    './assets/enemy/lioness.png',
    './assets/enemy/parrot_fly.png',
    './assets/enemy/vulture_fly.png',

    // 60x80 Sprites (Texture indices 18-19)
    './assets/enemy/frog.png',
    './assets/enemy/lizard.png',
];

// Preload and log images
imageSources.forEach((src, index) => {
    const img = new Image();
    img.onload = () => console.log(`Texture ${index} loaded successfully: ${src}`);
    img.onerror = () => console.error(`Failed to load texture ${index}: ${src}`);
    img.src = src;
});

// Global Variables
let player;
let enemies = [];
let experienceItems = [];
let projectiles = [];
let gameTime = 0;
let gameDuration = 30 * 60; // 30 minutes in seconds
let enemySpawnTimer = 0;

// Enemy Type Definitions
const ENEMY_TYPES = {
    WEAK: [
        { name: 'Frog', textureIndex: 18, size: new ljs.Vector2(0.6, 0.8), tileSize: new ljs.Vector2(20, 20) },
        { name: 'Lizard', textureIndex: 19, size: new ljs.Vector2(0.6, 0.8), tileSize: new ljs.Vector2(20, 20) }
    ],
    MEDIUM: [
        { name: 'Gorilla', textureIndex: 12, size: new ljs.Vector2(1.26, 1.44), tileSize: new ljs.Vector2(42, 36) },
        { name: 'Lion Cub', textureIndex: 13, size: new ljs.Vector2(1.26, 1.44), tileSize: new ljs.Vector2(42, 36) },
        { name: 'Lion', textureIndex: 14, size: new ljs.Vector2(1.26, 1.44), tileSize: new ljs.Vector2(42, 36) },
        { name: 'Lioness', textureIndex: 15, size: new ljs.Vector2(1.26, 1.44), tileSize: new ljs.Vector2(42, 36) },
        { name: 'Parrot', textureIndex: 16, size: new ljs.Vector2(1.26, 1.44), tileSize: new ljs.Vector2(42, 36) },
        { name: 'Vulture', textureIndex: 17, size: new ljs.Vector2(1.26, 1.44), tileSize: new ljs.Vector2(42, 36) }
    ],
    STRONG: [
        { name: 'Buffalo', textureIndex: 3, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) },
        { name: 'Camel A', textureIndex: 4, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) },
        { name: 'Camel B', textureIndex: 5, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) },
        { name: 'Elephant', textureIndex: 6, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) },
        { name: 'Elephant Baby', textureIndex: 7, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) },
        { name: 'Hippo', textureIndex: 8, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) },
        { name: 'Kangaroo', textureIndex: 9, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) },
        { name: 'Rhinoceros', textureIndex: 10, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) },
        { name: 'Zebra', textureIndex: 11, size: new ljs.Vector2(1.56, 2.12), tileSize: new ljs.Vector2(52, 53) }
    ]
};

function getEnemyTypeByHealth(health) {
    if (health <= 50) {
        return ENEMY_TYPES.WEAK[Math.floor(Math.random() * ENEMY_TYPES.WEAK.length)];
    } else if (health <= 100) {
        return ENEMY_TYPES.MEDIUM[Math.floor(Math.random() * ENEMY_TYPES.MEDIUM.length)];
    } else {
        return ENEMY_TYPES.STRONG[Math.floor(Math.random() * ENEMY_TYPES.STRONG.length)];
    }
}

function spawnEnemy() {
    if (!player || player.level === undefined) {
        console.error('Player or player.level is not initialized.');
        return;
    }

    // Enemy scaling with gameTime or player level
    const enemySpeed = 0.1 + gameTime * 0.001;
    const enemyHealth = 10 + player.level * 5;

    const enemyType = getEnemyTypeByHealth(enemyHealth);

    // Calculate spawn location relative to the player's position
    const screenSize = new ljs.Vector2(100, 100); // Example screen size; adjust as needed
    const spawnMargin = 10; // Distance outside the visible screen

    let x, y;
    const side = Math.floor(Math.random() * 4); // Randomly choose a side
    if (side === 0) { 
        // Top of the screen
        x = player.pos.x + Math.random() * screenSize.x - screenSize.x / 2;
        y = player.pos.y - screenSize.y / 2 - spawnMargin;
    } else if (side === 1) { 
        // Right of the screen
        x = player.pos.x + screenSize.x / 2 + spawnMargin;
        y = player.pos.y + Math.random() * screenSize.y - screenSize.y / 2;
    } else if (side === 2) { 
        // Bottom of the screen
        x = player.pos.x + Math.random() * screenSize.x - screenSize.x / 2;
        y = player.pos.y + screenSize.y / 2 + spawnMargin;
    } else { 
        // Left of the screen
        x = player.pos.x - screenSize.x / 2 - spawnMargin;
        y = player.pos.y + Math.random() * screenSize.y - screenSize.y / 2;
    }

    console.log(`Spawning enemy at (${x.toFixed(2)}, ${y.toFixed(2)})`);
    console.log(enemyType);

    const enemy = new Enemy(
        new ljs.Vector2(x, y),
        player,
        enemies,
        experienceItems,
        enemyType.textureIndex,
        enemyType.size,
        enemyType.name,
        enemyType.tileSize
    );

    enemy.speed = enemySpeed;
    enemy.health = enemyHealth;
    enemies.push(enemy); // Ensure it's added to the array
}


// Initialize the Game
function gameInit() {
    player = new Player(new ljs.Vector2(50, 50), enemies, projectiles, experienceItems);
}

// Update Game Logic
function gameUpdate() {
    gameTime += ljs.timeDelta;

    // Update camera position
    ljs.setCameraPos(player.pos.copy());

    // Update player, enemies, projectiles, and experience items
    player.update();
    enemies.forEach((enemy) => enemy.update());
    projectiles.forEach((projectile) => projectile.update());
    experienceItems.forEach((expItem) => expItem.update());

    // Spawn enemies over time
    enemySpawnTimer -= ljs.timeDelta;
    if (enemySpawnTimer <= 0) {
        spawnEnemy();
        enemySpawnTimer = Math.max(1, 2 - gameTime / 60); // Faster spawns over time
    }

    // End game after duration
    if (gameTime >= gameDuration) {
        console.log('You Survived!');
        ljs.enginePause();
    }
}

function gameUpdatePost() {
    // Post-Update Logic (if any)
}

function gameRender() {
    player.render();
    enemies.forEach((enemy) => enemy.render());
    projectiles.forEach((projectile) => projectile.render());
    experienceItems.forEach((expItem) => expItem.render());
}

// Render UI Elements
function gameRenderPost() {
    // Draw HUD Elements
    ljs.drawTextScreen(`Level: ${player.level}`, new ljs.Vector2(100, 20), 20, new ljs.Color(1, 1, 1, 1));
    ljs.drawTextScreen(`XP: ${player.experience}/${player.experienceToLevelUp}`, new ljs.Vector2(100, 40), 20, new ljs.Color(1, 1, 1, 1));
    ljs.drawTextScreen(`Health: ${player.health}/${player.maxHealth}`, new ljs.Vector2(100, 60), 20, new ljs.Color(1, 1, 1, 1));

    // Display Weapons List
    let weaponYPosition = 110; // Starting Y position for the weapons list
    ljs.drawTextScreen(`Weapons:`, new ljs.Vector2(50, weaponYPosition), 20, new ljs.Color(1, 1, 0, 1));
    weaponYPosition += 30; // Move down for the first weapon

    // Loop through player's weapons and display them
    for (let weapon of player.weapons) {
        ljs.drawTextScreen(
            `${weapon.name} (Level ${weapon.level})`,
            new ljs.Vector2(50, weaponYPosition),
            20,
            new ljs.Color(1, 1, 1, 1)
        );
        weaponYPosition += 30; // Move down for the next weapon
    }

    // Display Passives List
    let passiveYPosition = 110; // Starting Y position for the weapons list
    ljs.drawTextScreen(`Passives:`, new ljs.Vector2(200, passiveYPosition), 20, new ljs.Color(1, 1, 0, 1));
    passiveYPosition += 30; // Move down for the first weapon

    // Loop through player's weapons and display them
    for (let passive of player.passives) {
        ljs.drawTextScreen(
            `${passive.name} (Level ${passive.level})`,
            new ljs.Vector2(150, passiveYPosition),
            20,
            new ljs.Color(1, 1, 1, 1)
        );
        passiveYPosition += 30; // Move down for the next weapon
    }

}

// Initialize the Engine
ljs.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, imageSources);
