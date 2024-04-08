/* 
    status_effect.js - 2023.11.21

    This file contains:
    - Definitions of status effects, and its functions
*/

let steId = 0;
const positiveStatusNames = new Set();
const negativeStatusNames = new Set();

// Class representing status effects.
class StatusEffect {
    constructor(kind, duration, origin) {
        this.id = steId++;
        this.kind = kind;

        this.startTime = globalGameTimer;
        this.duration = duration;
        this.origin = origin;
        this.expired = false;
    }

    update() {
        if (globalGameTimer - this.startTime >= this.duration) {
            this.expired = true;

            if (this.kind == "casting") drawnStatics = false;
        }
    }
}

// Adds status names to global sets.
function initStatusEffectNames() {
    const positives = [
        "haste", "heal", "mysteryshield", "camo",
        "asboost", "rangeboost", "detect", "damageboost", "transcendent",
        "discount", "pierceboost", "bosskill", "tranready"
    ];
    const negatives = [
        "slow", "cold", "freeze", "stun", "poison", "badpoison",
        "knockback", "weaken", "corrosion", "nullify", "asslow",
        "rangedown", "damagedown", "activeblock"
    ];
    // const neutrals = ["casting", "stop", "gold", "betray", "sellblock"];

    for (const name of positives) positiveStatusNames.add(name);
    for (const name of negatives) negativeStatusNames.add(name);
}

// Returns prototype of status classes. Used in progress save feature.
function getStatusPrototype(kind) {
    switch (kind) {
        case "casting": return new CastingStatus;
        case "slow": return new SlowStatus;
        case "cold": return new ColdStatus;
        case "freeze": return new FreezeStatus;
        case "stun": return new StunStatus;
        case "poison": return new PoisonStatus;
        case "badpoison": return new BadPoisonStatus;
        case "knockback": return new KnockbackStatus;
        case "weaken": return new WeakenStatus;
        case "corrosion": return new CorrosionStatus;
        case "nullify": return new NullifyStatus;
        case "asslow": return new AttackSpeedSlowStatus;
        case "asboost": return new AttackSpeedBoostStatus;
        case "haste": return new HasteStatus;
        case "mysteryshield": return new MysteryShieldStatus;
        case "camo": return new CamoStatus;
        case "rangeboost": return new RangeBoostStatus;
        case "rangedown": return new RangeDownStatus;
        case "detect": return new DetectStatus;
        case "damageboost": return new DamageBoostStatus;
        case "transcendent": return new TranscendentStatus;
        case "discount": return new DiscountStatus;
        case "pierceboost": return new PierceBoostStatus;
        case "sellblock": return new SellBlockStatus;
        case "damagedown": return new DamageDownStatus;
        case "betray": return new BetrayStatus;
        case "activeblock": return new ActiveBlockStatus;
        case "bosskill": return new BossKillStatus;
        case "tranready": return new TranReadyStatus;
        default: return null;
    }
}

// Slow (Negative)
// The target's movement speed is multiplied by `ratio`.
// If multiple Slows apply on the same target, the one with the least ratio (=most slowing) applies.
class SlowStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("slow", duration, origin);
        this.ratio = ratio;
    }
}

// Cold (Negative)
// Identical to Slow.
class ColdStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("cold", duration, origin);
        this.ratio = ratio;
    }
}

// Freeze (Negative)
// Immobilizes the target.
// Target with Freeze is immune to other Freezes.
class FreezeStatus extends StatusEffect {
    constructor(duration, origin) {
        super("freeze", duration, origin);
    }
}

// Stun (Negative)
// Immobilizes the target.
class StunStatus extends StatusEffect {
    constructor(duration, origin) {
        super("stun", duration, origin);
    }
}

// Poison (Negative)
// - The target gains on death effect `onDeath`, which is a function.
// - The target takes the minimum of:
// 1. (`damage` + `maxHpRatio * (target's max HP)`) damage per second.
// 2. (`damage` + `maxHpLimit`) damage per second.
// - The damage is inflicted every `period`.
// - Target with Poison is immune to other Poisons.
class PoisonStatus extends StatusEffect {
    constructor(duration, damage, period, maxHpRatio, maxHpLimit, onDeath, origin) {
        super("poison", duration, origin);

        this.damage = damage;
        this.period = period;
        this.maxHpRatio = maxHpRatio;
        this.maxHpLimit = maxHpLimit;
        this.damageTimer = globalGameTimer;
        this.onDeath = onDeath;
    }
}

