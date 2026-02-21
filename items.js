// =============================
// ITEM SYSTEM V1
// =============================

if(!game.inventory){
    game.inventory = [];
    game.equippedWeapons = [];
    game.equippedBooks = [];
}

// =============================
// DATA
// =============================

const RARITY = {
    common:{multi:1,color:"#aaa"},
    rare:{multi:1.5,color:"#4af"},
    epic:{multi:2.5,color:"#c5f"},
    legendary:{multi:5,color:"#ff8800"}
};

function rollRarity(){
    let r = Math.random();
    if(r < 0.001) return "legendary";   // 0.001
    if(r < 0.05) return "epic";
    if(r < 0.20) return "rare";
    return "common";
}

const WEAPONS = [
    {name:"Sword",stat:"damage",base:2},
    {name:"Axe",stat:"critDmg",base:5},
    {name:"Dagger",stat:"attackSpeed",base:0.05},
    {name:"Hammer",stat:"damage",base:4},
    {name:"Spear",stat:"crit",base:0.02},
    {name:"Bow",stat:"gold",base:0.1},
    {name:"Scythe",stat:"damage",base:3},
    {name:"Orb",stat:"xp",base:0.1},
    {name:"Blade",stat:"crit",base:0.03},
    {name:"Claw",stat:"attackSpeed",base:0.08}
];

const BOOKS = Array.from({length:30},(_,i)=>({
    name:"Book "+(i+1),
    stat:["damage","gold","xp","crit","attackSpeed"][i%5],
    base:0.15
}));

// =============================
// GENERATE ITEM
// =============================

function generateItem(type){

    let pool = type==="weapon"?WEAPONS:BOOKS;
    let template = pool[Math.floor(Math.random()*pool.length)];

    let rarity = rollRarity();
    let multi = RARITY[rarity].multi;

    let value = template.base * multi;

    return {
        id:Date.now()+Math.random(),
        type:type,
        name:template.name,
        stat:template.stat,
        value:value,
        rarity:rarity
    };
}

// =============================
// ADD DROP
// =============================

function dropItem(){

    let type = Math.random()<0.5?"weapon":"book";
    let item = generateItem(type);

    game.inventory.push(item);

    renderInventory();
}

// =============================
// EQUIP SYSTEM
// =============================

function equipItem(id){

    let item = game.inventory.find(i=>i.id===id);
    if(!item) return;

    if(item.type==="weapon"){
        if(game.equippedWeapons.length>=2) return alert("Max 2 Weapon!");
        game.equippedWeapons.push(item);
    }else{
        if(game.equippedBooks.length>=4) return alert("Max 4 Book!");
        game.equippedBooks.push(item);
    }

    game.inventory = game.inventory.filter(i=>i.id!==id);

    applyItemStats();
    renderInventory();
}

function unequipItem(id){

    let item = game.equippedWeapons.find(i=>i.id===id);
    if(item){
        game.equippedWeapons =
            game.equippedWeapons.filter(i=>i.id!==id);
        game.inventory.push(item);
    }

    let book = game.equippedBooks.find(i=>i.id===id);
    if(book){
        game.equippedBooks =
            game.equippedBooks.filter(i=>i.id!==id);
        game.inventory.push(book);
    }

    applyItemStats();
    renderInventory();
}

function deleteItem(id){
    game.inventory = game.inventory.filter(i=>i.id!==id);
    renderInventory();
}

// =============================
// APPLY STATS
// =============================

function applyItemStats(){

    game.itemBonus = {
        damage:0,
        gold:0,
        xp:0,
        crit:0,
        critDmg:0,
        attackSpeed:0
    };

    [...game.equippedWeapons,...game.equippedBooks]
    .forEach(i=>{
        game.itemBonus[i.stat] += i.value;
    });
}

// =============================
// MODIFY DAMAGE FORMULA
// =============================

const oldGetDamage = getDamage;
getDamage = function(){
    let base = oldGetDamage();
    return base * (1 + (game.itemBonus?.damage||0));
}

const oldGoldMulti = getGoldMultiplier;
getGoldMultiplier = function(){
    let base = oldGoldMulti();
    return base * (1 + (game.itemBonus?.gold||0));
}

const oldXPMulti = getXPMultiplier;
getXPMultiplier = function(){
    let base = oldXPMulti();
    return base * (1 + (game.itemBonus?.xp||0));
}

// =============================
// RENDER
// =============================

function renderInventory(){

    let inv = document.getElementById("inventory");
    if(!inv) return;

    inv.innerHTML = "<h3>Inventory</h3>";

    game.inventory.forEach(item=>{
        let div = document.createElement("div");
        div.style.color = RARITY[item.rarity].color;
        div.innerHTML =
            item.name+
            " | "+item.stat+" +"+item.value.toFixed(2)+
            " <button onclick='equipItem("+item.id+")'>Equip</button>"+
            " <button onclick='deleteItem("+item.id+")'>Delete</button>";
        inv.appendChild(div);
    });

    let eq = document.getElementById("equipped");
    if(eq){
        eq.innerHTML="<h3>Equipped</h3>";

        [...game.equippedWeapons,...game.equippedBooks]
        .forEach(item=>{
            let div = document.createElement("div");
            div.style.color = RARITY[item.rarity].color;
            div.innerHTML =
                item.name+
                " | "+item.stat+" +"+item.value.toFixed(2)+
                " <button onclick='unequipItem("+item.id+")'>Remove</button>";
            eq.appendChild(div);
        });
    }
}

// =============================
// AUTO DROP EVERY 5 LEVEL
// =============================

let lastDropLevel = 0;

setInterval(()=>{
    if(game.level >= lastDropLevel + 5){
        lastDropLevel = game.level;
        dropItem();
    }
},1000);

// =============================
// INIT
// =============================

applyItemStats();
renderInventory();

window.equipItem = equipItem;
window.unequipItem = unequipItem;
window.deleteItem = deleteItem;