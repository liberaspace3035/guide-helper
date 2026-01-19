<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 環境変数から管理者情報を取得（デフォルト値あり）
        $adminEmail = env('ADMIN_EMAIL', 'admin@example.com');
        $adminPassword = env('ADMIN_PASSWORD', 'admin123456');
        $adminName = env('ADMIN_NAME', '管理者');

        // 既に管理者が存在するかチェック
        $existingAdmin = User::where('email', $adminEmail)->first();

        if ($existingAdmin) {
            $this->command->info("管理者アカウント（{$adminEmail}）は既に存在しています。");
            return;
        }

        // 管理者アカウントを作成
        $admin = User::create([
            'email' => $adminEmail,
            'password_hash' => Hash::make($adminPassword),
            'name' => $adminName,
            'last_name' => '管理',
            'first_name' => '者',
            'role' => 'admin',
            'is_allowed' => true, // 管理者は承認不要
        ]);

        $this->command->info("管理者アカウントを作成しました:");
        $this->command->info("  メールアドレス: {$admin->email}");
        $this->command->info("  パスワード: {$adminPassword}");
        $this->command->info("  名前: {$admin->name}");
    }
}

