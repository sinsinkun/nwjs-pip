// HTML components
const win1url = document.getElementById("win-1-url");
const win1x = document.getElementById("win-1-x");
const win1y = document.getElementById("win-1-y");
const win1w = document.getElementById("win-1-w");
const win1h = document.getElementById("win-1-h");

const win2url = document.getElementById("win-2-url");
const win2x = document.getElementById("win-2-x");
const win2y = document.getElementById("win-2-y");
const win2w = document.getElementById("win-2-w");
const win2h = document.getElementById("win-2-h");

const errorBox = document.getElementById("error-box");
const openBtn = document.getElementById("open-btn");
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
/** @type {{ id: string, ref: NWWindowRef }[]} */
let otherWindows = [];

// closing console closes all other windows
thisWindow.on('close', () => {
  otherWindows.forEach(win => win.ref?.close());
  thisWindow.close(true);
});

// helpers
/**
 * 
 * @param {NWWindowRef} win 
 * @param {string} id 
 */
function onWindowOpen(win, id) {
  win.on('close', () => {
    otherWindows = otherWindows.filter((win) => win.id !== id);
    win.close(true);
  });
  otherWindows.push({ id, ref: win });
}

/**
 * 
 * @param {string} id
 * @returns {HTMLDocument}
 */
function getWebDocument(id) {
  let doc;
  otherWindows.forEach(win => {
    if (win.id === id) {
      doc = win.ref?.window?.document;
    }
  });
  return doc;
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
  const videos = doc.getElementsByTagName("video");
  if (videos.length > 0) {
    videos[0].play().catch((e) => {
      console.log(e);
    });
  } else {
    console.log("WARN: No video found");
  }
}

// open windows
openBtn.onclick = () => {
  if (win1url.value) {
    nw.Window.open(
      win1url.value,
      {
        width: getNumberFromField(win1w),
        height: getNumberFromField(win1h),
        x: getNumberFromField(win1x),
        y: getNumberFromField(win1y),
      },
      (win) => onWindowOpen(win, "main")
    );
  }
  if (win2url.value) {
    nw.Window.open(
      win2url.value,
      {
        width: getNumberFromField(win2w),
        height: getNumberFromField(win2h),
        x: getNumberFromField(win2x),
        y: getNumberFromField(win2y),
        always_on_top: true,
      },
      (win) => onWindowOpen(win, "pip")
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
  window.dev = { mainDoc, pipDoc };
  if (!!mainDoc) findVideoAndPlay(mainDoc);
  if (!!pipDoc) findVideoAndPlay(pipDoc);
}