
const en_name = [
    "Stone Turret", "Frosty Matter", "Venom Factory", "Laser Accelerator",
    "Wave Shocker", "Arcane Pedestal", "Gold Management Center", "Combat Force Base"];

/* 
    tower.js - 2023.11.01

    Implementation of general tower functionalities.
*/

const TOWER_PREF_FIRST = 0;
const TOWER_PREF_LAST = 1;
const TOWER_PREF_CLOSE = 2;
const TOWER_PREF_STRONG = 3;

const towers = new Map();
let towerId = 0;

const towerKinds = ["stone", "freeze", "poison", "laser", "wave", "arcane", "money", "support"];
const towerKeyMapping = new Map();
const towerKindKeyMapping = new Map();
const towerActiveKeyMapping = new Map();

const temporaryTowers = new Map();

class Tower {
    constructor(kind, position) {
        this.id = towerId++;
        this.kind = kind;
        this.position = position;
        this.activeTimer = globalGameTimer;
        this.attackTimer = 0;

        // These values should be set by child class.
        this.name = null;
        this.baseDescription = null;
        this.upgradeName = null;
        this.upgradeCost = null;
        this.upgradeDescription = null;
        this.activeName = null;
        this.activeDescription = null;
        this.pierce = 0;
        this.size = null;
        this.totalCost = null;

        // Variable that represents tower's target preference.
        this.preference = TOWER_PREF_FIRST;

        // Variables that describes tower's status and stats.
        this.tier = 0;
        this.lastDirection = new Vector2(0, -1);
        this.kills = 0;
        this.damageDealt = 0;
        this.statusEffects = new Map();
        this.stunned = false;
        this.camoDetection = false;
        this.permaCamoDetection = false;
        this.castingActive = false;
        this.sellBlocked = false;
        this.activeBlocked = false;
        this.betrayed = false;
        this.mysteryShield = 0;
        this.bossDamageRatio = 1.0;
        this.transcendent = false;

        // Variables which are used for implementations of some buffs.
        this.attackSpeedFactor = 1.0;
        this.damageFactor = 1.0;
        this.rangeFactor = 1.0;
        this.pierceBoost = 0;
        this.costFactor = 1.0;
    }

    // Updates tower status. Called every frame.
    update() {
        this.stunned = false;
        this.castingActive = false;
        this.camoDetection = false;
        this.transcendent = false;
        this.sellBlocked = false;
        this.activeBlocked = false;
        this.betrayed = false;
        this.pierceBoost = 0;
        this.mysteryShield = 0;
        
        this.attackSpeedFactor = 1.0;
        this.damageFactor = 1.0;
        this.rangeFactor = 1.0;
        this.costFactor = 1.0;
        this.bossDamageRatio = 1.0;

        let tranBoost = 1.0;
        let attackSpeedBoost = 1.0;
        let attackSpeedSlow = 1.0;
        let damageBoost = 1.0;
        let damageDown = 1.0;
        let rangeBoost = 1.0;
        let rangeDown = 1.0;

        for (const [sid, ste] of this.statusEffects) {
            ste.update();

            if (ste.expired) {
                this.statusEffects.delete(sid);
                continue;
            }

            // Process each status effect.
            switch (ste.kind) {
                case "stun": {
                    this.stunned = true;
                    break;
                }
                case "casting": {
                    this.castingActive = true;
                    break;
                }
                case "detect": {
                    this.camoDetection = true;
                    break;
                }
                case "asboost": {
                    attackSpeedBoost = max(attackSpeedBoost, ste.ratio);
                    break;
                }
                case "asslow": {
                    attackSpeedSlow += (ste.ratio - 1.0);
                    break;
                }
                case "tranready": {
                    tranBoost = max(tranBoost, ste.ratio);
                    break;
                }
                case "transcendent": {
                    damageBoost += (ste.ratio - 1.0);
                    this.transcendent = true;
                    break;
                }
                case "damageboost": {
                    damageBoost += (ste.ratio - 1.0);
                    break;
                }
                case "damagedown": {
                    damageDown *= ste.ratio;
                    break;
                }
                case "pireceboost": {
                    this.pierceBoost = max(this.pierceBoost, ste.ratio);
                    break;
                }
                case "rangeboost": {
                    rangeBoost = max(rangeBoost, ste.ratio);
                    break;
                }
                case "rangedown": {
                    rangeDown = min(rangeDown, ste.ratio);
                    break;
                }
                case "discount": {
                    this.costFactor = min(this.costFactor, ste.ratio);
                    break;
                }
                case "sellblock": {
                    this.sellBlocked = true;
                    break;
                }
                case "activeblock": {
                    this.activeBlocked = true;
                    break;
                }
                case "betray": {
                    this.betrayed = true;
                    break;
                }
                case "mysteryshield": {
                    this.mysteryShield += ste.count;
                    break;
                }
                case "bosskill": {
                    this.bossDamageRatio = max(this.bossDamageRatio, ste.ratio);
                    break;
                }
            }
        }

        if (this.transcendent) rangeBoost += 0.25;

        // Integrate values collected from processing status effects.

        // For attack speed, each buff's highest ratio is added, and the sum of buffs is divided by the sum of debuffs.
        this.attackSpeedFactor = (1 + attackSpeedBoost - 1 + tranBoost - 1) / attackSpeedSlow;

        // For damage, buffs addtively stack, and debuffs multiplicatively stack.
        this.damageFactor = damageBoost * damageDown;
        
        // For attack range, both buffs and debuffs take their peak-one. Only peaks are considered in the final result.
        this.rangeFactor = rangeBoost * rangeDown;

        // Betrayed towers deal negative damage; they heal!
        // And even more, they cannot switch their preference.
        if (this.betrayed) {
            this.damageFactor = -this.damageFactor;
            this.preference = TOWER_PREF_FIRST;
        }
    }

