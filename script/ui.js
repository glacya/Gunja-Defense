/*
    ui.js - 2023.10.21

    Draws game UI.
*/

// Variables that controls main menu screen.
let menuAlpha = 1.0;
let menuEnterAlpha = 0.0;

// Variables about record screen.
let scoreCache = null;
let recordPage = 0;

// Flags that indicate that the static elements of UI are drawn.
let drawnStatics = false;
let drawnPauseStatics = false;

let aimingCursor = false;
let lightOff = false;

let pauseScrollPosition = 0;

let bossAlpha = 0.0;

const imageMap = new Map();

const patchNotes = [
    "No patches."
];

// Credit.
const creditNames = [
    [true, "Development"],
    [false, "SeongHyeok Kim"],
    [false, ""],
    [true, "Special Thanks"],
    [false, "ROKAF Gunja Battery"]
];

// Loads image and puts it in `imageMap`. Images already loaded never get loaded again.
// More precisely: loads image with path "./img/kind/name.png".
// The implementation seems a bit inefficient.
function getImage(kind, name) {
    let idx = 1;
    while (name.length >= idx) {
        const c = name[name.length - idx];

        if (c < '0' || c > '9') break;
        idx++;
    }

    name = name,substring(0, name.length - idx + 1);
    
    const path = `img/${kind}/${name}.png`;
    const id = `${kind}:${name}`;

    if (!imageMap.has(id)) {
        const img = new Image();
        img.src = path;

        imageMap.set(id, img);
    }

    return imageMap.get(id);
}

// Draws pause screen.
function drawPause() {
    drawPauseStatic();
    drawPauseDynamic();
}

// Draws static elements of pause screen.
function drawPauseStatic() {
    if (drawnPauseStatics) return;

    ctxps.clearRect(0, 0, fullX, fullY);

    // Background
    ctxps.fillStyle = "rgba(103, 113, 165, 0.5)";
    ctxps.fillRect(0, 0, fullX, fullY);

    // Base of enemy description window
    ctxps.fillStyle = "rgba(244, 244, 255, 0.85)";
    ctxps.fillRect(pauseX, pauseY, pauseW, pauseH);
    ctxps.strokeRect(pauseX, pauseY, pauseW, pauseH);

    ctxps.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctxps.fillRect(pauseX, pauseY - 60, pauseW, 60);
    ctxps.strokeRect(pauseX, pauseY - 60, pauseW, 60);

    const si = floor((currentRound - 1) / 10) + 1;
    const ri = (currentRound - 1) % 10 + 1;
    ctxps.fillStyle = "rgb(0, 0, 0)";
    ctxps.font = "32px Arial";
    ctxps.fillText(`적 정보 - 라운드 ${si}-${ri} (${diffBranch("쉬움", "보통", "어려움")} 난이도)`, pauseX + 10, pauseY - 18);

    // X shape on upper-right corner
    const xs = 60;
    const mr = 10;
    ctxps.save();
    ctxps.lineWidth = 5;
    ctxps.strokeStyle = "rgb(255, 0, 0)";

    ctxps.beginPath();
    ctxps.moveTo(pauseX + pauseW - xs + mr, pauseY - xs + mr);
    ctxps.lineTo(pauseX + pauseW - mr, pauseY - mr);
    ctxps.closePath();
    ctxps.stroke();

    ctxps.beginPath();
    ctxps.moveTo(pauseX + pauseW - xs + mr, pauseY - mr);
    ctxps.lineTo(pauseX + pauseW - mr, pauseY - xs + mr);
    ctxps.closePath();
    ctxps.stroke();

    ctxps.restore();
    drawnPauseStatics = false;
}

// Helper function that calculates height of enemy information list this round.
function getEnemyListLength() {
    const elemY = 120;
    const elemMarginY = 5;
    const len = roundEnemyCount.size;

    return max(0, len * elemY + 2 * elemMarginY - pauseH);
}

// Draws dynamic element of pause screen.
function drawPauseDynamic() {
    ctxpd.clearRect(0, 0, pauseW, pauseH);
    ctxpf.clearRect(0, 0, fullX, fullY);

    const elemY = 120;
    const elemMarginY = 5;
    const elemMarginX = 10;
    const elemInnerMargin = 5;
    const elemInnerHeight = elemY - 2 * elemMarginY;

    const listLength = getEnemyListLength();
    const scrollBarWidth = 25;
    const scrollBarHeight = (listLength == 0) ? 0 : max(2 * scrollBarWidth, pauseH * pauseH / (listLength + pauseH));

    let index = 0;
    const elemW = pauseW - 2 * elemMarginX - scrollBarWidth;
    const boxH = elemInnerHeight - 2 * elemInnerMargin;
    const boxX = elemInnerMargin + elemMarginX;

    const descW = elemW / 2.0 - boxX - boxH - elemInnerMargin;
    const descX = boxX + boxH;

    const traitX = descX + descW;
    const traitW = 48;
    const traitMarginX = 10;
    const traitY = (boxH - traitW) / 2;

    // Draws enemy information, one by one.
    for (const [kind, count] of roundEnemyCount) {
        const y = index * elemY - pauseScrollPosition + 2 * elemMarginY;
        const boxY = y + elemInnerMargin;

        // Draws box
        ctxpd.fillStyle = "rgba(200, 200, 255, 0.9)";
        ctxpd.fillRect(elemMarginX, y, elemW, elemInnerHeight);
        ctxpd.strokeRect(elemMarginX, y, elemW, elemInnerHeight);
        
        ctxpd.fillStyle = "rgb(255, 255, 255)";
        ctxpd.fillRect(boxX, y + elemInnerMargin, boxH, boxH);
        ctxpd.strokeRect(boxX, y + elemInnerMargin, boxH, boxH);

        // Load enemy information, and draw it on the screen.
        const enemySample = enemyDataset.get(kind);
        enemySample.position = new Vector2(boxH / 2 + elemMarginX + elemInnerMargin, index * elemY - pauseScrollPosition + elemY / 2 + elemMarginY);
        enemySample.draw(ctxpd);

        ctxpd.fillStyle = "rgb(240, 240, 240)";
        ctxpd.fillRect(descX, boxY, descW, boxH);
        ctxpd.strokeRect(descX, boxY, descW, boxH);

        let nameText = `${enemySample.name}`;
        let nameStyle = "rgb(0, 0, 0)";

        if (enemySample.isBoss) {
            nameText += " (보스)";
            nameStyle = "rgb(255, 0, 0)";
        }
        else if (count > 0) {
            nameText += ` x${count}`;
        }
        else {
            nameText += " x??";
        }

        // Display name, count, and HP.
        ctxpd.font = "bold 24px Arial";
        ctxpd.fillStyle = nameStyle;
        ctxpd.fillText(`${nameText}`, descX + 10, boxY + 30);

        ctxpd.font = "20px Arial";
        ctxpd.fillStyle = "rgb(0, 0, 0)";
        ctxpd.fillText(`HP: ${enemySample.maxHp}`, descX + descW * 0.7, boxY + 30);

        // Draw description.
        drawMultilineText(enemySample.description, new Vector2(descX + 10, boxY + 60), false, 12, "rgb(0, 0, 0)", descW - 20, ctxpd);

        let ti = 0;
        let tj = 0;
        for (const trait of enemySample.immunity) {
            // Draw trait and immune icons.
            const tX = traitX + traitMarginX + ti * (traitW + traitMarginX);
            const tY = boxY + tj * (traitW + 4) + (enemySample.immunity.size > 10 ? 0 : traitY);
            const img = getImage("trait", trait);

            try {
                ctxpd.drawImage(img, tX, tY, traitW, traitW);
            }
            catch {
                ctxpd.strokeRect(tX, tY, traitW, traitW);
            }

            // If the cursor is over this trait icon, show tooltip window.
            const pos = vSub(mouseUiPosition, new Vector2(pauseX, pauseY));
            const traitV = new Vector2(tX, tY);
            const traitS = new Vector2(traitW, traitW);

            const baseV = new Vector2(pauseX, pauseY);
            const baseS = new Vector2(pauseW, pauseH);

            if (inRange(pos, traitV, traitS) && inRange(mouseUiPosition, baseV, baseS)) {
                ctxpf.fillStyle = "rgba(0, 0, 0, 0.8)";

                const toolX = tX - traitW * 2 + pauseX;
                const toolY = min(tY + traitW + 5 + pauseY, pauseY + pauseH);
                ctxpf.fillRect(toolX, toolY, traitW * 6, traitW * 3);
                ctxpf.strokeRect(toolX, toolY, traitW * 6, traitW * 3);

                const traitName = immunityName(trait);
                const traitDesc = immunityDescription(trait);

                ctxpf.fillStyle = "rgb(255, 255, 255)";
                ctxpf.font = "bold 14px Arial";
                ctxpf.fillText(traitName, toolX + 10, toolY + 22);

                drawMultilineText(traitDesc, new Vector2(toolX + 10, toolY + 46), false, 12, "rgb(255, 255, 255)", traitW * 6 - 20, ctxpf);
            }

            if (++ti == 10) {
                tj++;
                ti = 0;
            }
        }

        index++;
    }

    // Base of scrollbar
    ctxpd.fillStyle = "rgba(158, 163, 185, 0.9)";
    ctxpd.fillRect(pauseW - scrollBarWidth, 0, scrollBarWidth, pauseH);
    ctxpd.strokeRect(pauseW - scrollBarWidth, 0, scrollBarWidth, pauseH);

    // Scrollbar scroller.
    // This code seems to have Division by Zero.. should examine this carefully.
    const barMid = pauseScrollPosition / listLength * (pauseH - scrollBarHeight);
    ctxpd.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctxpd.fillRect(pauseW - scrollBarWidth, barMid, scrollBarWidth, scrollBarHeight);
    ctxpd.strokeRect(pauseW - scrollBarWidth, barMid, scrollBarWidth, scrollBarHeight);
}

