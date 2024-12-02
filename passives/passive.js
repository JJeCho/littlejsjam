export default class Passive {
    constructor(player) {
        this.player = player;
        this.level = 1;
    }

    apply() {
        // To be implemented by subclasses
    }

    levelUp() {
        this.level += 1;
        this.apply();
    }
}