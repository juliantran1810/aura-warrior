/* =========================================================================
   [SYSTEM] SOUND SYSTEM (WEB AUDIO API SYNTHESIZER)
   ========================================================================= */
export const SoundSystem = {
    ctx: null,
    masterGain: null,
    sfxGain: null,
    bgmGain: null,
    isMuted: false,
    bgmInterval: null,
    currentBgm: null,

    init: function() {
        if (this.ctx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
            
            this.masterGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            this.bgmGain = this.ctx.createGain();
            
            this.sfxGain.gain.value = 0.5;
            this.bgmGain.gain.value = 0.2;
            
            this.sfxGain.connect(this.masterGain);
            this.bgmGain.connect(this.masterGain);
            this.masterGain.connect(this.ctx.destination);
            
            let savedMute = localStorage.getItem('aura_muted');
            if (savedMute === 'true') {
                this.setMute(true);
            }
        } catch (e) {
            console.warn('Web Audio API không được hỗ trợ:', e);
        }
    },

    resumeContext: function() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    setMute: function(mute) {
        this.isMuted = mute;
        localStorage.setItem('aura_muted', mute ? 'true' : 'false');
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(mute ? 0 : 1, this.ctx.currentTime);
        }
        let btn = document.getElementById('btnSoundToggle');
        if (btn) btn.innerText = mute ? '🔇 Tắt âm' : '🔊 Bật âm';
    },

    toggleMute: function() {
        this.resumeContext();
        this.setMute(!this.isMuted);
    },

    // --- SFX SYNTHESIZERS --- //

    // 1. Tiếng đấm / Đánh cận chiến
    playAttack: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    },

    // 2. Tiếng bắn Ki Blast (Đạn khí)
    playShoot: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.14);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.14);
    },

    // 3. Tiếng tích tụ năng lượng Kame Wave
    playKameCharge: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let lfo = this.ctx.createOscillator();
        let lfoGain = this.ctx.createGain();
        let gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.75);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(15, now);
        lfoGain.gain.setValueAtTime(40, now);

        lfo.connect(osc.frequency);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        lfo.start(now);
        osc.start(now);
        lfo.stop(now + 0.75);
        osc.stop(now + 0.75);
    },

    // 4. Tiếng xả chưởng Kame Wave bùng nổ
    playKameFire: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;

        // Bass drop wave
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.5);

        // Noise rumble
        this.playNoise(0.5, 0.4);
    },

    // 5. Tiếng gồng Power Up / Aura
    playPowerUp: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.6);
        osc.frequency.linearRampToValueAtTime(250, now + 1.2);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 1.2);
    },

    // 6. Tiếng nhảy vọt (Jump)
    playJump: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
    },

    // 7. Tiếng Kỹ năng chủng tộc (Skill Q)
    playSkill: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let notes = [329.63, 415.30, 493.88, 659.25]; // E, G#, B, E
        notes.forEach((freq, idx) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            let start = now + idx * 0.06;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.25, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + 0.2);
        });
    },

    // 7b. Tiếng Biến hình Super Saiyan / Biến hình chủng tộc (Key Z)
    playTransform: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
        notes.forEach((freq, idx) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            let start = now + idx * 0.08;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.35, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + 0.4);
        });
        this.playNoise(0.6, 0.4);
    },

    // 7c. Tiếng gầm gồng chiêu Boss
    playBossRoar: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(220, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.8);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.8);
    },

    // 8. Tiếng Trúng đòn / Chí mạng
    playHit: function(isCrit = false) {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();

        osc.type = isCrit ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(isCrit ? 220 : 120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + (isCrit ? 0.25 : 0.15));

        gain.gain.setValueAtTime(isCrit ? 0.6 : 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (isCrit ? 0.25 : 0.15));

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + (isCrit ? 0.25 : 0.15));

        if (isCrit) {
            this.playNoise(0.2, 0.3);
        }
    },

    // 9. Tiếng dùng bình Potion / Nhặt vật phẩm
    playItem: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            let start = now + idx * 0.05;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + 0.15);
        });
    },

    // 10. Tiếng Thăng cấp (Level Up Fanfare)
    playLevelUp: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            let start = now + idx * 0.08;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + 0.3);
        });
    },

    // 11. Tiếng Bấm nút UI (Click)
    playClick: function() {
        if (this.isMuted) return;
        this.resumeContext();
        if (!this.ctx) return;

        let now = this.ctx.currentTime;
        let osc = this.ctx.createOscillator();
        let gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.04);
    },

    // Utility: Tạo dải tiếng ồn (White noise rumble)
    playNoise: function(duration, volume = 0.2) {
        if (this.isMuted || !this.ctx) return;
        let bufferSize = this.ctx.sampleRate * duration;
        let buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        let output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        let whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = buffer;

        let filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);

        let gain = this.ctx.createGain();
        let now = this.ctx.currentTime;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        whiteNoise.start(now);
        whiteNoise.stop(now + duration);
    },

    // --- BGM SYNTHESIZER --- //
    playBGM: function(type) {
        if (this.currentBgm === type) return;
        this.stopBGM();
        this.currentBgm = type;
        if (!this.ctx) return;

        const chords = type === 'login' 
            ? [[261.63, 329.63, 392.00], [220.00, 261.63, 329.63], [174.61, 220.00, 261.63], [196.00, 246.94, 293.66]] // C - Am - F - G
            : [[220.00, 261.63, 329.63], [174.61, 220.00, 261.63], [261.63, 329.63, 392.00], [196.00, 246.94, 293.66]]; // Am - F - C - G

        let step = 0;
        const playChordStep = () => {
            if (this.isMuted || !this.ctx || this.currentBgm !== type) return;
            let now = this.ctx.currentTime;
            let currentChord = chords[step % chords.length];

            currentChord.forEach(freq => {
                let osc = this.ctx.createOscillator();
                let gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq / 2, now); // Octave down for warmth

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.04, now + 0.5);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

                osc.connect(gain);
                gain.connect(this.bgmGain);

                osc.start(now);
                osc.stop(now + 2.9);
            });

            step++;
        };

        playChordStep();
        this.bgmInterval = setInterval(playChordStep, 3000);
    },

    stopBGM: function() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        this.currentBgm = null;
    }
};
