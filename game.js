// Grim Adventures - Final Corrected Version with Death Screen

// GLOBAL VARIABLES
let playerName = '';
let playerGender = '';
let playerClass = '';
let health, maxHealth, mana, maxMana, xp, level, nextLevelXp;
let inventory = [];
let skills = [];
let x = 25, y = 25;
const mapSize = 50;
const map = [];
const bosses = [
  { x: 0, y: 0 }, { x: 0, y: 49 }, { x: 49, y: 0 }, { x: 49, y: 49 }, { x: 25, y: 25 }
];
let bossesDefeated = 0;
let typingInterval; // Typing tracker

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

// FADE IN MUSIC (corrected)
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
