#!/usr/bin/env node
/* MatReflex icerik dogrulama - bagimliliksiz (jsdom gerektirmez).
   HTML'den methods ve tools nesnelerini string-duyarli ayristirip
   methods.*.pool ve tools.*.drill cevaplarini hesaplayip karsilastirir.
   Kullanim: node scripts/validate-content.js [yol/mental-math-app.html] */
const fs=require('fs'), path=require('path');
const file=process.argv[2]||path.join(__dirname,'..','mental-math-app.html');
const src=fs.readFileSync(file,'utf8');

// "var NAME={ ... }" bloğunu, string icindeki suslu parantezleri sayarak cikar
function extractObject(src,name){
  const anchor='var '+name+'=';
  const at=src.indexOf(anchor);
  if(at<0) throw new Error(name+' bildirimi bulunamadi');
  let i=src.indexOf('{',at), start=i, depth=0, inStr=false, q='', esc=false;
  for(; i<src.length; i++){
    const c=src[i];
    if(inStr){
      if(esc) esc=false;
      else if(c==='\\') esc=true;
      else if(c===q) inStr=false;
      continue;
    }
    if(c==='"'||c==="'"||c==='`'){ inStr=true; q=c; }
    else if(c==='{') depth++;
    else if(c==='}'){ if(--depth===0) return src.slice(start,i+1); }
  }
  throw new Error(name+' dengeli kapanmadi');
}
function evalObject(text){ return (new Function('return ('+text+')'))(); }

const methods=evalObject(extractObject(src,'methods'));
const tools=evalObject(extractObject(src,'tools'));

const num=s=>Number(String(s).replace(/[^0-9.\-]/g,''));
const compute=(a,op,b)=> op==='×'?a*b : op==='+'?a+b : op==='÷'?a/b : (op==='−'||op==='-')?a-b : null;
const fails=[]; let checked=0;

for(const key in methods){
  const m=methods[key]; if(!m.pool) continue;
  m.pool.forEach((it,i)=>{
    let a,b,op;
    if(m.type==='double'){ a=num(it.steps[0][0]); b=num(it.steps[0][1]); op='×'; }
    else { a=num(it.a); b=num(it.b); op=it.op||'×'; }
    const exp=compute(a,op,b); checked++;
    if(exp===null){ fails.push(`methods.${key}.pool[${i}] bilinmeyen op "${op}"`); return; }
    if(String(exp)!==String(num(it.ans))) fails.push(`methods.${key}.pool[${i}] ${a} ${op} ${b} = ${exp}, ama ans="${it.ans}"`);
  });
}
for(const key in tools){
  const t=tools[key]; if(!t.drill) continue;
  t.drill.forEach((d,i)=>{
    if(!d.fits || d.ans==null) return;
    const mt=String(d.q).match(/(\d+)\s*([×x*÷+\-−])\s*(\d+)/);
    if(!mt){ fails.push(`tools.${key}.drill[${i}] q ayristirilamadi: "${d.q}"`); return; }
    let op=mt[2]; if(op==='x'||op==='*') op='×';
    const exp=compute(+mt[1],op,+mt[3]); checked++;
    if(String(exp)!==String(num(d.ans))) fails.push(`tools.${key}.drill[${i}] ${d.q} = ${exp}, ama ans="${d.ans}"`);
  });
}

console.log(`Kontrol edilen hesaplanabilir cevap: ${checked}`);
if(fails.length){ console.log(`\n✗ ${fails.length} HATA:`); fails.forEach(f=>console.log('  - '+f)); process.exit(1); }
console.log('✓ Tum cevaplar dogru.');
process.exit(0);
