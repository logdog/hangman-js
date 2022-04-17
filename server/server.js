const { createGameState, processGuess, checkWordIsCorrect,  updateCorrectWord, checkWinner} = require('./game');
const { makeid } = require('./utils');

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
      origin: "http://127.0.0.1:3000"
    }
});

app.get('/hi', (req, res) => {
    console.log('hi')
    res.sendFile(__dirname + '/public/hi.html');
});

app.get('/', (req, res) => {
    console.log(__dirname + '/public/hi.html')
    // how do we send javascript, css as well?
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});


const state = {};
const clientRooms = {};

io.on('connection', client => {

    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('keyDown', handleKeyDown);

    function handleNewGame() {
        console.log('handleNewGame()')
        let gameCode = makeid(5);
        clientRooms[client.id] = gameCode;
        client.emit('gameCode', gameCode);

        state[gameCode] = createGameState();
        client.join(gameCode);
        state[gameCode].player1.id = client.id;
        client.emit('init', 1);

        console.log(clientRooms);
    }

    function handleJoinGame(gameCode) {
        console.log(gameCode)
        console.log('handleJoinGame()')
        const connectedPlayersInRoom = io.sockets.adapter.rooms.get(gameCode);

        let numClients = 0;
        if (connectedPlayersInRoom) {
            numClients = connectedPlayersInRoom.size;
        }

        if (numClients === 0) {
            console.log('unknownGame')
            client.emit('unknownGame');
            return;
        } 
        else if (numClients > 1) {
            console.log('tooManyPlayers')
            client.emit('tooManyPlayers');
            return;
        }
        else if (numClients == 1) {
            console.log('one player in the room. add a second.')
            clientRooms[client.id] = gameCode;
            client.join(gameCode);
            state[gameCode].player2.id = client.id;
            client.emit('init', 2);

            startGame(gameCode);
        }
    }

    function handleKeyDown(keyCode) {
        console.log('handleKeyDown()')

        var gameCode = clientRooms[client.id];

        if (!gameCode) {
            return;
        }

        if (!state[gameCode].started) {
            return;
        }

        updateGame(keyCode, gameCode);
    }

    function startGame(gameCode) {
        console.log('startGame()')
        state[gameCode].started = true;
        io.to(gameCode).emit('gameState', JSON.stringify(state[gameCode]));
    }

    function updateGame(keyCode, gameCode) {
        console.log('updateGame()')

        if(client.id !== state[gameCode].player1.id && client.id !== state[gameCode].player2.id) {
            return;
        }

        if(client.id === state[gameCode].player1.id && state[gameCode].turn !== 1) {
            return;
        }
        else if (client.id === state[gameCode].player2.id && state[gameCode].turn !== 2) {
            return;
        }

        // game logic
        state[gameCode] = processGuess(keyCode, state[gameCode]);

        if (checkWordIsCorrect(state[gameCode])) {
            state[gameCode] = updateCorrectWord(state[gameCode]);
        }

        io.to(gameCode).emit('gameState', JSON.stringify(state[gameCode]));

        var winner = checkWinner(state[gameCode]);
        if (winner !== 0) {
            io.to(gameCode).emit('gameOver', winner);
        }
        
    }


});