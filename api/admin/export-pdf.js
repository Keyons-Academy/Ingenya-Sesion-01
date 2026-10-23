import PDFDocument from 'pdfkit';
import {onlyMethod,json,isAdmin,db,dateCR} from '../../lib/server.js';
import {formatDuration,scoreTen} from '../../lib/report.js';
import {PDF_KEYONS_LOGO,PDF_INGENYA_LOGO} from '../../lib/pdf-branding.js';
export default async function handler(req,res){
 if(!onlyMethod(req,res,'GET'))return;
 if(!isAdmin(req))return json(res,401,{error:'No autorizado.'});
 try{
  const sql=db();
  const rows=await sql`
    SELECT s.full_name,s.email,s.correct_count,s.score,a.presentation->>'scoringVersion' AS scoring_version,s.submitted_at,s.feedback_rating,s.feedback_topic,
           CASE WHEN a.started_at IS NULL THEN NULL
                ELSE GREATEST(0, ROUND(EXTRACT(EPOCH FROM (s.submitted_at - a.started_at)))::integer)
           END AS duration_seconds
    FROM submissions s LEFT JOIN quiz_attempts a ON a.email_normalized=s.email_normalized
    ORDER BY s.submitted_at DESC`;
  res.status(200).setHeader('Content-Type','application/pdf').setHeader('Content-Disposition','attachment; filename="Taller_Genia_01_Resultados.pdf"').setHeader('Cache-Control','no-store');
  const doc=new PDFDocument({size:'A4',margin:44,bufferPages:true});doc.pipe(res);
  const navy='#10122A',blue='#729BDD',muted='#6B6D7E';
  function head(first=false){
    // Los logos provienen de los mismos recursos de marca utilizados en la web.
    // Se incrustan mediante buffers para funcionar en funciones serverless de Vercel.
    doc.image(PDF_KEYONS_LOGO,44,36,{fit:[91,54],align:'center',valign:'center'});
    doc.strokeColor('#D5D8E1').lineWidth(.8).moveTo(150,43).lineTo(150,84).stroke();
    doc.image(PDF_INGENYA_LOGO,166,37,{fit:[118,52],align:'center',valign:'center'});
    doc.fillColor(muted).font('Helvetica-Bold').fontSize(9).text('TALLER GENIA 01',360,57,{width:191,align:'right'});
    doc.strokeColor('#D5D8E1').lineWidth(.8).moveTo(44,102).lineTo(551,102).stroke();
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(20).text('Resultados de evaluación',44,116,{width:507});
    doc.fillColor(muted).font('Helvetica').fontSize(10).text('Taller Genia 01 - Prompting con propósito',44,144,{width:507});
    doc.rect(44,165,507,2).fill(blue);
    doc.y=180;
    if(first){const avg=rows.length?(rows.reduce((a,r)=>a+scoreTen(r),0)/rows.length).toFixed(1):0;
      doc.fillColor(navy).font('Helvetica').fontSize(10).text(`Participaciones: ${rows.length}     Nota promedio: ${rows.length?avg+' / 10':'—'}     Zona horaria: Costa Rica`,44,doc.y,{width:507});doc.moveDown(1);}
  }
  function row(data,header=false){
    const xs=[44,156,298,402,457,505],ws=[112,142,104,55,48,46],y=doc.y;
    if(header){doc.rect(44,y,507,25).fill(navy);doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5);}
    else{doc.fillColor(navy).font('Helvetica').fontSize(7.5);}
    data.forEach((value,i)=>doc.text(String(value??''),xs[i]+4,y+(header?7:6),{width:ws[i]-8,height:18,lineBreak:false,ellipsis:true}));
    doc.y=y+(header?25:28);
    if(!header)doc.strokeColor('#E0E1E5').moveTo(44,doc.y).lineTo(551,doc.y).stroke();
  }
  head(true);row(['Nombre','Correo','Fecha y hora CR','Tiempo','Nota','Sat./5'],true);
  for(const r of rows){
    if(doc.y>740){doc.addPage();head();row(['Nombre','Correo','Fecha y hora CR','Tiempo','Nota','Sat./5'],true);}
    row([r.full_name,r.email,dateCR(r.submitted_at),formatDuration(r.duration_seconds),`${scoreTen(r)}/10`,r.feedback_rating??'—']);
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
  for(let i=0;i<pages.count;i++){doc.switchToPage(i);doc.font('Helvetica').fontSize(8).fillColor(muted).text(`Taller Genia 01 · Uso interno · Página ${i+1} de ${pages.count}`,44,790,{width:507,align:'right'});}
  doc.end();
 }catch(e){console.error('pdf',e);if(!res.headersSent)return json(res,500,{error:'No se pudo generar el PDF.'});res.end();}
}
