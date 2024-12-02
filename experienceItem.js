
import * as ljs from "littlejsengine";
// Experience Item Class
export default class ExperienceItem extends ljs.EngineObject {
    constructor(pos, player, experienceItems) {
        super(pos, new ljs.Vector2(0.5, 0.5), null, 0);
        this.player = player;
        this.experienceItems = experienceItems;
    }

    update() {
        // Check if Player Picks Up the Item
        if (this.pos.distanceSquared(this.player.pos) < (this.size.x / 2 + this.player.size.x / 2) ** 2) {
            this.player.experience += 100;
            this.destroy();
            this.experienceItems.splice(this.experienceItems.indexOf(this), 1);
            this.player.checkLevelUp();
        }
    }

    render() {
        // Draw the Experience Item (Placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(0, 0, 1, 1));
    }
}