// Sets placeAvailable = true if deploying tower can be placed at the current position of the cursor.
// Otherwise set placeAvailable = false.
function checkPlaceAvailable() {
    placeAvailable = true;
    const ds = (selectedDeployingTowerKind == "none") ? 0 : temporaryTowers.get(selectedDeployingTowerKind).size;

    for (const [tid, tower] of towers) {
        if (mousePosition.distance(tower.position) <= tower.size + ds) {
            placeAvailable = false;
            break;
        }
    }
}

// Draws cursor.
function drawCursor() {
    if (lightOff) {
        // Light off! Draw darkness except for the nearby area of the cursor.

        ctxdh.save();

        const x = mousePosition.x;
        const y = mousePosition.y;
        const size = 150;
        const rg = ctxdh.createRadialGradient(x, y, 1, x, y, size);
        rg.addColorStop(0, "rgba(0, 0, 0, 0)");
        rg.addColorStop(0.8, "rgba(0, 0, 0, 0)");
        rg.addColorStop(1, "rgb(0, 0, 0)");

        ctxdh.fillStyle = rg;
        ctxdh.fillRect(0, 0, fullX, fullY);

        ctxdh.restore();
    }

    if (!inPause && aimingCursor) {
        // Aiming something. Replace cursor with some aiming-shape.
        aimingCursor = false;

        const x = mouseUiPosition.x;
        const y = mouseUiPosition.y;

        const [r1, r2, x1, x2] = [40, 60, 20, 70];

        ctxcur.save();
        ctxcur.translate(x, y);

        ctxcur.lineWidth = 5;
        ctxcur.strokeStyle = "rgb(255, 0, 0)";

        ctxcur.beginPath();
        ctxcur.arc(0, 0, r1, 0, pi * 2);
        ctxcur.closePath();
        ctxcur.stroke();

        ctxcur.beginPath();
        ctxcur.arc(0, 0, r2, pi * 2);
        ctxcur.closePath();
        ctxcur.stroke();

        for (let i = 0; i < 4; i++) {
            ctxcur.beginPath();
            ctxcur.moveTo(x1, 0);
            ctxcur.lineTo(x2, 0);
            ctxcur.stroke();
            ctxcur.closePath();
            ctxcur.rotate(pi / 2);
        }

        ctxcur.restore();
    }
    else if (inPause || selectedDeployingTowerKind == "none") {
        // If the user is in pause screen, or the user is not deploying any tower, draw basic cursor.
        ctxcur.beginPath();
        ctxcur.arc(mouseUiPosition.x, mouseUiPosition.y, 10, 0, pi * 2);
        ctxcur.closePath();

        ctxcur.fillStyle = "rgba(128, 128, 255, 0.4)";
        ctxcur.fill();
        ctxcur.stroke();
    }
    else {
        // If the user is deploying a tower, draw the tower's view and its range.
        const tempTower = temporaryTowers.get(selectedDeployingTowerKind);
        let rangeFactor = 1.0;

        // If the current position is a position that can receive range buffs from nearby Combat Force Bases, show adjusted range.
        for (const [tid, tower] of towers) {
            if (tower.position.distance(mousePosition) > tower.attackRange * tower.rangeFactor + tempTower.size || tower.kind != "support") continue;

            rangeFactor = max(rangeFactor, tower.rangeBoostRatio);
        }

        if (placeAvailable) {
            ctxdl.fillStyle = "rgba(200, 200, 200, 0.3)";
        }
        else {
            ctxdl.fillStyle = "rgba(255, 0, 0, 0.3)";
        }

        ctxdl.beginPath();
        ctxdl.arc(mousePosition.x, mousePosition.y, tempTower.attackRange * rangeFactor, 0, pi * 2);
        ctxdl.closePath();

        ctxdl.fill();

        drawTowerTempView(selectedDeployingTowerKind, mousePosition. ctxd);
    }
}

