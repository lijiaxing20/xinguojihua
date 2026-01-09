# 星火计划 - 快速测试指南

## 1. 重启开发服务器

**重要**：修改配置后必须重启开发服务器！

```bash
cd app_xhjh
# 按 Ctrl+C 停止当前服务器
# 然后重新启动
npm run dev
```

---

## 2. 验证 API 配置

打开浏览器控制台（F12），检查网络请求：

1. 访问：http://localhost:5173
2. 打开开发者工具 → Network（网络）
3. 尝试登录或访问任何页面
4. 检查请求是否发送到 `http://www.xinghuojihua.com/api/`

**预期结果**：
- ✅ 所有 API 请求指向 `http://www.xinghuojihua.com/api/`
- ✅ 没有 CORS 错误
- ✅ 接口正常返回数据

---

## 3. 运行自动化测试

### 方式一：首次安装浏览器

```bash
cd app_xhjh
npx playwright install
```

### 方式二：运行测试

```bash
# UI 模式（推荐，可以看到界面）
npm run test:ui

# 或者有头模式
npm run test:headed

# 或者普通模式
npm test
```

---

## 4. 手动测试检查清单

### 基础功能
- [ ] 登录页面正常显示
- [ ] 可以成功登录
- [ ] 登录后跳转到仪表盘
- [ ] API 请求正常（检查 Network）

### 页面导航
- [ ] 任务列表页面正常
- [ ] 勋章墙页面正常
- [ ] 能量值历史页面正常
- [ ] 心愿列表页面正常

### 数据展示
- [ ] 勋章列表显示正常
- [ ] 能量值统计显示正常
- [ ] 图表显示正常（Chart.js）

---

## 5. 常见问题解决

### 问题 1：API 请求还是 404

**原因**：开发服务器没有重启

**解决**：
```bash
# 停止服务器（Ctrl+C）
npm run dev
```

### 问题 2：CORS 错误

**原因**：后端没有允许 `localhost:5173`

**解决**：修改后端配置
```php
// czdy_admin/application/config.php
'cors_request_domain' => 'www.xinghuojihua.com,localhost:5173'
```

### 问题 3：Playwright 浏览器未安装

**错误**：`Executable doesn't exist`

**解决**：
```bash
npx playwright install
```

### 问题 4：图表不显示

**原因**：`react-chartjs-2` 未安装

**解决**：
```bash
npm install react-chartjs-2
```

---

## 6. 测试命令速查

```bash
# 开发
npm run dev              # 启动开发服务器

# 测试
npm test                 # 运行所有测试
npm run test:ui          # UI 模式运行
npm run test:headed      # 有头模式运行
npm run test:debug       # 调试模式
npm run test:report      # 查看测试报告

# 构建
npm run build            # 构建生产版本
npm run preview          # 预览构建结果
```

---

## 7. 快速验证 API

使用 curl 验证后端 API：

```bash
# 测试 API 是否可访问
curl http://www.xinghuojihua.com/api/user/login

# 或者使用浏览器直接访问
# http://www.xinghuojihua.com/api/dictionary/all
```

---

## 8. 检查清单

- [ ] ✅ API 配置已更新为 `http://www.xinghuojihua.com`
- [ ] ✅ 开发服务器已重启
- [ ] ✅ 浏览器控制台检查 Network 面板
- [ ] ✅ API 请求指向正确域名
- [ ] ✅ Playwright 浏览器已安装
- [ ] ✅ 至少运行一次测试验证

---

**下一步**：如果以上检查都通过，说明配置正确，可以开始使用系统了！
