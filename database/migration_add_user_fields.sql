-- ユーザー登録フォーム拡張のマイグレーション
-- 氏名分割、年齢、性別、住所フィールドの追加

-- 氏名を分割するためのフィールド追加
ALTER TABLE users 
ADD COLUMN last_name VARCHAR(50) NULL COMMENT '姓' AFTER name,
ADD COLUMN first_name VARCHAR(50) NULL COMMENT '名' AFTER last_name,
ADD COLUMN last_name_kana VARCHAR(50) NULL COMMENT '姓カナ' AFTER first_name,
ADD COLUMN first_name_kana VARCHAR(50) NULL COMMENT '名カナ' AFTER last_name_kana,
ADD COLUMN age INT NULL COMMENT '年齢' AFTER first_name_kana,
ADD COLUMN gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL COMMENT '性別' AFTER age,
ADD COLUMN address TEXT NULL COMMENT '住所' AFTER gender;

-- 既存のnameフィールドのデータをlast_nameとfirst_nameに分割（既存データがある場合）
-- 注意: 既存データがある場合は手動で分割する必要があります
-- UPDATE users SET last_name = SUBSTRING_INDEX(name, ' ', 1), first_name = SUBSTRING_INDEX(name, ' ', -1) WHERE name IS NOT NULL AND last_name IS NULL;
