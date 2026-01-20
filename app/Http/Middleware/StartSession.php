<?php

namespace App\Http\Middleware;

use Illuminate\Session\Middleware\StartSession as Middleware;
use Illuminate\Session\SessionManager;

class StartSession extends Middleware
{
    /**
     * Get the session configuration to use.
     *
     * @return array
     */
    protected function getSessionConfig()
    {
        $config = parent::getSessionConfig();
        
        // HTTPS環境を自動検出してセッションクッキーをSecureに設定
        if (empty($config['secure'])) {
            $isSecure = $this->detectHttps();
            
            if ($isSecure) {
                $config['secure'] = true;
                // セッションマネージャーの設定も更新
                $this->manager->getSessionConfig()['secure'] = true;
            }
        }
        
        return $config;
    }
    
    /**
     * HTTPS環境を検出
     *
     * @return bool
     */
    protected function detectHttps(): bool
    {
        // リクエストがHTTPSか確認
        if (isset($this->request) && method_exists($this->request, 'isSecure')) {
            if ($this->request->isSecure()) {
                return true;
            }
            
            // X-Forwarded-Protoヘッダーを確認（Railwayなどのプロキシ環境）
            if ($this->request->header('X-Forwarded-Proto') === 'https') {
                return true;
            }
        }
        
        // サーバー変数からも確認
        if ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
            (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')) {
            return true;
        }
        
        // 本番環境の場合はHTTPSと仮定
        if (app()->environment('production')) {
            return true;
        }
        
        return false;
    }
}

