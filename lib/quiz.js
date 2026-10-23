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


// Se recibe un índice visible en pantalla; el servidor lo convierte con el mapa de ese intento.
export function grade(p, responses = {}) {
  const details = [];
  for (const id of p.ids) {
    const q = QUESTIONS.find(x => x.id === id);
    const m = p.maps[id];
    const value = responses[id];
    let points = 0, mine = 'Sin responder', correctText = '';
    let reviewStatus = 'unanswered';
    let reviewSummary = 'No se registró una respuesta para esta pregunta.';
    let reviewCorrect = [], reviewMissing = [], reviewIncorrect = [];
    if (q.type === 'single') {
      const correctDisplay = m.options.indexOf(q.correct);
      correctText = q.options[q.correct];
      if (isIndex(value,q.options.length)) {
        mine = q.options[m.options[value]];
        points = value === correctDisplay ? 10 : 0;
        reviewStatus = points === 10 ? 'correct' : 'incorrect';
        reviewSummary = points === 10
          ? 'Elegiste la alternativa que mejor responde a la situación.'
          : 'La alternativa seleccionada no resuelve adecuadamente la situación. Revisa el criterio que se explica abajo.';
      }
    } else if (q.type === 'multi') {
      const selected = Array.isArray(value) && value.every(i=>isIndex(i,q.options.length)) ? [...new Set(value)] : [];
      const originals = selected.map(i=>m.options[i]);
      const hits = originals.filter(i=>q.correct.includes(i));
      const extra = originals.filter(i=>!q.correct.includes(i));
      const missing = q.correct.filter(i=>!originals.includes(i));
      const exact = missing.length === 0 && extra.length === 0;
      points = exact ? 10 : 0;
      mine = selected.length ? originals.map(i=>q.options[i]).join('\n') : 'Sin responder';
      correctText = q.correct.map(i=>q.options[i]).join('\n');
      reviewCorrect = hits.map(i=>q.options[i]);
      reviewMissing = missing.map(i=>q.options[i]);
      reviewIncorrect = extra.map(i=>q.options[i]);
      if(selected.length) {
        reviewStatus = exact ? 'correct' : hits.length>0 ? 'partial' : 'incorrect';
        if(exact) reviewSummary = `Identificaste las ${q.correct.length} opciones correctas y no marcaste ninguna adicional.`;
        else if(hits.length) reviewSummary = `Identificaste ${hits.length} de ${q.correct.length} opciones correctas.${extra.length ? ` También marcaste ${extra.length} que no correspondía${extra.length===1?'':'n'}.` : ''}`;
        else reviewSummary = 'Ninguna de las opciones seleccionadas corresponde a las acciones esperadas. Puedes compararlas con las alternativas correctas.';
      }
    } else if (q.type === 'order') {
      const valid = sameMembers(value,q.steps.length);
      if(valid) {
        const originals = value.map(i=>m.steps[i]);
        const hits = originals.filter((v,i)=>v===i).length;
        points = hits===q.steps.length ? 10 : 0;
        mine = originals.map((v,i)=>`${i+1}. ${q.steps[v]}`).join('\n');
        reviewCorrect = originals.flatMap((v,i)=>v===i?[`${i+1}. ${q.steps[v]}`]:[]);
        reviewMissing = q.steps.flatMap((step,i)=>originals[i]!==i?[`${i+1}. ${step}`]:[]);
        reviewStatus = points===10 ? 'correct' : hits>0 ? 'partial' : 'incorrect';
        reviewSummary = points===10
          ? 'Ordenaste correctamente los cuatro pasos.'
          : `Ubicaste ${hits} de ${q.steps.length} pasos en su posición correcta. Compara la secuencia con el orden esperado.`;
      }
      correctText = q.steps.map((s,i)=>`${i+1}. ${s}`).join('\n');
    } else if (q.type === 'match') {
      const valid = Array.isArray(value) && value.length === q.rows.length && value.every(v=>v===null||isIndex(v,q.choices.length));
      if (valid) {
        let hits=0;
        mine = m.rows.map((canonicalRow,j)=>{
          const answer = value[j];
          const right = answer !== null && q.rows[canonicalRow].answer === m.choices[answer];
          const correctLine = `${q.rows[canonicalRow].text} → ${q.choices[q.rows[canonicalRow].answer]}`;
          if(right) { hits++; reviewCorrect.push(correctLine); }
          else reviewMissing.push(correctLine);
          return `${q.rows[canonicalRow].text} → ${answer===null?'Sin responder':q.choices[m.choices[answer]]}`;
        }).join('\n');
        points = hits===q.rows.length ? 10 : 0;
        reviewStatus = points===10 ? 'correct' : hits>0 ? 'partial' : value.every(v=>v===null) ? 'unanswered' : 'incorrect';
        reviewSummary = points===10
          ? `Relacionaste correctamente las ${q.rows.length} situaciones.`
          : `Relacionaste correctamente ${hits} de ${q.rows.length} situaciones. Revisa las asociaciones que faltaron.`;
      }
      correctText = q.rows.map(r=>`${r.text} → ${q.choices[r.answer]}`).join('\n');
    }
    const isPerfect = points===10;
    details.push({id:q.id,type:q.type,category:q.category,question:q.question,points,maxPoints:10,isPerfect,
      reviewStatus,reviewSummary,reviewCorrect,reviewMissing,reviewIncorrect,
      yourAnswer:mine,correctAnswer:correctText,explanation:q.explanation});
  }
  // La nota se mantiene en escala de 0 a 10, sin crédito parcial.
  // El estado 'partial' solo aporta retroalimentación; NO modifica los puntos.
  const correctCount = details.filter(x => x.isPerfect).length;
  return {score:correctCount,correctCount,details};
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
