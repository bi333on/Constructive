#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Автоустановка конструктора сайтов на Ubuntu 24.04
# Использование: sudo ./install.sh example.com [email]
# ============================================================

DOMAIN="${1:-}"
EMAIL="${2:-}"
REPO="https://github.com/bi333on/Constructive.git"
APP_DIR="/opt/builder"
APP_USER="builder"
PORT="3000"

if [ -z "$DOMAIN" ]; then
  echo "Использование: sudo ./install.sh example.com [email]"
  exit 1
fi

echo "==> [1/8] Установка системных пакетов"
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  curl git ca-certificates gnupg nginx certbot python3-certbot-nginx

echo "==> [2/8] Установка Node.js 22 LTS"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi

echo "==> [3/8] Создание служебного пользователя ${APP_USER}"
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin "$APP_USER"
fi

echo "==> [4/8] Клонирование репозитория в ${APP_DIR}"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR" && git pull --ff-only
else
  git clone "$REPO" "$APP_DIR"
fi

echo "==> [5/8] Настройка окружения и папки данных"
cat > "$APP_DIR/web/.env.local" <<EOF
NEXT_PUBLIC_SITE_URL=https://$DOMAIN
DATABASE_PATH=/var/lib/builder/builder.db
EOF

mkdir -p /var/lib/builder
chown -R "$APP_USER":"$APP_USER" /var/lib/builder

echo "==> [6/8] Сборка приложения"
cd "$APP_DIR/web"
npm ci || npm install
npm run build
npm prune --omit=dev || true
chown -R "$APP_USER":"$APP_USER" "$APP_DIR"

echo "==> [7/8] Установка systemd-сервиса"
cp "$APP_DIR/deploy/builder.service" /etc/systemd/system/builder.service
systemctl daemon-reload
systemctl enable --now builder

echo "==> [8/8] Настройка Nginx и SSL"
sed "s/__DOMAIN__/$DOMAIN/g; s/__PORT__/$PORT/g" \
  "$APP_DIR/deploy/nginx.conf" > /etc/nginx/sites-available/builder
ln -sf /etc/nginx/sites-available/builder /etc/nginx/sites-enabled/builder
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

if [ -n "$EMAIL" ]; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
else
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos \
    --register-unsafely-without-email --redirect
fi

systemctl restart builder

echo ""
echo "=============================================="
echo "Готово! Конструктор:  https://$DOMAIN"
echo "Дашборд страниц:      https://$DOMAIN/dashboard"
echo "=============================================="
