// 管理者用お知らせ管理ページ
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AnnouncementManagement.css';

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all'
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/announcements/admin/all');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('お知らせ取得エラー:', error);
      alert('お知らせの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('タイトルと本文は必須です');
      return;
    }

    try {
      if (editingId) {
        // 更新
        await axios.put(`/announcements/admin/${editingId}`, formData);
        alert('お知らせを更新しました');
      } else {
        // 新規作成
        await axios.post('/announcements/admin', formData);
        alert('お知らせを作成しました');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', content: '', target_audience: 'all' });
      fetchAnnouncements();
    } catch (error) {
      console.error('お知らせ保存エラー:', error);
      alert(error.response?.data?.error || 'お知らせの保存に失敗しました');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_audience: announcement.target_audience
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('このお知らせを削除しますか？')) {
      return;
    }

    try {
      await axios.delete(`/announcements/admin/${id}`);
      alert('お知らせを削除しました');
      fetchAnnouncements();
    } catch (error) {
      console.error('お知らせ削除エラー:', error);
      alert('お知らせの削除に失敗しました');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', content: '', target_audience: 'all' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="announcement-management">
      <div className="management-header">
        <h1>お知らせ管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
          disabled={showForm}
        >
          + 新規お知らせ
        </button>
      </div>

      {showForm && (
        <div className="announcement-form-container">
          <h2>{editingId ? 'お知らせを編集' : '新規お知らせを作成'}</h2>
          <form onSubmit={handleSubmit} className="announcement-form">
            <div className="form-group">
              <label htmlFor="title">タイトル *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="お知らせのタイトルを入力"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">本文 *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows="8"
                placeholder="お知らせの本文を入力"
              />
            </div>

            <div className="form-group">
              <label htmlFor="target_audience">対象者 *</label>
              <select
                id="target_audience"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleInputChange}
                required
              >
                <option value="all">全体向け</option>
                <option value="user">ユーザー向け</option>
                <option value="guide">ガイド向け</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-secondary">
                キャンセル
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? '更新' : '作成'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="announcements-table-container">
        <table className="announcements-table">
          <thead>
            <tr>
              <th>タイトル</th>
              <th>対象者</th>
              <th>作成日時</th>
              <th>作成者</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-message">
                  お知らせがありません
                </td>
              </tr>
            ) : (
              announcements.map(announcement => (
                <tr key={announcement.id}>
                  <td className="title-cell">
                    <div className="title-content">
                      <strong>{announcement.title}</strong>
                      <span className="content-preview">
                        {announcement.content.substring(0, 50)}...
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`target-badge ${announcement.target_audience}`}>
                      {getTargetLabel(announcement.target_audience)}
                    </span>
                  </td>
                  <td>{formatDate(announcement.created_at)}</td>
                  <td>{announcement.created_by_name || '不明'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="btn-secondary btn-sm"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="btn-secondary btn-sm btn-danger"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnouncementManagement;
