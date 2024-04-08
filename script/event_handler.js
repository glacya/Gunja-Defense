/*
    event_handler.js - 2024.01.03

    Implementation of IO processing.
*/

let keyPressed = new Map();
let mousePosition = new Vector2(-1000, -1000);
let mouseUiPosition = new Vector2(-1000, -1000);
let temporarySelection = false;
let placeAvailable = true;
let pauseScrollHold = false;
let clickBlock = true;

// onClick handler, on credit screen
function inCreditClick(e) {
    const mPos = new Vector2(e.x, e.y);
    const lt = new Vector2(28, 28);
    const size = new Vector2(60, 60);

    if (inRange(mPos, lt, size)) {
        menuKind = MENU;
        selectingDifficulty = false;
        enterMenu();
        patchBox.classList.toggle("hidden");
    }
}

// onKeyDown handler, on credit screen
function inCreditKeyDown(e) {
    switch (e.code) {
        case "Escape": {
            menuKind = MENU;
            selectingDifficulty = false;
            enterMenu();
            patchBox.classList.toggle("hidden");
            break;
        }
    }
}

// onKeyDown handler, on record screen
function inRecordKeyDown(e) {
    const recordPerPage = 20;
    const totalPages = floor((playerRecords.length - 1) / recordPerPage) + 1;

    switch (e.code) {
        case "ArrowLeft": {
            recordPage = max(0, recordPage - 1);
            break;
        }
        case "ArrowRight": {
            recordPage = min(totalPages - 1, recordPage + 1);
            break;
        }
        case "Escape": {
            menuKind = MENU;
            selectingDifficulty = false;
            enterMenu();
            break;
        }
    }
}

// onClick handler, on record screen
function inRecordClick(e) {
    const mPos = new Vector2(e.x, e.y);
    const lt = new Vector2(28, 28);
    const size = new Vector2(60, 60);

    if (inRange(mPos, lt, size)) {
        menuKind = MENU;
        selectingDifficulty = false;
        enterMenu();
        return;
    }

    const recordPerPage = 20;
    const totalPages = floor((playerRecords.length - 1) / recordPerPage) + 1;

    if (totalPages > 1) {
        const lx = fullX * 0.4;
        const rx = fullX * 0.6;
        const tsize = 32;
        const y = fullY * 0.95;
        const la = new Vector2(lx - tsize, y - tsize / 2);
        const ra = new Vector2(rx, y - tsize / 2);
        const psize = new Vector2(tsize, tsize);

        if (inRange(mPos, la, psize)) {
            recordPage = max(0, recordPage - 1);
        }
        else if (inRange(mPos, ra, psize)) {
            recordPage = min(totalPages - 1, recordPage + 1);
        }
    }
}

// onClick handler, on victory screen
function inVictoryClick(e) {
    const mPos = new Vector2(e.x, e.y);
    const bcent = new Vector2(fullX * 0.5 - 120, fullY * 0.9 - 30);
    const bSize = new Vector2(240, 60);

    if (inRange(mPos, bcent, bSize)) {
        menuKind = MENU;
        saveRecord();
        selectingDifficulty = false;
        enterMenu();
    }
}

