/*
    utils.js - 2023.10.21

    This file contains utility functions that can be used generally on the game.
*/

const pi = Math.pi;
const sin = Math.sin;
const cos = Math.cos;
const floor = Math.floor;
const sqrt = Math.sqrt;
const random = Math.random;

function min(x, y) {
    return (x < y ? x : y);
}

function max(x, y) {
    return (x < y ? y : x);
}

function square(x) {
    return x * x;
}

// Fits `value` into interval [lv, rv].
function fitInterval(value, lv, rv) {
    return min(max(value, lv), rv);
}

// Sorts the given array with the given comparator using merge sort.
// comparator is a function that takes two arguments a and b, and returns true if a is regarded smaller than b.
function sort(list, comparator) {
    if (list.length == 1) return list;

    const left = list.slice(0, list.length / 2);
    const right = list.slice(list.length / 2);

    const sortedLeft = sort(left, comparator);
    const sortedRight = sort(right, comparator);

    let sortedList = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (sortedList.length < list.length) {
        if (leftIndex == sortedLeft.length) {
            sortedList.push(sortedRight[rightIndex++]);
        }
        else if (rightIndex == sortedRight.length) {
            sortedList.push(sortedLeft[leftIndex++]);
        }
        else {
            if (comparator(sortedLeft[leftIndex], sortedRight[rightIndex])) {
                sortedList.push(sortedLeft[leftIndex++]);
            }
            else {
                sortedList.push(sortedRight[rightIndex++]);
            }
        }
    }

    return sortedList;
}

// Returns value regarding the difficulty of the game.
// Returns a if EASY, b if NORMAL, c if HARD.
function diffBranch(a, b, c) {
    if (gameDifficulty == EASY) return a;
    else if (gameDifficulty == NORMAL) return b;
    else if (gameDifficulty == HARD) return c;

    // Erroneous case.
    return null;
}

// Converts string with format "rgba(a, b, c, d)" or "rgb(a, b, c)" to string "rgba(a, b, c, alpha)".
// This is costly operation; it can be optimized by processing colors by integers, not strings.
function toAlpha(colorString, alpha) {
    const cs = colorString.replaceAll(" ", "").replaceAll("(", "").replaceAll(")", "").replaceAll("rgb","").replaceAll("a","");
    const list = cs.split("");

    if (alpha == NaN) {
        console.error("toAlpha(): alpha is not a valid number.");
        return null;
    }

    return `rgba(${list[0]}, ${list[1]}, ${list[2]}, ${fitInterval(alpha, 0.0, 1.0)})`;
}

// A function that takes a color string and returns transparent version of that.
function toTransparent(colorString) {
    return toAlpha(colorString, 0);
}

// Class representing 2-dimensional vector.
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Creates its copy.
    copy() {
        return new Vector2(this.x, this.y);
    }

    // Returns the magnitude of the vector.
    size() {
        return sqrt(max(0, square(this.x) + square(this.y)));
    }

    // Normalizes vector so that the vector has size of 1.
    // KNOWN BUG: If norm is too small, then the vector can become unexpectedly large.
    normalize() {
        const norm = this.size();

        if (norm > 0.0) {
            this.x /= norm;
            this.y /= norm;
        }
    }

    // Adds a vector to this vector.
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    // Multiplies a scalar value to this vector.
    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }

    // Returns the distance of two points represented by this vector and the given vector.
    distance(vector) {
        return sqrt(square(this.x - vector.x) + square(this.y - vector.y));
    }

    // Returns dot product of two vectors.
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    // Returns cross product of two vectors.
    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }

    // Returns minimum angle between directions represented by two vectors.
    angle(vector) {
        const dp = this.dot(vector);
        const np = this.size() * vector.size();

        if (np == 0) return 0.0;

        return Math.acos(fitInterval(dp / np, -1.0, 1.0));
    }

    // Returns a vector which is a rotation of the vector by theta, clockwise.
    rotate(theta) {
        const s = sin(theta);
        const c = cos(theta);

        return new Vector2(this.x * c - this.y * s, this.x * s + this.y * c);
    }
}

// Returns sum of 2-dimensional vector, v1 + v2.
function vAdd(v1, v2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
}

// Returns difference of 2-dimensional vector, v1 - v2.
function vSub(v1, v2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
}

// Returns scalar multiplication of 2-dimensional vector, s * v.
function vScalarMul(v, s) {
    return new Vector2(v.x * s, v.y * s);
}

