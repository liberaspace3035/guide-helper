<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Services\ChatService;

class ChatController extends Controller
{
    protected $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    public function show($matchingId)
    {
        try {
            $user = Auth::user();
            
            // セッション認証でログインしている場合、JWTトークンを生成
            $jwtToken = null;
            if ($user) {
                try {
                    $jwtToken = \Tymon\JWTAuth\Facades\JWTAuth::fromUser($user);
                } catch (\Exception $e) {
                    \Log::error('JWTトークン生成エラー: ' . $e->getMessage());
                }
            }
            
            $messages = $this->chatService->getMessages($matchingId, Auth::id());
            return view('chat.show', [
                'matchingId' => $matchingId,
                'messages' => $messages,
                'jwt_token' => $jwtToken,
            ]);
        } catch (\Exception $e) {
            return redirect()->route('dashboard')
                ->with('error', $e->getMessage());
        }
    }
}

