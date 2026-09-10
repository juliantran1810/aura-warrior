/* =========================================================================
   [CONFIG] THÔNG SỐ GAME & DATABASE
   ========================================================================= */
export const CONFIG = {
    gravity: 0.6,
    friction: 0.8,
    maxFall: 15,
    MAX_PARTICLES: 400,
    races: {
        sayan: {
            title: 'Sayan',
            subtitle: 'Chiến binh cận chiến tối thượng',
            desc: 'Sayan là những chiến binh sinh ra để chiến đấu. Sở hữu lượng HP lớn, sát thương cao và khả năng bộc phát sức mạnh vượt trội, họ luôn áp đảo đối thủ trong những trận chiến trực diện.',
            pros: ['HP cao nhất', 'Sát thương cận chiến mạnh', 'Phòng thủ tốt', 'Power Up tăng sức mạnh vượt trội', 'Rất mạnh khi solo Boss và PvE'],
            maxHp: 250, maxMp: 70, baseDamage: 30, defense: 10, speed: 5.5, jumpForce: -12, maxExp: 110,
            levelGrowth: { hp: 35, mp: 8, damage: 8, defense: 3, expFactor: 1.35 },
            colors: { aura: 'rgba(255,235,59,0.4)', body: '#f47b16', hair: '#111111', skin: '#fcdcb6', outfit: '#f47b16', accent: '#0074c7', proj: '#ffeb3b' },
            skill: { name: 'Thịnh Nộ Sayan', desc: 'Giải phóng sức mạnh tiềm ẩn, tăng mạnh sức tấn công và bao phủ cơ thể bằng hào quang vàng rực.', cost: 20, cd: 8000, duration: 3000 }
        },
        namek: {
            title: 'Namek',
            subtitle: 'Bậc thầy sinh tồn',
            desc: 'Người Namek sở hữu nguồn năng lượng dồi dào cùng khả năng hồi phục vượt trội. Họ không gây sát thương lớn nhưng cực kỳ bền bỉ trong các trận chiến kéo dài.',
            pros: ['MP cao nhất', 'Khả năng hồi phục mạnh', 'Có khiên bảo vệ', 'Chống chịu rất tốt', 'Phù hợp lối chơi phòng thủ và hỗ trợ'],
            maxHp: 180, maxMp: 200, baseDamage: 20, defense: 8, speed: 4.8, jumpForce: -11, maxExp: 100,
            levelGrowth: { hp: 25, mp: 25, damage: 5, defense: 2, expFactor: 1.25 },
            colors: { aura: 'rgba(0,255,128,0.3)', body: '#4a148c', hair: '#2e7d32', skin: '#81c784', outfit: '#4a148c', accent: '#ff1744', proj: '#00e5ff' },
            skill: { name: 'Hồi Phục & Khiên Năng Lượng', desc: 'Hồi phục sinh lực đồng thời tạo lá chắn giúp giảm sát thương trong một khoảng thời gian.', cost: 30, cd: 10000, duration: 4000 }
        },
        earth: {
            title: 'Trái Đất',
            subtitle: 'Chiến binh tốc độ',
            desc: 'Con người chiến đấu bằng sự linh hoạt, tốc độ và kỹ năng võ thuật. Họ dễ dàng né tránh đòn đánh, thực hiện combo liên tục và kiểm soát giao tranh bằng khả năng cơ động.',
            pros: ['Tốc độ di chuyển nhanh nhất', 'Nhảy cao nhất', 'Cơ động vượt trội', 'Combo mượt và linh hoạt', 'Phù hợp với người chơi thích kỹ năng'],
            maxHp: 160, maxMp: 80, baseDamage: 24, defense: 5, speed: 6.5, jumpForce: -13, maxExp: 95,
            levelGrowth: { hp: 22, mp: 10, damage: 6, defense: 1, expFactor: 1.15 },
            colors: { aura: 'rgba(0,150,255,0.3)', body: '#d32f2f', hair: '#000000', skin: '#ffe0b2', outfit: '#d32f2f', accent: '#111111', proj: '#80d8ff' },
            skill: { name: 'Bước Nhanh', desc: 'Gia tăng mạnh tốc độ di chuyển trong thời gian ngắn, giúp áp sát hoặc rút lui cực kỳ hiệu quả.', cost: 15, cd: 7000, duration: 3000 }
        }
    },
    animations: {
        idle: { frames: 4, speed: 200, loop: true },
        run: { frames: 6, speed: 100, loop: true },
        jump: { frames: 1, speed: 1000, loop: false },
        attack: { frames: 3, speed: 100, loop: false },
        shoot: { frames: 3, speed: 100, loop: false },
        hurt: { frames: 2, speed: 100, loop: false },
        dead: { frames: 1, speed: 1000, loop: false },
        charge: { frames: 4, speed: 80, loop: true },
        powerup: { frames: 4, speed: 80, loop: true }
    }
};

