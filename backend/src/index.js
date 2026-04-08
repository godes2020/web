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

io.on('connection', (socket) => {
  // Отправить текущий статус сразу при подключении
  socket.emit('stream:status', getStreamStatus());

  socket.on('chat:message', (data) => {
    // Рассылаем всем включая отправителя
    io.emit('chat:message', {
      name: data.name || 'Аноним',
      text: data.text,
      time: new Date().toISOString(),
    });
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Режим: ${process.env.NODE_ENV}`);

  startStreamServer(io);
});
