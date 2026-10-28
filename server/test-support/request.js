const request=require('supertest');
const key=require('node:crypto').randomBytes(24).toString('hex');
process.env.API_KEYS=key;
module.exports=app=>{const agent=request(app);for(const method of ['get','post','patch','delete','put']){const original=agent[method].bind(agent);agent[method]=url=>original(url).set('X-API-Key',key);}return agent;};
