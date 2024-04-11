/* 
    freeze_tower.js - 2023.11.01

    Implementation of Frosty Matter tower.
*/

class FreezeTower extends Tower {
    constructor(position) {
        super("freeze", position);

        // Frosty Matter
        this.name = "서리 냉각기";

        // A cubic material shrouded with deep, deep frost. Slows nearby enemies by 30% for 2 seconds.
        this.baseDescription = "깊은 냉기가 느껴지는 기계입니다. 주변의 적을 얼려 2초간 이동 속도를 30% 낮춥니다.";

        // Improved Freeze
        // Frost's Grasp
        // Everfrost
        // Antarctic Wind
        // Climatic Winter
        this.upgradeName = ["냉각 성능 개선", "깊은 동상", "가시지 않는 추위", "혹한의 바람", "절정의 겨울"];
        this.upgradeCost = [250, 450, 900, 5500, 35000];

        // Frost gets colder. Gain 10% attack range and 10% attack speed.
        // On attack, deal 100 damage to enemies, and freezes for 0.75 seconds. Enemies frozen are immobilized.
        // Damage is increased to 200, slowing ratio is increased to 40%, and duration of freeze is increased to 1 second. Gain 20% attack speed.
        // Damage is increased to 300, and duration of freeze is increased to 1.25 seconds. Enemies attacked by Frosty Matter is weakened, and thereby take 25% additional damage. Gain 15% attack speed.
        // Damage is increased to 750, and duration of freeze is increased to 1.5 seconds. Enemies attacked by Frosty Matter is weakened even more, thereby take 50% additional damage.
        this.upgradeDescription = [
            "냉각 성능이 좋아집니다. 사거리가 늘어나고 공격 속도가 10% 빨라집니다.",
            "적을 얼릴 시 100의 피해를 입히고 추가로 0.75초동안 냉각시켜 이동하지 못하게 합니다.",
            "공격 속도가 20% 빨라지고 피해량이 200으로 늘어납니다. 냉각 지속 시간이 1초로 늘어나며, 이동 속도 감소량이 40%로 늘어납니다.",
            "공격 속도가 15% 빨라지고 피해량이 300으로 늘어납니다. 냉각 지속 시간이 1.25초로 늘어나며, 공격당한 적은 약화되어 모든 받는 피해가 25% 늘어납니다.",
            "피해량이 750으로 늘어나며 냉각 지속 시간이 1.5초로 늘어납니다. 공격당한 적은 더욱 약화되어 모든 받는 피해가 50% 늘어납니다."
        ];

        this.activeName = [
            "혹한의 눈보라",     // Harsh Blizzard
            "영원의 눈보라"      // Eternal Blizzard
        ];

        // Unleashes cold blizzard; pushes all enemies back. For next 4 seconds, the blizzard stays on the world, dealing total 1600 damage to all enemies, and freezes them and weaken them. Enemies weakened take 35% additional damage.
        // Unleashes extremely harsh blizzard; pushes hard all enemies back. For next 6 seconds, the blizzard stays howling on the world, dealing total 6000 damage to all enemies, and freezes them and weaken them. Enemies weakend take 65% additional damage.
        this.activeDescription = [
            "차가운 눈보라를 일으켜 모든 적을 뒤로 밀쳐냅니다. 이후 4초간 눈보라가 불며 계속해서 모든 적에게 총 1600의 피해를 입히고 냉각시키며, 크게 약화시켜 받는 피해를 35% 늘립니다.",
            "뼛속까지 시린 강력한 눈보라를 일으켜 모든 적을 뒤로 크게 밀쳐냅니다. 이후 6초간 눈보라가 불며 계속해서 모든 적에게 총 6000의 피해를 입히고 냉각시키며, 크게 약화시켜 받는 피해를 65% 늘립니다."
        ];

        this.size = 24;
        this.totalCost = 250;

        this.freezeDuration = 45;
        this.slowDuration = 2 * fps;
        this.slowRatio = 0.7;
        this.weakenDuration = 1.25 * fps;
        this.weakenRatio = 1.25;
        this.attackDamage = 0;
        this.attackPeriod = 2 * fps;
        this.attackRange = 150;
        this.pierce = 15;

        this.activeKnockbackDuration = 1.5 * fps;
        this.activeDuration = 4 * fps;
        this.activePeriod = 21 * fps;
        this.activeKnockbackRatio = 0.8;
        this.activeDamage = 1600;
        this.activeDamagePeriod =  fps / 2;
        this.activeSlowRatio = 0.4;
        this.activeWeakenRatio = 1.35;
        this.activeCount = -1;

        this.baseColor = "rgb(33, 215, 235)";
        this.centerColor = "rgb(170, 244, 244)";
        this.attackColor = "rgb(120, 255, 255)";
    }

