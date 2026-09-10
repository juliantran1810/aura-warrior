/* =========================================================================
   [ENTITIES] LỚP NPC
   ========================================================================= */
import { Entity } from './entity.js';
import { CharacterRenderer } from '../renderers/characterRenderer.js';
import { UI } from '../ui/uiManager.js';
import { Utils } from '../utils/utils.js';

export class NPC extends Entity {
    constructor(x, y) {
        super(x, y, 40, 50);
        this.name = 'Trưởng Làng'; this.colors = { body: '#ff9800', skin: '#ffcc80', hair: '#e65100' };
        this.dialogTimer = 0; this.dialogText = '';
    }
    takeDamage() {} 
    talkTo(p) {
        if (p.quest.step === 0) { this.showDialog('Giết 3 quái ngoài rừng!'); p.quest.step = 1; p.quest.progress = 0; }
        else if (p.quest.step === 1) this.showDialog(`Đã diệt: ${p.quest.progress}/3`);
        else if (p.quest.step === 2) { this.showDialog('Thưởng 100EXP, 500 Vàng!'); p.addExp(100); p.money += 500; p.quest.step = 3; }
        else this.showDialog('Làng bình yên rồi.');
        UI.updateQuest();
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
