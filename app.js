/* ═══════════════════════════════════════════════════════
   FIVE PINTS IN — Flyer Studio v5 (full feature set)
   ═══════════════════════════════════════════════════════ */

const FMT={'ig-post':{w:1080,h:1080},'ig-story':{w:1080,h:1920},'fb-event':{w:1200,h:628},'a5':{w:1748,h:2480}};
const PAL={bg:'#0a0a0a',text:'#f0ebe6',accent:'#e63946',muted:'#a8a29e',dim:'#6b6662',bdr:'rgba(230,57,70,0.18)',bdrL:'rgba(230,57,70,0.08)',glow:'rgba(230,57,70,0.30)'};
const SWATCHES=['#f0ebe6','#ffffff','#e63946','#9b1b30','#d4a574','#a8a29e','#8ecae6','#00f5d4','#9b5de5','#fb8500'];
const BG_CLRS={red:{p:[230,57,70]},blue:{p:[58,134,255]},purple:{p:[155,93,229]},green:{p:[6,214,160]},orange:{p:[251,133,0]},pink:{p:[255,0,110]},cyan:{p:[0,200,255]},white:{p:[200,200,200]}};
const FONTS=[
  {id:'bebas',f:'"Bebas Neue",Impact,sans-serif',w:'700',l:'Bebas Neue'},
  {id:'anton',f:'"Anton",sans-serif',w:'400',l:'Anton'},
  {id:'oswald',f:'"Oswald",sans-serif',w:'600',l:'Oswald'},
  {id:'montserrat',f:'"Montserrat",sans-serif',w:'800',l:'Montserrat'},
  {id:'poppins',f:'"Poppins",sans-serif',w:'700',l:'Poppins'},
  {id:'playfair',f:'"Playfair Display",Georgia,serif',w:'700',l:'Playfair Display'},
  {id:'marker',f:'"Permanent Marker",cursive',w:'400',l:'Permanent Marker'},
];
const DFLT={bandName:'FIVE PINTS IN',slogan:'',date:'',doors:'',doorsLabel:'DOORS',price:'',venue:'',address:'',social1:'',social2:'',
  bandLogo:null,venueLogo:null,logoSize:100,logoX:50,logoY:8,vLogoSize:100,vLogoX:50,vLogoY:90,
  bgImage:null,bgDarken:50,bgBlur:0,bgFit:'cover',bgStyle:'none',bgClr:'red',bgFilter:'none',bgOverlay:false,bgOverlayOp:40,
  bgPanX:50,bgPanY:50,
  bandFont:'bebas',bandColor:'#f0ebe6',dateFont:'montserrat',dateColor:'#e63946',venueFont:'bebas',venueColor:'#f0ebe6',
  textBandSize:100,textBandY:30,textDateSize:100,textDateY:50,textVenueSize:100,textVenueY:66,
  social1Icon:'instagram',social2Icon:'instagram',
  qrUrl:'',qrSize:80,qrX:85,qrY:88,
  borderStyle:'ornate',borderColor:'#e63946',borderWidth:100};

// ── STATE ──
let S={...DFLT};
let curF='ig-post',venues=[],saved=[],templates=[],iC={},noiseC=null,bgCC={k:'',c:null},rT=null;

// ── UNDO/REDO ──
let hist=[],histIdx=-1,histPaused=false;
const MAX_HIST=30;
function cloneS(){const c={...S};delete c.bandLogo;delete c.bgImage;delete c.venueLogo;return JSON.stringify(c);}
function pushHist(){
  if(histPaused)return;
  const snap=cloneS();
  if(histIdx>=0&&hist[histIdx]===snap)return; // no change
  hist=hist.slice(0,histIdx+1);
  hist.push(snap);
  if(hist.length>MAX_HIST)hist.shift();
  histIdx=hist.length-1;
  syncUndoBtn();
}
function undo(){
  if(histIdx<=0)return;
  histIdx--;histPaused=true;
  Object.assign(S,{...DFLT,...JSON.parse(hist[histIdx]),bandLogo:S.bandLogo,bgImage:S.bgImage,venueLogo:S.venueLogo});
  syncAll();histPaused=false;syncUndoBtn();saveDraft();toast('Undo');
}
function redo(){
  if(histIdx>=hist.length-1)return;
  histIdx++;histPaused=true;
  Object.assign(S,{...DFLT,...JSON.parse(hist[histIdx]),bandLogo:S.bandLogo,bgImage:S.bgImage,venueLogo:S.venueLogo});
  syncAll();histPaused=false;syncUndoBtn();saveDraft();toast('Redo');
}
function syncAll(){syncForm();refUp('bl',S.bandLogo);refUp('vl',S.venueLogo);refBg();showEl('bl-ctrl',!!S.bandLogo);showEl('vl-ctrl',!!S.venueLogo);syncQrCtrl();syncBgPan();bgCC.k='';schedRender();}
function syncUndoBtn(){$('tb-undo').disabled=histIdx<=0;$('tb-redo').disabled=histIdx>=hist.length-1;}

const TF=['bandName','slogan','date','doors','doorsLabel','price','venue','address','social1','social2','qrUrl'];
const RF=['logoSize','logoX','logoY','vLogoSize','vLogoX','vLogoY','bgDarken','bgBlur','bgOverlayOp','bgPanX','bgPanY','textBandSize','textBandY','textDateSize','textDateY','textVenueSize','textVenueY','qrSize','qrX','qrY','borderWidth'];
const SF=['bgFit','bgFilter','bandFont','dateFont','venueFont'];

// ── THEME ──
const THEME_ORDER=['light','dark','system'];
let curTheme='system';
const THEME_ICONS={
  light:'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  dark:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  system:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'
};
function applyTheme(pref){
  curTheme=pref;
  const dark=pref==='dark'||(pref==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);
  document.documentElement.setAttribute('data-theme',dark?'dark':'light');
  const ico=$('theme-icon');
  if(ico)ico.innerHTML=THEME_ICONS[pref];
  const btn=$('btn-theme');
  if(btn)btn.title=pref==='system'?'Theme: System':'Theme: '+pref.charAt(0).toUpperCase()+pref.slice(1);
}
function cycleTheme(){
  const i=(THEME_ORDER.indexOf(curTheme)+1)%THEME_ORDER.length;
  applyTheme(THEME_ORDER[i]);
  dbSet('fpi_theme',THEME_ORDER[i],'theme');
  toast('Theme: '+THEME_ORDER[i]);
}
async function loadTheme(){
  try{const t=await idbGet('fpi_theme');if(t&&THEME_ORDER.includes(t))applyTheme(t);}catch(e){}
}
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(curTheme==='system')applyTheme('system');});

// ── INIT ──
document.addEventListener('DOMContentLoaded',async()=>{
  buildSwatches();buildFontSelects();buildBgClrRow();
  await loadStore();await loadTheme();bindAll();popVenues();
  refUp('bl',S.bandLogo);refUp('vl',S.venueLogo);refBg();
  showEl('bl-ctrl',S.bandLogo);showEl('vl-ctrl',S.venueLogo);
  syncSliders();syncChips();syncSwatches();syncOverlay();syncQrCtrl();syncBgPan();
  pushHist(); // initial state
  syncMobileLayout();
  document.fonts.ready.then(()=>schedRender());
});

