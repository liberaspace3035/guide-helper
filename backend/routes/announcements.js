// お知らせ関連のルート
const express = require('express');
const pool = require('../database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ユーザー向け：未読のお知らせを取得（ダッシュボード表示用）
router.get('/unread', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // ユーザーのロールに応じた対象のお知らせを取得
    // userロール: target_audience = 'user' または 'all'
    // guideロール: target_audience = 'guide' または 'all'
    // adminロール: すべて表示
    let targetCondition = '';
    if (userRole === 'user') {
      targetCondition = "AND (a.target_audience = 'user' OR a.target_audience = 'all')";
    } else if (userRole === 'guide') {
      targetCondition = "AND (a.target_audience = 'guide' OR a.target_audience = 'all')";
    } else if (userRole === 'admin') {
      targetCondition = '';
    }

    const [announcements] = await pool.execute(
      `SELECT a.*, 
              CASE WHEN ar.id IS NOT NULL THEN 1 ELSE 0 END as is_read
       FROM announcements a
       LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
       WHERE ar.id IS NULL
       ${targetCondition}
       ORDER BY a.created_at DESC`,
      [userId]
    );

    res.json({ announcements });
  } catch (error) {
    console.error('未読お知らせ取得エラー:', error);
    res.status(500).json({ error: 'お知らせの取得中にエラーが発生しました' });
  }
});

// ユーザー向け：すべてのお知らせを取得（過去のお知らせ一覧用）
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // ユーザーのロールに応じた対象のお知らせを取得
    let targetCondition = '';
    if (userRole === 'user') {
      targetCondition = "WHERE (a.target_audience = 'user' OR a.target_audience = 'all')";
    } else if (userRole === 'guide') {
      targetCondition = "WHERE (a.target_audience = 'guide' OR a.target_audience = 'all')";
    } else if (userRole === 'admin') {
      targetCondition = '';
    }

    const query = `
      SELECT a.*, 
             CASE WHEN ar.id IS NOT NULL THEN 1 ELSE 0 END as is_read,
             ar.read_at
      FROM announcements a
      LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.user_id = ?
      ${targetCondition}
      ORDER BY a.created_at DESC
    `;

    const [announcements] = await pool.execute(query, [userId]);

    res.json({ announcements });
  } catch (error) {
    console.error('お知らせ一覧取得エラー:', error);
    res.status(500).json({ error: 'お知らせ一覧の取得中にエラーが発生しました' });
  }
});

// ユーザー向け：お知らせを既読にする
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const announcementId = parseInt(req.params.id);

    // お知らせが存在し、ユーザーが対象か確認
    const [announcements] = await pool.execute(
      'SELECT * FROM announcements WHERE id = ?',
      [announcementId]
    );

    if (announcements.length === 0) {
      return res.status(404).json({ error: 'お知らせが見つかりません' });
    }

    const announcement = announcements[0];
    const userRole = req.user.role;

    // 対象者チェック
    if (userRole === 'user' && announcement.target_audience === 'guide') {
      return res.status(403).json({ error: 'このお知らせは対象外です' });
    }
    if (userRole === 'guide' && announcement.target_audience === 'user') {
      return res.status(403).json({ error: 'このお知らせは対象外です' });
    }

    // 既読レコードを追加（既に存在する場合は更新）
    await pool.execute(
      `INSERT INTO announcement_reads (announcement_id, user_id, read_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE read_at = NOW()`,
      [announcementId, userId]
    );

    res.json({ message: 'お知らせを既読にしました' });
  } catch (error) {
    console.error('既読登録エラー:', error);
    res.status(500).json({ error: '既読登録中にエラーが発生しました' });
  }
});

// 管理者向け：すべてのお知らせを取得
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const [announcements] = await pool.execute(
      `SELECT a.*, u.name as created_by_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC`
    );

    res.json({ announcements });
  } catch (error) {
    console.error('管理者お知らせ一覧取得エラー:', error);
    res.status(500).json({ error: 'お知らせ一覧の取得中にエラーが発生しました' });
  }
});

// 管理者向け：お知らせを作成
router.post('/admin', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { title, content, target_audience } = req.body;
    const created_by = req.user.id;

    // バリデーション
    if (!title || !content || !target_audience) {
      return res.status(400).json({ error: 'タイトル、本文、対象者は必須です' });
    }

    if (!['user', 'guide', 'all'].includes(target_audience)) {
      return res.status(400).json({ error: '対象者は user, guide, all のいずれかである必要があります' });
    }

    const [result] = await pool.execute(
      `INSERT INTO announcements (title, content, target_audience, created_by)
       VALUES (?, ?, ?, ?)`,
      [title, content, target_audience, created_by]
    );

    const [newAnnouncement] = await pool.execute(
      `SELECT a.*, u.name as created_by_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ announcement: newAnnouncement[0] });
  } catch (error) {
    console.error('お知らせ作成エラー:', error);
    res.status(500).json({ error: 'お知らせの作成中にエラーが発生しました' });
  }
});

// 管理者向け：お知らせを更新
router.put('/admin/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const announcementId = parseInt(req.params.id);
    const { title, content, target_audience } = req.body;

    // バリデーション
    if (!title || !content || !target_audience) {
      return res.status(400).json({ error: 'タイトル、本文、対象者は必須です' });
    }

    if (!['user', 'guide', 'all'].includes(target_audience)) {
      return res.status(400).json({ error: '対象者は user, guide, all のいずれかである必要があります' });
    }

    // お知らせが存在するか確認
    const [announcements] = await pool.execute(
      'SELECT * FROM announcements WHERE id = ?',
      [announcementId]
    );

    if (announcements.length === 0) {
      return res.status(404).json({ error: 'お知らせが見つかりません' });
    }

    await pool.execute(
      `UPDATE announcements 
       SET title = ?, content = ?, target_audience = ?
       WHERE id = ?`,
      [title, content, target_audience, announcementId]
    );

    const [updatedAnnouncement] = await pool.execute(
      `SELECT a.*, u.name as created_by_name
       FROM announcements a
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = ?`,
      [announcementId]
    );

    res.json({ announcement: updatedAnnouncement[0] });
  } catch (error) {
    console.error('お知らせ更新エラー:', error);
    res.status(500).json({ error: 'お知らせの更新中にエラーが発生しました' });
  }
});

// 管理者向け：お知らせを削除
router.delete('/admin/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const announcementId = parseInt(req.params.id);

    // お知らせが存在するか確認
    const [announcements] = await pool.execute(
      'SELECT * FROM announcements WHERE id = ?',
      [announcementId]
    );

    if (announcements.length === 0) {
      return res.status(404).json({ error: 'お知らせが見つかりません' });
    }

    await pool.execute('DELETE FROM announcements WHERE id = ?', [announcementId]);

    res.json({ message: 'お知らせを削除しました' });
  } catch (error) {
    console.error('お知らせ削除エラー:', error);
    res.status(500).json({ error: 'お知らせの削除中にエラーが発生しました' });
  }
});

module.exports = router;
