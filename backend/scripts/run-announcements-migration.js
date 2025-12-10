// お知らせ機能のマイグレーション実行スクリプト
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config();

async function runMigration() {
  let pool;
  
  try {
    // データベース接続プールを作成
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'guide_matching_db',
      waitForConnections: true,
      connectionLimit: 10
    });

    console.log('データベースに接続しました...');

    // マイグレーションファイルを読み込む
    const migrationPath = path.join(__dirname, '../../database/migration_add_announcements.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // SQLステートメントを分割（セミコロンで区切る）
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n${statements.length}個のSQLステートメントを実行します...\n`);

    // 各ステートメントを実行
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // コメント行をスキップ
      if (statement.startsWith('--')) {
        continue;
      }

      try {
        await pool.execute(statement + ';');
        console.log(`✓ [${i + 1}/${statements.length}] 実行成功`);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠ [${i + 1}/${statements.length}] テーブルは既に存在します`);
        } else {
          console.error(`✗ [${i + 1}/${statements.length}] エラー:`, err.message);
          throw err;
        }
      }
    }

    console.log('\n✅ マイグレーションが正常に完了しました！');
    
  } catch (error) {
    console.error('\n❌ マイグレーション実行中にエラーが発生しました:');
    console.error(error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('\nデータベース接続を閉じました');
    }
  }
}

// スクリプトを実行
runMigration();
