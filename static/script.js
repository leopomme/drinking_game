// Global Variables
let currentPlayerName = '';
let timerInterval;
let timerPaused = false;
let timerTime = 0; // in seconds
const timerDuration = 120; // 2 minutes in seconds
let playerStats = {};
let enableQuestions = true;
let enableSpecialAbilities = true;
let enableTimer = true;

// Open the settings menu
function openSettings() {
    const settingsElement = document.getElementById('settings');
    settingsElement.style.display = 'flex';
    populatePlayerList();
}

// Close the settings menu and update conditions
function closeSettings() {
    const settingsElement = document.getElementById('settings');
    settingsElement.style.display = 'none';
    updateConditions();
}

// Update the display with the current player's turn
function updatePlayerTurn() {
    const playersContainer = document.getElementById('players');
    const playerElements = Array.from(playersContainer.getElementsByClassName('player'));
    const currentPlayerIndex = Math.floor(Math.random() * playerElements.length);
    currentPlayerName = playerElements[currentPlayerIndex].querySelector('span').innerText;

    const playerTurnDiv = document.getElementById('player-turn');
    playerTurnDiv.textContent = `${currentPlayerName}'s turn!`;

    return currentPlayerIndex;
}

// Start the independent timer bar
function startTimerBar() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerTime = 0;
    timerPaused = false;
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '0%';
    timerBar.style.transition = 'none';
    timerBar.classList.remove('timer-full');

    timerInterval = setInterval(() => {
        if (!timerPaused) {
            timerTime++;
            const percentage = (timerTime / timerDuration) * 100;
            timerBar.style.width = percentage + '%';

            if (timerTime >= timerDuration) {
                clearInterval(timerInterval);
                timerBarFull();
            }
        }
    }, 1000); // update every second
}

function pauseTimerBar() {
    timerPaused = true;
}

function resumeTimerBar() {
    timerPaused = false;
}

function resetTimerBar() {
    clearInterval(timerInterval);
    timerTime = 0;
    timerPaused = false;
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '0%';
    timerBar.classList.remove('timer-full');
    startTimerBar();
}

function timerBarFull() {
    // The timer is full
    const timerBar = document.getElementById('timer-bar');
    timerBar.classList.add('timer-full');
    alert(`${currentPlayerName}, time's up! Time to drink!`);
}

// Trigger the drinking action and update the player states
function timeToSip() {
    const currentPlayerIndex = updatePlayerTurn();
    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    currentPlayerName = playerElements[currentPlayerIndex].querySelector('span').innerText;
    const difficulty = parseFloat(document.getElementById('difficulty').value);

    if (enableSpecialAbilities) {
        assignSpecialAbility(currentPlayerName);
    } else {
        const abilitiesContainer = document.getElementById('special-abilities');
        abilitiesContainer.innerHTML = '';
    }

    Array.from(playerElements).forEach((playerElement, index) => {
        const playerName = playerElement.querySelector('span').innerText;
        const drinksElement = playerElement.querySelector('.drinks');
        drinksElement.innerHTML = '';

        let sips = 0;
        if (difficulty === 1) {
            sips = Math.floor(Math.random() * 6) + 6;
        } else if (difficulty > 0 && difficulty <= 0.25) {
            sips = Math.random() < 0.5 ? Math.floor(Math.random() * 3) + 1 : 0;
        } else if (difficulty > 0.25 && difficulty <= 0.5) {
            sips = Math.random() < 0.67 ? Math.floor(Math.random() * 5) + 1 : 0;
        } else if (difficulty > 0.5 && difficulty <= 0.75) {
            sips = Math.random() < 0.8 ? Math.floor(Math.random() * 5) + 2 : 0;
        } else if (difficulty > 0.75 && difficulty < 1) {
            sips = Math.random() < 0.9 ? Math.floor(Math.random() * 5) + 2 : 0;
        }

        drinksElement.innerHTML = sips ? `${'🍺'.repeat(sips)} (${sips})` : '0';

        // Update playerStats
        if (!playerStats[playerName]) {
            playerStats[playerName] = { totalDrinks: 0 };
        }
        playerStats[playerName].totalDrinks += sips;
    });

    updatePlayerDrinkTracker();
}

// Handle spacebar key press for rolling the dice
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        timeToSip();
    }
});

// Add a new player to the game
function addPlayer() {
    const playersContainer = document.getElementById('players');
    const playerCount = playersContainer.getElementsByClassName('player').length;
    const newPlayer = document.createElement('div');
    newPlayer.className = 'player';
    newPlayer.onclick = () => editPlayer(newPlayer);
    const playerName = `Player ${playerCount + 1}`;
    newPlayer.innerHTML = `<span>${playerName}</span><div class="drinks">0</div>`;
    playersContainer.appendChild(newPlayer);
    playerStats[playerName] = { totalDrinks: 0 };
    updatePlayerDrinkTracker();
}

