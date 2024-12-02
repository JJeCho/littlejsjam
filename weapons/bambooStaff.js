import * as ljs from 'littlejsengine';
import Weapon from '../weapon.js';
import StaffOrbital from './staffOrbital.js';

export default class BambooStaff extends Weapon {
    constructor(player, enemies) {
        super(player, enemies);
        this.name = 'Bamboo Staff';
        this.damage = 15;
        this.length = 5; // Initial length of the staff
        this.orbitSpeed = Math.PI; // Radians per second (half rotation per second)
        this.orbitDirection = 1; // 1 for clockwise, -1 for counterclockwise

        // Create the staff orbital
        this.staffOrbital = new StaffOrbital(
            player,
            enemies,
            this.damage,
            this.length,
            this.orbitSpeed,
            this.orbitDirection
        );

        // Cooldown timer to debounce mouse clicks
        this.changeDirectionCooldown = 0; // Initial cooldown of 0 means we can change right away
        this.cooldownTime = 0.2; // 200ms cooldown time
    }

    update() {
        // Update the cooldown timer
        if (this.changeDirectionCooldown > 0) {
            this.changeDirectionCooldown -= ljs.timeDelta; // Decrease cooldown by timeDelta
        }

        // Check for mouse clicks to change orbit direction, with cooldown
        if (ljs.mouseWasPressed(0) && this.changeDirectionCooldown <= 0) { // Left mouse button
            // Change the orbit direction
            console.log("pressed");
            this.orbitDirection *= -1;
            this.staffOrbital.orbitDirection = this.orbitDirection;

            // Set the cooldown to avoid multiple triggers
            this.changeDirectionCooldown = this.cooldownTime;
        }

        // Update the staff orbital
        this.staffOrbital.update();
    }

    levelUp() {
        super.levelUp();
        // Increase damage and length as the weapon levels up
        this.damage += 5;
        this.length += 0.5;

        // Update the staff orbital with new damage and length
        this.staffOrbital.damage = this.damage;
        this.staffOrbital.length = this.length;
    }

    destroy() {
        // Clean up the staff orbital when the weapon is destroyed
        this.staffOrbital.destroy();
    }
}
