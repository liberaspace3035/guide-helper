#!/usr/bin/env bash
set -e

echo "Waiting for DB..."

DB_DSN="mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE};charset=utf8mb4"

until php -r "
try {
    \$pdo = new PDO(
        '${DB_DSN}',
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD'),
        [
            PDO::MYSQL_ATTR_INIT_COMMAND => 'SET SESSION default_authentication_plugin=mysql_native_password',
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]
    );
    echo '[' . date('Y-m-d H:i:s') . '] DB is ready!' . PHP_EOL;
} catch (Exception \$e) {
    echo '[' . date('Y-m-d H:i:s') . '] DB connection failed: ' . \$e->getMessage() . PHP_EOL;
    echo '[' . date('Y-m-d H:i:s') . '] DSN: ${DB_DSN}' . PHP_EOL;
    echo '[' . date('Y-m-d H:i:s') . '] USER: ' . getenv('DB_USERNAME') . PHP_EOL;
    echo '[' . date('Y-m-d H:i:s') . '] PASSWORD: ' . getenv('DB_PASSWORD') . PHP_EOL;
    exit(1);
}
"; do
  echo '['$(date '+%Y-%m-%d %H:%M:%S')'] DB not ready yet...'
  sleep 2
done

echo "["$(date '+%Y-%m-%d %H:%M:%S')"] Running migrations..."
php artisan migrate --force

echo "["$(date '+%Y-%m-%d %H:%M:%S')"] Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=$PORT
