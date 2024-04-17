/* 
    enemy_s5.js - 2024.03.15

    Implementation of enemies of Stage 5.
*/

class EnemyEliteSummoner extends Enemy {
    constructor(position) {
        super(position, {
            kind: "elitesummoner",
            hp: diffBranch(18000, 25000, 29000),
            speed: 3,
            size: 36,
            reward: 121,
            dmg: 12,
            onDeath: {
                fun: (e) => {
                    const pv = new VisualEffect("portalclose", null, e.portal.delay, e.portal.position, { id: e.portal.id });
                    addVisualEffects(pv);

                    const work = (x) => {
                        const ptl = portals.get(x);
                        if (ptl) ptl.expired = true;
                    };

                    const dw = new DelayedWork(e.portal.delay, e.id, work, [e.portal.id]);
                    addDelayedWorks(dw);
                }
            },
            onSpawn: {
                fun: (e) => {
                    e.changeShield(10000);

                    const hs = new HealStatus(1e18, 50, fps / 30, e.id);
                    const ms = new MysteryShieldStatus(1e18, diffBranch(4, 8, 10), e.id);

                    e.setStatusEffect(hs);
                    e.setStatusEffect(ms);

                    const portalPosition = new Vector2(random() * winX / 6 + winX / 3, e.position.y);

                    e.portal = new Portal(portalPosition, 44, 66, "rgb(0, 216, 0)", "rgb(0, 64, 0)", "rgb(0, 48, 0)", fps, e.drawPeriod, this.id);
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        if (!e.startGen) return false;
                        
                        const c = fitInterval(floor(random() * 3), 0, 2);
                        let newEnemy = null;

                        if (c == 1) newEnemy = generateEnemy("dawnshard");
                        else if (c == 2) newEnemy = generateEnemy("dayshard");
                        else newEnemy = generateEnemy("sunsetshard");

                        newEnemy.position = e.portal.position.copy();
                        newEnemy.isChild = true;

                        const ms = new MysteryShieldStatus(1e18, diffBranch(1, 2, 3), e.id);
                        newEnemy.setStatusEffect(ms);
                        enemies.set(newEnemy.id, newEnemy);

                        const vse = new VisualEffect("growout", "rgb(63, 72, 204)", fps / 2, e.portal.position, { radius: 100});
                        addVisualEffects(vse);

                        return true;
                    },
                    period: fps * 2
                }
            ],
            immunity: ["shieldborn6", "eliteportal", "mysteryborn3", "regen5", "unstoppable"]
        });

