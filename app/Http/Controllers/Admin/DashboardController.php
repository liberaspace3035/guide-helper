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

    public function index()
    {
        $user = Auth::user();
        
        // セッション認証でログインしている場合、JWTトークンを生成
        $token = null;
        if ($user) {
            try {
                $token = JWTAuth::fromUser($user);
            } catch (\Exception $e) {
                \Log::error('JWTトークン生成エラー: ' . $e->getMessage());
            }
        }
        
        $dashboardData = $this->adminService->getDashboardData();
        $dashboardData['jwt_token'] = $token;
        
        return view('admin.dashboard', $dashboardData);
    }
}
