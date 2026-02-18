// ==========================================
// INDIE IDLE ARENA - CORE ENGINE
// ==========================================

const FPS = 30;
const SAVE_KEY = "indie_idle_save_v1";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ==========================================
// MAIN GAME OBJECT
// ==========================================

const GAME = {

    // -------- CORE STATS --------
    stage: 1,
    wave: 1,
    level: 1,
    xp: 0,
    xpNeed: 50,
    gold: 0,
    souls: 0,
    endless: false,

    enemies: [],
    particles: [],
    floatingTexts: [],
    books: [],
    bookSlots: 3,

    // -------- PLAYER --------
    player: {
        x: canvas.width/2,
        y: canvas.height/2,
        hp: 100,
        maxHp: 100,
        damage: 10,
        attackSpeed: 1,
        critChance: 0.05,
        critDamage: 2,
        goldGain: 1,
        xpGain: 1
    },

    // -------- CHARACTERS --------
    characters: [
        {id:"warrior",name:"Warrior",desc:"+10% Damage",unlocked:true,
            apply(){GAME.player.damage*=1.1}},
        {id:"berserker",name:"Berserker",desc:"+20% Crit Damage",unlocked:false,
            apply(){GAME.player.critDamage*=1.2}},
        {id:"sage",name:"Sage",desc:"+20% XP Gain",unlocked:false,
            apply(){GAME.player.xpGain*=1.2}},
        {id:"guardian",name:"Guardian",desc:"+30 HP",unlocked:false,
            apply(){GAME.player.maxHp+=30;GAME.player.hp+=30}}
    ],

    currentCharacter:"warrior",

    // -------- GOLD SHOP --------
    goldShopUpgrades:[
        {id:"dmg",name:"Damage Boost",desc:"+5% Damage",
            level:0,cost:50,
            apply(){GAME.player.damage*=1.05}},
        {id:"speed",name:"Attack Speed",desc:"+5% Speed",
            level:0,cost:80,
            apply(){GAME.player.attackSpeed*=1.05}},
        {id:"gold",name:"Gold Gain",desc:"+5% Gold",
            level:0,cost:100,
            apply(){GAME.player.goldGain*=1.05}},
        {id:"xp",name:"XP Gain",desc:"+5% XP",
            level:0,cost:100,
            apply(){GAME.player.xpGain*=1.05}}
    ],

    // -------- REBIRTH SHOP --------
    rebirthUpgrades:[
        {id:"globalDmg",name:"Global Damage",desc:"+10% Permanent Damage",
            level:0,cost:5,
            apply(){GAME.player.damage*=1.1}},
        {id:"legendary",name:"Legendary Chance",desc:"+0.001 Legendary Chance",
            level:0,cost:10,
            apply(){GAME.legendaryBonus+=0.001}},
        {id:"bookSlot",name:"Extra Book Slot",desc:"+1 Book Slot",
            level:0,cost:20,
            apply(){GAME.bookSlots++}}
    ],

    legendaryBonus:0,

    // -------- ACHIEVEMENTS --------
    achievements:[
        {id:"kill100",name:"First Blood",desc:"Kill 100 Enemies",
            progress:0,target:100,claimed:false,
            reward(){GAME.souls+=5}},
        {id:"reach10",name:"Level 10",desc:"Reach Level 10",
            progress:0,target:10,claimed:false,
            reward(){GAME.souls+=10}}
    ],

    // ==========================================
    // INIT
    // ==========================================

    init(){
        this.load();
        this.selectCharacter(this.currentCharacter);
        this.spawnWave();
        setInterval(()=>this.loop(),1000/FPS);
        this.handleOffline();
    },

    // ==========================================
    // LOOP
    // ==========================================

    loop(){
        this.update();
        this.render();
        if(window.UI) UI.updateHUD();
    },

    update(){

        // Attack
        if(Math.random() < this.player.attackSpeed*0.03){
            this.attack();
        }

        // Enemy update
        this.enemies.forEach((e,i)=>{
            e.y += e.speed;
            if(e.y > canvas.height){
                this.player.hp -= e.damage;
                this.enemies.splice(i,1);
            }
        });

        // Wave clear
        if(this.enemies.length===0){
            this.wave++;
            if(this.wave%10===0) this.spawnBoss();
            else this.spawnWave();
        }

        if(this.player.hp<=0) this.rebirth();
    },

    // ==========================================
    // SPAWN
    // ==========================================

    spawnWave(){
        for(let i=0;i<5+this.wave;i++){
            this.enemies.push({
                x:Math.random()*canvas.width,
                y:-50,
                hp:20+this.wave*5,
                speed:1+this.stage*0.2,
                damage:5
            });
        }
    },

    spawnBoss(){
        this.enemies.push({
            x:canvas.width/2,
            y:-100,
            hp:300+this.wave*20,
            speed:0.5,
            damage:20,
            boss:true
        });
    },

    // ==========================================
    // ATTACK
    // ==========================================

    attack(){
        if(this.enemies.length===0) return;

        let target=this.enemies[0];
        let dmg=this.player.damage;

        let crit=false;
        if(Math.random()<this.player.critChance){
            dmg*=this.player.critDamage;
            crit=true;
        }

        target.hp-=dmg;

        this.floatingTexts.push({
            x:target.x,
            y:target.y,
            text:Math.floor(dmg),
            color:crit?"yellow":"red"
        });

        this.particles.push({x:target.x,y:target.y});

        if(target.hp<=0){
            this.gold+=5*this.player.goldGain;
            this.addXP(10*this.player.xpGain);
            this.enemies.shift();
            this.achievements[0].progress++;
        }
    },

    // ==========================================
    // XP
    // ==========================================

    addXP(val){
        this.xp+=val;
        if(this.xp>=this.xpNeed){
            this.xp=0;
            this.level++;
            this.xpNeed*=1.3;
            this.achievements[1].progress=this.level;
            this.levelUpReward();
        }
    },

    levelUpReward(){
        if(this.books.length<this.bookSlots){
            const book=this.generateBook();
            this.books.push(book);
        }
    },

    // ==========================================
    // BOOK SYSTEM
    // ==========================================

    generateBook(){
        const rarityRoll=Math.random();
        let rarity="common";
        if(rarityRoll<0.001+this.legendaryBonus) rarity="legendary";
        else if(rarityRoll<0.05) rarity="epic";
        else if(rarityRoll<0.2) rarity="rare";

        const types=[
            {name:"Fury Tome",desc:"+5% Damage",apply(){GAME.player.damage*=1.05}},
            {name:"Swift Codex",desc:"+5% Speed",apply(){GAME.player.attackSpeed*=1.05}},
            {name:"Greed Manual",desc:"+5% Gold",apply(){GAME.player.goldGain*=1.05}},
            {name:"Wisdom Scroll",desc:"+5% XP",apply(){GAME.player.xpGain*=1.05}}
        ];

        const t=types[Math.floor(Math.random()*types.length)];

        return {
            name:t.name,
            desc:t.desc,
            rarity:rarity,
            level:1,
            apply:t.apply,
            totalText(){return this.desc}
        };
    },

    removeBook(index){
        this.books.splice(index,1);
    },

    // ==========================================
    // REBIRTH
    // ==========================================

    rebirth(){
        this.souls+=Math.floor(this.level/5);
        this.stage=1;
        this.wave=1;
        this.level=1;
        this.gold=0;
        this.xp=0;
        this.player.hp=this.player.maxHp;
        this.enemies=[];
        this.spawnWave();
        this.save();
    },

    // ==========================================
    // CHARACTER
    // ==========================================

    selectCharacter(id){
        this.currentCharacter=id;
        const c=this.characters.find(x=>x.id===id);
        if(c) c.apply();
    },

    // ==========================================
    // RENDER
    // ==========================================

    render(){

        ctx.clearRect(0,0,canvas.width,canvas.height);

        // background
        let grd=ctx.createLinearGradient(0,0,0,canvas.height);
        grd.addColorStop(0,"#111");
        grd.addColorStop(1,"#000");
        ctx.fillStyle=grd;
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // player
        ctx.fillStyle="white";
        ctx.beginPath();
        ctx.arc(this.player.x,this.player.y,20,0,Math.PI*2);
        ctx.fill();

        // enemies
        this.enemies.forEach(e=>{
            ctx.fillStyle=e.boss?"purple":"red";
            ctx.beginPath();
            ctx.arc(e.x,e.y,e.boss?30:15,0,Math.PI*2);
            ctx.fill();
        });

        // particles
        this.particles.forEach((p,i)=>{
            ctx.fillStyle="red";
            ctx.fillRect(p.x,p.y,3,3);
            this.particles.splice(i,1);
        });

        // floating damage
        this.floatingTexts.forEach((t,i)=>{
            ctx.fillStyle=t.color;
            ctx.fillText(t.text,t.x,t.y);
            t.y-=1;
            if(t.y<0) this.floatingTexts.splice(i,1);
        });
    },

    // ==========================================
    // SAVE / LOAD / OFFLINE
    // ==========================================

    save(){
        localStorage.setItem(SAVE_KEY,JSON.stringify({
            stage:this.stage,
            wave:this.wave,
            level:this.level,
            souls:this.souls,
            gold:this.gold,
            last:Date.now()
        }));
    },

    load(){
        const s=localStorage.getItem(SAVE_KEY);
        if(!s) return;
        const data=JSON.parse(s);
        Object.assign(this,data);
    },

    handleOffline(){
        const s=localStorage.getItem(SAVE_KEY);
        if(!s) return;
        const data=JSON.parse(s);
        const diff=(Date.now()-data.last)/1000;
        const goldGain=Math.min(diff*2,3600);
        this.gold+=goldGain;
    }

};

// ==========================================
// START GAME
// ==========================================

window.onload=()=>{
    GAME.init();
};