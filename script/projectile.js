/* 
    projectile.js - 2023.10.24

    Implementation of projectiles and their interactions.
*/

let projId = 0;
const projs = new Map();

// Class representing projectiles.
class Projectile {
    constructor(position, velocity, prop, projStyle, onCollide, onExpire) {
        const property = prop.copy();

        this.id = projId++;
        this.position = position.copy();
        this.velocity = velocity.copy();
        this.targetType = property.targetType;
        this.targetEnemyId = property.targetEnemyId;
        this.pierce = property.pierce;
        this.size = property.size;
        this.lifetime = property.lifetime;
        this.attackType = property.attackType;
        this.camoDetection = property.camoDetection;

        this.extra = property.extra;

        this.projStyle = projStyle;
        this.onCollide = onCollide;
        this.onExpire = onExpire;
        this.created = globalGameTimer;
        this.expired = false;

        this.collidedEnemies = new Set();
    }

    // Updates projectile information, and check collision with enemies.
    update() {
        this.position.add(this.velocity);

        if (globalGameTimer - this.created >= this.lifetime) {
            this.expired = true;
            return;
        }

        if (this.targetType == "destinated" && this.extra.destination.distance(this.position) <= this.velocity.size()) {
            this.expired = true;
            return;
        }

        switch (this.targetType) {
            case "nontarget": {
                // nontarget type: projectiles with only direction set, not the target.
                for (const [eid, enemy] of enemies) {
                    if (enemy.expired) continue;

                    if (!this.collidedEnemies.has(eid) && this.position.distance(enemy.position) <= this.size + enemy.size) {
                        if (enemy.camouflaged && !this.camoDetection) continue;

                        if (enemy.isImmuneTo("projectile") || enemy.isImmuneTo(this.attackType)) {
                            this.expired = true;
                            break;
                        }

                        this.collidedEnemies.add(eid);
                        this.onCollide(enemy);

                        if (--this.pierce <= 0) this.expired = true;

                        break;
                    }
                }
                break;
            }
            case "target": {
                // target type: projectiles that set target, and interact only with that target.
                if (!enemies.has(this.targetEnemyId)) break;

                const enemy = enemies.get(this.targetEnemyId);

                if (this.position.distance(enemy.position) <= this.size + enemy.size) {
                    if (enemy.camouflaged && !this.camoDetection) {
                        this.expired = true;
                        break;
                    }

                    if (enemy.isImmuneTo("projectile") || enemy.isImmuneTo(this.attackType)) {
                        this.expired = true;
                        break;
                    }

                    this.onCollide(enemy);

                    if (--this.pierce <= 0) {
                        this.expired = true;
                    }
                }

                break;
            }
            case "destinated": {
                // destinated type: projectiles that set destination position.
                for (const [eid, enemy] of enemies) {
                    if (enemy.expired) continue;

                    if (!this.collidedEnemies.has(eid) && this.position.distance(enemy.position) <= this.size + enemy.size) {
                        if (enemy.camouflaged && !this.camoDetection) continue;

                        if (!(enemy.isImmuneTo("projectile") || enemy.isImmuneTo(this.attackType))) {
                            this.onCollide(enemy);
                        }

                        this.collidedEnemies.add(eid);

                        break;
                    }
                }

                break;
            }
            default: {
                console.error("Projectile.error(): Invalid projectile target type:", this.targetType);
                break;
            }
        }
    }

