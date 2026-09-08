const db = require('./db');
const { createApp } = require('./app');
const port = Number(process.env.PORT || 5000);
const server = createApp(db).listen(port, '127.0.0.1', () => console.log(`MoneyMentor API: http://localhost:${port}`));
function stop() { server.close(() => db.end().then(() => process.exit(0))); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
