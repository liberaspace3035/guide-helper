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
        
        if (!$user) {
            \Log::warning('管理者ダッシュボード: 認証されていないユーザーがアクセスしました');
            return redirect()->route('login');
        }
        
        $dashboardData = $this->adminService->getDashboardData();
        
        return view('admin.dashboard', $dashboardData);
    }
}
