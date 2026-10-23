import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS} from '../lib/questions.js';
import {createPresentation,publicPresentation,grade,validateResponses} from '../lib/quiz.js';

function answerAll(p){
  return Object.fromEntries(p.ids.map(id=>{
    const q=QUESTIONS.find(q=>q.id===id),m=p.maps[id];
    if(q.type==='single')return [id,m.options.indexOf(q.correct)];
    if(q.type==='multi')return [id,q.correct.map(c=>m.options.indexOf(c))];
    if(q.type==='order')return [id,q.steps.map((_,i)=>m.steps.indexOf(i))];
    return [id,m.rows.map(k=>m.choices.indexOf(q.rows[k].answer))];
  }));
}

test('banco oficial tiene exactamente 10 preguntas y cuatro tipos',()=>{
 assert.equal(QUESTIONS.length,10);
 assert.deepEqual([...new Set(QUESTIONS.map(q=>q.type))].sort(),['match','multi','order','single']);
});
test('secreto de respuestas ausente del JSON público',()=>{
 const p=createPresentation(),data=publicPresentation(p);
 assert.equal(data.length,10);
 assert(data.every(q=>!Object.hasOwn(q,'explanation') && !Object.hasOwn(q,'correct') && !Object.hasOwn(q,'answer')));
});
test('aleatorización: 100 intentos producen órdenes diferentes de preguntas y respuestas',()=>{
 const ps=Array.from({length:100},()=>createPresentation());
 assert(new Set(ps.map(p=>p.ids.join(','))).size>80);
 assert(new Set(ps.map(p=>p.maps[2].options.join(','))).size>10);
 assert(new Set(ps.map(p=>p.maps[9].choices.join(','))).size>10);
});
test('cada intento califica correctamente aunque las preguntas y opciones se mezclen',()=>{
 for(let i=0;i<100;i++){
  const p=createPresentation(),answers=answerAll(p);
  assert(validateResponses(p,answers));
  const result=grade(p,answers);
  assert.equal(result.score,100);
  assert.equal(result.correctCount,10);
  assert(result.details.every(x=>x.points===10));
 }
});
test('preguntas incompletas dan 0 sin respuestas',()=>{
 const p=createPresentation();
 const result=grade(p,{});
 assert.equal(result.score,0);
 assert.equal(result.correctCount,0);
});
test('multi penaliza marcar todo y permite crédito parcial',()=>{
 const p=createPresentation(),a=answerAll(p);
 a[3]=[0,1,2,3,4];
 const r=grade(p,a);
 assert.equal(r.details.find(d=>d.id===3).points,0);
 const b=answerAll(p),idx=p.maps[3].options.indexOf(0);
 b[3]=[idx];
 assert.equal(grade(p,b).details.find(d=>d.id===3).points,2.5);
});
test('relacionar y ordenar otorgan puntos parciales',()=>{
 const p=createPresentation(),a=answerAll(p);
 a[9][0]=null;
 assert.equal(grade(p,a).details.find(d=>d.id===9).points,7.5);
 const b=answerAll(p);
 [b[1][0],b[1][1]]=[b[1][1],b[1][0]];
 assert.equal(grade(p,b).details.find(d=>d.id===1).points,5);
});
test('se rechazan índices inválidos y respuestas duplicadas',()=>{
 const p=createPresentation(),a=answerAll(p);
 a[3]=[0,0];assert(!validateResponses(p,a));
 const b=answerAll(p);b[9]=[0,0,0,0];assert(!validateResponses(p,b));
 const c=answerAll(p);c[1]=[0,0,1,2];assert(!validateResponses(p,c));
});
