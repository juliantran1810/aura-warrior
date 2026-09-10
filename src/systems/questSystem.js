/* =========================================================================
   [SYSTEM] HỆ THỐNG NHIỆM VỤ ĐA DẠNG & NHẬT KÝ NHIỆM VỤ (QUEST SYSTEM)
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { ITEMS_DB } from '../config/config.js';
import { Utils } from '../utils/utils.js';
import { UI } from '../ui/uiManager.js';
import { SoundSystem } from './soundSystem.js';

export const QUESTS_DB = [
    {
        id: 'q1',
        title: 'NV1: Khởi Đầu Hành Trình',
        npcName: 'Trưởng Làng',
        mapId: 'village',
        mapName: 'Làng Khởi Đầu',
        desc: 'Nói chuyện với Trưởng Làng tại Làng Khởi Đầu để nhận chỉ dẫn võ học.',
        type: 'talk',
        targetName: 'Trưởng Làng',
        targetCount: 1,
        reward: { exp: 120, money: 350, items: [{ id: 'hp_potion_small', count: 3 }] },
        nextQuestId: 'q2'
    },
    {
        id: 'q2',
        title: 'NV2: Diệt Quái Làng Khởi Đầu',
        npcName: 'Trưởng Làng',
        mapId: 'village',
        mapName: 'Làng Khởi Đầu',
        desc: 'Tiêu diệt 3 Quái Cấp 1 để bảo vệ bình yên cho dân làng.',
        type: 'kill',
        targetName: 'Quái Cấp 1',
        targetCount: 3,
        reward: { exp: 250, money: 800, items: [{ id: 'mp_potion_small', count: 3 }, { id: 'power_stone', count: 1 }] },
        nextQuestId: 'q3'
    },
    {
        id: 'q3',
        title: 'NV3: Quét Sạch Rừng Quái',
        npcName: 'Trưởng Làng',
        mapId: 'forest',
        mapName: 'Rừng Quái Vật',
        desc: 'Di chuyển sang Rừng Quái Vật và tiêu diệt 5 Quái Rừng.',
        type: 'kill',
        targetName: 'Quái Rừng',
        targetCount: 5,
        reward: { exp: 600, money: 1500, items: [{ id: 'hp_potion_big', count: 2 }, { id: 'wood_chest', count: 1 }] },
        nextQuestId: 'q4'
    },
    {
        id: 'q4',
        title: 'NV4: Thử Thách Trọng Tướng Vegeta',
        npcName: 'Trưởng Làng',
        mapId: 'forest',
        mapName: 'Rừng Quái Vật',
        desc: 'Hạ gục Boss Trọng Tướng Vegeta đang hoành hành cuối Rừng Quái.',
        type: 'boss',
        targetName: 'Trọng Tướng Vegeta',
        targetCount: 1,
        reward: { exp: 1500, money: 3500, items: [{ id: 'rare_chest', count: 1 }, { id: 'teleport_ticket', count: 2 }] },
        nextQuestId: 'q5'
    },
    {
        id: 'q5',
        title: 'NV5: Hành Trình Đến H.T Namek',
        npcName: 'Trưởng Làng',
        mapId: 'namek',
        mapName: 'Hành Tinh Namek',
        desc: 'Qua Cổng dịch chuyển đến Hành Tinh Namek và diệt 6 Sinh Vật Alien.',
        type: 'kill',
        targetName: 'Sinh Vật Namek',
        targetCount: 6,
        reward: { exp: 3000, money: 6000, items: [{ id: 'revive_bean', count: 1 }, { id: 'green_gem', count: 2 }] },
        nextQuestId: 'q6'
    },
    {
        id: 'q6',
        title: 'NV6: Xưng Hùng Đấu Trường',
        npcName: 'Trưởng Làng',
        mapId: 'arena',
        mapName: 'Đấu Trường Võ Thuật',
        desc: 'Tới Đấu Trường Võ Thuật và tiêu diệt 8 Quái Đấu Trường để trở thành Huyền Thoại!',
        type: 'kill',
        targetName: 'Quái Đấu Trường',
        targetCount: 8,
        reward: { exp: 6500, money: 12000, items: [{ id: 'gold_gem', count: 2 }, { id: 'rare_chest', count: 2 }] },
        nextQuestId: null
    }
];

export const QuestSystem = {
    initPlayerQuest: function (player) {
        if (!player) return;

        // Auto-migration for legacy saves
        if (!player.quest || typeof player.quest.step === 'number') {
            let legacyStep = (player.quest && typeof player.quest.step === 'number') ? player.quest.step : 0;
            let currentId = 'q1';
            let status = 'IN_PROGRESS';
            let progress = 0;

            if (legacyStep === 0) { currentId = 'q1'; status = 'IN_PROGRESS'; }
            else if (legacyStep === 1) { currentId = 'q2'; status = 'IN_PROGRESS'; progress = player.quest.progress || 0; }
            else if (legacyStep === 2) { currentId = 'q2'; status = 'READY_TO_CLAIM'; progress = 3; }
            else { currentId = 'q3'; status = 'IN_PROGRESS'; progress = 0; }

            player.quest = {
                currentId: currentId,
                progress: progress,
                status: status,
                completedQuests: legacyStep >= 3 ? ['q1', 'q2'] : []
            };
        }
    },

    getQuest: function (questId) {
        return QUESTS_DB.find(q => q.id === questId) || null;
    },

    getCurrentQuest: function (player) {
        this.initPlayerQuest(player);
        return this.getQuest(player.quest.currentId);
    },

    onKillTarget: function (player, target) {
        if (!player || !target || player.isDead) return;
        this.initPlayerQuest(player);

        let q = this.getCurrentQuest(player);
        if (!q || player.quest.status === 'READY_TO_CLAIM' || player.quest.status === 'COMPLETED') return;

        let isMatch = false;
        if (q.type === 'kill') isMatch = true;
        else if (q.type === 'boss' && target.isBoss) isMatch = true;

        if (isMatch) {
            player.quest.progress++;
            if (player.quest.progress >= q.targetCount) {
                player.quest.progress = q.targetCount;
                player.quest.status = 'READY_TO_CLAIM';
                UI.showCenterMessage(`Nhiệm vụ xong: ${q.title}! Nhấn [N] nhận thưởng.`);
                UI.chatSys(`[NHIỆM VỤ] Hoàn thành ${q.title}! Hãy nhận thưởng.`);
                SoundSystem.playLevelUp();
            } else {
                UI.chatSys(`[NHIỆM VỤ] Tiễn quái: ${player.quest.progress}/${q.targetCount}`);
            }
            this.updateUI();
        }
    },

    onTalkNPC: function (player, npc) {
        this.initPlayerQuest(player);
        let q = this.getCurrentQuest(player);

        if (!q) {
            npc.showDialog('Ngươi đã hoàn thành toàn bộ Nhiệm vụ!');
            return;
        }

        if (q.type === 'talk' && player.quest.status === 'IN_PROGRESS') {
            player.quest.progress = 1;
            player.quest.status = 'READY_TO_CLAIM';
            npc.showDialog(`Chào mừng! Nhận chỉ dẫn võ học từ Trưởng Làng.`);
            this.claimReward(player);
            return;
        }

        if (player.quest.status === 'READY_TO_CLAIM') {
            npc.showDialog(`Xuất sắc! Đây là phần thưởng ${q.title}!`);
            this.claimReward(player);
            return;
        }

        if (player.quest.status === 'IN_PROGRESS') {
            npc.showDialog(`Hãy tới ${q.mapName}: ${q.desc}`);
            return;
        }

        npc.showDialog('Làng bình yên rồi, chúc ngươi luyện võ tốt!');
    },

    claimReward: function (player) {
        this.initPlayerQuest(player);
        let q = this.getCurrentQuest(player);
        if (!q || player.quest.status !== 'READY_TO_CLAIM') return;

        // Reward EXP & Money
        if (q.reward.exp) player.addExp(q.reward.exp);
        if (q.reward.money) player.money += q.reward.money;

        // Reward Items
        if (q.reward.items) {
            q.reward.items.forEach(rwItem => {
                let invItem = player.inventory.find(i => i.id === rwItem.id);
                if (invItem) invItem.count += rwItem.count;
                else player.inventory.push({ id: rwItem.id, count: rwItem.count });

                let dbItem = ITEMS_DB[rwItem.id];
                let itemName = dbItem ? dbItem.name : rwItem.id;
                UI.chatSys(`[THƯỞNG] Nhận ${rwItem.count}x ${itemName}`);
            });
        }

        // Add to completed list
        if (!player.quest.completedQuests.includes(q.id)) {
            player.quest.completedQuests.push(q.id);
        }

        UI.showCenterMessage(`NHẬN THƯỞNG: ${q.title}!`);
        SoundSystem.playItem();

        // Advance to next quest
        if (q.nextQuestId) {
            player.quest.currentId = q.nextQuestId;
            player.quest.progress = 0;
            player.quest.status = 'IN_PROGRESS';
        } else {
            player.quest.status = 'COMPLETED';
        }

        this.updateUI();
        UI.updateInventoryUI();
    },

    updateUI: function () {
        let p = GLOBALS.player; if (!p) return;
        this.initPlayerQuest(p);

        let txt = document.getElementById('questText');
        let subTxt = document.getElementById('questSubText');
        let q = this.getCurrentQuest(p);

        if (!txt) return;

        if (!q || p.quest.status === 'COMPLETED') {
            txt.innerHTML = `<span style="color:#81c784">Đã hoàn thành toàn bộ NV!</span>`;
            if (subTxt) subTxt.innerText = '(Bấm [N] xem Lịch sử)';
            return;
        }

        if (p.quest.status === 'READY_TO_CLAIM') {
            txt.innerHTML = `<span style="color:#ffd54f; font-weight:900; animation: glowBadge 1s infinite alternate;">🎁 [NHẬN THƯỞNG NV]</span>`;
            if (subTxt) subTxt.innerText = 'Bấm [N] hoặc Báo cáo Trưởng Làng';
        } else {
            txt.innerHTML = `<span style="color:#e0e0e0; font-weight:700;">${q.title}: ${p.quest.progress}/${q.targetCount}</span>`;
            if (subTxt) subTxt.innerText = `[${q.mapName}] - Bấm [N] xem chi tiết`;
        }

        let journalBody = document.getElementById('questJournalBody');
        if (journalBody && document.getElementById('questJournal') && document.getElementById('questJournal').style.display === 'block') {
            this.renderJournalModal(p, journalBody);
        }
    },

    renderJournalModal: function (player, container) {
        this.initPlayerQuest(player);
        let currentQ = this.getCurrentQuest(player);
        let completedIds = player.quest.completedQuests || [];

        let html = `<div style="max-height:420px; overflow-y:auto; padding-right:5px;">`;

        if (currentQ && player.quest.status !== 'COMPLETED') {
            let isReady = player.quest.status === 'READY_TO_CLAIM';
            let pct = Math.floor((player.quest.progress / currentQ.targetCount) * 100);

            html += `
                <div style="background: rgba(126, 87, 194, 0.15); border: 2px solid #7e57c2; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-weight:900; color:#ffca28; font-size:16px;">${currentQ.title}</span>
                        <span style="background:rgba(0,229,255,0.2); border:1px solid #00e5ff; color:#00e5ff; font-size:11px; padding:3px 8px; border-radius:10px; font-weight:900;">${currentQ.mapName}</span>
                    </div>
                    <p style="font-size:13px; color:#ddd; margin: 8px 0; line-height:1.5; font-style:italic;">${currentQ.desc}</p>
                    
                    <div style="margin: 12px 0;">
                        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:900; color:#eee; margin-bottom:4px;">
                            <span>Mục tiêu: ${currentQ.targetName}</span>
                            <span>${player.quest.progress} / ${currentQ.targetCount} (${pct}%)</span>
                        </div>
                        <div style="width:100%; background:rgba(0,0,0,0.6); height:12px; border-radius:6px; overflow:hidden; border:1px solid rgba(255,255,255,0.2);">
                            <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #ffca28, #ff9800); border-radius:5px;"></div>
                        </div>
                    </div>

                    <div style="background:rgba(5,8,18,0.6); border:1px solid rgba(255,255,255,0.1); padding:10px; border-radius:8px; margin-top:12px;">
                        <div style="font-size:11px; color:#b0bec5; font-weight:900; text-transform:uppercase; margin-bottom:6px;">Phần Thưởng Nhiệm Vụ:</div>
                        <div style="display:flex; gap:14px; font-size:12.5px; font-weight:900; color:#ffd54f; flex-wrap:wrap;">
                            <span>⭐ +${currentQ.reward.exp} EXP</span>
                            <span>🪙 +${currentQ.reward.money} Vàng</span>
                            ${currentQ.reward.items ? currentQ.reward.items.map(it => {
                let db = ITEMS_DB[it.id];
                return `<span>${db ? db.icon : '📦'} ${it.count}x ${db ? db.name : it.id}</span>`;
            }).join('') : ''}
                        </div>
                    </div>

                    <div style="margin-top:14px; text-align:right;">
                        ${isReady ? `
                            <button class="btn-action" style="width:auto; padding:8px 20px; background:linear-gradient(180deg, #ffeb3b 0%, #f57f17 100%); color:#000; border-color:#ffa000;" onclick="QuestSystem.claimReward(GLOBALS.player)">🎁 NHẬN THƯỞNG NGAY</button>
                        ` : `
                            <button class="btn-action" style="width:auto; padding:8px 20px; background:#424242; border-color:#212121; cursor:default;" disabled>⏳ ĐANG THỰC HIỆN</button>
                        `}
                    </div>
                </div>
            `;
        }

        html += `<div style="font-size:13px; font-weight:900; color:#b388ff; text-transform:uppercase; margin-bottom:10px;">Lịch Sử Nhiệm Vụ Đã Hoàn Thành (${completedIds.length}):</div>`;

        if (completedIds.length === 0) {
            html += `<div style="font-size:12.5px; color:#aaa; font-style:italic;">Chưa hoàn thành nhiệm vụ nào.</div>`;
        } else {
            completedIds.forEach(id => {
                let qDone = this.getQuest(id);
                if (qDone) {
                    html += `
                        <div style="background:rgba(5,8,18,0.5); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 14px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <span style="font-weight:900; color:#81c784; font-size:13.5px;">✓ ${qDone.title}</span>
                                <div style="font-size:11.5px; color:#888;">${qDone.desc}</div>
                            </div>
                            <span style="color:#81c784; font-weight:900; font-size:12px;">[HOÀN THÀNH]</span>
                        </div>
                    `;
                }
            });
        }

        html += `</div>`;
        container.innerHTML = html;
    }
};

// Expose globally for HTML handlers
window.QuestSystem = QuestSystem;
