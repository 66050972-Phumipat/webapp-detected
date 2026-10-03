const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = value => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Math.abs(Number(value) || 0)) + ' ฿';
function normalizeRow(row) {
  const rawDate = row.transaction_date || row.rawDate || '';
  const d = new Date(rawDate);
  const date = Number.isNaN(d.getTime()) ? (row.date || 'ไม่ระบุ') : d.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const factors = row.score_factors || {};
  const parts=String(row.date||'').split('-'); const fallbackMonth=parts.length===3?`20${parts[2]}-${parts[1]}`:'';
  return { ...row, ownerName:row.owner_name||row.ownerName||'บุคคลที่ 1', rawDate, date, monthKey: Number.isNaN(d.getTime()) ? fallbackMonth : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, type: row.transaction_type || row.type || 'ไม่ระบุ', amount: Number(row.amount || 0), score: Number(row.risk_score ?? row.score ?? 0), level: row.risk_level || row.level || 'NORMAL', reasons: row.reasons || 'ไม่พบสัญญาณเด่น', factors: Array.isArray(row.factors) ? row.factors : [['Machine Learning', Number(row.ml_contribution || 0)], ['ยอดเทียบค่ามัธยฐาน', Number(factors.amount_deviation || 0)], ['เวลาทำรายการ', Number(factors.night_activity || 0)], ['ธุรกรรมต่างประเทศ', Number(factors.international || 0)]] };
}
function initialCases() {
  try {
    const saved = JSON.parse(localStorage.getItem('detected-cases-v1'));
    if (Array.isArray(saved)) {
      const realCases = saved.filter(c => c && c.source !== 'sample').map(c => ({
        ...c,
        rows: Array.isArray(c.rows) ? c.rows.map(normalizeRow) : [],
        files: Array.isArray(c.files) ? c.files : []
      }));
      if (realCases.length) return realCases;
    }
  } catch {}
  return [{id:`case-${Date.now()}`, name:'TRANSACTION REVIEW', rows:[], files:[], source:'empty'}];
}
let cases = initialCases(); let activeCaseId = cases[0].id; let sampleRows = cases[0].rows;
const savedTheme = localStorage.getItem('detected-theme') || 'dark';
document.documentElement.dataset.theme = savedTheme;
const state = { view:'home', risk:'ทั้งหมด', search:'', month:'all', person:'all', expenseCategories:[],incomeOnly:false, selected:null, uploading:false, activeModel:'ensemble', settings:{suspicious_threshold:40,high_threshold:70,theme:savedTheme}, chatHistory:[] };
function applyTheme(theme){
  const value=['light','mermaid','dark'].includes(theme)?theme:'dark';
  document.documentElement.dataset.theme=value;
  localStorage.setItem('detected-theme',value);
  state.settings.theme=value;
  document.body.classList.toggle('mermaid-active',value==='mermaid');
  ensureMermaidScene(value==='mermaid');
}
function ensureMermaidScene(enabled){
  let scene=document.querySelector('.mermaid-theme-scene');
  if(enabled && !scene){
    scene=document.createElement('div'); scene.className='mermaid-theme-scene'; scene.setAttribute('aria-hidden','true');
    scene.innerHTML='<div class="sea-mermaid mermaid1">🧜🏻‍♀️</div><div class="sea-mermaid mermaid2">🧜🏽‍♀️</div><div class="sea-mermaid mermaid3">🧜🏼‍♀️</div><div class="sea-fish fish1">🐠</div><div class="sea-fish fish2">🐟</div><div class="sea-fish fish3">🐡</div><div class="sea-fish fish4">🐠</div><div class="sea-jelly jelly1">🪼</div><div class="sea-jelly jelly2">🪼</div><div class="sea-sponge sponge1"></div><div class="sea-sponge sponge2"></div><div class="sea-coral coral1">🪸</div><div class="sea-coral coral2">🪸</div><div class="sea-shell shell1">🐚</div><div class="sea-shell shell2">🐚</div><div class="mermaid-bubbles"></div><div class="mermaid-hearts">♡　✦　♡　✧　♡</div>';
    document.body.prepend(scene);
  } else if(!enabled && scene){ scene.remove(); }
}

/* Mermaid fish gently chase the mouse pointer. */
(function setupMermaidMouseFish(){
  let pointer={x:window.innerWidth*.5,y:window.innerHeight*.5};
  let targets=[];
  let raf=0;
  let running=false;
  document.addEventListener('pointermove', e=>{
    pointer.x=e.clientX; pointer.y=e.clientY;
  }, {passive:true});
  function tick(){
    const enabled=document.documentElement.dataset.theme==='mermaid';
    const fish=[...document.querySelectorAll('.mermaid-theme-scene .sea-fish')];
    if(enabled && fish.length){
      if(targets.length!==fish.length) targets=fish.map((_,i)=>({x:window.innerWidth*(.2+i*.28),y:window.innerHeight*(.25+(i%3)*.2)}));
      fish.forEach((el,i)=>{
        const t=targets[i];
        const strength=.018+i*.006;
        t.x += (pointer.x + (i-1)*75 - t.x)*strength;
        t.y += (pointer.y + (i-1)*45 - t.y)*strength;
        const dx=t.x-window.innerWidth/2, dy=t.y-window.innerHeight/2;
        el.style.transform=`translate3d(${dx*.08}px,${dy*.08}px,0) rotate(${Math.max(-10,Math.min(10,dx*.018))}deg)`;
      });
    }
    raf=requestAnimationFrame(tick);
  }
  if(!running){running=true; raf=requestAnimationFrame(tick);}
})();

function mermaidGlitter(x,y){
  if(document.documentElement.dataset.theme!=='mermaid') return;
  const layer=document.querySelector('.mermaid-glitter-layer') || (()=>{const el=document.createElement('div');el.className='mermaid-glitter-layer';document.body.append(el);return el;})();
  for(let i=0;i<16;i++){
    const s=document.createElement('span'); s.className='glitter-particle';
    s.textContent=i%4===0?'♥':(i%3===0?'✦':'✧');
    const a=Math.random()*Math.PI*2, d=25+Math.random()*80;
    s.style.left=`${x}px`; s.style.top=`${y}px`; s.style.setProperty('--dx',`${Math.cos(a)*d}px`); s.style.setProperty('--dy',`${Math.sin(a)*d}px`); s.style.setProperty('--delay',`${Math.random()*80}ms`);
    layer.append(s); setTimeout(()=>s.remove(),900);
  }
}
applyTheme(savedTheme);
const home = document.querySelector('#home'), content = document.querySelector('#content'), viewContent = document.querySelector('#view-content');
/* Detected. Firebase Authentication */
const authScreen = document.querySelector('#auth-screen');
const authContent = document.querySelector('#auth-content');
const protectedApp = document.querySelector('#protected-app');
const firebaseConfigError = document.querySelector('#firebase-config-error');
const aiFab = document.querySelector('#ai-fab');
const chatPanel = document.querySelector('#chat-panel');
let firebaseConfigured = false;
let firebaseAuth = null;
let currentUser = null;
let authMode = 'login';

function renderAuthScreen(message='', mode=authMode) {
  authMode = mode;
  const signup = authMode === 'signup';
  if (!authContent) return;
  authContent.innerHTML = `
    <div class="firebase-login-card">
      <div class="firebase-login-mark">D</div>
      <span class="eyebrow">DETECTED · SECURE ACCESS</span>
      <h1>${signup ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</h1>
      <p>${signup ? 'สร้างบัญชีเพื่อเริ่มใช้งานระบบตรวจสอบธุรกรรม' : 'เข้าสู่ระบบเพื่อใช้งานระบบตรวจสอบธุรกรรม'}</p>
      <form id="firebase-login-form">
        <label>อีเมล
          <input id="firebase-email" type="email" autocomplete="email" placeholder="name@example.com" required>
        </label>
        <label>รหัสผ่าน
          <input id="firebase-password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="อย่างน้อย 6 ตัวอักษร" minlength="6" required>
        </label>
        ${signup ? `<label>ยืนยันรหัสผ่าน
          <input id="firebase-password-confirm" type="password" autocomplete="new-password" placeholder="กรอกรหัสผ่านอีกครั้ง" minlength="6" required>
        </label>` : ''}
        <button class="settings-save firebase-login-button" type="submit">${signup ? 'สร้างบัญชี' : 'เข้าสู่ระบบ'}</button>
        <button class="provider-button firebase-google-button" type="button" id="firebase-auth-toggle">${signup ? 'มีบัญชีแล้ว · เข้าสู่ระบบ' : 'สมัครเลย'}</button>
        <p id="firebase-login-message" class="firebase-login-message">${esc(message)}</p>
      </form>
    </div>`;
  firebaseConfigError.hidden = firebaseConfigured;
}
function setAuthenticated(user) {
  currentUser = user;
  if (authScreen) authScreen.hidden = true;
  if (protectedApp) protectedApp.hidden = false;
  if (aiFab) aiFab.hidden = false;
  if (chatPanel) chatPanel.hidden = true;
  const status = document.querySelector('.top-status');
  if (status) {
    status.innerHTML = `<i></i><span>${esc(user?.email || 'ผู้ใช้')}</span><button class="account-link" id="logout-button">ออกจากระบบ</button><button class="top-settings-button" data-view="settings" aria-label="เปิดตั้งค่า" title="ตั้งค่า">⚙</button>`;
  }
  openView('home');
  loadTransactions();
}

