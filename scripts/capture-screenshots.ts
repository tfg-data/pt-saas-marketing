/**
 * デモ画面スクリーンショットキャプチャスクリプト
 *
 * 用途: docs/demo/index.html の各画面をキャプチャして
 *       apps/marketing/public/images/screenshots/ に保存する
 *
 * 実行方法:
 *   npx tsx scripts/capture-screenshots.ts
 *
 * 前提:
 *   pnpm add -D playwright-core tsx
 *   npx playwright install chromium
 */

import { chromium } from 'playwright-core';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
// apps/marketing/scripts/ → apps/marketing/ → pt-saas/
const MARKETING_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(MARKETING_ROOT, '../..');
const DEMO_HTML = resolve(REPO_ROOT, 'docs/demo/index.html');
const OUTPUT_DIR = resolve(MARKETING_ROOT, 'public/images/screenshots');

// キャプチャ対象の画面定義
const SCREENS: {
  name: string;
  filename: string;
  setup?: (page: import('playwright-core').Page) => Promise<void>;
}[] = [
  {
    name: 'ダッシュボード',
    filename: 'dashboard.png',
    // デフォルトの表示がダッシュボードなので setup 不要
  },
  {
    name: '受注管理',
    filename: 'orders.png',
    setup: async (page) => {
      await page.evaluate(() => (window as unknown as { switchScreen: (s: string) => void }).switchScreen('screen-orders'));
    },
  },
  {
    name: '出荷管理',
    filename: 'shipping.png',
    setup: async (page) => {
      await page.evaluate(() => (window as unknown as { switchScreen: (s: string) => void }).switchScreen('screen-shipping'));
    },
  },
  {
    name: '在庫管理',
    filename: 'inventory.png',
    setup: async (page) => {
      await page.evaluate(() => (window as unknown as { switchScreen: (s: string) => void }).switchScreen('screen-inventory'));
    },
  },
  {
    name: '生産計画',
    filename: 'production.png',
    setup: async (page) => {
      await page.evaluate(() => (window as unknown as { switchScreen: (s: string) => void }).switchScreen('screen-production'));
    },
  },
];

async function startLocalServer(htmlPath: string): Promise<{ url: string; close: () => void }> {
  const html = readFileSync(htmlPath, 'utf-8');
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      resolve({
        url: `http://127.0.0.1:${addr.port}`,
        close: () => server.close(),
      });
    });
  });
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const { url, close } = await startLocalServer(DEMO_HTML);
  console.log(`Local server started: ${url}`);

  const browser = await chromium.launch();

  try {
    for (const screen of SCREENS) {
      console.log(`Capturing: ${screen.name} → ${screen.filename}`);

      const page = await browser.newPage();
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 Pro
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      if (screen.setup) {
        try {
          await screen.setup(page);
          await page.waitForTimeout(500);
        } catch (e) {
          console.warn(`  ⚠ setup failed for ${screen.name}, using default state`);
        }
      }

      const outputPath = resolve(OUTPUT_DIR, screen.filename);
      await page.screenshot({ path: outputPath, fullPage: false });
      console.log(`  ✓ Saved: ${outputPath}`);
      await page.close();
    }
  } finally {
    await browser.close();
    close();
  }

  console.log('\n✅ All screenshots captured!');
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
