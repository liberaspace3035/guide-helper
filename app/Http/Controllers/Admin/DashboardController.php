<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Services\AdminService;

class DashboardController extends Controller
{
    protected $adminService;

    public function __construct(AdminService $adminService)
    {
        $this->adminService = $adminService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        
        // セッション認証でログインしている場合、JWTトークンを取得または生成
        $token = null;
        $tokenError = null;
        
        if ($user) {
            // まずセッションからトークンを取得を試みる（ログイン時に保存されたもの）
            $token = $request->session()->get('jwt_token');
            
            // セッションにトークンがない場合、新しく生成を試みる
            if (!$token) {
                try {
                    // JWT_SECRETが設定されているか確認
                    if (empty(config('jwt.secret'))) {
                        throw new \Exception('JWT_SECRETが設定されていません。環境変数を確認してください。');
                    }
                    
                    $token = JWTAuth::fromUser($user);
                    
                    if (empty($token)) {
                        throw new \Exception('JWTトークンの生成に失敗しました。');
                    }
                    
                    // 生成したトークンをセッションに保存
                    $request->session()->put('jwt_token', $token);
                    \Log::info('JWTトークンを新規生成してセッションに保存しました', ['user_id' => $user->id]);
                } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
                    \Log::error('JWTトークン生成エラー (JWTException): ' . $e->getMessage(), [
                        'user_id' => $user->id,
                        'trace' => $e->getTraceAsString()
                    ]);
                    $tokenError = 'JWTトークンの生成に失敗しました: ' . $e->getMessage();
                } catch (\Exception $e) {
                    \Log::error('JWTトークン生成エラー: ' . $e->getMessage(), [
                        'user_id' => $user->id ?? null,
                        'trace' => $e->getTraceAsString()
                    ]);
                    $tokenError = 'JWTトークンの生成に失敗しました: ' . $e->getMessage();
                }
            } else {
                \Log::debug('セッションからJWTトークンを取得しました', ['user_id' => $user->id]);
            }
        } else {
            \Log::warning('管理者ダッシュボード: 認証されていないユーザーがアクセスしました');
            $tokenError = 'ユーザーが認証されていません。';
        }
        
        $dashboardData = $this->adminService->getDashboardData();
        $dashboardData['jwt_token'] = $token;
        $dashboardData['jwt_token_error'] = $tokenError;
        
        return view('admin.dashboard', $dashboardData);
    }
}
