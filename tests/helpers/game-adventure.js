import {expect} from '@playwright/test';
import {preparePage} from './runtime.js';

export const adventureSnapshot = page => page.evaluate(() => window.__physicsGame.snapshot());
export async function openAdventure(page,lang='en') {
  await preparePage(page,'/physics/game.html',lang,{reducedMotion:'reduce'});
  await page.waitForFunction(() => Boolean(window.__physicsGame));
  await expect(page.locator('#mode-adventure')).toBeEnabled();
  await page.locator('#mode-adventure').click();
  expect((await adventureSnapshot(page)).mode).toBe('adventure');
}
export async function travel(page,axis,target) {
  const initial = (await adventureSnapshot(page)).camera[axis];
  if (Math.abs(initial-target) < .2) return;
  const down = initial > target, key = axis === 'x' ? down ? 'a' : 'd' : down ? 'w' : 's';
  await page.locator('#game-canvas').focus(); await page.keyboard.down(key);
  try {
    await expect.poll(async () => {
      const value = (await adventureSnapshot(page)).camera[axis]; return down ? value <= target+.1 : value >= target-.1;
    },{timeout:20000,intervals:[50]}).toBe(true);
  } finally { await page.keyboard.up(key); }
}
async function pontoon(page,kind) {
  await travel(page,'z',3); await travel(page,'x',kind === 'steel' ? 1.8 : -1.8);
  await expect(page.locator('#adventure-interact')).toContainText(kind === 'steel' ? 'steel' : 'timber');
  await page.locator('#adventure-interact').click();
  await travel(page,'x',0); await travel(page,'z',-4.7);
  await page.locator('#adventure-interact').click();
}
export async function build(page,steel=false) {
  if (steel) {
    await pontoon(page,'steel');
    expect((await adventureSnapshot(page)).adventure.raft.floating).toBe(false);
    await page.locator('#adventure-unload').click();
  }
  await pontoon(page,'wood');
  const one = (await adventureSnapshot(page)).adventure.raft;
  expect(one.floating).toBe(true); expect(one.safe).toBe(false);
  await page.locator('#adventure-interact').click();
  await expect(page.locator('#mission-message')).toContainText('safety limit');
  await pontoon(page,'wood');
  expect((await adventureSnapshot(page)).adventure.raft.mass).toBe(405);
  expect((await adventureSnapshot(page)).adventure.raft.safe).toBe(true);
}
export async function dock(page) {
  await page.locator('#adventure-interact').click();
  expect((await adventureSnapshot(page)).adventure.riding).toBe(true);
  await page.locator('#game-canvas').focus(); await page.keyboard.down('w');
  try { await expect.poll(async () => (await adventureSnapshot(page)).adventure.stage,{timeout:20000}).toBe(1); }
  finally { await page.keyboard.up('w'); }
}
export async function relay(page) {
  await travel(page,'z',-21);
  await page.locator('#adventure-heat').click();
  await expect.poll(async () => (await adventureSnapshot(page)).adventure.sample.phase).toBe('melting');
  await expect(page.locator('#mission-readout')).toContainText('0.0 °C');
  await expect.poll(async () => (await adventureSnapshot(page)).adventure.stage,{timeout:12000}).toBe(2);
  await page.locator('#adventure-hold').click();
}
export async function signal(page,keyboard=false) {
  await travel(page,'z',-31);
  await page.locator('#adventure-interact').click();
  expect((await adventureSnapshot(page)).adventure.carrying).toBe('capsule');
  await page.locator('#approach').click();
  await expect(page.locator('#mission-message')).toContainText('Gravity-correct aim set');
  if (keyboard) { await page.locator('#game-canvas').focus(); await page.keyboard.press('f'); }
  else await page.locator('#adventure-throw').click();
  await expect.poll(async () => (await adventureSnapshot(page)).adventure.won,{timeout:7000}).toBe(true);
}
