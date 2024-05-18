/*
    support_tower.js - 2024.02.10

    Implementation of Combat Force Base.
*/

class SupportTower extends Tower {
    constructor(position) {
        super("support", position);

        this.name = "전투 지원 기지"; 
        this.baseDescription = "주변 타워들을 강화하는 기지입니다. 사거리 내의 다른 타워들의 사거리를 10% 늘립니다.";
        this.upgradeName = ["부품 최적화", "열감지 카메라", "전투 기술 분석", "감정 조장", "백전불태"];
        this.upgradeCost = [1100, 1500, 2300, 7500, 45000];
        this.upgradeDescription = [
            "사거리 내의 타워들의 업그레이드 비용이 10% 감소합니다.",
            "사거리 내의 타워들이 은신한 적을 공격할 수 있게 되며, 공격 속도가 10% 빨라집니다.",
            "사거리 내의 타워들의 공격 가능한 적의 수가 1 늘어나며, 보스 상대로 10%의 추가 피해를 입히게 됩니다.",
            "사거리 내의 타워들의 피해량이 20% 늘어나고, 업그레이드 비용 감소가 20%로 늘어납니다.",
            "막대한 지원의 힘입니다! 사거리 증가 비율이 20%로, 공격 속도 증가량이 25%로, 피해량 상승 비율이 50%로, 보스 대상 추가 피해가 15%로 늘어납니다."
        ];
        this.activeName = ["반격 태세", "반격 총공세"];
        this.activeDescription = [
            "모든 타워들의 공격 속도를 4초간 30% 상승시키고, 2초간 유지되는 미지의 방패를 3 부여하여 해로운 상태 이상을 3회 막습니다. 또한, 모든 적들의 이로운 상태 이상을 모두 제거하고 보호막의 50%를 없앤 뒤 300의 피해를 입힙니다.",
            "모든 타워들의 공격 속도를 6초간 30% 상승시키고, 4초간 유지되는 미지의 방패를 5 부여하여 해로운 상태 이상을 5회 막습니다. 또한, 모든 적들의 이로운 상태 이상을 모두 제거하고 보호막의 70%를 없앤 뒤 1500의 피해를 입힙니다.",
        ];
        
        this.size = 42;
        this.totalCost = 850;

        this.attackRange = 200;
        this.attackPeriod = 1e18;

        this.pierceValue = 1;
        this.attackSpeedBoostRatio = 1.1;
        this.damageBoostRatio = 1.2;
        this.discountRatio = 1.0;
        this.rangeBoostRatio = 1.1;
        this.bossKillRatio = 1.1;

        this.activePeriod = 15 * fps;
        this.activeASBoostRatio = 1.3;
        this.activeASBoostDuration = 4 * fps;
        this.activeShieldDuration = 2 * fps;
        this.activeShieldCount = 3;
        this.activeDamage = 300;
        this.activeReduceRatio = 0.5;
       
        this.baseColors = ["rgb(255, 127, 255)", "rgb(255, 63, 127)", "rgb(196, 0, 122)"];
        this.triColor = "rgb(255, 63, 127)";
        this.circleColor = "rgb(255, 100, 200)";
        this.spikeColor = "rgb(255, 204, 236)";
    }

    sell(ratio) {
        if (!super.sell(ratio)) return false;

        for (const [tid, tower] of towers) {
            tower.removeStatusEffect("all", this.id);
        }

        return true;
    }

