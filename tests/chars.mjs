// Vérifie les nouveaux personnages et la différenciation façon Balatro :
// échelle de déblocage, profils (défausses / pioches / main de cartes / formes),
// pentominos du Voleur, pouvoir du Tricheur (-1 carte), soin du Paladin.
//   cd tests && node chars.mjs
// Note: setState est asynchrone -> toujours action, puis attente, puis lecture.
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8155;
const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: ROOT, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(500);

async function inst(fn) {
  return page.evaluate((body) => {
    const el = document.getElementById('pm-root');
    const k = Object.keys(el).find(k => k.startsWith('__reactFiber$')); let f = el[k];
    let app = null; while (f) { if (f.stateNode && typeof f.stateNode.startRun === 'function') { app = f.stateNode; break; } f = f.return; }
    return new Function('app', body)(app);
  }, 'return (' + fn + ')(app);');
}
const wait = ms => page.waitForTimeout(ms);
const results = []; let pass = 0, fail = 0;
function check(name, cond, detail) { if (cond) { pass++; results.push('  ✓ ' + name); } else { fail++; results.push('  ✗ ' + name + (detail ? ' — ' + detail : '')); } }

// ---- 1. Échelle de déblocage 1/3/5/7 ----
await inst(`app=>{ app.startRun('chevalier'); app.setState({unlocked:[]}); }`);
await wait(280); // laisse genFloor créer la grille
const ladder = [];
for (let i = 0; i < 7; i++) {
  await inst(`app=>{ app.state.grid.boss=true; app.floorComplete(); }`);
  await wait(170);
  ladder.push(await inst(`app=>({beaten:app.state.bossesBeaten, nu:app.state.newUnlock})`));
}
const nuAt = b => { const s = ladder.find(x => x.beaten === b); return (s && s.nu) ? s.nu : []; };
check('Mage débloqué à 1 boss', nuAt(1).includes('mage'), JSON.stringify(nuAt(1)));
check('Voleur débloqué à 3 boss', nuAt(3).includes('voleur'), JSON.stringify(nuAt(3)));
check('Paladin débloqué à 5 boss', nuAt(5).includes('paladin'), JSON.stringify(nuAt(5)));
check('Tricheur débloqué à 7 boss', nuAt(7).includes('tricheur'), JSON.stringify(nuAt(7)));
check('Rien débloqué à 2 boss', nuAt(2).length === 0, JSON.stringify(nuAt(2)));

// ---- 2. Profils par perso ----
const expected = {
  chevalier: { draws: 3, discards: 3, cards: 8, set: 'tetro' },
  mage: { draws: 3, discards: 3, cards: 9, set: 'tetro' },
  voleur: { draws: 4, discards: 4, cards: 8, set: 'pento' },
  paladin: { draws: 3, discards: 2, cards: 8, set: 'tetro' },
  tricheur: { draws: 3, discards: 5, cards: 9, set: 'mini' },
};
for (const key of Object.keys(expected)) {
  const e = expected[key];
  await inst(`app=>{ app.startRun('${key}'); }`);
  await wait(220);
  const p1 = await inst(`app=>({drawsLeft:app.state.drawsLeft, setName:app.CHARS['${key}'].shapes,
    setKeys:app.SHAPE_SETS[app.CHARS['${key}'].shapes], handKeys:app.state.hand.map(p=>p.key)})`);
  await inst(`app=>{ app._queue=[app.makePawn(0)]; app._qi=0; app.beginCombat(app._queue[0]); }`);
  await wait(160);
  const p2 = await inst(`app=>({discardsLeft:app.state.discardsLeft, hand:app.state.chand.length})`);
  check(`${key}: ${e.draws} pioches de pièces`, p1.drawsLeft === e.draws, 'got ' + p1.drawsLeft);
  check(`${key}: ${e.discards} défausses`, p2.discardsLeft === e.discards, 'got ' + p2.discardsLeft);
  check(`${key}: main de ${e.cards} cartes`, p2.hand === e.cards, 'got ' + p2.hand);
  check(`${key}: jeu de formes '${e.set}'`, p1.setName === e.set, 'got ' + p1.setName);
  check(`${key}: pièces de départ ⊂ ${e.set}`, p1.handKeys.every(k => p1.setKeys.includes(k)), p1.handKeys.join(','));
}

