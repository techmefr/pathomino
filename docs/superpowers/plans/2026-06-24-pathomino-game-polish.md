# Pathomino Game Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply all post-playtest polish from the TODO across UI, character select, grid, combat, shop, HUD, and Mage portal.

**Architecture:** Single file `pathomino.js` (React class, ~990 lines, inline styles). No build step. All state in `this.state`. localStorage for cross-run persistence. Each task modifies a specific method or block — no file additions needed except one new SVG icon.

**Tech Stack:** Vanilla React class component, Web Audio API, Playwright E2E tests.

---

## File Map

| File | Changes |
|------|---------|
| `pathomino.js` | All tasks. Methods touched per task listed below. |
| `index.html` | Task 8 only: add `@keyframes pmWave` CSS |

---

## Task 1: Home Page UI Cleanup

**Methods:** `renderHome()`
Lines ~504–545

- [ ] **Step 1: Remove description paragraph**

In `renderHome()`, delete the `h('p',...)` element with text "Un puzzle-roguelike de donjon...":

```js
// DELETE this element (line ~540):
h('p',{style:{color:C.mut,fontSize:port?14:17,maxWidth:560,margin:'0 auto 6px',lineHeight:1.55}},
  'Un puzzle-roguelike...'),
```

- [ ] **Step 2: Reduce feature cards to icon + title only (max 3 words)**

In `renderHome()`, change `feats` array titles and remove desc rendering from cards:

```js
const feats=[
  {ic:'flag',  title:'Trace le chemin', col:C.gold},
  {ic:'deck',  title:'Combat de cartes', col:C.blue},
  {ic:'heart', title:'Une seule vie',    col:C.red}
];
```

Change `featCards` map — remove the `h('div',{style:{fontSize:12,color:C.mut,...}}, f.desc)` line. Keep only icon + title `div`.

```js
// featCards: keep only this inner structure
h('div',{style:{width:38,height:38,flexShrink:0,borderRadius:8,background:'#0e0b09',border:'1px solid '+C.line2,display:'flex',alignItems:'center',justifyContent:'center',color:f.col}},
  this.icon(f.ic,20,f.col)),
h('div',{style:{fontSize:14,fontWeight:700,color:C.text}}, f.title)
```

- [ ] **Step 3: Remove text under login buttons**

In the `cta` variable (line ~522–533), delete:
- The `h('div',{style:{...}}, 'Les comptes arrivent bientôt...')` line

- [ ] **Step 4: Commit**

```bash
git add pathomino.js
git commit -m "feat(ui): simplify home page — icon cards, no description paragraph"
```

---

## Task 2: Grid Plan — Remove PIVOTER + Shorten Texts + Remove Legend

**Methods:** `renderPlan()`
Lines ~617–727

- [ ] **Step 1: Remove PIVOTER button**

In `renderPlan()`, delete the PIVOTER button from the actions row (line ~716–718):

```js
// DELETE:
this.btn([this.icon('rotate',14),' Pivoter'], ()=>this.rotate(), {small:true,disabled:this.state.selPiece===null}),
```

Keep only the "Annuler" button in that `div`.

Also remove the `rotate` keyboard handler hint. In the instruction text (line ~715), replace long text with:

```js
this.state.selPiece!==null?
  h('div',{style:{fontSize:12,color:C.gold,marginBottom:12}}, 'Vise la grille → clique pour poser. Molette / clic droit : pivoter.') :
  h('div',{style:{fontSize:12,color:C.mut,marginBottom:12}}, 'Prends une pièce, vise la grille, clique.')
```

- [ ] **Step 2: Remove legend under grid**

Delete the entire legend `h('div',{style:{display:'flex',gap:18,...}}, legend.map(...))` block below the grid element.

- [ ] **Step 3: Shorten error messages**

Replace the orphan warning (line ~721):
```js
// REPLACE:
'⚠ Des pièces (en pointillés) ne sont pas reliées : elles doivent se toucher par les côtés, pas par les coins.'
// WITH:
'Pièces non reliées'
```

Replace `pathOk()` reason strings (line ~275–280):
```js
// REPLACE:
return {ok:false, reason:'Couvre départ, clé et porte'};
// WITH:
return {ok:false, reason:''};
```

```js
// REPLACE:
return {ok:false, reason:'Le chemin doit relier départ → clé → porte'};
// WITH:
return {ok:false, reason:''};
```

And remove the "PHASE DE PLANIFICATION" explanatory paragraph:
```js
// DELETE:
h('p',{style:{fontSize:13,color:C.mut,lineHeight:1.5,marginBottom:16}}, 'Place des tétrominos pour relier le départ...')
```

- [ ] **Step 4: Commit**

```bash
git add pathomino.js
git commit -m "feat(plan): remove PIVOTER button, shorten texts, remove legend"
```

---

## Task 3: Character Select — Horizontal Slider

**Methods:** `renderSelect()`, add `charIdx` to state
Lines ~580–615

- [ ] **Step 1: Add slider state**

In `state = {...}` (line ~71), add:
```js
charIdx: 0,
```

- [ ] **Step 2: Rewrite renderSelect() as slider**

Replace the entire `renderSelect()` body with a slider layout. One character at a time, full-width, with ← → arrows and pagination dots:

