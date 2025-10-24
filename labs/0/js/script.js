/**
 * COMP4537 - Lab 0
 * Author: Logan Dutton-Anderson
 * Date: 2025-09-05
 * 
 * Disclose: Portions of this code structure were prepared with ChatGPT.
 * All constants are declared here to avoid magic numbers/strings.
 * 
 * Classes: GameController, ButtonManager, MessageHandler
 */

import * as userMessages from "../lang/messages/en/user.js";


// ============================
// Timing constants
// ============================
const PAUSE_SECONDS_PER_BUTTON = 1;        // pause length = n * 1s
const SCRAMBLE_COUNT_PER_BUTTON = 1;       // scrambles = n
const SCRAMBLE_INTERVAL_MS = 2000;         // 2 seconds between scrambles

// ============================
// Button count limits
// ============================
const MIN_BUTTONS = 3;
const MAX_BUTTONS = 7;

// ============================
// Button sizes
// ============================
const BUTTON_WIDTH_EM = 10;
const BUTTON_HEIGHT_EM = 5;

// ============================
// Button id prefix
// ============================
const BTN_ID_PREFIX = "btn-";

// ============================
// Layout constants
// ============================
const ROW_GAP_PX = 8;  

// ============================
// DOM element IDs (selectors)
// ============================
const ID_INPUT     = "numButtonsInput";
const ID_LABEL     = "numButtonsLabel";
const ID_GO        = "goButton";
const ID_CONTAINER = "buttonContainer";
const ID_MESSAGE   = "messageArea";

// ============================
// CSS modes
// ============================
const CLASS_ROW = "row-mode";
const CLASS_SCRAMBLE = "scramble-mode";


// ============================
// Phases
// ============================
const PHASE_IDLE = "IDLE";
const PHASE_SETUP = "SETUP";
const PHASE_PAUSE = "PAUSE";
const PHASE_SCRAMBLING = "SCRAMBLING";
const PHASE_PLAY = "PLAY";
const PHASE_END = "END";



// ============================
// App entry point
// ============================

window.addEventListener("DOMContentLoaded", () => {
    const messageHandler = new MessageHandler(ID_MESSAGE, userMessages);
    const buttonManager = new ButtonManager(ID_CONTAINER);
    // eslint-disable-next-line no-unused-vars
    const game = new GameController(messageHandler, buttonManager);
  });


// ============================
// GameController
// ============================

class GameController {
    constructor(messageHandler, buttonManager) {
        // store references to helpers
        this.messageHandler = messageHandler;
        this.buttonManager = buttonManager;

        // track game state
        this.originalOrder = [];
        this.currentIndex = 0;
        this.scrambleCount = 0;
        this.currentPhase = PHASE_IDLE;

        // hold timer ids so we can clear them
        this.pauseTimeout = null;
        this.scrambleInterval = null;

        // setup UI bindings
        this.initUI();

        // scramble control
        this.scrambleTarget = 0; // total scrambles to perform this round

    }

    initUI() {
        // Cache DOM references once 
        this.inputEl = document.getElementById(ID_INPUT);
        this.labelEl = document.getElementById(ID_LABEL);
        this.goEl    = document.getElementById(ID_GO);
      
        // Set the label text from messages
        this.labelEl.textContent = this.messageHandler.get("LABEL_HOW_MANY");
      
        // show limits hint inside the input
        this.inputEl.placeholder = this.messageHandler.get("INPUT_PLACEHOLDER");


        // “Go” starts a new game
        this.goEl.addEventListener("click", () => {
          this.startNewGame();
        });
      }
      
      startNewGame() {
        // Read and validate n
        const raw = this.inputEl.value;
        const n = Number(raw);
      
        const isInt = Number.isInteger(n);
        const inRange = n >= MIN_BUTTONS && n <= MAX_BUTTONS;
      
        if (isInt === false || inRange === false) {
          // Let use know the input was bad
          this.messageHandler.setMessage("MSG_INVALID_INPUT");
          return;
        }
      
        // Clean any previous game (timers, buttons, state)
        this.cleanup();
      
        // Setup: create row of numbered buttons
        this.currentPhase = PHASE_SETUP;
        this.buttonManager.createButtons(n);
        this.buttonManager.showNumbers();
        this.originalOrder = this.buttonManager.getOriginalOrder();
      
        // Pause exactly n seconds before scrambling 
        const pauseMs = n * PAUSE_SECONDS_PER_BUTTON * 1000;
        this.currentPhase = PHASE_PAUSE;
      
        this.pauseTimeout = window.setTimeout(() => {
          // Hand off to do some scrambling
          this.beginScramblePhase(n);
        }, pauseMs);
      }
      

