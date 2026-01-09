# 星火计划 API 文档

## 基本信息

- **Base URL**: `http://localhost/api` (开发环境)
- **认证方式**: Token 认证
- **响应格式**: JSON

## 通用响应格式

### 成功响应
```json
{
  "code": 1,
  "msg": "success",
  "data": { ... }
}
```

### 错误响应
```json
{
  "code": 0,
  "msg": "错误信息",
  "data": null
}
```

---

## 1. 用户认证模块

### 1.1 用户登录
- **接口**: `POST /api/user/login`
- **参数**:
  - `username`: 用户名/手机号/邮箱
  - `password`: 密码
- **响应**:
  ```json
  {
    "token": "xxxxxxxx",
    "user": {
      "id": 1,
      "username": "test",
      "nickname": "测试用户",
      ...
    }
  }
  ```

### 1.2 用户注册
- **接口**: `POST /api/user/register`
- **参数**:
  - `username`: 用户名
  - `password`: 密码
  - `mobile`: 手机号
  - `email`: 邮箱

### 1.3 获取用户信息
- **接口**: `GET /api/user/info`
- **Header**: `token: xxxxxx`

### 1.4 更新用户资料
- **接口**: `POST /api/user/profile`
- **参数**:
  - `nickname`: 昵称
  - `avatar`: 头像URL
  - `gender`: 性别 (male/female)
  - `birthday`: 生日

### 1.5 修改密码
- **接口**: `POST /api/user/changepwd`
- **参数**:
  - `oldpassword`: 旧密码
  - `newpassword`: 新密码

---

## 2. 任务管理模块

### 2.1 获取任务列表
- **接口**: `GET /api/task/list`
- **参数**:
  - `page`: 页码 (默认1)
  - `limit`: 每页数量 (默认10)
  - `status`: 任务状态 (pending/confirmed/in_progress/completed/rejected)
  - `category`: 任务分类 (habit/learning/interest/family)
  - `assignee_id`: 指派给谁的用户ID
  - `sort`: 排序字段 (createtime/updatetime)
  - `order`: 排序方向 (asc/desc)

### 2.2 获取任务详情
- **接口**: `GET /api/task/detail/:id`

### 2.3 创建任务（孩子端）
- **接口**: `POST /api/task/create`
- **参数**:
  - `task_name`: 任务名称
  - `description`: 任务描述
  - `category`: 分类 (habit/learning/interest/family)
  - `target_date`: 目标日期 (可选)
  - `energy_value`: 能量值 (可选)

### 2.4 建议任务（家长端）
- **接口**: `POST /api/task/suggest`
- **参数**:
  - `assignee_user_id`: 指派给谁
  - `task_name`: 任务名称
  - `description`: 任务描述
  - `category`: 分类
  - `target_date`: 目标日期

### 2.5 确认/拒绝任务
- **接口**: `POST /api/task/confirm/:id`
- **参数**:
  - `action`: confirm/reject
  - `reject_reason`: 拒绝原因 (可选)

### 2.6 更新任务
- **接口**: `POST /api/task/update`
- **参数**:
  - `id`: 任务ID
  - `task_name`: 任务名称
  - `description`: 任务描述
  - `target_date`: 目标日期

### 2.7 删除任务
- **接口**: `DELETE /api/task/delete/:id`

### 2.8 任务打卡
- **接口**: `POST /api/task/checkin/:id`
- **参数**:
  - `content_type`: 内容类型 (text/image/video/diary)
  - `content_url`: 内容URL (图片/视频)
  - `text_content`: 文字内容

### 2.9 家长反馈
- **接口**: `POST /api/task/feedback/:checkin_id`
- **参数**:
  - `feedback_content`: 反馈内容
  - `emoji_type`: 表情类型 (like/hug/cheer/praise)

### 2.10 获取作品墙
- **接口**: `GET /api/task/works`
- **参数**:
  - `page`: 页码
  - `limit`: 每页数量
  - `category`: 分类筛选

---

## 3. 勋章系统模块

