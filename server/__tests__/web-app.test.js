const request=require('supertest'),express=require('express');
const {createWebApp}=require('../web-app');
let upstream;afterEach(async()=>{if(upstream)await new Promise(r=>upstream.close(r));});
test('local gateway keeps key server-side and forwards live response',async()=>{
 const key=require('crypto').randomBytes(24).toString('hex');const api=express();
 api.get('/api/partner/rewards',(req,res)=>{expect(req.get('X-API-Key')).toBe(key);res.json({source:'Partner API',claims:[]});});
 upstream=api.listen(0,'127.0.0.1');await new Promise(r=>upstream.once('listening',r));
 const app=createWebApp({apiUrl:'http://127.0.0.1:'+upstream.address().port,apiKey:key});
 const r=await request(app).get('/api/partner/rewards').set('Host','localhost:3000');expect(r.status).toBe(200);expect(r.body).toEqual({source:'Partner API',claims:[]});expect(r.text).not.toContain(key);
 expect((await request(app).get('/api/partner/rewards').set('Host','attacker.example')).status).toBe(403);
 expect((await request(app).get('/api/partner/rewards').set('Host','localhost:3000').set('Origin','https://attacker.example')).status).toBe(403);
 expect((await request(app).get('/api/expenses').set('Host','localhost:3000')).status).toBe(404);
});
test('backend unavailable gives friendly response without crashing gateway',async()=>{
 const api=express();upstream=api.listen(0,'127.0.0.1');await new Promise(r=>upstream.once('listening',r));const port=upstream.address().port;await new Promise(r=>upstream.close(r));upstream=null;
 const app=createWebApp({apiUrl:'http://127.0.0.1:'+port,apiKey:'test-only'});
 const r=await request(app).get('/api/partner/rewards').set('Host','localhost:3000');expect(r.status).toBe(502);expect(r.body.message).toContain('unavailable');expect((await request(app).get('/api/other').set('Host','localhost:3000')).status).toBe(404);
});
