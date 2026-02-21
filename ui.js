// =============================
// UI UPDATE LOOP
// =============================

function format(num){
    if(num >= 1e12) return (num/1e12).toFixed(2)+"T";
    if(num >= 1e9) return (num/1e9).toFixed(2)+"B";
    if(num >= 1e6) return (num/1e6).toFixed(2)+"M";
    if(num >= 1e3) return (num/1e3).toFixed(2)+"K";
    return Math.floor(num);
}

function updateUI(){

    document.getElementById("gold").innerText = format(game.gold);
    document.getElementById("level").innerText = game.level;
    document.getElementById("wave").innerText = game.wave;
    document.getElementById("prestigeCount").innerText = game.prestigeCount;
    document.getElementById("world").innerText = game.world;

    updateShopUI();
    updatePrestigeUI();
}

setInterval(updateUI,200);

// =============================
// GOLD SHOP
// =============================

const goldShopData = {
    damage:{base:50,scale:1.35},
    gold:{base:75,scale:1.35},
    xp:{base:80,scale:1.35},
    crit:{base:120,scale:1.35},
    critDmg:{base:150,scale:1.35},
    attackSpeed:{base:100,scale:1.35},
    boss:{base:200,scale:1.35},
    idle:{base:90,scale:1.35},
    hpReduce:{base:300,scale:1.35}
};

function getShopCost(key){
    let lvl = game.shops[key];
    return goldShopData[key].base * Math.pow(goldShopData[key].scale,lvl);
}

function buyShop(key){
    let cost = getShopCost(key);
    if(game.gold >= cost){
        game.gold -= cost;
        game.shops[key]++;
    }
}

function updateShopUI(){

    for(let key in goldShopData){
        let btn = document.getElementById("shop_"+key);
        if(!btn) continue;

        let cost = getShopCost(key);
        btn.innerText = key.toUpperCase() +
            " Lv."+game.shops[key]+
            " | "+format(cost);
    }
}

// =============================
// PRESTIGE SHOP
// =============================

const prestigeShopData = {
    goldMulti:{base:1,scale:1.6},
    xpMulti:{base:1,scale:1.6},
    offlineTime:{base:2,scale:1.6}
};

function getPrestigeCost(key){
    let lvl = game.prestigeShop[key];
    return prestigeShopData[key].base * Math.pow(prestigeShopData[key].scale,lvl);
}

function buyPrestige(key){
    let cost = getPrestigeCost(key);
    if(game.prestigeCurrency >= cost){
        game.prestigeCurrency -= cost;
        game.prestigeShop[key]++;
    }
}

function updatePrestigeUI(){

    for(let key in prestigeShopData){
        let btn = document.getElementById("prestige_"+key);
        if(!btn) continue;

        let cost = getPrestigeCost(key);
        btn.innerText = key.toUpperCase()+
            " Lv."+game.prestigeShop[key]+
            " | "+format(cost);
    }
}

// =============================
// WORLD SYSTEM
// =============================

function tryUnlockWorld(){

    if(game.world === 1 && game.level >= 100){
        game.world = 2;
    }

    if(game.world === 2 && game.level >= 250){
        game.world = 3;
    }
}

setInterval(tryUnlockWorld,1000);

// =============================
// MENU CONTROL
// =============================

function openMenu(){
    document.getElementById("menu").style.display="block";
}

function closeMenu(){
    document.getElementById("menu").style.display="none";
}

function openShop(){
    document.getElementById("shopPanel").style.display="block";
}

function closeShop(){
    document.getElementById("shopPanel").style.display="none";
}

function openPrestige(){
    document.getElementById("prestigePanel").style.display="block";
}

function closePrestige(){
    document.getElementById("prestigePanel").style.display="none";
}

// =============================
// ACHIEVEMENTS
// =============================

let achievements = [
    {id:1,name:"100 Kill",check:()=>game.totalKills>=100,done:false},
    {id:2,name:"1M Gold",check:()=>game.maxGold>=1e6,done:false},
    {id:3,name:"Level 200",check:()=>game.maxLevel>=200,done:false},
    {id:4,name:"10 Prestige",check:()=>game.prestigeCount>=10,done:false}
];

function checkAchievements(){
    achievements.forEach(a=>{
        if(!a.done && a.check()){
            a.done = true;
            alert("Achievement Unlocked: "+a.name);
        }
    });
}

setInterval(checkAchievements,2000);

// =============================
// STATS PANEL
// =============================

function updateStats(){

    document.getElementById("stat_kills").innerText = game.totalKills;
    document.getElementById("stat_time").innerText =
        Math.floor(game.totalPlayTime)+"s";
    document.getElementById("stat_maxGold").innerText =
        format(game.maxGold);
    document.getElementById("stat_maxLevel").innerText =
        game.maxLevel;
    document.getElementById("stat_rebirth").innerText =
        game.prestigeCount;
}

setInterval(updateStats,1000);

// =============================
// BUTTON BINDINGS
// =============================

window.buyShop = buyShop;
window.buyPrestige = buyPrestige;
window.tryPrestige = tryPrestige;
window.openMenu = openMenu;
window.closeMenu = closeMenu;
window.openShop = openShop;
window.closeShop = closeShop;
window.openPrestige = openPrestige;
window.closePrestige = closePrestige;
window.manualSave = manualSave;
window.exportSave = exportSave;
window.importSave = importSave;
window.resetSave = resetSave;