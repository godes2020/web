const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { saveToken, verifyToken } = require('../services/token');
const { sendMagicLink, sendPasswordReset, sendWelcome, sendVerificationCode } = require('../services/email');
const { signJwt } = require('../utils/jwt');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: 'Слишком много запросов. Попробуйте через 10 минут.' },
});

// ─── ШАГ 1: Отправить код подтверждения ──────────────────────────────────────
router.post('/register/send-code', limiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2)
      return res.status(400).json({ error: 'Введите имя (минимум 2 символа)' });
    if (!email || !email.includes('@'))
      return res.status(400).json({ error: 'Введите корректный email' });
    if (!password || password.length < 6)
      return res.status(400).json({ error: 'Пароль минимум 6 символов' });

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 AND is_verified = TRUE', [normalizedEmail]
    );
    if (existing.rows.length)
      return res.status(409).json({ error: 'Аккаунт с таким email уже существует' });

    // Удалить старые неиспользованные коды для этого email
    await db.query('DELETE FROM email_codes WHERE email = $1', [normalizedEmail]);

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    await db.query(
      'INSERT INTO email_codes (email, code, expires_at) VALUES ($1, $2, $3)',
      [normalizedEmail, code, expiresAt]
    );

    await sendVerificationCode(normalizedEmail, code);

    res.json({ success: true, message: 'Код отправлен на ' + normalizedEmail });
  } catch (err) {
    console.error('Ошибка /register/send-code:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// ─── ШАГ 2: Подтвердить код и создать аккаунт ────────────────────────────────
router.post('/register/verify', limiter, async (req, res) => {
  try {
    const { name, email, password, code } = req.body;

    if (!code || code.length !== 6)
      return res.status(400).json({ error: 'Введите 6-значный код' });

    const normalizedEmail = email.toLowerCase().trim();

    const codeRow = await db.query(
      `SELECT * FROM email_codes
       WHERE email = $1 AND code = $2 AND expires_at > NOW() AND used_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, code]
    );

    if (!codeRow.rows.length)
      return res.status(400).json({ error: 'Неверный или истёкший код. Запросите новый.' });

    // Пометить код как использованный
    await db.query('UPDATE email_codes SET used_at = NOW() WHERE id = $1', [codeRow.rows[0].id]);

    // Удалить незавершённый аккаунт если был
    await db.query('DELETE FROM users WHERE email = $1 AND is_verified = FALSE', [normalizedEmail]);

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.query(
      `INSERT INTO users (email, name, password_hash, is_verified, created_at, updated_at)
       VALUES ($1, $2, $3, TRUE, NOW(), NOW()) RETURNING *`,
      [normalizedEmail, name.trim(), passwordHash]
    );
    const user = result.rows[0];

    const jwt = signJwt({ userId: user.id, email: user.email });

    sendWelcome(user.email, user.name).catch(console.error);

    res.status(201).json({
      jwt,
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
    });
  } catch (err) {
    console.error('Ошибка /register/verify:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// ─── ВХОД С ПАРОЛЕМ ──────────────────────────────────────────────────────────
router.post('/login', limiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Введите email и пароль' });

    const normalizedEmail = email.toLowerCase().trim();
    const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);

    if (!result.rows.length)
      return res.status(401).json({ error: 'Неверный email или пароль' });

    const user = result.rows[0];

    if (!user.password_hash)
      return res.status(401).json({ error: 'У этого аккаунта нет пароля. Войдите через magic link.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Неверный email или пароль' });

    const jwt = signJwt({ userId: user.id, email: user.email });

    res.json({
      jwt,
      user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url },
    });
  } catch (err) {
    console.error('Ошибка /login:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// ─── MAGIC LINK ───────────────────────────────────────────────────────────────
router.post('/email/send', limiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@'))
      return res.status(400).json({ error: 'Введите корректный email' });

    const normalizedEmail = email.toLowerCase().trim();
    const token = await saveToken(normalizedEmail);
    await sendMagicLink(normalizedEmail, token);

    res.json({ success: true, message: 'Письмо отправлено' });
  } catch (err) {
    console.error('Ошибка /email/send:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.post('/email/verify', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Токен обязателен' });

    const tokenData = await verifyToken(token);
    if (!tokenData)
      return res.status(400).json({ error: 'Ссылка недействительна или уже использована. Запросите новую.' });

    const { email } = tokenData;
    let userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (userResult.rows.length) {
      user = userResult.rows[0];
    } else {
      const newUser = await db.query(
        `INSERT INTO users (email, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *`,
        [email]
      );
      user = newUser.rows[0];
    }

    const jwt = signJwt({ userId: user.id, email: user.email });
    res.json({ jwt, user: { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('Ошибка /email/verify:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// ─── СБРОС ПАРОЛЯ ─────────────────────────────────────────────────────────────
router.post('/password/forgot', limiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@'))
      return res.status(400).json({ error: 'Введите корректный email' });

    const normalizedEmail = email.toLowerCase().trim();

    // Всегда отвечаем успехом (не раскрываем существование email)
    const userResult = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (userResult.rows.length) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 час
      await db.query(
        `INSERT INTO reset_tokens (email, token, expires_at) VALUES ($1, $2, $3)`,
        [normalizedEmail, token, expiresAt]
      );
      sendPasswordReset(normalizedEmail, token).catch(console.error);
    }

    res.json({ success: true, message: 'Если аккаунт существует — письмо отправлено' });
  } catch (err) {
    console.error('Ошибка /password/forgot:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.post('/password/reset', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) return res.status(400).json({ error: 'Токен обязателен' });
    if (!password || password.length < 6)
      return res.status(400).json({ error: 'Пароль минимум 6 символов' });

    const result = await db.query(
      `SELECT * FROM reset_tokens WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL`,
      [token]
    );

    if (!result.rows.length)
      return res.status(400).json({ error: 'Ссылка недействительна или истекла. Запросите новую.' });

    const { email } = result.rows[0];
    const passwordHash = await bcrypt.hash(password, 12);

    await db.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2`,
      [passwordHash, email]
    );

    await db.query(
      `UPDATE reset_tokens SET used_at = NOW() WHERE token = $1`,
      [token]
    );

    res.json({ success: true, message: 'Пароль успешно изменён' });
  } catch (err) {
    console.error('Ошибка /password/reset:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