    // Draw projectils on the screen.
    draw() {
        const x = this.position.x;
        const y = this.position.y;
        const size = this.size;

        switch (this.projStyle.kind) {
            case "radial": {
                ctxd.beginPath();
                ctxd.arc(x, y, size, 0, pi * 2);
                ctxd.closePath();

                ctxd.fillStyle = this.projStyle.fillStyle;
                ctxd.fill();
                ctxd.stroke();

                break;
            }
            case "needle": {
                const xv = new Vector2(1, 0);
                let angle = xv.angle(this.velocity);

                if (this.velocity.y < 0) angle = pi * 2 - angle;

                const w = this.projStyle.width;
                const l = this.projStyle.length;

                ctxd.save();
                ctxd.translate(x, y);
                ctxd.rotate(angle);

                ctxd.fillStyle = this.projStyle.bodyFillStyle;
                ctxd.fillRect(-size, -w / 2, 2 * size, w);
                ctxd.strokeRect(-size, -w / 2, 2 * size, w);

                ctxd.beginPath();
                ctxd.moveTo(size, w / 2);
                ctxd.lineTo(size + w, 0);
                ctxd.lineTo(size, -w / 2);
                ctxd.closePath();

                ctxd.fillStyle = this.projStyle.tipFillStyle;
                ctxd.fill();
                ctxd.stroke();

                ctxd.restore();

                break;
            }
            case "poisoncloud": {
                const color = this.projStyle.color;
                const outer = toTransparent(color);

                ctxd.beginPath();
                ctxd.arc(x, y, 1.5 * size, 0, pi * 2);
                ctxd.closePath();

                const period = fps;
                const phase = (globalGameTimer - this.created) % period;
                const rg = ctxd.createRadialGradient(x, y, 1, x, y, 1.5 * size);

                rg.addColorStop(0, color);
                rg.addColorStop(0.6 + 0.1 * sin(pi * 2 * phase / period), color);
                rg.addColorStop(1, outer);

                ctxd.fillStyle = rg;
                ctxd.fill();

                break;
            }
            case "arcanebasic": {
                ctxd.beginPath();
                ctxd.arc(x, y, size, 0, pi * 2);
                ctxd.closePath();

                const outer = this.projStyle.outerFillStyle;
                const inner = this.projStyle.innerFillStyle;

                const period = fps;
                const phase = (globalGameTimer - this.created) % period;
                const rg = ctxd.createRadialGradient(x, y, 1, x, y, size);

                rg.addColorStop(0, inner);
                rg.addColorStop(0.7 + 0.1 * sin(pi * 2 * phase / period), inner);
                rg.addColorStop(1, outer);

                ctxd.fillStyle = rg;
                ctxd.fill();
                ctxd.stroke();
                break;
            }
            case "moneyactive": {
                const mainColor = this.projStyle.mainColor;
                const whiteColor = this.projStyle.whiteColor;
                const spikeColor = this.projStyle.spikeColor;
                const openAngle = pi / 24;

                ctxd.save();
                ctxd.translate(x, y);
                ctxd.beginPath();
                ctxd.arc(0, 0, size, 0, pi * 2);
                ctxd.closePath();

                ctxd.lineWidth = 3;
                ctxd.rotate((globalGameTimer - this.created) % (fps * 3) * pi * 2);

                const rg = ctxd.createRadialGradient(-size / 3, -size / 3, 1, 0, 0, size);
                rg.addColorStop(0, whiteColor);
                rg.addColorStop(0.5, whiteColor);
                rg.addColorStop(1, mainColor);

                ctxd.fillStyle = rg;
                ctxd.fill();
                ctxd.stroke();

                ctxd.beginPath();
                ctxd.arc(0, 0, size * 0.8, 0, pi * 2);
                ctxd.closePath();

                ctxd.stroke();

                drawTextAlignMiddle("G", new Vector2(0, 0), true, size, "rgb(0, 0, 0)", ctxd);
                
                ctxd.fillStyle = spikeColor;

                for (let i = 0; i < 4; i++) {
                    ctxd.rotate(pi / 2);
                    ctxd.beginPath();
                    ctxd.moveTo(size * 0.4, 0);
                    ctxd.lineTo(size * cos(openAngle), size * sin(openAngle));
                    ctxd.lineTo(size * 1.3, 0);
                    ctxd.lineTo(size * cos(openAngle), -size * sin(openAngle));
                    ctxd.closePath();

                    ctxd.fill();
                    ctxd.stroke();
                }

                ctxd.restore();

                break;
            }
        }
    }
}

// Helper class for projectile property.
class ProjectileProperty {
    constructor(targetType, targetEnemyId, pierce, size, lifetime, attackType, camoDetection, extra = null) {
        this.targetType = targetType;
        this.targetEnemyId = targetEnemyId;
        this.pierce = pierce;
        this.size = size;
        this.lifetime = lifetime;
        this.attackType = attackType;
        this.camoDetection = camoDetection;
        this.extra = extra;
    }

    copy() {
        return new ProjectileProperty(this.targetType, this.targetEnemyId, this.pierce, this.size, this.lifetime, this.attackType, this.camoDetection, this.extra);
    }
}

// Addes projectiles.
function addProjectiles(...ps) {
    for (const proj of ps) {
        projs.set(proj.id, proj);
    }
}

// Processes projectiles.
function processProjectiles() {
    for (const [pid, proj] of projs) {
        projs.update();

        if (proj.expired) {
            if (proj.onExpire != null) proj.onExpire(proj);

            projs.delete(pid);
        }
    }
}

// Draws projectiles.
function drawProjectiles() {
    for (const [pid, proj] of projs) {
        proj.draw();
    }
}