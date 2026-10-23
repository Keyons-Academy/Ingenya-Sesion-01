'use strict';
const $=id=>document.getElementById(id);
const msg=(id,t)=>{const el=$(id);el.textContent=t;el.hidden=!t;};
async function dashboard(){
 try{
  const r=await fetch('/api/admin/results',{credentials:'same-origin',cache:'no-store'});
  if(r.status===401){$('login-box').hidden=false;$('dashboard').hidden=true;return;}
  if(!r.ok)throw Error('No fue posible consultar los resultados.');
  const {results,count}=await r.json();
  $('login-box').hidden=true;$('dashboard').hidden=false;msg('dashboard-error','');
  $('total').textContent=String(count);
  $('average').textContent=results.length?Math.round(results.reduce((s,x)=>s+x.score,0)/results.length):'—';
  $('highest').textContent=results.length?Math.max(...results.map(x=>x.score)):'—';
  const ratings=results.filter(x=>x.rating!==null).map(x=>x.rating);
  $('ratingAvg').textContent=ratings.length?(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1):'—';
  const tbody=$('results');tbody.replaceChildren();
  if(!results.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=6;td.textContent='Todavía no hay resultados registrados.';tr.append(td);tbody.append(tr);return;}
  results.forEach(x=>{
    const tr=document.createElement('tr');
    [x.name,x.email,x.completedAt,x.score+'/100',x.rating??'—',x.topic||'—'].forEach(value=>{const td=document.createElement('td');td.textContent=String(value);tr.append(td);});
    tbody.append(tr);
  });
 }catch(e){msg('dashboard-error',e.message);}
}
$('login-form').addEventListener('submit',async e=>{
 e.preventDefault();msg('login-error','');const button=$('loginBtn');button.disabled=true;
 try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('password').value})});const j=await r.json();if(!r.ok)throw Error(j.error||'No se pudo iniciar sesión.');$('password').value='';await dashboard();}
 catch(ex){msg('login-error',ex.message);}finally{button.disabled=false;}
});
$('download').addEventListener('click',()=>{window.location.href='/api/admin/export';});
$('download-pdf').addEventListener('click',()=>{window.location.href='/api/admin/export-pdf';});
$('logout').addEventListener('click',async()=>{try{await fetch('/api/admin/logout',{method:'POST'});}finally{$('dashboard').hidden=true;$('login-box').hidden=false;}});
dashboard();
