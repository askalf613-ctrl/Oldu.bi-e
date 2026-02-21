// game.js - Core + Tüm Sistemler (Save, Offline, Combo, World, Item Drop vs.)
const SAVE_VERSION = 9;

const WORLDS = [
    {id:0, name:"🌍 Earth", multi:1, unlockLevel:1, color:"#44ff44"},
    {id:1, name:"🔥 Inferno", multi:5, unlockLevel:80, color:"#ff4444"},
    {id:2, name:"🌌 Void", multi:25, unlockLevel:300, color:"#aa44ff"}
];

let game = {
    gold: 0,
    level: 1,
    wave: 1,
    world: 0,
    xp: 0,
    xpToNext: 10,
    prestigeCount: 0,
    prestigeCurrency: 0,
    combo: 0,
    comboTimer: 0,
    shops: {damage:0, gold:0, xp:0, crit:0, critDmg:0, attackSpeed:0, hpReduce:0, idle:0, waveGold:0},
    prestigeShop: {goldMulti:0, xpMulti:0, permDamage:0},
    inventory: [],
    lastSaveTime: Date.now()
};

let enemyHP = 100;
let particles = [];
let lastFrame = 0;
let canvas, ctx;

function getGoldMulti() {
    return 1 + game.shops.gold*0.18 + game.prestigeShop.goldMulti*0.35 + game.prestigeCount*0.3 + 
           WORLDS[game.world].multi*0.4 + game.shops.waveGold*0.12*game.wave;
}

function getDamage() {
    return 12 * (1 + game.shops.damage*0.22 + game.shops.idle*0.25 + game.prestigeShop.permDamage*0.8) * (1 + game.combo*0.15);
}

function getDPS() {
    let base = getDamage();
    let critChance = 0.06 + game.shops.crit*0.03;
    let critMulti = 2 + game.shops.critDmg*0.4;
    let attackSpeed = 1 + game.shops.attackSpeed*0.12;
    return (base * (1-critChance) + base * critMulti * critChance) * attackSpeed * (1 + game.wave*0.04);
}

function getEnemyHP() {
    let base = 18 * Math.pow(1.12, game.wave);
    let reduce = Math.min(game.shops.hpReduce * 0.085, 0.72);
    return base * (1 - reduce) * (1 + game.world * 0.5);
}

function getGoldReward() {
    return Math.floor(getEnemyHP() * 0.65 * getGoldMulti());
}

function saveGame() {
    game.lastSaveTime = Date.now();
    localStorage.setItem("idleAscension_v9", JSON.stringify({version: SAVE_VERSION, data: game}));
}

function loadGame() {
    let raw = localStorage.getItem("idleAscension_v9");
    if (raw) {
        try {
            let parsed = JSON.parse(raw);
            if (parsed.version === SAVE_VERSION) game = parsed.data;
        } catch(e) {}
    }
}

function handleOffline() {
    let now = Date.now();
    let diff = (now - game.lastSaveTime) / 1000;
    let maxOffline = 7200 + game.prestigeShop.goldMulti * 3600;
    if (diff > maxOffline) diff = maxOffline;
    let gain = getDPS() * diff * 0.6;
    game.gold += Math.floor(gain);
}

function handleClick(x, y) {
    let cx = canvas.width / 2 + 140;
    let cy = canvas.height / 2;
    if (Math.hypot(x - cx, y - cy) < 65) {
        enemyHP -= getDamage() * 6;
        game.combo = Math.min(game.combo + 1, 20);
        game.comboTimer = 120;
        particles.push({x, y, text: "-" + Math.floor(getDamage()*6), life: 35, color: "#ff0"});
    }
}

