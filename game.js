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


function checkLevelUp() {
    if (experience >= experienceToLevelUp) {
        experience -= experienceToLevelUp;
        level += 1;
        experienceToLevelUp = Math.floor(experienceToLevelUp * 1.5);

        // Pause the game or open a level-up menu
        openLevelUpMenu();
    }
}

class Passive {
    constructor(player) {
        this.player = player;
    }

    apply() {
        // To be implemented by subclasses
    }
}

class MovementSpeedBoost extends Passive {
    constructor(player) {
        super(player);
        this.speedIncrease = 0.2; // Increase speed by 0.2 units
    }

    apply() {
        this.player.speed += this.speedIncrease;
    }
}

// In openLevelUpMenu(), you could add:
function openLevelUpMenu() {
    // Example: Randomly choose between weapon and passive
    let options = ['weapon', 'passive'];
    let choice = options[Math.floor(Math.random() * options.length)];
    if (choice === 'weapon') {
        // Add or upgrade weapon as before
        let weaponClasses = [VineWhip, CoconutCannon];
        let randomWeaponClass = weaponClasses[Math.floor(Math.random() * weaponClasses.length)];
        player.addWeapon(randomWeaponClass);
    } else {
        // Add passive ability
        let passive = new MovementSpeedBoost(player);
        passive.apply();
        player.passives.push(passive);
    }
}


// Player Class
class Player extends ljs.EngineObject {
    constructor(pos) {
        super(pos, new ljs.Vector2(1, 1), null, 0);
        this.speed = 1;
        this.health = 100;
        this.maxHealth = 100;
        this.weapons = [];
        this.passives = [];
        this.attackSpeedMultiplier = 1;
        this.facingRight = true;
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
            this.facingRight = false;
        }
        if (ljs.keyIsDown('ArrowRight') || ljs.keyIsDown('d')) {
            inputVector.x += 0.1;
            this.facingRight = true;
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

        this.autoAttackTimer -= ljs.timeDelta;
        if (this.autoAttackTimer <= 0) {
            this.autoAttack();
            this.autoAttackTimer = this.autoAttackCooldown;
        }



        // Update Weapons
        for (let weapon of this.weapons) {
            weapon.update();
        }

        // Collision with Enemies
        for (let enemy of enemies) {
            if (this.pos.distanceSquared(enemy.pos) < ((this.size.x + enemy.size.x) / 2) ** 2) {
                this.takeDamage(enemy.damage);
            }
        }

        // Call the parent update method to apply physics
        super.update();
    }

    addWeapon(weaponClass) {
        // Check if weapon already exists
        let existingWeapon = this.weapons.find(weapon => weapon instanceof weaponClass);
        if (existingWeapon) {
            existingWeapon.levelUp();
        } else {
            // Add new weapon
            let newWeapon = new weaponClass(this);
            this.weapons.push(newWeapon);
        }
    }

    autoAttack() {
        // Get the mouse position in world coordinates
        let mousePosWorld = ljs.mousePos;
    
        // Calculate direction from player to mouse
        let direction = mousePosWorld.subtract(this.pos).normalize();
    
        console.log('Mouse Position:', mousePosWorld.toString());
        console.log('Player Position:', this.pos.toString());
        console.log('Direction:', direction.toString());
    
    
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
        this.speed = 0.2;
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
        // Initialize enemy at given position with size (1,1)
        super(pos, new ljs.Vector2(1, 1), null, 0);

        // Enemy attributes
        this.speed = 0.1;
        this.health = 10;
        this.damage = 10;

        // Enable collision and physics for the enemy
        this.setCollision(true, false);
        this.mass = 1; // Necessary for the physics engine to process movement
    }

    update() {
        // Calculate direction vector towards the player
        let direction = player.pos.copy().subtract(this.pos).normalize();

        // Set the enemy's velocity towards the player
        this.velocity = direction.scale(this.speed);

        // Apply physics updates
        super.update();

        // Additional enemy logic can be added here if needed
    }

    takeDamage(amount) {
        // Reduce health by the damage amount
        this.health -= amount;

        // Check if the enemy is dead
        if (this.health <= 0) {
            // Remove enemy from the game
            this.destroy();
            enemies.splice(enemies.indexOf(this), 1);

            // Spawn an experience item at the enemy's position
            let expItem = new ExperienceItem(this.pos.copy());
            experienceItems.push(expItem);
        }
    }

    render() {
        // Render the enemy as a red rectangle (placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(1, 0, 0, 1));
    }
}

// Weapon Base Class
class Weapon {
    constructor(player) {
        this.player = player;
        this.level = 1;
        this.cooldown = 1; // Time between attacks
        this.cooldownTimer = 0;
        this.name = 'Weapon'; 
    }

