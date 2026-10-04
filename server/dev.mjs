import 'dotenv/config';
import http from 'node:http';
import {createServer} from 'vite';
import stripeWebhook from '../api/stripe-webhook.js';
import {handler} from './app.mjs';
const vite=await createServer({server:{middlewareMode:true},appType:'spa'});
http.createServer((req,res)=>req.url.startsWith('/api/stripe-webhook')?stripeWebhook(req,res):req.url.startsWith('/api/app')?handler(req,res):vite.middlewares(req,res)).listen(3000,'127.0.0.1',()=>console.log('FOURTH CROWN: http://localhost:3000'));
