<?php

namespace app\common\model;

use think\Model;

/**
 * 任务模型
 *
 * 对应数据表：fa_task
 * 建议字段（不含前缀）：
 * - id (int)
 * - family_id (int)
 * - creator_user_id (int)
 * - assignee_user_id (int, nullable)
 * - task_name (varchar)
 * - description (text, nullable)
 * - category (varchar) 习惯养成/学习探索/兴趣技能/家庭贡献
 * - status (varchar) 待确认/待执行/进行中/已完成/已拒绝
 * - target_date (datetime, nullable)
 * - energy_value (int, nullable)
 * - createtime (int)
 * - updatetime (int)
 */
class Task extends Model
{
    // 表名,不含前缀
    protected $name = 'task';

    // 开启自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
}