// onClick handler, on dead screen
function inDeadClick(e) {
    const mPos = new Vector2(e.x, e.y);
    const y = fullY * 0.9 - 30;
    const bleft = new Vector2(fullX * 0.4 - 120, y);
    const bright = new Vector2(fullX * 0.6 - 120, y);
    const bcent = new Vector2(fullX * 0.5 - 120, y);
    const bc1 = new Vector2(fullX * 0.3 - 120, y);
    const bc2 = new Vector2(fullX * 0.7 - 120, y);
    const bSize = new Vector2(240, 60);

    if (currentRound == 1) {
        // Abnormal case. You get here if and only if you manipulate the game statistics.
        if (inRange(mPos, bcent, bSize)) {
            // Finish the game and write the score to the records.
            menuKind = MENU;
            saveRecord();
            selectingDifficulty = false;
            enterMenu();
        }
    }
    else if (currentRound <= 10) {
        if (inRange(mPos, bleft, bSize)) {
            // Finish the game and write the score to the records.
            menuKind = MENU;
            saveRecord();
            selectingDifficulty = false;
            enterMenu();
        }
        else if (inRange(mPos, bright, bSize)) {
            // Continue from autosave.
            if (!loadProgress("autosave")) {
                if (!loadProgress("checkpoint")) {
                    console.error("inDeadClick(): Failed to load checkpoint save.");
                }
            }
            const dwork = new DelayedWork(fps / 2, -1, () => { menuKind = MENU; }, []);
            delayedWorks.set(dwork.id, dwork);
        }
    }
    else {
        if (inRange(mPos, bc1, bSize)) {
            // Finish the game and write the score to the records.
            menuKind = MENU;
            saveRecord();
            selectingDifficulty = false;
            enterMenu();
        }
        else if (inRange(mPos, bcent, bSize)) {
            // Continue from checkpoint.
            if (!loadProgress("checkpoint")) {
                console.error("inDeadClick(): Failed to load checkpoint save.");
            }

            // If you continue from checkpoint, you lose your autosave: which is created at every end of round.
            removeProgress("autosave");

            const dwork = new DelayedWork(fps / 2, -1, () => { menuKind = MENU; }, []);
            delayedWorks.set(dwork.id, dwork);
        }
        else if (inRange(mPos, bc2, bSize)) {
            // Continue from autosave.
            if (!loadProgress("autosave")) {
                if (!loadProgress("checkpoint")) {
                    console.error("inDeadClick(): Failed to load checkpoint save.");
                }
            }
            const dwork = new DelayedWork(fps / 2, -1, () => { menuKind = MENU; }, []);
            delayedWorks.set(dwork.id, dwork);
        }
    }
}

// onClick handler on menu screen.
function inMenuClick(e) {
    const btnX = fullX - 400;
    const btnY = fullY - 300;
    const btnW = 240;
    const btnH = 60;
    const btnInt = 80;

    const mPos = new Vector2(e.x, e.y);
    const bPos1 = new Vector2(btnX, btnY);
    const bPos2 = new Vector2(btnX, btnY + btnInt);
    const bPos3 = new Vector2(btnX, btnY + btnInt * 2);
    const bPos4 = new Vector2(btnX - btnW - 20, btnY);
    const bPos5 = new Vector2(btnX - btnW - 20, btnY + btnInt);
    const bPos6 = new Vector2(btnX - btnW - 20, btnY + btnInt * 2);
    const bSize = new Vector2(btnW, btnH);

    const credX = fullX - 160;
    const credY = 50;
    const credW = 140;
    const credH = 50;

    const bcre = new Vector2(credX, credY);
    const creSize = new Vector2(credW, credH);

    if (inRange(mPos, bPos1, bSize)) {
        // New game button
        selectingDifficulty = !selectingDifficulty;
    }
    else if (inRange(mPos, bPos2, bSize) && window.localStorage.getItem("autosave")) {
        // Continue.

        // Try loading autosave progress first.
        // If it fails, we load checkpoint progress on second.
        // If that fails too, then it is an error.

        if (!loadProgress("autosave")) {
            if (!loadProgress("checkpoint")) {
                console.error("inMenuClick(): Failed to load checkpoint save.");
            }
        }
    }
    else if (inRange(mPos, bPos3, bSize)) {
        // Records.
        menuKind = RECO;
        recordPage = 0;
        loadRecord();
        enterMenu();
    }
    else if (inRange(mPos, bcre, creSize)) {
        // Credits.
        menuKind = CRED;
        patchBox.classList.toggle("hidden");
        enterMenu();
    }
    else if (selectingDifficulty) {
        if (inRange(mPos, bPos4, bSize)) {
            // Easy difficulty
            initNewGame(EASY);
        }
        else if (inRange(mPos, bPos5, bSize)) {
            // Normal difficulty
            initNewGame(NORMAL);
        }
        else if (inRange(mPos, bPos6, bSize)) {
            // Hard difficulty
            initNewGame(HARD);
        }
    }
}

// onClick handler, on pause screen
function inPauseClick(e) {
    const cuiPos = new Vector2(e.x, e.y);

    const xPos = new Vector2(pauseX + pauseW - 60, pauseY - 60);
    const xSize = new Vector2(60, 60);

    if (inRange(cuiPos, xPos, xSize)) {
        inPause = false;
        drawnPauseStatics = false;
        ctxps.clearRect(0, 0, fullX, fullY);
        ctxpd.clearRect(0, 0, pauseW, pauseH);
        ctxpf.clearRect(0, 0, fullX, fullY);
    }
}

