// game.js
const WORLDS = [
    {id:0, name:"NEON SUBURBS", multi:1, color:"#00f2ff"},
    {id:1, name:"THE MAINFRAME", multi:50, color:"#ff00ff"},
    {id:2, name:"VOID PROTOCOL", multi:1000, color:"#39ff14"}
];

let game = {
    gold: 0, level: 1, wave: 1, world: 0, xp: 0, xpToNext: 100,
    prestigeCurrency: 0, prestigeCount: 0, maxWave: 1,
    shops: { damage: 0, gold: 0, speed: 0, crit: 0 },
    prestigeShop: { 
        globalMulti: 0, 
        autoBuyer: 0, 
        timeWarp: 0,   // OYUN HIZI ARTIRICI
        doubleDrop: 0, // 2X ALTIN ŞANSI
        blackMarket: 0 // KALICI HASAR ÇARPANI
    }
};

let enemyHP = 100;
let bossTimer = 30;
let isBoss = false;
let canvas, ctx;
let rotation = 0;
let matrixParticles = [];

function getUpgradeCost(key) {
    const base = { damage: 10, gold: 25, speed: 100, crit: 500 };
    return Math.floor(base[key] * Math.pow(1.15, game.shops[key]));
}

function getPrestigeCost(key) {
    const base = { globalMulti: 1, autoBuyer: 10, timeWarp: 5, doubleDrop: 8, blackMarket: 15 };
    return Math.floor(base[key] * Math.pow(2.2, game.prestigeShop[key]));
}

function getDPS() {
    // İllegal geliştirmeler hasarı devasa artırır
    let pMulti = Math.pow(3, game.prestigeShop.globalMulti);
    let bmMulti = 1 + (game.prestigeShop.blackMarket * 2);
    let base = 15 * (1 + game.shops.damage * 0.4) * pMulti * bmMulti;
    
    let speed = (1 + game.shops.speed * 0.15) * (1 + game.prestigeShop.timeWarp * 0.5);
    let critChance = Math.min(0.9, 0.05 + game.shops.crit * 0.03);
    
    return base * speed * (1 + critChance * 5) * WORLDS[game.world].multi;
}

function update(delta) {
    // Oyun hızı (Time Warp) delta'yı etkiler
    let speedFactor = 1 + (game.prestigeShop.timeWarp * 0.2);
    let actualDelta = delta * speedFactor;

    enemyHP -= getDPS() * (actualDelta / 1000);
    rotation += 0.03 * speedFactor;

    if (isBoss) {
        bossTimer -= actualDelta / 1000;
        if (bossTimer <= 0) { game.wave--; spawnEnemy(); }
    }

    if (enemyHP <= 0) {
        let goldGain = getEnemyMaxHP() * 0.5 * (1 + game.shops.gold * 0.3);
        // Double Drop Şansı
        if (Math.random() < game.prestigeShop.doubleDrop * 0.1) goldGain *= 2;
        
        game.gold += Math.floor(goldGain);
        game.xp += 30;
        if (game.xp >= game.xpToNext) { game.level++; game.xp = 0; game.xpToNext *= 1.3; }
        
        game.wave++;
        if (game.wave > game.maxWave) game.maxWave = game.wave;
        spawnEnemy();
    }

    // Auto Buyer
    if (game.prestigeShop.autoBuyer > 0) {
        for (let k in game.shops) if (game.gold >= getUpgradeCost(k)) buyUpgrade(k);
    }
}

function getEnemyMaxHP() {
    return 80 * Math.pow(1.18, game.wave);
}

function spawnEnemy() {
    isBoss = game.wave % 10 === 0;
    bossTimer = 30;
    enemyHP = isBoss ? getEnemyMaxHP() * 8 : getEnemyMaxHP();
}

// Matrix Arka Plan Efekti
function drawMatrix() {
    if (matrixParticles.length < 50) {
        matrixParticles.push({ x: Math.random()*canvas.width, y: -20, s: Math.random()*3+1 });
    }
    ctx.fillStyle = "rgba(0, 255, 0, 0.15)";
    ctx.font = "10px monospace";
    matrixParticles.forEach((p, i) => {
        ctx.fillText(Math.random() > 0.5 ? "1" : "0", p.x, p.y);
        p.y += p.s;
        if (p.y > canvas.height) matrixParticles.splice(i, 1);
    });
}

function draw() {
    ctx.fillStyle = "#020205";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix();

    let cx = canvas.width/2, cy = canvas.height/2;

    // Cyber Core (Gelişmiş)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    
    for(let i=0; i<4; i++) {
        ctx.strokeStyle = i % 2 === 0 ? var(--neon-blue) : var(--neon-pink);
        ctx.lineWidth = 2;
        ctx.rotate(Math.PI / 2);
        ctx.shadowBlur = 20;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.strokeRect(-70 - i*5, -70 - i*5, 140 + i*10, 140 + i*10);
    }
    ctx.restore();

    // HP Bar UI
    let perc = Math.max(0, enemyHP / (isBoss ? getEnemyMaxHP()*8 : getEnemyMaxHP()));
    ctx.fillStyle = "#111"; ctx.fillRect(cx - 200, cy + 150, 400, 15);
    ctx.fillStyle = isBoss ? var(--neon-pink) : var(--neon-blue);
    ctx.fillRect(cx - 200, cy + 150, 400 * perc, 15);
}

const var = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

window.onload = () => {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    spawnEnemy();
    requestAnimationFrame(function loop(ts) {
        update(16); draw(); requestAnimationFrame(loop);
    });
};