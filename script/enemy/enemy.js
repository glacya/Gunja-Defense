/* 
    enemy.js - 2023.11.14

    Implementation of general functionalities of enemies.
*/

// A map that contains all enemies in the world.
const enemies = new Map();

let enemyId = 100000000;
let bossEnemyId = null;

// A map that contains enemy sample data. Used for pause screen information.
const enemyDataset = new Map();
const enemyKinds = [
    "basic", "giant", "tinysphere", "fly", "exercisestudent", "behemoth",
    "hardbasic", "shielded", "poisonstudent", "rogue", "defsphere", "trickster",
    "elitebasic", "exercisemaster", "healer", "stunfly", "shadower", "spinner", "elitegiant", "redcrystal", "bluecrystal", "greencrystal", "livingfortress",
    "immsphere", "endurer", "potentseed", "waterflower", "ironflower", "windflower", "flareguard", "eliteshielded",
        "eliterogue", "randomsphere", "poisonmaster", "summoner", "elitehealer", "mobmanager",
    "elitesummoner", "dawnshard", "dayshard", "sunsetshard", "accelerator", "elitefly", "mightysphere", "painsphere", "recovercube", "silentsoul",
        "blackknight", "futureclock", "pastclock", "terminalform"
];

// Initializes enemy sample data.
function initEnemyData() {
    enemyDataset.clear();

    for (const id of enemyKinds) {
        const sample = generateEnemy(id);

        sample.size = min(sample.size, 40);
        enemyDataset.set(id, sample);
    }
}

// Class representing spawning pattern of enemies.
class EnemySpawnPattern {
    constructor(kind, spawnOffset) {
        this.kind = kind;
        this.spawnOffset = spawnOffset;     // On `spawnOffset` frames after the beginning of the round, this enemy is spawned.
    }
}

// Class representing enemy.
class Enemy {
    constructor(pos, property) {
        this.id = enemyId++;
        this.kind = property.kind;
        this.position = pos;
        this.hp = property.hp;
        this.maxHp = property.hp;
        this.speed = property.speed;
        this.size = property.size;

        this.shield = 0;
        this.mysteryShield = 0;

        this.reward = property.reward;
        this.damageToPlayer = property.dmg;
        this.dead = false;
        this.expired = false;
        this.onDeath = new Map();

        this.onDeath.set("default", proprety.onDeath);

        this.onSpawn = property.onSpawn;
        this.onPeriod = property.onPeriod;
        this.onPeriodTimer = [];

        for (const p of this.onPeriod) {
            this.onPeriodTimer.push(globalGameTimer);
        }

        this.immunity = new Set();
        this.statusEffects = new Map();
        this.isBoss = false;
        this.isChild = false;
        
        // Variables that states the current enemy status.
        this.stunned = false;
        this.frozen = false;
        this.knocked = false;
        this.cold = false;
        this.poisoned = false;
        this.badpoisoned = false;
        this.nullified = false;
        this.camouflaged = false;
        this.stopped = false;
        this.invincible = false;

        this.speedFactor = 1.0;
        this.weakenFactor = 1.0;
        this.healFactor = 1.0;
        this.goldFactor = 1.0;
        this.knockRatio = 0.0;

        this.sturdy = false;
        this.laserActiveDamaged = false;

        if (property.immunity) {
            for (const imm of property.immunity) {
                this.immunity.add(imm);

                if (imm == "sturdy") this.sturdy = true;
            }
        }
    }

