/*
    enemy_s2.js - 2024.03.10

    Implementation of enemies on Stage 2.
*/

class EnemyShielded extends Enemy {
    constructor(position) {
        super(position, {
            kind: "shielded",
            hp: diffBranch(175, 275, 350),
            speed: 1.8,
            size: 25,
            reward: 12,
            dmg: diffBranch(2, 2, 3),
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    e.changeShield(300);
                }
            },
            onPeriod: [],
            immunity: ["stone", "shieldborn1"]
        });

        this.name = "방패병";
        this.description = "공격을 막아내는 능력을 가진 전사입니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(63, 231, 205)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyPoisonStudent extends Enemy {
    constructor(position) {
        super(position, {
            kind: "poisonstudent",
            hp: diffBranch(900, 1500, 1600),
            speed: 1.5,
            size: 20,
            reward: 15,
            dmg: 2,
            onDeath: null,
            onSpawn: null,
            onPeriod: [
                {
                    fun: (e) => {
                        const aslow = new AttackSpeedSlowStatus(fps * 2, 1.2, e.id);
                        const range = diffBranch(300, 350, 375);
                        
                        let dist = 1e18;
                        let id = null;

                        for (const [tid, tower] of towers) {
                            const nd = e.position.distance(tower.position);

                            if (nd <= range + tower.size && (id == null || nd <= dist)) {
                                id = tid;
                                dist = nd;
                            }
                        }

                        if (id == null || !towers.has(id)) return false;

                        const tower = towers.get(id);

                        if (tower.mysteryShield == 0) {
                            const md = {
                                message: "공격 속도 감소",
                                origin: id,
                                size: tower.size,
                                fontSize: 18,
                                floatDistance: 20,
                                pop: false
                            };
                            const mv = new VisualEffect("message", "rgb(47, 71, 104)", 0.5 * fps, tower.position, md);

                            visualEffects.set(mv.id, mv);
                        }

                        tower.setStatusEffect(aslow);

                        const ved = { endPosition: tower.position, laserWidth: 10 };
                        const vse = new VisualEffect("laser", "rgb(168, 64, 180)", fps / 3, e.position, ved);

                        visualEffects.set(vse.id, vse);
                        return true;
                    },
                    period: fps * 3
                }
            ],
            immunity: ["poison", "inject1"]
        });

        this.name = "신경독 독술사";
        this.description = "독을 능숙하게 다루는 기술자입니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(168, 65, 180)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2.0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        super.draw(ctx);
    }
}


class EnemyRogue extends Enemy {
    constructor(position) {
        super(position, {
            kind: "rogue",
            hp: diffBranch(275, 450, 550),
            speed: diffBranch(2, 3, 3),
            size: 16,
            reward: 10,
            dmg: 2,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    const cs = new CamoStatus(1e18, e.id);
                    e.setStatusEffect(cs);
                }
            },
            onPeriod: [],
            immunity: ["camo", "slow", "stun", "freezeresist", "arcaneresist"]
        });

        this.name = "도적";
        this.description = "잽싸게 도망다니는 도적입니다.";
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

        ctx.fillStyle = "rgb(79, 79, 79)";
        ctx.fillRect(-size, -size * 2 / 3, 2 * size, size * 2 / 3);
        ctx.strokeRect(-size, -size * 2 / 3, 2 * size, size * 2 / 3);

        ctx.restore();

        super.draw(ctx);
    }
}


class EnemyHardBasic extends Enemy {
    constructor(position) {
        super(position, {
            kind: "hardbasic",
            hp: diffBranch(350, 550, 650),
            speed: 3.5,
            size: 18,
            reward: 11,
            dmg: 2,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: null
        });

        this.name = "정예 돌격병";
        this.description = "더욱 무거운 무장을 갖춘 돌격병입니다. 무장 탓인지 살짝 느리군요.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(238, 79, 32)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.restore();

        super.draw(ctx);
    }
}


class EnemyDefSphere extends Enemy {
    constructor(position) {
        super(position, {
            kind: "defsphere",
            hp: diffBranch(1000, 1600, 2000),
            speed: 1.5,
            size: 20,
            reward: 17,
            dmg: diffBranch(2, 2, 3),
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["stoneresist", "freezeresist", "laserresist", "arcaneresist", "weakpoint", "unstoppable"]
        });

        this.name = "방어 구체";
        this.description = "치밀한 방어 체계를 탑재한 구체입니다. 탄환, 저온, 레이저, 마법을 막도록 설계되었으나 독과 충격파에는 매우 약합니다.";
    }

    changeHp(d, type, origin) {
        if (d < 0 && (type == "poison" || type == "wave")) {
            super.changeHp(4 * d, type, origin);
        }
        else {
            super.changeHp(d, type, origin);
        }
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(0, 0, 255)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const rg = ctx.createRadialGradient(0, 0, 10, 0, 0, size * 2);
        rg.addColorStop(0, "rgb(128, 128, 255)");
        rg.addColorStop(0.5 + 0.2 * sin(globalGameTimer % (fps * 2) * pi * 2), "rgba(128, 128, 255, 0)");
        rg.addColorStop(1, "rgba(128, 128, 255, 0)");

        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        super.draw(ctx);
    }
}


