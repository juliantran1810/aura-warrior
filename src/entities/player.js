/* =========================================================================
   [ENTITIES] LỚP PLAYER
   ========================================================================= */
import { Entity } from './entity.js';
import { GLOBALS } from '../config/globals.js';
import { CONFIG, ITEMS_DB, RARITY_COLORS } from '../config/config.js';
import { Utils } from '../utils/utils.js';
import { CombatSystem } from '../systems/combatSystem.js';
import { CharacterRenderer } from '../renderers/characterRenderer.js';
import { UI } from '../ui/uiManager.js';
import { SoundSystem } from '../systems/soundSystem.js';
import { Projectile, KameBeam } from './projectile.js';
import { NPC } from './npc.js';

export class Player extends Entity {
    constructor(x, y, name, raceKey) {
        super(x, y, 40, 50);
        this.name = name; this.raceKey = raceKey;
        this.raceConfig = CONFIG.races[raceKey];
        
        this.maxHp = this.raceConfig.maxHp; this.hp = this.maxHp;
        this.maxMp = this.raceConfig.maxMp; this.mp = this.maxMp;
        this.speed = this.raceConfig.speed; this.jumpForce = this.raceConfig.jumpForce;
        this.baseDamage = this.raceConfig.baseDamage; this.maxExp = this.raceConfig.maxExp;
        this.defense = this.raceConfig.defense;
        this.colors = this.raceConfig.colors;
        
        this.level = 1; this.exp = 0; this.money = 0; this.isDead = false;
        this.quest = { step: 0, progress: 0, target: 3 };

        // Mặc định Inventory Test Full Item UI
        this.inventory = [
            { id: 'hp_potion_small', count: 5 },
            { id: 'mp_potion_small', count: 3 },
            { id: 'revive_bean', count: 2 },
            { id: 'power_stone', count: 1 },
            { id: 'teleport_ticket', count: 1 },
            { id: 'wood_chest', count: 1 }
        ];
        
        this.cooldowns = { attack: 0, shoot: 0, skill: 0, kame: 0, powerUp: 0, transform: 0 };
        this.skillActive = false; this.skillTimer = 0;
        
        this.isChargingKame = false; this.kameTimer = 0;
        this.isChargingPower = false; this.powerUpActive = false; this.powerUpTimer = 0;
        
        this.isTransformed = false; this.transformTimer = 0;
        this.equipment = { weapon: null, armor: null, gloves: null, boots: null, ring: null };
        
        this.jumpCount = 0; this.maxJumpCount = 2;

        // Combat Flags
        this.attackHitboxActive = false;
        this.shootFired = false;
    }

    addExp(amt) {
        this.exp += amt; UI.chatSys(`Nhận ${amt} EXP`);
        if (this.exp >= this.maxExp) { this.levelUp(); }
        UI.updateHUD();
    }

    levelUp() {
        this.level++; this.exp -= this.maxExp;
        this.maxExp = Math.floor(this.maxExp * this.raceConfig.levelGrowth.expFactor);
        this.maxHp += this.raceConfig.levelGrowth.hp; this.maxMp += this.raceConfig.levelGrowth.mp;
        this.baseDamage += this.raceConfig.levelGrowth.damage;
        this.defense += this.raceConfig.levelGrowth.defense;
        this.hp = this.maxHp; this.mp = this.maxMp;
        
        if (this === GLOBALS.player) {
            UI.showCenterMessage(`LÊN CẤP ${this.level}!`);
            SoundSystem.playLevelUp();
        } 
        Utils.spawnParticles(this.x+20, this.y+50, '#ffeb3b', 40);
    }

    die() {
        this.isDead = true; this.state = 'dead'; this.vx = 0;
        if (this === GLOBALS.player) {
            let respawnEl = document.getElementById('respawnScreen');
            if (respawnEl) respawnEl.style.display = 'flex';
        }
    }

    takeDamage(dmg) {
        if (!this.isDead) CombatSystem.handleAttack(this, this, dmg);
    }

