'use strict';

import * as ljs from "littlejsengine";
export default class WhipAttack extends ljs.EngineObject {
    constructor(pos, direction, damage, enemies) {
        super(pos, new ljs.Vector2(5, 0.5), null, 0);
        this.direction = direction;
        this.damage = damage;
        this.lifeTime = 0.2; // Short duration
        this.setCollision(false, false);
        this.mass = 0;
        this.enemies = enemies;
    }

    update() {
        super.update();
        this.lifeTime -= ljs.timeDelta;
        if (this.lifeTime <= 0) {
            this.destroy();
            return;
        }

        // Collision with Enemies
        for (let enemy of this.enemies) {
            if (this.pos.distanceSquared(enemy.pos) < ((this.size.x + enemy.size.x) / 2) ** 2) {
                enemy.takeDamage(this.damage);
                // Whip might not be destroyed upon hitting an enemy
            }
        }
    }

    render() {
        ljs.drawRect(this.pos, this.size, new ljs.Color(0.5, 1, 0.5, 1));
    }
}