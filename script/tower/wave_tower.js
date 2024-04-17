/*
    laser_tower.js - 2024.01.20

    Implementation of Wave Shocker.
*/

class WaveTower extends Tower {
    constructor(position) {
        super("wave", position);

        this.name = "파동 충격기";
        this.baseDescription = "짜릿한 충격파를 부채꼴 모양으로 내지릅니다. 충격파는 적중한 적에게 250의 피해를 입히고 뒤로 살짝 밀쳐냅니다.";
        this.upgradeName = ["대항하는 힘", "충격 범위 증가", "광포한 파동", "불가항 충격파", "아득한 울림"];
        this.upgradeCost = [500, 350, 2000, 6500, 34000];
        this.upgradeDescription = [
            "전장에 있는 적 하나 당 6의 추가 피해를 입힙니다.",
            "충격파의 각도가 넓어지고, 사거리가 20% 늘어납니다. 또한 공격 속도가 10% 빨라집니다.",
            "충격파의 기본 피해량이 500으로 늘어나며 공격 속도가 10% 빨라집니다. 또한 적을 조금 더 세게 밀쳐내며, 은신한 적을 공격할 수 있게 됩니다.",
            "충격파의 기본 피해량이 700으로 늘어나고, 전장의 적 당 입히는 추가 피해가 9로 늘어납니다. 또한 충격파의 각도가 더욱 넓어지고 사거리가 10% 늘어나며, 공격 속도가 20% 빨라집니다.",
            "감당할 수 없는 수준의 힘입니다! 충격파의 기본 피해량이 1400으로 늘어나며, 전장의 적 당 입히는 추가 피해가 15로 늘어납니다. 적을 더더욱 세게 밀쳐냅니다."
        ];

        this.activeName = ["파열의 주파", "파열의 공명"];
        this.activeDescription = [
            "육체를 흔드는 파동을 퍼뜨려 주변 적에게 1000 + 적 현재 HP의 10% + 전장의 적 당 30의 피해를 모든 면역을 무시하고 입힙니다. 파동에 적중당한 적은 3초간 기절하고, 6초간 모든 면역을 잃고 35% 느려집니다. \n 현재 HP 비례 피해는 보스에게는 최대 8000까지만 적용됩니다.",
            "육체를 무너뜨리는 강력한 파동을 퍼뜨려 주변 적에게 4000 + 적 현재 HP의 15% + 전장의 적 당 70의 피해를 모든 면역을 무시하고 입힙니다. 파동에 적중당한 적은 5초간 기절하고, 8초간 모든 면역을 잃고 50% 느려집니다. \n 현재 HP 비례 피해는 보스에게는 최대 30000까지만 적용됩니다."
        ];

        this.size = 28;
        this.totalCost = 650;
        
        this.pierce = 20;
        this.attackEnemyScaleFactor = 0;
        this.attackDamage = 250;
        this.attackRange = 170;
        this.attackPeriod = fps * 7 / 6;
        this.attackAngleWidth = pi / 2;
        this.attackKnockbackRatio = 0.1;
        this.attackKnockbackDuration = fps / 6;

        this.activeDamage = 1000;
        this.activePeriod = 19 * fps;
        this.activeStunDuration = fps * 3;
        this.activeSlowRatio = 0.65;
        this.activeDuration = 6 * fps;
        this.activeRange = 450;
        this.activeEnemyScaleFactor = 30;
        this.activeHpRatio = 0.1;
        this.activeBossLimit = 8000;

        this.baseColor = "rgb(255, 14, 14)";
        this.borderColor = "rgb(127, 14, 14)";
        this.waveColor = "rgb(255, 14, 14)";
        this.pulseColor = "rgb(255, 192, 192)";
        this.centerColor = "rgb(128, 0, 20)";
        this.speakerColor = "rgb(192, 14, 14)";
        this.stripColor = "rgb(0, 0, 0)";
        this.backColor = "rgb(32, 0, 5)";
        this.auraColor = "rgb(255, 0, 0)";

        this.pulseCount = 2;
        this.pulseSpeed = 6;

        this.centerWidth = 20;
        this.centerLength = 12;
        this.speakerWidth = 54;
        this.speakerLength = 24;
        this.backWidth = 16;
        this.backLength = 6;
    }

