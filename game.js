// =============================
// IDLE ASCENSION V3 CORE
// =============================

const SAVE_VERSION = 3;
const FPS = 30;
const FRAME_TIME = 1000 / FPS;

let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// =============================
// GAME STATE
// =============================

let game = {
    gold: 0,
    level: 1,
    wave: 1,
    xp: 0,
    xpToNext: 10,

    prestigeCount: 0,
    prestigeCurrency: 0,

    world: 1,

    totalKills: 0,
    totalPlayTime: 0,

    maxGold: 0,
    maxLevel: 1,

    lastSaveTime: Date.now(),

    shops: {
        damage: 0,
        gold: 0,
        xp: 0,
        crit: 0,
        critDmg: 0,
        attackSpeed: 0,
        boss: 0,
        idle: 0,
        hpReduce: 0
    },

    prestigeShop: {
        goldMulti: 0,
        xpMulti: 0,
        offlineTime: 0
    }
};

// =============================
// SAVE SYSTEM
// =============================

function saveGame() {
    game.lastSaveTime = Date.now();
    localStorage.setItem("idleAscensionSave", JSON.stringify({
        version: SAVE_VERSION,
        data: game
    }));
}

function loadGame() {
    let raw = localStorage.getItem("idleAscensionSave");
    if (!raw) return;

    try {
        let parsed = JSON.parse(raw);
        if (parsed.version === SAVE_VERSION) {
            game = parsed.data;
        }
    } catch (e) {
        console.log("Save bozuk, sıfırlanıyor.");
    }
}

function resetSave() {
    localStorage.removeItem("idleAscensionSave");
    location.reload();
}

function manualSave() {
    saveGame();
}

function exportSave() {
    saveGame();
    document.getElementById("saveData").value =
        btoa(JSON.stringify({
            version: SAVE_VERSION,
            data: game
        }));
}

function importSave() {
    try {
        let data = atob(document.getElementById("saveData").value);
        localStorage.setItem("idleAscensionSave", data);
        location.reload();
    } catch {
        alert("Hatalı save");
    }
}

// =============================
// OFFLINE GAIN
// =============================

function handleOffline() {
    let now = Date.now();
    let diff = (now - game.lastSaveTime) / 1000;

    let maxOffline = 7200 + (game.prestigeShop.offlineTime * 3600);
    if (diff > maxOffline) diff = maxOffline;

    let gain = getDPS() * diff;
    game.gold += gain;
}

// =============================
// FORMULAS
// =============================

function getGoldMultiplier() {
    return 1 +
        (game.shops.gold * 0.15) +
        (game.prestigeShop.goldMulti * 0.25) +
        (game.prestigeCount * 0.25);
}

function getXPMultiplier() {
    return 1 +
        (game.shops.xp * 0.15) +
        (game.prestigeShop.xpMulti * 0.25) +
        (game.prestigeCount * 0.25);
}

function getDamage() {
    return (1 + game.shops.damage * 0.15) *
        (1 + game.shops.idle * 0.2);
}

function getDPS() {
    return getDamage() * (1 + game.wave * 0.05);
}

function getEnemyHP() {
    let base = 10 * Math.pow(1.15, game.wave);
    let reduce = Math.min(game.shops.hpReduce * 0.10, 0.70);
    return base * (1 - reduce);
}

function getGoldReward() {
    let base = getEnemyHP() * 0.5;
    return base * getGoldMultiplier();
}

// =============================
// GAME LOOP
// =============================

let lastFrame = 0;
let enemyHP = getEnemyHP();

function update(delta) {

    game.totalPlayTime += delta / 1000;

    let dps = getDPS();
    enemyHP -= dps * (delta / 1000);

    if (enemyHP <= 0) {
        game.gold += getGoldReward();
        game.totalKills++;
        game.wave++;

        enemyHP = getEnemyHP();
    }

    // XP
    game.xp += delta / 1000 * getXPMultiplier();
    if (game.xp >= game.xpToNext) {
        game.level++;
        game.xp = 0;
        game.xpToNext *= 1.2;
    }

    if (game.gold > game.maxGold) game.maxGold = game.gold;
    if (game.level > game.maxLevel) game.maxLevel = game.level;
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // background
    let gradient = ctx.createRadialGradient(
        canvas.width/2,
        canvas.height/2,
        50,
        canvas.width/2,
        canvas.height/2,
        canvas.width
    );
    gradient.addColorStop(0,"#111122");
    gradient.addColorStop(1,"#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // player (center)
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 20, 0, Math.PI*2);
    ctx.fill();

    // enemy hp bar
    ctx.fillStyle="red";
    ctx.fillRect(20, canvas.height/2 - 5, (enemyHP/getEnemyHP())*200,10);
}

function gameLoop(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    let delta = timestamp - lastFrame;

    if (delta >= FRAME_TIME) {
        update(delta);
        draw();
        lastFrame = timestamp;
    }

    requestAnimationFrame(gameLoop);
}

// =============================
// PRESTIGE
// =============================

function tryPrestige() {
    let required = 25 * Math.pow(2, game.prestigeCount);
    if (game.level >= required) {
        game.prestigeCount++;
        game.prestigeCurrency++;

        game.level = 1;
        game.wave = 1;
        game.xp = 0;
        game.gold = 0;
        game.xpToNext = 10;
    }
}

// =============================
// INIT
// =============================

function startGame() {
    document.getElementById("mainMenu").style.display="none";
    loadGame();
    handleOffline();
    setInterval(saveGame,10000);
    requestAnimationFrame(gameLoop);
}

loadGame();