      beginScramblePhase(n) {
        // We are now SCRAMBLING
        this.currentPhase = PHASE_SCRAMBLING;
      
        // “n times”, spaced by 2s.
        this.scrambleTarget = n * SCRAMBLE_COUNT_PER_BUTTON;
      
        // Start fresh for this round
        this.scrambleCount = 0;
      
        // Safety: if a previous scramble timer existed, clear it
        if (this.scrambleInterval !== null) {
          window.clearTimeout(this.scrambleInterval);
          this.scrambleInterval = null;
        }
      
        // Perform the first scramble immediately
        this.performNextScramble();
      }

      performNextScramble() {
        // If we've already done all required scrambles, move to PLAY phase
        if (this.scrambleCount >= this.scrambleTarget) {
          this.enablePlay(); // this will hide numbers and enable clicks
          return;
        }
      
        // Re-read the current window size BEFORE each scramble
        const currentWidth = window.innerWidth;
        const currentHeight = window.innerHeight;
      
        // Ask ButtonManager to place each button at a new random in-bounds position
        this.buttonManager.scrambleWithin(currentWidth, currentHeight);
      
        // We just completed one scramble
        this.scrambleCount += 1;
      
        // Schedule the next scramble in SCRAMBLE_INTERVAL_MS
        this.scrambleInterval = window.setTimeout(() => {
          this.performNextScramble();
        }, SCRAMBLE_INTERVAL_MS);
      }
      
      

      enablePlay() {
        // Transition to the PLAY phase: buttons become clickable
        this.currentPhase = PHASE_PLAY;
      
        // Hide the numbers so the user must remember the original order
        this.buttonManager.hideNumbers();
      
        // Player progress starts at the first expected id in originalOrder
        this.currentIndex = 0;
      
        // Enable clicks; when a button is clicked, we receive its original idNumber
        this.buttonManager.enableClicks((clickedIdNumber) => {
          this.handlePlayerClick(clickedIdNumber);
        });
      }
      

      handlePlayerClick(buttonIdNumber) {
        // Ignore any clicks if not in PLAY phase (safety)
        if (this.currentPhase !== PHASE_PLAY) {
          return;
        }
      
        // The expected button id is the next one in the original sequence
        const expectedId = this.originalOrder[this.currentIndex];
      
        if (buttonIdNumber === expectedId) {
          // Correct: reveal this button’s number to confirm progress
          this.buttonManager.revealButtonById(buttonIdNumber);
      
          // Advance to the next expected id
          this.currentIndex += 1;
      
          // If we’ve matched all buttons, it’s a win
          if (this.currentIndex === this.originalOrder.length) {
            this.endGameAsSuccess();
          }
        } else {
          // First incorrect click ends the game immediately
          this.endGameAsFailure();
        }
      }
      

      endGameAsSuccess() {
        // Enter END phase to prevent further input
        this.currentPhase = PHASE_END;
      
        // Show success message from the messages file
        this.messageHandler.setMessage("MSG_EXCELLENT");
      
        // Stop accepting clicks
        this.buttonManager.disableClicks();
      }
      

      endGameAsFailure() {
        // Enter END phase to prevent further input
        this.currentPhase = PHASE_END;
      
        // Show failure message
        this.messageHandler.setMessage("MSG_WRONG");
      
        // Reveal the correct order for all buttons
        this.buttonManager.revealAll();
      
        // Stop accepting clicks
        this.buttonManager.disableClicks();
      }
      

      cleanup() {
        // stop any pending timers
        if (this.pauseTimeout !== null) {
          window.clearTimeout(this.pauseTimeout);
          this.pauseTimeout = null;
        }
        if (this.scrambleInterval !== null) {
          window.clearTimeout(this.scrambleInterval);
          this.scrambleInterval = null;
        }
      
        // lock input and clear board
        this.buttonManager.disableClicks();
        this.buttonManager.removeAll();
      
        // reset state
        this.originalOrder = [];
        this.currentIndex = 0;
        this.scrambleCount = 0;
        this.scrambleTarget = 0;
        this.currentPhase = PHASE_IDLE;
      }
      
}

// ============================
// ButtonManager
// ============================

class ButtonManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.buttons = []; // will hold button objects or DOM references
        this.buttonWidthPx = 0;
        this.buttonHeightPx = 0;
    }

    createButtons(n) {
        // 1) Clear any old buttons/state
        this.removeAll();
      
        // 2) Build n buttons, numbered 1..n
        for (let i = 1; i <= n; i += 1) {
          const button = document.createElement("button");
          button.id = BTN_ID_PREFIX + String(i);       // unique, readable id like "btn-3"
          button.textContent = String(i);              // show original number
      
          // Simple random color
          const hue = Math.floor(Math.random() * 360);
          button.style.backgroundColor = `hsl(${hue}, 75%, 70%)`;
      
          this.container.appendChild(button);          // add to DOM
          this.buttons.push({ idNumber: i, button });  // remember element + original number
        }
      
        // 3) Measure one button exactly once 
        if (this.buttons.length > 0) {
          const sample = this.buttons[0].button;
          const rect = sample.getBoundingClientRect(); // rendered size in CSS pixels
          this.buttonWidthPx = Math.round(rect.width);
          this.buttonHeightPx = Math.round(rect.height);
        }
      }
      

      removeAll() {
        this.container.innerHTML = "";
        this.buttons = [];
        this.buttonWidthPx = 0;
        this.buttonHeightPx = 0;
      
        // Reset mode classes for a fresh start next time
        this.container.classList.remove(CLASS_ROW);
        this.container.classList.remove(CLASS_SCRAMBLE);
        this.container.style.width = "";
        this.container.style.height = "";
      }
      

      showNumbers() {
        for (const b of this.buttons) {
          b.button.textContent = String(b.idNumber);
        }
      }
      
      hideNumbers() {
        for (const b of this.buttons) {
          b.button.textContent = "";
        }
      }
      

      enableClicks(handler) {
        // Attach one listener per button that calls back with its original idNumber
        for (const b of this.buttons) {
          // Save the exact function so we can remove it later
          b._listener = () => {
            handler(b.idNumber);
          };
          b.button.addEventListener("click", b._listener);
        }
      }
      
      disableClicks() {
        // Remove any listeners we previously added
        for (const b of this.buttons) {
          if (b._listener) {
            b.button.removeEventListener("click", b._listener);
            b._listener = null;
          }
        }
      }
      

      scrambleWithin(windowWidth, windowHeight) {
        // switch container into scramble mode (absolute positioning context)
        this.container.classList.remove(CLASS_ROW);
        this.container.classList.add(CLASS_SCRAMBLE);
      
        // place each button at a random in-bounds position
        for (const button of this.buttons) {
          // random x inside the viewport minus the button size
          const maxX = Math.max(0, windowWidth - this.buttonWidthPx);
      
          // use the container’s actual visible height 
          const containerRect = this.container.getBoundingClientRect();
          const usableHeight = Math.max(0, Math.round(containerRect.height));
          const maxY = Math.max(0, usableHeight - this.buttonHeightPx);

          let x = Math.floor(Math.random() * (maxX + 1));
          let y = Math.floor(Math.random() * (maxY + 1));

          // pass usableHeight to the clamp
          const clamped = this.clampToViewport(x, y, windowWidth, usableHeight);

          // absolute positioning is enabled by the .scramble-mode CSS rule
          button.button.style.left = String(clamped.x) + "px";
          button.button.style.top = String(clamped.y) + "px";
        }
      }
      
      clampToViewport(x, y, windowWidth, usableHeight) {
        let cx = x;
        let cy = y;
      
        // left/top edges
        if (cx < 0) {
          cx = 0;
        }
        if (cy < 0) {
          cy = 0;
        }
      
        // right/bottom edges (ensure the whole button stays on screen)
        const maxX = windowWidth - this.buttonWidthPx;
        const maxY = usableHeight - this.buttonHeightPx;
      
        if (cx > maxX) {
          cx = maxX;
        }
        if (cy > maxY) {
          cy = maxY;
        }
      
        return { x: cx, y: cy };
      }
      

    getOriginalOrder() {
        // return array of button ids in original order
        const order = [];
        for (const b of this.buttons) {
          order.push(b.idNumber);
        }
        order.sort((a, b) => a - b);
        return order;
    }

    revealButtonById(id) {
        for (const b of this.buttons) {
          if (b.idNumber === id) {
            b.button.textContent = String(b.idNumber);
            break;
          }
        }
      }
      
      revealAll() {
        this.showNumbers();
      }
      
}

// ============================
// MessageHandler
// ============================
class MessageHandler {
    constructor(messageElementId, messages) {
        this.messageElement = document.getElementById(messageElementId);
        this.messages = messages; // imported constants from user.js
    }

    setMessage(key) {
        // Show a user-facing message by key (keeps strings out of logic)
          const text = this.messages[key];
        this.messageElement.textContent = text;

        // success/error classes based on key
        this.messageElement.classList.remove("message--success", "message--error");
        if (key === "MSG_EXCELLENT") {
          this.messageElement.classList.add("message--success");
        } else if (key === "MSG_WRONG" || key === "MSG_INVALID_INPUT") {
          this.messageElement.classList.add("message--error");
        } 
      }
      
      get(key) {
        // Retrieve a message string by key (used to set label text)
        return this.messages[key];
      }
      
}
