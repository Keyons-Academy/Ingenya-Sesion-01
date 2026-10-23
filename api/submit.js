import {createHash,timingSafeEqual} from 'node:crypto';
import {onlyMethod,validOrigin,json,db,dateCR} from '../lib/server.js';
import {grade,validateResponses,isAnswered,publicPresentation} from '../lib/quiz.js';
const same=(a,b)=>{try{const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&timingSafeEqual(x,y);}catch{return false;}};
export default async function handler(req,res){
 if(!onlyMethod(req,res,'POST'))return;
 if(!validOrigin(req))return json(res,403,{error:'Origen no permitido.'});
 const body=req.body||{};
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 const token=typeof body.attemptToken==='string'?body.attemptToken:'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!/^[a-f0-9]{64}$/.test(token))return json(res,400,{error:'Identificación del intento inválida.'});
 if(JSON.stringify(body.answers||{}).length>12000)return json(res,400,{error:'Respuestas demasiado extensas.'});
 try{
  const sql=db(),attempts=await sql`SELECT full_name,token_hash,expires_at,completed_at,presentation FROM quiz_attempts WHERE email_normalized=${email}`;
  if(!attempts.length||!same(createHash('sha256').update(token).digest('hex'),attempts[0].token_hash))return json(res,403,{error:'Intento no autorizado.'});
  const attempt=attempts[0];
  if(attempt.completed_at)return json(res,409,{error:'Este intento ya fue registrado.'});
  if(!attempt.presentation?.ids)return json(res,409,{error:'Versión de intento incompatible. Comuníquese con los organizadores.'});
  if(!validateResponses(attempt.presentation,body.answers))return json(res,400,{error:'El formato de las respuestas no es válido.'});
  const now=Date.now(),deadline=new Date(attempt.expires_at).getTime();
  if(now>deadline+15000)return json(res,410,{error:'La ventana de envío ha terminado. Comuníquese con los organizadores.'});
  const publicQ=publicPresentation(attempt.presentation);
  if(now<deadline && publicQ.some(q=>!isAnswered(q,body.answers?.[q.id])))return json(res,400,{error:'Complete las diez preguntas antes de finalizar. Si el tiempo termina, se registrará lo que haya respondido.'});
  const graded=grade(attempt.presentation,body.answers);
  const rows=await sql`INSERT INTO submissions(full_name,email,email_normalized,answers,question_scores,correct_count,score,passed)
   VALUES (${attempt.full_name},${email},${email},${JSON.stringify(body.answers)}::jsonb,${JSON.stringify(Object.fromEntries(graded.details.map(x=>[x.id,x.points])))}::jsonb,${graded.correctCount},${graded.score},${false})
   ON CONFLICT (email_normalized) DO NOTHING RETURNING id,submitted_at`;
  if(!rows.length)return json(res,409,{error:'Este participante ya tiene un resultado registrado.'});
  await sql`UPDATE quiz_attempts SET completed_at=NOW() WHERE email_normalized=${email} AND completed_at IS NULL`;
  return json(res,200,{name:attempt.full_name,score:graded.score,correct:graded.correctCount,total:10,completedAt:dateCR(rows[0].submitted_at),details:graded.details});
 }catch(e){console.error('submit',e);return json(res,500,{error:'No fue posible guardar las respuestas. Revise su conexión y vuelva a intentarlo.'});}
}
