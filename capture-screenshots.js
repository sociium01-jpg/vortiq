import puppeteer from 'puppeteer';
import path from 'path';

const artifactDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\03243d5e-4fb7-4b93-931d-5fe0bfe5720a';
const liveUrl = 'https://vortiq-app-932621312242.asia-south1.run.app';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capture() {
  console.log('Launching Chrome from:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 1. Desktop Screenshot (1440 x 900)
    console.log('Capturing Desktop Screenshot...');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await desktopPage.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await desktopPage.waitForSelector('#hero', { timeout: 10000 });
    const desktopPath = path.join(artifactDir, 'landing_desktop.png');
    await desktopPage.screenshot({ path: desktopPath, fullPage: true });
    console.log('Desktop Screenshot saved to:', desktopPath);

    // 2. Mobile Screenshot (375 x 812)
    console.log('Capturing Mobile Screenshot...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
    await mobilePage.goto(liveUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await mobilePage.waitForSelector('#hero', { timeout: 10000 });
    const mobilePath = path.join(artifactDir, 'landing_mobile.png');
    await mobilePage.screenshot({ path: mobilePath, fullPage: true });
    console.log('Mobile Screenshot saved to:', mobilePath);

  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
