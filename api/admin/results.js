import{onlyMethod,json,isAdmin,db,dateCR}from'../../lib/server.js';
export default async function handler(req,res){if(!onlyMethod(req,res,'GET'))return;if(!isAdmin(req))return json(res,401,{error:'No autorizado'});
 try{const sql=db();const rows=await sql`SELECT id,full_name,email,correct_count,score,passed,submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 3000`;
 return json(res,200,{results:rows.map(r=>({id:r.id,name:r.full_name,email:r.email,correct:r.correct_count,score:r.score,passed:r.passed,completedAt:dateCR(r.submitted_at)})),count:rows.length});}
 catch(e){console.error('results',e.message);return json(res,500,{error:'No se pudieron cargar los resultados.'});}}
