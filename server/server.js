// const { createGameState } = require('./game')


const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
        origin: "http://127.0.0.1:8080",
        methods: ["GET", "POST"]
    }
});
  
io.listen(3000);

io.on('connection', client => {
    client.emit('init', { data: 'hello world'});
});


