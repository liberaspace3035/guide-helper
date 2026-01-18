#!/usr/bin/env bash
set -e

echo "Waiting for DB..."

DB_DSN="mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE};charset=utf8mb4"

until php -r "
try {
    \$pdo = new PDO('${DB_DSN}', getenv('DB_USERNAME'), getenv('DB_PASSWORD'), [
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET SESSION default_authentication_plugin=mysql_native_password'
    ]);
    echo 'DB is ready!' . PHP_EOL;
} catch (Exception \$e) {
    echo 'DB connection failed: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"; do
  echo "DB not ready yet..."
  sleep 2
done

echo "Running migrations..."
php artisan migrate --force

echo "Starting server..."
exec php artisan serve --host=0.0.0.0 --port=\$PORT
