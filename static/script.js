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

    if (playerElements.length === 0) {
        alert("No players available. Please add players.");
        return -1;
    }

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
    const updatedPlayerIndex = updatePlayerTurn();
    if (updatedPlayerIndex === -1) return; // No players to proceed

    // Update conditions for the new turn
    updateConditions(true);

    // Spin the tube automatically if special abilities are enabled
    if (enableSpecialAbilities) {
        spinTube();
    }

    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    currentPlayerName = playerElements[updatedPlayerIndex].querySelector('span').innerText;
    const difficulty = parseFloat(document.getElementById('difficulty').value);

    // Initialize sips data for this turn
    turnNumber++; // Increment turnNumber here
    sipsPerTurn[turnNumber] = {};

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
    turnNumber = 0; // Reset turnNumber
    sipsPerTurn = {}; // Clear previous sips data
    updateConditions();
    updateSipsChart(); // Clear and update the graph
}


// Special Abilities List
const specialAbilities = [
    '<strong>Double Trouble I</strong>: Double the number of sips another player must take. The rule only applies for the current round and has no further effect.',
    '<strong>Double Trouble II</strong>: Double the number of sips another player must take. The effect lasts until the player you targeted completes their next turn.',
    '<strong>Double Trouble III</strong>: Double the number of sips another player must take. The effect remains in play until it is your turn again.',
    '<strong>Double Trouble IV</strong>: Double the number of sips another player must take. The effect remains until the end of the game.',
    
    '<strong>Reverse Double Trouble I</strong>: Double the number of sips you must take for this round.',
    '<strong>Reverse Double Trouble III</strong>: Double the number of sips you must take until your next turn.',

    '<strong>Swap Sips I</strong>: Swap your sips with another player. The effect only applies for the current round.',
    '<strong>Swap Sips II</strong>: Swap your sips with another player. The effect lasts until the player you targeted completes their next turn.',
    '<strong>Swap Sips III</strong>: Swap your sips with another player. The effect remains until your next turn.',
    '<strong>Swap Sips IV</strong>: Swap your sips with another player. The effect lasts until the end of the game.',

    '<strong>Democracy I</strong>: Choose a player. You and the others vote whether to remove the player’s sips, leave the number unchanged, or double the sips. The effect only applies for the current round.',
    '<strong>Democracy II</strong>: Choose a player. You and the others vote whether to remove the player’s sips, leave the number unchanged, or double the sips. The effect lasts until the player’s next turn.',
    '<strong>Democracy III</strong>: Choose a player. You and the others vote whether to remove the player’s sips, leave the number unchanged, or double the sips. The effect remains in play until your next turn.',
    '<strong>Democracy IV</strong>: Choose a player. You and the others vote whether to remove the player’s sips, leave the number unchanged, or double the sips. The effect remains until the end of the game.',
    '<strong>Democracy V</strong>: Choose a player. You and the others vote whether this player should down your entire drink or not.',

    '<strong>Reverse Democracy I</strong>: The others vote whether to remove your sips, leave the number unchanged, or double your sips. The rule only applies for the current round.',
    '<strong>Reverse Democracy II</strong>: The others vote whether to remove your sips, leave the number unchanged, or double your sips. The effect lasts until your next turn.',
    '<strong>Reverse Democracy III</strong>: The others vote whether to remove your sips, leave the number unchanged, or double your sips. The effect lasts until the end of the game.',
    '<strong>Reverse Democracy V</strong>: The others vote whether you must down your entire drink or not.',

    '<strong>Full Chug</strong>: Force another player to down their entire drink.',
    '<strong>Reverse Full Chug</strong>: You must down your entire drink.',
    '<strong>Communist Full Chug</strong>: Everyone at the table must down their entire drink.',

    '<strong>Bijection I</strong>: Choose two players. They must drink the higher number of sips between them. The effect only applies for the current round.',
    '<strong>Bijection II</strong>: Choose two players. They must drink the higher number of sips between them until the player you targeted completes their next turn.',
    '<strong>Bijection III</strong>: Choose two players. They must drink the higher number of sips between them until your next turn.',
    '<strong>Bijection IV</strong>: Choose two players. They must drink the higher number of sips between them until the end of the game.',

    '<strong>Reverse Bijection I</strong>: Choose a player to join you in a bijection. The effect only applies for the current round.',
    '<strong>Reverse Bijection II</strong>: Choose a player to join you in a bijection. The effect lasts until the player you targeted completes their next turn.',
    '<strong>Reverse Bijection III</strong>: Choose a player to join you in a bijection. The effect lasts until your next turn.',
    
    '<strong>Shield I</strong>: Protect yourself from drinking for the current round.',
    '<strong>Shield II</strong>: Protect yourself from drinking until your next turn.'
];



