import ExcelJS from 'exceljs';
import {onlyMethod,json,isAdmin,db,dateCR} from '../../lib/server.js';
import {QUESTIONS} from '../../lib/questions.js';
const safe = v => {if(v===null||v===undefined)return '';const s=String(v);return /^[=+@\-\t\r]/.test(s)?"'"+s:s;};
export default async function handler(req,res){
 if(!onlyMethod(req,res,'GET'))return;
 if(!isAdmin(req))return json(res,401,{error:'No autorizado.'});
 try{
  const sql=db();
  const rows=await sql`SELECT id,full_name,email,correct_count,score,submitted_at,question_scores,feedback_rating,feedback_topic,answers FROM submissions ORDER BY submitted_at DESC`;
  const book=new ExcelJS.Workbook();book.creator='GENIA 2026';book.created=new Date();
  const sheet=book.addWorksheet('Resultados',{views:[{state:'frozen',ySplit:4}]});
  const endCol='T';
  sheet.mergeCells(`A1:${endCol}1`);sheet.getCell('A1').value='GENIA 2026  |  Taller Genia 01 - Prompting con propósito';
  sheet.getCell('A1').font={bold:true,size:16,color:{argb:'FFFFFFFF'}};
  sheet.getCell('A1').fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF10122A'}};
  sheet.getRow(1).height=34;
  sheet.mergeCells(`A2:${endCol}2`);sheet.getCell('A2').value='Resultados y retroalimentación · Zona horaria: Costa Rica';sheet.getCell('A2').font={italic:true,color:{argb:'FF6B6D7E'}};
  const headers=['ID','Nombre completo','Correo','Fecha y hora (Costa Rica)','Preguntas perfectas','Nota / 100','Utilidad (1 a 5)','Tema por reforzar','P1','P2','P3','P4','P5','P6','P7','P8','P9','P10'];
  sheet.getRow(4).values=headers;
  sheet.getRow(4).height=30;
  sheet.getRow(4).eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF729BDD'}};c.font={bold:true,color:{argb:'FFFFFFFF'}};c.alignment={vertical:'middle'};});
  rows.forEach((r,i)=>{
   const points=r.question_scores||{};
   const out=[r.id,safe(r.full_name),safe(r.email),dateCR(r.submitted_at),r.correct_count,r.score,r.feedback_rating??'',safe(r.feedback_topic),...QUESTIONS.map(q=>points[q.id]??'—')];
   const row=sheet.addRow(out);
   if(i%2===0)row.eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF1F5FB'}};});
   row.getCell(6).font={bold:true,color:{argb:'FF10122A'}};
  });
  sheet.columns.forEach((c,i)=>{c.width=[11,30,33,27,21,15,17,50][i]||11;});
  sheet.autoFilter={from:'A4',to:'R4'};
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
  res.status(200).setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').setHeader('Content-Disposition','attachment; filename="GENIA_2026_Prompting_Resultados.xlsx"').setHeader('Cache-Control','no-store').send(Buffer.from(buf));
 }catch(e){console.error('excel',e);return json(res,500,{error:'No se pudo generar el Excel.'});}
}
