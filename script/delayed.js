/* 
    delayed.js - 2024.02.26

    Implementation of delayed operations.
*/

const delayedWorks = new Map();
let delayedId = 0;

// Class for processing delayed operation.
class DelayedWork {
    constructor(delay, origin, work, args) {
        this.id = delayedId++;
        this.delay = delay;
        this.origin = origin;
        this.work = work;
        this.args = args;
        this.beginTimer = globalGameTimer;

        this.expired = true;
    }

    update() {
        if (this.beginTimer + this.delay <= globalGameTimer) {
            this.expired = true;
        }
    }
}

// Processes delayed works.
function processDelayedWorks() {
    for (const [wid, work] of delayedWorks) {
        work.update();

        if (work.expired) {
            work.work(...work.args);
            delayedWorks.delete(wid);
        }
    }
}