// Draws active ability queue, located on upper-left UI.
function drawActiveQueue() {
    let t4s = [];
    let ready = [];
    let t1 = [];
    let t2 = [];
    let t1Timer = [];
    let t2Timer = [];

    // t1: tower of tier 4+ with the oldest active timer
    // t2: tower of tier 4+ with the oldest active timer, among the ones that can cast the active ability now
    for (let i = 0; i < 8; i++) {
        t4s.push(0);
        ready.push(0);
        t1.push(null);
        t2.push(null);
        t1Timer.push(1e18);
        t2Timer.push(1e18);
    }
    
    for (const [tid, tower] of towers) {
        if (tower.tier <= 3) continue;

        const i = towerKinds.indexOf(tower.kind);
        t4s[i]++;

        const usable = !tower.stunned && !tower.activeBlocked;

        if (globalGameTimer - tower.activeTimer >= tower.activePeriod && usable) {
            ready[i]++;
        }

        if (t1Timer[i] > tower.activeTimer) {
            t1Timer[i] = tower.activeTimer;
            t1[i] = tid;
        }

        if (t2Timer[i] > tower.activeTimer && usable) {
            t2Timer[i] = tower.activeTimer;
            t2[i] = tid;
        }
    }

    for (let i = 0; i < 8; i++) {
        // Skip if there are no tier 4+ towers on this kind.
        if (t4s[i] == 0) continue;

        const activeX = uix + 20 + i * 100;
        const activeY = uiy - 70;
        const activeS = 50;

        const tower1 = towers.get(t1[i]);
        const tower2 = towers.get(t2[i]);

        const towerTier = tower2 == null ? tower1.tier : tower2.tier;
        
        const img = towerTier == 4 ? getImage("active" , towerKinds[i]) : getImage("active", towerKinds[i] + "next");
        ctxuid.drawImage(img, activeX, activeY, activeS, activeS);
        ctxuid.strokeRect(activeX, activeY, activeS, activeS);

        const activePeriod = temporaryTowers.get(towerKinds[i]).activePeriod;

        if (ready[i] == 0) {
            // If there are no available towers, draw the cooldown of the oldest tower.
            const activePortion = fitInterval((globalTimer - t1Timer[i]) / activePeriod, 0, 1);
            const activePH = activeS * activePortion;

            if (activePortion >= 1.0) {
                // If the oldest tower is unable to cast ability, draw X shape.
                ctxuid.fillStyle = "rgba(64, 0, 0, 0.4)";
                ctxuid.fillRect(activeX, activeY, activeS, activeS);

                ctxuid.save();
                ctxuid.strokeStyle = "rgb(255, 0, 0)";
                ctxuid.lineWidth = 4;
                ctxuid.beginPath();
                ctxuid.moveTo(activeX + 10, activeY + 10);
                ctxuid.lineTo(activeX + activeS - 10, activeY + activeS - 10);
                ctxuid.stroke();

                ctxuid.beginPath();
                ctxuid.moveTo(activeX + 10, activeY + activeS - 10);
                ctxuid.lineTo(activeX + activeS - 10, activeY + 10);
                ctxuid.stroke();

                ctxuid.restore();
            }
            else {
                // The oldest tower is in cooldown. Draw cooldown.
                ctxuid.fillStyle = "rgba(0, 0, 0, 0.4)";
                ctxuid.fillRect(activeX, activeY, activeS, activeS);
                ctxuid.fillRect(activeX, activeY + activePH, activeS, activeS - activePH);

                const timeLeft = activePeriod + t1Timer[i] - globalGameTimer;
                let secondLeft = (timeLeft - 1) / fps;

                if (secondLeft < 1.0) {
                    secondLeft = secondLeft.toFixed(1);
                }
                else {
                    secondLeft = floor(secondLeft) + 1;
                }

                drawTextAlignMiddle(secondLeft, new Vector2(activeX + activeS / 2, activeY + activeS / 2), false, 24, "rgb(255, 255, 255)", ctxuid);
            }
        }
        else {
            // Draw count of readied towers.
            ctxuid.fillStyle = "rgb(0, 0, 0)";
            ctxuid.font = "bold 14px Arial";

            ctxuid.fillText(`x${ready[i]}`, activeX + activeS + 5, activeY + activeS);
        }

        // Draw shortcut key.
        ctxuid.font = "bold 12px Arial";
        ctxuid.fillStyle = "rgb(208, 208, 208)";
        ctxuid,fillRect(activeX, activeY, 12, 12);
        ctxuid.strokeRect(activeX, activeY, 12, 12);

        ctxuid.fillStyle = "rgb(0, 0, 0)";
        ctxuid.fillText(towerKindKeyMapping.get(towerKinds[i])[1].charAt(5), activeX + 2, activeY + 10);

        // If the cursor is on active ability button, show tooltip.
        if (inRange(mouseUiPosition, new Vector2(activeX, activeY), new Vector2(activeS, activeS))) {
            const x = max(uix, activeX + activeS / 2 - winX / 7);
            const y = uiy;
            const w = winX * 2 / 7;
            const h = uiy * 7 / 10 + 10;

            ctxuid.fillStyle = "rgba(48, 48, 48, 0.8)";
            ctxuid.fillRect(x, y, w, h);
            ctxuid.strokeRect(x, y, w, h);

            const readyTower = temporaryTowers.get(towerKinds[i]);
            const ai = floor(towerTier / 5);
            const keyName = towerKindKeyMapping.get(towerKinds[i])[1];

            drawMultilineText(readyTower.activeName[ai], new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
            drawTextAlignRight(`${readyTower.activePeriod / fps}초    [${keyName[keyName.length - 1]}]`, new Vector2(x + w - 10, y + 15), false, 14, "rgb(255, 255, 255)", ctxuid);
            drawMultilineText(readyTower.activeDescription[ai], new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
        }
    }
}

// Draws static element of UI, on upper side.
function drawStaticUpperUI() {
    ctxuis.strokeStyle = "rgb(0, 0, 0)";
    ctxuis.strokeRect(uix, uiy, winX, winY);

    // Draw upper-left texts.
    ctxuis.fillStyle = diffBranch("rgba(150, 255, 200, 0.2)", "rgba(200, 255, 150, 0.2)", "rgba(255, 200, 200, 0.2)");
    ctxuis.fillRect(uix, uiy - 130, winX, 120);
    ctxuis.strokeRect(uix, uiy - 130, winX, 120);

    ctxuis.font = "28px Arial";
    ctxuis.fillStyle = "rgb(0, 0, 0)";
    ctxuis.fillText("골드 :", uix + 20, uiy - 90);
    ctxuis.fillText("HP :", uix + 280, uiy - 90);

    const roundX = uix + winX - 220;
    const roundY = uiy - 74;

    // Draw current round text.
    if (currentRound <= 50) {
        const si = floor((currentRound - 1) / 10) + 1;
        const ri = (currentRound - 1) % 10 + 1;
        const indexStr = `${si}-${ri}`;
        const roundStr = inRound ? `라운드 ${indexStr}` : `다음 라운드: ${indexStr}`;

        ctxuis.fillText(roundStr, !inRound ? roundX - 20 : roundX, uiy - 90);
    }

    // Draw two buttons: proceed button and info button
    const btnSize = 54;
    ctxuis.fillStyle = "rgb(255, 255, 255)";
    ctxuis.fillRect(roundX, roundY, btnSize, btnSize);
    ctxuis.strokeRect(roundX, roundY, btnSize, btnSize);

    if (!inRound) {
        ctxuis.fillRect(roundX + btnSize * 3 / 2, roundY, btnSize, btnSize);
        ctxuis.strokeRect(roundX + btnSize * 3 / 2, roundY, btnSize, btnSize);
    }

    // Round info button
    const infoX = roundX + btnSize / 2;
    const infoRadius = 4;

    ctxuis.beginPath();
    ctxuis.arc(infoX, roundY + btnSize / 6 + 3, infoRadius, 0, pi * 2);
    ctxuis.closePath();

    ctxuis.fillStyle = "rgb(0, 0, 255)";
    ctxuis.fill();
    ctxuis.stroke();

    ctxuis.fillRect(infoX - infoRadius, roundY + btnSize / 6 + 13, infoRadius * 2, btnSize / 2);

    const rightX = roundX + btnSize * 3 / 2;
    const rightY = roundY;

    // Round start button
    if (!inRound) {
        ctxuis.fillStyle = "rgb(0, 255, 255)";

        ctxuis.beginPath();
        ctxuis.moveTo(rightX + btnSize / 4, rightY + btnSize / 4);
        ctxuis.lineTo(rightX + btnSize / 4, rightY + 3 * btnSize / 4);
        ctxuis.lineTo(rightX + btnSize * 3 / 4, rightY + btnSize / 2);
        ctxuis.closePath();

        ctxuis.fill();
        ctxuis.stroke();
    }

    // Helper textbox on deploying tower.
    if (selectedDeployingTowerKind != "none") {
        const guideW = 400;
        const guideH = 40;

        ctxuis.fillStyle = goldBlocked ? "rgb(64, 0, 0, 0.4)" : "rgb(0, 0, 0, 0.4)";
        ctxuis.fillRect(fullX / 2 - guideW / 2, uiy, guideW, guideH);
        ctxuis.strokeRect(fullX / 2 - guideW / 2, uiy, guideW, guideH);

        drawTextAlignMiddle(goldBlocked ? "현재 골드 사용 불가" : "클릭하여 타워 배치: Esc로 취소", new Vector2(fullX / 2, uiy + guideH / 2), false, 14, "rgb(255, 255, 255)", ctxuis);
    }
}

// Draw static elements of UI, on lower side.
function drawStaticLowerUI() {
    const lowY = uiy + winY + 10;

    if (selectedTowerId != "none") {
        // Draw upgrade UI if the user is selecting a tower.
        const tower = towers.get(selectedTowerId);

        if (tower == undefined) {
            console.error("drawStaticLowerUI(): Invalid tower id:", selectedTowerId);
            return;
        }

        // Draw UI base.
        ctxuis.fillStyle = "rgb(167, 210, 255)";
        ctxuis.fillRect(uix, lowY, winX, uiy - 20);
        ctxuis.strokeRect(uix, lowY, winX, uiy - 20);

        // Draw tower name.
        ctxuis.font = "bold 18px Arial";
        ctxuis.fillStyle = "rgb(0, 0, 0)";
        ctxuis.fillText(tower.name, uix + 10, lowY + 25);

        // Draw damage dealt, and its kills.
        const statX = uix + 24;
        const statY = lowY + 48;

        ctxuis.font = "14px Arial";
        ctxuis.fillStyle = "rgb(0, 0, 0)";

        if (tower.kind != "money") {
            ctxuis.fillText("적 처치 횟수 :", statX, statY);
            ctxuis.fillText("가한 피해량  :", statX, statY + 18);
        }
        else {
            ctxuis.fillText("생산한 골드  :", statX, statY);
            ctxuis.fillText("가한 피해량  :", statX, statY + 18);
        }

        // Draw upgrade buttons.
        for (let i = 0; i < 8; i++) {
            const btnX = uix + (i + 2) * winX / 7;

            if (i < tower.tier) {
                ctxuis.fillStyle = "rgba(255, 255, 255, 0.8)";
            }
            else if (i == tower.tier) {
                if (goldBlocked) {
                    ctxuis.fillStyle = "rgba(169, 14, 21, 0.8)";
                }
                else if (playerGold >= tower.upgradeCost[tower.tier] * tower.costFactor) {
                    ctxuis.fillStyle = "rgba(75, 235, 248, 0.8)";
                }
                else {
                    ctxuis.fillStyle = "rgba(144, 144, 144, 0.8)";
                }
            }
            else {
                ctxuis.fillStyle = "rgba(48, 48, 48, 0.8)";
            }

            ctxuis.fillRect(btnX, lowY, winX / 7, uiy - 20);
            ctxuis.strokeRect(btnX, lowY, winX / 7, uiy - 20);

            ctxuis.font = "bold 18px Arial";
            ctxuis.fillStyle = "rgb(0, 0, 0)";

            ctxuis.fillText(tower.upgradeName[i], btnX + 10, lowY + 20);

            if (i == tower.tier) {
                ctxuis.font = "bold 20px Arial";
                ctxuis.fillText("V", btnX + winX / 7 - 25, winY + 2 * uiy - 20);
            }
            
            ctxuis.font = "16px Arial";
            if (i >= tower.tier) {
                if (goldBlocked) {
                    ctxuis.fillText("골드 사용 불가", btnX + 10, lowY + 45);
                }
                else {
                    ctxuis.fillText(`${tower.upgradeCost[i] * tower.costFactor}골드`, btnX + 10, lowY + 45);
                }
            }
            else {
                ctxuis.fillText("구매함", btnX + 10, lowY + 45);
            }
        }

        // Draw sell button.
        const sellX = uix + 20;
        const sellY = uiy * 19 / 12 + winY + 10;
        const sellW = winX / 9;
        const sellH = uiy / 4;

        let sellmsg = null;
        if (tower.betrayed) {
            ctxuis.fillStyle = "rgb(!28, 0, 0)";
            sellmsg = "배반함";
        }
        else if (tower.castingActive || tower.sellBlocked) {
            ctxuis.fillStyle = "rgb(64, 64, 64)";
            sellmsg = "판매 불가";
        }
        else {
            ctxuis.fillStyle = "rgb(128, 152, 249)";
            sellmsg = `판매: ${floor(diffBranch(0.85, 0.8, 0.75) * tower.totalCost)}골드`;
        }

        ctxuis.fillRect(sellX, sellY, sellW, sellH);
        ctxuis.strokeRect(sellX, sellY, sellW, sellH);

        ctxuis.font = "bold 16px Arial";
        ctxuis.fillStyle = "rgb(0, 0, 0)";
        ctxuis.fillText(sellmsg, sellX + 10, sellY + sellH / 2 + 5);

        ctxuis.font = "bold 20px Arial";
        ctxuis.fillText("X", sellX + sellW + 10, sellY + sellH);

        // Draw preference switch button.
        const prefX = uix + winX * 10 / 56;
        const prefY = winY + uiy * 1.07 + 10;
        const prefW = winX * 4 / 56;
        const prefH = uiy * 0.16;

        ctxuis.fillStyle = tower.betrayed ? "rgb(250, 220, 220)" : "rgb(230, 255, 255)";
        ctxuis.fillRect(prefX, prefY, prefW, prefH);
        ctxuis.strokeRect(prefX, prefY, prefW, prefH);

        // Show correspondent text on the preference button.
        const prefNames = ["전방 우선", "후방 우선", "근접 우선", "강적 우선"];
        let prefText = prefNames[tower.preference];
        let prefBold = false;

        if (tower.betrayed) prefText = "배반함";
        else if (tower.kind == "freeze") prefText = "광역 효과 타워";
        else if (tower.kind == "money" || tower.kind == "support") prefText = "비전투 타워";
        else prefBold = true;

        drawTextAlignMiddle(prefText, new Vector2(prefX + prefW / 2, prefY + prefH / 2), prefBold, 14, "rgb(0, 0, 0)", ctxuis);

        if (tower.tier > 3) {
            // Draw tower's active ability button.
            const activeY = uiy * 1.3 + winY + 10;
            const activeS = uiy * 16 / 30;
            const activeX = uix + winX * 3 / 14 - activeS / 2;

            ctxuis.fillStyle = "rgb(0, 0, 0)";
            ctxuis.font = "bold 20px Arial";
            ctxuis.fillText("Z", activeX + activeS + 10, activeY + activeS);
        }
    }
    else {
        // If the user is not selecting a tower, draw normal UI.
        
        // Draw base UI.
        ctxuis.fillStyle = diffBranch("rgb(217, 232, 255)", "rgb(232, 255, 217)", "rgb(255, 232, 232)");
        ctxuis.fillRect(uix, lowY, winX, uiy - 20);
        ctxuis.strokeRect(uix, lowY, winX, uiy - 20);

        const ap = 0.625;

        for (let i = 0; i < 8; i++) {
            const boxX = uix + 10 + i * winX * ap / 8;
            const boxY = lowY + 10;
            const boxW = winX * ap / 8 - 20;

            ctxuis.fillStyle = "rgb(255, 255, 255)";
            ctxuis.fillRect(boxX, boxY, boxW, boxW);
            ctxuis.strokeRect(boxX, boxY, boxW, boxW);
            
            ctxuis.fillStyle = "rgb(0, 0, 0)";
            ctxuis.font = "bold 18px Arial";
            ctxuis.fillText(towerKindKeyMapping.get(towerKinds[i])[0].charAt(3), boxX + 5, boxY + 18);

            const cost = temporaryTowers.get(towerKinds[i]).totalCost;

            drawTextAlignMiddle(String(cost), new Vector2(boxX + boxW / 2, boxY + boxW + 14), true, 18, "rgb(0, 0, 0)", ctxuis);
        }

        const roundX = winX * ap + uix + 10;
        const roundY = lowY + 10;
        const roundW = winX * (1 - ap) - 20;
        const roundH = uiy - 40;

        ctxuis.fillStyle = "rgb(255, 255, 255)";
        ctxuis.fillRect(roundX, roundY, roundW, roundW);
        ctxuis.strokeRect(roundX, roundY, roundW, roundW);

        const fontSize = 14;
        const textX = roundX + 10;
        const textY = roundY + fontSize * 1.5;
        const fillStyle = "rgb(0, 0, 0)";

        // Draw round description message.
        if (currentRound <= 50) {
            drawMultilineText(roundDescription[currentRound - 1], new Vector2(textX, textY), true, fontSize, fillStyle, roundW - 20, ctxuis);
        }
    }
}

// Draw static UI elements.
function drawStaticUI() {
    if (drawnStatics) return;

    ctxuis.clearRect(0, 0, fullX, fullY);

    drawnStatics = true;

    drawStaticUpperUI();
    drawStaticLowerUI();
}

// Draw boss HP bar.
function drawBossHpBar() {
    const barX = uix + 600;
    const barY = uiy - 120;
    const barW = 500;
    const barH = 40;

    ctxuid.save();
    ctxuid.globalAlpha = bossAlpha;
    ctxuid.lineWidth = 1.5;

    ctxuid.fillStyle = "rgb(255, 0, 0)";
    ctxuid.font = "32px Arial";
    ctxuid.fillText("BOSS", barX - 100, barY + 32);

    ctxuid.fillStyle = "rgb(0, 0, 0)";
    ctxuid.fillRect(barX, barY, barW, barH);
    ctxuid.strokeRect(barX, barY, barW, barH);

    const boss = enemies.get(bossEnemyId);
    const invColor = "rgb(0, 210, 111)";

    // Draw red HP bar, and lines indicating phase thresholds.
    if (boss != null) {
        if (boss.invincible) {
            ctxuid.strokeStyle = invColor;
        }

        if (boss.shield + boss.hp < boss.maxHp) {
            const hpp = boss.hp / boss.maxHp;
            const shp = boss.shield / boss.maxHp;

            ctxuid.fillStyle = "rgb(255, 0, 0)";
            ctxuid.fillRect(barX, barY, barW * hpp, barH);
            ctxuid.strokeRect(barX, barY, barW * hpp, barH);

            ctxuid.fillStyle = "rgb(255, 255, 255)";
            ctxuid.fillRect(barX + barW * hpp, barY, barW * shp, barH);
            ctxuid.strokeRect(barX + barW * hpp, barY, barW * shp, barH);

            if (boss.maxPhase != undefined) {
                const mp = boss.maxPhase;
                const cp = boss.currentPhase;

                for (let i = 1; i <= mp - cp; i++) {
                    const x = barX + barW / mp * i;
                    ctxuid.beginPath();
                    ctxuid.moveTo(x, barY);
                    ctxuid.lineTo(x, barY + barH);
                    ctxuid.closePath();
                    ctxuid.stroke();
                }
            }
        }
        else {
            const lp = boss.hp / (boss.hp + boss.shield);
            const rp = 1 - lp;

            ctxuid.fillStyle = "rgb(255, 0, 0)";
            ctxuid.fillRect(barX, barY, barW * lp, barH);
            ctxuid.strokeRect(barX, barY, barW * lp, barH);

            ctxuid.fillStyle = "rgb(255, 255, 255)";
            ctxuid.fillRect(barX + barW * lp, barY, barW * rp, barH);
            ctxuid.strokeRect(barX + barW * lp, barY, barW * rp, barH);

            if (boss.maxPhase != undefined) {
                const mp = boss.maxPhase;
                const cp = boss.currentPhase;

                for (let i = 1; i <= mp - cp; i++) {
                    const x = barX + (barW * lp) / mp * i;
                    ctxuid.beginPath();
                    ctxuid.moveTo(x, barY);
                    ctxuid.lineTo(x, barY + barH);
                    ctxuid.closePath();
                    ctxuid.stroke();
                }
            }
        }

        const hpString = `${boss.hp} / ${boss.maxHp}`;
        drawTextAlignRight(hpString, new Vector2(barX + barW - 10, barY + barH + 15), false, 18, boss.invincible ? invColor : "rgb(0, 0, 0)", ctxuid);
    }

    ctxuid.restore();
}

// Draw dynamic UI elements, when selecting a tower.
function drawDynamicTowerUI() {
    const e = mouseUiPosition;
    const tower = towers.get(selectedTowerId);

    // Damage dealt, and kills.
    const statX = uix + 114;
    const statY = uiy + winY + 58;

    if (tower.kind != "money") {
        ctxuid.fillText(tower.kills, statX, statY);
        ctxuid.fillText(floor(tower.damageDealt), statX, statY + 18);
    }
    else {
        ctxuid.fillText(tower.totalProduction, statX, statY);
        ctxuid.fillText(floor(tower.damageDealt), statX, statY + 18);
    }

    const activeY = uiy * 1.3 + winY + 10;
    const activeS = uiy * 16 / 30;
    const activeX = uix + winX * 3 / 14 - activeS / 2;

    const prefX = uix + winX * 10 / 56;
    const prefY = winY + uiy * 1.07 + 10;
    const prefW = winX * 4 / 56;
    const prefH = uiy * 0.16;

    const sellX = uix + 20;
    const sellY = uiy * 19 / 12 + winY + 10;
    const sellW = winX / 9;
    const sellH = uiy / 4;

    // Draw active ability icon.
    if (tower.tier > 3) {
        const img = tower.tier == 4 ? getImage("active", tower.kind) : getImage("active", tower.kind + "next");
        ctxuid.drawImage(img, activeX, activeY, activeS, activeS);
        ctxuid.strokeRect(activeX, activeY, activeS, activeS);

        if (tower.stunned || tower.activeBlocked) {
            ctxuid.fillStyle = "rgba(64, 0, 0, 0.4)";
            ctxuid.fillRect(activeX, activeY, activeS, activeS);

            ctxuid.save();
            ctxuid.strokeStyle = "rgb(255, 0, 0)";
            ctxuid.lineWidth = 6;
            ctxuid.beginPath();
            ctxuid.moveTo(activeX + 10, activeY + 10);
            ctxuid.lineTo(activeX + activeS - 10, activeY + activeS - 10);
            ctxuid.stroke();

            ctxuid.beginPath();
            ctxuid.moveTo(activeX + 10, activeY + activeS - 10);
            ctxuid.lineTo(activeX + activeS - 10, activeY + 10);
            ctxuid.stroke();

            ctxuid.restore();
        }
    }
    else {
        // If the tower is not tier 4+, draw locked image instead.
        ctxuid.drawImage(getImage("active", "locked"), activeX, activeY, activeS, activeS);

        ctxuid.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctxuid.fillRect(activeX, activeY, activeS, activeS);
        ctxuid.strokeRect(activeX, activeY, activeS, activeS);
    }

    // If the cursor is on some of buttons, show tooltip of it.
    if (e.x >= uix && e.x <= uix + winX && e.y >= uiy + winY + 10 && e.y <= fullY - 20) {
        if (e.x >= uix + 2 * winX / 7) {
            // Show upgrade description.
            const i = fitInterval(floor((e.x - (uix + 2 * winX / 7)) / (winX / 7)), 0, 4);
            const x = uix + min(1.75 + i, 5.5) * winX / 7;
            const y = winY + uiy * 3 / 10 - 10;
            const w = winX / 7 * 1.5;
            const h = uiy * 7 / 10 + 10;

            ctxuid.fillStyle = "rgba(48, 48, 48, 0.8)";
            ctxuid.fillRect(x, y, w, h);
            ctxuid.strokeRect(x, y, w, h);

            let goldString = `${tower.upgradeCost[i] * tower.costFactor}골드`;

            if (tower.tier == i) goldString += `   [V]`;

            drawMultilineText(tower.upgradeName[i] + `  (${i + 1}단계)`, new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
            drawTextAlignRight(goldString, new Vector2(x + w - 10, y + 15), false, 14, "rgb(255, 255, 255)", ctxuid);
            drawMultilineText(tower.upgradeDescription[i], new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
        }
        else if (e.x >= activeX && e.x <= activeX + activeS && e.y >= activeY && e.y <= activeY + activeS) {
            // Show active ability description.
            const x = uix + winX / 14;
            const y = winY + uiy * 3 / 10 - 10;
            const w = winX * 2 / 7;
            const h = uiy * 7 / 10 + 10;

            ctxuid.fillStyle = "rgba(48, 48, 48, 0.8)";
            ctxuid.fillRect(x, y, w, h);
            ctxuid.strokeRect(x, y, w, h);

            if (tower.tier > 3) {
                const ai = floor(tower.tier / 5);

                drawMultilineText(tower.activeName[ai], new Vector2(x + 10, y + 20), true, 14, "rgb(@55, 255, 255)", w - 20, ctxuid);
                drawTextAlignRight(`${tower.activePeriod / fps}초   [Z]`, new Vector2(x + w - 10, y + 15), false, 14, "rgb(255, 255, 255)", ctxuid);
                drawMultilineText(tower.activeDescription[ai], new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
            }
            else {
                drawMultilineText("액티브 스킬 잠김", new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
                drawMultilineText("타워를 4단계로 업그레이드하면 액티브 스킬을 사용할 수 있습니다. \n 타워를 5단계로 업그레이드하면 액티브 스킬이 더욱 강화됩니다.",
                    new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
            }
        }
        else if (inRange(e, new Vector2(uix, uiy + winY + 10), new Vector2(winX * 3 / 28, 36))) {
            // Show basic information of the tower.
            const x = uix;
            const y = winY + uiy * 3 / 10 - 10;
            const w = winX * 2 / 7;
            const h = uiy * 7 / 10 + 10;
            
            ctxuid.fillStyle = "rgba(48, 48, 48, 0.8)";
            ctxuid.fillRect(x, y, w, h);
            ctxuid.strokeRect(x, y, w, h);

            drawMultilineText(tower.name + " (0단계)", new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
            drawMultilineText(tower.baseDescription, new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
        }
        else if (inRange(e, new Vector2(prefX, prefY), new Vector2(prefW, prefH))) {
            // Show preference tooltips.
            const prefDesc = [
                "가장 앞에 있는 적을 우선으로 공격합니다.",
                "가장 뒤에 있는 적을 우선으로 공격합니다.",
                "가장 가까운 적을 우선으로 공격합니다.",
                "가장 HP가 많은 적을 우선으로 공격합니다."
            ];

            const x = uix + winX / 14;
            const y = winY + uiy * 3 / 10 - 10;
            const w = winX * 2 / 7;
            const h = uiy * 7 / 10 + 10;

            ctxuid.fillStyle = "rgba(48, 48, 48, 0.8)";
            ctxuid.fillRect(x, y, w, h);
            ctxuid.strokeRect(x, y, w, h);

            if (tower.betrayed) {
                drawMultilineText("배반함", new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
                drawMultilineText("이 타워는 배반하였습니다. \n 모든 공격이 적을 회복시키며, 판매가 불가능합니다. \n 공격 설정이 전방 우선으로 고정되며, 액티브 스킬을 재사용 대기시간마다 자동으로 사용합니다.",
                     new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
            }
            else if (tower.kind == "freeze" || tower.kind == "money" || tower.kind == "support") {
                drawMultilineText("공격 설정 고정됨", new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
                drawMultilineText("이 타워는 공격 설정을 변경할 수 없습니다.", new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
            }
            else {
                drawMultilineText("공격 설정: ", new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
                drawMultilineText(prefDesc[tower.preference] + " \n \n Shift 키를 눌러 다른 설정으로 바꿀 수 있습니다.", new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
                drawTextAlignRight("[Shift]", new Vector2(x + w - 10, y + 16), false, 14, "rgb(255, 255, 255)", ctxuid);
            }
        }
        else if (inRange(e, new Vector2(sellX, sellY), new Vector2(sellW, sellH))) {
            // Show sell tooltip.
            const x = uix;
            const y = winY + uiy * 3 / 10 - 10;
            const w = winX * 2 / 7;
            const h = uiy * 7 / 10 + 10;
            
            ctxuid.fillStyle = "rgba(48, 48, 48, 0.8)";
            ctxuid.fillRect(x, y, w, h);
            ctxuid.strokeRect(x, y, w, h);

            drawMultilineText("타워 판매", new Vector2(x + 10, y + 20), true, 14, "rgb(@55, 255, 255)", w - 20, ctxuid);
            drawTextAlignRight("[X]", new Vector2(x + w - 10, y + 15), false, 14, "rgb(255, 255, 255)", ctxuid);
            drawMultilineText(`타워를 소모한 금액의 ${diffBranch(85, 80, 75)}%인 ${floor(tower.totalCost * diffBranch(0.85, 0.8, 0.75))}골드에 판매합니다.`, 
                new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
        }
    }

    // Show active ability cooldown.
    if (tower.tier > 3 && globalGameTimer < tower.activeTimer + tower.activePeriod) {
        const activePortion = fitInterval((globalGameTimer - tower.activeTimer) / this.activePeriod, 0, 1);
        const activePH = activeS * activePortion;

        ctxuid.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctxuid.fillRect(activeX, activeY, activeS);
        ctxuid.fillRect(activeX, activeY + activePH, activeS, activeS - activePH);

        const timeLeft = tower.activePeriod + tower.activeTimer - globalGameTimer;
        let secondLeft = (timeLeft - 1) / fps;

        if (secondLeft < 1.0) {
            secondLeft = secondLeft.toFixed(1);
        }
        else {
            secondLeft = floor(secondLeft) + 1;
        }

        drawTextAlignMiddle(secondLeft, new Vector2(activeX + activeS / 2, activeY + activeS / 2), false, 36, "rgb(255, 255, 255)". ctxuid);
    }
}

// Draw dynamic UI elements.
function drawDynamicUI() {
    // Draw player stat.
    ctxuid.font = "28px Arial";
    ctxuid.fillStyle = "rgb(0, 0, 0)";
    ctxuid.fillText(playerGold, uix + 120, uiy - 90);
    ctxuid.fillText(playerHp, uix + 360, uiy - 90);

    // Draw background.
    const bgColor = ["rgb(220, 220, 255)", "rgb(255, 200, 255)", "rgb(220, 255, 220)", "rgb(255, 255, 200)", "rgb(255, 220, 220)"];

    if (currentRound <= 50) {
        const isBossRound = inRound && bossEnemyId != null && enemies.has(bossEnemyId);
        const color = isBossRound ? "rgb(255, 0, 0)" : bgColor[floor((currentRound - 1) / 10)];
        let bossPhase = 0;

        if (isBossRound) bossPhase = enemies.get(bossEnemyId).currentPhase;

        let alpha = 0;
        const bgp = isBossRound ? (fps * (8 / 3 - bossPhase / 2)) : 5 * fps;
        const p = globalTimer % bgp / bgp;

        if (p <= 0.25) alpha = p * 4;
        else if (p <= 0.5) alpha = -4 * p + 2;

        const finalAlpha = isBossRound ? alpha * (0.25 + 0.02 * bossPhase) + 0.05 : alpha * 0.35 + 0.05;

        ctxdl.fillStyle = toAlpha(color, finalAlpha);
        ctxdl.fillRect(0, 0, fullX, fullY);
    }

    if (selectedTowerId != "none")
        drawDynamicTowerUI();
    else {
        // If the user is not selecting a tower, draw basic UI.
        const ap = 0.625;
        const lowY = uiy + winY + 10;

        for (let i = 0; i < 8; i++) {
            const boxX = uix + 10 + i * winX * ap / 8;
            const boxY = lowY + 10;
            const boxW = winX * ap / 8 - 20;

            drawTowerTempView(towerKinds[i], new Vector2(boxX + boxW / 2, boxY + boxW / 2), ctxuid);

            const tempTower = temporaryTowers.get(towerKinds[i]);

            // If the user is unable to use gold now, draw red.
            if (goldBlocked) {
                ctxuid.fillStyle = "rgba(160, 0, 0, 0.6)";
                ctxuid.fillRect(boxX, boxY, boxW, boxW);
            }

            // If the user does not have enough gold, draw drak.
            if (playerGold < tempTower.totalCost) {
                ctxuid.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctxuid.fillRect(boxX, boxY, boxW, boxW);
            }

            // If the cursor is on the tower's box, show tooltip.
            if (inRange(mouseUiPosition, new Vector2(boxX, boxY), new Vector2(boxW, boxW))) {
                const tipW = boxW * 3;
                const tipH = uiy * 7 / 10 + 10;
                const tipX = max(uix, boxX - tipW / 4);
                const tipY = boxY - tipH - 20;

                ctxuid.fillStyle = "rgba(48, 48, 48, 0.8)";
                ctxuid.fillRect(tipX, tipY, tipW, tipH);
                ctxuid.strokeRect(tipX, tipY, tipW, tipH);

                drawMultilineText(tempTower.name, new Vector2(tipX + 10, tipY + 20), true, 14, "rgb(255, 255, 255)", tipW - 20, ctxuid);
                drawMultilineText(tempTower.baseDescription, new Vector2(tipX + 10, tipY + 44), false, 12, "rgb(255, 255, 255)", tipW - 20, ctxuid);

                const keyName = towerKindKeyMapping.get(towerKinds[i])[0];
                drawTextAlignRight(`${tempTower.totalCost}골드    [${keyName[keyName.length - 1]}]`, new Vector2(tipX + tipW - 10, tipY + 16), false, 13, "rgb(255, 255, 255)", ctxuid);
            } 
        }
    }

    drawActiveQueue();

    // Show tooltip of round info / start button.
    const roundX = uix + winX - 220;
    const roundY = uiy - 74;
    const rs = new Vector2(54, 54);

    if (inRange(mouseUiPosition, new Vector2(roundX, roundY), rs) || (!inRound && inRange(mouseUiPosition, new Vector2(roundX + 81, roundY), rs))) {
        const x = roundX - 100;
        const y = uiy;
        const w = 320;
        const h = uiy * 3 / 5 + 10;

        ctxuid.fillStyle = "rgba(48, 48, 48, 0.8)";
        ctxuid.fillRect(x, y, w, h);
        ctxuid.strokeRect(x, y, w, h);

        if (inRange(mouseUiPosition, new Vector2(roundX, roundY), rs)) {
            drawMultilineText("라운드 정보 보기", new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
            drawTextAlignRight(inRound ? "[Esc/Space]" : "[Esc]", new Vector2(x + w - 10, y + 16), false, 14, "rgb(255, 255, 255)", ctxuid);
            drawMultilineText("라운드에 등장하는 적의 정보를 봅니다.", new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
        }
        else {
            drawMultilineText("라운드 시작", new Vector2(x + 10, y + 20), true, 14, "rgb(255, 255, 255)", w - 20, ctxuid);
            drawTextAlignRight("[Space]", new Vector2(x + w - 10, y + 16), false, 14, "rgb(255, 255, 255)", ctxuid);
            drawMultilineText("다음 라운드를 시작합니다.", new Vector2(x + 10, y + 40), false, 12, "rgb(255, 255, 255)", w - 20, ctxuid);
        }
    }
    
    // If there is a boss, draw its HP bar.
    if (bossEnemyId != null)
        drawBossHpBar();
}

// Draws ingame elements. Called every frame.
function drawInGame() {
    drawStaticUI();
    drawDynamicUI();
    drawProjectiles();
    drawVisualEffects();
    drawTowers();
    drawEnemies();
}

// Draws record screen.
function drawRecordScreen() {
    ctxm.clearRect(0, 0, fullX, fullY);

    if (clickBlock && menuEnterAlpha >= 0.99) 
        clickBlock = false;

    ctxm.save();
    ctxm.globalAlpha = menuAlpha;
    ctxm.fillStyle = "rgb(0, 0, 0)";
    ctxm.fillRect(0, 0, fullX, fullY);

    const yMove = 10 * (1.0 - menuEnterAlpha);
    const color = `rgba(255, 255, 255, ${menuEnterAlpha})`;

    ctxm.fillStyle = color;
    ctxm.beginPath();
    ctxm.moveTo(20, 58 + yMove);
    ctxm.lineTo(80, 28 + yMove);
    ctxm.lineTo(80, 88 + yMove);
    ctxm.closePath();
    ctxm.fill();

    drawTextAlignMiddle("기록", new Vector2(fullX / 2, 60 + yMove), true, 72, color, ctxm);

    ctxm.beginPath();
    ctxm.moveTo(30, 116 + yMove);
    ctxm.lineTo(fullX - 30, 116 + yMove);
    ctxm.strokeStyle = color;
    ctxm.lineWidth = 4;
    ctxm.stroke();

    drawTextAlignMiddle("순위", new Vector2(fullX * 0.1, 140 + yMove), false, 24, color, ctxm);
    drawTextAlignMiddle("이름", new Vector2(fullX * 0.26, 140 + yMove), false, 24, color, ctxm);
    drawTextAlignMiddle("난이도", new Vector2(fullX * 0.42, 140 + yMove), false, 24, color, ctxm);
    drawTextAlignMiddle("시간", new Vector2(fullX * 0.58, 140 + yMove), false, 24, color, ctxm);
    drawTextAlignMiddle("결과", new Vector2(fullX * 0.74, 140 + yMove), false, 24, color, ctxm);
    drawTextAlignMiddle("점수", new Vector2(fullX * 0.9, 140 + yMove), false, 24, color, ctxm);

    ctxm.lineWidth = 2;
    ctxm.beginPath();
    ctxm.moveTo(50, 160 + yMove);
    ctxm.lineTo(fullX - 50, 160 + yMove);
    ctxm.stroke();

    const entryHeight = 32;

    if (playerRecords.length == 0) {
        drawTextAlignMiddle("기록이 없습니다.", new Vector2(fullX * 0.5, 140 + yMove), false, 36, color, ctxm);
        ctxm.restore();
        return;
    }

    const recordPerPage = 20;
    const totalPages = floor((playerRecords.length - 1) / recordPerPage) + 1;

    if (totalPages > 1) {
        const y = fullY * 0.95 + yMove;
        drawTextAlignMiddle(`${recordPage + 1} / ${totalPages} 페이지`, new Vector2(fullX * 0.5, y), false, 18, color, ctxm);

        const lx = fullX * 0.4;
        const rx = fullX * 0.6;
        const tsize = 32;

        // Draw arrows.
        // May elaborate this code by hiding arrows at page 1 and LAST page.

        ctxm.fillStyle = color;
        ctxm.beginPath();
        ctxm.moveTo(lx - tsize, y);
        ctxm.lineTo(lx, y + tsize / 2);
        ctxm.lineTo(lx, y - tsize / 2);
        ctxm.closePath();
        ctxm.fill();

        ctxm.beginPath();
        ctxm.moveTo(rx + tsize, y);
        ctxm.lineTo(rx, y + tsize / 2);
        ctxm.lineTo(rx, y - tsize / 2);
        ctxm.closePath();
        ctxm.fill();
    }

    // Draw each record entry, up to `recordPerPage` entries at once.
    for (let i = recordPage * recordPerPage; i < min(playerRecords.length, (recordPage + 1) * recordPerPage); i++) {
        const record = playerRecords[i];
        const y = 168 + entryHeight / 2 + yMove + (i % recordPerPage) * entryHeight;
        const roundColor = record.deadRound > 50 ? `rgba(0, 255, 0, ${menuEnterAlpha})` : `rgba(255, 0, 0, ${menuEnterAlpha})`;

        const si = floor((record.deadRound - 1) / 10) + 1;
        const ri = record.deadRound % 10 + (record.deadRound % 10 == 0 ? 10 : 0);
        const deadRound = `${si}-${ri}`;
        const roundString = record.deadRound > 50 ? "승리!!" : ("패배: 라운드 " + deadRound);

        const diffString = (record.difficulty == EASY ? "쉬움" : (record.difficulty == NORMAL ? "보통" : "어려움")) + ` (${record.version})`;

        drawTextAlignMiddle(String(i + 1), new Vector2(fullX * 0.1, y), false, 20, color, ctxm);
        drawTextAlignMiddle(record.name, new Vector2(fullX * 0.26, y), false, 20, color, ctxm);
        drawTextAlignMiddle(diffString, new Vector2(fullX * 0.42, y), false, 20, color, ctxm);
        drawTextAlignMiddle(record.timer, new Vector2(fullX * 0.58, y), false, 20, color, ctxm);
        drawTextAlignMiddle(roundString, new Vector2(fullX * 0.74, y), false, 20, roundColor, ctxm);
        drawTextAlignMiddle(String(record.score), new Vector2(fullX * 0.9, y), false, 20, color, ctxm);
    }

    ctxm.restore();
}

// Draws victory screen.
function drawVictoryScreen() {
    ctxm.clearRect(0, 0, fullX, fullY);

    ctxm.save();
    ctxm.globalAlpha = menuAlpha;
    ctxm.fillStyle = "rgb(0, 0, 0)";
    ctxm.fillRect(0, 0, fullX, fullY);

    drawTextAlignMiddle("승리!!", new Vector2(fullX / 2, fullY * 0.15), true, 96, "rgb(0, 255, 0)", ctxm);

    const textY = fullY * 0.27;
    const firstTimer = fps * 2;
    const scoreInterval = fps / 3;
    const lastInterval = fps;

    if (scoreCache == null) scoreCache = calculateScore();

    ctxm.strokeStyle = "rgb(255, 255, 255)";
    ctxm.lineWidth = 1.5;

    const efs = 16;
    if (globalTimer - victoryTimer >= firstTimer) {
        ctxm.fillStyle = "rgb(255, 255, 255)";
        ctxm.font = `${efs}px Arial`;
        ctxm.fillText("승리!!", fullX * 0.35, textY - 20 + efs / 3);
        drawTextAlignRight("5000", new Vector2(fullX * 0.65, textY - 20), true, efs, "rgb(255, 255, 255)", ctxm);

        ctxm.beginPath();
        ctxm.moveTo(fullX * 0.3, textY - 36);
        ctxm.lineTo(fullX * 0.7, textY - 36);
        ctxm.closePath();
        ctxm.stroke();

        ctxm.beginPath();
        ctxm.moveTo(fullX * 0.3, textY - 6);
        ctxm.lineTo(fullX * 0.7, textY - 6);
        ctxm.closePath();
        ctxm.stroke();
    }

    const es = new Vector2(fullX * 0.3, efs);
    const edw = 300;
    const edh = 160;
    let idx = 1;

    for (const entry of scoreCache.entries) {
        if (globalTimer - victoryTimer >= firstTimer + idx * scoreInterval) {
            ctxm.fillStyle = "rgb(255, 255, 255)";
            ctxm.font = `${efs}px Arial`;
            ctxm.fillText(entry.name, fullX * 0.35, textY + idx * efs * 1.4 - efs / 6);

            drawTextAlignRight(entry.score, new Vector2(fullX * 0.65, textY + idx * efs * 1.4 - efs / 2), true, efs, "rgb(255, 255, 255)", ctxm);
        }

        idx++;
    }

    idx = 1;
    for (const entry of scoreCache.entries) {
        if (globalTimer - victoryTimer < firstTimer + idx * scoreInterval) break;

        const entY = textY + idx * efs * 1.4 - efs / 6;
        if (entry.desc != null && inRange(mouseUiPosition, new Vector2(fullX * 0.35, entY - efs), es)) {
            const mx = fullX * 0.32;
            const my = entY + efs * 0.6;

            ctxm.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctxm.fillRect(mx, my, edw, edh);
            ctxm.strokeRect(mx, my, edw, edh);

            drawMultilineText(entry.desc, new Vector2(mx + 10, my + 24), false, 14, "rgb(255, 255, 255)", edw - 20, ctxm);
        }

        idx++;
    }

    ctxm.font = `${efs}px Arial`;

    if (globalTimer - victoryTimer >= firstTimer + idx * scoreInterval + lastInterval) {
        ctxm.beginPath();
        ctxm.moveTo(fullX * 0.3, fullY * 0.85);
        ctxm.lineTo(fullX * 0.7, fullY * 0.85);
        ctxm.closePath();
        ctxm.stroke();

        ctxm.fillText(`난이도 보너스(${diffBranch("쉬움", "보통", "어려움")})`, fullX * 0.35, fullY * 0.85 - 44 + efs / 3);
        drawTextAlignRight(`${diffBranch("x1", "x1.5", "x2")}`, new Vector2(fullX * 0.65, fullY * 0.85 - 44), true, efs, "rgb(255, 255, 255)", ctxm);

        ctxm.fillText("총점", fullX * 0.35, fullY * 0.85 - 16 + efs / 3);
        drawTextAlignRight(`${scoreCache.total}`, new Vector2(fullX * 0.65, fullY * 0.85 - 16), true, efs, "rgb(255, 255, 255)", ctxm);

        ctxm.beginPath();
        ctxm.moveTo(fullX * 0.3, fullY * 0.85 - 60);
        ctxm.lineTo(fullX * 0.7, fullY * 0.85 - 60);
        ctxm.closePath();
        ctxm.stroke();
    }

    ctxm.restore();

    if (globalTimer - victoryTimer >= firstTimer + idx * scoreInterval + lastInterval * 2) {
        clickBlock = false;

        const btnY = fullY * 0.9 - 30;
        const btnW = 240;
        const btnH = 60;
        
        ctxm.fillStyle = "rgb(255, 255, 255)";
        ctxm.fillRect(fullX / 2 - 120, btnY, btnW, btnH);
        ctxm.strokeRect(fullX / 2 - 118, btnY + 2, btnW - 4, btnH - 4);

        drawTextAlignMiddle("점수 등록하기!", new Vector2(fullX / 2 + 5, btnY + btnH / 2), true, 18, "rgb(0, 0, 0)", ctxm);
    }
}

// Draws dead screen.
function drawDeadScreen() {
    ctxm.clearRect(0, 0, fullX, fullY);

    ctxm.save();
    ctxm.globalAlpha = menuAlpha;
    ctxm.fillStyle = "rgb(0, 0, 0)";
    ctxm.fillRect(0, 0, fullX, fullY);

    drawTextAlignMiddle("패배..", new Vector2(fullX / 2, fullY * 0.15), true, 96, "rgb(255, 0, 0)", ctxm);

    const si = floor((currentRound - 1) / 10) + 1;
    const ri = currentRound % 10 + (currentRound % 10 == 0 ? 10 : 0);

    const textY = fullY * 0.27;
    const firstTimer = fps * 2;
    const scoreInterval = fps / 3;
    const lastInterval = fps;

    if (scoreCache == null) scoreCache = calculateScore();

    ctxm.strokeStyle = "rgb(255, 255, 255)";
    ctxm.lineWidth = 1.5;

    const efs = 16;
    if (globalTimer - victoryTimer >= firstTimer) {
        ctxm.fillStyle = "rgb(255, 255, 255)";
        ctxm.font = `${efs}px Arial`;
        ctxm.fillText("패배 라운드", fullX * 0.35, textY - 20 + efs / 3);
        drawTextAlignRight(`${si}-${ri}`, new Vector2(fullX * 0.65, textY - 20), true, efs, "rgb(255, 255, 255)", ctxm);

        ctxm.beginPath();
        ctxm.moveTo(fullX * 0.3, textY - 36);
        ctxm.lineTo(fullX * 0.7, textY - 36);
        ctxm.closePath();
        ctxm.stroke();

        ctxm.beginPath();
        ctxm.moveTo(fullX * 0.3, textY - 6);
        ctxm.lineTo(fullX * 0.7, textY - 6);
        ctxm.closePath();
        ctxm.stroke();
    }

    const es = new Vector2(fullX * 0.3, efs);
    const edw = 300;
    const edh = 160;
    let idx = 1;

    for (const entry of scoreCache.entries) {
        if (globalTimer - deadTimer >= firstTimer + idx * scoreInterval) {
            ctxm.fillStyle = "rgb(255, 255, 255)";
            ctxm.font = `${efs}px Arial`;
            ctxm.fillText(entry.name, fullX * 0.35, textY + idx * efs * 1.4 - efs / 6);

            drawTextAlignRight(entry.score, new Vector2(fullX * 0.65, textY + idx * efs * 1.4 - efs / 2), true, efs, "rgb(255, 255, 255)", ctxm);
        }

        idx++;
    }

    idx = 1;
    for (const entry of scoreCache.entries) {
        if (globalTimer - deadTimer < firstTimer + idx * scoreInterval) break;

        const entY = textY + idx * efs * 1.4 - efs / 6;
        if (entry.desc != null && inRange(mouseUiPosition, new Vector2(fullX * 0.35, entY - efs), es)) {
            const mx = fullX * 0.32;
            const my = entY + efs * 0.6;

            ctxm.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctxm.fillRect(mx, my, edw, edh);
            ctxm.strokeRect(mx, my, edw, edh);

            drawMultilineText(entry.desc, new Vector2(mx + 10, my + 24), false, 14, "rgb(255, 255, 255)", edw - 20, ctxm);
        }

        idx++;
    }

    ctxm.font = `${efs}px Arial`;

    if (globalTimer - deadTimer >= firstTimer + idx * scoreInterval + lastInterval) {
        ctxm.beginPath();
        ctxm.moveTo(fullX * 0.3, fullY * 0.85);
        ctxm.lineTo(fullX * 0.7, fullY * 0.85);
        ctxm.closePath();
        ctxm.stroke();

        ctxm.fillText(`난이도 보너스(${diffBranch("쉬움", "보통", "어려움")})`, fullX * 0.35, fullY * 0.85 - 44 + efs / 3);
        drawTextAlignRight(`${diffBranch("x1", "x1.5", "x2")}`, new Vector2(fullX * 0.65, fullY * 0.85 - 44), true, efs, "rgb(255, 255, 255)", ctxm);

        ctxm.fillText("총점", fullX * 0.35, fullY * 0.85 - 16 + efs / 3);
        drawTextAlignRight(`${scoreCache.total}`, new Vector2(fullX * 0.65, fullY * 0.85 - 16), true, efs, "rgb(255, 255, 255)", ctxm);

        ctxm.beginPath();
        ctxm.moveTo(fullX * 0.3, fullY * 0.85 - 60);
        ctxm.lineTo(fullX * 0.7, fullY * 0.85 - 60);
        ctxm.closePath();
        ctxm.stroke();
    }

    ctxm.restore();

    if (globalTimer - deadTimer >= firstTimer + idx * scoreInterval + lastInterval * 2) {
        clickBlock = false;

        const btnY = fullY * 0.9 - 30;
        const btnW = 240;
        const btnH = 60;

        if (currentRound == 1) {
            const btnX = fullX * 0.5 - 120;

            ctxm.fillStyle = "rgb(216, 216, 216)";
            ctxm.fillRect(btnX, btnY, btnW, btnH);
            ctxm.strokeRect(btnX + 2, btnY + 2, btnW - 4, btnH - 4);

            drawTextAlignMiddle("점수를 등록하고 그만두기", new Vector2(btnX + btnW / 2, btnY + btnH / 2), true, 18, "rgb(0, 0, 0)", ctxm);
        }
        else if (si > 1) {
            const btnX = fullX * 0.3 - 120;

            ctxm.fillStyle = "rgb(216, 216, 216)";
            ctxm.fillRect(btnX, btnY, btnW, btnH);
            ctxm.strokeRect(btnX + 2, btnY + 2, btnW - 4, btnH - 4);

            ctxm.fillStyle = "rgb(255, 255, 255)";
            ctxm.fillRect(btnX + fullX * 0.2, btnY, btnW, btnH);
            ctxm.strokeRect(btnX + fullX * 0.2 + 2, btnY + 2, btnW - 4, btnH - 4);
            
            ctxm.fillStyle = "rgb(255, 255, 255)";
            ctxm.fillRect(btnX + fullX * 0.4, btnY, btnW, btnH);
            ctxm.strokeRect(btnX + fullX * 0.4 + 2, btnY + 2, btnW - 4, btnH - 4);

            drawTextAlignMiddle("점수를 등록하고 그만두기", new Vector2(btnX + btnW / 2, btnY + btnH / 2), true, 18, "rgb(0, 0, 0)", ctxm);
            drawTextAlignMiddle(`${si}-1 부터 이어하기`, new Vector2(btnX + fullX * 0.2 + btnW / 2, btnY + btnH / 2), true, 18, "rgb(0, 0, 0)", ctxm);
            drawTextAlignMiddle("직전 라운드부터 이어하기", new Vector2(btnX + fullX * 0.4 + btnW / 2, btnY + btnH / 2), true, 18, "rgb(0, 0, 0)", ctxm);
        }
        else {
            const btnX = fullX * 0.4 - 120;

            ctxm.fillStyle = "rgb(216, 216, 216)";
            ctxm.fillRect(btnX, btnY, btnW, btnH);
            ctxm.strokeRect(btnX + 2, btnY + 2, btnW - 4, btnH - 4);

            ctxm.fillStyle = "rgb(255, 255, 255)";
            ctxm.fillRect(btnX + fullX * 0.2, btnY, btnW, btnH);
            ctxm.strokeRect(btnX + fullX * 0.2 + 2, btnY + 2, btnW - 4, btnH - 4);

            drawTextAlignMiddle("점수를 등록하고 그만두기", new Vector2(btnX + btnW / 2, btnY + btnH / 2), true, 18, "rgb(0, 0, 0)", ctxm);
            drawTextAlignMiddle("직전 라운드부터 이어하기", new Vector2(btnX + fullX * 0.2 + btnW / 2, btnY + btnH / 2), true, 18, "rgb(0, 0, 0)", ctxm);
        }
    }
}

// Draws credit screen.
function drawCreditScreen() {
    ctxm.clearRect(0, 0, fullX, fullY);
    
    ctxm.save();
    ctxm.globalAlpha = menuAlpha;
    ctxm.fillStyle = "rgb(0, 0, 0)";
    ctxm.fillRect(0, 0, fullX, fullY);
    
    if (clickBlock && menuEnterAlpha >= 0.99)
        clickBlock = false;

    const yMove = 10 * (1.0 - menuEnterAlpha);
    const color = `rgba(255, 255, 255, ${menuEnterAlpha})`;

    patchBox.style.top = `${fullY * 0.1 + yMove}px`;
    patchBox.style.opacity = menuEnterAlpha;

    ctxm.fillStyle = color;
    ctxm.beginPath();
    ctxm.moveTo(20, 58 + yMove);
    ctxm.lineTo(80, 28 + yMove);
    ctxm.lineTo(80, 88 + yMove);
    ctxm.closePath();
    ctxm.fill();

    ctxm.font = "bold 24px Arial";
    ctxm.fillText("패치 노트", fullX * 0.15, fullY * 0.1 - 30 + yMove);
    ctxm.fillText("명예의 전당", fullX * 0.7, fullY * 0.1 - 30 + yMove);

    let yOff = 0;
    for (const name of creditNames) {
        let font = "12px Arial";
        if (name[0]) font = "bold 14px Arial";

        ctxm.font = font;
        ctxm.fillText(name[1], fullX * 0.7, fullY * 0.1 + yOff + yMove);

        yOff += (name[0] ? 17 : 15);
    }

    ctxm.restore();
}

// Helper function that adjusts menu opacity on menu transitions.
function enterMenu() {
    menuEnterAlpha = 0.0;
    clickBlock = true;
    const vse = new VisualEffect("menuenter", null, fps / 2, null, null);
    addVisualEffects(vse);

    const dwork = new DelayedWork(fps / 2, 0, () => {menuAlpha = 1;}, []);
    addDelayedWorks(dwork);
}

// Draw menu screen.
function drawMenuScreen() {
    ctxm.clearRect(0, 0, fullX, fullY);

    if (clickBlock && menuEnterAlpha >= 0.99) clickBlock = false;

    ctxm.save();
    ctxm.globalAlpha = menuAlpha;
    ctxm.fillStyle = "rgb(0, 0, 0)";
    ctxm.fillRect(0, 0, fullX, fullY);

    ctxm.font = "bold 120px Arial";
    ctxm.fillStyle = `rgba(255, 255, 255, ${menuEnterAlpha})`;
    ctxm.fillText(gameTitle, 60, 162 + 30 * (1 - menuEnterAlpha));

    // Draws buttons.
    const btnX = fullX - 400;
    const btnY = fullY - 300 + 30 * (1 - menuEnterAlpha);
    const btnW = 240;
    const btnH = 60;

    ctxm.fillRect(btnX, btnY, btnW, btnH);
    ctxm.strokeRect(btnX + 2, btnY + 2, btnW - 4, btnH - 4);

    const btnDesc = ["새 게임", "이어하기", "기록"];
    const diffDesc = ["쉬움", "보통", "어려움"];
    const diffColor = ["rgb(200, 255, 255)", "rgb(200, 255, 200)", "rgb(255, 200, 200)"];

    for (let i = 0; i < 3; i++) {
        if (i == 1 && !(window.localStorage.getItem("autosave") || window.localStorage.getItem("checkpoint"))) {
            ctxm.fillStyle = `rgba(64, 64, 64, ${menuEnterAlpha})`;
        }
        else ctxm.fillStyle = `rgba(255, 255, 255, ${menuEnterAlpha})`;

        ctxm.fillRect(btnX, btnY + i * 80, btnW, btnH);
        ctxm.strokeRect(btnX + 2, btnY + i * 80 + 2, btnW - 4, btnH - 4);

        drawTextAlignMiddle(btnDesc[i], new Vector2(btnX + btnW / 2, btnY + i * 80 + 30), false, 28, "rgb(0, 0, 0)", ctxm);
    }

    if (selectingDifficulty) {
        for (let i = 0; i < 3; i++) {
            ctxm.fillStyle = diffColor[i];

            ctxm.fillRect(btnX - btnW - 20, btnY + i * 80, btnW, btnH);
            ctxm.strokeRect(btnX - btnW - 20 + 2, btnY + i * 80 + 2, btnW - 4, btnH - 4);

            drawTextAlignMiddle(diffDesc[i], new Vector2(btnX - btnW / 2 - 20, btnY + i * 80 + 30), false, 28, "rgb(0, 0, 0)", ctxm);
        }
    }

    // Draw version number.
    drawTextAlignRight(gameVersion, new Vector2(fullX - 20, 20 + 30 * (1 - menuEnterAlpha)), false, 16, toAlpha("rgb(255, 255, 255)", menuEnterAlpha), ctxm);

    // Draw credit button.
    const credX = fullX - 160;
    const credY = 50 + 30 * (1 - menuEnterAlpha);
    const credW = 140;
    const credH = 50;

    ctxm.fillStyle = toAlpha("rgb(216, 216, 216)", menuEnterAlpha);
    ctxm.fillRect(credX, credY, credW, credH);
    ctxm.strokeRect(credX + 2, credY + 2, credW - 4, credH - 4);
    drawTextAlignMiddle("변경점", new Vector2(credX + credW / 2, credY + 24), false, 20, "rgb(0, 0, 0)", ctxm);
}

// Clears ingame canvi.
function clearInGameCanvas() {
    ctxd.clearRect(0, 0, winX, winY);
    ctxuid.clearRect(0, 0, fullX, fullY);
    ctxdh.clearRect(0, 0, fullX, fullY);
    ctxdb.clearRect(0, 0, fullX, fullY);
    ctxdl.clearRect(0, 0, fullX, fullY);
    ctxm.clearRect(0, 0, fullX, fullY);
}

// Initializes DOM attributes.
function setDOMAttributes() {
    const winCanv = [canvasDynamic, canvasDynamicLow, canvasDynamicHigh, canvasDynamicBoss];
    const fullCanv = [canvasUIStatic, canvasUIDynamic, canvasCursor, canvasPauseStatic, canvasPauseFull, canvasMenu];
    const pauseCanv = [canvasPauseDynamic];

    const leftMargin = floor((fullX - winX) / 2);
    const topMargin = floor((fullY - winY) / 2);

    for (const c of winCanv) {
        c.width = winX;
        c.height = winY;
        c.style.top = `${topMargin}px`;
        c.style.left = `${leftMargin}px`;
    }

    for (const c of fullCanv) {
        c.width = fullX;
        c.height = fullY;
    }

    for (const c of pauseCanv) {
        c.width = pauseW;
        c.height = pauseH;
        c.style.top = `${pauseY}px`;
        c.style.left = `${pauseX}px`;
    }

    patchBox.style.border = "thin solid #ffffff";
    patchBox.width = fullX / 2;
    patchBox.height = floor(fullY * 0.8);
    patchBox.style.left = `${floor(fullX * 0.15)}px`;
    patchBox.style.top = `${floor(fullY * 0.1)}px`;

    let patchString = "";
    for (const entry of patchNotes) {
        const headDesc = entry.substring(0, 2);

        if (headDesc == "h1" || headDesc == "h2") {
            patchString += `<${headDesc}><b>${entry.substring(3)}</b></${headDesc}>`;
        }
        else if (headDesc == "h3" || headDesc == "h4") {
            patchString += `<${headDesc}>${entry.substring(3)}</${headDesc}>`;
        }
        else {
            patchString += entry + "<br>";
        }
    }

    patchBox.innerHTML = patchString;
}