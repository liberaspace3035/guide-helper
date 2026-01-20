# MySQL 9.xでの認証エラー解決方法

## 🔴 問題

MySQL 9.4を使用している場合、`mysql_native_password`プラグインがデフォルトで無効になっています。

```
ERROR 1524 (HY000): Plugin 'mysql_native_password' is not loaded
```

## 🎯 原因

MySQL 9.xでは`mysql_native_password`が非推奨となり、デフォルトでプラグインが有効になっていません。代わりに、PHP側で`caching_sha2_password`をサポートする必要があります。

## ✅ 解決方法

### PHP 8.4の場合

PHP 8.4とPDO MySQL拡張は`caching_sha2_password`をサポートしているため、通常は問題ありません。

しかし、エラーが発生する場合、以下の原因が考えられます：

1. **PDO MySQL拡張がインストールされていない**
2. **SSL設定が必要**
3. **接続オプションの設定が必要**

### 解決策1: データベース接続設定を確認

`config/database.php`の接続設定を確認してください。PHP 8.4では`caching_sha2_password`がサポートされているはずです。

### 解決策2: 環境変数を確認

Railwayで以下の環境変数が正しく設定されているか確認：

```env
DB_CONNECTION=mysql
DB_HOST=mysql.railway.internal  # または shortline.proxy.rlwy.net
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=CReOavHLNEgqinNlksxUzdciQvxlHJDE
```

### 解決策3: PHPのMySQL拡張を確認

Railwayのアプリケーションコンソールで：

```bash
php -m | grep -i mysql
php -i | grep -i mysql
```

PDO MySQL拡張が有効になっていることを確認してください。

### 解決策4: 接続をテストする

Railwayのアプリケーションコンソールで：

```bash
php artisan tinker
```

Tinker内で：

```php
DB::connection()->getPdo();
```

これでエラーメッセージの詳細が確認できます。

---

## 📋 確認事項

1. **PHPバージョン**: PHP 8.4を使用しているか確認
2. **PDO MySQL拡張**: `php -m | grep pdo_mysql`で確認
3. **環境変数**: `DB_HOST`、`DB_PASSWORD`などが正しく設定されているか確認
4. **接続先**: `mysql.railway.internal`（内部ネットワーク）を使用しているか確認

---

## 🔧 トラブルシューティング

### エラーが続く場合

1. Railwayのログを確認して、エラーの詳細を見る
2. アプリケーションのコンソールで`php artisan tinker`を実行して接続をテスト
3. データベース接続設定を確認

### 別の解決策

もしどうしても解決しない場合は、MySQLサービスのバージョンを変更することも検討できます（ただし、これは最後の手段です）。

---

## 📚 関連情報

- PHP 8.4のPDO MySQL拡張は`caching_sha2_password`をサポートしています
- MySQL 9.xでは`mysql_native_password`は非推奨です
- Railwayでは内部ネットワーク（`mysql.railway.internal`）を使用することを推奨します

