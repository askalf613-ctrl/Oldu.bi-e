// ============================================
// IDLE ARENA RPG - FULL SYSTEM
// STAGE + REBIRTH + ACHIEVEMENT + BOOKS
// ============================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
});

// ============================================
// GLOBAL SAVE
// ============================================

let saveData = {
    stage: 1,
    wave: 1,
    level: 1,
    xp: 0,
    xpNeeded: 50,
    gold: 0,
    souls: 0,
    rebirths: 0,
    highestWave: 1,
    kills: 0,
    bossKills: 0,
    achievements: [],
    unlockedCharacters: ["Warrior"],
    selectedCharacter: "Warrior",
    rebirthShop: {
        damage: 0,
        xp: 0,
        speed: 0,
        offlineCap: 0,
        rarity: 0
    },
    lastSave: Date.now()
};

// ============================================
// CHARACTER SYSTEM
// ============================================

const characters = {
    Warrior: { damage: 1.0, xp: 1.0, speed: 1.0 },
    Berserker: { damage: 1.15, xp: 1.0, speed: 1.0 },
    Sage: { damage: 1.0, xp: 1.2, speed: 1.0 },
    Phantom: { damage: 1.0, xp: 1.0, speed: 1.1 }
};

// ============================================
// BOOK SYSTEM (30)
// ============================================

const BOOK_POOL = [
    {name:"Power Tome", type:"damage", value:0.15},
    {name:"Crit Book", type:"crit", value:0.05},
    {name:"Speed Tome", type:"speed", value:0.1},
    {name:"XP Boost", type:"xp", value:0.2},
    {name:"Gold Boost", type:"gold", value:0.25},
    {name:"Lifesteal", type:"lifesteal", value:0.03},
    {name:"Boss Slayer", type:"boss", value:0.3},
    {name:"Overcharge", type:"double", value:0.1},
    {name:"Time Warp", type:"cooldown", value:0.1},
    {name:"Burn Mastery", type:"burn", value:0.2},
    {name:"Poison Mastery", type:"poison", value:0.2},
    {name:"Combo Core", type:"combo", value:0.2},
    {name:"Rage Mode", type:"rage", value:0.2},
    {name:"Crit Damage", type:"critdmg", value:0.5},
    {name:"Mega Core", type:"mega", value:0.3},
    {name:"Dodge", type:"dodge", value:0.1},
    {name:"Shield", type:"shield", value:20},
    {name:"Regen", type:"regen", value:2},
    {name:"Magnet", type:"magnet", value:1},
    {name:"Execution", type:"execute", value:0.05},
    {name:"Lucky Drop", type:"luck", value:0.1},
    {name:"Frenzy", type:"frenzy", value:0.1},
    {name:"Hyper Speed", type:"hyper", value:0.2},
    {name:"Burst", type:"burst", value:0.3},
    {name:"Split Shot", type:"split", value:1},
    {name:"Echo Strike", type:"echo", value:0.15},
    {name:"Guardian Drone", type:"drone", value:1},
    {name:"Phoenix", type:"revive", value:1},
    {name:"Ultra Core", type:"ultra", value:0.4},
    {name:"LEGEND: Void", type:"legendary", value:1}
];

let books = [];

// ============================================
// ACHIEVEMENTS
// ============================================

const ACHIEVEMENTS = [
    {id:"kill100", name:"100 Kill", check:()=>saveData.kills>=100, reward:5},
    {id:"kill1000", name:"1000 Kill", check:()=>saveData.kills>=1000, reward:10},
    {id:"boss10", name:"10 Boss", check:()=>saveData.bossKills>=10, reward:10},
    {id:"wave50", name:"Wave 50", check:()=>saveData.highestWave>=50, reward:15},
    {id:"rebirth1", name:"First Rebirth", check:()=>saveData.rebirths>=1, reward:20}
];

// ============================================
// ENEMY SYSTEM
// ============================================

let enemies = [];

function spawnEnemy(isBoss=false){
    let hp = 40*Math.pow(1.18, saveData.wave)*Math.pow(1.4, saveData.stage);
    if(isBoss) hp*=5;

    enemies.push({
        hp:hp,
        maxHp:hp,
        isBoss:isBoss
    });
}

// ============================================
// BOOK ROLL
// ============================================

function rollBook(){
    let rarityRoll=Math.random();

    if(rarityRoll<0.001+saveData.rebirthShop.rarity*0.0005){
        return BOOK_POOL[29]; // legendary
    }

    return BOOK_POOL[Math.floor(Math.random()*29)];
}

