const request=require('supertest');
const jwt=require('jsonwebtoken');
const {setupProvider}=require('../test-support/provider');
const s=setupProvider();
const routes=()=>[['get',`/api/handymen/${s.id}/income-summaries?month=2026-09`],['post',`/api/handymen/${s.id}/expenses`],['get',`/api/handymen/${s.id}/savings-goals`],['get',`/api/handymen/${s.id}/investment-projections`],['patch','/api/expenses/1'],['delete','/api/expenses/1']];
test.each(['missing','malformed','expired','wrong-signature','wrong-audience','wrong-issuer','wrong-algorithm','invalid-subject','not-active','no-expiry'])('all contract routes reject %s token',async kind=>{
 let token;
 if(kind==='invalid-subject')token=s.token('abc');
 if(kind==='not-active')token=s.token(s.id,{notBefore:'1h'});
 if(kind==='no-expiry')token=s.noExpiryToken(s.id);
 if(kind==='malformed')token='not-a-jwt';
 if(kind==='expired')token=s.token(s.id,{expiresIn:-1});
 if(kind==='wrong-signature')token=jwt.sign({},'different-secret',{subject:String(s.id),expiresIn:'1h',issuer:'moneymentor-local',audience:'moneymentor-api'});
 if(kind==='wrong-audience')token=s.token(s.id,{audience:'wrong'});
 if(kind==='wrong-issuer')token=s.token(s.id,{issuer:'wrong'});
 if(kind==='wrong-algorithm')token=s.token(s.id,{algorithm:'HS384'});
 for(const [method,path] of routes()){
  let call=request(s.app)[method](path);if(token)call=call.set('Authorization','Bearer '+token);
  const r=await call;expect(r.status).toBe(401);expect(r.body).toEqual({error:'A valid bearer token is required.'});
 }
});
test('provider path cannot expose another provider',async()=>{
 for(const suffix of ['income-summaries?month=2026-09','savings-goals','investment-projections']){const r=await s.call('get',`/api/handymen/${s.other}/${suffix}`);expect(r.status).toBe(404);}
 const r=await s.call('post',`/api/handymen/${s.other}/expenses`,{description:'x',category:'Equipment',amount:1,expense_date:'2026-09-29'});expect(r.status).toBe(404);
});
