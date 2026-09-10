/* =========================================================================
   [SYSTEM] MÔI TRƯỜNG & HẠT BỤI & NỀN SẢNH CHÍNH CHUYÊN DỤNG
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { Utils } from '../utils/utils.js';
import { MapManager } from './mapManager.js';

export const EnvironmentSystem = {
    clouds: [],
    leaves: [],
    trees: [], 
    mountains: [],
    loginParticles: [], 
    ambientParticles: [],

    init: function() {
        this.clouds = [];
        for (let i = 0; i < 25; i++) {
            this.clouds.push({
                x: Utils.rand(0, 4000),
                y: Utils.rand(15, 300),
                speed: Utils.rand(0.15, 0.55),
                scale: Utils.rand(0.6, 1.6)
            });
        }
        for (let i = 0; i < 40; i++) {
            this.loginParticles.push({
                x: Utils.rand(0, GLOBALS.width),
                y: Utils.rand(0, GLOBALS.height),
                size: Utils.rand(1.5, 3.5),
                vy: Utils.rand(-0.8, -0.2),
                alpha: Utils.rand(0.2, 0.7)
            });
        }
    },

    initMapProps: function(mapWidth) {
        this.trees = [];
        for (let i = 100; i < mapWidth; i += Utils.rand(300, 600)) {
            this.trees.push({ x: i, scale: Utils.rand(0.8, 1.4), type: Math.random() > 0.5 ? 1 : 2 });
        }
        this.ambientParticles = [];
        for (let i = 0; i < 45; i++) {
            this.ambientParticles.push({
                x: Utils.rand(0, mapWidth),
                y: Utils.rand(50, GLOBALS.groundY),
                size: Utils.rand(2, 4.5),
                vx: Utils.rand(-0.6, 0.6),
                vy: Utils.rand(-0.5, -0.1),
                alpha: Utils.rand(0.3, 0.9),
                pulse: Utils.rand(0, Math.PI * 2)
            });
        }
    },

    update: function(dt, camX) {
        GLOBALS.gameTime += dt;
        this.clouds.forEach(c => { 
            c.x -= c.speed; 
            let boundW = (GLOBALS.state === 'LOGIN') ? GLOBALS.width : (GLOBALS.mapWidth || GLOBALS.width);
            if (c.x < -240) c.x = boundW + 240; 
        });
        
        if (GLOBALS.state === 'LOGIN') {
            this.loginParticles.forEach(p => {
                p.y += p.vy;
                if (p.y < -10) { p.y = GLOBALS.height + 10; p.x = Utils.rand(0, GLOBALS.width); }
            });
        } else {
            if (Math.random() < 0.08 && this.leaves.length < 50) {
                this.leaves.push({
                    x: camX + Utils.rand(0, GLOBALS.width),
                    y: -20,
                    vx: Utils.rand(-3, -1),
                    vy: Utils.rand(1, 3),
                    rot: 0
                });
            }
            this.leaves.forEach(l => { l.x += l.vx; l.y += l.vy; l.rot += 0.05; });
            this.leaves = this.leaves.filter(l => l.y < GLOBALS.groundY + 20);

            if (this.ambientParticles) {
                let mapW = GLOBALS.mapWidth || 3000;
                this.ambientParticles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.pulse += 0.04;
                    if (p.y < 30) { p.y = GLOBALS.groundY - 10; p.x = Utils.rand(0, mapW); }
                    if (p.x < 0) p.x = mapW;
                    if (p.x > mapW) p.x = 0;
                });
            }
        }
    },

    // Hệ thống Vẽ nền Sảnh Đăng nhập Anime Parallax Hoành tráng
    drawLoginBackground: function(ctx) {
        let time = GLOBALS.gameTime;
        
        // 1. Lớp Bầu trời gradient xanh ngọc rực rỡ đặc trưng phong cách Toriyama
        let skyGrad = ctx.createLinearGradient(0, 0, 0, GLOBALS.height);
        skyGrad.addColorStop(0, '#1171ba');
        skyGrad.addColorStop(0.4, '#48b2eb');
        skyGrad.addColorStop(1, '#a6e3fa');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, GLOBALS.width, GLOBALS.height);

        // Hiệu ứng ánh mặt trời rực rỡ chiếu xiên nhẹ
        let sunGrad = ctx.createRadialGradient(GLOBALS.width * 0.15, GLOBALS.height * 0.15, 10, GLOBALS.width * 0.15, GLOBALS.height * 0.15, 400);
        sunGrad.addColorStop(0, 'rgba(255, 255, 220, 0.45)');
        sunGrad.addColorStop(0.2, 'rgba(255, 255, 240, 0.15)');
        sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, GLOBALS.width, GLOBALS.height);

        // 2. Lớp Mây Trôi Bồng Bềnh Xa (Parallax Lớp 1)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        this.clouds.forEach(c => {
            ctx.beginPath(); 
            ctx.arc(c.x, c.y, 45 * c.scale, 0, Math.PI * 2);
            ctx.arc(c.x + 35 * c.scale, c.y - 12 * c.scale, 55 * c.scale, 0, Math.PI * 2);
            ctx.arc(c.x + 70 * c.scale, c.y, 45 * c.scale, 0, Math.PI * 2); 
            ctx.fill();
        });

        // 3. Lớp Núi đá/Đảo nổi huyền ảo phía cực xa (Parallax Lớp 2)
        ctx.fillStyle = '#6196cc';
        ctx.beginPath();
        ctx.moveTo(0, GLOBALS.groundY);
        for (let i = 0; i <= GLOBALS.width; i += 60) {
            let nY = GLOBALS.groundY - 180 - Math.sin(i * 0.0015 + 1.2) * 110 - Math.cos(i * 0.004) * 25;
            ctx.lineTo(i, nY);
        }
        ctx.lineTo(GLOBALS.width, GLOBALS.groundY); ctx.fill();

        // 4. Dãy núi đá sừng sững, nhấp nhô cận cảnh hơn (Parallax Lớp 3)
        ctx.fillStyle = '#395373';
        ctx.beginPath();
        ctx.moveTo(0, GLOBALS.groundY);
        for (let i = 0; i <= GLOBALS.width; i += 40) {
            let nY = GLOBALS.groundY - 110 - Math.cos(i * 0.0035 + 0.4) * 80 - Math.sin(i * 0.008) * 15;
            ctx.lineTo(i, nY);
        }
        ctx.lineTo(GLOBALS.width, GLOBALS.groundY); ctx.fill();

        // 5. Thảm đồng cỏ nền sảnh chính phối màu Anime tươi sáng
        let groundYTop = GLOBALS.groundY - 40;
        let groundGrad = ctx.createLinearGradient(0, groundYTop, 0, GLOBALS.height);
        groundGrad.addColorStop(0, '#55a630');
        groundGrad.addColorStop(0.1, '#3f7d20');
        groundGrad.addColorStop(1, '#1b4332');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundYTop, GLOBALS.width, GLOBALS.height - groundYTop);

        // Đường viền viền cỏ sắc nét ngăn cách
        ctx.strokeStyle = '#2b9348'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, groundYTop); ctx.lineTo(GLOBALS.width, groundYTop); ctx.stroke();

        // 6. Điểm xuyết vài cụm cây tán tròn bồng bềnh đặc thù DBZ hai bên rìa nền
        ctx.fillStyle = '#2d6a4f';
        this.drawAnimeTreeCluster(ctx, GLOBALS.width * 0.08, groundYTop + 20, 1.5);
        this.drawAnimeTreeCluster(ctx, GLOBALS.width * 0.88, groundYTop + 20, 1.6);

        // 7. Kết xuất các hạt bụi sáng/năng lượng nhẹ lơ lửng xung quanh sảnh chính
        this.loginParticles.forEach(p => {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawAnimeTreeCluster: function(ctx, x, y, scale) {
        ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
        ctx.fillStyle = '#402e2b'; ctx.fillRect(-6, -50, 12, 50); // Thân cây
        ctx.fillStyle = '#132a13';
        ctx.beginPath(); ctx.arc(0, -55, 38, 0, Math.PI*2); ctx.arc(-22, -40, 26, 0, Math.PI*2); ctx.arc(22, -40, 26, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3f7d20';
        ctx.beginPath(); ctx.arc(-6, -62, 22, 0, Math.PI*2); ctx.arc(10, -52, 18, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    },

    drawBackground: function(ctx, camX, camY, mapData) {
        let bgType = mapData.bgType || 'village';
        let time = GLOBALS.gameTime;

        // 1. Sky Gradient based on map location
        let grad = ctx.createLinearGradient(0, 0, 0, GLOBALS.height);
        if (bgType === 'village') {
            grad.addColorStop(0, '#1171ba'); grad.addColorStop(0.5, '#48b2eb'); grad.addColorStop(1, '#a6e3fa');
        } else if (bgType === 'forest') {
            grad.addColorStop(0, '#064e3b'); grad.addColorStop(0.5, '#047857'); grad.addColorStop(1, '#10b981');
        } else if (bgType === 'namek') {
            grad.addColorStop(0, '#042f2e'); grad.addColorStop(0.5, '#0d9488'); grad.addColorStop(1, '#2dd4bf');
        } else if (bgType === 'arena') {
            grad.addColorStop(0, '#451a03'); grad.addColorStop(0.5, '#9a3412'); grad.addColorStop(1, '#f97316');
        }
        ctx.fillStyle = grad; 
        ctx.fillRect(0, 0, GLOBALS.width, GLOBALS.height);
        
        ctx.save(); 
        ctx.translate(-camX, -camY);
        
        // 2. Celestial Suns/Moons
        if (bgType === 'namek') {
            // 3 Suns for Planet Namek
            ctx.fillStyle = 'rgba(167, 243, 208, 0.7)';
            ctx.beginPath(); ctx.arc(camX + 300, 90, 45, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(103, 232, 249, 0.6)';
            ctx.beginPath(); ctx.arc(camX + 650, 140, 35, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = 'rgba(253, 224, 71, 0.5)';
            ctx.beginPath(); ctx.arc(camX + 1100, 80, 50, 0, Math.PI*2); ctx.fill();
        } else if (bgType === 'arena') {
            // Sunset Sun
            let sunG = ctx.createRadialGradient(camX + GLOBALS.width*0.5, 160, 10, camX + GLOBALS.width*0.5, 160, 200);
            sunG.addColorStop(0, 'rgba(254, 240, 138, 0.8)');
            sunG.addColorStop(1, 'rgba(249, 115, 22, 0)');
            ctx.fillStyle = sunG; ctx.fillRect(camX, 0, GLOBALS.width, GLOBALS.height);
        } else {
            // Toriyama Sun
            let sunG = ctx.createRadialGradient(camX + 250, 120, 10, camX + 250, 120, 220);
            sunG.addColorStop(0, 'rgba(255, 255, 220, 0.7)');
            sunG.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = sunG; ctx.fillRect(camX, 0, GLOBALS.width, GLOBALS.height);
        }

        // 3. Parallax Clouds Layer
        ctx.fillStyle = bgType === 'forest' ? 'rgba(167, 243, 208, 0.3)' : 'rgba(255, 255, 255, 0.5)';
        this.clouds.forEach(c => {
            if (c.x > camX - 250 && c.x < camX + GLOBALS.width + 250) { 
                ctx.beginPath(); 
                ctx.arc(c.x, c.y, 40*c.scale, 0, Math.PI*2);
                ctx.arc(c.x + 30*c.scale, c.y - 10*c.scale, 50*c.scale, 0, Math.PI*2);
                ctx.arc(c.x + 60*c.scale, c.y, 40*c.scale, 0, Math.PI*2); 
                ctx.fill();
            }
        });

        // 4. Dual Parallax Mountain Ranges
        let mountainColor1 = bgType === 'namek' ? '#0f766e' : (bgType === 'forest' ? '#064e3b' : (bgType === 'arena' ? '#7c2d12' : '#1c2e4a'));
        let mountainColor2 = bgType === 'namek' ? '#115e59' : (bgType === 'forest' ? '#022c22' : (bgType === 'arena' ? '#451a03' : '#263238'));

        // Far Mountains
        ctx.fillStyle = mountainColor1;
        ctx.beginPath(); ctx.moveTo(camX, GLOBALS.groundY);
        for (let i = camX; i < camX + GLOBALS.width + 60; i += 50) {
            ctx.lineTo(i, GLOBALS.groundY - 140 - Math.sin(i*0.0025)*90);
        }
        ctx.lineTo(camX + GLOBALS.width + 60, GLOBALS.groundY); ctx.fill();

        // Near Mountains
        ctx.fillStyle = mountainColor2;
        ctx.beginPath(); ctx.moveTo(camX, GLOBALS.groundY);
        for (let i = camX; i < camX + GLOBALS.width + 60; i += 40) {
            ctx.lineTo(i, GLOBALS.groundY - 80 - Math.cos(i*0.005)*55);
        }
        ctx.lineTo(camX + GLOBALS.width + 60, GLOBALS.groundY); ctx.fill();

        // 5. Main Ground Base & Dirt Layer
        ctx.fillStyle = mapData.groundColor; 
        ctx.fillRect(0, GLOBALS.groundY, mapData.width, 24);

        // Grass Fringe (Swaying Blades with Foot Bending Physics)
        ctx.fillStyle = bgType === 'namek' ? '#22d3ee' : (bgType === 'forest' ? '#10b981' : '#81c784');
        let p = GLOBALS.player;
        for (let gx = Math.max(0, camX - 50); gx < Math.min(mapData.width, camX + GLOBALS.width + 50); gx += 14) {
            let sway = Math.sin(time / 250 + gx * 0.05) * 3;
            let playerDist = p ? Math.abs((p.x + p.width/2) - gx) : 999;
            let footBend = playerDist < 35 ? (gx < (p.x + p.width/2) ? -7 : 7) : 0;
            
            ctx.beginPath();
            ctx.moveTo(gx, GLOBALS.groundY);
            ctx.lineTo(gx + 4 + sway + footBend, GLOBALS.groundY - 10);
            ctx.lineTo(gx + 8, GLOBALS.groundY);
            ctx.fill();
        }

        // Subsurface Dirt Layer
        ctx.fillStyle = mapData.dirtColor; 
        ctx.fillRect(0, GLOBALS.groundY + 24, mapData.width, GLOBALS.height - GLOBALS.groundY);

        // 6. Draw Props (Trees, Capsule Houses, Namek Dragon Balls, Pillars)
        this.drawMapProps(ctx, camX, mapData);

        // 7. Draw Multi-Tier Platforms
        if (mapData.platforms) {
            this.drawPlatforms(ctx, camX, mapData.platforms);
        }

        // 8. Draw Energy Portals
        if (mapData.portals) {
            this.drawPortals(ctx, mapData.portals);
        }

        ctx.restore();
    },

    drawPlatforms: function(ctx, camX, platforms) {
        let time = GLOBALS.gameTime;
        platforms.forEach(p => {
            if (p.x + p.width < camX - 100 || p.x > camX + GLOBALS.width + 100) return;

            ctx.save();
            if (p.type === 'wood') {
                // Wooden Plank Platform
                ctx.fillStyle = '#6d4c41';
                ctx.fillRect(p.x, p.y, p.width, 18);
                ctx.fillStyle = '#8d6e63';
                ctx.fillRect(p.x, p.y, p.width, 5);
                
                // Iron Support Nails
                ctx.fillStyle = '#3e2723';
                for (let nx = p.x + 15; nx < p.x + p.width; nx += 40) {
                    ctx.fillRect(nx, p.y + 7, 3, 4);
                }
            } else if (p.type === 'stone' || p.type === 'moss_stone') {
                // Carved Stone Slab Platform
                ctx.fillStyle = '#37474f';
                ctx.fillRect(p.x, p.y, p.width, 22);
                ctx.fillStyle = p.type === 'moss_stone' ? '#2e7d32' : '#78909c';
                ctx.fillRect(p.x, p.y, p.width, 6);

                // Hanging Vines for Moss Stone
                if (p.type === 'moss_stone') {
                    ctx.fillStyle = '#1b5e20';
                    for (let vx = p.x + 20; vx < p.x + p.width - 15; vx += 35) {
                        ctx.beginPath();
                        ctx.arc(vx, p.y + 22, 6, 0, Math.PI);
                        ctx.fill();
                    }
                }
            } else if (p.type === 'crystal') {
                // Floating Namek Anti-Gravity Crystal Platform
                let floatY = Math.sin(time / 400 + p.x) * 4;
                ctx.fillStyle = '#0f766e';
                ctx.fillRect(p.x, p.y + floatY, p.width, 20);
                ctx.fillStyle = '#2dd4bf';
                ctx.fillRect(p.x, p.y + floatY, p.width, 6);

                // Underneath Anti-Gravity Glow Particles
                let glowG = ctx.createRadialGradient(p.x + p.width/2, p.y + floatY + 20, 5, p.x + p.width/2, p.y + floatY + 20, p.width/2);
                glowG.addColorStop(0, 'rgba(45, 212, 191, 0.6)');
                glowG.addColorStop(1, 'rgba(45, 212, 191, 0)');
                ctx.fillStyle = glowG;
                ctx.fillRect(p.x, p.y + floatY + 20, p.width, 30);
            } else if (p.type === 'marble') {
                // Tournament Marble Ring Platform
                ctx.fillStyle = '#eceff1';
                ctx.fillRect(p.x, p.y, p.width, 24);
                ctx.fillStyle = '#c62828'; // Red Carpet trim
                ctx.fillRect(p.x, p.y, p.width, 6);
                ctx.fillStyle = '#ffd54f'; // Gold Border
                ctx.fillRect(p.x, p.y + 6, p.width, 3);
            }
            ctx.restore();
        });
    },

    drawPortals: function(ctx, portals) {
        let time = GLOBALS.gameTime;
        portals.forEach(p => {
            let px = p.x + 30;
            let py = GLOBALS.groundY - 50;

            ctx.save();
            // Outer Energy Vortex Ring
            let radius = 35 + Math.sin(time / 200) * 3;
            let portalG = ctx.createRadialGradient(px, py, 5, px, py, radius);
            portalG.addColorStop(0, '#ffffff');
            portalG.addColorStop(0.4, '#00e5ff');
            portalG.addColorStop(0.8, '#7e57c2');
            portalG.addColorStop(1, 'rgba(126, 87, 194, 0)');

            ctx.fillStyle = portalG;
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();

            // Rotating Magic Rune Rays
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(time * 0.003);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 15, Math.sin(a) * 15);
                ctx.lineTo(Math.cos(a) * 32, Math.sin(a) * 32);
                ctx.stroke();
            }
            ctx.restore();

            // Floating Portal Pill Label Box
            ctx.fillStyle = 'rgba(10, 15, 28, 0.85)';
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2;
            let labelW = ctx.measureText(p.label).width + 24;
            ctx.beginPath();
            Utils.drawRoundRect(ctx, px - labelW/2, py - 65, labelW, 26, 13);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 13px "Roboto", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.label, px, py - 48);

            ctx.restore();
        });
    },

    drawMapProps: function(ctx, camX, mapData) {
        let bgType = mapData.bgType || 'village';

        // 1. Trees
        this.trees.forEach(t => {
            if (t.x > camX - 300 && t.x < camX + GLOBALS.width + 300) { 
                this.drawDragonBallTree(ctx, t.x, GLOBALS.groundY, t.scale, t.type);
            }
        });

        // 2. Capsule Corp House Domes in Village
        if (bgType === 'village') {
            [200, 1900].forEach(hx => {
                if (hx > camX - 200 && hx < camX + GLOBALS.width + 200) {
                    ctx.save();
                    ctx.translate(hx, GLOBALS.groundY);
                    
                    // Main Dome Base
                    ctx.fillStyle = '#eceff1';
                    ctx.beginPath();
                    ctx.arc(0, -35, 45, Math.PI, 0);
                    ctx.fill();
                    ctx.fillRect(-45, -35, 90, 35);
                    
                    // Roof Ring & Capsule Logo
                    ctx.fillStyle = '#ff9800';
                    ctx.fillRect(-47, -35, 94, 6);
                    ctx.fillStyle = '#0288d1';
                    ctx.beginPath();
                    ctx.arc(0, -55, 12, 0, Math.PI*2);
                    ctx.fill();
                    
                    // Door & Window
                    ctx.fillStyle = '#37474f';
                    ctx.fillRect(-12, -25, 24, 25);
                    ctx.fillStyle = '#ffeb3b';
                    ctx.fillRect(-32, -22, 14, 12);
                    ctx.fillRect(18, -22, 14, 12);
                    
                    ctx.restore();
                }
            });
        }

        // 3. Namekian Dragon Balls in Namek
        if (bgType === 'namek') {
            let dbX = 1800;
            if (dbX > camX - 200 && dbX < camX + GLOBALS.width + 200) {
                ctx.save();
                ctx.translate(dbX, GLOBALS.groundY - 10);
                for (let i = 0; i < 7; i++) {
                    let bx = (i - 3) * 22;
                    let by = -Math.abs(i - 3) * 4;
                    let ballG = ctx.createRadialGradient(bx - 3, by - 3, 2, bx, by, 10);
                    ballG.addColorStop(0, '#fff59d');
                    ballG.addColorStop(0.5, '#ffb74d');
                    ballG.addColorStop(1, '#f57c00');
                    ctx.fillStyle = ballG;
                    ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI*2); ctx.fill();
                    
                    // Star mark
                    ctx.fillStyle = '#d84315';
                    ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI*2); ctx.fill();
                }
                ctx.restore();
            }
        }

        // 4. Martial Arts Arena Red Pillars in Arena
        if (bgType === 'arena') {
            [600, 2400].forEach(px => {
                if (px > camX - 200 && px < camX + GLOBALS.width + 200) {
                    ctx.save();
                    ctx.translate(px, GLOBALS.groundY);
                    
                    ctx.fillStyle = '#c62828';
                    ctx.fillRect(-15, -130, 30, 130);
                    ctx.fillStyle = '#ffd54f';
                    ctx.fillRect(-18, -135, 36, 10);
                    ctx.fillRect(-18, -10, 36, 10);

                    // Red Hanging Streamer Flag
                    ctx.fillStyle = '#b71c1c';
                    ctx.beginPath();
                    ctx.moveTo(-12, -120);
                    ctx.lineTo(-35, -90);
                    ctx.lineTo(-12, -60);
                    ctx.fill();

                    ctx.restore();
                }
            });
        }
    },

    drawDragonBallTree: function(ctx, x, y, scale, type) {
        ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
        let sway = Math.sin(GLOBALS.gameTime/500 + x)*0.05; 
        ctx.rotate(sway);

        ctx.fillStyle = '#4e342e'; 
        ctx.fillRect(-10, -80, 20, 80);
        
        ctx.fillStyle = type===1 ? '#2e7d32' : '#00695c';
        ctx.beginPath();
        ctx.arc(0, -90, 45, 0, Math.PI*2);
        ctx.arc(-25, -70, 30, 0, Math.PI*2);
        ctx.arc(25, -70, 30, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = type===1 ? '#4caf50' : '#26a69a';
        ctx.beginPath(); ctx.arc(-10, -100, 20, 0, Math.PI*2); ctx.fill();
        
        ctx.restore();
    },

    drawParticles: function(ctx, camX, camY) {
        ctx.save(); ctx.translate(-camX, -camY);
        if (GLOBALS.state === 'LOGIN') { ctx.restore(); return; }

        let currentMap = MapManager.maps[MapManager.currentId];
        let bgType = currentMap ? currentMap.bgType : 'village';

        // 1. Lá cây rơi
        ctx.fillStyle = bgType === 'forest' ? '#10b981' : '#388e3c';
        this.leaves.forEach(l => {
            ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot);
            ctx.fillRect(-4, -2, 8, 4); ctx.restore();
        });

        // 2. Hạt đom đốm & bào tử phát sáng
        if (this.ambientParticles) {
            this.ambientParticles.forEach(ap => {
                if (ap.x < camX - 100 || ap.x > camX + GLOBALS.width + 100) return;
                
                let alpha = (Math.sin(ap.pulse) * 0.35 + 0.65);
                ctx.save();
                
                if (bgType === 'forest') {
                    // Đom đốm xanh lá
                    ctx.fillStyle = `rgba(118, 255, 3, ${alpha})`;
                    ctx.shadowColor = '#76ff03';
                    ctx.shadowBlur = 8;
                    ctx.beginPath(); ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2); ctx.fill();
                } else if (bgType === 'namek') {
                    // Bào tử năng lượng Namek
                    ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`;
                    ctx.shadowColor = '#2dd4bf';
                    ctx.shadowBlur = 10;
                    ctx.beginPath(); ctx.arc(ap.x, ap.y, ap.size, 0, Math.PI * 2); ctx.fill();
                } else if (bgType === 'arena') {
                    // Tàn tro lửa hoàng hôn
                    ctx.fillStyle = `rgba(255, 87, 34, ${alpha})`;
                    ctx.shadowColor = '#ff5722';
                    ctx.shadowBlur = 6;
                    ctx.beginPath(); ctx.arc(ap.x, ap.y, ap.size * 0.8, 0, Math.PI * 2); ctx.fill();
                } else {
                    // Phấn hoa anh đào
                    ctx.fillStyle = `rgba(255, 128, 171, ${alpha})`;
                    ctx.beginPath(); ctx.arc(ap.x, ap.y, ap.size * 0.8, 0, Math.PI * 2); ctx.fill();
                }
                
                ctx.restore();
            });
        }

        ctx.restore();
    }
};