    // Updates the status of the enemy. Called every frame.
    update() {
        if (this.expired) return;

        const unstoppable = this.immunity.has("unstoppable");

        // Moves the enemy.
        // If enemy is stopped, knocked, stunned, frozen and not unstoppable, enemy is immobilized and does not move.
        if (!this.stopped && (unstoppable || (!this.stunned && !this.frozen && !this.knocked))) {
            this.position.add(new Vector2(-this.speed * this.speedFactor, 0));

            if (this.position.x < -this.size) {
                // If the enemy escaped to the left, then it should be removed.
                this.expired = true;
            }
        }
        else if (this.knocked) {
            // If the enemy is knocked, then it moves to the right.
            this.position.add(new Vector2(this.knockRatio * this.speed, 0));
        }
        
        // Process periodic traits of the enemy.
        // onPeriod functions must return Boolean; True if successful, False if unsuccessful.
        for (let i = 0; i < this.onPeriod.length; i++) {
            if (this.onPeriodTimer[i] + this.onPeriod[i].period <= globalGameTimer) {
                if (this.onPeriod[i].fun(this)) {
                    this.onPeriodTimer[i] = globalGameTimer;
                }
            }
        }

        // Reset status variables.
        this.stunned = false;
        this.frozen = false;
        this.cold = false;
        this.knocked = false;
        this.poisoned = false;
        this.badpoisoned = false;
        this.nullified = false;
        this.camouflaged = false;
        this.stopped = false;
        this.mysteryShield = 0;
        this.laserActiveDamaged = false;

        this.speedFactor = 1.0;
        this.weakenFactor = 1.0;
        this.goldFactor = 1.0;
        this.healFactor = 1.0;
        this.knockRatio = 1.0;

        let slowMin = 1.0;
        let hasteMax = 1.0;
        let corrMin = 1.0;
        
        // Update its status effects.
        for (const [sid, ste] of this.statusEffects) {
            ste.update();

            if (this.sturdy && negativeStatusNames.has(ste.kind) && globalGameTimer - ste.startTime >= ste.duration * 0.5) {
                ste.expired = true;
            }

            if (ste.expired) {
                this.statusEffects.delete(sid);
                continue;
            }

            switch (ste.kind) {
                case "slow": {
                    slowMin = min(slowMin, ste.ratio);
                    break;
                }
                case "freeze": {
                    this.frozen = true;
                    break;
                }
                case "cold": {
                    this.cold = true;
                    break;
                }
                case "stun": {
                    this.stunned = true;
                    break;
                }
                case "poison": {
                    this.poisoned = true;

                    if (ste.damageTimer + ste.period <= globalGameTimer) {
                        const baseDamage = -ste.damage * ste.period / fps;
                        const ratioDamage = -min(this.maxHp * ste.maxHpRatio, ste.maxHpLimit) * ste.period / fps;
                        this.changeHp(baseDamage + ratioDamage, "poison", ste.origin);
                        ste.damageTimer = globalGameTimer;
                    }

                    break;
                }
                case "badpoison": {
                    this.badpoisoned = true;

                    if (ste.damageTimer + ste.period <= globalGameTimer) {
                        let damage = ste.ratio * this.maxHp * ste.period / fps;
                        if (this.isBoss) damage = min(damage, ste.bossLimit * ste.period / fps);

                        this.changeHp(-damage, "poison", ste.origin);
                        ste.damageTimer = globalGameTimer;

                        if (!this.isBoss && this.hp <= this.maxHp * ste.executionRatio) {
                            this.hp = 0;
                            this.dead = true;
                            this.expired = true;
                            
                            const md = {message: "처형당함", origin: null, size: 16, fontSize: 24, floatDistance: 20, pop: false};
                            const mv = new VisualEffect("message", "rgb(128, 0, 221)", fps * 1.5, this.position, md);
                            addVisualEffects(mv);
                        }
                    }
                    break;
                }
                case "knockback": {
                    this.knocked = true;
                    this.knockRatio = max(this.knockRatio, ste.ratio);

                    break;
                }
                case "weaken": {
                    this.weakenFactor = max(this.weakenFactor, ste.ratio);
                    break;
                }
                case "haste": {
                    hasteMax = max(hasteMax, ste.ratio);
                    break;
                }
                case "corrosion": {
                    corrMin = min(corrMin, ste.ratio);
                    break;
                }
                case "nullify": {
                    this.nullified = true;
                    break;
                }
                case "camo": {
                    this.camouflaged = true;
                    break;
                }
                case "heal": {
                    if (ste.healTimer + ste.period <= globalGameTimer) {
                        this.changeHp(ste.heal, "none", ste.origin);
                        ste.healTimer = globalGameTimer;
                    }
                    break;
                }
                case "gold": {
                    this.goldFactor = max(this.goldFactor, ste.ratio);
                    break;
                }
                case "stop": {
                    this.stopped = true;
                    break;
                }
                case "mysteryshield": {
                    this.mysteryShield += ste.count;
                    break;
                }
                default: {
                    console.error("Enemy.update(): Invalid status effect kind:", ste.kind);
                    break;
                }
            }
        }

        this.speedFactor = hasteMax;
        
        if (!this.isImmuneTo("slow") && !unstoppable) {
            this.speedFactor *= slowMin;
        }

        this.healFactor = corrMin;
    }

    // Changes enemy shield by `d`.
    changeShield(d, origin) {
        if (this.expired) return;

        const delta = floor(d);

        this.shield += delta;
        this.shield = max(0, this.shield);
    }

    // Changes enemy HP by d. Its type described by `type`, which is a string.
    changeHp(d, type, origin) {
        let delta = floor(d);

        if (delta < 0) {
            const tower = towers.get(origin);

            if (tower != null && this.isBoss)
                delta *= tower.bossDamageRatio;

            delta = floor(delta * this.weakenFactor);

            if (this.immunity.has(type + "resist")) {
                delta = floor(delta / 2.0);
            }

            if (this.immunity.has(type + "vamp")) {
                delta = -floor(delta / 2.0);
            }

            if (this.isImmuneTo(type)) {
                delta = 0;
            }
        }

        if (delta > 0) {
            delta = floor(delta * this.healFactor);
        }

        delta = floor(delta);

        if (delta < 0 && this.invincible) return;

        if (delta < 0 && this.shield > 0) {
            if (delta + this.shield < 0) {
                this.changeShield(-this.shield);
                delta += this.shield;
            }
            else {
                this.changeShield(delta);
                delta = 0;
            }
        }

        const effDamage = this.hp - max(0, this.hp + delta);

        if (effDamage > 0) {
            const originTower = towers.get(origin);

            if (originTower) originTower.damageDealt += effDamage;
        }

        this.hp = fitInterval(this.hp + delta, 0, this.maxHp);

        if (this.hp <= 0 && !this.expired) {
            this.hp = 0;
            this.expired = true;
            this.dead = true;

            // On enemy death, execute all onDeath functions.
            for (const [kind, f] of this.onDeath) {
                if (f != null)
                    f.fun(this);
            }

            // If the origin of the damage is on the world, change the value of origin tower.
            const originTower = towers.get(origin);

            if (originTower) originTower.kills++;
        }
    }

    // Adds status effect to the enemy.
    setStatusEffect(effect) {
        // Handling some special cases about name collisions.
        if (effect.kind != "camo" && this.isImmuneTo(effect.kind)) return;
        if (effect.kind == "cold" && this.isImmuneTo("slow")) return;
        if ((effect.kind == "poison" || effect.kind == "badpoison") && this.isImmuneTo("poison")) return;
        if (effect.kind == "freeze" && this.isImmuneTo("freeze")) return;

        // If the effect was a negative one, reduce mystery shield by one.
        // For detail, refer to the similar method of class Tower.
        if (negativeStatusNames.has(effect.kind)) {
            let bt = 6e18;
            let ms = null;

            for (const [sid, eff] of this.statusEffects) {
                if (eff.kind != "mysteryshield" || eff.count == 0 || eff.expired) continue;
                if (eff.startTime + eff.duration < bt) {
                    bt = min(bt, eff.startTime + eff.duration);
                    ms = eff;
                }
            }

            if (ms != null) {
                if (--ms.count == 0)
                    ms.expired = true;

                return;
            }
        }

        // Special case of poison and bad poison. Adds onDeath effect.
        switch (effect.kind) {
            case "poison": {
                if (this.poisoned) return;

                this.onDeath.set("poison", effect.onDeath);
                break;
            }
            case "badpoison": {
                if (this.badpoisoned) return;

                this.onDeath.set("badpoison", effect.onDeath);
                break;
            }
        }

        this.statusEffects.set(effect.id, effect);
    }

