class Pathomino extends React.Component {
  render(){
    const h = React.createElement;
    const vals = this.renderVals();
    return h('div', {id:'pm-root', style: vals.hudEl ? {paddingTop:34} : {}},
      vals.introEl, vals.homeEl, vals.authEl, vals.selectEl, vals.planEl,
      vals.combatEl, vals.shopEl, vals.resultEl, vals.hudEl, vals.dragOverlay, vals.tutoOverlay, vals.muteBtn);
  }

  C = {ink:'#0e0c0b',p1:'#1b1715',p2:'#241f1b',p3:'#2f2823',line:'#3a342e',line2:'#4c443b',text:'#ece4d6',mut:'#8d8377',gold:'#e0a53b',gold2:'#f3c976',red:'#cf5040',green:'#86b46a',blue:'#6f9bca'};
  CARD = {bg:'#f3ecdd',line:'#d6cab2',red:'#b5402f',ink:'#26201b'};
  SHAPES = {
    I:[[0,0],[0,1],[0,2],[0,3]],
    O:[[0,0],[0,1],[1,0],[1,1]],
    T:[[0,0],[0,1],[0,2],[1,1]],
    S:[[0,1],[0,2],[1,0],[1,1]],
    Z:[[0,0],[0,1],[1,1],[1,2]],
    L:[[0,0],[1,0],[2,0],[2,1]],
    J:[[0,1],[1,1],[2,1],[2,0]],
    // pentominos (5 cases) — Voleur
    I5:[[0,0],[0,1],[0,2],[0,3],[0,4]],
    L5:[[0,0],[1,0],[2,0],[3,0],[3,1]],
    P5:[[0,0],[0,1],[1,0],[1,1],[2,0]],
    T5:[[0,0],[0,1],[0,2],[1,1],[2,1]],
    V5:[[0,0],[1,0],[2,0],[2,1],[2,2]],
    U5:[[0,0],[0,2],[1,0],[1,1],[1,2]],
    Z5:[[0,0],[0,1],[1,1],[2,1],[2,2]],
    // petites pièces (2-3 cases) — Tricheur
    D2:[[0,0],[0,1]],
    I3:[[0,0],[0,1],[0,2]],
    L3:[[0,0],[1,0],[1,1]]
  };
  // jeu de formes par personnage : drawPiece et la boutique tirent dans ce set
  SHAPE_SETS = {
    tetro:['I','O','T','S','Z','L','J'],
    pento:['I5','L5','P5','T5','V5','U5','Z5'],
    mini:['D2','I3','L3','O','T']
  };
  // Profil par perso (façon Balatro) : pieces=main de pièces de départ, draws=pioches de
  // pièces/étage, discards=défausses/combat, cards=taille de main de cartes en combat,
  // shapes=jeu de formes, power/heal=capacité spéciale.
  CHARS = {
    chevalier:{name:'Chevalier',icon:'sword',vie:120,force:15,defense:10,magie:4,vitesse:6,pieces:5,draws:3,discards:3,cards:8,shapes:'tetro',tag:'DÉPART',desc:'Solide, prévisible, tanky. Tétrominos classiques.',color:'#c98a3a'},
    mage:{name:'Mage',icon:'wand',vie:78,force:5,defense:5,magie:17,vitesse:9,pieces:6,draws:3,discards:3,cards:9,shapes:'tetro',power:'portal',tag:'1 BOSS',desc:'Fragile mais dévastateur. Grande main de cartes. Un portail par étage.',color:'#6f9bca'},
    voleur:{name:'Voleur',icon:'dagger',vie:90,force:11,defense:7,magie:9,vitesse:15,pieces:7,draws:4,discards:4,cards:8,shapes:'pento',tag:'3 BOSS',desc:'Agile, esquive souvent. Pentominos (5 cases), beaucoup de pioches et défausses.',color:'#86b46a'},
    paladin:{name:'Paladin',icon:'sword',vie:110,force:13,defense:11,magie:4,vitesse:6,pieces:5,draws:3,discards:2,cards:8,shapes:'tetro',heal:15,tag:'5 BOSS',desc:'Comme le Chevalier, mais regagne 15 PV à chaque combat gagné. Peu de défausses.',color:'#d9c27a'},
    tricheur:{name:'Tricheur',icon:'dagger',vie:85,force:9,defense:6,magie:9,vitesse:10,pieces:6,draws:3,discards:5,cards:9,shapes:'mini',power:'cheat',tag:'7 BOSS',desc:'Petites pièces, beaucoup de défausses. Pouvoir : la prochaine main compte 1 carte de moins (suite dès 4, paire dès 1).',color:'#b06fca'}
  };
  CHAR_ORDER = ['chevalier','mage','voleur','paladin','tricheur'];
  UNLOCKS = { mage:1, voleur:3, paladin:5, tricheur:7 }; // boss à battre dans un run (chevalier : départ)
  PIECE_WEIGHTS = {I:3,O:3,L:3,J:2,T:2,S:1,Z:1};
  HAND_MAX = 10;
  FLOOR_REFILL = 2;
  DRAWS_PER_FLOOR = 3;
  DISCARDS_PER_COMBAT = 3;
  REROLL_CAT_COST = 3; // coût pour relancer une seule catégorie de la boutique
  MAX_SCALE = 2;
  SPRITES = {
    chevalier:{ pal:{K:'#14100c',M:'#8b919b',L:'#d2d8e0',D:'#5a5f68',V:'#2f333a',E:'#bfe9ff',A:'#e0a53b',C:'#f3c976'},
      rows:['..A.......A..','..AK.....KA..','...KKKKKKK...','..KLLLLLLLK..','..KLMMMMMLK..','..KMVVVVVMK..','..KMEKKKEMK..','..KMMMMMMMK..','.KKMMMMMMMKK.','KAAMMMCMMMAAK','KAAMMMCMMMAAK','.KMMMCCCMMMK.','..KMMMMMMMK..','..KMMK.KMMK..','..KK.....KK..'] },
    mage:{ pal:{K:'#14100c',M:'#3f5d86',L:'#6f9bca',S:'#e8c39a',E:'#bfe9ff',A:'#e0a53b',O:'#7fd7ff',W:'#6b4a2a',H:'#f3c976'},
      rows:['.....KK......','....KHHK.....','...KMHHMK.OO.','...KMMMMK.OO.','..KMMMMMK..W.','..KMMMMMK..W.','...KKSSKK..W.','..KSEKEK...W.','..KSSSSK..WW.','.KMMMMMMK.W..','.KMMLLLMMKW..','KMMLLLLLMMK..','KMMMMMMMMMK..','.KMMMK.KMMK..','..KK.....KK..'] },
    voleur:{ pal:{K:'#14100c',M:'#3c5a3a',L:'#6fae5e',D:'#26371f',S:'#caa37a',E:'#d6ff7a',A:'#86b46a',B:'#c9c2b4',H:'#6b4a2a'},
      rows:['....KKKKK....','...KMMMMMK...','..KMLLLLLMK..','..KMM...MMK..','..KMKSSSKMK..','..KMSEKESMK..','...KKSSSKK...','.B..KMMMK..B.','HB..KMMMK..BH','.H.KMMMMMK.H.','..KMMLLLMMK..','..KMMMMMMMK..','..KMMK.KMMK..','..KK.....KK..'] },
    paladin:{ pal:{K:'#14100c',M:'#d8d2c4',L:'#fbf6e9',D:'#9a9588',V:'#3a3a44',E:'#bfe9ff',A:'#e0a53b',C:'#f3c976'},
      rows:['..A.......A..','..AK.....KA..','...KKKKKKK...','..KLLLLLLLK..','..KLMMMMMLK..','..KMVVVVVMK..','..KMEKKKEMK..','..KMMMMMMMK..','.KKMMMMMMMKK.','KAAMMMCMMMAAK','KAAMMMCMMMAAK','.KMMMCCCMMMK.','..KMMMMMMMK..','..KMMK.KMMK..','..KK.....KK..'] },
    tricheur:{ pal:{K:'#14100c',M:'#5a3a6e',L:'#9b6fca',D:'#2e1f3a',S:'#caa37a',E:'#e6b3ff',A:'#b06fca',B:'#e9e2d4',H:'#6b4a2a'},
      rows:['....KKKKK....','...KMMMMMK...','..KMLLLLLMK..','..KMM...MMK..','..KMKSSSKMK..','..KMSEKESMK..','...KKSSSKK...','.B..KMMMK..B.','HB..KMMMK..BH','.H.KMMMMMK.H.','..KMMLLLMMK..','..KMMMMMMMK..','..KMMK.KMMK..','..KK.....KK..'] }
  };
  BOSSES = [
    {key:'cavalier',glyph:'\u265E',name:'Cavalier',hpMul:1.0,atkMul:1.15,vit:11,trait:'Rapide, difficile à toucher'},
    {key:'fou',glyph:'\u265D',name:'Fou',hpMul:1.1,atkMul:1.3,vit:7,trait:'Attaque magique perçante'},
    {key:'tour',glyph:'\u265C',name:'Tour',hpMul:1.7,atkMul:0.9,vit:4,trait:'PV énormes, très défensif'},
    {key:'dame',glyph:'\u265B',name:'Dame',hpMul:1.4,atkMul:1.45,vit:9,trait:'Redoutable sur tout'},
    {key:'roi',glyph:'\u265A',name:'Roi',hpMul:2.0,atkMul:1.6,vit:7,trait:'Ultime épreuve du donjon'}
  ];
  SUITS = ['♥','♦','♣','♠'];
  // Jokers inspirés de Balatro. mod(mods, type, ctx) — ctx={type,cards,n,suitCounts,state}.
  // mods.flat = dégâts plats (≈ chips), mods.dmgMult = multiplicateur (≈ mult).
  JOKERS = {
    // — dégâts bruts / multiplicateurs —
    joker:{name:'Joker',glyph:'🃏',color:'#ece4d6',price:4,desc:'+12 dégâts sur toutes les mains',mod:(m)=>{ m.flat+=12; }},
    lame:{name:'Lame Affûtée',glyph:'⚔',color:'#c98a3a',price:6,desc:'+30% de dégâts',mod:(m)=>{ m.dmgMult*=1.3; }},
    royal:{name:'Sang Royal',glyph:'♛',color:'#e0a53b',price:8,desc:'Suite, couleur, full+ : +60% dégâts',mod:(m,t)=>{ if(['suite','couleur','full','carre','quinteflush'].includes(t)) m.dmgMult*=1.6; }},
    brute:{name:'Brute',glyph:'✊',color:'#cf5040',price:6,desc:'Paire, brelan, carré… : +80% dégâts',mod:(m,t)=>{ if(['paire','deuxpaires','brelan','full','carre'].includes(t)) m.dmgMult*=1.8; }},
    abstrait:{name:'Joker Abstrait',glyph:'⬡',color:'#b9a7d6',price:8,desc:'+20% de dégâts par joker possédé',mod:(m,t,c)=>{ m.dmgMult*=(1+0.2*(c.state.jokers||[]).length); }},
    // — bonus conditionnels —
    demi:{name:'Demi-Joker',glyph:'½',color:'#86b46a',price:5,desc:'+25 dégâts si 3 cartes ou moins jouées',mod:(m,t,c)=>{ if(c.n<=3) m.flat+=25; }},
    sommet:{name:'Sommet Mystique',glyph:'⛰',color:'#6f9bca',price:5,desc:'+60% de dégâts s\'il ne reste plus de défausse',mod:(m,t,c)=>{ if((c.state.discardsLeft||0)<=0) m.dmgMult*=1.6; }},
    collectionneur:{name:'Collectionneur',glyph:'❖',color:'#f3c976',price:6,desc:'+5 dégâts par carte jouée',mod:(m,t,c)=>{ m.flat+=5*c.n; }},
    banquier:{name:'Banquier',glyph:'💰',color:'#e0a53b',price:6,desc:'+1 dégât par 5 or possédé',mod:(m,t,c)=>{ m.flat+=Math.floor((c.state.gold||0)/5); }},
    fibonacci:{name:'Fibonacci',glyph:'🌀',color:'#6f9bca',price:7,desc:'+8 dégâts par 2, 3, 5, 8 ou As joué',mod:(m,t,c)=>{ m.flat+=8*c.cards.filter(x=>[2,3,5,8,14].includes(x.rank)).length; }},
    figures:{name:'Face Effrayante',glyph:'👑',color:'#c98a3a',price:6,desc:'+10 dégâts par figure (J, Q, K) jouée',mod:(m,t,c)=>{ m.flat+=10*c.cards.filter(x=>x.rank>=11&&x.rank<=13).length; }},
    pile:{name:'Pile Paire',glyph:'⚖',color:'#86b46a',price:5,desc:'+6 dégâts par carte de rang pair',mod:(m,t,c)=>{ m.flat+=6*c.cards.filter(x=>x.rank%2===0).length; }},
    // — quatuor par couleur (à la Balatro) —
    avare:{name:'Avare',glyph:'♦',color:'#6f9bca',price:5,desc:'+6 dégâts par ♦ joué',mod:(m,t,c)=>{ m.flat+=6*(c.suitCounts['♦']||0); }},
    lubrique:{name:'Lubrique',glyph:'♥',color:'#cf5040',price:5,desc:'+6 dégâts par ♥ joué',mod:(m,t,c)=>{ m.flat+=6*(c.suitCounts['♥']||0); }},
    glouton:{name:'Glouton',glyph:'♣',color:'#86b46a',price:5,desc:'+6 dégâts par ♣ joué',mod:(m,t,c)=>{ m.flat+=6*(c.suitCounts['♣']||0); }},
    furieux:{name:'Furieux',glyph:'♠',color:'#b9a7d6',price:5,desc:'+6 dégâts par ♠ joué',mod:(m,t,c)=>{ m.flat+=6*(c.suitCounts['♠']||0); }},
    // — effets de couleur (activent les pouvoirs de suit) —
    trefle:{name:'Trèfle Vorace',glyph:'♣',color:'#86b46a',price:7,desc:'♣ double les dégâts de la main',mod:(m)=>{ m.clubEnabled=true; }},
    coeur:{name:'Cœur Sacré',glyph:'♥',color:'#cf5040',price:6,desc:'♥ soigne (50% des dégâts)',mod:(m)=>{ m.healEnabled=true; }},
    carreau:{name:'Diamant Fou',glyph:'♦',color:'#6f9bca',price:5,desc:'♦ pioche 2 cartes',mod:(m)=>{ m.drawEnabled=true; }},
    pique:{name:'Pique Cruel',glyph:'♠',color:'#b9a7d6',price:5,desc:'♠ réduit l\'attaque ennemie de 3',mod:(m)=>{ m.spadeEnabled=true; }}
  };
  WEAPONS = {
    epee: {name:'\u00c9p\u00e9e',   glyph:'\u2694', price:10, desc:'+8 d\u00e9g\u00e2ts plats',            mod:()=>({dmgFlat:8})},
    hache:{name:'Hache',   glyph:'\u2692', price:14, desc:'+18% de tous les d\u00e9g\u00e2ts',     mod:()=>({dmgMult:1.18})},
    dague:{name:'Dague',   glyph:'\u2020', price:12, desc:'+4 d\u00e9g\u00e2ts \u00b7 esquive +8%', mod:()=>({dmgFlat:4, dodgeBonus:0.08})},
    baton:{name:'B\u00e2ton',   glyph:'\u2736', price:13, desc:'Brelan+ : +25% d\u00e9g\u00e2ts',        mod:()=>({strongMult:1.25})},
  };
  SVG = {
    sword:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/></svg>',
    wand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>',
    dagger:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v12"/><path d="M8.5 6h7"/><path d="M12 14l-2.4 4 2.4 4 2.4-4z"/></svg>',
    key:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4"/><path d="m10.4 12.6 8.6-8.6"/><path d="m16 6 2.5 2.5"/><path d="m13.5 8.5 2 2"/></svg>',
    door:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17"/><path d="M3 21h16"/><path d="M19 21V9l-3-3"/><circle cx="12.5" cy="12.5" r="1.1" fill="currentColor" stroke="none"/></svg>',
    flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4"/><path d="M5 4h11l-2.2 4L16 12H5"/></svg>',
    lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    rotate:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/></svg>',
    deck:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="13" height="16" rx="2"/><path d="M8 3h9a2 2 0 0 1 2 2v12"/></svg>',
    heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.9 2 5.5 5.2 5.5c2 0 3.2 1.2 3.8 2.3.6-1.1 1.8-2.3 3.8-2.3C16 5.5 17.4 8.9 16 11.7 13.5 16.4 12 21 12 21Z" transform="translate(0 -1)"/></svg>',
    coin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M9.5 9.2c0-1.2 1.1-1.8 2.5-1.8s2.5.7 2.5 1.9c0 2.5-5 1.5-5 4 0 1.2 1.1 1.9 2.5 1.9s2.5-.6 2.5-1.8" stroke-linecap="round"/></svg>',
    chest:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M3 12h18"/><path d="M3 8l2-3h14l2 3"/><rect x="10.5" y="11" width="3" height="3" rx="0.5" fill="currentColor" stroke="none"/></svg>'
  };

