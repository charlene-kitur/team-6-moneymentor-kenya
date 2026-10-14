const fs=require('node:fs');
const path=require('node:path');
const env=path.join(__dirname,'.env.demo');
if(!fs.existsSync(env))throw new Error('Run npm run demo:setup first.');
require('dotenv').config({path:env,override:true});
process.argv.splice(2,0,'token');
require('./provider-admin');
