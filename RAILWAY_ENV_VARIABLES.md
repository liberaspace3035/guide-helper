# Railwayデプロイ用環境変数設定ガイド

このドキュメントでは、LaravelアプリケーションをRailwayにデプロイする際に必要な環境変数の詳細な説明を提供します。

## 📋 環境変数の一覧

### 🔴 必須環境変数（最低限必要）

これらの環境変数が設定されていないと、アプリケーションが正常に動作しません。

#### 1. アプリケーション基本設定

| 変数名 | 説明 | 例 | 生成方法 |
|--------|------|-----|----------|
| `APP_KEY` | アプリケーションの暗号化キー | `base64:xxxx...` (32文字のBase64エンコードされた文字列) | `php artisan key:generate` で生成 |
| `APP_ENV` | 実行環境 | `production` | 本番環境では必ず `production` |
| `APP_DEBUG` | デバッグモード | `false` | 本番環境では必ず `false` |
| `APP_URL` | アプリケーションのURL | `https://your-app.railway.app` | Railwayが提供するURL |

**設定例:**
```env
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APP_ENV=production
APP_DEBUG=false
APP_URL=https://guide-helper.railway.app
```

#### 2. データベース接続設定

| 変数名 | 説明 | 例 | 備考 |
|--------|------|-----|------|
| `DB_CONNECTION` | データベース接続タイプ | `mysql` | MySQLを使用する場合 |
| `DB_HOST` | データベースホスト | Railway MySQLサービスのホスト | Railwayが自動提供 |
| `DB_PORT` | データベースポート | `3306` | MySQLのデフォルトポート |
| `DB_DATABASE` | データベース名 | `railway` | Railwayが自動生成または手動設定 |
| `DB_USERNAME` | データベースユーザー名 | `root` | Railwayが自動生成 |
| `DB_PASSWORD` | データベースパスワード | ランダム文字列 | Railwayが自動生成 |

**設定例:**
```env
DB_CONNECTION=mysql
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=xxxxxxxxxxxxxxxxxxxx
```

**注意:** RailwayでMySQLサービスを追加すると、これらの値は自動的に提供されます。Railwayダッシュボードの「Variables」タブで確認できます。

#### 3. JWT認証設定

| 変数名 | 説明 | 例 | 生成方法 |
|--------|------|-----|----------|
| `JWT_SECRET` | JWTトークンの署名に使用する秘密鍵 | 長いランダム文字列（64文字以上推奨） | `php artisan jwt:secret` で生成 |

**設定例:**
```env
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**生成方法（ローカルで実行）:**
```bash
php artisan jwt:secret
```
または、手動で長いランダム文字列を生成して設定することもできます。

---

### 🟡 推奨環境変数（機能を有効にするために推奨）

#### 1. メール送信設定

メール通知機能を使用する場合は、以下の環境変数を設定してください。

| 変数名 | 説明 | 例 | 備考 |
|--------|------|-----|------|
| `MAIL_MAILER` | メーラードライバー | `smtp` | `smtp`, `sendmail`, `log`, `array` など |
| `MAIL_HOST` | SMTPサーバーのホスト | `smtp.gmail.com` | Gmailを使用する場合 |
| `MAIL_PORT` | SMTPサーバーのポート | `587` | TLS用。SSLの場合は `465` |
| `MAIL_USERNAME` | SMTPユーザー名 | `your-email@gmail.com` | メールアドレス |
| `MAIL_PASSWORD` | SMTPパスワード | アプリパスワード | Gmailの場合はアプリパスワード |
| `MAIL_ENCRYPTION` | 暗号化方式 | `tls` | `tls` または `ssl` |
| `MAIL_FROM_ADDRESS` | 送信者メールアドレス | `noreply@your-domain.com` | |
| `MAIL_FROM_NAME` | 送信者名 | `ガイドマッチングアプリ` | |

**設定例（Gmailを使用する場合）:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@guide-helper.com
MAIL_FROM_NAME="${APP_NAME}"
```

