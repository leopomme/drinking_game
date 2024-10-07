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
    // Hide the extra rules box when settings are opened
    const conditionsContainer = document.querySelector('.conditions-container');
    conditionsContainer.style.display = 'none';
}

// Close the settings menu
function closeSettings() {
    const settingsElement = document.getElementById('settings');
    settingsElement.style.display = 'none';
    // Show the extra rules box based on enableQuestions
    const conditionsContainer = document.querySelector('.conditions-container');
    conditionsContainer.style.display = enableQuestions ? 'flex' : 'none';
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

    const playerTurnDiv = document.getElementById('player-turn-text');
    playerTurnDiv.textContent = `${currentPlayerName}'s Turn`;

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

// Handle spacebar key press for rolling the dice
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent default spacebar behavior like page scrolling
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
        // Prevent the event from bubbling up to the parent 'onclick'
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
    // Update state variables based on checkbox states
    enableQuestions = document.getElementById('enable-questions').checked;
    enableSpecialAbilities = document.getElementById('enable-special-abilities').checked;
    enableTimer = document.getElementById('enable-timer').checked;

    // References to abilities-related elements
    const tubeSection = document.querySelector('.tube-section');
    const abilityExplanation = document.getElementById('ability-explanation');

    // Handle Timer Visibility
    const timerBarContainer = document.getElementById('drink-timer');
    if (enableTimer) {
        timerBarContainer.style.display = 'block';
        startTimerBar();
    } else {
        timerBarContainer.style.display = 'none';
        clearInterval(timerInterval);
    }

    // Handle Special Abilities Visibility
    if (enableSpecialAbilities) {
        tubeSection.style.display = 'flex'; // Show the Rolling Tube Section
        abilityExplanation.style.display = 'block'; // Show Ability Explanation
    } else {
        tubeSection.style.display = 'none'; // Hide the Rolling Tube Section
        abilityExplanation.style.display = 'none'; // Hide Ability Explanation

        // Clear any selected abilities when disabled
        document.getElementById('ability-explanation').innerHTML = '';
    }

    // Reset game state
    currentPlayerIndex = -1; // Reset to start from the first player
    turnNumber = 0; // Reset turnNumber
    sipsPerTurn = {}; // Clear previous sips data
    updateConditions();
    updateSipsChart(); // Clear and update the graph
    closeSettings(); // Close the settings menu

    // Center the main central box when special abilities are deactivated
    const mainWrapper = document.querySelector('.main-wrapper');
    if (!enableSpecialAbilities) {
        mainWrapper.style.justifyContent = 'center';
    } else {
        mainWrapper.style.justifyContent = 'space-between';
    }
}

// Special Abilities Array
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

// Function to create the rolling tube with all abilities
function createTube() {
    const tube = document.querySelector('.tube');
    tube.innerHTML = ''; // Clear existing abilities

    // Shuffle the abilities to randomize the order
    const shuffledAbilities = specialAbilities.sort(() => 0.5 - Math.random());

    // Duplicate the abilities multiple times to simulate continuous rolling
    const repetitions = 3; // Number of times to repeat the abilities
    const duplicatedAbilities = [];
    for (let i = 0; i < repetitions; i++) {
        duplicatedAbilities.push(...shuffledAbilities);
    }

    // Display all abilities in the tube
    duplicatedAbilities.forEach(ability => {
        const abilitySpan = document.createElement('span');
        abilitySpan.textContent = ability.split(':')[0]; // Display only the title
        tube.appendChild(abilitySpan);
    });

    // Store the duplicated shuffled abilities for use when determining the result
    tube.dataset.selectedAbilities = JSON.stringify(duplicatedAbilities);
}

// Flag to prevent multiple simultaneous spins
let spinningTubeFlag = false;

