#!/usr/bin/env bash
set -e

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Laravel service..."

# PostgreSQL DSN の組み立て
DB_DSN="pgsql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."

# DB が使えるようになるまでループ
until php -r "
try {
    \$pdo = new PDO(
        '${DB_DSN}',
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD'),
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );
    echo '[' . date('Y-m-d H:i:s') . '] PostgreSQL is ready!' . PHP_EOL;
} catch (Exception \$e) {
    echo '[' . date('Y-m-d H:i:s') . '] PostgreSQL connection failed: ' . \$e->getMessage() . PHP_EOL;
    echo '[' . date('Y-m-d H:i:s') . '] DSN: ${DB_DSN}' . PHP_EOL;
    echo '[' . date('Y-m-d H:i:s') . '] USER: ' . getenv('DB_USERNAME') . PHP_EOL;
    exit(1);
}
"; do
    echo '['$(date '+%Y-%m-%d %H:%M:%S')'] DB not ready yet... retrying in 2s'
    sleep 2
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Clearing config cache..."
php artisan config:clear

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running migrations..."
php artisan migrate --force

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Seeding admin user..."
php artisan db:seed --class=AdminUserSeeder --force

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Caching config..."
php artisan config:cache

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=$PORT
