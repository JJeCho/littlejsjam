
import * as ljs from "littlejsengine";
// Experience Item Class
export default class ExperienceItem extends ljs.EngineObject {
    constructor(pos, player, experienceItems, value) {
        super(pos, new ljs.Vector2(0.5, 0.5), null, 0);
        this.player = player;
        this.experienceItems = experienceItems;
        this.value = value;
    }

    render() {
        // Draw the Experience Item (Placeholder)
        ljs.drawRect(this.pos, this.size, new ljs.Color(0, 0, 1, 1));
    }
}
