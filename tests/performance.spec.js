import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { performanceBudgets, sourceEntries } from './helpers/matrix.js';
import { preparePage } from './helpers/runtime.js';

function percentile(values, percentileValue) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * percentileValue))] || 0;
}

for (const entry of sourceEntries) {
  test(`${entry.id} remains responsive within runtime budgets`, async ({ page }, testInfo) => {
    const session = await page.context().newCDPSession(page);
    await preparePage(page, entry.path, 'en', { probe: true });
    const loadMs = await page.evaluate(() => performance.getEntriesByType('navigation')[0].duration);

    const tabs = page.locator('.tab');
    for (let index = 0; index < await tabs.count(); index++) {
      await page.evaluate(tabIndex => {
        document.querySelectorAll('.tab')[tabIndex].click();
      }, index);
    }

    await session.send('HeapProfiler.collectGarbage');
    const heapBefore = (await session.send('Runtime.getHeapUsage')).usedSize;
    const listenerBefore = await page.evaluate(() => window.__qualityProbe.listenerAdds);
    const interactionTimes = [];
    for (let cycle = 0; cycle < 3; cycle++) {
      for (let index = 0; index < await tabs.count(); index++) {
        interactionTimes.push(await page.evaluate(tabIndex => new Promise(resolve => {
          const started = performance.now();
          document.querySelectorAll('.tab')[tabIndex].click();
          requestAnimationFrame(() => resolve(performance.now() - started));
        }), index));
      }
    }

    await page.waitForTimeout(1_000);
    const probeStart = await page.evaluate(() => ({ ...window.__qualityProbe }));
    await page.waitForTimeout(1_000);
    const probeEnd = await page.evaluate(() => ({ ...window.__qualityProbe }));
    await session.send('HeapProfiler.collectGarbage');
    const heapAfter = (await session.send('Runtime.getHeapUsage')).usedSize;
    const longTaskCount = probeEnd.longTasks.length - probeStart.longTasks.length;
    const longTaskTotalMs = probeEnd.longTasks
      .slice(probeStart.longTasks.length)
      .reduce((sum, duration) => sum + duration, 0);

    const metrics = {
      duplicateListeners: probeEnd.duplicateListeners,
      heapGrowthBytes: heapAfter - heapBefore,
      interactionP95Ms: percentile(interactionTimes, 0.95),
      listenerGrowth: probeEnd.listenerAdds - listenerBefore,
      loadMs,
      longTaskCount,
      longTaskTotalMs,
      rafPerSecond: probeEnd.rafCallbacks - probeStart.rafCallbacks
    };
    await mkdir('test-results/performance-metrics', { recursive: true });
    await writeFile(
      `test-results/performance-metrics/${entry.id}.json`,
      `${JSON.stringify({ budgets: performanceBudgets, metrics }, null, 2)}\n`
    );
    await testInfo.attach('performance-metrics', {
      body: Buffer.from(`${JSON.stringify({ budgets: performanceBudgets, metrics }, null, 2)}\n`),
      contentType: 'application/json'
    });

    expect.soft(metrics.loadMs).toBeLessThan(performanceBudgets.loadMs);
    expect.soft(metrics.interactionP95Ms).toBeLessThan(performanceBudgets.interactionP95Ms);
    expect.soft(metrics.heapGrowthBytes).toBeLessThan(performanceBudgets.heapGrowthBytes);
    expect.soft(metrics.listenerGrowth).toBe(0);
    expect.soft(metrics.duplicateListeners).toBe(probeStart.duplicateListeners);
    expect.soft(metrics.rafPerSecond).toBeLessThanOrEqual(performanceBudgets.rafPerSecond);
    expect.soft(metrics.longTaskCount).toBeLessThanOrEqual(performanceBudgets.longTaskCount);
    expect.soft(metrics.longTaskTotalMs)
      .toBeLessThanOrEqual(performanceBudgets.longTaskTotalMs);
    await expect(page.locator('body')).toBeVisible();
    expect(await page.evaluate(() => document.visibilityState)).toBe('visible');
  });
}
