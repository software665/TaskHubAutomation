
import { defineConfig, devices } from '@playwright/test';

export const appUrls = {
  baseURL: 'https://taskhub.azcentrix.com:4453',
  loginURL: '/login',
};

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
    headless: false,

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
        viewport: null,
        launchOptions: {
          args: ['--start-maximized'],
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
