'use strict';

import * as ljs from 'littlejsengine';

export default class Shrapnel extends ljs.EngineObject {
    constructor(pos, direction, damage, enemies) {
        super(pos, new ljs.Vector2(0.5, 0.5), null, 0); // Small size for shrapnel
        this.direction = direction;
        this.damage = damage;
        this.speed = 3; // Fast-moving shrapnel
        this.velocity = this.direction.scale(this.speed);
        this.enemies = enemies;
        this.lifeTime = 1; // Shrapnel disappears after 1 second
        this.timer = new ljs.Timer(this.lifeTime);
    }

    update() {
        super.update();

        // Check if shrapnel lifetime is over
        if (this.timer.elapsed()) {
            this.destroy();
            return;
        }

        // Collision with enemies
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
    }

    render() {
        // Draw the shrapnel as small red rectangles
        ljs.drawRect(this.pos, this.size, new ljs.Color(1, 0, 0, 1));
    }
}
