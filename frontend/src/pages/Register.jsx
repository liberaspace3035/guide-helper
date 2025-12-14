// ユーザー登録ページ
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    last_name: '',
    first_name: '',
    last_name_kana: '',
    first_name_kana: '',
    birth_date: '',
    gender: '',
    postal_code: '',
    address: '',
    phone: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上である必要があります');
      return;
    }

    setLoading(true);
    let infoMessageShown = false;

    const { confirmPassword, birth_date, ...registerData } = formData;
    
    // 氏名を結合してnameフィールドを作成（後方互換性のため）
    registerData.name = `${registerData.last_name} ${registerData.first_name}`.trim();
    
    // 生年月日から年齢を算出して送信（バックエンド互換用）
    if (birth_date) {
      const today = new Date();
      const dob = new Date(birth_date);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      registerData.age = age;
      registerData.birth_date = birth_date;
    }
    
    const result = await register(registerData);

    if (result.success) {
      showSuccess('ユーザー登録が完了しました');
      infoMessageShown = true;
      alert('今後の手続きは運営側からご連絡しますので、しばらくお待ちください。');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(result.error);
      showError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>新規登録</h1>
         {/* 審査に関する注意書き */}
         <div className="registration-notice">
            <div className="notice-icon">⚠</div>
            <div className="notice-content">
              <p className="notice-text">
                利用には審査があります。ユーザーは「利用契約書」、ガイドは「入社手続」の実施後、運営者による承認を経てご利用いただけます。
              </p>
              <p className="notice-text">
                登録後に運営からメールでご連絡いたします。
              </p>
            </div>
          </div>

        <form onSubmit={handleSubmit} aria-label="ユーザー登録フォーム">
          {error && (
            <div className="error-message" role="alert" aria-live="polite">
              {error}
            </div>
          )}
          
          {/* 基本情報と連絡先を1行に配置 */}
          <div className="form-sections-row">
            {/* 基本情報セクション */}
            <div className="form-section form-section-half">
              <h2 className="section-title">基本情報</h2>
              <div className="form-group name-group">
                <label>お名前 <span className="required">*</span></label>
                <div className="name-inputs">
                  <div className="name-input-item">
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="姓"
                      aria-required="true"
                    />
                    <label htmlFor="last_name" className="input-label">姓</label>
                  </div>
                  <div className="name-input-item">
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      placeholder="名"
                      aria-required="true"
                    />
                    <label htmlFor="first_name" className="input-label">名</label>
                  </div>
                </div>
              </div>
              <div className="form-group name-group">
                <label>お名前（カナ）</label>
                <div className="name-inputs">
                  <div className="name-input-item">
                    <input
                      type="text"
                      id="last_name_kana"
                      name="last_name_kana"
                      value={formData.last_name_kana}
                      onChange={handleChange}
                      placeholder="セイ（全角カタカナで入力）"
                      pattern="[ァ-ヶー\s]*"
                      title="全角カタカナで入力してください"
                      style={{ imeMode: 'active' }}
                    />
                    <label htmlFor="last_name_kana" className="input-label">姓（カナ）</label>
                  </div>
                  <div className="name-input-item">
                    <input
                      type="text"
                      id="first_name_kana"
                      name="first_name_kana"
                      value={formData.first_name_kana}
                      onChange={handleChange}
                      placeholder="メイ（全角カタカナで入力）"
                      pattern="[ァ-ヶー\s]*"
                      title="全角カタカナで入力してください"
                      style={{ imeMode: 'active' }}
                    />
                    <label htmlFor="first_name_kana" className="input-label">名（カナ）</label>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="birth_date">生年月日</label>
                  <input
                    type="date"
                    id="birth_date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    aria-label="生年月日"
                  />
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="gender">性別</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">選択してください</option>
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">その他</option>
                    <option value="prefer_not_to_say">回答しない</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group form-group-half">
                  <label htmlFor="postal_code">郵便番号</label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    placeholder="例: 123-4567"
                    inputMode="numeric"
                  />
                </div>
                <div className="form-group form-group-half">
                  <label htmlFor="address">住所</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    placeholder="都道府県、市区町村、番地などを入力"
                  />
                </div>
              </div>
            </div>

            {/* 連絡先とアカウント情報セクション */}
            <div className="form-section form-section-half">
              {/* 連絡先セクション */}
              <div className="form-subsection">
                <h2 className="section-title">連絡先</h2>
                <div className="form-group">
                  <label htmlFor="email">メールアドレス <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    aria-required="true"
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
                    autoComplete="tel"
                    placeholder="例: 090-1234-5678"
                  />
                </div>
              </div>

              {/* アカウント情報セクション */}
              <div className="form-subsection">
                <h2 className="section-title">アカウント情報</h2>
                <div className="form-group">
                  <label htmlFor="role">登録タイプ <span className="required">*</span></label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  >
                    <option value="user">ユーザー（視覚障害者）</option>
                    <option value="guide">ガイドヘルパー</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="password">パスワード <span className="required">*</span></label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    aria-required="true"
                  />
                  <small>6文字以上で入力してください</small>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">パスワード（確認） <span className="required">*</span></label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    aria-required="true"
                  />
                </div>
              </div>
            </div>
          </div>
          
         
          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={loading}
            aria-label="登録ボタン"
            onClick={handleSubmit}
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
        <p className="login-link">
          既にアカウントをお持ちの方は{' '}
          <Link to="/login">こちらからログイン</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

