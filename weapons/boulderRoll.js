import Weapon from '../weapon.js';
import BoulderProjectile from './boulderProjectile.js';

export default class BoulderRoll extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.cooldown = 5; // Adjust as needed
        this.damage = 20;
        this.projectileSpeed = 1.5;
        this.name = 'Boulder Roll';
        this.enemies = enemies;
    }

    attack() {
        // Fire a boulder at the nearest enemy
        let nearestEnemy = this.getNearestEnemy();
        if (nearestEnemy) {
            let direction = nearestEnemy.pos.copy().subtract(this.player.pos).normalize();
            new BoulderProjectile(this.player.pos.copy(), direction, this.damage, this.projectileSpeed, this.enemies);
        }
    }

    getNearestEnemy() {
        let nearestEnemy = null;
        let minDistance = Infinity;
        for (let enemy of this.enemies) {
            let distance = this.player.pos.distanceSquared(enemy.pos);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }
        return nearestEnemy;
    }

    levelUp() {
        super.levelUp();
        // Improve weapon stats based on level
        this.damage += 10;
        this.projectileSpeed += 0.5;
    }
}
