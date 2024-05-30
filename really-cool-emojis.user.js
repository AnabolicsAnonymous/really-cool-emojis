// ==UserScript==
// @name         really-cool-emojis
// @version      0.4
// @namespace    https://github.com/frenchcutgreenbean/
// @description  chatbox emojis and img
// @author       dantayy
// @match        https://blutopia.cc/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=blutopia.cc
// @grant        GM_addStyle
// @license      GPL-3.0-or-later
// ==/UserScript==

(function () {
    'use strict';

    const emojis = {
        "comedy": "https://ptpimg.me/x0rx70.png",
        "counting": "https://ptpimg.me/59emhk.gif",
        "feltcute": "https://ptpimg.me/20180i.png",
        "giggle": "https://ptpimg.me/f9opi2.png",
        "huh": "https://ptpimg.me/12kx8m.gif",
        "rage": "https://ptpimg.me/cqu9qr.gif",
        "reallymad": "https://ptpimg.me/znro3o.png",
        "reallysad": "https://ptpimg.me/m9f985.png",
        "slightlymad": "https://ptpimg.me/ut9wv7.png",
        "ultramad": "https://ptpimg.me/vbg6q3.png",
        "yawn": "https://ptpimg.me/l4l3r6.png",
        "whatda": "https://i.ibb.co/YTDbxm1/WHAT.gif",
        "feet": "https://ptpimg.me/622oxi.png",
        "sleepy": "https://i.ibb.co/b5Svttf/sleepy.gif",
        "sadd": "https://i.ibb.co/CV28H5h/sad.gif",
        "joe": "https://i.ibb.co/JBncpnh/OOOOO.gif",
        "chatting": "https://i.ibb.co/jTYXKTg/chatting.gif",
        "ayo": "https://i.ibb.co/Vx9jZB9/ayo.gif",
        "bratwu": "https://i.ibb.co/k834WdR/bratwur.png",
        ":o": "https://i.ibb.co/1Z0sS6J/OO.png",
        "o7": "https://i.ibb.co/5sqKm4Y/o7.png",
    };

    let chatboxHeader, chatForm;
    const emojiMenu = document.createElement("div");
    emojiMenu.className = "emoji-content";

    for (const [key, value] of Object.entries(emojis)) {
        const emojiItem = document.createElement("div");
        emojiItem.classList.add("emoji-item");
        emojiItem.style.backgroundImage = `url(${value})`;
        emojiItem.addEventListener("click", () => onEmojiclick(value));
        emojiMenu.appendChild(emojiItem);
    }

    function onEmojiclick(image) {
        const emoji = `[img=42]${image}[/img]`;
        chatForm.value = chatForm.value ? `${chatForm.value.trim()} ${emoji}` : emoji;
        chatForm.focus()
    }

    function handleInputChange(e) {
        const regex = /^http.*\.(jpg|jpeg|png|gif|bmp|webp)$/i;
        const message = e.target.value.trim();

        const autofill = JSON.parse(localStorage.getItem('autofill') || 'false');
        const useImgTag = JSON.parse(localStorage.getItem('useImgTag') || 'false');

        if (autofill && emojis[message]) {
            chatForm.value = `[img=42]${emojis[message]}[/img]`;
            return;
        }

        if (useImgTag && message.startsWith('!') && message.includes('http')) {
            let m = message.split(' ');
            let num = m[0].substring(1);
            let url = m[1].trim();
            if (!regex.test(url)) return;
            if (parseInt(num)) {
                chatForm.value = `[img=${num}]${m[1]}[/img]`;
                return;
            }
        }
    }

    function createModal() {
        const existingMenu = document.getElementById('emoji-menu');
        if (existingMenu) {
            existingMenu.style.display = existingMenu.style.display === 'none' ? 'block' : 'none';
            return;
        }

        const modalStyler = `
            .emoji-menu {
                position: fixed;
                border-radius: 5px;
                z-index: 1;
                left: 60%;
                top: 20%;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
            }
            .emoji-content {
                background-color: #1C1C1C;
                color: #CCCCCC;
                margin: 15% auto;
                padding: 20px;
                max-width: 300px;
                position: relative;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            .emoji-item {
                width: 40px;
                height: 40px;
                cursor: pointer;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                transition: transform 0.1s;
            }
            .emoji-item:hover {
                transform: scale(1.1);
            }
            .menu-close, .menu-settings {
                background-color: transparent;
                color: #BBBBBB;
                position: absolute;
                top: 10px;
                padding: 5px;
                border: 0;
                cursor: pointer;
                transition: opacity 0.1s;
            }
            .menu-close:hover, .menu-settings:hover {
                opacity: 0.8;
            }
            .menu-close {
                right: 40px;
            }
            .menu-settings {
                right: 10px;
            }
            .settings-menu {
                background-color: #2C2C2C;
                color: #CCCCCC;
                padding: 20px;
                border-radius: 5px;
                position: absolute;
                top: 50px;
                right: 10px;
                z-index: 2;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            .emoji__config {
                margin-bottom: 10px;
            }
        `;

        GM_addStyle(modalStyler);

        const modal = document.createElement("div");
        modal.className = "emoji-menu";
        modal.id = "emoji-menu";

        const closeButton = document.createElement("button");
        closeButton.className = "menu-close";
        closeButton.textContent = "Close";
        closeButton.onclick = () => modal.style.display = "none";

        const settingsButton = document.createElement("button");
        settingsButton.className = "menu-settings";
        settingsButton.textContent = "⚙️";
        settingsButton.onclick = () => settingsMenu.style.display = settingsMenu.style.display === "none" ? "block" : "none";

        const settingsMenu = document.createElement("div");
        settingsMenu.className = "settings-menu";
        settingsMenu.style.display = "none";
        settingsMenu.innerHTML = `
            <h3>Settings</h3>
            <div class="emoji__config"> 
            <label for="autofill_cb">Autofill emoji name?</label>
            <input type="checkbox" id="autofill_cb">
            </div>
            <div class="emoji__config"> 
            <label for="img_cb">img tag command?</label>
            <input type="checkbox" id="img_cb">
            </div>
        `;

        settingsMenu.querySelector('#autofill_cb').addEventListener('change', (e) => {
            localStorage.setItem('autofill', e.target.checked);
        });

        settingsMenu.querySelector('#img_cb').addEventListener('change', (e) => {
            localStorage.setItem('useImgTag', e.target.checked);
        });

        modal.appendChild(closeButton);
        modal.appendChild(settingsButton);
        modal.appendChild(settingsMenu);
        modal.appendChild(emojiMenu);
        document.body.appendChild(modal);

        initializeSettings();
    }

    function initializeSettings() {
        document.getElementById('autofill_cb').checked = JSON.parse(localStorage.getItem('autofill') || 'false');
        document.getElementById('img_cb').checked = JSON.parse(localStorage.getItem('useImgTag') || 'false');
    }
    function addEmojiButton() {
        chatboxHeader = document.querySelector('#chatbox_header div');
        chatForm = document.getElementById('chatbox__messages-create');

        if (!chatboxHeader || !chatForm) {
            setTimeout(addEmojiButton, 5000);
            return;
        }

        const emojiButtonStyler = `
            .emoji-button {
                cursor: pointer;
                font-size: 24px;
                margin-left: 10px;
            }
        `;
        GM_addStyle(emojiButtonStyler);

        const emojiButton = document.createElement('span');
        emojiButton.classList.add('emoji-button');
        emojiButton.innerHTML = '😂';
        emojiButton.addEventListener('click', createModal);

        chatboxHeader.prepend(emojiButton);
        chatForm.addEventListener('input', handleInputChange);
    }

    addEmojiButton();
})();