function setUnauthenticated(message='') {
  currentUser = null;
  if (protectedApp) protectedApp.hidden = true;
  if (authScreen) authScreen.hidden = false;
  if (aiFab) aiFab.hidden = true;
  if (chatPanel) chatPanel.hidden = true;
  renderAuthScreen(message);
}

async function firebaseLogin(email, password) {
  if (!firebaseAuth) { renderAuthScreen('ยังไม่ได้ตั้งค่า Firebase Configuration'); return; }
  try { await firebaseAuth.signInWithEmailAndPassword(email, password); }
  catch (error) {
    const msg = error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password'
      ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      : error?.code === 'auth/user-not-found' ? 'ไม่พบบัญชีนี้'
      : error?.code === 'auth/too-many-requests' ? 'ลองใหม่ภายหลัง ระบบจำกัดการเข้าสู่ระบบชั่วคราว'
      : error?.message || 'เข้าสู่ระบบไม่สำเร็จ';
    renderAuthScreen(msg, 'login');
  }
}

async function firebaseSignup(email, password, confirmPassword) {
  if (!firebaseAuth) { renderAuthScreen('ยังไม่ได้ตั้งค่า Firebase Configuration', 'signup'); return; }
  if (password !== confirmPassword) { renderAuthScreen('รหัสผ่านทั้งสองช่องไม่ตรงกัน', 'signup'); return; }
  if (password.length < 6) { renderAuthScreen('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'signup'); return; }
  try { await firebaseAuth.createUserWithEmailAndPassword(email, password); }
  catch (error) {
    const msg = error?.code === 'auth/email-already-in-use' ? 'อีเมลนี้มีบัญชีอยู่แล้ว ลองเข้าสู่ระบบแทน'
      : error?.code === 'auth/invalid-email' ? 'รูปแบบอีเมลไม่ถูกต้อง'
      : error?.code === 'auth/weak-password' ? 'รหัสผ่านอ่อนเกินไป'
      : error?.message || 'สมัครสมาชิกไม่สำเร็จ';
    renderAuthScreen(msg, 'signup');
  }
}

document.addEventListener('submit', event => {
  if (event.target.id !== 'firebase-login-form') return;
  event.preventDefault();
  const email = document.querySelector('#firebase-email')?.value.trim() || '';
  const password = document.querySelector('#firebase-password')?.value || '';
  if (authMode === 'signup') {
    firebaseSignup(email, password, document.querySelector('#firebase-password-confirm')?.value || '');
  } else {
    firebaseLogin(email, password);
  }
});

document.addEventListener('click', async event => {
  if (event.target.closest('#firebase-auth-toggle')) {
    event.preventDefault();
    renderAuthScreen('', authMode === 'signup' ? 'login' : 'signup');
    return;
  }
  if (event.target.closest('#logout-button')) {
    event.preventDefault();
    if (firebaseAuth) await firebaseAuth.signOut();
  }
});

async function initFirebaseAuth() {
  try {
    const response = await fetch('/api/firebase-config', { cache: 'no-store' });
    const config = await response.json();
    firebaseConfigured = !!(window.firebase && config.apiKey && config.authDomain && config.projectId && config.appId);
    if (!firebaseConfigured) {
      setUnauthenticated('ยังไม่ได้ตั้งค่า Firebase ใน .env');
      return;
    }
    firebase.initializeApp(config);
    firebaseAuth = firebase.auth();
    firebaseAuth.onAuthStateChanged(user => {
      if (user) setAuthenticated(user);
      else setUnauthenticated();
    });
  } catch (error) {
    setUnauthenticated('โหลด Firebase Configuration ไม่สำเร็จ');
  }
}
initFirebaseAuth();

const activeCase = () => cases.find(c => c.id === activeCaseId) || cases[0];
const saveCases = () => { try { localStorage.setItem('detected-cases-v1', JSON.stringify(cases)); } catch { toast('พื้นที่จัดเก็บข้อมูลเต็ม แฟ้มนี้ยังเปิดได้ในหน้านี้'); } };
function updateActiveRows(rows, source) { sampleRows = rows.map(normalizeRow); activeCase().rows = sampleRows; activeCase().source = source || activeCase().source; saveCases(); renderCaseCarousel(); }
function monthOptions() {
  const months = [...new Set(sampleRows.map(r => r.monthKey).filter(Boolean))].sort().reverse();
  return `<select class="month-select" id="month-filter"><option value="all">ทุกเดือน</option>${months.map(m=>{const [y,mo]=m.split('-');return `<option value="${esc(m)}" ${state.month===m?'selected':''}>${new Date(Number(y),Number(mo)-1,1).toLocaleDateString('th-TH',{month:'long',year:'numeric'})}</option>`}).join('')}</select>`;
}
function filteredRows() { return sampleRows.filter(r => (state.month==='all' || r.monthKey===state.month) && (state.person==='all' || r.ownerName===state.person)); }
function personOptions(){const names=[...new Set(sampleRows.map(r=>r.ownerName).filter(Boolean))];return `<select class="person-select" id="person-filter" aria-label="กรองเจ้าของข้อมูล"><option value="all" ${state.person==='all'?'selected':''}>ทุกคน (${names.length})</option>${names.map(n=>`<option value="${esc(n)}" ${state.person===n?'selected':''}>${esc(n)}</option>`).join('')}</select>`;}
function appendCaseRows(rows,ownerName,fileName){if(activeCase().source==='sample'&&!activeCase().files?.length)sampleRows=[];const fileId=`file-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,added=rows.map(r=>normalizeRow({...r,ownerName,sourceFileId:fileId,sourceFileName:fileName}));sampleRows=[...sampleRows,...added];activeCase().rows=sampleRows;activeCase().files||=[];activeCase().files.push({id:fileId,name:fileName,ownerName,count:added.length,importedAt:new Date().toISOString()});activeCase().source='statement';saveCases();renderCaseCarousel();}
function aggregateCaseScore(rows=filteredRows()){const total=rows.length,score=total?Math.round(rows.reduce((sum,r)=>sum+Number(r.score||0),0)/total):0;const level=total?(score>=state.settings.high_threshold?'HIGH RISK':score>=state.settings.suspicious_threshold?'SUSPICIOUS':'NORMAL'):'NO DATA';return {score,level,total,high:rows.filter(r=>r.level==='HIGH RISK').length,suspicious:rows.filter(r=>r.level==='SUSPICIOUS').length,normal:rows.filter(r=>r.level==='NORMAL').length};}
function aiRows(rows=sampleRows) { return rows.map(r=>({...r,transaction_date:r.rawDate||r.transaction_date||r.date,owner_name:r.ownerName,risk_score:r.score,risk_level:r.level,transaction_type:r.transaction_type||r.type})); }
function isExpense(row) { const kind=String(row.transaction_type||'').toLowerCase(), text = `${row.type} ${row.description}`.toLowerCase(); if(Number(row.amount)<0)return true; if(/credit|deposit|income|เงินเข้า|รับโอน|เงินเดือน/.test(`${kind} ${text}`))return false; if(/debit|withdraw|expense|outflow|ถอน|จ่าย|โอนออก|ชำระ|ซื้อ/.test(`${kind} ${text}`))return true; return false; }
function categoryOf(row) { const s=`${row.type} ${row.description}`.toLowerCase(); if(!isExpense(row)) return 'รับเงิน'; if (/ถอน|atm|cash/.test(s)) return 'ถอนเงินสด'; if (/โอนออก|โอน/.test(s)) return 'โอนเงิน'; if (/ชำระ|ซื้อ|สินค้า|bill|online/.test(s)) return 'ชำระสินค้า/บิล'; return 'รายจ่ายอื่นๆ'; }
function levelClass(level) { return level==='HIGH RISK'?'risk-high':level==='SUSPICIOUS'?'risk-mid':'risk-normal'; }
function viewHeading(code,title,description) { return `<div class="view-heading"><span class="eyebrow">${code}</span><h2>${title}</h2><p>${description}</p></div>`; }
function personRows(){return sampleRows.filter(r=>state.person==='all'||r.ownerName===state.person);}
function riskChart(rows){const counts=[['NORMAL','ปกติ','#91b89b'],['SUSPICIOUS','น่าสงสัย','#e7c66c'],['HIGH RISK','เสี่ยงสูง','#d98787']].map(([level,label,color])=>({level,label,color,count:rows.filter(r=>r.level===level).length}));const total=rows.length||1;let cursor=0;const stops=counts.map(x=>{const start=cursor;cursor+=x.count/total*100;return `${x.color} ${start}% ${cursor}%`;}).join(',');return `<section class="chart-panel"><div class="chart-heading"><div><span class="eyebrow">RISK DISTRIBUTION</span><h3>สัดส่วนระดับความเสี่ยง</h3></div><small>${rows.length} รายการ</small></div><div class="risk-chart-layout"><div class="risk-donut" style="--risk-stops:${stops}"><span><b>${rows.length}</b><small>ธุรกรรม</small></span></div><div class="chart-legend">${counts.map(x=>`<div><i style="--legend:${x.color}"></i><span>${x.label}</span><b>${x.count}</b><small>${rows.length?Math.round(x.count/rows.length*100):0}%</small></div>`).join('')}</div></div></section>`;}
function monthlyFlowChart(rows){const groups={};rows.forEach(r=>{if(!r.monthKey)return;const g=groups[r.monthKey]||(groups[r.monthKey]={income:0,expense:0});g[isExpense(r)?'expense':'income']+=Math.abs(r.amount);});const items=Object.entries(groups).sort(([a],[b])=>a.localeCompare(b)).slice(-6),max=Math.max(1,...items.flatMap(([,v])=>[v.income,v.expense]));return `<section class="chart-panel"><div class="chart-heading"><div><span class="eyebrow">CASH FLOW · MONTHLY</span><h3>เงินเข้า–ออกแต่ละเดือน</h3></div><div class="chart-key"><span><i class="income-key"></i>เงินเข้า</span><span><i class="expense-key"></i>เงินออก</span></div></div>${items.length?`<div class="monthly-chart">${items.map(([month,v])=>`<div class="month-column"><div class="month-bars"><i class="bar-income" style="height:${Math.max(v.income?4:0,v.income/max*100)}%" title="รับเข้า ${money(v.income)}"></i><i class="bar-expense" style="height:${Math.max(v.expense?4:0,v.expense/max*100)}%" title="จ่ายออก ${money(v.expense)}"></i></div><small>${esc(month.slice(5))}/${esc(month.slice(2,4))}</small><b>${money(v.income+v.expense)}</b></div>`).join('')}</div>`:'<p class="empty-note">ยังไม่มีข้อมูลวันที่เพียงพอสำหรับกราฟ</p>'}</section>`;}
function renderCaseCarousel() {
  const el=document.querySelector('#case-carousel'); if(!el)return;
  el.innerHTML=`<div class="case-carousel-label"><span>CASE FILES · ${String(cases.length).padStart(2,'0')}</span><small>ปัดซ้าย–ขวาบนแฟ้มสีฟ้า หรือกดแฟ้มที่โผล่ข้างๆ เพื่อสลับ</small><div class="case-actions"><button data-view="cases">▤ ดูแฟ้มทั้งหมด</button><button id="add-case">＋ เพิ่มแฟ้ม</button><button id="rename-case">✎ ตั้งชื่อแฟ้ม</button><button id="delete-case" title="ลบแฟ้มนี้">ลบแฟ้ม</button></div></div>`;
  const label=document.querySelector('#folder-name'); if(label)label.textContent=activeCase().name;
  const subtitle=document.querySelector('#folder-subtitle'); if(subtitle)subtitle.textContent='TRANSACTION REVIEW';
  const index=document.querySelector('.folder-index'); if(index)index.textContent=`CASE / ${String(caseFileNumber(activeCase())).padStart(3,'0')}`;
  const activeIndex=cases.findIndex(c=>c.id===activeCaseId), previous=activeIndex>0?cases[activeIndex-1]:null, next=activeIndex<cases.length-1?cases[activeIndex+1]:null;
  for(const [id,item] of [['folder-peek-prev',previous],['folder-peek-next',next]]){const peek=document.querySelector(`#${id}`);if(!peek)continue;const isNew=id==='folder-peek-next'&&!item;peek.hidden=!item&&!isNew;peek.dataset.case=isNew?'__new_case__':item?.id||'';peek.classList.toggle('new-case-peek',isNew);peek.querySelector('small').textContent=isNew?`NEXT FILE · NO. ${String(nextCaseNumber()).padStart(3,'0')}`:`CASE NO. ${String(caseFileNumber(item)).padStart(3,'0')}`;peek.querySelector('b').textContent=isNew?'＋ เพิ่มแฟ้มใหม่':item?.name||'';peek.setAttribute('aria-label',isNew?'สร้างแฟ้มใหม่':`เปิด ${item?.name||'แฟ้ม'}`);}
}
function overviewView() {
  const rows=filteredRows(), flagged=rows.filter(r=>r.level!=='NORMAL').length, high=rows.filter(r=>r.level==='HIGH RISK').length;
  const total=rows.reduce((s,r)=>s+Math.abs(r.amount),0), aggregate=aggregateCaseScore(sampleRows);
  return `${viewHeading('CASE SUMMARY / 01','ภาพรวมแฟ้ม',`สรุปธุรกรรมและระดับความเสี่ยง · ${esc(activeCase().name)}`)}<div class="view-tools"><div class="filter-pair">${personOptions()}${monthOptions()}</div><button class="ai-summary-button" id="ai-summary">✳ วิเคราะห์ภาพรวมทั้งหมดด้วย AI</button></div>
  <div id="ai-summary-result" class="ai-summary-result" hidden></div>
  <section class="overview-cover"><div class="cover-folder-tab">FINANCIAL REVIEW</div><div class="cover-copy"><span class="cover-kicker">DETECTED INTELLIGENCE ARCHIVE</span><h3>แฟ้มตรวจสอบ<br>ธุรกรรม</h3><p>${esc(activeCase().name)}</p><span class="cover-classified">CONFIDENTIAL</span></div><button id="case-score-badge" class="risk-id-badge ${aggregate.level==='HIGH RISK'?'badge-risk-high':aggregate.level==='SUSPICIOUS'?'badge-risk-mid':'badge-risk-normal'}" aria-label="เปิดรายละเอียดคะแนนภาพรวมแฟ้ม"><span class="badge-clip"></span><span class="badge-topline">CASE RISK</span><span class="badge-content"><span class="badge-photo"><span>✳</span><small>CASE</small></span><span class="badge-score"><small>คะแนนภาพรวมของแฟ้ม</small><strong>${aggregate.score}<i>/100</i></strong><span class="risk-badge ${levelClass(aggregate.level)}">${aggregate.level==='NO DATA'?'NO DATA':aggregate.level}</span></span></span><span class="badge-bottomline">เฉลี่ยจาก ${aggregate.total} ธุรกรรม · กดดูวิธีคำนวณ</span></button></section>
  <div class="overview-metrics"><article><span>ธุรกรรมทั้งหมด</span><b>${rows.length}</b><small>ในช่วงเวลาที่เลือก</small></article><article><span>ควรตรวจสอบ</span><b>${flagged}</b><small>Suspicious และ High Risk</small></article><article><span>ความเสี่ยงสูง</span><b>${high}</b><small>มูลค่าธุรกรรม ${money(total)}</small></article></div><div class="charts-grid">${riskChart(rows)}${monthlyFlowChart(rows)}</div>
  <section class="preview-panel"><div class="panel-heading-row"><div><h3>รายการที่ควรตรวจสอบ</h3><p>กดรายการเพื่อดูรายละเอียดและที่มาของ Risk Score</p></div><button class="text-action" data-view="transactions">ดูธุรกรรมทั้งหมด ↗</button></div><div class="preview-list">${rows.filter(r=>r.level!=='NORMAL').slice(0,5).map(r=>`<button data-row="${sampleRows.indexOf(r)}"><span>${esc(r.description)}</span><span>${money(r.amount)}</span><span class="risk-badge ${levelClass(r.level)}">${r.level} · ${r.score}/100</span></button>`).join('')||'<p class="empty-note">ยังไม่มีรายการในช่วงเวลานี้</p>'}</div></section>`;
}
function transactionsView() {
  const periodRows=filteredRows();
  const baseRows=periodRows.filter(r=>(state.risk==='ทั้งหมด'||r.level===state.risk)&&(!state.search||`${r.description} ${r.type} ${r.reasons} ${r.ownerName}`.toLowerCase().includes(state.search.toLowerCase())));
  const rows=baseRows.filter(r=>{
    if(!isExpense(r)) return state.incomeOnly;
    if(state.expenseCategories===null) return true;
    return Array.isArray(state.expenseCategories) && state.expenseCategories.includes(categoryOf(r));
  });
  const income=rows.filter(r=>!isExpense(r)).reduce((s,r)=>s+Math.abs(r.amount),0), availableIncome=periodRows.filter(r=>!isExpense(r)).reduce((s,r)=>s+Math.abs(r.amount),0), expenses=rows.filter(isExpense).reduce((s,r)=>s+Math.abs(r.amount),0);
  const chartGroups={}; rows.forEach(r=>{const k=categoryOf(r);chartGroups[k]=(chartGroups[k]||0)+Math.abs(r.amount);});
  const categories=Object.entries(chartGroups).sort((a,b)=>b[1]-a[1]);
  /* Keep the filter options based on the full current period, not the already-filtered rows.
     Otherwise an unchecked category disappears and cannot be selected again. */
  const filterGroups={}; periodRows.forEach(r=>{const k=categoryOf(r);filterGroups[k]=(filterGroups[k]||0)+Math.abs(r.amount);});
  const filterCategories=Object.entries(filterGroups).sort((a,b)=>b[1]-a[1]);
  const expenseCategories=filterCategories.filter(([cat])=>cat!=='รับเงิน');
  const allCategories=expenseCategories.map(([cat])=>cat),allChecked=allCategories.length>0&&(!state.expenseCategories||allCategories.every(x=>state.expenseCategories.includes(x)));
  const incomeCount=periodRows.filter(r=>!isExpense(r)).length;
  const hasData=periodRows.length>0;
  return `${viewHeading('STATEMENT / 02','ธุรกรรมทั้งหมด','สรุปเงินเข้า-ออกและค้นหารายการในแฟ้มเดียวกัน')}
  <div class="view-tools"><div class="filter-pair">${personOptions()}${monthOptions()}</div><span class="case-context">${esc(activeCase().name)}</span></div>
  <section class="cashflow-grid transaction-cashflow"><article class="cashflow-card income"><span>เงินเข้า</span><b>${money(availableIncome)}</b><small>${incomeCount} รายการ</small></article><article class="cashflow-card expense"><span>เงินออก</span><b>${money(expenses)}</b><small>${periodRows.filter(isExpense).length} รายการ</small></article><article class="cashflow-card net"><span>ยอดสุทธิ</span><b>${income-expenses<0?'−':''}${money(income-expenses)}</b><small>เงินเข้า − เงินออก</small></article></section>
  <div class="charts-grid transaction-charts">${monthlyFlowChart(rows)}<section class="chart-panel"><div class="chart-heading"><div><span class="eyebrow">CATEGORY BREAKDOWN</span><h3>สรุปแยกประเภท</h3></div></div><div class="category-chart">${categories.map(([cat,total])=>`<div><span>${esc(cat)}</span><i><em style="width:${Math.max(3,total/Math.max(1,...categories.map(([,n])=>n))*100)}%"></em></i><b>${money(total)}</b></div>`).join('')||'<p class="empty-note">ยังไม่มีรายการให้แสดง</p>'}</div></section></div>
  <section class="expense-filter-panel"><div class="expense-filter-heading"><div><b>รายจ่ายแยกประเภท</b><small>ติ๊กเพื่อกรองรายการรายจ่ายในตาราง</small></div><label class="check-all"><input type="checkbox" id="expense-all" ${allChecked?'checked':''}> เลือกทั้งหมด</label></div><div class="expense-category-grid">${incomeCount?`<label class="expense-category income-filter-option"><input type="checkbox" id="income-filter" ${state.incomeOnly?'checked':''}><span><b>รับเงิน</b><small>${incomeCount} รายการ</small></span><strong>${money(availableIncome)}</strong></label>`:''}${expenseCategories.map(([cat,total])=>`<label class="expense-category"><input type="checkbox" class="expense-check" value="${esc(cat)}" ${!state.expenseCategories||state.expenseCategories.includes(cat)?'checked':''}><span><b>${esc(cat)}</b><small>${periodRows.filter(r=>isExpense(r)&&categoryOf(r)===cat).length} รายการ</small></span><strong>${money(total)}</strong></label>`).join('')||`<p class="empty-note">${hasData?'ไม่มีรายจ่ายในช่วงนี้':'ยังไม่มีรายการธุรกรรมในแฟ้มนี้'}</p>`}</div></section>
  <div class="sample-banner">${activeCase().source==='statement'?'ข้อมูลจาก Statement':(hasData?'ข้อมูลในแฟ้ม':'ยังไม่มีไฟล์นำเข้า')} · ${rows.length} จาก ${periodRows.length} รายการ</div>
  <div class="ledger-paper"><div class="ledger-paper-head"><div><span>STATEMENT · INTERNAL COPY</span><b>รายการธุรกรรม</b></div><button class="text-action" data-view="overview">ดูภาพรวม</button></div><div class="preview-filter"><select id="risk-filter">${['ทั้งหมด','NORMAL','SUSPICIOUS','HIGH RISK'].map(level=>`<option ${state.risk===level?'selected':''}>${level}</option>`).join('')}</select><input id="search-input" value="${esc(state.search)}" placeholder="ค้นหารายการหรือเหตุผล..."></div><div class="ledger-table-scroll"><table class="sample-table"><thead><tr><th>วันที่</th><th>เจ้าของข้อมูล</th><th>รายละเอียด</th><th>ประเภท</th><th>จำนวนเงิน</th><th>Risk Score</th></tr></thead><tbody>${rows.map(r=>`<tr data-row="${sampleRows.indexOf(r)}"><td>${esc(r.date)}</td><td>${esc(r.ownerName)}</td><td>${esc(r.description)}</td><td>${esc(r.type)}</td><td>${money(r.amount)}</td><td><span class="score-ticket"><span class="risk-badge ${levelClass(r.level)}">${r.score}<small>/100</small></span><i>${r.level}</i></span></td></tr>`).join('')||'<tr><td colspan="6" class="empty-note">ไม่พบรายการ</td></tr>'}</tbody></table></div><div class="ledger-foot"><span>กดแถวเพื่อเปิดบัตรรายละเอียด</span><span>${rows.length} รายการ · ${esc(activeCase().name)}</span></div></div>`;
}
function uploadView() {
  const people=[...new Set(activeCase().rows.map(r=>r.ownerName).filter(Boolean))], files=activeCase().files||[];
  const filePanel=`<section class="imported-file-panel"><div class="panel-heading-row"><div><h3>ไฟล์ในแฟ้มนี้</h3><p>ลบไฟล์แล้วธุรกรรมที่นำเข้าจากไฟล์นั้นจะถูกลบออกด้วย</p></div><span class="file-count">${files.length} ไฟล์</span></div>${files.length?`<div class="imported-file-list">${files.map(f=>`<article class="imported-file"><span class="imported-file-icon">▤</span><div class="imported-file-info"><b>${esc(f.name)}</b><small>${esc(f.ownerName||'ไม่ระบุเจ้าของ')} · ${Number(f.count||0)} รายการ${f.importedAt?` · ${new Date(f.importedAt).toLocaleDateString('th-TH')}`:''}</small></div><button type="button" class="delete-file-button" data-delete-file="${esc(f.id)}">ลบไฟล์</button></article>`).join('')}</div>`:'<p class="empty-note">ยังไม่มีไฟล์นำเข้าในแฟ้มนี้</p>'}</section>`;
  return `${viewHeading('INCOMING DOCUMENT / 04','นำเข้า Statement','เลือกเจ้าของข้อมูลก่อนเพิ่มรายการเข้าแฟ้ม: '+esc(activeCase().name))}<div class="sample-banner">นำเข้าได้หลายครั้ง · เพิ่มธุรกรรมต่อท้ายแฟ้ม และเลือกเจ้าของข้อมูลแยกแต่ละชุดได้</div><section class="upload-board"><div class="upload-folder-tab">NEW EVIDENCE</div><label class="owner-input-row"><span>เจ้าของข้อมูล <small>รายการจากไฟล์นี้จะผูกกับชื่อนี้</small></span><input id="owner-name" list="case-people" value="${esc(people[0]||'บุคคลที่ 1')}" placeholder="เช่น คุณเอ"><datalist id="case-people">${people.map(n=>`<option value="${esc(n)}">`).join('')}</datalist></label><div class="upload-steps"><span class="current"><i>01</i> เลือกไฟล์</span><b></b><span><i>02</i> ตรวจรายการ</span><b></b><span><i>03</i> วิเคราะห์</span></div><label class="drop-zone" id="drop-zone"><input id="file-input" type="file" accept=".pdf,.csv,.xlsx,.xls" hidden><span class="drop-icon">⇧</span><b>วาง Statement ลงในซอง<br>หรือเลือกไฟล์จากเครื่อง</b><small>PDF · CSV · Excel · ไม่เกิน 20 MB</small><button type="button" class="text-action" id="choose-file">เลือกไฟล์</button></label><div id="file-preview" class="file-preview" hidden></div><label class="pdf-password-row" id="pdf-password-block" hidden><span>รหัสผ่านของไฟล์ (ถ้ามี) <small>กรอกเมื่อไฟล์มีการป้องกัน</small></span><span class="password-control"><input id="pdf-password" type="password" autocomplete="off" placeholder="ใส่รหัสผ่านเพื่อเปิด PDF"><button type="button" id="toggle-password">แสดง</button></span></label><p class="upload-error" id="upload-error" hidden></p><button class="primary-action" id="prepare-file" disabled>นำเข้าและเพิ่มในแฟ้ม</button><p class="upload-privacy">ระบบใช้รหัสผ่านเพื่อเปิดไฟล์ระหว่างนำเข้า และไม่บันทึกรหัสผ่านไว้</p></section>${filePanel}`;
}
async function modelsView() {
  let info={trained:false,metrics:{}}; try {const [m,s]=await Promise.all([fetch('/api/models'),fetch('/api/settings')]);if(m.ok)info=await m.json();if(s.ok){const v=await s.json();state.settings={...state.settings,...v};state.activeModel=v.active_model||'ensemble';}}catch{}
  if(state.view!=='models')return;
  const options=[['ensemble','CASE ANALYST · ENSEMBLE','ผสานผล XGBoost และ Random Forest เพื่อประเมินร่วมกัน','เฉลี่ยผลจากโมเดลที่รองรับ Statement',null],['xgboost','FIELD DETECTIVE · XGBOOST','จับความสัมพันธ์ซับซ้อนจากข้อมูลธุรกรรม','Gradient Boosting',info.metrics?.xgboost],['random_forest','PATROL UNIT · RANDOM FOREST','ประเมินจากชุดต้นไม้หลายต้นและรวมผล','Random Forest',info.metrics?.random_forest]];
  const metric=value=>Number.isFinite(Number(value))?`${(Number(value)*100).toFixed(1)}%`:'—';
  const coreCards=options.map(([id,name,desc,tag,metrics],i)=>`<article class="model-id-card ${state.activeModel===id?'selected':''}"><span class="model-clip">●</span><small>STATEMENT MODEL · ${String(i+1).padStart(2,'0')}</small><span class="model-avatar">${['✳','X','RF'][i]}</span><b>${name}</b><p>${desc}</p><span class="model-tag">${tag}</span>${metrics?`<div class="model-metrics"><span>Precision <b>${metric(metrics.precision)}</b></span><span>Recall <b>${metric(metrics.recall)}</b></span><span>F1 <b>${metric(metrics.f1)}</b></span><span>ROC AUC <b>${metric(metrics.roc_auc)}</b></span><span>PR AUC <b>${metric(metrics.pr_auc)}</b></span></div>`:`<div class="model-metrics model-metrics-note">${info.trained?'ไม่มีผลประเมินแยกสำหรับ Ensemble · ดูผลของ XGBoost และ Random Forest ด้านข้าง':'ยังไม่มีไฟล์โมเดลฝึก · ใช้กฎสำรองชั่วคราว'}</div>`}<span class="model-status">${state.activeModel===id?'✓ กำลังใช้งาน':info.trained?'พร้อมเลือกใช้กับ Statement':'ยังไม่มีโมเดลฝึก · ใช้กฎสำรอง'}</span>${state.activeModel===id?'<button class="model-use-button" disabled>กำลังใช้งาน</button>':info.trained?`<button class="model-use-button" data-model="${id}">เลือกใช้โมเดลนี้</button>`:'<button class="model-use-button" disabled>ต้องมีโมเดลฝึกก่อน</button>'}</article>`).join('');
  viewContent.innerHTML=`${viewHeading('MODEL IDENTIFICATION / 05','AI Model','เลือกวิธีวิเคราะห์ Statement ที่ต้องการใช้งาน')}<div class="sample-banner">${info.trained?'โมเดล Statement พร้อมใช้งาน':'ยังไม่มีโมเดล Statement ที่ฝึก · ระบบใช้กฎสำรอง'} · ${info.trained?`ข้อมูลฝึก ${Number(info.rows||0).toLocaleString()} แถว · พบ Fraud ${Number(info.fraud_rows||0).toLocaleString()} แถว`:''}</div><div class="model-grid">${coreCards}</div><p class="model-note">ค่า Precision, Recall, F1, ROC AUC และ PR AUC มาจากชุดทดสอบของโมเดล ไม่ใช่การรับประกันผลกับทุกแฟ้ม · คะแนนใช้คัดกรอง ไม่ใช่ข้อยืนยันการทุจริต</p>`;
}
async function settingsView() {
  try{const r=await fetch('/api/settings');if(r.ok){state.settings={...state.settings,...await r.json()};state.activeModel=state.settings.active_model||state.activeModel;}}catch{}
  if(state.view!=='settings')return;
  viewContent.innerHTML=`${viewHeading('SETTING / 06','ตั้งค่า','กำหนดเงื่อนไขและเลือกธีม')}<section class="preview-panel settings-real"><h3>เกณฑ์ระดับความเสี่ยง</h3><p>ใช้กับ Risk Score ตั้งแต่การคำนวณครั้งถัดไป</p><div class="settings-preview"><label>เริ่ม SUSPICIOUS ตั้งแต่<input type="number" id="setting-suspicious" value="${state.settings.suspicious_threshold}" min="1" max="99"></label><label>เริ่ม HIGH RISK ตั้งแต่<input type="number" id="setting-high" value="${state.settings.high_threshold}" min="2" max="100"></label><label>ธีมการแสดงผล<select id="setting-theme"><option value="dark" ${state.settings.theme==='dark'?'selected':''}>Dark</option><option value="light" ${state.settings.theme==='light'?'selected':''}>Light</option><option value="mermaid" ${state.settings.theme==='mermaid'?'selected':''}>🧜‍♀️ Mermaid Romance</option></select></label></div><p id="settings-error" class="upload-error" hidden></p><button class="settings-save" id="save-settings">บันทึกการตั้งค่า</button><p class="model-note">โมเดลที่ใช้งาน: ${esc(state.activeModel)}</p></section>`;
}
function loginView(){
  const email = currentUser?.email || 'ผู้ใช้ปัจจุบัน';
  return `${viewHeading('ACCOUNT / 07','บัญชีผู้ใช้','ข้อมูลบัญชีที่ยืนยันตัวตนด้วย Firebase')}<section class="account-layout"><div class="login-card"><span class="login-seal">D</span><span class="eyebrow">DETECTED · SECURE DESK</span><h3>${esc(email)}</h3><p>บัญชีนี้ผ่านการยืนยันตัวตนแล้ว</p><button class="settings-save" id="logout-button" type="button">ออกจากระบบ</button></div></section>`;
}
function usersView(){
  const email = currentUser?.email || 'ไม่ระบุ';
  return `${viewHeading('ACCOUNT / 08','โปรไฟล์','บัญชีที่กำลังใช้งาน')}<section class="user-profile-card"><span class="user-avatar">D</span><div><span class="eyebrow">CURRENT SESSION</span><h3>${esc(email)}</h3><p>การเข้าถึงระบบถูกควบคุมโดย Firebase Authentication</p></div></section>`;
}
function allCasesView(){const cards=cases.map((c,i)=>{const rows=(c.rows||[]).map(normalizeRow),summary=aggregateCaseScore(rows),risk=summary.level==='HIGH RISK'?'high':summary.level==='SUSPICIOUS'?'mid':'normal',total=rows.reduce((sum,r)=>sum+Math.abs(Number(r.amount)||0),0),people=new Set(rows.map(r=>r.ownerName).filter(Boolean)).size,number=String(caseFileNumber(c)).padStart(3,'0');return `<div class="archive-file-shell"><button type="button" class="archive-file-card archive-${risk} ${c.id===activeCaseId?'is-active':''}" data-open-case="${esc(c.id)}" style="--file-index:${i}" aria-label="เปิด ${esc(c.name)} · คะแนน ${summary.score} จาก 100"><span class="archive-tab"></span><span class="archive-file-kicker">DETECTED INTELLIGENCE ARCHIVE</span><span class="archive-file-number">CASE · ${number}</span><b class="archive-file-name">${esc(c.name)}</b><span class="archive-file-stats"><span><small>ธุรกรรม</small><strong>${rows.length.toLocaleString('th-TH')}</strong></span><span><small>ยอดรวม</small><strong>${money(total)}</strong></span><span><small>ผู้เกี่ยวข้อง</small><strong>${people}</strong></span></span><span class="archive-risk"><i></i><span>${summary.level==='NO DATA'?'ยังไม่มีข้อมูล':summary.level==='HIGH RISK'?'เสี่ยงสูง':summary.level==='SUSPICIOUS'?'น่าสงสัย':'ปกติ'}</span><b>${summary.score}<small>/100</small></b></span><span class="archive-open-hint">เปิดแฟ้ม <b>↗</b></span></button><button type="button" class="archive-rename-button" data-rename-case="${esc(c.id)}" aria-label="ตั้งชื่อ ${esc(c.name)}" title="เปลี่ยนชื่อแฟ้ม">✎</button><button type="button" class="archive-delete-button" data-delete-case="${esc(c.id)}" aria-label="ลบ ${esc(c.name)}" title="ลบแฟ้ม">×</button></div>`;}).join('');return `${viewHeading('CASE ARCHIVE / 00','คลังแฟ้มทั้งหมด','ค้นหา เปรียบเทียบ และเปิดแฟ้มตรวจสอบของคุณ')}<div class="archive-toolbar"><label class="archive-search"><span>⌕</span><input id="case-search" type="search" placeholder="ค้นหาชื่อหรือหมายเลขแฟ้ม…" autocomplete="off"></label><label class="archive-risk-filter"><span>ระดับความเสี่ยง</span><select id="case-risk-filter"><option value="all">ทุกระดับ</option><option value="normal">ปกติ</option><option value="mid">น่าสงสัย</option><option value="high">เสี่ยงสูง</option><option value="empty">ยังไม่มีข้อมูล</option></select></label><button class="archive-add-button" id="add-case">＋ เพิ่มแฟ้มใหม่</button></div><div class="archive-count-row"><span><b id="archive-visible-count">${cases.length}</b> แฟ้ม</span><small>ชี้เมาส์เพื่อดูมิติ · คลิกหรือแตะเพื่อเปิด</small></div><div class="archive-grid" id="archive-grid">${cards}<button class="archive-create-card" id="archive-create"><span>＋</span><b>สร้างแฟ้มใหม่</b><small>เริ่มตรวจสอบ Statement ชุดใหม่</small></button></div><p class="archive-empty" id="archive-empty" hidden>ไม่พบแฟ้มที่ตรงกับการค้นหา</p>`;}
function filterArchiveCards(){const query=(document.querySelector('#case-search')?.value||'').trim().toLowerCase(),risk=document.querySelector('#case-risk-filter')?.value||'all';let count=0;document.querySelectorAll('.archive-file-card').forEach(card=>{const matchText=card.textContent.toLowerCase().includes(query),matchRisk=risk==='all'||card.classList.contains(`archive-${risk}`)||(risk==='empty'&&card.querySelector('.archive-risk>span').textContent==='ยังไม่มีข้อมูล'),hidden=!(matchText&&matchRisk);card.hidden=hidden;card.closest('.archive-file-shell').hidden=hidden;if(!hidden)count++;});const countEl=document.querySelector('#archive-visible-count');if(countEl)countEl.textContent=count;const empty=document.querySelector('#archive-empty');if(empty)empty.hidden=count!==0;}
function openView(view, scrollToTop=true) {
  if(!currentUser){ setUnauthenticated(); return; }
  if(view==='summary')view='transactions';
  state.view=view; home.hidden=view!=='home'; content.hidden=view==='home';
  if(view==='home'){renderCaseCarousel();return;}
  if(view==='models'){viewContent.innerHTML='<p class="loading-note">กำลังอ่านข้อมูลโมเดล…</p>';modelsView();}
  else if(view==='settings'){viewContent.innerHTML='<p class="loading-note">กำลังอ่านการตั้งค่า…</p>';settingsView();}
  else viewContent.innerHTML=view==='cases'?allCasesView():view==='overview'?overviewView():view==='transactions'?transactionsView():view==='upload'?uploadView():view==='login'?loginView():view==='users'?usersView():overviewView();
  document.querySelectorAll('.view-nav [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view)); if(scrollToTop) window.scrollTo({top:0,behavior:'smooth'});
}
function showScore(index) {
  const row=sampleRows[index]; if(!row)return; state.selected=row;
  let modal=document.querySelector('#score-modal');if(!modal){modal=document.createElement('div');modal.id='score-modal';modal.className='score-modal';modal.innerHTML='<section class="score-card" id="score-card"></section>';document.body.append(modal);}
  const card=modal.querySelector('#score-card');
  const details=[['เจ้าของข้อมูล',row.ownerName],['วันที่ทำรายการ',row.date],['เวลา',row.rawDate?new Date(row.rawDate).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}):'ไม่มีเวลาใน Statement'],['รายละเอียด',row.description],['ประเภท',row.type],['จำนวนเงิน',(isExpense(row)?'รายจ่าย ':'รายรับ ')+money(row.amount)],['ยอดคงเหลือ',row.balance==null||Number.isNaN(Number(row.balance))?'ไม่มีข้อมูล':money(row.balance)],['ระดับความเสี่ยง',row.level],['โมเดลที่ใช้',state.activeModel]];
  card.innerHTML=`<button class="close-score" aria-label="ปิด">×</button><span class="eyebrow">TRANSACTION DETAIL / CASE EVIDENCE</span><h3>${esc(row.description)}</h3><div class="detail-grid">${details.map(([k,v])=>`<div><small>${k}</small><b>${esc(v)}</b></div>`).join('')}</div><div class="detail-score"><span>RISK SCORE</span><b>${row.score}<small>/100</small></b></div><h4>ที่มาของคะแนน</h4><p>${esc(row.reasons)}</p><div class="score-factors">${row.factors.map(([label,score])=>`<div><span>${esc(label)}</span><b>+${Number(score||0).toFixed(1)}</b><i><em style="width:${Math.min(100,Math.max(0,Number(score||0)))}%"></em></i></div>`).join('')}</div><p class="score-disclaimer">คะแนนเกิดจาก Machine Learning และ anomaly score ใช้ประกอบการตรวจสอบ ไม่ใช่เปอร์เซ็นต์โอกาสเกิดการทุจริต</p>`;
  modal.hidden=false;
}
function showCaseScore(){const a=aggregateCaseScore(sampleRows);let modal=document.querySelector('#score-modal');if(!modal){modal=document.createElement('div');modal.id='score-modal';modal.className='score-modal';modal.innerHTML='<section class="score-card" id="score-card"></section>';document.body.append(modal);}const card=modal.querySelector('#score-card');card.innerHTML=`<button class="close-score" aria-label="ปิด">×</button><span class="eyebrow">CASE RISK PROFILE · ${esc(activeCase().name)}</span><h3>คะแนนภาพรวมแฟ้ม</h3><div class="detail-score"><span>ค่าเฉลี่ย Risk Score</span><b>${a.score}<small>/100</small></b></div><p>คำนวณจากค่าเฉลี่ยเลขคณิตของ Risk Score ทุกธุรกรรมในแฟ้ม: ผลรวมคะแนน ÷ ${a.total||0} รายการ คะแนนจึงเปลี่ยนเมื่อเพิ่มหรือลบธุรกรรม</p><h4 class="risk-level-heading">ระดับความเสี่ยง</h4><div class="case-score-breakdown"><span>HIGH RISK <b>${a.high}</b></span><span>SUSPICIOUS <b>${a.suspicious}</b></span><span>NORMAL <b>${a.normal}</b></span></div><p class="score-disclaimer">คะแนนภาพรวมเป็นตัวช่วยคัดกรองของแฟ้ม ไม่ใช่เปอร์เซ็นต์โอกาสเกิดการทุจริต · ใช้ข้อมูลทั้งหมดในแฟ้ม ไม่เปลี่ยนตามตัวกรองหน้าจอ</p>`;modal.hidden=false;}
let toastTimer;function toast(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2800);}
function resetChat(){state.chatHistory=[];const body=document.querySelector('.chat-body');if(body)body.innerHTML='<div class="assistant-message">สวัสดีครับ ต้องการให้ช่วยดูข้อมูลส่วนไหนในแฟ้มนี้?</div><div class="chat-suggestion">ลองถาม: รายการไหนมีความเสี่ยงสูง</div>';}
function caseFileNumber(item){return Number(item?.name?.match(/NO\.\s*(\d+)/i)?.[1]||1);}
function nextCaseNumber(){return Math.max(0,...cases.map(caseFileNumber))+1;}
function activateCase(id,direction=1){activeCaseId=id;sampleRows=activeCase().rows.map(normalizeRow);state.month='all';state.person='all';state.risk='ทั้งหมด';state.search='';state.expenseCategories=[];state.incomeOnly=false;resetChat();renderCaseCarousel();const scene=document.querySelector('.folder-scene');if(scene){scene.classList.remove('case-slide-next','case-slide-prev');void scene.offsetWidth;scene.classList.add(direction<0?'case-slide-prev':'case-slide-next');setTimeout(()=>scene.classList.remove('case-slide-next','case-slide-prev'),500);}}
function renameCase(id=activeCaseId){const item=cases.find(c=>c.id===id);if(!item)return;const entered=window.prompt('ตั้งชื่อแฟ้ม',item.name);if(entered===null)return;const name=entered.trim().slice(0,80);if(!name){toast('กรุณาใส่ชื่อแฟ้ม');return;}item.name=name;saveCases();renderCaseCarousel();if(state.view==='cases')openView('cases');toast(`เปลี่ยนชื่อแฟ้มเป็น “${name}” แล้ว`);}
function createCase(){const n=nextCaseNumber(),defaultName=`TRANSACTION REVIEW · NO. ${String(n).padStart(3,'0')}`,entered=window.prompt('ตั้งชื่อแฟ้มใหม่',defaultName);if(entered===null)return;const name=entered.trim().slice(0,80);if(!name){toast('กรุณาใส่ชื่อแฟ้ม');return;}const item={id:`case-${Date.now()}`,name,rows:[],files:[],source:'empty'};cases.push(item);activateCase(item.id);saveCases();toast('สร้างแฟ้มใหม่แล้ว · นำเข้า Statement เพื่อเริ่มตรวจสอบ');}
function deleteCase(id=activeCaseId){const item=cases.find(c=>c.id===id);if(!item)return;if(!window.confirm(`ลบแฟ้ม “${item.name}” พร้อมธุรกรรมและไฟล์นำเข้าทั้งหมดหรือไม่?`))return;const oldName=item.name,index=cases.findIndex(c=>c.id===id),wasActive=id===activeCaseId;cases.splice(index,1);if(!cases.length)cases.push({id:`case-${Date.now()}`,name:'TRANSACTION REVIEW',rows:[],files:[],source:'empty'});if(wasActive){activeCaseId=cases[Math.min(index,cases.length-1)].id;sampleRows=activeCase().rows.map(normalizeRow);state.person='all';state.month='all';state.search='';resetChat();}saveCases();renderCaseCarousel();if(state.view==='cases')openView('cases');toast(`ลบแฟ้ม ${oldName} แล้ว`);}
function deleteImportedFile(fileId){const item=activeCase().files?.find(f=>f.id===fileId);if(!item)return;if(!window.confirm(`ลบไฟล์ “${item.name}” และธุรกรรม ${item.count} รายการจากแฟ้มนี้หรือไม่?`))return;activeCase().files=activeCase().files.filter(f=>f.id!==fileId);sampleRows=sampleRows.filter(r=>r.sourceFileId!==fileId);activeCase().rows=sampleRows;if(!activeCase().files.length)activeCase().source=sampleRows.length?'sample':'empty';if(state.person===item.ownerName&&!sampleRows.some(r=>r.ownerName===state.person))state.person='all';saveCases();renderCaseCarousel();openView(state.view);toast(`ลบไฟล์ ${item.name} และธุรกรรมแล้ว`);}
function stepCase(direction){const current=cases.findIndex(c=>c.id===activeCaseId);if(direction<0&&current===0){toast('นี่คือแฟ้มแรกแล้ว');return;}if(direction>0&&current===cases.length-1){createCase();return;}activateCase(cases[current+direction].id,direction);}
async function loadTransactions(){try{const [r,s]=await Promise.all([fetch('/api/transactions'),fetch('/api/settings')]);if(s.ok){state.settings={...state.settings,...await s.json()};state.activeModel=state.settings.active_model||state.activeModel;}if(!r.ok)return;const data=await r.json();if(activeCase().source==='sample'&&Array.isArray(data.transactions)&&data.transactions.length){updateActiveRows(data.transactions.map(normalizeRow),'sample');if(state.view!=='home')openView(state.view);}}catch{}}
function selectFile(file){if(!file)return;state.file=file;const pdf=file.name.toLowerCase().endsWith('.pdf');const block=document.querySelector('#pdf-password-block');if(block)block.hidden=!pdf;const pass=document.querySelector('#pdf-password');if(pass)pass.value='';const preview=document.querySelector('#file-preview');if(preview){preview.hidden=false;preview.textContent=`▤ ${file.name} · ${(file.size/1024).toFixed(0)} KB${pdf?' · PDF':''}`;}const button=document.querySelector('#prepare-file');if(button)button.disabled=false;const err=document.querySelector('#upload-error');if(err)err.hidden=true;}
async function uploadStatement(){const file=state.file;if(!file||state.uploading)return;const error=document.querySelector('#upload-error'),button=document.querySelector('#prepare-file'),form=new FormData(),ownerName=document.querySelector('#owner-name')?.value.trim();if(!ownerName){error.textContent='กรอกชื่อเจ้าของข้อมูลก่อนนำเข้า';error.hidden=false;document.querySelector('#owner-name')?.focus();return;}form.append('file',file);const password=file.name.toLowerCase().endsWith('.pdf')?(document.querySelector('#pdf-password')?.value||''):'';if(password)form.append('pdf_password',password);state.uploading=true;button.disabled=true;button.textContent='กำลังเปิดและอ่านไฟล์…';error.hidden=true;try{const r=await fetch('/api/upload',{method:'POST',body:form});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.detail||'นำเข้าไฟล์ไม่สำเร็จ');appendCaseRows(data.transactions||[],ownerName,file.name);state.file=null;state.risk='ทั้งหมด';state.search='';state.month='all';state.person='all';state.expenseCategories=[];state.incomeOnly=false;openView('transactions');toast(`${data.message||`นำเข้าได้ ${(data.transactions||[]).length} รายการ`} · ${ownerName}`);}catch(e){error.textContent=e.message;error.hidden=false;button.disabled=false;button.textContent='ลองเปิดไฟล์อีกครั้ง';}finally{state.uploading=false;const p=document.querySelector('#pdf-password');if(p&&activeCase().source==='statement')p.value='';}}
function renderAiSummary(markdown){const lines=String(markdown||'').replace(/\r/g,'').split('\n'),out=[];let list='';const closeList=()=>{if(list){out.push(`</${list}>`);list='';}};const inline=value=>esc(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/(^|\s)\*(\S(?:.*?\S)?)\*(?=\s|$)/g,'$1<em>$2</em>');for(const raw of lines){const line=raw.trim();if(!line){closeList();continue;}const heading=line.match(/^#{1,3}\s+(.+)/);if(heading){closeList();out.push(`<h4>${inline(heading[1])}</h4>`);continue;}const bullet=line.match(/^[-*]\s+(.+)/);if(bullet){if(list!=='ul'){closeList();list='ul';out.push('<ul>');}out.push(`<li>${inline(bullet[1])}</li>`);continue;}const ordered=line.match(/^\d+[.)]\s+(.+)/);if(ordered){if(list!=='ol'){closeList();list='ol';out.push('<ol>');}out.push(`<li>${inline(ordered[1])}</li>`);continue;}if(/^[-_]{3,}$/.test(line)){closeList();out.push('<hr>');continue;}closeList();out.push(`<p>${inline(line)}</p>`);}closeList();return out.join('');}
async function runSummary(){const box=document.querySelector('#ai-summary-result'),button=document.querySelector('#ai-summary');if(!box||!button)return;box.hidden=false;if(!filteredRows().length){box.innerHTML='<b>แฟ้มนี้ยังไม่มีธุรกรรม</b><p>นำเข้า Statement ก่อน แล้วจึงให้ AI วิเคราะห์ภาพรวมได้</p>';return;}button.disabled=true;button.textContent='กำลังวิเคราะห์…';box.innerHTML='<span class="loading-pulse">AI กำลังอ่านข้อมูลธุรกรรมในแฟ้มนี้</span>';try{const r=await fetch('/api/ai/summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transactions:aiRows(filteredRows())})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.detail||'ไม่สามารถวิเคราะห์ได้');box.innerHTML=`<div class="ai-summary-title"><span>✳</span><div><b>สรุปจาก AI</b><small>วิเคราะห์จากข้อมูลธุรกรรมในแฟ้มนี้</small></div></div><div class="ai-summary-body">${renderAiSummary(d.summary)}</div>`;}catch(e){box.innerHTML=`<div class="ai-summary-title"><span>!</span><div><b>ยังเรียก AI ไม่ได้</b><small>ตรวจสอบการเชื่อมต่อ</small></div></div><div class="ai-summary-body"><p>${esc(e.message)} · ตรวจสอบการตั้งค่า AI ได้ แต่ตัวเลขในแฟ้มยังใช้งานได้</p></div>`;}finally{button.disabled=false;button.textContent='✳ วิเคราะห์ภาพรวมทั้งหมดด้วย AI';}}
async function saveSettings(){const err=document.querySelector('#settings-error');try{const body={suspicious_threshold:Number(document.querySelector('#setting-suspicious').value),high_threshold:Number(document.querySelector('#setting-high').value),active_model:state.activeModel,theme:document.querySelector('#setting-theme')?.value||state.settings.theme||'dark'};const r=await fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.detail||'บันทึกไม่สำเร็จ');state.settings={...state.settings,...d};applyTheme(body.theme);toast('บันทึกการตั้งค่าแล้ว');openView('settings');}catch(e){err.textContent=e.message;err.hidden=false;}}
async function sendChat(question){const body=document.querySelector('.chat-body');body.insertAdjacentHTML('beforeend',`<div class="user-message">${esc(question)}</div><div class="assistant-message typing-message">กำลังอ่านข้อมูลในแฟ้ม…</div>`);body.scrollTop=body.scrollHeight;const typing=body.querySelector('.typing-message:last-child');try{const r=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,history:state.chatHistory,transactions:aiRows(filteredRows())})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.detail||'AI ยังไม่พร้อมใช้งาน');typing.textContent=d.answer;state.chatHistory.push({role:'user',content:question},{role:'assistant',content:d.answer});state.chatHistory=state.chatHistory.slice(-8);}catch(e){typing.textContent=`ยังตอบไม่ได้: ${e.message}`;}body.scrollTop=body.scrollHeight;}

document.addEventListener('click',event=>{
  if(document.documentElement.dataset.theme==='mermaid' && !event.target.closest('input,select,textarea')) mermaidGlitter(event.clientX,event.clientY);
  const viewButton=event.target.closest('[data-view]');if(viewButton){event.preventDefault();openView(viewButton.dataset.view);return;}
  const caseButton=event.target.closest('[data-case]');if(caseButton){if(caseButton.dataset.case==='__new_case__'){createCase();return;}activateCase(caseButton.dataset.case,cases.findIndex(c=>c.id===caseButton.dataset.case)<cases.findIndex(c=>c.id===activeCaseId)?-1:1);toast(`เปิด ${activeCase().name}`);return;}
  const renameButton=event.target.closest('[data-rename-case]');if(renameButton){renameCase(renameButton.dataset.renameCase);return;}
  const deleteCaseButton=event.target.closest('[data-delete-case]');if(deleteCaseButton){deleteCase(deleteCaseButton.dataset.deleteCase);return;}
  if(event.target.closest('#rename-case')){renameCase();return;}
  const archiveCard=event.target.closest('[data-open-case]');if(archiveCard){const id=archiveCard.dataset.openCase;activateCase(id,cases.findIndex(c=>c.id===id)<cases.findIndex(c=>c.id===activeCaseId)?-1:1);openView('overview');return;}
  if(event.target.closest('#add-case')){createCase();return;}
  if(event.target.closest('#archive-create')){createCase();return;}
  if(event.target.closest('#delete-case')){deleteCase();return;}
  if(event.target.closest('#folder-prev')){stepCase(-1);return;}if(event.target.closest('#folder-next')){stepCase(1);return;}
  if(event.target.closest('#ai-summary')){runSummary();return;}
  if(event.target.closest('#case-score-badge')){showCaseScore();return;}
  const deleteFile=event.target.closest('[data-delete-file]');if(deleteFile){deleteImportedFile(deleteFile.dataset.deleteFile);return;}
  const model=event.target.closest('[data-model]');if(model){state.activeModel=model.dataset.model;fetch('/api/settings').then(r=>r.json()).then(s=>{state.settings={...state.settings,...s};return fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...state.settings,active_model:state.activeModel})});}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.detail||'บันทึกไม่ได้');if(sampleRows.length){const oldRows=[...sampleRows];const scored=await fetch('/api/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({transactions:sampleRows.map(x=>({transaction_date:x.rawDate||x.date,description:x.description,amount:x.amount,transaction_type:x.transaction_type||x.type,balance:x.balance,account:x.account}))})});const result=await scored.json().catch(()=>({}));if(scored.ok)updateActiveRows((result.transactions||[]).map((x,i)=>normalizeRow({...x,ownerName:oldRows[i]?.ownerName||'บุคคลที่ 1'})),activeCase().source);}toast('เลือกโมเดลและคำนวณคะแนนในแฟ้มนี้แล้ว');modelsView();}).catch(e=>toast(e.message));return;}
  const row=event.target.closest('[data-row]');if(row){showScore(Number(row.dataset.row));return;}
  if(event.target.closest('#ai-fab')){document.querySelector('#chat-panel').hidden=false;return;}if(event.target.closest('#chat-close')){document.querySelector('#chat-panel').hidden=true;return;}
  if(event.target.id==='file-input')return;if(event.target.closest('#choose-file')||event.target.closest('#drop-zone')){if(!event.target.closest('button')||event.target.closest('#choose-file')){event.preventDefault();document.querySelector('#file-input')?.click();}return;}
  if(event.target.closest('#prepare-file')){uploadStatement();return;}if(event.target.closest('#toggle-password')){const input=document.querySelector('#pdf-password'),button=document.querySelector('#toggle-password');if(input){input.type=input.type==='password'?'text':'password';button.textContent=input.type==='password'?'แสดง':'ซ่อน';}return;}
  if(event.target.closest('#save-settings')){saveSettings();return;}if(event.target.closest('.close-score')||event.target.id==='score-modal'){document.querySelector('#score-modal').hidden=true;}
});
document.addEventListener('input',event=>{if(event.target.id==='search-input'){state.search=event.target.value;const pos=event.target.selectionStart;openView('transactions');const input=document.querySelector('#search-input');input?.focus();input?.setSelectionRange(pos,pos);}});
document.addEventListener('input',event=>{if(event.target.id==='case-search')filterArchiveCards();});
document.addEventListener('change',event=>{
  if(event.target.id==='case-risk-filter')filterArchiveCards();
  if(event.target.id==='risk-filter'){state.risk=event.target.value;openView('transactions');}
  if(event.target.id==='month-filter'){state.month=event.target.value;openView(state.view);}
  if(event.target.id==='person-filter'){state.person=event.target.value;openView(state.view);}
  if(event.target.id==='file-input')selectFile(event.target.files[0]);
  if(event.target.classList.contains('expense-check')){const checks=[...document.querySelectorAll('.expense-check')],selected=checks.filter(x=>x.checked).map(x=>x.value);state.expenseCategories=selected.length===checks.length?null:selected;openView('transactions',false);}
  if(event.target.id==='income-filter'){state.incomeOnly=event.target.checked;openView('transactions',false);}
  if(event.target.id==='expense-all'){state.expenseCategories=event.target.checked?null:[];openView('transactions',false);}
  if(event.target.id==='setting-theme'){applyTheme(event.target.value);}
});
const archivePointerRects=new WeakMap();
document.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;const shell=event.target.closest('.archive-file-shell');if(shell&&!shell.contains(event.relatedTarget)){const card=shell.querySelector('.archive-file-card');if(card)archivePointerRects.set(shell,card.getBoundingClientRect());}});
document.addEventListener('pointermove',event=>{const shell=event.target.closest('.archive-file-shell');if(!shell||event.pointerType==='touch')return;const card=shell.querySelector('.archive-file-card');if(!card)return;let rect=archivePointerRects.get(shell);if(!rect){rect=card.getBoundingClientRect();archivePointerRects.set(shell,rect);}const x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;card.style.setProperty('--tilt-x',`${((x-.5)*6).toFixed(2)}deg`);card.style.setProperty('--tilt-y',`${((.5-y)*5).toFixed(2)}deg`);});
document.addEventListener('pointerout',event=>{const shell=event.target.closest('.archive-file-shell');if(shell&&!shell.contains(event.relatedTarget)){const card=shell.querySelector('.archive-file-card');if(card){card.style.removeProperty('--tilt-x');card.style.removeProperty('--tilt-y');}archivePointerRects.delete(shell);}});
document.addEventListener('dragover',event=>{if(event.target.closest('#drop-zone')){event.preventDefault();event.target.closest('#drop-zone').classList.add('drag-active');}});
document.addEventListener('dragleave',event=>event.target.closest('#drop-zone')?.classList.remove('drag-active'));
document.addEventListener('drop',event=>{if(!event.target.closest('#drop-zone'))return;event.preventDefault();const f=event.dataTransfer.files[0];if(!f)return;const input=document.querySelector('#file-input');try{const dt=new DataTransfer();dt.items.add(f);input.files=dt.files;}catch{}selectFile(f);});
const folderScene=document.querySelector('.folder-scene');let folderPointer=null;
folderScene?.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;folderPointer={x:event.clientX,y:event.clientY};});
folderScene?.addEventListener('pointerup',event=>{if(!folderPointer)return;const dx=event.clientX-folderPointer.x,dy=event.clientY-folderPointer.y;folderPointer=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.25)stepCase(dx<0?1:-1);});
folderScene?.addEventListener('pointercancel',()=>{folderPointer=null;});
folderScene?.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){stepCase(-1);event.preventDefault();}if(event.key==='ArrowRight'){stepCase(1);event.preventDefault();}});
document.querySelector('#chat-form').addEventListener('submit',event=>{event.preventDefault();const input=document.querySelector('#chat-input'),q=input.value.trim();if(!q)return;input.value='';sendChat(q);});
renderCaseCarousel();loadTransactions();

