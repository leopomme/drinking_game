// Global Variables
let currentPlayerIndex = -1; // Initialize to -1 so that it starts from 0 on the first turn
let currentPlayerName = '';
let timerInterval;
let timerTime = 0; // in seconds
const timerDuration = 120; // 2 minutes in seconds
let playerStats = {};
let enableQuestions = true;
let enableSpecialAbilities = true;
let enableTimer = true;
let turnNumber = 0;
let sipsPerTurn = {}; // { turnNumber: { playerName: sips, ... }, ... }


// Open the settings menu
function openSettings() {
    const settingsElement = document.getElementById('settings');
    settingsElement.style.display = 'flex';
    populatePlayerList();
}

// Close the settings menu
function closeSettings() {
    const settingsElement = document.getElementById('settings');
    settingsElement.style.display = 'none';
}

// Update the display with the current player's turn
function updatePlayerTurn() {
    const playersContainer = document.getElementById('players');
    const playerElements = Array.from(playersContainer.getElementsByClassName('player'));

    // Increment currentPlayerIndex and wrap around if necessary
    currentPlayerIndex = (currentPlayerIndex + 1) % playerElements.length;

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
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '0%';
    timerBar.style.transition = 'none';
    timerBar.classList.remove('timer-full');

    timerInterval = setInterval(() => {
        timerTime++;
        const percentage = (timerTime / timerDuration) * 100;
        timerBar.style.width = percentage + '%';

        if (timerTime >= timerDuration) {
            clearInterval(timerInterval);
            timerBarFull();
        }
    }, 1000); // update every second
}

function timerBarFull() {
    // The timer is full
    const timerBar = document.getElementById('timer-bar');
    timerBar.classList.add('timer-full');
    alert(`${currentPlayerName}, time's up! Time to drink!`);
    // Auto-reset the timer after the alert is closed
    startTimerBar();
}

function timeToSip() {
    turnNumber++; // Increment turn number
    const currentPlayerIndex = updatePlayerTurn();
    updateConditions(true);
    spinWheel();

    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    currentPlayerName = playerElements[currentPlayerIndex].querySelector('span').innerText;
    const difficulty = parseFloat(document.getElementById('difficulty').value);

    // Initialize sips data for this turn
    sipsPerTurn[turnNumber] = {};

    if (enableSpecialAbilities) {
        // assignSpecialAbility(currentPlayerName); // Removed in favor of the wheel
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

        // Record sips for this turn
        sipsPerTurn[turnNumber][playerName] = sips;
    });

    updatePlayerDrinkTracker();
    updateSipsChart(); // Render the graph
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
    currentPlayerIndex = -1; // Reset to start from the first player
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
    currentPlayerIndex = -1; // Reset to start from the first player
}

// Update the game conditions based on settings
function updateConditions(isDuringGameplay = false) {
    const conditionsContainer = document.getElementById('conditions');
    const selectedConditionsCount = 1; // Always set to 1
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

    // Close settings menu if not during gameplay
    if (!isDuringGameplay) {
        closeSettings();
    }
}


// Save the settings and close the settings menu
function saveSettings() {
    enableQuestions = document.getElementById('enable-questions').checked;
    enableSpecialAbilities = document.getElementById('enable-special-abilities').checked;
    enableTimer = document.getElementById('enable-timer').checked;

    const timerBarContainer = document.getElementById('drink-timer');

    if (enableTimer) {
        timerBarContainer.style.display = 'block';
        startTimerBar();
    } else {
        timerBarContainer.style.display = 'none';
        clearInterval(timerInterval);
    }

    currentPlayerIndex = -1; // Reset to start from the first player
    updateConditions();
}

