const { setTimeout: pause } = require('node:timers/promises');

async function runTraffic(base, key, count = 60) {
  if (!key || !Number.isSafeInteger(count) || count < 1) {
    throw new Error('Set KEY to your issued key and N to a positive integer.');
  }
  const mix = [
    ['/api/expenses', true], ['/api/expenses', true], ['/api/budgets', true],
    ['/api/savings-goals', true], ['/api/not-a-route', true], ['/api/expenses', false],
  ];
  const counts = {};
  for (let i = 0; i < count; i++) {
    const [path, authenticated] = mix[Math.floor(Math.random() * mix.length)];
    let status;
    try {
      const response = await fetch(new URL(path, base), {
        headers: authenticated ? { 'X-API-Key': key } : {},
        redirect: 'error',
        signal: AbortSignal.timeout(10000),
      });
      await response.arrayBuffer();
      status = response.status;
    } catch {
      status = 'failed';
    }
    counts[status] = (counts[status] || 0) + 1;
    await pause(50);
  }
  return counts;
}

if (require.main === module) {
  runTraffic(process.env.API || 'http://127.0.0.1:5001', process.env.KEY, Number(process.env.N || 60))
    .then(counts => console.log('Status codes received:', counts))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { runTraffic };
