import Passive from "./passive.js";
export default class MaxHealthBoost extends Passive {
    constructor(player) {
        super(player);
        this.level = 1;
        this.healthIncrease = 0.2*this.level;
        this.name = "Max Health Boost";
    }

    apply() {
        this.player.maxHealth = this.healthIncrease * this.this.player.health;
    }

    levelUp() {
        this.level += 1;
        this.healthIncrease = 0.2*this.level;
        this.apply();
    }
}