// Parcours de jeu complet (invite -> select -> plan -> combat -> boutique -> mort)
// en capturant toute erreur JS / console, et en verifiant que les polices locales
// chargent sans aucune requete reseau externe.
//   cd tests && npm run qa
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8128;
const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch();
// Bloque tout le reseau hors localhost -> prouve que le jeu marche 100% hors-ligne
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route('**/*', r => r.request().url().includes(`localhost:${PORT}`) ? r.continue() : r.abort());
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push('PAGEERR: ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 5).join('\n')));
page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
const blocked = [];
page.on('requestfailed', r => { if (!r.url().includes(`localhost:${PORT}`)) blocked.push(r.url().split('/').pop()); });
await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(600);

const fontsOk = await page.evaluate(async () => {
  await document.fonts.ready;
  return { count: document.fonts.size, pixel: document.fonts.check("10px 'Press Start 2P'"), grotesk: document.fonts.check("700 14px 'Space Grotesk'") };
});
console.log('fonts:', JSON.stringify(fontsOk), '| externalBlocked:', blocked.join(',') || 'none');

async function inst(fn) {
  return page.evaluate((body) => {
    const el = document.getElementById('pm-root'); if (!el) return 'no pm-root';
    const k = Object.keys(el).find(k => k.startsWith('__reactFiber$')); let f = el[k];
    let found = null; while (f) { if (f.stateNode && typeof f.stateNode.beginCombat === 'function') { found = f.stateNode; break; } f = f.return; }
    if (!found) return 'no instance';
    const r = new Function('app', body)(found);
    return r === undefined ? 'ok' : r;
  }, 'return (' + fn + ')(app);');
}

const results = {};
// Entree en invite -> select -> run mage
await inst(`app=>{ app.playAsGuest(); }`); await page.waitForTimeout(300);
await inst(`app=>{ app.startRun('mage'); }`); await page.waitForTimeout(300);
results.startRun = await inst(`app=>app.state.screen`);

// Combat force
await inst(`app=>{ app._queue=[app.makePawn(0)]; app._qi=0; app.beginCombat(app._queue[0]); }`); await page.waitForTimeout(400);
results.combat = await inst(`app=>({screen:app.state.screen, hand:app.state.chand.length, enemyHp:(app.state.enemy||{}).hp})`);
const combatErrs0 = errs.length;
// joue jusqu'a 12 tours (en respectant le flag busy temps-reel) pour tenter de vaincre
for (let i = 0; i < 12; i++) {
  const done = await inst(`app=>{
    if(app.state.screen!=='combat'||!app.state.enemy) return 'left-combat:'+app.state.screen;
    if(app.state.busy) return 'busy';
    const ids=app.state.chand.slice(0,3).map(c=>c.uid);
    app.setState({csel:ids}); app.play();
    return 'played';
  }`);
  await page.waitForTimeout(950);
  if (typeof done === 'string' && done.startsWith('left-combat')) { results.combatEnd = done; break; }
}
results.afterCombat = await inst(`app=>({screen:app.state.screen, gold:app.state.gold})`);
results.combatErrs = errs.length - combatErrs0;

// Boutique : ouvre et achete
await inst(`app=>{ app.setState({gold:99}); app.floorComplete(); }`); await page.waitForTimeout(400);
results.shop = await inst(`app=>({screen:app.state.screen, hasShop:!!app.state.shop})`);
const shopErr0 = errs.length;
await inst(`app=>{ app.buyShop('jokers',0); app.buyShop('pieces',0); app.buyShop('cards',0); app.rerollShop(); }`); await page.waitForTimeout(300);
results.afterBuy = await inst(`app=>({jokers:app.state.jokers.length, gold:app.state.gold})`);
await inst(`app=>{ app.leaveShop(); }`); await page.waitForTimeout(300);
results.leaveShop = await inst(`app=>app.state.screen`);
results.shopErrs = errs.length - shopErr0;

// Mort -> resultat
await inst(`app=>{ app.death(); }`); await page.waitForTimeout(300);
results.death = await inst(`app=>app.state.screen`);

console.log('\n=== QA RESULTS ===');
console.log(JSON.stringify(results, null, 2));
console.log('\n=== ALL ERRORS (' + errs.length + ') ===');
console.log(errs.length ? errs.join('\n') : '(none)');
await browser.close(); srv.kill();
process.exit(errs.length ? 1 : 0);
