// 아틀라스를 헤드리스 브라우저로 실행해 최종 전역 데이터를 JSON으로 덤프. 사용: node scripts/dump_atlas.js <html> <outdir>
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{
  const [,,html,out]=process.argv;
  const b=await chromium.launch();const p=await b.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+path.resolve(html));await p.waitForTimeout(1500);
  const data=await p.evaluate(()=>{
    // 최상위 const는 window 속성이 아니므로 이름으로 직접 접근
    const names=['processes','devs','apps','companies','supplyRelations','relationshipRecords','productDetails','materialsComparison','guides','entries','rel','lithographyData','asmlNetwork','learningData','externalStudyFirms','wetEtchSources','wetCompanyUpdates','wetProducts','wetEquipmentSources','wetEquipmentRecords','dryEtchSources','dryEtchNewCompanies','sources'];
    const o={};for(const n of names){try{o[n]=eval(n)}catch(e){}}
    return JSON.parse(JSON.stringify(o));
  });
  fs.mkdirSync(out,{recursive:true});
  for(const [k,v] of Object.entries(data))fs.writeFileSync(`${out}/${k}.json`,JSON.stringify(v,null,1));
  console.log(Object.entries(data).map(([k,v])=>`${k}:${Array.isArray(v)?v.length:Object.keys(v).length}`).join('  '));
  console.log('errors',errs);await b.close();
})();
