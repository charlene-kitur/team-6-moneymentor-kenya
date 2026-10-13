const jwt = require('jsonwebtoken');
const fields = ['description', 'category', 'amount', 'expense_date'];
const validId = value => /^[1-9]\d*$/.test(String(value)) && Number(value) <= 2147483647;
const money = value => typeof value === 'number' && Number.isFinite(value) && value >= 0.01 && value <= 9999999999.99 && Math.abs(value * 100 - Math.round(value * 100)) < 0.0001;
function validInput(body, partial = false) {
  if (!body || Array.isArray(body) || typeof body !== 'object') return false;
  const keys = Object.keys(body);
  if (!keys.length || keys.some(k => !fields.includes(k)) || (!partial && fields.some(k => !(k in body)))) return false;
  if ('description' in body && (typeof body.description !== 'string' || !body.description.trim() || body.description.length > 200)) return false;
  if ('category' in body && (typeof body.category !== 'string' || !body.category.trim() || body.category.length > 40)) return false;
  if ('amount' in body && !money(body.amount)) return false;
  if ('expense_date' in body) {
    const d = body.expense_date;
    if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d) || d < '1000-01-01') return false;
    const parsed = new Date(d);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0,10) !== d) return false;
  }
  return true;
}
function mountProviderApi(app, db, options = {}) {
  const secret = options.jwtSecret || process.env.JWT_SECRET;
  const issuer = options.jwtIssuer || process.env.JWT_ISSUER || 'moneymentor-local';
  const audience = options.jwtAudience || process.env.JWT_AUDIENCE || 'moneymentor-api';
  function auth(req, res, next) {
    if (!secret || Buffer.byteLength(secret) < 32 || secret.startsWith('replace_')) return res.status(503).json({error:'Authentication is not configured.'});
    const match = /^Bearer ([^ ]+)$/i.exec(req.get('authorization') || '');
    try {
      if (!match) throw new Error('Missing token');
      const claims = jwt.verify(match[1], secret, {algorithms:['HS256'], issuer, audience});
      if (typeof claims.sub !== 'string' || !validId(claims.sub) || !Number.isFinite(claims.exp)) throw new Error('Invalid claims');
      req.handymanId = Number(claims.sub);
      next();
    } catch { res.status(401).json({error:'A valid bearer token is required.'}); }
  }
  async function owner(req, res, next) {
    try {
      if (!validId(req.params.handymanId)) return res.status(400).json({error:'Invalid handyman ID.'});
      const id = Number(req.params.handymanId);
      if (id !== req.handymanId) return res.status(404).json({error:'Handyman not found.'});
      const [rows] = await db.execute('SELECT id FROM handymen WHERE id = ?', [id]);
      if (!rows.length) return res.status(404).json({error:'Handyman not found.'});
      next();
    } catch (error) { next(error); }
  }
  app.get('/api/handymen/:handymanId/income-summaries', auth, owner, async (req,res,next) => {
    const month = req.query.month;
    if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month < '1000-01') return res.status(400).json({error:'month must use YYYY-MM format.'});
    try {
      const [[row]] = await db.execute(`SELECT
        (SELECT COALESCE(SUM(amount),0) FROM provider_income WHERE handyman_id=? AND DATE_FORMAT(income_date,'%Y-%m')=?) AS total_income,
        (SELECT COALESCE(SUM(amount),0) FROM provider_expenses WHERE handyman_id=? AND DATE_FORMAT(expense_date,'%Y-%m')=?) AS total_expenses`,
      [req.handymanId,month,req.handymanId,month]);
      const total_income = Number(row.total_income), total_expenses = Number(row.total_expenses);
      res.json({handyman_id:req.handymanId,month,total_income,total_expenses,net_income:Number((total_income-total_expenses).toFixed(2))});
    } catch(error) { next(error); }
  });
  app.post('/api/handymen/:handymanId/expenses', auth, owner, async (req,res,next) => {
    if (!validInput(req.body)) return res.status(400).json({error:'Supply valid description, category, amount and expense_date.'});
    try {
      const body = {...req.body,description:req.body.description.trim(),category:req.body.category.trim()};
      const [result] = await db.execute('INSERT INTO provider_expenses (handyman_id,description,category,amount,expense_date) VALUES (?,?,?,?,?)', [req.handymanId,...fields.map(k=>body[k])]);
      res.status(201).json({id:result.insertId,handyman_id:req.handymanId,...body});
    } catch(error) { next(error); }
  });
  app.patch('/api/expenses/:expenseId', auth, async (req,res,next) => {
    if (!validId(req.params.expenseId) || !validInput(req.body,true)) return res.status(400).json({error:'Supply a valid expense ID and at least one valid expense field.'});
    try {
      const params = [req.params.expenseId,req.handymanId];
      const [existing] = await db.execute('SELECT id FROM provider_expenses WHERE id=? AND handyman_id=?',params);
      if (!existing.length) return res.status(404).json({error:'Expense not found.'});
      const keys = Object.keys(req.body);
      const values = keys.map(k => typeof req.body[k] === 'string' ? req.body[k].trim() : req.body[k]);
      await db.execute(`UPDATE provider_expenses SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=? AND handyman_id=?`, [...values,...params]);
      const [rows] = await db.execute('SELECT id,handyman_id,description,category,amount,expense_date FROM provider_expenses WHERE id=? AND handyman_id=?',params);
      if (!rows.length) return res.status(404).json({error:'Expense not found.'});
      res.json(rows[0]);
    } catch(error) { next(error); }
  });
  app.delete('/api/expenses/:expenseId', auth, async (req,res,next) => {
    if (!validId(req.params.expenseId)) return res.status(400).json({error:'Invalid expense ID.'});
    try {
      const [result] = await db.execute('DELETE FROM provider_expenses WHERE id=? AND handyman_id=?',[req.params.expenseId,req.handymanId]);
      if (!result.affectedRows) return res.status(404).json({error:'Expense not found.'});
      res.status(204).send();
    } catch(error) { next(error); }
  });
  app.get('/api/handymen/:handymanId/savings-goals', auth, owner, async (req,res,next) => {
    try {
      const [rows] = await db.execute('SELECT id,handyman_id,goal_amount,current_amount FROM provider_savings_goals WHERE handyman_id=? ORDER BY id',[req.handymanId]);
      res.json(rows.map(row=>({...row,progress_percentage:Number((row.current_amount/row.goal_amount*100).toFixed(2))})));
    } catch(error) { next(error); }
  });
  app.get('/api/handymen/:handymanId/investment-projections', auth, owner, async (req,res,next) => {
    try {
      const [rows] = await db.execute('SELECT handyman_id,initial_amount,monthly_contribution,annual_rate,years FROM provider_investments WHERE handyman_id=? ORDER BY id',[req.handymanId]);
      res.json(rows.map(row=>{
        const r=row.annual_rate/1200,n=row.years*12;
        const value=r===0 ? row.initial_amount+row.monthly_contribution*n : row.initial_amount*(1+r)**n+row.monthly_contribution*((1+r)**n-1)/r;
        return {...row,projected_value:Number(value.toFixed(2))};
      }));
    } catch(error) { next(error); }
  });
}
module.exports = {mountProviderApi};
