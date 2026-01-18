#!/usr/bin/env bash
set -e

echo "Waiting for DB..."

until php -r "
try {
    \$pdo = new PDO(getenv('MYSQL_PUBLIC_URL'));
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
