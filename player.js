'use strict';

import * as ljs from "littlejsengine";
import AttackSpeedBoost from "./passives/attackSpeedBoost.js";
import MaxHealthBoost from "./passives/maxHealthBoost.js";
import MovementSpeedBoost from "./passives/movementSpeedBoost.js";
import Projectile from "./projectile.js";

import AntSwarm from "./weapons/antSwarm.js";
import BambooStaff from "./weapons/bambooStaff.js";
import BananaBazooka from "./weapons/bananaBazooka.js";
import BoulderRoll from "./weapons/boulderRoll.js";
import CoconutCannon from "./weapons/coconutCannon.js";
import FungusSpores from "./weapons/fungusSpores.js";
import RottenWatermelon from "./weapons/rottenWatermelon.js";
import ToxicFur from "./weapons/toxicFur.js";
import VineWhip from "./weapons/vineWhip.js";

// Player Class
export default class Player extends ljs.EngineObject {
    constructor(pos, enemies, projectiles, experienceItems) {
        super(pos, new ljs.Vector2(1, 1), null, 0);
        this.speed = 1;
        this.damageMultiplier = 1;
        this.health = 100;
        this.maxHealth = 100;
        this.weapons = [];
        this.passives = [];
        this.facingRight = true;
        this.autoAttackTimer = 0;
        this.autoAttackCooldown = 1; // 1 second cooldown
        this.enemies = enemies; // Reference to enemies array
        this.projectiles = projectiles;
        this.experience = 0;
        this.experienceToLevelUp = 100;
        this.level=1;
        this.attackSpeedMultiplier = 1;
        this.pickupRadius = 3;
        this.experienceItems = experienceItems;

        // Enable collision and physics
        this.setCollision(true, false);
        this.mass = 1;

        this.animations = {
            idle: {
                side: [],
                front: [],
                back: []
            },
            walk: {
                side: [],
                front: [],
                back: []
            },
            death: {
                side: [],
                front: [],
                back: []
            }
        };
        
        this.currentDirection = 'side'; // Can be 'side', 'front', or 'back'
        this.currentAnimation = 'idle';
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.frameDuration = 0.1; // Duration of each frame in seconds

        // Load animations
        this.loadAnimations();
    }

    loadAnimations() {
        const idleTextureIndex = 0;
        const walkTextureIndex = 1;
        const deathTextureIndex = 2;
    
        // Directions mapping to row indices
        const directions = {
            side: 0,
            front: 1,
            back: 2
        };
    
        // Generate frames for each animation and direction
        for (let direction in directions) {
            const rowIndex = directions[direction];
    
            this.animations.idle[direction] = this.generateFrames(
                idleTextureIndex,
                320, // idle.png width
                240, // idle.png height
                80,  // Frame width
                80,  // Frame height
                rowIndex,
                4    // Number of frames per row for idle
            );
    
            this.animations.walk[direction] = this.generateFrames(
                walkTextureIndex,
                640, // walk.png width
                240, // walk.png height
                80,
                80,
                rowIndex,
                8    // Number of frames per row for walk
            );
    
            this.animations.death[direction] = this.generateFrames(
                deathTextureIndex,
                480, // death.png width
                240, // death.png height
                80,
                80,
                rowIndex,
                6    // Number of frames per row for death
            );
        }
    }
    
    // Modify generateFrames to accept rowIndex and framesPerRow
    generateFrames(textureIndex, sheetWidth, sheetHeight, frameWidth, frameHeight, rowIndex, framesPerRow) {
        const frames = [];
        for (let col = 0; col < framesPerRow; col++) {
            const pos = new ljs.Vector2(col * frameWidth, rowIndex * frameHeight);
            const size = new ljs.Vector2(frameWidth, frameHeight);
            const tileInfo = new ljs.TileInfo(pos, size, textureIndex);
            frames.push(tileInfo);
        }
        //console.log(`Generated frames for textureIndex ${textureIndex}, rowIndex ${rowIndex}:`, frames);
        return frames;
    }
    

    update() {
        if (this.isGameOver) {
            //console.log("Playing death animation:", this.currentFrame);
            this.frameTimer += ljs.timeDelta;
            const animationFrames = this.animations['death'][this.currentDirection];
        
            if (animationFrames && this.frameTimer >= this.frameDuration) {
                this.frameTimer -= this.frameDuration;
                this.currentFrame = Math.min(this.currentFrame + 1, animationFrames.length - 1);
            }
        
            return; // Skip further updates
        }
    
        
        // Handle Movement, Attacks, etc., only if the game is not over
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
        for (let enemy of this.enemies) {
            if (this.pos.distanceSquared(enemy.pos) < ((this.size.x + enemy.size.x) / 2) ** 2) {
                this.takeDamage(enemy.damage);
            }
        }

        // Prevent resetting animation if game is over
        if (this.currentAnimation !== 'death') {
            if (this.velocity.lengthSquared() > 0) {
                this.currentAnimation = 'walk';
            } else {
                this.currentAnimation = 'idle';
            }
        }

        for (let i = this.experienceItems.length - 1; i >= 0; i--) {
            let item = this.experienceItems[i];
            if (this.pos.distanceSquared(item.pos) <= this.pickupRadius ** 2) {
                this.experience += item.value; // Add experience
                this.experienceItems.splice(i, 1); // Remove the item from the array
                this.checkLevelUp();
                console.log(`Picked up experience item worth ${item.value} XP`);
                item.destroy(); // Ensure the experienceItem is properly cleaned up
            }
        }
        
        // Ensure render logic respects updated experienceItems array
        this.renderExperienceItems();
        // Determine current direction based on input
        this.updateDirection(inputVector);
    

        // Update animation frame
        this.frameTimer += ljs.timeDelta;
        const animationFrames = this.animations[this.currentAnimation][this.currentDirection];
        if (this.frameTimer >= this.frameDuration) {
            this.frameTimer -= this.frameDuration;
            this.currentFrame = (this.currentFrame + 1) % animationFrames.length;
        }


        // Call the parent update method to apply physics
        super.update();
    }

