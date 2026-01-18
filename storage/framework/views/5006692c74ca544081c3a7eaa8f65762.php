<?php $__env->startSection('content'); ?>
<div class="report-detail-container" x-data="reportDetail()" x-init="init()">
    <h1>報告書確認</h1>
    <div class="report-card">
        <div class="report-header">
            <h2>ガイド: <span x-text="report.guide?.name || '—'"></span></h2>
            <span class="status-badge" :class="report.status === 'submitted' ? 'status-pending' : 'status-approved'" x-text="report.status === 'submitted' ? '承認待ち' : '承認済み'"></span>
        </div>

        <div class="report-section">
            <h3>サービス内容</h3>
            <p x-text="report.service_content || '未記入'"></p>
        </div>

        <div class="report-section">
            <h3>実施日時</h3>
            <p>
                <span x-text="report.actual_date || '—'"></span>
                <template x-if="report.actual_start_time && report.actual_end_time">
                    <span x-text="` ${report.actual_start_time.substring(0, 5)} ～ ${report.actual_end_time.substring(0, 5)}`"></span>
                </template>
            </p>
        </div>

        <div class="report-section">
            <h3>報告欄</h3>
            <p x-text="report.report_content || '未記入'"></p>
        </div>

        <template x-if="report.status === 'submitted'">
            <div class="report-actions">
                <button
                    type="button"
                    @click="handleApprove"
                    class="btn-primary"
                    :disabled="processing"
                >
                    <span x-show="!processing">承認</span>
                    <span x-show="processing">処理中...</span>
                </button>
                <div class="revision-section">
                    <textarea
                        x-model="revisionNotes"
                        placeholder="修正内容を入力してください"
                        rows="4"
                        class="revision-input"
                    ></textarea>
                    <button
                        type="button"
                        @click="handleRequestRevision"
                        class="btn-secondary"
                        :disabled="processing || !revisionNotes.trim()"
                    >
                        <span x-show="!processing">修正依頼</span>
                        <span x-show="processing">送信中...</span>
                    </button>
                </div>
            </div>
        </template>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('styles'); ?>
<link rel="stylesheet" href="<?php echo e(asset('css/ReportDetail.css')); ?>">
<?php $__env->stopPush(); ?>

<?php $__env->startPush('scripts'); ?>
<script>
function reportDetail() {
    return {
        report: <?php echo json_encode($report, 15, 512) ?>,
        revisionNotes: '',
        processing: false,
        init() {
            // 初期化処理
        },
        async handleApprove() {
            if (!confirm('この報告書を承認しますか？')) {
                return;
            }

            this.processing = true;
            try {
                const formData = new FormData();
                formData.append('_token', '<?php echo e(csrf_token()); ?>');
                formData.append('_method', 'POST');

                const response = await fetch('<?php echo e(route("reports.approve", $report->id)); ?>', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    alert('報告書を承認しました');
                    window.location.href = '<?php echo e(route("dashboard")); ?>';
                } else {
                    alert('承認処理に失敗しました');
                }
            } catch (err) {
                alert('承認処理に失敗しました');
            } finally {
                this.processing = false;
            }
        },
        async handleRequestRevision() {
            if (!this.revisionNotes.trim()) {
                alert('修正内容を入力してください');
                return;
            }

            if (!confirm('修正依頼を送信しますか？')) {
                return;
            }

            this.processing = true;
            try {
                const formData = new FormData();
                formData.append('revision_notes', this.revisionNotes);
                formData.append('_token', '<?php echo e(csrf_token()); ?>');
                formData.append('_method', 'POST');

                const response = await fetch('<?php echo e(route("reports.request-revision", $report->id)); ?>', {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin', // セッションクッキーを送信（必須）
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    alert('修正依頼を送信しました');
                    window.location.href = '<?php echo e(route("dashboard")); ?>';
                } else {
                    // エラーレスポンスの詳細を確認
                    let errorMessage = '修正依頼の送信に失敗しました';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorData.message || errorMessage;
                        console.error('修正依頼エラー:', errorData);
                    } catch (e) {
                        console.error('レスポンス解析エラー:', e);
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    }
                    alert(errorMessage);
                }
            } catch (err) {
                console.error('修正依頼送信エラー:', err);
                alert('修正依頼の送信に失敗しました: ' + (err.message || 'ネットワークエラー'));
            } finally {
                this.processing = false;
            }
        }
    }
}
</script>
<?php $__env->stopPush(); ?>





<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH /Users/maiki/Downloads/ガイドヘルパー/resources/views/reports/show.blade.php ENDPATH**/ ?>