    upgrade() {
        if (!super.upgrade()) return false;

        switch (this.tier) {
            case 1: {
                this.attackEnemyScaleFactor = 6;
                this.speakerWidth = 56;
                this.speakerLength = 26;
                break;
            }
            case 2: {
                this.attackAngleWidth = pi * 105 / 180;
                this.attackRange = 200;
                this.pierce = 25;
                this.attackPeriod = fps * 63 / 60;
                this.speakerWidth = 64;
                this.speakerLength = 28;
                this.centerColor = "rgb(112, 0, 17)";
                break;
            }
            case 3: {
                this.attackDamage = 500;
                this.attackPeriod = fps * 55 / 60;
                this.attackKnockbackRatio = 0.3;
                this.attackKnockbackDuration = fps / 4;
                this.permaCamoDetection = true;
                break;
            }
            case 4: {
                this.attackEnemyScaleFactor = 9;
                this.attackAngleWidth = pi * 135 / 180;
                this.attackDamage = 700;
                this.attackRange = 220;
                this.attackPeriod = fps * 3 / 4;
                this.pierce = 30;

                this.speakerColor = "rgb(255, 14, 14)";
                this.baseColor = "rgb(192, 14, 14)";
                this.pulseColor = "rgb(255, 127, 127)";
                this.speakerWidth = 70;
                break;
            }
            case 5: {
                this.attackEnemyScaleFactor = 15;
                this.attackDamage = 1400;
                this.activeSlowRatio = 0.5;
                this.activeDuration = fps * 8;
                this.activeRange = 550;
                this.activeEnemyScaleFactor = 70;
                this.activeHpRatio = 0.15;
                this.activeBossLimit = 30000;

                this.speakerWidth = 84;
                this.speakerLength = 26;

                this.pulseSpeed = 4;
                this.baseColor = "rgb(64, 0, 8)";
                this.borderColor = "rgb(255, 0, 0)";
                this.waveColor = "rgb(255, 14, 14)";
                this.pulseColor = "rgb(255, 0, 0)";
                this.centerColor = "rgb(216, 0, 20)";
                this.speakerColor = "rgb(32, 6, 6)";
                this.stripColor = "rgb(255, 0, 0)";
                this.backColor = "rgb(255, 0, 0)";
                break;
            }
            default: {
                console.error("Tower.upgrade(): Invalid upgrade tier:", this.tier);
                break;
            }
        }

        return true;
    }

    attack() {
        if (!super.attack()) return false;

        const leadId = pickTarget(this, (x) => {}, []);
        if (leadId == null) return false;
        
        const targetEnemy = enemies.get(leadId);
        const dirVector = vSub(targetEnemy.position, this.position);
        dirVector.normalize();

        this.lastDirection = dirVector;
        const angleLimit = this.attackAngleWidth * 0.55;

        let targets = 0;
        const enemyBonusDamage = enemies.size * this.attackEnemyScaleFactor;
        for (const [eid, enemy] of enemies) {
            if ((enemy.camouflaged && !this.hasCamoDetection()) || enemy.isImmuneTo("wave")) continue;

            const enemyVector = vSub(enemy.position, this.position);
            const dist = this.position.distance(enemy.position);

            if (dist <= this.size * 1.2 + enemy.size || (dist <= this.attackRange * this.rangeFactor + enemy.size && dirVector.angle(enemyVector) <= angleLimit)) {
                if (!enemy.knocked) {
                    const kbs = new KnockbackStatus(this.attackKnockbackDuration, this.attackKnockbackRatio, this.id);
                    enemy.setStatusEffect(kbs);
                }

                enemy.changeHp(-(this.attackDamage + enemyBonusDamage) * this.damageFactor, "wave", this.id);

                if (++targets >= this.pierce + this.pierceBoost) break;
            }
        }

        const xVector = new Vector2(1, 0);
        let angle = xVector.angle(dirVector);

        if (dirVector.y < 0) angle = pi * 2 - angle;

        const vse = new VisualEffect("wavebasic", this.waveColor, fps / 4, this.position, {baseAngle: angle, angleWidth: this.attackAngleWidth, radius: this.attackRange * this.rangeFactor});
        addVisualEffects(vse);

        return true;
    }

    active() {
        if (!super.active()) return false;

        const ni = new NullifyStatus(this.activeDuration, this.id);
        const sl = new SlowStatus(this.activeDuration, this.activeSlowRatio, this.id);
        const st = new StunStatus(this.activeStunDuration, this.id);

        const v1 = new VisualEffect("growout", this.waveColor, fps, this.position, {radius: this.activeRange * this.rangeFactor});
        const v2 = new VisualEffect("radialout", this.waveColor, fps, this.position, {radius: this.activeRange * this.rangeFactor});
        const md = {message: this.activeName[this.tier - 4], origin: this.id, size: this.size, fontSize: 24, floatDistance: 40, pop: true};
        const mv = new VisualEffect("message", "rgb(255, 0, 0)", fps, this.position, md);
        
        addVisualEffects(v1, v2, mv);

        const enemyBonusDamage = enemies.size * this.activeEnemyScaleFactor;
        
        for (const [eid, enemy] of enemies) {
            if (this.position.distance(enemy.position) <= this.activeRange * this.rangeFactor + enemy.size) {
                if (enemy.mysteryShield == 0) {
                    const imd = {message: "면역 손실", origin: enemy.id, size: enemy.size, fontSize: 16, floatDistance: 28, pop: false};
                    const imv = new VisualEffect("message", "rgb(255, 0, 0)", fps, enemy.position, imd);
                    addVisualEffects(imv);
                }

                enemy.setStatusEffect(ni);
                enemy.setStatusEffect(sl);
                enemy.setStatusEffect(st);

                let hpDamage = this.activeHpRatio * enemy.hp;

                if (enemy.isBoss) hpDamage = min(hpDamage, this.activeBossLimit);

                enemy.changeHp(-(this.activeDamage + enemyBonusDamage + hpDamage) * this.damageFactor, "wave", this.id);
            }
        }

        this.activeSuccess();
        return true;
    }

