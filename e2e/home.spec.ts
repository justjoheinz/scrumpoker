import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Scrum Poker');
  });

  test('should have create room button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#btn-create-room')).toBeVisible();
  });

  test('should have join room input', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#room-code')).toBeVisible();
  });

  test('should create room when clicking create button', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-create-room').click();
    // Should navigate to a room URL with 6-character code
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);
  });

  test('should navigate to room when entering valid code', async ({ page }) => {
    await page.goto('/');
    await page.locator('#room-code').fill('TEST01');
    await page.locator('#btn-join-room').click();
    await expect(page).toHaveURL('/room/TEST01');
  });

  test('should show error for empty room code', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btn-join-room').click();
    await expect(page.getByText('Please enter a room code')).toBeVisible();
  });

  test('should show error for invalid room code format', async ({ page }) => {
    await page.goto('/');
    await page.locator('#room-code').fill('AB');
    await page.locator('#btn-join-room').click();
    await expect(page.getByText('Room code must be 3')).toBeVisible();
  });
});
