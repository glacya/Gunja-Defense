/*
    poison_tower.js - 2023.11.01

    Implementation of Venom Factory.
*/


class PoisonTower extends Tower {
    constructor(position) {
        super("poison", position);

        this.name = "맹독 제조기";
        this.baseDescription = "끔찍한 독을 바른 바늘을 쏩니다. 독에 걸린 적은 3초간 매 초 100의 피해를 입습니다.";
        this.upgradeName = ["스며드는 독", "치사량 투입", "폭발적 전염", "비가역 중독", "생물학 재해"];
        
        this.upgradeCost = [300, 650, 2200, 7500, 45000];
        this.upgradeDescription = [
            "독의 지속시간이 5초로 늘어나며, 공격 속도가 25% 빨라집니다.",
            "독의 초당 피해량이 150으로 늘어나며, 독에 걸린 적은 매 초 적 최대 HP의 5%(최대 250)의 피해를 추가로 입습니다. 또한 5번 공격할 때마다 독성 증기를 내뿜어 주변 적의 이동 속도를 30% 낮추고 독을 겁니다.",
            "독 바늘이 적중할 때와 독에 걸린 적이 처치될 때, 독 폭발을 일으켜 폭발 범위 내의 모든 적에게 100의 피해를 입히고 독을 겁니다. 또한 초당 피해량이 200으로 늘어나고, 독성 증기가 4번의 공격마다 방출되며 적중 시 100의 피해를 입힙니다.",
            "독에 걸린 적은 받는 치유 효과가 40% 감소합니다. 독의 초당 피해량이 300으로, 독 폭발 피해량이 200으로, 최대 HP 비례 피해가 매 초 10%(최대 1000)로 늘어나며, 공격 속도가 25% 빨라집니다. 또한 독성 증기가 3번의 공격마다 방출됩니다.",
            "극도로 강력한 독으로 무장합니다. 독 지속시간이 10초로, 초당 피해량이 1100으로, 독 폭발 피해량이 600으로, 최대 HP 비례 피해가 매 초 15%(최대 3000)로, 독성 증기의 피해량이 600으로, 치유 효과 감소량이 60%로 늘어납니다."
        ];

        this.activeName = ["맹독의 파도", "몰살의 파도"];
        this.activeDescription = [
            "마우스 방향으로 맹독이 농축된 구름을 발사하여 구름에 닿은 적들에게 500의 피해를 입히고 4초간 맹독을 겁니다. 맹독에 걸린 적은 매 초 최대 HP의 10%만큼의 피해를 입고 치유 효과가 60% 감소합니다. 맹독에 의해 HP가 20% 이하로 감소한 적은 즉시 처치됩니다. 보스 상대로는 피해량이 초당 3000까지 적용되며, 즉시 처치가 적용되지 않습니다.",
            "마우스 방향으로 극악의 독극물이 압축된 구름을 발사하여 구름에 닿은 적들에게 2000의 피해를 입히고 5초간 맹독을 겁니다. 맹독에 걸린 적은 매 초 최대 HP의 13%만큼의 피해를 입고 치유 효과가 80% 감소합니다. 맹독에 의해 HP가 40% 이하로 감소한 적은 즉시 처치됩니다. 보스 상대로는 피해량이 초당 15000까지 적용되며, 즉시 처치가 적용되지 않습니다."
        ];

        this.size = 24;
        this.totalCost = 300;
        
        this.pierce = 1;
        this.attackRange = 180;
        this.attackPeriod = fps * 5 / 6;
        this.duration = fps * 3;
        this.damagePeriod = fps / 2;
        this.damage = 100;
        this.hpDamageRatio = 0.0;
        this.hpDpsMax = 250;
        this.healReductionRatio = 1.0;
        this.slowRatio = 0.7;
        this.gunWidth = 6;
        this.gunLength = 28;

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
                this.attackPeriod = fps * 40 / 60;
                this.duration = 5 * fps;
                this.attackRange = 210;
                this.gunWidth = 7;
                this.gunLength = 32;
                break;
            }
            case 2: {
                this.damage = 150;
                this.steamCount = 0;
                this.hpDamageRatio = 0.05;
                this.hpDpsMax = 250;

                this.gunWidth = 8;
                this.gunLength = 36;

                break;
            }
            case 3: {
                this.attackRange = 240;
                this.damage = 200;
                this.steamCount = 0;
                this.steamRange = 160;

                this.healReductionRatio = 0.8;
                this.attackPerSteam = 4;
                break;
            }
            case 4: {
                this.steamRange = 170;
                this.steamCount = 0;
                this.attackPerSteam = 3;

                this.attackRange = 260;
                this.damage = 300;
                this.explosionDamage = 200;
                this.explosionRadius = 110;
                this.healReductionRatio = 0.6;
                this.attackPeriod = fps * 32 / 60;

                this.hpDamageRatio = 0.1;
                this.hpDpsMax = 1000;
                
                this.baseColor = "rgb(124, 44, 173)";
                this.poisonColor = "rgb(124, 44, 173)";
                this.gunColor = "rgb(40, 40, 40)";
                break;
            }
            case 5: {
                this.attackRange = 280;
                this.attackPeriod = fps * 25 / 60;
                this.explosionDamage = 600;
                this.explosionRadius = 130;
                this.duration = 10 * fps;
                this.damage = 1100;
                this.hpDamageRatio = 0.15;
                this.hpDpsMax = 3000;
                this.steamDamage = 600;
                this.steamRange = 180;

                this.healReductionRatio = 0.4;
                this.gunWidth = 10;
                this.gunLength = 40;
                this.activeDamage = 2000;
                this.activeExplosionRadius = 150;
                this.activeExplosionDamage = 900;
                this.activeExecutionRatio = 0.4;
                this.activeHealReductionRatio = 0.2;
                this.activeHpDamageRatio = 0.13;
                this.activeBossDpsMax = 15000;
                this.activeProjSize = 90;

                this.baseColor = "rgb(0, 0, 0)";
                this.waveColor = "rgba(126, 0, 194, 0.5)";
                this.borderColor = "rgb(95, 1, 146)";
                this.innerColor = "rgb(0, 0, 0)";
                this.lineColor = "rgb(126, 0, 194)";

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

            if (globalGameTimer - this.activeTimer < this.activeDelay) return true;

            this.removeStatusEffect("casting", thid.id);

            const onDeath = (e) => {
                const vse = new VisualEffect("radialout", this.badPoisonColor, fps * 2 / 5, e.position, {radius: this.activeExplosionRadius});
                addVisualEffects(vse);

                for (const [eid, enemy] of enemies) {
                    if (enemy.camouflaged && !this.hasCamoDetection()) continue;
                    if (enemy.isImmuneTo("poison")) continue;

                    if (eid != e.id && e.position.distance(enemy.position) <= this.activeExplosionRadius + enemy.size) {
                        let damage = -this.activeExplosionDamage * this.damageFactor;
                        if (enemy.isBoss) damage *= 2;
                        enemy.changeHp(damage, "poison", this.id);
                    }
                }
            };

            const onCollide = (e) => {
                const cs = new CorrosionStatus(this.activeDuration, this.activeHealReductionRatio, this.id);
                const ss = new StunStatus(this.activeDuration, this.id);
                const bps = new BadPoisonStatus(this.activeDuration, this.activeHpDamageRatio * this.damageFactor, fps / 4, this.activeBossDpsMax * this.damageFactor, this.activeExecutionRatio, {
                    fun: onDeath
                }, this.id);
            
                const mv = new VisualEffect("message", this.badPoisonColor, fps * 3 / 4, e.position, {message: "맹독", origin: e.id, size: e.size, fontSize: 20, floatDistance: 20, pop: false});
                addVisualEffects(mv);

                e.changeHp(-this.activeDamage * this.damageFactor, "poison", this.id);
                e.setStatusEffect(bps);
                e.setStatusEffect(cs);
                e.setStatusEffect(ss);
            };

            const prop = new ProjectileProperty("destinated", null, 1e18, this.activeProjSize, this.activeProjLifetime, "poison", this.hasCamoDetection(), {
                destination: vAdd(this.position, vScalarMul(dirVector, this.activeProjSpeed * this.activeProjLifetime))
            });

            const proj = new Projectile(vAdd(this.position, dirVector), vScalarMul(dirVector, this.activeProjSpeed), prop, { kind: "poisoncloud", color: this.badPoisonColor}, onCollide, null);
            addProjectiles(proj);

            return true;
        }