function update(delta) {
    game.comboTimer = Math.max(0, game.comboTimer - 1);
    if (game.comboTimer === 0) game.combo = 0;

    enemyHP -= getDPS() * (delta / 1000);

    if (enemyHP <= 0) {
        let reward = getGoldReward();
        game.gold += reward;
        game.wave++;
        game.xp += 15 * (1 + game.shops.xp * 0.15);
        while (game.xp >= game.xpToNext) {
            game.level++;
            game.xp -= game.xpToNext;
            game.xpToNext = Math.floor(game.xpToNext * 1.22);
        }
        enemyHP = getEnemyHP();

        particles.push({x: canvas.width/2 + 160, y: canvas.height/2 - 40, text: "+" + format(reward), life: 70, color: "#ff0"});

        if (Math.random() < 0.28) {
            let item = {
                name: ["Kılıç","Balta","Hançer","Mızrak"][Math.floor(Math.random()*4)],
                stat: "damage",
                value: 1.2 + Math.random() * 3.5,
                rarity: Math.random() < 0.15 ? "Rare" : "Common"
            };
            game.inventory.push(item);
            particles.push({x: canvas.width/2, y: canvas.height/2 - 80, text: "ITEM DROP!", life: 50, color: "#0f0"});
        }
    }
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let cx = canvas.width/2, cy = canvas.height/2;

    let grad = ctx.createRadialGradient(cx,cy,50,cx,cy,Math.max(canvas.width,canvas.height));
    grad.addColorStop(0, WORLDS[game.world].color + "22");
    grad.addColorStop(1, "#000011");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Player + Kılıç
    ctx.fillStyle = "#0ff";
    ctx.shadowBlur = 25; ctx.shadowColor = "#0ff";
    ctx.beginPath(); ctx.arc(cx-120,cy,34,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(cx-145,cy-20); ctx.lineTo(cx-75,cy+30); ctx.stroke();

    // Enemy
    ctx.fillStyle = "#c22";
    ctx.shadowBlur = 15; ctx.shadowColor = "#f00";
    ctx.beginPath(); ctx.arc(cx+140,cy,52,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillRect(cx+120,cy-15,14,14); ctx.fillRect(cx+155,cy-15,14,14);
    ctx.fillStyle = "#000"; ctx.fillRect(cx+123,cy-12,8,8); ctx.fillRect(cx+158,cy-12,8,8);

    // HP Bar
    let hpP = Math.max(0, enemyHP / getEnemyHP());
    ctx.fillStyle = "#111"; ctx.fillRect(cx+70,cy-95,240,28);
    ctx.fillStyle = hpP > 0.4 ? "#0f0" : "#f00";
    ctx.fillRect(cx+70,cy-95,240*hpP,28);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.strokeRect(cx+70,cy-95,240,28);
    ctx.fillStyle = "#fff"; ctx.font = "bold 18px Arial"; ctx.fillText("Wave " + game.wave, cx+80, cy-73);

    // Particles
    for (let i = particles.length-1; i >= 0; i--) {
        let p = particles[i];
        ctx.globalAlpha = p.life / 60;
        ctx.fillStyle = p.color;
        ctx.font = p.text.includes("ITEM") ? "bold 26px Arial" : "bold 22px Arial";
        ctx.fillText(p.text, p.x, p.y);
        p.y -= 1.8;
        p.life--;
        if (p.life <= 0) particles.splice(i,1);
    }
    ctx.globalAlpha = 1;
}

function gameLoop(ts) {
    if (!lastFrame) lastFrame = ts;
    let delta = ts - lastFrame;
    if (delta > 16) {
        update(delta);
        draw();
        lastFrame = ts;
    }
    requestAnimationFrame(gameLoop);
}

window.onload = () => {
    loadGame();
    handleOffline();
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    window.addEventListener("resize", () => {canvas.width = innerWidth; canvas.height = innerHeight;});
    canvas.addEventListener("click", e => {
        let r = canvas.getBoundingClientRect();
        handleClick(e.clientX - r.left, e.clientY - r.top);
    });
    setInterval(saveGame, 8000);
    requestAnimationFrame(gameLoop);
};

function format(n) {
    if (n >= 1e9) return (n/1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n/1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n/1e3).toFixed(1) + "K";
    return Math.floor(n);
}