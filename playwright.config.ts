import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'cf-access-jwt-assertion': 'e2e-access-assertion',
      'cf-access-authenticated-user-email': 'reviewer@example.test',
      'cf-ray': 'e2e-edge-request'
    }
  },
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run start:standalone',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          HOSTNAME: '127.0.0.1',
          PORT: '3000',
          TRUST_CLOUDFLARE_ACCESS: 'true'
        }
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] }
    }
  ]
});
