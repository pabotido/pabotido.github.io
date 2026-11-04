import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';
const bravePath = process.env.BRAVE_PATH;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    browserName: 'chromium',
    executablePath: process.env.CI ? undefined : bravePath,
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER ? undefined : [
    { command: 'corepack pnpm --filter @portal/api dev', url: 'http://127.0.0.1:4000/api/v1/health', reuseExistingServer: true, timeout: 120_000 },
    { command: 'corepack pnpm --filter @portal/web dev', url: baseURL, reuseExistingServer: true, timeout: 120_000 },
  ],
});
