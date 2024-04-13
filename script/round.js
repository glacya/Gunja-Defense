/*
    round.js - 2023.11.21

    Contains implementation of round functions and round data.
*/

let roundBeginTimer = 0;

const spawnQueueComparator = (a, b) => {
    return a.spawnOffset < b.spawnOffset;
};

// Spawn queue. The game pops entry from here, and spawn the enemy descibed in the popped entry.
const spawnQueue = new PriorityQueue(spawnQueueComparator);

// Map used to contain the round's enemies and their count. Used for pause screen.
const roundEnemyCount = new Map();

// Class representing round enemy patterns.
// The semantic follows:
// - Spawn `count` enemies, of which kind is `kind`, starting from timer `begin`, spawning one by one, every `interval` frame.
class RPattern {
    constructor(kind, count, begin, interval) {
        this.kind = kind;
        this.count = count;
        this.begin = begin;
        this.interval = interval;
    }
}

// Starts round.
function startRound() {
    if (inRound || inPause) return;

    inRound = true;
    drawnStatics = false;
    roundBeginTimer = globalGameTimer;

    spawnQueue.clear();

    // Load patterns from round data, and put them into spawn queue.
    for (const pattern of roundData[currentRound - 1]) {
        for (let i = 0; i < pattern.count; i++) {
            spawnQueue.push(new EnemySpawnPattern(pattern.kind, pattern.begin + i * pattern.interval));
        }
    }
}

// Sets current round to `r`.
function setRound(r) {
    currentRound = r;
    drawnStatics = false;

    // Update round enemy information.
    roundEnemyCount.clear();
    for (const pattern of roundData[currentRound - 1]) {
        if (!roundEnemyCount.has(pattern.kind)) {
            roundEnemyCount.set(pattern.kind, 0);
        }

        roundEnemyCount.set(pattern.kind, roundEnemyCount.get(pattern.kind) + pattern.count);
    }
}

// Ends round, and do cleanups.
function endRound() {
    if (!inRound || inPause) return false;

    // If spawn queue is empty, and there are no enemies left in the world, end the round.
    // And, the player must have HP more than zero.
    if (spawnQueue.empty() && enemies.size == 0 && playerHp > 0) {
        inRound = false;
        drawnStatics = false;
        menuAlpha = 0;

        // Make projectiles, visual effects, portals expired, and process on round end effect of the towers.
        for (const [pid, proj] of projs) proj.expired = true;
        for (const [tid, tower] of towers) tower.onRoundEnd();
        for (const [pid, portal] of portals) portal.expired = true;
        for (const [vid, vse] of visualEffects) {
            if (vse.kind != "bossdead" || vse.kind != "message" && vse.kind != "portalclose") {
                vse.expired = true;
            }
        }

        // Process game by 1 frame to eliminate all expired elements from the screen.
        processInGame();

        // If the user completed the last round, translate to victory screen.
        if (currentRound == 50) {
            scoreCache = null;
            currentRound = 9999;
            victoryTimer = globalTimer;
            menuKind = VICT;
            inMenu = true;

            const vse = new VisualEffect("gameend", null, fps / 2, null, null);
            addVisualEffects(vse);

            return;
        }

        // The player gains reward for completing a round.
        changePlayerGold(100 + 5 * currentRound);

        // Increment round.
        setRound(currentRound + 1);

        // Autosave every round. And make checkpoint if the user completed every 10th round.
        saveProgress("autosave");

        if (currentRound % 10 == 1) saveProgress("checkpoint");

        return true;
    }

    return false;
}

// Round description array.
let roundDescription = null;

// Sets round description array regarding the game difficulty.
function setRoundDescription() {
    roundDescription = [];
    for (let i = 0; i < 50; i++) {
        roundDescription.push(`Tooltip ${i + 1}`);
    }
}

