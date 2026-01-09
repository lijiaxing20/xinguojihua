<?php

namespace app\common\model;

use think\Model;

/**
 * 徽章模型
 */
class Badge extends Model
{
    protected $name = 'badge';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    /**
     * 检查并授予徽章
     * @param int $userId 用户ID
     * @param string $badgeType 徽章类型
     * @return bool|UserBadge
     */
    public static function checkAndAward($userId, $badgeType)
    {
        // 查找徽章配置
        $badge = self::where('badge_type', $badgeType)->find();
        if (!$badge) {
            return false;
        }

        // 检查是否已获得
        $userBadge = \app\common\model\UserBadge::where([
            'user_id' => $userId,
            'badge_id' => $badge->id,
        ])->find();

        if ($userBadge) {
            return $userBadge;
        }

        // 授予徽章
        $userBadge = \app\common\model\UserBadge::create([
            'user_id' => $userId,
            'badge_id' => $badge->id,
            'awarded_at' => time(),
        ]);

        // 创建通知
        \app\common\model\Notification::createNotification(
            $userId,
            'system',
            '获得新徽章',
            "恭喜您获得「{$badge->badge_name}」徽章！",
            $badge->id
        );

        return $userBadge;
    }
}

