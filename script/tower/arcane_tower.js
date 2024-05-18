/*
    arcane_tower.js - 2024.01.20

    Implementation of Arcane Pedestal.
*/

class ArcaneTower extends Tower {
    constructor(position) {
        super("arcane", position);

        this.name = "마력의 제단"; 
        this.baseDescription = "강한 마력이 깃든 제단입니다. 마탄을 빠르게 발사하여 150의 피해를 입힙니다.";
        this.upgradeName = ["마법 숙달", "몰아치는 마력", "주문 격류", "완벽에 가까운 힘", "초월"];
        this.upgradeCost = [1200, 2300, 9000, 35000, 180000];
        this.upgradeDescription = [
            "마탄의 피해량이 165로 늘어납니다. 이제 마탄이 최대 2명의 적을 공격할 수 있습니다.",
            "마탄의 피해량이 180으로 늘어나고 공격 속도가 10% 빨라집니다. 이제 마탄이 최대 3명의 적을 공격할 수 있으며, 매 20번의 공격마다 강화된 마탄을 대신 발사하여 400의 피해를 입힙니다.",
            "마탄의 피해량이 200으로 늘어나고 공격 속도가 10% 빨라집니다. 마탄이 적에게 적중하면 마력 폭발을 일으켜 근처의 모든 적에게 마탄 피해량의 100%만큼 피해를 입힙니다.",
            "공격 속도가 33% 빨라집니다. 이제 강화된 마탄을 매 10번의 공격마다 발사하고, 강화된 마탄의 피해량이 600으로 늘어납니다. 마력 폭발의 피해량이 마탄 피해량의 200%로 늘어납니다.",
            "세계를 초월한 힘입니다. 마탄의 피해량이 300으로 늘어나고, 공격 속도가 50% 빨라집니다. 이제 강화된 마탄을 매 5번의 공격마다 발사하고, 강화된 마탄의 피해량이 1500으로 늘어납니다."
        ];
        this.activeName = ["의식 융합", "의식 초월"];
        this.activeDescription = [
            "이번 라운드 동안 의식을 1 얻습니다(최대 4). 의식 중첩 1마다 공격 속도가 10% 빨라지고, 모든 공격의 피해량이 20 늘어납니다. 최대 중첩에 도달하면 10초간 초월 상태가 되어 모든 공격이 50%의 추가 피해를 입힙니다.",
            "이번 라운드 동안 의식을 2 얻습니다(최대 4). 의식 중첩 1마다 공격 속도가 20% 빨라지고, 모든 공격의 피해량이 50 늘어납니다. 최대 중첩에 도달하면 20초간 초월 상태가 되어 모든 공격이 100%의 추가 피해를 입힙니다.",
        ];
        
        this.size = 30;
        this.totalCost = 2000;
        this.pierce = 1;
        this.explosionDamageRatio = 1.0;
        this.attackDamage = 150;
        this.attackRange = 250;
        this.attackPeriod = fps / 6;
        this.attackExplosionRadius = 75;
        this.attackProjSize = 17;
        this.attackProjSpeed = 12;
        this.attackProjLifetime = 3 * fps;

        this.enchantDamage = 400;
        this.enchantExplosionRadius = 125;
        this.enchantCount = 0;
        this.enchantLimit = 20;
        this.enchantProjSize = 20;
        this.enchantProjSpeed = 16;
        this.enchantProjLifetime = 3 * fps;

        this.activePeriod = 4 * fps;
        this.activeStack = 0;
        this.activeMaxStack = 4;
        this.activeDamagePerStack = 20;
        this.activeBuffPerStack = 0.1;
        this.transcendentRatio = 1.5;
        this.transcendentDuration = 10 * fps;

        this.baseColor = "rgb(255, 255, 255)";
        this.baseBorderColor = "rgb(0, 0, 0)";
        this.plateColor = "rgb(255, 255, 255)";
        this.baseColorTrans = "rgb(0, 0, 0)";
        this.baseBorderColorTrans = "rgb(255, 255, 255)";
        this.plateColorTrans = "rgb(0, 0, 0)";

        this.arcColor = "rgb(32, 32, 32)";
        this.arcColorTrans = "rgb(216, 216, 216)";
        
        this.projInnerColor = "rgb(255, 255, 255)";
        this.projOuterColor = "rgb(0, 0, 0)";
        this.projInnerColorTrans = "rgb(0, 0, 0)";
        this.projOuterColorTrans = "rgb(255, 255, 255)";
        
        this.minuteHandPeriod = 5 * fps;
        this.minuteHandWidth = 3;
        this.minuteHandLength = 16;
        this.minuteHandAngle = 0.0;
        this.hourHandPeriod = 60 * fps;
        this.hourHandWidth = 4;
        this.hourHandLength = 10;
        this.hourHandAngle = 0.0;

        this.clockHandColor = "rgb(0, 0, 0)";
        this.clockHandColorTrans = "rgb(255, 255, 255)";
        this.clockCenterSize = 3;

        this.diamondPeriod = 12 * fps;
        this.diamondAngle = 0.0;
        this.diamondColor = "rgb(255, 255, 255)";
        this.diamondColorTrans = "rgb(0, 0, 0)";
    }

