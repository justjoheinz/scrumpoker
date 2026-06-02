import { test, expect } from '@playwright/test';

test('debug join process step by step', async ({ page }) => {
  const roomCode = 'TEST' + Math.random().toString(36).slice(2, 4).toUpperCase();
  console.log(`Using room code: ${roomCode}`);
  
  try {
    // Step 1: Navigate to room
    console.log('Step 1: Navigating to room...');
    await page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
    console.log('Navigation complete');
    
    // Step 2: Check for player name input
    console.log('Step 2: Looking for player name input...');
    const playerNameInput = page.locator('#player-name');
    await expect(playerNameInput).toBeVisible({ timeout: 10000 });
    console.log('Player name input found and visible');
    
    // Step 3: Fill name
    console.log('Step 3: Filling player name...');
    await page.fill('#player-name', 'TestPlayer');
    console.log('Name filled');
    
    // Step 4: Look for join button
    console.log('Step 4: Looking for join button...');
    const joinButton = page.locator('#join-room-button');
    const joinButtonVisible = await joinButton.isVisible();
    console.log(`Join button visible: ${joinButtonVisible}`);
    
    if (joinButtonVisible) {
      // Step 5: Click join
      console.log('Step 5: Clicking join button...');
      await joinButton.click();
      console.log('Join button clicked');
      
      // Step 6: Wait and check for players section
      console.log('Step 6: Waiting for players section...');
      await page.waitForTimeout(2000);
      
      const playersSection = page.locator('#players-section');
      const playersSectionVisible = await playersSection.isVisible();
      console.log(`Players section visible: ${playersSectionVisible}`);
      
      if (playersSectionVisible) {
        console.log('SUCCESS: Join process completed');
        
        // Step 7: Check for card selector
        console.log('Step 7: Looking for card selector...');
        const cardSelector = page.locator('#card-selector');
        const cardSelectorVisible = await cardSelector.isVisible();
        console.log(`Card selector visible: ${cardSelectorVisible}`);
        
        // Step 8: Check for game controls
        console.log('Step 8: Looking for game controls...');
        const gameControls = page.locator('#game-controls');
        const gameControlsVisible = await gameControls.isVisible();
        console.log(`Game controls visible: ${gameControlsVisible}`);
        
        if (!gameControlsVisible) {
          // Debug: Check what IS on the page
          const allElements = await page.locator('[id]').all();
          console.log(`Found ${allElements.length} elements with IDs:`);
          for (let i = 0; i < Math.min(allElements.length, 10); i++) {
            const id = await allElements[i].getAttribute('id');
            const visible = await allElements[i].isVisible();
            console.log(`  ${id}: visible=${visible}`);
          }
        }
      } else {
        console.log('FAILED: Players section not visible after join');
        
        // Debug: What IS visible?
        const bodyText = await page.locator('body').innerText();
        console.log('Page text content:', bodyText.substring(0, 500));
      }
    } else {
      console.log('FAILED: Join button not visible');
    }
    
  } catch (error) {
    console.log('ERROR in test:', error);
    
    // Take screenshot for debugging
    await page.screenshot({ path: `test-error-${Date.now()}.png` });
  }
});