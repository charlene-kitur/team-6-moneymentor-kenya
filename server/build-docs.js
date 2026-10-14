const fs=require('node:fs');
const path=require('node:path');
const yaml=require('js-yaml');
const root=path.join(__dirname,'..');
const spec=yaml.load(fs.readFileSync(path.join(root,'openapi.yaml'),'utf8'));
const dist=path.dirname(require.resolve('swagger-ui-dist/package.json'));
const css=fs.readFileSync(path.join(dist,'swagger-ui.css'),'utf8');
const js=fs.readFileSync(path.join(dist,'swagger-ui-bundle.js'),'utf8').replace(/<\/script/gi,'<\\/script');
const embedded=JSON.stringify(spec).replace(/</g,'\\u003c');
fs.mkdirSync(path.join(root,'docs'),{recursive:true});
fs.writeFileSync(path.join(root,'docs','index.html'),`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MoneyMentor Kenya API Reference</title><style>${css}
body{margin:0;background:#fafafa}.intro{font-family:system-ui,sans-serif;max-width:1360px;margin:24px auto;padding:0 20px;color:#19332d}.intro h1{margin-bottom:8px}.intro a{color:#14674c}</style></head>
<body><header class="intro"><h1>MoneyMentor Kenya API</h1><p>Offline API reference · six provider operations · bearer authentication</p><p>This read-only page opens without a server or internet connection. For live requests, follow <a href="../README.md">README.md</a> and use its PowerShell or curl commands. Try it out is disabled to avoid file-origin browser restrictions.</p></header><div id="swagger-ui"></div>
<script>${js}</script><script>window.ui=SwaggerUIBundle({spec:${embedded},dom_id:'#swagger-ui',deepLinking:true,docExpansion:'list',defaultModelsExpandDepth:1,validatorUrl:null,persistAuthorization:false,supportedSubmitMethods:[]});</script></body></html>`);
fs.copyFileSync(path.join(dist,'LICENSE'),path.join(root,'docs','SWAGGER_UI_LICENSE.txt'));
console.log('Built docs/index.html with inline Swagger UI, CSS and OpenAPI; no external assets required.');
