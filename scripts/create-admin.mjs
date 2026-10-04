import {database} from '../server/db.mjs';
import {hashPassword} from '../server/auth.mjs';
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
try{if(!email||!password||password.length<12)throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in .env.');await database().query("insert into admin_users(email,password_hash,role) values($1,$2,'admin') on conflict(email) do nothing",[email,hashPassword(password)]);console.log('Administrator created if not already present. Existing account/password preserved. Remove ADMIN_PASSWORD from .env now.');}catch(e){console.error('Admin setup failed:',e.message);process.exitCode=1;}finally{if(process.env.DATABASE_URL)await database().end();}
