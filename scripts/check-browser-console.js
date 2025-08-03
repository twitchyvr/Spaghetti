// /Users/mattrogers/Documents/Spaghetti/scripts/check-browser-console.js
// A Node.js script using Playwright to launch a browser, visit a URL,
// and capture all console output.

const { chromium } = require('playwright');

// --- Configuration ---
// How long to wait on the page before exiting, in milliseconds.
const WAIT_TIME_MS = 5000;
// --- End Configuration ---

(async () => {
    const url = process.argv[2];
    if (!url) {
        console.error('[ERROR] No URL provided. Usage: node check-browser-console.js <URL>');
        process.exit(1);
    }

    let browser;
    try {
        console.log(`[INFO] Launching headless Microsoft Edge to check console at: ${url}`);
        browser = await chromium.launch({
            channel: 'msedge', // Specify Microsoft Edge
            headless: true
        });

        const page = await browser.newPage();
        const consoleMessages = [];

        // Set up a listener for ALL console events
        page.on('console', msg => {
            const type = msg.type().toUpperCase();
            const text = msg.text();
            // Store and format the message
            const formattedMessage = `[CONSOLE.${type}] ${text}`;
            console.log(formattedMessage);
            consoleMessages.push({ type, text });
        });

        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Wait for a few seconds to catch any delayed logs or async errors
        await page.waitForTimeout(WAIT_TIME_MS);

        console.log(`[INFO] Console check complete. Found ${consoleMessages.length} message(s).`);

        // Determine exit code based on errors
        const hasErrors = consoleMessages.some(msg => msg.type === 'ERROR');
        if (hasErrors) {
            console.error('[FAILURE] Critical console errors were detected.');
            process.exitCode = 1; // Set a failure exit code for the agent
        } else {
            console.log('[SUCCESS] No console errors detected.');
        }

    } catch (error) {
        console.error(`[CRITICAL] An error occurred during the browser automation: ${error.message}`);
        process.exitCode = 1;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();