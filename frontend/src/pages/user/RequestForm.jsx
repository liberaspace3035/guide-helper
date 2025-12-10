// 依頼作成フォーム（ユーザー）
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RequestForm.css';

const RequestForm = () => {
  const getDefaultDateTime = () => {
    const now = new Date();
    const toHM = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const start = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2時間後
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 開始から1時間後
    return {
      request_date: now.toISOString().split('T')[0],
      start_time: toHM(start),
      end_time: toHM(end)
    };
  };

  const defaultDateTime = getDefaultDateTime();

  const [formData, setFormData] = useState({
    request_type: '外出',
    destination_address: '',
    meeting_place: '',
    service_content: '',
    request_date: defaultDateTime.request_date,
    start_time: defaultDateTime.start_time,
    end_time: defaultDateTime.end_time,
    guide_gender: 'none',
    guide_age: 'none',
    notes: ''
  });
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // 音声認識の初期化
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ja-JP';
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setFormData(prev => ({
          ...prev,
          notes: prev.notes + finalTranscript + (interimTranscript ? ' ' + interimTranscript : '')
        }));
      };

      recognitionRef.current.onerror = (event) => {
        console.error('音声認識エラー:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } else {
      alert('お使いのブラウザは音声認識に対応していません');
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    } else {
      initSpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 時間を「X時」形式から「HH:MM」形式に変換
  const parseTimeInput = (timeStr) => {
    if (!timeStr) return '';
    // 「X時」形式を「HH:00」形式に変換
    const match = timeStr.match(/(\d+)時/);
    if (match) {
      const hour = parseInt(match[1], 10);
      if (hour >= 0 && hour <= 23) {
        return `${hour.toString().padStart(2, '0')}:00`;
      }
    }
    // 既に「HH:MM」形式の場合はそのまま返す
    if (timeStr.match(/^\d{2}:\d{2}$/)) {
      return timeStr;
    }
    return '';
  };

  // 時間を「HH:MM」形式から「X時」形式に変換（表示用）
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d{2}):(\d{2})/);
    if (match) {
      const hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      if (minute === 0) {
        return `${hour}時`;
      } else {
        return `${hour}時${minute}分`;
      }
    }
    return timeStr;
  };

  const handleTimeChange = (field, value) => {
    // 「X時」形式で入力された場合、自動的に「HH:MM」形式に変換
    const convertedTime = parseTimeInput(value);
    setFormData({
      ...formData,
      [field]: convertedTime || value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('formData:', formData);

    // 希望するガイドの必須チェック（初期値「選択しない」を不可）
    if (formData.guide_gender === 'none' || formData.guide_age === 'none') {
      setError('希望するガイドの性別と年代を選択してください');
      setLoading(false);
      return;
    }

    // バリデーション: 終了時刻が開始時刻より後であることを確認
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      setError('終了時刻は開始時刻より後である必要があります');
      setLoading(false);
      return;
    }

    // 外出依頼の場合、待ち合わせ場所が必須
    if (formData.request_type === '外出' && !formData.meeting_place) {
      setError('待ち合わせ場所を入力してください');
      setLoading(false);
      return;
    }

    try {
      // バックエンドに送信するデータを準備
      const requestData = {
        ...formData,
        // 後方互換性のため、request_timeも送信（start_timeを使用）
        request_time: formData.start_time,
        is_voice_input: isVoiceInput
      };
      
      const response = await axios.post('/requests', requestData);

      if (response.data) {
        navigate('/requests');
      }
    } catch (err) {
      setError(err.response?.data?.error || '依頼の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-form-container">
      <h1>依頼作成</h1>
      <form onSubmit={handleSubmit} className="request-form" aria-label="依頼作成フォーム">
        {error && (
          <div className="error-message full-width" role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="request_type">依頼タイプ <span className="required">*</span></label>
          <select
            id="request_type"
            name="request_type"
            value={formData.request_type}
            onChange={handleChange}
            required
            aria-required="true"
          >
            <option value="外出">外出</option>
            <option value="自宅">自宅</option>
          </select>
        </div>

        {formData.request_type === '外出' ? (
          <>
            <div className="form-group">
              <label htmlFor="destination_address">目的地 <span className="required">*</span></label>
              <input
                type="text"
                id="destination_address"
                name="destination_address"
                value={formData.destination_address}
                onChange={handleChange}
                required
                placeholder="例: 東京都渋谷区青山１－１－１"
                aria-required="true"
              />
              <small>詳細な住所を入力してください（ガイドには大まかな地域のみ表示されます）</small>
            </div>
            <div className="form-group">
              <label htmlFor="meeting_place">待ち合わせ場所 <span className="required">*</span></label>
              <input
                type="text"
                id="meeting_place"
                name="meeting_place"
                value={formData.meeting_place}
                onChange={handleChange}
                required
                placeholder="例: 渋谷駅ハチ公前"
                aria-required="true"
              />
              <small>ガイドとの待ち合わせ場所を入力してください</small>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="destination_address">場所 <span className="required">*</span></label>
              <input
                type="text"
                id="destination_address"
                name="destination_address"
                value={formData.destination_address}
                onChange={handleChange}
                required
                placeholder="例: 東京都渋谷区青山１－１－１"
                aria-required="true"
              />
              <small>詳細な住所を入力してください（ガイドには大まかな地域のみ表示されます）</small>
            </div>
            <div className="form-group">
              <label htmlFor="meeting_place">集合場所 <span className="required">*</span></label>
              <input
                type="text"
                id="meeting_place"
                name="meeting_place"
                value={formData.meeting_place}
                onChange={handleChange}
                required
                placeholder="例: 玄関前"
                aria-required="true"
              />
              <small>ガイドとの集合場所を入力してください</small>
            </div>
          </>
        )}

        <div className="form-group full-width">
          <label htmlFor="service_content">サービス内容 <span className="required">*</span></label>
          <textarea
            id="service_content"
            name="service_content"
            value={formData.service_content}
            onChange={handleChange}
            required
            rows={4}
            placeholder="『買い物』『代筆』など、具体的なサービス内容を記載してください"
            aria-required="true"
          />
        </div>

        <div className="form-group full-width">
          <h3 className="section-subtitle">希望するガイドについて <span className="required">*</span></h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guide_gender">希望するガイドの性別 <span className="required">*</span></label>
              <select
                id="guide_gender"
                name="guide_gender"
                value={formData.guide_gender}
                onChange={handleChange}
                required
                aria-required="true"
              >
                <option value="none">選択しない（どの性別でも構わない）</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="guide_age">希望するガイドの年代 <span className="required">*</span></label>
              <select
                id="guide_age"
                name="guide_age"
                value={formData.guide_age}
                onChange={handleChange}
                required
                aria-required="true"
              >
                <option value="none">選択しない（どの年代でも構わない）</option>
                <option value="20s">20代</option>
                <option value="30s">30代</option>
                <option value="40s">40代</option>
                <option value="50s">50代</option>
                <option value="60s">60代</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="request_date">希望日 <span className="required">*</span></label>
            <input
              type="date"
              id="request_date"
              name="request_date"
              value={formData.request_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_time">希望時間 <span className="required">*</span></label>
            <div className="time-input-group">
              <input
                type="text"
                id="start_time"
                name="start_time"
                value={formData.start_time ? formatTimeDisplay(formData.start_time) : ''}
                onChange={(e) => handleTimeChange('start_time', e.target.value)}
                onBlur={(e) => {
                  const converted = parseTimeInput(e.target.value);
                  if (converted) {
                    setFormData({ ...formData, start_time: converted });
                  }
                }}
                placeholder="例: 14時"
                required
                aria-required="true"
                pattern="\d+時"
                title="「X時」形式で入力してください（例: 14時）"
              />
              <span className="time-separator">～</span>
              <input
                type="text"
                id="end_time"
                name="end_time"
                value={formData.end_time ? formatTimeDisplay(formData.end_time) : ''}
                onChange={(e) => handleTimeChange('end_time', e.target.value)}
                onBlur={(e) => {
                  const converted = parseTimeInput(e.target.value);
                  if (converted) {
                    setFormData({ ...formData, end_time: converted });
                  }
                }}
                placeholder="例: 16時"
                required
                aria-required="true"
                pattern="\d+時"
                title="「X時」形式で入力してください（例: 16時）"
              />
            </div>
            <small>「X時」形式で入力してください（例: 14時～16時）</small>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes">備考・メモ</label>
          <div className="voice-input-section">
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="音声入力も利用できます"
            />
            <div className="voice-controls">
              <button
                type="button"
                onClick={startRecording}
                disabled={isRecording}
                className="btn-voice"
                aria-label="音声入力を開始"
              >
                {isRecording ? '録音中...' : '🎤 音声入力開始'}
              </button>
              {isRecording && (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="btn-voice-stop"
                  aria-label="音声入力を停止"
                >
                  停止
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions full-width">
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            aria-label="依頼を送信"
          >
            {loading ? '送信中...' : '依頼を送信'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/requests')}
            className="btn-secondary"
            aria-label="キャンセル"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;

