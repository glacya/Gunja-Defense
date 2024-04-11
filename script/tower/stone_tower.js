/*
    stone_tower.js - 2023.11.01

    Implementation of Stone Turret tower.
*/

class StoneTower extends Tower {
    constructor(position) {
        super("stone", position);

        this.name = "석제 포탑";    // Stone Turret
        
        // A simple turret made of stone. Fires a bullet which damages an enemy by 75.
        this.baseDescription = "간단한 석제 포탑입니다. 포탄을 발사해 적에게 75의 피해를 입힙니다.";
        
        // Improved Cannon
        // Second Enhancement
        // Scatterblast
        // Tremendous Equipment
        // Extreme FireSystem
        this.upgradeName = ["발사단 개선", "이중 개량", "산탄 발포", "대구경 포탄 장착", "초고속 연사 체계"];
        
        this.upgradeCost = [150, 200, 750, 2500, 20000];

        // Cannon firing structure is improved. Gain 25% attack speed, and can now damage up to 2 targets.
        // Bullet damage is increased to 100. Gain 25% attack speed.
        // Installed more cannons. Now the turret fires 3 bullets every attack, and can now attack camouflaged enemies.
        // Gain 100% attack speed. Bullet can now damage up to 3 targets.
        // It is a super-rapid firing masterpiece of the age!! Bullet damage is increased to 140, and can now damage up to 4 targets. Gain 100% attack speed.
        this.upgradeDescription = [
            "발사 구조를 개선하여 공격 속도가 25% 빨라지고, 최대 2명의 적에게 피해를 입힐 수 있게 됩니다.",
            "탄환의 피해량이 100으로 늘어나고, 공격 속도가 25% 빨라집니다.",
            "포신을 추가로 장착하여 공격 시 탄환을 3개씩 발사합니다. 이제 은신한 적을 공격할 수 있게 됩니다.",
            "공격 속도가 100% 빨라집니다. 탄환이 최대 3명의 적에게 피해를 입힐 수 있게 됩니다.",
            "엄청나게 빠르게 발사하는 시대의 걸작입니다! 탄환의 피해량이 140으로 늘어나고 최대 4명의 적에게 피해를 입히며 공격 속도가 100% 빨라집니다."
        ];

        // Massive Bombard
        // Rampageous Bombard
        this.activeName = ["대형 포탄 발사", "초대형 포탄 발사"];

        // Fires huge bullets 6 times to the direction of your cursor. Each bullet does 280 damage up to 6 targets.
        // Fires gigantic bullets 10 times to the direction of your cursor. Each bullet does 950 damage up to 8 targets.
        this.activeDescription = [
            "마우스 방향으로 최대 6명의 적에게 280의 피해를 입히는 거대 포탄을 6회 발사합니다.",
            "마우스 방향으로 최대 8명의 적에게 950의 피해를 입히는 초거대 포탄을 10회 발사합니다."
        ];

        this.pierce = 1;
        this.size = 30;
        this.totalCost = 100;

        this.projSpeed = 15;
        this.projSize = 12;
        this.projLifetime = fps * 1.5;
        this.gunWidth = 10;
        this.gunLength = 40;
        this.attackDamage = 75;
        this.attackPeriod = fps * 5 / 6;
        this.attackRange = 190;

        this.activeDamage = 280;
        this.activePeriod = 15 * fps;
        this.activePierce = 6;
        this.activeProjSpeed = 10;
        this.activeProjSize = 44;
        this.activeProjLifetime = 3 * fps;
        this.activeProjStyle = "rgb(90, 90, 90)";

        this.activeMaxCount = 6;
        this.activeCount = 0;
        this.activeInterval = fps / 4;

        this.baseColor1 = "rgb(140, 140, 140)";
        this.spinColor = "rgb(84, 84, 84)";
        this.gunColor = "rgb(80, 80, 80)";
        this.baseColor2 = "rgb(108, 108, 108)";
        this.baseColor3 = "rgb(40, 40, 40)";
        this.gunTipColor = "rgb(144, 144, 144)";

        this.drawPeriod = 8 * fps;
    }

