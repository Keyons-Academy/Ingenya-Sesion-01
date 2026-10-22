import {onlyMethod,json} from '../lib/server.js';import{publicQuestions}from '../lib/questions.js';
export default function handler(req,res){if(!onlyMethod(req,res,'GET'))return;return json(res,200,{questions:publicQuestions(),total:10,passingScore:80});}
