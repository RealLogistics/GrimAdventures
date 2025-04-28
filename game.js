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
