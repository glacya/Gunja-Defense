/* 
    visual_effect.js - 2023.11.10

    Implementations of various visual effects used in the game.
*/

const visualEffects = new Map();
let vseId = 0;

let darkenAlpha = 0.0;
let grandAlpha = 0.0;
let isBlizzardOn = false;
let isBlizzardTier5 = false;

const portals = new Map();
let portalId = 0;

const betrayalMarks = new Map();
let markId = 0;

// Class representing visual effects.
// It is spammed with switch case clauses.. may rewrite thie with parent-child design.
class VisualEffect {
    constructor(kind, style, duration, position, detail = null) {
        this.id = vseId++;
        this.kind = kind;
        this.style = style;
        this.duration = duration;
        this.position = position;
        this.detail = detail;
        
        this.beginTimer = globalTimer;
        this.expired = false;
    }

    // Checks if the effect is expired.
    update() {
        if (globalTimer - this.beginTimer >= this.duration) {
            this.expired = true;
        }
    }

    // Draws, and processes visual effect.
    // Note that this method is very dirty; processing its values and drawing is not seperated; and it is a large spam of switch cases.
    // May migrate to inheritance structure later.
    draw() {
        if (this.expired) return;

        const x = this.position.x;
        const y = this.position.y;
        const prog = globalTimer - this.beginTimer;
        const p = prog / this.duration;

        switch (this.kind) {
            case "darken": {
                // Darken effect: darken the world.
                // Here, the code sets the alpha of the darkness, and the actual drawing is done in drawVisualEffect() function.
                // This is to prevent multiple darken effects overlap and make the screen too dark than they should.
                const baseAlpha = 0.8;
                let darkAlpha = baseAlpha;

                const fadeInTime = fps / 4;
                const fadeOutTime = fps / 6;

                if (prog < fadeInTime) {
                    darkAlpha = min(darkAlpha, baseAlpha * prog / fadeInTime);
                }

                if (this.duration - prog < fadeOutTime) {
                    darkAlpha = min(darkAlpha, baseAlpha * (this.druation - prog) / fadeOutTime);
                }

                darkenAlpha = max(darkenAlpha, darkAlpha);

                break;
            }
            case "growout": {
                const size = this.detail.radius * (0,3 + 0.7 * p);
                ctxd.beginPath();
                ctxd.arc(x, y, size, 0, pi * 2);
                ctxd.closePath();

                const color = toAlpha(this.style, (1 - p) * 0.4);
                ctxd.fillStyle = color;
                ctxd.fill();

                break;
            }
            case "radialout": {
                const size = this.detail.radius;

                ctxd.beginPath();
                ctxd.arc(x, y, size, 0, pi * 2);
                ctxd.closePath();

                const rg = ctxd.createRadialGradient(x, y, 10, x, y, size * 1.5);
                const clear = toTransparent(this.style);
                rg.addColorStop(0, clear);
                rg.addColorStop(max(0, p - 0.2), clear);
                rg.addColorStop(min(1, p), this.style);
                rg.addColorStop(min(1, p + 0.2), clear);
                rg.addColorStop(1, clear);

                ctxd.fillStyle = rg;
                ctxd.fill();

                break;
            }
            case "radialin": {
                const size = this.detail.radius;

                ctxd.beginPath();
                ctxd.arc(x, y, size, 0, pi * 2);
                ctxd.closePath();

                let p1 = 1 - p;

                const rg = ctxd.createRadialGradient(x, y, 10, x, y, size * 1.5);
                const clear = toTransparent(this.style);
                rg.addColorStop(0, clear);
                rg.addColorStop(fitInterval(p1 - 0.2, 0, 1), clear);
                rg.addColorStop(fitInterval(p1, 0, 1), this.style);
                rg.addColorStop(fitInterval(p1 + 0.2, 0, 1), clear);
                rg.addColorStop(1, clear);

                ctxd.fillStyle = rg;
                ctxd.fill();

                break;
            }
            case "explodeout": {
                const size = this.detail.radius;

                ctxd.beginPath();
                ctxd.arc(x, y, size, 0, pi * 2);
                ctxd.closePath();

                const timeLeft = this.duration - prog;
                const lp = timeLeft / this.duration * 2;
                const rg = ctxd.createRadialGradient(x, y, 10, x, y, size);
                const clear = toTransparent(this.style);

                if (lp < 1.0) {
                    rg.addColorStop(0, clear);
                    rg.addColorStop(min(1, 1 - lp), clear);
                    rg.addColorStop(1, this.style);
                }
                else {
                    rg.addColorStop(1, clear);
                    rg.addColorStop(min(1, 2 - lp), clear);
                    rg.addColorStop(0, this.style);
                }

                ctxd.fillStyle = rg;
                ctxd.fill();

                break;
            }
            case "blizzard": {
                // Similar to Darken effect, this section sets values only, and actual drawing is done in drawVisualEffects() function.
                isBlizzardOn = true;

                if (this.detail.t5) isBlizzardTier5 = true;
                break;
            }
            case "laser": {
                const sp = this.position;
                const ep = this.detail.endPosition;
                let pv = vSub(ep, sp);
                pv = pv.rotate(pi / 2);
                pv.normalize();

                const mp = vScalarMul(vAdd(sp, ep), 0.5);

                ctxd.beginPath();
                ctxd.moveTo(sp.x, sp.y);
                ctxd.lineTo(ep.x, ep.y);

                const lw = this.detail.laserWidth;
                const alpha = 0.8 * sqrt(max(0, cos(p * pi / 2)));
                const lg = ctxd.createLinearGradient(mp.x - pv.x * lw / 2, mp.y - pv.y * lw / 2, mp.x + pv.x * lw / 2, mp.y + pv.y * lw / 2);
                const color = toAlpha(this.style, alpha);

                lg.addColorStop(0, color);
                lg.addColorStop(0.15, color);
                lg.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
                lg.addColorStop(0.85, color);
                lg.addColorStop(1, color);

                ctxd.save();
                ctxd.strokeStyle = linGrad;
                ctxd.lineWidth = lw;
                ctxd.stroke();
                ctxd.restore();

                break;
            }
            case "laserend": {
                const radius = this.detail.radius;

                const alpha = 0.8 * sqrt(max(0, cos(p * pi / 2)));
                const rg = ctxd.createRadialGradient(x, y, 1, x, y, radius);
                const color = toAlpha(this.style, alpha);

                rg.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                rg.addColorStop(1, color);

                ctxd.beginPath();
                ctxd.arc(x, y, radius, 0, pi * 2);
                ctxd.closePath();

                ctxd.fillStyle = rg;
                ctxd.fill();

                break;
            }
            case "laseractive": {
                if (prog < this.detail.readyTime) break;

                const origin = this.detail.towerId;

                if (!towers.has(origin)) {
                    this.expired = true;
                    break;
                }

                const w = this.detail.width;
                const marg = this.detail.margin;
                const dir = vSub(mousePosition, this.position);
                dir.normalize();

                const l = winX * 2;
                const pos = vAdd(this.position, vScalarMul(dir, marg));
                const rv = new Vector2(1, 0);

                let angle = rv.angle(dir);

                if (dir.y < 0) angle = pi * 2 - angle;

                ctxd.save();
                ctxd.translate(pos.x, pos.y);
                ctxd.rotate(angle);

                ctxd.beginPath();
                ctxd.ellipse(margin + width * 3 / 4, 0, width * 3 / 4, width / 2, 0, pi / 2, pi * 3 / 2);
                ctxd.lineTo(l, -w / 2);
                ctxd.lineTo(l, -w / 2);
                ctxd.closePath();

                const period = fps * 47 / 60;
                const lp = globalTimer / period * pi * 2;
                const lightColor = "rgb(240, 255, 240)";

                const lg = ctxd.createLinearGradient(0, -w, 0, w);
                lg.addColorStop(0, this.style);
                lg.addColorStop(0.25 - 0.1 * sin(lp), this.style);
                lg.addColorStop(0.5, lightColor);
                lg.addColorStop(0.75 + 0.1 * sin(lp), this.style);
                lg.addColorStop(1, this.style);

                ctxd.fillStyle = lg;
                ctxd.fill();

                ctxd.restore();

                break;
            }
            case "wavebasic": {
                // Arc version of 'growout' visual effect.
                const angleW = this.detail.angleWidth;
                const baseAngle = this.detail.baseAngle;
                const size = this.detail.radius;

                ctxd.beginPath();
                ctxd.arc(x, y, size, baseAngle - angleWidth / 2, baseAngle + angleWidth / 2);
                ctxd.lineTo(x, y);
                ctxd.closePath();

                const rg = ctxd.createRadialGradient(x, y, 10, x, y, size * 1.5);
                const clear = toTransparent(this.style);

                rg.addColorStop(0, clear);
                rg.addColorStop(max(0, p - 0.2), clear);
                rg.addColorStop(p, this.style);
                rg.addColorStop(min(1, p + 0.2), clear);
                rg.addColorStop(1, clear);

                ctxd.fillStyle = rg;
                ctxd.fill();

                break;
            }
            case "bossspawn": {
                bossAlpha = fitInterval(p, 0, 1);
                break;
            }
            case "bossdead": {
                bossAlpha = fitInterval(1 - p, 0, 1);
                break;
            }
            case "message": {
                const message = this.detail.message;
                const origin = this.detail.origin;
                const size = this.detail.size;
                const alpha = p > 0.5 ? (1 - p) * 2 : 1;
                const floatDistance = this.detail.floatDistance;
                const fontPopTime = fps / 3;

                const defaultFont = this.detail.fontSize;
                const fontSize = (!this.detail.pop) ? defaultFont : (prog < fontPopTime ? ((2 * fontPopTime - prog) / fontPopTime) * defaultFont : defaultFont);

                if (enemies.has(origin)) this.position = enemies.get(origin).position;

                const position = this.position.copy();

                if (this.detail.yOffset != undefined) {
                    position.y -= this.detail.yOffset;
                }

                drawTextAlignMiddle(message, new Vector2(position.x, position.y - portion * floatDistance - size * 1.4), true, fontSize, toAlpha(this.style, alpha), ctxdh);

                break;
            }
            case "portalopen": {
                const pid = this.detail.id;
                const alpha = fitInterval(prog / (this.duration - 1), 0, 1);
                const portal = portals.get(pid);

                if (portal) portal.alpha = alpha;

                break;
            }
            case "portalclose": {
                const pid = this.detail.id;
                const alpha = 1 - fitInterval(prog / (this.duration - 1), 0, 1);
                const portal = portals.get(pid);

                if (portal) portal.alpha = alpha;

                break;
            }
            case "soultrace": {
                const period = 2 * fps;
                const sz = 30;

                ctxd.save();
                ctxd.translate(x, y);
                ctxd.beginPath();
                ctxd.arc(0, 0, sz, 0, pi * 2);
                ctxd.closePath();

                const rg = ctxd.createRadialGradient(0, 0, 1, 0, 0, sz);
                const trcol = toTransparent(this.style);
                rg.addColorStop(0, this.style);
                rg.addColorStop(0.7 + 0.2 * sin(prog / period * pi * 2), trcol);
                rg.addColorStop(1, trcol);

                ctxd.fillStyle = rg;
                ctxd.fill();
                ctxd.restore();

                break;
            }
            case "grandenter": {
                grandAlpha = fitInterval(1 - p, 0, 1);
                break;
            }
            case "markready": {
                const mid = this.detail.id;
                const alpha = fitInterval(p / (this.duration - 1), 0, 1);
                const mark = betrayalMarks.get(mid);

                if (mark) mark.alpha = alpha;

                break;
            }
            case "markshutdown": {
                const mid = this.detail.id;
                const alpha = 1 - fitInterval(p / (this.duration - 1), 0, 1);
                const mark = betrayalMarks.get(mid);

                if (mark) {
                    mark.alpha = alpha;
                    mark.sizeRatio = alpha;
                }

                break;
            }
            case "menuenter": {
                menuEnterAlpha = fitInterval(p, 0, 1);
                break;
            }
            case "gamestart": {
                menuAlpha = fitInterval(1 - p, 0, 1);
                break;
            }
            case "gameend": {
                menuAlpha = fitInterval(p, 0, 1);
                break;
            }
            default: {
                console.error("VisualEffect.draw(): Invalid visual effect kind:", this.kind);
                this.expired = true;
                break;
            }
        }
    }
}

