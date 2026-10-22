import{onlyMethod,validOrigin,json,adminCookie}from'../../lib/server.js';
export default function handler(req,res){if(!onlyMethod(req,res,'POST'))return;if(!validOrigin(req))return json(res,403,{error:'Origen no permitido'});res.setHeader('Set-Cookie',adminCookie('',0));json(res,200,{ok:true});}
