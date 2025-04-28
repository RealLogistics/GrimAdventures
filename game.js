// Grim Adventures - Final Full JS

// GLOBAL VARIABLES
let playerName = '';
let playerGender = '';
let playerClass = '';
let health, maxHealth, mana, maxMana, xp, level, nextLevelXp;
let inventory = [];
let skills = [];
let x = 25, y = 25;
const worldSize = 50;
const worldMap = [];
const bosses = [
  { x: 0, y: 0 }, { x: 0, y: 49 }, { x: 49, y: 0 }, { x: 49, y: 49 }, { x: 25, y: 25 }
];
let bossesDefeated = 0;
let typingInterval;

// ENEMIES
const enemies = [
  { name: "Goblin", hp: 30, attack: 10, xp: 20 },
  { name: "Zombie", hp: 40, attack: 15, xp: 30 },
  { name: "Bandit", hp: 50, attack: 20, xp: 40 },
  { name: "Drake", hp: 80, attack: 30, xp: 70 },
  { name: "Shadow Beast", hp: 60, attack: 25, xp: 50 },
  { name: "Dark Witch", hp: 70, attack: 30, xp: 60 },
  { name: "Revenant", hp: 90, attack: 35, xp: 80 }
];

// SOUND EFFECTS
const sounds = {
  attack: new Audio('sounds/attack.mp3'),
  explore: new Audio('sounds/explore.mp3'),
  rest: new Audio('sounds/rest.mp3'),
  levelup: new Audio('sounds/levelup.mp3'),
  boss: new Audio('sounds/boss.mp3')
};

// BACKGROUND MUSIC FADE IN
const bgMusic = document.getElementById('bg-music');
bgMusic.volume = 0;
bgMusic.addEventListener('canplaythrough', () => {
  let vol = 0;
  const fadeIn = setInterval(() => {
    vol = Math.min(vol + 0.01, 1);
    bgMusic.volume = vol;
    if (vol >= 1) clearInterval(fadeIn);
  }, 50);
});

// INIT WORLD
function initWorld() {
  for (let i = 0; i < worldSize; i++) {
    worldMap[i] = [];
    for (let j = 0; j < worldSize; j++) {
      const rand = Math.random();
      if (rand < 0.03) worldMap[i][j] = "🏰"; 
      else if (rand < 0.06) worldMap[i][j] = "🛖"; 
      else if (rand < 0.09) worldMap[i][j] = "🤠"; 
      else if (rand < 0.14) worldMap[i][j] = "🌫️"; 
      else if (rand < 0.3) worldMap[i][j] = "🐸"; 
      else if (rand < 0.5) worldMap[i][j] = "⛰️"; 
      else if (rand < 0.6) worldMap[i][j] = "🪦"; 
      else worldMap[i][j] = "🌲";
    }
  }
}

// DRAW MAP
function drawMap() {
  const mapDiv = document.getElementById('game-map');
  mapDiv.innerHTML = '';

  for (let row = y - 2; row <= y + 2; row++) {
    for (let col = x - 2; col <= x + 2; col++) {
      if (row === y && col === x) {
        mapDiv.innerHTML += "🧝 ";
      } else if (row >= 0 && col >= 0 && row < worldSize && col < worldSize) {
        mapDiv.innerHTML += worldMap[row][col] + " ";
      } else {
        mapDiv.innerHTML += "⬛ ";
      }
    }
    mapDiv.innerHTML += "<br>";
  }
}

// MOVE
function move(direction) {
  if (direction === 'north' && y > 0) y--;
  else if (direction === 'south' && y < worldSize - 1) y++;
  else if (direction === 'west' && x > 0) x--;
  else if (direction === 'east' && x < worldSize - 1) x++;
  else {
    typeStory("You can't go that way.");
    return;
  }

  const currentTile = worldMap[y][x];

  if (["🧟", "🧛‍♂️", "🐍", "🐲"].includes(currentTile)) {
    autoFight(currentTile);
    worldMap[y][x] = "🌲";
  } else if (currentTile === "🏰") {
    typeStory("🏰 You arrive at a peaceful village.");
  } else if (currentTile === "🛖") {
    typeStory("🛖 A kind hermit invites you inside.");
  } else if (currentTile === "🤠") {
    const messages = [
      "🤠 'Beware the graveyards!'",
      "🤠 'A dragon sleeps to the east.'",
      "🤠 'Lost relics hide in the mist.'"
    ];
    typeStory(messages[Math.floor(Math.random() * messages.length)]);
  } else {
    spawnEnemiesNearby();
    randomWeather();
    typeStory(`You move ${direction} into the misty unknown...`);
  }

  drawMap();
  updateStats();
}

// SPAWN ENEMIES NEARBY
function spawnEnemiesNearby() {
  const spawnChance = 0.15;
  const graveyardBonus = 0.3;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dy === 0 && dx === 0) continue;
      const newY = y + dy;
      const newX = x + dx;
      if (newY >= 0 && newY < worldSize && newX >= 0 && newX < worldSize) {
        const tile = worldMap[newY][newX];
        if (["🌲", "🐸", "🪦"].includes(tile)) {
          const bonus = (tile === "🪦" || tile === "🐸") ? graveyardBonus : 0;
          if (Math.random() < (spawnChance + bonus)) {
            worldMap[newY][newX] = randomEnemyEmoji();
          }
        }
      }
    }
  }
}

function randomEnemyEmoji() {
  const enemies = ["🧟", "🧛‍♂️", "🐍", "🐲"];
  return enemies[Math.floor(Math.random() * enemies.length)];
}

