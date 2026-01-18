<?php $__env->startSection('content'); ?>
<div class="profile-container" x-data="profileForm()" x-init="init()">
    <h1>プロフィール編集</h1>
    <form method="POST" action="<?php echo e(route('profile.update')); ?>" @submit.prevent="handleSubmit" class="profile-form" aria-label="プロフィール編集フォーム">
        <?php echo csrf_field(); ?>
        <?php echo method_field('PUT'); ?>
        
        <div x-show="message" :class="message.includes('失敗') ? 'error-message' : 'success-message'" class="message" role="alert" x-text="message"></div>
        <?php if(session('success')): ?>
            <div class="success-message" role="alert">
                <?php echo e(session('success')); ?>

            </div>
        <?php endif; ?>
        <?php if($errors->any()): ?>
            <div class="error-message" role="alert">
                <?php echo e($errors->first()); ?>

            </div>
        <?php endif; ?>

        <div class="form-group">
            <label for="name">お名前 
                <span class="required">*</span>
                <?php if(!$user->isAdmin()): ?>
                    <span class="readonly-label">（閲覧のみ）</span>
                <?php endif; ?>
            </label>
            <input
                type="text"
                id="name"
                name="name"
                x-model="formData.name"
                value="<?php echo e($user->name); ?>"
                required
                aria-required="true"
                <?php if(!$user->isAdmin()): ?> readonly disabled <?php endif; ?>
            />
        </div>

        <div class="form-group">
            <label for="phone">電話番号
                <?php if(!$user->isAdmin()): ?>
                    <span class="readonly-label">（閲覧のみ）</span>
                <?php endif; ?>
            </label>
            <input
                type="tel"
                id="phone"
                name="phone"
                x-model="formData.phone"
                value="<?php echo e($user->phone); ?>"
                <?php if(!$user->isAdmin()): ?> readonly disabled <?php endif; ?>
            />
        </div>

        <div class="form-group">
            <label for="address">住所
                <?php if(!$user->isAdmin()): ?>
                    <span class="readonly-label">（閲覧のみ）</span>
                <?php endif; ?>
            </label>
            <textarea
                id="address"
                name="address"
                x-model="formData.address"
                rows="2"
                <?php if(!$user->isAdmin()): ?> readonly disabled <?php endif; ?>
            ><?php echo e($user->address); ?></textarea>
        </div>

        <div class="form-group">
            <label for="age">年齢（表示のみ）</label>
            <input
                type="text"
                id="age"
                name="age"
                value="<?php echo e($user->age ?? ''); ?>"
                readonly
                disabled
            />
        </div>

        <div class="form-group">
            <label for="birth_date">生年月日（表示のみ）</label>
            <input
                type="date"
                id="birth_date"
                name="birth_date"
                value="<?php echo e($user->birth_date ? $user->birth_date->format('Y-m-d') : ''); ?>"
                readonly
                disabled
            />
        </div>

        <?php if($user->isUser()): ?>
            <div class="form-group">
                <label for="contact_method">連絡手段</label>
                <input
                    type="text"
                    id="contact_method"
                    name="contact_method"
                    x-model="formData.contact_method"
                    value="<?php echo e($user->userProfile->contact_method ?? ''); ?>"
                    placeholder="例: 電話、メール、LINE等"
                />
            </div>
            <div class="form-group">
                <label for="notes">備考</label>
                <textarea
                    id="notes"
                    name="notes"
                    x-model="formData.notes"
                    rows="4"
                ><?php echo e($user->userProfile->notes ?? ''); ?></textarea>
            </div>
            <?php if(!$user->isAdmin()): ?>
                <div class="form-group">
                    <label>受給者証番号（閲覧のみ）</label>
                    <input
                        type="text"
                        value="<?php echo e($user->userProfile->recipient_number ?? ''); ?>"
                        disabled
                        aria-readonly="true"
                    />
                </div>
            <?php endif; ?>
            <div class="form-group">
                <label for="introduction">自己紹介</label>
                <textarea
                    id="introduction"
                    name="introduction"
                    x-model="formData.introduction"
                    rows="4"
                    placeholder="自己紹介を記入してください"
                ><?php echo e($user->userProfile->introduction ?? ''); ?></textarea>
            </div>
        <?php endif; ?>

        <?php if($user->isGuide()): ?>
            <div class="form-group">
                <label for="introduction">自己紹介</label>
                <textarea
                    id="introduction"
                    name="introduction"
                    x-model="formData.introduction"
                    rows="4"
                    placeholder="自己紹介を記入してください"
                ><?php echo e($user->guideProfile->introduction ?? ''); ?></textarea>
            </div>

            <div class="form-group">
                <label>対応可能エリア</label>
                <div class="checkbox-group">
                    <?php $__currentLoopData = ['東京都', '大阪府', '京都府', '神奈川県', '埼玉県', '千葉県', '愛知県', 'その他']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $area): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                name="available_areas[]"
                                value="<?php echo e($area); ?>"
                                x-model="formData.available_areas"
                                <?php if($user->guideProfile && is_array($user->guideProfile->available_areas) && in_array($area, $user->guideProfile->available_areas)): ?> checked <?php endif; ?>
                            />
                            <?php echo e($area); ?>

                        </label>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
            </div>

            <div class="form-group">
                <label>対応可能日</label>
                <div class="checkbox-group">
                    <?php $__currentLoopData = ['平日', '土日', '祝日']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $day): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                name="available_days[]"
                                value="<?php echo e($day); ?>"
                                x-model="formData.available_days"
                                <?php if($user->guideProfile && is_array($user->guideProfile->available_days) && in_array($day, $user->guideProfile->available_days)): ?> checked <?php endif; ?>
                            />
                            <?php echo e($day); ?>

                        </label>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
            </div>

            <div class="form-group">
                <label>対応可能時間帯</label>
                <div class="checkbox-group">
                    <?php $__currentLoopData = ['午前', '午後', '夜間']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $time): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                name="available_times[]"
                                value="<?php echo e($time); ?>"
                                x-model="formData.available_times"
                                <?php if($user->guideProfile && is_array($user->guideProfile->available_times) && in_array($time, $user->guideProfile->available_times)): ?> checked <?php endif; ?>
                            />
                            <?php echo e($time); ?>

                        </label>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                </div>
            </div>

            <div class="form-group">
                <label>従業員番号（閲覧のみ）</label>
                <input
                    type="text"
                    value="<?php echo e($user->guideProfile->employee_number ?? ''); ?>"
                    disabled
                    aria-readonly="true"
                />
            </div>
            <?php if(!$user->isAdmin()): ?>
                <div class="form-group">
                    <label>運営側からのコメント（閲覧のみ）</label>
                    <textarea
                        value="<?php echo e($user->guideProfile->admin_comment ?? ''); ?>"
                        readOnly
                        aria-readonly="true"
                        rows="3"
                    ><?php echo e($user->guideProfile->admin_comment ?? ''); ?></textarea>
                </div>
            <?php endif; ?>
        <?php endif; ?>

        <div class="form-actions">
            <button
                type="submit"
                class="btn-primary"
                :disabled="saving"
                aria-label="プロフィールを保存"
            >
                <span x-show="!saving">保存</span>
                <span x-show="saving">保存中...</span>
            </button>
        </div>
    </form>
