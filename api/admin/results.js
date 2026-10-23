import {onlyMethod,json,isAdmin,db,dateCR} from '../../lib/server.js';
export default async function handler(req,res){
 if(!onlyMethod(req,res,'GET'))return;
 if(!isAdmin(req))return json(res,401,{error:'No autorizado.'});
 try{
  const sql=db();
  const [counts]=await sql`SELECT COUNT(*)::integer AS n FROM submissions`;
  const rows=await sql`SELECT id,full_name,email,correct_count,score,submitted_at,feedback_rating,feedback_topic FROM submissions ORDER BY submitted_at DESC LIMIT 3000`;
  return json(res,200,{count:counts.n,results:rows.map(r=>({id:r.id,name:r.full_name,email:r.email,correct:r.correct_count,score:r.score,completedAt:dateCR(r.submitted_at),rating:r.feedback_rating,topic:r.feedback_topic}))});
 }catch(e){console.error('admin results',e);return json(res,500,{error:'No se pudieron cargar los resultados.'});}
}
