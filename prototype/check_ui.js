import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const logs = [];
page.on('console', msg => logs.push(msg.text()));
page.on('pageerror', err => logs.push('ERROR: ' + err.message));
await page.goto('http://localhost:3000/vishal-s-workspace/KD-990#triage', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Click Sim Reports tab if not active
await page.evaluate(() => {
  if (typeof setView === 'function') setView('triage');
});
await page.waitForTimeout(1500);

const view = await page.evaluate(() => document.body.getAttribute('data-view'));
console.log('data-view:', view);

const priDropdowns = await page.$$eval('.tg-pri-kdd, select.tg-pri, .kdd-btn', els => els.map(e => ({
  tag: e.tagName,
  cls: e.className,
  text: e.innerText?.trim(),
  visible: e.offsetParent !== null,
  rect: e.getBoundingClientRect()
})));
console.log('Pri dropdowns found:', JSON.stringify(priDropdowns, null, 2));

// Test clicking the first kdd-btn if available
const btn = await page.$('.tg-pri-kdd .kdd-btn');
if (btn) {
  console.log('Clicking .tg-pri-kdd .kdd-btn...');
  await btn.click();
  await page.waitForTimeout(500);
  const menuInfo = await page.evaluate(() => {
    const m = document.querySelector('.tg-pri-kdd .kdd-menu');
    if (!m) return 'No menu found';
    return {
      classes: m.className,
      rect: m.getBoundingClientRect(),
      styleDisplay: window.getComputedStyle(m).display,
      styleVisibility: window.getComputedStyle(m).visibility,
      styleZIndex: window.getComputedStyle(m).zIndex,
      items: Array.from(m.querySelectorAll('.kdd-item')).map(it => it.innerText.trim())
    };
  });
  console.log('Menu info after click:', JSON.stringify(menuInfo, null, 2));
} else {
  console.log('No .tg-pri-kdd .kdd-btn found!');
}

await page.screenshot({ path: 'C:/Users/bathu/.gemini/antigravity-ide/brain/8e036393-7653-46ae-bc14-56a24d11d09e/.tempmediaStorage/triage_debug.png' });
await browser.close();
