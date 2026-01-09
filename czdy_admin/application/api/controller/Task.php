<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Task as TaskModel;
use app\common\model\TaskCheckin as TaskCheckinModel;
use app\common\model\ParentFeedback as ParentFeedbackModel;
use app\common\model\EnergyLog;
use app\common\model\Notification;
use app\common\model\Badge;
use think\Validate;

/**
 * 任务相关接口
 *
 * 对应前端 services/task.ts 中的接口定义
 */
class Task extends Api
{
    // 所有接口都需要登录
    protected $noNeedLogin = [];
    // 无需单独鉴权（只要登录即可）
    protected $noNeedRight = '*';

    /**
     * 任务列表
     *
     * GET /api/task/list
     */
    public function list()
    {
        $status   = $this->request->get('status', '');
        $category = $this->request->get('category', '');
        $keyword  = $this->request->get('keyword', '');
        $assigneeId = $this->request->get('assignee_id', '');
        $page     = (int)$this->request->get('page', 1);
        $limit    = (int)$this->request->get('limit', 10);
        $sort     = $this->request->get('sort', 'id');
        $order    = $this->request->get('order', 'desc');

        // 获取当前用户家庭信息
        $member = \app\common\model\FamilyMember::where('user_id', $this->auth->id)->find();

        $query = TaskModel::alias('t');

        if ($member && $member['role_in_family'] === 'parent') {
            // 如果是家长，查看家庭下的所有任务
            $query->where('family_id', $member['family_id']);
            // 如果指定了assignee_id，则筛选该孩子的任务
            if ($assigneeId !== '') {
                $query->where('assignee_user_id', $assigneeId);
            }
        } else {
            // 如果是孩子或未加入家庭，只看分配给自己的
            $query->where('assignee_user_id', $this->auth->id);
        }

        if ($status !== '') {
            $query->where('status', $status);
        }
        if ($category !== '') {
            $query->where('category', $category);
        }
        if ($keyword !== '') {
            $query->where('task_name|description', 'like', "%{$keyword}%");
        }

        // 允许的排序字段
        $allowedSorts = ['id', 'createtime', 'updatetime', 'target_date', 'energy_value', 'status', 'category', 'task_name'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }
        // 允许的排序方向
        $order = strtolower($order) === 'asc' ? 'asc' : 'desc';

        $list = $query->order($sort, $order)
            ->paginate($limit, false, ['page' => $page]);

        $this->success('', [
            'list'  => $list->items(),
            'total' => $list->total(),
        ]);
    }

    /**
     * 任务详情
     *
     * GET /api/task/detail/{id}
     */
    public function detail($id = 0)
    {
        $task = TaskModel::get($id);
        if (!$task) {
            $this->error('任务不存在');
        }

        // 权限检查
        $hasPermission = false;
        
        // 1. 任务相关人（创建者或执行者）
        if ((int)$task['assignee_user_id'] === (int)$this->auth->id || (int)$task['creator_user_id'] === (int)$this->auth->id) {
            $hasPermission = true;
        } else {
            // 2. 家庭家长
            $member = \app\common\model\FamilyMember::where('user_id', $this->auth->id)->find();
            if ($member && $member['role_in_family'] === 'parent' && (int)$member['family_id'] === (int)$task['family_id']) {
                $hasPermission = true;
            }
        }

        if (!$hasPermission) {
            $this->error('无权限查看该任务');
        }

        // 获取创建者和执行者信息
        $creator = \app\common\model\User::get($task['creator_user_id']);
        $task['creator_name'] = $creator ? $creator->nickname : 'Unknown';
        $task['creator_avatar'] = $creator ? $creator->avatar : '';

        $assignee = \app\common\model\User::get($task['assignee_user_id']);
        $task['assignee_name'] = $assignee ? $assignee->nickname : 'Unknown';
        $task['assignee_avatar'] = $assignee ? $assignee->avatar : '';

        // 加载打卡记录
        $checkins = TaskCheckinModel::where('task_id', $task['id'])
            ->order('id', 'desc')
            ->select();

        foreach ($checkins as &$checkin) {
             $user = \app\common\model\User::get($checkin['user_id']);
             $checkin['user_name'] = $user ? $user->nickname : '';
             $checkin['user_avatar'] = $user ? $user->avatar : '';

             $feedback = ParentFeedbackModel::where('checkin_id', $checkin['id'])->find();
             if ($feedback) {
                 $parent = \app\common\model\User::get($feedback['parent_user_id']);
                 $feedback['parent_name'] = $parent ? $parent->nickname : '';
                 $feedback['parent_avatar'] = $parent ? $parent->avatar : '';
                 $checkin['parent_feedback'] = $feedback;
             }
        }
        unset($checkin);

        $task['checkins'] = $checkins;

        $this->success('', $task);
    }