    upgrade() {
        if (!super.upgrade()) return false;

        switch (this.tier) {
            case 1: {
                // Discount buff
                this.discountRatio = 0.9;
                const dcStatus = new DiscountStatus(1e18, this.discountRatio, this.id);
                for (const [tid, tower] of towers) {
                    if (tid == this.id || this.position.distance(tower.position) > this.attackRange * this.rangeFactor + tower.size) continue;

                    tower.setStatusEffect(dcStatus);
                    tower.costFactor = min(tower.costFactor, this.discountRatio);
                }
                break;
            }
            case 2: {
                // Detect, attack speed boost

                this.attackRange = 215;
                const detectStatus = new DetectStatus(this.id);
                const asStatus = new AttackSpeedBoostStatus(1e18, this.attackSpeedBoostRatio, this.id);

                for (const [tid, tower] of towers) {
                    if (tid == this.id || this.position.distance(tower.position) > this.attackRange * this.rangeFactor + tower.size) continue;

                    tower.setStatusEffect(detectStatus);
                    tower.setStatusEffect(asStatus);
                }
                break;
            }
            case 3: {
                this.attackRange = 230;
                const pbStatus = new PierceBoostStatus(1e18, this.pierceValue, this.id);
                const bkStatus = new BossKillStatus(1e18, this.bossKillRatio, this.id);

                for (const [tid, tower] of towers) {
                    if (tid == this.id || this.position.distance(tower.position) > this.attackRange * this.rangeFactor + tower.size) continue;

                    tower.setStatusEffect(pbStatus);
                    tower.setStatusEffect(bkStatus);
                }
                break;
            }
            case 4: {
                this.attackRange = 245;
                this.discountRatio = 0.8;
                const dcStatus = new DiscountStatus(1e18, this.discountRatio, this.id);
                const dmgStatus = new DamageBoostStatus(1e18, this.damageBoostRatio, this.id);
                for (const [tid, tower] of towers) {
                    if (tid == this.id || this.position.distance(tower.position) > this.attackRange * this.rangeFactor + tower.size) continue;

                    tower.setStatusEffect(dcStatus);
                    tower.setStatusEffect(dmgStatus);
                    tower.costFactor = min(tower.costFactor, this.discountRatio);
                }

                this.baseColors = ["rgb(196, 0, 122)", "rgb(255, 63, 127)", "rgb(255, 127, 255)"];
                this.triColor = "rgb(254, 129, 157)";

                break;
            }
            case 5: {
                this.attackRange = 260;
                this.attackSpeedBoostRatio = 1.25;
                this.damageBoostRatio = 1.5;
                this.rangeBoostRatio = 1.2;
                this.bossKillRatio = 1.15;

                this.activeASBoostDuration = 6 * fps;
                this.activeASBoostRatio = 1.8;
                this.activeShieldCount = 5;
                this.activeShieldDuration = 4 * fps;
                this.activeDamage = 1500;
                this.activeReduceRatio = 0.3;

                this.baseColors = ["rgb(196, 0, 122)", "rgb(150, 0, 65)", "rgb(60, 0, 60)"];
                this.triColor = "rgb(255, 255, 255)";
                this.circleColor = "rgb(117, 0, 62)";

                const asStatus = new AttackSpeedBoostStatus(1e18, this.attackSpeedBoostRatio, this.id);
                const dmgStatus = new DamageBoostStatus(1e18, this.damageBoostRatio, this.id);
                const rangeStatus = new RangeBoostStatus(1e18, this.rangeBoostRatio, this.id);
                const bkStatus = new BossKillStatus(1e18, this.bossKillRatio, this.id);
                
                for (const [tid, tower] of towers) {
                    if (tid == this.id || this.position.distance(tower.position) > this.attackRange * this.rangeFactor + tower.size) continue;

                    tower.setStatusEffect(rangeStatus);
                    tower.setStatusEffect(dmgStatus);
                    tower.setStatusEffect(asStatus);
                    tower.setStatusEffect(bkStatus);
                    tower.costFactor = min(tower.costFactor, this.discountRatio);
                }

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
        return false;
    }

    active() {
        if (!super.active()) return false;

        const md = {message: this.tier == 4 ? "반격 태세" : "반격 총공세", origin: this.id, size: this.size, fontSize: 22, floatDistance: 38, pop: true};
        const mv = new VisualEffect("message", "rgb(255, 0, 255)", fps, this.position, md);
        const hv = new VisualEffect("growout", "rgba(255, 0, 127, 0.2)", fps / 2, this.position, {radius: 3000});
        
        addVisualEffects(mv, hv);

        for (const [tid, tower] of towers) {
            const msStatus = new MysteryShieldStatus(this.activeShieldDuration, this.activeShieldCount, this.id);
            const asStatus = new AttackSpeedBoostStatus(this.activeASBoostDuration, this.activeASBoostRatio, this.id);

            tower.setStatusEffect(msStatus);
            tower.setStatusEffect(asStatus);

            const md = {message: "!!", origin: tower.id, size: tower.size, fontSize: 16, floatDistance: 28, pop: false};
            const mv = new VisualEffect("message", "rgb(255, 0, 255)", fps / 2, tower.position, md);
            addVisualEffects(mv);
        }

        for (const [eid, enemy] of enemies) {
            if (this.betrayed) {
                enemy.shield = floor(enemy.shield * (2 - this.activeReduceRatio));

                const md = {message: "배반: 보호막 증가", origin: eid, size: enemy.size, fontSize: 14, floatDistance: 28, pop: false};
                const mv = new VisualEffect("message", "rgb(255, 0, 128)", fps / 2, enemy.position, md);
                addVisualEffects(mv);
            }
            else {
                enemy.removeStatusEffect("positive", null);

                if (!enemy.invincible)
                    enemy.shield = floor(enemy.shield * this.activeReduceRatio);

                const md = {message: "이로운 효과 제거", origin: eid, size: enemy.size, fontSize: 14, floatDistance: 28, pop: false};
                const mv = new VisualEffect("message", "rgb(255, 0, 128)", fps / 2, enemy.position, md);
                addVisualEffects(mv);
            }

            enemy.changeHp(-this.activeDamage * this.damageFactor, "none", this.id);
        }
    }

    draw(ctx) {
        super.draw();

        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        ctx.save();
        ctx.translate(x, y);

        if (this.tier >= 5) {
            ctx.beginPath();
            ctx.arc(0, 0, size * 1.2, 0, pi * 2);
            ctx.closePath();

            const rg = ctx.createRadialGradient(0, 0, size / 2, 0, 0, size * 1.2);
            rg.addColorStop(1, "rgba(255, 127, 255, 0)");
            rg.addColorStop(0.5, "rgb(255, 127, 255)");
            rg.addColorStop(0, "rgb(255, 127, 255)");

            ctx.fillStyle = rg;
            ctx.fill();
        }

        ctx.rotate(pi / 6);

        if (this.tier >= 2) {
            const period = this.tier >= 4 ? 8 * fps : 16 * fps;
            const phase = globalTimer % period / period;

            const alp = this.tier >= 4 ? 2 * fps : 4 * fps;
            const alphase = globalTimer % alp / alp;

            ctx.rotate(phase * pi * 2);
            ctx.fillStyle = toAlpha(this.circleColor, 0.35 + 0.2 * sin(alphase * pi * 2));

            const sps = 10;
            for (let i = 0; i < 6; i++) {
                ctx.rotate(pi / 3);
                ctx.beginPath();
                ctx.arc(size * (0.9 + 0.05 * setInterval(alphase * pi * 2)), 0, sps, 0, pi * 2);
                ctx.closePath();

                ctx.fill();
            }

            ctx.rotate(-phase * pi * 2);
        }

        for (let step = 0; step < 3; step++) {
            ctx.beginPath();
            ctx.moveTo(size * (1 - step * 0.2), 0);
            for (let i = 0; i < 6; i++) {
                ctx.rotate(pi / 3);
                ctx.lineTo(size * (1 - step * 0.2), 0);
            }
            ctx.closePath();

            ctx.fillStyle = this.baseColors[step];
            ctx.fill();
            ctx.stroke();
        }

        if (this.tier >= 3) {
            const w = 5;
            const l = 21;
            for (let i = 0; i < 6; i++) {
                ctx.rotate(pi / 3);
                ctx.beginPath();
                ctx.moveTo(size, 0);
                ctx.lineTo(size - w / sqrt(3), w);
                ctx.lineTo(size - l, 0);
                ctx.lineTo(size - w / sqrt(3), -w);
                ctx.closePath();

                ctx.fillStyle = this.spikeColor;
                ctx.fill();
                ctx.stroke();
            }
        }

        ctx.rotate(-pi / 6);

        if (this.tier >= 1) {
            ctx.rotate(-pi / 6);
            
            const tris = size * 0.3;
            const tops = size * 0.35;

            const period = 3 * fps;
            const phase = globalTimer % period / period;
            ctx.beginPath();
            ctx.arc(0, 0, size * (0.25 + 0.1 * cos(phase * pi * 2)), 0, pi * 2);
            ctx.closePath();

            ctx.fillStyle = toAlpha("rgb(255, 255, 255)", 0.2 + 0.1 * cos(phase * pi * 2));
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(tris, 0);

            for (let i = 0; i < 3; i++) {
                ctx.rotate(pi * 2 / 3);
                ctx.lineTo(tris, 0);
            }

            ctx.closePath();
            ctx.fillStyle = this.triColor;
            ctx.fill();
            ctx.stroke();

            ctx.rotate(-pi / 3);

            for (let i = 0; i < 3; i++) {
                ctx.rotate(pi * 2 / 3);
                ctx.beginPath();

                ctx.moveTo(tops, 0);
                ctx.lineTo(tris / 2, tris / 4);
                ctx.lineTo(tris / 2, -tris / 4);

                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            ctx.rotate(pi / 2);
        }
        ctx.restore();
    }
}