// onClick handler, on main game screen
function inGameFieldClick(e) {
    const cPos = new Vector2(e.x - uix, e.y - uiy);
    const cuiPos = new Vector2(e.x, e.y);

    if (selectedDeployingTowerKind == "none") {
        // If the user was not deploying a tower, then check if the user clicked an already placed tower.
        drawnStatics = false;
        for (const [tid, tower] of towers) {
            if (tower.position.distance(cPos) <= tower.size) {
                if (tid == selectedTowerId) {
                    selectedTowerId = "none";
                }
                else {
                    selectedTowerId = tid;
                }
                return;
            }
        }
        selectedTowerId = "none";
    }
    else {
        // If the user was deploying a tower, check if the tower can be placed, and place it if placable.
        if (placeAvailable && !goldBlocked) {
            const cost = temporaryTowers.get(selectedDeployingTowerKind).totalCost;
            const tower = newTower(selectedDeployingTowerKind, cPos);

            if (tower == null) return;

            towers.set(tower.id, tower);
            changePlayerGold(-cost);

            totalTowersPlaced++;

            // Check buffs(status) from nearby Combat Force Base and get buffs immediately.
            // This is to display buffs that should be shown correctly even when the user is in idle time.
            //  (for example, between rounds)

            for (const [tid, pt] of towers) {
                if (pt.position.distance(mousePosition) > pt.attackRange * pt.rangeFactor + tower.size || pt.kind != "support") continue;

                // Implement it using fall-through
                switch (pt.tier) {
                    case 5:
                    case 4:
                        tower.setStatusEffect(new DamageBoostStatus(1e18, pt.damageBoostRatio, tid));
                    case 3: {
                        tower.setStatusEffect(new BossKillStatus(1e18, pt.bossKillRatio, tid));
                        tower.setStatusEffect(new PierceBoostStatus(1e18, pt.pierceValue, tid));
                    }
                    case 2: {
                        tower.setStatusEffect(new DetectStatus(tid));
                        tower.setStatusEffect(new AttackSpeedBoostStatus(1e18, pt.attackSpeedBoostRatio, tid));
                    }
                    case 1: {
                        tower.setStatusEffect(new DiscountStatus(1e18, pt.discountRatio, tid));
                        tower.costFactor = min(tower.costFactor, pt.discountRatio);
                    }
                    case 0: {
                        tower.setStatusEffect(new RangeBoostStatus(1e18, pt.rangeBoostRatio, tid));
                        tower.rangeFactor = max(tower.rangeFactor, pt.rangeBoostRatio);
                    }
                }
            }

            // If the user is about to place Combat Force Base, it should immediately give range buff to nearby towers.
            if (tower.kind == "support") {
                const rangeBoostStatus = new RangeBoostStatus(1e18, 1.1, tower.id);
                for (const [tid, dtower] of towers) {
                    if (tid == tower.id) continue;
                    if (tower.position.distance(dtower.position) > tower.attackRange * tower.rangeFactor + dtower.size) continue;

                    dtower.setStatusEffect(rangeBoostStatus);
                    dtower.rangeFactor = max(dtower.rangeFactor, 1.1);
                }
            }

            placeAvailable = false;
            selectedDeployingTowerKind = "none";
            drawnStatics = false;
        }
    }
}

