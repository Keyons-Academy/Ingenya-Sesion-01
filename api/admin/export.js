import ExcelJS from 'exceljs';
import {onlyMethod,json,isAdmin,db,dateCR} from '../../lib/server.js';
import {formatDuration,scoreTen} from '../../lib/report.js';
import {QUESTIONS} from '../../lib/questions.js';
const safe = v => {if(v===null||v===undefined)return '';const s=String(v);return /^[=+@\-\t\r]/.test(s)?"'"+s:s;};
export default async function handler(req,res){
 if(!onlyMethod(req,res,'GET'))return;
 if(!isAdmin(req))return json(res,401,{error:'No autorizado.'});
 try{
  const sql=db();
  const rows=await sql`
    SELECT s.id,s.full_name,s.email,s.correct_count,s.score,a.presentation->>'scoringVersion' AS scoring_version,s.submitted_at,s.question_scores,s.feedback_rating,s.feedback_topic,
           CASE WHEN a.started_at IS NULL THEN NULL
                ELSE GREATEST(0, ROUND(EXTRACT(EPOCH FROM (s.submitted_at - a.started_at)))::integer)
           END AS duration_seconds
    FROM submissions s
    LEFT JOIN quiz_attempts a ON a.email_normalized=s.email_normalized
    ORDER BY s.submitted_at DESC`;
  const book=new ExcelJS.Workbook();book.creator='Taller Genia 01';book.created=new Date();
  const sheet=book.addWorksheet('Resultados',{views:[{state:'frozen',ySplit:4}]});
  const endCol='S';
  sheet.mergeCells(`A1:${endCol}1`);sheet.getCell('A1').value='Taller Genia 01  |  Prompting con propósito';
  sheet.getCell('A1').font={bold:true,size:16,color:{argb:'FFFFFFFF'}};
  sheet.getCell('A1').fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF10122A'}};
  sheet.getRow(1).height=34;
  sheet.mergeCells(`A2:${endCol}2`);sheet.getCell('A2').value='Resultados y satisfacción · Zona horaria: Costa Rica · Escala de 0 a 10';sheet.getCell('A2').font={italic:true,color:{argb:'FF6B6D7E'}};
  const headers=['ID','Nombre completo','Correo','Fecha y hora (Costa Rica)','Tiempo de resolución (mm:ss)','Respuestas correctas','Nota / 10','Satisfacción con el taller (1 a 5)','Tema por reforzar','P1','P2','P3','P4','P5','P6','P7','P8','P9','P10'];
  sheet.getRow(4).values=headers;
  sheet.getRow(4).height=33;
  sheet.getRow(4).eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF729BDD'}};c.font={bold:true,color:{argb:'FFFFFFFF'}};c.alignment={vertical:'middle',wrapText:true};});
  rows.forEach((r,i)=>{
   const points=r.question_scores||{};
   const perQuestion=QUESTIONS.map(q=>{
     const value=points[q.id];
     return value===undefined?'—':Number(r.scoring_version)===2?Number(value)/10:Number(value)===10?1:0;
   });
   const out=[r.id,safe(r.full_name),safe(r.email),dateCR(r.submitted_at),formatDuration(r.duration_seconds),r.correct_count,scoreTen(r),r.feedback_rating??'',safe(r.feedback_topic||'No indicado'),...perQuestion];
   const row=sheet.addRow(out);
   if(i%2===0)row.eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF1F5FB'}};});
   row.getCell(7).font={bold:true,color:{argb:'FF10122A'}};
  });
  sheet.columns.forEach((c,i)=>{c.width=[11,30,33,27,27,22,13,32,43][i]||12;});
  sheet.autoFilter={from:'A4',to:'S4'};
  const detail=book.addWorksheet('Preguntas y clave');detail.columns=[{header:'N.º',key:'number',width:9},{header:'Tipo',key:'type',width:19},{header:'Tema',key:'category',width:30},{header:'Pregunta',key:'question',width:100},{header:'Respuesta esperada',key:'correct',width:110}];
  for(const q of QUESTIONS){
   let answer='';
   if(q.type==='single')answer=q.options[q.correct];
   if(q.type==='multi')answer=q.correct.map(i=>q.options[i]).join(' / ');
   if(q.type==='order')answer=q.steps.map((s,i)=>`${i+1}. ${s}`).join(' / ');
   if(q.type==='match')answer=q.rows.map(r=>`${r.text} → ${q.choices[r.answer]}`).join(' / ');
   detail.addRow({number:q.id,type:q.type,category:q.category,question:q.question,correct:answer});
  }
  detail.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};
  detail.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF10122A'}};
  const buf=await book.xlsx.writeBuffer();
  res.status(200).setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').setHeader('Content-Disposition','attachment; filename="Taller_Genia_01_Resultados.xlsx"').setHeader('Cache-Control','no-store').send(Buffer.from(buf));
 }catch(e){console.error('excel',e);return json(res,500,{error:'No se pudo generar el Excel.'});}
}
