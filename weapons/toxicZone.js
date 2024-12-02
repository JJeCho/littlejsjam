import * as ljs from 'littlejsengine';

export default class ToxicZone extends ljs.EngineObject {
    constructor(player, enemies, radius, damage, tickRate) {
        super(player.pos.copy(), new ljs.Vector2(0, 0)); // Size is irrelevant here
        this.player = player;
        this.enemies = enemies;
        this.radius = radius;
        this.damage = damage;
        this.tickRate = tickRate;
        this.lastTick = 0;
        this.setCollision(false, false); // Disable collisions
        this.renderOrder = -1; // Render behind other objects
    }

    update() {
        // Follow the player's position
        this.pos = this.player.pos.copy();

        // Apply damage at intervals
        this.lastTick += ljs.timeDelta;
        if (this.lastTick >= this.tickRate) {
            this.applyDamage();
            this.lastTick = 0;
        }
    }

    applyDamage() {
        for (let enemy of this.enemies) {
            // Check if the enemy is within the damage zone
            if (this.pos.distanceSquared(enemy.pos) <= this.radius ** 2) {
                enemy.takeDamage(this.damage);
            }
        }
    }

    render() {
        // Access the main canvas context
        const context = ljs.mainContext;

        // Save the context state
        context.save();

        // Convert world position to screen position
        const screenPos = ljs.worldToScreen(this.pos);

        // Calculate the screen radius based on camera scale
        const screenRadius = this.radius * ljs.cameraScale;

        // Draw the AoE circle at the player's position
        context.beginPath();
        context.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(204, 51, 51, 0.3)'; // Semi-transparent color
        context.fill();

        // Restore the context state
        context.restore();
    }
}
