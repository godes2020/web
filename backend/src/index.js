require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { startStreamServer, getStreamStatus } = require('./services/stream');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const messageHistory = [];
const MAX_HISTORY = 50;

io.on('connection', (socket) => {
  // Отправить текущий статус и историю чата при подключении
  socket.emit('stream:status', getStreamStatus());
  socket.emit('chat:history', messageHistory);

  socket.on('chat:message', (data) => {
    const msg = {
      name: data.name || 'Аноним',
      text: data.text,
      time: new Date().toISOString(),
    };
    messageHistory.push(msg);
    if (messageHistory.length > MAX_HISTORY) messageHistory.shift();
    io.emit('chat:message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Режим: ${process.env.NODE_ENV}`);

  startStreamServer(io);
});
