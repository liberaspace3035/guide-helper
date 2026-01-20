<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // HTTPS環境を自動検出してSESSION_SECURE_COOKIEを設定
        if (Config::get('session.secure') === null) {
            $isSecure = false;
            
            // リクエストが利用可能な場合
            if ($this->app->runningInConsole() === false) {
                $request = $this->app->make('request');
                $isSecure = $request->isSecure() || 
                           $request->header('X-Forwarded-Proto') === 'https';
            }
            
            // サーバー変数からも確認
            if (!$isSecure) {
                $isSecure = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
                           (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
            }
            
            // 本番環境の場合はHTTPSと仮定
            if (!$isSecure && $this->app->environment('production')) {
                $isSecure = true;
            }
            
            Config::set('session.secure', $isSecure);
        }
    }
}