    renderExperienceItems() {
        for (let item of this.experienceItems) {
            item.render(); // Render only items still in the array
        }
    }

    updateDirection(inputVector) {
        if (inputVector.lengthSquared() === 0) {
            // No movement; keep the current direction
            return;
        }
    
        const angle = Math.atan2(inputVector.y, inputVector.x) * (180 / Math.PI);
    
        if (angle >= -45 && angle <= 45) {
            // Right
            this.currentDirection = 'side';
            this.facingRight = true;
        } else if (angle >= 135 || angle <= -135) {
            // Left
            this.currentDirection = 'side';
            this.facingRight = false;
        } else if (angle > 45 && angle < 135) {
            // Up
            this.currentDirection = 'back';
        } else if (angle < -45 && angle > -135) {
            // Down
            this.currentDirection = 'front';
        }
    }
    
    addWeapon(weaponClass) {
        // Check if weapon already exists
        let existingWeapon = this.weapons.find(weapon => weapon instanceof weaponClass);
        if (existingWeapon) {
            existingWeapon.levelUp();
        } else {
            // Add new weapon
            let newWeapon = new weaponClass(this, this.enemies, this.damageMultiplier);
            this.weapons.push(newWeapon);
        }
    }

    addPassive(passiveClass) {
        // Check if weapon already exists
        let existingPassive = this.passives.find(passive => passive instanceof passiveClass);
        if (existingPassive) {
            existingPassive.levelUp();
        } else {
            // Add new weapon
            let newPassive = new passive(this);
            this.passives.push(newPassive);
        }
    }

    autoAttack() {
        // Get the mouse position in world coordinates
        let mousePosWorld = ljs.mousePos;
    
        // Calculate direction from player to mouse
        let direction = mousePosWorld.subtract(this.pos).normalize();
    
        //console.log('Mouse Position:', mousePosWorld.toString());
        //console.log('Player Position:', this.pos.toString());
        //console.log('Direction:', direction.toString());
    
    
        // Create a Projectile in that direction
        let projectile = new Projectile(this.pos.copy(), direction, this.projectiles, this.enemies);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.gameOver();
        }
    }
    render() {
        const animationFrames = this.animations[this.currentAnimation][this.currentDirection];
        if (!animationFrames || this.currentFrame >= animationFrames.length) {
            console.error(`TileInfo is undefined for animation: ${this.currentAnimation}, frame: ${this.currentFrame}`);
            return;
        }
    
        const tileInfo = animationFrames[this.currentFrame];
        if (!tileInfo) {
            console.error(`TileInfo is null or undefined for frame: ${this.currentFrame}`);
            return;
        }
    
        //console.log(`Rendering frame ${this.currentFrame} of ${this.currentAnimation}:`, tileInfo);
    
        const scaleFactor = 5;
        const renderSize = this.size.scale(scaleFactor);
    
        const renderPos = this.pos
            .subtract(renderSize.subtract(this.size).scale(0.5))
            .add(new ljs.Vector2(2, 2));
    
        ljs.drawTile(
            renderPos,
            renderSize,
            tileInfo,
            this.color || new ljs.Color(1, 1, 1, 1),
            this.angle,
            this.currentDirection === 'side' && !this.facingRight
        );
    }
    
    
    
    // Game Over Function
    gameOver() {
        console.log('Game Over');
        this.currentAnimation = 'death';
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.isGameOver = true;
    
        // Calculate the duration of the death animation
        const animationFrames = this.animations['death'][this.currentDirection];
        const deathAnimationDuration = animationFrames.length * this.frameDuration;
    
        // Schedule pausing the game after the animation finishes
        setTimeout(() => {
            ljs.setPaused(true);
        }, deathAnimationDuration * 1000); // Convert seconds to milliseconds
    }

    openLevelUpMenu() {
        // Example: Randomly choose between weapon and passive
        let options = ['weapon', 'weapon', 'weapon', 'weapon', 'passive'];
        let choice = options[Math.floor(Math.random() * options.length)];
        if (choice === 'weapon') {
            // Add or upgrade weapon as before
            let weaponClasses = [AntSwarm, BambooStaff, BananaBazooka, BoulderRoll, CoconutCannon, FungusSpores, RottenWatermelon, ToxicFur, VineWhip];
            let randomWeaponClass = weaponClasses[Math.floor(Math.random() * weaponClasses.length)];
            this.addWeapon(randomWeaponClass);
        } else {
            // Add passive ability
            let passives = [MaxHealthBoost, AttackSpeedBoost, MovementSpeedBoost];
            let passive = passives[Math.floor(Math.random() * passives.length)];
            this.addPassive(passive);
        }
    }

    checkLevelUp() {
        if (this.experience >= this.experienceToLevelUp) {
            this.experience -= this.experienceToLevelUp;
            this.level += 1;
            this.experienceToLevelUp = Math.floor(this.experienceToLevelUp * 1.5);
    
            // Pause the game or open a level-up menu
            this.openLevelUpMenu();
        }
    }
    
    
}