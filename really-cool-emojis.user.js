// ==UserScript==
// @name         really-cool-emojis
// @version      7.0.4
// @namespace    https://github.com/frenchcutgreenbean/
// @description  emojis and img for UNIT3D trackers
// @author       dantayy, anabol
// @match        https://aither.cc/*
// @match        https://blutopia.cc/*
// @match        https://cinematik.net/*
// @match        https://fearnopeer.com/*
// @match        https://lst.gg/*
// @match        https://reelflix.xyz/*
// @match        https://upload.cx/*
// @match        https://oldtoons.world/*
// @match        https://yu-scene.net/*
// @icon         https://ptpimg.me/e44il4.png
// @downloadURL  https://github.com/AnabolicsAnonymous/really-cool-emojis/blob/main/really-cool-emojis.user.js
// @updateURL    https://github.com/AnabolicsAnonymous/really-cool-emojis/blob/main/really-cool-emojis.user.js
// @grant        GM.xmlHttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
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
 * 7.0.3
 *  - Discord-ified emoji button.
 *  - Globalized pinned emotes.
 *  - Pinned emotes to textboxes.
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
        "https://raw.githubusercontent.com/AnabolicsAnonymous/really-cool-emojis/refs/heads/main/emojis.json"
      );

      makeMenu();
      const pinnedEmotes = JSON.parse(GM_getValue("really-cool-emojis-pinned", "[]")) || [];
      orderEmotes();
    } catch (error) {
      console.error(error);
    }
  }

  function orderEmotes() {
    if (!defaultOrdering || defaultOrdering.length === 0) {
      return;
    }

    const pinnedEmotes = JSON.parse(GM_getValue("really-cool-emojis-pinned", "[]")) || [];

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
    let pinnedEmotes = JSON.parse(GM_getValue("really-cool-emojis-pinned", "[]")) || [];
    if (!pinnedEmotes.includes(emoteId)) {
      pinnedEmotes.push(emoteId);
    } else {
      pinnedEmotes = pinnedEmotes.filter((id) => id !== emoteId);
    }
    GM_setValue("really-cool-emojis-pinned", JSON.stringify(pinnedEmotes));
    orderEmotes();
  }

  /* ----------------------------Emote-Handling------------------------------------- */
  function onEmoteClick(emote) {
    const { url } = emote;
    let size = getEmoteSize(sizePref, emote);
    const emoji = `[img=${size}]${url}[/img]`;
    if (chatForm && typeof chatForm.selectionStart === 'number') {
      const start = chatForm.selectionStart;
      const end = chatForm.selectionEnd;
      const value = chatForm.value;
      chatForm.value = value.slice(0, start) + emoji + value.slice(end);
      // Move the caret after the inserted emoji
      chatForm.selectionStart = chatForm.selectionEnd = start + emoji.length;
      chatForm.focus();
    } else if (chatForm) {
      // fallback: just append, but do not trim
      chatForm.value += emoji;
      chatForm.focus();
    }
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
    // Remove any existing menu
    const existingMenu = document.getElementById("emote-menu");
    if (existingMenu) {
      existingMenu.remove();
    }

    // Create the menu container
    const modal = document.createElement("div");
    modal.className = "emote-menu";
    modal.id = "emote-menu";
    modal.style.cssText = `
        position: fixed;
        border-radius: 5px;
        z-index: 9999;
        background-color: #2a292e;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        display: block;
        width: 300px;
        height: 300px;
    `;

    // Create the emote content
    const emoteContent = document.createElement("div");
    emoteContent.className = "emote-content";
    emoteContent.style.cssText = `
        background-color: #1a1820;
        color: #CCCCCC;
        padding: 20px;
        width: 100%;
        height: 100%;
        overflow: auto;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: 40px;
        grid-auto-rows: max-content;
        gap: 10px;
        box-sizing: border-box;
    `;

    // Create search bar
    const searchBar = document.createElement("input");
    searchBar.type = "text";
    searchBar.placeholder = "Search emotes...";
    searchBar.className = "emote-search-bar";
    searchBar.style.cssText = `
        z-index: 998;
        position: sticky;
        top: 0;
        grid-column: 1/-1;
        background-color: #2a292e;
        color: #a1a1a1;
        height: 30px;
        border: none;
        border-radius: 3px;
        width: 100%;
        padding: 10px;
        box-sizing: border-box;
    `;
    searchBar.addEventListener("input", filterEmotes);

    // Add all elements to the modal (no settings button or menu)
    emoteContent.appendChild(searchBar);
    modal.appendChild(emoteContent);

    // Fill the menu with emotes
    for (const [key, value] of Object.entries(emotes)) {
      createEmoteItem(key, value, emoteContent);
    }

    // Add the modal to the document
    document.body.appendChild(modal);

    // Store the default ordering for pin functionality
    defaultOrdering = Array.from(emoteContent.querySelectorAll(".emote-container"));

    // Apply pinned emotes order
    orderEmotes();

    function filterEmotes(event) {
      const searchTerm = event.target.value.toLowerCase();
      const emoteContainers = emoteContent.querySelectorAll(".emote-container");
      emoteContainers.forEach((container) => {
        const tags = container.dataset.tags.split(" ");
        const matches = tags.some((tag) => tag.startsWith(searchTerm));
        container.style.display = matches ? "block" : "none";
      });
    }

    function createEmoteItem(key, value, container) {
      const { url, tags } = value;
      const emoteContainer = document.createElement("div");
      emoteContainer.classList.add("emote-container");
      emoteContainer.id = key;
      tags.push(key.toLowerCase());
      emoteContainer.dataset.tags = tags.join(" ").toLowerCase();
      emoteContainer.style.cssText = `
        max-width: 50px;
        position: relative;
      `;

      const emoteLabel = document.createElement("p");
      emoteLabel.innerText = key;
      emoteLabel.classList.add("emote-label");
      emoteLabel.style.cssText = `
        max-width: 40px;
        width: 40px;
        font-size: 8px;
        text-align: center;
        text-overflow: ellipsis;
        overflow: hidden;
      `;

      const emoteItem = document.createElement("div");
      emoteItem.classList.add("emote-item");
      emoteItem.style.cssText = `
        position: relative;
        width: 40px;
        height: 40px;
        cursor: pointer;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        transition: transform 0.1s;
        background-image: url(${url});
      `;
      emoteItem.addEventListener("click", () => onEmoteClick(value));

      const emotePin = document.createElement("i");
      emotePin.className = "fa fa-thumb-tack emote-pin";
      emotePin.style.cssText = `
        display: none;
        position: absolute;
        bottom: 0;
        right: 0;
        cursor: pointer;
        padding: 2px;
        background: rgba(43, 43, 43, 0.7);
        border-radius: 2px;
      `;
      emotePin.addEventListener("click", (event) => {
        event.stopPropagation();
        onPinClick(key);
      });

      emoteItem.addEventListener("mouseenter", () => {
        emotePin.style.display = "block";
      });
      emoteItem.addEventListener("mouseleave", () => {
        emotePin.style.display = "none";
      });

      emoteItem.appendChild(emotePin);
      emoteContainer.appendChild(emoteItem);
      emoteContainer.appendChild(emoteLabel);
      container.appendChild(emoteContainer);
    }
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
                position: absolute;
                bottom: 8px;
                right: 8px;
                z-index: 1;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
                user-select: none;
                filter: grayscale(100%);
            }
            .emoji-button:hover {
                transform: scale(1.1);
                filter: grayscale(0%);
            }
            .textarea-container {
                position: relative;
                display: inline-block;
                width: 100%;
            }
        `;

    addStyle(emojiButtonStyler, "emoji-button");

    const emojis = ['😂', '😊', '😎', '🤔', '😴', '😍', '🤣', '😭', '🥳', '😇', '🤪', '😅'];
    const textInputs = document.querySelectorAll('textarea:not([type="search"]):not([role="searchbox"])');
    
    textInputs.forEach(input => {
        if (input.nextElementSibling && input.nextElementSibling.classList.contains('emoji-button')) {
            return;
        }

        // Do NOT wrap or move the textarea. Just add the emoji button as a sibling after the textarea.
        const emojiButton = document.createElement("span");
        emojiButton.classList.add("emoji-button");
        emojiButton.innerHTML = "😂";
        
        emojiButton.addEventListener("mouseenter", () => {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            emojiButton.innerHTML = randomEmoji;
            emojiButton.style.filter = 'grayscale(0%)';
            emojiButton.style.transform = 'scale(1.1)';
        });
        
        emojiButton.addEventListener("mouseleave", () => {
            emojiButton.innerHTML = "😂";
            emojiButton.style.filter = 'grayscale(100%)';
            emojiButton.style.transform = 'scale(1)';
        });

        emojiButton.addEventListener("click", (e) => {
            e.stopPropagation();
            chatForm = input;
            
            const existingMenu = document.getElementById("emote-menu");
            if (existingMenu) {
                existingMenu.remove();
                window.removeEventListener('scroll', closeMenuOnScroll);
                return;
            }
            
            createModal();
            
            const menu = document.getElementById("emote-menu");
            if (menu) {
                const buttonRect = e.currentTarget.getBoundingClientRect();
                const menuHeight = 300;
                const menuWidth = 300;
                
                let top = buttonRect.top - menuHeight - 5;
                let left = buttonRect.right - menuWidth;
                
                if (top < 0) {
                    top = buttonRect.bottom + 5;
                }
                
                if (left < 0) {
                    left = 0;
                }
                if (left + menuWidth > window.innerWidth) {
                    left = window.innerWidth - menuWidth;
                }
                
                menu.style.top = `${top}px`;
                menu.style.left = `${left}px`;
                menu.style.display = 'block';

                // Add scroll event listener to close menu on page scroll only
                window.addEventListener('scroll', closeMenuOnScroll);
            }
        });

        function closeMenuOnScroll(e) {
            if (e && e.target && e.target !== document && e.target !== window) return;
            const menu = document.getElementById("emote-menu");
            if (menu) {
                menu.remove();
                window.removeEventListener('scroll', closeMenuOnScroll);
            }
        }

        // Set parent to relative for absolute positioning
        const textareaParent = input.parentElement;
        if (textareaParent) {
            if (getComputedStyle(textareaParent).position === 'static') {
                textareaParent.style.position = 'relative';
            }
            textareaParent.appendChild(emojiButton);
        }
    });

    document.addEventListener('click', (e) => {
        const menu = document.getElementById("emote-menu");
        const emojiButtons = document.querySelectorAll('.emoji-button');
        
        if (menu && !menu.contains(e.target) && !Array.from(emojiButtons).some(btn => btn.contains(e.target))) {
            menu.remove();
        }
    });

    chatForm.addEventListener("input", (e) => {
        const autofill = JSON.parse(localStorage.getItem("autofill") || "false");
        const useImgTag = JSON.parse(localStorage.getItem("useImgTag") || "false");

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
    
    // returns the emoji toggle button after the cancel button is pressed
    const resetButton = document.querySelector('button[type="reset"].form__button.form__button--text');

    if (resetButton) {
      resetButton.addEventListener('click', function() {
          setTimeout(() => {
              addEmojiButton();
          }, 1000);
      });
    } else {
        //console.log('reset button not found.');
    }
  }
})();
