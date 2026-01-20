# MySQL 9.4でPHP 8.4から接続する方法

## 🎯 目的

MySQL 9.4を使用し、PHP 8.4のアプリケーションから接続できるようにします。`caching_sha2_password`認証に対応する必要があります。

## 🔴 現在の問題

```
SQLSTATE[HY000] [2054] The server requested authentication method unknown to the client [caching_sha2_password]
```

## ✅ 解決方法

### PHP 8.4は`caching_sha2_password`をサポート

PHP 8.4とPDO MySQL拡張は`caching_sha2_password`をサポートしています。問題は設定にある可能性があります。

### 確認事項

1. **環境変数の確認**: `DB_HOST`、`DB_PASSWORD`などが正しく設定されているか
2. **接続方法**: Railwayの内部ネットワーク（`mysql.railway.internal`）を使用しているか
3. **SSL設定**: 必要に応じてSSL接続の設定を確認

### 環境変数の確認

Railwayで以下の環境変数が正しく設定されているか確認：

```env
DB_CONNECTION=mysql
DB_HOST=mysql.railway.internal  # 内部ネットワークを使用
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=[正しいパスワード]
```

**重要**: `DB_HOST`は`mysql.railway.internal`（内部ネットワーク）を使用してください。これは`shortline.proxy.rlwy.net`（外部ネットワーク）より信頼性が高いです。

### 接続テスト

アプリケーションが起動している場合、ログでデータベース接続エラーの詳細を確認してください。

---

## 📚 参考情報

- PHP 8.4のPDO MySQL拡張は`caching_sha2_password`をサポートしています
- Railwayの内部ネットワーク（`mysql.railway.internal`）を使用することで、接続がより安定します
- MySQL 9.4は`mysql_native_password`プラグインをデフォルトで無効にしています

---

## 🔧 トラブルシューティング

### エラーが続く場合

1. **環境変数を確認**: `DB_HOST`が`mysql.railway.internal`になっているか
2. **パスワードを確認**: `DB_PASSWORD`が正しいか
3. **アプリケーションを再起動**: 環境変数の変更後、アプリケーションを再起動

### PHP拡張の確認

RailwayではPHPの拡張を直接確認できませんが、ログでエラーメッセージの詳細を確認できます。

---

## ⚠️ 注意事項

- MySQL 9.4では`mysql_native_password`は使用できません
- PHP 8.4は`caching_sha2_password`をサポートしていますが、設定が正しい必要があります
- Railwayの内部ネットワーク（`mysql.railway.internal`）を使用することを推奨します

