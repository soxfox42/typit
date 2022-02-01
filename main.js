// ==== IMPORTS ====
import config from './config.js';
import words from './words.js';
import { encode, decode } from './encoder.js';
import "https://cdnjs.cloudflare.com/ajax/libs/seedrandom/3.0.5/seedrandom.min.js";

// ==== PARAMETERS ====
const urlParams = new URLSearchParams(location.search);
window.history.pushState("", "", location.pathname);

// ==== VIEWPORT SIZE ====
document.body.style.height = window.innerHeight + 'px';
window.addEventListener("resize", () => {
    document.body.style.height = window.innerHeight + 'px';
})

// ==== GAME BOARD ====
const board = document.getElementById("board");
for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.classList.add("row");
    board.appendChild(row);
    for (let j = 0; j < 5; j++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        row.appendChild(cell);
    }
}

// Apply height patch (required by Safari, but breaks Chrome)
if (board.children[0].children[0].getBoundingClientRect().width == 0) {
    document.body.classList.add("height-fix");
}

// ==== TOUCH KEYBOARD ====
const KEYBOARD_LAYOUT = config.keyboardLayout[config.language];
const SPECIAL = {
    "Enter": "➔",
    "Backspace": "⌫",
};

const keyboard = document.getElementById("keyboard");
let keyboardEls = {};
for (const row of KEYBOARD_LAYOUT) {
    const rowEl = document.createElement("div");
    rowEl.classList.add("key-row");
    keyboard.appendChild(rowEl);
    for (const key of row.split(",")) {
        const keyEl = document.createElement("div");
        if (SPECIAL[key]) {
            keyEl.innerText = SPECIAL[key];
            keyEl.classList.add("wide");
        } else {
            keyEl.innerText = key;
        }
        keyEl.classList.add("key");
        ["touchstart", "mousedown"].forEach(eventName =>
            keyEl.addEventListener(eventName, evt => {
                evt.preventDefault();
                document.dispatchEvent(new KeyboardEvent("keydown", { key }))
                evt.target.classList.add("pressed");
            })
        );
        ["touchend", "mouseup", "mouseout"].forEach(eventName =>
            keyEl.addEventListener(eventName, evt => {
                evt.target.classList.remove("pressed");
            })
        );
        rowEl.appendChild(keyEl);
        keyboardEls[key.toLowerCase()] = keyEl;
    }
}

// ==== MODALS ====
const menuContainer = document.getElementById("menu-container");

if (!window.localStorage.getItem("read-help")) {
    menuContainer.classList.remove("hide");
    window.localStorage.setItem("read-help", true);
}

const containers = document.getElementsByClassName("container");
for (const el of containers) {
    el.addEventListener("click", () => {
        el.classList.add("hide");
    })
    el.children[0].addEventListener("click", ev => {
        ev.stopPropagation();
    })
}

document.getElementById("dismiss").addEventListener("click", ev => {
    ev.target.parentElement.parentElement.classList.add("hide");
})

document.getElementById("share").addEventListener("click", () => {
    copyGameResults();
    document.getElementById("share").innerText = "Copied!";
    document.getElementById("share").classList.add("confirm");
    setTimeout(() => {
        document.getElementById("share").innerText = "Share";
        document.getElementById("share").classList.remove("confirm");
    }, 2000);
})

// ==== TOOLBAR BUTTONS ====
document.getElementById("results").addEventListener("click", ev => {
    document.getElementById("end-container").classList.remove("hide");
    ev.target.blur();
});

document.getElementById("show-menu").addEventListener("click", ev => {
    menuContainer.classList.remove("hide");
    ev.target.blur();
});

// ==== OPTIONS ====
let animTime = 300;

if (window.localStorage.getItem("fast-mode") == "true") {
    document.getElementById("fast-mode").checked = true;
    animTime = 0;
}

document.getElementById("fast-mode").addEventListener("change", ev => {
    window.localStorage.setItem("fast-mode", ev.target.checked);
    if (ev.target.checked) {
        animTime = 0;
    } else {
        animTime = 300;
    }
    console.log(animTime);
})

// ==== DAILY STATE ====
let dayIndex = Math.floor((Date.now() - Date.UTC(2022, 1, 1)) / 86400000);
let prng = new Math.seedrandom(dayIndex);
let dailyWord = words.targets[Math.floor(prng() * words.targets.length)];
console.log(dailyWord);

let dailyHistory = JSON.parse(localStorage.getItem("daily-history")) || {};

function saveDaily(guesses) {
    dailyHistory[dayIndex] = {
        target: dailyWord,
        guesses
    };
    localStorage.setItem("daily-history", JSON.stringify(dailyHistory));
}

