const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const canvas1 = document.getElementById('player-1-canvas');
const canvas2 = document.getElementById('player-2-canvas');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

const player1TurnSpan = document.getElementById('player-1-turn');
const player2TurnSpan = document.getElementById('player-2-turn');

const screen1 = document.getElementById('screen-1');
const newGameButton = document.getElementById('new-game-btn');
const enterCodeInput = document.getElementById('enter-code-input');
const goButton = document.getElementById('go-btn');
const screen2 = document.getElementById('screen-2');
const screen2Code = document.getElementById('screen-2-code');
const gameWrapper = document.getElementById('game-wrapper');

const prevWordSpan = document.getElementById('prev-word');
const guessedWordSpan = document.getElementById('guessed-word')

const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameCode', handleGameCode);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);

socket.on('unknownGame', handleunknownGame);
socket.on('tooManyPlayers', handletooManyPlayers);

lastState = null;

// player 1
var myPlayerID = 1;

function keyDown(e) {
    console.log('key down', e.key)
    socket.emit('keyDown', e.key)
}

function keyClick() {
    console.log('key click')
    socket.emit('keyDown', this.id.split('-')[1]);
}

function paintHangman(canvas, ctx, mistakes, color) {
    let w = canvas.width;
    let h = canvas.height;

    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,w,h);


    // draw gallows
    ctx.lineWidth = 3;

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0.2*w, 1*h);
    ctx.lineTo(0.2*w, 0);
    ctx.lineTo(0.8*w, 0);
    ctx.lineTo(0.8*w, 0.1*h);
    ctx.stroke();

    
    ctx.strokeStyle = color;
    if (mistakes > 0) {
        // draw head
        ctx.beginPath();
        ctx.arc(0.8*w, 0.2*h, 0.1*h, 0, Math.PI*2);
        ctx.stroke();
    }
    if (mistakes > 1) {
        // draw spine
        ctx.beginPath();
        ctx.moveTo(0.8*w, 0.3*h);
        ctx.lineTo(0.8*w, 0.7*h);
        ctx.stroke();
    }
    if (mistakes > 2) {
        // draw left arm
        ctx.beginPath();
        ctx.moveTo(0.8*w, 0.5*h);
        ctx.lineTo(0.7*w, 0.4*h);
        ctx.stroke();
    }
    if (mistakes > 3) {
        // draw right arm
        ctx.beginPath();
        ctx.moveTo(0.8*w, 0.5*h);
        ctx.lineTo(0.9*w, 0.4*h);
        ctx.stroke();
    }
    if (mistakes > 4) {
        // draw left leg
        ctx.beginPath();
        ctx.moveTo(0.8*w, 0.7*h);
        ctx.lineTo(0.7*w, 0.9*h);
        ctx.stroke();
    }
    if (mistakes > 5) {
        // draw right leg
        ctx.beginPath();
        ctx.moveTo(0.8*w, 0.7*h);
        ctx.lineTo(0.9*w, 0.9*h);
        ctx.stroke();
    }
    if (mistakes > 6) {
        // draw first left slash
        ctx.beginPath();
        ctx.moveTo(0.75*w, 0.16*h);
        ctx.lineTo(0.78*w, 0.19*h);
        ctx.stroke();
    }
    if (mistakes > 7) {
        // draw first right slash
        ctx.beginPath();
        ctx.moveTo(0.85*w, 0.16*h);
        ctx.lineTo(0.82*w, 0.19*h);
        ctx.stroke();
    }
    if (mistakes > 8){
        // draw second left slash
        ctx.beginPath();
        ctx.moveTo(0.75*w, 0.19*h);
        ctx.lineTo(0.78*w, 0.16*h);
        ctx.stroke();
    }
    if (mistakes > 9){
        // draw second right slash
        ctx.beginPath();
        ctx.moveTo(0.85*w, 0.19*h);
        ctx.lineTo(0.82*w, 0.16*h);
        ctx.stroke();
    }
    if (mistakes > 10) {
        ctx.beginPath();
        ctx.arc(0.8*w, 0.35*h, 0.1*h, 5.5*Math.PI/4, 6.5*Math.PI/4);
        ctx.stroke();
    }
}

function paintGame(state) {

    if (!state) {
        return;
    }

    screen1.style.display = 'none';
    screen2.style.display = 'none';
    gameWrapper.style.display = 'flex';

    // update the keyboard
    for (let obj of document.getElementsByClassName('key')) {
        obj.classList.remove('player1');
        obj.classList.remove('player2');
    }
    
    if (state.player1.guesses.length > 0) {
        for (let guess of state.player1.guesses) {
            document.getElementById(`key-${guess.letter}`).classList.add('player1');
        }
    }
    
    if (state.player2.guesses.length > 0) {
        for (let guess of state.player2.guesses) {
            document.getElementById(`key-${guess.letter}`).classList.add('player2');
        }
    }

    // update the dislayed guessed word
    guessedWordSpan.innerHTML = state.guessedWord;

    // paint the hangmen
    paintHangman(canvas1, ctx1, state.player1.mistakes, state.player1.color);
    paintHangman(canvas2, ctx2, state.player2.mistakes, state.player2.color);

    // player names
    player1TurnSpan.innerHTML = state.player1.name;
    player2TurnSpan.innerHTML = state.player2.name;

    // turn indicator
    if (state.turn == 1) {
        player1TurnSpan.style.color = state.player1.color;
        player2TurnSpan.style.color = 'lightgray';
    }
    else if (state.turn == 2) {
        player1TurnSpan.style.color = 'lightgray';
        player2TurnSpan.style.color = state.player2.color;
    }

    // draw the most recently-guessed word
    if (state.previousWords.length > 0) {
        prevWordSpan.innerHTML = state.previousWords[state.previousWords.length-1];
    }
    console.log(state.correctWord)
}

function init() {

    // initially hide the screen
    newGameButton.addEventListener('click', () => {
        socket.emit('newGame');
    });

    goButton.addEventListener('click', () => {
        var code = enterCodeInput.value;
        socket.emit('joinGame', code);
    });

    // add key listeners
    document.addEventListener('keydown', keyDown);

    for (let obj of document.getElementsByClassName('key')) {
        obj.addEventListener('click', keyClick);
    }

    canvas1.width = canvas1.height = 25 * window.innerWidth / 100;
    canvas2.width = canvas2.height = 25 * window.innerWidth / 100;

    // add listener for window resize
    window.addEventListener("resize", () => {
        canvas1.width = canvas1.height = 25 * window.innerWidth / 100;
        canvas2.width = canvas2.height = 25 * window.innerWidth / 100;
        paintGame(lastState);
    });
}

init();

function handleGameState(gameState) {
    console.log(gameState)
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => {
        paintGame(gameState);
        lastState = gameState;
        // console.log(gameState);
    });
}

function handleGameOver(msg) {
    console.log('game over')
    if (msg === myPlayerID) {
        alert('You Win');
    }
    else if (msg !== myPlayerID) {
        alert('You Lose');
    }
    console.log(msg)
}

function handleunknownGame(msg) {
    console.log('invalid room')
    console.log(msg);
    enterCodeInput.style.color = 'red';
}

function handleGameCode(msg) {
    console.log('handle create room')
    console.log(msg)

    // turn off the first screen and show the room code
    screen1.style.display = 'none';
    screen2Code.innerHTML = msg;
    screen2.style.display = 'flex';
}

function handleInit(number) {
    console.log('handleInit')
    myPlayerID = number;
}

function handletooManyPlayers(msg) {
    console.log('handletooManyPlayers()')
    console.log(msg)
}