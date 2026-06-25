// Matrice responsive : verifie que chaque ecran tient (sans debordement ni clipping)
// sur mobile / tablette / laptop / desktop / TV, en portrait, paysage et rotation live.
//   cd tests && npm run setup   (une fois)
//   npm run devices
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8133;
const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch();

const DEVICES = [
  // classe, nom, largeur, hauteur, dpr, rotation testee ?
  ['MOBILE', 'iPhone SE', 320, 568, 2, true],
  ['MOBILE', 'iPhone 13', 390, 844, 3, true],
  ['MOBILE', 'iPhone 15 Pro Max', 430, 932, 3, true],
  ['MOBILE', 'Pixel 7', 412, 915, 2.6, true],
  ['MOBILE', 'Galaxy S8 (tall)', 360, 740, 4, true],
  ['TABLET', 'iPad mini', 768, 1024, 2, true],
  ['TABLET', 'iPad Pro 11', 834, 1194, 2, true],
  ['TABLET', 'iPad Pro 12.9', 1024, 1366, 2, true],
  ['LAPTOP', 'MacBook Air 13', 1280, 800, 2, false],
  ['LAPTOP', 'MacBook Pro 14', 1512, 982, 2, false],
  ['LAPTOP', 'Laptop 1366', 1366, 768, 1, false],
  ['LAPTOP', 'Surface 1504', 1504, 1000, 1.5, false],
  ['DESKTOP', 'FHD', 1920, 1080, 1, false],
  ['DESKTOP', 'QHD', 2560, 1440, 1, false],
  ['DESKTOP', 'Ultrawide', 3440, 1440, 1, false],
  ['TV', 'TV 720p', 1280, 720, 1, false],
  ['TV', 'TV 1080p', 1920, 1080, 1, false],
  ['TV', 'TV 4K', 3840, 2160, 1, false],
];
const SCREENS = ['home', 'select', 'plan', 'combat', 'shop', 'result'];

// recupere l'instance du composant React depuis la fiber de #pm-root
async function inst(page, b) {
  return page.evaluate((b) => {
    const el = document.getElementById('pm-root'); if (!el) return null;
    const k = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
    let f = el[k], app = null;
    while (f) { if (f.stateNode && typeof f.stateNode.startRun === 'function') { app = f.stateNode; break; } f = f.return; }
    return app ? new Function('app', 'return (' + b + ')(app)')(app) : null;
  }, b);
}
async function goto(page, scr) {
  if (scr === 'home') await inst(page, `a=>a.setState({screen:'home',account:null})`);
  else if (scr === 'select') await inst(page, `a=>a.setState({screen:'select'})`);
  else if (scr === 'plan') await inst(page, `a=>a.startRun('mage')`);
  else if (scr === 'combat') { await inst(page, `a=>a.startRun('mage')`); await page.waitForTimeout(120); await inst(page, `a=>{a._queue=[a.makePawn(0)];a._qi=0;a.beginCombat(a._queue[0]);}`); }
  else if (scr === 'shop') { await inst(page, `a=>a.startRun('mage')`); await page.waitForTimeout(120); await inst(page, `a=>{a.setState({gold:99});a.floorComplete();}`); }
  else if (scr === 'result') { await inst(page, `a=>a.startRun('mage')`); await page.waitForTimeout(100); await inst(page, `a=>a.death()`); }
  await page.waitForTimeout(320);
}
async function measure(page) {
  return page.evaluate(() => {
    const iw = innerWidth, ih = innerHeight;
    const root = document.getElementById('pm-root');
    const wrap = root && root.firstElementChild;
    const r = wrap && wrap.getBoundingClientRect();
    const ox = document.documentElement.scrollWidth - iw;
    return { iw, ih, ox, rect: r ? { l: Math.round(r.left), t: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) } : null };
  });
}
function over(m) { const t = 2; return m.ox > t || !m.rect || m.rect.l < -t || m.rect.t < -t || m.rect.right > m.iw + t || m.rect.bottom > m.ih + t; }

const fails = []; let pass = 0, total = 0;
for (const [cls, name, w, h, dpr, rot] of DEVICES) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load' }); await page.waitForTimeout(250);
  for (const scr of SCREENS) {
    await goto(page, scr); total++;
    const m = await measure(page);
    if (over(m)) fails.push(`[${cls}] ${name} ${w}x${h} ${scr}: rect=${JSON.stringify(m.rect)} ox=${m.ox}`); else pass++;
  }
  if (rot) {
    await goto(page, 'plan');
    await page.setViewportSize({ width: h, height: w }); await page.waitForTimeout(450); total++;
    const mr = await measure(page);
    if (over(mr)) fails.push(`[${cls}] ${name} ROTATED->${h}x${w} plan: rect=${JSON.stringify(mr.rect)}`); else pass++;
  }
  if (errs.length) fails.push(`[${cls}] ${name}: JS ERROR ${errs.join('|')}`);
  await ctx.close();
}
console.log(`=== DEVICE MATRIX: ${pass}/${total} checks fit ===`);
console.log(fails.length ? 'PROBLEMS:\n' + fails.join('\n') : 'ALL PASS — everything fits on mobile, tablet, laptop, desktop, TV (incl. live rotation).');
await browser.close(); srv.kill();
process.exit(fails.length ? 1 : 0);
