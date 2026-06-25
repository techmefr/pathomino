// renderShop — extrait de pathomino.js pour alléger le fichier (étend le prototype).
// Chargé après pathomino.js, avant le montage. Compatible file://.
/* global Pathomino, React, PM */
Object.assign(Pathomino.prototype, {
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
});
