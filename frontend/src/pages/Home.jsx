// トップページ（ホームページ）
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../logo.png';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="home-container">
      {/* ヒーローセクション */}
      <section className="hero-section">
        <img src={logo} alt="Logo" className="hero-logo" />
        {!isAuthenticated && (
          <Link to="/login" className="hero-login-btn">
            ログイン
          </Link>
        )}
        <div className="hero-content">
          <p className="hero-subtitle">
            <span className="hero-subtitle-line">視覚障害がある人の「一歩」と、社会が変わる「一歩」が重なり合う場所。</span>
            <br /><br />
            <span className="hero-subtitle-line">同行援護や居宅介護サービスの提供を中心に、外出・生活・仕事を、単なる「支援」ではなく、挑戦者が活躍し続けるための土台づくりとして支えるサービスです。</span>
            <br /><br />
            <span className="hero-subtitle-line">一般社団法人With Blindが運営しています。</span>
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary btn-large">
                ダッシュボードへ
              </Link>
            ) : (
              <button onClick={handleGetStarted} className="btn-primary btn-large">
                今すぐ始める
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">サービスの特徴</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">簡単マッチング</h3>
              <p className="feature-description">
                必要な情報を入力するだけで、最適なガイドヘルパーとマッチングできます。
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">リアルタイムチャット</h3>
              <p className="feature-description">
                マッチング後は、アプリ内チャットで直接コミュニケーションが取れます。
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">詳細レポート</h3>
              <p className="feature-description">
                ガイドヘルパーが活動内容をレポートとして記録し、安心して利用できます。
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">安全・安心</h3>
              <p className="feature-description">
                認証されたガイドヘルパーとマッチングし、安全にサービスを利用できます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">使い方</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3 className="step-title">アカウント登録</h3>
              <p className="step-description">
                メールアドレスと基本情報を入力してアカウントを作成します。
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3 className="step-title">リクエスト作成</h3>
              <p className="step-description">
                日時、場所、必要なサポート内容を指定してリクエストを作成します。
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3 className="step-title">マッチング</h3>
              <p className="step-description">
                ガイドヘルパーがリクエストに応募し、マッチングが成立します。
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <h3 className="step-title">活動開始</h3>
              <p className="step-description">
                チャットで詳細を確認し、当日ガイドヘルパーと活動を行います。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <h2 className="cta-title">今すぐ始めましょう</h2>
            <p className="cta-description">
              無料でアカウントを作成して、ガイドヘルパーサービスを利用できます
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn-primary btn-large">
                無料で登録
              </Link>
              <Link to="/login" className="btn-secondary btn-large">
                ログイン
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

