const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  if (!fs.existsSync('docs/screenshots')) {
    fs.mkdirSync('docs/screenshots', { recursive: true });
  }

  await page.screenshot({ path: 'docs/screenshots/preview.png' });
  
  // also take screenshot of the matches page
  await page.goto('http://localhost:5173/matches', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'docs/screenshots/preview_matches.png' });

  await browser.close();
  console.log('Screenshots taken successfully.');
})();
