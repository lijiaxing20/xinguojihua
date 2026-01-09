<?php

namespace app\common\model;

use think\Model;

/**
 * 通知模型
 */
class Notification extends Model
{
    protected $name = 'notification';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    // 通知类型
    const TYPE_TASK = 'task';
    const TYPE_WISH = 'wish';
    const TYPE_FEEDBACK = 'feedback';
    const TYPE_SYSTEM = 'system';

    // 通知状态
    const STATUS_UNREAD = 'unread';
    const STATUS_READ = 'read';

    /**
     * 创建通知
     * @param int $userId 接收用户ID
     * @param string $type 通知类型
     * @param string $title 标题
     * @param string $content 内容
     * @param int|null $relatedId 关联ID
     * @return Notification|false
     */
    public static function createNotification($userId, $type, $title, $content, $relatedId = null)
    {
        try {
            return self::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'content' => $content,
                'related_id' => $relatedId ?: 0,
                'status' => self::STATUS_UNREAD,
            ]);
        } catch (\Exception $e) {
            // 如果通知表不存在，返回 false
            return false;
        }
    }
}

