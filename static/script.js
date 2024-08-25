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
    const currentPlayerName = playerElements[currentPlayerIndex].querySelector('span').innerText;

    const playerTurnDiv = document.getElementById('player-turn');
    playerTurnDiv.textContent = `${currentPlayerName}'s turn!`;

    return currentPlayerIndex;
}

// Start the timer bar animation for the current player
function startTimer(currentPlayerName) {
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '0%';
    timerBar.style.transition = 'none';

    setTimeout(() => {
        timerBar.style.transition = 'width 10s linear';
        timerBar.style.width = '100%';
    }, 10);

    setTimeout(() => {
        alert(`${currentPlayerName}, time's up! Drink your drink!`);
        // Reset the timer bar after it's full
        timerBar.style.width = '0%';
    }, 10000); // Match this duration with the timer's transition
}

// Trigger the drinking action and update the player states
function timeToSip() {
    const currentPlayerIndex = updatePlayerTurn();
    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    const currentPlayer = playerElements[currentPlayerIndex].querySelector('span').innerText;
    const difficulty = parseFloat(document.getElementById('difficulty').value);

    startTimer(currentPlayer);

    Array.from(playerElements).forEach((playerElement, index) => {
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

        if (index === currentPlayerIndex) {
            drinksElement.innerHTML = sips ? `${'🍺'.repeat(sips)} (${sips})` : '0';
        }
    });
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
    newPlayer.innerHTML = `<span>Enter Player ${playerCount + 1}</span><div class="drinks">0</div>`;
    playersContainer.appendChild(newPlayer);
}

// Edit an existing player's name
function editPlayer(playerElement) {
    const playerName = playerElement.querySelector('span').innerText;
    const newName = prompt("Edit player name:", playerName);
    if (newName) {
        playerElement.querySelector('span').innerText = newName;
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

    populatePlayerList();
}

// Update the game conditions based on settings
function updateConditions() {
    const conditionsContainer = document.getElementById('conditions');
    const selectedConditionsCount = parseInt(document.getElementById('conditions-select').value, 10);
    conditionsContainer.innerHTML = '';

    const shuffledConditions = conditions.sort(() => 0.5 - Math.random());
    const selectedConditions = shuffledConditions.slice(0, selectedConditionsCount);

    selectedConditions.forEach(condition => {
        const conditionElement = document.createElement('li');
        conditionElement.className = 'condition';
        conditionElement.innerText = condition;
        conditionsContainer.appendChild(conditionElement);
    });
}

// Save the settings and close the settings menu
function saveSettings() {
    closeSettings();
}
