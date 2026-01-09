<?php

namespace app\api\controller;

use app\common\controller\Api;

/**
 * 数据字典接口
 * 提供系统中使用的各种枚举值和配置信息
 */
class Dictionary extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = '*';

    /**
     * 获取任务分类字典
     * GET /api/dictionary/task_categories
     */
    public function task_categories()
    {
        $categories = [
            [
                'value' => 'habit',
                'label' => '习惯养成',
                'description' => '培养良好的日常习惯',
                'icon' => 'fa-calendar-check',
                'color' => '#4CAF50',
            ],
            [
                'value' => 'learning',
                'label' => '学习探索',
                'description' => '探索知识和新技能',
                'icon' => 'fa-book',
                'color' => '#2196F3',
            ],
            [
                'value' => 'interest',
                'label' => '兴趣技能',
                'description' => '发展个人兴趣和特长',
                'icon' => 'fa-palette',
                'color' => '#FF9800',
            ],
            [
                'value' => 'family',
                'label' => '家庭贡献',
                'description' => '参与家庭事务和贡献',
                'icon' => 'fa-home',
                'color' => '#9C27B0',
            ],
        ];

        $this->success('', $categories);
    }

    /**
     * 获取任务状态字典
     * GET /api/dictionary/task_status
     */
    public function task_status()
    {
        $statuses = [
            [
                'value' => 'pending',
                'label' => '待确认',
                'description' => '家长建议的任务，等待孩子确认',
                'color' => '#FF9800',
                'can_delete' => true,
            ],
            [
                'value' => 'confirmed',
                'label' => '已确认',
                'description' => '任务已确认，等待执行',
                'color' => '#2196F3',
                'can_delete' => true,
            ],
            [
                'value' => 'in_progress',
                'label' => '进行中',
                'description' => '任务正在执行中',
                'color' => '#00BCD4',
                'can_delete' => false,
            ],
            [
                'value' => 'completed',
                'label' => '已完成',
                'description' => '任务已完成并审核通过',
                'color' => '#4CAF50',
                'can_delete' => false,
            ],
            [
                'value' => 'rejected',
                'label' => '已拒绝',
                'description' => '孩子拒绝了家长建议的任务',
                'color' => '#F44336',
                'can_delete' => true,
            ],
        ];

        $this->success('', $statuses);
    }

    /**
     * 获取勋章类型字典
     * GET /api/dictionary/badge_types
     */
    public function badge_types()
    {
        $types = [
            [
                'value' => 'persistence',
                'label' => '坚持勋章',
                'description' => '连续完成任务或坚持打卡获得',
                'icon' => 'fa-calendar-check',
                'color' => '#4CAF50',
            ],
            [
                'value' => 'exploration',
                'label' => '探索勋章',
                'description' => '尝试不同类别的任务获得',
                'icon' => 'fa-compass',
                'color' => '#2196F3',
            ],
            [
                'value' => 'creativity',
                'label' => '创意勋章',
                'description' => '创作优质打卡内容获得',
                'icon' => 'fa-lightbulb',
                'color' => '#FF9800',
            ],
            [
                'value' => 'energy',
                'label' => '能量勋章',
                'description' => '积累能量值达到一定数量获得',
                'icon' => 'fa-bolt',
                'color' => '#FFC107',
            ],
        ];

        $this->success('', $types);
    }

    /**
     * 获取通知类型字典
     * GET /api/dictionary/notification_types
     */
    public function notification_types()
    {
        $types = [
            [
                'value' => 'task',
                'label' => '任务通知',
                'description' => '任务相关的通知',
                'icon' => 'fa-tasks',
                'color' => '#2196F3',
            ],
            [
                'value' => 'wish',
                'label' => '心愿通知',
                'description' => '心愿相关的通知',
                'icon' => 'fa-heart',
                'color' => '#E91E63',
            ],
            [
                'value' => 'badge',
                'label' => '勋章通知',
                'description' => '获得勋章的通知',
                'icon' => 'fa-trophy',
                'color' => '#FF9800',
            ],
            [
                'value' => 'feedback',
                'label' => '反馈通知',
                'description' => '家长反馈的通知',
                'icon' => 'fa-comment',
                'color' => '#4CAF50',
            ],
            [
                'value' => 'system',
                'label' => '系统通知',
                'description' => '系统相关的通知',
                'icon' => 'fa-bell',
                'color' => '#9C27B0',
            ],
        ];

        $this->success('', $types);
    }

    /**
     * 获取能量值规则字典
     * GET /api/dictionary/energy_rules
     */
    public function energy_rules()
    {
        $rules = [
            [
                'action' => 'task_complete',
                'label' => '完成任务',
                'description' => '完成一个任务获得的能量值',
                'default_value' => 10,
                'min_value' => 1,
                'max_value' => 100,
            ],
            [
                'action' => 'checkin_bonus',
                'label' => '打卡奖励',
                'description' => '任务打卡时的额外奖励',
                'default_value' => 5,
                'min_value' => 1,
                'max_value' => 50,
            ],
            [
                'action' => 'badge_award',
                'label' => '勋章奖励',
                'description' => '获得勋章时的奖励',
                'default_value' => 20,
                'min_value' => 5,
                'max_value' => 200,
            ],
            [
                'action' => 'wish_fulfill',
                'label' => '兑换心愿',
                'description' => '兑换心愿时消耗的能量值',
                'default_value' => -50,
                'min_value' => -1000,
                'max_value' => -10,
            ],
        ];

        $this->success('', $rules);
    }

    /**
     * 获取打卡内容类型字典
     * GET /api/dictionary/content_types
     */
    public function content_types()
    {
        $types = [
            [
                'value' => 'text',
                'label' => '文字',
                'description' => '纯文字内容',
                'icon' => 'fa-font',
                'accept_file' => false,
            ],
            [
                'value' => 'image',
                'label' => '图片',
                'description' => '图片内容',
                'icon' => 'fa-image',
                'accept_file' => true,
                'file_types' => ['jpg', 'jpeg', 'png', 'gif'],
                'max_size' => 5 * 1024 * 1024, // 5MB
            ],
            [
                'value' => 'video',
                'label' => '视频',
                'description' => '视频内容',
                'icon' => 'fa-video',
                'accept_file' => true,
                'file_types' => ['mp4', 'mov', 'avi'],
                'max_size' => 50 * 1024 * 1024, // 50MB
            ],
            [
                'value' => 'diary',
                'label' => '日记',
                'description' => '日记形式的记录',
                'icon' => 'fa-book-open',
                'accept_file' => false,
            ],
        ];

        $this->success('', $types);
    }

    /**
     * 获取家长反馈表情类型字典
     * GET /api/dictionary/emoji_types
     */
    public function emoji_types()
    {
        $types = [
            [
                'value' => 'like',
                'label' => '点赞',
                'emoji' => '👍',
                'description' => '做得很好',
                'color' => '#4CAF50',
            ],
            [
                'value' => 'hug',
                'label' => '拥抱',
                'emoji' => '🤗',
                'description' => '给你一个拥抱',
                'color' => '#E91E63',
            ],
            [
                'value' => 'cheer',
                'label' => '加油',
                'emoji' => '💪',
                'description' => '继续努力',
                'color' => '#2196F3',
            ],
            [
                'value' => 'praise',
                'label' => '表扬',
                'emoji' => '🌟',
                'description' => '你真棒',
                'color' => '#FF9800',
            ],
        ];

        $this->success('', $types);
    }

    /**
     * 获取用户角色字典
     * GET /api/dictionary/user_roles
     */
    public function user_roles()
    {
        $roles = [
            [
                'value' => 'parent',
                'label' => '家长',
                'description' => '家庭的家长角色',
                'icon' => 'fa-user-tie',
                'color' => '#2196F3',
                'permissions' => [
                    'create_task_suggestion',
                    'review_task',
                    'provide_feedback',
                    'review_wish',
                    'view_all_family_data',
                ],
            ],
            [
                'value' => 'child',
                'label' => '孩子',
                'description' => '家庭的孩子角色',
                'icon' => 'fa-child',
                'color' => '#4CAF50',
                'permissions' => [
                    'create_own_task',
                    'checkin_task',
                    'create_wish',
                    'view_own_data',
                ],
            ],
        ];

        $this->success('', $roles);
    }

    /**
     * 获取所有字典数据（一次性获取）
     * GET /api/dictionary/all
     */
    public function all()
    {
        $data = [
            'task_categories' => $this->task_categories_data(),
            'task_status' => $this->task_status_data(),
            'badge_types' => $this->badge_types_data(),
            'notification_types' => $this->notification_types_data(),
            'energy_rules' => $this->energy_rules_data(),
            'content_types' => $this->content_types_data(),
            'emoji_types' => $this->emoji_types_data(),
            'user_roles' => $this->user_roles_data(),
        ];

        $this->success('', $data);
    }

    // 私有方法：返回字典数据（不直接输出）
    private function task_categories_data()
    {
        return [
            ['value' => 'habit', 'label' => '习惯养成', 'icon' => 'fa-calendar-check', 'color' => '#4CAF50'],
            ['value' => 'learning', 'label' => '学习探索', 'icon' => 'fa-book', 'color' => '#2196F3'],
            ['value' => 'interest', 'label' => '兴趣技能', 'icon' => 'fa-palette', 'color' => '#FF9800'],
            ['value' => 'family', 'label' => '家庭贡献', 'icon' => 'fa-home', 'color' => '#9C27B0'],
        ];
    }

    private function task_status_data()
    {
        return [
            ['value' => 'pending', 'label' => '待确认', 'color' => '#FF9800'],
            ['value' => 'confirmed', 'label' => '已确认', 'color' => '#2196F3'],
            ['value' => 'in_progress', 'label' => '进行中', 'color' => '#00BCD4'],
            ['value' => 'completed', 'label' => '已完成', 'color' => '#4CAF50'],
            ['value' => 'rejected', 'label' => '已拒绝', 'color' => '#F44336'],
        ];
    }

    private function badge_types_data()
    {
        return [
            ['value' => 'persistence', 'label' => '坚持勋章', 'icon' => 'fa-calendar-check'],
            ['value' => 'exploration', 'label' => '探索勋章', 'icon' => 'fa-compass'],
            ['value' => 'creativity', 'label' => '创意勋章', 'icon' => 'fa-lightbulb'],
            ['value' => 'energy', 'label' => '能量勋章', 'icon' => 'fa-bolt'],
        ];
    }

    private function notification_types_data()
    {
        return [
            ['value' => 'task', 'label' => '任务通知', 'icon' => 'fa-tasks'],
            ['value' => 'wish', 'label' => '心愿通知', 'icon' => 'fa-heart'],
            ['value' => 'badge', 'label' => '勋章通知', 'icon' => 'fa-trophy'],
            ['value' => 'feedback', 'label' => '反馈通知', 'icon' => 'fa-comment'],
            ['value' => 'system', 'label' => '系统通知', 'icon' => 'fa-bell'],
        ];
    }

    private function energy_rules_data()
    {
        return [
            ['action' => 'task_complete', 'label' => '完成任务', 'default_value' => 10],
            ['action' => 'checkin_bonus', 'label' => '打卡奖励', 'default_value' => 5],
            ['action' => 'badge_award', 'label' => '勋章奖励', 'default_value' => 20],
            ['action' => 'wish_fulfill', 'label' => '兑换心愿', 'default_value' => -50],
        ];
    }

    private function content_types_data()
    {
        return [
            ['value' => 'text', 'label' => '文字', 'icon' => 'fa-font'],
            ['value' => 'image', 'label' => '图片', 'icon' => 'fa-image'],
            ['value' => 'video', 'label' => '视频', 'icon' => 'fa-video'],
            ['value' => 'diary', 'label' => '日记', 'icon' => 'fa-book-open'],
        ];
    }

    private function emoji_types_data()
    {
        return [
            ['value' => 'like', 'label' => '点赞', 'emoji' => '👍'],
            ['value' => 'hug', 'label' => '拥抱', 'emoji' => '🤗'],
            ['value' => 'cheer', 'label' => '加油', 'emoji' => '💪'],
            ['value' => 'praise', 'label' => '表扬', 'emoji' => '🌟'],
        ];
    }

    private function user_roles_data()
    {
        return [
            ['value' => 'parent', 'label' => '家长', 'icon' => 'fa-user-tie'],
            ['value' => 'child', 'label' => '孩子', 'icon' => 'fa-child'],
        ];
    }
}
