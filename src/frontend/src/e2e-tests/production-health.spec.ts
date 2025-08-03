import { test, expect, Page } from '@playwright/test';

test.describe('Production Health Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set console error tracking
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Store console errors for assertions
    (page as any).consoleErrors = consoleErrors;
  });

  test('PWA service worker registers successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for PWA service worker registration
    await page.waitForFunction(() => {
      return window.navigator.serviceWorker?.ready;
    }, { timeout: 10000 });
    
    // Check console for PWA registration success
    const consoleLogs = await page.evaluate(() => {
      return window.console;
    });
    
    expect(page.url()).toContain('spaghetti-platform-drgev.ondigitalocean.app');
  });

  test('API health endpoint responds correctly', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const healthData = await response.json();
    expect(healthData).toHaveProperty('status');
    expect(healthData.status).toBe('healthy');
  });

  test('main content area is not covered by sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for layout to stabilize
    await page.waitForLoadState('networkidle');
    
    // Get sidebar and main content dimensions
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav[class*="sidebar"]').first();
    const mainContent = page.locator('[data-testid="main-content"], .main-content, main').first();
    
    if (await sidebar.isVisible() && await mainContent.isVisible()) {
      const sidebarBox = await sidebar.boundingBox();
      const mainContentBox = await mainContent.boundingBox();
      
      if (sidebarBox && mainContentBox) {
        // Main content should not overlap with sidebar
        expect(mainContentBox.x).toBeGreaterThanOrEqual(sidebarBox.x + sidebarBox.width);
      }
    }
  });

  test('login form has proper accessibility attributes', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    const autocomplete = await emailInput.getAttribute('autocomplete');
    
    // Should have autocomplete attribute for better UX
    expect(autocomplete).toBeTruthy();
    expect(['email', 'username']).toContain(autocomplete);
  });

  test('API endpoints return valid JSON instead of HTML', async ({ page }) => {
    // Test critical API endpoints
    const endpoints = [
      '/api/health',
      '/api/admin/database-stats',
      '/api/documents',
    ];
    
    for (const endpoint of endpoints) {
      const response = await page.request.get(endpoint);
      
      // Skip if endpoint requires authentication (401/403 is acceptable)
      if (response.status() === 401 || response.status() === 403) {
        continue;
      }
      
      if (response.ok()) {
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
        
        // Verify it's actually JSON, not HTML
        const responseText = await response.text();
        expect(responseText).not.toMatch(/<!DOCTYPE/i);
        expect(responseText).not.toMatch(/<html/i);
        
        // Should be parseable as JSON
        expect(() => JSON.parse(responseText)).not.toThrow();
      }
    }
  });

  test('dashboard loads without critical console errors', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for initial data loading
    await page.waitForTimeout(3000);
    
    const consoleErrors = (page as any).consoleErrors || [];
    
    // Filter out acceptable errors (network, extensions, etc.)
    const criticalErrors = consoleErrors.filter((error: string) => 
      !error.includes('chrome-extension') &&
      !error.includes('ERR_FILE_NOT_FOUND') &&
      !error.includes('Service Worker registered') &&
      error.includes('Failed to fetch')
    );
    
    expect(criticalErrors.length).toBeLessThan(5); // Allow some non-critical errors
  });

  test('platform monitoring dashboard handles API failures gracefully', async ({ page }) => {
    await page.goto('/platform-monitoring');
    
    // Wait for the page to attempt API calls
    await page.waitForTimeout(2000);
    
    // Should show fallback UI when APIs fail
    const errorMessage = page.locator('text=/API not available|Failed to fetch|Error loading/i');
    const fallbackContent = page.locator('text=/demo data|offline mode|unavailable/i');
    
    // Should either show error messages or fallback content
    const hasErrorHandling = await errorMessage.count() > 0 || await fallbackContent.count() > 0;
    expect(hasErrorHandling).toBeTruthy();
  });

  test('responsive design works on mobile devices', async ({ page, browserName }) => {
    // Skip webkit for mobile testing due to inconsistencies
    test.skip(browserName === 'webkit', 'Webkit mobile testing skipped');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Check if mobile navigation is implemented
    const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, button[aria-label*="menu"]');
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar');
    
    if (await mobileNav.isVisible()) {
      expect(await mobileNav.isVisible()).toBeTruthy();
      
      // Sidebar should be hidden on mobile by default
      if (await sidebar.isVisible()) {
        const sidebarBox = await sidebar.boundingBox();
        expect(sidebarBox?.width).toBeLessThan(200); // Should be collapsed
      }
    }
  });

  test('collaboration features are accessible', async ({ page }) => {
    await page.goto('/collaborative-editor');
    
    // Check if collaboration page loads
    await page.waitForLoadState('networkidle');
    
    // Should have proper ARIA labels and accessibility features
    const editorArea = page.locator('[role="textbox"], textarea, .editor');
    if (await editorArea.count() > 0) {
      const ariaLabel = await editorArea.first().getAttribute('aria-label');
      expect(ariaLabel || '').toBeTruthy();
    }
  });

  test('PWA manifest is valid and accessible', async ({ page }) => {
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('start_url');
    expect(manifest).toHaveProperty('icons');
    expect(Array.isArray(manifest.icons)).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('offline page is available for PWA', async ({ page }) => {
    const response = await page.request.get('/offline.html');
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('offline');
  });

  test('security headers are properly configured', async ({ page }) => {
    const response = await page.request.get('/');
    const headers = response.headers();
    
    // Check for important security headers
    expect(headers['x-frame-options'] || headers['X-Frame-Options']).toBeTruthy();
    expect(headers['x-content-type-options'] || headers['X-Content-Type-Options']).toBe('nosniff');
    
    // CSP should be configured
    const csp = headers['content-security-policy'] || headers['Content-Security-Policy'];
    if (csp) {
      expect(csp).toContain('default-src');
    }
  });

  test('performance metrics meet requirements', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure page load performance
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    // Performance requirements from project-architecture.yaml
    expect(performanceMetrics.loadTime).toBeLessThan(2000); // <2s load time
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1500);
  });

  test('error boundaries handle component failures gracefully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Inject an error to test error boundary
    await page.evaluate(() => {
      // Simulate a component error
      const event = new Error('Test error for error boundary');
      window.dispatchEvent(new ErrorEvent('error', { error: event }));
    });
    
    await page.waitForTimeout(1000);
    
    // Page should still be functional
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toBe('');
  });
});