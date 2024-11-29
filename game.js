'use strict';

import * as ljs from "littlejsengine";

// Global Variables
let player;
let enemies = [];
let experienceItems = [];
let level = 1;
let experience = 0;
let experienceToLevelUp = 100;
let gameTime = 0;
let gameDuration = 30 * 60; // 30 minutes in seconds

// Player Class
class Player extends ljs.EngineObject {
    constructor(pos) {
        super(pos, new ljs.Vector2(1, 1), null, 0);
        this.speed = 1;
        this.health = 100;
        this.maxHealth = 100;
        this.weapons = [];
        this.passives = [];
        this.autoAttackTimer = 0;
        this.autoAttackCooldown = 1; // 1 second cooldown

        // Enable collision and physics
        this.setCollision(true, false);
        this.mass = 1;
    }

    update() {
        // Handle Movement
        let inputVector = new ljs.Vector2(0, 0);
        if (ljs.keyIsDown('ArrowLeft') || ljs.keyIsDown('a')) {
            inputVector.x -= 0.1;
        }
        if (ljs.keyIsDown('ArrowRight') || ljs.keyIsDown('d')) {
            inputVector.x += 0.1;
        }
        if (ljs.keyIsDown('ArrowUp') || ljs.keyIsDown('w')) {
            inputVector.y += 0.1;
        }
        if (ljs.keyIsDown('ArrowDown') || ljs.keyIsDown('s')) {
            inputVector.y -= 0.1;
        }

        // Normalize input and set velocity
        if (inputVector.lengthSquared()) {
            inputVector.normalize();
            this.velocity = inputVector.scale(this.speed);
        } else {
            this.velocity = new ljs.Vector2(0, 0);
        }

        // Auto-Attack Logic
        this.autoAttackTimer -= ljs.timeDelta;
        if (this.autoAttackTimer <= 0) {
            this.autoAttack();
            this.autoAttackTimer = this.autoAttackCooldown;
        }

        // Collision with Enemies
        for (let enemy of enemies) {
            if (this.pos.distanceSquared(enemy.pos) < (this.size.x / 2 + enemy.size.x / 2) ** 2) {
                this.takeDamage(enemy.damage);
            }
        }

        // Call the parent update method to apply physics
        super.update();
    }

    autoAttack() {
        // Get the mouse position in world coordinates
        let mousePosWorld = ljs.screenToWorld(ljs.mousePosScreen);

        // Calculate direction from player to mouse
        let direction = mousePosWorld.subtract(this.pos).normalize();

        // Create a Projectile in that direction
        let projectile = new Projectile(this.pos.copy(), direction);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            gameOver();
        }
    }

    render() {
        // Draw the Player (Placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(0, 1, 0, 1));
    }
}

// Projectile Class
class Projectile extends ljs.EngineObject {
    constructor(pos, direction) {
        super(pos, new ljs.Vector2(0.5, 0.5), null, 0);
        this.speed = 10;
        this.direction = direction.normalize();
        this.lifeTime = 2; // Seconds

        // Use physics engine
        this.setCollision(false, false);
        this.mass = 0; // Projectiles are unaffected by forces

        // Set velocity
        this.velocity = this.direction.scale(this.speed);

        projectiles.push(this);
    }

    update() {
        // Call parent update to apply physics
        super.update();

        this.lifeTime -= ljs.timeDelta;
        if (this.lifeTime <= 0) {
            this.destroy();
            projectiles.splice(projectiles.indexOf(this), 1);
            return;
        }

        // Collision with Enemies
        for (let enemy of enemies) {
            if (this.pos.distanceSquared(enemy.pos) < (this.size.x / 2 + enemy.size.x / 2) ** 2) {
                enemy.takeDamage(10);
                this.destroy();
                projectiles.splice(projectiles.indexOf(this), 1);
                break;
            }
        }
    }

    render() {
        // Draw the Projectile (Placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(1, 1, 0, 1));
    }
}

// Enemy Class
class Enemy extends ljs.EngineObject {
    constructor(pos) {
        super(pos, new ljs.Vector2(1, 1), null, 0);
        this.speed = 2;
        this.health = 10;
        this.damage = 10;
    }

    update() {
        // Move Towards Player
        let direction = player.pos.copy().subtract(this.pos).normalize();
        this.pos.add(direction.scale(this.speed * ljs.timeDelta));
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.destroy();
            enemies.splice(enemies.indexOf(this), 1);
            // Spawn Experience Item
            let expItem = new ExperienceItem(this.pos.copy());
            experienceItems.push(expItem);
        }
    }

    render() {
        // Draw the Enemy (Placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(1, 0, 0, 1));
    }
}



// Experience Item Class
class ExperienceItem extends ljs.EngineObject {
    constructor(pos) {
        super(pos, new ljs.Vector2(0.5, 0.5), null, 0);
    }

    update() {
        // Check if Player Picks Up the Item
        if (this.pos.distanceSquared(player.pos) < (this.size.x / 2 + player.size.x / 2) ** 2) {
            experience += 10;
            this.destroy();
            experienceItems.splice(experienceItems.indexOf(this), 1);
            checkLevelUp();
        }
    }

    render() {
        // Draw the Experience Item (Placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(0, 0, 1, 1));
    }
}

// Global Arrays for Projectiles
let projectiles = [];

// Check for Level Up
function checkLevelUp() {
    if (experience >= experienceToLevelUp) {
        experience -= experienceToLevelUp;
        level += 1;
        experienceToLevelUp = Math.floor(experienceToLevelUp * 1.5);
        // Implement Level-Up Screen and Ability Selection
    }
}

// Game Over Function
function gameOver() {
    // Handle Game Over Logic
    console.log('Game Over');
    ljs.enginePause();
}

// Spawn Enemies at Intervals
let enemySpawnTimer = 0;
function spawnEnemy() {
    let side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { // Top
        x = Math.random() * 100;
        y = 0;
    } else if (side === 1) { // Right
        x = 100;
        y = Math.random() * 100;
    } else if (side === 2) { // Bottom
        x = Math.random() * 100;
        y = 100;
    } else { // Left
        x = 0;
        y = Math.random() * 100;
    }
    let enemy = new Enemy(new ljs.Vector2(x, y));
    enemies.push(enemy);
}

// Initialize the Game
function gameInit() {
    player = new Player(new ljs.Vector2(0, 0));
}

// Update Game Logic
function gameUpdate() {
    gameTime += ljs.timeDelta;

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
    ljs.drawTextScreen(`Level: ${level}`, new ljs.Vector2(100, 20), 20, new ljs.Color(1, 1, 1, 1));
    ljs.drawTextScreen(`XP: ${experience}/${experienceToLevelUp}`, new ljs.Vector2(100, 40), 20, new ljs.Color(1, 1, 1, 1));
    ljs.drawTextScreen(`Health: ${player.health}/${player.maxHealth}`, new ljs.Vector2(100, 60), 20, new ljs.Color(1, 1, 1, 1));
}

// Initialize the Engine
ljs.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