        if (!super.attack()) return false;

        const poisonStatus = 
            this.tier < 3
            ? new PoisonStatus(this.duration, this.damage * this.damageFactor, this.damagePeriod, this.hpDamageRatio * this.damageFactor, this.hpDpsMax * this.damageFactor, null, this.id)
            : new PoisonStatus(this.duration, this.damage * this.damageFactor, this.damagePeriod, this.hpDamageRatio * this.damageFactor, this.hpDpsMax * this.damageFactor, {
                fun: (e) => {
                    const ve = new VisualEffect("radialout", this.poisonColor, fps / 4, e.position, { radius: this.explosionRadius });
                    addVisualEffects(ve);

                    for (const [eid, enemy] of enemies) {
                        if ((enemy.camouflaged && !this.hasCamoDetection()) || enemy.isImmuneTo("poison")) continue;

                        if (eid != e.id && e.position.distance(enemy.position) <= this.explosionRadius + enemy.size) {
                            enemy.changeHp(-this.explosionDamage * this.damageFactor, "poison", this.id);

                            if (enemy.hp > 0) {
                                enemy.setStatusEffect(poisonStatus);

                                if (this.tier >= 4) {
                                    const cs = new CorrosionStatus(this.duration, this.healReductionRatio, this.id);
                                    enemy.setStatusEffect(cs);
                                }
                            }
                        }
                    }
                }
            }, this.id);

