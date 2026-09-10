/* =========================================================================
   [UTILS] CÔNG CỤ HỖ TRỢ (MATH, PARTICLES, TEXTS, CAMERA EFFECTS)
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { CONFIG } from '../config/config.js';

export const Utils = {
    checkAABB: (r1, r2) => (
        r1.x < r2.x + r2.width &&
        r1.x + r1.width > r2.x &&
        r1.y < r2.y + r2.height &&
        r1.y + r1.height > r2.y
    ),

    rand: (min, max) => Math.random() * (max - min) + min,

    spawnText: (x, y, text, color, isCrit = false) => {
        GLOBALS.texts.push({ x, y, text, color, life: 60, maxLife: 60, vy: -2, isCrit });
    },

    spawnParticles: (x, y, color, count) => {
        if (GLOBALS.particles.length > CONFIG.MAX_PARTICLES) return; 
        let maxSpawn = Math.min(count, CONFIG.MAX_PARTICLES - GLOBALS.particles.length);
        for (let i = 0; i < maxSpawn; i++) {
            GLOBALS.particles.push({
                x, y,
                vx: Utils.rand(-5, 5),
                vy: Utils.rand(-5, 5),
                life: Utils.rand(10, 30),
                color,
                size: Utils.rand(2, 5)
            });
        }
    },

    screenShake: (intensity, time) => {
        GLOBALS.camera.shakeIntensity = intensity;
        GLOBALS.camera.shakeTime = time;
    },

    screenFlash: () => {
        let flash = document.getElementById('screenFlash');
        if (flash) {
            flash.style.opacity = 1;
            setTimeout(() => flash.style.opacity = 0, 50);
        }
    },

    drawRoundRect: (ctx, x, y, w, h, r = 4) => {
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, w, h, r);
        } else {
            ctx.rect(x, y, w, h);
        }
    }
};
