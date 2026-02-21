// game.js - Strategic Scaling Engine
const WORLDS = [
    {id:0, name:"NEON SECTOR", multi:1, synergy: 1.1, color:"#00f2ff", req: 0},
    {id:1, name:"SILICON WASTES", multi:1e12, synergy: 2.5, color:"#ffd700", req: 1e15},
    {id:2, name:"THE GRID CORE", multi:1e24, synergy: 10, color:"#ff0055", req: 1e30}
];

let game = {
    gold: 0, wave: 1, world: 0, prestigeCurrency: 0, prestigeCount: 0, maxWave: 1,
    shops: { damage: 0, gold: 0, speed: 0, crit: 0, double: 0, multiProcess: 0 },
    prestigeShop: { global: 0, auto: 0, multiBonus: 0, worldSync: 0, waveWarp: 0 },
    worldProgress: [0, 0, 0],
    rebootReq: 50 // Her reboot'ta bu sınır artacak
};

let enemyHP = 100, maxHP = 100, rotation = 0;

function getUpgradeCost(key) {
    const base = { damage: 10, gold: 25, speed: 150, crit: 1000, double: 5000, multiProcess: 25000 };
    // Scaling oranını 1.35'e çıkardım (Zorlaştırma)
    return base[key] * Math.pow(1.35, game.shops[key]);
}

function getPrestigeCost(key) {
    const base = { global: 1, auto: 15, multiBonus: 10, worldSync: 25, waveWarp: 50 };
    return base[key] * Math.pow(4, game.prestigeShop[key]); // Prestige dükkanı çok daha zor artar
}

function getDPS() {
    let syncBonus = 1;
    game.worldProgress.forEach((v, i) => syncBonus *= (1 + v * 0.05 * (game.prestigeShop.worldSync + 1)));
    
    let base = (15 + game.shops.damage * 8) * syncBonus;
    let speed = 1 + (game.shops.speed * 0.15);
    let pMult = Math.pow(5, game.prestigeShop.global); // Hasar çarpanı dengelendi
    let multiProc = 1 + (game.shops.multiProcess * 0.5);
    
    return base * speed * pMult * multiProc * WORLDS[game.world].multi;
}

function getEnemyMaxHP() {
    // Düşman canı wave başına daha sert artar
    return 100 * Math.pow(1.3, game.wave) * WORLDS[game.world].multi;
}

function update(delta) {
    let dps = getDPS();
    enemyHP -= dps * (delta / 1000);

    if (enemyHP <= 0) {
        let goldBase = getEnemyMaxHP() * 0.35;
        let goldMult = (1 + game.shops.gold * 0.4) * Math.pow(3, game.prestigeShop.multiBonus);
        let gain = goldBase * goldMult;
        
        if (Math.random() < game.shops.double * 0.04) gain *= 2;
        
        game.gold += gain;
        
        // Wave Warp şansı (Prestige upgrade)
        if (Math.random() < game.prestigeShop.waveWarp * 0.05) game.wave += 2;
        else game.wave++;

        if (game.wave > game.maxWave) game.maxWave = game.wave;
        enemyHP = getEnemyMaxHP();
        maxHP = enemyHP;
    }

    // Auto-Buyer (Idle Mekaniği)
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
    let canvas = document.getElementById("gameCanvas");
    if(!canvas) return;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#020205"; ctx.fillRect(0,0,canvas.width,canvas.height);
    let cx = canvas.width/2, cy = canvas.height/2;

    // Koordinasyon Görseli (Core)
    ctx.strokeStyle = WORLDS[game.world].color;
    ctx.shadowBlur = 15; ctx.shadowColor = ctx.strokeStyle;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotation);
    for(let i=0; i<4; i++) {
        ctx.rotate(Math.PI/2);
        ctx.strokeRect(-60, -60, 120, 120);
        ctx.beginPath(); ctx.arc(0,0, 20 + i*10, 0, Math.PI/2); ctx.stroke();
    }
    ctx.restore();
    ctx.shadowBlur = 0;

    let hpPerc = Math.max(0, enemyHP / maxHP);
    document.getElementById("hpBar").style.width = (hpPerc * 100) + "%";
}

window.onload = () => {
    let canvas = document.getElementById("gameCanvas");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    enemyHP = getEnemyMaxHP(); maxHP = enemyHP;
    setInterval(() => { update(16); draw(); updateUI(); }, 16);
};