// ── BUILD UI ──
function buildSwatches(){
  document.querySelectorAll('.sw-row[data-target]').forEach(row=>{
    const t=row.dataset.target;
    SWATCHES.forEach(c=>{
      const d=document.createElement('div');d.className='sw';d.dataset.color=c;d.dataset.target=t;
      d.style.background=c;d.addEventListener('click',()=>{S[t]=c;syncSwatches();saveDraft();schedRender();});
      row.appendChild(d);
    });
  });
}
function buildFontSelects(){
  ['bandFont','dateFont','venueFont'].forEach(k=>{
    const sel=$('f-'+k);if(!sel)return;
    FONTS.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.l;sel.appendChild(o);});
  });
}
function buildBgClrRow(){
  const row=$('bg-clr-row');
  Object.keys(BG_CLRS).forEach(k=>{
    const p=BG_CLRS[k].p;
    const d=document.createElement('div');d.className='sw';d.dataset.bgclr=k;
    d.style.background=`rgb(${p.join(',')})`;
    d.addEventListener('click',()=>{S.bgClr=k;syncBgClr();bgCC.k='';saveDraft();schedRender();});
    row.appendChild(d);
  });
}
function syncSwatches(){document.querySelectorAll('.sw-row[data-target]').forEach(row=>{const t=row.dataset.target;row.querySelectorAll('.sw').forEach(s=>s.classList.toggle('on',s.dataset.color===S[t]));});}
function syncBgClr(){document.querySelectorAll('#bg-clr-row .sw').forEach(s=>s.classList.toggle('on',s.dataset.bgclr===S.bgClr));}
function syncChips(){
  document.querySelectorAll('#stg .stc').forEach(c=>c.classList.toggle('on',c.dataset.s===S.bgStyle));
  document.querySelectorAll('#bdr-stg .stc').forEach(c=>c.classList.toggle('on',c.dataset.bs===S.borderStyle));
  document.querySelectorAll('.fmt').forEach(b=>b.classList.toggle('on',b.dataset.fmt===curF));
  ['1','2'].forEach(n=>{
    const v=S['social'+n+'Icon'];
    $('s'+n+'-ig').classList.toggle('on',v==='instagram');
    $('s'+n+'-fb').classList.toggle('on',v==='facebook');
  });
  // PDF button only for A5
  $('btn-ex-pdf').style.display=curF==='a5'?'':'none';
}
function syncOverlay(){$('overlay-op-wrap').style.display=S.bgOverlay?'':'none';}
function syncQrCtrl(){$('qr-ctrl').style.display=S.qrUrl&&S.qrUrl.trim()?'':'none';}
function syncBgPan(){$('bgPan-ctrl').style.display=(S.bgImage&&S.bgFit==='cover')?'':'none';}

// ── STORAGE (IndexedDB) ──
const DB_NAME='fpi_studio',DB_VER=1,DB_STORE='kv';
let db=null;
function openDB(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open(DB_NAME,DB_VER);
    r.onupgradeneeded=()=>r.result.createObjectStore(DB_STORE);
    r.onsuccess=()=>{db=r.result;res(db);};
    r.onerror=()=>rej(r.error);
  });
}
function idbGet(k){
  return new Promise((res,rej)=>{
    const tx=db.transaction(DB_STORE,'readonly');
    const r=tx.objectStore(DB_STORE).get(k);
    r.onsuccess=()=>res(r.result);
    r.onerror=()=>rej(r.error);
  });
}
function idbSet(k,v){
  return new Promise((res,rej)=>{
    const tx=db.transaction(DB_STORE,'readwrite');
    const r=tx.objectStore(DB_STORE).put(v,k);
    tx.oncomplete=()=>res(true);
    tx.onerror=()=>rej(tx.error);
  });
}
function idbDel(k){
  return new Promise((res,rej)=>{
    const tx=db.transaction(DB_STORE,'readwrite');
    const r=tx.objectStore(DB_STORE).delete(k);
    tx.oncomplete=()=>res();
    tx.onerror=()=>rej(tx.error);
  });
}
let quotaWarned=false;
function dbSet(k,v,label){
  idbSet(k,v).catch(e=>{
    if(!quotaWarned){toast('Storage full — export a backup and delete unused '+(label||'items'));quotaWarned=true;setTimeout(()=>{quotaWarned=false;},8000);}
    else console.error('DB write failed',k,e);
  });
}
async function loadStore(){
  try{
    await openDB();
    const d=await idbGet('fpi_draft');if(d)Object.assign(S,d);
    venues=await idbGet('fpi_venues')||[];
    saved=await idbGet('fpi_flyers')||[];
    templates=await idbGet('fpi_tpls')||[];
    const bl=await idbGet('fpi_bandLogo');if(bl)S.bandLogo=bl;
    const bg=await idbGet('fpi_bgImage');if(bg)S.bgImage=bg;
  }catch(e){console.error('loadStore',e);}
  syncForm();
}
function saveDraft(){
  const d={...S};delete d.bandLogo;delete d.bgImage;
  dbSet('fpi_draft',d,'drafts');
  if(S.bandLogo)dbSet('fpi_bandLogo',S.bandLogo,'images');else idbDel('fpi_bandLogo').catch(()=>{});
  if(S.bgImage)dbSet('fpi_bgImage',S.bgImage,'images');else idbDel('fpi_bgImage').catch(()=>{});
  pushHist();
}
function saveFly(){dbSet('fpi_flyers',saved,'saved flyers');}
function saveTpls(){dbSet('fpi_tpls',templates,'templates');}

function syncForm(){
  TF.forEach(k=>{const e=$('f-'+k);if(e)e.value=S[k]||'';});
  RF.forEach(k=>{const e=$('f-'+k);if(e)e.value=S[k]??e.defaultValue;});
  SF.forEach(k=>{const e=$('f-'+k);if(e)e.value=S[k]||'';});
  $('f-bgOverlay').checked=!!S.bgOverlay;
  syncSliders();syncSwatches();syncBgClr();syncChips();syncOverlay();syncQrCtrl();syncBgPan();
}
function syncSliders(){document.querySelectorAll('.sv').forEach(sp=>{const inp=$(sp.id.replace('val-','f-'));if(inp)sp.textContent=inp.id.includes('Blur')?inp.value+'px':inp.value+'%';});}

