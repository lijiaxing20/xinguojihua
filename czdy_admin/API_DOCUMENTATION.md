# 星火计划 API 接口文档

## 基础信息

- **API 基础地址**: `http://www.xinghuojihua.com/api`
- **认证方式**: Token 认证（通过 HTTP_TOKEN 头或 token 参数传递）
- **数据格式**: JSON
- **响应格式**: 
```json
{
  "code": 1,  // 1=成功, 0=失败
  "msg": "操作成功",
  "data": {}
}
```

## 认证接口

### 1. 用户登录
- **接口**: `POST /api/user/login`
- **参数**:
  - `account` (string, 必填): 用户名/手机号/邮箱
  - `password` (string, 必填): 密码
- **返回**: 用户信息和 Token

### 2. 用户注册
- **接口**: `POST /api/user/register`
- **参数**:
  - `username` (string, 必填): 用户名
  - `password` (string, 必填): 密码
  - `email` (string, 可选): 邮箱
  - `mobile` (string, 可选): 手机号
  - `code` (string, 必填): 验证码
- **返回**: 用户信息和 Token

## 任务接口

### 1. 获取任务列表
- **接口**: `GET /api/task/list`
- **参数**:
  - `status` (string, 可选): 任务状态 (pending/confirmed/in_progress/completed/rejected)
  - `category` (string, 可选): 任务分类 (habit/learning/interest/family)
  - `page` (int, 可选): 页码，默认 1
  - `limit` (int, 可选): 每页数量，默认 10
- **返回**: 任务列表和总数

### 2. 获取任务详情
- **接口**: `GET /api/task/detail/{id}`
- **返回**: 任务详情（包含打卡记录和反馈）

### 3. 创建任务（孩子端）
- **接口**: `POST /api/task/create`
- **参数**:
  - `task_name` (string, 必填): 任务名称
  - `description` (string, 可选): 任务描述
  - `category` (string, 必填): 任务分类
  - `target_date` (string, 可选): 计划完成时间
  - `energy_value` (int, 可选): 能量值
- **返回**: 创建的任务信息

### 4. 建议任务（家长端）
- **接口**: `POST /api/task/suggest`
- **参数**:
  - `task_name` (string, 必填): 任务名称
  - `description` (string, 可选): 任务描述
  - `category` (string, 必填): 任务分类
  - `assignee_user_id` (int, 必填): 分配给的孩子ID
  - `target_date` (string, 可选): 计划完成时间
  - `energy_value` (int, 可选): 能量值
- **返回**: 创建的任务信息

### 5. 确认任务（家长端）
- **接口**: `POST /api/task/confirm/{id}`
- **参数**:
  - `action` (string, 必填): 操作类型 (confirm/reject)
  - `suggestion` (string, 可选): 修改建议
- **返回**: 操作结果

### 6. 任务打卡
- **接口**: `POST /api/task/checkin/{id}`
- **参数**:
  - `content_type` (string, 必填): 内容类型 (text/image/video/diary)
  - `content_url` (string, 可选): 内容URL（图片/视频）
  - `text_content` (string, 可选): 文本内容
- **返回**: 打卡记录
- **说明**: 打卡成功后会增加能量值，并检查徽章

### 7. 提供家长反馈
- **接口**: `POST /api/task/feedback/{checkin_id}`
- **参数**:
  - `feedback_content` (string, 必填): 反馈内容
  - `emoji_type` (string, 可选): 表情类型 (like/hug/cheer/praise)
- **返回**: 反馈信息

## 心愿接口

### 1. 获取心愿列表
- **接口**: `GET /api/wish/list`
- **参数**:
  - `status` (string, 可选): 心愿状态 (pending/approved/rejected/fulfilled)
  - `page` (int, 可选): 页码
  - `limit` (int, 可选): 每页数量
- **返回**: 心愿列表和总数

### 2. 创建心愿（孩子端）
- **接口**: `POST /api/wish/create`
- **参数**:
  - `wish_name` (string, 必填): 心愿名称
  - `description` (string, 可选): 心愿描述
  - `required_energy` (int, 可选): 建议能量值
- **返回**: 创建的心愿信息

### 3. 审核心愿（家长端）
- **接口**: `POST /api/wish/review/{id}`
- **参数**:
  - `action` (string, 必填): 操作类型 (approve/reject)
  - `required_energy` (int, 可选): 设定的能量值
  - `reason` (string, 可选): 拒绝原因
- **返回**: 审核后的心愿信息

### 4. 申请实现心愿（孩子端）
- **接口**: `POST /api/wish/fulfill/{id}`
- **说明**: 需要能量值足够才能申请
- **返回**: 申请结果

### 5. 确认心愿实现（家长端）
- **接口**: `POST /api/wish/confirm/{id}`
- **说明**: 确认后会扣除能量值
- **返回**: 确认结果

## 通知接口

### 1. 获取通知列表
- **接口**: `GET /api/notification/list`
- **参数**:
  - `type` (string, 可选): 通知类型 (task/wish/feedback/system)
  - `status` (string, 可选): 通知状态 (unread/read)
  - `page` (int, 可选): 页码
  - `limit` (int, 可选): 每页数量
- **返回**: 通知列表和总数

### 2. 获取未读数量
- **接口**: `GET /api/notification/unread-count`
- **返回**: 未读通知数量

### 3. 标记为已读
- **接口**: `POST /api/notification/read`
- **参数**:
  - `ids` (array, 必填): 通知ID数组
- **返回**: 操作结果

### 4. 删除通知
- **接口**: `POST /api/notification/delete`
- **参数**:
  - `ids` (array, 必填): 通知ID数组
- **返回**: 操作结果

### 5. 全部标记为已读
- **接口**: `POST /api/notification/read-all`
- **返回**: 操作结果

## 文件上传接口

### 上传文件
- **接口**: `POST /api/common/upload`
- **参数**: 
  - `file` (file, 必填): 文件
- **返回**: 
```json
{
  "code": 1,
  "msg": "上传成功",
  "data": {
    "url": "/uploads/xxx.jpg",
    "fullurl": "http://www.xinghuojihua.com/uploads/xxx.jpg"
  }
}
```

## 能量值系统

### 能量值获取方式
1. **完成任务**: 每次打卡获得能量值（默认10，可在任务中设置）
2. **系统奖励**: 管理员可手动调整

### 能量值消耗方式
1. **实现心愿**: 扣除心愿所需能量值

### 能量值查询
- 通过用户信息接口获取当前能量值
- 通过能量值日志查看历史记录

## 徽章系统

### 徽章类型
1. **坚持不懈奖**: 连续7天完成任务
2. **探索家奖**: 首次尝试新领域的任务
3. **创意大师奖**: 用有趣方式完成任务（待实现）
4. **完美一周**: 一周内完成所有任务（待实现）
5. **能量收集者**: 累计获得1000能量值（待实现）

### 徽章获取
- 系统自动检查并授予
- 获得徽章时会发送通知

## 数据库表结构

请执行 `database_tables.sql` 文件创建所需的数据表。

## 注意事项

1. 所有需要登录的接口都需要在请求头中携带 `HTTP_TOKEN` 或通过 `token` 参数传递
2. Token 过期会返回 401 错误，需要重新登录
3. 能量值不能为负数
4. 任务状态流转：pending -> confirmed -> in_progress -> completed
5. 心愿状态流转：pending -> approved -> fulfilled（或 rejected）

