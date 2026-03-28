import { test, expect } from '@playwright/test';

const pages = [
  { name: 'home', path: '/' },
];

for (const page of pages) {
  test(`visual regression: ${page.name}`, async ({ page: p }) => {
    await p.goto(page.path);
    await p.waitForLoadState('networkidle');
    await expect(p).toHaveScreenshot(`${page.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
}