// onClick handler, on game UI.
function inGameUiClick(e) {
    const cPos = new Vector2(e.x - uix, e.y - uiy);
    const cuiPos = new Vector2(e.x, e.y);

    const uiPos = new Vector2(uix, uiy + winY + 10);
    const uiSize = new Vector2(winX, uiy - 20);
    const upperPos = new Vector2(uix, uiy - 130);
    const upperSize = new Vector2(winX, 120);

    if (inRange(cuiPos, uiPos, uiSize)) {
        // Case when the user clicked the lower UI
        
        if (selectedTowerId != "none") {
            // If the user is selecting a tower, interact with upgrade / sell / active ability button.
            const tower = towers.get(selectedTowerId);

            if (tower == undefined) {
                console.error("window.onclick(): Invalid tower id:", selectedTowerId);
                selectedTowerId = "none";
                return;
            }

            const ugPos = new Vector2(uix + (tower.tier + 2) * winX / 7, uiy + winY + 10);
            const sellX = uix + 20;
            const sellY = uiy * 19 / 12 + winY + 10;
            const sellW = winX / 9;
            const sellH = uiy / 4;

            const prefX = uix + winX * 10 / 56;
            const prefY = winY + uiy * 1.07 + 10;
            const prefW = winX * 4 / 56;
            const prefH = uiy * 0.16;

            const activeY = uiy * 1.3 + winY + 10;
            const activeS = uiy * 16 / 30;
            const activeX = uix + winX * 3 / 14 - activeS / 2;

            if (inRange(cuiPos, ugPos, new Vector2(winX / 7, uiy - 20))) {
                // Pushed upgrade button
                if (tower.upgrade()) drawnStatics = false;
            }
            else if (inRange(cuiPos, new Vector2(sellX, sellY), new Vector2(sellW, sellH))) {
                // Pushed sell button
                tower.sell(diffBranch(0.85, 0.8, 0.75));
            }
            else if (inRange(cuiPos, new Vector2(activeX, activeY), new Vector2(activeS, activeS)) && inRound) {
                // Pushed active ability button
                tower.active();
            }
            else if (inRange(cuiPos, new Vector2(prefX, prefY), new Vector2(prefW, prefH))) {
                // Pushed tower preference switch button
                tower.switchPreference();
            }
        }
        else {
            // If the user is not selecting a tower, interact with main lower UI.
            const lowY = uiy + winY + 10;
            const areaPortion = 0.625;

            for (let i = 0; i < 8; i++) {
                const boxX = uix + 10 + i * winX * areaPortion / 8;
                const boxY = lowY + 10;
                const boxW = winX * areaPortion / 8 - 20;

                // If the user clicked i-th tower, then switch to tower-deploying status.
                // Ignore if gold usage is blocked or the user is out of gold.
                if (inRange(cuiPos, new Vector2(boxX, boxY), new Vector2(boxW, boxW))) {
                    const cost = temporaryTowers.get(towerKinds[i]).totalCost;

                    if (playerGold < cost || goldBlocked) break;

                    temporarySelection = true;
                    drawnStatics = false;
                    selectedTowerId = "none";

                    if (selectedDeployingTowerKind != towerKinds[i]) {
                        selectedDeployingTowerKind = towerKinds[i];
                    }
                    else {
                        selectedDeployingTowerKind = "none";
                    }

                    checkPlaceAvailable();
                    break;
                }
            }
        }
    }
    else if (inRange(cuiPos, upperPos, upperSize)) {
        // Case when the user clicked upper UI
        const infoPos = new Vector2(uix + winX - 220, uiy - 74);
        const btnSize = new Vector2(54, 54);

        const goPos = vAdd(infoPos, new Vector2(81, 0));

        if (inRange(cuiPos, infoPos, btnSize)) {
            // Pushed info button
            inPause = true;
            drawnPauseStatics = false;
        }
        else if (inRange(cuiPos, goPos, btnSize)) {
            // Pushed start round button
            if (!inRound) startRound();
        }
        else {
            // Pushed active queue button
            if (!inRound) return;

            for (let i = 0; i < 8; i++) {
                const activeX = uix + 20 + i * 100;
                const activeY = uiy - 70;
                const activeS = 50;

                if (inRange(cuiPos, new Vector2(activeX, activeY), new Vector2(activeS, activeS))) {
                    let readyTower = null;

                    for (const [tid, tower] of towers) {
                        if (tower.kind == towerKinds[i] && tower.tier > 3) {
                            if (readyTower == null || readyTower.activeTimer > tower.activeTimer && tower.activeAvailable()) {
                                readyTower = tower;
                            }
                        }
                    }

                    if (readyTower != null)
                        readyTower.active();
                }
            }
        }
    }
    else {
        // Case when you clicked neither of UI areas.
        // Select off deployments and tower selection.
        selectedTowerId = "none";
        selectedDeployingTowerKind = "none";
        drawnStatics = false;
    }
}

