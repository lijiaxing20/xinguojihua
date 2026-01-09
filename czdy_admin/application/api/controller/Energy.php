<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\EnergyLog;
use app\common\model\User;
use app\common\model\FamilyMember;

/**
 * 能量值相关接口
 */
class Energy extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = '*';

    /**
     * 获取用户当前能量值余额
     * GET /api/energy/balance
     */
    public function balance()
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

        $energy = EnergyLog::getUserEnergy($userId);

        $this->success('', [
            'user_id' => $userId,
            'energy' => $energy,
        ]);
    }

    /**
     * 获取能量值收支记录
     * GET /api/energy/logs
     */
    public function logs()
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

        $page = max(1, $this->request->get('page', 1));
        $limit = max(1, min(100, $this->request->get('limit', 20)));
        $startDate = $this->request->get('start_date');
        $endDate = $this->request->get('end_date');
        $reason = $this->request->get('reason');

        $query = EnergyLog::where('user_id', $userId);

        // 时间范围筛选
        if ($startDate) {
            $query->where('createtime', '>=', strtotime($startDate));
        }
        if ($endDate) {
            $query->where('createtime', '<=', strtotime($endDate . ' 23:59:59'));
        }

        // 原因筛选
        if ($reason) {
            $query->where('reason', $reason);
        }

        $list = $query
            ->order('createtime', 'desc')
            ->page($page, $limit)
            ->select();

        $total = $query->count();

        // 格式化数据
        $result = [];
        foreach ($list as $log) {
            $result[] = [
                'id' => $log->id,
                'change_amount' => $log->change_amount,
                'before' => $log->before,
                'after' => $log->after,
                'reason' => $log->reason,
                'reason_text' => $this->getReasonText($log->reason),
                'related_id' => $log->related_id,
                'createtime' => $log->createtime,
                'createtime_text' => date('Y-m-d H:i:s', $log->createtime),
            ];
        }

        $this->success('', [
            'list' => $result,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
        ]);
    }

    /**
     * 获取能量值统计数据
     * GET /api/energy/statistics
     */
    public function statistics()
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

        // 当前能量值
        $currentEnergy = EnergyLog::getUserEnergy($userId);

        // 今日收入
        $todayStart = strtotime(date('Y-m-d'));
        $todayIncome = EnergyLog::where('user_id', $userId)
            ->where('createtime', '>=', $todayStart)
            ->where('change_amount', '>', 0)
            ->sum('change_amount');

        // 今日支出
        $todayExpense = EnergyLog::where('user_id', $userId)
            ->where('createtime', '>=', $todayStart)
            ->where('change_amount', '<', 0)
            ->sum('change_amount');

        // 本周收入
        $weekStart = strtotime(date('Y-m-d', strtotime('this week Monday')));
        $weekIncome = EnergyLog::where('user_id', $userId)
            ->where('createtime', '>=', $weekStart)
            ->where('change_amount', '>', 0)
            ->sum('change_amount');

        // 本月收入
        $monthStart = strtotime(date('Y-m-01'));
        $monthIncome = EnergyLog::where('user_id', $userId)
            ->where('createtime', '>=', $monthStart)
            ->where('change_amount', '>', 0)
            ->sum('change_amount');

        // 总收入
        $totalIncome = EnergyLog::where('user_id', $userId)
            ->where('change_amount', '>', 0)
            ->sum('change_amount');

        // 总支出
        $totalExpense = EnergyLog::where('user_id', $userId)
            ->where('change_amount', '<', 0)
            ->sum('change_amount');

        // 最近7天的收支趋势
        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $dayStart = strtotime(date('Y-m-d', strtotime("-$i days")));
            $dayEnd = strtotime(date('Y-m-d 23:59:59', strtotime("-$i days")));

            $dayIncome = EnergyLog::where('user_id', $userId)
                ->where('createtime', '>=', $dayStart)
                ->where('createtime', '<=', $dayEnd)
                ->where('change_amount', '>', 0)
                ->sum('change_amount');

            $dayExpense = EnergyLog::where('user_id', $userId)
                ->where('createtime', '>=', $dayStart)
                ->where('createtime', '<=', $dayEnd)
                ->where('change_amount', '<', 0)
                ->sum('change_amount');

            $trend[] = [
                'date' => date('Y-m-d', $dayStart),
                'income' => (int)$dayIncome,
                'expense' => (int)abs($dayExpense),
            ];
        }

        $this->success('', [
            'current_energy' => $currentEnergy,
            'today_income' => (int)$todayIncome,
            'today_expense' => (int)abs($todayExpense),
            'week_income' => (int)$weekIncome,
            'month_income' => (int)$monthIncome,
            'total_income' => (int)$totalIncome,
            'total_expense' => (int)abs($totalExpense),
            'trend' => $trend,
        ]);
    }

    /**
     * 获取变更原因的文本描述
     * @param string $reason
     * @return string
     */
    private function getReasonText($reason)
    {
        $reasons = [
            'task_complete' => '完成任务',
            'wish_fulfill' => '兑换心愿',
            'system_adjust' => '系统调整',
            'checkin_bonus' => '打卡奖励',
            'badge_award' => '勋章奖励',
        ];

        return $reasons[$reason] ?? '其他';
    }
}