export const RARITY_COLORS = {
    'common': '#b0bec5',    // Xám
    'uncommon': '#69f0ae',  // Xanh lá
    'rare': '#40c4ff',      // Xanh dương
    'epic': '#e040fb',      // Tím
    'legendary': '#ffd54f'  // Vàng
};

export const ITEMS_DB = {
    'hp_potion_small': { name: 'Bình Máu Nhỏ', desc: 'Hồi phục nhanh 50 HP.', type: 'Tiêu hao', rarity: 'common', icon: '🧪', heal: 50 },
    'hp_potion_big': { name: 'Bình Máu Lớn', desc: 'Hồi phục mạnh 150 HP.', type: 'Tiêu hao', rarity: 'uncommon', icon: '❤️', heal: 150 },
    'mp_potion_small': { name: 'Bình Năng Lượng Nhỏ', desc: 'Khôi phục 50 MP.', type: 'Tiêu hao', rarity: 'common', icon: '🔵', mp: 50 },
    'mp_potion_big': { name: 'Bình Năng Lượng Lớn', desc: 'Khôi phục 150 MP.', type: 'Tiêu hao', rarity: 'uncommon', icon: '💧', mp: 150 },
    'revive_bean': { name: 'Đậu Hồi Phục', desc: 'Khôi phục 100% HP và MP.', type: 'Đặc biệt', rarity: 'legendary', icon: '🫘' },
    'power_stone': { name: 'Đá Sức Mạnh', desc: 'Cường hóa cơ thể, tăng vĩnh viễn 2 DMG.', type: 'Nâng cấp', rarity: 'rare', icon: '🔥' },
    'defense_stone': { name: 'Đá Phòng Thủ', desc: 'Tăng cường độ cứng cáp, tăng vĩnh viễn 1 DEF.', type: 'Nâng cấp', rarity: 'rare', icon: '🛡️' },
    'speed_stone': { name: 'Đá Tốc Độ', desc: 'Cơ thể nhẹ nhàng, tăng vĩnh viễn 0.2 Tốc độ.', type: 'Nâng cấp', rarity: 'epic', icon: '⚡' },
    'skill_fragment': { name: 'Mảnh Kỹ Năng', desc: 'Nguyên liệu kỳ bí dùng để thức tỉnh kỹ năng.', type: 'Nguyên liệu', rarity: 'epic', icon: '✨' },
    'teleport_ticket': { name: 'Vé Dịch Chuyển', desc: 'Lập tức dịch chuyển về Làng Khởi Đầu.', type: 'Tiêu hao', rarity: 'uncommon', icon: '🎫' },
    'wood_chest': { name: 'Rương Gỗ', desc: 'Bên trong chứa các vật phẩm cơ bản.', type: 'Rương', rarity: 'common', icon: '📦' },
    'rare_chest': { name: 'Rương Hiếm', desc: 'Tỏa ra hào quang, chứa vật phẩm quý giá.', type: 'Rương', rarity: 'epic', icon: '🎁' },
    'green_gem': { name: 'Ngọc Xanh', desc: 'Đá quý mang năng lượng sinh mệnh.', type: 'Ngọc', rarity: 'uncommon', icon: '🟢' },
    'red_gem': { name: 'Ngọc Đỏ', desc: 'Đá quý mang năng lượng hủy diệt.', type: 'Ngọc', rarity: 'rare', icon: '🔴' },
    'gold_gem': { name: 'Ngọc Vàng', desc: 'Bảo vật rực rỡ hiếm có.', type: 'Ngọc', rarity: 'legendary', icon: '🟡' }
};