// ==== GAME LOGIC ====
let row, curGuess, win, target, shareData, guesses;
let isDaily = !(dayIndex in dailyHistory);
let scoring = false;

function scoreGuess(target, guess) {
    target = target.split("");
    let scores = Array(5).fill("incorrect");
    for (let i = 0; i < 5; i++) {
        if (target[i] == guess[i]) {
            scores[i] = "correct";
            target[i] = " ";
        }
    }
    for (let i = 0; i < 5; i++) {
        if (scores[i] == "correct") continue;
        let index = target.indexOf(guess[i]);
        if (index == -1) continue;
        scores[i] = "close";
        target[index] = " ";
    }
    return scores;
}

function copyGameResults() {
    let results = "";
    if (win) {
        results += `Typit ${row}/6\n`;
    } else {
        results += "Typit X/6\n";
    }
    for (let scores of shareData) {
        for (let score of scores) {
            switch (score) {
                case "correct":
                    results += "🟩";
                    break;
                case "close":
                    results += "🟨";
                    break;
                case "incorrect":
                    results += "⬜";
                    break;
            }
        }
        results += "\n";
    }
    results += location.href.split("?")[0] + "?w=" + encode(target);
    navigator.clipboard.writeText(results);
}

function resetGame() {
    row = 0;
    curGuess = "";
    guesses = [];
    win = false;
    if (urlParams.has("w")) {
        target = decode(urlParams.get("w"));
        urlParams.delete("w");
    } else if (dayIndex in dailyHistory) {
        target = words.targets[Math.floor(Math.random() * words.targets.length)];
    } else {
        target = dailyWord;
    }
    shareData = [];
    document.getElementById("word").innerText = target.toUpperCase();
    for (const rowEl of board.children) {
        for (const cell of rowEl.children) {
            cell.classList.remove("filled");
            cell.classList.remove("incorrect");
            cell.classList.remove("close");
            cell.classList.remove("correct");
        }
    }
    for (const keyID in keyboardEls) {
        keyboardEls[keyID].classList.remove("incorrect");
        keyboardEls[keyID].classList.remove("close");
        keyboardEls[keyID].classList.remove("correct");
    }
    document.getElementById("end-container").classList.add("hide");
    document.getElementById("results").classList.add("hide");
}

document.getElementById("play-again").addEventListener("click", resetGame);

document.addEventListener("keydown", e => {
    if (!menuContainer.classList.contains("hide") || row >= 6 || win || scoring) return;
    if (e.key == "Backspace" && curGuess.length > 0) {
        curGuess = curGuess.slice(0, -1);
        board.children[row].children[curGuess.length].classList.remove("filled");
        return;
    }
    if (e.key == "Enter") {
        let realWord = words.targets.includes(curGuess) || words.other.includes(curGuess) || curGuess == "typit";
        if (curGuess.length != 5 || !realWord) {
            board.children[row].classList.add("shake");
            setTimeout(() => board.children[row].classList.remove("shake"), 400);
            return;
        }
        guesses.push(curGuess);
        console.log(guesses);
        scoring = true;
        setTimeout(() => scoring = false, animTime * 4);
        let scores = scoreGuess(target, curGuess);
        shareData.push(scores);
        for (let i = 0; i < 5; i++) {
            const savedRow = row, savedGuess = curGuess;
            setTimeout(() => {
                board.children[savedRow].children[i].classList.add(scores[i]);
                keyboardEls[savedGuess[i]].classList.add(scores[i]);
            }, animTime * i);
        }
        if (scores.every(s => s == "correct")) {
            win = true;
            setTimeout(() => {
                document.getElementById("end-container").classList.remove("hide");
                document.getElementById("results").classList.remove("hide");
                document.getElementById("win").classList.remove("hide");
                document.getElementById("lose").classList.add("hide");
                if (isDaily) {
                    saveDaily(guesses);
                    isDaily = false;
                }
            }, animTime * 5)
        }
        row++;
        curGuess = "";
        if (row >= 6 && !win) {
            setTimeout(() => {
                document.getElementById("end-container").classList.remove("hide");
                document.getElementById("results").classList.remove("hide");
                document.getElementById("win").classList.add("hide");
                document.getElementById("lose").classList.remove("hide");
                if (isDaily) {
                    saveDaily(guesses);
                    isDaily = false;
                }
            }, animTime * 5)
        }
        return;
    }
    if (!(config.keyboardValidation[config.language]).test(e.key) || curGuess.length >= 5) return;
    let cell = board.children[row].children[curGuess.length];
    cell.innerText = e.key.toUpperCase();
    cell.classList.add("filled");
    curGuess += e.key.toLowerCase();
});

resetGame();
