// ==UserScript==
// @name         really-cool-emojis
// @version      7.0.1
// @namespace    https://github.com/frenchcutgreenbean/
// @description  emojis and img for UNIT3D trackers
// @author       dantayy
// @match        https://aither.cc/*
// @match        https://blutopia.cc/*
// @match        https://cinematik.net/*
// @match        https://fearnopeer.com/*
// @match        https://lst.gg/*
// @match        https://reelflix.xyz/*
// @match        https://upload.cx/*
// @icon         https://ptpimg.me/shqsh5.png
// @downloadURL  https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/really-cool-emojis.user.js
// @updateURL    https://github.com/frenchcutgreenbean/really-cool-emojis/raw/main/really-cool-emojis.user.js
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

  async function fetchJSON(jsonUrl) {
    return new Promise((resolve, reject) => {
      try {
        GM.xmlHttpRequest({
          method: "GET",
          url: jsonUrl,
          onload: function (response) {
            try {
              const data = JSON.parse(response.responseText);
              resolve(data);
            } catch (e) {
              reject("Error parsing JSON");
            }
          },
          onerror: function () {
            reject("Network error");
          },
        });
      } catch (error) {
        reject("There was a problem with the fetch operation: " + error);
      }
    });
  }

  async function setEmotes() {
    try {
      emotes = await fetchJSON(
        "https://raw.githubusercontent.com/frenchcutgreenbean/really-cool-emojis/main/emojis.json"
      );
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
          z-index: 998;
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
          z-index: 999;
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
