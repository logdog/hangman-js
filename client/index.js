console.log('hello')

gameState = {
    correctWord: 'BANANA',
    guessedWord: 'BA_A_A',
    player1: {
        guesses: [
            {letter: 'A', correct: true},
            {letter: 'S', correct: false},
            {letter: 'D', correct: false},
            {letter: 'X', correct: false},
        ],
        mistakes: 13,
    },
    player2: {
        guesses: [
            {letter: 'B', correct: true},
            {letter: 'Q', correct: false},
            {letter: 'T', correct: false},
        ],
        mistakes: 12,
    },
    turn: 1
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const canvas1 = document.getElementById('player-1-canvas');
const canvas2 = document.getElementById('player-2-canvas');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

const socket = io('http://localhost:3000');
socket.on('init', handleInit);
socket.on('gameState', handleGameState);

// player 1
var myPlayerID = 1;

// for now, just toggle between the three colors
function keyClicked() {

    if (gameState.turn !== myPlayerID) {
        return;
    }

    if (this.classList.contains('player1') || this.classList.contains('player2')) {
        return;
    }

    if (myPlayerID == 1) {
        this.classList.add('player1');
    } 
    else if (myPlayerID == 2){
        this.classList.add('player2');
    }
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
    // update the keyboard
    for (let guess of state.player1.guesses) {
        document.getElementById(`key-${guess.letter}`).classList.add('player1');
        document.getElementById(`key-${guess.letter}`).removeEventListener('click', keyClicked);
    }
    for (let guess of state.player2.guesses) {
        document.getElementById(`key-${guess.letter}`).classList.add('player2');
        document.getElementById(`key-${guess.letter}`).removeEventListener('click', keyClicked);
    }

    // update the dislayed guessed word
    document.getElementById('guessed-word').innerHTML = state.guessedWord;

    // paint the hangmen
    paintHangman(canvas1, ctx1, state.player1.mistakes, 'orange');
    paintHangman(canvas2, ctx2, state.player2.mistakes, 'blue');
}

function init() {
    // add click listeners for the keyboard
    for (let letter of alphabet) {
        document.getElementById(`key-${letter}`).addEventListener('click', keyClicked);
    }

    canvas1.width = canvas1.height = 25 * window.innerWidth / 100;
    canvas2.width = canvas2.height = 25 * window.innerWidth / 100;

    // add listener for window resize
    window.addEventListener("resize", () => {
        canvas1.width = canvas1.height = 25 * window.innerWidth / 100;
        canvas2.width = canvas2.height = 25 * window.innerWidth / 100;
        paintGame(gameState);
        console.log('resize')
    });

    // paintGame(gameState);
}

init();

function handleInit(msg) {
    console.log(msg)
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => {
        paintGame(gameState);
    });
}