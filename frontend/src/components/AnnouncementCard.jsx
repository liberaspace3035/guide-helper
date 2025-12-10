// お知らせカードコンポーネント
import React from 'react';
import axios from 'axios';
import './AnnouncementCard.css';

const AnnouncementCard = ({ announcement, onRead, showReadButton = true }) => {
  const handleRead = async () => {
    try {
      await axios.post(`/announcements/${announcement.id}/read`);
      if (onRead) {
        onRead(announcement.id);
      }
    } catch (error) {
      console.error('既読登録エラー:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTargetLabel = (target) => {
    const labels = {
      'user': 'ユーザー向け',
      'guide': 'ガイド向け',
      'all': '全体向け'
    };
    return labels[target] || target;
  };

  return (
    <div className={`announcement-card ${announcement.is_read ? 'read' : 'unread'}`}>
      <div className="announcement-header">
        <div className="announcement-meta">
          <span className="announcement-date">{formatDate(announcement.created_at)}</span>
          <span className="announcement-target">{getTargetLabel(announcement.target_audience)}</span>
        </div>
        {!announcement.is_read && <span className="unread-badge">未読</span>}
      </div>
      <div className="announcement-content">
        <h3 className="announcement-title">{announcement.title}</h3>
        <p className="announcement-body">{announcement.content}</p>
      </div>
      {showReadButton && !announcement.is_read && (
        <div className="announcement-actions">
          <button onClick={handleRead} className="btn-primary btn-read">
            確認した
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;
