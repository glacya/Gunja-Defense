/*
    enemy_s3.js - 2024.03.10

    Implementation of enemies on Stage 3.
*/

class EnemyEliteBasic extends Enemy {
    constructor(position) {
        super(position, {
            kind: "elitebasic",
            hp: diffBranch(1000, 1600, 1800),
            speed: 4,
            size: 20,
            reward: 37,
            dmg: 3,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.changeShield(750);

                    e.setStatusEffect(new HealStatus(1e18, 5, fps / 20, e.id));
                }
            },
            onPeriod: [],
            immunity: ["shieldborn2", "stoneresist", "sturdy", "regen1"]
        });

        this.name = "베테랑 돌격병";
        this.description = "가장 뛰어난, 돌격병 중의 돌격병입니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(245, 230, 37)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyExerciseMaster extends Enemy {
    constructor(position) {
        super(position, {
            kind: "exercisemaster",
            hp: diffBranch(1800, 3000, 3500),
            speed: diffBranch(1.3, 1.5, 1.6),
            size: 30,
            reward: 45,
            dmg: 4,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["stoneresist", "freezeresist", "poisonresist", "laserresist", "unstoppable"]
        });

        this.name = "헬창";
        this.description = "운동에 미친 괴물입니다. 아주 튼튼합니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(254, 198, 152)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2.0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const rg = ctx.createRadialGradient(0, 0, 10, 0, 0, size * 2);
        rg.addColorStop(0, "rgb(250, 166, 97)");
        rg.addColorStop(0.5 + 0.2 * sin(globalGameTimer % (fps * 2) * pi * 2.0), "rgba(250, 166, 97, 0)");
        rg.addColorStop(1, "rgba(250, 166, 97, 0)");

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2.0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyHealer extends Enemy {
    constructor(position) {
        super(position, {
            kind: "healer",
            hp: diffBranch(2000, 4000, 4500),
            speed: diffBranch(0.75, 0.75, 0.9),
            size: 24,
            reward: 55,
            dmg: 5,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.setStatusEffect(new HealStatus(1e18, 10, fps / 30, e.id));
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        const healRange = 200;
                        const baseHeal = diffBranch(400, 500, 750);
                        const maxHpRatio = 0.1;

                        const hv = new VisualEffect("growout", "rgb(127, 255, 127)", fps * 3 / 4, e.position, {radius: healRange});
                        const md = {message: "치유", origin: e.id, size: e.size, fontSize: 20, floatDistance: 20, pop: false};
                        const mv = new VisualEffect("message", "rgb(127, 255, 127)", fps, e.position, md);

                        addVisualEffects(hv, mv);

                        for (const [eid, enemy] of enemies) {
                            if (enemy.position.distance(e.position) <= healRange + enemy.size) {
                                const healAmount = baseHeal + floor(maxHpRatio * enemy.maxHp);
                                enemy.changeHp(enemy.kind == "healer" ? healAmount / 10 : (enemy.isBoss ? healAmount / 2 : healAmount), "none", e.id);
                            }
                        }
                        return true;
                    },
                    period: 1.5 * fps
                }

            ],
            immunity: ["waveresist", "bless1", "regen2"]
        });

        this.name = "치유사";
        this.description = "따뜻한 치유의 힘으로 적의 생명을 연장시키는 적입니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(200, 255, 200)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2.0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const rg = ctx.createRadialGradient(0, 0, 10, 0, 0, size * 2);
        rg.addColorStop(0, "rgb(127, 255, 127)");
        rg.addColorStop(0.5 + 0.2 * sin(globalGameTimer % (fps * 2) * pi * 2.0), "rgba(127, 255, 127, 0)");
        rg.addColorStop(1, "rgba(127, 255, 127, 0)");

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2.0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyStunFly extends Enemy {
    constructor(position) {
        super(position, {
            kind: "stunfly",
            hp: 250,
            speed: diffBranch(7, 10, 10.4),
            size: 12,
            reward: 12,
            dmg: 1,
            onDeath: {
                fun: (e) => {
                    const stunRange = 100;
                    const ss = new StunStatus(diffBranch(0.4, 0.5, 0.6) * fps, e.id);
                    const vse = new VisualEffect("radialout", "rgb(109, 177, 35)", fps / 2, e.position, {radius: stunRange});

                    addVisualEffects(vse);

                    for (const [tid, tower] of towers) {
                        if (e.position.distance(tower.position) <= stunRange + tower.size) {
                            tower.setStatusEffect(ss);
                        }
                    }
                }
            },
            onSpawn: null,
            onPeriod: [],
            immunity: ["slow", "stunbomb"]
        });

        this.name = "마취 하루살이";
        this.description = "체력이 낮고 굉장히 빠르게 달려드는 고약한 적입니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(109, 177, 35)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2.0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyShadower extends Enemy {
    constructor(position) {
        super(position, {
            kind: "shadower",
            hp: diffBranch(1100, 1500, 1650),
            speed: 2.5,
            size: 18,
            reward: 53,
            dmg: 4,
            onDeath: {
                fun: (e) => {
                    const downRange = diffBranch(100, 100, 125);
                    const downDuration = 1.5 * fps;
                    const downRatio = 0.4;
                    const downStatus = new RangeDownStatus(downDuration, downRatio, e.id);
                    const vse = new VisualEffect("explodeout", "rgb(64, 64, 64)", fps / 2, e.position, {radius: downRange});

                    addVisualEffects(vse);

                    for (const [tid, tower] of towers) {
                        if (e.position.distance(tower.position) <= downRange + tower.size) {
                            if (tower.mysteryShield == 0 || tower.kind != "support") {
                                const md = {message: "사거리 감소", origin: tower.id, size: tower.size, fontSize: 18, floatDistance: 20, pop: false};
                                const mv = new VisualEffect("message", "rgb(201, 55, 55)", fps, tower.position, md);

                                addVisualEffects(mv);
                            }

                            tower.setStatusEffect(downStatus);
                        }
                    }
                }
            },
            onSpawn: {
                fun: (e) => {
                    const cs = new CamoStatus(1e18, e.id);
                    e.setStatusEffect(cs);
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        const camoRange = diffBranch(75, 75, 90);
                        const camoDuration = fps / 4 + 1;
                        const camoStatus = new CamoStatus(camoDuration, e.id);

                        for (const [eid, enemy] of enemies) {
                            if (enemy.position.distance(e.position) <= camoRange + enemy.size) {
                                enemy.setStatusEffect(camoStatus);
                            }
                        }
                        return true;
                    },
                    period: fps / 4
                }
            ],
            immunity: ["camo", "shadowscreen", "stun", "slow", "laser"]
        });

        this.name = "그림자 도적";
        this.description = "그림자에 숨어 이동하는 적입니다. 까다로운 보조 능력을 갖고 있습니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        if (ctx == ctxd) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.beginPath();
            ctx.arc(0, 0, diffBranch(75, 75, 90), 0, pi * 2);
            ctx.closePath();
            ctx.fill();
        }
        ctx.fillStyle = "rgb(36, 36, 36)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.fillStyle = "rgb(160, 160, 160)";
        ctx.fillRect(-size, -size * 2 / 3, 2 * size, size * 2 / 3);
        ctx.strokeRect(-size, -size * 2 / 3, 2 * size, size * 2 / 3);

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemySpinner extends Enemy {
    constructor(position) {
        super(position, {
            kind: "spinner",
            hp: diffBranch(750, 1250, 1500),
            speed: 2.5,
            size: 17,
            reward: 50,
            dmg: 3,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["stonevamp", "knockback"]
        });

        this.name = "비행 곡예병";
        this.description = "빙글빙글 돌아가는 적입니다. 공격을 하면 먹어 치울 것 같아요.";
        
        this.angle = 0;
        this.period = 2 * fps;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        if (!this.stunned && !this.frozen && !this.knockback) this.angle++;
        
        ctx.rotate(-this.angle * pi * 2 / this.period);
        
        ctx.fillStyle = "rgb(112, 146, 190)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-0.9 * size, -0.9 * size, 1.8 * size, 1.8 * size);

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyEliteGiant extends Enemy {
    constructor(position) {
        super(position, {
            kind: "elitegiant",
            hp: diffBranch(5000, 7500, 7500),
            speed: diffBranch(1.2, 1.2, 1.5),
            size: 32,
            reward: 70,
            dmg: 5,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.changeShield(2500);
                }
            },
            onPeriod: [],
            immunity: ["shieldborn3", "stoneresist", "laserresist", "waveresist", "stun", "knockback", "arcane"]
        });

        this.name = "중갑 전사";
        this.description = "무거운 갑옷을 입었습니다. 무서울 정도로 무거워 보이는군요.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(0, 151, 102)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.fillStyle = "rgb(0, 92, 108)";
        ctx.fillRect(-1.1 * size, -0.9 * size, 2.2 * size, 1.8 * size);
        ctx.strokeRect(-1.1 * size, -0.9 * size, 2.2 * size, 1.8 * size);

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyRedCrystal extends Enemy {
    constructor(position) {
        super(position, {
            kind: "redcrystal",
            hp: diffBranch(500, 1000, 1250),
            speed: 3.7,
            size: 15,
            reward: diffBranch(1, 0, 0),
            dmg: 2,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["stoneresist", "freeze", "wavevamp"]
        });

        this.name = "자홍색 파편";
        this.description = "인공적으로 만들어진 자홍색 파편입니다.";
        this.isChild = true;

        this.phase = 0;
        this.period = 4 * fps;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.rotate(pi / 4);
        ctx.fillStyle = "rgb(202, 0, 96)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        const innerSize = (0.8 + 0.1 * sin(this.phase * pi * 2 / this.period)) * size;
        ctx.strokeRect(-innerSize, -innerSize, 2 * innerSize, 2 * innerSize);

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyBlueCrystal extends Enemy {
    constructor(position) {
        super(position, {
            kind: "bluecrystal",
            hp: diffBranch(750, 1250, 1750),
            speed: 3.2,
            size: 15,
            reward: diffBranch(1, 0, 0),
            dmg: 2,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["waveresist", "poison", "freezevamp"]
        });

        this.name = "군청색 파편";
        this.description = "인공적으로 만들어진 군청색 파편입니다.";
        this.isChild = true;

        this.phase = 0;
        this.period = 4 * fps;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.rotate(pi / 4);
        ctx.fillStyle = "rgb(0, 91, 202)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        const innerSize = (0.8 + 0.1 * sin(this.phase * pi * 2 / this.period)) * size;
        ctx.strokeRect(-innerSize, -innerSize, 2 * innerSize, 2 * innerSize);

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyGreenCrystal extends Enemy {
    constructor(position) {
        super(position, {
            kind: "greencrystal",
            hp: diffBranch(1000, 1500, 1750),
            speed: diffBranch(1.6, 1.8, 2.0),
            size: 15,
            reward: diffBranch(1, 0, 0),
            dmg: 2,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["stoneresist", "arcane", "laservamp"]
        });

        this.name = "진녹색 파편";
        this.description = "인공적으로 만들어진 진녹색 파편입니다.";
        this.isChild = true;

        this.phase = 0;
        this.period = 4 * fps;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.rotate(pi / 4);
        ctx.fillStyle = "rgb(0, 191, 63)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        const innerSize = (0.8 + 0.1 * sin(this.phase * pi * 2 / this.period)) * size;
        ctx.strokeRect(-innerSize, -innerSize, 2 * innerSize, 2 * innerSize);

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyLivingFortress extends Enemy {
    constructor(position) {
        super(position, {
            kind: "livingfortress",
            hp: diffBranch(220000, 300000, 360000),
            speed: 0.19,
            size: 90,
            reward: 4500,
            dmg: 10000,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.eyePos = [
                        new Vector2(-e.size * 0.61, -e.size * 0.72),
                        new Vector2(-e.size * 0.04, -e.size * 0.53),
                        new Vector2(e.size * 0.57, -e.size * 0.61),
                        new Vector2(-e.size * 0.72, e.size * 0.35),
                        new Vector2(-e.size * 0.21, e.size * 0.12),
                        new Vector2(e.size * 0.24, -e.size * 0.73),
                        new Vector2(e.size * 0.77, e.size * 0.50),
                    ];

                    for (let i = 0; i < 7; i++) {
                        e.eyePeriod[i] = floor(fps + random() * 2 * fps);
                        e.eyeAngle[i] = random() * pi * 2;
                    }
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        let newEnemy = null;
                        if (e.currentPhase == 1) newEnemy = generateEnemy("redcrystal");
                        else if (e.currentPhase == 2) newEnemy = generateEnemy("bluecrystal");
                        else newEnemy = generateEnemy("greencrystal");

                        newEnemy.position = vAdd(e.position.copy(), new Vector2(0, (-1 + 2 * random()) * e.size / 2));
                        enemies.set(newEnemy.id, newEnemy);

                        return true;
                    },
                    period: fps / 2
                },
                {
                    fun: (e) => {
                        const delay = fps * 1.25;
                        const work = (x) => {
                            if (!enemies.has(x.id)) return;

                            const towerCount = towers.size;
                            const stunDuration = max(diffBranch(1.75, 2, 2.25) * fps - towerCount * fps / 20, diffBranch(0.5, 1, 1.25) * fps);

                            const md = {message: "성벽의 울림", origin: x.id, size: x.size, fontSize: 28, floatDistance: 40, pop: true};
                            const mv = new VisualEffect("message", "rgb(47, 71, 104)", fps, x.position, md);
                            const ev = new VisualEffect("radialout", "rgba(47, 71, 104, 0.6)", 3 * fps, x.position, { radius: 4000 });

                            addVisualEffects(mv, ev);

                            const stunStatus = new StunStatus(stunDuration, x.id);
                            for (const [tid, tower] of towers) {
                                towers.set(stunStatus);
                            }
                        };

                        const stopStatus = new StopStatus(delay, e.id);
                        e.setStatusEffect(stopStatus);

                        const vse = new VisualEffect("radialin", "rgba(47, 71, 104, 0.6)", delay, e.position, {radius: 400});
                        addVisualEffects(vse);

                        const dw = new DelayedWork(delay, e.id, work, [e]);
                        addDelayedWorks(dw);

                        return true;
                    },
                    period: fps * 8
                }
            ],
            immunity: ["spawn", "defensestance", "castlehowling", "dangersense", "stoneresist", "freeze", "sturdy", "unstoppable"]
        });

        this.name = "살아있는 요새";
        this.description = "살아 움직이는 기괴한 요새입니다. 그 안에서는 끊임없이 적들이 태어나는 것처럼 보입니다.";
        
        this.isBoss = true;
        this.maxPhase = 3;
        this.phaseCut = [2/3, 1/3];

        this.auraColor = ["rgb(202, 0, 96)", "rgb(0, 91, 202)", "rgb(0, 191, 63)"];
        this.auraPhase = 0;
        this.auraPeriod = 6 * fps;

        this.eyePos = [];
        this.eyePeriod = [];
        this.eyeAngle = [];

        for (let i = 0; i < 7; i++) {
            this.eyePeriod.push(0);
            this.eyeAngle.push(0);
        }
    }

    draw(ctx) {
        if (this.currentPhase < this.maxPhase && this.hp < this.maxHp * this.phaseCut[this.currentPhase - 1]) {
            this.currentPhase++;

            const md = {message: "방어 태세 전환", origin: this.id, size: this.size, fontSize: 26, floatDistance: 40, pop: true};
            const mv = new VisualEffect("message", this.auraColor[this.currentPhase - 1], fps, this.position, md);
            addVisualEffects(mv);

            this.invincible = true;
            const dw = new DelayedWork(diffBranch(2, 3, 4) * fps, this.id, (e) => {e.invincible = false;}, [this]);
            addDelayedWorks(dw);
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        if (ctx == ctxdb) {
            this.auraPhase++;
            const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 1.5);
            rg.addColorStop(0, this.auraColor[this.currentPhase = 1]);
            rg.addColorStop(fitInterval(0.5 + 0.2 * sin(this.auraPhase / this.auraPeriod * pi * 2), 0, 1), this.auraColor[this.currentPhase - 1]);
            rg.addColorStop(1, toTransparent(this.auraColor[this.currentPhase - 1]));

            ctx.beginPath();
            ctx.arc(0, 0, size * 1.5, 0, pi * 2);
            ctx.closePath();

            ctx.fillStyle = rg;
            ctx.fill();
        }

        const upper = "rgb(37, 56, 82)";
        const lower = "rgb(47, 71, 104)";

        ctx.fillStyle = upper;
        ctx.fillRect(-size * 5 / 6, -size, size * 5 / 3, size * 2 / 3);
        ctx.strokeRect(-size * 5 / 6, -size, size * 5 / 3, size * 2 / 3);

        ctx.fillStyle = lower;
        ctx.fillRect(-size, -size / 3, 2 * size, size * 4 / 3);
        ctx.strokeRect(-size, -size / 3, 2 * size, size * 4 / 3);

        const bh = size / 6;
        const bw = size / 3;

        for (let i = 0; i < 4; i++) {
            const offset = (i % 2 == 0) ? bw / 2 : 0;
            const y = -size + bh * i;
            ctx.beginPath();
            ctx.moveTo(-size * 5 / 6, y);
            ctx.lineTo(size * 5 / 6, y);
            ctx.closePath();
            ctx.stroke();

            for (let j = 0; j < 5; j++) {
                const x = -size * 5 / 6 + offset + j * bw;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + bh);
                ctx.closePath();
                ctx.stroke();
            }
        }

        for (let i = 0; i < 8; i++) {
            const offset = (i % 2 == 1) ? bw / 2 : 0;
            const y = -size / 3 + bh * i;
            ctx.beginPath();
            ctx.moveTo(-size, y);
            ctx.lineTo(size, y);
            ctx.closePath();
            ctx.stroke();

            for (let j = 0; j < 6; j++) {
                const x = -size + offset + j * bw;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + bh);
                ctx.closePath();
                ctx.stroke();
            }
        }

        if (ctx == ctxdb) {
            for (let i = 0; i < 7; i++) {
                const ex = this.eyePos[i].x;
                const ey = this.eyePos[i].y;
                const v = sin(this.auraPhase / this.eyePeriod[i] * pi * 2);
                const sh = size * 0.1 * (value < -0.5 ? min(1, value + 1) : 1);
                const lh = size * 0.16;
                
                ctx.beginPath();
                ctx.ellipse(x, y, sh, lh, this.eyeAngle[i], 0, pi * 2);
                ctx.closePath();

                ctx.fillStyle = this.auraColor[this.currentPhase - 1];
                ctx.fill();
                ctx.stroke();
            }
        }

        ctx.restore();
        super.draw(ctx);
    }
}