#!/usr/bin/env bash
set -e

echo "Waiting for DB..."

until php -r "
try {
    \$dsn = 'mysql:host=' . getenv('DB_HOST') .
           ';port=' . getenv('DB_PORT') .
           ';dbname=' . getenv('DB_DATABASE');
    new PDO(
        \$dsn,
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (Exception \$e) {
    exit(1);
}
"; do
  echo "DB not ready yet..."
  sleep 2
done

echo "DB is ready."

php artisan migrate --force

exec php artisan serve --host=0.0.0.0 --port=${PORT}
