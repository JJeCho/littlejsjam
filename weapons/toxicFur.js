import Weapon from '../weapon.js';
import ToxicZone from './toxicZone.js';

export default class ToxicFur extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.name = 'Stinky Scent';
        this.radius = 3; // Initial radius of the damage zone
        this.damage = 5; // Damage per tick
        this.tickRate = 0.5; // Seconds between damage ticks

        // Create the AoE zone object
        this.aoeZone = new ToxicZone(player, enemies, this.radius, this.damage, this.tickRate);
    }

    levelUp() {
        super.levelUp();
        // Increase radius and damage as the weapon levels up
        this.radius += 0.5; // Expand the AoE zone
        this.damage += 2; // Increase damage per tick

        // Update the AoE zone with new radius and damage
        this.aoeZone.radius = this.radius;
        this.aoeZone.damage = this.damage;
    }

    // If the weapon can be destroyed or unequipped
    destroy() {
        this.aoeZone.destroy(); // Clean up the AoE zone object
    }
}
