// Author self-check, not an external team's blind test. Requires start:demo.
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const env=require('dotenv').parse(fs.readFileSync(path.join(__dirname,'.env.demo')));
const base=`http://127.0.0.1:${env.PORT}/api`;
const token=execFileSync(process.execPath,[path.join(__dirname,'demo-token.js'),'1'],{encoding:'utf8'}).trim();
const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
async function call(method,url,body,status,authenticated=true){
  const response=await fetch(base+url,{method,headers:authenticated?headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await response.text();
  assert.equal(response.status,status,`${method} ${url}: ${text}`);
  return text?JSON.parse(text):null;
}
async function main(){
  let id;
  try {
    const before=await call('GET','/handymen/1/income-summaries?month=2026-09',undefined,200);
    assert.equal(before.total_income,5000);
    assert.equal(before.net_income,5000-before.total_expenses);
    const payload={description:'Replacement tools',category:'Equipment',amount:2500,expense_date:'2026-09-29'};
    const created=await call('POST','/handymen/1/expenses',payload,201);id=created.id;
    assert.deepEqual(created,{id,handyman_id:1,...payload});
    const updated=await call('PATCH',`/expenses/${id}`,{amount:3000},200);
    assert.deepEqual(updated,{...created,amount:3000});
    const summary=await call('GET','/handymen/1/income-summaries?month=2026-09',undefined,200);
    assert.equal(summary.total_expenses,before.total_expenses+3000);
    const savings=await call('GET','/handymen/1/savings-goals',undefined,200);
    assert.deepEqual(savings,[{id:1,handyman_id:1,goal_amount:1000,current_amount:450,progress_percentage:45}]);
    const investments=await call('GET','/handymen/1/investment-projections',undefined,200);
    assert.deepEqual(investments,[{handyman_id:1,initial_amount:1000,monthly_contribution:100,annual_rate:12,years:1,projected_value:2395.08}]);
    assert.equal(await call('DELETE',`/expenses/${id}`,undefined,204),null);
    assert.deepEqual(await call('DELETE',`/expenses/${id}`,undefined,404),{error:'Expense not found.'});id=undefined;
    assert.deepEqual(await call('GET','/handymen/1/income-summaries?month=Sept2026',undefined,400),{error:'month must use YYYY-MM format.'});
    assert.deepEqual(await call('GET','/handymen/1/savings-goals',undefined,401,false),{error:'A valid bearer token is required.'});
    console.log('PASS: all six endpoint examples, actual status/body checks, 400/401/404 errors, and readback. Demo expense cleaned up.');
  } finally {if(id)await call('DELETE',`/expenses/${id}`,undefined,204);}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
