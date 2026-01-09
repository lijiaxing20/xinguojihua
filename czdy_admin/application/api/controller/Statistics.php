<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Task;
use app\common\model\TaskCheckin;
use app\common\model\EnergyLog;
use app\common\model\Badge;
use app\common\model\Wish;
use app\common\model\UserBadge;
use app\common\model\FamilyMember;
use app\common\model\User;
use app\common\model\ParentFeedback;
use think\Db;

/**
 * 统计接口
 */
class Statistics extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = '*';

    /**
     * 获取仪表盘统计数据
     */
    public function dashboard()
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
            if (!$familyId || $familyId != $targetFamilyId) {
                $this->error('无权限查看该用户数据');
            }
        }

        $todayStart = strtotime('today');
        $todayEnd = strtotime('tomorrow') - 1;
        $weekStart = strtotime('this week monday');
        $weekEnd = strtotime('next week monday') - 1;

        // 1. 今日数据
        $todayStats = [
            'task_completed' => Task::where('assignee_user_id', $userId)
                ->where('status', 'completed')
                ->where('updatetime', 'between', [$todayStart, $todayEnd])
                ->count(),
            'checkin_count' => TaskCheckin::where('user_id', $userId)
                ->where('createtime', 'between', [$todayStart, $todayEnd])
                ->count(),
            'energy_earned' => EnergyLog::where('user_id', $userId)
                ->where('change_amount', '>', 0)
                ->where('createtime', 'between', [$todayStart, $todayEnd])
                ->sum('change_amount'),
        ];

        // 2. 本周数据
        $weekStats = [
            'task_completed' => Task::where('assignee_user_id', $userId)
                ->where('status', 'completed')
                ->where('updatetime', 'between', [$weekStart, $weekEnd])
                ->count(),
            'checkin_count' => TaskCheckin::where('user_id', $userId)
                ->where('createtime', 'between', [$weekStart, $weekEnd])
                ->count(),
            'energy_earned' => EnergyLog::where('user_id', $userId)
                ->where('change_amount', '>', 0)
                ->where('createtime', 'between', [$weekStart, $weekEnd])
                ->sum('change_amount'),
        ];

        // 3. 累计数据
        $totalStats = [
            'total_tasks' => Task::where('assignee_user_id', $userId)->count(),
            'pending_tasks' => Task::where('assignee_user_id', $userId)
                ->where('status', 'pending')
                ->count(),
            'in_progress_tasks' => Task::where('assignee_user_id', $userId)
                ->where('status', 'in_progress')
                ->count(),
            'completed_tasks' => Task::where('assignee_user_id', $userId)
                ->where('status', 'completed')
                ->count(),
            'total_checkins' => TaskCheckin::where('user_id', $userId)->count(),
            'total_energy' => EnergyLog::getUserEnergy($userId),
            'total_badges' => UserBadge::where('user_id', $userId)->count(),
            'fulfilled_wishes' => Wish::where('user_id', $userId)
                ->where('status', 'fulfilled')
                ->count(),
        ];

        // 4. 分类分布
        $categoryDistribution = Task::where('assignee_user_id', $userId)
            ->field('category, count(*) as count')
            ->group('category')
            ->select();

        // 5. 打卡趋势 (最近7天)
        $checkinTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $dayStart = strtotime($date);
            $dayEnd = $dayStart + 86400 - 1;
            
            $count = TaskCheckin::where('user_id', $userId)
                ->where('createtime', 'between', [$dayStart, $dayEnd])
                ->count();
            
            $checkinTrend[] = [
                'date' => $date,
                'count' => $count
            ];
        }

        // 6. 最近任务
        $recentPendingTasks = Task::where('assignee_user_id', $userId)
            ->where('status', 'pending')
            ->order('createtime', 'desc')
            ->limit(3)
            ->field('id, task_name as title, createtime')
            ->select();

        $recentInProgressTasks = Task::where('assignee_user_id', $userId)
            ->where('status', 'in_progress')
            ->order('updatetime', 'desc')
            ->limit(3)
            ->field('id, task_name as title, updatetime')
            ->select();

        // 7. 最近获得徽章
        $recentBadges = UserBadge::alias('ub')
            ->join('__BADGE__ b', 'ub.badge_id = b.id')
            ->where('ub.user_id', $userId)
            ->order('ub.awarded_at', 'desc')
            ->limit(3)
            ->field('b.id, b.badge_name, b.badge_type, b.icon_url as icon, b.description, ub.awarded_at')
            ->select();

        // 8. 最近家长反馈
        $recentFeedback = ParentFeedback::alias('pf')
            ->join('__TASK_CHECKIN__ tc', 'pf.checkin_id = tc.id')
            ->join('__TASK__ t', 'tc.task_id = t.id')
            ->join('__USER__ parent', 'pf.parent_user_id = parent.id')
            ->where('tc.user_id', $userId)
            ->order('pf.createtime', 'desc')
            ->limit(3)
            ->field('pf.id, pf.feedback_content, pf.emoji_type, pf.createtime, parent.nickname as parent_name, parent.avatar as parent_avatar, t.task_name, t.id as task_id')
            ->select();

        $data = [
            'today' => $todayStats,
            'week' => $weekStats,
            'total' => $totalStats,
            'category_distribution' => $categoryDistribution,
            'checkin_trend' => $checkinTrend,
            'recent_pending_tasks' => $recentPendingTasks,
            'recent_in_progress_tasks' => $recentInProgressTasks,
            'recent_badges' => $recentBadges,
            'recent_feedback' => $recentFeedback,
        ];

        $this->success('', $data);
    }

    /**
     * 获取家庭统计（家长端）
     */
    public function family()
    {
        // 获取家庭ID
        $familyId = FamilyMember::getUserFamilyId($this->auth->id);
        if (!$familyId) {
            $this->error('未加入家庭');
        }

        // 获取家庭中的所有孩子
        $children = FamilyMember::alias('fm')
            ->join('__USER__ u', 'fm.user_id = u.id')
            ->where('fm.family_id', $familyId)
            ->where('fm.role_in_family', 'child')
            ->field('u.id as user_id, u.nickname, u.avatar, u.energy')
            ->select();

        $result = [];
        foreach ($children as $child) {
            $userId = $child['user_id'];
            
            $result[] = [
                'user_id' => $userId,
                'nickname' => $child['nickname'],
                'avatar' => $child['avatar'],
                'total_tasks' => Task::where('assignee_user_id', $userId)->count(),
                'completed_tasks' => Task::where('assignee_user_id', $userId)
                    ->where('status', 'completed')
                    ->count(),
                'total_energy' => $child['energy'] ?? 0, // 当前能量值
                'total_badges' => UserBadge::where('user_id', $userId)->count(),
            ];
        }

        $this->success('', ['children' => $result]);
    }
}