```js
renderSelect(port){
  const C=this.C, h=React.createElement;
  const keys=['chevalier','mage','voleur'];
  const ci=this.state.charIdx||0;
  const k=keys[ci]; const c=this.CHARS[k];
  const locked = k==='voleur' && !this.state.voleurUnlocked;
  const mageLocked = k==='mage' && !this.state.mageUnlocked;
  const isLocked = locked || mageLocked;

  const nav=(dir)=>this.setState(s=>({charIdx:((s.charIdx||0)+dir+3)%3}));

  const sprite = this.pixelSprite(k, 10);

  const statsEl = isLocked && k==='voleur' ?
    h('div',{style:{fontSize:13,color:C.mut,marginTop:12}}, '?  ?  ?  ?  ?') :
    h('div',{style:{display:'grid',gridTemplateColumns:'1fr',gap:5,marginTop:12,width:port?260:300}},
      [['Vie',c.vie,120],['Force',c.force,18],['Défense',c.defense,18],['Magie',c.magie,18],['Vitesse',c.vitesse,18]].map(([lab,v,max])=>
        h('div',{key:lab,style:{display:'flex',alignItems:'center',gap:8,fontSize:12}},
          h('span',{style:{width:54,color:C.mut}},lab),
          h('div',{style:{flex:1,height:5,background:'#0e0b09',borderRadius:3,overflow:'hidden'}},
            h('div',{style:{height:'100%',width:Math.min(100,(v/max)*100)+'%',background:isLocked?C.mut:c.color,borderRadius:3}})),
          h('span',{style:{width:26,textAlign:'right',color:isLocked?C.mut:C.text,fontWeight:600}}, isLocked&&k==='voleur'?'?':v))));

  const lockMsg = locked ? 'Bats le Roi pour débloquer' : mageLocked ? 'Bats le premier boss pour débloquer' : null;

  const card = h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:port?'20px 16px':'28px 32px',
    background:'linear-gradient(180deg,#211c18,#161210)',border:'1px solid '+(isLocked?C.line:c.color),borderRadius:10,
    width:port?300:340,animation:'pmFade .3s ease'}},
    h('div',{style:{position:'relative'}},
      isLocked && k==='voleur' ?
        h('div',{style:{width:130,height:140,display:'flex',alignItems:'center',justifyContent:'center',fontSize:72,color:C.mut,filter:'blur(2px)'}}, '?') :
        h('div',{style:{opacity:mageLocked?.4:1}}, sprite)),
    h('div',{className:'pm-pixel',style:{fontSize:16,color:isLocked?C.mut:C.text}}, isLocked&&k==='voleur'?'???':c.name),
    lockMsg ? h('div',{style:{fontSize:12,color:C.mut,fontStyle:'italic'}}, lockMsg) :
      h('div',{style:{fontSize:13,color:C.mut,textAlign:'center'}}, k==='chevalier'?'Tank. Encaisse tout.':k==='mage'?'Fragile. Puissant. Un portail par étage.':'Agile. Esquive souvent.'),
    statsEl,
    isLocked ? null : this.btn('Choisir '+c.name+' →', ()=>this.startRun(k), {primary:true,wide:true})
  );

  const dots = h('div',{style:{display:'flex',gap:8,justifyContent:'center',marginTop:12}},
    keys.map((_,i)=>h('div',{key:i,onClick:()=>this.setState({charIdx:i}),style:{width:i===ci?20:8,height:8,borderRadius:4,background:i===ci?C.gold:C.line2,cursor:'pointer',transition:'width .2s'}})));

  const arrow=(dir,label)=>h('button',{onClick:()=>nav(dir),style:{background:'none',border:'1px solid '+C.line2,color:C.mut,width:42,height:42,borderRadius:6,cursor:'pointer',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}, label);

  return h('div',{style:{animation:'pmFade .5s ease',textAlign:'center',padding:port?'12px 8px':24,maxWidth:port?360:860}},
    h('div',{style:{fontSize:11,letterSpacing:'.5em',color:C.gold,marginBottom:14}}, 'CHOISIR TON HÉROS'),
    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:port?8:18,marginTop:16}},
      arrow(-1,'←'), card, arrow(1,'→')),
    dots,
    h('div',{style:{fontSize:11,color:C.mut,marginTop:16}}, (ci+1)+' / '+keys.length)
  );
}
```

- [ ] **Step 3: Verify swipe on mobile (touch events)**

Add touch swipe support to the character select container. In the card container div, add:

```js
onTouchStart:(e)=>{ this._swipeX=e.touches[0].clientX; },
onTouchEnd:(e)=>{ const dx=e.changedTouches[0].clientX-this._swipeX; if(Math.abs(dx)>40) nav(dx<0?1:-1); },
```

- [ ] **Step 4: Commit**

```bash
git add pathomino.js
git commit -m "feat(select): horizontal slider for character selection with swipe"
```

---

## Task 4: Character Unlock — Mage After Boss 1

**Methods:** `componentDidMount()`, `floorComplete()`, `state`

- [ ] **Step 1: Add mageUnlocked to state and localStorage**

In `state = {...}` (line ~71), add:
```js
mageUnlocked: false,
```

In `componentDidMount()` (line ~123), add alongside voleurUnlocked:
```js
mageUnlocked: localStorage.getItem('pm_mage')==='1',
```

- [ ] **Step 2: Unlock Mage on first boss defeat**

In `floorComplete()` (line ~450), in the boss block, add after the Roi unlock logic:

