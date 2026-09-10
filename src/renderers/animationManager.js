/* =========================================================================
   [SYSTEM] QUẢN LÝ ANIMATION
   ========================================================================= */
import { CONFIG } from '../config/config.js';

export const AnimationManager = {
    updateState: function(char, dt) {
        if (char.isDead) { char.state = 'dead'; return; }
        
        char.animTimer += dt;
        let config = CONFIG.animations[char.state];
        if (!config) return;
        
        if (char.animTimer > config.speed) {
            char.animTimer = 0;
            char.animFrame++;
            if (char.animFrame >= config.frames) {
                if (config.loop) char.animFrame = 0;
                else {
                    char.state = 'idle';
                    char.animFrame = 0;
                }
            }
        }
    }
};