// Bad Poison (Negative)
// - The target gains on death effect `onDeath`, which is a function.
// - A non-boss target takes (ratio * (target's max HP)) damage per second.
// - A non-boss target immediately dies if damage from Bad Poison makes the target HP go below (target's max HP * execRatio).
// - A boss target takes minimum of (ratio * (target's max HP)) and (bossLimit) damage per second.
// - The damage is inflicted every 'period'.
// - Target with Bad Poison is immune to other Bad Poisons.
class BadPoisonStatus extends StatusEffect {
    constructor(duration, ratio, period, bossLimit, execRatio, onDeath, origin) {
        super("badpoison", duration, origin);

        this.ratio = ratio;
        this.period = period;
        this.bossLimit = bossLimit;
        this.executionRatio = execRatio;
        this.damageTimer = globalGameTimer;
        this.onDeath = onDeath;
    }
}

// Knockback (Negative)
// The target's movement speed is multiplied by (-magRatio).
// Target with Knockback is immune to other Knockbacks.
class KnockbackStatus extends StatusEffect {
    constructor(duration, magRatio, origin) {
        super("knockback", duration, origin);
        
        this.ratio = magRatio;
    }
}

// Weaken (Negative)
// Damage that the target takes is multiplied by `ratio`.
// If multiple Weakens apply on the same target, only one with the highest ratio applies.
class WeakenStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("weaken", duration, origin);

        this.ratio = ratio;
    }
}

// Corrosion (Negative)
// Every healing the target takes is multiplied by `ratio`.
// If multiple Corrosions apply on the same target, only one with the lowest ratio (=highest reduce) applies.
class CorrosionStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("corrosion", duration, origin);

        this.ratio = ratio;
    }
}

// Haste (Positive)
// Movement speed of the target is multiplied by `ratio`.
// If multiple Hastes apply on the same target, only one with the highest ratio (=fastest one) applies.
class HasteStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("haste", duration, origin);

        this.ratio = ratio;
    }
}

// Heal (Positive)
// The target heals by `heal` every `period`.
class HealStatus extends StatusEffect {
    constructor(duration, heal, period, origin) {
        super("heal", duration, origin);

        this.heal = heal;
        this.period = period;
        this.healTimer = globalGameTimer;
    }
}

// Mystery Shield (Positive)
// Protects the target from inflicting negative status effects, up to `count` times.
// Protecting from negative status effect reduces the `count` of Mystery Shield by 1.
// Mystery Shield wears off if its count becomes 0.
class MysteryShieldStatus extends StatusEffect {
    constructor(duration, count, origin) {
        super("mysteryshield", duration, origin);

        this.count = count;
    }
}

// Nullify (Negative)
// Nullifies the target's immunities.
class NullifyStatus extends StatusEffect {
    constructor(duration, origin) {
        super("nullify", duration, origin);
    }
}

// Camo (Positive)
// Target with Camo is not interactable with towers without camo detection.
class CamoStatus extends StatusEffect {
    constructor(duration, origin) {
        super("camo", duration, origin);
    }
}

// Gold (Neutral)
// Gold reward from taking the target down is multiplied by `ratio`. Always has infinite duration.
// If multiple Golds apply to the same target, only the one with the highest ratio applies.
class GoldStatus extends StatusEffect {
    constructor(ratio, origin) {
        super("gold", 1e18, origin);

        this.ratio = ratio;
    }
}

// Stop (Neutral)
// It is a helper status effect for enemies, which makes the target stop for its duration.
class StopStatus extends StatusEffect {
    construtor(duration, origin) {
        super("stop", duration, origin);
    }
}

// TranReady (Positive)
// The target's attack speed is multiplied by `ratio`.
// It stacks additively with AttackSpeedBoost.
class TranReadyStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("tranready", duration, origin);

        this.ratio = fitInterval(ratio, 1.0, 1e18);
    }
}

