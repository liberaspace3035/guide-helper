// お知らせ一覧ページ
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AnnouncementCard from '../components/AnnouncementCard';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/announcements');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('お知らせ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = (announcementId) => {
    setAnnouncements(prev =>
      prev.map(announcement =>
        announcement.id === announcementId
          ? { ...announcement, is_read: 1, read_at: new Date().toISOString() }
          : announcement
      )
    );
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'unread') return !announcement.is_read;
    if (filter === 'read') return announcement.is_read;
    return true;
  });

  const unreadCount = announcements.filter(a => !a.is_read).length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="announcements-page">
      <div className="announcements-header">
        <div>
          <h1>運営からのお知らせ</h1>
          <p className="announcements-subtitle">過去のお知らせ一覧</p>
        </div>
        {unreadCount > 0 && (
          <div className="unread-count-badge">
            {unreadCount}件の未読
          </div>
        )}
      </div>

      <div className="announcements-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          すべて
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          未読
          {unreadCount > 0 && <span className="filter-count">{unreadCount}</span>}
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          既読
        </button>
      </div>

      <div className="announcements-list">
        {filteredAnnouncements.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <h3>
              {filter === 'unread' ? '未読のお知らせはありません' :
               filter === 'read' ? '既読のお知らせはありません' :
               'お知らせはありません'}
            </h3>
            <p>
              {filter === 'unread' ? 'すべてのお知らせを確認済みです' :
               filter === 'read' ? 'まだ読んだお知らせがありません' :
               '新しいお知らせが表示されます'}
            </p>
          </div>
        ) : (
          filteredAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onRead={handleRead}
              showReadButton={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;
