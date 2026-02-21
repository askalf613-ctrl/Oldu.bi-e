// game.js - Multiverse Engine
const WORLDS = [
    {id:0, name:"NEON CITY", multi:1, synergy: 1, color:"#00f2ff", req: 0},
    {id:1, name:"BIT-DESERT", multi:1e10, synergy: 5, color:"#ffd700", req: 1e15},
    {id:2, name:"SILICON HELL", multi:1e25, synergy: 25, color:"#ff0000", req: 1e30},
    {id:3, name:"THE SINGULARITY", multi:1e50, synergy: 1000, color:"#ffffff", req: 1e60}
];

let game = {
    gold: 0, wave: 1, world: 0, 
    prestigeCurrency: 0, prestigeCount: 0, maxWave: 1,
    shops: { damage: 0, gold: 0, speed: 0, crit: 0, double: 0 },
    prestigeShop: { global: 0, auto: 0, multiplierBonus: 0, worldSynergy: 0 },
    worldProgress: [0, 0, 0, 0], // Her dünyada kaç geliştirme yapıldığı
    lastSave: Date.now()
};

let enemyHP = 100, maxEnemyHP = 100;
let canvas, ctx, rotation = 0;

function getUpgradeCost(key) {
    const base = { damage: 10, gold: 15, speed: 100, crit: 1000, double: 5000 };
    const rate = { damage: 1.14, gold: 1.15, speed: 1.25, crit: 1.4, double: 1.5 };
    return base[key] * Math.pow(rate[key], game.shops[key]);
}

function getPrestigeCost(key) {
    const base = { global: 1, auto: 10, multiplierBonus: 5, worldSynergy: 20 };
    return base[key] * Math.pow(2.5, game.prestigeShop[key]);
}

function getDPS() {
    // Sinerji: Diğer dünyalardaki ilerlemen ana hasarını çarpar!
    let synergyBonus = 1;
    game.worldProgress.forEach((lv, idx) => synergyBonus *= (1 + lv * WORLDS[idx].synergy));
    
    let base = 5 * (1 + game.shops.damage * 0.5) * synergyBonus;
    let pMult = Math.pow(10, game.prestigeShop.global);
    let speed = (1 + game.shops.speed * 0.2);
    let crit = 1 + (Math.min(0.8, game.shops.crit * 0.02) * 5);
    
    return base * pMult * speed * crit * WORLDS[game.world].multi;
}

function getEnemyMaxHP() {
    return 100 * Math.pow(1.25, game.wave) * WORLDS[game.world].multi;
}

function update(delta) {
    let dps = getDPS();
    enemyHP -= dps * (delta / 1000);

    if (enemyHP <= 0) {
        let gain = getEnemyMaxHP() * 0.4 * (1 + game.shops.gold * 0.4);
        if (Math.random() < game.shops.double * 0.05) gain *= 2;
        game.gold += gain;
        game.wave++;
        if (game.wave > game.maxWave) game.maxWave = game.wave;
        enemyHP = getEnemyMaxHP();
        maxEnemyHP = enemyHP;
    }

    // Auto Buyer (Gerçek Idle)
    if (game.prestigeShop.auto > 0) {
        for(let k in game.shops) {
            let cost = getUpgradeCost(k);
            if(game.gold >= cost) {
                game.gold -= cost;
                game.shops[k]++;
                game.worldProgress[game.world]++;
            }
        }
    }
    rotation += 0.02;
}

function draw() {
    ctx.fillStyle = "#020205";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    let cx = canvas.width/2, cy = canvas.height/2;

    // Boss Aura
    ctx.shadowBlur = 20;
    ctx.shadowColor = WORLDS[game.world].color;
    ctx.strokeStyle = WORLDS[game.world].color;
    ctx.lineWidth = 2;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    for(let i=0; i<3; i++) {
        ctx.rotate(Math.PI/1.5);
        ctx.strokeRect(-60, -60, 120, 120);
    }
    ctx.restore();

    // HP Bar Update
    let perc = Math.max(0, enemyHP / maxEnemyHP);
    document.getElementById("hpBar").style.width = (perc * 100) + "%";
}

window.onload = () => {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    enemyHP = getEnemyMaxHP();
    maxEnemyHP = enemyHP;
    requestAnimationFrame(function loop(ts){
        update(16); draw(); requestAnimationFrame(loop);
    });
};