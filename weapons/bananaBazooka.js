import * as ljs from 'littlejsengine';
import Weapon from '../weapon.js';
import BananaProjectile from './bananaProjectile.js';

export default class BananaBazooka extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.cooldown = 3; // Slower cooldown than Coconut Cannon
        this.damage = 25;  // Higher damage
        this.projectileSpeed = 1; // Slower projectile speed
        this.name = 'Banana Bazooka';
        this.enemies = enemies;
    }

    attack() {
        // Fire a banana in the direction of the mouse cursor
        let mousePos = ljs.mousePos.copy();
        let direction = mousePos.subtract(this.player.pos).normalize();
        new BananaProjectile(
            this.player.pos.copy(),
            direction,
            this.damage,
            this.projectileSpeed,
            this.enemies
        );
    }

    levelUp() {
        super.levelUp();
        // Improve weapon stats based on level
        this.damage += 10;          // Increase damage more per level
        this.projectileSpeed += 0.5; // Slightly increase speed per level
    }
}
