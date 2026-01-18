#!/usr/bin/env bash
set -e

# -----------------------------
# Start Script for Railway App
# -----------------------------

echo "Waiting for Database..."

# DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD は
# Railway の Variable Reference で DB サービスを指す前提
DB_HOST=${DB_HOST:-mysql.railway.internal}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-railway}
DB_USERNAME=${DB_USERNAME:-root}
DB_PASSWORD=${DB_PASSWORD:-}

# DB が準備できるまでループ
until php -r "
try {
    \$pdo = new PDO(
        'mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}',
        '${DB_USERNAME}',
        '${DB_PASSWORD}'
    );
} catch (Exception \$e) {
    exit(1);
}
"; do
  echo "DB not ready yet..."
  sleep 2
done

echo "DB is ready!"

# マイグレーション実行（強制）
php artisan migrate --force

# アプリ起動
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
