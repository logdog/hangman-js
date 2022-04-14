const { createGameState, processGuess, checkWordIsCorrect,  updateCorrectWord, checkWinner} = require('./game');
const { makeid } = require('./utils');

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://127.0.0.1:8080",
        methods: ["GET", "POST"]
    }
});
  
io.listen(3000);

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

        console.log('bleh.')
        console.log(connectedPlayersInRoom)
        console.log(numClients)

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
        console.log(keyCode)

        var gameCode = clientRooms[client.id];
        console.log(gameCode)
        if (!gameCode) {
            return;
        }

        if (!state[gameCode].started) {
            return;
        }

        console.log('game has started and key was pressed')
        updateGame(keyCode, gameCode);
    }

    function startGame(gameCode) {
        console.log('startGame()')
        state[gameCode].started = true;
        io.to(gameCode).emit('gameState', JSON.stringify(state[gameCode]));
    }

    function updateGame(keyCode, gameCode) {
        console.log(client.id)
        console.log(state[gameCode])

        if(client.id === state[gameCode].player1.id) {
            console.log('it was player 1')
        }
        else if (client.id === state[gameCode].player2.id) {
            console.log('it was player 2')
        }
    }

        // // add listeners
        // let allUsers = room.sockets;
        // var player1 = allUsers[0];
        // var player2 = allUsers[1];

        // console.log(player1)
        // console.log(player2)

        // player1.on('keyDown', (keyCode) => {
        //     onKeyDown(client, keyCode)
        // });
        // player2.on('keyDown', (keyCode) => {
        //     onKeyDown(client, keyCode)
        // });
    

    //     function onKeyDown(player, keyCode) {

    //         // TODO: check that the player didn't skip a turn
    //         console.log('keydown()')
    //         console.log(player == player1, player == player2, state.turn)
    //         if (player == player1 && state.turn !== 1) {
    //             console.log('bad 1')
    //             return;
    //         }
    //         if (player == player2 && state.turn !== 2) {
    //             console.log('bad 2')
    //             return;
    //         }
    //         console.log('yay')

            


    //     // start the game
    //     player1.emit('gameState', JSON.stringify(state));
    //     player2.emit('gameState', JSON.stringify(state));

    // }

});