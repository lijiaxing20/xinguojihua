<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Wish as WishModel;
use app\common\model\EnergyLog;
use app\common\model\Notification;
use think\Validate;

/**
 * 心愿相关接口
 *
 * 对应前端 services/wish.ts 中的接口定义
 */
class Wish extends Api
{
    // 所有接口都需要登录
    protected $noNeedLogin = [];
    // 无需单独鉴权（只要登录即可）
    protected $noNeedRight = '*';

    /**
     * 心愿列表
     *
     * GET /api/wish/list
     */
    public function list()
    {
        $status = $this->request->get('status', '');
        $keyword = $this->request->get('keyword', '');
        $targetUserId = $this->request->get('user_id', '');
        $sort = $this->request->get('sort', 'id');
        $order = $this->request->get('order', 'desc');
        $page   = (int)$this->request->get('page', 1);
        $limit  = (int)$this->request->get('limit', 10);

        // 获取当前用户家庭信息
        $member = \app\common\model\FamilyMember::where('user_id', $this->auth->id)->find();

        $query = WishModel::alias('w');

        if ($member && $member['role_in_family'] === 'parent') {
            // 如果是家长，查看家庭下的所有心愿
            $query->where('family_id', $member['family_id']);
            // 如果指定了用户ID，则筛选该用户的心愿
            if ($targetUserId !== '') {
                $query->where('user_id', $targetUserId);
            }
        } else {
            // 如果是孩子或未加入家庭，只看自己的
            $query->where('user_id', $this->auth->id);
        }

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($keyword !== '') {
            $query->where('wish_name|description', 'like', "%{$keyword}%");
        }

        // 允许的排序字段
        $allowedSorts = ['id', 'createtime', 'updatetime', 'required_energy', 'status', 'wish_name'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }
        $order = strtolower($order) === 'asc' ? 'asc' : 'desc';

        // 使用 paginate 自动处理总数
        $list = $query->order($sort, $order)
            ->paginate($limit, false, ['page' => $page]);

        $this->success('', [
            'list'  => $list->items(),
            'total' => $list->total(),
        ]);
    }

    /**
     * 心愿详情
     *
     * GET /api/wish/detail/{id}
     */
    public function detail($id = 0)
    {
        $wish = WishModel::get($id);
        if (!$wish) {
            $this->error('心愿不存在');
        }

        // 权限检查
        $hasPermission = false;
        
        // 1. 自己的心愿
        if ((int)$wish['user_id'] === (int)$this->auth->id) {
            $hasPermission = true;
        } else {
            // 2. 家庭家长
            $member = \app\common\model\FamilyMember::where('user_id', $this->auth->id)->find();
            if ($member && $member['role_in_family'] === 'parent' && (int)$member['family_id'] === (int)$wish['family_id']) {
                $hasPermission = true;
            }
        }

        if (!$hasPermission) {
            $this->error('无权限查看该心愿');
        }

        $this->success('', $wish);
    }