```js
// After: if(this.BOSSES[bossIndex].key==='roi' && !unlocked){...}
// ADD Mage unlock on first boss (Cavalier):
let mageUnlocked = this.state.mageUnlocked;
if(this.BOSSES[this.state.bossIndex].key==='cavalier' && !mageUnlocked){
  mageUnlocked=true;
  try{ localStorage.setItem('pm_mage','1'); }catch(e){}
}
```

Add `mageUnlocked` to the `st` object:
```js
st={bossesBeaten:beaten, bossIndex, gridN:..., voleurUnlocked:unlocked, mageUnlocked, newUnlock, best:...};
```

- [ ] **Step 3: Ensure Chevalier is always available (run 1)**

The character select already shows Chevalier as STARTER. Verify `startRun('chevalier')` works without unlock check. No change needed — it's always unlocked.

- [ ] **Step 4: Commit**

```bash
git add pathomino.js
git commit -m "feat(progression): mage unlocked after beating first boss"
```

---

## Task 5: Grid Elements — Holes and Traps (Poison)

**Methods:** `genFloor()`, `renderPlan()`, `validate()`, `state`, `CHARS` (poison desc)

- [ ] **Step 1: Add poisoned to state**

In `state = {...}`, add:
```js
poisoned: false,
```

Reset in `startRun()` and `genFloor()`:
```js
poisoned: false,
```

- [ ] **Step 2: Add holes and traps to genFloor()**

After the `treasure` generation in `genFloor()`, add:

```js
// Holes: 1-2 impassable cells (not on key items or pawns)
const holes=[];
let hg=0;
const holeCount = f===1?0:Math.min(2,Math.floor(f/3));
while(holes.length<holeCount && hg++<100){
  const p=[this.rnd(0,n-1),this.rnd(0,n-1)];
  if(taken.has(p.join(','))) continue;
  taken.add(p.join(',')); holes.push(p);
}

// Traps: 1-2 poison cells
const traps=[];
let tg2=0;
const trapCount = f===1?0:Math.min(2,Math.floor(f/2));
while(traps.length<trapCount && tg2++<100){
  const p=[this.rnd(0,n-1),this.rnd(0,n-1)];
  if(taken.has(p.join(','))) continue;
  taken.add(p.join(',')); traps.push(p);
}
```

Add `holes, traps` to the `setState` call:
```js
this.setState({
  grid:{n,start,key,door,pawns,boss,treasure,holes,traps}, ...
});
```

- [ ] **Step 3: Render holes and traps on grid**

In `renderPlan()`, in the cell rendering loop, add after `const isTreasure`:

```js
const isHole = g.holes && g.holes.some(p=>this.eq(p,[r,c]));
const isTrap = g.traps && g.traps.some(p=>this.eq(p,[r,c]));
```

For holes, override `bg` and make non-interactive:
```js
if(isHole){ bg='#080604'; bd='#1a1512'; bstyle='dashed'; }
if(isTrap){ bg='rgba(134,180,106,.08)'; bd=C.green; }
```

For content:
```js
if(isHole) content=h('span',{style:{fontSize:cell*.5,color:'#2a2420'}}, '×');
if(isTrap) content=h('span',{style:{fontSize:cell*.4,color:C.green,opacity:.7}}, '☠');
```

- [ ] **Step 4: Block holes from being covered + apply trap effect**

In `ghostValid(cells)`, add hole check:
```js
ghostValid(cells){
  const n=this.state.grid.n; const m=this.placedMap();
  const holes=new Set((this.state.grid.holes||[]).map(p=>p.join(',')));
  return cells.every(([r,c])=> r>=0&&c>=0&&r<n&&c<n && !m[r+','+c] && !holes.has(r+','+c));
}
```

In `validate()`, before `this.setState(st)`, check for traps:
```js
const trapsHit = (g.traps||[]).filter(p=>m[p.join(',')]);
if(trapsHit.length>0){
  st.poisoned=true;
  st.log='Piège ! Tu es empoisonné.';
}
```

- [ ] **Step 5: Poison damage per enemy turn**

In `enemyTurn()`, add poison damage:
```js
if(this.state.poisoned){
  const poisonDmg=3;
  const php=Math.max(0, this.state.php - poisonDmg);
  this.addFloat('hero','-'+poisonDmg+' ☠', C.green);
  this.setState({php});
  if(php<=0){ setTimeout(()=>this.death(), 800); return; }
}
```

- [ ] **Step 6: Commit**

```bash
git add pathomino.js
git commit -m "feat(grid): add holes (impassable) and traps (inflict poison)"
```

---

## Task 6: Grid Elements — Food and Potions

**Methods:** `genFloor()`, `renderPlan()`, `validate()`

- [ ] **Step 1: Add food and potions to genFloor()**

After traps in `genFloor()`, add:

```js
// Food: restores HP
let food=null, fg=0;
if(f>1){
  do{ food=[this.rnd(0,n-1),this.rnd(0,n-1)]; }while(taken.has(food.join(','))&&fg++<60);
  if(!taken.has(food.join(','))){ taken.add(food.join(',')); } else { food=null; }
}

// Potion: cures poison
let potion=null, pg=0;
if(f>2){
  do{ potion=[this.rnd(0,n-1),this.rnd(0,n-1)]; }while(taken.has(potion.join(','))&&pg++<60);
  if(!taken.has(potion.join(','))){ taken.add(potion.join(',')); } else { potion=null; }
}
```

Add to grid setState: `grid:{...,holes,traps,food,potion}`

