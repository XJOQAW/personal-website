const http=require('http'),fs=require('fs'),PORT=3000,DATA='/var/www/api/data.json';
function load(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'))}catch(e){return{r:[],p:[]}}}
function save(d){fs.writeFileSync(DATA,JSON.stringify(d))}
function ok(res,data){res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data))}
http.createServer(function(req,res){
if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,DELETE','Access-Control-Allow-Headers':'Content-Type'});return res.end()}
var u=new URL(req.url,'http://x'),b='',db=load();
if(req.method==='GET'&&u.pathname==='/api/reviews')return ok(res,db.r);
if(req.method==='POST'&&u.pathname==='/api/reviews'){req.on('data',function(c){b+=c});req.on('end',function(){var v=JSON.parse(b);v.id=Date.now();db.r.push(v);save(db);ok(res,v)});return}
if(req.method==='DELETE'&&u.pathname.startsWith('/api/reviews/')){var id=parseInt(u.pathname.split('/')[3]);db.r=db.r.filter(function(x){return x.id!=id});db.p=db.p.filter(function(x){return x.reviewId!=id});save(db);ok(res,{ok:1});return}
if(req.method==='GET'&&u.pathname.startsWith('/api/reviews/')&&u.pathname.endsWith('/replies')){return ok(res,db.p.filter(function(x){return x.reviewId===parseInt(u.pathname.split('/')[3])}))}
if(req.method==='POST'&&u.pathname.startsWith('/api/reviews/')&&u.pathname.endsWith('/replies')){req.on('data',function(c){b+=c});req.on('end',function(){var v=JSON.parse(b);v.id=Date.now();v.reviewId=parseInt(u.pathname.split('/')[3]);db.p.push(v);save(db);ok(res,v)});return}
if(req.method==='DELETE'&&u.pathname.startsWith('/api/replies/')){var rid=parseInt(u.pathname.split('/')[3]);db.p=db.p.filter(function(x){return x.id!=rid});save(db);ok(res,{ok:1});return}
res.writeHead(404);res.end()
}).listen(PORT,function(){console.log('OK port '+PORT)});
