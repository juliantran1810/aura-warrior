/* =========================================================================
   [SYSTEM] MẠNG GIẢ LẬP (MOCK NETWORK)
   ========================================================================= */
import { GLOBALS } from '../config/globals.js';
import { Player } from '../entities/player.js';
import { UI } from '../ui/uiManager.js';

export class MockNetwork {
    constructor() {
        this.bots = [];
        setTimeout(() => {
            if (GLOBALS.state !== 'PLAYING') return;
            let b = new Player(600, 300, 'GokuFake', 'sayan');
            b.isBot = true;
            GLOBALS.entities.push(b);
            this.bots.push(b);
            UI.chatSys('GokuFake online.');
        }, 3000);
    }

    update(dt) {
        this.bots.forEach(b => {
            if (Math.random() < 0.01) {
                b.dir = Math.random() > 0.5 ? 1 : -1;
                b.vx = b.dir * b.speed;
            } else if (Math.random() < 0.02) {
                b.vx = 0;
            }
            if (Math.random() < 0.005 && b.isGrounded) b.vy = b.jumpForce;
        });
    }

    sendChat(name, msg) {
        let box = document.getElementById('chatMessages'); if (!box) return;
        let el = document.createElement('div'); el.className = 'msg-player';
        let span = document.createElement('span'); span.className = 'msg-name'; span.textContent = name + ': ';
        let textNode = document.createTextNode(msg); el.appendChild(span); el.appendChild(textNode);
        box.appendChild(el); box.scrollTop = box.scrollHeight;
    }
}