    draw(ctx) {
        super.draw();

        const size = this.size;
        const x = this.position.x;
        const y = this.position.y;

        // Aura effect
        if (this.tier >= 4) {
            ctx.beginPath();
            ctx.arc(x, y, size * 1.4, 0, pi * 2);
            ctx.closePath();

            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 1.4);
            rg.addColorStop(1, toTransparent(this.auraColor));
            rg.addColorStop(0.5, this.auraColor);
            rg.addColorStop(0, this.auraColor);

            ctx.fillStyle = rg;
            ctx.fill();
        }

        // Border
        if (this.tier >= 1) {
            ctx.beginPath();
            ctx.arc(x, y, size + 3, 0, pi * 2);
            ctx.closePath();

            ctx.fillStyle = this.borderColor;
            ctx.fill();
            ctx.stroke();
        }

        // Base plate
        ctx.beginPath();
        ctx.arc(x, y, size, 0, pi * 2);
        ctx.closePath();
        ctx.fillStyle = this.baseColor;
        ctx.fill();
        ctx.stroke();

        // Wave effect
        if (this.tier >= 3) {
            const pw = size / this.pulseCount;
            const period = (fps * pw) / this.pulseSpeed;
            const p = (globalTimer % period) / period;
            const clear = toTransparent(this.pulseColor);
            const color = this.pulseColor;

            for (let i = 0; i < this.pulseCount; i++) {
                const r1 = i * pw;
                const r2 = r1 + pw;

                ctx.beginPath();
                ctx.arc(x, y, r2, 0, pi * 2);
                ctx.closePath();

                const wg = ctx.createRadialGradient(x, y, max(0, r1 - pw / 2), x, y, r2 + pw / 2);
                wg.addColorStop(0, clear);
                wg.addColorStop(max(0, p - 0.3), clear);
                wg.addColorStop(p, color);
                wg.addColorStop(min(1, p + 0.3), clear);
                wg.addColorStop(1, clear);

                ctx.fillStyle = wg;
                ctx.fill();
            }
        }

        // Speaker.
        const xv = new Vector2(1, 0);
        let angle = xv.angle(this.lastDirection);

        if (this.lastDirection.y < 0) angle = pi * 2 - angle;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        const cl = this.centerLength;
        const cw = this.centerWidth;
        const sl = this.speakerLength;
        const sw = this.speakerWidth;
        const bl = this.backLength;
        const bw = this.backWidth;

        // Speaker center
        ctx.fillStyle = this.centerColor;
        ctx.fillRect(-cl / 2, -cw / 2, cl, cw);
        ctx.strokeRect(-cl / 2, -cw / 2, cl, cw);
        
        // Speaker rear part
        if (this.tier >= 3) {
            ctx.fillStyle = this.backColor;
            ctx.fillRect(-cl / 2 - bl, -bw / 2, bl, bw);
            ctx.strokeRect(-cl / 2 - bl, -bw / 2, bl, bw);
        }

        // Speaker cone
        ctx.beginPath();
        ctx.moveTo(cl / 2, cw / 2);
        ctx.lineTo(cl / 2 + sl, sw / 2);
        ctx.lineTo(cl / 2 + sl, -sw / 2);
        ctx.lineTo(cl / 2, -cw / 2);
        ctx.closePath();

        ctx.fillStyle = this.speakerColor;
        ctx.fill();
        ctx.stroke();

        // Speaker strip lines
        const slope = (sw - cw) / (2 * sl);
        const stripWidth = 3;
        const stripInterval = 2;
        let stripX = cl / 2 + sl - stripWidth - stripInterval;
        let stripY = (stripX- cl / 2) * slope + cw / 2;

        const loop = (this.tier < 2 ? 0 : (this.tier < 4 ?  1 : (this.tier < 5 ? 2 : 3)));

        ctx.fillStyle = this.stripColor;

        for (let i = 0; i < loop; i++) {
            const sx = stripX - i * (stripWidth + stripInterval);
            const sy = stripY - i * (stripWidth + stripInterval) * slope;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + stripWidth, sy + stripWidth * slope);
            ctx.lineTo(sx + stripWidth, -sy - stripWidth * slope);
            ctx.lineTo(sx, -sy);
            ctx.closePath();

            ctx.fill();
        }

        ctx.restore();
    }
}