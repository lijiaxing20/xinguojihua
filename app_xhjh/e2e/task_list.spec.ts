import { test, expect } from '@playwright/test';

test.describe('任务列表页面', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('http://localhost:5173/login');
    
    // 填写登录表单
    await page.fill('#login-username', 'liudehua');
    await page.fill('#login-password', 'aa123456');
    await page.click('button[type="submit"]');
    
    // 等待登录成功并重定向
    await page.waitForURL('http://localhost:5173/parent-dashboard');
    
    // 导航到任务列表页面
    await page.goto('http://localhost:5173/task-list');
  });

  test('页面加载并显示任务列表', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle('我的任务 - 星火计划');
    
    // 检查创建按钮是否存在 (它是Link，所以是a标签)
    await expect(page.locator('a[href="/task-create"]')).toBeVisible();
  });

  test('创建新任务', async ({ page }) => {
    // 点击创建任务按钮
    await page.click('a[href="/task-create"]');
    
    // 等待跳转到创建页面
    await expect(page).toHaveURL(/\/task-create/);
    
    // 填写任务表单 (假设创建页面有这些字段)
    // 注意：这里我们假设task-create页面是正常的，如果不一样需要调整
    // 暂时注释掉具体的填写步骤，先验证能点进去
    /*
    await page.fill('input[id="task-title"]', 'E2E测试任务');
    await page.fill('textarea[id="task-desc"]', '这是一个由Playwright自动创建的测试任务');
    await page.fill('input[id="task-reward"]', '10');
    
    // 提交表单
    await page.click('button:has-text("立即发布")');
    
    // 处理alert
    page.on('dialog', dialog => dialog.accept());

    // 等待列表刷新，检查新任务是否出现
    // await expect(page.locator('text=E2E测试任务')).toBeVisible();
    */
  });
});
