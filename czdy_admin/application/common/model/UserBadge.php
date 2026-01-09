<?php

namespace app\common\model;

use think\Model;

/**
 * 用户徽章模型
 */
class UserBadge extends Model
{
    protected $name = 'user_badge';
    protected $autoWriteTimestamp = 'int';
    protected $createTime = false;
    protected $updateTime = false;

    protected $append = ['badge_info'];

    /**
     * 获取徽章信息
     */
    public function getBadgeInfoAttr($value, $data)
    {
        return Badge::find($data['badge_id']);
    }
}

