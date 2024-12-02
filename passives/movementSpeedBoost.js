import Passive from "./passive.js";
export default class MovementSpeedBoost extends Passive {
    constructor(player) {
        super(player);
        this.speedIncrease = 0.2; // Increase speed by 0.2 units
    }

    apply() {
        this.player.speed += this.speedIncrease;
    }
}