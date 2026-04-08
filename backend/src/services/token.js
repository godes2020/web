const crypto = require('crypto');
const db = require('../db');

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function saveToken(email) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.query(
    `INSERT INTO auth_tokens (email, token, expires_at) VALUES ($1, $2, $3)`,
    [email, token, expiresAt]
  );

  return token;
}

async function verifyToken(token) {
  const result = await db.query(
    `SELECT * FROM auth_tokens
     WHERE token = $1
       AND expires_at > NOW()
       AND used_at IS NULL`,
    [token]
  );

  if (!result.rows.length) return null;

  await db.query(
    `UPDATE auth_tokens SET used_at = NOW() WHERE token = $1`,
    [token]
  );

  return result.rows[0];
}

module.exports = { saveToken, verifyToken };
