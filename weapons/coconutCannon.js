
import Weapon from '../weapon.js';
import CoconutProjectile from './coconutProjectile.js';
export default class CoconutCannon extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.cooldown = 2; // Adjust as needed
        this.damage = 15;
        this.projectileSpeed = 2;
        this.name = 'Coconut Cannon';
        this.enemies = enemies;
    }

    attack() {
        // Fire a coconut at the nearest enemy
        let nearestEnemy = this.getNearestEnemy();
        if (nearestEnemy) {
            let direction = nearestEnemy.pos.copy().subtract(this.player.pos).normalize();
            let projectile = new CoconutProjectile(this.player.pos.copy(), direction, this.damage, this.projectileSpeed, this.enemies);
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
        this.damage += 5;
        this.projectileSpeed += 1;
    }
}
