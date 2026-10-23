import {onlyMethod,json} from '../lib/server.js';
export default function handler(req,res){if(!onlyMethod(req,res,'GET'))return;return json(res,410,{error:'Las preguntas se asignan al iniciar un intento.'});}
