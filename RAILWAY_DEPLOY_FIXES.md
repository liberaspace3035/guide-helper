# Railwayデプロイ時の修正点まとめ

このドキュメントでは、LaravelアプリケーションをRailwayにデプロイする際に発生した問題と、その修正方法をまとめています。

## 📋 デプロイ成功までの経緯

### 初期状態
- Reactフロントエンド（`frontend/`）とNode.jsバックエンド（`backend/`）が存在
- `vendor/`ディレクトリがGitに含まれていた（約76MB、8672ファイル）
- `composer.lock`がローカルのPHP 8.4環境向けにロックされていた
- `composer.json`のPHP要件が`^8.1`だった

---

## 🔴 発生した問題と修正点

### 1. PHPバージョンの不一致問題

#### 問題
```
✖ No version available for php 8.1
```

#### 原因
- RailwayのRailpackはPHP 8.2以上のみサポート
- `composer.json`で`"php": "^8.1"`と指定していた

#### 修正内容
1. **`composer.json`のPHP要件を更新**
   - 変更前: `"php": "^8.1"`
   - 変更後: `"php": "^8.4"`

2. **理由**: `composer.lock`に含まれる`symfony/css-selector v8.0.0`がPHP 8.4以上を要求していたため

---

### 2. `composer.lock`のバージョン不一致

#### 問題
```
lcobucci/clock 3.5.0 requires php ~8.3.0 || ~8.4.0 || ~8.5.0 -> 
your php version (8.2.30) does not satisfy that requirement.

symfony/css-selector v8.0.0 requires php >=8.4 -> 
your php version (8.2.30) does not satisfy that requirement.
```

#### 原因
- ローカル環境がPHP 8.4.8を使用していた
- `composer.lock`がPHP 8.4向けのパッケージバージョンでロックされていた
- RailwayはPHP 8.2を使用しようとしていた

#### 修正内容
- `composer.json`のPHP要件を`^8.4`に変更
- Railwayの自動検出がPHP 8.4を使用するように変更

---

### 3. `vendor/`ディレクトリがGitに含まれていた問題

#### 問題
```
ERROR: failed to build: failed to solve: rpc error: code = Unknown desc = max depth exceeded
```

#### 原因
- `vendor/`ディレクトリ（約76MB、8672ファイル）がGitリポジトリに含まれていた
- ビルドコンテキストが大きすぎてDockerの「max depth exceeded」エラーが発生

#### 修正内容
1. **`.gitignore`に`vendor/`を追加**
   ```gitignore
   # 依存関係
   node_modules/
   vendor/
   ```

2. **Gitから`vendor/`を削除**
   ```bash
   git rm -r --cached vendor/
   ```

3. **`.dockerignore`を作成して、Dockerビルドコンテキストから除外**
   ```dockerignore
   # Dependencies
   vendor/
   node_modules/
   ```

#### なぜ削除して問題ないか
- `vendor/`は通常Gitに含めない（`.gitignore`で除外する）
- Railwayのビルド時に`composer install`が自動実行される
- `composer.lock`が存在するため、同じバージョンの依存関係がインストールされる

---

### 4. 不要なディレクトリの削除

#### 問題
- Reactフロントエンド（`frontend/`）とNode.jsバックエンド（`backend/`）が存在していたが、Laravelアプリとしてデプロイするため不要

#### 修正内容
1. **`frontend/`ディレクトリを削除**
   - LaravelアプリはBladeテンプレートを使用しているため、Reactアプリは不要

2. **`backend/`ディレクトリを削除**
   - LaravelのAPIルート（`routes/api.php`）が全てのAPIを提供しているため、独立したNode.js/Expressサーバーは不要

3. **`package.json`から関連スクリプトを削除**
   ```json
   // 削除したスクリプト
   "dev:frontend": "cd frontend && npm run dev",
   "dev:backend": "cd backend && npm run dev",
   "install:all": "...",
   "build:frontend": "...",
   "start:backend": "..."
   ```

4. **`.gitignore`から関連エントリを削除**
   - `frontend/node_modules/`
   - `backend/node_modules/`
   - `frontend/.env`
   - `backend/.env`

---

### 5. `bootstrap/cache`ディレクトリの問題

#### 問題
```
The /app/bootstrap/cache directory must be present and writable.
Script @php artisan package:discover --ansi handling the 
post-autoload-dump event returned with error code 1
```

#### 原因
- `composer install`の`post-autoload-dump`スクリプトで`php artisan package:discover`が実行される
- ビルド時に`bootstrap/cache`ディレクトリが存在しない、または書き込み権限がない

#### 修正内容
1. **`bootstrap/cache/.gitkeep`を追加**
   - ディレクトリがGitに含まれるようにする

2. **`composer.json`に`pre-install-cmd`スクリプトを追加**
   ```json
   "pre-install-cmd": [
       "@php -r \"if (!is_dir('bootstrap/cache')) { mkdir('bootstrap/cache', 0755, true); }\""
   ]
   ```

3. **`.dockerignore`を修正**
   - `bootstrap/cache/`全体を除外していたが、ディレクトリ構造は含めるように変更
   ```dockerignore
   # 変更前
   bootstrap/cache/
   
   # 変更後
   bootstrap/cache/*
   !bootstrap/cache/.gitkeep
   ```

---

### 6. `view:cache`がビルド時に実行される問題

#### 問題
```
RuntimeException 
View path not found.
```

