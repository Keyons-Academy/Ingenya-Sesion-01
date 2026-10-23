import {onlyMethod,json,isAdmin,db,dateCR} from '../../lib/server.js';
import {formatDuration,scoreTen} from '../../lib/report.js';
export default async function handler(req,res){
 if(!onlyMethod(req,res,'GET'))return;
 if(!isAdmin(req))return json(res,401,{error:'No autorizado.'});
 try{
  const sql=db();
  const [counts]=await sql`SELECT COUNT(*)::integer AS n FROM submissions`;
  const rows=await sql`
    SELECT s.id,s.full_name,s.email,s.correct_count,s.submitted_at,s.feedback_rating,s.feedback_topic,
           CASE WHEN a.started_at IS NULL THEN NULL
                ELSE GREATEST(0, ROUND(EXTRACT(EPOCH FROM (s.submitted_at - a.started_at)))::integer)
           END AS duration_seconds
    FROM submissions s
    LEFT JOIN quiz_attempts a ON a.email_normalized=s.email_normalized
    ORDER BY s.submitted_at DESC LIMIT 3000`;
  return json(res,200,{count:counts.n,results:rows.map(r=>({
    id:r.id,name:r.full_name,email:r.email,correct:r.correct_count,score:scoreTen(r),
    completedAt:dateCR(r.submitted_at),completedAtISO:new Date(r.submitted_at).toISOString(),
    durationSeconds:r.duration_seconds,duration:formatDuration(r.duration_seconds),
    rating:r.feedback_rating,topic:r.feedback_topic
  }))});
 }catch(e){console.error('admin results',e);return json(res,500,{error:'No se pudieron cargar los resultados.'});}
}
