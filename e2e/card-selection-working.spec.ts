import { test, expect } from '@playwright/test';

/**
 * Working Card Selection E2E Tests
 * 
 * Fixed timing issues with more robust waits
 */

test.describe('Card Selection - Working', () => {

  test('single player can select cards', async ({ page }) => {
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    // Join as player
    await page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
    await expect(page.locator('#player-name')).toBeVisible({ timeout: 10000 });
    await page.fill('#player-name', 'TestPlayer');
    await page.click('#join-room-button');
    
    // Wait for join and verify components are visible
    await expect(page.locator('#players-section')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#card-selector')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#game-controls')).toBeVisible({ timeout: 5000 });
    
    // Select card "5"
    await page.click('#card-5');
    await expect(page.locator('#card-5')).toHaveClass(/selected/);
    
    // Verify reveal button is enabled (since we have 1 player with a card)
    await expect(page.locator('#reveal-button')).toBeEnabled({ timeout: 5000 });
    
    // Click reveal to see our own card
    await page.click('#reveal-button');
    
    // Wait for reveal and verify card is shown
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="TestPlayer-card-revealed"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="TestPlayer-card-revealed"]')).toContainText('5');
    
    // Reset should be enabled now
    await expect(page.locator('#reset-button')).toBeEnabled();
    
    // Click reset
    await page.click('#reset-button');
    await page.waitForTimeout(1000);
    
    // Verify card is cleared
    await expect(page.locator('[data-testid="TestPlayer-card-placeholder"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#card-5')).not.toHaveClass(/selected/);
  });

  test('two players can select cards with proper synchronization', async ({ browser }) => {
    const context = await browser.newContext();
    const player1Page = await context.newPage();
    const player2Page = await context.newPage();
    
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join player 1
      await player1Page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
      await player1Page.fill('#player-name', 'Alice');
      await player1Page.click('#join-room-button');
      await expect(player1Page.locator('#players-section')).toBeVisible({ timeout: 10000 });
      
      // Join player 2 with longer wait
      await player2Page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
      await player2Page.fill('#player-name', 'Bob');
      await player2Page.click('#join-room-button');
      await expect(player2Page.locator('#players-section')).toBeVisible({ timeout: 10000 });
      
      // Wait for full synchronization
      await player1Page.waitForTimeout(3000);
      await player2Page.waitForTimeout(3000);
      
      // Both should see each other in player list
      await expect(player1Page.locator('.player-item').filter({ hasText: 'Bob' })).toBeVisible({ timeout: 10000 });
      await expect(player2Page.locator('.player-item').filter({ hasText: 'Alice' })).toBeVisible({ timeout: 10000 });
      
      // Player 1 selects card
      await player1Page.click('#card-3');
      await expect(player1Page.locator('#card-3')).toHaveClass(/selected/);
      
      // Player 2 selects card
      await player2Page.click('#card-8');
      await expect(player2Page.locator('#card-8')).toHaveClass(/selected/);
      
      // Wait for card selection sync
      await player1Page.waitForTimeout(2000);
      
      // Both should see status showing 2/2 players
      await expect(player1Page.locator('#game-status')).toContainText('2/2 players have selected cards', { timeout: 10000 });
      
      // Player 1 reveals cards
      await player1Page.click('#reveal-button');
      
      // Wait for reveal sync
      await player1Page.waitForTimeout(2000);
      
      // Both should see revealed cards
      await expect(player1Page.locator('[data-testid="Alice-card-revealed"]')).toContainText('3', { timeout: 10000 });
      await expect(player1Page.locator('[data-testid="Bob-card-revealed"]')).toContainText('8', { timeout: 10000 });
      
      await expect(player2Page.locator('[data-testid="Alice-card-revealed"]')).toContainText('3', { timeout: 10000 });
      await expect(player2Page.locator('[data-testid="Bob-card-revealed"]')).toContainText('8', { timeout: 10000 });
      
    } finally {
      await context.close();
    }
  });

});