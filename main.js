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
const KEYBOARD_LAYOUT = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
]

const keyboard = document.getElementById("keyboard");
let keyboardEls = {};
for (const [i, row] of KEYBOARD_LAYOUT.entries()) {
    const rowEl = document.createElement("div");
    rowEl.classList.add("key-row");
    keyboard.appendChild(rowEl);
    for (const char of row) {
        const keyEl = document.createElement("div");
        keyEl.innerText = char;
        keyEl.classList.add("key");
        keyEl.addEventListener("click", () => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: char }))
        });
        rowEl.appendChild(keyEl);
        keyboardEls[char.toLowerCase()] = keyEl;
    }
    if (i == 2) {
        const enterEl = document.createElement("div");
        enterEl.innerText = "➔"
        enterEl.classList.add("key", "wide");
        enterEl.addEventListener("click", () => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        });
        rowEl.insertBefore(enterEl, rowEl.firstChild);
        const backspaceEl = document.createElement("div");
        backspaceEl.innerText = "⌫"
        backspaceEl.classList.add("key", "wide");
        backspaceEl.addEventListener("click", () => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace" }));
        });
        rowEl.appendChild(backspaceEl);
    }
}

// ==== MODALS ====
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

// ==== GAME LOGIC ====
let row, guess, win, target;

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
    if (row >= 6 || win) return;
    if (e.key == "Backspace" && guess.length > 0) {
        guess = guess.slice(0, -1);
        board.children[row].children[guess.length].classList.remove("filled");
        return;
    }
    if (e.key == "Enter") {
        if (guess.length != 5 || !(words.targets.includes(guess) || words.other.includes(guess))) {
            board.children[row].classList.add("shake");
            setTimeout(() => board.children[row].classList.remove("shake"), 400);
            return;
        }
        let scores = scoreGuess(target, guess);
        if (scores.every(s => s == "correct")) {
            win = true;
            document.getElementById("end-container").classList.remove("hide");
            document.getElementById("win").classList.remove("hide");
            document.getElementById("lose").classList.add("hide");
        }
        for (let i = 0; i < 5; i++) {
            board.children[row].children[i].classList.add(scores[i]);
            keyboardEls[guess[i]].classList.add(scores[i]);
        }
        row++;
        guess = "";
        if (row >= 6 && !win) {
            document.getElementById("end-container").classList.remove("hide");
            document.getElementById("win").classList.add("hide");
            document.getElementById("lose").classList.remove("hide"); 
        }
        return;
    }
    if (!(/^[a-z]$/i).test(e.key) || guess.length >= 5) return;
    let cell = board.children[row].children[guess.length];
    cell.innerText = e.key.toUpperCase();
    cell.classList.add("filled");
    guess += e.key.toLowerCase();
});

resetGame();
