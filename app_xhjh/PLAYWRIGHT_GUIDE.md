# Playwright 自动化测试指南

## 快速开始

### 1. 安装浏览器

首次运行测试前，需要安装 Playwright 浏览器：

```bash
cd app_xhjh
npx playwright install
```

### 2. 运行测试

```bash
# 无头模式运行测试（默认）
npm test

# 有头模式运行测试（可以看到浏览器操作）
npm run test:headed

# UI 模式运行测试（交互式界面）
npm run test:ui

# 调试模式
npm run test:debug

# 查看测试报告
npm run test:report
```

---

## 测试脚本说明

| 命令 | 说明 |
|------|------|
| `npm test` | 无头模式运行所有测试 |
| `npm run test:ui` | UI 模式运行测试，可视化界面 |
| `npm run test:headed` | 有头模式运行测试，可以看到浏览器 |
| `npm run test:debug` | 调试模式，逐步执行测试 |
| `npm run test:report` | 查看测试报告 |

---

## 测试用例说明

### 用户认证测试 (`用户认证`)
- ✅ 显示登录页面
- ✅ 注册新用户
- ✅ 用户登录

### 任务管理测试 (`任务管理`)
- ✅ 创建任务
- ✅ 查看任务列表
- ✅ 筛选任务

### 勋章系统测试 (`勋章系统`)
- ✅ 查看勋章墙
- ✅ 按分类筛选勋章

### 能量值系统测试 (`能量值系统`)
- ✅ 查看能量值历史
- ✅ 查看能量值记录

### 心愿系统测试 (`心愿系统`)
- ✅ 查看心愿列表
- ✅ 创建心愿

### 响应式设计测试 (`响应式设计`)
- ✅ iPhone 12 适配
- ✅ iPad 适配
- ✅ Desktop 适配

### 性能测试 (`性能测试`)
- ✅ 页面加载时间
- ✅ API 响应时间

---

## 编写新测试

### 创建测试文件

在 `e2e/` 目录下创建新的测试文件：

```typescript
import { test, expect } from '@playwright/test';

test.describe('功能模块', () => {
  test('测试用例名称', async ({ page }) => {
    // 测试代码
  });
});
```

### 常用操作

```typescript
// 导航
await page.goto('/login');

// 填写表单
await page.fill('input[name="username"]', 'test');
await page.fill('input[name="password"]', '123456');

// 点击按钮
await page.click('button[type="submit"]');

// 等待元素
await expect(page.locator('h1')).toBeVisible();
await page.waitForURL('/dashboard');

// 验证文本
await expect(page.locator('h1')).toContainText('欢迎');

// 验证 URL
await page.waitForURL(/\/dashboard/);

// 截图
await page.screenshot({ path: 'screenshot.png' });
```

---

## 测试配置

### 配置文件 (`playwright.config.ts`)

```typescript
export default defineConfig({
  // 测试目录
  testDir: './e2e',

  // 并行执行
  fullyParallel: true,

  // 失败重试次数
  retries: process.env.CI ? 2 : 0,

  // 浏览器项目
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // 开发服务器
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 运行特定测试

```bash
# 运行特定测试文件
npx playwright test e2e/example.spec.ts

# 运行特定测试用例
npx playwright test -g "应该能够登录"

# 运行特定项目的测试
npx playwright test --project=chromium
```

---

## 调试技巧

### 1. 使用 UI 模式

```bash
npm run test:ui
```

- 可视化界面
- 可以单独运行某个测试
- 查看测试视频和截图

### 2. 使用调试模式

```bash
npm run test:debug
```

- 逐步执行测试
- 可以设置断点
- 实时查看页面状态

### 3. 使用 Playwright Inspector

```bash
npx playwright codegen http://localhost:5173
```

- 录制用户操作
- 自动生成测试代码
- 可视化选择器

---

## 持续集成 (CI)

### GitHub Actions 示例

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm install
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## 故障排除

### 问题 1: 浏览器未安装

**错误**: `Executable doesn't exist at ...`

**解决**:
```bash
npx playwright install
```

### 问题 2: 端口被占用

**错误**: `Port 5173 is already in use`

**解决**:
- 关闭占用端口的进程
- 或修改 `playwright.config.ts` 中的端口

### 问题 3: 元素找不到

**错误**: `Timeout waiting for selector`

**解决**:
- 增加等待时间
- 使用更精确的选择器
- 检查页面是否正确加载

### 问题 4: 测试超时

**错误**: `Test timeout of 30000ms exceeded`

**解决**:
```typescript
test.setTimeout(60000); // 增加超时时间
```

---

## 最佳实践

### 1. 使用 Page Object Model

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async login(username: string, password: string) {
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

test('登录测试', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('test', '123456');
});
```

### 2. 使用数据驱动测试

```typescript
const users = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
];

for (const user of users) {
  test(`登录用户: ${user.username}`, async ({ page }) => {
    await login(page, user.username, user.password);
  });
}
```

### 3. 使用 beforeAll 和 afterAll

```typescript
test.beforeAll(async ({ page }) => {
  // 执行一次，所有测试之前
  await page.goto('/login');
});

test.afterAll(async ({ page }) => {
  // 执行一次，所有测试之后
  await page.close();
});
```

---

## 参考资源

- [Playwright 官方文档](https://playwright.dev)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [选择器最佳实践](https://playwright.dev/docs/selectors)

---

**最后更新**: 2025-01-08
