<?php

namespace app\common\model;

use think\Model;

/**
 * 家庭成员模型
 *
 * 对应数据表：fa_family_member
 */
class FamilyMember extends Model
{
    // 表名,不含前缀
    protected $name = 'family_member';

    // 开启自动写入时间戳字段
    protected $autoWriteTimestamp = false;
    
    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = false;

    /**
     * 关联家庭
     */
    public function family()
    {
        return $this->belongsTo('Family', 'family_id');
    }

    /**
     * 关联用户
     */
    public function user()
    {
        return $this->belongsTo('User', 'user_id');
    }

    /**
     * 获取用户所属的家庭ID
     * @param int $userId
     * @return int|null
     */
    public static function getUserFamilyId($userId)
    {
        $member = self::where('user_id', $userId)->find();
        return $member ? $member->family_id : null;
    }

    /**
     * 获取家庭的所有成员ID
     * @param int $familyId
     * @return array
     */
    public static function getFamilyMemberIds($familyId)
    {
        return self::where('family_id', $familyId)->column('user_id');
    }

    /**
     * 获取家庭的所有家长ID
     * @param int $familyId
     * @return array
     */
    public static function getFamilyParentIds($familyId)
    {
        return self::where('family_id', $familyId)
            ->where('role_in_family', 'parent')
            ->column('user_id');
    }

    /**
     * 获取家庭的所有孩子ID
     * @param int $familyId
     * @return array
     */
    public static function getFamilyChildIds($familyId)
    {
        return self::where('family_id', $familyId)
            ->where('role_in_family', 'child')
            ->column('user_id');
    }

    /**
     * 检查是否是某孩子的家长
     * @param int $parentId
     * @param int $childId
     * @return bool
     */
    public static function isParentOf($parentId, $childId)
    {
        $parent = self::where('user_id', $parentId)->where('role_in_family', 'parent')->find();
        if (!$parent) {
            return false;
        }
        
        $child = self::where('user_id', $childId)->where('role_in_family', 'child')->find();
        if (!$child) {
            return false;
        }
        
        return $parent['family_id'] == $child['family_id'];
    }
}

