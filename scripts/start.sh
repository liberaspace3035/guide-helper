#!/usr/bin/env bash
set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Laravel service..."

# DSN の組み立て
DB_DSN="mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE};charset=utf8mb4"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for DB at ${DB_HOST}:${DB_PORT}..."

# DB が使えるようになるまでループ
until php -r "
try {
    \$pdo = new PDO(
        '${DB_DSN}',
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo '[' . date('Y-m-d H:i:s') . '] DB is ready!' . PHP_EOL;
} catch (Exception \$e) {
    echo '[' . date('Y-m-d H:i:s') . '] DB connection failed: ' . \$e->getMessage() . PHP_EOL;
    echo '[' . date('Y-m-d H:i:s') . '] DSN: ${DB_DSN}' . PHP_EOL;
    echo '[' . date('Y-m-d H:i:s') . '] USER: ' . getenv('DB_USERNAME') . PHP_EOL;
    exit(1);
}
"; do
    echo '['$(date '+%Y-%m-%d %H:%M:%S')'] DB not ready yet... retrying in 2s'
    sleep 2
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running migrations..."
php artisan migrate --force

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=$PORT
