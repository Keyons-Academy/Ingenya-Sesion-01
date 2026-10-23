import PDFDocument from 'pdfkit';
import {onlyMethod,json,isAdmin,db,dateCR} from '../../lib/server.js';
export default async function handler(req,res){
 if(!onlyMethod(req,res,'GET'))return;if(!isAdmin(req))return json(res,401,{error:'No autorizado'});
 try{
  const sql=db();const rows=await sql`SELECT full_name,email,score,correct_count,submitted_at FROM submissions ORDER BY submitted_at DESC`;
  res.status(200).setHeader('Content-Type','application/pdf').setHeader('Content-Disposition','attachment; filename="GENIA_2026_resultados.pdf"').setHeader('Cache-Control','no-store');
  const doc=new PDFDocument({size:'A4',margin:43,bufferPages:true});doc.pipe(res);
  const navy='#11142e',blue='#739bdf',muted='#737b8c';
  function heading(first=false){doc.fillColor(navy).font('Helvetica-Bold').fontSize(18).text('Resultados de evaluación');doc.fillColor(muted).font('Helvetica').fontSize(10).text('Taller Genia 01 - Prompting con propósito');doc.moveDown(.45);doc.fillColor(blue).rect(43,doc.y,509,2).fill();doc.moveDown(1);if(first){const avg=rows.length?Math.round(rows.reduce((s,r)=>s+r.score,0)/rows.length):0;doc.fillColor(navy).fontSize(10).text(`Participantes: ${rows.length}     Nota promedio: ${rows.length?avg:'—'}/100     Zona horaria: Costa Rica`);doc.moveDown(1);}}
  heading(true);const positions=[43,200,355,490],widths=[150,150,128,55];
  function columns(v,header=false){const y=doc.y;if(header){doc.rect(43,y,509,23).fill(navy);doc.fillColor('white').font('Helvetica-Bold').fontSize(9);}else{doc.fillColor(navy).font('Helvetica').fontSize(8.5);}v.forEach((t,i)=>doc.text(String(t),positions[i]+5,y+(header?7:5),{width:widths[i]-10,lineBreak:false,ellipsis:true}));doc.y=y+(header?23:26);if(!header){doc.strokeColor('#e0e7f1').moveTo(43,doc.y).lineTo(552,doc.y).stroke();}}
  columns(['Nombre','Correo','Fecha/hora CR','Nota'],true);
  for(const row of rows){if(doc.y>748){doc.addPage();heading();columns(['Nombre','Correo','Fecha/hora CR','Nota'],true);}columns([row.full_name,row.email,dateCR(row.submitted_at),`${row.score}/100`]);}
  if(!rows.length)doc.fillColor(muted).fontSize(11).text('Aún no hay participaciones registradas.');
  const pages=doc.bufferedPageRange();for(let i=0;i<pages.count;i++){doc.switchToPage(i);doc.fillColor(muted).fontSize(8).text(`GENIA 2026 · Uso interno · Página ${i+1} de ${pages.count}`,43,795,{width:509,align:'right'});}doc.end();
 }catch(e){console.error('pdf export',e.message);if(!res.headersSent)return json(res,500,{error:'No se pudo generar el PDF.'});res.end();}
}