        const onCollide = (e) => {
            e.setStatusEffect(poisonStatus);

            if (this.tier >= 4) {
                const cs = new CorrosionStatus(this.duration, this.healReductionRatio, this.id);
                e.setStatusEffect(cs);

                const ve = new VisualEffect("radialout", this.poisonColor, fps / 4, e.position, { radius: this.explosionRadius });
                addVisualEffects(ve);

                for (const [eid, enemy] of enemies) {
                    if ((enemy.camouflaged && !this.hasCamoDetection()) || enemy.isImmuneTo("poison")) continue;

                    if (eid != e.id && e.position.distance(enemy.position) <= this.explosionRadius + enemy.size) {
                        enemy.changeHp(-this.explosionDamage * this.damageFactor, "poison", this.id);

                        if (enemy.hp > 0) {
                            enemy.setStatusEffect(poisonStatus);

                            if (this.tier >= 4) {
                                const cs2 = new CorrosionStatus(this.duration, this.healReductionRatio, this.id);
                                enemy.setStatusEffect(cs2);
                            }
                        }
                    }
                }
            }

            e.changeHp(-this.damage * this.damageFactor * this.damagePeriod / fps, "poison", this.id);
        };

        // Ignore already poisoned enemies.
        const leadId = pickTarget(this, (x) => x.poisoned, []);

        if (leadId == null) return false;

        const targetEnemy = enemies.get(leadId);

        let dirVector = computePredictedDirection(this.position, targetEnemy, this.projSpeed, this.attackRange * this.rangeFactor);
        let velocityVector = vScalarMul(dirVector, this.projSpeed);
        this.lastDirection = dirVector.copy();

        dirVector.multiply(this.size);

        const projStyle = {
            kind: "needle",
            width: this.projWidth,
            length: this.projLength,
            bodyFillStyle: "rgb(20, 20, 20)",
            tipFillStyle: "rgb(133, 71, 226)"
        };

        const property = new ProjectileProperty("target", leadId, this.pierce, this.projSize, this.projLifetime, "poison", this.hasCamoDetection());
        const proj = new Projectile(vAdd(this.position, dirVector), velocityVector, property, projStyle, onCollide, null);
        addProjectiles(proj);

        // Venom steam
        if (this.tier >= 2 && this.steamCount++ % this.attackPerSteam == this.attackPerSteam - 1) {
            const v1 = new VisualEffect("growout", this.poisonColor, fps, this.position, {radius: this.steamRange * this.rangeFactor});
            const v2 = new VisualEffect("radialout", this.poisonColor, fps, this.position, {radius: this.steamRange * this.rangeFactor});
            addVisualEffects(v1, v2);

            const slowStatus = new SlowStatus(this.duration, this.slowRatio, this.id);

            for (const [eid, enemy] of enemies) {
                if (this.position.distance(enemy.position) <= this.steamRange * this.rangeFactor + enemy.size) {
                    enemy.changeHp(-this.steamDamage * this.damageFactor, "poison", this.id);
                    enemy.setStatusEffect(slowStatus);
                    enemy.setStatusEffect(poisonStatus);
                }
            }
        }

