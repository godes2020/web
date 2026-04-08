-- Добавляем поле пароля к пользователям
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Таблица токенов сброса пароля
CREATE TABLE IF NOT EXISTS reset_tokens (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL,
  token       VARCHAR(128) UNIQUE NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  used_at     TIMESTAMP DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_token   ON reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON reset_tokens(expires_at);
