// Card and Game Logic
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let dealerHand = [];
let playerHand = [];

let dealerScore = 0;
let playerScore = 0;
let deck = [];
let gameOver = false;  // Flag to check if game has ended

// Player Balance and Betting
let playerBalance = 200; // Start with 200 euros
let currentBet = 10; // Default bet is 10 euros

// DOM Elements
const dealerCardsElement = document.getElementById('dealer-cards');
const playerCardsElement = document.getElementById('player-cards');
const dealerScoreElement = document.getElementById('dealer-score');
const playerScoreElement = document.getElementById('player-score');
const gameMessageElement = document.getElementById('game-message');
const balanceElement = document.getElementById('balance');
const betAmountElement = document.getElementById('bet-amount');

// Game Buttons
document.getElementById('hit-button').addEventListener('click', playerHit);
document.getElementById('stand-button').addEventListener('click', playerStand);
document.getElementById('reset-button').addEventListener('click', resetGame);
document.getElementById('place-bet-button').addEventListener('click', placeBet);

// Initialize the game
function initializeDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCard(hand) {
    const card = deck.pop();
    hand.push(card);
    return card;
}

function cardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) {
        return 10;
    }
    if (card.value === 'A') {
        return 11;
    }
    return parseInt(card.value);
}

function calculateScore(hand) {
    let score = hand.reduce((sum, card) => sum + cardValue(card), 0);

    // Adjust for Aces
    let aces = hand.filter(card => card.value === 'A').length;
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

function displayCards() {
    dealerCardsElement.innerHTML = '';
    playerCardsElement.innerHTML = '';

    // Display dealer's cards
    if (!gameOver) {
        // Only show the first card if the game is still ongoing
        const firstCard = dealerHand[0];
        const cardElement = createCardImage(firstCard);
        dealerCardsElement.appendChild(cardElement);

        // Hide the second card (show a placeholder or "hidden" card)
        const hiddenCard = document.createElement('div');
        hiddenCard.className = 'card-back';  // This will be styled to show the card back
        dealerCardsElement.appendChild(hiddenCard);
    } else {
        // Show all dealer cards after the game ends
        dealerHand.forEach(card => {
            const cardElement = createCardImage(card);
            dealerCardsElement.appendChild(cardElement);
        });
    }

    // Display player's cards
    playerHand.forEach(card => {
        const cardElement = createCardImage(card);
        playerCardsElement.appendChild(cardElement);
    });

    // Update the scores
    dealerScoreElement.innerText = `Score: ${gameOver ? dealerScore : '?'}`;  // Show ? if the dealer's hand is not fully revealed
    playerScoreElement.innerText = `Score: ${playerScore}`;
}

function createCardImage(card) {
    const cardElement = document.createElement('img');
    let cardName = card.value.toLowerCase();

    // Handle special case for face cards
    if (card.value === 'J') {
        cardName = 'jack';
    } else if (card.value === 'Q') {
        cardName = 'queen';
    } else if (card.value === 'K') {
        cardName = 'king';
    } else if (card.value === 'A') {
        cardName = 'ace';
    }

    cardName = `${cardName}_of_${card.suit.toLowerCase()}.svg`;  // Changed extension to .svg
    cardElement.src = `images/cards/${cardName}`;
    cardElement.className = 'card-image';  // Apply styles for the card image
    return cardElement;
}

// Update the displayed balance
function updateBalance() {
    balanceElement.innerText = `Balance: €${playerBalance}`;
}

// Function to place a bet
function placeBet() {
    const betValue = parseInt(betAmountElement.value, 10);

    if (betValue > playerBalance) {
        alert("You cannot bet more than your current balance.");
        return;
    }

    currentBet = betValue;
    gameMessageElement.innerText = `You bet €${currentBet}. Good luck!`;
    document.getElementById('place-bet-button').disabled = true;
}

function playerHit() {
    const card = dealCard(playerHand);
    playerScore = calculateScore(playerHand);
    displayCards();

    if (playerScore > 21) {
        gameMessageElement.innerText = 'Player Bust! Dealer Wins!';
        playerBalance -= currentBet;  // Player loses the bet
        updateBalance();
        endGame();
    }
}

function playerStand() {
    // Dealer keeps drawing cards until their score is 17 or more
    while (dealerScore < 17) {
        dealCard(dealerHand);
        dealerScore = calculateScore(dealerHand);
    }

    gameOver = true;  // Mark the game as over to reveal the dealer's full hand

    // Determine the result
    if (dealerScore > 21) {
        gameMessageElement.innerText = 'Dealer Bust! Player Wins!';
        playerBalance += currentBet;  // Player wins, increase balance
    } else if (dealerScore === playerScore) {
        gameMessageElement.innerText = 'Push! It\'s a draw!';
        // No change in balance for a draw
    } else if (dealerScore >= playerScore) {
        gameMessageElement.innerText = 'Dealer Wins!';
        playerBalance -= currentBet;  // Player loses, decrease balance
    } else {
        gameMessageElement.innerText = 'Player Wins!';
        playerBalance += currentBet;  // Player wins, increase balance
    }

    updateBalance();  // Update the displayed balance
    displayCards();  // Show the dealer's full hand after the game ends
    endGame();
}


function resetGame() {
    dealerHand = [];
    playerHand = [];
    dealerScore = 0;
    playerScore = 0;
    gameOver = false;  // Reset the game status

    initializeDeck();
    shuffleDeck();

    // Deal initial cards for a new game
    dealCard(dealerHand);
    dealCard(dealerHand);
    dealerScore = calculateScore(dealerHand);

    dealCard(playerHand);
    dealCard(playerHand);
    playerScore = calculateScore(playerHand);

    displayCards();
    gameMessageElement.innerText = '';

    // Re-enable the Hit and Stand buttons
    document.getElementById('hit-button').disabled = false;
    document.getElementById('stand-button').disabled = false;

    // Allow player to place a new bet
    document.getElementById('place-bet-button').disabled = false;
}

function endGame() {
    // Disable the Hit and Stand buttons once the game ends
    document.getElementById('hit-button').disabled = true;
    document.getElementById('stand-button').disabled = true;
}

resetGame();  // Start the game
updateBalance();  // Initialize the displayed balance
