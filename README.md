# Gunja Defense

외부 라이브러리 없이 Vanilla JavaScript와 HTML Canvas API로만 만든 타워 디펜스 게임입니다.

---
## 목차
- [개요](#개요)
- [실행 방법](#실행-방법)
- [게임 개요](#게임-개요)
- [프로젝트 구조](#프로젝트-구조)
- [기술적 설명](#기술적-설명)
  - [게임 루프](#1-게임의-메인-루프)
  - [Canvas 렌더링](#2-canvas-레이어를-이용한-렌더링)
  - [상태이상 시스템](#3-상태이상-시스템)
  - [투사체 시스템](#4-투사체-시스템)
  - [저장 시스템](#5-저장-시스템-구현)
- [설계상 한계와 개선 방향](#설계상-한계와-개선-방향)


##### 기술적 핵심
- requestAnimationFrame 기반 게임 루프 설계
- Canvas 레이어 구조
- 상태이상의 우선 순위 및 중첩 처리 구조
- 콜백 기반 투사체 시스템 (onCollide / onExpire)

---

## 개요

대한민국 국군 복무 중, 외부 코드를 사용하지 않고 직접 처음부터 모든 것을 게임을 제작하고 싶어 개발한 프로젝트입니다.
렌더링 파이프라인, 게임 루프, 충돌 연산, UI, 저장 시스템 등을 모두 직접 구현했습니다.

---

## 실행 방법

아래 링크에서 게임을 바로 실행해 볼 수 있습니다.
[게임 링크 (GitHub Pages)](https://glacya.github.io/Gunja-Defense/)

---

## 게임 개요

이 프로젝트는 타워 디펜스 장르의 게임입니다.
- 플레이어는 8종의 타워를 설치하고 업그레이드하여 다가오는 적들을 막아내야 합니다.
- 적들은 총 50개의 라운드에 걸쳐 다가오며, 10번째 라운드마다 보스가 등장합니다. 각 적들은 화면 오른쪽에서 왼쪽으로 움직이고 몇몇 적들은 특수한 능력도 갖고 있습니다.
- 타워의 업그레이드는 총 5단계가 있으며, 골드를 소모해 업그레이드합니다. 4단계 이상부터는 강력한 액티브 스킬을 사용할 수 있습니다.
- 3가지의 난이도로 즐길 수 있으며, 로컬 세이브 및 기록을 지원합니다.

---

## 프로젝트 구조

```
gunja-defense/
├── index.html
├── game.css
├── img/
│   ├── active/          // 타워 액티브 스킬 이미지 (미포함)
│   └── trait/           // 상태이상 및 특성 이미지 (미포함)
└── script/
    ├── game.js          // 게임의 메인 루프 및 전역 변수 관리
    ├── utils.js         // 수학 함수, 
    ├── save.js          // 세이브/로드, 기록 및 점수 구현
    ├── event_handler.js // I/O 처리
    ├── ui.js            // UI 구현. 너무 길어 모듈화 필요
    ├── round.js         // 라운드 관련 논리 및 적 데이터 구현
    ├── delayed.js       // 지연 콜백 구현
    ├── projectile.js    // 투사체 구현
    ├── status_effect.js // 상태이상 구현
    ├── visual_effect.js // VFX 구현
    ├── tower/           // 타워 구현
    └── enemy/           // 적 구현
```
---


## 기술적 설명

### 1. 게임의 메인 루프

```
requestAnimationFrame(mainLoop)
  └─ loopGame()
       ├─ clearInGameCanvas()     // 캔버스 초기화
       ├─ processInGame()         // 적 및 발사체의 생성과 상호작용 등 논리 처리
       ├─ processVisualEffects()  // VFX 논리 처리
       └─ drawInGame()            // 모든 캔버스를 다시 그림
            ├─ drawStaticUI()       // 정적 UI 렌더링 (필요할 때만)
            ├─ drawDynamicUI()      // 동적 UI 렌더링
            ├─ drawProjectiles()    // 투사체 렌더링
            ├─ drawVisualEffects()  // VFX 렌더링
            ├─ drawTowers()         // 타워 렌더링
            └─ drawEnemies()        // 적 렌더링
  └─ globalTimer++ / globalGameTimer++  // 게임 타이머 처리
  └─ ...
```

게임은 `requestAnimationFrame` 기반으로 작동하여 브라우저의 tick마다 논리 처리와 렌더링이 한 번씩 이루어집니다. delta-time 방식과 비교했을 때 이 방식은 구현이 쉽고, 성능이 낮은 기기에서도 사용자의 입력이 무시되는 일이 없다는 장점이 있습니다. 인트라넷은 성능이 낮은 컴퓨터가 대부분이었기에 성능이 낮아 게임이 느려져도 게임을 정상적으로 할 수 있도록 했습니다.

또한 게임에서는 두 가지의 타이머를 사용합니다. 
`globalTimer`는 게임 전역에서 사용하는 타이머로, 타워 디펜스의 논리와 무관한 연산과 애니메이션을 처리할 때 사용합니다. (ex: UI 페이드인/아웃, 일시정지 애니메이션 등)
`globalGameTimer`는 타워 디펜스의 논리를 위해 사용하는 타이머로, 게임 내 엔티티들 사이의 연산과 애니메이션을 처리할 때 사용합니다. (ex: 충돌 판정, 위치 연산, 피격 애니메이션 등)


### 2. Canvas 레이어를 이용한 렌더링

여러 개의 HTML Canvas를 사용해 각 Canvas가 서로 다른 레이어로 동작하도록 만들었습니다.

| 캔버스 | 역할 |
|---|---|
| `canvasDynamicLow` | 사거리 표시용 원, 배경 |
| `canvasDynamic` | 적, 타워, 투사체 |
| `canvasDynamicBoss` | 보스 전용 렌더링 |
| `canvasDynamicHigh` | 팝업 텍스트, 일부 VFX |
| `canvasUIStatic` | 정적 UI |
| `canvasUIDynamic` | 동적 UI |
| `canvasCursor` | 마우스 커서 및 조준 표시 |
| `canvasPauseStatic` | 일시정지 메뉴의 정적 UI |
| `canvasPauseDynamic` | 일시정지 메뉴의 동적 UI |
| `canvasPauseFull` | 일시정지 배경 |
| `canvasMenu` | 메인 메뉴, 결과 화면 |

게임 루프의 구조 상 Canvas들은 매 프레임마다 전부 지워지고 다시 그려지는데, Canvas API의 특성 때문에 일부분만 다시 그리는 것이 어렵다고 생각했기 때문입니다. 이는 렌더링의 비용을 높이기 때문에, 렌더링 횟수를 최대한 줄이고자 매 프레임마다 렌더링할 필요가 없는 것들은 최대한 덜 그리도록 했습니다.
 `canvasUIStatic`, `canvasPauseStatic`과 같은 정적 UI용 캔버스들이 정확히 그런 캔버스들이기에, `drawnStatics`라는 boolean 플래그를 넣어 필요한 상황에서만 렌더링되도록 설계되었습니다.

---

### 3. 상태이상 시스템

각 상태이상은 `StatusEffect` 클래스를 상속하는 독립적인 클래스 객체로 표현됩니다. 상태이상의 처리는 `Enemy`, `Tower`와 같은 엔티티의 `update` 함수에서 매 프레임마다 진행됩니다. 엔티티는 `update` 함수에서 각 상태이상을 모두 확인한 뒤, 우선 순위와 중첩 규칙을 올바르고 쉽게 처리합니다.

이 구조는 직관적이고 잘 작동합니다. 그러나 상태이상의 종류가 늘어나면 코드가 길어지는 등 확장성은 더욱 개선할 여지가 있습니다. 이 프로젝트가 다루는 상태이상은 약 30여 종으로 현재 규모에서는 감당할 수 있는 정도라 생각하였습니다.

```js
let steId = 0;

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

// 둔화 상태이상. this.ratio 의 비율만큼 속도를 낮춥니다.
class SlowStatus extends StatusEffect {
    constructor(duration, ratio, origin) {
        super("slow", duration, origin);
        this.ratio = ratio;
    }
}

// 기절 상태이상. 행동하지 못하게 합니다.
class StunStatus extends StatusEffect {
    constructor(duration, origin) {
        super("stun", duration, origin);
    }
}
```

```js
// enemy.js: Enemy.update()
for (const [sid, ste] of this.statusEffects) {
    ste.update();

    // 특정 조건이 갖춰졌거나, 상태이상의 수명이 끝나면 제거
    if (this.sturdy && negativeStatusNames.has(ste.kind) && globalGameTimer - ste.startTime >= ste.duration * 0.5) {
        ste.expired = true;
    }

    if (ste.expired) {
        this.statusEffects.delete(sid);
        continue;
    }

    switch (ste.kind) {
        case "slow": {
            slowMin = min(slowMin, ste.ratio);
            break;
        }
        case "stun": {
            this.stunned = true;
            break;
        }
        /*
        ...
        */
        default: {
            console.error("Enemy.update(): Invalid status effect kind:", ste.kind);
            break;
        }
    }
}

```

---

### 4. 투사체 시스템

`Projectile` 클래스는 게임에 사용되는 투사체를 구현합니다. 

`onCollide`, `onExpire` 인자에 콜백 함수를 전달해 충돌 또는 소멸 시 어떤 행동을 할 지 정해줄 수 있습니다.
충돌 판정은 투사체가 적 또는 타워에 닿았는지 전부 탐색해 검사하는 방식으로 작동합니다. 비슷하게, 소멸 판정은 투사체가 `pierce`를 모두 소모하거나 수명이 다했을 때 `expired` 값을 `true`로 바꾸고, 게임 루프가 `expire`된 투사체를 처리하는 식으로 이루어집니다.

이 방식은 투사체의 물리적 상호작용과 판정 시 효과(충돌, 소멸 등)를 잘 분리할 수 있게 해주고, 콜백을 추가하는 것만으로 새로운 투사체를 만들 수 있도록 해줍니다.

```js
// projectile.js

class Projectile {
    // 시작 위치, 속도, Property, 투사체의 스타일(생김새), 충돌 판정 시 콜백, 소멸 시 콜백
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
}

// 투사체의 Property를 기술하는 클래스
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

```


투사체를 게임에 추가하려면 다음과 같이 추가합니다. 충돌 및 소멸 시 어떤 행동을 할 지 타워나 적의 코드에서 기술할 수 있습니다.

```js
// tower/poison_tower.js: PoisonTower.attack()

// 투사체가 충돌했을 때 어떻게 행동할 지 적어둔 콜백 함수.
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

// 투사체의 특성을 정의.
const prop = new ProjectileProperty("destinated", null, 1e18, this.activeProjSize, this.activeProjLifetime, "poison", this.hasCamoDetection(), {
    destination: vAdd(this.position, vScalarMul(dirVector, this.activeProjSpeed * this.activeProjLifetime))
});

// 마지막으로, 투사체를 게임에 추가
const proj = new Projectile(vAdd(this.position, dirVector), vScalarMul(dirVector, this.activeProjSpeed), prop, { kind: "poisoncloud", color: this.badPoisonColor}, onCollide, null);
addProjectiles(proj);
```

---

### 5. 저장 시스템 구현

localStorage를 사용해 세이브/로드 기능과 기록을 구현했습니다.
게임 데이터를 GameProgress라는 클래스로 만들고 JSON으로 변환해 저장합니다. 다시 불러올 때는 Object.assign으로 클래스 메서드를 다시 추가해줍니다.


```js
// 현재 플레이 중인 게임 저장
function saveProgress(kind) {
    const prog = new GameProgress();
    prog.save();

    window.localStorage.setItem(kind, JSON.stringify(prog));
}

// 저장된 게임 불러오기
function loadProgress(kind) {
    const prog = window.localStorage.getItem(kind);

    if (!prog) return false;

    const gp = Object.assign(new GameProgress, JSON.parse(prog));
    gp.load();

    return true;
}

```

---

## 설계상 한계와 개선 방향

이 프로젝트는 재미로 개발한 것인 만큼, 현재 시점에서 돌아보면 개선하고 싶은 구조적 한계가 있습니다.

#### 전역 상태 의존
게임의 상태 관리는 전역 변수들에 크게 의존합니다. Canvas context들이나, `enemies`, `towers` 등의 전역 Map이 코드 전체에서 사용됩니다. 이는 코드 영역의 분리를 매우 어렵게 만들고, 예상치 못한 버그를 일으키기 쉽습니다.

또한 게임의 논리와 렌더링이 잘 구별되지 않아 한 파일에 논리와 렌더링을 모두 처리하는 구조로 되어있습니다. Model과 View를 나누어 저장하면 코드의 유지보수성을 더욱 올릴 수 있으리라 생각합니다.

#### 확장성 및 객체지향 패러다임

상태이상, 투사체 등은 확장이 매우 어려운 구조입니다. 하나의 부모 클래스를 다루는 코드에서, 자식 클래스에만 있는 필드에 접근하는 등 버그를 일으키기 쉬운 구조이기도 합니다. (ex: `Enemy`는 상태이상을 처리할 때 `ste.ratio`에 접근하는데, 이는 `SlowStatus`에만 있고 `StunStatus`에는 없음)
결과적으로 객체를 다루는 코드베이스임에도 불구하고 객체지향적 디자인이 매우 부족한 형태가 나왔습니다. 객체의 상속 위계를 잘 설계하고 관리했으면 더욱 코드를 관리하기 쉬웠을 것입니다.

#### 엔진 개선
##### 투사체 판정

투사체의 충돌 판정이 비효율적입니다. 현재는 모든 투사체에 대해, 모든 적 및 타워와의 충돌 여부를 판정합니다. 간단하게 생각해 보아도 시간 복잡도는 O(Projectile * (Enemy + Tower))이며, 투사체, 적, 타워가 많아지면 게임 실행을 크게 느리게 만들 수 있습니다.
프로젝트 구현 당시에는 이 문제를 적의 수를 줄이는 대신 체력을 늘리고 특수 능력을 넣는 설계를 통해 해결했습니다.

##### Canvas 기반 UI

Canvas 기반 UI와 Event Handler는 게임 내에 UI처럼 보이는 그림을 그리고, 그림이 그려진 위치와 상호작용 했을 때 논리를 처리하는 방식으로 작동합니다. 이는 간단한 방식이지만, UI가 그려진 위치를 정확하게 계산하고 확인하는 것은 매우 귀찮았고 틀리기 쉬운 방식이었습니다. 이후 비슷한 프로젝트를 하게 된다면 UI는 Canvas로 그리기보다는 따로 빼서 관리할 것 같습니다.

---

## 라이선스

개인 프로젝트입니다. All rights reserved.
