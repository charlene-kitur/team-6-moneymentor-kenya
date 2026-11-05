// Trusted local administrator only. Customer requests cannot set booking prices.
const path = require('node:path');
require('dotenv').config({path:path.join(__dirname,'.env.demo'),override:true});
const jwt = require('jsonwebtoken');
const db = require('./db');
const validId = value => /^[1-9]\d*$/.test(String(value)) && Number(value) <= 2147483647;
async function main() {
  const [command,id,...args] = process.argv.slice(2);
  if (!validId(id)) throw new Error('Supply a positive customer or booking ID.');
  if (command === 'customer') {
    const name = args.join(' ').trim();
    if (!name || name.length > 100) throw new Error('Supply a name of 1-100 characters.');
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('INSERT INTO wallet_customers (id,name) VALUES (?,?)',[id,name]);
      await connection.execute('INSERT INTO wallets (customer_id) VALUES (?)',[id]);
      await connection.commit();
      console.log('Customer and empty wallet created.');
    } catch(error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  } else if (command === 'token') {
    const [[customer]] = await db.execute('SELECT id FROM wallet_customers WHERE id=?',[id]);
    if (!customer) throw new Error('Customer not found.');
    const secret=process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret)<32 || secret.startsWith('replace_')) throw new Error('Configure JWT_SECRET.');
    console.log(jwt.sign({role:'customer'},secret,{algorithm:'HS256',subject:id,expiresIn:'1h',issuer:process.env.JWT_ISSUER||'moneymentor-local',audience:process.env.JWT_AUDIENCE||'moneymentor-api'}));
  } else if (command === 'booking') {
    const [customer,handyman,amount]=args;
    if (args.length!==3 || !validId(customer) || !validId(handyman) || !/^\d+$/.test(amount) || Number(amount)<1 || Number(amount)>1000000000) throw new Error('Use booking BOOKING_ID CUSTOMER_ID HANDYMAN_ID AMOUNT_CENTS.');
    await db.execute('INSERT INTO wallet_bookings (id,customer_id,handyman_id,amount_cents) VALUES (?,?,?,?)',[id,customer,handyman,amount]);
    console.log('Pending booking registered. Existing bookings are never overwritten.');
  } else throw new Error('Use customer ID NAME, token ID, or booking ID CUSTOMER_ID HANDYMAN_ID AMOUNT_CENTS.');
}
main().catch(error=>{console.error(error.code||error.message);process.exitCode=1;}).finally(()=>db.end());