</div>
<?php $__env->stopSection(); ?>

<?php $__env->startPush('styles'); ?>
<link rel="stylesheet" href="<?php echo e(asset('css/Profile.css')); ?>">
<?php $__env->stopPush(); ?>

<?php $__env->startPush('scripts'); ?>
<script>
function profileForm() {
    return {
        formData: {
            name: '<?php echo e($user->name); ?>',
            phone: '<?php echo e($user->phone ?? ''); ?>',
            address: '<?php echo e($user->address ?? ''); ?>',
            contact_method: '<?php echo e($user->userProfile->contact_method ?? ''); ?>',
            notes: '<?php echo e($user->userProfile->notes ?? ''); ?>',
            introduction: '<?php echo e($user->userProfile->introduction ?? ($user->guideProfile->introduction ?? '')); ?>',
            available_areas: <?php echo json_encode($user->guideProfile ? ($user->guideProfile->available_areas ?? []) : [], 15, 512) ?>,
            available_days: <?php echo json_encode($user->guideProfile ? ($user->guideProfile->available_days ?? []) : [], 15, 512) ?>,
            available_times: <?php echo json_encode($user->guideProfile ? ($user->guideProfile->available_times ?? []) : [], 15, 512) ?>,
        },
        message: '',
        saving: false,
        init() {
            // サーバーから渡されたJWTトークンをlocalStorageに保存
            <?php if(isset($jwt_token) && $jwt_token): ?>
                localStorage.setItem('token', '<?php echo e($jwt_token); ?>');
            <?php endif; ?>
            // プロフィール編集画面では統計情報の取得は不要
        },
        handleSubmit() {
            this.saving = true;
            this.message = '';
            this.$el.submit();
        }
    }
}
</script>
<?php $__env->stopPush(); ?>


<?php echo $__env->make('layouts.app', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?><?php /**PATH /Users/maiki/Downloads/ガイドヘルパー/resources/views/profile.blade.php ENDPATH**/ ?>