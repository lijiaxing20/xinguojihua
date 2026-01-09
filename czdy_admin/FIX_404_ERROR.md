# 解决 404 错误 - 快速修复指南

## 问题：`/api/family/create-child` 返回 404

## 解决方案

### 方案一：重启后端服务器（推荐）

**如果是 PHP 内置服务器**：
```bash
cd czdy_admin
# 按 Ctrl+C 停止服务器
# 然后重新启动
php think run -p 80
```

**如果是 Apache/Nginx**：
```bash
# 重启 Apache
sudo systemctl restart apache2

# 或重启 Nginx
sudo systemctl restart nginx

# 重启 PHP-FPM
sudo systemctl restart php7.4-fpm
```

### 方案二：清除 ThinkPHP 缓存

```bash
cd czdy_admin

# 清除运行时缓存
rm -rf runtime/cache/*
rm -rf runtime/log/*
rm -rf runtime/temp/*

# 如果使用 opcache，重启 PHP-FPM
sudo systemctl restart php7.4-fpm
```

### 方案三：验证路由配置

检查以下文件是否存在且正确：

1. **控制器文件**：
   ```
   czdy_admin/application/api/controller/Family.php
   ```
   - 应该包含 `createChild()` 方法（第 511-583 行）

2. **路由配置**：
   ```
   czdy_admin/application/route.php
   ```
   - 应该包含：
   ```php
   'api/family/create-child' => 'api/family/createChild',
   ```

### 方案四：检查 URL 大小写

**Linux 系统区分大小写**，确保：
- URL: `/api/family/create-child` (小写)
- 文件: `Family.php` (首字母大写)

### 方案五：直接测试后端接口

使用 curl 或浏览器直接访问：
```bash
# 测试接口是否可访问（需要登录 token）
curl -X POST http://www.xinghuojihua.com/api/family/create-child \
  -H "Content-Type: application/json" \
  -d '{"nickname":"测试","gender":1}'
```

或者浏览器访问：
```
http://www.xinghuojihua.com/api/family/create-child
```

---

## 快速诊断步骤

### 1. 检查后端是否正常运行

```bash
# 访问其他 API 接口
curl http://www.xinghuojihua.com/api/dictionary/all
```

如果返回数据，说明后端正常运行。

### 2. 检查路由是否生效

创建一个测试文件 `test_route.php`：
```php
<?php
require __DIR__ . '/thinkphp/base.php';

// 测试路由
\think\Route::get('test-route', function() {
    return '路由正常工作';
});

echo "访问: http://www.xinghuojihua.com/test-route 测试路由";
```

### 3. 查看 PHP 错误日志

```bash
# 查看错误日志
tail -f czdy_admin/runtime/log/error.log

# 或查看 Nginx/Apache 错误日志
tail -f /var/log/nginx/error.log
tail -f /var/log/apache2/error.log
```

---

## 常见原因和解决方法

| 原因 | 解决方法 |
|------|----------|
| 后端服务器未启动 | 启动 PHP 服务器 |
| 路由缓存未清除 | 删除 `runtime/cache/*` |
| 文件权限问题 | 设置正确的文件权限 |
| URL 大小写错误 | 确保使用小写 URL |
| 方法名不匹配 | 检查方法名是否为 `createChild` |

---

## 验证修复

修复后，使用以下命令验证：

```bash
# 方式一：使用 curl 测试
curl -X POST http://www.xinghuojihua.com/api/family/create-child \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "nickname=测试孩子&gender=1"

# 方式二：在前端测试
1. 打开前端页面：http://localhost:5173
2. 登录系统
3. 进入"家庭管理"
4. 点击"添加孩子"
5. 填写表单并提交

# 预期结果：
# - 返回 200 OK
# - 返回数据：{"code":1,"msg":"添加成功","data":{...}}
```

---

## 仍然无法解决？

### 临时解决方案：使用现有接口

如果 `create-child` 接口始终无法工作，可以使用现有的 `invite-by-contact` 接口：

```javascript
// 前端代码修改
// 1. 先注册一个新账号
await authService.register({
  username: 'child_name',
  password: 'password123',
  mobile: '13800000000',
});

// 2. 然后使用 invite-by-contact 邀请
await familyService.inviteByContact({
  contact: '13800000000',
  role: 'child'
});
```

### 调试模式

开启 ThinkPHP 调试模式：

```php
// czdy_admin/application/config.php
'app_debug' => true,  // 开启调试
'app_trace' => true,  // 开启_trace
```

然后查看详细的错误信息。

---

**请先尝试重启后端服务器，这通常能解决 90% 的 404 问题！**
