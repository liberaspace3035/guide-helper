# Railwayデプロイ準備状況チェックリスト（Laravelアプリ）

## ✅ 確認済み項目

### 1. プロジェクト構造
- ✅ Laravelアプリケーション（`app/`, `routes/`, `config/`など）
- ✅ `composer.json`が存在し、依存関係が定義済み
- ✅ `artisan`ファイルが存在（Laravel CLI）
- ✅ Bladeテンプレート（`resources/views/`）
- ✅ Laravelの設定ファイル（`config/`ディレクトリ）

### 2. 起動コマンド
- ✅ `artisan`コマンドが使用可能
- ✅ Laravelの組み込みサーバーは`php artisan serve`で起動可能
- ✅ Railwayでは通常`php artisan serve --host=0.0.0.0 --port=$PORT`を使用

### 3. 環境変数の使用状況
Laravelで使用されている環境変数（`.env`ファイルで設定）：
- `APP_KEY` - アプリケーションキー（**必須、`php artisan key:generate`で生成**）
- `APP_ENV=production` - 本番環境設定
- `APP_DEBUG=false` - デバッグモード（本番では必ずfalse）
- `DB_CONNECTION=mysql` - データベース接続タイプ
- `DB_HOST` - データベースホスト（**必須、要設定**）
- `DB_PORT` - データベースポート（通常3306）
- `DB_DATABASE` - データベース名（**必須、要設定**）
- `DB_USERNAME` - データベースユーザー（**必須、要設定**）
- `DB_PASSWORD` - データベースパスワード（**必須、要設定**）
- `JWT_SECRET` - JWT秘密鍵（**必須、`php artisan jwt:secret`で生成**）

### 4. ファイル構成
- ✅ `.gitignore`が適切に設定済み
- ✅ `vendor/`ディレクトリが除外されている
- ✅ `.env`ファイルが除外されている
- ✅ `storage/`と`bootstrap/cache/`に書き込み権限が必要

### 5. データベースマイグレーション
- ✅ マイグレーションファイルが`database/migrations/`に存在
- ⚠️ デプロイ時にマイグレーションを実行する必要がある（`php artisan migrate`）

## ⚠️ 注意点・改善推奨事項

### 1. Railway設定ファイル（オプション）
`railway.json`や`nixpacks.toml`を作成すると、デプロイ設定を明示的に指定できます。

### 2. ビルドとデプロイ
Laravelアプリの場合、以下の手順が必要です：
1. Composer依存関係のインストール（`composer install --no-dev --optimize-autoloader`）
2. 環境変数の設定
3. アプリケーションキーの生成（`.env`に`APP_KEY`がない場合）
4. JWT秘密鍵の生成（`.env`に`JWT_SECRET`がない場合）
5. ストレージリンクの作成（`php artisan storage:link`）
6. キャッシュの最適化（`php artisan config:cache`、`php artisan route:cache`、`php artisan view:cache`）
7. データベースマイグレーション実行（`php artisan migrate --force`）

### 3. データベース接続
RailwayではMySQLサービスを別途作成する必要があります。接続情報は環境変数で設定します。

### 4. ストレージとキャッシュ
- `storage/`ディレクトリに書き込み権限が必要
- `bootstrap/cache/`ディレクトリに書き込み権限が必要
- 本番環境では`php artisan config:cache`、`php artisan route:cache`を実行してパフォーマンスを最適化

## 📋 Railwayデプロイ時の設定手順

### ステップ1: Railwayプロジェクトの作成
1. Railwayダッシュボードで新しいプロジェクトを作成
2. GitHubリポジトリを接続

### ステップ2: データベースサービスの追加
1. RailwayでMySQLサービスを追加
2. 接続情報を環境変数として設定：
   - `DB_CONNECTION=mysql`
   - `DB_HOST` - MySQLサービスから提供されるホスト
   - `DB_PORT` - ポート（通常3306）
   - `DB_DATABASE` - データベース名
   - `DB_USERNAME` - MySQLユーザー名
   - `DB_PASSWORD` - MySQLパスワード

### ステップ3: Laravelサービスの設定
1. ルートディレクトリをプロジェクトルートに設定
2. ビルドコマンドを設定（オプション、またはRailwayの自動検出を使用）：
   ```
   composer install --no-dev --optimize-autoloader
   ```
3. 起動コマンドを設定：
   ```
   php artisan serve --host=0.0.0.0 --port=$PORT
   ```
4. 環境変数を設定：
   - `APP_KEY` - `php artisan key:generate`で生成（または手動で32文字のランダム文字列）
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `JWT_SECRET` - `php artisan jwt:secret`で生成（または手動で長いランダム文字列）

### ステップ4: デプロイ後の初期設定
デプロイ後、以下のコマンドを実行する必要があります（RailwayのDeploy Scriptsまたは手動で）：
```bash
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 🔧 推奨されるRailway設定

### `railway.json`（オプション）
プロジェクトルートに`railway.json`を作成：

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "composer install --no-dev --optimize-autoloader"
  },
  "deploy": {
    "startCommand": "php artisan serve --host=0.0.0.0 --port=$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## ✅ 結論

**Laravelアプリとしてデプロイ可能な状態です！**

ただし、以下の点を確認・設定する必要があります：
1. ✅ 基本的なLaravel構造は整っている
2. ⚠️ 環境変数の設定が必要（特に`APP_KEY`、`JWT_SECRET`、データベース接続情報）
3. ⚠️ データベースマイグレーションの実行方法を検討する必要がある
4. ⚠️ ストレージリンクの作成が必要

次のステップとして、Railwayでの実際のデプロイ作業を進めることができます。
