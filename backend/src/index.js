require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { startStreamServer, getStreamStatus, cleanMediaDir } = require('./services/stream');

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (process.env.CORS_ORIGIN || '').replace(/\/$/, ''),
    methods: ['GET', 'POST'],
  },
});

let messageHistory = [];
const MAX_HISTORY = 50;
let viewerCount = 0;

const broadcastViewers = () => io.emit('stream:viewers', { count: viewerCount });

function scheduleReset() {
  const now  = new Date();
  const next = new Date();
  next.setUTCHours(1, 0, 0, 0); // 4:00 МСК = 01:00 UTC
  if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
  setTimeout(() => {
    messageHistory = [];
    io.emit('chat:reset');
    scheduleReset();
  }, next - now);
}

io.on('connection', (socket) => {
  viewerCount++;
  broadcastViewers();

  socket.emit('stream:status', getStreamStatus());
  socket.emit('chat:history', messageHistory);
  socket.emit('stream:viewers', { count: viewerCount });

  socket.on('chat:message', (data) => {
    const msg = {
      name:    data.name    || 'Аноним',
      text:    data.text,
      time:    new Date().toISOString(),
      replyTo: data.replyTo || null,
      nonce:   data.nonce   || null,
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

// Чистить HLS файлы при завершении процесса (PM2 restart, Ctrl+C, kill)
function shutdown() {
  cleanMediaDir();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT',  shutdown);

server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Режим: ${process.env.NODE_ENV}`);

  cleanMediaDir(); // убрать мусор от предыдущего краша
  startStreamServer(io);
  scheduleReset();
});
