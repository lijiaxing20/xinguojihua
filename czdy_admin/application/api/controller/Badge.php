<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Badge as BadgeModel;
use app\common\model\UserBadge;
use app\common\model\FamilyMember;

/**
 * 徽章相关接口
 */
class Badge extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = '*';

    /**
     * 获取用户徽章列表
     * GET /api/badge/user_badges
     */
    public function user_badges()
    {
        $userId = $this->request->get('user_id');
        // 如果未指定user_id，则默认为当前用户
        if (!$userId) {
            $userId = $this->auth->id;
        }

        // 验证权限：只能查看自己或家庭成员的数据
        if ($userId != $this->auth->id) {
            $familyId = FamilyMember::getUserFamilyId($this->auth->id);
            $targetFamilyId = FamilyMember::getUserFamilyId($userId);
            // 如果我是家长，可以看孩子的。如果我是孩子，只能看自己的（或者也可以看兄弟姐妹的？暂时严格一点）
            // 这里简化逻辑：只要在同一个家庭就可以看
            if (!$familyId || $familyId != $targetFamilyId) {
                $this->error('无权限查看该用户数据');
            }
        }

        $list = \think\Db::name('user_badge')->alias('ub')
            ->join('__BADGE__ b', 'ub.badge_id = b.id')
            ->where('ub.user_id', $userId)
            ->order('ub.awarded_at', 'desc')
            ->field('b.id, b.badge_name, b.badge_type, b.icon_url, b.icon_url as icon, b.description, ub.awarded_at, ub.badge_id')
            ->select();

        // 这里的$list已经是数组了，不需要collection转换和hidden
        
        $this->success('', $list);
    }
}
