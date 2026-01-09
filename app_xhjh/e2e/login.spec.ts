import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully and stay logged in', async ({ page }) => {
    // Start listening for the login API response
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/user/login') && response.status() === 200
    );

    // Navigate to the login page
    await page.goto('http://localhost:5173/login');

    // Fill in the login form
    await page.fill('input[id="login-username"]', 'liudehua');
    await page.fill('input[id="login-password"]', 'aa123456');

    // Click the login button
    await page.click('button[type="submit"]');

    try {
      // Wait for the API response
      const response = await responsePromise;
      const responseBody = await response.json();

      // The backend should return a success code (e.g., 1)
      expect(responseBody.code).toBe(1);

      // Now wait for navigation
      await page.waitForURL('**/parent-dashboard');

      // Check if the dashboard content is visible
      await expect(page.locator('h2:has-text("欢迎回来！")')).toBeVisible();

      // Reload the page to check if the user stays logged in
      await page.reload();

      // Wait for the page to fully load after reload
      await page.waitForLoadState('networkidle');

      // Check if the user is still on the dashboard
      await expect(page.locator('h2:has-text("欢迎回来！")')).toBeVisible();

    } catch (error) {
      // If any of the above fails, log the error and fail the test
      console.error("Login test failed:", error);
      // You can also check for a specific error message on the page if applicable
      const errorMessage = await page.locator('div[role="alert"]').textContent();
      console.error("Visible error message:", errorMessage);
      throw error; // Re-throw to make sure the test is marked as failed
    }
  });
});