class EnemyTrickster extends Enemy {
    constructor(position) {
        super(position, {
            kind: "trickster",
            hp: diffBranch(32000, 52000, 65000),
            speed: 0.47,
            size: 56,
            reward: 1500,
            dmg: 10000,
            onDeath: null,
            onSpawn: null,
            onPeriod: [
                {
                    fun: (e) => {
                        const camoDuration = 1.5 * fps;
                        const camoStatus = new CamoStatus(camoDuration, e.id);
                        const camoRadius = 100;

                        const cve = new VisualEffect("radialout", "rgba(0, 0, 0, 0.6)", 0.5 * fps, e.position, {radius: camoRadius});
                        const mve = new VisualEffect("message", "rgb(0, 0, 0)", fps, e.position, {
                            message: "은신",
                            origin: e.id,
                            size: e.size,
                            fontSize: 20,
                            floatDistance: 36,
                            pop: true
                        });

                        visualEffects.set(cve.id, cve);
                        visualEffects.set(mve.id, mve);

                        const hs = new HasteStatus(camoDuration, 1.5, e.id);
                        e.setStatusEffect(camoStatus);
                        e.setStatusEffect(hs);
                        e.removeStatusEffect("negative");

                        if (this.elevated) {
                            e.changeHp((e.maxHp - e.hp) / 10, "none", e.id);

                            const healRange = 200;
                            const hve = new VisualEffect("growout", "rgb(127, 255, 127)", fps, e.position, {radius: healRange});
                            visualEffects.set(hve.id, hve);
                        }

                        return true;
                    },
                    period: 4 * fps
                }
            ],
            immunity: ["smokebomb", "smokewalk", "elevation", "knockback", "poisonresist", "sturdy"]
        });

        this.isBoss = true;
        this.name = "트릭스터";
        this.description = "비겁한 술수에 능한 존재입니다. 공격을 흘려보내고 기척을 숨기는 것에 능숙합니다.";

        this.currentPhase = 1;
        this.maxPhase = 2;

        this.blinkPhase = 0;
        this.blinkPeriod = fps * 400 / 60;
        this.blinkWidth = 60;

        this.elevated = false;
    }

    draw(ctx) {
        if (!this.elevated && this.hp < this.maxHp / 2) {
            const eve = new VisualEffect("radialout", "rgba(201, 55, 55, 0.7)", 1.25 * fps, this.position, {radius: 300});
            const mve = new VisualEffect("message", "rgb(201, 55, 55)", fps, this.position, {
                message: "각성",
                origin: this.id,
                size: this.size,
                fontSize: 24,
                floatDistance: 40,
                pop: true
            });

            visualEffects.set(eve.id, eve);
            visualEffects.set(mve.id, mve);

            this.currentPhase = 2;
            this.elevated = true;
        }

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        this.blinkPhase = (this.blinkPhase + 1) % this.blinkPeriod;
        
        const eyeColor = (this.camouflaged ? (this.elevated ? "rgb(142, 38, 119)" : "rgb(23, 125, 54)") : (this.elevated ? "rgb(201, 55, 56)" : "rgb(128, 128, 255)"));
        const tranColor = toTransparent(eyeColor);

        const rg1 = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 3);
        rg1.addColorStop(0, eyeColor);
        rg1.addColorStop(fitInterval(0.7 + 0.2 * sin((globalGameTimer % (2 * fps)) * pi * 2.0), 0, 1), tranColor);
        rg1.addColorStop(1, tranColor);

        ctx.beginPath();
        ctx.arc(0, 0, size * 3, 0, pi * 2.0);
        ctx.closePath();

        ctx.fillStyle = rg1;
        ctx.fill();

        ctx.fillStyle = "rgb(32, 32, 32)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        const rg2 = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 2);
        rg2.addColorStop(0, eyeColor);
        rg2.addColorStop(fitInterval(0.3 + 0.3 * sin((globalGameTimer % (2 * fps)) * pi * 2.0), 0, 1), tranColor);
        rg2.addColorStop(1, tranColor);

        ctx.fillStyle = rg2;

        const h = Math.abs(this.blinkPhase - this.blinkPeriod / 2);
        const eyeY = (h > this.blinkWidth / 2) ? size : size * (h / (this.blinkWidth / 2));

        ctx.beginPath();
        ctx.moveTo(-0.9 * size, 0);
        ctx.quadraticCurveTo(0, -eyeY, 0.9 * size, 0);
        ctx.quadraticCurveTo(0, eyeY, -0.9 * size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = eyeColor;
        ctx.stroke();

        ctx.restore();
        this.blinkPhase++;

        super.draw(ctx);
    }
}