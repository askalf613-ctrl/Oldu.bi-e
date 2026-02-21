// ui.js - Shoplar, Modallar, HUD
function format(num) {
    if(num>=1e9) return (num/1e9).toFixed(2)+"B";
    if(num>=1e6) return (num/1e6).toFixed(2)+"M";
    if(num>=1e3) return (num/1e3).toFixed(1)+"K";
    return Math.floor(num);
}

function updateHUD() {
    document.getElementById("goldText").innerText = format(game.gold);
    document.getElementById("levelText").innerText = game.level;
    document.getElementById("waveText").innerText = game.wave;
    document.getElementById("dpsText").innerText = format(getDPS());
    document.getElementById("worldText").innerText = WORLDS[game.world].name;
}
setInterval(updateHUD, 150);

function openModal(id) {
    document.querySelectorAll('.modal').forEach(m => m.style.display='none');
    document.getElementById(id).style.display = 'flex';
    if(id==='goldShop') renderGoldShop();
    if(id==='prestigeShop') renderPrestigeShop();
    if(id==='worldModal') renderWorlds();
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Gold Shop (9 seçenek - HP reduce dahil)
const goldShopData = [
    {key:"damage", name:"Damage", desc:"+22% Damage", base:55, scale:1.33},
    {key:"gold", name:"Gold Multi", desc:"+18% Gold", base:70, scale:1.34},
    {key:"xp", name:"XP Multi", desc:"+15% XP", base:65, scale:1.33},
    {key:"crit", name:"Crit Chance", desc:"+3% Crit", base:100, scale:1.35},
    {key:"critDmg", name:"Crit Damage", desc:"+40% Crit Dmg", base:130, scale:1.36},
    {key:"attackSpeed", name:"Attack Speed", desc:"+12% Hız", base:90, scale:1.33},
    {key:"hpReduce", name:"Enemy HP Reduce", desc:"-9% Canavar HP", base:180, scale:1.38},
    {key:"idle", name:"Idle Multi", desc:"+25% Idle", base:110, scale:1.35},
    {key:"waveGold", name:"Wave Gold Bonus", desc:"+10% Wave Gold", base:140, scale:1.37}
];

function getShopCost(item) {
    return Math.floor(item.base * Math.pow(item.scale, game.shops[item.key]));
}

function buyShop(key) {
    let item = goldShopData.find(i=>i.key===key);
    let cost = getShopCost(item);
    if (game.gold >= cost) {
        game.gold -= cost;
        game.shops[key]++;
        renderGoldShop();
    }
}

function renderGoldShop() {
    let html = "";
    goldShopData.forEach(item => {
        let cost = getShopCost(item);
        html += `<div class="shop-item">
            <div><b>\( {item.name}</b><br><small> \){item.desc}</small><br>Lv.${game.shops[item.key]}</div>
            <button class="btn" onclick="buyShop('\( {item.key}')"> \){format(cost)} Gold</button>
        </div>`;
    });
    document.getElementById("goldShopContent").innerHTML = html;
}

function renderPrestigeShop() {
    let html = `<h3>Prestige Puanın: ${game.prestigeCurrency}</h3>`;
    html += `<div class="shop-item"><div>Global Gold Multi<br>Lv.${game.prestigeShop.goldMulti}</div><button class="btn" onclick="buyPrestige('goldMulti')">Satın Al</button></div>`;
    document.getElementById("prestigeShopContent").innerHTML = html;
}

function buyPrestige(key) {
    if (game.prestigeCurrency >= 1) {
        game.prestigeCurrency--;
        game.prestigeShop[key]++;
        renderPrestigeShop();
    }
}

function renderWorlds() {
    let html = "";
    WORLDS.forEach(w => {
        let locked = game.level < w.unlock ? " (Kilitli)" : "";
        let active = game.world === w.id ? "style='border:3px solid #0ff'" : "";
        html += `<div class="shop-item" \( {active} onclick="changeWorld( \){w.id})"><b>\( {w.name}</b> \){locked}</div>`;
    });
    document.getElementById("worldContent").innerHTML = html;
}

// Menu
function renderMenu() {
    document.getElementById("menuContent").innerHTML = `
        <button class="btn" onclick="manualSave()" style="width:100%;margin:10px 0">Kaydet</button>
        <button class="btn" onclick="resetSave()" style="width:100%;margin:10px 0;background:#600">Sıfırla</button>
    `;
}
function manualSave() { alert("Kaydedildi!"); }
function resetSave() { if(confirm("Her şey silinecek!")) location.reload(); }

// Global
window.openModal = openModal;
window.closeModal = closeModal;
window.buyShop = buyShop;
window.buyPrestige = buyPrestige;
window.tryPrestige = tryPrestige;
window.changeWorld = changeWorld;
window.renderMenu = renderMenu;