    update(dt) {
        // Input Buffer Processing (Combo 300ms window)
        if (this === GLOBALS.player && GLOBALS.inputBuffer && GLOBALS.inputBuffer.time > 0 && !this.isDead) {
            GLOBALS.inputBuffer.time -= dt;
            let executed = false;
            let code = GLOBALS.inputBuffer.code;
            if (!this.isChargingKame && !this.isChargingPower) {
                if (code === 'KeyZ') executed = this.actionTransform();
                else if (code === 'KeyO') executed = this.actionPowerUp();
                else if (code === 'KeyL') executed = this.actionKame();
                else if (code === 'KeyQ') executed = this.actionSkill();
                else if (code === 'KeyK') executed = this.actionShoot();
                else if (code === 'KeyJ') executed = this.actionAttack();
            }
            if (executed) GLOBALS.inputBuffer = { code: null, time: 0 };
        }

        if (this.isDead) return super.update(dt);

        if (this.isChargingKame) {
            this.vx = 0; this.kameTimer -= dt;
            if (this.kameTimer <= 0) {
                this.isChargingKame = false; this.state = 'shoot';
                GLOBALS.projectiles.push(new KameBeam(this.dir === 1 ? this.x + this.width : this.x - 80, this.y + 15, this.dir, this, this.baseDamage * (this.powerUpActive ? 1.3 : 1)));
                Utils.screenShake(8, 200);
                if (this === GLOBALS.player) SoundSystem.playKameFire();
            }
        }
        
        if (this.isChargingPower) {
            this.vx = 0; this.powerUpTimer -= dt;
            Utils.screenShake(2, 50);
            if (this.powerUpTimer <= 0) {
                this.isChargingPower = false; this.powerUpActive = true; this.powerUpTimer = 8000;
                this.state = 'idle'; UI.showCenterMessage('SỨC MẠNH TĂNG ĐỘT BIẾN!');
                Utils.spawnParticles(this.x + 20, this.y + 25, this.colors.aura, 50);
            }
        } else if (this.powerUpActive) {
            this.powerUpTimer -= dt;
            this.mp = Math.min(this.maxMp, this.mp + 0.05); // Bonus Regen
            if (this.powerUpTimer <= 0) {
                this.powerUpActive = false; UI.chatSys('Hết trạng thái Gồng.');
            }
        }
        
        super.update(dt);
        if (this.isGrounded) this.jumpCount = 0;

        for (let k in this.cooldowns) if (this.cooldowns[k] > 0) this.cooldowns[k] -= dt;
        
        if (this.skillTimer > 0) {
            this.skillTimer -= dt;
            if (this.skillTimer <= 0 && this.skillActive) {
                this.skillActive = false;
                if (this.raceKey === 'sayan') this.baseDamage -= 20;
                else if (this.raceKey === 'earth') this.speed -= 3;
                if (this === GLOBALS.player) UI.chatSys('Hết thời gian kỹ năng.');
            }
        }

        if (this.transformTimer > 0) {
            this.transformTimer -= dt;
            if (this.transformTimer <= 0 && this.isTransformed) {
                this.isTransformed = false;
                if (this.raceKey === 'sayan') { this.baseDamage -= 25; this.speed -= 2.5; }
                else if (this.raceKey === 'namek') { this.defense -= 40; this.width = 40; this.height = 50; }
                else if (this.raceKey === 'earth') { this.speed -= 4.5; this.baseDamage -= 15; }
                if (this === GLOBALS.player) UI.chatSys('Hết thời gian Biến hình.');
            }
        }

        // Sync Animation with Hitboxes
        if (this.state === 'attack' && this.animFrame === 1 && !this.attackHitboxActive) {
            this.attackHitboxActive = true;
            let hitbox = { x: this.dir===1 ? this.x+this.width : this.x-30, y: this.y, width: 30, height: this.height };
            GLOBALS.entities.forEach(ent => {
                if (ent !== this && !ent.isDead && ent.hp !== undefined && !(ent instanceof NPC)) {
                    if (Utils.checkAABB(hitbox, ent)) CombatSystem.handleAttack(this, ent, 1);
                }
            });
        }

        if (this.state === 'shoot' && this.animFrame === 1 && !this.shootFired) {
            this.shootFired = true;
            GLOBALS.projectiles.push(new Projectile(this.dir===1 ? this.x+this.width : this.x-20, this.y+15, this.dir, this, this.baseDamage * 1.2));
            if (this === GLOBALS.player) UI.updateHUD();
        }
        
        if (this.state !== 'attack' && this.state !== 'shoot' && !this.isChargingKame && !this.isChargingPower) {
            if (!this.isGrounded) this.state = 'jump';
            else if (Math.abs(this.vx) > 0.5) this.state = 'run';
            else this.state = 'idle';
        }
    }