    upgrade() {
        if (!super.upgrade()) return false;

        switch (this.tier) {
            case 1: {
                this.attackPeriod = fps * 40 / 60;
                this.pierce = 2;
                this.attackRange = 210;
                break;
            }
            case 2: {
                this.attackDamage = 100;
                this.attackPeriod = 32;
                this.attackRange = 230;
                this.projSize = 16;
                this.projLifetime = 2 * fps;
                this.gunWidth = 13;
                this.gunLength = 45;

                break;
            }
            case 3: {
                this.permaCamoDetection = true;
                this.attackRange = 250;

                this.drawPeriod = 7 * fps;
                break;
            }
            case 4: {
                this.projSize = 20;
                this.pierce = 3;
                this.attackPeriod = fps * 16 / 60;
                this.gunWidth = 17;

                this.drawPeriod = 6 * fps;
                this.baseColor1 = "rgb(128, 128, 128)";
                this.baseColor2 = "rgb(120, 120, 120)";
                this.spinColor = "rgb(72, 72, 72)";
                this.gunColor = "rgb(64, 64, 64)";
                this.baseColor3 = "rgb(28, 28, 28)";

                break;
            }
            case 5: {
                this.attackRange = 275;
                this.pierce = 4;
                this.attackPeriod = fps * 8 / 60;
                this.attackDamage = 140;
                this.gunWidth = 20;
                this.gunLength = 50;

                this.activeDamage = 950;
                this.activePierce = 8;
                this.activeMaxCount = 10;
                this.activeProjSize = 55;
                this.activeProjStyle = "rgb(60, 60, 60)";

                this.drawPeriod = 4 * fps;
                this.baseColor1 = "rgb(32, 32, 32)";
                this.baseColor2 = "rgb(32, 32, 32)";
                this.baseColor3 = "rgb(0, 0, 0)";
                this.spinColor = "rgb(200, 200, 200)";
                this.gunColor = "rgb(144, 144, 144)";
                this.gunTipColor = "rgb(0, 0, 0)";
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
            aimingCursor = true;

            const position = this.position;
            let dirVector = vSub(mousePosition, position);
            dirVector.normalize();

            this.lastDirection = dirVector;

            if (globalGameTimer - this.activeTimer < fps / 2) return true;

            if ((globalGameTimer - this.activeTimer) % this.activeInterval != 0) return true;

            const onCollide = (e) => {
                e.changeHp(-this.activeDamage * this.damageFactor, "stone", this.id);
            };
            const onExpire = null;

            const velocityVector = vScalarMul(dirVector, this.activeProjSpeed);
            const theta = pi / 24;
            const style = {kind: "radial", fillStyle: this.activeProjStyle };
            const property = new ProjectileProperty(
                "nontarget",
                null,
                this.activePierce + this.pierceBoost,
                this.activeProjSize,
                this.activeProjLifetime,
                "stone",
                this.hasCamoDetection()
            );

            let v1 = velocityVector.rotate(theta);
            let v2 = velocityVector.rotate(-theta);
            let d1 = dirVector.rotate(theta);
            let d2 = dirVector.rotate(-theta);

            const p0 = new Projectile(vAdd(position, dirVector), velocityVector, property, style, onCollide, onExpire);
            const p1 = new Projectile(vAdd(position, d1), v1, property, style, onCollide, onExpire);
            const p2 = new Projectile(vAdd(position, d2), v2, property, style, onCollide, onExpire);

            addProjectiles(p0, p1, p2);

            if (++this.activeCount == this.activeMaxCount) {
                this.activeCount = 0;
                this.removeStatusEffect("casting");
            }

            return true;
        }

        if (!super.attack()) return false;

        const onCollide = (e) => {
            e.changeHp(-this.attackDamage * this.damageFactor, "stone", this.id);
        };
        const onExpire = null;
        const projStyle = {kind: "radial", fillStyle: "rgb(120, 120, 120)"};
        const projType = "nontarget";

        const leadId = pickTarget(this, (x) => {}, []);

        if (leadId == null) return false;

        const targetEnemy = enemies.get(leadId);

        let dirVector = computePredictedDirection(this.position, targetEnemy, this.projSpeed, this.attackRange * this.rangeFactor);
        let velocityVector = vScalarMul(dirVector, this.projSpeed);
        
        this.lastDirection = dirVector.copy();
        dirVector.multiply(this.size);

        const property = new ProjectileProperty(
            projType,
            null,
            this.pierce + this.pierceBoost,
            this.projSize,
            this.projLifetime,
            "stone",
            this.hasCamoDetection()
        );

        const p0 = new Projectile(vAdd(this.position, dirVector), velocityVector, property, projStyle, onCollide, onExpire);
        addProjectiles(p0);

        if (this.tier >= 3) {
            const theta = pi / 24;

            let v1 = velocityVector.rotate(theta);
            let v2 = velocityVector.rotate(-theta);
            let d1 = dirVector.rotate(theta);
            let d2 = dirVector.rotate(-theta);

            const p1 = new Projectile(vAdd(position, d1), v1, property, style, onCollide, onExpire);
            const p2 = new Projectile(vAdd(position, d2), v2, property, style, onCollide, onExpire);

            addProjectiles(p1, p2);
        }

        return true;
    }

    active() {
        if (!super.active()) return false;

        const dve = new VisualEffect("darken", null, fps / 2, null, null);
        addVisualEffects(dve);

        const cs = new CastingStatus(10 * fps, this.id);
        this.setStatusEffect(cs);

        this.activeCount = 0;
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
            ctx.arc(x, y, size * 1.25, 0, pi * 2);
            ctx.closePath();

            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 1.25);
            rg.addColorStop(1, "rgba(0, 0, 0, 0)");
            rg.addColorStop(0.5, "rgb(0, 0, 0)");
            rg.addColorStop(0, "rgb(0, 0, 0)");

            ctx.fillStyle = rg;
            ctx.fill();
        }

