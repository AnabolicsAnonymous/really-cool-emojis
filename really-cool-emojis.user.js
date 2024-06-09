// ==UserScript==
// @name         really-cool-emojis
// @version      2.7
// @namespace    https://github.com/frenchcutgreenbean/
// @description  emojis and img for UNIT3D trackers
// @author       dantayy
// @match        https://blutopia.cc/*
// @match        https://aither.cc/*
// @match        https://reelflix.xyz/*
// @match        https://fearnopeer.com/*
// @match        https://cinematik.net/*
// @icon         https://ptpimg.me/shqsh5.png
// @downloadURL  https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/really-cool-emojis.user.js
// @updateURL    https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/really-cool-emojis.user.js
// @grant        GM.addStyle
// @grant        GM_xmlhttpRequest
// @license      GPL-3.0-or-later
// ==/UserScript==

/************************************************************************************************
 * ChangeLog
 * 2.1
 *  - Switch the way autofill emojis work. Must start with !{emoji_name} so it doesn't interfere with regular chatting.
 * 2.0
 *  - GM_addStyle -> GM.addStyle for more browser support thanks HDVinnie!
 * 1.8
 *  - Added Check Update button in the settings menu.
 *  - Some styling changes for the menu.
 *  - More emojis.
 * 1.2
 *  - Added new commands for img tags.
 *      - Wrap images without defining a width !https://i.ibb.co/5sqKm4Y/o7.png -> [img]https://i.ibb.co/5sqKm4Y/o7.png[/img]
 *      - Wrap + link images l!https://i.ibb.co/5sqKm4Y/o7.png -> [url=https://i.ibb.co/5sqKm4Y/o7.png][img]https://i.ibb.co/5sqKm4Y/o7.png[/img][/url]
 *      - Same thing for width l!200 https://i.ibb.co/5sqKm4Y/o7.png -> [url=https://i.ibb.co/5sqKm4Y/o7.png][img=200]https://i.ibb.co/5sqKm4Y/o7.png[/img][/url]
 *  - Fixed bug where formatting would be removed on forum posts.
 * 1.1
 *  - Formatted prettier+
 *  - Input commands now work at any point of string
 * 1.0
 * - Added support for torrent comments and forums.
 * - Made sure functions only run on supported pages, or if they're enabled (handleInputChange()).
 * - Some dynamic styling
 ************************************************************************************************/

