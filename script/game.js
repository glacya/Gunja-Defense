/* 
    game.js - 2023.10.03

    Main file of the game.
*/

const [winX, winY] = [1600, 600];
const [fullX, fullY] = [window.innerWidth, window.innerHeight];
const [pauseX, pauseY] = [fullX / 8, fullY / 8 + 60];
const [pauseW, pauseH] = [fullX * 3 / 4, fullY * 3 / 4 - 60];
const [uix, uiy] = [(fullX - winX) / 2, (fullY - winY) / 2];

const patchBox = document.querySelector("#patchNoteBox");
const canvasDynamic = document.querySelector("#canvasDynamic");
const canvasDynamicLow = document.querySelector("#canvasDynamicLow");
const canvasDynamicHigh = document.querySelector("#canvasDynamicHigh");
const canvasDynamicBoss = document.querySelector("#canvasDynamicBoss");
const canvasUIStatic = document.querySelector("#canvasUIStatic");
const canvasUIDynamic = document.querySelector("#canvasUIDynamic");
const canvasCursor = document.querySelector("#canvasCursor");
const canvasPauseStatic = document.querySelector("#canvasPauseStatic");
const canvasPauseDynamic = document.querySelector("#canvasPauseDynamic");
const canvasPauseFull = document.querySelector("#canvasPauseFull");
const canvasMenu = document.querySelector("#canvasMenu");

const ctxd = canvasDynamic.getContext("2d");
const ctxdl = canvasDynamicLow.getContext("2d");
const ctxdb = canvasDynamicBoss.getContext("2d");
const ctxdh = canvasDynamicHigh.getContext("2d");
const ctxuis = canvasUIStatic.getContext("2d");
const ctxuid = canvasUIDynamic.getContext("2d");
const ctxcur = canvasCursor.getContext("2d");
const ctxps = canvasPauseStatic.getContext("2d");
const ctxpd = canvasPauseDynamic.getContext("2d");
const ctxpf = canvasPauseFull.getContext("2d");
const ctxm = canvasMenu.getContext("2d");

const gameVersion = "v0.7.1 beta: 2024-04-07";
const gameTitle = document.querySelector("title").text;

// Enum for menu screen kind.
const MENU = 0;
const DEAD = 1;
const VICT = 2;
const RECO = 3;
const CRED = 4;

// Enum for game difficulties.
const EASY = 10;
const NORMAL = 11;
const HARD = 12;

// Global variables for game environment.
const fps = 60;
let currentRound = 1;
let maxRound = 50;

let inMenu = true;
let inRound = false;
let inPause = false;
let menuKind = MENU;
let gameDifficulty = NORMAL;
let selectingDifficulty = false;

let globalTimer = 0;
let globalGameTimer = 0;
let deadTimer = 1e18;
let victoryTimer = 1e18;

let playerHp = 100;
let playerGold = 600;

let goldBlocked = false;
let selectedTowerId = "none";
let selectedDeployingTowerKind = "none";

// Global variables for scores.
let totalGeneratedGold = 0;
let totalTowersSold = 0;
let totalTowersPlaced = 0;
let totalActivePlayed = 0;
let totalTowerUpgrades = 0;
let totalTowerMaxUpgrades = 0;
let reachedTranscendent = false;

// Changes player's gold by delta.
function changePlayerGold(delta) {
    playerGold += delta;
    drawnStatics = false;

    playerGold = max(playerGold, 0);
}

// Changes player's HP by delta.
function changePlayerHp(delta) {
    playerHp += delta;
    playerHp = max(playerHp, 0);
}

// Checks if player's HP is less than or equal to 0.
function checkPlayerDeath() {
    if (!inMenu && playerHp <= 0) {
        // If dead, re-initialize important global variables.
        scoreCache = null;
        inMenu = true;
        menuKind = DEAD;
        inRound = false;
        inPause = false;
        deadTimer = globalTimer;
        clickBlock = true;

        enemies.clear();
        towers.clear();
        visualEffects.clear();
        delayedWorks.clear();
        projs.clear();

        selectingDifficulty = false;

        // Switch the screen.
        const vse = new VisualEffect("gameend", null, fps / 2, null, null);
        visualEffects.set(vse.id, vse);
    }
}

// Processes game elements.
function processInGame() {
    spawnEnemy();
    processDelayedWorks();
    processEnemies();
    processTowers();
    processProjectiles();
}

// Core routine of the game. Called every frame.
function loopGame() {
    if (inMenu) {
        drawVisualEffects();
        processVisualEffects();
    }
    else if (inPause) {
        drawCursor();
        drawPause();
    }
    else {
        clearInGameCanvas();

        if (inRound) processInGame();

        processVisualEffects();
        drawCursor();
        drawInGame();
    }
}

// Main loop of the game. Called every frame.
function mainLoop() {
    ctxcur.clearRect(0, 0, fullX, fullY);
    loopGame();

    if (!inPause) {
        globalTimer++;

        if (inRound) {
            globalGameTimer++;
            endRound();
        }
    }

    checkPlayerDeath();
    requestAnimationFrame(mainLoop);
}

// Initialize global variables.
function initGlobals() {
    inMenu = false;
    inRound = false;
    inPause = false;

    globalTimer = 0;
    globalGameTimer = 0;

    playerHp = diffBranch(200, 150, 100);
    playerGold = diffBranch(650, 600, 550);

    goldBlocked = false;
    selectedTowerId = "none";
    selectedDeployingTowerKind = "none";

    drawnStatics = false;
    aimingCursor = false;
    
    lightOff = false;
    bossEnemyId = null;
    bossAlpha = 0.0;

    enemies.clear();
    towers.clear();
    visualEffects.clear();
    delayedWorks.clear();
    projs.clear();
    portals.clear();
    betrayalMarks.clear();

    enemyId = 100000100;
    enemyHeadId = 0;
    towerId = 8;
    projId = 0;
    steId = 0;
    vseId = 0;
    delayedId = 0;
    roundBeginTimer = 0;

    temporarySelection = false;
    placeAvailable = true;

    darkenAlpha = 0.0;
    isBlizzardOn = false;

    scoreCache = null;
    totalGeneratedGold = 0;
    totalTowersSold = 0;
    totalTowersPlaced = 0;
    totalActivePlayed = 0;
    totalTowerUpgrades = 0;
    totalTowerMaxUpgrades = 0;
    reachedTranscendent = false;

    initEnemyData();
}

// Initializes new game, with difficulty of `diffi`.
function initNewGame(diffi) {
    gameDifficulty = diffi;
    removeProgress("autosave");
    removeProgress("checkpoint");
    initGlobals();
    setRoundDescription();

    const vse = new VisualEffect("gamestart", null, fps / 2, null, null);
    visualEffects.set(vse.id, vse);

    const dwork = new DelayedWork(fps / 2, 0, () => {menuAlpha = 0;}, []);
    delayedWorks.set(dwork.id, dwork);

    setRound(1);
}

// Starts the game.
function init() {
    setDOMAttributes();
    setEventListeners();
    initStatusEffectNames();
    initTowers();
    selectingDifficulty = false;

    enterMenu();
    console.log("Hello, GUNJA!");

    mainLoop();
}

init();