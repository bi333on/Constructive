# Деплой на Ubuntu 24.04

Скрипт `install.sh` полностью настраивает сервер: Node.js, сборка приложения,
systemd-сервис и **Caddy** (автоматический HTTPS через Let's Encrypt).

## Требования
- Ubuntu 24.04 (чистый сервер), root-доступ.
- Домен, A-запись которого уже указывает на IP сервера.
- Порт 80 и 443 открыт (для автоматического HTTPS).

## Запуск

```bash
# 1. Клонируем репозиторий
git clone https://github.com/bi333on/Constructive.git
cd Constructive

# 2. Запускаем автоустановку (вместо example.com — ваш домен)
sudo ./deploy/install.sh example.com
```

После завершения:
- конструктор: `https://example.com`
- дашборд страниц: `https://example.com/dashboard`

SSL-сертификат Caddy выпускает и продлевает сам.

## Что делает скрипт
1. Ставит `git`, Node.js 22 LTS и Caddy (официальный репозиторий).
2. Клонирует приложение в `/opt/builder`, собирает его.
3. Создаёт служебного пользователя `builder` и systemd-сервис `builder`.
4. Настраивает Caddy как реверс-прокси на `127.0.0.1:3000`.
5. Включает автоматический HTTPS.

## Бесплатные поддомены
Каждый проект получает поддомен `<имя>.ВАШ-ДОМЕН` (например, `mysite.tilda.netfree.pro`).

Для этого нужно:
1. В панели DNS домена добавить **wildcard A-запись**: `*` → IP сервера.
2. Caddy выдаёт сертификат для каждого поддомена автоматически (on-demand).

Поддомены уже настроены в `Caddyfile` (блок `*.__DOMAIN__`).

## Данные
База SQLite хранится в `/var/lib/builder/builder.db`, загруженные картинки — в `/var/lib/builder/uploads`.
Для бэкапа достаточно скопировать эти файлы.

## Управление сервисом
```bash
sudo systemctl status builder      # статус приложения
sudo systemctl restart builder     # перезапуск приложения
sudo journalctl -u builder -f      # логи приложения
sudo systemctl status caddy        # статус Caddy
```

## Обновление приложения
```bash
cd /opt/builder
sudo git pull
cd web
sudo npm ci
sudo npm run build
sudo chown -R builder:builder /opt/builder
sudo systemctl restart builder
```
