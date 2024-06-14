const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
const proxyChain = require('proxy-chain');
const fs = require('fs');

// Add stealth plugin and use all the default evasions
puppeteer.use(StealthPlugin());

(async () => {
  console.log("Starting the critical mission...");

  // Proxy credentials
  const proxyUser = 'redauisx-7';
  const proxyPass = '43o2s15ldjap';
  const proxyHost = '209.127.59.170';
  const proxyPort = '80';
  
  const proxyUrl = `http://${proxyUser}:${proxyPass}@${proxyHost}:${proxyPort}`;
  const newProxyUrl = await proxyChain.anonymizeProxy(proxyUrl);

  // Launch the browser with stealth and proxy settings
  const browser = await puppeteer.launch({
    headless: false, // Use headless: false for more human-like behavior
    executablePath: puppeteer.executablePath(), // Use the existing Chrome/Chromium for more natural behavior
    args: [
      `--proxy-server=${newProxyUrl}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--flag-switches-begin --disable-site-isolation-trials --flag-switches-end',
      '--window-size=1920,1080',
      '--disable-extensions',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-infobars',
      '--lang=en-US,en',
      '--start-maximized',
      '--disable-notifications'
    ]
  });

  const page = await browser.newPage();

  // Set viewport and user-agent
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent(randomUseragent.getRandom());

  // Clear cookies and set additional headers
  await page.deleteCookie(...await page.cookies());
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/'
  });

  // Mock various navigator properties to evade detection
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 4 });
    window.chrome = { runtime: {} };
  });

  // Implement manual mouse movement simulation to mimic human behavior
  async function simulateHumanMouseMovement(page, element) {
    const box = await element.boundingBox();
    const x = box.x + box.width / 2 + Math.random() * 10;
    const y = box.y + box.height / 2 + Math.random() * 10;
    await page.mouse.move(x, y, { steps: 10 });
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
  }

  // Navigate to the URL
  try {
    console.log("Navigating to the SeatGeek page...");
    await page.goto('https://seatgeek.com/kendrick-lamar-tickets/inglewood-california-kia-forum-2024-06-19-4-pm/concert/16916755', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log("Page loaded. Please solve the initial CAPTCHA if present.");
  } catch (error) {
    console.log(`Error navigating to the page: ${error}`);
    await browser.close();
    return;
  }

  // Wait for user to solve CAPTCHA manually if present
  console.log("Waiting for 30 seconds to solve CAPTCHA if present...");
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

  // Step 1: Open the "Sort by" dropdown menu
  try {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Human-like delay
    const sortButton = await page.waitForSelector('button.SortButton__SortHeading-sc-9222f06-0', { visible: true });
    await simulateHumanMouseMovement(page, sortButton);
    await sortButton.click();
    console.log("Sort by dropdown opened.");
  } catch (error) {
    console.log(`Error opening the Sort by dropdown: ${error}`);
    await browser.close();
    return;
  }

  // Step 2: Select the "Price" option from the dropdown
  try {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Human-like delay
    console.log("Selecting the 'Price' option...");

    const priceOption = await page.waitForSelector('div.Options-sc-6f2435fa-0 button:contains("Price")', { visible: true });

    if (priceOption) {
      await simulateHumanMouseMovement(page, priceOption);
      await priceOption.click();
      console.log("Price option clicked.");
    } else {
      throw new Error("Price option not found.");
    }

    // Wait for the page to sort by price and reload
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10000 + 5000)); // Longer human-like delay
  } catch (error) {
    console.log(`Error selecting the correct 'Price' option: ${error}`);
    await browser.close();
    return;
  }

  // Step 3: Scrape the first 5 prices from the sorted results
  try {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // Human-like delay
    const priceElements = await page.$$('span.atm_7l_1vdhuoi.atm_c8_1ns2gi5'); // Adjust selector if necessary

    if (priceElements.length === 0) {
      console.log("No prices found.");
    } else {
      console.log("First 5 prices:");
      for (let i = 0; i < Math.min(5, priceElements.length); i++) {
        const priceText = await priceElements[i].evaluate(el => el.textContent.trim());
        console.log(priceText);
      }
    }
  } catch (error) {
    console.log(`Error retrieving prices: ${error}`);
  }

  // Close the browser
  await browser.close();
})();