// Special Abilities List
const specialAbilities = [
    'Double Trouble I: Double the number of sips another player must take. The rule only applies for the current round and has no further effect.',
    'Double Trouble II: Double the number of sips another player must take. The effect lasts until the player you targeted completes their next turn.',
    'Double Trouble III: Double the number of sips another player must take. The effect remains in play until it is your turn again.',
    'Double Trouble IV: Double the number of sips another player must take. The effect remains until the end of the game.',
    
    'Reverse Double Trouble I: Double the number of sips you must take for this round.',
    'Reverse Double Trouble III: Double the number of sips you must take until your next turn.',

    'Swap Sips I: Swap your sips with another player. The effect only applies for the current round.',
    'Swap Sips II: Swap your sips with another player. The effect lasts until the player you targeted completes their next turn.',
    'Swap Sips III: Swap your sips with another player. The effect remains until your next turn.',
    'Swap Sips IV: Swap your sips with another player. The effect lasts until the end of the game.',

    'Democracy I: Choose a player. You and the others vote whether to remove the player’s sips, leave the number unchanged, or double the sips. The effect only applies for the current round.',
    'Democracy II: Choose a player. You and the others vote whether to remove the player’s sips, leave the number unchanged, or double the sips. The effect lasts until the player’s next turn.',
    'Democracy III: Choose a player. You and the others vote whether to remove the player’s sips, leave the number unchanged, or double the sips. The effect remains in play until your next turn.',
    'Democracy IV: Choose a player. You and the others vote whether to remove the player’s sips, leave the number unchanged, or double the sips. The effect remains until the end of the game.',
    'Democracy V: Choose a player. You and the others vote whether this player should down your entire drink or not.',

    'Reverse Democracy I: The others vote whether to remove your sips, leave the number unchanged, or double your sips. The rule only applies for the current round.',
    'Reverse Democracy II: The others vote whether to remove your sips, leave the number unchanged, or double your sips. The effect lasts until your next turn.',
    'Reverse Democracy III: The others vote whether to remove your sips, leave the number unchanged, or double your sips. The effect lasts until the end of the game.',
    'Reverse Democracy V: The others vote whether you must down your entire drink or not.',

    'Full Chug: Force another player to down their entire drink.',
    'Reverse Full Chug: You must down your entire drink.',
    'Communist Full Chug: Everyone at the table must down their entire drink.',

    'Bijection I: Choose two players. They must drink the higher number of sips between them. The effect only applies for the current round.',
    'Bijection II: Choose two players. They must drink the higher number of sips between them until the player you targeted completes their next turn.',
    'Bijection III: Choose two players. They must drink the higher number of sips between them until your next turn.',
    'Bijection IV: Choose two players. They must drink the higher number of sips between them until the end of the game.',

    'Reverse Bijection I: Choose a player to join you in a bijection. The effect only applies for the current round.',
    'Reverse Bijection II: Choose a player to join you in a bijection. The effect lasts until the player you targeted completes their next turn.',
    'Reverse Bijection III: Choose a player to join you in a bijection. The effect lasts until your next turn.',
    
    'Shield I: Protect yourself from drinking for the current round.',
    'Shield II: Protect yourself from drinking until your next turn.'
];


function createWheel() {
    const wheel = document.querySelector('.wheel');
  
    // Decide the number of slices to display, e.g., 6
    const numberOfSlices = 6;
  
    // Randomly shuffle and select abilities
    const shuffledAbilities = specialAbilities.sort(() => 0.5 - Math.random());
    const selectedAbilities = shuffledAbilities.slice(0, numberOfSlices);
  
    const sliceDegree = 360 / numberOfSlices;
  
    // Remove existing slices
    wheel.innerHTML = '<div class="wheel-arrow">▲</div>';
  
    selectedAbilities.forEach((ability, index) => {
      const slice = document.createElement('div');
      slice.className = 'wheel-slice';
      slice.style.transform = `rotate(${index * sliceDegree}deg) skewY(${90 - sliceDegree}deg)`;
  
      // Alternate colors between dark and light
      const lightColor = '#ffe0b2'; // Light color
      const darkColor = '#ffb74d';  // Dark color
      slice.style.backgroundColor = index % 2 === 0 ? lightColor : darkColor;
  
      const text = document.createElement('div');
      text.className = 'slice-text';
      text.style.transform = `rotate(${sliceDegree / 2}deg)`;
      text.innerText = ability.split(':')[0]; // Show only the title
      slice.appendChild(text);
      wheel.appendChild(slice);
    });
  
    // Store the selected abilities for use when determining the result
    wheel.dataset.selectedAbilities = JSON.stringify(selectedAbilities);
  }
  


