// game.js
const WORLDS = [
    {id:0, name:"NEON SECTOR", multi:1, synergy: 1.1, color:"#00f2ff", req: 0},
    {id:1, name:"SILICON WASTES", multi:1e12, synergy: 2.0, color:"#ffd700", req: 1e15},
    {id:2, name:"THE GRID CORE", multi:1e30, synergy: 5.0, color:"#ff0055", req: 1e35},
    {id:3, name:"VOID SINGULARITY", multi:1e70, synergy: 20, color:"#ffffff", req: 1e80}
];

let game = {
    gold: 0, wave: 1, world: 0, prestigeCurrency: 0, prestigeCount: 0, maxWave: 1,
    shops: { damage: 0, gold: 0, speed: 0, crit: 0, double: 0 },
    prestigeShop: { global: 0, auto: 0, worldSync: 0 },
    worldProgress: [0, 0, 0, 0],
    rebootReq: 50
};

let enemyHP = 100, maxHP = 100, rotation = 0;

function getUpgradeCost(key) {
    const base = { damage: 10, gold: 20, speed: 100, crit: 500, double: 2000 };
    return base[key] * Math.pow(1.45, game.shops[key]); // 300 saatlik scaling
}

function getPrestigeCost(key) {
    const base = { global: 1, auto: 10, worldSync: 20 };
    return base[key] * Math.pow(4, game.prestigeShop[key]);
}

function getDPS() {
    let synergy = 1;
    game.worldProgress.forEach((v, i) => synergy *= (1 + v * 0.01 * (game.prestigeShop.worldSync + 1)));
    let base = (10 + game.shops.damage * 8) * synergy;
    let pMult = Math.pow(10, game.prestigeShop.global);
    return base * pMult * (1 + game.shops.speed * 0.15) * WORLDS[game.world].multi;
}

function getEnemyMaxHP() {
    return 100 * Math.pow(1.3, game.wave) * WORLDS[game.world].multi;
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
    document.getElementById("hpBar").style.width = (Math.max(0, enemyHP / maxHP) * 100) + "%";
}

window.onload = () => {
    let canvas = document.getElementById("gameCanvas");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    enemyHP = getEnemyMaxHP(); maxHP = enemyHP;
    setInterval(() => { update(16); draw(); updateUI(); }, 16);
};