### 3.1 获取所有勋章列表
- **接口**: `GET /api/badge/list`
- **响应**:
  ```json
  [
    {
      "id": 1,
      "badge_name": "初出茅庐",
      "badge_type": "persistence",
      "icon_url": "/assets/badges/persistence_1.png",
      "description": "完成第1个任务",
      "energy_threshold": 0,
      "task_count_threshold": 1,
      "is_achieved": true
    }
  ]
  ```

### 3.2 获取勋章详情
- **接口**: `GET /api/badge/detail`
- **参数**:
  - `id`: 勋章ID

### 3.3 获取用户已获得的勋章
- **接口**: `GET /api/badge/user_badges`
- **参数**:
  - `user_id`: 用户ID (可选，默认当前用户)

### 3.4 获取勋章分类
- **接口**: `GET /api/badge/categories`
- **响应**:
  ```json
  [
    {
      "type": "persistence",
      "name": "坚持勋章",
      "description": "连续完成任务或坚持打卡获得",
      "icon": "fa-calendar-check"
    }
  ]
  ```

---

## 4. 能量值系统模块

### 4.1 获取能量值余额
- **接口**: `GET /api/energy/balance`
- **参数**:
  - `user_id`: 用户ID (可选)
- **响应**:
  ```json
  {
    "user_id": 1,
    "energy": 350
  }
  ```

### 4.2 获取能量值记录
- **接口**: `GET /api/energy/logs`
- **参数**:
  - `user_id`: 用户ID (可选)
  - `page`: 页码
  - `limit`: 每页数量
  - `start_date`: 开始日期
  - `end_date`: 结束日期
  - `reason`: 变更原因

### 4.3 获取能量值统计
- **接口**: `GET /api/energy/statistics`
- **参数**:
  - `user_id`: 用户ID (可选)
- **响应**:
  ```json
  {
    "current_energy": 350,
    "today_income": 20,
    "today_expense": 0,
    "week_income": 150,
    "month_income": 500,
    "total_income": 1000,
    "total_expense": 650,
    "trend": [
      {
        "date": "2025-01-01",
        "income": 30,
        "expense": 0
      }
    ]
  }
  ```

---

## 5. 心愿系统模块

### 5.1 获取心愿列表
- **接口**: `GET /api/wish/list`
- **参数**:
  - `page`: 页码
  - `limit`: 每页数量
  - `status`: 状态 (pending/approved/fulfilled)

### 5.2 创建心愿
- **接口**: `POST /api/wish/create`
- **参数**:
  - `wish_name`: 心愿名称
  - `description`: 描述
  - `energy_cost`: 能量值消耗

### 5.3 审核心愿
- **接口**: `POST /api/wish/review/:id`
- **参数**:
  - `action`: approve/reject
  - `reject_reason`: 拒绝原因

### 5.4 申请实现心愿
- **接口**: `POST /api/wish/fulfill/:id`

### 5.5 确认心愿实现
- **接口**: `POST /api/wish/confirm/:id`

---

## 6. 家庭管理模块

### 6.1 获取家庭信息
- **接口**: `GET /api/family/info`

### 6.2 创建家庭
- **接口**: `POST /api/family/create`
- **参数**:
  - `family_name`: 家庭名称

### 6.3 邀请家庭成员
- **接口**: `POST /api/family/invite`
- **参数**:
  - `user_id`: 用户ID

### 6.4 通过联系方式邀请
- **接口**: `POST /api/family/invite-by-contact`
- **参数**:
  - `contact`: 手机号或邮箱
  - `role`: 角色 (parent/child)

### 6.5 获取家庭成员列表
- **接口**: `GET /api/family/members`

### 6.6 移除家庭成员
- **接口**: `POST /api/family/remove-member`
- **参数**:
  - `user_id`: 用户ID

### 6.7 更新成员信息
- **接口**: `POST /api/family/update-member`
- **参数**:
  - `user_id`: 用户ID
  - `role`: 角色

### 6.8 直接创建孩子账号
- **接口**: `POST /api/family/create-child`
- **参数**:
  - `username`: 用户名
  - `password`: 密码
  - `nickname`: 昵称

---

## 7. 统计分析模块

