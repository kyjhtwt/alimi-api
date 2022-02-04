const express = require("express");
var cors = require('cors');

const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {});

const teamsRouter = require('./routes/teams.js');
const stocksRouter = require('./routes/stocks.js');
const tradeRouter = require('./routes/trade.js');
const gameRouter = require('./routes/game.js');
const { swaggerUi, specs } = require('./swagger/swagger');
const buyingLogic = require('./modules/buyingLogic');
const updateTurn = require('./modules/updateTurn');


app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

io.on('connection', (socket, data) => {
  let turn;
  socket.on('gameStart', (data, fn) => {
    socket.broadcast.emit('gameStart', data);
  });
  socket.on('nextTurn', (data, fn) => {
    async function next() {
      turn = await new Promise((resolve, result) => {
        resolve(updateTurn());
      });
      socket.broadcast.emit('nextTurn',turn);
    }
    next();
  });
  socket.on('endPurchase', (data, fn) => {
    async function Purchase() {
      await new Promise((resolve, result) => {
        resolve(buyingLogic());
      })
    }
    Purchase();
  });
  socket.on('gameStop', (data, fn) => { 
    socket.broadcast.emit('gameStop', data);
  })
  socket.on('sendAnswer', (data) => {
    socket.broadcast.emit('answer', data);
  })
});



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/teams', teamsRouter);
app.use('/stocks', stocksRouter);
app.use('/trade', tradeRouter);
app.use('/game', gameRouter);

app.get('/', (req, res) => {
    res.send("Postock api server");
})

server.listen(8080, ()=>{
    console.log("8080");
})