// Auxiliary class to represent portal views.
class Portal {
    constructor(pos, width, height, innerColor, midColor, outerColor, delay, period, origin) {
        this.id = portalId++;
        this.position = pos;
        this.width = width;
        this.height = height;
        this.innerColor = innerColor;
        this.midColor = midColor;
        this.outerColor = outerColor;
        this.delay = delay;
        this.alpha = 0;
        this.phase = 0;
        this.period = period;
        this.origin = origin;

        this.expired = false;
    }

    update() {
        this.phase++;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        const angle = (0.75 + 0.25 * this.alpha) * pi * 2;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width, this.height, angle, 0, pi * 2);
        ctx.closePath();

        const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, max(this.width, this.height));
        rg.addColorStop(0, this.innerColor);
        rg.addColorStop(0.75 + 0.15 * sin(this.phase / this.period * pi * 2), this.midColor);
        rg.addColorStop(1, this.outerColor);

        ctx.fillStyle = rg;
        ctx.fill();

        ctx.restore();
    }
}

// Auxiliary class to represent mark effects.
class BetrayalMark {
    constructor(pos, period, size, origin) {
        this.id = markId++;
        this.position = pos.copy();
        this.phase = 0;
        this.period = period;
        this.size = size;
        this.origin = origin;
        this.alpha = 0;
        this.sizeRatio = 1;
        this.expired = false;
    }

