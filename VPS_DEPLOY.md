# Деплой Скульптор Лица на VPS

## 1. Сервер (Ubuntu 22.04+)

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# PM2 глобально
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx
```

---

## 2. PostgreSQL на VPS

```bash
sudo -u postgres psql
```

Внутри psql:
```sql
CREATE USER skulptor WITH PASSWORD 'ВАШ_ПАРОЛЬ_БД';
CREATE DATABASE skulptorlitsa OWNER skulptor;
\q
```

Запустить миграции:
```bash
psql -U skulptor -d skulptorlitsa -h localhost \
  -f /var/www/skulptorlitsa/backend/src/db/migrations/001_init.sql

psql -U skulptor -d skulptorlitsa -h localhost \
  -f /var/www/skulptorlitsa/backend/src/db/migrations/002_password_reset.sql
```

---

## 3. Загрузка кода на VPS

```bash
# Через Git
git clone https://github.com/ВАШ_РЕПО /var/www/skulptorlitsa

# Или через SFTP (FileZilla) загрузить папки backend/ и skulptorlitsa/
```

---

## 4. Переменные окружения

### backend/.env
```env
PORT=4000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=skulptorlitsa
DB_USER=skulptor
DB_PASS=ВАШ_ПАРОЛЬ_БД

JWT_SECRET=СЛУЧАЙНАЯ_СТРОКА_МИНИМУМ_32_СИМВОЛА
JWT_EXPIRES_IN=30d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=egorbova2009@gmail.com
SMTP_PASS=hvdgazyosinhomfv
SMTP_FROM=egorbova2009@gmail.com

SITE_URL=https://ВАШ_ДОМЕН.ru
CORS_ORIGIN=https://ВАШ_ДОМЕН.ru
```

### skulptorlitsa/.env.local
```env
NEXT_PUBLIC_API_URL=https://ВАШ_ДОМЕН.ru/api
```

---

## 5. Установка зависимостей и сборка

```bash
# Бэкенд
cd /var/www/skulptorlitsa/backend
npm install --production

# Фронтенд
cd /var/www/skulptorlitsa/skulptorlitsa
npm install
npm run build
```

---

## 6. Запуск через PM2

```bash
# Бэкенд
cd /var/www/skulptorlitsa/backend
pm2 start src/index.js --name "skulptor-api"

# Фронтенд
cd /var/www/skulptorlitsa/skulptorlitsa
pm2 start npm --name "skulptor-web" -- start

# Сохранить список процессов
pm2 save

# Автозапуск при перезагрузке сервера
pm2 startup
# Выполнить команду которую выдаст эта команда!
```

---

## 7. Nginx — реверс-прокси

Создать файл `/etc/nginx/sites-available/skulptorlitsa`:
```nginx
server {
    listen 80;
    server_name ВАШ_ДОМЕН.ru www.ВАШ_ДОМЕН.ru;

    # Фронтенд (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Бэкенд API
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Аватарки
    location /avatars/ {
        proxy_pass http://localhost:4000/avatars/;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/skulptorlitsa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. SSL сертификат (Let's Encrypt — бесплатно)

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d ВАШ_ДОМЕН.ru -d www.ВАШ_ДОМЕН.ru

# Проверить автообновление
sudo certbot renew --dry-run
```

---

## 9. DNS настройки (у регистратора домена)

| Тип | Имя | Значение       |
|-----|-----|----------------|
| A   | @   | IP вашего VPS  |
| A   | www | IP вашего VPS  |

Изменения DNS применяются до 24 часов.

---

## 10. Команды PM2

```bash
pm2 list                    # список процессов
pm2 logs skulptor-api       # логи бэкенда
pm2 logs skulptor-web       # логи фронтенда
pm2 restart skulptor-api    # перезапустить бэкенд
pm2 restart skulptor-web    # перезапустить фронтенд
pm2 monit                   # мониторинг в реальном времени
pm2 reload skulptor-web     # reload без downtime (для фронта)
```

---

## 11. SMTP — текущие настройки и лимиты

Сейчас используется **Gmail** (`egorbova2009@gmail.com`):
- Лимит: **500 писем в день** — хватит на старте
- Пароль приложения: `hvdgazyosinhomfv`

Когда вырастешь из лимита — переключиться на:

| Провайдер | Host | Port | Бесплатно | Примечание |
|-----------|------|------|-----------|------------|
| **Gmail** (текущий) | smtp.gmail.com | 587 | 500/день | Уже настроен |
| **Resend** | smtp.resend.com | 587 | 3 000/мес | Лучший выбор для роста |
| **Brevo** | smtp-relay.brevo.com | 587 | 300/день | Есть русский интерфейс |
| **SendGrid** | smtp.sendgrid.net | 587 | 100/день | Надёжный, но мало бесплатно |

---

## Порядок действий при первом деплое

1. Купить VPS (минимум 1 CPU / 1GB RAM)
2. Настроить DNS (A-запись на IP VPS)
3. Установить всё из раздела 1
4. Создать БД и пользователя (раздел 2)
5. Загрузить код (раздел 3)
6. Заполнить `.env` файлы (раздел 4)
7. Установить зависимости и собрать фронт (раздел 5)
8. Запустить через PM2 (раздел 6)
9. Настроить Nginx (раздел 7)
10. Получить SSL сертификат (раздел 8)
11. Проверить форму регистрации и письма на почту
