import PDFDocument from 'pdfkit';
import {onlyMethod,json,isAdmin,db,dateCR} from '../../lib/server.js';
export default async function handler(req,res){
 if(!onlyMethod(req,res,'GET'))return;
 if(!isAdmin(req))return json(res,401,{error:'No autorizado.'});
 try{
  const sql=db();
  const rows=await sql`SELECT full_name,email,score,submitted_at,feedback_rating,feedback_topic FROM submissions ORDER BY submitted_at DESC`;
  res.status(200).setHeader('Content-Type','application/pdf').setHeader('Content-Disposition','attachment; filename="GENIA_2026_Prompting_Resultados.pdf"').setHeader('Cache-Control','no-store');
  const doc=new PDFDocument({size:'A4',margin:44,bufferPages:true});doc.pipe(res);
  const navy='#10122A',blue='#729BDD',muted='#6B6D7E';
  function head(first=false){
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(20).text('Resultados de evaluación');
    doc.fillColor(muted).font('Helvetica').fontSize(10).text('Taller Genia 01 - Prompting con propósito');
    doc.moveDown(.7);doc.rect(44,doc.y,507,2).fill(blue);doc.moveDown(1);
    if(first){const avg=rows.length?Math.round(rows.reduce((a,r)=>a+r.score,0)/rows.length):0;
      doc.fillColor(navy).font('Helvetica').fontSize(10).text(`Participantes: ${rows.length}     Nota promedio: ${rows.length?avg+' / 100':'—'}     Zona horaria: Costa Rica`);doc.moveDown(1);}
  }
  function row(data,header=false){
    const xs=[44,188,340,460,508],ws=[144,152,120,48,43],y=doc.y;
    if(header){doc.rect(44,y,507,23).fill(navy);doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.5);}
    else{doc.fillColor(navy).font('Helvetica').fontSize(8);}
    data.forEach((value,i)=>doc.text(String(value||''),xs[i]+5,y+(header?7:6),{width:ws[i]-10,height:16,lineBreak:false,ellipsis:true}));
    doc.y=y+(header?23:27);
    if(!header)doc.strokeColor('#E0E1E5').moveTo(44,doc.y).lineTo(551,doc.y).stroke();
  }
  head(true);row(['Nombre','Correo','Fecha y hora CR','Nota','Util.'],true);
  for(const r of rows){
    if(doc.y>740){doc.addPage();head();row(['Nombre','Correo','Fecha y hora CR','Nota','Util.'],true);}
    row([r.full_name,r.email,dateCR(r.submitted_at),`${r.score}/100`,r.feedback_rating??'—']);
  }
  if(!rows.length)doc.fillColor(muted).fontSize(11).text('No hay resultados registrados.');
  const topics=rows.filter(r=>r.feedback_topic?.trim());
  if(topics.length){
    doc.addPage();head();doc.fillColor(navy).font('Helvetica-Bold').fontSize(14).text('Temas solicitados para reforzar');doc.moveDown(.7);
    for(const r of topics){
      if(doc.y>730){doc.addPage();head();}
      doc.font('Helvetica-Bold').fontSize(9).fillColor(navy).text(String(r.full_name).slice(0,140));
      doc.font('Helvetica').fontSize(9).fillColor(muted).text(String(r.feedback_topic).slice(0,500),{width:507});doc.moveDown(.5);
    }
  }
  const pages=doc.bufferedPageRange();
  for(let i=0;i<pages.count;i++){doc.switchToPage(i);doc.font('Helvetica').fontSize(8).fillColor(muted).text(`GENIA 2026 · Uso interno · Página ${i+1} de ${pages.count}`,44,790,{width:507,align:'right'});}
  doc.end();
 }catch(e){console.error('pdf',e);if(!res.headersSent)return json(res,500,{error:'No se pudo generar el PDF.'});res.end();}
}
