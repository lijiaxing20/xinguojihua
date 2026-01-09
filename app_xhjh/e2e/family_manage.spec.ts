import { test, expect } from '@playwright/test';

test.describe('Family Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.fill('input[id="login-username"]', 'liudehua');
    await page.fill('input[id="login-password"]', 'aa123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/parent-dashboard');
    
    // Ensure user has a family
    await page.evaluate(async () => {
      const token = localStorage.getItem('auth-storage') 
        ? JSON.parse(localStorage.getItem('auth-storage')!).state.token 
        : null;
      
      if (!token) return;

      // Helper to make request
      const apiCall = async (url, method = 'GET', body = null) => {
        const headers = { 
          'Content-Type': 'application/json',
          'token': token
        };
        const options: any = { method, headers };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch('/api' + url, options);
        return { status: res.status, json: await res.json() };
      };

      // Check family info
      const infoRes = await apiCall('/family/info');
      const info = infoRes.json;
      if (info.code === 0 || (info.data && !info.data.has_family)) {
        console.log('Creating family for test...');
        await apiCall('/family/create', 'POST', { family_name: 'Test Family' });
      }
    });

    // Navigate to Family Management
    await page.goto('http://localhost:5173/family-manage');
  });

  test('should display family members', async ({ page }) => {
    await expect(page).toHaveTitle('家庭管理 - 星火计划');
    await expect(page.locator('h2:has-text("家庭管理")')).toBeVisible();
    
    // Wait for table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Wait for loading to finish
    await expect(page.locator('text=加载中...')).not.toBeVisible();
    
    // Check if there are members
    const noMembers = await page.locator('text=暂无家庭成员').isVisible();
    if (noMembers) {
      console.log('No family members found.');
    } else {
      // Check if there is at least one member row
      await expect(page.locator('tbody tr')).not.toHaveCount(0);
    }
  });

  test('should edit a family member nickname', async ({ page }) => {
    // Wait for loading to finish
    await expect(page.locator('text=加载中...')).not.toBeVisible();
    
    // Check if there are members
    if (await page.locator('text=暂无家庭成员').isVisible()) {
      test.skip('No family members to edit');
      return;
    }

    // Wait for members to load and edit button to be available
    // Use a more specific selector for the button
    const editButton = page.locator('tbody tr td button[title="编辑"]').first();
    await expect(editButton).toBeVisible({ timeout: 10000 });
    
    // Get the first member's name before edit
    const firstRow = page.locator('tbody tr').first();
    const nameCell = firstRow.locator('td').nth(1).locator('span.font-medium');
    const oldName = await nameCell.innerText();
    console.log(`Old name: ${oldName}`);
    
    // Click edit button
    await firstRow.locator('button[title="编辑"]').click();
    
    // Wait for modal
    await expect(page.locator('h3:has-text("编辑成员信息")')).toBeVisible();
    
    // Change name
    const newName = oldName === 'Updated Name' ? 'Original Name' : 'Updated Name';
    await page.fill('input[id="edit-name"]', newName);
    
    // Save
    page.once('dialog', dialog => dialog.accept()); // Handle potential alert
    // Use specific selector for the save button in the form (Edit Modal)
    await page.click('form button[type="submit"]');
    
    // Wait for modal to close or success message
    // The component uses `alert('成员信息已更新')`. Playwright handles alerts automatically but we might want to assert it.
    
    // Wait for reload/update
    // The component calls `fetchMembers()` after update.
    await page.waitForResponse(response => 
      response.url().includes('/family/members') && response.status() === 200
    );
    
    // Verify name change in table
    await expect(nameCell).toHaveText(newName);
  });
});
