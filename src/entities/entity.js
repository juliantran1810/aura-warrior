/* =========================================================================
   [ENTITIES] LỚP CƠ SỞ ENTITY
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { CONFIG } from '../config/config.js';
import { MapManager } from '../systems/mapManager.js';
import { AnimationManager } from '../renderers/animationManager.js';

export class Entity {
    constructor(x, y, w, h) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.x = x; this.y = y; this.width = w; this.height = h;
        this.vx = 0; this.vy = 0; this.dir = 1; this.isGrounded = false;
        
        this.state = 'idle'; 
        this.animFrame = 0; this.animTimer = 0;
        this.invincibleTimer = 0;
        this.hurtTimer = 0;
    }

    update(dt) {
        let oldY = this.y;
        this.vy += CONFIG.gravity;
        if (this.vy > CONFIG.maxFall) this.vy = CONFIG.maxFall;
        this.x += this.vx; 
        this.y += this.vy;
        
        let oldFeet = oldY + this.height;
        let newFeet = this.y + this.height;

        let isLanded = false;
        let mapData = MapManager.maps[MapManager.currentId];

        // 1. Check floating platforms in the map (land when falling vy >= 0)
        if (this.vy >= 0 && mapData && mapData.platforms) {
            for (let plat of mapData.platforms) {
                let isHorizOverlap = (this.x + this.width > plat.x) && (this.x < plat.x + plat.width);
                if (isHorizOverlap && oldFeet <= plat.y + 6 && newFeet >= plat.y) {
                    this.y = plat.y - this.height;
                    this.vy = 0;
                    this.isGrounded = true;
                    isLanded = true;
                    break;
                }
            }
        }

        // 2. Check main ground level
        if (!isLanded) {
            if (this.y + this.height > GLOBALS.groundY) {
                this.y = GLOBALS.groundY - this.height;
                this.vy = 0;
                this.isGrounded = true;
            } else {
                this.isGrounded = false;
            }
        }
        
        if (this.x < 0) this.x = 0;
        let mw = mapData ? mapData.width : GLOBALS.width;
        if (this.x > mw - this.width) this.x = mw - this.width;
        
        this.vx *= CONFIG.friction;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        
        if (this.invincibleTimer > 0) this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
        if (this.hurtTimer > 0) this.hurtTimer = Math.max(0, this.hurtTimer - dt);
        AnimationManager.updateState(this, dt);
    }
}
