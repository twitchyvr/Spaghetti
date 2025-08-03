// A Node.js script using Playwright to launch a browser, load a page,
// and capture all console output, piping it to the command line.

const { chromium } = require('playwright');

(async () => {
    const url = process.argv[2];
    if (!url) {
        console.error('[ERROR] Usage: node get-console-logs.js <URL>');
        process.exit(1);
    }

    let browser;
    try {
        browser = await chromium.launch();
        const context = await browser.newContext();
        const page = await context.newPage();

        // Set up a listener for all console messages
        page.on('console', msg => {
            const type = msg.type().toUpperCase();
            const text = msg.text();
            // Prefix messages for easy parsing by the AI agent
            console.log(`[${type}] ${text}`);
        });

        // Go to the URL and wait for the page to be fully loaded
        // Increase timeout to give the app time to initialize
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });

        // Add a small extra delay for any async operations to complete
        await page.waitForTimeout(2000);

    } catch (error) {
        console.error(`[CRITICAL] Playwright failed to load the page: ${error.message}`);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();