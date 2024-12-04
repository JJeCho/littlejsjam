import Passive from "./passive.js";
export default class AttackSpeedBoost extends Passive {
    constructor(player) {
        super(player);
        this.level = 1;
        this.attackSpeedIncrease = 0.2*this.level;
        this.name = "Attack Speed Boost";
    }

    apply() {
        this.player.autoAttackCooldown = this.autoAttackCooldown * this.attackSpeedIncrease;
    }

    levelUp() {
        this.level += 1;
        this.attackSpeedIncrease = 0.2*this.level;
        this.apply();
    }
}