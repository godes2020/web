const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Настройка хранения аватаров
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/avatars'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `user_${req.user.userId}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Разрешены только изображения: jpg, png, webp'));
  },
});

// GET /api/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, avatar_url, created_at, updated_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    if (!result.rows.length)
      return res.status(404).json({ error: 'Пользователь не найден' });

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Ошибка /me GET:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PATCH /api/me — обновить имя
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2)
      return res.status(400).json({ error: 'Имя должно содержать минимум 2 символа' });

    const result = await db.query(
      `UPDATE users SET name = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, email, name, avatar_url, updated_at`,
      [name.trim(), req.user.userId]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Ошибка /me PATCH:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/me/avatar — загрузить аватар
router.post('/me/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: 'Файл не загружен' });

    const avatarUrl = `/avatars/${req.file.filename}`;

    const result = await db.query(
      `UPDATE users SET avatar_url = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, email, name, avatar_url`,
      [avatarUrl, req.user.userId]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Ошибка /me/avatar:', err);
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

// PATCH /api/me/password — изменить пароль (авторизованный пользователь)
router.patch('/me/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ error: 'Новый пароль минимум 6 символов' });

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = userResult.rows[0];

    // Если пароль уже есть — проверяем текущий
    if (user.password_hash) {
      if (!currentPassword)
        return res.status(400).json({ error: 'Введите текущий пароль' });
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid)
        return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [passwordHash, req.user.userId]
    );

    res.json({ success: true, message: 'Пароль изменён' });
  } catch (err) {
    console.error('Ошибка /me/password:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