    // Sells the tower, refunded by the (total gold spent on the tower) * `ratio`.
    // Returns true if the sell was successful. Otherwise returns false.
    sell(ratio) {
        // If the tower is casting active ability or has Sell Block status, you cannot sell it.
        if (this.castingActive || this.sellBlocked) return false;

        changePlayerGold(floor(ratio * this.totalCost));
        selectedTowerId = "none";
        towers.delete(this.id);

        // Count total solds for score.
        totalTowersSold++;

        return true;
    }

    // Checks if the tower can attack this frame. Called every frame.
    // Child classes should inherit this method, and implement its actual attacking functions.
    attack() {
        return !this.stunned && globalGameTimer - this.attackTimer >= this.attackPeriod / this.attackSpeedFactor;
    }

    // Upgrades the tower. Returns true if successful, false if failed.
    // Child classes should inherit this method, and implement its functionalities there.
    upgrade() {
        // If the tower is already fully upgraded or you cannot use gold now, upgrade fails.
        if (this.tier == 5 || goldBlocked) return false;

        const cost = this.upgradeCost[this.tier] * this.costFactor;

        // You don't have enough gold.. lol
        if (cost > playerGold) return false;

        changePlayerGold(-cost);
        this.totalCost += cost;
        ++this.tier;

        totalTowerUpgrades++;
        if (this.tier == 5) totalTowerMaxUpgrades++;

        drawnStatics = false;

        return true;
    }

    // Switches tower attack preference. Betrayed towers cannot switch its preference.
    switchPreference() {
        if (this.betrayed) return;

        this.preference = (this.preference + 1) % 4;
        drawnStatics = false;
    }

    // Checks if the tower can cast active ability.
    // This method does not actually cast the active ability; it just checks availability.
    activeAvailable() {
        return inRound && !this.stunned & this.tier > 3 && globalGameTimer - this.activeTimer >= this.activePeriod && !this.castingActive && !this.activeBlocked;
    }

    // Casts the tower's active ability.
    // Child classes should inherit this method and implement its functionalities.
    active() {
        const usable = this.activeAvailable();

        if (usable && bossEnemyId != null) {
            const boss = enemies.get(bossEnemyId);

            // If active ability can be cast and boss 3 is alive, process its trait option.
            if (boss.kind == "livingfortress") {
                const mve = new VisualEffect("message", "rgb(201, 55, 55)", fps, boss.position, {
                    message: "위험 감지",
                    origin: boss.id,
                    size: boss.size,
                    fontSize: 24,
                    floatDistance: 40
                });
                addVisualEffects(mve);

                boss.changeShield(diffBranch(5000, 10000, 12500));
            }
        }

        if (usable) totalActivePlayed++;

        return usable;
    }

    // Called at the end of each round. Removes casting status of the tower.
    // Child classes may inherit this method if additional work should be done.
    onRoundEnd() {
        this.removeStatusEffect('casting');
    }