#### 原因
- Railwayの自動検出が`php artisan view:cache`をビルド時に実行しようとしていた
- ビルド時点では環境変数が完全に読み込まれていない、または`storage/`ディレクトリが存在しない

#### 修正内容
1. **`railway.json`を作成してビルドプロセスを制御**
   - ビルドコマンドを明示的に指定しないことで、Railwayの自動検出に任せる
   - `view:cache`はビルド時に実行されないようにする

2. **理由**
   - `view:cache`はビルド時に実行する必要がない
   - デプロイ後に実行しても問題ない（Laravelは必要に応じて自動的にビューをコンパイルする）

---

### 7. Dockerビルドコンテキストのサイズ問題

#### 問題
```
ERROR: failed to build: failed to solve: 
rpc error: code = Unknown desc = max depth exceeded
```

#### 原因
- `vendor/`（約76MB）、`node_modules/`（約35MB）などの大きなディレクトリがビルドコンテキストに含まれていた
- ディレクトリ構造が深すぎた

#### 修正内容
1. **`.dockerignore`を作成**
   ```dockerignore
   # Dependencies
   vendor/
   node_modules/
   
   # Environment
   .env
   .env.backup*
   
   # Cache
   bootstrap/cache/*
   !bootstrap/cache/.gitkeep
   storage/framework/cache/data/
   storage/framework/sessions/*
   storage/framework/views/*
   ```

2. **効果**
   - ビルドコンテキストが大幅に小さくなる
   - Dockerの「max depth exceeded」エラーが解消される

---

## ✅ 最終的な修正内容まとめ

### ファイル変更

1. **`composer.json`**
   - PHP要件: `^8.1` → `^8.4`
   - `pre-install-cmd`スクリプトを追加

2. **`.gitignore`**
   - `vendor/`を追加
   - `frontend/`、`backend/`関連エントリを削除

3. **`.dockerignore`（新規作成）**
   - `vendor/`、`node_modules/`などを除外
   - `bootstrap/cache`ディレクトリ構造は保持

4. **`bootstrap/cache/.gitkeep`（新規作成）**
   - ディレクトリがGitに含まれるようにする

5. **`railway.json`（新規作成）**
   - ビルドプロセスを制御

6. **削除したファイル/ディレクトリ**
   - `frontend/`ディレクトリ全体
   - `backend/`ディレクトリ全体
   - `next-env.d.ts`
   - `nixpacks.toml`（最終的に削除）

### 削除したファイル数の目安
- `vendor/`: 約8,672ファイル（約76MB）
- `frontend/`: 約50+ファイル
- `backend/`: 約20+ファイル

---

## 🎯 デプロイ成功のポイント

### 1. 依存関係の管理
- ✅ `vendor/`をGitから除外
- ✅ `composer.lock`をGitに含める（バージョン固定）
- ✅ `composer.json`のPHP要件を適切に設定

### 2. PHPバージョンの整合性
- ✅ ローカル環境（PHP 8.4）とRailway（PHP 8.4）を一致させる
- ✅ `composer.lock`が要求するPHPバージョンと一致させる

### 3. ディレクトリ構造の確保
- ✅ `bootstrap/cache`ディレクトリをGitに含める（`.gitkeep`を使用）
- ✅ ビルド時にディレクトリが存在することを保証

### 4. ビルドコンテキストの最適化
- ✅ `.dockerignore`で不要なファイルを除外
- ✅ `vendor/`、`node_modules/`などの大きなディレクトリを除外

### 5. 不要なコードの削除
- ✅ 使用していない`frontend/`、`backend/`を削除
- ✅ アプリケーションをLaravelのみに統一

---

## 📝 教訓・ベストプラクティス

### Laravelアプリのデプロイ時

1. **`vendor/`は絶対にGitに含めない**
   - `.gitignore`で必ず除外する
   - `composer.lock`があれば、同じバージョンの依存関係がインストールされる

2. **PHPバージョンの整合性を保つ**
   - ローカル環境とデプロイ環境で同じPHPバージョンを使用することを推奨
   - または、`composer.lock`を更新して互換性のあるバージョンにロックする

3. **`bootstrap/cache`ディレクトリをGitに含める**
   - `.gitkeep`を使用してディレクトリ構造を維持する
   - Laravelの`package:discover`に必要

4. **`.dockerignore`を作成する**
   - ビルドコンテキストを小さく保つ
   - 不要なファイルを除外する

5. **ビルド時に実行するコマンドを最小限にする**
   - `view:cache`などはデプロイ後に実行する
   - ビルド時は最小限のセットアップのみ

---

## 🔍 トラブルシューティング時の確認ポイント

もしデプロイが失敗した場合、以下を確認してください：

1. **PHPバージョン**
   - `composer.json`の`php`要件
   - `composer.lock`が要求するPHPバージョン
   - Railwayで使用されているPHPバージョン

2. **依存関係のインストール**
   - `composer.lock`が存在するか
   - `vendor/`がGitに含まれていないか

3. **ディレクトリ構造**
   - `bootstrap/cache`が存在するか
   - 必要なディレクトリに書き込み権限があるか

4. **ビルドコンテキスト**
   - `.dockerignore`で不要なファイルが除外されているか
   - ビルドコンテキストが大きすぎないか

---

## 📚 参考資料

- [Railway公式ドキュメント](https://docs.railway.app/)
- [Laravel公式ドキュメント - デプロイメント](https://laravel.com/docs/deployment)
- [Composer公式ドキュメント](https://getcomposer.org/doc/)

