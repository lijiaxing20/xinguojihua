<?php

// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006~2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

return [
    //别名配置,别名只能是映射到控制器且访问时必须加上请求的方法
    '__alias__'   => [
    ],
    //变量规则
    '__pattern__' => [
    ],
    
    // 任务详情
    'api/task/detail/:id' => 'api/task/detail',
    // 更新任务
    'api/task/update' => 'api/task/update',
    // 更新家庭成员
    'api/family/update-member' => 'api/family/updateMember',
    // 创建孩子
    'api/family/create-child' => 'api/family/createChild',
    // 更新家庭设置
    'api/family/update-settings' => 'api/family/updateSettings',
    // 移除家庭成员
    'api/family/remove-member' => 'api/family/removeMember',
    // 通过联系方式邀请
    'api/family/invite-by-contact' => 'api/family/inviteByContact',
    // 搜索用户
    'api/family/search-user' => 'api/family/searchUser',
    
//        域名绑定到模块
//        '__domain__'  => [
//            'admin' => 'admin',
//            'api'   => 'api',
//        ],
];