    // Draws general tower graphic: status effects of the towers.
    // Child classes should inherit this method and implement its graphic logic.
    // NOTE: Inherited method should take 1 argument, which describes canvas context that the actual tower graphic is drawn.
    //      Since the original method does not take argument, it sounds very awkward. Should fix this later.
    draw() {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        // Draws BETRAYED tower effect.
        if (this.betrayed) {
            ctxd.save();
            ctxd.translate(x, y);

            const auraSize = size * 1.75;
            ctxd.beginPath();
            ctxd.arc(0, 0, auraSize, 0, pi * 2);
            ctxd.closePath();

            const rg = ctxd.createRadialGradient(0, 0, 1, 0, 0, auraSize);
            rg.addColorStop(0, "rgb(255, 0, 0)");
            rg.addColorStop(0.6 + 0.2 * sin(globalTimer / (4 * fps) * pi * 2), "rgb(255, 0, 0)");
            rg.addColorStop(1, "rgba(255, 0, 0)");

            ctxd.fillStyle = rg;
            ctxd.fill();

            ctxd.rotate(globalTimer / (16 * fps) * pi * 2);
            ctxd.fillStyle = "rgb(255, 0, 0)";
            ctxd.lineWidth = 2;

            for (let i = 0; i < 4; i++) {
                ctxd.beginPath();
                ctxd.moveTo(size * 1.2, 0);
                ctxd.lineTo(size * 1.5, size * 0.1);
                ctxd.lineTo(size * 1.8, 0);
                ctxd.lineTo(size * 1.5, -size * 0.1);
                ctxd.closePath();

                ctxd.fill();
                ctxd.stroke();
                
                ctxd.rotate(pi / 2);
            }

            ctxd.restore();
        }

        // Draw stun effect.
        if (this.stunned) {
            ctxdh.save();

            const sx = this.position.x;
            const sy = this.position.y - this.size;
            const w = 24;
            const h = 8;

            ctxdh.beginPath();
            ctxdh.ellipse(sx, sy, w, h, 0, 0, pi * 2);
            ctxdh.closePath();

            ctxdh.strokeStyle = "rgb(103, 97, 16)";
            ctxdh.lineWidth = 2;
            ctxdh.stroke();

            const period = fps * 1.5;
            const t = globalTimer / period * pi * 2;

            const lx = sx + w * cos(t);
            const ly = sy * h + sin(t);
            const ls = 6;

            const rg = ctxdh.createRadialGradient(lx, ly, 2, lx, ly, ls * 2);
            rg.addColorStop(0, "rgba(255, 255, 0)");
            rg.addColorStop(0.7, "rgba(255, 255, 0, 0)");
            rg.addColorStop(1, "rgba(255, 255, 0, 0)");

            ctxdh.fillStyle = rg;
            ctxdh.beginPath();
            ctxdh.arc(lx, ly, ls * 3 / 2, 0, pi * 2);
            ctxdh.closePath();

            ctxdh.fill();
            ctxdh.fill();

            ctxdh.restore();
        }

        // Draw mystery shield count
        if (this.mysteryShield > 0) {
            ctxdh.save();
            ctxdh.translate(x, y);
            ctxdh.globalAlpha = 0.6;
            
            const ss = 9;

            ctxdh.beginPath();
            ctxdh.moveTo(-size - ss, size);
            ctxdh.lineTo(-size, size + ss);
            ctxdh.lineTo(-size + ss, size);
            ctxdh.lineTo(-size + ss, size - 1.5 * ss);
            ctxdh.lineTo(-size - ss, size - 1.5 * ss);
            ctxdh.closePath();
            
            ctxdh.fillStyle = "rgb(241, 22, 165)";
            ctxdh.lineWidth = 2;
            ctxdh.fill();
            ctxdh.stroke();

            ctxdh.globalAlpha = 1;
            drawTextAlignMiddle(String(this.mysteryShield), new Vector2(-size, size - ss / 3), true, 14, "rgb(0, 0, 0)", ctxdh);

            ctxdh.restore();
        }
    }

