/* 
    money_tower.js - 2024.02.01

    Implementation of Gold Management Center.
*/

class MoneyTower extends Tower {
    constructor(position) {
        super("money", position);

        // Gold Management Center
        this.name = "골드 관리 공사";

        // Facility of mining and investing gold. Gain 170 golds at the end of each round.
        this.baseDescription = "골드를 채굴하고 관리하는 기관입니다. 매 라운드 종료 시 170 골드를 획득합니다.";

        // Better Mining Tool
        // Mining Instruction
        // Shiny Collections
        // Golden Touch
        // Shape of Greed
        this.upgradeName = ["채굴 도구 개량", "채굴법 개선", "고물 수집", "금의 손길", "탐욕의 초상"];

        this.upgradeCost = [600, 750, 4000, 16000, 50000];

        // Gain 250 golds at the end of each round.
        // Gain 350 golds at the end of each round.
        // Gain 920 golds at the end of each round.
        // Gain 2300 golds at the end of each round. Additionally, gain 70 golds for each combatant tower in its attack range, up to 700 golds.
        // Gain 6000 golds at the end of each round. Additionally, gain 200 golds for each combatant tower in its attack range, up to 2000 golds.
        this.upgradeDescription = [
            "매 라운드 종료 시 250 골드를 획득합니다.",
            "매 라운드 종료 시 350 골드를 획득합니다.",
            "매 라운드 종료 시 920 골드를 획득합니다.",
            "매 라운드 종료 시 2300 골드를 획득합니다. 사거리 내의 골드 관리 공사와 전투 지원 기지를 제외한 타워 하나 당 추가로 70골드를 획득합니다. (최대 700골드)",
            "매 라운드 종료 시 6000 골드를 획득합니다. 사거리 내의 골드 관리 공사와 전투 지원 기지를 제외한 타워 하나 당 추가로 200골드를 획득합니다. (최대 2000골드)",
        ];

        // Alchemy Bomb, Concentrated Greed
        this.activeName = ["연금술 폭탄", "탐욕 쇄도"];

        // Launch alchemy bomb to the cursor's position. Enemies attacked by alchemy bomb take 1000 damage, and give player 30% additional gold reward on their death.
        // Blast concentrated greed to the cursor's position. Enemies attacked by concentrated greed take 2500 damage, and give player 60% additional gold reward on their death.
        this.activeDescription = [
            "마우스 위치로 연금술 폭탄을 발사하여 해당 위치의 적들에게 1000의 피해를 입힙니다. 연금술 폭탄에 적중당한 적을 처치하면 30%의 추가 골드를 받습니다.",
            "마우스 위치로 탐욕의 정수를 투척하여 해당 위치의 적들에게 2500의 피해를 입힙니다. 연금술 폭탄에 적중당한 적을 처치하면 60%의 추가 골드를 받습니다.",
        ];

        this.size = 42;
        this.totalCost = 1600;

        this.attackRange = 120;
        this.attackPeriod = 1e18;

        this.income = 170;
        this.totalProduction = 0;
        this.incomePerTower = 70;

        this.activePeriod = 18 * fps;
        this.activeDamage = 1000;
        this.activeMultiplier = 1.3;
        this.activeProjSpeed = 8;
        this.activeProjSize = 50;
        this.activeExplosionRadius = 140;

        this.activeColor = "rgb(255, 255, 64)";
        this.activeSpikeColor = "rgb(64, 64, 0)";
        this.activeWhiteColor = "rgb(255, 255, 160)";
        this.outerBaseColor = "rgb(255, 255, 0)";
        this.innerBaseColor = "rgb(255, 255, 0)";
        this.ringColor = "rgb(0, 51, 81)";
        this.centerColor = "rgb(220, 220, 0)";
        this.pipeColor = "rgb(176, 176, 0)";

        this.drawPhase = 0;
        this.drawPeriod = 4 * fps;
    }

    upgrade() {
        if (!super.upgrade()) return false;

        switch (this.tier) {
            case 1: {
                this.income = 250;
                break;
            }
            case 2: {
                this.income = 350;
                break;
            }
            case 3: {
                this.income = 920;
                this.attackRange = 140;
                break;
            }
            case 4: {
                this.income = 2300;
                this.attackRange = 160;
                this.outerBaseColor = "rgb(176, 176, 0)";
                this.centerColor = "rgb(64, 64, 0)";
                this.pipeColor = "rgb(120, 120, 0)";
                break;
            }
            case 5: {
                this.income = 6000;
                this.attackRange = 180;
                this.incomePerTower = 200;

                this.activeDamage = 2500;
                this.activeMultiplier = 1.6;
                this.activeExplosionRadius = 160;
                this.activeProjSize = 55;

                this.activeColor = "rgb(236, 236, 0)";
                this.activeSpikeColor = "rgb(16, 16, 16)";
                this.activeWhiteColor = "rgb(255, 255, 128)";
                this.outerBaseColor = "rgb(64, 64, 0)";
                this.pipeColor = "rgb(16, 16, 16)";
                this.centerColor = "rgb(255, 255, 0)";
                this.ringColor = "rgb(255, 255, 0)";
                this.innerBaseColor = "rgb(16, 16, 16)";
                break;
            }
            default: {
                console.error("Tower.upgrade(): Invalid tower tier:", this.tier);
                break;
            }
        }

        return true;
    }