    update() {
        this.phase++;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        const size = this.size * this.sizeRatio;

        ctx.beginPath();
        ctx.arc(0, 0, size, 0, pi * 2);
        ctx.closePath();

        const rg = ctx.createRadialGradient(0, 0, 1, 0, 0, size);
        rg.addColorStop(0, "rgba(0, 0, 0, 0)");
        rg.addColorStop(0.75, "rgba(0, 0, 0, 0)");
        rg.addColorStop(0.82, "rgba(0, 0, 0)");
        rg.addColorStop(0.85, `rgba(0, 0, 0, ${this.alpha})`);
        rg.addColorStop(0.88, "rgba(0, 0, 0)");
        rg.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = rg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, size * 0.85, 0, pi * 2);
        ctx.closePath();

        ctx.save();
        ctx.strokeStyle = `rgb(255, 0, 0, ${this.alpha})`;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();

        const angle = (this.phase / this.period) * pi * 2;
        ctx.rotate(angle);

        ctx.fillStyle = `rgb(255, 0, 0, ${this.alpha})`;
        ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(size * 0.55, 0);
            ctx.lineTo(size * 0.85, size * 0.1);
            ctx.lineTo(size * 1.15, 0);
            ctx.lineTo(size * 0.85, -size * 0.1);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();

            ctx.rotate(pi / 2);
        }

        ctx.restore();
    }
}

