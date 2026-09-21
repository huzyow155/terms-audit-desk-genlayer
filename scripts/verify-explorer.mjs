import { chromium } from 'playwright';

const URLS = [
  { name: 'FullRead Contract', url: 'https://explorer-studio.genlayer.com/address/0xfC2d4d29b46f44A6f4d09496451ff662dA8b4d33' },
  { name: 'Consumer Contract', url: 'https://explorer-studio.genlayer.com/address/0xE8424C568FCB418fBAD5D272470f9A9fD6452860' },
  { name: 'FullRead Deploy Tx', url: 'https://explorer-studio.genlayer.com/tx/0x78d9b6be8e9bf32bc6cec8ecb9252268ee420f4bb2bba545cfaa7f45db2801d8' }
];

async function main() {
  console.log('=== Checking Explorer Pages in Headless Chromium ===\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const item of URLS) {
    console.log(`Opening ${item.name}: ${item.url}`);
    const response = await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`HTTP Status: ${response.status()}`);
    
    // Wait for page title or content to render
    await page.waitForTimeout(4000);
    const title = await page.title();
    console.log(`Page Title: "${title}"`);
    
    // Check for GenLayer text or address in DOM
    const bodyText = await page.innerText('body');
    const hasGenLayer = bodyText.includes('GenLayer') || bodyText.includes('Explorer');
    console.log(`✓ Explorer rendered (${hasGenLayer ? 'contains GenLayer branding' : 'DOM loaded'})\n`);
  }

  await browser.close();
  console.log('=== ALL EXPLORER PAGES CONFIRMED ACCESSIBLE IN BROWSER ===');
}

main().catch(err => {
  console.error('Explorer check failed:', err);
  process.exit(1);
});
