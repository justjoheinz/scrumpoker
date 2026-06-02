import { test, expect } from '@playwright/test';

test('basic server connection test', async ({ page }) => {
  console.log('Starting basic test...');
  
  // Go to home page first
  await page.goto('/', { waitUntil: 'networkidle' });
  console.log('Navigated to home page');
  
  // Check title
  await expect(page).toHaveTitle('Scrum Poker');
  console.log('Title check passed');
  
  // Create a room code and go to room
  const roomCode = 'TEST01';
  await page.goto(`/room/${roomCode}`, { waitUntil: 'networkidle' });
  console.log(`Navigated to room ${roomCode}`);
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'test-debug.png' });
  console.log('Screenshot taken');
  
  // Check what's on the page
  const pageContent = await page.content();
  console.log('Page content length:', pageContent.length);
  console.log('First 500 chars:', pageContent.substring(0, 500));
  
  // Look for specific elements
  const playerNameInput = page.locator('#player-name');
  const isVisible = await playerNameInput.isVisible();
  console.log('Player name input visible:', isVisible);
  
  if (!isVisible) {
    // Check what elements ARE visible
    const allInputs = await page.locator('input').all();
    console.log(`Found ${allInputs.length} input elements`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const id = await input.getAttribute('id');
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');
      console.log(`Input ${i}: id="${id}", placeholder="${placeholder}", type="${type}"`);
    }
  }
});