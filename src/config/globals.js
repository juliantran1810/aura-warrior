/* =========================================================================
   [CORE] TRẠNG THÁI TOÀN CỤC (GLOBALS)
   ========================================================================= */
export const GLOBALS = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    width: window.innerWidth,
    height: window.innerHeight,
    groundY: window.innerHeight - 100,
    state: 'LOGIN', 
    isPaused: false,
    lastTime: 0,
    gameTime: 0, 
    camera: { x: 0, y: 0, shakeTime: 0, shakeIntensity: 0 },
    keys: {},
    isChatFocused: false,
    network: null,
    
    // Hệ thống Input Buffer
    inputBuffer: { code: null, time: 0 },
    hitStopTimer: 0,
    
    player: null,
    previewPlayer: null, 
    entities: [],
    projectiles: [],
    particles: [],
    texts: [],
    
    resize: function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        if (this.canvas) {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
        this.groundY = this.height - 100;
    }
};

window.addEventListener('resize', () => GLOBALS.resize());
GLOBALS.resize();
window.GLOBALS = GLOBALS;
