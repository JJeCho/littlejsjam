import Passive from "./passive.js";
export default class MovementSpeedBoost extends Passive {
    constructor(player) {
        super(player);
        this.level = 1;
        this.speedIncrease = 0.2*this.level;
        this.name = 'Movement Speed Boost';
    }

    apply() {
        this.player.speed += this.speedIncrease;
    }

    levelUp() {
        this.level += 1;
        this.speedIncrease = 0.2*this.level;
        this.apply();
    }
}