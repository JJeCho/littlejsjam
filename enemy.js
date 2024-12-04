import * as ljs from "littlejsengine";
import ExperienceItem from "./experienceItem.js";

export default class Enemy extends ljs.EngineObject {
    constructor(pos, player, enemies, experienceItems, textureIndex, size, name, tileSize) {
        super(pos, size);

        // Assign class properties
        this.player = player;
        this.enemies = enemies;
        this.experienceItems = experienceItems;
        this.textureIndex = textureIndex;
        this.name = name;
        this.tileSize = tileSize || new ljs.Vector2(3, 4); // Default tile grid (3 columns, 4 rows)
        this.animationFrame = 0;
        this.animationSpeed = 0.2; // Animation speed
        this.row = 0; // Default animation row (downward facing)
        this.health = 10; // Default health, can be overridden
        this.baseHealth = 10; // Base health for scaling purposes
        this.baseSpeed = 0.1; // Default base speed
        this.baseDamage = 5; // Default base damage
        this.speed = this.calculateSpeed();
        this.damage = this.calculateDamage();

        // Enable collision and physics
        this.setCollision(true, false);
        this.mass = 1;

        console.log(`Enemy ${name} created with textureIndex: ${this.textureIndex}`);
    }

    static getEnemyAttributes(health) {
        // Define enemy types and associated sprite sheets
        const enemyTypes = [
            {
                types: ['Frog', 'Lizard'],
                size: new ljs.Vector2(0.6, 0.8),
                tileSize: new ljs.Vector2(20, 20), // 60x80 sprite sheet
                healthThreshold: 15, // Weak enemies
                textureIndexRange: [18, 19], // Texture indices for Frog and Lizard
            },
            {
                types: ['Gorilla', 'Lion Cub', 'Lion', 'Lioness', 'Parrot', 'Vulture'],
                size: new ljs.Vector2(1.26, 1.44),
                tileSize: new ljs.Vector2(42, 36), // 126x144 sprite sheet
                healthThreshold: 25, // Medium enemies
                textureIndexRange: [12, 17], // Texture indices for medium animals
            },
            {
                types: ['Buffalo', 'Camel A', 'Camel B', 'Elephant', 'Elephant Baby', 'Hippo', 'Kangaroo', 'Rhinoceros', 'Zebra'],
                size: new ljs.Vector2(1.56, 2.12),
                tileSize: new ljs.Vector2(52, 53), // 156x212 sprite sheet
                healthThreshold: Infinity, // Strong enemies
                textureIndexRange: [3, 11], // Texture indices for strong animals
            },
        ];

        // Determine the enemy type based on health
        for (const enemyType of enemyTypes) {
            if (health <= enemyType.healthThreshold) {
                // Randomly select an enemy type from the category
                const typeIndex = Math.floor(Math.random() * enemyType.types.length);
                return {
                    ...enemyType,
                    typeName: enemyType.types[typeIndex],
                    textureIndex: enemyType.textureIndexRange[0] + typeIndex,
                };
            }
        }
    }

    calculateDamage() {
        // Scale damage based on health
        return this.baseDamage * (1 + (1 - this.health / this.baseHealth));
    }
    calculateSpeed() {
        // Scale speed based on health, with a lower base speed multiplier
        const speedScalingFactor = 0.5; // Reduce this value to slow down all enemies
        return this.baseSpeed * speedScalingFactor * (1 + (1 - this.health / this.baseHealth));
    }
    
    update() {
        // Ensure the player object is valid
        if (!this.player || !this.player.pos) {
            console.error('Player is not defined for the enemy.');
            return;
        }
    
        // Calculate direction vector towards the player
        let direction = this.player.pos.copy().subtract(this.pos);
        if (direction.lengthSquared() > 0) {
            direction.normalize(); // Normalize the vector only if it has a length
        } else {
            console.warn(`${this.name} is already at the player position.`);
            direction = new ljs.Vector2(0, 0); // Prevent errors if direction is zero
        }
    
        // Update velocity and attributes dynamically
        this.speed = this.calculateSpeed(); // Update speed based on health
    
        // Only update velocity if not already moving
        if (this.velocity.lengthSquared() === 0) {
            this.velocity = direction.scale(this.speed);
        } else {
            this.velocity = this.velocity.add(direction.scale(this.speed * 0.1)).normalize().scale(this.speed);
        }
    
        // Update animation frame
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 3) { // 3 frames per row
            this.animationFrame = 0;
        }
    
        // Determine animation row based on movement direction
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        if (angle >= -Math.PI / 4 && angle <= Math.PI / 4) {
            this.row = 2; // Right
        } else if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4) {
            this.row = 3; // Up
        } else if (angle < -Math.PI / 4 && angle > -3 * Math.PI / 4) {
            this.row = 0; // Down
        } else {
            this.row = 1; // Left
        }
    
        // Calculate tile index for animation
        this.tileIndex = Math.floor(this.animationFrame) + this.row * 3;
    
        // Apply physics and update position
        super.update(); // Ensure parent update logic is applied
    }
    
    
    
    takeDamage(amount) {
        // Reduce health and check if enemy is dead
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.destroy();
            this.enemies.splice(this.enemies.indexOf(this), 1);

            // Spawn an experience item at the enemy's position
            const expItem = new ExperienceItem(this.pos.copy(), this.player, this.experienceItems, 100);
            this.experienceItems.push(expItem);
        }
    }

    render() {
        // Ensure valid rendering parameters
        if (this.textureIndex === undefined || this.tileIndex === undefined) {
            console.error("Invalid texture or tile index for rendering.");
            return;
        }
    
        // Correct tileSize based on the sprite's defined size
        const tileSize = this.tileSize; // Ensure this matches individual frame size
        const cols = 3; // Fixed number of columns in the sprite sheet
        const tileX = (this.tileIndex % cols) * tileSize.x; // X position (column index)
        const tileY = Math.floor(this.tileIndex / cols) * tileSize.y; // Y position (row index)
    
        // Debugging output for verification
        //console.log(
        //    `Rendering ${this.name} | tileIndex: ${this.tileIndex} | tileX: ${tileX}, tileY: ${tileY} | tileSize: (${tileSize.x}, ${tileSize.y})`
        //);
    
        // Calculate render position and size
        const scaleFactor = 1;
        const renderSize = this.size.scale(scaleFactor);
        const renderPos = this.pos.subtract(renderSize.subtract(this.size).scale(0.5));
    
        // Create tile information
        const tileInfo = new ljs.TileInfo(new ljs.Vector2(tileX, tileY), tileSize, this.textureIndex);
    
        // Render the sprite
        ljs.drawTile(
            renderPos,
            renderSize,
            tileInfo,
            new ljs.Color(1, 1, 1, 1), // Default white color
            0, // No rotation
            false // No mirroring
        );
    }
    
    
    
}
