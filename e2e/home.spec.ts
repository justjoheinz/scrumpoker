import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Scrum Poker');
  });

  test('should have create room button', async ({ page }) => {
    await page.goto('/');
    const createButton = page.getByRole('button', { name: /create room/i });
    await expect(createButton).toBeVisible();
  });

  test('should have join room input', async ({ page }) => {
    await page.goto('/');
    const joinInput = page.getByPlaceholder('e.g., ABC123');
    await expect(joinInput).toBeVisible();
  });

  test('should create room when clicking create button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /create room/i }).click();
    // Should navigate to a room URL with 6-character code
    await expect(page).toHaveURL(/\/room\/[A-Z0-9]{6}$/);
  });

  test('should navigate to room when entering valid code', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('e.g., ABC123').fill('TEST01');
    await page.getByRole('button', { name: /join room/i }).click();
    await expect(page).toHaveURL('/room/TEST01');
  });

  test('should show error for empty room code', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /join room/i }).click();
    await expect(page.getByText('Please enter a room code')).toBeVisible();
  });

  test('should show error for invalid room code format', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('e.g., ABC123').fill('AB');
    await page.getByRole('button', { name: /join room/i }).click();
    await expect(page.getByText('Room code must be 3-10 alphanumeric characters')).toBeVisible();
  });
});
