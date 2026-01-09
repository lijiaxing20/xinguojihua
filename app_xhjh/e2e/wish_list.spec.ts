import { test, expect } from '@playwright/test';

test.describe('心愿列表页面', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('http://localhost:5173/login');
    
    // 填写登录表单
    await page.fill('#login-username', 'liudehua');
    await page.fill('#login-password', 'aa123456');
    await page.click('button[type="submit"]');
    
    // 等待登录成功并重定向
    await page.waitForURL('http://localhost:5173/parent-dashboard');
    
    // 导航到心愿列表页面
    await page.goto('http://localhost:5173/wish-list');
  });

  test('页面加载并显示心愿列表', async ({ page }) => {
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    
    // 检查页面标题
    await expect(page).toHaveTitle('我的心愿 - 星火计划', { timeout: 10000 });
    
    // 检查创建按钮是否存在
    await expect(page.locator('button:has-text("创建心愿")')).toBeVisible();
  });

  test('创建新心愿', async ({ page }) => {
    // 点击创建心愿按钮
    await page.click('button:has-text("创建心愿")');
    
    // 验证模态框弹出
    await expect(page.locator('h3:has-text("创建心愿")')).toBeVisible();

    // 填写心愿表单
    await page.fill('input[id="wish-name"]', 'E2E测试心愿');
    await page.fill('textarea[id="wish-description"]', '这是一个由Playwright自动创建的测试心愿');
    
    // 提交表单
    // 注意：提交按钮可能需要更精确的选择器
    await page.click('button[type="submit"]');
    
    // 处理alert
    page.on('dialog', dialog => dialog.accept());

    // 等待列表刷新，检查新心愿是否出现
    await expect(page.locator('text=E2E测试心愿')).toBeVisible();
  });
});