### 7.1 获取仪表盘数据
- **接口**: `GET /api/statistics/dashboard`
- **响应**:
  ```json
  {
    "today": {
      "tasks_completed": 3,
      "energy_earned": 30,
      "checkins": 5
    },
    "week": { ... },
    "total": { ... },
    "recent_tasks": [ ... ],
    "recent_badges": [ ... ]
  }
  ```

### 7.2 获取家庭统计
- **接口**: `GET /api/statistics/family`

---

## 8. 报告系统模块

### 8.1 获取周报
- **接口**: `GET /api/report/weekly`
- **参数**:
  - `user_id`: 用户ID (可选)
  - `week_start`: 周开始日期 (可选)

### 8.2 获取月报
- **接口**: `GET /api/report/monthly`
- **参数**:
  - `user_id`: 用户ID (可选)
  - `month`: 月份 (Y-m格式，可选)

### 8.3 生成报告
- **接口**: `POST /api/report/generate`
- **参数**:
  - `type`: 报告类型 (weekly/monthly/custom)
  - `start_date`: 开始日期
  - `end_date`: 结束日期
  - `sections`: 包含的章节数组 (task,energy,badge,wish,trend)

### 8.4 导出报告
- **接口**: `POST /api/report/export`
- **参数**:
  - `type`: 报告类型
  - `format`: 导出格式 (json/excel/pdf)
  - `start_date`: 开始日期
  - `end_date`: 结束日期

---

## 9. 知识库模块

### 9.1 获取文章列表
- **接口**: `GET /api/knowledge/list`
- **参数**:
  - `category`: 分类
  - `keyword`: 关键词
  - `page`: 页码
  - `limit`: 每页数量

### 9.2 获取文章详情
- **接口**: `GET /api/knowledge/detail/:id`

### 9.3 获取分类列表
- **接口**: `GET /api/knowledge/categories`

### 9.4 创建文章
- **接口**: `POST /api/knowledge/create`
- **参数**:
  - `title`: 标题
  - `content`: 内容
  - `category`: 分类
  - `summary`: 摘要
  - `cover_image`: 封面图
  - `tags`: 标签
  - `status`: 状态 (draft/published)

### 9.5 更新文章
- **接口**: `POST /api/knowledge/update`
- **参数**:
  - `id`: 文章ID
  - 其他字段同创建

### 9.6 删除文章
- **接口**: `POST /api/knowledge/delete`
- **参数**:
  - `id`: 文章ID

### 9.7 发布文章
- **接口**: `POST /api/knowledge/publish`
- **参数**:
  - `id`: 文章ID

### 9.8 获取我的文章
- **接口**: `GET /api/knowledge/my`
- **参数**:
  - `status`: 状态筛选
  - `keyword`: 关键词

---

## 10. 通知系统模块

### 10.1 获取通知列表
- **接口**: `GET /api/notification/list`
- **参数**:
  - `page`: 页码
  - `limit`: 每页数量

### 10.2 获取未读数量
- **接口**: `GET /api/notification/unreadCount`

### 10.3 标记为已读
- **接口**: `POST /api/notification/read`
- **参数**:
  - `id`: 通知ID

### 10.4 删除通知
- **接口**: `POST /api/notification/delete`
- **参数**:
  - `id`: 通知ID

---

## 11. 数据字典模块

### 11.1 获取任务分类
- **接口**: `GET /api/dictionary/task_categories`

### 11.2 获取任务状态
- **接口**: `GET /api/dictionary/task_status`

### 11.3 获取勋章类型
- **接口**: `GET /api/dictionary/badge_types`

### 11.4 获取通知类型
- **接口**: `GET /api/dictionary/notification_types`

### 11.5 获取能量值规则
- **接口**: `GET /api/dictionary/energy_rules`

### 11.6 获取所有字典
- **接口**: `GET /api/dictionary/all`

---

## 状态码说明

| Code | 说明 |
|------|------|
| 1 | 成功 |
| 0 | 失败 |
| -1 | 需要登录 |
| -2 | 权限不足 |

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

**最后更新时间**: 2025-01-08
