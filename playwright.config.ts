
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment values from .env (written by Jenkins, or created locally from .env.example)
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

export const appUrls = {
  baseURL: process.env.BASE_URL || 'https://taskhub.azcentrix.com',
  loginURL: process.env.LOGIN_URL || '/login',
};

// Run headed locally by default; set HEADLESS=true in .env (Jenkins does this) for CI agents
const headless = process.env.HEADLESS === 'true';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],

    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',
    }],

    ['allure-playwright'],

    ['./reporters/custom-reporter.ts', {
      outputDir: 'custom-report',
    }],
  ],

  timeout: 60 * 1000,

  expect: {
    timeout: 10 * 1000,
  },

  use: {
    baseURL: appUrls.baseURL,
    headless,

    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,

    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        // A headless browser has no screen to maximize into, so give it a fixed desktop size
        viewport: headless ? { width: 1920, height: 1080 } : null,
        launchOptions: {
          args: headless ? [] : ['--start-maximized'],
        },
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
