// ui.js
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
    const list = [{id:"damage",n:"CORE CPU"}, {id:"gold",n:"MINER"}, {id:"speed",n:"CLOCK"}, {id:"crit",n:"LOGIC"}, {id:"double",n:"DUAL"}];
    list.forEach(i => {
        let c = getUpgradeCost(i.id);
        html += `<div class="shop-item"><div><b>${i.n}</b> [v${game.shops[i.id]}]</div><button class="btn" onclick="buyU('${i.id}')">${format(c)}</button></div>`;
    });
    document.getElementById("goldShopContent").innerHTML = html;
}

function renderPrestigeShop() {
    let html = "";
    const items = [{id:"global", n:"QUANTUM", c:1}, {id:"auto", n:"ROOT", c:10}, {id:"worldSync", n:"SYNC", c:25}];
    items.forEach(i => {
        let c = getPrestigeCost(i.id);
        html += `<div class="shop-item" style="border-color:var(--pink)"><div><b>${i.n}</b> [Lv.${game.prestigeShop[i.id]}]</div><button class="btn btn-p" onclick="buyP('${i.id}')">${format(c)}</button></div>`;
    });
    document.getElementById("prestigeShopContent").innerHTML = html;
}

function renderWorlds() {
    let html = "";
    WORLDS.forEach(w => {
        let locked = game.gold < w.req && game.world !== w.id;
        html += `<div class="shop-item" style="border-color:${w.color}; opacity:${locked?0.5:1}">
            <div><b>${w.name}</b><br><small>x${format(w.multi)}</small></div>
            <button class="btn btn-w" ${locked?'disabled':''} onclick="travel(${w.id})">${locked?'LOCKED': 'GO'}</button>
        </div>`;
    });
    document.getElementById("worldContent").innerHTML = html;
}

function travel(id) { game.world = id; game.wave = 1; enemyHP = getEnemyMaxHP(); maxHP = enemyHP; closeModal('worldModal'); }
function buyU(id) { let c = getUpgradeCost(id); if(game.gold>=c){ game.gold-=c; game.shops[id]++; game.worldProgress[game.world]++; renderGoldShop(); } }
function buyP(id) { let c = getPrestigeCost(id); if(game.prestigeCurrency>=c){ game.prestigeCurrency-=c; game.prestigeShop[id]++; renderPrestigeShop(); } }

function tryPrestige() {
    let gain = Math.floor(game.maxWave / 50);
    if(gain < 1) return alert("Node 50+ gerekli!");
    if(confirm(gain + " Core için Reboot edilsin mi?")){
        game.prestigeCurrency += gain; game.gold = 0; game.wave = 1;
        game.shops = {damage:0, gold:0, speed:0, crit:0, double:0};
        enemyHP = getEnemyMaxHP(); maxHP = enemyHP; closeModal('prestigeShop');
    }
}

function openModal(id) {
    document.getElementById(id).style.display = "flex";
    if(id === 'goldShop') renderGoldShop();
    if(id === 'prestigeShop') renderPrestigeShop();
    if(id === 'worldModal') renderWorlds();
}
function closeModal(id) { document.getElementById(id).style.display = "none"; }