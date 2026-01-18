-- 要件定義書に基づく追加フィールドのマイグレーション（修正版）
-- MySQL 9.3.0対応

-- ============================================
-- 1. usersテーブルの拡張
-- ============================================

-- 郵便番号を追加（既存の場合はスキップ）
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'postal_code';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10) NULL COMMENT ''郵便番号'' AFTER address')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- メール確認済みフラグを追加
SET @columnname = 'email_confirmed';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE COMMENT ''メール確認済み'' AFTER email')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 2. user_profilesテーブルの拡張
-- ============================================

SET @tablename = 'user_profiles';

-- 面談希望日時（第1希望）
SET @columnname = 'interview_date_1';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATETIME NULL COMMENT ''面談希望日時（第1希望）'' AFTER introduction')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 面談希望日時（第2希望）
SET @columnname = 'interview_date_2';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATETIME NULL COMMENT ''面談希望日時（第2希望）'' AFTER interview_date_1')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 面談希望日時（第3希望）
SET @columnname = 'interview_date_3';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATETIME NULL COMMENT ''面談希望日時（第3希望）'' AFTER interview_date_2')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 応募のきっかけ
SET @columnname = 'application_reason';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL COMMENT ''応募のきっかけ'' AFTER interview_date_3')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 視覚障害の状況
SET @columnname = 'visual_disability_status';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL COMMENT ''視覚障害の状況'' AFTER application_reason')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 障害支援区分
SET @columnname = 'disability_support_level';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(10) NULL COMMENT ''障害支援区分'' AFTER visual_disability_status')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 普段の生活状況
SET @columnname = 'daily_life_situation';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL COMMENT ''普段の生活状況'' AFTER disability_support_level')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- 3. guide_profilesテーブルの拡張
-- ============================================

SET @tablename = 'guide_profiles';

-- 応募理由
SET @columnname = 'application_reason';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL COMMENT ''応募理由'' AFTER introduction')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 実現したいこと
SET @columnname = 'goal';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL COMMENT ''実現したいこと'' AFTER application_reason')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 保有資格
SET @columnname = 'qualifications';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL COMMENT ''保有資格（JSON形式）'' AFTER goal')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 希望勤務時間
SET @columnname = 'preferred_work_hours';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT NULL COMMENT ''希望勤務時間'' AFTER qualifications')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 従業員番号の一意制約追加（既存のインデックスを確認）
SET @indexname = 'idx_employee_number';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE UNIQUE INDEX ', @indexname, ' ON ', @tablename, ' (employee_number)')
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- ============================================
-- 4. requestsテーブルの拡張（指名機能）
-- ============================================

SET @tablename = 'requests';

-- 指名ガイドID
SET @columnname = 'nominated_guide_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL COMMENT ''指名ガイドID'' AFTER user_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- インデックス追加
SET @indexname = 'idx_nominated_guide_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, ' (nominated_guide_id)')
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- 外部キー制約追加（既存の制約を確認）
SET @fkname = 'fk_nominated_guide';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fkname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @fkname, ' FOREIGN KEY (nominated_guide_id) REFERENCES users(id) ON DELETE SET NULL')
));
PREPARE createFkIfNotExists FROM @preparedStatement;
EXECUTE createFkIfNotExists;
DEALLOCATE PREPARE createFkIfNotExists;

-- ============================================
-- 5. 利用者の月次限度時間管理テーブル
-- ============================================

CREATE TABLE IF NOT EXISTS user_monthly_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    limit_hours DECIMAL(5, 2) NOT NULL COMMENT '月次限度時間（時間）',
    used_hours DECIMAL(5, 2) DEFAULT 0.00 COMMENT '使用時間（時間）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_month (user_id, year, month),
    INDEX idx_user_id (user_id),
    INDEX idx_year_month (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. 管理操作ログテーブル
-- ============================================

CREATE TABLE IF NOT EXISTS admin_operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    operation_type VARCHAR(50) NOT NULL COMMENT '操作種別（user_approve, guide_approve, matching_approve等）',
    target_type VARCHAR(50) NOT NULL COMMENT '対象種別（user, guide, matching, report等）',
    target_id INT NULL COMMENT '対象ID',
    operation_details TEXT NULL COMMENT '操作詳細（JSON形式）',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. メールテンプレートテーブル
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(100) UNIQUE NOT NULL COMMENT 'テンプレートキー（request_notification, reminder等）',
    subject VARCHAR(255) NOT NULL COMMENT '件名',
    body TEXT NOT NULL COMMENT '本文',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_key (template_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初期テンプレートの挿入
INSERT INTO email_templates (template_key, subject, body) VALUES
('request_notification', '新しい依頼が届きました', '新しい依頼が届きました。詳細を確認してください。\n\n依頼ID: {{request_id}}\n依頼タイプ: {{request_type}}\n日時: {{request_date}} {{request_time}}\n場所: {{masked_address}}'),
('matching_notification', 'マッチングが成立しました', 'マッチングが成立しました。チャットで詳細を確認してください。\n\nマッチングID: {{matching_id}}\n依頼タイプ: {{request_type}}\n日時: {{request_date}} {{request_time}}'),
('report_submitted', '報告書が提出されました', '報告書が提出されました。承認または修正依頼を行ってください。\n\n報告書ID: {{report_id}}\nガイド: {{guide_name}}\n実施日: {{actual_date}}'),
('report_approved', '報告書が承認されました', '報告書が承認されました。\n\n報告書ID: {{report_id}}\n実施日: {{actual_date}}'),
('reminder_pending_request', '承認待ちの依頼があります', '承認待ちの依頼があります。確認をお願いします。\n\n依頼ID: {{request_id}}')
ON DUPLICATE KEY UPDATE subject=VALUES(subject), body=VALUES(body);

-- ============================================
-- 8. メール通知設定テーブル
-- ============================================

CREATE TABLE IF NOT EXISTS email_notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_type VARCHAR(50) UNIQUE NOT NULL COMMENT '通知種別（request, matching, report, reminder）',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '通知有効/無効',
    reminder_days INT NULL COMMENT 'リマインド日数（リマインド通知の場合）',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初期設定の挿入
INSERT INTO email_notification_settings (notification_type, is_enabled) VALUES
('request', TRUE),
('matching', TRUE),
('report', TRUE),
('reminder', TRUE)
ON DUPLICATE KEY UPDATE is_enabled=VALUES(is_enabled);

-- ============================================
-- 9. チャット利用期間制限のためのインデックス追加
-- ============================================

SET @tablename = 'matchings';

-- 報告書完了日を追加
SET @columnname = 'report_completed_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP NULL COMMENT ''報告書完了日時（チャット利用終了日）'' AFTER completed_at')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;


