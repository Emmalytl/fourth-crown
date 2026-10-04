import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword,cookie,sessionToken} from '../server/auth.mjs';
import {handler} from '../server/app.mjs';
test('password hashes have independent salts and verify correctly',()=>{const p='test-password-123';const a=hashPassword(p),b=hashPassword(p);assert.notEqual(a,b);assert.equal(verifyPassword(p,a),true);assert.equal(verifyPassword('wrong',a),false);});
test('admin cookie is HttpOnly and SameSite Strict; session requires random token format',()=>{assert.match(cookie('a'.repeat(64),100),/HttpOnly; SameSite=Strict/);assert.equal(sessionToken({headers:{cookie:'fcc_session=admin'}}),undefined);});
test('server rejects cross-origin and non-JSON mutations before database access',async()=>{for(const headers of [{origin:'https://evil.test','content-type':'application/json',host:'localhost:3000'},{origin:'http://localhost:3000','content-type':'text/plain',host:'localhost:3000'}]){let result;const res={setHeader(){},end(value){result=JSON.parse(value);}};await handler({method:'POST',url:'/api/app?action=login',headers,body:{}},res);assert.ok([403,415].includes(res.statusCode));assert.ok(result.error);}});
