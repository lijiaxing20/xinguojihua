# API 集成文档

## 概述

本项目已集成 FastAdmin 后端 API，实现了完整的用户认证、状态管理、文件上传和通知系统。

## 已实现功能

### 1. API 服务层 (`src/utils/api.ts`)

- ✅ Axios 实例配置
- ✅ 请求拦截器（自动添加 Token）
- ✅ 响应拦截器（统一错误处理）
- ✅ Token 自动管理
- ✅ 跨域支持

### 2. 用户认证 (`src/services/auth.ts`)

- ✅ 登录（账号/密码）
- ✅ 手机验证码登录
- ✅ 注册
- ✅ 退出登录
- ✅ 获取用户信息
- ✅ 更新用户资料
- ✅ 修改邮箱/手机号
- ✅ 重置密码
- ✅ Token 检查与刷新

### 3. 状态管理 (`src/store/`)

- ✅ 认证状态管理 (`authStore.ts`)
  - 用户信息持久化
  - 登录状态管理
  - Token 管理
  
- ✅ 通知状态管理 (`notificationStore.ts`)
  - 通知列表管理
  - 未读数量统计
  - 轮询机制

### 4. 文件上传 (`src/services/upload.ts`)

- ✅ 通用文件上传
- ✅ 图片上传（限制 10MB）
- ✅ 视频上传（限制 100MB）
- ✅ 批量上传
- ✅ 上传进度回调
- ✅ 文件类型验证

### 5. 数据持久化 (`src/utils/storage.ts`)

- ✅ localStorage 封装
- ✅ IndexedDB 封装（用于大文件存储）
- ✅ 缓存管理（支持 TTL）

### 6. 通知系统 (`src/services/notification.ts`)

- ✅ 获取通知列表
- ✅ 标记已读
- ✅ 删除通知
- ✅ 未读数量统计
- ✅ 轮询机制（30秒间隔）
- ✅ 浏览器通知支持

### 7. 业务服务

- ✅ 任务服务 (`src/services/task.ts`)
- ✅ 心愿服务 (`src/services/wish.ts`)

## 环境配置

### 环境变量

创建 `.env` 文件（已提供 `.env.example`）：

```env
VITE_API_BASE_URL=http://www.xinghuojihua.com
```

### API 基础地址

默认 API 地址：`http://www.xinghuojihua.com/api`

## 使用示例

### 1. 用户登录

```typescript
import { useAuthStore } from '../store/authStore';

const { login, isAuthenticated, userInfo } = useAuthStore();

// 登录
await login('username', 'password');

// 检查登录状态
if (isAuthenticated) {
  console.log('用户信息:', userInfo);
}
```

### 2. 文件上传

```typescript
import { uploadService } from '../services/upload';

// 上传图片
const file = event.target.files[0];
const result = await uploadService.uploadImage(file, (progress) => {
  console.log('上传进度:', progress);
});

console.log('文件 URL:', result.fullurl);
```

### 3. 获取任务列表

```typescript
import { taskService } from '../services/task';

const { list, total } = await taskService.getTaskList({
  status: 'in_progress',
  page: 1,
  limit: 10,
});
```

### 4. 使用通知系统

```typescript
import { useNotificationStore } from '../store/notificationStore';

const { 
  notifications, 
  unreadCount, 
  startPolling, 
  stopPolling 
} = useNotificationStore();

// 开始轮询
startPolling();

// 获取通知列表
await fetchNotifications();

// 标记已读
await markAsRead([1, 2, 3]);
```

### 5. 受保护的路由

```typescript
import ProtectedRoute from '../components/ProtectedRoute';

// 需要登录的页面
<ProtectedRoute requireAuth={true}>
  <YourComponent />
</ProtectedRoute>

// 需要特定角色的页面
<ProtectedRoute requireAuth={true} requireRole="parent">
  <ParentDashboard />
</ProtectedRoute>
```

## API 接口说明

### 认证相关

- `POST /api/user/login` - 登录
- `POST /api/user/register` - 注册
- `POST /api/user/logout` - 退出登录
- `GET /api/user/index` - 获取用户信息
- `POST /api/user/profile` - 更新用户资料
- `POST /api/token/check` - 检查 Token
- `GET /api/token/refresh` - 刷新 Token

### 文件上传

- `POST /api/common/upload` - 上传文件
- `GET /api/common/captcha?id=xxx` - 获取验证码

### 通知相关

- `GET /api/notification/list` - 获取通知列表
- `POST /api/notification/read` - 标记已读
- `POST /api/notification/delete` - 删除通知
- `GET /api/notification/unread-count` - 获取未读数量

## 注意事项

1. **Token 管理**：Token 会自动保存在 localStorage，并在请求时自动添加到请求头
2. **错误处理**：所有 API 错误都会统一处理，401 错误会自动跳转到登录页
3. **跨域配置**：开发环境已配置代理，生产环境需要后端配置 CORS
4. **文件大小限制**：图片最大 10MB，视频最大 100MB
5. **通知轮询**：默认 30 秒轮询一次，可在组件卸载时调用 `stopPolling()` 停止

## 待完善功能

1. 验证码功能（需要后端支持）
2. 短信/邮件验证码发送
3. WebSocket 实时通知（替代轮询）
4. 任务和心愿的完整 API 接口对接

## 开发建议

1. 所有 API 调用都应该使用 try-catch 处理错误
2. 使用状态管理存储全局数据，避免重复请求
3. 文件上传时显示进度条提升用户体验
4. 合理使用缓存减少 API 请求

