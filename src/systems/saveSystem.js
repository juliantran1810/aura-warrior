/* =========================================================================
   [SYSTEM] LƯU TRỮ TRẠNG THÁI GAME
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { MapManager } from './mapManager.js';
import { UI } from '../ui/uiManager.js';

export const SaveSystem = {
    save: function(showMessage = true) { 
        if (!GLOBALS.player) return;
        let data = {
            name: GLOBALS.player.name,
            race: GLOBALS.player.raceKey,
            level: GLOBALS.player.level,
            exp: GLOBALS.player.exp,
            hp: GLOBALS.player.hp,
            mp: GLOBALS.player.mp,
            money: GLOBALS.player.money,
            map: MapManager.currentId,
            x: GLOBALS.player.x,
            y: GLOBALS.player.y,
            quest: GLOBALS.player.quest,
            inventory: GLOBALS.player.inventory
        };
        localStorage.setItem('aura_save', JSON.stringify(data));
        if (showMessage) UI.chatSys('Đã lưu game!');
    },
    load: function() {
        let raw = localStorage.getItem('aura_save');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Lỗi khi đọc file save:', e);
            return null;
        }
    }
};
