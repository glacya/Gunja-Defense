/*
    laser_tower.js - 2023.12.29

    Implementation of Laser Accelerator.
*/


class LaserTower extends Tower {
    constructor(position) {
        super("laser", position);

        this.name = "레이저 가속기";
        this.baseDescription = "퍼져나가는 레이저를 발사해 총 4명의 적에게 피해를 입힙니다. 레이저는 첫 번째 대상에게 90의 피해를 입히고, 두 번째 대상부터는 피해를 입힐 때마다 피해량이 10%씩 줄어듭니다.";
        this.upgradeName = ["에너지 증폭", "신호 검출", "무손실 전파", "고출력 집적 광선", "불멸의 섬광"];
        this.upgradeCost = [300, 450, 1200, 6000, 50000];
        this.upgradeDescription = [
            "레이저의 위력이 강해집니다. 피해량이 120으로 늘어납니다.",
            "피해량이 160으로 늘어나며, 은신한 적을 공격할 수 있게 됩니다. 또한 공격 속도가 20%, 사거리가 20% 늘어납니다.",
            "피해량이 240으로 늘어나고, 공격 속도가 10% 빨라집니다. 또한 레이저가 최대 5명의 적에게 전파되고 더 멀리 전파되며, 더 이상 전파 시 피해량이 줄어들지 않습니다.",
            "피해량이 360으로 늘어나고, 공격 속도가 25% 빨라지며, 레이저가 최대 6명에게 전파됩니다. 보스를 공격하면 240의 추가 피해를 입힙니다.",
            "이상적인 레이저 기술을 완성했습니다. 레이저가 1400의 피해를 입히며 공격 속도가 30% 빨라집니다. 보스를 공격하면 600의 추가 피해를 입힙니다."
        ];

        this.activeName = ["소멸의 빛", "절멸의 광휘"];
        this.activeDescription = [
            "마우스 방향으로 5초간 강력한 빛의 줄기를 발사하여 적중한 모든 적에게 초당 1800의 피해를 입히고 이동 속도를 65% 감소시킵니다. 보호막이 있는 적에게는 2배의 피해를 입힙니다.",
            "마우스 방향으로 8초간 치명적인 빛의 줄기를 발사하여 적중한 모든 적에게 초당 5600의 피해를 입히고 이동 속도를 85% 감소시킵니다. 보호막이 있는 적에게는 2배의 피해를 입힙니다."
        ];

        this.size = 24;
        this.totalCost = 350;
        
        this.pierce = 4;
        this.attackDamage = 90;
        this.attackRange = 200;
        this.attackPeriod = fps;
        this.transferRange = 200;
        this.transferDecayRatio = 0.1;
        this.bossDamage = 0;

        this.laserDuration = 15;
        this.laserWidth = 16;
        
        this.activePeriod = 19 * fps;
        this.activeDamageTimer = globalGameTimer;
        this.activeDamagePeriod = fps / 20;
        this.activeDamage = 1800;
        this.activeLaserWidth = 120;
        this.activeSlowRatio = 0.35;
        this.activeReadyDuration = fps;
        this.activeDuration = 5 * fps;
        
        this.bodyWidth = 16;
        this.bodyLength = 30;
        this.gunWidth = 24;
        this.gunLength = 54;
        this.laserColor = "rgb(39, 151, 30)";
        this.baseColor = "rgb(45, 83, 45)";
        this.gunTipColor = "rgb(9, 55, 9)";
        this.gunEdgeColor = "rgb(14, 97, 20)";
        

        this.attackPerSteam = 5;
        this.steamRange = 150;
        this.steamCount = 0;
        this.steamDamage = 100;

        this.explosionDamage = 100;
        this.explosionRadius = 90;

        this.projSpeed = 25;
        this.projWidth = 4;
        this.projLength = 24;
        this.projSize = 12;
        this.projLifetime = fps;

        this.activePeriod = 24 * fps;
        this.activeDelay = fps;
        this.activeDuration = 4 * fps;
        this.activeDamage = 500;
        this.activeHpDamageRatio = 0.1;
        this.activeBossDpsMax = 3000;
        this.activeExecutionRatio = 0.2;

        this.activeExplosionRadius = 130;
        this.activeExplosionDamage = 200;
        this.activeProjSpeed = 4;
        this.activeProjSize = 80;
        this.activeProjLifetime = 8 * fps;
        this.activeBossDamageRatio = 2.0;
        this.activeHealReductionRatio = 0.4;

        this.baseColor = "rgb(145, 50, 201)";
        this.poisonColor = "rgb(145, 50, 201)";
        this.badPoisonColor = "rgb(106, 47, 125)";
        this.gunColor = "rgb(60, 60, 60)";
        this.borderColor = "rgb(62, 21, 85)";
        this.waveColor = "rgba(62, 21, 85, 0.5)";
        this.innerColor = "rgb(62, 21, 85)";
        this.lineColor = "rgb(0, 0, 0)";
    }

