'use strict';

import * as ljs from "littlejsengine";

export default class SporeCloud extends ljs.EngineObject {
    constructor(pos, radius, damagePerSecond, duration, enemies) {
        super(pos, new ljs.Vector2(radius * 2, radius * 2), null, 0);
        this.radius = radius;
        this.damagePerSecond = damagePerSecond;
        this.duration = duration;
        this.enemies = enemies;
        this.setCollision(false, false);
        this.mass = 0;
        this.timer = new ljs.Timer(this.duration); // Timer for the spore cloud's lifespan
        this.damageInterval = 0.5; // Time between damage ticks
        this.accumulatedTime = 0; // Time accumulator for damage intervals
    }

    update() {
        super.update();

        // Destroy the spore cloud after its duration expires
        if (this.timer.elapsed()) {
            console.log("Spore cloud expired.");
            this.destroy();
            return;
        }

        // Accumulate time for damage ticks
        this.accumulatedTime += ljs.timeDelta;

        // Damage enemies if sufficient time has passed
        if (this.accumulatedTime >= this.damageInterval) {
            for (let enemy of this.enemies) {
                if (enemy && enemy.pos && enemy.size) {
                    // Check if the enemy is within the spore cloud's radius
                    if (ljs.isOverlapping(this.pos, this.size, enemy.pos, enemy.size)) {
                        console.log(`Damaging enemy at position: ${enemy.pos}`);
                        enemy.takeDamage(this.damagePerSecond * this.damageInterval);
                        console.log(`Enemy health after damage: ${enemy.health}`);
                    }
                } else {
                    console.error("Invalid enemy object:", enemy);
                }
            }
            // Reset the accumulated time
            this.accumulatedTime -= this.damageInterval;
        }
    }

    render() {
        // Draw the spore cloud as a semi-transparent green rectangle
        ljs.drawRect(
            this.pos,
            this.size,
            new ljs.Color(0.5, 0.8, 0.5, 0.5) // Greenish color with transparency
        );
    }
}
