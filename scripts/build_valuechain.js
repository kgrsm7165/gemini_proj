// data/semiconductor/*.json(원본 덤프) -> data/valuechain/semiconductor.json(에이전트용 정규화 맵)
const fs=require('fs');const d=n=>JSON.parse(fs.readFileSync(`data/semiconductor/${n}.json`,'utf8'));
const processes=d('processes'),devs=d('devs'),apps=d('apps'),companies=d('companies');
const rels=d('relationshipRecords'),prods=d('productDetails');
const nodes=[
 ...apps.map(a=>({id:'app:'+a[0],type:'application',name:a[1],note:a[3]})),
 ...devs.map(x=>({id:'dev:'+x[0],type:'device',name:x[1],examples:x[2],note:x[4]})),
 ...processes.map(p=>({id:'proc:'+p[0],type:'process',name:p[1],tagline:p[2],note:p[3]})),
];
const edges=[
 ...apps.flatMap(a=>a[2].map(x=>({from:'dev:'+x,to:'app:'+a[0],kind:'device_used_in_application'}))),
 ...devs.flatMap(x=>x[3].map(p=>({from:'proc:'+p,to:'dev:'+x[0],kind:'process_used_for_device'}))),
];
const co=companies.map(c=>({name:c[0],role:c[1],country:c[2],focus:c[3],processes:c[4],source:c[5],note:c[6],
  products:prods.filter(p=>p[0]===c[0]).map(p=>({process:p[1],name:p[2],desc:p[3],caveat:p[4],source:p[5]}))}));
const rr=rels.map(r=>({a:r[0],b:r[1],type:r[2],channel:r[3],period:r[4],basis:r[5],caveat:r[6],source:r[7]}));
fs.mkdirSync('data/valuechain',{recursive:true});
fs.writeFileSync('data/valuechain/semiconductor.json',JSON.stringify({sector:'semiconductor_front_end',nodes,edges,companies:co,relationships:rr},null,1));
console.log({nodes:nodes.length,edges:edges.length,companies:co.length,relationships:rr.length});
