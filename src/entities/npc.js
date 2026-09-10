/* =========================================================================
   [ENTITIES] LỚP NPC
   ========================================================================= */
import { Entity } from './entity.js';
import { CharacterRenderer } from '../renderers/characterRenderer.js';
import { UI } from '../ui/uiManager.js';
import { Utils } from '../utils/utils.js';
import { QuestSystem } from '../systems/questSystem.js';

export class NPC extends Entity {
    constructor(x, y) {
        super(x, y, 40, 50);
        this.name = 'Trưởng Làng'; this.colors = { body: '#ff9800', skin: '#ffcc80', hair: '#e65100' };
        this.dialogTimer = 0; this.dialogText = '';
    }
    takeDamage() {} 
    talkTo(p) {
        QuestSystem.onTalkNPC(p, this);
    }
    showDialog(t) { this.dialogText = t; this.dialogTimer = 4000; }
    update(dt) { super.update(dt); if (this.dialogTimer > 0) this.dialogTimer -= dt; }
    draw(ctx) {
        CharacterRenderer.draw(ctx, this);
        if (this.dialogTimer > 0) {
            ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); Utils.drawRoundRect(ctx, this.x - 50, this.y - 65, 140, 35, 4); ctx.fill();
            ctx.fillStyle = 'black'; ctx.font = 'bold 11px "Roboto", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(this.dialogText.substring(0, 22), this.x + 20, this.y - 50);
        }
    }
}
