<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 既存データの変換（日本語 → 英語コード値）
        // まず一時カラムを追加してデータを変換
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests ADD COLUMN request_type_temp VARCHAR(10) NULL");
        \Illuminate\Support\Facades\DB::statement("UPDATE requests SET request_type_temp = CASE WHEN request_type = '外出' THEN 'outing' WHEN request_type = '自宅' THEN 'home' ELSE NULL END");
        
        // ENUM定義を英語コード値に変更
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests MODIFY COLUMN request_type ENUM('outing', 'home') NOT NULL COMMENT '依頼タイプ'");
        
        // 変換したデータをコピー
        \Illuminate\Support\Facades\DB::statement("UPDATE requests SET request_type = request_type_temp WHERE request_type_temp IS NOT NULL");
        
        // 一時カラムを削除
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests DROP COLUMN request_type_temp");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 既存データを英語コード値から日本語に戻す
        // まず一時カラムを追加してデータを変換
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests ADD COLUMN request_type_temp VARCHAR(10) NULL");
        \Illuminate\Support\Facades\DB::statement("UPDATE requests SET request_type_temp = CASE WHEN request_type = 'outing' THEN '外出' WHEN request_type = 'home' THEN '自宅' ELSE NULL END");
        
        // ENUM定義を日本語に戻す
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests MODIFY COLUMN request_type ENUM('外出', '自宅') NOT NULL COMMENT '依頼タイプ'");
        
        // 変換したデータをコピー
        \Illuminate\Support\Facades\DB::statement("UPDATE requests SET request_type = request_type_temp WHERE request_type_temp IS NOT NULL");
        
        // 一時カラムを削除
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE requests DROP COLUMN request_type_temp");
    }
};
