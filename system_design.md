# 星火计划 (Youzi CZDY) 系统设计文档

## 1. 数据库设计 (Database Schema)

### 1.1 用户表 (`fa_user`)
存储所有用户信息（家长和孩子）。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | int(10) unsigned | 主键 ID |
| `username` | varchar(32) | 用户名 (登录用) |
| `nickname` | varchar(50) | 昵称 |
| `mobile` | varchar(11) | 手机号 |
| `password` | varchar(32) | 密码 (加密) |
| `salt` | varchar(30) | 密码盐 |
| `avatar` | varchar(255) | 头像 URL |
| `gender` | tinyint(1) unsigned | 性别 (0:保密 1:男 2:女) |
| `birthday` | date | 生日 |
| `energy` | int(11) | 能量值 (余额/积分概念) |
| `score` | int(10) | 积分 |
| `token` | varchar(50) | 登录 Token |
| `createtime` | bigint(16) | 创建时间 |
| `updatetime` | bigint(16) | 更新时间 |
| `status` | varchar(30) | 状态 (normal/hidden) |

### 1.2 家庭表 (`fa_family`)
存储家庭基本信息。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | int(10) unsigned | 主键 ID |
| `family_name` | varchar(255) | 家庭名称 |
| `creator_user_id` | int(10) unsigned | 创建者用户 ID |
| `settings` | text | 家庭设置 (JSON) |
| `createtime` | int(10) unsigned | 创建时间 |
| `updatetime` | int(10) unsigned | 更新时间 |

### 1.3 家庭成员表 (`fa_family_member`)
存储用户与家庭的关联关系及角色。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | int(10) unsigned | 主键 ID |
| `family_id` | int(10) unsigned | 家庭 ID |
| `user_id` | int(10) unsigned | 用户 ID |
| `role_in_family` | varchar(20) | 家庭角色 (`parent`: 家长, `child`: 孩子) |
| `joined_at` | int(10) unsigned | 加入时间 |

### 1.4 任务表 (`fa_task`)
存储任务信息。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | int(10) unsigned | 主键 ID |
| `family_id` | int(10) unsigned | 所属家庭 ID |
| `creator_user_id` | int(10) unsigned | 创建者 ID |
| `assignee_user_id` | int(10) unsigned | 执行者 ID (孩子) |
| `task_name` | varchar(255) | 任务名称 |
| `description` | text | 任务描述 |
| `category` | varchar(50) | 分类 (习惯/学习/兴趣/家务) |
| `status` | varchar(50) | 状态 (待确认/待执行/进行中/已完成/已拒绝) |
| `energy_value` | int(11) | 奖励能量值 |
| `target_date` | datetime | 目标完成时间 |
| `createtime` | int(11) | 创建时间 |
| `updatetime` | int(11) | 更新时间 |

### 1.5 任务打卡表 (`fa_task_checkin`)
存储任务完成/打卡记录。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | int(10) unsigned | 主键 ID |
| `task_id` | int(10) unsigned | 关联任务 ID |
| `user_id` | int(10) unsigned | 打卡用户 ID |
| `checkin_time` | int(11) | 打卡时间 |
| `content_type` | varchar(20) | 内容类型 (image/video/text) |
| `content_url` | varchar(512) | 资源 URL |
| `text_content` | text | 文字内容 |
| `energy_awarded` | int(11) | 实际获得能量 |
| `createtime` | int(11) | 创建时间 |

### 1.6 心愿表 (`fa_wish`)
存储孩子的心愿。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | int(10) unsigned | 主键 ID |
| `user_id` | int(10) unsigned | 归属用户 ID (孩子) |
| `family_id` | int(10) unsigned | 所属家庭 ID |
| `wish_name` | varchar(255) | 心愿名称 |
| `description` | text | 心愿描述 |
| `required_energy` | int(11) | 所需能量值 |
| `status` | varchar(20) | 状态 (待审核/进行中/已实现/已拒绝) |
| `fulfilled_at` | int(11) | 实现时间 |
| `createtime` | int(11) | 创建时间 |
| `updatetime` | int(11) | 更新时间 |

### 1.7 徽章表 (`fa_badge`)
系统定义的徽章。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | int(10) unsigned | 主键 ID |
| `badge_name` | varchar(255) | 徽章名称 |
| `badge_type` | varchar(50) | 类型标识 |
| `icon_url` | varchar(512) | 图标 URL |
| `description` | text | 描述 |
| `criteria` | text | 获得条件 (JSON) |

### 1.8 用户徽章表 (`fa_user_badge`)
用户获得的徽章记录。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | int(10) unsigned | 主键 ID |
| `user_id` | int(10) unsigned | 用户 ID |
| `badge_id` | int(10) unsigned | 徽章 ID |
| `awarded_at` | int(10) unsigned | 获得时间 |

---

## 2. API 接口设计 (API Endpoints)

### 2.1 用户相关 (`/api/user`)
- `POST /api/user/login`: 用户登录
- `POST /api/user/register`: 用户注册
- `GET /api/user/index`: 获取个人信息
- `POST /api/user/profile`: 修改个人资料
- `POST /api/user/changepwd`: 修改密码

### 2.2 家庭管理 (`/api/family`)
- `GET /api/family/info`: 获取当前家庭信息及成员列表
- `POST /api/family/create`: 创建家庭
- `POST /api/family/join`: 加入家庭
- `POST /api/family/createChild`: 家长直接创建孩子账号 (无需手机号)
- `POST /api/family/removeMember`: 移除家庭成员

### 2.3 任务管理 (`/api/task`)
- `GET /api/task/list`: 获取任务列表 (支持筛选 status, assignee_user_id)
- `GET /api/task/detail`: 获取任务详情
- `POST /api/task/create`: 创建任务 (家长/孩子)
- `POST /api/task/update`: 更新任务信息
- `POST /api/task/delete`: 删除任务
- `POST /api/task/checkin`: 任务打卡 (支持家长代打卡)
- `POST /api/task/confirm`: 家长确认任务

### 2.4 心愿管理 (`/api/wish`)
- `GET /api/wish/list`: 获取心愿列表
- `POST /api/wish/create`: 创建心愿
- `POST /api/wish/update`: 更新心愿 (家长审核/修改状态)
- `POST /api/wish/delete`: 删除心愿

### 2.5 通知消息 (`/api/notification`)
- `GET /api/notification/list`: 获取通知列表
- `POST /api/notification/read`: 标记通知为已读
- `GET /api/notification/unreadCount`: 获取未读数量

---

## 3. 菜单与前端路由 (Frontend Routes)

### 3.1 公共页
- `/login`: 登录页
- `/register`: 注册页

### 3.2 业务页
- `/dashboard`: 仪表盘 (根据角色展示不同内容)
- `/task_list`: 任务广场/列表
- `/task_create`: 创建任务
- `/task_detail/:id`: 任务详情
- `/task_checkin`: 任务打卡 (弹窗页)
- `/wish_list`: 心愿清单
- `/family_manage`: 家庭管理
- `/growth_report`: 成长报告 (家长端)
- `/profile`: 个人中心