**メールを使用しない場合:**
```env
MAIL_MAILER=log
```
これにより、メールはログファイルに記録されます（開発・テスト用）。

#### 2. セッション・キャッシュ設定

| 変数名 | 説明 | 例 | 備考 |
|--------|------|-----|------|
| `SESSION_DRIVER` | セッションドライバー | `file` | `file`, `database`, `cookie` など |
| `SESSION_LIFETIME` | セッション有効期限（分） | `120` | デフォルト: 120分 |
| `CACHE_STORE` | キャッシュストア | `file` | `file`, `database`, `redis` など |

**設定例:**
```env
SESSION_DRIVER=file
SESSION_LIFETIME=120
CACHE_STORE=file
```

#### 3. その他のアプリケーション設定

| 変数名 | 説明 | 例 | 備考 |
|--------|------|-----|------|
| `APP_NAME` | アプリケーション名 | `ガイドマッチングアプリ` | |
| `APP_LOCALE` | デフォルト言語 | `ja` | 日本語の場合 |
| `APP_TIMEZONE` | タイムゾーン | `Asia/Tokyo` | 日本時間の場合 |

**設定例:**
```env
APP_NAME="ガイドマッチングアプリ"
APP_LOCALE=ja
APP_TIMEZONE=Asia/Tokyo
```

#### 4. 管理者アカウント設定（推奨）

**⚠️ 重要**: これらの環境変数は**Laravelアプリケーションサービス**に設定します（MySQLサービスではありません）。

データベースシーダーで管理者アカウントを自動作成する場合に使用します。

| 変数名 | 説明 | 例 | 備考 |
|--------|------|-----|------|
| `ADMIN_EMAIL` | 管理者のメールアドレス | `admin@yourdomain.com` | **本番環境では必須** |
| `ADMIN_PASSWORD` | 管理者のパスワード | `secure-password-123` | **本番環境では強力なパスワードを設定** |
| `ADMIN_NAME` | 管理者の表示名 | `管理者` | オプション（デフォルト: `管理者`） |

**設定例:**
```env
ADMIN_EMAIL=admin@guide-helper.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=管理者
```

**設定場所**:
- Railwayダッシュボードで、**Laravelアプリケーションサービス**を選択
- 「Variables」タブで上記の環境変数を設定
- ⚠️ MySQLサービスではなく、アプリケーションサービスに設定してください

**注意**: これらの環境変数を設定すると、`php artisan db:seed --class=AdminUserSeeder`を実行したときに、指定した情報で管理者アカウントが作成されます。設定しない場合、デフォルト値（`admin@example.com` / `admin123456`）が使用されます。

詳細は`docs/ADMIN_USER_SEEDING.md`を参照してください。

---

### 🟢 オプション環境変数（特定の機能を使用する場合のみ）

#### 1. AWS S3設定（ファイルストレージ用）

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `AWS_ACCESS_KEY_ID` | AWSアクセスキーID | |
| `AWS_SECRET_ACCESS_KEY` | AWSシークレットアクセスキー | |
| `AWS_DEFAULT_REGION` | AWSリージョン | `us-east-1` |
| `AWS_BUCKET` | S3バケット名 | |
| `AWS_USE_PATH_STYLE_ENDPOINT` | パススタイルエンドポイントを使用 | `false` |

#### 2. Redis設定（キャッシュ・セッション用）

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `REDIS_HOST` | Redisホスト | `127.0.0.1` |
| `REDIS_PASSWORD` | Redisパスワード | |
| `REDIS_PORT` | Redisポート | `6379` |

#### 3. Slack通知設定

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `SLACK_BOT_USER_OAUTH_TOKEN` | Slack Botトークン | |
| `SLACK_BOT_USER_DEFAULT_CHANNEL` | デフォルトチャンネル | `#notifications` |

