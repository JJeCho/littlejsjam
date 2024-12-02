
'use strict';

import * as ljs from "littlejsengine";
export default class CoconutProjectile extends ljs.EngineObject {
    constructor(pos, direction, damage, speed, enemies) {
        super(pos, new ljs.Vector2(1, 1), null, 0);
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

        // Destroy if off-screen or after some time
        // Implement lifeTime if needed

        // Collision with Enemies
        for (let enemy of this.enemies) {
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