        return true;
    }

    active() {
        if (!super.active()) return false;

        const dve = new VisualEffect("darken", null, fps / 2, null, null);
        addVisualEffects(dve);

        const cs = new CastingStatus(10 * fps, this.id);
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
            ctx.arc(x, y, size * 13 / 8, 0, pi * 2);
            ctx.closePath();

            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 13 / 8);
            rg.addColorStop(1, toTransparent(this.poisonColor));
            rg.addColorStop(0.3, this.poisonColor);
            rg.addColorStop(0, this.poisonColor);

            ctx.fillStyle = rg;
            ctx.fill();
        }

        // Spikes
        if (this.tier >= 3) {
            ctx.save();
            ctx.translate(x, y);

            ctx.fillStyle = this.borderColor;
            const path = new Path2D();
            let triSize = 9 + (this.tier - 3) * 3;

            path.moveTo(size, -triSize / 2);
            path.lineTo(triSize * sqrt(3) / 2 + size, 0);
            path.lineTo(size, triSize / 2);
            path.closePath();

            const path2 = new Path2D();
            triSize -= 3;

            path2.moveTo(size, -triSize / 2);
            path2.lineTo(triSize * sqrt(3) / 2 + size, 0);
            path2.lineTo(size, triSize / 2);
            path2.closePath();

            for (let i = 0; i < 6; i++) {
                ctx.fill(path);
                ctx.stroke(path);
                ctx.rotate(pi / 3);
            }

            ctx.rotate(pi / 6);
            for (let i = 0; i < 6; i++) {
                ctx.fill(path2);
                ctx.stroke(path2);
                ctx.rotate(pi / 3);
            }
            ctx.restore();
        }

        // Border
        if (this.tier >= 2) {
            ctx.beginPath();
            ctx.arc(x, y, size * 1.2, 0, pi * 2);
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

        // Hexagonal lines
        if (this.tier >= 4) {
            ctx.save();
            ctx.translate(x, y);
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.lineColor;
            
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(size, 0);
                ctx.closePath();
                ctx.stroke();

                ctx.rotate(pi / 3);
            }

            ctx.restore();
        }

        // Center circle
        if (this.tier >= 1) {
            ctx.beginPath();
            ctx.arc(x, y, 9, 0, pi * 2);
            ctx.closePath();

            ctx.strokeStyle = this.lineColor;
            ctx.fillStyle = this.innerColor;
            ctx.fill();
            ctx.stroke();

            ctx.strokeStyle = "rgb(0, 0, 0)";
        }

        // Radial wave effect
        const p = floor(fps * 67 / 60);
        const phase = globalTimer % p;

        if (this.tier >= 2) {
            const pr = (p - phase - 1) / p;
            const rg = ctx.createRadialGradient(x, y, size / 2, x, y, size * 2);
            const color = this.waveColor;
            const clear = toTransparent(color);

            rg.addColorStop(0, clear);
            rg.addColorStop(pr * 0.6, clear);
            rg.addColorStop(pr, color);
            rg.addColorStop(min(1, pr * 1.4), clear);
            rg.addColorStop(1, clear);

            ctx.beginPath();
            ctx.arc(x, y, size, 0, pi * 2);
            ctx.closePath();

            ctx.fillStyle = rg;
            ctx.fill();
        }

        // Cannon.
        const xv = new Vector2(1, 0);
        let angle = xv.angle(this.lastDirection);
        if (this.lastDirection.y <= 0) {
            angle = pi * 2 - angle;
        }

        const w = this.gunWidth;
        const l = this.gunLength;

        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = this.gunColor;
        ctx.rotate(angle);
        ctx.fillRect(0, -w / 2, l, w);
        ctx.strokeRect(0, -w / 2, l, w);

        ctx.restore();
    }

    onRoundEnd() {
        // This function seems to do nothing..
        // But, this prevents the system from calling its "super" version, thus maintaining casting status.
        // It essentially prevents the user's active ability call became nothing.
    }
}