    /**
     * 创建任务（孩子端）
     *
     * POST /api/task/create
     */
    public function create()
    {
        $params = $this->request->post();

        $rule = [
            'task_name' => 'require|max:255',
            'category'  => 'require',
        ];
        $msg = [
            'task_name.require' => '任务名称不能为空',
            'task_name.max'     => '任务名称最多255个字符',
            'category.require'  => '任务分类不能为空',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        // 获取用户的家庭ID
        $familyId = \app\common\model\FamilyMember::getUserFamilyId($this->auth->id) ?? 0;
        
        $task          = new TaskModel();
        $task->data([
            'family_id'        => $familyId,
            'creator_user_id'  => $this->auth->id,
            'assignee_user_id' => $this->auth->id,
            'task_name'        => $params['task_name'],
            'description'      => isset($params['description']) ? $params['description'] : '',
            'category'         => $params['category'],
            'status'           => 'pending',
            'target_date'      => isset($params['target_date']) ? $params['target_date'] : null,
            'energy_value'     => isset($params['energy_value']) ? (int)$params['energy_value'] : 0,
        ]);
        $task->save();
        
        // 通知家长有新任务待确认
        if ($familyId > 0) {
            $parentIds = \app\common\model\FamilyMember::getFamilyParentIds($familyId);
            foreach ($parentIds as $parentId) {
                Notification::createNotification(
                    $parentId,
                    Notification::TYPE_TASK,
                    '新任务待确认',
                    "您的孩子创建了新任务「{$params['task_name']}」，请及时确认",
                    $task->id
                );
            }
        }

        $this->success('创建成功', $task);
    }

    /**
     * 更新任务
     *
     * POST /api/task/update
     */
    public function update()
    {
        $params = $this->request->post();
        $rule = [
            'id'        => 'require|number',
            'task_name' => 'require|max:255',
        ];
        
        $validate = new Validate($rule);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        $task = TaskModel::get($params['id']);
        if (!$task) {
            $this->error('任务不存在');
        }

        // 权限检查：只有创建者或分配者可以修改
        // 或者是家长修改孩子的任务
        if ((int)$task['creator_user_id'] !== (int)$this->auth->id && (int)$task['assignee_user_id'] !== (int)$this->auth->id) {
             // 如果是家长，且任务属于家庭成员
             // 这里简化处理，暂时只允许创建者修改
             $this->error('无权限修改该任务');
        }

        // 更新字段
        if (isset($params['task_name'])) $task->task_name = $params['task_name'];
        if (isset($params['description'])) $task->description = $params['description'];
        if (isset($params['category'])) $task->category = $params['category'];
        if (isset($params['target_date'])) $task->target_date = $params['target_date'];
        if (isset($params['energy_value'])) $task->energy_value = (int)$params['energy_value'];
        
        $task->save();
        
        $this->success('更新成功', $task);
    }

    /**
     * 建议任务（家长端）
     *
     * POST /api/task/suggest
     */
    public function suggest()
    {
        $params = $this->request->post();

        $rule = [
            'task_name'        => 'require|max:255',
            'category'         => 'require',
            'assignee_user_id' => 'require|number',
        ];
        $msg = [
            'task_name.require'        => '任务名称不能为空',
            'task_name.max'            => '任务名称最多255个字符',
            'category.require'         => '任务分类不能为空',
            'assignee_user_id.require' => '请选择孩子',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        // 获取用户的家庭ID
        $familyId = \app\common\model\FamilyMember::getUserFamilyId($this->auth->id) ?? 0;
        
        // 验证被分配的用户是否在同一家庭
        if ($familyId > 0) {
            $assigneeFamilyId = \app\common\model\FamilyMember::getUserFamilyId((int)$params['assignee_user_id']);
            if ($assigneeFamilyId != $familyId) {
                $this->error('只能给同一家庭的孩子分配任务');
            }
        }
        
        $task          = new TaskModel();
        $task->data([
            'family_id'        => $familyId,
            'creator_user_id'  => $this->auth->id,
            'assignee_user_id' => (int)$params['assignee_user_id'],
            'task_name'        => $params['task_name'],
            'description'      => isset($params['description']) ? $params['description'] : '',
            'category'         => $params['category'],
            'status'           => 'pending',
            'target_date'      => isset($params['target_date']) ? $params['target_date'] : null,
            'energy_value'     => isset($params['energy_value']) ? (int)$params['energy_value'] : 0,
        ]);
        $task->save();
        
        // 通知孩子有新任务建议
        Notification::createNotification(
            (int)$params['assignee_user_id'],
            Notification::TYPE_TASK,
            '收到任务建议',
            "家长为您建议了新任务「{$params['task_name']}」，快去看看吧！",
            $task->id
        );

        $this->success('建议任务已创建', $task);
    }

    /**
     * 确认/拒绝任务（家长端）
     *
     * POST /api/task/confirm/{id}
     */
    public function confirm($id = 0)
    {
        $task = TaskModel::get($id);
        if (!$task) {
            $this->error('任务不存在');
        }

        $action     = $this->request->post('action', 'confirm');
        $suggestion = $this->request->post('suggestion', '');

        if ($action === 'confirm') {
            $task->status = 'confirmed';
        } elseif ($action === 'reject') {
            $task->status = 'rejected';
        } else {
            $this->error('非法操作类型');
        }

        if ($suggestion) {
            $task->description = $task->description . "\n\n家长建议：" . $suggestion;
        }

        $task->save();

        $task->save();

        // 通知孩子任务确认结果
        if ($action === 'confirm') {
            Notification::createNotification(
                $task['assignee_user_id'],
                Notification::TYPE_TASK,
                '任务已确认',
                "您的任务「{$task['task_name']}」已通过家长确认，可以开始执行了！",
                $task['id']
            );
        } else {
            Notification::createNotification(
                $task['assignee_user_id'],
                Notification::TYPE_TASK,
                '任务需要修改',
                "您的任务「{$task['task_name']}」需要修改：" . ($suggestion ?: '请查看详情'),
                $task['id']
            );
        }

        $this->success('操作成功');
    }

    /**
     * 任务打卡
     *
     * POST /api/task/checkin/{id}
     */
    public function checkin($id = 0)
    {
        $task = TaskModel::get($id);
        if (!$task) {
            $this->error('任务不存在');
        }

        // 只能任务执行人打卡
        if ((int)$task['assignee_user_id'] !== (int)$this->auth->id) {
            $this->error('只能为自己的任务打卡');
        }

        $params = $this->request->post();

        $rule = [
            'content_type' => 'require|in:text,image,video,diary',
        ];
        $msg = [
            'content_type.require' => '内容类型不能为空',
            'content_type.in'      => '内容类型不合法',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        $checkin                  = new TaskCheckinModel();
        $checkin->task_id         = $task['id'];
        $checkin->user_id         = $this->auth->id;
        $checkin->content_type    = $params['content_type'];
        $checkin->content_url     = isset($params['content_url']) ? $params['content_url'] : '';
        $checkin->text_content    = isset($params['text_content']) ? $params['text_content'] : '';
        $checkin->checkin_time    = time();
        
        // 计算能量值（根据任务类型和难度，这里简化处理，默认10能量值）
        $energyAwarded = $task['energy_value'] > 0 ? $task['energy_value'] : 10;
        $checkin->energy_awarded = $energyAwarded;
        
        // 增加用户能量值
        EnergyLog::changeEnergy($this->auth->id, $energyAwarded, EnergyLog::REASON_TASK_COMPLETE, $task['id']);
        
        // 检查并授予徽章
        $badgeAwarded = null;
        // 检查连续打卡徽章
        $consecutiveDays = $this->getConsecutiveCheckinDays($this->auth->id);
        if ($consecutiveDays >= 7) {
            $badgeAwarded = Badge::checkAndAward($this->auth->id, 'persistence');
            if ($badgeAwarded) {
                $checkin->badge_awarded_id = $badgeAwarded->badge_id;
            }
        }
        
        // 检查探索家徽章（首次尝试新分类）
        $this->checkExplorerBadge($this->auth->id, $task['category']);
        
        $checkin->badge_awarded_id = $badgeAwarded ? $badgeAwarded->badge_id : 0;
        $checkin->save();

        // 将任务状态更新为进行中
        if ($task['status'] === 'confirmed' || $task['status'] === 'pending') {
            $task->status = 'in_progress';
            $task->save();
        }

        // 通知家长有新打卡
        $this->notifyParentForCheckin($task, $checkin);

        $this->success('打卡成功', $checkin);
    }

    /**
     * 家长反馈
     *
     * POST /api/task/feedback/{checkin_id}
     */
    public function feedback($checkin_id = 0)
    {
        $checkin = TaskCheckinModel::get($checkin_id);
        if (!$checkin) {
            $this->error('打卡记录不存在');
        }

        $params = $this->request->post();

        $rule = [
            'feedback_content' => 'require',
        ];
        $msg = [
            'feedback_content.require' => '反馈内容不能为空',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        $feedback                     = new ParentFeedbackModel();
        $feedback->checkin_id         = $checkin['id'];
        $feedback->parent_user_id     = $this->auth->id;
        $feedback->feedback_content   = $params['feedback_content'];
        $feedback->emoji_type         = isset($params['emoji_type']) ? $params['emoji_type'] : '';
        $feedback->createtime         = time();
        $feedback->save();

        // 通知孩子收到家长反馈
        Notification::createNotification(
            $checkin['user_id'],
            Notification::TYPE_FEEDBACK,
            '收到家长反馈',
            $params['feedback_content'],
            $checkin['id']
        );

        $this->success('反馈已提交', $feedback);
    }



    /**
     * 获取作品墙（打卡记录）
     * GET /api/task/works
     */
    public function works()
    {
        $userId = $this->request->get('user_id');
        $page = (int)$this->request->get('page', 1);
        $limit = (int)$this->request->get('limit', 10);
        
        // 验证权限
        if ($userId && $userId != $this->auth->id) {
            // 这里应该检查家庭关系，暂时简化
        }
        
        $query = TaskCheckinModel::alias('tc')
            ->join('__TASK__ t', 'tc.task_id = t.id')
            ->join('__USER__ u', 'tc.user_id = u.id')
            ->where('tc.content_type', 'in', ['image', 'video', 'diary'])
            ->where('tc.content_url', '<>', '');
            
        if ($userId) {
            $query->where('tc.user_id', $userId);
        } else {
             // 如果是家长，查看家庭下的所有作品
             $member = \app\common\model\FamilyMember::where('user_id', $this->auth->id)->find();
             if ($member && $member['role_in_family'] === 'parent') {
                $familyId = $member['family_id'];
                // 找出家庭所有孩子ID
                $childrenIds = \app\common\model\FamilyMember::where('family_id', $familyId)
                    ->where('role_in_family', 'child')
                    ->column('user_id');
                if (!empty($childrenIds)) {
                    $query->where('tc.user_id', 'in', $childrenIds);
                } else {
                    $query->where('tc.user_id', $this->auth->id); // Fallback
                }
             } else {
                 $query->where('tc.user_id', $this->auth->id);
             }
        }
        
        $list = $query->order('tc.createtime', 'desc')
            ->field('tc.id, tc.user_id, tc.checkin_time, tc.content_type, tc.content_url, tc.text_content, t.task_name, t.category, u.nickname as child_name, u.avatar as child_avatar')
            ->paginate($limit, false, ['page' => $page]);
            
        $this->success('', [
            'list' => $list->items(),
            'total' => $list->total()
        ]);
    }

    /**
     * 删除任务

     *
     * DELETE /api/task/delete/{id}
     */
    public function delete($id = 0)
    {
        $task = TaskModel::get($id);
        if (!$task) {
            $this->error('任务不存在');
        }

        // 只有创建者可以删除
        if ((int)$task['creator_user_id'] !== (int)$this->auth->id) {
            $this->error('无权限删除该任务');
        }

        $task->delete();

        $this->success('删除成功');
    }

    /**
     * 获取连续打卡天数
     * @param int $userId
     * @return int
     */
    private function getConsecutiveCheckinDays($userId)
    {
        $today = strtotime(date('Y-m-d'));
        $days = 0;
        
        for ($i = 0; $i < 30; $i++) {
            $checkDate = $today - ($i * 86400);
            $hasCheckin = TaskCheckinModel::where('user_id', $userId)
                ->where('checkin_time', '>=', $checkDate)
                ->where('checkin_time', '<', $checkDate + 86400)
                ->count();
            
            if ($hasCheckin > 0) {
                $days++;
            } else {
                break;
            }
        }
        
        return $days;
    }

    /**
     * 检查探索家徽章
     * @param int $userId
     * @param string $category
     */
    private function checkExplorerBadge($userId, $category)
    {
        // 检查是否首次尝试该分类
        $firstCheckin = TaskCheckinModel::alias('c')
            ->join('__TASK__ t', 'c.task_id = t.id')
            ->where('c.user_id', $userId)
            ->where('t.category', $category)
            ->count();
        
        if ($firstCheckin == 1) {
            Badge::checkAndAward($userId, 'explorer');
        }
    }

    /**
     * 通知家长有新打卡
     * @param TaskModel $task
     * @param TaskCheckinModel $checkin
     */
    private function notifyParentForCheckin($task, $checkin)
    {
        // 根据家庭关系找到家长
        $familyId = $task['family_id'];
        if ($familyId > 0) {
            $parentIds = \app\common\model\FamilyMember::getFamilyParentIds($familyId);
            foreach ($parentIds as $parentId) {
                Notification::createNotification(
                    $parentId,
                    Notification::TYPE_TASK,
                    '孩子有新打卡',
                    "您的孩子完成了任务「{$task['task_name']}」的打卡，快去看看吧！",
                    $task['id']
                );
            }
        }
    }
}