    upgrade() {
        if (!super.upgrade()) return false;

        switch (this.tier) {
            case 1: {
                this.attackDamage = 120;
                this.laserWidth = 20;
                this.gunWidth = 26;
                break;
            }
            case 2: {
                this.permaCamoDetection = true;
                this.attackPeriod = fps * 5 / 6;
                this.attackRange = 225;
                this.attackDamage = 160;
                this.gunLength = 60;

                break;
            }
            case 3: {
                this.laserWidth = 22;
                this.pierce = 5;
                this.transferDecayRatio = 0.0;
                this.transferRange = 250;

                this.attackPeriod = fps * 3 / 4;
                this.attackDamage = 240;

                this.gunLength = 64;
                this.gunWidth = 30;
                break;
            }
            case 4: {
                this.attackDamage = 360;
                this.bossDamage = 240;
                this.attackPeriod = fps * 34 / 60;
                this.attackRange = 250;
                this.pierce = 6;
                this.laserWidth = 24;

                this.gunWidth = 32;
                this.gunLength = 66;
                this.gunTipColor = "rgb(5, 35, 5)";
                this.gunEdgeColor = "rgb(10, 80, 10)";
                break;
            }
            case 5: {
                this.activeSlowRatio = 0.15;
                this.activeDamage = 5600;
                this.activeLaserWidth = 160;
                this.activeDuration = 480;
                this.laserWidth = 26;
                this.transferRange = 300;
                
                this.attackDamage = 1400;
                this.bossDamage = 600;
                this.attackPeriod = fps * 2 / 5;

                this.gunWidth = 34;
                this.gunLength = 70;

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
        if (this.castingActive) {
            let dirVector = vSub(mousePosition, this.position);
            dirVector.normalize();

            this.lastDirection = dirVector;

            const duration = globalGameTimer - this.activeTimer;

            if (duration < this.activeReadyDuration) {
                aimingCursor = true;
                return true;
            }

            if (duration % this.activeDamagePeriod == 0) {
                for (const [eid, enemy] of enemies) {
                    if (enemy.isImmuneTo("laser")) continue;

                    const ev = vSub(enemy.position, this.position);
                    const cross = dirVector.cross(enemyVector);
                    const dot = dirVector.dot(enemyVector);

                    // Using vector cross / dot product, determine if the enemy collided to the laser.
                    if (Math.abs(cross) <= this.activeLaserWidth / 2 + enemy.size && dot >= 0) {
                        let damage = -this.activeDamage * this.damageFactor / (fps / this.activeDamagePeriod);
                        if (enemy.shield > 0) damage *= 2.0;
                        if (enemy.laserActiveDamaged) damage *= 0.5;

                        enemy.laserActiveDamaged = true;
                        enemy.changeHp(damage, "laser", this.id);

                        const ss = new SlowStatus(this.activeDamagePeriod + 1, this.activeSlowRatio, this.id);
                        enemy.setStatusEffect(ss);
                    }
                }
            }

            return true;
        }

        if (!super.attack()) return false;

        let count = this.pierce + this.pierceBoost;
        let elist = [];
        let attacked = new Set();

        const skipClosure = (x, atk) => atk.has(x.id);

        // O(Pierce * Enemy) implementation.
        const baseRange = this.attackRange;
        const originPos = this.position.copy();

        while (count > 0) {
            const eid = pickTarget(this, skipClosure, [attacked]);

            this.attackRange = this.transferRange;
            if (eid == null) break;

            this.position = enemies.get(eid).position.copy();

            attacked.add(eid);
            elist.push(eid);

            count--;
        }

        this.attackRange = baseRange;
        this.position = originPos;

        if (elist.length == 0) return false;

        for (let i = 0; i < elist.length; i++) {
            const enemy = enemies.get(elist[i]);
            const v1 = new VisualEffect("laser", this.laserColor, this.laserDuration, i == 0 ? this.position.copy() : enemies.get(elist[i - 1]).position.copy(), {
                endPosition: enemy.position.copy(),
                laserWidth: this.laserWidth * (1 - i * this.transferDecayRatio)
            });
            const v2 = new VisualEffect("laserend", this.laserColor, this.laserDuration, enemy.position.copy(), {radius: this.laserWidth / 2 + 2});

            addVisualEffects(v1, v2);

            if (!enemy.isImmuneTo("laser")) {
                let dmg = this.attackDamage;
                if (enemy.isBoss) dmg += this.bossDamage;
                enemy.changeHp(-dmg * this.damageFactor * (1.0 - i * this.transferDecayRatio), "laser", this.id);
            }
        }

        const e0 = enemies.get(elist[0]);
        const dirVector = vSub(e0.position, this.position);
        dirVector.normalize();
        this.lastDirection = dirVector;

        return true;
    }

    active() {
        if (!super.active()) return false;

        const dve = new VisualEffect("darken", null, fps, null, null);

        const ved = {
            readyTime: this.activeReadyDuration,
            margin: this.bodyLength / 2,
            width: this.activeLaserWidth,
            towerId: this.id
        };
        const ave = new VisualEffect("laseractive", this.laserColor, this.activeDuration + this.activeReadyDuration, this.position, ved);

        const md = {message: "!!!", origin: this.id, size: this.size, fontSize: 24, floatDistance: 40, pop: true};
        const mv = new VisualEffect("message", "rgb(255, 255, 0)", fps, this.position, md);

        addVisualEffects(dve, ave, mv);

        const cs = new CastingStatus(this.activeReadyDuration + this.activeDuration, this.id);
        this.setStatusEffect(cs);

        this.activeSuccess();
        return true;
    }

    draw(ctx) {
        super.draw();

        const size = this.size;
        const x = this.position.x;
        const y = this.position.y;

        // Aura effect
        if (this.tier == 5) {
            ctx.beginPath();
            ctx.arc(x, y, size * 1.6, 0, pi * 2);
            ctx.closePath();

            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 1.6);
            rg.addColorStop(1, toTransparent(this.laserColor));
            rg.addColorStop(0.5, this.laserColor);
            rg.addColorStop(0, this.laserColor);

            ctx.fillStyle = rg;
            ctx.fill();
        }

        // Border
        if (this.tier >= 2) {
            ctx.beginPath();
            ctx.arc(x, y, size + 4, 0, pi * 2);
            ctx.closePath();

            ctx.fillStyle = "rgb(0, 0, 0)";
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

        // Cannon part
        const dirVector = this.lastDirection;
        const xVector = new Vector2(1, 0);
        let angle = dirVector.angle(xVector);

        if (dirVector.y < 0.0) angle = pi * 2 - angle;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        const gl = this.gunLength;
        const gw = this.gunWidth;

        ctx.fillStyle = this.gunEdgeColor;
        ctx.fillRect(-gl / 2, -gw / 2, gl, gw);
        ctx.strokeRect(-gl / 2, -gw / 2, gl, gw);

        if (this.tier >= 1) {
            const lg = ctx.createLinearGradient(-gl, 0, gl, 0);
            let period = (this.tier == 5) ? 67 : ((this.tier == 4) ? 89 : 127);
            period = period * fps / 60;

            if (this.castingActive) period = floor(period / 2);

            const phase = globalTimer % period;
            const p = phase / period;

            lg.addColorStop(0, this.laserColor);
            lg.addColorStop(max(0, p - 0.3), this.laserColor);
            lg.addColorStop(p, "rgb(255, 255, 255)", this.laserColor);
            lg.addColorStop(min(1, p + 0.3), this.laserColor);
            lg.addColorStop(1, this.laserColor);

            ctx.fillStyle = lg;
            ctx.fillRect(-gl / 2 + 4, -gw / 2 + 4, gl - 4, gw - 8);
            ctx.strokeRect(-gl / 2 + 4, -gw / 2 + 4, gl - 4, gw - 8);
        }
        else {
            ctx.fillStyle = this.laserColor;
            ctx.fillRect(-gl / 2 + 4, -gw / 2 + 4, gl - 4, gw - 8);
            ctx.strokeRect(-gl / 2 + 4, -gw / 2 + 4, gl - 4, gw - 8);
        }

        // Triangle shapes
        if (this.tier >= 3) {
            const interval = 10;
            const triSize = 15;
            const count = this.tier - 2;

            const period = fps * 5 / 4;
            const p = (globalTimer % period) / period;
            
            ctx.fillStyle = this.castingActive ? "rgb(255, 255, 0)" : toAlpha(this.gunTipColor, 0.85 + 0.1 * cos(p * pi * 2));

            for (let i = 0; i < count; i++) {
                ctx.beginPath();
                ctx.moveTo((i - count / 2 + 0.5) * interval - triSize / 4, triSize / 2);
                ctx.lineTo((i - count / 2 + 0.5) * interval - triSize / 4, -triSize / 2);
                ctx.lineTo((i - count / 2 + 0.5) * interval + triSize * 3 / 4, 0);
                ctx.closePath();

                ctx.fill();
            }
        }

        // Gun frontal / temporal paddings
        let ty = -gw / 2;
        let tw = gw;

        if (this.tier == 5) {
            ty -= 2;
            tw += 4;
        }

        ctx.fillStyle = this.gunTipColor;
        ctx.fillRect(gl / 2, ty, 5, tw);
        ctx.strokeRect(gl / 2, ty, 5, tw);

        if (this.tier >= 1) {
            ctx.fillRect(-gl / 2 - 5, -gw / 2 + 5, 5, gw - 10);
            ctx.strokeRect(-gl / 2 - 5, -gw / 2 + 5, 5, gw - 10);
        }
        
        if (this.tier >= 4) {
            ctx.fillRect(-gl / 2 - 10, -gw / 2 + 10, 5, gw - 20);
            ctx.strokeRect(-gl / 2 - 10, -gw / 2 + 10, 5, gw - 20);
        }

        ctx.restore();
    }

    onRoundEnd() {
        super.onRoundEnd();
    }
}