/* =========================================================================
   [ENTITIES] LỚP MONSTER (AI FSM)
   ========================================================================= */
import { Entity } from './entity.js';
import { GLOBALS } from '../config/globals.js';
import { Utils } from '../utils/utils.js';
import { CombatSystem } from '../systems/combatSystem.js';
import { CharacterRenderer } from '../renderers/characterRenderer.js';
import { UI } from '../ui/uiManager.js';

export class Monster extends Entity {
    constructor(x, y, level) {
        super(x, y, 40, 50);
        this.name = `Quái Cấp ${level}`; this.level = level;
        this.maxHp = 80 * level; this.hp = this.maxHp; this.baseDamage = 15 * level;
        this.defense = 2 * level; 
        this.grantExp = 25 * level; this.grantGold = 15 * level;
        this.colors = { body: '#7b1fa2', skin: '#ab47bc', hair: '#fff' };
        this.originX = x; this.isDead = false;
        
        this.aiState = 'IDLE'; this.stateTimer = 0; this.attackCooldown = 0;
        this.aggroRange = 250; this.attackRange = 45;
    }

    die() { this.isDead = true; this.state = 'dead'; this.aiState = 'RESPAWNING'; this.stateTimer = 0; }
    takeDamage(dmg) { /* Bị gọi qua CombatSystem rồi */ }

    update(dt) {
        super.update(dt);
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        switch(this.aiState) {
            case 'RESPAWNING':
                this.stateTimer += dt;
                if (this.stateTimer > 8000) { 
                    this.hp = this.maxHp; 
                    this.isDead = false; 
                    this.x = this.originX;
                    this.y = GLOBALS.groundY - 50;
                    this.vx = 0; this.vy = 0;
                    this.hurtTimer = 0;
                    this.attackCooldown = 0;
                    this.dir = 1;
                    this.animFrame = 0;
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
                if (this.stateTimer > 2000 || Math.abs(this.x - this.originX) > 300) { this.aiState = 'IDLE'; this.stateTimer = 0; }
                this.checkAggro();
                break;

            case 'CHASE':
                if (!GLOBALS.player || GLOBALS.player.isDead) { this.aiState = 'RETURN'; break; }
                
                let dx = Math.abs(this.x - GLOBALS.player.x);
                let dy = Math.abs(this.y - GLOBALS.player.y);
                this.dir = this.x < GLOBALS.player.x ? 1 : -1;
                
                if (dx > this.aggroRange * 1.5) {
                    this.aiState = 'RETURN'; 
                } else if (dx > this.attackRange) {
                    this.vx = this.dir * 2.5; 
                } else if (dy > 40) {
                    this.vx = 0; // Player is too high, wait below
                } else { 
                    this.vx = 0; this.aiState = 'ATTACK'; 
                } 
                break;

            case 'ATTACK':
                if (this.attackCooldown <= 0 && GLOBALS.player && !GLOBALS.player.isDead) {
                    this.state = 'attack'; this.animFrame = 0; this.attackCooldown = 1500;
                    
                    let hitbox = {
                        x: this.dir === 1 ? this.x + this.width : this.x - 35,
                        y: this.y + 5,
                        width: 35,
                        height: this.height - 10
                    };
                    
                    if (Utils.checkAABB(hitbox, GLOBALS.player)) {
                        CombatSystem.handleAttack(this, GLOBALS.player, 1);
                        UI.updateHUD();
                    }
                }
                if (this.state !== 'attack') this.aiState = 'CHASE'; 
                break;

            case 'RETURN':
                let returnDist = Math.abs(this.x - this.originX);
                if (returnDist < 10) { this.vx = 0; this.aiState = 'IDLE'; }
                else { this.dir = this.x > this.originX ? -1 : 1; this.vx = this.dir * 2; }
                this.checkAggro(); 
                break;
        }

        if (this.aiState === 'IDLE' || (this.aiState === 'RETURN' && this.vx === 0)) this.state = 'idle';
        else if (this.aiState === 'PATROL' || this.aiState === 'CHASE' || this.aiState === 'RETURN') this.state = 'run';
    }

    checkAggro() {
        if (!GLOBALS.player || GLOBALS.player.isDead) return;
        if (Math.abs(this.x - GLOBALS.player.x) < this.aggroRange && Math.abs(this.y - GLOBALS.player.y) < 100) this.aiState = 'CHASE';
    }

    draw(ctx) { CharacterRenderer.draw(ctx, this); }
}
