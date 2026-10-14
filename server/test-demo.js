const path=require('node:path');
const fs=require('node:fs');
const env=path.join(__dirname,'.env.demo');
if(!fs.existsSync(env))throw new Error('Run npm run demo:setup first.');
require('dotenv').config({path:env,override:true});
process.chdir(__dirname);
require('jest').run(['--runInBand']);
