#!/bin/bash

# Laravelアプリケーションの起動スクリプト
# Railwayデプロイ時に使用

set -e

# データベース接続が確立されるまで待機（最大30秒）
echo "Waiting for database connection..."
for i in {1..30}; do
    if php artisan db:show > /dev/null 2>&1; then
        echo "Database connection established!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Warning: Could not establish database connection after 30 seconds"
        echo "Continuing anyway..."
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 1
done

# マイグレーションを実行（エラーが発生しても続行）
echo "Running database migrations..."
php artisan migrate --force || {
    echo "Warning: Migration failed, but continuing..."
}

# ストレージリンクを作成（既に存在する場合はスキップ）
echo "Creating storage link..."
php artisan storage:link || {
    echo "Warning: Storage link already exists or failed"
}

# キャッシュをクリアして再生成
echo "Clearing and regenerating caches..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# 本番環境ではキャッシュを生成
if [ "$APP_ENV" = "production" ]; then
    echo "Generating production caches..."
    php artisan config:cache || true
    php artisan route:cache || true
    # view:cacheはスキップ（必要に応じて自動生成される）
fi

# Laravelサーバーを起動
echo "Starting Laravel server..."
php artisan serve --host=0.0.0.0 --port=$PORT

