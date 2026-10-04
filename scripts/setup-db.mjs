import {readFile} from 'node:fs/promises';
import {database} from '../server/db.mjs';
try {for(const file of ['schema.sql','seed.sql'])await database().query(await readFile(new URL(`../database/${file}`,import.meta.url),'utf8'));console.log('Fourth Crown database setup complete. Existing prices and orders preserved.');}catch(e){console.error('Setup failed:',e.code||e.message);process.exitCode=1;}finally{await database().end();}
