// ==UserScript==
// @name         jacksaw-emojis
// @version      7.0.7
// @namespace    https://github.com/frenchcutgreenbean/
// @description  emojis hardcoded into file.
// @author       dantayy
// @match        https://aither.cc/*
// @match        https://blutopia.cc/*
// @match        https://cinematik.net/*
// @match        https://fearnopeer.com/*
// @match        https://lst.gg/*
// @match        https://reelflix.xyz/*
// @match        https://upload.cx/*
// @icon         https://ptpimg.me/shqsh5.png
// @downloadURL  https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/jacksaw-emojis.user.js
// @updateURL    https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/jacksaw-emojis.user.js
// @grant        GM.xmlHttpRequest
// @license      GPL-3.0-or-later
// ==/UserScript==

/************************************************************************************************
 * ChangeLog
 * 6.9.7
 *  - Added ability to pin emotes.
 * 6.9.6
 *  - Menu size moved to settings
 *  - Sticky search bar
 *  - Back to top button
 * 6.9.5
 *  - Bigger menu + responsive.
 *  - Draggable.
 * 6.9.0
 *  - Complete refactor emojis stored in separate file.
 *  - Search functionality for easy access.
 *  - Tagging for similar querying.
 ************************************************************************************************/

(function () {
  "use strict";

  let emotes = {};

  const currentURL = window.location.href;
  const currURL = new URL(currentURL);
  const rootURL = `${currURL.origin}/`;

  const urlPatterns = [
    { regex: /.*\/torrents\/\d+/, key: "isTorrent" },
    { regex: /.*\/forums\/topics\/\d+/, key: "isForum" },
    { regex: /.\/topics\/forum\/\d+\/create/, key: "isNewTopic" },
    { regex: /.*\/forums\/posts\/\d+\/edit/, key: "isEditTopic" },
    { regex: /.*\/conversations\/create/, key: "isPM" },
    { regex: /.*\/conversations\/\d+/, key: "isReply" },
  ];

  const pageFlags = urlPatterns.reduce((acc, pattern) => {
    acc[pattern.key] = pattern.regex.test(currentURL);
    return acc;
  }, {});

  pageFlags.isChatbox = currentURL === rootURL;

  const menuQuery = {
    h4Heading: "h4.panel__heading",
    forumReply: "#forum_reply_form",
    h2Heading: "h2.panel__heading",
    chatboxMenu: "#chatbox_header div",
  };

  const inputQuery = {
    newComment: "new-comment__textarea",
    bbcodeForum: "bbcode-content",
    chatboxInput: "chatbox__messages-create",
    bbcodePM: "bbcode-message",
  };

  let menuSelector, chatForm, defaultOrdering;

  function getDOMSelectors() {
    const { h4Heading, forumReply, h2Heading, chatboxMenu } = menuQuery;
    const { newComment, bbcodeForum, chatboxInput, bbcodePM } = inputQuery;

    const selectors = [
      {
        condition: pageFlags.isReply,
        menu: h2Heading,
        input: bbcodePM,
        extraCheck: (el) => el.innerText.toLowerCase().includes("reply"),
      },
      {
        condition:
          pageFlags.isNewTopic || pageFlags.isPM || pageFlags.isEditTopic,
        menu: h2Heading,
        input: pageFlags.isPM ? bbcodePM : bbcodeForum,
      },
      { condition: pageFlags.isTorrent, menu: h4Heading, input: newComment },
      { condition: pageFlags.isForum, menu: forumReply, input: bbcodeForum },
      {
        condition: pageFlags.isChatbox,
        menu: chatboxMenu,
        input: chatboxInput,
      },
    ];

    for (let selector of selectors) {
      if (selector.condition) {
        if (selector.extraCheck) {
          const headings = document.querySelectorAll(selector.menu);
          for (let el of headings) {
            if (selector.extraCheck(el)) {
              menuSelector = el;
              break;
            }
          }
        } else {
          menuSelector = document.querySelector(selector.menu);
        }
        chatForm = document.getElementById(selector.input);
        break;
      }
    }
  }

  // helper function to get size for emote.
  function getEmoteSize(sizePref, emote) {
    if (sizePref === "default") return emote.default_width;
    if (sizePref === "large") return emote.default_width + 10;
    if (sizePref === "small") return emote.default_width - 10;
    if (sizePref === "sfa") return Math.min(emote.default_width + 28, 100);
  }

  let sizePref = "default";

  if (localStorage.getItem("sizePref")) {
    sizePref = localStorage.getItem("sizePref");
  }

  let winSize = "small";

  if (localStorage.getItem("winSize")) {
    winSize = localStorage.getItem("winSize");
  }

  function setWinSize(winSize) {
    const styleMedium = `
      .emote-menu .emote-content {
        max-width: 350px;
        width: 350px;
        max-height: 500px;
        height: 500px;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: 50px;
        gap: 15px;
      }
      .emote-menu .emote-label {
        max-width: 50px;
        width: 50px;
        font-size: 10px;
      }
      .emote-menu .emote-container {
        max-width: 60px;
      }
      .emote-menu .emote-item {
        width: 50px;
        height: 50px;
      }
      .emote-menu .emote-search-bar {
        height: 35px;
        padding: 15px;
      }`;

    const styleLarge = `
      .emote-menu .emote-content {
        max-width: 450px;
        width: 450px;
        max-height: 530px;
        height: 530px;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: 60px;
        gap: 20px;
      }
      .emote-menu .emote-label {
        max-width: 60px;
        width: 60px;
        font-size: 12px;
      }
      .emote-menu .emote-container {
        max-width: 70px;
      }
      .emote-menu .emote-item {
        width: 60px;
        height: 60px;
      }
      .emote-menu .emote-search-bar {
        height: 40px;
        padding: 20px;
      }`;
    // Remove existing style elements for medium and large sizes
    const existingMediumStyle = document.getElementById("style-medium");
    if (existingMediumStyle) existingMediumStyle.remove();

    const existingLargeStyle = document.getElementById("style-large");
    if (existingLargeStyle) existingLargeStyle.remove();

    if (winSize === "large") {
      addStyle(styleLarge, "style-large");
    } else if (winSize === "medium") {
      addStyle(styleMedium, "style-medium");
    }
  }

  // Helper function to addStyle instead of using GM.addStyle, for compatibility.
  function addStyle(css, id) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  async function setEmotes() {
    try {
      emotes = {
        "concernedApe": {
          url: "https://i.ibb.co/w7K0bTf/concerned-Ape.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["monkey", "ape", "gorilla", "worried", "concerned"],
        },
        "stanced": {
          url: "https://i.ibb.co/yBJCBGY/stanced.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cat", "standing"],
        },
        "sittin": {
          url: "https://i.ibb.co/YcMxQTZ/sittin.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["chillin", "seal"],
        },
        "monkeat": {
          url: "https://i.ibb.co/MBLgt2R/monkeat.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["monkey", "eating", "gorilla", "ape"],
        },
        "monkE": {
          url: "https://i.ibb.co/48wZByc/monkE.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["monkey", "ape", "gorilla", "worried", "concerned", "lurk"],
        },
        "aussie": {
          url: "https://i.ibb.co/QvWGHww/aussie.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["kangaroo", "australia", "eating"],
        },
        "wuh": {
          url: "https://i.ibb.co/mDW4G97/wuh.gif",
          default_width: 42,
          width: 176,
          height: 128,
          tags: ["cat", "buh"],
        },
        "shitlookgood": {
          url: "https://i.ibb.co/ZT4vbBH/shitlookgood.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cow", "hungry"],
        },
        "SNACKING": {
          url: "https://i.ibb.co/5n1S9Sq/SNACKING.gif",
          default_width: 62,
          width: 208,
          height: 128,
          tags: ["eating", "groundhog"],
        },
        "PLEASE": {
          url: "https://i.ibb.co/c1B3XSH/PLEASE.gif",
          default_width: 42,
          width: 132,
          height: 128,
          tags: ["cat", "beg"],
        },
        ":d": {
          url: "https://i.ibb.co/PgPmFzP/DD.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cat", "happy"],
        },
        "buh": {
          url: "https://i.ibb.co/pvVghfM/buh.gif",
          default_width: 62,
          width: 180,
          height: 128,
          tags: ["cat", "buh", "concerned"],
        },
        "chimpE": {
          url: "https://i.ibb.co/55HNy0X/monkE.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["monkey", "angry", "rage"],
        },
        "meow": {
          url: "https://i.ibb.co/Tcrt2c3/meow.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cat"],
        },
        "catsmirk": {
          url: "https://i.ibb.co/wRRV5ns/catsmirk.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cat"],
        },
        "cronch": {
          url: "https://i.ibb.co/y84jjsz/cronch.gif",
          default_width: 62,
          width: 192,
          height: 128,
          tags: ["eating", "cat"],
        },
        "duckass": {
          url: "https://i.ibb.co/VqG2BVV/duckass.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["twerk", "horny"],
        },
        "sfagoat": {
          url: "https://i.ibb.co/DLTw1Fh/cgoat.png",
          default_width: 42,
          width: 400,
          height: 461,
          tags: ["goat"],
        },
        "BANANY": {
          url: "https://i.ibb.co/TwpDXHj/BANANY.gif",
          default_width: 42,
          width: 144,
          height: 128,
          tags: ["eating", "cat"],
        },
        "monkeSpin": {
          url: "https://i.ibb.co/28PpJVY/monkey-Spin.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["monkey"],
        },
        "monkeSip": {
          url: "https://i.ibb.co/LdsgPyM/monkey-Sip.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["chillin"],
        },
        "monkeTea": {
          url: "https://i.ibb.co/S7vBZp2/monkeTea.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["morning", "monkey"],
        },
        "monkeLeave": {
          url: "https://i.ibb.co/52p18F2/monke-Leave.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["leaving", "monkey"],
        },
        "monkeKiss": {
          url: "https://i.ibb.co/xFQfqXf/monke-Kiss.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["kiss", "horny", "thanks"],
        },
        "monkeDrive": {
          url: "https://i.ibb.co/DRzxN9q/monke-Drive.gif",
          default_width: 62,
          width: 232,
          height: 128,
          tags: ["monkey"],
        },
        "monkeArrive": {
          url: "https://i.ibb.co/RNtfGCn/monke-Arrive.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["arrive", "monkey"],
        },
        "Monke": {
          url: "https://i.ibb.co/PzFstJH/Monke.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["monkey"],
        },
        "fishy": {
          url: "https://i.ibb.co/gTDk7Bt/fish.gif",
          default_width: 42,
          width: 60,
          height: 25,
          tags: [],
        },
        "kidgokuEat": {
          url: "https://i.ibb.co/tb7X9T4/kidgoku-Eat.gif",
          default_width: 42,
          width: 172,
          height: 128,
          tags: ["eat", "hungry"],
        },
        "gokueat": {
          url: "https://i.ibb.co/CPd53LC/gokueat.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["eat", "hungry"],
        },
        "hungy": {
          url: "https://i.ibb.co/x2Bf14F/hungy.gif",
          default_width: 42,
          width: 172,
          height: 128,
          tags: ["eat", "hungry"],
        },
        "helloo": {
          url: "https://i.ibb.co/p27w380/helloo.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["hi", "yo", "hey", "hello"],
        },
        "pikahey": {
          url: "https://i.ibb.co/2WnDK5C/pikahey.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["hi", "yo", "hey", "hello"],
        },
        "YOO": {
          url: "https://i.ibb.co/s3NDTct/yoooo.gif",
          default_width: 62,
          width: 180,
          height: 128,
          tags: ["hi", "yo", "hey", "hello"],
        },
        "yoo": {
          url: "https://i.ibb.co/CBfDMxJ/yoo.gif",
          default_width: 62,
          width: 180,
          height: 128,
          tags: ["hi", "yo", "hey", "hello"],
        },
        "weebHi": {
          url: "https://i.ibb.co/BCDxRgs/image.gif",
          default_width: 42,
          width: 173,
          height: 200,
          tags: ["hi", "yo", "hey", "hello"],
        },
        "hasbullahi": {
          url: "https://i.ibb.co/XLbB1hF/hasbullahi.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["hi", "yo", "hey", "hello"],
        },
        "spongeBye": {
          url: "https://i.ibb.co/4W6VWPz/sponge-Bye.gif",
          default_width: 42,
          width: 136,
          height: 128,
          tags: ["bye"],
        },
        "ByeBye": {
          url: "https://i.ibb.co/hDd3n4Y/ByeBye.gif",
          default_width: 42,
          width: 172,
          height: 128,
          tags: ["bye"],
        },
        "imout": {
          url: "https://i.ibb.co/4Nw7MYg/imout.gif",
          default_width: 42,
          width: 100,
          height: 128,
          tags: ["bye", "peace"],
        },
        "stingUp": {
          url: "https://ptpimg.me/ze6c85.gif",
          default_width: 52,
          width: 256,
          height: 256,
          tags: ["nice", "congrats", "gz"],
        },
        "hi5": {
          url: "https://i.ibb.co/M7Q6L7s/hi5.gif",
          default_width: 42,
          width: 140,
          height: 128,
          tags: ["nice", "congrats", "gz"],
        },
        "tyronegz": {
          url: "https://i.ibb.co/Z8CG4kY/congratulations.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["nice", "congrats", "gz"],
        },
        "congrats": {
          url: "https://i.ibb.co/nwbHvcj/congrats.gif",
          default_width: 42,
          width: 124,
          height: 128,
          tags: ["nice", "congrats", "gz"],
        },
        "confetti": {
          url: "https://i.ibb.co/zHh0c2W/confetti.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["nice", "congrats", "gz"],
        },
        "thanksbro": {
          url: "https://i.ibb.co/FV8pDNm/thanksbro.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["ty", "thanks", "love", "gay", "kiss"],
        },
        "spongeLove": {
          url: "https://i.ibb.co/c1Rtd9G/sponge-Love.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["ty", "thanks", "love", "heart"],
        },
        "ohstop": {
          url: "https://i.ibb.co/tDzrrB1/ohstop.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["flattered", "love", "heart"],
        },
        "gothKiss": {
          url: "https://i.ibb.co/4j4f6t3/gothKiss.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["horny", "thanks", "ty", "kiss"],
        },
        "catLove": {
          url: "https://i.ibb.co/k3q56BW/catLove.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cat", "ty", "thanks", "love", "heart"],
        },
        "bearHug": {
          url: "https://i.ibb.co/tZ454LT/bearHug.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["ty", "thanks", "love", "heart"],
        },
        "batemanArrive": {
          url: "https://i.ibb.co/7zsLddv/bateman-Arrive.gif",
          default_width: 42,
          width: 200,
          height: 157,
          tags: ["arrived"],
        },
        "homerArrive": {
          url: "https://i.ibb.co/Wpnz7Yp/homer-Arrive.gif",
          default_width: 42,
          width: 156,
          height: 128,
          tags: ["arrived"],
        },
        "homerLeave": {
          url: "https://i.ibb.co/8gtN9Vw/homer-Leave.gif",
          default_width: 42,
          width: 156,
          height: 128,
          tags: ["leaving"],
        },
        "youRang": {
          url: "https://i.ibb.co/JQWPZM5/youRang.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["arrived"],
        },
        "prayge": {
          url: "https://i.ibb.co/CWC39HT/prayge.gif",
          default_width: 42,
          width: 164,
          height: 128,
          tags: ["praying", "holy", "gamble", "bless"],
        },
        "standPrayge": {
          url: "https://i.ibb.co/Tkk0q3s/stand-Prayge.gif",
          default_width: 42,
          width: 76,
          height: 128,
          tags: ["praying", "holy", "gamble", "bless"],
        },
        "pikaBless": {
          url: "https://i.ibb.co/j6JPs3j/pika-Bless.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["praying", "holy", "gamble", "bless"],
        },
        "blessRNG": {
          url: "https://i.ibb.co/YcFSpfW/blessRNG.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["praying", "holy", "gamble", "bless"],
        },
        "GAMBA": {
          url: "https://i.ibb.co/9hkjbCp/GAMBA.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["gamble"],
        },
        "stonksUp": {
          url: "https://i.ibb.co/DpP0PxD/stonksup.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["gamble"],
        },
        "stonksDown": {
          url: "https://i.ibb.co/x84x9np/stonksdown.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["gamble"],
        },
        "stackin": {
          url: "https://ptpimg.me/616o42.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: ["gamble", "rich", "money", "bon"],
        },
        "reallyRich": {
          url: "https://i.ibb.co/ZMf1YQ6/really-Rich.gif",
          default_width: 42,
          width: 140,
          height: 128,
          tags: ["gamble", "rich", "money", "bon"],
        },
        "counting": {
          url: "https://ptpimg.me/59emhk.gif",
          default_width: 42,
          width: 168,
          height: 128,
          tags: ["gamble", "rich", "money", "bon"],
        },
        "moneyTime": {
          url: "https://i.ibb.co/Df5nZDR/money-Time.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["gamble", "rich", "money", "bon"],
        },
        "BIGMONEY": {
          url: "https://i.ibb.co/DL2zLYr/BIGMONEY.gif",
          default_width: 42,
          width: 172,
          height: 128,
          tags: ["gamble", "rich", "money", "bon"],
        },
        "robbery": {
          url: "https://i.ibb.co/cYqqtbc/robbery.png",
          default_width: 42,
          width: 136,
          height: 128,
          tags: ["gamble", "rich", "money", "bon"],
        },
        "moneyRun": {
          url: "https://i.ibb.co/rxqYcrx/moneyRun.gif",
          default_width: 62,
          width: 220,
          height: 128,
          tags: ["gamble", "rich", "money", "bon"],
        },
        "RICH": {
          url: "https://i.ibb.co/BsYqy7Q/RICH.gif",
          default_width: 42,
          width: 124,
          height: 128,
          tags: ["gamble", "rich", "money", "bon"],
        },
        "rockhuh": {
          url: "https://i.ibb.co/CH8mY0w/huh.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["huh", "ayo", "sus"],
        },
        "sus": {
          url: "https://i.ibb.co/VVJqBLS/huhh.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["huh", "ayo", "sus"],
        },
        "huh": {
          url: "https://ptpimg.me/12kx8m.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["huh", "ayo", "sus"],
        },
        "AYO": {
          url: "https://i.ibb.co/Vx9jZB9/ayo.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["huh", "ayo", "sus"],
        },
        "jusreadin": {
          url: "https://i.ibb.co/0XfB6gs/reading.gif",
          default_width: 42,
          width: 64,
          height: 64,
          tags: ["huh", "ayo", "sus", "mm", "really"],
        },
        "sideeye": {
          url: "https://i.ibb.co/B2k8cX5/sideeye.jpg",
          default_width: 42,
          width: 400,
          height: 400,
          tags: ["huh", "ayo", "sus"],
        },
        "saythatagain": {
          url: "https://i.ibb.co/HTTgfcB/saythatagain.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["huh", "ayo", "sus"],
        },
        "dafuq": {
          url: "https://i.ibb.co/m6M0h46/dafuq.gif",
          default_width: 42,
          width: 132,
          height: 128,
          tags: ["huh", "ayo", "sus"],
        },
        "ultramad": {
          url: "https://ptpimg.me/vbg6q3.png",
          default_width: 42,
          width: 152,
          height: 128,
          tags: ["mad", "angry", "mm", "really"],
        },
        "slightlymad": {
          url: "https://ptpimg.me/ut9wv7.png",
          default_width: 62,
          width: 180,
          height: 128,
          tags: ["mad", "angry", "mm", "really"],
        },
        "reallymad": {
          url: "https://ptpimg.me/znro3o.png",
          default_width: 42,
          width: 132,
          height: 128,
          tags: ["mad", "angry", "mm", "really"],
        },
        "rage": {
          url: "https://ptpimg.me/cqu9qr.gif",
          default_width: 62,
          width: 180,
          height: 128,
          tags: ["mad", "angry", "cat"],
        },
        "angytype": {
          url: "https://ptpimg.me/c51694.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: ["mad", "angry", "cat"],
        },
        "fucku": {
          url: "https://i.ibb.co/V3PwZbm/fucku.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["mad", "angry", "stfu"],
        },
        "sadd": {
          url: "https://i.ibb.co/CV28H5h/sad.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cat", "sad", "crying"],
        },
        "reallysad": {
          url: "https://ptpimg.me/m9f985.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["sad", "crying", "really", "mm"],
        },
        "despair": {
          url: "https://i.ibb.co/jw54JGh/despair.gif",
          default_width: 42,
          width: 132,
          height: 128,
          tags: ["sad", "despair", "disappointed"],
        },
        "WHY": {
          url: "https://i.ibb.co/rMCxjNk/WHY.gif",
          default_width: 42,
          width: 108,
          height: 128,
          tags: ["sad", "despair", "disappointed", "why"],
        },
        "fishWhy": {
          url: "https://i.ibb.co/Rh6R3d8/fishWhy.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["sad", "despair", "disappointed", "why"],
        },
        "WAIT": {
          url: "https://i.ibb.co/ncKxwPT/WAIT.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["reality", "huh", "ayo", "sus"],
        },
        "NotLikeThis": {
          url: "https://i.ibb.co/jWnRZXL/Not-Like-This.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["sad", "despair", "disappointed", "why"],
        },
        "pandaWhy": {
          url: "https://i.ibb.co/r4X4222/pandaWhy.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["sad", "despair", "disappointed", "why"],
        },
        "crychattin": {
          url: "https://i.ibb.co/nCKTC2Z/crychattin.gif",
          default_width: 42,
          width: 64,
          height: 64,
          tags: ["sad", "crying", "chatting"],
        },
        ":c": {
          url: "https://i.ibb.co/8rYWwgH/grump.gif",
          default_width: 42,
          width: 120,
          height: 124,
          tags: [":(", "angry", "sad", "cat"],
        },
        "lmaoo": {
          url: "https://i.ibb.co/VVYHjL0/lmao.png",
          default_width: 42,
          width: 164,
          height: 128,
          tags: ["lol", "lmao", "laughing", "hahahaha"],
        },
        "laught": {
          url: "https://i.ibb.co/xj0zTCS/haha.jpg",
          default_width: 42,
          width: 108,
          height: 128,
          tags: ["lol", "lmao", "laughing", "hahahaha"],
        },
        "comedy": {
          url: "https://ptpimg.me/x0rx70.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["lol", "lmao", "laughing", "hahahaha", "mm", "really"],
        },
        "giggle": {
          url: "https://ptpimg.me/f9opi2.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["lol", "lmao", "laughing", "hahahaha", "mm", "really"],
        },
        "xdd": {
          url: "https://i.ibb.co/0jJS1jg/xdd.gif",
          default_width: 62,
          width: 228,
          height: 128,
          tags: ["lol", "lmao", "laughing", "hahahaha"],
        },
        "hahaso": {
          url: "https://i.ibb.co/4SF12vP/hahaso.gif",
          default_width: 42,
          width: 200,
          height: 200,
          tags: ["lol", "lmao", "laughing", "hahahaha"],
        },
        "kek": {
          url: "https://i.ibb.co/3v9GfYD/kekW.gif",
          default_width: 42,
          width: 200,
          height: 174,
          tags: ["lol", "lmao", "laughing", "hahahaha"],
        },
        "HEH": {
          url: "https://i.ibb.co/wdbC1HV/HEH.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["lol", "lmao", "laughing", "hahahaha"],
        },
        "imdead": {
          url: "https://i.ibb.co/ByPq8s5/imdead.gif",
          default_width: 42,
          width: 156,
          height: 128,
          tags: ["dead", "lol", "lmao", "laughing", "hahahaha"],
        },
        "dead": {
          url: "https://i.ibb.co/q1vQxxs/dead.gif",
          default_width: 42,
          width: 124,
          height: 128,
          tags: ["lol", "lmao", "laughing", "hahahaha", "mm", "really"],
        },
        "shockedmonkey": {
          url: "https://i.ibb.co/qCFdGh4/shockedmonkey.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: [":o", "shocked", "shocking", "monkey"],
        },
        "shookt": {
          url: "https://i.ibb.co/R6R3Dcm/shookt.gif",
          default_width: 42,
          width: 200,
          height: 154,
          tags: [":o", "shocked", "shocking"],
        },
        "ohno": {
          url: "https://i.ibb.co/SKPHp6c/ohno.gif",
          default_width: 42,
          width: 120,
          height: 128,
          tags: ["sad", "despair", "disappointed", "monkey"],
        },
        "whatda": {
          url: "https://i.ibb.co/YTDbxm1/WHAT.gif",
          default_width: 62,
          width: 188,
          height: 128,
          tags: [":o", "shocked", "shocking"],
        },
        "joe": {
          url: "https://i.ibb.co/JBncpnh/OOOOO.gif",
          default_width: 62,
          width: 180,
          height: 128,
          tags: [":o", "shocked", "shocking"],
        },
        ":o": {
          url: "https://i.ibb.co/1Z0sS6J/OO.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: [":o", "shocked", "shocking", "monkey"],
        },
        "D:": {
          url: "https://i.ibb.co/zs2dHW2/gasp.png",
          default_width: 32,
          width: 128,
          height: 128,
          tags: ["gasp", "shocked", "shocking"],
        },
        "reallyshocked": {
          url: "https://i.ibb.co/qmrdfk2/reallyshocked.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: [":o", "shocked", "shocking", "mm", "really"],
        },
        "dogWTF": {
          url: "https://i.ibb.co/dm3ZfS4/out.png",
          default_width: 42,
          width: 200,
          height: 209,
          tags: [":o", "shocked", "shocking"],
        },
        "yawn": {
          url: "https://ptpimg.me/l4l3r6.png",
          default_width: 42,
          width: 120,
          height: 128,
          tags: ["bored", "tired", "sleepy", "mm", "really"],
        },
        "sleepy": {
          url: "https://i.ibb.co/b5Svttf/sleepy.gif",
          default_width: 42,
          width: 140,
          height: 128,
          tags: ["bored", "tired", "sleepy"],
        },
        "gnite": {
          url: "https://i.ibb.co/rp5zSBF/gnite.gif",
          default_width: 62,
          width: 188,
          height: 128,
          tags: ["bored", "tired", "sleepy"],
        },
        "calculate": {
          url: "https://i.ibb.co/4TvHZM0/calculate.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["math", "brain", "thinking"],
        },
        "reallythinking": {
          url: "https://i.ibb.co/Qr0dNwj/reallythinking.gif",
          default_width: 42,
          width: 124,
          height: 128,
          tags: ["brain", "thinking", "mm", "really"],
        },
        "smart": {
          url: "https://i.ibb.co/nRfYr0H/smart.gif",
          default_width: 42,
          width: 124,
          height: 128,
          tags: ["brain", "thinking"],
        },
        "nerdbob": {
          url: "https://i.ibb.co/mbndBMC/nerdbob.gif",
          default_width: 42,
          width: 176,
          height: 128,
          tags: ["brain", "thinking"],
        },
        "nerD": {
          url: "https://i.ibb.co/1X6YBwF/nerd.gif",
          default_width: 42,
          width: 160,
          height: 128,
          tags: ["actually", "brain", "thinking"],
        },
        "thinking": {
          url: "https://i.ibb.co/WfrH9db/thinking.gif",
          default_width: 42,
          width: 136,
          height: 128,
          tags: ["brain", "thinking", "really", "mm"],
        },
        "hmmm": {
          url: "https://i.ibb.co/TvtNp9v/hmmm.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["brain", "thinking"],
        },
        "actually": {
          url: "https://i.ibb.co/4YD9gGK/actually.gif",
          default_width: 42,
          width: 152,
          height: 128,
          tags: ["brain", "thinking"],
        },
        "ionkno": {
          url: "https://i.ibb.co/Khpw97t/ionkno.png",
          default_width: 62,
          width: 184,
          height: 128,
          tags: ["mm", "i don't know", "really"],
        },
        "Erm": {
          url: "https://i.ibb.co/TbJypyv/Erm.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["brain", "thinking", "cat"],
        },
        "noted": {
          url: "https://i.ibb.co/qn0w6N5/noted.gif",
          default_width: 42,
          width: 156,
          height: 128,
          tags: ["brain", "thinking", "learning"],
        },
        "anyaNoted": {
          url: "https://i.ibb.co/7RRwKsW/Anya-Noted.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["brain", "thinking", "learning", "noted"],
        },
        "brainhurt": {
          url: "https://i.ibb.co/bL7hLm7/brainhurt.gif",
          default_width: 42,
          width: 140,
          height: 128,
          tags: ["brain", "thinking"],
        },
        "princessK": {
          url: "https://i.ibb.co/ncXFzLk/princess-K.png",
          default_width: 42,
          width: 415,
          height: 537,
          tags: ["selen", "catfish"],
        },
        "feltcute": {
          url: "https://ptpimg.me/20180i.png",
          default_width: 42,
          width: 50,
          height: 66,
          tags: ["horny", "feet"],
        },
        "NOHORNY": {
          url: "https://i.ibb.co/4ZSn3gh/NOHORNY.gif",
          default_width: 62,
          width: 292,
          height: 128,
          tags: ["horny"],
        },
        "kok": {
          url: "https://i.ibb.co/nLpSJnt/kok.gif",
          default_width: 42,
          width: 132,
          height: 128,
          tags: ["horny", "cat"],
        },
        "marinFlushed": {
          url: "https://i.ibb.co/JkbCdd4/marin-Flush.gif",
          default_width: 42,
          width: 176,
          height: 128,
          tags: ["horny", "weeb"],
        },
        "Shyboi": {
          url: "https://i.ibb.co/HHYvzX4/shyboi.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["horny", "shy", "flushed"],
        },
        "mikeW": {
          url: "https://i.ibb.co/QPh8DFq/mikeW.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["horny", "shy", "flushed"],
        },
        "awooga": {
          url: "https://i.ibb.co/QHQ5r8g/AWOOGA.gif",
          default_width: 62,
          width: 256,
          height: 128,
          tags: ["horny"],
        },
        "hubba": {
          url: "https://i.ibb.co/YcgqY7Z/hubbahubba.gif",
          default_width: 42,
          width: 144,
          height: 128,
          tags: ["horny"],
        },
        "lip": {
          url: "https://i.ibb.co/hVm1ngL/4x.png",
          default_width: 32,
          width: 128,
          height: 128,
          tags: ["horny"],
        },
        "feet": {
          url: "https://ptpimg.me/622oxi.png",
          default_width: 42,
          width: 132,
          height: 128,
          tags: ["horny"],
        },
        "boobies": {
          url: "https://i.ibb.co/SxFdK06/boobies.gif",
          default_width: 42,
          width: 184,
          height: 184,
          tags: ["horny", "weeb"],
        },
        "munn": {
          url: "https://i.ibb.co/Rz5QB5Y/tham.gif",
          default_width: 42,
          width: 418,
          height: 418,
          tags: ["horny"],
        },
        "2munn": {
          url: "https://i.ibb.co/yB0DHgx/2tham.gif",
          default_width: 42,
          width: 300,
          height: 300,
          tags: ["horny"],
        },
        "MOMMY": {
          url: "https://i.ibb.co/xMJTSL0/MOMMY.gif",
          default_width: 42,
          width: 164,
          height: 128,
          tags: ["horny"],
        },
        "Sussy": {
          url: "https://i.ibb.co/12h70YT/Sussy.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["horny", "twerking"],
        },
        "mcqSus": {
          url: "https://i.ibb.co/gzMx7NM/mcqSus.gif",
          default_width: 62,
          width: 324,
          height: 128,
          tags: ["horny", "smirk", "sus", "car"],
        },
        "selen98": {
          url: "https://i.ibb.co/9gqPFdM/jackdad.gif",
          default_width: 42,
          width: 96,
          height: 96,
          tags: ["horny", "flushed"],
        },
        "coffeeTime": {
          url: "https://i.ibb.co/bbxhc3n/coffee-Time.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["coffee"],
        },
        "demontime": {
          url: "https://i.ibb.co/19M9Z9q/demontime.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cat", "evil"],
        },
        "SFA": {
          url: "https://i.ibb.co/Htbgx17/sfa.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["russian", "ruski", "putin"],
        },
        "putinRide": {
          url: "https://i.ibb.co/1MqSc3N/putin-Ride.png",
          default_width: 42,
          width: 583,
          height: 700,
          tags: ["russian", "ruski", "putin"],
        },
        "chadmirPutin": {
          url: "https://i.ibb.co/x1fMKMG/chadmirputin.png",
          default_width: 42,
          width: 500,
          height: 500,
          tags: ["russian", "ruski", "putin"],
        },
        "putinLaugh": {
          url: "https://i.ibb.co/c83XfBT/putin-Laugh.gif",
          default_width: 62,
          width: 498,
          height: 350,
          tags: ["russian", "ruski", "putin", "lol", "laughing", "funny"],
        },
        "surething": {
          url: "https://i.ibb.co/pWkmzSL/surething.gif",
          default_width: 42,
          width: 218,
          height: 234,
          tags: ["russian", "ruski", "putin"],
        },
        "putinApprove": {
          url: "https://i.ibb.co/VJ2HYDR/putin-Approve.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["russian", "ruski", "putin"],
        },
        "putinwalk": {
          url: "https://i.ibb.co/C6LT6NP/walkin.gif",
          default_width: 62,
          width: 384,
          height: 112,
          tags: ["russian", "ruski", "putin"],
        },
        "putinDance": {
          url: "https://ptpimg.me/0lm04u.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: ["russian", "ruski", "putin", "dance"],
        },
        "putinSquat": {
          url: "https://i.ibb.co/qMZJRBD/putinsquat.png",
          default_width: 42,
          width: 250,
          height: 318,
          tags: ["russian", "ruski", "putin"],
        },
        "putinAttack": {
          url: "https://i.ibb.co/4S2yh9h/putin-Attack.png",
          default_width: 42,
          width: 250,
          height: 361,
          tags: ["russian", "ruski", "putin"],
        },
        "putinDive": {
          url: "https://i.ibb.co/M7bs5hD/putin-Dive.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["russian", "ruski", "putin"],
        },
        "TFuSay": {
          url: "https://i.ibb.co/vJ0Q7L3/tfuSay.gif",
          default_width: 42,
          width: 120,
          height: 128,
          tags: ["russian", "ruski", "putin", "huh", "wtf", "sus", "ayo"],
        },
        "slammed": {
          url: "https://i.ibb.co/QftjRBj/slammed.gif",
          default_width: 62,
          width: 228,
          height: 128,
          tags: ["wwe", "fight", "stfu"],
        },
        "catpunch": {
          url: "https://i.ibb.co/CzmzYM6/4x.gif",
          default_width: 42,
          width: 136,
          height: 128,
          tags: ["fight", "stfu", "cat"],
        },
        "hasbullaFight": {
          url: "https://i.ibb.co/2kmsP8b/Hasbulla-Fight.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["fight", "stfu"],
        },
        "squareUp": {
          url: "https://i.ibb.co/drw3sfk/Iwill-Beat-Yo-Ass.gif",
          default_width: 42,
          width: 108,
          height: 128,
          tags: ["fight", "stfu"],
        },
        "STFU": {
          url: "https://i.ibb.co/nR9yQTJ/STFU.gif",
          default_width: 62,
          width: 228,
          height: 128,
          tags: ["fight", "stfu"],
        },
        "mhm": {
          url: "https://i.ibb.co/KX1yjks/mhm.gif",
          default_width: 42,
          width: 148,
          height: 128,
          tags: ["agreed"],
        },
        "gandi": {
          url: "https://i.ibb.co/Cbnn4hY/gandi.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["yes"],
        },
        "NOPERS": {
          url: "https://i.ibb.co/wYZTNfy/NOPERS.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["no"],
        },
        "HARAM": {
          url: "https://i.ibb.co/KLy10rQ/HARAM.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["islam"],
        },
        "EmiruYuck": {
          url: "https://i.ibb.co/88LRNrP/Emiru-Yuck.gif",
          default_width: 42,
          width: 136,
          height: 128,
          tags: ["ew", "gross"],
        },
        "barf": {
          url: "https://ptpimg.me/is0oh0.gif",
          default_width: 42,
          width: 150,
          height: 150,
          tags: ["ew", "gross"],
        },
        "waiting": {
          url: "https://i.ibb.co/3BSDnmb/waiting.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["waiting"],
        },
        "spongeWait": {
          url: "https://i.ibb.co/wCNSGsJ/SpongeWait.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["waiting"],
        },
        "pabloWait": {
          url: "https://i.ibb.co/w7Dk3bv/pablo-Wait.gif",
          default_width: 62,
          width: 192,
          height: 128,
          tags: ["waiting"],
        },
        "monkWait": {
          url: "https://i.ibb.co/M7z1yXJ/monkwait.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["waiting", "monkey"],
        },
        "sealWait": {
          url: "https://i.ibb.co/Cm9fy29/seal-Waiting.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["waiting"],
        },
        "tf": {
          url: "https://ptpimg.me/44b994.png",
          default_width: 42,
          width: 156,
          height: 128,
          tags: ["trolling"],
        },
        "watchit": {
          url: "https://i.ibb.co/99nnv04/watchit.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["careful"],
        },
        "trash": {
          url: "https://i.ibb.co/G2Wx8WL/trash.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["boys", "theboys"],
        },
        "STRESSED": {
          url: "https://i.ibb.co/Lg3GhnL/STRESSED.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["boys", "theboys"],
        },
        "stonecold": {
          url: "https://i.ibb.co/N96Z2Bp/stonecold.gif",
          default_width: 42,
          width: 172,
          height: 128,
          tags: ["wwe", "beer"],
        },
        "ALRIGHT": {
          url: "https://i.ibb.co/c82Tz05/ALRIGHT.gif",
          default_width: 62,
          width: 228,
          height: 128,
          tags: ["boys", "theboys"],
        },
        "shy": {
          url: "https://ptpimg.me/olw327.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: ["lurking"],
        },
        "ascared": {
          url: "https://ptpimg.me/qbf200.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: ["scared"],
        },
        "caughtme": {
          url: "https://i.ibb.co/2KhYFs3/caughtme.gif",
          default_width: 62,
          width: 244,
          height: 128,
          tags: ["really", "mm"],
        },
        "spotted": {
          url: "https://i.ibb.co/BNh18pp/spotted.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: [],
        },
        "modCheck": {
          url: "https://i.ibb.co/fn2BxN6/modCheck.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["where"],
        },
        "whereTho": {
          url: "https://i.ibb.co/Zft4RCV/whereTho.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["where"],
        },
        "niceone": {
          url: "https://i.ibb.co/c8TjJ7T/niceone.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["notfunny"],
        },
        "dealwithit": {
          url: "https://ptpimg.me/321azk.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: [],
        },
        "poop": {
          url: "https://ptpimg.me/a8mn3s.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: [],
        },
        "prideFlag": {
          url: "https://i.ibb.co/72bZMp6/image.gif",
          default_width: 42,
          width: 540,
          height: 540,
          tags: ["chad", "lgbt", "gay", "pride"],
        },
        "parrot": {
          url: "https://i.ibb.co/yB4fCfp/parrot.gif",
          default_width: 62,
          width: 228,
          height: 128,
          tags: ["chad", "lgbt", "gay", "pride"],
        },
        "killua": {
          url: "https://i.ibb.co/98g7bxb/killua.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["hxh"],
        },
        "mamamia": {
          url: "https://i.ibb.co/CmZR8p7/mamamia.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["italy"],
        },
        "ayoh": {
          url: "https://i.ibb.co/3v22m5B/ayoh.gif",
          default_width: 42,
          width: 156,
          height: 128,
          tags: ["italy"],
        },
        "loopy": {
          url: "https://ptpimg.me/vmq38q.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: [],
        },
        "excellent": {
          url: "https://i.ibb.co/P98kJ53/excellent.gif",
          default_width: 42,
          width: 172,
          height: 128,
          tags: ["plotting", "evil"],
        },
        "plottin": {
          url: "https://ptpimg.me/df30z2.gif",
          default_width: 42,
          width: 256,
          height: 256,
          tags: ["plotting", "evil"],
        },
        "empty": {
          url: "https://i.ibb.co/wStC9f3/empty.png",
          default_width: 42,
          width: 54,
          height: 54,
          tags: [],
        },
        "dumbo": {
          url: "https://i.ibb.co/yh05yVs/dumbo.png",
          default_width: 42,
          width: 54,
          height: 54,
          tags: [],
        },
        "brothers": {
          url: "https://i.ibb.co/X3KvpHs/brothers.png",
          default_width: 42,
          width: 54,
          height: 54,
          tags: [],
        },
        "CHAD": {
          url: "https://i.ibb.co/Rb7L1Mk/chad.gif",
          default_width: 42,
          width: 184,
          height: 184,
          tags: [],
        },
        "dino": {
          url: "https://i.ibb.co/QXSj9RT/dino.gif",
          default_width: 42,
          width: 184,
          height: 184,
          tags: [],
        },
        "skatin": {
          url: "https://i.ibb.co/QFGB0Rp/skatin.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["hxh", "killua"],
        },
        "whatido": {
          url: "https://i.ibb.co/CK1zY7k/whatido.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["50cent"],
        },
        "mmkay": {
          url: "https://i.ibb.co/3NnYDyt/out.png",
          default_width: 42,
          width: 300,
          height: 256,
          tags: [],
        },
        "Risenocular": {
          url: "https://i.ibb.co/XLLg8w9/risenoculars.gif",
          default_width: 42,
          width: 168,
          height: 128,
          tags: ["spotted"],
        },
        "LETHIMCOOK": {
          url: "https://i.ibb.co/NWC2108/LETHIMCOOK.gif",
          default_width: 42,
          width: 144,
          height: 128,
          tags: ["cooking"],
        },
        "jacksaw": {
          url: "https://i.ibb.co/hcBRQkD/jacksaw.png",
          default_width: 42,
          width: 142,
          height: 142,
          tags: ["cow"],
        },
        "KANE": {
          url: "https://i.ibb.co/bLnTKWL/KANE.gif",
          default_width: 62,
          width: 196,
          height: 128,
          tags: [],
        },
        "chatting": {
          url: "https://i.ibb.co/jTYXKTg/chatting.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["typing", "mm", "really"],
        },
        "bratwu": {
          url: "https://i.ibb.co/k834WdR/bratwur.png",
          default_width: 42,
          width: 132,
          height: 128,
          tags: ["germany", "tham", "mm", "really"],
        },
        "Caught": {
          url: "https://i.ibb.co/JFJxSmX/4k.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["4k"],
        },
        "innocent": {
          url: "https://i.ibb.co/2dtCYGW/innocent.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["mm", "really"],
        },
        "reallycool": {
          url: "https://i.ibb.co/6vrY0km/reallycool.gif",
          default_width: 42,
          width: 176,
          height: 128,
          tags: ["mm", "really", "cool"],
        },
        "fbi": {
          url: "https://i.ibb.co/fr64Fn6/fbi.png",
          default_width: 62,
          width: 228,
          height: 128,
          tags: ["mm", "really", "lockhimup"],
        },
        "ho7": {
          url: "https://i.ibb.co/5BD98yj/ho7.png",
          default_width: 42,
          width: 255,
          height: 324,
          tags: ["salute"],
        },
        "o7": {
          url: "https://i.ibb.co/5sqKm4Y/o7.png",
          default_width: 42,
          width: 164,
          height: 128,
          tags: ["salute"],
        },
        "gamin": {
          url: "https://i.ibb.co/f0WhLk3/gamin.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["rayn"],
        },
        "popcorn": {
          url: "https://i.ibb.co/pjJGfkf/popcorn.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["eating"],
        },
        "catcorn": {
          url: "https://i.ibb.co/MZ4Yf7R/catpopcorn.png",
          default_width: 42,
          width: 150,
          height: 150,
          tags: ["eating", "cat"],
        },
        "clown": {
          url: "https://i.ibb.co/R6gGdfX/clown.gif",
          default_width: 42,
          width: 64,
          height: 64,
          tags: [],
        },
        "ban": {
          url: "https://i.ibb.co/CwvHRhd/4x.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: [],
        },
        "sexo": {
          url: "https://i.ibb.co/ykCgkyS/sexo.gif",
          default_width: 42,
          width: 80,
          height: 128,
          tags: ["horny"],
        },
        "classic": {
          url: "https://i.ibb.co/kytwYGd/classic.gif",
          default_width: 42,
          width: 164,
          height: 128,
          tags: [],
        },
        "cowDance": {
          url: "https://i.ibb.co/ZcWgWVT/qwe.gif",
          default_width: 62,
          width: 456,
          height: 362,
          tags: ["dance"],
        },
        "CT": {
          url: "https://i.ibb.co/7yMn3Zw/CT.gif",
          default_width: 42,
          width: 355,
          height: 379,
          tags: ["praying"],
        },
        "sbKick": {
          url: "https://ptpimg.me/nuvrb8.gif",
          default_width: 42,
          width: 80,
          height: 118,
          tags: ["fight", "strongbad"],
        },
        "sbKO": {
          url: "https://ptpimg.me/ny9vi9.gif",
          default_width: 42,
          width: 80,
          height: 118,
          tags: ["fight", "strongbad"],
        },
        "sbSpin": {
          url: "https://ptpimg.me/x9s0d0.gif",
          default_width: 42,
          width: 80,
          height: 118,
          tags: ["thumbup", "strongbad"],
        },
        "sbLunch": {
          url: "https://ptpimg.me/9j3e8p.gif",
          default_width: 42,
          width: 80,
          height: 118,
          tags: ["strongbad"],
        },
        "sbSmash": {
          url: "https://ptpimg.me/9g9lh7.gif",
          default_width: 42,
          width: 140,
          height: 116,
          tags: ["strongbad", "fight"],
        },
        "kdotsmash": {
          url: "https://i.ibb.co/W5KKjcZ/zxc.gif",
          default_width: 62,
          width: 256,
          height: 192,
          tags: ["fight", "kendrick", "punch"],
        },
        "offToWork": {
          url: "https://i.ibb.co/jgRZZb8/off-To-Work.gif",
          default_width: 62,
          width: 174,
          height: 222,
          tags: ["penguin", "working", "leaving"],
        },
        "RaynMan": {
          url: "https://i.ibb.co/3WTFqFZ/RaynMan.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["boomer", "old", "angry"],
        },
        "junesOver": {
          url: "https://i.ibb.co/Cmwb0BG/junes-Over.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["gay", "homophobic", "dog"],
        },
        "NotTooFond": {
          url: "https://i.ibb.co/ZTttJgC/Not-Too-Fond.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["gay", "homophobic", "dog"],
        },
        "angryDog": {
          url: "https://i.ibb.co/1J29sGP/angryDog.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["angry", "dog", "rage", "mad"],
        },
        "Capping": {
          url: "https://i.ibb.co/dDSCD8p/Capping.png",
          default_width: 42,
          width: 148,
          height: 128,
          tags: ["sus", "capping", "dog", "imontoyou"],
        },
        "SnackTime": {
          url: "https://i.ibb.co/37PvZnv/Snack-Time.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["horny", "dog", "hungry"],
        },
        "BOOBA": {
          url: "https://i.ibb.co/3sfdxjC/BOOBA.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["horny", "pepe"],
        },
        "beerTime": {
          url: "https://i.ibb.co/FJKwxFG/beerTime.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["beer", "thirsty", "time"],
        },
        "reallyThirsty": {
          url: "https://i.ibb.co/wzQZxkr/really-Thirsty.gif",
          default_width: 42,
          width: 168,
          height: 128,
          tags: ["beer", "thirsty", "really", "mm"],
        },
        "ricecooker": {
          url: "https://i.ibb.co/B29GvsD/ricecooker.png",
          default_width: 42,
          width: 400,
          height: 353,
          tags: ["rice"],
        },
        "smiliebeer": {
          url: "https://i.ibb.co/z500kf7/smiliebeer.gif",
          default_width: 60,
          width: 60,
          height: 18,
          tags: ["beer", "thirsty", "cheers"],
        },
        "weebBeer": {
          url: "https://i.ibb.co/xXh1TkT/weebBeer.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["weeb", "beer", "thirsty"],
        },
        "cageArrive": {
          url: "https://i.ibb.co/0mtFWtQ/cage-Arrive.gif",
          default_width: 62,
          width: 192,
          height: 128,
          tags: ["arrive"],
        },
        "cageGiggle": {
          url: "https://i.ibb.co/5TFfCvQ/cage-Giggle.gif",
          default_width: 42,
          width: 512,
          height: 512,
          tags: ["lol", "lmao", "laughing", "hahahaha"],
        },
        "cageLaser": {
          url: "https://i.ibb.co/5x3DNnY/cage-Laser.gif",
          default_width: 62,
          width: 356,
          height: 128,
          tags: [],
        },
        "cageRelax": {
          url: "https://i.ibb.co/qW3FtkS/cage-Relax.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["relax"],
        },
        "cageWink": {
          url: "https://i.ibb.co/tCgcyPF/cageWink.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["horny", "wink"],
        },
        "feelsSadMan": {
          url: "https://i.ibb.co/PhBm9zg/feels-Sad-Man.gif",
          default_width: 42,
          width: 512,
          height: 512,
          tags: ["sad", "crying"],
        },
        "NoNo": {
          url: "https://i.ibb.co/1TGGMTM/NoNo.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["nope", "cat"],
        },
        "NONONO": {
          url: "https://i.ibb.co/G7GNdTx/NONONO.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["nope", "weeb"],
        },
        "rabbitFok": {
          url: "https://i.ibb.co/V2qYsJ7/rabbit-Fok.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: [],
        },
        "RIPBOZO": {
          url: "https://i.ibb.co/g6g61cs/RIPBOZO.gif",
          default_width: 52,
          width: 128,
          height: 128,
          tags: ["restinpeace", "raynman"],
        },
        "runOver": {
          url: "https://i.ibb.co/gy11ZRk/runOver.gif",
          default_width: 42,
          width: 512,
          height: 512,
          tags: ["angry"],
        },
        "yesYes": {
          url: "https://i.ibb.co/31DV8rx/yesYes.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["agreed"],
        },
        "yesyesBusiness": {
          url: "https://i.ibb.co/KwGkP1v/yesyes-Business.gif",
          default_width: 42,
          width: 108,
          height: 128,
          tags: ["agreed", "gamble", "gamba"],
        },
        "YOUDONTSAY": {
          url: "https://i.ibb.co/DMM81dJ/YOUDONTSAY.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cage"],
        },
        "GYAT": {
          url: "https://i.ibb.co/PhbgGJm/GYAT.gif",
          default_width: 42,
          width: 480,
          height: 480,
          tags: ["horny", "twerk", "booty"],
        },
        "fukoDuck": {
          url: "https://i.ibb.co/jZ2tR2k/fukoDuck.gif",
          default_width: 62,
          width: 200,
          height: 133,
          tags: ["kolt", "fuko", "weeb", "twerk"],
        },
        "raynPopcorn": {
          url: "https://i.ibb.co/kGFX1jt/123.png",
          default_width: 100,
          width: 226,
          height: 64,
          tags: ["raynman", "popcorn"],
        },
        "COCKA": {
          url: "https://i.ibb.co/qCvNy3Z/COCKA.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["booba", "horny"],
        },
        "cowass": {
          url: "https://i.ibb.co/qd6LCVG/cowass.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["twerk", "jacksaw"],
        },
        "cowUFO": {
          url: "https://i.ibb.co/jZ0p1qL/cowUFO.gif",
          default_width: 42,
          width: 500,
          height: 500,
          tags: ["jacksaw"],
        },
        "Meowdy": {
          url: "https://i.ibb.co/T2wZ3jr/meowdy.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["cat"],
        },
        "moo": {
          url: "https://i.ibb.co/WPyC8Y0/moo.gif",
          default_width: 62,
          width: 498,
          height: 326,
          tags: ["cow", "jacksaw"],
        },
        "peepoSitCowboyWithABigIronOnHisHipRidingOnAHorse": {
          url:
            "https://i.ibb.co/pQ8Gzvr/peepo-Sit-Cowboy-With-ABig-Iron-On-His-Hip-Riding-On-AHorse.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["kolt"],
        },
        "PHEW": {
          url: "https://i.ibb.co/k9R4Lsw/PHEW.gif",
          default_width: 62,
          width: 180,
          height: 128,
          tags: ["relieved", "really", "mm"],
        },
        "pheww": {
          url: "https://i.ibb.co/NNtWbZC/pheww.gif",
          default_width: 42,
          width: 144,
          height: 128,
          tags: ["relieved"],
        },
        "superCOCKA": {
          url: "https://i.ibb.co/64s7PFf/super-COCKA.gif",
          default_width: 82,
          width: 384,
          height: 124,
          tags: ["cocka", "booba"],
        },
        "ultraDuckass": {
          url: "https://i.ibb.co/f2ynYbP/ultra-Duckass.gif",
          default_width: 42,
          width: 498,
          height: 498,
          tags: ["duckass", "twerk"],
        },
        "sadge": {
          url: "https://i.ibb.co/8z8rXXm/sadge.png",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["sad"],
        },
        "cheers": {
          url: "https://ptpimg.me/va1g0i.gif",
          default_width: 42,
          width: 51,
          height: 28,
          tags: ["beer", "thanks"],
        },
        "cr7Sip": {
          url: "https://ptpimg.me/39gjga.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["drinking", "ronaldo"],
        },
        "gigachad": {
          url: "https://ptpimg.me/21c2ar.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["chad", "based"],
        },
        "yachtyOH": {
          url: "https://ptpimg.me/lzt4mc.gif",
          default_width: 62,
          width: 232,
          height: 128,
          tags: ["drake", "kjoe", "lilyachty", "oh", "isee"],
        },
        "AndreNO": {
          url: "https://ptpimg.me/a6i436.gif",
          default_width: 42,
          width: 172,
          height: 128,
          tags: ["no", "wwe", "notlikethis"],
        },
        "ANGRE": {
          url: "https://ptpimg.me/s5h50v.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["angry", "mad", "grumpy", "monkey"],
        },
        "AngryMonke": {
          url: "https://ptpimg.me/1j8i21.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["angry", "mad", "grumpy", "monkey"],
        },
        "annoyed": {
          url: "https://ptpimg.me/1840r6.gif",
          default_width: 42,
          width: 132,
          height: 128,
          tags: ["angry", "mad", "grumpy", "cat"],
        },
        "beetleSlap": {
          url: "https://ptpimg.me/45ejwk.gif",
          default_width: 42,
          width: 96,
          height: 128,
          tags: ["beetlejuice", "fight", "punch"],
        },
        "catLeave": {
          url: "https://ptpimg.me/520033.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["leaving", "leave", "bye"],
        },
        "catWave": {
          url: "https://ptpimg.me/e3sfze.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["hi", "cat", "wave"],
        },
        "CONFUSED": {
          url: "https://ptpimg.me/023tgv.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["rock", "huh"],
        },
        "Dodged": {
          url: "https://ptpimg.me/m1zoc4.gif",
          default_width: 42,
          width: 168,
          height: 128,
          tags: ["weave", "dodged"],
        },
        "DuckStare": {
          url: "https://ptpimg.me/mbq06b.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["sus", "awkward"],
        },
        "EZDodge": {
          url: "https://ptpimg.me/l1btn8.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["weave", "dodged"],
        },
        "gulp": {
          url: "https://ptpimg.me/1h5dj2.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["nervous"],
        },
        "happyCat": {
          url: "https://ptpimg.me/99v2hb.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["happy", "cat"],
        },
        "jerryBye": {
          url: "https://ptpimg.me/0om1qn.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["bye", "wave"],
        },
        "kermitWorried": {
          url: "https://ptpimg.me/k5j489.gif",
          default_width: 42,
          width: 124,
          height: 128,
          tags: ["worried", "nervous"],
        },
        "monKEK": {
          url: "https://ptpimg.me/ffp05g.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["lol", "monkey", "lmao"],
        },
        "noWay": {
          url: "https://ptpimg.me/4i469f.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["ohno", "notlikethis", "jerry", "sad"],
        },
        "pikaBye": {
          url: "https://ptpimg.me/92i3wl.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["pikachu", "bye"],
        },
        "PISSED": {
          url: "https://ptpimg.me/8k00m0.gif",
          default_width: 42,
          width: 156,
          height: 128,
          tags: ["cat", "angry", "mad", "grumpy"],
        },
        "RKO": {
          url: "https://ptpimg.me/h2vl64.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["wwe", "fight", "slammed"],
        },
        "sealLeave": {
          url: "https://ptpimg.me/q1q691.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["leave", "leaving", "bye"],
        },
        "SHUTUP": {
          url: "https://ptpimg.me/74gv71.gif",
          default_width: 62,
          width: 228,
          height: 128,
          tags: ["fight", "punch", "squidward"],
        },
        "suk": {
          url: "https://ptpimg.me/plin4t.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["angry", "mad", "grumpy"],
        },
        "Uhm": {
          url: "https://ptpimg.me/0n8ofl.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["awkward", "sideeye"],
        },
        "vinnieGulp": {
          url: "https://ptpimg.me/7f02gs.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["wwe", "vince", "nervous", "gulp"],
        },
        "wave": {
          url: "https://ptpimg.me/73h4a7.gif",
          default_width: 42,
          width: 128,
          height: 128,
          tags: ["hi", "bye"],
        },
        "suckerPunch": {
          url: "https://ptpimg.me/4z2z8k.gif",
          default_width: 42,
          width: 360,
          height: 360,
          tags: ["fight", "punch", "cat"],
        },
        "catJAM": {
          url: "https://ptpimg.me/3doxd3.gif",
          default_width: 42,
          width: 56,
          height: 56,
          tags: ["dance", "jam", "cat"],
        },
        "creepBob": {
          url: "https://ptpimg.me/5f07ig.png",
          default_width: 42,
          width: 128,
          height: 126,
          tags: ["sus", "spongebob"],
        },
        "squidwardFace": {
          "url": "https://ptpimg.me/ep184r.png",
          "default_width": 62,
          "width": 359,
          "height": 307,
          "tags": [
            "squidward",
            "soulless"
          ]
        },
        "squidBegging": {
          "url": "https://ptpimg.me/h7yx8w.png",
          "default_width": 42,
          "width": 359,
          "height": 307,
          "tags": [
            "squidward",
            "money",
            "bon",
            "begging"
          ]
        }
      };
      makeMenu();
      orderEmotes();
    } catch (error) {
      console.error(error);
    }
  }
  /*------------------------PIN HANDLING-------------------- */
  // koltiscute
  function orderEmotes() {
    if (!defaultOrdering || defaultOrdering.length === 0) {
      console.error(
        "defaultOrdering is empty. Ensure that emote containers exist in the DOM."
      );
      return;
    }

    const pinnedEmotes =
      JSON.parse(localStorage.getItem("pinned-emotes")) || [];

    const pinnedElements = [];
    const nonPinnedElements = [];

    defaultOrdering.forEach((el) => {
      if (pinnedEmotes.includes(el.id)) {
        pinnedElements.push(el);
      } else {
        nonPinnedElements.push(el);
      }
    });

    const newOrder = [...pinnedElements, ...nonPinnedElements];

    const parent = defaultOrdering[0].parentNode;
    if (!parent) {
      return;
    }
    newOrder.forEach((el) => {
      parent.appendChild(el);
    });
  }

  function onPinClick(emoteId) {
    let pinnedEmotes = JSON.parse(localStorage.getItem("pinned-emotes")) || [];
    if (!pinnedEmotes.includes(emoteId)) {
      pinnedEmotes.push(emoteId);
    } else {
      pinnedEmotes = pinnedEmotes.filter((id) => id !== emoteId);
    }
    localStorage.setItem("pinned-emotes", JSON.stringify(pinnedEmotes));
    orderEmotes();
  }

  /* ----------------------------Emote-Handling------------------------------------- */
  function onEmoteClick(emote) {
    const { url } = emote;
    let size = getEmoteSize(sizePref, emote);
    const emoji = `[img=${size}]${url}[/img]`;
    chatForm.value = chatForm.value
      ? `${chatForm.value.trim()} ${emoji}`
      : emoji;
    chatForm.focus();
    chatForm.dispatchEvent(new Event("input", { bubbles: true }));
  }

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

    if (autofill && emotes[emojiCheck]) {
      let emote = emotes[emojiCheck];
      let size = getEmoteSize(sizePref, emote);
      messageParts[lastItemIndex] = `[img=${size}]${emote.url}[/img]`;
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

      if (lastItem.startsWith("!") && !emotes[emojiCheck]) {
        messageParts[lastItemIndex] = `[img]${lastItem.slice(1)}[/img]`;
        setChatFormValue(messageParts.join(""));
        return;
      }

      if (lastItem.startsWith("l!")) {
        messageParts[lastItemIndex] = `[url=${lastItem.slice(
          2
        )}][img]${lastItem.slice(2)}[/img][/url]`;
        setChatFormValue(messageParts.join(""));
        return;
      }
    }
  }
  /* ----------------------------Menus--------------------------------- */
  let emoteMenu;

  function makeMenu() {
    emoteMenu = document.createElement("div");
    emoteMenu.className = "emote-content";

    // Create search bar
    const searchBar = document.createElement("input");
    searchBar.type = "text";
    searchBar.placeholder = "Search emotes...";
    searchBar.className = "emote-search-bar";
    searchBar.addEventListener("input", filterEmotes);

    emoteMenu.appendChild(searchBar);

    // Fill the menu with all the emotes
    for (const [key, value] of Object.entries(emotes)) {
      createEmoteItem(key, value);
    }

    defaultOrdering = Array.from(
      emoteMenu.querySelectorAll(".emote-container")
    );

    function filterEmotes(event) {
      const searchTerm = event.target.value.toLowerCase();
      const emoteContainers = emoteMenu.querySelectorAll(".emote-container");
      emoteContainers.forEach((container) => {
        const tags = container.dataset.tags.split(" ");
        const matches = tags.some((tag) => tag.startsWith(searchTerm));
        container.style.display = matches ? "block" : "none";
      });
    }

    function createEmoteItem(key, value) {
      const { url, tags } = value;
      const emoteContainer = document.createElement("div");
      emoteContainer.classList.add("emote-container");
      emoteContainer.id = key;
      tags.push(key.toLowerCase());
      emoteContainer.dataset.tags = tags.join(" ").toLowerCase();

      const emoteLabel = document.createElement("p");
      emoteLabel.innerText = key;
      emoteLabel.classList.add("emote-label");

      const emoteItem = document.createElement("div");
      emoteItem.classList.add("emote-item");
      emoteItem.style.backgroundImage = `url(${url})`;
      emoteItem.addEventListener(
        "click",
        () => onEmoteClick(value) // pass down the emote object
      );

      const emotePin = document.createElement("i");
      emotePin.className = "fa fa-thumb-tack emote-pin";
      emotePin.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent the click from bubbling up to emoteItem
        onPinClick(key); // pass down the emote id
      });

      emoteItem.appendChild(emotePin);
      emoteContainer.appendChild(emoteItem);
      emoteContainer.appendChild(emoteLabel);
      emoteMenu.appendChild(emoteContainer);
    }
  }

  function createModal() {
    const existingMenu = document.getElementById("emote-menu");
    if (existingMenu) {
      existingMenu.style.display =
        existingMenu.style.display === "none" ? "block" : "none";
      return;
    }
    // Attempt to style the modal dynamically. Not great, but it works.
    const menuLeft =
      pageFlags.isChatbox || pageFlags.isNewTopic ? "60%" : "20%";
    const menuTop = pageFlags.isNewTopic ? "10%" : "20%";
    const modalStyler = `
        .emote-menu {
          left: ${menuLeft};
          top: ${menuTop};
          position: fixed;
          border-radius: 5px;
          z-index: 1;
          overflow: auto;
          background-color: rgba(0, 0, 0, 0.8);
        }
        .emote-menu #draggable {
          position: absolute;
          top: 10px;
          padding: 5px;
          cursor: grab;
        }
        .emote-menu #draggable:active {
          cursor: grabbing;
        }
        .emote-menu #topBtn {
          display: none;
          position: absolute;
          bottom: 20px;
          right: 5px;
          z-index: 99;
          border: none;
          outline: none;
          background-color: rgb(164, 164, 164);
          color: white;
          cursor: pointer;
          padding: 10px;
          border-radius: 10px;
          font-size: 18px;
        }
        .emote-menu #topBtn:hover {
          background-color: #555;
        }
        .emote-menu .emote-content {
          background-color: #1C1C1C;
          color: #CCCCCC;
          margin: 50px auto auto 0;
          padding: 20px;
          max-width: 300px;
          width: 300px;
          max-height: 250px;
          height: 250px;
          overflow: auto;
          position: relative;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: 40px;
          grid-auto-rows: max-content;
          gap: 10px;
        }
        .emote-menu .emote-item .emote-pin {
          display: none;
        }
        .emote-menu .emote-item:hover .emote-pin {
          display: block;
          position: absolute;
          bottom: 0;
          right: 0;
          cursor: pointer;
          padding: 2px;
          background: rgba(43, 43, 43, 0.7);
          border-radius: 2px;
        }
        .emote-menu .emote-label {
          max-width: 40px;
          width: 40px;
          font-size: 8px;
          text-align: center;
          text-overflow: ellipsis;
          overflow: hidden;
        }
        .emote-menu .emote-label:hover {
          position: absolute;
          overflow: visible;
          z-index: 9999;
        }
        .emote-menu .emote-container {
          max-width: 50px;
        }
        .emote-menu .emote-item {
          position: relative;
          width: 40px;
          height: 40px;
          cursor: pointer;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          transition: transform 0.1s;
        }
        .emote-menu .emote-item:hover {
          transform: scale(1.1);
        }
        .emote-menu .emote-search-bar {
          z-index: 999;
          position: sticky;
          top: 0;
          grid-column: 1/-1;
          background-color: rgba(51, 51, 51, 0.8196078431);
          color: #a1a1a1;
          height: 30px;
          border: none;
          border-radius: 3px;
          width: 100%;
          padding: 10px;
          box-sizing: border-box;
        }
        .emote-menu .menu-close,
        .emote-menu .menu-settings {
          background-color: transparent;
          color: #BBBBBB;
          position: absolute;
          top: 10px;
          padding: 5px;
          border: 0;
          cursor: pointer;
          transition: opacity 0.1s;
        }
        .emote-menu .menu-close:hover,
        .emote-menu .menu-settings:hover {
          opacity: 0.8;
        }
        .emote-menu .menu-close {
          right: 40px;
        }
        .emote-menu .menu-settings {
          right: 10px;
        }
        .emote-menu .settings-menu {
          background-color: #2C2C2C;
          color: #CCCCCC;
          border-radius: 5px;
          position: absolute;
          top: 50px;
          right: 10px;
          z-index: 998;
          max-height: 260px;
          padding: 20px;
          overflow: auto;
          width: 240px;
          flex-direction: column;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .emote-menu .settings-menu > div {
          margin: 5px 0;
        }
        .emote-menu .settings-menu #img_cb,
        .emote-menu .settings-menu #autofill_cb,
        .emote-menu .settings-menu #show_label {
          cursor: pointer;
        }/*# sourceMappingURL=style.css.map */
`;

    addStyle(modalStyler, "modal-style");

    const modal = document.createElement("div");
    modal.className = "emote-menu";
    modal.id = "emote-menu";

    const closeButton = document.createElement("button");
    closeButton.className = "menu-close";
    closeButton.textContent = "Close";
    closeButton.onclick = () => (modal.style.display = "none");

    const dragIcon = document.createElement("i");
    dragIcon.id = "draggable";
    dragIcon.className = "fa fa-arrows";

    const settingsButton = document.createElement("button");
    settingsButton.className = "menu-settings";
    settingsButton.textContent = "⚙️";
    settingsButton.onclick = () =>
    (settingsMenu.style.display =
      settingsMenu.style.display === "none" ? "flex" : "none");

    const settingsMenu = document.createElement("div");
    settingsMenu.className = "settings-menu";
    settingsMenu.style.display = "none";
    settingsMenu.innerHTML = `
    <div class="emote__config">
      <label for="autofill_cb">Autofill emote name</label>
      <input type="checkbox" id="autofill_cb">
    </div>
    <div class="emote__config">
      <label for="img_cb">Auto img tag</label>
      <input type="checkbox" id="img_cb">
    </div>
    <div class="emote__config">
      <label for="show_label">Show emote labels</label>
      <input type="checkbox" id="show_label">
    </div>
    <div class="emote__config">
      <label for="sizePref">Select Emote Size:</label>
        <select id="sizePref" name="sizePref">        
            <option value="small">Small</option>
            <option value="default">Default</option>
            <option value="large">Large</option>
            <option value="sfa">SFA</option>
        </select>
    </div>
    <div class="emote__config">
      <label for="winSize">Select Menu Size:</label>
        <select id="winSize" name="winSize">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
        </select>
    </div>
  `;
    const topButton = document.createElement("button");
    topButton.id = "topBtn";
    topButton.onclick = () => topFunction();

    modal.appendChild(topButton);
    emoteMenu.onscroll = () => scrollFunction();
    function scrollFunction() {
      if (emoteMenu.scrollTop > 20 || emoteMenu.scrollTop > 20) {
        topButton.style.display = "block";
      } else {
        topButton.style.display = "none";
      }
    }
    function topFunction() {
      emoteMenu.scrollTop = 0;
    }
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
          "showEmoteLabel",
          JSON.stringify(e.target.checked)
        ); // Store as JSON string
        const labels = document.querySelectorAll(".emote-label"); // Select elements with class 'emote-label'
        labels.forEach(
          (label) => (label.style.display = e.target.checked ? "block" : "none")
        ); // Corrected display logic
      });

    modal.appendChild(closeButton);
    modal.appendChild(dragIcon);
    modal.appendChild(settingsButton);
    modal.appendChild(settingsMenu);
    modal.appendChild(emoteMenu);
    document.body.appendChild(modal);
    initializeSettings();
  }

  // Load the settings into the menu from local storage.
  function initializeSettings() {
    setWinSize(winSize);
    document.getElementById("autofill_cb").checked = JSON.parse(
      localStorage.getItem("autofill") || "false"
    );
    document.getElementById("img_cb").checked = JSON.parse(
      localStorage.getItem("useImgTag") || "false"
    );
    document.getElementById("show_label").checked = JSON.parse(
      localStorage.getItem("showEmojiLabel") || "false"
    );

    const sizePrefSelect = document.getElementById("sizePref");
    const savedSizePref = localStorage.getItem("sizePref");
    if (savedSizePref) {
      sizePrefSelect.value = savedSizePref;
    }

    sizePrefSelect.addEventListener("change", () => {
      const selectedSizePref = sizePrefSelect.value;
      localStorage.setItem("sizePref", selectedSizePref);
      sizePref = sizePrefSelect.value;
    });

    const winSizeSelect = document.getElementById("winSize");
    const savedwinSize = localStorage.getItem("winSize");
    if (savedwinSize) {
      winSizeSelect.value = savedwinSize;
    }

    winSizeSelect.addEventListener("change", () => {
      const selectedwinSize = winSizeSelect.value;
      localStorage.setItem("winSize", selectedwinSize);
      winSize = winSizeSelect.value;
      setWinSize(winSize);
    });

    const draggableWindow = document.getElementById("emote-menu");
    const draggableIcon = document.getElementById("draggable");

    let offsetX = 0,
      offsetY = 0,
      startX = 0,
      startY = 0;

    draggableIcon.addEventListener("mousedown", dragStart);
    document.addEventListener("mouseup", dragEnd);

    function dragStart(e) {
      e.preventDefault(); // Prevent default behavior to avoid unexpected issues

      // Calculate the initial offset values
      offsetX = draggableWindow.offsetLeft;
      offsetY = draggableWindow.offsetTop;

      startX = e.clientX;
      startY = e.clientY;

      document.addEventListener("mousemove", drag);
    }

    function drag(e) {
      // Calculate new position based on mouse movement
      offsetX += e.clientX - startX;
      offsetY += e.clientY - startY;

      // Update the starting positions for the next movement
      startX = e.clientX;
      startY = e.clientY;

      draggableWindow.style.left = `${offsetX}px`;
      draggableWindow.style.top = `${offsetY}px`;
    }

    function dragEnd() {
      document.removeEventListener("mousemove", drag);
    }
  }
  // Inject the emoji button and run the main script.
  function addEmojiButton() {
    getDOMSelectors();

    if (!menuSelector || !chatForm) {
      setTimeout(addEmojiButton, 1000);
      return;
    }

    const emojiButtonStyler = `
            .emoji-button {
                cursor: pointer;
                font-size: 24px;
                margin-left: 20px;
            }
        `;

    addStyle(emojiButtonStyler, "emoji-button");

    const emojiButton = document.createElement("span");
    emojiButton.classList.add("emoji-button");
    emojiButton.innerHTML = "😂";
    emojiButton.addEventListener("click", createModal);

    if (pageFlags.isChatbox || pageFlags.isForum) {
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
  if (Object.keys(emotes).length === 0 && emotes.constructor === Object) {
    setEmotes();
  }
  // Only call the script on supported pages.
  if (Object.values(pageFlags).some((flag) => flag)) {
    addEmojiButton();
  }
})();
