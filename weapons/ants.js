import * as ljs from 'littlejsengine';

export default class Ants extends ljs.EngineObject {
    constructor(player, enemies, damage, angleOffset, orbitalCount) {
        super(player.pos.copy(), new ljs.Vector2(1, 1)); // Size of the orbital
        this.player = player;
        this.enemies = enemies;
        this.damage = damage;
        this.angleOffset = angleOffset;
        this.orbitalCount = orbitalCount;
        this.orbitRadius = 2; // Distance from the player
        this.orbitSpeed = 2; // Speed of rotation (radians per second)
        this.currentAngle = angleOffset;
        this.setCollision(false, false); // Disable physics collisions
    }

    update() {
        // Update the current angle based on orbit speed and time delta
        this.currentAngle += this.orbitSpeed * ljs.timeDelta;

        // Update the orbital's position relative to the player
        let offsetX = Math.cos(this.currentAngle) * this.orbitRadius;
        let offsetY = Math.sin(this.currentAngle) * this.orbitRadius;
        this.pos = this.player.pos.add(new ljs.Vector2(offsetX, offsetY));

        // Check for collisions with enemies
        for (let enemy of this.enemies) {
            if (
                this.pos.distanceSquared(enemy.pos) <
                ((this.size.x + enemy.size.x) / 2) ** 2
            ) {
                enemy.takeDamage(this.damage);
                // Optionally, you can add knockback or other effects here
            }
        }
    }

    render() {
        // Draw the orbital (e.g., as a rotating book)
        ljs.drawTile(
            this.pos,
            this.size,
            0,
            new ljs.Color(1, 1, 1, 1),
            this.currentAngle,
            false
        );
    }
}
