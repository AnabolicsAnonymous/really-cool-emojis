// ==UserScript==
// @name         really-cool-emojis
// @version      5.4
// @namespace    https://github.com/frenchcutgreenbean/
// @description  test for searching
// @author       dantayy
// @match        https://blutopia.cc/*
// @grant        GM.xmlhttpRequest
// @license      GPL-3.0-or-later
// ==/UserScript==

(function () {
  "use strict";

  // Helper function to addStyle instead of using GM.addStyle, for compatibility.
  function addStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

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

  let menuSelector, chatForm;

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

  let defaultSize = [42, 82]; // 42 width for chatbox and 84 for everything else

  if (localStorage.getItem("defaultCb")) {
    defaultSize[0] = localStorage.getItem("defaultCb");
  }

  if (localStorage.getItem("defaultForums")) {
    defaultSize[1] = localStorage.getItem("defaultForums");
  }

  const emojiMenu = document.createElement("div");
  emojiMenu.className = "emoji-content";
  const showLabel = JSON.parse(
    localStorage.getItem("showEmojiLabel") || "false"
  );

  // Fill the menu with all the emojis
  for (const [key, value] of Object.entries(emojis)) {
    const emojiContainer = document.createElement("div");
    emojiContainer.classList.add("emoji-container");
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

  // Helper function to return size
  function setSize() {
    const isCB = pageFlags.isChatbox;
    let size = isCB ? defaultSize[0] : defaultSize[1];
    return size;
  }

  function onEmojiclick(image) {
    let size = setSize();
    const isCB = pageFlags.isChatbox;
    if (isCB && wide.includes(image)) {
      size = parseInt(size) + 20;
      size = size.toString();
    }

    const emoji = `[img=${size}]${image}[/img]`;
    chatForm.value = chatForm.value
      ? `${chatForm.value.trim()} ${emoji}`
      : emoji;
    chatForm.focus();
    chatForm.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Handle the commands if enabled in the settings. Autofill + IMG tags.
  function handleInputChange(e, autofill, useImgTag) {
    const regex = /^(?:!?http.*|l!http.*)\.(jpg|jpeg|png|gif|bmp|webp)$/i;
    const message = e.target.value;
    let size = setSize();
    const isCB = pageFlags.isChatbox;
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
      if (isCB && wide.includes(emojis[emojiCheck])) {
        size = parseInt(size) + 20;
        size = size.toString();
      }
      messageParts[lastItemIndex] = `[img=${size}]${emojis[emojiCheck]}[/img]`;
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
        messageParts[lastItemIndex] = `[url=${lastItem.slice(
          2
        )}][img]${lastItem.slice(2)}[/img][/url]`;
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
    const menuLeft =
      pageFlags.isChatbox || pageFlags.isNewTopic ? "60%" : "20%";
    const menuTop = pageFlags.isNewTopic ? "10%" : "20%";
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
                width: 40px;
                font-size: 8px;
                text-align: center;
                text-overflow: ellipsis;
                overflow: hidden;
            }
            .emoji-label:hover{
                position: absolute;
                overflow: visible;
                z-index: 9999;
            }
            .emoji-container {
                max-width: 50px;
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
                border-radius: 5px;
                position: absolute;
                top: 50px;
                right: 10px;
                z-index: 2;
                max-height: 260px;
                padding: 20px !important;
                overflow: auto;
                width: 240px;
                flex-direction: column;
                justify-content: center;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            .settings-menu>div{
            margin: 5px 0 !important;
            }
            #img_cb , #autofill_cb, #show_label{
                cursor: pointer !important;
            }
        `;

    addStyle(modalStyler);

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
        settingsMenu.style.display === "none" ? "flex" : "none");

    const settingsMenu = document.createElement("div");
    settingsMenu.className = "settings-menu";
    settingsMenu.style.display = "none";
    settingsMenu.innerHTML = `
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

            <div class="emoji__config">
            <label for="default__width_cb">Default chatbox width</label>
            <input type="number" id="default__width_cb" placeholder="${defaultSize[0]}">
            </div>

            <div class="emoji__config">
            <label for="default__width_forums">Default Forums width</label>
            <input type="number" id="default__width_forums" placeholder="${defaultSize[1]}">
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

    const defaultChatboxWidth = document.getElementById("default__width_cb");
    const defaultForumsWidth = document.getElementById("default__width_forums");
    defaultChatboxWidth.addEventListener("input", (e) =>
      handleWidthChange(e, "cb")
    );
    defaultForumsWidth.addEventListener("input", (e) =>
      handleWidthChange(e, "forums")
    );
  }
  function handleWidthChange(e, target) {
    let width;
    if (e.target.value) {
      // prevent decimals
      width = Math.round(e.target.value);
    }
    if (target === "cb") {
      defaultSize[0] = width;
      localStorage.setItem("defaultCb", width);
    }
    if (target === "forums") {
      defaultSize[1] = width;
      localStorage.setItem("defaultForums", width);
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

    addStyle(emojiButtonStyler);

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

  // Only call the script on supported pages.
  if (Object.values(pageFlags).some((flag) => flag)) {
    addEmojiButton();
  }
})();
