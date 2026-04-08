const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { getStreamStatus } = require('./services/stream');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const CORS_ORIGIN = (process.env.CORS_ORIGIN || '').replace(/\/$/, '');

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json());

// Статические файлы — аватары
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

// HLS сегменты — явно выставляем CORS чтобы браузер не блокировал
app.use('/hls', express.static(path.join(__dirname, '../media/live'), {
  setHeaders(res, filePath) {
    res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (filePath.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Cache-Control', 'no-cache, no-store');
    } else if (filePath.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/mp2t');
    }
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/status', (req, res) => {
  res.json(getStreamStatus());
});

app.use((req, res) => res.status(404).json({ error: 'Маршрут не найден' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Внутренняя ошибка сервера' });
});

module.exports = app;