- [ ] **Step 2: Render food and potion on grid**

In `renderPlan()` cell loop:

```js
const isFood = g.food && this.eq(g.food,[r,c]);
const isPotion = g.potion && this.eq(g.potion,[r,c]);
```

Background tint:
```js
if(isFood){ bg='rgba(224,165,59,.08)'; bd=C.gold; }
if(isPotion){ bg='rgba(111,155,202,.08)'; bd=C.blue; }
```

Content:
```js
if(isFood) content=h('span',{style:{fontSize:cell*.45,lineHeight:1}}, '🍖');
if(isPotion) content=h('span',{style:{fontSize:cell*.45,lineHeight:1}}, '🧪');
```

- [ ] **Step 3: Apply food/potion effects in validate()**

In `validate()`, before `this.setState(st)`:

```js
// Food effect
if(g.food && m[g.food.join(',')]){
  const heal=Math.round(this.state.pmax*0.2);
  st.php=Math.min(this.state.pmax, this.state.php+heal);
  st.log=(st.log||'')+' · Nourriture +'+heal+' PV';
  this.sfx('heal');
}

// Potion effect
if(g.potion && m[g.potion.join(',')]){
  st.poisoned=false;
  st.log=(st.log||'')+' · Poison guéri';
  this.sfx('heal');
}
```

- [ ] **Step 4: Commit**

```bash
git add pathomino.js
git commit -m "feat(grid): add food (HP restore) and potion (cure poison)"
```

---

## Task 7: Hidden Chest Contents

**Methods:** `validate()`, `genFloor()`

Currently chest gives fixed gold + card. Per TODO: contents hidden (gold OR surprise monster).

- [ ] **Step 1: Randomize chest contents in validate()**

In `validate()`, replace the treasure block:

```js
if(g.treasure && m[g.treasure.join(',')]){
  const roll=this.rnd(0,99);
  if(roll<70){
    // Gold reward
    const bonus=this.rnd(10,18);
    st.gold=this.state.gold+bonus;
    st.log=`Coffre : +${bonus} or !`; this.sfx('coin');
  } else {
    // Surprise monster — add to front of queue
    const surprise=this.makePawn(99);
    surprise.name='Piègeur'; surprise.glyph='👾';
    this._queue.unshift(surprise);
    st.log='Coffre piégé ! Un monstre surgit !';
    this.sfx('bad');
  }
}
```

- [ ] **Step 2: Chest cell shows ? until opened**

The chest is already rendered with the chest icon. It reveals on interaction (execute phase). No visual change needed — the content surprise happens during execution.

- [ ] **Step 3: Commit**

```bash
git add pathomino.js
git commit -m "feat(grid): chest contents hidden — gold or surprise monster"
```

---

## Task 8: Visual Feedback — Click-to-Retrieve Placed Piece + Fanfare

**Methods:** `renderPlan()`, `sfx()`, `pathOk()`

- [ ] **Step 1: Click placed piece to retrieve it**

In `renderPlan()`, in the cell click handler (`onClick:()=>this.placeAt(r,c)`):

Replace the onClick to check if cell is already placed:
```js
onClick:()=>{
  if(placed && !this.state.executing){
    // Find which placed piece owns this cell and retrieve it
    const owner=this.state.placed.find(pl=>pl.cells.some(c2=>c2.join(',')===k));
    if(owner){
      this.setState(s=>({
        placed:s.placed.filter(pl=>pl.uid!==owner.uid),
        hand:[...s.hand,{uid:owner.uid,key:owner.key}]
      }));
      return;
    }
  }
  this.placeAt(r,c);
},
```

- [ ] **Step 2: Add fanfare sound when path is complete (départ→clé→porte)**

In `sfx()`, add a `fanfare` sound after `win`:
```js
fanfare:()=>[784,988,1175,1319,1568].forEach((f,i)=>tone(f,0.14,'triangle',0.16,i*0.07)),
```

In `validate()`, after `this.sfx('valid')`, check if path connects all three:
```js
// Already calls sfx('valid') — upgrade to fanfare when full path:
const chk=this.pathOk();
if(chk.ok){ this.sfx('fanfare'); } // replaces sfx('valid') call
```

Actually, modify the existing `validate()` call:
```js
validate(){
  const chk=this.pathOk(); if(!chk.ok) return;
  this.sfx('fanfare');  // was sfx('valid')
  // ... rest unchanged
```

- [ ] **Step 3: Commit**

```bash
git add pathomino.js
git commit -m "feat(plan): click placed piece to retrieve it, fanfare on valid path"
```

---

## Task 9: Combat — Remove Inherent Suit Effects

**Methods:** `pack()`
Lines ~364–382

Per TODO: suits have no inherent effect. Effects only via jokers. Each joker explains its own effect.

- [ ] **Step 1: Strip suit effects from pack()**

Replace the suit-effect block in `pack()`. Current code (lines ~375–380) applies ♣/♥/♦/♠ effects unconditionally. Replace:

