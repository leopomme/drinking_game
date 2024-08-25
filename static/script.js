function openSettings() {
    document.getElementById('settings').style.display = 'flex';
    populatePlayerList();
}

function closeSettings() {
    document.getElementById('settings').style.display = 'none';
    updateConditions();
}

function updatePlayerTurn() {
    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    const currentPlayerIndex = Math.floor(Math.random() * playerElements.length);
    const currentPlayer = playerElements[currentPlayerIndex].querySelector('span').innerText;

    const playerTurnDiv = document.getElementById('player-turn');
    playerTurnDiv.innerHTML = `${currentPlayer}'s turn!`;

    return currentPlayerIndex;
}

function startTimer(currentPlayer) {
    const timerBar = document.getElementById('timer-bar');
    timerBar.style.width = '0%';

    // Reset any previous timer bar animation
    timerBar.style.transition = 'none';
    setTimeout(() => {
        timerBar.style.transition = 'width 10s linear'; // Adjust time as needed
        timerBar.style.width = '100%';
    }, 10); 

    // Trigger event when the timer is full
    setTimeout(() => {
        alert(`${currentPlayer}, time's up! Drink your drink!`);
        // Add any additional animations or actions here
    }, 10000); // This matches the duration of the timer's transition
}

function timeToSip() {
    const currentPlayerIndex = updatePlayerTurn(); // Get the current player's index and update the display
    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    const currentPlayer = playerElements[currentPlayerIndex].querySelector('span').innerText;
    const difficulty = document.getElementById('difficulty').value;

    startTimer(currentPlayer); // Start the timer for the current player

    for (let i = 0; i < playerElements.length; i++) {
        const drinksElement = playerElements[i].querySelector('.drinks');
        drinksElement.innerHTML = ''; // Clear previous drinks

        let shouldDrink = Math.random();
        let sips = 0;

        if (difficulty == 0) {
            shouldDrink = 0;
        } else if (difficulty == 1) {
            shouldDrink = 1;
            sips = Math.floor(Math.random() * 6) + 6;
        } else if (difficulty > 0 && difficulty <= 0.25) {
            shouldDrink = Math.random() < 0.5;
            if (shouldDrink) sips = Math.floor(Math.random() * 3) + 1;
        } else if (difficulty > 0.25 && difficulty <= 0.5) {
            shouldDrink = Math.random() < 0.67;
            if (shouldDrink) sips = Math.floor(Math.random() * 5) + 1;
        } else if (difficulty > 0.5 && difficulty <= 0.75) {
            shouldDrink = Math.random() < 0.8;
            if (shouldDrink) sips = Math.floor(Math.random() * 5) + 2;
        } else if (difficulty > 0.75 && difficulty < 1) {
            shouldDrink = Math.random() < 0.9;
            if (shouldDrink) sips = Math.floor(Math.random() * 5) + 2;
        }

        if (i === currentPlayerIndex) {
            drinksElement.innerHTML = `${'🍺'.repeat(sips)} (${sips})`;
            if (sips === 0) {
                drinksElement.innerHTML = '0';
            }
        }
    }
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        timeToSip();
    }
});

function addPlayer() {
    const playersContainer = document.getElementById('players');
    const playerCount = playersContainer.getElementsByClassName('player').length;
    const newPlayer = document.createElement('div');
    newPlayer.className = 'player';
    newPlayer.setAttribute('onclick', 'editPlayer(this)');
    newPlayer.innerHTML = `<span>Enter Player ${playerCount + 1}</span><div class="drinks">0</div>`;
    playersContainer.appendChild(newPlayer);
}

function editPlayer(playerElement) {
    const playerName = playerElement.querySelector('span').innerText;
    const newName = prompt("Edit player name:", playerName);
    if (newName) {
        playerElement.querySelector('span').innerText = newName;
    }
}

function populatePlayerList() {
    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = '';

    for (let playerElement of playerElements) {
        const playerName = playerElement.querySelector('span').innerText;
        const playerTag = document.createElement('div');
        playerTag.className = 'player-tag';
        playerTag.innerHTML = `<span>${playerName}</span><button onclick="removePlayer('${playerName}')">x</button>`;
        playerList.appendChild(playerTag);
    }
}

function removePlayer(playerName) {
    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    for (let playerElement of playerElements) {
        if (playerElement.querySelector('span').innerText === playerName) {
            playersContainer.removeChild(playerElement);
            break;
        }
    }
    populatePlayerList();
}

function updateConditions() {
    const conditionsContainer = document.getElementById('conditions');
    const selectedConditions = parseInt(document.getElementById('conditions-select').value, 10);
    conditionsContainer.innerHTML = '';

    const shuffledConditions = conditions.sort(() => 0.5 - Math.random());
    const selected = shuffledConditions.slice(0, selectedConditions);

    for (let condition of selected) {
        const conditionElement = document.createElement('li');
        conditionElement.className = 'condition';
        conditionElement.innerText = condition;
        conditionsContainer.appendChild(conditionElement);
    }
}

function saveSettings() {
    closeSettings();
}
