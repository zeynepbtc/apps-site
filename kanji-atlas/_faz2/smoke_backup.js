const { chromium } = require("playwright");
const { spawn } = require("child_process");
const fs = require("fs");
const srv = spawn("python3",["-m","http.server","8921","--bind","127.0.0.1"],{cwd:"/home/claude/apps-deploy/kanji-atlas",stdio:"ignore"});
const URL="http://127.0.0.1:8921/index.html";
(async()=>{
  await new Promise(r=>setTimeout(r,900));
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,acceptDownloads:true});
  const p=await ctx.newPage();
  const pe=[]; p.on("pageerror",e=>pe.push(e.message));
  let pass=0,fail=0; const F=[]; const ok=(c,m)=>{ if(c)pass++; else{fail++;F.push(m);} };
  await p.goto(URL,{waitUntil:"domcontentloaded"});
  await p.evaluate(()=>localStorage.clear());
  await p.reload({waitUntil:"domcontentloaded"}); await p.waitForTimeout(300);
  await p.click('[data-act="ob-continue"]',{timeout:6000}); await p.waitForTimeout(100);
  await p.click('[data-act="ob-home"]',{timeout:6000}); await p.waitForTimeout(200);
  // create progress
  await p.evaluate(()=>{ window.JYA.state.learned['ki']=true; window.JYA.state.kana['あ']=true; window.JYA.save(); });
  // go profile
  await p.evaluate(()=>window.JYA.go('profile',null,true)); await p.waitForTimeout(300);
  ok(await p.$('[data-act="export-progress"]')!==null,"Profil'de dışa aktar butonu var");
  ok(await p.$('[data-act="import-progress"]')!==null,"Profil'de geri yükle butonu var");
  // export → capture download
  const [dl]=await Promise.all([ p.waitForEvent('download'), p.click('[data-act="export-progress"]') ]);
  const fn=dl.suggestedFilename();
  const path=await dl.path(); const content=fs.readFileSync(path,'utf8');
  ok(/^japonca-yazi-atlasi-yedek-\d{4}-\d{2}-\d{2}\.json$/.test(fn),"dosya adı doğru: "+fn);
  let j=null; try{ j=JSON.parse(content); }catch(e){}
  ok(j&&j._exportApp==="japonca-yazi-atlasi","export _exportApp damgası var");
  ok(j&&j.schemaVersion===2,"export schemaVersion=2");
  ok(j&&j.learned&&j.learned.ki===true,"export learned.ki içeriyor");
  ok(j&&j.kana&&j.kana['あ']===true,"export kana.あ içeriyor");
  ok(j&&!('_game' in j)&&!('_navSel' in j),"export transient alanları temizlemiş");
  // wipe current progress
  await p.evaluate(()=>{ window.JYA.state.learned={}; window.JYA.state.kana={}; window.JYA.save(); });
  const wiped=await p.evaluate(()=>Object.keys(window.JYA.state.learned).length+Object.keys(window.JYA.state.kana).length);
  ok(wiped===0,"ilerleme silindi (import öncesi)");
  // import the captured JSON
  await p.evaluate((txt)=>window.handleImportFile(txt), content); await p.waitForTimeout(300);
  const sc=await p.evaluate(()=>({screen:window.JYA.state.screen, meta:window.JYA.state._importMeta}));
  ok(sc.screen==="import-confirm","içe aktarma onay ekranına gidildi");
  ok(sc.meta&&sc.meta.kanji===1&&sc.meta.kana===1,"onay ekranı sayıları doğru (1 kanji,1 kana)");
  // apply
  await p.click('[data-act="import-apply"]'); await p.waitForTimeout(300);
  const after=await p.evaluate(()=>({screen:window.JYA.state.screen, ki:window.JYA.state.learned.ki, a:window.JYA.state.kana['あ'], pend:window.JYA.state._pendingImport}));
  ok(after.screen==="home","apply sonrası home");
  ok(after.ki===true&&after.a===true,"ilerleme geri yüklendi (ki + あ)");
  ok(!after.pend,"_pendingImport temizlendi");
  // persisted?
  const persisted=await p.evaluate(()=>{ const raw=localStorage.getItem('kana_state'); const o=JSON.parse(raw); return o.learned&&o.learned.ki===true; });
  ok(persisted,"geri yükleme localStorage'a yazıldı");
  // bad file rejection
  await p.evaluate(()=>window.handleImportFile('{"foo":1,"_exportApp":"baska-uygulama"}')); await p.waitForTimeout(150);
  ok(await p.evaluate(()=>window.JYA.state.screen)==="home","yabancı dosya reddedildi (ekran değişmedi)");
  ok(pe.length===0,"pageerror YOK"+(pe.length?": "+pe.join("|"):""));
  console.log("BACKUP TEST · pass="+pass+" fail="+fail);
  if(fail) console.log("FAIL:\n - "+F.join("\n - "));
  await b.close(); srv.kill(); process.exit(fail?1:0);
})().catch(e=>{console.error("ERR",e.message);srv.kill();process.exit(2);});
