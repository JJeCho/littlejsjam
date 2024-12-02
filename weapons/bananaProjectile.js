'use strict';

import * as ljs from 'littlejsengine';

export default class BananaProjectile extends ljs.EngineObject {
    constructor(pos, direction, damage, speed, enemies) {
        // Larger projectile size (2,2)
        super(pos, new ljs.Vector2(2, 2), null, 0);
        this.direction = direction;
        this.damage = damage;
        this.speed = speed;
        this.setCollision(false, false);
        this.mass = 0;
        this.velocity = this.direction.scale(this.speed);
        this.enemies = enemies;
    }

    update() {
        super.update();

        // Collision with Enemies
        for (let enemy of this.enemies) {
            if (
                this.pos.distanceSquared(enemy.pos) <
                ((this.size.x + enemy.size.x) / 2) ** 2
            ) {
                enemy.takeDamage(this.damage);
                this.destroy();
                break;
            }
        }

        // Optionally, destroy if off-screen or after some time
        // Implement lifeTime if needed
    }

    render() {
        // Draw the banana projectile in yellow color
        ljs.drawRect(this.pos, this.size, new ljs.Color(1, 1, 0, 1));
    }
}