// onClick handler, on game screen
function inGameClick(e) {
    const cPos = new Vector2(e.x - uix, e.y - uiy);
    const cuiPos = new Vector2(e.x, e.y);

    if (inRange(cPos, new Vector2(0, 0), new Vector2(winX, winY))) {
        // Case when clicking on the main screen of the game.
        inGameFieldClick(e);
    }
    else {
        // Case when clicking on the UI of the game.
        inGameUiClick(e);
    }
}

// onMouseWheel handler, on pause screen
function inPauseMouseWheel(e) {
    const listPos = new Vector2(pauseX, pauseY + 60);
    const listSize = new Vector2(pauseW, pauseH - 60);

    // If the user moved mouse wheel on enemy info window of pause screen, move scroll position accordingly.
    if (inRange(mouseUiPosition, listPos, listSize)) {
        const elemLength = getEnemyListLength();
        pauseScrollPosition = fitInterval(pauseScrollPosition + e.deltaY / 2.0, 0, elemLength);
    }
}

// onMouseMove handler, on pause screen
function inPauseMouseMove(e) {
    if (!pauseScrollHold) return;

    // If the user is holding scrollbar and moved the mouse, move scroll position accordingly.
    const listLength = getEnemyListLength();

    if (listLength == 0) return;

    const scrollBarWidth = 25;
    const scrollBarHeight = max(2 * scrollBarWidth, pauseH * pauseH / (listLength + pauseH));
    const mouseY = fitInterval(e.y - pauseY, scrollBarHeight / 2.0, pauseH - scrollBarHeight / 2.0);
    const portion = (mouseY - scrollBarHeight / 2.0) / (pauseH - scrollBarHeight);

    pauseScrollPosition = portion * listLength;
}

// onMouseMove handler, on game screen
function inGameMouseMove(e) {
    if (mousePosition.y < winY - 5) temporarySelection = false;

    if (selectedDeployingTowerKind != "none") {
        // Case when the user is deploying a tower to place.
        if (!inRange(mousePosition, new Vector2(0, 0), new Vector2(winX, winY))) {
            // If the mouse position is out of game area, cancel tower deployment.
            if (!temporarySelection || mousePosition.x < 0 || mousePosition.x > winX || mousePosition.y < 0) {
                selectedDeployingTowerKind = "none";
                drawnStatics = false;
            }
        }
        else {
            // If the mouse position is in the game area, check if the tower can be placed.
            checkPlaceAvailable();
        }
    }
}

// onKeyDown handler, on pause screen
function inPauseKeyDown(e) {
    switch (e.code) {
        case "Escape": {
            inPause = false;
            drawnPauseStatics = false;
            ctxps.clearRect(0, 0, fullX, fullY);
            ctxpd.clearRect(0, 0, pauseW, pauseH);
            ctxpf.clearRect(0, 0, fullX, fullY);
            break;
        }
        case "Space": {
            inPause = !inPause;
            drawnPauseStatics = false;
            ctxps.clearRect(0, 0, fullX, fullY);
            ctxpd.clearRect(0, 0, pauseW, pauseH);
            ctxpf.clearRect(0, 0, fullX, fullY);
            break;
        }
    }
}

