const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const canvas1 = document.getElementById('player-1-canvas');
const canvas2 = document.getElementById('player-2-canvas');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');

const socket = io('http://localhost:3000');
socket.on('gameState', handleGameState);

// player 1
var myPlayerID = 1;

function keyDown(e) {
    socket.emit('keyDown', e.key)
}

function keyClick() {
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
    // update the keyboard
    for (let obj of document.getElementsByClassName('key')) {
        obj.classList.remove('player1');
        obj.classList.remove('player2');
    }
    
    for (let guess of state.player1.guesses) {
        document.getElementById(`key-${guess.letter}`).classList.add('player1');
        document.getElementById(`key-${guess.letter}`).removeEventListener('click', keyClick);
    }
    for (let guess of state.player2.guesses) {
        document.getElementById(`key-${guess.letter}`).classList.add('player2');
        document.getElementById(`key-${guess.letter}`).removeEventListener('click', keyClick);
    }

    // update the dislayed guessed word
    document.getElementById('guessed-word').innerHTML = state.guessedWord;

    // paint the hangmen
    paintHangman(canvas1, ctx1, state.player1.mistakes, 'orange');
    paintHangman(canvas2, ctx2, state.player2.mistakes, 'blue');

    // turn indicator
    if (state.turn == 1) {
        document.getElementById('player-1-turn').style.display = 'block';
        document.getElementById('player-2-turn').style.display = 'none';
    }
    else if (state.turn == 2) {
        document.getElementById('player-1-turn').style.display = 'none';
        document.getElementById('player-2-turn').style.display = 'block';
    }
}

function init() {
    // add click listeners for the keyboard
    for (let letter of alphabet) {
        document.getElementById(`key-${letter}`).addEventListener('click', keyClick);
    }

    // add key listeners
    document.addEventListener('keydown', keyDown);

    canvas1.width = canvas1.height = 25 * window.innerWidth / 100;
    canvas2.width = canvas2.height = 25 * window.innerWidth / 100;

    // add listener for window resize
    window.addEventListener("resize", () => {
        canvas1.width = canvas1.height = 25 * window.innerWidth / 100;
        canvas2.width = canvas2.height = 25 * window.innerWidth / 100;
    });
}

init();

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => {
        paintGame(gameState);
        // console.log(gameState);
    });
}