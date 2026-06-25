// renderPlan — extrait de pathomino.js pour alléger le fichier (étend le prototype).
// Chargé après pathomino.js, avant le montage. Compatible file://.
/* global Pathomino, React, PM */
Object.assign(Pathomino.prototype, {
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
      if(isHole){ bg='#3a2e1e'; bd='#7a5a2a'; bstyle='solid'; }
      if(isPortalA||isPortalB){ bd=clr.blue; bstyle='solid'; bg='rgba(111,155,202,.22)'; }
      if(this.state.selectingPortal&&!placed&&!isHole){ bd=clr.blue; bstyle='dashed'; }
      let content=null;
      if(isFood && !placed) content=h('span',{style:{fontSize:cell*.5,color:'#d96060',filter:'drop-shadow(0 0 3px rgba(220,80,80,.5))'}}, '\u2665');
      else if(isPotion && !placed) content=h('span',{style:{fontSize:cell*.45,color:'#a06ad0',filter:'drop-shadow(0 0 3px rgba(160,100,220,.5))'}}, '\u2697');
      else if(isHole) content=null;
      else if(isTrap && !placed) content=h('span',{style:{fontSize:cell*.45,color:'#5a9a5a',filter:'drop-shadow(0 0 3px rgba(80,180,80,.5))'}}, '\u2620');
      else if(isPawn) content=h('span',{style:{position:'relative',fontSize:cell*.6,lineHeight:1,color: pmap[k]?clr.red:clr.mut}}, '\u265F',
        (isKey||isDoor)? h('span',{style:{position:'absolute',right:-cell*.12,bottom:-cell*.12,display:'inline-flex'}}, this.icon(isKey?'key':'door', cell*.3, clr.gold2)) : null);
      else if(isStart) content=this.icon('flag',cell*.5, placed?clr.gold2:clr.text);
      else if(isKey) content=this.icon('key',cell*.52, clr.gold2);
      else if(isDoor) content= h('span',{style:{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center'}},
        this.icon('door',cell*.55, placed?clr.gold2:clr.text),
        grid.boss ? h('span',{style:{position:'absolute',fontSize:cell*.42,lineHeight:1,color:placed?clr.red:'#c9a060',filter:'drop-shadow(0 0 5px rgba(207,80,64,.7))',bottom:-cell*.2,right:-cell*.22}}, this.BOSSES[Math.min(this.state.bossIndex,4)].glyph) : null);
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
});
