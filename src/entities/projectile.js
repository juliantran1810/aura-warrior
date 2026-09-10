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
        this.dir = dir;
        this.owner = owner;
        this.isSuper = owner.isTransformed || owner.powerUpActive;
        
        this.height = this.isSuper ? 56 : 42;
        this.maxLen = this.isSuper ? 650 : 500;
        this.len = 80;
        
        this.x = dir === 1 ? x : x - this.len;
        this.y = y - this.height / 2;
        this.width = this.len;
        
        this.vx = dir * 18;
        this.damage = damage * (this.isSuper ? 1.5 : 1.0);
        this.life = 1000;
        this.color = this.isSuper ? '#ffd54f' : '#00e5ff';
        this.hitCoolMap = new Map();
    }

    update(dt) {
        this.life -= dt;
        if (this.len < this.maxLen) {
            this.len += 50;
        }
        
        this.x += this.vx;
        this.width = this.len;
        
        let headX = this.dir === 1 ? this.x + this.width : this.x;
        let midY = this.y + this.height / 2;
        Utils.spawnParticles(headX, midY + Utils.rand(-15, 15), this.color, 3);
        Utils.spawnParticles(this.x + Utils.rand(0, this.width), midY + Utils.rand(-10, 10), '#ffffff', 2);
        
        // Multi-hit damage tick registration
        GLOBALS.entities.forEach(ent => {
            if (ent !== this.owner && ent.hp !== undefined && !ent.isDead && !(ent instanceof NPC)) {
                let lastHitTime = this.hitCoolMap.get(ent) || 0;
                if (Date.now() - lastHitTime > 160 && Utils.checkAABB(this, ent)) {
                    this.hitCoolMap.set(ent, Date.now());
                    CombatSystem.handleAttack(this.owner, ent, this.isSuper ? 2.8 : 2.0); 
                    Utils.spawnImpactBurst(ent.x + ent.width/2, ent.y + ent.height/2, this.color);
                    Utils.screenShake(this.isSuper ? 8 : 5, 120);
                }
            }
        });
    }

    draw(ctx) {
        ctx.save();
        let midY = this.y + this.height / 2;
        let alpha = Math.min(1, this.life / 200);
        ctx.globalAlpha = alpha;
        
        let headX = this.dir === 1 ? this.x + this.width : this.x;

        // 1. Lớp Hào Quang Năng Lượng Ngoại Vi (Outer Beam Aura Glow)
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 24;
        ctx.beginPath();
        Utils.drawRoundRect(ctx, this.x, this.y, this.width, this.height, 20);
        ctx.fill();

        // 2. Lớp Dòng Plasma Trung Tâm (Middle Plasma Energy Wave)
        ctx.fillStyle = this.isSuper ? '#ff9800' : '#0091ea';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        Utils.drawRoundRect(ctx, this.x + 2, this.y + 6, this.width - 4, this.height - 12, 12);
        ctx.fill();

        // 3. Lớp Lõi Laser Trắng Chói (Inner Pure White Laser Core)
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        Utils.drawRoundRect(ctx, this.x + 4, this.y + 12, this.width - 8, this.height - 24, 8);
        ctx.fill();

        // 4. Đầu Cầu Năng Lượng Xoáy (Swirling Beam Head Sphere)
        let orbRadius = this.height * 0.65;
        let time = Date.now();
        let pulse = Math.sin(time / 50) * 4;
        
        ctx.beginPath();
        ctx.arc(headX, midY, orbRadius + pulse, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(headX, midY, (orbRadius + pulse) * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // 5. Dải Băng Xoắn Vòng Cung Plasma (Swirling Helical Ribbon)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let stepCount = 12;
        for (let i = 0; i <= stepCount; i++) {
            let px = this.x + (i / stepCount) * this.width;
            let py = midY + Math.sin(i * 0.8 + time / 80) * (this.height / 2.5);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.restore();
    }
}
