import test from 'node:test';
import assert from 'node:assert/strict';
import {QUESTIONS} from '../lib/questions.js';
import {createPresentation,publicPresentation,grade} from '../lib/quiz.js';

test('cada distractor de selección única explica la elección visible tras aleatorizar',()=>{
 for(let run=0;run<100;run++){
  const p=createPresentation();
  for(const q of QUESTIONS.filter(q=>q.type==='single')){
   assert.equal(q.optionFeedback.length,q.options.length);
   for(let original=0;original<q.options.length;original++){
    const displayed=p.maps[q.id].options.indexOf(original);
    const d=grade(p,{[q.id]:displayed}).details.find(d=>d.id===q.id);
    assert.equal(d.yourAnswer,q.options[original]);
    assert.equal(d.correctAnswer,q.options[q.correct]);
    assert.equal(d.points,original===q.correct?10:0);
    if(original!==q.correct)assert.equal(d.reviewSummary,q.optionFeedback[original]);
   }
  }
  assert(publicPresentation(p).every(q=>!('optionFeedback' in q)));
 }
});

test('el repaso explica por qué un acierto parcial suma medio punto o cero',()=>{
 const p=createPresentation(),q=QUESTIONS.find(q=>q.type==='multi');
 const correct=q.correct.map(c=>p.maps[q.id].options.indexOf(c));
 const wrong=p.maps[q.id].options.findIndex(c=>!q.correct.includes(c));
 const detail=answers=>grade(p,{[q.id]:answers}).details.find(d=>d.id===q.id);
 assert.match(detail(correct.slice(0,2)).reviewSummary,/suma 0,5 puntos/);
 assert.match(detail(correct.slice(0,1)).reviewSummary,/no alcanzaste la mitad/);
 assert.match(detail([...correct,wrong]).reviewSummary,/no debes marcar opciones incorrectas/);
 const match=QUESTIONS.find(q=>q.type==='match');
 const empty=grade(p,{[match.id]:Array(match.rows.length).fill(null)}).details.find(d=>d.id===match.id);
 assert.equal(empty.reviewStatus,'unanswered');
 assert.match(empty.reviewSummary,/No seleccionaste ninguna herramienta/);
});

test('diez respuestas totalmente incorrectas dan cero y un repaso sin aciertos',()=>{
 for(let run=0;run<100;run++){
  const p=createPresentation();
  const answers=Object.fromEntries(QUESTIONS.map(q=>{
   const m=p.maps[q.id];
   if(q.type==='single')return [q.id,m.options.findIndex(i=>i!==q.correct)];
   if(q.type==='multi')return [q.id,m.options.map((original,i)=>q.correct.includes(original)?-1:i).filter(i=>i>=0)];
   if(q.type==='order')return [q.id,q.steps.map((_,i)=>m.steps.indexOf((i+1)%q.steps.length))];
   return [q.id,m.rows.map(row=>m.choices.indexOf((q.rows[row].answer+1)%q.choices.length))];
  }));
  const r=grade(p,answers);
  assert.equal(r.score,0);
  assert(r.details.every(d=>d.points===0&&d.reviewStatus==='incorrect'));
 }
});