    update() {
        this.cooldownTimer -= ljs.timeDelta;
        if (this.cooldownTimer <= 0) {
            this.attack();
            this.cooldownTimer = this.cooldown / this.player.attackSpeedMultiplier;
        }
    }

    attack() {
        // To be implemented by subclasses
    }

    levelUp() {
        this.level += 1;
        // Improve weapon stats based on level
    }
}

class VineWhip extends Weapon {
    constructor(player) {
        super(player);
        this.cooldown = 1; // Adjust as needed
        this.damage = 5;
        this.projectileSpeed = 0;
        this.name = 'Vine Whip';
    }

    attack() {
        // Attack horizontally in front of the player
        let direction = new ljs.Vector2(this.player.facingRight ? 1 : -1, 0);
        let position = this.player.pos.copy().add(direction.scale(this.player.size.x / 2));
        let whip = new WhipAttack(position, direction, this.damage);
    }

    levelUp() {
        super.levelUp();
        // Improve weapon stats based on level
        this.damage += 2;
    }
}

class WhipAttack extends ljs.EngineObject {
    constructor(pos, direction, damage) {
        super(pos, new ljs.Vector2(5, 0.5), null, 0);
        this.direction = direction;
        this.damage = damage;
        this.lifeTime = 0.2; // Short duration
        this.setCollision(false, false);
        this.mass = 0;
    }

    update() {
        super.update();
        this.lifeTime -= ljs.timeDelta;
        if (this.lifeTime <= 0) {
            this.destroy();
            return;
        }

        // Collision with Enemies
        for (let enemy of enemies) {
            if (this.pos.distanceSquared(enemy.pos) < ((this.size.x + enemy.size.x) / 2) ** 2) {
                enemy.takeDamage(this.damage);
                // Whip might not be destroyed upon hitting an enemy
            }
        }
    }

    render() {
        ljs.drawRect(this.pos, this.size, new ljs.Color(0.5, 1, 0.5, 1));
    }
}

class CoconutCannon extends Weapon {
    constructor(player) {
        super(player);
        this.cooldown = 2; // Adjust as needed
        this.damage = 15;
        this.projectileSpeed = 2;
        this.name = 'Coconut Cannon';
    }

    attack() {
        // Fire a coconut at the nearest enemy
        let nearestEnemy = this.getNearestEnemy();
        if (nearestEnemy) {
            let direction = nearestEnemy.pos.copy().subtract(this.player.pos).normalize();
            let projectile = new CoconutProjectile(this.player.pos.copy(), direction, this.damage, this.projectileSpeed);
        }
    }

    getNearestEnemy() {
        let nearestEnemy = null;
        let minDistance = Infinity;
        for (let enemy of enemies) {
            let distance = this.player.pos.distanceSquared(enemy.pos);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }
        return nearestEnemy;
    }

    levelUp() {
        super.levelUp();
        // Improve weapon stats based on level
        this.damage += 5;
        this.projectileSpeed += 1;
    }
}

class CoconutProjectile extends ljs.EngineObject {
    constructor(pos, direction, damage, speed) {
        super(pos, new ljs.Vector2(1, 1), null, 0);
        this.direction = direction;
        this.damage = damage;
        this.speed = speed;
        this.setCollision(false, false);
        this.mass = 0;
        this.velocity = this.direction.scale(this.speed);
    }

    update() {
        super.update();

        // Destroy if off-screen or after some time
        // Implement lifeTime if needed

        // Collision with Enemies
        for (let enemy of enemies) {
            if (this.pos.distanceSquared(enemy.pos) < ((this.size.x + enemy.size.x) / 2) ** 2) {
                enemy.takeDamage(this.damage);
                this.destroy();
                break;
            }
        }
    }

    render() {
        ljs.drawRect(this.pos, this.size, new ljs.Color(0.6, 0.3, 0, 1));
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
            experience += 100;
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



// Game Over Function
function gameOver() {
    // Handle Game Over Logic
    console.log('Game Over');
    ljs.enginePause();
}

// Spawn Enemies at Intervals
let enemySpawnTimer = 0;
function spawnEnemy() {
    // Increase enemy stats based on gameTime or level
    let enemySpeed = 0.1 + gameTime * 0.001;
    let enemyHealth = 10 + level * 2;

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
    let enemy = new Enemy(new ljs.Vector2(x, y));
    enemy.speed = enemySpeed;
    enemy.health = enemyHealth;
    enemies.push(enemy);
}

// Initialize the Game
function gameInit() {
    player = new Player(new ljs.Vector2(0, 0));
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
    ljs.drawTextScreen(`Level: ${level}`, new ljs.Vector2(100, 20), 20, new ljs.Color(1, 1, 1, 1));
    ljs.drawTextScreen(`XP: ${experience}/${experienceToLevelUp}`, new ljs.Vector2(100, 40), 20, new ljs.Color(1, 1, 1, 1));
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
}

// Initialize the Engine
ljs.engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