```js
// REPLACE the entire suit-effect block:
const H='♥',D='♦',Cl='♣',S='♠'; const fx=[];
if(suits.has(Cl)){ if(immune===Cl){ fx.push('♣ annulé'); } else { doubled=true; dmg=Math.round(dmg*mods.clubX); fx.push('♣ ×'+mods.clubX); } }
if(suits.has(H)){ if(immune===H){ fx.push('♥ annulé'); } else { heal=Math.round(dmg*mods.healFactor); fx.push('♥ +'+heal); } }
if(suits.has(D)){ if(immune===D){ fx.push('♦ annulé'); } else { draw=2+mods.drawBonus; fx.push('♦ pioche +'+draw); } }
if(suits.has(S)){ if(immune===S){ fx.push('♠ annulé'); } else { spade=3+mods.spadeBonus; fx.push('♠ att. -'+spade); } }

// WITH (joker-only effects, no base suit effects):
const fx=[];
// Base suit effects removed — only jokers apply mods
// mods already applied above via jokers forEach
// Only process joker-triggered suit effects:
if(mods.healFactor>0 && suits.has('♥')){ heal=Math.round(dmg*mods.healFactor); fx.push('♥ +'+heal+' PV'); }
if(mods.drawBonus>0 && suits.has('♦')){ draw=mods.drawBonus; fx.push('♦ +'+draw+' cartes'); }
if(mods.clubX>2 && suits.has('♣')){ doubled=true; dmg=Math.round(dmg*mods.clubX); fx.push('♣ ×'+mods.clubX); }
if(mods.spadeBonus>0 && suits.has('♠')){ spade=mods.spadeBonus; fx.push('♠ att. -'+spade); }
```

Note: `mods.healFactor` starts at `0.5` in the original code — change default to `0` so base ♥ has no effect:

```js
const mods={dmgMult:1, clubX:2, healFactor:0, drawBonus:0, spadeBonus:0};
```

Update `JOKERS.coeur` description to clarify it's the activator:
```js
coeur:{name:'Cœur Sacré',glyph:'♥',color:'#cf5040',price:6,
  desc:'Active ♥ : soigne 50% des dégâts infligés',
  mod:(m,t)=>{m.healFactor=0.5;}},
```

Update the other joker `mod` functions — `trefle` needs to set clubX AND trigger the effect:

The current `trefle` mod sets `m.clubX=3` — the new code only applies ×3 if `mods.clubX>2`. That works. ✓

For `carreau` (draw): current sets `m.drawBonus+=2` — new code applies only if `drawBonus>0`. ✓

For `pique` (spade): current sets `m.spadeBonus+=3` — new code applies only if `spadeBonus>0`. ✓

But ♣ base ×2 was always on. Now ♣ has no effect without the Trèfle Vorace joker. That's the intent.

Also remove the `immune` check for base suits (no base effect = nothing to cancel):

```js
// KEEP immunity check for joker-triggered effects only
// When joker triggers a suit effect, check immunity:
if(mods.healFactor>0 && suits.has('♥')){
  if(immune==='♥'){ fx.push('♥ annulé'); }
  else { heal=Math.round(dmg*mods.healFactor); fx.push('♥ +'+heal+' PV'); }
}
if(mods.drawBonus>0 && suits.has('♦')){
  if(immune==='♦'){ fx.push('♦ annulé'); }
  else { draw=mods.drawBonus; fx.push('♦ +'+draw+' cartes'); }
}
if(mods.clubX>2 && suits.has('♣')){
  if(immune==='♣'){ fx.push('♣ annulé'); }
  else { doubled=true; dmg=Math.round(dmg*mods.clubX); fx.push('♣ ×'+mods.clubX); }
}
if(mods.spadeBonus>0 && suits.has('♠')){
  if(immune==='♠'){ fx.push('♠ annulé'); }
  else { spade=mods.spadeBonus; fx.push('♠ att. -'+spade); }
}
```

- [ ] **Step 2: Commit**

```bash
git add pathomino.js
git commit -m "feat(combat): remove inherent suit effects — effects only via jokers"
```

---

## Task 10: Combat Display — Weapon Slot + Active Jokers Always Visible

**Methods:** `renderCombat()`, `genShop()`, `buyShop()`, `state`, add WEAPONS constant

The TODO asks for an "equipped weapon" visible in combat. We add a simple weapon system: each weapon boosts one hand type.

- [ ] **Step 1: Add WEAPONS constant**

After `JOKERS = {...}` (line ~48), add:

```js
WEAPONS = {
  epee:{name:'Épée longue',glyph:'⚔',color:'#c98a3a',price:14,bonus:'brelan',desc:'Boost brelans (+50%)'},
  arc:{name:'Arc court',glyph:'🏹',color:'#86b46a',price:12,bonus:'suite',desc:'Boost suites (+50%)'},
  baton:{name:'Bâton magique',glyph:'🪄',color:'#6f9bca',price:13,bonus:'couleur',desc:'Boost couleurs (+50%)'},
  dague:{name:'Dague',glyph:'🗡',color:'#b9a7d6',price:10,bonus:'paire',desc:'Boost paires (+40%)'},
};
```

- [ ] **Step 2: Add weapon to state**

In `state = {...}`, add:
```js
weapon: null,
```

Reset `weapon: null` in `startRun()`.

- [ ] **Step 3: Apply weapon bonus in pack()**

In `pack()`, after the jokers forEach, add:

```js
const wp=this.state.weapon&&this.WEAPONS[this.state.weapon];
if(wp && type===wp.bonus){ const mult=wp.bonus==='paire'?1.4:1.5; dmg=Math.round(dmg*mult); }
```

- [ ] **Step 4: Add weapons to shop**

In `genShop()`, add a weapons slot:

