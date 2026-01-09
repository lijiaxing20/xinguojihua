<?php

namespace app\common\model;

use think\Model;

/**
 * 能量值日志模型
 */
class EnergyLog extends Model
{
    protected $name = 'energy_log';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = 'createtime';
    protected $updateTime = false;

    // 变更原因
    const REASON_TASK_COMPLETE = 'task_complete';
    const REASON_WISH_FULFILL = 'wish_fulfill';
    const REASON_SYSTEM_ADJUST = 'system_adjust';

    /**
     * 变更用户能量值
     * @param int $userId 用户ID
     * @param int $amount 变更数量（正数为增加，负数为减少）
     * @param string $reason 变更原因
     * @param int|null $relatedId 关联ID（任务ID或心愿ID）
     * @return bool
     */
    public static function changeEnergy($userId, $amount, $reason, $relatedId = null)
    {
        if ($amount == 0) {
            return false;
        }

        \think\Db::startTrans();
        try {
            // 更新用户能量值
            $user = \app\common\model\User::lock(true)->find($userId);
            if (!$user) {
                throw new \Exception('用户不存在');
            }

            $before = $user->energy ?? 0;
            $after = max(0, $before + $amount); // 能量值不能为负

            // 更新用户表（需要在User模型中添加energy字段）
            $user->save(['energy' => $after]);

            // 记录日志
            self::create([
                'user_id' => $userId,
                'change_amount' => $amount,
                'before' => $before,
                'after' => $after,
                'reason' => $reason,
                'related_id' => $relatedId,
            ]);

            \think\Db::commit();
            return true;
        } catch (\Exception $e) {
            \think\Db::rollback();
            return false;
        }
    }

    /**
     * 获取用户能量值
     * @param int $userId
     * @return int
     */
    public static function getUserEnergy($userId)
    {
        $user = \app\common\model\User::find($userId);
        return $user ? ($user->energy ?? 0) : 0;
    }
}

