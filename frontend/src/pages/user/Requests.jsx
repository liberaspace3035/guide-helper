// 依頼一覧ページ（ユーザー）
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Requests.css';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicantsMap, setApplicantsMap] = useState({});
  const [applicantsLoading, setApplicantsLoading] = useState({});
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [selectedGuideMap, setSelectedGuideMap] = useState({});
  const [selecting, setSelecting] = useState({});
  const [matchedGuideMap, setMatchedGuideMap] = useState({});
  const [selectMessageMap, setSelectMessageMap] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/requests/my-requests');
      setRequests(response.data.requests);
      // 既にマッチしているガイド情報を取得
  const getGenderLabel = (gender) => {
    const map = {
      male: '男性',
      female: '女性',
      other: 'その他',
      prefer_not_to_say: '回答しない'
    };
    return map[gender] || '—';
  };

      fetchMatchedGuides();
    } catch (err) {
      setError('依頼一覧の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchedGuides = async () => {
    try {
      const res = await axios.get('/requests/matched-guides/all');
      const matched = {};
      const selected = {};
      (res.data.matched || []).forEach(row => {
        if (row.matching_id) {
          matched[row.request_id] = { matching_id: row.matching_id, guide_id: row.guide_id };
          selected[row.request_id] = row.guide_id;
        }
      });
      setMatchedGuideMap(matched);
      setSelectedGuideMap(prev => ({ ...selected, ...prev }));
    } catch (err) {
      console.error('マッチ済みガイド取得エラー:', err);
    }
  };

  const fetchApplicants = async (requestId) => {
    // 既に取得済みなら再取得しない
    if (applicantsMap[requestId]) {
      setExpandedRequestId(expandedRequestId === requestId ? null : requestId);
      return;
    }

    setApplicantsLoading(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await axios.get(`/requests/${requestId}/applicants`);
      const guides = res.data.guides || [];
      setApplicantsMap(prev => ({ ...prev, [requestId]: guides }));
      setExpandedRequestId(requestId);
      console.log('応募ガイド:', guides);

      // もし既にマッチ条件を満たすガイドがいればチャット導線用にセット
      const matched = guides.find(
        g => g.status === 'matched' && g.admin_decision === 'approved' && g.user_selected
      );
      if (matched && matched.matching_id) {
        setMatchedGuideMap(prev => ({
          ...prev,
          [requestId]: { matching_id: matched.matching_id, guide_id: matched.guide_id }
        }));
        setSelectedGuideMap(prev => ({ ...prev, [requestId]: matched.guide_id }));
      }
    } catch (err) {
      console.error('応募ガイド取得エラー:', err);
      setApplicantsMap(prev => ({ ...prev, [requestId]: { error: '応募ガイドの取得に失敗しました' } }));
    } finally {
      setApplicantsLoading(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleSelectGuide = async (requestId, guideId) => {
    if (!guideId) return;
    if (selecting[requestId]) return;
    setSelecting(prev => ({ ...prev, [requestId]: true }));
    try {
      const res = await axios.post(`/requests/${requestId}/select-guide`, { guide_id: guideId });
      setSelectedGuideMap(prev => ({ ...prev, [requestId]: guideId }));
      // メッセージ切替（auto-matching か審査待ちの区別はレスポンスや設定に応じて）
      const msg = res.data?.auto_matching
        ? 'ガイドに選択されたことが通知されました。詳細な連絡はチャットでお願いします。'
        : '管理者が審査しています。完了までお待ちください。';
      setSelectMessageMap(prev => ({ ...prev, [requestId]: msg }));
    } catch (err) {
      console.error('ガイド選択エラー:', err);
      alert('ガイドの選択に失敗しました');
    } finally {
      setSelecting(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: '応募待ち',
      guide_accepted: 'ガイド応募済み',
      matched: '依頼確定',
      in_progress: '進行中',
      completed: '完了',
      cancelled: 'キャンセル'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      pending: 'status-pending',
      guide_accepted: 'status-accepted',
      matched: 'status-matched',
      in_progress: 'status-in-progress',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return classMap[status] || '';
  };


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="requests-container">
      <div className="page-header">
        <h1>依頼一覧</h1>
        <Link to="/requests/new" className="btn-primary-icon">
          新しい依頼を作成
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>依頼がありません</p>
          <Link to="/requests/new" className="btn-primary">
            最初の依頼を作成
          </Link>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.request_type}</h3>
                <span className={`status-badge ${getStatusClass(request.status)}`}>
                  {getStatusLabel(request.status)}
                </span>
              </div>
              <div className="request-details">
                <p><strong>場所:</strong> {request.masked_address}</p>
                <p><strong>日時:</strong> {request.request_date} {request.request_time}</p>
                <p><strong>内容:</strong> {request.service_content}</p>
                <p><strong>作成日:</strong> {new Date(request.created_at).toLocaleString('ja-JP')}</p>
              </div>
              <div className="request-actions">
                {matchedGuideMap[request.id]?.matching_id ? (
                  <Link
                    to={`/chat/${matchedGuideMap[request.id].matching_id}`}
                    className="btn-primary btn-with-icon"
                    aria-label="チャットを開く"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>チャットを開く</span>
                  </Link>
                ) : (
                  <>
                    {request.status === 'guide_accepted' && (
                      <p className="info-text" style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        ガイドが応募しました。管理者の承認を待っています。
                      </p>
                    )}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => fetchApplicants(request.id)}
                    >
                      応募ガイドを表示
                    </button>
                    {selectMessageMap[request.id] && (
                      <p className="info-text" style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                        {selectMessageMap[request.id]}
                      </p>
                    )}
                  </>
                )}
              </div>

              {expandedRequestId === request.id && (
                <div className="applicants-panel">
                  {applicantsLoading[request.id] && (
                    <div className="loading-inline">
                      <div className="loading-spinner small"></div>
                      <span>応募ガイドを読み込み中...</span>
                    </div>
                  )}
                  {!applicantsLoading[request.id] && Array.isArray(applicantsMap[request.id]) && (
                    applicantsMap[request.id].length === 0 ? (
                      <p className="info-text">応募しているガイドはまだいません。</p>
                    ) : (
                      <div className="applicants-list">
                        {applicantsMap[request.id].map((guide, idx) => (

                          <div key={`${guide.guide_id}-${idx}`} className="applicant-card">
                            <div className="applicant-header">
                              <span className="applicant-name">
                                {guide.name || 'ガイド'}
                              </span>
                              {selectedGuideMap[request.id] === guide.guide_id && (
                                <span className="status-badge status-matched">選択済み</span>
                              )}
                            </div>
                            <div className="applicant-meta">
                              <span>性別: {getGenderLabel(guide.gender)}</span>
                              <span>年代: {guide.age || '—'}</span>
                              {guide.introduction && (
                                <span>自己紹介: {guide.introduction}</span>
                              )}
                            </div>
                            <div className="applicant-actions">
                              <button
                                type="button"
                                className="btn-primary btn-sm"
                                disabled={selecting[request.id]}
                                onClick={() => handleSelectGuide(request.id, guide.guide_id)}
                              >
                                {selecting[request.id] ? '選択中...' : 'このガイドを選択'}
                              </button>
                            </div>
                          </div>
                    ))}
                </div>
              )
                  )}
              {applicantsMap[request.id]?.error && (
                <p className="error-message" style={{ marginTop: '8px' }}>
                  {applicantsMap[request.id].error}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
    </div >
  );
};

export default Requests;