// AttackSpeedBoost (Positive)
// The target's attack speed is multiplied by `ratio`.
// If multiple AttackSpeedBoosts apply on the same target, only the one with the highest ratio applies.
// It stacks additively with AttackSpeedBoost.
class AttackSpeedBoostStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("asboost", duration, origin);

        this.ratio = fitInterval(ratio, 1.0, 1e18);
    }
}

// AttackSpeedSlow (Negative)
// The target's attack speed is multiplied by `1 / ratio`.
// AttackSpeedSlow stacks additively.
class AttackSpeedSlowStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("asslow", duration, origin);

        this.ratio = fitInterval(ratio, 1.0, 1e18);
    }
}

// Sell Block (Neutral)
// The target tower cannot be sold.
// It is deliberately classified as Neutral, so that it cannot be blocked by mystery shield.
class SellBlockStatus extends StatusEffect {
    constructor(duration, origin) {
        super("sellblock", duration, origin);
    }
}

// Active Block (Negative)
// The target tower cannot cast its active ability.
class ActiveBlockStatus extends StatusEffect {
    constructor(duration, origin) {
        super("activeblock", duration, origin);
    }
}

// Betray (Neutral)
// The target tower betrays, so that its attacks heal enemies instead of damaging them.
// It is deliberately classified as Neutral, so that it cannot be blocked by mystery shield.
class BetrayStatus extends StatusEffect {
    constructor(duration, origin) {
        super("betray", duration, origin);
    }
}

// Range Boost (Positive)
// The target's attack range is multiplied by `ratio`.
// If multiple Range Boosts apply on the same target, only the one with the highest ratio applies.
class RangeBoostStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("rangeboost", duration, origin);

        this.ratio = ratio;
    }
}

// Range Down (Negative)
// The target's attack range is multiplied by `1 / ratio`.
// If multiple Range Downs apply on the same target, only the one with the highest ratio applies.
class RangeDownStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("rangedown", duration, origin);

        this.ratio = ratio;
    }
}

// Detect (Positive)
// The target gains camo detection, so that the target can now interact with enemies with Camo.
// Always has infinite duration.
class DetectStatus extends StatusEffect {
    constructor(origin) {
        super("detect", 1e18, origin);
    }
}

// Boss Kill (Positive)
// The damage that target inflicts to boss enemies is multiplied by `ratio`.
// If multiple Boss Kills apply to the smae target, only the one with the highest ratio applies.
// Boss Kill interacts multiplicatively with Damage Boost and Damage Down.
class BossKillStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("bosskill", duration, origin);

        this.ratio = ratio;
    }
}

// Casting (Neutral)
// The target cannot do any action except its active ability action.
// A tower with Casting cannot be sold.
class CastingStatus extends StatusEffect {
    constructor(duration, origin) {
        super("casting", duration, origin);
    }
}

// Damage Boost (Positive)
// The damage that target inflicts is multiplied by `ratio`.
// Damage Boost stacks additively.
class DamageBoostStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("damageboost", duration, origin);

        this.ratio = ratio;
    }
}

// Damage Down (Negative)
// The damage that target inflicts is multiplied by `ratio`.
// Damage Down stacks multiplicatively.
class DamageDownStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("damagedown", duration, origin);

        this.ratio = ratio;
    }
}

// Transcendent (Positive)
// A status exclusive for Arcane Pedestal.
// Identical to Damage Boost, except the target gains additional 25% of range boost.
class TranscendentStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("transcendent", duration, origin);

        this.ratio = ratio;
    }
}

// Discount (Positive)
// The target's upgrade cost is multiplied by `ratio`.
// If multiple Discounts apply on the same target, only the one with the lowest ratio (=cheapest) applies.
class DiscountStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("discount", duration, origin);

        this.ratio = ratio;
    }
}

// Pierce Boost (Positive)
// The target can attack extra `pierce` targets.
// IF multiple Pierce Boosts apply on the same target, only the one with the highest `pierce` applies.
class PierceBoostStatus extends StatusEffect {
    constructor(duration, pierce, origin) {
        super("pierceboost", duration, origin);

        this.pierce = pierce;
    }
}