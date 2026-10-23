import {createHash,timingSafeEqual} from 'node:crypto';
import {onlyMethod,validOrigin,json,db} from '../lib/server.js';
import {publicPresentation,QUIZ_SECONDS} from '../lib/quiz.js';
const safeEq=(a,b)=>{try{const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&timingSafeEqual(x,y);}catch{return false;}};
export default async function handler(req,res){
  if(!onlyMethod(req,res,'POST'))return;
  if(!validOrigin(req))return json(res,403,{error:'Origen no permitido.'});
  const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
  const token=typeof req.body?.attemptToken==='string'?req.body.attemptToken:'';
  if(!email||!/^[a-f0-9]{64}$/.test(token))return json(res,400,{error:'Intento inválido.'});
  try{
    const sql=db(),rows=await sql`SELECT full_name,token_hash,started_at,expires_at,completed_at,presentation FROM quiz_attempts WHERE email_normalized=${email}`;
    if(!rows.length||!safeEq(createHash('sha256').update(token).digest('hex'),rows[0].token_hash))return json(res,403,{error:'Intento no autorizado.'});
    if(rows[0].completed_at)return json(res,409,{error:'Este intento ya finalizó.'});
    if(!rows[0].presentation?.ids)return json(res,409,{error:'El intento pertenece a una versión anterior del formulario.'});
    return json(res,200,{name:rows[0].full_name,questions:publicPresentation(rows[0].presentation),startedAt:rows[0].started_at,deadline:rows[0].expires_at,durationSeconds:QUIZ_SECONDS});
  }catch(e){console.error('resume',e);return json(res,500,{error:'No se pudo recuperar el intento.'});}
}