    upgrade() {
        if (!super.upgrade()) return false;

        switch (this.tier) {
            case 1: {
                this.pierce = 17;
                this.attackRange = 165;
                this.attackPeriod = fps * 10 / 6;

                this.centerColor = "rgb(216, 255, 255)";
                break;
            }
            case 2: {
                this.pierce = 19;
                this.attackDamage = 100;
                break;
            }
            case 3: {
                this.pierce = 21;
                this.slowRatio = 0.6;
                this.attackPeriod = fps * 83 / 60;
                this.attackDamage = 200;
                this.freezeDuration = fps;

                this.baseColor = "rgb(33, 195, 235)";
                break;
            }
            case 4: {
                this.pierce = 23;
                this.attackRange = 180;
                this.attackPeriod = fps * 70 / 60;
                this.attackDamage = 300;
                this.freezeDuration = 1.25 * fps;

                this.baseColor = "rgb(0, 109, 235)";
                this.attackColor = "rgb(0, 135, 255)";
                break;
            }
            case 5: {
                this.pierce = 25;
                this.attackDamage = 750;
                this.attackRange = 230;
                this.weakenRatio = 1.5;
                this.weakenDuration = 1.5 * fps;
                this.freezeDuration = 1.5 * fps;
                this.activeDamage = 6000;
                this.activeKnockbackRatio = 1.0;
                this.activeDuration = 6 * fps;
                this.activeWeakenRatio = 1.65;

                this.baseColor = "rgb(15, 51, 235)";
                this.centerColor = "rgb(100, 255, 255)";
                this.attackColor = "rgb(64, 64, 255)";
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
            const currentIndex = floor((globalGameTimer - this.activeTimer) / this.activeDamagePeriod);
            
            if (currentIndex > this.activeCount) {
                const fs = new FreezeStatus(this.activeDuration / 2, this.id);
                const cs = new ColdStatus(this.activeDuration / 2, this.activeSlowRatio, this.id);
                const ws = new WeakenStatus(this.activeDuration / 2, this.activeWeakenRatio, this.id);

                for (const [eid, enemy] of enemies) {
                    if (enemy.camouflaged && !this.hasCamoDetection()) continue;
                    if (enemy.isImmuneTo("freeze")) continue;

                    enemy.setStatusEffect(fs);
                    enemy.setStatusEffect(cs);
                    enemy.setStatusEffect(ws);

                    enemy.changeHp(-this.activeDamage * this.damageFactor / (this.activeDuration / this.activeDamagePeriod), "freeze", this.id);
                }

                this.activeCount++;
            }

            if (this.activeCount >= (this.activeDuration / this.activeDamagePeriod)) {
                this.removeStatusEffect("casting", this.id);
            }

            return true;
        }

        if (!super.attack()) return false;

        const onEffect = (e) => {
            const fs = new FreezeStatus(this.freezeDuration, this.id);
            const cs = new ColdStatus(this.slowDuration, this.slowRatio, this.id);
            const ws = new WeakenStatus(this.weakenDuration, this.weakenRatio, this.id);

            e.setStatusEffect(cs);

            if (!e.frozen) {
                e.changeHp(-this.attackDamage * this.damageFactor, "freeze", this.id);

                if (this.tier >= 2) {
                    e.setStatusEffect(fs);
                }

                if (this.tier >= 4) {
                    e.setStatusEffect(ws);
                }
            }
        };

        let effected = 0;
        for (const [eid, enemy] of enemies) {
            if (enemy.camouflaged && !this.hasCamoDetection()) continue;
            if (enemy.isImmuneTo("freeze")) continue;

            if (this.position.distance(enemy.position) <= this.attackRange * this.rangeFactor + enemy.size) {
                effected++;
                onEffect(enemy);
            }

            if (effected == this.pierce + this.pierceBoost) break;
        }

        if (effected > 0) {
            const vd = { radius: this.attackRange };
            const vse = new VisualEffect("radialout", this.attackColor, fps / 2, this.position, vd);
            addVisualEffect(vse);

            return true;
        }

        return false;
    }

    active() {
        if (!super.active()) return false;

        const vse = new VisualEffect("blizzard", null, this.activeDuration, null, { t5: this.tier == 5});
        const msd = { message: this.activeName[this.tier - 4], origin: this.id, size: this.size, fontSize: 30, floatDistance: 20, pop: true};
        const mv = new VisualEffect("message", this.baseColor, 1.5 * fps, this.position, msd);
        
        addVisualEffect(vse, mv);

        this.setStatusEffect(new CastingStatus(this.activeDuration, this.id));

        const ks = new KnockbackStatus(this.activeKnockbackDuration, this.activeKnockbackRatio, this.id);
        this.activeCount = -1;

        for (const [eid, enemy] of enemies) {
            if (enemy.camouflaged && !this.hasCamoDetection()) continue;
            if (enemy.isImmuneTo("freeze")) continue;

            enemy.setStatusEffect(ks);
        }

        this.activeSuccess();

        return true;
    }

    draw(ctx) {
        super.draw();

        const size = this.size;

        const x = this.position.x;
        const y = this.position.y;
        const w = 2 * size;
        const h = 2 * size;

        // Casting active..
        if (this.castingActive) {
            const acSize = size * (2.5 + 0.2 * sin(globalGameTimer / (fps * 0.75) * pi * 2));

            ctx.beginPath();
            ctx.arc(x, y, acSize, 0, pi * 2);
            ctx.closePath();

            const rg = ctx.createRadialGradient(x, y, 0, x, y, acSize);
            rg.addColorStop(1, "rgba(0, 0, 255, 0)");
            rg.addColorStop(0.5, "rgb(0, 0, 255)");
            rg.addColorStop(0, "rgb(0, 0, 255)");

            ctx.fillStyle = rg;
            ctx.fill();
        }

        // Aura effect
        if (this.tier >= 5) {
            ctx.beginPath();
            ctx.arc(x, y, size * 1.75, 0, pi * 2.0);
            ctx.closePath();

            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 1.75);
            rg.addColorStop(1, "rgba(33, 63, 235, 0)");
            rg.addColorStop(0.3, "rgb(33, 63, 235)");
            rg.addColorStop(0, "rgb(33, 63, 235)");

            ctx.fillStyle = rg;
            ctx.fill();
        }

        ctx.fillStyle = this.baseColor;

        // 4-direction spike (tier 5)
        if (this.tier >= 5) {
            ctx.save();
            ctx.translate(x, y);

            for (let i = 0; i < 4; i++) {
                ctx.rotate(pi / 2);

                ctx.beginPath();
                ctx.moveTo(size * 1.55, 0);
                ctx.lineTo(size * 1.3, size * 0.1);
                ctx.lineTo(size, size * 0.1);
                ctx.lineTo(size, -size * 0.1);
                ctx.lineTo(size * 1.3, -size * 0.1);
                ctx.closePath();

                ctx.fill();
                ctx.closePath();
            }
            ctx.restore();
        }

        // Sloped squares
        if (this.tier >= 3) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(pi / 6);
            
            ctx.fillRect(-size, -size, w, h);
            ctx.strokeRect(-size, -size, w, h);

            ctx.rotate(pi / 6);

            ctx.fillRect(-size, -size, w, h);
            ctx.strokeRect(-size, -size, w, h);

            ctx.restore();
        }
        else if (this.tier == 2) {
            ctx.save();
            ctx.translate();
            ctx.rotate(pi / 4);

            ctx.fillRect(-0.9 * size, -0.9 * size, 0.9 * w, 0.9 * h);
            ctx.strokeRect(-0.9 * size, -0.9 * size, 0.9 * w, 0.9 * h);

            ctx.restore();
        }

        // Basic body
        ctx.fillRect(x - size, y - size, w, h);
        ctx.strokeRect(x - size, y - size, w, h);

        // Dual boundary
        if (this.tier >= 1) {
            ctx.strokeRect(x - size + 3, y - size + 3, w - 6, h - 6);
        }

        // White gradient circle
        const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size);
        const period = this.castingActive ? fps : 3 * fps;
        const phase = globalTimer % period;
        const color = this.centerColor;

        rg.addColorStop(0, color);
        rg.addColorStop(sin(phase / period * pi) * 0.5, color);
        rg.addColorStop(1, toTransparent(color));

        ctx.beginPath();
        ctx.arc(x, y, size, 0, pi * 2);
        ctx.closePath();

        ctx.fillStyle = rg;
        ctx.fill();

        // Rotating snowflake
        if (this.tier >= 4) {
            // MEMO: This code used useless linear gradient.
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(phase * pi / period);

            for (let i = 0; i < 6; i++) {
                ctx.fillRect(0, -4, size * 0.85, 8);
                ctx.rotate(pi / 3);
            }

            ctx.restore();
        }
    }

    onRoundEnd() {
        this.activeCount = -1;
        super.onRoundEnd();
    }
}