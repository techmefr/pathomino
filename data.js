// Données / config du jeu (séparées pour alléger pathomino.js et faciliter l'équilibrage).
// Chargé AVANT pathomino.js ; expose window.PM. Compatible file:// (pas de module ES).
window.PM = {
  C: {ink:'#0e0c0b',p1:'#1b1715',p2:'#241f1b',p3:'#2f2823',line:'#3a342e',line2:'#4c443b',text:'#ece4d6',mut:'#8d8377',gold:'#e0a53b',gold2:'#f3c976',red:'#cf5040',green:'#86b46a',blue:'#6f9bca'},
  CARD: {bg:'#f3ecdd',line:'#d6cab2',red:'#b5402f',ink:'#26201b'},
  SHAPES: {
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
  },
  SHAPE_SETS: {
    tetro:['I','O','T','S','Z','L','J'],
    pento:['I5','L5','P5','T5','V5','U5','Z5'],
    mini:['D2','I3','L3','O','T']
  },
  CHARS: {
    chevalier:{name:'Chevalier',icon:'sword',vie:120,force:15,defense:10,magie:4,vitesse:6,pieces:5,draws:3,discards:3,cards:8,shapes:'tetro',tag:'DÉPART',desc:'Solide, prévisible, tanky. Tétrominos classiques.',color:'#c98a3a'},
    mage:{name:'Mage',icon:'wand',vie:78,force:5,defense:5,magie:17,vitesse:9,pieces:6,draws:3,discards:3,cards:9,shapes:'tetro',power:'portal',tag:'1 BOSS',desc:'Fragile mais dévastateur. Grande main de cartes. Un portail par étage.',color:'#6f9bca'},
    voleur:{name:'Voleur',icon:'dagger',vie:90,force:11,defense:7,magie:9,vitesse:15,pieces:7,draws:4,discards:4,cards:8,shapes:'pento',tag:'3 BOSS',desc:'Agile, esquive souvent. Pentominos (5 cases), beaucoup de pioches et défausses.',color:'#86b46a'},
    paladin:{name:'Paladin',icon:'sword',vie:110,force:13,defense:11,magie:4,vitesse:6,pieces:5,draws:3,discards:2,cards:8,shapes:'tetro',heal:15,tag:'5 BOSS',desc:'Comme le Chevalier, mais regagne 15 PV à chaque combat gagné. Peu de défausses.',color:'#d9c27a'},
    tricheur:{name:'Tricheur',icon:'dagger',vie:85,force:9,defense:6,magie:9,vitesse:10,pieces:6,draws:3,discards:5,cards:9,shapes:'mini',power:'cheat',tag:'7 BOSS',desc:'Petites pièces, beaucoup de défausses. Pouvoir : la prochaine main compte 1 carte de moins (suite dès 4, paire dès 1).',color:'#b06fca'}
  },
  CHAR_ORDER: ['chevalier','mage','voleur','paladin','tricheur'],
  UNLOCKS: { mage:1, voleur:3, paladin:5, tricheur:7 },
  PIECE_WEIGHTS: {I:3,O:3,L:3,J:2,T:2,S:1,Z:1},
  SPRITES: {
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
  },
  BOSSES: [
    {key:'cavalier',glyph:'\u265E',name:'Cavalier',hpMul:1.0,atkMul:1.15,vit:11,trait:'Rapide, difficile à toucher'},
    {key:'fou',glyph:'\u265D',name:'Fou',hpMul:1.1,atkMul:1.3,vit:7,trait:'Attaque magique perçante'},
    {key:'tour',glyph:'\u265C',name:'Tour',hpMul:1.7,atkMul:0.9,vit:4,trait:'PV énormes, très défensif'},
    {key:'dame',glyph:'\u265B',name:'Dame',hpMul:1.4,atkMul:1.45,vit:9,trait:'Redoutable sur tout'},
    {key:'roi',glyph:'\u265A',name:'Roi',hpMul:2.0,atkMul:1.6,vit:7,trait:'Ultime épreuve du donjon'}
  ],
  SUITS: ['♥','♦','♣','♠'],
  JOKERS: {
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
  },
  WEAPONS: {
    epee: {name:'\u00c9p\u00e9e',   glyph:'\u2694', price:10, desc:'+8 d\u00e9g\u00e2ts plats',            mod:()=>({dmgFlat:8})},
    hache:{name:'Hache',   glyph:'\u2692', price:14, desc:'+18% de tous les d\u00e9g\u00e2ts',     mod:()=>({dmgMult:1.18})},
    dague:{name:'Dague',   glyph:'\u2020', price:12, desc:'+4 d\u00e9g\u00e2ts \u00b7 esquive +8%', mod:()=>({dmgFlat:4, dodgeBonus:0.08})},
    baton:{name:'B\u00e2ton',   glyph:'\u2736', price:13, desc:'Brelan+ : +25% d\u00e9g\u00e2ts',        mod:()=>({strongMult:1.25})},
  },
  SVG: {
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
  },
};
