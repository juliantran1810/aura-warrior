/* =========================================================================
   [SYSTEM] UI & SỰ KIỆN GIAO DIỆN
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { ITEMS_DB, RARITY_COLORS } from '../config/config.js';

export const UI = {
    updateHUD: function() {
        let p = GLOBALS.player; if (!p) return;
        let hudName = document.getElementById('hudName');
        let hudLevel = document.getElementById('hudLevel');
        let hudHpText = document.getElementById('hudHpText');
        let hpBar = document.getElementById('hpBar');
        let hudMpText = document.getElementById('hudMpText');
        let mpBar = document.getElementById('mpBar');
        let expBar = document.getElementById('expBar');
        let hudMoney = document.getElementById('hudMoney');
        let hudAvatar = document.getElementById('hudAvatar');
        let hudTransformBadge = document.getElementById('hudTransformBadge');

        if (hudName) hudName.innerText = p.name;
        if (hudLevel) hudLevel.innerText = p.level;
        if (hudHpText) hudHpText.innerText = `${Math.floor(p.hp)}/${p.maxHp}`;
        if (hpBar) hpBar.style.width = `${Math.max(0, p.hp/p.maxHp*100)}%`;
        if (hudMpText) hudMpText.innerText = `${Math.floor(p.mp)}/${p.maxMp}`;
        if (mpBar) mpBar.style.width = `${Math.max(0, p.mp/p.maxMp*100)}%`;
        if (expBar) expBar.style.width = `${(p.exp/p.maxExp)*100}%`;
        if (hudMoney) hudMoney.innerText = p.money;

        // Avatar icon
        if (hudAvatar) {
            if (p.race === 'sayan') hudAvatar.innerText = p.isTransformed ? '⚡' : '🔥';
            else if (p.race === 'namek') hudAvatar.innerText = p.isTransformed ? '🐉' : '🌿';
            else hudAvatar.innerText = p.isTransformed ? '🔴' : '⚡';
        }

        // Status badge
        if (hudTransformBadge) {
            if (p.isTransformed) {
                hudTransformBadge.style.display = 'inline-block';
                if (p.race === 'sayan') hudTransformBadge.innerText = '🔥 SUPER SAIYAN 1';
                else if (p.race === 'namek') hudTransformBadge.innerText = '💪 GREAT NAMEK';
                else hudTransformBadge.innerText = '⚡ KAIO-KEN x10';
            } else {
                hudTransformBadge.style.display = 'none';
            }
        }
    },

    updateQuest: function() {
        let p = GLOBALS.player; if (!p) return;
        let q = p.quest; let txt = document.getElementById('questText');
        if (!txt) return;
        if (q.step === 0) txt.innerText = 'Nói chuyện Trưởng Làng';
        else if (q.step === 1) txt.innerText = `Diệt Quái: ${q.progress}/${q.target}`;
        else if (q.step === 2) txt.innerText = 'Về báo cáo';
        else txt.innerText = 'Đã xong nhiệm vụ';
    },

    chatSys: function(msg) {
        let box = document.getElementById('chatMessages'); if (!box) return;
        let el = document.createElement('div'); el.className = 'msg-sys'; el.innerText = `[HT] ${msg}`;
        box.appendChild(el); box.scrollTop = box.scrollHeight;
    },

    showCenterMessage: function(msg) {
        let el = document.getElementById('systemMessage'); if (!el) return;
        el.innerText = msg; el.style.opacity = 1;
        setTimeout(() => el.style.opacity = 0, 2000);
    },

    updateInventoryUI: function() {
        let grid = document.getElementById('invGrid'); if (!grid || !GLOBALS.player) return;
        grid.innerHTML = '';
        GLOBALS.player.inventory.forEach(item => {
            if (item.count > 0) {
                let dbItem = ITEMS_DB[item.id];
                if (!dbItem) return;

                let slot = document.createElement('div'); 
                slot.className = 'item-slot'; 
                // Border màu theo độ hiếm
                slot.style.border = `2px solid ${RARITY_COLORS[dbItem.rarity] || '#555'}`;
                slot.onclick = () => GLOBALS.player.useItem(item.id);
                
                // Icon Emoji Mini Canvas
                let icon = document.createElement('div'); 
                icon.className = 'item-icon-emoji'; 
                icon.innerText = dbItem.icon;
                slot.appendChild(icon);

                // Số lượng
                let cnt = document.createElement('div'); 
                cnt.className = 'item-count'; 
                cnt.innerText = item.count; 
                slot.appendChild(cnt);
                
                // Tooltip MMORPG Style
                let tt = document.createElement('span'); 
                tt.className = 'tooltip'; 
                tt.innerHTML = `
                    <strong style="color:${RARITY_COLORS[dbItem.rarity] || '#fff'}; font-size:14px; text-transform: uppercase;">${dbItem.name}</strong><br>
                    <span style="font-size:10px; color:#aaa; font-style:italic;">[${dbItem.type}]</span><br>
                    <div style="margin-top:6px; color:#e0e0e0;">${dbItem.desc}</div>
                `;
                slot.appendChild(tt);
                
                grid.appendChild(slot);
            }
        });
        
        // Cố định tạo lưới 16 slot (4x4)
        for (let i = GLOBALS.player.inventory.length; i < 16; i++) { 
            let slot = document.createElement('div'); 
            slot.className = 'item-slot'; 
            grid.appendChild(slot); 
        }
    },

    toggleInventory: function() {
        let inv = document.getElementById('inventory'); if (!inv) return;
        if (inv.style.display === 'block') inv.style.display = 'none';
        else {
            inv.style.display = 'block'; 
            this.updateInventoryUI();
        }
    },

    toggleEquipment: function() {
        let eq = document.getElementById('equipment'); if (!eq) return;
        if (eq.style.display === 'block') eq.style.display = 'none';
        else {
            eq.style.display = 'block';
            this.updateEquipmentUI();
        }
    },

    updateEquipmentUI: function() {
        let grid = document.getElementById('equipGrid');
        let summary = document.getElementById('equipStatsSummary');
        let p = GLOBALS.player;
        if (!grid || !p) return;

        grid.innerHTML = '';
        const slots = [
            { key: 'weapon', name: 'Vũ khí', icon: '⚔️' },
            { key: 'armor', name: 'Áo Giáp', icon: '🛡️' },
            { key: 'gloves', name: 'Găng Tay', icon: '🥊' },
            { key: 'boots', name: 'Giày', icon: '🥾' },
            { key: 'ring', name: 'Nhẫn', icon: '💍' }
        ];

        let bonusDmg = 0, bonusDef = 0, bonusSpd = 0;

        slots.forEach(s => {
            let slotEl = document.createElement('div');
            slotEl.className = 'equip-slot';
            let item = p.equipment ? p.equipment[s.key] : null;

            if (item) {
                let dbItem = ITEMS_DB[item];
                slotEl.innerHTML = `<div style="font-size:24px;">${dbItem ? dbItem.icon : s.icon}</div><div class="equip-label">${s.name}</div>`;
                slotEl.onclick = () => p.unequipSlot(s.key);
                bonusDmg += 5; bonusDef += 3;
            } else {
                slotEl.innerHTML = `<div style="font-size:24px; opacity:0.4;">${s.icon}</div><div class="equip-label">${s.name}</div>`;
            }

            grid.appendChild(slotEl);
        });

        if (summary) {
            summary.innerHTML = `
                <div>Chỉ số trang bị hiện tại:</div>
                <div><strong>+${bonusDmg} DMG</strong> | <strong>+${bonusDef} DEF</strong> | <strong>+${bonusSpd.toFixed(1)} SPD</strong></div>
            `;
        }
    },

    updateBossHPBar: function() {
        let container = document.getElementById('bossHpContainer');
        let bar = document.getElementById('bossHpBar');
        let text = document.getElementById('bossHpText');
        let title = document.getElementById('bossTitle');
        if (!container || !bar || !text) return;

        // Tìm Boss đang xuất hiện gần Player
        let boss = GLOBALS.entities.find(e => e.isBoss && !e.isDead);
        if (boss && GLOBALS.player && Math.abs(boss.x - GLOBALS.player.x) < 700) {
            container.style.display = 'block';
            if (title) title.innerText = boss.name;
            let pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
            bar.style.width = `${pct}%`;
            text.innerText = `${Math.floor(boss.hp)}/${boss.maxHp}`;
        } else {
            container.style.display = 'none';
        }
    },

    showConfirmMenu: function() {
        let screen = document.getElementById('confirmMenuScreen');
        if (screen) screen.style.display = 'flex';
    },

    hideConfirmMenu: function() {
        let screen = document.getElementById('confirmMenuScreen');
        if (screen) screen.style.display = 'none';
    },

    updateSkillCooldowns: function() {
        let p = GLOBALS.player;
        if (!p) return;

        const updateSlot = (id, currentCd, maxCd) => {
            let slot = document.getElementById(id);
            if (!slot) return;
            let overlay = slot.querySelector('.cd-overlay');
            let text = slot.querySelector('.cd-text');
            if (!overlay || !text) return;

            if (currentCd > 0) {
                let pct = (currentCd / maxCd) * 100;
                overlay.style.height = `${pct}%`;
                text.innerText = (currentCd / 1000).toFixed(1);
                text.style.display = 'block';
            } else {
                overlay.style.height = '0%';
                text.style.display = 'none';
            }
        };

        updateSlot('skillK', p.cooldowns.shoot, 800);
        updateSlot('skillQ', p.cooldowns.skill, p.raceConfig.skill.cd);
        updateSlot('skillZ', p.cooldowns.transform, 20000);
        updateSlot('skillL', p.cooldowns.kame, 6000);
        updateSlot('skillO', p.cooldowns.powerUp, 12000);
        this.updateBossHPBar();
    },

    showDonate: function() {
        const donateScreen = document.getElementById('donateScreen');
        if (!donateScreen) return;
        donateScreen.style.display = 'flex';
    },

    hideDonate: function() {
        const donateScreen = document.getElementById('donateScreen');
        if (!donateScreen) return;
        donateScreen.style.display = 'none';
    }
};
