import Weapon from '../weapon.js';
import Ants from './ants.js';

export default class AntSwarm extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.name = 'Ant Swarm';
        this.damage = 10;
        this.orbitalCount = 1; // Start with one orbital
        this.orbitals = [];

        // Create initial orbitals
        this.createOrbitals();
    }

    levelUp() {
        super.levelUp();
        // Increase damage and orbital count every few levels
        this.damage += 5;

        if (this.level % 2 === 0) {
            this.orbitalCount += 1;
            this.createOrbitals();
        } else {
            // Update damage on existing orbitals
            for (let orbital of this.orbitals) {
                orbital.damage = this.damage;
            }
        }
    }

    createOrbitals() {
        // Destroy existing orbitals
        for (let orbital of this.orbitals) {
            orbital.destroy();
        }
        this.orbitals = [];

        // Create new orbitals
        for (let i = 0; i < this.orbitalCount; i++) {
            let angleOffset = (Math.PI * 2 * i) / this.orbitalCount;
            let orbital = new Ants(
                this.player,
                this.enemies,
                this.damage,
                angleOffset,
                this.orbitalCount
            );
            this.orbitals.push(orbital);
        }
    }

    destroy() {
        // Clean up orbitals when the weapon is destroyed or unequipped
        for (let orbital of this.orbitals) {
            orbital.destroy();
        }
    }
}