// New Rolling Tube Implementation

// Function to create the rolling tube with all abilities
function createTube() {
    const tube = document.querySelector('.tube');
    tube.innerHTML = ''; // Clear existing abilities

    // Shuffle the abilities to randomize the order
    const shuffledAbilities = specialAbilities.sort(() => 0.5 - Math.random());

    // Display all abilities in the tube
    shuffledAbilities.forEach(ability => {
        const abilitySpan = document.createElement('span');
        abilitySpan.textContent = ability.split(':')[0]; // Display only the title
        tube.appendChild(abilitySpan);
    });

    // Store the shuffled abilities for use when determining the result
    tube.dataset.selectedAbilities = JSON.stringify(shuffledAbilities);
}

// Flag to prevent multiple simultaneous spins
let spinningTube = false;

function spinTube() {
    if (spinningTube) return;
    spinningTube = true;

    createTube(); // Regenerate the tube with all abilities

    const tube = document.querySelector('.tube');
    const selectedAbilities = JSON.parse(tube.dataset.selectedAbilities);
    const numberOfAbilities = selectedAbilities.length;
    const randomIndex = Math.floor(Math.random() * numberOfAbilities);

    // Calculate the translation distance (assuming each span is 100px wide)
    const translateX = -randomIndex * 100;

    // Apply the transform to spin the tube
    tube.style.transform = `translateX(${translateX}px)`;

    // After 1 second, display the selected ability
    setTimeout(() => {
        const selectedAbility = selectedAbilities[randomIndex];
        document.getElementById('selected-ability-name').textContent = selectedAbility.split(':')[0];
        document.getElementById('ability-explanation').innerHTML = `<strong>${selectedAbility}</strong>`;
        spinningTube = false;
    }, 1000); // Match the transition duration in CSS
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

// Update Sips Chart with cumulative data
// Update Sips Chart with cumulative data
function updateSipsChart() {
    const ctx = document.getElementById('sipsChart').getContext('2d');

    // Prepare cumulative data
    const labels = Object.keys(sipsPerTurn).map(turn => `Turn ${turn}`);
    const datasets = [];

    // Get list of all players
    const players = Object.keys(playerStats);

    // Initialize cumulative sips per player
    const cumulativeSips = {};
    players.forEach(player => {
        cumulativeSips[player] = [];
    });

    // Calculate cumulative sips
    let totalSips = {};
    players.forEach(player => {
        totalSips[player] = 0;
    });

    Object.keys(sipsPerTurn).sort((a, b) => a - b).forEach(turn => { // Ensure turns are in order
        players.forEach(player => {
            totalSips[player] += sipsPerTurn[turn][player] || 0;
            cumulativeSips[player].push(totalSips[player]);
        });
    });

    players.forEach((playerName, idx) => {
        const data = cumulativeSips[playerName];
        datasets.push({
            label: playerName,
            data: data,
            borderColor: getColor(idx),
            fill: false,
            tension: 0.1
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
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Cumulative Sips per Player',
                },
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
                        text: 'Total Number of Sips',
                    },
                    beginAtZero: true,
                },
            },
        },
    });
}


// Utility function to generate distinct colors for each player
function getColor(index) {
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

// Start the timer bar on page load if enabled
window.onload = function() {
    updateConditions();
    createTube();
    if (enableTimer) {
        startTimerBar();
    }
};
