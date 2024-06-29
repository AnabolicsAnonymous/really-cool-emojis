// ==UserScript==
// @name         really-cool-emotes-testing
// @version      5.4
// @namespace    https://github.com/frenchcutgreenbean/
// @description  test for searching
// @author       dantayy
// @match        https://blutopia.cc/*
// @grant        GM.xmlHttpRequest
// @license      GPL-3.0-or-later
// ==/UserScript==

(function () {
  "use strict";

  let emotes = {};
  // Helper function to addStyle instead of using GM.addStyle, for compatibility.
  function addStyle(css) {
    const style = document.createElement("style");
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
      createModal();
      console.log(emotes);
    } catch (error) {
      console.error(error);
    }
  }

  function onEmoteClick(url, width) {
    console.log(url, width);
  }
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
      const { url, tags, default_width } = value;
      console.log(key, url);
      const emoteContainer = document.createElement("div");
      emoteContainer.classList.add("emote-container");
      tags.push(key.toLowerCase())
      emoteContainer.dataset.tags = tags.join(" ").toLowerCase();

      const emoteLabel = document.createElement("p");
      emoteLabel.innerText = key;
      emoteLabel.classList.add("emote-label");

      const emoteItem = document.createElement("div");
      emoteItem.classList.add("emote-item");
      emoteItem.style.backgroundImage = `url(${url})`;
      emoteItem.addEventListener("click", () =>
        onEmoteClick(url, default_width)
      );

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
    const menuLeft = "20%";
    const menuTop = "20%";
    const modalStyler = `
    .emote-menu {
      position: fixed;
      border-radius: 5px;
      z-index: 1;
      left: ${menuLeft};
      top: ${menuTop};
      max-height: 345px;
      height: 100%;
      overflow: auto;
      background-color: rgba(0,0,0,0.8);
    }
    .emote-content {
      background-color: #1C1C1C;
      color: #CCCCCC;
      margin: 15% auto;
      padding: 20px;
      max-width: 300px;
      width: 300px;
      max-height: 250px;
      height: 250px;
      overflow: auto;
      position: relative;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .emote-label {
      max-width: 40px;
      width: 40px;
      font-size: 8px;
      text-align: center;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .emote-label:hover {
      position: absolute;
      overflow: visible;
      z-index: 9999;
    }
    .emote-container {
      max-width: 50px;
    }
    .emote-item {
      width: 40px;
      height: 40px;
      cursor: pointer;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      transition: transform 0.1s;
    }
    .emote-item:hover {
      transform: scale(1.1);
    }
    .emote-search-bar {
      grid-column: 1 / -1;
      background-color: #333;
      color: #a1a1a1;
      height: 30px;
      border: none;
      border-radius: 3px;
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
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
    .settings-menu > div {
      margin: 5px 0 !important;
    }
    #img_cb, #autofill_cb, #show_label {
      cursor: pointer !important;
    }
    .check__update {
      display: flex;
      flex-direction: column;
    }
    #update__btn {
      cursor: pointer;
      color: #4F8C3C;
    }
  `;

    addStyle(modalStyler);

    const modal = document.createElement("div");
    modal.className = "emote-menu";
    modal.id = "emote-menu";

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
      <label for="default__width_cb">Default chatbox width</label>
      <input type="number" id="default__width_cb" placeholder="22">
    </div>
    <div class="emote__config">
      <label for="default__width_forums">Default Forums width</label>
      <input type="number" id="default__width_forums" placeholder="23">
    </div>
    <div class="check__update">
      <span id="update__btn">Check for updates</span>
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
          "showEmoteLabel",
          JSON.stringify(e.target.checked)
        ); // Store as JSON string
        const labels = document.querySelectorAll(".emote-label"); // Select elements with class 'emote-label'
        labels.forEach(
          (label) => (label.style.display = e.target.checked ? "block" : "none")
        ); // Corrected display logic
      });

    modal.appendChild(closeButton);
    modal.appendChild(settingsButton);
    modal.appendChild(settingsMenu);
    modal.appendChild(emoteMenu);
    document.body.appendChild(modal);
  }

  setEmotes();
})();
