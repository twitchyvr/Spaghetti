import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Sprint 3 Playwright Configuration
 * Comprehensive E2E testing for user experience enhancements
 */
export default defineConfig({
  testDir: './src/__tests__/e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  timeout: 30000,
  expect: {
    timeout: 5000,
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        isMobile: true,
        hasTouch: true,
      },
    },

    // Tablet devices
    {
      name: 'Tablet',
      use: { 
        ...devices['iPad Pro'],
        isMobile: true,
        hasTouch: true,
      },
    },

    // High DPI displays
    {
      name: 'Desktop High DPI',
      use: {
        ...devices['Desktop Chrome HiDPI'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Global setup for authentication and data seeding
  globalSetup: path.resolve(__dirname, './src/__tests__/global-setup.ts'),
  globalTeardown: path.resolve(__dirname, './src/__tests__/global-teardown.ts'),
});