import * as ljs from 'littlejsengine';

export default class StaffOrbital extends ljs.EngineObject {
    constructor(player, enemies, damage, length, orbitSpeed, orbitDirection) {
        super(player.pos.copy(), new ljs.Vector2(length, 0.2)); // Sword size with initial length and thickness
        this.player = player;
        this.enemies = enemies;
        this.damage = damage;
        this.length = length;
        this.orbitSpeed = orbitSpeed; // Rotation speed in radians per second
        this.orbitDirection = orbitDirection; // 1 for clockwise, -1 for counterclockwise
        this.currentAngle = 0; // Initial angle (in radians)
        this.setCollision(false, false); // Disable physics collisions
    }

    update() {
        // Update the current angle based on orbit speed, direction, and time delta
        this.currentAngle += this.orbitDirection * this.orbitSpeed * ljs.timeDelta;

        // Ensure angle stays within 0 to 2π for consistency
        this.currentAngle %= Math.PI * 2;

        // Set the position of the staff to be the player's position (anchored)
        this.pos = this.player.pos.copy();

        // Check for collisions with enemies along the length of the staff
        for (let enemy of this.enemies) {
            if (this.checkCollisionWithEnemy(enemy)) {
                enemy.takeDamage(this.damage);
                // Optionally, add knockback or other effects here
            }
        }
    }

    checkCollisionWithEnemy(enemy) {
        // The relative vector from the player to the enemy
        let enemyVec = enemy.pos.subtract(this.player.pos);

        // The direction vector of the staff
        let staffDirection = new ljs.Vector2(Math.cos(this.currentAngle), Math.sin(this.currentAngle));

        // Calculate the projection of the enemy vector onto the staff direction
        let projection = enemyVec.dot(staffDirection);

        // Check if the enemy is along the length of the staff
        if (projection > 0 && projection < this.length) {
            // Calculate the perpendicular distance from the enemy to the staff
            let perpendicularDistance = Math.abs(enemyVec.cross(staffDirection));

            // Check if the perpendicular distance is within the staff's thickness
            if (perpendicularDistance <= this.size.y / 2) {
                return true;
            }
        }
        return false;
    }

    render() {
        // Draw the staff starting from the player's position and extending outwards
        let staffEndX = this.player.pos.x + Math.cos(this.currentAngle) * this.length;
        let staffEndY = this.player.pos.y + Math.sin(this.currentAngle) * this.length;

        // Draw the staff as a rectangle from the player position to the calculated end point
        ljs.drawLine(
            this.player.pos,
            new ljs.Vector2(staffEndX, staffEndY),
            this.size.y, // Thickness of the staff
            new ljs.Color(0.8, 0.8, 0.8, 1) // Gray color for the staff
        );
    }
}
