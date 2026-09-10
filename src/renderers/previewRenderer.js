/* =========================================================================
   [SYSTEM] PREVIEW RENDERER CHUYÊN DỤNG (NÂNG CẤP ĐỒ HỌA HD CHO LOGIN SCREEN)
   ========================================================================= */
export const PreviewRenderer = {
    drawRect: function (ctx, x, y, w, h, fill, shadowColor = null) {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, w, h);
        if (shadowColor) {
            ctx.fillStyle = shadowColor;
            ctx.fillRect(x, y + h - 2, w, 2);
        }
        ctx.strokeRect(x, y, w, h);
    },

    draw: function (ctx, char, time) {
        ctx.save();
        ctx.translate(50, 75); // Căn trục đứng bệ đứng preview
        let scale = 1.65; ctx.scale(scale, scale);

        let isSuper = char.skillActive && char.raceKey === 'sayan';
        let bobY = Math.sin(time / 180) * 2.5; // Chuyển động nhún thở động mượt hơn
        let auraPulse = Math.sin(time / 70) * 5;

        // 1. Tạo hiệu ứng Aura phản chiếu lan tỏa dưới bệ đứng
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        let floorAura = ctx.createRadialGradient(0, 5, 2, 0, 5, 32 + auraPulse);
        floorAura.addColorStop(0, char.colors.aura.replace('0.4', '0.35'));
        floorAura.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = floorAura;
        ctx.fillRect(-45, -10, 90, 20);
        ctx.restore();

        // 2. Thể hiện Bệ đứng kiên cố vững chắc cho preview nhân vật
        ctx.lineWidth = 2; ctx.strokeStyle = '#222';
        this.drawRect(ctx, -28, 0, 56, 6, '#333');
        this.drawRect(ctx, -24, 6, 48, 4, '#111');

        // 3. Kết xuất hào quang Aura bốc cháy nhiều tầng (Lighter Blend)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        let auraColor = char.colors.aura;
        if (isSuper) auraColor = 'rgba(255, 235, 59, 0.6)';

        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(0, -22 - bobY, 30 + auraPulse - i * 6, 44 + auraPulse - i * 5, 0, 0, Math.PI * 2);
            ctx.fillStyle = auraColor; ctx.fill();
        }

        // Tia sét Super Saiyan ở sảnh preview
        if (isSuper && Math.sin(time / 50) > 0.3) {
            ctx.strokeStyle = '#80d8ff'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-15, -20); ctx.lineTo(-22, -35); ctx.lineTo(-12, -45);
            ctx.moveTo(18, -15); ctx.lineTo(24, -30); ctx.lineTo(16, -42);
            ctx.stroke();
        }
        ctx.restore();

        // Cấu hình nét vẽ đen viền cứng cáp bao bọc nhân vật
        ctx.lineWidth = 1.8; ctx.strokeStyle = '#111'; ctx.lineJoin = 'miter';

        let headS = 18, bodyW = 16, bodyH = 18, limbW = 6, limbH = 12;
        let cSkin = char.colors.skin; let cOutfit = char.colors.outfit;
        let cAccent = char.colors.accent; let cHair = isSuper ? '#ffe082' : char.colors.hair;

        // Tay sau thủ thế khuất sau thân
        ctx.save(); ctx.translate(-bodyW / 2, -bodyH + bobY); ctx.rotate(0.5);
        this.drawRect(ctx, -limbW / 2, 0, limbW, limbH, cSkin, 'rgba(0,0,0,0.15)');
        this.drawRect(ctx, -limbW / 2 - 1, limbH - 4, limbW + 2, 4, cAccent);
        ctx.restore();

        // 2 Chân dạng rộng tấn đứng oai nghiêm oai phong lẫm liệt
        ctx.save(); ctx.translate(-6, bobY); ctx.rotate(0.25);
        this.drawRect(ctx, -limbW / 2, 0, limbW + 2, limbH, cOutfit, 'rgba(0,0,0,0.15)');
        this.drawRect(ctx, -limbW / 2 - 1, limbH - 4, limbW + 4, 6, cAccent);
        this.drawRect(ctx, -limbW / 2 - 1, limbH, limbW + 4, 3, '#ffd54f'); // Mũi giày vàng
        ctx.restore();

        ctx.save(); ctx.translate(6, bobY); ctx.rotate(-0.25);
        this.drawRect(ctx, -limbW / 2, 0, limbW + 2, limbH, cOutfit, 'rgba(0,0,0,0.15)');
        this.drawRect(ctx, -limbW / 2 - 1, limbH - 4, limbW + 4, 6, cAccent);
        this.drawRect(ctx, -limbW / 2 - 1, limbH, limbW + 4, 3, '#ffd54f'); // Mũi giày vàng
        ctx.restore();

        // Khối thân giáp ngực trần lực lưỡng / Võ phục
        if (char.raceKey === 'sayan') {
            this.drawRect(ctx, -bodyW / 2, -bodyH + bobY, bodyW, bodyH, cSkin, 'rgba(0,0,0,0.15)');
            ctx.strokeStyle = '#8d5b4c'; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(-bodyW / 2 + 2, -bodyH / 2 + bobY); ctx.lineTo(bodyW / 2 - 2, -bodyH / 2 + bobY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -bodyH / 2 + bobY); ctx.lineTo(0, bobY); ctx.stroke();
            ctx.strokeStyle = '#111'; ctx.lineWidth = 1.8;
        } else if (char.raceKey === 'namek') {
            this.drawRect(ctx, -bodyW / 2, -bodyH + bobY, bodyW, bodyH, cOutfit, 'rgba(0,0,0,0.15)');
            this.drawRect(ctx, -bodyW / 2 - 3, -bodyH + bobY, bodyW + 6, 4, '#fff');
            ctx.fillStyle = '#e91e63'; ctx.fillRect(-4, -bodyH + 6 + bobY, 8, 6);
        } else {
            this.drawRect(ctx, -bodyW / 2, -bodyH + bobY, bodyW, bodyH, cOutfit, 'rgba(0,0,0,0.15)');
            ctx.beginPath(); ctx.moveTo(-bodyW / 2, -bodyH + bobY); ctx.lineTo(0, -bodyH / 2 + bobY); ctx.lineTo(bodyW / 2, -bodyH + bobY); ctx.fillStyle = cSkin; ctx.fill(); ctx.stroke();
        }

        // Thắt lưng dải tà đai buông thả động
        this.drawRect(ctx, -bodyW / 2 - 1, -4 + bobY, bodyW + 2, 4, cAccent);
        let sashSway = Math.sin(time / 160) * 3;
        ctx.fillStyle = cAccent;
        ctx.beginPath(); ctx.moveTo(-2, bobY); ctx.lineTo(-5 + sashSway, 10 + bobY); ctx.lineTo(0 + sashSway, 10 + bobY); ctx.lineTo(2, bobY); ctx.fill(); ctx.stroke();

        // Tay trước đưa cao thế thủ chiến đấu
        ctx.save(); ctx.translate(bodyW / 2, -bodyH + 3 + bobY); ctx.rotate(-0.6);
        this.drawRect(ctx, -limbW / 2, 0, limbW, limbH, cSkin);
        this.drawRect(ctx, -limbW / 2 - 1, limbH - 4, limbW + 2, 4, cAccent);
        ctx.restore();

        // Đầu mặt & Ánh nhìn Võ sĩ Anime
        let hy = -bodyH - headS + bobY + 2;
        this.drawRect(ctx, -headS / 2, hy, headS, headS, cSkin);

        if (char.raceKey === 'namek') {
            ctx.fillStyle = '#1b5e20';
            this.drawRect(ctx, -headS / 2 - 2, hy + 2, 3, 5, '#1b5e20');
            this.drawRect(ctx, headS/2 - 1, hy + 2, 3, 5, '#1b5e20');
            ctx.beginPath(); ctx.moveTo(-headS / 2, hy + 8); ctx.lineTo(-headS / 2 - 7, hy + 4); ctx.lineTo(-headS / 2, hy + 12); ctx.fillStyle = cSkin; ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(headS / 2, hy + 8); ctx.lineTo(headS / 2 + 7, hy + 4); ctx.lineTo(headS / 2, hy + 12); ctx.fillStyle = cSkin; ctx.fill(); ctx.stroke();
        }

        // Mắt sắc lẹm + Đồng tử highlight
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.moveTo(-3, hy + 7); ctx.lineTo(-7, hy + 10); ctx.lineTo(-3, hy + 10); ctx.fill();
        ctx.beginPath(); ctx.moveTo(3, hy + 7); ctx.lineTo(7, hy + 10); ctx.lineTo(3, hy + 10); ctx.fill();
        ctx.fillStyle = isSuper ? '#00e5ff' : '#fff';
        ctx.fillRect(-5, hy + 8, 2, 2); ctx.fillRect(4, hy + 8, 2, 2);

        // Kiểu tóc khối nhọn đổ bóng nhiều tầng
        ctx.fillStyle = cHair;
        if (char.raceKey === 'sayan') {
            if (isSuper) {
                ctx.fillStyle = '#ffd54f';
                ctx.beginPath();
                ctx.moveTo(-headS / 2 - 5, hy + headS); ctx.lineTo(-headS - 14, hy + 2);
                ctx.lineTo(-headS / 2 - 3, hy - 1); ctx.lineTo(-headS - 18, hy - 17);
                ctx.lineTo(-headS / 4, hy - 10); ctx.lineTo(-headS / 2 - 6, hy - 34);
                ctx.lineTo(0, hy - 18); ctx.lineTo(headS / 2 + 6, hy - 34);
                ctx.lineTo(headS / 4, hy - 10); ctx.lineTo(headS + 18, hy - 17);
                ctx.lineTo(headS / 2 + 3, hy - 1); ctx.lineTo(headS + 14, hy + 2);
                ctx.lineTo(headS / 2 + 5, hy + headS);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                
                ctx.fillStyle = '#fff59d';
                ctx.beginPath(); ctx.moveTo(0, hy - 18); ctx.lineTo(headS / 2 + 6, hy - 32); ctx.lineTo(headS / 4, hy - 10); ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(-headS / 2 - 5, hy + headS); ctx.lineTo(-headS - 14, hy + 2);
                ctx.lineTo(-headS / 2 - 3, hy - 1); ctx.lineTo(-headS - 18, hy - 17);
                ctx.lineTo(-headS / 4, hy - 10); ctx.lineTo(-headS / 2 - 6, hy - 34);
                ctx.lineTo(0, hy - 18); ctx.lineTo(headS / 2 + 6, hy - 34);
                ctx.lineTo(headS / 4, hy - 10); ctx.lineTo(headS + 18, hy - 17);
                ctx.lineTo(headS / 2 + 3, hy - 1); ctx.lineTo(headS + 14, hy + 2);
                ctx.lineTo(headS / 2 + 5, hy + headS);
                ctx.closePath(); ctx.fill(); ctx.stroke();
                
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.beginPath(); ctx.moveTo(-headS/4, hy); ctx.lineTo(0, hy + 5); ctx.lineTo(headS/4, hy); ctx.fill();
            }
        } else if (char.raceKey === 'earth') {
            ctx.beginPath();
            ctx.moveTo(-headS / 2, hy + headS / 2); ctx.lineTo(-headS / 2 - 8, hy - 2);
            ctx.lineTo(-headS / 3, hy - 9); ctx.lineTo(0, hy - 16);
            ctx.lineTo(headS / 3, hy - 9); ctx.lineTo(headS / 2 + 8, hy - 25);
            ctx.lineTo(headS / 2, hy + headS / 2);
            ctx.fill(); ctx.stroke();
        }

        ctx.restore();
    }
};
