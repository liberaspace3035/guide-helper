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
                    // JWT_SECRETが設定されているか確認（複数の方法でチェック）
                    $jwtSecret = config('jwt.secret');
                    $jwtSecretEnv = env('JWT_SECRET');
                    $jwtSecretGetEnv = getenv('JWT_SECRET');
                    
                    \Log::debug('JWT_SECRET確認（ダッシュボード）', [
                        'config_jwt_secret' => $jwtSecret ? '設定済み（長さ: ' . strlen($jwtSecret) . '）' : '未設定',
                        'env_jwt_secret' => $jwtSecretEnv ? '設定済み（長さ: ' . strlen($jwtSecretEnv) . '）' : '未設定',
                        'getenv_jwt_secret' => $jwtSecretGetEnv ? '設定済み（長さ: ' . strlen($jwtSecretGetEnv) . '）' : '未設定',
                    ]);
                    
                    // 優先順位: env() > getenv() > config()
                    $finalJwtSecret = $jwtSecretEnv ?: ($jwtSecretGetEnv ?: $jwtSecret);
                    
                    if (empty($finalJwtSecret)) {
                        throw new \Exception('JWT_SECRETが設定されていません。環境変数を確認してください。config: ' . ($jwtSecret ? 'OK' : 'NG') . ', env: ' . ($jwtSecretEnv ? 'OK' : 'NG') . ', getenv: ' . ($jwtSecretGetEnv ? 'OK' : 'NG'));
                    }
                    
                    // config()が空の場合は、直接設定（JWTAuthは自動的にconfig()から読み込む）
                    if (empty($jwtSecret)) {
                        config(['jwt.secret' => $finalJwtSecret]);
                        \Log::info('JWT_SECRETをconfig()に設定しました（ダッシュボード）');
                    }
                    
                    $token = JWTAuth::fromUser($user);
                    
                    if (empty($token)) {
                        throw new \Exception('JWTトークンの生成に失敗しました（nullが返されました）。');
                    }
                    
                    // 生成したトークンをセッションに保存
                    $request->session()->put('jwt_token', $token);
                    \Log::info('JWTトークンを新規生成してセッションに保存しました', [
                        'user_id' => $user->id,
                        'token_length' => strlen($token)
                    ]);
                } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
                    \Log::error('JWTトークン生成エラー (JWTException): ' . $e->getMessage(), [
                        'user_id' => $user->id,
                        'exception_class' => get_class($e),
                        'trace' => $e->getTraceAsString()
                    ]);
                    $tokenError = 'JWTトークンの生成に失敗しました: ' . $e->getMessage();
                } catch (\Exception $e) {
                    \Log::error('JWTトークン生成エラー: ' . $e->getMessage(), [
                        'user_id' => $user->id ?? null,
                        'exception_class' => get_class($e),
                        'trace' => $e->getTraceAsString()
                    ]);
                    $tokenError = 'JWTトークンの生成に失敗しました: ' . $e->getMessage();
                }
            } else {
                \Log::debug('セッションからJWTトークンを取得しました', [
                    'user_id' => $user->id,
                    'token_length' => strlen($token)
                ]);
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