// Checks if Vector2 `target` points a position which is inside of a rectangle spanned by two vectors:
// `range`: A Vector2 object that points a upper-left corner of the rectangle.
// `size`: A Vector2 object that represents the size of the rectangle.

// If `target` is inside the rectangle, returns true. Otherwise returns false.
function inRange(target, range, size) {
    return target.x >= range.x && target.y >= range.y && target.x <= range.x + size.x && target.y <= range.y + size.y;
}

// Displays `string` on multiple lines, fit in the given `width`.
function drawMultilineText(string, position, bold, fontSize, fillStyle, width, ctx) {
    ctx.fillStyle = fillStyle;
    if (bold) ctx.font = `bold ${fontSize}px Arial`;
    else ctx.font = `${fontSize}px Arial`;

    const words = string.split(" ");
    const maxLength = width;

    let lineLength = 0;
    let lineNumber = 0;

    for (const w of words) {
        if (w == "\n") {
            lineLength = 0;
            lineNumber++;
            continue;
        }

        const wordLength = ctx.measureText(w).width;

        if (lineLength + wordLength > maxLength) {
            lineLength = 0;
            lineNumber++;
        }

        ctx.fillText(w, position.x + lineLength, position.y + lineNumber * fontSize * 1.5);
        lineLength += wordLength + fontSize / 3;
    }
}

// Draws string aligned middle, so that the `position` is the center of the given text.
function drawTextAlignMiddle(string, poistion, bold, fontSize, fillStyle, ctx) {
    let font = `${fontSize}px Arial`;

    if (bold) font = "bold " + font;

    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.fillText(string, position.x, position.y + fontSize / 3);

    ctx.restore();
}

// Draws string aligned right, so that the `position` is at the right of the given text.
function drawTextAlignRight(string, position, bold, fontSize, fillStyle, ctx) {
    let font = `${fontSize}px Arial`;

    if (bold) font = "bold " + font;

    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.font = font;
    ctx.textAlign = "right";
    ctx.fillText(string, position.x, position.y + fontSize / 3);

    ctx.restore();
}

// Computes predicted direction vector for projectiles.
// It solves quadratic equation using enemy speed, projectile speed, enemy size, and tower position.
// If there is no real solution of equation, returns a vector pointing far position.
function computePredictedDirection(towerPosition, enemy, projSpeed, towerRange) {
    const enemyPosition = enemy.position;
    const enemySpeed = (enemy.frozen || enemy.stunned || enemy.stopped) ? 0 : enemy.speed;

    const displacement = vSub(enemyPosition, towerPosition);
    const projVelocity = new Vector2(-projSpeed, 0);
    const enemyVelocity = new Vector2(-enemySpeed, 0);

    const quadCoeff = enemyVelocity.dot(enemyVelocity) - projVelocity.dot(projVelocity);
    const linearCoeff = 2.0 * displacement.dot(enemyVelocity);
    const constCoeff = displacement.dot(displacement);

    let targetPos = null;

    const marginX = sqrt(max(0, square(towerRange) - square(displacement.y)));
    let marginPos = new Vector2(towerPosition.x - marginX * 1.5, enemyPosition.y);

    if (quadCoeff == 0.0) {
        if (linearCoeff >= 0.0) targetPos = marginPos;
        else {
            const t = constCoeff / (-2.0 * linearCoeff);
            targetPos = vAdd(enemyPosition, vScalarMul(enemyVelocity, t));
        }
    }
    else {
        const discrim = square(linearCoeff) - 4.0 * quadCoeff * constCoeff;

        if (discrim < 0.0) targetPos = marginPos;
        else {
            const sqd = sqrt(max(0, discrim));
            const t = max((-linearCoeff + sqd) / (2.0 * quadCoeff), (-linearCoeff -sqd) / (2.0 * quadCoeff));

            if (t < 0.0) targetPos = marginPos;
            else targetPos = vAdd(enemyPosition, vScalarMul(enemyVelocity, t));
        }
    }

    if (towerPosition.x - targetPos.x > marginX * 1.5) {
        targetPos = marginPos;
    }

    let velocityVector = vSub(targetPos, towerPosition);
    velocityVector.normalize();

    return velocityVector;
}