#### 4. OpenAI API設定

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `OPENAI_API_KEY` | OpenAI APIキー | |

---

## 🚀 Railwayでの設定手順

### ステップ1: Railwayダッシュボードで環境変数を追加

1. Railwayプロジェクトに移動
2. デプロイするサービスを選択
3. 「Variables」タブをクリック
4. 「+ New Variable」をクリック
5. 変数名と値を入力して「Add」をクリック

### ステップ2: 必須環境変数の設定

以下の環境変数を順番に設定してください：

#### 1. アプリケーション基本設定
```
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.railway.app
```

#### 2. データベース接続
RailwayでMySQLサービスを追加すると、以下の変数が自動的に提供されます。それらをコピーして設定してください。
```
DB_CONNECTION=mysql
DB_HOST=[Railwayが提供]
DB_PORT=[Railwayが提供]
DB_DATABASE=[Railwayが提供]
DB_USERNAME=[Railwayが提供]
DB_PASSWORD=[Railwayが提供]
```

#### 3. JWT認証
```
JWT_SECRET=[ローカルで生成した値または長いランダム文字列]
```

### ステップ3: 推奨環境変数の設定（オプション）

メール送信機能を使用する場合は、メール設定を追加してください。

---

## 🔧 環境変数の生成方法

### APP_KEYの生成

**方法1: ローカルで生成（推奨）**
```bash
php artisan key:generate
```
生成されたキーを`.env`ファイルからコピーして、Railwayの環境変数に設定します。

**方法2: 手動生成**
32文字のランダム文字列を生成し、Base64エンコードします：
```bash
openssl rand -base64 32
```

### JWT_SECRETの生成

**方法1: ローカルで生成（推奨）**
```bash
php artisan jwt:secret
```

**方法2: 手動生成**
64文字以上のランダム文字列を生成：
```bash
openssl rand -hex 32
```

---

## ⚠️ 重要な注意事項

### セキュリティ
1. **絶対に共有しない**: 環境変数、特に`APP_KEY`、`JWT_SECRET`、`DB_PASSWORD`は機密情報です。
2. **本番環境では必ず設定**: `APP_ENV=production`、`APP_DEBUG=false`を必ず設定してください。
3. **定期的な更新**: 定期的に秘密鍵を更新することを検討してください。

### データベース接続
- RailwayのMySQLサービスを使用する場合、接続情報は自動的に提供されます。
- 接続情報は「Variables」タブで確認できます。
- 環境変数名は、Railwayが提供する変数名（例: `MYSQLHOST`、`MYSQLUSER`など）を、Laravelの標準的な名前（`DB_HOST`、`DB_USERNAME`など）にマッピングする必要がある場合があります。

### APP_URL
- Railwayが提供するパブリックURLを使用してください。
- `https://your-app.up.railway.app` のような形式になります。
- HTTPではなくHTTPSを使用してください。

---

## 📝 最小限の環境変数設定例

最小限でも以下の環境変数が必要です：

```env
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.railway.app

DB_CONNECTION=mysql
DB_HOST=xxx.railway.app
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=xxxxxxxx

JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

これで、Laravelアプリケーションが起動し、データベースに接続できるようになります。

---

## 🔍 トラブルシューティング

### エラー: "No application encryption key has been specified"
- `APP_KEY`が設定されていないか、形式が正しくありません。
- `php artisan key:generate`で生成した値を設定してください。

### エラー: "JWT_SECRET not set"
- `JWT_SECRET`が設定されていません。
- `php artisan jwt:secret`で生成した値を設定してください。

### エラー: "Connection refused" (データベース接続エラー)
- データベース関連の環境変数が正しく設定されていない可能性があります。
- RailwayのMySQLサービスの「Variables」タブで値を確認してください。

---

## 📚 参考リンク

- [Laravel公式ドキュメント - 設定](https://laravel.com/docs/configuration)
- [Railway公式ドキュメント - 環境変数](https://docs.railway.app/develop/variables)