    actionAttack() {
        if (this.cooldowns.attack > 0 || this.isDead || this.isChargingKame || this.isChargingPower) return false;
        this.state = 'attack'; 
        this.animFrame = 0; 
        this.animTimer = 0;
        this.cooldowns.attack = 350; // combo friendly
        this.attackHitboxActive = false; // reset flag
        if (this.isGrounded) this.vx = this.dir * 1.5; // slight step forward for better combat feel
        if (this === GLOBALS.player) SoundSystem.playAttack();
        return true;
    }

    actionShoot() {
        if (this.cooldowns.shoot > 0 || this.mp < 10 || this.isDead || this.isChargingKame || this.isChargingPower) return false;
        this.mp -= 10;
        this.state = 'shoot'; 
        this.animFrame = 0; 
        this.animTimer = 0;
        this.cooldowns.shoot = 800;
        this.shootFired = false;
        if (this === GLOBALS.player) {
            UI.updateHUD();
            SoundSystem.playShoot();
        }
        return true;
    }

    actionSkill() {
        if (this.cooldowns.skill > 0 || this.skillActive || this.isDead || this.isChargingKame || this.isChargingPower || this.hurtTimer > 0) return false;
        this.cooldowns.skill = this.raceConfig.skill.cd;
        this.skillTimer = this.raceConfig.skill.duration; 
        this.skillActive = true;
        this.animTimer = 0;
        
        if (this.raceKey === 'sayan') {
            this.baseDamage += 20; Utils.spawnParticles(this.x+20, this.y+25, '#ff9800', 50); UI.chatSys('Thịnh nộ Sayan kích hoạt!');
        } else if (this.raceKey === 'namek') {
            this.hp = Math.min(this.maxHp, this.hp + 80); Utils.spawnParticles(this.x+20, this.y+25, '#4caf50', 30); UI.chatSys('Namek hồi máu và tạo Khiên!');
        } else if (this.raceKey === 'earth') {
            this.speed += 3; Utils.spawnParticles(this.x+20, this.y+25, '#2196f3', 20); UI.chatSys('Trái Đất bức tốc!');
        }
        if (this === GLOBALS.player) SoundSystem.playSkill();
        return true;
    }

    actionKame() {
        if (this.cooldowns.kame > 0) { UI.chatSys('Kame Wave đang hồi.'); return false; }
        if (this.mp < 40) { UI.chatSys('Không đủ MP.'); return false; }
        if (this.isDead || this.isChargingKame || this.isChargingPower || this.hurtTimer > 0) return false;
        
        this.mp -= 40;
        this.isChargingKame = true; 
        this.state = 'charge';
        this.animTimer = 0;
        this.kameTimer = 800; 
        this.cooldowns.kame = 6000;
        Utils.spawnParticles(this.x + 20, this.y + 25, '#00bcd4', 30);
        if (this === GLOBALS.player) SoundSystem.playKameCharge();
        return true;
    }

    actionPowerUp() {
        if (this.cooldowns.powerUp > 0) { UI.chatSys('Power Up đang hồi.'); return false; }
        if (this.mp < 25) { UI.chatSys('Không đủ MP.'); return false; }
        if (this.isDead || this.isChargingKame || this.isChargingPower || this.hurtTimer > 0) return false;

        this.mp -= 25;
        this.isChargingPower = true; 
        this.state = 'powerup';
        this.animTimer = 0;
        this.powerUpTimer = 1500; 
        this.cooldowns.powerUp = 12000;
        Utils.spawnParticles(this.x + 20, this.y + 25, '#9c27b0', 30);
        if (this === GLOBALS.player) SoundSystem.playPowerUp();
        return true;
    }