    // Add status effect `ste` to the tower.
    setStatusEffect(ste) {
        // Combat Force Base ignores Range Down status effect.
        if (this.kind == "support" && ste.kind == "rangedown") return;

        // If `ste` is considered negative, reduce mystery shield count by 1.
        if (negativeStatusNames.has(ste.kind)) {
            let bt = 6e18;
            let ms = null;

            // Find the one with the fastest expiration time.
            for (const [sid, eff] of this.statusEffects) {
                if (eff.kind != "mysteryshield" || eff.count == 0 || eff.expired) continue;
                if (eff.startTime + eff.duration < bt) {
                    bt = min(bt, eff.startTime + eff.duration);
                    ms = eff;
                }
            }

            // Reduce the count. Remove the status effect if its count became 0.
            if (ms != null) {
                if (--ms.count == 0) ms.expired = true;

                return;
            }
        }

        this.statusEffects.set(ste.id, ste);
    }

    // Removes status effects of the tower, following the rule determined by the arguments:
    // `kind`: String. Can be one of the following:
    //      "positive": Remove all positive status effects.
    //      "negative": Remove all negative status effects.
    //      "all": Remove all status effects.
    //      Otherwise: Remove all status effects with its kind equal to `kind`.
    // `origin`: Integer; default value is null.
    //      If origin is not null, only status effects with their origin equal to `origin` are removed.
    //      If origin is null, status effects are removed regardless of their origin.
    removeStatusEffect(kind, origin = null) {
        for (const [sid, ste] of this.statusEffects) {
            if (
                (
                    kind == "positive" && positiveStatusNames.has(ste.kind)
                    || kind == "negative" && negativeStatusNames.has(ste.kind)
                    || kind == "all"
                    || kind == ste.kind
                )
                &&
                (origin == null || origin == ste.origin)
            ) {
                ste.expired = true;
            }
        }
    }

    // Called on successful active ability cast.
    // For the ease of implementation, it is designed so that it is called by child classes.
    // Give cast visual effect, and update its active timer.
    // NOTE that the child classes *MUST* call this method on its successful active ability cast.
    //      -> This design does not seem good; may fix later.
    activeSuccess() {
        this.activeTimer = globalGameTimer;
        const vse = new VisualEffect("radialin", "rgb(255, 255, 0)", fps / 2, this.position, { radius: 100 });
        drawnStatics = false;

        addVisualEffects(vse);
    }

    // Checks if the tower can interact with camouflaged enemies.
    hasCamoDetection() {
        return this.camoDetection || this.permaCamoDetection;
    }
}

// Processes towers. Called every frame.
function processTowers() {
    for (const [tid, tower] of towers) {
        tower.update();

        if (tower.attack()) tower.attackTimer = globalGameTimer;

        if (tower.betrayed) tower.active();
    }
}

// Returns prototype of the tower classes. Used for autosaves.
function getTowerPrototype(kind) {
    switch (kind) {
        case "stone": return new StoneTower;
        case "freeze": return new FreezeTower;
        case "poison": return new PoisonTower;
        case "laser": return new LaserTower;
        case "wave": return new WaveTower;
        case "arcane": return new ArcaneTower;
        case "money": return new MoneyTower;
        case "support": return new SupportTower;
        default: return null;
    }
}

// Generate new tower, given `kind` and position: `cPos`.
function newTower(kind, cPos) {
    const tower = getTowerPrototype(kind);

    if (tower == null) {
        console.error("newTower(): Invalid tower kind:", kind);
        return null;
    }

    tower.position = cPos;
    return tower;
}

// Set initial tower information. Called only once: on game's very beginning.
function initTower() {
    const kinds = towerKinds;

    const keyMapping = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyA", "KeyS", "KeyD", "KeyF"];
    const activeKeyMapping = ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8"];

    for (let i = 0; i < kinds.length; i++) {
        towerKeyMapping.set(keyMapping[i], kinds[i]);
        towerActiveKeyMapping.set(activeKeyMapping[i], kinds[i]);
        towerKindKeyMapping.set(kinds[i], [keyMapping[i], activeKeyMapping[i]]);
        temporaryTowers.set(kinds[i], newTower(kinds[i]));
    }
}

// Draws tower's temporary view.
// Used on drawing basic tower view of lower UI, and temporary view when deploying a new tower.
function drawTowerTempView(kind, position, ctx) {
    const tempTower = temporaryTowers.get(kind);

    if (tempTower == null) {
        console.error("drawTowerTempView(): Invalid tower kind:", kind);
        return;
    }

    tempTower.position = position;
    tempTower.draw(ctx);
}