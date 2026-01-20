# Railway初回デプロイ時のAPP_URL設定方法

`APP_URL`はデプロイ後に確定しますが、初回デプロイ前にも設定が必要です。以下の方法を推奨します。

## 🎯 推奨方法：2段階設定

### ステップ1: デプロイ前（一時的な値を設定）

初回デプロイ前に、一時的な値またはプレースホルダーを設定します。

#### オプションA: Railwayの自動環境変数を使用（推奨）

Railwayは自動的に`RAILWAY_PUBLIC_DOMAIN`などの環境変数を提供します。これを使用できます：

**環境変数の設定:**
```env
APP_URL=https://${RAILWAY_PUBLIC_DOMAIN}
```

**注意:** 一部のRailwayバージョンでは、この変数が利用できない場合があります。その場合はオプションBを使用してください。

#### オプションB: 一時的なプレースホルダーを設定

一時的な値を設定し、デプロイ後に実際のURLに更新します：

**環境変数の設定:**
```env
APP_URL=https://placeholder.railway.app
```

または、空にしておいてもLaravelはデフォルト値（`http://localhost`）を使用しますが、本番環境では必ず設定する必要があります。

#### オプションC: デフォルト値に依存（一時的）

初回デプロイ時のみ、`APP_URL`を設定せずにデプロイすることも可能です。ただし、**デプロイ後すぐに設定してください**。

---

### ステップ2: デプロイ後に実際のURLを設定

1. **デプロイが完了したら、RailwayダッシュボードでURLを確認**
   - サービスの「Settings」→「Domains」で確認
   - 例: `https://guide-helper-production.up.railway.app`

2. **環境変数を更新**
   - 「Variables」タブで`APP_URL`を編集
   - 実際のURLに更新: `https://guide-helper-production.up.railway.app`

3. **アプリケーションを再起動**
   - Railwayは環境変数の変更を検出して自動的に再デプロイします
   - または、手動で「Deploy」をクリック

---

## 📋 初回デプロイ前の環境変数設定例

### 最小限の設定（デプロイ前に設定）

```env
APP_KEY=base64:vhxfhMyn4y2hjl6dwCRwYKi3URPJJW9t7ku0jDUVx7g=
APP_ENV=production
APP_DEBUG=false
APP_URL=https://placeholder.railway.app  # ← 一時的な値（後で更新）

DB_CONNECTION=mysql
DB_HOST=[Railway MySQLサービスから取得]
DB_PORT=3306
DB_DATABASE=[Railway MySQLサービスから取得]
DB_USERNAME=[Railway MySQLサービスから取得]
DB_PASSWORD=[Railway MySQLサービスから取得]

JWT_SECRET=7f1Yh5rY79LPox3RDhtmCJoE4wDloAHZeKMftrCJnoxxNBeQawZSwCWYQAE1qm39
```

### 推奨: Railway環境変数を使用する場合

```env
APP_KEY=base64:vhxfhMyn4y2hjl6dwCRwYKi3URPJJW9t7ku0jDUVx7g=
APP_ENV=production
APP_DEBUG=false
APP_URL=https://${RAILWAY_PUBLIC_DOMAIN}  # ← Railwayが自動提供（利用可能な場合）

DB_CONNECTION=mysql
DB_HOST=${MYSQLHOST}  # Railwayが自動提供
DB_PORT=${MYSQLPORT}  # Railwayが自動提供
DB_DATABASE=${MYSQLDATABASE}  # Railwayが自動提供
DB_USERNAME=${MYSQLUSER}  # Railwayが自動提供
DB_PASSWORD=${MYSQLPASSWORD}  # Railwayが自動提供

JWT_SECRET=7f1Yh5rY79LPox3RDhtmCJoE4wDloAHZeKMftrCJnoxxNBeQawZSwCWYQAE1qm39
```

**注意:** Railwayの環境変数名（`MYSQLHOST`など）が自動提供される場合、これらを直接使用できる場合と、Laravelの標準的な名前（`DB_HOST`など）にマッピングする必要がある場合があります。Railwayダッシュボードの「Variables」タブで確認してください。

---

## 🔄 デプロイ後の確認と更新手順

### 1. デプロイ完了を確認

Railwayダッシュボードでデプロイのステータスが「Success」になるのを確認します。

### 2. パブリックURLを確認

**方法1: Settings → Domains**
- サービスの「Settings」タブを開く
- 「Domains」セクションでURLを確認
- 例: `https://guide-helper-production.up.railway.app`

**方法2: Deployments → Logs**
- 「Deployments」タブを開く
- 最新のデプロイを選択
- ログにURLが表示されることがあります

### 3. APP_URL環境変数を更新

1. 「Variables」タブを開く
2. `APP_URL`を探す（または新規追加）
3. 値を実際のURLに更新:
   ```
   https://guide-helper-production.up.railway.app
   ```
4. 「Save」または「Update」をクリック

### 4. 再デプロイ（自動または手動）

- Railwayは通常、環境変数の変更を検出して自動的に再デプロイします
- 自動再デプロイされない場合は、「Deploy」ボタンを手動でクリック

---

## ⚠️ 重要な注意事項

### APP_URLの影響範囲

`APP_URL`は以下の機能で使用されます：

1. **URL生成**: `url()`ヘルパー関数、`route()`ヘルパー関数など
2. **メール送信**: メール内のリンクのベースURL
3. **アセット**: 静的ファイルのURL生成
4. **リダイレクト**: アプリケーション内のリダイレクト

### デプロイ前後の対応

- **デプロイ前**: 一時的な値を設定しても問題ありませんが、**必ず**デプロイ後に実際のURLに更新してください
- **デプロイ後**: できるだけ早く実際のURLに更新してください（再デプロイが必要になります）
- **カスタムドメイン**: カスタムドメインを設定する場合は、そのドメインを`APP_URL`として使用してください

---

## 🔧 トラブルシューティング

### 問題: デプロイ後にAPP_URLが正しく設定されていない

**解決方法:**
1. Railwayダッシュボードで正しいURLを確認
2. 環境変数`APP_URL`を実際のURLに更新
3. 再デプロイを実行

### 問題: Railwayの自動環境変数が使えない

**解決方法:**
- 一時的なプレースホルダーを設定してデプロイ
- デプロイ後に実際のURLを確認して環境変数を更新

### 問題: 環境変数を更新しても反映されない

**解決方法:**
- 環境変数の保存を確認
- 手動で再デプロイを実行
- Laravelの設定キャッシュをクリア（デプロイコマンドに追加）:
  ```bash
  php artisan config:clear
  ```

---

## 📝 チェックリスト

初回デプロイ時の`APP_URL`設定チェックリスト：

- [ ] デプロイ前に一時的な`APP_URL`を設定（または空欄にしておく）
- [ ] その他の必須環境変数（`APP_KEY`, `JWT_SECRET`, データベース接続情報）を設定
- [ ] デプロイを実行
- [ ] デプロイ完了後、Railwayダッシュボードで実際のURLを確認
- [ ] 環境変数`APP_URL`を実際のURLに更新
- [ ] 再デプロイを実行（または自動再デプロイを待つ）
- [ ] アプリケーションが正常に動作することを確認

