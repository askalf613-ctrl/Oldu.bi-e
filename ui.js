// ui.js
function format(n) {
    if (n < 1e3) return Math.floor(n);
    const units = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
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
        {id:"damage", n:"NEURAL LINK", d:"Saldırı gücünü artırır"},
        {id:"gold", n:"DATA MINER", d:"Veri kazancını artırır"},
        {id:"speed", n:"OVERCLOCK", d:"Saldırı hızı v2.0"},
        {id:"crit", n:"LOGIC GATE", d:"Kritik vuruş şansı"},
        {id:"double", n:"DUAL CHANNEL", d:"X2 Veri şansı %5"}
    ];
    list.forEach(i => {
        let cost = getUpgradeCost(i.id);
        html += `<div class="shop-item">
            <div><b>${i.n}</b> [v${game.shops[i.id]}]<br><small>${i.d}</small></div>
            <button class="btn" onclick="buyU('${i.id}')">${format(cost)}</button>
        </div>`;
    });
    document.getElementById("goldShopContent").innerHTML = html;
}

function renderPrestigeShop() {
    let gain = Math.floor(game.maxWave / 20);
    let html = `<div style="grid-column:1/-1; text-align:center; color:var(--pink)"><h3>CORES: ${format(game.prestigeCurrency)}</h3><p>Next: +${format(gain)}</p></div>`;
    const items = [
        {id:"global", n:"QUANTUM CPU", d:"HASAR X10", c:1},
        {id:"auto", n:"ROOT ACCESS", d:"OTO-ALIM AKTİF", c:10},
        {id:"multiplierBonus", n:"ENCRYPTION", d:"KAZANÇ X2", c:5},
        {id:"worldSynergy", n:"LINKER", d:"SİNERJİ +100%", c:20}
    ];
    items.forEach(i => {
        let cost = getPrestigeCost(i.id);
        html += `<div class="shop-item" style="border-color:var(--pink)">
            <div><b>${i.n}</b> [Lv.${game.prestigeShop[i.id]}]<br><small>${i.d}</small></div>
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

function openModal(id) {
    document.getElementById(id).style.display = "flex";
    if(id === "goldShop") renderGoldShop();
    if(id === "prestigeShop") renderPrestigeShop();
}

function closeModal(id) { document.getElementById(id).style.display = "none"; }

function tryPrestige() {
    let gain = Math.floor(game.maxWave / 20);
    if(gain < 1) return alert("Node 20+ gerekli!");
    game.prestigeCurrency += gain; game.gold = 0; game.wave = 1;
    game.shops = {damage:0, gold:0, speed:0, crit:0, double:0};
    enemyHP = getEnemyMaxHP(); maxHP = enemyHP; closeModal('prestigeShop');
}