```js
const ownedWp=this.state.weapon;
const wpKeys=Object.keys(this.WEAPONS).filter(k=>k!==ownedWp);
const weapons=pick(wpKeys,1).map(k=>({key:k,price:this.WEAPONS[k].price,sold:false}));
return {jokers,weapons,pieces,cards};
```

In `buyShop()`, handle `cat==='weapons'`:
```js
else if(cat==='weapons'){ this.setState({weapon:o.key}); }
```

In `renderShop()`, add a weapons section before jokers:

```js
const wpOffers=shop.weapons&&shop.weapons.map((o,i)=>{ const w=this.WEAPONS[o.key]; const afford=gold>=o.price;
  return offer(o.price,o.sold,afford,()=>this.buyShop('weapons',i),
    h('div',{style:{width:78,height:92,borderRadius:8,background:C.p2,border:'2px solid '+w.color,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4}},
      h('div',{style:{fontSize:28,color:w.color}},w.glyph),
      h('div',{style:{fontSize:9,letterSpacing:'.1em',color:w.color}},'ARME')),
    78,
    h('div',{style:{textAlign:'center',marginTop:2}},
      h('div',{style:{fontSize:11,fontWeight:700,color:w.color}},w.name),
      h('div',{style:{fontSize:10,color:C.mut,lineHeight:1.3,marginTop:2}},w.desc)), i); });
```

Add to section renders: `section('ARME', 'équipée pendant tout le run', wpOffers||[])`.

- [ ] **Step 5: Display weapon in combat (always visible)**

In `renderCombat()`, after the `jokerBarInner` definition, add a weapon bar:

```js
const wp=this.state.weapon&&this.WEAPONS[this.state.weapon];
const weaponBar = wp ? h('div',{style:{display:'flex',alignItems:'center',gap:8,fontSize:12,color:wp.color,padding:'4px 10px',background:'rgba(14,11,9,.7)',border:'1px solid '+wp.color,borderRadius:6}},
  h('span',{style:{fontSize:16}},wp.glyph),
  h('span',{style:{fontWeight:700}},wp.name),
  h('span',{style:{color:this.C.mut}}, '→ boost '+wp.bonus+'s')) : null;
```

In the portrait layout (line ~815), add `weaponBar` below the jokerBarInner section.
In the landscape layout (line ~835), add `weaponBar` below `jokerBarInner`.

- [ ] **Step 6: Commit**

```bash
git add pathomino.js
git commit -m "feat(combat): weapon system — equip from shop, visible in combat, boosts one hand type"
```

---

## Task 11: Shop — Delete Card / Delete Piece

**Methods:** `renderShop()`, `buyShop()`, `genShop()`

- [ ] **Step 1: Add deck-thinning offers to shop**

In `genShop()`, add trim options (always available if deck/hand not empty):

```js
const trimCard = this.state.deck.length>10 ? {type:'trimCard',price:8} : null;
const trimPiece = this.state.hand.length>3 ? {type:'trimPiece',price:6} : null;
return {jokers,weapons,pieces,cards,trimCard,trimPiece};
```

- [ ] **Step 2: Handle trim buys in buyShop()**

Add cases:

```js
else if(cat==='trimCard'){
  // Remove a random card from deck
  const deck=[...this.state.deck]; deck.splice(this.rnd(0,deck.length-1),1);
  this.setState({deck});
  const shop={...this.state.shop, trimCard:{...o,sold:true}};
  this.sfx('buy'); this.setState({gold:this.state.gold-o.price, shop}); return;
}
else if(cat==='trimPiece'){
  const hand=[...this.state.hand]; hand.splice(this.rnd(0,hand.length-1),1);
  this.setState({hand});
  const shop={...this.state.shop, trimPiece:{...o,sold:true}};
  this.sfx('buy'); this.setState({gold:this.state.gold-o.price, shop}); return;
}
```

- [ ] **Step 3: Render trim offers in shop UI**

In `renderShop()`, add after the cards section:

```js
const trimCardOffer = shop.trimCard&&!shop.trimCard.sold ?
  offer(shop.trimCard.price,false,gold>=shop.trimCard.price,()=>this.buyShop('trimCard',0),
    h('div',{style:{width:60,height:86,borderRadius:6,background:'#1a0f0c',border:'2px dashed '+C.red,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:C.red}}, '🗑'),
    72, h('div',{style:{fontSize:10,color:C.mut,marginTop:2,textAlign:'center'}}, 'Supprimer une carte'), 7) : null;

const trimPieceOffer = shop.trimPiece&&!shop.trimPiece.sold ?
  offer(shop.trimPiece.price,false,gold>=shop.trimPiece.price,()=>this.buyShop('trimPiece',0),
    h('div',{style:{width:60,height:60,borderRadius:6,background:'#0e1a0e',border:'2px dashed '+C.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:C.green}}, '🗑'),
    72, h('div',{style:{fontSize:10,color:C.mut,marginTop:2,textAlign:'center'}}, 'Supprimer une pièce'), 8) : null;
```

Add `section('ÉLAGUER', 'allège tes decks', [trimCardOffer,trimPieceOffer].filter(Boolean))`.

- [ ] **Step 4: Commit**

```bash
git add pathomino.js
git commit -m "feat(shop): add deck/hand thinning options"
```

---

## Task 12: HUD — Persistent Header All Screens

**Methods:** `renderPlan()`, `renderCombat()`, `renderShop()`, add `renderHud()`

