// ===============================
// UI SYSTEM - INDIE IDLE ARENA
// ===============================

const UI = {

    /* --------------------------
       PANEL CONTROL
    -------------------------- */

    closeAll(){
        document.querySelectorAll(".modal").forEach(m=>{
            m.style.display="none";
        });
    },

    openGoldShop(){
        this.closeAll();
        this.renderGoldShop();
        document.getElementById("goldShop").style.display="flex";
    },

    openRebirthShop(){
        this.closeAll();
        this.renderRebirthShop();
        document.getElementById("rebirthShop").style.display="flex";
    },

    openAchievements(){
        this.closeAll();
        this.renderAchievements();
        document.getElementById("achievementPanel").style.display="flex";
    },

    openCharacter(){
        this.closeAll();
        this.renderCharacters();
        document.getElementById("characterPanel").style.display="flex";
    },

    openBooks(){
        this.closeAll();
        this.renderBooks();
        document.getElementById("bookPanel").style.display="flex";
    },

    /* --------------------------
       HUD UPDATE
    -------------------------- */

    updateHUD(){
        document.getElementById("uiStage").innerText = GAME.stage;
        document.getElementById("uiWave").innerText = GAME.wave;
        document.getElementById("uiLevel").innerText = GAME.level;
        document.getElementById("uiXP").innerText = Math.floor(GAME.xp);
        document.getElementById("uiGold").innerText = Math.floor(GAME.gold);
        document.getElementById("uiSouls").innerText = Math.floor(GAME.souls);
        document.getElementById("uiDamage").innerText = GAME.player.damage.toFixed(1);
        document.getElementById("uiSpeed").innerText = GAME.player.attackSpeed.toFixed(2);
        document.getElementById("uiCrit").innerText = (GAME.player.critChance*100).toFixed(1)+"%";
    },

    /* --------------------------
       GOLD SHOP
    -------------------------- */

    renderGoldShop(){
        const container = document.getElementById("goldShopContent");
        container.innerHTML="";

        GAME.goldShopUpgrades.forEach(upg=>{
            const div=document.createElement("div");
            div.className="shopItem";
            div.innerHTML=`
                <div class="shopTitle">${upg.name}</div>
                <div class="shopDesc">${upg.desc}</div>
                <div>Level: ${upg.level}</div>
                <div>Cost: ${upg.cost}</div>
                <button onclick="UI.buyGoldUpgrade('${upg.id}')">Buy</button>
            `;
            container.appendChild(div);
        });
    },

    buyGoldUpgrade(id){
        const upg=GAME.goldShopUpgrades.find(u=>u.id===id);
        if(GAME.gold>=upg.cost){
            GAME.gold-=upg.cost;
            upg.level++;
            upg.cost=Math.floor(upg.cost*1.5);
            upg.apply();
            this.updateHUD();
            this.renderGoldShop();
        }
    },

    /* --------------------------
       REBIRTH SHOP
    -------------------------- */

    renderRebirthShop(){
        const container=document.getElementById("rebirthShopContent");
        container.innerHTML="";

        GAME.rebirthUpgrades.forEach(upg=>{
            const div=document.createElement("div");
            div.className="shopItem";
            div.innerHTML=`
                <div class="shopTitle">${upg.name}</div>
                <div class="shopDesc">${upg.desc}</div>
                <div>Level: ${upg.level}</div>
                <div>Cost: ${upg.cost} Souls</div>
                <button onclick="UI.buyRebirthUpgrade('${upg.id}')">Buy</button>
            `;
            container.appendChild(div);
        });

        const rebBtn=document.createElement("button");
        rebBtn.innerText="REBIRTH NOW";
        rebBtn.onclick=()=>GAME.rebirth();
        container.appendChild(rebBtn);
    },

    buyRebirthUpgrade(id){
        const upg=GAME.rebirthUpgrades.find(u=>u.id===id);
        if(GAME.souls>=upg.cost){
            GAME.souls-=upg.cost;
            upg.level++;
            upg.cost=Math.floor(upg.cost*2);
            upg.apply();
            this.updateHUD();
            this.renderRebirthShop();
        }
    },

    /* --------------------------
       ACHIEVEMENTS
    -------------------------- */

    renderAchievements(){
        const container=document.getElementById("achievementContent");
        container.innerHTML="";

        GAME.achievements.forEach(a=>{
            const percent=Math.min((a.progress/a.target)*100,100);

            const div=document.createElement("div");
            div.className="achievement";
            div.innerHTML=`
                <div><b>${a.name}</b></div>
                <div>${a.desc}</div>
                <div class="progressBar">
                    <div class="progressFill" style="width:${percent}%"></div>
                </div>
                <div>${a.progress} / ${a.target}</div>
                ${a.claimed?"<div>✔ Claimed</div>":
                  percent>=100?`<button onclick="UI.claimAchievement('${a.id}')">Claim</button>`:""}
            `;
            container.appendChild(div);
        });
    },

    claimAchievement(id){
        const a=GAME.achievements.find(x=>x.id===id);
        if(a.progress>=a.target && !a.claimed){
            a.claimed=true;
            a.reward();
            this.updateHUD();
            this.renderAchievements();
        }
    },

    /* --------------------------
       CHARACTER PANEL
    -------------------------- */

    renderCharacters(){
        const container=document.getElementById("characterContent");
        container.innerHTML="";

        GAME.characters.forEach(c=>{
            const div=document.createElement("div");
            div.className="shopItem";
            div.innerHTML=`
                <div class="shopTitle">${c.name}</div>
                <div class="shopDesc">${c.desc}</div>
                <div>${c.unlocked?"Unlocked":"Locked"}</div>
                ${c.unlocked?`<button onclick="UI.selectCharacter('${c.id}')">Select</button>`:""}
            `;
            container.appendChild(div);
        });
    },

    selectCharacter(id){
        GAME.selectCharacter(id);
        this.updateHUD();
        this.renderCharacters();
    },

    /* --------------------------
       BOOK INVENTORY
    -------------------------- */

    renderBooks(){
        const container=document.getElementById("bookContent");
        container.innerHTML="";

        if(GAME.books.length===0){
            container.innerHTML="<div>No Books</div>";
            return;
        }

        GAME.books.forEach((b,index)=>{
            const div=document.createElement("div");
            div.className=`bookCard ${b.rarity}`;
            div.innerHTML=`
                <div class="bookTitle">${b.name} Lv${b.level}</div>
                <div class="bookDesc">${b.desc}</div>
                <div>Total Bonus: ${b.totalText()}</div>
                <button onclick="UI.deleteBook(${index})">Delete</button>
            `;
            container.appendChild(div);
        });
    },

    deleteBook(index){
        GAME.removeBook(index);
        this.renderBooks();
        this.updateHUD();
    }

};