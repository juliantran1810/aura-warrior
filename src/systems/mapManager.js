/* =========================================================================
   [SYSTEM] BẢN ĐỒ & DI CHUYỂN
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { EnvironmentSystem } from './environmentSystem.js';
import { UI } from '../ui/uiManager.js';
import { NPC } from '../entities/npc.js';
import { Monster } from '../entities/monster.js';
import { Boss } from '../entities/boss.js';

export const MapManager = {
    currentId: 'village',
    maps: {
        village: {
            name: 'Làng Khởi Đầu',
            width: 2800,
            bgType: 'village',
            groundColor: '#689f38', dirtColor: '#5d4037',
            platforms: [
                { x: 450, y: GLOBALS.groundY - 110, width: 230, type: 'wood' },
                { x: 820, y: GLOBALS.groundY - 170, width: 270, type: 'stone' },
                { x: 1350, y: GLOBALS.groundY - 130, width: 250, type: 'wood' },
                { x: 1800, y: GLOBALS.groundY - 190, width: 290, type: 'stone' },
                { x: 2250, y: GLOBALS.groundY - 120, width: 240, type: 'wood' }
            ],
            portals: [
                { x: 2650, target: 'forest', targetX: 100, label: 'Tới Rừng Quái ->' }
            ],
            spawns: [
                { type: 'npc', x: 400, id: 'truonglang' },
                { type: 'monster', x: 1000, lvl: 1 },
                { type: 'monster', x: 1500, lvl: 1 },
                { type: 'monster', x: 2000, lvl: 1 }
            ]
        },
        forest: {
            name: 'Rừng Quái Vật',
            width: 3200,
            bgType: 'forest',
            groundColor: '#33691e', dirtColor: '#3e2723',
            platforms: [
                { x: 350, y: GLOBALS.groundY - 130, width: 250, type: 'stone' },
                { x: 750, y: GLOBALS.groundY - 200, width: 300, type: 'moss_stone' },
                { x: 1250, y: GLOBALS.groundY - 140, width: 260, type: 'wood' },
                { x: 1750, y: GLOBALS.groundY - 210, width: 290, type: 'moss_stone' },
                { x: 2300, y: GLOBALS.groundY - 150, width: 270, type: 'stone' }
            ],
            portals: [
                { x: 50, target: 'village', targetX: 2550, label: '<- Về Làng' },
                { x: 3050, target: 'namek', targetX: 100, label: 'Tới H.T Namek ->' }
            ],
            spawns: [
                { type: 'monster', x: 600, lvl: 2 },
                { type: 'monster', x: 1200, lvl: 2 },
                { type: 'monster', x: 1800, lvl: 3 },
                { type: 'monster', x: 2400, lvl: 3 },
                { type: 'boss', x: 2700 }
            ]
        },
        namek: {
            name: 'Hành Tinh Namek',
            width: 3500,
            bgType: 'namek',
            groundColor: '#06b6d4', dirtColor: '#0f766e',
            platforms: [
                { x: 400, y: GLOBALS.groundY - 140, width: 280, type: 'crystal' },
                { x: 900, y: GLOBALS.groundY - 220, width: 320, type: 'crystal' },
                { x: 1500, y: GLOBALS.groundY - 150, width: 270, type: 'crystal' },
                { x: 2100, y: GLOBALS.groundY - 230, width: 310, type: 'crystal' },
                { x: 2700, y: GLOBALS.groundY - 160, width: 290, type: 'crystal' }
            ],
            portals: [
                { x: 50, target: 'forest', targetX: 2950, label: '<- Về Rừng' },
                { x: 3350, target: 'arena', targetX: 100, label: 'Đấu Trường ->' }
            ],
            spawns: [
                { type: 'monster', x: 700, lvl: 4 },
                { type: 'monster', x: 1400, lvl: 4 },
                { type: 'monster', x: 2200, lvl: 5 },
                { type: 'boss', x: 2900 }
            ]
        },
        arena: {
            name: 'Đấu Trường Võ Thuật',
            width: 3000,
            bgType: 'arena',
            groundColor: '#d97706', dirtColor: '#78350f',
            platforms: [
                { x: 600, y: GLOBALS.groundY - 90, width: 1800, type: 'marble' },
                { x: 250, y: GLOBALS.groundY - 200, width: 300, type: 'marble' },
                { x: 2450, y: GLOBALS.groundY - 200, width: 300, type: 'marble' }
            ],
            portals: [
                { x: 50, target: 'namek', targetX: 3250, label: '<- H.T Namek' },
                { x: 2850, target: 'village', targetX: 200, label: 'Về Làng Sảnh ->' }
            ],
            spawns: [
                { type: 'monster', x: 800, lvl: 5 },
                { type: 'monster', x: 1600, lvl: 5 },
                { type: 'boss', x: 2100 }
            ]
        }
    },

    loadMap: function (mapId, spawnX) {
        this.currentId = mapId;
        let mapData = this.maps[mapId];
        let mapInfoEl = document.getElementById('mapInfo');
        if (mapInfoEl) mapInfoEl.innerText = mapData.name;

        GLOBALS.mapWidth = mapData.width;
        GLOBALS.entities = GLOBALS.entities.filter(e => e === GLOBALS.player || e.isBot);
        GLOBALS.projectiles = []; GLOBALS.particles = [];

        if (GLOBALS.player) { GLOBALS.player.x = spawnX; GLOBALS.player.y = GLOBALS.groundY - 100; }

        mapData.spawns.forEach(s => {
            if (s.type === 'npc') GLOBALS.entities.push(new NPC(s.x, GLOBALS.groundY - 50));
            if (s.type === 'monster') GLOBALS.entities.push(new Monster(s.x, GLOBALS.groundY - 50, s.lvl));
            if (s.type === 'boss') GLOBALS.entities.push(new Boss(s.x, GLOBALS.groundY - 80));
        });

        EnvironmentSystem.initMapProps(mapData.width);
        UI.showCenterMessage(`Khu vực: ${mapData.name}`);
    }
};
