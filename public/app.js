import {resultScore} from './result-score.js';

(() => {
  'use strict';
  const KEY = 'genia2026_participacion_v3';
  const $ = id => document.getElementById(id);
  const state = {name:'',email:'',token:'',questions:[],deadline:0,index:0,answers:{},result:null,busy:false,feedbackSent:false,timer:null,filter:'rep'};
  const make = (tag,className,text) => {const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
  const put = (el,child) => {el.appendChild(child);return child;};
  const setStep = v => {document.body.dataset.step=v;window.scrollTo({top:0,behavior:'instant'});};
  const err = (id,text) => {$(id).textContent=text;$(id).hidden=!text;};
  const request = async (url,body) => {
    const resp = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',credentials:'same-origin'});
    let data={};try{data=await resp.json();}catch{}
    if(!resp.ok)throw Error(data.error||'El servidor no pudo completar la solicitud.');
    return data;
  };
  const save = () => {
    const val = {name:state.name,email:state.email,token:state.token,deadline:state.deadline,index:state.index,answers:state.answers,result:state.result,feedbackSent:state.feedbackSent};
    try{sessionStorage.setItem(KEY,JSON.stringify(val));}catch{}
  };
  const getQ = () => state.questions[state.index];
  const complete = (q,a) => {
    if(q.type==='single')return Number.isInteger(a);
    if(q.type==='multi')return Array.isArray(a)&&a.length>0;
    if(q.type==='order')return Array.isArray(a)&&a.length===q.steps.length;
    return Array.isArray(a)&&a.length===q.rows.length&&a.every(v=>Number.isInteger(v));
  };
  const countComplete = () => state.questions.filter(q=>complete(q,state.answers[q.id])).length;
  const timeLeft = () => Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  const clock = () => {
    if(!state.questions.length || state.result)return;
    const left = timeLeft();
    $('clock').textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;
    $('timer').classList.toggle('is-low',left<=120);
    if(!left && !state.busy) submit(true);
  };
  const startClock = () => {if(state.timer)clearInterval(state.timer);clock();state.timer=setInterval(clock,1000);};
  function renderOptions(q,container) {
    const fs=put(container,make('fieldset','opts'));
    fs.setAttribute('aria-label',q.instruction);
    q.options.forEach((opt,i)=>{
      const label=make('label','opt'),input=make('input'),letter=make('span','opt__l',String.fromCharCode(65+i)),txt=make('span','opt__t',opt);
      input.type=q.type==='single'?'radio':'checkbox';input.name='options'+q.id;input.value=String(i);
      const current=state.answers[q.id];input.checked=q.type==='single'?current===i:Array.isArray(current)&&current.includes(i);
      input.addEventListener('change',()=>{
        if(q.type==='single')state.answers[q.id]=i;
        else {let selections=Array.isArray(state.answers[q.id])?[...state.answers[q.id]]:[];
          selections=input.checked?[...selections,i]:selections.filter(x=>x!==i);
          state.answers[q.id]=selections;
        }
        save();renderProgress();
      });
      label.append(input,letter,txt);fs.append(label);
    });
  }
  function renderOrder(q,container) {
    const saved = state.answers[q.id];
    let order = Array.isArray(saved)&&saved.length===q.steps.length?[...saved]:q.steps.map((_,i)=>i);
    const ol=put(container,make('ol','order-list'));
    const controls=put(container,make('div','order-confirm'));
    const confirm=put(controls,make('button','btn btn--line','Confirmar este orden'));
    confirm.type='button';
    const status=put(controls,make('span','order-status',saved?'Orden registrado':'Orden por confirmar'));
    function paint(){
      ol.replaceChildren();
      order.forEach((stepIndex,pos)=>{
        const row=make('li','order-item');
        put(row,make('span','order-index',String(pos+1).padStart(2,'0')));
        put(row,make('span','order-text',q.steps[stepIndex]));
        const group=put(row,make('div','order-actions'));
        const up=put(group,make('button','', '↑'));up.type='button';up.title='Subir este paso';up.setAttribute('aria-label',`Subir paso ${pos+1}`);up.disabled=pos===0;
        const down=put(group,make('button','','↓'));down.type='button';down.title='Bajar este paso';down.setAttribute('aria-label',`Bajar paso ${pos+1}`);down.disabled=pos===order.length-1;
        const move=delta=>{const at=pos+delta;[order[pos],order[at]]=[order[at],order[pos]];state.answers[q.id]=[...order];save();paint();renderProgress();};
        up.addEventListener('click',()=>move(-1));down.addEventListener('click',()=>move(1));
        ol.append(row);
      });
    }
    confirm.addEventListener('click',()=>{state.answers[q.id]=[...order];save();renderProgress();status.textContent='Orden registrado';});
    paint();
  }
  function renderMatch(q,container) {
    const group=put(container,make('div','match-list'));
    const values=Array.isArray(state.answers[q.id])&&state.answers[q.id].length===q.rows.length?[...state.answers[q.id]]:q.rows.map(()=>null);
    q.rows.forEach((text,i)=>{
      const row=put(group,make('div','match-row'));
      put(row,make('span','match-prompt',text));
      const label=put(row,make('label'));
      const sr=put(label,make('span','visually-hidden','Seleccionar herramienta para: '+text));
      const select=put(label,make('select'));select.setAttribute('aria-label','Herramienta para '+text);
      const ph=put(select,make('option','','Seleccione una herramienta'));ph.value='';ph.disabled=true;
      q.choices.forEach((tool,idx)=>{const op=put(select,make('option','',tool));op.value=String(idx);});
      select.value=values[i]===null?'':String(values[i]);
      select.addEventListener('change',()=>{
        const chosen=Number(select.value);
        values.forEach((v,index)=>{if(index!==i&&v===chosen)values[index]=null;});
        values[i]=chosen;state.answers[q.id]=[...values];save();renderQuestion();
      });
    });
  }
  function renderProgress() {
    const prog=$('prog');prog.replaceChildren();
    state.questions.forEach((q,i)=>{const el=make('i');if(i===state.index)el.className='is-cur';else if(complete(q,state.answers[q.id]))el.className='is-done';prog.append(el);});
    prog.setAttribute('aria-valuenow',String(countComplete()));
  }
  function renderQuestion() {
    const q=getQ();if(!q)return;
    err('qError','');$('qi').textContent=String(state.index+1).padStart(2,'0');
    $('qk').textContent=q.category;$('qt').textContent=q.question;$('qInstruction').textContent=q.instruction;
    const fields=$('qFields');fields.replaceChildren();
    if(['single','multi'].includes(q.type))renderOptions(q,fields);
    else if(q.type==='order')renderOrder(q,fields);else renderMatch(q,fields);
    $('prev').disabled=state.index===0;
    $('nextL').textContent=state.index===state.questions.length-1?'Finalizar':'Siguiente';
    renderProgress();save();
  }
  async function begin(e){
    e.preventDefault();if(state.busy)return;
    const name=$('nombre').value.trim().replace(/\s+/g,' '),email=$('correo').value.trim().toLowerCase();
    if(name.length<5||!name.includes(' ')||!$('correo').checkValidity()){err('startError','Escriba su nombre completo y un correo válido.');return;}
    const btn=$('startBtn');btn.disabled=true;state.busy=true;err('startError','');
    try{
      const data=await request('/api/start',{name,email});
      state.name=name;state.email=email;state.token=data.attemptToken;state.questions=data.questions;state.deadline=new Date(data.deadline).getTime();state.answers={};state.index=0;
      save();setStep('quiz');renderQuestion();startClock();
    }catch(error){err('startError',error.message);}
    finally{btn.disabled=false;state.busy=false;}
  }
  async function submit(expired=false){
    if(state.busy||state.result)return;
    if(!expired && countComplete()<10){
      const pending=state.questions.map((q,i)=>complete(q,state.answers[q.id])?-1:i).filter(i=>i>=0);
      err('qError',`Aún tienes ${pending.length} pregunta(s) sin completar. Puedes volver a ellas antes de finalizar.`);
      return;
    }
    state.busy=true;$('next').disabled=true;err('qError','');
    try{
      const data=await request('/api/submit',{email:state.email,attemptToken:state.token,answers:state.answers});
      state.result=data;save();clearInterval(state.timer);state.timer=null;showResult();
    }catch(error){err('qError',error.message+' Si el problema continúa, contacte a los organizadores.');}
    finally{state.busy=false;$('next').disabled=false;}
  }
  const status = d => d.reviewStatus || (d.isPerfect ? 'correct' : d.yourAnswer === 'Sin responder' ? 'unanswered' : 'incorrect');
  const statusText = {correct:'Correcta',partial:'Parcialmente acertada',incorrect:'Para revisar',unanswered:'Sin responder'};
  function showResult(){
    const result=state.result;if(!result)return;
    $('nota').textContent=resultScore(result);
    $('completedMessage').textContent='Registrado el '+result.completedAt+' (hora de Costa Rica).';
    const partial=result.details.filter(d=>status(d)==='partial').length;
    const other=result.details.filter(d=>['incorrect','unanswered'].includes(status(d))).length;
    const notes=[];
    if(partial)notes.push(`${partial} parcialmente acertada${partial===1?'':'s'}`);
    if(other)notes.push(`${other} por revisar`);
    $('reviewMessage').textContent=notes.length?`${notes.join(' · ')}. Puedes ver qué identificaste bien y qué te faltó.`:'Todas las preguntas fueron respondidas correctamente.';
    const bar=$('bar');bar.replaceChildren();
    result.details.forEach(d=>{const el=make('i');el.className=status(d)==='correct'?'ok':status(d)==='partial'?'partial':'no';bar.append(el);});
    if(state.feedbackSent){$('feedbackForm').hidden=true;$('feedbackInfo').textContent='Gracias por tu opinión.';}
    else {$('feedbackForm').hidden=false;}
    setStep('end');
  }
  const multiline = (parent,label,value,kind) => {
    const row=put(parent,make('div','ans'));
    const symbol=put(row,make('span','ans__ic '+kind));symbol.textContent=kind==='ok'?'✓':kind==='no'?'×':kind==='partial'?'≈':'—';
    const content=put(row,make('div'));put(content,make('div','ans__l',label));put(content,make('div','ans__t',value));
  };
  const reviewList = (parent, label, values, type) => {
    if(!Array.isArray(values)||!values.length)return;
    const container=put(parent,make('div','review-list review-list--'+type));
    put(container,make('p','review-list__label',label));
    const ul=put(container,make('ul','review-list__items'));
    for(const item of values)put(ul,make('li','',item));
  };
  function paintReview(){
    const result=state.result;if(!result)return;
    const list=$('rlist');list.replaceChildren();
    const filtered=result.details.map((d,i)=>({...d,num:i+1})).filter(d=>state.filter==='all'||(state.filter==='ok'?d.isPerfect:!d.isPerfect));
    const partial=result.details.filter(d=>status(d)==='partial').length;
    const perfect=result.details.filter(d=>d.isPerfect).length;
    const credited=result.details.filter(d=>d.points===5).length;
    $('sum').textContent=`${perfect} de 10 respuestas completamente correctas${partial?`, ${partial} parcialmente acertada${partial===1?'':'s'}`:''}. `+(result.scoringVersion===2
      ? `${credited} con crédito de 0,5 puntos. Cada pregunta correcta suma 1 punto. En selección múltiple se requiere al menos la mitad de las opciones correctas y ninguna incorrecta para sumar 0,5; en ordenamiento y relaciones, al menos la mitad de los pasos o relaciones correctos. Las demás suman 0.`
      : 'Este intento conserva el criterio anterior: un punto por pregunta completamente correcta, sin crédito parcial.');
    document.querySelectorAll('[data-rf]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rf===state.filter)));
    if(!filtered.length){put(list,make('li','ri','No hay preguntas en esta categoría.'));return;}
    filtered.forEach(d=>{
      const s=status(d);
      const li=put(list,make('li','ri'));
      li.dataset.s=s;
      if(result.scoringVersion===2)put(li,make('p','qinstructions',`Puntos: ${d.points/10} de 1`));
      const head=put(li,make('button','ri__h'));head.type='button';head.setAttribute('aria-expanded','false');
      put(head,make('span','ri__n',String(d.num).padStart(2,'0')));
      put(head,make('span','ri__q',d.question));
      const marker=put(head,make('span','ri__s',statusText[s]));
      marker.setAttribute('aria-label',`${statusText[s]} · ${result.scoringVersion===2?d.points/10:d.isPerfect?1:0} de 1 punto`);
      put(head,make('span','ri__c'));
      const body=put(li,make('div','ri__b'));
      const msg=put(body,make('div','review-message review-message--'+s));
      put(msg,make('span','review-message__title',statusText[s]));
      put(msg,make('p','review-message__text',d.reviewSummary || (d.isPerfect?'Respuesta correcta.':'Revisa la respuesta esperada y su explicación.')));
      multiline(body,'Tu respuesta',d.yourAnswer,s==='correct'?'ok':s==='partial'?'partial':s==='unanswered'?'na':'no');
      if(s==='partial'){
        reviewList(body,d.type==='order'?'Pasos que colocaste correctamente':d.type==='match'?'Relaciones que acertaste':'Lo que seleccionaste correctamente',d.reviewCorrect,'correct');
        reviewList(body,d.type==='order'?'Posiciones que debes revisar':d.type==='match'?'Relaciones esperadas que debes revisar':'Opciones que faltó seleccionar',d.reviewMissing,'missing');
        reviewList(body,'Opciones marcadas que no correspondían',d.reviewIncorrect,'incorrect');
      }
      if(!d.isPerfect)multiline(body,'Respuesta esperada',d.correctAnswer,'ok');
      const why=put(body,make('div','why'));put(why,make('b','','Para recordar'));put(why,make('span','',d.explanation));
      head.addEventListener('click',()=>{const expanded=li.classList.toggle('is-open');head.setAttribute('aria-expanded',String(expanded));});
    });
  }
  async function sendFeedback(e){
    e.preventDefault();if(state.feedbackSent)return;
    const rating=document.querySelector('input[name="rating"]:checked');
    const topic=$('feedbackTopic').value.trim();
    if(!rating || !topic){$('feedbackInfo').textContent='Para enviar tu opinión selecciona una valoración y un tema. Esta sección es opcional.';return;}
    $('feedbackBtn').disabled=true;$('feedbackInfo').textContent='Guardando tu opinión…';
    try{
      await request('/api/feedback',{email:state.email,attemptToken:state.token,rating:rating?Number(rating.value):null,topic});
      state.feedbackSent=true;save();$('feedbackForm').hidden=true;$('feedbackInfo').textContent='Tu opinión quedó registrada.';
    }catch(ex){$('feedbackInfo').textContent=ex.message;$('feedbackBtn').disabled=false;}
  }
  async function hydrate(){
    let cached=null;try{cached=JSON.parse(sessionStorage.getItem(KEY)||'null');}catch{}
    if(!cached?.token||!cached?.email)return;
    state.name=cached.name;state.email=cached.email;state.token=cached.token;
    state.answers=cached.answers||{};state.index=Math.max(0,Math.min(9,cached.index||0));state.feedbackSent=!!cached.feedbackSent;
    if(cached.result){state.result=cached.result;showResult();return;}
    try{
      const data=await request('/api/resume',{email:state.email,attemptToken:state.token});
      state.questions=data.questions;state.deadline=new Date(data.deadline).getTime();
      setStep('quiz');renderQuestion();startClock();
    }catch(e){if(/finalizó|Versión/.test(e.message)){try{sessionStorage.removeItem(KEY);}catch{}}else err('startError','No se pudo recuperar un intento anterior: '+e.message);}
  }
  $('startForm').addEventListener('submit',begin);
  $('prev').addEventListener('click',()=>{if(state.index>0){state.index--;renderQuestion();window.scrollTo({top:0,behavior:'smooth'});}});
  $('next').addEventListener('click',()=>{if(state.busy)return;if(state.index<9){state.index++;renderQuestion();window.scrollTo({top:0,behavior:'smooth'});}else submit(false);});
  $('toRev').addEventListener('click',()=>{state.filter='rep';paintReview();setStep('rev');});
  $('back').addEventListener('click',showResult);
  document.querySelectorAll('[data-rf]').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.rf;paintReview();}));
  $('feedbackForm').addEventListener('submit',sendFeedback);
  hydrate();
})();
