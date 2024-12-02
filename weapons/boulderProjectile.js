'use strict';

import * as ljs from "littlejsengine";

export default class BoulderProjectile extends ljs.EngineObject {
    constructor(pos, direction, damage, speed, enemies) {
        super(pos, new ljs.Vector2(2, 2), null, 0);
        this.direction = direction;
        this.damage = damage;
        this.speed = speed;
        this.velocity = this.direction.scale(this.speed);
        this.enemies = enemies;
        this.lifetime = 5; // Boulder exists for 5 seconds
        this.timer = new ljs.Timer(this.lifetime);
        this.setCollision(false, false);
        this.mass = 0;
    }

    update() {
        super.update();

        // Destroy after lifetime expires
        if (this.timer.elapsed()) {
            this.destroy();
            return;
        }

        // Collision with Enemies
        for (let enemy of this.enemies) {
            if (this.pos.distanceSquared(enemy.pos) < ((this.size.x + enemy.size.x) / 2) ** 2) {
                enemy.takeDamage(this.damage);
                // Boulder passes through; do not destroy
            }
        }
    }

    render() {
        ljs.drawRect(this.pos, this.size, new ljs.Color(0.5, 0.5, 0.5, 1)); // Grey color for boulder
    }
}
