// game.js - Cyber Engine
const SAVE_VERSION = 11;

const WORLDS = [
    {id:0, name:"NEON CITY", multi:1, unlockLevel:1, color:"#00f2ff"},
    {id:1, name:"CYBER CORE", multi:15, unlockLevel:100, color:"#ff00ff"},
    {id:2, name:"THE VOID NET", multi:200, unlockLevel:500, color:"#7000ff"}
];

let game = {
    gold: 0,
    level: 1,
    wave: 1,
    world: 0,
    xp: 0,
    xpToNext: 100,
    prestigeCurrency: 0,
    prestigeCount: 0,
    // A: Auto-Buyer kontrolü
    autoBuyerActive: false,
    shops: { damage: 0, gold: 0, speed: 0, crit: 0, idle: 0 },
    prestigeShop: { globalMulti: 0, autoBuyerLevel: 0, startWave: 0 },
    lastSaveTime: Date.now()
};

let enemyHP = 100;
let bossTimer = 0;
let isBoss = false;
let particles = [];
let canvas, ctx;

// Üstel Fiyat Hesaplama (Exponential Scaling)
function getUpgradeCost(key) {
    const baseCosts = { damage: 10, gold: 15, speed: 50, crit: 100, idle: 200 };
    const scales = { damage: 1.15, gold: 1.16, speed: 1.2, crit: 1.3, idle: 1.25 };
    return Math.floor(baseCosts[key] * Math.pow(scales[key], game.shops[key]));
}

function getDamage() {
    let base = 5 * (1 + game.shops.damage * 0.25) * Math.pow(1.5, game.prestigeShop.globalMulti);
    return base * WORLDS[game.world].multi;
}

function getDPS() {
    let critChance = Math.min(0.8, 0.05 + game.shops.crit * 0.02);
    let attackSpeed = 1 + game.shops.speed * 0.1;
    let baseDmg = getDamage();
    return baseDmg * (1 + critChance * 2) * attackSpeed;
}

function getEnemyMaxHP() {
    let base = 50 * Math.pow(1.14, game.wave);
    if (game.wave % 10 === 0) return base * 5; // Boss HP
    return base;
}

function spawnEnemy() {
    isBoss = game.wave % 10 === 0;
    if (isBoss) {
        bossTimer = 30 * 60; // 30 saniye (60fps)
        document.getElementById("bossTimerContainer").style.display = "block";
    } else {
        document.getElementById("bossTimerContainer").style.display = "none";
    }
    enemyHP = getEnemyMaxHP();
}

function update(delta) {
    // Otomatik Hasar
    let dps = getDPS();
    enemyHP -= dps * (delta / 1000);

    // Boss Zaman Kontrolü
    if (isBoss) {
        bossTimer--;
        let percent = (bossTimer / (30 * 60)) * 100;
        document.getElementById("bossTimerBar").style.width = percent + "%";
        if (bossTimer <= 0) {
            game.wave -= 1; // Boss geçilemedi, geri çekil
            spawnEnemy();
        }
    }

    // Düşman Ölümü
    if (enemyHP <= 0) {
        let reward = Math.floor(getEnemyMaxHP() * 0.5 * (1 + game.shops.gold * 0.2));
        game.gold += reward;
        game.xp += 20;
        
        if (game.xp >= game.xpToNext) {
            game.level++;
            game.xp = 0;
            game.xpToNext = Math.floor(game.xpToNext * 1.2);
        }

        game.wave++;
        spawnEnemy();
        createExplosion();
    }

    // A: Auto-Buyer Mantığı
    if (game.prestigeShop.autoBuyerLevel > 0) {
        let keys = Object.keys(game.shops);
        keys.forEach(k => {
            if (game.gold >= getUpgradeCost(k)) {
                buyUpgrade(k);
            }
        });
    }
}

function createExplosion() {
    for(let i=0; i<8; i++) {
        particles.push({
            x: canvas.width/2 + 150, y: canvas.height/2,
            vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
            life: 30, color: WORLDS[game.world].color
        });
    }
}

function draw() {
    ctx.fillStyle = "#05050a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let cx = canvas.width/2;
    let cy = canvas.height/2;

    // Grid Arka Plan
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=50) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let i=0; i<canvas.height; i+=50) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke(); }

    // Düşman Çizimi (Cyber Sphere)
    ctx.shadowBlur = isBoss ? 30 : 15;
    ctx.shadowColor = isBoss ? "#ff00ff" : WORLDS[game.world].color;
    ctx.fillStyle = ctx.shadowColor;
    ctx.beginPath();
    ctx.arc(cx + 150, cy, isBoss ? 70 : 50, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Parçacıklar
    particles.forEach((p, i) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
        p.x += p.vx; p.y += p.vy; p.life--;
        if(p.life <= 0) particles.splice(i, 1);
    });
}

function gameLoop(ts) {
    let delta = ts - (window.lastTs || ts);
    window.lastTs = ts;
    update(delta);
    draw();
    requestAnimationFrame(gameLoop);
}

window.onload = () => {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    spawnEnemy();
    requestAnimationFrame(gameLoop);
};

function format(n) {
    if (n >= 1e12) return (n/1e12).toFixed(2) + "Q";
    if (n >= 1e9) return (n/1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n/1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n/1e3).toFixed(1) + "K";
    return Math.floor(n);
}