// game.js - Tüm Core + Yeni Özellikler
const SAVE_VERSION = 7;

const WORLDS = [
    {id:0, name:"Earth", multi:1, unlock:1, color:"#44ff44"},
    {id:1, name:"Inferno", multi:5, unlock:80, color:"#ff4444"},
    {id:2, name:"Void", multi:25, unlock:300, color:"#aa44ff"}
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
    clickCombo: 0,
    comboTimer: 0,
    shops: {damage:0, gold:0, xp:0, crit:0, critDmg:0, attackSpeed:0, hpReduce:0, idle:0, waveGold:0},
    prestigeShop: {goldMulti:0, xpMulti:0, permDamage:0},
    lastSaveTime: Date.now()
};

let enemyHP = 100;
let particles = [];
let lastFrame = 0;
let canvas, ctx;

function getGoldMulti() {
    return 1 + game.shops.gold*0.18 + game.prestigeShop.goldMulti*0.35 + game.prestigeCount*0.3 + WORLDS[game.world].multi*0.4 + game.shops.waveGold*0.1*game.wave;
}

function getDamage() {
    return 10 * (1 + game.shops.damage*0.22 + game.prestigeShop.permDamage*0.5) * (1 + game.shops.idle*0.25) * (1 + game.clickCombo*0.12);
}

function getDPS() {
    let base = getDamage();
    let crit = 0.05 + game.shops.crit*0.03;
    let critMulti = 2 + game.shops.critDmg*0.4;
    let as = 1 + game.shops.attackSpeed*0.12;
    return (base*(1-crit) + base*critMulti*crit) * as * (1 + game.wave*0.05);
}

function getEnemyHP() {
    let base = 15 * Math.pow(1.13, game.wave);
    let reduce = Math.min(game.shops.hpReduce * 0.09, 0.75);
    return base * (1 - reduce) * (1 + game.world * 0.6);
}

function getGoldReward() {
    return Math.floor(getEnemyHP() * 0.6 * getGoldMulti());
}

function tryPrestige() {
    if (game.level >= 15 + game.prestigeCount * 8) {
        if (confirm("Prestige yapacak mısın?")) {
            game.prestigeCurrency += 1 + Math.floor(game.prestigeCount/2);
            game.prestigeCount++;
            game.level = 1; game.wave = 1; game.xp = 0; game.gold = Math.floor(game.gold*0.3);
            game.shops = {damage:0,gold:0,xp:0,crit:0,critDmg:0,attackSpeed:0,hpReduce:0,idle:0,waveGold:0};
        }
    } else alert(`Prestige için ${15 + game.prestigeCount*8} level lazım`);
}

function changeWorld(newW) {
    if (game.level >= WORLDS[newW].unlock) {
        game.world = newW;
        alert(WORLDS[newW].name + " dünyasına geçtin!");
        renderWorlds();
    }
}

function handleClick(x, y) {
    let cx = canvas.width/2 + 130;
    let cy = canvas.height/2;
    if (Math.hypot(x-cx, y-cy) < 70) {
        enemyHP -= getDamage() * 5;
        game.clickCombo = Math.min(game.clickCombo + 1, 15);
        game.comboTimer = 180; // 3 saniye
        particles.push({x, y, text:"+" + Math.floor(getDamage()*5), life:30, color:"#ff0"});
    }
}

function update(delta) {
    game.comboTimer = Math.max(0, game.comboTimer - 1);
    if (game.comboTimer === 0) game.clickCombo = 0;

    enemyHP -= getDPS() * (delta/1000);

    if (enemyHP <= 0) {
        game.gold += getGoldReward();
        game.wave++;
        game.xp += 12 * (1 + game.shops.xp*0.15);
        if (game.xp >= game.xpToNext) {
            game.level++;
            game.xp = 0;
            game.xpToNext *= 1.22;
        }
        enemyHP = getEnemyHP();
    }
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let cx = canvas.width/2, cy = canvas.height/2;

    let grad = ctx.createRadialGradient(cx,cy,30,cx,cy,900);
    grad.addColorStop(0, WORLDS[game.world].color + "33");
    grad.addColorStop(1, "#000011");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Player
    ctx.fillStyle = "#0ff";
    ctx.shadowBlur = 30;
    ctx.shadowColor = "#0ff";
    ctx.beginPath(); ctx.arc(cx-110,cy,33,0,Math.PI*2); ctx.fill();

    // Enemy
    let hpP = Math.max(0, enemyHP/getEnemyHP());
    ctx.fillStyle = "#c22";
    ctx.beginPath(); ctx.arc(cx+130,cy,50,0,Math.PI*2); ctx.fill();

    ctx.fillStyle = "#222";
    ctx.fillRect(cx+70,cy-85,200,20);
    ctx.fillStyle = hpP>0.5?"#0f0":"#f00";
    ctx.fillRect(cx+70,cy-85,200*hpP,20);

    // Particles
    for (let i=particles.length-1;i>=0;i--) {
        let p = particles[i];
        ctx.globalAlpha = p.life/30;
        ctx.fillStyle = p.color;
        ctx.font = "bold 20px Arial";
        ctx.fillText(p.text, p.x, p.y);
        p.y -= 1.5;
        p.life--;
        if (p.life<=0) particles.splice(i,1);
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
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    window.addEventListener("resize", ()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
    canvas.addEventListener("click", e => {
        let rect = canvas.getBoundingClientRect();
        handleClick(e.clientX - rect.left, e.clientY - rect.top);
    });
    requestAnimationFrame(gameLoop);
};