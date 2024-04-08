/*
    enemy_s1.js - 2024.03.10

    Implementation of enemies on Stage 1.
*/

class EnemyBasic extends Enemy {
    constructor(position) {
        super(position, {
            kind: "basic",
            hp: diffBranch(40, 60, 75),
            speed: 4,
            size: 15,
            reward: 5,
            dmg: 1,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: null
        });

        this.name = "돌격병";
        this.description = "무난하기 짝이 없는 적입니다. 특별한 능력이 없습니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyGiant extends Enemy {
    constructor(position) {
        super(position, {
            kind: "giant",
            hp: diffBranch(300, 375, 450),
            speed: 2,
            size: 30,
            reward: 9,
            dmg: 5,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: null
        });

        this.name = "덩치";
        this.description = "덩치 큰 든든한 적입니다. 체력이 많고 느립니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyTinySphere extends Enemy {
    constructor(position) {
        super(position, {
            kind: "tinysphere",
            hp: diffBranch(150, 200, 200),
            speed: diffBranch(2.7, 3, 3.2),
            size: 12,
            reward: 6,
            dmg: 2,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["laserresist"]
        });

        this.name = "작은 구체";
        this.description = "작고 단단한 적입니다. 귀엽네요.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(128, 255, 255)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2.0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyFly extends Enemy {
    constructor(position) {
        super(position, {
            kind: "fly",
            hp: 50,
            speed: diffBranch(8, 10, 10.4),
            size: 12,
            reward: 4,
            dmg: 1,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["slow"]
        });

        this.name = "하루살이";
        this.description = "체력이 매우 낮지만 굉장히 빠르게 달려듭니다. 놓치면 곤란한데요.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2.0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        super.draw(ctx);
    }
}

class EnemyExerciseStudent extends Enemy {
    constructor(position) {
        super(position, {
            kind: "exercisestudent",
            hp: 250,
            speed: 2.5,
            size: 18,
            reward: 7,
            dmg: 2,
            onDeath: null,
            onSpawn: null,
            onPeriod: [],
            immunity: ["unstoppable"]
        });

        this.name = "헬린이";
        this.description = "헬창이 되고 싶은 적입니다. 아직은 약해보입니다.";
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

class EnemyBehemoth extends Enemy {
    constructor(position) {
        super(position, {
            kind: "behemoth",
            hp: diffBranch(9000, 11000, 15000),
            speed: 0.5,
            size: 44,
            reward: 500,
            dmg: 10000,
            onDeath: null,
            onSpawn: {
                fun: (e) => {
                    const healStatus = new HealStatus(1e18, 5, fps / 30, e.id);
                    e.setStatusEffect(healStatus);
                }
            },
            onPeriod: [],
            immunity: ["stoneresist", "sturdy", "regen0"]
        });

        this.name = "태산";
        this.description = "거대하고 튼튼한 적입니다. 재생하는 힘을 가졌습니다.";
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);
        
        if (ctx != ctxpd) {
            const period = fps * 3;
            const phase = globalTimer % period;

            const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 1.5);
            rg.addColorStop(0, "rgb(255, 0, 0)");
            rg.addColorStop(0.6 + 0.2 * sin(pi * 2.0 * phase / period), "rgb(255, 0, 0)");
            rg.addColorStop(1, "rgba(255, 0, 0, 0)");

            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(0, 0, size * 1.5, 0, pi * 2.0);
            ctx.closePath();
            ctx.fill();
        }

        ctx.fillStyle = "rgb(175, 0, 0)";
        ctx.fillRect(-size, -size, 2 * size, 2 * size);
        ctx.strokeRect(-size, -size, 2 * size, 2 * size);

        ctx.fillStyle = "rgb(255, 255, 0)";
        ctx.beginPath();
        ctx.moveTo(-size * 0.75, -size * 0.6);
        ctx.quadraticCurveTo(-size * 0.65, size * 0.1, -size * 0.2, -size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(size * 0.75, -size * 0.6);
        ctx.quadraticCurveTo(size * 0.65, size * 0.1, size * 0.2, -size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        super.draw(ctx);
    }
}