function levelUp(){
    saveData.level++;
    saveData.xp=0;
    saveData.xpNeeded*=1.4;
    openBookPanel();
}

function openBookPanel(){
    let panel=document.getElementById("bookPanel");
    let container=document.getElementById("bookOptions");
    container.innerHTML="";
    panel.style.display="block";

    for(let i=0;i<3;i++){
        let b=rollBook();
        let div=document.createElement("div");
        div.className="book-option";
        div.innerText=b.name;
        div.onclick=()=>{
            if(books.length<3){
                books.push({...b,level:1});
            }
            panel.style.display="none";
        };
        container.appendChild(div);
    }
}

// ============================================
// COMBAT
// ============================================

let attackTimer=0;

function attack(delta){
    attackTimer+=delta;

    let speedMultiplier=1+saveData.rebirthShop.speed*0.01;
    let char=characters[saveData.selectedCharacter];

    if(attackTimer>=1/(1*speedMultiplier*char.speed)){
        attackTimer=0;

        if(enemies.length>0){
            let dmg=25;

            books.forEach(b=>{
                if(b.type==="damage") dmg*=1+b.value;
                if(b.type==="legendary") dmg*=2;
            });

            dmg*=1+saveData.rebirthShop.damage*0.03;
            dmg*=char.damage;

            enemies[0].hp-=dmg;

            if(enemies[0].hp<=0){
                if(enemies[0].isBoss) saveData.bossKills++;
                saveData.kills++;
                saveData.gold+=5;
                saveData.xp+=10*(1+saveData.rebirthShop.xp*0.02)*char.xp;
                enemies.shift();
            }
        }
    }
}

// ============================================
// WAVE SYSTEM
// ============================================

function updateWave(){
    if(enemies.length===0){
        saveData.wave++;
        saveData.highestWave=Math.max(saveData.highestWave,saveData.wave);

        if(saveData.wave%10===0){
            spawnEnemy(true);
        }else{
            for(let i=0;i<3;i++) spawnEnemy();
        }
    }
}

// ============================================
// REBIRTH
// ============================================

function doRebirth(){
    let soulsGain=Math.floor(saveData.highestWave/15)+saveData.stage*2;

    saveData.souls+=soulsGain;
    saveData.rebirths++;

    saveData.stage=1;
    saveData.wave=1;
    saveData.level=1;
    saveData.xp=0;
    books=[];
}

// ============================================
// ACHIEVEMENT CHECK
// ============================================

function checkAchievements(){
    ACHIEVEMENTS.forEach(a=>{
        if(!saveData.achievements.includes(a.id)&&a.check()){
            saveData.achievements.push(a.id);
            saveData.souls+=a.reward;
        }
    });
}

// ============================================
// OFFLINE
// ============================================

function applyOffline(){
    let now=Date.now();
    let diff=(now-saveData.lastSave)/1000;
    let cap=7200+saveData.rebirthShop.offlineCap*3600;
    diff=Math.min(diff,cap);

    saveData.gold+=Math.floor(diff*2);
    saveData.xp+=diff*1;
}

// ============================================
// SAVE / LOAD
// ============================================

function saveGame(){
    saveData.lastSave=Date.now();
    localStorage.setItem("idleArenaFull",JSON.stringify(saveData));
}

function loadGame(){
    let s=localStorage.getItem("idleArenaFull");
    if(s){
        saveData=JSON.parse(s);
        applyOffline();
    }
}

loadGame();

// ============================================
// LOOP (30FPS)
// ============================================

let lastTime=0;

function loop(timestamp){
    let delta=(timestamp-lastTime)/1000;
    lastTime=timestamp;

    attack(delta);
    updateWave();
    checkAchievements();

    if(saveData.xp>=saveData.xpNeeded) levelUp();

    ctx.fillStyle="#111";
    ctx.fillRect(0,0,W,H);

    ctx.fillStyle="#0f0";
    ctx.beginPath();
    ctx.arc(W/2,H/2,30,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle="#f00";
    ctx.fillText("Wave "+saveData.wave,20,20);
    ctx.fillText("Level "+saveData.level,20,40);
    ctx.fillText("Gold "+saveData.gold,20,60);
    ctx.fillText("Souls "+saveData.souls,20,80);

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
setInterval(saveGame,10000);