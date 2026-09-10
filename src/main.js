/* =========================================================================
   [CORE] VÒNG LẶP CHÍNH & KHỞI TẠO (MAIN ENTRYPOINT)
   ========================================================================= */
import { GLOBALS } from './config/globals.js';
import { CONFIG } from './config/config.js';
import { Utils } from './utils/utils.js';
import { AnimationManager } from './renderers/animationManager.js';
import { PreviewRenderer } from './renderers/previewRenderer.js';
import { EnvironmentSystem } from './systems/environmentSystem.js';
import { MapManager } from './systems/mapManager.js';
import { SaveSystem } from './systems/saveSystem.js';
import { UI } from './ui/uiManager.js';
import { Player } from './entities/player.js';
import { NPC } from './entities/npc.js';
import { MockNetwork } from './network/mockNetwork.js';
import { SoundSystem } from './systems/soundSystem.js';

export const GameCore = {
    init: function() {
        const playerRaceInput = document.getElementById('playerRaceInput');
        if (playerRaceInput) {
            playerRaceInput.addEventListener('change', () => this.updatePreview());
        }
        this.updatePreview();
        SoundSystem.init();
        SoundSystem.playBGM('login');
        
        window.addEventListener('keydown', e => {
            if (e.code === 'Escape') {
                const donateScreen = document.getElementById('donateScreen');
                const inventory = document.getElementById('inventory');
                const equipment = document.getElementById('equipment');

                const isDonateOpen = donateScreen && donateScreen.style.display === 'flex';
                const isInventoryOpen = inventory && inventory.style.display === 'block';
                const isEquipmentOpen = equipment && equipment.style.display === 'block';

                // 1. Nếu Donate Modal đang mở -> Đóng Donate
                if (isDonateOpen) {
                    UI.hideDonate();
                    return;
                }

                // 2. Nếu Inventory đang mở -> Đóng Inventory
                if (isInventoryOpen) {
                    UI.toggleInventory();
                    return;
                }

                // 3. Nếu Equipment đang mở -> Đóng Equipment
                if (isEquipmentOpen) {
                    UI.toggleEquipment();
                    return;
                }

                // 3. Nếu không có modal nào mở và đang Play -> Bật/Tắt Menu Tạm dừng
                if (GLOBALS.state === 'PLAYING') {
                    this.togglePause();
                }
                
                return;
            }

            if (GLOBALS.state === 'LOGIN' && e.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
                this.startNewGame(true);
            }
            if (GLOBALS.state !== 'PLAYING' || GLOBALS.isPaused) return;
            if (e.key === 'Enter') {
                if (GLOBALS.isChatFocused) {
                    let i = document.getElementById('chatInput');
                    if (i && i.value.trim() && GLOBALS.network) GLOBALS.network.sendChat(GLOBALS.player.name, i.value.trim());
                    if (i) { i.value = ''; i.blur(); }
                } else {
                    let i = document.getElementById('chatInput');
                    if (i) i.focus();
                }
                return;
            }
            if (GLOBALS.isChatFocused) return;
            GLOBALS.keys[e.code] = true;
            
            let p = GLOBALS.player; if (p && p.isDead) return;

            let combatKeys = ['KeyJ', 'KeyK', 'KeyQ', 'KeyZ', 'KeyL', 'KeyO'];
            if (combatKeys.includes(e.code)) {
                GLOBALS.inputBuffer = { code: e.code, time: 300 }; // 300ms combo window
            } 
            
            // Allow jumping independently of combat keys
            if (p && e.code === 'KeyW' && !p.isChargingKame && !p.isChargingPower && p.hurtTimer <= 0) { 
                if (p.isGrounded) {
                    p.vy = p.jumpForce; 
                    p.jumpCount = 1;
                    if (p === GLOBALS.player) SoundSystem.playJump();
                } else if (p.jumpCount < p.maxJumpCount) {
                    p.vy = p.jumpForce * 0.85; 
                    p.jumpCount++;
                    Utils.spawnParticles(p.x + p.width/2, p.y + p.height, '#e0e0e0', 15);
                    if (p === GLOBALS.player) SoundSystem.playJump();
                }
            }
                
            if (p && e.code === 'KeyE') { 
                let currentMap = MapManager.maps[MapManager.currentId];
                let portal = currentMap ? currentMap.portals.find(port => Math.abs(p.x - port.x) < 50) : null;
                if (portal) {
                    MapManager.loadMap(portal.target, portal.targetX);
                    return;
                }
                
                let npc = GLOBALS.entities.find(ent => ent instanceof NPC && Math.abs(ent.x - p.x) < 100); 
                if (npc) npc.talkTo(p); 
            }
            if (e.code === 'KeyI') UI.toggleInventory();
            if (e.code === 'KeyC') UI.toggleEquipment();
        });

        window.addEventListener('keyup', e => GLOBALS.keys[e.code] = false);

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('focus', () => GLOBALS.isChatFocused = true);
            chatInput.addEventListener('blur', () => GLOBALS.isChatFocused = false);
        }

        setInterval(() => {
            if (GLOBALS.state === 'PLAYING' && !GLOBALS.isPaused) SaveSystem.save(false);
        }, 60000); 

        EnvironmentSystem.init(); 
        requestAnimationFrame(this.loop.bind(this));
    },

    togglePause: function() {
        if (GLOBALS.state !== 'PLAYING') return;
        GLOBALS.isPaused = !GLOBALS.isPaused;
        let pauseScreen = document.getElementById('pauseScreen');
        if (pauseScreen) pauseScreen.style.display = GLOBALS.isPaused ? 'flex' : 'none';
        
        if (!GLOBALS.isPaused) {
            GLOBALS.lastTime = performance.now();
        }
    },

    updatePreview: function() {
        let raceInput = document.getElementById('playerRaceInput');
        if (!raceInput) return;
        let race = raceInput.value;
        let c = CONFIG.races[race];
        if (!c) return;

        let racePreviewName = document.getElementById('racePreviewName');
        let racePreviewSubtitle = document.getElementById('racePreviewSubtitle');
        let racePreviewDesc = document.getElementById('racePreviewDesc');
        let racePreviewPros = document.getElementById('racePreviewPros');

        if (racePreviewName) racePreviewName.innerText = c.title;
        if (racePreviewSubtitle) racePreviewSubtitle.innerText = `"${c.subtitle}"`;
        if (racePreviewDesc) racePreviewDesc.innerText = c.desc;
        if (racePreviewPros) racePreviewPros.innerHTML = c.pros.map(p => `• ${p}`).join('<br>');

        let raceHp = document.getElementById('raceHp');
        let raceMp = document.getElementById('raceMp');
        let raceDamage = document.getElementById('raceDamage');
        let raceDef = document.getElementById('raceDef');
        let raceSpeed = document.getElementById('raceSpeed');

        if (raceHp) raceHp.innerText = c.maxHp;
        if (raceMp) raceMp.innerText = c.maxMp;
        if (raceDamage) raceDamage.innerText = c.baseDamage;
        if (raceDef) raceDef.innerText = c.defense;
        if (raceSpeed) raceSpeed.innerText = c.speed;

        let racePreviewSkillName = document.getElementById('racePreviewSkillName');
        let racePreviewSkillDesc = document.getElementById('racePreviewSkillDesc');

        if (racePreviewSkillName) racePreviewSkillName.innerText = `Kỹ năng: ${c.skill.name}`;
        if (racePreviewSkillDesc) racePreviewSkillDesc.innerText = c.skill.desc;
        
        GLOBALS.previewPlayer = {
            x: 30, y: 60, width: 40, height: 50, dir: 1, state: 'idle', 
            raceKey: race, colors: c.colors, skillActive: false, hurtTimer: 0,
            animTimer: 0, animFrame: 0, isDead: false
        };
    },

    startNewGame: function(forceNew = false) {
        if (!forceNew) {
            let data = SaveSystem.load();
            if (data) {
                this.loadGame();
                return;
            }
        }
        let nameInput = document.getElementById('playerNameInput');
        let raceInput = document.getElementById('playerRaceInput');
        let name = (nameInput && nameInput.value) ? nameInput.value : 'Gamer';
        let race = raceInput ? raceInput.value : 'sayan';

        GLOBALS.player = new Player(200, GLOBALS.groundY-100, name, race);
        this.enterWorld('village', 200);
    },

    loadGame: function() {
        let data = SaveSystem.load();
        if (!data || !CONFIG.races[data.race] || !MapManager.maps[data.map]) { 
            UI.showCenterMessage('File save bị lỗi hoặc phiên bản cũ. Vui lòng Tạo Game Mới!'); 
            return; 
        }
        
        GLOBALS.player = new Player(data.x, data.y, data.name, data.race);
        GLOBALS.player.level = data.level; GLOBALS.player.exp = data.exp; GLOBALS.player.money = data.money; GLOBALS.player.quest = data.quest;
        GLOBALS.player.defense = GLOBALS.player.raceConfig.defense;
        
        if (data.inventory) GLOBALS.player.inventory = data.inventory;
        
        for (let i = 1; i < data.level; i++) {
            GLOBALS.player.maxHp += GLOBALS.player.raceConfig.levelGrowth.hp;
            GLOBALS.player.maxMp += GLOBALS.player.raceConfig.levelGrowth.mp;
            GLOBALS.player.baseDamage += GLOBALS.player.raceConfig.levelGrowth.damage;
            GLOBALS.player.defense += GLOBALS.player.raceConfig.levelGrowth.defense;
            GLOBALS.player.maxExp = Math.floor(GLOBALS.player.maxExp * GLOBALS.player.raceConfig.levelGrowth.expFactor);
        }
        
        GLOBALS.player.hp = data.hp > 0 ? data.hp : GLOBALS.player.maxHp;
        GLOBALS.player.mp = data.mp;
        this.enterWorld(data.map, data.x);
        UI.chatSys('Đã tải lại game thành công!');
    },

    enterWorld: function(mapId, spawnX) {
        if (!GLOBALS.network) GLOBALS.network = new MockNetwork();
        
        const loginScreen = document.getElementById('loginScreen');
        const hud = document.getElementById('hud');

        if (loginScreen) {
            loginScreen.style.display = 'none';
            loginScreen.style.pointerEvents = 'none';
        }

        if (hud) {
            hud.style.display = 'block';
        }

        GLOBALS.state = 'PLAYING'; 
        
        if (!GLOBALS.entities.includes(GLOBALS.player)) {
            GLOBALS.entities.push(GLOBALS.player);
        }
        
        MapManager.loadMap(mapId, spawnX);
        UI.updateHUD();
        UI.updateQuest();
        GLOBALS.lastTime = performance.now();
        SoundSystem.playBGM('game');
    },

    respawnPlayer: function() {
        let respawnScreen = document.getElementById('respawnScreen');
        if (respawnScreen) respawnScreen.style.display = 'none';
        GLOBALS.player.hp = GLOBALS.player.maxHp; GLOBALS.player.mp = GLOBALS.player.maxMp; GLOBALS.player.isDead = false; GLOBALS.player.state = 'idle';
        GLOBALS.player.invincibleTimer = 3000; 
        this.enterWorld('village', 200); 
    },

    backToMainMenu: function() {
        SaveSystem.save(false);
        
        GLOBALS.state = 'LOGIN';
        GLOBALS.isPaused = false;
        GLOBALS.player = null;
        GLOBALS.entities = [];
        GLOBALS.projectiles = [];
        GLOBALS.particles = [];
        GLOBALS.texts = [];
        GLOBALS.network = null;
        
        UI.hideConfirmMenu();
        let pauseScreen = document.getElementById('pauseScreen');
        let hud = document.getElementById('hud');
        let inventory = document.getElementById('inventory');
        let respawnScreen = document.getElementById('respawnScreen');

        if (pauseScreen) pauseScreen.style.display = 'none';
        if (hud) hud.style.display = 'none';
        if (inventory) inventory.style.display = 'none';
        if (respawnScreen) respawnScreen.style.display = 'none';
        
        this.updatePreview();

        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            loginScreen.style.pointerEvents = 'auto';
        }
        SoundSystem.playBGM('login');
    },

    loop: function(timestamp) {
        let dt = timestamp - GLOBALS.lastTime; if (dt > 50) dt = 50; GLOBALS.lastTime = timestamp;

        if (GLOBALS.state === 'LOGIN') {
            EnvironmentSystem.update(dt, 0); // Kích hoạt bộ đếm thời gian cho nền động sảnh
            
            // Xóa canvas sảnh chính và kết xuất bộ nền Parallax Anime đặc chủng
            GLOBALS.ctx.clearRect(0, 0, GLOBALS.width, GLOBALS.height);
            EnvironmentSystem.drawLoginBackground(GLOBALS.ctx);

            let previewCanvas = document.getElementById('previewCanvas');
            if (previewCanvas) {
                let pCtx = previewCanvas.getContext('2d');
                pCtx.clearRect(0, 0, 150, 150);
                if (GLOBALS.previewPlayer) { 
                    GLOBALS.previewPlayer.skillActive = (Math.floor(timestamp/1000)%3 === 0); 
                    AnimationManager.updateState(GLOBALS.previewPlayer, dt);
                    PreviewRenderer.draw(pCtx, GLOBALS.previewPlayer, timestamp); 
                }
            }
            requestAnimationFrame(this.loop.bind(this)); return;
        }

        let actualDt = dt;
        if (GLOBALS.hitStopTimer > 0) {
            GLOBALS.hitStopTimer -= dt;
            actualDt = 0; // Freeze time for entities
        }

        if (!GLOBALS.isPaused && actualDt > 0) {
            if (GLOBALS.state === 'PLAYING' && GLOBALS.player && !GLOBALS.player.isDead && !GLOBALS.isChatFocused) {
                if (!GLOBALS.player.isChargingKame && !GLOBALS.player.isChargingPower && GLOBALS.player.state !== 'attack' && GLOBALS.player.state !== 'shoot') {
                    if (GLOBALS.keys['KeyA']) { GLOBALS.player.vx = -GLOBALS.player.speed; GLOBALS.player.dir = -1; }
                    else if (GLOBALS.keys['KeyD']) { GLOBALS.player.vx = GLOBALS.player.speed; GLOBALS.player.dir = 1; }
                }
            }
            if (GLOBALS.player && !GLOBALS.player.isDead && GLOBALS.player.mp < GLOBALS.player.maxMp) GLOBALS.player.mp = Math.min(GLOBALS.player.maxMp, GLOBALS.player.mp + 0.05);

            GLOBALS.entities.forEach(e => e.update(actualDt));
            GLOBALS.projectiles = GLOBALS.projectiles.filter(p => p.life > 0);
            GLOBALS.projectiles.forEach(p => p.update(actualDt));
            GLOBALS.particles = GLOBALS.particles.filter(p => p.life > 0);
            GLOBALS.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; p.vy += CONFIG.gravity * 0.2; });
            GLOBALS.texts = GLOBALS.texts.filter(t => t.life > 0);
            GLOBALS.texts.forEach(t => { t.y += t.vy; t.life--; if (t.isCrit) t.vy *= 0.9; });
            if (GLOBALS.network) GLOBALS.network.update(actualDt);

            EnvironmentSystem.update(actualDt, GLOBALS.camera.x);

            if (GLOBALS.player) {
                let currentMap = MapManager.maps[MapManager.currentId];
                let mapW = currentMap ? currentMap.width : GLOBALS.width;
                GLOBALS.camera.x = GLOBALS.player.x - GLOBALS.width/2 + GLOBALS.player.width/2;
                if (GLOBALS.camera.x < 0) GLOBALS.camera.x = 0;
                if (GLOBALS.camera.x > mapW - GLOBALS.width) GLOBALS.camera.x = mapW - GLOBALS.width;
            }
            
            if (GLOBALS.camera.shakeTime > 0) {
                GLOBALS.camera.shakeTime -= actualDt;
            }
        }
        
        UI.updateSkillCooldowns(); 

        let shakeOffX = 0, shakeOffY = 0;
        if (GLOBALS.camera.shakeTime > 0 && !GLOBALS.isPaused) {
            shakeOffX = Utils.rand(-GLOBALS.camera.shakeIntensity, GLOBALS.camera.shakeIntensity);
            shakeOffY = Utils.rand(-GLOBALS.camera.shakeIntensity, GLOBALS.camera.shakeIntensity);
        }

        GLOBALS.ctx.clearRect(0, 0, GLOBALS.width, GLOBALS.height);
        GLOBALS.ctx.save();
        GLOBALS.ctx.translate(shakeOffX, shakeOffY); 
        
        let currentMap = MapManager.maps[MapManager.currentId];
        if (currentMap) {
            EnvironmentSystem.drawBackground(GLOBALS.ctx, GLOBALS.camera.x, GLOBALS.camera.y, currentMap);
        }
        
        GLOBALS.ctx.save(); GLOBALS.ctx.translate(-GLOBALS.camera.x, -GLOBALS.camera.y);

        GLOBALS.ctx.fillStyle = 'rgba(0,0,0,0.3)';
        GLOBALS.entities.forEach(e => {
            if (!e.isDead || e instanceof Player) {
                GLOBALS.ctx.beginPath();
                GLOBALS.ctx.ellipse(e.x + e.width/2, e.y + e.height, e.width/1.5, 6, 0, 0, Math.PI*2);
                GLOBALS.ctx.fill();
            }
        });

        GLOBALS.entities.sort((a,b) => a.y - b.y).forEach(e => e.draw(GLOBALS.ctx));
        GLOBALS.projectiles.forEach(p => p.draw(GLOBALS.ctx));
        
        EnvironmentSystem.drawParticles(GLOBALS.ctx, GLOBALS.camera.x, GLOBALS.camera.y);

        GLOBALS.particles.forEach(p => {
            GLOBALS.ctx.fillStyle = p.color;
            GLOBALS.ctx.globalAlpha = p.life / 30;
            GLOBALS.ctx.beginPath();
            GLOBALS.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            GLOBALS.ctx.fill();
            GLOBALS.ctx.globalAlpha = 1;
        });
        
        GLOBALS.ctx.font = 'bold 16px "Press Start 2P", monospace';
        GLOBALS.texts.forEach(t => { 
            GLOBALS.ctx.fillStyle = t.color;
            GLOBALS.ctx.globalAlpha = t.life / t.maxLife; 
            GLOBALS.ctx.font = t.isCrit ? 'bold 24px "Press Start 2P"' : 'bold 14px "Press Start 2P"'; 
            GLOBALS.ctx.fillText(t.text, t.x, t.y);
            GLOBALS.ctx.globalAlpha = 1; 
        });
        
        GLOBALS.ctx.restore();
        GLOBALS.ctx.restore(); 
        
        if (GLOBALS.player && GLOBALS.player.isDead && !GLOBALS.isPaused) UI.updateHUD(); 
        requestAnimationFrame(this.loop.bind(this));
    }
};

// Gắn global scope để tương thích các sự kiện onclick trong HTML
window.GameCore = GameCore;
window.UI = UI;
window.SoundSystem = SoundSystem;
window.GLOBALS = GLOBALS;

// Start Engine
document.addEventListener('DOMContentLoaded', () => {
    GameCore.init();
});
