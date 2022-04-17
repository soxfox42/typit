// ==== CONFIG ====
import config from './config.js?cacheid=2';

// ==== WORD LIST ====
var targets, others;

async function loadJSON(filename, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

loadJSON("target-words.json", function(response) {
    targets = JSON.parse(response)["data"];
    main();
});

loadJSON("other-words.json", function(response) {
    others = JSON.parse(response)["data"];
    main();
});


// ==== VIEWPORT SIZE ====
document.body.style.height = window.innerHeight + 'px';
window.addEventListener("resize", () => {
    document.body.style.height = window.innerHeight + 'px';
})


function getLocalStorageInt(key) {
    let value = window.localStorage.getItem(key);

    if (value == null) {
        value = 0;
    }
    else {
        value = parseInt(value);
        if (isNaN(value)) {
            value = 0;
        }
    }
    return value;
}

function selectColorMode() {
    if (window.localStorage.getItem("colorblind-mode") == "true") {
        document.getElementById("colorblind-style").href = "colorblind.css"
    } else {
        document.getElementById("colorblind-style").href = ""
    }
}


// ==== GAME BOARD ====
const board = document.getElementById("board");
for (let r = 0; r < config.maxGuesses; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    board.appendChild(rowDiv);
    for (let c = 0; c < config.wordLength; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        rowDiv.appendChild(cell);
    }
}

// Apply height patch (required by Safari, but breaks Chrome)
if (board.children[0].children[0].getBoundingClientRect().width == 0) {
    document.body.classList.add("height-fix");
}

// ==== TOUCH KEYBOARD ====
const KEYBOARD_LAYOUT = config.keyboardLayout[config.language]
const SPECIAL = {
    "Enter": "<span style=\"font-size: 150%\"><strong>✔</strong></span>",
    "Backspace": "<span style=\"font-size: 200%\"><strong>⎌</strong></span>",
}

const keyboard = document.getElementById("keyboard");
let keyboardEls = {};
for (const [i, row] of KEYBOARD_LAYOUT.entries()) {
    const rowEl = document.createElement("div");
    rowEl.classList.add("key-row");
    keyboard.appendChild(rowEl);
    for (const key of row.split(",")) {
        const keyEl = document.createElement("div");
        if (SPECIAL[key]) {
            keyEl.innerHTML = SPECIAL[key];
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
const statsContainer = document.getElementById("settings-container");
const endContainer = document.getElementById("end-container");
const infoContainer = document.getElementById("info-container");
const changelogContainer = document.getElementById("update-info-container");


let lastUpdateNote = "2022-04-17"; // Set to today on news updates
if (window.localStorage.getItem("read-update-note") != lastUpdateNote && window.localStorage.getItem("read-help")) { // Show updates, but only if the help does not get shown
    changelogContainer.classList.remove("hide");
    window.localStorage.setItem("read-update-note", lastUpdateNote);
}

if (!window.localStorage.getItem("read-help")) {
    infoContainer.classList.remove("hide");
    window.localStorage.setItem("read-update-note", lastUpdateNote);
    window.localStorage.setItem("read-help", true);
}


// Debug: Call once god-menu.htm to unlock useful links in the statistics menu
if (window.localStorage.getItem("god-menu")) {
    document.getElementById("god-menu").classList.remove("hide");
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

document.getElementById("dismiss-info").addEventListener("click", ev => {
    ev.target.parentElement.parentElement.classList.add("hide");
})

document.getElementById("dismiss-settings").addEventListener("click", ev => {
    ev.target.parentElement.parentElement.classList.add("hide");
})

document.getElementById("show-news").addEventListener("click", ev => {
    infoContainer.classList.add("hide");
    changelogContainer.classList.remove("hide");
})

document.getElementById("share").addEventListener("click", ev => {
    let letterMap = createLetterMap();
    
    const event = new Date(timestamp * 1000);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    let dateFormated = event.toLocaleDateString('de-CH', options);

    let textVersuche = ["🏆 Wow! Ich habe das heutige Wort auf https://wordle-deutsch.ch mit nur 1 Versuch erraten!",
                      "🎉 Genial! Ich habe das heutige Wort auf https://wordle-deutsch.ch mit nur 2 Versuchen erraten!",
                         "Juhui! Ich habe das heutige Wort auf https://wordle-deutsch.ch mit nur 3 Versuchen erraten!",
                           "Hmm! Ich habe das heutige Wort auf https://wordle-deutsch.ch mit 4 Versuchen erraten!",
                                "Ich habe das heutige Wort auf https://wordle-deutsch.ch mit 5 Versuchen erraten!",
                         "🎈 Uff! Ich habe das heutige Wort auf https://wordle-deutsch.ch gerade noch mit 6 Versuchen erraten!"];

    let text = textVersuche[row-1] + "\r\n" + dateFormated + "\r\n" + letterMap;

    var t = document.createElement("textarea");
    t.textContent = text, document.body.appendChild(t), t.select(), document.execCommand("copy"), document.body.removeChild(t)
    
    document.getElementById("share").innerText = "In die Zwischenablage kopiert";
})

document.getElementById("start-normal1").addEventListener("click", ev => {
    localStorage.setItem("random-mode", 0); // Switch to the normal mode on test page load
    window.location.href = "index.htm"; // Reload page
});

document.getElementById("settings-menu-start-wotd").addEventListener("click", ev => {
    localStorage.setItem("random-mode", 0); // Switch to the normal mode on test page load
    window.location.href = "index.htm"; // Reload page
});

document.getElementById("start-random1").addEventListener("click", ev => {
    localStorage.setItem("random-mode", 1); // Switch to the random mode on test page load
//     localStorage.setItem("random-timestamp", 0); // Trigger selection of a new random word
    window.location.href = "index.htm"; // Reload page
});

document.getElementById("start-random2").addEventListener("click", ev => {
    localStorage.setItem("random-mode", 1); // Switch to the random mode on test page load
    localStorage.setItem("random-timestamp", 0); // Trigger selection of a new random word
    window.location.href = "index.htm"; // Reload page
});

document.getElementById("settings-menu-start-random").addEventListener("click", ev => {
    localStorage.setItem("random-mode", 1); // Switch to the random mode on test page load
//     localStorage.setItem("random-timestamp", 0); // Trigger selection of a new random word
    window.location.href = "index.htm"; // Reload page
});

// ==== TOOLBAR BUTTONS ====
document.getElementById("show-settings").addEventListener("click", ev => {
    statsContainer.classList.remove("hide");
    ev.target.blur();
});

document.getElementById("show-statistics").addEventListener("click", ev => {
    statsContainer.classList.remove("hide");
    ev.target.blur();
});

document.getElementById("show-info").addEventListener("click", ev => {
    infoContainer.classList.remove("hide");
    ev.target.blur();
});

document.getElementById("dismiss-end").addEventListener("click", ev => {
    endContainer.classList.add("hide");
    ev.target.blur();
});

document.getElementById("dismiss-settings").addEventListener("click", ev => {
    statsContainer.classList.add("hide");
    ev.target.blur();
});

document.getElementById("dismiss-info").addEventListener("click", ev => {
    infoContainer.classList.add("hide");
    ev.target.blur();
});

document.getElementById("dismiss-update-info").addEventListener("click", ev => {
    changelogContainer.classList.add("hide");
    ev.target.blur();
});

// ==== OPTIONS ====
let animTime = 300;

if (window.localStorage.getItem("fast-mode") == "true") {
    document.getElementById("fast-mode").checked = true;
    animTime = 0;
}

if (window.localStorage.getItem("colorblind-mode") == "true") {
    document.getElementById("colorblind-mode").checked = true;
}

document.getElementById("fast-mode").addEventListener("change", ev => {
    window.localStorage.setItem("fast-mode", ev.target.checked);
    if (ev.target.checked) {
        animTime = 0;
    }
    else {
        animTime = 300;
    }
    console.log("New Animation time: " + animTime);
})

document.getElementById("colorblind-mode").addEventListener("change", ev => {
    window.localStorage.setItem("colorblind-mode", ev.target.checked);
    selectColorMode();
})

// ==== GAME LOGIC ====
let row = 0, guess = "", win = false, lose = false, target = "";
let scoring = false;
let timestamp;
let gameMode;
// let randomTimestamp, randomTarget;
let creditPoints = 0;

function scoreGuess(t, guess) {
    t = t.split("");
    let scores = Array(config.wordLength).fill("incorrect");
    for (let i = 0; i < config.wordLength; i++) {
        if (t[i] == guess[i]) {
            scores[i] = "correct";
            t[i] = " ";
        }
    }
    for (let i = 0; i < config.wordLength; i++) {
        if (scores[i] == "correct") continue;
        let index = t.indexOf(guess[i]);
        if (index == -1) continue;
        scores[i] = "close";
        t[index] = " ";
    }
    return scores;
}


function createLetterMap() {
    let yellowBox = "🟨";
    let greenBox = "🟩";
    let grayBox = "⬛";

    let letterMap = "";
    let g = "";
    for (let r = 0; r < config.maxGuesses; r++) {
        g = localStorage.getItem(gameMode + "_" + "row" + r);
        if (g == null) { // Row is null, use previous row
            g = "";
        }
        else {
            g = g.toLowerCase();
        }

        let scores = scoreGuess(target, g);
        for (let c = 0; c < config.wordLength; c++) {
            if( c < g.length) {
                if ((g.length == config.wordLength)) {
                    if (scores[c] == "correct") {
                        letterMap += greenBox;
                    }
                    else if (scores[c] == "close") {
                        letterMap += yellowBox;
                    }
                    else {
                        letterMap += grayBox;
                    }
                }
            }
            else {
                letterMap += greenBox;
            }
        }
        letterMap += "\r\n";
    }

    return letterMap;
}


// Random number generator with a seed
// Kudos: https://stackoverflow.com/a/47593316/8369030 and https://gist.github.com/blixt/f17b47c62508be59987b
function mulberry32(a) {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}


function getTodaysTimestamp() {
    let now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()/1000; 
}


function getFutureTimestamp(days) {
    return getTodaysTimestamp() + days * 60*60*24;
}


function getIndex(ts) {
    let rand = mulberry32(ts);
    let index = Math.floor(rand * targets.length);
//     console.log("Todays Index: " + index);
    return index;
}


// Kudos: https://hellodevworld.com/365-days-of-coding/rot13-cipher-javascript-solution
function rot13(message) {
    if ((message == "") || (message == null)) {
        return "";
    }
    return message.replace(/[a-z]/gi, letter => String.fromCharCode(letter.charCodeAt(0) + (letter.toLowerCase() <= 'm' ? 13 : -13)));
}


function questionBox(text) {
    var defer = $.Deferred();
    $.ui.dialog.prototype._focusTabbable = function(){}; // Disable focus
    $( "<div>" + text + "</div>" ).dialog({
        closeOnEscape: false,
        closeOnEnter: false,
        async: false,
        title: "Wordle auf Deutsch",
        resizable: false,
        height: "auto",
        width: "80%",
        modal: true,
        buttons: [
            {
                text: "Zufälliges Wort",
                "class": "random",
                click: function() {
                    defer.resolve("Ja");
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Wort-des-Tages",
                "class": "day",
                click: function() {
                    defer.resolve("Nein");
                    $( this ).dialog( "close" );
                }
            }
        ],
        close: function () {
            $(this).remove(); //removes this dialog div from DOM
        }
    });
    return defer.promise();
}


function alertBox(text) {
    var defer = $.Deferred();
    $( "<div>" + text + "</div>" ).dialog({
        closeOnEscape: false,
        async: false,
        title: "Wordle auf Deutsch",
        resizable: false,
        height: "auto",
        width: "80%",
        modal: true,
        buttons: {
            Ok: function() {
                defer.resolve("Ok");
                $( this ).dialog( "close" );
            }
        },
        close: function () {
            $(this).remove(); //removes this dialog div from DOM
        }
    });
    return defer.promise();
}


/*
 * Core initialization
 */
function initGame() {
    console.log("initGame");

    resetCellsAndKeyboard();

    creditPoints = getLocalStorageInt("credit-points");
    console.log("Credit Points: " + creditPoints);
    let selection = "today";
    
    
    if (getLocalStorageInt("random-mode") == 1) {
        gameMode = "random";
    }
    else {
        gameMode = "word-of-the-day";   
    }

    console.log("Game Mode: " + gameMode);

    if (gameMode == "random") {
        timestamp = getLocalStorageInt("random-timestamp");
        target = rot13(localStorage.getItem("random-target"));
        console.log("Random timestamp From Store: "+ timestamp);
        if (timestamp == 0) { // Timestamp invalid
            console.log("timestamp is 0, use new random timestamp");
            timestamp = getTodaysTimestamp();

            if (creditPoints == 0) {
                alertBox("Du hast keine Punkte verfügbar, gewinne zuerst ein Wort-des-Tages um Punkte zu kriegen!").then(function () {
                    localStorage.setItem("random-mode", 0); // Switch to the normal mode on test page load
                    window.location.href = "index.htm"; // reload page
                });
                // We never reach this line (page reload)
            }
            else { // Enough Credit points
                creditPoints -= 1;
                window.localStorage.setItem("credit-points", creditPoints);

                timestamp = Math.ceil(Math.random() * 2e10);
                target = targets[getIndex(timestamp)];

                window.localStorage.setItem("random-timestamp", timestamp);
                window.localStorage.setItem("random-target", rot13(target));
                resetGame();
            }
        }
        else { // Timestamp valid
            if ((target == "") || (target == null)) {  // Target from store is invalid
                console.log("Target from store is invalid! => new game");

                timestamp = Math.ceil(Math.random() * 2e10);
                target = targets[getIndex(timestamp)];

                window.localStorage.setItem("random-timestamp", timestamp);
                window.localStorage.setItem("random-target", rot13(target));
                resetGame();
            }
            else { // Target from store is valid
                console.log("Use pre-selected random word");
                loadGame();   

//                 /* If we have a completed random game, reset it */
//                 console.log(win, lose);
                if ((win == true) || (lose == true)) { // The previous random game got completed (won or losed), start a new one
                    localStorage.setItem("random-timestamp", 0); // Invalidate target to make sure the game gets reset
                    window.location.href = "index.htm"; // reload page
                }
            }
        }

        document.body.style.backgroundColor = "#0064ab"; // Change background color
//         document.getElementById("settings-menu-start-wotd").classList.remove("hide");
    }   

    else { // Word of the day
        timestamp = getLocalStorageInt("word-of-the-day-timestamp");
        target = rot13(localStorage.getItem("word-of-the-day-target"));
        console.log("wotd timestamp From Store: " + timestamp);
        if (timestamp == 0) { // Timestamp invalid
            console.log("timestamp is 0, use new wotd word");
            timestamp = getTodaysTimestamp();
            target = get_WordOfTheDay_FromServer(timestamp);

            localStorage.setItem("word-of-the-day-target", rot13(target));
            localStorage.setItem("word-of-the-day-timestamp", timestamp);
            resetGame();
        }
        else { // Timestamp valid
            if (getTodaysTimestamp() == timestamp) { // Stored timestamp is from today
                if ((target == "") || (target == null)) {  // Target from store is invalid
                    console.log("Target from store is invalid! => new game");
                    target = get_WordOfTheDay_FromServer(getTodaysTimestamp());
                    localStorage.setItem("word-of-the-day-target", rot13(target));
                    resetGame();
                }
                else { // Target from store is valid
                    loadGame();   
                }
            }
            else { // Stored timestamp is not from today => new day, new game
                console.log("New Day, new game");
                timestamp = getTodaysTimestamp();
                target = get_WordOfTheDay_FromServer(getTodaysTimestamp());
                localStorage.setItem("word-of-the-day-target", rot13(target));
                localStorage.setItem("word-of-the-day-timestamp", timestamp);
                resetGame();
            }
        }
    }


    document.getElementById('duden-link1').href = "https://www.duden.de/suchen/dudenonline/" + target;
    document.getElementById('duden-link2').href = "https://www.duden.de/suchen/dudenonline/" + target;

    document.getElementById("credit-points1").innerText = creditPoints;
    document.getElementById("credit-points2").innerText = creditPoints;
    document.getElementById("credit-points3").innerText = creditPoints;

    if (gameMode == "word-of-the-day") {
        document.getElementById("settings-menu-current-game-mode").innerText = "Wort-des-Tages";
        document.getElementById("settings-menu-start-random").classList.remove("hide");
        document.getElementById("settings-menu-start-wotd").classList.add("hide");
    }
    else { // Random
        document.getElementById("settings-menu-current-game-mode").innerText = "Zufälliges Wort";
        document.getElementById("settings-menu-start-random").classList.add("hide");
        document.getElementById("settings-menu-start-wotd").classList.remove("hide");
    }

    if (localStorage.getItem("cheat") == 1) {
        console.log("Target: " + target);
    }
    
    document.getElementById("end-container").classList.add("hide");

    storeProgess();

    selectColorMode();

    /* Debug */
    document.getElementById("debug-words-count").innerText = targets.length;
    document.getElementById("debug-target").innerText = rot13(target);
//     document.getElementById("debug-wordlist-index").innerText = getIndex(timestamp);
//     document.getElementById("debug-wordlist-index").innerText = "";
    document.getElementById("debug-timestamp").innerText = timestamp;
    document.getElementById("debug-user-agent").innerText = navigator.userAgent;

//     document.getElementById("debug-words-script").innerText = getCacheId("script", "words.js");
//     document.getElementById("footer").innerText = "main: " + getCacheId("script", "main.js") + ", words: " + getCacheId("script", "words.js") + ", index: " + getIndex(timestamp) + ", ts: " + timestamp;
//     document.getElementById("footer").innerText = "main: " + getCacheId("script", "main.js") + ", words: " + getCacheId("script", "words.js") + ", ts: " + timestamp;
//     document.getElementById("footer").innerText = "main: " + getCacheId("script", "main.js") + ", words: " + getCacheId("script", "words.js");
}


function get_WordOfTheDay_FromServer(timestamp) {
    console.log("Fetching word of the day from server (timestamp: " + timestamp + ")");
    var request = new XMLHttpRequest();
    request.open('GET', "https://wordle-deutsch.ch/get-word-of-the-day.php?timestamp=" + timestamp, false);  // `false` makes the request synchronous
    request.send(null);

    // TODO use async

    if (request.status === 200) {
        let data = JSON.parse(request.responseText);
        
        return rot13(data["word"]);
    }
    else {
        console.log("An error occured!");
    }
}


function resetCellsAndKeyboard() {
    console.log("resetCellsAndKeyboard");

    for (const rowEl of board.children) {
        for (const cell of rowEl.children) {
            cell.classList.remove("filled");
            cell.classList.remove("incorrect");
            cell.classList.remove("close");
            cell.classList.remove("correct");
            cell.innerText = "";
        }
    }
    for (const keyID in keyboardEls) {
        keyboardEls[keyID].classList.remove("incorrect");
        keyboardEls[keyID].classList.remove("close");
        keyboardEls[keyID].classList.remove("correct");
    }
}


function resetGame() {
    console.log("resetGame");
}


function loadGame() {
    console.log("loadGame");

//     console.log("Loading words from " + row + " rows...");

    for (let r = 0; r < config.maxGuesses; r++) {
        let rowTextFromStore = localStorage.getItem(gameMode + "_" + "row" + r);
        if (rowTextFromStore == null) {
            rowTextFromStore = "";
        }
      
        console.log("line for row " + r + " loaded from store: '" + rowTextFromStore + "', len: " + rowTextFromStore.length);
        if (rowTextFromStore != null && rowTextFromStore != "") {
            guess = rowTextFromStore.toLowerCase();
            let scores = scoreGuess(target, guess);
            for (let c = 0; c < config.wordLength; c++) {
                if( c < rowTextFromStore.length) {
                    let cell = board.children[r].children[c];
                    cell.innerText = rowTextFromStore[c];
                    cell.classList.add("filled");

                    if ((r < row) && (rowTextFromStore.length == config.wordLength)) {
                        cell.classList.add(scores[c]);
                        keyboardEls[guess[c]].classList.add(scores[c]);
                    }
                }
            }

            if ((r < localStorage.getItem(gameMode + "_" + "row")) && (rowTextFromStore.length == config.wordLength)) {
                evaluate();
                processWinLose();
            }
            else {
                console.log("row incomplete => break");
                break;
            }
        }
        else {
            console.log("line for row " + r + " loaded from store null or empty => break");
            break;
        }
    }
    
    row = getLocalStorageInt(gameMode + "_" + "row");
//     console.log("loadGame, row: " + row);
}


function storeProgess() {
    for (let r = 0; r < config.maxGuesses; r++) {
        let line = "";
        for (let c = 0; c < config.wordLength; c++) {
            let cell = board.children[r].children[c];
            line = line + cell.innerText;
        }
        localStorage.setItem(gameMode + "_" + "row" + r, line);
    }
    localStorage.setItem(gameMode + "_" + "row", row);
//     localStorage.setItem("guess", guess);
}


let ctx = null;

function updateShownStats() {
    let statsWins = [];
    let statsWinsTotal = 0;
    for (let r = 0; r < config.maxGuesses; r++) {
        let winRow = getLocalStorageInt("win-row" + r);
        statsWins.push(winRow);
        statsWinsTotal = statsWinsTotal + winRow;
    }
    
    
    let statsLoses = getLocalStorageInt("loses");
    console.log("Wins: " + statsWinsTotal + " (" + statsWins + "), loses: " + statsLoses);

    document.getElementById("wins").innerText = statsWinsTotal;
    let percentage = 0
    if (statsWinsTotal + statsLoses > 0) {
        percentage = statsWinsTotal / (statsWinsTotal + statsLoses) * 100;
    }
    document.getElementById("wins-percent").innerText = Math.round(percentage, 1);
    document.getElementById("games-total").innerText = statsWinsTotal + statsLoses;
    
    let statsChart = Chart.getChart("statsChart"); // <canvas> id
    if (statsChart != undefined) {
        statsChart.destroy();
    }

    let statsYAxis = Array.from({length: config.maxGuesses}, (_, i) => i + 1);

    ctx = document.getElementById('statsChart').getContext('2d');        
    statsChart = new Chart(ctx, {
        type: 'bar',
        options: {
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        precision: 0,
                    },
                    suggestedMax: Math.ceil(statsWins.reduce(function(a, b) { return Math.max(a, b); }) * 1.1),
                }
            }
        },
        data: {
            labels: statsYAxis,
            datasets: [{
                data: statsWins,                
                borderWidth: 1,
                backgroundColor: '#6abe00'
            }]
        }
    });
}


function evaluate() {
//     console.log("evaluate, target: " + target, ", guess: " + guess, ", row: ", row);
    scoring = true;
    setTimeout(() => scoring = false, animTime * 4);
    let scores = scoreGuess(target, guess);

    /* Show animation */
    for (let i = 0; i < config.wordLength; i++) {
        const savedRow = row, savedGuess = guess;
        setTimeout(() => {
            board.children[savedRow].children[i].classList.add(scores[i]);
            keyboardEls[savedGuess[i]].classList.add(scores[i]);
        }, animTime * i);
    }

    row++;

//     console.log(row, config.maxGuesses);
    if (scores.every(s => s == "correct")) { // Win
        console.log("Game won");
        win = true;
    }
    else if (row == config.maxGuesses) { // Lose
        console.log("Game lost");
        lose = true;
    }
    else {
        console.log("Game incomplete", );
        guess = "";
    }
}



function processWinLose() {
    if (win == true) { // Game got won
        let newCreditPoints = 0;
        if (gameMode == "word-of-the-day") { /* Word of the day */
            document.getElementById("won-word-of-the-day1").classList.remove("hide");
            document.getElementById("won-random-word1").classList.add("hide");
            document.getElementById("footer-word-of-the-day").classList.remove("hide");
            document.getElementById("footer-random-word").classList.add("hide");
            document.getElementById("show-statistics").classList.remove("hide");

            if (timestamp != window.localStorage.getItem("win-timestamp")) { // Last time we won was not today
                let winRow = getLocalStorageInt("win-row" + row);
                newCreditPoints = config.maxGuesses - row + 1;

                /* Update Statistics */
                window.localStorage.setItem("win-row" + (row-1), winRow + 1);
                window.localStorage.setItem("win-timestamp", timestamp);
                updateShownStats();

                console.log("old Credit Points: " + creditPoints)
                creditPoints += newCreditPoints
                console.log("New Credit Points: " + creditPoints)

                window.localStorage.setItem("credit-points", creditPoints);

                document.getElementById("credit-points1").innerText = creditPoints;
                document.getElementById("credit-points2").innerText = creditPoints;
                document.getElementById("credit-points3").innerText = creditPoints;
                document.getElementById("share").classList.remove("hide");
                document.getElementById("telegram").classList.remove("hide");
            }

            document.getElementById("credit-points-win").innerText = newCreditPoints;
        }
        else { /* Random Word */
            document.getElementById("won-random-word1").classList.remove("hide");
            document.getElementById("won-word-of-the-day1").classList.add("hide");
            document.getElementById("footer-random-word").classList.remove("hide");
            document.getElementById("footer-word-of-the-day").classList.add("hide");
            document.getElementById("show-statistics").classList.add("hide");
        }

        document.getElementById("word-win").innerText = target.toUpperCase();
        document.getElementById("letter-map").innerText = createLetterMap();

        setTimeout(() => {
            document.getElementById("end-container").classList.remove("hide");
            document.getElementById("win").classList.remove("hide");
            document.getElementById("lose").classList.add("hide");
            timeToNextWord();
            setInterval(timeToNextWord, 1000);
        }, animTime * 5)
    }
    else if (lose == true) { // Game got lost
        document.getElementById("share").classList.add("hide");
        document.getElementById("telegram").classList.add("hide");

        if (gameMode == "word-of-the-day") { /* Word of the day */
            document.getElementById("won-word-of-the-day1").classList.add("hide");
            document.getElementById("won-random-word1").classList.add("hide");
            document.getElementById("footer-word-of-the-day").classList.remove("hide");
            document.getElementById("footer-random-word").classList.add("hide");
            document.getElementById("show-statistics").classList.remove("hide");

            if (timestamp != window.localStorage.getItem("lose-timestamp")) { // Last time we lost was not today
                window.localStorage.setItem("loses", getLocalStorageInt("loses") + 1);
                window.localStorage.setItem("lose-timestamp", timestamp);
            }
            updateShownStats();}
        else { /* Random Word */
            document.getElementById("won-random-word1").classList.add("hide");
            document.getElementById("won-word-of-the-day1").classList.add("hide");
            document.getElementById("footer-random-word").classList.remove("hide");
            document.getElementById("footer-word-of-the-day").classList.add("hide");
            document.getElementById("show-statistics").classList.add("hide");
        }

        document.getElementById("word-lose").innerText = target.toUpperCase();
        document.getElementById("letter-map").innerText = createLetterMap();

        setTimeout(() => {
            document.getElementById("end-container").classList.remove("hide");
            document.getElementById("win").classList.add("hide");
            document.getElementById("lose").classList.remove("hide");
            timeToNextWord();
            setInterval(timeToNextWord, 1000);
        }, animTime * 5)
    }
    else { // Game not complete yet
        // Nothing to do
    }
}


function getCacheId(tag, file) {
    var scripts = document.getElementsByTagName(tag);
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes(file)) {
            return scripts[i].src.split(/[?cacheid=]+/).pop();
        }
    }
}


function timeToNextWord() {
    var midnight = new Date();
    midnight.setHours( 24 );
    midnight.setMinutes( 0 );
    midnight.setSeconds( 0 );
    midnight.setMilliseconds( 0 );
    
    let secondsUntilMidnight = (midnight - new Date()) / 1000;
    
    let hours = Math.floor(secondsUntilMidnight / 3600);
    let minutes = Math.floor(secondsUntilMidnight / 60 - hours * 60);
    let seconds = Math.floor(secondsUntilMidnight - 60 * minutes - 3600 * hours, 0);
    
    if (hours == 0 && minutes == 0 && seconds == 0) {
        console.log("New Day");
        location.reload(); 
    }
    
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    
    document.getElementById("next-word").innerText = hours + ":" + minutes + ":" + seconds;
}


document.addEventListener("keydown", e => {
    let key = e.key;
//     console.log("Key: " + key);
//     console.log("Guess: " + guess + ", row: " + row);
    if (guess == undefined) return; // Prevent error on pressing enter on questionBox
    if (!infoContainer.classList.contains("hide") || row >= config.maxGuesses || win || scoring) return;
    if (!changelogContainer.classList.contains("hide") || row >= config.maxGuesses || win || scoring) return;
    if (!statsContainer.classList.contains("hide") || row >= config.maxGuesses || win || scoring) return;
    if (key == "Backspace" && guess.length > 0) {
        guess = guess.slice(0, -1);
        board.children[row].children[guess.length].classList.remove("filled");
        board.children[row].children[guess.length].innerText = "";
        storeProgess();
        return;
    }
    if (key == "Enter") {
        if (guess.length != config.wordLength || !(targets.includes(guess) || others.includes(guess))) {
            board.children[row].classList.add("shake");
            setTimeout(() => board.children[row].classList.remove("shake"), 400);
            return;
        }
        evaluate();
        processWinLose();
        storeProgess();
        return;
    }

    /* The desktop chrome somehow gives odd values for the Umlaute keys when the real keyboard is used */
    if (key == '\\') {
        key = 'Ä';
    }
    else if (key == '\'') {
        key = 'Ö';
    }
    else if (key == ';') {
        key = 'Ü';
    }

    if (!(config.keyboardValidation[config.language]).test(key) || guess.length >= config.wordLength) return;
    let cell = board.children[row].children[guess.length];
    cell.innerText = key.toUpperCase();
    cell.classList.add("filled");
    guess += key.toLowerCase();

    storeProgess();
});


// Automatically close all the others <details> tags after opening anothers <details> tag
// Kudos: https://stackoverflow.com/a/36994802/8369030
const details = document.querySelectorAll("details");

// Add the onclick listeners.
details.forEach((targetDetail) => {
  targetDetail.addEventListener("click", () => {
    // Close all the details that are not targetDetail.
    details.forEach((detail) => {
      if (detail !== targetDetail) {
        detail.removeAttribute("open");
      }
    });
  });
});



function main() {
    if (targets == undefined) {
//         console.log("target-words not loaded yet");
        return;
    }
    else {
//         console.log("target-words loaded");
    }

    if (others == undefined) {
//         console.log("other-words not loaded yet");
        return;
    }
    else {
//         console.log("other-words loaded");
    }

//     console.log(targets);
//     console.log(others);
    initGame();
    updateShownStats();
}
