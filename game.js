// Grim Adventures - Full Final Version

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

document.getElementById('player-title').innerText = `${playerName} the ${playerClass}`;

initMap();
updateStats();
changeBackground('dark_forest_background.jpg');
typeStory(`${playerName} the ${playerClass} steps into the misty unknown...`);
}

// INIT MAP
function initMap() {
for (let i = 0; i < mapSize; i++) {
map[i] = [];
for (let j = 0; j < mapSize; j++) {
map[i][j] = false;
}
}
map[y][x] = true;
renderMap();
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
renderMap();
}

// TYPING EFFECT
function typeStory(text) {
let storyText = document.getElementById('story-text');
storyText.innerHTML = '';
let i = 0;
let typing = setInterval(() => {
if (i < text.length) {
storyText.innerHTML += text.charAt(i);
i++;
} else {
clearInterval(typing);
}
}, 30);
}

// RENDER MAP
function renderMap() {
const mapDiv = document.getElementById('map');
mapDiv.innerHTML = '';
for (let i = y - 2; i <= y + 2; i++) {
for (let j = x - 2; j <= x + 2; j++) {
const div = document.createElement('div');
div.className = 'tile';
if (i >= 0 && i < mapSize && j >= 0 && j < mapSize) {
if (map[i][j]) div.classList.add('revealed');
}
mapDiv.appendChild(div);
}
}
}

// MOVE
function move(direction) {
if (direction === 'north' && y > 0) y--;
else if (direction === 'south' && y < mapSize - 1) y++;
else if (direction === 'east' && x < mapSize - 1) x++;
else if (direction === 'west' && x > 0) x--;
else {
typeStory("You cannot go that way.");
return;
}

map[y][x] = true;
randomWeather();
typeStory(`You move ${direction} into the shifting mist...`);
changeBackground('dark_forest_background.jpg');
updateStats();
}

// RANDOM WEATHER
function randomWeather() {
const chance = Math.random();
if (chance < 0.05) {
sounds.thunder.play();
} else if (chance < 0.10) {
sounds.rain.play();
}
}

// CHANGE BACKGROUND
function changeBackground(imageFile) {
document.body.style.backgroundImage = `url('${imageFile}')`;
}

// EXPLORE
function explore() {
sounds.explore.play();
const eventChance = Math.random();
if (eventChance < 0.1) {
rareEvent();
} else {
const find = Math.random();
if (find < 0.3) {
health += 20;
typeStory("You find a healing spring. +20 Health.");
} else if (find < 0.6) {
mana += 20;
typeStory("You find a glowing mana shard. +20 Mana.");
} else {
inventory.push("Relic");
typeStory("You discover an ancient relic!");
}
}
changeBackground('dark_forest_background.jpg');
updateStats();
}

// RARE EVENT
function rareEvent() {
const event = Math.random();
if (event < 0.5) {
typeStory("A portal appears! You are teleported randomly.");
x = Math.floor(Math.random() * mapSize);
y = Math.floor(Math.random() * mapSize);
changeBackground('magic_portal.jpg');
} else {
typeStory("You find an Ancient Shrine. +100 XP!");
gainXp(100);
changeBackground('magic_portal.jpg');
}
}

// REST
function rest() {
health += 30;
mana += 30;
sounds.rest.play();
typeStory("You rest under a calm clearing, regaining strength.");
changeBackground('calm_clearing.jpg');
updateStats();
}

// FIGHT
function fight() {
let enemy;
if (bosses.some(b => b.x === x && b.y === y)) {
enemy = { name: "Ancient Wyrm", hp: 250, attack: 60, xp: 300 };
sounds.boss.play();
changeBackground('boss_lair.jpg');
} else {
enemy = enemies[Math.floor(Math.random() * enemies.length)];
sounds.attack.play();
changeBackground('battlefield.jpg');
}

const playerAttack = Math.floor(Math.random() * 50) + (skills.length * 5);

if (playerAttack >= enemy.hp) {
typeStory(`You defeated the ${enemy.name}! +${enemy.xp} XP.`);
gainXp(enemy.xp);
if (enemy.name === "Ancient Wyrm") bossesDefeated++;
} else {
const damage = enemy.attack - (inventory.includes("Rare Armor") ? 10 : 0);
health -= damage;
typeStory(`The ${enemy.name} wounded you! -${damage} HP.`);
}

updateStats();
checkVictory();
}

// XP SYSTEM
function gainXp(amount) {
xp += amount;
if (xp >= nextLevelXp) {
level++;
xp = 0;
nextLevelXp += 50;
health += 50;
mana += 30;
sounds.levelup.play();
unlockSkill();
typeStory(`Level up! Now Level ${level}.`);
}
}

// UNLOCK SKILL
function unlockSkill() {
const unlocks = {
Knight: ["Shield Bash", "Shield Strike"],
Mage: ["Lightning Bolt", "Necromancy"],
Rogue: ["Poison Blade", "Rain of Arrows"]
};
const options = unlocks[playerClass];
if (options && skills.length < options.length + 1) {
skills.push(options[skills.length - 1]);
}
}

// VICTORY CHECK
function checkVictory() {
if (bossesDefeated >= 5) {
typeStory("You have defeated all the ancient evils! New Game+ unlocked!");
health = 200;
mana = 150;
bossesDefeated = 0;
x = 25;
y = 25;
initMap();
}
}

// SAVE GAME
function saveGame() {
const saveData = {
playerName, playerGender, playerClass, health, mana, xp, level, nextLevelXp,
inventory, skills, x, y, map, bossesDefeated
};
localStorage.setItem('grimSave', JSON.stringify(saveData));
typeStory("Game Saved.");
}

// LOAD GAME
function loadGame() {
const data = JSON.parse(localStorage.getItem('grimSave'));
if (data) {
({ playerName, playerGender, playerClass, health, mana, xp, level, nextLevelXp,
inventory, skills, x, y, bossesDefeated } = data);
for (let i = 0; i < mapSize; i++) {
map[i] = data.map[i];
}
document.getElementById('character-creation').style.display = 'none';
document.getElementById('player-stats').style.display = 'block';
document.getElementById('choices').style.display = 'block';
updateStats();
typeStory("Game Loaded.");
} else {
typeStory("No save found.");
}
}

// RETURN TO MAIN MENU
function returnToMenu() {
if (confirm("Are you sure you want to return to the main menu? All unsaved progress will be lost.")) {
const fade = document.getElementById('fade-overlay');
const spinner = document.getElementById('loading-spinner');
fade.style.opacity = 1;
spinner.style.opacity = 1;

setTimeout(() => {
playerName = '';
playerGender = '';
playerClass = '';
health = 100;
mana = 50;
xp = 0;
level = 1;
nextLevelXp = 100;
inventory = [];
skills = [];
x = 25;
y = 25;
bossesDefeated = 0;

for (let i = 0; i < mapSize; i++) {
map[i] = [];
for (let j = 0; j < mapSize; j++) {
map[i][j] = false;
}
}

document.getElementById('character-creation').style.display = 'block';
document.getElementById('player-stats').style.display = 'none';
document.getElementById('choices').style.display = 'none';
document.getElementById('story-text').innerHTML = '';
document.getElementById('map').innerHTML = '';

fade.style.opacity = 0;
spinner.style.opacity = 0;
changeBackground('dark_forest_background.jpg');
}, 1000);
}
}
