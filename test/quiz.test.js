import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS} from '../lib/questions.js';
import {createPresentation,publicPresentation,grade,validateResponses} from '../lib/quiz.js';
import {formatDuration,scoreTen} from '../lib/report.js';

function answerAll(p){
 return Object.fromEntries(p.ids.map(id=>{
  const q=QUESTIONS.find(q=>q.id===id),m=p.maps[id];
  if(q.type==='single')return [id,m.options.indexOf(q.correct)];
  if(q.type==='multi')return [id,q.correct.map(c=>m.options.indexOf(c))];
  if(q.type==='order')return [id,q.steps.map((_,i)=>m.steps.indexOf(i))];
  return [id,m.rows.map(k=>m.choices.indexOf(q.rows[k].answer))];
 }));
}
test('banco oficial contiene diez preguntas de cuatro tipos',()=>{
 assert.equal(QUESTIONS.length,10);
 assert.deepEqual([...new Set(QUESTIONS.map(q=>q.type))].sort(),['match','multi','order','single']);
});
test('JSON público no filtra clave ni explicaciones',()=>{
 const p=createPresentation(),data=publicPresentation(p);
 assert.equal(data.length,10);
 assert(data.every(q=>!Object.hasOwn(q,'explanation')&&!Object.hasOwn(q,'correct')&&!Object.hasOwn(q,'answer')));
});
test('100 intentos mezclan preguntas y alternativas',()=>{
 const ps=Array.from({length:100},()=>createPresentation());
 assert(new Set(ps.map(p=>p.ids.join(','))).size>80);
 assert(new Set(ps.map(p=>p.maps[2].options.join(','))).size>10);
 assert(new Set(ps.map(p=>p.maps[9].choices.join(','))).size>10);
});
test('10 preguntas correctas => 10/10 independiente del orden',()=>{
 for(let i=0;i<100;i++){
  const p=createPresentation(),answers=answerAll(p);
  assert(validateResponses(p,answers));
  const r=grade(p,answers);
  assert.equal(r.score,10);assert.equal(r.correctCount,10);
  assert(r.details.every(x=>x.points===10&&x.isPerfect));
 }
});
test('2 completamente correctas => 2/10, nunca puntos parciales',()=>{
 const p=createPresentation(),full=answerAll(p),partial={};
 const singles=p.ids.filter(id=>QUESTIONS.find(q=>q.id===id).type==='single');
 partial[singles[0]]=full[singles[0]];
 partial[singles[1]]=full[singles[1]];
 const r=grade(p,partial);
 assert.equal(r.score,2);assert.equal(r.correctCount,2);
 assert.equal(r.details.filter(x=>x.isPerfect).length,2);
});
test('sin respuesta => 0/10',()=>{
 const p=createPresentation(),r=grade(p,{});
 assert.equal(r.score,0);assert.equal(r.correctCount,0);
});
test('selección múltiple: todas y solo correctas, sin crédito parcial',()=>{
 const p=createPresentation(),a=answerAll(p);a[3]=[0,1,2,3,4];
 assert.equal(grade(p,a).details.find(d=>d.id===3).points,0);
 const b=answerAll(p);b[3]=[p.maps[3].options.indexOf(0)];
 assert.equal(grade(p,b).details.find(d=>d.id===3).points,0);
 const c=answerAll(p);
 assert.equal(grade(p,c).details.find(d=>d.id===3).points,10);
});
test('ordenar y relacionar requieren todas las correspondencias',()=>{
 const p=createPresentation(),a=answerAll(p);
 a[9][0]=null;
 assert.equal(grade(p,a).details.find(d=>d.id===9).points,0);
 const b=answerAll(p);[b[1][0],b[1][1]]=[b[1][1],b[1][0]];
 assert.equal(grade(p,b).details.find(d=>d.id===1).points,0);
});
test('rechaza índices inválidos y respuestas duplicadas',()=>{
 const p=createPresentation(),a=answerAll(p);a[3]=[0,0];assert(!validateResponses(p,a));
 const b=answerAll(p);b[9]=[0,0,0,0];assert(!validateResponses(p,b));
 const c=answerAll(p);c[1]=[0,0,1,2];assert(!validateResponses(p,c));
});
test('duración mm:ss es calculada a partir de segundos',()=>{
 assert.equal(formatDuration(85),'01:25');
 assert.equal(formatDuration(720),'12:00');
 assert.equal(formatDuration(0),'00:00');
 assert.equal(formatDuration(null),'—');
});
test('nota administrativa histórica procede de preguntas completamente correctas',()=>{
 assert.equal(scoreTen({correct_count:2,score:8}),2);
 assert.equal(scoreTen({correct_count:10,score:100}),10);
});

