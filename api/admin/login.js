import {onlyMethod,validOrigin,json,db,verifyPassword,makeSession,adminCookie,clientHash} from '../../lib/server.js';
export default async function handler(req,res){
 if(!onlyMethod(req,res,'POST'))return;if(!validOrigin(req))return json(res,403,{error:'Origen no permitido'});
 const password=req.body?.password;
 if(typeof password!=='string'||password.length>300)return json(res,400,{error:'Contraseña inválida'});
 try{
  const sql=db(),hash=clientHash(req);
  const [rec]=await sql`SELECT attempts,locked_until FROM admin_login_limits WHERE ip_hash=${hash}`;
  if(rec?.locked_until&&new Date(rec.locked_until)>new Date())return json(res,429,{error:'Demasiados intentos. Vuelva a intentar en 15 minutos.'});
  if(!verifyPassword(password)){
   await sql`INSERT INTO admin_login_limits (ip_hash,attempts,window_start,locked_until) VALUES (${hash},1,NOW(),NULL)
   ON CONFLICT (ip_hash) DO UPDATE SET attempts=CASE WHEN admin_login_limits.window_start<NOW()-INTERVAL '15 minutes' THEN 1 ELSE admin_login_limits.attempts+1 END,
   window_start=CASE WHEN admin_login_limits.window_start<NOW()-INTERVAL '15 minutes' THEN NOW() ELSE admin_login_limits.window_start END,
   locked_until=CASE WHEN admin_login_limits.window_start>=NOW()-INTERVAL '15 minutes' AND admin_login_limits.attempts>=4 THEN NOW()+INTERVAL '15 minutes' ELSE NULL END`;
   return json(res,401,{error:'Credenciales incorrectas'});
  }
  await sql`DELETE FROM admin_login_limits WHERE ip_hash=${hash}`;
  res.setHeader('Set-Cookie',adminCookie(makeSession()));return json(res,200,{ok:true});
 }catch(e){console.error('login',e.message);return json(res,500,{error:'No se pudo iniciar sesión. Verifique la configuración.'});}
}
