<?php

namespace app\common\model;

use think\Model;

/**
 * 家庭模型
 *
 * 对应数据表：fa_family
 */
class Family extends Model
{
    // 表名,不含前缀
    protected $name = 'family';

    // 开启自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';
    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';

    /**
     * 关联家庭成员
     */
    public function members()
    {
        return $this->hasMany('FamilyMember', 'family_id');
    }

    /**
     * 关联创建者
     */
    public function creator()
    {
        return $this->belongsTo('User', 'creator_user_id');
    }
}

