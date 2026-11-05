const jwt = require('jsonwebtoken');
const validId = value => /^[1-9]\d*$/.test(String(value)) && Number(value) <= 2147483647;
const MAX_CENTS = 1000000000;
const fail = (status, message) => Object.assign(new Error(message), {status});

function transactionResponse(row) {
  return {
    id: row.id, customer_id: row.customer_id, type: row.kind,
    amount_cents: row.amount_cents, balance_after_cents: row.balance_after_cents,
    booking_id: row.booking_id, currency: 'KES', simulated: true,
  };
}

function mountWalletApi(app, db, options = {}) {
  function auth(req, res, next) {
    const secret = options.jwtSecret || process.env.JWT_SECRET;
    if (!secret || Buffer.byteLength(secret) < 32 || secret.startsWith('replace_')) {
      return res.status(503).json({error: 'Authentication is not configured.'});
    }
    try {
      const match = /^Bearer ([^ ]+)$/i.exec(req.get('Authorization') || '');
      if (!match) throw new Error();
      const claims = jwt.verify(match[1], secret, {
        algorithms: ['HS256'], issuer: options.jwtIssuer || process.env.JWT_ISSUER || 'moneymentor-local',
        audience: options.jwtAudience || process.env.JWT_AUDIENCE || 'moneymentor-api',
      });
      if (claims.role !== 'customer' || !validId(claims.sub) || !Number.isFinite(claims.exp)) throw new Error();
      req.customerId = Number(claims.sub);
      next();
    } catch {
      res.status(401).json({error: 'A valid customer bearer token is required.'});
    }
  }

  async function owner(req, res, next) {
    try {
      if (!validId(req.params.customerId)) return res.status(400).json({error: 'Invalid customer ID.'});
      if (Number(req.params.customerId) !== req.customerId) return res.status(404).json({error: 'Wallet not found.'});
      const [rows] = await db.execute('SELECT customer_id, balance_cents FROM wallets WHERE customer_id=?', [req.customerId]);
      if (!rows.length) return res.status(404).json({error: 'Wallet not found.'});
      req.wallet = rows[0];
      next();
    } catch (error) { next(error); }
  }

  app.get('/api/customers/:customerId/wallet', auth, owner, (req, res) => {
    res.set('Cache-Control', 'no-store').json({...req.wallet, currency: 'KES', simulated: true});
  });
  app.get('/api/customers/:customerId/wallet/transactions', auth, owner, async (req, res, next) => {
    try {
      const [rows] = await db.execute('SELECT * FROM wallet_transactions WHERE customer_id=? ORDER BY id DESC', [req.customerId]);
      res.set('Cache-Control', 'no-store').json(rows.map(row => ({...transactionResponse(row), created_at: row.created_at})));
    } catch (error) { next(error); }
  });

  async function mutate(req, res, next, kind) {
    const key = req.get('Idempotency-Key');
    if (!key || !/^[A-Za-z0-9_-]{1,100}$/.test(key)) return res.status(400).json({error: 'Supply an Idempotency-Key of 1-100 letters, digits, underscores or hyphens.'});
    const body = req.body || {};
    if (Array.isArray(body) || typeof body !== 'object') return res.status(400).json({error: 'Send a JSON object.'});
    if (kind === 'topup' && (Object.keys(body).length !== 1 || !Number.isSafeInteger(body.amount_cents) || body.amount_cents < 1 || body.amount_cents > MAX_CENTS)) {
      return res.status(400).json({error: 'Supply only amount_cents, an integer from 1 to 1000000000.'});
    }
    if (kind === 'payment' && (!validId(req.params.bookingId) || Object.keys(body).length)) return res.status(400).json({error: 'Use a positive booking ID and an empty body. The stored booking determines its price.'});
    const bookingId = kind === 'payment' ? Number(req.params.bookingId) : null;
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      // Every mutation locks the wallet first, serializing same-customer requests.
      const [[wallet]] = await connection.execute('SELECT balance_cents FROM wallets WHERE customer_id=? FOR UPDATE', [req.customerId]);
      if (!wallet) throw fail(404, 'Wallet not found.');
      const [[previous]] = await connection.execute('SELECT * FROM wallet_transactions WHERE customer_id=? AND idempotency_key=?', [req.customerId, key]);
      if (previous) {
        if (previous.kind !== kind || previous.booking_id !== bookingId || (kind === 'topup' && previous.amount_cents !== body.amount_cents)) throw fail(409, 'Idempotency key already used for a different request.');
        await connection.commit();
        return res.status(201).json(transactionResponse(previous));
      }
      let amount = body.amount_cents;
      let booking;
      if (kind === 'payment') {
        [[booking]] = await connection.execute('SELECT * FROM wallet_bookings WHERE id=? AND customer_id=? FOR UPDATE', [bookingId, req.customerId]);
        if (!booking) throw fail(404, 'Booking not found.');
        if (booking.status !== 'pending') throw fail(409, 'Booking is already paid or cancelled.');
        amount = booking.amount_cents;
        if (wallet.balance_cents < amount) throw fail(409, 'Insufficient wallet balance.');
      }
      const balance = wallet.balance_cents + (kind === 'topup' ? amount : -amount);
      if (balance > MAX_CENTS) throw fail(409, 'Wallet balance limit exceeded.');
      await connection.execute('UPDATE wallets SET balance_cents=? WHERE customer_id=?', [balance, req.customerId]);
      if (booking) {
        await connection.execute("UPDATE wallet_bookings SET status='paid' WHERE id=?", [bookingId]);
        await connection.execute('INSERT INTO provider_income (handyman_id,amount,income_date) VALUES (?,?,CURRENT_DATE)', [booking.handyman_id, amount / 100]);
      }
      const [result] = await connection.execute('INSERT INTO wallet_transactions (customer_id,kind,amount_cents,balance_after_cents,booking_id,idempotency_key) VALUES (?,?,?,?,?,?)', [req.customerId,kind,amount,balance,bookingId,key]);
      await connection.commit();
      res.status(201).json(transactionResponse({id:result.insertId,customer_id:req.customerId,kind,amount_cents:amount,balance_after_cents:balance,booking_id:bookingId}));
    } catch (error) {
      if (connection) await connection.rollback();
      if (error.status) return res.status(error.status).json({error:error.message});
      next(error);
    } finally {
      if (connection) connection.release();
    }
  }
  app.post('/api/customers/:customerId/wallet/topups', auth, owner, (req,res,next) => mutate(req,res,next,'topup'));
  app.post('/api/bookings/:bookingId/pay', auth, (req,res,next) => mutate(req,res,next,'payment'));
}
module.exports = {mountWalletApi};
