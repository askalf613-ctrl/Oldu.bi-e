// =====================
// CORE FIXED ENGINE
// =====================

const FPS = 30;
const FRAME = 1000 / FPS;

let enemyHP = 10;
let clickBoost = 0;
let clickTimer = 0;

function baseDamage(){
    return 1 + (game.shops.damage * 0.15);
}

function totalDamage(){
    let dmg = baseDamage();
    dmg *= (1 + (game.itemBonus?.damage || 0));
    dmg *= (1 + clickBoost);
    return dmg;
}

function getDPS(){
    let speed = 1 + (game.shops.attackSpeed * 0.1);
    return totalDamage() * speed;
}

function spawnEnemy(){
    enemyHP = 10 * Math.pow(1.15, game.wave);
}

function killEnemy(){
    let reward = enemyHP * 0.6;
    game.gold += reward;
    game.wave++;
    game.totalKills++;
    spawnEnemy();
}

function update(delta){

    // AUTO ATTACK
    enemyHP -= getDPS() * (delta/1000);

    if(enemyHP <= 0){
        killEnemy();
    }

    // CLICK BOOST TIMER
    if(clickTimer > 0){
        clickTimer -= delta;
        if(clickTimer <= 0){
            clickBoost = 0;
        }
    }

    // XP
    game.xp += delta/1000;
    if(game.xp >= game.xpToNext){
        game.level++;
        game.xp = 0;
        game.xpToNext *= 1.25;
    }
}

function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Gradient background
    let g = ctx.createLinearGradient(0,0,0,canvas.height);
    g.addColorStop(0,"#0a0a1f");
    g.addColorStop(1,"#000");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Ground glow
    ctx.fillStyle = "rgba(0,255,255,0.05)";
    ctx.fillRect(0,canvas.height*0.6,canvas.width,canvas.height);

    // PLAYER (center)
    ctx.shadowColor = "cyan";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 30, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ENEMY HP BAR
    ctx.fillStyle="red";
    ctx.fillRect(
        canvas.width/2 - 150,
        canvas.height/2 - 100,
        (enemyHP / (10*Math.pow(1.15,game.wave))) * 300,
        15
    );

    // Floating particles
    for(let i=0;i<20;i++){
        ctx.fillStyle="rgba(255,255,255,0.02)";
        ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,2,2);
    }

    document.getElementById("gold").innerText = Math.floor(game.gold);
    document.getElementById("level").innerText = game.level;
    document.getElementById("wave").innerText = game.wave;
    document.getElementById("dps").innerText = getDPS().toFixed(1);
}

let last = 0;
function loop(t){
    if(!last) last = t;
    let delta = t - last;

    if(delta >= FRAME){
        update(delta);
        draw();
        last = t;
    }
    requestAnimationFrame(loop);
}

// CLICK BOOST
canvas.addEventListener("click",()=>{
    clickBoost += 0.2;
    clickTimer = 2000; // 2 saniye boost
});

// INIT
spawnEnemy();
requestAnimationFrame(loop);