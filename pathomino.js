class Pathomino extends React.Component {
  render(){
    const h = React.createElement;
    const v = this.renderVals();
    return h('div', {id:'pm-root'},
      v.homeEl, v.authEl, v.selectEl, v.planEl,
      v.combatEl, v.shopEl, v.resultEl, v.dragOverlay, v.tutoOverlay, v.muteBtn);
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
    J:[[0,1],[1,1],[2,1],[2,0]]
  };
  CHARS = {
    chevalier:{name:'Chevalier',icon:'sword',vie:120,force:15,defense:10,magie:4,vitesse:6,pieces:5,tag:'STARTER',desc:'Solide, prévisible, tanky. Encaisse et frappe fort au corps à corps.',color:'#c98a3a'},
    mage:{name:'Mage',icon:'wand',vie:78,force:5,defense:5,magie:17,vitesse:9,pieces:6,tag:'STARTER',desc:'Fragile mais dévastateur. La magie transforme chaque combo en explosion.',color:'#6f9bca'},
    voleur:{name:'Voleur',icon:'dagger',vie:90,force:11,defense:7,magie:9,vitesse:15,pieces:7,tag:'VERROUILLÉ',desc:'Agile, esquive souvent, joue des pentaminos. Débloqué en battant le Roi.',color:'#86b46a'}
  };
  PIECE_WEIGHTS = {I:3,O:3,L:3,J:2,T:2,S:1,Z:1};
  HAND_MAX = 10;
  FLOOR_REFILL = 2;
  DRAWS_PER_FLOOR = 3;
  DISCARDS_PER_COMBAT = 3;
  MAX_SCALE = 2;
  SPRITES = {
    chevalier:{ pal:{K:'#14100c',M:'#8b919b',L:'#d2d8e0',D:'#5a5f68',V:'#2f333a',E:'#bfe9ff',A:'#e0a53b',C:'#f3c976'},
      rows:['..A.......A..','..AK.....KA..','...KKKKKKK...','..KLLLLLLLK..','..KLMMMMMLK..','..KMVVVVVMK..','..KMEKKKEMK..','..KMMMMMMMK..','.KKMMMMMMMKK.','KAAMMMCMMMAAK','KAAMMMCMMMAAK','.KMMMCCCMMMK.','..KMMMMMMMK..','..KMMK.KMMK..','..KK.....KK..'] },
    mage:{ pal:{K:'#14100c',M:'#3f5d86',L:'#6f9bca',S:'#e8c39a',E:'#bfe9ff',A:'#e0a53b',O:'#7fd7ff',W:'#6b4a2a',H:'#f3c976'},
      rows:['.....KK......','....KHHK.....','...KMHHMK.OO.','...KMMMMK.OO.','..KMMMMMK..W.','..KMMMMMK..W.','...KKSSKK..W.','..KSEKEK...W.','..KSSSSK..WW.','.KMMMMMMK.W..','.KMMLLLMMKW..','KMMLLLLLMMK..','KMMMMMMMMMK..','.KMMMK.KMMK..','..KK.....KK..'] },
    voleur:{ pal:{K:'#14100c',M:'#3c5a3a',L:'#6fae5e',D:'#26371f',S:'#caa37a',E:'#d6ff7a',A:'#86b46a',B:'#c9c2b4',H:'#6b4a2a'},
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
  JOKERS = {
    lame:{name:'Lame Affûtée',glyph:'⚔',color:'#c98a3a',price:6,desc:'+30% de dégâts sur toutes les mains',mod:(m,t)=>{m.dmgMult*=1.3;}},
    trefle:{name:'Trèfle Vorace',glyph:'♣',color:'#86b46a',price:7,desc:'♣ triple les dégâts (au lieu de ×2)',mod:(m,t)=>{m.clubX=3;}},
    coeur:{name:'Cœur Sacré',glyph:'♥',color:'#cf5040',price:6,desc:'♥ soigne deux fois plus',mod:(m,t)=>{m.healFactor=1.0;}},
    carreau:{name:'Diamant Fou',glyph:'♦',color:'#6f9bca',price:5,desc:'♦ pioche 2 cartes de plus',mod:(m,t)=>{m.drawBonus+=2;}},
    pique:{name:'Pique Cruel',glyph:'♠',color:'#b9a7d6',price:5,desc:'♠ réduit l\'attaque de 3 de plus',mod:(m,t)=>{m.spadeBonus+=3;}},
    royal:{name:'Sang Royal',glyph:'♛',color:'#e0a53b',price:8,desc:'Suite, couleur, full+ : +60% dégâts',mod:(m,t)=>{ if(['suite','couleur','full','carre','quinteflush'].includes(t)) m.dmgMult*=1.6; }}
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
    screen:'home', char:null, account:null, authName:'', authPass:'', authMode:'create', authErr:'',
    floor:1, bossIndex:0, bossesBeaten:0, gridN:8, gold:0,
    php:100, pmax:100,
    grid:null, hand:[], placed:[], selPiece:null, rot:0, ghost:null, executing:false, dragging:false, dragXY:null,
    enemy:null, deck:[], discard:[], chand:[], csel:[], spadeRed:0, log:'', hoverCard:null, busy:false, floats:[],
    voleurUnlocked:false, best:0, lastBoss:'', combatPhase:'', newUnlock:false, jokers:[], shop:null, justPlaced:[], defeating:false, hitFlash:0, combatSeq:0,
    showTuto:false, muted:false, drawsLeft:3, discardsLeft:3, enemyTurns:0
  };

  loadAccount(){ try{ const a=localStorage.getItem('pm_account'); return a?JSON.parse(a):null; }catch(e){ return null; } }
  saveAccount(a){ try{ localStorage.setItem('pm_account', JSON.stringify(a)); }catch(e){} }
  submitAuth(){
    const name=(this.state.authName||'').trim();
    if(name.length<3){ this.setState({authErr:'Pseudo : 3 caractères minimum.'}); return; }
    if((this.state.authPass||'').length<4){ this.setState({authErr:'Mot de passe : 4 caractères minimum.'}); return; }
    const acc={name, since:Date.now()};
    this.saveAccount(acc);
    this.setState({account:acc, authErr:'', authPass:'', screen:'select'});
  }
  playAsGuest(){ this.setState({account:{name:'Invité', guest:true}, screen:'select'}); }
  logout(){ try{ localStorage.removeItem('pm_account'); }catch(e){} this.setState({account:null, screen:'home', authName:'', authPass:'', authErr:''}); }

  sfx(name){ if(this.state.muted) return;
    try{
      if(!this._ac){ const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return; this._ac=new AC(); }
      const ac=this._ac; if(ac.state==='suspended') ac.resume(); const now=ac.currentTime;
      const tone=(freq,dur,type,vol,delay)=>{ const o=ac.createOscillator(),g=ac.createGain();
        o.type=type||'square'; o.frequency.value=freq; o.connect(g); g.connect(ac.destination);
        const t=now+(delay||0); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||0.16,t+0.012);
        g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.start(t); o.stop(t+dur+0.03); };
      const S={
        select:()=>tone(440,0.04,'square',0.09),
        place:()=>{tone(300,0.07,'square',0.14);tone(450,0.06,'square',0.10,0.03);},
        rotate:()=>tone(560,0.05,'square',0.10),
        bad:()=>tone(150,0.14,'sawtooth',0.15),
        valid:()=>{tone(523,0.09,'triangle',0.15);tone(784,0.13,'triangle',0.15,0.09);},
        hit:()=>{tone(220,0.09,'square',0.17);tone(110,0.13,'sawtooth',0.13,0.02);},
        heal:()=>{tone(660,0.1,'triangle',0.14);tone(880,0.12,'triangle',0.12,0.08);},
        hurt:()=>tone(190,0.15,'sawtooth',0.17),
        coin:()=>{tone(988,0.06,'square',0.12);tone(1319,0.09,'square',0.11,0.05);},
        buy:()=>{tone(700,0.07,'square',0.12);tone(1047,0.1,'square',0.11,0.06);},
        win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,0.12,'triangle',0.15,i*0.08)),
        over:()=>[440,330,247,165].forEach((f,i)=>tone(f,0.2,'sawtooth',0.15,i*0.15))
      };
      (S[name]||S.select)();
    }catch(e){}
  }
  toggleMute(){ const m=!this.state.muted; try{ localStorage.setItem('pm_muted', m?'1':'0'); }catch(e){} this.setState({muted:m}); if(!m) this.sfx('select'); }
  openTuto(){ this.setState({showTuto:true}); }
  closeTuto(){ try{ localStorage.setItem('pm_tuto','1'); }catch(e){} this.setState({showTuto:false}); }

  componentDidMount(){
    try{
      this.setState({voleurUnlocked: localStorage.getItem('pm_voleur')==='1', best: parseInt(localStorage.getItem('pm_best')||'0',10), account:this.loadAccount(), muted: localStorage.getItem('pm_muted')==='1'});
    }catch(e){}
    this._resize = ()=>this.setState({vw:window.innerWidth, vh:window.innerHeight});
    this._resize();
    this._key = (e)=>{
      if(this.state.screen!=='plan' || this.state.executing) return;
      if(e.key==='r'||e.key==='R'){ this.setState(s=>({rot:(s.rot+1)%4})); }
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
  fitScale(baseW, baseH){
    const vw=this.state.vw||(typeof window!=='undefined'?window.innerWidth:1280);
    const vh=this.state.vh||(typeof window!=='undefined'?window.innerHeight:800);
    return Math.min(this.MAX_SCALE, (vw-14)/baseW, (vh-14)/baseH);
  }
  scaleWrap(el, baseW, baseH){ if(!el) return null; const h=React.createElement;
    const scale=this.fitScale(baseW, baseH);
    return h('div',{style:{width:baseW, transform:`scale(${scale})`, transformOrigin:'center center'}}, el); }
  pixelSprite(key, px){ const h=React.createElement; const sp=this.SPRITES[key]; if(!sp) return null;
    const w=Math.max(...sp.rows.map(r=>r.length)), hgt=sp.rows.length; const cells=[];
    sp.rows.forEach((row,r)=>{ for(let c=0;c<row.length;c++){ const col=sp.pal[row[c]];
      if(col) cells.push(h('div',{key:r+'_'+c,style:{position:'absolute',left:c*px,top:r*px,width:px,height:px,background:col}})); } });
    return h('div',{style:{position:'relative',width:w*px,height:hgt*px,imageRendering:'pixelated',filter:'drop-shadow(0 4px 0 rgba(0,0,0,.4))'}}, cells); }
  startDrag(i,e){ if(e&&e.preventDefault)e.preventDefault();
    const pt = e&&e.touches&&e.touches[0] ? e.touches[0] : e;
    const x = pt&&pt.clientX!=null?pt.clientX:0, y = pt&&pt.clientY!=null?pt.clientY:0;
    this.setState(s=>({selPiece:i, dragging:true, ghost:null, rot:(s.selPiece===i?s.rot:0), dragXY:{x,y}})); }
  clampAnchor(r,c,shape){ const n=this.state.grid.n;
    const maxR=Math.max(...shape.map(s=>s[0])), maxC=Math.max(...shape.map(s=>s[1]));
    return [Math.max(0,Math.min(r,n-1-maxR)), Math.max(0,Math.min(c,n-1-maxC))]; }
  placeAt(r,c){ if(this.state.selPiece===null||this.state.dragging) return;
    const piece=this.state.hand[this.state.selPiece]; if(!piece) return;
    const shape=this.rotated(piece.key, this.state.rot);
    const [ar,ac]=this.clampAnchor(r,c,shape);
    const cells=shape.map(([dr,dc])=>[ar+dr,ac+dc]);
    if(!this.ghostValid(cells)){ this.sfx('bad'); this.setState({ghost:[ar,ac]}); return; }
    const placed=[...this.state.placed, {uid:piece.uid, key:piece.key, cells}];
    const hand=this.state.hand.filter((_,i)=>i!==this.state.selPiece);
    this.setState({placed, hand, selPiece:null, ghost:null, rot:0});
    this.sfx('place'); this.markPlaced(cells); }
  markPlaced(cells){ const keys=cells.map(c=>c.join(',')); this.setState({justPlaced:keys});
    clearTimeout(this._jpT); this._jpT=setTimeout(()=>this.setState({justPlaced:[]}),360); }
  rotate(){ this.sfx('rotate'); this.setState(s=>({rot:(s.rot+1)%4})); }
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
    const hand = Array.from({length:ch.pieces}, ()=>this.drawPiece());
    this.setState({
      char:charKey, screen:'plan', floor:1, bossIndex:0, bossesBeaten:0, gridN:8, gold:0,
      php:ch.vie, pmax:ch.vie, deck, discard:[], chand:[], csel:[], newUnlock:false, jokers:[], shop:null, hand,
      showTuto:(()=>{ try{ return localStorage.getItem('pm_tuto')!=='1'; }catch(e){ return true; } })()
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
    const f=this.state.floor;
    const pawns=[];
    const guardKey = f===1 || this.rnd(0,9)<4;
    if(guardKey) pawns.push([key[0],key[1]]);
    const pc = f===1 ? 0 : Math.min(2+Math.floor(f/2), 5);
    let guard=0;
    while(pawns.length<pc+(guardKey?1:0) && guard++<200){
      const p=[this.rnd(0,n-1),this.rnd(0,n-1)];
      if(taken.has(p.join(','))) continue;
      taken.add(p.join(',')); pawns.push(p);
    }
    let treasure=null, tg=0;
    do{ treasure=[this.rnd(1,n-2),this.rnd(1,n-2)]; }while(taken.has(treasure.join(','))&&tg++<60);
    if(taken.has(treasure.join(','))) treasure=null;
    let hand = [...(this.state.hand||[])];
    if(!firstFloor){
      for(let i=0;i<this.FLOOR_REFILL && hand.length<this.HAND_MAX;i++) hand.push(this.drawPiece());
    }
    this.setState({
      grid:{n,start,key,door,pawns,boss,treasure}, hand, placed:[], selPiece:null, rot:0, ghost:null, executing:false, drawsLeft:this.DRAWS_PER_FLOOR
    });
  }
  drawPiece(){
    const pool=[];
    for(const k in this.SHAPES){ const w=this.PIECE_WEIGHTS[k]||1; for(let i=0;i<w;i++) pool.push(k); }
    return {uid:Math.random().toString(36).slice(2), key:pool[this.rnd(0,pool.length-1)]};
  }
  eq(a,b){ return a[0]===b[0]&&a[1]===b[1]; }

  placedMap(){ const m={}; this.state.placed.forEach(pl=>pl.cells.forEach(c=>{m[c.join(',')]=true;})); return m; }
  ghostCells(){
    if(this.state.selPiece===null || !this.state.ghost) return null;
    const piece = this.state.hand[this.state.selPiece]; if(!piece) return null;
    const shape = this.rotated(piece.key, this.state.rot);
    const [ar,ac]=this.clampAnchor(this.state.ghost[0], this.state.ghost[1], shape);
    return shape.map(([r,c])=>[ar+r, ac+c]);
  }
  ghostValid(cells){
    const n=this.state.grid.n; const m=this.placedMap();
    return cells.every(([r,c])=> r>=0&&c>=0&&r<n&&c<n && !m[r+','+c]);
  }
  hoverCell(r,c){ if(this.state.selPiece!==null) this.setState({ghost:[r,c]}); }
  placePiece(){
    const cells=this.ghostCells(); if(!cells||!this.ghostValid(cells)) return;
    const piece=this.state.hand[this.state.selPiece];
    const placed=[...this.state.placed, {uid:piece.uid, key:piece.key, cells}];
    const hand=this.state.hand.filter((_,i)=>i!==this.state.selPiece);
    this.setState({placed, hand, selPiece:null, ghost:null, rot:0, dragging:false});
    this.sfx('place'); this.markPlaced(cells);
  }
  undo(){ const placed=[...this.state.placed]; const last=placed.pop(); if(!last)return;
    this.setState({placed, hand:[...this.state.hand, {uid:last.uid,key:last.key}]}); }
  pickPiece(){ if(this.state.hand.length>=this.HAND_MAX || this.state.drawsLeft<=0)return; this.sfx('place'); this.setState(s=>({hand:[...s.hand, this.drawPiece()], drawsLeft:s.drawsLeft-1})); }

  pathOk(){
    const g=this.state.grid; if(!g) return {ok:false};
    const m=this.placedMap();
    const inSet=(p)=>m[p.join(',')];
    if(!inSet(g.start)||!inSet(g.key)||!inSet(g.door)) return {ok:false, reason:'Couvre départ, clé et porte'};
    const n=g.n, seen=new Set([g.start.join(',')]); const q=[g.start];
    while(q.length){ const[r,c]=q.shift();
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{ const nr=r+dr,nc=c+dc,k=nr+','+nc;
        if(nr>=0&&nc>=0&&nr<n&&nc<n&&m[k]&&!seen.has(k)){seen.add(k);q.push([nr,nc]);} }); }
    if(!seen.has(g.key.join(','))||!seen.has(g.door.join(','))) return {ok:false, reason:'Le chemin doit relier départ → clé → porte'};
    return {ok:true};
  }

  manhattan(a,b){ return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]); }

  validate(){
    const chk=this.pathOk(); if(!chk.ok) return;
    this.sfx('valid');
    const g=this.state.grid; const m=this.placedMap();
    const covered = g.pawns.filter(p=>m[p.join(',')]).sort((a,b)=>this.manhattan(g.start,a)-this.manhattan(g.start,b));
    this._queue = covered.map((p,i)=>this.makePawn(i));
    if(g.boss) this._queue.push(this.makeBoss());
    this._qi=-1;
    const st={executing:true};
    if(g.treasure && m[g.treasure.join(',')]){
      const bonus=this.rnd(10,18);
      const card={uid:Math.random().toString(36).slice(2), rank:this.rnd(12,14), suit:this.SUITS[this.rnd(0,3)]};
      st.gold=this.state.gold+bonus; st.deck=[...this.state.deck, card];
      st.log=`Trésor ramassé ! +${bonus} or et une carte forte ajoutée au deck.`; this.sfx('coin');
    }
    this.setState(st);
    setTimeout(()=>this.advanceQueue(), 900);
  }

  makePawn(i){ const f=this.state.floor; const hp=Math.round(46+f*8+i*6);
    return {kind:'pion', glyph:'\u265F', name:'Pion', hp, max:hp, atk:Math.round(8+f*1.6), vit:5, suit:this.SUITS[this.rnd(0,3)], gold:this.rnd(5,9)+f}; }
  makeBoss(){ const b=this.BOSSES[Math.min(this.state.bossIndex,4)]; const f=this.state.floor;
    const hp=Math.round((120+f*10)*b.hpMul + this.state.bossIndex*40);
    return {kind:'boss', bkey:b.key, glyph:b.glyph, name:b.name, trait:b.trait, hp, max:hp,
      atk:Math.round((9+f)*b.atkMul), vit:b.vit, suit:this.SUITS[({cavalier:3,fou:1,tour:2,dame:0,roi:3})[b.key]], gold:this.rnd(28,42)+f*2}; }

  advanceQueue(){
    this._qi++;
    if(this._qi < this._queue.length){ this.beginCombat(this._queue[this._qi]); }
    else { this.floorComplete(); }
  }
  beginCombat(enemy){
    let chand=[...this.state.chand];
    if(chand.length<8){ const {deck,discard,hand}=this.refill(this.state.deck,this.state.discard,chand,8); chand=hand;
      this.setState({deck,discard,chand}); }
    this.setState({screen:'combat', enemy:{...enemy}, csel:[], spadeRed:0, log:`Un ${enemy.name} bloque le passage !`, combatPhase:'player', busy:false, floats:[], defeating:false, hitFlash:0, combatSeq:(this.state.combatSeq||0)+1, discardsLeft:this.DISCARDS_PER_COMBAT, enemyTurns:0});
  }

  buildDeck(){ const d=[]; for(const s of this.SUITS){ for(let r=2;r<=14;r++){ d.push({uid:Math.random().toString(36).slice(2), rank:r, suit:s}); } }
    return this.shuffle(d); }
  shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
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
    const isFlush = n>=5 && new Set(suitArr).size===1;
    let isStraight=false;
    if(n>=5 && uniq.length===5){
      if(uniq[4]-uniq[0]===4) isStraight=true;
      if(uniq.join(',')==='2,3,4,5,14') isStraight=true;
    }
    let type,name,mult;
    if(isStraight&&isFlush){ type='quinteflush'; name='Quinte Flush'; mult=7; }
    else if(cv[0]===4){ type='carre'; name='Carré'; mult=5; }
    else if(cv[0]===3&&cv[1]===2){ type='full'; name='Full'; mult=4; }
    else if(isFlush){ type='couleur'; name='Couleur'; mult=3.2; }
    else if(isStraight){ type='suite'; name='Suite'; mult=3; }
    else if(cv[0]===3){ type='brelan'; name='Brelan'; mult=2.5; }
    else if(cv[0]===2&&cv[1]===2){ type='deuxpaires'; name='Deux paires'; mult=2; }
    else if(cv[0]===2){ type='paire'; name='Paire'; mult=1.5; }
    else { type='haute'; name='Carte haute'; mult=1; }
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
    const mods={dmgMult:1, clubX:2, healFactor:0.5, drawBonus:0, spadeBonus:0};
    (this.state.jokers||[]).forEach(k=>{ const j=this.JOKERS[k]; if(j&&j.mod) j.mod(mods,type); });
    dmg = Math.round(dmg*mods.dmgMult);
    const immune=(this.state.enemy&&this.state.enemy.suit)||null;
    const suits=new Set(sel.filter(c=>!c.joker).map(c=>c.suit));
    const H='\u2665',D='\u2666',Cl='\u2663',S='\u2660'; const fx=[];
    if(suits.has(Cl)){ if(immune===Cl){ fx.push('\u2663 annulé'); } else { doubled=true; dmg=Math.round(dmg*mods.clubX); fx.push('\u2663 ×'+mods.clubX); } }
    if(suits.has(H)){ if(immune===H){ fx.push('\u2665 annulé'); } else { heal=Math.round(dmg*mods.healFactor); fx.push('\u2665 +'+heal); } }
    if(suits.has(D)){ if(immune===D){ fx.push('\u2666 annulé'); } else { draw=2+mods.drawBonus; fx.push('\u2666 pioche +'+draw); } }
    if(suits.has(S)){ if(immune===S){ fx.push('\u2660 annulé'); } else { spade=3+mods.spadeBonus; fx.push('\u2660 att. -'+spade); } }
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
    let target=8+(combo.draw||0);
    const rf=this.refill(deck, discard, chand, Math.min(11,target)); deck=rf.deck; discard=rf.discard; chand=rf.hand;
    this.setState({chand, deck, discard, enemy, php, spadeRed, csel:[], hitFlash:(this.state.hitFlash||0)+1, log:`${combo.name} — ${combo.dmg} dégâts${combo.effect? ' · '+combo.effect:''}`});
    if(enemy.hp<=0){ this.shakeEl('enemy'); this.setState({defeating:true}); setTimeout(()=>this.winCombat(), 700); return; }
    this.shakeEl('enemy');
    setTimeout(()=>this.enemyTurn(), 850);
  }
  discardHand(){ if(this.state.busy)return; if(!this.state.csel.length)return; if(this.state.discardsLeft<=0){ this.sfx('bad'); this.setState({log:'Plus de défausses pour ce combat.'}); return; }
    const sel=this.state.csel.map(uid=>this.state.chand.find(c=>c.uid===uid)).filter(Boolean);
    let chand=this.state.chand.filter(c=>!this.state.csel.includes(c.uid));
    let discard=[...this.state.discard,...sel];
    const rf=this.refill(this.state.deck,discard,chand,8);
    this.setState({chand:rf.hand,deck:rf.deck,discard:rf.discard,csel:[],discardsLeft:this.state.discardsLeft-1,log:'Cartes défaussées.'});
    setTimeout(()=>this.enemyTurn(),300);
  }
  enemyTurn(){
    const e=this.state.enemy; if(!e||e.hp<=0){ this.setState({busy:false}); return; }
    const ch=this.CHARS[this.state.char];
    const turns=(this.state.enemyTurns||0)+1;
    const dodgeCh = Math.min(0.45, Math.max(0.04, (ch.vitesse - e.vit)*0.03 + 0.06));
    if(Math.random()<dodgeCh){ this.addFloat('hero','Esquive !', this.C.blue);
      this.setState({busy:false, enemyTurns:turns, log:`${ch.name} esquive l'attaque !`}); return; }
    const esc = Math.max(0, turns-1) * Math.max(2, Math.round(e.atk*0.15));
    const raw = Math.max(1, (e.atk + esc - Math.floor(ch.defense/2) - this.state.spadeRed) + this.rnd(-1,2));
    const php=Math.max(0, this.state.php - raw);
    this.sfx('hurt'); this.addFloat('hero','-'+raw, this.C.red); this.shakeEl('hero');
    this.setState({php, busy:false, enemyTurns:turns, log:`${e.name} riposte — ${raw} dégâts${esc>0?' (enragé +'+esc+')':''}`});
    if(php<=0){ setTimeout(()=>this.death(), 800); }
  }
  winCombat(){
    const e=this.state.enemy; const gold=this.state.gold + e.gold;
    this.sfx(e.kind==='boss'?'win':'coin');
    this.addFloat('enemy','+'+e.gold+' or', this.C.gold);
    let st={gold, log:`${e.name} vaincu ! +${e.gold} or`};
    if(this.rnd(0,99) < (e.kind==='boss'?100:35)){
      const card={uid:Math.random().toString(36).slice(2), rank:this.rnd(10,14), suit:this.SUITS[this.rnd(0,3)]};
      st.deck=[...this.state.deck, card]; st.log+=' · butin : +1 carte au deck';
      this.addFloat('enemy','+carte', this.C.blue);
    }
    this.setState(st);
    setTimeout(()=>{ this.setState({screen:'plan'}); setTimeout(()=>this.advanceQueue(), 450); }, 1000);
  }
  death(){
    this.sfx('over');
    const best=Math.max(this.state.best, this.state.bossesBeaten);
    try{ localStorage.setItem('pm_best', String(best)); }catch(e){}
    this.setState({screen:'result', best, lastBoss:'mort'});
  }
  floorComplete(){
    let st={}; const g=this.state.grid;
    if(g.boss){
      const beaten=this.state.bossesBeaten+1; let bossIndex=this.state.bossIndex; let unlocked=this.state.voleurUnlocked; let newUnlock=false;
      if(this.BOSSES[bossIndex].key==='roi' && !unlocked){ unlocked=true; newUnlock=true; try{localStorage.setItem('pm_voleur','1');}catch(e){} }
      bossIndex=Math.min(bossIndex+1,4);
      st={bossesBeaten:beaten, bossIndex, gridN:Math.min(this.state.gridN+1,11), voleurUnlocked:unlocked, newUnlock,
          best:Math.max(this.state.best,beaten)};
      try{ localStorage.setItem('pm_best', String(Math.max(this.state.best,beaten))); }catch(e){}
    }
    const shop=this.genShop();
    this.setState({...st, screen:'shop', floor:this.state.floor+1, shop});
  }
  genShop(){
    const owned=this.state.jokers||[];
    const jkKeys=Object.keys(this.JOKERS).filter(k=>!owned.includes(k));
    const pick=(arr,n)=>{ const a=[...arr],o=[]; while(o.length<n&&a.length) o.push(a.splice(this.rnd(0,a.length-1),1)[0]); return o; };
    const jokers=pick(jkKeys,Math.min(2,jkKeys.length)).map(k=>({key:k,price:this.JOKERS[k].price,sold:false}));
    const sk=Object.keys(this.SHAPES);
    const pieces=Array.from({length:3},()=>({shape:sk[this.rnd(0,sk.length-1)],price:this.rnd(8,12),sold:false}));
    const cards=Array.from({length:3},()=>({rank:this.rnd(9,14),suit:this.SUITS[this.rnd(0,3)],price:this.rnd(10,16),sold:false}));
    return {jokers,pieces,cards};
  }
  buyShop(cat,i){ const s=this.state; if(!s.shop) return; const o=s.shop[cat][i]; if(!o||o.sold||s.gold<o.price) return;
    if(cat==='jokers'){ if(s.jokers.length>=5) return; this.setState({jokers:[...s.jokers,o.key]}); }
    else if(cat==='pieces'){ if(s.hand.length>=this.HAND_MAX) return; this.setState({hand:[...s.hand,{uid:Math.random().toString(36).slice(2),key:o.shape}]}); }
    else if(cat==='cards'){ this.setState({deck:[...s.deck,{uid:Math.random().toString(36).slice(2),rank:o.rank,suit:o.suit}]}); }
    const shop={jokers:[...s.shop.jokers],pieces:[...s.shop.pieces],cards:[...s.shop.cards]};
    shop[cat]=shop[cat].map((x,j)=>j===i?{...x,sold:true}:x);
    this.sfx('buy'); this.setState({gold:s.gold-o.price, shop});
  }
  rerollShop(){ if(this.state.gold<5) return; this.setState({gold:this.state.gold-5, shop:this.genShop()}); }
  leaveShop(){ this.setState({screen:'plan'}, ()=>this.genFloor()); }

  addFloat(target,text,color){ const id=Math.random().toString(36).slice(2);
    this.setState(s=>({floats:[...s.floats,{id,target,text,color}]}));
    setTimeout(()=>this.setState(s=>({floats:s.floats.filter(f=>f.id!==id)})),1100); }
  shakeEl(t){ this._shake=t; this.setState(s=>({_sk:Math.random()})); setTimeout(()=>{this._shake=null;this.setState(s=>({_sk:Math.random()}));},450); }

  icon(name,size,color){ const C=this.C; return React.createElement('span',{style:{display:'inline-flex',width:size,height:size,color:color||C.text},dangerouslySetInnerHTML:{__html:this.SVG[name]}}); }

  btn(label,onClick,opt={}){ const C=this.C; const {primary,danger,disabled,small,wide}=opt;
    return React.createElement('button',{onClick:disabled?null:onClick,disabled,style:{
      fontFamily:'Space Grotesk',fontWeight:600,fontSize:small?12:14,letterSpacing:'.04em',
      padding:small?'8px 12px':'12px 18px',borderRadius:3,cursor:disabled?'not-allowed':'pointer',
      border:'1px solid '+(primary?C.gold:danger?C.red:C.line2),
      background:disabled?'#1a1614':primary?'linear-gradient(180deg,#e9b24b,#c98a2f)':danger?'rgba(207,80,64,.12)':C.p2,
      color:disabled?C.mut:primary?'#1a1207':danger?C.red:C.text,opacity:disabled?.5:1,
      width:wide?'100%':'auto',transition:'transform .08s,filter .15s',textTransform:'uppercase',
      boxShadow:primary&&!disabled?'0 3px 0 #8a5e1f':'none'
    }, onMouseDown:e=>{if(!disabled)e.currentTarget.style.transform='translateY(2px)';},
       onMouseUp:e=>e.currentTarget.style.transform='none',
       onMouseLeave:e=>e.currentTarget.style.transform='none'}, label); }

  renderHome(port){
    const C=this.C,h=React.createElement; const acc=this.state.account;
    const feats=[
      {ic:'flag',title:'Trace ton chemin',desc:'Pose des tétrominos pour relier la clé à la porte. Chaque étage est un puzzle de placement.',col:C.gold},
      {ic:'deck',title:'Combats de cartes',desc:'Mains de poker à la Balatro, pouvoirs de famille à la Regicide. Deux decks à bâtir.',col:C.blue},
      {ic:'heart',title:'Roguelike, une seule vie',desc:'Boss d\u2019échecs, boutique entre étages, permadeath. Survis le plus longtemps possible.',col:C.red}
    ];
    const glyphs=['\u265F','\u265E','\u265D','\u265C','\u265B','\u265A'];
    const featCards = feats.map((f,i)=> h('div',{key:i,style:{display:'flex',gap:14,alignItems:'flex-start',textAlign:'left',
      background:'linear-gradient(180deg,#1b1613,#141009)',border:'1px solid '+C.line,borderRadius:8,padding:'16px 18px',
      animation:'pmRise .5s cubic-bezier(.2,.8,.2,1) backwards',animationDelay:(0.25+i*0.12)+'s',
      width:port?'100%':246}},
      h('div',{style:{width:38,height:38,flexShrink:0,borderRadius:8,background:'#0e0b09',border:'1px solid '+C.line2,display:'flex',alignItems:'center',justifyContent:'center',color:f.col}}, this.icon(f.ic,20,f.col)),
      h('div',null,
        h('div',{style:{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}, f.title),
        h('div',{style:{fontSize:12,color:C.mut,lineHeight:1.5}}, f.desc))));

    const cta = acc?
      h('div',{style:{display:'flex',flexDirection:'column',gap:10,alignItems:'center'}},
        h('div',{style:{fontSize:14,color:C.mut}}, 'Connecté en tant que ', h('span',{style:{color:C.gold,fontWeight:700}}, acc.name)),
        h('div',{style:{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center'}},
          this.btn('Continuer \u2192', ()=>this.setState({screen:'select'}), {primary:true}),
          this.btn('Se déconnecter', ()=>this.logout(), {small:true})))
      :
      h('div',{style:{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}},
        this.btn('Jouer en invité \u2192', ()=>this.playAsGuest(), {primary:true}),
        h('div',{style:{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center'}},
          this.btn('Créer un compte · bient\u00f4t', null, {disabled:true,small:true}),
          this.btn('Se connecter · bient\u00f4t', null, {disabled:true,small:true})),
        h('div',{style:{fontSize:11,color:C.mut,letterSpacing:'.04em'}}, 'Les comptes arrivent bient\u00f4t \u2014 joue en invité pour tester.'));

    return h('div',{style:{animation:'pmFade .5s ease',textAlign:'center',padding:port?'16px 12px':'28px 24px',maxWidth:port?340:840}},
      h('div',{style:{display:'flex',gap:port?10:16,justifyContent:'center',marginBottom:18,opacity:.5}},
        glyphs.map((g,i)=>h('span',{key:i,style:{fontSize:port?20:26,color:i%2?C.gold:C.mut,animation:'pmBob '+(2+i*0.3)+'s ease-in-out infinite'}},g))),
      h('div',{style:{fontSize:port?10:11,letterSpacing:port?'.3em':'.5em',color:C.gold,marginBottom:12}}, 'PUZZLE \u00B7 ROGUELIKE \u00B7 DONJON'),
      h('h1',{className:'pm-pixel',style:{fontSize:port?34:62,lineHeight:1.05,color:C.text,textShadow:'0 5px 0 #2a211a, 0 0 40px rgba(224,165,59,.3)',marginBottom:14,animation:'pmTitleIn .7s cubic-bezier(.2,.8,.2,1) backwards'}}, 'PATHOMINO'),
      h('p',{style:{color:C.mut,fontSize:port?14:17,maxWidth:560,margin:'0 auto 6px',lineHeight:1.55}}, 'Un puzzle-roguelike de donjon. Tu traces ton chemin avec des pièces géométriques, tu combats avec des cartes, tu survis le plus longtemps possible.'),
      this.state.best>0 ? h('p',{style:{color:C.gold,fontSize:13,margin:'8px auto 0',letterSpacing:'.06em'}}, 'Meilleur score : '+this.state.best+' boss vaincus') : null,
      h('div',{style:{display:'flex',flexDirection:port?'column':'row',gap:14,justifyContent:'center',alignItems:port?'stretch':'flex-start',margin:port?'24px 0':'34px 0'}}, featCards),
      cta
    );
  }

  authInput(value,onCh,ph,type){ const C=this.C,h=React.createElement;
    return h('input',{type:type||'text', value:value||'', placeholder:ph,
      onChange:(e)=>onCh(e.target.value),
      onKeyDown:(e)=>{ if(e.key==='Enter') this.submitAuth(); },
      onFocus:(e)=>e.target.style.borderColor=C.gold,
      onBlur:(e)=>e.target.style.borderColor=C.line2,
      style:{width:'100%',padding:'12px 14px',borderRadius:6,background:'#0e0b09',border:'1px solid '+C.line2,
        color:C.text,fontSize:15,fontFamily:'Space Grotesk',outline:'none',transition:'border-color .15s'}}); }
  renderAuth(port){
    const C=this.C,h=React.createElement; const login=this.state.authMode==='login';
    const field=(label,node)=>h('div',{style:{textAlign:'left',marginBottom:14}},
      h('div',{style:{fontSize:11,letterSpacing:'.12em',color:C.mut,marginBottom:6}}, label), node);
    return h('div',{style:{animation:'pmFade .4s ease',width:port?320:400,padding:port?'24px 20px':'34px 32px',
      background:'linear-gradient(180deg,#1d1713,#120c0a)',border:'1px solid '+C.line,borderRadius:12,boxShadow:'0 30px 80px rgba(0,0,0,.5)'}},
      h('div',{style:{textAlign:'center',marginBottom:6}},
        h('span',{className:'pm-pixel',style:{fontSize:16,color:C.gold,textShadow:'0 3px 0 #6e4a1a'}}, 'PATHOMINO')),
      h('div',{className:'pm-pixel',style:{fontSize:13,color:C.text,textAlign:'center',marginBottom:6,lineHeight:1.5}}, login?'SE CONNECTER':'CRÉER UN COMPTE'),
      h('p',{style:{fontSize:12,color:C.mut,textAlign:'center',marginBottom:22,lineHeight:1.5}}, 'Ton compte garde ton pseudo et tes records sur cet appareil.'),
      field('PSEUDO', this.authInput(this.state.authName,(v)=>this.setState({authName:v,authErr:''}),'Ton nom d\u2019aventurier')),
      field('MOT DE PASSE', this.authInput(this.state.authPass,(v)=>this.setState({authPass:v,authErr:''}),'\u2022\u2022\u2022\u2022','password')),
      this.state.authErr? h('div',{style:{fontSize:12,color:C.red,marginBottom:12,textAlign:'left'}}, this.state.authErr):null,
      this.btn(login?'Se connecter \u2192':'Créer le compte \u2192', ()=>this.submitAuth(), {primary:true,wide:true}),
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16,gap:8}},
        h('button',{onClick:()=>this.setState({authMode:login?'create':'login',authErr:''}),
          style:{background:'none',border:'none',color:C.mut,fontSize:12,cursor:'pointer',fontFamily:'Space Grotesk',textDecoration:'underline',padding:0}},
          login?'Pas de compte ? Créer':'Déjà un compte ? Se connecter'),
        h('button',{onClick:()=>this.playAsGuest(),
          style:{background:'none',border:'none',color:C.mut,fontSize:12,cursor:'pointer',fontFamily:'Space Grotesk',padding:0}}, 'Invité')),
      h('div',{style:{height:1,background:C.line,margin:'18px 0 14px'}}),
      this.btn('\u2190 Retour', ()=>this.setState({screen:'home',authErr:''}), {small:true,wide:true})
    );
  }

  renderSelect(port){
    const C=this.C, h=React.createElement;
    const cards = ['chevalier','mage','voleur'].map((k,ci)=>{
      const c=this.CHARS[k]; const locked = k==='voleur' && !this.state.voleurUnlocked;
      const stats=[['Vie',c.vie],['Force',c.force],['Défense',c.defense],['Magie',c.magie],['Vitesse',c.vitesse]];
      return h('div',{key:k, onClick:locked?null:()=>this.startRun(k),
        onMouseEnter:e=>{if(!locked){e.currentTarget.style.transform='translateY(-8px)';e.currentTarget.style.borderColor=c.color;}},
        onMouseLeave:e=>{e.currentTarget.style.transform='none';e.currentTarget.style.borderColor=C.line;},
        style:{width:236,background:'linear-gradient(180deg,#211c18,#161210)',border:'1px solid '+C.line,borderRadius:6,
          padding:'26px 22px',cursor:locked?'not-allowed':'pointer',transition:'transform .18s,border-color .18s',
          animation:'pmRise .5s cubic-bezier(.2,.8,.2,1) backwards',animationDelay:(0.08+ci*0.1)+'s',
          position:'relative',opacity:locked?.62:1,filter:locked?'grayscale(.5)':'none'}},
        h('div',{style:{position:'absolute',top:14,right:16,fontSize:9,letterSpacing:'.18em',color:locked?C.mut:c.color,fontWeight:600}}, c.tag),
        h('div',{style:{width:74,height:74,borderRadius:'50%',border:'1px solid '+C.line2,display:'flex',alignItems:'center',justifyContent:'center',color:locked?C.mut:c.color,marginBottom:18,background:'#0e0b09'}},
          locked? this.icon('lock',30,C.mut) : this.icon(c.icon,38,c.color)),
        h('div',{className:'pm-pixel',style:{fontSize:14,color:C.text,marginBottom:10,lineHeight:1.4}}, c.name),
        h('div',{style:{fontSize:13,color:C.mut,lineHeight:1.5,minHeight:58,marginBottom:16}}, c.desc),
        h('div',{style:{display:'grid',gridTemplateColumns:'1fr',gap:6}}, stats.map(([lab,v])=>
          h('div',{key:lab,style:{display:'flex',alignItems:'center',gap:8,fontSize:12}},
            h('span',{style:{width:54,color:C.mut}},lab),
            h('div',{style:{flex:1,height:5,background:'#0e0b09',borderRadius:3,overflow:'hidden'}},
              h('div',{style:{height:'100%',width:Math.min(100,(v/(lab==='Vie'?120:18))*100)+'%',background:locked?C.mut:c.color,borderRadius:3}})),
            h('span',{style:{width:26,textAlign:'right',color:C.text,fontWeight:600}}, v)))),
        h('div',{style:{marginTop:18,textAlign:'center',fontSize:11,letterSpacing:'.14em',color:locked?C.mut:C.gold,fontWeight:600}},
          locked?'BATTRE LE ROI POUR DÉBLOQUER':'CHOISIR \u2192'),
        h('div',{style:{position:'absolute',bottom:14,left:22,fontSize:11,color:C.mut}}, k==='voleur'?'Pentaminos · 12 formes':'Tétrominos · 7 formes')
      );
    });
    return h('div',{style:{animation:'pmFade .5s ease',textAlign:'center',padding:port?'12px 8px':24,maxWidth:port?340:880}},
      h('div',{style:{fontSize:11,letterSpacing:'.5em',color:C.gold,marginBottom:14}}, 'PUZZLE \u00B7 ROGUELIKE \u00B7 DONJON'),
      h('h1',{className:'pm-pixel',style:{fontSize:port?30:46,lineHeight:1.1,color:C.text,textShadow:'0 4px 0 #2a211a, 0 0 30px rgba(224,165,59,.25)',marginBottom:10}}, 'PATHOMINO'),
      h('p',{style:{color:C.mut,fontSize:15,maxWidth:520,margin:'0 auto 4px'}}, 'Trace ton chemin avec des pièces géométriques. Combats avec des cartes. Survis le plus longtemps possible.'),
      this.state.best>0 ? h('p',{style:{color:C.gold,fontSize:13,margin:'10px auto 0',letterSpacing:'.06em'}}, 'Meilleur score : '+this.state.best+' boss vaincus') : null,
      h('div',{style:{display:'flex',flexDirection:port?'column':'row',gap:port?14:24,justifyContent:'center',alignItems:'center',marginTop:port?20:34,flexWrap:'wrap'}}, cards)
    );
  }

  renderPlan(port){
    const C=this.C,h=React.createElement; const g=this.state.grid; if(!g) return h('div',null);
    const m=this.placedMap(); const gc=this.ghostCells(); const gValid = gc&&this.ghostValid(gc);
    const gset = gc? new Set(gc.map(c=>c.join(','))):new Set();
    const cell=Math.min(Math.floor(440/g.n),52);
    const connected=new Set();
    if(m[g.start.join(',')]){ connected.add(g.start.join(',')); const q=[g.start];
      while(q.length){ const [cr,cc]=q.shift(); [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc])=>{ const nr=cr+dr,nc=cc+dc,kk=nr+','+nc;
        if(nr>=0&&nc>=0&&nr<g.n&&nc<g.n&&m[kk]&&!connected.has(kk)){connected.add(kk);q.push([nr,nc]);} }); } }
    const hasOrphan = this.state.placed.some(pl=>pl.cells.some(c=>!connected.has(c.join(','))));
    const cells=[];
    for(let r=0;r<g.n;r++)for(let c=0;c<g.n;c++){
      const k=r+','+c; const placed=m[k];
      const isStart=this.eq([r,c],g.start), isKey=this.eq([r,c],g.key), isDoor=this.eq([r,c],g.door);
      const isPawn=g.pawns.some(p=>this.eq(p,[r,c]));
      const inGhost=gset.has(k);
      let bg='#13100e', bd=C.line, bstyle='solid';
      if(placed){ if(connected.has(k)){ bg='linear-gradient(135deg,#3a2f1d,#564219)'; bd=C.gold; }
        else { bg='#241f1a'; bd=C.line2; bstyle='dashed'; } }
      if(inGhost){ bg= gValid? 'rgba(224,165,59,.32)':'rgba(207,80,64,.3)'; bd=gValid?C.gold2:C.red; bstyle='solid'; }
      const isTreasure = g.treasure && this.eq(g.treasure,[r,c]);
      let content=null;
      if(isPawn) content=h('span',{style:{position:'relative',fontSize:cell*.6,lineHeight:1,color: m[k]?C.red:C.mut}}, '\u265F',
        (isKey||isDoor)? h('span',{style:{position:'absolute',right:-cell*.12,bottom:-cell*.12,display:'inline-flex'}}, this.icon(isKey?'key':'door', cell*.3, C.gold2)) : null);
      else if(isStart) content=this.icon('flag',cell*.5, placed?C.gold2:C.text);
      else if(isKey) content=this.icon('key',cell*.52, C.gold2);
      else if(isDoor) content= g.boss? h('span',{style:{fontSize:cell*.62,lineHeight:1,color:placed?C.red:'#b98', filter:'drop-shadow(0 0 4px rgba(207,80,64,.5))'}}, this.BOSSES[Math.min(this.state.bossIndex,4)].glyph) : this.icon('door',cell*.55, placed?C.gold2:C.text);
      else if(isTreasure) content=this.icon('chest',cell*.56, placed?C.gold2:C.gold);
      cells.push(h('div',{key:k,
        'data-rc':r+','+c,
        onMouseEnter:()=>this.hoverCell(r,c),
        onClick:()=>this.placeAt(r,c),
        style:{width:cell,height:cell,background:bg,border:'1px '+bstyle+' '+bd,borderRadius:3,
          display:'flex',alignItems:'center',justifyContent:'center',position:'relative',
          cursor:this.state.selPiece!==null?'pointer':'default',
          animation: this.state.executing&&placed?'pmPulse 1s ease infinite':((this.state.justPlaced||[]).includes(k)?'pmPop .34s ease backwards':(isKey?'pmGlow 2s ease infinite':'none'))}},
        content));
    }
    const grid=h('div',{onMouseLeave:()=>{ if(!this.state.dragging) this.setState({ghost:null}); },
      onContextMenu:(e)=>{ e.preventDefault(); if(this.state.selPiece!==null) this.rotate(); },
      onWheel:(e)=>{ if(this.state.selPiece!==null){ this.rotate(); } },
      style:{display:'grid',gridTemplateColumns:`repeat(${g.n},${cell}px)`,gap:2,padding:14,touchAction:'none',
        background:'#0c0a09',border:'1px solid '+C.line,borderRadius:8,boxShadow:'inset 0 0 40px rgba(0,0,0,.6)'}}, cells);

    const groups={}; this.state.hand.forEach((p,i)=>{ (groups[p.key]=groups[p.key]||{key:p.key,idx:[]}).idx.push(i); });
    const selKey = this.state.selPiece!==null && this.state.hand[this.state.selPiece] ? this.state.hand[this.state.selPiece].key : null;
    const tray = Object.values(groups).map(gr=>{
      const sel = selKey===gr.key;
      const i0 = sel ? this.state.selPiece : gr.idx[0];
      const shape=this.rotated(gr.key, sel?this.state.rot:0);
      const rows=Math.max(...shape.map(c=>c[0]))+1, cols=Math.max(...shape.map(c=>c[1]))+1;
      const sset=new Set(shape.map(c=>c.join(','))); const u=12; const mini=[];
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ mini.push(h('div',{key:r+','+c,style:{width:u,height:u,
        background:sset.has(r+','+c)?(sel?C.gold:'#9a7a3a'):'transparent',borderRadius:2}})); }
      return h('div',{key:gr.key, onMouseDown:(e)=>this.startDrag(i0,e), onTouchStart:(e)=>this.startDrag(i0,e), onClick:()=>{ if(this.state.dragging) return; this.sfx('select'); const mid=Math.floor(this.state.grid.n/2); this.setState({selPiece:sel?null:gr.idx[0], ghost:sel?null:[mid,mid], rot:0}); },
        title:gr.key+' ×'+gr.idx.length+' — touche pour prendre, vise la grille, clique pour poser',
        style:{position:'relative',width:64,height:64,touchAction:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:this.state.dragging&&sel?'grabbing':'grab',
          background:sel?'rgba(224,165,59,.14)':C.p1,border:'1px solid '+(sel?C.gold:C.line),borderRadius:5,transition:'background .12s,border-color .12s'}},
        h('div',{style:{display:'grid',gridTemplateColumns:`repeat(${cols},${u}px)`,gap:2}}, mini),
        h('div',{style:{position:'absolute',top:-7,right:-7,minWidth:18,height:18,padding:'0 4px',borderRadius:9,
          background:gr.idx.length>1?C.gold:C.p3,color:gr.idx.length>1?'#1a1207':C.mut,border:'1px solid '+(gr.idx.length>1?C.gold2:C.line),
          fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}, '\u00d7'+gr.idx.length));
    });

    const chk=this.pathOk();
    const head=this.state.floor; const boss=g.boss;
    const bdef=this.BOSSES[Math.min(this.state.bossIndex,4)];
    const legend=[['flag','Départ'],['key','Clé'],[boss?'boss':'door',boss?bdef.name:'Porte'],['pawn','Pion (combat)'],['chest','Trésor']];
    const noDraw=this.state.hand.length>=this.HAND_MAX || this.state.drawsLeft<=0;
    const drawTile=h('div',{key:'__draw', onClick:()=>{ if(!noDraw) this.pickPiece(); }, title:'Piocher une pièce ('+this.state.drawsLeft+' restantes cet étage)',
      style:{position:'relative',width:64,height:64,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,
        cursor:noDraw?'not-allowed':'pointer',opacity:noDraw?.5:1,background:'#0e0b09',border:'1px dashed '+(noDraw?C.line2:C.gold),borderRadius:5}},
      this.icon('deck',18,noDraw?C.mut:C.gold),
      h('div',{className:'pm-pixel',style:{fontSize:11,color:noDraw?C.mut:C.gold2,lineHeight:1}}, this.state.hand.length+'/'+this.HAND_MAX),
      h('div',{style:{fontSize:8,letterSpacing:'.08em',color:C.mut}}, this.state.hand.length>=this.HAND_MAX?'PLEIN':('PIOCHE '+this.state.drawsLeft)));

    return h('div',{style:{animation:'pmFade .4s ease',width:'100%',maxWidth:port?504:1060,padding:port?'10px 8px':'18px 26px'}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:port?12:18}},
        h('div',{style:{display:'flex',alignItems:'center',gap:14}},
          h('span',{className:'pm-pixel',style:{fontSize:15,color:C.gold}}, 'PATHOMINO'),
          h('span',{style:{fontSize:13,color:C.mut,padding:'4px 12px',border:'1px solid '+C.line,borderRadius:20}},
            `Étage ${head} · ${boss?'BOSS — '+bdef.name : 'Normal'}`)),
        h('div',{style:{display:'flex',gap:18,alignItems:'center'}},
          this.statChip('heart', this.state.php+'/'+this.state.pmax, C.red),
          this.statChip('coin', this.state.gold, C.gold),
          h('span',{style:{fontSize:12,color:C.mut}}, this.state.bossesBeaten+' boss vaincus'),
          h('button',{onClick:()=>this.openTuto(), title:'Comment jouer',
            style:{width:26,height:26,borderRadius:'50%',cursor:'pointer',background:C.p2,border:'1px solid '+C.line2,color:C.gold,fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}, '?'))),
      h('div',{style:{display:'flex',flexDirection:port?'column':'row',gap:port?16:26,alignItems:port?'center':'flex-start'}},
        h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center'}}, grid,
          h('div',{style:{display:'flex',gap:18,marginTop:14,flexWrap:'wrap'}}, legend.map(([ic,lab])=>
            h('div',{key:lab,style:{display:'flex',alignItems:'center',gap:7,fontSize:12,color:C.mut}},
              ic==='pawn'?h('span',{style:{color:C.mut,fontSize:16}},'\u265F'): ic==='boss'?h('span',{style:{color:C.red,fontSize:16}},bdef.glyph): this.icon(ic,16, ic==='key'?C.gold2:C.text), lab)))),
        h('div',{style:{width:port?'100%':300,maxWidth:port?460:'none',background:C.p1,border:'1px solid '+C.line,borderRadius:8,padding:port?16:20}},
          h('div',{style:{fontSize:11,letterSpacing:'.16em',color:C.gold,marginBottom:6}}, 'PHASE DE PLANIFICATION'),
          h('p',{style:{fontSize:13,color:C.mut,lineHeight:1.5,marginBottom:16}}, 'Place des tétrominos pour relier le départ à la clé puis à la porte. Passe sur les pions pour les combattre, ou contourne-les.'),
          h('div',{style:{fontSize:11,letterSpacing:'.12em',color:C.mut,marginBottom:10}}, 'TA MAIN'),
          h('div',{style:{display:'flex',flexWrap:'wrap',gap:8,marginBottom:8,alignItems:'center'}}, [...tray, drawTile]),
          this.state.selPiece!==null? h('div',{style:{fontSize:12,color:C.gold,marginBottom:12,lineHeight:1.45}}, 'Vise sur la grille (survole ou touche une case), puis clique pour poser — la pièce se cale au plus près. R · molette · clic droit : pivoter.') : h('div',{style:{fontSize:12,color:C.mut,marginBottom:12,lineHeight:1.45}}, 'Touche une pièce pour la prendre, puis vise la grille et clique pour la poser.'),
          h('div',{style:{display:'flex',gap:8,marginBottom:10,marginTop:8}},
            this.btn([this.icon('rotate',14),' Pivoter'], ()=>this.rotate(), {small:true,disabled:this.state.selPiece===null}),
            this.btn('Annuler', ()=>this.undo(), {small:true,danger:true,disabled:!this.state.placed.length})),
          h('div',{style:{height:1,background:C.line,margin:'14px 0'}}),
          h('div',{style:{fontSize:13,color:chk.ok?C.green:C.mut,marginBottom:hasOrphan?6:12,minHeight:20}}, chk.ok?'\u2713 Chemin valide — prêt à explorer':(chk.reason||'')),
          hasOrphan? h('div',{style:{fontSize:12,color:C.red,marginBottom:12,lineHeight:1.4}}, '\u26a0 Des pièces (en pointillés) ne sont pas reliées : elles doivent se toucher par les côtés, pas par les coins.') : null,
          this.btn(this.state.executing?'Exploration...':'Tracer le chemin \u2192', ()=>this.validate(), {primary:true,wide:true,disabled:!chk.ok||this.state.executing}),
          this.btn('Abandonner le run', ()=>this.death(), {small:true,wide:true,danger:true})
        )
      )
    );
  }
  statChip(ic,val,col){ const C=this.C,h=React.createElement;
    return h('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,color:C.text}},
      this.icon(ic,16,col), val); }

  renderCombat(port){
    const C=this.C,h=React.createElement; const e=this.state.enemy; if(!e) return h('div',null);
    const ch=this.CHARS[this.state.char];
    const sel=this.state.csel.map(uid=>this.state.chand.find(c=>c.uid===uid)).filter(Boolean);
    const combo=this.detect(sel);
    const ehpPct=Math.max(0,(e.hp/e.max)*100), phpPct=Math.max(0,(this.state.php/this.state.pmax)*100);
    const floats=(t)=>this.state.floats.filter(f=>f.target===t).map(f=>
      h('div',{key:f.id,style:{position:'absolute',left:'50%',top:'30%',transform:'translateX(-50%)',
        fontFamily:'Press Start 2P',fontSize:18,color:f.color,animation:'pmFloatUp 1.1s ease forwards',pointerEvents:'none',whiteSpace:'nowrap',textShadow:'0 2px 0 #000'}}, f.text));

    const isBoss=e.kind==='boss';
    const enemyBox = (w)=> h('div',{style:{width:w}},
      h('div',{style:{background:'#0e0b09',border:'2px solid '+C.line2,borderRadius:6,padding:'10px 14px',boxShadow:'0 4px 0 rgba(0,0,0,.4)'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}},
          h('span',{className:'pm-pixel',style:{fontSize:11,color:C.text}}, e.name),
          h('span',{style:{fontSize:11,color:C.mut}}, isBoss?'BOSS':'Niv.'+this.state.floor)),
        h('div',{style:{height:9,background:'#000',borderRadius:5,overflow:'hidden',border:'1px solid '+C.line}},
          h('div',{style:{height:'100%',width:ehpPct+'%',background:ehpPct>30?'linear-gradient(90deg,#86b46a,#5d8a45)':'linear-gradient(90deg,#cf5040,#9a2f22)',transition:'width .5s ease'}})),
        h('div',{style:{textAlign:'right',fontSize:11,color:C.mut,marginTop:3}}, e.hp+'/'+e.max+' PV'),
        e.suit? h('div',{style:{display:'flex',alignItems:'center',gap:6,marginTop:6,paddingTop:6,borderTop:'1px solid '+C.line}},
          h('span',{style:{fontSize:11,color:C.mut}}, 'Immunité'),
          h('span',{style:{fontSize:15,color:(e.suit==='\u2665'||e.suit==='\u2666')?C.red:C.text}}, e.suit),
          h('span',{style:{fontSize:11,color:C.mut}}, '\u2014 annule ce pouvoir')):null));

    const jokerBarInner = this.state.jokers.length? h('div',{style:{display:'flex',gap:6,zIndex:5}},
      this.state.jokers.map((k,i)=>{ const j=this.JOKERS[k]; return h('div',{key:i,title:j.name+' \u2014 '+j.desc,style:{width:34,height:46,borderRadius:6,background:'linear-gradient(165deg,#2a2438,#171320)',border:'1.5px solid '+j.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:j.color,boxShadow:'0 3px 6px rgba(0,0,0,.5)'}}, j.glyph); })):null;

    const enemySprite=h('div',{key:'esp'+(this.state.combatSeq||0),style:{animation:'pmEnemyIn .5s cubic-bezier(.2,.9,.25,1) backwards'}},
      h('div',{style:{position:'relative',textAlign:'center',animation: this.state.defeating?'pmDefeat .7s ease forwards':(this._shake==='enemy'?'pmShake .45s':'pmBob 2.6s ease-in-out infinite')}},
        floats('enemy'),
        h('div',{style:{position:'relative',display:'inline-block'}},
          h('div',{style:{fontSize:isBoss?108:84,lineHeight:1,color:isBoss?C.red:C.text,filter:'drop-shadow(0 6px 8px rgba(0,0,0,.6))'+(isBoss?' drop-shadow(0 0 14px rgba(207,80,64,.5))':'')}}, e.glyph),
          h('div',{key:'flash'+(this.state.hitFlash||0),style:{position:'absolute',inset:'-8px',borderRadius:'50%',background:'radial-gradient(circle,#fff,rgba(255,255,255,0) 68%)',mixBlendMode:'screen',opacity:0,animation:(this.state.hitFlash>0?'pmFlash .42s ease':'none'),pointerEvents:'none'}})),
        h('div',{style:{width:isBoss?150:120,height:18,margin:'2px auto 0',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(0,0,0,.55),transparent 70%)'}})));

    const heroSprite=h('div',{key:'hsp'+(this.state.combatSeq||0),style:{animation:'pmHeroIn .5s cubic-bezier(.2,.9,.25,1) backwards',animationDelay:'.12s'}},
      h('div',{style:{position:'relative',textAlign:'center',animation:this._shake==='hero'?'pmShake .45s':'none'}},
      floats('hero'),
      h('div',{style:{display:'flex',justifyContent:'center',alignItems:'flex-end',width:130,height:128}}, this.pixelSprite(this.state.char, 8)),
      h('div',{style:{width:120,height:18,margin:'0 auto',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(0,0,0,.55),transparent 70%)'}})));

    const heroBox=(w)=>h('div',{style:{width:w}},
      h('div',{style:{background:'#0e0b09',border:'2px solid '+C.gold,borderRadius:6,padding:'10px 14px',boxShadow:'0 4px 0 rgba(0,0,0,.4)'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}},
          h('span',{className:'pm-pixel',style:{fontSize:11,color:C.gold}}, ch.name),
          h('span',{style:{fontSize:11,color:C.mut}}, 'VIT '+ch.vitesse+(this.state.spadeRed?' · \u2660-'+this.state.spadeRed:''))),
        h('div',{style:{height:9,background:'#000',borderRadius:5,overflow:'hidden',border:'1px solid '+C.line}},
          h('div',{style:{height:'100%',width:phpPct+'%',background:phpPct>30?'linear-gradient(90deg,#e9b24b,#c98a2f)':'linear-gradient(90deg,#cf5040,#9a2f22)',transition:'width .5s ease'}})),
        h('div',{style:{textAlign:'right',fontSize:11,color:C.mut,marginTop:3}}, this.state.php+'/'+this.state.pmax+' PV')));

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
    const comboReadout=(w)=>h('div',{style:{width:w||'auto',flexShrink:0,textAlign:w?'left':'center',position:'relative',zIndex:50,background:'rgba(14,11,9,.82)',border:'1px solid '+C.line,borderRadius:8,padding:'8px 12px'}},
      h('div',{style:{fontSize:11,letterSpacing:'.12em',color:C.mut,marginBottom:4}}, 'COMBINAISON'),
      h('div',{className:'pm-pixel',style:{fontSize:14,color:canPlay?C.gold:C.mut,marginBottom:6,lineHeight:1.3}}, combo?combo.name:'—'),
      canPlay? h('div',{style:{fontSize:13,color:C.text}}, combo.dmg+' dégâts'+(this.state.csel.length?' · '+this.state.csel.length+'/5':'')) : h('div',{style:{fontSize:12,color:C.mut}}, 'Sélectionne 1 à 5 cartes'),
      canPlay&&combo.effect? h('div',{style:{fontSize:12,color:C.gold2,marginTop:3}}, combo.effect):null);
    const fanArea=h('div',{style:{flex:1,display:'flex',justifyContent:'center',alignItems:'flex-end',paddingTop:30,minHeight:120,padding:'30px 10px 0'}}, fan.length?fan:h('span',{style:{color:C.mut,fontSize:13}},'Deck vide'));
    const deckInfo=h('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:11,color:C.mut,justifyContent:'center'}}, this.icon('deck',14,C.mut), 'Deck '+this.state.deck.length+' · Défausse '+this.state.discard.length);
    const playBtn=this.btn('Jouer', ()=>this.play(), {primary:true,wide:true,small:true,disabled:!canPlay||this.state.busy});
    const discBtn=this.btn('Défausser ('+this.state.discardsLeft+')', ()=>this.discardHand(), {wide:true,small:true,disabled:!this.state.csel.length||this.state.busy||this.state.discardsLeft<=0});
    const logToast=h('div',{style:{position:'absolute',top:14,left:'50%',transform:'translateX(-50%)',background:'rgba(14,11,9,.85)',border:'1px solid '+C.line,borderRadius:20,padding:'6px 18px',fontSize:12,color:C.text,maxWidth:port?420:480,textAlign:'center',zIndex:6}}, this.state.log);

    if(port){
      return h('div',{style:{animation:'pmFade .4s ease',width:464,height:884,position:'relative',
        background:'linear-gradient(180deg,#2a2520 0%,#1c1814 52%,#15110e 100%)',borderRadius:10,
        border:'1px solid '+C.line,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.6)'}},
        backdrop, glow, logToast,
        h('div',{style:{position:'absolute',top:0,left:0,right:0,bottom:272,display:'flex',flexDirection:'column',alignItems:'center',padding:'54px 18px 0',gap:4}},
          enemyBox(384),
          h('div',{style:{transform:'scale(.9)'}}, enemySprite),
          jokerBarInner? h('div',{style:{display:'flex',justifyContent:'center',margin:'2px 0'}}, jokerBarInner):null,
          h('div',{style:{transform:'scale(.9)'}}, heroSprite),
          heroBox(360)),
        h('div',{style:{position:'absolute',left:0,right:0,bottom:0,height:272,background:'linear-gradient(180deg,rgba(14,11,9,.4),#0e0b09 38%)',borderTop:'2px solid '+C.line,display:'flex',flexDirection:'column',padding:'12px 14px 14px'}},
          comboReadout(null),
          fanArea,
          h('div',{style:{display:'flex',gap:8,alignItems:'stretch',marginTop:6,position:'relative',zIndex:50}},
            h('div',{style:{flex:1}}, playBtn),
            h('div',{style:{flex:1}}, discBtn)),
          h('div',{style:{marginTop:8,position:'relative',zIndex:50}}, deckInfo)));
    }

    return h('div',{style:{animation:'pmFade .4s ease',width:920,height:600,position:'relative',
      background:'linear-gradient(180deg,#2a2520 0%,#1c1814 52%,#15110e 100%)',borderRadius:10,
      border:'1px solid '+C.line,overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,.6)'}},
      backdrop, glow,
      h('div',{style:{position:'absolute',top:30,right:46}}, enemyBox(300)),
      h('div',{style:{position:'absolute',top:118,right:96}}, enemySprite),
      h('div',{style:{position:'absolute',bottom:150,left:230}}, heroBox(280)),
      h('div',{style:{position:'absolute',bottom:166,left:80}}, heroSprite),
      jokerBarInner? h('div',{style:{position:'absolute',top:14,left:14}}, jokerBarInner):null,
      h('div',{style:{position:'absolute',left:0,right:0,bottom:0,height:142,background:'linear-gradient(180deg,rgba(14,11,9,.4),#0e0b09 40%)',borderTop:'2px solid '+C.line,display:'flex',alignItems:'center',padding:'0 22px',gap:20}},
        comboReadout(210),
        fanArea,
        h('div',{style:{width:164,flexShrink:0,position:'relative',zIndex:50,display:'flex',flexDirection:'column',gap:8,background:'#0e0b09',border:'1px solid '+C.line,borderRadius:8,padding:'10px 12px'}}, playBtn, discBtn, deckInfo)),
      logToast);
  }
  renderCard(card, seld, idx){
    const C=this.CARD,h=React.createElement;
    const dealAnim = (typeof idx==='number') ? {animation:'pmDealUp .42s cubic-bezier(.2,.8,.2,1) backwards', animationDelay:(idx*0.045)+'s'} : {};
    if(card.joker){
      return h('div',{style:{width:60,height:86,borderRadius:6,background:'linear-gradient(160deg,#2a2438,#171320)',
        border:'2px solid '+(seld?this.C.gold:'#5a4a8a'),display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
        boxShadow:seld?'0 0 16px rgba(224,165,59,.6)':'0 4px 8px rgba(0,0,0,.5)',...dealAnim}},
        h('div',{style:{fontSize:30,color:'#caa9ff'}}, '\u2605'),
        h('div',{style:{fontSize:9,letterSpacing:'.1em',color:'#9a86c4',marginTop:4}}, 'JOKER'));
    }
    const red = card.suit==='\u2665'||card.suit==='\u2666';
    const col=red?C.red:C.ink; const lab=this.rankLabel(card.rank);
    return h('div',{style:{width:60,height:86,borderRadius:6,background:C.bg,border:'2px solid '+(seld?this.C.gold:C.line),
      position:'relative',boxShadow:seld?'0 0 16px rgba(224,165,59,.6)':'0 4px 8px rgba(0,0,0,.5)',...dealAnim}},
      h('div',{style:{position:'absolute',top:4,left:6,fontSize:14,fontWeight:700,color:col,lineHeight:1,textAlign:'center'}}, lab, h('div',{style:{fontSize:11}},card.suit)),
      h('div',{style:{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,color:col}}, card.suit),
      h('div',{style:{position:'absolute',bottom:4,right:6,fontSize:14,fontWeight:700,color:col,lineHeight:1,textAlign:'center',transform:'rotate(180deg)'}}, lab, h('div',{style:{fontSize:11}},card.suit)));
  }

  renderShop(port){
    const C=this.C,h=React.createElement;
    const shop=this.state.shop||{jokers:[],pieces:[],cards:[]};
    const gold=this.state.gold;
    const tag=(price,sold)=>h('div',{style:{marginBottom:-9,zIndex:2,position:'relative',padding:'3px 9px',borderRadius:5,fontFamily:'Press Start 2P',fontSize:8,letterSpacing:'.02em',
      background:sold?C.p3:'linear-gradient(180deg,#e9b24b,#c98a2f)',color:sold?C.mut:'#1a1207',border:'1px solid '+(sold?C.line:C.gold2)}}, sold?'VENDU':price+' or');
    const offer=(price,sold,afford,onBuy,inner,capW,caption,di)=>h('div',{style:{width:capW,display:'flex',flexDirection:'column',alignItems:'center',animation:'pmScaleIn .4s cubic-bezier(.2,.8,.2,1) backwards',animationDelay:(0.06*(di||0))+'s'}},
      tag(price,sold),
      h('div',{onClick:(!sold&&afford)?onBuy:null,
        onMouseEnter:e=>{if(!sold&&afford)e.currentTarget.style.transform='translateY(-7px)';},
        onMouseLeave:e=>e.currentTarget.style.transform='none',
        style:{cursor:(!sold&&afford)?'pointer':'default',opacity:sold?.32:(afford?1:.5),filter:(afford||sold)?'none':'grayscale(.5)',transition:'transform .12s',padding:'10px 0 4px'}}, inner),
      caption||null);
    const jokerCard=(j)=>h('div',{style:{width:78,height:104,borderRadius:8,background:'linear-gradient(165deg,#2a2438,#171320)',border:'2px solid '+j.color,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',boxShadow:'0 5px 12px rgba(0,0,0,.55)'}},
      h('div',{style:{fontSize:32,color:j.color,lineHeight:1}}, j.glyph),
      h('div',{style:{fontSize:8,fontWeight:700,letterSpacing:'.12em',color:C.mut,marginTop:8}}, 'JOKER'));
    const pieceCard=(shapeKey)=>h('div',{style:{width:78,height:92,borderRadius:8,background:C.p2,border:'1px solid '+C.line2,display:'flex',alignItems:'center',justifyContent:'center'}}, this.miniPiece(shapeKey,0,14,C.gold));
    const section=(title,sub,offers)=>h('div',{style:{marginBottom:14}},
      h('div',{style:{display:'flex',alignItems:'baseline',gap:8,marginBottom:7}},
        h('span',{style:{fontSize:11,letterSpacing:'.16em',color:C.gold,fontWeight:700}}, title),
        h('span',{style:{fontSize:11,color:C.mut}}, sub)),
      h('div',{style:{display:'flex',gap:12,alignItems:'flex-start',background:'#0c0a09',border:'1px solid '+C.line,borderRadius:8,padding:'12px 14px',minHeight:96}}, offers.length?offers:h('span',{style:{fontSize:12,color:C.mut,alignSelf:'center'}}, '\u2014 \u00e9puis\u00e9')));

    const jokerOffers=shop.jokers.map((o,i)=>{ const j=this.JOKERS[o.key]; const afford=gold>=o.price && this.state.jokers.length<5;
      return offer(o.price,o.sold,afford,()=>this.buyShop('jokers',i), jokerCard(j), 122,
        h('div',{style:{textAlign:'center',marginTop:2}},
          h('div',{style:{fontSize:11,fontWeight:700,color:j.color}}, j.name),
          h('div',{style:{fontSize:10,color:C.mut,lineHeight:1.3,marginTop:2}}, j.desc)), i); });
    const pieceOffers=shop.pieces.map((o,i)=>{ const afford=gold>=o.price && this.state.hand.length<this.HAND_MAX;
      return offer(o.price,o.sold,afford,()=>this.buyShop('pieces',i), pieceCard(o.shape), 86, null, i+2); });
    const cardOffers=shop.cards.map((o,i)=>{ const afford=gold>=o.price;
      return offer(o.price,o.sold,afford,()=>this.buyShop('cards',i), this.renderCard({rank:o.rank,suit:o.suit},false), 72, null, i+4); });

    const ownedJk=h('div',{style:{display:'flex',gap:6,alignItems:'center'}},
      h('span',{style:{fontSize:11,color:C.mut,marginRight:2}}, 'Jokers '+this.state.jokers.length+'/5'),
      this.state.jokers.length? this.state.jokers.map((k,i)=>{ const j=this.JOKERS[k];
        return h('div',{key:i,title:j.name+' \u2014 '+j.desc,style:{width:28,height:28,borderRadius:6,background:'#171320',border:'1px solid '+j.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,color:j.color}}, j.glyph); })
        : h('span',{style:{fontSize:11,color:C.line2}}, 'aucun'));

    return h('div',{style:{animation:'pmFade .4s ease',width:port?452:860,padding:port?16:24,background:C.p1,border:'1px solid '+C.line,borderRadius:10}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}},
        h('div',null,
          h('div',{className:'pm-pixel',style:{fontSize:20,color:C.gold,textShadow:'0 3px 0 #6e4a1a'}}, 'BOUTIQUE'),
          h('div',{style:{fontSize:12,color:C.mut,marginTop:6}}, 'Achète directement \u2014 tu vois ce que tu prends.')),
        h('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}},
          this.statChip('coin', gold+' or', C.gold), ownedJk)),
      h('div',{style:{display:'flex',flexDirection:port?'column':'row',gap:port?12:16,alignItems:'stretch'}},
        h('div',{style:{width:port?'100%':128,flexShrink:0,display:'flex',flexDirection:port?'row':'column',gap:8,flexWrap:'wrap',alignItems:port?'center':'stretch'}},
          h('div',{style:{flex:port?'1':'none',minWidth:port?120:'auto'}}, this.btn('\u00c9tage suivant \u2192', ()=>this.leaveShop(), {primary:true,wide:true,small:true})),
          h('div',{style:{flex:port?'1':'none',minWidth:port?120:'auto'}}, this.btn('Reroll \u00b7 5 or', ()=>this.rerollShop(), {wide:true,small:true,disabled:gold<5})),
          h('div',{style:{fontSize:11,color:C.mut,lineHeight:1.5,marginTop:port?0:6,flexBasis:port?'100%':'auto'}}, 'L\u2019or ne se conserve pas entre les runs. Les jokers sont passifs : ils restent actifs en combat.')),
        h('div',{style:{flex:1}},
          section('JOKERS', 'passifs \u2014 amplifient tes pouvoirs', jokerOffers),
          section('PI\u00c8CES', 't\u00e9trominos pour ta main', pieceOffers),
          section('CARTES', 'ajout\u00e9es \u00e0 ton deck de combat', cardOffers))));
  }

  renderResult(){
    const C=this.C,h=React.createElement;
    return h('div',{style:{animation:'pmFade .5s ease',textAlign:'center',width:520,padding:'40px 36px',background:'linear-gradient(180deg,#211712,#140d0b)',border:'1px solid '+C.line,borderRadius:12}},
      h('div',{className:'pm-pixel',style:{fontSize:30,color:C.red,textShadow:'0 4px 0 #2a0f0c',marginBottom:10,animation:'pmSlamIn .55s cubic-bezier(.3,1.4,.5,1) backwards'}}, 'GAME OVER'),
      h('p',{style:{color:C.mut,fontSize:14,marginBottom:28}}, 'Le donjon t\u2019a eu. Une seule vie — tout recommence.'),
      h('div',{style:{display:'flex',justifyContent:'center',gap:40,marginBottom:28}},
        h('div',null, h('div',{className:'pm-pixel',style:{fontSize:38,color:C.gold,animation:'pmPop .5s ease backwards',animationDelay:'.3s'}}, this.state.bossesBeaten),
          h('div',{style:{fontSize:11,letterSpacing:'.14em',color:C.mut,marginTop:8}}, 'BOSS VAINCUS')),
        h('div',null, h('div',{className:'pm-pixel',style:{fontSize:38,color:C.text,animation:'pmPop .5s ease backwards',animationDelay:'.42s'}}, this.state.best),
          h('div',{style:{fontSize:11,letterSpacing:'.14em',color:C.mut,marginTop:8}}, 'MEILLEUR SCORE'))),
      this.state.newUnlock? h('div',{style:{background:'rgba(134,180,106,.12)',border:'1px solid '+C.green,borderRadius:6,padding:'12px 16px',marginBottom:22,color:C.green,fontSize:13,fontWeight:600}}, '\u2605 ROI VAINCU — Le Voleur est débloqué !') : null,
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
      this.miniPiece(piece.key, s.rot, u, this.C.gold2));
  }
  miniCells(cells,u,color,gap){ const h=React.createElement;
    const set=new Set(cells.map(c=>c.join(','))); const rows=Math.max(...cells.map(c=>c[0]))+1, cols=Math.max(...cells.map(c=>c[1]))+1; const out=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ out.push(h('div',{key:r+','+c,style:{width:u,height:u,borderRadius:2,
      background:set.has(r+','+c)?color:'#1a1614',border:'1px solid '+(set.has(r+','+c)?color:this.C.line)}})); }
    return h('div',{style:{display:'grid',gridTemplateColumns:`repeat(${cols},${u+2}px)`,gap:gap||3}}, out); }
  renderMute(){ const C=this.C,h=React.createElement;
    return h('button',{onClick:()=>this.toggleMute(), title:this.state.muted?'Activer le son':'Couper le son',
      style:{position:'fixed',top:10,right:10,zIndex:500,width:38,height:38,borderRadius:8,cursor:'pointer',
        background:'rgba(14,11,9,.8)',border:'1px solid '+C.line2,color:this.state.muted?C.mut:C.gold,fontSize:17,display:'flex',alignItems:'center',justifyContent:'center'}},
      this.state.muted?'\u{1F507}':'\u{1F50A}'); }
  renderTuto(){ const C=this.C,h=React.createElement;
    if(!this.state.showTuto || this.state.screen!=='plan') return null;
    const step=(ic,title,body)=>h('div',{style:{display:'flex',gap:12,alignItems:'flex-start',textAlign:'left',marginBottom:14}},
      h('div',{style:{flexShrink:0,width:34,height:34,borderRadius:8,background:'#0e0b09',border:'1px solid '+C.line2,display:'flex',alignItems:'center',justifyContent:'center',color:C.gold}}, ic),
      h('div',null, h('div',{style:{fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}, title),
        h('div',{style:{fontSize:12,color:C.mut,lineHeight:1.5}}, body)));
    const ok=h('div',{style:{display:'flex',alignItems:'center',gap:8}}, this.miniCells([[0,0],[0,1]],14,C.green), h('span',{style:{color:C.green,fontSize:13,fontWeight:700}}, '✓ reliées (côté)'));
    const no=h('div',{style:{display:'flex',alignItems:'center',gap:8}}, this.miniCells([[0,0],[1,1]],14,C.red), h('span',{style:{color:C.red,fontSize:13,fontWeight:700}}, '✗ non reliées (coin)'));
    return h('div',{style:{position:'fixed',inset:0,zIndex:450,background:'rgba(5,4,3,.78)',display:'flex',alignItems:'center',justifyContent:'center',padding:16},onClick:()=>this.closeTuto()},
      h('div',{onClick:(e)=>e.stopPropagation(),style:{width:'100%',maxWidth:420,background:'linear-gradient(180deg,#1d1713,#120c0a)',border:'1px solid '+C.line,borderRadius:12,padding:'26px 24px',boxShadow:'0 30px 80px rgba(0,0,0,.6)',animation:'pmFade .3s ease'}},
        h('div',{className:'pm-pixel',style:{fontSize:14,color:C.gold,textAlign:'center',marginBottom:18}}, 'COMMENT JOUER'),
        step(this.icon('flag',18,C.gold),'Trace ton chemin','Relie le Départ à la Clé puis à la Porte en posant tes pièces sur la grille.'),
        step(this.icon('rotate',18,C.gold),'Pose une pièce','Touche une pièce, vise une case, clique pour la poser. Molette / clic droit / R pour pivoter.'),
        step('⚠','Relie par les côtés','Les pièces ne se connectent que si elles se touchent par un côté — jamais par un coin.'),
        h('div',{style:{display:'flex',justifyContent:'center',gap:22,margin:'6px 0 20px',padding:'12px',background:'#0c0a09',borderRadius:8,border:'1px solid '+C.line}}, ok, no),
        this.btn('Compris, jouer →', ()=>this.closeTuto(), {primary:true,wide:true})));
  }
  renderVals(){
    const s=this.state;
    const port = (s.vh||800) > (s.vw||1280);
    return {
      isHome:s.screen==='home', isAuth:s.screen==='auth',
      isSelect:s.screen==='select', isPlan:s.screen==='plan', isCombat:s.screen==='combat',
      isShop:s.screen==='shop', isResult:s.screen==='result',
      homeEl:s.screen==='home'?this.scaleWrap(this.renderHome(port), port?360:880, port?900:660):null,
      authEl:s.screen==='auth'?this.scaleWrap(this.renderAuth(port), port?340:420, port?620:560):null,
      selectEl:s.screen==='select'?this.scaleWrap(this.renderSelect(port), port?360:820, port?1400:700):null,
      planEl:s.screen==='plan'?this.scaleWrap(this.renderPlan(port), port?528:1092, port?1040:690):null,
      combatEl:s.screen==='combat'?this.scaleWrap(this.renderCombat(port), port?464:920, port?884:600):null,
      shopEl:s.screen==='shop'?this.scaleWrap(this.renderShop(port), port?452:884, port?908:712):null,
      resultEl:s.screen==='result'?this.scaleWrap(this.renderResult(),520,470):null,
      dragOverlay:this.renderDragOverlay(),
      tutoOverlay:this.renderTuto(),
      muteBtn:this.renderMute()
    };
  }
}
