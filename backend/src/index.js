require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { startStreamServer, getStreamStatus } = require('./services/stream');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (process.env.CORS_ORIGIN || '').replace(/\/$/, ''),
    methods: ['GET', 'POST'],
  },
});

const messageHistory = [];
const MAX_HISTORY = 50;
let viewerCount = 0;

const broadcastViewers = () => io.emit('stream:viewers', { count: viewerCount });

io.on('connection', (socket) => {
  viewerCount++;
  broadcastViewers();

  socket.emit('stream:status', getStreamStatus());
  socket.emit('chat:history', messageHistory);
  socket.emit('stream:viewers', { count: viewerCount });

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

  socket.on('disconnect', () => {
    viewerCount = Math.max(0, viewerCount - 1);
    broadcastViewers();
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Режим: ${process.env.NODE_ENV}`);

  startStreamServer(io);
});