// EXPLORE / REST
function explore() {
  sounds.explore.play();
  const find = Math.random();
  if (find < 0.3) {
    health = Math.min(health + 20, maxHealth);
    typeStory("You find a healing spring!");
  } else if (find < 0.6) {
    mana = Math.min(mana + 20, maxMana);
    typeStory("You find a glowing mana shard.");
  } else {
    inventory.push("Relic");
    typeStory("You discover an ancient relic!");
  }
  updateStats();
}

function rest() {
  health = Math.min(health + 30, maxHealth);
  mana = Math.min(mana + 30, maxMana);
  sounds.rest.play();
  typeStory("You rest and regain strength.");
  updateStats();
}

// FIGHT
function fight() {
  sounds.attack.play();
  const enemy = enemies[Math.floor(Math.random() * enemies.length)];
  const playerAttack = Math.floor(Math.random() * 50) + (skills.length * 5);

  if (playerAttack >= enemy.hp) {
    typeStory(`You defeated a ${enemy.name}! +${enemy.xp} XP`);
    gainXp(enemy.xp);
  } else {
    const damage = enemy.attack;
    health -= damage;
    typeStory(`The ${enemy.name} wounded you! -${damage} HP`);
    if (health <= 0) triggerDeath();
  }

  drawMap();
  updateStats();
}

function autoFight(enemyEmoji) {
  fight();
}

// XP + LEVEL UP
function gainXp(amount) {
  xp += amount;
  if (xp >= nextLevelXp) {
    level++;
    xp = 0;
    nextLevelXp += 50;
    health = Math.min(health + 50, maxHealth);
    mana = Math.min(mana + 30, maxMana);
    sounds.levelup.play();
    sparkleEffect();
    typeStory(`Level up! You are now level ${level}!`);
    updateStats();
  }
}

// STORY TYPING EFFECT
function typeStory(text) {
  clearInterval(typingInterval);
  const storyText = document.getElementById('story-text');
  storyText.innerHTML = '';
  let i = 0;
  typingInterval = setInterval(() => {
    if (i < text.length) {
      storyText.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(typingInterval);
    }
  }, 30);
}

// UPDATE STATS
function updateStats() {
  document.getElementById('health').innerText = health;
  document.getElementById('mana').innerText = mana;
  document.getElementById('xp').innerText = xp;
  document.getElementById('nextLevelXp').innerText = nextLevelXp;
  document.getElementById('level').innerText = level;
  document.getElementById('inventory').innerText = inventory.join(', ') || 'Empty';
  document.getElementById('skills').innerText = skills.join(', ') || 'None';
  document.getElementById('x').innerText = x;
  document.getElementById('y').innerText = y;
}

// SPARKLE
function sparkleEffect() {
  const mist = document.getElementById('mist');
  mist.style.opacity = 0.4;
  setTimeout(() => {
    mist.style.opacity = 0.1;
  }, 1000);
}

// DEATH
function triggerDeath() {
  document.getElementById('game-container').style.display = 'none';
  const deathScreen = document.createElement('div');
  deathScreen.id = 'death-screen';
  deathScreen.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:black;color:red;font-size:3em;display:flex;align-items:center;justify-content:center;flex-direction:column;";
  deathScreen.innerHTML = `
    ☠️ You Died ☠️
    <button onclick="restartGame()" style="margin-top:20px;font-size:1em;padding:10px;">Restart</button>
  `;
  document.body.appendChild(deathScreen);
}

function restartGame() {
  location.reload();
}

// RANDOM WEATHER
function randomWeather() {
  const mist = document.getElementById('mist');
  mist.style.opacity = Math.random() < 0.3 ? 0.2 : 0.1;
}

// START GAME
function startGame() {
  playerName = document.getElementById('player-name').value || 'Unknown';
  playerGender = document.getElementById('player-gender').value;
  playerClass = document.getElementById('player-class').value;

  if (!playerClass) {
    alert("Please choose a class!");
    return;
  }

  document.getElementById('player-name-display').innerText = playerName;

  initWorld();
  chooseClass(playerClass);

  document.getElementById('character-creation').style.display = 'none';
  document.getElementById('player-stats').style.display = 'block';
  drawMap();
  typeStory(`${playerName} the ${playerClass} steps into the misty unknown...`);
}

// CHOOSE CLASS
function chooseClass(selectedClass) {
  inventory = [];
  skills = [];
  xp = 0;
  level = 1;
  nextLevelXp = 100;

  if (selectedClass === 'Knight') {
    health = maxHealth = 150;
    mana = maxMana = 30;
    inventory.push("Sword");
    skills = ["Shield Strike"];
    document.getElementById('hero-portrait').src = "portraits/knight.png";
  } else if (selectedClass === 'Mage') {
    health = maxHealth = 80;
    mana = maxMana = 120;
    inventory.push("Spellbook");
    skills = ["Fireball"];
    document.getElementById('hero-portrait').src = "portraits/mage.png";
  } else if (selectedClass === 'Rogue') {
    health = maxHealth = 100;
    mana = maxMana = 60;
    inventory.push("Dagger");
    skills = ["Rain of Arrows"];
    document.getElementById('hero-portrait').src = "portraits/rogue.png";
  }

  updateStats(); // ✅ IMPORTANT
}

// ON PAGE LOAD
window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const gameContainer = document.getElementById('game-container');
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    gameContainer.style.display = 'block';
  }, 1500);
});
