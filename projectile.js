'use strict';

import * as ljs from "littlejsengine";
// Projectile Class
export default class Projectile extends ljs.EngineObject {
    constructor(pos, direction, projectiles, enemies) {
        super(pos, new ljs.Vector2(0.5, 0.5), null, 0);
        this.speed = 0.2;
        this.direction = direction.normalize();
        this.lifeTime = 2; // Seconds
        this.enemies = enemies;

        // Use physics engine
        this.setCollision(false, false);
        this.mass = 0; // Projectiles are unaffected by forces
        this.projectiles = projectiles;
        // Set velocity
        this.velocity = this.direction.scale(this.speed);
        this.projectiles.push(this);
    }

    update() {
        // Call parent update to apply physics
        super.update();

        this.lifeTime -= ljs.timeDelta;
        if (this.lifeTime <= 0) {
            this.destroy();
            this.projectiles.splice(this.projectiles.indexOf(this), 1);
            return;
        }

        // Collision with Enemies
        for (let enemy of this.enemies) {
            if (this.pos.distanceSquared(enemy.pos) < (this.size.x / 2 + enemy.size.x / 2) ** 2) {
                enemy.takeDamage(10);
                this.destroy();
                this.projectiles.splice(this.projectiles.indexOf(this), 1);
                break;
            }
        }
    }

    render() {
        // Draw the Projectile (Placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(1, 1, 0, 1));
    }
}