        this.name = "에너지 조각 소환사";
        this.description = "미지의 관문을 열어 에너지 조각을 소환합니다.";
        this.startGen = false;
        this.readyGen = false;
        this.drawPhase = 0;
        this.drawPeriod = fps * 4;
        this.portal = null;
    }

    draw(ctx) {
        if (ctx != ctxpd && !this.readyGen && this.position.x <= winX * 0.9) {
            this.readyGen = true;
            const work = (x) => { x.startGen = true; };
            const dw = new DelayedWork(this.portal.delay, this.id, work, [this]);
            addDelayedWorks(dw);

            portals.set(this.portal.id, this.portal);

            const md = {message: "개문", origin: this.id, size: this.size, fontSize: 22, floatDistance: 20, pop: false};
            const mv = new VisualEffect("message", "rgb(0, 160, 0)", fps, this.position, md);
            const pv = new VisualEffect("portalopen", null, this.portal.delay, this.portal.position, { id: this.portal.id });
            addVisualEffects(mv, pv);
        }

        if (this.position.x <= winX * 0.9 && this.drawPhase <= 30 * fps) this.speed = 0;
        else this.speed = 3;

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const p = (this.drawPhase % this.drawPeriod) / this.drawPeriod;

        if (this.startGen) {
            const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 2.5);
            rg.addColorStop(0, "rgb(0, 100, 0)");
            rg.addColorStop(0.8 + 0.15 * sin(this.drawPhase / (fps / 4) * pi * 2), "rgba(0, 100, 0, 0)");
            rg.addColorStop(1, "rgba(0, 100, 0, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(0, 0, size * 2, 0, pi * 2);
            ctx.closePath();
            ctx.fill();
        }

        const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, size);
        rg.addColorStop(0, "rgb(0, 64, 0)");
        rg.addColorStop(0.6 + 0.2 * sin(p * pi * 2), "rgb(0, 64, 0)");
        rg.addColorStop(1, "rgba(0, 64, 0, 0)");
        
        ctx.fillStyle = "rgb(0, 216, 0)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-0.9 * size, -0.9 * size, 1.8 * size, 1.8 * size);

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyDawnShard extends Enemy {
    constructor(position) {
        super(position, {
            kind: "dawnshard",
            hp: diffBranch(4500, 7500, 7500),
            speed: 2.5,
            size: 20,
            reward: 0,
            dmg: 4,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["poisonvamp", "arcane", "unstoppable"]
        });

        this.name = "새벽의 에너지 조각";
        this.description = "에너지가 가득한 새벽의 조각입니다.";
        this.isChild = true;

        this.drawPhase = 0;
        this.drawPeriod = fps * 3;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const small = size * 0.9;
        const large = size * 1.3;
        const p = 0.5 + 0.5 * sin((this.drawPhase / this.drawPeriod * pi * 2));
        const c1 = `rgb(${45 * p + 16 * (1 - p)}, ${54 * p + 16 * (1 - p)}, ${166 * p + 16 * (1 - p)})`;
        const c2 = `rgb(${16 * p + 45 * (1 - p)}, ${16 * p + 54 * (1 - p)}, ${16 * p + 166 * (1 - p)})`;
        
        ctx.beginPath();
        ctx.moveTo(small, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(-small, 0);
        ctx.lineTo(0, -large);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -large);
        ctx.lineTo(-small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -large);
        ctx.lineTo(small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(-small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyDayShard extends Enemy {
    constructor(position) {
        super(position, {
            kind: "dayshard",
            hp: diffBranch(4500, 7500, 7500),
            speed: 2,
            size: 20,
            reward: 0,
            dmg: 4,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["stonevamp", "freeze", "unstoppable"]
        });

        this.name = "한낮의 에너지 조각";
        this.description = "에너지가 가득한 한낮의 조각입니다.";
        this.isChild = true;

        this.drawPhase = 0;
        this.drawPeriod = fps * 3;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const small = size * 0.9;
        const large = size * 1.3;
        const p = 0.5 + 0.5 * sin((this.drawPhase / this.drawPeriod * pi * 2));
        const c1 = `rgb(${123 * p + 205 * (1 - p)}, ${234 * p + 255 * (1 - p)}, ${234 * p + 255 * (1 - p)})`;
        const c2 = `rgb(${205 * p + 123 * (1 - p)}, ${255 * p + 234 * (1 - p)}, ${255 * p + 234 * (1 - p)})`;
        
        ctx.beginPath();
        ctx.moveTo(small, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(-small, 0);
        ctx.lineTo(0, -large);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -large);
        ctx.lineTo(-small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -large);
        ctx.lineTo(small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(-small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemySunsetShard extends Enemy {
    constructor(position) {
        super(position, {
            kind: "sunsetshard",
            hp: diffBranch(4500, 7500, 7500),
            speed: 2.3,
            size: 20,
            reward: 0,
            dmg: 4,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["laservamp", "poison", "unstoppable"]
        });

        this.name = "일몰의 에너지 조각";
        this.description = "에너지가 가득한 일몰의 조각입니다.";
        this.isChild = true;

        this.drawPhase = 0;
        this.drawPeriod = fps * 3;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const small = size * 0.9;
        const large = size * 1.3;
        const p = 0.5 + 0.5 * sin((this.drawPhase / this.drawPeriod * pi * 2));
        const c1 = `rgb(${255 * p + 255 * (1 - p)}, ${0 * p + 255 * (1 - p)}, ${0 * p + 0 * (1 - p)})`;
        const c2 = `rgb(${255 * p + 255 * (1 - p)}, ${255 * p + 0 * (1 - p)}, ${0 * p + 0 * (1 - p)})`;
        
        ctx.beginPath();
        ctx.moveTo(small, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(-small, 0);
        ctx.lineTo(0, -large);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -large);
        ctx.lineTo(-small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -large);
        ctx.lineTo(small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, large);
        ctx.lineTo(-small, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyAccelerator extends Enemy {
    constructor(position) {
        super(position, {
            kind: "accelerator",
            hp: diffBranch(13000, 21000, 24000),
            speed: 1,
            size: 32,
            reward: 95,
            dmg: 6,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["acceclerate", "sturdy"]
        });

        this.name = "주파자";
        this.description = "눈 깜짝할 새에 빨라지는군요. 저지할 수단을 찾아야겠어요.";

        this.drawPhase = 0;
        this.drawPeriod = fps * 3;
    }

    changeHp(d, type, origin) {
        if (d < 0) this.speed += diffBranch(0.2, 0.2, 0.25);
        super.changeHp(d, type, origin);
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();

        const rg = ctx.createRadialGradient(-size / 2, 0, 1, 0, 0, size);
        rg.addColorStop(0, "rgb(255, 255, 255)");
        rg.addColorStop(0.3 + 0.2 * sin(pi * 2 * this.drawPhase / this.drawPeriod), "rgb(255, 255, 255)");
        rg.addColorStop(1, "rgb(0, 0, 120)");

        ctx.fillStyle = rg;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-size / 2, 0, size / 3, 0, pi * 2);
        ctx.closePath();

        const rg2 = ctx.createRadialGradient(-size / 2, 0, 1, -size / 2, 0, size / 3);
        rg2.addColorStop(0, "rgba(0, 0, 0)");
        rg2.addColorStop(0.6 + 0.2 * sin(pi * 2 * this.drawPhase / this.drawPeriod), "rgb(0, 0, 0)");
        rg2.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = rg2;
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyEliteFly extends Enemy {
    constructor(position) {
        super(position, {
            kind: "elitefly",
            hp: diffBranch(2000, 3000, 3000),
            speed: diffBranch(8, 10, 11),
            size: 13,
            reward: 61,
            dmg: 3,
            onDeath: {
                fun: (e) => {
                    const stunRange = 100;
                    const ratio = diffBranch(0.55, 0.5, 0.45);
                    const limitTime = diffBranch(0.7 * fps, 0.8 * fps, 0.9 * fps);
                    const ab = new ActiveBlockStatus(limitTime, e.id);
                    const dd = new DamageDownStatus(limitTime, ratio, e.id);
                    const vse = new VisualEffect("radialout", "rgb(255, 0, 0)", fps / 2, e.position, {radius: stunRange});

                    addVisualEffects(vse);

                    for (const [tid, tower] of towers) {
                        if (e.position.distance(tower.position) > stunRange + tower.size) continue;

                        const md = {message: "피해량 감소", origin: tower.id, size: tower.size, fontSize: 18, floatDistance: 20, pop: false};
                        const md2 = {message: "액티브 사용 불가", origin: tower.id, size: tower.size, fontSize: 18, floatDistance: 20, pop: false, yOffset: 26};
                        const mv = new VisualEffect("message", "rgb(128, 0, 0)", fps / 2, tower.position, md);
                        const mv2 = new VisualEffect("message", "rgb(128, 0, 0)", fps / 2, tower.position, md2);

                        addVisualEffects(mv, mv2);
                        tower.setStatusEffect(ab);
                        tower.setStatusEffect(dd);
                    }
                }
            },
            onSpawn: null,
            onPeriod: [],
            immunity: ["unstoppable", "distractbomb"]
        });

        this.name = "유령 하루살이";
        this.description = "체력도 많고 멈추지도 않는데 초고속이기까지.. 징그러워요.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        ctx.fillStyle = "rgb(16, 0, 0)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();

        ctx.fillStyle = "rgb(216, 0, 0)";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.7, 0, pi * 2);
        ctx.closePath();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyMightySphere extends Enemy {
    constructor(position) {
        super(position, {
            kind: "mightysphere",
            hp: diffBranch(35000, 50000, 65000),
            speed: 0.6,
            size: 52,
            reward: 102,
            dmg: 11,
            onDeath: null,
            onSpawn: null,
            onPeriod: [
                {
                    fun: (e) => {
                        for (const [tid, tower] of towers) {
                            if (e.position.distance(tower.position) > e.size + tower.size) continue;

                            if (tower.sell(diffBranch(1.0, 0.95, 0.9))) {
                                const pos = tower.position.copy();
                                const md = {message: "짓밟힘", origin: null, size: 30, fontSize: 18, floatDistance: 30, pop: false};
                                const mv = new VisualEffect("message", "rgb(115, 91, 57)", fps, pos, md);
                                const sv = new VisualEffect("explodeout", "rgb(115, 91, 57)", fps, pos, {radius: 100});

                                addVisualEffects(mv, sv);
                            }
                        }
                    },
                    period: fps * 1.25
                }
            ],
            immunity: ["mighty", "stone", "freeze", "poison", "laser", "wave", "arcane"]
        });

        this.name = "바위";
        this.description = "거의 모든 면역을 보유한 적입니다. 면역을 없애는 기술이 필요한 순간이 왔군요.";

        if (gameDifficulty == EASY) {
            this.immunity.delete("laser");
            this.immunity.delete("arcane");
        }

        this.drawPhase = 0;
        this.drawPeriod = fps * 12;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const p = this.drawPhase / this.drawPeriod;

        ctx.rotate(-p * pi * 2);
        ctx.beginPath();
        ctx.moveTo(size, 0);

        for (let i = 0; i < 12; i++) {
            ctx.rotate(pi / 6);
            ctx.lineTo(size, 0);
        }
        ctx.closePath();

        const c1 = "rgb(115, 91, 57)";
        const c2 = "rgb(130, 99, 43)";
        const lg = ctx.createLinearGradient(-size, 0, size, 0);

        lg.addColorStop(1, c1);

        for (let i = 0; i < 6; i++) {
            lg.addColorStop(i / 6, i % 2 == 0 ? c1 : c2);
        }

        ctx.fillStyle = lg;
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyPainSphere extends Enemy {
    constructor(position) {
        super(position, {
            kind: "painsphere",
            hp: diffBranch(7500, 9500, 12000),
            speed: 1.75,
            size: 32,
            reward: 104,
            dmg: 6,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["painskin", "reflexskin", "arcane"]
        });

        this.name = "절망의 가시";
        this.description = "건드린 자들은 다들 좋지 않게 끝났다더군요. 건드리고 싶게 생기지도 않았구요.";

        this.drawPhase = 0;
        this.drawPeriod = fps * 4;

        this.stunDuration = fps / 10;
    }

    changeHp(d, type, origin) {
        const tower = towers.get(origin);

        if (tower && d < 0) {
            tower.setStatusEffect(new StunStatus(min(5 * fps, this.stunDuration), this.id));
            this.stunDuration += 2;

            this.changeShield(diffBranch(100, 250, 325), origin);
        }

        super.changeHp(d, type, origin);
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const p = this.drawPhase / this.drawPeriod;

        ctx.fillStyle = "rgb(255, 0, 0)";
        
        for (let i = 0; i < 10; i++) {
            ctx.rotate(pi / 5);
            ctx.beginPath();
            ctx.moveTo(size * 1.2, 0);
            ctx.lineTo(size * 0.9, size * 0.15);
            ctx.lineTo(size * 0.9, -size * 0.15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        const r = 0.4 + 0.15 * cos(p * pi * 2.0);
        const rg = ctx.createRadialGradient(-ratio * size, 0, 1, 0, 0, size);
        rg.addColorStop(0, "rgb(224, 0, 0)");
        rg.addColorStop(0.4, "rgb(224, 0, 0)");
        rg.addColorStop(1, "rgb(32, 0, 0)");

        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();

        ctx.fillStyle = rg;
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyRecoverCube extends Enemy {
    constructor(position) {
        super(position, {
            kind: "recovercube",
            hp: diffBranch(20000, 40000, 45000),
            speed: 0.9,
            size: 37,
            reward: 107,
            dmg: 7,
            onDeath: null,
            onSpawn: null,
            onPeriod: [
                {
                    fun: (e) => {
                        const hs = new HealStatus(1e18, e.maxHp / 6, fps / 2, e.id);
                        e.setStatusEffect(hs);

                        const md = {message: "재생 중첩", origin: null, size: 30, fontSize: 18, floatDistance: 30, pop: false};
                        const mv = new VisualEffect("message", "rgb(232, 19, 131", fps, e.position, md);
                        const vse = new VisualEffect("growout", "rgb(232, 19, 131", fps, e.position, {radius: 100});

                        addVisualEffects(mv, vse);
                        return true;
                    },
                    period: fps * 4
                }
            ],
            immunity: ["recover", "unstoppable"]
        });

        this.name = "재생 육면체";
        this.description = "엄청난 회복의 힘을 보유한 물체입니다.";

        this.drawPhase = 0;
        this.drawPeriod = fps * 10;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const rotatePeriod = this.drawPeriod / 4;
        const baseAngle = floor(this.drawPhase / rotatePeriod) * pi / 2;
        const addiAngle = (this.drawPhase % rotatePeriod) <= rotatePeriod / 8 ? (this.drawPhase % rotatePeriod * 8 / rotatePeriod * pi / 2) : 0;

        ctx.rotate(baseAngle + addiAngle);

        const v1 = [232, 19, 131];
        const v2 = [249, 172, 213];
        const p = 0.5 + 0.5 * sin((this.drawPhase / this.drawPeriod * pi * 2));
        const c1 = `rgb(${v1[0] * p + v2[0] * (1 - p)}, ${v1[1] * p + v2[1] * (1 - p)}, ${v1[2] * p + v2[2] * (1 - p)})`;
        const c2 = `rgb(${v2[0]* p + v1[0] * (1 - p)}, ${v2[1] * p + v1[1] * (1 - p)}, ${v2[2] * p + v1[2] * (1 - p)})`;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.fillStyle = (i + j) % 2 == 0 ? c1 : c2;
                ctx.fillRect(-size + i * 2 * size / 3, -size + j * 2 * size / 3, size * 2 / 3, size * 2 / 3);
                ctx.strokeRect(-size + i * 2 * size / 3, -size + j * 2 * size / 3, size * 2 / 3, size * 2 / 3);
            }
        }
        
        // ctx.rotate(-baseAngle - addiAngle);

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemySilentSoul extends Enemy {
    constructor(position) {
        super(position, {
            kind: "silentsoul",
            hp: diffBranch(11000, 19000, 21000),
            speed: 1.3,
            size: 21,
            reward: 99,
            dmg: 8,
            onDeath: {
                fun: (e) => {
                    e.deadRound = currentRound;
                    e.deadSpeed = e.speed + 1.3;

                    if (e.deaths >= diffBranch(2, 2, 3)) return;

                    const work = (x, pos) => {
                        if (!inRound || x.deadRound != currentRound) return;

                        const enemy = generateEnemy("silentsoul");
                        enemy.position = pos;
                        enemy.reward = 0;
                        enemy.speed = x.deadSpeed;
                        enemy.deaths = x.deaths + 1;
                        
                        enemies.set(enemy.id, enemy);
                        enemy.onSpawn.fun(enemy);

                        const fv = new VisualEffect("radialout", "rgb(32, 32, 32)", fps / 2, pos, { radius: 100});
                        const md = {message: "부활", origin: null, size: x.size, fontSize: 20, floatDistance: 30, pop: true};
                        const mv = new VisualEffect("message", "rgb(255, 255, 255)", fps * 3 / 4, pos, md);

                        addVisualEffects(fv, mv);
                    };

                    const cpy = e.position.copy();

                    const fv = new VisualEffect("radialin", "rgb(32, 32, 32)", fps / 2, cpy, { radius: 100 });
                    const dv = new VisualEffect("soultrace", "rgb(128, 128, 128)", fps * 4, cpy, null);
                    const mv = new VisualEffect("message", "rgb(0, 0, 0)", fps / 2, cpy, {message: "...", origin: null, size: e.size, fontSize: 16, floatDistance: 30, pop: true});
                    addVisualEffects(fv, dv, mv);

                    const dw = new DelayedWork(fps * 4, e.id, work, [e, cpy]);
                    addDelayedWorks(dw);
                }
            },
            onSpawn: {
                fun: (e) => {
                    e.setStatusEffect(new CamoStatus(1e18, e.id));
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        e.changeShield(2000);

                        const fv = new VisualEffect("radialin", "rgb(128, 128, 128)", fps / 2, e.position, {radius: 75});
                        addVisualEffects(fv);

                        return true;
                    },
                    period: diffBranch(4, 3, 2) * fps
                }
            ],
            immunity: ["revive", "laststand", "shieldregen", "camo", "freeze", "arcane", "laservamp"]
        });

        this.name = "침묵의 혼";
        this.description = "죽음에서 돌아오는 괴이한 능력을 가졌습니다.";

        this.drawPhase = 0;
        this.drawPeriod = fps * 10;

        this.deadRound = currentRound;
        this.deadSpeed = this.speed;
        this.deaths = 0;
    }

    changeHp(d, type, origin) {
        if (d < 0) {
            const ec = enemies.size();
            const minRatio = diffBranch(0.6, 0.5, 0.45);

            const a = (1.0 - minRatio) / 3;
            const b = 2 * minRatio - 1;
            const ratio = fitInterval(a * sqrt(ec + 6) + b, minRatio, 1);

            super.changeHp(d * ratio, type, origin);
        }
        else super.changeHp(d, type, origin);
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const angle = this.drawPhase / this.drawPeriod * pi * 2;
        ctx.rotate(-angle);

        const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 1.2);
        rg.addColorStop(0, "rgb(128, 128, 128)");
        rg.addColorStop(0.7 + 0.2 * sin(angle), "rgba(128, 128, 128, 0)");
        rg.addColorStop(1, "rgba(128, 128, 128, 0)");

        ctx.fillStyle = rg;
        ctx.fill();

        const insize = size * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(size, 0);
        
        for (let i = 0; i < 6; i++) {
            ctx.rotate(pi / 3);
            ctx.lineTo(i % 2 == 0 ? insize : size, 0);
        }

        ctx.closePath();
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, size * 1.2, 0, pi * 2);
        ctx.closePath();

        ctx.rotate(angle);

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyBlackKnight extends Enemy {
    constructor(position) {
        super(position, {
            kind: "blackknight",
            hp: diffBranch(40000, 70000, 85000),
            speed: 1.5,
            size: 31,
            reward: 111,
            dmg: 12,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.changeShield(diffBranch(15000, 20000, 25000));
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        for (const [tid, tower] of towers) {
                            if (e.position.distance(tower.position) <= e.size + tower.size) {
                                tower.setStatusEffect(new StunStatus(fps * 2 / 3 + 1, e.id));
                            }
                        }

                        return true;
                    },
                    period: fps * 2 / 3
                },
                {
                    fun: (e) => {
                        const fv = new VisualEffect("radialin", "rgb(16, 16, 16)", fps / 2, e.position, {radius: 100});
                        addVisualEffects(fv);

                        const ms = diffBranch(15000, 20000, 25000);
                        const shield = ms - min(e.shield , ms);
                        e.changeShield(shield);

                        return true;
                    },
                    period: fps * 5
                }
            ],
            immunity: ["knightarmor", "bodyslam", "veteran", "knockback"]
        });

        this.name = "암야의 기사";
        this.description = "어두운 빛을 발하는 기사입니다. 강력해 보이는군요.";

        this.drawPhase = 0;
        this.drawPeriod = fps * 6;

        this.mode = false;
    }

    changeHp(d, type, origin) {
        if (d < 0 && this.mode) 
            super.changeHp(d / 2, type, origin);
        else 
            super.changeHp(d, type, origin);
    }

    draw(ctx) {
        if (this.mode && this.shield <= 0) {
            this.mode = false;
            this.speed = 3;

            const fv = new VisualEffect("radialin", "rgb(255, 0, 0)", fps / 2, this.position, {radius: 75});
            const md = {message: "공격 자세", origin: this.id, size: this.size, fontSize: 22, floatDistance: 30, pop: true};
            const mv = new VisualEffect("message", "rgb(255, 0, 0)", fps * 3 / 4, this.position, md);

            addVisualEffects(fv, mv);
        }
        else if (!this.mode && this.shield > 0) {
            this.mode = true;
            this.speed = 1.5;

            const fv = new VisualEffect("radialin", "rgb(0, 0, 255)", fps / 2, this.position, {radius: 75});
            const md = {message: "방어 자세", origin: this.id, size: this.size, fontSize: 22, floatDistance: 30, pop: true};
            const mv = new VisualEffect("message", "rgb(0, 0, 255)", fps * 3 / 4, this.position, md);

            addVisualEffects(fv, mv);
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const headW = size * 0.9;
        const headH = size * 1.2;
        const edge = size * 0.5;

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-headW, headH);
        ctx.lineTo(headW, headH);
        ctx.lineTo(headW, -headH + edge);
        ctx.lineTo(headW - edge, -headH);
        ctx.lineTo(-headW + edge, -headH);
        ctx.lineTo(-headW, -headH + edge);
        ctx.closePath();

        ctx.fillStyle = "rgb(48, 48, 48)";
        ctx.fill();
        ctx.stroke();

        const alpha = fitInterval(0.3 + 0.2 * sin(this.drawPhase / this.drawPeriod * pi * 2), 0, 1);
        const lg = ctx.createLinearGradient(-headW * 0.7, 0, headW * 0.7, 0);
        const color = this.mode ? "rgba(0, 0, 255, 0)" : "rgba(255, 0, 0, 0)";

        lg.addColorStop(0, color);
        lg.addColorStop(0.5, toAlpha(color, alpha));
        lg.addColorStop(1, color);

        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(-headW * 0.7, -headH * 0.5, headW * 1.4, headH * 0.3);
        ctx.fillStyle = lg;
        ctx.fillRect(-headW * 0.7, -headH * 0.5, headW * 1.4, headH * 0.3);

        ctx.fillStyle = this.mode ? "rgb(30, 30, 60)" : "rgb(60, 30, 30)";
        ctx.fillRect(-headW, headH * 0.2, 2 * headW, headH * 0.8);
        ctx.strokeRect(-headW, headH * 0.2, 2 * headW, headH * 0.8);

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyPastClock extends Enemy {
    constructor(position) {
        super(position, {
            kind: "pastclock",
            hp: diffBranch(44444, 55555, 66666),
            speed: 2.5,
            size: 36,
            reward: 250,
            dmg: 50,
            onDeath: {
                fun: (e) => {
                    for (let x = 0; x < diffBranch(2, 2, 3); x++) {
                        const eList = ["elitesummoner", "accelerator", "mightysphere", "painsphere", "recovercube", "silentsoul"];
                        const i = eList.length;
                        const rand = fitInterval(floor(random() * i), 0, i - 1);

                        spanwQueue.push(new EnemySpawnPattern(eList[rand], 0));
                    }
                }
            },
            onSpawn: null,
            onPeriod: [],
            immunity: ["pastprison", "chaosborn", "unstoppable"]
        });

        this.name = "과거의 상";
        this.description = "되돌아 가라는 것일까요.";

        this.drawPhase = 0;
        this.drawPeriod = diffBranch(4, 3, 2.5) * fps;

        this.bossId = null;
        this.step = 0;
        this.color1 = "rgb(255, 255, 255)";
        this.color2 = "rgb(0, 0, 0)";
    }

    update() {
        super.update();

        const idx = floor(this.drawPhase / this.drawPeriod);
        if (idx > this.step) {
            for (let i = this.step; i < idx; i++) {
                let tower = null;
                let activeTime = 1e18;
                for (const [tid, dt] of towers) {
                    if (dt.activeTimer < activeTime) {
                        activeTime = dt.activeTimer;
                        tower = dt;
                    }
                }

                if (tower == null) continue;

                const md = {message: "액티브 스킬 지연", origin: tower.id, size: tower.size, fontSize: 22, floatDistance: 36, pop: true};
                const mv = new VisualEffect("message", "rgb(0, 0, 0)", fps * 3 / 2, tower.position, md);
                
                const lv = new VisualEffect("laser", "rgb(0, 0, 0)", fps, this.position, {endPosition: tower.position, laserWidth: 10});

                addVisualEffects(mv, lv);
                tower.activeTimer = max(globalGameTimer - tower.activePeriod, tower.activeTimer) + diffBranch(3, 5, 7) * fps;
            }

            this.step = idx;
        }
    }

    draw(ctx) {
        const bumpClock = fps * 2 / 5;
        const cintp = (this.drawPhase / 4) % bumpClock;

        let sizeFactor = 1;
        const maxFactor = 1.06;

        if (cintp >= bumpClock * 0.9) {
            sizeFactor = (cintp - bumpClock * 0.9) * (maxFactor - 1) / (bumpClock * 0.1) + 1;
        }
        else {
            sizeFactor = (cintp - bumpClock * 0.1) * (1 - maxFactor) / (bumpClock * 0.1) + 1;
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size * sizeFactor;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const cw = size * 0.1;
        const ch = size * 0.8;

        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();

        ctx.fillStyle = this.color2;
        ctx.strokeStyle = this.color;

        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, size * 0.9, 0, pi * 2);
        ctx.closePath();

        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.lineWidth = 1;

        ctx.save();
        ctx.rotate(-pi / 2);
        for (let i = 0; i < 12; i++) {
            ctx.rotate(pi / 6);
            ctx.beginPath();
            ctx.moveTo(size * 0.6, 0);
            ctx.lineTo(size * 0.8, 0);
            ctx.stroke();
        }
        ctx.restore();

        ctx.fillStyle = this.color1;
        ctx.strokeStyle = this.color2;

        ctx.save();
        ctx.rotate(-this.drawPhase / this.drawPeriod * pi * 2 - pi / 2);
        ctx.fillRect(0, -cw / 2, ch, cw);
        ctx.strokeRect(0, -cw / 2, ch, cw);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, pi * 2);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyFutureClock extends Enemy {
    constructor(position) {
        super(position, {
            kind: "futureclock",
            hp: diffBranch(44444, 55555, 66666),
            speed: 1.3,
            size: 36,
            reward: 250,
            dmg: 50,
            onDeath: {
                fun: (e) => {
                    for (let x = 0; x < diffBranch(2, 2, 3); x++) {
                        const eList = ["elitesummoner", "accelerator", "mightysphere", "painsphere", "recovercube", "silentsoul"];
                        const i = eList.length;
                        const rand = fitInterval(floor(random() * i), 0, i - 1);

                        spanwQueue.push(new EnemySpawnPattern(eList[rand], 0));
                    }
                }
            },
            onSpawn: null,
            onPeriod: [],
            immunity: ["pastprison", "chaosborn", "unstoppable"]
        });

        this.name = "미래의 상";
        this.description = "끝으로 이끄는군요.";

        this.drawPhase = 0;
        this.drawPeriod = diffBranch(4, 3, 2.5) * fps;

        this.bossId = null;
        this.step = 0;
        this.color1 = "rgb(0, 0, 0)";
        this.color2 = "rgb(255, 255, 255)";
    }

    update() {
        super.update();

        const idx = floor(this.drawPhase / this.drawPeriod);
        if (idx > this.step) {
            for (let i = this.step; i < idx; i++) {
                const boss = enemies.get(bossEnemyId);
                
                if (boss == null) break;

                boss.changeHp(diffBranch(5000, 10000, 20000), null, this.id);
                boss.clockPhase += pi * 2 / diffBranch(240, 144, 120);

                const md = {message: "시간 가속", origin: this.id, size: this.size, fontSize: 22, floatDistance: 36, pop: true};
                const mv = new VisualEffect("message", "rgb(0, 0, 0)", fps * 3 / 2, this.position, md);
                const lv = new VisualEffect("laser", "rgb(160, 160, 160)", fps, this.position, {endPosition: boss.position, laserWidth: 10});

                addVisualEffects(mv, lv);
            }

            this.step = idx;
        }
    }

    draw(ctx) {
        const bumpClock = fps * 2 / 5;
        const cintp = (this.drawPhase / 4) % bumpClock;

        let sizeFactor = 1;
        const maxFactor = 1.06;

        if (cintp >= bumpClock * 0.9) {
            sizeFactor = (cintp - bumpClock * 0.9) * (maxFactor - 1) / (bumpClock * 0.1) + 1;
        }
        else {
            sizeFactor = (cintp - bumpClock * 0.1) * (1 - maxFactor) / (bumpClock * 0.1) + 1;
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size * sizeFactor;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const cw = size * 0.1;
        const ch = size * 0.8;

        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();

        ctx.fillStyle = this.color2;
        ctx.strokeStyle = this.color;

        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, size * 0.9, 0, pi * 2);
        ctx.closePath();

        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.lineWidth = 1;

        ctx.save();
        ctx.rotate(-pi / 2);
        for (let i = 0; i < 12; i++) {
            ctx.rotate(pi / 6);
            ctx.beginPath();
            ctx.moveTo(size * 0.6, 0);
            ctx.lineTo(size * 0.8, 0);
            ctx.stroke();
        }
        ctx.restore();

        ctx.fillStyle = this.color1;
        ctx.strokeStyle = this.color2;

        ctx.save();
        ctx.rotate(-this.drawPhase / this.drawPeriod * pi * 2 - pi / 2);
        ctx.fillRect(0, -cw / 2, ch, cw);
        ctx.strokeRect(0, -cw / 2, ch, cw);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, pi * 2);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyTerminalForm extends Enemy {
    constructor(position) {
        super(position, {
            kind: "terminalform",
            hp: diffBranch(4000000, 6000000, 7500000),
            speed: 0.0694444,
            size: 100,
            reward: 99999,
            dmg: 10000,
            onDeath: {
                fun: (e) => {
                    goldBlocked = false;

                    for (const mid of e.markIds) {
                        const mark = betrayalMarks.get(mid);

                        if (mark) mark.expired = true;
                    }
                }
            },
            onSpawn: {
                fun: (e) => {
                    e.position.x = winX - 1.5 * e.size;

                    addVisualEffects(new VisualEffect("grandenter", null, fps, null, null));
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        const lis = ["blackknight", "pastclock", "futureclock"];
                        const pick = list[fitInterval(floor(random() * 3), 0, 2)];

                        const enemy = generateEnemy(pick);
                        enemies.set(enemy.id, enemy);

                        return true;
                    },
                    period: diffBranch(2.25, 2, 1.75) * fps
                }
            ],
            immunity: ["timeflow", "fateaccel", "betrayalmark", "timereturn", "eternalweak", "randomskin", "arcanepower", "axiomguard", "temporalecho", "unstoppable"]
        });

        this.name = "끝의 형상";
        this.description = "끝인가요.";

        this.drawPhase = 0;
        this.drawPeriod = 4 * fps;

        this.clockPhase = -pi / 36;
        this.clockPeriod = diffBranch(66, 54, 44) * fps;
        this.clockIndex = -1;

        this.isBoss = true;
        this.currentPhase = 1;
        this.maxPhase = 5;
        this.phaseCut = [0.8, 0.6, 0.4, 0.2];

        this.reviveTargets = new Map();
        this.currentTraits = new Set();
        this.markTargets = new Set();
        this.markIds = new Set();

        this.boneColor = "rgb(0, 0, 0)";
        this.handColor = "rgb(255, 255, 255)";
        this.plateColor = "rgb(255, 255, 255)";
        this.upperArcColor = "rgb(0, 0, 0)";
        this.lowerArcColor = "rgb(0, 0, 0)";

        this.arcColorSet = ["rgb(0, 0, 0)", "rgb(0, 194, 210)", "rgb(121, 0, 187)", "rgb(11, 142, 0)", "rgb(216, 0, 0)", "rgb(160, 160, 160)"];
    }

    changeHp(d, type, origin) {
        if (d < 0) {
            const maxReduction = diffBranch(80, 160, 210);
            const towerReduction = min(maxReduction / 2, towers.size * maxReduction / 80);
            const hpReduction = min(maxReduction / 2, maxReduction / 2 * (1 - this.hp / this.maxHp));

            super.changeHp(min(0, d + towerReduction + hpReduction), type, origin);
        }
        else super.changeHp(d, type, origin);
    }

    update() {
        super.update();

        if (this.expired) return;

        // Switch phase.
        if (this.currentPhase < this.maxPhase && this.hp < this.maxHp * this.phaseCut[this.currentPhase - 1]) {
            this.currentPhase++;
            this.clockPeriod -= 6 * fps;

            const mv = new VisualEffect("message", "rgb(0, 0, 255)", fps * 2, this.position, 
                {message: "시간의 흐름 가속..", origin: this.id, size: this.size, fontSize: 36, floatDistance: 36, pop: true});

            const vampRange = 3000;
            const vv = new VisualEffect("radialin", "rgb(0, 0, 0)", fps, this.position, { radius: vampRange });

            const dv = new VisualEffect("darken", null, fps * 2, null, null);
            this.changeShield(this.maxHp / 2);

            const msStatus = new MysteryShieldStatus(1e18, 50, this.id);
            this.setStatusEffect(msStatus);

            addVisualEffects(mv, vv, dv);
        }

        // Handle traits regarding the current position of clock hands.
        const currIdx = floor(this.clockPhase / (pi * 2) * 24);

        for (let i = this.clockIndex + 1; i <= currIdx; i++) {
            switch (i % 24) {
                // 0, 6 of clock: Betrayal mark.
                case 0:
                case 12: {
                    this.markTargets.clear();
                    this.markIds.clear();

                    let dmg = -100;
                    let cost = -100;
                    let dmgTower = null;
                    let costTower = null;

                    // Pick the tower with the highest dealt damage.
                    for (const [tid, tower] of towers) {
                        if (!tower.betrayed && tower.damageDealt > dmg) {
                            dmg = tower.damageDealt;
                            dmgTower = tower;
                        }
                    }

                    if (dmgTower != null) {
                        const bm = new BetrayalMark(dmgTower.position, this.clockPeriod / 3, dmgTower.size * 2.5, this.id);
                        betrayalMarks.set(bm.id, bm);
                        this.markIds.add(bm.id);

                        const bv = new VisualEffect("markready", null, fps / 2, null, { id: bm.id });
                        addVisualEffects(bv);

                        this.markTargets.add(dmgTower.id);
                    }

                    // If the current phase of the boss is high enough, pick the tower with the highest cost too.
                    if (this.currentPhase >= diffBranch(5, 4, 3)) {
                        for (const [tid, tower] of towers) {
                            if (!tower.betrayed && tower.totalCost > cost && (dmgTower == null || dmgTower.id != tid)) {
                                cost = tower.totalCost;
                                costTower = tower;
                            }
                        }

                        if (costTower != null) {
                            const bm = new BetrayalMark(costTower.position, this.clockPeriod / 3, costTower.size * 2.5, this.id);
                            betrayalMarks.set(bm.id, bm);
                            this.markIds.add(bm.id);

                            const bv = new VisualEffect("markready", null, fps / 2, null, { id: bm.id });
                            addVisualEffects(bv);

                            this.markTargets.add(costTower.id);
                        }
                    }

                    // If there were towers which are pointed to be marked, display message.
                    if (this.markTargets.size > 0) {
                        const md = {message: "배반의 낙인 준비..", origin: this.id, size: this.size, fontSize: 38, floatDistance: 36, pop: false};
                        const mv = new VisualEffect("message", "rgb(255, 0, 0)", fps, this.position, md);
                        addVisualEffects(mv);
                    }

                    break;
                }
                // 1, 7 of clock: Apply marks & Save enemy list for revival.
                case 2:
                case 14: {
                    // Save list of enemies for upcoming revival.
                    for (const [eid, enemy] of enemies) {
                        if (eid == this.id) continue;

                        this.reviveTargets.set(eid, {kind: enemy.kind, position: enemy.position.copy()});
                    }

                    // Now, process marks.
                    
                    // Skip if there are no targets to apply mark.
                    if (this.markTargets.size == 0) break;

                    const dv = new VisualEffect("darken", null, fps / 2, null, null);
                    
                    // Give visual effects of applying marks.
                    for (const mid of this.markIds) {
                        const mcv = new VisualEffect("markshutdown", null, fps / 2, null, {id: mid});
                        addVisualEffects(mcv);
                    }

                    const md = {message: "낙인 집행!", origin: this.id, size: this.size, fontSize: 44, floatDistance: 36, pop: false};
                    const mv = new VisualEffect("message", "rgb(255, 0, 0)", fps * 1.5, this.position, md);

                    addVisualEffects(dv, mv);

                    // Apply prepared marks. First apply Sell Block, and apply Betray after 0.5 seconds.
                    for (const tid of this.markTargets) {
                        const tower = towers.get(tid);

                        if (tower != null) {
                            const sb = new SellBlockStatus(1e18, this.id);
                            tower.setStatusEffect(sb);

                            const md2 = {message: "배반의 낙인 새겨짐", origin: tower.id, size: tower.size, fontSize: 26, floatDistance: 36, pop: false};
                            const mv2 = new VisualEffect("message", "rgb(128, 0, 0)", fps, tower.position, md2);
                            addVisualEffects(mv2);
                        }
                    }

                    // Cleanup resources of ended marks.
                    const work = (e) => {
                        for (const tid of e.markTargets) {
                            const tower = towers.get(tid);

                            if (tower != null) {
                                const bt = new BetrayStatus(1e18, e.id);
                                tower.setStatusEffect(bt);
                            }
                        }

                        drawnStatics = false;

                        for (const mid of e.markIds) {
                            const mark = betrayalMarks.get(mid);

                            if (mark) mark.expired = true;
                        }

                        e.markTargets.clear();
                        e.markIds.clear();
                    };

                    const dw = new DelayedWork(fps / 2, this.id, work, [this]);
                    addDelayedWorks(dw);

                    break;
                }
                // 4, 10 of clock: Switching traits.
                case 8:
                case 20: {
                    for (const trait of this.currentTraits) {
                        this.immunity.delete(trait);
                    }

                    let trait1 = null;
                    let trait2 = null;
                    let mstr1 = null;
                    let mstr2 = null;
                    let color1 = null;
                    let color2 = null;

                    const pickRandom = () => floor(random() * 6);

                    if (this.currentPhase <= diffBranch(2, 2, 1)) {
                        const c1 = pickRandom();
                        let c2 = pickRandom();

                        while (c1 == c2) c2 = pickRandom();

                        const v1 = towerKinds[c1];
                        const v2 = towerKinds[c2];
                        color1 = this.arcColorSet[c1];
                        color2 = this.arcColorSet[c2];

                        trait1 = v1 + "resist";
                        trait2 = v2;

                        mstr1 = `${temporaryTowers.get(v1).name} 저항`;
                        mstr2 = `${temporaryTowers.get(v2).name} 면역`;
                    }
                    else if (this.currentPhase <= diffBranch(4, 4, 3)) {
                        const c1 = pickRandom();
                        let c2 = pickRandom();

                        while (c1 == c2) c2 = pickRandom();

                        const v1 = towerKinds[c1];
                        const v2 = towerKinds[c2];
                        color1 = this.arcColorSet[c1];
                        color2 = this.arcColorSet[c2];

                        trait1 = v1;
                        trait2 = v2;

                        mstr1 = `${temporaryTowers.get(v1).name} 면역`;
                        mstr2 = `${temporaryTowers.get(v2).name} 면역`;
                    }
                    else {
                        const c1 = pickRandom();
                        let c2 = pickRandom();

                        while (c1 == c2) c2 = pickRandom();

                        const v1 = towerKinds[c1];
                        const v2 = towerKinds[c2];
                        color1 = this.arcColorSet[c1];
                        color2 = this.arcColorSet[c2];

                        trait1 = v1;
                        trait2 = v2 + "vamp";

                        mstr1 = `${temporaryTowers.get(v1).name} 면역`;
                        mstr2 = `${temporaryTowers.get(v2).name} 흡혈`;
                    }

                    this.immunity.add(trait1);
                    this.immunity.add(Trait2);
                    this.currentTraits.add(trait1);
                    this.currentTraits.add(trait2);

                    this.upperArcColor = color1;
                    this.lowerArcColor = color2;

                    const m1 = {message: mstr1, origin: this.id, size: this.size, fontSize: 28, floatDistance: 36, pop: false};
                    const m2 = {message: mstr1, origin: this.id, size: this.size, fontSize: 28, floatDistance: 36, pop: false, yOffset: 40};
                    const mv1 = new VisualEffect("message", "rgb(88, 0, 176)", fps * 1.5, this.position, m1);
                    const mv2 = new VisualEffect("message", "rgb(88, 0, 176)", fps * 1.5, this.position, m2);

                    addVisualEffects(mv1, mv2);

                    break;
                }
                // 2, 8 of clock: Revival
                case 4:
                case 16: {
                    const md = {message: "태엽 되감기", origin: this.id, size: this.size, fontSize: 28, floatDistance: 36, pop: false};
                    const mv = new VisualEffect("message", "rgb(255, 0, 0)", fps * 1.5, this.position, md);

                    // Revival: revive all enemies of recorded 1-hour before. Only revive enemies of which their ID is not present in the current time of the world.
                    // Revived enemies doesn't give gold reward.
                    for (const [eid, entry] of this.reviveTargets) {
                        if (enemies.has(eid)) continue;

                        const enemy = generateEnemy(entry.kind);

                        if (enemy.onSpawn != null) enemy.onSpawn.fun(enemy);

                        enemy.position = entry.position;
                        enemy.reward = 0;
                        enemies.set(enemy.id, enemy);

                        const rv = new VisualEffect("explodeout", "rgb(255, 0, 0)", fps * 3 / 4, enemy.position, {radius: 75});
                        addVisualEffects(rv);
                    }

                    const av = new VisualEffect("growout", "rgb(255, 0, 0)", fps, this.position, {radius: 600});
                    addVisualEffects(mv, av);

                    // Cleanup revive targets.
                    this.reviveTargets.clear();

                    break;
                }
                // 3 of clock: Permanent attack speed reduction.
                case 6: {
                    const md = {message: "영원의 굴레", origin: this.id, size: this.size, fontSize: 28, floatDistance: 36, pop: false};
                    const mv = new VisualEffect("message", "rgb(115, 92, 23)", fps * 1.5, this.position, md);
                    const hv = new VisualEffect("growout", "rgb(115, 92, 23)", fps * 3 / 4, this.position, {radius: 900});

                    addVisualEffects(mv, hv);

                    const ratio = this.currentPhase >= diffBranch(4, 3, 3) ? 1.2 : 1.1;
                    const ds = new AttackSpeedSlowStatus(1e18, ratio, this.id);

                    for (const [tid, tower] of towers) {
                        if (tower.mysteryShield == 0) {
                            const md2 = {message: "공격 속도 영구 감소", origin: tid, size: tower.size, fontSize: 16, floatDistance: 20, pop: false};
                            const mv2 = new VisualEffect("message", "rgb(115, 92, 23)", fps * 5 / 4, tower.position, md2);

                            addVisualEffects(mv2);
                        }

                        tower.setStatusEffect(ds);
                    }

                    break;
                }
                // 5 of clock: Strengthen enemies.
                case 10: {
                    const md = {message: "이질적인 힘", origin: this.id, size: this.size, fontSize: 28, floatDistance: 36, pop: false};
                    const mv = new VisualEffect("message", "rgb(13, 128, 6)", fps * 1.5, this.position, md);
                    const hv = new VisualEffect("growout", "rgb(13, 128, 6)", fps * 3 / 4, this.position, {radius: 900});

                    addVisualEffects(mv, hv);

                    const baseShield = diffBranch(2500, 5000, 7500);
                    const shield = this.currentPhase >= diffBranch(5, 4, 4) ? baseShield * 2 : baseShield;

                    for (const [eid, enemy] of enemies) {
                        if (eid == this.id) continue;

                        enemy.changeShield(shield);
                        enemy.changeHp(enemy.maxHp, null, this.id);

                        const ms = new MysteryShieldStatus(1e18, diffBranch(5, 6, 7), this.id);
                        enemy.setStatusEffect(ms);
                    }

                    break;
                }
                // 9 of clock: Invincibility & Heal.
                case 18: {
                    const md = {message: "법칙의 보호", origin: this.id, size: this.size, fontSize: 28, floatDistance: 36, pop: false};
                    const mv = new VisualEffect("message", "rgb(255, 89, 0)", fps * 1.5, this.position, md);
                    const hv = new VisualEffect("growout", "rgb(0, 0, 180)", fps * 3 / 4, this.position, {radius: 300});
                    const iv = new VisualEffect("radialin", "rgb(255, 128, 0)", fps * 3 / 4, this.position, {radius: 600});

                    addVisualEffects(mv, hv, iv);

                    let invTime = diffBranch(2, 2.75, 3.25) * fps;
                    if (this.currentPhase >= 2) invTime += 0.5 * fps;
                    if (this.currentPhase >= 4) invTime += 0.5 * fps;

                    this.invincible = true;
                    const dw = new DelayedWork(invTime, this.id, (x) => {x.invincible = false; }, [this]);
                    addDelayedWorks(dw);

                    const baseHeal = diffBranch(300000, 400000, 550000);
                    const lostRatio = diffBranch(0.06, 0.06, 0.08);

                    this.changeHp(baseHeal + (this.maxHp - this.hp) * lostRatio, null, this.id);
                    break;
                }
                // 11 of clock: Stun + Gold block.
                case 22: {
                    const md = {message: "시간의 메아리", origin: this.id, size: this.size, fontSize: 28, floatDistance: 36, pop: false};
                    const mv = new VisualEffect("message", "rgb(0, 156, 255)", fps * 1.5, this.position, md);
                    const hv = new VisualEffect("growout", "rgb(0, 156, 255)", fps * 3 / 4, this.position, {radius: 900});

                    const ss = new StunStatus(diffBranch(1.5, 2, 2.5) * fps, this.id);
                    for (const [x, tower] of towers) {
                        tower.setStatusEffect(ss);
                    }

                    addVisualEffects(mv, hv);

                    goldBlocked = true;
                    const dw = new DelayedWork(diffBranch(1, 1, 1.5) * fps, this.id, () => {goldBlocked = false; }, []);
                    addDelayedWorks(dw);

                    break;
                }
                default:
                    break;
            }

            this.clockIndex = currIdx;
        }
    }

    setStatusEffect(ste) {
        switch (ste.kind) {
            case "stun":
            case "slow":
            case "cold":
            case "knockback":
            case "freeze":
                return;
        }

        super.setStatusEffect(ste);
    }

    draw(ctx) {
        const bumpClock = fps * 2 / 5;
        const cintp = (this.clockPhase * 720 / pi / 2) % bumpClock;

        let sizeFactor = 1;
        const maxFactor = 1.06;

        if (cintp >= bumpClock * 0.9) {
            sizeFactor = (cintp - bumpClock * 0.9) * (maxFactor - 1) / (bumpClock * 0.1) + 1;
        }
        else {
            sizeFactor = (cintp - bumpClock * 0.1) * (1 - maxFactor) / (bumpClock * 0.1) + 1;
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size * sizeFactor;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;
        this.clockPhase += pi * 2 / this.clockPeriod;

        // Aura effect
        const auraSize = size * 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, auraSize, 0, pi * 2);
        ctx.closePath();

        const arg = ctx.createRadialGradient(0, 0, 1, 0, 0, auraSize);
        arg.addColorStop(0, "rgb(0, 0, 0)");
        arg.addColorStop(0.6 + 0.2 * sin(this.drawPhase / this.drawPeriod * pi * 2), "rgb(0, 0, 0)");
        arg.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = arg;
        ctx.fill();

        // Outermost spikes
        ctx.save();
        ctx.rotate(-this.clockPhase / 2);
        ctx.fillStyle = this.boneColor;
        for (let i = 0; i < 12; i++) {
            ctx.rotate(pi / 6);
            ctx.beginPath();
            ctx.moveTo(size * 1.1, 0);
            ctx.lineTo(size * 0.95, size * 0.05);
            ctx.lineTo(size * 0.95, -size * 0.05);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        // White base
        ctx.fillStyle = this.plateColor;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.fill();

        // Arc gradation
        ctx.save();
        const arcp = this.clockPeriod / 16;

        for (let i = 0; i < 12; i++) {
            // MEMO: this expression is almost constant... may rewrite later.
            const alpha = fitInterval(0.6 + 0.2 * sin(pi * 2 * ((i * arcp / 6) % arcp) / arcp), 0, 1);
            ctx.fillStyle = toAlpha(i >= 6 ? this.lowerArcColor : this.upperArcColor, alpha);

            ctx.beginPath();
            ctx.arc(0, 0, size * 0.45, pi / 6, 0, true);
            ctx.arc(0, 0, size, 0, pi / 6, false);
            ctx.closePath();

            ctx.fill();
            ctx.rotate(pi / 6);
        }

        ctx.restore();

        // Outermost frame
        ctx.fillStyle = this.boneColor;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2, true);
        ctx.arc(0, 0, size * 0.8, 0, pi * 2, false);
        ctx.fill();

        // Middle spikes
        ctx.save();
        ctx.rotate(this.clockPhase / 2);
        for (let i = 0; i < 12; i++) {
            ctx.rotate(pi / 6);
            ctx.beginPath();
            ctx.moveTo(size * 0.75, 0);
            ctx.lineTo(size * 0.65, size * 0.05);
            ctx.lineTo(size * 0.65, -size * 0.05);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        // Middle frame
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.7, 0, pi * 2, true);
        ctx.arc(0, 0, size * 0.55, 0, pi * 2, false);
        ctx.fill();

        // Innermost spikes
        ctx.save();
        ctx.rotate(-this.clockPhase / 2);
        for (let i = 0; i < 12; i++) {
            ctx.rotate(pi / 6);
            ctx.beginPath();
            ctx.moveTo(size * 0.5, 0);
            ctx.lineTo(size * 0.4, size * 0.05);
            ctx.lineTo(size * 0.4, -size * 0.05);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Innermost frame
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.45, 0, pi * 2, true);
        ctx.arc(0, 0, size * 0.35, 0, pi * 2, false);
        ctx.fill();

        // Inner pop animation
        const popPeriod = fps * 2;
        const p = (this.drawPhase % popPeriod) / popPeriod;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.5 * p, 0, pi * 2);
        ctx.closePath();
        
        const pa = fitInterval(0.6 - p * 2, 0, 1);
        ctx.fillStyle = toAlpha("rgb(0, 0, 0)", pa);
        ctx.fill();

        // Hour frames: perpendicular to border
        ctx.save();
        ctx.rotate(-pi / 2);
        ctx.lineWidth = size / 100;
        for (let i = 0; i < 12; i++) {
            ctx.rotate(pi / 6);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, size);
            ctx.stroke();
        }
        ctx.restore();

        // Clock hands.
        const hl1 = size * 0.72;
        const hw1 = size * 0.1;
        const hl2 = size * 0.96;
        const hw2 = size * 0.12;

        // Minute hand.
        const ha2 = this.clockPhase * 12 - pi / 2;

        ctx.save();
        ctx.rotate(ha2);
        ctx.beginPath();
        ctx.moveTo(0, -hw2 / 2);
        ctx.lineTo(hl2 - hw2, -hw2 / 2);
        ctx.lineTo(hl2, 0);
        ctx.lineTo(hl2 - hw2, hw2 / 2);
        ctx.lineTo(0, hw2 / 2);
        ctx.closePath();

        ctx.fillStyle = this.handColor;
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Hour hand.
        const ha1 = this.clockPhase - pi / 2;

        ctx.save();
        ctx.rotate(ha1);
        ctx.beginPath();
        ctx.moveTo(0, -hw1 / 2);
        ctx.lineTo(hl1 - hw1 -hw1 / 2);
        ctx.lineTo(hl1, 0);
        ctx.lineTo(hl1 - hw1, hw1 / 2);
        ctx.lineTo(0, hw1 / 2);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Clock center.
        ctx.fillStyle = this.boneColor;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.15, 0, pi * 2);
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}