  state = {
    screen:'intro', char:null, account:null, authName:'', authPass:'', authMode:'create', authErr:'',
    floor:1, bossIndex:0, bossesBeaten:0, gridN:8, gold:0,
    php:100, pmax:100,
    grid:null, hand:[], placed:[], selPiece:null, rot:0, ghost:null, executing:false, dragging:false, dragXY:null,
    enemy:null, deck:[], discard:[], chand:[], csel:[], spadeRed:0, log:'', hoverCard:null, busy:false, floats:[],
    unlocked:[], best:0, lastBoss:'', combatPhase:'', newUnlock:null, jokers:[], weapon:null, shop:null, justPlaced:[], defeating:false, hitFlash:0, combatSeq:0,
    showTuto:false, muted:false, drawsLeft:3, discardsLeft:3, enemyTurns:0, charIdx:0, poisoned:false,
    portalA:null, portalB:null, portalUsed:false, portalRecharge:0, selectingPortal:false,
    cheatArmed:false, cheatUsed:false
  };

  loadAccount(){ try{ const raw=localStorage.getItem('pm_account'); return raw?JSON.parse(raw):null; }catch(_e){ return null; } }
  loadUnlocked(){ const set=new Set();
    try{ const raw=localStorage.getItem('pm_unlocked'); if(raw) JSON.parse(raw).forEach(k=>set.add(k)); }catch(_e){}
    try{ if(localStorage.getItem('pm_mage')==='1') set.add('mage'); if(localStorage.getItem('pm_voleur')==='1') set.add('voleur'); }catch(_e){} // migration anciens flags
    return [...set]; }
  saveUnlocked(arr){ try{ localStorage.setItem('pm_unlocked', JSON.stringify(arr)); }catch(_e){} }
  isUnlocked(key){ return key==='chevalier' || (this.state.unlocked||[]).includes(key); }
  // formes tirables pour le perso courant (drawPiece + offres boutique)
  shapeKeys(){ const set=(this.CHARS[this.state.char]||{}).shapes||'tetro'; return this.SHAPE_SETS[set]||this.SHAPE_SETS.tetro; }
  cardHand(){ return (this.CHARS[this.state.char]||{}).cards||8; } // taille de main de cartes en combat
  saveAccount(a){ try{ localStorage.setItem('pm_account', JSON.stringify(a)); }catch(_e){} }
  submitAuth(){
    const name=(this.state.authName||'').trim();
    if(name.length<3){ this.setState({authErr:'Pseudo : 3 caractères minimum.'}); return; }
    if((this.state.authPass||'').length<4){ this.setState({authErr:'Mot de passe : 4 caractères minimum.'}); return; }
    const acc={name, since:Date.now()};
    this.saveAccount(acc);
    this.setState({account:acc, authErr:'', authPass:'', screen:'select'});
  }
  playAsGuest(){ this.setState({account:{name:'Invité', guest:true}, screen:'select'}); }
  logout(){ try{ localStorage.removeItem('pm_account'); }catch(_e){} this.setState({account:null, screen:'home', authName:'', authPass:'', authErr:''}); }

  sfx(name){ if(this.state.muted) return;
    try{
      if(!this._ac){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; this._ac=new AC(); }
      const ac=this._ac; if(ac.state==='suspended') ac.resume(); const now=ac.currentTime;
      const tone=(freq,dur,type,vol,delay)=>{ const osc=ac.createOscillator(),gain=ac.createGain();
        osc.type=type||'square'; osc.frequency.value=freq; osc.connect(gain); gain.connect(ac.destination);
        const time=now+(delay||0); gain.gain.setValueAtTime(0.0001,time); gain.gain.exponentialRampToValueAtTime(vol||0.16,time+0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001,time+dur); osc.start(time); osc.stop(time+dur+0.03); };
      const sounds={
        select:()=>tone(440,0.04,'square',0.09),
        place:()=>{tone(300,0.07,'square',0.14);tone(450,0.06,'square',0.10,0.03);},
        rotate:()=>tone(560,0.05,'square',0.10),
        bad:()=>tone(150,0.14,'sawtooth',0.15),
        valid:()=>{tone(523,0.09,'triangle',0.15);tone(784,0.13,'triangle',0.15,0.09);},
        ready:()=>{tone(659,0.07,'triangle',0.10);tone(880,0.10,'triangle',0.09,0.06);},
        hit:()=>{tone(220,0.09,'square',0.17);tone(110,0.13,'sawtooth',0.13,0.02);},
        heal:()=>{tone(660,0.1,'triangle',0.14);tone(880,0.12,'triangle',0.12,0.08);},
        hurt:()=>tone(190,0.15,'sawtooth',0.17),
        coin:()=>{tone(988,0.06,'square',0.12);tone(1319,0.09,'square',0.11,0.05);},
        buy:()=>{tone(700,0.07,'square',0.12);tone(1047,0.1,'square',0.11,0.06);},
        win:()=>[523,659,784,1047].forEach((freq,i)=>tone(freq,0.12,'triangle',0.15,i*0.08)),
        over:()=>[440,330,247,165].forEach((freq,i)=>tone(freq,0.2,'sawtooth',0.15,i*0.15))
      };
      (sounds[name]||sounds.select)();
    }catch(_e){}
  }
  toggleMute(){ const muted=!this.state.muted; try{ localStorage.setItem('pm_muted', muted?'1':'0'); }catch(_e){} this.setState({muted}); if(!muted) this.sfx('select'); }
  openTuto(){ this.setState({showTuto:true}); }
  closeTuto(){ try{ localStorage.setItem('pm_tuto','1'); }catch(_e){} this.setState({showTuto:false}); }

