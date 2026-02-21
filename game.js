// game.js
const WORLDS = [
    {id:0, name:"NEON CITY", multi:1, synergy: 1, color:"#00f2ff", req: 0},
    {id:1, name:"BIT-DESERT", multi:1e8, synergy: 5, color:"#ffd700", req: 1e12},
    {id:2, name:"SILICON HELL", multi:1e18, synergy: 25, color:"#ff0000", req: 1e25}
];

let game = {
    gold: 0, wave: 1, world: 0, prestigeCurrency: 0, prestigeCount: 0, maxWave: 1,
    shops: { damage: 0, gold: 0, speed: 0, crit: 0, double: 0 },
    prestigeShop: { global: 0, auto: 0, multiplierBonus: 0, worldSynergy: 0 },
    worldProgress: [0, 0, 0],
    lastSave: Date.now()
};

let enemyHP = 100, maxHP = 100, rotation = 0;

function getUpgradeCost(key) {
    const base = { damage: 10, gold: 20, speed: 100, crit: 500, double: 2000 };
    return base[key] * Math.pow(1.15, game.shops[key]);
}

function getPrestigeCost(key) {
    const base = { global: 1, auto: 10, multiplierBonus: 5, worldSynergy: 20 };
    return base[key] * Math.pow(3, game.prestigeShop[key]);
}

function getDPS() {
    let synergy = 1;
    game.worldProgress.forEach((v, i) => synergy *= (1 + v * 0.1 * (game.prestigeShop.worldSynergy + 1)));
    let base = (10 + game.shops.damage * 5) * synergy;
    let speed = 1 + (game.shops.speed * 0.2);
    let pMult = Math.pow(10, game.prestigeShop.global);
    return base * speed * pMult * WORLDS[game.world].multi;
}

function getEnemyMaxHP() {
    return 100 * Math.pow(1.2, game.wave) * WORLDS[game.world].multi;
}

function update(delta) {
    let dps = getDPS();
    enemyHP -= dps * (delta / 1000);

    if (enemyHP <= 0) {
        let gain = getEnemyMaxHP() * 0.5 * (1 + game.shops.gold * 0.5) * Math.pow(2, game.prestigeShop.multiplierBonus);
        if (Math.random() < game.shops.double * 0.05) gain *= 2;
        game.gold += gain;
        game.wave++;
        if (game.wave > game.maxWave) game.maxWave = game.wave;
        enemyHP = getEnemyMaxHP();
        maxHP = enemyHP;
    }

    if (game.prestigeShop.auto > 0) {
        for(let k in game.shops) {
            let c = getUpgradeCost(k);
            if(game.gold >= c) { game.gold -= c; game.shops[k]++; game.worldProgress[game.world]++; }
        }
    }
    rotation += 0.02;
}

function draw() {
    let canvas = document.getElementById("gameCanvas");
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#020205"; ctx.fillRect(0,0,canvas.width,canvas.height);
    let cx = canvas.width/2, cy = canvas.height/2;

    ctx.strokeStyle = WORLDS[game.world].color; ctx.lineWidth = 2;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotation);
    for(let i=0; i<3; i++) { ctx.rotate(Math.PI/1.5); ctx.strokeRect(-50, -50, 100, 100); }
    ctx.restore();

    let hpPerc = Math.max(0, enemyHP / maxHP);
    document.getElementById("hpBar").style.width = (hpPerc * 100) + "%";
}

window.onload = () => {
    let canvas = document.getElementById("gameCanvas");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    enemyHP = getEnemyMaxHP(); maxHP = enemyHP;
    setInterval(() => { update(16); draw(); updateUI(); }, 16);
};