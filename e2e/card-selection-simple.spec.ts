import { test, expect } from '@playwright/test';

/**
 * Simple Card Selection E2E Test
 * 
 * Tests basic card selection functionality
 */

test.describe('Simple Card Selection', () => {

  test('player can select a card and see it highlighted', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Create a unique room code
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join as regular player
      await page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
      await expect(page.locator('#player-name')).toBeVisible({ timeout: 10000 });
      await page.fill('#player-name', 'TestPlayer');
      await page.click('#join-room-button');
      
      // Wait for join to complete
      await page.waitForTimeout(2000);
      
      // Should see card selector
      await expect(page.locator('#card-selector')).toBeVisible({ timeout: 10000 });
      
      // Should see individual card buttons
      await expect(page.locator('#card-1')).toBeVisible();
      await expect(page.locator('#card-2')).toBeVisible();
      await expect(page.locator('#card-3')).toBeVisible();
      await expect(page.locator('#card-5')).toBeVisible();
      
      // Click card "3"
      await page.click('#card-3');
      
      // Card should be selected (highlighted)
      await expect(page.locator('#card-3')).toHaveClass(/selected/);
      
      // Other cards should not be selected
      await expect(page.locator('#card-1')).not.toHaveClass(/selected/);
      await expect(page.locator('#card-5')).not.toHaveClass(/selected/);
      
      // Click card "5" to change selection
      await page.click('#card-5');
      
      // Now card 5 should be selected
      await expect(page.locator('#card-5')).toHaveClass(/selected/);
      
      // Card 3 should no longer be selected
      await expect(page.locator('#card-3')).not.toHaveClass(/selected/);
      
    } finally {
      await context.close();
    }
  });

  test('two players can join and both see card selectors', async ({ browser }) => {
    const context = await browser.newContext();
    const player1Page = await context.newPage();
    const player2Page = await context.newPage();
    
    // Create a unique room code
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join as first player
      await player1Page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
      await expect(player1Page.locator('#player-name')).toBeVisible({ timeout: 10000 });
      await player1Page.fill('#player-name', 'Player1');
      await player1Page.click('#join-room-button');
      await player1Page.waitForTimeout(1000);
      
      // Join as second player
      await player2Page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
      await expect(player2Page.locator('#player-name')).toBeVisible({ timeout: 10000 });
      await player2Page.fill('#player-name', 'Player2');
      await player2Page.click('#join-room-button');
      await player2Page.waitForTimeout(2000);
      
      // Both should see card selectors
      await expect(player1Page.locator('#card-selector')).toBeVisible({ timeout: 10000 });
      await expect(player2Page.locator('#card-selector')).toBeVisible({ timeout: 10000 });
      
      // Both should see players section with both players
      await expect(player1Page.locator('#players-section')).toBeVisible();
      await expect(player2Page.locator('#players-section')).toBeVisible();
      
      // Both players should see each other in the player list
      await expect(player1Page.locator('.player-item').filter({ hasText: 'Player2' })).toBeVisible({ timeout: 5000 });
      await expect(player2Page.locator('.player-item').filter({ hasText: 'Player1' })).toBeVisible({ timeout: 5000 });
      
      // Player 1 selects a card
      await player1Page.click('#card-8');
      await expect(player1Page.locator('#card-8')).toHaveClass(/selected/);
      
      // Player 2 selects a different card  
      await player2Page.click('#card-13');
      await expect(player2Page.locator('#card-13')).toHaveClass(/selected/);
      
      // Wait for sync
      await player1Page.waitForTimeout(1000);
      
      // Both players should see that the other has a card (hidden)
      await expect(player1Page.locator('[data-testid="Player2-card-hidden"]')).toBeVisible({ timeout: 5000 });
      await expect(player2Page.locator('[data-testid="Player1-card-hidden"]')).toBeVisible({ timeout: 5000 });
      
    } finally {
      await context.close();
    }
  });
  
});