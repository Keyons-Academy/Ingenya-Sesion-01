import {randomBytes,createHash} from 'node:crypto';
import {onlyMethod,validOrigin,json,db} from '../lib/server.js';
import {publicQuestions} from '../lib/questions.js';
export default async function handler(req,res){
 if(!onlyMethod(req,res,'POST'))return;
 if(!validOrigin(req))return json(res,403,{error:'Origen no permitido.'});
 const name=typeof req.body?.name==='string'?req.body.name.trim().replace(/\s+/g,' '):'';
 const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
 if(name.length<5||name.length>140||!name.includes(' ')||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return json(res,400,{error:'Indica nombre completo y correo válido.'});
 const token=randomBytes(32).toString('hex');const hash=createHash('sha256').update(token).digest('hex');
 try{
  const sql=db();
  const rows=await sql`INSERT INTO quiz_attempts(email_normalized,full_name,token_hash,expires_at) VALUES (${email},${name},${hash},NOW()+INTERVAL '12 minutes') ON CONFLICT (email_normalized) DO NOTHING RETURNING started_at,expires_at`;
  if(!rows.length)return json(res,409,{error:'Este correo ya inició su único intento. No se puede comenzar otra vez.'});
  return json(res,200,{questions:publicQuestions(),attemptToken:token,startedAt:rows[0].started_at,deadline:rows[0].expires_at,durationSeconds:720});
 }catch(e){console.error('start',e.message);return json(res,500,{error:'No se pudo iniciar. Verifica la conexión y que hayas ejecutado schema.sql en Neon.'});}
}
