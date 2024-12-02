'use strict';

import * as ljs from "littlejsengine";
import ExperienceItem from "./experienceItem.js";
// Enemy Class
export default class Enemy extends ljs.EngineObject {
    constructor(pos, player, enemies, experienceItems) {
        // Initialize enemy at given position with size (1,1)
        super(pos, new ljs.Vector2(1, 1), null, 0);

        // Enemy attributes
        this.speed = 0.1;
        this.health = 10;
        this.damage = 10;
        this.player = player;
        this.enemies = enemies;
        this.experienceItems = experienceItems;

        // Enable collision and physics for the enemy
        this.setCollision(true, false);
        this.mass = 1; // Necessary for the physics engine to process movement
    }

    update() {
        // Calculate direction vector towards the player
        let direction = this.player.pos.copy().subtract(this.pos).normalize();

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
            this.enemies.splice(this.enemies.indexOf(this), 1);

            // Spawn an experience item at the enemy's position
            let expItem = new ExperienceItem(this.pos.copy(), this.player, this.experienceItems);
            this.experienceItems.push(expItem);
        }
    }

    render() {
        // Render the enemy as a red rectangle (placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(1, 0, 0, 1));
    }
}