// 아틀라스 HTML에 내장된 JS 상수를 JSON으로 추출한다. 사용: node scripts/extract_atlas.js <html> <outdir>
const fs=require('fs'),vm=require('vm');
const [,, html, out]=process.argv;
const lines=fs.readFileSync(html,'utf8').split('\n');
const names=['processes','devs','apps','companies','supplyRelations','relationshipRecords','productDetails'];
const ctx={};vm.createContext(ctx);
for(const n of names){
  const i=lines.findIndex(l=>l.startsWith(`const ${n}=`));
  if(i<0){console.error('missing',n);continue}
  let src=lines[i],j=i;
  while(!/;\s*$/.test(src)&&j<lines.length-1){src+='\n'+lines[++j]}
  try{vm.runInContext(src.replace(/^const /,'var '),ctx)}catch(e){console.error('fail',n,e.message)}
}
fs.mkdirSync(out,{recursive:true});
for(const n of names)if(ctx[n]){fs.writeFileSync(`${out}/${n}.json`,JSON.stringify(ctx[n],null,1));console.log(n,ctx[n].length)}
