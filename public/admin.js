'use strict';
const $=id=>document.getElementById(id);
const msg=(id,t)=>{const el=$(id);el.textContent=t;el.hidden=!t;};
const collator=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
let records=[];
let sortBy='date';
let sortDirection='desc';
const fields={name:r=>r.name,email:r=>r.email,date:r=>Date.parse(r.completedAtISO)||0,duration:r=>r.durationSeconds,score:r=>r.score,rating:r=>r.rating,topic:r=>r.topic};
function compare(a,b){
 const av=fields[sortBy](a),bv=fields[sortBy](b);
 const empty=v=>v===null||v===undefined||v==='';
 if(empty(av)&&empty(bv))return 0;
 if(empty(av))return 1;
 if(empty(bv))return -1;
 const diff=typeof av==='number'&&typeof bv==='number'?av-bv:collator.compare(String(av),String(bv));
 return sortDirection==='asc'?diff:-diff;
}
function showSort(){
 document.querySelectorAll('[data-sort]').forEach(h=>{
   const active=h.dataset.sort===sortBy;
   h.setAttribute('aria-sort',active?(sortDirection==='asc'?'ascending':'descending'):'none');
   h.querySelector('.sort-indicator').textContent=active?(sortDirection==='asc'?'↑':'↓'):'↕';
 });
}
function renderRows(){
 const tbody=$('results');tbody.replaceChildren();showSort();
 if(!records.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.textContent='Todavía no hay resultados registrados.';tr.append(td);tbody.append(tr);return;}
 for(const x of [...records].sort(compare)){
   const tr=document.createElement('tr');
   [x.name,x.email,x.completedAt,x.duration,x.score+'/10',x.rating??'No indicada',x.topic||'No indicado'].forEach(value=>{
     const td=document.createElement('td');td.textContent=String(value);tr.append(td);
   });
   tbody.append(tr);
 }
}
async function dashboard(){
 try{
  const r=await fetch('/api/admin/results',{credentials:'same-origin',cache:'no-store'});
  if(r.status===401){$('login-box').hidden=false;$('dashboard').hidden=true;return;}
  if(!r.ok)throw Error('No fue posible consultar los resultados.');
  const {results,count}=await r.json();
  records=results;
  $('login-box').hidden=true;$('dashboard').hidden=false;msg('dashboard-error','');
  $('total').textContent=String(count);
  $('average').textContent=results.length?(results.reduce((s,x)=>s+x.score,0)/results.length).toFixed(1)+'/10':'—';
  $('highest').textContent=results.length?Math.max(...results.map(x=>x.score))+'/10':'—';
  const ratings=results.filter(x=>x.rating!==null&&x.rating!==undefined).map(x=>Number(x.rating));
  $('ratingAvg').textContent=ratings.length?(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1):'—';
  renderRows();
 }catch(e){msg('dashboard-error',e.message);}
}
document.querySelectorAll('[data-sort] button').forEach(button=>button.addEventListener('click',()=>{
 const key=button.closest('[data-sort]').dataset.sort;
 if(sortBy===key)sortDirection=sortDirection==='asc'?'desc':'asc';
 else {sortBy=key;sortDirection=key==='date'?'desc':'asc';}
 renderRows();
}));
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault();msg('login-error','');const button=$('loginBtn');button.disabled=true;
 try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('password').value})});const j=await r.json();if(!r.ok)throw Error(j.error||'No se pudo iniciar sesión.');$('password').value='';await dashboard();}
 catch(ex){msg('login-error',ex.message);}finally{button.disabled=false;}
});
$('download').addEventListener('click',()=>{window.location.href='/api/admin/export';});
$('download-pdf').addEventListener('click',()=>{window.location.href='/api/admin/export-pdf';});
$('logout').addEventListener('click',async()=>{try{await fetch('/api/admin/logout',{method:'POST'});}finally{$('dashboard').hidden=true;$('login-box').hidden=false;}});
dashboard();