    // Removes the status effects of the enemy.
    // For more detail, refer to the similar method of class Tower.
    removeStatusEffect(kind, origin) {
        for (const [sid, ste] of this.statusEffects) {
            if (
                (kind == "positive" && positiveStatusNames.has(ste.kind)
                || kind == "negative" && negativeStatusNames.has(ste.kind)
                || kind == "all"
                || kind == ste.kind
                ) &&
                (origin == null || ste.origin == origin)

            ) {
                ste.expired = true;
            }
        }
    }

    // Checks if the enemy is immune to `kind`.
    isImmuneTo(kind) {
        if (kind == null) return false;
        return !this.nullified && this.immunity.has(kind);
    }

    // Draw general graphic component of enemy.
    // Child classes should inherit this function and implement their graphics.
    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;
        const unstoppable = this.immunity.has("unstoppable");

        if (this.badpoisoned && !this.isBoss) {
            // Bad poison.
            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 2.25);
            rg.addColorStop(0, "rgba(66, 39, 89, 0.4)");
            rg.addColorStop(0.4, "rgba(66, 39, 89, 0.4)");
            rg.addColorStop(0.7, "rgba(66, 39, 89, 0)");
            rg.addColorStop(1, "rgba(66, 39, 89, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(x, y, size * 1.75, 0, pi * 2);
            ctx.closePath();
            ctx.fill();
        }
        else if (this.poisoned && !this.isBoss) {
            // Poison.
            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 2.25);
            rg.addColorStop(0, "rgba(181, 35, 243, 0.4)");
            rg.addColorStop(0.7, "rgba(181, 35, 243, 0)");
            rg.addColorStop(1, "rgba(181, 35, 243, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(x, y, size * 1.75, 0, pi * 2);
            ctx.closePath();
            ctx.fill();
        }

        // Draw hp bar.
        if (!this.isBoss && (this.hp < this.maxHp || this.shield > 0) && this.hp > 0) {
            const hpp = this.hp / this.maxHp;
            const hbw = 3 * size;
            const hbh = 5;
            const hbx = x - 1.5 * size;
            const hby = y - size - 25;

            if (this.shield + this.hp < this.maxHp) {
                const shp = this.shield / this.maxHp;

                ctxdh.fillStyle = "rgb(0, 0, 0)";
                ctxdh.fillRect(hbx, hby, hbw, hbh);
                ctxdh.strokeRect(hbx, hby, hbw, hbh);

                ctxdh.fillStyle = "rgba(0, 255, 0, 0.9)";
                ctxdh.fillRect(hbx, hby, hbw * hpp, hbh);
                ctxdh.strokeRect(hbx, hby, hbw * hpp, hbh);

                ctxdh.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctxdh.fillRect(hbx + hbw * hpp, hby, hbw * shp, hbh);
                ctxdh.strokeRect(hbx + hbw * hpp, hby, hbw * shp, hbh);
            }
            else {
                const lp = this.hp / (this.hp + this.shield);
                const rp = 1 - lp;

                ctxdh.fillStyle = "rgba(0, 255, 0, 0.9)";
                ctxdh.fillRect(hbx, hby, hbw * lp, hbh);
                ctxdh.strokeRect(hbx, hby, hbw * lp, hbh);

                ctxdh.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctxdh.fillRect(hbx + hbw * lp, hby, hbw * rp, hbh);
                ctxdh.strokeRect(hbx + hbw * lp, hby, hbw * rp, hbh);
            }
        }