    upgrade() {
        if (!super.upgrade()) return false;

        switch (this.tier) {
            case 1: {
                this.attackDamage = 165;
                this.pierce = 2;

                this.attackProjSpeed = 14;
                break;
            }
            case 2: {
                this.attackDamage = 180;
                this.attackPeriod = fps * 9 / 60;
                this.pierce = 3;
                this.attackProjSpeed = 15;

                break;
            }
            case 3: {
                this.attackDamage = 200;
                this.attackPeriod = fps * 8 / 60;
                this.attackRange = 300;

                this.attackProjSpeed = 16;
                this.enchantProjSpeed = 18;

                break;
            }
            case 4: {
                this.attackPeriod = fps / 10;
                this.attackRange = 400;
                this.enchantLimit = 10;
                this.enchantDamage = 600;

                this.explosionDamageRatio = 2.0;
                this.attackExplosionRadius = 100;
                this.enchantExplosionRadius = 125;

                this.attackProjSpeed = 17;
                this.enchantProjSpeed = 19;
                break;
            }
            case 5: {
                this.attackPeriod = fps / 15;
                this.attackDamage = 300;
                this.attackRange = 600;

                this.attackExplosionRadius = 125;
                this.enchantExplosionRadius = 150;

                this.enchantLimit = 5;
                this.enchantDamage = 1500;

                this.attackProjSpeed = 18;
                this.enchantProjSpeed = 20;

                this.transcendentRatio = 2.0;
                this.transcendentDuration = 20 * fps;

                this.activeBuffPerStack = 0.2;
                this.activeDamagePerStack = 50;
                this.arcColor = "rgb(0, 0, 0)";

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

        const additionalDamage = this.activeStack * this.activeDamagePerStack;
        const normalDamage = this.attackDamage + additionalDamage;
        const normalExpDamage = this.attackDamage * this.explosionDamageRatio + additionalDamage;
        const enchantDamage = this.enchantDamage + additionalDamage;
        const enchantExpDamage = this.enchantDamage * this.explosionDamageRatio + additionalDamage;

        const onCollide = (e) => {
            e.changeHp(-normalDamage * this.damageFactor, "arcane", this.id);

            if (this.tier >= 3) {
                const vse = new VisualEffect("growout", toAlpha(this.projOuterColor, 0.6), fps * 0.4, e.position, {radius: this.attackExplosionRadius});
                addVisualEffects(vse);

                for (const [eid, enemy] of enemies) {
                    if (enemy.camouflaged && !this.hasCamoDetection()) continue;
                    if (enemy.isImmuneTo("arcane")) continue;

                    if (enemy.position.distance(e.position) <= enemy.size + this.attackExplosionRadius)
                        enemy.changeHp(-normalExpDamage * this.damageFactor, "arcane", this.id);
                }
            }
            else {
                const vse = new VisualEffect("growout", toAlpha(this.projOuterColor, 0.6), fps * 0.4, e.position, { radius: 36 });
                addVisualEffects(vse);
            }
        };

        const onEnchantedCollide = (e) => {
            e.changeHp(-enchantDamage * this.damageFactor, "arcane", this.id);

            
            const vse = new VisualEffect("growout", toAlpha(this.projOuterColor, 0.4), fps * 0.4, e.position, {radius: this.enchantExplosionRadius});
            addVisualEffects(vse);

            for (const [eid, enemy] of enemies) {
                if (enemy.camouflaged && !this.hasCamoDetection()) continue;
                if (enemy.isImmuneTo("arcane")) continue;

                if (enemy.position.distance(e.position) <= enemy.size + this.enchantExplosionRadius)
                    enemy.changeHp(-enchantExpDamage * this.damageFactor, "arcane", this.id);
            }
        };
        
        const projStyle = {
            kind: "arcanebasic",
            innerFillStyle: this.transcendent ? this.projInnerColorTrans : this.projInnerColor,
            outerFillStyle: this.transcendent ? this.projOuterColorTrans : this.projOuterColor
        };
        const projType = "nontarget";

        const leadId = pickTarget(this, (x) => {}, []);

        if (leadId == null) return false;

        const enchantedAttack = (this.enchantCount++ == this.enchantLimit - 1) && this.tier >= 2;
        this.enchantCount %= this.enchantLimit;

        const projSpeed = enchantedAttack ? this.enchantProjSpeed : this.attackProjSpeed;
        const projSize = enchantedAttack ? this.enchantProjSize : this.attackProjSize;
        const projLifetime = enchantedAttack ? this.enchantProjLifetime : this.attackProjLifetime;

        const targetEnemy = enemies.get(leadId);

        const dirVector = computePredictedDirection(this.position, targetEnemy, projSpeed, this.attackRange * this.rangeFactor);
        const velocityVector = vScalarMul(dirVector, projSpeed);
        this.lastDirection = dirVector.copy();

        dirVector.multiply(this.size);

        const property = new ProjectileProperty(
            projType,
            null,
            this.pierce + this.pierceBoost,
            projSize,
            projLifetime,
            "arcane",
            this.hasCamoDetection()
        );

        const p = new Projectile(
            vAdd(this.position, dirVector),
            velocityVector,
            property,
            projStyle,
            onCollide,
            null
        );
        addProjectiles(p);

        return true;
    }

    active() {
        if (!super.active()) return false;

        if (this.activeStack < this.activeMaxStack) {
            this.activeStack += (this.tier == 4 ? 1 : 2);
        }

        this.activeStack = min(this.activeStack, this.activeMaxStack);

        const trStatus = new TranReadyStatus(1e18, this.activeStack * this.activeBuffPerStack + 1.0, this.id);

        this.removeStatusEffect("tranready", this.id);
        this.setStatusEffect(trStatus);

        if (this.activeStack == this.activeMaxStack) {
            const vse = new VisualEffect("radialout", "rgb(0, 0, 0)", fps, this.position, {radius: 100});
            const md = {message: "초월", origin: this.id, size: this.size, fontSize: 32, floatDistance: 40, pop: true};
            const mv = new VisualEffect("message", "rgb(0, 0, 0)", fps, this.position, md);

            addVisualEffects(vse, mv);

            const transStatus = new TranscendentStatus(this.transcendentDuration, this.transcendentRatio, this.id);

            this.removeStatusEffect("transcendent", this.id);
            this.setStatusEffect(transStatus);

            if (this.tier == 5) 
                reachedTranscendent = true;
        }
        else {
            const md = {message: `${this.activeStack}..`, origin: this.id, size: this.size, fontSize: 24, floatDistance: 40, pop: false};
            const mv = new VisualEffect("message", "rgb(0, 0, 0)", fps, this.position, md);
            addVisualEffects(mv);
        }

        this.activeSuccess();
        return true;
    }

    draw(ctx) {
        super.draw();

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        // Aura effect
        if (this.tier == 5) {
            ctx.beginPath();
            ctx.arc(x, y, size * 1.5, 0, pi * 2);
            ctx.closePath();

            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 1.5);
            rg.addColorStop(1, "rgba(0, 0, 0, 0)");
            rg.addColorStop(0.5, "rgb(0, 0, 0)");
            rg.addColorStop(0, "rgb(0, 0, 0)");

            ctx.fillStyle = rg;
            ctx.fill();
        }

        // Plate
        const plateRatio = 1.2;

        ctx.beginPath();
        ctx.moveTo(x - size * plateRatio, y);
        ctx.lineTo(x, y + size * plateRatio);
        ctx.lineTo(x + size * plateRatio, y);
        ctx.lineTo(x, y - size * plateRatio);
        ctx.closePath();

        ctx.fillStyle = this.transcendent ? this.plateColorTrans : this.plateColor;
        ctx.fill();
        ctx.stroke();

        // Outer spikes (t1)
        if (this.tier >= 1) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(pi / 4);
            
            ctx.beginPath();
            ctx.moveTo(-size * plateRatio, 0);
            ctx.lineTo(0, size * plateRatio);
            ctx.lineTo(size * plateRatio, 0);
            ctx.lineTo(0, -size * plateRatio);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // Core
        ctx.beginPath();
        ctx.arc(x, y, size, 0, pi * 2);
        ctx.closePath();

        const spherePeriod = 2 * fps;
        const spherePhase = globalTimer % spherePeriod;
        const rgs = ctx.createRadialGradient(x, y, 10, x, y, size);
        
        const baseColor = this.transcendent ? this.baseColorTrans : this.baseColor;
        const baseBorderColor = this.transcendent ? this.baseBorderColorTrans : this.baseBorderColor;

        rgs.addColorStop(0, baseColor);
        rgs.addColorStop(0.6 + 0.1 * sin(2 * pi * spherePhase / spherePeriod), baseColor);
        rgs.addColorStop(1, baseBorderColor);

        ctx.fillSTyle = rgs;
        ctx.fill();
        ctx.stroke();

        // Arc-shaped effect (t2)
        if (this.tier >= 2) {
            ctx.save();
            ctx.translate(x, y);

            const arcPeriod = 3 * fps;

            for (let i = 0; i < 12; i++) {
                ctx.rotate(pi / 6);

                const alpha = fitInterval(0.3 + 0.2 * sin(pi * 2 * ((globalTimer + i * arcPeriod / 6) % arcPeriod) / arcPeriod), 0, 1);
                ctx.fillStyle = toAlpha(this.transcendent ? this.arcColorTrans : this.arcColor, alpha);
                
                ctx.beginPath();
                ctx.arc(0, 0, size * 0.7, 0, pi / 6);
                ctx.lineTo(0, 0);
                ctx.closePath();

                ctx.fill();
            }
            
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.3, 0, pi * 2);
            ctx.closePath();

            ctx.fillStyle = baseColor;
            ctx.fill();
            ctx.restore();
        }

        // Clockhand (t3)
        if (this.tier >= 3) {
            ctx.fillStyle = this.transcendent ? this.clockHandColorTrans : this.clockHandColor;
            
            ctx.beginPath();
            ctx.arc(x, y, this.clockCenterSize, 0, pi * 2);
            ctx.closePath();

            ctx.fill();

            if (this.transcendent) {
                this.minuteHandAngle += (12 * pi * 2 / this.minuteHandPeriod);
                this.hourHandAngle += (12 * pi * 2 / this.hourHandPeriod);
            }
            else {
                this.minuteHandAngle += (pi * 2 / this.minuteHandPeriod);
                this.hourHandAngle += (pi * 2 / this.hourHandPeriod);
            }

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.minuteHandAngle);

            ctx.beginPath();
            ctx.moveTo(0, this.minuteHandWidth / 2);
            ctx.lineTo(this.minuteHandLength, this.minuteHandWidth / 2);
            ctx.lineTo(this.minuteHandLength + this.minuteHandWidth, 0);
            ctx.lineTo(this.minuteHandLength, -this.minuteHandWidth / 2);
            ctx.lineTo(0, -this.minuteHandWidth / 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(this.hourHandAngle);
            
            ctx.beginPath();
            ctx.moveTo(0, this.hourHandWidth / 2);
            ctx.lineTo(this.hourHandLength, this.hourHandWidth / 2);
            ctx.lineTo(this.hourHandLength + this.hourHandWidth, 0);
            ctx.lineTo(this.hourHandLength, -this.hourHandWidth / 2);
            ctx.lineTo(0, -this.hourHandWidth / 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // Floating diamonds (t4)
        if (this.tier >= 4) {
            ctx.save();
            ctx.translate(x, y);

            if (this.transcendent) {
                this.diamondAngle += 3 * pi * 2.0 / this.diamondPeriod;
            }
            else {
                this.diamondAngle += pi * 2.0 / this.diamondPeriod;
            }

            ctx.rotate(-this.diamondAngle);
            
            const diaWidth = this.tier == 5 ? 10 : 8;
            const diaLength = this.tier == 5 ? 25 : 20;
            const diaWidthInner = diaWidth * 0.75;
            const diaLengthInner = diaLength * 0.75;

            for (let i = 0; i < 4; i++) {
                ctx.rotate(pi / 2);

                let rx = size * 0.8;

                ctx.beginPath();
                ctx.moveTo(rx, 0);
                ctx.lineTo(rx + diaLength / 2, diaWidth / 2);
                ctx.lineTo(rx + diaLength, 0);
                ctx.lineTo(rx + diaLength / 2, -diaWidth / 2);
                ctx.closePath();

                ctx.fillStyle = i >= this.activeStack ? this.diamondColorTrans : this.diamondColor;
                ctx.fill();
                ctx.stroke();

                rx + 2.5;
                ctx.beginPath();
                ctx.moveTo(rx, 0);
                ctx.lineTo(rx + diaLengthInner / 2, diaWidthInner / 2);
                ctx.lineTo(rx + diaLengthInner, 0);
                ctx.lineTo(rx + diaLengthInner / 2, -diaWidthInner / 2);
                ctx.closePath();

                ctx.fillStyle = i < this.activeStack ? this.diamondColorTrans : this.diamondColor;
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    onRoundEnd() {
        this.activeStack = 0;
        this.removeStatusEffect("transcendent");
    }
}