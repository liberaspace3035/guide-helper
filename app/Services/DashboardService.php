<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Announcement;
use App\Models\Request;
use App\Models\Matching;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    protected $announcementService;

    public function __construct(AnnouncementService $announcementService)
    {
        $this->announcementService = $announcementService;
    }

    public function getDashboardData(User $user): array
    {
        $data = [
            'notifications' => $this->getUnreadNotifications($user->id, 5),
            'announcements' => $this->announcementService->getUnreadAnnouncements($user->id, $user->role),
        ];

        if ($user->role === 'user') {
            $data['stats'] = $this->getUserStats($user->id);
            $data['matchings'] = $this->getUserActiveMatchings($user->id);
            $data['pendingReports'] = $this->getUserPendingReports($user->id);
            $data['usageStats'] = $this->getUserUsageStats($user->id);
        } elseif ($user->role === 'guide') {
            $data['stats'] = $this->getGuideStats($user->id);
            $data['matchings'] = $this->getGuideActiveMatchings($user->id);
            $data['revisionRequestedReports'] = $this->getGuideRevisionRequestedReports($user->id);
            $data['usageStats'] = $this->getGuideUsageStats($user->id);
        }

        return $data;
    }

    protected function getUnreadNotifications(int $userId, int $limit = 5): array
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    protected function getUserStats(int $userId): array
    {
        $requests = Request::where('user_id', $userId)->count();
        $activeMatchings = Matching::where('user_id', $userId)
            ->whereIn('status', ['matched', 'in_progress'])
            ->count();
        $completedMatchings = Matching::where('user_id', $userId)
            ->where('status', 'completed')
            ->count();
        $pendingReports = Report::where('user_id', $userId)
            ->where('status', 'submitted')
            ->count();

        return [
            'requests' => $requests,
            'activeMatchings' => $activeMatchings,
            'completedMatchings' => $completedMatchings,
            'pendingReports' => $pendingReports,
        ];
    }

    protected function getGuideStats(int $guideId): array
    {
        $availableRequests = Request::where('status', 'pending')
            ->count();
        $activeMatchings = Matching::where('guide_id', $guideId)
            ->whereIn('status', ['matched', 'in_progress'])
            ->count();
        $completedMatchings = Matching::where('guide_id', $guideId)
            ->where('status', 'completed')
            ->count();
        $pendingReports = Report::where('guide_id', $guideId)
            ->whereIn('status', ['draft', 'revision_requested'])
            ->count();
        $totalReports = Report::where('guide_id', $guideId)->count();

        return [
            'availableRequests' => $availableRequests,
            'activeMatchings' => $activeMatchings,
            'completedMatchings' => $completedMatchings,
            'pendingReports' => $pendingReports,
            'totalReports' => $totalReports,
        ];
    }

    protected function getUserActiveMatchings(int $userId): array
    {
        $matchings = Matching::where('user_id', $userId)
            ->whereIn('status', ['matched', 'in_progress'])
            ->with(['guide:id,name', 'request:id,request_type,request_date,request_time,masked_address'])
            ->orderBy('matched_at', 'desc')
            ->get();
        
        // リレーションを明示的にロード
        $matchings->each(function ($matching) {
            $matching->guide;
            $matching->request;
        });
        
        return $matchings->map(function($matching) {
                return [
                    'id' => (int) $matching->id,
                    'request_type' => $matching->request->request_type ?? '',
                    'masked_address' => $matching->request->masked_address ?? '',
                    'request_date' => $matching->request->request_date ?? '',
                    'request_time' => $matching->request->request_time ?? '',
                    'guide_name' => $matching->guide->name ?? '',
                    'status' => $matching->status,
                ];
            })
            ->toArray();
    }

    protected function getGuideActiveMatchings(int $guideId): array
    {
        $matchings = Matching::where('guide_id', $guideId)
            ->whereIn('status', ['matched', 'in_progress'])
            ->with(['user:id,name', 'request:id,request_type,request_date,request_time,masked_address'])
            ->orderBy('matched_at', 'desc')
            ->get();
        
        // リレーションを明示的にロード
        $matchings->each(function ($matching) {
            $matching->user;
            $matching->request;
        });
        
        return $matchings->map(function($matching) {
                return [
                    'id' => (int) $matching->id,
                    'request_type' => $matching->request->request_type ?? '',
                    'masked_address' => $matching->request->masked_address ?? '',
                    'request_date' => $matching->request->request_date ?? '',
                    'request_time' => $matching->request->request_time ?? '',
                    'user_name' => $matching->user->name ?? '',
                    'status' => $matching->status,
                ];
            })
            ->toArray();
    }

    protected function getUserPendingReports(int $userId): array
    {
        // submitted（承認待ち）とrevision_requested（修正待ち）の両方を取得
        $reports = Report::where('user_id', $userId)
            ->whereIn('status', ['submitted', 'revision_requested'])
            ->with(['guide:id,name', 'request:id,request_type'])
            ->orderByRaw("CASE WHEN status = 'revision_requested' THEN 0 ELSE 1 END")
            ->orderBy('submitted_at', 'desc')
            ->get();
        
        // リレーションを明示的にロード
        $reports->each(function ($report) {
            $report->guide;
            $report->request;
        });
        
        return $reports->map(function($report) {
                return [
                    'id' => (int) $report->id,
                    'guide_name' => $report->guide->name ?? '',
                    'request_type' => $report->request->request_type ?? '',
                    'actual_date' => $report->actual_date,
                    'service_content' => $report->service_content ?? '',
                    'status' => $report->status,
                    'submitted_at' => $report->submitted_at,
                    'revision_notes' => $report->revision_notes ?? null,
                ];
            })
            ->toArray();
    }

    protected function getGuideRevisionRequestedReports(int $guideId): array
    {
        // revision_requested（修正依頼）ステータスの報告書を取得
        $reports = Report::where('guide_id', $guideId)
            ->where('status', 'revision_requested')
            ->with(['user:id,name', 'request:id,request_type'])
            ->orderBy('updated_at', 'desc')
            ->get();
        
        // リレーションを明示的にロード
        $reports->each(function ($report) {
            $report->user;
            $report->request;
        });
        
        return $reports->map(function($report) {
                return [
                    'id' => (int) $report->id,
                    'matching_id' => (int) $report->matching_id,
                    'user_name' => $report->user->name ?? '',
                    'request_type' => $report->request->request_type ?? '',
                    'actual_date' => $report->actual_date,
                    'status' => $report->status,
                    'revision_notes' => $report->revision_notes ?? null,
                    'updated_at' => $report->updated_at,
                ];
            })
            ->toArray();
    }

    protected function getGuideUsageStats(int $guideId): array
    {
        $now = now();
        $targetYear = $now->year;
        $targetMonth = $now->month;

        // 月ごとのガイド時間（過去12ヶ月）
        $monthlyStats = Report::where('guide_id', $guideId)
            ->whereIn('status', ['admin_approved', 'approved'])
            ->whereNotNull('actual_date')
            ->whereNotNull('actual_start_time')
            ->whereNotNull('actual_end_time')
            ->where('actual_date', '>=', now()->subMonths(12)->startOfMonth())
            ->selectRaw('DATE_FORMAT(actual_date, "%Y-%m") as month')
            ->selectRaw('SUM(TIMESTAMPDIFF(MINUTE, 
                CONCAT(actual_date, " ", actual_start_time), 
                CONCAT(actual_date, " ", actual_end_time)
            )) as total_minutes')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get()
            ->map(function($stat) {
                $totalMinutes = $stat->total_minutes ?? 0;
                return [
                    'month' => $stat->month,
                    'total_minutes' => $totalMinutes,
                    'total_hours' => round($totalMinutes / 60 * 10) / 10
                ];
            })
            ->toArray();

        // 今月の外出/自宅ガイド時間
        $currentMonthStats = Report::where('reports.guide_id', $guideId)
            ->whereIn('reports.status', ['admin_approved', 'approved'])
            ->whereNotNull('reports.actual_date')
            ->whereNotNull('reports.actual_start_time')
            ->whereNotNull('reports.actual_end_time')
            ->whereYear('reports.actual_date', $targetYear)
            ->whereMonth('reports.actual_date', $targetMonth)
            ->join('requests', 'reports.request_id', '=', 'requests.id')
            ->selectRaw('requests.request_type')
            ->selectRaw('SUM(TIMESTAMPDIFF(MINUTE, 
                CONCAT(reports.actual_date, " ", reports.actual_start_time), 
                CONCAT(reports.actual_date, " ", reports.actual_end_time)
            )) as total_minutes')
            ->groupBy('requests.request_type')
            ->get();

        // 今月の総ガイド時間
        $currentMonthTotal = Report::where('guide_id', $guideId)
            ->whereIn('status', ['admin_approved', 'approved'])
            ->whereNotNull('actual_date')
            ->whereNotNull('actual_start_time')
            ->whereNotNull('actual_end_time')
            ->whereYear('actual_date', $targetYear)
            ->whereMonth('actual_date', $targetMonth)
            ->selectRaw('SUM(TIMESTAMPDIFF(MINUTE, 
                CONCAT(actual_date, " ", actual_start_time), 
                CONCAT(actual_date, " ", actual_end_time)
            )) as total_minutes')
            ->first();

        $typeStats = [
            '外出' => 0,
            '自宅' => 0
        ];

        foreach ($currentMonthStats as $stat) {
            $requestType = $stat->request_type;
            if ($requestType === 'outing') {
                $typeStats['外出'] = round($stat->total_minutes / 60 * 10) / 10;
            } elseif ($requestType === 'home') {
                $typeStats['自宅'] = round($stat->total_minutes / 60 * 10) / 10;
            }
        }

        $totalMinutes = $currentMonthTotal->total_minutes ?? 0;

        return [
            'monthly' => $monthlyStats,
            'current_month' => [
                'total_minutes' => $totalMinutes,
                'total_hours' => round($totalMinutes / 60 * 10) / 10,
                'by_type' => $typeStats
            ]
        ];
    }

    protected function getUserUsageStats(int $userId): array
    {
        $now = now();
        $targetYear = $now->year;
        $targetMonth = $now->month;

        // 月ごとの利用時間（過去12ヶ月）
        $monthlyStats = Report::where('reports.user_id', $userId)
            ->whereIn('reports.status', ['admin_approved', 'approved'])
            ->whereNotNull('reports.actual_date')
            ->whereNotNull('reports.actual_start_time')
            ->whereNotNull('reports.actual_end_time')
            ->where('reports.actual_date', '>=', now()->subMonths(12)->startOfMonth())
            ->join('requests', 'reports.request_id', '=', 'requests.id')
            ->selectRaw('DATE_FORMAT(reports.actual_date, "%Y-%m") as month')
            ->selectRaw('SUM(TIMESTAMPDIFF(MINUTE, 
                CONCAT(reports.actual_date, " ", reports.actual_start_time), 
                CONCAT(reports.actual_date, " ", reports.actual_end_time)
            )) as total_minutes')
            ->selectRaw('GROUP_CONCAT(DISTINCT requests.request_type) as request_types')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get()
            ->map(function($stat) use ($userId, $targetYear, $targetMonth) {
                $month = $stat->month;
                [$year, $monthNum] = explode('-', $month);
                
                // 月別の種別別時間を取得
                $typeStats = Report::where('reports.user_id', $userId)
                    ->whereIn('reports.status', ['admin_approved', 'approved'])
                    ->whereNotNull('reports.actual_date')
                    ->whereNotNull('reports.actual_start_time')
                    ->whereNotNull('reports.actual_end_time')
                    ->whereYear('reports.actual_date', $year)
                    ->whereMonth('reports.actual_date', $monthNum)
                    ->join('requests', 'reports.request_id', '=', 'requests.id')
                    ->selectRaw('requests.request_type')
                    ->selectRaw('SUM(TIMESTAMPDIFF(MINUTE, 
                        CONCAT(reports.actual_date, " ", reports.actual_start_time), 
                        CONCAT(reports.actual_date, " ", reports.actual_end_time)
                    )) as total_minutes')
                    ->groupBy('requests.request_type')
                    ->get()
                    ->mapWithKeys(function($t) {
                        return [$t->request_type => round($t->total_minutes / 60 * 10) / 10];
                    })
                    ->toArray();

                $totalMinutes = $stat->total_minutes ?? 0;
                return [
                    'month' => $month,
                    'total_minutes' => $totalMinutes,
                    'total_hours' => round($totalMinutes / 60 * 10) / 10,
                    'by_type' => [
                        '外出' => $typeStats['outing'] ?? 0,
                        '自宅' => $typeStats['home'] ?? 0
                    ]
                ];
            })
            ->toArray();

        // 今月の外出/自宅利用時間
        $currentMonthStats = Report::where('reports.user_id', $userId)
            ->whereIn('reports.status', ['admin_approved', 'approved'])
            ->whereNotNull('reports.actual_date')
            ->whereNotNull('reports.actual_start_time')
            ->whereNotNull('reports.actual_end_time')
            ->whereYear('reports.actual_date', $targetYear)
            ->whereMonth('reports.actual_date', $targetMonth)
            ->join('requests', 'reports.request_id', '=', 'requests.id')
            ->selectRaw('requests.request_type')
            ->selectRaw('SUM(TIMESTAMPDIFF(MINUTE, 
                CONCAT(reports.actual_date, " ", reports.actual_start_time), 
                CONCAT(reports.actual_date, " ", reports.actual_end_time)
            )) as total_minutes')
            ->groupBy('requests.request_type')
            ->get();

        // 今月の総利用時間
        $currentMonthTotal = Report::where('user_id', $userId)
            ->whereIn('status', ['admin_approved', 'approved'])
            ->whereNotNull('actual_date')
            ->whereNotNull('actual_start_time')
            ->whereNotNull('actual_end_time')
            ->whereYear('actual_date', $targetYear)
            ->whereMonth('actual_date', $targetMonth)
            ->selectRaw('SUM(TIMESTAMPDIFF(MINUTE, 
                CONCAT(actual_date, " ", actual_start_time), 
                CONCAT(actual_date, " ", actual_end_time)
            )) as total_minutes')
            ->first();

        $typeStats = [
            '外出' => 0,
            '自宅' => 0
        ];

        foreach ($currentMonthStats as $stat) {
            $requestType = $stat->request_type;
            if ($requestType === 'outing') {
                $typeStats['外出'] = round($stat->total_minutes / 60 * 10) / 10;
            } elseif ($requestType === 'home') {
                $typeStats['自宅'] = round($stat->total_minutes / 60 * 10) / 10;
            }
        }

        $totalMinutes = $currentMonthTotal->total_minutes ?? 0;

        return [
            'monthly' => $monthlyStats,
            'current_month' => [
                'total_minutes' => $totalMinutes,
                'total_hours' => round($totalMinutes / 60 * 10) / 10,
                'by_type' => $typeStats
            ]
        ];
    }
}


