<?php

namespace app\api\controller;

use app\common\controller\Api;

/**
 * 示例接口
 */
class Demo extends Api
{

    //如果$noNeedLogin为空表示所有接口都需要登录才能请求
    //如果$noNeedRight为空表示所有接口都需要验证权限才能请求
    //如果接口已经设置无需登录,那也就无需鉴权了
    //
    // 无需登录的接口,*表示全部
    protected $noNeedLogin = ['test', 'test1', 'seed_user3'];
    // 无需鉴权的接口,*表示全部
    protected $noNeedRight = ['test2', 'seed_user3'];

    /**
     * 填充User3虚拟数据
     */
    public function seed_user3()
    {
        $username = 'user3';
        $password = '123456';
        
        $user = \app\common\model\User::get(['username' => $username]);
        if (!$user) {
            $user = new \app\common\model\User();
            $user->username = $username;
            $user->nickname = '测试孩子(User3)';
            $user->salt = \fast\Random::alnum();
            $user->password = \app\common\library\Auth::instance()->getEncryptPassword($password, $user->salt);
            $user->avatar = 'https://s.coze.cn/image/m7gdB20EvGA/';
            $user->gender = 1;
            $user->birthday = '2015-06-01';
            $user->bio = '我是一个热爱探索的小朋友！';
            $user->createtime = time();
            $user->updatetime = time();
            $user->status = 'normal';
            $user->save();
        } else {
            // Update existing user3
             $user->nickname = '测试孩子(User3)';
             $user->avatar = 'https://s.coze.cn/image/m7gdB20EvGA/';
             $user->gender = 1;
             $user->birthday = '2015-06-01';
             $user->bio = '我是一个热爱探索的小朋友！';
             $user->save();
        }

        // 1. Ensure Family
        // Check if user3 is in a family
        $member = \app\common\model\FamilyMember::where('user_id', $user->id)->find();
        if (!$member) {
            // Create a family for user3 (assuming user3 is a child, we need a parent)
            // Or just put user3 in a dummy family
            // Let's create "测试家庭" if not exists
            $family = \app\common\model\Family::where('family_name', '测试家庭')->find();
            if (!$family) {
                $family = new \app\common\model\Family();
                $family->family_name = '测试家庭';
                $family->creator_user_id = $user->id; // Temporarily make user3 creator or... 
                // Better: Create a parent user "parent3"
                $parent = \app\common\model\User::get(['username' => 'parent3']);
                if (!$parent) {
                    $parent = new \app\common\model\User();
                    $parent->username = 'parent3';
                    $parent->nickname = '测试家长';
                    $parent->salt = \fast\Random::alnum();
                    $parent->password = \app\common\library\Auth::instance()->getEncryptPassword('123456', $parent->salt);
                    $parent->createtime = time();
                    $parent->status = 'normal';
                    $parent->save();
                }
                $family->creator_user_id = $parent->id;
                $family->save();
                
                // Add parent
                $pm = new \app\common\model\FamilyMember();
                $pm->family_id = $family->id;
                $pm->user_id = $parent->id;
                $pm->role_in_family = 'parent';
                $pm->joined_at = time();
                $pm->save();
            }
            
            // Add user3 as child
            $member = new \app\common\model\FamilyMember();
            $member->family_id = $family->id;
            $member->user_id = $user->id;
            $member->role_in_family = 'child';
            $member->joined_at = time();
            $member->save();
        }

        $familyId = $member->family_id;

        // 2. Add Tasks
        $tasks = [
            ['title' => '整理书包', 'desc' => '把明天的书本准备好', 'reward' => 10, 'category' => '习惯养成'],
            ['title' => '练习钢琴', 'desc' => '练习30分钟', 'reward' => 20, 'category' => '兴趣技能'],
            ['title' => '阅读绘本', 'desc' => '读一本新书', 'reward' => 15, 'category' => '学习探索'],
        ];

        foreach ($tasks as $t) {
            $exist = \app\common\model\Task::where('assignee_user_id', $user->id)
                ->where('task_name', $t['title'])
                ->find();
            if (!$exist) {
                $task = new \app\common\model\Task();
                $task->family_id = $familyId;
                $task->creator_user_id = $user->id; // self created
                $task->assignee_user_id = $user->id;
                $task->task_name = $t['title'];
                $task->description = $t['desc'];
                $task->energy_value = $t['reward'];
                $task->category = $t['category'];
                $task->status = 'pending';
                $task->createtime = time();
                $task->updatetime = time();
                $task->save();
            }
        }

        // 3. Add Wishes
        $wishes = [
            ['name' => '乐高积木', 'energy' => 500],
            ['name' => '去动物园', 'energy' => 300],
        ];
        
        foreach ($wishes as $w) {
            $exist = \app\common\model\Wish::where('user_id', $user->id)
                ->where('wish_name', $w['name'])
                ->find();
            if (!$exist) {
                $wish = new \app\common\model\Wish();
                $wish->family_id = $familyId;
                $wish->user_id = $user->id;
                $wish->wish_name = $w['name'];
                $wish->required_energy = $w['energy'];
                $wish->status = 'pending';
                $wish->createtime = time();
                $wish->updatetime = time();
                $wish->save();
            }
        }

        // 4. Add Energy Log
        // Check current energy
        $currentEnergy = \app\common\model\EnergyLog::where('user_id', $user->id)->sum('change_amount');
        if ($currentEnergy < 100) {
            $log = new \app\common\model\EnergyLog();
            $log->user_id = $user->id;
            $log->change_amount = 100;
            $log->reason = '系统赠送初始能量';
            $log->createtime = time();
            $log->save();
            
            // Update user score/level if needed, usually user.score field
            $user->score = $user->score + 100;
            $user->save();
        }

        $this->success('User3数据填充成功', ['user_id' => $user->id, 'username' => $username]);
    }

    /**
     * 测试方法
     *
     * @ApiTitle    (测试名称)
     * @ApiSummary  (测试描述信息)
     * @ApiMethod   (POST)
     * @ApiRoute    (/api/demo/test/id/{id}/name/{name})
     * @ApiHeaders  (name=token, type=string, required=true, description="请求的Token")
     * @ApiParams   (name="id", type="integer", required=true, description="会员ID")
     * @ApiParams   (name="name", type="string", required=true, description="用户名")
     * @ApiParams   (name="data", type="object", sample="{'user_id':'int','user_name':'string','profile':{'email':'string','age':'integer'}}", description="扩展数据")
     * @ApiReturnParams   (name="code", type="integer", required=true, sample="0")
     * @ApiReturnParams   (name="msg", type="string", required=true, sample="返回成功")
     * @ApiReturnParams   (name="data", type="object", sample="{'user_id':'int','user_name':'string','profile':{'email':'string','age':'integer'}}", description="扩展数据返回")
     * @ApiReturn   ({
         'code':'1',
         'msg':'返回成功'
        })
     */
    public function test()
    {
        $this->success('返回成功', $this->request->param());
    }

    /**
     * 无需登录的接口
     *
     */
    public function test1()
    {
        $this->success('返回成功', ['action' => 'test1']);
    }

    /**
     * 需要登录的接口
     *
     */
    public function test2()
    {
        $this->success('返回成功', ['action' => 'test2']);
    }

    /**
     * 需要登录且需要验证有相应组的权限
     *
     */
    public function test3()
    {
        $this->success('返回成功', ['action' => 'test3']);
    }

}