    attack() {
        if (this.castingActive) {
            aimingCursor = true;

            if (globalGameTimer - this.activeTimer >= fps) {
                const projStyle = {
                    kind: "moneyactive",
                    mainColor: this.activeColor,
                    spikeColor: this.activeSpikeColor,
                    whiteColor: this.activeWhiteColor
                };

                const onExpire = (e) => {
                    const ev = new VisualEffect("explodeout", this.activeColor, fps * 3 / 4, e.position, {radius: this.activeExplosionRadius});
                    const ov = new VisualEffect("growout", this.activeColor, fps * 3 / 4, e.position, {radius: this.activeExplosionRadius});

                    addVisualEffects(ev, ov);

                    const gs = new GoldStatus(this.activeMultiplier, this.id);

                    for (const [eid, enemy] of enemies) {
                        if (enemy.position.distance(e.position) <= this.activeExplosionRadius + enemy.size) {
                            enemy.setStatusEffect(gs);
                            enemy.changeHp(-this.activeDamage * this.damageFactor, "none", this.id);

                            const md = {message: "황금화", origin: enemy.id, size: enemy.size, fontSize: 22, floatDistance: 20, pop: false};
                            const vse = new VisualEffect("message", "rgb(255, 255, 0)", fps, enemy.position, md);
                            addVisualEffects(vse);
                        }
                    }
                };

                let dv = vSub(mousePosition, this.position);
                dv.normalize();

                const velv = vScalarMul(dv, this.activeProjSpeed);
                const property = new ProjectileProperty("destinated", null, 100000000, this.activeProjSize, 1e18, null, this.hasCamoDetection(), {destination: mousePosition.copy()});
                const mp = new Projectile(this.position.copy(), velv, property, projStyle, (e) => {}, onExpire);

                addProjectiles(mp);

                this.removeStatusEffect("casting");
            }
        }

        return true;
    }


    // This method applies casting status to the tower, and actual handling is done on attack() method.
    active() {
        if (!super.active()) return false;
        
        const dv = new VisualEffect("darken", null, fps, null, null);
        addVisualEffects(dv);

        const cs = new CastingStatus(2 * fps, this.id);
        this.setStatusEffect(cs);

        this.activeSuccess();
        
        return true;
    }

    draw(ctx) {
        super.draw();

        this.drawPhase++;

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate();

        // Aura effect.
        if (this.tier >= 5) {
            ctx.beginPath();
            ctx.arc(0, 0, size * 1.3, 0, pi * 2);
            ctx.closePath();

            const rg = ctx.createRadialGradient(0, 0, size / 2, 0, 0, size * 1.3);
            rg.addColorStop(1, "rgba(255, 255, 0, 0)");
            rg.addColorStop(0.5, "rgb(255, 255, 0)");
            rg.addColorStop(0, "rgb(255, 255, 0)");

            ctx.fillStyle = rg;
            ctx.fill();
        }

        // Rectangular pipes
        if (this.tier >= 2) {
            ctx.save();
            const sq = 14;
            const amount = (this.tier >= 3) ? 8 : 4;
            
            ctx.fillStyle = this.pipeColor;

            if (this.tier >= 3) ctx.rotate(pi / 8);

            for (let i = 0; i < amount; i++) {
                const adj = sq / 8 * sin(this.drawPhase * pi * 2 / this.drawPeriod);

                ctx.rotate(pi / amount * 2);
                ctx.fillRect(adj, -sq / 2, size + sq / 4, sq);
                ctx.strokeRect(adj, -sq / 2, size + sq / 4, sq);
            }
            
            ctx.restore();
        }

        // Octagon base
        ctx.beginPath();
        ctx.moveTo(size , 0);

        for (let i = 0; i < 8; i++) {
            ctx.rotate(pi / 4);
            ctx.lineTo(size, 0);
        }

        ctx.closePath();
        ctx.fillStyle = this.outerBaseColor;
        ctx.fill();
        ctx.stroke();

        // Radial base
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.8, 0, pi * 2);
        ctx.closePath();
        ctx.fillStyle = this.ringColor;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, size * 0.7, 0, pi * 2);
        ctx.closePath();
        ctx.fillStyle = this.innerBaseColor;
        ctx.fill();
        ctx.stroke();

        // Arc-shaped movement
        if (this.tier >= 4) {
            ctx.save();
            ctx.rotate(pi / 8);

            for (let i = 0; i < 8; i++) {
                ctx.rotate(pi / 4);
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.7, 0, pi / 4);
                ctx.lineTo(0, 0);
                ctx.closePath();

                const alpha = 0.3 + 0.3 * sin(this.drawPhase / this.drawPeriod * pi * 2) * (i % 2 == 0 ? 1 : -1);

                ctx.fillStyle = toAlpha("rgb(255, 255, 255)", alpha);
                ctx.fill();
            }
            ctx.restore();
        }

        // Rectangular hole in the middle
        if (this.tier >= 1) {
            const cw = 10;
            const ch = 40;
            ctx.fillStyle = this.castingActive ? "rgb(255, 255, 255)" : this.centerColor;
            ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
            ctx.strokeRect(-cw / 2, -ch / 2, cw, ch);
        }

        ctx.restore();
    }

    onRoundEnd() {
        super.onRoundEnd();

        let income = this.income;

        // If the tower's tier is 4+, check nearby combatant towers.
        if (this.tier >= 4) {
            let count = 0;
            for (const [tid, tower] of towers) {
                if (tower.kind == "money" || tower.kind == "support") continue;

                if (this.position.distance(tower.position) <= tower.size + this.attackRange * this.rangeFactor) {
                    if (++count == 10) break;
                }
            }
        }

        income += count * this.incomePerTower;

        this.totalProduction += income;
        changePlayerGold(income);
        totalGeneratedGold += income;

        const vse = new VisualEffect("message", "rgb(0, 255, 0)", fps, this.position, {message: `+${income}`, origin: this.id, size: this.size, fontSize: 22, floatDistance: 20, pop: true});
        addVisualEffects(vse);
    }
}