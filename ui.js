// ui.js - Coordination & Content
function format(n) {
    if (n < 1e3) return Math.floor(n);
    const units = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const i = Math.floor(Math.log10(n) / 3);
    return (n / Math.pow(10, i * 3)).toFixed(2) + " " + units[i-1];
}

function updateUI() {
    document.getElementById("goldText").innerText = format(game.gold);
    document.getElementById("waveText").innerText = game.wave;
    document.getElementById("dpsText").innerText = format(getDPS());
    document.getElementById("coreText").innerText = format(game.prestigeCurrency);
    document.getElementById("worldNameText").innerText = WORLDS[game.world].name;
}

function renderGoldShop() {
    let html = "";
    const list = [
        {id:"damage", n:"LASER ARRAY", d:"Hasar kapasitesini artırır"},
        {id:"gold", n:"QUANTUM MINER", d:"Veri toplama verimliliği"},
        {id:"speed", n:"CLOCK SPEED", d:"Saldırı periyodu hızlanır"},
        {id:"crit", n:"LOGIC OVERRIDE", d:"Kritik vuruş yüzdesi"},
        {id:"double", n:"MIRROR PORT", d:"X2 Veri kazanma şansı"},
        {id:"multiProcess", n:"MULTI-THREADING", d:"Toplam hasarı %50 çarpar"}
    ];
    list.forEach(i => {
        let cost = getUpgradeCost(i.id);
        html += `<div class="shop-item">
            <div><b style="color:var(--blue)">${i.n}</b> [Lv.${game.shops[i.id]}]<br><small>${i.d}</small></div>
            <button class="btn" onclick="buyU('${i.id}')">${format(cost)}</button>
        </div>`;
    });
    document.getElementById("goldShopContent").innerHTML = html;
}

function renderPrestigeShop() {
    let gain = Math.floor(game.maxWave / 50) * (game.world + 1);
    let html = `<div style="grid-column:1/-1; text-align:center; color:var(--pink); margin-bottom:20px;">
        <h3>AVAILABLE CORES: ${format(game.prestigeCurrency)}</h3>
        <p>REBOOT MINIMUM REQ: NODE ${game.rebootReq}</p>
        <p>CURRENT GAIN: +${format(gain)}</p>
    </div>`;
    
    const items = [
        {id:"global", n:"ASCENSION DRIVE", d:"TÜM HASARI X5 YAPAR", c:1},
        {id:"auto", n:"NEURAL NETWORK", d:"OTO-GELİŞTİRME SİSTEMİ", c:15},
        {id:"multiBonus", n:"DATA ENCRYPTION", d:"VERİ KAZANCINI X3 YAPAR", c:10},
        {id:"worldSync", n:"CROSS-LINK", d:"DÜNYA SİNERJİSİ +100%", c:25},
        {id:"waveWarp", n:"NODE WARP", d:"WAVE ATLATMA ŞANSI %5", c:50}
    ];

    items.forEach(i => {
        let cost = getPrestigeCost(i.id);
        html += `<div class="shop-item" style="border-color:var(--pink)">
            <div><b style="color:var(--pink)">${i.n}</b> [Lv.${game.prestigeShop[i.id]}]<br><small>${i.d}</small></div>
            <button class="btn btn-p" onclick="buyP('${i.id}')">${format(cost)}</button>
        </div>`;
    });
    document.getElementById("prestigeShopContent").innerHTML = html;
}

function buyU(id) { 
    let c = getUpgradeCost(id); 
    if(game.gold >= c) { game.gold -= c; game.shops[id]++; game.worldProgress[game.world]++; renderGoldShop(); }
}

function buyP(id) { 
    let c = getPrestigeCost(id); 
    if(game.prestigeCurrency >= c) { game.prestigeCurrency -= c; game.prestigeShop[id]++; renderPrestigeShop(); }
}

function tryPrestige() {
    if(game.wave < game.rebootReq) return alert("HATA: Sistem Reboot için yeterli stabilitede değil (Node " + game.rebootReq + " gerekli)");
    
    let gain = Math.floor(game.maxWave / 50) * (game.world + 1);
    if(confirm("SİSTEMİ SIFIRLA VE " + gain + " CORE KAZAN?")){
        game.prestigeCurrency += gain; 
        game.prestigeCount++;
        game.rebootReq += 25; // Reboot zorlaştırması
        game.gold = 0; game.wave = 1;
        game.shops = {damage:0, gold:0, speed:0, crit:0, double:0, multiProcess:0};
        enemyHP = getEnemyMaxHP(); maxHP = enemyHP; closeModal('prestigeShop');
    }
}

function openModal(id) {
    document.getElementById(id).style.display = "flex";
    if(id === "goldShop") renderGoldShop();
    if(id === "prestigeShop") renderPrestigeShop();
    if(id === "statsModal") renderStats();
    if(id === "worldModal") renderWorlds();
}
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function renderStats() {
    document.getElementById("statsContent").innerHTML = `
        <p>> TOTAL OPS: ${format(getDPS())}</p>
        <p>> SECTOR MULTIPLIER: ${format(WOR_MULTIPLIER())}x</p>
        <p>> SYNERGY BONUS: ${format(getDPS()/100)}x</p>
        <p>> REBOOT ATTEMPTS: ${game.prestigeCount}</p>
        <p>> NEXT REBOOT REQ: NODE ${game.rebootReq}</p>
    `;
}
function WOR_MULTIPLIER() { return WORLDS[game.world].multi; }
function renderWorlds() { /* World travel code logic */ }