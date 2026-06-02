import { test, expect } from '@playwright/test';

/**
 * Card Selection and Reveal E2E Tests
 * 
 * Tests the core functionality of selecting cards and revealing them
 */

test.describe('Card Selection and Reveal', () => {

  /**
   * Helper function to join a room as a regular player
   */
  async function joinAsPlayer(page: any, roomCode: string, playerName: string) {
    await page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
    await expect(page.locator('#player-name')).toBeVisible({ timeout: 10000 });
    await page.fill('#player-name', playerName);
    await page.click('#join-room-button');
    await expect(page.locator('#players-section')).toBeVisible({ timeout: 10000 });
  }

  test('two players can select cards and see hidden status', async ({ browser }) => {
    const context = await browser.newContext();
    const player1Page = await context.newPage();
    const player2Page = await context.newPage();
    
    // Create a unique room code
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join as first player
      await joinAsPlayer(player1Page, roomCode, 'Player1');
      
      // Join as second player
      await joinAsPlayer(player2Page, roomCode, 'Player2');
      
      // Wait for synchronization
      await player1Page.waitForTimeout(2000);
      
      // Both players should see card selector
      await expect(player1Page.locator('#card-selector')).toBeVisible();
      await expect(player2Page.locator('#card-selector')).toBeVisible();
      
      // Both players should see game controls
      await expect(player1Page.locator('#game-controls')).toBeVisible();
      await expect(player2Page.locator('#game-controls')).toBeVisible();
      
      // Player 1 selects card "5"
      await player1Page.click('#card-5');
      await expect(player1Page.locator('#card-5')).toHaveClass(/selected/);
      
      // Player 2 selects card "8"
      await player2Page.click('#card-8');
      await expect(player2Page.locator('#card-8')).toHaveClass(/selected/);
      
      // Wait for card selection to sync
      await player1Page.waitForTimeout(1000);
      
      // Both players should see that other player has selected a card (hidden)
      await expect(player1Page.locator('[data-testid="Player2-card-hidden"]')).toBeVisible();
      await expect(player2Page.locator('[data-testid="Player1-card-hidden"]')).toBeVisible();
      
      // Cards should not show values yet
      await expect(player1Page.locator('[data-testid="Player2-card-revealed"]')).not.toBeVisible();
      await expect(player2Page.locator('[data-testid="Player1-card-revealed"]')).not.toBeVisible();
      
      // Game status should show 2/2 players have selected cards
      await expect(player1Page.locator('#game-status')).toContainText('2/2 players have selected cards');
      await expect(player2Page.locator('#game-status')).toContainText('2/2 players have selected cards');
      
    } finally {
      await context.close();
    }
  });

  test('revealing cards shows actual values to both players', async ({ browser }) => {
    const context = await browser.newContext();
    const player1Page = await context.newPage();
    const player2Page = await context.newPage();
    
    // Create a unique room code
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join as first player
      await joinAsPlayer(player1Page, roomCode, 'Alice');
      
      // Join as second player
      await joinAsPlayer(player2Page, roomCode, 'Bob');
      
      // Wait for synchronization
      await player1Page.waitForTimeout(2000);
      
      // Player 1 selects card "3"
      await player1Page.click('#card-3');
      await expect(player1Page.locator('#card-3')).toHaveClass(/selected/);
      
      // Player 2 selects card "13"
      await player2Page.click('#card-13');
      await expect(player2Page.locator('#card-13')).toHaveClass(/selected/);
      
      // Wait for card selection to sync
      await player1Page.waitForTimeout(1000);
      
      // Reveal button should be enabled when players have cards
      await expect(player1Page.locator('#reveal-button')).toBeEnabled();
      await expect(player2Page.locator('#reveal-button')).toBeEnabled();
      
      // Player 1 clicks reveal
      await player1Page.click('#reveal-button');
      
      // Wait for reveal to sync
      await player1Page.waitForTimeout(1000);
      
      // Both players should now see revealed card values
      await expect(player1Page.locator('[data-testid="Alice-card-revealed"]')).toBeVisible();
      await expect(player1Page.locator('[data-testid="Alice-card-revealed"]')).toHaveAttribute('data-card-value', '3');
      await expect(player1Page.locator('[data-testid="Alice-card-revealed"]')).toContainText('3');
      
      await expect(player1Page.locator('[data-testid="Bob-card-revealed"]')).toBeVisible();
      await expect(player1Page.locator('[data-testid="Bob-card-revealed"]')).toHaveAttribute('data-card-value', '13');
      await expect(player1Page.locator('[data-testid="Bob-card-revealed"]')).toContainText('13');
      
      // Same for player 2's view
      await expect(player2Page.locator('[data-testid="Alice-card-revealed"]')).toBeVisible();
      await expect(player2Page.locator('[data-testid="Alice-card-revealed"]')).toContainText('3');
      
      await expect(player2Page.locator('[data-testid="Bob-card-revealed"]')).toBeVisible();
      await expect(player2Page.locator('[data-testid="Bob-card-revealed"]')).toContainText('13');
      
      // Hidden card elements should not be visible anymore
      await expect(player1Page.locator('[data-testid="Alice-card-hidden"]')).not.toBeVisible();
      await expect(player1Page.locator('[data-testid="Bob-card-hidden"]')).not.toBeVisible();
      await expect(player2Page.locator('[data-testid="Alice-card-hidden"]')).not.toBeVisible();
      await expect(player2Page.locator('[data-testid="Bob-card-hidden"]')).not.toBeVisible();
      
      // Reveal button should be disabled after reveal
      await expect(player1Page.locator('#reveal-button')).toBeDisabled();
      await expect(player2Page.locator('#reveal-button')).toBeDisabled();
      
      // Reset button should be enabled after reveal
      await expect(player1Page.locator('#reset-button')).toBeEnabled();
      await expect(player2Page.locator('#reset-button')).toBeEnabled();
      
      // Card selector should be disabled after reveal
      await expect(player1Page.locator('#card-3')).toBeDisabled();
      await expect(player2Page.locator('#card-13')).toBeDisabled();
      
    } finally {
      await context.close();
    }
  });

  test('reset clears cards and allows new selection', async ({ browser }) => {
    const context = await browser.newContext();
    const player1Page = await context.newPage();
    const player2Page = await context.newPage();
    
    // Create a unique room code
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join both players
      await joinAsPlayer(player1Page, roomCode, 'Player1');
      await joinAsPlayer(player2Page, roomCode, 'Player2');
      await player1Page.waitForTimeout(2000);
      
      // Select cards
      await player1Page.click('#card-2');
      await player2Page.click('#card-5');
      await player1Page.waitForTimeout(1000);
      
      // Reveal cards
      await player1Page.click('#reveal-button');
      await player1Page.waitForTimeout(1000);
      
      // Verify cards are revealed
      await expect(player1Page.locator('[data-testid="Player1-card-revealed"]')).toContainText('2');
      await expect(player1Page.locator('[data-testid="Player2-card-revealed"]')).toContainText('5');
      
      // Reset the game
      await player1Page.click('#reset-button');
      await player1Page.waitForTimeout(1000);
      
      // Cards should be cleared (showing placeholders)
      await expect(player1Page.locator('[data-testid="Player1-card-placeholder"]')).toBeVisible();
      await expect(player1Page.locator('[data-testid="Player2-card-placeholder"]')).toBeVisible();
      await expect(player2Page.locator('[data-testid="Player1-card-placeholder"]')).toBeVisible();
      await expect(player2Page.locator('[data-testid="Player2-card-placeholder"]')).toBeVisible();
      
      // Revealed cards should not be visible
      await expect(player1Page.locator('[data-testid="Player1-card-revealed"]')).not.toBeVisible();
      await expect(player1Page.locator('[data-testid="Player2-card-revealed"]')).not.toBeVisible();
      
      // Card selectors should be enabled again
      await expect(player1Page.locator('#card-2')).toBeEnabled();
      await expect(player1Page.locator('#card-5')).toBeEnabled();
      await expect(player2Page.locator('#card-2')).toBeEnabled();
      await expect(player2Page.locator('#card-5')).toBeEnabled();
      
      // Previously selected cards should not be selected anymore
      await expect(player1Page.locator('#card-2')).not.toHaveClass(/selected/);
      await expect(player2Page.locator('#card-5')).not.toHaveClass(/selected/);
      
      // Game status should show 0/2 players
      await expect(player1Page.locator('#game-status')).toContainText('0/2 players have selected cards');
      
    } finally {
      await context.close();
    }
  });

  test('only one player needed to reveal and reset', async ({ browser }) => {
    const context = await browser.newContext();
    const player1Page = await context.newPage();
    const player2Page = await context.newPage();
    
    // Create a unique room code
    const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
    
    try {
      // Join both players
      await joinAsPlayer(player1Page, roomCode, 'Player1');
      await joinAsPlayer(player2Page, roomCode, 'Player2');
      await player1Page.waitForTimeout(2000);
      
      // Only Player 1 selects a card
      await player1Page.click('#card-1');
      await player1Page.waitForTimeout(1000);
      
      // Game status should show 1/2 players
      await expect(player1Page.locator('#game-status')).toContainText('1/2 players have selected cards');
      
      // Reveal should be enabled with just one card
      await expect(player1Page.locator('#reveal-button')).toBeEnabled();
      
      // Player 2 can also reveal (any player can trigger reveal)
      await player2Page.click('#reveal-button');
      await player1Page.waitForTimeout(1000);
      
      // Player 1's card should be revealed
      await expect(player1Page.locator('[data-testid="Player1-card-revealed"]')).toContainText('1');
      await expect(player2Page.locator('[data-testid="Player1-card-revealed"]')).toContainText('1');
      
      // Player 2 should still show placeholder (no card selected)
      await expect(player1Page.locator('[data-testid="Player2-card-placeholder"]')).toBeVisible();
      await expect(player2Page.locator('[data-testid="Player2-card-placeholder"]')).toBeVisible();
      
      // Player 2 can reset the game
      await player2Page.click('#reset-button');
      await player1Page.waitForTimeout(1000);
      
      // Cards should be cleared
      await expect(player1Page.locator('[data-testid="Player1-card-placeholder"]')).toBeVisible();
      await expect(player1Page.locator('#card-1')).not.toHaveClass(/selected/);
      
    } finally {
      await context.close();
    }
  });
  
});