// ---- 3. Voleur = pentominos (5 cases) ----
const vol = await inst(`app=>{ const keys=app.SHAPE_SETS.pento; const sizes=keys.map(k=>app.SHAPES[k].length);
  return {sizes, all5:sizes.every(s=>s===5)}; }`);
check('Voleur: toutes les formes pento font 5 cases', vol.all5, JSON.stringify(vol.sizes));

// ---- 4. Pouvoir Tricheur : -1 carte ----
await inst(`app=>{ app.startRun('tricheur'); }`);
await wait(200);
const cheat = await inst(`app=>{
  const s4=[{rank:5,suit:'♥',uid:'a'},{rank:6,suit:'♦',uid:'b'},{rank:7,suit:'♣',uid:'c'},{rank:8,suit:'♠',uid:'d'}];
  const one=[{rank:9,suit:'♥',uid:'e'}];
  app.state.cheatArmed=false; const off4=app.detect(s4).type; const off1=app.detect(one).type;
  app.state.cheatArmed=true;  const on4=app.detect(s4).type;  const on1=app.detect(one).type;
  app.state.cheatArmed=false;
  return {off4,on4,off1,on1};
}`);
check('Sans triche : 4 cartes consécutives = carte haute', cheat.off4 === 'haute', cheat.off4);
check('Avec triche : 4 cartes consécutives = suite', cheat.on4 === 'suite', cheat.on4);
check('Sans triche : 1 carte = carte haute', cheat.off1 === 'haute', cheat.off1);
check('Avec triche : 1 carte = paire', cheat.on1 === 'paire', cheat.on1);

// ---- 5. Soin Paladin (+15 par combat gagné) ----
await inst(`app=>{ app.startRun('paladin'); }`);
await wait(200);
await inst(`app=>{ app.setState({php:app.state.pmax-50, enemy:{hp:1,gold:5,name:'Test',kind:'normal',atk:5,vit:5}}); }`);
await wait(140);
await inst(`app=>{ app.winCombat(); }`);
await wait(220);
const palHp = await inst(`app=>({php:app.state.php, pmax:app.state.pmax})`);
check('Paladin: +15 PV après combat gagné', palHp.php === palHp.pmax - 35, 'php=' + palHp.php + ' attendu ' + (palHp.pmax - 35));

// ---- 5b. Pièces pré-orientées (chaque forme+sens = pièce distincte) ----
await inst(`app=>{ app.startRun('voleur'); }`); await wait(220);
const orient = await inst(`app=>({allRot:app.state.hand.every(p=>Number.isInteger(p.rot)), variants:new Set(app.state.hand.map(p=>p.key+'@'+p.rot)).size})`);
check('Pièces tirées : orientation figée (forme+sens)', orient.allRot === true);

// ---- 6. Offres de recharge en boutique (pouvoir consommé) ----
await inst(`app=>{ app.startRun('tricheur'); }`); await wait(180);
await inst(`app=>{ app.setState({cheatUsed:true}); }`); await wait(130);
const shopT = await inst(`app=>{ const s=app.genShop(); return !!s.cheatReset; }`);
check('Tricheur: recharge de triche proposée en boutique', shopT === true);
await inst(`app=>{ app.startRun('mage'); }`); await wait(180);
await inst(`app=>{ app.setState({portalUsed:true}); }`); await wait(130);
const shopM = await inst(`app=>{ const s=app.genShop(); return !!s.portalReset; }`);
check('Mage: recharge de portail proposée en boutique', shopM === true);

console.log('\n=== TESTS PERSONNAGES ===');
console.log(results.join('\n'));
console.log(`\n${pass} réussis, ${fail} échoués · erreurs JS: ${errs.length}`);
if (errs.length) console.log(errs.join('\n'));
await browser.close(); srv.kill();
process.exit(fail || errs.length ? 1 : 0);
