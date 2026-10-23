import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS} from '../lib/questions.js';
import {createPresentation,grade} from '../lib/quiz.js';
import {scoreTen} from '../lib/report.js';
import {resultScore} from '../public/result-score.js';

test('selección múltiple: umbral de mitad sin opciones incorrectas, independiente del orden',()=>{
 for(let i=0;i<100;i++){
  const p=createPresentation(),q=QUESTIONS.find(q=>q.type==='multi'),m=p.maps[q.id];
  const answers=q.correct.map(c=>m.options.indexOf(c));
  const wrong=m.options.findIndex(c=>!q.correct.includes(c));
  for(const [selected,expected] of [[[],0],[answers.slice(0,1),0],[answers.slice(0,2),0.5],[answers.slice(0,3),0.5],[answers,1],[[...answers,wrong],0],[[...answers.slice(0,2),wrong],0]]){
   const result=grade(p,{[q.id]:selected});
   assert.equal(result.score,expected);
   assert.equal(resultScore(result),expected);
   assert.equal(scoreTen({scoring_version:2,score:result.score*10,correct_count:result.correctCount}),expected);
  }
 }
});

test('ordenamiento y relaciones: mitad obtiene 0,5; menos de mitad no obtiene crédito',()=>{
 const p=createPresentation();
 const order=QUESTIONS.find(q=>q.type==='order'),m=p.maps[order.id];
 const perfect=order.steps.map((_,i)=>m.steps.indexOf(i));
 const half=[...perfect];[half[0],half[1]]=[half[1],half[0]];
 const none=[...perfect.slice(1),perfect[0]];
 assert.equal(grade(p,{[order.id]:perfect}).score,1);
 assert.equal(grade(p,{[order.id]:half}).score,0.5);
 assert.equal(grade(p,{[order.id]:none}).score,0);
 const match=QUESTIONS.find(q=>q.type==='match'),mm=p.maps[match.id];
 const all=mm.rows.map(row=>mm.choices.indexOf(match.rows[row].answer));
 for(const [hits,expected] of [[0,0],[1,0],[2,0.5],[3,0.5],[4,1]]){
  assert.equal(grade(p,{[match.id]:all.map((answer,i)=>i<hits?answer:null)}).score,expected);
 }
});

test('nota mixta, máximo 10 y compatibilidad de intentos anteriores',()=>{
 const p=createPresentation();
 const answers=Object.fromEntries(p.ids.map(id=>{
  const q=QUESTIONS.find(q=>q.id===id),m=p.maps[id];
  if(q.type==='single')return [id,m.options.indexOf(q.correct)];
  if(q.type==='multi')return [id,q.correct.map(c=>m.options.indexOf(c))];
  if(q.type==='order')return [id,q.steps.map((_,i)=>m.steps.indexOf(i))];
  return [id,m.rows.map(row=>m.choices.indexOf(q.rows[row].answer))];
 }));
 assert.equal(grade(p,answers).score,10);
 for(const q of QUESTIONS.filter(q=>q.type==='multi'))answers[q.id]=answers[q.id].slice(0,2);
 const r=grade(p,answers);
 assert.equal(r.score,9);assert.equal(r.correctCount,8);assert.equal(resultScore(r),9);
 const legacy={...p};delete legacy.scoringVersion;
 assert.equal(grade(legacy,answers).score,8);
 assert.equal(scoreTen({score:90,correct_count:8}),8);
 assert.equal(grade(p,{}).score,0);
});
