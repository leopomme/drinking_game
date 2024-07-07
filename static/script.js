function openSettings() {
    document.getElementById('settings').style.display = 'flex';
    populatePlayerList();
}

function closeSettings() {
    document.getElementById('settings').style.display = 'none';
    updateConditions();
}

function timeToSip() {
    updateConditions(); // Update conditions when the button is clicked

    const playersContainer = document.getElementById('players');
    const playerElements = playersContainer.getElementsByClassName('player');
    const difficulty = document.getElementById('difficulty').value;

    for (let playerElement of playerElements) {
        const drinksElement = playerElement.querySelector('.drinks');
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

        drinksElement.innerHTML = `${'🍺'.repeat(sips)} (${sips})`;
        if (sips === 0) {
            drinksElement.innerHTML = '0';
        }
    }
}

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
