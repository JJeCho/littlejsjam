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
import HornetSwarm from "./weapons/hornetSwarm.js";
import RottenWatermelon from "./weapons/rottenWatermelon.js";
import ToxicFur from "./weapons/toxicFur.js";
import VineWhip from "./weapons/vineWhip.js";

// Player Class
export default class Player extends ljs.EngineObject {
    constructor(pos, enemies, projectiles) {
        super(pos, new ljs.Vector2(1, 1), null, 0);
        this.speed = 1;
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
        for (let enemy of this.enemies) {
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
            let newWeapon = new weaponClass(this, this.enemies);
            this.weapons.push(newWeapon);
        }
    }

    addPassive(passive) {
        // Check if weapon already exists
        let existingPassive = this.passives.find(passive => passive instanceof Passive);
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
       // console.log('Player Position:', this.pos.toString());
        //console.log('Direction:', direction.toString());
    
    
        // Create a Projectile in that direction
        let projectile = new Projectile(this.pos.copy(), direction, this.projectiles, this.enemies);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.gameOver();
        }
    }

    render() {
        // Draw the Player (Placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(0, 1, 0, 1));
    }

    // Game Over Function
    gameOver() {
        // Handle Game Over Logic
        console.log('Game Over');
        ljs.enginePause();
    }

    // In openLevelUpMenu(), you could add:
    openLevelUpMenu() {
        // Example: Randomly choose between weapon and passive
        let options = ['weapon', 'weapon', 'weapon'];
        let choice = options[Math.floor(Math.random() * options.length)];
        if (choice === 'weapon') {
            // Add or upgrade weapon as before
            let weaponClasses = [AntSwarm, BambooStaff, BananaBazooka, BoulderRoll, CoconutCannon, FungusSpores, HornetSwarm, RottenWatermelon, ToxicFur, VineWhip];
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