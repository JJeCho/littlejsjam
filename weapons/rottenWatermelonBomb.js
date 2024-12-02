'use strict';

import * as ljs from 'littlejsengine';
import Shrapnel from './shrapnel.js';

export default class RottenWatermelonBomb extends ljs.EngineObject {
    constructor(pos, direction, speed, enemies) {
        super(pos, new ljs.Vector2(1.5, 1.5), null, 0); // Size of the bomb
        this.direction = direction;
        this.speed = speed;
        this.velocity = this.direction.scale(this.speed);
        this.enemies = enemies;
        this.lifeTime = 2; // Time before explosion in seconds
        this.timer = new ljs.Timer(this.lifeTime);
    }

    update() {
        super.update();

        // Check if it's time to explode
        if (this.timer.elapsed()) {
            this.explode();
            this.destroy();
        }

        // Optional: Handle collision with terrain or enemies
    }

    explode() {
        // Create shrapnel pieces
        let shrapnelCount = 20; // Number of shrapnel pieces
        let damage = 20; // Damage per shrapnel
        let shrapnelSpeed = 3; // Consistent speed for all shrapnel
    
        for (let i = 0; i < shrapnelCount; i++) {
            // Calculate the angle for each piece of shrapnel, evenly spaced
            let angle = (Math.PI * 2 * i) / shrapnelCount;
    
            // Direction vector based on angle
            let direction = new ljs.Vector2(Math.cos(angle), Math.sin(angle)).normalize();
    
            // Set a consistent speed for all shrapnel
            let velocity = direction.scale(shrapnelSpeed);
    
            // Create the shrapnel
            new Shrapnel(this.pos.copy(), velocity, damage, this.enemies);
        }
    }

    render() {
        // Draw the bomb as a dark green circle
        ljs.drawRect(this.pos, this.size, new ljs.Color(0, 0.5, 0, 1));
    }
}
