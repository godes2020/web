require('dotenv').config();
const app = require('./app');
const { startStreamServer } = require('./services/stream');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
  console.log(`Режим: ${process.env.NODE_ENV}`);

  startStreamServer();
});
