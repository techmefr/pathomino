// renderCombat — extrait de pathomino.js pour alléger le fichier (étend le prototype).
// Chargé après pathomino.js, avant le montage. Compatible file://.
/* global Pathomino, React, PM */
Object.assign(Pathomino.prototype, {
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
});
