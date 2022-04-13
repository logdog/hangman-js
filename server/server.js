const { createGameState, processGuess, checkWordIsCorrect,  updateCorrectWord, checkWinner} = require('./game');



const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://127.0.0.1:8080",
        methods: ["GET", "POST"]
    }
});
  
io.listen(3000);

io.on('connection', client => {

    // create then game state. Send to player
    state = createGameState();
    client.emit('gameState', JSON.stringify(state));
    
    // main code loop
    client.on('keyDown', (keyCode) => {
        state = processGuess(keyCode.toUpperCase(), state);
        if (checkWordIsCorrect(state)) {
            state = updateCorrectWord(state);
        }
        else if (checkWinner(state) == 0) {

        }
        else if (checkWinner(state) == 1) {
            // player 1 wins
        }
        else if (checkWinner(state) == 2) {
            // player 2 wins
        }

        client.emit('gameState', JSON.stringify(state));
    });
});