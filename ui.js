// ui.js - Tüm Arayüz, Shoplar, Modallar, Envanter vs.
function updateHUD() {
    document.getElementById("goldText").innerText = format(game.gold);
    document.getElementById("levelText").innerText = game.level;
    document.getElementById("waveText").innerText = game.wave;
    document.getElementById("dpsText").innerText = format(getDPS());
    document.getElementById("comboText").innerText = game.combo + "x";
}
setInterval(updateHUD, 120);

function openModal(id) {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
    if (id === 'goldShop') renderGoldShop();
    if (id === 'prestigeShop') renderPrestigeShop();
    if (id === 'itemsModal') renderItems();
    if (id === 'worldModal') renderWorlds();
}
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ===================== GOLD SHOP =====================
const goldShopList = [
    {key:"damage", name:"Damage", desc:"+22% Hasar", base:60, scale:1.32},
    {key:"gold", name:"Gold Multi", desc:"+18% Gold", base:75, scale:1.33},
    {key:"xp", name:"XP Multi", desc:"+15% XP", base:65, scale:1.32},
    {key:"crit", name:"Crit Chance", desc:"+3% Kritik Şans", base:110, scale:1.35},
    {key:"critDmg", name:"Crit Damage", desc:"+40% Kritik Hasar", base:140, scale:1.36},
    {key:"attackSpeed", name:"Attack Speed", desc:"+12% Saldırı Hızı", base:95, scale:1.33},
    {key:"hpReduce", name:"HP Reduce", desc:"-8.5% Canavar Canı", base:200, scale:1.38},
    {key:"idle", name:"Idle Multi", desc:"+25% Boşta DPS", base:120, scale:1.35},
    {key:"waveGold", name:"Wave Gold", desc:"+12% Wave Bonus", base:150, scale:1.37}
];

function getShopCost(item) {
    return Math.floor(item.base * Math.pow(item.scale, game.shops[item.key] || 0));
}

function buyShop(key) {
    let item = goldShopList.find(i => i.key === key);
    let cost = getShopCost(item);
    if (game.gold >= cost) {
        game.gold -= cost;
        game.shops[key]++;
        renderGoldShop();
    }
}

function renderGoldShop() {
    let html = "";
    goldShopList.forEach(item => {
        let cost = getShopCost(item);
        html += `<div class="shop-item">
            <div><b>\( {item.name}</b><br><small> \){item.desc}</small><br>Lv.${game.shops[item.key]||0}</div>
            <button class="btn" onclick="buyShop('\( {item.key}')"> \){format(cost)} Gold</button>
        </div>`;
    });
    document.getElementById("goldShopContent").innerHTML = html;
}

// ===================== PRESTIGE SHOP =====================
function renderPrestigeShop() {
    let html = `<h3>Prestige Puanın: <b>${game.prestigeCurrency}</b></h3>`;
    html += `<div class="shop-item"><div>Global Gold Multi (+0.35)<br>Lv.${game.prestigeShop.goldMulti}</div><button class="btn" onclick="buyPrestige('goldMulti')">1 Puan</button></div>`;
    html += `<div class="shop-item"><div>Global XP Multi (+0.35)<br>Lv.${game.prestigeShop.xpMulti}</div><button class="btn" onclick="buyPrestige('xpMulti')">1 Puan</button></div>`;
    html += `<div class="shop-item"><div>Permanent Damage (+0.8)<br>Lv.${game.prestigeShop.permDamage}</div><button class="btn" onclick="buyPrestige('permDamage')">1 Puan</button></div>`;
    document.getElementById("prestigeShopContent").innerHTML = html;
}

function buyPrestige(key) {
    if (game.prestigeCurrency >= 1) {
        game.prestigeCurrency--;
        game.prestigeShop[key]++;
        renderPrestigeShop();
    }
}

// ===================== ITEMS =====================
function renderItems() {
    let html = `<h3>Envanter (${game.inventory.length} / 12)</h3>`;
    game.inventory.forEach((item, index) => {
        let color = item.rarity === "Rare" ? "#4af" : "#aaa";
        html += `<div class="shop-item" style="color:${color}">
            <div>${item.name} — \( {item.stat} + \){item.value.toFixed(1)}</div>
            <button class="btn" onclick="equipItem(${index})">Ekip</button>
        </div>`;
    });
    document.getElementById("itemsContent").innerHTML = html;
}

window.equipItem = function(index) {
    if (game.inventory[index]) {
        alert(game.inventory[index].name + " ekipman yapıldı! (Şimdi daha fazla etki verecek)");
        game.inventory.splice(index, 1);
        renderItems();
    }
};

// ===================== WORLDS =====================
function renderWorlds() {
    let html = "";
    WORLDS.forEach(w => {
        let locked = game.level < w.unlockLevel ? " (Kilitli - Lv." + w.unlockLevel + ")" : "";
        let style = game.world === w.id ? "border:3px solid #0ff;background:#0a2a2a" : "";
        html += `<div class="shop-item" style="\( {style}" onclick="changeWorld( \){w.id})"><b>\( {w.name}</b> \){locked}</div>`;
    });
    document.getElementById("worldContent").innerHTML = html;
}

window.changeWorld = function(newWorld) {
    if (game.level >= WORLDS[newWorld].unlockLevel) {
        game.world = newWorld;
        alert(WORLDS[newWorld].name + " dünyasına geçtin! Kazancın " + WORLDS[newWorld].multi + "x arttı.");
        renderWorlds();
    } else {
        alert("Bu dünya için " + WORLDS[newWorld].unlockLevel + " level olman lazım.");
    }
};

// ===================== PRESTIGE =====================
window.tryPrestige = function() {
    let req = 15 + game.prestigeCount * 8;
    if (game.level >= req) {
        if (confirm("Prestige yapacak mısın?")) {
            game.prestigeCurrency += 1 + Math.floor(game.prestigeCount / 2);
            game.prestigeCount++;
            game.level = 1; game.wave = 1; game.xp = 0; game.gold = Math.floor(game.gold * 0.25);
            game.shops = {damage:0,gold:0,xp:0,crit:0,critDmg:0,attackSpeed:0,hpReduce:0,idle:0,waveGold:0};
            alert("Prestige başarılı! " + game.prestigeCurrency + " puan kazandın.");
        }
    } else {
        alert(`Prestige için ${req} level gerekiyor.`);
    }
};

window.openModal = openModal;
window.closeModal = closeModal;
window.buyShop = buyShop;
window.buyPrestige = buyPrestige;