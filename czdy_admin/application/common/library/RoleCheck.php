<?php

namespace app\common\library;

use app\common\model\FamilyMember;

/**
 * 角色权限检查类
 */
class RoleCheck
{
    /**
     * 检查用户是否为家长
     * @param int $userId
     * @param int|null $familyId 如果提供，检查在指定家庭中是否为家长
     * @return bool
     */
    public static function isParent($userId, $familyId = null)
    {
        if ($familyId) {
            $member = FamilyMember::where('user_id', $userId)
                ->where('family_id', $familyId)
                ->find();
            return $member && $member->role_in_family === 'parent';
        }

        // 检查是否在任何家庭中为家长
        $member = FamilyMember::where('user_id', $userId)
            ->where('role_in_family', 'parent')
            ->find();
        return $member ? true : false;
    }

    /**
     * 检查用户是否为孩子
     * @param int $userId
     * @param int|null $familyId 如果提供，检查在指定家庭中是否为孩子
     * @return bool
     */
    public static function isChild($userId, $familyId = null)
    {
        if ($familyId) {
            $member = FamilyMember::where('user_id', $userId)
                ->where('family_id', $familyId)
                ->find();
            return $member && $member->role_in_family === 'child';
        }

        // 检查是否在任何家庭中为孩子
        $member = FamilyMember::where('user_id', $userId)
            ->where('role_in_family', 'child')
            ->find();
        return $member ? true : false;
    }

    /**
     * 检查两个用户是否在同一家庭
     * @param int $userId1
     * @param int $userId2
     * @return bool
     */
    public static function isInSameFamily($userId1, $userId2)
    {
        $familyId1 = FamilyMember::getUserFamilyId($userId1);
        $familyId2 = FamilyMember::getUserFamilyId($userId2);
        
        return $familyId1 && $familyId2 && $familyId1 == $familyId2;
    }

    /**
     * 检查用户是否有权限访问目标用户的数据
     * @param int $currentUserId 当前用户ID
     * @param int $targetUserId 目标用户ID
     * @return bool
     */
    public static function canAccessUserData($currentUserId, $targetUserId)
    {
        // 自己可以访问自己的数据
        if ($currentUserId == $targetUserId) {
            return true;
        }

        // 检查是否在同一家庭
        if (!self::isInSameFamily($currentUserId, $targetUserId)) {
            return false;
        }

        // 家长可以访问家庭成员的数据
        $currentFamilyId = FamilyMember::getUserFamilyId($currentUserId);
        if ($currentFamilyId && self::isParent($currentUserId, $currentFamilyId)) {
            return true;
        }

        return false;
    }
}

