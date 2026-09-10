/* =========================================================================
   [ENTITIES] LỚP BOSS (PRINCE VEGETA BOSS & AI AOE)
   ========================================================================= */
import { Entity } from './entity.js';
import { GLOBALS } from '../config/globals.js';
import { Utils } from '../utils/utils.js';
import { CombatSystem } from '../systems/combatSystem.js';
import { CharacterRenderer } from '../renderers/characterRenderer.js';
import { SoundSystem } from '../systems/soundSystem.js';

export class Boss extends Entity {
    constructor(x, y) {
        super(x, y, 65, 80); // Kích thước khổng lồ 1.6x quái thường
        this.name = 'Trọng Tướng Vegeta (Boss)';
        this.isBoss = true;
        this.level = 10;
        this.maxHp = 850; this.hp = this.maxHp;
        this.baseDamage = 45; this.defense = 18;
        this.grantExp = 400; this.grantGold = 1200;
        this.colors = { body: '#1565c0', skin: '#fcdcb6', hair: '#111111', outfit: '#ffffff', accent: '#ffb300', aura: 'rgba(239, 83, 80, 0.55)' };
        this.originX = x; this.isDead = false;
        this.raceKey = 'sayan';
        
        this.aiState = 'IDLE'; this.stateTimer = 0; this.attackCooldown = 0;
        this.aoeCooldown = 0;
        this.aggroRange = 400; this.attackRange = 60;
        
        this.isChargingAoE = false;
        this.aoeTimer = 0;
    }

    die() {
        this.isDead = true; this.state = 'dead'; this.aiState = 'RESPAWNING'; this.stateTimer = 0;
        Utils.spawnText(this.x + this.width/2, this.y - 20, "BOSS DEFEATED!", "#ffd54f", true);
        Utils.screenShake(12, 350);
        
        // Thưởng ngay rương báu quý giá cho người chơi
        if (GLOBALS.player) {
            let woodChest = GLOBALS.player.inventory.find(i => i.id === 'rare_chest');
            if (woodChest) woodChest.count += 2;
            else GLOBALS.player.inventory.push({ id: 'rare_chest', count: 2 });
            Utils.spawnText(GLOBALS.player.x + 20, GLOBALS.player.y - 40, "+2 Rương Hiếm!", "#ffeb3b", true);
        }
    }

    update(dt) {
        super.update(dt);
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.aoeCooldown > 0) this.aoeCooldown -= dt;

        switch(this.aiState) {
            case 'RESPAWNING':
                this.stateTimer += dt;
                if (this.stateTimer > 15000) { // Respawn sau 15 giây
                    this.hp = this.maxHp; 
                    this.isDead = false; 
                    this.x = this.originX;
                    this.y = GLOBALS.groundY - 80;
                    this.vx = 0; this.vy = 0;
                    this.hurtTimer = 0;
                    this.attackCooldown = 0;
                    this.aoeCooldown = 0;
                    this.aiState = 'IDLE'; 
                    this.state = 'idle';
                }
                break;
                
            case 'IDLE':
                this.vx = 0; this.stateTimer += dt;
                if (this.stateTimer > 2000) { this.aiState = 'PATROL'; this.stateTimer = 0; }
                this.checkAggro();
                break;

            case 'PATROL':
                this.stateTimer += dt;
                if (this.stateTimer === dt) { this.dir = Math.random() > 0.5 ? 1 : -1; } 
                this.vx = this.dir * 1.5;
                if (this.stateTimer > 2000 || Math.abs(this.x - this.originX) > 250) { this.aiState = 'IDLE'; this.stateTimer = 0; }
                this.checkAggro();
                break;

            case 'CHASE':
                if (!GLOBALS.player || GLOBALS.player.isDead) { this.aiState = 'RETURN'; break; }
                
                let dx = Math.abs(this.x - GLOBALS.player.x);
                let dy = Math.abs(this.y - GLOBALS.player.y);
                this.dir = this.x < GLOBALS.player.x ? 1 : -1;

                // Chọn chiêu AoE Nổ Năng Lượng nếu đủ điều kiện
                if (this.aoeCooldown <= 0 && dx < 150 && Math.random() < 0.4) {
                    this.aiState = 'AOE_ATTACK';
                    this.isChargingAoE = true;
                    this.aoeTimer = 1000; // 1s gồng chiêu AoE
                    this.state = 'charge';
                    SoundSystem.playBossRoar();
                    break;
                }
                
                if (dx > this.aggroRange * 1.5) {
                    this.aiState = 'RETURN'; 
                } else if (dx > this.attackRange) {
                    this.vx = this.dir * 2.8; 
                } else if (dy > 60) {
                    this.vx = 0;
                } else { 
                    this.vx = 0; this.aiState = 'ATTACK'; 
                } 
                break;

            case 'AOE_ATTACK':
                this.vx = 0;
                this.aoeTimer -= dt;
                Utils.screenShake(2, 50);
                Utils.spawnParticles(this.x + this.width/2, this.y + this.height/2, '#ef5350', 3);

                if (this.aoeTimer <= 0) {
                    this.isChargingAoE = false;
                    this.state = 'attack';
                    this.aoeCooldown = 8000;
                    
                    // Nổ năng lượng xung quanh bộc phát
                    Utils.screenShake(10, 250);
                    SoundSystem.playKameFire();
                    Utils.spawnParticles(this.x + this.width/2, this.y + this.height/2, '#ef5350', 40);

                    let aoeHitbox = {
                        x: this.x - 120,
                        y: this.y - 40,
                        width: this.width + 240,
                        height: this.height + 80
                    };

                    if (GLOBALS.player && !GLOBALS.player.isDead && Utils.checkAABB(aoeHitbox, GLOBALS.player)) {
                        CombatSystem.handleAttack(this, GLOBALS.player, 2.0); // Sát thương AoE x2.0
                    }

                    this.aiState = 'CHASE';
                }
                break;

            case 'ATTACK':
                if (this.attackCooldown <= 0 && GLOBALS.player && !GLOBALS.player.isDead) {
                    this.state = 'attack'; this.animFrame = 0; this.attackCooldown = 1400;
                    
                    let hitbox = {
                        x: this.dir === 1 ? this.x + this.width : this.x - 45,
                        y: this.y + 5,
                        width: 45,
                        height: this.height - 10
                    };
                    
                    if (Utils.checkAABB(hitbox, GLOBALS.player)) {
                        CombatSystem.handleAttack(this, GLOBALS.player, 1.3);
                    }
                }
                if (this.state !== 'attack') this.aiState = 'CHASE'; 
                break;

            case 'RETURN':
                let returnDist = Math.abs(this.x - this.originX);
                if (returnDist < 10) { this.vx = 0; this.aiState = 'IDLE'; }
                else { this.dir = this.x > this.originX ? -1 : 1; this.vx = this.dir * 2.5; }
                this.checkAggro(); 
                break;
        }

        if (this.aiState === 'IDLE' || (this.aiState === 'RETURN' && this.vx === 0)) this.state = 'idle';
        else if (this.aiState === 'PATROL' || this.aiState === 'CHASE' || this.aiState === 'RETURN') this.state = 'run';
    }

    checkAggro() {
        if (!GLOBALS.player || GLOBALS.player.isDead) return;
        if (Math.abs(this.x - GLOBALS.player.x) < this.aggroRange && Math.abs(this.y - GLOBALS.player.y) < 150) this.aiState = 'CHASE';
    }

    draw(ctx) {
        CharacterRenderer.draw(ctx, this);
    }
}