    actionTransform() {
        if (this.cooldowns.transform > 0) { UI.chatSys('Kỹ năng Biến hình đang hồi.'); return false; }
        if (this.mp < 30) { UI.chatSys('Không đủ MP để biến hình.'); return false; }
        if (this.isDead || this.isChargingKame || this.isChargingPower || this.hurtTimer > 0) return false;

        this.mp -= 30;
        this.isTransformed = true;
        this.transformTimer = 14000;
        this.cooldowns.transform = 20000;

        if (this.raceKey === 'sayan') {
            this.baseDamage += 25; this.speed += 2.5;
            if (this === GLOBALS.player) UI.showCenterMessage('SUPER SAIYAN 1 BỘC PHÁ!');
            Utils.spawnParticles(this.x + 20, this.y + 25, '#ffeb3b', 60);
        } else if (this.raceKey === 'namek') {
            this.defense += 40; this.width = 56; this.height = 70;
            if (this === GLOBALS.player) UI.showCenterMessage('NAMEK KHỔNG LỒ THỨC TỈNH!');
            Utils.spawnParticles(this.x + 20, this.y + 25, '#4caf50', 50);
        } else if (this.raceKey === 'earth') {
            this.speed += 4.5; this.baseDamage += 15;
            if (this === GLOBALS.player) UI.showCenterMessage('KAIO-KEN X10 BỘC PHÁ!');
            Utils.spawnParticles(this.x + 20, this.y + 25, '#ff1744', 50);
        }

        if (this === GLOBALS.player) SoundSystem.playTransform();
        return true;
    }

    useItem(itemId) {
        let itemObj = this.inventory.find(i => i.id === itemId);
        if (itemObj && itemObj.count > 0 && !this.isDead) {
            let dbItem = ITEMS_DB[itemId];
            if (!dbItem) return;

            let isUsed = false;

            if (itemId.includes('hp_potion')) {
                this.hp = Math.min(this.maxHp, this.hp + dbItem.heal);
                Utils.spawnText(this.x + this.width / 2, this.y - 10, `+${dbItem.heal} HP`, '#4caf50');
                isUsed = true;
            } else if (itemId.includes('mp_potion')) {
                this.mp = Math.min(this.maxMp, this.mp + dbItem.mp);
                Utils.spawnText(this.x + this.width / 2, this.y - 10, `+${dbItem.mp} MP`, '#2196f3');
                isUsed = true;
            } else if (itemId === 'revive_bean') {
                this.hp = this.maxHp;
                this.mp = this.maxMp;
                Utils.spawnText(this.x + this.width / 2, this.y - 20, `FULL RESTORE`, '#ffd54f');
                isUsed = true;
            } else if (itemId === 'power_stone') {
                this.baseDamage += 2;
                Utils.spawnText(this.x + this.width / 2, this.y - 20, `+2 DMG`, '#ff9800');
                isUsed = true;
            } else if (dbItem.type === 'Nguyên liệu' || dbItem.type === 'Rương') {
                if (itemId === 'wood_chest' || itemId === 'rare_chest') {
                    this.baseDamage += itemId === 'rare_chest' ? 5 : 2;
                    this.defense += itemId === 'rare_chest' ? 3 : 1;
                    Utils.spawnText(this.x + this.width / 2, this.y - 20, itemId === 'rare_chest' ? `+5 DMG, +3 DEF` : `+2 DMG, +1 DEF`, '#ffd54f', true);
                    isUsed = true;
                } else {
                    UI.chatSys(`${dbItem.name} hiện tại chưa thể sử dụng.`);
                }
            } else {
                UI.chatSys(`${dbItem.name} hiện tại chưa thể sử dụng.`);
            }

            if (isUsed) {
                itemObj.count--;
                Utils.spawnParticles(this.x + this.width / 2, this.y + this.height, RARITY_COLORS[dbItem.rarity] || '#fff', 15);
                UI.updateInventoryUI(); 
                UI.updateHUD();
                if (this === GLOBALS.player) SoundSystem.playItem();
            }
        }
    }

    equipItem(slotKey, itemId) {
        if (!this.equipment) this.equipment = {};
        this.equipment[slotKey] = itemId;
        UI.updateEquipmentUI();
        UI.updateHUD();
        if (this === GLOBALS.player) SoundSystem.playItem();
    }

    unequipSlot(slotKey) {
        if (!this.equipment) return;
        this.equipment[slotKey] = null;
        UI.updateEquipmentUI();
        UI.updateHUD();
        if (this === GLOBALS.player) SoundSystem.playItem();
    }

    draw(ctx) { CharacterRenderer.draw(ctx, this); }
}
