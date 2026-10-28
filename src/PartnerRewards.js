import React, { useState } from 'react';
export default function PartnerRewards() {
 const [data,setData]=useState(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 async function load(){
  setLoading(true);setError('');setData(null);
  try{
   const base=(process.env.REACT_APP_API_URL||'').replace(/\/$/,'');
   const r=await fetch(`${base}/api/partner/rewards`);
   if(!r.ok)throw new Error('Partner unavailable');
   const body=await r.json();
   if(!Array.isArray(body.claims))throw new Error('Invalid response');
   setData(body);
  }catch{setError('Partner data is unavailable right now. Please try again later.');}
  finally{setLoading(false);}
 }
 return <section aria-labelledby="partner-rewards-heading" style={{padding:'24px',maxWidth:'1000px',margin:'24px auto'}}>
  <h2 id="partner-rewards-heading">Claimed-item rewards</h2>
  <p>View reward values reported by Prestige. These are not confirmed wallet payments.</p>
  <button type="button" onClick={load} disabled={loading}>{loading?'Loading rewards…':'Load rewards'}</button>
  {error&&<p role="alert">{error}</p>}
  {data&&<><p>{data.source}</p>{data.claims.length===0?<p>No claimed-item rewards found.</p>:<table>
   <thead><tr><th>Claim</th><th>Student</th><th>Item</th><th>Reward (cents)</th><th>Reward (whole units)</th></tr></thead>
   <tbody>{data.claims.map(r=><tr key={r.claimId}><td>{r.claimId}</td><td>{r.studentId}</td><td>{r.itemId}</td><td>{r.rewardAmountCents}</td><td>{(r.rewardAmountCents/100).toFixed(2)}</td></tr>)}</tbody>
  </table>}</>}
 </section>;
}