        if (this.camouflaged) {
            // Camouflaged.
            const rg = ctx.createRadialGradient(x, y, 2, x, y, size * 2.5);
            rg.addColorStop(0, "rgba(0, 0, 0, 0.4)");
            rg.addColorStop(0.7, "rgba(0, 0, 0, 0)");
            rg.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, pi * 2);
            ctx.closePath();
            ctx.fill();
        }

        if (this.cold && !unstoppable) {
            // Cold.
            const rg = ctx.createRadialGradient(x, y, 2, x, y, size * 2.5);
            rg.addColorStop(0, "rgba(67, 186, 216, 0.4)");
            rg.addColorStop(0.7, "rgba(67, 186, 216, 0)");
            rg.addColorStop(1, "rgba(67, 186, 216, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(x, y, size * 3 / 2, 0, pi * 2);
            ctx.closePath();
            ctx.fill();
        }  
        else if (this.frozen && !unstoppable) {
            // Frozen.
            const rg = ctx.createRadialGradient(x, y, 2, x, y, size * 2.5);
            rg.addColorStop(0, "rgba(43, 128, 240, 0.5)");
            rg.addColorStop(0.7, "rgba(43, 128, 240, 0)");
            rg.addColorStop(1, "rgba(43, 128, 240, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(x, y, size * 3 / 2, 0, pi * 2);
            ctx.closePath();
            ctx.fill();
        }

        if (this.stunned && !unstoppable) {
            ctx.save();

            const sx = x;
            const sy = y - size;
            const w = 24;
            const h = 8;

            ctx.beginPath();
            ctx.ellipse(sx, sy, w, h, 0, 0, pi * 2);
            ctx.closePath();

            ctx.strokeStyle = "rgb(103, 97, 16)";
            ctx.lineWidth = 2;
            ctx.stroke();

            const period = fps * 2;
            const t = globalTimer / period * pi * 2;

            const lx = sx + w * cos(t);
            const ly = sy * h + sin(t);
            const ls = 6;

            const rg = ctx.createRadialGradient(lx, ly, 2, lx, ly, ls * 2);
            rg.addColorStop(0, "rgba(255, 255, 0)");
            rg.addColorStop(0.7, "rgba(255, 255, 0, 0)");
            rg.addColorStop(1, "rgba(255, 255, 0, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(lx, ly, ls * 3 / 2, 0, pi * 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        if (this.mysteryShield > 0) {
            // Mystery shield.
            ctx.save();
            ctx.translate(x, y);
            ctx.globalAlpha = 0.6;
            
            const ss = 9;

            ctx.beginPath();
            ctx.moveTo(-size - ss, size);
            ctx.lineTo(-size, size + ss);
            ctx.lineTo(-size + ss, size);
            ctx.lineTo(-size + ss, size - 1.5 * ss);
            ctx.lineTo(-size - ss, size - 1.5 * ss);
            ctx.closePath();
            
            ctx.fillStyle = "rgb(241, 22, 165)";
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();

            ctx.globalAlpha = 1;
            drawTextAlignMiddle(String(this.mysteryShield), new Vector2(-size, size - ss / 3), true, 14, "rgb(0, 0, 0)", ctxdh);

            ctx.restore();
        }

        if (this.healFactor < 1.0) {
            // Heal reduction.
            ctx.save();
            ctx.translate(x, y);
            ctx.globalAlpha = 0.6;
            
            const hs = 9;

            ctx.beginPath();
            ctx.moveTo(size, size - hs / 2);
            ctx.quadraticCurveTo(size + hs * 2 / 3, size - hs * 1.4, size + hs, size - hs / 2);
            ctx.quadraticCurveTo(size + hs * 2 / 3, size + hs / 2, size, size + hs);
            ctx.quadraticCurveTo(size - hs * 2 / 3, size + hs / 2, size - hs, size + hs);
            ctx.quadraticCurveTo(size - hs * 2 / 3, size - hs * 1.4, size, size - hs / 2);
            ctx.closePath();
            
            ctx.fillStyle = "rgb(255, 0, 82)";
            ctx.fill();
            ctx.stroke();

            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgb(255, 0, 0)";
        }
    }
}

// Returns name of the trait.
function immunityName(kind) {
    switch (kind) {
        case "sturdy": return "불굴";
        case "poison": return "해독 전문의";
        case "poisonresist": return "해독 체질";
        case "poisonvamp": return "독은 곧 약";
        case "projectile": return "거부";
        case "stone": return "방탄 조끼";
        case "stoneresist": return "견디기";
        case "stonevamp": return "바위 삼키기";
        case "freeze": return "항온";
        case "freezeresist": return "방한 대비";
        case "freezevamp": return "얼음 성장";
        case "slow": return "신속";
        case "camo": return "은신";
        case "arcane": return "신성 기사";
        case "arcaneresist": return "둔감함";
        case "arcanevamp": return "악마의 비웃음";
        case "laser": return "흑체";
        case "laserresist": return "굴절";
        case "laservamp": return "광합성";
        case "wave": return "파동 무효화";
        case "waveresist": return "감쇄";
        case "wavevamp": return "울림 동화";
        case "stun": return "정신력";
        case "knockback": return "굳건함";
        case "weakpoint": return "취약점";
        case "inject1":
        case "inject2": return "신경독 주입";
        case "bless2":
        case "bless1": return "축복";
        case "shieldborn7":
        case "shieldborn6":
        case "shieldborn5":
        case "shieldborn4":
        case "shieldborn3":
        case "shieldborn2":
        case "shieldborn1": return "방어구";
        case "regen5":
        case "regen4":
        case "regen3":
        case "regen2":
        case "regen1":
        case "regen0": return "재생";
        case "stunbomb": return "마취 폭발";
        case "smokebomb": return "연막탄";
        case "smokewalk": return "은밀한 발걸음";
        case "elevation": return "생존 본능";
        case "shadowscreen": return "어둠 장막";
        case "spawn": return "빚어내기";
        case "defensestance": return "방어 태세";
        case "castlehowling": return "성벽의 울림";
        case "dangersense": return "위험 감지";
        case "unstoppable": return "저지 불가";
        case "ragelimit": return "인내의 한계";
        case "potent": return "가능성의 개화";
        case "waterborn": return "물가의 기운";
        case "ironborn": return "강철의 기운";
        case "windborn": return "바람의 기운";
        case "rigidskin": return "딱딱한 피부";
        case "flareguard": return "홍염 갑주";
        case "randomvamp": return "보호색";
        case "mysteryborn3":
        case "mysteryborn2":
        case "mysteryborn1": return "미지의 보호";
        case "elitepotal": return "개문";
        case "portal": return "관문 개방";
        case "curse": return "금지된 주술";
        case "distrain": return "재산 압류";
        case "dismiss": return "구조 조정"
        case "energysave": return "에너지 절약";
        case "frozenasset": return "자산 동결";
        case "sharemoney": return "수익 남용";
        case "accelerate": return "탄력";
        case "distractbomb": return "실의의 폭발";
        case "mighty": return "짓밟기";
        case "painskin": return "절망스런 미래";
        case "reflexskin": return "반응형 설계";
        case "recover": return "극한의 생존력";
        case "revive": return "생명 재개";
        case "laststand": return "배수진";
        case "shieldregen": return "보호막 재생";
        case "knightarmor": return "기사의 갑옷";
        case "bodyslam": return "육탄전";
        case "veteran": return "베테랑의 품격";
        case "futureaccel": return "그릇된 예언";
        case "pastprison": return "기억의 속박";
        case "chaosborn": return "윤회";
        case "timeflow": return "끝으로의 걸음";
        case "fateaccel": return "운명적";
        case "betrayalmark": return "배반의 낙인";
        case "eternalweak": return "영원의 굴레";
        case "randomskin": return "시간의 주사위";
        case "timereturn": return "태엽 되감기";
        case "arcanepower": return "이질적인 힘";
        case "axiomguard": return "법칙의 보호";
        case "temporalecho": return "시간의 메아리";
        default: return kind;
    }
}

// Returns description of the trait of given `kind`.
function immunityDescription(kind) {
    switch (kind) {
        case "sturdy": return "해로운 상태 이상의 지속 시간이 50% 감소합니다.";
        case "poison": return "맹독 제조기 면역을 얻어, 맹독 제조기의 공격과 효과를 모두 무시합니다.";
        case "poisonresist": return "맹독 제조기 저항을 얻어, 맹독 제조기에게 받는 피해가 50% 감소합니다.";
        case "poisonvamp": return "맹독 제조기 흡혈을 얻어, 맹독 제조기에게 피해를 입으면 피해를 입는 대신 피해량의 50%만큼 회복합니다.";
        case "projectile": return "투사체 면역을 얻어, 투사체 유형의 공격과 효과를 모두 무시합니다. 접촉한 투사체를 없앱니다.";
        case "stone": return "석제 포탑 면역을 얻어, 석제 포탑의 공격과 효과를 모두 무시합니다.";
        case "stoneresist": return "석제 포탑 저항을 얻어, 석제 포탑에게 받는 피해가 50% 감소합니다.";
        case "stonevamp": return "석제 포탑 흡혈을 얻어, 석제 포탑에게 피해를 입으면 피해를 입는 대신 피해량의 50%만큼 회복합니다.";
        case "freeze": return "서리 냉각기 면역을 얻어, 서리 냉각기의 공격과 효과를 모두 무시합니다.";
        case "freezeresist": return "서리 냉각기 저항을 얻어, 서리 냉각기에게 받는 피해가 50% 감소합니다.";
        case "freezevamp": return "서리 냉각기 흡혈을 얻어, 서리 냉각기에게 피해를 입으면 피해를 입는 대신 피해량의 50%만큼 회복합니다.";
        case "slow": return "이동 속도가 감소하지 않습니다.";
        case "camo": return "은신하여 들키지 않습니다. 은신을 감지할 수 없는 타워들의 공격과 효과를 모두 무시합니다.";
        case "arcane": return "마력의 제단 면역을 얻어, 마력의 제단의 공격과 효과를 모두 무시합니다.";
        case "arcaneresist": return "마력의 제단 저항을 얻어, 마력의 제단에게 받는 피해가 50% 감소합니다.";
        case "arcanevamp": return "마력의 제단 흡혈을 얻어, 마력의 제단에게 피해를 입으면 피해를 입는 대신 피해량의 50%만큼 회복합니다.";
        case "laser": return "레이저 가속기 면역을 얻어, 레이저 가속기의 공격과 효과를 모두 무시합니다.";
        case "laserresist": return "레이저 가속기 저항을 얻어, 레이저 가속기에게 받는 피해가 50% 감소합니다.";
        case "laservamp": return "레이저 가속기 흡혈을 얻어, 레이저 가속기에게 피해를 입으면 피해를 입는 대신 피해량의 50%만큼 회복합니다.";
        case "wave": return "파동 충격기 면역을 얻어, 파동 충격기의 공격과 효과를 모두 무시합니다.";;
        case "waveresist": return "파동 충격기 저항을 얻어, 파동 충격기에게 받는 피해가 50% 감소합니다.";
        case "wavevamp": return "파동 충격기 흡혈을 얻어, 파동 충격기에게 피해를 입으면 피해를 입는 대신 피해량의 50%만큼 회복합니다.";
        case "stun": return "기절하지 않습니다.";
        case "knockback": return "밀쳐지지 않습니다.";
        case "weakpoint": return "독과 충격파에 취약합니다. 맹독 제조기와 파동 충격기에게 받는 피해가 4배가 됩니다.";
        case "inject1": return "3초마다 가까운 타워 하나에게 신경독을 주입해 2초간 공격 속도를 20% 감소시킵니다.";
        case "inject2": return "2초마다, 지금까지 가장 많은 피해를 입힌 타워에게 강한 신경독을 주입해 3초간 공격 속도를 25% 감소시킵니다.";
        case "bless2": return `5초마다 주변의 적에게 3초간 유지되는 미지의 방패를 1 부여하고, HP를 ${diffBranch(1500, 2000, 4000)} 회복시킵니다. 만약 대상의 HP가 50% 이하라면 미지의 방패를 추가로 1 더 부여합니다.`;
        case "bless1": return `1.5초마다 자기 자신과 주변의 적의 HP를 ${diffBranch(400, 500, 750)} + 대상 최대 HP의 10%만큼 회복시킵니다. 보스에게는 회복량이 절반만 적용됩니다.`;
        case "shieldborn6": return "보호막을 10000 얻은 채로 등장합니다.";
        case "shieldborn7": return "보호막을 7500 얻은 채로 등장합니다.";
        case "shieldborn5": return "보호막을 4000 얻은 채로 등장합니다.";
        case "shieldborn4": return "보호막을 3000 얻은 채로 등장합니다.";
        case "shieldborn3": return "보호막을 2500 얻은 채로 등장합니다.";
        case "shieldborn2": return "보호막을 750 얻은 채로 등장합니다.";
        case "shieldborn1": return "보호막을 300 얻은 채로 등장합니다.";
        case "regen5": return "매 초마다 자신의 HP를 1500 회복합니다.";
        case "regen4": return "매 초마다 자신의 HP를 1000 회복합니다.";
        case "regen3": return "매 초마다 자신의 HP를 500 회복합니다.";
        case "regen2": return "매 초마다 자신의 HP를 300 회복합니다.";
        case "regen1": return "매 초마다 자신의 HP를 100 회복합니다.";
        case "regen0": return "매 초마다 자신의 HP를 150 회복합니다.";
        case "stunbomb": return `처치될 시 폭발을 일으켜 마취 가스를 퍼뜨립니다. 주변의 모든 타워를 ${diffBranch(0.4, 0.5, 0.6)}초동안 기절시킵니다.`;
        case "smokebomb": return "매 4초마다 모든 해로운 상태 이상을 제거하고, 1.75초동안 은신 상태로 돌입하여 은신을 감지할 수 없는 타워들의 공격과 효과를 모두 무시합니다.";
        case "smokewalk": return "은신 상태일 때 이동 속도가 50% 빨라집니다.";
        case "elevation": return "HP가 50% 이하로 떨어지면 각성합니다. 각성하면 은신 상태로 돌입할 때마다 HP를 잃은 HP의 10%만큼 회복합니다.";
        case "shadowscreen": return "주변의 모든 적을 은신 상태로 만듭니다. 처치될 시 어둠 구름을 퍼뜨려 주변 모든 타워의 사거리를 1.5초간 60% 감소시킵니다.";
        case "spawn": return "계속해서 파편을 생성합니다. 생성하는 파편의 종류는 요새의 방어 태세에 따라 달라집니다.";
        case "defensestance": return `HP가 감소하면 방어 태세를 전환하여 ${diffBranch(2, 3, 4)}초간 무적이 되고, 생성하는 파편의 종류가 달라집니다. \n 66% ~ 100%: 자홍색 파편. \n 33% ~ 66%: 군청색 파편. \n 0% ~ 33%: 진녹색 파편.`;
        case "castlehowling": return `매 8초마다 울림을 일으켜 모든 타워를 ${diffBranch(1.75, 2, 2.25)}초간 기절시킵니다. 기절 시간은 배치된 타워 하나 당 0.05초씩 줄어들며, 최소 ${diffBranch(0.5, 1, 1.25)}초까지 줄어듭니다.`;
        case "dangersense": return `타워가 액티브 스킬을 사용할 때마다 보호막을 ${diffBranch(5000, 10000, 12500)} 얻습니다.`;
        case "unstoppable": return "이동 방해 효과를 전혀 받지 않습니다.";
        case "ragelimit": return `HP가 ${diffBranch(50, 50, 70)}% 이하로 떨어지면 억누른 분노를 표출하여 이동 속도가 2배가 됩니다.`;
        case "potent": return "처치될 시 처치된 위치에서 씨앗이 피어납니다. 씨앗에서는 수운초, 금입초, 연풍초 중 무작위 적 하나가 생성됩니다.";
        case "waterborn": return "물의 힘을 빌립니다. 등장 시 0.5초간 무적이 되어 어떤 피해도 받지 않으며, 주변 타워의 공격 속도를 2초동안 30% 감소시킵니다.";
        case "ironborn": return "강철의 힘을 빌립니다. 등장 시 0.5초간 무적이 되어 어떤 피해도 받지 않습니다. 매 3초마다 보호막을 5000까지 얻습니다.";
        case "windborn": return "바람의 힘을 빌립니다. 등장 시 0.5초간 무적이 되어 어떤 피해도 받지 않으며, 주변 적의 이동 속도를 30% 빠르게 합니다.";
        case "rigidskin": return `모든 피해를 ${diffBranch(60, 90, 120)} 적게 받습니다.`;
        case "flareguard": return `강력한 수호의 불꽃으로 인해 서리 냉각기에게만 피해를 입습니다. 서리 냉각기에게 총 ${diffBranch(500, 1000, 3000)}의 피해를 입으면 불꽃이 사라져 다른 공격으로도 피해를 입힐 수 있게 됩니다.`;
        case "randomvamp": return "등장 시 골드 관리 공사와 전투 지원 기지를 제외한 타워 중 3개 타워 종류를 무작위로 지정합니다. 지정한 타워 종류의 면역을 얻어, 그 공격과 효과를 무시합니다.";
        case "mysteryborn3": return `미지의 방패를 ${diffBranch(4, 8, 10)} 얻은 채로 등장합니다. 미지의 방패는 해로운 상태 이상을 막아주며, 막을 때마다 그 수가 1 줄어듭니다.`;
        case "mysteryborn2": return `미지의 방패를 ${diffBranch(5, 10, 20)} 얻은 채로 등장합니다. 미지의 방패는 해로운 상태 이상을 막아주며, 막을 때마다 그 수가 1 줄어듭니다.`;
        case "mysteryborn1": return `미지의 방패를 2 얻은 채로 등장합니다. 미지의 방패는 해로운 상태 이상을 막아주며, 막을 때마다 그 수가 1 줄어듭니다.`;
        case "elitepotal": return `화면의 왼쪽에 관문을 열어 2초마다 무작위 에너지 조각을 생성합니다. 생성된 에너지 조각에게 미지의 방패를 ${diffBranch(1, 2, 3)} 부여합니다.`;
        case "portal": return "화면의 왼쪽에 관문을 열어 2초마다 무작위 파편을 생성합니다.";
        case "curse": return `매 5초마다 괴상한 힘을 주변의 적에게 보내 이동 속도를 ${diffBranch(20, 20, 25)}% 빠르게 합니다.`;
        case "distrain": return `매 ${diffBranch(16, 12, 8)}초마다 가장 많은 피해를 입힌 타워를 소모 금액의 ${diffBranch(100, 95, 95)}%의 가격으로 판매합니다. HP가 ${diffBranch(25, 50, 75)}% 이하라면 추가로 가장 가까운 타워를 하나 더 판매합니다.`;
        case "dismiss": return `HP가 25% 줄어들 때마다 ${diffBranch(3, 4, 5)}초간 무적이 되고 보호막을 최대 HP의 25%만큼 얻으며 모든 적에게서 기운을 빼앗습니다. 기운을 빼앗은 적 하나 당 보호막을 ${diffBranch(4000, 6000, 8000)}, 미지의 방패를 ${diffBranch(1, 1, 2)} 추가로 얻습니다.`;
        case "energysave": return `매 ${diffBranch(13, 11, 9)}초마다 전장의 불빛을 꺼 3.5초간 어둡게 만듭니다. 이 동안, 마우스 근처만 볼 수 있게 됩니다.`;
        case "frozenasset": return `매 ${diffBranch(11, 9, 7)}초마다 골드를 ${diffBranch(2, 2, 2.5)}초간 사용할 수 없게 합니다.`;
        case "sharemoney": return `매 6초마다 플레이어가 보유한 골드의 ${diffBranch(50, 100, 400)}%만큼 HP를 회복합니다.`;
        case "accelerate": return `공격을 받을 때마다 이동 속도가 ${diffBranch(20, 20, 25)}% 빨라집니다. 이는 무한히 중첩됩니다.`;
        case "distractbomb": return `처치될 시 폭발을 일으켜 유령의 힘을 퍼뜨립니다. 주변의 모든 타워는 ${diffBranch(0.7, 0.8, 0.9)}초간 입히는 피해량이 ${diffBranch(40, 45, 50)}% 감소하고, 액티브 스킬을 사용할 수 없게 됩니다.`;
        case "mighty": return `접촉한 타워를 짓밟아 강제로 없앱니다. 짓밟힌 타워는 사라지며, 소모한 골드의 ${diffBranch(100, 95, 90)}%를 돌려받습니다.`;
        case "painskin": return `공격을 받을 때마다 공격한 타워를 0.1초동안 기절시킵니다. 기절을 걸 때마다 기절의 지속 시간이 점점 늘어나, 최대 5초까지 늘어납니다.`;
        case "reflexskin": return `공격을 받을 때마다 보호막을 ${diffBranch(100, 250, 325)}만큼 얻습니다.`;
        case "recover": return `매 5초마다, 매 초 최대 HP의 33%만큼 회복하는 재생 상태 이상을 스스로에게 겁니다. 재생 상태는 무한히 중첩됩니다.`;
        case "revive": return `처치된 후 4초 뒤에 그 자리에서 부활합니다. 부활할 때마다 이동 속도가 10%씩 빨라집니다. 최대 ${diffBranch(2, 2, 3)}번까지만 부활할 수 있습니다.`;
        case "laststand": return `받는 피해량이 적의 수에 따라 최대 ${diffBranch(40, 50, 55)}%까지 감소합니다. 적이 적을 수록 받는 피해가 더욱 줄어듭니다.`;
        case "shieldregen": return `매 ${diffBranch(4, 3, 2)}초마다 보호막을 2000 얻습니다.`;
        case "knightarmor": return `매 5초마다 보호막을 ${diffBranch(15000, 20000, 25000)}까지 얻습니다.`;
        case "bodyslam": return `접촉한 타워를 가격하여 기절시킵니다.`;
        case "veteran": return `능수능란한 전투 기술을 보유한 베테랑입니다. 보호막이 있으면 모든 피해를 절반만 받습니다. 보호막이 없으면 이동 속도가 2배가 됩니다.`;
        case "futureaccel": return `초침이 한 바퀴를 돌면 끝의 형상의 HP를 ${diffBranch(5000, 10000, 20000)} 회복시키고 시곗바늘을 조금 더 움직입니다.`;
        case "pastprison": return `초침이 한 바퀴를 돌면 타워 하나의 액티브 스킬 재사용 대기시간을 ${diffBranch(3, 5, 7)}초 늘립니다.`;
        case "chaosborn": return `처치될 시 스테이지 5의 무작위 적을 ${diffBranch(2, 2, 3)}마리 생성합니다.`;
        case "timeflow": return `끝을 향해 거대한 시계가 움직입니다. 시계가 특정 시각을 가리킬 때마다 그에 해당하는 특수 효과를 얻습니다. 또한, HP가 20% 줄어들 때마다 최대 HP의 50%만큼 보호막을 얻고 미지의 방패를 50 얻으며, 시곗바늘의 움직임이 빨라집니다.`;
        case "fateaccel": return `다음 두 가지 효과를 얻습니다. \n 1) 계속해서 암야의 기사, 과거의 상, 미래의 상을 생성합니다. \n 2) 받는 피해가 고정 수치만큼 줄어듭니다. 타워가 많을 수록, HP가 적을 수록 더 많이 줄어들며, 최대 ${diffBranch(80, 160, 210)}까지 줄어듭니다.`;
        case "betrayalmark": return `시계가 12시, 6시를 가리킬 때, 배반의 낙인을 1개 준비합니다. 시계의 1시간이 지나면 가장 많은 피해를 입힌 타워에게 배반의 낙인을 찍어, 피해를 입히는 대신 적을 회복시키도록 만듭니다. HP가 ${diffBranch(20, 40, 60)}% 이하라면 낙인을 하나 더 준비하여 가장 비싼 타워에게도 찍습니다.`;
        case "eternalweak": return `시계가 3시를 가리킬 때, 모든 타워의 공격 속도를 10%만큼 영구히 감소시킵니다. HP가 ${diffBranch(40, 60, 60)}% 이하라면 공격 속도를 20%만큼 영구히 감소시킵니다.`;
        case "randomskin": return `시계가 4시, 10시를 가리킬 때, 남은 HP에 따라 다른 효과를 얻습니다. \n ${diffBranch(60, 60, 80)}% ~ 100%: 무작위 타워 저항 1개, 면역 1개. \n ${diffBranch(20, 20, 40)}% ~ ${diffBranch(60, 60, 80)}%: 무작위 타워 면역 2개. \n 0% ~ ${diffBranch(20, 20, 40)}%: 무작위 타워 면역 1개, 흡혈 1개.`;
        case "timereturn": return `시계가 2시, 8시를 가리킬 때, 시계의 지난 1시간 동안 처치된 적을 모두 부활시킵니다.`;
        case "arcanepower": return `시계가 5시를 가리킬 때, 모든 적의 HP를 적 최대 HP의 100%만큼 회복시키고, 보호막을 ${diffBranch(2500, 5000, 7500)}, 미지의 방패를 ${diffBranch(5, 6, 7)} 부여합니다. HP가 ${diffBranch(20, 40, 40)}% 이하라면 보호막을 2배로 부여합니다.`;
        case "axiomguard": return `시계가 9시를 가리킬 때, ${diffBranch(2, 2.75, 3.25)}초간 무적이 되며 HP를 ${diffBranch(300000, 400000, 550000)} + 잃은 HP의 ${diffBranch(6, 6, 8)}%만큼 회복합니다. 무적 시간은 HP가 80% 이하일 때 0.5초 늘어나고, 40% 이하일 때 추가로 0.5초 더 늘어납니다.`;
        case "temporalecho": return `시계가 11시를 가리킬 때, 골드를 ${diffBranch(1, 1, 1.5)}초간 사용할 수 없게 하며, 모든 타워를 ${diffBranch(1.5, 1.75, 2.5)}초간 기절시킵니다.`;
        default: return "알 수 없는 특성이군요. 세상엔 모르는게 너무나도 많군요.";
    }
}

// Generate enemy with the given kind.
function generateEnemy(kind) {
    const pos = new Vector2(winX + 150, random() * winY * 2 / 3 + winY / 6);

    switch (kind) {
        case "basic": return new EnemyBasic(pos);
        case "giant": return new EnemyGiant(pos);
        case "tinysphere": return new EnemyTinySphere(pos);
        case "fly": return new EnemyFly(pos);
        case "exercisestudent": return new EnemyExerciseStudent(pos);
        case "behemoth": return new EnemyBehemoth(pos);

        case "hardbasic": return new EnemyHardBasic(pos);
        case "shielded": return new EnemyShielded(pos);
        case "poisonstudent": return new EnemyPoisonStudent(pos);
        case "rogue": return new EnemyRogue(pos);
        case "defsphere": return new EnemyDefSphere(pos);
        case "trickster": return new EnemyTrickster(pos);

        case "elitebasic": return new EnemyEliteBasic(pos);
        case "exercisemaster": return new EnemyExerciseMaster(pos);
        case "stunfly": return new EnemyStunFly(pos);
        case "healer": return new EnemyHealer(pos);
        case "shadower": return new EnemyShadower(pos);
        case "spinner": return new EnemySpinner(pos);
        case "elitegiant": return new EnemyEliteGiant(pos);
        case "redcrystal": return new EnemyRedCrystal(pos);
        case "bluecrystal": return new EnemyBlueCrystal(pos);
        case "greencrystal": return new EnemyGreenCrystal(pos);
        case "livingfortress": return new EnemyLivingFortress(pos);

        case "immsphere": return new EnemyImmSphere(pos);
        case "endurer": return new EnemyEndurer(pos);
        case "potentseed": return new EnemyPotentSeed(pos);
        case "waterflower": return new EnemyWaterFlower(pos);
        case "ironflower": return new EnemyIronFlower(pos);
        case "windflower": return new EnemyWindFlower(pos);
        case "flareguard": return new EnemyFlareGuard(pos);
        case "eliteshielded": return new EnemyEliteShielded(pos);
        case "eliterogue": return new EnemyEliteRogue(pos);
        case "randomsphere": return new EnemyRandomSphere(pos);
        case "poisonmaster": return new EnemyPoisonMaster(pos);
        case "summoner": return new EnemySummoner(pos);
        case "elitehealer": return new EnemyEliteHealer(pos);
        case "mobmanager": return new EnemyMobManager(pos);

        case "elitesummoner": return new EnemyEliteSummoner(pos);
        case "dawnshard": return new EnemyDawnShard(pos);
        case "dayshard": return new EnemyDayShard(pos);
        case "sunsetshard": return new EnemySunsetShard(pos);
        case "accelerator": return new EnemyAccelerator(pos);
        case "elitefly": return new EnemyEliteFly(pos);
        case "mightysphere": return new EnemyMightySphere(pos);
        case "painsphere": return new EnemyPainSphere(pos);
        case "recovercube": return new EnemyRecoverCube(pos);
        case "silentsoul": return new EnemySilentSoul(pos);
        case "blackknight": return new EnemyBlackKnight(pos);
        case "pastclock": return new EnemyPastClock(pos);
        case "futureclock": return new EnemyFutureClock(pos);
        case "terminalform": return new EnemyTerminalForm(pos);

        default: return null;
    }
}

// Generates enemy and place it on the world. Called every frame.
function spawnEnemy() {
    if (!spawnQueue.empty()) {
        const next = spawnQueue.top();

        if (globalGameTimer - roundBeginTimer >= next.spawnOffset) {
            const newEnemy = generateEnemy(next.kind);

            if (newEnemy.onSpawn) {
                newEnemy.onSpawn.fun(newEnemy);
            }

            if (newEnemy.isBoss) {
                const vse = new VisualEffect("bossspawn", null, fps, null, null);
                bossEnemyId = newEnemy.id;
                addVisualEffects(vse);

                newEnemy.position.y = winY / 2;
            }

            enemies.set(newEnemy.id, newEnemy);
            spawnQueue.pop();
        }
    }
}

// Processes enemies. Called every frame.
function processEnemies() {
    for (const [eid, enemy] of enemies) {
        enemy.update();
        
        if (enemy.expired) {
            if (!enemy.dead) {
                // If enemy is not dead but is expired: meaning it escaped through your defense!
                // Damage the player.
                changePlayerHp(-enemy.damageToPlayer);
            }
            else {
                // Otherwise, it would be a successful kill.
                changePlayerGold(floor(enemy.reward * enemy.goldFactor));
            }

            if (enemy.isBoss) {
                const vse = new VisualEffect("bossdead", null, fps, null, null);
                addVisualEffects(vse);
            }

            enemies.delete(eid);
        }
    }
}

// Draw enemies. Called every frame.
function drawEnemies() {
    for (const [eid, enemy] of enemies) {
        if (enemy.isBoss) enemy.draw(ctxdb);
        else enemy.draw(ctxd);
    }
}