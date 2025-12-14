// プロフィールページ
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, isGuide, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    age: '',
    birth_date: '',
    contact_method: '',
    notes: '',
    introduction: '',
    available_areas: [],
    available_days: [],
    available_times: [],
    employee_number: '',
    recipient_number: '',
    admin_comment: ''
  });
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUsageStats();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/auth/user');
      const userData = response.data.user;

      // console.log(">>>>>", userData);
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || '',
        age: userData.age || '',
        contact_method: userData.profile?.contact_method || '',
        notes: userData.profile?.notes || '',
        introduction: userData.profile?.introduction || '',
        available_areas: userData.profile?.available_areas || [],
        available_days: userData.profile?.available_days || [],
        available_times: userData.profile?.available_times || [],
        employee_number: userData.profile?.employee_number || '',
        recipient_number: userData.profile?.recipient_number || '',
        admin_comment: userData.profile?.admin_comment || ''
      });

    } catch (error) {
      console.error('プロフィール取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      setStatsLoading(true);
      const endpoint = isGuide ? '/reports/guide-stats' : '/reports/usage-stats';
      const response = await axios.get(endpoint);
      setStats(response.data);
    } catch (error) {
      console.error('実績時間取得エラー:', error);
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, value, checked) => {
    setFormData(prev => {
      const currentArray = prev[name] || [];
      if (checked) {
        return { ...prev, [name]: [...currentArray, value] };
      } else {
        return { ...prev, [name]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (isGuide) {
        await axios.put('/users/guide-profile', {
          introduction: formData.introduction,
          available_areas: formData.available_areas,
          available_days: formData.available_days,
          available_times: formData.available_times
        });
      }
      // 管理者のみ氏名・電話・住所を送る。それ以外は連絡手段・備考・紹介のみ
      const profilePayload = {
        contact_method: formData.contact_method,
        notes: formData.notes,
        recipient_number: formData.recipient_number,
        introduction: formData.introduction
      };
      if (isAdmin) {
        profilePayload.name = formData.name;
        profilePayload.phone = formData.phone;
        profilePayload.address = formData.address;
      }
      await axios.put('/users/profile', profilePayload);
      updateUser({ name: formData.name });
      setMessage('プロフィールが更新されました');
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        (error.response?.data?.errors && Array.isArray(error.response.data.errors)
          ? error.response.data.errors.map(e => e.msg).join(', ')
          : '') ||
        'プロフィールの更新に失敗しました';
      setMessage(errorMessage);
      console.error('プロフィール更新エラー:', error.response?.data || error.message);
    } finally {
      setSaving(false);
    }
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
    <div className="profile-container">
      <h1>プロフィール編集</h1>
      <form onSubmit={handleSubmit} className="profile-form" aria-label="プロフィール編集フォーム">
        {message && (
          <div className={`message ${message.includes('失敗') ? 'error-message' : 'success-message'}`} role="alert">
            {message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">お名前 <span className="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            aria-required="true"
            readOnly={!isAdmin}
            disabled={!isAdmin}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">電話番号</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            readOnly={!isAdmin}
            disabled={!isAdmin}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">住所</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={2}
            readOnly={!isAdmin}
            disabled={!isAdmin}
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">年齢（表示のみ）</label>
          <input
            type="text"
            id="age"
            name="age"
            value={formData.age || ''}
            readOnly
            disabled
          />
        </div>

        {!isGuide && (
          <>
            <div className="form-group">
              <label htmlFor="contact_method">連絡手段</label>
              <input
                type="text"
                id="contact_method"
                name="contact_method"
                value={formData.contact_method}
                onChange={handleChange}
                placeholder="例: 電話、メール、LINE等"
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">備考</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
              />
            </div>
            {!isAdmin && <div className="form-group">
              <label>受給者証番号（閲覧のみ）</label>
              <input
                type="text"
                value={formData.recipient_number || ''}
                disabled
                aria-readonly="true"
              />
            </div>
            }

            <div className="form-group">
              <label htmlFor="introduction">自己紹介</label>
              <textarea
                id="introduction"
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                rows={4}
                placeholder="自己紹介を記入してください"
              />
            </div>

            {!isAdmin && <div className="form-group">
              <label>実績時間（報告書確定ベース・月別積算）</label>
              {statsLoading ? (
                <div className="loading-inline">
                  <div className="loading-spinner small"></div>
                  <span>読み込み中...</span>
                </div>
              ) : (
                <div className="stats-list">
                  <p><strong>今月合計:</strong> {stats?.current_month?.total_hours ?? 0} 時間</p>
                  {stats?.monthly && stats.monthly.length > 0 && (
                    <ul>
                      {stats.monthly.map(item => (
                        <li key={item.month}>
                          {item.month}: {item.total_hours} 時間
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>}
          </>
        )}

        {isGuide && (
          <>
            <div className="form-group">
              <label htmlFor="introduction">自己紹介</label>
              <textarea
                id="introduction"
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                rows={4}
                placeholder="自己紹介を記入してください"
              />
            </div>

            <div className="form-group">
              <label>対応可能エリア</label>
              <div className="checkbox-group">
                {['東京都', '大阪府', '京都府', '神奈川県', '埼玉県', '千葉県', '愛知県', 'その他'].map(area => (
                  <label key={area} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available_areas.includes(area)}
                      onChange={(e) => handleArrayChange('available_areas', area, e.target.checked)}
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>対応可能日</label>
              <div className="checkbox-group">
                {['平日', '土日', '祝日'].map(day => (
                  <label key={day} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available_days.includes(day)}
                      onChange={(e) => handleArrayChange('available_days', day, e.target.checked)}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>対応可能時間帯</label>
              <div className="checkbox-group">
                {['午前', '午後', '夜間'].map(time => (
                  <label key={time} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available_times.includes(time)}
                      onChange={(e) => handleArrayChange('available_times', time, e.target.checked)}
                    />
                    {time}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>従業員番号（閲覧のみ）</label>
              <input
                type="text"
                value={formData.employee_number || ''}
                disabled
                aria-readonly="true"
              />
            </div>
            {!isAdmin && !isGuide && <div className="form-group">
              <label>運営側からのコメント（閲覧のみ）</label>
              <textarea
                value={formData.admin_comment || ''}
                readOnly
                aria-readonly="true"
                rows={3}
              />
            </div>
            }

             <div className="form-group">
              <label>今月の実績時間（報告書確定ベース）</label>
              {statsLoading ? (
                <div className="loading-inline">
                  <div className="loading-spinner small"></div>
                  <span>読み込み中...</span>
                </div>
              ) : (
                <div className="stats-list">
                  <p><strong>今月合計:</strong> {stats?.current_month?.total_hours ?? 0} 時間</p>
                  {stats?.monthly && stats.monthly.length > 0 && (
                    <ul>
                      {stats.monthly.map(item => (
                        <li key={item.month}>
                          {item.month}: {item.total_hours} 時間
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            aria-label="プロフィールを保存"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

