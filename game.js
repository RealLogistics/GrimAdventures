// Grim Adventures Full Final Version

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

// MUSIC FADE IN
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

  if (currentTile === "🧟" || currentTile === "🧛‍♂️" || currentTile === "🐍" || currentTile === "🐲") {
    autoFight(currentTile);
    worldMap[y][x] = "🌲";
  } else if (currentTile === "🏰") {
    typeStory("🏰 You arrive at a peaceful village. Travelers greet you warmly.");
  } else if (currentTile === "🛖") {
    typeStory("🛖 You find a small hut. An old woman offers you tea.");
  } else if (currentTile === "🤠") {
    const messages = [
      "🤠 'The graveyards are dangerous. Watch yourself.'",
      "🤠 'They say a dragon sleeps to the east.'",
      "🤠 'Stay out of the swamp at night, traveler.'",
      "🤠 'Legends speak of a lost relic hidden in the mist.'"
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

// EXPLORE
function explore() {
  sounds.explore.play();
  const find = Math.random();
  if (find < 0.3) {
    health = Math.min(health + 20, maxHealth);
    typeStory("You find a healing spring. +20 Health.");
  } else if (find < 0.6) {
    mana = Math.min(mana + 20, maxMana);
    typeStory("You find a glowing mana shard. +20 Mana.");
  } else {
    inventory.push("Relic");
    typeStory("You discover an ancient relic!");
  }
  updateStats();
}

// REST
function rest() {
  health = Math.min(health + 30, maxHealth);
  mana = Math.min(mana + 30, maxMana);
  sounds.rest.play();
  typeStory("You rest under a calm clearing, regaining strength.");
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
        if (tile === "🌲" || tile === "🐸" || tile === "🪦") {
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

// FIGHT
function fight() {
  let enemy;
  if (bosses.some(b => b.x === x && b.y === y)) {
    enemy = { name: "Ancient Wyrm", hp: 250, attack: 60, xp: 300 };
    sounds.boss.play();
  } else {
    enemy = enemies[Math.floor(Math.random() * enemies.length)];
    sounds.attack.play();
  }

  const playerAttack = Math.floor(Math.random() * 50) + (skills.length * 5);

  if (skills.includes("Rain of Arrows")) animateSkill("Rain of Arrows");
  else if (skills.includes("Fireball")) animateSkill("Fireball");
  else if (skills.includes("Shield Strike")) animateSkill("Shield Strike");
  else if (skills.includes("Necromancy")) animateSkill("Necromancy");

  if (playerAttack >= enemy.hp) {
    typeStory(`You defeated the ${enemy.name}! +${enemy.xp} XP.`);
    gainXp(enemy.xp);
    if (enemy.name === "Ancient Wyrm") bossesDefeated++;
  } else {
    const damage = enemy.attack - (inventory.includes("Rare Armor") ? 10 : 0);
    health -= damage;
    typeStory(`The ${enemy.name} wounded you! -${damage} HP.`);
    if (health <= 0) {
      triggerDeath();
      return;
    }
  }

  drawMap();
  updateStats();
  checkVictory();
}

// AUTO FIGHT (step on enemy)
function autoFight(enemyEmoji) {
  sounds.attack.play();

  let enemy;
  if (enemyEmoji === "🐲") {
    enemy = { name: "Ancient Drake", hp: 200, attack: 50, xp: 250 };
  } else {
    enemy = { name: "Wandering Foe", hp: 80, attack: 20, xp: 50 };
  }

  const playerAttack = Math.floor(Math.random() * 50) + (skills.length * 5);

  if (skills.includes("Rain of Arrows")) animateSkill("Rain of Arrows");
  else if (skills.includes("Fireball")) animateSkill("Fireball");
  else if (skills.includes("Shield Strike")) animateSkill("Shield Strike");
  else if (skills.includes("Necromancy")) animateSkill("Necromancy");

  if (playerAttack >= enemy.hp) {
    typeStory(`You defeated the ${enemy.name}! +${enemy.xp} XP.`);
    gainXp(enemy.xp);
  } else {
    const damage = enemy.attack - (inventory.includes("Rare Armor") ? 10 : 0);
    health -= damage;
    typeStory(`The ${enemy.name} wounded you! -${damage} HP.`);
    if (health <= 0) {
      triggerDeath();
      return;
    }
  }

  drawMap();
  updateStats();
}
// TYPE STORY TEXT (typing effect)
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

// UPDATE PLAYER STATS DISPLAY
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

// ANIMATE SKILL USE
function animateSkill(skillName) {
  const skillDiv = document.getElementById('skill-animation');
  let animation = '';

  if (skillName === "Rain of Arrows") {
    animation = "🏹🌧️🏹🌧️";
  } else if (skillName === "Fireball") {
    animation = "🔥💥🔥💥";
  } else if (skillName === "Shield Strike") {
    animation = "🛡️💥";
  } else if (skillName === "Necromancy") {
    animation = "☠️💀👻";
  }

  skillDiv.innerText = animation;
  skillDiv.style.display = 'flex';
  
  setTimeout(() => {
    skillDiv.style.display = 'none';
  }, 1000);
}

// GAIN XP + LEVEL UP
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
    unlockSkill();
    typeStory(`Level up! You are now Level ${level}.`);
    updateStats();
  }
}

// SPARKLE EFFECT ON LEVEL UP
function sparkleEffect() {
  const mist = document.getElementById('mist');
  mist.style.opacity = 0.4;
  setTimeout(() => {
    mist.style.opacity = 0.1;
  }, 1000);
}

// UNLOCK NEW SKILLS
function unlockSkill() {
  const unlocks = {
    Knight: ["Shield Strike"],
    Mage: ["Fireball", "Necromancy"],
    Rogue: ["Rain of Arrows"]
  };
  const options = unlocks[playerClass];
  if (options && skills.length < options.length + 1) {
    skills.push(options[skills.length - 1]);
  }
}

// DEATH SCREEN
function triggerDeath() {
  document.getElementById('game-container').style.display = 'none';

  const deathScreen = document.createElement('div');
  deathScreen.id = 'death-screen';
  deathScreen.style.position = 'fixed';
  deathScreen.style.top = '0';
  deathScreen.style.left = '0';
  deathScreen.style.width = '100%';
  deathScreen.style.height = '100%';
  deathScreen.style.background = 'black';
  deathScreen.style.color = 'red';
  deathScreen.style.display = 'flex';
  deathScreen.style.flexDirection = 'column';
  deathScreen.style.alignItems = 'center';
  deathScreen.style.justifyContent = 'center';
  deathScreen.style.fontSize = '3em';
  deathScreen.innerHTML = `
    <p>☠️ You Died ☠️</p>
    <button onclick="restartGame()" style="font-size: 1em; padding: 10px 20px; margin-top: 20px;">Restart</button>
  `;
  document.body.appendChild(deathScreen);
}

// RESTART GAME
function restartGame() {
  location.reload();
}

// RANDOM WEATHER EFFECT
function randomWeather() {
  const mist = document.getElementById('mist');
  const chance = Math.random();
  mist.style.opacity = chance < 0.3 ? 0.2 : 0.1;
}

// START GAME
function startGame() {
  const selectedClass = document.getElementById('player-class').value;
  chooseClass(selectedClass);
}

// CHOOSE CLASS
function chooseClass(selectedClass) {
  playerName = document.getElementById('player-name').value || 'Unknown';
  playerGender = document.getElementById('player-gender').value;
  playerClass = selectedClass;

  document.getElementById('character-creation').style.display = 'none';
  document.getElementById('player-stats').style.display = 'block';
  document.getElementById('choices').style.display = 'block';

  inventory = [];
  xp = 0;
  level = 1;
  nextLevelXp = 100;
  skills = [];

  if (playerClass === 'Knight') {
    health = maxHealth = 150;
    mana = maxMana = 30;
    inventory.push("Sword");
    skills = ["Power Strike"];
    document.getElementById('hero-portrait').src = "portraits/knight.png";
  } else if (playerClass === 'Mage') {
    health = maxHealth = 80;
    mana = maxMana = 120;
    inventory.push("Spellbook");
    skills = ["Fireball"];
    document.getElementById('hero-portrait').src = "portraits/mage.png";
  } else if (playerClass === 'Rogue') {
    health = maxHealth = 100;
    mana = maxMana = 60;
    inventory.push("Dagger");
    skills = ["Backstab"];
    document.getElementById('hero-portrait').src = "portraits/rogue.png";
  }

  initWorld();
  drawMap();
  updateStats();
  typeStory(`${playerName} the ${playerClass} steps into the misty unknown...`);
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