// ── EVENTS ──
function switchEdTab(tab){
  document.querySelectorAll('.ed-tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===tab));
  document.querySelectorAll('.ed-panel').forEach(p=>p.classList.toggle('on',p.dataset.panel===tab));
  // scroll sidebar to top on tab switch
  const ed=$('ed');if(ed)ed.scrollTop=0;
}
function bindAll(){
  document.querySelectorAll('.ed-tab').forEach(t=>t.addEventListener('click',()=>switchEdTab(t.dataset.tab)));
  TF.forEach(k=>{const e=$('f-'+k);if(e)e.addEventListener('input',()=>{S[k]=e.value;saveDraft();schedRender();if(k==='qrUrl')syncQrCtrl();});});
  RF.forEach(k=>{const e=$('f-'+k);if(e)e.addEventListener('input',()=>{S[k]=parseFloat(e.value);syncSliders();saveDraft();schedRender();});});
  SF.forEach(k=>{const e=$('f-'+k);if(e)e.addEventListener('change',()=>{S[k]=e.value;bgCC.k='';saveDraft();schedRender();if(k==='bgFit')syncBgPan();});});
  $('f-bgOverlay').addEventListener('change',()=>{S.bgOverlay=$('f-bgOverlay').checked;syncOverlay();saveDraft();schedRender();});
  document.querySelectorAll('.fmt').forEach(b=>b.addEventListener('click',()=>{curF=b.dataset.fmt;bgCC.k='';syncChips();schedRender();}));
  document.querySelectorAll('#stg .stc').forEach(c=>c.addEventListener('click',()=>{S.bgStyle=c.dataset.s;bgCC.k='';syncChips();saveDraft();schedRender();}));
  document.querySelectorAll('#bdr-stg .stc').forEach(c=>c.addEventListener('click',()=>{S.borderStyle=c.dataset.bs;syncChips();saveDraft();schedRender();}));
  setupFileUp('bl','bandLogo','fpi_bandLogo','bl-ctrl');
  setupFileUp('vl','venueLogo',null,'vl-ctrl');
  setupBgFileUp();
  $('f-venuePreset').addEventListener('change',loadVen);
  $('btn-sv').addEventListener('click',saveVenue);
  $('btn-ex').addEventListener('click',exportFlyer);
  $('btn-ex-all').addEventListener('click',exportAll);
  $('btn-ex-pdf').addEventListener('click',exportPDF);
  $('btn-copy').addEventListener('click',copyToClipboard);
  $('btn-sfl').addEventListener('click',saveCurFlyer);
  $('btn-nf').addEventListener('click',newFlyer);
  $('btn-sf').addEventListener('click',()=>openMo('mo-fl'));
  $('mo-fl-x').addEventListener('click',()=>closeMo('mo-fl'));
  $('mo-fl').addEventListener('click',e=>{if(e.target.id==='mo-fl')closeMo('mo-fl');});
  $('btn-exp-fl').addEventListener('click',()=>exportBackup('flyers'));
  $('btn-imp-fl').addEventListener('click',()=>$('f-imp-fl').click());
  $('f-imp-fl').addEventListener('change',e=>{importBackup(e.target.files[0],'flyers');e.target.value='';});
  // Templates
  $('btn-tpl').addEventListener('click',()=>openMo('mo-tpl'));
  $('mo-tpl-x').addEventListener('click',()=>closeMo('mo-tpl'));
  $('mo-tpl').addEventListener('click',e=>{if(e.target.id==='mo-tpl')closeMo('mo-tpl');});
  $('btn-save-tpl').addEventListener('click',saveAsTemplate);
  $('btn-exp-tpl').addEventListener('click',()=>exportBackup('templates'));
  $('btn-imp-tpl').addEventListener('click',()=>$('f-imp-tpl').click());
  $('f-imp-tpl').addEventListener('change',e=>{importBackup(e.target.files[0],'templates');e.target.value='';});
  // Assets (placeholder)
  $('btn-assets').addEventListener('click',()=>toast('Assets coming soon'));
  // Theme
  $('btn-theme').addEventListener('click',cycleTheme);
  // Shortcuts
  $('btn-kb').addEventListener('click',()=>openMo('mo-kb'));
  $('mo-kb-x').addEventListener('click',()=>closeMo('mo-kb'));
  $('mo-kb').addEventListener('click',e=>{if(e.target.id==='mo-kb')closeMo('mo-kb');});
  // Undo/Redo (canvas toolbar)
  $('tb-undo').addEventListener('click',undo);
  $('tb-redo').addEventListener('click',redo);
  // Format grid toggle
  $('tb-fmt').addEventListener('click',()=>{
    const fb=$('fb');fb.classList.toggle('fb-hidden');
    $('tb-fmt').classList.toggle('on',!fb.classList.contains('fb-hidden'));
  });
  // Zoom button — reset zoom on click
  $('tb-zoom').addEventListener('click',()=>{pvZoom=1;pvPanX=0;pvPanY=0;applyZoom();});
  // Close format bar when clicking outside
  document.addEventListener('click',e=>{
    const fb=$('fb'),btn=$('tb-fmt');
    if(!fb.classList.contains('fb-hidden')&&!fb.contains(e.target)&&!btn.contains(e.target)){
      fb.classList.add('fb-hidden');btn.classList.remove('on');
    }
  });
  // Download modal
  $('btn-dl').addEventListener('click',()=>openMo('mo-dl'));
  $('mo-dl-x').addEventListener('click',()=>closeMo('mo-dl'));
  $('mo-dl').addEventListener('click',e=>{if(e.target.id==='mo-dl')closeMo('mo-dl');});
  // Keyboard shortcuts
  document.addEventListener('keydown',handleKey);
  // Resize
  window.addEventListener('resize',()=>{schedRender();syncMobileLayout();});
  // Preview zoom
  setupZoom();
  // Mobile tabs
  setupMobileTabs();
}

// ── MOBILE TAB SWITCHING ──
let mobPanel='ed';
function setupMobileTabs(){
  document.querySelectorAll('.mob-tab').forEach(t=>t.addEventListener('click',()=>{
    mobPanel=t.dataset.panel;
    document.querySelectorAll('.mob-tab').forEach(b=>b.classList.toggle('on',b.dataset.panel===mobPanel));
    syncMobilePanel();
    if(mobPanel==='pp')schedRender();
  }));
}
function syncMobilePanel(){
  const isMob=window.innerWidth<=840;
  if(!isMob){$('ed').classList.remove('mob-hidden');$('pp').classList.remove('mob-hidden');return;}
  $('ed').classList.toggle('mob-hidden',mobPanel!=='ed');
  $('pp').classList.toggle('mob-hidden',mobPanel!=='pp');
}
function syncMobileLayout(){
  const isMob=window.innerWidth<=840;
  if(!isMob){$('ed').classList.remove('mob-hidden');$('pp').classList.remove('mob-hidden');}
  else syncMobilePanel();
}

// ── KEYBOARD SHORTCUTS ──
function handleKey(e){
  const tag=document.activeElement?.tagName;
  const inInput=tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA';
  const mod=e.ctrlKey||e.metaKey;
  if(mod&&e.key==='z'&&!e.shiftKey){e.preventDefault();undo();return;}
  if(mod&&e.key==='z'&&e.shiftKey){e.preventDefault();redo();return;}
  if(mod&&e.key==='Z'){e.preventDefault();redo();return;}
  if(mod&&e.key==='s'){e.preventDefault();saveCurFlyer();return;}
  if(mod&&e.key==='e'&&!e.shiftKey){e.preventDefault();exportFlyer();return;}
  if(mod&&e.key==='e'&&e.shiftKey){e.preventDefault();exportAll();return;}
  if(mod&&e.key==='E'){e.preventDefault();exportAll();return;}
  if(mod&&e.key==='c'&&e.shiftKey){e.preventDefault();copyToClipboard();return;}
  if(mod&&e.key==='C'){e.preventDefault();copyToClipboard();return;}
  if(!inInput&&!mod){
    const fmtKeys={'1':'ig-post','2':'ig-story','3':'fb-event','4':'a5'};
    if(fmtKeys[e.key]){curF=fmtKeys[e.key];bgCC.k='';syncChips();schedRender();return;}
  }
}

// ── PREVIEW ZOOM ──
let pvZoom=1,pvPanX=0,pvPanY=0,isPanning=false,panStart=null,pinchDist0=null;
function setupZoom(){
  const cw=$('cw');
  // Mouse wheel zoom
  cw.addEventListener('wheel',e=>{
    e.preventDefault();
    const delta=e.deltaY>0?-0.15:0.15;
    pvZoom=Math.max(.3,Math.min(4,pvZoom+delta));
    if(Math.abs(pvZoom-1)<.05){pvZoom=1;pvPanX=0;pvPanY=0;}
    applyZoom();
  },{passive:false});
  // Mouse drag pan
  cw.addEventListener('mousedown',e=>{
    if(pvZoom<=1&&pvPanX===0&&pvPanY===0)return;
    isPanning=true;panStart={x:e.clientX-pvPanX,y:e.clientY-pvPanY};
    cw.classList.add('panning');
  });
  window.addEventListener('mousemove',e=>{
    if(!isPanning)return;
    pvPanX=e.clientX-panStart.x;pvPanY=e.clientY-panStart.y;
    applyZoom();
  });
  window.addEventListener('mouseup',()=>{isPanning=false;$('cw').classList.remove('panning');});
  cw.addEventListener('dblclick',()=>{pvZoom=1;pvPanX=0;pvPanY=0;applyZoom();});

  // ── TOUCH: pinch-to-zoom + drag-to-pan ──
  cw.addEventListener('touchstart',e=>{
    if(e.touches.length===2){
      e.preventDefault();
      pinchDist0=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    }else if(e.touches.length===1&&pvZoom>1){
      isPanning=true;
      panStart={x:e.touches[0].clientX-pvPanX,y:e.touches[0].clientY-pvPanY};
      cw.classList.add('panning');
    }
  },{passive:false});
  cw.addEventListener('touchmove',e=>{
    if(e.touches.length===2&&pinchDist0!==null){
      e.preventDefault();
      const dist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      const scale=dist/pinchDist0;
      pvZoom=Math.max(.3,Math.min(4,pvZoom*scale));
      pinchDist0=dist;
      if(Math.abs(pvZoom-1)<.05){pvZoom=1;pvPanX=0;pvPanY=0;}
      applyZoom();
    }else if(e.touches.length===1&&isPanning){
      e.preventDefault();
      pvPanX=e.touches[0].clientX-panStart.x;
      pvPanY=e.touches[0].clientY-panStart.y;
      applyZoom();
    }
  },{passive:false});
  cw.addEventListener('touchend',e=>{
    if(e.touches.length<2)pinchDist0=null;
    if(e.touches.length===0){isPanning=false;cw.classList.remove('panning');}
  });
}
function applyZoom(){
  const cv=$('cv'),cw=$('cw'),badge=$('zoom-badge');
  cv.style.transform=`scale(${pvZoom}) translate(${pvPanX/pvZoom}px,${pvPanY/pvZoom}px)`;
  cw.classList.toggle('zoomed',pvZoom>1);
  badge.textContent=Math.round(pvZoom*100)+'%';
  badge.classList.toggle('show',Math.abs(pvZoom-1)>.01);
  const tbz=$('tb-zoom-val');if(tbz)tbz.textContent=Math.round(pvZoom*100)+'%';
}

// ── FILE UPLOADS ──
function setupFileUp(pre,sk,lsk,ctrl){
  const inp=$('f-'+(pre==='bl'?'bandLogo':'venueLogo')),area=$(pre+'-area'),clr=$(pre+'-clr');
  area.addEventListener('click',e=>{if(!clr.contains(e.target))inp.click();});
  inp.addEventListener('change',async()=>{if(!inp.files[0])return;S[sk]=await f2d(inp.files[0]);if(lsk)dbSet(lsk,S[sk],'images');showEl(ctrl,true);saveDraft();refUp(pre,S[sk]);schedRender();});
  clr.addEventListener('click',e=>{e.stopPropagation();S[sk]=null;inp.value='';if(lsk)idbDel(lsk).catch(()=>{});showEl(ctrl,false);saveDraft();refUp(pre,null);schedRender();});
}
function setupBgFileUp(){
  const inp=$('f-bgImage'),area=$('bg-area'),clr=$('bg-clr');
  area.addEventListener('click',e=>{if(!clr.contains(e.target))inp.click();});
  inp.addEventListener('change',async()=>{if(!inp.files[0])return;S.bgImage=await f2d(inp.files[0]);bgCC.k='';saveDraft();refBg();syncBgPan();schedRender();});
  clr.addEventListener('click',e=>{e.stopPropagation();S.bgImage=null;inp.value='';bgCC.k='';saveDraft();refBg();syncBgPan();schedRender();});
}
function refUp(pre,src){
  const p=$(pre+'-prev'),l=$(pre+'-lbl'),c=$(pre+'-clr');
  if(src){p.innerHTML=`<img src="${src}">`;l.textContent='Change...';c.style.display='';}
  else{p.innerHTML='<span style="color:var(--txM);font-size:14px">+</span>';l.textContent='Upload or paste URL...';c.style.display='none';}
}
function refBg(){
  const p=$('bg-prev'),l=$('bg-lbl'),c=$('bg-clr');
  if(S.bgImage){p.innerHTML=`<img src="${S.bgImage}">`;l.textContent='Change...';c.style.display='';}
  else{p.innerHTML='<span style="color:var(--txM);font-size:12px">+</span>';l.textContent='Custom image...';c.style.display='none';}
}

// ── URL LOADING ──
async function loadLogoUrl(which){
  const urlEl=$(which==='band'?'bl-url':'vl-url');
  const url=urlEl.value.trim();if(!url){toast('Paste a URL first');return;}
  toast('Loading...');
  try{
    const du=await fetchImgUrl(url);
    if(which==='band'){S.bandLogo=du;dbSet('fpi_bandLogo',du,'images');showEl('bl-ctrl',true);refUp('bl',du);}
    else{S.venueLogo=du;showEl('vl-ctrl',true);refUp('vl',du);}
    saveDraft();schedRender();toast('Image loaded');urlEl.value='';
  }catch(e){toast('Failed to load image');}
}
async function loadBgUrl(){
  const url=$('bg-url').value.trim();if(!url){toast('Paste a URL first');return;}
  toast('Loading...');
  try{S.bgImage=await fetchImgUrl(url);bgCC.k='';saveDraft();refBg();syncBgPan();schedRender();toast('Image loaded');$('bg-url').value='';}
  catch(e){toast('Failed to load image');}
}
function fetchImgUrl(url){return new Promise((res,rej)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>{const c=document.createElement('canvas');c.width=Math.min(i.naturalWidth,2048);c.height=Math.round(c.width*(i.naturalHeight/i.naturalWidth));c.getContext('2d').drawImage(i,0,0,c.width,c.height);try{res(c.toDataURL('image/jpeg',.85));}catch(e){rej(e);}};i.onerror=()=>rej();i.src=url;});}