// Edit an existing player's name
function editPlayer(playerElement) {
    const playerName = playerElement.querySelector('span').innerText;
    const newName = prompt("Edit player name:", playerName);
    if (newName) {
        playerElement.querySelector('span').innerText = newName;
        if (playerStats[playerName]) {
            playerStats[newName] = playerStats[playerName];
            delete playerStats[playerName];
        } else {
            playerStats[newName] = { totalDrinks: 0 };
        }
        updatePlayerDrinkTracker();
    }
}

// Populate the player list in the settings menu
function populatePlayerList() {
    const playersContainer = document.getElementById('players');
    const playerElements = Array.from(playersContainer.getElementsByClassName('player'));
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';

    playerElements.forEach((playerElement) => {
        const playerName = playerElement.querySelector('span').innerText;
        const playerTag = document.createElement('div');
        playerTag.className = 'player-tag';
        playerTag.innerHTML = `<span>${playerName}</span><button onclick="removePlayer('${playerName}')">x</button>`;
        playerList.appendChild(playerTag);
    });
}

// Remove a player from the game
function removePlayer(playerName) {
    const playersContainer = document.getElementById('players');
    const playerElements = Array.from(playersContainer.getElementsByClassName('player'));
    
    const playerToRemove = playerElements.find(playerElement => playerElement.querySelector('span').innerText === playerName);
    if (playerToRemove) {
        playersContainer.removeChild(playerToRemove);
    }

    if (playerStats[playerName]) {
        delete playerStats[playerName];
    }

    populatePlayerList();
    updatePlayerDrinkTracker();
}

// Update the game conditions based on settings
function updateConditions() {
    const conditionsContainer = document.getElementById('conditions');
    const selectedConditionsCount = parseInt(document.getElementById('conditions-select').value, 10);
    conditionsContainer.innerHTML = '';

    if (enableQuestions) {
        const shuffledConditions = conditions.sort(() => 0.5 - Math.random());
        const selectedConditions = shuffledConditions.slice(0, selectedConditionsCount);

        selectedConditions.forEach(condition => {
            const conditionElement = document.createElement('li');
            conditionElement.className = 'condition';
            conditionElement.innerText = condition;
            conditionsContainer.appendChild(conditionElement);
        });
    }
}

// Save the settings and close the settings menu
function saveSettings() {
    enableQuestions = document.getElementById('enable-questions').checked;
    enableSpecialAbilities = document.getElementById('enable-special-abilities').checked;
    enableTimer = document.getElementById('enable-timer').checked;

    const timerBarContainer = document.getElementById('drink-timer');
    const timerControls = document.querySelector('.timer-controls');
    if (enableTimer) {
        timerBarContainer.style.display = 'block';
        timerControls.style.display = 'flex';
        startTimerBar();
    } else {
        timerBarContainer.style.display = 'none';
        timerControls.style.display = 'none';
        clearInterval(timerInterval);
    }

    closeSettings();
}

// Assign a random special ability to the current player
const specialAbilities = [
    'Swap Sips: Allows the player to swap their sips with another player\'s.',
    'Double Trouble: Doubles the number of sips another player must take for the next round.',
    'Skip or Reverse: Skip a turn or reverse the play order.',
    'Shield: Protects the player from taking sips for one round.',
    // Feel free to add more abilities
];

function assignSpecialAbility(playerName) {
    const abilitiesContainer = document.getElementById('special-abilities');
    abilitiesContainer.innerHTML = ''; // Clear previous abilities

    const randomAbilityIndex = Math.floor(Math.random() * specialAbilities.length);
    const ability = specialAbilities[randomAbilityIndex];

    const abilityElement = document.createElement('div');
    abilityElement.className = 'ability';
    abilityElement.innerHTML = `<strong>${playerName}'s Ability:</strong><br>${ability}`;
    abilitiesContainer.appendChild(abilityElement);
}

// Update the player drink tracker
function updatePlayerDrinkTracker() {
    const trackerContainer = document.getElementById('player-drink-tracker');
    trackerContainer.innerHTML = ''; // Clear existing content

    for (const playerName in playerStats) {
        const playerStat = playerStats[playerName];
        const playerElement = document.createElement('div');
        playerElement.className = 'player-stat';
        playerElement.innerHTML = `<span>${playerName}</span>: <span>${playerStat.totalDrinks}</span>`;
        trackerContainer.appendChild(playerElement);
    }
}

// Start the timer bar on page load if enabled
window.onload = function() {
    if (enableTimer) {
        startTimerBar();
    }
};