        // Circle 1 (Outermost)
        ctx.fillStyle = this.baseColor1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, pi * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Circle 2 (mid)
        if (this.tier >= 1) {
            ctx.beginPath();
            ctx.arc(x, y, size * 0.75, 0, pi * 2);
            ctx.closePath();

            ctx.fillStyle = this.baseColor2;
            ctx.fill();
            ctx.stroke();
        }

        // Rotation effect of circle 2
        if (this.tier >= 2) { 
            const drawPeriod = this.drawPeriod;
            const rotatePeriod = drawPeriod / 4;
            const baseAngle = floor(globalTimer / rotatePeriod) * pi / 4 + pi / 16;
            const addiAngle = (globalTimer % rotatePeriod) <= rotatePeriod / 4 ? (globalTimer % rotatePeriod * 4 / rotatePeriod * pi / 4) : 0;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(baseAngle + addiAngle);

            for (let i = 0; i < 8; i++) {
                ctx.rotate(pi / 4);
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.75, 0, pi / 8);
                ctx.lineTo(0, 0);
                ctx.closePath();

                ctx.fillStyle = this.spinColor;
                ctx.fill();
                ctx.stroke();
            }
            
            ctx.restore();
        }

        // Circle 3 (Innermost)
        if (this.tier >= 2) {
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, pi * 2);
            ctx.closePath();

            ctx.fillStyle = this.baseColor3;
            ctx.fill();
            ctx.stroke();
        }

        // Gun
        ctx.save();

        const xv = new Vector2(1, 0);
        let angle = xv.angle(this.lastDirection);

        if (this.lastDirection.y <= 0) {
            angle = pi * 2 - angle;
        }

        if (this.tier >= 3) ctx.lineWidth = 1.5;

        const w = this.gunWidth;
        const l = this.gunLength;

        ctx.translate(x, y);
        ctx.rotate(angle);

        if (this.tier >= 3) {
            const theta = pi / 18;

            const mw = w * 0.8;
            const ml = l * 0.9;

            ctx.fillStyle = this.gunColor;
            ctx.rotate(-theta);
            ctx.fillRect(0, -mw, ml, mw);
            ctx.strokeRect(0, -mw, ml, mw);

            if (this.tier >= 4) {
                ctx.fillStyle = this.gunTipColor;
                ctx.fillRect(ml, -mw, ml * 0.1, mw);
                ctx.strokeRect(ml, -mw, ml * 0.1, mw);

                ctx.fillRect(1, -mw * 0.6, ml, mw * 0.2);
            }

            ctx.fillStyle = this.gunColor;
            ctx.rotate(2 * theta);
            ctx.fillRect(0, 0, ml, mw);
            ctx.strokeRect(0, 0, ml, mw);

            if (this.tier >= 4) {
                ctx.fillStyle = this.gunTipColor;
                ctx.fillRect(ml, 0, ml * 0.1, mw);
                ctx.strokeRect(ml, 0, ml * 0.1, mw);

                ctx.fillRect(1, mw * 0.4, ml, mw * 0.2);
            }

            ctx.rotate(-theta);
        }

        ctx.fillStyle = this.gunColor;
        ctx.fillRect(0, -w / 2, l, w);
        ctx.strokeRect(0, -w / 2, l, w);

        if (this.tier >= 4) {
            ctx.fillStyle = this.gunTipColor;
            ctx.fillRect(l, -w / 2, l * 0.1, w);
            ctx.strokeRect(l, -w / 2, l * 0.1, w);

            ctx.fillRect(1, -w / 10, l, w / 5);
        }

        ctx.restore();
    }

    onRoundEnd() {
        this.activeCount = 0;
        super.onRoundEnd();
    }
}