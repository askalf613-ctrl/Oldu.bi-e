// ui.js
function updateUI() {
    document.getElementById("goldText").innerText = format(game.gold);
    document.getElementById("waveText").innerText = game.wave;
    document.getElementById("levelText").innerText = game.level;
    document.getElementById("dpsText").innerText = format(getDPS());
    document.getElementById("xpBar").style.width = (game.xp / game.xpToNext * 100) + "%";
    
    if (isBoss) {
        document.getElementById("bossContainer").style.display = "block";
        document.getElementById("bossBar").style.width = (bossTimer / 30 * 100) + "%";
    } else {
        document.getElementById("bossContainer").style.display = "none";
    }
}
setInterval(updateUI, 100);

function renderGoldShop() {
    let html = "";
    const list = [
        {id:"damage", n:"NEURAL_STRIKE", d:"Temel hasarı %40 artırır"},
        {id:"gold", n:"DATA_EXTRACT", d:"Kazanılan TB miktarını artırır"},
        {id:"speed", n:"OVERCLOCK_V2", d:"Saldırı hızını %15 artırır"},
        {id:"crit", n:"LOGIC_GATE", d:"Kritik vuruş şansı ekler"}
    ];
    list.forEach(i => {
        html += `<div class="shop-item">
            <div><b>${i.n}</b> [v${game.shops[i.id]}]<br><small>${i.d}</small></div>
            <button class="btn" onclick="buyUpgrade('${i.id}')">${format(getUpgradeCost(i.id))}</button>
        </div>`;
    });
    document.getElementById("goldShopContent").innerHTML = html;
}

function renderPrestigeShop() {
    let gain = Math.floor(game.maxWave / 10);
    let html = `<div style="grid-column: 1/3; text-align:center; color:var(--neon-pink); margin-bottom:20px;">
        <h2>CORES: ${game.prestigeCurrency}</h2><p>REBOOT KAZANCI: +${gain}</p></div>`;
    
    const darkItems = [
        {id:"globalMulti", n:"QUANTUM_CPU", d:"X3 GLOBAL HASAR", c:1},
        {id:"autoBuyer", n:"ROOT_ACCESS", d:"OTO-GELİŞTİRME", c:10},
        {id:"timeWarp", n:"TIME_BENDER", d:"OYUN HIZI +50%", c:5},
        {id:"doubleDrop", n:"DUAL_STREAM", d:"X2 TB ŞANSI %10", c:8},
        {id:"blackMarket", n:"GHOST_DRIVE", d:"KALICI X3 HASAR", c:15}
    ];

    darkItems.forEach(i => {
        let cost = getPrestigeCost(i.id);
        html += `<div class="shop-item" style="border-color:var(--neon-pink)">
            <div><b>${i.n}</b> [Lv.${game.prestigeShop[i.id]}]<br><small>${i.d}</small></div>
            <button class="btn btn-p" onclick="buyPrestige('${i.id}')">${cost} CORE</button>
        </div>`;
    });
    document.getElementById("prestigeShopContent").innerHTML = html;
}

function renderStats() {
    let html = `
        <div style="padding:20px; font-size:18px; line-height:2;">
            <p>> MAX_NODE_REACHED: ${game.maxWave}</p>
            <p>> TOTAL_REBOOTS: ${game.prestigeCount}</p>
            <p>> CURRENT_OUTPUT: ${format(getDPS())} OPS/S</p>
            <p>> SYSTEM_SPEED: ${((1 + game.prestigeShop.timeWarp * 0.2)*100).toFixed(0)}%</p>
            <p>> DOUBLE_TB_CHANCE: ${game.prestigeShop.doubleDrop * 10}%</p>
            <p>> GLOBAL_MULT: ${Math.pow(3, game.prestigeShop.globalMulti)}x</p>
        </div>
    `;
    document.getElementById("statsContent").innerHTML = html;
}

function openModal(id) {
    document.getElementById(id).style.display = "flex";
    if(id === "goldShop") renderGoldShop();
    if(id === "prestigeShop") renderPrestigeShop();
    if(id === "statsModal") renderStats();
    if(id === "worldModal") renderWorlds();
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }

function buyUpgrade(id) {
    let cost = getUpgradeCost(id);
    if(game.gold >= cost) { game.gold -= cost; game.shops[id]++; renderGoldShop(); }
}

function buyPrestige(id) {
    let cost = getPrestigeCost(id);
    if(game.prestigeCurrency >= cost) { game.prestigeCurrency -= cost; game.prestigeShop[id]++; renderPrestigeShop(); }
}

function tryPrestige() {
    let gain = Math.floor(game.maxWave / 10);
    if(gain < 1) return alert("HATA: Yeterli veri yok (Node 10+ gerekli)");
    if(confirm("SİSTEMİ YENİDEN BAŞLAT? Tüm TB ve donanımlar sıfırlanacak.")){
        game.prestigeCurrency += gain; game.prestigeCount++;
        game.gold = 0; game.wave = 1; game.shops = {damage:0, gold:0, speed:0, crit:0};
        spawnEnemy(); closeModal('prestigeShop');
    }
}

function renderWorlds() {
    let html = "";
    WORLDS.forEach(w => {
        let lock = game.level < (w.id * 100 + 1);
        html += `<div class="shop-item" style="border-color:${w.color}; opacity:${lock ? 0.3 : 1}">
            <div><b>${w.name}</b><br><small>X${w.multi} DATA</small></div>
            <button class="btn" ${lock ? 'disabled' : `onclick="game.world=${w.id};closeModal('worldModal')"`}>
                ${lock ? 'LOCKED' : 'CONNECT'}
            </button>
        </div>`;
    });
    document.getElementById("worldContent").innerHTML = html;
}

function format(n) {
    if (n >= 1e12) return (n/1e12).toFixed(2) + " PB";
    if (n >= 1e9) return (n/1e9).toFixed(2) + " GB";
    if (n >= 1e6) return (n/1e6).toFixed(2) + " MB";
    if (n >= 1e3) return (n/1e3).toFixed(1) + " KB";
    return Math.floor(n);
}