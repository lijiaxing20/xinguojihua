<?php

namespace app\api\controller;

use app\common\controller\Api;
use app\common\model\Family as FamilyModel;
use app\common\model\FamilyMember as FamilyMemberModel;
use app\common\model\User;
use app\common\model\Notification;
use think\Validate;
use fast\Random;

/**
 * 家庭管理接口
 */
class Family extends Api
{
    protected $noNeedLogin = [];
    protected $noNeedRight = '*';

    public function _initialize()
    {
        parent::_initialize();
        try {
            $columns = \think\Db::query("SHOW COLUMNS FROM fa_family LIKE 'settings'");
            if (empty($columns)) {
                \think\Db::execute("ALTER TABLE fa_family ADD COLUMN settings TEXT COMMENT '家庭设置' AFTER family_name");
            }
        } catch (\Exception $e) {
            // ignore
        }
    }

    /**
     * 获取我的家庭信息
     * GET /api/family/info
     */
    public function info()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        
        if (!$member) {
            $this->success('', ['has_family' => false]);
        }

        $family = FamilyModel::with(['members.user', 'creator'])->find($member->family_id);
        
        if (!$family) {
            $this->success('', ['has_family' => false]);
        }

        // 格式化成员信息
        $members = [];
        foreach ($family->members as $m) {
            $members[] = [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'role' => $m->role_in_family,
                'nickname' => $m->user ? $m->user->nickname : '已删除用户',
                'avatar' => $m->user ? $m->user->avatar : '',
                'joined_at' => $m->joined_at,
                'is_creator' => $family->creator_user_id == $m->user_id,
            ];
        }

