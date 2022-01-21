// ==== CONFIG ====
import config from './config.js';

// ==== WORD LIST ====
import words from './words.js';

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
for (const [i, row] of KEYBOARD_LAYOUT.entries()) {
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

// ==== TOOLBAR BUTTONS ====
document.getElementById("new").addEventListener("click", ev => {
    resetGame();
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

// ==== GAME LOGIC ====
let row, guess, win, target;
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

function resetGame() {
    row = 0;
    guess = "";
    win = false;
    target = words.targets[Math.floor(Math.random() * words.targets.length)];
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
}

document.getElementById("play-again").addEventListener("click", resetGame);

document.addEventListener("keydown", e => {
    if (!menuContainer.classList.contains("hide") || row >= 6 || win || scoring) return;
    if (e.key == "Backspace" && guess.length > 0) {
        guess = guess.slice(0, -1);
        board.children[row].children[guess.length].classList.remove("filled");
        return;
    }
    if (e.key == "Enter") {
        let realWord = words.targets.includes(guess) || words.other.includes(guess) || guess == "typit";
        if (guess.length != 5 || !realWord) {
            board.children[row].classList.add("shake");
            setTimeout(() => board.children[row].classList.remove("shake"), 400);
            return;
        }
        scoring = true;
        setTimeout(() => scoring = false, animTime * 4);
        let scores = scoreGuess(target, guess);
        for (let i = 0; i < 5; i++) {
            const savedRow = row, savedGuess = guess;
            setTimeout(() => {
                board.children[savedRow].children[i].classList.add(scores[i]);
                keyboardEls[savedGuess[i]].classList.add(scores[i]);
            }, animTime * i);
        }
        if (scores.every(s => s == "correct")) {
            win = true;
            setTimeout(() => {
                document.getElementById("end-container").classList.remove("hide");
                document.getElementById("win").classList.remove("hide");
                document.getElementById("lose").classList.add("hide");
            }, animTime * 5)
        }
        row++;
        guess = "";
        if (row >= 6 && !win) {
            setTimeout(() => {
                document.getElementById("end-container").classList.remove("hide");
                document.getElementById("win").classList.add("hide");
                document.getElementById("lose").classList.remove("hide");
            }, animTime * 5)
        }
        return;
    }
    if (!(config.keyboardValidation[config.language]).test(e.key) || guess.length >= 5) return;
    let cell = board.children[row].children[guess.length];
    cell.innerText = e.key.toUpperCase();
    cell.classList.add("filled");
    guess += e.key.toLowerCase();
});

resetGame();
