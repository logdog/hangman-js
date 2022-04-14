// as long as the server is running, use these words
const fs = require('fs');
let words;

const MAX_MISTAKES = 11;

try {
  words = fs.readFileSync('./words.txt', 'utf8').split('\r\n');
} catch (err) {
  console.error(err);
}

module.exports = {
    createGameState,
    processGuess,
    checkWordIsCorrect,
    updateCorrectWord,
    checkWinner
}


function createGameState() {
    let w = words[Math.floor(Math.random()*words.length)].toUpperCase();
    return {
        correctWord: w,
        guessedWord: '_'.repeat(w.length),
        player1: {
            guesses: [],
            mistakes: 0,
            name: 'Player 1',
            color: 'orange',
            id: ''
        },
        player2: {
            guesses: [],
            mistakes: 0,
            name: 'Player 2',
            color: 'blue',
            id: ''
        },
        turn: 1,
        previousWords: [],
        started: false
    };
}

function processGuess(key, state) {
    // check if key is a valid character
    key = key.toUpperCase();
    if (!(key >= 'A' &&  key <= 'Z')) {
        return state;
    }

    // check if this character has already been guessed
    for (let guess of state.player1.guesses) {
        if (key == guess.letter) {
            return state;
        }
    }
    for (let guess of state.player2.guesses) {
        if (key == guess.letter) {
            return state;
        }
    }

    // game state logic
    if (state.correctWord.includes(key)) {

        // we guessed the a letter correctly
        if (state.turn === 1) {
            state.player1.guesses.push({letter: key, correct: true});
        }
        else if (state.turn === 2) {
            state.player2.guesses.push({letter: key, correct: true});
        }

        // update the guessedWord to include the guessed letter
        newGuessedWordArr = [];
        for (let i=0; i<state.correctWord.length; i++) {
            if (state.correctWord[i] === state.guessedWord[i]) {
                newGuessedWordArr.push(state.correctWord[i]);
            }
            else if (state.correctWord[i] === key) {
                newGuessedWordArr.push(state.correctWord[i]);
            }
            else {
                newGuessedWordArr.push(state.guessedWord[i]);
            }
        }
        state.guessedWord = newGuessedWordArr.join('');
    }
    else {
        // the letter was an incorrect guess
        if (state.turn === 1) {
            state.player1.guesses.push({letter: key, correct: false});
            state.player1.mistakes += 1;
        }
        else if (state.turn === 2) {
            state.player2.guesses.push({letter: key, correct: false});
            state.player2.mistakes += 1;
        }
    }

    // update the player's turn
    state.turn = state.turn % 2 + 1;
    return state;
}

function checkWordIsCorrect(state) {
    if (state.correctWord === state.guessedWord) {
        return true;
    }
    return false;
}

// updates the correct word and resets the guessed word
// also clears the keyboard
function updateCorrectWord(state) {
    state.previousWords.push(state.correctWord);

    // if we somehow had the crazy scenario where we got through all 750+ words...
    // allow us to start recyling old words.... in a FAT minute
    if (state.previousWords.length >= words.length) {
        state.previousWords = state.previousWords.slice(-words.length/2);
    }
    
    // ensure that we find a new word to use
    function findNewWord() {
        let newWord = words[Math.floor(Math.random()*words.length)].toUpperCase();

        for (let oldWord of state.previousWords) {
            if (newWord === oldWord) {
                return findNewWord();
            }
        }
        return newWord;
    }

    state.correctWord = findNewWord();
    state.guessedWord = '_'.repeat(state.correctWord.length);
    state.player1.guesses = [];
    state.player2.guesses = [];
    return state;
}

function checkWinner(state) {
    if (state.player1.mistakes >= MAX_MISTAKES) {
        return 2; // player 2 wins
    }
    else if (state.player2.mistakes >= MAX_MISTAKES) {
        return 1; // player 1 wins
    }
    return 0; // no winner yet
}