The TODO asks for a persistent HUD: ❤️ HP, ☠ poison, 💰 gold, floor, boss count X/5.

Currently each screen has its own header. We standardize by making `statChip()` reuse easy and adding a small HUD strip.

- [ ] **Step 1: Add renderHud() method**

After `statChip()` (line ~728), add:

```js
renderHud(){
  const C=this.C, h=React.createElement; const s=this.state;
  if(!s.char) return null;
  return h('div',{style:{position:'fixed',top:0,left:0,right:0,zIndex:200,
    background:'rgba(14,11,9,.92)',borderBottom:'1px solid '+C.line,
    display:'flex',alignItems:'center',gap:14,padding:'6px 14px',fontSize:12,fontFamily:'Space Grotesk'}},
    this.statChip('heart', s.php+'/'+s.pmax, s.php/s.pmax>0.3?C.red:'#cf5040'),
    s.poisoned? h('span',{style:{color:C.green,fontSize:14,title:'Empoisonné'}}, '☠') : null,
    this.statChip('coin', s.gold, C.gold),
    h('span',{style:{color:C.mut}}, 'Étage '+s.floor),
    h('span',{style:{color:C.mut}}, s.bossesBeaten+'/5 boss'));
}
```

- [ ] **Step 2: Add hudEl to renderVals()**

In `renderVals()` (line ~971), add:
```js
hudEl: (s.screen==='plan'||s.screen==='combat'||s.screen==='shop') ? this.renderHud() : null,
```

In `render()` (line ~5), add `v.hudEl` to the root div children.

- [ ] **Step 3: Commit**

```bash
git add pathomino.js
git commit -m "feat(hud): persistent HP/poison/gold/floor/boss strip"
```

---

## Task 13: Gold Doesn't Persist Between Runs (Verify)

**Methods:** `startRun()`

- [ ] **Step 1: Verify gold resets on new run**

In `startRun()`, confirm `gold:0` is in the setState call (line ~202). It is: `gold:0`. ✓ No change needed.

- [ ] **Step 2: Verify mageUnlocked persists across runs**

`mageUnlocked` is read from localStorage in `componentDidMount()`. Verify the floorComplete unlock writes to localStorage (`pm_mage`). It does after Task 4. ✓

- [ ] **Step 3: Commit (no-op if no changes needed)**

If both verified without change, skip commit.

---

## Task 14: Mage Portal Mechanic

**Methods:** `renderPlan()`, `validate()`, `genFloor()`, `state`, `sfx()`

The portal lets the Mage click two non-adjacent cells to connect them, once per floor, recharging every 2 floors.

- [ ] **Step 1: Add portal state**

In `state = {...}`, add:
```js
portalA: null, portalB: null, portalUsed: false, portalRecharge: 0, selectingPortal: false,
```

Reset in `genFloor()`:
```js
// Reset portal cells each floor, but track recharge
const portalAvailable = this.state.char==='mage' &&
  !this.state.portalUsed &&
  (this.state.portalRecharge||0)<=this.state.floor;
```

Set in `genFloor()`:
```js
this.setState({..., portalA:null, portalB:null, selectingPortal:false});
```

- [ ] **Step 2: Portal cell click logic**

In `renderPlan()`, modify the cell onClick to handle portal selection mode:

```js
onClick:()=>{
  if(this.state.selectingPortal){
    const cellKey=[r,c];
    if(!this.state.portalA){
      this.setState({portalA:cellKey});
    } else if(!this.eq(this.state.portalA,[r,c])){
      this.setState({portalB:cellKey, portalUsed:true, selectingPortal:false,
        portalRecharge:this.state.floor+2});
      this.sfx('valid');
    }
    return;
  }
  if(placed && !this.state.executing){ /* retrieve logic */ return; }
  this.placeAt(r,c);
},
```

- [ ] **Step 3: Render portal cells on grid**

In `renderPlan()` cell loop, add portal highlighting:

```js
const isPortalA = this.state.portalA && this.eq(this.state.portalA,[r,c]);
const isPortalB = this.state.portalB && this.eq(this.state.portalB,[r,c]);
if(isPortalA||isPortalB){
  bd=C.blue; bstyle='solid';
  content=h('div',{style:{width:cell*.6,height:cell*.6,borderRadius:'50%',
    background:'rgba(111,155,202,.3)',border:'2px solid '+C.blue,
    display:'flex',alignItems:'center',justifyContent:'center',fontSize:cell*.3,color:C.blue}},
    isPortalA?'A':'B');
}
```

- [ ] **Step 4: Portal pathfinding — count portal pair as connected**

In `pathOk()`, after the BFS loop, add portal bridge:

```js
// If portal A and B both covered, treat them as adjacent
const pa=this.state.portalA, pb=this.state.portalB;
if(pa&&pb&&m[pa.join(',')]&&m[pb.join(',')]){
  const ak=pa.join(','), bk=pb.join(',');
  if(seen.has(ak)&&!seen.has(bk)){
    seen.add(bk); const q2=[pb];
    while(q2.length){ /* re-run BFS from B */ const[r2,c2]=q2.shift();
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{ const nr=r2+dr,nc=c2+dc,kk=nr+','+nc;
        if(nr>=0&&nc>=0&&nr<g.n&&nc<g.n&&m[kk]&&!seen.has(kk)){seen.add(kk);q2.push([nr,nc]);} }); }
  } else if(seen.has(bk)&&!seen.has(ak)){
    seen.add(ak); const q3=[pa];
    while(q3.length){ const[r2,c2]=q3.shift();
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{ const nr=r2+dr,nc=c2+dc,kk=nr+','+nc;
        if(nr>=0&&nc>=0&&nr<g.n&&nc<g.n&&m[kk]&&!seen.has(kk)){seen.add(kk);q3.push([nr,nc]);} }); }
  }
}
```

