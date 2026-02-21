// ui.js
function updateUI() {
    document.getElementById("goldText").innerText = format(game.gold);
    document.getElementById("waveText").innerText = game.wave;
    document.getElementById("dpsText").innerText = format(getDPS());
    document.getElementById("coreText").innerText = format(game.prestigeCurrency);
    document.getElementById("worldNameText").innerText = WORLDS[game.world].name;
}
setInterval(updateUI, 100);

function renderGoldShop() {
    let html = "";
    const list = [
        {id:"damage", n:"CORE CPU", d:"Base hasarı devasa artırır"},
        {id:"gold", n:"DATA HARVEST", d:"Data kazanımını %40 artırır"},
        {id:"speed", n:"RAM OVERCLOCK", d:"Saldırı hızı v0.2 artar"},
        {id:"crit", n:"CRIT MODULE", d:"Kritik şans ve hasar"},
        {id:"double", n:"DOUBLE BUS", d:"2X Kazanma Şansı %5"}
    ];
    list.forEach(i => {
        let cost = getUpgradeCost(i.id);
        html += `<div class="shop-item">
            <div><b>${i.n}</b> [Lv.${game.shops[i.id]}]<br><small>${i.d}</small></div>
            <button class="btn" onclick="buyU('${i.id}')">${format(cost)}</button>
        </div>`;
    });
    document.getElementById("goldShopContent").innerHTML = html;
}

function buyU(id) {
    let cost = getUpgradeCost(id);
    if(game.gold >= cost) {
        game.gold -= cost; game.shops[id]++; 
        game.worldProgress[game.world]++;
        renderGoldShop();
    }
}

function renderPrestigeShop() {
    let gain = Math.floor(game.maxWave / 25) * (game.world + 1);
    let html = `<div style="grid-column:1/-1; text-align:center; color:var(--pink)"><h3>CORES: ${format(game.prestigeCurrency)}</h3><p>Next Reset: +${format(gain)}</p></div>`;
    
    const items = [
        {id:"global", n:"DIMENSIONAL POWER", d:"TÜM HASARI X10 YAPAR"},
        {id:"auto", n:"NEURAL AUTO-BUYER", d:"OTOMATİK GELİŞTİRME YAPAR"},
        {id:"multiplierBonus", n:"DATA ENCRYPTION", d:"ALTIN KAZANCINI X5 YAPAR"},
        {id:"worldSynergy", n:"WORLD LINK", d:"DÜNYALAR ARASI SİNERJİ %50+"}
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

function buyP(id) {
    let cost = getPrestigeCost(id);
    if(game.prestigeCurrency >= cost) {
        game.prestigeCurrency -= cost; game.prestigeShop[id]++; renderPrestigeShop();
    }
}

function renderWorlds() {
    let html = "";
    WORLDS.forEach(w => {
        let locked = game.gold < w.req && game.world !== w.id;
        html += `<div class="shop-item" style="border-color:${w.color}; opacity:${locked ? 0.4 : 1}">
            <div><b style="color:${w.color}">${w.name}</b><br><small>Multiplier: ${format(w.multi)}x<br>Synergy: ${w.synergy}x</small></div>
            <button class="btn" ${locked ? 'disabled' : `onclick="travel(${w.id})"`}>
                ${locked ? 'REQ: '+format(w.req) : 'TRAVEL'}
            </button>
        </div>`;
    });
    document.getElementById("worldContent").innerHTML = html;
}

function travel(id) { game.world = id; enemyHP = getEnemyMaxHP(); maxEnemyHP = enemyHP; closeModal('worldModal'); }

function renderStats() {
    let html = `
        <div style="line-height:2; font-size:16px; color:var(--blue)">
            <p>> MAX NODE REACHED: ${game.maxWave}</p>
            <p>> TOTAL ASCENSIONS: ${game.prestigeCount}</p>
            <p>> SYNERGY MULTIPLIER: ${format(getDPS()/100)}x</p>
            <p>> CURRENT OPS/S: ${format(getDPS())}</p>
        </div>
    `;
    document.getElementById("statsContent").innerHTML = html;
}

function tryPrestige() {
    let gain = Math.floor(game.maxWave / 25) * (game.world + 1);
    if(gain < 1) return alert("Yetersiz Veri! (Node 25+ Gerekli)");
    if(confirm("ASCEND? Mevcut Data ve Hardware sıfırlanacak ama Core kazanacaksın.")){
        game.prestigeCurrency += gain; game.prestigeCount++;
        game.gold = 0; game.wave = 1; game.shops = {damage:0, gold:0, speed:0, crit:0, double:0};
        enemyHP = getEnemyMaxHP(); maxEnemyHP = enemyHP; closeModal('prestigeShop');
    }
}

function openModal(id) {
    document.getElementById(id).style.display = "flex";
    if(id === "goldShop") renderGoldShop();
    if(id === "prestigeShop") renderPrestigeShop();
    if(id === "worldModal") renderWorlds();
    if(id === "statsModal") renderStats();
}
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function format(n) {
    if (n < 1e3) return Math.floor(n);
    const units = ["K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td"];
    const i = Math.floor(Math.log10(n) / 3);
    return (n / Math.pow(10, i * 3)).toFixed(2) + " " + units[i-1];
}