// Round data array. May migrate this to external file later.
const roundData = [
    [   // 1-1
        new RPattern("basic", 20, 0, 30)
    ],
    [   // 1-2
        new RPattern("basic", 30, 0, 20)
    ],
    [   // 1-3
        new RPattern("basic", 20, 0, 20),
        new RPattern("giant", 5, 0, 80)
    ],
    [   // 1-4
        new RPattern("basic", 40, 0, 35),
        new RPattern("tinysphere", 30, 0, 50),
    ],
    [   // 1-5
        new RPattern("tinysphere", 60, 0, 25)
    ],
    [   // 1-6
        new RPattern("basic", 30, 0, 30),
        new RPattern("giant", 10, 0, 60),
        new RPattern("fly", 20, 0, 45)
    ],
    [   // 1-7
        new RPattern("giant", 20, 15, 40),
        new RPattern("tinysphere", 30, 0, 40),
        new RPattern("exercisestudent", 20, 400, 20)
    ],
    [   // 1-8
        new RPattern("giant", 40, 0, 30),
        new RPattern("exercisestudent", 20, 0, 60)
    ],
    [   // 1-9
        new RPattern("basic", 50, 0, 32),
        new RPattern("fly", 30, 0, 55),
        new RPattern("giant", 30, 0, 50),
        new RPattern("tinysphere", 30, 30, 50),
        new RPattern("exercisestudent", 30, 100, 50)
    ],
    [   // 1-10
        new RPattern("behemoth", 1, 240, 20),
        new RPattern("basic", 140, 0, 15),
        new RPattern("giant", 35, 0, 60),
        new RPattern("tinysphere", 35, 30, 60)
    ],
    [   // 2-1
        new RPattern("hardbasic", 40, 0, 20),
        new RPattern("fly", 15, 0, 60)
    ],
    [   // 2-2
        new RPattern("shielded", 10, 0, 90),
        new RPattern("hardbasic", 30, 15, 30),
        new RPattern("fly", 60, 0, 15)
    ],
    [   // 2-3
        new RPattern("rogue", 40, 0, 20),
        new RPattern("fly", 30, 0, 30),
        new RPattern("shielded", 20, 0, 40)
    ],
    [   // 2-4
        new RPattern("giant", 40, 0, 20),
        new RPattern("shielded", 30, 10, 30),
        new RPattern("poisonstudent", 15, 0, 60)
    ],
    [   // 2-5
        new RPattern("hardbasic", 40, 0, 20),
        new RPattern("shielded", 30, 0, 30),
        new RPattern("poisonstudent", 30, 0, 30)
    ],
    [   // 2-6
        new RPattern("tinysphere", 40, 0, 30),
        new RPattern("hardbasic", 60, 0, 20),
        new RPattern("defsphere", 30, 150, 30)
    ],
    [   // 2-7
        new RPattern("shielded", 60, 0, 20),
        new RPattern("hardbasic", 60, 0, 20),
        new RPattern("poisonstudent", 30, 300, 30),
        new RPattern("rogue", 10, 0, 120)
    ],
    [   // 2-8
        new RPattern("rogue", 60, 0, 20),
        new RPattern("fly", 60, 0, 20),
        new RPattern("defsphere", 40, 200, 20)
    ],
    [   // 2-9
        new RPattern("hardbasic", 40, 0, 30),
        new RPattern("fly", 80, 0, 15),
        new RPattern("shielded", 40, 0, 30),
        new RPattern("rogue", 60, 0, 20),
        new RPattern("defsphere", 20, 0, 60)
    ],
    [   // 2-10
        new RPattern("trickster", 1, 300, 0),
        new RPattern("hardbasic", 60, 0, 30),
        new RPattern("fly", 60, 0, 30),
        new RPattern("shielded", 30, 0, 30),
        new RPattern("poisonstudent", 30, 0, 30),
        new RPattern("rogue", 30, 900, 30),
        new RPattern("defsphere", 15, 900, 60)
    ],
    [   // 3-1
        new RPattern("elitebasic", 30, 0, 40),
        new RPattern("fly", 90, 300, 10),
        new RPattern("tinysphere", 100, 0, 10)
    ],
    [   // 3-2
        new RPattern("elitebasic", 50, 0, 30),
        new RPattern("exercisemaster", 20, 300, 60),
        new RPattern("shielded", 50, 300, 18)
    ],
    [   // 3-3
        new RPattern("fly", 100, 0, 10),
        new RPattern("stunfly", 20, 700, 40),
        new RPattern("elitebasic", 60, 300, 15),
        new RPattern("rogue", 100, 0, 15)
    ],
    [   // 3-4
        new RPattern("elitebasic", 50, 0, 30),
        new RPattern("exercisemaster", 20, 300, 60),
        new RPattern("healer", 3, 300, 180),
        new RPattern("stunfly", 30, 0, 40)
    ],
    [   // 3-5
        new RPattern("exercisemaster", 20, 300, 60),
        new RPattern("defsphere", 18, 0, 30),
        new RPattern("shadower", 25, 0, 60),
        new RPattern("stunfly", 60, 0, 20)
    ],
    [   // 3-6
        new RPattern("elitebasic", 40, 0, 30),
        new RPattern("spinner", 20, 300, 30),
        new RPattern("basic", 200, 0, 6),
        new RPattern("hardbasic", 100, 0, 12)
    ],
    [   // 3-7
        new RPattern("spinner", 30, 0, 40),
        new RPattern("exercisemaster", 30, 300, 30),
        new RPattern("shadower", 40, 0, 30),
        new RPattern("stunfly", 50, 0, 24)
    ],
    [   // 3-8
        new RPattern("spinner", 40, 0, 25),
        new RPattern("elitegiant", 5, 600, 150),
        new RPattern("shadower", 10, 0, 30),
        new RPattern("shadower", 10, 900, 30),
        new RPattern("healer", 3, 300, 400)
    ],
    [   // 3-9
        new RPattern("elitebasic", 60, 0, 25),
        new RPattern("exercisemaster", 20, 300, 60),
        new RPattern("shadower", 10, 0, 60),
        new RPattern("shadower", 10, 900, 60),
        new RPattern("stunfly", 60, 0, 30),
        new RPattern("healer", 10, 150, 120),
        new RPattern("elitegiant", 5, 0, 100),
        new RPattern("spinner", 50, 0, 30)
    ],
    [   // 3-10
        new RPattern("livingfortress", 1, 300, 60),
        new RPattern("redcrystal", 0, 0, 60),
        new RPattern("bluecrystal", 0, 0, 60),
        new RPattern("greencrystal", 0, 0, 60),
        new RPattern("elitebasic", 150, 0, 40),
        new RPattern("healer", 10, 600, 60),
        new RPattern("healer", 10, 1800, 60),
        new RPattern("fly", 50, 2000, 40),
        new RPattern("stunfly", 60, 1100, 20),
        new RPattern("stunfly", 60, 2600, 20),
        new RPattern("shadower", 20, 1500, 30),
        new RPattern("shadower", 20, 4000, 30),
        new RPattern("elitegiant", 12, 0, 200),
        new RPattern("elitegiant", 13, 3500, 200)
    ],
    [   // 4-1
        new RPattern("endurer", 30, 0, 20),
        new RPattern("endurer", 30, 800, 20),
        new RPattern("elitebasic", 60, 300, 20),
        new RPattern("potentseed", 15, 0, 100),
        new RPattern("waterflower", 0, 0, 0),
        new RPattern("ironflower", 0, 0, 0),
        new RPattern("windflower", 0, 0, 0),
        new RPattern("poisonstudent", 70, 0, 20)
    ],
    [   // 4-2
        new RPattern("stunfly", 200, 0, 12),
        new RPattern("endurer", 40, 0, 20),
        new RPattern("endurer", 40, 1400, 20),
        new RPattern("potentseed", 12, 0, 80),
        new RPattern("potentseed", 13, 1300, 80),
        new RPattern("waterflower", 0, 0, 0),
        new RPattern("ironflower", 0, 0, 0),
        new RPattern("windflower", 0, 0, 0),
        new RPattern("shadower", 40, 0, 25),
        new RPattern("healer", 10, 0, 25),
        new RPattern("elitebasic", 40, 800, 30),
        new RPattern("eliterogue", 40, 1200, 30)
    ],
    [   // 4-3
        new RPattern("flareguard", 25, 0, 40),
        new RPattern("potentseed", 20, 300, 40),
        new RPattern("waterflower", 0, 0, 0),
        new RPattern("ironflower", 0, 0, 0),
        new RPattern("windflower", 0, 0, 0),
        new RPattern("spinner", 100, 0, 15),
        new RPattern("eliterogue", 40, 600, 20),
        new RPattern("poisonmaster", 20, 200, 60)
    ],
    [   // 4-4
        new RPattern("randomsphere", 20, 0, 20),
        new RPattern("randomsphere", 20, 700, 20),
        new RPattern("randomsphere", 20, 1400, 20),
        new RPattern("endurer", 60, 600, 20),
        new RPattern("poisonmaster", 20, 1200, 30),
        new RPattern("flareguard", 30, 0, 60),
        new RPattern("rogue", 200, 0, 10),
    ],
    [   // 4-5
        new RPattern("eliteshielded", 20, 0, 100),
        new RPattern("flareguard", 40, 0, 30),
        new RPattern("randomsphere", 60, 400, 25),
        new RPattern("elitegiant", 20, 400, 30),
        new RPattern("giant", 150, 0, 14),
        new RPattern("defsphere", 50, 1200, 14)
    ],
    [   // 4-6
        new RPattern("summoner", 10, 0, 60),
        new RPattern("redcrystal", 0, 0, 0),
        new RPattern("bluecrystal", 0, 0, 0),
        new RPattern("greencrystal", 0, 0, 0),
        new RPattern("stunfly", 120, 0, 20),
        new RPattern("endurer", 60, 400, 20),
        new RPattern("potentseed", 15, 800, 70),
        new RPattern("waterflower", 0, 0, 0),
        new RPattern("ironflower", 0, 0, 0),
        new RPattern("windflower", 0, 0, 0),
        new RPattern("eliterogue", 40, 0, 20)
    ],
    [   // 4-7
        new RPattern("summoner", 20, 0, 50),
        new RPattern("redcrystal", 0, 0, 0),
        new RPattern("bluecrystal", 0, 0, 0),
        new RPattern("greencrystal", 0, 0, 0),
        new RPattern("shielded", 100, 0, 10),
        new RPattern("eliteshielded", 30, 900, 30),
        new RPattern("poisonmaster", 30, 600, 30),
        new RPattern("flareguard", 50, 1000, 20),
        new RPattern("elitehealer", 5, 0, 400)
    ],
    [   // 4-8
        new RPattern("immsphere", 3, 0, 800),
        new RPattern("eliteshielded", 30, 0, 20),
        new RPattern("elitehealer", 5, 0, 300),
        new RPattern("endurer", 90, 0, 20),
        new RPattern("stunfly", 60, 300, 5),
        new RPattern("stunfly", 60, 900, 5),
        new RPattern("stunfly", 60, 1500, 5),
        new RPattern("summoner", 10, 0, 100),
        new RPattern("redcrystal", 0, 0, 0),
        new RPattern("bluecrystal", 0, 0, 0),
        new RPattern("greencrystal", 0, 0, 0)
    ],
    [   // 4-9
        new RPattern("endurer", 75, 0, 16),
        new RPattern("endurer", 75, 1800, 16),
        new RPattern("potentseed", 10, 0, 60),
        new RPattern("potentseed", 10, 900, 60),
        new RPattern("potentseed", 10, 1800, 60),
        new RPattern("potentseed", 10, 2700, 60),
        new RPattern("waterflower", 0, 0, 0),
        new RPattern("ironflower", 0, 0, 0),
        new RPattern("windflower", 0, 0, 0),
        new RPattern("immsphere", 5, 0, 700),
        new RPattern("summoner", 20, 0, 100),
        new RPattern("redcrystal", 0, 0, 0),
        new RPattern("bluecrystal", 0, 0, 0),
        new RPattern("greencrystal", 0, 0, 0),
        new RPattern("eliteshielded", 40, 0, 30),
        new RPattern("poisonmaster", 40, 800, 30),
        new RPattern("flareguard", 40, 1500, 30),
        new RPattern("eliterogue", 40, 2400, 20),
        new RPattern("elitehealer", 8, 0, 400)
    ],
    [   // 4-10
        new RPattern("mobmanager", 1, 300, 0),
        new RPattern("endurer", 25, 0, 35),
        new RPattern("endurer", 25, 1400, 35),
        new RPattern("endurer", 25, 2800, 35),
        new RPattern("endurer", 25, 4200, 35),
        new RPattern("endurer", 25, 5600, 35),
        new RPattern("potentseed", 20, 0, 45),
        new RPattern("potentseed", 20, 1600, 45),
        new RPattern("potentseed", 20, 3200, 45),
        new RPattern("waterflower", 0, 0, 0),
        new RPattern("ironflower", 0, 0, 0),
        new RPattern("windflower", 0, 0, 0),
        new RPattern("immsphere", 40, 0, 100),
        new RPattern("poisonmaster", 60, 3000, 30),
        new RPattern("flareguard", 60, 2000, 30),
        new RPattern("eliteshielded", 20, 0, 40),
        new RPattern("eliteshielded", 20, 6000, 40),
        new RPattern("eliterogue", 40, 1000, 20),
        new RPattern("eliterogue", 40, 5000, 20),
        new RPattern("elitehealer", 8, 0, 400),
        new RPattern("summoner", 30, 0, 250),
        new RPattern("redcrystal", 0, 0, 0),
        new RPattern("bluecrystal", 0, 0, 0),
        new RPattern("greencrystal", 0, 0, 0)
    ],
    [   // 5-1
        new RPattern("immsphere", 20, 0, 60),
        new RPattern("stunfly", 120, 0, 10),
        new RPattern("elitefly", 40, 300, 20),
        new RPattern("accelerator", 15, 0, 10),
        new RPattern("accelerator", 15, 500, 10),
        new RPattern("accelerator", 15, 1000, 10),
        new RPattern("recovercube", 10, 600, 30)
    ],
    [   // 5-2
        new RPattern("accelerator", 70, 450, 25),
        new RPattern("elitehealer", 20, 0, 50),
        new RPattern("painsphere", 15, 0, 80),
        new RPattern("recovercube", 20, 1200, 50),
        new RPattern("summoner", 40, 900, 20),
        new RPattern("redcrystal", 0, 0, 0),
        new RPattern("bluecrystal", 0, 0, 0),
        new RPattern("greencrystal", 0, 0, 0)
    ],
    [   // 5-3
        new RPattern("accelerator", 80, 0, 30),
        new RPattern("painsphere", 35, 0, 20),
        new RPattern("painsphere", 35, 1600, 20),
        new RPattern("mightysphere", 20, 1200, 60),
        new RPattern("elitefly", 50, 600, 20),
        new RPattern("eliteshielded", 80, 800, 15),
        new RPattern("flareguard", 60, 0, 20)
    ],
    [   // 5-4
        new RPattern("silentsoul", 15, 0, 30),
        new RPattern("silentsoul", 15, 2000, 30),
        new RPattern("painsphere", 25, 0, 20),
        new RPattern("painsphere", 25, 1500, 20),
        new RPattern("mightysphere", 20, 0, 30),
        new RPattern("mightysphere", 20, 1800, 30),
        new RPattern("recovercube", 10, 0, 10),
        new RPattern("recovercube", 10, 1200, 10),
        new RPattern("recovercube", 10, 2400, 10),
        new RPattern("elitesummoner", 15, 0, 160),
        new RPattern("dawnshard", 0, 0, 0),
        new RPattern("dayshard", 0, 0, 0),
        new RPattern("sunsetshard", 0, 0, 0)
    ],
    [   // 5-5
        new RPattern("accelerator", 50, 0, 10),
        new RPattern("accelerator", 50, 1000, 10),
        new RPattern("accelerator", 50, 2000, 10),
        new RPattern("elitefly", 30, 0, 30),
        new RPattern("elitefly", 30, 1500, 30),
        new RPattern("mightysphere", 10, 600, 160),
        new RPattern("silentsoul", 20, 0, 40),
        new RPattern("silentsoul", 20, 1500, 40),
        new RPattern("immsphere", 30, 0, 80),
        new RPattern("elitesummoner", 25, 0, 95),
        new RPattern("dawnshard", 0, 0, 0),
        new RPattern("dayshard", 0, 0, 0),
        new RPattern("sunsetshard", 0, 0, 0)
    ],
    [   // 5-6
        new RPattern("elitesummoner", 50, 0, 40),
        new RPattern("dawnshard", 0, 0, 0),
        new RPattern("dayshard", 0, 0, 0),
        new RPattern("sunsetshard", 0, 0, 0),
        new RPattern("painsphere", 40, 0, 10),
        new RPattern("painsphere", 40, 1000, 10),
        new RPattern("recovercube", 50, 500, 30),
        new RPattern("summoner", 100, 0, 20),
        new RPattern("redcrystal", 0, 0, 0),
        new RPattern("bluecrystal", 0, 0, 0),
        new RPattern("greencrystal", 0, 0, 0),
        new RPattern("stunfly", 200, 0, 10),
        new RPattern("randomsphere", 100, 0, 20)
    ],
    [   // 5-7
        new RPattern("blackknight", 30, 0, 100),
        new RPattern("accelerator", 40, 0, 20),
        new RPattern("accelerator", 40, 1500, 20),
        new RPattern("silentsoul", 60, 0, 35),
        new RPattern("mightysphere", 10, 0, 60),
        new RPattern("mightysphere", 10, 1000, 60),
        new RPattern("mightysphere", 10, 2000, 60),
        new RPattern("elitefly", 70, 250, 25),
        new RPattern("elitehealer", 30, 750, 50),
        new RPattern("eliterogue", 20, 1750, 30)
    ],
    [   // 5-8
        new RPattern("blackknight", 50, 0, 50),
        new RPattern("recovercube", 22, 0, 30),
        new RPattern("recovercube", 23, 900, 30),
        new RPattern("poisonmaster", 30, 0, 35),
        new RPattern("poisonmaster", 30, 1400, 35),
        new RPattern("eliteshielded", 100, 0, 26),
        new RPattern("elitesummoner", 70, 0, 35),
        new RPattern("dawnshard", 0, 0, 0),
        new RPattern("dayshard", 0, 0, 0),
        new RPattern("sunsetshard", 0, 0, 0),
    ],
    [   // 5-9
        new RPattern("accelerator", 100, 0, 30),
        new RPattern("elitefly", 50, 0, 30),
        new RPattern("elitefly", 50, 3500, 30),
        new RPattern("mightysphere", 10, 750, 60),
        new RPattern("mightysphere", 10, 2500, 60),
        new RPattern("mightysphere", 10, 4250, 60),
        new RPattern("painsphere", 50, 0, 10),
        new RPattern("recovercube", 50, 3000, 10),
        new RPattern("elitesummoner", 100, 0, 50),
        new RPattern("dawnshard", 0, 0, 0),
        new RPattern("dayshard", 0, 0, 0),
        new RPattern("sunsetshard", 0, 0, 0),
        new RPattern("silentsoul", 20, 0, 60),
        new RPattern("silentsoul", 20, 2000, 60),
        new RPattern("silentsoul", 20, 4000, 60),
        new RPattern("blackknight", 50, 0, 10)
    ],
    [   // 5-10
        new RPattern("terminalform", 1, 300, 1),
        new RPattern("blackknight", 0, 0, 0),
        new RPattern("pastclock", 0, 0, 0),
        new RPattern("futureclock", 0, 0, 0)
    ]
];