  componentDidMount(){
    try{
      this.setState({unlocked: this.loadUnlocked(), best: parseInt(localStorage.getItem('pm_best')||'0',10), account:this.loadAccount(), muted: localStorage.getItem('pm_muted')==='1'});
    }catch(_e){}
    this._resize = ()=>this.setState({vw:window.innerWidth, vh:window.innerHeight});
    this._resize();
    this._key = (e)=>{
      if(this.state.screen!=='plan' || this.state.executing) return;
      if(e.key==='Escape'){ this.setState({selPiece:null,ghost:null,dragging:false}); }
    };
    this._move = (e)=>{ if(this.state.dragging) this.setState({dragXY:{x:e.clientX,y:e.clientY}}); };
    this._up = (e)=>{ if(!this.state.dragging) return; const cells=this.ghostCells();
      if(cells&&this.ghostValid(cells)){ this.placePiece(); } else { this.setState({dragging:false}); } };
    this._cellAt = (x,y)=>{ const el=document.elementFromPoint(x,y); const ce=el&&el.closest?el.closest('[data-rc]'):null;
      if(ce&&ce.dataset.rc){ const a=ce.dataset.rc.split(',').map(Number); return [a[0],a[1]]; } return null; };
    this._tmove = (e)=>{ if(!this.state.dragging) return; const t=e.touches&&e.touches[0]; if(!t) return; e.preventDefault();
      const rc=this._cellAt(t.clientX,t.clientY); this.setState(rc?{dragXY:{x:t.clientX,y:t.clientY},ghost:rc}:{dragXY:{x:t.clientX,y:t.clientY}}); };
    this._tend = (e)=>{ if(!this.state.dragging) return; const cells=this.ghostCells();
      if(cells&&this.ghostValid(cells)){ this.placePiece(); } else { this.setState({dragging:false}); } };
    window.addEventListener('keydown', this._key);
    window.addEventListener('mousemove', this._move);
    window.addEventListener('mouseup', this._up);
    window.addEventListener('touchmove', this._tmove, {passive:false});
    window.addEventListener('touchend', this._tend);
    window.addEventListener('touchcancel', this._tend);
    window.addEventListener('resize', this._resize);
  }
  componentWillUnmount(){ window.removeEventListener('keydown', this._key); window.removeEventListener('mousemove', this._move); window.removeEventListener('mouseup', this._up); window.removeEventListener('touchmove', this._tmove); window.removeEventListener('touchend', this._tend); window.removeEventListener('touchcancel', this._tend); window.removeEventListener('resize', this._resize); }
  fitScale(baseW, baseH, reservedV){
    const vw=this.state.vw||(typeof window!=='undefined'?window.innerWidth:1280);
    const vh=this.state.vh||(typeof window!=='undefined'?window.innerHeight:800);
    return Math.min(this.MAX_SCALE, (vw-14)/baseW, (vh-(reservedV||14))/baseH);
  }
  scaleWrap(el, baseW, baseH, reservedV){ if(!el) return null; const h=React.createElement;
    const scale=this.fitScale(baseW, baseH, reservedV);
    // outer box reserves the SCALED footprint so flex centering / scrolling match the
    // visible size (a transform:scale alone keeps the full unscaled layout box).
    return h('div',{style:{width:baseW*scale, height:baseH*scale, flex:'none'}},
      h('div',{style:{width:baseW, height:baseH, transform:`scale(${scale})`, transformOrigin:'top left'}}, el)); }
  pixelSprite(key, px){ const h=React.createElement; const sp=this.SPRITES[key]; if(!sp) return null;
    const w=Math.max(...sp.rows.map(r=>r.length)), hgt=sp.rows.length; const cells=[];
    sp.rows.forEach((row,r)=>{ for(let c=0;c<row.length;c++){ const col=sp.pal[row[c]];
      if(col) cells.push(h('div',{key:r+'_'+c,style:{position:'absolute',left:c*px,top:r*px,width:px,height:px,background:col}})); } });
    return h('div',{style:{position:'relative',width:w*px,height:hgt*px,imageRendering:'pixelated',filter:'drop-shadow(0 4px 0 rgba(0,0,0,.4))'}}, cells); }
  startDrag(i,e){ if(e&&e.preventDefault)e.preventDefault();
    const pt = e&&e.touches&&e.touches[0] ? e.touches[0] : e;
    const x = pt&&pt.clientX!=null?pt.clientX:0, y = pt&&pt.clientY!=null?pt.clientY:0;
    this.setState(s=>({selPiece:i, dragging:true, ghost:null, dragXY:{x,y}})); }
  clampAnchor(r,c,shape){ const n=this.state.grid.n;
    const maxR=Math.max(...shape.map(s=>s[0])), maxC=Math.max(...shape.map(s=>s[1]));
    return [Math.max(0,Math.min(r,n-1-maxR)), Math.max(0,Math.min(c,n-1-maxC))]; }
  placeAt(r,c){ if(this.state.selPiece===null||this.state.dragging) return;
    const piece=this.state.hand[this.state.selPiece]; if(!piece) return;
    const shape=this.rotated(piece.key, piece.rot||0);
    const [ar,ac]=this.clampAnchor(r,c,shape);
    const cells=shape.map(([dr,dc])=>[ar+dr,ac+dc]);
    if(!this.ghostValid(cells)){ this.sfx('bad'); this.setState({ghost:[ar,ac]}); return; }
    const placed=[...this.state.placed, {uid:piece.uid, key:piece.key, rot:piece.rot||0, cells}];
    const hand=this.state.hand.filter((_,i)=>i!==this.state.selPiece);
    this.setState({placed, hand, selPiece:null, ghost:null}, ()=>{ if(this.pathOk().ok) this.sfx('ready'); });
    this.sfx('place'); this.markPlaced(cells); }
  markPlaced(cells){ const keys=cells.map(c=>c.join(',')); this.setState({justPlaced:keys});
    clearTimeout(this._jpT); this._jpT=setTimeout(()=>this.setState({justPlaced:[]}),360); }
  miniPiece(key,rot,u,color){ const h=React.createElement; const shape=this.rotated(key,rot);
    const rows=Math.max(...shape.map(c=>c[0]))+1, cols=Math.max(...shape.map(c=>c[1]))+1;
    const sset=new Set(shape.map(c=>c.join(','))); const cs=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ cs.push(h('div',{key:r+','+c,style:{width:u,height:u,background:sset.has(r+','+c)?color:'transparent',borderRadius:2}})); }
    return h('div',{style:{display:'grid',gridTemplateColumns:`repeat(${cols},${u}px)`,gap:2}}, cs); }

  rotated(key, times){
    let cells = this.SHAPES[key].map(c=>[c[0],c[1]]);
    for(let t=0;t<(times%4+4)%4;t++){ cells = cells.map(([r,c])=>[c,-r]); }
    let minr=Math.min(...cells.map(c=>c[0])), minc=Math.min(...cells.map(c=>c[1]));
    return cells.map(([r,c])=>[r-minr,c-minc]);
  }

  startRun(charKey){
    const ch = this.CHARS[charKey];
    const deck = this.buildDeck();
    const startKeys = this.SHAPE_SETS[ch.shapes]||this.SHAPE_SETS.tetro; // perso pas encore dans le state
    const hand = Array.from({length:ch.pieces}, ()=>this.drawPiece(startKeys));
    this.setState({
      char:charKey, screen:'plan', floor:1, bossIndex:0, bossesBeaten:0, gridN:8, gold:0,
      php:ch.vie, pmax:ch.vie, deck, discard:[], chand:[], csel:[], newUnlock:null, jokers:[], weapon:null, shop:null, hand, poisoned:false, portalA:null, portalB:null, portalUsed:false, portalRecharge:0, selectingPortal:false, cheatArmed:false, cheatUsed:false,
      showTuto:(()=>{ try{ return localStorage.getItem('pm_tuto')!=='1'; }catch(_e){ return true; } })()
    }, ()=> this.genFloor(true));
  }
  rnd(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
  isBossFloor(f){ return f%2===0; }
  genFloor(firstFloor){
    const n = this.state.gridN;
    const boss = this.isBossFloor(this.state.floor);
    const start=[n-1,0], door=[0,n-1];
    let key;
    do{ key=[this.rnd(1,n-2), this.rnd(1,n-2)]; }while(this.eq(key,start)||this.eq(key,door));
    const taken = new Set([start.join(','),door.join(','),key.join(',')]);
    const floor=this.state.floor;
    const pawns=[];
    const guardKey = floor===1 || this.rnd(0,9)<4;
    if(guardKey) pawns.push([key[0],key[1]]);
    const pc = floor===1 ? 0 : Math.min(2+Math.floor(floor/2), 5);
    let guard=0;
    while(pawns.length<pc+(guardKey?1:0) && guard++<200){
      const p=[this.rnd(0,n-1),this.rnd(0,n-1)];
      if(taken.has(p.join(','))) continue;
      taken.add(p.join(',')); pawns.push(p);
    }
    let treasure=null, tg=0;
    do{ treasure=[this.rnd(1,n-2),this.rnd(1,n-2)]; }while(taken.has(treasure.join(','))&&tg++<60);
    if(taken.has(treasure.join(','))) treasure=null;
    if(treasure) taken.add(treasure.join(','));
    const holeCount=floor<2?0:Math.min(2+Math.floor(floor/3),4);
    const holes=[]; let hg=0;
    while(holes.length<holeCount && hg++<200){
      const p=[this.rnd(0,n-1),this.rnd(0,n-1)];
      if(taken.has(p.join(','))) continue;
      taken.add(p.join(',')); holes.push(p);
    }
    const trapCount=floor<3?0:Math.min(1+Math.floor(floor/4),3);
    const traps=[]; let tg2=0;
    while(traps.length<trapCount && tg2++<200){
      const p=[this.rnd(0,n-1),this.rnd(0,n-1)];
      if(taken.has(p.join(','))) continue;
      taken.add(p.join(',')); traps.push(p);
    }
    const foodCount=Math.min(1+Math.floor(floor/3),3);
    const foods=[]; let fg=0;
    while(foods.length<foodCount && fg++<200){
      const p=[this.rnd(0,n-1),this.rnd(0,n-1)];
      if(taken.has(p.join(','))) continue;
      taken.add(p.join(',')); foods.push(p);
    }
    const potionCount=floor<3?0:1;
    const potions=[]; let pg=0;
    while(potions.length<potionCount && pg++<200){
      const p=[this.rnd(0,n-1),this.rnd(0,n-1)];
      if(taken.has(p.join(','))) continue;
      taken.add(p.join(',')); potions.push(p);
    }
    let hand = [...(this.state.hand||[])];
    if(!firstFloor){
      for(let i=0;i<this.FLOOR_REFILL && hand.length<this.HAND_MAX;i++) hand.push(this.drawPiece());
    }
    this.setState({
      grid:{n,start,key,door,pawns,boss,treasure,holes,traps,foods,potions}, hand, placed:[], selPiece:null, rot:0, ghost:null, executing:false, drawsLeft:((this.CHARS[this.state.char]||{}).draws||this.DRAWS_PER_FLOOR),
      portalA:null, portalB:null, selectingPortal:false
    });
  }
  drawPiece(keys){
    const pool=[]; // keys explicites = perso pas encore committé (ex. main de départ dans startRun)
    for(const key of (keys||this.shapeKeys())){ const weight=this.PIECE_WEIGHTS[key]||1; for(let i=0;i<weight;i++) pool.push(key); }
    // orientation figée à la pioche : chaque (forme + sens) est une pièce distincte
    return {uid:Math.random().toString(36).slice(2), key:pool[this.rnd(0,pool.length-1)], rot:this.rnd(0,3)};
  }
  eq(a,b){ return a[0]===b[0]&&a[1]===b[1]; }

  placedMap(){ const pmap={}; this.state.placed.forEach(pl=>pl.cells.forEach(c=>{pmap[c.join(',')]=true;})); return pmap; }
  ghostCells(){
    if(this.state.selPiece===null || !this.state.ghost) return null;
    const piece = this.state.hand[this.state.selPiece]; if(!piece) return null;
    const shape = this.rotated(piece.key, piece.rot||0);
    const [ar,ac]=this.clampAnchor(this.state.ghost[0], this.state.ghost[1], shape);
    return shape.map(([r,c])=>[ar+r, ac+c]);
  }
  ghostValid(cells){
    const n=this.state.grid.n; const pmap=this.placedMap();
    const hset=new Set((this.state.grid.holes||[]).map(p=>p.join(',')));
    return cells.every(([r,c])=> r>=0&&c>=0&&r<n&&c<n && !pmap[r+','+c] && !hset.has(r+','+c));
  }
  hoverCell(r,c){ if(this.state.selPiece!==null) this.setState({ghost:[r,c]}); }
  placePiece(){
    const cells=this.ghostCells(); if(!cells||!this.ghostValid(cells)) return;
    const piece=this.state.hand[this.state.selPiece];
    const placed=[...this.state.placed, {uid:piece.uid, key:piece.key, rot:piece.rot||0, cells}];
    const hand=this.state.hand.filter((_,i)=>i!==this.state.selPiece);
    this.setState({placed, hand, selPiece:null, ghost:null, dragging:false}, ()=>{ if(this.pathOk().ok) this.sfx('ready'); });
    this.sfx('place'); this.markPlaced(cells);
  }
  undo(){ const placed=[...this.state.placed]; const last=placed.pop(); if(!last)return;
    this.setState({placed, hand:[...this.state.hand, {uid:last.uid,key:last.key,rot:last.rot||0}]}); }
  retrievePiece(r,c){ if(this.state.executing) return;
    const cellKey=r+','+c;
    const idx=this.state.placed.findIndex(pl=>pl.cells.some(cell=>cell.join(',')===cellKey));
    if(idx===-1) return;
    const pl=this.state.placed[idx];
    const placed=this.state.placed.filter((_,i)=>i!==idx);
    this.setState({placed, hand:[...this.state.hand, {uid:pl.uid,key:pl.key,rot:pl.rot||0}]});
    this.sfx('select'); }
  pickPiece(){ if(this.state.hand.length>=this.HAND_MAX || this.state.drawsLeft<=0)return; this.sfx('place'); this.setState(s=>({hand:[...s.hand, this.drawPiece()], drawsLeft:s.drawsLeft-1})); }

  pathOk(){
    const grid=this.state.grid; if(!grid) return {ok:false};
    const pmap=this.placedMap();
    const inSet=(p)=>pmap[p.join(',')];
    if(!inSet(grid.start)||!inSet(grid.key)||!inSet(grid.door)) return {ok:false, reason:'Couvre départ, clé et porte'};
    const n=grid.n, seen=new Set([grid.start.join(',')]); const queue=[grid.start];
    while(queue.length){ const[r,c]=queue.shift();
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{ const nr=r+dr,nc=c+dc,k=nr+','+nc;
        if(nr>=0&&nc>=0&&nr<n&&nc<n&&pmap[k]&&!seen.has(k)){seen.add(k);queue.push([nr,nc]);} }); }
    const pa=this.state.portalA, pb=this.state.portalB;
    if(pa&&pb){ const ak=pa.join(','),bk=pb.join(',');
      if(seen.has(ak)&&pmap[bk]&&!seen.has(bk)){ seen.add(bk); const queueB=[pb]; while(queueB.length){ const[r2,c2]=queueB.shift();
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{ const nr=r2+dr,nc=c2+dc,kk=nr+','+nc;
          if(nr>=0&&nc>=0&&nr<n&&nc<n&&pmap[kk]&&!seen.has(kk)){seen.add(kk);queueB.push([nr,nc]);} }); } }
      else if(seen.has(bk)&&pmap[ak]&&!seen.has(ak)){ seen.add(ak); const queueA=[pa]; while(queueA.length){ const[r2,c2]=queueA.shift();
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{ const nr=r2+dr,nc=c2+dc,kk=nr+','+nc;
          if(nr>=0&&nc>=0&&nr<n&&nc<n&&pmap[kk]&&!seen.has(kk)){seen.add(kk);queueA.push([nr,nc]);} }); } }
    }
    if(!seen.has(grid.key.join(','))||!seen.has(grid.door.join(','))) return {ok:false, reason:'Le chemin doit relier départ → clé → porte'};
    return {ok:true};
  }

  manhattan(a,b){ return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]); }

  validate(){
    const chk=this.pathOk(); if(!chk.ok) return;
    this.sfx('valid');
    const grid=this.state.grid; const pmap=this.placedMap();
    const covered = grid.pawns.filter(p=>pmap[p.join(',')]).sort((a,b)=>this.manhattan(grid.start,a)-this.manhattan(grid.start,b));
    this._queue = covered.map((p,i)=>this.makePawn(i));
    if(grid.boss) this._queue.push(this.makeBoss());
    this._qi=-1;
    const st={executing:true};
    const trapSet=new Set((grid.traps||[]).map(t=>t.join(',')));
    if(Object.keys(pmap).some(k=>trapSet.has(k))) st.poisoned=true;
    const foodSet=new Set((grid.foods||[]).map(t=>t.join(',')));
    const potionSet=new Set((grid.potions||[]).map(t=>t.join(',')));
    const foodHits=Object.keys(pmap).filter(k=>foodSet.has(k)).length;
    if(foodHits>0){ st.php=Math.min(this.state.pmax, this.state.php+foodHits*12); }
    if(Object.keys(pmap).some(k=>potionSet.has(k))) st.poisoned=false;
    if(grid.treasure && pmap[grid.treasure.join(',')]){
      if(this.rnd(0,1)===0){
        const bonus=this.rnd(15,25);
        const card={uid:Math.random().toString(36).slice(2), rank:this.rnd(12,14), suit:this.SUITS[this.rnd(0,3)]};
        st.gold=this.state.gold+bonus; st.deck=[...this.state.deck, card];
        st.log=`Trésor ! +${bonus} or et une carte forte.`; this.sfx('coin');
      } else {
        const floor=this.state.floor; const hp=Math.round(60+floor*10);
        this._queue.push({kind:'pion',glyph:'\u2620',name:'Gardien du coffre',hp,max:hp,
          atk:Math.round(12+floor*2),vit:4,suit:this.SUITS[this.rnd(0,3)],gold:this.rnd(18,28)+floor*2});
        st.log='Un gardien surgit du coffre !'; this.sfx('bad');
      }
    }
    this.setState(st);
    setTimeout(()=>this.advanceQueue(), 900);
  }

  makePawn(i){ const floor=this.state.floor; const hp=Math.round(46+floor*8+i*6);
    return {kind:'pion', glyph:'\u265F', name:'Pion', hp, max:hp, atk:Math.round(8+floor*1.6), vit:5, suit:this.SUITS[this.rnd(0,3)], gold:this.rnd(5,9)+floor}; }
  makeBoss(){ const boss=this.BOSSES[Math.min(this.state.bossIndex,4)]; const floor=this.state.floor;
    const hp=Math.round((120+floor*10)*boss.hpMul + this.state.bossIndex*40);
    return {kind:'boss', bkey:boss.key, glyph:boss.glyph, name:boss.name, trait:boss.trait, hp, max:hp,
      atk:Math.round((9+floor)*boss.atkMul), vit:boss.vit, suit:this.SUITS[({cavalier:3,fou:1,tour:2,dame:0,roi:3})[boss.key]], gold:this.rnd(28,42)+floor*2}; }

  advanceQueue(){
    this._qi++;
    if(this._qi < this._queue.length){ this.beginCombat(this._queue[this._qi]); }
    else { this.floorComplete(); }
  }
  beginCombat(enemy){
    const cards=this.cardHand();
    let chand=[...this.state.chand];
    if(chand.length<cards){ const {deck,discard,hand}=this.refill(this.state.deck,this.state.discard,chand,cards); chand=hand;
      this.setState({deck,discard,chand}); }
    this.setState({screen:'combat', enemy:{...enemy}, csel:[], spadeRed:0, log:`Un ${enemy.name} bloque le passage !`, combatPhase:'player', busy:false, floats:[], defeating:false, hitFlash:0, combatSeq:(this.state.combatSeq||0)+1, discardsLeft:((this.CHARS[this.state.char]||{}).discards||this.DISCARDS_PER_COMBAT), enemyTurns:0});
  }

  buildDeck(){ const deck=[]; for(const suit of this.SUITS){ for(let rank=2;rank<=14;rank++){ deck.push({uid:Math.random().toString(36).slice(2), rank, suit}); } }
    return this.shuffle(deck); }
  shuffle(arr){ arr=[...arr]; for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }
  refill(deck, discard, hand, target){ deck=[...deck]; discard=[...discard]; hand=[...hand];
    while(hand.length<target){ if(deck.length===0){ if(discard.length===0)break; deck=this.shuffle(discard); discard=[]; } hand.push(deck.shift()); }
    return {deck,discard,hand}; }
  rankLabel(r){ return r<=10? String(r) : ({11:'J',12:'Q',13:'K',14:'A'}[r]); }
  cardVal(c){ return c.joker?0:c.rank; }

  detect(sel){
    if(!sel.length) return null;
    const jok = sel.filter(c=>c.joker), reg = sel.filter(c=>!c.joker);
    if(reg.length===0){ return this.pack('joker','Joker', 26*jok.length, jok.length, sel); }
    const ranks = reg.map(c=>c.rank).sort((a,b)=>a-b);
    const suitArr = reg.map(c=>c.suit);
    const n = reg.length;
    const counts={}; ranks.forEach(r=>counts[r]=(counts[r]||0)+1);
    const cv = Object.values(counts).sort((a,b)=>b-a);
    const uniq = [...new Set(ranks)].sort((a,b)=>a-b);
    const bonus = this.state.cheatArmed?1:0; // Tricheur : -1 carte sur tous les seuils de main
    const isFlush = n>=(5-bonus) && new Set(suitArr).size===1;
    const runLen = 5-bonus; // longueur de suite requise
    let isStraight=false;
    if(n>=runLen && uniq.length===n && uniq.length>=runLen){
      if(uniq[uniq.length-1]-uniq[0]===uniq.length-1) isStraight=true;
      if(!bonus && uniq.join(',')==='2,3,4,5,14') isStraight=true; // roue 5 cartes
      if(bonus && uniq.join(',')==='2,3,4,14') isStraight=true;    // roue 4 cartes (triché)
    }
    let type,name;
    if(isStraight&&isFlush){ type='quinteflush'; name='Quinte Flush'; }
    else if(cv[0]>=4-bonus){ type='carre'; name='Carré'; }
    else if(cv[0]>=3-bonus && cv[1]>=2-bonus){ type='full'; name='Full'; }
    else if(isFlush){ type='couleur'; name='Couleur'; }
    else if(isStraight){ type='suite'; name='Suite'; }
    else if(cv[0]>=3-bonus){ type='brelan'; name='Brelan'; }
    else if(cv[0]>=2&&cv[1]>=2){ type='deuxpaires'; name='Deux paires'; }
    else if(cv[0]>=2-bonus){ type='paire'; name='Paire'; }
    else { type='haute'; name='Carte haute'; }
    if(bonus) name='✦ '+name;
    const top = ranks[ranks.length-1];
    const BASE = {haute:top, paire:14, deuxpaires:24, brelan:30, suite:40, couleur:46, full:58, carre:74, quinteflush:110};
    const base = BASE[type] + (type==='haute'?0:Math.round(top*0.4));
    return this.pack(type, name, base, jok.length, sel);
  }
  pack(type,name,base,jokers,sel){
    if(type==='invalid') return {type,name,dmg:0,effect:'',valid:false,sel};
    let dmg=base; let heal=0, draw=0, spade=0, doubled=false;
    const ch=this.CHARS[this.state.char];
    const stat = this.state.char==='mage'? ch.magie : this.state.char==='voleur'? (ch.force+ch.magie)/2 : ch.force;
    dmg = Math.round(dmg*(1+stat/55));
    // contexte passé aux jokers : cartes jouées, comptes par couleur, état du run
    const playedCards=sel.filter(c=>!c.joker);
    const suitCounts={}; playedCards.forEach(c=>{ suitCounts[c.suit]=(suitCounts[c.suit]||0)+1; });
    const ctx={type, cards:playedCards, n:playedCards.length, suitCounts, state:this.state};
    const mods={dmgMult:1, flat:0, clubEnabled:false, clubX:2, healEnabled:false, healFactor:0.5, drawEnabled:false, drawBonus:0, spadeEnabled:false, spadeBonus:0};
    (this.state.jokers||[]).forEach(key=>{ const joker=this.JOKERS[key]; if(joker&&joker.mod) joker.mod(mods,type,ctx); });
    dmg = Math.round((dmg + mods.flat) * mods.dmgMult);
    const wep=this.state.weapon?this.WEAPONS[this.state.weapon]:null;
    if(wep){ const wm=wep.mod();
      if(wm.dmgFlat) dmg+=wm.dmgFlat;
      if(wm.dmgMult) dmg=Math.round(dmg*wm.dmgMult);
      if(wm.strongMult&&['brelan','full','carre','couleur','suite','quinteflush'].includes(type)) dmg=Math.round(dmg*wm.strongMult);
    }
    const immune=(this.state.enemy&&this.state.enemy.suit)||null;
    const suits=new Set(sel.filter(c=>!c.joker).map(c=>c.suit));
    const HEART='\u2665',DIAM='\u2666',CLUB='\u2663',SPADE='\u2660'; const fx=[];
    if(suits.has(CLUB) && mods.clubEnabled){ if(immune===CLUB){ fx.push('\u2663 annulé'); } else { doubled=true; dmg=Math.round(dmg*mods.clubX); fx.push('\u2663 \xd72'); } }
    if(suits.has(HEART) && mods.healEnabled){ if(immune===HEART){ fx.push('\u2665 annulé'); } else { heal=Math.round(dmg*mods.healFactor); fx.push('\u2665 +'+heal); } }
    if(suits.has(DIAM) && mods.drawEnabled){ if(immune===DIAM){ fx.push('\u2666 annulé'); } else { draw=2+mods.drawBonus; fx.push('\u2666 pioche +'+draw); } }
    if(suits.has(SPADE) && mods.spadeEnabled){ if(immune===SPADE){ fx.push('\u2660 annulé'); } else { spade=3+mods.spadeBonus; fx.push('\u2660 att. -'+spade); } }
    const effect=fx.join(' · ');
    return {type,name,dmg,effect,heal,draw,spade,doubled,valid:true,sel};
  }

  toggleCard(uid){ if(this.state.busy)return; this.setState(s=>{ const has=s.csel.includes(uid);
    if(!has && s.csel.length>=5) return {};
    return {csel: has? s.csel.filter(x=>x!==uid) : [...s.csel, uid]}; }); }

  play(){
    if(this.state.busy) return;
    const sel = this.state.csel.map(uid=>this.state.chand.find(c=>c.uid===uid)).filter(Boolean);
    const combo = this.detect(sel); if(!combo||!combo.valid) return;
    this.setState({busy:true});
    let chand = this.state.chand.filter(c=>!this.state.csel.includes(c.uid));
    let discard=[...this.state.discard, ...sel];
    let enemy={...this.state.enemy}; let php=this.state.php; let spadeRed=this.state.spadeRed;
    enemy.hp = Math.max(0, enemy.hp - combo.dmg);
    if(combo.heal){ php=Math.min(this.state.pmax, php+combo.heal); }
    if(combo.spade){ spadeRed += combo.spade; }
    let deck=this.state.deck;
    this.addFloat('enemy', '-'+combo.dmg, this.C.gold2);
    this.sfx('hit'); if(combo.heal){ this.sfx('heal'); this.addFloat('hero','+'+combo.heal, this.C.green); }
    const cards=this.cardHand();
    let target=cards+(combo.draw||0);
    const rf=this.refill(deck, discard, chand, Math.min(cards+3,target)); deck=rf.deck; discard=rf.discard; chand=rf.hand;
    this.setState({chand, deck, discard, enemy, php, spadeRed, csel:[], cheatArmed:false, hitFlash:(this.state.hitFlash||0)+1, log:`${combo.name} — ${combo.dmg} dégâts${combo.effect? ' · '+combo.effect:''}`});
    if(enemy.hp<=0){ this.shakeEl('enemy'); this.setState({defeating:true}); setTimeout(()=>this.winCombat(), 700); return; }
    this.shakeEl('enemy');
    setTimeout(()=>this.enemyTurn(), 850);
  }
  discardHand(){ if(this.state.busy)return; if(!this.state.csel.length)return; if(this.state.discardsLeft<=0){ this.sfx('bad'); this.setState({log:'Plus de défausses pour ce combat.'}); return; }
    const sel=this.state.csel.map(uid=>this.state.chand.find(c=>c.uid===uid)).filter(Boolean);
    let chand=this.state.chand.filter(c=>!this.state.csel.includes(c.uid));
    let discard=[...this.state.discard,...sel];
    const rf=this.refill(this.state.deck,discard,chand,this.cardHand());
    this.setState({chand:rf.hand,deck:rf.deck,discard:rf.discard,csel:[],discardsLeft:this.state.discardsLeft-1,log:'Cartes défaussées.'});
    setTimeout(()=>this.enemyTurn(),300);
  }
  enemyTurn(){
    const enemy=this.state.enemy; if(!enemy||enemy.hp<=0){ this.setState({busy:false}); return; }
    const ch=this.CHARS[this.state.char];
    const turns=(this.state.enemyTurns||0)+1;
    const wepD=this.state.weapon?this.WEAPONS[this.state.weapon]:null;
    const dodgeBonus=(wepD&&wepD.mod().dodgeBonus)||0;
    const dodgeCh = Math.min(0.45, Math.max(0.04, (ch.vitesse - enemy.vit)*0.03 + 0.06 + dodgeBonus));
    if(Math.random()<dodgeCh){ this.addFloat('hero','Esquive !', this.C.gold);
      this.setState({busy:false, enemyTurns:turns, log:`${ch.name} esquive l'attaque !`}); return; }
    const esc = Math.max(0, turns-1) * Math.max(2, Math.round(enemy.atk*0.15));
    const raw = Math.max(1, (enemy.atk + esc - Math.floor(ch.defense/2) - this.state.spadeRed) + this.rnd(-1,2));
    const poisonDmg=this.state.poisoned?3:0;
    const php=Math.max(0, this.state.php - raw - poisonDmg);
    this.sfx('hurt'); this.addFloat('hero','-'+(raw+poisonDmg), this.C.red); this.shakeEl('hero');
    this.setState({php, busy:false, enemyTurns:turns, log:`${enemy.name} riposte — ${raw} dégâts${esc>0?' (enragé +'+esc+')':''}${poisonDmg>0?' + 3 poison':''}`});
    if(php<=0){ setTimeout(()=>this.death(), 800); }
  }
  winCombat(){
    const enemy=this.state.enemy; const gold=this.state.gold + enemy.gold;
    this.sfx(enemy.kind==='boss'?'win':'coin');
    this.addFloat('enemy','+'+enemy.gold+' or', this.C.gold);
    let st={gold, log:`${enemy.name} vaincu ! +${enemy.gold} or`};
    if(this.rnd(0,99) < (enemy.kind==='boss'?100:35)){
      const card={uid:Math.random().toString(36).slice(2), rank:this.rnd(10,14), suit:this.SUITS[this.rnd(0,3)]};
      st.deck=[...this.state.deck, card]; st.log+=' · butin : +1 carte au deck';
      this.addFloat('enemy','+carte', this.C.blue);
    }
    const cc=this.CHARS[this.state.char]; // Paladin : regagne de la vie à chaque combat gagné
    if(cc&&cc.heal){ const php=Math.min(this.state.pmax, this.state.php+cc.heal); if(php>this.state.php){ st.php=php; this.sfx('heal'); this.addFloat('hero','+'+cc.heal, this.C.green); st.log+=` · +${cc.heal} PV`; } }
    this.setState(st);
    setTimeout(()=>{ this.setState({screen:'plan'}); setTimeout(()=>this.advanceQueue(), 450); }, 1000);
  }
  death(){
    this.sfx('over');
    const best=Math.max(this.state.best, this.state.bossesBeaten);
    try{ localStorage.setItem('pm_best', String(best)); }catch(_e){}
    this.setState({screen:'result', best, lastBoss:'mort'});
  }
  floorComplete(){
    let st={}; const grid=this.state.grid;
    if(grid.boss){
      const beaten=this.state.bossesBeaten+1; const bossIndex=Math.min(this.state.bossIndex+1,4);
      const unlocked=[...(this.state.unlocked||[])]; const newUnlock=[];
      for(const key of this.CHAR_ORDER){ const need=this.UNLOCKS[key];
        if(need!=null && beaten>=need && !unlocked.includes(key)){ unlocked.push(key); newUnlock.push(key); } }
      if(newUnlock.length){ this.saveUnlocked(unlocked); this.sfx('win'); }
      st={bossesBeaten:beaten, bossIndex, gridN:Math.min(this.state.gridN+1,11), unlocked,
          newUnlock:newUnlock.length?newUnlock:null, best:Math.max(this.state.best,beaten)};
      try{ localStorage.setItem('pm_best', String(Math.max(this.state.best,beaten))); }catch(_e){}
    }
    const shop=this.genShop();
    // newUnlock:null par défaut pour ne pas garder la bannière de déblocage sur les étages suivants
    this.setState({newUnlock:null, ...st, screen:'shop', floor:this.state.floor+1, shop});
  }
  // génère les offres d'UNE catégorie (réutilisé par genShop et rerollCategory)
  genCategory(cat){
    const pick=(arr,count)=>{ const pool=[...arr],picked=[]; while(picked.length<count&&pool.length) picked.push(pool.splice(this.rnd(0,pool.length-1),1)[0]); return picked; };
    if(cat==='jokers'){ const owned=this.state.jokers||[]; const keys=Object.keys(this.JOKERS).filter(key=>!owned.includes(key));
      return pick(keys,Math.min(2,keys.length)).map(key=>({key,price:this.JOKERS[key].price,sold:false})); }
    if(cat==='pieces'){ const set=this.shapeKeys();
      return Array.from({length:3},()=>({shape:set[this.rnd(0,set.length-1)],rot:this.rnd(0,3),price:this.rnd(8,12),sold:false})); }
    if(cat==='cards'){ return Array.from({length:3},()=>({rank:this.rnd(9,14),suit:this.SUITS[this.rnd(0,3)],price:this.rnd(10,16),sold:false})); }
    if(cat==='weapons'){ const keys=Object.keys(this.WEAPONS).filter(key=>key!==this.state.weapon);
      return pick(keys,Math.min(2,keys.length)).map(key=>({key,price:this.WEAPONS[key].price,sold:false})); }
    return [];
  }
  genShop(){
    const trimCard = this.state.deck.length>10 ? {type:'trimCard',price:8,sold:false} : null;
    const trimPiece = this.state.hand.length>3 ? {type:'trimPiece',price:6,sold:false} : null;
    const portalReset=this.state.char==='mage'&&this.state.portalUsed?{type:'portalReset',price:16,sold:false}:null;
    const cheatReset=this.state.char==='tricheur'&&this.state.cheatUsed?{type:'cheatReset',price:16,sold:false}:null;
    return {jokers:this.genCategory('jokers'), pieces:this.genCategory('pieces'), cards:this.genCategory('cards'),
      weapons:this.genCategory('weapons'), trimCard, trimPiece, portalReset, cheatReset};
  }
  rerollCategory(cat){ const cost=this.REROLL_CAT_COST; if(this.state.gold<cost||!this.state.shop) return;
    const shop={...this.state.shop}; shop[cat]=this.genCategory(cat);
    this.sfx('buy'); this.setState({gold:this.state.gold-cost, shop}); }
  buyShop(cat,i){ const snap=this.state; if(!snap.shop) return;
    if(cat==='portalReset'){
      const offer=snap.shop[cat]; if(!offer||offer.sold||snap.gold<offer.price) return;
      const shop={...snap.shop,portalReset:{...offer,sold:true}};
      this.sfx('buy'); this.setState({gold:snap.gold-offer.price,portalUsed:false,portalRecharge:0,shop}); return;
    }
    if(cat==='cheatReset'){
      const offer=snap.shop[cat]; if(!offer||offer.sold||snap.gold<offer.price) return;
      const shop={...snap.shop,cheatReset:{...offer,sold:true}};
      this.sfx('buy'); this.setState({gold:snap.gold-offer.price,cheatUsed:false,shop}); return;
    }
    if(cat==='trimCard'||cat==='trimPiece'){
      const offer=snap.shop[cat]; if(!offer||offer.sold||snap.gold<offer.price) return;
      if(cat==='trimCard'){
        const deck=[...snap.deck]; deck.splice(this.rnd(0,deck.length-1),1);
        const shop={...snap.shop,trimCard:{...offer,sold:true}};
        this.sfx('buy'); this.setState({gold:snap.gold-offer.price,deck,shop}); return;
      }
      const hand=[...snap.hand]; hand.splice(this.rnd(0,hand.length-1),1);
      const shop={...snap.shop,trimPiece:{...offer,sold:true}};
      this.sfx('buy'); this.setState({gold:snap.gold-offer.price,hand,shop}); return;
    }
    const offer=snap.shop[cat][i]; if(!offer||offer.sold||snap.gold<offer.price) return;
    if(cat==='jokers'){ if(snap.jokers.length>=5) return; this.setState({jokers:[...snap.jokers,offer.key]}); }
    else if(cat==='pieces'){ if(snap.hand.length>=this.HAND_MAX) return; this.setState({hand:[...snap.hand,{uid:Math.random().toString(36).slice(2),key:offer.shape,rot:offer.rot||0}]}); }
    else if(cat==='cards'){ this.setState({deck:[...snap.deck,{uid:Math.random().toString(36).slice(2),rank:offer.rank,suit:offer.suit}]}); }
    else if(cat==='weapons'){ this.setState({weapon:offer.key}); }
    const shop={...snap.shop}; // garde élaguer / recharges (sinon ils disparaissent après un achat)
    shop[cat]=shop[cat].map((item,j)=>j===i?{...item,sold:true}:item);
    this.sfx('buy'); this.setState({gold:snap.gold-offer.price, shop});
  }
  rerollShop(){ if(this.state.gold<5) return; this.setState({gold:this.state.gold-5, shop:this.genShop()}); }
  leaveShop(){ this.setState({screen:'plan'}, ()=>this.genFloor()); }

  addFloat(target,text,color){ const id=Math.random().toString(36).slice(2);
    this.setState(s=>({floats:[...s.floats,{id,target,text,color}]}));
    setTimeout(()=>this.setState(s=>({floats:s.floats.filter(f=>f.id!==id)})),1100); }
  shakeEl(t){ this._shake=t; this.setState(s=>({_sk:Math.random()})); setTimeout(()=>{this._shake=null;this.setState(s=>({_sk:Math.random()}));},450); }

  icon(name,size,color){ const clr=this.C; return React.createElement('span',{style:{display:'inline-flex',width:size,height:size,color:color||clr.text},dangerouslySetInnerHTML:{__html:this.SVG[name]}}); }

  btn(label,onClick,opt={}){ const clr=this.C; const {primary,danger,disabled,small,wide}=opt;
    return React.createElement('button',{onClick:disabled?null:onClick,disabled,style:{
      fontFamily:'Space Grotesk',fontWeight:600,fontSize:small?12:14,letterSpacing:'.04em',
      padding:small?'8px 12px':'12px 18px',borderRadius:3,cursor:disabled?'not-allowed':'pointer',
      border:'1px solid '+(primary?clr.gold:danger?clr.red:clr.line2),
      background:disabled?'#1a1614':primary?'linear-gradient(180deg,#e9b24b,#c98a2f)':danger?'rgba(207,80,64,.12)':clr.p2,
      color:disabled?clr.mut:primary?'#1a1207':danger?clr.red:clr.text,opacity:disabled?.5:1,
      width:wide?'100%':'auto',transition:'transform .08s,filter .15s',textTransform:'uppercase',
      boxShadow:primary&&!disabled?'0 3px 0 #8a5e1f':'none'
    }, onMouseDown:evt=>{if(!disabled)evt.currentTarget.style.transform='translateY(2px)';},
       onMouseUp:evt=>evt.currentTarget.style.transform='none',
       onMouseLeave:evt=>evt.currentTarget.style.transform='none'}, label); }

  renderIntro(){
    const h=React.createElement;
    const goSelect=()=>this.setState({screen:'select'});
    const goAuth=()=>this.setState({screen:'auth'});
    const ob={position:'absolute',background:'transparent',border:'none',cursor:'pointer',opacity:0,padding:0};
    return h('div',{style:{position:'fixed',inset:0,background:'#0e0c0b',display:'flex',alignItems:'center',justifyContent:'center'}},
      h('div',{style:{position:'relative',display:'inline-flex',maxHeight:'100dvh',maxWidth:'100vw'}},
        h('img',{src:'./hero.webp',draggable:false,
          style:{display:'block',maxHeight:'100dvh',maxWidth:'100vw',width:'auto',height:'auto'}}),
        h('button',{onClick:goSelect,'aria-label':'Commencer',
          style:{...ob,top:'88%',bottom:'1%',left:'2%',right:'52%'}}),
        h('button',{onClick:goAuth,'aria-label':'Se connecter',
          style:{...ob,top:'88%',bottom:'1%',left:'52%',right:'2%'}})
      )
    );
  }

  renderHome(port){
    const clr=this.C,h=React.createElement; const acc=this.state.account;
    const feats=[
      {ic:'flag',title:'Trace le chemin',col:clr.gold},
      {ic:'deck',title:'Combat de cartes',col:clr.blue},
      {ic:'heart',title:'Une seule vie',col:clr.red}
    ];
    const glyphs=['\u265F','\u265E','\u265D','\u265C','\u265B','\u265A'];
    const featCards = feats.map((f,i)=> h('div',{key:i,style:{display:'flex',gap:12,alignItems:'center',textAlign:'left',
      background:'linear-gradient(180deg,#1b1613,#141009)',border:'1px solid '+clr.line,borderRadius:8,padding:'14px 16px',
      animation:'pmRise .5s cubic-bezier(.2,.8,.2,1) backwards',animationDelay:(0.25+i*0.12)+'s',
      width:port?'100%':220}},
      h('div',{style:{width:34,height:34,flexShrink:0,borderRadius:8,background:'#0e0b09',border:'1px solid '+clr.line2,display:'flex',alignItems:'center',justifyContent:'center',color:f.col}}, this.icon(f.ic,18,f.col)),
      h('div',{style:{fontSize:13,fontWeight:700,color:clr.text}}, f.title)));

    const cta = acc?
      h('div',{style:{display:'flex',flexDirection:'column',gap:10,alignItems:'center'}},
        h('div',{style:{fontSize:14,color:clr.mut}}, 'Connecté en tant que ', h('span',{style:{color:clr.gold,fontWeight:700}}, acc.name)),
        h('div',{style:{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center'}},
          this.btn('Continuer \u2192', ()=>this.setState({screen:'select'}), {primary:true}),
          this.btn('Se déconnecter', ()=>this.logout(), {small:true})))
      :
      h('div',{style:{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}},
        this.btn('Jouer en invité \u2192', ()=>this.playAsGuest(), {primary:true}),
        h('div',{style:{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center'}},
          this.btn('Créer un compte · bient\u00f4t', null, {disabled:true,small:true}),
          this.btn('Se connecter · bient\u00f4t', null, {disabled:true,small:true})),
        );

    return h('div',{style:{animation:'pmFade .5s ease',textAlign:'center',padding:port?'16px 12px':'28px 24px',maxWidth:port?340:840}},
      h('div',{style:{display:'flex',gap:port?10:16,justifyContent:'center',marginBottom:18,opacity:.5}},
        glyphs.map((g,i)=>h('span',{key:i,style:{fontSize:port?20:26,color:i%2?clr.gold:clr.mut,animation:'pmBob '+(2+i*0.3)+'s ease-in-out infinite'}},g))),
      h('div',{style:{fontSize:port?10:11,letterSpacing:port?'.3em':'.5em',color:clr.gold,marginBottom:12}}, 'PUZZLE \u00B7 ROGUELIKE \u00B7 DONJON'),
      h('h1',{className:'pm-pixel',style:{fontSize:port?34:62,lineHeight:1.05,color:clr.text,textShadow:'0 5px 0 #2a211a, 0 0 40px rgba(224,165,59,.3)',marginBottom:14,animation:'pmTitleIn .7s cubic-bezier(.2,.8,.2,1) backwards'}}, 'PATHOMINO'),

      this.state.best>0 ? h('p',{style:{color:clr.gold,fontSize:13,margin:'8px auto 0',letterSpacing:'.06em'}}, 'Meilleur score : '+this.state.best+' boss vaincus') : null,
      h('div',{style:{display:'flex',flexDirection:port?'column':'row',gap:14,justifyContent:'center',alignItems:port?'stretch':'flex-start',margin:port?'24px 0':'34px 0'}}, featCards),
      cta
    );
  }

  authInput(value,onCh,ph,type){ const clr=this.C,h=React.createElement;
    return h('input',{type:type||'text', value:value||'', placeholder:ph,
      onChange:(evt)=>onCh(evt.target.value),
      onKeyDown:(evt)=>{ if(evt.key==='Enter') this.submitAuth(); },
      onFocus:(evt)=>evt.target.style.borderColor=clr.gold,
      onBlur:(evt)=>evt.target.style.borderColor=clr.line2,
      style:{width:'100%',padding:'12px 14px',borderRadius:6,background:'#0e0b09',border:'1px solid '+clr.line2,
        color:clr.text,fontSize:15,fontFamily:'Space Grotesk',outline:'none',transition:'border-color .15s'}}); }
  renderAuth(port){
    const clr=this.C,h=React.createElement; const login=this.state.authMode==='login';
    const field=(label,node)=>h('div',{style:{textAlign:'left',marginBottom:14}},
      h('div',{style:{fontSize:11,letterSpacing:'.12em',color:clr.mut,marginBottom:6}}, label), node);
    return h('div',{style:{animation:'pmFade .4s ease',width:port?320:400,padding:port?'24px 20px':'34px 32px',
      background:'linear-gradient(180deg,#1d1713,#120c0a)',border:'1px solid '+clr.line,borderRadius:12,boxShadow:'0 30px 80px rgba(0,0,0,.5)'}},
      h('div',{style:{textAlign:'center',marginBottom:6}},
        h('span',{className:'pm-pixel',style:{fontSize:16,color:clr.gold,textShadow:'0 3px 0 #6e4a1a'}}, 'PATHOMINO')),
      h('div',{className:'pm-pixel',style:{fontSize:13,color:clr.text,textAlign:'center',marginBottom:6,lineHeight:1.5}}, login?'SE CONNECTER':'CRÉER UN COMPTE'),
      h('p',{style:{fontSize:12,color:clr.mut,textAlign:'center',marginBottom:22,lineHeight:1.5}}, 'Ton compte garde ton pseudo et tes records sur cet appareil.'),
      field('PSEUDO', this.authInput(this.state.authName,(v)=>this.setState({authName:v,authErr:''}),'Ton nom d\u2019aventurier')),
      field('MOT DE PASSE', this.authInput(this.state.authPass,(v)=>this.setState({authPass:v,authErr:''}),'\u2022\u2022\u2022\u2022','password')),
      this.state.authErr? h('div',{style:{fontSize:12,color:clr.red,marginBottom:12,textAlign:'left'}}, this.state.authErr):null,
      this.btn(login?'Se connecter \u2192':'Créer le compte \u2192', ()=>this.submitAuth(), {primary:true,wide:true}),
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16,gap:8}},
        h('button',{onClick:()=>this.setState({authMode:login?'create':'login',authErr:''}),
          style:{background:'none',border:'none',color:clr.mut,fontSize:12,cursor:'pointer',fontFamily:'Space Grotesk',textDecoration:'underline',padding:0}},
          login?'Pas de compte ? Créer':'Déjà un compte ? Se connecter'),
        h('button',{onClick:()=>this.playAsGuest(),
          style:{background:'none',border:'none',color:clr.mut,fontSize:12,cursor:'pointer',fontFamily:'Space Grotesk',padding:0}}, 'Invité')),
      h('div',{style:{height:1,background:clr.line,margin:'18px 0 14px'}}),
      this.btn('\u2190 Retour', ()=>this.setState({screen:'home',authErr:''}), {small:true,wide:true})
    );
  }

  renderSelect(port){
    const clr=this.C, h=React.createElement;
    // persos débloqués (dans l'ordre) + une carte teaser pour le prochain à débloquer
    const unlockedKeys=this.CHAR_ORDER.filter(k=>this.isUnlocked(k));
    const nextLocked=this.CHAR_ORDER.find(k=>!this.isUnlocked(k));
    const entries=unlockedKeys.map(k=>({key:k}));
    if(nextLocked) entries.push({key:nextLocked, locked:true, need:this.UNLOCKS[nextLocked]});
    const count=entries.length;
    const ci=(((this.state.charIdx||0)%count)+count)%count;
    const entry=entries[ci]; const k=entry.key; const c=this.CHARS[k];
    const isLocked=!!entry.locked;

    const nav=(dir)=>this.setState(s=>({charIdx:((((s.charIdx||0)+dir)%count)+count)%count}));

    const stats=[['Vie',c.vie],['Force',c.force],['Équilibre',c.defense],['Magie',c.magie],['Vitesse',c.vitesse]];

    const statsEl = isLocked ?
      h('div',{style:{fontSize:13,color:clr.mut,marginTop:12,letterSpacing:'.1em'}}, '?  ?  ?  ?  ?') :
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr',gap:5,marginTop:14,width:port?260:300}},
        stats.map(([lab,v])=>{
          const maxV=lab==='Vie'?120:18;
          return h('div',{key:lab,style:{display:'flex',alignItems:'center',gap:8,fontSize:12}},
            h('span',{style:{width:58,color:clr.mut}},lab),
            h('div',{style:{flex:1,height:5,background:'#0e0b09',borderRadius:3,overflow:'hidden'}},
              h('div',{style:{height:'100%',width:Math.min(100,(v/maxV)*100)+'%',background:c.color,borderRadius:3,transition:'width .3s'}})),
            h('span',{style:{width:26,textAlign:'right',color:clr.text,fontWeight:600}}, v));
        }));

    const lockMsg = isLocked ? ('Bats '+entry.need+' boss pour le débloquer') : null;

    const spriteEl = isLocked ?
      h('div',{style:{width:130,height:140,display:'flex',alignItems:'center',justifyContent:'center',fontSize:72,color:clr.mut,filter:'blur(2px)',userSelect:'none'}}, '?') :
      h('div',{}, this.pixelSprite(k, 10));

    const card = h('div',{
      onTouchStart:(evt)=>{ this._swipeX=evt.touches[0].clientX; },
      onTouchEnd:(evt)=>{ const dx=evt.changedTouches[0].clientX-(this._swipeX||0); if(Math.abs(dx)>40) nav(dx<0?1:-1); },
      style:{display:'flex',flexDirection:'column',alignItems:'center',gap:10,padding:port?'20px 16px':'26px 28px',
        background:'linear-gradient(180deg,#211c18,#161210)',border:'1px solid '+(isLocked?clr.line:c.color),borderRadius:10,
        width:port?290:320,minHeight:460,animation:'pmFade .3s ease',transition:'border-color .3s'}},
      spriteEl,
      h('div',{className:'pm-pixel',style:{fontSize:15,color:isLocked?clr.mut:clr.text}}, isLocked?'???':c.name),
      lockMsg ?
        h('div',{style:{fontSize:12,color:clr.mut,fontStyle:'italic',textAlign:'center'}}, lockMsg) :
        h('div',{style:{fontSize:13,color:clr.mut,textAlign:'center',lineHeight:1.4}}, c.desc),
      statsEl,
      isLocked ? null : h('div',{style:{marginTop:'auto',width:'100%',paddingTop:12}},
        this.btn('Choisir '+c.name+' →', ()=>this.startRun(k), {primary:true,wide:true}))
    );

    const dots = h('div',{style:{display:'flex',gap:8,justifyContent:'center',marginTop:14}},
      entries.map((_,i)=>h('div',{key:i,onClick:()=>this.setState({charIdx:i}),
        style:{width:i===ci?20:8,height:8,borderRadius:4,background:i===ci?clr.gold:clr.line2,cursor:'pointer',transition:'width .2s'}})));

    const arrow=(dir,label)=>h('button',{onClick:()=>nav(dir),
      style:{background:'none',border:'1px solid '+clr.line2,color:clr.mut,width:42,height:42,borderRadius:6,
        cursor:'pointer',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
        transition:'border-color .15s'},
      onMouseEnter:evt=>evt.currentTarget.style.borderColor=clr.gold,
      onMouseLeave:evt=>evt.currentTarget.style.borderColor=clr.line2}, label);

    return h('div',{style:{animation:'pmFade .5s ease',textAlign:'center',padding:port?'12px 8px':24,maxWidth:port?360:820}},
      h('div',{style:{fontSize:11,letterSpacing:'.5em',color:clr.gold,marginBottom:18}}, 'CHOISIR TON HÉROS'),
      this.state.best>0 ? h('p',{style:{color:clr.gold,fontSize:12,margin:'0 auto 16px',letterSpacing:'.06em'}}, 'Meilleur score : '+this.state.best+' boss vaincus') : null,
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:port?8:18}},
        arrow(-1,'←'), card, arrow(1,'→')),
      dots,
      h('div',{style:{fontSize:11,color:clr.mut,marginTop:10}}, (ci+1)+' / '+count)
    );
  }

  renderPlan(port){
    const clr=this.C,h=React.createElement; const grid=this.state.grid; if(!grid) return h('div',null);
    const pmap=this.placedMap(); const gc=this.ghostCells(); const gValid = gc&&this.ghostValid(gc);
    const gset = gc? new Set(gc.map(c=>c.join(','))):new Set();
    const cell=Math.min(Math.floor(440/grid.n),52);
    const connected=new Set();
    if(pmap[grid.start.join(',')]){ connected.add(grid.start.join(',')); const queue=[grid.start];
      while(queue.length){ const [cr,cc]=queue.shift(); [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{ const nr=cr+dr,nc=cc+dc,kk=nr+','+nc;
        if(nr>=0&&nc>=0&&nr<grid.n&&nc<grid.n&&pmap[kk]&&!connected.has(kk)){connected.add(kk);queue.push([nr,nc]);} }); } }
    const hasOrphan = this.state.placed.some(pl=>pl.cells.some(c=>!connected.has(c.join(','))));
    const cells=[];
    for(let r=0;r<grid.n;r++)for(let c=0;c<grid.n;c++){
      const k=r+','+c; const placed=pmap[k];
      const isStart=this.eq([r,c],grid.start), isKey=this.eq([r,c],grid.key), isDoor=this.eq([r,c],grid.door);
      const isPawn=grid.pawns.some(p=>this.eq(p,[r,c]));
      const inGhost=gset.has(k);
      let bg='#13100e', bd=clr.line, bstyle='solid';
      if(placed){ if(connected.has(k)){ bg='linear-gradient(135deg,#3a2f1d,#564219)'; bd=clr.gold; }
        else { bg='#241f1a'; bd=clr.line2; bstyle='dashed'; } }
      const isTreasure = grid.treasure && this.eq(grid.treasure,[r,c]);
      const isHole=(grid.holes||[]).some(p=>this.eq(p,[r,c]));
      const isTrap=(grid.traps||[]).some(p=>this.eq(p,[r,c]));
      const isFood=(grid.foods||[]).some(p=>this.eq(p,[r,c]));
      const isPotion=(grid.potions||[]).some(p=>this.eq(p,[r,c]));
      const isPortalA=this.state.portalA&&this.eq(this.state.portalA,[r,c]);
      const isPortalB=this.state.portalB&&this.eq(this.state.portalB,[r,c]);
      if(isFood && !placed){ bg='rgba(160,50,50,.2)'; bd='#7a3a3a'; }
      if(isPotion && !placed){ bg='rgba(90,40,160,.2)'; bd='#6a3a9a'; }
      if(isTrap && !placed){ bg='rgba(40,90,40,.25)'; bd='#3a6e3a'; }
      if(inGhost){ bg= gValid? 'rgba(224,165,59,.32)':'rgba(207,80,64,.3)'; bd=gValid?clr.gold2:clr.red; bstyle='solid'; }
      if(isHole){ bg='#060504'; bd='#1a1512'; bstyle='dashed'; }
      if(isPortalA||isPortalB){ bd=clr.blue; bstyle='solid'; bg='rgba(111,155,202,.22)'; }
      if(this.state.selectingPortal&&!placed&&!isHole){ bd=clr.blue; bstyle='dashed'; }
      let content=null;
      if(isFood && !placed) content=h('span',{style:{fontSize:cell*.5,color:'#d96060',filter:'drop-shadow(0 0 3px rgba(220,80,80,.5))'}}, '\u2665');
      else if(isPotion && !placed) content=h('span',{style:{fontSize:cell*.45,color:'#a06ad0',filter:'drop-shadow(0 0 3px rgba(160,100,220,.5))'}}, '\u2697');
      else if(isHole) content=h('span',{style:{fontSize:cell*.45,color:'#2e2520',fontWeight:700}}, '\u00d7');
      else if(isTrap && !placed) content=h('span',{style:{fontSize:cell*.45,color:'#5a9a5a',filter:'drop-shadow(0 0 3px rgba(80,180,80,.5))'}}, '\u2620');
      else if(isPawn) content=h('span',{style:{position:'relative',fontSize:cell*.6,lineHeight:1,color: pmap[k]?clr.red:clr.mut}}, '\u265F',
        (isKey||isDoor)? h('span',{style:{position:'absolute',right:-cell*.12,bottom:-cell*.12,display:'inline-flex'}}, this.icon(isKey?'key':'door', cell*.3, clr.gold2)) : null);
      else if(isStart) content=this.icon('flag',cell*.5, placed?clr.gold2:clr.text);
      else if(isKey) content=this.icon('key',cell*.52, clr.gold2);
      else if(isDoor) content= grid.boss? h('span',{style:{fontSize:cell*.62,lineHeight:1,color:placed?clr.red:'#b98', filter:'drop-shadow(0 0 4px rgba(207,80,64,.5))'}}, this.BOSSES[Math.min(this.state.bossIndex,4)].glyph) : this.icon('door',cell*.55, placed?clr.gold2:clr.text);
      else if(isTreasure) content=this.icon('chest',cell*.56, placed?clr.gold2:clr.gold);
      if(isPortalA||isPortalB) content=h('span',{style:{fontSize:cell*.38,color:clr.blue,fontWeight:900,filter:'drop-shadow(0 0 3px rgba(111,155,202,.7))'}},isPortalA?'A':'B');
      cells.push(h('div',{key:k,
        'data-rc':r+','+c,
        onMouseEnter:()=>this.hoverCell(r,c),
        onClick:()=>{
          if(this.state.selectingPortal&&!this.state.executing){
            if(!this.state.portalA){ if(!isHole) this.setState({portalA:[r,c]}); return; }
            if(!this.eq(this.state.portalA,[r,c])&&!isHole){ this.setState({portalB:[r,c],portalUsed:true,selectingPortal:false,portalRecharge:this.state.floor+2}); this.sfx('valid'); return; }
            return;
          }
          if(this.state.selPiece===null && pmap[k] && !this.state.executing) this.retrievePiece(r,c); else this.placeAt(r,c);
        },
        style:{width:cell,height:cell,background:bg,border:'1px '+bstyle+' '+bd,borderRadius:3,
          display:'flex',alignItems:'center',justifyContent:'center',position:'relative',
          cursor:this.state.selPiece!==null?'pointer':'default',
          animation: this.state.executing&&placed?'pmPulse 1s ease infinite':((this.state.justPlaced||[]).includes(k)?'pmPop .34s ease backwards':(isKey?'pmGlow 2s ease infinite':'none'))}},
        content));
    }
    const gridEl=h('div',{onMouseLeave:()=>{ if(!this.state.dragging) this.setState({ghost:null}); },
      style:{display:'grid',gridTemplateColumns:`repeat(${grid.n},${cell}px)`,gap:2,padding:14,touchAction:'none',
        background:'#0c0a09',border:'1px solid '+clr.line,borderRadius:8,boxShadow:'inset 0 0 40px rgba(0,0,0,.6)'}}, cells);

    // chaque (forme + sens) est une pièce distincte : on regroupe par key@rot
    const groups={}; this.state.hand.forEach((p,i)=>{ const gk=p.key+'@'+(p.rot||0); (groups[gk]=groups[gk]||{key:p.key,rot:p.rot||0,idx:[]}).idx.push(i); });
    const tray = Object.values(groups).map(gr=>{
      const sel = this.state.selPiece!==null && gr.idx.includes(this.state.selPiece);
      const i0 = sel ? this.state.selPiece : gr.idx[0];
      const shape=this.rotated(gr.key, gr.rot);
      const rows=Math.max(...shape.map(c=>c[0]))+1, cols=Math.max(...shape.map(c=>c[1]))+1;
      const sset=new Set(shape.map(c=>c.join(','))); const u=12; const mini=[];
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ mini.push(h('div',{key:r+','+c,style:{width:u,height:u,
        background:sset.has(r+','+c)?(sel?clr.gold:'#9a7a3a'):'transparent',borderRadius:2}})); }
      return h('div',{key:gr.key+'@'+gr.rot, onMouseDown:(evt)=>this.startDrag(i0,evt), onTouchStart:(evt)=>this.startDrag(i0,evt), onClick:()=>{ if(this.state.dragging) return; this.sfx('select'); const mid=Math.floor(this.state.grid.n/2); this.setState({selPiece:sel?null:gr.idx[0], ghost:sel?null:[mid,mid]}); },
        title:gr.key+' ×'+gr.idx.length+' — touche pour prendre, vise la grille, clique pour poser',
        style:{position:'relative',width:64,height:64,touchAction:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:this.state.dragging&&sel?'grabbing':'grab',
          background:sel?'rgba(224,165,59,.14)':clr.p1,border:'1px solid '+(sel?clr.gold:clr.line),borderRadius:5,transition:'background .12s,border-color .12s'}},
        h('div',{style:{display:'grid',gridTemplateColumns:`repeat(${cols},${u}px)`,gap:2}}, mini),
        h('div',{style:{position:'absolute',top:-7,right:-7,minWidth:18,height:18,padding:'0 4px',borderRadius:9,
          background:gr.idx.length>1?clr.gold:clr.p3,color:gr.idx.length>1?'#1a1207':clr.mut,border:'1px solid '+(gr.idx.length>1?clr.gold2:clr.line),
          fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}, '\u00d7'+gr.idx.length));
    });

    const chk=this.pathOk();
    const head=this.state.floor; const boss=grid.boss;
    const bdef=this.BOSSES[Math.min(this.state.bossIndex,4)];
    const legend=[['flag','Départ'],['key','Clé'],[boss?'boss':'door',boss?bdef.name:'Porte'],['pawn','Pion (combat)'],['chest','Trésor']];
    const noDraw=this.state.hand.length>=this.HAND_MAX || this.state.drawsLeft<=0;
    const drawTile=h('div',{key:'__draw', onClick:()=>{ if(!noDraw) this.pickPiece(); }, title:'Piocher une pièce ('+this.state.drawsLeft+' restantes cet étage)',
      style:{position:'relative',width:64,height:64,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,
        cursor:noDraw?'not-allowed':'pointer',opacity:noDraw?.5:1,background:'#0e0b09',border:'1px dashed '+(noDraw?clr.line2:clr.gold),borderRadius:5}},
      this.icon('deck',18,noDraw?clr.mut:clr.gold),
      h('div',{className:'pm-pixel',style:{fontSize:10,color:noDraw?clr.mut:clr.gold2,lineHeight:1}}, this.state.hand.length>=this.HAND_MAX?'PLEIN':'PIOCHER'),
      h('div',{style:{fontSize:9,letterSpacing:'.06em',color:clr.mut}}, this.state.drawsLeft+' restante'+(this.state.drawsLeft>1?'s':'')));

    return h('div',{style:{animation:'pmFade .4s ease',width:'100%',maxWidth:port?504:1060,padding:port?'10px 8px':'18px 26px'}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:port?12:18}},
        h('div',{style:{display:'flex',alignItems:'center',gap:14}},
          h('span',{className:'pm-pixel',style:{fontSize:15,color:clr.gold}}, 'PATHOMINO'),
          h('span',{style:{fontSize:13,color:clr.mut,padding:'4px 12px',border:'1px solid '+clr.line,borderRadius:20}},
            `Étage ${head} · ${boss?'BOSS — '+bdef.name : 'Normal'}`)),
        h('div',{style:{display:'flex',gap:18,alignItems:'center'}},
          this.statChip('heart', this.state.php+'/'+this.state.pmax, clr.red),
          this.statChip('coin', this.state.gold, clr.gold),
          h('span',{style:{fontSize:12,color:clr.mut}}, this.state.bossesBeaten+' boss vaincus'),
          h('button',{onClick:()=>this.openTuto(), title:'Comment jouer',
            style:{width:26,height:26,borderRadius:'50%',cursor:'pointer',background:clr.p2,border:'1px solid '+clr.line2,color:clr.gold,fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}, '?'))),
      h('div',{style:{display:'flex',flexDirection:port?'column':'row',gap:port?16:26,alignItems:port?'center':'flex-start'}},
        h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center'}}, gridEl,
          ),
        h('div',{style:{width:port?'100%':300,maxWidth:port?460:'none',background:clr.p1,border:'1px solid '+clr.line,borderRadius:8,padding:port?16:20}},

          h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11,letterSpacing:'.12em',color:clr.mut,marginBottom:10}},
            h('span',null,'TA MAIN'),
            h('span',{style:{color:clr.gold2,letterSpacing:'.04em'}}, this.state.hand.length+'/'+this.HAND_MAX+' pièces')),
          h('div',{style:{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8,alignItems:'center'}}, [...tray, drawTile]),
          this.state.selectingPortal ? h('div',{style:{fontSize:12,color:clr.blue,marginBottom:12}}, this.state.portalA ? 'Portail : clique la 2ème cellule (A posé)' : 'Portail : clique une 1ère cellule') : this.state.selPiece!==null? h('div',{style:{fontSize:12,color:clr.gold,marginBottom:12}}, 'Vise la grille → clique pour poser.') : h('div',{style:{fontSize:12,color:clr.mut,marginBottom:12}}, 'Chaque pièce a son orientation — prends-en une, vise la grille, clique.'),
          h('div',{style:{display:'flex',gap:8,marginBottom:10,marginTop:8}},
            this.btn('Annuler', ()=>this.undo(), {small:true,danger:true,disabled:!this.state.placed.length}),
            this.state.char==='mage'?this.btn(
              this.state.selectingPortal?'Annuler portail':(this.state.portalUsed?'\u29bf Portail (\u00e9t.'+this.state.portalRecharge+')':'\u29bf Portail'),
              ()=>{ if(!this.state.portalUsed||this.state.selectingPortal) this.setState(s=>({selectingPortal:!s.selectingPortal,portalA:null})); },
              {small:true,disabled:this.state.portalUsed&&!this.state.selectingPortal}):null),
          h('div',{style:{height:1,background:clr.line,margin:'14px 0'}}),
          this.state.poisoned ? h('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:8,padding:'6px 10px',background:'rgba(86,154,90,.1)',border:'1px solid '+clr.green,borderRadius:5,fontSize:12,color:clr.green}},
            h('span',null,'☠'),
            h('span',null,'Empoisonné — +3 dmg/tour en combat')) : null,
          h('div',{style:{fontSize:13,color:chk.ok?clr.green:clr.mut,marginBottom:hasOrphan?6:12,minHeight:20}}, chk.ok?'\u2713 Chemin valide — prêt à explorer':(chk.reason||'')),
          hasOrphan? h('div',{style:{fontSize:12,color:clr.red,marginBottom:12}}, 'Pièces non reliées') : null,
          this.btn(this.state.executing?'Exploration...':'Tracer le chemin \u2192', ()=>this.validate(), {primary:true,wide:true,disabled:!chk.ok||this.state.executing}),
          this.btn('Abandonner le run', ()=>this.death(), {small:true,wide:true,danger:true}),
          this.state.weapon ? h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:10,padding:'6px 10px',background:'rgba(224,165,59,.08)',border:'1px solid #4a3a1a',borderRadius:5,fontSize:11}},
            h('span',{style:{fontSize:16,color:this.C.gold}}, this.WEAPONS[this.state.weapon].glyph),
            h('div',null,
              h('div',{style:{color:this.C.gold,fontWeight:700}}, this.WEAPONS[this.state.weapon].name),
              h('div',{style:{color:this.C.mut}}, this.WEAPONS[this.state.weapon].desc))) : null
        )
      )
    );
  }
  statChip(ic,val,col){ const clr=this.C,h=React.createElement;
    return h('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,color:clr.text}},
      this.icon(ic,16,col), val); }

  renderHud(){
    const clr=this.C,h=React.createElement; const s=this.state;
    if(!s.char) return null;
    const phpPct=Math.max(0,Math.min(100,(s.php/s.pmax)*100));
    const hpCol=phpPct>50?clr.green:phpPct>25?clr.gold:clr.red;
    return h('div',{style:{position:'fixed',top:0,left:0,right:0,zIndex:300,
      background:'rgba(14,11,9,.93)',borderBottom:'1px solid '+clr.line,
      display:'flex',alignItems:'center',gap:14,padding:'5px 14px',fontFamily:'Space Grotesk, sans-serif'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:6}},
        this.icon('heart',14,hpCol),
        h('div',{style:{width:72,height:6,background:'#0e0b09',borderRadius:3,overflow:'hidden'}},
          h('div',{style:{height:'100%',width:phpPct+'%',background:hpCol,borderRadius:3,transition:'width .3s'}})),
        h('span',{style:{fontSize:11,color:clr.mut,minWidth:52}}, s.php+'/'+s.pmax)),
      s.poisoned ? h('span',{style:{fontSize:13,color:clr.green,title:'Empoisonn\u00e9'}}, '\u2620') : null,
      h('div',{style:{width:'1px',height:16,background:clr.line}}),
      this.statChip('coin', s.gold+' or', clr.gold),
      h('div',{style:{width:'1px',height:16,background:clr.line}}),
      h('span',{style:{fontSize:11,color:clr.mut}}, '\u00c9tage\u00a0'+s.floor),
      h('span',{style:{fontSize:11,color:clr.mut}}, s.bossesBeaten+'/5 boss'));
  }

  renderCombat(port){
    const clr=this.C,h=React.createElement; const enemy=this.state.enemy; if(!enemy) return h('div',null);
    const ch=this.CHARS[this.state.char];
    const sel=this.state.csel.map(uid=>this.state.chand.find(c=>c.uid===uid)).filter(Boolean);
    const combo=this.detect(sel);
    const ehpPct=Math.max(0,(enemy.hp/enemy.max)*100), phpPct=Math.max(0,(this.state.php/this.state.pmax)*100);
    const floats=(t)=>this.state.floats.filter(f=>f.target===t).map(f=>
      h('div',{key:f.id,style:{position:'absolute',left:'50%',top:'30%',transform:'translateX(-50%)',
        fontFamily:'Press Start 2P',fontSize:18,color:f.color,animation:'pmFloatUp 1.1s ease forwards',pointerEvents:'none',whiteSpace:'nowrap',textShadow:'0 2px 0 #000'}}, f.text));

    const isBoss=enemy.kind==='boss';
    const enemyBox = (w)=> h('div',{style:{width:w}},
      h('div',{style:{background:'#0e0b09',border:'2px solid '+clr.line2,borderRadius:6,padding:'10px 14px',boxShadow:'0 4px 0 rgba(0,0,0,.4)'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}},
          h('span',{className:'pm-pixel',style:{fontSize:11,color:clr.text}}, enemy.name),
          h('span',{style:{fontSize:11,color:clr.mut}}, isBoss?'BOSS':'Niv.'+this.state.floor)),
        h('div',{style:{height:9,background:'#000',borderRadius:5,overflow:'hidden',border:'1px solid '+clr.line}},
          h('div',{style:{height:'100%',width:ehpPct+'%',background:ehpPct>30?'linear-gradient(90deg,#86b46a,#5d8a45)':'linear-gradient(90deg,#cf5040,#9a2f22)',transition:'width .5s ease'}})),
        h('div',{style:{textAlign:'right',fontSize:11,color:clr.mut,marginTop:3}}, enemy.hp+'/'+enemy.max+' PV'),
        enemy.suit? h('div',{style:{display:'flex',alignItems:'center',gap:6,marginTop:6,paddingTop:6,borderTop:'1px solid '+clr.line}},
          h('span',{style:{fontSize:11,color:clr.mut}}, 'Immunité'),
          h('span',{style:{fontSize:15,color:(enemy.suit==='\u2665'||enemy.suit==='\u2666')?clr.red:clr.text}}, enemy.suit),
          h('span',{style:{fontSize:11,color:clr.mut}}, '\u2014 annule ce pouvoir')):null));

    const jokerBarInner = this.state.jokers.length? h('div',{style:{display:'flex',gap:6,zIndex:5}},
      this.state.jokers.map((key,i)=>{ const joker=this.JOKERS[key]; return h('div',{key:i,title:joker.name+' \u2014 '+joker.desc,style:{width:34,height:46,borderRadius:6,background:'linear-gradient(165deg,#2a2438,#171320)',border:'1.5px solid '+joker.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:joker.color,boxShadow:'0 3px 6px rgba(0,0,0,.5)'}}, joker.glyph); })):null;

    const enemySprite=h('div',{key:'esp'+(this.state.combatSeq||0),style:{animation:'pmEnemyIn .5s cubic-bezier(.2,.9,.25,1) backwards'}},
      h('div',{style:{position:'relative',textAlign:'center',animation: this.state.defeating?'pmDefeat .7s ease forwards':(this._shake==='enemy'?'pmShake .45s':'pmBob 2.6s ease-in-out infinite')}},
        floats('enemy'),
        h('div',{style:{position:'relative',display:'inline-block'}},
          h('div',{style:{fontSize:isBoss?108:84,lineHeight:1,color:isBoss?clr.red:clr.text,filter:'drop-shadow(0 6px 8px rgba(0,0,0,.6))'+(isBoss?' drop-shadow(0 0 14px rgba(207,80,64,.5))':'')}}, enemy.glyph),
          h('div',{key:'flash'+(this.state.hitFlash||0),style:{position:'absolute',inset:'-8px',borderRadius:'50%',background:'radial-gradient(circle,#fff,rgba(255,255,255,0) 68%)',mixBlendMode:'screen',opacity:0,animation:(this.state.hitFlash>0?'pmFlash .42s ease':'none'),pointerEvents:'none'}})),
        h('div',{style:{width:isBoss?150:120,height:18,margin:'2px auto 0',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(0,0,0,.55),transparent 70%)'}})));

    const heroSprite=h('div',{key:'hsp'+(this.state.combatSeq||0),style:{animation:'pmHeroIn .5s cubic-bezier(.2,.9,.25,1) backwards',animationDelay:'.12s'}},
      h('div',{style:{position:'relative',textAlign:'center',animation:this._shake==='hero'?'pmShake .45s':'none'}},
      floats('hero'),
      h('div',{style:{display:'flex',justifyContent:'center',alignItems:'flex-end',width:130,height:128}}, this.pixelSprite(this.state.char, 8)),
      h('div',{style:{width:120,height:18,margin:'0 auto',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(0,0,0,.55),transparent 70%)'}})));

    const heroBox=(w)=>h('div',{style:{width:w}},
      h('div',{style:{background:'#0e0b09',border:'2px solid '+clr.gold,borderRadius:6,padding:'10px 14px',boxShadow:'0 4px 0 rgba(0,0,0,.4)'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}},
          h('span',{className:'pm-pixel',style:{fontSize:11,color:clr.gold}}, ch.name),
          h('span',{style:{fontSize:11,color:clr.mut}}, 'VIT '+ch.vitesse+(this.state.spadeRed?' · \u2660-'+this.state.spadeRed:''))),
        h('div',{style:{height:9,background:'#000',borderRadius:5,overflow:'hidden',border:'1px solid '+clr.line}},
          h('div',{style:{height:'100%',width:phpPct+'%',background:phpPct>30?'linear-gradient(90deg,#e9b24b,#c98a2f)':'linear-gradient(90deg,#cf5040,#9a2f22)',transition:'width .5s ease'}})),
        h('div',{style:{textAlign:'right',fontSize:11,color:clr.mut,marginTop:3}}, this.state.php+'/'+this.state.pmax+' PV'),
        this.state.weapon?h('div',{style:{display:'flex',alignItems:'center',gap:5,marginTop:6,paddingTop:6,borderTop:'1px solid '+clr.line}},
          h('span',{style:{fontSize:14,color:clr.gold}}, this.WEAPONS[this.state.weapon].glyph),
          h('span',{style:{fontSize:10,color:clr.mut}}, this.WEAPONS[this.state.weapon].name),
          h('span',{style:{fontSize:10,color:clr.gold2}}, this.WEAPONS[this.state.weapon].desc)):null));
  // heroBox closing

    const hand=this.state.chand; const nC=hand.length;
    const fan=hand.map((card,i)=>{
      const seld=this.state.csel.includes(card.uid); const hov=this.state.hoverCard===card.uid;
      const mid=(nC-1)/2; const rotDeg=(i-mid)*5; const lift=Math.abs(i-mid)*6;
      return h('div',{key:card.uid, onClick:()=>this.toggleCard(card.uid),
        onMouseEnter:()=>this.setState({hoverCard:card.uid}), onMouseLeave:()=>this.setState({hoverCard:null}),
        style:{transform:`rotate(${rotDeg}deg) translateY(${lift - (seld?40:hov?18:0)}px)`,transformOrigin:'bottom center',
          transition:'transform .15s ease',cursor:'pointer',marginLeft:i?-22:0,zIndex:seld?40:hov?30:i, position:'relative'}},
        this.renderCard(card, seld, i));
    });

    const canPlay=combo&&combo.valid;
    const backdrop=h('div',{style:{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(90deg,rgba(255,255,255,.025) 0 1px,transparent 1px 56px),repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 56px)',maskImage:'linear-gradient(180deg,transparent,#000 40%,transparent 70%)'}});
    const glow=h('div',{style:{position:'absolute',top:0,left:0,right:0,height:300,background:'radial-gradient(60% 80% at 78% 30%,rgba(207,80,64,.12),transparent)'}});
    const comboReadout=(w)=>h('div',{style:{width:w||'auto',flexShrink:0,textAlign:w?'left':'center',position:'relative',zIndex:50,background:'rgba(14,11,9,.82)',border:'1px solid '+clr.line,borderRadius:8,padding:'8px 12px'}},
      h('div',{style:{fontSize:11,letterSpacing:'.12em',color:clr.mut,marginBottom:4}}, 'COMBINAISON'),
      h('div',{className:'pm-pixel',style:{fontSize:14,color:canPlay?clr.gold:clr.mut,marginBottom:6,lineHeight:1.3}}, combo?combo.name:'—'),
      canPlay? h('div',{style:{fontSize:13,color:clr.text}}, combo.dmg+' dégâts'+(this.state.csel.length?' · '+this.state.csel.length+'/5':'')) : h('div',{style:{fontSize:12,color:clr.mut}}, 'Sélectionne 1 à 5 cartes'),
      canPlay&&combo.effect? h('div',{style:{fontSize:12,color:clr.gold2,marginTop:3}}, combo.effect):null);
    const fanArea=h('div',{style:{flex:1,display:'flex',justifyContent:'center',alignItems:'flex-end',paddingTop:30,minHeight:120,padding:'30px 10px 0'}}, fan.length?fan:h('span',{style:{color:clr.mut,fontSize:13}},'Deck vide'));
    const deckInfo=h('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:11,color:clr.mut,justifyContent:'center'}}, this.icon('deck',14,clr.mut), 'Deck '+this.state.deck.length+' · Défausse '+this.state.discard.length);
    const playBtn=this.btn('Jouer', ()=>this.play(), {primary:true,wide:true,small:true,disabled:!canPlay||this.state.busy});
    const discBtn=this.btn('Défausser ('+this.state.discardsLeft+')', ()=>this.discardHand(), {wide:true,small:true,disabled:!this.state.csel.length||this.state.busy||this.state.discardsLeft<=0});
    const cheatBtn=this.state.char==='tricheur'? this.btn(
      this.state.cheatArmed?'✦ Triche armée':(this.state.cheatUsed?'Triché — recharge en boutique':'✦ Tricher (-1 carte)'),
      ()=>{ if(!this.state.cheatUsed&&!this.state.busy){ this.sfx('valid'); this.setState({cheatArmed:true,cheatUsed:true,log:'Triche armée : la prochaine main compte 1 carte de moins.'}); } },
      {wide:true,small:true,danger:this.state.cheatArmed,disabled:this.state.cheatUsed||this.state.busy}):null;
    const logToast=h('div',{style:{position:'absolute',top:14,left:'50%',transform:'translateX(-50%)',background:'rgba(14,11,9,.85)',border:'1px solid '+clr.line,borderRadius:20,padding:'6px 18px',fontSize:12,color:clr.text,maxWidth:port?420:480,textAlign:'center',zIndex:6}}, this.state.log);

    if(port){
      return h('div',{style:{animation:'pmFade .4s ease',width:464,height:884,position:'relative',
        background:'linear-gradient(180deg,#2a2520 0%,#1c1814 52%,#15110e 100%)',borderRadius:10,
        border:'1px solid '+clr.line,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.6)'}},
        backdrop, glow, logToast,
        h('div',{style:{position:'absolute',top:0,left:0,right:0,bottom:272,display:'flex',flexDirection:'column',alignItems:'center',padding:'54px 18px 0',gap:4}},
          enemyBox(384),
          h('div',{style:{transform:'scale(.9)'}}, enemySprite),
          jokerBarInner? h('div',{style:{display:'flex',justifyContent:'center',margin:'2px 0'}}, jokerBarInner):null,
          h('div',{style:{transform:'scale(.9)'}}, heroSprite),
          heroBox(360)),
        h('div',{style:{position:'absolute',left:0,right:0,bottom:0,height:272,background:'linear-gradient(180deg,rgba(14,11,9,.4),#0e0b09 38%)',borderTop:'2px solid '+clr.line,display:'flex',flexDirection:'column',padding:'12px 14px 14px'}},
          comboReadout(null),
          fanArea,
          h('div',{style:{display:'flex',gap:8,alignItems:'stretch',marginTop:6,position:'relative',zIndex:50}},
            h('div',{style:{flex:1}}, playBtn),
            h('div',{style:{flex:1}}, discBtn)),
          cheatBtn? h('div',{style:{marginTop:6,position:'relative',zIndex:50}}, cheatBtn):null,
          h('div',{style:{marginTop:8,position:'relative',zIndex:50}}, deckInfo)));
    }

    return h('div',{style:{animation:'pmFade .4s ease',width:920,height:600,position:'relative',
      background:'linear-gradient(180deg,#2a2520 0%,#1c1814 52%,#15110e 100%)',borderRadius:10,
      border:'1px solid '+clr.line,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.6)'}},
      backdrop, glow,
      h('div',{style:{position:'absolute',top:30,right:46}}, enemyBox(300)),
      h('div',{style:{position:'absolute',top:118,right:96}}, enemySprite),
      h('div',{style:{position:'absolute',bottom:150,left:230}}, heroBox(280)),
      h('div',{style:{position:'absolute',bottom:166,left:80}}, heroSprite),
      jokerBarInner? h('div',{style:{position:'absolute',top:14,left:14}}, jokerBarInner):null,
      h('div',{style:{position:'absolute',left:0,right:0,bottom:0,height:142,background:'linear-gradient(180deg,rgba(14,11,9,.4),#0e0b09 40%)',borderTop:'2px solid '+clr.line,display:'flex',alignItems:'center',padding:'0 22px',gap:20}},
        comboReadout(210),
        fanArea,
        h('div',{style:{width:164,flexShrink:0,position:'relative',zIndex:50,display:'flex',flexDirection:'column',gap:8,background:'#0e0b09',border:'1px solid '+clr.line,borderRadius:8,padding:'10px 12px'}}, playBtn, discBtn, cheatBtn, deckInfo)),
      logToast);
  }
  renderCard(card, seld, idx){
    const clr=this.CARD,h=React.createElement;
    const dealAnim = (typeof idx==='number') ? {animation:'pmDealUp .42s cubic-bezier(.2,.8,.2,1) backwards', animationDelay:(idx*0.045)+'s'} : {};
    if(card.joker){
      return h('div',{style:{width:60,height:86,borderRadius:6,background:'linear-gradient(160deg,#2a2438,#171320)',
        border:'2px solid '+(seld?this.C.gold:'#5a4a8a'),display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        boxShadow:seld?'0 0 16px rgba(224,165,59,.6)':'0 4px 8px rgba(0,0,0,.5)',...dealAnim}},
        h('div',{style:{fontSize:30,color:'#caa9ff'}}, '\u2605'),
        h('div',{style:{fontSize:9,letterSpacing:'.1em',color:'#9a86c4',marginTop:4}}, 'JOKER'));
    }
    const red = card.suit==='\u2665'||card.suit==='\u2666';
    const col=red?clr.red:clr.ink; const lab=this.rankLabel(card.rank);
    return h('div',{style:{width:60,height:86,borderRadius:6,background:clr.bg,border:'2px solid '+(seld?this.C.gold:clr.line),
      position:'relative',boxShadow:seld?'0 0 16px rgba(224,165,59,.6)':'0 4px 8px rgba(0,0,0,.5)',...dealAnim}},
      h('div',{style:{position:'absolute',top:4,left:6,fontSize:14,fontWeight:700,color:col,lineHeight:1,textAlign:'center'}}, lab, h('div',{style:{fontSize:11}},card.suit)),
      h('div',{style:{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,color:col}}, card.suit),
      h('div',{style:{position:'absolute',bottom:4,right:6,fontSize:14,fontWeight:700,color:col,lineHeight:1,textAlign:'center',transform:'rotate(180deg)'}}, lab, h('div',{style:{fontSize:11}},card.suit)));
  }

  renderShop(port){
    const clr=this.C,h=React.createElement;
    const shop=this.state.shop||{jokers:[],pieces:[],cards:[],weapons:[],trimCard:null,trimPiece:null,portalReset:null};
    const gold=this.state.gold;
    const tag=(price,sold)=>h('div',{style:{marginBottom:-9,zIndex:2,position:'relative',padding:'3px 9px',borderRadius:5,fontFamily:'Press Start 2P',fontSize:8,letterSpacing:'.02em',
      background:sold?clr.p3:'linear-gradient(180deg,#e9b24b,#c98a2f)',color:sold?clr.mut:'#1a1207',border:'1px solid '+(sold?clr.line:clr.gold2)}}, sold?'VENDU':price+' or');
    const offer=(price,sold,afford,onBuy,inner,capW,caption,di)=>h('div',{style:{width:capW,display:'flex',flexDirection:'column',alignItems:'center',animation:'pmScaleIn .4s cubic-bezier(.2,.8,.2,1) backwards',animationDelay:(0.06*(di||0))+'s'}},
      tag(price,sold),
      h('div',{onClick:(!sold&&afford)?onBuy:null,
        onMouseEnter:evt=>{if(!sold&&afford)evt.currentTarget.style.transform='translateY(-7px)';},
        onMouseLeave:evt=>evt.currentTarget.style.transform='none',
        style:{cursor:(!sold&&afford)?'pointer':'default',opacity:sold?.32:(afford?1:.5),filter:(afford||sold)?'none':'grayscale(.5)',transition:'transform .12s',padding:'10px 0 4px'}}, inner),
      caption||null);
    const jokerCard=(j)=>h('div',{style:{width:78,height:104,borderRadius:8,background:'linear-gradient(165deg,#2a2438,#171320)',border:'2px solid '+j.color,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 5px 12px rgba(0,0,0,.55)'}},
      h('div',{style:{fontSize:32,color:j.color,lineHeight:1}}, j.glyph),
      h('div',{style:{fontSize:8,fontWeight:700,letterSpacing:'.12em',color:clr.mut,marginTop:8}}, 'JOKER'));
    const pieceCard=(shapeKey,rot)=>h('div',{style:{width:78,height:92,borderRadius:8,background:clr.p2,border:'1px solid '+clr.line2,display:'flex',alignItems:'center',justifyContent:'center'}}, this.miniPiece(shapeKey,rot||0,14,clr.gold));
    const rerollCost=this.REROLL_CAT_COST;
    const section=(title,sub,offers,cat)=>h('div',{style:{marginBottom:14}},
      h('div',{style:{display:'flex',alignItems:'baseline',gap:8,marginBottom:7}},
        h('span',{style:{fontSize:11,letterSpacing:'.16em',color:clr.gold,fontWeight:700}}, title),
        h('span',{style:{fontSize:11,color:clr.mut,flex:1}}, sub),
        cat? h('button',{onClick:()=>{ if(gold>=rerollCost) this.rerollCategory(cat); },
          disabled:gold<rerollCost, title:'Relancer cette catégorie',
          style:{fontFamily:'Space Grotesk',fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:4,
            border:'1px solid '+(gold>=rerollCost?clr.line2:clr.line),background:clr.p2,
            color:gold>=rerollCost?clr.gold2:clr.mut,cursor:gold>=rerollCost?'pointer':'not-allowed',
            opacity:gold>=rerollCost?1:.5,whiteSpace:'nowrap'}}, '↻ '+rerollCost):null),
      h('div',{style:{display:'flex',gap:12,alignItems:'flex-start',background:'#0c0a09',border:'1px solid '+clr.line,borderRadius:8,padding:'12px 14px',minHeight:96}}, offers.length?offers:h('span',{style:{fontSize:12,color:clr.mut,alignSelf:'center'}}, '\u2014 \u00e9puis\u00e9')));

    const weaponCard=(w)=>h('div',{style:{width:78,height:92,borderRadius:8,background:'linear-gradient(165deg,#241a10,#140e08)',border:'1.5px solid '+clr.gold2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4}},
      h('div',{style:{fontSize:32,color:clr.gold}},'\u2694'.replace('\u2694',w.glyph||'\u2694')),
      h('div',{style:{fontSize:8,color:clr.mut,letterSpacing:'.1em'}}, 'ARME'));
    const curWep=this.state.weapon?this.WEAPONS[this.state.weapon]:null;
    const weaponOffers=shop.weapons.map((deal,i)=>{ const weapon=this.WEAPONS[deal.key]; const afford=gold>=deal.price;
      return offer(deal.price,deal.sold,afford,()=>this.buyShop('weapons',i), weaponCard(weapon), 100,
        h('div',{style:{textAlign:'center',marginTop:2}},
          h('div',{style:{fontSize:11,fontWeight:700,color:clr.gold}}, weapon.name),
          h('div',{style:{fontSize:10,color:clr.mut,lineHeight:1.3,marginTop:2}}, weapon.desc)), i+6); });
    const jokerOffers=shop.jokers.map((deal,i)=>{ const joker=this.JOKERS[deal.key]; const afford=gold>=deal.price && this.state.jokers.length<5;
      return offer(deal.price,deal.sold,afford,()=>this.buyShop('jokers',i), jokerCard(joker), 122,
        h('div',{style:{textAlign:'center',marginTop:2}},
          h('div',{style:{fontSize:11,fontWeight:700,color:joker.color}}, joker.name),
          h('div',{style:{fontSize:10,color:clr.mut,lineHeight:1.3,marginTop:2}}, joker.desc)), i); });
    const pieceOffers=shop.pieces.map((deal,i)=>{ const afford=gold>=deal.price && this.state.hand.length<this.HAND_MAX;
      return offer(deal.price,deal.sold,afford,()=>this.buyShop('pieces',i), pieceCard(deal.shape,deal.rot), 86, null, i+2); });
    const cardOffers=shop.cards.map((deal,i)=>{ const afford=gold>=deal.price;
      return offer(deal.price,deal.sold,afford,()=>this.buyShop('cards',i), this.renderCard({rank:deal.rank,suit:deal.suit},false), 72, null, i+4); });
    const trimCardOffer=shop.trimCard ? offer(shop.trimCard.price,shop.trimCard.sold,gold>=shop.trimCard.price,()=>this.buyShop('trimCard'),
      h('div',{style:{width:60,height:86,borderRadius:6,background:'#1a0f0c',border:'2px dashed '+clr.red,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:clr.red}},'✂'),
      72, h('div',{style:{fontSize:10,color:clr.mut,marginTop:2,textAlign:'center'}}, 'Supprimer une carte du deck'), 7) : null;
    const trimPieceOffer=shop.trimPiece ? offer(shop.trimPiece.price,shop.trimPiece.sold,gold>=shop.trimPiece.price,()=>this.buyShop('trimPiece'),
      h('div',{style:{width:60,height:60,borderRadius:6,background:'#0e1a0e',border:'2px dashed '+clr.green,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:clr.green}},'✂'),
      72, h('div',{style:{fontSize:10,color:clr.mut,marginTop:2,textAlign:'center'}}, 'Supprimer une pièce de main'), 8) : null;

    const ownedJk=h('div',{style:{display:'flex',gap:6,alignItems:'center'}},
      h('span',{style:{fontSize:11,color:clr.mut,marginRight:2}}, 'Jokers '+this.state.jokers.length+'/5'),
      this.state.jokers.length? this.state.jokers.map((key,i)=>{ const joker=this.JOKERS[key];
        return h('div',{key:i,title:joker.name+' \u2014 '+joker.desc,style:{width:28,height:28,borderRadius:6,background:'#171320',border:'1px solid '+joker.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:joker.color}}, joker.glyph); })
        : h('span',{style:{fontSize:11,color:clr.line2}}, 'aucun'));

    return h('div',{style:{animation:'pmFade .4s ease',width:port?452:860,padding:port?16:24,background:clr.p1,border:'1px solid '+clr.line,borderRadius:10}},
      (this.state.newUnlock&&this.state.newUnlock.length)? h('div',{style:{background:'rgba(134,180,106,.14)',border:'1px solid '+clr.green,borderRadius:6,padding:'10px 14px',marginBottom:14,color:clr.green,fontSize:13,fontWeight:600,textAlign:'center'}}, '★ Nouveau perso débloqué : '+this.state.newUnlock.map(k=>this.CHARS[k].name).join(', ')+' ! Choisis-le au prochain run.') : null,
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}},
        h('div',null,
          h('div',{className:'pm-pixel',style:{fontSize:20,color:clr.gold,textShadow:'0 3px 0 #6e4a1a'}}, 'BOUTIQUE'),
          h('div',{style:{fontSize:12,color:clr.mut,marginTop:6}}, 'Achète directement \u2014 tu vois ce que tu prends.')),
        h('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}},
          this.statChip('coin', gold+' or', clr.gold), ownedJk)),
      h('div',{style:{display:'flex',flexDirection:port?'column':'row',gap:port?12:16,alignItems:'stretch'}},
        h('div',{style:{width:port?'100%':128,flexShrink:0,display:'flex',flexDirection:port?'row':'column',gap:8,flexWrap:'wrap',alignItems:port?'center':'stretch'}},
          h('div',{style:{flex:port?'1':'none',minWidth:port?120:'auto'}}, this.btn('\u00c9tage suivant \u2192', ()=>this.leaveShop(), {primary:true,wide:true,small:true})),
          h('div',{style:{flex:port?'1':'none',minWidth:port?120:'auto'}}, this.btn('Reroll \u00b7 5 or', ()=>this.rerollShop(), {wide:true,small:true,disabled:gold<5})),
          h('div',{style:{fontSize:11,color:clr.mut,lineHeight:1.5,marginTop:port?0:6,flexBasis:port?'100%':'auto'}}, 'L\u2019or ne se conserve pas entre les runs. Les jokers sont passifs : ils restent actifs en combat.')),
        h('div',{style:{flex:1}},
          section('JOKERS', 'passifs \u2014 amplifient tes pouvoirs', jokerOffers, 'jokers'),
          section('PI\u00c8CES', ({tetro:'t\u00e9trominos (4 cases)',pento:'pentominos (5 cases)',mini:'petites pi\u00e8ces'}[(this.CHARS[this.state.char]||{}).shapes||'tetro'])+' pour ta main', pieceOffers, 'pieces'),
          section('CARTES', 'ajout\u00e9es \u00e0 ton deck de combat', cardOffers, 'cards'),
          section('ARMES', curWep?'\u00e9quip\u00e9e : '+curWep.name:'aucune \u00e9quip\u00e9e', weaponOffers, 'weapons'),
          (()=>{
            const portalResetOffer=shop.portalReset?offer(shop.portalReset.price,shop.portalReset.sold,gold>=shop.portalReset.price,()=>this.buyShop('portalReset'),
              h('div',{style:{width:60,height:60,borderRadius:6,background:'rgba(111,155,202,.1)',border:'2px dashed '+clr.blue,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,color:clr.blue}},'\u29bf'),
              72, h('div',{style:{fontSize:10,color:clr.mut,marginTop:2,textAlign:'center'}}, 'Recharger le portail'), 9):null;
            const cheatResetOffer=shop.cheatReset?offer(shop.cheatReset.price,shop.cheatReset.sold,gold>=shop.cheatReset.price,()=>this.buyShop('cheatReset'),
              h('div',{style:{width:60,height:60,borderRadius:6,background:'rgba(176,111,202,.12)',border:'2px dashed #b06fca',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,color:'#b06fca'}},'\u2726'),
              72, h('div',{style:{fontSize:10,color:clr.mut,marginTop:2,textAlign:'center'}}, 'Recharger la triche'), 9):null;
            const elaguerOffers=[trimCardOffer,trimPieceOffer,portalResetOffer,cheatResetOffer].filter(Boolean);
            return elaguerOffers.length>0?section('\u00c9LAGUER', 'all\u00e8ge tes decks', elaguerOffers):null;
          })()
        )
      )
    )
  }

  renderResult(){
    const clr=this.C,h=React.createElement;
    return h('div',{style:{animation:'pmFade .5s ease',textAlign:'center',width:520,padding:'40px 36px',background:'linear-gradient(180deg,#211712,#140d0b)',border:'1px solid '+clr.line,borderRadius:12}},
      h('div',{className:'pm-pixel',style:{fontSize:30,color:clr.red,textShadow:'0 4px 0 #2a0f0c',marginBottom:10,animation:'pmSlamIn .55s cubic-bezier(.3,1.4,.5,1) backwards'}}, 'GAME OVER'),
      h('p',{style:{color:clr.mut,fontSize:14,marginBottom:28}}, 'Le donjon t\u2019a eu. Une seule vie — tout recommence.'),
      h('div',{style:{display:'flex',justifyContent:'center',gap:40,marginBottom:28}},
        h('div',null, h('div',{className:'pm-pixel',style:{fontSize:38,color:clr.gold,animation:'pmPop .5s ease backwards',animationDelay:'.3s'}}, this.state.bossesBeaten),
          h('div',{style:{fontSize:11,letterSpacing:'.14em',color:clr.mut,marginTop:8}}, 'BOSS VAINCUS')),
        h('div',null, h('div',{className:'pm-pixel',style:{fontSize:38,color:clr.text,animation:'pmPop .5s ease backwards',animationDelay:'.42s'}}, this.state.best),
          h('div',{style:{fontSize:11,letterSpacing:'.14em',color:clr.mut,marginTop:8}}, 'MEILLEUR SCORE')),
        h('div',null,
          h('div',{className:'pm-pixel',style:{fontSize:38,color:clr.blue,animation:'pmPop .5s ease backwards',animationDelay:'.54s'}}, this.state.floor),
          h('div',{style:{fontSize:11,letterSpacing:'.14em',color:clr.mut,marginTop:8}}, 'ÉTAGE ATTEINT'))),
      h('div',{style:{fontSize:12,color:clr.mut,marginBottom:16}},
        'Joué avec : '+( this.state.char ? this.CHARS[this.state.char].name : '—')),
      (this.state.newUnlock&&this.state.newUnlock.length)? h('div',{style:{background:'rgba(134,180,106,.12)',border:'1px solid '+clr.green,borderRadius:6,padding:'12px 16px',marginBottom:22,color:clr.green,fontSize:13,fontWeight:600}}, '\u2605 Nouveau perso d\u00e9bloqu\u00e9 : '+this.state.newUnlock.map(k=>this.CHARS[k].name).join(', ')+' !') : null,
      this.btn('Nouveau run \u2192', ()=>this.setState({screen:'select'}), {primary:true,wide:true})
    );
  }

  renderDragOverlay(){
    const s=this.state; const h=React.createElement;
    if(s.screen!=='plan'||!s.dragging||!s.dragXY||s.selPiece===null||!s.grid) return null;
    const piece=s.hand[s.selPiece]; if(!piece) return null;
    const n=s.grid.n; const cell=Math.min(Math.floor(440/n),52);
    const vw=s.vw||1280, vh=s.vh||800; const port=vh>vw;
    const scale=port? this.fitScale(528,1040) : this.fitScale(1092,690);
    const u=Math.max(8, Math.round(cell*scale)-2);
    return h('div',{style:{position:'fixed',left:s.dragXY.x,top:s.dragXY.y,transform:'translate(-50%,-150%)',pointerEvents:'none',zIndex:400,opacity:.92,filter:'drop-shadow(0 8px 12px rgba(0,0,0,.6))'}},
      this.miniPiece(piece.key, piece.rot||0, u, this.C.gold2));
  }
  miniCells(cells,u,color,gap){ const h=React.createElement;
    const set=new Set(cells.map(c=>c.join(','))); const rows=Math.max(...cells.map(c=>c[0]))+1, cols=Math.max(...cells.map(c=>c[1]))+1; const out=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ out.push(h('div',{key:r+','+c,style:{width:u,height:u,borderRadius:2,
      background:set.has(r+','+c)?color:'#1a1614',border:'1px solid '+(set.has(r+','+c)?color:this.C.line)}})); }
    return h('div',{style:{display:'grid',gridTemplateColumns:`repeat(${cols},${u+2}px)`,gap:gap||3}}, out); }
  renderMute(){ const clr=this.C,h=React.createElement;
    return h('button',{onClick:()=>this.toggleMute(), title:this.state.muted?'Activer le son':'Couper le son',
      style:{position:'fixed',top:10,right:10,zIndex:500,width:38,height:38,borderRadius:8,cursor:'pointer',
        background:'rgba(14,11,9,.8)',border:'1px solid '+clr.line2,color:this.state.muted?clr.mut:clr.gold,fontSize:17,display:'flex',alignItems:'center',justifyContent:'center'}},
      this.state.muted?'\u{1F507}':'\u{1F50A}'); }
  renderTuto(){ const clr=this.C,h=React.createElement;
    if(!this.state.showTuto || this.state.screen!=='plan') return null;
    const step=(ic,title,body)=>h('div',{style:{display:'flex',gap:12,alignItems:'flex-start',textAlign:'left',marginBottom:14}},
      h('div',{style:{flexShrink:0,width:34,height:34,borderRadius:8,background:'#0e0b09',border:'1px solid '+clr.line2,display:'flex',alignItems:'center',justifyContent:'center',color:clr.gold}}, ic),
      h('div',null, h('div',{style:{fontSize:13,fontWeight:700,color:clr.text,marginBottom:3}}, title),
        h('div',{style:{fontSize:12,color:clr.mut,lineHeight:1.5}}, body)));
    const ok=h('div',{style:{display:'flex',alignItems:'center',gap:8}}, this.miniCells([[0,0],[0,1]],14,clr.green), h('span',{style:{color:clr.green,fontSize:13,fontWeight:700}}, '✓ reliées (côté)'));
    const no=h('div',{style:{display:'flex',alignItems:'center',gap:8}}, this.miniCells([[0,0],[1,1]],14,clr.red), h('span',{style:{color:clr.red,fontSize:13,fontWeight:700}}, '✗ non reliées (coin)'));
    return h('div',{style:{position:'fixed',inset:0,zIndex:450,background:'rgba(5,4,3,.78)',display:'flex',alignItems:'center',justifyContent:'center',padding:16},onClick:()=>this.closeTuto()},
      h('div',{onClick:(evt)=>evt.stopPropagation(),style:{width:'100%',maxWidth:420,background:'linear-gradient(180deg,#1d1713,#120c0a)',border:'1px solid '+clr.line,borderRadius:12,padding:'26px 24px',boxShadow:'0 30px 80px rgba(0,0,0,.6)',animation:'pmFade .3s ease'}},
        h('div',{className:'pm-pixel',style:{fontSize:14,color:clr.gold,textAlign:'center',marginBottom:18}}, 'COMMENT JOUER'),
        step(this.icon('flag',18,clr.gold),'Trace ton chemin','Relie le Départ à la Clé puis à la Porte en posant tes pièces sur la grille.'),
        step(this.icon('rotate',18,clr.gold),'Pose une pièce','Touche une pièce, vise une case, clique pour la poser. Molette / clic droit / R pour pivoter.'),
        step('⚠','Relie par les côtés','Les pièces ne se connectent que si elles se touchent par un côté — jamais par un coin.'),
        h('div',{style:{display:'flex',justifyContent:'center',gap:22,margin:'6px 0 20px',padding:'12px',background:'#0c0a09',borderRadius:8,border:'1px solid '+clr.line}}, ok, no),
        this.btn('Compris, jouer →', ()=>this.closeTuto(), {primary:true,wide:true})));
  }
  renderVals(){
    const s=this.state;
    const port = (s.vh||800) > (s.vw||1280);
    return {
      isIntro:s.screen==='intro', isHome:s.screen==='home', isAuth:s.screen==='auth',
      isSelect:s.screen==='select', isPlan:s.screen==='plan', isCombat:s.screen==='combat',
      isShop:s.screen==='shop', isResult:s.screen==='result',
      introEl:s.screen==='intro'?this.renderIntro():null,
      homeEl:s.screen==='home'?this.scaleWrap(this.renderHome(port), port?360:880, port?900:660):null,
      authEl:s.screen==='auth'?this.scaleWrap(this.renderAuth(port), port?340:420, port?620:560):null,
      selectEl:s.screen==='select'?this.scaleWrap(this.renderSelect(port), port?360:820, port?1400:700):null,
      planEl:s.screen==='plan'?this.scaleWrap(this.renderPlan(port), port?528:1092, port?1040:690, 48):null,
      combatEl:s.screen==='combat'?this.scaleWrap(this.renderCombat(port), port?464:920, port?884:600, 48):null,
      shopEl:s.screen==='shop'?this.scaleWrap(this.renderShop(port), port?452:884, port?1190:1120, 48):null,
      resultEl:s.screen==='result'?this.scaleWrap(this.renderResult(),520,470):null,
      hudEl:(s.screen==='plan'||s.screen==='combat'||s.screen==='shop')?this.renderHud():null,
      dragOverlay:this.renderDragOverlay(),
      tutoOverlay:this.renderTuto(),
      muteBtn:this.renderMute()
    };
  }
}
