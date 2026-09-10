/* =========================================================================
   [SYSTEM] COMBAT & AI NÂNG CAO
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { Utils } from '../utils/utils.js';
import { UI } from '../ui/uiManager.js';
import { SoundSystem } from './soundSystem.js';
import { QuestSystem } from './questSystem.js';

export const CombatSystem = {
    handleAttack: function(attacker, target, multiplier = 1, comboStep = 1) {
        if (target.isDead || target.invincibleTimer > 0) return;

        let isCrit = Math.random() < 0.2; 
        let isMiss = Math.random() < 0.05;

        if (isMiss) { Utils.spawnText(target.x + target.width/2, target.y, "MISS", "#9e9e9e"); return; }

        // Combo Tracking & Combo Bonus Damage (+3% damage per hit in combo chain)
        if (attacker.comboCount !== undefined) {
            attacker.comboCount = (attacker.comboCount || 0) + 1;
            attacker.comboTimer = 1800; // 1.8s window to sustain combo
            
            // Combo Floating Text Notification
            if (attacker.comboCount > 1) {
                let comboMsg = `${attacker.comboCount} HITS!`;
                let comboColor = attacker.comboCount >= 10 ? '#e040fb' : (attacker.comboCount >= 5 ? '#ffca28' : '#40c4ff');
                Utils.spawnText(attacker.x + attacker.width/2, attacker.y - 30, comboMsg, comboColor, attacker.comboCount >= 5);
            }
        }

        let comboBonus = 1 + Math.min(0.3, (attacker.comboCount || 0) * 0.03);
        let dmgMultiplier = multiplier * comboBonus;
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
        Utils.spawnParticles(target.x + target.width/2, target.y + target.height/2, '#ff1744', isCrit ? 20 : 10);

        // Hiệu ứng Âm thanh, Màn hình, Hit Stop & Knockback theo Combo Step
        SoundSystem.playHit(isCrit);
        GLOBALS.hitStopTimer = comboStep === 3 ? 90 : (isCrit ? 60 : 40);
        
        let knockX = comboStep === 3 ? 10 : (isCrit ? 8 : 5);
        let knockY = comboStep === 3 ? -6 : -3;
        target.vy = knockY; 
        target.vx = attacker.dir * knockX;

        if (attacker === GLOBALS.player) { 
            if (comboStep === 3 || isCrit) Utils.screenShake(comboStep === 3 ? 10 : 8, 160); 
        } 
        else if (target === GLOBALS.player) { Utils.screenFlash(); Utils.screenShake(4, 120); }

        if (target.hp <= 0) {
            target.hp = 0; target.die();
            if (attacker === GLOBALS.player && (target.grantExp !== undefined || target.isBoss)) {
                attacker.addExp(target.grantExp || 100); 
                attacker.money += (target.grantGold || 50);
                QuestSystem.onKillTarget(attacker, target);
            }
        }
    }
};
