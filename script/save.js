/* 
    save.js - 2024.03.03

    Implementation of records, mid-save, and scores.
*/

const recordComparator = (r1, r2) => {
    if (r1.score == r2.score) return r1.deadRound > r2.deadRound;
    else return r1.score > r2.score;
};

let playerRecords = [];

// Class representing game records.
class Record {
    constructor(name, deadRound, score, difficulty, timer, version) {
        this.name = name;
        this.deadRound = deadRound;
        this.score = score;
        this.difficulty = difficulty;
        this.timer = toTimeString(timer);
        this.version = version;
    }
}

// Class representing score entry. Used for calculating scores.
class ScoreEntry {
    constructor(name, score, desc) {
        this.name = name;
        this.score = floor(score);
        this.desc = desc;
    }
}

// Class representing game autosaves.
class GameProgress {
    constructor() {
        this.towerInfo = [];
        this.towerStatus = [];
        this.gold = 0;
        this.hp = 0;
        this.round = 1;
        this.globalGameTimer = 0;
        this.globalTimer = 0;
        this.difficulty = NORMAL;
        this.totalGeneratedGold = 0;
        this.totalTowersPlaced = 0;
        this.totalTowersSold = 0;
        this.totalActivePlayed = 0;
        this.totalTowerUpgrades = 0;
        this.totalTowerMaxUpgrades = 0;
        this.reachedTranscendent = false;
    }

    // Save entire data of current round.
    save() {
        this.gold = playerGold;
        this.hp = playerHp;
        this.round = currentRound;
        this.globalGameTimer = globalGameTimer;
        this.globalTimer = globalTimer;
        this.difficulty = difficulty;
        this.totalGeneratedGold = totalGeneratedGold;
        this.totalTowersPlaced = totalTowersPlaced;
        this.totalTowersSold = totalTowersSold;
        this.totalActivePlayed = totalActivePlayed;
        this.totalTowerUpgrades = totalTowerUpgrades;
        this.totalTowerMaxUpgrades = totalTowerMaxUpgrades;
        this.reachedTranscendent = reachedTranscendent;

        for (const [tid, tower] of towers) {
            this.towerInfo.push(tower);

            let lis = [];
            for (const [sid, ste] of tower.statusEffects) {
                lis.push(ste);
            }

            this.towerStatus.push(lis);
        }
    }

    // Apply data loaded from saved progress.
    load() {
        gameDifficulty = this.difficulty;
        initGlobals();

        playerGold = this.gold;
        playerHp = this.hp;
        setRound(this.round);
        globalGameTimer = this.globalGameTimer;
        globalTimer = this.globalTimer;
        totalGeneratedGold = this.totalGeneratedGold;
        totalTowersSold = this.totalTowersSold;
        totalTowersPlaced = this.totalTowersPlaced;
        totalActivePlayed = this.totalActivePlayed;
        totalTowerUpgrades = this.totalTowerUpgrades;
        totalTowerMaxUpgrades = this.totalTowerMaxUpgrades;
        reachedTranscendent = this.reachedTranscendent;

        setRoundDescription();

        let tid = 0;
        let stmax = 0;
        let idx = 0;

        this.towerInfo.forEach((tower) => {
            const target = getTowerPrototype(tower.kind);

            if (!target) return;

            const nt = Object.assign(target, tower);
            tid = max(tid, nt.id);

            nt.position = Object.assign(new Vector2, nt.position);
            nt.lastDirection = Object.assign(new Vector2, nt.lastDirection);
            nt.statusEffects = new Map();

            this.towerStatus[idx].forEach((e) => {
                const ste = Object.assign(getStatusPrototype(e.kind), e);
                nt.statusEffects.set(ste.id, ste);

                stmax = max(stmax, ste.id);
            });

            if (nt.preference == undefined) nt.preference = TOWER_PREF_FIRST;
            towers.set(nt.id, nt);
            idx++;
        });

        towerId = tid + 1;
        steId = stmax + 1;

        const vse = new VisualEffect("gamestart", null, fps / 2, null, null);
        addVisualEffects(vse);

        const dwork = new DelayedWork(fps / 2, 0, () => {menuAlpha = 0;}, []);
        addDelayedWorks(dwork);
    }
}

