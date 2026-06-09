const faces = [
  {file:'face_stephan.png', name:'Stephan', weight:10, pay:12},
  {file:'face_casco.png', name:'Casco', weight:11, pay:10},
  {file:'face_beard.png', name:'Barba', weight:11, pay:10},
  {file:'face_smile.png', name:'Sorriso', weight:12, pay:9},
  {file:'face_blond.png', name:'Blond', weight:12, pay:9},
  {file:'face_red.png', name:'Red', weight:13, pay:8},
  {file:'litterio.png', name:'Litterio', weight:6, pay:25, wild:true, scatter:true}
];
const icons = [
  {icon:'💎', name:'Diamante', weight:8, pay:18},
  {icon:'🔔', name:'Campana', weight:12, pay:7},
  {icon:'🍒', name:'Ciliegie', weight:15, pay:5},
  {icon:'🍀', name:'Quadrifoglio', weight:14, pay:6},
  {icon:'7', name:'Seven', weight:7, pay:20}
];
let symbols = [...faces.map(x=>({...x,type:'face'})), ...icons.map(x=>({...x,type:'icon'}))];
let balance = +(localStorage.funlot3dBalance || 1500);
let bet = 25, selected = 'slot', spinning=false, turbo=false, autoLeft=0, freeSpins=0, lastWin=0, jackpot=+(localStorage.funlotJackpot || 7777);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const asset = f => `assets/faces/${f}`;
const lineMap = [[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],[2,1,1,1,2],[0,1,0,1,0],[2,1,2,1,2],[1,0,1,0,1],[1,2,1,2,1],[0,0,2,0,0],[2,2,0,2,2],[0,2,0,2,0],[2,0,2,0,2],[1,1,0,1,1]];
let history=[];
function save(){localStorage.funlot3dBalance=balance; localStorage.funlotJackpot=jackpot; $('#balance').textContent=Math.floor(balance)}
function toast(t){const el=$('#toast'); el.textContent=t; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2800)}
window.addEventListener('load',()=>{save(); setTimeout(()=>$('#boot').classList.add('hide'),1500)});
function loader(text,cb){$('#bootTitle').textContent=text; $('#boot').classList.remove('hide'); setTimeout(()=>{$('#boot').classList.add('hide'); cb&&cb()},1200)}
function goLobby(){ $('#game').classList.add('hidden'); $('#lobby').classList.remove('hidden') }
function openCashier(){toast(`Cassa FunLot: hai ${balance} LotCoin finti. Nessun soldo vero, solo gloria.`)}
function openVip(){toast('VIP FunLot: livello Mega Direttore Galattico quasi raggiunto. Servono altre 777 figuracce.')}
function openPromo(){balance+=250; save(); toast('Bonus benvenuto accreditato: +250 LC demo!')}
function resetAll(){balance=1500; jackpot=7777; history=[]; save(); toast('Demo ripristinata: 1500 LC e jackpot 7777 LC')}
function chooseGame(g){selected=g; $('#betTitle').textContent={slot:'Faces of Funseven 3D',poker:'Funseven Poker',roulette:'Funcessen Roulette',kick:'Litterio Kick Bonus'}[g]; $('#betModal').classList.remove('hidden')}
function closeBet(){ $('#betModal').classList.add('hidden') }
function setStake(v){bet=v; $('#stakeInput').value=v}
function launchGame(){bet=Math.max(1,+$('#stakeInput').value||bet); if(balance<bet){toast('Saldo insufficiente. Premi Reset o prendi il bonus.');return} closeBet(); loader('Apertura gioco e sincronizzazione rulli 3D...',()=>renderGame(selected))}
function renderGame(g){$('#lobby').classList.add('hidden'); $('#game').classList.remove('hidden'); if(g==='slot') renderSlot(); if(g==='poker') renderPoker(); if(g==='roulette') renderRoulette(); if(g==='kick') renderKick(false)}
function drawSymbol(){let total=symbols.reduce((a,s)=>a+s.weight,0), r=Math.random()*total; for(const s of symbols){r-=s.weight; if(r<=0)return s} return symbols[0]}
function symHTML(s,cls=''){return `<div class="slot-symbol ${s.type==='icon'?'icon':''} ${cls}" data-name="${s.name}">${s.type==='face'?`<img src="${asset(s.file)}" alt="${s.name}"><small>${s.name}</small>`:`<b>${s.icon}</b><small>${s.name}</small>`}</div>`}
function randomStrip(center){let arr=[]; for(let i=0;i<18;i++) arr.push(drawSymbol()); arr.splice(8,3,...center); return arr.map(x=>symHTML(x)).join('')}
function renderSlot(){
  $('#game').innerHTML=`<div class="slot-shell">
    <div class="slot-top"><div class="side-meter"></div><div class="marquee"><h1>FACES OF FUNSEVEN</h1><p>3D Deluxe • 20 linee • Wild Litterio • Free Spins • Kick Bonus</p></div><div class="side-meter"></div></div>
    <div class="jackpot-row"><div class="jackpot"><small>GRAND JACKPOT</small><b id="jp">${Math.floor(jackpot)}</b></div><div class="jackpot"><small>FREE SPINS</small><b id="fs">${freeSpins}</b></div><div class="jackpot"><small>AUTOPLAY</small><b id="auto">${autoLeft}</b></div><div class="jackpot"><small>MODALITÀ</small><b id="mode">${turbo?'TURBO':'NORMAL'}</b></div></div>
    <div class="slot-screen"><div class="payline-glow"></div><div class="reel-grid" id="reelGrid">${[0,1,2,3,4].map(()=>`<div class="reel3d"><div class="strip">${randomStrip([drawSymbol(),drawSymbol(),drawSymbol()])}</div></div>`).join('')}</div></div>
    <div class="slot-console"><div class="display"><small>BET</small><b id="betv">${bet}</b></div><div class="display"><small>WIN</small><b id="winv">0</b></div><button class="spin-btn" onclick="spinSlot()">SPIN</button><div class="display"><small>BALANCE</small><b id="balv">${balance}</b></div><div class="display"><small>LINEE</small><b>20</b></div></div>
    <div class="tool-row"><button onclick="changeBet(-5)">BET -</button><button onclick="changeBet(5)">BET +</button><button onclick="toggleTurbo()">Turbo</button><button onclick="startAuto(10)">Auto 10</button><button onclick="chooseGame('slot')">Cambia puntata</button><button onclick="goLobby()">Lobby</button></div>
    <div class="paytable"><div class="panel-card"><h3>Paytable professionale</h3><div class="pay-items">${faces.map(f=>`<div class="pay-item"><img src="${asset(f.file)}"><span>${f.name}<br><b>5x paga ${f.pay}x</b></span></div>`).join('')}<div class="pay-item"><span style="font-size:34px">💎</span><span>Diamante<br><b>5x paga 18x</b></span></div><div class="pay-item"><span style="font-size:34px">7</span><span>Seven<br><b>5x paga 20x</b></span></div></div></div><div class="panel-card"><h3>Storico vincite</h3><div class="history" id="hist"><span>Nessuna vincita ancora.</span></div><p>Litterio è Wild e Scatter. 3+ Litterio danno free spin. 5 Litterio aprono il bonus calci.</p></div></div>
  </div>`;
  updateSlotDisplays();
}
function updateSlotDisplays(){save(); $('#balv')&&($('#balv').textContent=Math.floor(balance)); $('#jp')&&($('#jp').textContent=Math.floor(jackpot)); $('#fs')&&($('#fs').textContent=freeSpins); $('#auto')&&($('#auto').textContent=autoLeft); $('#mode')&&($('#mode').textContent=turbo?'TURBO':'NORMAL'); $('#betv')&&($('#betv').textContent=bet); $('#winv')&&($('#winv').textContent=lastWin); if($('#hist')) $('#hist').innerHTML=history.length?history.slice(0,8).map(h=>`<span>${h}</span>`).join(''):'<span>Nessuna vincita ancora.</span>'}
function changeBet(delta){ if(spinning)return; bet=Math.max(1,bet+delta); updateSlotDisplays() }
function toggleTurbo(){turbo=!turbo; updateSlotDisplays(); toast(turbo?'Turbo attivo: rulli più rapidi.':'Turbo disattivato.')}
function startAuto(n){autoLeft=n; updateSlotDisplays(); spinSlot()}
function spinSlot(){
  if(spinning)return; let paid=false; if(freeSpins>0){freeSpins--; paid=true}else{if(balance<bet){toast('Saldo insufficiente.'); autoLeft=0; updateSlotDisplays(); return} balance-=bet; jackpot+=bet*.12}
  lastWin=0; updateSlotDisplays(); spinning=true; clearWins();
  const reels=$$('.reel3d'); const final=[]; const speed=turbo?140:330;
  reels.forEach((reel,i)=>{reel.classList.add('spinning'); const col=[drawSymbol(),drawSymbol(),drawSymbol()]; if(Math.random()<0.055) col[Math.floor(Math.random()*3)] = faces[6]; final[i]=col; setTimeout(()=>{reel.classList.remove('spinning'); reel.querySelector('.strip').innerHTML=col.map(s=>symHTML(s)).join(''); if(i===4) settleSpin(final,paid)},(turbo?450:850)+i*speed)})
}
function clearWins(){ $$('.slot-symbol').forEach(x=>x.classList.remove('win')) }
function settleSpin(grid,free){
  let total=0, litters=0, winCells=[];
  grid.forEach(col=>col.forEach(s=>{if(s.name==='Litterio')litters++}));
  lineMap.forEach(line=>{
    let seq=line.map((row,col)=>grid[col][row]); let base=seq.find(s=>s.name!=='Litterio') || seq[0]; let count=0;
    for(const s of seq){ if(s.name===base.name || s.name==='Litterio') count++; else break; }
    if(count>=3){ let mult=(base.pay||5) * (count===3?.25:count===4?.55:1); let w=Math.ceil(bet*mult/20); total+=w; for(let c=0;c<count;c++) winCells.push([c,line[c]]); }
  });
  if(litters>=3){let add=litters*bet; total+=add; freeSpins+=litters; toast(`${litters} Litterio Scatter: +${litters} free spin!`)}
  if(litters>=5){total+=bet*7; setTimeout(()=>renderKick(true),900)}
  if(grid[0][1].name==='Stephan'&&grid[1][1].name==='Casco'&&grid[2][1].name==='Barba'&&grid[3][1].name==='Sorriso'&&grid[4][1].name==='Blond'){total+=jackpot; toast('Hai Vinto Coglione!! GRAND JACKPOT FACCINE!'); confetti(80); jackpot=7777}
  if(total>0){balance+=total; lastWin=total; history.unshift(`${new Date().toLocaleTimeString()} • +${total} LC${free?' gratis':''}`); markWins(winCells); if(total>=bet*10)confetti(50); if(!litters>=3)toast(`Vincita: ${total} LC`)} else {lastWin=0; history.unshift(`${new Date().toLocaleTimeString()} • niente, Litterio incassa`)}
  spinning=false; updateSlotDisplays();
  if(autoLeft>0){autoLeft--; updateSlotDisplays(); setTimeout(()=>spinSlot(),turbo?350:900)}
}
function markWins(cells){const reels=$$('.reel3d'); cells.forEach(([c,r])=>{let el=reels[c]?.querySelectorAll('.slot-symbol')[r]; if(el)el.classList.add('win')})}
function confetti(n=30){for(let i=0;i<n;i++){const c=document.createElement('i'); c.className='confetti'; c.style.left=Math.random()*100+'vw'; c.style.background=['#ffd66b','#ff285d','#32ffaa','#46e7ff'][i%4]; c.style.animationDelay=Math.random()*.3+'s'; document.body.appendChild(c); setTimeout(()=>c.remove(),1900)}}
function renderPoker(){ if(balance<bet){toast('Saldo insufficiente');return} balance-=bet; let hand=[0,1,2,3,4].map(()=>faces[Math.floor(Math.random()*faces.length)]); let counts={}; hand.forEach(x=>counts[x.name]=(counts[x.name]||0)+1); let vals=Object.values(counts).sort((a,b)=>b-a); let mult= vals[0]===5?70:vals[0]===4?30:vals[0]===3&&vals[1]===2?14:vals[0]===3?7:vals[0]===2&&vals[1]===2?4:vals[0]===2?2:0; let win=bet*mult; balance+=win; save(); $('#game').innerHTML=`<div class="poker-table"><h1>FUNSEVEN POKER 3D</h1><p>Carte con facce FunLot, pagamento demo in LotCoin.</p><div class="hand">${hand.map((f,i)=>`<div class="card"><small>${['A','K','Q','J','7'][i]}♠</small><img src="${asset(f.file)}"><b>${f.name}</b></div>`).join('')}</div><h2>${win?`Hai vinto ${win} LC`:'Nessuna combinazione valida'}</h2><div class="tool-row"><button class="primary" onclick="chooseGame('poker')">Nuova mano</button><button onclick="goLobby()">Lobby</button></div></div>` }
function renderRoulette(){ $('#game').innerHTML=`<div class="roulette"><h1>FUNCESSEN ROULETTE 3D</h1><p>Pagamento 7 a 1. Se esce 7, paga anche il LotCoin Litterio.</p><div id="wheel" class="wheel">?</div><div class="tool-row"><button class="primary" onclick="betRoulette(7)">Punta sul 7</button><button onclick="betRoulette(Math.floor(Math.random()*8))">Numero casuale</button><button onclick="goLobby()">Lobby</button></div><h2 id="rouletteOut"></h2></div>` }
function betRoulette(chosen){ if(balance<bet){toast('Saldo insufficiente');return} balance-=bet; save(); const result=Math.floor(Math.random()*8), wheel=$('#wheel'); wheel.textContent=''; wheel.style.transform=`rotate(${1440+result*45}deg)`; setTimeout(()=>{wheel.textContent=result; let win=result===chosen?bet*7:0; if(result===7)win+=7; balance+=win; save(); $('#rouletteOut').innerHTML=`Scelto ${chosen} • Uscito ${result} • Vincita ${win} LC`; toast(win?`Roulette: +${win} LC`:'La ruota ha mangiato la puntata.')},3300)}
function renderKick(fromBonus=false){ kicks=0; kickwin=0; $('#lobby').classList.add('hidden'); $('#game').classList.remove('hidden'); $('#game').innerHTML=`<div class="kickbox"><h1>LITTERIO KICK BONUS 3D</h1><p>${fromBonus?'Bonus sbloccato dalla slot: 5 Litterio sui rulli!':'Minigioco bonus dalla lobby.'}</p><div id="kickarea" class="kick-area"><img id="lit" src="${asset('litterio.png')}"></div><div class="jackpot-row"><div class="jackpot"><small>CALCI</small><b id="kicks">0/10</b></div><div class="jackpot"><small>VINTO</small><b id="kickwin">0</b></div></div><div class="tool-row"><button class="primary big" onclick="kickLitterio()">TIRA UN CALCIO</button><button onclick="renderSlot()">Torna alla slot</button><button onclick="goLobby()">Lobby</button></div></div>`}
let kicks=0,kickwin=0;
function kickLitterio(){ if(kicks>=10){toast('Bonus finito.');return} kicks++; let add=7+Math.floor(Math.random()*(bet*2)); kickwin+=add; balance+=add; save(); $('#kicks').textContent=kicks+'/10'; $('#kickwin').textContent=kickwin; const img=$('#lit'); img.classList.add('hit'); setTimeout(()=>img.classList.remove('hit'),120); const c=document.createElement('div'); c.className='coin'; c.textContent='+'+add+' LC'; c.style.left=(35+Math.random()*30)+'%'; c.style.top='54%'; $('#kickarea').appendChild(c); setTimeout(()=>c.remove(),1000); if(kicks===10){toast(`Bonus completato: +${kickwin} LC`); confetti(35)}}
