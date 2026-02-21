// ui.js - Interface Controller
function updateUI() {
    document.getElementById("goldText").innerText = format(game.gold);
    document.getElementById("levelText").innerText = game.level;
    document.getElementById("waveText").innerText = game.wave;
    document.getElementById("dpsText").innerText = format(getDPS());
    document.getElementById("speedText").innerText = Math.floor((1 + game.shops.speed * 0.1) * 100);
    
    let xpPercent = (game.xp / game.xpToNext) * 100;
    document.getElementById("xpBar").style.width = xpPercent + "%";
}
setInterval(updateUI, 100);

function openModal(id) {
    document.getElementById(id).style.display = "flex";
    if(id === "goldShop") renderGoldShop();
    if(id === "prestigeShop") renderPrestigeShop();
    if(id === "worldModal") renderWorlds();
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }

function renderGoldShop() {
    const upgrades = [
        {id: "damage", name: "Laser Power", desc: "Base damage artışı"},
        {id: "gold", name: "Data Mine", desc: "Altın kazanma çarpanı"},
        {id: "speed", name: "Overclock", desc: "Saldırı hızı artışı"},
        {id: "crit", name: "Critical Error", desc: "Kritik vuruş şansı"},
    ];
    let html = "";
    upgrades.forEach(u => {
        let cost = getUpgradeCost(u.id);
        html += `
        <div class="shop-item">
            <div><b>${u.name}</b> (Lv.${game.shops[u.id]})<br><small>${u.desc}</small></div>
            <button class="btn" onclick="buyUpgrade('${u.id}')">${format(cost)} TB</button>
        </div>`;
    });
    document.getElementById("goldShopContent").innerHTML = html;
}

function buyUpgrade(id) {
    let cost = getUpgradeCost(id);
    if (game.gold >= cost) {
        game.gold -= cost;
        game.shops[id]++;
        if(document.getElementById("goldShop").style.display === "flex") renderGoldShop();
    }
}

function renderPrestigeShop() {
    let prestigeGain = Math.floor(game.level / 20);
    let html = `<div style="text-align:center; margin-bottom:20px;">
        <h2 style="color:var(--neon-pink)">PRESTIGE CORES: ${game.prestigeCurrency}</h2>
        <p>Reset atarsan kazanacağın: +${prestigeGain}</p>
    </div>`;

    html += `
    <div class="shop-item">
        <div><b>Global Multiplier</b><br><small>Tüm hasarı %50 katlar</small></div>
        <button class="btn btn-prestige" onclick="buyPrestige('globalMulti', 1)">1 Core</button>
    </div>
    <div class="shop-item">
        <div><b>Auto-Buyer System</b><br><small>Geliştirmeleri otomatik alır</small></div>
        <button class="btn btn-prestige" onclick="buyPrestige('autoBuyerLevel', 5)">5 Cores</button>
    </div>`;
    
    document.getElementById("prestigeShopContent").innerHTML = html;
}

function buyPrestige(id, cost) {
    if (game.prestigeCurrency >= cost) {
        game.prestigeCurrency -= cost;
        game.prestigeShop[id]++;
        renderPrestigeShop();
    }
}

function tryPrestige() {
    let gain = Math.floor(game.level / 20);
    if (gain < 1) {
        alert("Prestige için en az 20 Level lazım!");
        return;
    }
    if (confirm("Tüm altın ve geliştirmeler sıfırlanacak. Hazır mısın?")) {
        game.prestigeCurrency += gain;
        game.prestigeCount++;
        game.gold = 0;
        game.level = 1;
        game.wave = 1;
        game.xp = 0;
        game.shops = { damage: 0, gold: 0, speed: 0, crit: 0, idle: 0 };
        spawnEnemy();
    }
}

function renderWorlds() {
    let html = "";
    WORLDS.forEach(w => {
        let locked = game.level < w.unlockLevel;
        html += `
        <div class="shop-item" style="border-color:${w.color}; opacity:${locked ? 0.5 : 1}">
            <div><b style="color:${w.color}">${w.name}</b><br><small>${w.multi}x Multiplier</small></div>
            <button class="btn" ${locked ? 'disabled' : `onclick="game.world=${w.id};closeModal('worldModal')"`}>
                ${locked ? 'LOCKED (Lv.'+w.unlockLevel+')' : 'CONNECT'}
            </button>
        </div>`;
    });
    document.getElementById("worldContent").innerHTML = html;
}