// ── SOCIAL ICONS ──
function setSocIcon(n,type){S['social'+n+'Icon']=type;syncChips();saveDraft();schedRender();}

// ── VENUES ──
function popVenues(){const s=$('f-venuePreset');s.innerHTML='<option value="">-- Saved Venues --</option>'+venues.map((v,i)=>`<option value="${i}">${v.name}</option>`).join('');}
function loadVen(){const v=venues[parseInt($('f-venuePreset').value)];if(!v)return;S.venue=v.name;S.address=v.address||'';if(v.logo)S.venueLogo=v.logo;if(v.social)S.social2=v.social;syncForm();refUp('vl',S.venueLogo);showEl('vl-ctrl',!!S.venueLogo);saveDraft();schedRender();toast('Venue loaded');}
function saveVenue(){const n=S.venue.trim();if(!n){toast('Enter venue name first');return;}const e={name:n,address:S.address,logo:S.venueLogo,social:S.social2};const i=venues.findIndex(v=>v.name.toLowerCase()===n.toLowerCase());if(i>=0)venues[i]=e;else venues.push(e);dbSet('fpi_venues',venues,'venues');popVenues();toast(i>=0?'Updated':'Saved');}

// ── SAVED FLYERS ──
async function saveCurFlyer(){
  const n=prompt('Flyer name:',`${S.venue||'Gig'} — ${S.date||'Draft'}`);if(!n)return;
  const thumb=await generateThumb(S);
  saved.push({id:Date.now()+'',name:n,at:new Date().toISOString(),data:{...S},thumb});
  saveFly();renderFL();toast('Saved');
}
async function generateThumb(data){
  try{
    const c=document.createElement('canvas');
    const sz=200;const fmt=FMT[curF];
    const ratio=fmt.w/fmt.h;
    c.width=ratio>=1?sz:Math.round(sz*ratio);
    c.height=ratio>=1?Math.round(sz/ratio):sz;
    await renderFlyer(c.getContext('2d'),c.width,c.height,data);
    return c.toDataURL('image/jpeg',0.6);
  }catch(e){return null;}
}
function loadFlyer(id){const f=saved.find(f=>f.id===id);if(!f)return;Object.assign(S,f.data);syncAll();saveDraft();closeMo('mo-fl');toast('Loaded');}
function duplicateFlyer(id){
  const f=saved.find(f=>f.id===id);if(!f)return;
  const d={...f.data,date:'',doors:'',price:''};
  saved.push({id:Date.now()+'',name:f.name+' (Copy)',at:new Date().toISOString(),data:d});
  saveFly();renderFL();toast('Duplicated');
}
function deleteFlyer(id){saved=saved.filter(f=>f.id!==id);saveFly();renderFL();}
async function renderFL(){
  const el=$('fl-list');
  if(!saved.length){el.innerHTML='<div class="es">No saved flyers yet.</div>';return;}
  // Generate missing thumbnails
  let dirty=false;
  for(const f of saved){
    if(!f.thumb&&f.data){try{f.thumb=await generateThumb(f.data);dirty=true;}catch(e){}}
  }
  if(dirty)saveFly();
  el.innerHTML=saved.map(f=>{
    const d=new Date(f.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
    const thumbHtml=f.thumb?`<img src="${f.thumb}" alt="${esc(f.name)}" style="width:100%;height:100%;object-fit:cover">`:`<span class="card-ph">${esc(f.name.charAt(0))}</span>`;
    return`<div class="card" onclick="loadFlyer('${f.id}')"><div class="card-thumb">${thumbHtml}</div><div class="card-info"><div class="card-name">${esc(f.name)}</div><div class="card-meta">${d}</div><div class="card-acts"><button class="btn btn-s btn-g" onclick="event.stopPropagation();duplicateFlyer('${f.id}')">Dup</button><button class="btn btn-s btn-d" onclick="event.stopPropagation();deleteFlyer('${f.id}')">Del</button></div></div></div>`;
  }).join('');
}

// ── TEMPLATES ──
async function saveAsTemplate(){
  const n=prompt('Template name:',`${S.bgStyle!=='none'?S.bgStyle+' ':''}Layout`);if(!n)return;
  const d={...S,date:'',doors:'',price:'',venue:'',address:'',social1:'',social2:'',qrUrl:''};
  const thumb=await generateThumb(d);
  templates.push({id:Date.now()+'',name:n,at:new Date().toISOString(),data:d,thumb});
  saveTpls();renderTplList();toast('Template saved');
}
function loadTemplate(id){
  const t=templates.find(t=>t.id===id);if(!t)return;
  const keep={bandLogo:S.bandLogo};
  Object.assign(S,{...DFLT,...t.data,...keep});
  S.date='';S.doors='';S.price='';S.venue='';S.address='';S.social1='';S.social2='';S.qrUrl='';
  syncAll();saveDraft();closeMo('mo-tpl');toast('Template loaded');
}
function deleteTemplate(id){templates=templates.filter(t=>t.id!==id);saveTpls();renderTplList();}
async function renderTplList(){
  const el=$('tpl-list');
  if(!templates.length){el.innerHTML='<div class="es">No templates yet. Save your current layout as a template to reuse it.</div>';return;}
  let dirty=false;
  for(const t of templates){
    if(!t.thumb&&t.data){try{t.thumb=await generateThumb(t.data);dirty=true;}catch(e){}}
  }
  if(dirty)saveTpls();
  el.innerHTML=templates.map(t=>{
    const d=new Date(t.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
    const thumbHtml=t.thumb?`<img src="${t.thumb}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover">`:`<span class="card-ph">${esc(t.name.charAt(0))}</span>`;
    return`<div class="card" onclick="loadTemplate('${t.id}')"><div class="card-thumb">${thumbHtml}</div><div class="card-info"><div class="card-name">${esc(t.name)}</div><div class="card-meta">${d}</div><div class="card-acts"><button class="btn btn-s btn-d" onclick="event.stopPropagation();deleteTemplate('${t.id}')">Del</button></div></div></div>`;
  }).join('');
}

// ── BACKUP EXPORT/IMPORT ──
const BK_VERSION=1;
function exportBackup(scope){
  const payload={app:'5pi-flyer-studio',version:BK_VERSION,exportedAt:new Date().toISOString(),scope};
  if(scope==='flyers'||scope==='all')payload.flyers=saved;
  if(scope==='templates'||scope==='all')payload.templates=templates;
  if(scope==='all')payload.venues=venues;
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const stamp=new Date().toISOString().slice(0,10);
  a.href=url;a.download=`5pi-${scope}-backup_${stamp}.json`;
  document.body.appendChild(a);a.click();a.remove();
  URL.revokeObjectURL(url);
  toast('Backup downloaded');
}
function importBackup(file,scope){
  if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
    let data;
    try{data=JSON.parse(r.result);}catch(e){toast('Invalid backup file');return;}
    if(!data||data.app!=='5pi-flyer-studio'){toast('Not a 5PI backup file');return;}
    const incomingFlyers=Array.isArray(data.flyers)?data.flyers:[];
    const incomingTpls=Array.isArray(data.templates)?data.templates:[];
    const incomingVenues=Array.isArray(data.venues)?data.venues:[];
    const fCount=(scope==='flyers'||scope==='all')?incomingFlyers.length:0;
    const tCount=(scope==='templates'||scope==='all')?incomingTpls.length:0;
    const vCount=(scope==='all')?incomingVenues.length:0;
    if(!fCount&&!tCount&&!vCount){toast('Nothing to import for this scope');return;}
    const parts=[];
    if(fCount)parts.push(`${fCount} flyer${fCount>1?'s':''}`);
    if(tCount)parts.push(`${tCount} template${tCount>1?'s':''}`);
    if(vCount)parts.push(`${vCount} venue${vCount>1?'s':''}`);
    if(!confirm(`Import ${parts.join(', ')}?\n\nOK = merge with existing\nCancel = abort`))return;
    if(scope==='flyers'||scope==='all'){
      const ids=new Set(saved.map(f=>f.id));
      incomingFlyers.forEach(f=>{if(!f||!f.id||!f.data)return;let id=f.id;while(ids.has(id))id=Date.now()+'_'+Math.random().toString(36).slice(2,7);ids.add(id);saved.push({...f,id});});
      saveFly();renderFL();
    }
    if(scope==='templates'||scope==='all'){
      const ids=new Set(templates.map(t=>t.id));
      incomingTpls.forEach(t=>{if(!t||!t.id||!t.data)return;let id=t.id;while(ids.has(id))id=Date.now()+'_'+Math.random().toString(36).slice(2,7);ids.add(id);templates.push({...t,id});});
      saveTpls();renderTplList();
    }
    if(scope==='all'){
      const names=new Set(venues.map(v=>v.name.toLowerCase()));
      incomingVenues.forEach(v=>{if(!v||!v.name)return;if(names.has(v.name.toLowerCase()))return;names.add(v.name.toLowerCase());venues.push(v);});
      dbSet('fpi_venues',venues,'venues');popVenues();
    }
    toast('Imported '+parts.join(', '));
  };
  r.onerror=()=>toast('Failed to read file');
  r.readAsText(file);
}

function newFlyer(){
  const keep={bandLogo:S.bandLogo};
  S={...DFLT,...keep};
  syncAll();saveDraft();toast('New flyer');
}

// ── MODALS / UTILS ──
function openMo(id){
  if(id==='mo-fl')renderFL();
  if(id==='mo-tpl')renderTplList();
  $(id).classList.add('open');
}
function closeMo(id){$(id).classList.remove('open');}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);}
function $(id){return document.getElementById(id);}
function esc(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function showEl(id,v){$(id).style.display=v?'':'none';}
function f2d(f){return new Promise(r=>{const fr=new FileReader();fr.onload=e=>r(e.target.result);fr.readAsDataURL(f);});}
async function gI(src){if(!src)return null;if(iC[src])return iC[src];return new Promise(r=>{const i=new Image();i.onload=()=>{iC[src]=i;r(i);};i.onerror=()=>r(null);i.src=src;});}
function fmtD(ds){if(!ds)return'';const d=new Date(ds+'T12:00:00');if(isNaN(d))return ds;const D=['SUN','MON','TUE','WED','THU','FRI','SAT'],M=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];return`${D[d.getDay()]}  ${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;}
function srand(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
function getFont(id){return FONTS.find(f=>f.id===id)||FONTS[0];}

// ═══════════════════════════════════════
//  QR CODE (via qrcode-generator CDN)
// ═══════════════════════════════════════
function makeQRCanvas(text,size){
  const c=document.createElement('canvas');
  c.width=c.height=size;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);
  if(!text)return c;
  try{
    const qr=qrcode(0,'L');
    qr.addData(text);
    qr.make();
    const mods=qr.getModuleCount();
    const cellSize=size/mods;
    ctx.fillStyle='#000';
    for(let r=0;r<mods;r++){
      for(let col=0;col<mods;col++){
        if(qr.isDark(r,col))ctx.fillRect(col*cellSize,r*cellSize,Math.ceil(cellSize),Math.ceil(cellSize));
      }
    }
  }catch(e){console.warn('QR generation failed:',e);}
  return c;
}

// ═══════════════════════════════════════
//  PROCEDURAL BACKGROUNDS
// ═══════════════════════════════════════
function bgP(clr){return BG_CLRS[clr]?.p||BG_CLRS.red.p;}

function drawBgPlain(ctx,w,h,p){ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,w,h);const g=ctx.createRadialGradient(w/2,h*.4,0,w/2,h*.4,Math.max(w,h)*.7);g.addColorStop(0,`rgba(${Math.floor(p[0]*.13)},${Math.floor(p[1]*.05)},${Math.floor(p[2]*.05)},0.5)`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}

function drawBgRedSmoke(ctx,w,h,p){ctx.fillStyle='#080404';ctx.fillRect(0,0,w,h);
const pl=[[.25,.55,.5,.25],[.7,.35,.45,.2],[.5,.75,.55,.22],[.15,.2,.35,.15],[.8,.7,.4,.18]];
pl.forEach(q=>{const g=ctx.createRadialGradient(w*q[0],h*q[1],0,w*q[0],h*q[1],Math.max(w,h)*q[2]);g.addColorStop(0,`rgba(${Math.floor(p[0]*.5)},${Math.floor(p[1]*.3)},${Math.floor(p[2]*.3)},${q[3]})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);});}

