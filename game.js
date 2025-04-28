// Grim Adventures - Final Version with Upgrades

// GLOBAL VARIABLES
let playerName = '';
let playerGender = '';
let playerClass = '';
let health, mana, xp, level, nextLevelXp;
let inventory = [];
let skills = [];
let x = 25, y = 25; // Start in center of 50x50 map
const mapSize = 50;
const map = [];
const bosses = [
  { x: 0, y: 0 }, { x: 0, y: 49 }, { x: 49, y: 0 }, { x: 49, y: 49 }, { x: 25, y: 25 }
];
let bossesDefeated = 0;

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
  boss: new Audio('sounds/boss.mp3'),
  rain: new Audio('sounds/rain.mp3'),
  thunder: new Audio('sounds/thunder.mp3')
};

// FADE IN MUSIC
const bgMusic = document.getElementById('bg-music');
bgMusic.volume = 0;
bgMusic.addEventListener('canplaythrough', () => {
  let vol = 0;
  const fadeIn = setInterval(() => {
    if (vol < 1) {
      vol += 0.01;
      bgMusic.volume = vol;
    } else {
      clearInterval(fadeIn);
    }
  }, 50);
});

// START GAME
function startGame() {
  const fade = document.getElementById('fade-overlay');
  const spinner = document.getElementById('loading-spinner');
  fade.style.opacity = 1;
  spinner.style.opacity = 1;

  setTimeout(() => {
    const selectedClass = document.getElementById('player-class').value;
    chooseClass(selectedClass);
    fade.style.opacity = 0;
    spinner.style.opacity = 0;
  }, 1000);
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
  health = 150;
  mana = 30;
  inventory.push("Sword");
  skills = ["Power Strike"];
  document.getElementById('hero-portrait').src = "portraits/knight.png";
} else if (playerClass === 'Mage') {
  health = 80;
  mana = 120;
  inventory.push("Spellbook");
  skills = ["Fireball"];
  document.getElementById('hero-portrait').src = "portraits/mage.png";
} else if (playerClass === 'Rogue') {
  health = 100;
  mana = 60;
  inventory.push("Dagger");
  skills = ["Backstab"];
  document.getElementById('hero-portrait').src = "portraits/rogue.png";
 }
}
