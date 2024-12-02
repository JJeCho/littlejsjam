import * as ljs from 'littlejsengine';
import Weapon from '../weapon.js';
import RottenWatermelonBomb from './rottenWatermelonBomb.js';

export default class RottenWatermelon extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.cooldown = 5; // Longer cooldown due to powerful effect
        this.name = 'Rotten Watermelon';
        this.enemies = enemies;
    }

    attack() {
        // Throw a bomb towards the mouse cursor
        let mousePos = ljs.mousePos.copy();
        let direction = mousePos.subtract(this.player.pos).normalize();
        let speed = 0.1; // Adjust speed as needed
        new RottenWatermelonBomb(
            this.player.pos.copy(),
            direction,
            speed,
            this.enemies
        );
    }

    levelUp() {
        super.levelUp();
        // Possibly reduce cooldown or increase shrapnel count
        this.cooldown = Math.max(1, this.cooldown - 0.5); // Reduce cooldown per level
    }
}
