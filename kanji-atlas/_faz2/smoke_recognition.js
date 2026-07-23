/* Tanıma merdiveni — yerel Playwright smoke (non-shipping). Yol matrisi + migration + öneri şeridi. */
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const srv = spawn("python3", ["-m","http.server","8901","--bind","127.0.0.1"], { cwd:"/home/claude/apps-deploy/kanji-atlas", stdio:"ignore" });
const URL = "http://127.0.0.1:8901/index.html";
(async () => {
  await new Promise(r=>setTimeout(r,900));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport:{width:390,height:780} });
  let pass=0, fail=0; const fails=[];
  const ok=(c,m)=>{ if(c)pass++; else { fail++; fails.push(m); } };
  const pe=[]; p.on("pageerror",e=>pe.push(e.message));
  const ce=[]; p.on("console",m=>{ if(m.type()==="error") ce.push(m.text()); });
  const ev=(fn,a)=>p.evaluate(fn,a);
  const clk=async s=>{ await p.click(s,{timeout:6000}); await p.waitForTimeout(90); };
  const S=()=>ev(()=>({screen:JYA.state.screen,param:JYA.state.param,sk:JYA.state.onboarding.startKey,st:JYA.state.onboarding.status,stage:JYA.state.onboarding.stage,rec:document.querySelectorAll(".rec-hint").length}));
  async function fresh(){ await p.goto(URL,{waitUntil:"domcontentloaded"}); await ev(()=>localStorage.clear()); await p.reload({waitUntil:"domcontentloaded"}); await p.waitForTimeout(250); }

  await p.goto(URL,{waitUntil:"domcontentloaded"}); await p.waitForTimeout(300);
  ok(await ev(()=>typeof window.JYA==="object"), "JYA export parse ok");
  ok(await ev(()=>typeof window.__ob==="object"), "__ob export parse ok");
  ok(pe.length===0, "load pageerror YOK"+(pe.length?": "+pe.join("|"):""));

  // ---- migration matrisi (§5) ----
  const mig = await ev(()=>{ const N=window.__ob.normalizeOnboarding; return {
    fresh:N(null),
    oldComp:N({completed:true,stage:"final",competency:2,startKey:"kanji-ki",userHints:{ki:"x"}}),
    oldInProgC:N({status:"in-progress",stage:"competency",competency:1}),
    oldInProgW:N({status:"in-progress",stage:"writing-intro",competency:0}),
    newCompValid:N({status:"completed",stage:"kanji-q",startKey:"atlas-map"}),
    newCompInvalid:N({status:"completed",stage:"kana-q",startKey:"zzz-old"}),
    skipped:N({status:"skipped",stage:"kana-q",startKey:"atlas-map"}),
    inProgKanji:N({status:"in-progress",stage:"kanji-q"})
  }; });
  ok(mig.fresh.status==="in-progress"&&mig.fresh.stage==="welcome","mig fresh→welcome/in-progress");
  ok(mig.oldComp.status==="completed"&&mig.oldComp.startKey===null&&mig.oldComp.userHints&&mig.oldComp.userHints.ki==="x","mig eski-completed→completed+startKey null+userHints korunur");
  ok(mig.oldInProgC.stage==="welcome"&&mig.oldInProgC.status==="in-progress","mig eski in-progress competency→welcome RESET");
  ok(mig.oldInProgW.stage==="welcome","mig eski in-progress writing-intro→welcome RESET");
  ok(mig.newCompValid.startKey==="atlas-map","mig yeni completed geçerli startKey korunur");
  ok(mig.newCompInvalid.startKey===null,"mig yeni completed geçersiz startKey→null (sahte yok)");
  ok(mig.skipped.status==="skipped"&&mig.skipped.startKey===null,"mig skipped→startKey null");
  ok(mig.inProgKanji.stage==="kanji-q","mig in-progress kanji-q korunur");

  // ---- yol matrisi (§2b) — gerçek tıklama ----
  await fresh();
  { const s0=await S(); ok(s0.screen==="onboarding"&&s0.stage==="welcome","fresh→onboarding welcome"); }
  await clk('[data-act="ob-continue"]');
  ok((await S()).stage==="kana-q","welcome→kana-q");
  await clk('[data-act="ob-no"]');
  { const s=await S(); ok(s.screen==="writing-system"&&s.sk==="yazi-mantigi"&&s.st==="completed","あ Hayır → writing-system / yazi-mantigi / completed"); }

  await fresh(); await clk('[data-act="ob-continue"]'); await clk('[data-act="ob-yes"]');
  ok((await S()).stage==="kanji-q","kana-q Evet→kanji-q");
  await clk('[data-act="ob-no"]');
  { const s=await S(); ok(s.screen==="detail"&&s.param==="ki"&&s.sk==="kanji-ki"&&s.st==="completed","木 Hayır → detail/ki / kanji-ki / completed"); }

  await fresh(); await clk('[data-act="ob-continue"]'); await clk('[data-act="ob-yes"]'); await clk('[data-act="ob-yes"]');
  { const s=await S(); ok(s.screen==="map"&&s.sk==="atlas-map"&&s.st==="completed","木 Evet → map / atlas-map / completed"); }

  await fresh(); await clk('[data-act="ob-continue"]'); await clk('[data-act="ob-home"]');
  { const s=await S(); ok(s.screen==="home"&&s.st==="skipped"&&!s.sk,"Ana sayfaya git → home / skipped / startKey yok"); }

  // back
  await fresh(); await clk('[data-act="ob-continue"]'); await clk('[data-act="ob-yes"]'); await clk('[data-act="ob-back"]');
  ok((await S()).stage==="kana-q","kanji-q back→kana-q");
  await clk('[data-act="ob-back"]');
  ok((await S()).stage==="welcome","kana-q back→welcome");

  // öneri şeridi — completed sonrası reload → home + şerit görünür
  await fresh(); await clk('[data-act="ob-continue"]'); await clk('[data-act="ob-no"]');
  await p.reload({waitUntil:"domcontentloaded"}); await p.waitForTimeout(250);
  { const s=await S(); ok(s.screen==="home","completed reload→home"); ok(s.rec===1,"Home öneri şeridi görünür (completed+startKey)"); }

  const appCe=ce.filter(t=>!/Failed to load resource|ERR_|gstatic|googleapis|font/i.test(t));
  ok(appCe.length===0,"app console error YOK"+(appCe.length?": "+appCe.slice(0,3).join("|"):""));

  console.log("SMOKE recognition · pass="+pass+"  fail="+fail);
  if(fail) console.log("FAILURES:\n - "+fails.join("\n - "));
  await b.close(); srv.kill(); process.exit(fail?1:0);
})().catch(e=>{ console.error("HARNESS ERR", e.message); srv.kill(); process.exit(2); });
