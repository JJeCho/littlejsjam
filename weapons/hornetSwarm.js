import Weapon from '../weapon.js';
import Hornet from './hornet.js';

export default class HornetSwarm extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.cooldown = 1; // Adjust as needed
        this.damage = 1;
        this.projectileSpeed = 1;
        this.name = 'Hornet Swarm';
        this.enemies = enemies;
        this.hornetCount = 3;
    }

    attack() {
        // Spawn hornets
        for (let i = 0; i < this.hornetCount; i++) {
            new Hornet(this.player.pos.copy(), this.damage, this.projectileSpeed, this.enemies);
        }
    }

    levelUp() {
        super.levelUp();
        // Improve weapon stats based on level
        this.damage += 2;
        this.hornetCount += 1;
    }
}