// Process visual effects, portals, and marks.
function processVisualEffects() {
    darkenAlpha = 0.0;
    isBlizzardOn = false;
    isBlizzardTier5 = false;

    for (const [vid, vse] of visualEffects) {
        vse.update();

        if (vse.expired) {
            switch (vse.kind) {
                case "bossdead": {
                    bossEnemyId = null;
                    break;
                }
                case "gamestart": {
                    menuAlpha = 0;
                    break;
                }
                case "grandenter": {
                    grandAlpha = 0;
                    break;
                }
            }

            visualEffects.delete(vid);
        }
    }

    for (const [pid, portal] of portals) {
        portal.update();

        if (portal.expired) portals.delete(pid);
    }

    for (const [mid, mark] of betrayalMarks) {
        mark.update();

        if (mark.expired) betrayalMarks.delete(mid);
    }
}

// Adds visual effects.
function addVisualEffect(...list) {
    for (const ve of list) {
        visualEffects.set(ve.id, ve);
    }
}

// Draw visual effects.
function drawVisualEffects() {
    for (const [vid, vse] of visualEffects) {
        vse.draw();
    }

    // Draw blizzard effect.
    if (isBlizzardOn) {
        const intv = 150;
        const snowSize = 14;
        const period = fps / 2;
        const phase = globalTimer % period;
        const offset = phase / period * intv;

        const alphaP = fps * 2;
        const alphaPhase = (globalTimer % alphaP) / alphaP;
        const col = isBlizzardTier5 ? "rgb(63, 147, 255)" : "rgb(60, 235, 255)";
        const alpha = fitInterval(0.5 + 0.2 * sin(alphaPhase * pi * 2), 0, 1);

        ctxdl.save();
        ctxdl.globalAlpha = alpha;

        ctxdl.fillStyle = col;
        ctxdl.fillRect(0, 0, winX, winY);

        let x = -snowSize + offset - 2 * intv;
        let y = -snowSize + offset - 2 * intv;

        while (x < winX + snowSize) {
            y = -snowSize + offset - 2 * intv;

            while (y < winY + snowSize) {
                ctxdl.beginPath();
                ctxdl.arc(x, y, snowSize, 0, pi * 2);
                ctxdl.closePath();

                const rg = ctxdl.createRadialGradient(x, y, 1, x, y, snowSize);
                rg.addColorStop(0, "rgb(255, 255, 255)");
                rg.addColorStop(0.5 + 0.2 * sin(phase / period * pi * 2), "rgb(255, 255, 255)");
                rg.addColorStop(1, "rgba(255, 255, 255, 0)");

                ctxdl.fillStyle = rg;
                ctxdl.fill();

                ctxdl.beginPath();
                ctxdl.arc(x + intv / 2, y + intv / 2, snowSize, 0, pi * 2);
                ctxdl.closePath();

                const rg2 = ctxdl.createRadialGradient(x + intv / 2, y + intv / 2, 1, x + intv / 2, y + intv / 2, snowSize);
                rg2.addColorStop(0, "rgb(255, 255, 255)");
                rg2.addColorStop(0.5 + 0.2 * sin(phase / period * pi * 2), "rgb(255, 255, 255)");
                rg2.addColorStop(1, "rgba(255, 255, 255, 0)");

                ctxdl.fillStyle = rg2;
                ctxdl.fill();

                ctxdl.restore();
                y += intv;
            }

            x += intv;
        }

        ctxdl.restore();
    }
    else if (darkenAlpha > 0.0) {
        ctxdl.fillStyle = `rgba(0, 0, 0, ${darkenAlpha})`;
        ctxdl.fillRect(0, 0, winX, winY);
    }

    if (grandAlpha > 0.0) {
        ctxdh.fillStyle = `rgb(0, 0, 0, ${grandAlpha})`;
        ctxdh.fillRect(0, 0, winX, winY);
    }

    for (const [pid, portal] of portals) {
        portal.draw(ctxd);
    }

    for (const [mid, mark] of betrayalMarks) {
        mark.draw(ctxdh);
    }

    if (menuAlpha > 0.0) {
        switch (menuKind) {
            case MENU: {
                drawMenuScreen();
                break;
            }
            case DEAD: {
                drawDeadScreen();
                break;
            }
            case VICT: {
                drawVictoryScreen();
                break;
            }
            case RECO: {
                drawRecordScreen();
                break;
            }
            case CRED: {
                drawCreditScreen();
                break;
            }
        }
    }
}