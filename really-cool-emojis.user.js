// ==UserScript==
// @name         really-cool-emojis
// @version      5.2
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
// @grant        GM_xmlhttpRequest
// @license      GPL-3.0-or-later
// ==/UserScript==

/************************************************************************************************
 * ChangeLog
 * 4.1
 *  - Fix new pm urls
 * 3.8
 *  - Reorganized emotes into groups.
 * 3.7
 *  - fix l!{image url} command to actually wrap in url tag
 * 3.6
 *  - Fix event dispatch so preview works.
 * 3.3
 *  - Added setting for default sizings.
 * 3.2
 *  - Some dynamic sizing for wide emotes.
 * 3.1
 *  - Support for PMs and changes to DOM Selectors and page type logic.
 *  - Move away from GM.addStyle for better compatibility.
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

  // Helper function to addStyle instead of using GM.addStyle, for compatibility.
  function addStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ty sUss, sfa, moon, vaseline, KatSu
  const emojis = {
    //animal
    concernedApe: "https://i.ibb.co/w7K0bTf/concerned-Ape.gif",
    stanced: "https://i.ibb.co/yBJCBGY/stanced.gif",
    sittin: "https://i.ibb.co/YcMxQTZ/sittin.gif",
    monkeat: "https://i.ibb.co/MBLgt2R/monkeat.gif",
    monkE: "https://i.ibb.co/48wZByc/monkE.gif",
    aussie: "https://i.ibb.co/QvWGHww/aussie.gif",
    wuh: "https://i.ibb.co/mDW4G97/wuh.gif",
    shitlookgood: "https://i.ibb.co/ZT4vbBH/shitlookgood.gif",
    SNACKING: "https://i.ibb.co/5n1S9Sq/SNACKING.gif",
    PLEASE: "https://i.ibb.co/c1B3XSH/PLEASE.gif",
    ":d": "https://i.ibb.co/PgPmFzP/DD.gif",
    buh: "https://i.ibb.co/pvVghfM/buh.gif",
    chimpE: "https://i.ibb.co/55HNy0X/monkE.gif",
    meow: "https://i.ibb.co/Tcrt2c3/meow.gif",
    catsmirk: "https://i.ibb.co/wRRV5ns/catsmirk.gif",
    cronch: "https://i.ibb.co/y84jjsz/cronch.gif",
    duckass: "https://i.ibb.co/VqG2BVV/duckass.gif",
    sfagoat: "https://i.ibb.co/DLTw1Fh/cgoat.png",

    //hungy
    kidgokuEat: "https://i.ibb.co/tb7X9T4/kidgoku-Eat.gif",
    gokueat: "https://i.ibb.co/CPd53LC/gokueat.gif",
    hungy: "https://i.ibb.co/x2Bf14F/hungy.gif",

    // greetings
    pikahey: "https://i.ibb.co/2WnDK5C/pikahey.gif",
    YOO: "https://i.ibb.co/s3NDTct/yoooo.gif",
    yoo: "https://i.ibb.co/CBfDMxJ/yoo.gif",
    weebHi: "https://i.ibb.co/BCDxRgs/image.gif",
    hasbullahi: "https://i.ibb.co/XLbB1hF/hasbullahi.gif",
    spongeBye: "https://i.ibb.co/4W6VWPz/sponge-Bye.gif",
    ByeBye: "https://i.ibb.co/hDd3n4Y/ByeBye.gif",
    imout: "https://i.ibb.co/4Nw7MYg/imout.gif",

    // congrats
    stingUp: "https://ptpimg.me/ze6c85.gif",
    hi5: "https://i.ibb.co/M7Q6L7s/hi5.gif",
    tyronegz: "https://i.ibb.co/Z8CG4kY/congratulations.gif",
    congrats: "https://i.ibb.co/nwbHvcj/congrats.gif",
    confetti: "https://i.ibb.co/zHh0c2W/confetti.gif",

    // thanks + loves
    thanksbro: "https://i.ibb.co/FV8pDNm/thanksbro.gif",
    spongeLove: "https://i.ibb.co/c1Rtd9G/sponge-Love.gif",
    ohstop: "https://i.ibb.co/tDzrrB1/ohstop.gif",
    gothKiss: "https://i.ibb.co/4j4f6t3/gothKiss.gif",
    catLove: "https://i.ibb.co/k3q56BW/catLove.gif",
    bearHug: "https://i.ibb.co/tZ454LT/bearHug.gif",

    // arrive
    batemanArrive: "https://i.ibb.co/7zsLddv/bateman-Arrive.gif",
    homerArrive: "https://i.ibb.co/Wpnz7Yp/homer-Arrive.gif",
    homerLeave: "https://i.ibb.co/8gtN9Vw/homer-Leave.gif",
    youRang: "https://i.ibb.co/JQWPZM5/youRang.gif",

    // moneys
    prayge: "https://i.ibb.co/CWC39HT/prayge.gif",
    standPrayge: "https://i.ibb.co/Tkk0q3s/stand-Prayge.gif",
    pikaBless: "https://i.ibb.co/j6JPs3j/pika-Bless.gif",
    blessRNG: "https://i.ibb.co/YcFSpfW/blessRNG.gif",
    GAMBA: "https://i.ibb.co/9hkjbCp/GAMBA.gif",
    stonksUp: "https://i.ibb.co/DpP0PxD/stonksup.gif",
    stonksdown: "https://i.ibb.co/x84x9np/stonksdown.gif",
    stackin: "https://ptpimg.me/616o42.png",
    reallyRich: "https://i.ibb.co/ZMf1YQ6/really-Rich.gif",
    counting: "https://ptpimg.me/59emhk.gif",
    moneyTime: "https://i.ibb.co/Df5nZDR/money-Time.gif",
    BIGMONEY: "https://i.ibb.co/DL2zLYr/BIGMONEY.gif",
    robbery: "https://i.ibb.co/cYqqtbc/robbery.png",

    // huh?
    rockhuh: "https://i.ibb.co/CH8mY0w/huh.gif",
    sus: "https://i.ibb.co/VVJqBLS/huhh.gif",
    huh: "https://ptpimg.me/12kx8m.gif",
    ayo: "https://i.ibb.co/Vx9jZB9/ayo.gif",
    jusreadin: "https://i.ibb.co/0XfB6gs/reading.gif",
    sideeye: "https://i.ibb.co/B2k8cX5/sideeye.jpg",
    saythatagain: "https://i.ibb.co/HTTgfcB/saythatagain.gif",
    dafuq: "https://i.ibb.co/m6M0h46/dafuq.gif",

    // angry
    ultramad: "https://ptpimg.me/vbg6q3.png",
    slightlymad: "https://ptpimg.me/ut9wv7.png",
    reallymad: "https://ptpimg.me/znro3o.png",
    rage: "https://ptpimg.me/cqu9qr.gif",
    angytype: "https://ptpimg.me/c51694.png",
    fucku: "https://i.ibb.co/V3PwZbm/fucku.gif",

    // sad
    sadd: "https://i.ibb.co/CV28H5h/sad.gif",
    reallysad: "https://ptpimg.me/m9f985.png",
    despair: "https://i.ibb.co/jw54JGh/despair.gif",
    WHY: "https://i.ibb.co/rMCxjNk/WHY.gif",
    fishWhy: "https://i.ibb.co/Rh6R3d8/fishWhy.gif",
    WAIT: "https://i.ibb.co/ncKxwPT/WAIT.gif",
    NotLikeThis: "https://i.ibb.co/jWnRZXL/Not-Like-This.gif",
    pandaWhy: "https://i.ibb.co/r4X4222/pandaWhy.gif",
    crychattin: "https://i.ibb.co/nCKTC2Z/crychattin.gif",
    ":c": "https://i.ibb.co/8rYWwgH/grump.gif",

    // laughing
    lmaoo: "https://i.ibb.co/VVYHjL0/lmao.png",
    laught: "https://i.ibb.co/xj0zTCS/haha.jpg",
    comedy: "https://ptpimg.me/x0rx70.png",
    giggle: "https://ptpimg.me/f9opi2.png",
    xdd: "https://i.ibb.co/0jJS1jg/xdd.gif",
    hahaso: "https://i.ibb.co/4SF12vP/hahaso.gif",
    kek: "https://i.ibb.co/3v9GfYD/kekW.gif",
    HEH: "https://i.ibb.co/wdbC1HV/HEH.gif",
    imdead: "https://i.ibb.co/ByPq8s5/imdead.gif",

    // shocking
    dead: "https://i.ibb.co/q1vQxxs/dead.gif",
    shockedmonkey: "https://i.ibb.co/qCFdGh4/shockedmonkey.gif",
    shookt: "https://i.ibb.co/R6R3Dcm/shookt.gif",
    ohno: "https://i.ibb.co/SKPHp6c/ohno.gif",
    whatda: "https://i.ibb.co/YTDbxm1/WHAT.gif",
    joe: "https://i.ibb.co/JBncpnh/OOOOO.gif",
    ":o": "https://i.ibb.co/1Z0sS6J/OO.png",
    "D:": "https://i.ibb.co/zs2dHW2/gasp.png",
    reallyshocked: "https://i.ibb.co/qmrdfk2/reallyshocked.gif",
    dogWTF: "https://i.ibb.co/dm3ZfS4/out.png",

    // tired
    yawn: "https://ptpimg.me/l4l3r6.png",
    sleepy: "https://i.ibb.co/b5Svttf/sleepy.gif",
    gnite: "https://i.ibb.co/rp5zSBF/gnite.gif",

    // brain power
    calculate: "https://i.ibb.co/4TvHZM0/calculate.gif",
    reallythinking: "https://i.ibb.co/Qr0dNwj/reallythinking.gif",
    smart: "https://i.ibb.co/nRfYr0H/smart.gif",
    nerdbob: "https://i.ibb.co/mbndBMC/nerdbob.gif",
    nerD: "https://i.ibb.co/1X6YBwF/nerd.gif",
    thinking: "https://i.ibb.co/WfrH9db/thinking.gif",
    hmmm: "https://i.ibb.co/TvtNp9v/hmmm.gif",
    actually: "https://i.ibb.co/4YD9gGK/actually.gif",
    ionkno: "https://i.ibb.co/Khpw97t/ionkno.png",
    Erm: "https://i.ibb.co/TbJypyv/Erm.gif",
    noted: "https://i.ibb.co/qn0w6N5/noted.gif",
    anyaNoted: "https://i.ibb.co/7RRwKsW/Anya-Noted.gif",
    brainhurt: "https://i.ibb.co/bL7hLm7/brainhurt.gif",

    // horny
    princessK: "https://i.ibb.co/ncXFzLk/princess-K.png",
    feltcute: "https://ptpimg.me/20180i.png",
    NOHORNY: "https://i.ibb.co/4ZSn3gh/NOHORNY.gif",
    kok: "https://i.ibb.co/nLpSJnt/kok.gif",
    marinFlushed: "https://i.ibb.co/JkbCdd4/marin-Flush.gif",
    shyboi: "https://i.ibb.co/HHYvzX4/shyboi.gif",
    mikeW: "https://i.ibb.co/QPh8DFq/mikeW.gif",
    awooga: "https://i.ibb.co/QHQ5r8g/AWOOGA.gif",
    hubba: "https://i.ibb.co/YcgqY7Z/hubbahubba.gif",
    lip: "https://i.ibb.co/hVm1ngL/4x.png",
    feet: "https://ptpimg.me/622oxi.png",
    boobies: "https://i.ibb.co/SxFdK06/boobies.gif",
    munn: "https://i.ibb.co/Rz5QB5Y/tham.gif",
    "2munn": "https://i.ibb.co/yB0DHgx/2tham.gif",
    MOMMY: "https://i.ibb.co/xMJTSL0/MOMMY.gif",
    Sussy: "https://i.ibb.co/12h70YT/Sussy.gif",
    mcqSus: "https://i.ibb.co/gzMx7NM/mcqSus.gif",

    // times
    coffeeTime: "https://i.ibb.co/bbxhc3n/coffee-Time.gif",
    demontime: "https://i.ibb.co/19M9Z9q/demontime.gif",

    // putin
    sfa: "https://i.ibb.co/Htbgx17/sfa.gif",
    putinRide: "https://i.ibb.co/1MqSc3N/putin-Ride.png",
    chadmirPutin: "https://i.ibb.co/x1fMKMG/chadmirputin.png",
    putinLaugh: "https://i.ibb.co/c83XfBT/putin-Laugh.gif",
    surething: "https://i.ibb.co/pWkmzSL/surething.gif",
    putinApprove: "https://i.ibb.co/VJ2HYDR/putin-Approve.gif",
    putinwalk: "https://i.ibb.co/C6LT6NP/walkin.gif",
    putinDance: "https://ptpimg.me/0lm04u.png",
    putinSquat: "https://i.ibb.co/qMZJRBD/putinsquat.png",
    putinAttack: "https://i.ibb.co/4S2yh9h/putin-Attack.png",
    putinDive: "https://i.ibb.co/M7bs5hD/putin-Dive.gif",
    tfuSay: "https://i.ibb.co/vJ0Q7L3/tfuSay.gif",

    //fighting
    slammed: "https://i.ibb.co/QftjRBj/slammed.gif",
    catpunch: "https://i.ibb.co/CzmzYM6/4x.gif",
    hasbullaFight: "https://i.ibb.co/2kmsP8b/Hasbulla-Fight.gif",
    squareUp: "https://i.ibb.co/drw3sfk/Iwill-Beat-Yo-Ass.gif",
    STFU: "https://i.ibb.co/nR9yQTJ/STFU.gif",

    // yes no
    mhm: "https://i.ibb.co/KX1yjks/mhm.gif",
    gandi: "https://i.ibb.co/Cbnn4hY/gandi.gif",
    NOPERS: "https://i.ibb.co/wYZTNfy/NOPERS.gif",
    HARAM: "https://i.ibb.co/KLy10rQ/HARAM.gif",

    // ew
    EmiruYuck: "https://i.ibb.co/88LRNrP/Emiru-Yuck.gif",
    barf: "https://ptpimg.me/is0oh0.gif",

    // patience
    waiting: "https://i.ibb.co/3BSDnmb/waiting.gif",
    spongeWait: "https://i.ibb.co/wCNSGsJ/SpongeWait.gif",
    pabloWait: "https://i.ibb.co/w7Dk3bv/pablo-Wait.gif",
    monkWait: "https://i.ibb.co/M7z1yXJ/monkwait.gif",
    sealWait: "https://i.ibb.co/Cm9fy29/seal-Waiting.gif",

    // other stuff
    tf: "https://ptpimg.me/44b994.png",
    watchit: "https://i.ibb.co/99nnv04/watchit.gif",
    trash: "https://i.ibb.co/G2Wx8WL/trash.gif",
    STRESSED: "https://i.ibb.co/Lg3GhnL/STRESSED.gif",
    stonecold: "https://i.ibb.co/N96Z2Bp/stonecold.gif",
    ALRIGHT: "https://i.ibb.co/c82Tz05/ALRIGHT.gif",
    shy: "https://ptpimg.me/olw327.png",
    ascared: "https://ptpimg.me/qbf200.png",
    caughtme: "https://i.ibb.co/2KhYFs3/caughtme.gif",
    spotted: "https://i.ibb.co/BNh18pp/spotted.gif",
    modCheck: "https://i.ibb.co/fn2BxN6/modCheck.gif",
    whereTho: "https://i.ibb.co/Zft4RCV/whereTho.gif",
    niceone: "https://i.ibb.co/c8TjJ7T/niceone.gif",
    dealwithit: "https://ptpimg.me/321azk.png",
    poop: "https://ptpimg.me/a8mn3s.png",
    prideFlag: "https://i.ibb.co/72bZMp6/image.gif",
    parrot: "https://i.ibb.co/yB4fCfp/parrot.gif",
    killua: "https://i.ibb.co/98g7bxb/killua.gif",
    mamamia: "https://i.ibb.co/CmZR8p7/mamamia.gif",
    ayoh: "https://i.ibb.co/3v22m5B/ayoh.gif",
    loopy: "https://ptpimg.me/vmq38q.png",
    excellent: "https://i.ibb.co/P98kJ53/excellent.gif",
    plottin: "https://ptpimg.me/df30z2.gif",
    empty: "https://i.ibb.co/wStC9f3/empty.png",
    dumbo: "https://i.ibb.co/yh05yVs/dumbo.png",
    brothers: "https://i.ibb.co/X3KvpHs/brothers.png",
    chad: "https://i.ibb.co/Rb7L1Mk/chad.gif",
    dino: "https://i.ibb.co/QXSj9RT/dino.gif",
    skatin: "https://i.ibb.co/QFGB0Rp/skatin.gif",
    whatido: "https://i.ibb.co/CK1zY7k/whatido.gif",
    mmkay: "https://i.ibb.co/3NnYDyt/out.png",
    Risenocular: "https://i.ibb.co/XLLg8w9/risenoculars.gif",
    LETHIMCOOK: "https://i.ibb.co/NWC2108/LETHIMCOOK.gif",
    jacksaw: "https://i.ibb.co/hcBRQkD/jacksaw.png",
    KANE: "https://i.ibb.co/bLnTKWL/KANE.gif",
    chatting: "https://i.ibb.co/jTYXKTg/chatting.gif",
    bratwu: "https://i.ibb.co/k834WdR/bratwur.png",
    caught: "https://i.ibb.co/JFJxSmX/4k.gif",
    innocent: "https://i.ibb.co/2dtCYGW/innocent.gif",
    reallycool: "https://i.ibb.co/6vrY0km/reallycool.gif",
    fbi: "https://i.ibb.co/fr64Fn6/fbi.png",
    ho7: "https://i.ibb.co/5BD98yj/ho7.png",
    o7: "https://i.ibb.co/5sqKm4Y/o7.png",
    gamin: "https://i.ibb.co/f0WhLk3/gamin.gif",
    popcorn: "https://i.ibb.co/pjJGfkf/popcorn.gif",
    catcorn: "https://i.ibb.co/MZ4Yf7R/catpopcorn.png",
    clown: "https://i.ibb.co/R6gGdfX/clown.gif",
    ban: "https://i.ibb.co/CwvHRhd/4x.gif",
    sexo: "https://i.ibb.co/ykCgkyS/sexo.gif",
    classic: "https://i.ibb.co/kytwYGd/classic.gif",
    cowDance: "https://i.ibb.co/ZcWgWVT/qwe.gif",
    CT: "https://i.ibb.co/7yMn3Zw/CT.gif",
  };

  const wide = [
    "https://i.ibb.co/w7Dk3bv/pablo-Wait.gif",
    "https://i.ibb.co/ZcWgWVT/qwe.gif",
    "https://i.ibb.co/gzMx7NM/mcqSus.gif",
    "https://i.ibb.co/nwbHvcj/congrats.gif",
    "https://i.ibb.co/pWkmzSL/surething.gif",
    "https://i.ibb.co/c83XfBT/putin-Laugh.gif",
    "https://i.ibb.co/0jJS1jg/xdd.gif",
    "https://i.ibb.co/jw54JGh/despair.gif",
    "https://ptpimg.me/df30z2.gif",
    "https://ptpimg.me/ze6c85.gif",
    "https://i.ibb.co/P9jtn5K/surething.gif",
    "https://i.ibb.co/1MqSc3N/putin-Ride.png",
    "https://i.ibb.co/5BD98yj/ho7.png",
    "https://i.ibb.co/fr64Fn6/fbi.png",
    "https://i.ibb.co/4ZSn3gh/NOHORNY.gif",
    "https://i.ibb.co/QHQ5r8g/AWOOGA.gif",
    "https://i.ibb.co/C6LT6NP/walkin.gif",
    "https://i.ibb.co/bLnTKWL/KANE.gif",
    "https://i.ibb.co/QftjRBj/slammed.gif",
    "https://i.ibb.co/nR9yQTJ/STFU.gif",
    "https://i.ibb.co/DLTw1Fh/cgoat.png",
    "https://i.ibb.co/7yMn3Zw/CT.gif",
  ];
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

            <div class="check__update">
            <span id="update__btn">Check for updates</span></div>
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
    const updateBtn = document.getElementById("update__btn");
    updateBtn.addEventListener("click", checkUpdate);
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
