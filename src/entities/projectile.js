/* =========================================================================
   [ENTITIES] PROJECTILE & KAMEBEAM
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { Utils } from '../utils/utils.js';
import { CombatSystem } from '../systems/combatSystem.js';
import { NPC } from './npc.js';

export class Projectile {
    constructor(x, y, dir, owner, damage) {
        this.x = x; this.y = y; this.width = 16; this.height = 8;
        this.vx = dir * 12; this.dir = dir; this.owner = owner; this.damage = damage; this.life = 800;
        this.color = owner.colors.proj || '#ffeb3b';
    }
    update(dt) {
        this.x += this.vx; this.life -= dt;
        if (Math.random() > 0.4) Utils.spawnParticles(this.x, this.y + 4, this.color, 1);
        
        GLOBALS.entities.forEach(ent => {
            if (ent !== this.owner && ent.hp !== undefined && !ent.isDead && !(ent instanceof NPC)) {
                if (Utils.checkAABB(this, ent)) {
                    CombatSystem.handleAttack(this.owner, ent, 1.2); 
                    Utils.spawnParticles(this.x, this.y, this.color, 15);
                    this.life = 0;
                }
            }
        });
    }
    draw(ctx) {
        ctx.fillStyle = this.color; ctx.beginPath(); Utils.drawRoundRect(ctx, this.x, this.y, this.width, this.height, 4); ctx.fill();
        ctx.shadowBlur = 10; ctx.shadowColor = this.color; ctx.fill(); ctx.shadowBlur = 0;
    }
}

export class KameBeam {
    constructor(x, y, dir, owner, damage) {
        this.x = x; this.y = y;
        this.width = 80; this.height = 22;
        this.vx = dir * 16; this.dir = dir;
        this.owner = owner; this.damage = damage;
        this.life = 900;
        this.color = '#00bcd4';
        this.hitTargets = new Set();
        this.maxTargets = 3; // Giới hạn xuyên mục tiêu
    }
    update(dt) {
        this.x += this.vx; this.life -= dt;
        Utils.spawnParticles(this.x + (this.dir === 1 ? 0 : this.width), this.y + this.height/2, this.color, 2);
        
        // Phá hủy tia nếu đạt giới hạn mục tiêu
        if (this.hitTargets.size >= this.maxTargets) {
            this.life = 0;
            return;
        }

        GLOBALS.entities.forEach(ent => {
            if (ent !== this.owner && ent.hp !== undefined && !ent.isDead && !(ent instanceof NPC)) {
                if (!this.hitTargets.has(ent) && Utils.checkAABB(this, ent)) {
                    this.hitTargets.add(ent);
                    CombatSystem.handleAttack(this.owner, ent, 3.0); 
                    Utils.spawnParticles(ent.x + ent.width/2, ent.y + ent.height/2, this.color, 20);
                    Utils.screenShake(4, 100);
                }
            }
        });
    }
    draw(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); Utils.drawRoundRect(ctx, this.x, this.y, this.width, this.height, 10); ctx.fill();
        ctx.shadowBlur = 20; ctx.shadowColor = this.color; ctx.fill(); ctx.shadowBlur = 0;
        
        ctx.fillStyle = this.color;
        ctx.beginPath(); Utils.drawRoundRect(ctx, this.x + 5, this.y + 4, this.width - 10, this.height - 8, 5); ctx.fill();
    }
}