// Picks target for towers, regarding the tower's preference.
// `tower`: Target tower.
// `skipCondition`: Function that takes one or more arguments and returns Boolean. If true, skip the enemy.
// `args`: List of arguments used for skipCondition.
function pickTarget(tower, skipCondition, args) {
    let leadId = null;

    switch (tower.preference) {
        case TOWER_PREF_FIRST: {
            let minPos = winX * 2;
            for (const [eid, enemy] of enemies) {
                if (enemy.camouflaged && !tower.hasCamoDetection()) continue;
                if (skipCondition(enemy, ...args)) continue;

                if (tower.position.distance(enemy.position) <= tower.attackRange * tower.rangeFactor + enemy.size && enemy.position.x < minPos) {
                    minPos = enemy.position.x;
                    leadId = eid;
                }
            }
            break;
        }
        case TOWER_PREF_LAST: {
            let maxPos = -10000;
            for (const [eid, enemy] of enemies) {
                if (enemy.camouflaged && !tower.hasCamoDetection()) continue;
                if (skipCondition(enemy, ...args)) continue;

                if (tower.position.distance(enemy.position) <= tower.attackRange * tower.rangeFactor + enemy.size && enemy.position.x > maxPos) {
                    maxPos = enemy.position.x;
                    leadId = eid;
                }
            }
            break;
        }
        case TOWER_PREF_CLOSE: {
            let minDist = 1e18;
            for (const [eid, enemy] of enemies) {
                if (enemy.camouflaged && !tower.hasCamoDetection()) continue;
                if (skipCondition(enemy, ...args)) continue;

                const dist = tower.position.distance(enemy.position);
                if (dist < minDist && dist <= tower.attackRange * tower.rangeFactor + enemy.size) {
                    minDist = dist;
                    leadId = eid;
                }
            }
            break;
        }
        case TOWER_PREF_STRONG: {
            let maxHp = -1;
            for (const [eid, enemy] of enemies) {
                if (enemy.camouflaged && !tower.hasCamoDetection()) continue;
                if (skipCondition(enemy, ...args)) continue;

                if (tower.position.distance(enemy.position) <= tower.attackRange * tower.rangeFactor + enemy.size && enemy.hp > maxHp) {
                    maxHp = enemy.hp;
                    leadId = eid;
                }
            }
            break;
        }
    }

    return leadId;
}

// Returns string that represents playtime.
function toTimeString(timer) {
    const t = timer / 60;

    const seconds = floor(t) % 60;
    const minutes = floor(t / 60) % 60;
    const hours = floor(t / 3600);

    let timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (hours > 0) timeStr = String(hours).padStart(2, "0") + ":" + timeStr;

    return timeStr;
}

// Priority Queue data structure.
// It is implemented as min heap using the given comparator.
// If comparator is (a , b) => (a < b) and you pushed 5, 2, 1, 4, 3, the pops would get 1, 2, 3, 4, 5.
class PriorityQueue {
    constructor(comparator = ((a, b) => a < b)) {
        this.size = 0;
        this.data = [null];
        this.comparator = comparator;
    }

    // Pushes value to the priority queue.
    push(value) {
        let index = this.size + 1;
        this.data.push(value);

        while (index > 1) {
            const p = floor(index / 2);

            if (this.comparator(this.data[index], this.data[p])) {
                [this.data[p], this.data[index]] = [this.data[index], this.data[p]];

                index = p;
            }
            else break;
        }

        this.size += 1;
    }

    // Pops a current top of the priority queue and returns popped value.
    pop() {
        if (this.empty()) {
            console.error("PriorityQueue.pop(): Priority queue is empty.");
            return null;
        }

        const popData = this.top();

        [this.data[1], this.data[this.size]] = [this.data[this.size], this.data[1]];
        this.data.pop(this.size);

        this.size -= 1;

        let index = 1;
        while (true) {
            if (index * 2 > this.size) break;

            let nx = index * 2;

            if (index * 2 + 1 <= this.size && this.comparator(this.data[index * 2 + 1], this.data[index * 2])) {
                nx = index * 2 + 1;
            }

            if (this.comparator(this.data[nx], this.data[index])) {
                [this.data[nx], this.data[index]] = [this.data[index], this.data[nx]];

                index = nx;
            }
            else break;
        }

        return popData;
    }

    // Discard every element in the priority queue.
    clear() {
        while (!this.empty()) {
            this.pop();
        }
    }

    // Returns true if the priority queue is empty. Otherwise returns false.
    empty() {
        return this.size == 0;
    }

    // Returns the current top element of the priority queue.
    top() {
        if (this.empty()) return null;

        return this.data[1];
    }
}