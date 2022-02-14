// ==== CONFIG ====
import config from './config.js?cacheid=2';

// ==== WORD LIST ====
import words from './words.js?cacheid=2';


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


// ==== GAME BOARD ====
const board = document.getElementById("board");
for (let r = 0; r < config.maxGuesses; r++) {
    const row = document.createElement("div");
    row.classList.add("row");
    board.appendChild(row);
    for (let c = 0; c < config.wordLength; c++) {
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
const statsContainer = document.getElementById("stats-container");
const endContainer = document.getElementById("end-container");
const infoContainer = document.getElementById("info-container");
const updateInfoContainer = document.getElementById("update-info-container");


let lastUpdateNote = "2022-02-12"; // Set to today on news updates
if (window.localStorage.getItem("read-update-note") != lastUpdateNote && window.localStorage.getItem("read-help")) { // Show updates, but only if the help does not get shown
    updateInfoContainer.classList.remove("hide");
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

document.getElementById("dismiss-stats").addEventListener("click", ev => {
    ev.target.parentElement.parentElement.classList.add("hide");
})

document.getElementById("share").addEventListener("click", ev => {
    let letterMap = createLetterMap();
    
    const event = new Date(todaysTimestamp * 1000);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    let dateFormated = event.toLocaleDateString('de-CH', options);
    let text = "Ich habe das heutige Wort auf https://wordle-deutsch.ch mit nur " + row + " Versuchen erraten!\r\n" + dateFormated + "\r\n" + letterMap;

    var t = document.createElement("textarea");
    t.textContent = text, document.body.appendChild(t), t.select(), document.execCommand("copy"), document.body.removeChild(t)
    
    document.getElementById("share").innerText = "In die Zwischenablage kopiert";
})

document.getElementById("back-to-word-of-the-day-button").addEventListener("click", ev => {
    window.location.href = "index.htm";
})

// ==== TOOLBAR BUTTONS ====
document.getElementById("show-stats").addEventListener("click", ev => {
    statsContainer.classList.remove("hide");
    ev.target.blur();
});

document.getElementById("show-stats2").addEventListener("click", ev => {
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

document.getElementById("dismiss-stats").addEventListener("click", ev => {
    statsContainer.classList.add("hide");
    ev.target.blur();
});

document.getElementById("dismiss-info").addEventListener("click", ev => {
    infoContainer.classList.add("hide");
    ev.target.blur();
});

document.getElementById("dismiss-update-info").addEventListener("click", ev => {
    updateInfoContainer.classList.add("hide");
    ev.target.blur();
});

// ==== OPTIONS ====
let animTime = 300;
let todaysTimestamp;
let creditPoints = 0;

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
let row, guess, win, target = "";
let scoring = false;
let useRandomWord = false

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
        g = localStorage.getItem("row" + r);
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
    let timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()/1000; 
    return timestamp;
}


function getTomorowsTimestamp() {
    return getTodaysTimestamp() + 60*60*24;
}


function getIndex(timestamp) {
    let rand = mulberry32(timestamp);
    let index = Math.floor(rand * words.targets.length);
//     console.log("Todays Index: " + index);
    return index;
}


// Kudos: https://hellodevworld.com/365-days-of-coding/rot13-cipher-javascript-solution
function rot13(message) {
    return message.replace(/[a-z]/gi, letter => String.fromCharCode(letter.charCodeAt(0) + (letter.toLowerCase() <= 'm' ? 13 : -13)));
}



function initWordOfToday() {
    console.log("Use word of today");
//         window.location.href = "index.htm";
    todaysTimestamp = getTodaysTimestamp();
    let timestampFromStore = localStorage.getItem("timestamp");
    let targetFromStore = localStorage.getItem("target");
    if ((targetFromStore != "") && (targetFromStore != null) && 
        (timestampFromStore != "") && (timestampFromStore != null)) {
        if (todaysTimestamp != timestampFromStore) {
            console.log("New Day, new game");
            resetGame(todaysTimestamp);
        }
        else {
            console.log("Timestamp match, keep target");
            loadGame(rot13(targetFromStore));
        }
    }
    else {
        console.log("No timestamp+target in store");
        resetGame(todaysTimestamp);
    }
}


function initRandomWord() {
    console.log("Use random word");
    todaysTimestamp = Math.ceil(Math.random() * 2e10);
    creditPoints -= 1;
    window.localStorage.setItem("credit-points", creditPoints);
    document.getElementById("credit-points").innerText = creditPoints;
    useRandomWord = true;

    resetGame(todaysTimestamp);

    document.body.style.backgroundColor = "#0064ab"; // Change background color
    document.getElementById("back-to-word-of-the-day-button").classList.remove("hide");
}


function initWordOfTomorrow() {
    console.log("Use word of tomorrow");
    todaysTimestamp = getTomorowsTimestamp();
    resetGame(todaysTimestamp);
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


function initGame() {
    console.log("initGame");
//     let timestampFromStore = localStorage.getItem("timestamp");
//     let targetFromStore = localStorage.getItem("target");
    todaysTimestamp = getTodaysTimestamp();
    
    creditPoints = getLocalStorageInt("credit-points");
    console.log("Credit Points: " + creditPoints);
    document.getElementById("credit-points").innerText = creditPoints;
    document.getElementById("back-to-word-of-the-day-button").classList.add("hide");
    let selection = "today";

    // Debug: Append "?random" to the URL to get a random word on each reload
    if (window.location.href.includes("random")) {
        if (creditPoints > 0) {
            questionBox("Willst Du ein zufälliges Wort lösen?<br>Es kostet dich <strong>1 Punkt(e)</strong>.<br>Du hast momentan <strong>" + creditPoints + 
                        " Punkt(e)</strong>.").then(function (answer) {
                console.log("Answer: " + answer);
                if (answer == "Ja") {
                    initRandomWord();
                }
                else {
                    window.location.href = "index.htm"; // reload page with out "random" parameter
                }
            });
        }
        else {
            alertBox("Du hast keine Punkte verfügbar, gewinne zuerst ein Wort-des-Tages um Punkte zu kriegen!").then(function () {
                window.location.href = "index.htm"; // reload page with out "random" parameter
            });
        }
    }    
    // Debug: Append "?tomorrow" to the URL to get the word of tomorrow
    else if (window.location.href.includes("tomorrow")) { // Word of tomorrow
        initWordOfTomorrow();
    }
    else { // Today
        initWordOfToday();
    }


    /* Debug */
    document.getElementById("debug-words-count").innerText = words.targets.length;
    document.getElementById("debug-target").innerText = rot13(target);
    document.getElementById("debug-wordlist-index").innerText = getIndex(todaysTimestamp);
    document.getElementById("debug-timestamp").innerText = todaysTimestamp;
    document.getElementById("debug-user-agent").innerText = navigator.userAgent;

    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes("words.js")) {
            document.getElementById("debug-words-script").innerText = scripts[i].src.split(/[?cacheid=]+/).pop();
        }
    }
}


function resetGame(timestamp) {
    console.log("resetGame");
    row = 0;
    guess = "";
    win = false;
    target = words.targets[getIndex(timestamp)];
//     console.log("New target: " + target + "(" + timestamp + ")");

    document.getElementById('duden-link1').href = "https://www.duden.de/suchen/dudenonline/" + target;
    document.getElementById('duden-link2').href = "https://www.duden.de/suchen/dudenonline/" + target;

    if (window.location.href.includes("cheat")) {
        console.log("Target: " + target);
    }

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
    document.getElementById("end-container").classList.add("hide");

    localStorage.setItem("target", rot13(target));
    localStorage.setItem("timestamp", timestamp);
    storeProgess();
}


function loadGame(loadedTarget) {
    console.log("loadGame");
    row = 0;
    guess = "";
    win = false;

    target = loadedTarget;
//     console.log("Loaded target: " + target);

    document.getElementById('duden-link1').href = "https://www.duden.de/suchen/dudenonline/" + target;
    document.getElementById('duden-link2').href = "https://www.duden.de/suchen/dudenonline/" + target;

    if (window.location.href.includes("cheat")) {
        console.log("Target: " + target);
    }

    for (let r = 0; r < config.maxGuesses; r++) {
        if (localStorage.getItem("row" + r) != null && localStorage.getItem("row" + r) != "") {
            guess = localStorage.getItem("row" + r).toLowerCase();
            let scores = scoreGuess(target, guess);
            for (let c = 0; c < config.wordLength; c++) {
                if( c < localStorage.getItem("row" + r).length) {
                    let cell = board.children[r].children[c];
                    cell.innerText = localStorage.getItem("row" + r)[c];
                    cell.classList.add("filled");

                    if ((r < row) && 
                        (localStorage.getItem("row" + r).length == config.wordLength)) {
                        cell.classList.add(scores[c]);
                        keyboardEls[guess[c]].classList.add(scores[c]);
                    }
                }
            }

            if ((r < localStorage.getItem("row")) && 
                (localStorage.getItem("row" + r).length == config.wordLength)) {
                evaluate();
            }
        }
    }
    row = localStorage.getItem("row");
}


function storeProgess() {
    for (let r = 0; r < config.maxGuesses; r++) {
        let line = "";
        for (let c = 0; c < config.wordLength; c++) {
            let cell = board.children[r].children[c];
            line = line + cell.innerText;
        }
        localStorage.setItem('row' + r, line);
    }
    localStorage.setItem('row', row);
    localStorage.setItem('guess', guess);
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
//     console.log("target: " + target, ", guess: " + guess, "row: ", row);
    scoring = true;
    setTimeout(() => scoring = false, animTime * 4);
    let scores = scoreGuess(target, guess);

    for (let i = 0; i < config.wordLength; i++) {
        const savedRow = row, savedGuess = guess;
        setTimeout(() => {
            board.children[savedRow].children[i].classList.add(scores[i]);
            keyboardEls[savedGuess[i]].classList.add(scores[i]);
        }, animTime * i);
    }
    if (scores.every(s => s == "correct")) { // Win
        win = true;
        let newCreditPoints = 0;

        if (!useRandomWord) { /* Word of the day */
            document.getElementById("won-word-of-the-day1").classList.remove("hide");
            document.getElementById("won-random-word1").classList.add("hide");
            document.getElementById("footer-word-of-the-day").classList.remove("hide");
            document.getElementById("footer-random-word").classList.add("hide");

            if (todaysTimestamp != window.localStorage.getItem("win-timestamp")) { // Last time we won was not today
                let winRow = getLocalStorageInt("win-row" + row);
                newCreditPoints = config.maxGuesses - row;

                /* Update Statistics */
                window.localStorage.setItem("win-row" + row, winRow + 1);
                window.localStorage.setItem("win-timestamp", todaysTimestamp);
                updateShownStats();

                console.log("old Credit Points: " + creditPoints)
                creditPoints += newCreditPoints
                console.log("New Credit Points: " + creditPoints)

                window.localStorage.setItem("credit-points", creditPoints);

                document.getElementById("credit-points").innerText = creditPoints;
                document.getElementById("share").classList.remove("hide");
                document.getElementById("telegram").classList.remove("hide");
            }
            else { // we won it already today
                document.getElementById("share").classList.add("hide");
                document.getElementById("telegram").classList.add("hide");
            }
            document.getElementById("credit-points-win").innerText = newCreditPoints;
        }
        else { /* Random Word */
            document.getElementById("won-random-word1").classList.remove("hide");
            document.getElementById("won-word-of-the-day1").classList.add("hide");
            document.getElementById("footer-random-word").classList.remove("hide");
            document.getElementById("footer-word-of-the-day").classList.add("hide");
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

    row++;
    guess = "";

    if (row >= config.maxGuesses && !win) { // Lose
        document.getElementById("share").classList.add("hide");
        document.getElementById("telegram").classList.add("hide");

        if (!useRandomWord) { /* Word of the day */
            document.getElementById("won-word-of-the-day1").classList.add("hide");
            document.getElementById("won-random-word1").classList.add("hide");
            document.getElementById("footer-word-of-the-day").classList.remove("hide");
            document.getElementById("footer-random-word").classList.add("hide");

            if (todaysTimestamp != window.localStorage.getItem("lose-timestamp")) { // Last time we lost was not today
                window.localStorage.setItem("loses", getLocalStorageInt("loses") + 1);
                window.localStorage.setItem("lose-timestamp", todaysTimestamp);
            }
            updateShownStats();}
        else { /* Random Word */
            document.getElementById("won-random-word1").classList.add("hide");
            document.getElementById("won-word-of-the-day1").classList.add("hide");
            document.getElementById("footer-random-word").classList.remove("hide");
            document.getElementById("footer-word-of-the-day").classList.add("hide");
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
//     console.log("Guess: " + guess);
    if (guess == undefined) return; // Prevent error on pressing enter on questionBox
    if (!infoContainer.classList.contains("hide") || row >= config.maxGuesses || win || scoring) return;
    if (!updateInfoContainer.classList.contains("hide") || row >= config.maxGuesses || win || scoring) return;
    if (!statsContainer.classList.contains("hide") || row >= config.maxGuesses || win || scoring) return;
    if (key == "Backspace" && guess.length > 0) {
        guess = guess.slice(0, -1);
        board.children[row].children[guess.length].classList.remove("filled");
        board.children[row].children[guess.length].innerText = "";
        storeProgess();
        return;
    }
    if (key == "Enter") {
        if (guess.length != config.wordLength || !(words.targets.includes(guess) || words.other.includes(guess))) {
            board.children[row].classList.add("shake");
            setTimeout(() => board.children[row].classList.remove("shake"), 400);
            return;
        }
        evaluate();
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


// Automatically close all the other <details> tags after opening another <details> tag
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


window.addEventListener("orientationchange", function(event) {
    setTimeout(function() { checkPortraitMode(); }, 2000);
});


if(window.innerHeight < window.innerWidth) {
    alertBox("Das Spiel funktioniert besser im Portrait-Modus!").then(function () {
        initGame();
        updateShownStats();
    });
}
else {
    initGame();
    updateShownStats(); 
}
