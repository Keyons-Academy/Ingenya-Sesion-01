import { randomInt } from 'node:crypto';
import { QUESTIONS } from './questions.js';

export const TOTAL_QUESTIONS = QUESTIONS.length;
export const QUIZ_SECONDS = 720;

export function shuffle(values) {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const range = n => Array.from({length:n}, (_,i)=>i);

// Una permutación distinta por intento, guardada en BD: nunca vuelve a mezclarse al navegar o recargar.
export function createPresentation() {
  const ids = shuffle(QUESTIONS.map(q => q.id));
  const maps = {};
  for (const q of QUESTIONS) {
    if (q.type === 'single' || q.type === 'multi') maps[q.id] = {options: shuffle(range(q.options.length))};
    else if (q.type === 'order') maps[q.id] = {steps: shuffle(range(q.steps.length))};
    else maps[q.id] = {rows: shuffle(range(q.rows.length)), choices: shuffle(range(q.choices.length))};
  }
  return {version:3, ids, maps};
}

export function publicPresentation(p) {
  return p.ids.map(id => {
    const q = QUESTIONS.find(x => x.id === id);
    const m = p.maps[id];
    const base = {id:q.id,category:q.category,type:q.type,question:q.question,instruction:q.instruction};
    if (q.type === 'single' || q.type === 'multi') base.options = m.options.map(i => q.options[i]);
    if (q.type === 'order') base.steps = m.steps.map(i => q.steps[i]);
    if (q.type === 'match') {
      base.rows = m.rows.map(i => q.rows[i].text);
      base.choices = m.choices.map(i => q.choices[i]);
    }
    return base;
  });
}

const isIndex = (v,len) => Number.isInteger(v) && v >= 0 && v < len;
const sameMembers = (v, len) => Array.isArray(v) && v.length === len && v.every(i => isIndex(i,len)) && new Set(v).size === len;
const clamp = n => Math.max(0,Math.min(10,n));

// Se recibe un índice visible en pantalla; el servidor lo convierte con el mapa de ese intento.
export function grade(p, responses = {}) {
  let total = 0;
  const details = [];
  for (const id of p.ids) {
    const q = QUESTIONS.find(x => x.id === id);
    const m = p.maps[id];
    const value = responses[id];
    let points = 0, mine = 'Sin responder', correctText = '';
    if (q.type === 'single') {
      const correctDisplay = m.options.indexOf(q.correct);
      correctText = q.options[q.correct];
      if (isIndex(value,q.options.length)) {mine = q.options[m.options[value]];points = value === correctDisplay ? 10 : 0;}
    } else if (q.type === 'multi') {
      const selected = Array.isArray(value) && value.every(i=>isIndex(i,q.options.length)) ? [...new Set(value)] : [];
      const originals = selected.map(i=>m.options[i]);
      const hits = originals.filter(i=>q.correct.includes(i)).length;
      const wrong = originals.length - hits;
      const negatives = q.options.length - q.correct.length;
      // Crédito parcial por correctas marcadas; penalización por distractores marcados.
      points = selected.length ? clamp(10 * (hits / q.correct.length - (negatives ? wrong / negatives : 0))) : 0;
      mine = selected.length ? selected.map(i=>q.options[m.options[i]]).join(' · ') : 'Sin responder';
      correctText = q.correct.map(i=>q.options[i]).join(' · ');
    } else if (q.type === 'order') {
      const valid = sameMembers(value,q.steps.length);
      if (valid) {
        const originals = value.map(i=>m.steps[i]);
        points = (10/q.steps.length) * originals.filter((v,i)=>v===i).length;
        mine = originals.map((v,i)=>`${i+1}. ${q.steps[v]}`).join('\n');
      }
      correctText = q.steps.map((s,i)=>`${i+1}. ${s}`).join('\n');
    } else if (q.type === 'match') {
      const valid = Array.isArray(value) && value.length === q.rows.length && value.every(v=>v===null||isIndex(v,q.choices.length));
      if (valid) {
        let hits=0;
        mine = m.rows.map((canonicalRow,j)=>{
          const answer = value[j];
          if(answer !== null && q.rows[canonicalRow].answer === m.choices[answer])hits++;
          return `${q.rows[canonicalRow].text} → ${answer===null?'Sin responder':q.choices[m.choices[answer]]}`;
        }).join('\n');
        points = 10 * hits / q.rows.length;
      }
      correctText = q.rows.map(r=>`${r.text} → ${q.choices[r.answer]}`).join('\n');
    }
    points = Math.round(points*100)/100;
    total += points;
    details.push({id:q.id,type:q.type,category:q.category,question:q.question,points,maxPoints:10,isPerfect:points===10,yourAnswer:mine,correctAnswer:correctText,explanation:q.explanation});
  }
  return {score:Math.round(total),correctCount:details.filter(x=>x.isPerfect).length,details};
}

export function validateResponses(p, answers) {
  if(!answers || typeof answers!=='object' || Array.isArray(answers))return false;
  const validIds = new Set(p.ids.map(String));
  if(Object.keys(answers).some(k=>!validIds.has(k)))return false;
  return p.ids.every(id=>{
    const q=QUESTIONS.find(x=>x.id===id), a=answers[id];
    if(a===undefined||a===null)return true;
    if(q.type==='single')return isIndex(a,q.options.length);
    if(q.type==='multi')return Array.isArray(a)&&a.length<=q.options.length&&new Set(a).size===a.length&&a.every(v=>isIndex(v,q.options.length));
    if(q.type==='order')return sameMembers(a,q.steps.length);
    return Array.isArray(a)&&a.length===q.rows.length&&a.every(v=>v===null||isIndex(v,q.choices.length))&&new Set(a.filter(v=>v!==null)).size===a.filter(v=>v!==null).length;
  });
}

export function isAnswered(q, a) {
  if(q.type==='single')return Number.isInteger(a);
  if(q.type==='multi')return Array.isArray(a)&&a.length>0;
  if(q.type==='order')return Array.isArray(a)&&a.length===q.steps.length;
  return Array.isArray(a)&&a.length===q.rows.length&&a.every(v=>Number.isInteger(v));
}
