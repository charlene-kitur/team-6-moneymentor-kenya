require('dotenv').config({path:require('node:path').join(__dirname,'.env.demo'),override:true});
const {createWebApp}=require('./web-app');
const db=require('./db');
const api=require('./app').createApp(db).listen(0,'127.0.0.1',()=>{
 const web=createWebApp({apiUrl:'http://127.0.0.1:'+api.address().port,apiKey:process.env.MONEYMENTOR_TEST_API_KEY,webPort:3000}).listen(3000,'127.0.0.1',()=>console.log('MoneyMentor local web app: http://localhost:3000 (do not tunnel this port)'));
 function stop(){web.close(()=>api.close(()=>db.end()));}
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
});