let spinning = false;

function spinWheel() {
    if (spinning) return;
    spinning = true;

    createWheel(); // Regenerate the wheel with new abilities

    const wheel = document.querySelector('.wheel');
    const selectedAbilities = JSON.parse(wheel.dataset.selectedAbilities);
    const numberOfSlices = selectedAbilities.length;
    const sliceDegree = 360 / numberOfSlices;
    const randomDegree = Math.floor(Math.random() * 360) + 720; // At least 2 full rotations

    // Reduce spin duration to 2 seconds
    wheel.style.transition = 'transform 2s cubic-bezier(0.33, 1, 0.68, 1)';
    wheel.style.transform = `rotate(${randomDegree}deg)`;

    // Determine which ability was selected
    setTimeout(() => {
        const totalDegreesSpun = randomDegree % 360;
        const normalizedDegrees = (360 - totalDegreesSpun + sliceDegree / 2) % 360;
        const index = Math.floor(normalizedDegrees / sliceDegree) % numberOfSlices;
        const selectedAbility = selectedAbilities[index];

        // Display the ability description below the wheel
        const abilityDescriptionDiv = document.getElementById('ability-description');
        abilityDescriptionDiv.innerHTML = `<strong>${currentPlayerName} got:</strong> ${selectedAbility}`;

        spinning = false;
    }, 2000); // Match the reduced transition duration
}

  


// Update the player drink tracker
function updatePlayerDrinkTracker() {
    const trackerContainer = document.getElementById('player-drink-tracker');
    trackerContainer.innerHTML = ''; // Clear existing content

    for (const playerName in playerStats) {
        const playerStat = playerStats[playerName];
        const playerElement = document.createElement('div');
        playerElement.className = 'player-stat';
        playerElement.innerHTML = `<span>${playerName}</span>: <span>${playerStat.totalDrinks} 🍺</span>`;
        trackerContainer.appendChild(playerElement);
    }
}

// Start the timer bar on page load if enabled
window.onload = function() {
    createWheel();
    if (enableTimer) {
        startTimerBar();
    }
};

function updateSipsChart() {
    const ctx = document.getElementById('sipsChart').getContext('2d');

    // Prepare data
    const labels = Object.keys(sipsPerTurn); // Turn numbers
    const datasets = [];

    // Get list of all players
    const players = Object.keys(playerStats);

    players.forEach((playerName, idx) => {
        const data = labels.map(turn => sipsPerTurn[turn][playerName] || 0);
        datasets.push({
            label: playerName,
            data: data,
            borderColor: getRandomColor(idx),
            fill: false,
        });
    });

    // Destroy previous chart instance if exists
    if (window.sipsChartInstance) {
        window.sipsChartInstance.destroy();
    }

    // Create new chart
    window.sipsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets,
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Sips per Turn',
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Turn Number',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Sips',
                    },
                    beginAtZero: true,
                },
            },
        },
    });
}

// Utility function to generate random colors
function getRandomColor(index) {
    const colors = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8',
        '#f58231', '#911eb4', '#46f0f0', '#f032e6',
        '#bcf60c', '#fabebe', '#008080', '#e6beff',
        '#9a6324', '#fffac8', '#800000', '#aaffc3',
        '#808000', '#ffd8b1', '#000075', '#808080',
        '#ffffff', '#000000'
    ];
    return colors[index % colors.length];
}