// Calculates score.
function calculateScore() {
    let scoreEntries = [];
    let totalScore = 0;

    // Victory score: 5000 points.
    if (currentRound > 50) {
        // It is directly handled in ui.js.
        totalScore += 5000;
    }

    // Completed round score = (100 * round).
    const cRound = min(51, currentRound) - 1;
    scoreEntries.push(new ScoreEntry(`${cRound}개 라운드 클리어`, 100 * cRound, "1개 라운드를 클리어할 때마다 100점을 받습니다."));

    // Playtime bonus score.
    const totalTime = currentRound > 50 ? victoryTimer : deadTimer;
    let timeScore = min(1000, 2000 * Math.exp(-floor(totalTime / fps) * Math.log(2) / 600));
    if (currentRound <= 50) timeScore *= (cRound / 50);

    const timeScoreDesc = "시간 보너스 점수입니다. 40분 이하일 때 최고 점수인 1000점을 받고, 이후 10분이 지날 때마다 점수가 절반으로 줄어듭니다. \n 게임에서 패배한 경우 점수가 클리어한 라운드 수에 비례하여 낮아집니다.";
    const te = new ScoreEntry(`플레이 시간 보너스(${toTimeString(totalTime)})`, timeScore, timeScoreDesc);
    if (te.score > 0) scoreEntries.push(te);

    // Generated gold bonus score.
    if (totalGeneratedGold > 0) {
        const ge = new ScoreEntry(`총 ${totalGeneratedGold}골드 생산함`, min(750, 0.005 * totalGeneratedGold), "골드 생산량의 0.5%만큼 점수를 얻습니다. (최대 750점)");
        if (ge.score > 0) scoreEntries.push(ge);

        if (totalGeneratedGold >= 30000) {
            const g1 = new ScoreEntry("부자", 150, "골드 관리 공사로 30000골드를 생산했습니다. 짭짤한데요!");
            scoreEntries.push(g1);
        }

        if (totalGeneratedGold >= 300000) {
            const g2 = new ScoreEntry("재벌", 600, "골드 관리 공사로 300000골드를 생산했습니다. 돈이 썩어 넘치는군요!!");
            scoreEntries.push(g2);
        }
    }

    // HP score
    const hpRatio = fitInterval(playerHp / diffBranch(200, 150, 100), 0, 1);
    const hpe = new ScoreEntry(`${(hpRatio * 100).toFixed(1)}%의 HP 남김`, 1000 * hpRatio, "남은 HP 보너스 점수입니다. 1%마다 10점을 얻습니다.");
    if (hpe.score > 0) {
        scoreEntries.push(hpe);

        if (playerHp == diffBranch(200, 150, 100)) {
            const hpfe = new ScoreEntry("완벽한 방어", 1000, "모든 적을 놓치지 않고 완벽히 방어했습니다.");
            scoreEntries.push(hpfe);
        }
    }

    // Active ability cast bonus
    const ace = new ScoreEntry(`액티브 스킬을 ${totalActivePlayed}회 사용함`, min(250, sqrt(totalActivePlayed) * 250 / sqrt(1000)),
        "액티브 스킬을 많이 사용할 수록 더 많은 보너스 점수를 얻습니다. (최대 250점)");
    
    if (ace.score > 0) {
        scoreEntries.push(ace);

        if (totalActivePlayed >= 1000) {
            const hpfe = new ScoreEntry("키보드 브레이커", 250, "액티브 스킬을 1000번 이상 사용했습니다. 키보드는 멀쩡한가요..?");
            scoreEntries.push(hpfe);
        }
    }

    // Tower placement bonus
    const tpe = new ScoreEntry(`타워를 ${totalTowersPlaced}번 배치함`, 250 * sin(min(250, totalTowersPlaced) * pi / 500), 
        "타워를 배치한 횟수에 대한 점수입니다. 많이 배치할 수록 더 많은 보너스 점수를 얻습니다. (최대 250점)");
    
    if (tpe.score > 0) {
        scoreEntries.push(tpe);

        if (totalTowersPlaced >= 100) {
            const tpex = new ScoreEntry("작업의 왕", 250, "타워를 100번 이상 배치했습니다. 다다익선이라고들 하죠.");
            scoreEntries.push(tpe);
        }
    }

    // Tower sell bonus
    const sellScore = (totalTowersSold <= 50 ? 250 : 250 / (1 + Math.exp((totalTowersSold - 100) / 6)));
    const sele = new ScoreEntry(`타워를 ${totalTowersSold}번 판매함`, sellScore, "타워를 판매한 횟수에 대한 점수입니다. 타워를 많이 판매할 수록 보너스 점수가 줄어듭니다. (최대 250점)");
    if (sele.score > 0) {
        scoreEntries.push(sele);

        if (totalTowersSold >= 100) {
            const selp = new ScoreEntry("세일즈맨", 100, "타워를 100번 이상 판매했습니다. 많이 팔기는 했지만 손해본 것 같은데요..");
            scoreEntries.push(selp);
        }
        else if (currentRound > 50 && totalTowersSold <= 25) {
            const selp = new ScoreEntry("존버는 승리한다", 500, "타워를 25번 이하로 판매했습니다. 팔지 않고 버티면 언젠간 오르겠죠.");
            scoreEntries.push(selp);
        }
    }

    // Tower upgrade bonus
    const ups = new ScoreEntry(`타워를 ${totalTowerUpgrades}번 업그레이드함`, min(250, 300 + (-50000 / 3 / (totalTowerUpgrades + 200 / 3))),
        "타워를 업그레이드한 횟수에 대한 점수입니다. 타워를 많이 업그레이드할 수록 더 많은 보너스 점수를 받습니다. (최대 250점)");
    
    if (ups.score > 0) {
        scoreEntries.push(ups);

        if (totalTowerUpgrades >= 400) {
            const selp = new ScoreEntry("진화론자", 250, "타워를 400번 이상 업그레이드했습니다. 발전하는 것은 좋은거죠.");
            scoreEntries.push(selp);
        }
        else if (currentRound > 50 && totalTowerUpgrades <= 100) {
            const selp = new ScoreEntry("소수 정예", 250, "타워를 100번 이하로 업그레이드했습니다. 강한 몇 개만 있어도 이길 수 있군요.");
            scoreEntries.push(selp);
        }
    }

    // Tower tier-5 upgrade bonus
    const upmax = new ScoreEntry(`타워를 5단계로 ${totalTowerMaxUpgrades}번 업그레이드함`, min(250, 250 * totalTowerMaxUpgrades / 25),
        "타워를 최고 단계로 업그레이드한 횟수에 대한 점수입니다. 더 많이 업그레이드할 수록 더 많은 보너스 점수를 받습니다. (최대 250점)");
    
    if (upmax.score > 0) {
        scoreEntries.push(upmax);

        if (totalTowerMaxUpgrades >= 25) {
            const selp = new ScoreEntry("별이 지키는 곳", 250, "5단계 타워를 25번 이상 업그레이드했습니다. 별들이 지켜준다면 안전합니다.");
            scoreEntries.push(selp);
        }
    }
    
    // If the user had never upgraded any tier-5 towers, then there is a huge bonus!!
    if (currentRound > 50 & totalTowerMaxUpgrades == 0) {
        const selp = new ScoreEntry("영웅은 필요 없어", 2500, "5단계 타워를 단 하나도 배치하지 않고 클리어했습니다. 어떻게 한 건가요?!");
        scoreEntries.push(selp);
    }

    // Bonus score for examining transcendent tier-5 Arcane Pedestal.
    if (reachedTranscendent) {
        const tre = new ScoreEntry("정점", 500, "5단계 마력의 제단의 초월한 모습을 보았습니다.");
        scoreEntries.push(tre);
    }

    // Total score!
    for (const e of scoreEntries) {
        totalScore += e.score;
    }

    // Give difficulty bonus to total score.
    totalScore = floor(totalScore * diffBranch(1.0, 1.5, 2.0));

    return { entries: scoreEntries, total: totalScore };
}

