<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // APIルート（/api/で始まる）の場合はJWT認証を確認
        if ($request->is('api/*')) {
            try {
                // トークンの存在確認
                // 通常は Authorization ヘッダー (Bearer) から取得
                $token = $request->bearerToken();

                // window.open などでクエリ文字列 ?token=xxx で渡されるケースもサポート
                if (!$token && $request->query('token')) {
                    $token = $request->query('token');
                    // 後続のガード(auth('api'))が認識できるようにヘッダーにもセット
                    $request->headers->set('Authorization', 'Bearer '.$token);
                }

                if (!$token) {
                    \Log::warning('JWT認証エラー: トークンが提供されていません', [
                        'url' => $request->fullUrl(),
                        'headers' => $request->headers->all()
                    ]);
                    return response()->json(['error' => '認証トークンが提供されていません'], 401);
                }

                // JWT認証の確認
                if (!auth('api')->check()) {
                    \Log::warning('JWT認証エラー: 認証に失敗しました', [
                        'url' => $request->fullUrl(),
                        'token_present' => !empty($token)
                    ]);
                    return response()->json(['error' => '認証が必要です'], 401);
                }
                $user = auth('api')->user();
            } catch (\Exception $e) {
                \Log::error('JWT認証エラー: ' . $e->getMessage(), [
                    'url' => $request->fullUrl(),
                    'exception' => get_class($e)
                ]);
                return response()->json(['error' => '認証エラーが発生しました'], 401);
            }
        } else {
            // Webリクエストの場合はセッション認証を確認
            if (!auth()->check()) {
                // AJAXリクエストの場合はJSONを返す
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json(['error' => '認証が必要です'], 401);
                }
                return redirect()->route('login');
            }
            $user = auth()->user();
        }
        
        if (!in_array($user->role, $roles)) {
            if ($request->is('api/*') || $request->expectsJson() || $request->ajax()) {
                return response()->json(['error' => 'この操作を実行する権限がありません'], 403);
            }
            abort(403, 'この操作を実行する権限がありません');
        }

        return $next($request);
    }
}

