const NodeMediaServer = require('node-media-server');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const MEDIA_DIR = path.join(__dirname, '../../media/live');
let ffmpegProcess = null;
let streamOnline = false;
let streamStartedAt = null;

function getStreamStatus() {
  return { online: streamOnline, startedAt: streamStartedAt };
}

function startStreamServer(io) {
  const STREAM_KEY = process.env.STREAM_KEY;
  const RTMP_PORT = parseInt(process.env.RTMP_PORT, 10) || 1935;

  if (!STREAM_KEY) {
    console.error('STREAM_KEY не задан в .env — RTMP сервер не запущен');
    return;
  }

  // Создать папку для HLS если нет
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }

  const nms = new NodeMediaServer({
    rtmp: {
      port: RTMP_PORT,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
    },
    http: {
      port: 0,       // отключаем встроенный HTTP (используем свой Express)
      allow_origin: '*',
    },
  });

  // Валидация STREAM_KEY при подключении
  nms.on('prePublish', (session) => {
    // session.streamPath = /live/КЛЮЧ
    const key = session.streamPath.split('/').pop();

    if (key !== STREAM_KEY) {
      console.log(`[RTMP] Отклонено: неверный ключ (${session.streamPath})`);
      session.socket.end();
      return;
    }

    console.log(`[RTMP] Трансляция начата (${session.streamPath})`);
    streamOnline = true;
    streamStartedAt = new Date().toISOString();
    io.emit('stream:status', { online: true, startedAt: streamStartedAt });
    startFFmpeg(RTMP_PORT, key);
  });

  nms.on('donePublish', (session) => {
    console.log(`[RTMP] Трансляция завершена (${session.streamPath})`);
    streamOnline = false;
    streamStartedAt = null;
    io.emit('stream:status', { online: false, startedAt: null });
    stopFFmpeg();
  });

  nms.run();
  console.log(`RTMP сервер запущен на порту ${RTMP_PORT}`);
}

function startFFmpeg(rtmpPort, key) {
  stopFFmpeg(); // на случай если предыдущий процесс не был остановлен

  const outputPath = path.join(MEDIA_DIR, 'stream.m3u8');
  const inputUrl = `rtmp://127.0.0.1:${rtmpPort}/live/${key}`;

  const args = [
    '-i', inputUrl,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-f', 'hls',
    '-hls_time', '4',
    '-hls_list_size', '6',
    '-hls_flags', 'delete_segments',
    outputPath,
  ];

  ffmpegProcess = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  ffmpegProcess.stdout.on('data', (data) => {
    // FFmpeg пишет основной вывод в stderr, stdout обычно пуст
  });

  ffmpegProcess.stderr.on('data', (data) => {
    // Логируем только первую строку для отладки
    const line = data.toString().trim();
    if (line.includes('Output #0') || line.includes('Error')) {
      console.log(`[FFmpeg] ${line.substring(0, 200)}`);
    }
  });

  ffmpegProcess.on('close', (code) => {
    console.log(`[FFmpeg] Процесс завершён (code ${code})`);
    ffmpegProcess = null;
  });

  ffmpegProcess.on('error', (err) => {
    console.error('[FFmpeg] Ошибка запуска:', err.message);
    console.error('[FFmpeg] Убедитесь что FFmpeg установлен и доступен в PATH');
    ffmpegProcess = null;
  });

  console.log('[FFmpeg] Транскодинг RTMP → HLS запущен');
}

function stopFFmpeg() {
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGTERM');
    ffmpegProcess = null;
    console.log('[FFmpeg] Транскодинг остановлен');
  }

  // Очистить старые сегменты
  cleanMediaDir();
}

function cleanMediaDir() {
  try {
    const files = fs.readdirSync(MEDIA_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(MEDIA_DIR, file));
    }
    console.log('[FFmpeg] HLS сегменты очищены');
  } catch (err) {
    // Папка может быть пустой или не существовать — не критично
  }
}

module.exports = { startStreamServer, getStreamStatus };
