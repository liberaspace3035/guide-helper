-- お知らせ機能の追加
-- お知らせテーブル
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT 'お知らせタイトル',
    content TEXT NOT NULL COMMENT 'お知らせ本文',
    target_audience ENUM('user', 'guide', 'all') NOT NULL COMMENT '対象者（ユーザー向け、ガイド向け、全体向け）',
    created_by INT NOT NULL COMMENT '作成者（管理者ID）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_target_audience (target_audience),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- お知らせ既読管理テーブル
CREATE TABLE IF NOT EXISTS announcement_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    announcement_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_announcement_read (announcement_id, user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_announcement_id (announcement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