(function () {
  "use strict";

  // ty sUss, sfa, moon, vaseline
  const emojis = {
    comedy: "https://ptpimg.me/x0rx70.png",
    counting: "https://ptpimg.me/59emhk.gif",
    feltcute: "https://ptpimg.me/20180i.png",
    giggle: "https://ptpimg.me/f9opi2.png",
    huh: "https://ptpimg.me/12kx8m.gif",
    rage: "https://ptpimg.me/cqu9qr.gif",
    reallymad: "https://ptpimg.me/znro3o.png",
    reallysad: "https://ptpimg.me/m9f985.png",
    slightlymad: "https://ptpimg.me/ut9wv7.png",
    ultramad: "https://ptpimg.me/vbg6q3.png",
    yawn: "https://ptpimg.me/l4l3r6.png",
    whatda: "https://i.ibb.co/YTDbxm1/WHAT.gif",
    feet: "https://ptpimg.me/622oxi.png",
    sleepy: "https://i.ibb.co/b5Svttf/sleepy.gif",
    sadd: "https://i.ibb.co/CV28H5h/sad.gif",
    joe: "https://i.ibb.co/JBncpnh/OOOOO.gif",
    chatting: "https://i.ibb.co/jTYXKTg/chatting.gif",
    ayo: "https://i.ibb.co/Vx9jZB9/ayo.gif",
    bratwu: "https://i.ibb.co/k834WdR/bratwur.png",
    ":o": "https://i.ibb.co/1Z0sS6J/OO.png",
    o7: "https://i.ibb.co/5sqKm4Y/o7.png",
    boobies: "https://i.ibb.co/SxFdK06/boobies.gif",
    dino: "https://i.ibb.co/QXSj9RT/dino.gif",
    gamin: "https://i.ibb.co/f0WhLk3/gamin.gif",
    popcorn: "https://i.ibb.co/pjJGfkf/popcorn.gif",
    catcorn: "https://i.ibb.co/MZ4Yf7R/catpopcorn.png",
    clown: "https://i.ibb.co/R6gGdfX/clown.gif",
    ban: "https://i.ibb.co/7kgbVMb/ban.gif",
    jusreadin: "https://i.ibb.co/0XfB6gs/reading.gif",
    crychattin: "https://i.ibb.co/nCKTC2Z/crychattin.gif",
    laught: "https://i.ibb.co/xj0zTCS/haha.jpg",
    chad: "https://i.ibb.co/Rb7L1Mk/chad.gif",
    empty: "https://i.ibb.co/wStC9f3/empty.png",
    dumbo: "https://i.ibb.co/yh05yVs/dumbo.png",
    brothers: "https://i.ibb.co/X3KvpHs/brothers.png",
    homerArrive: "https://i.ibb.co/Wpnz7Yp/homer-Arrive.gif",
    homerLeave: "https://i.ibb.co/8gtN9Vw/homer-Leave.gif",
    hungy: "https://i.ibb.co/x2Bf14F/hungy.gif",
    sexo: "https://i.ibb.co/ykCgkyS/sexo.gif",
    coffeeTime: "https://i.ibb.co/bbxhc3n/coffee-Time.gif",
    barf: "https://ptpimg.me/is0oh0.gif",
    awooga: "https://i.ibb.co/QHQ5r8g/AWOOGA.gif",
    hubba: "https://i.ibb.co/YcgqY7Z/hubbahubba.gif",
    dealwithit: "https://ptpimg.me/321azk.png",
    gandi: "https://i.ibb.co/Cbnn4hY/gandi.gif",
    poop: "https://ptpimg.me/a8mn3s.png",
    lip: "https://i.ibb.co/hVm1ngL/4x.png",
    putin: "https://ptpimg.me/0lm04u.png",
    sideeye: "https://i.ibb.co/B2k8cX5/sideeye.jpg",
    lmaoo: "https://i.ibb.co/VVYHjL0/lmao.png",
    "D:": "https://i.ibb.co/zs2dHW2/gasp.png",
    niceone: "https://i.ibb.co/c8TjJ7T/niceone.gif",
    hi5: "https://i.ibb.co/M7Q6L7s/hi5.gif",
    angytype: "https://ptpimg.me/c51694.png",
    putinwalk: "https://i.ibb.co/C6LT6NP/walkin.gif",
    spotted: "https://i.ibb.co/BNh18pp/spotted.gif",
    caught: "https://i.ibb.co/JFJxSmX/4k.gif",
    yoo: "https://i.ibb.co/CBfDMxJ/yoo.gif",
    smart: "https://i.ibb.co/nRfYr0H/smart.gif",
    reallythinking: "https://i.ibb.co/Qr0dNwj/reallythinking.gif",
    nerdbob: "https://i.ibb.co/mbndBMC/nerdbob.gif",
    nerd: "https://i.ibb.co/1X6YBwF/nerd.gif",
    hmmm: "https://i.ibb.co/TvtNp9v/hmmm.gif",
    actually: "https://i.ibb.co/4YD9gGK/actually.gif",
    shy: "https://ptpimg.me/olw327.png",
    ascared: "https://ptpimg.me/qbf200.png",
    gnite: "https://i.ibb.co/rp5zSBF/gnite.gif",
    modCheck: "https://i.ibb.co/fn2BxN6/modCheck.gif",
    thinking: "https://i.ibb.co/WfrH9db/thinking.gif",
    reallyshocked: "https://i.ibb.co/qmrdfk2/reallyshocked.gif",
    caughtme: "https://i.ibb.co/2KhYFs3/caughtme.gif",
    dead: "https://i.ibb.co/q1vQxxs/dead.gif",
    whereTho: "https://i.ibb.co/Zft4RCV/whereTho.gif",
    prideFlag: "https://i.ibb.co/72bZMp6/image.gif",
    parrot: "https://i.ibb.co/yB4fCfp/parrot.gif",
    munn: "https://i.ibb.co/Rz5QB5Y/tham.gif",
    "2munn": "https://i.ibb.co/yB0DHgx/2tham.gif",
    ionkno: "https://i.ibb.co/Khpw97t/ionkno.png",
    Erm: "https://i.ibb.co/TbJypyv/Erm.gif",
    noted: "https://i.ibb.co/qn0w6N5/noted.gif",
    killua: "https://i.ibb.co/98g7bxb/killua.gif",
    brainhurt: "https://i.ibb.co/bL7hLm7/brainhurt.gif",
    fbi: "https://i.ibb.co/fr64Fn6/fbi.png",
    catpunch: "https://i.ibb.co/CzmzYM6/4x.gif",
    xdd: "https://i.ibb.co/0jJS1jg/xdd.gif",
    mamamia: "https://i.ibb.co/CmZR8p7/mamamia.gif",
    HARAM: "https://i.ibb.co/KLy10rQ/HARAM.gif",
    ayoh: "https://i.ibb.co/3v22m5B/ayoh.gif",
    loopy: "https://ptpimg.me/vmq38q.png",
    excellent: "https://i.ibb.co/P98kJ53/excellent.gif",
    innocent: "https://i.ibb.co/2dtCYGW/innocent.gif",
    catsmirk: "https://i.ibb.co/wRRV5ns/catsmirk.gif",
    saythatagain: "https://i.ibb.co/HTTgfcB/saythatagain.gif",
    reallycool: "https://i.ibb.co/6vrY0km/reallycool.gif",
    robbery: "https://i.ibb.co/cYqqtbc/robbery.png",
    cronch: "https://i.ibb.co/y84jjsz/cronch.gif",
    stanced: "https://i.ibb.co/yBJCBGY/stanced.gif",
    sittin: "https://i.ibb.co/YcMxQTZ/sittin.gif",
    ohno: "https://i.ibb.co/SKPHp6c/ohno.gif",
    monkeat: "https://i.ibb.co/MBLgt2R/monkeat.gif",
    monkE: "https://i.ibb.co/48wZByc/monkE.gif",
    aussie: "https://i.ibb.co/QvWGHww/aussie.gif",
    YOO: "https://i.ibb.co/s3NDTct/yoooo.gif",
    dafuq: "https://i.ibb.co/m6M0h46/dafuq.gif",
    stonecold: "https://i.ibb.co/N96Z2Bp/stonecold.gif",
    shyboi: "https://i.ibb.co/HHYvzX4/shyboi.gif",
    pikahey: "https://i.ibb.co/2WnDK5C/pikahey.gif",
    mikeW: "https://i.ibb.co/QPh8DFq/mikeW.gif",
    hasbullahi: "https://i.ibb.co/XLbB1hF/hasbullahi.gif",
    BIGMONEY: "https://i.ibb.co/DL2zLYr/BIGMONEY.gif",
    ALRIGHT: "https://i.ibb.co/c82Tz05/ALRIGHT.gif",
    dogWTF: "https://i.ibb.co/dm3ZfS4/out.png",
    watchit: "https://i.ibb.co/99nnv04/watchit.gif",
    trash: "https://i.ibb.co/G2Wx8WL/trash.gif",
    STRESSED: "https://i.ibb.co/Lg3GhnL/STRESSED.gif",
    hasbullaFight: "https://i.ibb.co/2kmsP8b/Hasbulla-Fight.gif",
    marinFlushed: "https://i.ibb.co/JkbCdd4/marin-Flush.gif",
    squareUp: "https://i.ibb.co/drw3sfk/Iwill-Beat-Yo-Ass.gif",
    shookt: "https://i.ibb.co/R6R3Dcm/shookt.gif",
    hahaso: "https://i.ibb.co/4SF12vP/hahaso.gif",
    kek: "https://i.ibb.co/3v9GfYD/kekW.gif",
    putinApprove: "https://i.ibb.co/VJ2HYDR/putin-Approve.gif",
    NOPERS: "https://i.ibb.co/wYZTNfy/NOPERS.gif",
    MOMMY: "https://i.ibb.co/xMJTSL0/MOMMY.gif",
    kidgokuEat: "https://i.ibb.co/tb7X9T4/kidgoku-Eat.gif",
    HEH: "https://i.ibb.co/wdbC1HV/HEH.gif",
    gokueat: "https://i.ibb.co/CPd53LC/gokueat.gif",
    STFU: "https://i.ibb.co/nR9yQTJ/STFU.gif",
    skatin: "https://i.ibb.co/QFGB0Rp/skatin.gif",
    sfa: "https://i.ibb.co/Htbgx17/sfa.gif",
    putinSquat: "https://i.ibb.co/qMZJRBD/putinsquat.png",
    putinAttack: "https://i.ibb.co/4S2yh9h/putin-Attack.png",
    youRang: "https://i.ibb.co/JQWPZM5/youRang.gif",
    whatido: "https://i.ibb.co/CK1zY7k/whatido.gif",
    fucku: "https://i.ibb.co/V3PwZbm/fucku.gif",
    weebHi: "https://i.ibb.co/BCDxRgs/image.gif",
    mmkay: "https://i.ibb.co/3NnYDyt/out.png",
    Risenocular: "https://i.ibb.co/XLLg8w9/risenoculars.gif",
    wuh: "https://i.ibb.co/mDW4G97/wuh.gif",
    SNACKING: "https://i.ibb.co/5n1S9Sq/SNACKING.gif",
    shitlookgood: "https://i.ibb.co/ZT4vbBH/shitlookgood.gif",
    PLEASE: "https://i.ibb.co/c1B3XSH/PLEASE.gif",
    NOHORNY: "https://i.ibb.co/4ZSn3gh/NOHORNY.gif",
    LETHIMCOOK: "https://i.ibb.co/NWC2108/LETHIMCOOK.gif",
    kok: "https://i.ibb.co/nLpSJnt/kok.gif",
    sus: "https://i.ibb.co/VVJqBLS/huhh.gif",
    ":d": "https://i.ibb.co/PgPmFzP/DD.gif",
    buh: "https://i.ibb.co/pvVghfM/buh.gif",
    rockhuh: "https://i.ibb.co/CH8mY0w/huh.gif",
  };

  const currentURL = window.location.href;
  const currURL = new URL(window.location.href);
  const rootURL = currURL.origin + "/";
  const torrentRegEX = /.*\/torrents\/\d+/;
  const forumRegEX = /.*\/forums\/topics\/\d+/;
  const newTopicRegEX = /.\/topics\/forum\/\d+\/create/;
  const editTopicRegEX = /.*\/forums\/posts\/\d+\/edit/;

  // set supported pages
  const isTorrent = torrentRegEX.test(currentURL);
  const isForum = forumRegEX.test(currentURL);
  const isNewTopic = newTopicRegEX.test(currentURL);
  const isEditTopic = editTopicRegEX.test(currentURL);
  const isChatbox = currentURL === rootURL ? true : false;

  // dynamic DOM selectors for different pages
  const menuQuery = isTorrent
    ? "h4.panel__heading" // For torrent comments
    : isForum
    ? "#forum_reply_form" // For forum replies
    : isNewTopic || isEditTopic
    ? "h2.panel__heading" // For New Topic or Editing a topic
    : "#chatbox_header div"; // Chatbox

  const inputQuery = isTorrent
    ? "new-comment__textarea" // Torrent comment input
    : isForum || isNewTopic || isEditTopic
    ? "bbcode-content" // Forums input
    : "chatbox__messages-create"; // Chatbox input

  const defaultSize = isChatbox ? "42" : "84"; // 42 width for chatbox and 84 for everything else
  let menuSelector, chatForm;

  const emojiMenu = document.createElement("div");
  emojiMenu.className = "emoji-content";
  const showLabel = JSON.parse(
    localStorage.getItem("showEmojiLabel") || "false"
  );

  // Fill the menu with all the emojis
  for (const [key, value] of Object.entries(emojis)) {
    const emojiContainer = document.createElement("div");
    const emojiLabel = document.createElement("p");
    emojiLabel.innerText = key;
    emojiLabel.classList.add("emoji-label");
    emojiLabel.style.display = showLabel ? "block" : "none";
    const emojiItem = document.createElement("div");
    emojiItem.classList.add("emoji-item");
    emojiItem.style.backgroundImage = `url(${value})`;
    emojiItem.addEventListener("click", () => onEmojiclick(value));
    emojiContainer.appendChild(emojiItem);
    emojiContainer.appendChild(emojiLabel);
    emojiMenu.appendChild(emojiContainer);
  }

  function onEmojiclick(image) {
    let size = defaultSize;
    if (image.includes("tham")) {
      size = 128;
    }
    const emoji = `[img=${size}]${image}[/img]`;
    chatForm.value = chatForm.value
      ? `${chatForm.value.trim()} ${emoji}`
      : emoji;
    chatForm.focus();
  }

  // Handle the commands if enabled in the settings. Autofill + IMG tags.
  function handleInputChange(e, autofill, useImgTag) {
    const regex = /^(?:!?http.*|l!http.*)\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    const message = e.target.value;

    if (!message) return;

    const messageParts = message.split(/(\s+|\n)/);

    const findLastNonWhitespaceIndex = (arr) => {
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].trim() !== "") return i;
      }
      return -1;
    };

    const lastItemIndex = findLastNonWhitespaceIndex(messageParts);
    const lastItem =
      lastItemIndex >= 0 ? messageParts[lastItemIndex].trim() : "";
    const secondLastItemIndex = findLastNonWhitespaceIndex(
      messageParts.slice(0, lastItemIndex)
    );
    const secondLastItem =
      secondLastItemIndex >= 0 ? messageParts[secondLastItemIndex].trim() : "";

    const setChatFormValue = (value) => {
      chatForm.value = value;
      chatForm.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const emojiCheck = lastItem.slice(1);

    if (
      !lastItem.startsWith("!") &&
      !lastItem.startsWith("l") &&
      !secondLastItem.startsWith("!") &&
      !secondLastItem.startsWith("l")
    ) {
      return;
    }

    if (autofill && emojis[emojiCheck]) {
      messageParts[
        lastItemIndex
      ] = `[img=${defaultSize}]${emojis[emojiCheck]}[/img]`;
      setChatFormValue(messageParts.join(""));
      return;
    }

    if (useImgTag && regex.test(lastItem)) {
      const applyImgTag = (index, tag) => {
        messageParts[index] = tag;
        messageParts.splice(lastItemIndex, 1);
        setChatFormValue(messageParts.join(""));
      };

      if (secondLastItem.startsWith("!") && parseInt(secondLastItem.slice(1))) {
        applyImgTag(
          secondLastItemIndex,
          `[img=${secondLastItem.slice(1)}]${lastItem}[/img]`
        );
        return;
      }

      if (
        secondLastItem.startsWith("l!") &&
        parseInt(secondLastItem.slice(2))
      ) {
        applyImgTag(
          secondLastItemIndex,
          `[url=${lastItem}][img=${secondLastItem.slice(
            2
          )}]${lastItem}[/img][/url]`
        );
        return;
      }

      if (lastItem.startsWith("!") && !emojis[emojiCheck]) {
        messageParts[lastItemIndex] = `[img]${lastItem.slice(1)}[/img]`;
        setChatFormValue(messageParts.join(""));
        return;
      }

      if (lastItem.startsWith("l!")) {
        messageParts[lastItemIndex] = `[img]${lastItem.slice(2)}[/img]`;
        setChatFormValue(messageParts.join(""));
        return;
      }
    }
  }

  function createModal() {
    const existingMenu = document.getElementById("emoji-menu");
    if (existingMenu) {
      existingMenu.style.display =
        existingMenu.style.display === "none" ? "block" : "none";
      return;
    }

    // Attempt to style the modal dynamically. Not great, but it works.
    const menuLeft = isChatbox || isNewTopic ? "60%" : "20%";
    const menuTop = isNewTopic ? "10%" : "20%";
    const modalStyler = `
            .emoji-menu {
                position: fixed;
                border-radius: 5px;
                z-index: 1;
                left: ${menuLeft};
                top: ${menuTop};
                max-height: 500px;
                overflow: auto;
                background-color: rgba(0,0,0,0.8);
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
                max-width: 40px;
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
                padding: 5px 20px;
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
            #img_cb , #autofill_cb, #show_label{
                cursor: pointer !important;
            }
            .check__update {
                margin-top: 10px;
                display: flex;
                flex-direction: column;
              }
            .update__btn {
                cursor: pointer;
                color: #4F8C3C;
              }
        `;

    GM.addStyle(modalStyler);

    const modal = document.createElement("div");
    modal.className = "emoji-menu";
    modal.id = "emoji-menu";

    const closeButton = document.createElement("button");
    closeButton.className = "menu-close";
    closeButton.textContent = "Close";
    closeButton.onclick = () => (modal.style.display = "none");

    const settingsButton = document.createElement("button");
    settingsButton.className = "menu-settings";
    settingsButton.textContent = "⚙️";
    settingsButton.onclick = () =>
      (settingsMenu.style.display =
        settingsMenu.style.display === "none" ? "block" : "none");

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
            <div class="check__update">
            <span class="update__btn">Check for updates</span></div>
            </div>
        `;

    settingsMenu
      .querySelector("#autofill_cb")
      .addEventListener("change", (e) => {
        localStorage.setItem("autofill", e.target.checked);
      });

    settingsMenu.querySelector("#img_cb").addEventListener("change", (e) => {
      localStorage.setItem("useImgTag", e.target.checked);
    });

    settingsMenu
      .querySelector("#show_label")
      .addEventListener("change", (e) => {
        localStorage.setItem(
          "showEmojiLabel",
          JSON.stringify(e.target.checked)
        ); // Store as JSON string
        const labels = document.querySelectorAll(".emoji-label"); // Select elements with class 'emoji-label'
        labels.forEach(
          (label) => (label.style.display = e.target.checked ? "block" : "none")
        ); // Corrected display logic
      });

    modal.appendChild(closeButton);
    modal.appendChild(settingsButton);
    modal.appendChild(settingsMenu);
    modal.appendChild(emojiMenu);
    document.body.appendChild(modal);

    initializeSettings();
  }

  // Load the settings into the menu from local storage.
  function initializeSettings() {
    document.getElementById("autofill_cb").checked = JSON.parse(
      localStorage.getItem("autofill") || "false"
    );
    document.getElementById("img_cb").checked = JSON.parse(
      localStorage.getItem("useImgTag") || "false"
    );
    document.getElementById("show_label").checked = JSON.parse(
      localStorage.getItem("showEmojiLabel") || "false"
    );

    const updateBtn = document.querySelector(".update__btn");
    updateBtn.addEventListener("click", checkUpdate);
  }

  // Check for updates.
  function checkUpdate() {
    GM_xmlhttpRequest({
      method: "GET",
      url:
        "https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/really-cool-emojis.user.js",
      onload: function (response) {
        const updateDiv = document.querySelector(".check__update");
        const responseText = response.responseText;

        // Extract version from response text
        const versionMatch = responseText.match(/\/\/\s*@version\s+([^\s]+)/);
        if (versionMatch) {
          const onlineVersion = versionMatch[1];
          const currentVersion = GM_info.script.version;

          if (onlineVersion !== currentVersion) {
            const updateLink = document.createElement("a");
            updateLink.href =
              "https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/really-cool-emojis.user.js";
            updateLink.target = "_blank";
            updateLink.textContent = "Update";
            updateLink.style.marginTop = "10px";
            updateDiv.appendChild(updateLink);
          } else {
            const updateInfo = document.createElement("span");
            updateInfo.textContent = "You are up to date!";
            updateInfo.style.marginTop = "10px";
            updateDiv.appendChild(updateInfo);
          }
        } else {
          console.error(
            "Unable to determine the latest version of the script."
          );
        }
      },
    });
  }

  // Inject the emoji button and run the main script.
  function addEmojiButton() {
    menuSelector = document.querySelector(menuQuery);
    chatForm = document.getElementById(inputQuery);

    if (!menuSelector || !chatForm) {
      setTimeout(addEmojiButton, 1000);
      return;
    }

    const emojiButtonStyler = `
            .emoji-button {
                cursor: pointer;
                font-size: 24px;
                margin-left: 0;
            }
        `;

    GM.addStyle(emojiButtonStyler);

    const emojiButton = document.createElement("span");
    emojiButton.classList.add("emoji-button");
    emojiButton.innerHTML = "😂";
    emojiButton.addEventListener("click", createModal);

    if (isChatbox || isForum) {
      menuSelector.prepend(emojiButton);
    } else {
      menuSelector.append(emojiButton);
    }

    chatForm.addEventListener("input", (e) => {
      // get settings from local storage
      const autofill = JSON.parse(localStorage.getItem("autofill") || "false");
      const useImgTag = JSON.parse(
        localStorage.getItem("useImgTag") || "false"
      );

      // only handle input changes if the user has these settings enabled
      if (autofill || useImgTag) {
        handleInputChange(e, autofill, useImgTag);
      }
    });
  }

  // Only call the script on supported pages.
  if (isChatbox || isForum || isNewTopic || isTorrent || isEditTopic) {
    addEmojiButton();
  }
})();
