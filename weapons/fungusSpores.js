import * as ljs from 'littlejsengine'; // Import LittleJS to access mousePos
import Weapon from '../weapon.js';
import SporeCloud from './sporeCloud.js';

export default class FungusSpores extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.cooldown = 10; // Adjust as needed
        this.damagePerSecond = 5;
        this.duration = 5; // Duration of the spore cloud
        this.radius = 3;
        this.name = 'Fungus Spores';
        this.enemies = enemies;
    }

    attack() {
        // Create a spore cloud at the cursor position
        new SporeCloud(ljs.mousePos.copy(), this.radius, this.damagePerSecond, this.duration, this.enemies);
    }

    levelUp() {
        super.levelUp();
        // Improve weapon stats based on level
        this.damagePerSecond += 2;
        this.radius += 0.5;
    }
}
