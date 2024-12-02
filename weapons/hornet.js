'use strict';

import * as ljs from "littlejsengine";

export default class Hornet extends ljs.EngineObject {
    constructor(pos, damage, speed, enemies) {
        super(pos, new ljs.Vector2(0.5, 0.5), null, 0);
        this.damage = damage;
        this.speed = speed;
        this.enemies = enemies;
        this.setCollision(false, false);
        this.mass = 0;
        this.lifetime = 10; // Hornet exists for 10 seconds
        this.timer = new ljs.Timer(this.lifetime);
        this.target = null;
    }

    update() {
        super.update();

        // Destroy after lifetime expires
        if (this.timer.elapsed()) {
            this.destroy();
            return;
        }

        // Find the nearest enemy if we don't have a target or if the target is destroyed
        if (!this.target || this.target.isDestroyed) {
            this.target = this.getNearestEnemy();
        }

        if (this.target) {
            // Adjust direction towards the target
            let direction = this.target.pos.copy().subtract(this.pos).normalize();
            this.velocity = direction.scale(this.speed);
        }

        // Collision with Enemies
        for (let enemy of this.enemies) {
            if (this.pos.distanceSquared(enemy.pos) < ((this.size.x + enemy.size.x) / 2) ** 2) {
                enemy.takeDamage(this.damage);
                this.destroy(); // Hornet is destroyed upon hitting enemy
                break;
            }
        }
    }

    render() {
        ljs.drawRect(this.pos, this.size, new ljs.Color(1, 1, 0, 1)); // Yellow color for hornet
    }

    getNearestEnemy() {
        let nearestEnemy = null;
        let minDistance = Infinity;
        for (let enemy of this.enemies) {
            let distance = this.pos.distanceSquared(enemy.pos);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }
        return nearestEnemy;
    }
}
