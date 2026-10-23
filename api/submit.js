import {createHash,timingSafeEqual} from 'node:crypto';
import {onlyMethod,validOrigin,json,db,dateCR} from '../lib/server.js';
import {QUESTIONS} from '../lib/questions.js';
const same=(a,b)=>{try{const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&timingSafeEqual(x,y)}catch{return false}};
export default async function handler(req,res){
 if(!onlyMethod(req,res,'POST'))return;
 if(!validOrigin(req))return json(res,403,{error:'Origen no permitido'});
 const body=req.body||{};const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 const token=typeof body.attemptToken==='string'?body.attemptToken:'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||token.length!==64)return json(res,400,{error:'Identificación de intento inválida.'});
 if(!Array.isArray(body.answers)||body.answers.length>10)return json(res,400,{error:'Respuestas inválidas.'});
 const ans={},ids=new Set();
 for(const a of body.answers){if(!a||!Number.isInteger(a.id)||!Number.isInteger(a.answer)||a.answer<0||a.answer>3||ids.has(a.id)||!QUESTIONS.some(q=>q.id===a.id))return json(res,400,{error:'Respuestas inválidas.'});ids.add(a.id);ans[a.id]=a.answer;}
 try{
  const sql=db();const attempts=await sql`SELECT full_name,token_hash,expires_at,completed_at FROM quiz_attempts WHERE email_normalized=${email}`;
  if(!attempts.length||!same(createHash('sha256').update(token).digest('hex'),attempts[0].token_hash))return json(res,403,{error:'Intento no autorizado.'});
  if(attempts[0].completed_at)return json(res,409,{error:'Este intento ya fue registrado.'});
  // Margen mínimo para que el envío automático iniciado a los 12 minutos llegue al servidor.
  if(Date.now()>new Date(attempts[0].expires_at).getTime()+15000)return json(res,410,{error:'El plazo de 12 minutos terminó. Comunícate con el organizador si hubo un problema de conexión.'});
  if(Date.now()<new Date(attempts[0].expires_at).getTime()&&ids.size!==10)return json(res,400,{error:'Responde las diez preguntas o espera a que termine el tiempo.'});
  const correct=QUESTIONS.filter(q=>ans[q.id]===q.correct).length,score=correct*10;
  const rows=await sql`INSERT INTO submissions(full_name,email,email_normalized,answers,correct_count,score,passed)
    VALUES (${attempts[0].full_name},${email},${email},${JSON.stringify(ans)}::jsonb,${correct},${score},${false})
    ON CONFLICT (email_normalized) DO NOTHING RETURNING id,submitted_at`;
  if(!rows.length)return json(res,409,{error:'Este correo ya tiene un resultado registrado.'});
  await sql`UPDATE quiz_attempts SET completed_at=NOW() WHERE email_normalized=${email} AND completed_at IS NULL`;
  return json(res,200,{name:attempts[0].full_name,score,correct,total:10,completedAt:dateCR(rows[0].submitted_at),review:QUESTIONS.filter(q=>ans[q.id]!==q.correct).map(q=>({id:q.id,question:q.question,yourAnswer:ans[q.id]===undefined?'Sin responder':q.options[ans[q.id]],correctAnswer:q.options[q.correct],explanation:q.explanation}))});
 }catch(e){console.error('submit',e.message);return json(res,500,{error:'No pudimos guardar las respuestas. Comprueba tu conexión e inténtalo de nuevo.'});}
}
