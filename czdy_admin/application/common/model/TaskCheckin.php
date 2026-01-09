<?php

namespace app\common\model;

use think\Model;

/**
 * 任务打卡模型
 *
 * 对应数据表：fa_task_checkin
 */
class TaskCheckin extends Model
{
    // 表名,不含前缀
    protected $name = 'task_checkin';

    // 开启自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
}