// Eliminates all records. Intended for testing.
function resetRecord() {
    window.localStorage.removeItem("records");
}

// Eliminates records that satisfies filter(record) == true.
function removeRecord(filter) {
    let records = JSON.parse(window.localStorage.getItem("records"));
    let survived = [];

    records.forEach((record) => {
        if (!filter(record)) survived.push(record);
    });

    window.localStorage.setItem("records", JSON.stringify((survived)));
}

// Loads record and puts records into array `playerRecords`.
function loadRecord() {
    let arr = [];
    let records = JSON.parse(window.localStorage.getItem("records"));

    if (records == null) {
        playerRecords = [];
        return;
    }

    records.forEach((e) => {
        const r = Object.assign(new Record, e);

        if (r.version == unefined) {
            r.version = "v0.5.0";
        }

        arr.push(r);
    });

    playerRecords = sort(arr, recordComparator);
}

// Helper function for getting input from player.
// Used to fetch record name from user.
function getRecordName() {
    let name = prompt("기록에 남길 이름을 입력해주세요. (최대 16글자)");

    if (name == null) return null;

    name = name.substring(0, 16).trim();

    if (name.length == 0) return "이름없는 군인";
    else return name;
}

// Saves current game's result to records.
function saveRecord() {
    removeProgress("autosave");
    removeProgress("checkpoint");

    let recordArray = JSON.parse(window.localStorage.getItem("records"));

    if (!recordArray) recordArray = [];

    const name = getRecordName();

    if (name == null) return;

    const score = calculateScore().total;
    const timer = currentRound > 50 ? victoryTimer : deadTimer;
    const record = new Record(name, currentRound, score, gameDifficulty, timer, gameVersion.split(" ")[0]);

    recordArray.push(record);
    window.localStorage.setItem("records", JSON.stringify(recordArray));
}

// Deletes autosave of the given `kind`.
function removeProgress(kind) {
    window.localStorage.removeItem(kind);
}

// Loads autosave of the given `kind` and apply it to the game.
// Returns true if load was successful, false if load failed.
function loadProgress(kind) {
    const prog = window.localStorage.getItem(kind);

    if (!prog) return false;

    const gp = Object.assign(new GameProgress, JSON.parse(prog));
    gp.load();

    return true;
}

// Saves current game data to autosave of the given `kind`.
function saveProgress(kind) {
    const prog = new GameProgress();
    prog.save();

    window.localStorage.setItem(kind, JSON.stringify(prog));
}