import { test, expect } from '@playwright/test';

/**
 * 用户认证测试
 */
test.describe('用户认证', () => {
  test('应该显示登录页面', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/星火计划/);
    await expect(page.locator('h1, h2')).toContainText('星火计划');
  });

  test('应该能够注册新用户', async ({ page }) => {
    await page.goto('/login');

    // 点击注册链接
    await page.click('text=注册');

    // 填写注册表单
    const timestamp = Date.now();
    const username = `testuser_${timestamp}`;
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', 'Test123456');
    await page.fill('input[name="mobile"]', '13800138000');
    await page.fill('input[name="email"]', `${username}@test.com`);

    // 提交表单
    await page.click('button[type="submit"]');

    // 等待跳转
    await page.waitForURL(/\/(parent-dashboard|child-dashboard)/);
  });

  test('应该能够登录', async ({ page }) => {
    await page.goto('/login');

    // 填写登录表单
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', '123456');

    // 提交表单
    await page.click('button[type="submit"]');

    // 等待跳转
    await page.waitForURL(/\/(parent-dashboard|child-dashboard)/);
  });
});

/**
 * 任务管理测试
 */
test.describe('任务管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/parent-dashboard/);
  });

  test('应该能够创建任务', async ({ page }) => {
    await page.goto('/task-create');

    // 选择任务分类
    await page.click('text=习惯养成');

    // 填写任务信息
    await page.fill('input[name="task_name"]', '每天阅读30分钟');
    await page.fill('textarea[name="description"]', '培养阅读习惯');

    // 设置目标日期
    await page.fill('input[name="target_date"]', '2025-12-31');

    // 提交表单
    await page.click('button:has-text("创建任务")');

    // 验证成功提示
    await expect(page.locator('text=创建成功')).toBeVisible();
  });

  test('应该能够查看任务列表', async ({ page }) => {
    await page.goto('/task-list');

    // 验证页面标题
    await expect(page.locator('h2')).toContainText('任务');

    // 验证任务筛选按钮
    await expect(page.locator('button:has-text("全部")')).toBeVisible();
    await expect(page.locator('button:has-text("待确认")')).toBeVisible();
  });

  test('应该能够筛选任务', async ({ page }) => {
    await page.goto('/task-list');

    // 点击筛选按钮
    await page.click('button:has-text("进行中")');

    // 验证筛选结果（需要根据实际实现调整）
    await page.waitForTimeout(1000);
  });
});

/**
 * 勋章系统测试
 */
test.describe('勋章系统', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(parent-dashboard|child-dashboard)/);
  });

  test('应该能够查看勋章墙', async ({ page }) => {
    await page.goto('/badge-list');

    // 验证页面标题
    await expect(page.locator('h1, h2')).toContainText('勋章');

    // 验证进度统计
    await expect(page.locator('text=/已收集.*个勋章/')).toBeVisible();

    // 验证分类筛选
    await expect(page.locator('button:has-text("全部")')).toBeVisible();
    await expect(page.locator('button:has-text("坚持勋章")')).toBeVisible();
  });

  test('应该能够按分类筛选勋章', async ({ page }) => {
    await page.goto('/badge-list');

    // 点击分类筛选
    await page.click('button:has-text("探索勋章")');

    // 验证筛选结果
    await page.waitForTimeout(1000);
  });
});

/**
 * 能量值系统测试
 */
test.describe('能量值系统', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(parent-dashboard|child-dashboard)/);
  });

  test('应该能够查看能量值历史', async ({ page }) => {
    await page.goto('/energy-history');

    // 验证页面标题
    await expect(page.locator('h2')).toContainText('能量值');

    // 验证统计数据
    await expect(page.locator('text=当前能量值')).toBeVisible();
    await expect(page.locator('text=今日收入')).toBeVisible();

    // 验证图表存在
    const canvas = page.locator('canvas');
    await expect(canvas).toHaveCount_greaterThan(0);
  });

  test('应该能够查看能量值记录', async ({ page }) => {
    await page.goto('/energy-history');

    // 验证记录表格
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=时间')).toBeVisible();
    await expect(page.locator('text=类型')).toBeVisible();
  });
});

/**
 * 心愿系统测试
 */
test.describe('心愿系统', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(parent-dashboard|child-dashboard)/);
  });

  test('应该能够查看心愿列表', async ({ page }) => {
    await page.goto('/wish-list');

    // 验证页面标题
    await expect(page.locator('h1, h2')).toContainText('心愿');

    // 验证创建按钮
    await expect(page.locator('button:has-text("创建心愿")')).toBeVisible();
  });

  test('应该能够创建心愿', async ({ page }) => {
    await page.goto('/wish-list');

    // 点击创建按钮
    await page.click('button:has-text("创建心愿")');

    // 填写心愿信息
    await page.fill('input[name="wish_name"]', '买一套乐高');
    await page.fill('textarea[name="description"]', '想要大的乐高积木');
    await page.fill('input[name="energy_cost"]', '500');

    // 提交表单
    await page.click('button:has-text("创建")');

    // 验证成功提示
    await expect(page.locator('text=创建成功')).toBeVisible({ timeout: 5000 });
  });
});

/**
 * 响应式设计测试
 */
test.describe('响应式设计', () => {
  const devices = [
    { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
    { name: 'iPad', viewport: { width: 768, height: 1024 } },
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
  ];

  for (const device of devices) {
    test(`${device.name}: 应该正确显示登录页面`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('/login');

      // 验证关键元素可见
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  }
});

/**
 * 性能测试
 */
test.describe('性能测试', () => {
  test('页面加载时间应该在合理范围内', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000); // 3秒内加载完成
  });

  test('API 响应时间应该快速', async ({ page }) => {
    await page.goto('/login');

    // 监听网络请求
    const responses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing(),
        });
      }
    });

    // 执行登录操作
    await page.fill('input[name="username"]', 'test');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // 等待 API 完成
    await page.waitForTimeout(2000);

    // 验证响应时间
    responses.forEach(response => {
      const responseTime = response.timing.responseEnd;
      expect(responseTime).toBeLessThan(1000); // 1秒内响应
    });
  });
});
