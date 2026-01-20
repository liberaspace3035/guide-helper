# 本番環境デプロイ修正履歴

このドキュメントは、Railway本番環境へのデプロイ時に発生した問題とその修正内容をまとめたものです。

## 📋 目次

1. [Schema::hasTable()エラーの修正](#1-schemahastableエラーの修正)
2. [Railwayデプロイ時のDB接続待機の改善](#2-railwayデプロイ時のdb接続待機の改善)
3. [MySQLからPostgreSQLへの切り替え](#3-mysqlからpostgresqlへの切り替え)
4. [PostgreSQL互換のSQLクエリ修正](#4-postgresql互換のsqlクエリ修正)
5. [AdminUserSeederの修正](#5-adminuserseederの修正)

---

## 1. Schema::hasTable()エラーの修正

### 問題

```
ErrorException: Array to string conversion
at Illuminate/Database/Schema/Builder.php:163
```

`Schema::hasTable()` に配列が渡されていた。

### 原因

`config/database.php` の `migrations` 設定が配列形式になっていたため、`DatabaseMigrationRepository` のコンストラクタに配列が渡されていた。

### 修正内容

**ファイル: `config/database.php`**

```php
// 修正前
'migrations' => [
    'table' => 'migrations',
    'update_date_on_publish' => true,
],

// 修正後
'migrations' => 'migrations',
```

**ファイル: `database/migrations/2026_01_17_074031_add_revision_notes_to_reports_table.php`**

```php
// 修正前
public function up(): void
{
    Schema::table('reports', function (Blueprint $table) {
        $table->text('revision_notes')->nullable()->after('status')->comment('修正依頼内容');
    });
}

// 修正後
public function up(): void
{
    if (Schema::hasTable('reports')) {
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'revision_notes')) {
                $table->text('revision_notes')->nullable()->after('status')->comment('修正依頼内容');
            }
        });
    }
}
```

**ファイル: `database/migrations/2026_01_06_131253_add_guide_preferences_to_requests_table.php`**

同様に `Schema::hasTable()` チェックを追加。

### コミット

- `fix: Schema::hasTable()に配列が渡るエラーを修正`

---

## 2. Railwayデプロイ時のDB接続待機の改善

### 問題

Railwayデプロイ時に、データベースがまだ起動していない状態でマイグレーションが実行され、エラーが発生していた。

### 原因

`startCommand` で `php artisan migrate --force` を実行していたが、DB接続の確認をせずに実行していた。

### 修正内容

**ファイル: `scripts/start.sh`**

```bash
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

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running migrations..."
php artisan migrate --force

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Seeding admin user..."
php artisan db:seed --class=AdminUserSeeder --force

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=$PORT
```

### 重要なポイント

1. **`set -e`**: エラー時に確実に停止
2. **DB接続待機ループ**: PDO接続でDBが準備できるまで待機
3. **`exec`**: PID 1をLaravelに渡す（アプリを常駐プロセスとして維持）
4. **タイムスタンプ付きログ**: デバッグしやすくするため

### コミット

- `fix: Railwayデプロイ時のDB接続待機を改善`

---

## 3. MySQLからPostgreSQLへの切り替え

### 問題

MySQL 9.4の `caching_sha2_password` 認証方式の問題や、RailwayのMySQLサービスの制約により、PostgreSQLへの切り替えを決定。

### 修正内容

#### 3.1 データベース設定の変更

**ファイル: `config/database.php`**

```php
// デフォルト接続を変更
'default' => env('DB_CONNECTION', 'pgsql'),

// PostgreSQL設定
'pgsql' => [
    'driver' => 'pgsql',
    'url' => env('DB_URL'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => env('DB_CHARSET', 'utf8'),
    'prefix' => '',
    'prefix_indexes' => true,
    'search_path' => 'public',
    'sslmode' => 'prefer',
],
```

#### 3.2 start.shの変更

**ファイル: `scripts/start.sh`**

```bash
# PostgreSQL DSN の組み立て
DB_DSN="pgsql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
```

#### 3.3 マイグレーションファイルの修正

**ファイル: `database/migrations/2026_01_06_132207_change_request_type_enum_to_english_values.php`**

PostgreSQLとMySQLの両方に対応するように修正：

```php
public function up(): void
{
    $driver = \Illuminate\Support\Facades\DB::getDriverName();
    
    if ($driver === 'pgsql') {
        // PostgreSQL用の処理
        \Illuminate\Support\Facades\DB::statement("UPDATE requests SET request_type = CASE WHEN request_type = '外出' THEN 'outing' WHEN request_type = '自宅' THEN 'home' ELSE request_type END");
        
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_request_type_check");
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests ADD CONSTRAINT requests_request_type_check CHECK (request_type IN ('outing', 'home'))");
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests ALTER COLUMN request_type SET NOT NULL");
        \Illuminate\Support\Facades\DB::statement("COMMENT ON COLUMN requests.request_type IS '依頼タイプ'");
    } else {
        // MySQL用の処理（既存の処理）
        // ...
    }
}
```

### Railway環境変数の設定

```
DB_CONNECTION=pgsql
DB_HOST=postgres.railway.internal
DB_PORT=5432
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=[Railwayが提供]
```

### コミット

- `feat: MySQLからPostgreSQLに切り替え`
- `fix: PostgreSQL互換のマイグレーションに修正`

---

## 4. PostgreSQL互換のSQLクエリ修正

### 問題

PostgreSQLでは文字列リテラルにシングルクォート（`'`）を使用する必要があるが、MySQL用のダブルクォート（`"`）が使われていた。

### エラー例

```
SQLSTATE[42703]: Undefined column: 7 ERROR: column "matched" does not exist
```

### 修正内容

**ファイル: `app/Services/AdminService.php`**

```php
// 修正前
->selectRaw('
    SUM(CASE WHEN status = "matched" THEN 1 ELSE 0 END) as matched,
    SUM(CASE WHEN status = "in_progress" THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN is_allowed = 1 THEN 1 ELSE 0 END) as approved,
')

// 修正後
->selectRaw('
    SUM(CASE WHEN status = \'matched\' THEN 1 ELSE 0 END) as matched,
    SUM(CASE WHEN status = \'in_progress\' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN is_allowed = true THEN 1 ELSE 0 END) as approved,
')
```

### PostgreSQLとMySQLの違い

| 項目 | MySQL | PostgreSQL |
|------|-------|------------|
| 文字列リテラル | `"string"` または `'string'` | `'string'` のみ |
| Boolean値 | `1` / `0` | `true` / `false` |
| ENUM型 | ネイティブサポート | CHECK制約で実現 |
| ALTER COLUMN | `MODIFY COLUMN` | `ALTER COLUMN` |

### コミット

- `fix: PostgreSQL互換のSQLクエリに修正`

---

## 5. AdminUserSeederの修正

### 問題1: 本番環境での確認プロンプト

Seederが本番環境で確認プロンプトを表示し、対話入力がないためキャンセルされていた。

### 修正1

**ファイル: `scripts/start.sh`**

```bash
# --forceフラグを追加
php artisan db:seed --class=AdminUserSeeder --force
```

### 問題2: 存在しないカラム

`users` テーブルに `email_confirmed` カラムが存在しない。

### 修正2

**ファイル: `database/seeders/AdminUserSeeder.php`**

```php
// 修正前
$admin = User::create([
    'email' => $adminEmail,
    'password_hash' => Hash::make($adminPassword),
    'name' => $adminName,
    'last_name' => '管理',
    'first_name' => '者',
    'role' => 'admin',
    'is_allowed' => true,
    'email_confirmed' => true, // ← この行を削除
]);

// 修正後
$admin = User::create([
    'email' => $adminEmail,
    'password_hash' => Hash::make($adminPassword),
    'name' => $adminName,
    'last_name' => '管理',
    'first_name' => '者',
    'role' => 'admin',
    'is_allowed' => true,
]);
```

### 環境変数設定

Railwayの環境変数に以下を設定：

```
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=管理者
```

### コミット

- `feat: デプロイ時にadminユーザーを自動作成`
- `fix: Seeder実行時に--forceフラグを追加`
- `fix: AdminUserSeederからemail_confirmedを削除`

---

## 📝 まとめ

### 主な変更ファイル

1. `config/database.php` - デフォルト接続をPostgreSQLに変更、migrations設定を修正
2. `scripts/start.sh` - DB接続待機ループ、PostgreSQL用DSN、Seeder実行を追加
3. `database/migrations/2026_01_06_132207_change_request_type_enum_to_english_values.php` - PostgreSQL互換に修正
4. `app/Services/AdminService.php` - PostgreSQL互換のSQLクエリに修正
5. `database/seeders/AdminUserSeeder.php` - email_confirmedを削除

### 重要なポイント

1. **Railwayでは `startCommand` は1本勝負**: エラーが発生すると即デプロイ失敗
2. **DB接続待機は必須**: DBが起動するまで待機するループが必要
3. **`exec` の使用**: PID 1をLaravelに渡すため必須
4. **PostgreSQLとMySQLの構文の違い**: 文字列リテラル、boolean値、ENUM型の扱いが異なる
5. **本番環境でのSeeder実行**: `--force` フラグが必要

### デプロイフロー

1. DB接続を待機（ループ）
2. マイグレーション実行（`--force`）
3. Adminユーザー作成（`--force`）
4. Laravelサーバー起動（`exec`）

---

## 🔗 関連ドキュメント

- [RAILWAY_ENV_VARIABLES.md](../RAILWAY_ENV_VARIABLES.md) - Railway環境変数設定ガイド
- [RAILWAY_DEPLOY_CHECK.md](../RAILWAY_DEPLOY_CHECK.md) - Railwayデプロイチェックリスト
- [docs/RAILWAY_MYSQL_94_PHP_FIX.md](./RAILWAY_MYSQL_94_PHP_FIX.md) - MySQL 9.4対応（参考）

---

**最終更新日**: 2026-01-19

