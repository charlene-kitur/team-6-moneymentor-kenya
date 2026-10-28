const request=require('supertest');const {createApp}=require('../app');
const key='a'.repeat(48), other='b'.repeat(48);
const db={query:async()=>[[]]};
const app=()=>createApp(db,{apiKeys:key+','+other,rateLimitMax:3});
test('health public; API missing and invalid keys rejected',async()=>{const a=app();expect((await request(a).get('/api/health')).status).toBe(200);for(const value of ['', 'wrong'])expect((await request(a).get('/api/expenses').set('X-API-Key',value)).status).toBe(401);});
test('valid key permits data and limit is per key',async()=>{const a=app();const statuses=[];for(let i=0;i<5;i++){const r=await request(a).get('/api/expenses').set('X-API-Key',key);statuses.push(r.status);if(i>=3)expect(Number(r.headers['retry-after'])).toBeGreaterThan(0);}expect(statuses).toEqual([200,200,200,429,429]);expect((await request(a).get('/api/expenses').set('X-API-Key',other)).status).toBe(200);});