        $this->success('', [
            'has_family' => true,
            'family' => [
                'id' => $family->id,
                'family_name' => $family->family_name,
                'creator_user_id' => $family->creator_user_id,
                'settings' => json_decode($family->settings, true),
                'members' => $members,
            ],
        ]);
    }

    /**
     * 创建家庭
     * POST /api/family/create
     */
    public function create()
    {
        // 检查是否已有家庭
        $existingMember = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if ($existingMember) {
            $this->error('您已经属于一个家庭了');
        }

        $familyName = $this->request->post('family_name', '');
        if (empty($familyName)) {
            $familyName = $this->auth->nickname . '的家庭';
        }

        // 创建家庭
        $family = new FamilyModel();
        $family->family_name = $familyName;
        $family->creator_user_id = $this->auth->id;
        $family->save();

        // 添加创建者为家长
        $member = new FamilyMemberModel();
        $member->family_id = $family->id;
        $member->user_id = $this->auth->id;
        $member->role_in_family = 'parent';
        $member->joined_at = time();
        $member->save();

        $this->success('家庭创建成功', [
            'family_id' => $family->id,
            'family_name' => $family->family_name,
        ]);
    }

    /**
     * 邀请家庭成员
     * POST /api/family/invite
     */
    public function invite()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member) {
            $this->error('您还没有加入家庭');
        }

        // 只有家长可以邀请
        if ($member->role_in_family !== 'parent') {
            $this->error('只有家长可以邀请成员');
        }

        $params = $this->request->post();
        $rule = [
            'user_id' => 'require|number',
            'role' => 'require|in:parent,child',
        ];
        $msg = [
            'user_id.require' => '请选择要邀请的用户',
            'role.require' => '请选择角色',
            'role.in' => '角色只能是parent或child',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        $targetUserId = (int)$params['user_id'];
        $role = $params['role'];

        // 检查用户是否存在
        $targetUser = User::get($targetUserId);
        if (!$targetUser) {
            $this->error('用户不存在');
        }

        // 检查用户是否已有家庭
        $existingMember = FamilyMemberModel::where('user_id', $targetUserId)->find();
        if ($existingMember) {
            $this->error('该用户已经属于其他家庭');
        }

        // 检查是否已经是家庭成员
        $isMember = FamilyMemberModel::where('family_id', $member->family_id)
            ->where('user_id', $targetUserId)
            ->find();
        if ($isMember) {
            $this->error('该用户已经是家庭成员');
        }

        // 添加成员
        $newMember = new FamilyMemberModel();
        $newMember->family_id = $member->family_id;
        $newMember->user_id = $targetUserId;
        $newMember->role_in_family = $role;
        $newMember->joined_at = time();
        $newMember->save();

        // 通知被邀请的用户
        $family = FamilyModel::get($member->family_id);
        Notification::createNotification(
            $targetUserId,
            Notification::TYPE_SYSTEM,
            '家庭邀请',
            "您已被邀请加入家庭「{$family->family_name}」",
            0
        );

        $this->success('邀请成功');
    }

    /**
     * 通过手机号或邮箱邀请
     * POST /api/family/invite-by-contact
     */
    public function inviteByContact()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member) {
            $this->error('您还没有加入家庭');
        }

        if ($member->role_in_family !== 'parent') {
            $this->error('只有家长可以邀请成员');
        }

        $params = $this->request->post();
        $rule = [
            'contact' => 'require',
            'role' => 'require|in:parent,child',
        ];
        $msg = [
            'contact.require' => '请输入手机号或邮箱',
            'role.require' => '请选择角色',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        $contact = $params['contact'];
        $role = $params['role'];

        // 查找用户
        $targetUser = null;
        if (Validate::regex($contact, "^1\d{10}$")) {
            // 手机号
            $targetUser = User::getByMobile($contact);
        } elseif (Validate::is($contact, "email")) {
            // 邮箱
            $targetUser = User::getByEmail($contact);
        } else {
            $this->error('请输入正确的手机号或邮箱');
        }

        if (!$targetUser) {
            $this->error('该用户不存在，请先注册');
        }

        // 检查是否已有家庭
        $existingMember = FamilyMemberModel::where('user_id', $targetUser->id)->find();
        if ($existingMember) {
            $this->error('该用户已经属于其他家庭');
        }

        // 添加成员
        $newMember = new FamilyMemberModel();
        $newMember->family_id = $member->family_id;
        $newMember->user_id = $targetUser->id;
        $newMember->role_in_family = $role;
        $newMember->joined_at = time();
        $newMember->save();

        // 通知
        $family = FamilyModel::get($member->family_id);
        Notification::createNotification(
            $targetUser->id,
            Notification::TYPE_SYSTEM,
            '家庭邀请',
            "您已被邀请加入家庭「{$family->family_name}」",
            0
        );

        $this->success('邀请成功');
    }

    /**
     * 获取家庭成员列表
     * GET /api/family/members
     */
    public function members()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member) {
            $this->error('您还没有加入家庭');
        }

        $members = FamilyMemberModel::with('user')
            ->where('family_id', $member->family_id)
            ->select();

        $family = FamilyModel::get($member->family_id);

        $list = [];
        foreach ($members as $m) {
            $list[] = [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'role' => $m->role_in_family,
                'nickname' => $m->user->nickname ?? '',
                'avatar' => $m->user->avatar ?? '',
                'joined_at' => $m->joined_at,
                'is_creator' => $family->creator_user_id == $m->user_id,
            ];
        }

        $this->success('', ['list' => $list]);
    }

    /**
     * 移除家庭成员
     * POST /api/family/remove-member
     */
    public function removeMember()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member) {
            $this->error('您还没有加入家庭');
        }

        $family = FamilyModel::get($member->family_id);
        
        // 只有创建者可以移除成员
        if ($family->creator_user_id != $this->auth->id) {
            $this->error('只有家庭创建者可以移除成员');
        }

        $targetUserId = $this->request->post('user_id', 0);
        if (!$targetUserId) {
            $this->error('请选择要移除的成员');
        }

        // 不能移除自己
        if ($targetUserId == $this->auth->id) {
            $this->error('不能移除自己');
        }

        $targetMember = FamilyMemberModel::where('family_id', $member->family_id)
            ->where('user_id', $targetUserId)
            ->find();

        if (!$targetMember) {
            $this->error('该用户不是家庭成员');
        }

        $targetMember->delete();

        // 通知被移除的用户
        Notification::createNotification(
            $targetUserId,
            Notification::TYPE_SYSTEM,
            '移除家庭',
            "您已被从家庭「{$family->family_name}」中移除",
            0
        );

        $this->success('移除成功');
    }

    /**
     * 退出家庭
     * POST /api/family/leave
     */
    public function leave()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member) {
            $this->error('您还没有加入家庭');
        }

        $family = FamilyModel::get($member->family_id);
        
        // 创建者不能退出，只能解散家庭
        if ($family->creator_user_id == $this->auth->id) {
            $this->error('创建者不能退出，请先解散家庭或转移创建者权限');
        }

        $member->delete();

        $this->success('已退出家庭');
    }

    /**
     * 解散家庭
     * POST /api/family/dissolve
     */
    public function dissolve()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member) {
            $this->error('您还没有加入家庭');
        }

        $family = FamilyModel::get($member->family_id);
        
        // 只有创建者可以解散
        if ($family->creator_user_id != $this->auth->id) {
            $this->error('只有家庭创建者可以解散家庭');
        }

        // 删除所有成员
        FamilyMemberModel::where('family_id', $family->id)->delete();
        
        // 删除家庭
        $family->delete();

        $this->success('家庭已解散');
    }

    /**
     * 搜索用户（用于邀请）
     * GET /api/family/search-user
     */
    public function searchUser()
    {
        $keyword = $this->request->get('keyword', '');
        if (empty($keyword)) {
            $this->error('请输入搜索关键词');
        }

        $users = User::where('nickname', 'like', "%{$keyword}%")
            ->whereOr('username', 'like', "%{$keyword}%")
            ->whereOr('mobile', 'like', "%{$keyword}%")
            ->whereOr('email', 'like', "%{$keyword}%")
            ->limit(10)
            ->select();

        $list = [];
        foreach ($users as $user) {
            // 检查是否已有家庭
            $hasFamily = FamilyMemberModel::where('user_id', $user->id)->count() > 0;
            
            $list[] = [
                'id' => $user->id,
                'nickname' => $user->nickname,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'mobile' => $user->mobile,
                'email' => $user->email,
                'has_family' => $hasFamily,
            ];
        }

        $this->success('', ['list' => $list]);
    }

    /**
     * 更新成员信息
     * POST /api/family/update-member
     */
    public function updateMember()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member) {
            $this->error('您还没有加入家庭');
        }

        $params = $this->request->post();
        $rule = [
            'user_id' => 'require|number',
        ];
        
        $validate = new Validate($rule);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        $targetUserId = (int)$params['user_id'];
        
        // 获取目标成员
        $targetMember = FamilyMemberModel::where('family_id', $member->family_id)
            ->where('user_id', $targetUserId)
            ->find();
            
        if (!$targetMember) {
            $this->error('该用户不是您的家庭成员');
        }

        // 权限检查：只有家长可以编辑其他成员，或者自己编辑自己
        if ($this->auth->id != $targetUserId && $member->role_in_family !== 'parent') {
            $this->error('只有家长可以编辑其他成员信息');
        }

        // 更新角色 (只有家长可以修改角色)
        if (isset($params['role']) && in_array($params['role'], ['parent', 'child'])) {
             $family = FamilyModel::get($member->family_id);
             if ($family->creator_user_id == $targetUserId) {
                 // 创建者角色不能被修改
             } else {
                 if ($member->role_in_family === 'parent') {
                     $targetMember->role_in_family = $params['role'];
                     $targetMember->save();
                 }
             }
        }

        // 更新用户基本信息 (昵称/头像)
        $user = User::get($targetUserId);
        if ($user) {
            $userChanged = false;
            if (isset($params['nickname']) && !empty($params['nickname'])) {
                $user->nickname = $params['nickname'];
                $userChanged = true;
            }
            if (isset($params['avatar']) && !empty($params['avatar'])) {
                $user->avatar = $params['avatar'];
                $userChanged = true;
            }
            if ($userChanged) {
                $user->save();
            }
        }

        $this->success('更新成功');
    }

    /**
     * 直接创建孩子账号（无需登录）
     * POST /api/family/create-child
     */
    public function createChild()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member) {
            $this->error('您还没有加入家庭');
        }

        if ($member->role_in_family !== 'parent') {
            $this->error('只有家长可以添加孩子');
        }

        $params = $this->request->post();
        $rule = [
            'nickname' => 'require',
            'gender' => 'in:0,1,2',
            'birthday' => 'date',
        ];
        $msg = [
            'nickname.require' => '请输入孩子昵称',
            'gender.in' => '性别格式错误',
            'birthday.date' => '生日格式错误',
        ];

        $validate = new Validate($rule, $msg);
        if (!$validate->check($params)) {
            $this->error($validate->getError());
        }

        $nickname = $params['nickname'];
        $gender = isset($params['gender']) ? $params['gender'] : 0;
        $birthday = isset($params['birthday']) ? $params['birthday'] : null;
        $avatar = isset($params['avatar']) ? $params['avatar'] : '';

        // 自动生成用户名和密码
        $username = 'child_' . date('YmdHis') . '_' . Random::alnum(4);
        $password = Random::alnum(8);
        $salt = Random::alnum();
        
        // 手动创建用户，避免Auth::register自动登录导致家长掉线
        $user = new User();
        $user->username = $username;
        $user->nickname = $nickname;
        $user->password = $this->auth->getEncryptPassword($password, $salt);
        $user->salt = $salt;
        $user->email = '';
        $user->mobile = '';
        $user->avatar = $avatar;
        $user->level = 1;
        $user->score = 0;
        $user->joinip = $this->request->ip();
        $user->jointime = time();
        $user->createtime = time();
        $user->updatetime = time();
        $user->token = '';
        $user->status = 'normal';
        $user->gender = $gender;
        $user->birthday = $birthday;
        $user->save();

        // 添加到家庭
        $newMember = new FamilyMemberModel();
        $newMember->family_id = $member->family_id;
        $newMember->user_id = $user->id;
        $newMember->role_in_family = 'child';
        $newMember->joined_at = time();
        $newMember->save();

        $this->success('添加成功', [
            'user_id' => $user->id,
            'nickname' => $user->nickname,
            'avatar' => $user->avatar
        ]);
    }

    /**
     * 更新家庭设置
     * POST /api/family/update-settings
     */
    public function updateSettings()
    {
        $member = FamilyMemberModel::where('user_id', $this->auth->id)->find();
        if (!$member || $member->role_in_family !== 'parent') {
            $this->error('只有家长可以进行家庭设置');
        }

        $family = FamilyModel::get($member->family_id);
        if (!$family) {
            $this->error('家庭不存在');
        }

        $settings = $this->request->post('settings/a');
        
        if ($settings) {
            $currentSettings = json_decode($family->settings, true) ?: [];
            $newSettings = array_merge($currentSettings, $settings);
            $family->settings = json_encode($newSettings);
            $family->save();
        }

        $this->success('设置已更新');
    }
}

