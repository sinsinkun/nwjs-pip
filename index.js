// HTML components
/** @type {HTMLInputElement} */
const win1url = document.getElementById("win-1-url");
/** @type {HTMLInputElement} */
const win1native = document.getElementById("win-1-native");
/** @type {HTMLInputElement} */
const win1x = document.getElementById("win-1-x");
/** @type {HTMLInputElement} */
const win1y = document.getElementById("win-1-y");
/** @type {HTMLInputElement} */
const win1w = document.getElementById("win-1-w");
/** @type {HTMLInputElement} */
const win1h = document.getElementById("win-1-h");
/** @type {HTMLInputElement} */
const win2url = document.getElementById("win-2-url");
/** @type {HTMLInputElement} */
const win2native = document.getElementById("win-2-native");
/** @type {HTMLInputElement} */
const win2x = document.getElementById("win-2-x");
/** @type {HTMLInputElement} */
const win2y = document.getElementById("win-2-y");
/** @type {HTMLInputElement} */
const win2w = document.getElementById("win-2-w");
/** @type {HTMLInputElement} */
const win2h = document.getElementById("win-2-h");
/** @type {HTMLDivElement} */
const errorBox = document.getElementById("error-box");
/** @type {HTMLButtonElement} */
const openBtn = document.getElementById("open-btn");
/** @type {HTMLButtonElement} */
const startBtn = document.getElementById("start-btn");

function displayError(str) {
  errorBox.style.display = "inherit";
  errorBox.innerText = str;
}

function clearError() {
  errorBox.style.display = "none";
  errorBox.innerText = "";
}

// check for library
if (!nw) {
  console.log("ERR: could not load NW.js");
  displayError("ERR: could not load NW.js");
}

// typedefs
/**
 * @typedef NWWindowRef
 * @property {Window} window
 */

// window ref storage
/** @type {NWWindowRef} */
const thisWindow = nw.Window.get();
/** @type {Map<string, NWWindowRef>} */
let otherWindows = new Map;
window.dev = otherWindows;

// closing console closes all other windows
thisWindow.on('close', () => {
  otherWindows.forEach((win) => win.ref?.close());
  thisWindow.close(true);
});

// helpers
/**
 * 
 * @param {NWWindowRef} win 
 * @param {string} key 
 */
function onWindowOpen(win, key) {
  console.log("on window open");
  win.on('close', () => {
    otherWindows.delete(key);
    win.close(true);
  });
  otherWindows.set(key, win);
}

/**
 * 
 * @param {string} key
 * @returns {Window | undefined}
 */
function getWebWindow(key) {
  return otherWindows.get(key);
}

/**
 * 
 * @param {string} key
 * @returns {HTMLDocument}
 */
function getWebDocument(key) {
  return otherWindows.get(key)?.window?.document;
}

/**
 * 
 * @param {HTMLInputElement} field 
 * @returns {number | undefined}
 */
function getNumberFromField(field) {
  if (!field.value) {
    return undefined;
  }
  const x = Number(field.value);
  if (typeof x === 'number') {
    return x;
  }
  return undefined;
}

/**
 * @param {HTMLDocument} doc 
 */
function findVideoAndPlay(doc) {
  if (!doc) {
    console.log("No HTMLDocument found");
    return;
  }
  // play video
  const videos = doc.getElementsByTagName("video");
  if (videos.length > 0) {
    videos[0].play().catch((e) => {
      console.log(e);
    });
  } else {
    console.log("WARN: No video found");
  }
}

/**
 * 
 * @param {NWWindowRef} win
 * @param {string} path 
 */
function updateNativeVideoSrc(win, path) {
  if (win?.window?.document) {
    win?.window?.document.addEventListener("DOMContentLoaded", () => {
      /** @type {HTMLVideoElement} */
      const videoEl = win.window?.document?.getElementById("video");
      videoEl.src = path;
      console.log("video", videoEl);
    });
  }
}

// open windows
openBtn.onclick = () => {
  if (win1url.value) {
    let url = win1native.checked ? "native.html" : win1url.value;
    nw.Window.open(
      url,
      {
        width: getNumberFromField(win1w),
        height: getNumberFromField(win1h),
        x: getNumberFromField(win1x),
        y: getNumberFromField(win1y),
      },
      (win) => {
        onWindowOpen(win, "main");
        if (win1native.checked) {
          updateNativeVideoSrc(win, win1url.value);
        }
      }
    );
  }
  if (win2url.value) {
    let url = win2native.checked ? "native.html" : win2url.value;
    nw.Window.open(
      url,
      {
        width: getNumberFromField(win2w),
        height: getNumberFromField(win2h),
        x: getNumberFromField(win2x),
        y: getNumberFromField(win2y),
        always_on_top: true,
      },
      (win) => {
        onWindowOpen(win, "pip");
        if (win2native.checked) {
          updateNativeVideoSrc(win, win2url.value);
        }
      }
    );
  }
}

// start videos
startBtn.onclick = () => {
  clearError();
  if (otherWindows.length < 1) {
    displayError("ERR: no windows found");
    return;
  }
  const mainDoc = getWebDocument("main");
  const pipDoc = getWebDocument("pip");
  if (!!mainDoc) {
    findVideoAndPlay(mainDoc);
  }
  if (!!pipDoc) {
    findVideoAndPlay(pipDoc);
  }
}