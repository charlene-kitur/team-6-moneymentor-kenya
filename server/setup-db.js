require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
async function setup() {
  const database = process.env.DB_NAME || 'moneymentor_kenya';
  if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error('Invalid database name');
  const connection = await mysql.createConnection({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD });
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.query(`USE \`${database}\``);
    for (const statement of fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8').split(';').filter(sql => sql.trim())) await connection.query(statement);
    const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM expenses');
    if (!count) await connection.execute('INSERT INTO expenses (description, category, amount, expense_date) VALUES (?, ?, ?, CURRENT_DATE), (?, ?, ?, CURRENT_DATE), (?, ?, ?, CURRENT_DATE)', ['Sample: monthly rent', 'Housing', 15000, 'Sample: groceries', 'Food', 3500, 'Sample: bus fare', 'Transport', 1200]);
    console.log('MoneyMentor database is ready. Sample expenses are labelled Sample.');
  } finally { await connection.end(); }
}
setup().catch(error => { console.error('Database setup failed:', error.message); process.exitCode = 1; });
