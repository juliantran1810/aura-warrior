/* =========================================================================
   [SYSTEM] COMBAT & AI NÂNG CAO
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { Utils } from '../utils/utils.js';
import { UI } from '../ui/uiManager.js';
import { SoundSystem } from './soundSystem.js';

export const CombatSystem = {
    handleAttack: function(attacker, target, multiplier = 1) {
        if (target.isDead || target.invincibleTimer > 0) return;

        let isCrit = Math.random() < 0.2; 
        let isMiss = Math.random() < 0.05;

        if (isMiss) { Utils.spawnText(target.x + target.width/2, target.y, "MISS", "#9e9e9e"); return; }

        let dmgMultiplier = multiplier;
        if (attacker.powerUpActive) dmgMultiplier *= 1.3; 

        let rawDamage = attacker.baseDamage * dmgMultiplier + Math.floor(Math.random() * 5);
        if (isCrit) rawDamage = Math.floor(rawDamage * 1.5); 

        let def = target.defense || 0;
        if (target.powerUpActive) def = Math.floor(def * 1.2); 

        let finalDamage = Math.max(1, rawDamage - def);
        if (target.skillActive && target.raceKey === 'namek') finalDamage = Math.max(1, finalDamage - 20);

        target.hp -= finalDamage;
        target.hurtTimer = 200; 
        
        if (target === GLOBALS.player) target.invincibleTimer = 500; // I-Frame sau khi bị hit
        
        Utils.spawnText(target.x + target.width/2, target.y, isCrit ? `${Math.floor(finalDamage)}!` : `-${Math.floor(finalDamage)}`, isCrit ? '#ffea00' : '#ff5252', isCrit);
        Utils.spawnParticles(target.x + target.width/2, target.y + target.height/2, '#ff1744', isCrit ? 15 : 8);

        // Hiệu ứng Âm thanh, Màn hình & Hit Stop
        SoundSystem.playHit(isCrit);
        GLOBALS.hitStopTimer = isCrit ? 60 : 40;
        target.vy = -3; target.vx = attacker.dir * (isCrit ? 8 : 5);

        if (attacker === GLOBALS.player) { if (isCrit) Utils.screenShake(8, 150); } 
        else if (target === GLOBALS.player) { Utils.screenFlash(); Utils.screenShake(4, 120); }

        if (target.hp <= 0) {
            target.hp = 0; target.die();
            if (target.name && target.name.includes("Quái Cấp") && attacker === GLOBALS.player) {
                attacker.addExp(target.grantExp); attacker.money += target.grantGold;
                if (attacker.quest.step === 1) {
                    attacker.quest.progress++;
                    if (attacker.quest.progress >= attacker.quest.target) {
                        attacker.quest.step = 2; UI.showCenterMessage('Nhiệm vụ hoàn thành! Về báo cáo.');
                    }
                    UI.updateQuest();
                }
            }
        }
    }
};
