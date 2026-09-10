/* =========================================================================
   [SYSTEM] RENDERER PIXEL BLOCKY & ANIME HD CHO NHÂN VẬT
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { Utils } from '../utils/utils.js';

export const CharacterRenderer = {
    // Vẽ khối có đổ bóng Shading & Viền
    drawBlock: function (ctx, x, y, w, h, fill, shadowColor = null, noStroke = false) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);

        // Đổ bóng cạnh đáy khối (Ambient Occlusion)
        if (shadowColor) {
            ctx.fillStyle = shadowColor;
            ctx.fillRect(x, y + h - 3, w, 3);
        }

        if (!noStroke) {
            ctx.strokeRect(x, y, w, h);
        }
    },

    // Vẽ chi tiết chân tay với võ phục, đai găng & giày
    drawLimb: function (ctx, x, y, w, h, rot, color, accentColor, isLeg = false, shadowColor = 'rgba(0,0,0,0.18)') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);

        this.drawBlock(ctx, -w / 2, 0, w, h, color, shadowColor);

        if (accentColor) {
            if (isLeg) {
                // Giày võ sĩ anime (Boots)
                this.drawBlock(ctx, -w / 2 - 2, h - 8, w + 4, 8, accentColor);
                // Mũi giày vàng rực rỡ
                this.drawBlock(ctx, -w / 2 - 2, h, w + 6, 4, '#ffd54f');
                ctx.fillStyle = '#d32f2f';
                ctx.fillRect(-w / 2, h - 7, w, 2); // Viền đỏ chỉ giày
            } else {
                // Găng tay / Đai cổ tay (Wristbands)
                this.drawBlock(ctx, -w / 2 - 1, h - 6, w + 2, 6, accentColor);
                this.drawBlock(ctx, -w / 2, h, w, 4, color);
            }
        }
        ctx.restore();
    },

    // Vẽ tia sét điện Super Saiyan khi gồng năng lượng
    drawElectricSparks: function(ctx, x, y, size, time) {
        if (Math.sin(time / 60) < 0.2) return; // Nhấp nháy ngẫu nhiên
        ctx.save();
        ctx.strokeStyle = '#80d8ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let sx = x + Utils.rand(-size, size);
        let sy = y + Utils.rand(-size, size);
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Utils.rand(-10, 10), sy + Utils.rand(-10, 10));
        ctx.lineTo(sx + Utils.rand(-12, 12), sy + Utils.rand(-12, 12));
        ctx.stroke();
        ctx.restore();
    },

    draw: function (ctx, char) {
        ctx.save();
        ctx.translate(char.x + char.width / 2, char.y + char.height);
        ctx.scale(char.dir, 1);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#111';
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'square';

        if (char.hurtTimer > 0) {
            ctx.scale(1.18, 0.84); // Anime Impact Squash Deformation
            ctx.rotate(-0.12); // Hit Knockback Tilt Angle
            ctx.globalAlpha = (Math.floor(Date.now() / 50) % 2 === 0) ? 0.5 : 1;
        }
        
        // I-Frame Blinking
        if (char.invincibleTimer > 0 && char.hurtTimer <= 0) {
            ctx.globalAlpha = (Math.floor(Date.now() / 100) % 2 === 0) ? 0.4 : 0.8;
        }

        if (char.isChargingKame || char.isChargingPower) {
            ctx.translate(Utils.rand(-1.5, 1.5), Utils.rand(-1.5, 1.5)); 
        }

        let time = Date.now();
        let bobY = 0, legRot = 0, armRot = 0;
        if (char.state === 'idle') bobY = Math.floor(Math.sin(time / 200) * 2.5);
        else if (char.state === 'run') { bobY = Math.floor(Math.abs(Math.sin(time / 100)) * 4.5); legRot = Math.sin(time / 80) * 0.85; armRot = -legRot; }
        else if (char.state === 'jump') { legRot = 0.5; armRot = -0.8; }
        else if (char.state === 'charge' || char.state === 'powerup') { bobY = 2; legRot = 0.5; armRot = -0.5; }
        else if (char.state === 'dead') { ctx.rotate(Math.PI / 2); ctx.translate(-char.height / 2 + 10, -char.width / 2); }
        else if (char.state === 'attack') {
            let step = char.comboStep || 1;
            if (step === 1) { legRot = -0.25; armRot = 0.7; }
            else if (step === 2) { legRot = 1.35; armRot = -0.5; bobY = 2; } // Roundhouse Kick Pose
            else if (step === 3) { legRot = -0.4; armRot = -1.4; bobY = -8; } // Dragon Uppercut Rising Pose
        }

        const headS = 22, bodyW = 20, bodyH = 18, limbW = 8, limbH = 15;
        let waistY = -24; 
        
        let cSkin = char.colors.skin;
        let cPants = char.colors.outfit;
        let cAccent = char.colors.accent || '#000';
        let isSuper = char.isTransformed || (char.skillActive && char.raceKey === 'sayan') || (char.powerUpActive && char.raceKey === 'sayan');
        let cHair = isSuper ? '#ffe082' : char.colors.hair;

        // 1. KẾT XUẤT HÀO QUANG AURA DẠNG NGỌN LỬA ANIME VÀ TIA SÉT BỘC PHÁ
        if ((char.raceKey !== undefined && !char.isDead && (isSuper || char.state === 'attack' || char.state === 'shoot' || char.skillActive || char.powerUpActive || char.isChargingKame || char.isChargingPower)) && char.state !== 'dummy') {
            ctx.save();
            let auraSize = (isSuper || char.skillActive || char.powerUpActive || char.isChargingKame || char.isChargingPower) ? (isSuper ? 85 : 55) : 38;
            let pulse = Math.floor(Math.sin(time / 30) * 8);
            
            let auraColor = char.colors.aura;
            if (char.isChargingKame) auraColor = 'rgba(0, 229, 255, 0.55)';
            else if (char.isChargingPower) auraColor = 'rgba(171, 71, 188, 0.55)';
            else if (isSuper) auraColor = 'rgba(255, 215, 0, 0.65)';

            // Lớp Aura ngoạn mục 2 tầng (Glow + Flame Core)
            ctx.beginPath();
            ctx.moveTo(0, waistY - bodyH - headS - 18 - pulse);
            ctx.quadraticCurveTo(auraSize + 12, waistY - bodyH, 0, 16);
            ctx.quadraticCurveTo(-auraSize - 12, waistY - bodyH, 0, waistY - bodyH - headS - 18 - pulse);
            ctx.fillStyle = auraColor; ctx.fill();

            if (isSuper) {
                // Lớp ngọn lửa Vàng Kim Đỏ Lửa siêu linh thiêng
                ctx.beginPath();
                ctx.moveTo(0, waistY - bodyH - headS - 10 - pulse * 0.6);
                ctx.quadraticCurveTo(auraSize * 0.65, waistY - bodyH, 0, 10);
                ctx.quadraticCurveTo(-auraSize * 0.65, waistY - bodyH, 0, waistY - bodyH - headS - 10 - pulse * 0.6);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; ctx.fill();
            }

            // Sét điện bộc phá năng lượng
            if (isSuper || char.isChargingKame || char.isChargingPower) {
                this.drawElectricSparks(ctx, 0, waistY - bodyH, 40, time);
                this.drawElectricSparks(ctx, 0, waistY - bodyH - headS, 35, time + 100);
            }
            ctx.restore();
        }

        // Quả Cầu Kame Xoáy Chói Lóa ở Tay khi Gồng
        if (char.isChargingKame) {
            ctx.save();
            let orbX = -bodyW / 2 - 12;
            let orbY = waistY - bodyH / 2 + bobY;
            let pulse = Math.sin(time / 30) * 5;
            let radius = 18 + pulse;

            ctx.beginPath();
            ctx.arc(orbX, orbY, radius + 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
            ctx.fillStyle = '#00bcd4';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(orbX, orbY, radius * 0.6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(orbX, orbY, radius + 5, (radius + 5) * 0.35, time / 70, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }

        // 2. CÁC BỘ PHẬN THÂN THỂ (Limb back, Legs, Torso)
        // Tay sau
        this.drawLimb(ctx, -bodyW/2 + 2, waistY - bodyH + 2 + bobY, limbW, limbH, armRot, cSkin, cAccent, false);
        
        // 2 Chân
        this.drawLimb(ctx, -6, waistY + bobY, limbW+2, limbH, legRot, cPants, cAccent, true); 
        this.drawLimb(ctx, 6, waistY + bobY, limbW+2, limbH, -legRot, cPants, cAccent, true);

        // Khối Thân (Chest & Torso)
        let chestColor = (char.raceKey === 'sayan') ? cSkin : cPants;
        this.drawBlock(ctx, -bodyW/2, waistY - bodyH + bobY, bodyW, bodyH, chestColor, 'rgba(0,0,0,0.15)');

        // Chi tiết cơ bắp & trang phục
        if (char.raceKey === 'sayan') {
            // Ngực cơ bắp lực lưỡng Sayan + Cơ bụng 6 múi
            ctx.strokeStyle = '#8d5b4c'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(-bodyW/2 + 3, waistY - bodyH/2 + bobY - 2); ctx.lineTo(0, waistY - bodyH/2 + bobY + 2); ctx.lineTo(bodyW/2 - 3, waistY - bodyH/2 + bobY - 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, waistY - bodyH/2 + bobY + 2); ctx.lineTo(0, waistY + bobY - 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-4, waistY - bodyH/4 + bobY); ctx.lineTo(4, waistY - bodyH/4 + bobY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-4, waistY - bodyH/8 + bobY); ctx.lineTo(4, waistY - bodyH/8 + bobY); ctx.stroke();
            ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
        } else if (char.raceKey === 'namek') {
            // Mảng ngực hồngNamek
            ctx.fillStyle = '#e91e63';
            ctx.fillRect(-bodyW/4, waistY - bodyH + 3 + bobY, bodyW/2, bodyH/2 - 2);
            ctx.strokeRect(-bodyW/4, waistY - bodyH + 3 + bobY, bodyW/2, bodyH/2 - 2);
        } else if (char.raceKey === 'earth') {
            // Võ phục cổ V Trái Đất
            ctx.fillStyle = cAccent;
            ctx.beginPath(); 
            ctx.moveTo(-bodyW/2 + 2, waistY - bodyH + bobY); 
            ctx.lineTo(0, waistY - bodyH/2 + bobY); 
            ctx.lineTo(bodyW/2 - 2, waistY - bodyH + bobY); 
            ctx.fill(); ctx.stroke();
        }

        // Thắt lưng đai và Dải băng ruy-băng thả động
        this.drawBlock(ctx, -bodyW/2 - 2, waistY - 2 + bobY, bodyW + 4, 6, cAccent);
        let beltSway = Math.sin(time / 150) * 3;
        ctx.fillStyle = cAccent;
        ctx.beginPath();
        ctx.moveTo(-2, waistY + 4 + bobY);
        ctx.lineTo(-6 + beltSway, waistY + 14 + bobY);
        ctx.lineTo(0 + beltSway, waistY + 14 + bobY);
        ctx.lineTo(2, waistY + 4 + bobY);
        ctx.fill(); ctx.stroke();

        // Tay trước với tư thế đấm/đá/chưởng linh hoạt theo Combo Step
        let frontArmRot = -armRot;
        if (char.state === 'attack') {
            let step = char.comboStep || 1;
            if (step === 1) frontArmRot = -Math.PI / 1.5; // Thẳng tay đấm Jab
            else if (step === 2) frontArmRot = Math.PI / 3; // Co tay phòng thủ khi ra đòn đá
            else if (step === 3) frontArmRot = -Math.PI * 0.92; // Đấm bộc phá Dragon Uppercut chỉ trời
        } else if (char.state === 'shoot') frontArmRot = -Math.PI / 1.4;
        else if (char.state === 'charge' || char.state === 'powerup') frontArmRot = -Math.PI / 3.5; 
        this.drawLimb(ctx, bodyW/2 - 2, waistY - bodyH + 2 + bobY, limbW, limbH, frontArmRot, cSkin, cAccent, false);

        // 3. ĐẦU & NÉT MẶT ANIME CHI TIẾT
        let hy = waistY - bodyH - headS + bobY + 1;
        this.drawBlock(ctx, -headS/2, hy, headS, headS, cSkin, 'rgba(0,0,0,0.12)');

        // Tai Namek sắc nhọn & Râu ăng-ten
        if (char.raceKey === 'namek') {
            ctx.fillStyle = '#1b5e20';
            this.drawBlock(ctx, -headS/2 - 2, hy + 2, 4, 6, '#1b5e20');
            this.drawBlock(ctx, headS/2 - 2, hy + 2, 4, 6, '#1b5e20');
            
            // Ears cho Namek
            ctx.fillStyle = cSkin;
            ctx.beginPath(); ctx.moveTo(-headS/2, hy + 8); ctx.lineTo(-headS/2 - 7, hy + 3); ctx.lineTo(-headS/2, hy + 13); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(headS/2, hy + 8); ctx.lineTo(headS/2 + 7, hy + 3); ctx.lineTo(headS/2, hy + 13); ctx.fill(); ctx.stroke();
        }

        // Ánh nhìn & Mắt Võ Sĩ Anime (Eye Engine)
        ctx.fillStyle = '#000';
        if (char.state === 'attack' || char.state === 'shoot' || char.isChargingKame || char.isChargingPower) {
            // Mắt xếch chiến đấu mãnh liệt + Lông mày xếch
            ctx.beginPath(); ctx.moveTo(1, hy + 4); ctx.lineTo(9, hy + 8); ctx.lineTo(9, hy + 4); ctx.fill();
            // Con ngươi sáng chói
            ctx.fillStyle = isSuper ? '#00e5ff' : '#fff';
            ctx.fillRect(5, hy + 5, 2, 3);
        } else if (char.state === 'dead') {
            // Mắt X hạ gục
            ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(3, hy + 4); ctx.lineTo(8, hy + 9); ctx.moveTo(8, hy + 4); ctx.lineTo(3, hy + 9); ctx.stroke();
            ctx.strokeStyle = '#111';
        } else {
            // Mắt Anime sắc sảo + Lông mày
            ctx.fillRect(4, hy + 6, 5, 5); 
            ctx.fillStyle = '#fff'; ctx.fillRect(6, hy + 7, 2, 2); // Điểm sáng đồng tử
            ctx.fillStyle = '#000';
            ctx.fillRect(3, hy + 4, 6, 2); // Lông mày
        }

        // Miệng chiến đấu (Grit Mouth) khi chiêu thức
        if (char.state === 'charge' || char.state === 'powerup' || char.isChargingKame) {
            ctx.fillStyle = '#000';
            ctx.fillRect(3, hy + 14, 6, 3);
            ctx.fillStyle = '#fff';
            ctx.fillRect(4, hy + 15, 4, 1); // Răng nghiến
        }

        // 4. KIỂU TÓC KHỐI NHỌN NHIỀU TẦNG (SHADED ANIME HAIR)
        if (char.raceKey === 'sayan' || char.raceKey === 'earth') {
            if (isSuper) {
                // Tóc Super Saiyan Vàng Kim Nhiều Tầng & Đổ Bóng
                ctx.fillStyle = '#ffd54f'; // Tầng nền vàng kim
                ctx.beginPath();
                ctx.moveTo(-headS/2 - 5, hy + headS); 
                ctx.lineTo(-headS - 10, hy + 2); ctx.lineTo(-headS/2 - 2, hy - 2); ctx.lineTo(-headS - 14, hy - 16);
                ctx.lineTo(-headS/4, hy - 10); ctx.lineTo(-headS/2 - 4, hy - 28); ctx.lineTo(2, hy - 16);
                ctx.lineTo(headS/2 + 8, hy - 32); ctx.lineTo(headS/2, hy - 10); ctx.lineTo(headS + 14, hy - 18);
                ctx.lineTo(headS, hy); ctx.lineTo(headS + 12, hy + 6); ctx.lineTo(headS/2 + 5, hy + headS);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                
                // Mái vàng chói + highlight đỉnh gai
                ctx.fillStyle = '#fff59d';
                ctx.beginPath(); ctx.moveTo(-headS/4, hy); ctx.lineTo(0, hy + 7); ctx.lineTo(headS/4, hy); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, hy - 18); ctx.lineTo(headS/2 + 6, hy - 30); ctx.lineTo(headS/2, hy - 10); ctx.fill();
            } else {
                // Tóc Base Goku Đen Bóng Vàng/Xanh Đen
                ctx.fillStyle = cHair;
                ctx.beginPath();
                ctx.moveTo(-headS/2 - 2, hy + headS); 
                ctx.lineTo(-headS - 11, hy + 8); ctx.lineTo(-headS/2 - 2, hy + 2);
                ctx.lineTo(-headS - 15, hy - 4); ctx.lineTo(-headS/2, hy - 6);
                ctx.lineTo(-headS - 7, hy - 15); ctx.lineTo(-headS/4, hy - 8);
                ctx.lineTo(-headS/4, hy - 20); ctx.lineTo(2, hy - 10);
                ctx.lineTo(headS/2 + 3, hy - 22); ctx.lineTo(headS/2, hy - 6);
                ctx.lineTo(headS + 11, hy - 13); ctx.lineTo(headS - 2, hy - 2);
                ctx.lineTo(headS + 15, hy + 6); ctx.lineTo(headS/2 + 2, hy + 10);
                ctx.lineTo(headS/2 + 2, hy + headS);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                
                // Highlight xanh/xám bóng tóc Anime Toriyama
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.beginPath(); 
                ctx.moveTo(-headS/2 + 2, hy); ctx.lineTo(-headS/4, hy + 8); ctx.lineTo(0, hy + 2); 
                ctx.lineTo(headS/4, hy + 8); ctx.lineTo(headS/2 - 2, hy); 
                ctx.fill();
            }
        } else if (char.name && char.name.includes("Quái Cấp")) {
            // Quái vật Quỷ vương sừng nhọn & Mắt quỷ đỏ
            ctx.fillStyle = '#ff1744';
            ctx.fillRect(4, hy + 6, 4, 4); // Mắt đỏ quỷ
            ctx.fillStyle = '#fff';
            this.drawBlock(ctx, -headS/4, hy - 12, 5, 12, '#eceff1');
            this.drawBlock(ctx, headS/4 - 4, hy - 12, 5, 12, '#eceff1');
        }

        // Đòn đánh tay đao / Kame Charging Ball
        if (char.state === 'attack' && !char.isDead) {
            ctx.beginPath(); ctx.arc(28, -char.height / 2, 22, -Math.PI / 2, Math.PI / 4); ctx.lineWidth = 4; ctx.strokeStyle = 'white'; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(22, -char.height / 2); ctx.lineTo(44, -char.height / 2); ctx.strokeStyle = cHair; ctx.stroke();
        }
        
        if (char.isChargingKame) {
            ctx.fillStyle = '#00e5ff';
            ctx.shadowBlur = 15; ctx.shadowColor = '#00e5ff';
            ctx.beginPath(); ctx.arc(24, -12, Utils.rand(8, 14), 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();

        // 5. THANH MÁU & TÊN NHÂN VẬT ANIME PRESET
        if (char.name && !char.isDead && GLOBALS.state === 'PLAYING') {
            ctx.save();
            ctx.fillStyle = 'white';
            ctx.font = '900 12px "Roboto", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
            
            let nameY = char.y - 18;
            ctx.fillText(char.name, char.x + char.width / 2, nameY - 4);
            ctx.shadowBlur = 0;

            // Đáy viền thanh máu
            ctx.fillStyle = '#000'; ctx.fillRect(char.x - 2, nameY, char.width + 4, 6);
            ctx.fillStyle = (char.name.includes("Quái Cấp") || char.isBoss || char.name.includes("Boss")) ? '#ff1744' : '#4caf50';
            ctx.fillRect(char.x - 1, nameY + 1, (char.width + 2) * Math.max(0, char.hp / (char.maxHp || 1)), 4);
            ctx.restore();
        }
    }
};