function drawBgStageLights(ctx,w,h,p){ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h);
[[.18,.28],[.5,.22],[.82,.28]].forEach((b,i)=>{ctx.save();ctx.beginPath();ctx.moveTo(w*b[0]-10,0);ctx.lineTo(w*b[0]+10,0);ctx.lineTo(w*b[0]+h*b[1],h);ctx.lineTo(w*b[0]-h*b[1],h);ctx.closePath();const g=ctx.createLinearGradient(w*b[0],0,w*b[0],h);const a=i===1?.06:.10;g.addColorStop(0,`rgba(${p.join(',')},${a})`);g.addColorStop(.7,`rgba(${p.join(',')},0.02)`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fill();ctx.restore();});
const fg=ctx.createLinearGradient(0,h*.85,0,h);fg.addColorStop(0,'transparent');fg.addColorStop(1,`rgba(${p.join(',')},0.06)`);ctx.fillStyle=fg;ctx.fillRect(0,h*.85,w,h*.15);}

function drawBgGrunge(ctx,w,h,p){ctx.fillStyle='#0e0e0e';ctx.fillRect(0,0,w,h);
const nc=document.createElement('canvas');nc.width=200;nc.height=200;const nx=nc.getContext('2d'),id=nx.createImageData(200,200);const rn=srand(42);
for(let i=0;i<id.data.length;i+=4){const v=rn()*60;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=35;}
nx.putImageData(id,0,0);ctx.fillStyle=ctx.createPattern(nc,'repeat');ctx.fillRect(0,0,w,h);
const rn2=srand(77);ctx.globalAlpha=.04;for(let i=0;i<30;i++){ctx.fillStyle=rn2()>.5?'#fff':'#000';ctx.fillRect(0,rn2()*h,w,1+rn2()*3);}ctx.globalAlpha=1;
const vg=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.max(w,h)*.7);vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,0,0.5)');ctx.fillStyle=vg;ctx.fillRect(0,0,w,h);
const cg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*.5);cg.addColorStop(0,`rgba(${p.join(',')},0.05)`);cg.addColorStop(1,'transparent');ctx.fillStyle=cg;ctx.fillRect(0,0,w,h);}

