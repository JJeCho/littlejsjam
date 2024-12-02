import Passive from "./passive.js";
export default class AttackSpeedBoost extends Passive {
    constructor(player) {
        super(player);
        this.level = 1;
        this.healthIncrease = 0.2*this.level;
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