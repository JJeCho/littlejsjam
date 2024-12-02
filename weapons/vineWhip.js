import * as ljs from "littlejsengine";

import Weapon from '../weapon.js';
import WhipAttack from './whipAttack.js';
export default class VineWhip extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.cooldown = 1; // Adjust as needed
        this.damage = 5;
        this.projectileSpeed = 0;
        this.name = 'Vine Whip';
        this.enemies = enemies;
    }

    attack() {
        // Attack horizontally in front of the player
        let direction = new ljs.Vector2(this.player.facingRight ? 1 : -1, 0);
        let position = this.player.pos.copy().add(direction.scale(this.player.size.x / 2));
        let whip = new WhipAttack(position, direction, this.damage, this.enemies);
    }

    levelUp() {
        super.levelUp();
        // Improve weapon stats based on level
        this.damage += 2;
    }
}