// ==UserScript==
// @name         really-cool-emojis
// @version      0.9
// @namespace    https://github.com/frenchcutgreenbean/
// @description  chatbox emojis and img
// @author       dantayy
// @match        https://blutopia.cc/
// @match        https://aither.cc/
// @match        https://reelflix.xyz/
// @match        https://fearnopeer.com/
// @match        https://cinematik.net/
// @icon         https://ptpimg.me/shqsh5.png
// @downloadURL  https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/really-cool-emojis.user.js
// @updateURL    https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/really-cool-emojis.user.js
// @grant        GM_addStyle
// @license      GPL-3.0-or-later
// ==/UserScript==

(function () {
    'use strict';

    // ty sUss, sfa, moon, vaseline
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
        "boobies": "https://i.ibb.co/SxFdK06/boobies.gif",
        "dino": "https://i.ibb.co/QXSj9RT/dino.gif",
        "gamin": "https://i.ibb.co/f0WhLk3/gamin.gif",
        "popcorn": "https://i.ibb.co/pjJGfkf/popcorn.gif",
        "catcorn": "https://i.ibb.co/MZ4Yf7R/catpopcorn.png",
        "clown": "https://i.ibb.co/R6gGdfX/clown.gif",
        "ban": "https://i.ibb.co/7kgbVMb/ban.gif",
        "jusreadin": "https://i.ibb.co/0XfB6gs/reading.gif",
        "crychattin": "https://i.ibb.co/nCKTC2Z/crychattin.gif",
        "laught": "https://i.ibb.co/xj0zTCS/haha.jpg",
        "chad": "https://i.ibb.co/Rb7L1Mk/chad.gif",
        "empty": "https://i.ibb.co/wStC9f3/empty.png",
        "dumbo": "https://i.ibb.co/yh05yVs/dumbo.png",
        "brothers": "https://i.ibb.co/X3KvpHs/brothers.png",
        "homerArrive": "https://i.ibb.co/Wpnz7Yp/homer-Arrive.gif",
        "homerLeave": "https://i.ibb.co/8gtN9Vw/homer-Leave.gif",
        "hungy": "https://i.ibb.co/x2Bf14F/hungy.gif",
        "sexo": "https://i.ibb.co/L00Nd6R/sexo.gif",
        "coffeeTime": "https://i.ibb.co/bbxhc3n/coffee-Time.gif",
        "barf": "https://ptpimg.me/is0oh0.gif",
        "awooga": "https://i.ibb.co/QHQ5r8g/AWOOGA.gif",
        "hubba": "https://i.ibb.co/YcgqY7Z/hubbahubba.gif",
        "dealwithit": "https://ptpimg.me/321azk.png",
        "gandi": "https://i.ibb.co/Cbnn4hY/gandi.gif",
        "poop": "https://ptpimg.me/a8mn3s.png",
        "lip": "https://i.ibb.co/hVm1ngL/4x.png",
        "putin": "https://ptpimg.me/0lm04u.png",
        "sideeye": "https://i.ibb.co/B2k8cX5/sideeye.jpg",
        "lmaoo": "https://i.ibb.co/VVYHjL0/lmao.png",
        "D:": "https://i.ibb.co/zs2dHW2/gasp.png",
        "niceone": "https://i.ibb.co/c8TjJ7T/niceone.gif",
        "hi5": "https://i.ibb.co/M7Q6L7s/hi5.gif",
        "angytype": "https://ptpimg.me/c51694.png",
        "putinwalk": "https://i.ibb.co/C6LT6NP/walkin.gif",
        "spotted": "https://i.ibb.co/BNh18pp/spotted.gif",
        "caught": "https://i.ibb.co/JFJxSmX/4k.gif",
        "yoo": "https://i.ibb.co/CBfDMxJ/yoo.gif"
    };

    let chatboxHeader, chatForm;
    const emojiMenu = document.createElement("div");
    emojiMenu.className = "emoji-content";
    const showLabel = JSON.parse(localStorage.getItem('showEmojiLabel') || 'false');

    for (const [key, value] of Object.entries(emojis)) {
        const emojiContainer = document.createElement("div");
        const emojiLabel = document.createElement("p");
        emojiLabel.innerText = key;
        emojiLabel.classList.add("emoji-label");
        emojiLabel.style.display = showLabel ? 'block' : 'none';
        const emojiItem = document.createElement("div");
        emojiItem.classList.add("emoji-item");
        emojiItem.style.backgroundImage = `url(${value})`;
        emojiItem.addEventListener("click", () => onEmojiclick(value));
        emojiContainer.appendChild(emojiItem);
        emojiContainer.appendChild(emojiLabel);
        emojiMenu.appendChild(emojiContainer);
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
                max-height: 500px;
                overflow: auto;
                background-color: rgba(0,0,0,0.4);
            }
            .emoji-content {
                background-color: #1C1C1C;
                color: #CCCCCC;
                margin: 15% auto;
                padding: 20px;
                max-width: 300px;
                max-height: 250px;
                overflow: auto;
                position: relative;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            .emoji-label {
                font-size: 8px;
                text-align: center;
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
            <label for="autofill_cb">Autofill emoji name</label>
            <input type="checkbox" id="autofill_cb">
            </div>
            <div class="emoji__config"> 
            <label for="img_cb">Auto img tag</label>
            <input type="checkbox" id="img_cb">
            </div>
            <div class="emoji__config"> 
            <label for="show_label">Show emoji labels</label>
            <input type="checkbox" id="show_label">
            </div>
        `;

        settingsMenu.querySelector('#autofill_cb').addEventListener('change', (e) => {
            localStorage.setItem('autofill', e.target.checked);
        });

        settingsMenu.querySelector('#img_cb').addEventListener('change', (e) => {
            localStorage.setItem('useImgTag', e.target.checked);
        });

        settingsMenu.querySelector('#show_label').addEventListener('change', (e) => {
            localStorage.setItem('showEmojiLabel', JSON.stringify(e.target.checked)); // Store as JSON string
            const labels = document.querySelectorAll('.emoji-label'); // Select elements with class 'emoji-label'
            labels.forEach(label => label.style.display = e.target.checked ? 'block' : 'none'); // Corrected display logic
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
        document.getElementById('show_label').checked = JSON.parse(localStorage.getItem('showEmojiLabel') || 'false');
    }
    function addEmojiButton() {
        chatboxHeader = document.querySelector('#chatbox_header div');
        chatForm = document.getElementById('chatbox__messages-create');

        if (!chatboxHeader || !chatForm) {
            setTimeout(addEmojiButton, 1000);
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