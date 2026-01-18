<?php

namespace App\Services;

use App\Models\ChatMessage;
use App\Models\Matching;
use App\Models\Report;
use Illuminate\Support\Facades\Auth;

class ChatService
{
    public function sendMessage(int $matchingId, string $message, int $senderId): ChatMessage
    {
        // マッチングの存在確認と権限チェック
        $matching = Matching::findOrFail($matchingId);
        
        if ($matching->user_id !== $senderId && $matching->guide_id !== $senderId) {
            throw new \Exception('このマッチングのチャットにアクセスする権限がありません');
        }

        // チャット利用期間のチェック（マッチング成立～報告書完了まで）
        $this->checkChatAvailability($matching);

        // メッセージ保存
        return ChatMessage::create([
            'matching_id' => $matchingId,
            'sender_id' => $senderId,
            'message' => $message,
        ]);
    }

    public function getMessages(int $matchingId, int $userId): array
    {
        // マッチングの存在確認と権限チェック
        $matching = Matching::findOrFail($matchingId);
        
        if ($matching->user_id !== $userId && $matching->guide_id !== $userId) {
            throw new \Exception('このマッチングのチャットにアクセスする権限がありません');
        }

        // チャット利用期間のチェック（マッチング成立～報告書完了まで）
        // メッセージ取得時は警告のみ（過去のメッセージは閲覧可能）
        try {
            $this->checkChatAvailability($matching);
        } catch (\Exception $e) {
            // 期間外でも過去のメッセージは閲覧可能
        }

        // メッセージ取得
        $messages = ChatMessage::where('matching_id', $matchingId)
            ->with('sender:id,name,role')
            ->orderBy('created_at', 'asc')
            ->get();
        
        // リレーションを明示的にロード
        $messages->each(function ($message) {
            $message->sender;
        });
        
        return $messages->map(function ($message) {
                return [
                    'id' => (int) $message->id,
                    'matching_id' => (int) $message->matching_id,
                    'sender_id' => (int) $message->sender_id,
                    'sender_name' => $message->sender->name ?? '',
                    'sender_role' => $message->sender->role ?? '',
                    'message' => $message->message,
                    'created_at' => $message->created_at,
                ];
            })
            ->toArray();
    }

    /**
     * チャット利用期間のチェック（マッチング成立～報告書完了まで）
     */
    protected function checkChatAvailability(Matching $matching): void
    {
        // マッチングが成立していない場合はチャット不可
        if ($matching->status === 'cancelled') {
            throw new \Exception('このマッチングはキャンセルされています。チャットは利用できません。');
        }

        // 報告書が完了（管理者承認済み）している場合はチャット不可
        $report = Report::where('matching_id', $matching->id)
            ->whereIn('status', ['admin_approved', 'approved'])
            ->first();

        if ($report) {
            // report_completed_atを更新
            if (!$matching->report_completed_at) {
                $matching->update(['report_completed_at' => now()]);
            }
            throw new \Exception('報告書が承認済みのため、チャットは利用できません。');
        }
    }

    public function getUnreadCount(int $userId): int
    {
        // ユーザーが参加しているマッチングを取得
        $matchingIds = Matching::where('user_id', $userId)
            ->orWhere('guide_id', $userId)
            ->pluck('id')
            ->toArray();

        if (empty($matchingIds)) {
            return 0;
        }

        // 未読メッセージ数を取得（簡易版：最後に確認した時刻以降のメッセージ数）
        // 実際の実装では、read_atテーブルなどで管理
        return ChatMessage::whereIn('matching_id', $matchingIds)
            ->where('sender_id', '!=', $userId)
            ->count();
    }
}



