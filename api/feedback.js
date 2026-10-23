import {createHash,timingSafeEqual} from 'node:crypto';
import {onlyMethod,validOrigin,json,db} from '../lib/server.js';
const eq=(a,b)=>{try{const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&timingSafeEqual(x,y);}catch{return false;}};
export default async function handler(req,res){
 if(!onlyMethod(req,res,'POST'))return;
 if(!validOrigin(req))return json(res,403,{error:'Origen no permitido.'});
 const body=req.body||{},email=typeof body.email==='string'?body.email.trim().toLowerCase():'',token=body.attemptToken;
 if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json(res,400,{error:'Intento inválido.'});
 const rating=body.rating===null?null:Number(body.rating),topic=typeof body.topic==='string'?body.topic.trim():'';
 if((rating!==null&&(!Number.isInteger(rating)||rating<1||rating>5))||topic.length>500)return json(res,400,{error:'Retroalimentación inválida.'});
 try{
  const sql=db(),rows=await sql`SELECT token_hash,completed_at FROM quiz_attempts WHERE email_normalized=${email}`;
  if(!rows.length||!rows[0].completed_at||!eq(createHash('sha256').update(token).digest('hex'),rows[0].token_hash))return json(res,403,{error:'No autorizado.'});
  const out=await sql`UPDATE submissions SET feedback_rating=${rating},feedback_topic=${topic},feedback_submitted_at=NOW()
    WHERE email_normalized=${email} AND feedback_submitted_at IS NULL RETURNING id`;
  if(!out.length)return json(res,409,{error:'La retroalimentación ya fue registrada.'});
  return json(res,200,{ok:true});
 }catch(e){console.error('feedback',e);return json(res,500,{error:'No se pudo registrar la opinión.'});}
}