// onKeyDown handler, on game screen
function inGameKeyDown(e) {
    switch(e.code) {
        case "Escape": {
            if (selectedTowerId != "none" || selectedDeployingTowerKind != "none") {
                selectedTowerId = "none";
                selectedDeployingTowerKind = "none";
                drawnStatics = false;
            }
            else {
                menuAlpha = 0;
                inPause = true;
                drawnPauseStatics = false;
                ctxps.clearRect(0, 0, fullX, fullY);
                ctxpd.clearRect(0, 0, pauseW, pauseH);
                ctxpf.clearRect(0, 0, fullX, fullY);
            }
            break;
        }
        case "KeyQ":
        case "KeyW":
        case "KeyE":
        case "KeyR":
        case "KeyA":
        case "KeyS":
        case "KeyD":
        case "KeyF": {
            // Tower deployment key (QWERASDF)
            if (!inRange(mousePosition, new Vector2(0, 0), new Vector2(winX, winY))) break;

            const kind = towerKeyMapping.get(e.code);
            const cost = temporaryTowers.get(kind).totalCost;

            if (playerGold < cost || goldBlocked) break;

            drawnStatics = false;
            selectedTowerId = "none";

            if (selectedDeployingTowerKind != kind)
                selectedDeployingTowerKind = kind;
            else
                selectedDeployingTowerKind = "none";

            checkPlaceAvailable();

            break;
        }
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
        case "Digit7":
        case "Digit8": {
            // Active ability shortcut key (12345678)
            if (!inRound) break;

            const kind = towerActiveKeyMapping.get(e.code);
            let readyTower = null;

            for (const [tid, tower] of towers) {
                if (tower.kind == kind && tower.tier > 3) {
                    if (readyTower == null || readyTower.activeTimer > tower.activeTimer && tower.activeAvailable()) {
                        readyTower = tower;
                    }
                }
            }

            if (readyTower != null)
                readyTower.active();

            break;
        }
        case "KeyV": {
            // V: Upgrade shortcut
            if (selectedTowerId != "none") {
                const tower = towers.get(selectedTowerId);
                tower.upgrade();
            }
            break;
        }
        case "KeyZ": {
            // Z: Active ability shortcut
            if (!inRound) break;

            if (selectedTowerId != "none") {
                const tower = towers.get(selectedTowerId);
                tower.active();
            }
            break;
        }
        case "KeyX": {
            // X: Sell shortcut
            if (selectedTowerId != "none") {
                const tower = towers.get(selectedTowerId);
                tower.sell(diffBranch(0.85, 0.8, 0.75));
            }
            break;
        }
        case "ShiftLeft":
        case "ShiftRight": {
            // Shift: Switch tower preference shortcut
            if (selectedTowerId != "none") {
                const tower = towers.get(selectedTowerId);
                tower.switchPreference();
            }
            break;
        }
        case "Space": {
            // Space: Start round, or pause.
            if (inRound) {
                inPause = !inPause;
                drawnPauseStatics = false;
                ctxps.clearRect(0, 0, fullX, fullY);
                ctxpd.clearRect(0, 0, pauseW, pauseH);
                ctxpf.clearRect(0, 0, fullX, fullY);
            }
            else startRound();

            break;
        }
    }
}

// Function that sets IO event handlers.
function setEventHandlers() {
    // on Click
    window.onclick = (e) => {
        if (clickBlock) return;

        if (inMenu) {
            switch (menuKind) {
                case MENU: {
                    inMenuClick(e);
                    break;
                }
                case DEAD: {
                    inDeadClick(e);
                    break;
                }
                case VICT: {
                    inVictoryClick(e);
                    break;
                }
                case RECO: {
                    inRecordClick(e);
                    break;
                }
                case CRED: {
                    inCreditClick(e);
                    break;
                }
                default: {
                    console.error("window.onclick(): Unknown menu kind constant:", menuKind);
                    break;
                }
            }
        }
        else if (inPause) {
            inPauseClick(e);
        }
        else {
            inGameClick(e);
        }
    }

    window.onmousedown = (e) => {
        const scrollPos = new Vector2(pauseX + pauseW - 25, pauseY);
        const scrollSize = new Vector2(25, pauseH);

        if (inRange(mouseUiPosition, scrollPos, scrollSize)) {
            pauseScrollHold = true;
            inPauseMouseMove(e);
        }
    }

    window.onmouseup = (e) => { pauseScrollHold = false; };
    
    window.onmousewheel = (e) => {
        if (inPause) inPauseMouseWheel(e);
    };

    window.onmousemove = (e) => {
        mousePosition.x = e.x - uix;
        mousePosition.y = e.y - uiy;
        mouseUiPosition = e.x;
        mouseUiPosition = e.y;

        if (inPause) inPauseMoveMove(e);
        else inGameMouseMove(e);
    };

    window.onkeydown = (e) => {
        const res = keyPressed.get(e.code);

        // Check if it is NEW keydown, not a continuous keydown.
        if (!res) {
            if (inMenu) {
                switch (menuKind) {
                    case RECO: {
                        inRecordKeyDown(e);
                        break;
                    }
                    case CRED: {
                        inCreditKeyDown(e);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
            else if (inPause) {
                inPauseKeyDown(e);
            }
            else {
                inGameKeyDown(e);
            }
        }

        keyPressed.set(e.code, true);
    };

    window.onkeyup = (e) => {
        keyPressed.set(e.code, false);
    };
}