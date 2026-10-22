import {onlyMethod,validOrigin,json,db,dateCR} from '../lib/server.js';
import {QUESTIONS} from '../lib/questions.js';
export default async function handler(req,res){
 if(!onlyMethod(req,res,'POST'))return;
 if(!validOrigin(req))return json(res,403,{error:'Origen no permitido'});
 const body=req.body||{};const name=typeof body.name==='string'?body.name.trim().replace(/\s+/g,' '):'';
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 if(name.length<5||name.length>140||!name.includes(' ')||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return json(res,400,{error:'Indique nombre completo y correo válido.'});
 if(!Array.isArray(body.answers)||body.answers.length!==10)return json(res,400,{error:'Responda las 10 preguntas.'});
 const ids=new Set();const ans={};
 for(const a of body.answers){if(!a||!Number.isInteger(a.id)||!Number.isInteger(a.answer)||a.answer<0||a.answer>3||ids.has(a.id)||!QUESTIONS.some(q=>q.id===a.id))return json(res,400,{error:'Respuestas inválidas.'});ids.add(a.id);ans[a.id]=a.answer;}
 const correct=QUESTIONS.filter(q=>ans[q.id]===q.correct).length;const score=correct*10;
 try{
  const sql=db();
  const rows=await sql`INSERT INTO submissions (full_name,email,email_normalized,answers,correct_count,score,passed)
    VALUES (${name},${email},${email},${JSON.stringify(ans)}::jsonb,${correct},${score},${score>=80})
    ON CONFLICT (email_normalized) DO NOTHING RETURNING id,submitted_at`;
  if(!rows.length)return json(res,409,{error:'Este correo ya tiene una evaluación registrada. Solo se permite un intento.'});
  return json(res,200,{name,score,correct,total:10,passed:score>=80,completedAt:dateCR(rows[0].submitted_at),review:QUESTIONS.filter(q=>ans[q.id]!==q.correct).map(q=>({id:q.id,question:q.question,yourAnswer:q.options[ans[q.id]],correctAnswer:q.options[q.correct],explanation:q.explanation}))});
 }catch(e){console.error('Submit error',e.message);return json(res,500,{error:'No pudimos guardar la evaluación. Intente nuevamente; si el intento fue registrado, el sistema impedirá duplicarlo.'});}
}
