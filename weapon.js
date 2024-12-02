import * as ljs from "littlejsengine";

// Weapon Base Class
export default class Weapon {
    constructor(player, enemies) {
        this.player = player;
        this.level = 1;
        this.cooldown = 1; // Time between attacks
        this.cooldownTimer = 0;
        this.name = 'Weapon';
        this.enemies = enemies;
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