    /**
     * 创建心愿（孩子端）
     *
     * POST /api/wish/create
     */
    public function create()
    {
        $params = $this->request->post();

        $rule = [
            'wish_name' => 'require|max:255',
        ];
        $msg = [
            'wish_name.require' => '心愿名称不能为空',
            'wish_name.max'     => '心愿名称最多255个字符',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        // 获取用户的家庭ID
        $familyId = \app\common\model\FamilyMember::getUserFamilyId($this->auth->id) ?? 0;
        
        $wish                  = new WishModel();
        $wish->user_id         = $this->auth->id;
        $wish->family_id       = $familyId;
        $wish->wish_name       = $params['wish_name'];
        $wish->description     = isset($params['description']) ? $params['description'] : '';
        $wish->required_energy = isset($params['required_energy']) ? (int)$params['required_energy'] : 0;
        $wish->status          = 'pending';
        $wish->save();

        // 通知家长有新心愿待审核
        if ($familyId > 0) {
            $parentIds = \app\common\model\FamilyMember::getFamilyParentIds($familyId);
            foreach ($parentIds as $parentId) {
                Notification::createNotification(
                    $parentId,
                    Notification::TYPE_WISH,
                    '新心愿待审核',
                    "您的孩子创建了新心愿「{$params['wish_name']}」，请及时审核",
                    $wish->id
                );
            }
        }

        $this->success('心愿创建成功', $wish);
    }

    /**
     * 审核心愿（家长端）
     *
     * POST /api/wish/review/{id}
     */
    public function review($id = 0)
    {
        $wish = WishModel::get($id);
        if (!$wish) {
            $this->error('心愿不存在');
        }

        // 检查权限：只有同一家庭的家长可以审核
        $member = \app\common\model\FamilyMember::where('user_id', $this->auth->id)->find();
        if (!$member || $member['role_in_family'] !== 'parent' || (int)$member['family_id'] !== (int)$wish['family_id']) {
            $this->error('无权限审核该心愿');
        }

        $params = $this->request->post();

        $rule = [
            'action' => 'require|in:approve,reject',
        ];
        $msg = [
            'action.require' => '操作类型不能为空',
            'action.in'      => '操作类型不合法',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        if ($params['action'] === 'approve') {
            $wish->status          = 'approved';
            $wish->required_energy = isset($params['required_energy']) ? (int)$params['required_energy'] : $wish->required_energy;
        } else {
            $wish->status = 'rejected';
            if (isset($params['reason']) && $params['reason']) {
                $wish->description = $wish->description . "\n\n家长说明：" . $params['reason'];
            }
        }

        $wish->save();

        // 通知孩子审核结果
        if ($params['action'] === 'approve') {
            Notification::createNotification(
                $wish['user_id'],
                Notification::TYPE_WISH,
                '心愿审核通过',
                "您的心愿「{$wish['wish_name']}」已通过审核，所需能量值：{$wish['required_energy']}",
                $wish['id']
            );
        } else {
            Notification::createNotification(
                $wish['user_id'],
                Notification::TYPE_WISH,
                '心愿审核未通过',
                "您的心愿「{$wish['wish_name']}」未通过审核" . (isset($params['reason']) ? "：" . $params['reason'] : ''),
                $wish['id']
            );
        }

        $this->success('操作成功', $wish);
    }

    /**
     * 申请实现心愿（孩子端）
     *
     * POST /api/wish/fulfill/{id}
     */
    public function fulfill($id = 0)
    {
        $wish = WishModel::get($id);
        if (!$wish) {
            $this->error('心愿不存在');
        }

        if ((int)$wish['user_id'] !== (int)$this->auth->id) {
            $this->error('无权限操作该心愿');
        }

        if ($wish['status'] !== 'approved') {
            $this->error('心愿尚未审核通过');
        }

        // 检查能量值是否足够
        $userEnergy = EnergyLog::getUserEnergy($this->auth->id);
        if ($userEnergy < $wish['required_energy']) {
            $this->error('能量值不足，当前：' . $userEnergy . '，需要：' . $wish['required_energy']);
        }

        $wish->status = 'approved'; // 标记为待家长确认
        $wish->save();

        // 通知家长孩子申请实现心愿
        if ($wish->family_id > 0) {
            $parentIds = \app\common\model\FamilyMember::getFamilyParentIds($wish->family_id);
            foreach ($parentIds as $parentId) {
                Notification::createNotification(
                    $parentId,
                    Notification::TYPE_WISH,
                    '孩子申请实现心愿',
                    "您的孩子申请实现心愿「{$wish['wish_name']}」，请及时确认",
                    $wish->id
                );
            }
        }

        $this->success('申请已提交，等待家长确认', $wish);
    }

    /**
     * 确认心愿实现（家长端）
     *
     * POST /api/wish/confirm/{id}
     */
    public function confirm($id = 0)
    {
        $wish = WishModel::get($id);
        if (!$wish) {
            $this->error('心愿不存在');
        }

        // 扣除能量值
        $energyCost = $wish['required_energy'];
        $userEnergy = EnergyLog::getUserEnergy($wish['user_id']);
        
        if ($userEnergy < $energyCost) {
            $this->error('能量值不足');
        }

        // 扣除能量值
        EnergyLog::changeEnergy($wish['user_id'], -$energyCost, EnergyLog::REASON_WISH_FULFILL, $wish['id']);

        $wish->status       = 'fulfilled';
        $wish->fulfilled_at = time();
        $wish->save();

        // 通知孩子心愿已实现
        Notification::createNotification(
            $wish['user_id'],
            Notification::TYPE_WISH,
            '心愿已实现',
            "恭喜！您的心愿「{$wish['wish_name']}」已实现！",
            $wish['id']
        );

        $this->success('心愿已标记为已实现', $wish);
    }

    /**
     * 更新心愿
     *
     * PUT /api/wish/update/{id}
     */
    public function update($id = 0)
    {
        $wish = WishModel::get($id);
        if (!$wish) {
            $this->error('心愿不存在');
        }

        if ((int)$wish['user_id'] !== (int)$this->auth->id) {
            $this->error('无权限编辑该心愿');
        }

        $params = $this->request->put();

        $allowFields = ['wish_name', 'description'];

        foreach ($allowFields as $field) {
            if (isset($params[$field])) {
                $wish[$field] = $params[$field];
            }
        }

        $wish->save();

        $this->success('更新成功', $wish);
    }

    /**
     * 删除心愿
     *
     * DELETE /api/wish/delete/{id}
     */
    public function delete($id = 0)
    {
        $wish = WishModel::get($id);
        if (!$wish) {
            $this->error('心愿不存在');
        }

        if ((int)$wish['user_id'] !== (int)$this->auth->id) {
            $this->error('无权限删除该心愿');
        }

        $wish->delete();

        $this->success('删除成功');
    }
}


