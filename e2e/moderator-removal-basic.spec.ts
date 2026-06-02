import { test, expect } from '@playwright/test';

/**
 * Basic Moderator Player Removal E2E Tests
 * 
 * Tests the core functionality of moderator player removal
 */

test.describe('Moderator Player Removal', () => {
  
  test('moderator can remove a player', async ({ browser }) => {
    // Create browser context and pages for isolation
    const context = await browser.newContext();
    const moderatorPage = await context.newPage();
    const playerPage = await context.newPage();
    
    // Create a unique room code
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join as moderator first
      await moderatorPage.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
      await expect(moderatorPage.locator('#player-name')).toBeVisible({ timeout: 10000 });
      await moderatorPage.fill('#player-name', 'ModeratorPlayer');
      
      // Use force click for the checkbox to bypass Materialize CSS interference
      await moderatorPage.locator('#moderator-checkbox').check({ force: true });
      await moderatorPage.click('#join-room-button');
      
      // Join as regular player
      await playerPage.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
      await expect(playerPage.locator('#player-name')).toBeVisible({ timeout: 10000 });
      await playerPage.fill('#player-name', 'TestPlayer');
      await playerPage.click('#join-room-button');
      
      // Wait for both players to be connected and synchronized
      await playerPage.waitForTimeout(2000);
      
      // Moderator should see the regular player and remove button
      await expect(moderatorPage.locator('.player-item').filter({ hasText: 'TestPlayer' })).toBeVisible({ timeout: 10000 });
      await expect(moderatorPage.locator('[data-testid="remove-testplayer"]')).toBeVisible({ timeout: 5000 });
      
      // Click remove button
      await moderatorPage.locator('[data-testid="remove-testplayer"]').click();
      
      // Player should be removed from moderator's view
      await expect(moderatorPage.locator('.player-item').filter({ hasText: 'TestPlayer' })).not.toBeVisible({ timeout: 5000 });
      
      // Regular player should see removal overlay
      await expect(playerPage.locator('#removed-from-room-overlay')).toBeVisible({ timeout: 10000 });
      await expect(playerPage.locator('#removed-title')).toHaveText('You Were Removed from the Room');
      await expect(playerPage.getByText('by a moderator')).toBeVisible();
      
    } finally {
      await context.close();
    }
  });

  test('regular players cannot see remove buttons', async ({ browser }) => {
    const context = await browser.newContext();
    const playerPage = await context.newPage();
    
    // Create a unique room code
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join as regular player
      await playerPage.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
      await expect(playerPage.locator('#player-name')).toBeVisible({ timeout: 10000 });
      await playerPage.fill('#player-name', 'RegularPlayer');
      await playerPage.click('#join-room-button');
      
      // Wait for join to complete
      await playerPage.waitForTimeout(1000);
      
      // Regular player should not see any remove buttons
      await expect(playerPage.locator('[data-testid^="remove-"]')).not.toBeVisible();
      
    } finally {
      await context.close();
    }
  });
  
});