test('selección múltiple incompleta reconoce opciones acertadas, sin sumar puntos',()=>{
 const p=createPresentation(), all=answerAll(p);
 const first=p.maps[10].options.indexOf(0);
 const r=grade(p,{10:[first]}),d=r.details.find(x=>x.id===10);
 assert.equal(r.score,0);
 assert.equal(d.reviewStatus,'partial');
 assert.equal(d.points,0);
 assert.equal(d.reviewCorrect.length,1);
 assert.equal(d.reviewMissing.length,3);
 assert.equal(d.reviewIncorrect.length,0);
 assert.match(d.reviewSummary,/1 de 4/);
});
test('opción adicional incorrecta distingue el error de los aciertos',()=>{
 const p=createPresentation();
 const correct=[0,1,3,4].map(i=>p.maps[10].options.indexOf(i));
 const wrong=p.maps[10].options.indexOf(2);
 const d=grade(p,{10:[...correct,wrong]}).details.find(x=>x.id===10);
 assert.equal(d.reviewStatus,'partial');
 assert.equal(d.reviewCorrect.length,4);
 assert.equal(d.reviewMissing.length,0);
 assert.equal(d.reviewIncorrect.length,1);
 assert.equal(d.points,0);
});
test('ninguna opción correcta se clasifica como para revisar',()=>{
 const p=createPresentation();
 const wrong=p.maps[10].options.indexOf(2);
 const d=grade(p,{10:[wrong]}).details.find(x=>x.id===10);
 assert.equal(d.reviewStatus,'incorrect');
 assert.equal(d.reviewCorrect.length,0);
 assert.equal(d.reviewMissing.length,4);
});
test('ordenamiento parcialmente correcto recibe retroalimentación, no puntos',()=>{
 const p=createPresentation(),a=answerAll(p);const x=[...a[1]];
 [x[0],x[1]]=[x[1],x[0]];
 const d=grade(p,{1:x}).details.find(x=>x.id===1);
 assert.equal(d.reviewStatus,'partial');
 assert.equal(d.reviewCorrect.length,2);
 assert.equal(d.reviewMissing.length,2);
 assert.equal(d.points,0);
});
test('relaciones parcialmente correctas muestran lo logrado y faltante',()=>{
 const p=createPresentation(),a=answerAll(p);a[9][1]=null;
 const d=grade(p,{9:a[9]}).details.find(x=>x.id===9);
 assert.equal(d.reviewStatus,'partial');
 assert.equal(d.reviewCorrect.length,3);
 assert.equal(d.reviewMissing.length,1);
 assert.equal(d.points,0);
});
test('preguntas de selección única distinguen error de acierto parcial',()=>{
 const p=createPresentation(),correct=p.maps[2].options.indexOf(1);
 const wrong=p.maps[2].options.findIndex(i=>i!==1);
 const a=grade(p,{2:correct}).details.find(x=>x.id===2);
 const b=grade(p,{2:wrong}).details.find(x=>x.id===2);
 assert.equal(a.reviewStatus,'correct');
 assert.equal(b.reviewStatus,'incorrect');
 assert.equal(b.reviewCorrect.length,0);
});
