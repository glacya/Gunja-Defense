/* 
    enemy_s4.js - 2024.03.10

    Implementation of enemies on Stage 4.
*/

class EnemyImmSphere extends Enemy {
    constructor(position) {
        super(position, {
            kind: "immsphere",
            hp: 1,
            speed: diffBranch(1, 1.3, 1.6),
            size: 26,
            reward: 74,
            dmg: 7,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["stonevamp", "freezevamp", "poisonvamp", "laservamp", "wavevamp", "arcanevamp"],
        });

        if (gameDifficulty != EASY) {
            this.immunity.add("unstoppable");
        }

        this.name = "블랙홀 구체";
        this.description = "궁극의 공격 흡혈을 보이는 구체입니다. 처치할 방법이 있긴 한건가요..?";
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

        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const rg = ctx.createRadialGradient(0, 0, 10, 0, 0, size);
        rg.addColorStop(0, "rgb(255, 255, 255)");
        rg.addColorStop(0.5 + 0.2 * sin(this.drawPhase / this.drawPeriod * pi * 2), "rgba(255, 255, 255, 0)");
        rg.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyEndurer extends Enemy {
    constructor(position) {
        super(position, {
            kind: "endurer",
            hp: diffBranch(2500, 3500, 4000),
            speed: 3,
            size: 22,
            reward: 61,
            dmg: 3,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["ragelimit", "freeze", "wave", "slow"]
        });

        this.name = "인내하는 자";
        this.description = "끓어오르는 분노를 억누르고 있습니다. 터져나오는 분노를 조심하세요.";
        this.raged = false;
    }

    draw(ctx) {
        if (!this.raged && this.hp < this.maxHp * diffBranch(0.5, 0.5, 0.7)) {
            this.raged = true;
            this.speed = 6;

            const md = {message: "분노 폭발", origin: this.id, size: this.size, fontSize: 20, floatDistance: 40, pop: true};
            const mv = new VisualEffect("message", "rgb(255, 0, 0)", fps, this.position, md);
            addVisualEffects(mv);
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const lg = ctx.createLinearGradient(-size, size, size, -size);
        lg.addColorStop(0, "rgb(255, 0, 0)");
        lg.addColorStop(0.5, "rgb(255, 255, 0)");
        lg.addColorStop(1, "rgb(255, 0, 0)");
        
        ctx.fillStyle = lg;
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyPotentSeed extends Enemy {
    constructor(position) {
        super(position, {
            kind: "potentseed",
            hp: diffBranch(2000, 3300, 4500),
            speed: 1.5,
            size: 16,
            reward: 0,
            dmg: 4,
            onDeath: {
                fun: (e) => {
                    const c = fitInterval(floor(random() * 3), 0, 2);

                    let enemy = null;
                    if (c == 0) enemy = generateEnemy("waterflower");
                    else if (c == 1) enemy = generateEnemy("ironflower");
                    else enemy = generateEnemy("windflower");

                    const md = {message: "생명의 개화", origin: e.id, size: e.size, fontSize: 22, floatDistance: 40, pop: false};
                    const mv = new VisualEffect("message", "rgb(0, 255, 255)", fps, e.position, md);
                    const rv = new VisualEffect("radialout", "rgb(0, 255, 255)", fps, e.position, { radius: 60});

                    addVisualEffects(mv, rv);

                    enemy.position = e.position.copy();
                    enemies.set(enemy.id, enemy);

                    enemy.onSpawn.fun(enemy);
                }
            },
            onSpawn: null,
            onPeriod: [],
            immunity: ["potent", "stun", "knockback"]
        });

        this.name = "가능성의 씨앗";
        this.description = "평범해 보이지만.. 어떤 가능성이 숨겨져 있는지는 모릅니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const lg = ctx.createLinearGradient(0, size, 0, -size);
        lg.addColorStop(0, "rgb(112, 0, 0)");
        lg.addColorStop(1, "rgb(0, 0, 0)");
        
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();

        const ra = size * 1.2;
        const rb = size * 1.6;

        ctx.fillStyle = "rgb(87, 239, 61)";
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(-ra / 2, -size - rb - ra, -size);
        ctx.quadraticCurveTo(-ra / 2, -size + rb, 0, -size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(ra / 2, -size - rb, ra, -size);
        ctx.quadraticCurveTo(ra / 2, -size + rb, 0, -size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyWaterFlower extends Enemy {
    constructor(position) {
        super(position, {
            kind: "waterflower",
            hp: diffBranch(3000, 5000, 5500),
            speed: 2.5,
            size: 20,
            reward: 90,
            dmg: 4,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.invincible = true;
                    const dw = new DelayedWork(fps / 2, e.id, (x) => { x.invincible = false; }, [e]);
                    addDelayedWorks(dw);

                    const range = 300;
                    const as = new AttackSpeedSlowStatus(fps * 2, 1.3, e.id);

                    for (const [tid, tower] of towers) {
                        if (e.position.distance(tower.position) <= range + tower.size) {
                            tower.setStatusEffect(as);
                        }
                    }
                }
            },
            onPeriod: [],
            immunity: ["waterborn"]
        });

        this.name = "수운초";
        this.description = "물의 기운을 머금은 식물입니다. 물살이 없는데도 물살이 치는 것 같군요.";
        
        this.angle = 0;
        this.period = fps * 8;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        const centerColor = "rgb(255, 255, 0)";
        const leafInner = "rgb(0, 255, 255)";
        const leafOuter = "rgb(0, 0, 255)";

        if (!this.stunned && !this.frozen && !this.knockback) this.angle++;

        ctx.rotate(-this.angle * pi * 2 / this.period);

        const ix = size * 0.4;
        const ox = size * 1.2;
        const mx = (ix + ox) / 2;
        const my = size * 0.5;

        ctx.fillStyle = centerColor;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const lg = ctx.createLinearGradient(ix, 0, ox, 0);
        lg.addColorStop(0, leafInner);
        lg.addColorStop(1, leafOuter);
        
        ctx.fillStyle = lg;

        for (let i = 0; i < 8; i++) {
            ctx.rotate(pi / 4);
            ctx.beginPath();
            ctx.moveTo(ix, 0);
            ctx.quadraticCurveTo(mx, my, ox, 0);
            ctx.quadraticCurveTo(mx, -my, ix, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyIronFlower extends Enemy {
    constructor(position) {
        super(position, {
            kind: "ironflower",
            hp: diffBranch(4500, 6000, 6500),
            speed: 2,
            size: 20,
            reward: 90,
            dmg: 4,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    const fv = new VisualEffect("radialin", "rgb(128, 128, 128)", fps / 2, e.position, {radius: 200});
                    addVisualEffects(fv);

                    e.invincible = true;
                    const dw = new DelayedWork(fps / 2, e.id, (x) => { x.invincible = false; }, [e]);
                    addDelayedWorks(dw);

                    e.changeShield(5000, e.id);
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        const fv = new VisualEffect("radialin", "rgb(128, 128, 128)", fps / 2, e.position, {radius: 200});
                        addVisualEffects(fv);

                        const shield = 5000 - min(e.shield, 5000);
                        e.changeShield(shield, e.id);

                        return true;
                    },
                    period: 3 * fps
                }
            ],
            immunity: ["ironborn"]
        });

        this.name = "금입초";
        this.description = "강철의 기운을 머금은 식물입니다. 식물이라고는 믿기지 않을 정도의 강도입니다.";
        
        this.angle = 0;
        this.period = fps * 10
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        const centerColor = "rgb(255, 255, 0)";
        const leafInner = "rgb(128, 128, 128)";
        const leafOuter = "rgb(192, 192, 192)";

        if (!this.stunned && !this.frozen && !this.knockback) this.angle++;

        ctx.rotate(-this.angle * pi * 2 / this.period);

        const ix = size * 0.4;
        const ox = size * 1.2;
        const mx = (ix + ox) / 2;
        const my = size * 0.45;

        ctx.fillStyle = centerColor;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const lg = ctx.createLinearGradient(ix, 0, ox, 0);
        lg.addColorStop(0, leafInner);
        lg.addColorStop(1, leafOuter);
        
        ctx.fillStyle = lg;

        for (let i = 0; i < 9; i++) {
            ctx.rotate(pi / 4.5);
            ctx.beginPath();
            ctx.moveTo(ix, 0);
            ctx.quadraticCurveTo(mx, my, ox, 0);
            ctx.quadraticCurveTo(mx, -my, ix, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyWindFlower extends Enemy {
    constructor(position) {
        super(position, {
            kind: "windflower",
            hp: diffBranch(3500, 4000, 4400),
            speed: 3,
            size: 20,
            reward: 90,
            dmg: 4,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.invincible = true;
                    const dw = new DelayedWork(fps / 2, e.id, (x) => { x.invincible = false; }, [e]);
                    addDelayedWorks(dw);

                    const range = 300;
                    const hs = new HasteStatus(1e18, 1.3, e.id);

                    for (const [eid, enemy] of enemies) {
                        if (e.position.distance(enemy.position) <= range + enemy.size) {
                            enemy.setStatusEffect(hs);
                        }
                    }
                }
            },
            onPeriod: [],
            immunity: ["windborn"]
        });

        this.name = "연풍초";
        this.description = "바람의 기운을 머금은 식물입니다. 고요하지만 강한 느낌이 듭니다.";
        
        this.angle = 0;
        this.period = fps * 4;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        const centerColor = "rgb(255, 255, 0)";
        const leafInner = "rgb(168, 255, 168)";
        const leafOuter = "rgb(0, 255, 0)";

        if (!this.stunned && !this.frozen && !this.knockback) this.angle++;

        ctx.rotate(-this.angle * pi * 2 / this.period);

        const ix = size * 0.4;
        const ox = size * 1.2;
        const mx = (ix + ox) / 2;
        const my = size * 0.5;

        ctx.fillStyle = centerColor;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const lg = ctx.createLinearGradient(ix, 0, ox, 0);
        lg.addColorStop(0, leafInner);
        lg.addColorStop(1, leafOuter);
        
        ctx.fillStyle = lg;

        for (let i = 0; i < 7; i++) {
            ctx.rotate(pi / 3.5);
            ctx.beginPath();
            ctx.moveTo(ix, 0);
            ctx.quadraticCurveTo(mx, my, ox, 0);
            ctx.quadraticCurveTo(mx, -my, ix, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyFlareGuard extends Enemy {
    constructor(position) {
        super(position, {
            kind: "flareguard",
            hp: diffBranch(6000, 7500, 9500),
            speed: 1.5,
            size: 28,
            reward: 76,
            dmg: 6,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["flareguard", "slow", "knockback"]
        });

        this.name = "불의 수호 고리";
        this.description = "강력한 수호의 불꽃을 두른 적입니다. 불을 식히기 전에는 어떠한 공격도 통하지 않을 것처럼 보입니다.";
        
        this.phase = 0;
        this.period = 5 * fps;
        this.cooldowned = false;
        this.freezeDamage = 0;
    }

    changeHp(d, type, origin) {
        if (this.cooldowned || type == "freeze" || type == "absolute") {
            const currentHp = this.hp;
            super.changeHp(d, type, origin);

            if (type == "freeze")
                this.freezeDamage += currentHp - this.hp;
        }
    }

    draw(ctx) {
        if (!this.cooldowned && this.freezeDamage >= diffBranch(500, 1000, 3000)) {
            this.cooldowned = true;

            const fv = new VisualEffect("radialout", "rgba(0, 0, 255, 0.1)", fps * 3 / 4, this.position, {radius: 150});
            const md = {message: "수호의 불꽃 꺼짐", origin: this.id, size: this.size, fontSize: 20, floatDistance: 40, pop: false};
            const mv = new VisualEffect("message", "rgb(0, 0, 255)", fps * 3 / 4, this.position, md);

            addVisualEffects(fv, mv);
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.phase++;

        const outer = this.cooldowned ? "rgb(112, 0, 0)" : "rgb(255, 0, 0)";
        const mid = this.cooldowned ? "rgb(70, 0, 0)" : "rgb(255, 128, 0)";
        const inner = this.cooldowned ? "rgb(36, 0, 0)" : "rgb(255, 255, 0)";

        const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, size);
        rg.addColorStop(0, inner);
        rg.addColorStop(0.5 + 0.2 * sin(this.phase / this.period * pi * 2), mid);
        rg.addColorStop(1, outer);

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (!this.cooldowned) {
            const rp = size * (1.1 + 0.1 * sin(this.phase / this.period * pi * 2));

            const clear = toTransparent(outer);
            const rg2 = ctx.createRadialGradient(0, 0, rp, 0, 0, rp + 10);
            rg2.addColorStop(0, clear);
            rg2.addColorStop(0.5, outer);
            rg2.addColorStop(1, clear)

            ctx.beginPath();
            ctx.arc(0, 0, rp + 10, 0, pi * 2);
            ctx.closePath();
            ctx.fillStyle = rg2;
            ctx.fill();
        }

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyEliteShielded extends Enemy {
    constructor(position) {
        super(position, {
            kind: "eliteshielded",
            hp: 6000,
            speed: 1,
            size: 32,
            reward: 77,
            dmg: 7,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.changeShield(4000);
                }
            },
            onPeriod: [],
            immunity: ["shieldborn5", "rigidskin", "projectile", "unstoppable"]
        });

        this.name = "금속화 방패병";
        this.description = "금속과 동화되어버린 기괴한 병사입니다. 견고함이 인상적인 수준이군요.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        const lg = ctx.createLinearGradient(-size, -size, size, size);
        lg.addColorStop(0, "rgb(0, 88, 121)");
        lg.addColorStop(0.5, "rgb(164, 230, 255)");
        lg.addColorStop(1, "rgb(0, 88, 121)");
        
        ctx.fillStyle = lg;
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyEliteRogue extends Enemy {
    constructor(position) {
        super(position, {
            kind: "eliterogue",
            hp: diffBranch(1750, 3000, 3500),
            speed: diffBranch(4.0, 4.3, 4.6),
            size: 28,
            reward: 65,
            dmg: 5,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.setStatusEffect(new CamoStatus(1e18, e.id));
                }
            },
            onPeriod: [],
            immunity: ["camo", "freezeresist", "stone", "arcane", "slow", "knockback"]
        });

        this.name = "베테랑 도적";
        this.description = "굉장한 실력을 보유한 도적입니다. 생각보다 날렵한데요!";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = "rgb(85, 28, 44)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.fillStyle = "rgb(146, 12, 12)";
        ctx.fillRect(-size, -size * 2 / 3, 2 * size, size * 2 / 3);
        ctx.strokeRect(-size, -size * 2 / 3, 2 * size, size * 2 / 3);
        
        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyRandomSphere extends Enemy {
    constructor(position) {
        super(position, {
            kind: "randomsphere",
            hp: diffBranch(4500, 7000, 8000),
            speed: diffBranch(3, 3.2, 3.4),
            size: 24,
            reward: 69,
            dmg: 4,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    const set = new Set();
                    const colors = ["rgb(64, 64, 64)", "rgb(33, 215, 235)", "rgb(145, 50, 201)", "rgb(39, 151, 30)", "rgb(255, 0, 0)", "rgb(240, 240, 240)"];

                    while (set.size < 3) {
                        const idx = fitInterval(floor(random() * 6), 0, 5);
                        set.add(idx);
                    }

                    e.colors = [];
                    for (const idx of set) {
                        e.colors.push(colors[idx]);
                        e.immunity.add(towerKinds[idx]);
                    }

                    const ms = new MysteryShieldStatus(1e18, 2, e.id);
                    e.setStatusEffect(ms);
                }
            },
            onPeriod: [],
            immunity: ["randomvamp", "mysteryborn1", "slow", "sturdy"]
        });

        this.name = "혼돈의 구체";
        this.description = "굉장히 개성있는 구체입니다. 저마다 다른 특색을 갖고 있다고 하는군요.";

        this.drawPhase = 0;
        this.drawPeriod = 4 * fps;
        this.colors = ["rgb(33, 215, 235)", "rgb(39, 151, 30)", "rgb(255, 0, 0)"];
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        if (!this.stunned && !this.frozen && !this.knockback) this.drawPhase++;

        ctx.rotate(-pi / 2 * sin(pi * 2.0 * this.drawPhase / this.drawPeriod));

        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.rotate(pi * 2 / 3);
            ctx.beginPath();
            ctx.arc(0, 0, size, 0, pi * 2 / 3);
            ctx.lineTo(0, 0);
            ctx.closePath();

            ctx.fillStyle = this.colors[i];
            ctx.fill();
            ctx.stroke();
        }

        ctx.fillStyle = "rgb(255, 255, 0)";
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.lineWidth = 1;
        
        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyPoisonMaster extends Enemy {
    constructor(position) {
        super(position, {
            kind: "poisonmaster",
            hp: diffBranch(3400, 6000, 6600),
            speed: 1.7,
            size: 30,
            reward: 73,
            dmg: 8,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    const ms = new MysteryShieldStatus(1e18, 2, e.id);
                    e.setStatusEffect(ms);

                    const cs = new CamoStatus(1e18, e.id);
                    e.setStatusEffect(cs);
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        const as = new AttackSpeedSlowStatus(2 * fps, 1.25, e.id);
                        let damage = 0;
                        let id = null;
    
                        for (const [tid, tower] of towers) {
                            if (tower.attackSpeedFactor > 0.5 && tower.damageDealt >= damage) {
                                id = tid;
                                damage = tower.damageDealt;
                            }
                        }
    
                        if (id == null) return false;
    
                        const tower = towers.get(id);
    
                        if (tower.mysteryShield == 0) {
                            const md = {message: "공격 속도 감소", origin: id, size: tower.size, fontSize: 18, floatDistance: 20, pop: false};
                            const mv = new VisualEffect("message", "rgb(47, 71, 104)", fps / 2, tower.position, md);
                            addVisualEffects(mv);
                        }
    
                        tower.setStatusEffect(as);
    
                        const vse = new VisualEffect("laser", "rgb(181, 11, 120)", fps / 3, e.position, {endPosition: tower.position, laserWidth: 15});
                        addVisualEffects(vse);
    
                        return true;
                    },
                    period: 2 * fps
                }
            ],
            immunity: ["camo", "poisonvamp", "mysteryborn1", "inject2"]
        });

        this.name = "신경독 박사";
        this.description = "아주 강력한 독을 사용하는 지능적인 적입니다. 독에는 따라올 자가 없다고 할 정도랍니다.";

        this.drawPhase = 0;
        this.drawPeriod = 4 * fps;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        const p = (this.drawPhase % this.drawPeriod) / this.drawPeriod;

        const lg = ctx.createLinearGradient(-2 * size, 2 * size, 2 * size, -2 * size);
        lg.addColorStop(0, "rgb(115, 6, 77)");
        lg.addColorStop(fitInterval(p - 0.3, 0, 1), "rgb(115, 6, 77)");
        lg.addColorStop(p, "rgb(243, 67, 82)");
        lg.addColorStop(fitInterval(p + 0.3, 0, 1), "rgb(115, 6, 77)");
        lg.addColorStop(1, "rgb(115, 6, 77)");

        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
        super.draw(ctx);
    }
}

class EnemySummoner extends Enemy {
    constructor(position) {
        super(position, {
            kind: "summoner",
            hp: diffBranch(5000, 8000, 1000),
            speed: 3,
            size: 30,
            reward: 81,
            dmg: 10,
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
                    e.changeShield(7500);

                    const hs = new HealStatus(1e18, 50, fps / 10, e.id);
                    e.setStatusEffect(hs);

                    const portalPosition = new Vector2(random() * winX / 6 + winX / 3, e.position.y);

                    e.portal = new Portal(portalPosition, 40, 60, "rgb(138, 185, 255)", "rgb(6, 106, 255)", "rgb(63, 72, 204)", fps, e.drawPeriod, this.id);
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        if (!e.startGen) return false;
                        
                        const c = fitInterval(floor(random() * 3), 0, 2);
                        let newEnemy = null;

                        if (c == 1) newEnemy = generateEnemy("redcrystal");
                        else if (c == 2) newEnemy = generateEnemy("bluecrystal");
                        else newEnemy = generateEnemy("greencrystal");

                        newEnemy.position = e.portal.position.copy();
                        newEnemy.isChild = true;

                        enemies.set(newEnemy.id, newEnemy);

                        const vse = new VisualEffect("growout", "rgb(63, 72, 204)", fps / 2, e.portal.position, { radius: 100});
                        addVisualEffects(vse);

                        return true;
                    },
                    period: fps * 2
                }
            ],
            immunity: ["shieldborn7", "portal", "regen3", "unstoppable"]
        });

        this.name = "파편 소환사";
        this.description = "신비한 관문을 열어 파편을 소환합니다. 위협적이군요.";
        this.startGen = false;
        this.readyGen = false;
        this.drawPhase = 0;
        this.drawPeriod = fps * 4;
        this.portal = null;
    }

    draw(ctx) {
        if (ctx != ctxpd && !this.readyGen && this.position.x <= winX * 0.85) {
            this.readyGen = true;
            const work = (x) => { x.startGen = true; };
            const dw = new DelayedWork(this.portal.delay, this.id, work, [this]);
            addDelayedWorks(dw);

            portals.set(this.portal.id, this.portal);

            const md = {message: "관문 설치", origin: this.id, size: this.size, fontSize: 22, floatDistance: 20, pop: false};
            const mv = new VisualEffect("message", "rgb(0, 0, 160)", fps, this.position, md);
            const pv = new VisualEffect("portalopen", null, this.portal.delay, this.portal.position, { id: this.portal.id });
            addVisualEffects(mv, pv);
        }

        if (this.position.x <= winX * 0.85 && this.drawPhase <= 30 * fps) this.speed = 0;
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
            rg.addColorStop(0, "rgb(0, 255, 255)");
            rg.addColorStop(0.8 + 0.15 * sin(this.drawPhase / (fps / 4) * pi * 2), "rgba(0, 255, 255, 0)");
            rg.addColorStop(1, "rgba(0, 255, 255, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(0, 0, size * 2, 0, pi * 2);
            ctx.closePath();
            ctx.fill();
        }

        const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, size);
        rg.addColorStop(0, "rgb(21, 133, 255)");
        rg.addColorStop(0.6 + 0.2 * sin(p * pi * 2), "rgb(21, 133, 255)");
        rg.addColorStop(1, "rgba(21, 133, 255, 0)");
        
        ctx.fillStyle = "rgb(0, 0, 160)";
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

class EnemyEliteHealer extends Enemy {
    constructor(position) {
        super(position, {
            kind: "elitehealer",
            hp: diffBranch(4444, 6666, 6666),
            speed: 1.4,
            size: 30,
            reward: 89,
            dmg: 6,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    const hs = new HealStatus(1e18, 50, fps / 20, e.id);
                    e.setStatusEffect(hs);
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        const healRange = diffBranch(270, 300, 350);
                        const baseHeal = diffBranch(1500, 2000, 4000);

                        const hv = new VisualEffect("growout", "rgb(255, 0, 127)", fps * 3 / 4, e.position, {radius: healRange});
                        const md = {message: "치유", origin: e.id, size: e.size, fontSize: 20, floatDistance: 20, pop: false};
                        const mv = new VisualEffect("message", "rgb(255, 0, 127)", fps, e.position, md);
                        addVisualEffects(hv, mv);

                        const hs = new HasteStatus(3 * fps, 1.2, e.id);
                        for (const [eid, enemy] of enemies) {
                            if (eid == e.id) continue;

                            if (enemy.position.distance(e.position) <= healRange + enemy.size) {
                                enemy.changeHp(enemy.kind == "elitehealer" ? baseHeal / 10 : baseHeal, "none", e.id);

                                const ms = new MysteryShieldStatus(3 * fps, enemy.hp * 2 <= enemy.maxHp ? 2 : 1, e.id);
                                enemy.setStatusEffect(hs);
                                enemy.setStatusEffect(ms);
                            }
                        }
    
                        return true;
                    },
                    period: 5 * fps
                }
            ],
            immunity: ["bless2", "curse", "regen4", "arcanevamp", "wave"]
        });

        this.name = "흑마술 치유사";
        this.description = "금지된 치유 주문을 시전하는 적입니다.";

        this.drawPhase = 0;
        this.drawPeriod = 4 * fps;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        ctx.fillStyle = "rgb(255, 0, 255)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const rg = ctx.createRadialGradient(0, 0, 10, 0, 0, size);
        rg.addColorStop(0, "rgb(255, 127, 255)");
        rg.addColorStop(0.6 + 0.2 * sin(this.drawPhase / this.drawPeriod * pi * 2), "rgba(255, 127, 255, 0)");
        rg.addColorStop(1, "rgba(255, 127, 255, 0)");

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
        super.draw(ctx);
    }
}

class EnemyMobManager extends Enemy {
    constructor(position) {
        super(position, {
            kind: "mobmanager",
            hp: diffBranch(800000, 1300000, 1600000),
            speed: 0.14,
            size: 60,
            reward: 7500,
            dmg: 10000,
            onDeath: {
                fun: (e) => {
                    lightOff = false;
                    goldBlocked = false;
                }
            },
            onSpawn: {
                fun: (e) => {
                    const ms = new MysteryShieldStatus(1e18, diffBranch(5, 10, 20), e.id);
                    e.setStatusEffect(ms);
                }
            },
            onPeriod: [
                {
                    fun: (e) => {
                        // Darken the world: the user can see only the area nearby the cursor.
                        lightOff = true;
                        const dw = new DelayedWork(3.5 * fps, e.id, () => { lightOff = false; }, []);
                        addDelayedWorks(dw);

                        const md = {message: "에너지 절약", origin: e.id, size: e.size, fontSize: 20, floatDistance: 20, pop: false, yOffset: 20};
                        const mv = new VisualEffect("message", "rgb(255, 255, 0)", fps, e.position, md);

                        addVisualEffects(mv);
    
                        return true;
                    },
                    period: diffBranch(13, 11, 9) * fps
                },
                {
                    fun: (e) => {
                        // Heal HP in proportion to the player's gold.
                        const md = {message: "수익 남용", origin: e.id, size: e.size, fontSize: 20, floatDistance: 20, pop: false};
                        const mv = new VisualEffect("message", "rgb(0, 255, 0)", fps, e.position, md);
                        const hv = new VisualEffect("growout", "rgb(127, 255, 127)", fps * 3 / 4, e.position, {radius: 300});

                        addVisualEffects(mv, hv);
                        e.changeHp(playerGold * diffBranch(0.5, 1.0, 4.0));

                        return true;
                    },
                    period: 6 * fps
                },
                {
                    fun: (e) => {
                        // Forcefully sells towers.
                        const md = {message: "재산 압류", origin: e.id, size: e.size, fontSize: 24, floatDistance: 30, pop: false, yOffset: 50};
                        const mv = new VisualEffect("message", "rgb(0, 0, 255)", fps, e.position, md);

                        addVisualEffects(mv);

                        let dmax = -100;
                        let damageTower = null;

                        for (const [tid, tower] of towers) {
                            if (tower.damageDealt >= dmax) {
                                dmax = tower.damageDealt;
                                damageTower = tower;
                            }
                        }

                        if (damageTower != null) {
                            const pos = damageTower.position.copy();
                            if (damageTower.sell(diffBranch(0.95, 0.9, 0.85))) {
                                const md = {message: `${damageTower.name} 강제 판매`, origin: null, size: 30, fontSize: 38, floatDistance: 20, pop: true};
                                const mv = new VisualEffect("message", "rgb(0, 0, 255)", 3 * fps, pos, md);
                                const sv = new VisualEffect("explodeout", "rgb(0, 0, 255)", fps, pos, {radius: 100});
                                const lv = new VisualEffect("laser", "rgb(0, 0, 255)", fps / 2, e.position, {endPosition: pos.copy(), laserWidth: 10});

                                addVisualEffects(mv, sv, lv);
                            }
                        }

                        if (e.currentPhase >= diffBranch(4, 3, 2)) {
                            let rmin = 1e18;
                            let rangeTower = null;

                            for (const [tid, tower] of towers) {
                                if (damageTower != null && damageTower.id == tid) continue;

                                const dist = tower.position.distance(e.position);

                                if (dist < rmin) {
                                    rmin = dist;
                                    rangeTower = tower;
                                }
                            }

                            if (rangeTower != null) {
                                const pos = rangeTower.position.copy();
                                if (rangeTower.sell(diffBranch(0.95, 0.9, 0.85))) {
                                    const md = {message: `${rangeTower.name} 강제 판매`, origin: null, size: 30, fontSize: 38, floatDistance: 20, pop: true};
                                    const mv = new VisualEffect("message", "rgb(0, 0, 255)", 3 * fps, pos, md);
                                    const sv = new VisualEffect("explodeout", "rgb(0, 0, 255)", fps, pos, {radius: 100});
                                    const lv = new VisualEffect("laser", "rgb(0, 0, 255)", fps / 2, e.position, {endPosition: pos.copy(), laserWidth: 10});

                                    addVisualEffects(mv, sv, lv);
                                }
                            }
                        }

                        return true;
                    },
                    period: diffBranch(16, 12, 8) * fps
                },
                {
                    fun: (e) => {
                        const blockDuration = diffBranch(2, 2, 2.5) * fps;
                        goldBlocked = true;
                        drawnStatics = false;

                        const dw = new DelayedWork(blockDuration, e.id, () => {goldBlocked = false; drawnStatics = false; }, []);
                        addDelayedWorks(dw);

                        const md = {message: "자산 동결", origin: e.id, size: e.size, fontSize: 22, floatDistance: 30, pop: false, yOffset: 35};
                        const mv = new VisualEffect("message", "rgb(0, 255, 255)", fps, e.position, md);
                        addVisualEffects(mv);

                        return true;
                    },
                    period: diffBranch(11, 9, 7) * fps
                }
            ],
            immunity: ["dismiss", "distrain", "energysave", "sharemoney", "frozenasset", "mysteryborn2", "unstoppable"]
        });

        this.name = "마수 관리관";
        this.description = "적들을 관리하는 역할을 맡은 자입니다. 까다로운 싸움이 되겠군요..";

        this.drawPhase = 0;
        this.drawPeriod = 4 * fps;

        this.currentPhase = 1;
        this.maxPhase = 4;
        this.phaseCut = [0.75, 0.5, 0.25];

        this.shieldPerVamp = diffBranch(3000, 4000, 5000);
        this.mysteryShieldPerVamp = diffBranch(1, 1, 2);
    }

    draw(ctx) {
        if (this.currentPhase < this.maxPhase && this.hp < this.maxHp * this.phaseCut[this.currentPhase - 1]) {
            this.invincible = true;
            const dw = new DelayedWork(diffBranch(3, 4, 5) * fps, this.id, (e) => { e.invincible = false;}, [this]);
            addDelayedWorks(dw);

            // On phase shift, gain invincibility, shield, and mystery shield.
            const md = {message: "구조 조정", origin: null, size: this.size, fontSize: 28, floatDistance: 40, pop: true};
            const mv = new VisualEffect("message", "rgb(160, 0, 0)", fps, this.position, md);

            this.setStatusEffect(new StopStatus(fps, this.id));

            const vampRange = 3000;
            const vampv = new VisualEffect("radialin", "rgb(160, 0, 0)", fps, this.position, {radius: vampRange});

            addVisualEffects(mv, vampv);

            let enemyCount = 0;
            for (const [eid, enemy] of enemies) {
                if (eid == this.id) continue;

                enemy.changeHp(-enemy.maxHp * 0.5, "absolute", this.id);
                enemyCount++;
            }

            this.changeShield(enemyCount * this.shieldPerVamp + this.maxHp / 4);

            const ms = new MysteryShieldStatus(1e18, this.mysteryShieldPerVamp * enemyCount, this.id);
            this.setStatusEffect(ms);

            this.currentPhase++;
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.drawPhase++;

        // Setup for shifting colors.
        const outerColorMax = 128;
        const outerFunc = (ratio) => {
            ratio = ratio - floor(ratio);

            if (ratio <= 1 / 6 || ratio >= 5 / 6) return 1.0;
            else if (ratio <= 2 / 6) return (-ratio * 6 + 2);
            else if (ratio >= 4 / 6) return (ratio * 6 - 4);
            else return 0;
        };

        const dp = this.drawPhase / this.drawPeriod;
        const outerRed = outerColorMax * outerFunc(dp / 4);
        const outerBlue = outerColorMax * outerFunc(dp / 4 + 4 / 6);
        const outerGreen = outerColorMax * outerFunc(dp / 4 + 2 / 6);

        const arg = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 1.3);
        const chaosColor = `rgb(${outerRed}, ${outerBlue}, ${outerGreen})`;
        arg.addColorStop(0, chaosColor);
        arg.addColorStop(0.7 + 0.1 * sin(dp * pi * 2), chaosColor);
        arg.addColorStop(1, toTransparent(chaosColor));

        // Aura effect
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.3, 0, pi * 2);
        ctx.closePath();
        ctx.fillStyle = arg;
        ctx.fill();

        // Octagon plate
        const rotatePeriod = this.drawPeriod / 3;
        const baseAngle = floor(this.drawPhase / rotatePeriod) * pi / 4;
        const addiAngle = (this.drawPhase % rotatePeriod) <= rotatePeriod / 4 ? (this.drawPhase % rotatePeriod * 4 / rotatePeriod * pi / 4) : 0;

        ctx.rotate(baseAngle + addiAngle);
        ctx.beginPath();
        ctx.moveTo(size, 0);

        for (let i = 0; i < 8; i++) {
            ctx.rotate(pi / 4);
            ctx.lineTo(size, 0);
        }

        ctx.rotate(-baseAngle - addiAngle);
        ctx.closePath();

        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.lineWidth = 1;

        // Hexagon center plate
        ctx.save();
        ctx.rotate(-this.drawPhase / (this.drawPeriod * 3) * pi * 2);
        ctx.beginPath();
        ctx.moveTo(size * 0.8, 0);
        
        for (let i = 0; i < 6; i++) {
            ctx.rotate(pi / 3);
            ctx.lineTo(size * 0.8, 0);
        }

        ctx.closePath();
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fill();
        ctx.stroke();

        // Three eyes
        ctx.strokeStyle = chaosColor;
        
        const eyeFunc = (ratio) => {
            if (ratio <= 0.1) return ratio * 10;
            else if (ratio >= 0.9) return -ratio * 10 + 10;
            else return 1;
        };

        const midY = size * 0.2 * eyeFunc((this.drawPhase % this.drawPeriod) / this.drawPeriod);
        const inX = size * 0.2;
        const outX = size * 0.6;
        const midX = (inX + outX) / 2;
        const trChaos = toTransparent(chaosColor);

        for (let i = 0; i < 3; i++) {
            ctx.rotate(pi * 2 / 3);
            ctx.beginPath();
            ctx.moveTo(inX, 0);
            ctx.quadraticCurveTo(midX, midY, outX, 0);
            ctx.quadraticCurveTo(midX, -midY, inX, 0);
            ctx.closePath();

            const erg = ctx.createRadialGradient(midX, 0, 1, midX, 0, size * 0.2);
            erg.addColorStop(0, chaosColor);
            erg.addColorStop(0.6 + 0.2 * sin(dp * pi * 2), trChaos);
            erg.addColorStop(1, trChaos);
            ctx.fillStyle = erg;
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
        
        ctx.restore();
        super.draw(ctx);
    }
}