function drawBgNeonGrid(ctx,w,h,p){ctx.fillStyle='#050008';ctx.fillRect(0,0,w,h);
const hz=h*.42,vx=w/2;const hg=ctx.createRadialGradient(vx,hz,0,vx,hz,w*.6);hg.addColorStop(0,`rgba(${p.join(',')},0.12)`);hg.addColorStop(1,'transparent');ctx.fillStyle=hg;ctx.fillRect(0,0,w,h);
ctx.strokeStyle=`rgba(${p.join(',')},0.12)`;ctx.lineWidth=1;
for(let i=1;i<=18;i++){const t=i/18,y=hz+(h-hz)*Math.pow(t,1.6);ctx.globalAlpha=.15+t*.4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
ctx.globalAlpha=1;ctx.strokeStyle=`rgba(${p.join(',')},0.08)`;for(let i=-10;i<=10;i++){ctx.beginPath();ctx.moveTo(vx,hz);ctx.lineTo(vx+i*(w/10),h);ctx.stroke();}ctx.globalAlpha=1;
const sg=ctx.createRadialGradient(vx,hz,0,vx,hz,h*.15);sg.addColorStop(0,`rgba(${p.join(',')},0.15)`);sg.addColorStop(1,'transparent');ctx.fillStyle=sg;ctx.fillRect(0,0,w,h);}

function drawBgEmbers(ctx,w,h,p){ctx.fillStyle='#0a0606';ctx.fillRect(0,0,w,h);
const bg=ctx.createLinearGradient(0,h*.5,0,h);bg.addColorStop(0,'transparent');bg.addColorStop(1,`rgba(${Math.floor(p[0]*.25)},${Math.floor(p[1]*.06)},${Math.floor(p[2]*.02)},0.3)`);ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
const rn=srand(123);for(let i=0;i<80;i++){const x=rn()*w,y=rn()*h,sz=1+rn()*3,br=.15+rn()*.5;
const r=Math.min(255,p[0]+Math.floor(rn()*30-15)),g=Math.min(255,Math.floor(p[1]*.4+rn()*40)),b=Math.min(255,Math.floor(p[2]*.2+rn()*20));
const gl=ctx.createRadialGradient(x,y,0,x,y,sz*4);gl.addColorStop(0,`rgba(${r},${g},${b},${br*.3})`);gl.addColorStop(1,'transparent');ctx.fillStyle=gl;ctx.fillRect(x-sz*4,y-sz*4,sz*8,sz*8);
ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fillStyle=`rgba(${r},${g},${b},${br})`;ctx.fill();}}

function drawBgBokeh(ctx,w,h,p){ctx.fillStyle='#060606';ctx.fillRect(0,0,w,h);
const rn=srand(88);for(let i=0;i<35;i++){const x=rn()*w,y=rn()*h,sz=10+rn()*Math.min(w,h)*.08;
const a=.03+rn()*.08;const g=ctx.createRadialGradient(x,y,0,x,y,sz);
g.addColorStop(0,`rgba(${p.join(',')},${a*1.5})`);g.addColorStop(.7,`rgba(${p.join(',')},${a*.5})`);g.addColorStop(1,'transparent');
ctx.fillStyle=g;ctx.fillRect(x-sz,y-sz,sz*2,sz*2);
ctx.beginPath();ctx.arc(x,y,sz*.8,0,Math.PI*2);ctx.strokeStyle=`rgba(${p.join(',')},${a})`;ctx.lineWidth=1.5;ctx.stroke();}}

function drawBgMolten(ctx,w,h,p){ctx.fillStyle='#0a0404';ctx.fillRect(0,0,w,h);
const g1=ctx.createLinearGradient(0,h*.6,0,h);g1.addColorStop(0,'transparent');g1.addColorStop(.5,`rgba(${p.join(',')},0.08)`);g1.addColorStop(1,`rgba(${p.join(',')},0.2)`);ctx.fillStyle=g1;ctx.fillRect(0,0,w,h);
const rn=srand(55);for(let i=0;i<20;i++){const cx=rn()*w,cy=h*.65+rn()*h*.35,rx=20+rn()*w*.15,ry=5+rn()*h*.04;
const g=ctx.createRadialGradient(cx,cy,0,cx,cy,rx);g.addColorStop(0,`rgba(${Math.min(255,p[0]+40)},${Math.min(255,Math.floor(p[1]*.8))},${Math.floor(p[2]*.3)},${.08+rn()*.12})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(cx-rx,cy-ry*3,rx*2,ry*6);}
const g2=ctx.createLinearGradient(0,h*.92,0,h);g2.addColorStop(0,'transparent');g2.addColorStop(1,`rgba(${p.join(',')},0.12)`);ctx.fillStyle=g2;ctx.fillRect(0,0,w,h);}

function drawBgHalftone(ctx,w,h,p){ctx.fillStyle='#0a0a0a';ctx.fillRect(0,0,w,h);
const spacing=Math.max(8,Math.min(w,h)*.02);
ctx.fillStyle=`rgba(${p.join(',')},0.12)`;
for(let y=spacing;y<h;y+=spacing){for(let x=spacing;x<w;x+=spacing){
const dist=Math.sqrt(Math.pow(x-w/2,2)+Math.pow(y-h/2,2));const maxD=Math.max(w,h)*.6;
const sz=Math.max(0,(1-dist/maxD))*spacing*.35;if(sz>0.5){ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fill();}}}}

const BG_FN={none:drawBgPlain,'red-smoke':drawBgRedSmoke,'stage-lights':drawBgStageLights,grunge:drawBgGrunge,'neon-grid':drawBgNeonGrid,embers:drawBgEmbers,bokeh:drawBgBokeh,molten:drawBgMolten,halftone:drawBgHalftone};

function getStyledBg(style,w,h,clr){
  const key=`${style}-${clr}-${w}-${h}`;if(bgCC.k===key&&bgCC.c)return bgCC.c;
  const c=document.createElement('canvas');c.width=w;c.height=h;
  (BG_FN[style]||drawBgPlain)(c.getContext('2d'),w,h,bgP(clr));
  bgCC={k:key,c};return c;
}

// ═══ SOCIAL ICON DRAWING ═══
function drawIGIcon(ctx,x,y,sz,col){
  ctx.save();ctx.strokeStyle=col;ctx.fillStyle='transparent';ctx.lineWidth=sz*.08;
  const r=sz*.24,hw=sz/2;
  // Outer rounded rect
  rR(ctx,x-hw,y-hw,sz,sz,r);ctx.stroke();
  // Lens circle
  ctx.beginPath();ctx.arc(x,y,sz*.26,0,Math.PI*2);ctx.stroke();
  // Flash dot
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x+sz*.27,y-sz*.27,sz*.07,0,Math.PI*2);ctx.fill();
  ctx.restore();
}
function drawFBIcon(ctx,x,y,sz,col){
  // Render to 2x temp canvas for crisp output, then draw back at 1x
  const scale=2,pad=4;
  const tmp=document.createElement('canvas');
  tmp.width=tmp.height=(sz+pad*2)*scale;
  const tc=tmp.getContext('2d');
  tc.scale(scale,scale);
  const cx=sz/2+pad,cy=sz/2+pad;
  tc.fillStyle=col;
  tc.beginPath();tc.arc(cx,cy,sz/2,0,Math.PI*2);tc.fill();
  tc.globalCompositeOperation='destination-out';
  tc.font=`700 ${sz*.6}px sans-serif`;tc.textAlign='center';tc.textBaseline='alphabetic';
  tc.fillText('f',cx,cy+sz*.2);
  ctx.drawImage(tmp,0,0,tmp.width,tmp.height,x-sz/2-pad,y-sz/2-pad,sz+pad*2,sz+pad*2);
}

// ═══════════════════════════════════════
//  MAIN RENDER
// ═══════════════════════════════════════
function schedRender(){clearTimeout(rT);rT=setTimeout(renderPrev,50);}

async function renderPrev(){
  const cv=$('cv'),cw=$('cw'),fmt=FMT[curF];
  const mW=cw.clientWidth-40,mH=cw.clientHeight-20,sc=Math.min(mW/fmt.w,mH/fmt.h,1);
  const dW=Math.round(fmt.w*sc),dH=Math.round(fmt.h*sc),dpr=window.devicePixelRatio||1;
  cv.width=dW*dpr;cv.height=dH*dpr;cv.style.width=dW+'px';cv.style.height=dH+'px';
  const ctx=cv.getContext('2d');ctx.scale(dpr,dpr);await renderFlyer(ctx,dW,dH,S);
}

async function renderFlyer(ctx,w,h,d){
  const s=Math.min(w,h)/600,cx=w/2,isL=w>h;

  // ── BG ──
  const bgImg=await gI(d.bgImage);
  if(bgImg){
    ctx.fillStyle=PAL.bg;ctx.fillRect(0,0,w,h);
    ctx.save();
    let filt=d.bgBlur>0?`blur(${d.bgBlur*s}px)`:'';
    if(d.bgFilter&&d.bgFilter!=='none')filt+=(filt?' ':'')+d.bgFilter;
    if(filt)ctx.filter=filt;
    const fit=d.bgFit||'cover',ia=bgImg.width/bgImg.height,ca=w/h;
    if(fit==='cover'){
      let sx=0,sy=0,sw=bgImg.width,sh=bgImg.height;
      if(ia>ca){sw=bgImg.height*ca;sx=(bgImg.width-sw)*((d.bgPanX??50)/100);}
      else{sh=bgImg.width/ca;sy=(bgImg.height-sh)*((d.bgPanY??50)/100);}
      ctx.drawImage(bgImg,sx,sy,sw,sh,0,0,w,h);
    }
    else{let dw,dh,dx,dy;if(ia>ca){dw=w;dh=w/ia;dx=0;dy=(h-dh)/2;}else{dh=h;dw=h*ia;dy=0;dx=(w-dw)/2;}ctx.drawImage(bgImg,dx,dy,dw,dh);}
    ctx.restore();
    const dk=(d.bgDarken??50)/100;if(dk>0){ctx.fillStyle=`rgba(10,10,10,${dk})`;ctx.fillRect(0,0,w,h);}
    if(d.bgOverlay&&d.bgStyle&&d.bgStyle!=='none'){
      ctx.globalAlpha=(d.bgOverlayOp??40)/100;
      ctx.drawImage(getStyledBg(d.bgStyle,w,h,d.bgClr||'red'),0,0,w,h);
      ctx.globalAlpha=1;
    }
  } else {
    ctx.drawImage(getStyledBg(d.bgStyle||'none',w,h,d.bgClr||'red'),0,0,w,h);
  }

  drawNoise(ctx,w,h);
  const vig=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.25,w/2,h/2,Math.max(w,h)*.75);
  vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,0.45)');ctx.fillStyle=vig;ctx.fillRect(0,0,w,h);

  // ── BORDER ──
  const pd=16*s,pd2=28*s;drawBorder(ctx,w,h,pd,pd2,s,d);
  const cPd=pd2+12*s,cW=w-cPd*2;ctx.textAlign='center';ctx.textBaseline='middle';

  // ── BAND LOGO ──
  const bImg=await gI(d.bandLogo);
  if(bImg){const bh=(isL?h*.12:h*.08)*(d.logoSize??100)/100,bw=bh*(bImg.width/bImg.height),area={x:cPd,y:cPd,w:cW,h:h-cPd*2};
  ctx.drawImage(bImg,area.x+(d.logoX??50)/100*area.w-bw/2,area.y+(d.logoY??8)/100*area.h-bh/2,bw,bh);}

  // ── VENUE LOGO ──
  const vImg=await gI(d.venueLogo);
  if(vImg){const vh=(isL?h*.10:h*.06)*(d.vLogoSize??100)/100,vw=vh*(vImg.width/vImg.height),area={x:cPd,y:cPd,w:cW,h:h-cPd*2};
  ctx.drawImage(vImg,area.x+(d.vLogoX??50)/100*area.w-vw/2,area.y+(d.vLogoY??90)/100*area.h-vh/2,vw,vh);}

  // ── BAND NAME + SLOGAN ──
  const bScale=(d.textBandSize??100)/100;
  const bFnt=getFont(d.bandFont);
  const bFS=Math.min(isL?52*s:60*s,cW*.13)*bScale;
  const bY=h*(d.textBandY??30)/100;
  ctx.font=`${bFnt.w} ${bFS}px ${bFnt.f}`;ctx.fillStyle=d.bandColor||PAL.text;
  ctx.shadowColor=PAL.glow;ctx.shadowBlur=20*s;
  if(ctx.letterSpacing!==undefined)ctx.letterSpacing=(6*s*bScale)+'px';
  ctx.fillText((d.bandName||'BAND NAME').toUpperCase(),cx,bY);
  ctx.shadowColor='transparent';ctx.shadowBlur=0;if(ctx.letterSpacing!==undefined)ctx.letterSpacing='0px';

  let slBot=bY+bFS*.45;
  if(d.slogan){const slFS=Math.min(14*s,cW*.035)*bScale,slY=bY+bFS*.55;
  ctx.font=`italic 400 ${slFS}px "Playfair Display",Georgia,serif`;ctx.fillStyle=d.dateColor||PAL.accent;
  ctx.fillText(d.slogan,cx,slY);slBot=slY+slFS*.6;}

  // ── DIVIDER 1 ──
  const dateY=h*(d.textDateY??50)/100;drawDivider(ctx,cx,(slBot+dateY)/2,cW*.35,s,d);

  // ── DATE ──
  const dScale=(d.textDateSize??100)/100,dStr=fmtD(d.date);let dateBot=dateY;
  if(dStr){const dFnt=getFont(d.dateFont),dFS=Math.min(isL?24*s:28*s,cW*.06)*dScale;
  ctx.font=`${dFnt.w} ${dFS}px ${dFnt.f}`;ctx.fillStyle=d.dateColor||PAL.accent;
  if(ctx.letterSpacing!==undefined)ctx.letterSpacing=(4*s*dScale)+'px';ctx.fillText(dStr,cx,dateY);
  if(ctx.letterSpacing!==undefined)ctx.letterSpacing='0px';dateBot=dateY+dFS*.5;}

  // ── DIVIDER 2 ──
  const venueY=h*(d.textVenueY??66)/100;if(dStr)drawDivider(ctx,cx,(dateBot+venueY)/2,cW*.35,s,d);

  // ── VENUE BLOCK ──
  const vScale=(d.textVenueSize??100)/100,vFnt=getFont(d.venueFont);let vy=venueY;const gap=5*s*vScale;
  if(d.venue){const vFS=Math.min(isL?30*s:36*s,cW*.08)*vScale;
  ctx.font=`${vFnt.w} ${vFS}px ${vFnt.f}`;ctx.fillStyle=d.venueColor||PAL.text;
  if(ctx.letterSpacing!==undefined)ctx.letterSpacing=(3*s*vScale)+'px';ctx.fillText(d.venue.toUpperCase(),cx,vy);
  if(ctx.letterSpacing!==undefined)ctx.letterSpacing='0px';vy+=vFS*.55+gap;}
  if(d.address){const aFS=Math.min(11*s,cW*.025)*vScale;ctx.font=`300 ${aFS}px "Montserrat",sans-serif`;ctx.fillStyle=PAL.muted;ctx.fillText(d.address,cx,vy);vy+=aFS+gap*1.5;}
  const pts=[];if(d.doors)pts.push((d.doorsLabel||'DOORS')+' '+d.doors);if(d.price)pts.push(d.price.toUpperCase());
  if(pts.length){const pFS=Math.min(12*s,cW*.028)*vScale;ctx.font=`600 ${pFS}px "Montserrat",sans-serif`;ctx.fillStyle=d.venueColor||PAL.text;
  if(ctx.letterSpacing!==undefined)ctx.letterSpacing=(2*s)+'px';ctx.fillText(pts.join('   |   '),cx,vy);if(ctx.letterSpacing!==undefined)ctx.letterSpacing='0px';vy+=pFS+gap*1.5;}

  // ── SOCIAL WITH ICONS ──
  const socs=[];
  if(d.social1)socs.push({t:d.social1,icon:d.social1Icon||'instagram'});
  if(d.social2)socs.push({t:d.social2,icon:d.social2Icon||'instagram'});
  if(socs.length){
    const sFS=Math.min(10*s,cW*.022)*vScale;
    const iconSz=sFS*1.4;
    ctx.font=`400 ${sFS}px "Montserrat",sans-serif`;ctx.fillStyle=PAL.dim;
    const spacing=sFS*3;
    let totalW=0;
    socs.forEach((sc,i)=>{totalW+=iconSz+sFS*.4+ctx.measureText(sc.t).width;if(i<socs.length-1)totalW+=spacing;});
    let sx=cx-totalW/2;
    socs.forEach((sc,i)=>{
      const col=PAL.dim;
      if(sc.icon==='instagram')drawIGIcon(ctx,sx+iconSz/2,vy,iconSz,col);
      else if(sc.icon==='facebook')drawFBIcon(ctx,sx+iconSz/2,vy,iconSz,col);
      sx+=iconSz+sFS*.4;
      ctx.font=`400 ${sFS}px "Montserrat",sans-serif`;ctx.fillStyle=PAL.dim;ctx.textAlign='left';
      ctx.fillText(sc.t,sx,vy);sx+=ctx.measureText(sc.t).width+spacing;ctx.textAlign='center';
    });
  }

  // ── QR CODE ──
  if(d.qrUrl&&d.qrUrl.trim()){
    const qrSz=Math.min(w,h)*.12*(d.qrSize??80)/100;
    const area={x:cPd,y:cPd,w:cW,h:h-cPd*2};
    const qx=area.x+(d.qrX??85)/100*area.w;
    const qy=area.y+(d.qrY??88)/100*area.h;
    // White bg with padding
    const pad=qrSz*.1;
    ctx.fillStyle='#fff';
    rR(ctx,qx-qrSz/2-pad,qy-qrSz/2-pad,qrSz+pad*2,qrSz+pad*2,4*s);ctx.fill();
    // QR modules
    const qrCanvas=makeQRCanvas(d.qrUrl.trim(),200);
    ctx.drawImage(qrCanvas,qx-qrSz/2,qy-qrSz/2,qrSz,qrSz);
  }
}

// ── DECORATIVE ──
function drawBorder(ctx,w,h,p1,p2,s,d){
  const style=d.borderStyle||'ornate';if(style==='none')return;
  const bClr=d.borderColor||'#e63946';const bW=(d.borderWidth??100)/100;
  const alpha=.18,alphaL=.08;
  const clr=bClr+'2e',clrL=bClr+'14';// hex alpha approx
  // compute rgba from hex
  function hToR(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}
  const c1=hToR(bClr,alpha),c2=hToR(bClr,alphaL);
  const lw1=Math.max(1,1.5*s*bW),lw2=Math.max(1,.8*s*bW);
  if(style==='single'){
    ctx.strokeStyle=c1;ctx.lineWidth=lw1;rR(ctx,p1,p1,w-p1*2,h-p1*2,2*s);ctx.stroke();
  }else if(style==='double'){
    ctx.strokeStyle=c1;ctx.lineWidth=lw1;rR(ctx,p1,p1,w-p1*2,h-p1*2,2*s);ctx.stroke();
    ctx.strokeStyle=c2;ctx.lineWidth=lw2;rR(ctx,p2,p2,w-p2*2,h-p2*2,1*s);ctx.stroke();
  }else if(style==='dashed'){
    ctx.strokeStyle=c1;ctx.lineWidth=lw1;ctx.setLineDash([8*s*bW,6*s*bW]);
    rR(ctx,p1,p1,w-p1*2,h-p1*2,2*s);ctx.stroke();ctx.setLineDash([]);
  }else if(style==='corners'){
    const cl=Math.min(w,h)*.08*bW;ctx.strokeStyle=c1;ctx.lineWidth=lw1;ctx.lineCap='round';
    [[p1,p1,p1+cl,p1,p1,p1+cl],[w-p1,p1,w-p1-cl,p1,w-p1,p1+cl],
     [p1,h-p1,p1+cl,h-p1,p1,h-p1-cl],[w-p1,h-p1,w-p1-cl,h-p1,w-p1,h-p1-cl]].forEach(([x,y,x2,y2,x3,y3])=>{
      ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x,y);ctx.lineTo(x3,y3);ctx.stroke();});
    ctx.lineCap='butt';
  }else if(style==='ornate'){
    ctx.strokeStyle=c1;ctx.lineWidth=lw1;rR(ctx,p1,p1,w-p1*2,h-p1*2,2*s);ctx.stroke();
    ctx.strokeStyle=c2;ctx.lineWidth=lw2;rR(ctx,p2,p2,w-p2*2,h-p2*2,1*s);ctx.stroke();
    const dd=4*s*bW;ctx.fillStyle=c1;
    dia(ctx,p2,p2,dd);dia(ctx,w-p2,p2,dd);dia(ctx,p2,h-p2,dd);dia(ctx,w-p2,h-p2,dd);
  }
}
function dia(ctx,x,y,sz){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-sz/2,-sz/2,sz,sz);ctx.restore();}
function drawDivider(ctx,cx,y,width,s,d){
  if((d.borderStyle||'ornate')==='none')return;
  const bClr=d.borderColor||'#e63946';
  function hToR(hex,a){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;}
  const half=width/2,gap=6*s;ctx.strokeStyle=hToR(bClr,.08);ctx.lineWidth=Math.max(.8,.8*s);
  ctx.beginPath();ctx.moveTo(cx-half,y);ctx.lineTo(cx-gap,y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx+gap,y);ctx.lineTo(cx+half,y);ctx.stroke();
  ctx.fillStyle=hToR(bClr,.18);dia(ctx,cx,y,3.5*s);}
function rR(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}
function drawNoise(ctx,w,h){if(!noiseC){const c=document.createElement('canvas');c.width=c.height=100;const x=c.getContext('2d'),id=x.createImageData(100,100);for(let i=0;i<id.data.length;i+=4){const v=Math.random()*35;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=16;}x.putImageData(id,0,0);noiseC=c;}ctx.fillStyle=ctx.createPattern(noiseC,'repeat');ctx.fillRect(0,0,w,h);}

// ═══════════════════════════════════════
//  EXPORT: PNG, ZIP, PDF, CLIPBOARD
// ═══════════════════════════════════════

function fname(){return[(S.bandName||'flyer').replace(/\s+/g,'-').toLowerCase(),S.venue?S.venue.replace(/\s+/g,'-').toLowerCase():'',S.date||''].filter(Boolean).join('_');}

async function renderFull(fmtKey){
  const fmt=FMT[fmtKey];
  const c=document.createElement('canvas');c.width=fmt.w;c.height=fmt.h;
  bgCC.k='';
  await renderFlyer(c.getContext('2d'),fmt.w,fmt.h,S);
  return c;
}

async function exportFlyer(){
  toast('Rendering...');
  const c=await renderFull(curF);
  c.toBlob(blob=>{
    if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=fname()+'_'+curF+'.png';
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);toast('PNG downloaded');
  },'image/png');
}

async function exportAll(){
  if(typeof JSZip==='undefined'){toast('JSZip not loaded');return;}
  toast('Rendering all formats...');
  const zip=new JSZip();
  const keys=Object.keys(FMT);
  for(let i=0;i<keys.length;i++){
    toast(`Rendering ${i+1}/${keys.length}...`);
    const c=await renderFull(keys[i]);
    const blob=await new Promise(r=>c.toBlob(r,'image/png'));
    zip.file(`${fname()}_${keys[i]}.png`,blob);
  }
  // Also include A5 as PDF
  try{
    const pdfBlob=await makePDFBlob();
    if(pdfBlob)zip.file(`${fname()}_a5-print.pdf`,pdfBlob);
  }catch(e){}
  toast('Creating ZIP...');
  const content=await zip.generateAsync({type:'blob'});
  const url=URL.createObjectURL(content),a=document.createElement('a');
  a.href=url;a.download=fname()+'_all-formats.zip';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);toast('ZIP downloaded');
}

async function makePDFBlob(){
  if(typeof jspdf==='undefined'&&typeof window.jspdf==='undefined')return null;
  const {jsPDF}=window.jspdf;
  const c=await renderFull('a5');
  const imgData=c.toDataURL('image/jpeg',0.92);
  const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a5'});
  pdf.addImage(imgData,'JPEG',0,0,148,210);
  return pdf.output('blob');
}

async function exportPDF(){
  toast('Rendering PDF...');
  const blob=await makePDFBlob();
  if(!blob){toast('jsPDF not loaded');return;}
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=fname()+'_a5-print.pdf';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);toast('PDF downloaded');
}

async function copyToClipboard(){
  toast('Rendering...');
  try{
    const c=await renderFull(curF);
    const blob=await new Promise(r=>c.toBlob(r,'image/png'));
    await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
    toast('Copied to clipboard');
  }catch(e){
    toast('Clipboard not supported in this browser');
  }
}
