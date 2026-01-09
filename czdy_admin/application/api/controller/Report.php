<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Task;
use app\common\model\TaskCheckin;
use app\common\model\Wish;
use app\common\model\EnergyLog;
use app\common\model\UserBadge;
use app\common\model\FamilyMember;

/**
 * 成长报告接口
 */
class Report extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = '*';

    /**
     * 获取周报
     * GET /api/report/weekly
     */
    public function weekly()
    {
        $targetUserId = $this->request->get('user_id', $this->auth->id);
        
        // 检查权限：只能查看自己或家庭成员的报告
        if ($targetUserId != $this->auth->id) {
            $this->checkFamilyPermission($targetUserId);
        }

        $weekStart = $this->request->get('week_start', '');
        if (empty($weekStart)) {
            $weekStart = date('Y-m-d', strtotime('monday this week'));
        }

        $startTime = strtotime($weekStart);
        $endTime = $startTime + 7 * 86400 - 1;

        // 任务统计
        $taskStats = $this->getTaskStats($targetUserId, $startTime, $endTime);
        
        // 能量值统计
        $energyStats = $this->getEnergyStats($targetUserId, $startTime, $endTime);
        
        // 徽章统计
        $badgeStats = $this->getBadgeStats($targetUserId, $startTime, $endTime);
        
        // 心愿统计
        $wishStats = $this->getWishStats($targetUserId, $startTime, $endTime);

        // 每日数据趋势
        $dailyTrend = $this->getDailyTrend($targetUserId, $startTime, $endTime);

        $this->success('', [
            'week_start' => date('Y-m-d', $startTime),
            'week_end' => date('Y-m-d', $endTime),
            'task' => $taskStats,
            'energy' => $energyStats,
            'badge' => $badgeStats,
            'wish' => $wishStats,
            'daily_trend' => $dailyTrend,
        ]);
    }

    /**
     * 获取月报
     * GET /api/report/monthly
     */
    public function monthly()
    {
        $targetUserId = $this->request->get('user_id', $this->auth->id);
        
        if ($targetUserId != $this->auth->id) {
            $this->checkFamilyPermission($targetUserId);
        }

        $month = $this->request->get('month', date('Y-m'));
        $startTime = strtotime($month . '-01');
        $endTime = strtotime(date('Y-m-t', $startTime) . ' 23:59:59');

        // 任务统计
        $taskStats = $this->getTaskStats($targetUserId, $startTime, $endTime);
        
        // 能量值统计
        $energyStats = $this->getEnergyStats($targetUserId, $startTime, $endTime);
        
        // 徽章统计
        $badgeStats = $this->getBadgeStats($targetUserId, $startTime, $endTime);
        
        // 心愿统计
        $wishStats = $this->getWishStats($targetUserId, $startTime, $endTime);

        // 每日数据趋势
        $dailyTrend = $this->getDailyTrend($targetUserId, $startTime, $endTime);

        $this->success('', [
            'month' => $month,
            'task' => $taskStats,
            'energy' => $energyStats,
            'badge' => $badgeStats,
            'wish' => $wishStats,
            'daily_trend' => $dailyTrend,
        ]);
    }

    /**
     * 获取任务统计
     */
    private function getTaskStats($userId, $startTime, $endTime)
    {
        // 总任务数
        $totalTasks = Task::where('assignee_user_id', $userId)
            ->where('createtime', 'between', [$startTime, $endTime])
            ->count();

        // 已完成任务数
        $completedTasks = Task::where('assignee_user_id', $userId)
            ->where('status', 'completed')
            ->where('updatetime', 'between', [$startTime, $endTime])
            ->count();

        // 打卡次数
        $checkinCount = TaskCheckin::alias('c')
            ->join('__TASK__ t', 'c.task_id = t.id')
            ->where('c.user_id', $userId)
            ->where('c.checkin_time', 'between', [$startTime, $endTime])
            ->count();

        // 按分类统计
        $categoryStats = Task::where('assignee_user_id', $userId)
            ->where('createtime', 'between', [$startTime, $endTime])
            ->group('category')
            ->column('count(*) as count, category');

        return [
            'total' => $totalTasks,
            'completed' => $completedTasks,
            'completion_rate' => $totalTasks > 0 ? round($completedTasks / $totalTasks * 100, 2) : 0,
            'checkin_count' => $checkinCount,
            'by_category' => $categoryStats,
        ];
    }

    /**
     * 获取能量值统计
     */
    private function getEnergyStats($userId, $startTime, $endTime)
    {
        // 获得能量值
        $earned = EnergyLog::where('user_id', $userId)
            ->where('change_amount', '>', 0)
            ->where('createtime', 'between', [$startTime, $endTime])
            ->sum('change_amount');

        // 消耗能量值
        $spent = abs(EnergyLog::where('user_id', $userId)
            ->where('change_amount', '<', 0)
            ->where('createtime', 'between', [$startTime, $endTime])
            ->sum('change_amount'));

        // 当前能量值
        $current = \app\common\model\EnergyLog::getUserEnergy($userId);

        return [
            'earned' => (int)$earned,
            'spent' => (int)$spent,
            'current' => (int)$current,
        ];
    }

    /**
     * 获取徽章统计
     */
    private function getBadgeStats($userId, $startTime, $endTime)
    {
        $newBadgesCount = UserBadge::where('user_id', $userId)
            ->where('awarded_at', 'between', [$startTime, $endTime])
            ->count();

        $totalBadges = UserBadge::where('user_id', $userId)->count();

        // 获取新获得的徽章列表（用于亮点展示）
        $newBadgesList = UserBadge::alias('ub')
            ->join('__BADGE__ b', 'ub.badge_id = b.id')
            ->where('ub.user_id', $userId)
            ->where('ub.awarded_at', 'between', [$startTime, $endTime])
            ->field('b.id, b.badge_name, b.icon_url as icon, b.description, ub.awarded_at')
            ->select();

        return [
            'new' => $newBadgesCount,
            'total' => $totalBadges,
            'list' => $newBadgesList
        ];
    }

    /**
     * 获取心愿统计
     */
    private function getWishStats($userId, $startTime, $endTime)
    {
        $total = Wish::where('user_id', $userId)
            ->where('createtime', 'between', [$startTime, $endTime])
            ->count();

        $fulfilled = Wish::where('user_id', $userId)
            ->where('status', 'fulfilled')
            ->where('fulfilled_at', 'between', [$startTime, $endTime])
            ->count();

        return [
            'total' => $total,
            'fulfilled' => $fulfilled,
        ];
    }

    /**
     * 获取每日趋势
     */
    private function getDailyTrend($userId, $startTime, $endTime)
    {
        $trend = [];
        $current = $startTime;
        
        while ($current <= $endTime) {
            $dayStart = $current;
            $dayEnd = $current + 86400 - 1;
            
            $checkinCount = TaskCheckin::alias('c')
                ->join('__TASK__ t', 'c.task_id = t.id')
                ->where('c.user_id', $userId)
                ->where('c.checkin_time', 'between', [$dayStart, $dayEnd])
                ->count();
            
            $energyEarned = EnergyLog::where('user_id', $userId)
                ->where('change_amount', '>', 0)
                ->where('createtime', 'between', [$dayStart, $dayEnd])
                ->sum('change_amount');
            
            $trend[] = [
                'date' => date('Y-m-d', $current),
                'checkin_count' => (int)$checkinCount,
                'energy_earned' => (int)$energyEarned,
            ];
            
            $current += 86400;
        }
        
        return $trend;
    }

    /**
     * 检查家庭权限
     */
    private function checkFamilyPermission($targetUserId)
    {
        $myFamilyId = FamilyMember::getUserFamilyId($this->auth->id);
        $targetFamilyId = FamilyMember::getUserFamilyId($targetUserId);

        if (!$myFamilyId || $myFamilyId != $targetFamilyId) {
            $this->error('无权限查看该用户的报告');
        }
    }

    /**
     * 生成报告
     * POST /api/report/generate
     */
    public function generate()
    {
        $userId = $this->request->post('user_id', $this->auth->id);
        $reportType = $this->request->post('type', 'weekly'); // weekly, monthly, custom
        $startDate = $this->request->post('start_date');
        $endDate = $this->request->post('end_date');
        $includeSections = $this->request->post('sections', []); // task, energy, badge, wish, trend

        // 检查权限
        if ($userId != $this->auth->id) {
            $this->checkFamilyPermission($userId);
        }

        // 确定时间范围
        if ($reportType === 'weekly') {
            $startTime = strtotime($startDate ?: date('Y-m-d', strtotime('monday this week')));
            $endTime = $startTime + 7 * 86400 - 1;
        } elseif ($reportType === 'monthly') {
            $month = $startDate ?: date('Y-m');
            $startTime = strtotime($month . '-01');
            $endTime = strtotime(date('Y-m-t', $startTime) . ' 23:59:59');
        } else {
            // 自定义时间范围
            if (!$startDate || !$endDate) {
                $this->error('自定义时间范围需要提供开始和结束日期');
            }
            $startTime = strtotime($startDate);
            $endTime = strtotime($endDate . ' 23:59:59');
        }

        // 生成报告数据
        $reportData = [
            'user_id' => $userId,
            'type' => $reportType,
            'start_date' => date('Y-m-d', $startTime),
            'end_date' => date('Y-m-d', $endTime),
            'generated_at' => date('Y-m-d H:i:s'),
            'sections' => [],
        ];

        // 根据请求的章节生成数据
        $sections = empty($includeSections) ?
            ['task', 'energy', 'badge', 'wish', 'trend'] :
            $includeSections;

        if (in_array('task', $sections)) {
            $reportData['sections']['task'] = $this->getTaskStats($userId, $startTime, $endTime);
        }
        if (in_array('energy', $sections)) {
            $reportData['sections']['energy'] = $this->getEnergyStats($userId, $startTime, $endTime);
        }
        if (in_array('badge', $sections)) {
            $reportData['sections']['badge'] = $this->getBadgeStats($userId, $startTime, $endTime);
        }
        if (in_array('wish', $sections)) {
            $reportData['sections']['wish'] = $this->getWishStats($userId, $startTime, $endTime);
        }
        if (in_array('trend', $sections)) {
            $reportData['sections']['trend'] = $this->getDailyTrend($userId, $startTime, $endTime);
        }

        $this->success('报告生成成功', $reportData);
    }

    /**
     * 导出报告
     * POST /api/report/export
     */
    public function export()
    {
        $userId = $this->request->post('user_id', $this->auth->id);
        $reportType = $this->request->post('type', 'weekly');
        $format = $this->request->post('format', 'json'); // json, pdf, excel
        $startDate = $this->request->post('start_date');
        $endDate = $this->request->post('end_date');

        // 检查权限
        if ($userId != $this->auth->id) {
            $this->checkFamilyPermission($userId);
        }

        // 确定时间范围
        if ($reportType === 'weekly') {
            $startTime = strtotime($startDate ?: date('Y-m-d', strtotime('monday this week')));
            $endTime = $startTime + 7 * 86400 - 1;
        } elseif ($reportType === 'monthly') {
            $month = $startDate ?: date('Y-m');
            $startTime = strtotime($month . '-01');
            $endTime = strtotime(date('Y-m-t', $startTime) . ' 23:59:59');
        } else {
            if (!$startDate || !$endDate) {
                $this->error('自定义时间范围需要提供开始和结束日期');
            }
            $startTime = strtotime($startDate);
            $endTime = strtotime($endDate . ' 23:59:59');
        }

        // 生成报告数据
        $reportData = [
            'user_id' => $userId,
            'type' => $reportType,
            'start_date' => date('Y-m-d', $startTime),
            'end_date' => date('Y-m-d', $endTime),
            'generated_at' => date('Y-m-d H:i:s'),
            'task' => $this->getTaskStats($userId, $startTime, $endTime),
            'energy' => $this->getEnergyStats($userId, $startTime, $endTime),
            'badge' => $this->getBadgeStats($userId, $startTime, $endTime),
            'wish' => $this->getWishStats($userId, $startTime, $endTime),
            'trend' => $this->getDailyTrend($userId, $startTime, $endTime),
        ];

        // 根据格式导出
        switch ($format) {
            case 'json':
                $this->success('导出成功', $reportData);
                break;

            case 'excel':
                // 生成 Excel 文件（需要 PHPExcel 库）
                // 这里简化处理，返回数据供前端处理
                $this->success('Excel 导出功能需要集成 PHPExcel 库', [
                    'download_url' => '/report/download/' . md5(json_encode($reportData)),
                    'data' => $reportData,
                ]);
                break;

            case 'pdf':
                // 生成 PDF 文件（需要 TCPDF 或 mPDF 库）
                // 这里简化处理，返回数据供前端处理
                $this->success('PDF 导出功能需要集成 PDF 生成库', [
                    'download_url' => '/report/download/' . md5(json_encode($reportData)),
                    'data' => $reportData,
                ]);
                break;

            default:
                $this->error('不支持的导出格式');
        }
    }
}