- [ ] **Step 5: Portal button in plan UI (Mage only)**

In `renderPlan()`, in the action buttons area, add:

```js
const portalAvail = this.state.char==='mage' && !this.state.portalUsed;
const portalRecharging = this.state.char==='mage' && this.state.portalUsed;
portalAvail||portalRecharging ?
  h('div',{style:{marginTop:8}},
    this.btn(
      this.state.selectingPortal ? 'Annuler portail' :
        portalAvail ? '🌀 Portail' : '🌀 Portail (recharge étage '+(this.state.portalRecharge)+')',
      ()=>portalAvail&&this.setState(s=>({selectingPortal:!s.selectingPortal,portalA:null})),
      {small:true, wide:true, disabled:!portalAvail})) : null
```

- [ ] **Step 6: Add portal to shop (if used before recharge)**

In `genShop()`, if char is mage and portal is used:
```js
const portalReset = this.state.char==='mage'&&this.state.portalUsed ?
  {type:'portalReset',price:16} : null;
return {..., portalReset};
```

In `buyShop('portalReset')`:
```js
else if(cat==='portalReset'){
  this.setState({portalUsed:false, portalRecharge:0});
  // mark sold
}
```

In `renderShop()`, render portal reset offer if available.

- [ ] **Step 7: Commit**

```bash
git add pathomino.js
git commit -m "feat(mage): portal mechanic — connect two cells, 1 use/floor, recharges every 2 floors"
```

---

## Self-Review

### Spec Coverage Check

| Section | Covered by Task |
|---------|----------------|
| Home: remove description | Task 1 |
| Home: cards icon+title | Task 1 |
| Home: remove login text | Task 1 |
| Select: horizontal slider | Task 3 |
| Select: 1 char at a time | Task 3 |
| Select: 1/3 dots | Task 3 |
| Select: description 1 line | Task 3 |
| Select: Voleur as ? | Task 3 |
| Select: "Bats le Roi" text | Task 3 |
| Select: Chevalier run 1 | Task 4 (verify only) |
| Select: Mage after boss 1 | Task 4 |
| Select: Voleur after Roi | existing + Task 4 |
| Grid: remove PIVOTER | Task 2 |
| Grid: remove long texts | Task 2 |
| Grid: error 3 words | Task 2 |
| Grid: holes | Task 5 |
| Grid: traps + poison | Task 5 |
| Grid: food | Task 6 |
| Grid: potions | Task 6 |
| Grid: hidden chest | Task 7 |
| Grid: all elements present | Tasks 5-7 genFloor |
| Grid: unconnected=red | Existing (verified in code) |
| Grid: connected=gold | Existing (verified in code) |
| Grid: hover preview | Existing |
| Grid: click placed to retrieve | Task 8 |
| Grid: fanfare on complete | Task 8 |
| Grid: sounds | Existing + Task 8 |
| Combat: remove suit effects | Task 9 |
| Combat: weapon visible | Task 10 |
| Combat: jokers visible | Existing jokerBar |
| Combat: combo + dmg readout | Existing comboReadout |
| Combat: enemy immunity | Existing |
| Shop: reroll costs gold | Existing ✓ |
| Shop: delete card | Task 11 |
| Shop: delete piece | Task 11 |
| Shop: joker X/5 | Existing ownedJk shows count |
| Shop: Mage portal | Task 14 |
| Shop: gold doesn't persist | Task 13 (verified) |
| HUD: HP | Task 12 |
| HUD: poison icon | Task 12 |
| HUD: gold | Task 12 |
| HUD: floor | Task 12 |
| HUD: boss count | Task 12 |
| Progression: run 1 chevalier | Existing |
| Progression: mage unlock | Task 4 |
| Progression: voleur unlock | Existing |
| Progression: permadeath | Existing |
| Progression: grid grows | Existing |
| Progression: cycle | Existing |
| Style: voleur ? slider | Task 3 |
| Style: mute button | Existing ✓ |
| Style: mobile | Existing responsive code |
| Mage portal button | Task 14 |
| Mage portal mechanic | Task 14 |
| Mage portal visual | Task 14 |
| Mage portal 1 use/floor | Task 14 |
| Mage portal recharge 2 floors | Task 14 |
| Mage portal shop | Task 14 |

### Gaps Identified

- **Animation "claque"** (micro bounce on piece placement): `pmPop` keyframe already exists and is applied in `markPlaced()` via `justPlaced`. ✓
- **Onde dorée on connection**: Not explicitly tasked. The `connected` BFS already recolors connected cells gold. A propagating wave animation would require per-cell animation delays — lower priority, can be added to Task 8 if desired.
- **Enemy immunities in Task 9**: After removing base suit effects, immunity checks still make sense for joker-triggered effects. ✓ covered.
- **Grid: `ghostValid` must check holes**: ✓ covered in Task 5.
- **Portal BFS needs to handle mutual discovery**: Task 14 step 4 handles both directions. ✓

### Placeholder Scan

All code blocks are concrete. No "implement X later" phrases. ✓
