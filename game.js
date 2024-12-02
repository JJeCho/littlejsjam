'use strict';

import * as ljs from "littlejsengine";
import Enemy from "./enemy.js";
import Player from "./player.js";


// Global Variables
let player;
let enemies = [];
let experienceItems = [];
let gameTime = 0;
let gameDuration = 30 * 60; // 30 minutes in seconds
let projectiles = [];
let enemySpawnTimer = 0;


function spawnEnemy() {
    // Increase enemy stats based on gameTime or level
    let enemySpeed = 0.1 + gameTime * 0.001;
    let enemyHealth = 10 + player.level * 2;

    // Spawn enemy as before
    let side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) {
        x = Math.random() * 100;
        y = 0;
    } else if (side === 1) {
        x = 100;
        y = Math.random() * 100;
    } else if (side === 2) {
        x = Math.random() * 100;
        y = 100;
    } else {
        x = 0;
        y = Math.random() * 100;
    }
    let enemy = new Enemy(new ljs.Vector2(x, y), player, enemies, experienceItems);
    enemy.speed = enemySpeed;
    enemy.health = enemyHealth;
    enemies.push(enemy);
}

// Initialize the Game
function gameInit() {
    player = new Player(new ljs.Vector2(0, 0), enemies, projectiles);
}

// Update Game Logic
function gameUpdate() {
    gameTime += ljs.timeDelta;

    // Update the camera position before any updates
    ljs.setCameraPos(player.pos.copy());

    // Update Player
    player.update();

    // Update Enemies
    for (let enemy of enemies) {
        enemy.update();
    }

    // Update Projectiles
    for (let projectile of projectiles) {
        projectile.update();
    }

    // Update Experience Items
    for (let expItem of experienceItems) {
        expItem.update();
    }

    // Spawn Enemies Over Time
    enemySpawnTimer -= ljs.timeDelta;
    if (enemySpawnTimer <= 0) {
        spawnEnemy();
        enemySpawnTimer = Math.max(1, 5 - gameTime / 60); // Spawn faster over time
    }

    // Check Game Duration
    if (gameTime >= gameDuration) {
        console.log('You Survived!');
        ljs.enginePause();
    }
}


function gameUpdatePost() {
    // Post-Update Logic (if any)
}

// Render the Game
function gameRender() {
    // Clear the Screen

    // Render Player
    player.render();

    // Render Enemies
    for (let enemy of enemies) {
        enemy.render();
    }

    // Render Projectiles
    for (let projectile of projectiles) {
        projectile.render();
    }

    // Render Experience Items
    for (let expItem of experienceItems) {
        expItem.render();
    }
}

// Render UI Elements
function gameRenderPost() {
    // Draw HUD Elements
    ljs.drawTextScreen(`Level: ${player.level}`, new ljs.Vector2(100, 20), 20, new ljs.Color(1, 1, 1, 1));
    ljs.drawTextScreen(`XP: ${player.experience}/${player.experienceToLevelUp}`, new ljs.Vector2(100, 40), 20, new ljs.Color(1, 1, 1, 1));
    ljs.drawTextScreen(`Health: ${player.health}/${player.maxHealth}`, new ljs.Vector2(100, 60), 20, new ljs.Color(1, 1, 1, 1));

    // Display Weapons List
    let weaponYPosition = 110; // Starting Y position for the weapons list
    ljs.drawTextScreen(`Weapons:`, new ljs.Vector2(10, weaponYPosition), 20, new ljs.Color(1, 1, 0, 1));
    weaponYPosition += 30; // Move down for the first weapon

    // Loop through player's weapons and display them
    for (let weapon of player.weapons) {
        ljs.drawTextScreen(
            `${weapon.name} (Level ${weapon.level})`,
            new ljs.Vector2(10, weaponYPosition),
            20,
            new ljs.Color(1, 1, 1, 1)
        );
        weaponYPosition += 30; // Move down for the next weapon
    }

    // Display Passives List
    let passiveYPosition = 110; // Starting Y position for the weapons list
    ljs.drawTextScreen(`Passives:`, new ljs.Vector2(150, passiveYPosition), 20, new ljs.Color(1, 1, 0, 1));
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
ljs.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
