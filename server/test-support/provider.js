const request = require('supertest');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const {createApp} = require('../app');
const db = require('../db');
const secret = crypto.randomBytes(48).toString('hex');
function setupProvider() {
 const state = {};
 state.token = (id, overrides={}) => jwt.sign({}, secret, {algorithm:'HS256',subject:String(id),issuer:'moneymentor-local',audience:'moneymentor-api',expiresIn:'10m',...overrides});
 state.noExpiryToken = id => jwt.sign({},secret,{algorithm:'HS256',subject:String(id),issuer:'moneymentor-local',audience:'moneymentor-api'});
 beforeAll(async()=>{state.db=await db.getConnection();state.app=createApp(state.db,{jwtSecret:secret});});
 beforeEach(async()=>{
  await state.db.beginTransaction();
  const [one]=await state.db.execute('INSERT INTO handymen (name) VALUES (?)',['Week 7 fixture']);
  const [two]=await state.db.execute('INSERT INTO handymen (name) VALUES (?)',['Other provider']);
  state.id=one.insertId;state.other=two.insertId;
 });
 afterEach(async()=>{if(state.db)await state.db.rollback();});
 afterAll(async()=>{if(state.db)state.db.release();await db.end();});
 state.call=(method,path,body,id=state.id)=>{
  const call=request(state.app)[method](path).set('Authorization','Bearer '+state.token(id));
  return body===undefined?call:call.send(body);
 };
 state.missing=async()=>{const [r]=await state.db.execute('INSERT INTO handymen (name) VALUES (?)',['Removed fixture']);await state.db.execute('DELETE FROM handymen WHERE id=?',[r.insertId]);return r.insertId;};
 return state;
}
module.exports={setupProvider};
