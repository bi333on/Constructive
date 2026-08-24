# Деплой на Ubuntu 24.04

Скрипт `install.sh` полностью настраивает сервер: Node.js, сборка приложения,
systemd-сервис, Nginx и SSL-сертификат Let's Encrypt.

## Требования
- Ubuntu 24.04 (чистый сервер), root-доступ.
- Домен, A-запись которого уже указывает на IP сервера.
- Порт 80 (и 443) открыт.

## Запуск

```bash
# 1. Клонируем репозиторий
git clone https://github.com/bi333on/Constructive.git
cd Constructive

# 2. Запускаем автоустановку (вместо example.com — ваш домен)
sudo ./deploy/install.sh example.com you@example.com
```

После завершения:
- конструктор: `https://example.com`
- дашборд страниц: `https://example.com/dashboard`

## Что делает скрипт
1. Ставит `nginx`, `certbot`, `git`, Node.js 22 LTS.
2. Клонирует приложение в `/opt/builder`, собирает его.
3. Создаёт служебного пользователя `builder` и systemd-сервис `builder`.
4. Настраивает Nginx как реверс-прокси на `127.0.0.1:3000`.
5. Выпускает SSL-сертификат и включает HTTPS.

## Данные
База SQLite хранится в `/var/lib/builder/builder.db`.
Для бэкапа достаточно скопировать этот файл.

## Управление сервисом
```bash
sudo systemctl status builder      # статус
sudo systemctl restart builder     # перезапуск
sudo journalctl -u builder -f      # логи
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
