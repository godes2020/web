const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailWrapper = (body) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
    <div style="background:#33783e;padding:24px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Скульптор Лица</h1>
    </div>
    <div style="padding:32px;background:#fff;border:1px solid #e0e0e0;border-radius:0 0 12px 12px;">
      ${body}
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
      <p style="color:#aaa;font-size:12px;margin:0;">Скульптор Лица — омоложение без операций</p>
    </div>
  </div>
`;

async function sendMagicLink(email, token) {
  const link = `${process.env.SITE_URL}/auth/email/verify?token=${token}`;
  await transporter.sendMail({
    from: `"Скульптор Лица" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Ваша ссылка для входа — Скульптор Лица',
    html: emailWrapper(`
      <h2 style="color:#33783e;margin-top:0;">Ссылка для входа</h2>
      <p style="color:#555;line-height:1.6;">Нажмите кнопку ниже, чтобы войти в аккаунт. Ссылка действует <strong>24 часа</strong>.</p>
      <a href="${link}" style="display:inline-block;background:#33783e;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;margin:16px 0;">Войти в аккаунт</a>
      <p style="color:#888;font-size:13px;margin-top:20px;">Не запрашивали вход — просто проигнорируйте это письмо.</p>
    `),
  });
}

async function sendPasswordReset(email, token) {
  const link = `${process.env.SITE_URL}/auth/password/reset?token=${token}`;
  await transporter.sendMail({
    from: `"Скульптор Лица" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Сброс пароля — Скульптор Лица',
    html: emailWrapper(`
      <h2 style="color:#33783e;margin-top:0;">Сброс пароля</h2>
      <p style="color:#555;line-height:1.6;">Мы получили запрос на сброс пароля для вашего аккаунта. Ссылка действует <strong>1 час</strong>.</p>
      <a href="${link}" style="display:inline-block;background:#33783e;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;margin:16px 0;">Сбросить пароль</a>
      <p style="color:#888;font-size:13px;margin-top:20px;">Не запрашивали сброс — просто проигнорируйте это письмо. Ваш пароль останется прежним.</p>
    `),
  });
}

async function sendWelcome(email, name) {
  await transporter.sendMail({
    from: `"Скульптор Лица" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Добро пожаловать в Скульптор Лица! 🌿',
    html: emailWrapper(`
      <h2 style="color:#33783e;margin-top:0;">Добро пожаловать, ${name || 'дорогая ученица'}!</h2>
      <p style="color:#555;line-height:1.6;">Ваш аккаунт успешно создан. Теперь вы можете выбрать курс и начать заниматься уже сегодня.</p>
      <a href="${process.env.SITE_URL}/courses" style="display:inline-block;background:#33783e;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;margin:16px 0;">Выбрать курс</a>
    `),
  });
}

async function sendVerificationCode(email, code) {
  await transporter.sendMail({
    from: `"Скульптор Лица" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Код подтверждения — Скульптор Лица',
    html: emailWrapper(`
      <h2 style="color:#33783e;margin-top:0;">Подтверждение регистрации</h2>
      <p style="color:#555;line-height:1.6;">Введите этот код на сайте для завершения регистрации.<br>Код действует <strong>10 минут</strong>.</p>
      <div style="text-align:center;margin:28px 0;">
        <span style="display:inline-block;background:#f5f0e8;border:2px solid #e0c584;border-radius:14px;padding:18px 40px;font-size:38px;font-weight:700;letter-spacing:10px;color:#33783e;">${code}</span>
      </div>
      <p style="color:#888;font-size:13px;">Не регистрировались? Просто проигнорируйте это письмо.</p>
    `),
  });
}

module.exports = { sendMagicLink, sendPasswordReset, sendWelcome, sendVerificationCode };