// Function to spin the tube
function spinTube() {
    if (!enableSpecialAbilities || spinningTubeFlag) return; // Do not spin if disabled or already spinning
    spinningTubeFlag = true;

    // Disable the roll button
    const rollButton = document.querySelector('.roll-button');
    rollButton.disabled = true;
    rollButton.style.cursor = 'not-allowed';
    rollButton.style.opacity = '0.6';

    createTube(); // Regenerate the tube with all abilities

    const tube = document.querySelector('.tube');
    const selectedAbilities = JSON.parse(tube.dataset.selectedAbilities);
    const numberOfAbilities = selectedAbilities.length;
    const randomIndex = Math.floor(Math.random() * numberOfAbilities);

    // Calculate the translation distance (assuming each span is 60px high)
    const abilityHeight = 60; // Reduced height for thinner tube
    const translateY = -randomIndex * abilityHeight;

    // Apply the transform to spin the tube
    tube.style.transition = 'transform 1s ease-out'; // Ensure transition is set
    tube.style.transform = `translateY(${translateY}px)`;

    // Wait for the transition to complete
    setTimeout(() => {
        const selectedAbility = selectedAbilities[randomIndex];
        const abilityParts = selectedAbility.split(':');

        // Set only the explanation without repeating the ability name
        document.getElementById('ability-explanation').innerHTML = `${abilityParts[1].trim()}`;

        spinningTubeFlag = false;

        // Re-enable the roll button
        rollButton.disabled = false;
        rollButton.style.cursor = 'pointer';
        rollButton.style.opacity = '1';
    }, 1000); // Match the transition duration in CSS (1s)
}

// Modify timeToSip to spin tube only if enabled and remove cooldown delay
function timeToSip() {
    const updatedPlayerIndex = updatePlayerTurn();
    if (updatedPlayerIndex === -1) return; // No players to proceed

    updateConditions(true);

    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    currentPlayerName = playerElements[updatedPlayerIndex].querySelector('span').innerText;
    const difficulty = parseFloat(document.getElementById('difficulty').value);

    turnNumber++;
    sipsPerTurn[turnNumber] = {};

    Array.from(playerElements).forEach((playerElement, index) => {
        const playerName = playerElement.querySelector('span').innerText;
        const drinksElement = playerElement.querySelector('.drinks');
        drinksElement.innerHTML = '';

        if (difficulty === 0) {
            drinksElement.innerHTML = '0';
            sipsPerTurn[turnNumber][playerName] = 0;
            return; // No sips for difficulty 0
        }

        // Adjusted mean and standard deviation
        const mean = 15 * Math.pow(difficulty, 2); // Increased scaling factor
        const stdDev = 3.0 * Math.pow(difficulty, 2); // Increased stdDev

        // Gaussian random number generator
        function gaussianRandom() {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        }

        const randomGaussian = gaussianRandom();
        let sips = mean + stdDev * randomGaussian;

        // Floor the number of sips and ensure it's not below 0
        sips = Math.max(0, Math.floor(sips));

        drinksElement.innerHTML = sips ? `${'🍺'.repeat(sips)} (${sips})` : '0';

        // Update playerStats
        if (!playerStats[playerName]) {
            playerStats[playerName] = { totalDrinks: 0 };
        }
        playerStats[playerName].totalDrinks += sips;

        // Record sips for this turn
        sipsPerTurn[turnNumber][playerName] = sips;
    });

    // Spin the tube only if special abilities are enabled
    if (enableSpecialAbilities) {
        spinTube();
    }

    updatePlayerDrinkTracker();
    updateSipsChart(); // Render the graph
}

// Update the player drink tracker
function updatePlayerDrinkTracker() {
    const trackerContainer = document.getElementById('player-drink-tracker');
    trackerContainer.innerHTML = ''; // Clear existing content

    for (const playerName in playerStats) {
        const playerStat = playerStats[playerName];
        const playerElement = document.createElement('div');
        playerElement.className = 'player-stat';
        playerElement.innerHTML = `<span>${playerName}</span> :    <span>${playerStat.totalDrinks} 🍺</span>`;
        trackerContainer.appendChild(playerElement);
    }
}

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

// Initialize visibility on page load
window.onload = function() {
    updateConditions();
    createTube();
    if (enableTimer) {
        startTimerBar();
    }

    const tubeSection = document.querySelector('.tube-section');
    const abilityExplanation = document.getElementById('ability-explanation');

    // Set initial visibility based on enableSpecialAbilities state
    if (enableSpecialAbilities) {
        tubeSection.style.display = 'flex';
        abilityExplanation.style.display = 'block';
    } else {
        tubeSection.style.display = 'none';
        abilityExplanation.style.display = 'none';
    }
};
